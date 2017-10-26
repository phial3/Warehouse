//news.js
//获取应用实例
var app = getApp();
Page({
  
  data: {
    page: 0,
    list: [
      { id: 0, 'type': 'all', name: '头条', url: 'get_newslist.php' },
      { id: 1, 'type': 'jw', name: '教务公告', url: 'news/jw_list.php' },
      { id: 2, 'type': 'oa', name: 'OA公告', url: 'news/oa_list.php' },
      { id: 3, 'type': 'hy', name: '会议通知', url: 'news/hy_list.php' },
      { id: 4, 'type': 'jz', name: '学术讲座', url: 'news/jz_list.php' },
      { id: 5, 'type': 'new', name: '综合新闻', url: 'news/new_list.php' },
    ],
    'active': {
      id: 0,
      'type': 'all',
      data: [],
      showMore: true,
      remind: '上滑加载更多'
    }
  },
  onLoad: function(){
    
  },
  //下拉更新
  onPullDownRefresh: function(){
    this.setData({
      'active.data': [],
      'active.showMore': true,
      'active.remind': '上滑加载更多',
      'page': 0
    });
    this.getNewsList();
  },
  //上滑加载更多
  onReachBottom: function(){
    var _this = this;
    if(_this.data.active.showMore){
      _this.getNewsList();
    }
  },
  //获取新闻列表
  getNewsList: function(tpyeId){
    var _this = this;
    tpyeId = tpyeId || _this.data.active.id;
    app.showLoadToast();
    if(_this.data.page >= 5){
      _this.setData({
        'active.showMore': false,
        'active.remind': '没有更多啦'
      });
      wx.hideToast();
    }else{
      _this.setData({
        'active.remind': '正在加载中'
      });
      //获取资讯列表
      wx.request({
        url: app._server + '/api/' + _this.data.list[tpyeId].url,
        data: {
          page: _this.data.page + 1
        },
        success: function(res){
          if(res.data.status === 200){
            if(res.data.data){
              _this.setData({
                'page': _this.data.page + 1,
                'active.data': _this.data.active.data.concat(res.data.data),
                'active.remind': '上滑加载更多'
              });
            }else{
              _this.setData({
                'active.showMore': false,
                'active.remind': '没有更多啦'
              });
            }
          }else{
            app.showErrorModal(res.data.message);
            _this.setData({
              'active.remind': '加载失败'
            });
          }
        },
        fail: function(res){
          app.showErrorModal(res.errMsg);
          _this.setData({
            'active.remind': '网络错误'
          });
        },
        complete: function(){
          wx.hideToast();
          wx.stopPullDownRefresh();
        }
      });
    }
  },
  //获取焦点
  changeFilter: function(e){
    this.setData({
      'active.id': e.target.dataset.id,
      'active.type': e.target.id,
      'active.data': [],
      'active.showMore': true,
      'active.remind': '上滑加载更多',
      'page': 0
    });
    this.getNewsList(e.target.dataset.id);
  }
});