# SkillCite - GEO 优化工具

一个现代化的 GEO（生成式引擎优化）内容编辑和分析平台，帮助您创建 AI 友好的内容。

## ✨ 功能特性

- 📝 **智能内容编辑器** - 支持 Markdown 格式，包含 GEO 结构标记
- 🤖 **AI 内容分析** - 实时分析内容质量，提供优化建议
- 📊 **GEO 评分系统** - 评估内容对 AI 系统的友好度
- 🎯 **结构化数据生成** - 自动生成 Schema.org JSON-LD
- 👤 **用户系统** - 注册登录、使用次数管理
- 💎 **会员订阅** - 集成 Creem 支付，支持月度/年度会员
- 🎨 **现代化 UI** - 美观的渐变设计和流畅的交互体验

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- pnpm (推荐) 或 npm
- MongoDB Atlas 数据库

### 安装步骤

1. **克隆项目**
```bash
git clone <your-repo-url>
cd v0-skill-cite-mvp-0-main-74073c62
```

2. **安装依赖**
```bash
pnpm install
```

3. **配置环境变量**

复制 `.env.local.example` 为 `.env.local` 并填写以下变量：

```env
# 数据库
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/skillcite?retryWrites=true&w=majority"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OpenRouter API (可选，用于 AI 分析)
OPENROUTER_API_KEY="your-openrouter-api-key"

# Creem 支付 (测试环境)
CREEM_API_KEY="your-creem-api-key"
CREEM_API_BASE="https://test-api.creem.io"
CREEM_WEBHOOK_SECRET="your-webhook-secret"
CREEM_PRODUCT_MONTHLY="your-monthly-product-id"
CREEM_PRODUCT_YEARLY="your-yearly-product-id"
```

4. **初始化数据库**

```bash
npx prisma generate
npx prisma db push
```

5. **启动开发服务器**

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 📁 项目结构

```
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── auth/         # 认证相关
│   │   ├── analyze/      # 内容分析
│   │   ├── payment/      # 支付处理
│   │   └── usage/        # 使用次数管理
│   ├── login/            # 登录页面
│   ├── register/         # 注册页面
│   └── payment/          # 支付页面
├── components/            # React 组件
│   ├── ui/               # UI 基础组件
│   ├── content-editor.tsx
│   ├── skill-sidebar.tsx
│   └── analysis-panel.tsx
├── lib/                   # 工具函数
│   ├── auth.ts           # NextAuth 配置
│   ├── prisma.ts          # Prisma 客户端
│   └── creem.ts           # Creem API 客户端
├── prisma/                # Prisma 配置
│   └── schema.prisma     # 数据库模型
└── public/                # 静态资源
```

## 🛠️ 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **数据库**: MongoDB (Prisma ORM)
- **认证**: NextAuth.js v4
- **UI**: Tailwind CSS + Radix UI
- **支付**: Creem Payment Gateway
- **AI**: OpenRouter API

## 📝 使用说明

### 创建 GEO 优化内容

1. 选择内容类别（技术/营销/商业/创意）
2. 输入核心技能名称
3. 使用编辑器编写内容，使用以下 GEO 标记：
   - `**定义:**` - 关键概念定义
   - `**逻辑链:**` - 推理过程
   - `**证据:**` - 支持性数据
   - `**论点:**` - 主要观点

4. 点击"分析内容"获取优化建议
5. 查看 GEO 评分和结构化数据

### 会员功能

- 免费用户：3 次分析机会
- 会员用户：无限次分析 + 优先处理

## 🔧 部署到 Vercel

1. **推送代码到 GitHub**

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **在 Vercel 中导入项目**

- 访问 [Vercel](https://vercel.com)
- 点击 "New Project"
- 导入 GitHub 仓库
- 配置环境变量（从 `.env.local` 复制）
- 部署！

3. **配置 Webhook**

- 在 Creem 后台配置 Webhook URL: `https://your-domain.vercel.app/api/payment/webhook`
- 确保 `CREEM_WEBHOOK_SECRET` 与 Creem 后台一致

## 📚 文档

- [认证设置指南](./AUTH_SETUP.md)
- [MongoDB Atlas 配置](./MONGODB_ATLAS_SETUP.md)
- [Creem 支付集成](./CREEM_PAYMENT_SETUP.md)
- [测试清单](./TEST_CHECKLIST.md)

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
