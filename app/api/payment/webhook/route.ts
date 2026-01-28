import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// 验证 Creem Webhook 签名
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('creem-signature') || ''

    // 验证 Webhook 签名
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET
    if (webhookSecret && !verifyWebhookSignature(body, signature, webhookSecret)) {
      return NextResponse.json(
        { error: '无效的签名' },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)

    // 处理支付完成事件
    // Creem 可能使用不同的事件类型，检查多种可能
    if (event.type === 'checkout.completed' || event.type === 'payment.completed' || event.type === 'order.completed') {
      // 尝试多种可能的字段名
      const sessionId = event.data?.session_id || event.data?.checkout_id || event.data?.checkoutId
      const orderId = event.data?.order_id || event.data?.orderId
      const customerId = event.data?.customer_id || event.data?.customerId
      const customerEmail = event.data?.customer?.email || event.data?.email

      console.log('Webhook 事件:', {
        type: event.type,
        sessionId,
        orderId,
        customerId,
        customerEmail,
        data: event.data
      })

      // 查找订单（通过 sessionId 或 orderId）
      let order = null
      if (sessionId) {
        order = await prisma.order.findFirst({
          where: {
            creemSessionId: sessionId,
          },
          include: {
            user: true,
          },
        })
      }
      
      // 如果通过 sessionId 找不到，尝试通过 orderId
      if (!order && orderId) {
        order = await prisma.order.findFirst({
          where: {
            creemOrderId: orderId,
          },
          include: {
            user: true,
          },
        })
      }

      // 如果还是找不到，尝试通过用户邮箱查找最近的 pending 订单
      if (!order && customerEmail) {
        const user = await prisma.user.findUnique({
          where: { email: customerEmail },
        })
        
        if (user) {
          order = await prisma.order.findFirst({
            where: {
              userId: user.id,
              status: 'pending',
            },
            include: {
              user: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          })
        }
      }

      if (order && order.status === 'pending') {
        // 更新订单状态
        await prisma.order.update({
          where: { id: order.id },
          data: {
            creemOrderId: orderId || undefined,
            status: 'completed',
            amount: event.data?.amount || event.data?.total || 0,
            currency: event.data?.currency || 'USD',
          },
        })

        // 更新用户会员状态
        const planType = order.planType
        const expiresAt = new Date()
        
        if (planType === 'monthly') {
          expiresAt.setMonth(expiresAt.getMonth() + 1)
        } else if (planType === 'yearly') {
          expiresAt.setFullYear(expiresAt.getFullYear() + 1)
        }

        await prisma.user.update({
          where: { id: order.userId },
          data: {
            isPremium: true,
            premiumExpiresAt: expiresAt,
            creemCustomerId: customerId || undefined,
          },
        })

        console.log('会员已激活:', {
          userId: order.userId,
          expiresAt: expiresAt.toISOString(),
        })
      } else {
        console.warn('未找到对应的订单:', { sessionId, orderId, customerEmail })
      }
    }

    // 处理退款事件
    if (event.type === 'refund.created') {
      const orderId = event.data.order_id

      const order = await prisma.order.findFirst({
        where: {
          creemOrderId: orderId,
        },
      })

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'refunded',
          },
        })

        // 取消用户会员
        await prisma.user.update({
          where: { id: order.userId },
          data: {
            isPremium: false,
            premiumExpiresAt: null,
          },
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook 处理错误:', error)
    return NextResponse.json(
      { error: 'Webhook 处理失败' },
      { status: 500 }
    )
  }
}
