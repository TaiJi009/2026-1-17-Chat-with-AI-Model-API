import { APIConfig, Message } from '../types';

export interface APIResponse {
  content: string;
  done?: boolean;
}

export const callOpenAIAPI = async (
  config: APIConfig,
  messages: Message[],
  onChunk?: (chunk: string) => void
): Promise<string> => {
  if (!config.endpoint || !config.apiKey) {
    throw new Error('API endpoint and API key are required');
  }

  // Separate system messages from conversation messages for OpenAI
  const systemMessages = messages.filter(msg => msg.role === 'system');
  const conversationMessages = messages.filter(msg => msg.role !== 'system');
  
  // Combine system messages into one if multiple exist
  const systemContent = systemMessages.map(m => m.content).join('\n\n');
  const apiMessages = systemContent
    ? [{ role: 'system' as const, content: systemContent }, ...conversationMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }))]
    : conversationMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: apiMessages,
      stream: !!onChunk,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(error.error?.message || 'API request failed');
  }

  if (onChunk && response.body) {
    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            return fullContent;
          }

          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content || '';
            if (content) {
              fullContent += content;
              onChunk(content);
            }
          } catch (e) {
            // Ignore parsing errors for incomplete chunks
          }
        }
      }
    }

    return fullContent;
  } else {
    // Handle non-streaming response
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }
};

export const callAnthropicAPI = async (
  config: APIConfig,
  messages: Message[],
  onChunk?: (chunk: string) => void
): Promise<string> => {
  if (!config.endpoint || !config.apiKey) {
    throw new Error('API endpoint and API key are required');
  }

  // Convert messages format for Anthropic
  const systemMessages = messages.filter(m => m.role === 'system');
  const conversationMessages = messages.filter(m => m.role !== 'system');
  
  // Combine system messages into one if multiple exist
  const systemContent = systemMessages.map(m => m.content).join('\n\n');

  const body: any = {
    model: 'claude-3-sonnet-20240229',
    max_tokens: 1024,
    messages: conversationMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    })),
  };

  if (systemContent) {
    body.system = systemContent;
  }

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(error.error?.message || 'API request failed');
  }

  if (onChunk && response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            return fullContent;
          }

          try {
            const json = JSON.parse(data);
            if (json.type === 'content_block_delta') {
              const content = json.delta?.text || '';
              if (content) {
                fullContent += content;
                onChunk(content);
              }
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      }
    }

    return fullContent;
  } else {
    const data = await response.json();
    return data.content?.[0]?.text || '';
  }
};

export const callAPI = async (
  config: APIConfig,
  messages: Message[],
  onChunk?: (chunk: string) => void
): Promise<string> => {
  switch (config.format) {
    case 'openai':
      return callOpenAIAPI(config, messages, onChunk);
    case 'anthropic':
      return callAnthropicAPI(config, messages, onChunk);
    case 'custom':
      throw new Error('Custom API format not yet implemented');
    default:
      throw new Error(`Unsupported API format: ${config.format}`);
  }
};
