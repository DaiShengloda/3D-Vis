
var $AppManager = function(sceneManager,toggleBtn){
	this.sceneManager = sceneManager;
	this.appMaps = {};
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
		var self = this;
		if (!appId) {
			return ;
		}
		if(this.defaultAppTimer){
			clearTimeout(this.defaultAppTimer);
			this.defaultAppTimer = null;
		}
		// 过滤掉当前场景不属于app所属场景的情况
		if(appId != this.defaultAppId){
			var sceneStrs = main.panelMgr.instanceMap.NavBarMgr.$box.nav('getSceneByAppId',appId);
			if(!sceneStrs) return;
		}
		var app = this.appMaps[appId];
		if (app) {
			// 清除上一个app
			this.reset({
				isResetCamera: isResetCamera,
				isDealDefaultApp: false,
			});
			if (!app.isInit) {
				app.setup();				
			}
			var isResetCamera = app.resetCamera();
			app.show(pars);
			this.currentAppId = appId;
		}

		setTimeout(function(){
			 self.sceneManager.viewManager3d.clearVisibleMap();
		},100);
	},

	/**
	 * 新的注册app的方式
	 * appId: {
				appId: appId,
				appName: appName,
			},
	 * 其中appId对应于navBar中，每一项的appId的值
	 * appName对应于系统中继承于Application的那个类的名字，包含两种形式的，fa.ITSearchApp和it.Deviceon这两种，只需要写上后面的名字即可
	 */
	init : function(){
		var self = this;
		this.currentAppId = null;
		this.clientAlarmManager = main.clientAlarmManager;
		this.waitingTimeBeforeDefaultApp = dataJson.waitingTimeBeforeDefaultApp||3000;
		this.defaultAppId = dataJson.defaultAppId;

		this.appBox = {
			'IT_SEARCH': {
				appId: 'IT_SEARCH',
				appName: 'ITSearchApp',
			},
			'SPACE_SEARCH': {
				appId: 'SPACE_SEARCH',
				appName: 'SpaceSearchApp',
			},
			'TEMP': {
				appId: 'TEMP',
				appName: 'TempApp',
			},
			'SPACEELEWEIGHT': {
				appId: 'SPACEELEWEIGHT',
				appName: 'SpaceEleWeight',
				beforeDoClick:  function(){
					self.reset();
				},
			},
			'ASSETON': {
				appId: 'ASSETON',
				appName: 'AssetOnApp',
			},
			'DEVON': {
				appId: 'DEVON',
				appName: 'Deviceon',
			},
			'DEVOFF': {
				appId: 'DEVOFF',
				appName: 'Deviceoff',
			},
			'LINKADD': {
				appId: 'LINKADD',
				appName: 'Linkadd',
			},
			'REALTIME': {
				appId: 'REALTIME',
				appName: 'Realtime',
			},
			'LINKSEARCH': {
				appId: 'LINKSEARCH',
				appName: 'LinkSearchApp',
			},
			'EquipmentLink': {
				appId: 'EquipmentLink',
				appName: 'EquipmentLinkApp',
			},
			'HUMIDITY': {
				appId: 'HUMIDITY',
				appName: 'HumidityApp',
			},
			'MICOENVIR': {
				appId: 'MICOENVIR',
				appName: 'MicoEnvirApp',
			},
			'AIRFLOW': {
				appId: 'AIRFLOW',
				appName: 'AirFlowApp',
			},
			'WATERLEAK': {
				appId: 'WATERLEAK',
				appName: 'WaterLeakApp',
			},
			'Temp': {
				appId: 'Temp',
				appName: 'MicoEnvirApp',
			},
			'POWER': {
				appId: 'POWER',
				appName: 'PowerApp',
			},
			'WEIGHT': {
				appId: 'WEIGHT',
				appName: 'WeightApp',
			},
			'POST': {
				appId: 'POST',
				appName: 'PostApp',
			},
			'COOLINGPIPE': {
				appId: 'COOLINGPIPE',
				appName: 'CoolingPipeApp',
			},
			'U_SEARCH': {
				appId: 'U_SEARCH',
				appName: 'USearchApp',
			},
			'SEAT': {
				appId: 'SEAT',
				appName: 'SeatApp',
			},
			'RecommendedLocation': {
				appId: 'RecommendedLocation',
				appName: 'RecommendedLocationApp',
			},
			'TEMPANDHUM': {
				appId: 'TEMPANDHUM',
				appName: 'TempAndHumApp',
			},
			'CAMERA_ANIMATE': {
				appId: 'CAMERA_ANIMATE',
				appName: 'CameraAnimateApp',
			},
			'topo': {
				appId: 'topo',
				appName: 'VirtualTopologyApp',
			},
			'diskInfo': {
				appId: 'diskInfo',
				appName: 'StorageTabApp',
			},
			'process': {
				appId: 'process',
				appName: 'ProcessTabApp',
			},
			'port': {
				appId: 'port',
				appName: 'PortApp',
			},
			'EquipmentDetails': {
				appId: 'EquipmentDetails',
				appName: 'EquipmentDetailsApp',
			},
			'CUSTOMPANEL': {
				appId: 'CUSTOMPANEL',
				appName: 'CustomPanelApp',
			},
			'ServerTab': {
				appId: 'ServerTab',
				appName: 'ServerTabApp',
			},
			'VirtualDevice': {
				appId: 'VirtualDevice',
				appName: 'VirtualDeviceApp',
			},
			'V-DEVON': {
				appId: 'V-DEVON',
				appName: 'VirtualDeviceonApp',
			},
			'V-DEVOFF': {
				appId: 'V-DEVOFF',
				appName: 'VirtualDeviceoffApp',
			},
			'Panoramic': {
				appId: 'Panoramic',
				appName: 'PanoramicApp',
			},
			'RackPreOccupied': {
				appId: 'RackPreOccupied',
				appName: 'RackPreOccupiedApp',
			},
			'UPreOccupied': {
				appId: 'UPreOccupied',
				appName: 'UPreOccupiedApp',
			},
			'ITVM': {
				appId: 'ITVM',
				appName: 'ITVMApp',
			},
			'MulCamera': {
				appId: 'MulCamera',
				appName: 'MulCameraMApp',
			},
			'CAMERA': {
				appId: 'CAMERA',
				appName: 'CameraApp',
			},
			'TobaccoRod': {
				appId: 'TobaccoRod',
				appName: 'TobaccoRodApp',
            },
            'PanoramicMaker': {
				appId: 'PanoramicMaker',
				appName: 'PanoramicMakerApp',
			},
		};

		for (var key in this.appBox) {
			var appId = this.appBox[key].appId;
			var appName = this.appBox[key].appName;
			var beforeDoClick = this.appBox[key].beforeDoClick;
			var app;
			if(it[appName]){
				// app = new it[appName](this.sceneManager, this.searchPane);
				app = new it[appName](this.sceneManager);
			} else if(fa[appName]){
				// app = new fa[appName](this.sceneManager, this.searchPane);
				app = new fa[appName](this.sceneManager);
			} else{
				console.log('不存在对应的app');
				continue;
			}
			if(beforeDoClick){
				app['beforeDoClick'] = beforeDoClick;
			}
			this.registerApp(appId, app);
			this.appBox[key].app = app;
		}
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
	reset: function (params) {
		var isResetCamera = params&&params.isResetCamera;
		var isDealDefaultApp = params&&params.isDealDefaultApp;
		if(this.currentAppId){
			this.appMaps[this.currentAppId].clear();
			this.currentAppId = null;
		}
		if(isDealDefaultApp){
			this.dealDefaultApp();
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
		//每次reset 时都会调用 注释掉了 -Jay 02-24
		// main.cameraMenu.refreshContentPanel();

		//关闭设备信息面板
		main.BillboardManager.DeviceLabel.deleteLabel();

		if (isResetCamera) {
			this.resetCamera();
		}
	},

	ifShowDefaultApp: function(){
		var node = this.sceneManager.viewManager3d.getFocusNode();
		var data = this.sceneManager.getNodeData(node);
		var category = this.sceneManager.dataManager.getCategoryForData(data);
		var cId = category&&category.getId();
		if(cId == 'floor'){
			return true;
		} else{
			return false;
		}
	},

	dealDefaultApp: function(){
		var self = this;
		if(!this.defaultAppId){
			return;
		}
		if(this.defaultAppTimer){
			clearTimeout(this.defaultAppTimer);
			this.defaultAppTimer = null;
		}
		if(this.currentAppId){
			if(this.currentAppId == this.defaultAppId){
				if(!this.ifShowDefaultApp()){
					this.reset();
				}
			} else{
				// console.log('已经有开启的别的app。不做处理');
			}
		} else{
			if(this.ifShowDefaultApp()){
				this.defaultAppTimer = setTimeout(function(){
					self.doAppById(self.defaultAppId);
					self.defaultAppTimer = null;
				}, this.waitingTimeBeforeDefaultApp);
				// this.doAppById(this.defaultAppId);
			}
		}
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