import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { useApp } from '../contexts/AppContext';
import { Message } from '../types';
import { callAPI } from '../utils/api';
import { parseTemplate } from '../utils/promptTemplate';
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

  const handleSend = async () => {
    if (!input.trim() || !currentConversation || !state.apiConfig || isLoading) {
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

    const userInput = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Apply prompt template
      const finalUserContent = parseTemplate(state.promptConfig.userPromptTemplate, {
        user_input: userInput,
        date: new Date().toLocaleDateString('zh-CN'),
        time: new Date().toLocaleTimeString('zh-CN'),
      });

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

      // Add new user message with template applied
      messages.push({
        ...userMessage,
        content: finalUserContent,
      });

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

      // Call API with streaming
      await callAPI(
        state.apiConfig,
        messages,
        (chunk) => {
          dispatch({
            type: 'UPDATE_MESSAGE',
            payload: {
              conversationId: currentConversation.id,
              messageId: assistantMessageId,
              content: assistantMessage.content + chunk,
            },
          });
          assistantMessage.content += chunk;
        }
      );
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

  if (!state.apiConfig) {
    return (
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
        请先配置API连接
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4">
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
            className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <button
          onClick={handleClear}
          disabled={isLoading || currentConversation.messages.length === 0}
          className="p-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          title="清空对话"
        >
          <FiTrash2 className="w-5 h-5" />
        </button>
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          title="发送 (Enter)"
        >
          <FiSend className="w-5 h-5" />
        </button>
      </div>
      {isLoading && (
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
          AI正在思考...
        </div>
      )}
    </div>
  );
}
