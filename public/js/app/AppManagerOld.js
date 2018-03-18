
var $AppManager = function(sceneManager,toggleBtn){
	this.sceneManager = sceneManager;
	this.appMaps = {};
	this.itvToggleBtn = toggleBtn||new $ItvToggleBtn();
	this.searchPane = new it.SearchPanel();
	this.init();
};

mono.extend($AppManager,Object,{

	registerApp : function(id,app){
		if (!id || !app) {
			return;
		}
		if(app['appId']){
			console.error('此处不应该走这条路，app里面不应该有appId这个属性');
		} else{
			app['appId'] = id;
		}
		this.appMaps[id] = app;
	},

    /**
     * 根据注册的Id执行某个应用
     * @appId 应用的id
     * @pars 调用引用的参数
     */
	doAppById : function(appId,pars){
		if (!appId) {
			return ;
		}
		// 过滤掉当前场景不属于app所属场景的情况
		var sceneStrs = main.panelMgr.instanceMap.NavBarMgr.$box.nav('getSceneByAppId',appId);
		if(!sceneStrs) return;
		var app = this.appMaps[appId];
		if (app) {
			if (!app.isInit) {
				app.setup();				
			}
			var clearItSearch = app.clearItSearch();
			var resetCamera = app.resetCamera();
			var isShow = app.isShow(pars);
			this.reset(clearItSearch,resetCamera,app, pars);
			var isShowSearchInputPanel = false;
			// if (!isShow || app instanceof $DefaultApp) { //如果app应用show很慢的话，
			// 下面的两个||，使资产搜索和空间搜索这两个按钮 再次点击不会关闭
			// if (!isShow || app instanceof fa.ITSearchApp || app instanceof fa.SpaceSearchApp) {
			if (!isShow || app instanceof fa.ITSearchApp ) {
				app.show(pars);
				if (app.isShowSearchInputPanel()) {
					this.itvToggleBtn.show();
					isShowSearchInputPanel = true;
				}else{
					isShowSearchInputPanel = false;
				}
			}
			if(app.isShowSearchInputPanel()&&isShow&&!this.itvToggleBtn.isShow){
					app.show(pars);
					this.itvToggleBtn.show();
					isShowSearchInputPanel = true;
			}
			if (!isShowSearchInputPanel) {
				this.itvToggleBtn.hide();
			}
		}
		var self = this;
		setTimeout(function(){
			 self.sceneManager.viewManager3d.clearVisibleMap();
		},100);
		// this.sceneManager.viewManager3d.clearVisibleMap();
	},

	init : function(){
		var self = this;
		this.clientAlarmManager = main.clientAlarmManager;
		// this.defaultApp = new $DefaultApp(this.sceneManager,this.searchPane);
	    // this.defaultApp.beforeDoClick = function(){
		// 	self.reset();
		// };
		// this.registerApp('IT_SPACE',this.defaultApp); //注册默认的应用
		this.defaultApp = new fa.ITSearchApp(this.sceneManager,this.searchPane);
		// this.defaultApp.beforeDoClick = function(){
		//    self.reset();
		// };
		this.registerApp('IT_SEARCH',this.defaultApp); //注册默认的应用--资产搜索
		var spaceSearch = new fa.SpaceSearchApp(this.sceneManager,this.searchPane);
		// spaceSearch.beforeDoClick = function(){
		//    self.reset();
		// };
		this.registerApp('SPACE_SEARCH',spaceSearch);

		this.registerApp('TEMP',new fa.TempApp(this.sceneManager)); //注册一些内置的应用
		var spaceEleWeight = new it.SpaceEleWeight(this.sceneManager,this.searchPane);
		spaceEleWeight.beforeDoClick = function(){
			self.reset();
		};
		this.registerApp('SPACEELEWEIGHT',spaceEleWeight);
		this.registerApp('ASSETON',new it.AssetOnApp(this.sceneManager,this.searchPane));
		this.registerApp('DEVON',new it.Deviceon(this.sceneManager,this.searchPane));
		this.registerApp('DEVOFF',new it.Deviceoff(this.sceneManager,this.searchPane));
		this.registerApp('LINKADD',new it.Linkadd(this.sceneManager,this.searchPane));
		this.registerApp('REALTIME' , new it.Realtime(this.sceneManager,this.searchPane));

		var linkApp = new $LinkSearchApp(this.sceneManager,this.searchPane); 
		linkApp.beforeDoClick = function(){
			//self.reset();  remark：2017-10-23 点击搜索会隐藏nav导航及配线面板
		};
		this.registerApp('LINKSEARCH',linkApp);
		this.registerApp('EquipmentLink',new it.EquipmentLinkApp(this.sceneManager));
		this.registerApp('HUMIDITY',new it.HumidityApp(this.sceneManager));
		this.registerApp('MICOENVIR',new it.MicoEnvirApp(this.sceneManager));
		this.registerApp('AIRFLOW',new it.AirFlowApp(this.sceneManager));
		this.registerApp('WATERLEAK',new it.WaterLeakApp(this.sceneManager));
		this.registerApp('Temp',new it.MicoEnvirApp(this.sceneManager));
		this.registerApp('POWER',new it.PowerApp(this.sceneManager));
		this.registerApp('WEIGHT',new it.WeightApp(this.sceneManager));
		this.registerApp('POST',new it.PostApp(this.sceneManager));
		this.registerApp('COOLINGPIPE',new fa.CoolingPipeApp(this.sceneManager));
		this.registerApp('U_SEARCH',new fa.USearchApp(this.sceneManager,this.searchPane));
		this.registerApp('SEAT',new it.SeatApp(this.sceneManager));
		this.registerApp('RecommendedLocation',new it.RecommendedLocationApp(this.sceneManager));
		this.registerApp('TEMPANDHUM' , new it.TempAndHumApp(this.sceneManager));
		this.registerApp('CAMERA_ANIMATE' , new it.CameraAnimateApp(this.sceneManager));
		this.registerApp('xunituopu' , new it.VirtualTopologyApp(this.sceneManager));
		this.registerApp('cipanxinxi' , new it.StorageTabApp(this.sceneManager));
		this.registerApp('jinchengliubiao' , new it.ProcessTabApp(this.sceneManager));
		this.registerApp('port' , new it.PortApp(this.sceneManager));
		this.registerApp('SMOKE', new it.SmokeApp(this.sceneManager));
		this.registerApp('EquipmentDetails', new it.EquipmentDetailsApp(this.sceneManager));
		this.registerApp('CUSTOMPANEL', new it.CustomPanelApp(this.sceneManager));
				
		this.registerApp('ServerTab', new it.ServerTabApp(this.sceneManager));
		this.registerApp('VirtualDevice', new it.VirtualDeviceApp(this.sceneManager));
		this.registerApp('V-DEVON', new it.VirtualDeviceonApp(this.sceneManager));
		this.registerApp('V-DEVOFF', new it.VirtualDeviceoffApp(this.sceneManager));
		this.registerApp('Panoramic', new it.PanoramicApp(this.sceneManager));
		this.registerApp('RackPreOccupied', new it.RackPreOccupiedApp(this.sceneManager));
		this.registerApp('UPreOccupied', new it.UPreOccupiedApp(this.sceneManager));
		this.registerApp('ITVM', new it.ITVMApp(this.sceneManager));
		this.registerApp('MulCamera', new it.MulCameraMApp(this.sceneManager));
		this.registerApp('CAMERA', new it.CameraApp(this.sceneManager));
		this.registerApp('TobaccoRod', new it.TobaccoRodApp(this.sceneManager));
	},
    
    /**
     * 是否注册了该应用
     */
	isContain : function(appId){
		var app = this.appMaps[appId];
		if (app) {
			return true;
		}else{
			return false;
		}
	},

	/**
     * 调整camera，使之看到整个场景，并且在操作过程中的虚幻也去掉
     */
    resetCamera : function(){
		var currentScene = this.sceneManager.getCurrentScene();
		// 这里关掉了园区场景的镜头初始化
        // if (currentScene 
        //     && currentScene.getCategoryId().toLowerCase().indexOf('datacenter')>=0) {
        //     return ;
        // }
        var rootNode = this.sceneManager.getCurrentRootNode();
        var defaultHandle = this.sceneManager.viewManager3d.getDefaultEventHandler();
        defaultHandle.lookAt(rootNode);
    },

	/**
     * 重置，是3D场景回到初始状态
     * @param model表示的是在什么模式下，如:资产搜索、空间搜索、温/湿度等
     *
     * 场景切、搜索动作执行之前(因为都会回到“it搜索”的状态，如果是漏水，那就可以直接点击搜索，此中情况下的先清除)也调用了
     */
    reset : function(clearItSearch,isResetCamera,app, pars){
    	 if(isResetCamera == null || isResetCamera == undefined){
            isResetCamera = true;
        }
        if(isResetCamera){
            this.resetCamera();
        }else{ //主要是空间和资产切换时，若不重置镜头, 有些不合理；可是如果，从lookAt机柜直接到dc时(场景切换时会调用)，则到了dc中依然会出现机柜 
        	var spaceApp = this.appMaps["SPACE_SEARCH"];
			if (app == spaceApp) {
				var focusNode = this.sceneManager.viewManager3d.getFocusNode();
				var focusData = this.sceneManager.getNodeData(focusNode);
				var category = this.sceneManager.dataManager.getCategoryForData(focusData);
				if (category && category.getId().toLowerCase() === 'rack'){
					var parentNode = this.sceneManager.getNodeByDataOrId(focusData.getParentId());
					// this.sceneManager.viewManager3d.setFocusNode(parentNode);  //看向机柜时需要正常调用上下架等功能注释后暂未发现有切换的问题
				}
			}
		}
        if (this.sceneManager.viewManager3d.tooltipManager) { //重置时，tooltip需要隐藏掉，有可能tooltip只在某种情况下才开启，到了会有其他模块时可能无法消除
        	this.sceneManager.viewManager3d.tooltipManager.hideToolTipDiv();
        }
        if(clearItSearch){
            if (this.defaultApp.isInit) { //有可能还没有初始化
            	this.defaultApp.clear();
            	if(!app){ // 场景跳过来时才doShow
            		//this.defaultApp.doShow(); //remark2017-01-11,清除时为何再show呢？ add 2017-01-18: 场景切换时会调用到
            	}
            }
		}
        for(var appId in this.appMaps){
        	var app = this.appMaps[appId];
        	if (app && !(app instanceof fa.ITSearchApp) && app.isShow(pars)) {
        		app.clear(pars);
        	}
        }
		//更新轨迹
		if(!main.inspectionManager){
			main.inspectionManager = new InspectionManager(this.sceneManager);
		}
		//main.inspectionManager.refreshMenu();
		//如果正在播放巡检,停止巡检.
		if(main.inspectionManager.isPlaying() || main.inspectionManager.isPause()){
			main.inspectionManager.stop();
		}
		//场景切换时,更新镜头动画列表
		main.cameraMenu.refreshContentPanel();

		//关闭设备信息面板
		main.BillboardManager.DeviceLabel.deleteLabel();
    },

    showCurrentAlarm : function(){
    	this.clientAlarmManager.showAlarmTable();
    },

    showAlarmLog : function(){
    	this.clientAlarmManager.showAlarmLogDialog();
    },

    showAlarmConfigDialog : function(){
    	this.clientAlarmManager.showAlarmConfigDialog();
    },

    showAlarmChartDialog : function(){
    	this.clientAlarmManager.showAlarmChartDialog();
    },

	showLoadConfigDialog : function(){
		main.loadConfig.showConfig();
	},

	showInspectionReportDialog : function(){
		main.inspectionManager.showReportDialog();
	},

	showHistoryAlarmDialog : function(){
		this.clientAlarmManager.showHistoryAlarmDialog();
	},

});

fa.AppManager = $AppManager;