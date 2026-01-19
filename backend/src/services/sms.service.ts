import tencentcloud from 'tencentcloud-sdk-nodejs';
import smsConfig from '../config/sms';
import pool from '../config/database';

const SmsClient = tencentcloud.sms.v20210111.Client;

const client = new SmsClient({
  credential: {
    secretId: smsConfig.secretId,
    secretKey: smsConfig.secretKey,
  },
  region: smsConfig.region,
});

// 生成6位随机验证码
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 验证码有效期（5分钟）
const CODE_EXPIRES_MINUTES = 5;

export class SmsService {
  /**
   * 发送验证码
   */
  static async sendCode(phone: string): Promise<string> {
    // 检查是否在1分钟内发送过
    const recentCode = await pool.query(
      `SELECT * FROM sms_codes 
       WHERE phone = $1 AND created_at > NOW() - INTERVAL '1 minute'
       ORDER BY created_at DESC LIMIT 1`,
      [phone]
    );

    if (recentCode.rows.length > 0) {
      throw new Error('验证码发送过于频繁，请稍后再试');
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + CODE_EXPIRES_MINUTES * 60 * 1000);

    // 保存验证码到数据库
    await pool.query(
      `INSERT INTO sms_codes (phone, code, expires_at)
       VALUES ($1, $2, $3)`,
      [phone, code, expiresAt]
    );

    // 如果配置了短信服务，发送短信
    if (smsConfig.secretId && smsConfig.appId) {
      try {
        await client.SendSms({
          PhoneNumberSet: [phone],
          SmsSdkAppId: smsConfig.appId,
          TemplateId: smsConfig.templateId,
          SignName: smsConfig.signName,
          TemplateParamSet: [code],
        });
      } catch (error) {
        console.error('短信发送失败:', error);
        // 开发环境可以继续，生产环境应该抛出错误
        if (process.env.NODE_ENV === 'production') {
          throw new Error('短信发送失败，请稍后重试');
        }
      }
    } else {
      // 开发环境：直接返回验证码（方便测试）
      console.log(`[开发模式] 验证码: ${code} (手机号: ${phone})`);
    }

    return code;
  }

  /**
   * 验证验证码
   */
  static async verifyCode(phone: string, code: string): Promise<boolean> {
    const result = await pool.query(
      `SELECT * FROM sms_codes
       WHERE phone = $1 AND code = $2 AND used = false AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [phone, code]
    );

    if (result.rows.length === 0) {
      return false;
    }

    // 标记为已使用
    await pool.query(
      `UPDATE sms_codes SET used = true WHERE id = $1`,
      [result.rows[0].id]
    );

    return true;
  }

  /**
   * 清理过期验证码
   */
  static async cleanExpiredCodes(): Promise<void> {
    await pool.query(
      `DELETE FROM sms_codes WHERE expires_at < NOW() - INTERVAL '1 day'`
    );
  }
}
