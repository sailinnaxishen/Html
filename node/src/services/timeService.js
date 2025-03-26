const ntpClient = require("ntp-client");
const config = require("../config");

// NTP服务器列表
const NTP_SERVERS = [
  "pool.ntp.org",
  "time.google.com",
  "time.windows.com",
  "time.apple.com",
];

// 本地时间校准
let timeOffset = 0;
let lastSyncTime = null;
let isCalibrated = false;

let lastNtpTime = null;
let lastOffset = 0;

/**
 * 从NTP服务器获取时间
 * @param {number} retries 重试次数
 * @param {number} timeout 超时时间（毫秒）
 * @returns {Promise<Date>} 返回NTP时间
 */
const getNTPTime = () => {
  return new Promise(async (resolve, reject) => {
    const servers = config.ntp.servers;

    for (const server of servers) {
      try {
        console.log(`尝试从 ${server} 获取时间...`);

        const result = await new Promise((resolveNtp, rejectNtp) => {
          ntpClient.getNetworkTime(
            server,
            123,
            (err, date) => {
              if (err) {
                rejectNtp(err);
                return;
              }

              const localTime = new Date();
              const offset = date.getTime() - localTime.getTime();

              resolveNtp({
                date,
                offset,
              });
            },
            { timeout: 5000 }
          ); // 增加超时时间到5秒
        });

        lastNtpTime = result.date;
        lastOffset = result.offset;

        console.log(`成功从 ${server} 获取时间，时间偏差: ${lastOffset}ms`);

        return resolve({
          ntpTime: lastNtpTime,
          offset: lastOffset,
        });
      } catch (error) {
        console.error(`从 ${server} 获取时间失败:`, error);
        continue;
      }
    }

    // 如果所有服务器都失败了，但有上次的时间，则返回上次的时间
    if (lastNtpTime) {
      return resolve({
        ntpTime: lastNtpTime,
        offset: lastOffset,
        isCache: true,
      });
    }

    reject(new Error("无法从任何NTP服务器获取时间"));
  });
};

// 获取校准后的本地时间
const getCalibratedTime = () => {
  const now = new Date();
  if (lastOffset) {
    now.setTime(now.getTime() + lastOffset);
  }
  return {
    time: now,
    isCalibrated: !!lastOffset,
  };
};

module.exports = {
  getNTPTime,
  getCalibratedTime,
};
