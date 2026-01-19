# AI Model Chat Interface

一个功能完整的 AI 聊天应用，支持多模型提供商、账号系统、付费订阅和自定义提示词工程。类似 ChatGPT 的用户体验，通过 N8N Webhook 或直接 API 调用与 AI 服务集成。

## 功能特性

- 💬 **多会话管理**：创建、切换、删除、置顶多个对话会话
- 🤖 **多模型支持**：智谱 GLM、OpenAI、Claude、通义千问、文心一言、Spark、豆包等
- 📝 **自定义系统提示词**：通过系统提示词定义 AI 的角色和行为
- 🎨 **主题切换**：支持深色/浅色主题，Pro 用户可使用日间模式
- 📱 **响应式设计**：完美适配手机和电脑端
- 🔄 **流式输出**：支持 AI 回复的流式输出，实时显示生成内容
- 📱 **手机号登录**：支持手机号验证码登录/注册
- 💳 **微信支付**：支持微信扫码支付，10元/月订阅 Pro 功能
- 📊 **订单管理**：查看订单状态和订阅信息

## 技术栈

**前端**：React 18 + TypeScript + Vite + Tailwind CSS  
**后端**：Node.js + Express + TypeScript + PostgreSQL  
**部署**：GitHub Pages（前端）+ Docker（后端）  
**认证**：JWT Token  
**支付**：微信支付 Native 支付  
**短信**：腾讯云短信服务

## 快速开始

### 前端开发

```bash
npm install
npm run dev
```

开发服务器运行在 `http://localhost:5173`

### 后端开发

```bash
cd backend
npm install
npm run migrate  # 首次启动需要
npm run dev
```

后端服务器运行在 `http://localhost:3000`

### Docker 部署（推荐）

```bash
cd backend/docker
docker-compose up -d
```

详细部署说明请参考：[Docker 部署快速指南](docs/Docker部署快速指南.md)

## 配置说明

### 后端环境变量

在 `backend/` 目录下创建 `.env` 文件，配置以下关键项：

```env
# 数据库配置
DB_HOST=postgres
DB_PORT=5432
DB_USER=user
DB_PASSWORD=your-secure-password
DB_NAME=chat_app

# JWT 配置
JWT_SECRET=your-secret-key-change-this

# 微信支付配置
WECHAT_APP_ID=your-app-id
WECHAT_MCH_ID=your-merchant-id
WECHAT_API_KEY=your-api-key

# 腾讯云短信配置
TENCENT_SMS_SECRET_ID=your-secret-id
TENCENT_SMS_SECRET_KEY=your-secret-key
```

完整配置说明请参考：[账号功能与付费功能文档](docs/账号功能与付费功能/)

### AI API 配置

在网站右侧的"API 配置"面板中：
1. 选择 AI 模型提供商（智谱、OpenAI、Claude 等）
2. 输入对应的 API Key
3. 点击保存

或配置 N8N Webhook，详细说明请参考：[N8N Webhook 集成指南](docs/N8N%20Webhook%20集成指南.md)

## 部署

### 前端部署

1. 将代码推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. GitHub Actions 会自动构建和部署

### 后端部署

使用 Docker Compose 一键部署：

```bash
cd backend/docker
docker-compose up -d
```

或使用 Docker 托管平台（Railway、Render、Fly.io 等），详细说明请参考：[Docker 部署快速指南](docs/Docker部署快速指南.md)

## 文档

- [项目概述](docs/账号功能与付费功能/01-项目概述.md) - 功能目标和技术选型
- [技术架构](docs/账号功能与付费功能/02-技术架构.md) - 系统架构和数据流向
- [系统流程](docs/账号功能与付费功能/03-系统流程.md) - 登录、支付和权限控制流程
- [API 接口文档](docs/账号功能与付费功能/05-API接口文档.md) - 认证和支付接口说明
- [Docker 部署快速指南](docs/Docker部署快速指南.md) - Docker 部署详细说明
- [N8N Webhook 集成指南](docs/N8N%20Webhook%20集成指南.md) - N8N 工作流配置说明
- [提示词工程](prompt-engineering/README.md) - 提示词工程文档

## 贡献

欢迎提交 Issue 或 Pull Request！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License
