"use client"

import { Copy, Check, Code2 } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SchemaPreviewProps {
  schema: object | null
  isLoading?: boolean
  className?: string
}

export function SchemaPreview({ schema, isLoading = false, className }: SchemaPreviewProps) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    if (!schema) return
    await navigator.clipboard.writeText(JSON.stringify(schema, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const formatJson = (obj: object) => {
    const json = JSON.stringify(obj, null, 2)
    return json.split('\n').map((line, i) => {
      const highlighted = line
        .replace(/"([^"]+)":/g, '<span class="text-indigo-400">"$1"</span>:')
        .replace(/: "([^"]+)"/g, ': <span class="text-green-400">"$1"</span>')
        .replace(/: (\d+)/g, ': <span class="text-amber-400">$1</span>')
        .replace(/: (true|false)/g, ': <span class="text-cyan-400">$1</span>')
      return (
        <div key={i} className="flex">
          <span className="w-8 text-right pr-4 text-slate-600 select-none text-xs">{i + 1}</span>
          <span dangerouslySetInnerHTML={{ __html: highlighted }} />
        </div>
      )
    })
  }
  
  return (
    <div className={cn("rounded-lg border border-slate-700 overflow-hidden", className)}>
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-medium text-foreground">JSON-LD 结构化数据</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          disabled={!schema || isLoading}
          className="h-7 px-2 text-xs"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 mr-1" />
              已复制
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 mr-1" />
              复制
            </>
          )}
        </Button>
      </div>
      <div className="p-4 bg-slate-900/50 overflow-x-auto max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-6 h-4 bg-slate-700 rounded animate-pulse" />
                <div 
                  className="h-4 bg-slate-700 rounded animate-pulse" 
                  style={{ width: `${Math.random() * 50 + 30}%` }}
                />
              </div>
            ))}
          </div>
        ) : schema ? (
          <pre className="text-xs font-mono leading-relaxed">{formatJson(schema)}</pre>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Code2 className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">运行分析以生成结构化数据</p>
          </div>
        )}
      </div>
    </div>
  )
}
