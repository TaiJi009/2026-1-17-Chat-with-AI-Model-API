import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { phoneValidator, codeValidator, validate } from '../utils/validator';

export class AuthController {
  /**
   * 发送验证码
   */
  static sendSms = [
    phoneValidator,
    validate,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { phone } = req.body;
        await AuthService.sendVerificationCode(phone);
        res.json({
          success: true,
          message: '验证码已发送',
        });
      } catch (error: any) {
        next(error);
      }
    },
  ];

  /**
   * 验证码登录/注册
   */
  static verifySms = [
    phoneValidator,
    codeValidator,
    validate,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { phone, code } = req.body;
        const { user, token } = await AuthService.loginWithCode(phone, code);
        res.json({
          success: true,
          message: '登录成功',
          data: {
            user: {
              id: user.id,
              phone: user.phone,
              isPro: user.is_pro,
              proExpiresAt: user.pro_expires_at,
            },
            token,
          },
        });
      } catch (error: any) {
        next(error);
      }
    },
  ];

  /**
   * 获取当前用户信息
   */
  static getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '未认证',
        });
      }

      const user = await AuthService.getUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在',
        });
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          phone: user.phone,
          isPro: user.is_pro,
          proExpiresAt: user.pro_expires_at,
          createdAt: user.created_at,
        },
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * 刷新Token
   */
  static refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '未认证',
        });
      }

      const token = await AuthService.refreshToken(req.user.userId);
      res.json({
        success: true,
        data: { token },
      });
    } catch (error: any) {
      next(error);
    }
  };
}
