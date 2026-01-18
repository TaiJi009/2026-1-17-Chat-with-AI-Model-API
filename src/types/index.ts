export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  isManuallyRenamed?: boolean; // 标记是否手动重命名过
  isPinned?: boolean; // 标记是否置顶
}

export interface PromptConfig {
  systemPrompt: string;
}

export interface ApiConfig {
  provider: 'zhipu' | 'openai' | 'claude' | 'tongyi' | 'wenxin' | 'spark' | 'doubao'; // 当前选择的模型提供商
  apiKeys: Partial<Record<'zhipu' | 'openai' | 'claude' | 'tongyi' | 'wenxin' | 'spark' | 'doubao', string>>; // 存储每个模型的API Key
}

export interface AppState {
  conversations: Conversation[];
  currentConversationId: string | null;
  apiConfig: ApiConfig;
  promptConfig: PromptConfig;
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  promptPanelCollapsed: boolean;
  apiConfigPanelCollapsed: boolean;
  editingMessageId: string | null; // 正在编辑的消息ID
}

export type AppAction =
  | { type: 'ADD_CONVERSATION'; payload: Conversation }
  | { type: 'DELETE_CONVERSATION'; payload: string }
  | { type: 'UPDATE_CONVERSATION'; payload: Conversation }
  | { type: 'SET_CURRENT_CONVERSATION'; payload: string | null }
  | { type: 'ADD_MESSAGE'; payload: { conversationId: string; message: Message } }
  | { type: 'UPDATE_MESSAGE'; payload: { conversationId: string; messageId: string; content: string } }
  | { type: 'UPDATE_CONVERSATION_TITLE'; payload: { conversationId: string; title: string } }
  | { type: 'DELETE_MESSAGES_AFTER'; payload: { conversationId: string; messageId: string } }
  | { type: 'CLEAR_CONVERSATION'; payload: string }
  | { type: 'TOGGLE_PIN_CONVERSATION'; payload: string }
  | { type: 'SET_API_CONFIG'; payload: ApiConfig }
  | { type: 'SET_PROMPT_CONFIG'; payload: PromptConfig }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'TOGGLE_PROMPT_PANEL' }
  | { type: 'TOGGLE_API_CONFIG_PANEL' }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> };
