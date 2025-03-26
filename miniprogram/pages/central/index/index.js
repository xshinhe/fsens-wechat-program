// pages/central/central.js
import BluetoothService from '../../../services/bluetoothService.js';

const bluetoothService = new BluetoothService();

/**
 * 在数组中查找指定键的值
 * @param {Array} arr - 要搜索的数组
 * @param {string} key - 对象的键
 * @param {*} val - 要匹配的值
 * @returns {number} - 匹配项的索引，如果未找到则返回 -1
 */
const inArray = (arr, key, val) => {
  return arr.findIndex(item => item[key] === val);
};

Page({
  /**
   * 页面的初始数据
   */
  data: {
    devices_list: [],
    cangotop: false,
    max_device_number: 50,

    // 过滤配置
    filter_label: "显示过滤设置",
    isFilterHidden: true,
    filter_by_name: true,
    filter_by_addr: true,
    filter_by_rssi: true,
    filter_config: {
      min_rssi: -50
    },
    displayNameOnly: true,

    showToastBox: false,
    isDiscovering: false,
    showDetailAdvDevice: undefined
  },

  /**
   * 清空设备列表
   */
  cleanDevicesList() {
    this.setData({
      devices_list: []
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    try {
      await this.startDiscovery();
    } catch (error) {
      console.error('启动蓝牙设备发现失败:', error);
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // 可选：在此处添加额外的初始化逻辑
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 可选：在此处添加页面显示时的逻辑
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    // 可选：在此处添加页面隐藏时的逻辑
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 可选：在此处添加页面卸载时的清理逻辑
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // 可选：处理下拉刷新事件
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    // 可选：处理上拉触底事件
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    // 可选：自定义分享内容
    return {
      title: '分享蓝牙设备',
      path: '/pages/central/central'
    };
  },

  /* BLE相关操作 */
  async startDiscovery() {
    this.cleanDevicesList();
    bluetoothService.onBluetoothAdapterStateChange();
    bluetoothService.onBLEConnectionStateChange();

    await bluetoothService.closeBluetoothAdapter();
    bluetoothService.isDiscovering = false;
    const res = await bluetoothService.openBluetoothAdapter();
    if (res.ok) {
      bluetoothService.startBluetoothDevicesDiscovery((devices) => {
        devices.forEach(device => {
          if (this.data.filter_by_name) {
            const { RSSI, name } = device;
            if (RSSI === 0 || !name || name === "" || name === "undefined" || name.includes("未知或不支持的设备")) {
              return;
            }
          }

          const { deviceId } = device;
          let foundedDevices = [...this.data.devices_list];
          const idx = inArray(foundedDevices, 'deviceId', deviceId);

          if (idx === -1) {
            foundedDevices.push(device);
          } else {
            foundedDevices[idx] = device;
          }

          this.setData({
            devices_list: foundedDevices
          }, () => {
            console.log('devices_list 更新:', this.data.devices_list);
          });
        });
      });
      this.setData({ isDiscovering: true });
    } else {
      console.error('打开蓝牙适配器失败:', res);
    }
  },

  onPageScroll(e) {
    this.setData({
      cangotop: e.scrollTop > wx.getSystemSetting().windowHeight
    });
  },

  goTop() {
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      });
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低'
      });
    }
  },

  showDetailAdv(e) {
    const device = e.currentTarget.dataset.device;
    console.log("showDetailAdv:", device);
    this.setData({
      showDetailAdvDevice: device,
      showToastBox: !this.data.showToastBox
    });
  },

  doConnect(e) {
    console.log("Try to connect!");
    wx.navigateTo({
      url: '../service/service',
    });
  },

  doScan(e) {
    this.goTop();
    if (this.data.isDiscovering) {
      bluetoothService.stopBluetoothDevicesDiscovery();
      this.cleanDevicesList();
    } else {
      this.startDiscovery();
    }
    this.setData({
      isDiscovering: !this.data.isDiscovering
    });
  },

  setFilter(e) {
    console.log("setFilter");
    this.setData({
      isFilterHidden: !this.data.isFilterHidden
    });
    this.goTop();
  },

  sliderChanging(e) {
    console.log(e.detail.value);
    this.setData({
      filter_config: {
        ...this.data.filter_config,
        min_rssi: e.detail.value
      }
    });
  },

  toast_touch_move(e) {
    console.log("toast_touch_move");
  },

  toast_confirm(e) {
    this.setData({
      showToastBox: false
    });
  },

  switchChanged(e) {
    console.log(e);
    console.log(e.detail.value);
  },

  rssiDescend(e) {
    console.log("rssiDescend");
    const sortedDevices = this.data.devices_list.sort((a, b) => b.RSSI - a.RSSI);
    this.setData({
      devices_list: sortedDevices
    });
  }
});