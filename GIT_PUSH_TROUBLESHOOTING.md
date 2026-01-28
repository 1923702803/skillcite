# Git Push 到 GitHub 问题排查

## 当前错误

```
fatal: unable to access 'https://github.com/1923702803/skillcite.git/': 
Failed to connect to github.com port 443 after 21075 ms: Timed out
```

## 解决方案

### 方案 1: 检查网络连接

1. **测试 GitHub 连接**
   ```powershell
   ping github.com
   ```

2. **检查防火墙设置**
   - 确保防火墙允许 Git 和 HTTPS 连接
   - 如果使用公司网络，可能需要联系 IT 部门

### 方案 2: 使用 SSH 方式（推荐）

如果 HTTPS 方式一直失败，可以改用 SSH：

1. **生成 SSH 密钥**（如果还没有）
   ```powershell
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. **添加 SSH 密钥到 GitHub**
   - 复制公钥内容：`cat ~/.ssh/id_ed25519.pub`
   - 访问：https://github.com/settings/keys
   - 点击 "New SSH key"
   - 粘贴公钥并保存

3. **更改远程仓库 URL 为 SSH**
   ```powershell
   git remote set-url origin git@github.com:1923702803/skillcite.git
   git push -u origin main
   ```

### 方案 3: 使用 GitHub Desktop

1. 下载并安装 [GitHub Desktop](https://desktop.github.com/)
2. 登录您的 GitHub 账户
3. 打开项目文件夹
4. 点击 "Publish repository" 或 "Push origin"

### 方案 4: 使用 GitHub CLI

1. **安装 GitHub CLI**
   ```powershell
   winget install GitHub.cli
   ```

2. **登录**
   ```powershell
   gh auth login
   ```

3. **推送代码**
   ```powershell
   git push -u origin main
   ```

### 方案 5: 配置代理（如果使用代理）

如果您使用代理，需要配置 Git：

```powershell
# 设置 HTTP 代理
git config --global http.proxy http://proxy.example.com:8080
git config --global https.proxy https://proxy.example.com:8080

# 如果不需要代理，取消设置
git config --global --unset http.proxy
git config --global --unset https.proxy
```

### 方案 6: 增加超时时间

```powershell
git config --global http.lowSpeedLimit 0
git config --global http.lowSpeedTime 999999
```

### 方案 7: 分批推送（如果文件很大）

如果项目文件很大，可以尝试分批推送：

```powershell
# 先推送少量文件
git push -u origin main --dry-run

# 如果还是失败，可以尝试压缩历史
git repack -a -d -f --depth=250 --window=250
```

## 临时解决方案

如果以上方法都不行，可以：

1. **使用 GitHub 网页上传**
   - 访问 https://github.com/1923702803/skillcite
   - 点击 "uploading an existing file"
   - 拖拽项目文件上传（注意排除 node_modules 和 .next）

2. **稍后重试**
   - 网络问题可能是暂时的
   - 等待一段时间后重试

3. **使用移动热点**
   - 切换到手机热点网络
   - 可能可以绕过某些网络限制

## 验证配置

检查当前 Git 配置：

```powershell
git config --list
git remote -v
```

## 推荐方案

**最推荐使用 SSH 方式**，因为：
- 更稳定
- 不需要每次输入密码
- 不受 HTTPS 连接问题影响

如果 SSH 配置成功，后续推送会非常顺畅。
