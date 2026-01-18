import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { ApiConfig } from '../types';
import { getProviderDisplayName, ApiProvider } from '../utils/apiService';
import { FiX, FiChevronLeft, FiSave, FiKey, FiLock } from 'react-icons/fi';

export default function ApiConfigPanel() {
  const { state, dispatch } = useApp();
  const [provider, setProvider] = useState<ApiProvider>(state.apiConfig.provider);
  const [apiKey, setApiKey] = useState(state.apiConfig.apiKey || '');

  useEffect(() => {
    setProvider(state.apiConfig.provider);
    setApiKey(state.apiConfig.apiKey || '');
  }, [state.apiConfig]);

  const handleSave = () => {
    const config: ApiConfig = {
      provider,
      apiKey: apiKey.trim(),
    };
    dispatch({ type: 'SET_API_CONFIG', payload: config });
  };

  const providers: ApiProvider[] = ['zhipu', 'openai', 'claude', 'tongyi', 'wenxin', 'spark', 'doubao'];

  if (state.apiConfigPanelCollapsed) {
    return (
      <div className="hidden lg:flex w-12 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex-col items-center p-2">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_API_CONFIG_PANEL' })}
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
          title="展开API配置"
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>
        <div className="mt-2 p-2 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <FiKey className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
    );
  }

  return (
    <div className={`absolute lg:relative z-20 lg:z-auto right-0 w-full sm:w-80 lg:w-96 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full shadow-lg lg:shadow-none`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">API配置</h2>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_API_CONFIG_PANEL' })}
            className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <FiSave className="w-4 h-4" />
          保存配置
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            模型提供商
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as ApiProvider)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {providers.map((p) => (
              <option key={p} value={p}>
                {getProviderDisplayName(p)}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            选择要使用的大模型提供商
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FiLock className="w-4 h-4 inline mr-1" />
            API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="请输入API Key..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            API Key以密码形式保护，仅存储在本地浏览器中，不会上传到服务器。请在安全的设备上使用。
          </p>
        </div>

        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>提示：</strong>
          </p>
          <ul className="mt-1 text-xs text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
            <li>智谱GLM：默认模型，已配置默认API Key</li>
            <li>其他模型：请前往各提供商官网获取API Key</li>
            <li>切换模型后需要重新输入对应的API Key</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
