// 调试模式：通过环境变量控制，默认为开发模式启用
const DEBUG_ENABLED = import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true';
const LOG_SERVER = 'http://127.0.0.1:7268/ingest/2ea31336-ca09-4483-9da3-87c22c9d234b';

// 发送日志到调试服务器
async function sendLog(logData: any) {
  if (!DEBUG_ENABLED) return;
  
  try {
    await fetch(LOG_SERVER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...logData,
        timestamp: Date.now(),
        sessionId: 'debug-session',
      }),
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
        location: 'frontend',
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
        location: 'frontend',
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
        location: 'frontend',
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

  // 捕获全局错误
  window.addEventListener('error', (event) => {
    debug.error('Global Error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
    }, 'global-error');
  });

  // 捕获未处理的Promise拒绝
  window.addEventListener('unhandledrejection', (event) => {
    debug.error('Unhandled Promise Rejection', event.reason, 'unhandled-rejection');
  });

  // React错误边界（需要在组件中使用）
  if (typeof window !== 'undefined') {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      debug.error('Console Error', args, 'console-error');
      originalConsoleError.apply(console, args);
    };
  }
}
