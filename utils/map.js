import request from './request.js'

export function navigation(latitude, longitude, name, address) {
  wx.openLocation({
    latitude: latitude,
    longitude: longitude,
    scale: 28,
    name: name
  })
}

export function isOpenSetting() {
  wx.showModal({
    title: '温馨提醒',
    content: '未授权地理位将无法充电，请进入设置页面开启授权',
    success: (res) => {
      if (res.confirm) {
        wx.openSetting()
      }
    }
  })
}