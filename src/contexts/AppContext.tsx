import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, AppAction } from '../types';
import { saveState, loadState } from '../utils/storage';

const initialState: AppState = {
  conversations: [],
  currentConversationId: null,
  apiConfig: null,
  promptConfig: {
    systemPrompt: 'You are a helpful AI assistant.',
    userPromptTemplate: '{{user_input}}',
  },
  theme: 'light',
  sidebarCollapsed: false,
  promptPanelCollapsed: true,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_CONVERSATION':
      return {
        ...state,
        conversations: [...state.conversations, action.payload],
        currentConversationId: action.payload.id,
      };

    case 'DELETE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.filter(c => c.id !== action.payload),
        currentConversationId:
          state.currentConversationId === action.payload
            ? state.conversations.find(c => c.id !== action.payload)?.id || null
            : state.currentConversationId,
      };

    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map(c =>
          c.id === action.payload.id ? action.payload : c
        ),
      };

    case 'SET_CURRENT_CONVERSATION':
      return {
        ...state,
        currentConversationId: action.payload,
      };

    case 'ADD_MESSAGE':
      return {
        ...state,
        conversations: state.conversations.map(c =>
          c.id === action.payload.conversationId
            ? {
                ...c,
                messages: [...c.messages, action.payload.message],
                updatedAt: Date.now(),
              }
            : c
        ),
      };

    case 'UPDATE_MESSAGE':
      return {
        ...state,
        conversations: state.conversations.map(c =>
          c.id === action.payload.conversationId
            ? {
                ...c,
                messages: c.messages.map(m =>
                  m.id === action.payload.messageId
                    ? { ...m, content: action.payload.content }
                    : m
                ),
                updatedAt: Date.now(),
              }
            : c
        ),
      };

    case 'CLEAR_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map(c =>
          c.id === action.payload ? { ...c, messages: [], updatedAt: Date.now() } : c
        ),
      };

    case 'SET_API_CONFIG':
      return {
        ...state,
        apiConfig: action.payload,
      };

    case 'SET_PROMPT_CONFIG':
      return {
        ...state,
        promptConfig: action.payload,
      };

    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed,
      };

    case 'TOGGLE_PROMPT_PANEL':
      return {
        ...state,
        promptPanelCollapsed: !state.promptPanelCollapsed,
      };

    case 'LOAD_STATE':
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = loadState();
    if (savedState) {
      dispatch({ type: 'LOAD_STATE', payload: savedState });
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveState({
      conversations: state.conversations,
      currentConversationId: state.currentConversationId,
      apiConfig: state.apiConfig,
      promptConfig: state.promptConfig,
      theme: state.theme,
      sidebarCollapsed: state.sidebarCollapsed,
      promptPanelCollapsed: state.promptPanelCollapsed,
    });
  }, [state]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
