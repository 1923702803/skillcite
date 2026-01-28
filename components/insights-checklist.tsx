"use client"

import { useState } from "react"
import { Check, X, AlertCircle, ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Insight {
  id: string
  label: string
  status: "passed" | "failed" | "warning"
  priority: "high" | "medium" | "low"
  description?: string
}

interface InsightsChecklistProps {
  insights: Insight[]
  isLoading?: boolean
  className?: string
}

export function InsightsChecklist({ insights, isLoading = false, className }: InsightsChecklistProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  
  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }
  const getStatusIcon = (status: Insight["status"]) => {
    switch (status) {
      case "passed":
        return <Check className="w-4 h-4 text-green-500" />
      case "failed":
        return <X className="w-4 h-4 text-red-500" />
      case "warning":
        return <AlertCircle className="w-4 h-4 text-amber-500" />
    }
  }
  
  const getPriorityBadge = (priority: Insight["priority"]) => {
    const colors = {
      high: "bg-red-500/20 text-red-400 border-red-500/30",
      medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      low: "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
    return colors[priority]
  }
  
  const getPriorityLabel = (priority: Insight["priority"]) => {
    const labels = { high: "高", medium: "中", low: "低" }
    return labels[priority]
  }
  
  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg animate-pulse">
            <div className="w-4 h-4 bg-slate-700 rounded" />
            <div className="flex-1">
              <div className="h-4 bg-slate-700 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  const sortedInsights = [...insights].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
  
  return (
    <div className={cn("space-y-2", className)}>
      {sortedInsights.map((insight) => {
        const isExpanded = expandedIds.has(insight.id)
        return (
          <div
            key={insight.id}
            className={cn(
              "rounded-lg border transition-all cursor-pointer overflow-hidden",
              "bg-slate-800/50 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800",
              isExpanded && "border-indigo-500/50 bg-slate-800"
            )}
            onClick={() => toggleExpand(insight.id)}
          >
            <div className="flex items-start gap-3 p-3">
              <div className="mt-0.5">{getStatusIcon(insight.status)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">{insight.label}</p>
                  <span className={cn(
                    "px-1.5 py-0.5 text-[10px] font-medium rounded border",
                    getPriorityBadge(insight.priority)
                  )}>
                    {getPriorityLabel(insight.priority)}
                  </span>
                </div>
              </div>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-indigo-400 transition-colors mt-0.5" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-400 transition-colors mt-0.5" />
              )}
            </div>
            {isExpanded && insight.description && (
              <div className="px-3 pb-3 pt-0">
                <div className="pl-7 border-l-2 border-indigo-500/30 ml-2">
                  <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
                  {insight.status !== "passed" && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-indigo-400 font-medium">建议操作：</span>
                      <span className="text-xs text-slate-300">
                        {insight.status === "failed" ? "需要立即修复" : "建议优化"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
