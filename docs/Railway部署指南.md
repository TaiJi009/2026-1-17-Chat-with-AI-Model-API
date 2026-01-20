# Railway部署指南 - 手把手教程

## 📖 写在前面

这个指南会一步一步教您如何在Railway网站上部署您的后端和数据库。不用担心，即使您是第一次使用，跟着步骤做就可以了！

**简单理解**：Railway就像一个云服务器，您把代码放上去，它就会自动帮您运行。我们需要部署两个东西：
1. **数据库**（存储用户数据）
2. **后端服务**（处理业务逻辑）

---

## ⚠️ 重要提示

**Railway不能直接使用docker-compose.yml文件**

这意味着您不能直接把整个项目一次性部署。需要分两步：
1. 先部署数据库
2. 再部署后端服务
3. 然后把它们连接起来

---

## 🎯 第一步：登录并创建项目

### 1.1 打开Railway网站

1. 在浏览器中打开：https://railway.app
2. 如果您还没有账号，点击右上角的 **"Login"** 或 **"Sign Up"** 注册
   - 可以用GitHub账号直接登录（推荐）
   - 或者用邮箱注册

### 1.2 创建新项目

1. 登录后，您会看到Railway的主界面
2. 点击左上角或中间的 **"+ New Project"** 按钮（绿色的大按钮）
3. 在弹出的菜单中，选择 **"Deploy from GitHub repo"**
   - 如果是第一次使用，可能需要先授权Railway访问您的GitHub账号
   - 点击 **"Configure GitHub App"** 或 **"Authorize"** 按钮
   - 选择您要授权的仓库，或者选择 **"All repositories"**

4. 在仓库列表中，找到并选择您的项目：**`2026-1-17-Chat-with-AI-Model-API`**
5. 点击仓库名称，Railway会自动开始创建项目

**💡 提示**：创建项目后，您会看到一个空的项目界面，这是正常的，因为我们还没有添加任何服务。

---

## 🗄️ 第二步：部署数据库（PostgreSQL）

### 2.1 添加数据库服务

1. 在项目界面中，您会看到一个 **"+ New"** 按钮（通常在左侧或顶部）
2. 点击 **"+ New"** 按钮
3. 会弹出一个菜单，选择 **"Database"**
4. 在数据库列表中，选择 **"PostgreSQL"**
   - 您会看到几个选项，选择 **"Add PostgreSQL"** 或直接点击PostgreSQL图标

### 2.2 等待数据库启动

1. Railway会自动开始创建数据库
2. 您会看到一个新的服务卡片出现在项目界面中
3. 等待几秒钟，直到服务状态显示为 **"Active"**（绿色）
   - 如果显示 "Deploying" 或 "Building"，请稍等片刻

### 2.3 查看数据库连接信息（重要！）

1. 点击刚才创建的PostgreSQL服务卡片
2. 点击顶部的 **"Variables"** 标签页
3. 您会看到Railway自动生成的环境变量，包括：
   - `DATABASE_URL` - 这是最重要的，包含了完整的数据库连接信息
   - `PGHOST` - 数据库地址
   - `PGPORT` - 数据库端口（通常是5432）
   - `PGUSER` - 数据库用户名
   - `PGPASSWORD` - 数据库密码
   - `PGDATABASE` - 数据库名称

**📝 重要**：现在先不要关闭这个页面，或者把这些信息复制下来，等会儿配置后端服务时会用到。

**💡 提示**：您不需要记住这些值，Railway提供了更方便的方法来连接服务（后面会讲）。

---

## 🚀 第三步：部署后端服务

### 3.1 添加后端服务

1. 回到项目主界面（点击左上角的项目名称）
2. 再次点击 **"+ New"** 按钮
3. 这次选择 **"GitHub Repo"** 或 **"Empty Service"**
   - 如果选择 "GitHub Repo"，选择您的仓库
   - 如果选择 "Empty Service"，需要手动配置

### 3.2 配置服务根目录（重要！）

1. 点击新创建的后端服务卡片
2. 点击顶部的 **"Settings"** 标签页
3. 向下滚动，找到 **"Root Directory"** 设置
4. 在输入框中输入：`backend`
   - 这告诉Railway您的后端代码在 `backend` 文件夹里
5. 点击 **"Save"** 或等待自动保存

**💡 提示**：如果找不到 "Root Directory" 设置，可能在 "Deploy" 部分，或者需要先保存服务。

### 3.3 配置Dockerfile路径（如果使用Docker）

