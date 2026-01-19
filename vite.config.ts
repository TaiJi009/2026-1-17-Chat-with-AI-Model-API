import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// 自定义插件：复制 系统默认提示词工程.md 到 public 目录
function copyPromptFile() {
  return {
    name: 'copy-prompt-file',
    buildStart() {
      const sourceFile = join(__dirname, '系统默认提示词工程.md')
      const targetDir = join(__dirname, 'public')
      const targetFile = join(targetDir, '系统默认提示词工程.md')
      
      if (existsSync(sourceFile)) {
        if (!existsSync(targetDir)) {
          mkdirSync(targetDir, { recursive: true })
        }
        copyFileSync(sourceFile, targetFile)
        console.log('✓ Copied 系统默认提示词工程.md to public/')
      } else {
        console.warn('⚠ 系统默认提示词工程.md not found')
      }
    },
    // 开发模式下也复制文件
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.includes('/系统默认提示词工程.md') || req.url?.includes(encodeURIComponent('系统默认提示词工程.md'))) {
          const sourceFile = join(__dirname, '系统默认提示词工程.md')
          const targetDir = join(__dirname, 'public')
          const targetFile = join(targetDir, '系统默认提示词工程.md')
          
          if (existsSync(sourceFile)) {
            if (!existsSync(targetDir)) {
              mkdirSync(targetDir, { recursive: true })
            }
            copyFileSync(sourceFile, targetFile)
          }
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
})
