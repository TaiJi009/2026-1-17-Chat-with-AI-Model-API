import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// 自定义插件：复制 prompt-engineering 下的 Prompt 文件到 public 目录
function copyPromptFile() {
  const targetDir = join(__dirname, 'public')
  const copies: { name: string; source: string; target: string }[] = [
    { name: 'Prompt-1.0.md', source: join(__dirname, '..', 'prompt-engineering', 'Prompt-1.0.md'), target: join(targetDir, 'Prompt-1.0.md') },
    { name: 'Prompt-1.0-thinking.md', source: join(__dirname, '..', 'prompt-engineering', 'Prompt-1.0-thinking.md'), target: join(targetDir, 'Prompt-1.0-thinking.md') },
  ]

  const doCopy = (entry: typeof copies[0]) => {
    if (existsSync(entry.source)) {
      if (!existsSync(targetDir)) {
        mkdirSync(targetDir, { recursive: true })
      }
      copyFileSync(entry.source, entry.target)
      console.log('✓ Copied', entry.name, 'to public/')
      return true
    }
    console.warn('⚠', entry.name, 'not found at:', entry.source)
    return false
  }

  const doCopyAll = () => copies.forEach(doCopy)

  return {
    name: 'copy-prompt-file',
    buildStart() {
      doCopyAll()
    },
    configureServer(server) {
      doCopyAll()
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? ''
        if (copies.some(c => url.includes('/' + c.name) || url.includes(encodeURIComponent(c.name)))) {
          doCopyAll()
        }
        next()
      })
    },
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
