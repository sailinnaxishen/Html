const ntpClient = require("ntp-client");

class TimeController {
  async getNTPTime(req, res) {
    try {
      ntpClient.getNetworkTime("ntp.aliyun.com", 123, (err, date) => {
        if (err) {
          console.error("获取NTP时间失败:", err);
          return res.status(500).json({
            code: 500,
            message: "获取时间失败",
          });
        }

        const timeData = {
          timestamp: date.getTime(),
          date: date.toISOString(),
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate(),
          hours: date.getHours(),
          minutes: date.getMinutes(),
          seconds: date.getSeconds(),
          milliseconds: date.getMilliseconds(),
        };

        res.json({
          code: 200,
          data: timeData,
        });
      });
    } catch (error) {
      console.error("时间服务错误:", error);
      res.status(500).json({
        code: 500,
        message: "时间服务错误",
      });
    }
  }
}

module.exports = new TimeController();
