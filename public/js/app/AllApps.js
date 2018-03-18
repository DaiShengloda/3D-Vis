/**
 * 注册所有的应用
 */


/**
 * 空间-电力-承重统一可视化
 */
var $SpaceEleWeight = function (sceneManager, searchPane) {
    it.Application.call(this, sceneManager, searchPane);
    // this.searchPane = searchPane;
};

mono.extend($SpaceEleWeight, it.Application, {

    init: function () {
        var self = this;
        this.app = new AllSpaceSearch(this.sceneManager);
        // main.allSpaceSearch.beforeDoClick = function(){
        //   self.reset();
        // }
        this.app.beforeDoClick = function () {
            self.beforeDoClick();
        }
    },

    clearItSearch: function () {
        return true;
    },

    isShowSearchInputPanel: function () {
        return true;
    },

    doShow: function () {
        var div = this.app.getRootView();
        this.app.setData();
        this.searchPane.show(div);
        // self.itvToggleBtn.show();
    },

    doClear: function () {
        this.app.clear();
    }

});

it.SpaceEleWeight = $SpaceEleWeight;

/**
 * 设备上架
 */
var $Deviceon = function (sceneManager, searchPane) {
    it.Application.call(this, sceneManager, searchPane);
    // this.searchPane = searchPane;
};

mono.extend($Deviceon, it.Application, {

    init: function () {
        this.app = new it.DeviceOn(this.sceneManager);
        this.dataManager = this.sceneManager.dataManager;
        var allDatatypes = [];
        for (var i in this.dataManager._dataTypeMap) {
            if (this.dataManager._dataTypeMap[i]._categoryId == 'equipment') {
                allDatatypes.push(this.dataManager._dataTypeMap[i]);
            }
        }
        this.allDatatypes = allDatatypes;
    },

    getBusinessOptions: function () {
        var currentBusiness = [];
        currentBusiness.push({
            value: '',
            content: it.util.i18n("All"),
        });
        var businessTypes = this.dataManager._businessTypeMap;
        for (var typeId in businessTypes) {
            var businessType = this.dataManager._businessTypeMap[typeId];
            if (businessType) {
                var searchFilter = businessType.getUserData('searchFilter');
                if (searchFilter) {
                    currentBusiness.push({
                        value: businessType.getId(),
                        content: businessType.getName() || businessType.getId(),
                    });
                }
            }
        }
        return currentBusiness;
    },

    getConditions: function () {
        var conditions = [];
        var bussinessValue = this.appPanel.NewDeviceOnApp('getSelectValue', 'bussiness');
        if (bussinessValue && bussinessValue != '') {
            conditions.push({
                key: 'businessTypeId',
                value: bussinessValue,
            });
        }
        return conditions;
    },

    makeFinder: function (datatype, condition) {
        // var flag = false;
        switch (condition.key) {
            case 'businessTypeId':
                {
                    var businessTypeId = datatype._userDataMap && datatype._userDataMap.businessTypeId;
                    if (businessTypeId == condition.value) {
                        return true;
                    } else {
                        return false;
                    }
                }
                break;
        }
        return false;
    },

    getDatatypeResults: function () {
        var conditions = this.getConditions();
        var allDatatypes = this.allDatatypes;
        var results = [];
        var jishuqi = 0;
        if (conditions.length == 0) {
            for (var i in allDatatypes) {
                results.push(allDatatypes[i]);
                jishuqi++;
            }
            // console.log(jishuqi)
            return results;
        }
        for (var i in allDatatypes) {
            var flag = true;
            for (var j = 0; j < conditions.length; j++) {
                flag = this.makeFinder(allDatatypes[i], conditions[j])
                if (!flag) {
                    break;
                }
            }
            if (flag) {
                results.push(allDatatypes[i]);
            }
        }
        return results;
    },

    makeBoxContents: function (results) {
        var self = this;
        var item, itemTitle, itemPic, title, img, src, id;
        for (var i = 0; i < results.length; i++) {
            id = results[i].getId();
            title = results[i].getDescription() || results[i].getId();
            // src = '../../theme/models/' + id + '/' + id + '_front.jpg';
            src = pageConfig.url('/theme/models/' + id + '/' + id + '_front.jpg');
            item = $('<div>').addClass('datatype-item').attr('ids', id);
            itemTitle = $('<div>').addClass('datatype-item-title').text(title).appendTo(item);
            itemPic = $('<div>').addClass('datatype-item-pic').appendTo(item);
            img = $('<img>').attr('src', src).appendTo(itemPic);
            this.datatypeBox.append(item);
            item.on('mousedown', function () {
                var $this = $(this);
                var parent = $this.parent();
                parent.children().removeClass('active');
                $this.addClass('active');
                // console.log('点击了' + $this.attr('ids'))
                self.app.selectDevice($this.attr('ids'));
            })
            item.attr({ 'draggable': true });
            img.on('error', function () {
                $(this).parent().parent().remove();
                // console.log('error')
            })
        }
    },

    makeDatatypeBox: function () {
        var results = this.getDatatypeResults();
        // console.log(results)
        this.datatypeBox = $('<div>').addClass('datatype-box bt-scroll').appendTo(this.appPanel);
        this.makeBoxContents(results);
    },

    removeDatatypeBox: function () {
        if (this.datatypeBox) {
            this.datatypeBox.remove();
        }
    },

    doSearchIt: function () {
        var self = this;
        this.appPanel.NewDeviceOnApp('createSearchResultTitle');
        this.removeDatatypeBox();
        this.makeDatatypeBox();
        this.app.appStart();
        // console.log('点击搜索');
    },

    doClearIt: function () {
        this.appPanel&&this.appPanel.NewDeviceOnApp('refreshAll');
        this.removeDatatypeBox();
        // console.log('点击清除');
        this.app.clearGreenPops();
        this.app.removeOnBtn();
    },

    doShow: function () {
        var self = this;
        // if(!$('.view-control-left').find('.new-apps-box')){
        //     var $box = $('<div>').addClass('.new-apps-box').appendTo('.view-control-left')
        // }
        this.appPanel = $('<div>').addClass('new-app-panel').appendTo($('.new-apps-box'));
        this.appPanel.NewDeviceOnApp({
            bussinessSelects: this.getBusinessOptions(),
            doSearchIt: function (e) {
                self.doSearchIt();
            },
            doClearIt: function (e) {
                self.doClearIt();
            },
        });
        this.doSearchIt();
        // this.app.appStart();
        ServerUtil.msg(it.util.i18n('Device_On_Start'));
        // ServerUtil.msg('选择设备后点击绿色块进行上架');
    },

    doClear: function () {
        // 设备上架的清除doNothing
        this.appPanel && this.appPanel.NewDeviceOnApp('destory');
        this.appPanel = null;
        this.app && this.app.appEnd();
    },
});

it.Deviceon = $Deviceon;

/**
 * 设备下架
 */
var $Deviceoff = function (sceneManager, searchPane) {
    it.Application.call(this, sceneManager, searchPane);
};

