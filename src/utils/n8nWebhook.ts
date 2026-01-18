import { Message } from '../types';

export interface N8NWebhookConfig {
  webhookUrl: string;
}

export interface N8NWebhookRequest {
  conversationId: string;
  messages: Message[];
  systemPrompt?: string;
}

export interface N8NWebhookResponse {
  content: string;
  error?: string;
}

/**
 * 调用n8n webhook获取AI回复
 * @param webhookUrl n8n webhook的URL
 * @param conversationId 会话ID
 * @param messages 消息列表
 * @param systemPrompt 系统提示词
 * @param onChunk 流式输出回调（如果n8n支持流式输出）
 */
export const callN8NWebhook = async (
  webhookUrl: string,
  conversationId: string,
  messages: Message[],
  systemPrompt?: string,
  onChunk?: (chunk: string) => void
): Promise<string> => {
  if (!webhookUrl) {
    throw new Error('N8N webhook URL is required');
  }

  const requestBody: N8NWebhookRequest = {
    conversationId,
    messages,
    systemPrompt,
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(error.error?.message || error.message || 'Webhook request failed');
  }

  // 尝试解析响应
  const responseData: N8NWebhookResponse = await response.json();

  if (responseData.error) {
    throw new Error(responseData.error);
  }

  if (responseData.content) {
    return responseData.content;
  }

  // 如果没有content字段，尝试直接返回响应文本
  const text = await response.text();
  return text || '';
};
