import * as echarts from '../../utils/ec-canvas/echarts';
const DynamicData = require('../../utils/dataManager');

Page({
  data: {
    ec1: {
      lazyLoad: true // 启用懒加载
    },
    ec2: {
      lazyLoad: true
    },
    tableData: [] // 存储表格显示数据
  },
  chart: null,
  dataManager: new DynamicData(30),

  // 新增数据到表格（在原有数据更新逻辑中添加）
  updateTableData(newData) {
    this.setData({
      tableData: this.dataManager.getData()
        .slice(-50) // 只显示最新50条
        .map(d => ({
          t: d.x,
          value: d.y
        }))
    });
  },

  // 导出CSV
  exportCSV() {
    const data = this.dataManager.getData();
    if (data.length === 0) {
      wx.showToast({ title: '无数据可导出', icon: 'none' });
      return;
    }

    // 构造CSV内容
    const csvContent = [
      '时间戳(t),数值(value)',
      ...data.map(d => `${d.x.toFixed(2)},${d.y.toFixed(2)}`)
    ].join('\n');

    // 写入临时文件
    const filePath = `${wx.env.USER_DATA_PATH}/sensor_data_${Date.now()}.csv`;
    wx.getFileSystemManager().writeFile({
      filePath,
      data: csvContent,
      encoding: 'utf8',
      success: () => {
        wx.saveFileToDisk({
          filePath,
          success: () => wx.showToast({ title: '导出成功' }),
          fail: () => wx.showToast({ title: '保存失败', icon: 'none' })
        });
      }
    });
  },

  // 清空数据
  clearData() {
    // this.dataManager.clear(); // todo
    this.setData({ tableData: [] });
    this.chart.clear();
    wx.showToast({ title: '数据已清空' });
  },

  // 将初始化方法移到Page内部
  initChart(canvas, width, height, dpr) {
    console.log("initChart 被调用");
    const chart = echarts.init(canvas, null, {
      width,
      height,
      devicePixelRatio: dpr
    });
    canvas.setChart(chart);

    const option = {
      animation: false,
      title: {
        text: '传感数据',
        left: 'center'
      },
      xAxis: {
        name: "时间",
        data: []
      },
      yAxis: {
        name: "信号强度",
        type: 'value',
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        }
      },
      series: [{
        name: "data",
        type: 'line',
        data: [],
      }]
    };

    chart.setOption(option);
    this.chart = chart; // 正确绑定到Page实例
    return chart;
  },

  onReady() {
    // 延迟确保组件渲染完成
    setTimeout(() => {
      this.initEChart('ec1', '#mychart-dom-test1');
      // 如果有第二个图表
      // this.initEChart('ec2', '#mychart-dom-test2');
    }, 500);
  },

  // 封装初始化逻辑
  initEChart(ecName, selector) {
    const ecComponent = this.selectComponent(selector);
    if (!ecComponent) {
      console.error('未找到图表组件');
      return;
    }

    ecComponent.init((canvas, width, height, dpr) => {
      return this.initChart(canvas, width, height, dpr);
    });
  },

  onLoad() {
    console.log("onLoad 方法被调用");
    
    // 定义初始时间 t0 为当前时间戳（毫秒）
    this.t0 = Date.now();  // 改为实例变量
    console.log("Initial t0:", this.t0);

    // 启动数据生成（注意：先于图表初始化开始）
    this.startDataGeneration();
  },

  onUnload() {
    // 清理定时器
    if (this.dataGenTimer) {
      clearInterval(this.dataGenTimer);
    }
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
  },

  // 新增数据生成方法
  startDataGeneration() {
    this.dataGenTimer = setInterval(() => {
      const currentTime = Date.now();
      const x = (currentTime - this.t0) / 1000;

      const newData = Array.from({ length: 1 }, () => ({
        x,
        y: Math.random() * 100
      }));

      newData.forEach(point => {
        this.dataManager.addData(point);
      });

      // 安全触发更新
      this.safeUpdateChart();
    }, 1000);
  },

  // 安全更新方法
  safeUpdateChart() {
    if (!this.chart) {
      console.log('图表尚未准备好，延迟更新');
      setTimeout(() => this.safeUpdateChart(), 100);
      return;
    }
    this.updateChart();
  },

  // 修改后的更新方法
  updateChart() {
    if (this.chart) {
      const data = this.dataManager.getData();
      const option = {
        xAxis: { data: data.map(d => d.x) },
        series: [{ data: data.map(d => d.y) }]
      };
      this.chart.setOption(option);
    }
    // this.updateTableData(); // 同步更新表格
  }
});
