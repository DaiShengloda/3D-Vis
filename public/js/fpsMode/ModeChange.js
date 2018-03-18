
/**
 *
 * 第三人称视角和第一人称视角之间的切换
 * First-person-shooting
 * 注意：第一人称视角给camera设置lookAt无效
 * 当调用我们默认的lookAt方法lookAt某个对象时，镜头可能有些不太对
 */
var $ModeChange = function(sceneManager){
	this.sceneManager = sceneManager;
	this.dm = this.sceneManager.dataManager;
	this.network3d = this.sceneManager.network3d;   
	this.defaultInteraction = this.network3d.getDefaultInteraction();
	this.defaultEventHandle = this.sceneManager.viewManager3d.getDefaultEventHandler();
	this.fpsInteraction = new it.FPSInteraction(this.sceneManager.network3d);
	this.enableMousemove = false;
	this.hoverCube = null; //跟着鼠标一起移动的Cube
	this.cameraPositionChangeListener = null;
	this.fpsMode = false;
	this.init();
};


mono.extend($ModeChange, Object, {

	init: function() {
		var self = this;
		this.hoverCube = new mono.Cube(60, 200, 60);
		this.hoverCube.setStyle('m.color', '#ff0000');
		this.fullscreenChangeListener = function(e) {
            self.toggleFPSModel();
        };

		this.network3d.getRootView().addEventListener('mousemove', function(e) {
			if (!self.enableMousemove) {
				return;
			}
            var element = self.getFirstElement(e);
			if (element) {
				self.hoverCube.setPosition(element.point);
			}
		});

		this.network3d.getRootView().addEventListener('click', function(e) {
			if (!self.enableMousemove) {
				return;
			}
			var element = self.getFirstElement(e);
			if (element) {
				self.hoverCube.setPosition(element.point);
				self.toFPSMode(element.point);
				self.enableSetFPSPosition(false);
			}
		});

		this.cameraPositionChangeListener = function(e){
			if (e.property == "position" && e.newValue.y != e.oldValue.y) {
				e.newValue.setY(e.oldValue.y);
			}
			console.log(e);
		};

		this.sceneChangeListener = function(eve){
			if (self.fpsMode) {
				self.exitFPSMode();
			}
		}
		this.sceneManager.addSceneChangeListener(this.sceneChangeListener);
	},

	getFirstElement: function(e) {
		var self = this;
		var element = this.network3d.getFirstElementByMouseEvent(e, false, function(node) {
			var data = self.sceneManager.getNodeData(node);
			var category = self.sceneManager.dataManager.getCategoryForData(data);
			if (category && (category.getId() == 'floor' 
				|| category.getId() == 'room' 
				|| category.getId().toLowerCase() == 'datacenter')) {
				return true;
			}
			return false;
		});
		return element;
	},

	enableSetFPSPosition : function(isEnable) {
		if (isEnable) {
			this.enableMousemove = true;
			this.network3d.getDataBox().add(this.hoverCube);
		} else {
			this.enableMousemove = false;
			this.network3d.getDataBox().remove(this.hoverCube);
		}
	},

    /**
     * 设置第一人称视角的相关交互
     * 但是需要注意的是：要去掉点击某个对象后虚化其他的对象的功能，改成点击某个对象时若是有动画就播放，否则就不执行任何动作
     * 
     */
	setFPSInteraction : function(){

	},

    /**
     * 移除第一人称视角的交互
     * 注意：设置回成点击相关的对象拉近镜头的动作等
     */
    removeFPSInteraction : function(){

    },

    /**
     * 转换到第一人称视角
     * 注意事项：鼠标不可点击
     */
	toFPSMode: function(pos) {
		var camera = this.network3d.getCamera();
		this.fpsMode = true;
		var self = this;
        if (pos) {
			pos.y += 150;
			this.fpsInteraction.updateCamera(pos,camera.target);
		}
		
		/*
		if (pos) {
			pos.y += 150;
			camera.setPosition(pos);
		}
		camera.checkPosition = function(position){
			if (position && position.y != camera.getY()){
				camera.setPosition(position.x,camera.getY(),position.z);
				return false;
			}
			return true;
		}
		*/
		var interactions = this.sceneManager.network3d.getInteractions();
		var index = interactions.indexOf(this.defaultInteraction);
		if (index !== -1) {
			interactions.splice(index,1);
		}
		if (!interactions.includes(this.fpsInteraction)) {
			interactions.push(this.fpsInteraction);
		}
		this.sceneManager.network3d.setInteractions(interactions);
		camera._orgFov = camera.fov;
		camera.setFov(70);
		if (!this.oldIsDoLookAt) {
			this.oldIsDoLookAt = this.defaultEventHandle.isDoLookAt;
		}
		this.defaultEventHandle.isDoLookAt = function(node){
			var data = self.sceneManager.getNodeData(node);
			var category = self.dm.getCategoryForData(data);
			if (category && (category.getId() == 'floor' || category.getId() == 'room')) {
				self.sceneManager.viewManager3d.setFocusNode(node);
				return false;
			}
			return self.oldIsDoLookAt.call(self.defaultEventHandle,node);
		}
		if(!this.oldIsLookAt){
			this.oldIsLookAt = this.defaultEventHandle._isLookAt;
		}
		this.defaultEventHandle._isLookAt = function(node){
			var data = self.sceneManager.getNodeData(node);
			var category = self.dm.getCategoryForData(data);
			if (category && (category.getId() == 'floor' || category.getId() == 'room')) {
				self.sceneManager.viewManager3d.setFocusNode(node);
				return false;
			}
			return self.oldIsLookAt.call(self.defaultEventHandle,node);
		}
		this.toFullScreen();
		this.addFullscreenChangeListener();
	},

	isFullScreen : function(){
        return document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen;
    },

	toFullScreen: function() {
		if (!this.isFullScreen()) {
			var docElm = document.documentElement;
			if (docElm.requestFullscreen) {
				docElm.requestFullscreen();
			} else if (docElm.webkitRequestFullScreen) {
				docElm.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
			} else if (docElm.mozRequestFullScreen) {
				docElm.mozRequestFullScreen();
			}
		}
	},

	exitFullScreen: function() {
		if (this.isFullScreen()) {
			var doc = document;
			if (doc.exitFullscreen) {
				doc.exitFullscreen();
			} else if (doc.webkitCancelFullScreen) {
				doc.webkitCancelFullScreen(Element.ALLOW_KEYBOARD_INPUT);
			} else if (doc.mozCancelFullScreen) {
				doc.mozCancelFullScreen();
			}
		}
	},

	exitFPSMode: function() {
		this.fpsMode = false;
		var interactions = this.sceneManager.network3d.getInteractions();
		var index = interactions.indexOf(this.fpsInteraction);
		if (index !== -1) {
			interactions.splice(index,1);
		}
		if (!interactions.includes(this.defaultInteraction)) {
			interactions.push(this.defaultInteraction);
		}
		this.sceneManager.network3d.setInteractions(interactions);
		var camera = this.network3d.getCamera();
		if (camera._orgFov) {
		    camera.setFov(camera._orgFov);
		}
		this.network3d.getCamera().checkPosition = function(position){
		    return true;	
		}
		if (this.oldIsDoLookAt) {
			this.defaultEventHandle.isDoLookAt = this.oldIsDoLookAt;
		}
		if (this.oldIsLookAt) {
			this.defaultEventHandle._isLookAt = this.oldIsLookAt;
		}
		this.removeFullscreenChangeListener();
	},

	addFullscreenChangeListener: function() {
        document.addEventListener("fullscreenchange", this.fullscreenChangeListener);
        document.addEventListener("mozfullscreenchange", this.fullscreenChangeListener);
        document.addEventListener("webkitfullscreenchange", this.fullscreenChangeListener);
        document.addEventListener("msfullscreenchange", this.fullscreenChangeListener);
    },

    removeFullscreenChangeListener : function(){
    	document.removeEventListener("fullscreenchange", this.fullscreenChangeListener);
        document.removeEventListener("mozfullscreenchange", this.fullscreenChangeListener);
        document.removeEventListener("webkitfullscreenchange", this.fullscreenChangeListener);
        document.removeEventListener("msfullscreenchange", this.fullscreenChangeListener);
    },

    toggleFPSModel : function(){
        if(!this.isFullScreen() && this.fpsMode){
            this.exitFPSMode();
            var currentRootNode = this.sceneManager.getCurrentRootNode();
            if (currentRootNode) {
            	this.defaultEventHandle.lookAt(currentRootNode);
            }
        }
    }

});

it.ModeChange = $ModeChange;