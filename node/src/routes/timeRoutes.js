const express = require("express");
const router = express.Router();
const timeService = require("../services/timeService");

// 获取NTP时间并校准
router.get("/ntp", async (req, res) => {
  try {
    const result = await timeService.getNTPTime();
    res.json({
      code: 200,
      message: "获取NTP时间成功",
      data: result,
    });
  } catch (error) {
    console.error("获取NTP时间失败:", error);
    res.status(500).json({
      code: 500,
      message: "获取NTP时间失败",
      error: error.message,
    });
  }
});

// 获取校准后的本地时间
router.get("/calibrated", (req, res) => {
  try {
    const result = timeService.getCalibratedTime();
    res.json({
      code: 200,
      message: "获取校准时间成功",
      data: result,
    });
  } catch (error) {
    console.error("获取校准时间失败:", error);
    res.status(500).json({
      code: 500,
      message: "获取校准时间失败",
      error: error.message,
    });
  }
});

module.exports = router;
