Page({
  data: {
    url: ''
  },
  onLoad(option) {
    if (option.url) {
      this.setData({
        url: option.url
      })
    } else {
      wx.showToast({
        title: '请求出错',
        icon: 'none',
        duration: 3000,
        mask: true,
        success: () => {
          wx.navigateBack()
        }
      })
    }

  }
})