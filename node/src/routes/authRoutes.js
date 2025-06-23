const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

router.post('/register', (req, res, next) => {
  console.log(`[Register] 请求到达: ${JSON.stringify(req.body)}`);
  authController.register(req, res).catch(err => {
    console.error(`[Register] 控制器错误: ${err.message}`);
    next(err);
  });
});

router.post('/login', (req, res, next) => {
  console.log(`[Login] 请求到达: ${JSON.stringify(req.body)}`);
  authController.login(req, res).catch(err => {
    console.error(`[Login] 控制器错误: ${err.message}`);
    next(err);
  });
});

router.get('/me', auth, authController.getMe);
router.post('/change-password', auth, authController.changePassword);

module.exports = router; 