mono.extend($Deviceoff, it.Application, {

    init: function () {
        this.app = new it.DeviceOff(this.sceneManager, this);
        this.appPanel = null;
        this.dataManager = this.sceneManager.dataManager;
        this.dataFinder = new it.DataFinder(this.dataManager);
        this.dataFinder.getDatas = function () {
            var datas = this.dataManager.getDataMapByCategory('equipment');
            var results = [];
            for (var n in datas) {
                if (main.sceneManager.isCurrentSceneInstance(datas[n])) {
                    results.push(datas[n]);
                }
            }
            return results;
        }
    },

    findAncestorToFloor: function (data, ancestorId) {
        if (!data || !ancestorId) {
            return false;
        }
        if (data.getId() == ancestorId) {
            return true;
        } else if (data.getParentId() == ancestorId) {
            return true;
        } else if (!data.getParentId()) {
            return false;
        } else {
            var parentData = this.dataManager.getDataById(data.getParentId());
            if (parentData) {
                var catogory = this.dataManager.getCategoryForData(parentData);
                if (catogory._id == 'floor') {
                    return false;
                }
                return this.findAncestorToFloor(parentData, ancestorId);
            }
        }
    },

    getRoomOptions: function () {
        var currentRooms = [];
        currentRooms.push({
            value: '',
            content: it.util.i18n("All"),
        })
        var allRooms = this.dataManager.getDataMapByCategory('room');
        if (this.currentFloorId) {
            for (var i in allRooms) {
                if (this.findAncestorToFloor(allRooms[i], this.currentFloorId)) {
                    currentRooms.push({
                        value: allRooms[i].getId(),
                        content: allRooms[i].getName() || allRooms[i].getId(),
                    });
                }
            }
        }
        return currentRooms;
    },

    findRoomWithRacks: function (data) {
        var category = this.dataManager.getCategoryForData(data);
        if (category) {
            var categoryId = category._id;
            if (categoryId == 'room') {
                return data._id;
            } else {
                if (data._parentId) {
                    var parentId = data._parentId;
                    var parentData = this.dataManager.getDataById(parentId);
                    if (parentData) {
                        return this.findRoomWithRacks(parentData);
                    }
                } else {
                    return false;
                }
            }
        } else {
            return false;
        }
    },

    getRackOptions: function () {
        var currentRacks = [];
        currentRacks.push({
            value: '',
            content: it.util.i18n("All"),
            parent: ''
        });
        var allRacks = this.dataManager.getDataMapByCategory('rack');
        if (this.currentFloorId) {
            for (var i in allRacks) {
                var parentId = allRacks[i]._parentId;
                var parentData = this.dataManager.getDataById(parentId);
                if (parentData && this.findAncestorToFloor(allRacks[i], this.currentFloorId)) {
                    var roomId = this.findRoomWithRacks(parentData);
                    if (roomId) {
                        currentRacks.push({
                            value: allRacks[i].getId(),
                            content: allRacks[i].getName() || allRacks[i].getId(),
                            parent: roomId,
                        });
                    }
                }
            }
        }
        return currentRacks;
    },

    getBusinessOptions: function () {
        var currentBusiness = [];
        currentBusiness.push({
            value: '',
            content: it.util.i18n("All"),
        });
        var businessTypes = this.dataManager._businessTypeMap;
        for (var typeId in businessTypes) {
            var businessType = this.dataManager._businessTypeMap[typeId];
            if (businessType) {
                var searchFilter = businessType.getUserData('searchFilter');
                if (searchFilter) {
                    currentBusiness.push({
                        value: businessType.getId(),
                        content: businessType.getName() || businessType.getId(),
                    });
                }
            }
        }
        return currentBusiness;
    },

    getDatatypeOptions: function () {
        var currentDataTypes = [];
        currentDataTypes.push({
            value: '',
            content: it.util.i18n("All"),
        });
        var dataTypes = this.dataManager._dataTypeMap;
        for (var typeId in dataTypes) {
            var dataType = this.dataManager._dataTypeMap[typeId];
            if (dataType) {
                var searchFilter = dataType.getUserData('searchFilter');
                if (searchFilter) {
                    var category = this.dataManager.getCategoryForDataType(dataType);
                    if (category._id == 'equipment') {
                        currentDataTypes.push({
                            value: dataType.getId(),
                            content: dataType.getDescription() || dataType.getId(),
                        });
                    }
                }
            }
        }
        return currentDataTypes;
    },

    getConditions: function () {
        var conditions = [];

        var roomValue = this.appPanel.NewDeviceOffApp('getSelectValue', 'room');
        if (roomValue) {
            conditions.push({
                key: 'ancestor',
                value: roomValue,
            });
        }

        var rackValue = this.appPanel.NewDeviceOffApp('getSelectValue', 'rack');
        if (rackValue) {
            conditions.push({
                key: 'ancestor',
                value: rackValue,
            });
        }

        var bussinessValue = this.appPanel.NewDeviceOffApp('getSelectValue', 'bussiness');
        if (bussinessValue) {
            conditions.push({
                key: 'D:businessTypeId',
                value: bussinessValue,
                dataType: 'string',
                operation: 'like'
            });
        }

        var datatypeValue = this.appPanel.NewDeviceOffApp('getSelectValue', 'datatype');
        if (datatypeValue) {
            conditions.push({
                key: 'dataTypeId',
                value: datatypeValue,
                dataType: 'string',
                operation: 'like'
            });
        }

        var idValue = this.appPanel.NewDeviceOffApp('getInputValue', 'id');
        if (idValue) {
            conditions.push({
                key: 'id',
                value: idValue,
                dataType: 'string',
                operation: 'like'
            });
        }

        var nameValue = this.appPanel.NewDeviceOffApp('getInputValue', 'name');
        if (nameValue) {
            conditions.push({
                key: 'name',
                value: nameValue,
                dataType: 'string',
                operation: 'like'
            });
        }
        return conditions;
    },

    getResultsByConditions: function (conditions) {
        return this.dataFinder.find(conditions);
    },

    getResults: function (conditions) {
        var results = this.getResultsByConditions(conditions);
        // console.log(results);
        return results;
    },

    doSearchIt: function () {
        var self = this;
        if (!this.appPanel) {
            return;
        }
        var conditions = this.getConditions();
        var results = this.getResults(conditions);
        this.appPanel.NewDeviceOffApp('createSearchResultTitle');
        var height = it.util.calculateHeight("new-apps-box");
        var option = {
            results: results,
            parent: this.appPanel,
            height: height,
            clickTreeNode: function (treeData) {
                self.app.clickTreeNodeHandle(treeData);
            },
        }   
        this.appPanel.NewDeviceOffApp('createSearchTree', option);
        // console.log('点击搜索');
    },

    doClearIt: function () {
        this.appPanel&&this.appPanel.NewDeviceOffApp('refreshAll');
        // console.log('点击清除');
    },

    doShow: function () {
        var self = this;
        this.currentFloorNode = this.sceneManager.getCurrentRootNode();
        if (this.currentFloorNode) {
            this.currentFloorId = this.currentFloorNode._clientMap.it_data_id;
        }
        var currentFocusNode = this.sceneManager.viewManager3d.getFocusNode();
        if (currentFocusNode == this.currentFloorNode) {
            this.appPanel = $('<div>').addClass('new-app-panel').appendTo($('.new-apps-box'));
            this.appPanel.NewDeviceOffApp({
                roomSelects: this.getRoomOptions(),
                rackSelects: this.getRackOptions(),
                bussinessSelects: this.getBusinessOptions(),
                datatypeSelects: this.getDatatypeOptions(),
                doClearIt: function (e) {
                    self.doClearIt();
                },
                doSearchIt: function (e) {
                    self.doSearchIt();
                },
            });
        } else {
            ServerUtil.msg(it.util.i18n("DeviceOff_Click_Deviceoff"));
        }
        this.app.appStart();
    },

    doClear: function () {
        this.appPanel && this.appPanel.NewDeviceOffApp('destory');
        this.appPanel = null;
        this.app.appEnd();
    },

    ifCloseWhenFocusChange: function (node, oldNode) {
        var data = this.sceneManager.getNodeData(node);
        var dt = this.sceneManager.dataManager.getDataTypeForData(data);
        var categoryId = dt.getCategoryId();
        // var oldData = this.sceneManager.getNodeData(oldNode);
        // var oldDt = this.sceneManager.dataManager.getDataTypeForData(oldData);
        // var oldCategoryId = oldDt.getCategoryId();
        // if (categoryId == 'rack' && oldCategoryId != 'rack') {
        if (categoryId == 'rack') {
            return false;
        }
        return true;
    },
});

