<template>
  <div class="app-container">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { watch } from "vue";
import { useRouter } from "vue-router";
import { currentConfig } from "./config";

const router = useRouter();

// 监听路由变化
watch(
  () => router.currentRoute.value,
  (newRoute) => {
    document.title = `${newRoute.meta.title || "个人主页"} - ${currentConfig.title}`;
  },
  { immediate: true }
);
</script>

<style lang="scss">
.app-container {
  min-height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: background-color 0.3s, color 0.3s;
  position: relative;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('@/assets/images/uri.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: -1;
}

:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  --card-bg: rgba(255, 255, 255, 0.9);
  --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  --border-color: #e4e7ed;
  --primary-color: #409eff;
  --secondary-color: #67c23a;
  --text-secondary: #909399;
  --scrollbar-thumb: #dcdfe6;
  --scrollbar-track: #f5f7fa;
  --item-bg: rgba(255, 255, 255, 0.5);
  --item-hover-bg: rgba(255, 255, 255, 0.8);
  --rank-bg: #f5f7fa;
  --rank-color: #909399;
  --tag-bg: rgba(64, 158, 255, 0.1);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 1;
}

</style>
