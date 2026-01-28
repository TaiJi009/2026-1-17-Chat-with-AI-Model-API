import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { useApp } from '../contexts/AppContext';
import { Message, Conversation } from '../types';
import { callModelAPI } from '../utils/apiService';
import { getThinkingSystemPrompt, getDefaultSystemPromptSync } from '../utils/defaultSystemPrompt';
import { parseAIResponse, parseAIResponseStreaming } from '../utils/responseParser';
import { generateTitle } from '../utils/titleGenerator';
import { FiSend, FiTrash2 } from 'react-icons/fi';
import { debug } from '../utils/debug';

export default function MessageInput() {
  const { state, dispatch } = useApp();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentConversation = state.currentConversationId
    ? state.conversations.find(c => c.id === state.currentConversationId)
    : null;

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
    if (!input.trim() || !currentApiKey || isLoading) {
      return;
    }

    // 如果当前没有会话（空白对话框），创建新会话
    let conversationToUse = currentConversation;
    if (!conversationToUse) {
      const newConversation: Conversation = {
        id: `conv-${Date.now()}`,
        name: `会话 ${state.conversations.length + 1}`,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      dispatch({ type: 'ADD_CONVERSATION', payload: newConversation });
      conversationToUse = newConversation;
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    dispatch({
      type: 'ADD_MESSAGE',
      payload: { conversationId: conversationToUse.id, message: userMessage },
    });

    setInput('');
    setIsLoading(true);

    let assistantMessageId = '';

    try {
      const provider = state.apiConfig.provider;
      const useStream = provider === 'openai' || provider === 'zhipu';
      const history = conversationToUse.messages.filter(m => m.role !== 'system');

      // 第一段：仅生成思考过程（专用 system + 历史 + 用户消息）
      const systemThinking = await getThinkingSystemPrompt();
      const messages1: Message[] = [
        { id: 'msg-system-thinking', role: 'system', content: systemThinking, timestamp: Date.now() },
        ...history,
        userMessage,
      ];

      assistantMessageId = `msg-${Date.now()}-assistant`;
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
      };

      dispatch({
        type: 'ADD_MESSAGE',
        payload: { conversationId: conversationToUse.id, message: assistantMessage },
      });

      let thinkingFull: string;
      if (useStream) {
        const response1 = await callModelAPI(state.apiConfig, messages1, {
          onChunk(accumulated) {
            const { thinkingChain } = parseAIResponseStreaming(accumulated);
            const part = thinkingChain || accumulated.trim();
            dispatch({
              type: 'UPDATE_MESSAGE',
              payload: {
                conversationId: conversationToUse.id,
                messageId: assistantMessageId,
                content: '<思考过程>' + part + '</思考过程><回答></回答>',
              },
            });
          },
        });
        const parsed1 = parseAIResponse(response1);
        thinkingFull = parsed1.thinkingChain || response1.trim();
      } else {
        const response1 = await callModelAPI(state.apiConfig, messages1);
        const parsed1 = parseAIResponse(response1);
        thinkingFull = parsed1.thinkingChain || response1.trim();
      }

      // 第二段：以思考过程为 system 的一部分，仅生成回答（不带历史）
      const baseSystem = state.promptConfig.systemPrompt.trim() || getDefaultSystemPromptSync();
      const system2 = baseSystem + '\n\n【本轮的思考过程】\n' + thinkingFull;
      const messages2: Message[] = [
        { id: 'msg-system-answer', role: 'system', content: system2, timestamp: Date.now() },
        { id: 'msg-user-answer-prompt', role: 'user', content: '请根据上述思考过程，仅输出 <回答>...</回答>', timestamp: Date.now() },
      ];

      try {
        if (useStream) {
          const response2 = await callModelAPI(state.apiConfig, messages2, {
            onChunk(accumulatedAnswer) {
              dispatch({
                type: 'UPDATE_MESSAGE',
                payload: {
                  conversationId: conversationToUse.id,
                  messageId: assistantMessageId,
                  content: '<思考过程>' + thinkingFull + '</思考过程><回答>' + accumulatedAnswer + '</回答>',
                },
              });
            },
          });
          assistantMessage.content = '<思考过程>' + thinkingFull + '</思考过程><回答>' + response2 + '</回答>';
        } else {
          const response2 = await callModelAPI(state.apiConfig, messages2);
          const parsed2 = parseAIResponse(response2);
          const answerPart = parsed2.answer || response2.trim();
          assistantMessage.content = '<思考过程>' + thinkingFull + '</思考过程><回答>' + answerPart + '</回答>';
        }
      } catch (stage2Error) {
        const errMsg = stage2Error instanceof Error ? stage2Error.message : '生成回答失败';
        assistantMessage.content = '<思考过程>' + thinkingFull + '</思考过程><回答>错误: ' + errMsg + '</回答>';
      }

      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          conversationId: conversationToUse.id,
          messageId: assistantMessageId,
          content: assistantMessage.content,
        },
      });
      dispatch({
        type: 'SET_MESSAGE_STREAMING',
        payload: {
          conversationId: conversationToUse.id,
          messageId: assistantMessageId,
          isStreaming: false,
        },
      });

      const messagesBeforeSend = conversationToUse.messages.filter(m => m.role !== 'system');
      const isFirstRound = messagesBeforeSend.length === 0;
      if (isFirstRound && !conversationToUse.isManuallyRenamed) {
        const autoTitle = generateTitle(userMessage.content, assistantMessage.content);
        dispatch({
          type: 'UPDATE_CONVERSATION_TITLE',
          payload: {
            conversationId: conversationToUse.id,
            title: autoTitle,
          },
        });
      }
    } catch (error) {
      // #region agent log
      debug.error('MessageInput: Send message error', error, 'message-send-error');
      // #endregion
      console.error('Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : '发送消息失败';
      if (assistantMessageId) {
        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: {
            conversationId: conversationToUse.id,
            messageId: assistantMessageId,
            content: `错误: ${errorMessage}`,
          },
        });
        dispatch({
          type: 'SET_MESSAGE_STREAMING',
          payload: {
            conversationId: conversationToUse.id,
            messageId: assistantMessageId,
            isStreaming: false,
          },
        });
      }
    } finally {
      setIsLoading(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleClear = () => {
    if (!currentConversation) return;
    dispatch({ type: 'CLEAR_CONVERSATION', payload: currentConversation.id });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 移除这个检查，允许在空白对话框状态下显示输入框

  const currentApiKey = getCurrentApiKey();
  if (!currentApiKey) {
    return (
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
        请先在设置中配置API Key
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-2 sm:p-4 relative">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="有什么想聊的尽情跟我说一下吧~~~"
            disabled={isLoading}
            rows={1}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <button
          onClick={handleClear}
          disabled={isLoading || !currentConversation || currentConversation.messages.length === 0}
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
    </div>
  );
}
