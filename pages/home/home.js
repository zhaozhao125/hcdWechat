const app = getApp()
import {
  debounce,
  jumpPage
} from './../../utils/common.js'
import {
  relogin
} from './../../utils/request.js'
import {
  isOpenSetting
} from './../../utils/map.js'
let jumpLock = false
Page({
  data: {
    scale: 12,
    longitude: 113.601078,
    latitude: 34.795928,
    address: '',
    markers: [],
    orderSn: '', //订单
    orderStatus: '', //订单状态
    processingOrderCount: 0, //订单数量
    animationData: {}, //详情动画
    animationOrderData: {}, //订单动画
    chargeDetailData: {},
    activityData: {}
  },
  /**
   * 处理订单
   */
  handleOrder: debounce(function() {
    let orderSn = this.data.orderSn
    if (orderSn) {
      // 个人订单
      if (this.data.processingOrderCount == 1) {
        switch (this.data.orderStatus) {
          //充电中
          case 'CHARGING':
            jumpPage(`/user-center/order/charging/charging?orderSn=${orderSn}`)
            break
            //待支付
          case 'UN_PAY':
            jumpPage(`/user-center/order/paying/paying?orderSn=${orderSn}`)
            break
        }
      } else if (this.data.processingOrderCount > 1) {
        // 政企订单
        jumpPage(`/user-center/order/order-list/order-list?orderSn=${orderSn}`)
      }
    } else {
      wx.showModal({
        content: '订单不存在',
        showCancel: false,
        confirmText: '我知道了',
        success: () => {
          this.handleAnimationOrder(1000)
        }
      })
    }

  }),
  /**
   *拖动地图触发事件
   */
  removeCenterLocation: debounce(function(data) {
    if (data.type === 'end') {
      this.mapCtx.getCenterLocation({
        success: data => {
          this.setData({
            latitude: data.latitude,
            longitude: data.longitude
          })
        }
      })
    }
  }, 100),
  clearAddress: function() {
    this.addressInfo(false, true)
  },
  jumpActivityH5Page: debounce(function() {
    if (this.data.activityData.adUrl) {
      jumpPage(`/pages/h5-activity/h5-activity?url=${this.data.activityData.adUrl}`)
    }
  }),
  /**
   * 扫码
   */
  scan: debounce(function() {
    // 判断是否登陆
    let userInfo = this.data.userInfo
    if (userInfo && userInfo.userId) {
      app.$fetch('CHECK_CURRENTORDER', {
        uid: userInfo.userId
      }, {
        method: 'get',
        loadingText: '处理中...'
      }).then(res => {
        if (res.data.processingOrderCount == 1 || res.data.processingOrderCount > 1) {
          wx.showModal({
            content: `您有进行中的订单，不能再次充电`,
            showCancel: false,
            confirmText: '我知道了'
          })
        } else {
          // 开始扫码
          wx.scanCode({
            success: res => {
              let qrcode = res.rawData
              if (qrcode) {
                // 请求接口
                app.$fetch('QR_CHARGE', {
                  qrcode
                }, {
                  loadingText: '解析中...',
                  noErrorHandler: true
                }).then(res => {
                  if (res.code == 0) {
                    app.globalData.chargeDetailData = res.data
                    app.globalData.qrcode = qrcode
                    // 跳转到充电桩详情
                    wx.navigateTo({
                      url: `/pages/item-details/item-details`
                    })
                  } else {
                    wx.showModal({
                      title: '解析失败',
                      content: res.msg || '系统错误',
                      showCancel: false,
                      confirmText: '我知道了'
                    })
                  }
                })
              }
            }
          })
        }

      })
    } else {
      jumpPage('/login/tel/tel')
    }
  }),
  /**
   * 搜一搜
   */
  jumpChoiceAddress: debounce(function() {
    jumpPage(`/pages/search/search?longitude=${this.data.longitude}&latitude=${this.data.latitude}`)
  }),
  /**
   * 搜索页面传递数据
   */
  addressInfo: function(info, isClear) {
    if (isClear || info) {
      this.clearAnimation()
    }
    if (info) {
      this.setData({
        address: info.name,
        longitude: info.location.split(',')[0],
        latitude: info.location.split(',')[1],
        scale: 18
      })
    } else {
      this.setData({
        address: ''
      })
      this.moveToLocation()
    }
  },
  transitionendSuccess() {
    wx.hideLoading()
    console.log('=====动画完成====')
  },
  /**
   * 点击图标事件
   */
  clickMark: debounce(function(e) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let markers = this.data.markers
    let arr = e.markerId.split('&')
    markers.forEach(item => {
      if (item.id == e.markerId) {
        item.iconPath = `./img/select-${item.availableEquipmentNum ? 'has' : 'no'}-charge.png`
        item.width = 58
        item.height = 64
      } else {
        item.iconPath = this.markersDataReturn(item.availableEquipmentNum).iconPath
        item.width = this.markersDataReturn().width
        item.height = this.markersDataReturn().height
      }
    })
    this.setData({
      markers,
      latitude: arr[1],
      longitude: arr[2]
    })
    this.getUserLocation((lat, lng) => {
      // 站点详情
      app.$fetch('STATIONS_DETAIL', {
        id: arr[0],
        lat,
        lng
      }, {
        method: 'get',
        loading: false
      }).then(res => {
        if (JSON.stringify(this.data.animationData) != '{}') {
          wx.hideLoading()
        }
        this.animation.translateY(0).step()
        this.setData({
          chargeDetailData: res.data,
          animationData: this.animation.export()
        })

      })
    })
  }),
  clickMap: function() {
    let markers = this.data.markers
    markers.forEach(item => {
      item.iconPath = this.markersDataReturn(item.availableEquipmentNum).iconPath
      item.width = this.markersDataReturn().width
      item.height = this.markersDataReturn().height
    })
    this.setData({
      markers
    })
    this.clearAnimation()
  },

  clearAnimation() {
    this.animation.translateY(1000).step()
    this.setData({
      animationData: this.animation.export()
    })
    wx.nextTick(() => {
      this.setData({
        animationData: {}
      })
    })
  },
  /**
   * 获取到地理位置信息
   */
  getUserLocation(callBack) {
    wx.getLocation({
      type: 'gcj02',
      fail: () => {
        isOpenSetting()
      },
      success: res => {
        callBack(res.latitude, res.longitude)
      }
    })
  },
  /**
   * 跳转到充电站详情
   */
  jumpDetailPage: function() {
    let detailData = encodeURIComponent(JSON.stringify(this.data.chargeDetailData))
    //跳转到详情页面
    jumpPage(`/pages/charge-details/charge-details?detailData=${detailData}`)
  },
  /**
   * 跳转到用户中心
   */
  jumpUserCenter: function() {
    if (jumpLock) {
      return
    }
    jumpLock = true
    wx.navigateTo({
      url: '/user-center/index/index',
      complete: () => {
        jumpLock = false
      }
    })
  },
  /**
   * 重新定位
   */
  moveToLocation: debounce(function() {
    this.getUserLocation((latitude, longitude) => {
      this.setData({
        scale: 14,
        address: '',
        latitude,
        longitude
      })
      this.mapCtx.moveToLocation()
    })
  }),
  /**
   * 充电站ajax
   */
  getChargeAjax: function() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    app.$fetch('STATIONS_ALLINCITY', {}, {
      loading: false
    }).then(res => {
      wx.hideLoading()
      let markers = res.data.map(item => {
        return {
          id: `${item.stationId}&${item.lat}&${item.lng}`,
          latitude: item.lat,
          longitude: item.lng,
          iconPath: this.markersDataReturn(item.availableEquipmentNum).iconPath,
          width: this.markersDataReturn().width,
          height: this.markersDataReturn().height,
          availableEquipmentNum: item.availableEquipmentNum
        }
      })
      this.setData({
        markers
      })
    })
  },
  markersDataReturn: function(availableEquipmentNum) {
    return {
      width: 37,
      height: 40,
      iconPath: `./img/${availableEquipmentNum ? 'has' : 'no'}-charge.png`
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    this.mapCtx = wx.createMapContext('myMap')
    this.animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease-in'
    })
    this.getUserLocation((latitude, longitude) => {
      this.setData({
        latitude,
        longitude
      })
      this.getChargeAjax()
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let userInfo = wx.getStorageSync('userInfo')
    this.setData({
      userInfo
    })

    wx.showNavigationBarLoading()
    // 广告
    app.$fetch('SCROLLING_ADLIST', {}, {
      method: 'get',
      loading: false
    }).then(res => {
      if (res.data.length) {
        wx.hideNavigationBarLoading()
        this.setData({
          activityData: res.data[parseInt(Math.random() * res.data.length)]
        })
      }
    })
    // var return_value = array.push(dele_value);
    // 如果用户已经登陆
    if (userInfo && userInfo.userId) {
      // 显示导航信息
      app.$fetch('CHECK_CURRENTORDER', {
        uid: userInfo.userId
      }, {
        method: 'get',
        loading: false
      }).then(res => {
        wx.hideNavigationBarLoading()
        if (res.code == 0) {
          this.setData({
            orderStatus: res.data.orderStatus,
            orderSn: res.data.orderSn,
            processingOrderCount: res.data.processingOrderCount
          })

          this.handleAnimationOrder(res.data.orderStatus && res.data.orderStatus !== 'COMPLETED' ? 0 : 1000)
        } else {
          wx.showModal({
            content: '订单不存在',
            showCancel: false,
            confirmText: '我知道了',
            success: () => {
              this.handleAnimationOrder(1000)
            }
          })
        }
      })
    }
  },
  navigation: function() {
    wx.openLocation({
      scale: 25,
      latitude: parseFloat(this.data.chargeDetailData.lat),
      longitude: parseFloat(this.data.chargeDetailData.lng),
      name: this.data.chargeDetailData.stationName,
      address: this.data.chargeDetailData.address
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    this.handleAnimationOrder(1000, 20)
  },
  handleAnimationOrder(distance, time) {
    this.animationOrder = wx.createAnimation({
      duration: time || 500,
      timingFunction: 'ease'
    })
    this.animationOrder.translateX(distance)
    this.setData({
      animationOrderData: this.animationOrder.step()
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: '和充电',
      path: '/pages/home/home'
    }
  }
})