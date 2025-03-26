// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "服务器内部错误";

  res.status(statusCode).json({
    code: statusCode,
    message,
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = errorHandler;
