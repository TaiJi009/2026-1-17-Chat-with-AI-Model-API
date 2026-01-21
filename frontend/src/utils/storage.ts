import { AppState } from '../types';

const STORAGE_KEY = 'ai-chat-app-state';

// 检查 localStorage 是否可用
const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

export const saveState = (state: Partial<AppState>): void => {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available, state will not be saved');
    return;
  }
  
  let serialized: string;
  try {
    serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    // 处理存储空间不足等错误
    if (error instanceof DOMException && error.code === 22) {
      console.error('localStorage quota exceeded, clearing old data');
      try {
        // 尝试清理一些旧数据后重新保存
        localStorage.removeItem(STORAGE_KEY);
        // 重新序列化（因为之前的 serialized 可能没有成功创建）
        serialized = JSON.stringify(state);
        localStorage.setItem(STORAGE_KEY, serialized);
      } catch (retryError) {
        console.error('Failed to save state to localStorage after retry:', retryError);
      }
    } else {
      console.error('Failed to save state to localStorage:', error);
    }
  }
};

export const loadState = (): Partial<AppState> | null => {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available, cannot load saved state');
    return null;
  }
  
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized === null) {
      return null;
    }
    return JSON.parse(serialized);
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    // 如果数据损坏，尝试清理
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (cleanupError) {
      console.error('Failed to cleanup corrupted localStorage data:', cleanupError);
    }
    return null;
  }
};

export const clearState = (): void => {
  if (!isLocalStorageAvailable()) {
    return;
  }
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear state from localStorage:', error);
  }
};
