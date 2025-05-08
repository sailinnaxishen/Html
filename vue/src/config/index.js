// 项目配置文件
export const env = {
  // 开发环境
  development: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    title: import.meta.env.VITE_APP_TITLE || '个人主页 - 开发环境',
    description: import.meta.env.VITE_APP_DESCRIPTION || '开发环境'
  },
  // 生产环境
  production: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    title: import.meta.env.VITE_APP_TITLE || '个人主页',
    description: import.meta.env.VITE_APP_DESCRIPTION || '生产环境'
  },
}
const currentEnv = import.meta.env.MODE || 'development'
export const currentConfig = env[currentEnv]

// API配置
export const apiConfig = {
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  },
  retry: true,
  retryCount: 3,
  retryDelay: 1000
}
// API路径配置
export const apiPaths = {
  files: {
    list: "/api/files",
    upload: "/api/files/upload",
    delete: (id) => `/api/files/${id}`,
    download: (id) => `/api/files/download/${id}`,
    search: "/api/files/search",
    uploadChunk: "/api/files/upload-chunk",
    mergeChunks: "/api/files/merge-chunks",
    uploadedChunks: "/api/files/uploaded-chunks",
  },
  monitor: {
    systemStats: '/api/monitor/system-stats'
  },
  time: {
    ntp: '/api/time/ntp'
  },
  hotSearch: {
    bilibili: '/api/hot-search/bilibili',
    weibo: '/api/hot-search/weibo'
  }
}

// 主题配置
export const themeConfig = {
  primaryColor: '#007aff',
  secondaryColor: '#5856d6',
  accentColor: '#ff2d55',
  light: {
    bgColor: '#ffffff',
    textColor: '#333333',
    cardBg: 'rgba(245, 245, 247, 0.75)',
    borderColor: '#e5e5e5',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    textSecondary: '#666666',
    itemBg: 'rgba(255, 255, 255, 0.75)',
    itemHoverBg: 'rgba(245, 245, 245, 0.75)',
    rankBg: 'rgba(240, 240, 240, 0.75)',
    rankColor: '#666666',
    tagBg: 'rgba(240, 240, 240, 0.75)',
    scrollbarThumb: '#cccccc',
    scrollbarTrack: 'rgba(245, 245, 247, 0.75)'
  },
  dark: {
    bgColor: '#1a1a1a',
    textColor: '#ffffff',
    cardBg: 'rgba(45, 45, 45, 0.75)',
    borderColor: '#3d3d3d',
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    textSecondary: '#b0b0b0',
    itemBg: 'rgba(45, 45, 45, 0.75)',
    itemHoverBg: 'rgba(61, 61, 61, 0.75)',
    rankBg: 'rgba(61, 61, 61, 0.75)',
    rankColor: '#b0b0b0',
    tagBg: 'rgba(61, 61, 61, 0.75)',
    scrollbarThumb: '#4d4d4d',
    scrollbarTrack: 'rgba(45, 45, 45, 0.75)'
  }
}

// 路由配置
export const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/files',
    name: 'Files',
    component: () => import('@/views/Files.vue')
  },
  {
    path: '/monitor',
    name: 'Monitor',
    component: () => import('@/views/Monitor.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue')
  }
]

// 导出默认配置
export default {
  env,
  currentConfig,
  apiConfig,
  apiPaths,
  themeConfig,
  routes
} 