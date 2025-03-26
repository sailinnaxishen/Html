<template>
  <div class="home-container" :style="{ opacity: componentOpacity }">
    <!-- 夜间模式设置 -->
    <div class="theme-controls">
      <el-button
        :icon="Setting"
        circle
        @click="showOpacityDialog = true"
        class="opacity-button"
      />
      <el-switch
        v-model="isDarkTheme"
        class="theme-switch"
        :active-icon="Moon"
        :inactive-icon="Sunny"
        @update:modelValue="toggleTheme"
      />
    </div>
    <el-dialog
      v-model="showOpacityDialog"
      :title="isDarkTheme ? '夜间模式设置' : '日间模式设置'"
      width="300px"
      :close-on-click-modal="false"
    >
      <template v-if="isDarkTheme">
        <div class="setting-item">
          <div class="setting-label">组件不透明度</div>
          <el-slider
            v-model="componentOpacity"
            :min="0.3"
            :max="1"
            :step="0.1"
            @change="updateOpacity"
          />
          <span class="opacity-value">{{ (componentOpacity * 100).toFixed(0) }}%</span>
        </div>
        <div class="setting-item">
          <div class="setting-label">页面亮度</div>
          <el-slider
            v-model="pageBrightness"
            :min="0.3"
            :max="1"
            :step="0.1"
            @change="updatePageBrightness"
          />
          <span class="opacity-value">{{ (pageBrightness * 100).toFixed(0) }}%</span>
        </div>
      </template>
      <template v-else>
        <!-- 组件透明度设置 -->
        <div class="setting-item">
          <!-- 设置标签 -->
          <div class="setting-label">组件不透明度</div>
          <!-- 滑动条 -->
          <el-slider
            v-model="componentOpacity"
            :min="0.5"
            :max="1"
            :step="0.1"
            @change="updateOpacity"
          />
          <!-- 透明度值 -->
          <span class="opacity-value">{{ (componentOpacity * 100).toFixed(0) }}%</span>
        </div>
      </template>
    </el-dialog>
    <!-- 主页入口 -->
    <div class="home">
      <header class="header">
        <h1>个人主页</h1>
        
      </header>
      <!-- 主页内容/卡片内容 -->
      <main class="main-content">
        <div class="grid-container">
          <!-- 时钟卡片 -->
          <div class="card clock-card">
            <h2>实时时钟</h2>
            <div class="clock">
              <div class="time">{{ currentTime }}</div>
              <div class="date">{{ currentDate }}</div>
            </div>
          </div>

          <!-- 系统监控卡片 -->
          <div class="card monitor-card">
            <h2>系统监控</h2>
            <div class="monitor-content">
              <div class="monitor-item">
                <span class="label">CPU使用率</span>
                <el-progress
                  :percentage="Math.round(systemStats.cpu.usage * 100)"
                  :color="getProgressColor(systemStats.cpu.usage)"
                />
              </div>
              <div class="monitor-item">
                <span class="label">内存使用率</span>
                <el-progress
                  :percentage="Math.round(systemStats.memory.usedPercentage * 100)"
                  :color="getProgressColor(systemStats.memory.usedPercentage)"
                />
              </div>
            </div>
          </div>

          <!-- 网盘入口卡片 -->
          <div
            class="card files-card"
            @click="navigateToFiles"
          >
            <h2>个人网盘</h2>
            <!-- <p>个人网盘</p> -->
            <div class="files-content">
              <el-icon class="files-icon"><Folder /></el-icon>
              <p>点击进入网盘</p>
            </div>
          </div>
          <!-- 实时热搜卡片 -->
          <div class="card hot-search-card">
            <!-- 卡片头部 -->
            <div class="card-header">
              <!-- 标题 -->
              <h2>实时热搜</h2>
              <!-- 平台切换 -->
              <div class="platform-switch">
                <!-- 单选按钮组 -->
                <el-radio-group v-model="currentPlatform" size="small">
                  <!-- bilibili单选按钮 -->
                  <el-radio-button :value="'bilibili'">bilibili</el-radio-button>
                  <!-- 微博单选按钮 -->
                  <el-radio-button :value="'weibo'">微博</el-radio-button>
                </el-radio-group>
              </div>
            </div>
            <!-- 热搜列表 -->
            <div class="hot-list">
              <!-- 遍历热搜列表 -->
              <div v-for="(item, index) in hotList" 
                   :key="index" 
                   class="hot-item"
                   @click="handleHotClick(item)">
                <!-- 排名 -->
                <span class="rank" :class="{ 'top-three': index < 3 }">{{ index + 1 }}</span>
                <!-- 标题 -->
                <span class="title">{{ item.title }}</span>
                <!-- 热度 -->
                <span class="hot-value">{{ item.hot }}</span>
              </div>
            </div>
          </div>
          <!-- 项目地址 -->
          <div class="card project-card">
            <h2>项目地址</h2>
            <div class="project-content">
              <div class="project-links">
                <a href="https://gitee.com/Sailinnalanyin" target="_blank" class="project-link">
                  <el-icon><Platform /></el-icon>
                  <span>Gitee</span>
                </a>
                <a href="https://github.com/sailinnaxishen" target="_blank" class="project-link">
                  <el-icon><Platform /></el-icon>
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>
          <!-- 关于项目 -->
          <div class="card about-card" @click="router.push('/about')">
            <h2>关于项目</h2>
            <div class="about-content">
              <div class="about-production">
                <el-icon class="about-icon"><InfoFilled /></el-icon>
                <p>技术栈</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    <p class="copyright">版权所有© <a href="https://github.com/sailinnaxishen" target="_blank">sailinnaxishen</a></p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import { useDark, useToggle } from "@vueuse/core";
