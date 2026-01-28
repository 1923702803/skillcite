"use client"

import { useState, useCallback, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Sparkles, Crown } from "lucide-react"
import { SkillSidebar } from "@/components/skill-sidebar"
import { ContentEditor } from "@/components/content-editor"
import { AnalysisPanel } from "@/components/analysis-panel"
import { UserMenu } from "@/components/user-menu"
import { Button } from "@/components/ui/button"
import type { Insight } from "@/components/insights-checklist"

const initialContent = `# GEO 优化入门指南

**定义:** 生成式引擎优化（GEO）是一种优化内容结构的实践方法，使内容能够更好地被 ChatGPT、Perplexity 等 AI 系统理解和引用。

## 为什么 GEO 很重要

**逻辑链:** 传统 SEO 侧重于关键词布局和外链建设。然而，AI 模型解析内容的方式不同——它们寻找清晰的定义、逻辑结构和权威引用。因此，经过 GEO 优化的内容在 AI 驱动的搜索结果中表现更好。

**证据:** 根据最新研究，具有清晰结构标记的内容被 AI 助手引用的可能性提高了 40%。

## 核心原则

**论点:** GEO 优化的内容应包括：
1. 关键术语的清晰定义
2. 逻辑推理链条
3. 支持性证据和引用
4. 结构化数据标记（Schema.org）

**定义:** Schema.org 标记是一种标准化词汇，用于向搜索引擎和 AI 系统描述内容。
`

