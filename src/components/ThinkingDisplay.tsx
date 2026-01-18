import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { SyntaxHighlighterProps } from 'react-syntax-highlighter';

interface ThinkingDisplayProps {
  thinkingChain: string;
  answer: string;
  isStreaming?: boolean;
  theme: 'light' | 'dark';
}

/**
 * 流式显示思维链和回答的组件
 * 先显示思维链（逐字），再显示回答（逐字）
 */
export default function ThinkingDisplay({ thinkingChain, answer, isStreaming = false, theme }: ThinkingDisplayProps) {
  const [displayedThinking, setDisplayedThinking] = useState('');
  const [displayedAnswer, setDisplayedAnswer] = useState('');
  const [isThinkingComplete, setIsThinkingComplete] = useState(false);
  const [isAnswerComplete, setIsAnswerComplete] = useState(false);

  const thinkingIndexRef = useRef(0);
  const answerIndexRef = useRef(0);
  const thinkingTimerRef = useRef<number | null>(null);
  const answerTimerRef = useRef<number | null>(null);
  const initializedRef = useRef(false);

  // 初始化：检查是否有完整内容需要流式显示
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // 重置状态
    thinkingIndexRef.current = 0;
    answerIndexRef.current = 0;
    setDisplayedThinking('');
    setDisplayedAnswer('');
    setIsThinkingComplete(false);
    setIsAnswerComplete(false);

    // 开始流式显示思维链
    if (thinkingChain) {
      const interval = 20; // 每个字符间隔20ms
      thinkingTimerRef.current = window.setInterval(() => {
        if (thinkingIndexRef.current < thinkingChain.length) {
          thinkingIndexRef.current += 1;
          setDisplayedThinking(thinkingChain.substring(0, thinkingIndexRef.current));
        } else {
          setIsThinkingComplete(true);
          if (thinkingTimerRef.current) {
            clearInterval(thinkingTimerRef.current);
            thinkingTimerRef.current = null;
          }
        }
      }, interval);
    } else {
      setIsThinkingComplete(true);
    }

    return () => {
      if (thinkingTimerRef.current) {
        clearInterval(thinkingTimerRef.current);
      }
      if (answerTimerRef.current) {
        clearInterval(answerTimerRef.current);
      }
    };
  }, [thinkingChain]);

  // 思维链完成后，开始流式显示回答
  useEffect(() => {
    if (!isThinkingComplete || !answer || answerTimerRef.current) {
      return;
    }

    const interval = 20; // 每个字符间隔20ms
    answerTimerRef.current = window.setInterval(() => {
      if (answerIndexRef.current < answer.length) {
        answerIndexRef.current += 1;
        setDisplayedAnswer(answer.substring(0, answerIndexRef.current));
      } else {
        setIsAnswerComplete(true);
        if (answerTimerRef.current) {
          clearInterval(answerTimerRef.current);
          answerTimerRef.current = null;
        }
      }
    }, interval);
  }, [isThinkingComplete, answer]);

  const showThinkingCursor = !isThinkingComplete && (isStreaming || displayedThinking.length < thinkingChain.length);
  const showAnswerCursor = isThinkingComplete && !isAnswerComplete && (isStreaming || displayedAnswer.length < answer.length);

  return (
    <div className="space-y-4">
      {/* 思维链部分 */}
      {thinkingChain && (
        <div className="border-l-4 border-blue-500 pl-4">
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
            💭 思维链
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
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
              {displayedThinking}
            </ReactMarkdown>
            {showThinkingCursor && <span className="inline-block animate-pulse text-gray-400 dark:text-gray-600 ml-1">·</span>}
          </div>
        </div>
      )}

      {/* 回答部分 */}
      {isThinkingComplete && (answer || showAnswerCursor) && (
        <div>
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
            ✨ 回答
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none">
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
              {displayedAnswer}
            </ReactMarkdown>
            {showAnswerCursor && <span className="inline-block animate-pulse text-gray-400 dark:text-gray-600 ml-1">·</span>}
          </div>
        </div>
      )}
    </div>
  );
}
