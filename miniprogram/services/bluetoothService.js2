// services/bluetoothService.js

class BluetoothService {
  constructor() {
    this.devices = []; // 存储搜索到的蓝牙设备
    this.services = {}; // 存储服务列表，键为deviceId
    this.characteristics = {}; // 存储特征列表，键为deviceId
    this.isScanning = false; // 是否正在扫描
    this.isConnecting = false; // 是否正在连接
    this.connectedDevice = null; // 当前连接的设备
    this.receivedDataCallbacks = {}; // 存储接收数据的回调函数，键为deviceId
    this.globalData = getApp().globalData; // 获取全局数据对象
    this.globalData.bluetoothState = false; // 初始化蓝牙适配器状态为未开启
    this.globalData.connectState = false; // 初始化蓝牙连接状态为未连接
    this.previousConnections = []; // 存储之前连接过的设备ID
    this.storageKey = 'previousConnections'; // 本地存储的键名
    this.loadPreviousConnections(); // 加载之前连接过的设备
  }

  /**
   * 初始化蓝牙服务
   */
  async initialize() {
    try {
      await this.openBluetoothAdapter();
      this.onBluetoothAdapterStateChange();
      this.onBLEConnectionStateChange();
      console.log('蓝牙适配器初始化成功');
      // await this.autoConnect(); // @todo
    } catch (error) {
      console.error('初始化蓝牙适配器失败:', error);
      throw error;
    }
  }

  /**
   * 等待指定的时间（以毫秒为单位）
   * @param {number} ms - 等待的时间（毫秒）
   * @returns {Promise} - 一个在指定时间后解决的Promise
   */
  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 加载之前连接过的设备
   */
  loadPreviousConnections() {
    const storedConnections = wx.getStorageSync(this.storageKey);
    if (storedConnections) {
      this.previousConnections = storedConnections;
      console.log('加载之前连接过的设备?:', this.previousConnections);
    }
  }

  /**
   * 保存之前连接过的设备
   */
  savePreviousConnections() {
    wx.setStorageSync(this.storageKey, this.previousConnections);
    console.log('保存之前连接过的设备:', this.previousConnections);
  }

