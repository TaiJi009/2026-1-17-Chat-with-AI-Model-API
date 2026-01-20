# Railway部署检查清单

使用此清单检查您的Railway部署状态和配置。

## 服务检查

### 1. 服务数量检查

- [ ] **PostgreSQL数据库服务**已创建并运行
  - 状态：Active/Inactive
  - 服务名称：_________________

- [ ] **后端Web服务**已创建并运行
  - 状态：Active/Inactive
  - 服务名称：_________________
  - Root Directory：`backend` 或 `backend/docker`

### 2. 服务状态

- [ ] 两个服务都显示为 "Active"（绿色）
- [ ] 没有错误或警告提示
- [ ] 最近的部署都成功完成

## 环境变量检查

### 数据库环境变量

在后端服务的 "Variables" 标签页检查：

- [ ] `DATABASE_URL` 已设置
  - 值：`postgresql://...`（从PostgreSQL服务引用或复制）
  
  或分别设置：
- [ ] `DB_HOST` 已设置
- [ ] `DB_PORT` 已设置（通常是5432）
- [ ] `DB_USER` 已设置
- [ ] `DB_PASSWORD` 已设置
- [ ] `DB_NAME` 已设置

### 应用环境变量

- [ ] `JWT_SECRET` 已设置（强密码，不要使用默认值）
- [ ] `JWT_EXPIRES_IN` 已设置（可选，默认7d）
- [ ] `NODE_ENV=production` 已设置
- [ ] `CORS_ORIGIN` 已设置（包含前端域名）

### 端口配置

- [ ] **不要手动设置** `PORT` 环境变量
- [ ] Railway会自动设置 `PORT`（通常是8080）
- [ ] 应用代码使用 `process.env.PORT || 3000`（已正确配置）

### 可选环境变量（根据功能需求）

如果使用微信支付：
- [ ] `WECHAT_APP_ID` 已设置
- [ ] `WECHAT_MCH_ID` 已设置
- [ ] `WECHAT_API_KEY` 已设置
- [ ] `WECHAT_NOTIFY_URL` 已设置（使用Railway生成的域名）
- [ ] `WECHAT_SANDBOX` 已设置（false用于生产环境）

如果使用腾讯云短信：
- [ ] `TENCENT_SMS_SECRET_ID` 已设置
- [ ] `TENCENT_SMS_SECRET_KEY` 已设置
- [ ] `TENCENT_SMS_APP_ID` 已设置
- [ ] `TENCENT_SMS_SIGN_NAME` 已设置
- [ ] `TENCENT_SMS_TEMPLATE_ID` 已设置

## 网络配置检查

### 后端服务网络

- [ ] 已生成公共域名
  - 域名：`https://_________________.railway.app`
- [ ] 域名可以访问（在浏览器中打开）
- [ ] HTTPS自动配置（Railway自动处理）

### 端口配置

- [ ] 在 "Settings" → "Networking" 中检查端口
- [ ] 如果显示端口8080，这是正常的（Railway自动设置）
- [ ] 应用会自动监听这个端口

## 数据库迁移检查

- [ ] 数据库迁移已运行
  - 使用Railway CLI：`railway run npm run migrate`
  - 或通过部署命令自动运行

- [ ] 迁移成功完成
  - 检查日志确认没有错误
  - 数据库表已创建

## 功能测试检查

### 健康检查

- [ ] 访问 `https://your-domain.railway.app/health`
- [ ] 返回JSON响应：
  ```json
  {
    "success": true,
    "message": "服务运行正常",
    "timestamp": "..."
  }
  ```

### API测试

- [ ] 测试用户注册API
  - 端点：`POST /api/auth/register`
- [ ] 测试用户登录API
  - 端点：`POST /api/auth/login`
- [ ] 测试支付API（如果已配置）
  - 端点：`POST /api/payment/create`

## 日志检查

### 后端服务日志

- [ ] 查看 "Deployments" 标签页的日志
- [ ] 没有错误信息
- [ ] 看到 "服务器运行在端口 XXXX" 消息
- [ ] 数据库连接成功（没有连接错误）

### 数据库服务日志

- [ ] PostgreSQL服务日志正常
- [ ] 没有连接错误或权限错误

## 常见问题检查

### 问题1：服务无法启动

检查项：
- [ ] 环境变量是否完整
- [ ] `package.json` 中的 `start` 脚本是否正确
- [ ] Dockerfile路径是否正确（如果使用Docker）
- [ ] 构建日志是否有错误

### 问题2：数据库连接失败

检查项：
- [ ] `DATABASE_URL` 或数据库环境变量是否正确
- [ ] PostgreSQL服务是否运行
- [ ] 网络连接是否正常（Railway服务间应该自动连接）

### 问题3：端口问题

检查项：
- [ ] 应用使用 `process.env.PORT`（代码已正确配置）
- [ ] 没有手动设置 `PORT` 环境变量
- [ ] Railway自动设置的端口与应用监听端口一致

### 问题4：CORS错误

检查项：
- [ ] `CORS_ORIGIN` 环境变量包含前端域名
- [ ] 多个域名用逗号分隔
- [ ] 域名格式正确（包含 `https://`）

## 部署配置检查

### 构建配置

- [ ] Root Directory：`backend`（如果从根目录部署）
- [ ] Build Command（如果需要）：`npm install && npm run build`
- [ ] Start Command：`npm start`

### Docker配置（如果使用）

- [ ] Dockerfile路径：`backend/docker/Dockerfile`
- [ ] Railway正确检测到Dockerfile
- [ ] 构建成功完成

## 安全检查

- [ ] `JWT_SECRET` 不是默认值
- [ ] 数据库密码足够强
- [ ] 敏感信息不在代码中（使用环境变量）
- [ ] HTTPS已启用（Railway自动处理）

## 性能检查

- [ ] 服务响应时间正常（< 1秒）
- [ ] 健康检查端点快速响应
- [ ] 没有内存泄漏（查看监控指标）

## 下一步行动

完成检查后：

1. **如果所有检查项都通过**：
   - ✅ 部署成功！
   - 更新前端API地址
   - 开始使用服务

2. **如果有未通过的检查项**：
   - 参考 [Railway部署指南](./Railway部署指南.md) 中的"常见问题"部分
   - 查看Railway日志找出问题
   - 修复问题后重新检查

## 记录信息

记录以下信息以便后续参考：

- Railway项目名称：_________________
- 后端服务域名：`https://_________________.railway.app`
- PostgreSQL服务名称：_________________
- 部署日期：_________________
- 备注：_________________

---

**提示**：定期检查此清单，确保部署配置保持最新和正确。
