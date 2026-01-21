import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';

/**
 * 同步AuthContext和AppContext的用户状态
 */
export function useAuthSync() {
  const { user, isAuthenticated } = useAuth();
  const { dispatch } = useApp();

  useEffect(() => {
    if (user) {
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_PRO_STATUS', payload: user.isPro });
    } else {
      dispatch({ type: 'SET_USER', payload: null });
      dispatch({ type: 'SET_PRO_STATUS', payload: false });
    }
  }, [user, isAuthenticated, dispatch]);
}
