import {
  getSign
} from '../../utils/pay'
const app = getApp()
let payLock = false
Page({
  data: {
    rechargeList: [],
    currentIndex: 0,
    currentMoney: 0,
    userInput: '',
    userMoney: '-',
  },
  onLoad: function(options) {


    // 获取到活动金额
    app.$fetch('GET_RECHARGE_RULES', {}, {
      params: {
        userId: app.$getUser().userId
      },
      loading: false,
      method: 'get',
    }).then(res => {
      this.setData({
        rechargeList: res.data,
        currentMoney: res.data[this.data.currentIndex].stepAmount
      })
    })
    this.getMoney()
  },
  getMoney() {
    wx.showNavigationBarLoading()
    app.$fetch('GET_WALLET_INFO', {}, {
      params: {
        userId: app.$getUser().userId
      },
      loading: false
    }).then(res => {
      this.setData({
        userMoney: res.data.userMoney.toFixed(2)
      })
      wx.hideNavigationBarLoading()
    })
  },
  goToWalletDetail() {
    wx.navigateTo({
      url: '/user-center/wallet-detail/wallet-detail'
    })
  },
  handleSelectMoney(event) {
    console.log('====event====', event)
    let index = event.currentTarget.dataset.index
    this.setData({
      currentIndex: index,
      userInput: ''
    })
    this.setData({
      currentMoney: this.data.rechargeList[this.data.currentIndex].stepAmount
    })
  },
  handleInputFocus() {
    this.setData({
      currentIndex: 99
    })
  },
  handleInputBlur(event) {
    console.log('====event====', event.detail.value)
    setTimeout(() => {
      let value = event.detail.value
      if (this.data.currentIndex == 99) {
        if (!value || isNaN(value) || value <= 0) {
          wx.showToast({
            title: '只能输入大于0的数字',
            icon: 'none'
          })
          this.setData({
            currentIndex: -2,
            userInput: ''
          })
        } else if (String(value).split('.').length == 2 && String(value).split('.')[1].length > 2) {
          wx.showToast({
            title: '最多精确到小数点后两位',
            icon: 'none'
          })
          this.setData({
            currentIndex: -2,
            userInput: ''
          })
        } else {
          this.setData({
            currentMoney: value
          })
          this.currentIndex = 99
        }
      }
    }, 200)
  },
  handleRecharge() {
    if (!this.data.rechargeList.length) {
      wx.showToast({
        title: '加载中，请稍候...',
        icon: 'none',
        duration: 2000,
        mask: false
      })
      return
    }
    if (this.data.currentIndex == -2) {
      wx.showToast({
        title: '请选择金额',
        icon: 'none'
      })
      return
    }
    if (payLock) {
      return
    }
    payLock = true
    setTimeout(() => {
      console.log('====recharge====')
      let user = app.$getUser()
      // 充值类型（余额/保证金）
      app.$fetch('USER_BALANCE_RECHARGE', {
        paymentPluginId: 'weixinpayMobilePlugin',
        payerId: user.userId,
        amount: this.data.currentMoney,
        paymentType: 'balanceRecharge',
        paymentPluginExtras: JSON.stringify({
          "terminalFlag": "user_wx_miniapp"
        })
      }).then(res => {
        let params = {
          timeStamp: String(Math.floor(Date.now() / 1000)),
          nonceStr: res.data.parameters.noncestr,
          package: `prepay_id=${res.data.parameters.prepayid}`,
          signType: 'MD5'
        }
        params.paySign = getSign(params)
        console.log('====params====', params)
        Object.assign(params, {
          success: () => {
            console.log('====支付成功====')
            wx.showToast({
              title: '支付成功',
              icon: 'success',
              mask: true
            })
            this.getMoney()
            setTimeout(() => {
              wx.navigateBack()
            }, 1500)
          },
          fail: () => {
            console.log('====支付失败====')
            wx.showToast({
              title: '支付失败',
              icon: 'none'
            })
          },
          complete: () => {
            console.log('====支付完成====')
          }
        })
        wx.requestPayment(params)
      }).catch(err => {
        console.log('====err====', err)
      })
      payLock = false
    }, 200)
  }
})