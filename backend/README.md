# 后端服务文档

## 快速开始

### 环境要求
- Node.js 18+
- PostgreSQL 15+

### 安装依赖
```bash
cd backend
npm install
```

### 配置环境变量
复制 `.env.example` 为 `.env` 并填写配置：
```bash
cp .env.example .env
```

### 运行数据库迁移
```bash
npm run migrate
```

### 开发模式运行
```bash
npm run dev
```

### 生产模式构建
```bash
npm run build
npm start
```

## Railway部署

### 环境要求
- Railway 账号
- GitHub 仓库
- PostgreSQL（Railway 自动提供）

### Railway部署步骤

#### 1. 在Railway创建项目
- 访问 [Railway](https://railway.app)
- 创建新项目
- 选择 "Deploy from GitHub repo"
- 授权 Railway 访问 GitHub（首次需要）
- 选择你的仓库

#### 2. 部署后端服务
- 添加 PostgreSQL 服务（Railway会自动提供 `DATABASE_URL`）
- 添加 Web Service，选择后端目录
- Railway会自动检测Node.js项目

#### 3. 配置环境变量
在Railway项目设置中添加以下环境变量：

```env
# 数据库（Railway PostgreSQL自动提供）
DATABASE_URL=${{PostgreSQL.DATABASE_URL}}

# JWT配置
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=7d

# 微信支付配置
WECHAT_APP_ID=your-app-id
WECHAT_MCH_ID=your-merchant-id
WECHAT_API_KEY=your-api-key
WECHAT_NOTIFY_URL=https://your-railway-domain.railway.app/api/payment/wechat/callback
WECHAT_SANDBOX=false

# 腾讯云短信配置
TENCENT_SMS_SECRET_ID=your-secret-id
TENCENT_SMS_SECRET_KEY=your-secret-key
TENCENT_SMS_APP_ID=your-sms-app-id
TENCENT_SMS_SIGN_NAME=your-sign-name
TENCENT_SMS_TEMPLATE_ID=your-template-id

# 服务器配置
PORT=${{PORT}}  # Railway自动提供
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
```

#### 4. 运行数据库迁移
- 首次部署时，使用 Railway CLI 运行：`railway run npm run migrate`
- 或使用 Railway 控制台的终端功能

#### 5. 配置自定义域名（可选）
- 在Railway项目设置中配置自定义域名
- 更新 `WECHAT_NOTIFY_URL` 和 `CORS_ORIGIN`

### Railway CLI 使用

```bash
# 安装Railway CLI
npm i -g @railway/cli

# 登录
railway login

# 连接项目
railway link

# 查看日志
railway logs

# 运行迁移
railway run npm run migrate

# 查看环境变量
railway variables
```

### GitHub 集成与自动部署

Railway 支持 GitHub 集成，实现自动部署：

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "Update code"
   git push origin main
   ```

2. **Railway 自动检测并部署**
   - Railway 通过 Webhook 检测到代码推送
   - 自动触发构建和部署流程
   - 部署完成后服务自动重启

3. **配置部署分支**
   - 在 Railway 服务设置中配置要部署的分支（默认：`main`）
   - 设置 Root Directory 为 `backend`

### 本地开发连接到Railway数据库

本地开发时，可以连接到Railway的数据库：

```bash
# 在Railway项目页面获取数据库连接字符串
# 设置到本地 .env 文件中
DATABASE_URL=postgresql://...
```

或使用 Railway CLI：

```bash
# 获取数据库连接信息
railway variables

# 在本地 .env 文件中使用该 DATABASE_URL
```

### Railway 优势

- ✅ 自动SSL证书和HTTPS
- ✅ 免费PostgreSQL数据库
- ✅ 自动部署（GitHub集成）
- ✅ 简单的环境变量管理
- ✅ 实时日志查看
- ✅ 支持自定义域名

详细部署说明请参考：[Railway 部署指南](../docs/Railway部署指南.md)

### 生产环境注意事项

- **数据备份**: 定期备份PostgreSQL数据库
- **日志管理**: 使用Railway日志功能或集成外部日志服务
- **监控**: 使用Railway提供的指标监控服务状态
- **健康检查**: 确保 `/health` 端点正常工作

## API文档

### 认证接口

#### 发送验证码
```
POST /api/auth/send-sms
Body: { phone: string }
```

#### 验证码登录/注册
```
POST /api/auth/verify-sms
Body: { phone: string, code: string }
Response: { user: User, token: string }
```

#### 获取当前用户信息
```
GET /api/auth/me
Headers: { Authorization: Bearer <token> }
```

#### 刷新Token
```
POST /api/auth/refresh
Headers: { Authorization: Bearer <token> }
```

### 支付接口

#### 创建支付订单
```
POST /api/payment/create-order
Headers: { Authorization: Bearer <token> }
Response: { orderId: string, qrCode: string, amount: number }
```

#### 查询订单状态
```
GET /api/payment/order/:orderId
Headers: { Authorization: Bearer <token> }
```

#### 查询订阅状态
```
GET /api/payment/subscription
Headers: { Authorization: Bearer <token> }
Response: { isPro: boolean, expiresAt: Date | null }
```

#### 微信支付回调
```
POST /api/payment/wechat/callback
Body: (微信支付回调数据)
```

## 数据库结构

详见 `migrations/001_initial.sql`
