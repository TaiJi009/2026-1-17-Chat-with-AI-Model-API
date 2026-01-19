# N8N Webhook 集成指南

本网站通过 n8n webhook 与外部AI服务集成。网站会将对话数据发送到 n8n，n8n 处理后返回AI回复。

## 架构说明

### 数据流向

```
网站 → POST请求 → n8n Webhook节点 → 处理数据 → AI调用 → Respond to Webhook节点 → 网站
```

### 节点使用说明

**⚠️ 重要：关于返回数据**

- ✅ **使用 "Respond to Webhook" 节点**：这是n8n专门用于响应webhook的节点，会直接将数据返回给发起请求的网站
- ❌ **不要使用 "HTTP Request" 节点返回数据**：HTTP Request节点是用于向外发送请求的，不适用于返回数据给静态网站

### 工作流程

1. **用户发送消息** → 网站收集对话历史
2. **网站发送数据** → POST 请求到 n8n Webhook节点
3. **n8n处理数据** → 提取消息、系统提示词等信息
4. **n8n调用AI** → 使用OpenAI/HTTP Request/Code节点调用AI服务
5. **n8n格式化响应** → 将AI响应格式化为标准格式
6. **n8n返回结果** → 通过Respond to Webhook节点返回JSON到网站

## 请求格式

网站发送的POST请求格式：

```json
{
  "conversationId": "conv-1234567890",
  "messages": [
    {
      "id": "msg-1",
      "role": "system",
      "content": "你是非常厉害的通用AI助手..."
    },
    {
      "id": "msg-2",
      "role": "user",
      "content": "用户的问题"
    },
    {
      "id": "msg-3",
      "role": "assistant",
      "content": "AI的回复"
    }
  ],
  "systemPrompt": "你是非常厉害的通用AI助手..."
}
```

## 响应格式

n8n 需要返回以下格式的JSON：

```json
{
  "content": "AI的回复内容"
}
```

如果出错，可以返回：

```json
{
  "error": "错误信息"
}
```

## N8N 工作流配置

### 1. 创建 Webhook 节点

1. 在 n8n 中创建新的工作流
2. 添加 **Webhook** 节点
   - 选择 **POST** 方法
   - 配置路径（如 `/webhook/chat`）
   - 保存后复制 webhook URL

### 2. 处理输入数据

添加 **Set** 节点或使用 **Code** 节点提取数据：

```javascript
// 在 Code 节点中处理输入
const body = $input.all()[0].json;
const messages = body.messages;
const systemPrompt = body.systemPrompt;

// 准备发送给AI的数据
const aiMessages = messages.map(msg => ({
  role: msg.role,
  content: msg.content
}));
```

### 3. 调用 AI 服务

在 n8n 中使用以下节点之一调用AI：

#### 选项 A: OpenAI 节点
- 添加 **OpenAI** 节点
- 配置 API Key
- 选择模型（如 `gpt-4`）
- 将消息数组传入 `messages` 字段

#### 选项 B: HTTP Request 节点
- 添加 **HTTP Request** 节点
- 配置AI服务API端点
- 设置请求体格式

#### 选项 C: Code 节点（自定义）
- 使用 **Code** 节点编写自定义逻辑
- 可以集成任何AI服务

### 4. 格式化响应

添加 **Code** 节点格式化响应：

```javascript
// 假设AI返回在 $input.all()[0].json 中
const aiResponse = $input.all()[0].json;
const content = aiResponse.choices[0].message.content || aiResponse.content;

return {
  json: {
    content: content
  }
};
```

### 5. 响应节点 - Respond to Webhook

**⚠️ 必须使用 "Respond to Webhook" 节点返回数据**

1. 添加 **Respond to Webhook** 节点
   - 这是n8n专门用于响应webhook的节点
   - **不要使用HTTP Request节点**（HTTP Request是用于向外发送请求的）
   - 可以设置响应代码（默认200）
   - 连接前面的格式化节点

2. 配置响应数据
   - 响应数据应该是 `{ "content": "..." }` 格式
   - 节点会自动将其转换为HTTP响应返回给网站

**为什么使用Respond to Webhook而不是HTTP Request？**
- Respond to Webhook：用于**响应**来自外部客户端的请求，直接将数据返回给发起请求的网站
- HTTP Request：用于**发送**HTTP请求到外部服务，不适用于返回数据给静态网站

## 完整工作流示例

```
[Webhook节点] 
    ↓ (接收POST请求)
[Set/Code节点] 
    ↓ (提取数据)
[OpenAI/HTTP Request/Code节点] 
    ↓ (调用AI)
[Code节点] 
    ↓ (格式化响应)
[Respond to Webhook节点] 
    ↓ (返回JSON到网站)
```

**工作流配置要点：**
1. **Webhook节点**：接收网站发送的数据（POST方法）
2. **Respond to Webhook节点**：返回数据给网站（必须使用此节点）

## 配置步骤

1. **在 n8n 中创建工作流**
   - 添加 Webhook 节点（POST方法）
   - 复制 webhook URL

2. **在网站中配置**
   - 打开提示词配置面板（右侧）
   - 输入 n8n webhook URL
   - 点击保存

3. **测试**
   - 在聊天框中发送消息
   - 检查 n8n 工作流是否正常执行
   - 查看网站是否收到回复

## 注意事项

- **响应节点**：必须使用 **"Respond to Webhook"** 节点返回数据
  - ✅ 正确：Respond to Webhook节点
  - ❌ 错误：HTTP Request节点（这是用于发送请求的，不是返回的）
- **响应格式**：确保返回 `{ "content": "..." }` 格式
- **错误处理**：可以在工作流中添加错误处理节点，返回 `{ "error": "..." }` 格式
- **超时设置**：确保 n8n 工作流能在合理时间内完成（建议30秒内）
- **节点顺序**：Webhook节点必须在工作流开始，Respond to Webhook节点必须在工作流结束

## 故障排查

### 问题：网站显示"请先配置n8n webhook URL"
- 解决：在提示词配置面板中输入并保存 webhook URL

### 问题：发送消息后没有响应
- 检查 n8n 工作流是否激活
- 检查 webhook URL 是否正确
- 查看 n8n 工作流执行日志
- 检查响应格式是否正确

### 问题：收到错误响应
- 检查 n8n 工作流中的错误处理
- 确保返回格式为 `{ "content": "..." }` 或 `{ "error": "..." }`
