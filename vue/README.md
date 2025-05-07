# 个人主页系统

基于 Vue 3 + Element Plus 开发的现代化个人主页系统，提供丰富的功能和优雅的用户界面。

## 功能特点

### 1. 首页功能
- 实时时钟显示
- 系统资源监控（CPU、内存使用率）
- 个人网盘入口
- 实时热搜榜单（支持 bilibili 和微博）
- 项目地址展示
- 关于项目介绍

### 2. 网盘功能
- 文件上传（支持多文件上传）
- 文件下载
- 文件删除
- 文件列表展示
- 文件大小和类型显示
- 上传时间记录

### 3. 系统监控
- CPU 使用率实时监控
- 内存使用率实时监控
- 系统运行时间显示
- 支持 NTP 时间和本地时间切换
- 实时数据图表展示

### 4. 主题功能
- 支持明暗主题切换
- 响应式设计
- 优雅的动画效果
- 自定义主题颜色

## 技术栈

- 前端框架：Vue 3
- UI 组件库：Element Plus
- 状态管理：Vue 3 Composition API
- 路由管理：Vue Router
- HTTP 客户端：Axios
- 图表库：ECharts
- 样式处理：SCSS
- 构建工具：Vite
- 时间处理：Day.js

## 快速开始

### 方式一：Docker 部署（推荐）

1. 确保已安装 Docker 和 Docker Compose
2. 在项目根目录运行：
```bash
docker compose up -d
```

### 方式二：手动部署

#### 环境要求
- Node.js >= 16.0.0
- npm >= 7.0.0

#### 安装依赖
```bash
npm install
```

#### 开发环境运行
```bash
npm run dev
```

#### 生产环境构建
```bash
npm run build
```

#### 生产环境预览
```bash
npm run preview
```

## 项目结构

```
src/
├── assets/          # 静态资源
├── components/      # 公共组件
├── config/         # 配置文件
├── router/         # 路由配置
├── services/       # API 服务
├── styles/         # 全局样式
├── utils/          # 工具函数
└── views/          # 页面组件
    ├── Home.vue    # 首页
    ├── Files.vue   # 网盘页面
    └── Monitor.vue # 监控页面
```

## 配置说明

### 环境配置
- 开发环境：`.env.development`
- 生产环境：`.env.preview`

### API 配置
- 默认 API：通过环境变量 `VITE_API_BASE_URL` 配置
- 超时时间：10000ms
- 请求头：JSON 格式

### 主题配置
- 主色调：`--primary-color`
- 次色调：`--secondary-color`
- 强调色：`--accent-color`
- 背景图在 App.vue 第 40 行进行改动

## 使用说明

### 开发环境
1. 克隆项目
2. 安装依赖：`npm install`
3. 启动开发服务器：`npm run dev`

### 生产环境
1. 构建项目：`npm run build`
2. 预览构建结果：`npm run preview`

### 清理构建
```bash
# 清除构建信息
rm -rf dist
rm -rf node_modules/.vite

# 重新构建
npm run build
```

### 网盘使用
1. 点击首页的网盘入口或导航到 `/files` 路径
2. 点击"上传文件"按钮选择要上传的文件
3. 文件上传后可以在列表中查看、下载或删除

### 系统监控
1. 导航到 `/monitor` 路径
2. 查看 CPU 和内存使用率的实时图表
3. 切换时间显示模式（NTP/本地）

### 热搜榜单
1. 在首页的热搜卡片中切换平台（bilibili/微博）
2. 点击热搜条目可在新标签页打开对应链接

## 开发指南

### 代码规范
- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 遵循 Vue 3 组合式 API 风格指南

### 组件开发
- 使用 `<script setup>` 语法
- 使用 `defineProps` 和 `defineEmits` 定义属性和事件
- 使用 `ref` 和 `computed` 管理响应式数据

### 样式开发
- 使用 SCSS 预处理器
- 遵循 BEM 命名规范
- 使用 CSS 变量实现主题切换