import { Moon, Sunny, Folder, Platform, InfoFilled, Setting } from "@element-plus/icons-vue";
import axios from "axios";
import { apiPaths, currentConfig } from '../config';

const router = useRouter();
const isDarkMode = useDark();
const toggleDark = useToggle(isDarkMode);

const currentTime = ref("");
const currentDate = ref("");
const systemStats = ref({
  cpu: { usage: 0 },
  memory: { usedPercentage: 0 },
});


// 热搜相关
const currentPlatform = ref('bilibili');
const hotList = ref([]);
let hotTimer = null;

const { proxy } = getCurrentInstance();
const isDarkTheme = ref(false);
const showOpacityDialog = ref(false);
const componentOpacity = ref(1);
const pageBrightness = ref(0.6);

const fetchHotData = async () => {
  try {
    const apiPath = currentPlatform.value === 'bilibili' 
      ? apiPaths.hotSearch.bilibili 
      : apiPaths.hotSearch.weibo;
    
    const response = await axios.get(`${currentConfig.baseURL}${apiPath}`);
    console.log('热搜数据:', response.data);
    
    if (response.data.code === 200 && response.data.data.list) {
      // 直接使用后端返回的list数据
      hotList.value = response.data.data.list.map(item => ({
        title: item.title || '',
        hot: item.hot || '0',
        url: item.url || '#'
      }));
    } else {
      console.error('热搜数据格式不正确:', response.data);
      hotList.value = [];
    }
  } catch (error) {
    console.error('获取热搜数据失败:', error);
    hotList.value = [];
  }
};

const handleHotClick = (item) => {
  window.open(item.url, '_blank');
};

// 监听平台切换
watch(currentPlatform, () => {
  fetchHotData();  // 切换平台时重新获取数据
});

// 更新时间
const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  currentDate.value = now.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
};

