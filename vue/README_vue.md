# 个人网盘系统

本项目是基于 Vue 3 + Element Plus 的现代化个人网盘系统，集成了网盘、系统监控、热搜榜单等多种实用功能，界面美观，体验流畅。

## 主要功能

- **首页展示**：实时时钟、系统资源监控、个人网盘入口、热搜榜单、项目介绍、明暗主题切换、组件透明度调节
- **网盘功能**：支持多文件上传、分片上传、下载、删除、文件搜索、类型筛选、公共/个人云盘切换
- **系统监控**：CPU/内存使用率实时监控、系统运行时间、NTP/本地时间切换、数据图表展示
- **用户功能**：登录/注册、修改密码、支付宝账号绑定（示例）
- **主题功能**：明暗主题切换、自定义主题色、响应式设计、动画效果、组件透明度调节

## 技术栈

- 前端框架：Vue 3
- UI 组件库：Element Plus
- 路由管理：Vue Router
- 状态管理：Vue 3 Composition API
- HTTP 客户端：Axios
- 图表库：ECharts
- 样式处理：SCSS
- 构建工具：Vite
- 时间处理：Day.js
- 文件分片上传：SparkMD5

## 项目结构

```
src/
├── assets/          # 静态资源
├── components/      # 公共组件
├── config/          # 配置文件
├── router/          # 路由配置
├── services/        # API 服务
├── styles/          # 全局样式
├── utils/           # 工具函数
└── views/           # 页面组件
    ├── Home.vue    # 首页
    ├── Files.vue   # 网盘页面
    └── Monitor.vue # 监控页面
```

## 安装与启动

### Docker 部署（推荐）

1. 确保已安装 Docker 和 Docker Compose
2. 在项目根目录运行：
   ```bash
   docker compose up -d
   ```

### 手动部署

1. 安装 Node.js（>=16.0.0）和 npm（>=7.0.0）
2. 安装依赖：
   ```bash
   npm install
   ```
3. 启动开发环境：
   ```bash
   npm run dev
   ```
4. 构建生产环境：
   ```bash
   npm run build
   ```
5. 预览生产环境：
   ```bash
   npm run preview
   ```

## 配置说明

- 开发环境配置：`.env.development`
- 生产环境配置：`.env.preview`
- 主要配置项：
  - `VITE_API_BASE_URL`：后端 API 地址
  - `VITE_APP_TITLE`：项目标题
  - `VITE_APP_DESCRIPTION`：项目描述
  - `VITE_production_PORT`：运行端口

## API 配置与路径

- API 基础路径通过环境变量 `VITE_API_BASE_URL` 配置
- 超时时间：5000ms
- 请求头：`Content-Type: application/json`
- 支持自动重试（最多 3 次，每次间隔 1000ms）

### 主要 API 路径

- 文件列表：`/api/files`
- 文件上传：`/api/files/upload`
- 分片上传：`/api/files/upload-chunk`
- 合并分片：`/api/files/merge-chunks`
- 查询已上传分片：`/api/files/uploaded-chunks`
- 取消上传：`/api/files/cancel-upload`
- 文件下载：`/api/files/download/{id}`
- 文件删除：`/api/files/{id}`
- 文件搜索：`/api/files/search`
- 系统监控：`/api/monitor/system-stats`
- NTP 时间：`/api/time/ntp`
- 热搜（Bilibili）：`/api/hot-search/bilibili`
- 热搜（微博）：`/api/hot-search/weibo`
- 用户登录：`/api/auth/login`
- 用户注册：`/api/auth/register`
- 修改密码：`/api/auth/change-password`

## 路由说明

- `/`：首页
- `/files`：网盘页面
- `/monitor`：系统监控
- `/about`：关于页面
- `/login`：登录
- `/change-password`：修改密码

详细路由配置见 `src/config/index.js`

## 使用说明

- 网盘：点击首页网盘入口或访问 `/files`，可上传、下载、删除文件，支持分片上传和断点续传。
- 系统监控：访问 `/monitor`，可实时查看 CPU、内存等系统资源信息。
- 热搜榜单：首页热搜卡片可切换平台，点击条目可跳转至原始链接。

## 开发规范

- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 遵循 Vue 3 组合式 API 风格
- 组件开发推荐 `<script setup>` 语法，使用 `defineProps`、`defineEmits`、`ref`、`computed` 等
- 样式开发推荐 SCSS，遵循 BEM 命名规范，使用 CSS 变量实现主题切换

## 常用命令

```bash
# 清理构建产物
rm -rf dist
rm -rf node_modules/.vite

# 重新构建
npm run build
```

---

如有问题欢迎提 Issue 或联系作者。