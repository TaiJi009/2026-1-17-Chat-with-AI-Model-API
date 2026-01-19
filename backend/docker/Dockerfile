FROM node:18-alpine AS builder

WORKDIR /app

# 复制package文件
COPY package*.json ./
COPY tsconfig.json ./

# 安装所有依赖（包括devDependencies，用于构建）
RUN npm ci

# 复制源代码
COPY src ./src
COPY migrations ./migrations

# 构建TypeScript
RUN npm run build

# 生产环境镜像
FROM node:18-alpine AS production

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 只安装生产依赖
RUN npm ci --only=production && npm cache clean --force

# 安装wget用于健康检查（需要在root用户下安装）
RUN apk add --no-cache wget

# 从构建阶段复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 更改文件所有者
RUN chown -R nodejs:nodejs /app

# 暴露端口
EXPOSE 3000

# 健康检查（使用wget，需要在root用户下运行）
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# 切换到非root用户
USER nodejs

# 启动应用
CMD ["node", "dist/app.js"]
