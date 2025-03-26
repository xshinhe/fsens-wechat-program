// services/bluetoothService.js

class BluetoothService {
  constructor() {
    this.devices = []; // 存储搜索到的蓝牙设备
    this.services = []; // 存储服务列表
    this.characteristics = []; // 存储特征列表
    this.isAdvertising = false; // 是否正在广播
    this.receivedData = ''; // 接收到的数据
    this.globalData = getApp().globalData; // 获取全局数据对象
    this.globalData.bluetoothState = false; // 初始化蓝牙适配器状态为未开启
    this.globalData.connectState = false; // 初始化蓝牙连接状态为未连接
  }

  /**
   * 初始化蓝牙服务
   */
  async initialize() {
    try {
      this.openBluetoothAdapter();
      this.onBluetoothAdapterStateChange();
      this.onBLEConnectionStateChange();
      console.log('蓝牙适配器初始化成功');
    } catch (error) {
      console.error('初始化蓝牙适配器失败:', error);
      throw error;
    }
  }

  /**
   * 等待指定的时间（以毫秒为单位）
   * @param {number} i - 等待的时间（毫秒）
   * @returns {Promise} - 一个在指定时间后解决的Promise
   */
  wait(i) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, i);
    });
  }
  
  /**
   * 初始化微信蓝牙适配器
   * @returns {Promise}
   */
  async openBluetoothAdapter() {
    return new Promise((resolve, reject) => {
      wx.openBluetoothAdapter({
        success: (res) => {
          this.globalData.bluetoothState = true;
          console.log('蓝牙适配器初始化成功');
          resolve({ ok: true, errCode: 0, errMsg: '' });
        },
        fail: (res) => {
          if (res.errMsg === 'openBluetoothAdapter:fail already opened') {
            this.globalData.bluetoothState = true;
            console.log('蓝牙适配器已经打开；直接返回');
            resolve({ ok: true, errCode: 0, errMsg: '' });
          } else {
            this.globalData.bluetoothState = false;
            console.error('初始化蓝牙适配器失败:', res);
            resolve({ ok: false, errCode: res.errCode, errMsg: res.errMsg });
          }
        },
      });
    });
  }

  /**
   * 关闭蓝牙适配器
   * @returns {Promise}
   */
  async closeBluetoothAdapter() {
    return new Promise((resolve, reject) => {
      wx.closeBluetoothAdapter({
        success: (res) => {
          this.globalData.bluetoothState = false;
          this.globalData.connectState = false;
          console.log('蓝牙适配器已关闭');
          resolve({ ok: true, errCode: 0, errMsg: '' });
        },
        fail: (res) => {
          console.error('关闭蓝牙适配器失败:', res);
          resolve({ ok: false, errCode: res.errCode, errMsg: res.errMsg });
        },
      });
    });
  }

  /**
   * 监听蓝牙适配器状态变化
   */
  onBluetoothAdapterStateChange() {
    wx.onBluetoothAdapterStateChange((res) => {
      if (res.available) {
        this.globalData.bluetoothState = true;
        console.log('蓝牙适配器已开启');
        // 可以在这里添加更多逻辑，如自动连接等
      } else {
        this.globalData.bluetoothState = false;
        this.globalData.connectState = false;
        console.log('蓝牙适配器已关闭');
      }
    });
  }

  /**
   * 监听BLE蓝牙连接状态变化
   */
  onBLEConnectionStateChange() {
    wx.onBLEConnectionStateChange((res) => {
      if (res.connected) {
        this.globalData.connectState = true;
        console.log('1212');
        console.log('蓝牙连接成功');
        wx.hideLoading();
        wx.showToast({
          title: '连接成功',
          icon: 'success',
        });
      } else {
        this.globalData.connectState = false;
        console.log('蓝牙连接已断开');
        wx.hideLoading();
        wx.showToast({
          title: '连接已断开',
          icon: 'none',
        });
      }
    });
  }

  /**
   * 开始搜索蓝牙设备
   * @param {function} callback - 回调函数，用于传递搜索到的设备信息
   */
  async startBluetoothDevicesDiscovery(callback) {
    if (this.isDiscovering) {
      console.warn('蓝牙设备搜索已经在进行中');
      return;
    }

    this.isDiscovering = true;

    try {
      await wx.startBluetoothDevicesDiscovery({
        allowDuplicatesKey: true,
        success: (res) => {
          wx.onBluetoothDeviceFound((res) => {
            callback(res.devices);
          });
        },
        fail: (res) => {
          console.error('开始搜索蓝牙设备失败:', res);
          throw res;
        },
      });
    } catch (error) {
      this.isDiscovering = false;
      throw error;
    }
  }

  /**
   * 停止搜索蓝牙设备
   * @returns {Promise}
   */
  async stopBluetoothDevicesDiscovery() {
    if (!this.discoveryLock) {
      console.warn('蓝牙设备搜索未在进行中');
      return;
    }

    try {
      await wx.stopBluetoothDevicesDiscovery({
        success: (res) => {
          this.discoveryLock = false;
          console.log('停止搜索蓝牙设备');
        },
        fail: (res) => {
          console.error('停止搜索蓝牙设备失败:', res);
          resolve({ ok: false, errCode: res.errCode, errMsg: res.errMsg });
          this.discoveryLock = false;
          throw res;
        },
      });
    } catch (error) {
      this.discoveryLock = false;
      throw error;
    }
  }

  /**
   * 开始连接指定的蓝牙设备
   * @param {string} deviceId - 蓝牙设备的ID
   * @param {string} deviceName - 蓝牙设备的名称（默认为“未知设备”）
   */
  startConnect(deviceId, deviceName = '未知设备') {
    wx.createBLEConnection({
      deviceId: deviceId,
      timeout: 10000, // 连接超时时间为10秒
      success: (res) => {
        wx.navigateTo({
          url: `/pages/service/service?deviceId=${deviceId}&deviceName=${deviceName}`,
        });
      },
      fail: (res) => {
        console.error('连接蓝牙设备失败:', res);
      },
    });
  }

  /**
   * 断开与指定蓝牙设备的连接
   * @param {string} deviceId - 蓝牙设备的ID
   */
  endConnect(deviceId) {
    wx.closeBLEConnection({
      deviceId: deviceId,
      success: (res) => {
        console.log('断开蓝牙连接成功');
      },
      fail: (res) => {
        console.error('断开蓝牙连接失败:', res);
      },
    });
  }

  /**
   * 获取指定蓝牙设备的GATT服务列表
   * @param {string} deviceId - 蓝牙设备的ID
   * @returns {Promise}
   */
  async getBLEDeviceServices(deviceId) {
    return new Promise((resolve, reject) => {
      wx.getBLEDeviceServices({
        deviceId: deviceId,
        success: (res) => {
          const services = res.services.filter((item) => {
            return !/^000018/.test(item.uuid);
          });
          this.services = services;
          resolve({ ok: true, errCode: 0, errMsg: '', data: services });
        },
        fail: (res) => {
          console.error('获取设备服务失败:', res);
          resolve({ ok: false, errCode: res.errCode, errMsg: res.errMsg });
        },
      });
    });
  }

  /**
   * 获取指定服务的蓝牙特征值列表
   * @param {string} deviceId - 蓝牙设备的ID
   * @param {string} serviceId - 服务的UUID
   * @returns {Promise}
   */
  async getBLEDeviceCharacteristics(deviceId, serviceId) {
    return new Promise((resolve, reject) => {
      wx.getBLEDeviceCharacteristics({
        deviceId: deviceId,
        serviceId: serviceId,
        success: (res) => {
          this.characteristics = res.characteristics;
          resolve({ ok: true, errCode: 0, errMsg: '', data: res.characteristics });
        },
        fail: (res) => {
          console.error('获取设备特征值失败:', res);
          resolve({ ok: false, errCode: res.errCode, errMsg: res.errMsg });
        },
      });
    });
  }

  /**
   * 监听蓝牙特征值变化
   * @param {function} callback - 回调函数，用于传递接收到的数据
   */
  onBLECharacteristicValueChange(callback) {
    wx.onBLECharacteristicValueChange((res) => {
      console.log('接收到蓝牙数据:', res);
      let receiverText = this.buf2string(res.value);
      this.receivedData = receiverText;
      callback(receiverText);
    });
  }

  /**
   * 向蓝牙设备发送数据
   * @param {string} deviceId - 蓝牙设备的ID
   * @param {string} serviceId - 服务的UUID
   * @param {string} characteristicId - 特征的UUID
   * @param {ArrayBuffer} data - 要发送的数据
   * @returns {Promise}
   */
  async writeBLECharacteristicValue(deviceId, serviceId, characteristicId, data) {
    return new Promise((resolve, reject) => {
      wx.writeBLECharacteristicValue({
        deviceId: deviceId,
        serviceId: serviceId,
        characteristicId: characteristicId,
        value: data,
        success: (res) => {
          console.log('发送数据成功');
          resolve({ ok: true, errCode: 0, errMsg: '' });
        },
        fail: (res) => {
          console.error('发送数据失败:', res);
          resolve({ ok: false, errCode: res.errCode, errMsg: res.errMsg });
        },
      });
    });
  }

  /**
   * 将Buffer转换为字符串
   * @param {ArrayBuffer} buffer - 要转换的Buffer
   * @returns {string} - 转换后的字符串
   */
  buf2string(buffer) {
    var arr = Array.prototype.map.call(new Uint8Array(buffer), (x) => x);
    return arr.map((char) => String.fromCharCode(char)).join('');
  }
}

export default BluetoothService;

