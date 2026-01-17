import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { PromptConfig } from '../types';
import { parseTemplate, extractVariables } from '../utils/promptTemplate';
import { FiX, FiChevronLeft, FiSave, FiRefreshCw } from 'react-icons/fi';

export default function PromptPanel() {
  const { state, dispatch } = useApp();
  const [systemPrompt, setSystemPrompt] = useState(state.promptConfig.systemPrompt);
  const [userPromptTemplate, setUserPromptTemplate] = useState(state.promptConfig.userPromptTemplate);
  const [previewInput, setPreviewInput] = useState('示例消息');

  useEffect(() => {
    setSystemPrompt(state.promptConfig.systemPrompt);
    setUserPromptTemplate(state.promptConfig.userPromptTemplate);
  }, [state.promptConfig]);

  const handleSave = () => {
    const config: PromptConfig = {
      systemPrompt,
      userPromptTemplate,
    };
    dispatch({ type: 'SET_PROMPT_CONFIG', payload: config });
  };

  const handleReset = () => {
    if (confirm('确定要重置为默认提示词吗？')) {
      const defaultConfig: PromptConfig = {
        systemPrompt: 'You are a helpful AI assistant.',
        userPromptTemplate: '{{user_input}}',
      };
      setSystemPrompt(defaultConfig.systemPrompt);
      setUserPromptTemplate(defaultConfig.userPromptTemplate);
      dispatch({ type: 'SET_PROMPT_CONFIG', payload: defaultConfig });
    }
  };

  const previewFinalPrompt = parseTemplate(userPromptTemplate, {
    user_input: previewInput,
    date: new Date().toLocaleDateString('zh-CN'),
    time: new Date().toLocaleTimeString('zh-CN'),
  });

  const variables = extractVariables(userPromptTemplate);

  if (state.promptPanelCollapsed) {
    return (
      <div className="w-12 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col items-center p-2">
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
    <div className="w-96 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full">
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
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            用于定义AI的角色、行为和边界
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            用户提示词模板 (User Prompt Template)
          </label>
          <textarea
            value={userPromptTemplate}
            onChange={(e) => setUserPromptTemplate(e.target.value)}
            placeholder="{{user_input}}"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            支持变量: {variables.length > 0 ? variables.map(v => `{{${v}}}`).join(', ') : '无'}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            可用变量: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">user_input</code>,{' '}
            <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">date</code>,{' '}
            <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">time</code>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            预览
          </label>
          <input
            type="text"
            value={previewInput}
            onChange={(e) => setPreviewInput(e.target.value)}
            placeholder="输入示例消息"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-2"
          />
          <div className="p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              最终发送的提示词:
            </div>
            <div className="text-sm text-gray-900 dark:text-gray-100 font-mono whitespace-pre-wrap break-words">
              {previewFinalPrompt}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
