import { AppState } from '../types';

const STORAGE_KEY = 'ai-chat-app-state';

export const saveState = (state: Partial<AppState>): void => {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
};

export const loadState = (): Partial<AppState> | null => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized === null) {
      return null;
    }
    return JSON.parse(serialized);
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    return null;
  }
};

export const clearState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear state from localStorage:', error);
  }
};
