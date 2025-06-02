const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: '用户名已存在' });
    }
    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: '注册成功' });
  } catch (err) {
    res.status(500).json({ message: '注册失败', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: '密码错误' });
    }
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: '登录失败', error: err.message });
  }
};

exports.getMe = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: '未认证' });
  }
  res.json({
    id: req.user._id,
    username: req.user.username
  });
};

exports.changePassword = async (req, res) => {
  try {
    const user = req.user;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: '旧密码和新密码不能为空' });
    }
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ message: '旧密码错误' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: '密码修改成功' });
  } catch (err) {
    res.status(500).json({ message: '密码修改失败', error: err.message });
  }
}; 