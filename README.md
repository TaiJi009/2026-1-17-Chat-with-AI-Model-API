# AI Model Chat Interface

一个类似 ChatGPT 的网页聊天界面，通过 n8n webhook 与 AI 服务集成，支持自定义系统提示词来定义AI行为。

## 功能特性

- 🔗 **N8N集成**：通过n8n webhook处理所有AI交互，AI逻辑完全在n8n工作流中
- 💬 **多会话管理**：创建、切换、删除多个对话会话
- 📝 **自定义系统提示词**：通过系统提示词定义AI的角色和行为
- 🎨 **深色/浅色主题**：支持主题切换
- 💾 **数据持久化**：使用 localStorage 保存配置和对话历史
- 📱 **响应式设计**：适配手机和电脑端，移动端优化布局

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

1. **配置 N8N Webhook**：
   - 在 n8n 中创建工作流并获取 webhook URL
   - 在网站右侧的"提示词配置"面板中输入 n8n webhook URL
   - 点击保存

2. **配置系统提示词**（可选）：
   - 在右侧面板配置系统提示词
   - 系统提示词会发送给n8n，用于定义AI的角色和行为

3. **创建会话**：点击左侧的"新建会话"按钮

4. **开始对话**：在输入框中输入消息，按 Enter 发送

## N8N 工作流配置

网站会将对话数据发送到 n8n webhook，n8n 处理后返回AI回复。

### 工作流节点配置

- **Webhook节点**：接收网站发送的POST请求
- **AI调用节点**：在n8n中调用AI服务（OpenAI/HTTP Request/Code等）
- **Respond to Webhook节点**：返回JSON响应给网站

详细配置说明请参考：[N8N集成文档](docs/n8n-integration.md)

## 许可证

MIT
