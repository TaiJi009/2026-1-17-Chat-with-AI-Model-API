import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { SyntaxHighlighterProps } from 'react-syntax-highlighter';
import { useApp } from '../contexts/AppContext';
import { FiUser, FiMessageCircle, FiCopy, FiCheck, FiEdit2, FiSend, FiX } from 'react-icons/fi';
import { callModelAPI } from '../utils/apiService';
import { parseAIResponse } from '../utils/responseParser';
import ThinkingDisplay from './ThinkingDisplay';
import { Message } from '../types';

export default function MessageList() {
  const { state, dispatch } = useApp();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isResending, setIsResending] = useState(false);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  const currentConversation = state.conversations.find(
    c => c.id === state.currentConversationId
  );

  const messages = currentConversation?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCopy = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleStartEdit = (message: Message) => {
    if (message.role !== 'user') return;
    setEditingId(message.id);
    setEditContent(message.content);
    // 聚焦到编辑框
    setTimeout(() => {
      editTextareaRef.current?.focus();
      if (editTextareaRef.current) {
        editTextareaRef.current.style.height = 'auto';
        editTextareaRef.current.style.height = `${editTextareaRef.current.scrollHeight}px`;
      }
    }, 0);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  // 获取当前模型的API Key
  const getCurrentApiKey = (): string => {
    const savedKey = state.apiConfig.apiKeys?.[state.apiConfig.provider];
    if (savedKey) {
      return savedKey;
    }
    // 默认值（仅在智谱且用户未保存时使用）
    if (state.apiConfig.provider === 'zhipu') {
      return '403c7c9f1f124bf684a881fa01376bb8.IzkE5f2FI6WcXmJB';
    }
    return '';
  };

  const handleResend = async (messageId: string) => {
    const currentApiKey = getCurrentApiKey();
    if (!currentConversation || !currentApiKey || isResending || !editContent.trim()) {
      return;
    }

    setIsResending(true);

    try {
      // 1. 获取要保留的消息（该消息及之前的所有消息）
      const messageIndex = currentConversation.messages.findIndex(m => m.id === messageId);
      const messagesToKeep = currentConversation.messages
        .slice(0, messageIndex + 1)
        .map(m => m.id === messageId ? { ...m, content: editContent.trim() } : m);

      // 2. 更新用户消息内容
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          conversationId: currentConversation.id,
          messageId: messageId,
          content: editContent.trim(),
        },
      });

      // 3. 删除该消息之后的所有消息
      dispatch({
        type: 'DELETE_MESSAGES_AFTER',
        payload: {
          conversationId: currentConversation.id,
          messageId: messageId,
        },
      });

      // 构建消息数组（包含系统提示词）
      const messagesToSend: Message[] = [];
      
      if (state.promptConfig.systemPrompt.trim()) {
        messagesToSend.push({
          id: `msg-system`,
          role: 'system',
          content: state.promptConfig.systemPrompt,
          timestamp: Date.now(),
        });
      }

      // 添加对话历史（排除system消息）
      messagesToSend.push(...messagesToKeep.filter(m => m.role !== 'system'));

      // 创建新的AI回复消息
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

      // 先清除编辑状态，让消息恢复到正常显示
      setEditingId(null);
      setEditContent('');

      // 调用模型API
      const responseContent = await callModelAPI(state.apiConfig, messagesToSend);

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
    } catch (error) {
      console.error('重新发送失败:', error);
      const errorMessage = error instanceof Error ? error.message : '重新发送失败';
      
      // 清除编辑状态
      setEditingId(null);
      setEditContent('');
      
      const assistantMessageId = `msg-${Date.now()}-assistant`;
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          conversationId: currentConversation.id,
          message: {
            id: assistantMessageId,
            role: 'assistant',
            content: `错误: ${errorMessage}`,
            timestamp: Date.now(),
          },
        },
      });
    } finally {
      setIsResending(false);
    }
  };

  if (!currentConversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <p className="text-lg mb-2">选择一个会话开始对话</p>
          <p className="text-sm">或创建一个新会话</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <p className="text-lg mb-2">开始新的对话</p>
          <p className="text-sm">在下方输入框中输入消息</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-2 sm:gap-4 ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          {message.role === 'assistant' && (
            <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
              <FiMessageCircle className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
            </div>
          )}

          <div
            className={`max-w-[85%] sm:max-w-3xl rounded-lg p-2 sm:p-4 text-sm sm:text-base relative group ${
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
            }`}
          >
            {editingId === message.id && message.role === 'user' ? (
              <div className="space-y-2">
                <textarea
                  ref={editTextareaRef}
                  value={editContent}
                  onChange={(e) => {
                    setEditContent(e.target.value);
                    if (editTextareaRef.current) {
                      editTextareaRef.current.style.height = 'auto';
                      editTextareaRef.current.style.height = `${editTextareaRef.current.scrollHeight}px`;
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (!isResending && editContent.trim()) {
                        handleResend(message.id);
                      }
                    }
                    if (e.key === 'Escape') {
                      handleCancelEdit();
                    }
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-blue-300 dark:border-blue-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  rows={3}
                  disabled={isResending}
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={handleCancelEdit}
                    disabled={isResending}
                    className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiX className="w-4 h-4 inline mr-1" />
                    取消
                  </button>
                  <button
                    onClick={() => handleResend(message.id)}
                    disabled={isResending || !editContent.trim()}
                    className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <FiSend className="w-4 h-4" />
                    {isResending ? '发送中...' : '发送'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* AI消息：如果包含思维链和回答，使用ThinkingDisplay；否则使用传统显示 */}
                {message.role === 'assistant' && (message.thinkingChain || message.answer || message.content.match(/<思维链>|<回答>/)) ? (
                  <ThinkingDisplay
                    thinkingChain={message.thinkingChain || parseAIResponse(message.content).thinkingChain}
                    answer={message.answer || parseAIResponse(message.content).answer}
                    isStreaming={message.isStreaming}
                    theme={state.theme}
                  />
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        code({ className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          const inline = !match;
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={state.theme === 'dark' ? vscDarkPlus : vs}
                              language={match[1]}
                              PreTag="div"
                              {...(props as SyntaxHighlighterProps)}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
                <div className="flex items-center justify-between mt-2">
                  <div
                    className={`text-xs ${
                      message.role === 'user'
                        ? 'text-blue-100'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                  <div className="flex items-center gap-1">
                    {message.role === 'user' && (
                      <button
                        onClick={() => handleStartEdit(message)}
                        className="p-1.5 rounded hover:bg-opacity-20 transition-all hover:bg-white text-blue-100 hover:text-white"
                        title="重新编辑"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleCopy(message.content, message.id)}
                      className={`p-1.5 rounded hover:bg-opacity-20 transition-all ${
                        message.role === 'user'
                          ? 'hover:bg-white text-blue-100 hover:text-white'
                          : 'hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                      title="复制消息"
                    >
                      {copiedId === message.id ? (
                        <FiCheck className="w-4 h-4" />
                      ) : (
                        <FiCopy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {message.role === 'user' && (
            <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center">
              <FiUser className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
