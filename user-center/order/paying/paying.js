const app = getApp()
import {
  getSign
} from '../../../utils/pay'
let payLock = false
Page({
  data: {
    orderData: {},
    couponCount: '',
    noUseCoupon: false,
    couponsName: '',
    userCouponId: ''
  },
  onLoad: function(options) {
    let orderSn = options.orderSn
    this.setData({
      orderSn
    })
    // 查询优惠券数量
    app.$fetch('USER_COUNT_COUPONS', {
      orderSn
    }, {
      loading: false
    }).then(res => {
      this.setData({
        couponCount: res.data.count
      })
    })
    this.getPayInfo()
  },
  jumpCoupon() {
    if (this.data.couponCount) {
      wx.navigateTo({
        url: `/user-center/coupon/coupon?pageSource=paying&orderSn=${this.data.orderData.orderSn}`
      })
    } else {
      wx.showToast({
        title: '暂无可用优惠券',
        icon: 'none'
      })
    }
  },
  getPayInfo(userCouponId) {
    let param = {
      orderSn: this.data.orderSn
    }
    if (userCouponId) {
      param.userCouponId = userCouponId
    }
    app.$fetch('GET_ORDER_PAY_INFO', param).then(res => {
      this.setData({
        orderData: res.data
      })
    })
  },
  /**
   *  选择优惠券页面传递过来的数据
   */
  getUseCoupon(noUseCoupon) {
    if (noUseCoupon) {
      this.setData({
        couponsName: '',
        userCouponId: ''
      })
    }
    this.setData({
      noUseCoupon
    })
    this.getPayInfo()
  },
  getChoiseCoupon(data) {
    this.setData({
      couponsName: data.couponsName,
      userCouponId: data.userCouponId
    })
    this.getPayInfo(data.userCouponId)
  },
  clickPaying() {
    wx.showLoading({
      title: '支付中...',
      mask: true
    })
    let params = {
      orderSn: this.data.orderSn,
      payWay: 'WALLET'
    }
    if (this.data.userCouponId) {
      params.userCouponId = this.data.userCouponId
    }
    app.$fetch('ORDER_PAY', params, {
      loading: false,
      noErrorHandler: true
    }).then(res => {
      wx.hideLoading()
      if (res.code == 0) {
        wx.showToast({
          title: '支付成功',
          mask: true
        })
        delete app.globalData.noUseCoupon
        delete app.globalData.currentCouponIndex
        wx.redirectTo({
          url: `/user-center/order/order-finished/order-finished?orderSn=${this.data.orderSn}`
        })
      } else if (res.code == 100010) {
        wx.showModal({
          content: res.msg || '余额不足',
          showCancel: true,
          confirmText: '去充值',
          success: suc => {
            if (suc.confirm) {
              // 跳转到充值界面
              wx.redirectTo({
                url: '/user-center/recharge/recharge'
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
    })
  }
})