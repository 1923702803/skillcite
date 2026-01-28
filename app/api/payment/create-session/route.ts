import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createCheckoutSession } from '@/lib/creem'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const { planType } = await request.json()

    // 验证计划类型
    const validPlans = ['monthly', 'yearly']
    if (!planType || !validPlans.includes(planType)) {
      return NextResponse.json(
        { error: '无效的计划类型' },
        { status: 400 }
      )
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    // 配置产品 ID（需要在 Creem 后台创建产品后配置）
    const productIds: Record<string, string> = {
      monthly: process.env.CREEM_PRODUCT_MONTHLY || '',
      yearly: process.env.CREEM_PRODUCT_YEARLY || '',
    }

    const productId = productIds[planType]
    if (!productId) {
      return NextResponse.json(
        { error: '产品配置错误，请联系管理员' },
        { status: 500 }
      )
    }

    // 创建支付会话
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const checkoutSession = await createCheckoutSession(
      productId,
      user.id,
      `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      `${baseUrl}/payment/cancel`, // 虽然 Creem API 不支持，但保留参数以保持函数签名一致
      {
        userId: user.id,
        planType,
        email: user.email,
      }
    )

    // 保存订单记录（支付完成后 Webhook 会更新 creemOrderId）
    // 注意：Creem API 返回的可能是 checkout 对象，检查正确的字段名
    const sessionId = checkoutSession.id || checkoutSession.checkout_id || null
    
    try {
      await prisma.order.create({
        data: {
          userId: user.id,
          creemSessionId: sessionId,
          amount: 0, // 金额从 Creem 获取
          currency: 'USD',
          status: 'pending',
          planType,
          metadata: JSON.stringify({ planType }),
        },
      })
    } catch (orderError) {
      // 如果创建订单失败，记录错误但不影响支付流程
      console.error('创建订单记录失败:', orderError)
      // 继续执行，因为支付会话已创建成功
    }

    // Creem API 返回的 URL 可能在 checkout.url 或 checkout.checkout_url
    const checkoutUrl = checkoutSession.url || checkoutSession.checkout_url || checkoutSession.checkoutUrl
    
    return NextResponse.json({
      sessionId: checkoutSession.id || checkoutSession.checkout_id,
      url: checkoutUrl,
    })
  } catch (error) {
    console.error('创建支付会话错误:', error)
    const errorMessage = error instanceof Error ? error.message : '创建支付会话失败'
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}
