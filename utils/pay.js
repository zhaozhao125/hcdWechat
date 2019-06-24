import {appId} from '../config/index.js'
import md5 from './crypto-js/md5'
export function getSign(params) {
  let obj = Object.assign({
    appId: appId
  }, params)
  let signStr = Object.keys(obj).sort().map((item) => {
    return `${item}=${obj[item]}`
  }).join('&') + '&key=yrQz3iq5qwxANsuhEGXjBWncO9xNAoRd'
  return md5(signStr).toString()
}