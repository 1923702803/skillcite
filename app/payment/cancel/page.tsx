"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PaymentCancelPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center">
            <span className="text-3xl text-white">!</span>
          </div>
          <CardTitle className="text-2xl">支付已取消</CardTitle>
          <CardDescription>
            您取消了支付流程
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            如果您想继续订阅，可以随时返回支付页面。
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/')}
            >
              返回主页
            </Button>
            <Button
              className="flex-1"
              onClick={() => router.push('/payment')}
            >
              重新支付
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
