# Docker Desktop PostgreSQL 容器配置指南

根据项目的 `backend/docker/docker-compose.yml` 配置，以下是填写 Docker Desktop "Run a new container" 界面的详细说明。

## 配置参数

### 1. Container name（容器名称）

```
chat_app_postgres
```

### 2. Ports（端口映射）

- **Host port**: `5432`
- **Container port**: `5432/tcp`（已自动显示）

> **注意**：如果本地 5432 端口已被占用，可以修改 Host port 为其他端口（如 5433），但需要同步修改后端配置中的 `DB_PORT` 环境变量。

### 3. Volumes（数据卷）

需要添加两个卷挂载：

#### 卷 1：数据持久化（必需）

- **Host path**: 选择一个本地目录用于存储数据库数据
  - **Windows 重要提示**：路径中如果有空格或特殊字符，必须使用以下格式之一：
    - 使用正斜杠：`F:/AI Creativity/2026-1-17-Chat-with-AI-Model-API/backend/docker/postgres_data`
    - 使用双反斜杠：`F:\\AI Creativity\\2026-1-17-Chat-with-AI-Model-API\\backend\\docker\\postgres_data`
    - 或者点击 "Browse" 按钮选择目录（推荐，会自动处理路径格式）
  - 或者使用 Docker 命名卷（推荐，但需要在 docker-compose 中配置）
- **Container path**: `/var/lib/postgresql/data`

> **重要**：
> - 必须挂载此目录，否则容器删除后数据会丢失
> - **Windows 路径格式问题**：如果路径包含空格，Docker Desktop 可能会将反斜杠路径误认为卷名。请使用正斜杠 `/` 或通过 "Browse" 按钮选择目录

#### 卷 2：初始化脚本（推荐）

- **Host path**: 
  - Windows 格式：`F:/AI Creativity/2026-1-17-Chat-with-AI-Model-API/backend/migrations`
  - 或点击 "Browse" 按钮选择 `backend/migrations` 目录
- **Container path**: `/docker-entrypoint-initdb.d`

> **说明**：如果挂载了 `migrations` 目录到 `/docker-entrypoint-initdb.d`，容器首次启动时会自动执行 SQL 脚本（如 `001_initial.sql`），创建所需的表结构。

### 4. Environment variables（环境变量）

需要添加以下三个环境变量：

| Variable | Value | 说明 |
|----------|-------|------|
| `POSTGRES_USER` | `user` | 数据库用户名（默认值，建议修改为更安全的用户名） |
| `POSTGRES_PASSWORD` | `password` | 数据库密码（**强烈建议修改为强密码**） |
| `POSTGRES_DB` | `chat_app` | 数据库名称 |

#### 推荐的安全配置

- `POSTGRES_USER`: 使用自定义用户名（如 `chat_app_user`）
- `POSTGRES_PASSWORD`: 使用强密码（至少16个字符，包含大小写字母、数字和特殊字符）
- `POSTGRES_DB`: `chat_app`（保持不变）

## 完整配置示例

### 最小配置（使用默认值）

```
Container name: chat_app_postgres
Host port: 5432
Environment variables:
  - POSTGRES_USER=user
  - POSTGRES_PASSWORD=password
  - POSTGRES_DB=chat_app
Volume 1:
  - Host path: [选择本地目录]/postgres_data
  - Container path: /var/lib/postgresql/data
```

### 推荐配置（包含初始化脚本）

```
Container name: chat_app_postgres
Host port: 5432
Environment variables:
  - POSTGRES_USER=chat_app_user
  - POSTGRES_PASSWORD=YourSecurePassword123!
  - POSTGRES_DB=chat_app
Volume 1:
  - Host path: F:/AI Creativity/2026-1-17-Chat-with-AI-Model-API/backend/docker/postgres_data
  - Container path: /var/lib/postgresql/data
Volume 2:
  - Host path: F:/AI Creativity/2026-1-17-Chat-with-AI-Model-API/backend/migrations
  - Container path: /docker-entrypoint-initdb.d
```

## 配置步骤（详细）

### 步骤 1：填写容器名称

在 "Container name" 输入框中输入：
```
chat_app_postgres
```

### 步骤 2：配置端口映射

1. 在 "Ports" 部分，找到 "Host port" 输入框
2. 输入：`5432`
3. Container port 会自动显示为 `5432/tcp`

### 步骤 3：添加数据卷

#### 添加第一个卷（数据持久化）

1. 在 "Volumes" 部分，点击 "Host path" 输入框旁的 **"Browse"** 按钮（推荐）
2. 浏览并选择本地目录：`F:\AI Creativity\2026-1-17-Chat-with-AI-Model-API\backend\docker\postgres_data`
   - 如果目录不存在，请先手动创建该目录
   - **如果手动输入路径**，必须使用正斜杠格式：`F:/AI Creativity/2026-1-17-Chat-with-AI-Model-API/backend/docker/postgres_data`
3. 在 "Container path" 输入框中输入：`/var/lib/postgresql/data`

#### 添加第二个卷（初始化脚本）

1. 点击 "Volumes" 部分的 "+" 按钮添加新卷
2. 点击 "Host path" 输入框旁的 **"Browse"** 按钮，选择 `backend/migrations` 目录
   - **如果手动输入路径**，必须使用正斜杠格式：`F:/AI Creativity/2026-1-17-Chat-with-AI-Model-API/backend/migrations`
3. 在 "Container path" 输入框中输入：`/docker-entrypoint-initdb.d`

