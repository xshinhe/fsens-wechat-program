// pages/peripheral/index/index.js
import BluetoothService from '../../../services/bluetoothService.js';

const bluetoothService = new BluetoothService();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPeripheralReady: false,      // 外围设备是否准备就绪
    isAdvertising: false,          // 是否正在广播
    services: [],                   // 服务列表
    characteristics: [],           // 特征列表
    receivedData: '',              // 接收到的数据
    isConnected: false,            // 是否已连接
    // 其他需要的数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.initializePeripheral();
  },

  /**
   * 初始化外围设备
   */
  async initializePeripheral() {
    try {
      await bluetoothService.initialize();
      this.setData({ isPeripheralReady: true });
      await this.createServices();
      await this.startAdvertising();
      bluetoothService.onReceivedData((data) => {
        this.setData({ receivedData: data });
      });
    } catch (error) {
      console.error('初始化外围设备失败:', error);
      wx.showToast({
        title: '初始化失败',
        icon: 'none'
      });
    }
  },

  /**
   * 创建服务和特征
   */
  async createServices() {
    const serviceUUID = '0000ABCD-0000-1000-8000-00805F9B34FB';
    const characteristicUUID = '0000BCDE-0000-1000-8000-00805F9B34FB';
    await bluetoothService.createService(serviceUUID, characteristicUUID);
    this.setData({
      services: bluetoothService.services,
      characteristics: bluetoothService.characteristics
    });
  },

  /**
   * 开始广播
   */
  async startAdvertising() {
    const serviceUUIDs = this.data.services.map(service => service.uuid);
    await bluetoothService.startAdvertising(serviceUUIDs);
    this.setData({ isAdvertising: true });
    wx.showToast({
      title: '开始广播',
      icon: 'success'
    });
  },

  /**
   * 停止广播
   */
  async stopAdvertising() {
    await bluetoothService.stopAdvertising();
    this.setData({ isAdvertising: false });
    wx.showToast({
      title: '停止广播',
      icon: 'success'
    });
  },

  /**
   * 切换广播状态
   */
  toggleAdvertising() {
    if (this.data.isAdvertising) {
      this.stopAdvertising();
    } else {
      this.startAdvertising();
    }
  },

  /**
   * 发送数据
   */
  sendData() {
    const data = 'Hello Central'; // 要发送的数据
    bluetoothService.sendData(data);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 停止广播并断开连接（根据需要）
    if (this.data.isAdvertising) {
      this.stopAdvertising();
    }
    bluetoothService.closeBluetoothAdapter();
  }
});