import {
  hidePhone
} from '../../utils/common'
const app = getApp()
Page({
  data: {
    userPhone: '',
    userMoney: '-',
    userAvatar: '/assets/imgs/head.png',
  },
  onLoad() {
    let wxUser = wx.getStorageSync('wxUserInfo')
    if (wxUser) {
      this.setData({
        userAvatar: wxUser.detail.userInfo.avatarUrl || this.data.userAvatar
      })
    }
  },
  onShow: function() {
    wx.showNavigationBarLoading()
    let user = app.$getUser()
    this.setData({
      userPhone: hidePhone(user.userPhone)
    })
    app.$fetch('GET_USER_INFO', {
      userId: user.userId
    }, {
      type: 'json',
      loading: false
    }).then(res => {
      console.log('====user====', res)
    })
    app.$fetch('GET_WALLET_INFO', {}, {
      params: {
        userId: user.userId
      },
      loading: false
    }).then(res => {
      wx.hideNavigationBarLoading()
      this.setData({
        userMoney: res.data.userMoney.toFixed(2)
      })
    })
  },
  goToCoupon() {
    wx.navigateTo({
      url: '/user-center/coupon/coupon?pageSource=userCenter'
    })
  },
  goToProtocol() {
    wx.navigateTo({
      url: '/user-center/protocol/protocol'
    })
  },
  goToWallet() {
    wx.navigateTo({
      url: '/user-center/recharge/recharge'
    })
  },
  goToOrder() {
    wx.navigateTo({
      url: '/user-center/order/order-list/order-list'
    })
  },
  logout() {
    wx.showModal({
      content: '确定退出？',
      success: (e) => {
        console.log('====asdasd====', e)
        if (e.confirm) {
          app.$clearReserveSetInterval()
          wx.removeStorageSync('userInfo')
          wx.removeStorageSync('wxUserInfo')
          wx.reLaunch({
            url: '/login/tel/tel'
          })
        }
      }
    })
  }
})