1. 在同一个 "Settings" 页面中
2. 找到 **"Dockerfile Path"** 或 **"Dockerfile"** 设置
3. 输入：`backend/docker/Dockerfile`
   - 或者让Railway自动检测（通常会自动找到）

**💡 提示**：如果Railway自动检测到了Dockerfile，您可能不需要手动设置。

### 3.4 检查构建和启动命令

1. 在 "Settings" 页面中，找到 **"Build Command"** 和 **"Start Command"**
2. 如果使用Docker，这些通常不需要设置（Dockerfile会处理）
3. 如果不使用Docker，确保：
   - **Build Command**：`npm install && npm run build`
   - **Start Command**：`npm start`

**💡 提示**：Railway通常会自动检测这些命令，如果一切正常，可以不用修改。

---

## 🔗 第四步：连接数据库和后端服务

这是最关键的一步！我们需要让后端服务知道如何连接数据库。

### 方法一：使用Railway的引用功能（推荐，最简单）

1. 点击您的**后端服务**卡片（不是数据库服务）
2. 点击顶部的 **"Variables"** 标签页
3. 点击 **"+ New Variable"** 或 **"Add Variable"** 按钮
4. 在弹出的对话框中：
   - 在 **"Variable Name"** 输入：`DATABASE_URL`
   - 在 **"Value"** 输入框旁边，您会看到一个 **"Reference"** 或 **"Link"** 图标
   - 点击这个图标，会弹出一个服务选择菜单
   - 选择您的 **PostgreSQL服务**
   - 然后选择 **`DATABASE_URL`** 变量
5. Railway会自动填充值，格式类似：`${{PostgreSQL.DATABASE_URL}}`
6. 点击 **"Add"** 或 **"Save"**

**🎉 完成！** 这样后端服务就能自动连接到数据库了。

### 方法二：手动复制（如果方法一不行）

1. 点击您的**PostgreSQL服务**卡片
2. 点击 **"Variables"** 标签页
3. 找到 `DATABASE_URL` 变量，点击右侧的**眼睛图标**或**复制图标**查看/复制值
4. 复制整个值（类似：`postgresql://user:password@host:port/database`）
5. 回到**后端服务**的 **"Variables"** 标签页
6. 点击 **"+ New Variable"**
7. 输入：
   - **Variable Name**：`DATABASE_URL`
   - **Value**：粘贴刚才复制的值
8. 点击 **"Add"** 保存

---

## ⚙️ 第五步：配置其他环境变量

现在需要配置其他必要的环境变量。继续在后端服务的 **"Variables"** 标签页操作。

### 5.1 添加JWT密钥

1. 点击 **"+ New Variable"**
2. 输入：
   - **Variable Name**：`JWT_SECRET`
   - **Value**：输入一个随机字符串（至少32个字符）
     - 例如：`my-super-secret-jwt-key-2026-change-this`
     - **重要**：不要使用示例值，自己生成一个复杂的字符串
3. 点击 **"Add"**

**💡 生成随机密钥的方法**：
- 在线工具：https://randomkeygen.com
- 或者用命令：`openssl rand -base64 32`

### 5.2 添加JWT过期时间（可选）

1. 点击 **"+ New Variable"**
2. 输入：
   - **Variable Name**：`JWT_EXPIRES_IN`
   - **Value**：`7d`（7天，您可以根据需要修改）
3. 点击 **"Add"**

### 5.3 添加运行环境

1. 点击 **"+ New Variable"**
2. 输入：
   - **Variable Name**：`NODE_ENV`
   - **Value**：`production`
3. 点击 **"Add"**

### 5.4 添加CORS配置（重要！）

这个配置允许您的前端网站访问后端API。

1. 点击 **"+ New Variable"**
2. 输入：
   - **Variable Name**：`CORS_ORIGIN`
   - **Value**：输入您的前端网站地址
     - 如果是GitHub Pages：`https://您的用户名.github.io`
     - 如果有多个域名，用逗号分隔：`https://domain1.com,https://domain2.com`
     - 例如：`https://username.github.io,https://your-custom-domain.com`
3. 点击 **"Add"**

**💡 提示**：如果暂时不知道前端地址，可以先设置一个，后面再修改。

### 5.5 端口配置（重要！）

**⚠️ 注意**：**不要手动设置 `PORT` 环境变量！**

Railway会自动设置 `PORT` 环境变量（通常是8080），您的应用代码已经配置好了，会自动读取这个值。如果您手动设置了，可能会导致冲突。

### 5.6 微信支付配置（如果使用）

