const express = require('express');
const router = express.Router();
const { getHotSearch, insertTestData } = require('../controllers/hotSearchController');

/**
 * @api {get} /api/hot-search/:platform 获取指定平台的热搜数据
 * @apiName GetHotSearch
 * @apiGroup HotSearch
 * @apiVersion 1.0.0
 * 
 * @apiParam {String} platform 平台名称 (bilibili/weibo)
 * 
 * @apiSuccess {Number} code 状态码
 * @apiSuccess {String} message 响应消息
 * @apiSuccess {Object} data 响应数据
 * @apiSuccess {String} data.platform 平台名称
 * @apiSuccess {Number} data.total 数据总数
 * @apiSuccess {Array} data.list 热搜列表
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "code": 200,
 *       "message": "获取热搜数据成功",
 *       "data": {
 *         "platform": "weibo",
 *         "total": 52,
 *         "list": [...]
 *       }
 *     }
 * 
 * @apiError {Number} code 错误码
 * @apiError {String} message 错误信息
 * @apiError {Object} data 错误数据
 */
router.get('/:platform', getHotSearch);

/**
 * @api {post} /api/hot-search/test/insert 插入测试数据
 * @apiName InsertTestData
 * @apiGroup HotSearch
 * @apiVersion 1.0.0
 * 
 * @apiSuccess {Number} code 状态码
 * @apiSuccess {String} message 响应消息
 * @apiSuccess {Object} data 响应数据
 * @apiSuccess {Number} data.count 插入的数据条数
 */
router.post('/test/insert', insertTestData);

module.exports = router; 