# Railway部署n8n完整指南

## 概述
使用Railway官方模板一键部署n8n，无需Docker配置，自动提供HTTPS和域名，快速集成到GitHub Pages前端网站。

## 架构流程
```
GitHub Pages前端 → HTTPS → Railway n8n (Webhook) → n8n处理 → Respond to Webhook → 前端显示
```

## 阶段1：Railway模板部署（5-10分钟）

### 步骤1.1：访问Railway并登录
1. 访问 https://railway.app
2. 点击右上角 **"Login"** 或 **"Sign Up"**
3. 选择登录方式：
   - GitHub（推荐，便于后续集成）
   - Google
   - 邮箱注册

### 步骤1.2：查找n8n模板
**方法A：通过模板库（推荐）**
1. 登录后，点击 **"New Project"**
2. 选择 **"Deploy from Template"** 或 **"Browse Templates"**
3. 在搜索框输入 **"n8n"**
4. 找到 **"n8n"** 官方模板
5. 点击模板卡片查看详情

**方法B：直接部署Docker镜像**
如果找不到模板，使用以下方法：
1. 点击 **"New Project"**
2. 选择 **"Deploy from Docker Hub"**
3. 输入镜像名：`n8nio/n8n:latest`
4. 点击 **"Deploy"**

### 步骤1.3：一键部署
1. 如果使用模板，点击 **"Deploy"** 或 **"Use This Template"**
2. Railway会自动：
   - 创建新项目
   - 拉取n8n Docker镜像
   - 配置基础环境
   - 开始构建和部署

### 步骤1.4：等待部署完成
1. 在项目页面查看部署进度
2. 构建时间通常为 **2-5分钟**
3. 等待状态变为 **"Active"** 或 **"Deployed"**

### 步骤1.5：获取Railway域名
1. 部署完成后，Railway会自动分配域名
2. 格式：`https://your-project-name.railway.app`
3. 在项目页面 → **Settings → Domains** 中查看
4. **记录此域名**，后续配置需要用到

## 阶段2：环境变量配置（3-5分钟）

### 步骤2.1：进入环境变量设置
1. 在Railway项目页面，点击n8n服务
2. 进入 **Settings → Variables** 标签页
3. 点击 **"New Variable"** 添加环境变量

### 步骤2.2：配置必需的环境变量

#### 2.2.1 CORS配置（最重要！）
```bash
变量名: N8N_CORS_ORIGIN
变量值: https://your-username.github.io
```
**说明**：
- 替换 `your-username` 为你的GitHub用户名
- 如果有自定义域名，使用逗号分隔：`https://your-username.github.io,https://your-custom-domain.com`
- 这是**必需**的，否则会出现CORS错误

#### 2.2.2 协议配置
```bash
变量名: N8N_PROTOCOL
变量值: https
```

#### 2.2.3 Webhook URL配置
```bash
变量名: WEBHOOK_URL
变量值: https://your-project-name.railway.app/
```
**说明**：替换为你的Railway域名

#### 2.2.4 时区配置
```bash
变量名: TZ
变量值: Asia/Shanghai
```
或根据你的时区设置

### 步骤2.3：配置可选的环境变量

#### 2.3.1 基础认证（保护n8n管理界面）
```bash
变量名: N8N_BASIC_AUTH_ACTIVE
变量值: true

变量名: N8N_BASIC_AUTH_USER
变量值: admin

变量名: N8N_BASIC_AUTH_PASSWORD
变量值: your-secure-password
```
**说明**：设置强密码保护n8n管理界面

#### 2.3.2 加密密钥（可选但推荐）
```bash
变量名: N8N_ENCRYPTION_KEY
变量值: your-32-character-encryption-key
```
**说明**：用于加密n8n中的敏感数据，生成32字符随机字符串

#### 2.3.3 数据库配置（可选）
如果n8n需要持久化数据，可以添加PostgreSQL：
1. 在Railway项目中点击 **"+ New"**
2. 选择 **"Database" → "Add PostgreSQL"**
3. Railway会自动创建数据库
4. 在n8n服务中添加数据库环境变量：
```bash
变量名: DB_TYPE
变量值: postgresdb

变量名: DB_POSTGRESDB_HOST
变量值: ${{PostgreSQL.PGHOST}}

变量名: DB_POSTGRESDB_DATABASE
变量值: ${{PostgreSQL.PGDATABASE}}

变量名: DB_POSTGRESDB_USER
变量值: ${{PostgreSQL.PGUSER}}

变量名: DB_POSTGRESDB_PASSWORD
变量值: ${{PostgreSQL.PGPASSWORD}}

变量名: DB_POSTGRESDB_PORT
变量值: ${{PostgreSQL.PGPORT}}
```

