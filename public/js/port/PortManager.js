/**
 * 端口占用吧
 * @param sceneManager
 * @constructor
 */
PortManager = function (sceneManager) {

    it.PortCapacityManager.call(this, sceneManager);
    this._show = false;
    this.showPortData = [];
    this.init();
};

mono.extend(PortManager, it.PortCapacityManager, {

    init: function () {

    },
    isShow: function () {
        return this._show;
    },
    toggleShow: function () {
        if (this.isShow()) {
            this.hide();
        } else {
            this.show();
        }
    },

    show: function () {

        var self = this;
        if (self.showPortData && self.showPortData.length > 0) {
            this.hide();
        }
        this._show = true;
        self.showPortData = [];
        this.dataManager.getDatas().forEach(function (data) {
            if (self.isDataShowPort(data) && self.sceneManager.isCurrentSceneInstance(data)) {
                self.createPortNodeInRack(data);
                self.showPortData.push(data);
            }
        })
    },
    hide: function () {
        this._show = false;
        var self = this;
        this.showPortData.forEach(function (data) {
            self.removePortNodeInRack(data);
        })
        this.showPortData = [];
    },

    isDataShowPort: function (data) {
        var dataType = this.dataManager.getDataTypeForData(data);
        if (dataType && dataType.getCategoryId() == 'rack') {
            return true;
        }
        return false;
    },
    shouldHandleDoubleClickElement: function (element, network, data, clickedObj, event) {

        if (!this._show) {
            return false;
        }
        var portChildNode = element.getClient('portChildNode');
        if (portChildNode) {
            return true;
        }
        return false;
    },
    handleDoubleClickElement: function (element, network, data, clickedObj) {

        data = element.getClient('data');
//        main.info.showInfoDialog(element, null, data, 1);
        main.nodeEventHander.serverPanel.showServerPanel(data);
    },
});