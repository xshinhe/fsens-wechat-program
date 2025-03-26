// pages/echarts/index.js
import * as echarts from '../../utils/ec-canvas/echarts';
const DynamicData = require('../../utils/dataManager');

Page({
  data: {
    ec: {
      onInit: 'initChart' // 使用字符串引用方法名
    }
  },
  chart: null,
  dataManager: new DynamicData(100),

  onLoad() {
    console.log("onLoad 方法被调用");
    // 模拟数据输入，每秒生成10个随机数据点
    setInterval(() => {
      console.log("setInterval 回调函数执行");
      const newData = Array.from({ length: 10 }, () => Math.random() * 100);
      const timestamp = Date.now(); // 获取当前时间戳（毫秒）
      newData.forEach(value => {
        const point = { x: timestamp, y: value };
        console.log('Adding data point:', point); // 添加日志
        this.dataManager.addData(point);
      });
      // 触发图表更新
      this.updateChart();
    }, 1000);
  },

  onReady() {
    console.log("onReady 方法被调用");
    // 获取 canvas 上下文
    const query = wx.createSelectorQuery().in(this);
    query.select('#mychart')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res) {
          console.error("无法获取 canvas 元素");
          return;
        }
        const canvas = res[0].node;
        if (!canvas) {
          console.error("Canvas 元素未找到");
          return;
        }
        const dpr = wx.getSystemInfoSync().pixelRatio;
        const rect = res[0].node.getBoundingClientRect();
        const width = rect.width * dpr;
        const height = rect.height * dpr;
        this.canvas = canvas;
        this.initChart(canvas, width, height, dpr);
      });
  },

  updateChart() {
    const chart = this.chart;
    if (!chart) {
      console.error("图表未初始化");
      return;
    }

    const points = this.dataManager.getData();
    if (points.length === 0) {
      console.warn("没有数据可更新");
      return;
    }

    // 提取 x 和 y 数据
    const xData = points.map(p => p.x);
    const yData = points.map(p => p.y);

    const option = {
      animation: false,
      grid: {
        left: '3%',
        right: '3%',
        top: '10%',
        bottom: '15%',
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          const param = params[0];
          const x = new Date(param.value[0]).toLocaleTimeString();
          const y = param.value[1].toFixed(2);
          return `${x} : ${y}`;
        }
      },
      xAxis: {
        type: 'time',
        boundaryGap: false,
        axisLabel: {
          formatter: function (value) {
            return new Date(value).toLocaleTimeString();
          }
        },
        splitLine: {
          show: true
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        }
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100
        },
        {
          start: 0,
          end: 100,
          handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.7,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
          handleSize: '80%',
          handleStyle: {
            color: '#fff',
            shadowBlur: 3,
            shadowColor: 'rgba(0, 0, 0, 0.6)',
            shadowOffsetX: 2,
            shadowOffsetY: 2
          }
        }
      ],
      series: [{
        name: '实时数据',
        type: 'line',
        smooth: true,
        data: yData,
        lineStyle: {
          color: '#00ff88',
          width: 2
        },
        areaStyle: {
          color: 'rgba(0,255,136,0.1)'
        }
      }]
    };
    chart.setOption(option);
  },

  initChart(canvas, width, height, dpr) {
    const chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: dpr
    });
    canvas.setChart(chart);
  
    var option = {
      title: {
        text: '测试下面legend的红色区域不应被裁剪',
        left: 'center'
      },
      legend: {
        data: ['A', 'B', 'C'],
        top: 50,
        left: 'center',
        backgroundColor: 'red',
        z: 100
      },
      grid: {
        containLabel: true
      },
      tooltip: {
        show: true,
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        // show: false
      },
      yAxis: {
        x: 'center',
        type: 'value',
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        }
        // show: false
      },
      series: [{
        name: 'y',
        type: 'line',
        smooth: true,
        data: [18, 36, 65, 30, 78, 40, 33]
      }]
    };
  
    chart.setOption(option);
    return chart;
  }
});