it.Deviceoff = $Deviceoff;

/**
 * 增加配线
 */
var $LinkAdd = function (sceneManager, searchPane) {
    it.Application.call(this, sceneManager, searchPane);
};

mono.extend($LinkAdd, it.Application, {

    init: function () {
        this.app = new it.LinkAdd(this.sceneManager);
    },

    isShowSearchInputPanel: function () {
        return true;
    },

    doShow: function () {
        // self.itvToggleBtn.show();
        //           self.reset(true);
        var div = this.app.getRootView();
        this.searchPane.show(div);
    },

    doClear: function () {
        this.app.clearSearch(); //清除配线搜索
    }

});

it.Linkadd = $LinkAdd;

/**
 * 线路查询
 */
var $LinkSearchApp = function (sceneManager, searchPane) {
    it.Application.call(this, sceneManager, searchPane);
};

mono.extend($LinkSearchApp, it.Application, {

    init: function () {
        this.app = new it.LinkSearch(this.sceneManager);
        var self = this;
        this.app.beforeDoClick = function () {
            self.beforeDoClick();
        };
        var deh = this.sceneManager.viewManager3d.defaultEventHandler;
        this.gcs = this.sceneManager.gcsManager;
        this.oldRadius = {};
    },

    isShowSearchInputPanel: function () {
        return true;
    },

    setData: function (conditions) {
        var self = this;
        var results = this.app.linkFinder.find(conditions);
        var treeNodes = null;
        if (!results || results.length < 1) {
            // this.treeView.clearTreeData();
            if (!this.app.showNoData) {
                layer.msg(it.util.i18n("LinkSearch_No_Link"));
                return;
            }
            this.app.showNoData();
        } else {
            this.appPanel.LinkSearchApp('createSearchResultTitle');
            var height = it.util.calculateHeight("new-apps-box");
            var option = {
                results: results,
                parent: this.appPanel,
                height: height,
                createLabel:  this.app.createLabel,
                clickTreeNode: function(treeData){
                    self.clickTreeNodeHandle(treeData);
                }
            };
            this.app.treeView = this.appPanel.LinkSearchApp('createSearchTree', option);
            this.app.treeView.mouseoverNodeFunction = function (treeData) {
                self.app.mouseOverTreeNode(treeData);
            };
        }
        this.app.setResult(results, treeNodes);
    },

    doShow: function () {
        var self = this;
        this.appPanel = $('<div>').addClass('new-app-panel').appendTo($('.new-apps-box'));
        this.appPanel.LinkSearchApp();
        this.appPanel.on('click', '.search-it', function () {
            self.appPanel.LinkSearchApp('removeSearchTree');
            var conditions = self.appPanel.LinkSearchApp('getConditions');
            self.app.beforeDoClick();
            self.setData(conditions);
        })
        this.appPanel.on('click', '.clear-it', function () {
            self.app.clearSearch();
            self.appPop.hide();
            self.appPop.children().empty();
            self.appPanel && self.appPanel.LinkSearchApp("refreshAll");
            self.focusNode && self.sceneManager.lookAt(self.focusNode);
            self.focusNode = null;
        })
        this.appPop = $('.link-search-pop');
        if(!this.appPop.length){
            this.appPop = $('<div>').addClass('link-search-pop');
            $('.view-control').append(this.appPop);
        }
        this.appPop.searchLink({
            click: function (e, param) {
                if (!param || !param.id) return;
                var node = self.getNodeById(param);

                //先还原半径
                for (var linkId in self.oldRadius) {
                    var linkNode = self.sceneManager.getLinkNodeById(linkId);
                    if (linkNode && linkNode.setRadius) {
                        linkNode.setRadius(self.oldRadius[linkId]);
                    }
                }
                deh.lookAt(node, function () { //设置新的半径 
                    for (var linkId in self.oldRadius) {
                        var linkNode = self.sceneManager.getLinkNodeById(linkId);
                        if (linkNode && linkNode.setRadius) {
                            linkNode.setRadius(self.oldRadius[linkId] * 0.2);
                        }
                    }
                });
            },
        });
        this.appPop.hide();

    },

    doClear: function () {
        //退出功能时还原半径
        for (var linkId in this.oldRadius) {
            var linkNode = this.sceneManager.getLinkNodeById(linkId);
            if (linkNode && linkNode.setRadius) {
                linkNode.setRadius(this.oldRadius[linkId]);
            }
            this.sceneManager.getLinkNodeById(linkId).setRadius(this.oldRadius[linkId]);
        }
        this.oldRadius = {};

        this.app.clearSearch(); //清除配线搜索
        // this.appPop.hide();
        // this.appPop.children().empty();
        // this.appPanel.LinkSearchApp('doHide');
        this.appPanel && this.appPanel.LinkSearchApp('destory');
        var curRTNode = this.sceneManager._currentRootNode;
        this.focusNode = curRTNode;
        this.focusNode && this.sceneManager.lookAt(this.focusNode);
        this.focusNode = null;
    },

    getNodeById: function (param) {
        if (param.type == 'link') {
            return this.sceneManager.getLinkNodeById(param.id);
        } else {
            return this.sceneManager.getNodeByDataOrId(param.id);
        }
    },
    clickTreeNodeHandle: function(treeData){
        var self = this;
        var callback = function(scop){
            // 记录连线半径
            if(self.compLink){
                for (var i = 0; i < self.compLink.length; i++) {
                    data = self.compLink[i];
                    if(data.lineId){
                        var node = self.sceneManager.getLinkNodeById(data.lineId);
                        self.oldRadius[data.lineId] = node.getRadius();
                    }
                }
            }
        }

        self.focusNode = self.sceneManager.viewManager3d.getFocusNode();
        self.compLink = self.app.clickTreeNode(treeData,callback,self);

        self.appPop.searchLink('option', 'links', self.compLink);
        self.appPop.searchLink('makeLinkBox');
        self.appPop.show();
    }
    // showLinkById: function(id){
    //     this.gcs.clearAllLink();
    //     this.gcs.showLinkByLinkId(id);
    // },

    // showAllLinks: function(){
    //     this.gcs.showMulLinkByData(this.data,true);
    //     this.sceneManager.viewManager3d._focusNode = this.focusnode;
    // },

    // clearLinks: function(){
    //     this.gcs.clearAllLink();
    // },

});

