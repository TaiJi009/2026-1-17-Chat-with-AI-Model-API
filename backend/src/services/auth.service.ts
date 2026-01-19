import { UserModel, User } from '../models/user.model';
import { SmsService } from './sms.service';
import { generateToken, TokenPayload } from '../utils/jwt';

export class AuthService {
  /**
   * 发送验证码
   */
  static async sendVerificationCode(phone: string): Promise<void> {
    await SmsService.sendCode(phone);
  }

  /**
   * 验证码登录/注册
   */
  static async loginWithCode(
    phone: string,
    code: string
  ): Promise<{ user: User; token: string }> {
    // 验证验证码
    const isValid = await SmsService.verifyCode(phone, code);
    if (!isValid) {
      throw new Error('验证码无效或已过期');
    }

    // 查找或创建用户
    let user = await UserModel.findByPhone(phone);
    if (!user) {
      user = await UserModel.create({ phone });
    }

    // 生成Token
    const payload: TokenPayload = {
      userId: user.id,
      phone: user.phone || undefined,
    };
    const token = generateToken(payload);

    return { user, token };
  }

  /**
   * 获取用户信息
   */
  static async getUserById(userId: string): Promise<User | null> {
    return await UserModel.findById(userId);
  }

  /**
   * 刷新Token
   */
  static async refreshToken(userId: string): Promise<string> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    const payload: TokenPayload = {
      userId: user.id,
      phone: user.phone || undefined,
    };
    return generateToken(payload);
  }
}
