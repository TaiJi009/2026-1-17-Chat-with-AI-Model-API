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
    <div className="flex items-center justify-between px-3 sm:px-4 h-7 text-xs bg-gray-50 border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      <div className="flex items-center">
        <span className="text-gray-500 dark:text-gray-400">
          思考中 · 可能需要几秒钟
        </span>
      </div>
      <div className="flex items-center">
        <div
          className="w-2.5 h-2.5 rounded-full animate-spin"
          style={{
            borderWidth: '1.5px',
            borderStyle: 'solid',
            borderTopColor: 'rgb(107 114 128)',
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent',
            borderLeftColor: 'transparent',
            animationDuration: '1.3s',
          }}
        />
      </div>
    </div>
  );
}

