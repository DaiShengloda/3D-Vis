
/**
 * 用于定义（或注册）所有的应用，如：资产搜索、空间搜索等等都属于应用
 * 可是appliction跟整个系统关联的太紧密了，如资产搜索，不仅仅是跟sceneManager有关，
 *    还有就是和其他的应用也有关，如显示某应用时需要将其他的应用的结果clear掉
 */
var $Application = function(sceneManager,searchPane){
	// this.app = app||{};
	// this.id = app.id;
	// this.className = app.className;
	this.sceneManager = sceneManager;
	this.searchPane = searchPane;
	this.app = null;
	this.showing = false;
	this.isInit = false;
	// this.init();
};

mono.extend($Application,Object,{

	init : function(){
		// if (this.className) {
		// 	var packs = this.className.split('.');
		// 	if (packs && packs.length > 1) {
		// 	}
		// }
	},

	setup : function(){
		this.isInit = true;
		this.init();
	},

    /**
     * 执行该应用之前是不是需要重置镜头
     */
    resetCamera : function(){
    	return false;
    },

    /**
     * 执行该应用前是不是需要清除资产搜索的结果
     */
    clearItSearch : function(){
    	return true;
    },

    /**
     * 是否展开搜索的输入框,默认是不展开的
     * 就相当执行了toggleBtn.show()
     */
    isShowSearchInputPanel : function(){
    	return false;
    },

    /**
     * 是否隐藏搜索panel
     */
    closeInputSearchPanel : function(){
    	return true;
    },

	showBefore : function(){
		$('.app-panel').hide();
	},

	show : function(pars){
		this.showBefore(pars);
		this.showUserDialog();
		this.showing = true;
		this.doShow(pars);
		// console.log('it search!!!');
	},

    /**
     * 显示是所执行的，给子类继承
     */
	doShow : function(pars){

	},

	/**
     * 用来扩展点击之前的相关操作
     */
    beforeDoClick : function(){
    },

	// hide : function(){
	// 	this.showing = false;
	// 	console.log('show test!!!');
	// },

	isShow : function(){
		return this.showing;
	},

	isClear : function(){
		return true;
	},

	clearBefore : function(){

	},

	clear : function(){
		this.clearBefore();
		this.hideUserDialog();
		this.showing = false;
		this.doClear();
	},

	doClear : function(){
		
	},

	gotoDefaultAppWhenSceneChange : function(event){
		if(event && event.kind == 'changeScene' && event.data) {
			return false;
		} 
	},

	ifCloseWhenFocusChange: function(node, oldNode){
		return true;
	},

	showUserDialog: function(){
		if(!this.appItemObj){
			this.beforeSetUp();
		}
		if(this.appItemObj&&this.appItemObj.userDialog){
			this.appUserDialog = it.CustomPanelDialog.makeDialog(this.appItemObj.userDialog);
		}
	},

	hideUserDialog: function(){
		if(this.appUserDialog){
			this.appUserDialog.remove();
		}
	},

	/**
	 * 将navbar中的值存进去
	 */
	beforeSetUp: function(){
		for (var i = 0; i < dataJson.navBars.items.length; i++) {
			var item = dataJson.navBars.items[i];
            if(item.appId == this.appId){
				this.appItemObj = item;
                return;
			}
			if(item.items){
				for (var j = 0; j < item.items.length; j++) {
					var item2 = item.items[j];
					if(item2.appId == this.appId){
						this.appItemObj = item2;
						return;
					}
				}
			}
		}
	},

});

it.Application = $Application;
