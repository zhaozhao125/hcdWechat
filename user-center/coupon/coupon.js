const app = getApp()
Page({
  data: {
    typeArr: ['待使用', '已使用', '已失效'],
    userCouponStatus: 0,
    noUseCoupon: false,
    pageSource: 'userCenter',
    page: 1,
    pageSize: 10,
    couponData: [],
    loading: true,
    isShowNoData: false,
    orderSn: '',
    currentCouponIndex: null
  },
  useCoupon() {
    this.setData({
      noUseCoupon: !this.data.noUseCoupon
    }, () => {
      // 放到全局
      app.globalData.noUseCoupon = this.data.noUseCoupon
      if (this.data.noUseCoupon) {
        app.globalData.currentCouponIndex = null
        this.prevPageInfo('getUseCoupon', this.data.noUseCoupon)
        this.setData({
          currentCouponIndex: null
        })
      }

    })

  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

    this.choiseTabCoupon(this.data.userCouponStatus)
  },
  /**
   * 传递给支付页面数据
   */
  prevPageInfo: function(name, info) {
    let pages = getCurrentPages(); //当前页面
    let prevPage = pages[pages.length - 2]; //上一页
    wx.navigateBack({
      success: () => {
        prevPage[name](info)
      }
    })
  },
  /**
   *  选择支付优惠券
   */
  choisePayingCoupon(e) {
    let data = e.currentTarget.dataset.item
    console.log(data)
    if (data.canUse) {
      app.globalData.currentCouponIndex = data.userCouponId
      app.globalData.noUseCoupon=false
      this.setData({
        currentCouponIndex: data.userCouponId
      })
      this.prevPageInfo('getChoiseCoupon', {
        userCouponId: data.userCouponId,
        couponsName: data.couponsName
      })
    }else{
      wx.showToast({
        title: '此优惠券不可用',
        icon: 'none',
        mask: false
      })
    }
  },
  /**
   * 选项卡切换
   */
  choiseTabCoupon(e) {
    const userCouponStatus = isNaN(e) ? e.currentTarget.dataset.index : e
    console.log(e)
    this.setData({
      userCouponStatus
    })
    this.setData({
      page: 1,
      pageSize: 10,
      couponData: [],
      loading: true,
      isShowNoData: false
    })
    this.getCouponData(userCouponStatus)
  },
  onLoad: function(options) {
    let pageSource = options.pageSource
    this.setData({
      pageSource
    })
    //订单-查询用户优惠券
    if (pageSource == 'paying') {

      if (app.globalData.noUseCoupon === undefined) {

        app.globalData.noUseCoupon = false
      }
      if (app.globalData.currentCouponIndex) {
        this.setData({
          currentCouponIndex: app.globalData.currentCouponIndex
        })
      }
      this.setData({
        orderSn: options.orderSn,
        noUseCoupon: app.globalData.noUseCoupon
      })
    }
    this.getCouponData()
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.page >= this.data.totalPages) {
      return
    }
    this.setData({
      page: this.data.page + 1
    }, () => {
      this.setData({
        loading: true
      })
      this.getCouponData()
    })
  },
  getPayingCouponData() {
    app.$fetch('USER_ORDER_COUPONS', {
      orderSn: this.data.orderSn,
      page: this.data.page,
      pageSize: this.data.pageSize
    }, {
      loading: false
    }).then(res => {
      if (res.code == 0) {
        this.setData({
          loading: false
        })
        wx.stopPullDownRefresh()
        this.setData({
          couponData: [...this.data.couponData, ...res.data.records],
          totalPages: res.data.totalPages,
          isShowNoData: !res.data.records.length
        })
      }
    }).catch(err => {
      console.log(err, '======err=====')
      this.setData({
        loading: false
      })
      wx.stopPullDownRefresh()
    })
  },
  getCouponData(userCouponStatus) {
    let ajaxName
    let params = {
      userId: app.$getUser().userId,
      page: this.data.page,
      pageSize: this.data.pageSize
    }
    if (this.data.pageSource == 'userCenter') {
      params.userCouponStatus = userCouponStatus || this.data.userCouponStatus
      ajaxName = 'USER_CENTER_COUPONS'
    } else {
      ajaxName = 'USER_ORDER_COUPONS'
      params.orderSn = this.data.orderSn
    }
    app.$fetch(ajaxName, params, {
      loading: false
    }).then(res => {
        this.setData({
          loading: false
        })
        wx.stopPullDownRefresh()
        this.setData({
          couponData: [...this.data.couponData, ...res.data.records],
          totalPages: res.data.totalPages,
          isShowNoData: !res.data.records.length
        })
    }).catch(err => {
      this.setData({
        loading: false
      })
      wx.stopPullDownRefresh()
    })

    // this.request(this.data.page, this.data.pageSize).then(res => {
    //   console.log(res)
    //   if (res.errCode == 0) {
    //     this.setData({
    //       loading: false
    //     })
    //     this.setData({
    //       couponData: [...this.data.couponData, ...res.data.records],
    //       totalPages: res.data.totalPages,
    //       isShowNoData: !res.data.records.length
    //     })
    //   }
    // })
  },
  /**
   * mock数据
   * {page}页数
   * {pageSize}每页的数量
   * @return {总页数,总条数,data}
   */
  request(page, pageSize) {
    let totalElements = 50 //总条数
    let totalPages = Math.ceil(totalElements / pageSize) //总页数
    let data = []
    for (let i = 0; i < totalElements; i++) {
      data.push({
        acountName: "",
        addTime: "2018-11-02 09:02:34",
        addTimeDate: Math.random(),
        beginDate: "2018-11-02 09:02:34",
        city: "",
        cityId: "",
        code: "9157699896157449",
        couponsCode: "91576998",
        couponsId: 822,
        couponsName: "思思",
        detail: Math.random(),
        discount: 0,
        expireDate: "2018-11-07 23:59:59",
        genre: "",
        genreIdentify: "",
        orderId: 0,
        orderSn: "",
        remark: "",
        type: 1,
        usageType: "share",
        useMoneyCondition: 0,
        useMoneyTop: 0,
        userId: 128239,
        userName: "",
        userPhone: "13603788430",
        voucher: "",
      })
    }
    let arr = []
    // 分组
    for (let i = 0; i < totalElements; i += pageSize) {
      arr.push(data.slice(i, i + pageSize));
    }
    let records = []
    arr.forEach((item, index) => {
      if (index + 1 === page) {
        records = item
      }
    })
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          errCode: 0,
          errMsg: "ok",
          data: {
            page,
            pageSize,
            totalElements,
            totalPages,
            records
          }
        })
      }, 1000)

    })
  }
})