var $UPreOccupiedManager = function (sceneManager, application) {
    this.sceneManager = sceneManager;
    this.application = application;
    this.dm = this.sceneManager.dataManager;
    this.vm = this.sceneManager.viewManager3d;
    this.network = this.vm.network;
    this.box = this.network.getDataBox();
    this.de = this.vm.defaultEventHandler;
    this.init();
};

mono.extend($UPreOccupiedManager, Object, {

    init: function () {
        var self = this;
        this.colorCubes = {};
        this.currentRackId = null;

        this.extendField = {
            customerName: {
                id: 'customerName',
                name: it.util.i18n('Rack_Pre_Customer_Name'),
            },
            user: {
                id: 'user',
                name: it.util.i18n('Rack_Pre_Occupier'),
            }
        }
        // this.surfaceColor = '#52b2e8';
        this.surfaceColor = '#009bea';
        this.lineColor = '#fff';
        this.surfaceOpacity = 0.9;
        this.parentDom = $('.preoccupied-box');

        this.rootView = this.network.getRootView();
        this.userEventHandlerBox = {
            'dblclick': {
                element: this.rootView,
                event: 'dblclick',
                funcName: 'handleDoubleClick',
            },
            'mousedown': {
                element: this.rootView,
                event: 'mousedown',
                funcName: 'handleClick',
            },
        }
        it.util.augment(it.UPreOccupiedManager, it.dealUserEventHandler);
    },

    // app开启
    show: function (params) {
        // console.log(params);
        var self = this;
        // console.log('U预占用on');
        this.appState = true;
        this.colorCubes = {};
        this.rackColorCubes = {};
        this.colorCubesState = false;
        this.currentRackId = null;
        this.focusChangeNewData = null;
        this.ifDoubleClickRackCube = true;


        for (var i = 0; i < params.allRightDatas.length; i++) {
            var rightData = params.allRightDatas[i];
            var rightDataId = rightData._id;
            var nodes = this.makeColorCubes(rightData);
            this.colorCubes[rightDataId] = {
                data: rightData,
                nodes: nodes,
            }
        }
        this.showAllColorCubes();
        // console.log(this.colorCubes);
        this.addAllUserEventHandler();
        this.vm.addPropertyChangeListener(this.onFocusChange, this);
        this.de.addAfterLookFinishedAtListener(this.afterLookFinishedAtHandler, this);
    },

    // app关闭
    hide: function () {
        if (this.appState) {
            // console.log('U预占用off');
            this.appState = false;
            this.hideAllColorCubes();
            this.closeAllPop();
            this.removeDeviceColorCubes();
            this.colorCubes = {};
            this.rackColorCubes = {};
            this.currentRackId = null;
            this.colorCubesState = false;
            this.focusChangeNewData = null;
            this.ifDoubleClickRackCube = false;
            
            this.removeAllUserEventHandler();
            this.de.removeAfterLookAtFinishedListener(this.afterLookFinishedAtHandler, this);
            this.vm.removePropertyChangeListener(this.onFocusChange, this);
        }
    },

    afterLookFinishedAtHandler: function (node) {
        if (this.appState) {
            var data = this.sceneManager.getNodeData(node);
            var dt = this.sceneManager.dataManager.getDataTypeForData(data);
            var categoryId = dt.getCategoryId();
            if (categoryId == 'floor') {
                this.ifDoubleClickRackCube = true;
            } else {
                this.ifDoubleClickRackCube = false;
            }
        }
    },


    // floor区
    makeColorCubes: function (rackData) {
        var rackNode = this.sceneManager.getNodeByDataOrId(rackData);
        var dataType = this.dm.getDataTypeById(rackData._dataTypeId);
        var rackChildrenSize = dataType._childrenSize.ySize;
        var bb = rackNode.getBoundingBox();
        var rackNodeSize = {
            width: rackNode.width || bb.max.x - bb.min.x,
            height: rackNode.height || bb.max.y - bb.min.y,
            depth: rackNode.depth || bb.max.z - bb.min.z,
        }
    
        var id = rackData._id;  
        var colorCubeArray = rackData.getUserData('UPreOccupied_emptyList');   
        var oneRackCubeArray = [];
        for (var i = 0; i < colorCubeArray.length; i++) {
            var empty = colorCubeArray[i];
            if (empty.total >= this.application.uHeight) {
                var cubes = this.makeColorCube({
                    rackData: rackData,
                    empty: empty,
                    rackNodeSize: rackNodeSize,
                    rackChildrenSize: rackChildrenSize,
                })
                oneRackCubeArray.push(cubes);
            }
        }
        return oneRackCubeArray;
    },

    makeColorCube: function (params) {
        var rackData = params.rackData,
            empty = params.empty,
            rackNodeSize = params.rackNodeSize,
            rackChildrenSize = params.rackChildrenSize;

        var surfaceColor = this.surfaceColor,
            lineColor = this.lineColor,
            surfaceOpacity = this.surfaceOpacity;
        var sizeScale = 0.9;
        var width = rackNodeSize.width*sizeScale,
            height = rackNodeSize.height * (empty.total / rackChildrenSize),
            depth = rackNodeSize.depth,
            positionY = rackNodeSize.height / rackChildrenSize * ((empty.end + empty.start) / 2 - rackChildrenSize / 2 - 0.5),
            position = new mono.Vec3(0, positionY, 0);
        // console.log('positionY', positionY);
        // console.log('height', height);
        // console.log('---');
        var cubeIn = new mono.Cube(width, height, depth);
        cubeIn.s({
            'm.color': surfaceColor,
            'm.transparent': true,
            'm.opacity': surfaceOpacity,
        })
        cubeIn.setClient(it.SceneManager.CLIENT_EXT_VITUAL, true);
        cubeIn.setPosition(position);
        // cubeIn.setClient('cubeStyle', 'UPreOccupied');
        // cubeIn.setClient('cubeStyle1', 'in');
        // cubeIn.setClient('rackData', rackData);
        var cubeOut = new mono.Cube(width, height, depth);
        cubeOut.s({
            'm.wireframeLinecolor': lineColor,
            'm.wireframe': true,
        })
        cubeOut.setClient(it.SceneManager.CLIENT_EXT_VITUAL, true);
        cubeOut.setPosition(position);
        cubeOut.setClient('cubeStyle', 'UPreOccupied');
        cubeOut.setClient('rackData', rackData);
        return {
            cubeOut: cubeOut,
            cubeIn: cubeIn,
        }
    },

    showAllColorCubes: function () {
        if (!this.colorCubesState) {
            for (var key in this.colorCubes) {
                this.showColorCubesByRackId(key);
            }
            this.colorCubesState = true;
        }
    },

    showColorCubesByRackId: function (id) {
        var rackNode = this.sceneManager.getNodeByDataOrId(id);
        var nodes = this.colorCubes[id].nodes;
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            var cubeIn = node.cubeIn;
            cubeIn.setParent(rackNode);
            this.box.add(cubeIn);
            var cubeOut = node.cubeOut;
            cubeOut.setParent(rackNode);
            this.box.add(cubeOut);
        }
    },

    hideAllColorCubes: function () {
        if (this.colorCubesState) {
            for (var key in this.colorCubes) {
                this.hideColorCubesByRackId(key);
            }
            this.colorCubesState = false;
        }
    },

    hideColorCubesByRackId: function (id) {
        var rackNode = this.sceneManager.getNodeByDataOrId(id);
        var nodes = this.colorCubes[id].nodes;
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            var cubeIn = node.cubeIn;
            cubeIn.setParent(null);
            this.box.remove(cubeIn);
            var cubeOut = node.cubeOut;
            cubeOut.setParent(null);
            this.box.remove(cubeOut);
        }
    },

    handleDoubleClick: function (e) {
        if (this.appState && this.ifDoubleClickRackCube) {
            var first = this.getFirstCubeByMouseEvent(e);
            if (first) {
                var element = first.element;
                if (element instanceof mono.Cube) {
                    var cubeStyle = element.getClient('cubeStyle')
                    var rackData = element.getClient('rackData')
                    if (cubeStyle == 'UPreOccupied') {
                        this.de.lookAtByData(rackData);
                        return;
                    }
                }
            }
        }
    },

    getFirstCubeByMouseEvent: function (e) {
        var currentCubesBox = [];
        for (var key in this.colorCubes) {
            var nodes = this.colorCubes[key].nodes;
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                // currentCubesBox.push(node.cubeIn);
                currentCubesBox.push(node.cubeOut);
            }
        }
        var result = this.vm.getFirstElementInIntersectsByMouseEvent(currentCubesBox, e);
        return result;
    },
    // floor区完


    // 混合区
    onFocusChange: function (event) {
        if (event.property == "focusNode" && this.appState) {
            // console.log('focusNode in upre');
            var newNode = event.newValue;
            var newData = this.sceneManager.getNodeData(newNode);
            if (this.focusChangeNewData == newData) {
                return;
            } else {
                this.focusChangeNewData = newData;
            }
            var newCategory = this.dm.getCategoryForData(newData);
            var newCategoryId = newCategory.getId();
            if (newCategoryId == 'floor') {
                this.application.vitualAllChildren.call(this.application);
                this.showAllColorCubes();
            } else {
                if (this.colorCubesState) {
                    this.application.clearVitualAllChildren.call(this.application);
                    this.hideAllColorCubes();
                }
                if (newCategoryId != 'rack') {
                    this.application.deselectAllTree.call(this.application);
                    this.removeDeviceColorCubes();
                } else {
                    this.makeDeviceColorCubes(newData);
                    // console.log(newData._userDataMap);
                }
            }
        }
    },
    // 混合区完


    // rack区
    makeDeviceColorCubes: function (data) {
        if (this.currentRackId) {
            this.removeDeviceColorCubes();
        }
        var rackNode = this.sceneManager.getNodeByDataOrId(data);
        var dataType = this.dm.getDataTypeForData(data);
        // console.log('makeDeviceColorCubes', data);
        var emptyList = data.getUserData('UPreOccupied_emptyList');
        var preOccupiedList = data.getUserData('UPreOccupied_preOccupiedList');
        this.currentRackData = data;
        this.currentRackId = data._id;
        this.rackColorCubes.parentNode = rackNode;
        this.rackColorCubes.wrapPop = {};
        this.rackColorCubes.inPop = {};
        // this.rackColorCubes.hoverPop = {};

        var bb = rackNode.getBoundingBox();
        var childSize = dataType._childrenSize,
            ySize = childSize.ySize,
            xPadding = childSize.getXPadding() || [0, 0],
            yPadding = childSize.getYPadding() || [0, 0],
            zPadding = childSize.getZPadding() || [0, 0];
        // 注意这里的ZPadding为两个负值
        var size = {
            width: (rackNode.width || (bb.max.x - bb.min.x)) - (childSize.getXPadding()[0] + childSize.getXPadding()[1]),
            height: (rackNode.height || (bb.max.y - bb.min.y)) - (childSize.getYPadding()[0] + childSize.getYPadding()[1]),
            depth: (rackNode.depth || (bb.max.z - bb.min.z)) + (childSize.getZPadding()[0] + childSize.getZPadding()[1]),
        }

        this.inPopCommonParams = {
            bgColor: '#3a647f',
            borderColor: '#0d77c1',
            popWidth: size.width,
            popHeight: size.height / ySize,
            ySize: ySize,
            zPosition: size.depth / 2,
            uOrder: dataType._modelParameters&&dataType._modelParameters.uOrder,
        }

        this.wrapPopCommonParams = {
            width: size.width,
            height: size.height,
            depth: size.depth,
            childSize: childSize,
            bgColor: '#3a647f',
            borderColor: '#0468ae',
            lineColor: '#0084e8',
            diagonalColor: '#0372c1',
            textColor: '#fff',
            isNeedDiagonal: true,
            uOrder: dataType._modelParameters&&dataType._modelParameters.uOrder,
        }

        this.hoverPopCommonParams = {
            width: size.width,
            height: size.height,
            depth: size.depth,
            childSize: childSize,
            bgColor: '#21a2a8',
            borderColor: '#00f7ff',
            lineColor: '#02f2fa',
            textColor: '#fff',
            uOrder: dataType._modelParameters&&dataType._modelParameters.uOrder,
        }

        // 创建单个的pop
        for (var i = 0; i < emptyList.length; i++) {
            var empty = emptyList[i];
            if (empty.total >= this.application.uHeight) {
                for (var j = empty.start; j < empty.end + 2 - this.application.uHeight; j++) {
                    this.makeDeviceColorInPop(j);
                }
            }
        }


        // 创建预占用的pop
        for (var i = 0; i < preOccupiedList.length; i++) {
            var preOccupied = preOccupiedList[i];
            this.makeDeviceColorWrapPop(preOccupied);
        }

    },

    removeDeviceColorCubes: function () {
        if (this.currentRackId) {
            // console.log('removeDeviceColorCubes', this.currentRackId);
            // 移除预占用的pop
            for (var key in this.rackColorCubes.wrapPop) {
                this.removeDeviceColorCube({
                    popType: 'wrapPop',
                    popDataId: key,
                })
            }
            // 移除单个的pop
            for (var key in this.rackColorCubes.inPop) {
                this.removeDeviceColorCube({
                    popType: 'inPop',
                    popDataId: key,
                })
            }
            this.removeDeviceColorCube({
                popType: 'hoverPop',
            })
            this.currentRackId = null;
            this.rackColorCubes = {};
            this.closePopPanel();
        }
    },

    removeDeviceColorCube: function (params) {
        var popType = params.popType,
            popDataId = params.popDataId;
        var pop;
        if (popType == 'wrapPop') {
            pop = this.rackColorCubes.wrapPop[popDataId];
        } else if (popType == 'inPop') {
            pop = this.rackColorCubes.inPop[popDataId];
        } else if (popType == 'hoverPop') {
            pop = this.rackColorCubes.hoverPop;
        }
        if (pop) {
            pop.setParent(null);
            this.box.removeByDescendant(pop);
        }
    },

    makeDeviceColorInPop: function (yLocation) {
        // var yLocation = params.yLocation;
        var rackDataId = this.currentRackId,
            rackNode = this.rackColorCubes.parentNode,
            inPopCommonParams = this.inPopCommonParams;
        var inPopParams = {};
        var selfInPop = {
            yLocation: yLocation,
            customPro: {
                'type': 'uPrePop',
                'popState': 'inPop',
                'popDataId': rackDataId + '_' + yLocation,
            }
        }
        $.extend(inPopParams, inPopCommonParams, selfInPop);
        var inPop = it.util.createEmptyNode(inPopParams, rackNode);
        inPop.setParent(rackNode);
        this.box.addByDescendant(inPop);
        this.rackColorCubes.inPop[rackDataId + '_' + yLocation] = inPop;
    },

    makeDeviceColorWrapPop: function (params) {
        // var total = params.total,
        //     start = params.start,
        //     end = params.end;
        var rackDataId = this.currentRackId,
            rackNode = this.rackColorCubes.parentNode,
            wrapPopCommonParams = this.wrapPopCommonParams;

        var wrapPopParams = {};
        var selfWrapPop = {
            object: params,
            customPro: {
                'type': 'uPrePop',
                'popState': 'wrapPop',
                'popDataId': rackDataId + '_' + params.start,
                'popParams': params,
            }
        }
        $.extend(wrapPopParams, wrapPopCommonParams, selfWrapPop);
        var wrapPop = it.util.createOccupyPop(wrapPopParams,'',true);
        wrapPop.setParent(rackNode);
        this.box.addByDescendant(wrapPop);
        this.rackColorCubes.wrapPop[rackDataId + '_' + params.start] = wrapPop;
    },

    makeDeviceColorHoverPop: function (params) {
        // var total = params.total,
        //     start = params.start,
        //     end = params.end;
        var oldPopState = params.oldPopState;

        var rackDataId = this.currentRackId,
            rackNode = this.rackColorCubes.parentNode,
            hoverPopCommonParams = this.hoverPopCommonParams;

        var hoverPopParams = {};
        var selfHoverPop = {
            object: params,
            customPro: {
                'type': 'uPrePop',
                'popState': 'hoverPop',
                'oldPopState': oldPopState,
                'popDataId': rackDataId + '_' + params.start,
                'params': params,
            }
        }
        $.extend(hoverPopParams, hoverPopCommonParams, selfHoverPop);
        var hoverPop = it.util.createOccupyPop(hoverPopParams,'',true);
        hoverPop.setParent(rackNode);
        this.box.addByDescendant(hoverPop);
        this.rackColorCubes.hoverPop = hoverPop;
    },


    addDeviceColorCube: function (params) {
        var popType = params.popType,
            popDataId = params.popDataId;
        var pop;
        if (popType == 'wrapPop') {
            pop = this.rackColorCubes.wrapPop[popDataId];
        } else if (popType == 'inPop') {
            pop = this.rackColorCubes.inPop[popDataId];
        } else if (popType == 'hoverPop') {
            pop = this.rackColorCubes.hoverPop;
        }
        if (pop) {
            pop.setParent(this.rackColorCubes.parentNode);
            this.box.addByDescendant(pop);
        }
    },

    handleClick: function (e) {
        if (this.appState) {
            // var timer1 = Date.now();
            var first = this.getFirstDeviceCubeByMouseEvent(e);
            // var timer2 = Date.now();
            if (first) {
                var element = first.element;
                if (element && element.getClient('type') == 'uPrePop') {
                    var popState = element.getClient('popState');
                    var popDataId = element.getClient('popDataId')
                    // console.log('popState', popState);
                    // console.log('popDataId', popDataId);
                    if (popState == 'inPop') {
                        // var timer3 = Date.now();
                        this.addPre(popDataId);
                        // var timer4 = Date.now();
                        // console.log('c2-1', timer2-timer1);
                        // console.log('c3-2', timer3-timer2);
                        // console.log('c4-3', timer4-timer3);
                    } else if (popState == 'wrapPop') {
                        this.removePre(popDataId);
                    } else if (popState == 'hoverPop') {
                        this.closeAllPop();
                    }
                }
            }
        }
    },

    getFirstDeviceCubeByMouseEvent: function (e) {
        var currentDeviceCubesBox = [];
        for (var key in this.rackColorCubes.wrapPop) {
            var node = this.rackColorCubes.wrapPop[key];
            currentDeviceCubesBox.push(node);
        }
        for (var key in this.rackColorCubes.inPop) {
            var node = this.rackColorCubes.inPop[key];
            currentDeviceCubesBox.push(node);
        }
        currentDeviceCubesBox.push(this.rackColorCubes.hoverPop);

        var result = this.vm.getFirstElementInIntersectsByMouseEvent(currentDeviceCubesBox, e);
        return result;
    },

    addPre: function (popDataId) {
        // console.log('添加预占用' + popDataId);
        // 隐藏之前的hover
        var self = this;
        // var timer1 = Date.now();
        // if (this.isHasHover) {
        //     this.resetHover();
        // } else {
        //     this.isHasHover = true;
        // }
        this.closeAllPop();
        var array = popDataId.split('_');
        var rackId = array[0];
        var yLocation = parseInt(array[1]);
        // var timer2 = Date.now();
        for (var i = 0; i < this.application.uHeight; i++) {
            this.removeDeviceColorCube({
                popType: 'inPop',
                popDataId: rackId + '_' + (yLocation + i),
            })
        }
        // var timer3 = Date.now();
        this.makeDeviceColorHoverPop({
            total: self.application.uHeight,
            start: yLocation,
            end: yLocation + self.application.uHeight - 1,
            oldPopState: 'inPop',
        })
        // var timer4 = Date.now();
        // console.log('2-1', timer2 - timer1);
        // console.log('3-2', timer3 - timer2);
        // console.log('4-3', timer4 - timer3);
        this.makeDialogPop({
            dialogPopState: 'add',
            popDataId: popDataId,
        })
    },

    removePre: function (popDataId) {
        // console.log('移除预占用' + popDataId);
        // 隐藏之前的hover
        var self = this;
        // if (this.isHasHover) {
        //     this.resetHover();
        // } else {
        //     this.isHasHover = true;
        // }
        this.closeAllPop();
        var wrapPop = this.rackColorCubes.wrapPop[popDataId];
        var popParams = wrapPop.getClient('popParams');
        this.removeDeviceColorCube({
            popType: 'wrapPop',
            popDataId: popDataId,
        })
        this.makeDeviceColorHoverPop({
            total: popParams.total,
            start: popParams.start,
            end: popParams.end,
            oldPopState: 'wrapPop',
        })
        this.makeDialogPop({
            dialogPopState: 'remove',
            popDataId: popDataId,
        })
    },

    resetHover: function () {
        if (this.rackColorCubes.hoverPop) {
            var hoverPop = this.rackColorCubes.hoverPop,
                oldPopState = hoverPop.getClient('oldPopState');
            popDataId = hoverPop.getClient('popDataId');
            this.removeDeviceColorCube({
                popType: 'hoverPop',
            });
            if (oldPopState == 'wrapPop') {
                this.addDeviceColorCube({
                    popType: 'wrapPop',
                    popDataId: popDataId,
                })
            } else if (oldPopState == 'inPop') {
                var array = popDataId.split('_');
                var rackDataId = array[0];
                var start = parseInt(array[1]);
                for (var i = 0; i < this.application.uHeight; i++) {
                    this.addDeviceColorCube({
                        popType: 'inPop',
                        popDataId: rackDataId + '_' + (start + i),
                    })
                }
            }
        }
    },

    makeDialogPop: function (params) {
        var self = this;
        var dialogPopState = params.dialogPopState;
        var popDataId = params.popDataId;
        var title;
        var hoverPop = self.rackColorCubes.hoverPop;
        var hoverPopParams = hoverPop.getClient('params');
        var otherExtend = {
            total: hoverPopParams.total,
            start: hoverPopParams.start,
            end: hoverPopParams.end,
        }
        this.closePopPanel();
        this.popPanel = $('<div>').addClass('new-app-panel').appendTo(this.parentDom);
        if (dialogPopState == 'add') {
            title = it.util.i18n('Rack_Pre_Occupied');
            this.popPanel.PreOccupiedPop({
                extendField: self.extendField,
                tip: '',
                doSearchIt: function () {
                    var extend = {};
                    for (var key in self.extendField) {
                        extend[key] = self.popPanel.PreOccupiedPop('getExtendFieldVal', key).trim();
                        if (extend[key] == '') {
                            ServerUtil.msg(self.extendField[key].name + ' ' + it.util.i18n('Device_On_Cannot_Empty'));
                            return;
                        }
                    }
                    $.extend(extend, otherExtend);
                    self.addOccupied({
                        id: popDataId,
                        extend: extend,
                    });
                },
                doClearIt: function () {
                    self.closeAllPop();
                },
            })
        } else if (dialogPopState == 'remove') {
            title = it.util.i18n('Rack_Cancel_Pre_Occupied');
            var newExtend = [];
            var extendObj = this.application.uPreMsg[this.currentRackId][popDataId].extend;
            for (var key in this.extendField) {
                newExtend.push({
                    name: this.extendField[key].name,
                    value: extendObj[key],
                })
            }
            // console.log(newExtend);
            this.popPanel.cancelOccupiedPop({
                extendes: [{
                    id: popDataId,
                    extend: newExtend
                }],
                tip: '',
                doSearchIt: function () {
                    var extend = {
                        id: popDataId
                    };
                    $.extend(extend, otherExtend)
                    self.removeOccupied(extend);
                },
                doClearIt: function () {
                    self.closeAllPop();
                },
            })
        }
        this.popPanel.dialog({
            appendTo: ".dialog-box",
            dialogClass: 'new-dialog1',
            blackStyle: true,
            width: '400px',
            height: 'auto',
            maxHeight: 400,
            title: title,
            autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
            show: '', //显示弹窗出现的效果，slide为滑动效果
            hide: '', //显示窗口消失的效果，explode为爆炸效果
            resizable: false, //设置是否可拉动弹窗的大小，默认为true
            position: {
                my: "right center",
                at: "right-100 center",
            },
            modal: false, //是否有遮罩模型
        });
        this.popPanel.dialog('open');
        this.popPanel.on('dialogclose', function () {
            self.closeAllPop();
        });
    },

    addOccupied: function (params) {
        var self = this;
        // console.log(params);
        var id = params.id,
            extend = params.extend;
        var data = {
            id: id,
            occupyType: 'u',
            parentId: this.application.floorDataId,
            extend: extend,
        }
        var rackArray = this.currentRackData.getUserData('UPreOccupied_rackArray');

        for (var i = 0; i < extend.total; i++) {
            rackArray[extend.start + i - 1] = 2;
        }
        it.util.api('pre_occupied', 'add', data, function (result) {
            var id = result.id;
            if(!self.application.uPreMsg[self.application.app.currentRackId]) {
                self.application.uPreMsg[self.application.app.currentRackId]=  {};
            }
            self.application.uPreMsg[self.application.app.currentRackId][id] = {
                ids: result.id,
                extend: result.extend,
            }
           
            self.closeAllPop();
            // self.makeDeviceColorCubes(self.currentRackData);
            self.refreshRackColorCubes(rackArray);
            ServerUtil.msg(it.util.i18n('U_Pre_Occupied_Occupied_Success'));
        })
    },

    removeOccupied: function (params) {
        // console.log(popDataId);
        var self = this;
        var id = params.id;
        var data = {
            id: id,
            occupyType: 'u',
        }
        var rackArray = this.currentRackData.getUserData('UPreOccupied_rackArray');
        for (var i = 0; i < params.total; i++) {
            rackArray[params.start + i - 1] = 0;
        }
        it.util.api('pre_occupied', 'remove', data, function (result) {
            delete self.application.uPreMsg[self.application.app.currentRackId][result.id];
            self.closeAllPop();
            self.refreshRackColorCubes(rackArray);
            ServerUtil.msg(it.util.i18n('U_Pre_Occupied_Cancel_Occupied_Success'));
        })
    },

    closeAllPop: function () {
        this.closePopPanel();
        this.resetHover();
    },

    closePopPanel: function () {
        if (this.popPanel) {
            this.popPanel.remove();
            this.popPanel = null;
        }
    },

    refreshRackColorCubes: function (rackArray) {
        var self = this;
        self.currentRackData.setUserData('rackArray', rackArray);
        var lists = this.application.computeListByRackArray({
            data: self.currentRackData,
            rackArray: rackArray,
        })
        // 好像不需要计算到这一块
        // var space = {};
        // $.extend(space, lists, {rackArray: rackArray})
        // this.updateUPreOccupiedUserData({
        //     data: data,
        //     space: space,
        // })
        this.makeDeviceColorCubes(this.currentRackData);
    },
    // rack区完

});

it.UPreOccupiedManager = $UPreOccupiedManager;