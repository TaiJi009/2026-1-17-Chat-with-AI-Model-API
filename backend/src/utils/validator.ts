import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// 手机号验证规则
export const phoneValidator = body('phone')
  .isMobilePhone('zh-CN')
  .withMessage('请输入有效的手机号');

// 验证码验证规则
export const codeValidator = body('code')
  .isLength({ min: 4, max: 6 })
  .isNumeric()
  .withMessage('验证码必须是4-6位数字');

// 验证中间件
export function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: '参数验证失败',
      errors: errors.array(),
    });
    return;
  }
  next();
}
