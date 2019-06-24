import request from './utils/request'
const __userInfo = wx.getStorageSync('userInfo')
App({
  globalData: {
    ERR_OK: '0',
    userTel: null,
    longitude: null,
    latitude: null,
    userInfo: __userInfo, //用户信息
    wxUserInfo: null, // 用户微信信息
    serviceOrderFeeInterval: null, //预定计时器
    isJumpHome: false, //是否跳回到主页
    scanCodeParams: null, //扫码进入小程序的参数
    mapParams: null, //地图传给登录的参数
    newRegister:null //是否是新用户
  },
  onLaunch(e) {
    // 监听userInfo的改变
    let userInfo = __userInfo
    Object.defineProperty(this.globalData, 'userInfo', {
      configurable: true,
      enumerable: true,
      get: function() {
        return userInfo
      },
      set: function(newVal) {
        if (newVal === userInfo) return
        userInfo = newVal
        wx.setStorageSync('userInfo', newVal)
      }
    })
  },
  onError(err) {
    console.log('脚本错误，或者 api 调用失败:', err)
  },
  onPageNotFound(path, query) {
    console.log('页面不存在路径:', path, '参数:', query)
    wx.reLaunch({
      url: '/pages/home/home',
    })
  },
  // 动态查询订单计费
  $fetch: request,
  $getUser() {
    let user = this.globalData.userInfo
    if (!user) {
      console.log('====getUser====')
      wx.redirectTo({
        url: '/login/tel/tel'
      })
      return
    }
    return user
  },
  $login() {
    console.log('====login====')
    wx.redirectTo({
      url: '/login/tel/tel'
    })
  },
  // 清除预定页面计时状态
  $clearReserveSetInterval() {
    clearInterval(this.globalData.serviceOrderFeeInterval)
  }
})