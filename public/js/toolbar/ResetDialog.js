
/**
 * 复位
 */
var $ResetDialog = function(){ 
	it.ToolBarButton.call(this);
	this.init();
};

mono.extend($ResetDialog, it.ToolBarButton,{

	init : function(){
        var self = this;
        this.button.click(function(){
        	// main.navBarManager.appManager.reset(true,false);
         //    main.navBarManager.appManager.itvToggleBtn.hide();
            self.action();
        });
	},

    /**
     * 点击这个使之回到进入该场景时的状态（资产搜索，lookAt整个场景）
     */
    action:function(){
        // var rootScene = this.sceneManager.getCurrentScene();
        // var rootData = this.sceneManager._currentRootData||this.sceneManager.getNodeData(this.sceneManager.getCurrentRootNode());
        // this.sceneManager.resetCamera(rootScene,rootData);
        
        // var rootNode = main.sceneManager.getCurrentRootNode();
        // if (rootNode) {
        //     main.sceneManager.viewManager3d.getDefaultEventHandler().lookAt(rootNode);
        // }
        // main.sceneManager.viewManager3d.getDefaultEventHandler().cameraInfoStack = [];// 清空look前的堆栈 
        main.sceneManager.viewManager3d.getDefaultEventHandler().clearCameraInfo();// 清空look前的堆栈 ,cameraInfoStack = []并没有完全清除lookat
        // main.navBarManager.appManager.reset(true,true);
        main.panelMgr.instanceMap.NavBarMgr.appManager.reset({
            isResetCamera: true,
            isDealDefaultApp: true,
        });
        main.panelMgr.instanceMap.NavBarMgr.$box.nav('clearAndIfClose','true');
        main.assetPanelMgr.refresh();
        // main.navBarManager.appManager.itvToggleBtn.hide();
        main.monitorManager.hideMonitor();//关闭实时数据的表格
    },

    getClass : function(){
        return 'reset-dialog-image';
    },

    getTooltip : function(){
        return it.util.i18n("restore_initial_state");
    },
	
	
    
});

it.ResetDialog = $ResetDialog;

