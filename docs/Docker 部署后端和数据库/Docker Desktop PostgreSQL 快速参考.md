# Docker Desktop PostgreSQL 快速参考

## 一键配置清单

### 基本信息
- **容器名称**: `chat_app_postgres`
- **镜像**: `postgres:15-alpine`（已选择）
- **主机端口**: `5432`

### 环境变量（3个）

```
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=chat_app
```

> ⚠️ **安全提示**：生产环境请使用强密码！

### 数据卷（2个）

| Host Path | Container Path | 说明 |
|-----------|----------------|------|
| `[项目路径]/backend/docker/postgres_data` | `/var/lib/postgresql/data` | 数据持久化（必需） |
| `[项目路径]/backend/migrations` | `/docker-entrypoint-initdb.d` | 初始化脚本（推荐） |

**示例路径**（Windows）：
```
F:\AI Creativity\2026-1-17-Chat-with-AI-Model-API\backend\docker\postgres_data
F:\AI Creativity\2026-1-17-Chat-with-AI-Model-API\backend\migrations
```

## 快速填写步骤

1. ✅ **Container name**: `chat_app_postgres`
2. ✅ **Host port**: `5432`
3. ✅ **Volume 1**: 
   - Host: `[你的项目路径]/backend/docker/postgres_data`
   - Container: `/var/lib/postgresql/data`
4. ✅ **Volume 2**: 
   - Host: `[你的项目路径]/backend/migrations`
   - Container: `/docker-entrypoint-initdb.d`
5. ✅ **Environment variables**:
   - `POSTGRES_USER` = `user`
   - `POSTGRES_PASSWORD` = `password`
   - `POSTGRES_DB` = `chat_app`
6. ✅ 点击 **Run**

## 验证连接

启动后，使用以下信息连接数据库：

- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `chat_app`
- **Username**: `user`
- **Password**: `password`

## 详细文档

完整配置说明请参考：[Docker Desktop PostgreSQL 配置指南](./Docker%20Desktop%20PostgreSQL%20配置指南.md)
