/**
 * 命运塔数据分析看板 - 实时图表模块
 * Fate Tower Analytics Dashboard - Realtime Charts Module
 */

class RealtimeCharts {
  constructor(data) {
    this.data = data;
    this.charts = {};
    this.updateIntervals = {};
  }

  // 初始化实时在线人数图表
  initRealtimeOnlineChart(containerId) {
    const chartDom = document.getElementById(containerId);
    if (!chartDom) return;
    
    this.charts.online = echarts.init(chartDom);
    
    // 生成初始数据（最近60分钟）
    const initialData = this.generateInitialTimeSeries(60, 1000, 1500);
    
    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(22, 33, 62, 0.9)',
        borderColor: '#2d3748',
        textStyle: { color: '#fff' },
        formatter: (params) => {
          const time = params[0].axisValue;
          const value = params[0].value;
          return `${time}<br/>在线人数: ${value.toLocaleString()}`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: initialData.times,
        axisLine: { lineStyle: { color: '#4a5568' } },
        axisLabel: { 
          color: '#a0a0a0',
          formatter: (value) => value.slice(-5) // 只显示 HH:mm
        }
      },
      yAxis: {
        type: 'value',
        min: 800,
        max: 1600,
        axisLine: { lineStyle: { color: '#4a5568' } },
        axisLabel: { color: '#a0a0a0' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
      },
      series: [{
        name: '在线人数',
        type: 'line',
        smooth: true,
        symbol: 'none',
        sampling: 'average',
        itemStyle: { color: '#5470c6' },
        lineStyle: { width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(84, 112, 198, 0.5)' },
            { offset: 1, color: 'rgba(84, 112, 198, 0.05)' }
          ])
        },
        data: initialData.values
      }]
    };
    
    this.charts.online.setOption(option);
    
    // 开始实时更新
    this.startRealtimeUpdate(containerId, initialData);
    
    return this.charts.online;
  }

  // 生成初始时间序列数据
  generateInitialTimeSeries(minutes, min, max) {
    const times = [];
    const values = [];
    const now = new Date();
    
    for (let i = minutes; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60000);
      times.push(this.formatTime(time));
      values.push(Math.floor(min + Math.random() * (max - min)));
    }
    
    return { times, values };
  }

  // 格式化时间
  formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  // 开始实时更新
  startRealtimeUpdate(containerId, initialData) {
    let times = initialData.times;
    let values = initialData.values;
    
    this.updateIntervals.online = setInterval(() => {
      const now = new Date();
      const newTime = this.formatTime(now);
      
      // 模拟数据波动
      const lastValue = values[values.length - 1];
      const variation = Math.floor(Math.random() * 40) - 20;
      const newValue = Math.max(800, Math.min(1600, lastValue + variation));
      
      // 移除最旧的数据，添加新数据
      times.shift();
      times.push(newTime);
      values.shift();
      values.push(newValue);
      
      // 更新图表
      this.charts.online.setOption({
        xAxis: { data: times },
        series: [{ data: values }]
      });
      
      // 更新显示
      this.updateRealtimeDisplay(newValue);
    }, 5000); // 每5秒更新一次
  }

  // 更新实时显示
  updateRealtimeDisplay(value) {
    const display = document.getElementById('realtime-online-display');
    if (display) {
      display.textContent = value.toLocaleString();
      
      // 添加脉冲效果
      display.classList.add('pulse');
      setTimeout(() => display.classList.remove('pulse'), 500);
    }
  }

  // 初始化收入实时监控
  initRealtimeRevenueChart(containerId) {
    const chartDom = document.getElementById(containerId);
    if (!chartDom) return;
    
    this.charts.revenue = echarts.init(chartDom);
    
    // 每小时的收入数据
    const hours = Array.from({length: 24}, (_, i) => `${String(i).padStart(2, '0')}:00`);
    const todayData = this.data.revenueTrend.today.values;
    
    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(22, 33, 62, 0.9)',
        borderColor: '#2d3748',
        textStyle: { color: '#fff' },
        formatter: (params) => {
          let result = params[0].axisValue + '\n';
          params.forEach(p => {
            result += `${p.marker} ${p.seriesName}: ¥${p.value.toLocaleString()}\n`;
          });
          return result;
        }
      },
      legend: {
        data: ['实时收入', '预测收入'],
        textStyle: { color: '#a0a0a0' },
        top: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: hours,
        axisLine: { lineStyle: { color: '#4a5568' } },
        axisLabel: { color: '#a0a0a0' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#4a5568' } },
        axisLabel: { 
          color: '#a0a0a0',
          formatter: (value) => '¥' + (value / 1000) + 'k'
        },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
      },
      series: [
        {
          name: '实时收入',
          type: 'line',
          smooth: true,
          data: todayData,
          lineStyle: { color: '#fac858', width: 3 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(250, 200, 88, 0.3)' },
              { offset: 1, color: 'rgba(250, 200, 88, 0.05)' }
            ])
          },
          itemStyle: { color: '#fac858' }
        },
        {
          name: '预测收入',
          type: 'line',
          smooth: true,
          data: this.generateRevenueForecast(todayData),
          lineStyle: { color: '#73c0de', width: 2, type: 'dashed' },
          itemStyle: { color: '#73c0de' }
        }
      ]
    };
    
    this.charts.revenue.setOption(option);
    return this.charts.revenue;
  }

  // 生成收入预测
  generateRevenueForecast(historicalData) {
    const forecast = [...historicalData];
    const currentHour = new Date().getHours();
    
    // 基于历史趋势预测未来
    for (let i = currentHour + 1; i < 24; i++) {
      const yesterdayValue = this.data.revenueTrend.yesterday.values[i];
      const trendFactor = 1 + (Math.random() * 0.1 - 0.05); // ±5% 波动
      forecast[i] = Math.floor(yesterdayValue * trendFactor);
    }
    
    return forecast;
  }

  // 初始化实时用户来源地图
  initUserSourceMap(containerId) {
    const chartDom = document.getElementById(containerId);
    if (!chartDom) return;
    
    this.charts.source = echarts.init(chartDom);
    
    // 模拟各地区实时用户数据
    const regions = [
      { name: '北京', value: 234 },
      { name: '上海', value: 189 },
      { name: '广州', value: 156 },
      { name: '深圳', value: 145 },
      { name: '杭州', value: 123 },
      { name: '成都', value: 98 },
      { name: '武汉', value: 87 },
      { name: '西安', value: 76 },
      { name: '南京', value: 65 },
      { name: '重庆', value: 54 }
    ];
    
    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(22, 33, 62, 0.9)',
        borderColor: '#2d3748',
        textStyle: { color: '#fff' }
      },
      series: [{
        type: 'pie',
        radius: ['30%', '70%'],
        center: ['50%', '50%'],
        roseType: 'area',
        itemStyle: {
          borderRadius: 5,
          borderColor: '#16213e',
          borderWidth: 2
        },
        label: {
          show: true,
          color: '#a0a0a0',
          formatter: '{b}\n{c}人'
        },
        labelLine: {
          lineStyle: { color: '#4a5568' }
        },
        data: regions,
        color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', 
                '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#ff9f7f']
      }]
    };
    
    this.charts.source.setOption(option);
    
    // 模拟实时更新
    this.updateIntervals.source = setInterval(() => {
      const updatedData = regions.map(r => ({
        name: r.name,
        value: Math.max(50, r.value + Math.floor(Math.random() * 20) - 10)
      }));
      
      this.charts.source.setOption({
        series: [{ data: updatedData }]
      });
    }, 10000); // 每10秒更新
    
    return this.charts.source;
  }

  // 初始化关键指标仪表盘
  initGaugeChart(containerId, value, title, color) {
    const chartDom = document.getElementById(containerId);
    if (!chartDom) return;
    
    const chart = echarts.init(chartDom);
    
    const option = {
      backgroundColor: 'transparent',
      series: [{
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        splitNumber: 10,
        radius: '90%',
        center: ['50%', '70%'],
        itemStyle: {
          color: color || '#5470c6'
        },
        progress: {
          show: true,
          width: 20
        },
        pointer: {
          show: false
        },
        axisLine: {
          lineStyle: { 
            width: 20,
            color: [[1, 'rgba(255,255,255,0.1)']]
          }
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        title: {
          offsetCenter: [0, '-10%'],
          fontSize: 14,
          color: '#a0a0a0'
        },
        detail: {
          fontSize: 28,
          offsetCenter: [0, '10%'],
          valueAnimation: true,
          formatter: '{value}%',
          color: '#fff',
          fontWeight: 'bold'
        },
        data: [{
          value: value,
          name: title
        }]
      }]
    };
    
    chart.setOption(option);
    
    return chart;
  }

  // 初始化多仪表盘
  initMultipleGauges(containerIds) {
    const gauges = [
      { id: containerIds[0], value: 3.2, title: '付费率', color: '#5470c6' },
      { id: containerIds[1], value: 45.6, title: '7日留存', color: '#91cc75' },
      { id: containerIds[2], value: 35, title: '次日留存', color: '#fac858' },
      { id: containerIds[3], value: 68, title: '活跃度', color: '#ee6666' }
    ];
    
    gauges.forEach(g => {
      this.charts[g.id] = this.initGaugeChart(g.id, g.value, g.title, g.color);
    });
  }

  // 停止实时更新
  stopRealtimeUpdates() {
    Object.values(this.updateIntervals).forEach(interval => {
      clearInterval(interval);
    });
    this.updateIntervals = {};
  }

  // resize
  resize() {
    Object.values(this.charts).forEach(chart => {
      if (chart && chart.resize) {
        chart.resize();
      }
    });
  }

  // 销毁
  destroy() {
    this.stopRealtimeUpdates();
    Object.values(this.charts).forEach(chart => {
      if (chart && chart.dispose) {
        chart.dispose();
      }
    });
  }
}

// 全局实例
let realtimeCharts = null;

// 初始化实时图表
function initRealtimeCharts(data) {
  realtimeCharts = new RealtimeCharts(data);
  
  // 初始化各个图表
  realtimeCharts.initRealtimeOnlineChart('realtime-online-chart');
  realtimeCharts.initRealtimeRevenueChart('realtime-revenue-chart');
  realtimeCharts.initUserSourceMap('user-source-map');
  
  // 初始化仪表盘
  realtimeCharts.initMultipleGauges([
    'gauge-paidrate',
    'gauge-retention7d',
    'gauge-retention1d',
    'gauge-activity'
  ]);
  
  return realtimeCharts;
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RealtimeCharts;
}
