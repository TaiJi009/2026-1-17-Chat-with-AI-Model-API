import { createContext, useContext, useReducer, useEffect, type ReactNode, type Dispatch } from 'react';
import { AppState, AppAction } from '../types';
import { saveState, loadState } from '../utils/storage';
import { getDefaultSystemPromptSync } from '../utils/defaultSystemPrompt';

const initialState: AppState = {
  conversations: [],
  currentConversationId: null,
  apiConfig: {
    provider: 'zhipu',
    apiKeys: {
      zhipu: '403c7c9f1f124bf684a881fa01376bb8.IzkE5f2FI6WcXmJB', // 智谱默认API Key
    },
  },
  promptConfig: {
    systemPrompt: getDefaultSystemPromptSync(),
  },
  n8nConfig: {
    url: '',
    urlType: 'webhook',
    method: 'POST',
    apiKey: '',
  },
  useN8N: false,
  theme: 'dark', // 默认夜间模式（免费功能）
  sidebarCollapsed: true, // 移动端默认折叠
  promptPanelCollapsed: true,
  apiConfigPanelCollapsed: true,
  settingsPanelCollapsed: true, // 设置面板默认折叠
  editingMessageId: null,
  user: null,
  isPro: false,
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

    case 'TOGGLE_PIN_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map(c =>
          c.id === action.payload ? { ...c, isPinned: !c.isPinned } : c
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

    case 'SET_MESSAGE_STREAMING':
      return {
        ...state,
        conversations: state.conversations.map(c =>
          c.id === action.payload.conversationId
            ? {
                ...c,
                messages: c.messages.map(m =>
                  m.id === action.payload.messageId
                    ? { ...m, isStreaming: action.payload.isStreaming }
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

    case 'SET_API_CONFIG':
      // 直接使用payload，因为ApiConfig总是包含apiKeys
      return {
        ...state,
        apiConfig: action.payload,
      };

    case 'SET_PROMPT_CONFIG':
      return {
        ...state,
        promptConfig: action.payload,
      };

    case 'SET_N8N_CONFIG':
      return {
        ...state,
        n8nConfig: action.payload,
      };

    case 'SET_USE_N8N':
      return {
        ...state,
        useN8N: action.payload,
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

    case 'TOGGLE_API_CONFIG_PANEL':
      return {
        ...state,
        apiConfigPanelCollapsed: !state.apiConfigPanelCollapsed,
      };

    case 'TOGGLE_SETTINGS_PANEL':
      return {
        ...state,
        settingsPanelCollapsed: !state.settingsPanelCollapsed,
      };

    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isPro: action.payload?.isPro || false,
      };

    case 'SET_PRO_STATUS':
      return {
        ...state,
        isPro: action.payload,
        user: state.user ? { ...state.user, isPro: action.payload } : null,
      };

    case 'LOAD_STATE':
      // 加载状态时，确保所有消息的 isStreaming 都为 false（防止已保存消息重新流式显示）
      const loadedState = action.payload;
      if (loadedState.conversations) {
        loadedState.conversations = loadedState.conversations.map(conv => ({
          ...conv,
          messages: conv.messages.map(msg => ({
            ...msg,
            isStreaming: false,
          })),
        }));
      }
      
      // 确保API配置存在且包含默认的智谱API Key
      const defaultZhipuKey = '403c7c9f1f124bf684a881fa01376bb8.IzkE5f2FI6WcXmJB';
      if (!loadedState.apiConfig) {
        loadedState.apiConfig = {
          provider: 'zhipu',
          apiKeys: { zhipu: defaultZhipuKey },
        };
      } else {
        // 确保provider存在，默认为智谱
        if (!loadedState.apiConfig.provider) {
          loadedState.apiConfig.provider = 'zhipu';
        }
        // 确保apiKeys存在
        if (!loadedState.apiConfig.apiKeys) {
          loadedState.apiConfig.apiKeys = { zhipu: defaultZhipuKey };
        } else {
          // 如果智谱的API Key不存在，添加默认值
          if (!loadedState.apiConfig.apiKeys.zhipu) {
            loadedState.apiConfig.apiKeys.zhipu = defaultZhipuKey;
          }
        }
      }
      
      // 确保N8N配置存在
      if (!loadedState.n8nConfig) {
        loadedState.n8nConfig = {
          url: '',
          urlType: 'webhook',
          method: 'POST',
          apiKey: '',
        };
      }
      
      // 确保useN8N字段存在
      if (loadedState.useN8N === undefined) {
        loadedState.useN8N = false;
      }
      
      return {
        ...state,
        ...loadedState,
        // 每次加载状态后，重置为空白对话框（不显示之前的会话）
        currentConversationId: null,
        // 确保user和isPro字段存在
        user: loadedState.user || null,
        isPro: loadedState.isPro || false,
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
      apiConfig: state.apiConfig,
      promptConfig: state.promptConfig,
      n8nConfig: state.n8nConfig,
      useN8N: state.useN8N,
      theme: state.theme,
      sidebarCollapsed: state.sidebarCollapsed,
      promptPanelCollapsed: state.promptPanelCollapsed,
      apiConfigPanelCollapsed: state.apiConfigPanelCollapsed,
      settingsPanelCollapsed: state.settingsPanelCollapsed,
      editingMessageId: state.editingMessageId,
      user: state.user,
      isPro: state.isPro,
    });
  }, [state]);

  // Apply theme to document
  useEffect(() => {
    // 确保 DOM 已加载
    if (typeof document !== 'undefined' && document.documentElement) {
      const htmlElement = document.documentElement;
      if (state.theme === 'dark') {
        htmlElement.classList.add('dark');
      } else {
        htmlElement.classList.remove('dark');
      }
    }
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
