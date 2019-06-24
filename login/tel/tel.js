const app = getApp()
import {
  telRegExp,
  debounce
} from './../../utils/common.js'
Page({
  data: {
    telOk: false,
    inputValue: '',
    inputFocus: true,
    noJump: false
  },
  getTel(event) {
    telRegExp(event.detail.value, (telOk, inputValue) => {
      if (telOk) {
        this.setData({
          inputFocus: false
        })
      }
      this.setData({
        telOk,
        inputValue
      })
    })

  },
  clearInput() {
    this.setData({
      inputValue: '',
      telOk: false,
      inputFocus: true
    })
  },
  nextStep: debounce(function() {
    if (!this.data.telOk) {
      return
    }
    if (app.globalData.countTime == 0) {
      // 存储到公共变量中
      app.globalData.countTime = 60
      this.getSendCodeAjax()
    } else {
      // 手机号相同
      if (this.data.inputValue == app.globalData.userTel && !this.data.noJump) {
        console.log('=======手机号相同=========')
        wx.navigateTo({
          url: `/login/get-code/get-code?tel=${this.data.inputValue}&countTime=${app.globalData.countTime}`
        })
      } else {
        console.log('手机号不同')
        // 存储到公共变量中
        app.globalData.countTime = 60
        this.getSendCodeAjax()
      }
      app.globalData.userTel = this.data.inputValue
    }
  }),
  /**
   * 发送验证码
   */
  getSendCodeAjax() {
    app.$fetch('SEND_PHONE', {
      phone: this.data.inputValue
    }, {
      isHeaderTypeJson: true,
      loadingText: '验证码获取中...',
      noErrorHandler: true
    }).then(res => {
      if (res.code == app.globalData.ERR_OK) {
  
        this.setData({
          noJump: false
        })
        wx.navigateTo({
          url: `/login/get-code/get-code?tel=${this.data.inputValue}&countTime=60`,
          success:()=>{
            wx.showToast({
              title: '验证码已发送',
              icon: 'none'
            })
          }
        })
        // 是否是新用户
        app.globalData.newRegister = res.data.newRegister
      } else {
        this.setData({
          noJump: true
        })
        if (res.code == '-1') {
          app.globalData.userTel = null
          wx.showToast({
            icon: 'none',
            title: '短信请求过于频繁,请稍后再试'
          })
        }
      }
    })
  }
})