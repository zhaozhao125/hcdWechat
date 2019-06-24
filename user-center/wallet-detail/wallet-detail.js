const app = getApp()
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
    app.$fetch('GET_WALLET_DETAIL', {
      userId: user.userId,
      page: this.data.currentPage,
      pageSize: 10
    }, {
      params: {
        userId: user.userId
      },
      loading: false,
      complete: () => {
        this.setData({
          loading: false
        })
      }
    }).then(res => {
      if (res.data.total == 0) {
        this.setData({
          noData: true
        })
      }
      if (this.data.currentPage >= res.data.pages) {
        this.setData({
          loadComplete: true
        })
      } else {
        this.setData({
          currentPage: this.data.currentPage + 1
        })
      }
      this.setData({
        listData: this.data.listData.concat(res.data.rows)
      }, () => {
        wx.stopPullDownRefresh()
      })
    })
  }
})