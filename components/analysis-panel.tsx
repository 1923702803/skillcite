"use client"

import { cn } from "@/lib/utils"
import { GeoScoreGauge } from "./geo-score-gauge"
import { InsightsChecklist, type Insight } from "./insights-checklist"
import { SchemaPreview } from "./schema-preview"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, AlertTriangle, CheckCircle2, XCircle } from "lucide-react"

interface AnalysisPanelProps {
  geoScore: number
  insights: Insight[]
  schema: object | null
  isLoading: boolean
  className?: string
}

export function AnalysisPanel({
  geoScore,
  insights,
  schema,
  isLoading,
  className
}: AnalysisPanelProps) {
  const passedCount = insights.filter(i => i.status === "passed").length
  const failedCount = insights.filter(i => i.status === "failed").length
  const warningCount = insights.filter(i => i.status === "warning").length
  
  return (
    <aside className={cn(
      "w-80 flex flex-col h-full border-l border-slate-800/50 bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-md shadow-2xl",
      className
    )}>
      {/* Header */}
      <div className="p-5 border-b border-slate-800/50 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            分析面板
          </h2>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-xs">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="text-indigo-300 font-medium">实时</span>
          </div>
        </div>
      </div>
      
      {/* Score Gauge */}
      <div className="p-6 border-b border-slate-800/50 bg-slate-900/40 flex justify-center">
        <GeoScoreGauge score={geoScore} isLoading={isLoading} />
      </div>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 p-4 border-b border-slate-800/50 bg-slate-900/30">
        <div className="flex flex-col items-center p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-1.5" />
          <span className="text-xl font-bold text-emerald-300">{isLoading ? "-" : passedCount}</span>
          <span className="text-[10px] text-emerald-400/70 font-medium">通过</span>
        </div>
        <div className="flex flex-col items-center p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 shadow-lg shadow-amber-500/10">
          <AlertTriangle className="w-5 h-5 text-amber-400 mb-1.5" />
          <span className="text-xl font-bold text-amber-300">{isLoading ? "-" : warningCount}</span>
          <span className="text-[10px] text-amber-400/70 font-medium">警告</span>
        </div>
        <div className="flex flex-col items-center p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/10 border border-red-500/30 shadow-lg shadow-red-500/10">
          <XCircle className="w-5 h-5 text-red-400 mb-1.5" />
          <span className="text-xl font-bold text-red-300">{isLoading ? "-" : failedCount}</span>
          <span className="text-[10px] text-red-400/70 font-medium">失败</span>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="insights" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid grid-cols-2 mx-4 mt-4 bg-slate-800/60 border border-slate-700/50 rounded-lg p-1">
          <TabsTrigger 
            value="insights" 
            className="text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all rounded-md"
          >
            洞察建议
          </TabsTrigger>
          <TabsTrigger 
            value="schema" 
            className="text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all rounded-md"
          >
            结构化数据
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="insights" className="flex-1 overflow-y-auto p-4 mt-0">
          <InsightsChecklist insights={insights} isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="schema" className="flex-1 overflow-y-auto p-4 mt-0">
          <SchemaPreview schema={schema} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </aside>
  )
}
