// 设置测试环境变量
process.env.NODE_ENV = "test";

const mongoose = require("mongoose");
const config = require("../src/config");

// 设置测试超时时间
jest.setTimeout(30000);

// 在所有测试完成后关闭数据库连接
afterAll(async () => {
  await mongoose.connection.close();
});

// 在所有测试开始前连接数据库
beforeAll(async () => {
  await mongoose.connect(config.database.uri);
});
