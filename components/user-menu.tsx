"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Crown } from "lucide-react"

export function UserMenu() {
  const { data: session } = useSession()
  const [usageInfo, setUsageInfo] = useState<{
    isPremium: boolean
    premiumExpiresAt: string | null
  } | null>(null)

  useEffect(() => {
    if (session?.user) {
      fetch('/api/usage/check')
        .then(res => res.json())
        .then(data => setUsageInfo(data))
        .catch(err => console.error('获取使用信息失败:', err))
    }
  }, [session])

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild>
          <a href="/login">登录</a>
        </Button>
        <Button asChild>
          <a href="/register">注册</a>
        </Button>
      </div>
    )
  }

  const initials = session.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || session.user.email?.[0].toUpperCase() || "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none">
                {session.user.name || "用户"}
              </p>
              {usageInfo?.isPremium && (
                <Crown className="w-3 h-3 text-indigo-400" />
              )}
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user.email}
            </p>
            {usageInfo?.isPremium && usageInfo.premiumExpiresAt && (
              <div className="mt-1.5 px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20">
                <p className="text-xs leading-none text-indigo-400 font-medium">
                  会员到期
                </p>
                <p className="text-xs leading-none text-indigo-300 mt-0.5">
                  {new Date(usageInfo.premiumExpiresAt).toLocaleDateString('zh-CN', { 
                    year: 'numeric',
                    month: 'long', 
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!usageInfo?.isPremium && (
          <DropdownMenuItem
            onClick={() => window.location.href = "/payment"}
            className="cursor-pointer"
          >
            升级会员
          </DropdownMenuItem>
        )}
        {usageInfo?.isPremium && (
          <DropdownMenuItem
            onClick={() => window.location.href = "/payment"}
            className="cursor-pointer"
          >
            续费会员
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="cursor-pointer"
        >
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
