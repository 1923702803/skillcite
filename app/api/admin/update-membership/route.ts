import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * 管理员工具：手动更新用户会员状态（用于测试）
 * 注意：生产环境应该移除或添加权限验证
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

    const { userId, months = 1 } = await request.json()

    // 使用当前用户 ID 或指定的用户 ID
    const targetUserId = userId || session.user.id

    // 计算到期时间
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + months)

    // 更新用户会员状态
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        isPremium: true,
        premiumExpiresAt: expiresAt,
      },
      select: {
        id: true,
        email: true,
        isPremium: true,
        premiumExpiresAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: `会员已激活，有效期至 ${expiresAt.toLocaleDateString('zh-CN')}`,
      user: updatedUser,
    })
  } catch (error) {
    console.error('更新会员状态错误:', error)
    return NextResponse.json(
      { error: '更新失败' },
      { status: 500 }
    )
  }
}
