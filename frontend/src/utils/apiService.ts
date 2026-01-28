import { Message, ApiConfig } from '../types';
import { debug } from './debug';

export type ApiProvider = 'zhipu' | 'openai' | 'claude' | 'tongyi' | 'wenxin' | 'spark' | 'doubao';

export interface ApiResponse {
  content: string;
  error?: string;
}

export interface CallModelAPIOptions {
  onChunk?: (content: string) => void;
}

/**
 * 解析 SSE 流，从 data: 行中取 choices[0].delta.content 并累积，每段调用 onChunk(累积结果)；流结束返回完整串。
 */
async function readSSEStream(
  response: Response,
  onChunk: (accumulated: string) => void
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }
  const decoder = new TextDecoder();
  let buffer = '';
  let accumulated = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const s = line.trim();
      if (!s.startsWith('data: ')) continue;
      const payload = s.slice(6).trim();
      if (payload === '[DONE]') {
        return accumulated;
      }
      try {
        const data = JSON.parse(payload);
        const delta = data.choices?.[0]?.delta?.content;
        if (typeof delta === 'string') {
          accumulated += delta;
          onChunk(accumulated);
        }
      } catch {
        // skip malformed or non-JSON lines
      }
    }
  }
  return accumulated;
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
 * 智谱 GLM API 流式调用（SSE，与 OpenAI 格式兼容）
 */
async function callZhipuAPIStream(
  apiKey: string,
  messages: Message[],
  onChunk: (content: string) => void
): Promise<string> {
  const url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
  const formattedMessages = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));
  const systemMessage = messages.find(m => m.role === 'system');
  const requestBody: Record<string, unknown> = {
    model: 'glm-4',
    messages: systemMessage
      ? [{ role: 'system', content: systemMessage.content }, ...formattedMessages]
      : formattedMessages,
    stream: true,
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
    throw new Error((error as any).error?.message || (error as any).message || 'API请求失败');
  }

  return readSSEStream(response, onChunk);
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
 * OpenAI API 流式调用（SSE）
 */
async function callOpenAIAPIStream(
  apiKey: string,
  messages: Message[],
  onChunk: (content: string) => void
): Promise<string> {
  const url = 'https://api.openai.com/v1/chat/completions';
  const formattedMessages = messages.map(m => ({
    role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user',
    content: m.content,
  }));
  const requestBody = {
    model: 'gpt-3.5-turbo',
    messages: formattedMessages,
    stream: true,
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

  return readSSEStream(response, onChunk);
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
 * @param options 可选；onChunk 在 openai/zhipu 下启用流式，每收到一段内容调用 onChunk(当前累积全文)
 */
export async function callModelAPI(
  config: ApiConfig,
  messages: Message[],
  options?: CallModelAPIOptions
): Promise<string> {
  // 从apiKeys对象中获取当前provider的API key
  // 兼容旧格式（如果还有apiKey字段）
  const apiKey = config.apiKeys?.[config.provider] || (config as any).apiKey || '';
  
  // #region agent log
  debug.trace('callAPI', { provider: config.provider, hasApiKey: !!apiKey, messageCount: messages.length }, 'api-call');
  // #endregion

  if (!apiKey) {
    // #region agent log
    debug.error('API: No API key configured', { provider: config.provider }, 'api-no-key');
    // #endregion
    throw new Error('API Key未配置，请在右侧面板中设置API Key');
  }

  const useStream = Boolean(options?.onChunk);

  try {
    let result: string;
    switch (config.provider) {
      case 'zhipu':
        result = useStream
          ? await callZhipuAPIStream(apiKey, messages, options!.onChunk!)
          : await callZhipuAPI(apiKey, messages);
        break;
      case 'openai':
        result = useStream
          ? await callOpenAIAPIStream(apiKey, messages, options!.onChunk!)
          : await callOpenAIAPI(apiKey, messages);
        break;
      case 'claude':
        result = await callClaudeAPI(apiKey, messages);
        break;
      case 'tongyi':
        result = await callTongyiAPI(apiKey, messages);
        break;
      case 'wenxin':
        result = await callWenxinAPI(apiKey, messages);
        break;
      case 'spark':
        result = await callSparkAPI(apiKey, messages);
        break;
      case 'doubao':
        result = await callDoubaoAPI(apiKey, messages);
        break;
      default:
        // #region agent log
        debug.error('API: Unsupported provider', { provider: config.provider }, 'api-unsupported');
        // #endregion
        throw new Error(`不支持的API提供商: ${config.provider}`);
    }
    // #region agent log
    debug.traceExit('callAPI', { provider: config.provider, resultLength: result.length }, 'api-call');
    // #endregion
    return result;
  } catch (error) {
    // #region agent log
    debug.error('API Call Error', { provider: config.provider, error: error instanceof Error ? error.message : String(error) }, 'api-call-error');
    // #endregion
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
