const app = getApp()
Page({
  data: {
    orderData: {},
    chargingTime: '-'
  },
  onLoad: function(options) {
    this.setData({
      orderSn: options.orderSn
    })
    app.$fetch('GET_ORDER_DETAIL', {
      orderSn: this.data.orderSn
    }, {
      method: 'get',
      errorHandler: true
    }).then(res => {
      this.setData({
        orderData: res.data,
        chargingTime: this.getChargingTime(res.data.startTime, res.data.endTime)
      })
    })
  },
  getChargingTime(startTime, endTime) {
    let time = Math.floor((endTime - startTime) / 1000)
    let second = Math.floor(time % 60)
    let minite = Math.floor(time / 60) % 60
    let hour = Math.floor(time / 3600) % 60
    return (hour ? `${hour}小时` : '') + (minite ? `${minite}分钟` : '') + ((!hour && !minite) ? `${second}秒` : '')
  }
})