it.LinkSearchApp = $LinkSearchApp;


/**
 * 线路查询
 */
var $PortApp = function (sceneManager) {
    it.Application.call(this, sceneManager);
};

mono.extend($PortApp, it.Application, {
    init: function () {

    },

    doShow: function () {
        var node = this.sceneManager.viewManager3d.getFocusNode();
        var data = this._data = this.sceneManager.getNodeData(node);
        var ports = main.portStatusManager.portManager.getAllPortsByParentId(data.getId());
        if (!ports || ports.length == 0) {
            layer.msg(it.util.i18n("Port_No_Port"));
            return;
        }
        main.portStatusManager.showPortsStatusByParentId(data.getId());
    },

    doClear: function () {
        main.portStatusManager.clearPortStatusByParentId(this._data.getId());
    }

});

it.PortApp = $PortApp;

/**
 * 线路查询
 */
var $EquipmentLinkApp = function (sceneManager) {
    it.Application.call(this, sceneManager);
    this.oldRadius = {};
};

mono.extend($EquipmentLinkApp, it.Application, {
    /**
     * 根据link的data或link的起点和终点获取3D对象
     */
    getNodeById: function (param) {
        if (param.type == 'link') {
            return this.sceneManager.getLinkNodeById(param.id);
        } else {
            return this.sceneManager.getNodeByDataOrId(param.id);
        }
    },
    initLinks: function (links) {
        this.linkGroup = $('<div>').addClass('link-group');
        var deh = this.sceneManager.viewManager3d.defaultEventHandler;
        var self = this;
        this.linkGroup.link({
            links: links,
            click: function (e, param) {
                for (var linkId in self.oldRadius) {
                    var linkNode = self.sceneManager.getLinkNodeById(linkId);
                    if (linkNode && linkNode.setRadius) {
                        linkNode.setRadius(self.oldRadius[linkId]);
                    }
                }

                if (!param || !param.id) return;
                var node = self.getNodeById(param);
                deh.lookAt(node, function () { //设置新的半径  （杨兴康）
                    for (var linkId in self.oldRadius) {
                        var linkNode = self.sceneManager.getLinkNodeById(linkId);
                        if (linkNode && linkNode.setRadius) {
                            linkNode.setRadius(self.oldRadius[linkId] * 0.2);
                        }
                    }
                });
            },
            chooseOneLink: function (e, param) {
                if (!param || !param.linkId) {
                    return;
                }
                var linkId = param.linkId;
                self.showLinkById(linkId);
            },
            showAllLinks: function () {
                self.showAllLinks();
            },
        });
    },
    init: function () {

    },

    showLinkById: function (id) {
        this.gcs.clearAllLink(undefined, this.data);
        this.gcs.showLinkByLinkId(id);
    },

    showAllLinks: function () {
        this.gcs.showMulLinkByData(this.data, true);
        this.sceneManager.viewManager3d._focusNode = this.focusnode;
    },

    doShow: function () {
        var node = this.sceneManager.viewManager3d.getFocusNode();
        var data = this.sceneManager.getNodeData(node);
        var self = this;
        this.focusnode = node;
        this.data = data;
        //var data = this.sceneManager.dataManager.getDataById('121r144_E02');
        console.log(data);
        if (!data) {
            layer.msg(it.util.i18n("Invalid_Data"));
            return;
        }
        // 3d中显示
        var gcs = this.sceneManager.gcsManager;
        gcs.showMulLinkByData(data, true);
        // gcs.unlock();
        this.sceneManager.viewManager3d._focusNode = this.focusnode;
        this.gcs = gcs;
        var objects = gcs.linkManager.getMulLinksByDataId(data);
        console.log(objects);
        if (!objects) {
            layer.msg(it.util.i18n("Link_No_Link"));
            return;
        }
        var compLinks = [],
            compLink,
            dm = this.sceneManager.dataManager;
        for (var j = 0; j < objects.length; j++) {
            var links = objects[j];
            if (!links || links.length < 1) {
                console.log("link's length is 0 ,please to check!!!");
                continue;
            }
            for (var i = 0; i < links.length; i++) {
                var link = links[i];
                compLink = [];
                if (!link) continue;

                //记录连线的半径
                var linkId = link.getId();
                var linkNode = this.sceneManager.getLinkNodeById(linkId);
                if (linkNode && linkNode.getRadius) {
                    this.oldRadius[linkId] = linkNode.getRadius();
                }

                var fData = dm.getDataById(link.getFromId());
                compLink.push({
                    id: fData.getId(),
                    type: fData.getBusinessTypeId()
                });
                compLink.push({
                    lineId: link.getId()
                });
                var tData = dm.getDataById(link.getToId());
                compLink.push({
                    id: tData.getId(),
                    type: tData.getBusinessTypeId()
                });
                compLinks.push(compLink);
            }
        }
        this.initLinks(compLinks);
        this.linkGroup.dialog({
            blackStyle: true,
            resize: false,
            title: it.util.i18n("Link_Link"),
            width: 850,
            closeOnEscape: true,
            show: false,
            hide: false,
            autoOpen: true, //初始化之后，是否立即显示对话框，默认为 true
            resizable: false, //设置是否可拉动弹窗的大小，默认为true
            modal: false, //是否有遮罩模型
        });
        this.linkGroup.dialog({
            close: function (e, ui) {
                // 1、 e:事件对象
                // 2、 ui:封装对象
                // 3、 this:表示对话框元素
                $(this).remove();
                main.sceneManager.viewManager3d.addPropertyChangeListener(function (event) {
                    gcs.clearAllLink();
                });
                main.panelMgr.instanceMap.NavBarMgr.$box.nav('clickNavIcon', 'peixian');
            }
        });
        this.showing = true;
    },

    doClear: function () {
        var self = this;
        if (this.linkGroup && this.linkGroup.hasClass("ui-dialog-content")) {
            this.linkGroup.dialog('close');
        };

        //退出功能时还原半径
        for (var linkId in this.oldRadius) {
            var linkNode = this.sceneManager.getLinkNodeById(linkId);
            if (linkNode && linkNode.setRadius) {
                linkNode.setRadius(self.oldRadius[linkId]);
            }
            this.sceneManager.getLinkNodeById(linkId).setRadius(self.oldRadius[linkId]);
        }
        this.oldRadius = {};
        this.gcs.clearAllLink(undefined, this.data);
        var node = this.sceneManager.viewManager3d.getFocusNode();
        this.sceneManager.viewManager3d.lookAt(node);
        this.sceneManager.viewManager3d.defaultMaterialFilter.remove(this.data)
        this.showing = false;
    }

});