// 获取系统状态
const fetchSystemStats = async () => {
  try {
    const response = await axios.get(
      `${currentConfig.baseURL}${apiPaths.monitor.systemStats}`,
      {
        timeout: 5000,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    if (response.data && response.data.data) {
      systemStats.value = response.data.data;
    }
  } catch (error) {
    console.error("获取系统状态失败:", error);
    // 设置默认值
    systemStats.value = {
      cpu: { usage: 0 },
      memory: { usedPercentage: 0 },
    };
  }
};

// 获取进度条颜色
const getProgressColor = (value) => {
  if (value < 0.6) return "#67C23A";
  if (value < 0.8) return "#E6A23C";
  return "#F56C6C";
};

// 导航到网盘页面
const navigateToFiles = () => {
  router.push("/files");
};

// 更新页面亮度
const updatePageBrightness = (value) => {
  pageBrightness.value = value;
  localStorage.setItem("pageBrightness", value);
  document.documentElement.style.filter = `brightness(${value})`;
};

// 主题切换
const toggleTheme = (value) => {
  isDarkTheme.value = value;
  if (value) {
    document.documentElement.classList.add("dark-theme");
    // 夜间模式默认亮度为60%
    componentOpacity.value = 0.6;
    pageBrightness.value = 0.6;
    localStorage.setItem("darkModeOpacity", "0.6");
    localStorage.setItem("pageBrightness", "0.6");
    document.documentElement.style.filter = `brightness(0.6)`;
  } else {
    document.documentElement.classList.remove("dark-theme");
    // 日间模式恢复100%亮度
    componentOpacity.value = 1;
    pageBrightness.value = 1;
    localStorage.setItem("darkModeOpacity", "1");
    localStorage.setItem("pageBrightness", "1");
    document.documentElement.style.filter = "brightness(1)";
    // 恢复日间模式透明度设置
    const savedLightOpacity = localStorage.getItem("lightModeOpacity");
    if (savedLightOpacity) {
      componentOpacity.value = parseFloat(savedLightOpacity);
    }
  }
  localStorage.setItem("theme", value ? "dark" : "light");
};

// 更新透明度
const updateOpacity = (value) => {
  componentOpacity.value = value;
  if (isDarkTheme.value) {
    localStorage.setItem("darkModeOpacity", value);
  } else {
    localStorage.setItem("lightModeOpacity", value);
  }
};

onMounted(() => {
  updateTime();
  fetchSystemStats();
  fetchHotData();
  
  const timer = setInterval(updateTime, 1000);
  const statsTimer = setInterval(fetchSystemStats, 5000);
  hotTimer = setInterval(fetchHotData, 60000);

  // 初始化主题
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    isDarkTheme.value = true;
    document.documentElement.classList.add("dark-theme");
    // 恢复夜间模式亮度设置
    const savedDarkOpacity = localStorage.getItem("darkModeOpacity");
    const savedPageBrightness = localStorage.getItem("pageBrightness");
    if (savedDarkOpacity) {
      componentOpacity.value = parseFloat(savedDarkOpacity);
    } else {
      componentOpacity.value = 0.6; // 默认60%亮度
    }
    if (savedPageBrightness) {
      pageBrightness.value = parseFloat(savedPageBrightness);
      document.documentElement.style.filter = `brightness(${pageBrightness.value})`;
    } else {
      pageBrightness.value = 0.6;
      document.documentElement.style.filter = "brightness(0.6)";
    }
  } else {
    // 日间模式恢复100%亮度
    componentOpacity.value = 1;
    pageBrightness.value = 1;
    document.documentElement.style.filter = "brightness(1)";
    // 恢复日间模式透明度设置
    const savedLightOpacity = localStorage.getItem("lightModeOpacity");
    if (savedLightOpacity) {
      componentOpacity.value = parseFloat(savedLightOpacity);
    }
  }

  onUnmounted(() => {
    clearInterval(timer);
    clearInterval(statsTimer);
    clearInterval(hotTimer);
  });
});
</script>

<style lang="scss" scoped>
.home-container {
  min-height: 100vh;
  height: 100%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  transition: opacity 0.3s ease;
  position: relative;
  overflow-y: auto;
}

.theme-controls {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1000;

  .opacity-button {
    background: transparent;
    border: none;
    color: var(--text-color);
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.1);
      color: var(--primary-color);
    }
  }
}

.opacity-value {
  margin-left: 12px;
  color: var(--text-color);
  font-size: 14px;
}

.el-dialog {
  background: var(--bg-color);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);

  .el-dialog__header {
    border-bottom: 1px solid var(--border-color);
    padding: 16px 24px;
    margin: 0;

    .el-dialog__title {
      color: var(--text-color);
    }
  }

  .el-dialog__body {
    padding: 24px;
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-shrink: 0;

  h1 {
    font-size: 2.5rem;
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

.main-content {
  flex: 1;
  position: relative;
  width: 100%;
  overflow: visible;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  width: 100%;
  min-height: min-content;
}

.card {
  height: 300px;
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  overflow: hidden;
  min-height: 0;
  width: 100%;

  h2 {
    margin: 1.5rem;
    font-size: 1.5rem;
    color: var(--text-color);
    flex-shrink: 0;
  }
}

.clock-card {
  .clock {
    flex: 1;
    text-align: center;
    padding: 2rem 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;

    .time {
      font-size: 3.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: var(--primary-color);
      line-height: 1.2;
    }

    .date {
      font-size: 1.2rem;
      color: var(--text-color);
      opacity: 0.8;
      line-height: 1.4;
    }
  }
}

.monitor-card {
  .monitor-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 0 1.5rem;
    overflow: hidden;
  }

  .monitor-item {
    flex-shrink: 0;
    .label {
      display: block;
      margin-bottom: 0.5rem;
      color: var(--text-color);
      opacity: 0.8;
    }
  }
}

.files-card {
  .files-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 2rem 0;
    overflow: hidden;

    .files-icon {
      font-size: 4rem;
      color: var(--primary-color);
      flex-shrink: 0;
    }

    p {
      font-size: 1.2rem;
      color: var(--text-color);
      opacity: 0.8;
      margin: 0;
    }
  }

  &:hover {
    .files-icon {
      transform: scale(1.1);
      transition: transform 0.3s ease;
    }
  }
}

