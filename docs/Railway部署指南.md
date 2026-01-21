# Railway 部署指南

本指南将帮助您将后端服务和数据库部署到 Railway 平台，实现本地开发 → GitHub → Railway 自动部署的工作流。

## 目录

- [概述](#概述)
- [前置要求](#前置要求)
- [快速开始](#快速开始)
- [详细步骤](#详细步骤)
- [环境变量配置](#环境变量配置)
- [数据库迁移](#数据库迁移)
- [Railway CLI 使用](#railway-cli-使用)
- [GitHub 集成与自动部署](#github-集成与自动部署)
- [自定义域名](#自定义域名)
- [监控和日志](#监控和日志)
- [故障排查](#故障排查)
- [最佳实践](#最佳实践)

## 概述

Railway 是一个现代化的应用部署平台，支持：

- ✅ 自动检测 Node.js 项目，无需 Dockerfile
- ✅ 自动提供 PostgreSQL 数据库
- ✅ GitHub 集成，代码推送自动部署
- ✅ 自动 SSL 证书和 HTTPS
- ✅ 简单易用的环境变量管理
- ✅ 实时日志查看
- ✅ 支持自定义域名

## 前置要求

- Railway 账号（访问 [railway.app](https://railway.app) 注册）
- GitHub 账号
- 项目代码已推送到 GitHub 仓库
- 微信支付配置信息（如果使用支付功能）
- 腾讯云短信服务配置信息（如果使用短信功能）

## 快速开始

### 1. 创建 Railway 项目并连接 GitHub

1. 登录 [Railway](https://railway.app)
2. 点击 **"New Project"**
3. 选择 **"Deploy from GitHub repo"**
4. 授权 Railway 访问 GitHub（首次需要）
5. 选择您的仓库

### 2. 添加 PostgreSQL 数据库

1. 在 Railway 项目中点击 **"+ New"**
2. 选择 **"Database"** → **"Add PostgreSQL"**
3. Railway 会自动创建数据库并提供 `DATABASE_URL` 环境变量

### 3. 添加后端 Web Service

1. 点击 **"+ New"** → **"GitHub Repo"**
2. 选择同一个仓库
3. 在 **"Root Directory"** 中选择 `backend` 目录
4. Railway 会自动检测为 Node.js 项目

### 4. 配置环境变量

在 Railway 后端服务的 **Settings → Variables** 中添加所有必需的环境变量（见下方[环境变量配置](#环境变量配置)章节）

### 5. 运行数据库迁移

首次部署后，运行数据库迁移：

```bash
railway run npm run migrate
```

或使用 Railway 控制台的终端功能运行迁移。

## 详细步骤

### 步骤 1: 创建 Railway 账号

1. 访问 [railway.app](https://railway.app)
2. 点击 **"Login"** 或 **"Sign Up"**
3. 选择使用 GitHub 账号登录（推荐）

### 步骤 2: 创建新项目

1. 登录后，点击 **"New Project"**
2. 选择 **"Deploy from GitHub repo"**
3. 如果首次使用，需要授权 Railway 访问 GitHub：
   - 点击 **"Configure GitHub App"**
   - 选择要授权的仓库（可以选择所有仓库或特定仓库）
   - 点击 **"Install"**

### 步骤 3: 选择仓库

1. 在仓库列表中选择您的项目仓库
2. Railway 会自动开始检测项目结构

### 步骤 4: 添加 PostgreSQL 数据库

1. 在项目页面点击 **"+ New"**
2. 选择 **"Database"**
3. 选择 **"Add PostgreSQL"**
4. Railway 会自动创建数据库实例
5. 数据库创建后，Railway 会自动创建一个 `DATABASE_URL` 环境变量，其他服务可以使用它

### 步骤 5: 配置后端服务

#### 5.1 添加 Web Service

1. 在项目页面点击 **"+ New"**
2. 选择 **"GitHub Repo"**（选择同一个仓库）
3. Railway 会提示选择服务类型，选择 **"Web Service"**

#### 5.2 设置 Root Directory

1. 在服务的 **Settings → Deploy** 页面
2. 找到 **"Root Directory"** 设置
3. 输入 `backend`
4. Railway 会自动检测为 Node.js 项目

#### 5.3 配置构建和启动命令（可选）

Railway 会自动检测 Node.js 项目，但您可以手动配置：

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

这些配置也可以在 `railway.json` 文件中设置（如果已创建）。

### 步骤 6: 配置环境变量

在服务的 **Settings → Variables** 页面添加环境变量：

#### 必需的环境变量

```env
# 数据库（Railway PostgreSQL 自动提供，使用引用）
DATABASE_URL=${{PostgreSQL.DATABASE_URL}}

# JWT 配置
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=${{PORT}}
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
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

#### 环境变量引用

Railway 支持使用 `${{ServiceName.VariableName}}` 引用其他服务的环境变量：

- `${{PostgreSQL.DATABASE_URL}}` - 引用 PostgreSQL 数据库连接字符串
- `${{PORT}}` - Railway 自动提供的端口号

### 步骤 7: 运行数据库迁移

#### 方法 1: 使用 Railway CLI

```bash
# 安装 Railway CLI
npm i -g @railway/cli

# 登录
railway login

# 链接项目
railway link

# 运行迁移
railway run npm run migrate
```

#### 方法 2: 使用 Railway 控制台

1. 在服务页面点击 **"Deployments"** 标签
2. 找到最新的部署，点击 **"View Logs"**
3. 在部署日志中，点击 **"Open Shell"** 或 **"Terminal"**
4. 运行迁移命令：`npm run migrate`

#### 方法 3: 自动迁移（开发环境）

如果需要在每次部署时自动运行迁移（仅用于开发环境）：

1. 在环境变量中添加 `AUTO_MIGRATE=true`
2. 修改 `backend/src/app.ts` 在启动时检查此变量并运行迁移

⚠️ **注意**: 生产环境建议手动运行迁移，以便更好地控制迁移时机。

### 步骤 8: 验证部署

1. 在服务页面查看部署状态
2. 等待构建完成（通常需要 1-3 分钟）
3. Railway 会提供一个默认域名，格式如：`your-service.railway.app`
4. 访问 `https://your-service.railway.app/health` 验证服务是否正常运行
5. 应该返回 JSON 响应：`{"success":true,"message":"服务运行正常",...}`

## 环境变量配置

### 环境变量列表

| 变量名 | 必需 | 说明 | 示例 |
|--------|------|------|------|
| `DATABASE_URL` | ✅ | PostgreSQL 连接字符串 | `${{PostgreSQL.DATABASE_URL}}` |
| `JWT_SECRET` | ✅ | JWT 密钥 | `your-secret-key` |
| `JWT_EXPIRES_IN` | ❌ | Token 过期时间 | `7d` |
| `PORT` | ✅ | 服务端口（Railway 自动提供） | `${{PORT}}` |
| `NODE_ENV` | ❌ | 运行环境 | `production` |
| `CORS_ORIGIN` | ✅ | 允许的跨域来源 | `https://your-frontend.com` |
| `WECHAT_APP_ID` | ❌ | 微信 AppID | `wx1234567890` |
| `WECHAT_MCH_ID` | ❌ | 微信商户号 | `1234567890` |
| `WECHAT_API_KEY` | ❌ | 微信 API Key | `your-api-key` |
| `WECHAT_NOTIFY_URL` | ❌ | 支付回调 URL | `https://your-domain.com/api/payment/wechat/callback` |
| `WECHAT_SANDBOX` | ❌ | 是否使用沙箱环境 | `false` |
| `TENCENT_SMS_SECRET_ID` | ❌ | 腾讯云 Secret ID | `AKID...` |
| `TENCENT_SMS_SECRET_KEY` | ❌ | 腾讯云 Secret Key | `your-secret-key` |
| `TENCENT_SMS_APP_ID` | ❌ | 短信应用 ID | `1400000000` |
| `TENCENT_SMS_SIGN_NAME` | ❌ | 短信签名 | `您的签名` |
| `TENCENT_SMS_TEMPLATE_ID` | ❌ | 短信模板 ID | `123456` |

### 配置环境变量的最佳实践

1. **使用引用变量**: 对于数据库连接等跨服务变量，使用 `${{ServiceName.VariableName}}` 引用
2. **敏感信息加密**: Railway 会自动加密存储敏感信息
3. **区分环境**: 可以为不同的环境（开发/生产）创建不同的项目
4. **批量导入**: 可以在 Variables 页面使用批量导入功能

## 数据库迁移

### 首次部署迁移

首次部署后，必须运行数据库迁移以创建表结构：

```bash
railway run npm run migrate
```

### 后续迁移

当您修改数据库结构时：

1. 创建新的迁移文件（如 `002_add_new_table.sql`）
2. 更新 `migrations/run-migrations.ts` 以支持多个迁移文件
3. 推送到 GitHub，Railway 会自动重新部署
4. 部署完成后，使用 Railway CLI 运行迁移：
   ```bash
   railway run npm run migrate
   ```

### 迁移策略

- **开发环境**: 可以使用自动迁移（设置 `AUTO_MIGRATE=true`）
- **生产环境**: 建议手动运行迁移，以便：
  - 在迁移前备份数据库
  - 在低峰期运行迁移
  - 验证迁移结果

## Railway CLI 使用

### 安装 CLI

```bash
npm i -g @railway/cli
```

### 登录

```bash
railway login
```

这会打开浏览器进行身份验证。

### 链接项目

```bash
railway link
```

选择要链接的项目和服务。

### 查看日志

```bash
# 查看实时日志
railway logs

# 查看特定服务的日志
railway logs --service backend
```

### 运行命令

```bash
# 运行迁移
railway run npm run migrate

# 运行其他命令
railway run npm run build
```

### 查看环境变量

```bash
# 查看所有环境变量
railway variables

# 添加环境变量
railway variables set KEY=value

# 删除环境变量
railway variables unset KEY
```

### 查看部署状态

```bash
railway status
```

### 打开服务

```bash
# 在浏览器中打开服务
railway open
```

## GitHub 集成与自动部署

### 启用自动部署

Railway 默认已启用自动部署。当您：

1. 推送代码到 GitHub 仓库
2. Railway 检测到推送（通过 Webhook）
3. 自动触发构建和部署流程
4. 部署完成后，服务会自动重启

### 部署分支配置

在服务的 **Settings → Deploy** 页面可以配置：

- **Branch**: 选择要部署的分支（默认：`main`）
- **Root Directory**: 后端代码目录（`backend`）
- **Watch Paths**: 指定哪些文件变更时触发部署（可选）

### 部署流程

```
本地开发
  ↓
git commit
  ↓
git push origin main
  ↓
GitHub 收到推送
  ↓
Railway Webhook 触发
  ↓
Railway 开始构建
  ↓
运行 npm install
  ↓
运行 npm run build
  ↓
部署新版本
  ↓
服务自动重启
```

### 禁用自动部署

如果需要手动控制部署：

1. 在服务 **Settings → Deploy** 页面
2. 找到 **"Auto Deploy"** 选项
3. 关闭自动部署
4. 需要部署时，在 **Deployments** 页面手动触发

### 部署历史

在服务的 **Deployments** 页面可以：

- 查看所有部署历史
- 查看每个部署的日志
- 回滚到之前的版本
- 查看部署时间和状态

## 自定义域名

### 添加自定义域名

1. 在服务 **Settings → Domains** 页面
2. 点击 **"Add Domain"**
3. 输入您的域名（如 `api.yourdomain.com`）
4. Railway 会提供 DNS 配置说明
5. 在您的域名 DNS 设置中添加 CNAME 记录
6. Railway 会自动配置 SSL 证书（通常需要几分钟）

### 更新环境变量

添加自定义域名后，需要更新相关环境变量：

- `CORS_ORIGIN`: 更新为新的前端域名
- `WECHAT_NOTIFY_URL`: 更新为新的回调 URL

### 验证域名

添加域名后，Railway 会显示验证状态。等待 DNS 传播完成后（通常几分钟到几小时），域名就可以使用了。

## 监控和日志

### 查看实时日志

1. 在服务页面点击 **"Deployments"** 标签
2. 找到最新的部署，点击 **"View Logs"**
3. 可以查看实时应用日志

或使用 CLI：

```bash
railway logs -f
```

### 查看指标

Railway 提供基本的监控指标：

- CPU 使用率
- 内存使用率
- 网络流量
- 请求数

在服务页面的 **Metrics** 标签可以查看。

### 日志管理

- Railway 会保留最近一段时间的日志
- 对于长期日志存储，建议使用外部日志服务（如 Logtail、Datadog 等）

## 故障排查

### 常见问题

#### 1. 构建失败

**问题**: 部署时构建失败

**排查步骤**:
1. 查看构建日志，找到错误信息
2. 检查 `package.json` 中的依赖是否正确
3. 确认 Node.js 版本兼容性
4. 检查 `railway.json` 配置（如果使用）

**解决方案**:
- 确保所有依赖都在 `package.json` 中
- 检查 TypeScript 编译错误
- 确认构建命令正确

#### 2. 数据库连接失败

**问题**: 应用无法连接到数据库

**排查步骤**:
1. 检查 `DATABASE_URL` 环境变量是否正确设置
2. 确认使用了 `${{PostgreSQL.DATABASE_URL}}` 引用
3. 查看应用日志中的错误信息

**解决方案**:
- 在 Variables 页面检查 `DATABASE_URL` 是否正确
- 确认 PostgreSQL 服务已启动
- 检查数据库连接字符串格式

#### 3. 端口错误

**问题**: 服务无法启动，端口相关错误

**排查步骤**:
1. 确认代码使用 `process.env.PORT` 而不是硬编码端口
2. 检查环境变量中是否设置了 `PORT`

**解决方案**:
- 代码中应使用 `process.env.PORT || 3000`
- Railway 会自动提供 `PORT` 环境变量，无需手动设置

#### 4. CORS 错误

**问题**: 前端无法访问后端 API

**排查步骤**:
1. 检查 `CORS_ORIGIN` 环境变量是否正确设置
2. 确认前端域名已添加到 `CORS_ORIGIN`

**解决方案**:
- 更新 `CORS_ORIGIN` 为正确的前端域名
- 多个域名用逗号分隔：`https://domain1.com,https://domain2.com`

#### 5. 环境变量未生效

**问题**: 修改环境变量后，应用仍使用旧值

**解决方案**:
- 环境变量修改后，需要重新部署服务
- 可以在 **Deployments** 页面手动触发部署
- 或推送一个空提交到 GitHub 触发自动部署

### 获取帮助

如果遇到其他问题：

1. 查看 Railway 官方文档：https://docs.railway.app
2. 在 Railway Discord 社区寻求帮助
3. 查看项目 GitHub Issues

## 最佳实践

### 1. 安全性

- ✅ 使用强随机字符串作为 `JWT_SECRET`
- ✅ 定期轮换 API 密钥和令牌
- ✅ 不要在代码中硬编码敏感信息
- ✅ 使用环境变量管理所有配置
- ✅ 启用 HTTPS（Railway 自动提供）

### 2. 环境管理

- ✅ 为开发和生产创建不同的 Railway 项目
- ✅ 使用不同的环境变量值
- ✅ 定期备份生产数据库

### 3. 部署流程

- ✅ 使用分支策略（main 分支用于生产）
- ✅ 在合并到 main 前进行充分测试
- ✅ 监控部署后的应用状态
- ✅ 保留部署历史以便回滚

### 4. 数据库管理

- ✅ 定期备份数据库
- ✅ 在生产环境迁移前先在开发环境测试
- ✅ 使用迁移脚本管理数据库变更
- ✅ 避免在生产环境直接修改数据库

### 5. 性能优化

- ✅ 监控应用性能指标
- ✅ 优化数据库查询
- ✅ 使用连接池管理数据库连接
- ✅ 合理设置超时和重试机制

### 6. 成本控制

- Railway 免费套餐有一定限制，注意：
- ✅ 监控资源使用情况
- ✅ 优化应用性能以减少资源消耗
- ✅ 考虑升级到付费计划以获得更多资源

## 总结

Railway 提供了简单易用的部署体验，结合 GitHub 集成可以实现完全自动化的部署流程。通过本指南，您应该能够：

1. ✅ 成功将后端部署到 Railway
2. ✅ 配置 PostgreSQL 数据库
3. ✅ 设置环境变量
4. ✅ 运行数据库迁移
5. ✅ 配置自动部署
6. ✅ 使用自定义域名
7. ✅ 监控和排查问题

如有任何问题，请参考故障排查章节或查阅 Railway 官方文档。
