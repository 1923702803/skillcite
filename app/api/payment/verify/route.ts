import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCheckoutSession } from '@/lib/creem'

// 支付成功页主动验证支付结果并激活会员
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: '缺少 session_id 参数' },
        { status: 400 }
      )
    }

    // 从 Creem 获取支付会话详情
    const checkout = await getCheckoutSession(sessionId)

    // 记录返回数据，方便在 Vercel 日志中排查问题
    console.log('Verify checkout session:', checkout)

    const status =
      checkout.status ||
      checkout.payment_status ||
      checkout.paymentStatus ||
      checkout.state

    // 仅在支付已完成时才继续
    if (
      status !== 'completed' &&
      status !== 'paid' &&
      status !== 'succeeded'
    ) {
      return NextResponse.json(
        {
          success: false,
          message: '订单尚未完成',
          status,
        },
        { status: 400 }
      )
    }

    const metadata = checkout.metadata || {}
    const userId = metadata.userId as string | undefined
    const planType = (metadata.planType as 'monthly' | 'yearly' | undefined) ??
      (metadata.plan_type as 'monthly' | 'yearly' | undefined)

    if (!userId || !planType) {
      return NextResponse.json(
        {
          success: false,
          message: '支付记录中缺少用户或套餐信息',
        },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: '用户不存在',
        },
        { status: 404 }
      )
    }

    // 查找对应订单（如果创建支付会话时已写入）
    let order = await prisma.order.findFirst({
      where: {
        userId: user.id,
        creemSessionId: sessionId,
      },
    })

    const amount =
      checkout.amount ||
      checkout.total ||
      checkout.amount_total ||
      checkout.price ||
      0
    const currency =
      checkout.currency ||
      checkout.currency_code ||
      'USD'

    // 如果没有找到订单，则补建一条已完成的订单记录
    if (!order) {
      order = await prisma.order.create({
        data: {
          userId: user.id,
          creemSessionId: sessionId,
          creemOrderId:
            checkout.order_id ||
            checkout.orderId ||
            undefined,
          amount,
          currency,
          status: 'completed',
          planType,
          metadata: JSON.stringify(metadata),
        },
      })
    } else if (order.status !== 'completed') {
      // 更新订单为已完成状态
      await prisma.order.update({
        where: { id: order.id },
        data: {
          creemOrderId:
            checkout.order_id ||
            checkout.orderId ||
            order.creemOrderId ||
            undefined,
          amount,
          currency,
          status: 'completed',
        },
      })
    }

    // 计算会员到期时间
    const expiresAt = new Date()
    if (planType === 'monthly') {
      expiresAt.setMonth(expiresAt.getMonth() + 1)
    } else if (planType === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1)
    }

    // 激活会员
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isPremium: true,
        premiumExpiresAt: expiresAt,
        creemCustomerId:
          checkout.customer_id ||
          checkout.customerId ||
          checkout.customer?.id ||
          user.creemCustomerId ||
          undefined,
      },
    })

    console.log('Membership activated via verify endpoint:', {
      userId: updatedUser.id,
      planType,
      expiresAt: expiresAt.toISOString(),
    })

    return NextResponse.json({
      success: true,
      isPremium: true,
      premiumExpiresAt: expiresAt,
      planType,
    })
  } catch (error) {
    console.error('Verify payment error:', error)
    return NextResponse.json(
      {
        success: false,
        error: '验证支付失败',
      },
      { status: 500 }
    )
  }
}

