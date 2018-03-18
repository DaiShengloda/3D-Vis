it.DeviceOff = function (sceneManager, application) {
    if (!sceneManager) {
        console.log('sceneManager can not be null!');
        return;
    }
    this.sceneManager = sceneManager;
    this.dataManager = this.sceneManager.dataManager;
    this.defaultEventHandler = sceneManager.viewManager3d.getDefaultEventHandler();
    this.network = this.sceneManager.network3d;
    this.box3D = this.network.getDataBox();
    this.camera = this.network.getCamera();
    this.application = application;
    this.appStates = false;
    this.appInit();
};

mono.extend(it.DeviceOff, Object, {

    appInit: function () {

    },

    appStart: function () {
        this.appStates = true;
        this.addMyEvent();
    },

    appEnd: function () {
        this.removeMyEvent();
        this.removeOffBtn();
        this.appStates = false;
        this.timer = null;
    },

    addMyEvent: function () {
        var self = this;
        if (this.addMyEventState) {
            console.log('已经把事件修改了，不应该再添加一次的');
        } else {
            this.oldShouldHandleClickElement = this.defaultEventHandler.shouldHandleClickElement;
            this.defaultEventHandler.shouldHandleClickElement = function (element, network, data, clickedObj) {
                if (self.appStates) {
                    return true;
                }
                return self.oldShouldHandleClickElement.call(self.defaultEventHandler, element, network, data, clickedObj);
            }

            this.oldHandleClickElement = this.defaultEventHandler.handleClickElement;
            this.defaultEventHandler.handleClickElement = function (element, network, data, clickedObj) {
                if (self.appStates) {
                    if (self.dataManager.getCategoryForData(data).getId() == 'equipment' && self.sceneManager.getNodeData(element)) {
                        if (self.timer) {
                            clearTimeout(self.timer);
                            self.timer = null;
                        } else {
                            self.timer = setTimeout(function () {
                                if (self.appStates) {
                                    self.createOffBtn(element);
                                }
                                self.timer = null;
                            }, 100)
                        }
                    } else {
                        self.removeOffBtn();
                    }
                }
                self.oldHandleClickElement.call(self.defaultEventHandler, element, network, data, clickedObj);
            }

            this.oldShouldHandleClickBackground = this.defaultEventHandler.shouldHandleClickBackground;
            this.defaultEventHandler.shouldHandleClickBackground = function (element, network, data, clickedObj) {
                if (self.appStates) {
                    return true;
                }
                return self.oldShouldHandleClickElement.call(self.defaultEventHandler, element, network, data, clickedObj);
            }

            this.oldHandleClickBackground = this.defaultEventHandler.handleClickBackground;
            this.defaultEventHandler.handleClickBackground = function (network) {
                if (self.appStates) {
                    self.removeOffBtn()
                }
                self.oldHandleClickBackground.call(self.defaultEventHandler, network);
            }
            
            this.addMyEventState = true;
        }
    },

    removeMyEvent: function () {
        if (this.addMyEventState) {

            this.defaultEventHandler.shouldHandleClickElement = this.oldShouldHandleClickElement;
            this.oldShouldHandleClickElement = null;

            this.defaultEventHandler.handleClickElement = this.oldHandleClickElement;
            this.oldHandleClickElement = null;

            this.defaultEventHandler.shouldHandleClickBackground = this.oldShouldHandleClickBackground;
            this.oldShouldHandleClickBackground = null;

            this.defaultEventHandler.handleClickBackground = this.oldHandleClickBackground;
            this.oldHandleClickBackground = null;

            this.addMyEventState = false;
        }
    },

    createOffBtn: function (element) {
        var self = this;
        if (!this.appStates) {
            return;
        }
        if (this.element) {
            this.removeOffBtn();
        }
        // console.log('createOffBtn');
        this.element = element;
        this.offBtn = $('<div>').text(it.util.i18n('Device_Off_Device_Off')).addClass('btn-default').appendTo($('.deviceBtn'));
        this.offBtn.on('click', function () {
            self.makeOffPop();
        })
        this.updataOffBtnPosition();
        this.camera.addPropertyChangeListener(this.updataOffBtnPosition, this);
    },

    removeOffBtn: function () {
        // console.log('removeOffBtn');
        this.offBtn && this.offBtn.remove();
        this.offBtn = null;
        this.element = null;
        this.camera.removePropertyChangeListener(this.updataOffBtnPosition, this);
    },

    updataOffBtnPosition: function () {
        if (this.element && this.offBtn) {
            var nodeSize = this.element.getBoundingBox().size();
            var nodePosition = this.element.getPosition();
            var worldPosition = this.element.worldPosition(new mono.Vec3(nodeSize.x * 3 / 4, 0, nodeSize.z / 2), nodeSize.x * 3 / 4);
            var position2d = this.network.getViewPosition(worldPosition);
            // console.log(this.offBtn.height()); 
            this.offBtn.css({
                'left': position2d.x,
                'top': position2d.y - this.offBtn.height(),
            })
        }
    },

    makeOffPop: function () {
        var self = this;
        if (this.element) {
            layer.open({
                type: 1,
                title: it.util.i18n('Device_Off_Confirm_Device_Off'),
                closeBtn: 0,
                shadeClose: true,
                content: self.getDeviceOffMsg(),
                btn: [it.util.i18n('AlertUtil_Confirm'), it.util.i18n('AlertUtil_Cancel')],
                area: '300px',
                yes: function (index, layero) {
                    layer.closeAll();
                    self.doDeviceOff();
                },
                btn2: function (index, layero) {
                    layer.closeAll();
                }
            })
        }
    },

    getDeviceOffMsg: function () {
        var msg = '';

        var data = this.sceneManager.getNodeData(this.element);
        var id = data._id;
        msg += '<p>' + it.util.i18n("DeviceOff_Device_ID") + '：' + id + '</p>';
        var name = data._name;
        msg += '<p>' + it.util.i18n('DeviceOff_Device_Name') + '：' + name + '</p>';

        var datatype = this.dataManager.getDataTypeForData(data);
        var datatypeName = datatype._description;
        msg += '<p>' + it.util.i18n('DeviceOff_Device_model') + '：' + datatypeName + '</p>';

        var uNum = datatype._size.ySize;
        msg += '<p>' + it.util.i18n('Device_Off_Count_U') + '：' + uNum + 'U</p>';

        return msg;
    },

    doDeviceOff: function () {
        var self = this;
        if (this.element) {
            var element = this.element;
            this.removeOffBtn();
            main.BillboardManager.DeviceLabel.deleteLabel();
            var data = self.sceneManager.getNodeData(element);
            var size = element.getBoundingBox().size();
            var position = element.getPosition();
            var extend = data.getExtend();
            var dir = '';
            if(extend) {
                dir = data.getExtend().dir;
            }
            var d = size.z;
            var startZ = position.z;
            if(dir == 'back'){
                d = -size.z;
                startZ = position.z;
            }
            var animate = new twaver.Animate({
                from: 0,
                to: d,
                delay: 0,
                dur: 2000,
                onUpdate: function (value) {
                    element.setPositionZ(startZ + value);
                },
                onDone: function () {
                    var id = data._id;
                    var params = {
                        id: id
                    };
                    //删除设备
                    ServerUtil.api('data', 'remove', params, function (result) {
                        // console.log(result);
                        var devicedata = main.sceneManager.dataManager.getDataById(data.id);
                        main.sceneManager.dataManager.removeData(devicedata);
                        main.sceneManager.removeDataNodeByDataOrId(data.id);
                        ServerUtil.msgWithIcon(it.util.i18n("DeviceOff_Suucess_off"), 6);

                        setTimeout(function () {
                            self.application.doSearchIt();
                        }, 100)

                    }, function (error) {
                        ServerUtil.msgWithIcon(error.message, 5);
                    });
                }
            });
            animate.play();
        }
    },

    clickTreeNodeHandle: function (treeData) {
        var self = this;
        var id = treeData.id;
        if (!id) return;
        var data = this.sceneManager.dataManager.getDataById(id);
        var treeView = this.application.appPanel.NewDeviceOffApp('getTreeView');
        if (!data || !treeView.isClick(data)) return;
        var assetNode = this.sceneManager.dataNodeMap[id];
        // var nodeData = this.sceneManager.getNodeData(assetNode);
        // if(!this.sceneManager.isCurrentSceneInstance(data)){ //如果一下子跳到其他的场景的某个非根对象
        //     var sceneAndRootData = this.sceneManager.getSceneAndRootByData(data);
        //     if(sceneAndRootData){
        //         this.sceneManager.gotoScene(sceneAndRootData.scene,sceneAndRootData.rootData);
        //         //如果是整个楼层的话，就不需这么lookAt了(严格意义上说是Data本身就在场景的root就不需再去设置镜头了)
        //         if(sceneAndRootData.rootData != data){
        //             assetNode = this.sceneManager.dataNodeMap[id];
        //             if(!assetNode){
        //                 this.sceneManager.loadLazyData(data);
        //             }
        //         }else{
        //             assetNode = null;
        //         }
        //     }
        // }
        //注意以下两种情况：
        //1、还没有创建，如lazyable的设备，只有在focus该机柜时，它的孩子设备才会被创建(第一次)并加到box中
        //2、有可能就是存在该场景中，只是不在box中而已，如：lazyable模式下，设备都被移除掉了
        if (!assetNode) {
            this.sceneManager.loadLazyData(data);
            assetNode = this.sceneManager.dataNodeMap[id];
        }
        if (!assetNode) {
            return;
        }
        var assetData = this.sceneManager.getNodeData(assetNode);
        var category = main.sceneManager.dataManager.getCategoryForData(assetData);
        var categoryId = category ? category.getId().toLowerCase().trim() : '';
        //如果category是rack就lookAt 如果是equipment就是把id设置给input
        if (categoryId === 'rack') {
            var box3d = this.sceneManager.network3d.getDataBox();
            if (!assetNode || !box3d.getDataById(assetNode.getId())) {
                this.sceneManager.loadLazyData(data);
                if (!assetNode) {
                    assetNode = this.sceneManager.dataNodeMap[data.getId()];
                }
            }
            if (assetNode) {
                this.defaultEventHandler.lookAt(assetNode);
            }
        } else if (categoryId === 'equipment') {
            // lookAt设备的父亲（机柜）
            var rackNode = this.sceneManager.getNodeByDataOrId(assetData.getParentId());
            var callback = function () {
                self.createOffBtn(assetNode);
                main.BillboardManager.DeviceLabel.makeLabel(assetNode);
            }
            if (rackNode) {
                this.defaultEventHandler.lookAt(rackNode, callback);
            }
        }
    },


});