it.EquipmentLinkApp = $EquipmentLinkApp;

/**
 * 湿度展示
 */
var $HumidityApp = function (sceneManager) {
    it.Application.call(this, sceneManager);

};

mono.extend($HumidityApp, it.Application, {
    create: function () {
        var humMoreConfig = main.systemConfig.hum_more_config;
        if (dataJson.hum_blue || dataJson.hum_green || dataJson.hum_yellow || dataJson.hum_red) {
            var parms = {
                width: dataJson.hum_blue.parms.width,
                height: dataJson.hum_blue.parms.height,
                size: dataJson.hum_blue.parms.size,
                lineWidth: dataJson.hum_blue.parms.lineWidth,
                color: dataJson.hum_blue.parms.color,
                startX: dataJson.hum_blue.parms.startX,
                startY: dataJson.hum_blue.parms.startY,
                withUnit: dataJson.hum_blue.parms.withUnit,
                family: dataJson.hum_blue.parms.fontFamily,
                stroke: dataJson.hum_blue.parms.stroke,
                scaleX: dataJson.hum_blue.parms.scaleX,
                scaleY: dataJson.hum_blue.parms.scaleY,
            };
            if (dataJson.hum_blue) {
                it.Util.registerImg('hum_blue', dataJson.hum_blue.src, parms);
            }
            if (dataJson.hum_green) {
                it.Util.registerImg('hum_green', dataJson.hum_green.src, parms);
            }
            if (dataJson.hum_yellow) {
                it.Util.registerImg('hum_yellow', dataJson.hum_yellow.src, parms);
            }
            if (dataJson.hum_red) {
                it.Util.registerImg('hum_red', dataJson.hum_red.src, parms);
            }
        } else {
            var parms = {
                width: humMoreConfig.canvasX,
                height: humMoreConfig.canvasY,
                size: humMoreConfig.font_size,
                lineWidth: humMoreConfig.font_linewidth,
                color: humMoreConfig.font_color,
                startX: humMoreConfig.startX,
                startY: humMoreConfig.startY,
                withUnit: humMoreConfig.writeunit,
                family: humMoreConfig.font_family,
                stroke: humMoreConfig.stroke,
                scaleX: humMoreConfig.billboardX,
                scaleY: humMoreConfig.billboardY
            };
            it.Util.registerImg('hum_blue', humMoreConfig.bluesrc, parms);
            it.Util.registerImg('hum_green', humMoreConfig.greensrc, parms);
            it.Util.registerImg('hum_yellow', humMoreConfig.yellowsrc, parms);
            it.Util.registerImg('hum_red', humMoreConfig.redsrc, parms);
        }
    },

    init: function () {
        this.app = new it.HumidityManager(this.sceneManager);
        this.app.bgMap = dataJson.humBgMap;
        this.app.getToFixed = function () {
            return parseInt(dataJson.humidityToFixed) || 0;
        }
        // this.app._minValue = 10;
        // this.app._maxValue = 50;
    },

    doShow: function () {
        var self = this;
        main.RealtimeDynamicEnviroManager.monitorCollectorData(this.app.getsCurrentCollector());
        if (main.systemConfig) {
            this.app.bgMap = main.systemConfig.hum_alarm_config;
        }
        this.create();
        // var isShow = this.isShowing();
        // self.reset(true);
        // if(!isShow){

        setTimeout(function () {
            self.app.show();
        }, 100)
        // }
    },

    doClear: function () {
        this.app.hide();
        main.RealtimeDynamicEnviroManager.clearMonitorData(true);
    }

});

it.HumidityApp = $HumidityApp;

/**
 * 微环境展示
 */
var $MicoEnvirApp = function (sceneManager) {
    it.Application.call(this, sceneManager);
};

mono.extend($MicoEnvirApp, it.Application, {

    init: function () {
        this.app = new it.MicoEnviroment(this.sceneManager);
    },

    doShow: function () {
        // var isShow = this.isShowing();
        // self.reset(true);
        // if(!isShow){
        this.app.show();
        // }
        this.focusNode = this.sceneManager.viewManager3d.getFocusNode();

        this.sceneManager.viewManager3d.setCameraDistance(100, 15000);
        var cPosition = this.focusNode.frontWorldPosition(800);
        var camera = main.sceneManager.network3d.getCamera();
        var position = cPosition,
            target = camera.t();
        this.oldCameraP = camera.p();
        it.Util.playCameraAnimation(camera, position, target);
    },

    doClear: function () {
        var camera = main.sceneManager.network3d.getCamera();
        var position = this.oldCameraP,
            target = camera.t();
        it.Util.playCameraAnimation(camera, position, target, 1000);
        this.sceneManager.viewManager3d.resetCameraDistance(this.focusNode);

        this.app.clear();
    }

});

it.MicoEnvirApp = $MicoEnvirApp;

/**
 * 风向图展示
 */
var $AirFlowApp = function (sceneManager) {
    it.Application.call(this, sceneManager);
};

mono.extend($AirFlowApp, it.Application, {

    init: function () {
        this.app = new it.AirFlowManager();
    },

    doShow: function () {
        // var isShow = this.isShowing();
        // self.reset(true);
        // if(!isShow){
        this.app.toggleAirFlowsForCurrentScene();
        // }
    },

    doClear: function () {
        this.app.clear();
    }

});

it.AirFlowApp = $AirFlowApp;

/**
 * 漏水检测
 */
var $WaterLeakApp = function (sceneManager) {
    it.Application.call(this, sceneManager);
};

mono.extend($WaterLeakApp, it.Application, {

    init: function () {
        this.app = $WaterLeakManager();
    },

    isShow: function () {
        if (!this.app) { //有可能还没有初始化哦
            return false;
        }
        return this.app.hasWaterLeak(); //如果不用Application内部的判断是否显示的标记，也可以重写该方法
    },

    doShow: function () {
        // var isShow = this.isShowing();
        // self.reset(true);
        // if(!isShow){
        this.app.toggleWaterLeak();
        // }
    },

    doClear: function () {
        this.app.hideWaterLeak();
    }

});

it.WaterLeakApp = $WaterLeakApp;

/**
 * 功率管理
 */
var $PowerApp = function (sceneManager) {
    it.Application.call(this, sceneManager);
};

mono.extend($PowerApp, it.Application, {

    init: function () {
        this.app = main.powerManager = new it.PowerManager(this.sceneManager);
    },

    isShowSearchInputPanel: function () {
        return false;
    },

    //如果觉得父类中的不准确的话，那不用Application内部的判断是否显示的标记，也可以重写该方法
    isShow: function () {
        return PowerManager.Simulater.simulating;
    },

    doShow: function () {
        // setTimeout(PowerManager.Simulater.refresh(this.app),100);
        it.PowerManager.Simulater.refresh(this.app);
    },

    doClear: function () {
        it.PowerManager.Simulater.stop(this.app);
    }

});

