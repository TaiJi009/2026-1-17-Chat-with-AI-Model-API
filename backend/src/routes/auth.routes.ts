import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// 发送验证码
router.post('/send-sms', AuthController.sendSms);

// 验证码登录/注册
router.post('/verify-sms', AuthController.verifySms);

// 获取当前用户信息（需要认证）
router.get('/me', authMiddleware, AuthController.getMe);

// 刷新Token（需要认证）
router.post('/refresh', authMiddleware, AuthController.refresh);

export default router;
