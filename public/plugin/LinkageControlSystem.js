
/**
 * linkage control system
 * 联动交互
 * 连接沙盘交互采集服务器
 *
 * 需要考虑到请求发送的太快，需要终止上一个
 *
 * 当穿越dc时，当来的其他的请求时就不应该响应
 * 
 * 主要处理3D请求：上一层，下一层，交
 *
 */
it.LinkageControlSystem = function(sceneManager){
  this.sceneManager = sceneManager;
  this.ip = "192.168.1.101";
  this.port = "3000";
  this.running = false;
  // this.status = '';
  this.init();
};

mono.extend(it.LinkageControlSystem,Object,{

       
   init:function(){
     if (!this.isStartIOT()) {
       return ;
     }
     console.log('start iot!!!');
      var socket = this.createSocket();
      var self = this;
      socket.on('keyPressed',function(data){
        self.doAction(data.key);
      });
      // git clone --recurse-submodules https://github.com/tensorflow/tensorflow
   },

   isStartIOT: function () {
        var location = window.location;
        var search = location.search;
        search = search.replace("?", "");
        var ids = /iot=([^&]*)/.exec(search);
        if (ids == null) {
            return;
        }
        id = ids[1];
        return id;
    },

   /**
    * 5秒内最多响应一个请求
    */
   doAction: function(key) {
    console.log('key number : ' + key);
     if (!key) {
      return ;
     }
     if (this.running) {
       return ;
     }
     var self = this;
     this.running = true;
     if (key == 1) {
       layer.msg('展开楼层',{time:0,offset:'400px'});
       this.toBuilding();
     } else if (key == 5) { // 执行当前场景中的一个动作
       this.doFucoseAction();
     } else if (key == 6) { //下一步
       layer.msg('进入下一个场景',{time:0,offset:'400px'});
       // this.gotoDownLevel();
       setTimeout(function(){
          self.gotoDownLevel();
       },10);
     } else if (key == 7) { // 上一步
       layer.msg('回到上一个场景',{time:0,offset:'400px'});
       setTimeout(function(){
          self.gotoUpLevel();
       },10);
       // this.gotoUpLevel();
     } else {
       console.log('other');
     }
   },
 
   //不同的操作锁定的时间应该不一样，应该还跟当前所在场景和即将到达的场景来确定
   unlock: function(times) {
      var self = this;
      times = times || 5000;
        setTimeout(function() { 
           self.running = false;
           layer.msg('完成',{time:1,offset:'400px'});
        }, times);
   },

   toBuilding : function(){
      this.stop();
      this.sceneManager.viewManager3d.defaultEventHandler.lookAtByData('building01');// 定位到某个资产
      this.unlock();
   },

   playCameraAnimate : function(index){
      this.stop();
      main && main.cameraAnimateManager.play(index||2);// 巡航
   },

  doFucoseAction: function() {
    var currentScene = main.sceneManager._currentScene;
    if (currentScene && currentScene.getId() == 'earth') {

    } else {
      var fNode = main.sceneManager.viewManager3d._focusNode;
      var fData = main.sceneManager.getNodeData(fNode);
      var category = main.sceneManager.dataManager.getCategoryForData(fData);
      if (category  && category.getId().toLowerCase() == 'datacenter') {
          if (main.cameraAnimateManager.isPlay) {
            this.stop();
            this.unlock(10);
          }else{
             layer.msg('播放园区动画',{time:0,offset:'400px'});
             this.playCameraAnimate(6);
             this.unlock(2000);
          }  
      } else if (category && category.getId().toLowerCase() == 'building'){   
          this.gotoUpLevel(); // 在focuseBuilding时，功能就是合并楼层 
      }else if (category && category.getId().toLowerCase() == 'floor'){
          if (main.cameraAnimateManager.isPlay) {
            this.stop();
            this.unlock(10);
          }else{
             layer.msg('播放楼层动画',{time:0,offset:'400px'});
             this.playCameraAnimate(2);
             this.unlock(2000);
          }    
      }else if (category && category.getId().toLowerCase() == 'rack') {
          main.sceneManager.viewManager3d.defaultEventHandler.rotateElement(fNode);
          this.unlock(10);
      }else if (category && category.getId().toLowerCase() == 'equipment'){
          // main.panelMgr.instanceMap["NavBarMgr"].appManager.doAppById('cipanxinxi');
           var storageApp = main.panelMgr.instanceMap["NavBarMgr"].appManager.appMaps["cipanxinxi"];
           if (storageApp.isShow()) {
             $(storageApp.app.plContent).remove();
             storageApp.clear();
             this.unlock(10);
           }else{
             main.panelMgr.instanceMap["NavBarMgr"].appManager.doAppById('cipanxinxi');
             this.unlock(100);
           }
          
      }
    }
  },
   
   /**
    * 下一个场景
    */
   gotoDownLevel : function(){
      this.stop();
      main.sceneManager.viewManager3d.defaultEventHandler.cameraInfoStack = [];
      var currentScene = main.sceneManager._currentScene;
       // this.status = 'earth';
      if (currentScene && currentScene.getId() == 'earth') {
         this.status = 'datacenter';
          var dcgaData = this.sceneManager.dataManager.getDataById('dc_ga');
          var dataScene = this.sceneManager.getSceneAndRootByData(dcgaData);
          if(dataScene){
            this.sceneManager.gotoScene(dataScene.scene, dataScene.rootData);
          }
          this.unlock(10000);
          return ;
      } else {
          var fNode = main.sceneManager.viewManager3d._focusNode;
          var fData = main.sceneManager.getNodeData(fNode);
          var category = main.sceneManager.dataManager.getCategoryForData(fData);
          if (category && category.getId().toLowerCase() == 'datacenter') {
              // this.status = 'building';
              this.sceneManager.viewManager3d.defaultEventHandler.lookAtByData('building01');
              this.unlock();
          }else if (category && category.getId().toLowerCase() == 'building'){
              // this.status = 'floor';
              // this.sceneManager.viewManager3d.defaultEventHandler.lookAtByData('floor02');
              var floor = this.sceneManager.dataManager.getDataById('floor02');
              var dataScene = this.sceneManager.getSceneAndRootByData(floor);
              if(dataScene){
                this.sceneManager.gotoScene(dataScene.scene, dataScene.rootData);
              }
              this.unlock();
          }else if(category && category.getId().toLowerCase() == 'floor'){
              // this.status = 'rack';
              this.sceneManager.viewManager3d.defaultEventHandler.lookAtByData('B1-F2-R2-41');
              this.unlock();
          }else{
             // this.status = 'equipment';
             var children = fData.getChildren();
             if (children && children.size() > 0) {
                this.sceneManager.viewManager3d.defaultEventHandler.lookAtByData(children.get(0));
                this.unlock();
             }else{
               this.unlock(100); //一定要解锁，否则没法进去了
             }
          }
      }
   },

   /**
    * 上一个场景
    */
   gotoUpLevel : function(){
      this.stop();
      main.sceneManager.viewManager3d.defaultEventHandler.cameraInfoStack = [];//由于没有鼠标交互，那就去掉镜头的栈
      this.sceneManager.viewManager3d.handleDoubleClickBackground(); // goto到上一层
      this.unlock();
   },

   stop: function(){
      if (main.cameraAnimateManager){
         delete main.cameraAnimateManager.isPause;
         twaver.Util.stopAllAnimates();
         layer.close(main.cameraAnimateManager.subtitleIndex);
         main.cameraAnimateManager.isPlay = false;
         main.cameraAnimateManager.setControllerVisible(false);
      }
      main.sceneManager.viewManager3d.defaultMaterialFilter.clear();
      if (main.panelMgr.instanceMap["NavBarMgr"]) { //有可能还没有初始化过
         //还原看机柜时的微环境
         var mircoenvir = main.panelMgr.instanceMap["NavBarMgr"].appManager.appMaps["MICOENVIR"];
         if (mircoenvir.isShow()) {
            mircoenvir.clear();
         }
         //把磁盘显示隐藏掉
         var storageApp = main.panelMgr.instanceMap["NavBarMgr"].appManager.appMaps["cipanxinxi"];
         if (storageApp.isShow()) {
            $(storageApp.app.plContent).remove();
         }
      }
      // main.sceneManager.viewManager3d.setFocusNode(main.sceneManager._currentRootNode);
      mono.Utils.stopAllAnimates();
   },

   createSocket : function(){
       var path = '/socket.io';
       var origin = this.ip + ':' + this.port;
       return io.connect(origin, { path: path });
   },


});

