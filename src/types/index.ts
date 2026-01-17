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
}

export type APIFormat = 'openai' | 'anthropic' | 'zhipu' | 'custom';

export interface CustomAPIConfig {
  requestMethod?: string;
  requestHeaders?: Record<string, string>;
  requestBodyTemplate?: string;
  responsePath?: string;
}

export interface APIConfig {
  endpoint: string;
  apiKey?: string;
  format: APIFormat;
  customConfig?: CustomAPIConfig;
}

export interface PromptConfig {
  systemPrompt: string;
  userPromptTemplate: string;
}

export interface AppState {
  conversations: Conversation[];
  currentConversationId: string | null;
  apiConfig: APIConfig | null;
  promptConfig: PromptConfig;
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  promptPanelCollapsed: boolean;
}

export type AppAction =
  | { type: 'ADD_CONVERSATION'; payload: Conversation }
  | { type: 'DELETE_CONVERSATION'; payload: string }
  | { type: 'UPDATE_CONVERSATION'; payload: Conversation }
  | { type: 'SET_CURRENT_CONVERSATION'; payload: string | null }
  | { type: 'ADD_MESSAGE'; payload: { conversationId: string; message: Message } }
  | { type: 'UPDATE_MESSAGE'; payload: { conversationId: string; messageId: string; content: string } }
  | { type: 'CLEAR_CONVERSATION'; payload: string }
  | { type: 'SET_API_CONFIG'; payload: APIConfig | null }
  | { type: 'SET_PROMPT_CONFIG'; payload: PromptConfig }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'TOGGLE_PROMPT_PANEL' }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> };
