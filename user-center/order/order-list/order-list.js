const app = getApp()
import {
  debounce,
  jumpPage
} from './../../../utils/common.js'
Page({
  data: {
    loading: true,
    currentPage: 1,
    loadComplete: false,
    noData: false,
    listData: []
  },
  onLoad: function(options) {
    this.loadData()
  },
  onPullDownRefresh: function() {
    this.setData({
      loading: true,
      currentPage: 1,
      loadComplete: false,
      noData: false,
      listData: []
    })
    this.loadData()
  },
  onReachBottom: function() {
    if (!this.data.loading && !this.data.loadComplete) {
      this.loadData()
    }
  },
  loadData() {
    this.setData({
      loading: true
    })
    let user = app.$getUser()
    app.$fetch('GET_ORDER_LIST', {
      uid: user.userId,
      page: this.data.currentPage,
      pageSize: 10
    }, {
      method: 'get',
      params: {
        userId: user.userId
      },
      loading: false,
      complete: () => {
        this.setData({
          loading: false
        })
        wx.stopPullDownRefresh()
      }
    }).then(res => {
      if (res.data.totalElements == 0) {
        this.setData({
          noData: true
        })
      }
      if (this.data.currentPage >= res.data.totalPages) {
        this.setData({
          loadComplete: true
        })
      } else {
        this.setData({
          currentPage: this.data.currentPage + 1
        })
      }
      this.setData({
        listData: this.data.listData.concat(res.data.records)
      })
    })
  },
  handleGoToDetail: debounce(function(event) {
    let orderItem = event.currentTarget.dataset.item
    switch (orderItem.orderStatus) {
      //已完成
      case 'COMPLETED':
        jumpPage(`/user-center/order/order-finished/order-finished?orderSn=${orderItem.sn}`)
        break
        //待支付
      case 'UN_PAY':
        jumpPage(`/user-center/order/paying/paying?orderSn=${orderItem.sn}`)
        break
        //充电中
      case 'CHARGING':
        jumpPage(`/user-center/order/charging/charging?orderSn=${orderItem.sn}`)
        break
    }

  })
})