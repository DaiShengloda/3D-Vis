it.TobaccoRodManager = function (sceneManager) {
    this.sceneManager = sceneManager;
    this.dm = this.sceneManager.dataManager;
    this.vm = this.sceneManager.viewManager3d;
    this.network = this.vm.network;
    this.box = this.network.getDataBox();
    this.de = this.vm.getDefaultEventHandler();
    this.rootView = this.network.getRootView();
    this.clickBillboardP = [200, 200, 0]
    this.init();
    this.initTooltip();
    this.sceneManager.getAlarmManager().addAlarmManagerChangeListener(this.alarmManagerHandler, this);
    this.sceneManager.getAlarmManager().addAlarmPropertyChangeListener(this.alarmManagerHandler, this);
    if (dataJson.tobaccoRod) {
        this.billboardScale = dataJson.tobaccoRod.scale || [0.4, 0.4];
        this.isShowId = dataJson.tobaccoRod.isShowId;
    } else {
        this.billboardScale = [0.4, 0.4];
        this.isShowId = true;
    }
};

mono.extend(it.TobaccoRodManager, Object, {

    init: function () {
        this.categoryBox = ['smoke'];
        // this.userEventHandlerBox = {
        //     'click': {
        //         element: this.rootView,
        //         event: 'click',
        //         funcName: 'handleClick',
        //     },
        // }
        // it.util.augment(it.TobaccoRodManager, it.dealUserEventHandler);
        
    },
    initTooltip: function () {
        var self = this;
        this.tooltipManager = this.sceneManager.viewManager3d.tooltipManager;
        var parameters = {
            id: 'smoke',
            customerId: 'smoke',
            extInfo: function (node, data) {
                var result = {};
                if (self.isShowId) {
                    result[it.util.i18n("id")] = data.getId();
                }
                if (data.getName()) {
                    result[it.util.i18n("name")] = data.getName();
                }
                if (data.getDescription()) {
                    result[it.util.i18n("description")] = data.getDescription();
                }
                var userData = data._userDataMap;
                if (!$.isEmptyObject(userData)) {
                    for (var attr in userData) {
                        result[attr] = userData[attr];
                    }
                }
                return result;
            }
        };
        var tooltipRule = new it.TooltipRule(parameters);
        this.tooltipManager.addTooltipRule(tooltipRule);
        this.sceneManager.viewManager3d.addPropertyChangeListener(function(event) {
			if (event && event.property == "focusNode") {
				self.tooltipManager.hideToolTipDiv.call(self.tooltipManager);
			}
		});
    },
    initTooltipHandle: function () {
        var self = this;
        this.oldGetCustomerIdByNode = this.tooltipManager.getCustomerIdByNode;
        this.oldShouldHandleClickElement = this.tooltipManager.shouldHandleClickElement;
        this.oldHandleMouseMoveElement = this.tooltipManager.handleMouseMoveElement;
        this.oldShouldHandleClickBackground = this.tooltipManager.shouldHandleClickBackground;
        this.oldHandleClickBackground = this.tooltipManager.handleClickBackground;
        this.oldHandleClickElement = this.tooltipManager.handleClickElement;
        this.oldGenerateTooltipPosition = this.tooltipManager.generateTooltipPosition;
        this.tooltipManager.getCustomerIdByNode = function (node) {
            var id = node.getClient('tooltip');
            return id;
        };
        this.tooltipManager.shouldHandleClickElement = function(element, network, data, clickedObj) {
            var data = self.sceneManager.getNodeData(element);
            if (!data || !self.yanganDataMap[data.getId()]) {
                return false;
            }
			return true;
		};
		this.tooltipManager.shouldHandleMouseMoveElement = function(){
            var data = self.sceneManager.getNodeData(element);
            if (data && self.yanganDataMap[data.getId()]) {
                return false;
            }
			return true;
        };
        this.tooltipManager.shouldHandleClickBackground = function(element, network, data, clickedObj) {
            if (!self.tooltipManager._lastData) {
                return false;
            }
			return true;
		};
		this.tooltipManager.handleClickBackground = function(network) {
            self.tooltipManager.hideToolTipDiv.call(self.tooltipManager);
            self.tooltipManager._lastData = null;
		};
		this.tooltipManager.handleClickElement = function(node, network, data, clickedObj) {
            if (!self.appState) {
                return;
            }
            var content = self.tooltipManager.getTooltipContent.call(self.tooltipManager, node);
            if (!content) {
                self.tooltipManager._lastData = null;
                self.tooltipManager.hideToolTipDiv.call(self.tooltipManager);
                return;
            }
            if (self.tooltipManager._lastData == data) {
				return;
			}
            self.tooltipManager._lastData = data;
            self.tooltipManager.showTooltipDiv.call(self.tooltipManager, content, data);
        };
        this.tooltipManager.generateTooltipPosition = function (node, x, y, z) {
            var pos = new mono.Vec3();
            var bwp = node.getWorldPosition();
            pos.setX(bwp.x);
            pos.setZ(bwp.z);
            pos.setY(bwp.y + 25);
            return pos;
        };
        // this.sceneManager.viewManager3d.addEventHandler(this.tooltipManager);
        // this.sceneManager.viewManager3d.addRenderCallback(this.tooltipManager);
        var toolTipDiv = this.tooltipManager.getTooltipDiv();
        $(toolTipDiv).addClass('top');
		// if (toolTipDiv) {
		// 	$(toolTipDiv).mousemove(function(e){
		// 		e.stopPropagation();
		// 	});
		// 	$(toolTipDiv).click(function(e){
		// 		e.stopPropagation();
		// 	});
		// 	$(toolTipDiv).dblclick(function(e){
		// 		e.stopPropagation();
		// 	});
        // };
    },
    resetTooltipHandle: function () {
        this.tooltipManager.getCustomerIdByNode = this.oldGetCustomerIdByNode;
        this.tooltipManager.shouldHandleClickElement = this.oldShouldHandleClickElement;
        this.tooltipManager.handleMouseMoveElement = this.oldHandleMouseMoveElement;
        this.tooltipManager.shouldHandleClickBackground = this.oldShouldHandleClickBackground;
        this.tooltipManager.handleClickBackground = this.oldHandleClickBackground;
        this.tooltipManager.handleClickElement = this.oldHandleClickElement;
        this.tooltipManager.generateTooltipPosition = this.oldGenerateTooltipPosition;
    },

    alarmManagerHandler: function (e) {
        var self = this;
        if (this.appState = true) {
            setTimeout(function () {
                self.hide();
                self.show();
            }, 300);
        }
    },

    show: function () {
        var self = this;
        this.appState = true;
        this.allRightDatas = {};
        this.yanganDataMap = {};
        this.billboardNodes = [];
        this.yanganNodes = [];
        // this.addAllUserEventHandler();
        this.findAllDatasInCurrentScene();
        // console.log('默认的开启');

        this.findAlarmSmokeDatas(function () {
            self.createBillboards();
        });
        this.initTooltipHandle();
    },

    hide: function () {
        this.appState = false;
        // console.log('默认的关闭');
       
        this.clearBillboards();
        this.yanganNodes.forEach(function (node) {
            node.setClient('tooltip', '');
        });
        this.yanganDataMap = {};
        this.billboardNodes = [];
        this.allRightDatas = {};
        this.yanganNodes = [];
        this.tooltipManager.hideToolTipDiv();
        // this.removeAllUserEventHandler();
        this.resetTooltipHandle();
    },

    findAllDatasInCurrentScene: function () {

        for (var i = 0; i < this.categoryBox.length; i++) {
            var newCategoryDatas = {};
            var categoryId = this.categoryBox[i];
            var thisCategoryDatas = this.dm.getDataMapByCategory(categoryId);
            for (var key in thisCategoryDatas) {
                if (this.sceneManager.isCurrentSceneInstance(key)) {
                    newCategoryDatas[key] = thisCategoryDatas[key];
                }
            }
            $.extend(this.allRightDatas, newCategoryDatas);
        }
        // console.log(this.allRightDatas);
    },
    findAlarmSmokeDatas: function (callback) {
        var self = this;
        var alarms = this.sceneManager._alarmManager.getAlarms();
        alarms.forEach(function (alarm) {
            if (alarm.alarmTypeId !== 'smoke') return;
            var id = alarm._dataId;
            if (!id) return;
            var data = self.dm.getDataById(id);
            var categoryId = self.dm.getCategoryForData(data).getId();
            if (categoryId && categoryId == 'smoke' && self.sceneManager.isCurrentSceneInstance(data)) {
                self.yanganDataMap[id] = data;
                var node = self.sceneManager.getNodeByDataOrId(data);
                self.yanganNodes.push(node);
                node.setClient('tooltip', 'smoke');
            }
        });
        callback && callback();
    },
    createBillboards: function () {
        var allRightDatas = this.allRightDatas;
        for (var id in allRightDatas) {
            if (this.yanganDataMap[id]) {
                continue;
            }
            var billboardNode = this.createBillboard(allRightDatas[id]);
            this.billboardNodes.push(billboardNode);
            this.box.add(billboardNode);
        }
    },
    createBillboard: function (parentData) {
        var text = this.getBillboardText(parentData);
        var yanganNode = this.sceneManager.getNodeByDataOrId(parentData);
        var y = yanganNode.boundingBox.size().y;
        billboard = it.util.makeTextBillboardWithArrow.createBillboard({
            arrowPosition: 'down',
            text: text,
            scale: this.billboardScale,
            globalAlpha: 0.9,
            parentNode: yanganNode,
            position: [0, y, 0],
            arrowCut: 2,
            ifHasTitle: 'false',
        });
        return billboard;
    },
    getBillboardText: function (data) {
        var text = '';
        // text = text + it.util.i18n('id') + ':' + parentData.getId();
        if (this.isShowId) {
            text = text + '\n' + it.util.i18n('id') + '：' + data.getId();
        }
        if (data.getName()) {
            text = text + '\n' + it.util.i18n('name') + '：' + data.getName();
        }
        if (data.getDescription()) {
            text = text + '\n' + it.util.i18n('description') + '：' + data.getDescription();
        }
        var userData = data._userDataMap;
        if (!$.isEmptyObject(userData)) {
            for (var attr in userData) {
                text = text + '\n' + attr + '：' + userData[attr];
            }
        }
        text = text.replace('\n', '');
        return text;
    },
    clearBillboards: function () {
        this.billboardNodes.forEach(function (billboardNode) {
            this.clearBillboard(billboardNode);
        }, this);
    },
    clearBillboard: function (billboardNode) {
        billboardNode.setParent(null);
        this.box.remove(billboardNode);
    },
    // handleClick: function (e) {
    //     if (!this.appState) {
    //         return;
    //     }
    //     var first = this.getFirstDeviceCubeByMouseEvent(e);
    //     if (first) {
    //         var element = first.element;
    //         if (this.clickBillboard && this.frontClickElement && this.frontClickElement.getId() == element.getId()) {
    //             return;
    //         }
    //         if (this.clickBillboard) {
    //             this.clearBillboard(this.clickBillboard);
    //             delete this.clickBillboard;
    //         }
    //         var data = this.sceneManager.getNodeData(element);
    //         if (!this.yanganDataMap[data.getId()]) {
    //             return;
    //         }
    //         this.createClickBillboard(data);
    //     }
    // },
    // getFirstDeviceCubeByMouseEvent: function (e) {
    //     if (!this.yanganNodes || !this.yanganNodes.length) {
    //         return;
    //     }
    //     var result = this.vm.getFirstElementInIntersectsByMouseEvent(this.yanganNodes, e);
    //     return result;
    // },
    // createClickBillboard: function (data) {
    //     var text = this.getBillboardText(data);
    //     var cube1 = new mono.Cube(1, 1, 1);
    //     cube1.setPosition(this.msgSmallCubePosition);
    //     cube1.setParent(cameraSmallCube);
    // }
});