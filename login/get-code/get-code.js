const app = getApp()
let interval
clearInterval(interval)
Page({
  data: {
    inputFocus: true,
    inputCode: '',
    invitationCode: '',
    tel: null,
    countTime: null,
    inputCodeLength: 6,
    code: '', //微信code
    userLng: null,
    userLat: null,
    newRegister: null
  },
  onShow() {
    wx.login({
      success: res => {
        this.setData({
          code: res.code
        })
      }
    })
  },
  onLoad(e) {
    let countTime = Number(e.countTime)
    // 拿到手机号
    let str1 = e.tel.substring(0, 3)
    let str2 = e.tel.substring(3, 7)
    let str3 = e.tel.substring(7)
    this.setData({
      countTime,
      tel: str1 + ' ' + str2 + ' ' + str3,
      newRegister: app.globalData.newRegister
    })
    this.handleCountTime(countTime)
    // 是否授权地理位置
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userLocation']) {
          wx.getLocation({
            type: 'gcj02',
            success: res => {
              this.setData({
                userLng: res.longitude,
                userLat: res.latitude
              })
            }
          })
        }
      }
    })
  },
  getCode(event) {
    this.setData({
      inputCode: event.detail.value,
      inputFocus: event.detail.cursor !== this.data.inputCodeLength
    })
  },
  getInvitationCode(event) {
    this.setData({
      invitationCode: event.detail.value,
    })
  },
  handleCountTime(countTime) {
    // 清除定时器 从新计算
    clearInterval(interval)

    interval = setInterval(() => {
      if (countTime == 0) {
        // 计时完成
        clearInterval(this.interval)
        return
      }
      countTime--
      this.setData({
        countTime: countTime
      })
      // 赋值给全局时间
      app.globalData.countTime = this.data.countTime

      console.log(app.globalData.countTime, '倒计时时间')
    }, 1000)
  },
  /** 
   * 发送验证码
   */
  sendCode() {
    this.handleCountTime(61)
    app
      .$fetch(
        'SEND_PHONE', {
          phone: app.globalData.userTel
        }, {
          isHeaderTypeJson: true
        }
      )
      .then(res => {
        this.setData({
          inputCode: null,
          inputFocus: true
        },()=>{
          wx.showToast({
            title: '验证码已发送',
            icon: 'none'
          })
        })
      })
  },
  /**
   *注册并登陆
   */
  registerOkAndInfo(userInfo) {
    console.log('====userInfo====', userInfo)
    if (this.data.code) {
      // 用户授权成功
      if (userInfo.detail.errMsg == 'getUserInfo:ok') {
        this.getUserLoginAjax(true, userInfo)
        wx.setStorageSync('wxUserInfo', userInfo)
      } else {
        // 用户授权失败 静默调用login接口 不传递加密信息 用户登录成功(区别就是用户下次再进入小程序时还需要登录)
        this.getUserLoginAjax(false)
      }
      console.log(userInfo, '用户信息')
    }
  },
  /**
   *  调用微信login接口获取到code值
   */
  getUserLoginAjax(isOk, userInfo) {
    let data = {
      userPhone: app.globalData.userTel, //手机号
      userCode: this.data.inputCode, //短信验证码
      code: this.data.code //用户唯一标示
    }
    if (this.data.invitationCode) {
      data.invitationCode = this.data.invitationCode
    }

    // 用户地理位置
    if (this.data.userLat && this.data.userLng) {
      data.userLat = this.data.userLat
      data.userLng = this.data.userLng
    }
    if (app.globalData.mapParams) {
      Object.assign(data, app.globalData.mapParams)
    }
    if (isOk) {
      //授权成功 添加加密信息
      data.encode = {
        iv: userInfo.detail.iv,
        encryptedData: userInfo.detail.encryptedData
      }
    }
    app.$fetch('AUTH_LOGIN', data, {
      isHeaderTypeJson: true,
      loadingText: '请稍后...',
      noErrorHandler: true
    }).then(res => {
      if (res.code == '-1') {
        wx.login({
          success: res => {
            this.setData({
              code: res.code
            })
          }
        })
        // 验证码错误
        if (res.msg) {
          wx.showToast({
            icon: 'none',
            title: res.msg
          })
        } else {
          wx.showModal({
            content: '系统错误',
            showCancel: false,
            confirmText: '我知道了',
            success: () => {
              wx.navigateBack()
            },
          })
        }
      } else if (res.code == 0) {
        // 清除定时器
        clearInterval(interval)
        app.globalData.userTel = null
        // 把用户数据存储到本地
        try {
          wx.setStorageSync('userInfo', res.data)
          console.log('存储数据成功')
        } catch (e) {
          console.log('存储数据失败')
        }
        // 存储到公共信息
        app.globalData.userInfo = res.data
        wx.reLaunch({
          url: '/pages/home/home'
        })
      } else if (res.code == '730018') {
        // 如果调用失败 传一个code值 从新调用一下userLogin
        wx.login({
          success: res => {
            this.getUserLoginAjax(false, res.code)
          }
        })
      } else {
        wx.showModal({
          content: res.msg || '系统错误',
          showCancel: false,
          confirmText: '我知道了'
        })
      }
    })
  }
})