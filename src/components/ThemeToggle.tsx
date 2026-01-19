import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { FiSun, FiMoon } from 'react-icons/fi';
import PaymentModal from './PaymentModal';

export default function ThemeToggle() {
  const { state, dispatch } = useApp();
  const { isAuthenticated, user } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const toggleTheme = () => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    
    // 如果切换到日间模式（light），检查是否为Pro用户
    if (newTheme === 'light') {
      const isPro = isAuthenticated && user?.isPro;
      
      if (!isPro) {
        // 非Pro用户，显示付费弹窗
        setShowPaymentModal(true);
        return;
      }
    }
    
    // Pro用户或切换到夜间模式，允许切换
    dispatch({ type: 'SET_THEME', payload: newTheme });
  };

  return (
    <>
      <button
        onClick={toggleTheme}
        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600 rounded-md transition-colors touch-manipulation cursor-pointer"
        title={state.theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
        aria-label={state.theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
        type="button"
      >
        {state.theme === 'light' ? (
          <FiMoon className="w-5 h-5" />
        ) : (
          <FiSun className="w-5 h-5" />
        )}
      </button>
      
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />
    </>
  );
}
