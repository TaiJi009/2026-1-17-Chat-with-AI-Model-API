# 后端服务文档

## 快速开始

### 环境要求
- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose (可选)

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

## Docker部署

### 使用Docker Compose
```bash
cd backend/docker
docker-compose up -d
```

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
