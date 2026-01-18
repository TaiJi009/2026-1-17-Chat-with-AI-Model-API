import { createContext, useContext, useReducer, useEffect, type ReactNode, type Dispatch } from 'react';
import { AppState, AppAction } from '../types';
import { saveState, loadState } from '../utils/storage';
import { getDefaultSystemPromptSync } from '../utils/defaultSystemPrompt';

const initialState: AppState = {
  conversations: [],
  currentConversationId: null,
  n8nWebhookUrl: '', // 需要用户配置n8n webhook URL
  promptConfig: {
    systemPrompt: getDefaultSystemPromptSync(),
  },
  theme: 'light',
  sidebarCollapsed: true, // 移动端默认折叠
  promptPanelCollapsed: true,
  editingMessageId: null,
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

    case 'UPDATE_CONVERSATION_TITLE':
      return {
        ...state,
        conversations: state.conversations.map(c =>
          c.id === action.payload.conversationId && !c.isManuallyRenamed
            ? { ...c, name: action.payload.title, updatedAt: Date.now() }
            : c
        ),
      };

    case 'DELETE_MESSAGES_AFTER':
      return {
        ...state,
        conversations: state.conversations.map(c => {
          if (c.id !== action.payload.conversationId) return c;
          
          const messageIndex = c.messages.findIndex(m => m.id === action.payload.messageId);
          if (messageIndex === -1) return c;
          
          // 保留该消息及之前的所有消息
          return {
            ...c,
            messages: c.messages.slice(0, messageIndex + 1),
            updatedAt: Date.now(),
          };
        }),
      };

    case 'CLEAR_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map(c =>
          c.id === action.payload 
            ? { ...c, messages: [], updatedAt: Date.now(), isManuallyRenamed: false } 
            : c
        ),
      };

    case 'SET_N8N_WEBHOOK_URL':
      return {
        ...state,
        n8nWebhookUrl: action.payload,
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
  dispatch: Dispatch<AppAction>;
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
      n8nWebhookUrl: state.n8nWebhookUrl,
      promptConfig: state.promptConfig,
      theme: state.theme,
      sidebarCollapsed: state.sidebarCollapsed,
      promptPanelCollapsed: state.promptPanelCollapsed,
      editingMessageId: state.editingMessageId,
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
