import {
  debounce
} from './../../utils/common.js'
const SEARCH_MAX_LEN = 10
Page({
  data: {
    pois: [],
    inputAddress: '',
    isRequest: false,
    isHistoryRecord: false,
    longitude: '',
    latitude: ''
  },
  /**
   * 选择地址
   */
  choiceAddress: function(e) {
    let info = e.currentTarget.dataset.info
    let searches = wx.getStorageSync('addressInfo')
    if (searches && searches.length) {
      this.insertArray(searches, info, item => {
        return item.id === info.id
      }, SEARCH_MAX_LEN)
      wx.setStorageSync('addressInfo', searches)
    } else {
      wx.setStorageSync('addressInfo', [info])
    }
    this.prevPageInfo(info)
  },
  /**
   * 导航
   */
  navigation: function(e) {
    let deg = e.currentTarget.dataset.info.location.split(',')
    wx.openLocation({
      scale: 25,
      latitude: parseFloat(deg[1]),
      longitude: parseFloat(deg[0]),
      name: e.currentTarget.dataset.info.name,
      address: e.currentTarget.dataset.info.address
    })
  },
  /**
   * 处理主页面数据
   */
  prevPageInfo: function(info) {
    let pages = getCurrentPages(); //当前页面
    let prevPage = pages[pages.length - 2]; //上一页面
    wx.navigateBack({
      success: () => {
        prevPage.addressInfo(info)
      }
    })
  },
  /**
   * 输入地址
   */
  inputAddressName: debounce(function(e) {
    this.setData({
      inputAddress: e.detail.value
    })
    if (!e.detail.cursor) {
      this.setData({
        pois: wx.getStorageSync('addressInfo')
      })
      return
    }
    wx.request({
      url: 'https://restapi.amap.com/v3/place/around',
      method: 'get',
      data: {
        key: 'dff88e95aa96af9b002f6a4c1255fd35',
        location: [this.data.longitude, this.data.latitude].join(','),
        keywords: e.detail.value
      },
      success: res => {
        if (res.errMsg == 'request:ok') {
          this.setData({
            pois: res.data.pois,
            isRequest: true
          })
        } else {
          this.handleErr()
        }
      },
      fail: err => {
        this.handleErr()
      }
    })
  }, 300, false),
  handleErr() {
    wx.showModal({
      content: '系统错误',
      showCancel: false,
      confirmText: '我知道了',
      success: () => {
        wx.navigateBack()
      }
    })
  },
  /**
   * 取消输入
   */
  cancel: function() {
    this.setData({
      pois: [],
      inputAddress: ''
    })
    this.prevPageInfo()

  },
  /**
   * 处理历史数据
   * @parames(存储的数组,存储的值,比较函数,最大值)
   */
  insertArray: function(arr, val, compare, maxLen) {
    const index = arr.findIndex(compare)
    console.log(index, 'index')
    if (index === 0) {
      return
    }
    if (index > 0) {
      arr.splice(index, 1)
    }
    arr.unshift(val)
    if (maxLen && arr.length > maxLen) {
      arr.pop()
    }
  },
  onLoad: function(options) {
    let pois = wx.getStorageSync('addressInfo')
    if (pois && pois.length) {
      this.setData({
        isHistoryRecord: true
      })
    }
    this.setData({
      pois,
      longitude: options.longitude || '113.601078',
      latitude: options.latitude || '34.795928'
    })
  }
})