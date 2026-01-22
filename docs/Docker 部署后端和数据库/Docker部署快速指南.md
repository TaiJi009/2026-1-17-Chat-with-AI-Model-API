# Docker部署快速指南

## 概述

本指南提供使用Docker部署账号系统和付费系统的快速步骤，适用于本地开发和生产环境。

## 部署架构

```
┌─────────────────┐
│   前端 (GitHub Pages) │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│  Docker容器 (后端API) │
│  Express + TypeScript │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────┐
│PostgreSQL│ │外部API服务│
│(Docker) │ │微信支付/短信│
└────────┘ └──────────┘
```

## 快速开始

### 1. 安装Docker

**Windows/Mac:**
- 下载并安装 [Docker Desktop](https://www.docker.com/products/docker-desktop/)

**Linux:**
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### 2. 配置环境变量

```bash
cd backend
cp .env.example .env
# 编辑.env文件，填入所有配置
```

### 3. 启动服务

```bash
cd docker
docker-compose up -d
```

### 4. 运行数据库迁移

```bash
docker-compose exec backend npm run migrate
```

### 5. 验证部署

```bash
# 检查服务状态
docker-compose ps

# 检查健康状态
curl http://localhost:3000/health

# 查看日志
docker-compose logs -f
```

## 环境变量配置

### 必需配置

```env
# 数据库
DB_USER=user
DB_PASSWORD=your-password
DB_NAME=chat_app

# JWT
JWT_SECRET=your-secret-key

# 微信支付
WECHAT_APP_ID=your-app-id
WECHAT_MCH_ID=your-merchant-id
WECHAT_API_KEY=your-api-key
WECHAT_NOTIFY_URL=https://your-domain.com/api/payment/wechat/callback

# 腾讯云短信
TENCENT_SMS_SECRET_ID=your-secret-id
TENCENT_SMS_SECRET_KEY=your-secret-key
TENCENT_SMS_APP_ID=your-sms-app-id
TENCENT_SMS_SIGN_NAME=your-sign-name
TENCENT_SMS_TEMPLATE_ID=your-template-id

# CORS（多个域名用逗号分隔）
CORS_ORIGIN=http://localhost:5173,https://your-frontend-domain.com
```

## 常用命令

### 服务管理

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 数据库操作

```bash
# 运行迁移
docker-compose exec backend npm run migrate

# 备份数据库
docker-compose exec postgres pg_dump -U user chat_app > backup.sql

# 恢复数据库
docker-compose exec -T postgres psql -U user chat_app < backup.sql

# 进入数据库
docker-compose exec postgres psql -U user -d chat_app
```

### 容器操作

```bash
# 进入后端容器
docker-compose exec backend sh

# 查看容器资源使用
docker stats

# 重建容器
docker-compose up -d --build
```

## 生产环境部署

### 方式1: Docker托管平台（推荐）

#### Render

1. 访问 [Render](https://render.com)
2. 创建Web Service
3. 选择Docker部署
4. 配置环境变量
5. 部署

**优点:**
- 自动HTTPS
- 免费层可用
- 支持Docker Compose

### 方式2: 本地服务器 + Docker

如果需要在自己的服务器上运行：

1. **安装Docker**
```bash
curl -fsSL https://get.docker.com | sh
```

2. **克隆代码**
```bash
git clone <your-repo>
cd backend
```

3. **配置环境变量**
```bash
cp .env.example .env
nano .env
```

4. **启动服务**
```bash
cd docker
docker-compose up -d
```

5. **配置Nginx（可选，用于自定义域名）**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name api.yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 故障排查

### 问题1: 端口被占用

**解决方案:**
```bash
# 修改docker-compose.yml中的端口
ports:
  - "3001:3000"  # 改为其他端口
```

### 问题2: 数据库连接失败

**检查步骤:**
```bash
# 1. 检查数据库容器是否运行
docker-compose ps

# 2. 检查数据库日志
docker-compose logs postgres

# 3. 测试数据库连接
docker-compose exec postgres psql -U user -d chat_app
```

### 问题3: 构建失败

**解决方案:**
```bash
# 清理缓存重新构建
docker-compose build --no-cache
docker-compose up -d
```

### 问题4: 环境变量未生效

**检查:**
```bash
# 查看容器环境变量
docker-compose exec backend env | grep DB_

# 确保.env文件在backend目录下
ls -la backend/.env
```

## 数据备份

### 自动备份脚本

创建 `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

docker-compose exec -T postgres pg_dump -U user chat_app > $BACKUP_DIR/backup_$DATE.sql

# 保留最近7天的备份
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

### 定时备份（Linux）

```bash
# 添加到crontab
0 2 * * * /path/to/backup.sh
```

## 性能优化

### 1. 资源限制

在 `docker-compose.yml` 中：

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

### 2. 日志管理

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 3. 数据库优化

```yaml
services:
  postgres:
    command:
      - "postgres"
      - "-c"
      - "shared_buffers=256MB"
      - "-c"
      - "max_connections=100"
```

## 安全建议

1. **使用强密码**: 数据库密码、JWT密钥
2. **限制端口暴露**: 生产环境不暴露数据库端口
3. **定期更新**: 更新Docker镜像和依赖
4. **备份数据**: 定期备份数据库
5. **监控日志**: 监控异常访问和错误

## 下一步

- 查看 [完整部署文档](../docs/付费功能与账号系统.md)
- 查看 [API文档](../backend/README.md)
- 查看 [Docker详细配置](../backend/docker/README.md)
