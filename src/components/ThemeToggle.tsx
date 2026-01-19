import { useApp } from '../contexts/AppContext';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function ThemeToggle() {
  const { state, dispatch } = useApp();

  const toggleTheme = () => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    dispatch({ type: 'SET_THEME', payload: newTheme });
  };

  // 处理触摸事件（移动浏览器兼容性）
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    toggleTheme();
  };

  // 处理点击事件（桌面浏览器）
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleTheme();
  };

  return (
    <button
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600 rounded-md transition-colors touch-manipulation"
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
  );
}
