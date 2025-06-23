# 个人网盘系统

一个现代化的个人网盘系统，基于 **Vue 3 + Node.js + MongoDB**，集成了文件管理、系统监控、热搜榜单、时间同步、用户认证等多种实用功能，支持 Docker 一键部署，界面美观，体验流畅。

---

## 🗂️ 项目结构

```
.
├── node/           # Node.js 后端服务
├── vue/            # Vue 3 前端应用
├── docker-compose.yml  # Docker 编排配置
└── mongo-init.js   # MongoDB 初始化脚本
```

---

## 🚀 功能概览

### 前端（Vue 3 + Element Plus）
- 响应式个人网盘界面，支持明暗主题和自定义主题色
- 多文件上传、分片上传、断点续传、下载、删除、搜索、类型筛选
- 公共/个人云盘切换
- 实时系统监控（CPU/内存/运行时间）
- 热搜榜单（微博/B 站）展示与跳转
- 用户注册、登录、修改密码
- 支持动画、透明度调节、移动端适配

### 后端（Node.js + Express + MongoDB）
- 文件管理 API（上传、分片、合并、下载、删除、搜索、MD5 查重）
- 用户认证（JWT 注册/登录/信息/改密）
- 系统监控 API（CPU、内存、运行时间）
- 热搜数据采集与接口
- 时间同步（NTP、本地校准）
- 统一错误处理、CORS、请求日志、文件编码检测

---

## ⚙️ 技术栈

- 前端：Vue 3、Element Plus、Vue Router、Axios、ECharts、SCSS、Vite
- 后端：Node.js、Express、Mongoose、JWT、Nodemon
- 数据库：MongoDB
- 构建/部署：Docker、Docker Compose

---

## 📦 快速开始

### 一键 Docker 部署（推荐）

1. 克隆项目
   ```bash
   git clone https://github.com/sailinnaxishen/Html.git
   cd Html
   ```
2. 启动服务
   ```bash
   docker compose up -d
   ```
3. 访问应用
   - 前端：http://localhost:41737
   - 后端：http://localhost:3000

### 手动部署

#### 后端
```bash
cd node
npm install
# 配置 .env 文件（见 node/README_node.md 示例）
npm run dev  # 开发环境
# 或
npm run build && npm start  # 生产环境
```

#### 前端
```bash
cd vue
npm install
npm run dev      # 开发环境
npm run build    # 构建生产包
npm run preview  # 预览生产环境
```

---

## 🔑 主要接口

### 认证相关
| 方法 | 路径 | 说明 |
|------|-----------------------|----------------|
| POST | /api/auth/register    | 用户注册       |
| POST | /api/auth/login       | 用户登录（JWT）|
| GET  | /api/auth/me          | 获取用户信息   |
| POST | /api/auth/change-password | 修改密码   |

### 文件相关
| 方法 | 路径 | 说明 |
|------|-----------------------------|----------------|
| GET  | /api/files                  | 文件列表       |
| POST | /api/files/upload           | 上传文件       |
| POST | /api/files/upload-chunk     | 分片上传       |
| POST | /api/files/merge-chunks     | 合并分片       |
| GET  | /api/files/uploaded-chunks  | 查询已上传分片 |
| GET  | /api/files/download/:id     | 下载文件       |
| DELETE | /api/files/:id            | 删除文件       |
| GET  | /api/files/search           | 搜索文件       |

### 系统监控
| 方法 | 路径 | 说明 |
|------|---------------------------|----------------|
| GET  | /api/monitor/system-stats | 系统资源情况   |

### 热搜数据
| 方法 | 路径 | 说明 |
|------|-------------------------------|----------------|
| GET  | /api/hot-search/:platform     | 获取热搜       |
| POST | /api/hot-search/test/insert   | 插入测试数据   |

### 时间服务
| 方法 | 路径 | 说明 |
|------|-----------------------|----------------|
| GET  | /api/time/ntp         | 获取 NTP 时间  |
| GET  | /api/time/calibrated  | 获取校准时间   |

---

## 🛡️ 认证与安全
1. 注册账号 `/api/auth/register`（用户名、密码）
2. 登录 `/api/auth/login`（返回 JWT）
3. 后续请求需在 Header 中携带 `Authorization: Bearer <token>`
4. 生产环境请妥善配置 CORS 和 JWT 密钥

---

## ⚡ 环境变量

- 后端 `.env` 示例：
  ```
  PORT=3000
  NODE_ENV=development
  MONGODB_URI=mongodb://admin:123456@localhost:27017/hot_search_db
  CORS_ORIGINS=http://localhost:3000,http://localhost:8080
  JWT_SECRET=your_jwt_secret
  ```
- 前端 `.env.development`/`.env.preview` 主要配置：
  - `VITE_API_BASE_URL`：后端 API 地址
  - `VITE_APP_TITLE`：项目标题
  - `VITE_APP_DESCRIPTION`：项目描述
  - `VITE_production_PORT`：运行端口

---

## 🧑‍💻 开发与维护

### 常用命令

```bash
# 查看所有服务日志
docker compose logs -f
# 重启所有服务
docker compose restart
# 清理构建产物
rm -rf dist
rm -rf node_modules/.vite
# 重新构建
npm run build
```

### 数据备份

```bash
# 备份 MongoDB 数据
docker compose exec mongodb mongodump --out /backup
```

### 开发建议
- 推荐使用 Docker 部署，确保 MongoDB 服务已启动
- 上传目录自动创建，支持分片上传
- 生产环境注意安全配置
- 推荐使用 PM2 管理 Node.js 进程
- 前端建议使用 ESLint、Prettier 规范代码

---

## 📝 响应格式

- 成功响应：
  ```json
  {
    "code": 200,
    "message": "操作成功",
    "data": {}
  }
  ```
- 错误响应：
  ```json
  {
    "code": 500,
    "message": "错误信息",
    "error": "详细错误（仅开发环境）"
  }
  ```

---

## 📬 贡献与支持

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

如有问题欢迎提 Issue 或联系作者。