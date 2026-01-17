import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { APIConfig, APIFormat } from '../types';
import { callAPI } from '../utils/api';

export default function ApiConfig() {
  const { state, dispatch } = useApp();
  const [endpoint, setEndpoint] = useState(state.apiConfig?.endpoint || '');
  const [apiKey, setApiKey] = useState(state.apiConfig?.apiKey || '');
  const [format, setFormat] = useState<APIFormat>(state.apiConfig?.format || 'openai');
  const [isTesting, setIsTesting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connected' | 'error'>('idle');

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
            placeholder="https://api.openai.com/v1/chat/completions"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Format
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as APIFormat)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
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
