import api from '../services/api/api.js'
import md5 from './crypto-js/md5'
import {
  baseURL
} from '../config/index.js'

export function relogin(loading, callback) {
  wx.login({
    success: info => {
      request(
        'SIMPLE_LOGIN', {
          code: info.code
        }, {
          loading,
          noErrorHandler: true
        }
      ).then(res => {
        console.log(res, '===========登录=============')
        //  请注册或登录
        if (res.code === '-1') {
          console.log('====relogin====')
          wx.redirectTo({
            url: '/login/tel/tel'
          })
        } else {
          // 存储到公共信息
          // 当用户登录一次之后 清除数据 校验code之后还能登录
          // 还要存储一下数据
          getApp().globalData.userInfo = res.data
          wx.setStorageSync('userInfo', res.data)
          callback(res.data.userId)
        }
      })
    }
  })
}

function fillParams(url, params) {
  if (!url || !params) {
    return null
  }
  return url
    .split('/')
    .map(item => {
      if (item.match(':')) {
        let paramName = item.replace(':', '')
        return params[paramName]
      }
      return item
    })
    .join('/')
}

function hideLoding() {
  wx.hideNavigationBarLoading()
  wx.hideLoading()
  wx.stopPullDownRefresh()
}
/**
 *
 * @param {String} url 请求URL变量名
 * @param {Object} data 请求参数
 * @param {Object} config 请求配置
 */
export default function request(url, data = {}, config = {}) {
  let getUrl = api[url]
  if (!getUrl) {
    return new Promise((resolve, reject) => {
      reject(new Error('找不到请求URL'))
    })
  }
  let configBak = Object.assign({}, config)
  if (config.params) {
    getUrl = fillParams(getUrl, config.params)
  }
  let userInfo = wx.getStorageSync('userInfo')
  // 拼接sign值
  let sign = ''
  if (userInfo && userInfo.accessToken) {
    let paramStr = ''
    if (typeof data === 'object') {
      if (
        config.isHeaderTypeJson ||
        (config.type && config.type.toLocaleLowerCase() == 'json')
      ) {
        paramStr = '&' + JSON.stringify(data)
      } else {
        paramStr += Object.keys(data)
          .map(item => {
            return `${item}=${encodeURIComponent(data[item])}`
          })
          .join('&')
        if (paramStr) {
          if (config.method === 'get') {
            paramStr = '?' + paramStr
          } else {
            paramStr = '&' + paramStr
          }
        }
      }
    }
    paramStr += '&' + userInfo.accessToken
    sign = '/' + getUrl + paramStr
    sign = md5(sign).toString()
  }
  // 拼接sign值 end
  config = Object.assign({
      url: baseURL + getUrl,
      method: 'post',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'must-revalidate, max-age=600',
        sign: sign,
        version: '2.0'
      },
      loading: true, // 是否带loading图标
      complete: null // 请求完成回调函数
    },
    config
  )
  if (
    config.isHeaderTypeJson ||
    (config.type && config.type.toLocaleLowerCase() == 'json')
  ) {
    config.header['content-type'] = 'application/json'
  }
  // 获取token
  // 用户从未登陆的时候没有userInfo 不添加token

  if (userInfo && userInfo.accessToken) {
    config.header.accessToken = userInfo.accessToken
  }

  if (config.loading) {
    wx.showLoading({
      title: config.loadingText || '加载中...',
      mask: true
    })
  }
  // 小程序入口
  return new Promise((resolve, reject) => {
    wx.request({
      url: config.url,
      method: config.method,
      data,
      header: config.header,
      success: function(res) {

        if (res.statusCode === 200) {
          if (res.data.code == -999) {
            if (config.noRelogin) {
              return resolve(res.data)
            }
            console.log('====call relogin====')
            relogin(config.loading, () => {
              if (!config.noRepeatRequest) {
                request(url, data, configBak)
                  .then(res2 => {
                    resolve(res2)
                  })
                  .catch(err => {
                    reject(err)
                  })
              }
            })
            return
          }
          if (res.data.code == 730014 || res.data.code == 730015) {
            if (config.noRelogin) {
              return resolve(res.data)
            }
            relogin(config.loading, () => {
              request(url, data, configBak)
                .then(res2 => {
                  resolve(res2)
                })
                .catch(err => {
                  reject(err)
                })
            })
            return
          }
          if (!config.noErrorHandler && res.code != 0 && res.data.code != 0) {
            hideLoding()
            wx.showModal({
              content: `${res.msg || '系统错误'}&状态码:${res.code || '未知'}`,
              showCancel: false,
              confirmText: '我知道了',
              complete: () => {
                if (getCurrentPages().length > 1) {
                  wx.navigateBack()
                }
              }
            })
            reject(res.data)
          } else {
            return resolve(res.data)
          }
        } else if (res.statusCode === 404 || res.statusCode === 500 || res.statusCode === 502) {
          hideLoding()
          wx.showModal({
            content: `系统错误&状态码:${res.statusCode}`,
            showCancel: false,
            confirmText: '我知道了',
            complete: () => {
              if (getCurrentPages().length > 1) {
                wx.navigateBack()
              }
            }
          })
          reject(new Error(`系统错误 状态码:${res.statusCode}`))
        } else {
          reject(res.data)
        }
      },
      fail: function(err) {
        hideLoading()
        wx.getNetworkType({
          success: res => {
            if (res.networkType == 'none') {
              wx.showModal({
                title: '温馨提醒',
                content: '当前网络不可用，请检查网络设置',
                showCancel: false,
                confirmText: '我知道了'
              })
            } else {
              wx.hideNavigationBarLoading()
              wx.showModal({
                content: '请求超时，请稍后再试',
                confirmText: '重试',
                cancelText: '取消',
                success: modalRes => {
                  if (modalRes.confirm) {
                   wx.showLoading({
                     title: '加载中...',
                     mask: true
                   })
                    request(url, data, configBak)
                      .then(res2 => {
                        wx.hideLoading()
                        resolve(res2)
                       
                      })
                      .catch(err2 => {
                        wx.hideLoading()
                        reject(err2)
                      })
                  } else {
                    reject(err)
                  }
                }
              })
            }
          }
        })
      },
      complete: function(res) {
        if (config.loading) {
          wx.hideLoading()
        }
        if (typeof config.complete === 'function') {
          config.complete && config.complete(res)
        }
      }
    })
  })
}