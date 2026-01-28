import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * 检查用户是否可以使用分析功能
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        isPremium: true,
        premiumExpiresAt: true,
        freeUsageCount: true,
        totalUsageCount: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    // 检查会员状态
    const isPremium = user.isPremium && 
      (!user.premiumExpiresAt || new Date(user.premiumExpiresAt) > new Date())

    // 检查是否可以使用
    const canUse = isPremium || user.freeUsageCount > 0

    return NextResponse.json({
      canUse,
      isPremium,
      freeUsageCount: user.freeUsageCount,
      totalUsageCount: user.totalUsageCount,
      premiumExpiresAt: user.premiumExpiresAt,
    })
  } catch (error) {
    console.error('检查使用次数错误:', error)
    return NextResponse.json(
      { error: '检查失败' },
      { status: 500 }
    )
  }
}

/**
 * 扣除使用次数
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    // 检查会员状态
    const isPremium = user.isPremium && 
      (!user.premiumExpiresAt || new Date(user.premiumExpiresAt) > new Date())

    // 如果是会员，不需要扣除次数
    if (isPremium) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          totalUsageCount: {
            increment: 1,
          },
        },
      })

      return NextResponse.json({
        success: true,
        isPremium: true,
        remainingCount: -1, // -1 表示无限
      })
    }

    // 检查免费次数
    if (user.freeUsageCount <= 0) {
      return NextResponse.json(
        { 
          error: '免费次数已用完，请升级会员',
          canUse: false,
        },
        { status: 403 }
      )
    }

    // 扣除使用次数
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        freeUsageCount: {
          decrement: 1,
        },
        totalUsageCount: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({
      success: true,
      isPremium: false,
      remainingCount: updatedUser.freeUsageCount,
    })
  } catch (error) {
    console.error('扣除使用次数错误:', error)
    return NextResponse.json(
      { error: '扣除失败' },
      { status: 500 }
    )
  }
}
