import { AppProvider, useApp } from './contexts/AppContext';
import ConversationList from './components/ConversationList';
import ChatArea from './components/ChatArea';
import SettingsPanel from './components/SettingsPanel';
import ThemeToggle from './components/ThemeToggle';
import { FiMenu, FiZap } from 'react-icons/fi';

function AppContent() {
  const { state, dispatch } = useApp();

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-950">
      {/* Top Bar - Logo, Slogan & Controls */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-2 sm:px-4 py-2">
        {/* Left: Logo and Slogan */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {/* Mobile Menu Button */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            className="sm:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            title="打开会话列表"
          >
            <FiMenu className="w-5 h-5" />
          </button>
          
          {/* Logo Icon */}
          <div className="flex items-center gap-2 sm:gap-3">
            <FiZap className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap hidden xs:inline">
              今天你创作了吗？
            </span>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Theme Toggle */}
          <div className="flex-shrink-0">
            <ThemeToggle />
          </div>
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

        {/* Left Sidebar - Conversation List */}
        <ConversationList />

        {/* Center - Chat Area */}
        <ChatArea />

        {/* Settings Panel - Bottom Left/Right */}
        <SettingsPanel />
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
