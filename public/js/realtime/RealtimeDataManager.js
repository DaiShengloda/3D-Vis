/**
 * 资产时实变更处理器
 * 接收后台推送过来的变更消失，处理前端3D对象和前端的业务数据
 */
RealtimeDataManager = function (sceneManager) {
    this.sceneManager = sceneManager;
    this.init();
};

mono.extend(RealtimeDataManager, Object, {

    init: function () {
        var socket = ServerUtil.createSocket();
        var self = this;

        socket.on('addAsset', function (data) { //增加
            console.log('---------add asset: ' + JSON.stringify(data));
            var func = main.beforeAddDataFunction;
            if (func) {
                func(data, function () {
                    self.addData(data);
                })
            } else {
                self.addData(data);
            }
        });

        socket.on('updateAsset', function (data) { //修改
            console.log('---------update asset: ' + JSON.stringify(data));
            self.updateData(data);
        });

        socket.on('deleteAsset', function (data) {
            console.log('---------delete asset: ' + JSON.stringify(data));
            var func = main.beforeDeleteDataFunction;
            if (func) {
                func(data, function () {
                    self.deleteData(data);
                })
            } else {
                self.deleteData(data);
            }
        });
    },

    /**
     * 动态增加资产
     */
    addData: function (datas) {
        if (!datas) {
            console.warn('addData: empty event', datas);
            return;
        }
        if (!(datas instanceof Array)) {
            datas = [datas];
        }
        var dataManager = this.sceneManager.dataManager;
        for (var i = 0; i < datas.length; i++) {
            var assetObj = datas[i];
            var data = new it.Data();
            if (assetObj.data) {
                assetObj = assetObj.data;
            }
            data.fromJson(assetObj);
            this.setUserData(data, assetObj.customField);
            dataManager.addData(data, true, true);
            this.sceneManager.createNodeByDataOrId(data);
        }
    },

    /**
     * 更新资产
     */
    updateData: function (datas) {

        var assetObj = datas;
        var data = new it.Data();
        if (assetObj.data) {
            assetObj = assetObj.data;
        }
        data.fromJson(assetObj);
        var oldData = null;
        var dataManager = this.sceneManager.dataManager;
        if (assetObj.ii > 0) {
            //var oldData = this.sceneManager.dataManager.getDataById(data.getId());
            //根据 II 查找
            var ds = this.sceneManager.dataManager.getDatas();
            var oldDatas = ds.filter(function (item) {
                return item.getIi() && data.getIi() && item.getIi() == data.getIi();
            });
            if (oldDatas && oldDatas.length > 0) {
                oldData = oldDatas[0];
            }
        }

        if (oldData) {
            var oldId = oldData.getId();
            oldData.setName(data.getName());
            oldData.setDescription(data.getDescription());
            oldData.setPosition(data.getPosition());
            oldData.setRotation(data.getRotation());
            oldData.setLocation(data.getLocation());
            oldData.setParentId(data.getParentId());
            oldData.setPower(data.getPower());
            oldData.setWeight(data.getWeight());
            this.setUserData(oldData, assetObj.customField);
            if (assetObj.id && assetObj.id != oldId) {
                //如果id 发生变化, 移除再添加
                console.log(it.util.i18n("RealtimeDataManager_Data_ID_updated") + ', old ', oldId, ' newId ', assetObj.id);
                dataManager.removeData(oldData, true, true);
                this.sceneManager.removeDataNodeByDataOrId(oldData);
                oldData._id = assetObj.id;
                dataManager.addData(oldData, true, true);
                this.sceneManager.createNodeByDataOrId(oldData);
            } else {

                var oldNode = this.sceneManager.getNodeByDataOrId(oldId);
                if (oldNode) { //如果更新并存在3D对象时，也需要改变3D对象上
                    this.sceneManager.translatePosition(oldData);
                }
            }
        } else {
            this.setUserData(data, assetObj.customField);
            dataManager.addData(data, true, true);
            this.sceneManager.createNodeByDataOrId(data);
        }
    },

    setUserData: function (data, customField) {
        if (!data) {
            return;
        }
        data._userDataMap = {};
        if (customField) {
            for (var pro in customField) {
                data._userDataMap[pro] = customField[pro]
            }
        }
    },

    deleteData: function (param) {
        if (!param) {
            return;
        }
        var dataId = param;
        if (typeof (param) === 'object') {
            dataId = param.id;
        }
        var data = this.sceneManager.dataManager.getDataById(dataId);
        if (data) {
            this.sceneManager.dataManager.removeData(data);
            this.sceneManager.removeDataNodeByDataOrId(data);
        }
    },
});