.hot-search-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;

    h2 {
      margin: 0;
    }
  }

  .hot-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 1.5rem;
    min-height: 0;
  }

  .hot-list::-webkit-scrollbar {
    width: 4px;
  }

  .hot-list::-webkit-scrollbar-thumb {
    background-color: var(--scrollbar-thumb);
    border-radius: 2px;
  }

  .hot-list::-webkit-scrollbar-track {
    background-color: var(--scrollbar-track);
    border-radius: 2px;
  }

  .hot-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 8px;
    background: var(--item-bg);

    &:hover {
      background: var(--item-hover-bg);
      transform: translateX(4px);
    }
  }

  .rank {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--rank-bg);
    border-radius: 4px;
    margin-right: 12px;
    font-size: 12px;
    color: var(--rank-color);
    font-weight: 500;

    &.top-three {
      background: var(--primary-color);
      color: white;
    }
  }

  .title {
    flex: 1;
    font-size: 14px;
    color: var(--text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .hot-value {
    font-size: 12px;
    color: var(--text-secondary);
    margin-left: 12px;
    padding: 2px 6px;
    background: var(--tag-bg);
    border-radius: 4px;
  }

  .platform-switch {
    margin-left: auto;
  }
}

.project-card {
  .project-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 2rem 0;
    overflow: hidden;

    .project-links {
      display: flex;
      gap: 2rem;
      flex-shrink: 0;

      .project-link {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        text-decoration: none;
        color: var(--text-color);
        transition: all 0.3s ease;

        .el-icon {
          font-size: 2rem;
          color: var(--primary-color);
        }

        span {
          font-size: 0.9rem;
        }
      }
    }
  }
}

.about-card {
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }

  .about-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 0;
    overflow: hidden;

    .about-production {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      color: var(--text-color);

      .about-icon {
        font-size: 3rem;
        color: var(--primary-color);
        flex-shrink: 0;
      }

      p {
        font-size: 1.2rem;
        opacity: 0.8;
        margin: 0;
      }
    }
  }
}

@media (max-width: 768px) {
  .home-container {
    padding: 1rem;
    height: 100vh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .header {
    h1 {
      font-size: 2rem;
    }
  }

  .main-content {
    height: auto;
    width: 100%;
    overflow: visible;
    
    .grid-container {
      grid-template-columns: 1fr;
      gap: 1rem;
      padding: 0.5rem;
      height: auto;
    }
  }

  .card {
    height: auto;
    min-height: 300px;
  }

  .clock-card {
    .clock {
      .time {
        font-size: 2.5rem;
      }
    }
  }

  .hot-search-card {
    .hot-list {
      max-height: 300px;
      overflow-y: auto;
    }
  }

  .project-card {
    .project-content {
      .project-links {
        flex-direction: row;
        gap: 2rem;
      }
    }
  }
}

:global(.dark-theme) {
  --bg-color: #1a1a1a;
  --text-color: #ffffff;
  --card-bg: rgba(26, 26, 26, 0.9);
  --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  --border-color: #363636;
  --primary-color: #409eff;
  --secondary-color: #67c23a;
  --text-secondary: #909399;
  --scrollbar-thumb: #363636;
  --scrollbar-track: #1a1a1a;
  --item-bg: rgba(26, 26, 26, 0.5);
  --item-hover-bg: rgba(26, 26, 26, 0.8);
  --rank-bg: #363636;
  --rank-color: #909399;
  --tag-bg: rgba(64, 158, 255, 0.2);
}
.copyright{
  text-align: center;
  margin-top: 1rem;
  color: var(--text-color);
  opacity: 0.8;
}
</style>
