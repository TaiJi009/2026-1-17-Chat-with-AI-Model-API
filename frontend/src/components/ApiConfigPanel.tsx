import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { ApiConfig } from '../types';
import { getProviderDisplayName, ApiProvider } from '../utils/apiService';
import { FiX, FiChevronLeft, FiSave, FiKey, FiLock, FiCreditCard, FiRefreshCw } from 'react-icons/fi';

// 默认API Key（仅在用户未保存时使用）
const DEFAULT_API_KEYS: Partial<Record<ApiProvider, string>> = {
  zhipu: '403c7c9f1f124bf684a881fa01376bb8.IzkE5f2FI6WcXmJB',
};

// 各模型提供商的充值链接
const RECHARGE_LINKS: Partial<Record<ApiProvider, string>> = {
  zhipu: 'https://bigmodel.cn/',
  openai: 'https://platform.openai.com/account/billing',
  claude: 'https://console.anthropic.com/settings/billing',
  tongyi: 'https://dashscope.console.aliyun.com/',
  wenxin: 'https://console.bce.baidu.com/',
  spark: 'https://xinghuo.xfyun.cn/',
  doubao: 'https://console.volcengine.com/ark/overview',
};

export default function ApiConfigPanel() {
  const { state, dispatch } = useApp();
  const [provider, setProvider] = useState<ApiProvider>(state.apiConfig.provider);
  const [apiKey, setApiKey] = useState('');

  // 获取当前模型的API Key（优先使用用户保存的，否则使用默认值）
  const getCurrentApiKey = (targetProvider: ApiProvider): string => {
    const savedKey = state.apiConfig.apiKeys?.[targetProvider];
    if (savedKey) {
      return savedKey; // 用户已保存
    }
    // 用户未保存：智谱显示默认值，其他留空
    return DEFAULT_API_KEYS[targetProvider] || '';
  };

  // 当provider或apiKeys变化时，更新输入框的API Key
  useEffect(() => {
    const currentKey = getCurrentApiKey(provider);
    setApiKey(currentKey);
  }, [provider, state.apiConfig.apiKeys]);

  // 当外部状态中的provider变化时，同步本地state
  useEffect(() => {
    if (state.apiConfig.provider !== provider) {
      setProvider(state.apiConfig.provider);
    }
  }, [state.apiConfig.provider]);

  const handleSave = () => {
    // 保存当前模型的API key到apiKeys对象中
    const updatedApiKeys = {
      ...state.apiConfig.apiKeys,
      [provider]: apiKey.trim(),
    };
    
    const config: ApiConfig = {
      provider,
      apiKeys: updatedApiKeys,
    };
    dispatch({ type: 'SET_API_CONFIG', payload: config });
  };

  const handleProviderChange = (newProvider: ApiProvider) => {
    setProvider(newProvider);
    // 切换模型时会自动通过useEffect更新apiKey
    // 同时更新当前选择的模型
    const updatedApiKeys = { ...state.apiConfig.apiKeys };
    dispatch({ 
      type: 'SET_API_CONFIG', 
      payload: { 
        provider: newProvider, 
        apiKeys: updatedApiKeys 
      } 
    });
  };

  const handleRecharge = () => {
    const rechargeUrl = RECHARGE_LINKS[provider];
    if (rechargeUrl) {
      window.open(rechargeUrl, '_blank');
    }
  };

  const handleReset = () => {
    // 重置为默认值（如果有），否则清空
    const defaultKey = DEFAULT_API_KEYS[provider] || '';
    setApiKey(defaultKey);
    
    // 如果用户已保存过该模型的API Key，需要从apiKeys中删除
    if (state.apiConfig.apiKeys?.[provider]) {
      const updatedApiKeys = { ...state.apiConfig.apiKeys };
      delete updatedApiKeys[provider];
      
      const config: ApiConfig = {
        provider: state.apiConfig.provider,
        apiKeys: updatedApiKeys,
      };
      dispatch({ type: 'SET_API_CONFIG', payload: config });
    }
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
          <div className="flex gap-2">
            <select
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value as ApiProvider)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {providers.map((p) => (
                <option key={p} value={p}>
                  {getProviderDisplayName(p)}
                </option>
              ))}
            </select>
            <button
              onClick={handleRecharge}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
              title="前往充值"
            >
              <FiCreditCard className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
              title="重置API Key"
            >
              <FiRefreshCw className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            选择要使用的大模型提供商，点击充值图标前往充值页面，点击重置图标恢复默认设置
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
            <li>智谱GLM：默认模型，未保存时自动使用默认API Key</li>
            <li>其他模型：请前往各提供商官网获取API Key</li>
            <li>每个模型的API Key会分别保存，切换模型时自动加载</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
