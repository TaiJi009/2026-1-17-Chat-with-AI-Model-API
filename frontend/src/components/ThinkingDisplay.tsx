import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { SyntaxHighlighterProps } from 'react-syntax-highlighter';

interface ThinkingDisplayProps {
  thinkingChain: string;
  answer: string;
  theme: 'light' | 'dark';
  isStreaming?: boolean;
}

const markdownComponents = (theme: 'light' | 'dark') => ({
  code({ className, children, ...props }: { className?: string; children?: React.ReactNode; [key: string]: unknown }) {
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
});

/**
 * 显示思考过程和回答的组件；流式下始终渲染上下两块，空时以占位保持布局稳定。
 */
export default function ThinkingDisplay({ thinkingChain, answer, theme, isStreaming }: ThinkingDisplayProps) {
  const components = markdownComponents(theme);

  return (
    <div className="space-y-4">
      {/* 思考过程块：始终存在，空时占位 */}
      <div className="border-l-4 border-blue-500 pl-4">
        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
          💭 思考过程
        </div>
        <div className="chat-prose max-w-none text-gray-700 dark:text-gray-300">
          {thinkingChain ? (
            <ReactMarkdown components={components}>{thinkingChain}</ReactMarkdown>
          ) : (
            <span className="text-gray-400 dark:text-gray-500 italic">
              {isStreaming ? '思考中…' : ''}
            </span>
          )}
        </div>
      </div>

      {/* 回答块：始终存在，空时占位 */}
      <div>
        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
          ✨ 回答
        </div>
        <div className="chat-prose max-w-none">
          {answer ? (
            <ReactMarkdown components={components}>{answer}</ReactMarkdown>
          ) : (
            <span className="text-gray-400 dark:text-gray-500 italic">
              {isStreaming ? '回答酝酿中…' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
