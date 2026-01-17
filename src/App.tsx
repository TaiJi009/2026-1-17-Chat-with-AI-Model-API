import React from 'react';
import { AppProvider } from './contexts/AppContext';
import ApiConfig from './components/ApiConfig';
import ConversationList from './components/ConversationList';
import ChatArea from './components/ChatArea';
import PromptPanel from './components/PromptPanel';
import ThemeToggle from './components/ThemeToggle';

function App() {
  return (
    <AppProvider>
      <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-950">
        {/* Top API Config Bar */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <ApiConfig />
          </div>
          <div className="p-2">
            <ThemeToggle />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Conversation List */}
          <ConversationList />

          {/* Center - Chat Area */}
          <ChatArea />

          {/* Right Sidebar - Prompt Panel */}
          <PromptPanel />
        </div>
      </div>
    </AppProvider>
  );
}

export default App;
