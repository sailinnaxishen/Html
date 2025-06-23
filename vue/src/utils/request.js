import axios from 'axios'
import { currentConfig, apiConfig } from '../config'

// 创建axios实例
const service = axios.create({
  baseURL: currentConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: apiConfig.headers,
  validateStatus: function (status) {
    // 允许2xx范围的状态码和304（未修改）
    return (status >= 200 && status < 300) || status === 304;
  },
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在这里可以添加token等认证信息
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误：', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 如果状态码是304，表示内容未改变，是成功状态，但没有响应体。
    // 直接返回一个特定值或undefined，让调用方知道无需更新数据。
    if (response.status === 304) {
      return Promise.resolve({ fromCache: true, message: 'Data is up-to-date.' });
    }
    const res = response.data
    // 这里可以根据后端返回的状态码进行统一处理
    if (res.code === 200) {
      return res.data
    } else {
      // 处理错误情况
      console.error('响应错误：', res.message)
      return Promise.reject(new Error(res.message || '请求失败'))
    }
  },
  error => {
    console.error('响应错误：', error)
    if (error.response && error.response.status === 401) {
      // 清理过期的登录信息
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      // 跳转到登录页，并附带当前路径以便登录后返回
      if (window.location.pathname !== '/login') {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
    }
    return Promise.reject(error)
  }
)

// 封装GET请求
export function get(url, params, config = {}) {
  return service({
    url,
    method: 'get',
    params,
    ...config,
  })
}

// 封装POST请求
export function post(url, data, config = {}) {
  return service({
    url,
    method: 'post',
    data,
    ...config,
  })
}

// 封装PUT请求
export function put(url, data, config = {}) {
  return service({
    url,
    method: 'put',
    data,
    ...config,
  })
}

// 封装DELETE请求
export function del(url, config = {}) {
  return service({
    url,
    method: 'delete',
    ...config,
  })
}

export default service 