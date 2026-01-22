# Railway部署n8n快速检查清单

## 快速开始

按照以下步骤完成n8n部署和集成，预计总时间：30-50分钟

---

## ✅ 阶段1：Railway部署（5-10分钟）

- [ ] 访问 https://railway.app 并登录
- [ ] 点击 "New Project"
- [ ] 选择 "Deploy from Template" 或 "Deploy from Docker Hub"
- [ ] 如果使用模板：搜索 "n8n" 并选择
- [ ] 如果使用Docker：输入 `n8nio/n8n:latest`
- [ ] 点击 "Deploy" 开始部署
- [ ] 等待部署完成（2-5分钟）
- [ ] 记录Railway分配的域名：`https://your-project.railway.app`

---

## ✅ 阶段2：环境变量配置（3-5分钟）

在Railway项目 → Settings → Variables 中添加：

### 必需变量
- [ ] `N8N_CORS_ORIGIN` = `https://your-username.github.io`（替换为你的GitHub用户名）
- [ ] `N8N_PROTOCOL` = `https`
- [ ] `WEBHOOK_URL` = `https://your-project.railway.app/`（替换为你的Railway域名）
- [ ] `TZ` = `Asia/Shanghai`

### 可选变量（推荐）
- [ ] `N8N_BASIC_AUTH_ACTIVE` = `true`
- [ ] `N8N_BASIC_AUTH_USER` = `admin`
- [ ] `N8N_BASIC_AUTH_PASSWORD` = `your-secure-password`
- [ ] `N8N_ENCRYPTION_KEY` = `your-32-character-key`

- [ ] 保存环境变量，等待重新部署完成

---

## ✅ 阶段3：n8n初始化（2-3分钟）

- [ ] 访问Railway分配的域名：`https://your-project.railway.app`
- [ ] 如果设置了基础认证，输入用户名和密码
- [ ] 完成首次管理员账号设置（邮箱、密码）
- [ ] 验证能看到n8n主界面

---

## ✅ 阶段4：n8n工作流配置（10-20分钟）

- [ ] 创建新工作流，命名为 "AI Chat Webhook"
- [ ] 添加Webhook节点
- [ ] 配置Webhook：
  - [ ] HTTP Method: POST
  - [ ] Authentication: None 或 Header Auth
  - [ ] Respond: When Last Node Finishes 或 Using 'Respond to Webhook' Node
- [ ] **复制Production URL**：`https://your-project.railway.app/webhook/xxx`
- [ ] 添加数据处理节点（Code或Set节点）
- [ ] 添加AI模型处理节点（HTTP Request、OpenAI等）
- [ ] 添加响应格式化节点
- [ ] 添加Respond to Webhook节点：
  - [ ] Response Code: 200
  - [ ] Response Headers: Content-Type: application/json
  - [ ] Response Body: `{"content": "{{ $json.content }}"}` 或直接返回文本
- [ ] 测试工作流（使用Test URL）
- [ ] **激活工作流**（右上角开关变为绿色）

---

## ✅ 阶段5：网站端配置（2-3分钟）

- [ ] 访问GitHub Pages网站
- [ ] 打开设置面板 → "N8N配置"标签
- [ ] 输入N8N URL（步骤4中复制的Production URL）
- [ ] URL类型：选择 "Webhook"
- [ ] HTTP方法：选择 "POST"
- [ ] API Key：如果n8n需要认证，输入API Key
- [ ] 点击 "保存配置"
- [ ] **启用N8N模式**（开关变为绿色）

---

## ✅ 阶段6：测试验证（5-10分钟）

### 6.1 n8n可访问性测试
- [ ] 访问 `https://your-project.railway.app` 能正常打开

### 6.2 CORS测试
在浏览器控制台（F12）执行：
```javascript
fetch('https://your-project.railway.app/webhook/your-webhook-id', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userMessage: '测试', messages: [] })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```
- [ ] 没有CORS错误
- [ ] 返回正确的响应数据

### 6.3 端到端测试
- [ ] 在网站聊天框发送消息："你好"
- [ ] 打开浏览器开发者工具（F12）→ Network标签
- [ ] 检查请求：
  - [ ] 请求URL正确
  - [ ] 请求方法为POST
  - [ ] 响应状态码为200
  - [ ] 响应格式正确
- [ ] 收到AI回复并显示在聊天框中
- [ ] 浏览器控制台无错误

---

## 🔧 常见问题快速解决

### CORS错误
- [ ] 检查 `N8N_CORS_ORIGIN` 环境变量是否包含GitHub Pages域名
- [ ] 在Railway中点击 "Redeploy" 重启服务

### 无法访问n8n
- [ ] 检查Railway项目状态是否为 "Active"
- [ ] 查看Railway日志

### Webhook无响应
- [ ] 检查工作流是否激活（开关为绿色）
- [ ] 验证使用的是Production URL（不是Test URL）
- [ ] 查看n8n工作流执行日志

### 响应格式错误
- [ ] 检查Respond to Webhook节点响应格式
- [ ] 确保返回JSON包含 `content` 字段
- [ ] 检查响应头 Content-Type

---

## 📝 重要信息记录

**Railway域名**：
```
https://____________________.railway.app
```

**n8n Webhook Production URL**：
```
https://____________________.railway.app/webhook/____________________
```

**GitHub Pages域名**：
```
https://____________________.github.io
```

**n8n管理员账号**：
- 邮箱：____________________
- 密码：____________________

---

## 🎉 完成！

如果所有检查项都已完成，恭喜！n8n已成功部署并与网站集成。

**下一步**：
- 优化n8n工作流性能
- 添加监控和告警
- 定期备份n8n数据

**参考文档**：
- 详细指南：[Railway部署n8n指南.md](./Railway部署n8n指南.md)
