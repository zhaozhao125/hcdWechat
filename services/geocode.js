/**
 * 根据经纬度获取地理位置信息
 * @param {Number} lng 经度
 * @param {Number} lat 维度
 */
export function regeo(lng, lat) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://restapi.amap.com/v3/geocode/regeo',
      method: 'get',
      data: {
        key: '70fd36511c07726f586e413f495c0103',
        location: [lng, lat].join(',')
      },
      success: (res) => {
        if (res.errMsg == 'request:ok' && res.data.regeocode) {
          resolve(res.data.regeocode)
        } else {
          reject(new Error(res.data.info))
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

/**
 * 根据当前位置获取地理信息
 */
export function getCurrentCity() {
  wx.showLoading({
    title: '加载中...'
  })
  return new Promise((resolve, reject) => {
    wx.getLocation({
      // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于wx.openLocation的坐标
      type: 'gcj02',
      success: (res) => {
        regeo(res.longitude, res.latitude).then(city => {
          resolve(city)
        }).catch(err => {
          reject(err)
        }).then(() => {
          wx.hideLoading()
        })
      },
      fail: (err) => {
        reject(err)
        wx.hideLoading()
      }
    })
  })
}