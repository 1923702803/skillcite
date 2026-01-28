"use client"

import { useState, useRef } from "react"
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link2, 
  Code, 
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Eye,
  EyeOff
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface ContentEditorProps {
  content: string
  onChange: (content: string) => void
  geoMode: boolean
  onGeoModeChange: (enabled: boolean) => void
  className?: string
}

const toolbarButtons = [
  { icon: Bold, label: "Bold", tag: "strong" },
  { icon: Italic, label: "Italic", tag: "em" },
  { icon: Link2, label: "Link", tag: "a" },
  { icon: Code, label: "Code", tag: "code" },
] as const

const headingButtons = [
  { icon: Heading1, label: "Heading 1", tag: "h1" },
  { icon: Heading2, label: "Heading 2", tag: "h2" },
  { icon: Heading3, label: "Heading 3", tag: "h3" },
] as const

const listButtons = [
  { icon: List, label: "Bullet List", tag: "ul" },
  { icon: ListOrdered, label: "Numbered List", tag: "ol" },
  { icon: Quote, label: "Blockquote", tag: "blockquote" },
] as const

// GEO structural elements to highlight
const geoElements = {
  definition: { regex: /\*\*定义:\*\*.*?(?=\n|$)/gi, class: "bg-indigo-500/20 border-l-2 border-indigo-500 pl-2" },
  logic: { regex: /\*\*逻辑链:\*\*.*?(?=\n|$)/gi, class: "bg-cyan-500/20 border-l-2 border-cyan-500 pl-2" },
  evidence: { regex: /\*\*证据:\*\*.*?(?=\n|$)/gi, class: "bg-green-500/20 border-l-2 border-green-500 pl-2" },
  claim: { regex: /\*\*论点:\*\*.*?(?=\n|$)/gi, class: "bg-amber-500/20 border-l-2 border-amber-500 pl-2" },
}

