it.ITVPanelMgr = function (sceneManager, itvHandler) {
    this.panel = new it.ITVPanel();
    this.sceneManager = sceneManager;
    this.itvHandler = itvHandler;
};
mono.extend(it.ITVPanelMgr, Object, {
    showInfoBydata: function (configItemId) {
        var obj = {
            items: []
        };
        var configItemInfo = this.getConfigItemInfo(configItemId);
        var relations = this.getRelations(configItemId);
        var assetInfo = this.getAssetInfo(configItemId);
        var alarmInfo = this.getAlarmInfo(configItemId);
        obj.items.push(configItemInfo);
        obj.items.push(relations);
        obj.items.push(assetInfo);
        obj.items.push(alarmInfo);
        this.panel.show(obj);
    },
    getConfigItemInfo: function (configItemId) {
        var data = this.itvHandler.itvDataManager._configItemMap[configItemId];
        var obj = {
            'title': "基本信息",
            'properties': {
                '编号': { value: data._id },
                '名称': { value: data._name },
                '描述': { value: data._description }
            }
        };
        return obj;
    },
    getRelations: function (configItemId) {
        var arr = [];
        arr.title = [{ c_width: 4, text: "编号" }, { c_width: 4, text: "起始对象" }, { c_width: 4, text: "终止对象" }];
        var data = this.itvHandler.itvDataManager._configItemMap[configItemId];
        var relations = data.getRelations();
        if (!relations || relations.size() < 1) return;
        relations.forEach(function (relation) {
            var row = { values: [{ c_width: 4, text: relation._id }, { c_width: 4, text: relation._fromId }, { c_width: 4, text: relation._toId }] };
            arr.push(row);
        });
        var obj = {
            'title': "关联关系",
            'properties': arr
        }
        return obj;
    },
    getAssetInfo: function () {
        
    },
    getAlarmInfo: function () {

    },
    clear: function () {
        this.panel.hide();
    }
});