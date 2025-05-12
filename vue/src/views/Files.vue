<template>
  <div class="files-page">
    <header class="header">
      <div class="header-left">
        <el-button
          @click="router.push('/')"
          :icon="ArrowLeft"
          >返回</el-button
        >
        <h1>个人网盘</h1>
      </div>
      <div class="header-search">
        <el-input
          v-model="search"
          placeholder="搜索"
          clearable
          @keyup.enter="onSearch"
          @clear="onClearSearch"
          style="width: 260px; margin-right: 8px;"
        >
          <template #append>
            <el-button :icon="Search" @click="onSearch" />
          </template>
        </el-input>
      </div>
      <el-upload
        class="upload-btn"
        :http-request="customChunkUpload"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :before-upload="beforeUpload"
        :filter-multiple="true"
        multiple
        v-model:file-list="uploadFileList"
        :show-file-list="false"
        ref="uploadRef"
      >
        <el-button
          type="primary"
          :icon="Upload"
          >上传文件</el-button
        >
        <template #file-list>
          <transition-group name="fade-upload-list" tag="ul" class="el-upload-list el-upload-list--text custom-upload-list">
            <li v-for="(file, idx) in limitedUploadList" :key="file.uid" class="el-upload-list__item">
              <span class="el-upload-list__item-name">{{ file.name }}</span>
              <el-progress v-if="file.status === 'uploading'" :percentage="file.percentage" :status="file.percentage === 100 ? 'success' : ''" style="width: 100px; display: inline-block; margin-left: 8px;" />
              <el-button size="mini" type="danger" @click="removeUploadFile(file)">删除</el-button>
            </li>
          </transition-group>
        </template>
      </el-upload>
    </header>

    <main class="main-content">
      <el-table
        v-loading="loading"
        :data="displayFiles"
        style="width: 100%"
        :empty-text="loading ? '加载中...' : '暂无文件'"
        height="600px"
      >
        <el-table-column
          prop="filename"
          label="文件名"
        >
          <template #default="{ row }">
            <div class="file-name">
              <el-icon><Document /></el-icon>
              <el-tooltip
                v-if="row.mimetype === 'text/plain'"
                :content="row.novelInfo ? formatNovelInfo(row.novelInfo) : '此文件未获取信息'"
                raw-content
                placement="top"
                effect="dark"
              >
                <span style="cursor: pointer;">{{ row.originalname }}</span>
              </el-tooltip>
              <span v-else>{{ row.originalname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="size"
          label="大小"
          width="120"
        >
          <template #default="{ row }">
            {{ formatFileSize(row.size) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="mimetype"
          width="120"
        >
          <template #header>
            <el-popover
              placement="bottom"
              width="220"
              trigger="click"
              v-model:visible="typePopoverVisible"
            >
              <el-checkbox-group v-model="filteredType" @change="onTypeFilterChange">
                <el-checkbox v-for="item in typeFilters" :key="item.value" :value="item.value">
                  {{ item.text }}
                </el-checkbox>
              </el-checkbox-group>
              <template #reference>
                <span style="cursor:pointer; color:#409EFF;">类型 <el-icon style="vertical-align: middle;"><ArrowDown /></el-icon></span>
              </template>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column
          prop="createdAt"
          label="上传时间"
          width="180"
        >
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="150"
        >
          <template #default="{ row }">
            <el-button-group>
              <el-button
                type="primary"
                :icon="Download"
                @click="downloadFile(row)"
                size="small"
              />
              <el-button
                type="danger"
                :icon="Delete"
                @click="deleteFile(row)"
                size="small"
              />
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <el-progress v-if="uploadProgress > 0" :percentage="uploadProgress" :status="uploadProgress === 100 ? 'success' : ''" style="margin-top: 10px;" />
      <div v-if="uploadStatus" style="color: #409EFF; margin-bottom: 10px;">{{ uploadStatus }}</div>
    </main>
    <div v-if="uploadStage === 'md5' || uploadStage === 'upload'" class="global-upload-progress apple-upload-progress-bg" :style="{ background: themeBgColor }">
      <el-progress
        :percentage="uploadStage === 'md5' ? md5Progress : uploadProgress"
        :status="(uploadStage === 'md5' ? md5Progress : uploadProgress) === 100 ? 'success' : ''"
        show-text
        class="apple-progress"
        :stroke-width="10"
        style="width: 70%; min-width: 220px; position: relative;"
      >
        <template #default>
          <span v-if="uploadStage === 'md5'">正在计算MD5: {{ md5Progress }}%</span>
          <span v-else>上传进度: {{ uploadProgress }}%</span>
        </template>
      </el-progress>
      <div style="margin-left: 18px; display: flex; gap: 8px;">
        <el-button v-if="uploadStage === 'upload' && !isPaused" class="apple-upload-btn" size="small" @click="pauseUpload" :icon="VideoPause" circle />
        <el-button v-if="uploadStage === 'upload' && isPaused" class="apple-upload-btn" size="small" @click="resumeUpload" :icon="VideoPlay" circle />
        <el-button v-if="uploadStage !== 'idle'" class="apple-upload-btn" size="small" type="danger" @click="cancelUpload" :icon="Close" circle />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  ArrowLeft,
  Upload,
  Download,
  Delete,
  Document,
  Search,
  ArrowDown,
  VideoPause,
  VideoPlay,
  Close,
} from "@element-plus/icons-vue";
import axios from "axios";
import dayjs from "dayjs";
import { apiPaths, currentConfig } from "../config";
import SparkMD5 from "spark-md5";
import path from "path";
import fs from "fs";

const router = useRouter();
const loading = ref(false);
const files = ref([]);
const search = ref("");
let searchTimeout = null;

// 筛选选项
const typeFilters = [
  { text: "全部", value: "" },
  { text: "压缩包", value: "archive" },
  { text: "图片", value: "image/" },
  { text: "文本", value: "text/plain" },
  { text: "视频", value: "video/" },
  { text: "音频", value: "audio/" },
  { text: "文档", value: "application/msword" },
  { text: "可执行文件", value: "application/x-msdownload" },
  // 可根据实际类型补充
];
const archiveExts = ["zip", "rar", "7z", "tar", "gz", "bz2", "xz", "tar.gz", "tar.bz2", "tar.xz"];
// 当前筛选的类型
const filteredType = ref([""]); // 默认选中"全部"
const typePopoverVisible = ref(false);
const typeChecked = ref({});

const uploadProgress = ref(0);
const uploadStatus = ref("");
// 新增：MD5计算进度、暂停/取消状态
const md5Progress = ref(0);
const isPaused = ref(false);
const isCanceled = ref(false);
const uploadStage = ref('idle'); // 'md5' | 'upload' | 'done' | 'idle'

// 分片上传参数
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

const uploadFileList = ref([]);
const uploadRef = ref();

const limitedUploadList = computed(() => {
  // 只显示最新的2个
  return uploadFileList.value.slice(-2);
});

function removeUploadFile(file) {
  // 触发el-upload的删除
  uploadRef.value.handleRemove(file);
}

// 获取文件列表
const fetchFiles = async () => {
  loading.value = true;
  try {
    const response = await axios.get(
      `${currentConfig.baseURL}${apiPaths.files.list}`,
      {
        timeout: 5000,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data?.data) {
      // 关键修改：解码文件名
      files.value = response.data.data.map((file) => ({
        ...file,
        // 解码原始文件名（兼容双重编码情况）
        originalname: safeDecodeURI(file.originalname),
      }));
    }
  } catch (error) {
    ElMessage.error("获取文件列表失败");
    files.value = [];
  } finally {
    loading.value = false;
  }
};

// 新增安全解码函数
const safeDecodeURI = (str) => {
  try {
    // 先尝试解码（处理前端编码的情况）
    const decoded = decodeURIComponent(str);
    // 二次检查是否需要解码（处理部分编码的情况）
    return decoded.includes("%") ? decodeURIComponent(decoded) : decoded;
  } catch {
    // 解码失败时返回原始字符串
    return str;
  }
};

// 分片上传主流程
const customChunkUpload = async (options) => {
  uploadProgress.value = 0;
  uploadStatus.value = "";
  md5Progress.value = 0;
  isPaused.value = false;
  isCanceled.value = false;
  uploadStage.value = 'md5';
  const file = options.file;
  // 1. 计算hash，带进度
  const fileHash = await calcFileHash(file, (percent) => {
    md5Progress.value = percent;
  });
  if (isCanceled.value) {
    uploadStatus.value = "已取消";
    options.onError(new Error("用户取消上传"));
    uploadStage.value = 'idle';
    return;
  }
  md5Progress.value = 100;
  uploadStage.value = 'upload';
  // 1.5 秒传：上传前先查md5
  try {
    const { data } = await axios.get(`${currentConfig.baseURL}${apiPaths.files.checkMd5}`, { params: { md5: fileHash } });
    if (data.exists) {
      uploadProgress.value = 100;
      uploadStatus.value = "文件已存在，秒传成功";
      uploadStage.value = 'done';
      options.onSuccess({ code: 200, message: "文件已存在", data: data.data });
      fetchFiles();
      return;
    }
  } catch (err) {}
  // 2. 切片
  const chunks = sliceFile(file, CHUNK_SIZE);
  // 3. 查询已上传分片
  let uploadedChunks = [];
  try {
    const { data } = await axios.get(`${currentConfig.baseURL}${apiPaths.files.uploadedChunks}`, { params: { fileHash } });
    uploadedChunks = data.uploaded || [];
  } catch {}
  // 4. 逐片上传
  let uploaded = 0;
  for (let i = 0; i < chunks.length; i++) {
    if (isCanceled.value) {
      uploadStatus.value = "已取消";
      uploadStage.value = 'idle';
      options.onError(new Error("用户取消上传"));
      return;
    }
    while (isPaused.value) {
      await new Promise(resolve => setTimeout(resolve, 200));
      if (isCanceled.value) {
        uploadStatus.value = "已取消";
        uploadStage.value = 'idle';
        options.onError(new Error("用户取消上传"));
        return;
      }
    }
    if (uploadedChunks.includes(i)) {
      uploaded++;
      uploadProgress.value = Math.round((uploaded / chunks.length) * 100);
      continue;
    }
    const formData = new FormData();
    formData.append("chunk", chunks[i]);
    formData.append("fileHash", fileHash);
    formData.append("chunkIndex", i);
    try {
      await axios.post(`${currentConfig.baseURL}${apiPaths.files.uploadChunk}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      uploaded++;
      uploadProgress.value = Math.round((uploaded / chunks.length) * 100);
    } catch (err) {
      uploadStatus.value = `第${i + 1}片上传失败`;
      uploadStage.value = 'idle';
      options.onError(err);
      return;
    }
  }
  // 5. 合并分片
  try {
    const mergeRes = await axios.post(`${currentConfig.baseURL}${apiPaths.files.mergeChunks}`, {
      fileHash,
      totalChunks: chunks.length,
      originalname: file.name,
      mimetype: file.type,
      size: file.size,
    });
    uploadProgress.value = 100;
    uploadStatus.value = "上传并合并成功";
    uploadStage.value = 'done';
    options.onSuccess(mergeRes.data);
    fetchFiles();
  } catch (err) {
    uploadStatus.value = "合并失败";
    uploadStage.value = 'idle';
    options.onError(err);
  }
};

// 文件切片
function sliceFile(file, size) {
  const chunks = [];
  let cur = 0;
  while (cur < file.size) {
    chunks.push(file.slice(cur, cur + size));
    cur += size;
  }
  return chunks;
}

// 计算文件hash，支持进度回调
function calcFileHash(file, onProgress) {
  return new Promise((resolve) => {
    const chunkSize = 2 * 1024 * 1024;
    const chunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();
    function loadNext() {
      const start = currentChunk * chunkSize;
      const end = Math.min(file.size, start + chunkSize);
      fileReader.readAsArrayBuffer(file.slice(start, end));
    }
    fileReader.onload = (e) => {
      spark.append(e.target.result);
      currentChunk++;
      if (onProgress) onProgress(Math.round((currentChunk / chunks) * 100));
      if (currentChunk < chunks) {
        loadNext();
      } else {
        resolve(spark.end());
      }
    };
    loadNext();
  });
}

// 上传文件前的验证
const beforeUpload = (file) => {
  // 设置文件大小限制
  const maxSize = 102400 * 1024 * 1024;
  const isLt50M = file.size < maxSize;
  if (!isLt50M) {
    ElMessage.error("文件大小不能超10G");
    return false;
  }
  return true;
};

// 上传成功回调
const handleUploadSuccess = (response) => {
  if (!response) {
    return;
  }
  if (response.code === 201) {
    ElMessage.success(response.message || "文件上传成功");
    fetchFiles();
  } else {
    ElMessage.error(response.message || "文件上传失败");
  }
};

// 上传失败回调
const handleUploadError = (error) => {
  console.error("上传失败:", error);
  if (error.response && error.response.data) {
    ElMessage.error(error.response.data.message || "文件上传失败");
  } else {
    ElMessage.error(error.message || "文件上传失败");
  }
};

// 下载文件
const downloadFile = async (file) => {
  try {
    window.open(
      `${currentConfig.baseURL}${apiPaths.files.download(file._id)}`,
      "_blank"
    );
    ElMessage.success("开始下载文件");
  } catch (error) {
    console.error("下载失败:", error);
    ElMessage.error(error.response?.data?.message || "文件下载失败");
  }
};

// 删除文件
const deleteFile = async (file) => {
  try {
    await ElMessageBox.confirm("确定要删除这个文件吗？", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    const response = await axios.delete(
      `${currentConfig.baseURL}${apiPaths.files.delete(file._id)}`,
      {
        timeout: 5000,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    if (response.data && response.data.code === 200) {
      ElMessage.success("文件删除成功");
      fetchFiles();
    } else {
      ElMessage.error(response.data?.message || "文件删除失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("文件删除失败");
    }
  }
};

// 格式化文件大小
const formatFileSize = (size) => {
  if (size < 1024) return size + " B";
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + " KB";
  if (size < 1024 * 1024 * 1024)
    return (size / (1024 * 1024)).toFixed(2) + " MB";
  return (size / (1024 * 1024 * 1024)).toFixed(2) + " GB";
};

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
};

// 搜索文件
const searchFiles = async (keyword) => {
  if (!keyword) {
    fetchFiles();
    return;
  }
  loading.value = true;
  try {
    // 这里 params: { q: keyword }，不要 encodeURIComponent
    const response = await axios.get(
      `${currentConfig.baseURL}${apiPaths.files.search}`,
      {
        params: { q: keyword },
        timeout: 5000,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    if (response.data?.data) {
      files.value = response.data.data.map((file) => ({
        ...file,
        originalname: safeDecodeURI(file.originalname),
      }));
    } else {
      files.value = [];
    }
  } catch (error) {
    ElMessage.error("搜索失败");
    files.value = [];
  } finally {
    loading.value = false;
  }
};

// 搜索按钮/回车触发
const onSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchFiles(search.value.trim());
  }, 300);
};
// 清空搜索
const onClearSearch = () => {
  search.value = "";
  fetchFiles();
};

const formatNovelInfo = (info) => {
  if (!info) return '';
  return `
    <div>
      <div><b>小说名：</b>${info.name || ''}</div>
      <div><b>作者：</b>${info.author || ''}</div>
      <div><b>主角1：</b>${info.P1 || ''}</div>
      <div><b>主角2：</b>${info.P2 || ''}</div>
      <div><b>标签：</b>${info.tag || ''}</div>
      <div><b>简介：</b>${info.about || ''}</div>
    </div>
  `;
};

const displayFiles = computed(() => {
  if (!filteredType.value.length || filteredType.value.includes("")) return files.value;
  return files.value.filter(row => {
    return filteredType.value.some(type => {
      if (type === "archive") {
        return archiveExts.some(ext => row.originalname && row.originalname.toLowerCase().endsWith('.' + ext));
      } else {
        return row.mimetype && row.mimetype.includes(type);
      }
    });
  });
});

const onTypeFilterChange = (val) => {
  // 更新 typeChecked
  Object.keys(typeChecked.value).forEach(key => {
    typeChecked.value[key] = val.includes(key) ? 1 : 0;
  });

  // 除"全部"外所有选项
  const nonAllKeys = Object.keys(typeChecked.value).filter(key => key !== "");
  const allChecked = nonAllKeys.every(key => typeChecked.value[key] === 1);

  if (allChecked) {
    // 只选中"全部"，其它全部为0
    filteredType.value = [""];
    Object.keys(typeChecked.value).forEach(key => {
      typeChecked.value[key] = key === "" ? 1 : 0;
    });
    return;
  }

  // 只选了"全部"
  if (val.length === 1 && val[0] === "") {
    filteredType.value = [""];
    Object.keys(typeChecked.value).forEach(key => {
      typeChecked.value[key] = key === "" ? 1 : 0;
    });
    return;
  }

  // 选了"全部"以外的类型
  if (val.includes("") && val.length > 1) {
    filteredType.value = val.filter(v => v !== "");
    typeChecked.value[""] = 0;
    return;
  }

  // 没有任何选项时，回到"全部"
  if (val.length === 0) {
    filteredType.value = [""];
    Object.keys(typeChecked.value).forEach(key => {
      typeChecked.value[key] = key === "" ? 1 : 0;
    });
    return;
  }

  // 正常多选
  filteredType.value = val;
};

// 透明度设置：读取localStorage
const componentOpacity = ref(1);
const theme = ref(localStorage.getItem('theme') || 'light');
function updateComponentOpacityFromStorage() {
  theme.value = localStorage.getItem('theme') || 'light';
  if (theme.value === "dark") {
    const dark = localStorage.getItem("darkModeOpacity");
    componentOpacity.value = dark ? parseFloat(dark) : 0.6;
  } else {
    const light = localStorage.getItem("lightModeOpacity");
    componentOpacity.value = light ? parseFloat(light) : 1;
  }
}
updateComponentOpacityFromStorage();
window.addEventListener('storage', updateComponentOpacityFromStorage);

const themeBgColor = computed(() =>
  theme.value === 'dark'
    ? `rgba(26,26,26,${componentOpacity.value})`
    : `rgba(255,255,255,${componentOpacity.value})`
);

// 暂停、继续、取消上传
const pauseUpload = () => { isPaused.value = true; };
const resumeUpload = () => { isPaused.value = false; };
const cancelUpload = async () => {
  const confirm = await ElMessageBox.confirm("确定要取消上传吗？", "提示", { type: "warning", confirmButtonText: "确定", cancelButtonText: "取消" }).catch(() => false);
  if (confirm) {
    isCanceled.value = true;
    uploadStatus.value = "已取消";
    uploadStage.value = 'idle';
    uploadProgress.value = 0;
    md5Progress.value = 0;
  }
};

onMounted(() => {
  fetchFiles();
  // 初始化所有选项为未选中，"全部"为选中
  typeFilters.forEach(item => {
    typeChecked.value[item.value] = item.value === "" ? 1 : 0;
  });
});
</script>

<style lang="scss" scoped>
.files-page {
  min-height: 100vh;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;

    h1 {
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(
        45deg,
        var(--primary-color),
        var(--secondary-color)
      );
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  :deep(.el-upload) {
    .el-button {
      background-color: var(--primary-color);
      border-color: var(--primary-color);

      &:hover {
        background-color: var(--secondary-color);
        border-color: var(--secondary-color);
      }
    }
  }
}

.main-content {
  background-color: var(--card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px var(--shadow-color);

  :deep(.el-table) {
    background-color: var(--card-bg);
    color: var(--text-color);

    th {
      background-color: var(--item-bg);
      color: var(--text-color);
    }

    td {
      background-color: var(--card-bg);
      color: var(--text-color);
    }

    tr:hover > td {
      background-color: var(--item-hover-bg);
    }

    .el-table__empty-block {
      background-color: var(--card-bg);
    }

    .el-table__empty-text {
      color: var(--text-secondary);
    }
  }

  :deep(.el-button) {
    &.el-button--primary {
      background-color: var(--primary-color);
      border-color: var(--primary-color);

      &:hover {
        background-color: var(--secondary-color);
        border-color: var(--secondary-color);
      }
    }

    &.el-button--danger {
      background-color: var(--accent-color);
      border-color: var(--accent-color);

      &:hover {
        background-color: var(--accent-color);
        border-color: var(--accent-color);
        opacity: 0.8;
      }
    }
  }
}

.file-name {
  display: flex;
  align-items: center;
  background-color: var(--item-bg);
  gap: 0.5rem;
  color: var(--text-color);
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: var(--item-hover-bg);
  }

  .el-icon {
    color: var(--primary-color);
  }
}

.header-search {
  display: flex;
  align-items: center;
  background: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow-color);
  padding: 0.25rem 0.75rem;
  margin-left: 1rem;
  transition: box-shadow 0.2s;
  &:focus-within {
    box-shadow: 0 4px 16px var(--primary-color);
  }
  .el-input {
    flex: 1;
    font-size: 1rem;
    background: transparent;
    .el-input__inner {
      background: transparent;
      border: none;
      box-shadow: none;
      color: var(--text-color);
    }
    .el-input-group__append {
      background: transparent;
      border: none;
      .el-button {
        background: var(--primary-color);
        color: #fff;
        border-radius: 0 6px 6px 0;
        &:hover {
          background: var(--secondary-color);
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .files-page {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;

    .header-left {
      h1 {
        font-size: 1.5rem;
      }
    }
  }
}

.fade-upload-list-enter-active, .fade-upload-list-leave-active {
  transition: opacity 0.5s;
}
.fade-upload-list-enter-from, .fade-upload-list-leave-to {
  opacity: 0;
}
.custom-upload-list {
  margin: 0;
  padding: 0;
  list-style: none;
  position: absolute;
  right: 0;
  top: 60px;
  z-index: 1000;
  background: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow-color);
  min-width: 220px;
}
.el-upload-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--item-bg);
  color: var(--text-color);
}
.el-upload-list__item:last-child {
  border-bottom: none;
}

.global-upload-progress {
  position: fixed;
  left: 50%;
  bottom: 32px;
  width: 50vw;
  transform: translateX(-50%);
  box-shadow: 0 -2px 8px var(--shadow-color);
  padding: 12px 0 8px 0;
  z-index: 2000;
  display: flex;
  justify-content: center;
}

.global-upload-progress .el-progress {
  width: 90%;
  max-width: none;
  background: transparent;
}

.apple-progress {
  .el-progress-bar__outer {
    background: rgba(200, 200, 200, 0.3);
    border-radius: 8px;
    height: 10px !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .el-progress-bar__inner {
    background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
    border-radius: 8px;
    transition: width 0.4s cubic-bezier(.4,0,.2,1);
  }
  .el-progress__text {
    color: #333;
    font-size: 13px;
    font-weight: 500;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -60%);
    background: rgba(255,255,255,0.7);
    border-radius: 6px;
    padding: 0 8px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.03);
  }
}
.apple-upload-btn {
  border-radius: 50%;
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f7;
  color: #007aff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: none;
  margin: 0 6px;
  transition: background 0.2s, box-shadow 0.2s;
  &:hover {
    background: #e0eaff;
    box-shadow: 0 4px 16px rgba(0,122,255,0.08);
  }
}
.apple-upload-progress-bg {
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(12px);
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  padding: 18px 32px 18px 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 340px;
  max-width: 90vw;
  margin: 0 auto;
}
</style>
