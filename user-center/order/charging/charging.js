const app = getApp()
let refreshTimer = null
Page({
  data: {
    orderSn: '',
    chargingData: {},
    chargingTime: '-'
  },
  onLoad: function(options) {
    this.setData({
      orderSn: options.orderSn
    })
    this.loadData(true)
    refreshTimer = setInterval(() => {
      this.loadData()
    }, 10 * 1000)
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    if (refreshTimer) {
      clearInterval(refreshTimer)
    }
  },
  loadData(loading = false) {
    app.$fetch('GET_CHARGING_STATUS', {
      orderSn: this.data.orderSn
    }, {
      method: 'get',
      loading,
        noErrorHandler:true
    }).then(res => {
      console.log('====res====', res)
      if (res.code == '0') {
        this.setData({
          chargingData: res.data,
          chargingTime: this.getChargingTime(res.data.startTime, res.data.endTime)
        })
      } else if (res.code == '552012') {
        wx.redirectTo({
          url: `/user-center/order/paying/paying?orderSn=${this.data.orderSn}`
        })
      } else {
        wx.showToast({
          title: err.msg || `请求出错 状态码:${err.code}`,
          icon: 'none'
        })
      }
    }).catch(err => {
      console.log('====err====', err)
    })
  },
  handleFinishCharging() {
    wx.showModal({
      title: '确定要结束充电吗？',
      content: '结束充电后，请尽快拔枪喔~',
      success: (action) => {
        console.log('====action====', action)
        if (action.confirm) {
          console.log('====结束====')
          app.$fetch('STOP_CHARGIN', {
            orderSn: this.data.orderSn
          }, {
            method: 'get',
            errorHandler: true
          }).then(res => {
            wx.redirectTo({
              url: `/user-center/order/paying/paying?orderSn=${this.data.orderSn}`
            })
          }).catch(err => {
            console.log('====err====', err)
          })
        }
      }
    })
  },
  getChargingTime(startTime, endTime) {
    let time = Math.floor((endTime - startTime) / 1000)
    let second = time % 60
    let minite = Math.floor(time / 60) % 60
    let hour = Math.floor(time / 3600)
    return (hour ? `${hour}小时` : '') + (minite ? `${minite}分钟` : '') + ((!hour && !minite) ? `${second}秒` : '')
  }
})