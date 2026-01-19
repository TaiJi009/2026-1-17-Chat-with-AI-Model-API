import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { body, param, validationResult } from 'express-validator';

export class PaymentController {
  /**
   * 创建支付订单
   */
  static createOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '未认证',
        });
      }

      const amount = parseFloat(process.env.PRO_PRICE || '10.00');
      const order = await PaymentService.createOrder(req.user.userId, amount);

      res.json({
        success: true,
        message: '订单创建成功',
        data: order,
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * 查询订单状态
   */
  static getOrderStatus = [
    param('orderId').isUUID().withMessage('无效的订单ID'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            message: '参数验证失败',
            errors: errors.array(),
          });
        }

        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: '未认证',
          });
        }

        const { orderId } = req.params;
        const order = await PaymentService.getOrderStatus(orderId);

        if (!order) {
          return res.status(404).json({
            success: false,
            message: '订单不存在',
          });
        }

        // 验证订单属于当前用户
        if (order.user_id !== req.user.userId) {
          return res.status(403).json({
            success: false,
            message: '无权访问此订单',
          });
        }

        res.json({
          success: true,
          data: {
            id: order.id,
            amount: order.amount,
            status: order.status,
            createdAt: order.created_at,
            paidAt: order.paid_at,
            expiresAt: order.expires_at,
          },
        });
      } catch (error: any) {
        next(error);
      }
    },
  ];

  /**
   * 微信支付回调
   */
  static wechatCallback = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await PaymentService.handleWechatCallback(req.body);

      // 微信支付要求返回XML格式
      res.set('Content-Type', 'application/xml');
      res.send('<xml><return_code><![CDATA[SUCCESS]]></return_code></xml>');
    } catch (error: any) {
      console.error('支付回调处理失败:', error);
      res.set('Content-Type', 'application/xml');
      res.send('<xml><return_code><![CDATA[FAIL]]></return_code></xml>');
    }
  };

  /**
   * 查询订阅状态
   */
  static getSubscription = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '未认证',
        });
      }

      const status = await PaymentService.getSubscriptionStatus(
        req.user.userId
      );

      res.json({
        success: true,
        data: status,
      });
    } catch (error: any) {
      next(error);
    }
  };
}
