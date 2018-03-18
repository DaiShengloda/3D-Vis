/**
 *
 * 镜头动画的菜单栏实现类
 * @param opts
 *  opts.parentID 界面dom元素的容器
 *  opts.sceneManager  场景管理器
 * @constructor
 */
it.PlayCameraMenu = function (parentID, sceneManager) {
    it.ToolBarButton.call(this);
    this.parent = $('#' + parentID || '');
    this.sceneManager = sceneManager || null;
    this.isShow = false;
    this.init();
};

mono.extend(it.PlayCameraMenu, it.ToolBarButton, {
    init: function () {

        var self = this;

        this.button.on('click', function () {

            main.cameraAnimateManager.stop(); //停止之前的动画
            p();
        })

        function p(r) {
            if(r){
                return;
            }
            self.play(p);
        }
    },

    play: function (callback) {
        var self = this;

        var data = self.sceneManager.getNodeData(self.sceneManager.getCurrentRootNode());
        if (data.getId() != 'earth01') {
            var data = self.sceneManager.dataManager.getDataById('earth01');
            var eh = self.sceneManager.viewManager3d.getDefaultEventHandler();
            eh.lookAtByData(data, function () {
                setTimeout(function () {
                    main.cameraAnimateManager.isPlay = true;//标记开始播放, 为了兼容浪潮的代码,后续直接调用 playAnimate 方法
                    main.cameraAnimateManager.playActions(main.alarmActions, callback);
                }, 2000)
            });
        } else {
            main.cameraAnimateManager.isPlay = true;//标记开始播放, 为了兼容浪潮的代码,后续直接调用 playAnimate 方法
            main.cameraAnimateManager.playActions(main.alarmActions, callback);
        }

    },

    getClass: function () {
        return 'play-camera-menu';
    },

    getTooltip: function () {
        return it.util.i18n("PlayCameraMenu_cursion");
    },
});


