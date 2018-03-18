var $RackPreOccupiedManager = function (sceneManager, application) {
    it.VirtualManager.call(this, sceneManager);
    this.sceneManager = sceneManager;
    this.application = application;
    this.dm = this.sceneManager.dataManager;
    this.vm = this.sceneManager.viewManager3d;
    this.network = this.vm.network;
    this.box = this.network.getDataBox();
    this.de = this.vm.defaultEventHandler;
    this.rootView = this.network.getRootView();
    this.init();
};

mono.extend($RackPreOccupiedManager, it.VirtualManager, {

    init: function () {
        var self = this;

        //虚化程度
        this.opacityValue = 0.01;
        //机位高度
        this.height = 1;
        //间隔
        this.padding = 3;

        this.commonColor = '#20aef9';
        this.fillColor = 'white';
        this.hoverColor = '#00f6ff';
        this.parentDom = $('.preoccupied-box');

        this.currentHoverNode = null;
        this.allNewSeats = [];
        this.currentSelectedNodes = [];
        this.popIsOccupied = null;
        this.popPanel = null;

        this.extendField = {
            customerName: {
                id: 'customerName',
                name: it.util.i18n('Rack_Pre_Customer_Name'),
            },
            user: {
                id: 'user',
                name: it.util.i18n('Rack_Pre_Occupier'),
            },
        }

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
        it.util.augment(it.RackPreOccupiedManager, it.dealUserEventHandler);

    },

    // app开启
    show: function (params) {
        // console.log(params);
        var self = this;
        this.appState = true;
        // console.log('预占用on');
        this.vm.addMaterialFilter(this);

        var floorData = this.application.floorData;
        this.floorDataId = floorData._id;
        if (!params.position) {
            params.position = this.floorDataId;
        }
        var children = this.chidren = this.dm.getDescendants(floorData);
        for (var i = 0; i < children.length; i++) {
            var data = children[i];
            this.add(data);
            var categoryId = this.dm.getCategoryForData(data).getId();
            if (categoryId == 'seat') {
                this.allNewSeats.push({
                    data: data,
                    isOccupied: 'false',
                    extend: {},
                })
            }
        }
        this.doSearch(params);
        this.addAllUserEventHandler();
    },

    doSearch: function (params) {
        var self = this;
        var conditions = {
            occupyType: 'seat',
            parentId: this.floorDataId,
        }
        it.util.api('pre_occupied', 'searchAndCount', conditions, function (result) {
            for (var i = 0; i < self.allNewSeats.length; i++) {
                var flag = true;
                var oneSeat = self.allNewSeats[i];
                flag = self.isAncestor(params.position, oneSeat.data._id);
                if (!flag) {
                    self.allNewSeats.splice(i, 1);
                    i--;
                    continue;
                }
                var datas = result.rows; // array
                for (var j = 0; j < datas.length; j++) {
                    if (oneSeat.data._id == datas[j].id) {
                        oneSeat.isOccupied = 'true';
                        oneSeat.extend = datas[j].extend;
                        break;
                    }
                }
                for (var key in params.extend) {
                    var ex = params.extend[key];
                    if (ex) {
                        if (oneSeat.extend[key] != ex) {
                            self.allNewSeats.splice(i, 1);
                            i--;
                            flag = false;
                            break;
                        }
                    }
                }
            }
            if (self.allNewSeats.length == 0) {
                ServerUtil.msg(it.util.i18n('No_Result'));
            }
            // console.time('hehe');
            self.createRackSeatNodes();
            // console.timeEnd('hehe');
        })
    },

    isAncestor: function (oldId, youngId) {
        var youngNode = this.dm.getDataById(youngId);
        if (youngNode && youngNode.getParentId()) {
            if (youngNode.getParentId() == oldId) return true;
            else return this.isAncestor(oldId, youngNode.getParentId())
        } else {
            return false;
        }
    },

    // app关闭
    hide: function () {
        if (this.appState) {
            this.appState = false;
            // console.log('预占用off');
            this.removeRackSeatNodes();
            this.clear();
            this.vm.removeMaterialFilter(this);
            this.removeAllUserEventHandler();
        }
    },

    handleMouseMove: function (e) {
        if (this.appState) {
            var first = this.network.getFirstElementByMouseEvent(e);
            if (first) {
                var element = first.element;
                if (element instanceof mono.Cube) {
                    var newSeatNode = element.getClient('newSeatNode');
                    var isLock = element.getClient('isLock');
                    if (newSeatNode == 'newSeatNode' && isLock == 'false') {
                        if (this.currentHoverNode) {
                            if (this.currentHoverNode == element) {
                                // console.log('继续让他亮，同时return');
                                return;
                            } else {
                                var oldElement = this.currentHoverNode;
                                this.changeRackSeatNodeStyle({
                                    node: oldElement,
                                    isHover: 'false',
                                })
                                this.changeRackSeatNodeStyle({
                                    node: element,
                                    isHover: 'true',
                                })
                                this.currentHoverNode = element;
                                // console.log('鼠标从一个移到另一个');
                                return;
                            }
                        } else {
                            this.changeRackSeatNodeStyle({
                                node: element,
                                isHover: 'true',
                            })
                            this.currentHoverNode = element;
                            // console.log('第一次进入这个node，点亮他');
                            return;
                        }
                    }
                }
            }
            if (this.currentHoverNode) {
                // 鼠标移到了别处，然后取消发光
                this.changeRackSeatNodeStyle({
                    node: this.currentHoverNode,
                    isHover: 'false',
                })
                this.currentHoverNode = null;
                // console.log('鼠标移出');
            }
        }
    },

    handleClick: function (e) {
        // console.log('hehe');
        if (this.appState) {
            var first = this.network.getFirstElementByMouseEvent(e);
            if (first) {
                var element = first.element;
                if (element instanceof mono.Cube) {
                    var newSeatNode = element.getClient('newSeatNode');
                    if (newSeatNode == 'newSeatNode') {
                        var isLock = element.getClient('isLock');
                        if (isLock == 'false') {
                            // console.log('进行选中');
                            this.currentSelectedNodes.push(element);
                            this.changeRackSeatNodeStyle({
                                node: element,
                                isLock: 'true',
                            })
                            this.updataSelected();
                        } else if (isLock == 'true') {
                            // console.log('取消选中');
                            for (var i = 0; i < this.currentSelectedNodes.length; i++) {
                                if (element == this.currentSelectedNodes[i]) {
                                    this.currentSelectedNodes.splice(i, 1);
                                    i--;
                                }
                            }
                            this.changeRackSeatNodeStyle({
                                node: element,
                                isLock: 'false',
                            })
                            this.updataSelected();
                        }
                    }
                }
            }
        }
    },

    // 更新选中的状态
    updataSelected: function () {
        var state;
        if (this.currentSelectedNodes.length == 0) {
            if (this.popPanel) {
                this.popPanel.remove();
                this.popPanel = null;
            }
            this.popIsOccupied = null;
            return;
        }
        for (var i = 0; i < this.currentSelectedNodes.length; i++) {
            var node = this.currentSelectedNodes[i];
            var isOccupied = node.getClient('isOccupied');
            if (state) {
                if (state != isOccupied) {
                    // console.log('conflict');
                    state = 'conflict';
                    break;
                }
            } else {
                state = isOccupied;
            }
        }
        // console.log(state);
        switch (state) {
            case 'false':
                {
                    if (this.popIsOccupied == state) {
                        // console.log('不用变化');
                    } else {
                        // console.log('隐藏之前的面板，生成新的面板');
                        this.popIsOccupied = state;
                        this.updatePop();
                    }
                    break;
                }
            case 'true':
                {
                    if (this.popIsOccupied == state) {
                        // console.log('有变化');
                        // console.log('更新面板');
                        this.updatePop();
                    } else {
                        // console.log('隐藏之前的面板，生成新的面板');
                        this.popIsOccupied = state;
                        this.updatePop();
                    }
                    break;
                }
            case 'conflict':
                {
                    if (this.popIsOccupied == state) {
                        // console.log('不用变化');
                    } else {
                        // console.log('隐藏之前的面板，然后展示新面板');
                        this.popIsOccupied = state;
                        this.updatePop();
                    }
                    break;
                }
        }
    },

    // 更新弹框
    updatePop: function () {
        var self = this;
        var title;

        if (this.popPanel) {
            this.popPanel.remove();
            this.popPanel = null;
        }
        this.popPanel = $('<div>').addClass('new-app-panel').appendTo(this.parentDom);
        if (this.popIsOccupied == 'false') {
            title = it.util.i18n("Rack_Pre_Occupied");
            this.popPanel.PreOccupiedPop({
                tip: '<span class="icon-tips icon iconfont"></span>' + it.util.i18n('Rack_Pre_Tips'),
                extendField: self.extendField,
                doSearchIt: function () {
                    var extend = {};
                    for (var key in self.extendField) {
                        extend[key] = self.popPanel.PreOccupiedPop('getExtendFieldVal', key).trim();
                        if (extend[key] == '') {
                            ServerUtil.msg(self.extendField[key].name + ' ' + it.util.i18n('Device_On_Cannot_Empty'));
                            return;
                        }
                    }
                    self.addOccupied(extend);
                },
                doClearIt: function () {
                    self.closeAllPop();
                },
            });
        } else if (this.popIsOccupied == 'true') {
            title = it.util.i18n("Rack_Cancel_Pre_Occupied");
            var extendes = [];
            for (var i = 0; i < this.currentSelectedNodes.length; i++) {
                var node = this.currentSelectedNodes[i];
                var data = node.getClient('seatData');
                var extend = node.getClient('extend');
                var newExtend = [];
                for (var key in this.extendField) {
                    var obj = {};
                    obj.name = this.extendField[key].name;
                    obj.value = extend[key];
                    newExtend.push(obj);
                }
                extendes.push({
                    id: data._id,
                    extend: newExtend,
                })
            }
            this.popPanel.cancelOccupiedPop({
                tip: '<span class="icon-tips icon iconfont"></span>' + it.util.i18n('Rack_Pre_Tips'),
                extendes: extendes,
                doSearchIt: function () {
                    // console.log('queren');
                    self.removeOccupied();
                },
                doClearIt: function () {
                    self.closeAllPop();
                },
            });
        } else if (this.popIsOccupied == 'conflict') {
            title = it.util.i18n("TempApp_Attention_Level");
            this.popPanel.conflictOccupiedPop({
                doPreIt: function () {
                    self.changeModel('true')
                },
                doCancerIt: function () {
                    self.changeModel('false')
                },
            });
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

    // 关闭所有弹框,同时取消所有node的选中状态
    closeAllPop: function () {
        for (var i = 0; i < this.currentSelectedNodes.length; i++) {
            var node = this.currentSelectedNodes[i];
            this.changeRackSeatNodeStyle({
                node: node,
                isLock: 'false',
            })
        }
        this.currentSelectedNodes = [];
        if (this.popPanel) {
            this.popPanel.remove();
            this.popPanel = null;
        }
        this.popIsOccupied = null;
    },

    // toPreIt，取消选中已占用的node；toCancerIt，取消选中未占用的node
    changeModel: function (param) {
        for (var i = 0; i < this.currentSelectedNodes.length; i++) {
            var node = this.currentSelectedNodes[i];
            var isOccupied = node.getClient('isOccupied');
            if (isOccupied == param) {
                this.changeRackSeatNodeStyle({
                    node: node,
                    isLock: 'false',
                })
                this.currentSelectedNodes.splice(i, 1);
                i--;
            }
        }
        this.updataSelected();
    },

    addOccupied: function (extend) {
        var self = this;
        var data = [];
        for (var i = 0; i < this.currentSelectedNodes.length; i++) {
            var node = this.currentSelectedNodes[i];
            var seatData = node.getClient('seatData');
            data.push({
                id: seatData._id,
                occupyType: 'seat',
                parentId: this.floorDataId,
                extend: extend,
            })
        }
        // 接口这里注意一下，发送ajax请求的时候，需要设置 
        // contentType: 'application/json',
        it.util.api('pre_occupied', 'batchAdd', data, function (result) {
            // console.log(result);
            // console.log('成功');
            for (var i = 0; i < self.currentSelectedNodes.length; i++) {
                var node = self.currentSelectedNodes[i];
                var seatData = node.getClient('seatData');
                var billboard = self.makeExtendBillboard({
                    id: seatData._id,
                    extend: extend,
                    parentNode: node,
                });
                node.setClient('isOccupied', 'true');
                node.setClient('billboard', billboard);
                node.setClient('extend', extend);
            }
            self.closeAllPop();
            // console.log(extend);
            // console.log(self.application.extendField);
            // self.application.appPanel.RackPreOccupiedApp('refreshAll');
            // 更新左侧下拉框
            var isNeedRefresh = true;
            for (var key in self.application.extendField) {
                var arrays = self.application.extendField[key].arrays;
                for (var i = 0; i < arrays.length; i++) {
                    if (arrays[i].value == extend[key]) {
                        isNeedRefresh = false;
                        break;
                    }
                }
                if (isNeedRefresh) {
                    arrays.push({
                        value: extend[key],
                        content: extend[key],
                    })
                } else {
                    // console.log('不需要更新');
                }
            }
            if (isNeedRefresh) {
                // console.log('需要更新');
                // console.log(self.application.extendField);
                self.application.appPanel.RackPreOccupiedApp('option', 'extendField', self.application.extendField);
                self.application.appPanel.RackPreOccupiedApp('updateExtendField');
            }
        }, function (e) {
            // console.log(e);
        })
    },

    removeOccupied: function () {
        var self = this;
        var data = [];
        for (var i = 0; i < this.currentSelectedNodes.length; i++) {
            var node = this.currentSelectedNodes[i];
            var seatData = node.getClient('seatData');
            data.push({
                id: seatData._id,
            })
        }
        it.util.api('pre_occupied', 'batchRemove', data, function () {
            // console.log(data);
            // console.log('成功');
            for (var i = 0; i < self.currentSelectedNodes.length; i++) {
                var node = self.currentSelectedNodes[i];
                var seatData = node.getClient('seatData');
                node.setClient('isOccupied', 'false');
                node.setClient('billboard', null);
            }
            self.closeAllPop();
        }, function (e) {
            // console.log(e);
        })
    },

    removeRackSeatNodes: function () {
        for (var i = 0; i < this.allNewSeats.length; i++) {
            var node = this.allNewSeats[i].node;
            if (node) {
                node.setParent(null);
                this.box.remove(node);
            }
        }

        this.currentHoverNode = null;
        this.allNewSeats = [];
        this.currentSelectedNodes = [];
        this.popIsOccupied = null;
        if (this.popPanel) {
            this.popPanel.remove();
            this.popPanel = null;
        }

    },

    createRackSeatNodes: function () {
        for (var i = 0; i < this.allNewSeats.length; i++) {
            // console.time('createRackSeatNode')
            var node = this.createRackSeatNode({
                    seatData: this.allNewSeats[i].data,
                    isOccupied: this.allNewSeats[i].isOccupied,
                    extend: this.allNewSeats[i].extend,
                })
                // console.timeEnd('createRackSeatNode')
            this.box.add(node);
            this.allNewSeats[i].node = node;
        }
        // console.log(this.allNewSeats);
    },

    createRackSeatNode: function (params) {
        var seatData = params.seatData;
        var isOccupied = params.isOccupied;
        var extend = params.extend;
        var commonColor = this.commonColor;
        var fillColor = this.fillColor;
        var hoverColor = this.hoverColor;
        var seatNode = this.sceneManager.getNodeByDataOrId(seatData);
        var seatPos = seatNode.getPosition();
        var seatRot = seatNode.getRotation();
        var bb = seatNode.getBoundingBox()
            // 机位的高度不够被地板挡住了+10，把机位的大小改小，给相邻机位间加一点距离
        var width = bb.max.x - bb.min.x - this.padding * 2;
        var depth = bb.max.z - bb.min.z - this.padding * 2;
        var height = this.height + 10;

        var topImgObj = {};
        topImgObj.commonCommon = this.createTopImage({
            color: commonColor,
            width: width,
            height: depth,
            fillColor: fillColor,
            isOccupied: false,
        })

        topImgObj.repeat = new mono.Vec2(width / topImgObj.commonCommon.width, depth / topImgObj.commonCommon.height)
        topImgObj.commonOccupied = this.createTopImage({
            color: commonColor,
            width: width,
            height: depth,
            fillColor: fillColor,
            isOccupied: true,
        })
        topImgObj.hoverCommon = this.createTopImage({
            color: hoverColor,
            width: width,
            height: depth,
            fillColor: fillColor,
            isOccupied: false,
        })
        topImgObj.hoverOccupied = this.createTopImage({
            color: hoverColor,
            width: width,
            height: depth,
            fillColor: fillColor,
            isOccupied: true,
        })
        var newSeatNode, topImage;
        if (isOccupied === 'false') {
            topImage = topImgObj.commonCommon;
        } else if (isOccupied == 'true') {
            topImage = topImgObj.commonOccupied;
        }
        newSeatNode = new mono.Cube(width, height, depth);
        newSeatNode.s({
                'm.type': 'basic',
                'm.color': commonColor,
                'top.m.color': fillColor,
                'top.m.texture.image': topImage,
                'top.m.texture.repeat': topImgObj.repeat,
                'top.m.texture.offset': new mono.Vec2(0, 0),
            })
            // console.time('makeExtendBillboard')
        var billboard = this.makeExtendBillboard({
            id: seatData._id,
            extend: extend,
            parentNode: newSeatNode,
        });
        // console.timeEnd('makeExtendBillboard')

        newSeatNode.setParent(seatNode.getParent());
        newSeatNode.setPosition(seatPos);
        newSeatNode.setRotation(seatRot);
        newSeatNode.setClient(it.SceneManager.CLIENT_EXT_VITUAL, true);
        newSeatNode.setClient('newSeatNode', 'newSeatNode');
        newSeatNode.setClient('seatData', seatData);
        newSeatNode.setClient('isOccupied', isOccupied);
        newSeatNode.setClient('billboard', billboard);
        newSeatNode.setClient('extend', extend);
        newSeatNode.setClient('isHover', 'false');
        newSeatNode.setClient('isLock', 'false');
        newSeatNode.setClient('topImgObj', topImgObj);
        return newSeatNode;
    },

    // 一次性把四个状态的top图全部做出来，然后保存着
    createTopImage: function (params) {
        var color = params.color,
            isOccupied = params.isOccupied,
            width = params.width,
            height = params.height,
            fillColor = params.fillColor || 'white';
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.width = mono.Utils.nextPowerOfTwo(width);
        canvas.height = mono.Utils.nextPowerOfTwo(height);
        context.save();
        context.beginPath();
        context.fillStyle = color;
        var borderWidth = 4;
        context.fillRect(0, canvas.height - height, width, height);
        context.fillStyle = fillColor;
        context.fillRect(borderWidth, canvas.height - height + borderWidth, width - borderWidth * 2, height - borderWidth * 2);
        if (isOccupied) {
            var lineWidth = 2;
            var linePadding = 8;
            var allLength = width + height;
            context.lineWidth = lineWidth;
            context.strokeStyle = color;
            for (var i = 0; i < width; i += linePadding) {
                context.save();
                context.beginPath();
                context.moveTo(i, canvas.height - height + borderWidth);
                context.lineTo(allLength + i, canvas.height - height + borderWidth + allLength);
                context.stroke();
                context.closePath();
                context.restore();
            }
            for (var i = linePadding; i < height; i += linePadding) {
                context.save();
                context.beginPath();
                context.moveTo(0, canvas.height - height + borderWidth + i);
                context.lineTo(allLength, canvas.height - height + borderWidth + i + allLength);
                context.stroke();
                context.closePath();
                context.restore();
            }
        }
        context.closePath();
        context.restore();
        return canvas;
    },

    makeExtendBillboard: function (params) {

        var id = params.id
        var extend = params.extend;
        var parentNode = params.parentNode;
        var str = '';
        var billboard = null;
        // if (1) {
        if ($.isEmptyObject(extend)) {
            // console.log('对象为空，未被占用');
            return null;
        } else {
            str += id;
            for (var key in extend) {
                str += '\n' + this.extendField[key].name + '：' + extend[key];
            }
            // console.time('createBillboard')
            billboard = it.util.makeTextBillboardWithArrow.createBillboard({
                    position: [0, 30, 0],
                    scale: [0.001, 0.001],
                    parentNode: parentNode,
                    text: str,
                })
                // console.timeEnd('createBillboard')

            billboard.s({
                'm.fixedSize': 20,
                'm.alignment': new mono.Vec2(-0.25, 0.5),
            })
            billboard.setClient(it.SceneManager.CLIENT_EXT_VITUAL, true);

            return billboard;
        }
    },

    changeRackSeatNodeStyle: function (params) {
        var node = params.node;
        var isLock = params.isLock || node.getClient('isLock');
        var isHover = params.isHover || node.getClient('isHover');
        var isOccupied = params.isOccupied || node.getClient('isOccupied');
        var fillColor = this.fillColor;
        var topImgObj = node.getClient('topImgObj');
        var color, topImage;
        if (isHover == 'false' && isLock == 'false') {
            color = this.commonColor;
            if (isOccupied == 'false') {
                topImage = topImgObj.commonCommon;
            } else if (isOccupied == 'true') {
                topImage = topImgObj.commonOccupied;
            }
        } else if (isHover == 'true' || isLock == 'true') {
            color = this.hoverColor;
            if (isOccupied == 'false') {
                topImage = topImgObj.hoverCommon;
            } else if (isOccupied == 'true') {
                topImage = topImgObj.hoverOccupied;
            }
        }
        // 不清除的话，会造成颜色叠加，产生意想不到的效果
        node.s({
            'm.color': null,
            'top.m.color': null,
            'top.m.texture.image': null,
        })
        node.s({
            'm.color': color,
            'top.m.color': fillColor,
            'top.m.texture.image': topImage,
        })
        node.setClient('isOccupied', isOccupied);
        node.setClient('isHover', isHover);
        node.setClient('isLock', isLock);

        var billboard = node.getClient('billboard');
        if (billboard) {
            if (isHover == 'true' && isOccupied == 'true') {
                billboard.setParent(node);
                this.box.add(billboard);
            } else {
                billboard.setParent(null);
                this.box.remove(billboard);
            }
        }
    },
});

it.RackPreOccupiedManager = $RackPreOccupiedManager;


$.widget("hub.PreOccupiedPopBase", {

    _create: function () {

    },

    _makeDefaultOption: function (options) {
        var defaultOption = {
            placeholder: '',
            text: '',
            inputText: '',
        }
        options = $.extend({}, defaultOption, options);
        return options;
    },

    createTextInputLine: function (options, parent) {
        options = this._makeDefaultOption(options);
        var line = $('<div>').addClass('app-text-input-line app-line');
        var text = $('<div>').text(options.text).addClass(options.class + ' text');
        var inputDiv = $('<div>').addClass(options.class + ' input');
        var input = $('<input placeholder="' + options.placeholder + '">').val(options.inputText).appendTo(inputDiv);
        line.append(text);
        line.append(inputDiv);
        if (!parent) {
            parent = this.element;
        }
        parent.append(line);
        return input;
    },

    createText: function (option, parent) {
        var line = $('<div>').addClass('app-text-line app-line').text(option.text);
        if (!parent) {
            parent = this.element;
        }
        parent.append(line);
        return line;
    },

    createTableBlock: function (options, parent) {
        var line = $('<div>').addClass('app-table-block  app-line');
        var span = $('<span>').text(options.id).addClass('app-title').appendTo(line);
        var table = $('<table>').addClass('app-table').appendTo(line);
        for (var i = 0; i < options.extend.length; i++) {
            var ex = options.extend[i];
            var tableLine = $('<tr>').addClass('app-table-tr').appendTo(table);
            var tableKey = $('<td>').addClass('app-table-key').text(ex.name + '：').appendTo(tableLine);
            var tableValue = $('<td>').addClass('app-table-value').text(ex.value).appendTo(tableLine);
        }
        if (!parent) {
            parent = this.element;
        }
        parent.append(line);
        return line;
    },

    createButtonsWithTips: function (options, parent) {
        var option;
        if (!options) {
            options = {};
        }
        if (!options.option) {
            option = [{
                class: 'clear-it active',
                text: it.util.i18n('AlertUtil_Cancel'),
            }, {
                class: 'search-it active',
                text: it.util.i18n('AlertUtil_Confirm'),
            }, ];
        } else {
            option = options.option;
        }
        var line = $('<div>').addClass('app-btn-line');
        var tip = $('<div>').addClass('app-tip').appendTo(line).html(options.tip);
        var group = $('<div>').addClass('app-btn-group').appendTo(line);
        for (var i = 0; i < option.length; i++) {
            var div = $('<div>').addClass(option[i].class).text(option[i].text);
            group.append(div);
        }
        if (!parent) {
            parent = this.element;
        }
        parent.append(line);
        var self = this;
        this._on(group, {
            'click .search-it': function (e) {
                self._trigger('doSearchIt', e);
            },
            'click .clear-it': function (e) {
                self._trigger('doClearIt', e);
            },
        })
        return group;
    },

    createBigButtons: function (options, parent) {
        var option;
        if (!options) {
            options = {};
        }
        if (!options.option) {
            option = [{
                class: 'pre-it active',
                text: it.util.i18n("Rack_Pre_Occupied"),
            }, {
                class: 'cancer-it active',
                text: it.util.i18n("Rack_Cancel_Pre_Occupied"),
            }, ];
        } else {
            option = options.option;
        }
        var group = $('<div>').addClass('app-big-btn-group');
        for (var i = 0; i < option.length; i++) {
            var div = $('<div>').addClass(option[i].class + ' bigBtn').text(option[i].text);
            group.append(div);
        }
        if (!parent) {
            parent = this.element;
        }
        parent.append(group);
        var self = this;
        this._on(group, {
            'click .pre-it.active': function (e) {
                self._trigger('doPreIt', e);
            },
            'click .cancer-it.active': function (e) {
                self._trigger('doCancerIt', e);
            },
        })
        return group;
    },

})

$.widget("hub.PreOccupiedPop", $.hub.PreOccupiedPopBase, {

    options: {
        extendField: {},
        tip: '<span class="icon-tips icon iconfont"></span>机位可多选',
        doSearchIt: console.log,
        doClearIt: console.log,
    },

    _create: function () {
        this.element.addClass('PreOccupiedPop');
        this.extends = {};
        for (var key in this.options.extendField) {
            var line = this.createTextInputLine({
                class: 'PreOccupiedPop-' + key,
                text: this.options.extendField[key].name + ':',
            })
            this.extends[key] = line;
        }
        this.btns = this.createButtonsWithTips({
            tip: this.options.tip,
        });
    },

    getExtendFieldVal: function (id) {
        return this.extends[id].val();
    },

})

$.widget("hub.cancelOccupiedPop", $.hub.PreOccupiedPopBase, {

    options: {
        extendes: [],
        tip: '<span class="icon-tips icon iconfont"></span>机位可多选！',
        doSearchIt: console.log,
        doClearIt: console.log,
    },

    _create: function () {
        this.element.addClass('cancelOccupiedPop');
        var scrollDiv = $('<div>').addClass('bt-scroll').appendTo(this.element);
        for (var i = 0; i < this.options.extendes.length; i++) {
            this.createTableBlock(this.options.extendes[i], scrollDiv);
        }
        this.btns = this.createButtonsWithTips({
            tip: this.options.tip,
        });
    },

})

$.widget("hub.conflictOccupiedPop", $.hub.PreOccupiedPopBase, {

    options: {
        doPreIt: console.log,
        doCancerIt: console.log,
    },

    _create: function () {
        this.element.addClass('conflictOccupiedPop');
        this.prompt = this.createText({
            class: 'RackPreOccupiedPop-Prompt',
            text: it.util.i18n("Rack_Conflict_Occupied_Pop_1"),
        })
        this.choose = this.createText({
            class: 'RackPreOccupiedPop-Choose',
            text: it.util.i18n("Rack_Conflict_Occupied_Pop_2"),
        })
        this.btns = this.createBigButtons();
    },

})