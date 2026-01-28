# 注册登录功能设置指南

## 已完成的功能

✅ 用户注册和登录系统
✅ MongoDB 数据库集成
✅ NextAuth.js 认证
✅ 密码加密（bcryptjs）
✅ 路由保护中间件
✅ 用户菜单组件

## 数据库设置

### 选项 1: 本地 MongoDB

1. 安装 MongoDB（如果还没有）：
   - Windows: 下载并安装 [MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - 或使用 Docker: `docker run -d -p 27017:27017 --name mongodb mongo:latest`

2. 启动 MongoDB 服务

3. 在 `.env.local` 中配置连接字符串：
   ```
   DATABASE_URL=mongodb://localhost:27017/skillcite
   ```

### 选项 2: MongoDB Atlas (云数据库)

1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 创建免费集群
3. 获取连接字符串
4. 在 `.env.local` 中配置：
   ```
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/skillcite
   ```

## 环境变量配置

确保 `.env.local` 文件包含以下配置：

```env
# MongoDB 数据库连接
DATABASE_URL=mongodb://localhost:27017/skillcite

# NextAuth 配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production

# OpenRouter API 配置（已有）
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

**重要**: 生成一个安全的 `NEXTAUTH_SECRET`：
```bash
openssl rand -base64 32
```

## 初始化数据库

数据库会在首次运行时自动创建。Prisma 会连接到 MongoDB 并创建必要的集合。

## 使用说明

1. **注册新用户**:
   - 访问 `/register` 页面
   - 填写邮箱、密码等信息
   - 点击注册

2. **登录**:
   - 访问 `/login` 页面
   - 输入注册时的邮箱和密码
   - 登录成功后会自动跳转到主页

3. **用户菜单**:
   - 登录后，右上角会显示用户头像
   - 点击头像可以查看用户信息
   - 可以退出登录

## 路由保护

- 所有页面（除了 `/login` 和 `/register`）都需要登录才能访问
- 未登录用户访问受保护页面会自动跳转到登录页

## 文件结构

```
app/
  api/
    auth/
      [...nextauth]/route.ts    # NextAuth 认证路由
      register/route.ts          # 注册 API
  login/page.tsx                 # 登录页面
  register/page.tsx              # 注册页面

lib/
  prisma.ts                      # Prisma 客户端
  auth.ts                        # NextAuth 配置

prisma/
  schema.prisma                  # 数据库模型定义

components/
  user-menu.tsx                  # 用户菜单组件
  providers.tsx                  # SessionProvider

middleware.ts                    # 路由保护中间件
```

## 数据库模型

- **User**: 用户基本信息（邮箱、密码、姓名）
- **Account**: OAuth 账户（预留，用于未来扩展）
- **Session**: 用户会话
- **VerificationToken**: 验证令牌（预留）

## 故障排除

1. **连接数据库失败**:
   - 检查 MongoDB 服务是否运行
   - 验证 `DATABASE_URL` 是否正确
   - 检查防火墙设置

2. **Prisma 客户端错误**:
   - 运行 `npx prisma generate` 重新生成客户端

3. **认证失败**:
   - 检查 `NEXTAUTH_SECRET` 是否已设置
   - 验证 `NEXTAUTH_URL` 是否正确

## 下一步

- [ ] 添加邮箱验证功能
- [ ] 添加密码重置功能
- [ ] 添加 OAuth 登录（Google, GitHub 等）
- [ ] 添加用户资料页面
- [ ] 添加用户权限管理
