import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { SyntaxHighlighterProps } from 'react-syntax-highlighter';
import { useApp } from '../contexts/AppContext';
import { FiUser, FiMessageCircle, FiCopy, FiCheck } from 'react-icons/fi';

export default function MessageList() {
  const { state } = useApp();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
              <button
                onClick={() => handleCopy(message.content, message.id)}
                className={`ml-2 p-1.5 rounded hover:bg-opacity-20 transition-all ${
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
