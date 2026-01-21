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

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '请求失败');
    }

    return data;
  } catch (error) {
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
