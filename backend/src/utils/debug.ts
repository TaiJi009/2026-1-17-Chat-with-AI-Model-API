import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

// 调试模式：通过环境变量控制，默认为开发模式启用
const DEBUG_ENABLED = process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development';
const LOG_SERVER = 'http://127.0.0.1:7268/ingest/2ea31336-ca09-4483-9da3-87c22c9d234b';

// 发送日志到调试服务器
async function sendLog(logData: any) {
  if (!DEBUG_ENABLED) return;
  
  try {
    await axios.post(LOG_SERVER, {
      ...logData,
      timestamp: Date.now(),
      sessionId: 'debug-session',
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 1000, // 1秒超时，避免阻塞
    }).catch(() => {});
  } catch (error) {
    // 静默失败，不影响主程序
  }
}

// 调试日志接口
export const debug = {
  log: (message: string, data?: any, hypothesisId?: string) => {
    if (DEBUG_ENABLED) {
      const logData = {
        location: 'backend',
        message,
        data: data || {},
        hypothesisId: hypothesisId || 'global',
        runId: 'run1',
      };
      sendLog(logData);
      console.log(`[DEBUG] ${message}`, data || '');
    }
  },

  error: (message: string, error: any, hypothesisId?: string) => {
    if (DEBUG_ENABLED) {
      const logData = {
        location: 'backend',
        message,
        data: {
          error: error?.message || String(error),
          stack: error?.stack,
        },
        hypothesisId: hypothesisId || 'error',
        runId: 'run1',
      };
      sendLog(logData);
      console.error(`[DEBUG ERROR] ${message}`, error);
    }
  },

  warn: (message: string, data?: any) => {
    if (DEBUG_ENABLED) {
      const logData = {
        location: 'backend',
        message,
        data: data || {},
        hypothesisId: 'warning',
        runId: 'run1',
      };
      sendLog(logData);
      console.warn(`[DEBUG WARN] ${message}`, data || '');
    }
  },

  // 函数执行追踪
  trace: (fnName: string, params?: any, hypothesisId?: string) => {
    if (DEBUG_ENABLED) {
      debug.log(`[TRACE] ${fnName} entry`, { params }, hypothesisId);
    }
  },

  traceExit: (fnName: string, result?: any, hypothesisId?: string) => {
    if (DEBUG_ENABLED) {
      debug.log(`[TRACE] ${fnName} exit`, { result }, hypothesisId);
    }
  },
};

// 全局错误处理器
export function setupGlobalErrorHandling() {
  if (!DEBUG_ENABLED) return;

  // 捕获未处理的Promise拒绝
  process.on('unhandledRejection', (reason, promise) => {
    debug.error('Unhandled Promise Rejection', reason, 'unhandled-rejection');
  });

  // 捕获未处理的异常
  process.on('uncaughtException', (error) => {
    debug.error('Uncaught Exception', error, 'uncaught-exception');
  });
}
