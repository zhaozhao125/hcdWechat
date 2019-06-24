import loginAPI from './login-api'
import homeAPI from './home-api'
import userAPI from './user-api'
import orderAPI from './order-api'
import itemDetailAPI from './item-detail-api'
import couponAPI from './coupon-api'
import payingAPI from './paying-api'
module.exports = {
  ...userAPI,
  ...orderAPI,
  ...loginAPI,
  ...homeAPI,
  ...itemDetailAPI,
  ...couponAPI,
  ...payingAPI
}