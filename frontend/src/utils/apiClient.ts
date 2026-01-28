import { debug } from './debug';

// API客户端配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

// 获取Token
export function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

// 设置Token
export function setToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

// 清除Token
export function clearToken(): void {
  localStorage.removeItem('auth_token');
}

// 基础请求函数
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // #region agent log
  debug.trace('apiClient.request', { endpoint, method: options.method }, 'api-request');
  // #endregion

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // #region agent log
    debug.log('API Response Status', { endpoint, status: response.status, ok: response.ok }, 'api-response');
    // #endregion

    // 安全地解析JSON响应
    let data: ApiResponse<T>;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // 非JSON响应，尝试读取文本
        const text = await response.text();
        // #region agent log
        debug.error('API: Non-JSON response', { endpoint, contentType, textPreview: text.substring(0, 100) }, 'api-non-json');
        // #endregion
        throw new Error(`服务器返回了非JSON格式: ${text.substring(0, 100)}`);
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        // #region agent log
        debug.error('API: JSON parse error', { endpoint, error: error.message }, 'api-json-parse-error');
        // #endregion
        throw new Error('服务器响应格式错误');
      }
      // 如果是我们抛出的错误，直接重新抛出
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('解析服务器响应失败');
    }

    if (!response.ok) {
      // #region agent log
      debug.error('API Request Failed', { endpoint, status: response.status, data }, 'api-error');
      // #endregion
      throw new Error(data.message || '请求失败');
    }

    // #region agent log
    debug.traceExit('apiClient.request', { endpoint, success: true }, 'api-request');
    // #endregion

    return data;
  } catch (error) {
    // #region agent log
    debug.error('API Request Exception', { endpoint, error: error instanceof Error ? error.message : String(error) }, 'api-exception');
    // #endregion
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('网络错误');
  }
}

// GET请求
export function get<T>(endpoint: string): Promise<ApiResponse<T>> {
  return request<T>(endpoint, { method: 'GET' });
}

// POST请求
export function post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// PUT请求
export function put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

// DELETE请求
export function del<T>(endpoint: string): Promise<ApiResponse<T>> {
  return request<T>(endpoint, { method: 'DELETE' });
}
