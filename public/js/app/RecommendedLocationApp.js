// 推荐位置

var $RecommendedLocationApp = function (sceneManager) {
    fa.SpaceSearchApp.call(this, sceneManager);
};
mono.extend($RecommendedLocationApp, fa.SpaceSearchApp, {

    init: function () {
        this.app = new it.RecommendedLocationManager(this.sceneManager, this);
        this.dm = this.sceneManager.dataManager;
        this.vm = this.sceneManager.viewManager3d;
        this.de = this.vm.defaultEventHandler;
        this.vitualManager = new it.VirtualManager(this.sceneManager);
        //虚化程度
        this.vitualManager.opacityValue = 0.01;
        this.dataFinder = new it.DataFinder(this.dm);

        this.selectTreeView = null;
        this.selectTreeCategory = ['floor', 'room', ];
    },

    doShow: function () {
        var self = this;
        this.allRacks = [];

        this.vm.addMaterialFilter(this.vitualManager);
        var rootNode = this.sceneManager.getCurrentRootNode();
        this.floorData = this.sceneManager.getNodeData(rootNode);
        this.floorDataId = this.floorData._id;
        var children = this.children = this.dm.getDescendants(this.floorData);
        for (var i = 0; i < children.length; i++) {
            var data = children[i];
            // this.vitualManager.add(data);
            var categoryId = this.dm.getCategoryForData(data).getId();
            if (categoryId == 'rack') {
                this.allRacks.push({
                    data: data,
                })
                data.setUserData('RecommendedLocation_restWeightRating', data.rackExtraInfo.rackInfo.restWeight);
                data.setUserData('RecommendedLocation_restPowerRating', data.rackExtraInfo.rackInfo.restPower);
            }
        }

        this.dataFinder.getDatas = function () {
            var results = [];
            for (var i = 0; i < self.allRacks.length; i++) {
                results.push(self.allRacks[i].data);
            }
            return results;
        }

        this.appPanel = $('<div>').addClass('new-app-panel').appendTo($('.new-apps-box'));
        this.appPanel.RecommendedLocationApp({
            // extendField: extendField,
            deviceModelSelects: self.getDeviceModelOptions(),
            selectTreeCategory: self.selectTreeCategory,
            setOtherInputs:  function(e, dataTypeId){
                self.setOtherInputs(dataTypeId);
            },
            doSearchIt: function (e) {
                self.doClickSearchIt();
            },
            doClearIt: function (e) {
                self.doClickClearIt();
            },
        });
    },

    doClear: function () {
        this.app.hide();
        this.appPanel && this.appPanel.RecommendedLocationApp('destory');
        this.appPanel = null;
        this.uHeight = null;
        this.allRacks = [];
        this.clearVitualAllChildren();
        this.vm.removeMaterialFilter(this.vitualManager);
    },

    doClickSearchIt: function () {
        // console.log('doClickSearchIt');
        var self = this;
        var node = this.vm.getFocusNode();
        var data = this.sceneManager.getNodeData(node);
        var categoryId = this.dm.getCategoryForData(data);
        if (categoryId == 'floor') {
            this.doSearchIt();
        } else {
            this.de.lookAtByData(self.floorData, function () {
                self.doSearchIt();
            });
        }
    },

    doClickClearIt: function () {
        // console.log('doClickClearIt');
        var self = this;
        var node = this.vm.getFocusNode();
        var data = this.sceneManager.getNodeData(node);
        var categoryId = this.dm.getCategoryForData(data);
        if (categoryId != 'floor') {
            this.de.lookAtByData(self.floorData, function () {
                self.doClearIt();
            });
        }
        this.doClearIt();
    },

    doSearchIt: function () {
        // console.log('doSearchIt');
        var self = this;
        if (this.app.appState) {
            this.app.hide();
        }
        this.vitualAllChildren();
        // 获取uHeight参数
        this.uHeight = parseInt(this.appPanel.RecommendedLocationApp('getInputValue', 'uHeight'));
        if (this.uHeight == 0 || isNaN(this.uHeight)) {
            this.uHeight = 1;
        }

        this.computeSpaceMsg({
            results: self.allRacks,
            uPreMsg: {},//被占用的啥等等信息，这里写空对象
        });

        // 树中的所有结果
        var results = this.getDataFinderResults();
        this.app.show({
            allRightDatas: results,
        });
         // 生成搜索树
        this.appPanel.RecommendedLocationApp('createBigSearchTree', {
            title: it.util.i18n('ITSearchPane_Search_Result'),
            results: results,
            createLabel: self.createLabel,
            clickTreeNode: function (e) {
                self.clickNodeFunction(e);
            },
        })
    },

    doClearIt: function () {
        // console.log('doClearIt');
        this.app.hide();
        this.clearVitualAllChildren();
        if(this.appPanel){
            this.appPanel.RecommendedLocationApp('removeBigSearchTree');
            this.appPanel.RecommendedLocationApp('refreshAll');
        }
    },

    clickNodeFunction: function (e) {
        var dataId = e.id;
        var data = this.dm.getDataById(dataId);
        if (data) {
            this.de.lookAtByData(data);
        }
    },

    getDeviceModelOptions: function () {
        var currentDataTypes = [];
        this.deviceModelDataTypes = {};
        currentDataTypes.push({
            value: '',
            content: it.util.i18n("All"),
        });
        this.deviceModelDataTypes['RecommendedLocationAll'] = {
            extend: {
                uHeight: '',
                weightRating: '',
                powerRating: '',
            }
        }
        var dataTypes = this.dm._dataTypeMap;
        for (var typeId in dataTypes) {
            var dataType = this.dm._dataTypeMap[typeId];
            if (dataType) {
                var searchFilter = dataType.getUserData('searchFilter');
                if (searchFilter) {
                    var category = this.dm.getCategoryForDataType(dataType);
                    if (category._id == 'equipment') {
                        currentDataTypes.push({
                            value: dataType.getId(),
                            content: dataType.getDescription() || dataType.getId(),
                        });
                        this.deviceModelDataTypes[dataType.getId()] = {
                            dataType: dataType,
                            extend: {
                                uHeight: dataType.getSize().ySize,
                                weightRating: dataType.getWeightRating(),
                                powerRating: dataType.getPowerRating(),
                            }
                        };
                    }
                }
            }
        }
        return currentDataTypes;
    },

    setOtherInputs: function(dataTypeId){
        // 当选择全部时，datetypeid为''
        // console.log(dataTypeId);
        var extendObj;
        if(typeof(dataTypeId) == 'string'){
            extendObj = this.deviceModelDataTypes[dataTypeId].extend;
        } else{
            extendObj = this.deviceModelDataTypes['RecommendedLocationAll'].extend;
        }
        for (var key in extendObj) {
            this.appPanel.RecommendedLocationApp('setInputValue', key, extendObj[key]);
        }
    },

    getDataFinderResults: function () {
        var conditions = [];

        var positionValue = this.appPanel.RecommendedLocationApp('getAreaSelectValue', 'position');
        if (positionValue) {
            conditions.push({
                key: 'ancestor',
                value: positionValue,
            });
        }
        
        if (this.uHeight) {
            conditions.push({
                key: 'u:UPreOccupied_restMaxU',
                value: this.uHeight,
                dataType: 'number',
                operation: '>='
            });
        }

        var weightRatingValue = this.appPanel.RecommendedLocationApp('getInputValue', 'weightRating');
        if (weightRatingValue) {
            conditions.push({
                key: 'u:RecommendedLocation_restWeightRating',
                value: weightRatingValue,
                dataType: 'number',
                operation: '>='
            });
        }

        var powerRatingValue = this.appPanel.RecommendedLocationApp('getInputValue', 'powerRating');
        if (powerRatingValue) {
            conditions.push({
                key: 'u:RecommendedLocation_restPowerRating',
                value: powerRatingValue,
                dataType: 'number',
                operation: '>='
            });
        }

        return this.dataFinder.find(conditions);
    },

    // 计算空间
    computeSpaceMsg: function (obj) {
        var results = obj.results;
        // var uHeight = obj.uHeight;
        var uPreMsg = obj.uPreMsg;

        this.searchResult = {};
        for (var i = 0; i < results.length; i++) {
            var data = results[i].data;
            var dataId = data._id;
            var space = this.computeSpace({
                data: data,
                rackExtend: uPreMsg[dataId],
            })
            // data.setUserData('UPreOccupied_space', space);
            this.updateUPreOccupiedUserData({
                data: data,
                space: space,
            })
        }
    },

    updateUPreOccupiedUserData: function (params) {
        var data = params.data;
        var space = params.space;

        if (!space) {
            space = data.getUserData('UPreOccupied_space');
        }
        if (!space) {
            // console.log(it.util.i18n('U_Pre_Occupied_Lack') + 'space');
            return;
        }
        var emptyList = space.emptyList;
        var restMaxU = 0,
            restNumberU = 0;
        for (var j = 0; j < emptyList.length; j++) {
            var empty = emptyList[j];
            var total = empty.total;
            restMaxU = Math.max(restMaxU, total);
            restNumberU += Math.floor(total / this.uHeight);
        }
        data.setUserData('UPreOccupied_restMaxU', restMaxU);
        data.setUserData('UPreOccupied_restNumberU', restNumberU);
    },

    // 0表示空位，1表示设备，2表示被预占
    computeSpace: function (params) {
        var rackExtend = params.rackExtend,
            data = params.data,

            rackDataType = this.dm.getDataTypeForData(data),
            rackSize = rackDataType._childrenSize.ySize,
            childrenData = data._childList._as;
        var rackArray = [];
        for (var i = 0; i < rackSize; i++) {
            rackArray[i] = 0;
        }
        // extend
        if (rackExtend) {
            for (var key in rackExtend) {
                var extend = rackExtend[key].extend;
                var start = extend.start;
                var total = extend.total;
                for (var j = 0; j < total; j++) {
                    rackArray[start + j - 1] = 2;
                }
            }
        }
        for (var i = 0; i < childrenData.length; i++) {
            var deviceData = childrenData[i];
            var deviceDataType = this.dm.getDataTypeForData(deviceData);
            var deviceSize = deviceDataType._size.ySize;
            var deviceStart = parseInt(deviceData._location.y);
            for (var j = 0; j < deviceSize; j++) {
                if (rackArray[deviceStart + j - 1] != 0) {
                    // 设备占用在设备，或者设备占用在被预占
                    // console.log(it.util.i18n('U_Pre_Occupied_Device_Area_Problem'));
                }
                rackArray[deviceStart + j - 1] = 1;
            }
        }
        data.setUserData('UPreOccupied_rackArray', rackArray);
        var lists = this.computeListByRackArray({
            data: data,
            rackArray: rackArray,
        });

        return {
            rackArray: rackArray,
            emptyList: lists.emptyList,
            preOccupiedList: lists.preOccupiedList,
        }
    },

    computeListByRackArray: function (params) {
        var data = params.data;
        var rackArray = params.rackArray;
        if (!rackArray) {
            data.getUserData('UPreOccupied_rackArray');
        }
        var spaceState = null;
        var spaceStart = null;
        var emptyList = [],
            preOccupiedList = [];
        for (var i = 0; i < rackArray.length; i++) {
            if (spaceState == null) {
                spaceState = rackArray[i];
                spaceStart = i;
            } else {
                if (rackArray[i] == spaceState) {

                    // 最后一项
                    if (i == rackArray.length - 1) {
                        var obj = {
                            start: spaceStart + 1,
                            end: i + 1,
                            total: i - spaceStart + 1,
                        };
                        if (spaceState == 0) {
                            emptyList.push(obj);
                        } else if (spaceState == 2) {
                            preOccupiedList.push(obj);
                        }
                    }
                } else {
                    var obj = {
                        start: spaceStart + 1,
                        end: i,
                        total: i - spaceStart,
                    }
                    if (spaceState == 0) {
                        emptyList.push(obj)
                    } else if (spaceState == 2) {
                        preOccupiedList.push(obj);
                    }

                    // 最后一项
                    if (i == rackArray.length - 1) {
                        var obj2 = {
                            start: i + 1,
                            end: i + 1,
                            total: 1,
                        }
                        if (rackArray[i] == 0) {
                            emptyList.push(obj2)
                        } else if (spaceState == 2) {
                            preOccupiedList.push(obj);
                        }
                    } else {
                        spaceState = rackArray[i];
                        spaceStart = i;
                    }
                }
            }
        }
        data.setUserData('UPreOccupied_emptyList', emptyList);
        data.setUserData('UPreOccupied_preOccupiedList', preOccupiedList);
        return {
            emptyList: emptyList,
            preOccupiedList: preOccupiedList,
        }
    },

    // 更新树的标签
    createLabel: function (treeData) {
        if (!treeData || !treeData.getId()) {
            return null;
        }
        var id = treeData.getId();
        var data = main.sceneManager.dataManager.getDataById(id); //获取data，将计算的结果保存进去，以免其他地方重复计算
        var content = treeData.getName() ? treeData.getName() : treeData.getId();
        var prex = treeData ? content : '';
        if (!prex) {
            prex = id;
        }
        var count = 0;
        if (data) {
            count = parseInt(data.getUserData('UPreOccupied_restNumberU')); //空余的“uNumber”U的个数
        }
        if (count) {
            prex += '(' + count + it.util.i18n('AllSpaceSearch_Unit') + ')';
        }
        return prex;
    },

    vitualAllChildren: function () {
        for (var i = 0; i < this.children.length; i++) {
            var data = this.children[i];
            this.vitualManager.add(data);
        }
    },

    clearVitualAllChildren: function () {
        this.vitualManager.clear();
    },

    // 取消树的选中状态
    deselectAllTree: function () {
        if (this.appPanel) {
            this.appPanel.RecommendedLocationApp('deselectAllTree');
        }
    },

});
it.RecommendedLocationApp = $RecommendedLocationApp;