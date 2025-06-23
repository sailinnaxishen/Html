const File = require("../models/File");
const fs = require("fs").promises;
const path = require("path");
const axios = require("axios");
const iconv = require('iconv-lite');
const jschardet = require('jschardet');

// 文件控制器类
class FileController {
  // 获取所有文件列表
  async getAllFiles(req, res) {
    try {
      const { ownerType = 'public' } = req.query;
      let query = { ownerType };
      if (ownerType === 'user') {
        if (!req.user) {
          return res.status(401).json({ code: 401, message: '未认证' });
        }
        query.ownerId = req.user._id;
      }
      const files = await File.find(query).sort({ createdAt: -1 });
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

  // 提取小说关键信息
  async extractNovelInfo(filePath) {
    try {
      const buffer = await fs.readFile(filePath);
      const detected = jschardet.detect(buffer);
      let content;
      if (detected.encoding && detected.encoding.toLowerCase() !== 'utf-8') {
        content = iconv.decode(buffer, detected.encoding);
      } else {
        content = buffer.toString('utf-8');
      }
      content = content.substring(0, 9000);
      const prompt = `帮我看一下这本小说写了什么，以以下格式提供:'''json{"name":"小说名字","author":"作者名字","P1":"主角1","P2":"主角2","tag":"小说的标签eg：abo、futa、扶她、姐妹、主受视角、主攻视角","about":"简介"'''}\n\n${content}`;
      const response = await axios.post(
        "https://api.deepseek.com/v1/chat/completions",
        {
          model: "deepseek-chat",
          messages: [{ role: "user", content: prompt }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer sk-c53a884c47b842f58a2068c2e37bf679",
          },
          timeout: 60000,
        }
      );
      const text = response.data.choices[0].message.content;
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch (err) {
      console.error("deepseek解析失败:", err);
    }
    return null;
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
      const { ownerType = 'public' } = req.body;
      let ownerId = null;
      if (ownerType === 'user') {
        if (!req.user) {
          return res.status(401).json({ code: 401, message: '未认证' });
        }
        ownerId = req.user._id;
      }
      let novelInfo = null;
      if (req.file.mimetype === "text/plain") {
        novelInfo = await this.extractNovelInfo(req.file.path);
      }
      const file = new File({
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
        ownerType,
        ownerId,
        novelInfo
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
