//ykt.js
//获取应用实例
var app = getApp();
Page({
  data: {
      remind: '加载中...',
      fontSize: 12,      // 字体大小, 24rpx=12px
      count: 10,         // 展示的消费次数
      width: 0,          // 画布宽
      height: 300,       // 画布高, wxss给定canvas高300px
      dict: [],          // 所有消费数据
      points: [],        // 余额点的集合
      tapDetail: {},     // 每个点对应的详情集合
      lineLeft: 0,       // 详情垂直线的初始左边距
      gridMarginLeft: 30,// 表格左边距
      gridMarginTop: 20, // 表格上边距
      balance: 0,
      last_time: '',
      ykt_id: ''
  },
  onLoad: function(){
      var _this = this;
      wx.getSystemInfo({
          success: function(res) {
              // 获取窗口宽, 计算画布宽 (减去padding: 10px;)
              _this.setData({
                'width': res.windowWidth
              });
          }
      });
      _this.sendRequest();
  },
  sendRequest: function() {
      var _this = this;
      if(!app._user.xs.ykth){
        app.showErrorModal('未绑定');
        _this.setData({
            remind: '未绑定'
        });
        return false;
      }
      wx.request({
          url: app._server + "/api/get_yktcost.php",
          data: {
              yktID: app._user.xs.ykth
          },
          success: function(res) {
              if(res.data.status === 200){
                var data = res.data.data.slice(0, _this.data.count).reverse();
                _this.setData({
                    dict: data,
                    balance: parseFloat(data[data.length - 1].balance),
                    last_time: data[data.length - 1].time.split(' ')[0],
                    ykt_id: app._user.xs.ykth,
                    lineLeft: _this.data.width - _this.data.gridMarginLeft - 1,
                    remind: ''
                });

                /*
                * 获取最近消费数据绘制折线图
                **/
                var dict = data;
                var len = dict.length,
                    xArr = [],           // x轴坐标
                    yArr = [],           // 余额点在画布中的纵坐标
                    tmp_yArr = [],       // 余额
                    canvasWidth = _this.data.width,
                    spaceX = (canvasWidth - 2*_this.data.gridMarginLeft) / (_this.data.count - 1),   // 表示横坐标的间隔距离
                    canvasHeight = _this.data.height,
                    gridMarginTop = _this.data.gridMarginTop,  // 折线图上距离
                    gridMarginLeft = _this.data.gridMarginLeft, // 折线图左距离
                    gridNum = 6,  //行数
                    fontSize = _this.data.fontSize;  //字号

                // 余额&横坐标
                for(var i = 0; i < len; i ++){
                    xArr.push(i * spaceX);  
                    tmp_yArr.push(parseFloat(dict[i].balance)); 
                }  

                //canvas 
                var context = wx.createContext();
                var options = {
                    canvasWidth: canvasWidth,         // 矩形宽度
                    canvasHeight: canvasHeight,       // 矩形高度
                    gridMarginTop: gridMarginTop,     // 折线图上距离
                    gridMarginLeft: gridMarginLeft,   // 折线图左距离 
                    xArr: xArr,                       // 横坐标
                    tmp_yArr: tmp_yArr,               // 点集
                    gridNum: gridNum,                 // 横网格线数量
                    context: context,                 // canvas上下文
                    len: len,                         // 数据数组长度
                    yArr: yArr,
                    spaceX: spaceX,
                    fontSize: fontSize
                };
                context.clearRect(0, 0, canvasWidth, canvasHeight);

                /*
                * 绘制横轴&纵轴&网格线
                */
                _this.drawLineXY(options);

                /*
                * 描点连线
                */
                _this.drawPointLine(options);
                
                wx.drawCanvas({
                    canvasId: "firstCanvas",
                    actions: context.getActions(), // 获取绘图动作数组
                    reserve: true
                });
              }else{
                app.showErrorModal(res.data.message);
                _this.setData({
                    remind: res.data.message
                });
              }
          },
          fail: function(res){
            app.showErrorModal(res.errMsg);
            _this.setData({
                remind: '网络错误'
            });
          },
      });
  },

  // 绘制横轴&纵轴&网格线
  drawLineXY: function(options) {
      var context = options.context,
          gridMarginLeft = options.gridMarginLeft,
          gridMarginTop = options.gridMarginTop,
          canvasHeight = options.canvasHeight,
          canvasWidth = options.canvasWidth,
          xArr = options.xArr,
          tmp_yArr = options.tmp_yArr,
          gridNum = options.gridNum,
          fontSize = options.fontSize;

      /*
       * 余额纵坐标&横网格线
       * gridNum: 横网格线条数
       * spaceY: 横网格间距
       * spaceYe: 纵轴余额的金额间隔
       * tmp_minY: 余额的最小值
       * tmp_maxY: 余额的最大值
      */
      var tmp_minY = Math.min.apply(Math, tmp_yArr), 
          tmp_maxY = Math.max.apply(Math, tmp_yArr),
          spaceYe = tmp_maxY / gridNum,     
          gridHeight = canvasHeight - 2*gridMarginTop,
          spaceY = gridHeight / gridNum;

      // 绘制竖网格
      context.setLineWidth(1);
      context.setLineCap("round");
      context.setStrokeStyle("#cccccc");
      for (var i = 0; i < xArr.length; i ++) {
          context.beginPath();          
              context.moveTo(xArr[i] + gridMarginLeft, canvasHeight - gridMarginTop);
              context.lineTo(xArr[i] + gridMarginLeft, gridMarginTop);
              context.stroke();
          context.closePath();
      }
           
          
      context.setStrokeStyle("#cccccc");
      context.setFillStyle("#ffcb63");
      // 绘制横网格&纵轴金额  
      for (var i = 0; i <= gridNum; i ++) {
          var numY = 0;
          // 纵轴金额
          if (i === 0) {
              numY = 0;
          } else {
              numY = Math.round(spaceYe * i);   
          }
          context.beginPath();
            context.moveTo(xArr[0] + gridMarginLeft, gridMarginTop + spaceY * i );
            context.lineTo(xArr[xArr.length - 1] + gridMarginLeft, gridMarginTop + spaceY * i);
            context.stroke();
          context.closePath(); 

          context.beginPath();
            context.setFontSize(fontSize);
            context.fillText(numY, gridMarginLeft - 18, canvasHeight - gridMarginTop - spaceY * i);
          context.closePath();
      }       

      /*
      * 绘制横轴和纵轴
      */
      context.setLineWidth(2);
      context.setStrokeStyle("#ffcb63");
      context.beginPath();
          context.moveTo(xArr[0] + gridMarginLeft, canvasHeight - gridMarginTop);
          context.lineTo(canvasWidth - gridMarginLeft/2, canvasHeight - gridMarginTop);
          context.moveTo(xArr[0] + gridMarginLeft, canvasHeight - gridMarginTop);
          context.lineTo(xArr[0] + gridMarginLeft, 0); 
          context.stroke();
      context.closePath();

  },

  // 描点&连线
  drawPointLine: function(options) {
      var context = options.context,
          yArr = options.yArr,
          gridMarginLeft = options.gridMarginLeft,
          gridMarginTop = options.gridMarginTop,
          canvasHeight = options.canvasHeight,
          canvasWidth = options.canvasWidth,
          xArr = options.xArr,
          gridNum = options.gridNum,
          tmp_yArr = options.tmp_yArr,
          len = options.len,
          spaceX = options.spaceX;
    
      var pointArr = [];

      /* 
      * 点集的纵坐标
      * 根据网格间距/余额间距的比例算出点的对应纵坐标
      * spaceY: 横网格间距
      * spaceYe: 纵轴余额的金额间隔
      * tmp_minY: 余额的最小值
      * tmp_maxY: 余额的最大值
      * yArr: 点在画布中的纵坐标
      */
      var tmp_minY = Math.min.apply(null, tmp_yArr), 
          tmp_maxY = Math.max.apply(null, tmp_yArr),
          spaceYe = tmp_maxY / gridNum,
          gridHeight = canvasHeight - 2*gridMarginTop,
          spaceY = gridHeight / gridNum;
      for(var i = 0; i < len; i++){  
          yArr.push(gridHeight - (tmp_maxY - tmp_yArr[i])*spaceY/spaceYe);
      } 

      /* 
      * 描点连线
      */  

      for(var i = 0; i < len; i ++){  
          var x = xArr[i] + gridMarginLeft,           // 横坐标
              y = canvasHeight - gridMarginTop -yArr[i]   // 纵坐标         

          // 将点在画布中的坐标&消费详情存入数组
          pointArr.push({
              x: x,
              y: y,
              detail: this.data.dict[i]
          });
      }  


      context.setStrokeStyle("#73b4ef");
      context.setFillStyle("#ffcb63");
      // 描点连线
      for(var i = 0; i < pointArr.length; i++){  

          if(pointArr[i+1]){
            context.beginPath();
                context.moveTo(pointArr[i].x, pointArr[i].y);
                context.lineTo(pointArr[i+1].x, pointArr[i+1].y);
                context.stroke();
            context.beginPath();
          }

          context.beginPath();
            context.arc(pointArr[i].x, pointArr[i].y, 2, 0, 2*Math.PI); // 画点              
            context.fill();  
            context.fillText(tmp_yArr[i], pointArr[i].x + 3, pointArr[i].y - 3);  // 消费金额
            context.fillText(i + 1, pointArr[i].x - 3, canvasHeight - 5); // 消费次数(横轴)              
          context.closePath();

        pointArr[i].detail.balance = parseFloat(pointArr[i].detail.balance);
      }
      
      this.setData({
          points: pointArr,
          tapDetail: pointArr[pointArr.length-1].detail
      });
  },

  // 触摸详情
  canvasTap: function(e) {  
      var _this = this;
      // 手指在画布中的坐标        
      var tapX = e.detail.x,
          tapY = e.detail.y,        
          points = _this.data.points,
          pointsLen = points.length,
          diffX = 0,
          iwidth = (_this.data.width-2*_this.data.gridMarginLeft)/(_this.data.count-1);
      
      var i = Math.round((tapX - _this.data.gridMarginLeft) / iwidth);

      _this.setData({
          tapDetail: points[i].detail,
          lineLeft: _this.data.gridMarginLeft + iwidth*i - 1
      });
  }
  
});