export function ContentEditor({ 
  content, 
  onChange, 
  geoMode, 
  onGeoModeChange,
  className 
}: ContentEditorProps) {
  const [showPreview, setShowPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const insertTag = (tag: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    
    // 确保 textarea 获得焦点
    textarea.focus()
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    
    // 获取当前行的内容
    const textBeforeCursor = content.substring(0, start)
    const textAfterCursor = content.substring(end)
    const lineStart = textBeforeCursor.lastIndexOf('\n') + 1
    const lineEnd = textAfterCursor.indexOf('\n') === -1 
      ? content.length 
      : end + textAfterCursor.indexOf('\n')
    const currentLine = content.substring(lineStart, lineEnd)
    
    let newText = ""
    let newCursorPos = start
    
    if (tag === "a") {
      // 链接：如果选中文本，包装它；否则插入链接模板
      if (selectedText) {
        newText = `[${selectedText}](url)`
        newCursorPos = start + selectedText.length + 3 // 光标在 "url" 前
      } else {
        newText = `[链接文本](url)`
        newCursorPos = start + 5 // 光标在 "链接文本" 后
      }
    } else if (tag === "code") {
      // 代码：包装选中文本或插入代码块
      if (selectedText) {
        newText = `\`${selectedText}\``
        newCursorPos = start + selectedText.length + 1
      } else {
        newText = "`代码`"
        newCursorPos = start + 2
      }
    } else if (["h1", "h2", "h3"].includes(tag)) {
      // 标题：检查当前行是否已有标题标记
      const headingLevel = parseInt(tag[1])
      const headingPrefix = "#".repeat(headingLevel)
      const headingRegex = /^#{1,3}\s+/
      
      if (headingRegex.test(currentLine)) {
        // 如果当前行已有标题标记，替换它
        const lineWithoutHeading = currentLine.replace(headingRegex, "")
        newText = content.substring(0, lineStart) + `${headingPrefix} ${lineWithoutHeading}` + content.substring(lineEnd)
        newCursorPos = lineStart + headingPrefix.length + 1 + lineWithoutHeading.length
      } else {
        // 如果有选中文本，使用选中文本；否则使用当前行或默认文本
        const textToUse = selectedText || (currentLine.trim() || "标题")
        if (selectedText) {
          newText = content.substring(0, start) + `${headingPrefix} ${textToUse}` + content.substring(end)
          newCursorPos = start + headingPrefix.length + 1 + textToUse.length
        } else {
          newText = content.substring(0, lineStart) + `${headingPrefix} ${textToUse}` + content.substring(lineEnd)
          newCursorPos = lineStart + headingPrefix.length + 1 + textToUse.length
        }
      }
    } else if (tag === "ul") {
      // 无序列表：检查当前行是否已有列表标记
      if (/^[-*]\s+/.test(currentLine)) {
        // 移除列表标记
        newText = content.substring(0, lineStart) + currentLine.replace(/^[-*]\s+/, "") + content.substring(lineEnd)
        newCursorPos = lineStart + currentLine.replace(/^[-*]\s+/, "").length
      } else {
        const textToUse = selectedText || (currentLine.trim() || "列表项")
        if (selectedText) {
          newText = content.substring(0, start) + `- ${textToUse}` + content.substring(end)
          newCursorPos = start + 2 + textToUse.length
        } else {
          newText = content.substring(0, lineStart) + `- ${textToUse}` + content.substring(lineEnd)
          newCursorPos = lineStart + 2 + textToUse.length
        }
      }
    } else if (tag === "ol") {
      // 有序列表：检查当前行是否已有列表标记
      if (/^\d+\.\s+/.test(currentLine)) {
        // 移除列表标记
        newText = content.substring(0, lineStart) + currentLine.replace(/^\d+\.\s+/, "") + content.substring(lineEnd)
        newCursorPos = lineStart + currentLine.replace(/^\d+\.\s+/, "").length
      } else {
        const textToUse = selectedText || (currentLine.trim() || "列表项")
        if (selectedText) {
          newText = content.substring(0, start) + `1. ${textToUse}` + content.substring(end)
          newCursorPos = start + 3 + textToUse.length
        } else {
          newText = content.substring(0, lineStart) + `1. ${textToUse}` + content.substring(lineEnd)
          newCursorPos = lineStart + 3 + textToUse.length
        }
      }
    } else if (tag === "blockquote") {
      // 引用：检查当前行是否已有引用标记
      if (/^>\s+/.test(currentLine)) {
        // 移除引用标记
        newText = content.substring(0, lineStart) + currentLine.replace(/^>\s+/, "") + content.substring(lineEnd)
        newCursorPos = lineStart + currentLine.replace(/^>\s+/, "").length
      } else {
        const textToUse = selectedText || (currentLine.trim() || "引用")
        if (selectedText) {
          newText = content.substring(0, start) + `> ${textToUse}` + content.substring(end)
          newCursorPos = start + 2 + textToUse.length
        } else {
          newText = content.substring(0, lineStart) + `> ${textToUse}` + content.substring(lineEnd)
          newCursorPos = lineStart + 2 + textToUse.length
        }
      }
    } else if (tag === "strong") {
      // 粗体：使用 ** 包装
      if (selectedText) {
        // 检查是否已有粗体格式
        const trimmed = selectedText.trim()
        if (trimmed.startsWith("**") && trimmed.endsWith("**") && trimmed.length > 4) {
          // 移除粗体格式：只保留内部文本
          const withoutFormat = trimmed.slice(2, -2)
          // 保持原有的前后空白
          const beforeTrim = selectedText.substring(0, selectedText.indexOf(trimmed))
          const afterTrim = selectedText.substring(selectedText.indexOf(trimmed) + trimmed.length)
          newText = beforeTrim + withoutFormat + afterTrim
          newCursorPos = start + newText.length
        } else {
          // 添加粗体格式
          newText = `**${selectedText}**`
          newCursorPos = start + 2 + selectedText.length
        }
      } else {
        // 没有选中文本，插入模板
        newText = "**粗体文本**"
        newCursorPos = start + 2
      }
    } else if (tag === "em") {
      // 斜体：使用 _ 包装（注意：Markdown 中斜体是单个 _）
      if (selectedText) {
        // 检查是否已有斜体格式（但要避免误判粗体中的 _）
        const trimmed = selectedText.trim()
        // 检查是否是纯斜体格式（以 _ 开头和结尾，但不是 ** 的一部分）
        const isItalic = trimmed.startsWith("_") && 
                        trimmed.endsWith("_") && 
                        trimmed.length > 2 &&
                        !trimmed.startsWith("**") &&
                        !trimmed.endsWith("**")
        
        if (isItalic) {
          // 移除斜体格式：只保留内部文本
          const withoutFormat = trimmed.slice(1, -1)
          // 保持原有的前后空白
          const beforeTrim = selectedText.substring(0, selectedText.indexOf(trimmed))
          const afterTrim = selectedText.substring(selectedText.indexOf(trimmed) + trimmed.length)
          newText = beforeTrim + withoutFormat + afterTrim
          newCursorPos = start + newText.length
        } else {
          // 添加斜体格式
          newText = `_${selectedText}_`
          newCursorPos = start + 1 + selectedText.length
        }
      } else {
        // 没有选中文本，插入模板
        newText = "_斜体文本_"
        newCursorPos = start + 1
      }
    }
    
    // 更新内容
    let updated: string
    if (tag === "h1" || tag === "h2" || tag === "h3" || tag === "ul" || tag === "ol" || tag === "blockquote") {
      // 这些情况已经在 newText 中包含了完整内容
      updated = newText
    } else {
      // 其他情况（粗体、斜体、链接、代码等）：替换选中部分
      updated = content.substring(0, start) + newText + content.substring(end)
    }
    
    onChange(updated)
    
    // 使用 setTimeout 确保 DOM 更新后再设置光标位置
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
        textareaRef.current.focus()
      }
    }, 0)
  }
  
  const highlightGeoElements = (text: string) => {
    if (!geoMode) return text
    
    let highlighted = text
    Object.entries(geoElements).forEach(([key, { regex, class: className }]) => {
      highlighted = highlighted.replace(regex, (match) => 
        `<span class="${className} inline-block px-1 rounded">${match}</span>`
      )
    })
    return highlighted
  }
  
  return (
    <div className={cn("flex flex-col h-full rounded-lg border border-slate-700 bg-slate-900/30", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-slate-700 bg-slate-800/50 flex-wrap">
        <div className="flex items-center gap-1">
          {headingButtons.map(({ icon: Icon, label, tag }) => (
            <Button
              key={tag}
              variant="ghost"
              size="sm"
              onClick={() => insertTag(tag)}
              className="h-9 w-9 p-0 hover:bg-indigo-500/20 hover:text-indigo-300 rounded-lg transition-all border border-transparent hover:border-indigo-500/30"
              title={label}
            >
              <Icon className="w-4 h-4" />
              <span className="sr-only">{label}</span>
            </Button>
          ))}
        </div>
        
        <Separator orientation="vertical" className="h-6 bg-slate-700/50" />
        
        <div className="flex items-center gap-1">
          {toolbarButtons.map(({ icon: Icon, label, tag }) => (
            <Button
              key={tag}
              variant="ghost"
              size="sm"
              onClick={() => insertTag(tag)}
              className="h-9 w-9 p-0 hover:bg-indigo-500/20 hover:text-indigo-300 rounded-lg transition-all border border-transparent hover:border-indigo-500/30"
              title={label}
            >
              <Icon className="w-4 h-4" />
              <span className="sr-only">{label}</span>
            </Button>
          ))}
        </div>
        
        <Separator orientation="vertical" className="h-6 bg-slate-700/50" />
        
        <div className="flex items-center gap-1">
          {listButtons.map(({ icon: Icon, label, tag }) => (
            <Button
              key={tag}
              variant="ghost"
              size="sm"
              onClick={() => insertTag(tag)}
              className="h-9 w-9 p-0 hover:bg-indigo-500/20 hover:text-indigo-300 rounded-lg transition-all border border-transparent hover:border-indigo-500/30"
              title={label}
            >
              <Icon className="w-4 h-4" />
              <span className="sr-only">{label}</span>
            </Button>
          ))}
        </div>
        
        <div className="flex-1" />
        
        {/* GEO Mode Toggle */}
        <div className="flex items-center gap-3 px-2">
          <div className="flex items-center gap-2">
            <Switch
              id="geo-mode"
              checked={geoMode}
              onCheckedChange={onGeoModeChange}
              className="data-[state=checked]:bg-indigo-500"
            />
            <Label htmlFor="geo-mode" className="text-xs font-medium text-slate-300 cursor-pointer">
              GEO 模式
            </Label>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="h-8 w-8 p-0 hover:bg-slate-700"
            title={showPreview ? "隐藏预览" : "显示预览"}
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      
      {/* GEO Mode Legend */}
      {geoMode && (
        <div className="flex items-center gap-4 px-4 py-2.5 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-slate-800/50 text-xs backdrop-blur-sm">
          <span className="text-slate-400 font-semibold">AI 结构:</span>
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-500/20 border border-indigo-500/30">
            <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400/50" />
            <span className="text-indigo-300 font-medium">定义</span>
          </span>
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-cyan-500/20 border border-cyan-500/30">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
            <span className="text-cyan-300 font-medium">逻辑链</span>
          </span>
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            <span className="text-emerald-300 font-medium">证据</span>
          </span>
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/20 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
            <span className="text-amber-300 font-medium">论点</span>
          </span>
        </div>
      )}
      
      {/* Editor/Preview Area */}
      <div className="flex-1 flex min-h-0">
        <div className={cn("flex-1 flex flex-col", showPreview && "w-1/2")}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder="在这里开始编写您的内容...

使用 GEO 结构标记来提升 AI 理解度：
**定义:** 对概念的清晰解释
**逻辑链:** 分步骤的推理过程
**证据:** 支持性数据或引用
**论点:** 主要论述或断言"
            className="flex-1 w-full p-4 bg-transparent resize-none focus:outline-none text-sm leading-relaxed text-foreground placeholder:text-slate-500 font-mono"
            spellCheck={false}
          />
        </div>
        
        {showPreview && (
          <>
            <Separator orientation="vertical" className="bg-slate-700" />
            <div className="w-1/2 p-4 overflow-y-auto">
              <div 
                className="prose prose-invert prose-sm max-w-none text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: highlightGeoElements(content) }}
              />
            </div>
          </>
        )}
      </div>
      
      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-800/50 bg-slate-900/40 backdrop-blur-sm text-xs">
        <div className="flex items-center gap-4">
          <span className="text-slate-400 font-medium">{content.split(/\s+/).filter(Boolean).length} 字</span>
          <span className="text-slate-500">{content.length} 字符</span>
        </div>
        <div className="flex items-center gap-2">
          {geoMode && (
            <span className="px-2.5 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 rounded-lg text-[10px] font-semibold border border-indigo-500/30 shadow-sm">
              AI 结构视图
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
