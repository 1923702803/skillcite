# Ngrok 设置指南 - 用于 Creem Webhook 测试

## 为什么需要 Ngrok？

Creem 的 Webhook 需要从外部访问您的本地开发服务器。由于 `localhost:3000` 无法被外部访问，我们需要使用 ngrok 创建一个公网隧道，将外部请求转发到本地服务器。

## 步骤 1: 下载和安装 Ngrok

### Windows 系统

1. **访问 ngrok 官网**：
   - 打开 https://ngrok.com/download
   - 下载 Windows 版本

2. **解压文件**：
   - 解压下载的 ZIP 文件
   - 将 `ngrok.exe` 放到一个方便的位置，例如：
     - `C:\ngrok\ngrok.exe`
     - 或项目目录：`C:\Users\a2195\Desktop\v0-skill-cite-mvp-0-main-74073c62\ngrok.exe`

3. **添加到系统 PATH（可选但推荐）**：
   - 右键"此电脑" → "属性" → "高级系统设置"
   - 点击"环境变量"
   - 在"系统变量"中找到 `Path`，点击"编辑"
   - 点击"新建"，添加 ngrok.exe 所在的目录
   - 点击"确定"保存

### 或者使用包管理器安装

**使用 Chocolatey**（如果已安装）：
```powershell
choco install ngrok
```

**使用 Scoop**（如果已安装）：
```powershell
scoop install ngrok
```

## 步骤 2: 注册 Ngrok 账户并获取 Authtoken

1. **注册账户**：
   - 访问 https://dashboard.ngrok.com/signup
   - 注册免费账户（可以使用 GitHub/Google 登录）

2. **获取 Authtoken**：
   - 登录后，访问 https://dashboard.ngrok.com/get-started/your-authtoken
   - 复制您的 Authtoken（类似：`2abc123def456ghi789jkl012mno345pq_6r7s8t9u0v1w2x3y4z5`）

3. **配置 Authtoken**：
   ```powershell
   ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
   ```
   将 `YOUR_AUTHTOKEN_HERE` 替换为您复制的 Authtoken

## 步骤 3: 启动本地开发服务器

在项目目录中启动 Next.js 开发服务器：

```powershell
cd C:\Users\a2195\Desktop\v0-skill-cite-mvp-0-main-74073c62
pnpm dev
```

确保服务器运行在 `http://localhost:3000`

## 步骤 4: 启动 Ngrok 隧道

打开**新的终端窗口**（保持开发服务器运行），运行：

```powershell
ngrok http 3000
```

您会看到类似这样的输出：

```
ngrok

Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123def456.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**重要信息**：
- `Forwarding` 行显示了您的公网 URL：`https://abc123def456.ngrok-free.app`
- 这个 URL 会转发到 `http://localhost:3000`
- **复制这个 URL**，稍后需要用到

## 步骤 5: 在 Creem 后台配置 Webhook

1. **登录 Creem Dashboard**：
   - 访问 https://dashboard.creem.io
   - 进入 **Settings** → **Webhooks**

2. **添加 Webhook**：
   - 点击 "Add Webhook" 或 "Create Webhook"
   - **Webhook URL**：输入您的 ngrok URL + Webhook 路径
     ```
     https://abc123def456.ngrok-free.app/api/payment/webhook
     ```
     ⚠️ 将 `abc123def456.ngrok-free.app` 替换为您实际的 ngrok URL

3. **选择事件**：
   - 勾选以下事件：
     - `checkout.completed` - 支付完成
     - `refund.created` - 退款创建

4. **保存 Webhook**：
   - 点击 "Save" 或 "Create"
   - **复制 Webhook Secret**，稍后需要添加到 `.env.local`

## 步骤 6: 更新项目配置

1. **更新 `.env.local`**：
   ```env
   # 添加 Webhook Secret（从 Creem 后台复制）
   CREEM_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

2. **更新 `NEXTAUTH_URL`**（如果需要）：
   ```env
   # 如果需要在支付成功后跳转，可以使用 ngrok URL
   NEXTAUTH_URL=https://abc123def456.ngrok-free.app
   ```

## 步骤 7: 测试 Webhook

1. **访问 Ngrok Web Interface**：
   - 打开浏览器访问：http://127.0.0.1:4040
   - 这里可以看到所有通过 ngrok 的请求和响应

2. **测试支付流程**：
   - 访问您的应用：`https://abc123def456.ngrok-free.app`
   - 完成一次测试支付
   - 在 ngrok Web Interface 中查看 Webhook 请求

3. **检查日志**：
   - 查看开发服务器的终端输出
   - 应该能看到 Webhook 处理的日志

## 常见问题

### 1. Ngrok URL 每次启动都变化？

**免费版 ngrok** 每次启动都会生成新的随机 URL。

**解决方案**：
- 使用 **ngrok 付费版** 可以设置固定域名
- 或者每次启动后更新 Creem 的 Webhook URL

### 2. 如何保持 ngrok 运行？

- 保持 ngrok 终端窗口打开
- 如果关闭，Webhook 将无法访问
- 可以使用 `screen` 或 `tmux`（Linux/Mac）或 PowerShell 后台任务（Windows）

### 3. Ngrok 连接超时？

免费版 ngrok 有连接限制，如果长时间无活动可能会断开。

**解决方案**：
- 定期访问您的应用保持连接活跃
- 或升级到付费版

### 4. 如何查看 Webhook 请求详情？

访问 http://127.0.0.1:4040 可以查看：
- 所有 HTTP 请求
- 请求头、请求体
- 响应内容
- 这对于调试 Webhook 非常有用

## 生产环境

在生产环境中，您不需要 ngrok，因为：
- 您的应用已经部署到公网（如 Vercel）
- 直接使用生产域名配置 Webhook：
  ```
  https://your-domain.com/api/payment/webhook
  ```

## 快速命令参考

```powershell
# 启动 ngrok（转发到 3000 端口）
ngrok http 3000

# 查看 ngrok 状态
ngrok config check

# 查看所有隧道
ngrok api tunnels list
```

## 完成！

现在您的本地开发环境已经可以接收 Creem 的 Webhook 了！

**记住**：
- ✅ 每次启动开发服务器时，也要启动 ngrok
- ✅ 如果 ngrok URL 变化，记得更新 Creem 的 Webhook URL
- ✅ 使用 ngrok Web Interface (http://127.0.0.1:4040) 调试 Webhook