### 步骤2.4：保存并重新部署
1. 添加完所有环境变量后，点击 **"Save"**
2. Railway会自动触发重新部署
3. 等待部署完成（通常1-2分钟）

## 阶段3：访问和初始化n8n（2-3分钟）

### 步骤3.1：访问n8n界面
1. 在Railway项目页面，点击n8n服务的域名链接
2. 或直接访问：`https://your-project-name.railway.app`
3. 如果设置了基础认证，输入用户名和密码

### 步骤3.2：首次设置
1. 首次访问会提示设置管理员账号
2. 填写：
   - 邮箱
   - 密码
   - 确认密码
3. 点击 **"Continue"** 完成设置

### 步骤3.3：验证n8n运行正常
1. 应该能看到n8n的主界面
2. 左侧是工作流列表
3. 右上角有 **"New Workflow"** 按钮

## 阶段4：配置n8n工作流（10-20分钟）

### 步骤4.1：创建新工作流
1. 点击 **"New Workflow"** 或 **"+"** 按钮
2. 给工作流命名，例如：**"AI Chat Webhook"**

### 步骤4.2：添加Webhook节点
1. 在节点面板搜索 **"Webhook"**
2. 拖拽 **"Webhook"** 节点到画布
3. 点击节点进行配置

### 步骤4.3：配置Webhook节点参数

#### 4.3.1 基本配置
- **HTTP Method**: 选择 **"POST"**
- **Path**: 可以留空（自动生成）或自定义路径
- **Authentication**: 
  - 如果不需要认证：选择 **"None"**
  - 如果需要认证：选择 **"Header Auth"** 或 **"Query Auth"**，并设置密钥名称

#### 4.3.2 响应配置
- **Respond**: 选择 **"When Last Node Finishes"** 或 **"Using 'Respond to Webhook' Node"**
  - 如果选择后者，需要在工作流末尾添加 **"Respond to Webhook"** 节点

#### 4.3.3 获取Webhook URL
配置完成后，在节点下方会显示：
- **Test URL**: `https://your-project.railway.app/webhook-test/xxx`
- **Production URL**: `https://your-project.railway.app/webhook/xxx`

**重要**：复制 **Production URL**，这是网站配置中要使用的URL

### 步骤4.4：添加数据处理节点
1. 添加 **"Code"** 节点或 **"Set"** 节点
2. 从Webhook接收数据：
   ```javascript
   // 在Code节点中访问数据
   const userMessage = $json.body.userMessage;
   const messages = $json.body.messages;
   const conversationHistory = $json.body.conversationHistory;
   ```

### 步骤4.5：添加AI模型处理节点
根据你的AI模型配置，添加相应的节点：
- **HTTP Request** 节点：调用AI API
- **OpenAI** 节点：如果使用OpenAI
- 或其他AI服务节点

配置AI模型调用，使用从Webhook接收的数据。

### 步骤4.6：添加响应格式化节点
1. 添加 **"Code"** 节点或 **"Set"** 节点
2. 格式化AI响应为网站期望的格式：
   ```json
   {
     "content": "AI的回复内容"
   }
   ```

### 步骤4.7：添加Respond to Webhook节点
1. 在工作流末尾添加 **"Respond to Webhook"** 节点
2. 配置响应：
   - **Response Code**: `200`
   - **Response Headers**:
     - `Content-Type`: `application/json`
   - **Response Body**:
     ```json
     {
       "content": "{{ $json.content }}"
     }
     ```
   或直接返回文本：
   ```
   {{ $json.content }}
   ```

### 步骤4.8：测试工作流
1. 点击Webhook节点的 **"Listen for test event"** 按钮
2. 使用curl或Postman发送测试请求：
   ```bash
   curl -X POST https://your-project.railway.app/webhook-test/your-webhook-id \
     -H "Content-Type: application/json" \
     -d '{"userMessage": "测试消息", "messages": []}'
   ```
3. 检查工作流执行日志
4. 验证响应格式是否正确

### 步骤4.9：激活工作流
1. 点击工作流右上角的 **"Active"** 开关
2. 确保工作流处于激活状态（开关变为绿色）

## 阶段5：网站端配置（2-3分钟）

### 步骤5.1：打开网站设置
1. 访问你的GitHub Pages网站
2. 点击设置图标打开设置面板
3. 切换到 **"N8N配置"** 标签页

### 步骤5.2：配置N8N URL
1. 在 **"N8N URL"** 输入框中，粘贴步骤4.3.3中复制的 **Production URL**
   - 格式：`https://your-project.railway.app/webhook/your-webhook-id`
   - **不要使用** Test URL 或 localhost URL

### 步骤5.3：配置其他选项
1. **URL类型**: 选择 **"Webhook"**
2. **HTTP方法**: 选择 **"POST"**
3. **API Key**（如果n8n Webhook需要认证）:
   - 输入在n8n Webhook节点中配置的API Key

