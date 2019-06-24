import {
  debounce
} from './../../utils/common.js'
Page({
  data: {
    detailData: null,
    imgUrls: [],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000
  },
  /**
   * 客服电话
   */
  service(e) {
    console.log(e.currentTarget.dataset.telephone)
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.telephone 
    })
  },
  lookMore:debounce(function(e){
    wx.navigateTo({
      url: `/pages/price-details/price-details?priceInfo=${encodeURIComponent(JSON.stringify(e.currentTarget.dataset.priceinfo))}`
    })
  }),
  onLoad: function(options) {
    let detailData = JSON.parse(decodeURIComponent(options.detailData))
    let imageArray = detailData.imageArray
    this.setData({
      detailData,
      imgUrls: imageArray.length ? imageArray : ['./img/no-data.png'],
      indicatorDots: imageArray.length
    })
  },
  /**
   * 导航
   */
  navigation: function() {
    wx.openLocation({
      scale: 25,
      latitude: parseFloat(this.data.detailData.lat),
      longitude: parseFloat(this.data.detailData.lng),
      name: this.data.detailData.stationName,
      address: this.data.detailData.address
    })
  },
  /**
   * 网点详情ajax
   */
  getDetailAjax: function(id, loading) {
    if (!loading) {
      wx.showNavigationBarLoading()
    }
    getApp().$fetch('STATIONS_DETAIL', {
      id
    }, {
      loading,
      method: 'get'
    }).then(res => {
        this.setData({
          detailData: res.data,
          imgUrls: res.data.imageArray.length ? res.data.imageArray : [
            './no-data.png'
          ],
          indicatorDots: res.data.imageArray.length
        })
      if (!loading) {
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
      }

    })
  }
})