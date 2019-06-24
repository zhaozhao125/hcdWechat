const now = function now() {
  return new Date().getTime()
}
/**
 * 空闲控制 返回函数连续调用时，空闲时间必须大于或等于 wait，func 才会执行
 *
 * @param  {function} func        传入函数
 * @param  {number}   wait        表示时间窗口的间隔
 * @param  {boolean}  immediate   设置为ture时，调用触发于开始边界而不是结束边界
 * @return {function}             返回客户调用函数
 */
export const debounce = (func, wait = 300, immediate = true) => {

  var timeout, args, context, timestamp, result
  var later = function() {
    // 据上一次触发时间间隔
    var last = now() - timestamp

    // 上次被包装函数被调用时间间隔last小于设定时间间隔wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args)
        if (!timeout) context = args = null
      }
    }
  }
  return function() {
    context = this
    args = arguments
    timestamp = now()
    var callNow = immediate && !timeout
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }
    return result
  }
}
// 客服电话
export const callTel = () => {
  wx.makePhoneCall({
    phoneNumber: '400-111-1818'
  })
}
// 判断版本库
export function compareVersion(v1, v2) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  var len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (var i = 0; i < len; i++) {
    var num1 = parseInt(v1[i])
    var num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }
  return 0
}
// 随机函数
export function rnd(n, m) {
  let random = Math.floor(Math.random() * (m - n + 1) + n)
  return random
}
// 跳转
export function jumpPage(url) {
  wx.navigateTo({url})
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

export function formatTime(date, config) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  if (config.format) {
    return config.format.replace('yyyy', year).replace('MM', formatNumber(month)).replace('dd', formatNumber(day)).replace(/hh/i, formatNumber(hour)).replace('mm', formatNumber(minute)).replace('ss', formatNumber(second))
  }

  if (config) {
    if (config.type == 'date') {
      return [year, month, day].map(formatNumber).join(config.separator || '-')
    }
  }
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

export function formatMonth(date) {
  date = new Date(date)
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  return month + '月' + day + '日' + ' ' + [hour, minute].map(formatNumber).join(':')
}


// 隐藏手机号中间四位
export function hidePhone(phone) {
  if (!phone) {
    return ''
  }
  return phone.substr(0, 3) + '****' + phone.substr(-4, 4)
}

export function getUUID(length = 36) {
  var d = new Date().getTime()
  var str = (new Array(length)).fill('x').join('')
  var uuid = str.replace(/[xy]/g, function(c) {
    var r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16)
  })
  return uuid
}
// 下划线转驼峰
export const camelCase = (str) => {
  return str.replace(/_([a-z])/g, ($0, $1) => {
    return $1.toUpperCase()
  })
}
// 正则验证手机号
export const telRegExp = (value, callBack) => {
  let reg = /^((1[1-9][0-9])+\d{8})$/
  let telOk = reg.test(value)
  if (telOk) {
    wx.hideKeyboard()
  }
  callBack(telOk, value)
}