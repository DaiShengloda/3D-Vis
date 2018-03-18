// U位预占用
var $UPreOccupiedApp = function (sceneManager) {
    fa.SpaceSearchApp.call(this, sceneManager);
};
mono.extend($UPreOccupiedApp, fa.SpaceSearchApp, {

    init: function () {
        this.app = new it.UPreOccupiedManager(this.sceneManager, this);
        this.dm = this.sceneManager.dataManager;
        this.vm = this.sceneManager.viewManager3d;
        this.de = this.vm.defaultEventHandler;
        this.vitualManager = new it.VirtualManager(this.sceneManager);
        //虚化程度
        this.vitualManager.opacityValue = 0.01;
        this.dataFinder = new it.DataFinder(this.dm);

        // console.log('app加载');

        this.selectTreeView = null;
        this.selectTreeCategory = ['floor', 'room', ];
    },

    doShow: function () {
        var self = this;
        this.allRacks = [];
        this.uHeight = 1;

        this.vm.addMaterialFilter(this.vitualManager);
        var rootNode = this.sceneManager.getCurrentRootNode();
        this.floorData = this.sceneManager.getNodeData(rootNode);
        this.floorDataId = this.floorData._id;
        var children = this.children = this.dm.getDescendants(this.floorData);
        for (var i = 0; i < children.length; i++) {
            var data = children[i];
            this.vitualManager.add(data);
            var categoryId = this.dm.getCategoryForData(data).getId();
            if (categoryId == 'rack') {
                this.allRacks.push({
                    data: data,
                })
            }
        }

        var conditions = {
            occupyType: 'u',
            parentId: this.floorDataId,
        }
        it.util.api('pre_occupied', 'searchAndCount', conditions, function (result) {
            var datas = result.rows; // array
            self.allSearchAndCountDatas = datas;
            // console.log(datas);
            var extendField = {};

            for (var key in self.app.extendField) {
                extendField[key] = self.app.extendField[key];
                extendField[key].arrays = [{
                    value: '',
                    content: it.util.i18n("All"),
                },];
            }

            for (var i = 0; i < datas.length; i++) {
                if ($.isEmptyObject(datas[i].extend)) {
                    // console.log('对象为空');
                } else {
                    for (var key in self.app.extendField) {
                        var array = extendField[key].arrays;
                        var newNum = datas[i].extend[key];
                        var flag = true;
                        for (var j = 0; j < array.length; j++) {
                            if (array[j].value == newNum) {
                                flag = false;
                                break;
                            }
                        }
                        if (flag) {
                            array.push({
                                value: newNum,
                                content: newNum,
                            });
                        }
                    }
                }
            }

            self.appPanel = $('<div>').addClass('new-app-panel').appendTo($('.new-apps-box'));
            self.appPanel.UPreOccupiedApp({
                extendField: extendField,
                selectTreeCategory: self.selectTreeCategory,
                doSearchIt: function (e) {
                    self.doClickSearchIt();
                },
                doClearIt: function (e) {
                    self.doClearIt();
                },
            });
            self.doSearchIt();
        })
    },

    doClear: function () {
        this.app.hide();
        this.appPanel && this.appPanel.UPreOccupiedApp('destory');
        this.appPanel = null;
        this.uHeight = null;
        this.allRacks = [];
        this.vm.removeMaterialFilter(this.vitualManager);
    },

    doClickSearchIt: function(){
        var self = this;
        var node = this.vm.getFocusNode();
        var data = this.sceneManager.getNodeData(node);
        var categoryId = this.dm.getCategoryForData(data).getId();
        if(categoryId == 'floor'){
            this.doSearchIt();
        } else{
            this.de.lookAtByData(self.floorData, function(){
                self.doSearchIt();
            });
        }
    },

    doSearchIt: function () {
        // console.log('doSearchIt');
        var self = this;
        if (this.app.appState) {
            this.app.hide();
        }
        this.vitualAllChildren();
        // 获取uHeight参数
        this.uHeight = parseInt(Number(this.appPanel.UPreOccupiedApp('getInputValue', 'u-height')));
        if (this.uHeight == 0 || isNaN(this.uHeight)) {
            this.uHeight = 1;
        }

        var isHasCondition = false;
        var conditionDatas = [];
        for (var i = 0; i < this.allSearchAndCountDatas.length; i++) {
            conditionDatas[i] = this.allSearchAndCountDatas[i];
        }
        for (var key in this.app.extendField) {
            var oneExtendField = this.appPanel.UPreOccupiedApp('getSelectValue', key);
            if(oneExtendField.trim()!=''){
                isHasCondition = true;
                for (var i = 0; i < conditionDatas.length; i++) {
                    var conditionData = conditionDatas[i];
                    if(conditionData.extend[key]!=oneExtendField){
                        conditionDatas.splice(i, 1);
                        i--;
                    }
                }
            }
        }

        for (var i = 0; i < conditionDatas.length; i++) {
            var conditionData = conditionDatas[i];
            var id = conditionData.id.split('_')[0];
            // console.log(id);
            conditionDatas[i] = this.dm.getDataById(id);
        }

        if(isHasCondition){
            this.dataFinder.getDatas = function () {
                var results = [];
                for (var i = 0; i < conditionDatas.length; i++) {
                    results.push(conditionDatas[i]);
                }
                return results;
            }
        } else{
            this.dataFinder.getDatas = function () {
                var results = [];
                for (var i = 0; i < self.allRacks.length; i++) {
                    results.push(self.allRacks[i].data);
                }
                return results;
            }
        }
        
        var conditions = {
            occupyType: 'u',
            parentId: this.floorDataId,
        }
        // u位预占的id，格式为 机柜名_起始U位
        it.util.api('pre_occupied', 'searchAndCount', conditions, function (result) {
            // console.log('result', result);
            var msgArray = result.rows;
            var uPreMsg = {};
            for (var i = 0; i < msgArray.length; i++) {
                var ids = msgArray[i].id;
                if (ids.indexOf('_') > -1) {
                    var id = ids.split('_')[0];
                } else {
                    console.log(it.util.i18n('U_Pre_Occupied_Id_Error'));
                }
                if(!uPreMsg[id]){
                    uPreMsg[id] = {};
                }
                uPreMsg[id][ids] = {
                    ids: ids,
                    extend: msgArray[i].extend,
                }
            }
            self.uPreMsg = uPreMsg;
            // 计算空间
            self.computeSpaceMsg({
                results: self.allRacks,
                // uHeight: params.uHeight,
                uPreMsg: uPreMsg,
            });
            // 筛选出结果
            var results = self.getDataFinderResults();
            self.app.show({
                allRightDatas: results,
                // uHeight: params.uHeight,
            });
            // 生成搜索树
            self.appPanel.UPreOccupiedApp('createBigSearchTree', {
                title: it.util.i18n('ITSearchPane_Search_Result'),
                results: results,
                createLabel: self.createLabel,
                clickTreeNode: function (e) {
                    self.clickNodeFunction(e);
                },
            })
        })
    },

    doClearIt: function () {
        // console.log('doClearIt');
        this.app.hide();
        this.clearVitualAllChildren();
        if(this.appPanel){
            this.appPanel.UPreOccupiedApp('removeBigSearchTree');
            this.appPanel.UPreOccupiedApp('refreshAll');
        }
    },

    clickNodeFunction: function (e) {
        var dataId = e.id;
        var data = this.dm.getDataById(dataId);
        if (data) {
            this.de.lookAtByData(data);
        }
    },

    getDataFinderResults: function () {
        var conditions = [];
        var positionValue = this.appPanel.UPreOccupiedApp('getAreaSelectValue', 'position');
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

    updateUPreOccupiedUserData: function(params){
        var data = params.data;
        var space = params.space;

        if(!space){
            space = data.getUserData('UPreOccupied_space');
        }
        if(!space){
            console.log(it.util.i18n('U_Pre_Occupied_Lack')+'space');
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
                if(rackArray[deviceStart + j - 1] != 0){
                    // 设备占用在设备，或者设备占用在被预占
                    console.log(it.util.i18n('U_Pre_Occupied_Device_Area_Problem'));
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

    computeListByRackArray: function(params){
        var data = params.data;
        var rackArray = params.rackArray;
        if(!rackArray){
            data.getUserData('UPreOccupied_rackArray');
        }
        var occupiedU = this.uPreMsg[data.getId()];
        var spaceState = null;
        var spaceStart = null;
        var emptyList = [], preOccupiedList = [];
        for (var key in occupiedU) {
            var extend = occupiedU[key].extend;
            if(extend){
                preOccupiedList.push({
                    start: extend.start,
                    end: extend.end,
                    total: extend.total,
                });
            }
            
        }

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
                        } else if(spaceState == 2){
                            // preOccupiedList.push(obj);
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
                    } else if(spaceState == 2){
                        // preOccupiedList.push(obj);
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
                        } else if(spaceState == 2){
                            // preOccupiedList.push(obj);
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
            prex += '(' + count + it.util.i18n('AllSpaceSearch_Unit')+')';
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

    deselectAllTree: function () {
        if (this.appPanel) {
            this.appPanel.UPreOccupiedApp('deselectAllTree');
        }
    },

});
it.UPreOccupiedApp = $UPreOccupiedApp;