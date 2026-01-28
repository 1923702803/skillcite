"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface GeoScoreGaugeProps {
  score: number
  isLoading?: boolean
  className?: string
}

export function GeoScoreGauge({ score, isLoading = false, className }: GeoScoreGaugeProps) {
  // Ensure score is a valid number
  const safeScore = typeof score === 'number' && !Number.isNaN(score) ? Math.max(0, Math.min(100, score)) : 0
  const [animatedScore, setAnimatedScore] = useState(0)
  
  useEffect(() => {
    if (isLoading || safeScore === 0) {
      setAnimatedScore(0)
      return
    }
    
    const duration = 1000
    const steps = 60
    const increment = safeScore / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= safeScore) {
        setAnimatedScore(safeScore)
        clearInterval(timer)
      } else {
        setAnimatedScore(Math.floor(current))
      }
    }, duration / steps)
    
    return () => clearInterval(timer)
  }, [safeScore, isLoading])
  
  const circumference = 2 * Math.PI * 45
  const progress = typeof animatedScore === 'number' && !Number.isNaN(animatedScore) ? animatedScore : 0
  const strokeDashoffset = circumference - (progress / 100) * circumference
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "#22c55e"
    if (score >= 60) return "#6366f1"
    if (score >= 40) return "#f59e0b"
    return "#ef4444"
  }
  
  const getScoreLabel = (score: number) => {
    if (score >= 80) return "优秀"
    if (score >= 60) return "良好"
    if (score >= 40) return "一般"
    return "需改进"
  }
  
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-700"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={isLoading ? "#334155" : getScoreColor(progress)}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={isLoading ? circumference : strokeDashoffset}
            className="transition-all duration-300 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span className="text-3xl font-bold text-foreground">{progress}</span>
              <span className="text-xs text-muted-foreground">/100</span>
            </>
          )}
        </div>
      </div>
      <div className="mt-3 text-center">
        <p className="text-sm font-medium text-foreground">GEO 评分</p>
        {!isLoading && (
          <p 
            className="text-xs font-medium mt-1"
            style={{ color: getScoreColor(progress) }}
          >
            {getScoreLabel(progress)}
          </p>
        )}
      </div>
    </div>
  )
}
