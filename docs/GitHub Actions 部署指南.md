# GitHub Actions 部署指南

本指南详细说明如何使用 GitHub Actions 将前端应用部署到 GitHub Pages。

## 目录

- [概述](#概述)
- [部署流程](#部署流程)
- [配置说明](#配置说明)
- [查看部署分支](#查看部署分支)
- [修改部署分支](#修改部署分支)
- [常见问题](#常见问题)

## 概述

GitHub Actions 是 GitHub 提供的 CI/CD 服务，可以自动化构建和部署流程。本项目使用 GitHub Actions 自动构建 React 应用并部署到 GitHub Pages。

### 优势

- ✅ 自动化构建和部署
- ✅ 支持自定义构建流程
- ✅ 可以随时手动触发部署
- ✅ 构建日志清晰可见
- ✅ 避免双重部署问题（与"从分支部署"相比）

## 部署流程

### 1. 初始配置

#### 步骤 1：启用 GitHub Pages

1. 进入仓库的 **Settings** 页面
2. 在左侧菜单中找到 **Pages**
3. 在 **Source** 部分，选择 **GitHub Actions**
4. 保存设置

#### 步骤 2：验证工作流文件

确保仓库中存在 `.github/workflows/deploy.yml` 文件，该文件包含部署工作流配置。

### 2. 自动部署

配置完成后，每次推送到配置的分支时，GitHub Actions 会自动：

1. **检出代码** - 从指定分支拉取最新代码
2. **安装依赖** - 运行 `npm install`
3. **构建项目** - 运行 `npm run build`，生成 `dist` 目录
4. **验证构建** - 检查构建产物是否正确
5. **上传产物** - 将 `dist` 目录上传为 Pages 工件
6. **部署到 Pages** - 将构建产物部署到 GitHub Pages

### 3. 手动触发部署

除了自动触发，也可以手动触发部署：

1. 进入仓库的 **Actions** 页面
2. 在左侧选择 **"Deploy to GitHub Pages"** 工作流
3. 点击右上角的 **"Run workflow"** 按钮
4. 选择要部署的分支（如果工作流支持）
5. 点击 **"Run workflow"** 确认

## 配置说明

### 工作流文件结构

工作流文件位于 `.github/workflows/deploy.yml`，主要包含以下部分：

#### 触发配置

```yaml
on:
  push:
    branches:
      - (V2.0.0)Account-system-and-payment-system  # 触发分支
  workflow_dispatch:  # 允许手动触发
```

- `push.branches`: 指定哪些分支的推送会触发工作流
- `workflow_dispatch`: 允许在 GitHub Actions 页面手动触发

#### 构建任务

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
```

#### 部署任务

```yaml
  deploy:
    environment:
      name: github-pages
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

### 并发控制

```yaml
concurrency:
  group: "pages"
  cancel-in-progress: false
```

- `group`: 并发组名称，相同组的工作流会共享并发限制
- `cancel-in-progress`: 是否取消正在运行的旧工作流（当前设置为 `false`，允许并行运行）

## 查看部署分支

当使用 **GitHub Actions** 作为部署源时，部署分支由工作流文件中的 `on.push.branches` 配置决定。

### 方法 1：查看工作流文件（推荐）

1. 打开 `.github/workflows/deploy.yml` 文件
2. 查看文件开头的 `on.push.branches` 配置
3. 列表中的分支名称就是部署分支

**示例：**
```yaml
on:
  push:
    branches:
      - (V2.0.0)Account-system-and-payment-system  # 这就是部署分支
```

### 方法 2：在 GitHub Actions 页面查看

1. 进入仓库的 **Actions** 页面
2. 在左侧选择 **"Deploy to GitHub Pages"** 工作流
3. 点击任意一次运行记录
4. 在运行详情页面可以看到：
   - **触发事件**：显示触发类型（push/workflow_dispatch）
   - **触发分支**：显示触发工作流的分支名称

### 方法 3：在 GitHub Pages 设置页面

1. 进入 **Settings → Pages**
2. 在 **Build and deployment** 部分
3. 如果选择了 **GitHub Actions** 作为部署源，会显示当前使用的工作流名称
4. 点击工作流名称可以查看工作流文件

### 方法 4：查看工作流运行历史

1. 进入 **Actions** 页面
2. 查看工作流运行列表
3. 每个运行记录都会显示触发分支信息

## 修改部署分支

如果需要更改部署分支，按以下步骤操作：

### 步骤 1：编辑工作流文件

1. 打开 `.github/workflows/deploy.yml` 文件
2. 找到 `on.push.branches` 配置
3. 修改分支名称

**示例：从当前分支改为 main 分支**

```yaml
# 修改前
on:
  push:
    branches:
      - (V2.0.0)Account-system-and-payment-system

# 修改后
on:
  push:
    branches:
      - main
```

### 步骤 2：支持多个分支（可选）

如果需要多个分支都能触发部署，可以添加多个分支：

```yaml
on:
  push:
    branches:
      - main
      - develop
      - (V2.0.0)Account-system-and-payment-system
```

### 步骤 3：提交更改

1. 保存文件
2. 提交更改到仓库
3. 推送到任意分支（因为工作流文件在 `.github` 目录，所有分支共享）

### 步骤 4：验证配置

1. 推送到新配置的分支
2. 进入 **Actions** 页面
3. 确认工作流被触发
4. 等待部署完成

## 常见问题

### Q1: 为什么显示两个部署任务？

**A:** 如果同时看到两个部署任务（如 "Deploy to GitHub Pages" 和 "pages build and deployment"），说明：

1. **可能原因**：在 GitHub Pages 设置中选择了 **"Deploy from a branch"** 而不是 **"GitHub Actions"**
2. **解决方法**：
   - 进入 **Settings → Pages**
   - 将 **Source** 改为 **GitHub Actions**
   - 这样只会使用自定义工作流，不会触发 GitHub 的自动部署

### Q2: 如何知道当前使用的是哪个分支部署？

**A:** 查看方法：
1. 打开 `.github/workflows/deploy.yml` 文件，查看 `branches` 配置
2. 在 **Actions** 页面查看最近的工作流运行记录，可以看到触发分支
3. 推送到不同分支，观察哪个分支触发了工作流

### Q3: 部署失败怎么办？

**A:** 排查步骤：
1. 进入 **Actions** 页面，查看失败的工作流运行
2. 点击失败的运行记录，查看详细的错误日志
3. 常见问题：
   - 构建错误：检查代码是否有语法错误
   - 依赖安装失败：检查 `package.json` 配置
   - 权限问题：确保工作流有 `pages: write` 权限

### Q4: 如何只部署特定目录？

**A:** 修改工作流中的 `path` 配置：

```yaml
- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: './dist'  # 修改为您想要的路径
```

### Q5: 可以同时部署多个分支吗？

**A:** 可以，但需要：
1. 在工作流中配置多个分支触发
2. 或者为不同分支创建不同的工作流文件
3. 注意：GitHub Pages 只能有一个活动站点，多个部署会相互覆盖

### Q6: 部署需要多长时间？

**A:** 通常需要 1-3 分钟：
- 检出代码：10-20 秒
- 安装依赖：30-60 秒（取决于依赖数量）
- 构建项目：20-40 秒
- 部署到 Pages：10-20 秒

### Q7: 如何查看部署历史？

**A:** 
1. 进入 **Actions** 页面
2. 选择 **"Deploy to GitHub Pages"** 工作流
3. 查看所有运行记录
4. 点击任意记录可以查看详细的构建和部署日志

### Q8: 部署后网站没有更新？

**A:** 可能原因：
1. **缓存问题**：浏览器缓存了旧版本，尝试强制刷新（Ctrl+F5）
2. **部署未完成**：等待几分钟后再次访问
3. **部署失败**：检查 Actions 页面是否有失败的运行
4. **CDN 延迟**：GitHub Pages 使用 CDN，可能需要几分钟才能全球生效

## 相关文档

- [README.md](../README.md) - 项目主文档
- [Docker 部署快速指南](./Docker部署快速指南.md) - 后端部署指南
- [Railway 部署指南](./Railway部署指南.md) - Railway 平台部署指南

## 技术支持

如果遇到问题，可以：
1. 查看 GitHub Actions 运行日志
2. 检查工作流配置文件
3. 提交 Issue 到仓库
