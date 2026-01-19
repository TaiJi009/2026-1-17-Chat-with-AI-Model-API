import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './LoginModal';
import { FiUser, FiLogOut } from 'react-icons/fi';

export default function UserMenu() {
  const { isAuthenticated, user, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800">
          <FiUser className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {user.phone || '用户'}
          </span>
          {user.isPro && (
            <span className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded">
              Pro
            </span>
          )}
        </div>
        <button
          onClick={logout}
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
          title="登出"
        >
          <FiLogOut className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowLoginModal(true)}
        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        登录
      </button>
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}
