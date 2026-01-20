# Railway部署指南

## 概述

本指南详细说明如何在Railway平台上部署后端服务和PostgreSQL数据库。

## 重要说明

⚠️ **Railway不支持直接部署docker-compose.yml文件**

Railway需要分别部署每个服务。您需要：
1. 创建一个PostgreSQL数据库服务
2. 创建一个后端Web服务
3. 配置环境变量连接两个服务

## 部署架构

```
┌─────────────────┐
│   前端 (GitHub Pages) │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│  Railway后端服务  │
│  (Web Service)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Railway PostgreSQL│
│   (Database)     │
└─────────────────┘
```

## 部署步骤

### 第一步：创建Railway项目

1. 访问 [Railway](https://railway.app)
2. 登录您的账号
3. 点击 "New Project"
4. 选择 "Deploy from GitHub repo"
5. 选择您的仓库：`2026-1-17-Chat-with-AI-Model-API`

### 第二步：创建PostgreSQL数据库服务

1. 在Railway项目中，点击 "+ New"
2. 选择 "Database" → "Add PostgreSQL"
3. Railway会自动创建PostgreSQL服务
4. 等待数据库启动完成

**重要**：记下Railway自动生成的环境变量：
- `DATABASE_URL` - 完整的数据库连接字符串
- `PGHOST` - 数据库主机
- `PGPORT` - 数据库端口
- `PGUSER` - 数据库用户
- `PGPASSWORD` - 数据库密码
- `PGDATABASE` - 数据库名称

### 第三步：创建后端Web服务

1. 在同一个Railway项目中，点击 "+ New"
2. 选择 "GitHub Repo"
3. 选择您的仓库（如果还没选择）
4. Railway会自动检测项目

**配置服务设置**：

1. **Root Directory**：设置为 `backend`
   - 在服务设置中找到 "Root Directory"
   - 输入：`backend`

2. **Build Command**（如果需要）：
   ```bash
   npm install && npm run build
   ```

3. **Start Command**：
   ```bash
   npm start
   ```

4. **Dockerfile路径**（如果使用Docker）：
   - Railway会自动检测 `backend/docker/Dockerfile`
   - 如果检测不到，手动设置：`backend/docker/Dockerfile`

### 第四步：配置环境变量

在后端服务的 "Variables" 标签页中，添加以下环境变量：

#### 必需的环境变量

```env
# 数据库配置（从PostgreSQL服务复制）
DATABASE_URL=postgresql://user:password@host:port/database
# 或者分别设置：
DB_HOST=<从PostgreSQL服务获取>
DB_PORT=<从PostgreSQL服务获取>
DB_USER=<从PostgreSQL服务获取>
DB_PASSWORD=<从PostgreSQL服务获取>
DB_NAME=<从PostgreSQL服务获取>

# JWT配置
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# 服务器配置
# 注意：Railway会自动设置PORT环境变量（通常是8080）
# 应用会自动读取process.env.PORT，无需手动设置
NODE_ENV=production

# CORS配置（替换为您的实际前端域名）
CORS_ORIGIN=https://your-username.github.io,https://your-custom-domain.com
```

#### 微信支付配置（如果使用）

```env
WECHAT_APP_ID=your-app-id
WECHAT_MCH_ID=your-merchant-id
WECHAT_API_KEY=your-api-key
WECHAT_NOTIFY_URL=https://your-railway-domain.railway.app/api/payment/wechat/callback
WECHAT_SANDBOX=false
```

#### 腾讯云短信配置（如果使用）

```env
TENCENT_SMS_SECRET_ID=your-secret-id
TENCENT_SMS_SECRET_KEY=your-secret-key
TENCENT_SMS_APP_ID=your-sms-app-id
TENCENT_SMS_SIGN_NAME=your-sign-name
TENCENT_SMS_TEMPLATE_ID=your-template-id
```

### 第五步：连接数据库服务到后端服务

Railway提供了服务间引用的功能：

1. 在后端服务的 "Variables" 标签页
2. 点击 "Reference Variable"
3. 选择PostgreSQL服务
4. 选择 `DATABASE_URL` 变量
5. Railway会自动创建引用变量

或者，您可以手动复制PostgreSQL服务的环境变量值到后端服务。

### 第六步：运行数据库迁移

部署完成后，需要运行数据库迁移：

1. 在后端服务的 "Settings" 标签页
2. 找到 "Deploy" 部分
3. 在 "Deploy Command" 中添加迁移命令（可选）：

```bash
npm run migrate && npm start
```

或者，使用Railway的CLI工具：

```bash
# 安装Railway CLI
npm i -g @railway/cli

# 登录
railway login

# 链接到项目
railway link

# 运行迁移
railway run npm run migrate
```

### 第七步：生成服务域名

1. 在后端服务的 "Settings" 标签页
2. 找到 "Networking" 部分
3. 点击 "Generate Domain"
4. Railway会自动生成一个HTTPS域名，例如：`your-service.railway.app`

### 第八步：验证部署

1. **检查服务状态**：
   - 在Railway仪表板查看服务状态
   - 确保后端服务和数据库服务都显示为 "Active"

2. **测试健康检查**：
   ```bash
   curl https://your-service.railway.app/health
   ```
   应该返回：
   ```json
   {
     "success": true,
     "message": "服务运行正常",
     "timestamp": "2026-01-17T..."
   }
   ```

3. **查看日志**：
   - 在Railway仪表板点击服务
   - 查看 "Deployments" 标签页的日志
   - 检查是否有错误信息

## 端口配置说明

### Railway的端口处理

- Railway会自动设置 `PORT` 环境变量（通常是 `8080`）
- 您的应用代码已经正确配置：`const PORT = process.env.PORT || 3000`
- 应用会自动监听Railway提供的端口
- **无需手动设置PORT环境变量**

### 如果遇到端口问题

如果服务无法启动，检查：

1. **应用是否监听正确的端口**：
   - 查看日志，确认应用监听的端口
   - 应该显示：`服务器运行在端口 8080`（或Railway设置的其他端口）

2. **健康检查**：
   - Railway会自动使用 `/health` 端点进行健康检查
   - 确保该端点正常工作

## 环境变量配置清单

使用以下清单确保所有环境变量都已配置：

- [ ] `DATABASE_URL` 或数据库相关变量（`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`）
- [ ] `JWT_SECRET`
- [ ] `JWT_EXPIRES_IN`（可选，默认7d）
- [ ] `NODE_ENV=production`
- [ ] `CORS_ORIGIN`（前端域名，多个用逗号分隔）
- [ ] `WECHAT_APP_ID`（如果使用微信支付）
- [ ] `WECHAT_MCH_ID`（如果使用微信支付）
- [ ] `WECHAT_API_KEY`（如果使用微信支付）
- [ ] `WECHAT_NOTIFY_URL`（如果使用微信支付，使用Railway生成的域名）
- [ ] `TENCENT_SMS_*`（如果使用腾讯云短信）

## 常见问题

### 问题1：数据库连接失败

**症状**：日志显示数据库连接错误

**解决方案**：
1. 检查 `DATABASE_URL` 或数据库相关环境变量是否正确
2. 确保PostgreSQL服务已启动
3. 检查网络连接（Railway服务间应该自动连接）

### 问题2：服务无法启动

**症状**：部署失败，服务无法启动

**解决方案**：
1. 查看部署日志，找到错误信息
2. 检查环境变量是否完整
3. 确认 `package.json` 中的 `start` 脚本正确
4. 检查Dockerfile路径是否正确

### 问题3：端口配置错误

**症状**：服务启动但无法访问

**解决方案**：
1. 确认应用使用 `process.env.PORT`（代码已正确配置）
2. 不要手动设置 `PORT` 环境变量，让Railway自动设置
3. 检查服务是否生成了公共域名

### 问题4：CORS错误

**症状**：前端无法访问后端API

**解决方案**：
1. 检查 `CORS_ORIGIN` 环境变量
2. 确保包含所有前端域名（GitHub Pages域名等）
3. 多个域名用逗号分隔：`https://domain1.com,https://domain2.com`

### 问题5：数据库迁移失败

**症状**：迁移命令执行失败

**解决方案**：
1. 使用Railway CLI运行迁移：
   ```bash
   railway run npm run migrate
   ```
2. 检查数据库连接是否正常
3. 查看迁移脚本的日志输出

## 更新部署

当您推送代码到GitHub时，Railway会自动：

1. 检测代码变更
2. 重新构建应用
3. 部署新版本

您可以在Railway仪表板查看部署进度和日志。

## 监控和日志

### 查看日志

1. 在Railway仪表板选择服务
2. 点击 "Deployments" 标签页
3. 选择最新的部署
4. 查看构建和运行日志

### 监控指标

Railway提供基本的监控指标：
- CPU使用率
- 内存使用率
- 网络流量

## 成本说明

Railway提供：
- **免费额度**：$5/月或500小时运行时间
- **付费计划**：按使用量计费

对于小型项目，免费额度通常足够使用。

## 下一步

部署完成后：

1. **更新前端配置**：
   - 将前端API地址更新为Railway生成的域名
   - 更新 `CORS_ORIGIN` 环境变量（如果还没设置）

2. **测试完整流程**：
   - 测试用户注册/登录
   - 测试支付功能（如果已配置）
   - 测试API调用

3. **配置自定义域名**（可选）：
   - 在Railway服务设置中添加自定义域名
   - 配置DNS记录

## 相关文档

- [Docker部署快速指南](./Docker部署快速指南.md) - 本地Docker部署
- [账号功能与付费功能文档](./账号功能与付费功能/0-付费功能与账号系统.md) - 功能说明
