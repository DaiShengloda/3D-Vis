
var $RightToolBar = function (sceneManager) {
	this.sceneManager = sceneManager;
	// this.cameraSetting = main.cameraSetting = new CameraSetting();
	this.toolBarForBreadcrumb = $('<div id = "itv-toolbar-breadcrumb" class = "itv-breadcrumb-toolbar"></div>'); //这个toolbar放到面包屑上的
	this.toolBarForItvMain = $('<div id = "itv-toolbar-itvmain" class = "itv-toolbar"></div>');//这个toolbar放到3Dnetwork的右上角的，面包屑下
	this.tools = []; //面包屑上的tool
	this.mainTools = [];// 右上角的tool
	this.alarmButton = new it.AlarmButton();
	this.init();
}

mono.extend($RightToolBar, Object, {

	init: function () {
		var filterMenu = main.filterMenu = new it.FilterMenu('itv-main', this.sceneManager);

		filterMenu.visibleFunction = function (dataType) {
			if (dataType && dataType.getCategoryId()
				&& dataType.getCategoryId().toLowerCase() == 'room') {
				return false;
			}
			if (dataType.isLazyable()) {
				return false;
			}
			return true;
		}
		// main.sceneManager.addSceneChangeListener(function (eve) {
		// 	filterMenu.loadAllItems();
		// });
        //耗时的放到这个里面 
        main.sceneManager.cameraManager.addAfterPlayCameraListener(function(eve){
        	filterMenu.loadAllItems();
        });

		this.registerToItvMain(filterMenu);

		var fpsButtonMgr;
		if(main.panelMgr && main.panelMgr.instanceMap && 
			main.panelMgr.instanceMap['ToolbarMgr'] && main.panelMgr.instanceMap['ToolbarMgr'].btnFpsModel){
			fpsButtonMgr = main.panelMgr.instanceMap['ToolbarMgr'].btnFpsModel;
		}else{
			fpsButtonMgr = new it.FPSButton('itv-main', this.sceneManager);
		}
		var btnFpsModel = this.btnFpsModel = fpsButtonMgr;
		this.registerToItvMain(btnFpsModel);
		
		this.visibleFpsModel = function (eve) {
			//在navBar.js中配置是否显示第一人称视角按钮
			var fpsButton = true;
			if(dataJson&&dataJson.showControls&&(dataJson.showControls.FpsButton==false)){
				fpsButton = false;
			}
			if (eve.data && eve.data.getId() != 'earth'&&fpsButton) {
				btnFpsModel.setVisible(true);
			} else {
				btnFpsModel.setVisible(false);
			}
		};
		main.sceneManager.addSceneChangeListener(this.visibleFpsModel);

		if (main.showCameraAnimate && main.showCameraAnimate()) {
			var stopCameraMenu = main.stopCameraMenu = new it.StopCameraMenu('itv-main', this.sceneManager);
			this.register(stopCameraMenu);
			var playCameraMenu = main.playCameraMenu = new it.PlayCameraMenu('itv-main', this.sceneManager);
			this.register(playCameraMenu);
		}
		this.register(new it.BackgroundColor(this.sceneManager));

		//在navBar.js中配置是否显示文件上传按钮
		if(!(dataJson&&dataJson.showControls&&(dataJson.showControls.OpenFileButton==false))){
			this.register(new $OpenFileBar(this.sceneManager));
		}
		this.register(new it.ResetDialog());
		var cameraMenu = main.cameraMenu = new it.CameraMenu('itv-main', this.sceneManager);
		this.register(cameraMenu);
		this.register(new it.SaveCameraBar(this.sceneManager));
		//this.register(new it.Setting('itv-main'));
		this.register(new it.HelpDialog(this.sceneManager));
		this.register(this.alarmButton);
		this.register(new $FullScreen());

		var eventManagerMenu = main.eventManagerMenu = new EventManagerMenu(this.sceneManager);
		this.register(eventManagerMenu);



		if (this.tools && this.tools.length > 0) {
			$('.itv-breadcrumb-menu').append(this.toolBarForBreadcrumb);
		}

		if (this.mainTools && this.mainTools.length > 0) {
			$('#itv-main').append(this.toolBarForItvMain);
		}
		if (dataJson.showRightToolBar === false) {
			this.toolBarForItvMain.hide();
		} else {
			this.toolBarForItvMain.show();
		}
	},

	register: function (tool) {
		if (!tool || !tool.getButton()) {
			return;
		}
		this.toolBarForBreadcrumb.append(tool.getButton());
		this.tools.push(tool);
	},

	registerToItvMain: function (tool) {
		if (!tool || !tool.getButton()) {
			return;
		}
		this.toolBarForItvMain.append(tool.getButton());
		this.mainTools.push(tool);
	}


});

it.RightToolBar = $RightToolBar;
