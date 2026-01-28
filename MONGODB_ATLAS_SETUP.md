# MongoDB Atlas 配置详细步骤

## 第一步：创建数据库用户

1. **在 MongoDB Atlas 界面中**（您当前所在的页面）：
   - 点击绿色的 **"Add New Database User"** 按钮

2. **填写用户信息**：
   - **Authentication Method（认证方式）**: 选择 "Password"
   - **Username（用户名）**: 输入一个用户名，例如：`skillcite-user`
   - **Password（密码）**: 
     - 点击 "Autogenerate Secure Password" 自动生成安全密码
     - **或者** 自己设置一个强密码（至少8个字符，包含大小写字母、数字）
   - **⚠️ 重要**: 复制保存好用户名和密码，稍后需要用到！

3. **设置用户权限**：
   - **Database User Privileges（数据库用户权限）**: 选择 "Read and write to any database"
   - 或者选择 "Read and write" 并指定数据库名称 `skillcite`

4. **点击 "Add User"** 完成创建

## 第二步：配置网络访问（IP 白名单）

1. **在左侧菜单中**，点击 **"Network Access"**（在 Security 下）

2. **添加 IP 地址**：
   - 点击 **"Add IP Address"** 按钮
   - 选择以下选项之一：
     - **开发环境**: 点击 **"Add Current IP Address"** 添加您当前的 IP
     - **允许所有 IP（仅开发）**: 点击 **"Allow Access from Anywhere"**，输入 `0.0.0.0/0`
     - ⚠️ 生产环境请只添加特定 IP

3. **点击 "Confirm"** 完成

## 第三步：获取连接字符串

1. **在左侧菜单中**，点击 **"Database"** → **"Clusters"**

2. **找到您的集群**，点击 **"Connect"** 按钮

3. **选择连接方式**：
   - 选择 **"Connect your application"**（连接您的应用程序）

4. **选择驱动和版本**：
   - **Driver**: 选择 "Node.js"
   - **Version**: 选择 "5.5 or later"（或最新版本）

5. **复制连接字符串**：
   - 您会看到类似这样的连接字符串：
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - 点击 **"Copy"** 复制完整字符串

6. **替换用户名和密码**：
   - 将 `<username>` 替换为您在第一步创建的用户名（例如：`skillcite-user`）
   - 将 `<password>` 替换为您在第一步设置的密码
   - 在连接字符串末尾添加数据库名称：
     ```
     mongodb+srv://skillcite-user:your-password@cluster0.xxxxx.mongodb.net/skillcite?retryWrites=true&w=majority
     ```
   - ⚠️ 注意：如果密码中包含特殊字符（如 `@`, `#`, `%` 等），需要进行 URL 编码：
     - `@` → `%40`
     - `#` → `%23`
     - `%` → `%25`
     - `&` → `%26`
     - 等等

## 第四步：在项目中配置

1. **打开项目中的 `.env.local` 文件**

2. **更新 `DATABASE_URL`**：
   ```env
   DATABASE_URL=mongodb+srv://skillcite-user:your-password@cluster0.xxxxx.mongodb.net/skillcite?retryWrites=true&w=majority
   ```
   - 将上面的连接字符串替换为您在第三步获取的实际连接字符串

3. **确保其他配置正确**：
   ```env
   # MongoDB 数据库连接
   DATABASE_URL=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/skillcite?retryWrites=true&w=majority

   # NextAuth 配置
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here

   # OpenRouter API 配置
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

## 第五步：测试连接

1. **重启开发服务器**：
   ```bash
   # 停止当前服务器（Ctrl+C）
   # 然后重新启动
   pnpm dev
   ```

2. **测试注册功能**：
   - 访问 `http://localhost:3000/register`
   - 填写注册表单
   - 如果注册成功，说明数据库连接正常！

3. **检查数据库**：
   - 在 MongoDB Atlas 中，点击 **"Database"** → **"Data Explorer"**
   - 您应该能看到新创建的 `skillcite` 数据库
   - 在 `users` 集合中应该能看到注册的用户数据

## 常见问题

### 1. 连接失败 "authentication failed"
- **原因**: 用户名或密码错误
- **解决**: 
  - 检查 `.env.local` 中的用户名和密码是否正确
  - 如果密码包含特殊字符，确保进行了 URL 编码

### 2. 连接失败 "IP not whitelisted"
- **原因**: 您的 IP 地址不在白名单中
- **解决**: 在 Network Access 中添加您的当前 IP 地址

### 3. 连接超时
- **原因**: 网络问题或防火墙阻止
- **解决**: 
  - 检查网络连接
  - 确保防火墙允许 MongoDB 连接（端口 27017 或 27017+）

### 4. 数据库名称问题
- **提示**: 连接字符串中的数据库名称（`skillcite`）可以自定义
- MongoDB 会在首次写入时自动创建数据库和集合

## 安全建议

1. **生产环境**：
   - 不要使用 `0.0.0.0/0` 允许所有 IP
   - 只添加服务器或应用的特定 IP 地址
   - 使用强密码
   - 定期轮换密码

2. **环境变量**：
   - 不要将 `.env.local` 提交到 Git
   - 在生产环境使用环境变量管理工具（如 Vercel Environment Variables）

3. **用户权限**：
   - 生产环境建议使用最小权限原则
   - 只授予应用所需的最小权限

## 完成！

配置完成后，您的应用就可以：
- ✅ 连接 MongoDB Atlas 数据库
- ✅ 存储用户注册信息
- ✅ 验证用户登录
- ✅ 管理用户会话

现在可以开始测试注册和登录功能了！
