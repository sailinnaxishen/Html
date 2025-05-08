const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const File = require("../models/File");
const config = require("../config");
const axios = require("axios");
const iconv = require('iconv-lite');
const jschardet = require('jschardet'); // 需要安装

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = config.upload.uploadDir && path.isAbsolute(config.upload.uploadDir || "uploads")
      ? config.upload.uploadDir
      : path.join(__dirname, "../../", config.upload.uploadDir);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: config.upload.maxSize
  }
});

// ========== 断点续传相关接口 ==========
const baseUploadDir = path.isAbsolute(config.upload.uploadDir)
  ? config.upload.uploadDir
  : path.join(__dirname, '../../', config.upload.uploadDir);
const chunkUploadDir = path.join(baseUploadDir, 'chunks');
const finalUploadDir = baseUploadDir;
const chunkMulter = multer({ dest: chunkUploadDir });

// 获取文件列表
router.get("/", async (req, res) => {
  try {
    const files = await File.find().sort({ createdAt: -1 });
    res.json({
      code: 200,
      message: "获取文件列表成功",
      data: files,
    });
  } catch (error) {
    console.error("获取文件列表失败:", error);
    res.status(500).json({
      code: 500,
      message: "获取文件列表失败",
      error: error.message,
    });
  }
});

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: "没有文件被上传",
      });
    }

    let novelInfo = null;
    if (req.file.mimetype === "text/plain") {
      try {
        // 读取原始 buffer
        const buffer = await fs.promises.readFile(req.file.path);
        // 检测编码
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
          novelInfo = JSON.parse(match[0]);
        }
      } catch (err) {
        console.error("deepseek解析失败:", err);
      }
    }

    const file = new File({
      filename: req.file.filename,
      originalname: Buffer.from(req.file.originalname, 'latin1').toString('utf8'),
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      novelInfo,
    });

    await file.save();
    res.status(201).json({
      code: 201,
      message: "文件上传成功",
      data: file,
    });
  } catch (error) {
    console.error("文件上传失败:", error);
    res.status(500).json({
      code: 500,
      message: "文件上传失败",
      error: error.message,
    });
  }
});

// 下载文件
router.get("/download/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({
        code: 404,
        message: "文件不存在",
      });
    }

    if (!fs.existsSync(file.path)) {
      return res.status(404).json({
        code: 404,
        message: "文件不存在",
      });
    }

    res.download(file.path, file.originalname);
  } catch (error) {
    console.error("文件下载失败:", error);
    res.status(500).json({
      code: 500,
      message: "文件下载失败",
      error: error.message,
    });
  }
});

// 删除文件
router.delete("/:id", async (req, res) => {
  try {
    console.log("尝试删除文件:", req.params.id);

    const file = await File.findById(req.params.id);
    if (!file) {
      console.log("文件不存在:", req.params.id);
      return res.status(404).json({
        code: 404,
        message: "文件不存在",
        data: {
          id: req.params.id,
          status: "未找到",
        },
      });
    }

    console.log("找到文件:", file);

    // 检查文件是否存在
    if (fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
        console.log("物理文件删除成功:", file.path);
      } catch (fsError) {
        console.error("物理文件删除失败:", fsError);
        // 即使物理文件删除失败，也继续删除数据库记录
      }
    } else {
      console.log("物理文件不存在:", file.path);
    }

    // 删除数据库记录
    await file.deleteOne();
    console.log("数据库记录删除成功");

    res.json({
      code: 200,
      message: "文件删除成功",
      data: {
        id: req.params.id,
        filename: file.filename,
        status: "已删除",
      },
    });
  } catch (error) {
    console.error("文件删除失败:", error);
    res.status(500).json({
      code: 500,
      message: "文件删除失败",
      error: error.message,
      data: {
        id: req.params.id,
        status: "删除失败",
      },
    });
  }
});

// 搜索文件
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        code: 400,
        message: "缺少搜索关键词"
      });
    }
    // 这里直接用 $regex，MongoDB 支持中文
    const files = await File.find({
      originalname: { $regex: q, $options: "i" }
    }).sort({ createdAt: -1 });
    res.json({
      code: 200,
      message: "搜索成功",
      data: files
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "搜索失败",
      error: error.message
    });
  }
});

