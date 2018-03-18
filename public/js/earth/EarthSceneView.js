
/**
 * 自定义的新地球场景
 */

var $EarthSceneView = function(sceneId, sceneManager){
	it.CustomSceneView.call(this,sceneId,sceneManager);
	this.mainView =$('<div id="earthSceneView" style="margin:0px;"></div>');
	if (!dataJson.hideEarthScene) {
		this.earthView = $("<div id='earth_view'></div>").css('zIndex', 3);
		this.nationalView = $("<div id='national_view'></div>").css('zIndex', 2).hide();
		this.areaView = $("<div id='area_view'></div>").css('zIndex', 1).hide();
	} else {
		this.earthView = $("<div id='earth_view'></div>").css('zIndex', 3).hide();
		this.nationalView = $("<div id='national_view'></div>").css('zIndex', 2);
		this.areaView = $("<div id='area_view'></div>").css('zIndex', 1).hide();
	};	
	var outScene;

	function gotoScene(id){
		if(!id){
			console.log('lose id');
			return;
		}
		var data = sceneManager.dataManager.getDataById(id);
		var dataScene = sceneManager.getSceneAndRootByData(data);
		var node = sceneManager.getNodeByDataOrId(dataScene.rootData);
        if(dataScene){
			sceneManager.gotoScene(dataScene.scene, dataScene.rootData);
        }
        this.dispose && this.dispose(1000);
        outScene = this;
	}
	this.earthScene = new EarthScene();
	this.nationalScene = new NationalScene();
	this.nationalScene.gotoScene = gotoScene;
	this.areaScene = new AreaScene();
	this.areaScene.gotoScene = gotoScene;
	
	
	this.dataManager = sceneManager.dataManager;
	this.initView();
	this.initialize = false;
	// this.init();
	
	sceneManager.addSceneChangeListener(function(e){
		if(outScene && e.data.getId() === 'earth'){
			outScene.back();
		}
	});
};

