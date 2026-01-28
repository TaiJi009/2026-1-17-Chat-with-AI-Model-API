import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// 自定义插件：复制 prompt-engineering/Prompt-3.0.md 到 public 目录
function copyPromptFile() {
  const sourceFile = join(__dirname, '..', 'prompt-engineering', 'Prompt-3.0.md')
  const targetDir = join(__dirname, 'public')
  const targetFile = join(targetDir, 'Prompt-3.0.md')
  
  // 复制文件的辅助函数
  const doCopy = () => {
    if (existsSync(sourceFile)) {
      if (!existsSync(targetDir)) {
        mkdirSync(targetDir, { recursive: true })
      }
      copyFileSync(sourceFile, targetFile)
      console.log('✓ Copied Prompt-3.0.md to public/')
      return true
    } else {
      console.warn('⚠ Prompt-3.0.md not found at:', sourceFile)
      return false
    }
  }
  
  return {
    name: 'copy-prompt-file',
    // 构建时复制
    buildStart() {
      doCopy()
    },
    // 开发服务器启动时也复制
    configureServer(server) {
      // 服务器启动时立即复制一次
      doCopy()
      
      // 请求时也确保文件存在（热更新）
      server.middlewares.use((req, res, next) => {
        if (req.url?.includes('/Prompt-3.0.md') || req.url?.includes(encodeURIComponent('Prompt-3.0.md'))) {
          doCopy()
        }
        next()
      })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), copyPromptFile()],
  base: '/2026-1-17-Chat-with-AI-Model-API/',
  build: {
    sourcemap: true, // 启用source map用于调试
  },
  server: {
    sourcemapIgnoreList: false, // 不忽略source map
  },
})
