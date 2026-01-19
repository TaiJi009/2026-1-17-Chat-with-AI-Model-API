import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// 所有支付路由都需要认证
router.use(authMiddleware);

// 创建支付订单
router.post('/create-order', PaymentController.createOrder);

// 查询订单状态
router.get('/order/:orderId', PaymentController.getOrderStatus);

// 查询订阅状态
router.get('/subscription', PaymentController.getSubscription);

// 微信支付回调（不需要认证，由微信服务器调用）
router.post(
  '/wechat/callback',
  // 注意：这里需要特殊处理，因为微信回调不需要JWT认证
  // 但需要验证回调签名
  PaymentController.wechatCallback
);

export default router;
