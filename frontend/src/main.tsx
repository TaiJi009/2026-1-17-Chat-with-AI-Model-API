import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { debug, setupGlobalErrorHandling } from './utils/debug'

// 初始化全局调试和错误处理
setupGlobalErrorHandling();
debug.log('前端应用启动', { mode: import.meta.env.MODE });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