### 步骤 4：添加环境变量

1. 在 "Environment variables" 部分，点击 "Variable" 输入框
2. 输入第一个变量名：`POSTGRES_USER`
3. 在 "Value" 输入框中输入：`user`（或自定义用户名）
4. 点击 "+" 按钮添加下一个变量
5. 重复上述步骤添加：
   - `POSTGRES_PASSWORD` = `password`（或强密码）
   - `POSTGRES_DB` = `chat_app`

## 重要提示

1. **数据持久化**：必须挂载 `/var/lib/postgresql/data` 目录，否则容器删除后数据会丢失
2. **初始化脚本**：如果挂载了 `migrations` 目录到 `/docker-entrypoint-initdb.d`，容器首次启动时会自动执行 SQL 脚本
3. **端口冲突**：如果本地 5432 端口已被占用，可以修改 Host port 为其他端口（如 5433），但需要同步修改后端配置
4. **密码安全**：生产环境必须使用强密码，不要使用默认的 "password"
5. **网络配置**：如果后端应用也在 Docker 中运行，建议使用 Docker 网络，容器名称可以作为主机名
6. **首次启动**：如果挂载了初始化脚本，容器首次启动时会执行这些脚本，可能需要一些时间

## 验证配置

容器启动后，可以通过以下方式验证：

### 1. 检查容器状态

在 Docker Desktop 中查看容器是否正常运行（状态应为 "Running"）

### 2. 测试数据库连接

使用数据库客户端（如 pgAdmin、DBeaver 或命令行）连接到：
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `chat_app`
- **Username**: `user`（或你设置的用户名）
- **Password**: `password`（或你设置的密码）

### 3. 查看容器日志

在 Docker Desktop 中：
1. 点击容器名称
2. 查看 "Logs" 标签页
3. 确认初始化脚本是否执行成功（如果挂载了 migrations 目录）

### 4. 验证表结构

连接到数据库后，执行以下 SQL 查询验证表是否已创建：

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

应该能看到以下表：
- `users`
- `orders`
- `sms_codes`

## 与 docker-compose 的对应关系

这些配置对应 `backend/docker/docker-compose.yml` 中的以下设置：

| Docker Desktop 配置 | docker-compose.yml 配置 |
|-------------------|------------------------|
| Container name: `chat_app_postgres` | `container_name: chat_app_postgres` |
| Host port: `5432` | `"${DB_PORT:-5432}:5432"` |
| POSTGRES_USER | `POSTGRES_USER: ${DB_USER:-user}` |
| POSTGRES_PASSWORD | `POSTGRES_PASSWORD: ${DB_PASSWORD:-password}` |
| POSTGRES_DB | `POSTGRES_DB: ${DB_NAME:-chat_app}` |
| Volume 1: `/var/lib/postgresql/data` | `postgres_data:/var/lib/postgresql/data` |
| Volume 2: `/docker-entrypoint-initdb.d` | `../migrations:/docker-entrypoint-initdb.d` |

## 常见问题

### Q1: 容器启动失败，提示 "invalid characters for a local volume name"

**错误信息示例**：
```
Failed to run image. (HTTP code 400) bad parameter - create ... includes invalid characters for a local volume name, only "[a-zA-Z0-9][a-zA-Z0-9_.-]" are allowed. If you intended to pass a host directory, use absolute path
```

**原因**：Windows 路径中的反斜杠 `\` 被 Docker 误认为是卷名的一部分，导致路径被解析错误。

**解决方案**：
1. **推荐方法**：使用 "Browse" 按钮选择目录，而不是手动输入路径
2. **手动输入**：如果必须手动输入，请使用正斜杠 `/` 替代反斜杠：
   - 错误：`F:\AI Creativity\...\postgres_data`
   - 正确：`F:/AI Creativity/.../postgres_data`
3. **替代方案**：使用相对路径的 Docker 命名卷（需要在 docker-compose.yml 中配置）

### Q2: 容器启动失败，提示端口被占用

**解决方案**：
- 修改 Host port 为其他端口（如 5433）
- 或者停止占用 5432 端口的其他服务

### Q3: 数据丢失

**原因**：没有挂载数据卷或挂载路径错误

**解决方案**：
- 确保正确挂载了 `/var/lib/postgresql/data` 目录
- 检查 Host path 是否正确

### Q4: 初始化脚本没有执行

**可能原因**：
1. 数据目录已存在（非首次启动）
2. 脚本文件路径错误
3. 脚本文件权限问题

**解决方案**：
- 初始化脚本只在首次启动时执行（数据目录为空时）
- 如果需要重新执行，需要删除数据目录或使用新的数据目录
- 检查 migrations 目录中的 SQL 文件是否存在

### Q5: 无法连接到数据库

**检查清单**：
1. 容器是否正在运行
2. 端口映射是否正确
3. 环境变量是否正确设置
4. 防火墙是否阻止了连接
5. 查看容器日志是否有错误信息

## 后续步骤

配置完成后，你需要：

1. **配置后端环境变量**：在 `backend/.env` 文件中设置数据库连接信息
2. **运行数据库迁移**：如果初始化脚本未执行，需要手动运行迁移
3. **测试连接**：启动后端服务，验证数据库连接是否正常

## 相关文档

- [Docker 部署快速指南](Docker部署快速指南.md)
- [配置环境变量](Docker%20部署快速指南/02-配置环境变量.md)
- [启动服务](Docker%20部署快速指南/03-启动服务.md)
