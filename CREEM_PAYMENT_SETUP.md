# Creem 支付集成配置指南

## 功能概述

✅ 每个新用户默认有 **3 次免费分析**机会
✅ 使用 Creem 支付充值会员后可**无限次使用**
✅ 支持月度会员和年度会员两种套餐
✅ 自动处理支付成功后的会员激活
✅ 实时显示剩余使用次数和会员状态

## 配置步骤

### 1. 注册 Creem 账户

1. 访问 [Creem Dashboard](https://dashboard.creem.io)
2. 注册并登录账户
3. 完成账户验证

### 2. 创建产品

在 Creem 后台创建两个产品：

#### 月度会员产品
- **产品名称**: 月度会员
- **价格**: $9.99（或您设置的价格）
- **计费周期**: 每月
- 复制产品 ID，保存备用

#### 年度会员产品
- **产品名称**: 年度会员
- **价格**: $99.99（或您设置的价格）
- **计费周期**: 每年
- 复制产品 ID，保存备用

### 3. 获取 API 密钥

1. 在 Creem Dashboard 中，进入 **Settings** → **API Keys**
2. 创建新的 API 密钥
3. 复制 API 密钥，保存备用

### 4. 配置 Webhook

1. 在 Creem Dashboard 中，进入 **Settings** → **Webhooks**
2. 添加新的 Webhook：
   - **URL**: `https://your-domain.com/api/payment/webhook`
   - **事件**: 选择以下事件：
     - `checkout.completed` - 支付完成
     - `refund.created` - 退款创建
3. 复制 Webhook Secret，保存备用

### 5. 更新环境变量

在 `.env.local` 文件中添加以下配置：

```env
# Creem 支付配置
CREEM_API_KEY=your_creem_api_key_here
CREEM_API_BASE=https://api.creem.io/v1
CREEM_WEBHOOK_SECRET=your_webhook_secret_here

# 产品 ID（在 Creem 后台创建产品后获取）
CREEM_PRODUCT_MONTHLY=prod_monthly_xxxxx
CREEM_PRODUCT_YEARLY=prod_yearly_xxxxx
```

**重要**: 将上面的占位符替换为实际的值：
- `your_creem_api_key_here` → 您的 Creem API 密钥
- `your_webhook_secret_here` → 您的 Webhook Secret
- `prod_monthly_xxxxx` → 月度会员产品 ID
- `prod_yearly_xxxxx` → 年度会员产品 ID

### 6. 更新数据库

运行 Prisma 迁移以更新数据库结构：

```bash
npx prisma generate
```

## 功能说明

### 使用次数管理

- **新用户**: 自动获得 3 次免费分析
- **免费用户**: 每次使用分析功能会扣除 1 次免费次数
- **会员用户**: 无限次使用，不扣除免费次数

### 支付流程

1. 用户点击"升级会员"按钮
2. 选择会员套餐（月度/年度）
3. 跳转到 Creem 支付页面
4. 完成支付
5. Webhook 自动处理支付成功事件
6. 用户会员状态自动激活

### 会员状态

- **会员标识**: 用户界面显示 "✓ 会员"
- **到期时间**: 会员到期后自动降级为免费用户
- **续费**: 会员到期前可以续费

## API 端点

### 创建支付会话
```
POST /api/payment/create-session
Body: { planType: 'monthly' | 'yearly' }
```

### 检查使用次数
```
GET /api/usage/check
返回: { canUse, isPremium, freeUsageCount, totalUsageCount }
```

### 扣除使用次数
```
POST /api/usage/check
自动扣除 1 次使用次数
```

### Webhook 处理
```
POST /api/payment/webhook
处理 Creem 支付事件
```

## 页面路由

- `/payment` - 支付页面，显示会员套餐
- `/payment/success` - 支付成功页面
- `/payment/cancel` - 支付取消页面

## 测试流程

### 1. 测试免费次数

1. 注册新用户
2. 使用分析功能 3 次
3. 第 4 次使用时应该提示升级会员

### 2. 测试支付流程

1. 访问 `/payment` 页面
2. 选择会员套餐
3. 使用 Creem 测试卡完成支付
4. 验证会员状态已激活

### 3. 测试会员功能

1. 会员用户使用分析功能
2. 验证不扣除免费次数
3. 验证可以无限次使用

## 故障排除

### 支付会话创建失败

- 检查 `CREEM_API_KEY` 是否正确
- 检查产品 ID 是否正确
- 查看服务器日志获取详细错误信息

### Webhook 未触发

- 检查 Webhook URL 是否正确配置
- 确保服务器可以接收外部请求
- 检查 Webhook Secret 是否正确

### 会员未激活

- 检查 Webhook 是否正常处理
- 查看数据库中的订单状态
- 检查用户会员字段是否正确更新

## 安全建议

1. **API 密钥安全**:
   - 不要将 API 密钥提交到 Git
   - 使用环境变量管理密钥
   - 定期轮换 API 密钥

2. **Webhook 验证**:
   - 始终验证 Webhook 签名
   - 使用 HTTPS 接收 Webhook
   - 验证事件数据的完整性

3. **数据库安全**:
   - 定期备份用户数据
   - 保护用户支付信息
   - 遵循数据保护法规

## 下一步

- [ ] 添加会员到期提醒
- [ ] 添加使用统计图表
- [ ] 添加批量购买功能
- [ ] 添加优惠码功能
- [ ] 添加发票生成功能
