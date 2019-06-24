import {
  regeo
} from '../../services/geocode'
const app = getApp()
Page({
  data: {
    priceList: [],
    currentData: null
  },
  onLoad: function(options) {
    let carGenreId = options.carGenreId
    regeo(options.lng, options.lat).then(res => {
      console.log({
        areaCode: res.addressComponent.citycode,
        carGenreId: carGenreId || ''
      })
      console.log('====res====', res)
      app.$fetch('GET_TIME_SHARE_PRICE', {
        areaCode: res.addressComponent.citycode,
        carGenreId: carGenreId || ''
      }).then(priceData => {
        console.log('====priceData====', priceData)
        if (!priceData.data.length) {
          wx.showToast({
            title: '当前城市无计费信息',
            icon: 'none',
            duration: 3000
          })
          return
        }
        this.setData({
          priceList: priceData.data,
          currentData: priceData.data[0]
        })
      }).catch(err => {
        console.log('====err2====', err)
      })
    }).catch(err => {
      console.log('====err====', err)
    })
  },
  handleChange(event) {
    this.setData({
      currentData: this.data.priceList[event.detail.current]
    })
  }
})