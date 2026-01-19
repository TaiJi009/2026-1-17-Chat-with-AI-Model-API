# 05-API接口文档

## 基础信息

- **Base URL**: `https://your-api-domain.com/api`
- **认证方式**: JWT Token（Bearer Token）
- **Content-Type**: `application/json`

## 认证相关接口

### 1. 发送验证码

**接口**: `POST /api/auth/send-sms`

**请求体**:
```json
{
  "phone": "13800138000"
}
```

**响应**:
```json
{
  "success": true,
  "message": "验证码已发送",
  "data": {
    "expiresIn": 300
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "error": "发送频率过高，请稍后再试"
}
```

### 2. 验证码登录/注册

**接口**: `POST /api/auth/verify-sms`

**请求体**:
```json
{
  "phone": "13800138000",
  "code": "123456"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "phone": "13800138000",
      "isPro": false,
      "proExpiresAt": null
    }
  }
}
```

### 3. 获取当前用户信息

**接口**: `GET /api/auth/me`

**请求头**:
```
Authorization: Bearer {token}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "phone": "13800138000",
    "isPro": true,
    "proExpiresAt": "2024-02-01T00:00:00Z"
  }
}
```

### 4. 刷新Token

**接口**: `POST /api/auth/refresh`

**请求头**:
```
Authorization: Bearer {token}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "token": "new-jwt-token"
  }
}
```

## 支付相关接口

### 1. 创建支付订单

**接口**: `POST /api/payment/create-order`

**请求头**:
```
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "amount": 10.00,
  "product": "pro_monthly"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "orderId": "uuid",
    "amount": 10.00,
    "qrCodeUrl": "weixin://wxpay/bizpayurl?pr=xxx",
    "expiresAt": "2024-01-01T10:05:00Z"
  }
}
```

### 2. 查询订单状态

**接口**: `GET /api/payment/order/:orderId`

**请求头**:
```
Authorization: Bearer {token}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "orderId": "uuid",
    "status": "paid",
    "amount": 10.00,
    "paidAt": "2024-01-01T10:03:00Z",
    "expiresAt": "2024-02-01T00:00:00Z"
  }
}
```

### 3. 查询订阅状态

**接口**: `GET /api/payment/subscription`

**请求头**:
```
Authorization: Bearer {token}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "isPro": true,
    "proExpiresAt": "2024-02-01T00:00:00Z",
    "autoRenew": false
  }
}
```

### 4. 微信支付回调（内部接口）

**接口**: `POST /api/payment/wechat/callback`

**说明**: 此接口由微信支付服务器调用，不需要认证

**请求体**: 微信支付回调XML数据

**响应**: 微信支付要求的XML格式响应

---

**相关文档**:
- [04-数据库设计](./04-数据库设计.md)
- [06-前端实现](./06-前端实现.md)
- [07-后端实现](./07-后端实现.md)
- [返回目录](./00-目录.md)
