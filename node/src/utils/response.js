class Response {
  static success(data = null, message = "操作成功") {
    return {
      code: 200,
      message,
      data,
    };
  }

  static error(message = "操作失败", code = 500, error = null) {
    return {
      code,
      message,
      error,
    };
  }

  static created(data = null, message = "创建成功") {
    return {
      code: 201,
      message,
      data,
    };
  }

  static notFound(message = "资源不存在") {
    return {
      code: 404,
      message,
    };
  }

  static badRequest(message = "请求参数错误") {
    return {
      code: 400,
      message,
    };
  }
}

module.exports = Response;