const generateInsights = (content: string, skill: string): Insight[] => {
  const insights: Insight[] = []
  
  // Check for definitions
  const hasDefinitions = content.includes("**定义:")
  insights.push({
    id: "definitions",
    label: "包含清晰定义",
    status: hasDefinitions ? "passed" : "failed",
    priority: "high",
    description: hasDefinitions 
      ? "已检测到定义标记" 
      : "添加 **定义:** 标记来解释关键概念"
  })
  
  // Check for logic chains
  const hasLogicChains = content.includes("**逻辑链:")
  insights.push({
    id: "logic-chains",
    label: "构建逻辑推理链",
    status: hasLogicChains ? "passed" : "warning",
    priority: "high",
    description: hasLogicChains 
      ? "已检测到逻辑链结构" 
      : "使用 **逻辑链:** 展示分步推理"
  })
  
  // Check for evidence
  const hasEvidence = content.includes("**证据:")
  insights.push({
    id: "evidence",
    label: "添加支持性证据",
    status: hasEvidence ? "passed" : "failed",
    priority: "medium",
    description: hasEvidence 
      ? "已找到证据引用" 
      : "添加带引用的 **证据:** 标记"
  })
  
  // Check for claims
  const hasClaims = content.includes("**论点:")
  insights.push({
    id: "claims",
    label: "明确陈述论点",
    status: hasClaims ? "passed" : "warning",
    priority: "medium",
    description: hasClaims 
      ? "论点陈述清晰" 
      : "使用 **论点:** 陈述主要观点"
  })
  
  // Check word count
  const wordCount = content.split(/\s+/).filter(Boolean).length
  insights.push({
    id: "word-count",
    label: "内容深度充足",
    status: wordCount >= 200 ? "passed" : wordCount >= 100 ? "warning" : "failed",
    priority: "medium",
    description: `当前：${wordCount} 字。建议 300+ 字以实现全面覆盖。`
  })
  
  // Check for headings
  const headingCount = (content.match(/^#{1,3}\s/gm) || []).length
  insights.push({
    id: "headings",
    label: "使用层级标题",
    status: headingCount >= 3 ? "passed" : headingCount >= 1 ? "warning" : "failed",
    priority: "low",
    description: `发现 ${headingCount} 个标题。使用 H1、H2、H3 构建结构。`
  })
  
  // Check for lists
  const hasLists = /^[-*\d]+\.\s/m.test(content)
  insights.push({
    id: "lists",
    label: "包含结构化列表",
    status: hasLists ? "passed" : "warning",
    priority: "low",
    description: hasLists 
      ? "已找到结构化列表" 
      : "添加项目符号或编号列表以提高可读性"
  })
  
  // Schema.org suggestion
  insights.push({
    id: "schema",
    label: "添加 Schema.org 标记",
    status: "warning",
    priority: "medium",
    description: "JSON-LD 结构化数据将自动生成"
  })
  
  return insights
}

const categoryLabels: Record<string, string> = {
  technology: "技术",
  marketing: "营销",
  business: "商业",
  creative: "创意"
}

const generateSchema = (content: string, skill: string, category: string) => {
  const title = content.match(/^#\s+(.+)$/m)?.[1] || `${skill}指南`
  const wordCount = content.split(/\s+/).filter(Boolean).length
  const categoryLabel = categoryLabels[category] || category
  
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": `关于${categoryLabel}领域中${skill}的综合指南`,
    "author": {
      "@type": "Organization",
      "name": "SkillCite"
    },
    "publisher": {
      "@type": "Organization",
      "name": "SkillCite GEO 平台"
    },
    "datePublished": new Date().toISOString().split('T')[0],
    "wordCount": wordCount,
    "keywords": [skill, categoryLabel, "GEO", "优化"],
    "articleSection": categoryLabel,
    "inLanguage": "zh-CN"
  }
}

const calculateGeoScore = (insights: Insight[]): number => {
  const weights = { high: 20, medium: 12, low: 8 }
  let maxScore = 0
  let earnedScore = 0
  
  insights.forEach(insight => {
    const weight = weights[insight.priority]
    maxScore += weight
    
    if (insight.status === "passed") {
      earnedScore += weight
    } else if (insight.status === "warning") {
      earnedScore += weight * 0.5
    }
  })
  
  return Math.round((earnedScore / maxScore) * 100)
}

export default function SkillCitePage() {
  const { data: session } = useSession()
  const [selectedCategory, setSelectedCategory] = useState("technology")
  const [coreSkill, setCoreSkill] = useState("GEO 优化")
  const [content, setContent] = useState(initialContent)
  const [geoMode, setGeoMode] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [geoScore, setGeoScore] = useState(0)
  const [insights, setInsights] = useState<Insight[]>([])
  const [schema, setSchema] = useState<object | null>(null)
  const [usageInfo, setUsageInfo] = useState<{
    canUse: boolean
    isPremium: boolean
    freeUsageCount: number
    totalUsageCount: number
    premiumExpiresAt: string | null
  } | null>(null)

  // 获取使用次数信息
  useEffect(() => {
    if (session?.user) {
      fetch('/api/usage/check')
        .then(res => res.json())
        .then(data => setUsageInfo(data))
        .catch(err => console.error('获取使用信息失败:', err))
    }
  }, [session])
  
  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true)
    
    try {
      // 先检查并扣除使用次数
      const usageResponse = await fetch('/api/usage/check', {
        method: 'POST',
      })

      if (!usageResponse.ok) {
        const usageError = await usageResponse.json()
        if (usageError.error === '免费次数已用完，请升级会员') {
          alert('免费次数已用完！\n\n请升级会员以继续使用分析功能。')
          window.location.href = '/payment'
          setIsAnalyzing(false)
          return
        }
        throw new Error(usageError.error || '检查使用次数失败')
      }

      const usageData = await usageResponse.json()
      if (!usageData.success) {
        alert('无法使用分析功能，请检查您的账户状态。')
        setIsAnalyzing(false)
        return
      }

      // 执行分析
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          skill: coreSkill,
          category: selectedCategory,
          analysisType: 'standard'
        })
      })
      
      if (!response.ok) {
        throw new Error('分析请求失败')
      }
      
      const data = await response.json()
      console.log('[v0] API response:', data)
      
      if (data.insights && data.insights.length > 0) {
        setInsights(data.insights)
        // API returns 'score', not 'geoScore'
        const score = data.score ?? data.geoScore ?? calculateGeoScore(data.insights)
        console.log('[v0] Setting score:', score)
        setGeoScore(score)
      } else {
        // Fallback to local analysis
        const newInsights = generateInsights(content, coreSkill)
        const newScore = calculateGeoScore(newInsights)
        console.log('[v0] Fallback score:', newScore)
        setInsights(newInsights)
        setGeoScore(newScore)
      }
      
      setSchema(data.schema || generateSchema(content, coreSkill, selectedCategory))
    } catch (error) {
      console.error('AI 分析出错:', error)
      // Fallback to local analysis
      const newInsights = generateInsights(content, coreSkill)
      const newScore = calculateGeoScore(newInsights)
      const newSchema = generateSchema(content, coreSkill, selectedCategory)
      
      setInsights(newInsights)
      setGeoScore(newScore)
      setSchema(newSchema)
    } finally {
      setIsAnalyzing(false)
    }
  }, [content, coreSkill, selectedCategory])
  
  const handleGapAnalysis = useCallback(async () => {
    setIsAnalyzing(true)
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          skill: coreSkill,
          category: selectedCategory,
          analysisType: 'gap'
        })
      })
      
      if (!response.ok) {
        throw new Error('差距分析请求失败')
      }
      
      const data = await response.json()
      console.log('[v0] Gap analysis response:', data)
      
      if (data.insights && data.insights.length > 0) {
        setInsights(data.insights)
        const score = data.score ?? data.geoScore ?? calculateGeoScore(data.insights)
        console.log('[v0] Gap analysis score:', score)
        setGeoScore(score)
      } else {
        // Fallback to local gap analysis
        const baseInsights = generateInsights(content, coreSkill)
        const gapInsights: Insight[] = [
          ...baseInsights,
          {
            id: "competitor-density",
            label: "增加数据密度",
            status: "warning" as const,
            priority: "high" as const,
            description: "竞争对手平均多出 15% 的事实数据点"
          },
          {
            id: "semantic-coverage",
            label: "扩展语义覆盖",
            status: "failed" as const,
            priority: "medium" as const,
            description: `缺少相关主题：${coreSkill}工具、最佳实践、案例研究`
          }
        ]
        const newScore = Math.max(0, calculateGeoScore(gapInsights) - 10)
        setInsights(gapInsights)
        setGeoScore(newScore)
      }
      
      setSchema(data.schema || generateSchema(content, coreSkill, selectedCategory))
    } catch (error) {
      console.error('差距分析出错:', error)
      // Fallback to local gap analysis
      const baseInsights = generateInsights(content, coreSkill)
      const gapInsights: Insight[] = [
        ...baseInsights,
        {
          id: "competitor-density",
          label: "增加数据密度",
          status: "warning" as const,
          priority: "high" as const,
          description: "竞争对手平均多出 15% 的事实数据点"
        },
        {
          id: "semantic-coverage",
          label: "扩展语义覆盖",
          status: "failed" as const,
          priority: "medium" as const,
          description: `缺少相关主题：${coreSkill}工具、最佳实践、案例研究`
        }
      ]
      
      const newScore = Math.max(0, calculateGeoScore(gapInsights) - 10)
      const newSchema = generateSchema(content, coreSkill, selectedCategory)
      
      setInsights(gapInsights)
      setGeoScore(newScore)
      setSchema(newSchema)
    } finally {
      setIsAnalyzing(false)
    }
  }, [content, coreSkill, selectedCategory])
  
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Left Sidebar */}
      <SkillSidebar
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        coreSkill={coreSkill}
        onCoreSkillChange={setCoreSkill}
        onAnalyze={handleAnalyze}
        onGapAnalysis={handleGapAnalysis}
        isAnalyzing={isAnalyzing}
      />
      
      {/* Main Editor */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-900/40 backdrop-blur-sm">
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-slate-900/60 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-foreground bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {coreSkill || "新文档"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {categoryLabels[selectedCategory] || selectedCategory} • 草稿
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              {usageInfo && (
                <div className="flex items-center gap-3 text-xs">
                  {usageInfo.isPremium ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/40 shadow-lg shadow-indigo-500/10">
                        <span className="text-indigo-300 font-semibold flex items-center gap-1.5">
                          <Crown className="w-3.5 h-3.5 text-yellow-400" />
                          <span>会员</span>
                        </span>
                        {usageInfo.premiumExpiresAt && (
                          <span className="text-slate-400 text-[10px] whitespace-nowrap ml-1">
                            至 {new Date(usageInfo.premiumExpiresAt).toLocaleDateString('zh-CN', { 
                              year: 'numeric',
                              month: '2-digit', 
                              day: '2-digit'
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                        <span className="text-slate-300 font-medium">
                          剩余 <span className="text-indigo-400 font-bold">{usageInfo.freeUsageCount}</span> 次
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => window.location.href = '/payment'}
                        className="h-8 text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-500/20 transition-all"
                      >
                        升级会员
                      </Button>
                    </>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/40 border border-slate-700/30 text-xs">
                <span className="text-slate-400">已自动保存</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse" />
              </div>
            </div>
            <UserMenu />
          </div>
        </header>
        
        <div className="flex-1 p-6 min-h-0">
          <ContentEditor
            content={content}
            onChange={setContent}
            geoMode={geoMode}
            onGeoModeChange={setGeoMode}
            className="h-full shadow-2xl"
          />
        </div>
      </main>
      
      {/* Right Analysis Panel */}
      <AnalysisPanel
        geoScore={geoScore}
        insights={insights}
        schema={schema}
        isLoading={isAnalyzing}
      />
    </div>
  )
}
