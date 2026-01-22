import { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { PromptConfig, ApiConfig, N8NConfig } from '../types';
import { getProviderDisplayName, ApiProvider } from '../utils/apiService';
import { getDefaultSystemPrompt, getDefaultSystemPromptSync } from '../utils/defaultSystemPrompt';
import { FiX, FiSave, FiRefreshCw, FiKey, FiLock, FiCreditCard, FiFileText, FiLink, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

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

type SettingsTab = 'api' | 'n8n';

export default function SettingsPanel() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<SettingsTab>('api');
  
  // 提示词相关状态
  const [systemPrompt, setSystemPrompt] = useState(state.promptConfig.systemPrompt);
  
  // API配置相关状态
  const [provider, setProvider] = useState<ApiProvider>(state.apiConfig.provider);
  const [apiKey, setApiKey] = useState('');

  // N8N配置相关状态
  const [n8nUrl, setN8nUrl] = useState(state.n8nConfig.url);
  const [n8nUrlType, setN8nUrlType] = useState<'webhook' | 'http_request'>(state.n8nConfig.urlType);
  const [n8nMethod, setN8nMethod] = useState<'POST' | 'GET'>(state.n8nConfig.method);
  const [n8nApiKey, setN8nApiKey] = useState(state.n8nConfig.apiKey || '');

  // 同步提示词状态
  useEffect(() => {
    setSystemPrompt(state.promptConfig.systemPrompt);
  }, [state.promptConfig]);

  // 用于跟踪上次检查的文件内容，避免重复更新
  const lastFileContentRef = useRef<string>('');

  // 自动同步 系统默认提示词工程.md 文件内容
  useEffect(() => {
    let syncInterval: number | null = null;

    const checkAndSyncPrompt = async () => {
      try {
        const defaultPrompt = await getDefaultSystemPrompt();
        const currentContent = defaultPrompt.trim();
        
        // 如果内容有变化，且与当前配置不同，则自动同步
        if (currentContent && 
            currentContent !== lastFileContentRef.current && 
            currentContent !== state.promptConfig.systemPrompt.trim()) {
          lastFileContentRef.current = currentContent;
          // 自动更新系统提示词配置
          const config: PromptConfig = {
            systemPrompt: defaultPrompt,
          };
          dispatch({ type: 'SET_PROMPT_CONFIG', payload: config });
          // 更新本地状态
          setSystemPrompt(defaultPrompt);
          console.log('✓ 已自动同步 系统默认提示词工程.md 的最新内容');
        } else if (lastFileContentRef.current === '') {
          // 初始化时记录当前内容
          lastFileContentRef.current = currentContent;
        }
      } catch (error) {
        // 静默失败，不影响正常使用
      }
    };

    // 立即检查一次
    checkAndSyncPrompt();

    // 每 2 秒检查一次文件是否有更新
    syncInterval = setInterval(checkAndSyncPrompt, 2000);

    return () => {
      if (syncInterval !== null) {
        clearInterval(syncInterval);
      }
    };
  }, [state.promptConfig.systemPrompt, dispatch]);

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

  // 同步N8N配置状态
  useEffect(() => {
    setN8nUrl(state.n8nConfig.url);
    setN8nUrlType(state.n8nConfig.urlType);
    setN8nMethod(state.n8nConfig.method);
    setN8nApiKey(state.n8nConfig.apiKey || '');
  }, [state.n8nConfig]);

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

  // 保存N8N配置
  const handleSaveN8N = () => {
    const config: N8NConfig = {
      url: n8nUrl.trim(),
      urlType: n8nUrlType,
      method: n8nMethod,
      apiKey: n8nApiKey.trim() || undefined,
    };
    dispatch({ type: 'SET_N8N_CONFIG', payload: config });
  };

  // 切换N8N模式
  const handleToggleN8N = () => {
    const newUseN8N = !state.useN8N;
    if (newUseN8N && !state.n8nConfig.url.trim()) {
      alert('请先配置N8N URL后再启用N8N模式');
      return;
    }
    if (newUseN8N && !confirm('切换到N8N模式后，API配置和提示词配置将被禁用。确定要继续吗？')) {
      return;
    }
    dispatch({ type: 'SET_USE_N8N', payload: newUseN8N });
    if (newUseN8N) {
      setActiveTab('n8n');
    } else {
      // 切换回传统模式时，切换到API配置标签页
      setActiveTab('api');
    }
  };

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

          {/* 当前模式显示 */}
          <div className="mb-3 p-2 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-800 dark:text-blue-200">
                当前模式：
              </span>
              <span className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                {state.useN8N ? 'N8N' : '传统API'}
              </span>
            </div>
          </div>

          {/* 标签页切换 */}
          <div className="flex gap-2">
            <button
              onClick={() => !state.useN8N && setActiveTab('api')}
              disabled={state.useN8N}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'api'
                  ? 'bg-blue-600 text-white'
                  : state.useN8N
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
              title={state.useN8N ? 'N8N模式下已禁用' : 'API配置'}
            >
              <FiKey className="w-4 h-4 inline mr-1" />
              API配置
            </button>
            <button
              onClick={() => setActiveTab('n8n')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'n8n'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <FiLink className="w-4 h-4 inline mr-1" />
              N8N配置
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'api' ? (
            <div className="p-4 space-y-4">
              {/* N8N模式下的提示信息 */}
              {state.useN8N && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    <strong>提示：</strong> 当前使用N8N模式，API配置和提示词配置已禁用。
                  </p>
                </div>
              )}

              {/* API配置区域 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  API配置
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      模型提供商
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={provider}
                        onChange={(e) => handleProviderChange(e.target.value as ApiProvider)}
                        disabled={state.useN8N}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {providers.map((p) => (
                          <option key={p} value={p}>
                            {getProviderDisplayName(p)}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleRecharge}
                        disabled={state.useN8N}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        title="前往充值"
                      >
                        <FiCreditCard className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleResetApi}
                        disabled={state.useN8N}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
                      disabled={state.useN8N}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      API Key以密码形式保护，仅存储在本地浏览器中，不会上传到服务器。请在安全的设备上使用。
                    </p>
                  </div>

                  <button
                    onClick={handleSaveApi}
                    disabled={state.useN8N}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSave className="w-4 h-4" />
                    保存API配置
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
              </div>

              {/* 分隔线 */}
              <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

              {/* 提示词配置区域 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  <FiFileText className="w-4 h-4 inline mr-1" />
                  提示词工程
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      系统提示词 (System Prompt)
                    </label>
                    <textarea
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      placeholder="定义AI的角色和行为..."
                      rows={10}
                      disabled={state.useN8N}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                      disabled={state.useN8N}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiSave className="w-4 h-4" />
                      保存提示词
                    </button>
                    <button
                      onClick={handleResetPrompt}
                      disabled={state.useN8N}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="重置为默认值"
                    >
                      <FiRefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'n8n' ? (
            <div className="p-4 space-y-4">
              {/* N8N模式切换 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  启用N8N模式
                </label>
                <button
                  onClick={handleToggleN8N}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    state.useN8N
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {state.useN8N ? (
                    <>
                      <FiToggleRight className="w-5 h-5" />
                      已启用
                    </>
                  ) : (
                    <>
                      <FiToggleLeft className="w-5 h-5" />
                      未启用
                    </>
                  )}
                </button>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {state.useN8N
                    ? '当前使用N8N模式，API配置和提示词配置已禁用'
                    : '启用后将禁用API配置和提示词配置，仅使用N8N链接进行对话'}
                </p>
              </div>

              {/* N8N URL配置 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FiLink className="w-4 h-4 inline mr-1" />
                  N8N URL
                </label>
                <input
                  type="text"
                  value={n8nUrl}
                  onChange={(e) => setN8nUrl(e.target.value)}
                  placeholder="https://your-n8n-instance.com/webhook/..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  输入N8N的webhook或HTTP Request URL
                </p>
              </div>

              {/* URL类型选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL类型
                </label>
                <select
                  value={n8nUrlType}
                  onChange={(e) => setN8nUrlType(e.target.value as 'webhook' | 'http_request')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="webhook">Webhook</option>
                  <option value="http_request">HTTP Request</option>
                </select>
              </div>

              {/* HTTP方法选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  HTTP方法
                </label>
                <select
                  value={n8nMethod}
                  onChange={(e) => setN8nMethod(e.target.value as 'POST' | 'GET')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="POST">POST</option>
                  <option value="GET">GET</option>
                </select>
              </div>

              {/* API Key（可选） */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FiLock className="w-4 h-4 inline mr-1" />
                  API Key（可选）
                </label>
                <input
                  type="password"
                  value={n8nApiKey}
                  onChange={(e) => setN8nApiKey(e.target.value)}
                  placeholder="如果需要认证，请输入API Key..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  如果N8N需要认证，请在此输入API Key或Token
                </p>
              </div>

              <button
                onClick={handleSaveN8N}
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
                  <li>N8N模式启用后，将使用N8N链接进行对话</li>
                  <li>API配置和提示词配置在N8N模式下将被禁用</li>
                  <li>系统提示词不会发送给N8N（N8N内部已配置）</li>
                  <li>请确保N8N URL可访问且配置正确</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
