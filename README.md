# 全栈项目

这是一个使用 Node.js 作为后端、Vue.js 作为前端的全栈项目。

## 项目结构

```
-Html/
├── docker-compose.yml    # Docker 编排配置
├── mongo-init.js        # MongoDB 初始化脚本
├── node/               # Node.js 后端项目
│   ├── Dockerfile     # 后端 Docker 配置
│   └──|src/
│      ├── config/          # 配置文件
│      ├── controllers/     # 控制器
│      ├── middlewares/     # 中间件
│      ├── models/          # 数据模型
│      ├── routes/          # 路由
│      ├── services/        # 业务逻辑
│      ├── utils/           # 工具函数
│      └── app.js           # 应用入口
└── vue/                # Vue.js 前端项目
    ├── Dockerfile     # 前端 Docker 配置
    └──src/
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

## 技术栈

### 后端
- Node.js
- Express.js
- MongoDB (Docker)
- Mongoose

### 前端
- Vue.js
- Vite
- Element Plus
- Axios

## 部署方式

### 方式一：Docker 部署（推荐）

使用 Docker Compose 一键部署整个项目：

1. 确保已安装 Docker 和 Docker Compose
2. 在项目根目录下运行：
 docker compose down -v #暂停容器并删除缓存
 docker compose up --build -d #构建容器
```bash
# 查看 MongoDB 日志
docker logs html-mongodb-1

# 查看后端日志
docker logs html-backend-1

# 查看前端日志
docker logs html-frontend-1

```

服务访问地址：
- 前端：http://localhost:41737
- 后端：http://localhost:3000
- MongoDB：localhost:27018

### 方式二：手动部署

#### 数据库配置
项目使用 MongoDB 作为数据库，通过 Docker 运行：
```bash
docker run -d \
--name mongodb \
-p 27017:27017 \
-v mongodb_data:/data/db \
-e MONGO_INITDB_ROOT_USERNAME=admin \
-e MONGO_INITDB_ROOT_PASSWORD=123456 \ 
--restart unless-stopped \
mongo:4.4
```

创建用户：
```bash
docker exec -it mongodb mongo -u admin -p 123456 --eval '
db.getSiblingDB("hot_search_db").createUser({
  user: "hot_user",
  pwd: "hot_password",
  roles: [{role: "readWrite", db: "hot_search_db"}]
})'
```

数据库连接信息：
- 主机：localhost
- 端口：27017
- 用户名：admin
- 密码：123456
- 数据库名：hot_search_db

#### 后端启动

1. 进入后端目录：
```bash
cd node
```

2. 安装依赖：
```bash
npm install
```

3. 启动服务：
```bash
npm start
```

#### 前端启动

1. 进入前端目录：
```bash
cd vue
```

2. 安装依赖：
```bash
npm install
```

3. 启动vue服务器：
```bash
npm run preview
```

## 环境变量配置

### 后端环境变量 (.env)
```
# 服务器配置
PORT=3000
NODE_ENV=development

# CORS配置
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000,http://192.168.92.64:5173,http://192.168.92.64:3001

# 数据库配置
MONGODB_URI=mongodb://hot_user:hot_password@localhost:27017/hot_search_db?authSource=hot_search_db&authMechanism=SCRAM-SHA-1&directConnection=true&connectTimeoutMS=3000

# 文件上传配置
UPLOAD_DIR=uploads
```

### 前端环境变量 (.env)
```
VITE_API_URL=VITE_API_BASE_URL
```

## 开发指南

1. 确保已安装 Node.js 和 Docker
2. 选择部署方式（Docker 或手动部署）
3. 按照对应方式的步骤进行部署
4. 访问 http://localhost:41737 查看前端页面

## 注意事项

- 确保 MongoDB 容器正常运行
- 检查环境变量配置是否正确
- 确保端口未被占用
- Docker 部署时，MongoDB 端口映射为 27018
- 上传的文件会持久化存储在 Docker volume 中
- 修改vue项目的文件后请清除vite构建缓存重新构建再运行dovker的构建