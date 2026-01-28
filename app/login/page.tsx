"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(1, "请输入密码"),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // 只在浏览器端读取 URL 查询参数，避免构建时的 useSearchParams 限制
    if (typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)
    if (params.get("registered") === "true") {
      setSuccess("注册成功！请使用您的邮箱和密码登录。")
    }
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (!result) {
        setError("登录失败，服务器无响应")
        return
      }

      if (result.error) {
        setError("邮箱或密码错误")
        return
      }

      if (result.ok) {
        router.push("/")
        router.refresh()
        return
      }

      setError("登录失败，请稍后重试")
    } catch (error) {
      console.error("登录异常:", error)
      setError("登录失败，请稍后重试")
    } finally {
      // 无论成功或失败都恢复按钮状态，避免一直显示“登录中...”
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-slate-700 bg-slate-900/30 p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">登录</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            登录您的 SkillCite 账户
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {success && (
            <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-600 dark:text-green-400">
              {success}
            </div>
          )}
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              {...register("email")}
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              aria-invalid={errors.password ? "true" : "false"}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "登录中..." : "登录"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          还没有账户？{" "}
          <Link
            href="/register"
            className="text-primary hover:underline font-medium"
          >
            立即注册
          </Link>
        </div>
      </div>
    </div>
  )
}
