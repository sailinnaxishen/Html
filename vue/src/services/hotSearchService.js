import axios from 'axios';
import { currentConfig, apiPaths } from '../config';

/**
 * 获取热搜数据
 * @param {string} platform - 平台名称 ('bilibili' 或 'weibo')
 * @returns {Promise<Array>} 热搜数据列表
 */
export const getHotSearch = async (platform) => {
  try {
    const response = await axios.get(`${currentConfig.baseURL}${apiPaths.hotSearch[platform]}`);
    return response.data;
  } catch (error) {
    console.error('获取热搜数据失败:', error);
    throw error;
  }
};

/**
 * 热搜服务
 */
export default {
  getHotSearch
}; 