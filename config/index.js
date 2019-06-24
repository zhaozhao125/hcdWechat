const ENV = 'dev'
// const ENV = 'production'

const config = {
  baseURL: ENV == 'production' ? 'https://mini.hechongdian.cn/wechatmp/' : 'https://test.mini.hechongdian.cn/wechatmp/',
  appId: 'wx669da01ee2f88a2d'
}
export default config
export const baseURL = config.baseURL
export const appId = config.appId