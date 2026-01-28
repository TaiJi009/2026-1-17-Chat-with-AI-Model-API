import pool from '../config/database';

export interface Order {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  wechat_order_id: string | null;
  wechat_transaction_id: string | null;
  created_at: Date;
  paid_at: Date | null;
  expires_at: Date | null;
}

export class OrderModel {
  static async create(data: {
    user_id: string;
    amount: number;
    expires_at: Date;
  }): Promise<Order> {
    const query = `
      INSERT INTO orders (user_id, amount, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [data.user_id, data.amount, data.expires_at];
    const result = await pool.query(query, values);
    if (!result.rows[0]) {
      throw new Error('创建订单失败');
    }
    return result.rows[0];
  }

  static async findById(id: string): Promise<Order | null> {
    const query = 'SELECT * FROM orders WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByWechatOrderId(orderId: string): Promise<Order | null> {
    const query = 'SELECT * FROM orders WHERE wechat_order_id = $1';
    const result = await pool.query(query, [orderId]);
    return result.rows[0] || null;
  }

  static async updateStatus(
    id: string,
    status: Order['status'],
    wechatOrderId?: string,
    wechatTransactionId?: string
  ): Promise<Order> {
    const query = `
      UPDATE orders
      SET 
        status = $1,
        wechat_order_id = COALESCE($2, wechat_order_id),
        wechat_transaction_id = COALESCE($3, wechat_transaction_id),
        paid_at = CASE WHEN $1 = 'paid' THEN NOW() ELSE paid_at END,
        updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `;
    const result = await pool.query(query, [
      status,
      wechatOrderId || null,
      wechatTransactionId || null,
      id,
    ]);
    if (!result.rows[0]) {
      throw new Error('订单不存在或更新失败');
    }
    return result.rows[0];
  }

  static async findByUserId(userId: string): Promise<Order[]> {
    const query = `
      SELECT * FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
}
