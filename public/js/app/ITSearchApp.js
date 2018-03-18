var $ITSearchApp = function(sceneManager, searchPane) {
    $Application.call(this, sceneManager, searchPane);
    this.sceneManager = sceneManager;
    this.dataManager = this.sceneManager.dataManager;
    this.box = this.sceneManager.network3d.getDataBox();
    this.defaultEventHandler = this.sceneManager.viewManager3d.defaultEventHandler;
    this.searchMainDiv = $('<div></div>');

    this.treeView = null;
    this.orgTreeManager = new it.NewOrganizeTreeManager(this.sceneManager.dataManager, null, dataJson.treeIcon);
    this.dataFinder = new it.NewDataFinder(this.sceneManager.dataManager);
    this.selectTreeView = null;
    this.selectTreeCategory = ['floor', 'room', 'building', 'channel', 'dataCenter', 'area'];
    this.selectOrgTreeManager = new it.SelectOrganizeTreeManager(this.sceneManager.dataManager, null, dataJson.treeIcon, this.selectTreeCategory);
    this.selectDataFinder = new it.SelectDataFinder(this.sceneManager.dataManager);

    this.itSearchManager = new it.ITSearchManager(this.sceneManager);
    this.visibleManager = new it.VisibleManager(this.sceneManager);

    // this.init(); // 对于资产搜索一开始就初始化
};

