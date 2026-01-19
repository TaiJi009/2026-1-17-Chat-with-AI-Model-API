import pool from '../config/database';

export interface User {
  id: string;
  phone: string | null;
  wechat_openid: string | null;
  password_hash: string | null;
  is_pro: boolean;
  pro_expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export class UserModel {
  static async create(data: {
    phone?: string;
    wechat_openid?: string;
  }): Promise<User> {
    const query = `
      INSERT INTO users (phone, wechat_openid)
      VALUES ($1, $2)
      RETURNING *
    `;
    const values = [data.phone || null, data.wechat_openid || null];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByPhone(phone: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE phone = $1';
    const result = await pool.query(query, [phone]);
    return result.rows[0] || null;
  }

  static async findByWechatOpenId(openid: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE wechat_openid = $1';
    const result = await pool.query(query, [openid]);
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async updateProStatus(
    id: string,
    isPro: boolean,
    expiresAt: Date | null
  ): Promise<User> {
    const query = `
      UPDATE users
      SET is_pro = $1, pro_expires_at = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [isPro, expiresAt, id]);
    return result.rows[0];
  }

  static async updateWechatOpenId(
    id: string,
    openid: string
  ): Promise<User> {
    const query = `
      UPDATE users
      SET wechat_openid = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [openid, id]);
    return result.rows[0];
  }
}
