/**
 *
 * 镜头动画的菜单栏实现类
 * @param opts
 *  opts.parentID 界面dom元素的容器
 *  opts.sceneManager  场景管理器
 * @constructor
 */
it.StopCameraMenu = function (parentID, sceneManager) {
    it.ToolBarButton.call(this);
    this.parent = $('#' + parentID || '');
    this.sceneManager = sceneManager || null;
    this.isShow = false;
    this.init();
};

mono.extend(it.StopCameraMenu, it.ToolBarButton, {
    init: function () {
        var self = this;
        // this.$toggleBtn = $('<div class="toggle-camera-editor"></div>').appendTo(this.parent);
        // this.$toggleBtn.on('click', function () {

        this.button.on('click', function () {

            var isPlay = main.cameraAnimateManager.isPlay;
            main.cameraAnimateManager.stop();
            if (!isPlay) {
                layer.msg(it.util.i18n("CameraAnimateManager_reset"));
                setTimeout(function () {
                    var data = self.sceneManager.dataManager.getDataById('earth01');
                    var eh = self.sceneManager.viewManager3d.getDefaultEventHandler();
                    eh.lookAtByData(data);
                }, 500);
            }else{
                layer.msg(it.util.i18n("CameraAnimateManager_stop"));
            }
        })
    },

    getClass: function () {
        return 'stop-camera-menu';
    },

    getTooltip: function () {
        return it.util.i18n("StopCameraMenu_Return_earth");
    },
});