mono.extend($ITSearchApp, $Application, {

    init: function() {
        this.isInit = true;
        this.sceneManager.viewManager3d.addVisibleFilter(this.visibleManager);
        var self = this;

        //添加过滤
        this.dataFinder.filter = function (data) {
            var category = main.sceneManager.dataManager.getCategoryForData(data);
            var filterList = dataJson.ITSearchFilterList;
            if (category) {
                if (category.getId().toLowerCase() == 'widget') {
                    return false;
                }
                if (filterList && filterList instanceof Array) {
                    for (var i = 0; i < filterList.length; i++) {
                        if (filterList[i] == category.getId()) {
                            return false;
                        }
                    }
                }
            }
            return true;
        }

        var isConform = this.dataFinder.isDataConformCondition;
        this.dataFinder.isDataConformCondition = function (data, condition, key) {
            key = key || condition.key;
            if (data && key && key === 'data.dataType.size.y') { //搜索设备的U数
                var dataType = self.sceneManager.dataManager.getDataTypeForData(data);
                if (dataType && dataType.getSize() && dataType.getSize().ySize) {
                    var operation = condition.operation;
                    var value = condition.value;
                    var dataValue = dataType.getSize().ySize;
                    var compareMethod = self.dataFinder[operation];
                    if (typeof compareMethod === 'function') {
                        return self.dataFinder[operation](value, dataValue, key);
                    } else {
                        return self.dataFinder.other(value, dataValue, key, operation, 'number');
                    }
                }
                return false;
            }
            return isConform.call(self.dataFinder, data, condition, key);
        }

        if(!$('.view-control').children().hasClass('new-itv-search-panel')){
            var searchDiv = $('<div>').addClass('new-itv-search-panel');
            $('.view-control').append(searchDiv);
            searchDiv.itSearch({
                items: {
                    bussinessType: self.createCategoryOption(),
                    categorys: self.dataManager._categories,
                    categoryDatas: self.dataManager._categoryDatas,
                    businessTypes: self.sceneManager.dataManager._businessTypeMap,
                    businessTypeOption: self.createBusinessTypeOption(),
                    dataTypeOption: self.createDataTypeOption(),
                    selectTreeCategory: self.selectTreeCategory
                },
                createTree: function (event, data) {
                    var dataList = data.results,
                        filterList = main.systemConfig.filter_asset_list;
                    self.addTreeFilter(dataList,filterList);
                    var treeNodes = self.createSearchTree(dataList, data.treeBox);

                    var isIquipment = data.equipmentId == 'equipment';
                    self.allDeviceIconsRemove();
                    self._createSearch3Deffect(treeNodes, isIquipment);

                    self.treeView.clickNodeFunction = function (treeData) {
                        self.clickTreeNode(treeData);
                    };

                    self.treeView.mouseoverNodeFunction = function (treeData) {
                        self.mouseOverTreeNode(treeData);
                    };

                    self.sceneManager.viewManager3d.clearVisibleMap();

                    var currentNode = self.sceneManager.viewManager3d.getFocusNode();
                    var rootNode = self.sceneManager.getCurrentRootNode();
                    if(currentNode != rootNode){
                        self.sceneManager.viewManager3d.lookAt(rootNode);
                    }
                },
                createSelectTree: function (event, data) {
                    var results = self.selectDataFinder.find(data.conditions);
                    self.createSelectTree(results, data.inputPanel);
                },
                clearBillbd: function () {
                    self.itSearchManager.clearBillboard();
                    self.allDeviceIconsRemove();
                },
                getResults: function (event, data) {
                    var results = self.dataFinder.find(data.conditions);
                    data.callback(results);
                }
            });
            searchDiv.hide();
        }
        this.appPanel = $('.new-itv-search-panel');

        this.deviceIcon = new Image();
        this.deviceIcon.src = pageConfig.url('/images/device/deviceBillboard.png');

    },

    addTreeFilter: function(dataList,filterList) {
        var self = this;
        if (!dataList.length || !filterList.length) return;
        for(var i=0;i<dataList.length;i++){
            var data = dataList[i],
                category = self.sceneManager.dataManager.getCategoryForData(data),
                node = self.sceneManager.getNodeByDataOrId(data),
                categoryId = category.getId();
            if (filterList.indexOf(categoryId) != '-1'){
                dataList.splice(i,1);
                //node.setParent(null);
                i--;
            }
        };
    },

    makeDeviceIconBillboard: function(params){
        var number = params.number;
        var position = params.position;
        var rackNode = params.rackNode;
        
        var board = it.util.makeNumberTipBillboard({
            image: this.deviceIcon,
            number: number,
            scale: [0.4, 0.4],
        });
        // board.s({
        //     'm.fixedSize': 6000,
        // })
        board.setPosition(position);
        return board;
    },

    makeDeviceIcon: function(options){
        var data = options.data;
        var deviceNumber = options.deviceNumber;

        var id = data._id;
        var node = this.sceneManager.getNodeByDataOrId(data);
        var boundingBox = node.getBoundingBox();
        var min = boundingBox.min;
        var max = boundingBox.max;
        var center = boundingBox.center();
        var size = boundingBox.size();
        var position, rackAlarm, alarmBillboard, oldAlarmBillboardPosition, newAlarmBillboardPosition;
        var board;

        if (deviceNumber == 0) {
            board = null;
        } else {
            if (data.getAlarmState()._alarmCount > 0 && node.getClient('_alarmBillboard')) {
                rackAlarm = true;
                alarmBillboard = node.getClient('_alarmBillboard');
                var alarmP = alarmBillboard.getPosition();
                oldAlarmBillboardPosition = alarmP;
                newAlarmBillboardPosition = new mono.Vec3(alarmP.x, alarmP.y, alarmP.z - size.z / 4);
                position = new mono.Vec3(alarmP.x, alarmP.y, alarmP.z + size.z / 4);
            } else {
                rackAlarm = false;
                position = new mono.Vec3(center.x, max.y, center.z);
            }
            board = this.makeDeviceIconBillboard({
                number: deviceNumber,
                rackNode: node,
                position: position,
            });
            if(rackAlarm){
                alarmBillboard.setPosition(newAlarmBillboardPosition);
            }
            board.setParent(node);
            this.box.add(board);
        }

        this.allDeviceIcons[id] = {
            iconState: true,
            rackId: id,
            board: board,
            rackNode: node,
            rackAlarm: rackAlarm,
            alarmBillboard: alarmBillboard,
            oldAlarmBillboardPosition: oldAlarmBillboardPosition,
            newAlarmBillboardPosition: newAlarmBillboardPosition,
        }
    },

    deviceIconHide: function(dataId){
        if(this.allDeviceIcons){
            var icon = this.allDeviceIcons[dataId];
            if(icon&&icon.board&&icon.iconState){
                icon.board.setParent(null);
                icon.iconState = false;
                this.box.remove(icon.board);
                it.util.clearBillboardCache(icon.board);
                if (icon.rackAlarm) {
                    icon.alarmBillboard.setPosition(icon.oldAlarmBillboardPosition)
                }
            }
        } 
    },

    allDeviceIconsHide: function(){
        if(this.allDeviceIcons){
            for (var key in this.allDeviceIcons) {
                this.deviceIconHide(key);
            }
        }
    },
    
    allDeviceIconsRemove: function(){
        this.allDeviceIconsHide();
        this.allDeviceIcons = {};
    },

    isShowSearchInputPanel : function(){
        return true;
    },

    doShow: function() {
        if(!this.isInit){
            this.init();
        }
        // this.searchPane.show(this.searchMainDiv);
        if (main.filterMenu) {
             main.filterMenu.showFilterMenu();
         }
        // this.app.show();
        this.showSceneInfo();
        if (this.appPanel) {
            this.appPanel.itSearch('removeSearchTree');
            this.appPanel.itSearch('removeNoResult');
        }
        this.appPanel.itSearch('doShow');
        this.appPanel.itSearch('setHeight');
        // this.appPanel&&this.appPanel.show();
        this.visibleChannels();
        this.allDeviceIcons = {};
    },

    visibleChannels: function(){
        var allChannelsData = this.dataManager.getDataMapByCategory('channel');
        for (var key in allChannelsData) {
            this.visibleManager.setVisible(allChannelsData[key], false);
        }
    },

    showSceneInfo: function() {
        var scene = this.sceneManager.getCurrentScene();
        if (!scene || (scene.isShowStaticInfo && scene.isShowStaticInfo())) {
            main.sceneInfo.showSceneStatisInfo();
        } else {
            main.sceneInfo.hideRoomInfo();
        }
    },

    doClear: function() {
        this.visibleManager.clear();
        this.itSearchManager.clearBillboard();
        this.appPanel && this.appPanel.hide();
        this.appPanel.find('input').each(function(){
            $(this).val('');
        }) 
        this.allDeviceIconsRemove();
        this.sceneManager.network3d.dirtyNetwork();
    },

    ifCloseWhenFocusChange: function(node, oldNode){
		return false;
    },

    createSearchTree: function (results, inputPane, height) {
        var self = this;
        var el = this.element;
        this.treeView = new it.TreeView(inputPane);
        var treeNodes = null;
        if (!results || results.length < 1) {
            this.treeView.clearTreeData();
        } else {
            treeNodes = this.orgTreeManager.organizeTree(results);
            this.treeView.setData(treeNodes, false);
        }
        self.treeView.setTreeHeight(height);
        return treeNodes;
        // var readyNumber = 0;
        // var openNumber = 0;
        // if (self.treeView.treeView.jstree(true)) {
        //     self.treeView.treeView.on('ready.jstree', function (e, data) {
        //         readyNumber++;
        //         if (readyNumber == 1) {
        //             setTimeout(function () {
        //                 self.treeView.treeView.jstree(true).open_all();                         
        //             }, 300)
        //         }
        //     });

        //     self.treeView.treeView.on('open_all.jstree', function () {
        //         openNumber++;
        //         if (openNumber == 2) {
        //             self.orgTreeManager.scendList.forEach(function (v) {
        //                 // $('li#' + v).removeClass('jstree-loading');
        //             });

        //         }

        //     });
        // }
    },
    
    createSelectTree: function (results ,inputPane) {
        var self = this;
        this.selectTreeView = new it.TreeView(inputPane);
        var treeNodes = null;
        treeNodes = this.selectOrgTreeManager.organizeTree(results);
        this.selectTreeView.setData(treeNodes, false);
        self.selectTreeView.clickNodeFunction = function (treeData) {
            self.appPanel.itSearch('setSelectValue', treeData.id);
        };
        return treeNodes;
    },

    getTreeView: function () {
        return this.treeView;
    },

    _createSearch3Deffect: function (treeNodes, isEquipment) {
        this.itSearchManager.clearBillboard();
        this.itSearchManager.virtualManager.addAll();
        if (!treeNodes) return;
        if(isEquipment){
            for (var i = 0; i < treeNodes.length; i++) {
                var treeNode = treeNodes[i];
                this.showDeviceIcons(treeNode);
            }
        } else{
            for (var i = 0; i < treeNodes.length; i++) {
                var treeNode = treeNodes[i];
                this.show3Deffect(treeNode);
            }
        }
    },

    showDeviceIcons: function(treeNode){
        var data = this.orgTreeManager.getDataByNode(treeNode);
        if (!data) {
            return;
        }
        this.itSearchManager.virtualManager.remove(data);
        var categoryId = this.dataManager.getCategoryForData(data).getId();
        if(categoryId == 'rack'){
            var children = this.orgTreeManager.getChildren(treeNode);
            if (children && children.length > 0) {
                var options = {
                    data: data,
                    deviceNumber: children.length,
                }
                this.makeDeviceIcon(options);
            }
        }
        var children = this.orgTreeManager.getChildren(treeNode);
        if (children && children.length > 0) {
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (child) {
                    this.showDeviceIcons(child);
                }
            }
        }
    },

    show3Deffect: function (treeNode) {
        var data = this.orgTreeManager.getDataByNode(treeNode);
        if (!data) {
            return;
        }
        if (this.itSearchManager.showBillboard(data)) {
            this.itSearchManager.addDataBillBoard(data);
        }
        this.itSearchManager.virtualManager.remove(data); //同理 removeByDescendant

        // 当搜索项为机柜时，需要把它里面的设备展示出来，而对应的树却没有孩子node，因此单独写。 2018-1-22 add by lyz
        var categoryId = this.dataManager.getCategoryForData(data).getId();
        if(categoryId == 'rack'){
            var childrenDatas = data._childList._as;
            for (var i = 0; i < childrenDatas.length; i++) {
                this.itSearchManager.virtualManager.remove(childrenDatas[i]);
            }
        }
        
        var children = this.orgTreeManager.getChildren(treeNode);
        if (children && children.length > 0) {
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (child) {
                    this.show3Deffect(child);
                }
            }
        }
    },
    /**
     * 点击树上的节点，camera自动移过去
     * 注意：当前是在dc场景下，点击node时应当判断其所在的场景，如果不是在同一场景下得清空，否则的会会存在问题;
     * 注意2：即使nodeScene和currentScene，有可能它们的rootNode不一样，如，1楼的机柜和2楼的机柜;
     *
     * @param treeData
     */
    clickTreeNode: function (treeData) {
        var self = this;
        var id = treeData.id;
        if (!id) return;
        if (!this.sceneManager.viewManager3d.enableDBLClick) { //表示锁定，场景切换的过程中，不可点击再切换
            return;
        }
        var data = this.sceneManager.dataManager.getDataById(id);
        if (!data || !this.treeView.isClick(data)) return;
        var assetNode = this.sceneManager.dataNodeMap[id];
        //        var nodeData = this.sceneManager.getNodeData(assetNode);
        if (!this.shouldClick(data)) {
            return;
        }
        if (!this.sceneManager.isCurrentSceneInstance(data, true)) { //如果一下子跳到其他的场景的某个非根对象
            var sceneAndRootData = this.sceneManager.getSceneAndRootByData(data);
            if (sceneAndRootData) {
                this.sceneManager.gotoScene(sceneAndRootData.scene, sceneAndRootData.rootData, null, false);
                //以下有可能存在一些不合理，因为gotoScene中可能会存在很长时间的动画，特别是楼层切换那块，马上这么调用，有可能有问题
                //如果是整个楼层的话，就不需这么lookAt了(严格意义上说是Data本身就在场景的root就不需再去设置镜头了)
                if (sceneAndRootData.rootData != data) {
                    assetNode = this.sceneManager.dataNodeMap[id];
                    if (!assetNode) {
                        this.sceneManager.loadLazyData(data);
                    }
                } else {
                    return; //根节点就是clickData，那就返回吧
                }
            }
        }
        //注意以下两种情况：
        //1、还没有创建，如lazyable的设备，只有在focus该机柜时，它的孩子设备才会被创建(第一次)并加到box中
        //2、有可能就是存在该场景中，只是不在box中而已，如：lazyable模式下，设备都被移除掉了
        var box3d = this.sceneManager.network3d.getDataBox();
        // if (!assetNode || !box3d.getDataById(assetNode.getId())) {
        //     this.sceneManager.loadLazyData(data);
        //     if (!assetNode) {
        //         assetNode = this.sceneManager.dataNodeMap[data.getId()];
        //     }
        // }
        // if (this.defaultEventHandler &&
        //     assetNode != this.sceneManager.getCurrentRootNode()) { //gotoScene中有setFocus，并且该方法有可能会重写
        //     this.defaultEventHandler.lookAt(assetNode);
        // }
        // 修复点击搜索树上的设备，初次点击要点两次才跳到设备的问题，原因是因为现在设备模型更改后，现在的设备是异步加载的
        // 2018-1-11 add by lyz 
        if (!assetNode || !box3d.getDataById(assetNode.getId())) {
            var loadLazyDataCallback =  function(){
                if (!assetNode) {
                    assetNode = self.sceneManager.dataNodeMap[data.getId()];
                }
                if (self.defaultEventHandler &&
                    assetNode != self.sceneManager.getCurrentRootNode()) { //gotoScene中有setFocus，并且该方法有可能会重写
                    self.defaultEventHandler.lookAt(assetNode);
                }
            };
            this.sceneManager.loadLazyData(data, loadLazyDataCallback);
        } else{
            if (this.defaultEventHandler &&
                assetNode != this.sceneManager.getCurrentRootNode()) { //gotoScene中有setFocus，并且该方法有可能会重写
                this.defaultEventHandler.lookAt(assetNode);
            }
        }
    },

    shouldClick: function (data) {
        return true;
    },

    mouseOverTreeNode: function (treeData) {
        var id = treeData.id;
        this.sceneManager.network3d.getDataBox().getSelectionModel().clearSelection();
        if (id) {
            var assetNode = this.sceneManager.dataNodeMap[id];
            if (assetNode) {
                assetNode.setSelected(true);
            }
        }
    },

    createBusinessTypeOption: function (isWithNull) {
        var businessTypes = this.dataManager._businessTypeMap;
        if (businessTypes) {
            var options = [':' + it.util.i18n("ITVSearchBasePanel_All")];
            if (isWithNull) { //有时用这个用于表单中，最终要将其值做为某个属性写到数据库中
                options = [':'];
            }
            for (var typeId in businessTypes) {
                var businessType = this.dataManager._businessTypeMap[typeId];
                if (businessType) {
                    var searchFilter = businessType.getUserData('searchFilter');
                    if (searchFilter) {
                        options.push(businessType.getId() + ':' + (businessType.getName() || businessType.getId()));
                    }
                }
            }
            options.sort(this.sortFunction);
            return options;
        }
        return null;
    },

    createDataTypeOption: function (businessTypeId, isCheckEmptyDataType) {
        var dataTypeDatas = this.dataManager._dataTypeDatas; //不直接用dataTypeMap是因为可能有很多的dataType没有对应的资产
        // var dataTypeMap = this.dataManager._dataTypeMap;
        var dataTypeMap = this.dataManager._dataTypeMap;
        if (dataTypeMap) {
            // var options = [':' + it.util.i18n("ITVSearchBasePanel_All")]; //['all:全部'] ,"all"不能被识别，直接去掉了
            var options = [{
                content: it.util.i18n("ITVSearchBasePanel_All"),
                value: '',
            }]; 
            for (var typeId in dataTypeMap) {
                var dataType = this.dataManager._dataTypeMap[typeId];
                if (SETTING && SETTING.businessTypeWithDataType && businessTypeId) {
                    if (!dataType.getUserData('businessTypeId') ||
                        dataType.getUserData('businessTypeId') != businessTypeId) {
                        continue;
                    }
                }
                var category = this.dataManager.getCategoryForDataType(dataType);
                if (category) {
                    if (category.getId().toLowerCase() === 'datacenter') {
                        continue;
                    } else if (category.getId().toLowerCase() === 'building') {
                        continue;
                    } else if (category.getId().toLowerCase() === 'floor') {
                        continue;
                    } else if (category.getId().toLowerCase() === 'room') {
                        continue;
                    }
                }
                if (isCheckEmptyDataType == undefined || isCheckEmptyDataType == null) {
                    isCheckEmptyDataType = true;
                }
                if (!!isCheckEmptyDataType && main.hideEmptyDataType && main.hideEmptyDataType()) {
                    if (!dataTypeDatas[typeId] || Object.keys(dataTypeDatas[typeId]).length == 0) {
                        continue;
                    }
                }
                var cSearchFilter = category.getUserData('searchFilter');
                if (dataType) {
                    var dSearchFilter = dataType.getUserData('searchFilter');
                    if (cSearchFilter && dSearchFilter) {
                        // options.push(dataType.getId() + ':' + (dataType.getDescription() || dataType.getId()));
                        options.push({
                            content: dataType.getDescription() || dataType.getId(),
                            value: dataType.getId(),
                            categoryId: category.getId(),
                        });
                    }
                }
            }
            options.sort(this.sortFunction2);
            return options;
        }
        return null;
    },

    createCategoryOption: function(isWithNull) {
        var self = this,
            categoryMap = [],
            options = [],
            dataMap = this.dataManager._dataMap;
        for(var key in dataMap) {
            var data = dataMap[key],
                category = self.dataManager.getCategoryForData(data), 
                id = category.getId(),
                description = category.getDescription() || category.getId(),
                searchFilter = category.getUserData('searchFilter');
            if ((categoryMap.indexOf(id) == '-1') &&  searchFilter){
                if (id == 'equipment') {
                    categoryMap.unshift(id);
                    options.unshift(id + ':' + description);
                } else {
                    categoryMap.push(id);
                    options.push(id + ':' + description);
                }
            };
        };
        return options;
    },

    sortFunction: function (a, b) {
        if (!a) {
            return -1;
        }
        if (!b) {
            return 1;
        }
        var des1 = '',
            des2 = '';
        var str1 = a.split(':');
        if (str1 && str1.length == 2) {
            des1 = str1[1];
        }
        var str2 = b.split(':');
        if (str2 && str2.length == 2) {
            des2 = str2[1];
        }
        if (des1 == 'all' || des1 == it.util.i18n("ITVSearchBasePanel_All") || des1 == '') {
            return -1;
        } else if (des2 == 'all' || des2 == it.util.i18n("ITVSearchBasePanel_All") || des2 == '') {
            return 1;
        }
        return it.Util.compare(des1, des2);
    },

    sortFunction2: function(a, b){
        if (!a) {
            return -1;
        }
        if (!b) {
            return 1;
        }
        var des1 = a.content;
        var des2 = b.content;
        if (des1 == 'all' || des1 == it.util.i18n("ITVSearchBasePanel_All") || des1 == '') {
            return -1;
        } else if (des2 == 'all' || des2 == it.util.i18n("ITVSearchBasePanel_All") || des2 == '') {
            return 1;
        }
        return it.Util.compare(des1, des2);
    },
});

fa.ITSearchApp = $ITSearchApp;