it.PowerApp = $PowerApp;

/**
 * 承重管理
 */
var $WeightApp = function (sceneManager) {
    it.Application.call(this, sceneManager);
};

mono.extend($WeightApp, it.Application, {

    init: function () {
        this.app = main.weightManager = new it.WeightManager(this.sceneManager);
    },

    //如果觉得父类中的不准确的话，那不用Application内部的判断是否显示的标记，也可以重写该方法
    isShow: function () {
        if (!this.app) {
            return false;
        }
        return this.app.isShow();
    },

    doShow: function () {
        this.app.toggleShow();
    },

    doClear: function () {
        this.app.hide();
    }

});

it.WeightApp = $WeightApp;

/**
 * 岗位管理
 */
var $PostApp = function (sceneManager) {
    it.Application.call(this, sceneManager);
};

mono.extend($PostApp, it.Application, {

    init: function () {
        this.app = new it.PostManager(this.sceneManager);
    },

    doShow: function () {
        this.app.showPostList();
    },

    doClear: function () {
        this.app.hide();
    }

});

it.PostApp = $PostApp;

/**
 * 岗位管理
 */
var $CameraAnimateApp = function (sceneManager) {
    it.Application.call(this, sceneManager);
};

mono.extend($CameraAnimateApp, it.Application, {

    init: function () {
        this.app = main.cameraAnimateManager
    },

    doShow: function () {
        this.app.show();
    },

    doClear: function () {
        this.app.hide();
    }

});

it.CameraAnimateApp = $CameraAnimateApp;

/**
 * 虚拟拓扑
 */
var $VirtualTopologyApp = function (sceneManager) {
    it.Application.call(this, sceneManager);
};

mono.extend($VirtualTopologyApp, it.Application, {

    init: function () {
        this.app = new it.VirtualtopologyPanel(this.sceneManager);
    },

    doShow: function () {
        this.app.show();
    },

    doClear: function () {
        this.app.hide();
    }

});

it.VirtualTopologyApp = $VirtualTopologyApp;

/**
 * 磁盘信息
 */
var $StorageTabApp = function (sceneManager) {
    it.Application.call(this, sceneManager);
};

mono.extend($StorageTabApp, it.Application, {

    init: function () {
        this.app = new it.StorageTabPanel(this.sceneManager);
    },

    doShow: function () {
        this.app.show();
    },

    doClear: function () {
        this.app.hide();
    }

});

it.StorageTabApp = $StorageTabApp;


/**
 * 进程列表
 */
var $ProcessTabApp = function (sceneManager) {
    it.Application.call(this, sceneManager);
};

mono.extend($ProcessTabApp, it.Application, {

    init: function () {
        this.app = new it.ProcessTabPanel(this.sceneManager);
    },

    doShow: function () {
        this.app.show();
    },

    doClear: function () {
        this.app.hide();
    }

});

it.ProcessTabApp = $ProcessTabApp;

/**
 * 数据监控
 */
var $Realtime = function (sceneManager, searchPane) {
    it.Application.call(this, sceneManager, searchPane);
};

mono.extend($Realtime, it.Application, {

    init: function () {
        this.app = new it.RealTime(this.sceneManager, this);
        this.appPanel = null;
        this.dataManager = this.sceneManager.dataManager;
        this.dataFinder = new it.DataFinder(this.dataManager);
        this.dataFinder.getDatas = function () {
            var datas = this.dataManager._dataMap;
            var results = [];
            for (var n in datas) {
                if (main.sceneManager.isCurrentSceneInstance(datas[n])) {
                    results.push(datas[n]);
                }
            }
            return results;
        }
    },
    findAncestorToFloor: function (data, ancestorId) {
        if (!data || !ancestorId) {
            return false;
        }
        if (data.getId() == ancestorId) {
            return true;
        } else if (data.getParentId() == ancestorId) {
            return true;
        } else if (!data.getParentId()) {
            return false;
        } else {
            var parentData = this.dataManager.getDataById(data.getParentId());
            if (parentData) {
                var catogory = this.dataManager.getCategoryForData(parentData);
                if (catogory._id == 'floor') {
                    return false;
                }
                return this.findAncestorToFloor(parentData, ancestorId);
            }
        }
    },
    getRoomOptions: function () {
        var currentRooms = [];
        currentRooms.push({
            value: '',
            content: it.util.i18n("All"),
        })
        var allRooms = this.dataManager.getDataMapByCategory('room');
        if (this.currentFloorId) {
            for (var i in allRooms) {
                if (this.findAncestorToFloor(allRooms[i], this.currentFloorId)) {
                    currentRooms.push({
                        value: allRooms[i].getId(),
                        content: allRooms[i].getName() || allRooms[i].getId(),
                    });
                }
            }
        }
        return currentRooms;
    },
    getCategoryOptions: function () {
        var currentDataCategories = [];
        // currentDataCategories.push({
        //     value: '',
        //     content: '全部',
        // });
        var categories = dataJson.typeOptions;
        for (var index in categories) {
            var category = this.dataManager._categoryMap[categories[index].id];
            if (category) {
                var searchFilter = category.getUserData('searchFilter');
                if (searchFilter) {
                    currentDataCategories.push({
                        value: category.getId(),
                        content: category.getDescription() || category.getId(),
                    })
                }
            }
        }
        return currentDataCategories;
    },

    getConditions: function () {
        var conditions = [];

        var idValue = this.appPanel.RealTimeApp('getInputValue', 'id');
        if (idValue) {
            conditions.push({
                key: 'id',
                value: idValue,
                dataType: 'string',
                operation: 'like'
            });
        }

        var roomValue = this.appPanel.RealTimeApp('getSelectValue', 'room');
        if (roomValue) {
            conditions.push({
                key: 'ancestor',
                value: roomValue,
            });
        }

        var categoryValue = this.appPanel.RealTimeApp('getSelectValue', 'category');
        if (categoryValue) {
            conditions.push({
                key: 'd:categoryId',
                value: categoryValue,
                dataType: 'string',
                operation: 'like'
            });
        }
        return conditions;
    },

    getResultsByConditions: function (conditions) {
        return this.dataFinder.find(conditions);
    },

    getResults: function (conditions) {
        var results = this.getResultsByConditions(conditions);
        return results;
    },

    doSearchIt: function () {
        var self = this;
        if (!this.appPanel) {
            return;
        }
        var conditions = this.getConditions();
        var results = this.getResults(conditions);
        var categoryId = this.appPanel.RealTimeApp('getSelectValue', 'category'); //选中的category
        if (categoryId) {
            main.monitorManager.showMonitor(categoryId, results);
        }
    },

    doClearIt: function () {
        this.appPanel&&this.appPanel.RealTimeApp('refreshAll');
    },

    doShow: function () {
        var self = this;
        // this.appState = true;
        this.currentFloorNode = this.sceneManager.getCurrentRootNode();
        if (this.currentFloorNode) {
            this.currentFloorId = this.currentFloorNode._clientMap.it_data_id;
        }
        var currentFocusNode = this.sceneManager.viewManager3d.getFocusNode();
        if (currentFocusNode == this.currentFloorNode) {
            this.appPanel = $('<div>').addClass('new-app-panel').appendTo($('.new-apps-box'));
            this.appPanel.RealTimeApp({
                roomSelects: this.getRoomOptions(),
                typeSelects: this.getCategoryOptions(),
                doSearchIt: function (e) {
                    self.doSearchIt();
                },
                doClearIt: function (e) {
                    self.doClearIt();
                },
            });
        } else {
            var data = main.sceneManager.getNodeData(currentFocusNode);
            var c = main.sceneManager.dataManager.getCategoryForData(data);
            var params = {
                noSubscribe: false,
                isNeedShade: true,
            }
            main.monitorManager.showRealTimeDialog(data, params);

        }
        this.app.appStart();
    },

    doClear: function () {
        this.clearRealtime();
        this.appPanel && this.appPanel.RealTimeApp('destory');
        this.appPanel = null;
        this.app.appEnd();
    },
    clearRealtime: function () {
        /* 点击实时数据图标关闭实时数据功能：
         * 当从table查看数据时，有遮罩层，所以不需处理；当从selectPane查看时，
         * 1、删除所有模板，清空所有模板缓存:第一种：双击背景后退；第二种：直接点击实时数据图标
         * 2、删除注册的monitor
         * 3、取消所有订阅（设备的），
         * 4、关闭所有layer，selectPane和设备的layer
         * 5、是否回到floor场景：                  
         *  by chenghui   2017/12/20  注意顺序           
         */

        if (this.clearViewOfData) {
            it.ViewTemplateManager.hideView(this.clearViewOfData.getId(), undefined, undefined, false);
        }
        var node = main.sceneManager.viewManager3d.getFocusNode();
        it.ViewTemplateManager.hideView(node._clientMap.it_data_id, undefined, undefined, false);
        main.monitorManager.hideMonitor();
        main.RealtimeDynamicEnviroManager.clearMonitorData();
        layer.closeAll();
    },

    ifCloseWhenFocusChange: function (node, oldNode) {
        var data = this.sceneManager.getNodeData(node);
        dt = this.sceneManager.dataManager.getDataTypeForData(data),
            categoryId = dt.getCategoryId();
        var oldData = this.sceneManager.getNodeData(oldNode),
            oldDt = this.sceneManager.dataManager.getDataTypeForData(oldData),
            oldCategoryId = oldDt.getCategoryId();
        if (categoryId == oldCategoryId || oldCategoryId == 'floor') {
            return false;
        // }else if(oldCategoryId == 'pdc' && categoryId != oldCategoryId && categoryId == 'floor'){
        //     return true;//当从pdc后退至floor时也需要关闭
        }else if (categoryId != oldCategoryId && categoryId == 'floor' && $('.realtimeDialog') && $('.realtimeDialog').length>0) {//存在两种情况：1、从列表查看设备后返回floor;2、单独查看设备双击背景返回
            return false;
        } else {
            //在关闭整个realtimeAPP之前，记录oldNode，删除其view
            this.clearViewOfData = oldData;
            return true;
        }

    },
});

