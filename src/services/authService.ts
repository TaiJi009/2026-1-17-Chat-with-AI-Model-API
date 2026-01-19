import { get, post, getToken } from '../utils/apiClient';
import { setToken, clearToken } from '../utils/apiClient';
import { User } from '../types';

export interface LoginResponse {
  user: User;
  token: string;
}

export class AuthService {
  /**
   * 发送验证码
   */
  static async sendSms(phone: string): Promise<void> {
    const response = await post('/api/auth/send-sms', { phone });
    if (!response.success) {
      throw new Error(response.message || '发送验证码失败');
    }
  }

  /**
   * 验证码登录/注册
   */
  static async loginWithCode(
    phone: string,
    code: string
  ): Promise<LoginResponse> {
    const response = await post<LoginResponse>('/api/auth/verify-sms', {
      phone,
      code,
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || '登录失败');
    }

    // 保存Token
    setToken(response.data.token);

    return response.data;
  }

  /**
   * 获取当前用户信息
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const response = await get<User>('/api/auth/me');
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      // Token可能已过期，清除它
      clearToken();
      return null;
    }
  }

  /**
   * 刷新Token
   */
  static async refreshToken(): Promise<string> {
    const response = await post<{ token: string }>('/api/auth/refresh');
    if (!response.success || !response.data) {
      throw new Error(response.message || '刷新Token失败');
    }

    setToken(response.data.token);
    return response.data.token;
  }

  /**
   * 登出
   */
  static logout(): void {
    clearToken();
  }

  /**
   * 检查是否已登录
   */
  static isAuthenticated(): boolean {
    return getToken() !== null;
  }
}
