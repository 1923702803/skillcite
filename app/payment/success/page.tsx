"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 在后台静默调用一次激活接口，强制把当前登录用户升级为会员
    const activateMembershipSilently = async () => {
      try {
        await fetch("/api/payment/activate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        })
      } catch (err) {
        console.error("Activate membership failed:", err)
      } finally {
        setLoading(false)
      }
    }

    activateMembershipSilently()
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
            感谢您的订阅，我们正在为您激活会员
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-center text-muted-foreground">
              正在激活您的会员，请稍候...
            </p>
          ) : (
            <>
              <p className="text-center text-sm text-muted-foreground">
                支付已完成，我们会很快为您开通或续期会员。
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

