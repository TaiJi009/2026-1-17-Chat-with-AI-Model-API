# AI Model Chat Interface

一个类似 ChatGPT 的网页聊天界面，支持通过 API 配置与任意 AI 模型对话，并支持自定义系统提示词和用户提示词模板。

## 功能特性

- 🔌 **多API格式支持**：支持 OpenAI、Anthropic 等格式的 API
- 💬 **多会话管理**：创建、切换、删除多个对话会话
- 📝 **自定义提示词**：系统提示词和用户提示词模板，支持变量替换
- 🌊 **流式输出**：实时显示 AI 回复（打字机效果）
- 🎨 **深色/浅色主题**：支持主题切换
- 💾 **数据持久化**：使用 localStorage 保存配置和对话历史
- 📱 **响应式设计**：适配不同屏幕尺寸

## 技术栈

- React 18 + TypeScript
- Vite
- Tailwind CSS
- react-markdown (Markdown 渲染)
- react-syntax-highlighter (代码高亮)

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 部署到 GitHub Pages

1. 将代码推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. GitHub Actions 会自动构建和部署

访问地址：`https://[username].github.io/2026-1-17-Chat-with-AI-Model-API/`

## 使用说明

1. **配置 API**：在顶部输入 API 端点 URL 和 API Key，选择 API 格式
2. **创建会话**：点击左侧的"新建会话"按钮
3. **开始对话**：在输入框中输入消息，按 Enter 发送
4. **配置提示词**：在右侧面板配置系统提示词和用户提示词模板

## 提示词模板变量

- `{{user_input}}` - 用户输入的消息
- `{{date}}` - 当前日期
- `{{time}}` - 当前时间

## 许可证

MIT