it.Realtime = $Realtime;


//设备详情
var $EquipmentDetailsApp = function (sceneManager) {
    it.Application.call(this, sceneManager);
};
mono.extend($EquipmentDetailsApp, it.Application, {
    doShow: function () {
        var node = this.sceneManager.viewManager3d.getFocusNode();
        var data = this.sceneManager.getNodeData(node);
        main.nodeEventHander.serverPanel.showServerPanel(data);
    },

    doClear: function () {
        $('#serverPanel').dialog('close');
    }

});
it.EquipmentDetailsApp = $EquipmentDetailsApp;



//自定义tab栏
var $ServerTabApp = function (sceneManager) {
    it.Application.call(this, sceneManager);
}
mono.extend($ServerTabApp, it.Application, {
    doShow: function () {
        this.appState = true;
        var node = main.sceneManager.viewManager3d.getFocusNode();
        var data = main.sceneManager.getNodeData(node);
        main.nodeEventHander.serverTab.showServerTab(data);
        this.sceneManager.viewManager3d.addPropertyChangeListener(this.focusNodeChangeListener, this);
    },
    doClear: function () {
        this.appState = false;
        // 先移除监听器再关闭面板，否则关闭的面板会被再次打开。状态控制也得使用，监听过程是异步操作，有一定的延时
        this.sceneManager.viewManager3d.removePropertyChangeListener(this.focusNodeChangeListener, this);
        main.nodeEventHander.serverTab.mainPanel.dialog('close');
    },
    focusNodeChangeListener: function (event) {
        if (event && event.property == "focusNode" && this.appState) {
            var node = event.newValue;
            var data = main.sceneManager.getNodeData(node);
            main.nodeEventHander.serverTab.showServerTab(data);
        }
    },
    ifCloseWhenFocusChange: function (node, oldNode) {
        var data = this.sceneManager.getNodeData(node);
        var dt = this.sceneManager.dataManager.getDataTypeForData(data);
        var categoryId = dt.getCategoryId();
        if (categoryId == 'rack' || categoryId == 'equipment') {
            return false;
        }
        return true;
    },
});
it.ServerTabApp = $ServerTabApp;



// 虚拟机
var $VirtualDeviceApp = function (sceneManager) {
    it.Application.call(this, sceneManager);
};
mono.extend($VirtualDeviceApp, it.Application, {

    init: function () {
        this.app = new it.VirtualDeviceManager(this.sceneManager);
    },

    doShow: function () {
        this.app.show();
    },

    doClear: function () {
        this.app.hide();
    }
});
it.VirtualDeviceApp = $VirtualDeviceApp;

//虚拟机上架
var $VirtualDeviceonApp = function (sceneManager) {
    it.Application.call(this, sceneManager);
};
mono.extend($VirtualDeviceonApp, it.Application, {

    init: function () {
        this.app = new it.VirtualDeviceOnManager(this.sceneManager);
    },

    doShow: function () {
        this.appState = true;
        var node = main.sceneManager.viewManager3d.getFocusNode();
        var data = main.sceneManager.getNodeData(node);
        this.app.show();
        this.app.appStart(data);
    }, 

    doClear: function () {
        this.app.appEnd();
    }
});
it.VirtualDeviceonApp = $VirtualDeviceonApp;

//虚拟机下架
var $VirtualDeviceoffApp = function (sceneManager) {
    it.Application.call(this, sceneManager);
};
mono.extend($VirtualDeviceoffApp, it.Application, {

    init: function () {
        this.app = new it.VirtualDeviceOffManager(this.sceneManager);
    },

    doShow: function () {
        this.app.show();
        this.app.appStart();
    },

    doClear: function () {
        this.app.appEnd();
    }
});
it.VirtualDeviceoffApp = $VirtualDeviceoffApp;


// 全景
var $PanoramicApp = function (sceneManager) {
    it.Application.call(this, sceneManager);
};
mono.extend($PanoramicApp, it.Application, {

    init: function () {
        this.app = new it.PanoramicManager(this.sceneManager);
        // console.log('app加载')
    },

    doShow: function () {
        this.app.show();
    },

    doClear: function () {
        this.app.hide();
    }

});
it.PanoramicApp = $PanoramicApp;

