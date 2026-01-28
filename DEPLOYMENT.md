# 部署指南 - Vercel

本指南将帮助您将 SkillCite 项目部署到 Vercel。

## 📋 前置要求

1. GitHub 账户
2. Vercel 账户（可免费注册）
3. MongoDB Atlas 数据库（已配置）
4. Creem 支付账户（已配置）

## 🚀 部署步骤

### 第一步：上传到 GitHub

1. **在 GitHub 创建新仓库**
   - 访问 https://github.com/new
   - 输入仓库名称（例如：`skillcite`）
   - 选择 Public 或 Private
   - **不要**勾选 "Initialize this repository with a README"
   - 点击 "Create repository"

2. **推送代码到 GitHub**

   在项目目录中运行以下命令（将 `YOUR_USERNAME` 和 `YOUR_REPO` 替换为您的信息）：

   ```powershell
   # 添加远程仓库
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   
   # 重命名分支为 main（如果当前是 master）
   git branch -M main
   
   # 推送代码
   git push -u origin main
   ```

   如果提示输入用户名和密码，请使用 GitHub Personal Access Token 作为密码。

### 第二步：在 Vercel 中部署

1. **导入项目**
   - 访问 https://vercel.com
   - 点击 "Add New..." → "Project"
   - 选择您刚创建的 GitHub 仓库
   - 点击 "Import"

2. **配置项目设置**
   - **Framework Preset**: Next.js（自动检测）
   - **Root Directory**: `./`（默认）
   - **Build Command**: `pnpm build`（或 `npm run build`）
   - **Output Directory**: `.next`（默认）
   - **Install Command**: `pnpm install`（或 `npm install`）

3. **配置环境变量**

   在 "Environment Variables" 部分，添加以下变量：

   ```
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/skillcite?retryWrites=true&w=majority
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-secret-key-here
   OPENROUTER_API_KEY=your-openrouter-api-key
   CREEM_API_KEY=your-creem-api-key
   CREEM_API_BASE=https://test-api.creem.io
   CREEM_WEBHOOK_SECRET=your-webhook-secret
   CREEM_PRODUCT_MONTHLY=your-monthly-product-id
   CREEM_PRODUCT_YEARLY=your-yearly-product-id
   ```

   **重要提示**：
   - `NEXTAUTH_URL` 应该设置为您的 Vercel 域名（部署后会自动生成）
   - 所有敏感信息都应该从 `.env.local` 复制过来
   - 不要提交 `.env.local` 到 GitHub

4. **部署**

   - 点击 "Deploy"
   - 等待构建完成（通常 2-5 分钟）
   - 部署成功后，您会获得一个 URL（例如：`https://your-app.vercel.app`）

### 第三步：更新配置

1. **更新 NEXTAUTH_URL**
   - 部署完成后，复制您的 Vercel URL
   - 在 Vercel 项目设置中，更新 `NEXTAUTH_URL` 环境变量
   - 重新部署（Vercel 会自动触发）

2. **配置 Creem Webhook**
   - 登录 Creem 后台
   - 进入 Webhook 设置
   - 添加 Webhook URL: `https://your-app.vercel.app/api/payment/webhook`
   - 确保 Webhook Secret 与 Vercel 环境变量中的 `CREEM_WEBHOOK_SECRET` 一致

3. **初始化数据库**
   - 在 Vercel 部署后，您需要运行 Prisma 迁移
   - 可以在本地运行，或者使用 Vercel 的 CLI：

   ```bash
   # 安装 Vercel CLI
   npm i -g vercel
   
   # 登录
   vercel login
   
   # 链接项目
   vercel link
   
   # 运行 Prisma 命令（通过 Vercel 环境）
   vercel env pull .env.local
   npx prisma db push
   ```

   或者，您可以在本地运行（确保 `.env.local` 中的 `DATABASE_URL` 指向生产数据库）：

   ```bash
   npx prisma db push
   ```

### 第四步：验证部署

1. **访问您的应用**
   - 打开 Vercel 提供的 URL
   - 测试注册和登录功能
   - 测试内容编辑和分析功能

2. **测试支付流程**
   - 访问支付页面
   - 测试创建支付会话
   - 完成测试支付
   - 验证 Webhook 是否正常工作

## 🔧 常见问题

### 问题 1: 构建失败

**解决方案**：
- 检查环境变量是否全部配置
- 确保 `package.json` 中的构建脚本正确
- 查看 Vercel 构建日志中的错误信息

### 问题 2: 数据库连接失败

**解决方案**：
- 检查 MongoDB Atlas 网络访问设置，确保允许所有 IP（或添加 Vercel 的 IP）
- 验证 `DATABASE_URL` 格式是否正确
- 确保数据库用户有正确的权限

### 问题 3: NextAuth 认证失败

**解决方案**：
- 确保 `NEXTAUTH_URL` 设置为正确的 Vercel 域名
- 检查 `NEXTAUTH_SECRET` 是否设置（必须是随机字符串）
- 清除浏览器 cookies 后重试

### 问题 4: Webhook 不工作

**解决方案**：
- 检查 Creem Webhook URL 是否正确
- 验证 `CREEM_WEBHOOK_SECRET` 是否匹配
- 查看 Vercel 函数日志（在 Vercel Dashboard → Functions）

## 📝 后续维护

### 更新代码

每次推送到 GitHub 的 `main` 分支，Vercel 会自动重新部署：

```bash
git add .
git commit -m "Update: your changes"
git push origin main
```

### 查看日志

- 在 Vercel Dashboard → 项目 → "Deployments" → 选择部署 → "Functions" 查看日志
- 或使用 Vercel CLI: `vercel logs`

### 回滚部署

- 在 Vercel Dashboard → "Deployments" → 选择之前的部署 → "Promote to Production"

## 🔐 安全建议

1. **环境变量安全**
   - 永远不要将 `.env.local` 提交到 Git
   - 定期轮换 API 密钥和密钥
   - 使用 Vercel 的环境变量加密功能

2. **数据库安全**
   - 使用强密码
   - 限制 MongoDB Atlas 网络访问
   - 定期备份数据库

3. **API 安全**
   - 验证 Webhook 签名
   - 使用 HTTPS（Vercel 自动提供）
   - 实施速率限制（如果需要）

## 📚 相关资源

- [Vercel 文档](https://vercel.com/docs)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- [Prisma 部署指南](https://www.prisma.io/docs/guides/deployment)
- [MongoDB Atlas 文档](https://docs.atlas.mongodb.com/)

## ✅ 部署检查清单

- [ ] 代码已推送到 GitHub
- [ ] Vercel 项目已创建并导入
- [ ] 所有环境变量已配置
- [ ] 数据库已初始化（Prisma push）
- [ ] NEXTAUTH_URL 已更新为 Vercel 域名
- [ ] Creem Webhook 已配置
- [ ] 测试注册/登录功能
- [ ] 测试内容分析功能
- [ ] 测试支付流程
- [ ] 验证 Webhook 正常工作

部署完成后，您的 SkillCite 应用就可以在全球范围内访问了！🎉
