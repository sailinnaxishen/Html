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
const auth = require('../middlewares/auth');

// 配置文件上传（动态目录）
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    let baseDir = config.upload.uploadDir || 'uploads';
    let targetDir = baseDir;
    if (req.body.ownerType === 'public') {
      targetDir = path.join(baseDir, 'public');
    } else if (req.body.ownerType === 'user' && req.user) {
      targetDir = path.join(baseDir, req.user._id.toString());
    }
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
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
router.get("/", async (req, res, next) => {
  const { ownerType } = req.query;
  if (ownerType === 'user') {
    return auth(req, res, () => require('../controllers/fileController').getAllFiles(req, res));
  } else {
    return require('../controllers/fileController').getAllFiles(req, res);
  }
});

router.post("/upload", upload.single("file"), async (req, res, next) => {
  const { ownerType } = req.body;
  if (ownerType === 'user') {
    return auth(req, res, () => require('../controllers/fileController').uploadFile(req, res));
  } else {
    return require('../controllers/fileController').uploadFile(req, res);
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
  const { fileHash, totalChunks, originalname, mimetype, size, ownerType = 'public' } = req.body;
  if (!fileHash || !totalChunks || !originalname) {
    return res.status(400).json({ code: 400, message: '缺少参数' });
  }
  let baseDir = config.upload.uploadDir || 'uploads';
  let targetDir = baseDir;
  let ownerId = null;
  if (ownerType === 'public') {
    targetDir = path.join(baseDir, 'public');
  } else if (ownerType === 'user') {
    // 校验token
    await new Promise((resolve) => auth(req, res, resolve));
    if (!req.user) {
      return res.status(401).json({ code: 401, message: '未认证' });
    }
    ownerId = req.user._id;
    targetDir = path.join(baseDir, ownerId.toString());
  }
  // 查重：如公共区已存在同MD5文件，且本次上传目标是公共区，则拒绝
  const publicExist = await File.findOne({ md5: fileHash, ownerType: 'public' });
  if (ownerType === 'public' && publicExist) {
    return res.status(409).json({ code: 409, message: '公共区已存在该文件' });
  }
  if (ownerType === 'user' && ownerId) {
    const userExist = await File.findOne({ md5: fileHash, ownerType: 'user', ownerId });
    if (userExist) {
      return res.status(409).json({ code: 409, message: '用户区已存在该文件' });
    }
  }
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const chunkDir = path.join(chunkUploadDir, fileHash);
  const finalPath = path.join(targetDir, `${Date.now()}-${originalname}`);
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
        ownerType,
        ownerId,
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
  const { md5, ownerType, userId } = req.query;
  if (!md5) return res.status(400).json({ code: 400, message: '缺少md5' });
  let query = { md5 };
  if (ownerType === 'public') {
    query.ownerType = 'public';
  } else if (ownerType === 'user' && userId) {
    query.ownerType = 'user';
    query.ownerId = userId;
  }
  const exist = await File.findOne(query);
  if (exist) {
    return res.json({ code: 200, exists: true, data: exist });
  }
  res.json({ code: 200, exists: false });
});

// 取消上传，删除分片
router.post('/cancel-upload', async (req, res) => {
  const { fileHash } = req.body;
  if (!fileHash) {
    return res.status(400).json({ code: 400, message: '缺少fileHash' });
  }
  const chunkDir = path.join(chunkUploadDir, fileHash);
  try {
    if (fs.existsSync(chunkDir)) {
      fs.rmSync(chunkDir, { recursive: true, force: true });
    }
    res.json({ code: 200, message: '分片已清理' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '清理失败', error: err.message });
  }
});

console.log("config.upload.uploadDir:", config.upload.uploadDir);

module.exports = router;
