import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// 自定义插件：复制 prompt-engineering/Prompt-3.0.md 到 public 目录
function copyPromptFile() {
  return {
    name: 'copy-prompt-file',
    buildStart() {
      // 从项目根目录下的 prompt-engineering 目录读取系统提示词文件
      const sourceFile = join(__dirname, '..', 'prompt-engineering', 'Prompt-3.0.md')
      const targetDir = join(__dirname, 'public')
      const targetFile = join(targetDir, 'Prompt-3.0.md')
      
      if (existsSync(sourceFile)) {
        if (!existsSync(targetDir)) {
          mkdirSync(targetDir, { recursive: true })
        }
        copyFileSync(sourceFile, targetFile)
        console.log('✓ Copied Prompt-3.0.md to public/')
      } else {
        console.warn('⚠ Prompt-3.0.md not found')
      }
    },
    // 开发模式下也复制文件
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.includes('/Prompt-3.0.md') || req.url?.includes(encodeURIComponent('Prompt-3.0.md'))) {
          const sourceFile = join(__dirname, '..', 'prompt-engineering', 'Prompt-3.0.md')
          const targetDir = join(__dirname, 'public')
          const targetFile = join(targetDir, 'Prompt-3.0.md')
          
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
