
var $PDFManager = function(sceneManager){
    this.sceneManager = sceneManager;
  	this.defaulUrl = "";//"./pdfdemo/test11.pdf";
    this.actionListeners = [];
    this.splitBar = $('<div id="center-pdfview-split-bar" class="center-pdfview-split-bar"></div');
    this.initSplitBar();
    this.pdfViewer = null;
    this.install = false;
    this.isOpenPdfView = false;
    this.pdfViewerApplication = new pdfjsWebLibs.pdfjsWebApp.PDFViewerApplication();
};

mono.extend($PDFManager, Object, {

  initViewer: function() {
    this.install = true;
    this.isOpenPdfView = true;
    var self = this;
    // pdfjsWebLibs.pdfjsWebApp.PDFViewerApplication.configure = function(PDFJS) {
    //       PDFJS.imageResourcesPath = '../libs/pdf/images/';
    //       PDFJS.workerSrc = '../libs/pdf/pdf.worker.js';
    //       PDFJS.cMapUrl = '../libs/pdf/cmaps/';
    //       PDFJS.cMapPacked = true;
    // }
    
    this.pdfViewerApplication.configure = function(PDFJS) {
          PDFJS.imageResourcesPath = pageConfig.url('/libs/pdf/images/');
          PDFJS.workerSrc = pageConfig.url('/libs/pdf/pdf.worker.js');
          PDFJS.cMapUrl = pageConfig.url('/libs/pdf/cmaps/');
          PDFJS.cMapPacked = true;
    }
    main.navBarManager.setItvMainSize('50%');
    this.createPanel();
    webViewerLoad(this.pdfViewerApplication);
    // webViewerLoad();
    
    // pdfjsWebLibs.pdfjsWebApp.PDFViewerApplication.eventBus.on('pagerendered', function(eve){
    this.pdfViewerApplication.eventBus.on('pagerendered', function(eve){
      console.log($(eve.source.div).find($('a'))); //fireFox浏览器的话，有时会获取不到<a>
        $(eve.source.div).find($('a')).unbind("click").click(function(e){
            e.preventDefault();
            // e.stopPropagation();

            var href = e.target.href;
            
            // if (href.indexOf('_E')>= 0) {
            //    href = 'equipmentId=';
            // }else if(href.indexOf('f002')>= 0) {
            //    href = 'cameraAnimateId=';
            // }else{
            //    href = 'rackId=';
            // }
            
            // var dataIds = /id=([^&]*)/.exec(href);
            // if (dataIds) {
            //    var id = dataIds[1];
            //    if (id) {
            //       self.sceneManager.viewManager3d.getDefaultEventHandler().lookAtByData(id);
            //    }
            // }
            self.lookAtByUrl(href);
            // console.log('!!!!');
        });
    });

    
  },

  lookAtByUrl : function(href){
      if (!href) {
        return;
      }
      if(main.cameraAnimateManager.isPlay){
        console.log('正在播放动画');
        return;
      }
      if(this.isLookingAtData){
        console.log('正在看向某个资产');
        return;
      }
      if(main.panelMgr.instanceMap.BreadcrumbMgr.isLookAtByBreadcrumb){
        console.log('正在通过面包屑进行lookAt');
        return;
      }
      var dataIds = /id=([^&]*)/.exec(href);
      var alarmIds = /alarmId=([^&]*)/.exec(href);
      var cameraAnimateIds = /cameraAnimateId=([^&]*)/.exec(href);
      var appIds = /appId=([^&]*)/.exec(href);
      var self = this;
      if(cameraAnimateIds){
          var cameraAnimateId = cameraAnimateIds[1];
          if (!cameraAnimateId) {
             cameraAnimateId = this.getRandomCameraAnimateId();
          }
          if (cameraAnimateId) {
             it.util.api('camera_animate', 'get', {
              id: cameraAnimateId},function(animate){
                var parentId = animate.parentId;
                if(parentId){
                  var parentNode = self.sceneManager.getNodeByDataOrId(parentId),
                      parentData = self.sceneManager.dataManager.getDataById(parentId);
                  //两种情况，一种是没有加载父node（直接通过id进入floor）；另一种是跨场景动画时
                  //这两种都不执行巡航
                  if(parentData && parentNode){
                    var parentRootSceneData = self.sceneManager.getSceneAndRootByData(parentData),
                        parentRootData = parentRootSceneData.rootData,
                        curRootData = self.sceneManager._currentRootData;
                    if(parentRootData && (parentRootData == curRootData)){
                      self.playCameraAnimateById(cameraAnimateId);
                    }else{
                      layer.msg(it.util.i18n('PDFManager_cross_scene_animate_forbid'));
                    }
                  }else{
                    layer.msg(it.util.i18n('PDFManager_target_scene_required'));
                  }
                }           
              })           
          }
          return;
      }
      if (dataIds) {
        var id = dataIds[1];
        if (!id) {
          var randomData = this.getRandomDataByCategoryId();
          id = randomData?randomData.getId():'';
        }
      }else if(alarmIds){
          var alarmId = alarmIds[1];
          id = this.getDataIdByAlarm(alarmId);
      }else if(appIds){
        var appId = appIds[1];
        var app = main.navBarManager.appManager.appMaps[appId];
        if(!app){
          layer.msg(it.util.i18n('PDFManager_target_app_required'));
          return;
        } 
        //通过appId触发navbar绑定的click事件
        //子菜单要先激活父菜单才能触发click事件
        //这个方法目的是通过传入的appid返回导航栏Li的id
        var resIds = main.panelMgr.instanceMap.NavBarMgr.$box.nav('getLiIdByAppId',appId);  
        if(!resIds){
          layer.msg(it.util.i18n('PDFManager_cross_scene_app_forbid'));
          return;
        } 
        if(typeof resIds == 'string'){
            $('li[id="'+resIds+'"] span').trigger('click');
        }
        if(typeof resIds == 'object'){
            var pId = resIds.pId,
                cId = resIds.cId;

              if($('li[id="'+cId+'"]').length){
                //两种情况，app运行或没运行
                if(app.isShow()){
                  $('li[id="'+pId+'"] span').trigger('click');
                }else{
                  $('li[id="'+cId+'"]').trigger('click');
                }
              }else{
                //延时加载app
                waitParentLoad();
              }
            function waitParentLoad(){
              $('li[id="'+pId+'"] span').trigger('click');
              var delayId = cId;
              var timer = setInterval(function(){
                if($('li[id="'+delayId+'"]').length){
                  $('li[id="'+delayId+'"]').trigger('click');
                  clearInterval(timer);
                }
              })
            }     
        }
        return;
      }else{ // 按类别
         var categorys = this.sceneManager.dataManager._categories;
         for(var i = 0 ; i < categorys.length ; i++){
            var category = categorys[i];
            if (!category) {
                continue ;
            }
            var categoryId = category.getId();
            var patt = new RegExp(categoryId+"Id=([^&]*)","g");
            categoryIds = patt.exec(href);
            if (categoryIds) {
               var id = categoryIds[1];
               if (!id) {
                  var categoryData = this.getRandomDataByCategoryId(categoryId);
                  if (categoryData) {
                     id = categoryData.getId();
                  }
               }
               break;
            }
         }
      }
      //判断下node是否存在
      var nd = main.sceneManager.getNodeByDataOrId(id);
      if(!nd){
        layer.msg(it.util.i18n('PDFManager_current_scene_node_required'));
        return;
      }
      this.isLookingAtData = true;
      this.sceneManager.viewManager3d.getDefaultEventHandler().lookAtByData(id, function(){
        self.isLookingAtData = false;
      },false);
  },

  getRandomDataByCategoryId : function(categoryId){
     if (!categoryId) {
        var datas = this.sceneManager.dataManager._datas;
        return datas[parseInt(Math.random()*datas.length)];
     }
     var mapByCategor = this.sceneManager.dataManager.getDataMapByCategory(categoryId);
     if (mapByCategor) {
         for(var id in mapByCategor){
             return mapByCategor[id];
         }
     }
     return null;
  },

  /**
   * 根据告警或告警id获取Data，如果告警id为空时。就会先获取一个随机的告警，然后根据该告警获取其data
   */
  getDataIdByAlarm : function(alarmOrAlarmId){
     if (!alarmOrAlarmId) {
       alarmOrAlarmId = this.getRamdomAlarmId();
     }
     if (!alarmOrAlarmId) {
       return null;
     }
     var alarm = alarmOrAlarmId;
     if (typeof(alarmOrAlarmId) == 'string') {
        alarm = this.sceneManager.getAlarmManager().getAlarm(alarmOrAlarmId);
     }
     if (alarm) {
        return alarm.getDataId();
     }
     return null;
  },

  getRamdomAlarmId : function(){
     var alarms = this.sceneManager.getAlarmManager().getAlarms();
     return alarms.get(parseInt(Math.random()*alarms.size()));
  },
 
  /**
   * 随机获取一个当前场景的镜头动画
   */
  getRandomCameraAnimateId : function(){
      if ($('.camera-content').find('a').length > 2) {
        return $('.camera-content').find('a').eq(0).data().id;
      }
      return null;
  },

  /**
   * 根据镜头动画id播放镜头动画
   */
  playCameraAnimateById : function(cameraAnimateId){
      if(cameraAnimateId){

         main.cameraAnimateManager.play(cameraAnimateId);
      }
  },

  initSplitBar : function(){
     // this.splitBar.mouseover(function(e){
     // });
     $('.itv-center-right').append(this.splitBar);
     var self = this;
     var mouseState = false;
     // var _x;
     this.splitBar.mousedown(function(e){
        mouseState = true;
        // _x=e.pageX-parseInt($(".center-pdfview-split-bar").css("left"));
        // _y=e.pageY-parseInt($(".center-pdfview-split-bar").css("top"));
     });
     // this.splitBar.mouseup(function(e){
      $('.itv-center-right').mouseup(function(e){
        mouseState = false;
      });
     // this.splitBar.mousemove(function(e){
      $('.itv-center-right').mousemove(function(e){
         if (!mouseState) {
           return;
         }
         $(".center-pdfview-split-bar").css({"left":e.pageX}); 
         var totalWidth = parseInt($('.itv-center-right').css('width'));
         main.navBarManager.setItvMainSize(e.pageX);
         self.setViewerWidth(totalWidth-e.pageX);
         console.log(e);
      });
  },

	getViewerStyle : function(width,height,isRight){
	  	var style = '';
	  	if (!width) {
	  		return style;
	  	}
	  	style += "position:absolute; background-color:#404040;";
	  	style += "width:" + width+";";
	  	if (height) {
	  		style += "height:" + height + ";";
		}else{
			style += "height:100%;";
		}
			style += "right:0px;";
	  	style += "top:0px;";
      return style;
	},

    createPanel : function(isRight){    
       var itvCenterPanel = $('.itv-center-right');
       var style = this.getViewerStyle('50%');
       this.pdfViewePanel = $('<div id="itv-pdf-view" style="' + style + '"></div');
       itvCenterPanel.append(this.pdfViewePanel);
       this.pdfViewer = new $PdfViewer();
       this.pdfViewePanel.append(this.pdfViewer.getViewer());
    },

    setViewerWidth : function(width){
       if (width == null || width == undefined) {
          return;
       }
       this.pdfViewePanel.css('width',width);
    },

    addActionListener : function(listener){
    	
    },

    /**
     * 打开PDF浏览窗口
     */
	  openViewer : function(url,isRight){
       this.splitBar.css('display','block');
       this.splitBar.css('left','50%');
       $('.alarm-main-panel').css('z-index','10001'); //告警表浮到split上面
       if (this.install) {
          main.navBarManager.setItvMainSize('50%');
          // $('.itv-center-right').append(this.pdfViewePanel);
          this.pdfViewePanel.show(); 
       }else{
          this.initViewer();
       }
       this.setViewerWidth('50%');
       this.isOpenPdfView = true;
    },

    /**
     * 关闭PDF浏览窗口
     * 注意：某些Listener也要移除掉
     */
	  closeViewer : function(){
       main.navBarManager.setItvMainSize('100%');
       $('.alarm-main-panel').css('z-index','auto');
       this.splitBar.css('display','none');
       if (this.pdfViewePanel) {
          // this.pdfViewePanel.remove();
           this.pdfViewePanel.hide();
          
       }
       this.isOpenPdfView = false;
	  }

});

it.PDFManager = $PDFManager;