import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { SyntaxHighlighterProps } from 'react-syntax-highlighter';

interface ThinkingDisplayProps {
  thinkingChain: string;
  answer: string;
  theme: 'light' | 'dark';
  isStreaming?: boolean;
  thinkingCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const markdownComponents = (theme: 'light' | 'dark') => ({
  code({ className, children, ...props }: { className?: string; children?: React.ReactNode; [key: string]: any }) {
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
 * thinkingCollapsed 为 true 时只显示「思考过程」标题与「已收起」文案，可点击展开。
 */
export default function ThinkingDisplay({
  thinkingChain,
  answer,
  theme,
  isStreaming,
  thinkingCollapsed = false,
  onToggleCollapse,
}: ThinkingDisplayProps) {
  const components = markdownComponents(theme);
  const canCollapse = typeof onToggleCollapse === 'function';
  const showThinkingBody = !thinkingCollapsed || !canCollapse;

  const headerContent = (
    <>
      {canCollapse && (
        <span className="select-none mr-0.5" aria-hidden>
          {thinkingCollapsed ? '▶' : '▼'}
        </span>
      )}
      <span>💭 思考过程</span>
      {canCollapse && thinkingCollapsed && (
        <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">
          （已收起，点击展开）
        </span>
      )}
    </>
  );

  return (
    <div className="space-y-4">
      {/* 思考过程块：可折叠（当 onToggleCollapse 传入时） */}
      <div className="border-l-4 border-blue-500 pl-4">
        {canCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex items-center gap-0 text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none focus:ring-0 border-0 bg-transparent p-0 cursor-pointer text-left w-full"
            aria-expanded={!thinkingCollapsed}
            aria-label={thinkingCollapsed ? '展开思考过程' : '收起思考过程'}
          >
            {headerContent}
          </button>
        ) : (
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
            {headerContent}
          </div>
        )}
        {showThinkingBody && (
          <div className="chat-prose max-w-none text-gray-700 dark:text-gray-300">
            {thinkingChain ? (
              <ReactMarkdown components={components}>{thinkingChain}</ReactMarkdown>
            ) : (
              <span className="text-gray-400 dark:text-gray-500 italic">
                {isStreaming ? '思考中…' : ''}
              </span>
            )}
          </div>
        )}
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
