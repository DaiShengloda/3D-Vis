/**
 *
 * @param sceneManager
 * @param searchPane
 */
var $SeatApp = function (sceneManager, searchPane) {
    $Application.call(this, sceneManager, searchPane);
};

mono.extend($SeatApp, $Application, {

    init: function () {
        if (this.app) {
            return;
        }
        this.app = new it.SeatManager(this.sceneManager);
    },

    doShow: function (type) {
        if (!this.app) {
            this.init();
        }
        type = parseInt(type);
        this.type = type;
        this.app.show(type);
    },

    doClear: function (type) {
        if (!this.app) {
            this.init();
        }
        this.app.hide(type);
    },

    /**
     * 如果传入参数0, 说明一定要隐藏视图, 返回 true, 欺骗 AppManager 继续调用 reset 方法, 清空视图.
     * 如果点击的按钮不同, 返回 false 欺骗 AppManager 继续调用 show 方法,显示不同的视图, 达到同一个 app 切换不同视图.
     * @param type
     * @returns {*}
     */
    isShow: function (type) {

        type = parseInt(type);
        if (type === 0) {
            return true;
        }
        if ((type === 1 || type === 2 || type === 3) && this.type !== type) {
            return false;
        }
        return this.showing;
    },

});

it.SeatApp = $SeatApp;