如果您需要使用微信支付功能，添加以下变量：

1. `WECHAT_APP_ID` - 您的微信AppID
2. `WECHAT_MCH_ID` - 商户号
3. `WECHAT_API_KEY` - API密钥
4. `WECHAT_NOTIFY_URL` - 回调地址（等生成域名后再设置）
5. `WECHAT_SANDBOX` - 设置为 `false`（生产环境）

**💡 提示**：`WECHAT_NOTIFY_URL` 需要等后面生成域名后再设置。

### 5.7 腾讯云短信配置（如果使用）

如果您需要使用短信验证码功能，添加以下变量：

1. `TENCENT_SMS_SECRET_ID` - 腾讯云SecretId
2. `TENCENT_SMS_SECRET_KEY` - 腾讯云SecretKey
3. `TENCENT_SMS_APP_ID` - 短信应用ID
4. `TENCENT_SMS_SIGN_NAME` - 短信签名
5. `TENCENT_SMS_TEMPLATE_ID` - 短信模板ID

---

## 🌐 第六步：生成服务域名

现在我们需要给后端服务生成一个可以访问的网址。

1. 确保您在后端服务的页面中
2. 点击顶部的 **"Settings"** 标签页
3. 向下滚动，找到 **"Networking"** 部分
4. 在 **"Public Networking"** 或 **"Generate Domain"** 区域
5. 点击 **"Generate Domain"** 按钮
6. Railway会自动生成一个域名，格式类似：`your-service-name.railway.app`
7. 复制这个域名，等会儿会用到

**💡 提示**：
- 这个域名是HTTPS的，可以直接使用
- 如果之前设置了 `WECHAT_NOTIFY_URL`，现在可以更新为：`https://您的域名.railway.app/api/payment/wechat/callback`

---

## 🗃️ 第七步：运行数据库迁移

数据库创建好了，但还需要创建数据表。这叫做"数据库迁移"。

### 方法一：使用Railway CLI（推荐）

1. **安装Railway CLI**：
   - 打开命令行（Windows: PowerShell 或 CMD，Mac/Linux: Terminal）
   - 运行：`npm install -g @railway/cli`
   - 如果提示权限问题，可能需要用管理员权限运行

2. **登录Railway**：
   ```bash
   railway login
   ```
   - 会打开浏览器，授权登录

3. **链接到项目**：
   ```bash
   railway link
   ```
   - 选择您刚才创建的项目

4. **运行迁移**：
   ```bash
   railway run npm run migrate
   ```
   - 确保您在项目的 `backend` 目录下运行这个命令
   - 或者使用：`cd backend && railway run npm run migrate`

### 方法二：在部署命令中添加（简单但每次都会运行）

1. 在后端服务的 **"Settings"** 标签页
2. 找到 **"Deploy Command"** 或 **"Start Command"**
3. 修改为：`npm run migrate && npm start`
   - 这样每次部署时都会自动运行迁移

**⚠️ 注意**：方法二会在每次部署时都运行迁移，如果迁移脚本没有做幂等性处理，可能会出错。

---

## ✅ 第八步：验证部署

### 8.1 检查服务状态

1. 回到项目主界面
2. 检查两个服务是否都显示为 **"Active"**（绿色）
   - PostgreSQL服务应该是绿色的
   - 后端服务也应该是绿色的
3. 如果显示红色或黄色，点击服务查看错误信息

### 8.2 测试健康检查

1. 打开浏览器
2. 访问：`https://您的域名.railway.app/health`
   - 例如：`https://your-service.railway.app/health`
3. 应该看到类似这样的JSON响应：
   ```json
   {
     "success": true,
     "message": "服务运行正常",
     "timestamp": "2026-01-17T..."
   }
   ```

**🎉 如果看到这个响应，说明部署成功了！**

### 8.3 查看日志

如果服务有问题，可以查看日志：

1. 点击后端服务卡片
2. 点击 **"Deployments"** 标签页
3. 点击最新的部署记录
4. 查看构建日志和运行日志
5. 如果有错误（红色文字），根据错误信息排查问题

**常见日志信息**：
- `服务器运行在端口 8080` - 说明服务启动成功
- `数据库连接成功` - 说明数据库连接正常
- 如果有错误，会显示具体的错误信息

---

## 🔧 常见问题解决

### 问题1：服务无法启动

**可能原因**：
- 环境变量配置不完整
- 代码有错误
- 端口配置问题