### 步骤5.4：保存配置
1. 点击 **"保存配置"** 按钮
2. 配置会保存到浏览器本地存储

### 步骤5.5：启用N8N模式
1. 点击 **"启用N8N模式"** 开关
2. 确认提示（提示词和API配置将被禁用）
3. 开关变为绿色，表示已启用

## 阶段6：测试与验证（5-10分钟）

### 步骤6.1：测试n8n可访问性
在浏览器中访问：
```
https://your-project.railway.app
```
应该能看到n8n界面或登录页面。

### 步骤6.2：测试CORS配置
在浏览器控制台（F12）执行：
```javascript
fetch('https://your-project.railway.app/webhook/your-webhook-id', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userMessage: '测试消息',
    messages: []
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

**预期结果**：
- 没有CORS错误
- 返回正确的响应数据

### 步骤6.3：端到端测试
1. 在网站聊天框中发送测试消息："你好"
2. 打开浏览器开发者工具（F12）
3. 切换到 **Network** 标签
4. 检查请求：
   - 请求URL是否正确
   - 请求方法是否为POST
   - 响应状态码是否为200
   - 响应数据格式是否正确
5. 检查是否收到AI回复

### 步骤6.4：验证功能
- [ ] 消息成功发送到n8n
- [ ] n8n工作流正常执行
- [ ] AI回复正确返回
- [ ] 回复内容显示在聊天框中
- [ ] 浏览器控制台无错误

## 故障排查

### 问题1：CORS错误
**错误信息**：
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**解决方案**：
1. 检查Railway环境变量 `N8N_CORS_ORIGIN` 是否配置
2. 确保包含你的GitHub Pages域名（`https://your-username.github.io`）
3. 重启n8n服务（在Railway中点击 **"Redeploy"**）

### 问题2：无法访问n8n
**解决方案**：
1. 检查Railway项目状态是否为 **"Active"**
2. 查看Railway日志（**Deployments → View Logs**）
3. 确认域名是否正确

### 问题3：Webhook无响应
**解决方案**：
1. 检查n8n工作流是否激活（开关为绿色）
2. 查看n8n工作流执行日志
3. 验证Webhook URL是否正确（使用Production URL）
4. 检查工作流中是否有错误节点

### 问题4：响应格式错误
**解决方案**：
1. 检查Respond to Webhook节点的响应格式
2. 确保返回JSON包含 `content` 字段
3. 检查响应头 `Content-Type` 是否为 `application/json`

### 问题5：401/403错误
**解决方案**：
1. 检查n8n Webhook的认证配置
2. 验证网站中输入的API Key是否正确
3. 检查请求头中的认证信息

## 检查清单

### Railway部署
- [ ] n8n已成功部署到Railway
- [ ] Railway域名已获取
- [ ] 环境变量已配置（特别是CORS）
- [ ] n8n服务状态为Active

### n8n工作流
- [ ] Webhook节点已创建
- [ ] Production URL已获取
- [ ] 工作流已配置（数据处理、AI调用、响应格式化）
- [ ] Respond to Webhook节点已配置
- [ ] 工作流已激活

### 网站配置
- [ ] N8N URL已配置（Production URL）
- [ ] URL类型已选择（Webhook）
- [ ] HTTP方法已选择（POST）
- [ ] API Key已配置（如果需要）
- [ ] N8N模式已启用

### 测试验证
- [ ] n8n可访问性测试通过
- [ ] CORS测试通过
- [ ] 端到端测试通过
- [ ] 浏览器控制台无错误

## 后续优化

1. **监控**：
   - 在Railway中查看服务监控
   - 监控n8n工作流执行情况
   - 设置告警通知

2. **性能**：
   - 优化n8n工作流执行时间
   - 考虑添加缓存机制

3. **安全**：
   - 定期更新n8n密码
   - 定期轮换API密钥
   - 启用n8n的基础认证

## 时间估算

- **阶段1（Railway部署）**: 5-10分钟
- **阶段2（环境变量配置）**: 3-5分钟
- **阶段3（n8n初始化）**: 2-3分钟
- **阶段4（工作流配置）**: 10-20分钟（取决于工作流复杂度）
- **阶段5（网站配置）**: 2-3分钟
- **阶段6（测试验证）**: 5-10分钟

**总计**: 约30-50分钟

## 成本说明

Railway免费额度：
- $5/月免费额度
- n8n通常足够使用
- 超出后按使用量计费（通常很便宜）

## 优势总结

相比Docker部署：
- ✅ 无需配置Docker Compose
- ✅ 无需配置反向代理
- ✅ 无需配置SSL证书
- ✅ 自动提供HTTPS
- ✅ 自动提供域名
- ✅ 环境变量管理简单
- ✅ 部署速度快（5-10分钟）
- ✅ 维护成本低
