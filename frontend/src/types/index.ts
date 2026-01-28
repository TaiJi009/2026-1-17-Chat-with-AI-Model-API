export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  thinkingChain?: string; // AI的思考过程内容
  answer?: string; // AI的回答内容
  isStreaming?: boolean; // 是否正在流式输出
  thinkingCollapsed?: boolean; // 思考过程区块是否折叠，默认 false
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

// N8N 调用相关配置
export interface N8NConfig {
  url: string; // N8N Webhook 或 HTTP Request 节点地址
  apiKey?: string; // 可选的鉴权 Key
  method?: 'GET' | 'POST'; // 请求方法，默认 POST
  customHeaders?: Record<string, string>; // 自定义请求头
}

// 用户相关类型
export interface User {
  id: string;
  phone: string | null;
  isPro: boolean;
  proExpiresAt: Date | null;
  createdAt?: Date;
}

// 订单相关类型
export interface Order {
  id: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: Date;
  paidAt: Date | null;
  expiresAt: Date | null;
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
  settingsPanelCollapsed: boolean; // 设置面板的展开/收起状态
  editingMessageId: string | null; // 正在编辑的消息ID
  user: User | null; // 用户信息
  isPro: boolean; // Pro状态（从user.isPro派生）
}

export type AppAction =
  | { type: 'ADD_CONVERSATION'; payload: Conversation }
  | { type: 'DELETE_CONVERSATION'; payload: string }
  | { type: 'UPDATE_CONVERSATION'; payload: Conversation }
  | { type: 'SET_CURRENT_CONVERSATION'; payload: string | null }
  | { type: 'ADD_MESSAGE'; payload: { conversationId: string; message: Message } }
  | { type: 'UPDATE_MESSAGE'; payload: { conversationId: string; messageId: string; content: string } }
  | { type: 'SET_MESSAGE_STREAMING'; payload: { conversationId: string; messageId: string; isStreaming: boolean } }
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
  | { type: 'TOGGLE_SETTINGS_PANEL' }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_PRO_STATUS'; payload: boolean }
  | { type: 'TOGGLE_MESSAGE_THINKING_COLLAPSED'; payload: { conversationId: string; messageId: string } };
