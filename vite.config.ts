import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// 自定义插件：复制 real-readme.md 到 public 目录
function copyPromptFile() {
  return {
    name: 'copy-prompt-file',
    buildStart() {
      const sourceFile = join(__dirname, 'prompt-engineering', 'real-readme.md')
      const targetDir = join(__dirname, 'public', 'prompt-engineering')
      const targetFile = join(targetDir, 'real-readme.md')
      
      if (existsSync(sourceFile)) {
        if (!existsSync(targetDir)) {
          mkdirSync(targetDir, { recursive: true })
        }
        copyFileSync(sourceFile, targetFile)
        console.log('✓ Copied prompt-engineering/real-readme.md to public/')
      } else {
        console.warn('⚠ prompt-engineering/real-readme.md not found')
      }
    },
    // 开发模式下也复制文件
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.includes('/prompt-engineering/real-readme.md')) {
          const sourceFile = join(__dirname, 'prompt-engineering', 'real-readme.md')
          const targetDir = join(__dirname, 'public', 'prompt-engineering')
          const targetFile = join(targetDir, 'real-readme.md')
          
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
