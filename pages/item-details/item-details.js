const app = getApp()
import {
  relogin
} from './../../utils/request.js'
import {
  debounce
} from './../../utils/common.js'
Page({
  data: {
    isRefresh: false,
    detailData: null,
    qrcode: '',
    code: null,
    msg: null
  },
  /**
   * loading页回传数据
   */
  upPageInfo: function(code, msg) {
    this.setData({
      code,
      msg
    })
  },
  /**
   * 开始充电
   */
  charge: debounce(function(e) {
    if (!this.data.detailData.canStartCharge) {
      return
    }
    app.globalData.formId = e.detail.formId
    let userInfo = wx.getStorageSync('userInfo')
    if (userInfo && userInfo.userId) {
      app.$fetch('PRE_CHARGECHECK', {
        sn: this.data.detailData.sn,
        chargeStartWay: "QRCODE",
        operatorId: this.data.detailData.operatorId,
        userSn: wx.getStorageSync('userInfo').userId
      }, {
        isHeaderTypeJson: true,
        noErrorHandler: true,
        loadingText: '处理中...'
      }).then(res => {
        if (res.code == 0) {
          // 开始充电
          wx.navigateTo({
            url: '/pages/loading/loading',
          })
        } else {
          if (res.code == 552007) {
            wx.showModal({
              title: '余额不足',
              content: res.msg,
              showCancel: true,
              cancelText: '取消',
              confirmText: '充值',
              success: res => {
                if (res.confirm) {
                  // 跳转到充值界面
                  wx.navigateTo({
                    url: '/user-center/recharge/recharge',
                  })
                }
              }
            })
          } else {
            wx.showModal({
              content: res.msg || '系统错误',
              showCancel: false,
              confirmText: '我知道了',
              success: () => {
                wx.navigateBack()
              }
            })
          }
        }
      })
    } else {
      wx.navigateTo({
        url: '/login/get-code/get-code'
      })
    }
  }),
  refresh() {
    this.setData({
      isRefresh: true
    })
    wx.showNavigationBarLoading()
    app.$fetch('QR_CHARGE', {
      qrcode: app.globalData.qrcode
      // qrcode: 'aGxodDovLzY2NjYxMDEwMTAwMDEwMTkubGFuZGlhbg=='
    }, {
      loading: false
    }).then(res => {
      this.setData({
        detailData: res.data,
        // detailData: [res.data[0], res.data[0]],
        isRefresh: false
      })
      wx.hideNavigationBarLoading()
      wx.showToast({
        title: '刷新成功',
        icon: 'none',
        duration: 2000
      })
    }).catch(() => {
      this.setData({
        isRefresh: false
      })
    })
  },
  onShow: function() {
    let code = this.data.code
    let msg = this.data.msg
    if (code || msg) {
      wx.showModal({
        content: msg || '系统错误',
        showCancel: false,
        confirmText: '我知道了',
        success: (res) => {
          // 设备不存在
          if (code == 551009) {
            wx.reLaunch({
              url: '/pages/home/home'
            })
          } else {
            wx.navigateBack()
          }
        }
      })
    }
    app.$fetch('QR_CHARGE', {
      qrcode: app.globalData.qrcode
    }).then(res => {
        this.setData({
          detailData: res.data
        })
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    this.setData({
      code: null,
      msg: null
    })
  }
})