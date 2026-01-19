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

### 本地Docker部署

#### 1. 配置环境变量
```bash
cd backend
cp .env.example .env
# 编辑.env文件，填入所有配置
```

#### 2. 启动服务
```bash
cd docker
docker-compose up -d
```

#### 3. 运行数据库迁移
```bash
docker-compose exec backend npm run migrate
```

#### 4. 查看日志
```bash
docker-compose logs -f
```

#### 5. 停止服务
```bash
docker-compose down
```

#### 6. 清理数据（谨慎使用）
```bash
docker-compose down -v  # 会删除所有数据卷
```

### Docker托管平台部署

#### Railway部署
1. 在Railway创建新项目
2. 连接GitHub仓库
3. 配置环境变量（从.env.example复制）
4. Railway自动检测docker-compose.yml并部署
5. 获取自动分配的HTTPS域名

#### Render部署
1. 创建新的Web Service
2. 连接GitHub仓库
3. 使用Docker部署方式
4. 配置环境变量
5. 部署后自动提供HTTPS域名

### 生产环境注意事项

- **数据备份**: 定期备份PostgreSQL数据卷
- **日志管理**: 配置日志轮转和监控
- **资源限制**: 在docker-compose.yml中配置资源限制
- **健康检查**: 确保健康检查端点正常工作

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
