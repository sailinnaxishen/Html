# Node.js 后端服务

这是一个基于 Node.js + Express + MongoDB 的后端服务，提供文件管理、时间同步、系统监控、热搜数据和用户认证等 API。

---

## 🚀 功能简介

### 1. 文件管理
- 支持单文件和分片上传，MD5 查重
- 按 ID 下载文件
- 删除文件及数据库记录
- 按文件名模糊搜索（支持中文）
- 按用户或公共区查询文件列表

### 2. 时间服务
- NTP 网络时间同步
- 本地时间校准

### 3. 系统监控
- 实时监控 CPU、内存
- 获取系统运行时间

### 4. 热搜数据
- 支持微博、B 站热搜
- 数据保留天数可配置

### 5. 用户认证
- 用户注册、登录（JWT）
- 获取当前用户信息
- 修改密码

### 6. 其他
- 统一错误处理
- 跨域支持
- 请求日志
- 文件编码检测

---

## 🗂️ 项目结构
```
src/
├── config/         # 配置文件
├── controllers/    # 控制器（业务处理）
├── middlewares/    # 中间件（如认证、错误处理）
├── models/         # 数据模型（如用户、文件）
├── routes/         # 路由定义
├── services/       # 业务逻辑层
├── utils/          # 工具函数
└── app.js          # 应用入口
```

---

## ⚡ 快速开始

### Docker 部署（推荐）
```bash
docker compose up -d
```

### 手动部署
```bash
npm install
# 配置 .env 文件（见下方示例）
npm start
```

#### .env 文件示例
```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://admin:123456@localhost:27017/hot_search_db
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
JWT_SECRET=your_jwt_secret
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
|------|-----------------------|----------------|
| GET  | /api/files            | 文件列表       |
| POST | /api/files/upload     | 上传文件       |
| GET  | /api/files/download/:id | 下载文件    |
| DELETE | /api/files/:id      | 删除文件       |
| GET  | /api/files/search     | 搜索文件       |

### 时间服务
| 方法 | 路径 | 说明 |
|------|-----------------------|----------------|
| GET  | /api/time/ntp         | 获取 NTP 时间  |
| GET  | /api/time/calibrated  | 获取校准时间   |

### 系统监控
| 方法 | 路径 | 说明 |
|------|-----------------------|----------------|
| GET  | /api/monitor/system-stats | 系统资源情况 |

### 热搜数据
| 方法 | 路径 | 说明 |
|------|-----------------------|----------------|
| GET  | /api/hot-search/:platform | 获取热搜   |
| POST | /api/hot-search/test/insert | 插入测试数据 |

---

## 🛡️ 认证流程
1. 注册账号 `/api/auth/register`（用户名、密码）
2. 登录 `/api/auth/login`（返回 JWT）
3. 后续请求需在 Header 中携带 `Authorization: Bearer <token>`

---

## �� 路由设计
- 所有接口以 `/api/` 开头
- 认证相关接口：`/api/auth/*`
- 文件相关接口：`/api/files/*`
- 采用控制器和中间件模块化设计，便于扩展维护

---

## 🧑‍💻 错误与响应格式
所有错误响应：
```json
{
  "code": 500,
  "message": "错误信息",
  "error": "详细错误（仅开发环境）"
}
```

成功响应：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

---

## 📝 开发建议
- 确保 MongoDB 服务已启动
- 上传目录自动创建
- 生产环境注意 CORS 和 JWT 密钥安全
- 推荐使用 PM2 管理进程
- 支持分片上传，需前端配合实现

---

## 📬 联系与贡献
- 欢迎提 Issue 和 PR
- 有问题请联系维护者