**解决方法**：
1. 检查 **"Variables"** 标签页，确保所有必需的环境变量都已设置
2. 查看 **"Deployments"** 标签页的日志，找到错误信息
3. 确保没有手动设置 `PORT` 环境变量

### 问题2：数据库连接失败

**可能原因**：
- `DATABASE_URL` 没有正确配置
- 数据库服务没有启动

**解决方法**：
1. 检查后端服务的 `DATABASE_URL` 变量是否正确
2. 确保PostgreSQL服务显示为 "Active"
3. 如果使用引用方式，确保引用格式正确：`${{PostgreSQL.DATABASE_URL}}`

### 问题3：CORS错误（前端无法访问后端）

**可能原因**：
- `CORS_ORIGIN` 环境变量没有设置或设置错误

**解决方法**：
1. 检查 `CORS_ORIGIN` 环境变量
2. 确保包含完整的前端域名（包括 `https://`）
3. 多个域名用逗号分隔，不要有空格

### 问题4：找不到Dockerfile

**可能原因**：
- Root Directory设置错误
- Dockerfile路径不正确

**解决方法**：
1. 检查 **"Settings"** → **"Root Directory"** 是否为 `backend`
2. 检查 **"Dockerfile Path"** 是否为 `backend/docker/Dockerfile`
3. 或者让Railway自动检测

### 问题5：迁移失败

**可能原因**：
- 数据库连接失败
- 迁移脚本有错误

**解决方法**：
1. 先确保数据库连接正常
2. 查看迁移日志，找到具体错误
3. 检查迁移脚本文件是否存在：`backend/migrations/001_initial.sql`

---

## 📋 环境变量检查清单

部署完成后，使用这个清单检查是否所有环境变量都已配置：

**必需的环境变量**：
- [ ] `DATABASE_URL` - 数据库连接字符串
- [ ] `JWT_SECRET` - JWT密钥（不要使用默认值）
- [ ] `NODE_ENV=production` - 运行环境
- [ ] `CORS_ORIGIN` - 前端域名

**可选的环境变量**：
- [ ] `JWT_EXPIRES_IN` - JWT过期时间（默认7d）
- [ ] `WECHAT_APP_ID` - 微信支付AppID（如果使用）
- [ ] `WECHAT_MCH_ID` - 微信支付商户号（如果使用）
- [ ] `WECHAT_API_KEY` - 微信支付API密钥（如果使用）
- [ ] `WECHAT_NOTIFY_URL` - 微信支付回调地址（如果使用）
- [ ] `TENCENT_SMS_*` - 腾讯云短信配置（如果使用）

**不要设置的环境变量**：
- [ ] `PORT` - Railway会自动设置，不要手动设置

---

## 🔄 更新代码

当您修改代码并推送到GitHub后：

1. Railway会自动检测到代码变更
2. 自动开始重新构建和部署
3. 您可以在 **"Deployments"** 标签页查看部署进度
4. 部署完成后，新版本会自动生效

**💡 提示**：部署通常需要1-3分钟，请耐心等待。

---

## 📊 查看监控信息

Railway提供基本的监控功能：

1. 点击服务卡片
2. 在服务页面可以看到：
   - CPU使用率
   - 内存使用率
   - 网络流量
   - 请求数量

---

## 💰 费用说明

Railway提供免费额度：
- **$5/月** 或 **500小时运行时间**（以先到为准）
- 对于小型项目，免费额度通常足够使用
- 超出后按使用量计费

**💡 提示**：如果只是测试或小型项目，免费额度应该够用。

---

## 🎯 部署完成后的下一步

1. **更新前端配置**：
   - 将前端的API地址改为Railway生成的域名
   - 例如：`https://your-service.railway.app`

2. **测试功能**：
   - 测试用户注册/登录
   - 测试API调用
   - 测试支付功能（如果已配置）

3. **配置自定义域名**（可选）：
   - 在Railway服务设置中添加自定义域名
   - 配置DNS记录指向Railway

---

## 📚 相关文档

- [Railway部署检查清单](./Railway部署检查清单.md) - 详细的检查清单
- [Docker部署快速指南](./Docker部署快速指南.md) - 本地Docker部署
- [账号功能与付费功能文档](./账号功能与付费功能/0-付费功能与账号系统.md) - 功能说明

---

## 💬 需要帮助？

如果遇到问题：
1. 先查看本文档的"常见问题解决"部分
2. 查看Railway的部署日志
3. 检查环境变量配置
4. 参考 [Railway部署检查清单](./Railway部署检查清单.md)

祝您部署顺利！🎉
