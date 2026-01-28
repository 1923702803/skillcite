// Creem 支付 API 客户端
// 测试环境：https://test-api.creem.io
// 生产环境：https://api.creem.io
const CREEM_API_BASE = process.env.CREEM_API_BASE || 'https://api.creem.io'
const CREEM_API_KEY = process.env.CREEM_API_KEY
const CREEM_TEST_MODE = process.env.CREEM_TEST_MODE === 'true' || process.env.CREEM_API_KEY?.startsWith('creem_test_')

export interface CreemCheckoutSession {
  id: string
  url: string
  status: string
}

export interface CreemProduct {
  id: string
  name: string
  price: number
  currency: string
}

/**
 * 创建支付会话
 */
export async function createCheckoutSession(
  productId: string,
  customerId: string,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, any>
): Promise<CreemCheckoutSession> {
  if (!CREEM_API_KEY) {
    throw new Error('CREEM_API_KEY 未配置')
  }

  // Creem API 使用 /v1/checkouts 端点
  const endpoint = `${CREEM_API_BASE}/v1/checkouts`
  
  // 使用 customer.email，Creem 会自动创建客户（如果不存在）
  // 如果客户已存在，Creem 会使用现有客户
  const customerEmail = metadata?.email
  if (!customerEmail) {
    throw new Error('客户邮箱不能为空')
  }
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CREEM_API_KEY!, // Creem 使用 x-api-key header
    },
    body: JSON.stringify({
      product_id: productId,
      customer: {
        email: customerEmail,
      },
      success_url: successUrl,
      // Creem API 不支持 cancel_url 参数
      // 测试模式通过 API base URL 判断，不需要 test_mode 参数
      ...(metadata && Object.keys(metadata).length > 0 && { metadata }),
    }),
  })

  if (!response.ok) {
    let errorMessage = '创建支付会话失败'
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorData.error || JSON.stringify(errorData)
    } catch {
      const errorText = await response.text()
      errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`
    }
    console.error('Creem API 错误:', {
      status: response.status,
      statusText: response.statusText,
      url: `${CREEM_API_BASE}/checkout/sessions`,
      error: errorMessage
    })
    throw new Error(`创建支付会话失败: ${errorMessage}`)
  }

  return response.json()
}

/**
 * 验证支付会话状态
 */
export async function getCheckoutSession(sessionId: string): Promise<any> {
  if (!CREEM_API_KEY) {
    throw new Error('CREEM_API_KEY 未配置')
  }

  const response = await fetch(`${CREEM_API_BASE}/v1/checkouts/${sessionId}`, {
    method: 'GET',
    headers: {
      'x-api-key': CREEM_API_KEY!,
    },
  })

  if (!response.ok) {
    throw new Error('获取支付会话失败')
  }

  return response.json()
}
