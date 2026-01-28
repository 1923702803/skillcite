import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * 测试工具：手动激活会员状态
 * 用于测试会员显示功能
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const { months = 1 } = await request.json()

    // 计算到期时间
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + months)

    // 更新用户会员状态
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        isPremium: true,
        premiumExpiresAt: expiresAt,
      },
      select: {
        id: true,
        email: true,
        isPremium: true,
        premiumExpiresAt: true,
        freeUsageCount: true,
        totalUsageCount: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: `会员已激活，有效期至 ${expiresAt.toLocaleDateString('zh-CN')}`,
      user: updatedUser,
    })
  } catch (error) {
    console.error('激活会员错误:', error)
    return NextResponse.json(
      { error: '激活失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
