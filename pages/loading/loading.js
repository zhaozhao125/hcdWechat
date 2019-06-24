const app = getApp()
Page({
  data: {
    //控制progress
    count: 0, // 设置 计数器 初始为0
    countTimer: null, // 设置 定时器
    time: 60
  },
  onLoad: function(options) {
    // 处理充电
    setTimeout(() => {
      this.handleCharge()
    }, 2000)
    //绘制背景
    this.drawProgressbg();
    //开始progress
    this.startProgress()

    let time = this.data.time
    this.interval = setInterval(() => {
      this.setData({
        time
      })
      time--
      if (time < 0) {
        this.clear()
        wx.reLaunch({
          url: '/pages/item-details/item-details',
        })
        return
      }
    }, 1000)
  },
  /**
   * 画progress底部背景
   */
  drawProgressbg: function() {
    // 使用 wx.createContext 获取绘图上下文 context
    var ctx = wx.createCanvasContext('canvasProgressbg')
    // 设置圆环的宽度
    ctx.setLineWidth(2);
    // 设置圆环的颜色
    ctx.setStrokeStyle('#B4EEE6');
    // 设置圆环端点的形状
    ctx.setLineCap('round')
    //开始一个新的路径
    ctx.beginPath();
    //设置一个原点(110,110)，半径为100的圆的路径到当前路径
    ctx.arc(110, 110, 100, 0, 2 * Math.PI, false);
    //对当前路径进行描边
    ctx.stroke();
    //开始绘制
    ctx.draw();
  },
  /**
   * 画progress进度
   */
  drawCircle: function(step) {
    // 使用 wx.createContext 获取绘图上下文 context
    var context = wx.createCanvasContext('canvasProgress');
    // 设置圆环的宽度
    context.setLineWidth(8);
    // 设置圆环的颜色
    context.setStrokeStyle('#00C6CA');
    // 设置圆环端点的形状
    context.setLineCap('round')
    //开始一个新的路径
    context.beginPath();
    //参数step 为绘制的圆环周长，从0到2为一周 。 -Math.PI / 2 将起始角设在12点钟位置 ，结束角 通过改变 step 的值确定
    context.arc(110, 110, 98, -Math.PI / 2, step * Math.PI - Math.PI / 2, false);
    //对当前路径进行描边
    context.stroke();
    //开始绘制
    context.draw()
  },

  /**
   * 开始progress
   */
  startProgress: function() {
    if (this.data.time <= 0) {
      return
    }
    this.setData({
      count: 0
    });
    // 设置倒计时 定时器 每100毫秒执行一次，计数器count+1 ,耗时6秒绘一圈
    this.countTimer = setInterval(() => {
      if (this.data.count <= 60) {
        /* 绘制彩色圆环进度条  
        注意此处 传参 step 取值范围是0到2，
        所以 计数器 最大值 60 对应 2 做处理，计数器count=60的时候step=2
        */
        this.drawCircle(this.data.count / (60 / 2))
        this.data.count++;
      } else {
        clearInterval(this.countTimer);
        this.startProgress();
      }
    }, 1000)
  },
  handleCharge() {
    let chargeDetailData = app.globalData.chargeDetailData
    // 开始充电
    app.$fetch('CHARGE_START', {
      sn: chargeDetailData.sn,
      chargeStartWay: "QRCODE",
      operatorId: chargeDetailData.operatorId,
      userSn: wx.getStorageSync('userInfo').userId,
      formId: app.globalData.formId
    }, {
      loading: false,
      isHeaderTypeJson: true,
        noErrorHandler:true,
      complete: () => {
        this.clear()
      }
    }).then(res => {

      if (res.code == 0) {
        // 充电中订单界面
        wx.redirectTo({
          url: `/user-center/order/charging/charging?orderSn=${res.data.orderSn}`
        })
      } else {
        this.getCurrentPages(res.code, res.msg)
      }
    }).catch(err => {
      this.getCurrentPages(err.statusCode, '系统错误')
    })
  },
  clear() {
    clearInterval(this.countTimer)
    clearInterval(this.interval)
  },
  getCurrentPages: function(code, msg) {
    let pages = getCurrentPages(); //当前页面
    let prevPage = pages[pages.length - 2]; //上一页面
    prevPage.upPageInfo(code, msg)
    wx.navigateBack({
      delta: 1
    })
  }
})