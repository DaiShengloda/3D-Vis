/**
 * 冷气管道管理
 */
var $CoolingPipeApp = function (sceneManager) {
	it.Application.call(this, sceneManager);
};

mono.extend($CoolingPipeApp, it.Application, {

	init: function () {
		this.app = new it.CoolingPipelineManager(this.sceneManager);
		this.doInit && this.doInit();
		/*
		var tooltipRule = new it.TooltipRule({
               categoryId: "coolingDev",
               propertiesDesc : "设备编号:id@@设备名称:name",
            });
		var tooltipManager = this.sceneManager.viewManager3d.tooltipManager;
        tooltipManager.addTooltipRule(tooltipRule);
        */
	},

	doShow: function () {
		// this.sceneManager.viewManager3d.enableMousemove = true;
		this.app.showCoolingPipeline();
		this.playCamera();
	},

	doClear: function () {
		// this.sceneManager.viewManager3d.enableMousemove = false;
		this.app.hideCoolingPipeline();
	},

	resetCamera: function () {
		return false;
	},

    /**
     * 设置特别的镜头，这完全是根据该客户(gzlc)特别写的
     */
	playCamera: function () {
		var camera = this.sceneManager.network3d.getCamera();
		// it.Util.playCameraAnimation(camera, new mono.Vec3(-6703, 3305, -1793), new mono.Vec3(-4172, 1275, -1627), 1000);
	}

});

fa.CoolingPipeApp = $CoolingPipeApp;