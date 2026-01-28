import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { debug } from '../utils/debug';

// 扩展Express Request类型
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // #region agent log
  debug.trace('authMiddleware', { path: req.path, method: req.method }, 'auth-middleware');
  // #endregion
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // #region agent log
      debug.warn('Auth Middleware: No token provided', { path: req.path }, 'auth-no-token');
      // #endregion
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌',
      });
    }

    const token = authHeader.substring(7);
    // #region agent log
    debug.log('Auth Middleware: Verifying token', { tokenLength: token.length }, 'auth-verify');
    // #endregion
    const payload = verifyToken(token);

    if (!payload) {
      // #region agent log
      debug.warn('Auth Middleware: Invalid token', { path: req.path }, 'auth-invalid-token');
      // #endregion
      return res.status(401).json({
        success: false,
        message: '无效的认证令牌',
      });
    }

    // #region agent log
    debug.traceExit('authMiddleware', { userId: payload.userId }, 'auth-middleware');
    // #endregion
    req.user = payload;
    return next();
  } catch (error) {
    // #region agent log
    debug.error('Auth Middleware Error', error, 'auth-middleware-error');
    // #endregion
    return res.status(401).json({
      success: false,
      message: '认证失败',
    });
  }
}
