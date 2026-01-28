# 快速开始指南

## 🚀 5 步完成 MongoDB Atlas 配置

### 步骤 1: 创建数据库用户（当前页面）

1. 点击 **"Add New Database User"** 按钮
2. 选择 **"Password"** 认证方式
3. 输入用户名：`skillcite-user`（或您喜欢的名称）
4. 点击 **"Autogenerate Secure Password"** 生成密码
5. **⚠️ 重要**: 立即复制并保存用户名和密码！
6. 权限选择：**"Read and write to any database"**
7. 点击 **"Add User"**

### 步骤 2: 配置网络访问

1. 在左侧菜单点击 **"Network Access"**
2. 点击 **"Add IP Address"**
3. 选择 **"Allow Access from Anywhere"**（开发环境）
   - 输入：`0.0.0.0/0`
   - ⚠️ 生产环境请只添加特定 IP
4. 点击 **"Confirm"**

### 步骤 3: 获取连接字符串

1. 点击左侧 **"Database"** → **"Clusters"**
2. 点击集群旁边的 **"Connect"** 按钮
3. 选择 **"Connect your application"**
4. Driver 选择：**"Node.js"**，Version：**"5.5 or later"**
5. 复制连接字符串（类似这样）：
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 步骤 4: 替换用户名和密码

将连接字符串中的：
- `<username>` 替换为步骤 1 创建的用户名
- `<password>` 替换为步骤 1 生成的密码
- 在 `mongodb.net/` 后面添加数据库名 `skillcite`

**最终格式**：
```
mongodb+srv://skillcite-user:your-password@cluster0.xxxxx.mongodb.net/skillcite?retryWrites=true&w=majority
```

**⚠️ 如果密码包含特殊字符**（如 `@`, `#`, `%`），需要进行 URL 编码：
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`

### 步骤 5: 更新项目配置

1. 打开项目中的 `.env.local` 文件
2. 将 `DATABASE_URL` 更新为步骤 4 的完整连接字符串：
   ```env
   DATABASE_URL=mongodb+srv://skillcite-user:your-password@cluster0.xxxxx.mongodb.net/skillcite?retryWrites=true&w=majority
   ```
3. 确保 `NEXTAUTH_SECRET` 已设置（已自动生成）
4. 保存文件

### ✅ 完成！

现在重启开发服务器：
```bash
# 停止当前服务器（Ctrl+C）
pnpm dev
```

然后访问 `http://localhost:3000/register` 测试注册功能！

---

## 📝 详细说明

查看 `MONGODB_ATLAS_SETUP.md` 获取更详细的配置说明和故障排除指南。