// 全景制作
var $PanoramicMakerApp = function (sceneManager) {
    it.Application.call(this, sceneManager);
};
mono.extend($PanoramicMakerApp, it.Application, {

    init: function () {
        this.app = new it.PanoramicMakerManager(this.sceneManager);
        // console.log('app加载')
    },

    doShow: function () {
        this.app.show();
    },

    doClear: function () {
        this.app.hide();
    }

});
it.PanoramicMakerApp = $PanoramicMakerApp;



// 机柜预占用
var $RackPreOccupiedApp = function (sceneManager) {
    it.Application.call(this, sceneManager);
};
mono.extend($RackPreOccupiedApp, it.Application, {

    init: function () {
        this.app = new it.RackPreOccupiedManager(this.sceneManager, this);
        // console.log('app加载');

        this.selectTreeView = null;
        this.selectTreeCategory = ['floor', 'room',];
        
    },

    doSearchIt: function(){
        // console.log('doSearchIt');
        if(this.app.appState){
            this.app.hide();
        }
        var params = {}
        params.position = this.appPanel.RackPreOccupiedApp('getAreaSelectValue', 'position');
        params.extend = {};
        for (var key in this.app.extendField) {
            params.extend[key] = this.appPanel.RackPreOccupiedApp('getSelectValue', key);
        }
        this.app.show(params);
    },

    doClearIt: function(){
        // console.log('doClearIt');
        this.app.hide();
        this.appPanel&&this.appPanel.RackPreOccupiedApp('refreshAll');
    },

    doShow: function () {
        var self = this;
        var rootNode = this.sceneManager.getCurrentRootNode();
        this.floorData = this.sceneManager.getNodeData(rootNode);
        var conditions = {
            occupyType: 'seat',
            parentId: this.floorData._id,
        }
        it.util.api('pre_occupied', 'searchAndCount', conditions, function (result) {
            // console.log(result);
            self.result = result;
            var datas = result.rows; // array
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
            self.extendField = extendField;
            // console.log(extendField);
            self.appPanel = $('<div>').addClass('new-app-panel').appendTo($('.new-apps-box'));
            self.appPanel.RackPreOccupiedApp({
                extendField: extendField,
                selectTreeCategory: self.selectTreeCategory,
                doSearchIt: function (e) {
                    self.doSearchIt();
                },
                doClearIt: function (e) {
                    self.doClearIt();
                },
            });
        })
    },

    doClear: function () {
        this.app.hide();
        this.appPanel && this.appPanel.RackPreOccupiedApp('destory');
        this.appPanel = null;
    },

});
it.RackPreOccupiedApp = $RackPreOccupiedApp;



var $ITVMApp = function(sceneManager){
    it.Application.call(this, sceneManager);
};

mono.extend($ITVMApp, it.Application, {

    init: function () {
        this.app = new it.ITVManager(this.sceneManager);
        // this.app.loadAllData();
    },

    doShow: function () {
        main.panelMgr.instanceMap.NavBarMgr.doCustomApp('ITVM');
        this.app.showITV();
    },

    doClear: function () {
        main.panelMgr.instanceMap.NavBarMgr.doCustomApp('ITVM');
        this.app.clear(true);
    }

});
it.ITVMApp = $ITVMApp;

//多路摄像头
var $MulCameraMApp = function(sceneManager){
    it.Application.call(this, sceneManager);
};

mono.extend($MulCameraMApp, it.Application, {

    init: function () {
        this.app = new it.MulCameraManager(this.sceneManager);
    },

    doShow: function () {
        this.app.show();     
    },

    doClear: function () {
        this.app.hide();
    }

});
it.MulCameraMApp = $MulCameraMApp;

//摄像头
var $CameraApp = function (sceneManager) {
    it.Application.call(this, sceneManager);
    // this.init();
};
mono.extend($CameraApp, it.Application, {

    init: function () {
        this.app = new it.NewCameraManager(this.sceneManager);
        this.selectTreeCategory = ['floor', 'room'];
        this.dataFinder = new it.NewDataFinder(this.sceneManager.dataManager);
        this.isView = false;
    },

    doShow: function () {
        this.appPanel = $('<div class="new-app-panel"></div>').appendTo($('.new-apps-box'));
        var self = this;
        this.appPanel.CameraPanel({
            selectTreeCategory:  this.selectTreeCategory,
            doSearchIt: function () {
                self.doSearchIt();
            },
            doClearIt: function () {
                self.doClearIt();
            },
            doView: function () {
                self.doView();
            }
        });
    },

    doClear: function () {
        this.appPanel.remove();
        this.appPanel = null;
        this.app.hide();
        this.isView = false;
        delete this.cameras;
    },
    doClearIt: function () {
        this.appPanel&&this.appPanel.CameraPanel('refreshAll');
        this.app.hide();
        this.isView = false;
        delete this.cameras;
    },
    doSearchIt: function () {
        this.app.removeBillboards();
        this.app.clearCones();
        this.isView = false;
        var cameras = this.findCameras();
        this.app.show(cameras);
    },
    findCameras: function () {
        var valueMap = this.appPanel.CameraPanel('getAllValue');
        var conditions = [{
            key: 'C:id',
            value: 'camera',
            type: 'string',
            operation: '='
        }];
        for (var key in valueMap) {
            if (valueMap[key]){
                conditions.push({
                    key: key,
                    value: valueMap[key],
                    type: 'string',
                    operation: 'like'
                })
            }
        }
        this.cameras = this.dataFinder.find(conditions);
        return this.cameras;
    },
    getCameras: function () {
        if (!this.cameras) {
            return;
        }
        return this.cameras;
    },
    doView: function () {
        var cameras = this.getCameras();
        if (!cameras || cameras.length < 0) {
            layer.msg(it.util.i18n("Camera_search_the_camera_first"));
            return;
        }
        if (this.isView) {
            this.isView = false;
            this.app.clearCones();
            this.app.addVirtual(cameras);
            return;
        }
        this.isView = true;
        this.app.removeVirtual();
        if (cameras && cameras.length > 0) {
            this.app.doSimulateCameras(cameras);
        }
    },

});
it.CameraApp = $CameraApp;


//烟杆
var $TobaccoRodApp = function(sceneManager){
    it.Application.call(this, sceneManager);
};

mono.extend($TobaccoRodApp, it.Application, {

    init: function () {
        this.app = new it.TobaccoRodManager(this.sceneManager);
    },

    doShow: function () {
        this.app.show();
    },

    doClear: function () {
        this.app.hide();
    },

    ifCloseWhenFocusChange: function (node, oldNode) {
        var data = this.sceneManager.getNodeData(node);
        var dt = this.sceneManager.dataManager.getDataTypeForData(data);
        var categoryId = dt.getCategoryId();
        if (categoryId == 'floor') {
            return false;
        }
        return true;
    },

});
it.TobaccoRodApp = $TobaccoRodApp;

