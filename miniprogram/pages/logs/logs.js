// logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    logs: []
  },
  onLoad() {
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return {
          date: util.formatTime(new Date(log)),
          timeStamp: log
        }
      })
    })
    // this.appendLog("Tommy Debug")
  },
  cleanLog() {
    this.setData ({
      logs: []
    })
  },
  appendLog(newLog) {
    this.setData({
      logs: this.data.logs.push(newLog)
    })
  }
})
 