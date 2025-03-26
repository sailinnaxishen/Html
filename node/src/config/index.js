require("dotenv").config();

module.exports = {
  // 服务器配置
  server: {
    // 服务器端口
    port: process.env.PORT || 3000,
    // 服务器环境
    env: process.env.NODE_ENV || "development",
    // 跨域配置
    cors: {
      // 允许的源
      allowedOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'],
      // 允许的方法
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
      // 允许的头部
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      // 暴露的头部
      exposedHeaders: ['Content-Disposition', 'Content-Type'],
      // 是否允许发送凭证
      credentials: true
    }
  },

  // 数据库配置
  database: {
    uri: process.env.MONGODB_URI || "mongodb://hot_user:hot_password@mongodb:27017/hot_search_db?authSource=hot_search_db&authMechanism=SCRAM-SHA-1",
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      w: 'majority'
    }
  },

  // 文件上传配置
  upload: {
    maxSize: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024, // 默认10MB
    allowedTypes: ["*/*"],
    uploadDir: process.env.UPLOAD_DIR || "uploads",
  },

  // NTP配置
  ntp: {
    servers: ["pool.ntp.org", "time.google.com", "time.windows.com", "time.apple.com"],
    timeout: 5000,
  },

  // 热搜配置
  hotSearch: {
    platforms: ['bilibili', 'weibo'],
    bilibiliLimit: 10,
    weiboLimit: 52,
    dataRetentionDays: 1
  }
};
