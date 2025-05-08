require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const fileRoutes = require("./routes/fileRoutes");
const timeRoutes = require("./routes/timeRoutes");
const monitorRoutes = require("./routes/monitor");
const hotSearchRoutes = require("./routes/hotSearchRoutes");
const errorHandler = require("./middlewares/errorHandler");
const config = require("./config");
const connectDB = require("./config/database");

// 创建Express应用
const app = express();

// 确保上传目录存在
const uploadDir = path.isAbsolute(config.upload.uploadDir)
  ? config.upload.uploadDir
  : path.join(__dirname, "../../", config.upload.uploadDir || "uploads");
console.log("fileRoutes.js uploadDir:", uploadDir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 连接MongoDB
connectDB();
// 中间件配置
app.use(cors(config.server.cors));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 静态文件服务（仅用于文件下载）
app.use("/uploads", express.static(uploadDir));
// API路由
app.use("/api/files", fileRoutes);
app.use("/api/time", timeRoutes);
app.use("/api/monitor", monitorRoutes);
app.use("/api/hot-search", hotSearchRoutes);
// 错误处理中间件
app.use(errorHandler);
const PORT = config.server.port;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`服务器运行在 http://0.0.0.0:${PORT}`);
});
module.exports = app;