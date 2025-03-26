const axios = require("axios");

const BASE_URL = "https://wttvcuxocmyo.sealoshzh.site";
const TEST_FILE_PATH = `${__dirname}/test.txt`;
const fs = require("fs");
const FormData = require("form-data");

describe("API 集成测试", () => {
  let uploadedFileId;

  beforeAll(() => {
    // 创建测试文件
    fs.writeFileSync(TEST_FILE_PATH, "测试文件内容");
  });

  afterAll(() => {
    // 清理测试文件
    if (fs.existsSync(TEST_FILE_PATH)) {
      fs.unlinkSync(TEST_FILE_PATH);
    }
  });

  // 测试获取NTP时间
  test("GET /api/time/ntp - 成功获取NTP时间", async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/time/ntp`);
      expect(response.status).toBe(200);
      expect(response.data.code).toBe(200);
      expect(response.data.data).toHaveProperty("ntpTime");
      expect(response.data.data).toHaveProperty("offset");
    } catch (error) {
      throw new Error("请求NTP时间失败: " + error.message);
    }
  });

  // 测试获取系统状态
  test("GET /api/monitor/system-stats - 成功获取系统状态", async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/monitor/system-stats`);
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveProperty("cpu");
      expect(response.data.data).toHaveProperty("memory");
      expect(response.data.data).toHaveProperty("uptime");
    } catch (error) {
      throw new Error("请求系统状态失败: " + error.message);
    }
  });

  // 测试文件操作流程
  describe("文件操作测试", () => {
    // 测试获取文件列表
    test("GET /api/files - 获取文件列表", async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/files`);
        expect(response.status).toBe(200);
        expect(response.data.code).toBe(200);
        expect(Array.isArray(response.data.data)).toBe(true);
      } catch (error) {
        throw new Error("获取文件列表失败: " + error.message);
      }
    });

    // 测试文件上传
    test("POST /api/files/upload - 上传文件", async () => {
      try {
        const formData = new FormData();
        formData.append("file", fs.createReadStream(TEST_FILE_PATH));

        const response = await axios.post(
          `${BASE_URL}/api/files/upload`,
          formData,
          {
            headers: formData.getHeaders(),
          }
        );

        expect(response.status).toBe(201);
        expect(response.data.code).toBe(201);
        expect(response.data.data).toHaveProperty("_id");
        uploadedFileId = response.data.data._id;
      } catch (error) {
        throw new Error("文件上传失败: " + error.message);
      }
    });

    // 测试文件下载
    test("GET /api/files/download/:id - 下载文件", async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/files/download/${uploadedFileId}`,
          { responseType: "text" }
        );
        expect(response.status).toBe(200);
        expect(response.data).toBe("测试文件内容");
      } catch (error) {
        throw new Error("文件下载失败: " + error.message);
      }
    });

    // 测试删除文件
    test("DELETE /api/files/:id - 删除文件", async () => {
      try {
        const response = await axios.delete(
          `${BASE_URL}/api/files/${uploadedFileId}`
        );
        expect(response.status).toBe(200);
        expect(response.data.code).toBe(200);
      } catch (error) {
        throw new Error("文件删除失败: " + error.message);
      }
    });

    // 测试错误情况
    describe("错误处理测试", () => {
      test("GET /api/files/download/:id - 下载不存在的文件", async () => {
        try {
          await axios.get(
            `${BASE_URL}/api/files/download/000000000000000000000000`
          );
          fail("应该抛出404错误");
        } catch (error) {
          expect(error.response.status).toBe(404);
          expect(error.response.data.code).toBe(404);
          expect(error.response.data.message).toBe("文件不存在");
        }
      });

      test("DELETE /api/files/:id - 删除不存在的文件", async () => {
        try {
          await axios.delete(`${BASE_URL}/api/files/000000000000000000000000`);
          fail("应该抛出404错误");
        } catch (error) {
          expect(error.response.status).toBe(404);
          expect(error.response.data.code).toBe(404);
          expect(error.response.data.message).toBe("文件不存在");
        }
      });

      test("POST /api/files/upload - 上传空文件", async () => {
        try {
          const formData = new FormData();
          await axios.post(`${BASE_URL}/api/files/upload`, formData, {
            headers: formData.getHeaders(),
          });
          fail("应该抛出400错误");
        } catch (error) {
          expect(error.response.status).toBe(500);
          expect(error.response.data.code).toBe(500);
          expect(error.response.data.message).toBeDefined();
        }
      });
    });
  });
});
