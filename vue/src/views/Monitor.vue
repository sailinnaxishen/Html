
<template>
  <div class="monitor-page">
    <header class="header">
      <div class="header-left">
        <el-button
          @click="router.push('/')"
          :icon="ArrowLeft"
          >返回</el-button
        >
        <h1>系统监控</h1>
      </div>
      <el-button-group>
        <el-button
          :type="timeMode === 'ntp' ? 'primary' : ''"
          @click="timeMode = 'ntp'"
        >
          NTP时间
        </el-button>
        <el-button
          :type="timeMode === 'local' ? 'primary' : ''"
          @click="timeMode = 'local'"
        >
          本地时间
        </el-button>
      </el-button-group>
    </header>

    <main class="main-content">
      <div class="grid-container">
        <!-- CPU使用率图表 -->
        <div class="card chart-card">
          <h2>CPU使用率</h2>
          <div class="chart-container">
            <v-chart
              class="chart"
              :option="cpuOption"
              autoresize
            />
          </div>
        </div>

        <!-- 内存使用率图表 -->
        <div class="card chart-card">
          <h2>内存使用率</h2>
          <div class="chart-container">
            <v-chart
              class="chart"
              :option="memoryOption"
              autoresize
            />
          </div>
        </div>

        <!-- 系统信息卡片 -->
        <div class="card info-card">
          <h2>系统信息</h2>
          <div class="info-list">
            <div class="info-item">
              <span class="label">CPU核心数</span>
              <span class="value">{{ systemStats.cpu.cores }}</span>
            </div>
            <div class="info-item">
              <span class="label">系统运行时间</span>
              <span class="value">{{ formatUptime(systemStats.uptime) }}</span>
            </div>
            <div class="info-item">
              <span class="label">当前时间</span>
              <span class="value">{{ currentTime }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft } from "@element-plus/icons-vue";
import axios from "axios";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import dayjs from "dayjs";
import { apiPaths, currentConfig } from '../config';

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
]);

const router = useRouter();
const timeMode = ref("ntp");
const currentTime = ref("");
const systemStats = ref({
  cpu: { usage: 0, cores: 0, loadAvg: 0 },
  memory: { total: 0, free: 0, used: 0, freePercentage: 0, usedPercentage: 0 },
  uptime: 0,
});

// CPU图表配置
const cpuOption = computed(() => ({
  tooltip: {
    trigger: "axis",
    formatter: "{b}<br />{a}: {c}%",
  },
  xAxis: {
    type: "category",
    data: Array.from({ length: 60 }, (_, i) => i + 1).reverse(),
  },
  yAxis: {
    type: "value",
    min: 0,
    max: 100,
  },
  series: [
    {
      name: "CPU使用率",
      type: "line",
      data: Array.from({ length: 60 }, () => Math.round(systemStats.value.cpu.usage * 100)),
      smooth: true,
      areaStyle: {
        opacity: 0.3,
      },
      lineStyle: {
        width: 2,
      },
    },
  ],
}));

// 内存图表配置
const memoryOption = computed(() => ({
  tooltip: {
    trigger: "axis",
    formatter: "{b}<br />{a}: {c}%",
  },
  xAxis: {
    type: "category",
    data: Array.from({ length: 60 }, (_, i) => i + 1).reverse(),
  },
  yAxis: {
    type: "value",
    min: 0,
    max: 100,
  },
  series: [
    {
      name: "内存使用率",
      type: "line",
      data: Array.from({ length: 60 }, () => Math.round(systemStats.value.memory.usedPercentage * 100)),
      smooth: true,
      areaStyle: {
        opacity: 0.3,
      },
      lineStyle: {
        width: 2,
      },
    },
  ],
}));

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
      cpu: { usage: 0, cores: 0, loadAvg: 0 },
      memory: {
        total: 0,
        free: 0,
        used: 0,
        freePercentage: 0,
        usedPercentage: 0,
      },
      uptime: 0,
    };
  }
};

// 获取NTP时间
const fetchNTPTime = async () => {
  try {
    const response = await axios.get(
      `${currentConfig.baseURL}${apiPaths.time.ntp}`,
      {
        timeout: 5000,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    if (response.data && response.data.data) {
      currentTime.value = dayjs(response.data.data.ntpTime).format(
        "YYYY-MM-DD HH:mm:ss"
      );
    }
  } catch (error) {
    console.error("获取NTP时间失败:", error);
    // 如果NTP时间获取失败，使用本地时间
    updateLocalTime();
  }
};

// 更新本地时间
const updateLocalTime = () => {
  currentTime.value = dayjs().format("YYYY-MM-DD HH:mm:ss");
};

// 格式化运行时间
const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}天${hours}小时`;
  if (hours > 0) return `${hours}小时${minutes}分钟`;
  return `${minutes}分钟`;
};

onMounted(() => {
  fetchSystemStats();
  const statsTimer = setInterval(fetchSystemStats, 1000);
  const timeTimer = setInterval(() => {
    if (timeMode.value === "ntp") {
      fetchNTPTime();
    } else {
      updateLocalTime();
    }
  }, 1000);

  onUnmounted(() => {
    clearInterval(statsTimer);
    clearInterval(timeTimer);
  });
});
</script>

<style lang="scss" scoped>
.monitor-page {
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
}

.main-content {
  .grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
}

.chart-card {
  .chart-container {
    height: 300px;
    width: 100%;
  }

  .chart {
    height: 100%;
  }
}

.info-card {
  .info-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--border-color);

    &:last-child {
      border-bottom: none;
    }

    .label {
      color: var(--text-color);
      opacity: 0.8;
    }

    .value {
      font-weight: 500;
      color: var(--primary-color);
    }
  }
}

@media (max-width: 768px) {
  .monitor-page {
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

  .chart-card {
    .chart-container {
      height: 250px;
    }
  }
}
</style>
