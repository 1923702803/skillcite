# GitHub 上传指南

## 📤 快速上传步骤

### 方法一：使用命令行（推荐）

1. **在 GitHub 创建新仓库**
   - 访问 https://github.com/new
   - 仓库名称：`skillcite`（或您喜欢的名称）
   - 选择 Public 或 Private
   - **不要**勾选任何初始化选项
   - 点击 "Create repository"

2. **复制仓库 URL**
   - 创建后会显示仓库 URL，类似：`https://github.com/YOUR_USERNAME/skillcite.git`

3. **在项目目录执行以下命令**

   ```powershell
   # 添加远程仓库（替换 YOUR_USERNAME 和 skillcite 为您的实际值）
   git remote add origin https://github.com/YOUR_USERNAME/skillcite.git
   
   # 重命名分支为 main（如果当前是 master）
   git branch -M main
   
   # 推送代码
   git push -u origin main
   ```

4. **如果提示需要认证**
   - 用户名：您的 GitHub 用户名
   - 密码：使用 GitHub Personal Access Token（不是账户密码）
   - 如何创建 Token：
     1. 访问 https://github.com/settings/tokens
     2. 点击 "Generate new token" → "Generate new token (classic)"
     3. 勾选 `repo` 权限
     4. 点击 "Generate token"
     5. 复制生成的 token（只显示一次，请保存好）

### 方法二：使用 GitHub Desktop

1. 下载并安装 [GitHub Desktop](https://desktop.github.com/)
2. 登录您的 GitHub 账户
3. 点击 "File" → "Add Local Repository"
4. 选择项目目录
5. 点击 "Publish repository"
6. 输入仓库名称，选择 Public/Private
7. 点击 "Publish Repository"

### 方法三：使用 VS Code

1. 在 VS Code 中打开项目
2. 点击左侧源代码管理图标
3. 点击 "..." → "Remote" → "Add Remote"
4. 输入远程名称：`origin`
5. 输入远程 URL：`https://github.com/YOUR_USERNAME/skillcite.git`
6. 点击 "Publish Branch"

## ✅ 验证上传

上传成功后，访问 `https://github.com/YOUR_USERNAME/skillcite` 应该能看到所有文件。

## 🔄 后续更新

每次修改代码后，使用以下命令推送更新：

```powershell
git add .
git commit -m "描述您的更改"
git push origin main
```

## 📝 注意事项

- ✅ `.env.local` 文件已被 `.gitignore` 忽略，不会上传
- ✅ `node_modules` 和 `.next` 目录也不会上传
- ✅ 所有源代码和配置文件都会上传
- ⚠️ 确保没有敏感信息在代码中硬编码

## 🚀 下一步

上传到 GitHub 后，请参考 [DEPLOYMENT.md](./DEPLOYMENT.md) 进行 Vercel 部署。
