
Page({
  data: {
    priceInfo:[]
  },
  onLoad: function (options) {
    console.log(options)
    JSON.parse(decodeURIComponent(options.priceInfo))
    this.setData({
      priceInfo: JSON.parse(decodeURIComponent(options.priceInfo))
    })
  }
})