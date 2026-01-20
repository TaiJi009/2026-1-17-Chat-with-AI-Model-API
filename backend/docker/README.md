# Docker 部署指南

## 快速开始

### 前置要求

- Docker Desktop (Windows/Mac) 或 Docker Engine (Linux)
- Docker Compose 2.0+

### 一键启动

```bash
cd backend/docker
docker-compose up -d
```

### 查看日志

```bash
docker-compose logs -f
```

### 停止服务

```bash
docker-compose down
```

### 使用 Docker Desktop GUI

如果你更喜欢使用 Docker Desktop 的图形界面来运行 PostgreSQL 容器，请参考：

- [Docker Desktop PostgreSQL 快速参考](../../docs/Docker%20Desktop%20PostgreSQL%20快速参考.md) - 快速配置清单
- [Docker Desktop PostgreSQL 配置指南](../../docs/Docker%20Desktop%20PostgreSQL%20配置指南.md) - 详细配置说明

## 配置说明

### 环境变量

在 `backend/` 目录下创建 `.env` 文件（参考 `.env.example`）：

```env
# 数据库配置
DB_USER=user
DB_PASSWORD=your-secure-password
DB_NAME=chat_app
DB_PORT=5432

# JWT配置
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=7d

# 微信支付配置
WECHAT_APP_ID=your-app-id
WECHAT_MCH_ID=your-merchant-id
WECHAT_API_KEY=your-api-key
WECHAT_NOTIFY_URL=https://your-domain.com/api/payment/wechat/callback
WECHAT_SANDBOX=false

# 腾讯云短信配置
TENCENT_SMS_SECRET_ID=your-secret-id
TENCENT_SMS_SECRET_KEY=your-secret-key
TENCENT_SMS_APP_ID=your-sms-app-id
TENCENT_SMS_SIGN_NAME=your-sign-name
TENCENT_SMS_TEMPLATE_ID=your-template-id

# 服务器配置
PORT=3000
NODE_ENV=production
CORS_ORIGIN=http://localhost:5173,https://your-frontend-domain.com
```

### 数据库迁移

首次启动后，运行数据库迁移：

```bash
docker-compose exec backend npm run migrate
```

## 服务管理

### 重启服务

```bash
docker-compose restart
```

### 重启特定服务

```bash
docker-compose restart backend
docker-compose restart postgres
```

### 查看服务状态

```bash
docker-compose ps
```

### 进入容器

```bash
# 进入后端容器
docker-compose exec backend sh

# 进入数据库容器
docker-compose exec postgres psql -U user -d chat_app
```

## 数据管理

### 备份数据库

```bash
docker-compose exec postgres pg_dump -U user chat_app > backup.sql
```

### 恢复数据库

```bash
docker-compose exec -T postgres psql -U user chat_app < backup.sql
```

### 清理数据（谨慎使用）

```bash
# 停止并删除容器和数据卷
docker-compose down -v
```

## 生产环境优化

### 资源限制

在 `docker-compose.yml` 中添加资源限制：

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### 日志配置

配置日志轮转：

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 故障排查

### 查看容器日志

```bash
# 所有服务日志
docker-compose logs

# 特定服务日志
docker-compose logs backend
docker-compose logs postgres

# 实时日志
docker-compose logs -f backend
```

### 检查容器状态

```bash
docker-compose ps
docker ps
```

### 检查健康状态

```bash
# 后端健康检查
curl http://localhost:3000/health

# 数据库连接测试
docker-compose exec backend npm run migrate
```

### 常见问题

1. **端口被占用**
   - 修改 `docker-compose.yml` 中的端口映射
   - 或停止占用端口的服务

2. **数据库连接失败**
   - 检查数据库容器是否运行：`docker-compose ps`
   - 检查环境变量配置
   - 查看数据库日志：`docker-compose logs postgres`

3. **构建失败**
   - 清理构建缓存：`docker-compose build --no-cache`
   - 检查 Dockerfile 语法

4. **权限问题**
   - 确保 `.env` 文件权限正确
   - Linux系统检查文件所有者

## Docker托管平台部署

### Render

1. 创建新的Web Service
2. 选择Docker部署
3. 设置Dockerfile路径：`backend/docker/Dockerfile`
4. 配置环境变量
5. 部署

### Fly.io

1. 安装flyctl：`curl -L https://fly.io/install.sh | sh`
2. 登录：`fly auth login`
3. 初始化：`fly launch`
4. 部署：`fly deploy`

## 监控和维护

### 查看资源使用

```bash
docker stats
```

### 清理未使用的资源

```bash
# 清理未使用的镜像
docker image prune

# 清理所有未使用的资源
docker system prune -a
```

### 更新服务

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build
```
