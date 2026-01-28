"use client"

import { 
  Sparkles, 
  Target, 
  Zap, 
  ChevronDown,
  Loader2,
  BarChart3,
  Crown
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SkillSidebarProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  coreSkill: string
  onCoreSkillChange: (skill: string) => void
  onAnalyze: () => void
  onGapAnalysis: () => void
  isAnalyzing: boolean
  className?: string
}

const categories = [
  { value: "technology", label: "技术", icon: Zap },
  { value: "marketing", label: "营销", icon: Target },
  { value: "business", label: "商业", icon: BarChart3 },
  { value: "creative", label: "创意", icon: Sparkles },
]

export function SkillSidebar({
  selectedCategory,
  onCategoryChange,
  coreSkill,
  onCoreSkillChange,
  onAnalyze,
  onGapAnalysis,
  isAnalyzing,
  className
}: SkillSidebarProps) {
  return (
    <aside className={cn(
      "w-72 flex flex-col h-full border-r border-slate-800/50 bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-md shadow-2xl",
      className
    )}>
      {/* Header */}
      <div className="p-5 border-b border-slate-800/50 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-500/40 shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <h1 className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
              SkillCite
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">GEO 优化工具</p>
          </div>
        </div>
      </div>
      
      {/* Skill Input */}
      <div className="flex-1 p-5 space-y-6 overflow-y-auto">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">类别</Label>
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-full bg-slate-800/60 border-slate-700/50 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 hover:bg-slate-800/80 transition-all">
                <SelectValue placeholder="选择类别" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800/95 border-slate-700/50 backdrop-blur-md">
                {categories.map(({ value, label, icon: Icon }) => (
                  <SelectItem key={value} value={value} className="focus:bg-indigo-500/20 focus:text-indigo-300">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-indigo-400" />
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">核心技能</Label>
            <Input
              value={coreSkill}
              onChange={(e) => onCoreSkillChange(e.target.value)}
              placeholder="例如：React 开发"
              className="bg-slate-800/60 border-slate-700/50 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 hover:bg-slate-800/80 transition-all"
            />
          </div>
        </div>
        
        {/* Suggestion chips */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">推荐技能</p>
          <div className="flex flex-wrap gap-2">
            {["SEO 基础", "内容策略", "技术写作", "数据分析"].map((skill) => (
              <button
                key={skill}
                onClick={() => onCoreSkillChange(skill)}
                className="px-3 py-1.5 text-xs rounded-lg bg-slate-800/60 text-slate-300 hover:bg-indigo-500/20 hover:text-indigo-300 hover:border-indigo-500/50 transition-all border border-slate-700/50 font-medium"
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 shadow-lg space-y-3">
          <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">快速提示</p>
          <div className="space-y-2.5 text-xs text-slate-400">
            <div className="flex items-start gap-2.5">
              <span className="text-indigo-400 mt-0.5 font-bold">•</span>
              <span>使用 <strong className="text-indigo-300">定义:</strong> 标记关键概念</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-cyan-400 mt-0.5 font-bold">•</span>
              <span>构建 <strong className="text-cyan-300">逻辑链</strong> 帮助AI理解</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-emerald-400 mt-0.5 font-bold">•</span>
              <span>添加带引用的 <strong className="text-emerald-300">证据</strong></span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="p-5 border-t border-slate-800/50 bg-slate-900/40 space-y-3">
        <Button
          onClick={onAnalyze}
          disabled={isAnalyzing || !coreSkill.trim()}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed h-11"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              分析中...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              分析内容
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={onGapAnalysis}
          disabled={isAnalyzing || !coreSkill.trim()}
          className="w-full border-slate-700/50 hover:bg-slate-800/60 hover:border-indigo-500/50 text-foreground bg-slate-800/40 font-medium h-10 transition-all disabled:opacity-50"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          差距分析
        </Button>
        
        <Button
          variant="default"
          onClick={() => window.location.href = '/payment'}
          className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all h-11"
        >
          <Crown className="w-4 h-4 mr-2" />
          升级会员
        </Button>
      </div>
    </aside>
  )
}
