import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { SyntaxHighlighterProps } from 'react-syntax-highlighter';

interface ThinkingDisplayProps {
  thinkingChain: string;
  answer: string;
  theme: 'light' | 'dark';
}

/**
 * 显示思维链和回答的组件（已取消流式逐字显示）
 */
export default function ThinkingDisplay({ thinkingChain, answer, theme }: ThinkingDisplayProps) {
  // 直接一次性展示完整内容，不再做逐字流式动画
  const showThinkingCursor = false;
  const showAnswerCursor = false;

  return (
    <div className="space-y-4">
      {/* 思维链部分 */}
      {thinkingChain && (
        <div className="border-l-4 border-blue-500 pl-4">
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
            💭 思维链
          </div>
          <div className="chat-prose max-w-none text-gray-700 dark:text-gray-300">
            <ReactMarkdown
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const inline = !match;
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={theme === 'dark' ? vscDarkPlus : vs}
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
              {thinkingChain}
            </ReactMarkdown>
            {showThinkingCursor && <span className="inline-block animate-pulse text-gray-400 dark:text-gray-600 ml-1">·</span>}
          </div>
        </div>
      )}

      {/* 回答部分 */}
      {(answer || showAnswerCursor) && (
        <div>
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
            ✨ 回答
          </div>
          <div className="chat-prose max-w-none">
            <ReactMarkdown
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const inline = !match;
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={theme === 'dark' ? vscDarkPlus : vs}
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
              {answer}
            </ReactMarkdown>
            {showAnswerCursor && <span className="inline-block animate-pulse text-gray-400 dark:text-gray-600 ml-1">·</span>}
          </div>
        </div>
      )}
    </div>
  );
}
