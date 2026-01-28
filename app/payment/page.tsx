"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface UsageInfo {
  canUse: boolean
  isPremium: boolean
  freeUsageCount: number
  totalUsageCount: number
  premiumExpiresAt: string | null
}

export default function PaymentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchUsageInfo()
    }
  }, [status, router])

  const fetchUsageInfo = async () => {
    try {
      const response = await fetch('/api/usage/check')
      if (response.ok) {
        const data = await response.json()
        setUsageInfo(data)
      }
    } catch (error) {
      console.error('获取使用信息失败:', error)
    }
  }

  // 测试功能：手动激活会员（仅开发环境）
  const handleTestActivate = async () => {
    if (process.env.NODE_ENV === 'production') return
    
    try {
      const response = await fetch('/api/test/activate-membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ months: 1 }),
      })
      
      const data = await response.json()
      if (response.ok) {
        alert(`会员已激活！\n${data.message}`)
        fetchUsageInfo()
      } else {
        alert(data.error || '激活失败')
      }
    } catch (error) {
      console.error('激活会员错误:', error)
      alert('激活失败')
    }
  }

  const handlePayment = async (planType: 'monthly' | 'yearly') => {
    setLoading(true)
    try {
      const response = await fetch('/api/payment/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planType }),
      })

      const data = await response.json()

      if (response.ok && data.url) {
        // 跳转到 Creem 支付页面
        window.location.href = data.url
      } else {
        const errorMsg = data.error || '创建支付会话失败'
        const details = data.details ? `\n\n详细信息: ${data.details}` : ''
        alert(errorMsg + details)
        setLoading(false)
      }
    } catch (error) {
      console.error('支付错误:', error)
      const errorMsg = error instanceof Error ? error.message : '支付失败，请稍后重试'
      alert(`支付失败: ${errorMsg}\n\n请检查控制台获取更多信息。`)
      setLoading(false)
    }
  }

  if (status === 'loading' || !usageInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  const plans = [
    {
      id: 'monthly' as const,
      name: '月度会员',
      price: 9.99,
      period: '月',
      features: ['无限次分析', '优先处理', '高级功能'],
    },
    {
      id: 'yearly' as const,
      name: '年度会员',
      price: 99.99,
      period: '年',
      originalPrice: 119.88,
      features: ['无限次分析', '优先处理', '高级功能', '节省 20%'],
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* 返回按钮 */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          返回主页
        </Button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">升级会员</h1>
        <p className="text-muted-foreground">
          解锁无限次分析功能，提升您的工作效率
        </p>
      </div>

      {/* 当前状态 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>当前状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">会员状态：</span>
              <span className={usageInfo.isPremium ? "text-green-500 font-medium" : "text-muted-foreground"}>
                {usageInfo.isPremium ? '✓ 会员' : '免费用户'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">剩余免费次数：</span>
              <span className="font-medium">
                {usageInfo.freeUsageCount} 次
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">总使用次数：</span>
              <span className="font-medium">
                {usageInfo.totalUsageCount} 次
              </span>
            </div>
            {usageInfo.isPremium && usageInfo.premiumExpiresAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">会员到期时间：</span>
                <span className="font-medium text-indigo-400">
                  {new Date(usageInfo.premiumExpiresAt).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
            {/* 测试按钮：手动激活会员（仅开发环境） */}
            {process.env.NODE_ENV !== 'production' && !usageInfo.isPremium && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestActivate}
                  className="w-full text-xs"
                >
                  🧪 测试：激活会员（1个月）
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 会员计划 */}
      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="relative">
            {plan.id === 'yearly' && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-bl-lg">
                推荐
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/{plan.period}</span>
                {plan.originalPrice && (
                  <div className="text-sm text-muted-foreground line-through mt-1">
                    ${plan.originalPrice}/{plan.period}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                onClick={() => handlePayment(plan.id)}
                disabled={loading || usageInfo.isPremium}
              >
                {loading ? '处理中...' : usageInfo.isPremium ? '已是会员' : `立即订阅 ${plan.name}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
