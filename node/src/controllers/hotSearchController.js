const mongoose = require('mongoose');
const config = require('../config');
const Response = require('../utils/response');
const HotSearchSchema = require('../models/HotSearch');

// 创建热搜模型
const HotSearchModel = mongoose.model('HotSearch', HotSearchSchema, 'hot_search');

/**
 * 获取指定平台的热搜数据
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Object} 热搜数据列表
 */
const getHotSearch = async (req, res) => {
    try {
        const { platform } = req.params;
        console.log(`正在获取 ${platform} 平台的热搜数据...`);
        
        // 验证平台参数
        if (!config.hotSearch.platforms.includes(platform)) {
            return res.status(400).json(Response.badRequest('不支持的平台类型'));
        }

        // 检查数据库连接状态
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json(Response.error('数据库服务暂时不可用', 503));
        }

        // 获取最近数据
        const retentionDays = config.hotSearch.dataRetentionDays;
        const retentionTime = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
        
        // 获取数据
        const hotList = await HotSearchModel
            .find({
                platform,
                timestamp: { $gte: retentionTime }
            })
            .sort({ timestamp: -1 })
            .limit(platform === 'bilibili' ? config.hotSearch.bilibiliLimit : config.hotSearch.weiboLimit)
            .lean();

        if (!hotList || hotList.length === 0) {
            return res.status(404).json(Response.notFound('未找到热搜数据'));
        }

        return res.status(200).json(Response.success({
            platform,
            total: hotList.length,
            list: hotList
        }, '获取热搜数据成功'));

    } catch (error) {
        console.error('获取热搜数据失败:', error);
        return res.status(500).json(Response.error('服务器内部错误', 500, error.message));
    }
};

/**
 * 插入测试数据
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Object} 插入结果
 */
const insertTestData = async (req, res) => {
    try {
        // 测试数据
        const testData = config.hotSearch.platforms.flatMap(platform => [
            {
                platform,
                title: `${platform}热搜测试1`,
                url: `https://${platform}.com/test1`,
                hot: '1234万',
                timestamp: new Date()
            },
            {
                platform,
                title: `${platform}热搜测试2`,
                url: `https://${platform}.com/test2`,
                hot: '999万',
                timestamp: new Date()
            }
        ]);

        // 插入测试数据
        const result = await HotSearchModel.insertMany(testData);
        console.log(`成功插入 ${result.length} 条测试数据`);

        return res.status(200).json(Response.success({
            count: result.length
        }, '测试数据插入成功'));

    } catch (error) {
        console.error('插入测试数据失败:', error);
        return res.status(500).json(Response.error('插入测试数据失败', 500, error.message));
    }
};

module.exports = {
    getHotSearch,
    insertTestData
}; 