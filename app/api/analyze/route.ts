import { NextRequest, NextResponse } from 'next/server'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const API_URL = 'https://openrouter.ai/api/v1/chat/completions'

interface AnalysisResult {
  score: number
  insights: {
    id: string
    label: string
    status: 'passed' | 'warning' | 'failed'
    priority: 'high' | 'medium' | 'low'
    description: string
  }[]
  suggestions: string[]
}

export async function POST(request: NextRequest) {
  try {
    // 检查使用次数（需要从 session 获取用户信息）
    // 这里先允许通过，实际检查在前端和 usage/check API 中处理
    const { content, skill, category } = await request.json()

    if (!OPENROUTER_API_KEY) {
      // 如果没有配置 API 密钥，返回一个空结果，让前端使用本地分析降级
      return NextResponse.json(
        { 
          insights: [],
          score: 0,
          suggestions: ['提示：配置 OPENROUTER_API_KEY 环境变量以启用 AI 分析功能']
        },
        { status: 200 }
      )
    }

    const systemPrompt = `你是一个专业的 GEO（生成式引擎优化）分析专家。你的任务是分析用户提供的内容，评估其对 AI 系统的可理解性和可引用性。

请根据以下标准进行分析：
1. 定义清晰度：内容是否包含关键概念的清晰定义
2. 逻辑链条：内容是否有清晰的逻辑推理过程
3. 证据支持：内容是否包含支持性数据或引用
4. 论点明确：主要观点是否清晰表述
5. 结构层次：是否使用了适当的标题层级
6. 列表使用：是否使用了结构化列表提高可读性
7. 内容深度：内容是否足够详细和全面

请以 JSON 格式返回分析结果，格式如下：
{
  "score": 0-100的整数分数,
  "insights": [
    {
      "id": "唯一标识",
      "label": "简短标签（5字以内）",
      "status": "passed/warning/failed",
      "priority": "high/medium/low",
      "description": "详细说明"
    }
  ],
  "suggestions": ["改进建议1", "改进建议2"]
}

只返回 JSON，不要有其他内容。`

    const userPrompt = `请分析以下关于"${skill}"（${category}领域）的内容：

${content}

请评估其 GEO 优化程度并给出具体建议。`

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'z-ai/glm-4.5-air:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API error:', errorText)
      return NextResponse.json(
        { error: 'AI 服务请求失败' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const aiContent = data.choices?.[0]?.message?.content

    if (!aiContent) {
      return NextResponse.json(
        { error: 'AI 返回内容为空' },
        { status: 500 }
      )
    }

    // 尝试解析 JSON 响应
    let analysisResult: AnalysisResult
    try {
      // 清理可能的 markdown 代码块
      const cleanedContent = aiContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      analysisResult = JSON.parse(cleanedContent)
    } catch {
      // 如果解析失败，返回一个默认结构
      console.error('Failed to parse AI response:', aiContent)
      analysisResult = {
        score: 65,
        insights: [
          {
            id: 'ai-analysis',
            label: 'AI 分析',
            status: 'warning',
            priority: 'medium',
            description: aiContent.slice(0, 200)
          }
        ],
        suggestions: ['请检查内容格式']
      }
    }

    return NextResponse.json(analysisResult)
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: '分析过程中出现错误' },
      { status: 500 }
    )
  }
}
