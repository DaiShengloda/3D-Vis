/**
 * 调整镜头后相关事件的管理器
 * @constructor
 */

it.AfterLookAtManager = function(sceneManager){
    this.sceneManager = sceneManager;
    this.defaultEventHandler = this.sceneManager.viewManager3d.getDefaultEventHandler();
    this.defaultVirtualMaterialFilter = this.sceneManager.viewManager3d.getDefaultVirtualMaterialFilter();
    // this.visibleFun 
    this.dm = this.sceneManager.dataManager;
    // this.devPanelManager = new it.DevPanelManager(this.sceneManager);
    this.mainId = 'itv-main';
    // $('#'+this.mainId).append($(this.devPanelManager.container))
    this.init();
};

mono.extend(it.AfterLookAtManager,Object,{

    init: function () {
        var defaultAfterLookAtFun = this.defaultEventHandler.afterLookAtFunction;

        //lookat后，但是镜头还没有移动到位
        this.defaultEventHandler.afterLookAtFunction = function (mainNode, node) {
            main.NameplateManager.hideNameplate();
            if (defaultAfterLookAtFun) {
                defaultAfterLookAtFun(mainNode, node);
            }
            main.breadcrumb.setData(mainNode);
        };

        var self = this;
        // 镜头已经完全调整到位
        this.defaultEventHandler.afterLookAtFinishedFunction = function(mainNode, node) {
            // var callback = function() {
                var data = self.sceneManager.getNodeData(mainNode);
                if (!data) return;
                var dataType = self.sceneManager.dataManager.getDataTypeForData(data);
                if (dataType && dataType.getCategoryId()) {
                    var categoryId = dataType.getCategoryId();
                    if (categoryId.indexOf('airConditioning') >= 0) { // 应该通过collector来控制
                        //显示空调数据
                        // var info = "状态: 运行 \n温度: 14℃";
                        // var board = mainNode.acBoard;
                        // if(!board){
                        //     board = it.Util.createTextBillboardForNode(mainNode, info, 'green');
                        //     mainNode.acBoard = board;
                        //     main.sceneManager.getDataBox().add(board);
                        //     setInterval(function () {
                        //         var i = parseInt(Math.random() * 30);
                        //         var info = "状态: " + (i > 18 ? '关闭' : '运行') + " \n温度: " + i + "℃";
                        //         board.setStyle('m.texture.image', it.Util.getTextBillboardContent(info, (i > 18 ? 'red' : 'green')));
                        //     }, 2000);
                        // }
                    } else if (categoryId.indexOf('smoke_sensor') >= 0) {
                        // var ssm = SmokeSensorManager.getInstance();
                        // ssm.showSmokeSensorDialog(data);
                        // 或许可以通过PropertyDialog实现更好。
                    } else if (categoryId.indexOf('headerRack') >= 0) {
                        //显示列头柜信息
                        // var prPanel = new it.PowerRackPanel();
                        // prPanel.show();
                    } else if (categoryId.indexOf('equipment') >= 0) {
                        // main.virtualDeviceManager.showVirtualDeviceNodes(data);
                    } else if (categoryId.indexOf('camera') >= 0) {
                        main.nodeEventHander.showVideoDialog('Camera #: C300-493A  |  Status: OK', data);  
                    }
                    main.NameplateManager.showNameplate(mainNode, data, categoryId);
                }
                self.handleDoorControl(mainNode, node);
            // };
            // self.adjustCamera(mainNode||node,callback);
        };

        var orgLookAtNodeWithOutAnimate = this.defaultEventHandler.lookAtNodeWithOutAnimate;
        this.defaultEventHandler.lookAtNodeWithOutAnimate = function(mainNode) {
            if (!mainNode || !(mainNode instanceof mono.Element)) {
                orgLookAtNodeWithOutAnimate.call(self.defaultEventHandler, mainNode);
                return;
            }
            var data = self.sceneManager.getNodeData(mainNode);
            var category = self.sceneManager.dataManager.getCategoryForData(data);
            if (!category) {
                orgLookAtNodeWithOutAnimate.call(self.defaultEventHandler, mainNode);
                return;
            }
            var cameraId = category.getId();
            var cameraObj = main.cameraSetting&&main.cameraSetting.getCameraByRootId(cameraId);

            var w_p = self.getNodeCenterPosition(mainNode);
            if (!w_p) {
                w_p = new mono.Vec3(0, 0, 0);
            }
            // var camera = self.sceneManager.network3d.getCamera();
            var camera = self.sceneManager.getCurrentCamera();
            var target = new mono.Vec3(cameraObj.target.x, cameraObj.target.y, cameraObj.target.z);
            var position = new mono.Vec3(cameraObj.position.x, cameraObj.position.y, cameraObj.position.z);
            // var rc = it.Util.getNodeCenterPosition(node);
            target.x = target.x + w_p.x;
            target.y = target.y + w_p.y;
            target.z = target.z + w_p.z;
            position.x = position.x + w_p.x;
            position.y = position.y + w_p.y;
            position.z = position.z + w_p.z;
            camera.setPosition(f_position.x, f_position.y, f_position.z);
            camera.lookAt(target.x, target.y, target.z);
        };
        
        var orgGetCameraTargetAndPositionByNode = this.defaultEventHandler.getCameraTargetAndPositionByNode;
        this.defaultEventHandler.getCameraTargetAndPositionByNode = function(node){
            var data = self.sceneManager.getNodeData(node);
            var category = self.sceneManager.dataManager.getCategoryForData(data);
            var cameraObj = null;
            var isAbsolutePos = false;
            if (data && main.cameraSetting.getCameraByRootId(data.getId())) {
                cameraObj = main.cameraSetting.getCameraByRootId(data.getId());
                isAbsolutePos = true;
            }
            if (!cameraObj && category) {
                cameraObj = main.cameraSetting.getCameraByRootId(category.getId());
                isAbsolutePos = false;
            }
            if (cameraObj) {
                var target = new mono.Vec3(cameraObj.target.x, cameraObj.target.y, cameraObj.target.z);
                var position = new mono.Vec3(cameraObj.position.x, cameraObj.position.y, cameraObj.position.z);
                target = node.localToWorld2(target);
                position = node.localToWorld2(position);
                return {target:target,position:position};
            }
            return orgGetCameraTargetAndPositionByNode.call(self.defaultEventHandler,node);
        }

        var orgGetCameraTarAndPosForLookAtNodes = this.defaultEventHandler.getCameraTarAndPosForLookAtNodes;
        this.defaultEventHandler.getCameraTarAndPosForLookAtNodes = function(nodes,angle,offset){
            var focusNode = self.sceneManager.viewManager3d._focusNode;
            var targetAndPos = self.defaultEventHandler.getCameraTargetAndPositionByNode(focusNode);
            if (targetAndPos) {
                return targetAndPos;
            }else{
                return orgGetCameraTarAndPosForLookAtNodes.call(self.defaultEventHandler,nodes,angle,offset);
            }
        }
        
        var orgMoveCameraForLookAtNode = this.defaultEventHandler.moveCameraForLookAtNode;
        this.defaultEventHandler.moveCameraForLookAtNode = function(mainNode, callback, offset) {
            if (!mainNode || !(mainNode instanceof mono.Element)) {
                orgMoveCameraForLookAtNode.call(self.defaultEventHandler, mainNode,callback,offset);
                return;
            }
            if (self.defaultEventHandler.getSavedCameraInfoByNode && self.defaultEventHandler.getSavedCameraInfoByNode(mainNode)) {
                orgMoveCameraForLookAtNode.call(self.defaultEventHandler, mainNode,callback,offset);
                return;
            }
            var data = self.sceneManager.getNodeData(mainNode);
            var category = self.sceneManager.dataManager.getCategoryForData(data);
            if (!category) {
                orgMoveCameraForLookAtNode.call(self.defaultEventHandler, mainNode,callback,offset);
                return;
            }
            var cameraId = category.getId();
            var cameraObj = main.cameraSetting&&main.cameraSetting.getCameraByRootId(cameraId);
            if (!cameraObj) {
                orgMoveCameraForLookAtNode.call(self.defaultEventHandler, mainNode,callback,offset);
                return;
            }
            var camera = main.sceneManager.network3d.getCamera();
            var w_p = this.getNodeCenterPosition(mainNode);
            if (!w_p) {
                w_p = new mono.Vec3(0, 0, 0);
            }
            var target = new mono.Vec3(cameraObj.target.x, cameraObj.target.y, cameraObj.target.z);
            var position = new mono.Vec3(cameraObj.position.x, cameraObj.position.y, cameraObj.position.z);

            target = mainNode.localToWorld2(target);
            position = mainNode.localToWorld2(position);

            if (offset) {
                position.x += offset.x;
                position.y += offset.y;
                position.z += offset.z;
            }
            it.Util.playCameraAnimation(camera, position, target, 1500, callback);
        };
        
        // 这里不重新isDealWith方法，这样的话，看设备时就很容易点击到墙，用opacityValueFunction看设备时点击墙时就会忽略，因为它还是透明
        var oldGetOpacityValueFunction = this.defaultVirtualMaterialFilter.getOpacityValueFunction;
        this.defaultVirtualMaterialFilter.getOpacityValueFunction = function(data) {
            if (main.systemConfig.un_virtual_category && main.systemConfig.un_virtual_category.length > 0) {
                var dataCategory = self.dm.getCategoryForData(data);
                if (dataCategory) {
                    var categoryIds = main.systemConfig.un_virtual_category;
                    for (var i = 0; i < categoryIds.length; i++) {
                        var cId = categoryIds[i];
                        if (cId == dataCategory.getId()) {
                            return 1;
                        }
                    }
                }
                if (oldGetOpacityValueFunction) {
                    return oldGetOpacityValueFunction.call(self.defaultVirtualMaterialFilter, data);
                } else {
                    return null;
                }
            }
        }
      

       // 当不虚化其他的对象时，处理掉挡住的对象，这个功能还没有完成
        /*
        var oldMoveCameraForLookAtNode = this.defaultEventHandler.moveCameraForLookAtNode;
        this.defaultEventHandler.moveCameraForLookAtNode = function(node, callback, offset) {
            //  if (self.defaultEventHandler.getSavedCameraInfoByNode && self.defaultEventHandler.getSavedCameraInfoByNode(node)) {
            //     oldMoveCameraForLookAtNode.call(self.defaultEventHandler, node,callback,offset);
            //     return;
            // }
            var data = self.sceneManager.getNodeData(node);
            var category = self.dm.getCategoryForData(data);
            // var isVirtualOthersWhenLookAt = dataJson.isVirtualOthersWhenLookAt;
            var isVirtualOthersWhenLookAt;
            if (main.systemConfig.is_virtual_others.toString()=='true') {
                isVirtualOthersWhenLookAt=true;
            }else{
                isVirtualOthersWhenLookAt=false;
            }
            var camera = self.sceneManager.network3d.getCamera();
            if (
                // isVirtualOthersWhenLookAt == false || (
                category && (category.getId() == 'room' || category.getId() == 'floor')
                // )
            ) {
                var distance = self.defaultEventHandler.getElementPerfectDistance(node);
                if (distance < 100) {
                    distance = 100;
                }
                var w_p = self.defaultEventHandler.getNodeCenterPosition(node);
                if (!w_p) {
                    w_p = new mono.Vec3(0, 0, 0);
                }
                var target = new mono.Vec3(w_p.x, w_p.y, w_p.z);
                var diff = camera.target.clone().sub(camera.p());
                diff = diff.normalize();
                if (diff.y > -0.5) { // 从lookAt机柜退回来时
                    diff.y = -0.5;
                }
                var f_position = target.clone().sub(diff.multiplyScalar(distance)); //都改成正视
                if (offset) {
                    f_position.x += offset.x;
                    f_position.y += offset.y;
                    f_position.z += offset.z;
                }

                // function callbackWrap() {
                //     if (callback) {
                //         callback();
                //     }
                // };
                // 如果pos和target之间的非lookAtNode对象隐藏掉，注意为wall的情况
                // self.hideShelterNode(f_position,target,node);
                return it.Util.playCameraAnimation(camera, f_position, target, 1500, callback);
            } else if (isVirtualOthersWhenLookAt == false) { // 如果pos和target之间的非lookAtNode对象隐藏掉，注意为wall的情况
                var w_p = self.defaultEventHandler.getNodeCenterPosition(node);
                if (!w_p) {
                    w_p = new mono.Vec3(0, 0, 0);
                }
                var bb = node.getBoundingBox();
                var target = new mono.Vec3(w_p.x, w_p.y, w_p.z);
                var f_position = self.defaultEventHandler.getElementPerfectFrontPosition(node);
                if (offset) {
                    f_position.x += offset.x;
                    f_position.y += offset.y;
                    f_position.z += offset.z;
                }
                self.hideShelterNode(f_position, target, node);
                return it.Util.playCameraAnimation(camera, f_position, target, 1500, callback);
            }
            return oldMoveCameraForLookAtNode.call(self.defaultEventHandler, node, callback, offset);
        }

        */

        
        // if (dataJson.isVirtualOthersWhenLookAt == false) {
        //     this.sceneManager.viewManager3d.defaultMaterialFilter.isVirtualOther = function(data) {
        //         return false;
        //     }
        // }
        var oldisVirtualOther=this.sceneManager.viewManager3d.defaultMaterialFilter.isVirtualOther;
        this.sceneManager.viewManager3d.defaultMaterialFilter.isVirtualOther=function(data){
            // 聚焦虚化场景
            // if (main.systemConfig.is_virtual_others.toString()=='true'){ 
            //     return false;
            // }else{
            //     return oldisVirtualOther.call(self.sceneManager.viewManager3d.defaultMaterialFilter,data);
            // }
            return oldisVirtualOther.call(self.sceneManager.viewManager3d.defaultMaterialFilter,data);
        }
    },

    hideShelterNode: function(cameraPosition, cameraTarget, node) {
        var nodeData = this.sceneManager.getNodeData(node);
        var camera = this.sceneManager.network3d.getCamera();
        var picking = new mono.Picking(cameraPosition.clone(), cameraTarget.clone().sub(cameraPosition.clone()).normalize(), camera.up, null, null, this.sceneManager.network3d);
        var intersects = new mono.List();
        intersects.addAll(this.sceneManager.network3d.dataBox.getNodes());
        // intersects.addAll(this.dataBox.getBillboards());
        // if (intersectAlarmBillboard) {
        //     intersects.addAll(new $List(this.alarmBillboards));
        // }
        var elements = picking.intersectObjects(intersects.toArray(), false, false);

        if (elements && elements.length > 0) {
            for(var i = 0 ; i < elements.length ; i++){
                var element = elements[i].element;
                var eData = this.sceneManager.getNodeData(element);
                var eCategory = this.sceneManager.dataManager.getCategoryForData(eData);
                if (eData != nodeData) {
                    if (eCategory && eCategory.getId() == 'floor') { //是墙的话隐藏其具体的一面就行

                    }else{ // 其他的资产，则全部隐藏  注意：如果看到一个机柜时，又直接点击下一个机柜的情况，这时之前的虚幻不会还原
                        // this.defaultVirtualMaterialFilter.addByDescendant(eData);
                    }
                }
            }
        };
        // return elements;
    },

    showDialog: function (content, title, width, height) {
        title = title || '';
        width = width || 600;
        height = height || 400;
        var div = document.getElementById('dialog');
        if (div) {
            document.body.removeChild(div);
        }
        div = document.createElement('div');
        div.setAttribute('id', 'dialog');

        div.style.display = 'block';
        div.style.position = 'absolute';
        div.style.left = '100px';
        div.style.top = '100px';
        div.style.width = width + 'px';
        div.style.height = height + 'px';
        div.style.background = 'rgba(164,186,223,0.75)';
        div.style['border-radius'] = '5px';
        document.body.appendChild(div);

        var span = document.createElement('span');
        span.style.display = 'block';
        span.style['color'] = 'white';
        span.style['font-size'] = '13px';
        span.style.position = 'absolute';
        span.style.left = '10px';
        span.style.top = '2px';
        span.innerHTML = title;
        div.appendChild(span);

        var img = document.createElement('img');
        img.style.position = 'absolute';
        img.style.right = '4px';
        img.style.top = '4px';
        img.setAttribute('src', './images/close.png');
        img.onclick = function () {
            document.body.removeChild(div);
        };
        div.appendChild(img);
        if (content) {
            content.style.display = 'block';
            content.style.position = 'absolute';
            content.style.left = '3px';
            content.style.top = '24px';
            content.style.width = (width - 6) + 'px';
            content.style.height = (height - 26) + 'px';
            div.appendChild(content);
        }
        return div;
    },

    // showVideoDialog: function (title,data) {
    //     // var video = document.createElement('video');
    //     // video.setAttribute('src', './images/test.mp4');
    //     // video.setAttribute('controls', 'true');
    //     // video.setAttribute('autoplay', 'true');
    //     // video.setAttribute('width', 610);
    //     // video.setAttribute('height', 610);
    //     // var self = this;
    //     // video.oncanplay = function () {
    //     //     self.showDialog(video, title, video.width, video.height);
    //     // }
    //     var videoManager = it.VideoManager.getInstance();
    //     videoManager.initCCTV();
    //     videoManager.playForCamera(data.getId());
    // },

    handleDoorControl: function (mainNode, node) {
        if (mainNode == null) {
            return;
        }
        var sm = this.sceneManager;
        var dm = sm.dataManager;
        var data = sm.getNodeData(mainNode);
        var dataType = dm.getDataTypeForData(data);
        if (!dataType) {
            return;
        }
        // if (dataType && dataType.getModel() != 'twaver.idc.door_control') {
        //     return;
        // }
        if (dataType.getCategoryId() !="doorControl") {
            return;
        }
        
        var table = document.createElement('table');
        $(table).attr('cellspacing', 0);
        table.setAttribute('class', 'gridtable');
        for (var k = 0; k < 8; k++) {
            var tr = document.createElement('tr');
            table.appendChild(tr);
            for (var i = 0; i < 7; i++) {
                var tagName = k == 0 ? 'th' : 'td';
                var td = document.createElement(tagName);
                tr.appendChild(td);
                if (k == 0) {
                    if (i == 0) {
                        td.innerHTML = it.util.i18n("AfterLookAtManager_Card_num");
                    }
                    if (i == 1) {
                        td.innerHTML = it.util.i18n("AfterLookAtManager_Time");
                    }
                    if (i == 2) {
                        td.innerHTML = it.util.i18n("AfterLookAtManager_Area");
                    }
                    if (i == 3) {
                        td.innerHTML = it.util.i18n("AfterLookAtManager_Door");
                    }
                    if (i == 4) {
                        td.innerHTML = it.util.i18n("AfterLookAtManager_Sex");
                    }
                    if (i == 5) {
                        td.innerHTML = it.util.i18n("AfterLookAtManager_ID");
                    }
                    if (i == 6) {
                        td.innerHTML = it.util.i18n("AfterLookAtManager_Description");
                    }
                } else {
                    if (i == 0) {
                        td.innerHTML = parseInt(Math.random() * 1000000);
                    }
                    if (i == 1) {
                        td.innerHTML = it.Util.formatDate(new Date(new Date().getTime() - parseInt(Math.random() * 100000000)), 'yyyy-MM-dd hh:mm:ss');
                    }
                    if (i == 2) {
                        if (Math.random() >= 0.5) {
                            td.innerHTML = it.util.i18n("AfterLookAtManager_Front_area");
                        } else {
                            td.innerHTML = it.util.i18n("AfterLookAtManager_Middle_area");
                        }
                    }
                    if (i == 3) {
                        if (Math.random() >= 0.5) {
                            td.innerHTML = it.util.i18n("AfterLookAtManager_Front_door");
                        } else {
                            td.innerHTML = it.util.i18n("AfterLookAtManager_Back_door");
                        }
                    }
                    if (i == 4) {
                        if (Math.random() >= 0.5) {
                            td.innerHTML = it.util.i18n("AfterLookAtManager_Man");
                        } else {
                            td.innerHTML = it.util.i18n("AfterLookAtManager_Woman");
                        }
                    }
                    if (i == 5) {
                        td.innerHTML = parseInt(Math.random() * 100);
                    }
                    if (i == 6) {
                        td.innerHTML = it.util.i18n("AfterLookAtManager_Maintaince");
                    }

                }
            }
        }

        var $doorControl = $('#doorControl');
        if (!$doorControl.length) {
            $doorControl = $('<div id="doorControl" title="门禁记录"></div>').appendTo($('body'));
        }
        $doorControl.empty();
        // $(table).css({
        //     marginLeft: '10px',
        //     marginTop: '10px'
        // });
        $doorControl.append(table);
        // layer.open({
        //     shade: 0,
        //     type: 1,
        //     title: it.util.i18n("AfterLookAtManager_Entrance_guard"),
        //     // skin: 'layui-layer-rim', //加上边框
        //     // area: ['460px', '300px'], //宽高
        //     offset: ['100px', '100px'],
        //     content: $('#doorControl')
        // });
        $doorControl.dialog({
            blackStyle: true,
            width: 537,
            height: 'auto',
            autoOpen: false,
            show: '',
            hide: '',
            resizable: false,
            position: [100, 100],
            modal: false, //是否有遮罩模型
        });
        $doorControl.dialog('open');
    },

});