const mongoose = require("mongoose");
const iconv = require('iconv-lite');

// 定义文件Schema
const FileSchema = new mongoose.Schema({
  // 文件名
  filename: {
    type: String,
    required: [true, "文件名是必需的"],
    trim: true,
  },
  // 原始文件名
  originalname: {
    type: String,
    required: [true, "原始文件名是必需的"],
    trim: true,
  },
  // 文件存储路径
  path: {
    type: String,
    required: [true, "文件路径是必需的"],
    trim: true,
  },
  // 文件大小（字节）
  size: {
    type: Number,
    required: [true, "文件大小是必需的"],
    min: [0, "文件大小不能为负数"],
  },
  // 文件类型
  mimetype: {
    type: String,
    required: [true, "文件类型是必需的"],
  },
  // 创建时间
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // 更新时间
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  // 小说信息
  novelInfo: {
    type: Object,
    default: null,
  },
});

// 更新时间中间件
FileSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// 创建并导出File模型
module.exports = mongoose.model("File", FileSchema);