mono.extend($EarthSceneView,it.CustomSceneView,{

	initView : function(){
		var self = this,
		    earthTitle;
		it.util.api('datatype', 'get', {"where": {"categoryId":"earth"}}, function(result) {
			if (!result) return;
			earthTitle = result.modelParameters[1].title;
			self.initFrame(earthTitle || it.util.i18n('EarthScene_Title'));
		});	
		this.mainView.append(this.earthView);
		this.mainView.append(this.nationalView);
		this.mainView.append(this.areaView);
		if (!dataJson.hideEarthScene) {
			this.earthScene.preload(this.earthView[0]);
		} else {
			this.nationalScene.preload(this.nationalView[0]);
		};	
		this.nationalScene.provinceAnimateDataMap = eutils.getProvinceAnimateData();
		var oldShowManuBarStatus = dataJson.showManuBar;
		var oldShowRightToolBarStatus = dataJson.showRightToolBar;
		var oldShowBreadcrumbStatus = dataJson.showBreadcrumb;
		setTimeout(function(e){
			main.navBarManager.breadcrumb.bcDiv.hide();//面包屑一开始就隐藏
		},10);
		this.sceneManager.addSceneChangeListener(function(e){
			var scene = e.data;
			if (scene && scene.getCategoryId() == 'earth') {
				dataJson.showManuBar = false;
				main.navBarManager.hideNavBar();
				dataJson.showRightToolBar = false;
				main.rightToolBar && main.rightToolBar.toolBarForItvMain.hide(); // 右上角过滤的按钮和第一人称视角按钮
				dataJson.showBreadcrumb = false; //隐藏面包屑
				main.navBarManager.breadcrumb.bcDiv.hide();
			}else{
				dataJson.showManuBar = oldShowManuBarStatus;
				dataJson.showRightToolBar = oldShowRightToolBarStatus;
				dataJson.showBreadcrumb = oldShowBreadcrumbStatus;
				if (oldShowBreadcrumbStatus!=false) {
					main.navBarManager.breadcrumb.bcDiv.show();
				}
				if (oldShowRightToolBarStatus != false) {
					main.rightToolBar.toolBarForItvMain.show();
				}
			}
		});		
	},

	isLoadData : function(){
		return false;
	},

	init: function() {
		this.initialize = true;
		this.cloudManager = new it.CloudManager(this.sceneManager);
		// 准备数据
		var dcs = this.dataManager.getDataMapByCategory('dataCenter');
		var dcArr = [];
		for(var dc in dcs){
			dcArr.push(dcs[dc]);
		}
		this.earthScene.setData(dcArr);
		this.nationalScene.setData(dcArr);
		

		var self = this;
		this.areaScene.previous = function(province) {
			// self.nationalView.show('fast');
			self.nationalScene.back(province);
			self.areaView.hide(700);
			self.areaScene.stopAnimates(700);
		}
		this.nationalScene.next = function(provinceName, data) {
			self.areaView.show(0);
			self.areaScene.setData(data);
			self.areaScene.preload(provinceName,self.nationalScene.provinceAnimateDataMap[provinceName], self.areaView[0]);
			self.nationalScene.dispose(700);
			// self.nationalView.hide();
		}
		this.nationalScene.previous = function() {
			self.earthView.show(0);
			self.earthScene.back();
			self.nationalView.hide(1000);
			
			// $('#earth_view').show('fast');
			// $('#national_view').hide(1000);
			// earthScene.back();
		}
		this.earthScene.next = function() {
			self.nationalView.show(0);
			self.nationalScene.preload(self.nationalView[0]);
			// self.earthScene.dispose(500);
			self.earthView.hide(5000);
		}
		if (!dataJson.hideEarthScene) {
			this.earthScene.load();
		} else {
			this.nationalScene.load();
		}		
	},

    /**
     * 给地球场景加上标题
     * 注意这个方法的调用应该放到将mainView加到body之后，否则div的长宽的计算不对
     */
	initFrame: function(title) {
		var topPanel = $('<div class="top_line">' +
			'<div class="line line_left"></div>' +
			'<div class="line_center line_gb">' +
			'<span class="line_span">' + title + '</span>' +
			'</div>' +
			'<div class="line line_right"></div>' +
			'</div>');
		var now = moment();
		var bottomPanel = $('<div class="bottom_line">' +
			'<div class="line line_left"></div>' +
			'<div class="line_center">' +
			'<span class="line_span"> '+now.format('YYYY-MM-DD')+'  <i></i>'+now.format('HH:mm:ss')+'</span>' +
			'</div>' +
			'<div class="line line_right"></div>' +
			'</div>');

		this.mainView.append(topPanel);
		this.mainView.append(bottomPanel);
		var titleWidth = $('.line_center').width();
		var lineWidth = (this.mainView.width() - titleWidth + 80) / 2;
		$('.line').css("width", lineWidth * 2 / 3 + 'px');
		$('.line_left').css('left', lineWidth / 3 + 'px');
		$('.line_right').css('right', lineWidth / 3 + 'px');
		var $timeSpan = $('.line_span', bottomPanel);
		setInterval(function(){
			var now = moment();
			$timeSpan.html(now.format('YYYY-MM-DD')+'  <i></i>'+now.format('HH:mm:ss'));
		},1000);
		this.isInitFrame = true;
	},

    /**
     * 返回自定义视图的View
     * 注意：当返回null时，表示的是更viewManager3D共用一个视图
     */
	getContainer: function() {
		return this.mainView[0];
	},

	/**
	 * 显示该场景的view
	 */
	show: function(rootData) {
		// this.refresh();
		if (!this.initialize) {
			this.init();
		}
		
		if (!this.isInitFrame) {
			this.initFrame();
		}
	},

	/**
	 * 卸载该场景视图
	 */
	clear: function() {
		// return null;
	},

	adjustBounds: function(w, h, left, top) {
		//这三个network每次都会重新创建，所以adjustBounds则应该由自己独自创建
		// 但是有的话，还是需要去调整一把。可能正显示着，而调setBounds中的值需要下次创建时
		if (this.earthScene.network) {
			this.earthScene.network.adjustBounds(w, h);
		}
		if (this.areaScene.network) { //有可能没有初始化
			this.areaScene.network.adjustBounds(w, h);
		}
		var bounds = {x:left||0,y:top||0,width:w,height:h};
		this.earthScene.setBounds(bounds);
		this.nationalScene.setBounds(bounds);
		if (this.nationalScene.network) {
			this.nationalScene.adjustBounds();
		}
		this.areaScene.setBounds(bounds);
		if (w) {
			this.mainView.css('width', w);
			this.earthView.css('width', w);
			// this.nationalView.css('width', w);
			this.areaView.css('width', w);
		}
		if (h) {
			this.mainView.css('height', h);
			this.earthView.css('height', h);
			// this.nationalView.css('height', h);
			this.areaView.css('height', h);
		}
		left = left || 0;
		top = top || 0;
		this.mainView.css('left', left);
		this.earthView.css('left', left);
		// this.nationalView.css('left', left);
		this.areaView.css('left', left);
		this.mainView.css('top', left);
		this.earthView.css('top', left);
		// this.nationalView.css('top', left);
		this.areaView.css('top', left);
	},

	getCamera : function(){
		return 'upload';
	},

});

it.EarthSceneView = $EarthSceneView;