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
          placeholder="搜索文件名（支持模糊匹配）"
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
        :http-request="customUpload"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :before-upload="beforeUpload"
        multiple
      >
        <el-button
          type="primary"
          :icon="Upload"
          >上传文件</el-button
        >
      </el-upload>
    </header>

    <main class="main-content">
      <el-table
        v-loading="loading"
        :data="files"
        style="width: 100%"
        :empty-text="loading ? '加载中...' : '暂无文件'"
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
          label="类型"
          width="120"
        />
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
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  ArrowLeft,
  Upload,
  Download,
  Delete,
  Document,
  Search,
} from "@element-plus/icons-vue";
import axios from "axios";
import dayjs from "dayjs";
import { apiPaths, currentConfig } from "../config";

const router = useRouter();
const loading = ref(false);
const files = ref([]);
const search = ref("");
let searchTimeout = null;

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
const customUpload = async (options) => {
  try {
    const formData = new FormData();
    
    // 直接使用原始文件名，仅处理特殊符号兼容性
    const processedFile = new File(
      [options.file], 
      options.file.name.replace(/'/g, "%27"), // 保留单引号处理
      { type: options.file.type }
    );

    formData.append("file", processedFile);

    const response = await axios.post(
      `${currentConfig.baseURL}${apiPaths.files.upload}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data; charset=UTF-8",
        },
      }
    );

    options.onSuccess(response.data);
  } catch (error) {
    options.onError(error);
  }
};
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
    ElMessage.error("上传返回数据为空");
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

onMounted(() => {
  fetchFiles();
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
</style>
