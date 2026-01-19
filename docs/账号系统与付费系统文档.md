# 账号系统与付费系统文档

## 概述

本文档详细描述了AI聊天应用的账号系统和付费系统的技术架构、实现细节和使用说明。

## 目录

1. [系统架构](#系统架构)
2. [技术栈](#技术栈)
3. [数据库设计](#数据库设计)
4. [API接口](#api接口)
5. [前端集成](#前端集成)
6. [部署指南](#部署指南)
7. [安全考虑](#安全考虑)

## 系统架构

### 整体架构图

```
┌─────────────────┐
│   前端 (React)   │
│  GitHub Pages    │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│   后端 API       │
│ Express + TS     │
│ 腾讯云CVM+Docker │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────┐
│PostgreSQL│ │微信支付API│
│ (Docker) │ │腾讯云短信│
└────────┘ └──────────┘
```

### 数据流

1. **用户登录流程**
   - 用户输入手机号 → 前端调用发送验证码API
   - 后端调用腾讯云短信服务发送验证码
   - 用户输入验证码 → 前端调用验证登录API
   - 后端验证码验证，生成JWT Token
   - 前端保存Token，更新用户状态

2. **支付流程**
   - 用户点击升级Pro → 前端调用创建订单API
   - 后端创建订单，调用微信支付生成二维码
   - 前端显示二维码，轮询订单状态
   - 用户扫码支付 → 微信支付回调后端
   - 后端更新订单和用户Pro状态
   - 前端检测到支付成功，更新UI

## 技术栈

### 后端
- **框架**: Express.js
- **语言**: TypeScript
- **数据库**: PostgreSQL 15
- **认证**: JWT (jsonwebtoken)
- **支付**: 微信支付 Native支付
- **短信**: 腾讯云短信服务
- **部署**: Docker + Docker Compose

### 前端
- **框架**: React 18 + TypeScript
- **状态管理**: Context API
- **HTTP客户端**: Fetch API
- **UI**: Tailwind CSS

## 数据库设计

### 用户表 (users)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| phone | VARCHAR(11) | 手机号（唯一） |
| wechat_openid | VARCHAR(128) | 微信OpenID（唯一，预留） |
| password_hash | VARCHAR(255) | 密码哈希（预留） |
| is_pro | BOOLEAN | 是否为Pro用户 |
| pro_expires_at | TIMESTAMP | Pro到期时间 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 订单表 (orders)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户ID（外键） |
| amount | DECIMAL(10,2) | 金额 |
| status | VARCHAR(20) | 状态：pending/paid/failed/refunded |
| payment_method | VARCHAR(20) | 支付方式 |
| wechat_order_id | VARCHAR(64) | 微信订单号 |
| wechat_transaction_id | VARCHAR(64) | 微信交易号 |
| created_at | TIMESTAMP | 创建时间 |
| paid_at | TIMESTAMP | 支付时间 |
| expires_at | TIMESTAMP | Pro到期时间 |

### 短信验证码表 (sms_codes)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| phone | VARCHAR(11) | 手机号 |
| code | VARCHAR(6) | 验证码 |
| expires_at | TIMESTAMP | 过期时间 |
| used | BOOLEAN | 是否已使用 |
| created_at | TIMESTAMP | 创建时间 |

## API接口

### 认证接口

#### 1. 发送验证码
```http
POST /api/auth/send-sms
Content-Type: application/json

{
  "phone": "13800138000"
}
```

**响应**:
```json
{
  "success": true,
  "message": "验证码已发送"
}
```

#### 2. 验证码登录/注册
```http
POST /api/auth/verify-sms
Content-Type: application/json

{
  "phone": "13800138000",
  "code": "123456"
}
```

**响应**:
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": "uuid",
      "phone": "13800138000",
      "isPro": false,
      "proExpiresAt": null
    },
    "token": "jwt-token"
  }
}
```

#### 3. 获取当前用户信息
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "phone": "13800138000",
    "isPro": false,
    "proExpiresAt": null,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 支付接口

#### 1. 创建支付订单
```http
POST /api/payment/create-order
Authorization: Bearer <token>
```

**响应**:
```json
{
  "success": true,
  "message": "订单创建成功",
  "data": {
    "orderId": "uuid",
    "qrCode": "wechat-qr-code-url",
    "amount": 10.00
  }
}
```

#### 2. 查询订单状态
```http
GET /api/payment/order/:orderId
Authorization: Bearer <token>
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "amount": 10.00,
    "status": "paid",
    "createdAt": "2024-01-01T00:00:00Z",
    "paidAt": "2024-01-01T00:00:01Z",
    "expiresAt": "2024-02-01T00:00:00Z"
  }
}
```

#### 3. 查询订阅状态
```http
GET /api/payment/subscription
Authorization: Bearer <token>
```

**响应**:
```json
{
  "success": true,
  "data": {
    "isPro": true,
    "expiresAt": "2024-02-01T00:00:00Z"
  }
}
```

## 前端集成

### 组件结构

```
src/
├── contexts/
│   ├── AppContext.tsx      # 应用状态管理
│   └── AuthContext.tsx     # 认证状态管理
├── components/
│   ├── LoginModal.tsx      # 登录弹窗
│   ├── PaymentModal.tsx    # 支付弹窗
│   ├── ThemeToggle.tsx     # 主题切换（含Pro检查）
│   └── UserMenu.tsx        # 用户菜单
├── services/
│   ├── authService.ts      # 认证服务
│   └── paymentService.ts   # 支付服务
└── utils/
    └── apiClient.ts        # API客户端
```

### 使用示例

#### 登录
```typescript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { login, isAuthenticated, user } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login('13800138000', '123456');
    } catch (error) {
      console.error('登录失败:', error);
    }
  };
}
```

#### 支付
```typescript
import { PaymentService } from './services/paymentService';

