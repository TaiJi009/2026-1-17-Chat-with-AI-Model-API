import { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';

export default function ThinkingStatusBar() {
  const { state } = useApp();

  const currentConversation = state.conversations.find(
    c => c.id === state.currentConversationId
  );

  const isThinking = useMemo(() => {
    if (!currentConversation) return false;
    return currentConversation.messages.some(
      m => m.role === 'assistant' && m.isStreaming
    );
  }, [currentConversation]);

  if (!isThinking) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-3 sm:px-4 h-7 text-xs bg-gray-50 border-b border-gray-200 text-gray-600 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
        <span>思考中 · 可能需要几秒钟</span>
      </div>
      <div className="flex items-center">
        <span
          className="w-3 h-3 border border-blue-500/40 border-t-blue-500 rounded-full dark:border-blue-400/40 dark:border-t-blue-400 animate-spin"
          style={{ animationDuration: '1.4s' }}
        />
      </div>
    </div>
  );
}

