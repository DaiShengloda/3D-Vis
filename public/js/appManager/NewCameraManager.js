

it.NewCameraManager = function (sceneManager) {
    this.sceneManager = sceneManager;
    this.dataBox = this.sceneManager.network3d.getDataBox();
	this.virtualManager = new it.VirtualManager(sceneManager);
    this.sceneManager.viewManager3d.addMaterialFilter(this.virtualManager);
    this.defaultEventHandler = this.sceneManager.viewManager3d.getDefaultEventHandler();
    this.dm = this.sceneManager.dataManager;
    this.vm = this.sceneManager.viewManager3d;
    this.network = this.vm.network;
    this.rootView =this.network.getRootView();
    this.init();
};

mono.extend(it.NewCameraManager, Object, {

    init: function () {

        this.cones = [];
        this.cameraIconsObj = {};
        var cameraIcons = dataJson.cameraIcons;
        for (var key in cameraIcons) {
            this.cameraIconsObj[key] = {};
            this.cameraIconsObj[key].image = new Image();
            this.cameraIconsObj[key].image.src = pageConfig.url(cameraIcons[key].src);
            this.cameraIconsObj[key].modelId = cameraIcons[key].modelId;
        }

        this.commonCameraScale = new mono.Vec3(200, 200, 1);
        this.hoverCameraScale = new mono.Vec3(250, 250, 1);
        this.msgBillboardScale = new mono.Vec3(0.4, 0.4, 1);
        // this.cameraSmallCubePosition = new mono.Vec3(0, 250, 30);
        var cameraSmallCubeYPosition = dataJson.cameraSmallCubeYPosition||250;
        // console.log(dataJson.cameraSmallCubeYPosition);
        this.cameraSmallCubePosition = new mono.Vec3(0, cameraSmallCubeYPosition, 0);
        // this.msgSmallCubePosition = new mono.Vec3(300, 300, 0);
        this.msgSmallCubePosition = new mono.Vec3(0, 100, 0);

        this.userEventHandlerBox = {
            'mousemove': {
                element: this.rootView,
                event: 'mousemove',
                funcName: 'handleMouseMove',
            },
            'click': {
                element: this.rootView,
                event: 'click',
                funcName: 'handleClick',
            },
        }
        it.util.augment(it.NewCameraManager, it.dealUserEventHandler);

        var self = this;
        this.customColumns = {};
        ServerUtil.api('data','findCustomColumnsByCategoryId',{'categoryId': 'camera'},function(result){
            // console.log(result);
            for (var i = 0; i < result.length; i++) {
                var id = result[i].column_name;
                self.customColumns[id] = {
                    id: id,
                    name: result[i].column_display_name||id,
                }
            }
        });
    },

    createRootCube: function () {
        var yMul = 5;
        var rootNode = this.sceneManager._currentRootNode;
        var size;
        if (rootNode && rootNode.boundingBox && rootNode.boundingBox.size) {
            var size = rootNode.boundingBox.size();
        }
        if (!size) {
            size = {x: 50000, y: 50000, z: 50000};
        }
        this.rootCube = new mono.Cube(size.x, size.y*yMul, size.z);

        var center = rootNode.boundingBox.center();
        var rootCubeY = rootNode.p().y + size.y*yMul/2;
        this.rootCube.p(center.x, rootCubeY, center.z);

        if (!size) {
            this.rootCube.p(0, 0, 0);
        }
        this.rootCube.s({
            'm.type': 'phong',
            'm.transparent': true,
            'm.opacity': 0,
        });
    },
    
    show: function (cameras) {
        this.appState = true;
        this.removeEvent();
        this.createRootCube();
        this.addVirtual(cameras);
        this.createBillboards(cameras);
        main.sceneManager.network3d.dirtyNetwork();
        this.addAllUserEventHandler();
    },
    hide: function () {
        this.appState = false;
        this.removeVirtual();
        this.clearCones();
        this.removeBillboards();
        this.removeAllUserEventHandler();
        delete this.rootCube;
        this.addEvent();
    },

    removeEvent: function () {
        this.oldHandleDoubleClickElementFunction = this.sceneManager.viewManager3d.defaultEventHandler.handleDoubleClickElement;
        this.sceneManager.viewManager3d.defaultEventHandler.handleDoubleClickElement = function (node, network, data, clickedObj) {

        }
    },
    addEvent: function () {
        if (!this.oldHandleDoubleClickElementFunction) return;
        this.sceneManager.viewManager3d.defaultEventHandler.handleDoubleClickElement = this.oldHandleDoubleClickElementFunction;
        delete this.oldHandleDoubleClickElementFunction;
    },

    getFirstCameraBillboardByMouseEvent: function (e) {
        var currentCameraBillboardsBox = [];
        for (var key in this.billboards) {
            currentCameraBillboardsBox.push(this.billboards[key].billboard);
        }
        var result = this.vm.getFirstElementInIntersectsByMouseEvent(currentCameraBillboardsBox, e);
        return result;
    },

    handleMouseMove: function(e){
        // console.log(e);
        if (this.appState) {
            var first = this.getFirstCameraBillboardByMouseEvent(e);
            if (first) {
                var element = first.element;
                if (element instanceof mono.Billboard) {
                    var boardType = element.getClient('boardType')
                    var cameraDataId = element.getClient('cameraDataId')
                    if (boardType == 'cameraIcon') {
                        this.onHoverBillboard(cameraDataId);
                        return;
                    }
                }
            }
            this.onOutBillboard();
        }
    },

    onHoverBillboard: function(cameraDataId){
        if(this.hoverBillboardId){
            this.onOutBillboard();
        }
        var board = this.billboards[cameraDataId].billboard;
        if(board){
            board.setScale(this.hoverCameraScale);
            board.setPosition(new mono.Vec3(0, -1*this.hoverCameraScale.y, 0));
            this.hoverBillboardId = cameraDataId;
        }
        var cameraSmallCube = this.billboards[cameraDataId].cameraSmallCube;
        if(cameraSmallCube){
            cameraSmallCube.setPosition(new mono.Vec3(this.cameraSmallCubePosition.x, this.cameraSmallCubePosition.y + (this.hoverCameraScale.y - this.commonCameraScale.y), this.cameraSmallCubePosition.z));
        }
    },

    onOutBillboard: function(){
        if (this.hoverBillboardId) {
            var cameraSmallCube = this.billboards[this.hoverBillboardId].cameraSmallCube;
            if (cameraSmallCube) {
                cameraSmallCube.setPosition(this.cameraSmallCubePosition);
            }
            var board = this.billboards[this.hoverBillboardId].billboard;
            if (board) {
                board.setScale(this.commonCameraScale);
                board.setPosition(new mono.Vec3(0, -1*this.commonCameraScale.y, 0));
                this.hoverBillboardId = null;
            }
        }
    },

    handleClick: function(e){
        // console.log(e);
        if (this.appState) {
            var first = this.getFirstCameraBillboardByMouseEvent(e);
            if (first) {
                var element = first.element;
                if (element instanceof mono.Billboard) {
                    var boardType = element.getClient('boardType')
                    var cameraDataId = element.getClient('cameraDataId')
                    if (boardType == 'cameraIcon') {
                        this.addExpandMsg(cameraDataId);
                        return;
                    }
                }
            }
            this.removeExpandMsg();
        }
    },

    addExpandMsg: function(cameraDataId){
        if(this.expandMsgId){
            this.removeExpandMsg();
        }
        this.expandMsg = {};
        var cameraSmallCube = this.billboards[cameraDataId].cameraSmallCube;
        
        if(this.billboards[cameraDataId].msgBillboard){
            var msgBillboard = this.billboards[cameraDataId].msgBillboard;
            var msgSmallCube = this.billboards[cameraDataId].msgSmallCube;
        } else{
            var msgSmallCube = new mono.Cube(1, 1, 1);
            msgSmallCube.s({
                'm.color': 'red',
            })
            msgSmallCube.setPosition(this.msgSmallCubePosition);
            msgSmallCube.setParent(cameraSmallCube);
            this.billboards[cameraDataId].msgSmallCube = msgSmallCube;
            
            var msgBillboard = this.makeMsgBillboard(cameraDataId);
            msgBillboard.setParent(msgSmallCube);
        }
        msgSmallCube.setParent(cameraSmallCube);
        this.dataBox.addByDescendant(msgSmallCube);
        this.makeCubeLinks(cameraDataId);
        this.expandMsgId = cameraDataId;
    },

    removeExpandMsg: function(){
        if(this.expandMsgId && this.billboards[this.expandMsgId]){
            var msgSmallCube = this.billboards[this.expandMsgId].msgSmallCube;
            if(msgSmallCube){
                msgSmallCube.setParent(null);
                this.dataBox.removeByDescendant(msgSmallCube);
            }
            this.expandMsgId = null;
        }
    },

    makeMsgBillboard: function(cameraDataId){
        // console.log(cameraDataId);
        var str = this.getCameraMsg(cameraDataId);
        var options = {
			arrowPosition: 'noArrow',
            triangleTipPosition: 'leftBottom',
			globalAlpha: 0.9,
			text: str,
            scale:[this.msgBillboardScale.x, this.msgBillboardScale.y, this.msgBillboardScale.z],
            position: [0,0,0],
		};
        var msgBillboard = it.util.makeTextBillboardWithArrow.createBillboard(options);
        msgBillboard.s({
            'm.alignment': mono.BillboardAlignment.bottomLeft,
            // 'm.fixedSize': 10000,
        })
        
        this.billboards[cameraDataId].msgBillboard = msgBillboard;
        return msgBillboard;
    },

    getCameraMsg: function(cameraDataId){
        var str = '';
        var data = this.dm.getDataById(cameraDataId);
        str += data._name||data._description||data._id;
        var name = data._name;
        str += '\n编号：' + cameraDataId;
        for (var key in this.customColumns) {
            var customId = this.customColumns[key].id;
            var customName = this.customColumns[key].name;
            var customValue = data.getUserData(customId);
            if(customValue&&customValue.trim()!=''){
                str += '\n'+ customName + '：' + customValue;
            }
        }
        return str;
    },

    makeCubeLinks: function(cameraDataId){
        var cameraSmallCube = this.billboards[cameraDataId].cameraSmallCube;
        var msgSmallCube = this.billboards[cameraDataId].msgSmallCube;

        var linkNode = new mono.PathLink(cameraSmallCube, msgSmallCube);
        linkNode.s({
            'm.color': '#00f6ff',
            'm.ambient': '#00f6ff',
            // 在这里设置这个好像会有问题
            // 'm.linkType': 'flex.y',
        });
        // linkNode.setLinkType('flex.y');
        linkNode.setLinkType('extend.y');
        // this.dataBox.add(linkNode);
    },

    addVirtual: function (cameras) {
        this.virtualManager.addAll();
        cameras.forEach(function (camera) {
            this.virtualManager.remove(camera);
        }, this);
        var rootData = this.sceneManager._currentRootData;
        this.virtualManager.remove(rootData);
    },
    removeVirtual: function () {
        this.virtualManager.clearAll();
    },

    createBillboards: function (cameras) {
        this.billboards = {};
        // var position = new mono.Vec3(0, 0, 0);
        cameras.forEach(function (camera) {
            var cameraNode = this.sceneManager.getNodeByDataOrId(camera);
            if(this.billboards[camera._id]&&this.billboards[camera._id].billboard){
                var cameraSmallCube = this.billboards[camera._id].cameraSmallCube;
                var billboard = this.billboards[camera._id].billboard;
            } else{
                var billboard = this.createBillboard(camera);
                var cameraSmallCube = new mono.Cube(1, 1, 1);
                cameraSmallCube.s({
                    'm.color': 'red',
                })
                cameraSmallCube.setPosition(this.cameraSmallCubePosition);
                cameraSmallCube.setParent(cameraNode);
                billboard.setParent(cameraSmallCube);
                billboard.setPosition(new mono.Vec3(0, -1*this.commonCameraScale.y, 0));
                this.billboards[camera._id] = {
                    id: camera._id,
                    billboard: billboard,
                    cameraNode: cameraNode,
                    cameraSmallCube: cameraSmallCube,
                    // middleSmallCube: middleSmallCube,
                };
            }
            cameraSmallCube.setParent(cameraNode);
            this.dataBox.addByDescendant(cameraSmallCube);
        }, this);
    },

    createBillboard: function (parentData) {
        var image = this.getCameraImageByData(parentData);
        // var billboard = it.util.makeImageBillboard(image);
        var billboard = new mono.Billboard();
        billboard.s({
            'm.texture.image': image,
            'm.transparent': true,
            'm.alignment': mono.BillboardAlignment.bottomCenter,
            'm.vertical': false,
            // 'm.fixedSize': 8000,
        });
        billboard.setScale(this.commonCameraScale);
        billboard.setClient('boardType', 'cameraIcon');
        billboard.setClient('cameraDataId', parentData._id);
        return billboard;
    },

    getCameraImageByData: function(data){
        var parentDataType = this.dm.getDataTypeById(data._dataTypeId);
        var model = parentDataType._model;
        for (var key in this.cameraIconsObj) {
            var icon = this.cameraIconsObj[key];
            for (var i = 0; i < icon.modelId.length; i++) {
                if(icon.modelId[i] == model){
                    return icon.image;
                }
            }
        }
    },

    removeBillboards: function () {
        if(!this.billboards) {
            return;
        }
        for (var key in this.billboards) {
            this.removeBillboard(this.billboards[key].cameraSmallCube);
        }
        this.billboards = {};
    },
    removeBillboard: function (cameraSmallCube) {
        cameraSmallCube.setParent(null);
        this.dataBox.removeByDescendant(cameraSmallCube);
    },
    doSimulateCameras: function (cameras) {
        cameras.forEach(function (camera) {
            this.doSimulateCamera(camera);
        }, this);
    },
    doSimulateCamera: function (data, callback) {
        if (!data) {
            return callback && callback();
        }
        var dataTypeId = this.sceneManager.dataManager.getDataTypeForData(data).getId();
        var self = this;
        ServerUtil.api('camera_view', 'search', {cameraDataTypeId: dataTypeId}, function (viewData) {
            if (!data || data.length < 1) {
                return;
            }
            var viewData = viewData[0]; 
            // var target;
            var frontDistance = viewData.farthestDistance || 1000;
            var fov = viewData.cameraFov || 50;
            // if (!target && !frontDistance) {
            //     return callback && callback();
            // }
            var dataNode = self.sceneManager.getNodeByDataOrId(data);
            if (!dataNode) {
                return callback && callback();
            }
            // if (target) {
            //     target = new mono.Vec3(parseFloat(target.x) || '0', parseFloat(target.y) || '0', parseFloat(target.z) || '0');
            // }
            // if (!target) {
            //     target = dataNode.frontWorldPosition(frontDistance);
            // }
            // var pos = dataNode.getWorldPosition(); 
            var cone = it.util.createCone2(5, frontDistance, fov || 50, dataNode);
            var combo = self.cutCone(cone);
            cone.setParent(null);
            if (combo) {
                self.dataBox.add(combo);
                self.cones.push(combo);
            }
        });
    },
    cutCone: function (cone) {
        var combo = new mono.ComboNode([cone, this.rootCube], ['^']);
        return combo;
    },
    clearCones: function () {
        if (this.cones && this.cones.length > 0) {
            for (var i = 0; i < this.cones.length; i++) {
                this.cones[i].setParent(null);
                this.dataBox.remove(this.cones[i]);
            };
            this.cones = [];
        };
    },
});