const order = await PaymentService.createOrder();
// 显示二维码
// 轮询订单状态
```

## 部署指南

### 1. 服务器准备
- 腾讯云CVM（2核4G起步）
- 安装Docker和Docker Compose
- 配置域名和SSL证书

### 2. 环境变量配置
在服务器上创建 `.env` 文件：
```env
DATABASE_URL=postgresql://user:password@postgres:5432/chat_app
JWT_SECRET=your-secret-key
WECHAT_APP_ID=your-app-id
WECHAT_MCH_ID=your-merchant-id
WECHAT_API_KEY=your-api-key
TENCENT_SMS_SECRET_ID=your-secret-id
TENCENT_SMS_SECRET_KEY=your-secret-key
```

### 3. 部署步骤
```bash
# 1. 克隆代码
git clone <repository>
cd backend

# 2. 构建Docker镜像
docker-compose build

# 3. 运行数据库迁移
docker-compose run backend npm run migrate

# 4. 启动服务
docker-compose up -d
```

### 4. Nginx配置
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 安全考虑

1. **JWT Token安全**
   - 使用强密钥
   - 设置合理的过期时间
   - 考虑使用HTTP-only Cookie

2. **支付安全**
   - 验证微信支付回调签名
   - 防止重复处理回调
   - 订单状态检查

3. **数据库安全**
   - 使用参数化查询防止SQL注入
   - 定期备份数据库
   - 限制数据库访问权限

4. **API安全**
   - CORS配置
   - 请求频率限制
   - 输入验证

## 功能说明

### 免费功能
- 夜间模式（dark主题）- 默认主题
- 基础聊天功能
- 对话历史（localStorage）

### Pro功能（10元/月）
- 日间模式（light主题）
- 更多功能即将推出

## 后续优化

1. 微信登录集成
2. 对话数据云端同步
3. 订阅管理页面
4. 邮件通知
5. 管理后台