// 上传分片
router.post('/upload-chunk', chunkMulter.single('chunk'), async (req, res) => {
  const { fileHash, chunkIndex } = req.body;
  if (!fileHash || chunkIndex === undefined) {
    return res.status(400).json({ code: 400, message: '缺少fileHash或chunkIndex' });
  }
  const chunkDir = path.join(chunkUploadDir, fileHash);
  if (!fs.existsSync(chunkDir)) fs.mkdirSync(chunkDir, { recursive: true });
  const chunkPath = path.join(chunkDir, chunkIndex);
  try {
    await fs.promises.rename(req.file.path, chunkPath);
    res.json({ code: 200, message: '分片上传成功', chunkIndex });
  } catch (err) {
    res.status(500).json({ code: 500, message: '分片保存失败', error: err.message });
  }
});

// 查询已上传分片
router.get('/uploaded-chunks', async (req, res) => {
  const { fileHash } = req.query;
  if (!fileHash) return res.status(400).json({ code: 400, message: '缺少fileHash' });
  const chunkDir = path.join(chunkUploadDir, fileHash);
  let uploaded = [];
  if (fs.existsSync(chunkDir)) {
    uploaded = fs.readdirSync(chunkDir).filter(f => !isNaN(Number(f)));
  }
  res.json({ code: 200, uploaded: uploaded.map(Number) });
});

// 合并分片
router.post('/merge-chunks', async (req, res) => {
  const { fileHash, totalChunks, originalname, mimetype, size } = req.body;
  if (!fileHash || !totalChunks || !originalname) {
    return res.status(400).json({ code: 400, message: '缺少参数' });
  }
  // 查重：如已存在相同md5文件，直接返回
  const exist = await File.findOne({ md5: fileHash });
  if (exist) {
    return res.json({ code: 200, message: '文件已存在', data: exist });
  }
  const chunkDir = path.join(chunkUploadDir, fileHash);
  const finalPath = path.join(finalUploadDir, `${Date.now()}-${originalname}`);
  try {
    const writeStream = fs.createWriteStream(finalPath);
    let i = 0;
    function pipeNext() {
      if (i >= totalChunks) {
        writeStream.end();
        return;
      }
      const chunkPath = path.join(chunkDir, String(i));
      if (!fs.existsSync(chunkPath)) {
        writeStream.destroy();
        return res.status(400).json({ code: 400, message: `缺少分片${i}` });
      }
      const readStream = fs.createReadStream(chunkPath);
      readStream.pipe(writeStream, { end: false });
      readStream.on('end', () => {
        i++;
        pipeNext();
      });
      readStream.on('error', (err) => {
        writeStream.destroy();
        return res.status(500).json({ code: 500, message: '读取分片失败', error: err.message });
      });
    }
    writeStream.on('finish', async () => {
      // 清理分片
      fs.rmSync(chunkDir, { recursive: true, force: true });
      // 存入数据库
      const file = new File({
        filename: path.basename(finalPath),
        originalname,
        mimetype,
        size,
        path: finalPath,
        novelInfo: null,
        md5: fileHash,
      });
      await file.save();
      res.json({ code: 201, message: '文件合并成功', data: file });
    });
    writeStream.on('error', (err) => {
      return res.status(500).json({ code: 500, message: '写入失败', error: err.message });
    });
    pipeNext();
  } catch (err) {
    res.status(500).json({ code: 500, message: '合并失败', error: err.message });
  }
});

// 查询md5是否已存在
router.get('/check-md5', async (req, res) => {
  const { md5 } = req.query;
  if (!md5) return res.status(400).json({ code: 400, message: '缺少md5' });
  const exist = await File.findOne({ md5 });
  if (exist) {
    return res.json({ code: 200, exists: true, data: exist });
  }
  res.json({ code: 200, exists: false });
});

console.log("config.upload.uploadDir:", config.upload.uploadDir);

module.exports = router;
