"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // 等待几秒让 webhook 处理完成
    const timer = setTimeout(() => {
      setLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
            <span className="text-3xl text-white">✓</span>
          </div>
          <CardTitle className="text-2xl">支付成功！</CardTitle>
          <CardDescription>
            感谢您的订阅，您的会员已激活
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-center text-muted-foreground">
              正在激活您的会员...
            </p>
          ) : (
            <>
              <p className="text-center text-sm text-muted-foreground">
                您现在可以享受无限次分析功能了！
              </p>
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
