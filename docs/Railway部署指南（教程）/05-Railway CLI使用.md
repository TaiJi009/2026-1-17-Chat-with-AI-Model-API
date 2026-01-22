# Railway CLI 使用

Railway CLI 是一个命令行工具，可以帮助您管理 Railway 项目和服务。

## 安装 CLI

```bash
npm i -g @railway/cli
```

## 登录

```bash
railway login
```

这会打开浏览器进行身份验证。

## 链接项目

```bash
railway link
```

选择要链接的项目和服务。

## 查看日志

```bash
# 查看实时日志
railway logs

# 查看特定服务的日志
railway logs --service backend
```

## 运行命令

```bash
# 运行迁移
railway run npm run migrate

# 运行其他命令
railway run npm run build

# 运行自定义命令
railway run node scripts/your-script.js
```

## 查看环境变量

```bash
# 查看所有环境变量
railway variables

# 添加环境变量
railway variables set KEY=value

# 删除环境变量
railway variables unset KEY
```

## 查看部署状态

```bash
railway status
```

## 打开服务

```bash
# 在浏览器中打开服务
railway open
```

## 常用命令总结

| 命令 | 说明 |
|------|------|
| `railway login` | 登录 Railway 账号 |
| `railway link` | 链接到项目或服务 |
| `railway logs` | 查看实时日志 |
| `railway run <command>` | 在服务环境中运行命令 |
| `railway variables` | 查看环境变量 |
| `railway variables set KEY=value` | 设置环境变量 |
| `railway variables unset KEY` | 删除环境变量 |
| `railway status` | 查看部署状态 |
| `railway open` | 在浏览器中打开服务 |

## 使用场景

### 运行数据库迁移

```bash
railway run npm run migrate
```

### 查看实时日志

```bash
railway logs -f
```

### 批量设置环境变量

```bash
railway variables set JWT_SECRET=your-secret
railway variables set CORS_ORIGIN=https://your-domain.com
```

### 检查服务状态

```bash
railway status
```

## 相关文档

- [数据库迁移](04-数据库迁移.md) - 使用 CLI 运行迁移
- [环境变量配置](03-环境变量配置.md) - 使用 CLI 管理环境变量
- [监控和日志](08-监控和日志.md) - 查看日志的更多方法
