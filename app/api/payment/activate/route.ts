import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 不校验支付结果，强制把当前登录用户升级为会员
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 },
      )
    }

    const userId = session.user.id

    // 可选：从 body 中接收 planType，用于设置到期时间
    let planType: 'monthly' | 'yearly' | null = null
    try {
      const body = await request.json().catch(() => null)
      if (body && (body.planType === 'monthly' || body.planType === 'yearly')) {
        planType = body.planType
      }
    } catch {
      // 忽略解析错误，按永久会员处理
    }

    let expiresAt: Date | null = null
    if (planType) {
      expiresAt = new Date()
      if (planType === 'monthly') {
        expiresAt.setMonth(expiresAt.getMonth() + 1)
      } else if (planType === 'yearly') {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1)
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isPremium: true,
        premiumExpiresAt: expiresAt,
      },
    })

    return NextResponse.json({
      success: true,
      isPremium: true,
      premiumExpiresAt: expiresAt,
      userId: updatedUser.id,
    })
  } catch (error) {
    console.error('Force activate membership error:', error)
    return NextResponse.json(
      { error: '激活会员失败' },
      { status: 500 },
    )
  }
}

