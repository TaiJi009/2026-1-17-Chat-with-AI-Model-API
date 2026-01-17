import { AppProvider, useApp } from './contexts/AppContext';
import ApiConfig from './components/ApiConfig';
import ConversationList from './components/ConversationList';
import ChatArea from './components/ChatArea';
import PromptPanel from './components/PromptPanel';
import ThemeToggle from './components/ThemeToggle';
import { FiMenu, FiSettings } from 'react-icons/fi';

function AppContent() {
  const { state, dispatch } = useApp();

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-950">
      {/* Top API Config Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        {/* Mobile Menu Buttons */}
        <div className="flex sm:hidden items-center gap-2 p-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            title="打开会话列表"
          >
            <FiMenu className="w-5 h-5" />
          </button>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_PROMPT_PANEL' })}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            title="打开提示词配置"
          >
            <FiSettings className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <ApiConfig />
        </div>
        <div className="hidden sm:block p-2 flex-shrink-0">
          <ThemeToggle />
        </div>
        <div className="sm:hidden p-2 flex-shrink-0 border-t border-gray-200 dark:border-gray-700">
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Overlay */}
        {!state.sidebarCollapsed && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10 sm:hidden"
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          />
        )}
        {!state.promptPanelCollapsed && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
            onClick={() => dispatch({ type: 'TOGGLE_PROMPT_PANEL' })}
          />
        )}

        {/* Left Sidebar - Conversation List */}
        <ConversationList />

        {/* Center - Chat Area */}
        <ChatArea />

        {/* Right Sidebar - Prompt Panel */}
        <PromptPanel />
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
