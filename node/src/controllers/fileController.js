const File = require("../models/File");
const fs = require("fs").promises;
const path = require("path");

// 文件控制器类
class FileController {
  // 获取所有文件列表
  async getAllFiles(req, res) {
    try {
      const files = await File.find().sort({ createdAt: -1 });
      res.json({
        code: 200,
        data: files,
      });
    } catch (error) {
      console.error("获取文件列表失败:", error);
      res.status(500).json({
        code: 500,
        message: "获取文件列表失败",
      });
    }
  }

  // 上传文件
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          code: 400,
          message: "没有文件被上传",
        });
      }

      const file = new File({
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });

      await file.save();
      res.status(201).json({
        code: 201,
        data: file,
      });
    } catch (error) {
      console.error("文件上传失败:", error);
      res.status(500).json({
        code: 500,
        message: "文件上传失败",
      });
    }
  }

  // 下载文件
  async downloadFile(req, res) {
    try {
      const file = await File.findById(req.params.id);
      if (!file) {
        return res.status(404).json({
          code: 404,
          message: "文件不存在",
        });
      }

      const filePath = path.join(__dirname, "..", "..", file.path);
      res.download(filePath, file.originalname);
    } catch (error) {
      console.error("文件下载失败:", error);
      res.status(500).json({
        code: 500,
        message: "文件下载失败",
      });
    }
  }

  // 删除文件
  async deleteFile(req, res) {
    try {
      const file = await File.findById(req.params.id);
      if (!file) {
        return res.status(404).json({
          code: 404,
          message: "文件不存在",
        });
      }

      // 删除物理文件
      await fs.unlink(path.join(__dirname, "..", "..", file.path));

      // 删除数据库记录
      await File.deleteOne({ _id: req.params.id });

      res.json({
        code: 200,
        message: "文件删除成功",
      });
    } catch (error) {
      console.error("文件删除失败:", error);
      res.status(500).json({
        code: 500,
        message: "文件删除失败",
      });
    }
  }
}

module.exports = new FileController();
