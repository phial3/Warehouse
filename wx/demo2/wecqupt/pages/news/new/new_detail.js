//news.js
//获取应用实例
var app = getApp();
Page({
  data: {
    title: "",// 新闻标题
    date: "",// 发布日期
    author: "", // 发布作者
    content: "",// 新闻内容
    file: false, // 附件，true or false
    size: "",// 附件大小
    fileName: "", // 附件名称
    fileSource: ""// 附件来源
  },
  // // 点击附件下载
  // downloadFile: function(){

  //   wx.downloadFile({
  //     url: 'http://source.lattecake.com/files/2016/09/demo.zip', //仅为示例，并非真实的资源
  //     success: function(res) {
  //       wx.saveFile({
  //         tempFilePath: res.tempFilePath,
  //         success: function(res) {
  //           var savedFilePath = res.savedFilePath;
  //           console.log(savedFilePath);
  //         }
  //       })
  //     }
  //   })
    
  // },
  
  onLoad: function(options){
    var _this = this;
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    })
    console.log(options.id);

    function convertHtmlToText(inputText) {
        var returnText = "" + inputText;
        returnText=returnText.replace(/&nbsp;/gi,' ');
        returnText=returnText.replace(/&mdash;/gi,'-');
        returnText=returnText.replace(/&ldquo;/gi,'“');
        returnText=returnText.replace(/&rdquo;/gi,'”');
        return returnText;
    }

    wx.request({
      url: 'https://we.cqu.pt/api/get_news_detail.php',
      //资讯id
      data: {
        type: "new",
        id: options.id
      },
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function(res){
        console.log("success");
        if(res.data.status == 200){
          console.log(res.data);
          // // 提取信息中的时间，作者，来源
          // var author = '',
          //     info = [];//资讯信息 [2016.9.23,杨资,教务在线]
          // author = res.data.data[1].author.match(/:[\S]+/g);
          // author.forEach(function(e){
          //   info.push(e.slice(1));
          // })
          _this.setData({
            'title': res.data.data.title,//新闻标题
            'content': convertHtmlToText(res.data.data.body) // 新闻内容
          })
          // 如果存在附件则提取附件里面的信息
          if(res.data.data.fjlist){
            var fjlist = res.data.data.fjlist;
            wx.downloadFile({
              url: fjlist.flink, //仅为示例，并非真实的资源
              success: function(res) {
                wx.getSavedFileInfo({
                  filePath: res.tempFilePath, //仅做示例用，非真正的文件路径
                  success: function(res) {
                    // 解析文件大小的函数
                      function bytesToSize(bytes) {
                          if (bytes === 0) return '0 B';
                          var k = 1000, // or 1024
                              sizes = ['B', 'KB', 'MB', 'GB'],
                              i = Math.floor(Math.log(bytes) / Math.log(k));
                        return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
                      }
                    var size = bytesToSize(res.size);
                    _this.setData({
                      "file": true,
                      'size': size,  // 附件大小
                      'fileName': fjlist.fjtitle, // 附件名称
                      'fileSource': "oa公告"
                    });
                  }
                })
              }
            })
          }
          
        }
        // success
        
      },
      fail: function(){
        _this.setData({
            'title': '获取信息失败'//新闻标题
          })
      },
      complete: function() {
        wx.hideToast();
        console.log("complete");
            // complete
      }
    })
  }
});