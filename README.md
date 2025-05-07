# 个人主页系统

一个基于 Vue 3 + Node.js + MongoDB 的现代化个人主页系统，提供文件管理、系统监控、热搜数据等功能。

## 项目结构

```
.
├── node/           # Node.js 后端服务
├── vue/            # Vue 3 前端应用
├── docker-compose.yml  # Docker 编排配置
└── mongo-init.js   # MongoDB 初始化脚本
```

## 功能特点

- 文件管理系统
- 实时系统监控
- 热搜数据展示
- 时间同步服务
- 响应式设计
- 暗黑主题支持

## 快速开始

### 环境要求

- Docker >= 20.10.0
- Docker Compose >= 2.0.0

### Docker 部署

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

请参考各子目录的 README.md 文件：
- [前端部署说明](vue/README.md)
- [后端部署说明](node/README.md)

## 开发说明

### 目录说明

- `node/`: Node.js 后端服务，提供 API 接口
- `vue/`: Vue 3 前端应用，提供用户界面
- `mongo-init.js`: MongoDB 数据库初始化脚本

### 环境变量

主要环境变量配置：
- `VITE_API_BASE_URL`: 前端 API 地址
- `MONGODB_URI`: MongoDB 连接地址
- `PORT`: 后端服务端口
- `CORS_ORIGINS`: 允许跨域的域名

### 开发流程

1. 启动后端服务
```bash
cd node
npm install
npm run dev
```

2. 启动前端服务
```bash
cd vue
npm install
npm run dev
```

## 部署说明

### Docker 部署

使用 Docker Compose 可以一键部署整个系统：

```bash
docker compose up -d
```

这将启动：
- 前端服务（端口：41737）
- 后端服务（端口：3000）
- MongoDB 数据库（端口：27018）
- 热搜数据采集服务

### 手动部署

1. 部署后端
```bash
cd node
npm install
npm run build
npm start
```

2. 部署前端
```bash
cd vue
npm install
npm run build
npm run preview
```

## 维护说明

### 日志查看

```bash
# 查看所有服务日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f mongodb
```

### 服务重启

```bash
# 重启所有服务
docker compose restart

# 重启特定服务
docker compose restart frontend
docker compose restart backend
```

### 数据备份

MongoDB 数据存储在 Docker volume 中，可以通过以下命令备份：

```bash
# 备份 MongoDB 数据
docker compose exec mongodb mongodump --out /backup
```

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License