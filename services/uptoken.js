const app = getApp()
export default function getUpToken() {
  return new Promise((resolve, reject) => {
    let uptoken = wx.getStorageSync('uptoken')
    if (uptoken && (Date.now() - uptoken.lastTokenTime < 3500 * 1000)) {
      resolve(uptoken.token)
    } else {
      app.$fetch('GET_UP_TOKEN', {}, {
        params: {
          bucket: 'api-autoaudit'
        },
        method: 'get'
      }).then(res => {
        let token = res.data.token
        if (token) {
          wx.setStorageSync('uptoken', {
            token: token,
            lastTokenTime: Date.now()
          })
          resolve(token)
        } else {
          reject(new Error(res.msg))
        }
      }).catch(err => {
        reject(err)
      })
    }
  })
}