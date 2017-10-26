var app = getApp()
var that;
Page({
  data: {   
    userInfo:null,
    topics: [
    {
        "_id": "57a8b5e9b6a37f4721200c45",
        "name": "美文",
        "articleNum": 0,
        "__v": 0,
        "updateAt": 1470674207147,
        "createAt": 1470674207147,
        "image": "/images/channelbrand.jpg",
        "isBlock": false,
        "articleCount": 2926,
        "followerCount": 1
    },
  ],
    contents:[],
    selectedTopic:'美文',
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    curPage: 0,
    hasMore:true,
    windowHeight:1024,
    loadingMore:false,
    refreshData:false,
    pageSize:10,
    footerIconColor:null,
  },
  //事件处理函数
  selectTopic: function(e) {
      var tmp = e.target.id;
      var curData = this.data;
      if(tmp != this.data.selectedTopic){
        this.setData({ selectedTopic:tmp, refreshData:false, contents:[], curPage:0, hasMore:true, contents:[]});
        this.refreshData();
      } 
  },
  loadData:function(){
     wx.request({
      url: 'http://second.imdao.cn/articles?topics='+that.data.selectedTopic+"&page="+(parseInt(this.data.curPage)+1)+"&pageSize="+this.data.pageSize,
      data: {},
      header: {
          'Content-Type': 'application/json'
      },
      success: function(res) {
        that.data["loadingMore"] = false;
        that.data["refreshData"] = false;
        that.stopPullDownRefresh();
        if (res.data.code == 200) {
          var tmp = that.data.contents;
          if(res.data.data.length == 0){
            that.setData({ hasMore:false});
          } else{
            that.setData({ hasMore:true});
          }
          for(var index = 0; index < res.data.data.length; index++){
            tmp.push(res.data.data[index]);
          }
          that.setData({
            contents:tmp,
            curPage:parseInt(that.data.curPage)+1
          })
        } else {
          console.log('获取失败');
        }
      }
    })
  },
  onPullDownRefresh: function () {
    this.refreshData();
  },
  stopPullDownRefresh: function () {
    wx.stopPullDownRefresh({
      complete: function (res) {
        console.log(res, new Date())
      }
    })
  },
  loadingMore:function(){
    if(this.data["loadingMore"]){
     return;
    }
    updateLoadLoadMoreBall.call(this);
    this.setData({loadingMore:true});
    var that = this;
    setTimeout(function(){
      that.loadData();
    }, 1500)
  },
  refreshData:function(){
    if(this.data["refreshData"]){
      return;
    }
    this.setData({curPage:0, refreshData:true, hasMore:true, contents:[]});
    updateRefreshBall.call(this);
    this.loadData();
  },
  onReady: function () {
    this.refreshAnim = wx.createAnimation({duration: rotate, delay:0});
  },
  onLoad: function () {
    that = this;
    wx.getSystemInfo({
      success: function(res) {
        console.log(res.model)
        console.log(res.pixelRatio)
        console.log(res.windowWidth)
        console.log(res.windowHeight)
        console.log(res.language)
        console.log(res.version)
        that.setData({windowHeight:res.windowHeight})
      }
    })
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      console.log("user info:"+JSON.stringify(userInfo));
      that.setData({
        userInfo:userInfo
      })
    })
    this.refreshData();
  },
  onShow:function(){
   
  },
  
})
var rotate = 600;
var count = 0;
/**
 * 刷新下拉效果变色球
 */
function updateRefreshBall() {
  var cIndex = 0;
  var _this = this;
  var timer = setInterval( function() {
    
    count++;
    console.log("updateRefreshBall, count:"+count);
    try{
      _this.refreshAnim.rotate(count * 360).step();
      _this.setData({ refreshAnim: _this.refreshAnim.export() });
    } catch(e){
        console.log("e:"+e);
    }
    if( !that.data[ 'refreshData' ] ) {
      clearInterval( timer );
    }

  }, rotate);
}

//刷新动态球颜色
var iconColor = [
  '#353535', '#09BB07','#e64340','#576b95','#e64340'
];

/**
 * 刷新下拉效果变色球
 */
function updateLoadLoadMoreBall() {
  var cIndex = 0;
  var timer = setInterval( function() {
    if( !that.data[ 'loadingMore' ] ) {
      clearInterval( timer );
    }
    if( cIndex >= iconColor.length )
      cIndex = 0;
    that.setData( { footerIconColor: iconColor[ cIndex++ ] });
  }, 100 );
}