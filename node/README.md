# Node.js 后端服务

这是一个基于 Node.js + Express + MongoDB 的后端服务项目，提供文件管理、时间同步、系统监控、热搜数据和用户认证等功能。

## **功能列表**

### **1. 文件管理**
- **文件上传**：支持单文件上传，支持断点续传（分片上传、合并分片）。
- **文件下载**：支持通过文件 ID 下载文件。
- **文件删除**：支持删除文件（同时删除物理文件和数据库记录）。
- **文件搜索**：支持按文件名模糊搜索（支持中文）。
- **文件列表**：支持按用户或公共区查询文件列表。
- **文件查重**：通过 MD5 校验避免重复上传。

### **2. 时间服务**
- **NTP 时间同步**：从多个 NTP 服务器获取精确时间。
- **本地时间校准**：根据 NTP 时间校准本地时间。

### **3. 系统监控**
- **CPU 使用率**：实时监控 CPU 负载和核心数。
- **内存使用率**：监控总内存、空闲内存和已用内存。
- **系统运行时间**：获取系统启动后的运行时间。

### **4. 热搜数据**
- **平台支持**：支持微博和 B 站热搜数据。
- **数据查询**：按平台获取热搜列表。
- **数据保留**：支持配置数据保留天数。
- **测试数据**：支持插入测试数据。

### **5. 用户认证**
- **用户注册**：支持用户名和密码注册。
- **用户登录**：支持 JWT Token 认证。
- **用户信息**：获取当前登录用户信息。
- **密码修改**：支持用户修改密码。

### **6. 其他功能**
- **统一错误处理**：规范化错误响应格式。
- **跨域支持**：配置 CORS 允许的域名。
- **日志记录**：使用 `morgan` 记录请求日志。
- **文件编码检测**：自动检测文件编码（如 UTF-8、GBK 等）。

## **技术栈**
- **后端框架**：Node.js + Express
- **数据库**：MongoDB + Mongoose
- **文件上传**：Multer
- **时间同步**：NTP Client
- **系统监控**：OS Utils
- **编码转换**：iconv-lite + jschardet
- **API 文档**：内置 Swagger 风格的注释

## **项目结构**
```
src/
├── config/           # 配置文件
├── controllers/      # 控制器
├── middlewares/      # 中间件
├── models/           # 数据模型
├── routes/           # 路由
├── services/         # 业务逻辑
├── utils/            # 工具函数
└── app.js            # 应用入口
```

## **安装和运行**

### **方式一：Docker 部署（推荐）**
1. 确保已安装 Docker 和 Docker Compose。
2. 在项目根目录运行：
```bash
docker compose up -d
```

### **方式二：手动部署**
1. 安装依赖：
```bash
npm install
```

2. 配置环境变量：
创建 `.env` 文件并配置以下变量：
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://admin:123456@localhost:27017/hot_search_db
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
JWT_SECRET=your_jwt_secret
```

3. 启动服务：
```bash
npm start
```

## **API 文档**

### **文件管理**
| 方法 | 路径 | 描述 |
|------|------|------|
| `GET` | `/api/files` | 获取文件列表（支持按用户或公共区查询） |
| `POST` | `/api/files/upload` | 上传文件（支持断点续传） |
| `GET` | `/api/files/download/:id` | 下载文件 |
| `DELETE` | `/api/files/:id` | 删除文件 |
| `GET` | `/api/files/search` | 搜索文件（支持中文） |

### **时间服务**
| 方法 | 路径 | 描述 |
|------|------|------|
| `GET` | `/api/time/ntp` | 获取 NTP 时间 |
| `GET` | `/api/time/calibrated` | 获取校准后的本地时间 |

### **系统监控**
| 方法 | 路径 | 描述 |
|------|------|------|
| `GET` | `/api/monitor/system-stats` | 获取系统资源使用情况 |

### **热搜数据**
| 方法 | 路径 | 描述 |
|------|------|------|
| `GET` | `/api/hot-search/:platform` | 获取指定平台（微博/B 站）的热搜数据 |
| `POST` | `/api/hot-search/test/insert` | 插入测试数据 |

### **用户认证**
| 方法 | 路径 | 描述 |
|------|------|------|
| `POST` | `/api/auth/register` | 用户注册 |
| `POST` | `/api/auth/login` | 用户登录 |
| `GET` | `/api/auth/me` | 获取当前用户信息 |
| `POST` | `/api/auth/change-password` | 修改密码 |

## **配置说明**
配置文件位于 `src/config/index.js`，包含以下配置项：

### **服务器配置**
- `port`：服务器端口。
- `env`：运行环境（development/production）。
- `cors`：跨域配置。

### **数据库配置**
- `uri`：MongoDB 连接 URI。
- `options`：MongoDB 连接选项。

### **文件上传配置**
- `maxSize`：最大文件大小。
- `allowedTypes`：允许的文件类型。
- `uploadDir`：上传目录。

### **NTP 配置**
- `servers`：NTP 服务器列表。
- `timeout`：超时时间。

### **热搜配置**
- `platforms`：支持的平台（微博/B 站）。
- `bilibiliLimit`：B 站数据限制。
- `weiboLimit`：微博数据限制。
- `dataRetentionDays`：数据保留天数。

## **错误处理**
所有错误响应格式如下：
```json
{
  "code": 500,
  "message": "错误信息",
  "error": "详细错误信息（仅在开发环境）"
}
```

## **响应格式**
所有 API 响应都遵循统一的格式：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

## **注意事项**
1. 确保 MongoDB 服务已启动。
2. 文件上传目录会自动创建。
3. 生产环境部署时注意修改 CORS 配置。
4. 建议使用 PM2 进行进程管理。
5. 用户认证功能依赖 JWT，请妥善保管 `JWT_SECRET`。
6. 文件上传支持断点续传，确保客户端实现分片上传逻辑。
