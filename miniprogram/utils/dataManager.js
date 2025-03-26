// utils/dataManager.js

class DynamicData {
  constructor(maxLength = 100) {
    this.data = []; // 存储数据点的数组
    this.maxLength = maxLength; // 数据集的最大长度
  }

  /**
   * 添加新数据（支持单个对象或对象数组）
   * @param {Object|Object[]} newPoints - 新的数据点或数据点数组
   */
  addData(newPoints) {
    if (Array.isArray(newPoints)) {
      newPoints.forEach(point => {
        this.data.push(point);
        // 保持数据长度
        if (this.data.length > this.maxLength) {
          this.data.shift();
        }
      });
    } else {
      this.data.push(newPoints);
      // 保持数据长度
      if (this.data.length > this.maxLength) {
        this.data.shift();
      }
    }
  }

  /**
   * 获取当前数据集的副本
   * @returns {Object[]} - 当前数据点的数组副本
   */
  getData() {
    return [...this.data]; // 返回副本以保证数据安全
  }
}

module.exports = DynamicData;