import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { PromptConfig, ApiConfig } from '../types';
import { getProviderDisplayName, ApiProvider } from '../utils/apiService';
import { getDefaultSystemPrompt, getDefaultSystemPromptSync } from '../utils/defaultSystemPrompt';
import { FiX, FiSave, FiRefreshCw, FiKey, FiLock, FiCreditCard, FiFileText } from 'react-icons/fi';

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

type SettingsTab = 'prompt' | 'api';

export default function SettingsPanel() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<SettingsTab>('prompt');
  
  // 提示词相关状态
  const [systemPrompt, setSystemPrompt] = useState(state.promptConfig.systemPrompt);
  
  // API配置相关状态
  const [provider, setProvider] = useState<ApiProvider>(state.apiConfig.provider);
  const [apiKey, setApiKey] = useState('');

  // 同步提示词状态
  useEffect(() => {
    setSystemPrompt(state.promptConfig.systemPrompt);
  }, [state.promptConfig]);

  // 获取当前模型的API Key
  const getCurrentApiKey = (targetProvider: ApiProvider): string => {
    const savedKey = state.apiConfig.apiKeys?.[targetProvider];
    if (savedKey) {
      return savedKey;
    }
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

  // 保存提示词配置
  const handleSavePrompt = () => {
    const config: PromptConfig = {
      systemPrompt,
    };
    dispatch({ type: 'SET_PROMPT_CONFIG', payload: config });
  };

  // 重置提示词配置
  const handleResetPrompt = async () => {
    if (confirm('确定要重置为默认提示词吗？')) {
      try {
        const defaultPrompt = await getDefaultSystemPrompt();
        const defaultConfig: PromptConfig = {
          systemPrompt: defaultPrompt,
        };
        setSystemPrompt(defaultConfig.systemPrompt);
        dispatch({ type: 'SET_PROMPT_CONFIG', payload: defaultConfig });
      } catch (error) {
        const defaultPrompt = getDefaultSystemPromptSync();
        const defaultConfig: PromptConfig = {
          systemPrompt: defaultPrompt,
        };
        setSystemPrompt(defaultConfig.systemPrompt);
        dispatch({ type: 'SET_PROMPT_CONFIG', payload: defaultConfig });
      }
    }
  };

  // 保存API配置
  const handleSaveApi = () => {
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

  // 切换模型提供商
  const handleProviderChange = (newProvider: ApiProvider) => {
    setProvider(newProvider);
    const updatedApiKeys = { ...state.apiConfig.apiKeys };
    dispatch({ 
      type: 'SET_API_CONFIG', 
      payload: { 
        provider: newProvider, 
        apiKeys: updatedApiKeys 
      } 
    });
  };

  // 前往充值
  const handleRecharge = () => {
    const rechargeUrl = RECHARGE_LINKS[provider];
    if (rechargeUrl) {
      window.open(rechargeUrl, '_blank');
    }
  };

  // 重置API Key
  const handleResetApi = () => {
    if (confirm(`确定要重置 ${getProviderDisplayName(provider)} 的API Key吗？`)) {
      const defaultKey = DEFAULT_API_KEYS[provider] || '';
      setApiKey(defaultKey);
      
      if (state.apiConfig.apiKeys?.[provider]) {
        const updatedApiKeys = { ...state.apiConfig.apiKeys };
        delete updatedApiKeys[provider];
        
        const config: ApiConfig = {
          provider: state.apiConfig.provider,
          apiKeys: updatedApiKeys,
        };
        dispatch({ type: 'SET_API_CONFIG', payload: config });
      }
    }
  };

  const providers: ApiProvider[] = ['zhipu', 'openai', 'claude', 'tongyi', 'wenxin', 'spark', 'doubao'];

  if (state.settingsPanelCollapsed) {
    return null;
  }

  return (
    <>
      {/* 移动端遮罩层 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
        onClick={() => dispatch({ type: 'TOGGLE_SETTINGS_PANEL' })}
      />
      
      {/* 设置面板 */}
      <div className="fixed sm:relative left-0 bottom-0 sm:bottom-auto w-full sm:w-96 h-[80vh] sm:h-full bg-gray-50 dark:bg-gray-900 border-t sm:border-l border-gray-200 dark:border-gray-700 flex flex-col shadow-lg sm:shadow-none z-50 sm:z-auto flex-shrink-0">
        {/* 头部 */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">设置</h2>
            <button
              onClick={() => dispatch({ type: 'TOGGLE_SETTINGS_PANEL' })}
              className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          {/* 标签页切换 */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('prompt')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'prompt'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <FiFileText className="w-4 h-4 inline mr-1" />
              提示词工程
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'api'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <FiKey className="w-4 h-4 inline mr-1" />
              API配置
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'prompt' ? (
            <div className="p-4 space-y-4">
              {/* 提示词工程内容 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  系统提示词 (System Prompt)
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="定义AI的角色和行为..."
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  用于定义AI的角色、行为和边界。系统提示词会在每次对话开始时发送给AI模型。
                  <br />
                  <span className="text-blue-600 dark:text-blue-400">
                    💡 默认提示词来自 <code>系统默认提示词工程.md</code>，当该文件发生变更时，点击重置按钮可同步最新版本。
                  </span>
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSavePrompt}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <FiSave className="w-4 h-4" />
                  保存
                </button>
                <button
                  onClick={handleResetPrompt}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center justify-center gap-2"
                  title="重置为默认值"
                >
                  <FiRefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* API配置内容 */}
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
                    onClick={handleResetApi}
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

              <button
                onClick={handleSaveApi}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <FiSave className="w-4 h-4" />
                保存配置
              </button>

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
          )}
        </div>
      </div>
    </>
  );
}
