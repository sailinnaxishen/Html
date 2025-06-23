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
      allowedOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [ 
        'http://localhost:41737',
        'http://localhost:3000',
        'http://0.0.0.0:41737',
        'http://0.0.0.0:3000',
        'http://192.168.115.64:41737' 
      ],
      // 允许的方法 - 添加OPTIONS方法
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
    uri: process.env.MONGODB_URI,
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
    uploadDir: process.env.UPLOAD_DIR,
    maxSize: 1024 * 1024 * 1024 * 10, // 10GB
    allowedTypes: ["*/*"],
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