import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { APIConfig, APIFormat } from '../types';
import { callAPI } from '../utils/api';

// 智谱AI默认API Key
const DEFAULT_ZHIPU_API_KEY = '403c7c9f1f124bf684a881fa01376bb8.IzkE5f2FI6WcXmJB';

// 隐藏API Key显示
const maskApiKey = (key: string): string => {
  if (!key) return '';
  if (key === DEFAULT_ZHIPU_API_KEY) {
    return '••••••••••••••••••••••••••••••••';
  }
  if (key.length <= 8) return '•'.repeat(key.length);
  return key.substring(0, 4) + '•'.repeat(key.length - 8) + key.substring(key.length - 4);
};

export default function ApiConfig() {
  const { state, dispatch } = useApp();
  const [endpoint, setEndpoint] = useState(state.apiConfig?.endpoint || '');
  const [apiKey, setApiKey] = useState(state.apiConfig?.apiKey || '');
  const [isEditingApiKey, setIsEditingApiKey] = useState(false);
  const [format, setFormat] = useState<APIFormat>(state.apiConfig?.format || 'openai');
  const [isTesting, setIsTesting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connected' | 'error'>('idle');

  // 当格式改变时，如果是智谱AI且没有API Key，设置默认值
  useEffect(() => {
    if (format === 'zhipu' && !apiKey) {
      setApiKey(DEFAULT_ZHIPU_API_KEY);
      setIsEditingApiKey(false);
    }
  }, [format, apiKey]);

  const handleSave = () => {
    const config: APIConfig = {
      endpoint,
      apiKey: apiKey || undefined,
      format,
    };
    dispatch({ type: 'SET_API_CONFIG', payload: config });
    setStatus('connected');
  };

  const handleTest = async () => {
    if (!endpoint || !apiKey) {
      setStatus('error');
      return;
    }

    setIsTesting(true);
    setStatus('idle');

    try {
      const testConfig: APIConfig = {
        endpoint,
        apiKey,
        format,
      };

      // Test with a simple message
      await callAPI(
        testConfig,
        [{ id: '1', role: 'user', content: 'test', timestamp: Date.now() }]
      );

      setStatus('connected');
      handleSave();
    } catch (error) {
      console.error('API test failed:', error);
      setStatus('error');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            API Endpoint
          </label>
          <input
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder={
              format === 'openai'
                ? 'https://api.openai.com/v1/chat/completions'
                : format === 'anthropic'
                ? 'https://api.anthropic.com/v1/messages'
                : format === 'zhipu'
                ? 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
                : 'API endpoint URL'
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            API Key
          </label>
          <input
            type="password"
            value={isEditingApiKey ? apiKey : (apiKey ? maskApiKey(apiKey) : '')}
            onChange={(e) => {
              setApiKey(e.target.value);
              setIsEditingApiKey(true);
            }}
            onFocus={() => {
              setIsEditingApiKey(true);
            }}
            onBlur={(e) => {
              // 失去焦点时，如果是zhipu格式且输入为空，恢复默认值
              if (!e.target.value && format === 'zhipu') {
                setApiKey(DEFAULT_ZHIPU_API_KEY);
              }
              setIsEditingApiKey(false);
            }}
            placeholder={format === 'zhipu' && apiKey === DEFAULT_ZHIPU_API_KEY ? '默认已配置' : 'sk-...'}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Format
          </label>
          <select
            value={format}
            onChange={(e) => {
              const newFormat = e.target.value as APIFormat;
              setFormat(newFormat);
              // Set default endpoint based on format
              if (!endpoint || endpoint === state.apiConfig?.endpoint) {
                if (newFormat === 'openai') {
                  setEndpoint('https://api.openai.com/v1/chat/completions');
                } else if (newFormat === 'anthropic') {
                  setEndpoint('https://api.anthropic.com/v1/messages');
                } else if (newFormat === 'zhipu') {
                  setEndpoint('https://open.bigmodel.cn/api/paas/v4/chat/completions');
                  // 如果切换到智谱AI且没有API Key，设置默认值
                  if (!apiKey) {
                    setApiKey(DEFAULT_ZHIPU_API_KEY);
                    setIsEditingApiKey(false);
                  }
                }
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="zhipu">智谱AI (ZhipuAI)</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button
            onClick={handleTest}
            disabled={isTesting || !endpoint || !apiKey}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isTesting ? 'Testing...' : 'Test'}
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Save
          </button>

          <div className="flex items-center gap-2">
            {status === 'connected' && (
              <span className="text-green-600 dark:text-green-400 text-sm">✓ Connected</span>
            )}
            {status === 'error' && (
              <span className="text-red-600 dark:text-red-400 text-sm">✗ Error</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
