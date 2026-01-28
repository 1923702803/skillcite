"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const sessionId = searchParams.get("session_id")

    // 如果没有 session_id，就只做一个简单的 loading 结束
    if (!sessionId) {
      const timer = setTimeout(() => setLoading(false), 2000)
      return () => clearTimeout(timer)
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch(`/api/payment/verify?session_id=${encodeURIComponent(sessionId)}`)
        const data = await res.json()

        if (!res.ok || !data.success) {
          setError(data.message || data.error || "验证支付失败，请稍后在会员页刷新重试")
        }
      } catch (err) {
        console.error("Verify payment failed:", err)
        setError("验证支付失败，请稍后在会员页刷新重试")
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
            <span className="text-3xl text-white">✓</span>
          </div>
          <CardTitle className="text-2xl">支付成功！</CardTitle>
          <CardDescription>
            感谢您的订阅，我们正在为您激活会员
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-center text-muted-foreground">
              正在验证您的支付并激活会员...
            </p>
          ) : (
            <>
              {error ? (
                <p className="text-center text-sm text-destructive">
                  {error}
                </p>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  您的会员已激活，现在可以享受无限次分析功能！
                </p>
              )}
              <Button
                className="w-full"
                onClick={() => router.push('/')}
              >
                返回主页
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

