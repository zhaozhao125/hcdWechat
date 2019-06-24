export default {
  // 获取用户信息详情
  GET_USER_INFO: 'user/basic/queryUserinfo',
  // 获取用户钱包余额数据
  GET_WALLET_INFO: 'user/finance/userMoney/:userId/balance/info',
  // 获取用户收支流水
  GET_WALLET_DETAIL: 'user/finance/userMoney/:userId/record/page',
  // 余额充值
  USER_BALANCE_RECHARGE: 'user/finance/payment/recharge/init'
}