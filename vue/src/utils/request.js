import axios from 'axios'
import { currentConfig, apiConfig } from '../config'

// 创建axios实例
const service = axios.create({
  baseURL: currentConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: apiConfig.headers
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
    return Promise.reject(error)
  }
)

// 封装GET请求
export function get(url, params) {
  return service({
    url,
    method: 'get',
    params
  })
}

// 封装POST请求
export function post(url, data) {
  return service({
    url,
    method: 'post',
    data
  })
}

// 封装PUT请求
export function put(url, data) {
  return service({
    url,
    method: 'put',
    data
  })
}

// 封装DELETE请求
export function del(url) {
  return service({
    url,
    method: 'delete'
  })
}

export default service 