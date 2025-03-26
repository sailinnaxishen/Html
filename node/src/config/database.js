const mongoose = require("mongoose");
const config = require("./index");

const connectDB = async () => {
  try {
    await mongoose.connect(config.database.uri, config.database.options);
    console.log("MongoDB 连接成功");

    // 监听连接错误
    mongoose.connection.on('error', err => {
      console.error('MongoDB 连接错误:', err);
    });

    // 监听连接断开
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB 连接断开，尝试重新连接...');
      setTimeout(connectDB, 5000);
    });

  } catch (error) {
    console.error("MongoDB 连接失败:", error);
    // 5秒后重试
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
