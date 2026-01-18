import { Message, ApiConfig } from '../types';

export type ApiProvider = 'zhipu' | 'openai' | 'claude' | 'tongyi' | 'wenxin' | 'spark' | 'doubao';

export interface ApiResponse {
  content: string;
  error?: string;
}

/**
 * 调用智谱GLM API
 */
async function callZhipuAPI(apiKey: string, messages: Message[]): Promise<string> {
  const url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
  
  // 转换消息格式
  const formattedMessages = messages
    .filter(m => m.role !== 'system') // 智谱API中system消息单独处理
    .map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

  // 提取system prompt
  const systemMessage = messages.find(m => m.role === 'system');
  
  const requestBody: any = {
    model: 'glm-4',
    messages: formattedMessages,
  };

  if (systemMessage) {
    requestBody.messages = [
      { role: 'system', content: systemMessage.content },
      ...formattedMessages,
    ];
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(error.error?.message || error.message || 'API请求失败');
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * 调用OpenAI API
 */
async function callOpenAIAPI(apiKey: string, messages: Message[]): Promise<string> {
  const url = 'https://api.openai.com/v1/chat/completions';
  
  const formattedMessages = messages.map(m => ({
    role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user',
    content: m.content,
  }));

  const requestBody = {
    model: 'gpt-3.5-turbo',
    messages: formattedMessages,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(error.error?.message || error.message || 'API请求失败');
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * 调用Claude API (Anthropic)
 */
async function callClaudeAPI(apiKey: string, messages: Message[]): Promise<string> {
  const url = 'https://api.anthropic.com/v1/messages';
  
  // Claude API需要将system消息和对话消息分开
  const systemMessage = messages.find(m => m.role === 'system');
  const conversationMessages = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

  const requestBody: any = {
    model: 'claude-3-sonnet-20240229',
    max_tokens: 1024,
    messages: conversationMessages,
  };

  if (systemMessage) {
    requestBody.system = systemMessage.content;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(error.error?.message || error.message || 'API请求失败');
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

/**
 * 调用通义千问API (阿里云DashScope)
 */
async function callTongyiAPI(apiKey: string, messages: Message[]): Promise<string> {
  const url = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
  
  const formattedMessages = messages.map(m => ({
    role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user',
    content: m.content,
  }));

  const requestBody = {
    model: 'qwen-turbo',
    input: {
      messages: formattedMessages,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(error.error?.message || error.message || 'API请求失败');
  }

  const data = await response.json();
  return data.output?.text || data.output?.choices?.[0]?.message?.content || '';
}

/**
 * 调用文心一言API (百度千帆)
 */
async function callWenxinAPI(apiKey: string, messages: Message[]): Promise<string> {
  // 百度千帆API需要access_token，这里假设apiKey已经是token，或者需要先获取token
  // 简化处理：假设直接使用API key作为token
  const url = 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions';
  
  const formattedMessages = messages
    .filter(m => m.role !== 'system') // 百度API可能不支持system消息
    .map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

  const requestBody = {
    messages: formattedMessages,
  };

  const response = await fetch(`${url}?access_token=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(error.error?.message || error.message || 'API请求失败');
  }

  const data = await response.json();
  return data.result || '';
}

/**
 * 调用星火大模型API (讯飞)
 */
async function callSparkAPI(_apiKey: string, _messages: Message[]): Promise<string> {
  // 讯飞星火API需要特殊的认证方式，这里简化处理
  // 实际使用时需要根据讯飞API文档进行认证
  throw new Error('星火大模型API暂未实现，请使用其他模型');
}

/**
 * 调用豆包API (字节跳动)
 */
async function callDoubaoAPI(apiKey: string, messages: Message[]): Promise<string> {
  const url = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
  
  const formattedMessages = messages.map(m => ({
    role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user',
    content: m.content,
  }));

  const requestBody = {
    model: 'ep-20241205100410-abcde',
    messages: formattedMessages,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(error.error?.message || error.message || 'API请求失败');
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * 统一的API调用接口
 * @param config API配置（提供商和密钥）
 * @param messages 消息列表
 */
export async function callModelAPI(
  config: ApiConfig,
  messages: Message[]
): Promise<string> {
  // 从apiKeys对象中获取当前provider的API key
  // 兼容旧格式（如果还有apiKey字段）
  const apiKey = config.apiKeys?.[config.provider] || (config as any).apiKey || '';
  
  if (!apiKey) {
    throw new Error('API Key未配置，请在右侧面板中设置API Key');
  }

  try {
    switch (config.provider) {
      case 'zhipu':
        return await callZhipuAPI(apiKey, messages);
      case 'openai':
        return await callOpenAIAPI(apiKey, messages);
      case 'claude':
        return await callClaudeAPI(apiKey, messages);
      case 'tongyi':
        return await callTongyiAPI(apiKey, messages);
      case 'wenxin':
        return await callWenxinAPI(apiKey, messages);
      case 'spark':
        return await callSparkAPI(apiKey, messages);
      case 'doubao':
        return await callDoubaoAPI(apiKey, messages);
      default:
        throw new Error(`不支持的API提供商: ${config.provider}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('API调用失败');
  }
}

/**
 * 获取API提供商的显示名称
 */
export function getProviderDisplayName(provider: ApiProvider): string {
  const names: Record<ApiProvider, string> = {
    zhipu: '智谱清言 (GLM)',
    openai: 'OpenAI (GPT)',
    claude: 'Claude (Anthropic)',
    tongyi: '通义千问 (阿里云)',
    wenxin: '文心一言 (百度)',
    spark: '星火大模型 (讯飞)',
    doubao: '豆包 (字节跳动)',
  };
  return names[provider];
}
