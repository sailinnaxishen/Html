# Node.js 后端服务

这是一个基于 Node.js + Express + MongoDB 的后端服务项目，提供文件管理、时间同步、系统监控和热搜数据等功能。

## 功能特性

- 文件上传下载管理
- NTP 时间同步服务
- 系统资源监控
- 热搜数据管理（支持微博和 B 站）
- 统一的错误处理
- 规范的 API 响应格式

## 技术栈

- Node.js
- Express
- MongoDB
- Mongoose
- Multer (文件上传)
- NTP Client (时间同步)
- OS Utils (系统监控)
- Python (热搜数据采集)

## 项目结构

```
src/
├── config/           # 配置文件
├── controllers/      # 控制器
├── middlewares/     # 中间件
├── models/          # 数据模型
├── routes/          # 路由
├── services/        # 业务逻辑
├── utils/           # 工具函数
└── app.js           # 应用入口
```

## 安装和运行

### 方式一：Docker 部署（推荐）

1. 确保已安装 Docker 和 Docker Compose
2. 在项目根目录运行：
```bash
docker compose up -d
```

### 方式二：手动部署

1. 安装依赖
```bash
npm install
```

2. 配置环境变量
创建 `.env` 文件并配置以下变量：
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://admin:123456@localhost:27017/hot_search_db
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

3. 安装 Python 依赖
```bash
sudo apt-get update && sudo apt-get install -y python3-pip python3-venv
cd node && python3 -m venv venv
source venv/bin/activate
pip install requests pymongo python-dotenv
```

4. 初始化数据库
```bash
python3 init_db.py
```

5. 启动服务
```bash
# 启动热搜采集脚本
python3 hot_search.py

# 启动 Node.js 服务器
npm start
```

## API 文档

### 文件管理

- GET /api/files - 获取文件列表
- POST /api/files/upload - 上传文件
- GET /api/files/download/:id - 下载文件
- DELETE /api/files/:id - 删除文件

### 时间服务

- GET /api/time/ntp - 获取 NTP 时间
- GET /api/time/calibrated - 获取校准后的本地时间

### 系统监控

- GET /api/monitor/system-stats - 获取系统资源使用情况

### 热搜数据

- GET /api/hot-search/:platform - 获取指定平台的热搜数据
- POST /api/hot-search/test/insert - 插入测试数据

## 配置说明

配置文件位于 `src/config/index.js`，包含以下配置项：

### 服务器配置

- port: 服务器端口
- env: 运行环境
- cors: 跨域配置

### 数据库配置

- uri: MongoDB 连接 URI
- options: MongoDB 连接选项

### 文件上传配置

- maxSize: 最大文件大小
- allowedTypes: 允许的文件类型
- uploadDir: 上传目录

### NTP 配置

- servers: NTP 服务器列表
- timeout: 超时时间

### 热搜配置

- platforms: 支持的平台
- bilibiliLimit: B 站数据限制
- weiboLimit: 微博数据限制
- dataRetentionDays: 数据保留天数

## 错误处理

项目使用统一的错误处理中间件，所有错误响应格式如下：

```json
{
  "code": 500,
  "message": "错误信息",
  "error": "详细错误信息（仅在开发环境）"
}
```

## 响应格式

所有 API 响应都遵循统一的格式：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

## 注意事项

1. 确保 MongoDB 服务已启动
2. 文件上传目录会自动创建
3. 生产环境部署时注意修改 CORS 配置
4. 建议使用 PM2 进行进程管理
5. 热搜数据采集需要 Python 环境支持
