const express = require("express");
const router = express.Router();
const os = require("os-utils");

// 获取系统资源使用情况
router.get("/system-stats", async (req, res) => {
  try {
    // 获取CPU使用率
    const cpuUsage = await new Promise((resolve, reject) => {
      os.cpuUsage((usage) => {
        if (typeof usage === "number" && !isNaN(usage)) {
          resolve(usage);
        } else {
          reject(new Error("无效的CPU使用率数据"));
        }
      });
    });

    // 获取内存信息
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const freeMemPercentage = os.freememPercentage();
    // 计算已用内存百分比
    const usedMemPercentage = 1 - freeMemPercentage;

    // 验证内存数据
    if (totalMem <= 0 || freeMem < 0 || usedMem < 0) {
      throw new Error("无效的内存数据");
    }

    const stats = {
      cpu: {
        usage: cpuUsage,
        cores: os.cpuCount(),
        loadAvg: os.loadavg(1),
      },
      memory: {
        total: totalMem,
        free: freeMem,
        used: usedMem,
        freePercentage: freeMemPercentage,
        usedPercentage: usedMemPercentage,
      },
      uptime: os.sysUptime(),
      timestamp: new Date().toISOString(),
    };

    // 验证数据完整性
    if (!stats.cpu.cores || !stats.uptime) {
      throw new Error("系统数据不完整");
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("系统监控错误:", error);
    res.status(500).json({
      success: false,
      error: `获取系统状态失败: ${error.message}`,
    });
  }
});

module.exports = router;
