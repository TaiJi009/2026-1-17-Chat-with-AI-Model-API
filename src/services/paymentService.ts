import { get, post } from '../utils/apiClient';
import { Order } from '../types';

export interface CreateOrderResponse {
  orderId: string;
  qrCode: string;
  amount: number;
}

export interface SubscriptionStatus {
  isPro: boolean;
  expiresAt: Date | null;
}

export class PaymentService {
  /**
   * 创建支付订单
   */
  static async createOrder(): Promise<CreateOrderResponse> {
    const response = await post<CreateOrderResponse>(
      '/api/payment/create-order'
    );
    if (!response.success || !response.data) {
      throw new Error(response.message || '创建订单失败');
    }
    return response.data;
  }

  /**
   * 查询订单状态
   */
  static async getOrderStatus(orderId: string): Promise<Order> {
    const response = await get<Order>(`/api/payment/order/${orderId}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || '查询订单失败');
    }
    return response.data;
  }

  /**
   * 查询订阅状态
   */
  static async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const response = await get<SubscriptionStatus>(
      '/api/payment/subscription'
    );
    if (!response.success || !response.data) {
      throw new Error(response.message || '查询订阅状态失败');
    }
    return response.data;
  }
}
