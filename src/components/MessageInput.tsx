import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { useApp } from '../contexts/AppContext';
import { Message } from '../types';
import { callModelAPI } from '../utils/apiService';
import { generateTitle } from '../utils/titleGenerator';
import { parseAIResponse } from '../utils/responseParser';
import { FiSend, FiTrash2 } from 'react-icons/fi';

export default function MessageInput() {
  const { state, dispatch } = useApp();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentConversation = state.conversations.find(
    c => c.id === state.currentConversationId
  );

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // 获取当前模型的API Key
  const getCurrentApiKey = (): string => {
    const savedKey = state.apiConfig.apiKeys?.[state.apiConfig.provider];
    // 如果用户保存过，使用保存的；否则智谱使用默认值，其他为空
    if (savedKey) {
      return savedKey;
    }
    // 默认值（仅在智谱且用户未保存时使用）
    if (state.apiConfig.provider === 'zhipu') {
      return '403c7c9f1f124bf684a881fa01376bb8.IzkE5f2FI6WcXmJB';
    }
    return '';
  };

  const handleSend = async () => {
    const currentApiKey = getCurrentApiKey();
    if (!input.trim() || !currentConversation || !currentApiKey || isLoading) {
      return;
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    dispatch({
      type: 'ADD_MESSAGE',
      payload: { conversationId: currentConversation.id, message: userMessage },
    });

    setInput('');
    setIsLoading(true);

    try {
      // Build messages array
      const messages: Message[] = [];
      
      // Add system prompt if provided
      if (state.promptConfig.systemPrompt.trim()) {
        messages.push({
          id: `msg-system`,
          role: 'system',
          content: state.promptConfig.systemPrompt,
          timestamp: Date.now(),
        });
      }

      // Add conversation history (excluding system messages as they're already handled)
      messages.push(...currentConversation.messages.filter(m => m.role !== 'system'));

      // Add new user message (no template processing)
      messages.push(userMessage);

      // Create assistant message
      const assistantMessageId = `msg-${Date.now()}-assistant`;
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };

      dispatch({
        type: 'ADD_MESSAGE',
        payload: { conversationId: currentConversation.id, message: assistantMessage },
      });

      // 记录发送前的消息数量，用于判断是否是第一轮对话
      const messagesBeforeSend = currentConversation.messages.filter(m => m.role !== 'system');
      const isFirstRound = messagesBeforeSend.length === 0;

      // Call model API
      const responseContent = await callModelAPI(state.apiConfig, messages);

      // Update assistant message with response
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          conversationId: currentConversation.id,
          messageId: assistantMessageId,
          content: responseContent,
        },
      });
      assistantMessage.content = responseContent;

      // 检测第一轮对话完成并自动生成标题
      // 第一轮对话：发送前没有消息（不包括system消息），且未手动重命名
      if (isFirstRound && !currentConversation.isManuallyRenamed) {
        const autoTitle = generateTitle(userMessage.content, assistantMessage.content);
        
        dispatch({
          type: 'UPDATE_CONVERSATION_TITLE',
          payload: {
            conversationId: currentConversation.id,
            title: autoTitle,
          },
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : '发送消息失败';
      
      // Update the assistant message with error
      const assistantMessageId = `msg-${Date.now()}-assistant`;
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          conversationId: currentConversation.id,
          messageId: assistantMessageId,
          content: `错误: ${errorMessage}`,
        },
      });
    } finally {
      setIsLoading(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleClear = () => {
    if (!currentConversation) return;
    if (confirm('确定要清空当前对话吗？')) {
      dispatch({ type: 'CLEAR_CONVERSATION', payload: currentConversation.id });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!currentConversation) {
    return (
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
        请先选择一个会话或创建新会话
      </div>
    );
  }

  const currentApiKey = getCurrentApiKey();
  if (!currentApiKey) {
    return (
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
        请先在右侧API配置面板中设置API Key
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-2 sm:p-4">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息... (Shift+Enter 换行，Enter 发送)"
            disabled={isLoading}
            rows={1}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <button
          onClick={handleClear}
          disabled={isLoading || currentConversation.messages.length === 0}
          className="p-2 sm:p-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          title="清空对话"
        >
          <FiTrash2 className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="p-2 sm:p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex-shrink-0"
          title="发送 (Enter)"
        >
          <FiSend className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
      {isLoading && (
        <div className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
          AI正在思考...
        </div>
      )}
    </div>
  );
}
