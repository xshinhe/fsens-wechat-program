// pages/central/central.js
// const mocking_device_lists = require('../../utils/mocking_data.js')
import { sdBLE } from '../../../utils/sdBLE.js';
let sdBLEObj = new sdBLE();

function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i;
    }
  }
  return -1;
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    devices_list: [],
    cangotop: false,

    //filter config
    filter_label: "显示过滤设置",
    isFilterHidden: true,
    filter_by_name: true,
    filter_by_addr: true,
    filter_by_rssi: false,
    min_rssi: -50,
    displayNameOnly:true,
  
    showToastBox: false,
    isDiscovering: false,
    showDetailAdvDevice: undefined
  },

  cleanDevicesList() {
    this.data.devices_list = []
    this.setData({
      devices_list: this.data.devices_list
    })  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    return

    for (let i = 0; i < 20; i++) {
      let device = {
        name: `Device ${i}`,
        addr: `AA:BB:CC:DD:EE:F${i % 0xf}`,
        rssi: `-${i}`,
        connectable: i % 2 == 0
      }
      this.data.devices_list.push(device)
    }
    this.setData({
      devices_list: this.data.devices_list
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  /* BLE相关操作 */
  async startDiscovery() {
    this.cleanDevicesList()
    sdBLEObj.onBluetoothAdapterStateChange()
    sdBLEObj.onBLEConnectionStateChange()

    await sdBLEObj.closeBluetoothAdapter();
    let res = await sdBLEObj.openBluetoothAdapter();
    if (res.ok) {
      // sdBLEObj.startBluetoothDevicesDiscovery((name, RSSI, deviceId) => {
      //   console.log(name, RSSI, deviceId)
      // })
      sdBLEObj.startBluetoothDevicesDiscovery((devices) => {
        // console.log("devices:", devices)
        devices.forEach(device => {
          // console.log(device.name, device.localName, device.RSSI)
          if (this.data.filter_by_name) {
            if (device.RSSI === 0 || device.name === "" || device.name === "undefined") {
              return
            }
          }

          let foundedDevices = this.data.devices_list
          const idx = inArray(foundedDevices, 'deviceId', device.deviceId)

          if (idx === -1) {
            foundedDevices[foundedDevices.length] = device
          } else {
            foundedDevices[idx] = device
          }
          this.setData({
            devices_list: foundedDevices
          })
        })
      })
    }
  },

  showActionSheet() {
    wx.showActionSheet({
      itemList: ['A', 'B', 'C'],
      success(res) {
        console.log(res.tapIndex)
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },

  onPageScroll: function(e) {
    //console.log("当前滚动距离:", e.scrollTop)
    this.setData({
      cangotop: e.scrollTop > wx.getSystemInfoSync().windowHeight ? true: false
    });
  },

  goTop: function(e) {
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低'
      })
    }
  },
  
  showDetailAdv: function(e) {
    console.log("showDetailAdv:", e)
    console.log(e.currentTarget.dataset.device)
    this.data.showDetailAdvDevice = e.currentTarget.dataset.device
    this.data.showToastBox = !this.data.showToastBox
    this.setData({
      showDetailAdvDevice: this.data.showDetailAdvDevice,
      showToastBox: this.data.showToastBox
    })
  },

  doConnect: function(e) {
    console.log("Try to connect!")
    wx.navigateTo({
      url: '../service/service',
    })
  },

  doScan: function(e) {
    console.log("doScan")
    this.goTop()
    if (this.data.isDiscovering) {
      sdBLEObj.stopBluetoothDevicesDiscovery()
    } else {
      this.startDiscovery()
    }
    this.data.isDiscovering = !this.data.isDiscovering
    this.setData({
      isDiscovering: this.data.isDiscovering
    })
  },

  setFilter: function(e) {
    console.log("setFilter")

    this.data.isFilterHidden = !this.data.isFilterHidden

    this.setData({
      isFilterHidden: this.data.isFilterHidden
    })    
    this.goTop()
  },

  sliderChanging: function(e) {
    console.log(e.detail.value)
    this.data.filter_config.min_rssi = e.detail.value
    this.setData({
      filter_config: this.data.filter_config
    })
  },

  toast_touch_move: function(e) {
    console.log("toast_touch_move")
  },

  toast_confirm: function(e) {
    this.setData({
      showToastBox: false
    })
  },

  switchChanged: function(e) {
    console.log(e)
    console.log(e.detail.value)
  },

  rssiDescend: function(e) {
    console.log("rssiDescend")
    this.data.devices_list.sort((a, b) => a.RSSI < b.RSSI ? 1 : a.RSSI > b.RSSI ? -1 : 0)

    this.setData({
      devices_list: this.data.devices_list
    })

    //console.log("devcies_list:", this.data.devices_list)
  }
})