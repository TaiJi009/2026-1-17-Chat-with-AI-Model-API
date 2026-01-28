import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { PromptConfig } from '../types';
import { FiX, FiChevronLeft, FiSave, FiRefreshCw } from 'react-icons/fi';
import { getDefaultSystemPrompt, getDefaultSystemPromptSync } from '../utils/defaultSystemPrompt';

export default function PromptPanel() {
  const { state, dispatch } = useApp();
  const [systemPrompt, setSystemPrompt] = useState(state.promptConfig.systemPrompt);

  useEffect(() => {
    setSystemPrompt(state.promptConfig.systemPrompt);
  }, [state.promptConfig]);

  const handleSave = () => {
    const config: PromptConfig = {
      systemPrompt,
    };
    dispatch({ type: 'SET_PROMPT_CONFIG', payload: config });
  };

  const handleReset = async () => {
    try {
      // 尝试从文件读取最新的默认提示词
      const defaultPrompt = await getDefaultSystemPrompt();
      const defaultConfig: PromptConfig = {
        systemPrompt: defaultPrompt,
      };
      setSystemPrompt(defaultConfig.systemPrompt);
      dispatch({ type: 'SET_PROMPT_CONFIG', payload: defaultConfig });
    } catch (error) {
      // 如果读取失败，使用同步的默认值
      const defaultPrompt = getDefaultSystemPromptSync();
      const defaultConfig: PromptConfig = {
        systemPrompt: defaultPrompt,
      };
      setSystemPrompt(defaultConfig.systemPrompt);
      dispatch({ type: 'SET_PROMPT_CONFIG', payload: defaultConfig });
    }
  };

  if (state.promptPanelCollapsed) {
    return (
      <div className="hidden lg:flex w-12 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex-col items-center p-2">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_PROMPT_PANEL' })}
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
          title="展开提示词配置"
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className={`absolute lg:relative z-20 lg:z-auto right-0 w-full sm:w-80 lg:w-96 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full shadow-lg lg:shadow-none`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">提示词配置</h2>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_PROMPT_PANEL' })}
            className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <FiSave className="w-4 h-4" />
            保存
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center justify-center gap-2"
            title="重置为默认值"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
              💡 默认提示词来自 <code>Prompt-2.0.md</code>（位于 <code>prompt-engineering/</code> 目录），当该文件发生变更时，点击重置按钮可同步最新版本。
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
