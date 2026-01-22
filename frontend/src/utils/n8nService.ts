import { Message, N8NConfig } from '../types';

export interface N8NResponse {
  content: string;
  error?: string;
}

/**
 * 调用N8N webhook/HTTP Request
 * @param config N8N配置
 * @param messages 消息列表（仅用户和助手消息，不包括system）
 */
export async function callN8NWebhook(
  config: N8NConfig,
  messages: Message[]
): Promise<string> {
  if (!config.url || !config.url.trim()) {
    throw new Error('N8N URL未配置，请在设置中配置N8N URL');
  }

  // 构建请求体
  // 提取最后一条用户消息作为当前消息
  const userMessages = messages.filter(m => m.role === 'user');
  const currentUserMessage = userMessages[userMessages.length - 1]?.content || '';
  
  // 构建对话历史（不包括system消息）
  const conversationHistory = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role,
      content: m.content,
    }));

  // 构建请求体（灵活格式，适配不同N8N配置）
  const requestBody = {
    messages: conversationHistory,
    userMessage: currentUserMessage,
    conversationHistory: conversationHistory,
  };

  // 构建请求头
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // 添加API Key（如果配置了）
  if (config.apiKey && config.apiKey.trim()) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
    // 也支持在请求头中使用自定义key
    headers['X-API-Key'] = config.apiKey;
  }

  // 添加自定义请求头（如果配置了）
  if (config.customHeaders) {
    Object.entries(config.customHeaders).forEach(([key, value]) => {
      headers[key] = value;
    });
  }

  // 构建请求选项
  const requestOptions: RequestInit = {
    method: config.method || 'POST',
    headers,
  };

  // 确定最终使用的URL
  let finalUrl = config.url;
  
  // 如果是POST请求，添加请求体
  if (config.method === 'POST' || !config.method) {
    requestOptions.body = JSON.stringify(requestBody);
  } else if (config.method === 'GET') {
    // GET请求：将参数添加到URL
    const urlParams = new URLSearchParams();
    urlParams.append('messages', JSON.stringify(conversationHistory));
    urlParams.append('userMessage', currentUserMessage);
    finalUrl = `${config.url}?${urlParams.toString()}`;
  }

  try {
    const response = await fetch(finalUrl, requestOptions);

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`N8N请求失败: ${response.status} ${errorText}`);
    }

    // 解析响应（纯文本格式）
    const responseText = await response.text();
    
    // 尝试解析为JSON（如果N8N返回JSON格式）
    try {
      const jsonResponse = JSON.parse(responseText);
      // 如果JSON中有text或content字段，使用它
      if (jsonResponse.text) {
        return jsonResponse.text;
      }
      if (jsonResponse.content) {
        return jsonResponse.content;
      }
      if (jsonResponse.message) {
        return jsonResponse.message;
      }
      // 如果JSON中没有这些字段，返回整个JSON的字符串表示
      return JSON.stringify(jsonResponse, null, 2);
    } catch {
      // 如果不是JSON，直接返回文本
      return responseText;
    }
  } catch (error) {
    if (error instanceof Error) {
      // 网络错误或其他错误
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('网络错误：无法连接到N8N服务，请检查URL是否正确');
      }
      throw error;
    }
    throw new Error('N8N调用失败');
  }
}
