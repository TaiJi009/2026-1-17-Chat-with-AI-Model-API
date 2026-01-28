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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  const currentConversation = state.conversations.find(
    c => c.id === state.currentConversationId
  );

  const messages = currentConversation?.messages || [];

  // 检查是否在底部附近（距离底部100px内）
  const checkIfNearBottom = () => {
    if (!messagesContainerRef.current) return false;
    const container = messagesContainerRef.current;
    const threshold = 100; // 距离底部100px内算作底部
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    return distanceFromBottom <= threshold;
  };

  // 监听滚动事件，检测用户是否手动滚动
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const nearBottom = checkIfNearBottom();
      setShouldAutoScroll(nearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    // 初始化时检查是否在底部
    handleScroll();
    
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // 消息变化时，如果用户在底部附近则自动滚动
  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      // 使用兼容性更好的滚动方式
      try {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      } catch (e) {
        // 降级方案：直接滚动到底部
        messagesEndRef.current.scrollIntoView();
      }
    }
  }, [messages, shouldAutoScroll]);

      // 监听容器高度变化（AI回复内容变化时），如果用户在底部则滚动
      useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        if (typeof MutationObserver === 'undefined') {
          const fallbackInterval = setInterval(() => {
            const nearBottom = checkIfNearBottom();
            if (nearBottom) {
              messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
            }
          }, 100);
          return () => clearInterval(fallbackInterval);
        }

        const observer = new MutationObserver(() => {
          const nearBottom = checkIfNearBottom();
          if (nearBottom && messagesEndRef.current) {
            try {
              messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
            } catch (e) {
              messagesEndRef.current.scrollIntoView();
            }
          }
        });

        observer.observe(container, {
          childList: true,
          subtree: true,
          characterData: true,
        });

        return () => observer.disconnect();
      }, [messages.length]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCopy = async (content: string, messageId: string) => {
    try {
      // 优先使用现代 Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(content);
      } else {
        // 降级方案：使用传统的 execCommand 方法
        const textArea = document.createElement('textarea');
        textArea.value = content;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          const successful = document.execCommand('copy');
          if (!successful) {
            throw new Error('execCommand failed');
          }
        } finally {
          document.body.removeChild(textArea);
        }
      }
      setCopiedId(messageId);
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (err) {
      console.error('复制失败:', err);
      // 可以在这里添加用户提示
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

      // 创建新的AI回复消息（先作为“思考中”气泡）
      const assistantMessageId = `msg-${Date.now()}-assistant`;
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
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
      // 结束思考状态
      dispatch({
        type: 'SET_MESSAGE_STREAMING',
        payload: {
          conversationId: currentConversation.id,
          messageId: assistantMessageId,
          isStreaming: false,
        },
      });
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

  // 空白对话框状态：显示欢迎信息，但允许用户输入
  if (!currentConversation) {
    return (
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500 dark:text-gray-400 max-w-md">
            <p className="text-lg sm:text-xl mb-2">开始新的对话</p>
            <p className="text-sm sm:text-base">在下方输入框中输入内容即可开始</p>
          </div>
        </div>
        <div ref={messagesEndRef} />
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
    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
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
                {/* AI 消息的展示逻辑 */}
                {message.role === 'assistant' && message.isStreaming ? (
                  // 思考中气泡：轻量文本 + 动画小圆点
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span className="text-xs font-medium">AI 正在思考你的问题</span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse" />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-300 animate-pulse" />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-300 dark:bg-blue-200 animate-pulse" />
                    </span>
                  </div>
                ) : (
                  <>
                    {/* AI消息：如果包含思考过程和回答，使用ThinkingDisplay（已取消流式）；否则使用普通Markdown显示 */}
                    {message.role === 'assistant' && (message.thinkingChain || message.answer || message.content.match(/<思考过程>|<回答>/)) ? (
                      <ThinkingDisplay
                        thinkingChain={message.thinkingChain || parseAIResponse(message.content).thinkingChain}
                        answer={message.answer || parseAIResponse(message.content).answer}
                        theme={state.theme}
                      />
                    ) : (
                      <div className="chat-prose max-w-none">
                        <ReactMarkdown
                          components={{
                            code({ className, children, ...props }: { className?: string; children?: React.ReactNode; [key: string]: any }) {
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
                  </>
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
