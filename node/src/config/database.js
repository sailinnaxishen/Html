const mongoose = require("mongoose");
const config = require("./index");

const connectDB = async () => {
  try {
    console.log("正在连接 MongoDB...");
    console.log("MongoDB URI:", config.database.uri);

    await mongoose.connect(config.database.uri, config.database.options);

    // 测试连接
    await mongoose.connection.db.admin().ping();

    console.log("MongoDB 连接成功");

    // 监听连接错误
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB 连接错误:", err);
    });

    // 监听连接断开
    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB 连接断开，尝试重新连接...");
      connectDB();
    });
  } catch (error) {
    console.error("MongoDB 连接失败:", error);
    // 等待 5 秒后重试
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