  /**
   * 清除之前连接过的设备信息
   */
  clearPreviousConnections() {
    this.previousConnections = [];
    wx.removeStorageSync(this.storageKey);
    console.log('已清除之前连接过的设备信息');
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
          this.connectedDevice = null;
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
        // 可以在这里添加自动连接逻辑
      } else {
        this.globalData.bluetoothState = false;
        this.globalData.connectState = false;
        this.connectedDevice = null;
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
        this.connectedDevice = res.deviceId;
        console.log('蓝牙连接成功');
        wx.hideLoading();
        wx.showToast({
          title: '连接成功',
          icon: 'success',
        });
        this.reconnectAttempts = 0; // 重置重连尝试次数 @todo
      } else {
        this.globalData.connectState = false;
        console.log('蓝牙连接已断开');
        wx.hideLoading();
        wx.showToast({
          title: '连接已断开',
          icon: 'none',
        });
        // 如果是用户主动断开，则不进行自动重连 @todo
        if (res.deviceId === this.connectedDevice) {
          this.connectedDevice = null;
        }
      }
    });
  }

  /**
   * 自动连接之前连接过的设备
   */
  async autoConnect() {
    if (this.previousConnections.length === 0) {
      console.log('没有之前连接过的设备');
      return;
    }

    for (let deviceId of this.previousConnections) {
      try {
        await this.connect(deviceId);
        break; // 如果连接成功，则退出循环
      } catch (error) {
        console.error(`重新连接设备 ${deviceId} 失败:`, error);
      }
    }
  }

  /**
   * 开始搜索蓝牙设备
   * @returns {Promise}
   */
  async startBluetoothDevicesDiscovery() {
    if (this.isScanning) {
      console.warn('蓝牙设备搜索已经在进行中');
      return;
    }

    this.isScanning = true;

    return new Promise((resolve, reject) => {
      wx.startBluetoothDevicesDiscovery({
        allowDuplicatesKey: true,
        success: (res) => {
          wx.onBluetoothDeviceFound((res) => {
            this.devices = [...this.devices, ...res.devices];
            // 可以在这里添加去重逻辑
          });
          resolve({ ok: true, errCode: 0, errMsg: '' });
        },
        fail: (res) => {
          console.error('开始搜索蓝牙设备失败:', res);
          this.isScanning = false;
          reject(res);
        },
      });
    });
  }

  /**
   * 停止搜索蓝牙设备
   * @returns {Promise}
   */
  async stopBluetoothDevicesDiscovery() {
    if (!this.isScanning) {
      console.warn('蓝牙设备搜索未在进行中');
      return;
    }

    return new Promise((resolve, reject) => {
      wx.stopBluetoothDevicesDiscovery({
        success: (res) => {
          this.isScanning = false;
          console.log('停止搜索蓝牙设备');
          resolve({ ok: true, errCode: 0, errMsg: '' });
        },
        fail: (res) => {
          console.error('停止搜索蓝牙设备失败:', res);
          this.isScanning = false;
          reject(res);
        },
      });
    });
  }

  /**
   * 连接指定的蓝牙设备
   * @param {string} deviceId - 蓝牙设备的ID
   * @returns {Promise}
   */
  async connect(deviceId) {
    if (this.isConnecting) {
      console.warn('正在连接蓝牙设备');
      return;
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      wx.createBLEConnection({
        deviceId: deviceId,
        timeout: 10000, // 连接超时时间为10秒
        success: (res) => {
          this.isConnecting = false;
          this.connectedDevice = deviceId;
          this.globalData.connectState = true;
          console.log('蓝牙连接成功');
          // 保存连接信息
          if (!this.previousConnections.includes(deviceId)) {
            this.previousConnections.push(deviceId);
            this.savePreviousConnections();
          }
          resolve({ ok: true, errCode: 0, errMsg: '' });
        },
        fail: (res) => {
          this.isConnecting = false;
          console.error('连接蓝牙设备失败:', res);
          reject(res);
        },
      });
    });
  }

  /**
   * 断开与当前蓝牙设备的连接
   * @returns {Promise}
   */
  async disconnect() {
    if (!this.connectedDevice) {
      console.warn('没有连接的蓝牙设备');
      return;
    }

    return new Promise((resolve, reject) => {
      wx.closeBLEConnection({
        deviceId: this.connectedDevice,
        success: (res) => {
          this.globalData.connectState = false;
          this.connectedDevice = null;
          console.log('断开蓝牙连接成功');
          resolve({ ok: true, errCode: 0, errMsg: '' });
        },
        fail: (res) => {
          console.error('断开蓝牙连接失败:', res);
          reject(res);
        },
      });
    });
  }

  /**
   * 获取指定蓝牙设备的GATT服务列表
   * @param {string} deviceId - 蓝牙设备的ID
   * @returns {Promise}
   */
  async getServices(deviceId) {
    return new Promise((resolve, reject) => {
      wx.getBLEDeviceServices({
        deviceId: deviceId,
        success: (res) => {
          const services = res.services.filter((item) => {
            return !/^000018/.test(item.uuid);
          });
          this.services[deviceId] = services;
          resolve({ ok: true, errCode: 0, errMsg: '', data: services });
        },
        fail: (res) => {
          console.error('获取设备服务失败:', res);
          reject(res);
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
  async getCharacteristics(deviceId, serviceId) {
    return new Promise((resolve, reject) => {
      wx.getBLEDeviceCharacteristics({
        deviceId: deviceId,
        serviceId: serviceId,
        success: (res) => {
          this.characteristics[deviceId] = res.characteristics;
          resolve({ ok: true, errCode: 0, errMsg: '', data: res.characteristics });
        },
        fail: (res) => {
          console.error('获取设备特征值失败:', res);
          reject(res);
        },
      });
    });
  }

  /**
   * 监听蓝牙特征值变化
   * @param {string} deviceId - 蓝牙设备的ID
   * @param {function} callback - 回调函数，用于传递接收到的数据
   */
  onDataReceive(deviceId, callback) {
    wx.onBLECharacteristicValueChange((res) => {
      if (res.deviceId === deviceId) {
        let receiverText = this.buf2string(res.value);
        callback(receiverText);
      }
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
  async sendData(deviceId, serviceId, characteristicId, data) {
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

  /**
   * 自动连接之前连接过的设备
   */
  async autoConnect() {
    if (this.previousConnections.length === 0) {
      console.log('没有之前连接过的设备');
      return;
    }

    for (let deviceId of this.previousConnections) {
      try {
        await this.connect(deviceId);
        break; // 如果连接成功，则退出循环
      } catch (error) {
        console.error(`连接设备 ${deviceId} 失败:`, error);
      }
    }
  }
}

export default BluetoothService;