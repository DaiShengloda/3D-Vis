make.modelPath = '../theme/models/';
$(function () {

    //key 通道编号, value是机柜数组
    var channelRackMap = window.channelRackMap = {}

    //key 机柜编号, value是设备数组
    var rackDevice = window.rackDevice = {};

    it.util.setLanguage('zh');
    //指定make路径
    make.Default.path = '../modellib/';

    //解决jquery ui和bootstrap冲突
    bootstrapButton = $.fn.button.noConflict();
    $.fn.bootstrapBtn = bootstrapButton;


    var keyMap = {
        'LOCKROOM': 76,                  //锁住机房按住L键
        'DELETENODE': 46,               //删除网元delete键
        'UNDO': 90,                     //ctrl+z撤销键
        'TRANSLATE': 32,                     //网元旋转按住空格键
        'ALT': 18
    }

    //取得显示编辑器的容器jquery对象
    var parentView = $('.main');

    //实例化doodle.SceneEditor
    var sceneEditor = window.sceneEditor = new doodle.SceneEditor(parentView);

    sceneEditor.setUndoManagerEnabled(true);

    sceneEditor.setPositionMagneticEnabled(true);

    sceneEditor.edit2d.network2d.setMinZoom(0.01);

    sceneEditor.pasteFilter = function (item) {
        item.client.persistence = false;
        item.client.bid = null;
        return item;
    }

    sceneEditor.flowAndCopyFilter = function (item) {
        item.client.persistence = false;
        return item;
    }

    var defaultInteractions = sceneEditor.network2d.getInteractions();

    /* 每次拖拽初始化画布默认事件 */
    sceneEditor.accordionPane.ondrag = function (e, item) {
        sceneEditor.network2d.setInteractions(defaultInteractions);
    }

    sceneEditor.network2d.afterRefreshNetwork3d = function () {
        sceneEditor.network2d.zoomOverview();
    }


    //是否锁定楼层和机房不能移动,按下L键锁定
    var moveFloorAndRoomLock = false;
    parentView.on('keydown', function (e) {
        // console.log(e.keyCode);
        if (e.keyCode == keyMap['LOCKROOM']) {
            moveFloorAndRoomLock = true;
        } else if (e.keyCode == keyMap['DELETENODE']) {

            layer.confirm(it.util.i18n("Admin_sceneEditor_Confirm_delete") + '?', {
                icon: 2
            }, function (index) {
                var data = sceneEditor.getSelectedData();
                if (data && data.length > 0) {

                    var delData = [];
                    var delDataType = [];
                    data.forEach(function (item) {
                        if (item.client.persistence) {
                            delData.push({
                                id: item.client.bid
                            });
                            //FIXME 如果是机房或者楼层,可能还需要将dataType删除
                            //if(item.client.id == item.client.bid){
                            //    delDataType.push({id: item.client.bid})
                            //}
                        }
                    })
                    it.util.adminApi('data', 'batchRemove', delData, function () {
                        sceneEditor.removeData(data);
                        var node = sceneEditor.getSelectedNode();
                        sceneEditor.removeNode(node);
                    })
                } else {
                    var node = sceneEditor.getSelectedNode();
                    sceneEditor.removeNode(node);
                }
                layer.close(index);
            })
        }
    })
    $(document).on('keyup', function (e) {
        //console.log(e.keyCode);
        if (e.keyCode == keyMap['LOCKROOM']) {
            moveFloorAndRoomLock = false;
        }
        if (e.keyCode == keyMap['UNDO']) {
            sceneEditor.undo();
        }
        if (e.keyCode == keyMap['ALT']) {
            sceneEditor.network2d.superCopy = false;
        }
    })

    $(parentView).on('keydown', function (e) {
        //console.log(e, e.keyCode);
        if (e.keyCode == keyMap['TRANSLATE']) { //空格 旋转
            var node = sceneEditor.box.getSelectionModel().getLastData();
            if (!node) {
                return;
            }
            var angle = node.getAngle();
            node.setAngle(angle + 90);
        }
    });

    doodle.utils.isMoveModel = function (ele) {

        var id = ele.getClient('id');
        var id3d = doodle.utils.getSceneEditorModel3dId(id);
        var tt = make.Default.getType(id);
        if (moveFloorAndRoomLock) {
            if (it.util.dataTypeMap[id3d] && it.util.dataTypeMap[id3d].categoryId == 'floor') {
                return false;
            } else if (make.Default.getOtherParameter(id3d, 'sdkCategory') == 'floor') {
                return false;
            } else if (it.util.dataTypeMap[id3d] && it.util.dataTypeMap[id3d].categoryId == 'room') {
                return false;
            } else if (make.Default.getOtherParameter(id3d, 'sdkCategory') == 'room') {
                return false;
            }
        }
        return true;
    }

    sceneEditor.doubleClickHandler3D = function (element, box) {
        if (!element || element.getClient('type') != 'rack') {
            return;
        }
        if (element.isLoadServer) {
            return;
        }
        element.isLoadServer = true;
        var objectId = element.getId();

        it.util.adminApi('data', 'search', {
            where: {
                parentId: objectId
            }
        }, function (data) {

            var nodes = data.map(function (item) {
                return {
                    id: it.util.dataTypeMap[item.dataTypeId].model,
                    objectId: item.id,
                    client: {
                        loc: item.location.y,
                    }
                };
            });
            doodle.utils.loadDeviceData(box, element, nodes);
        })
    }

    sceneEditor.doubleClickHandler2D = function (element, box) {
        if (!element) return;
        var type = make.Default.getType(element.getClient('id'))
        if ('rack' == element.getClient('type') && element.getClient('persistence') && doodle.consts.REDIRECT_RACK_EDITOR) {
            //打开新的界面
            var objectId = element.getId();
            var id = element.getClient('id');
            window.open('/rackEditor.html?objectId=' + objectId + '&modelClass=' + id);
            return;
        } else if (type == 'channel' && !element.getClient('isPhysicalPosition')) {
            //FIXME 进入通道编辑模式
            openChannelEditorDialog(element);
        }
    }

    /**
     * 如果是机房,显示机房的标签信息.
     * 默认显示后台的dataId, 新建的或这粘贴的显示类型
     * @param data
     * @returns {*}
     */
    sceneEditor.edit2d.network2d.getLabel = function (data) {

        var label = data.getClient("bid");
        var id = data.getClient('id');
        var c = null;

        if (it.util.dataTypeMap[id]) {
            c = it.util.dataTypeMap[id].categoryId;
        }
        if (!label || label.trim().length == 0 || c == it.util.CATEGORY.ROOM) {
            label = data.getClient("label");
        }
        return label;
    }

    //通道属性变更的一些提示处理
    // sceneEditor.edit2d.sheet.getDataBox().addDataPropertyChangeListener(function (e) {
    //     var property = e.property.split(':');
    //     if (property[0] == 'rackNumber') {
    //         var elem = e.source;
    //         var racks = channelRackMap[elem._id];
    //         if (racks && (racks && racks.length != 0)) {
    //             layer.msg('更改机柜数量请先删除该通道下的机柜!', { icon: 2 })
    //         }
    //     }
    // });

    // var tools = null;
    // it.util.adminApi('tool', 'search', {}, function (result) {
    //     tools = result;
    //     tools.forEach(function (item) {
    //         item.label = item.description;
    //         item.icon = make.Default.getIcon(doodle.utils.getSceneEditorModel2dId(item.id));
    //     })
    //     sceneEditor.refreshAccordion();
    // })
    var toolData = new doodle.AccordionData();
    toolData.filterCategory = function (c) {

        return c == '房间模型';
    }
    toolData.filterModel = function (m) {
        if (m === 'twaver.idc.roof') return false;
    }
    var tools = toolData.getData()[0];
    // tools.title = it.util.i18n("Admin_sceneEditor_Create");
    //外墙 内墙 door window 柱子 通道 漏水绳 机房


    var hideCategories = ['building', 'card', 'datacenter', 'earth', 'equipment', 'link', 'port', 'floor'];            //room暂时屏蔽掉，这里可以通过区域打点生成
    doodle.utils.load2dSceneCategory = function () {
        var accData = new doodle.AccordionData();

        accData.filterModel = function (m) {

            var acc = !!make.Default.getOtherParameter(m, 'acc');
            return acc;
        }
        var data = accData.getData();
        if (tools) {
            tools.title = it.util.i18n("Admin_sceneEditor_Create");
            data.unshift(tools);
        }
        return data;
    }

    refreshDataTypes();

    function refreshDataTypes(callback) {
        it.util.loadCategories(function () {
            it.util.loadDataTypes(function () {
                it.util.dataTypeIterator(function (key, item) {

                    if (hideCategories.indexOf(item.categoryId) == -1 && item.model && item.model.trim().length > 0) {
                        var category = it.util.categoryMap[item.categoryId];
                        var oldId2d = doodle.utils.getSceneEditorModel2dId(item.model);
                        var oldId3d = doodle.utils.getSceneEditorModel3dId(item.model);
                        var newId2d = doodle.utils.getSceneEditorModel2dId(key);
                        var newId3d = doodle.utils.getSceneEditorModel3dId(key);
                        var categoryLabel = category.description || category.id;
                        categoryLabel = categoryLabel.replace('/', '_');

                        var icon = make.Default.getIcon(oldId3d) || make.Default.getIcon(oldId2d);

                        if (!make.Default.getCreator(oldId2d)) {
                            console.warn('unknown id', key, item);
                            return;
                        }

                        if (item.categoryId == 'floor') {
                            if (item.modelParameters) {
                                delete item.modelParameters['objectId'];
                                delete item.modelParameters['position'];
                            }
                            make.Default.copy(newId2d, 'twaver.combo', {
                                data: item.modelParameters
                            }, {
                                    sdk: true,
                                    acc: true,
                                    category: categoryLabel,
                                    name: item.description,
                                    icon: icon
                                });
                            make.Default.copy(newId3d, 'twaver.combo', {
                                data: item.modelParameters
                            }, {
                                    sdk: true,
                                    category: categoryLabel
                                });
                        } else {

                            var data = {
                                client: {}
                            };
                            var name = item.description;
                            if (!name || name.trim().length == 0) {
                                name = item.id;
                            }
                            if (item.modelParameters instanceof Array) {
                                delete item.modelParameters[0]['objectId'];
                                delete item.modelParameters['position'];
                            } else if (item.modelParameters) {
                                delete item.modelParameters['objectId'];
                                delete item.modelParameters['position'];
                            }

                            var options = {};
                            if (item.categoryId == 'channel') {
                                options.defaultValue = item.modelParameters;
                            }

                            make.Default.copyProperties(item.modelParameters, data);
                            make.Default.copyProperties(item.modelParameters, data.client);
                            make.Default.copy(newId2d, oldId2d, data, {
                                sdk: true,
                                acc: true,
                                category: categoryLabel,
                                name: name,
                                icon: icon,
                                modelDefaultParameters: {
                                    persistence: {
                                        value: false,
                                        type: make.Default.PARAMETER_TYPE_BOOLEAN,
                                        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
                                        hidden: true,
                                    },
                                    objectId: {
                                        hidden: true,
                                    },
                                    bid: {
                                        name: "ID",
                                        type: make.Default.PARAMETER_TYPE_STRING,
                                        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
                                        editable: false,
                                    },
                                    width: {
                                        name: it.util.i18n("Admin_sceneEditor_Width"),
                                        type: make.Default.PARAMETER_TYPE_NUMBER,
                                        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
                                        editable: false,
                                    },
                                    height: {
                                        name: it.util.i18n("Admin_sceneEditor_Depth"),
                                        type: make.Default.PARAMETER_TYPE_NUMBER,
                                        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
                                        editable: false,
                                    },
                                    parentId: {
                                        type: make.Default.PARAMETER_TYPE_STRING,
                                        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
                                        editable: false,
                                        hidden: true,
                                    },
                                    oldPrentId: {
                                        type: make.Default.PARAMETER_TYPE_STRING,
                                        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
                                        editable: false,
                                        hidden: true,
                                    },
                                    oldPosition: {
                                        type: make.Default.PARAMETER_TYPE_STRING,
                                        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
                                        editable: false,
                                        hidden: true,
                                    },
                                    oldRotation: {
                                        type: make.Default.PARAMETER_TYPE_STRING,
                                        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
                                        editable: false,
                                        hidden: true,
                                    }
                                }
                            }, options);
                            make.Default.copy(newId3d, oldId3d, data, {
                                sdk: true,
                                category: categoryLabel,
                                modelDefaultParameters: {
                                    persistence: {
                                        value: false,
                                        type: make.Default.PARAMETER_TYPE_BOOLEAN,
                                        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
                                        hidden: true,
                                    },
                                    objectId: {
                                        hidden: true,
                                    },
                                    bid: {
                                        type: make.Default.PARAMETER_TYPE_STRING,
                                        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
                                        editable: false,
                                    },
                                    width: {
                                        type: make.Default.PARAMETER_TYPE_NUMBER,
                                        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
                                        editable: false,
                                    },
                                    height: {
                                        type: make.Default.PARAMETER_TYPE_NUMBER,
                                        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
                                        editable: false,
                                    },
                                    parentId: {
                                        type: make.Default.PARAMETER_TYPE_STRING,
                                        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
                                        editable: false,
                                        hidden: true,
                                    },
                                }
                            }, options);
                        }

                    }
                })
                sceneEditor.refreshAccordion();
                queryFloor(function () {
                    //默认加载dxf
                    //doodle.utils.loadFile('dxf.dxf', function (text) {
                    //    _floorData = null;
                    //    sceneEditor.clear();
                    //    sceneEditor.loadDxfFile(text);
                    //    setTimeout(function () {
                    //        resetChannelRack();
                    //    }, 550);
                    //});

                    //默认加载一个
                    //_floorData = floorArray[1];
                    //openScene(_floorData);
                    callback && callback();
                });
            })
        })
    }

    // sceneEditor.refreshAccordion();
    

    $('#filter-menu').on('click', function (e) {
        openFilterMenuPanel();
    });

    //鼠标模式
    $('#mouseModel').on('click', '.pan', function (e) {

        //sceneEditor.network2d.setDragToPan(true);
        canDragToPan(true);
    });
    $('#mouseModel').on('click', '.select', function (e) {

        //sceneEditor.network2d.setDragToPan(false);
        canDragToPan(false);
    });


    function canDragToPan(flag) {
        sceneEditor.network2d.setDragToPan(flag);
        sceneEditor.network2d.getElementBox().getSelectionModel().setFilterFunction(function (element) {
            if (!flag && (element.getClient('type') == 'wall' || element.getClient('type') == 'area')) { //拖拽模式过滤掉地板和区域
                return false;
            }
            return true;
        })
        sceneEditor.network2d.setMovableFunction(function (element) {
            if (!flag && (element.getClient('type') == 'wall' || element.getClient('type') == 'area') || element.getClient('type') == 'door') { //框选模式地板不允许拖动
                return false;
            }
            if (flag && element.getClient('type') == 'door') {
                return false;
            }
            return true;
        })
    }

    var prev;
    sceneEditor.network2d.addInteractionListener(function (e) {
        if (e.kind === 'liveMoveStart') {
            prev = sceneEditor.network2d.getLogicalPoint(e.event);
        } else if (e.kind === 'liveMoveBetween') {
            sceneEditor.edit2d.ruler.setShowGuides(true);
            var element = sceneEditor.network2d.getElementAt(e);
            if (!sceneEditor.network2d.superCopy) return;
            var current = sceneEditor.network2d.getLogicalPoint(e.event);
            if (current.x - prev.x > 60) {
                prev = current;
                superCopy.copyByMoveRight('hor');                 //目前先只支持水平方向的拖拽
            } else if (current.x - prev.x < 0) {
                superCopy.deleteRacksByMoveLeft(Math.floor(current.x));
            }
        } else if (e.kind === 'liveMoveEnd') {
            sceneEditor.network2d.superCopy = false;
            superCopy.clearCopyData();
            sceneEditor.edit2d.ruler.setShowGuides(false);
        } else if (e.kind === 'clickElement') {
            //已经保存的通道不允许修改模型属性
            var persistence = e.element.getClient('persistence');
            var type = e.element.getClient('type');
            if(type == 'channel' && persistence) {
                var propertyDatas = sceneEditor.edit2d.sheet.getPropertyBox().getDatas();
                propertyDatas.forEach(function (property) {
                    if (property.getPropertyType() == 'field') {
                        property.setEditable(false);
                    }
                })
            } else if (type == 'area' && persistence) {
                var propertyDatas = sceneEditor.edit2d.sheet.getPropertyBox().getDatas();
                propertyDatas.forEach(function (property) {
                    if (property.getPropertyName() == 'label') {
                        property.setEditable(false);
                    }
                })
            }
        }
    })

    // var calculate = function (p1, p2) {
    //     var k = (Math.abs(p1.y-p2.y) / (Math.abs(p1.x - p2.x)));

    //     var angle = Math.atan(k) * 180 / Math.PI;

    //     if (angle < 45) {
    //         return 'hor';
    //     } else {
    //         return 'ver';
    //     }

    // };

    
    var superCopy = (function () {
        var currentPosition;
        var racks = {};

        return {
            copyByMoveRight: function (type, flowOffsetX, flowOffsetY) {
                var data = sceneEditor.getSelectedData();

                if (data.length != 1) {
                    return 'you can use this fun only select one data';
                }
                data = data[0];

                if (data.id.indexOf('rack') < 0) return; //只支持机柜的一键拖拽复制
                var node = sceneEditor.network2d.getElementBox().getDataById(data.objectId);
                if (!node.getSize) {
                    return 'this fun used node';
                }
                var size = node.getSize();
                size = size || {
                    width: 60,
                    height: 60
                }
                var w = size.width + (flowOffsetX || 0);
                var h = size.height + (flowOffsetY || 0);
                var xx = w;
                var yy = h;
                var item = doodle.utils.clone(data);
                item.objectId = doodle.id();
                if (item.position) {
                    if (!currentPosition) {
                        currentPosition = item.position;
                    }
                    if (type == 'hor') {
                        currentPosition[0] += xx;
                        xx += w;
                    } else {
                        currentPosition[2] += yy;
                        yy += h;
                    }
                    item.position[0] = currentPosition[0];
                    if (!racks[item.position[0]]) {
                        racks[item.position[0]] = item;
                    }
                }
                if (item) {
                    sceneEditor.appendData(item);
                }
            },
            deleteRacksByMoveLeft: function (positionX) {
                
                if (racks[positionX]) {
                    var rackData = racks[positionX];
                    sceneEditor.removeData(rackData);
                }
            },
            clearCopyData: function () {
                currentPosition = undefined;
                racks = {};
            }
        }
    }())

    //对齐方式,调用align(type)方法，实现选中元素的对齐。type取值范围:up、down、left、right、center、middle
    $('#alignment').on('click', 'li', function (e) {
        var type = $(this).find('a').data('type');
        sceneEditor.align(type);
    });

    //分布方式,调用flow(type, padding),实现选中元素的均匀分布. type取值范围:hor、ver
    $('#layout').on('click', 'li', function (e) {
        var type = $(this).find('a').data('type');
        var data = sceneEditor.getSelectedData();
        if (data.length == 1) {
            layer.open({
                title: it.util.i18n("Admin_sceneEditor_Input_copy_times"),
                content: '<input id="count" type="number" value=9></input>',
                yes: function (index, layero) {
                    var count = $('#count').val();
                    count = parseFloat(count);
                    if (isNaN(count)) {
                        return;
                    }
                    sceneEditor.flowAndCopy(type, count);
                    layer.close(index);
                }
            });
        } else if (data.length > 1) {
            layer.open({
                title: it.util.i18n("Admin_sceneEditor_Input_Gap"),
                content: '<input id="padding" type="number" value=5></input>',
                yes: function (index, layero) {
                    var padding = $('#padding').val();
                    padding = parseFloat(padding);
                    if (isNaN(padding)) {
                        return;
                    }
                    sceneEditor.flow(type, padding);
                    layer.close(index);
                }
            });
        }
    });

    $('#view').on('click', 'li', function () {
        var type = $(this).find('a').data('type');
        if (sceneEditor.network2d[type]) {
            sceneEditor.network2d[type]();
        }
    })
    $('#edit').on('click', 'li', function () {
        var type = $(this).find('a').data('type');
        if (sceneEditor[type]) {
            sceneEditor[type]();
        }
    })

    $('body').on('keydown', function (e) {
        if (doodle.utils.isCtrlDown(e)) {
            //ctrl+c
            if (e.keyCode === 67) {
                copySelection();
            }
            //ctrl+v
            if (e.keyCode === 86) {
                pasteSelection();
            }
        }
        if (doodle.utils.isAltDown(e)) {
            sceneEditor.network2d.superCopy = true;
        }
    });
    // t-l-l,t-l-s, t-r-l,t-r-s, b-l-l,b-l-s, b-r-l,b-r-s
    $("#genId").click(function (e) {
        genIds(sceneEditor);
    });

    $('#genId').on('mouseover', function () {
        var self = this;
        layer.tips(it.util.i18n('Admin_sceneEditor_GenIds_tips'), self);
    })

    function copySelection() {
        sceneEditor.copySelection();
    }

    function pasteSelection() {

        sceneEditor.pasteSelection(); 
    }

    function exportImage() {
        var canvas = sceneEditor.toCanvas({
            scale: 1
        }).content;
        if (twaver.Util.isIE) {
            var w = window.open();
            w.document.open();
            w.document.write("<img src='" + canvas.toDataURL() + "'/>");
            w.document.close();
        } else {
            window.open(canvas.toDataURL(), 'network.png');
        }
    }

    var modelFilter = function (objs) {

        var r = [];
        var notExit = [];
        for (var i = 0; i < objs.length; i++) {
            var obj = objs[i];
            if (!make.Default.getCreator(obj.id)) {
                (notExit.indexOf(obj.id) < 0) && notExit.push(obj.id);
                console.warn('dataType ' + it.util.i18n("Admin_sceneEditor_Not_exist"), obj.id, obj);
                continue;
            }
            if (make.Default.getType(obj.id) == 'channel') {
                obj.client = obj.client || {};
                obj.client.isPhysicalPosition = true;
            }
            r.push(obj);
        }
        notExitDialog(notExit);

        return r;
    }

    function notExitDialog(arr) {
        if (arr.length == 0) return;

        var content = '';
        for (var i = 0; i < arr.length; i++) {
            content += '<p style="margin-bottom: 5px;"><span class="ui-icon ui-icon-alert" style="float: left;margin-right: 10px;margin-top: 3px;"></span><span style="clear:both;">dataType ' + it.util.i18n("Admin_sceneEditor_Not_exist") + arr[i] + '</span></p>';
        }
        layer.open({
            title: it.util.i18n('Admin_tabManager_Tip'),
            content: '<div>' + content +'</div>'
        });
    }

    //import dxf
    var importDxfDialog = doodle.utils.createImportDialog('Import DXF', 'dxf', function (text) {
        _floorData = null;
        sceneEditor.clear();
        sceneEditor.network2d.setPositionMagneticEnabled(false); //去掉吸附
        //不需要从dxf中生成编号，这样会导致不同楼层编号重复，需要在保存的时候定一个规则自动生成编号
        sceneEditor.loadDxfFile(text, modelFilter, false);
        //FIXME 计算通道里面的机柜
        //等待画面稳定
        setTimeout(function () {
            resetChannelRack();
        }, 550);
    });

    var importVsdxDialog = doodle.utils.createImportDialog('Import VSDX', 'vsdx', function (text) {
        _floorData = null;
        sceneEditor.clear();
        sceneEditor.network2d.setPositionMagneticEnabled(false); //去掉吸附
        //不需要从dxf中生成编号，这样会导致不同楼层编号重复，需要在保存的时候定一个规则自动生成编号
        sceneEditor.clear();
        sceneEditor.loadVsdxFile(text, modelFilter, true);
        //FIXME 计算通道里面的机柜
        //等待画面稳定
        setTimeout(function () {
            resetChannelRack();
        }, 550);
    }, true);

    /**
     * 是否是通道的孩子, 目前通道的孩子只能是列头柜, 机柜, 空调
     * @param item
     * @returns {boolean}
     */
    var isChannelChild = function (item) {
        var type = make.Default.getType(make.Default.getId(item));
        return type == 'header_rack' || type == 'rack' || type == 'airCondition';
    }

    var resetChannelRack = function () {
        var removeRacks = [];
        var list = sceneEditor.getData();
        list.forEach(function (item) {
            if (isChannel(item.id)) {

                //如果是通道
                var channelNode = sceneEditor.edit2d.box.getDataById(item.objectId);
                if (!channelNode) {
                    console.error(it.util.i18n("Admin_sceneEditor_Not_Find_channel"), item, channelNode);
                    return;
                }
                var channelNodeId = channelNode.getId();
                var rackArray = [];
                channelRackMap[channelNodeId] = rackArray; //保存机柜列表
                var isSingle = true;
                var maxX = 1;
                var temp = channelNode.getFollowers();
                var racks = [];
                if (temp && temp.size() > 0) {
                    temp.forEach(function (item) {
                        if (isChannelChild(item)) {
                            racks.push(item);
                        }
                    })
                }

                if (!racks || racks.length == 0) {
                    console.error(it.util.i18n("Admin_sceneEditor_Not_exist_racks_in_channel"), item, channelNode, racks);
                    return;
                } else {

                    var isPhysicalPosition = isRackUsePhysicalLocation(racks);
                    //如果柜子的尺寸不一致,使用物理坐标
                    if (isPhysicalPosition) {

                        var rks = [];
                        var cl = channelNode.getLocation();
                        var cc = channelNode.getCenterLocation();
                        var angle = (channelNode.getAngle() + 360) % 180;
                        var rad = angle / 180 * Math.PI;
                        var w = channelNode.getWidth();
                        var h = channelNode.getHeight();
                        var w2 = w / 2;
                        var h2 = h / 2;
                        racks.forEach(function (rack) {

                            var loc = getRackLoc(channelNode, rack);
                            var rc = rack.getCenterLocation();
                            var location = {
                                x: rc.x - cc.x,
                                y: 'floor-top',
                                z: rc.y - cc.y
                            };

                            var rackDataType = it.util.dataTypeMap[rack.getClient('id')];
                            var label = it.util.getLabel(rackDataType);

                            //保存到后台的参数
                            var rackItem = {
                                id: rack.getId(),
                                dataTypeId: rack.getClient('id'),
                                client: {
                                    bid: rack.getClient('bid'),
                                },
                                parentId: channelNodeId,
                                isNew: true,
                            }

                            var rct = doodle.utils.rotatePoint({
                                x: location.x,
                                y: location.z
                            }, rad, {
                                x: 0,
                                y: 0
                            });
                            rct.x = it.util.numberScale(rct.x, 1);
                            rct.y = it.util.numberScale(rct.y, 1);
                            rackItem.position = {
                                x: rct.x,
                                y: null,
                                z: rct.y
                            };
                            rackItem.location = {
                                x: null,
                                y: 'floor-top',
                                z: loc.y
                            };

                            //传给通道2d模型的参数
                            var rk = {
                                x: rct.x + w2,
                                y: rct.y + h2,
                                width: rack.getWidth(),
                                depth: rack.getHeight(),
                                id: rack.getClient('bid') || label,
                                angle: rack.getAngle() - channelNode.getAngle()
                            };
                            rks.push(rk);
                            //console.log('rack', rack.getClient('bid'), rk.x, rk.y, rk.width, rk.depth);
                            rackArray.push(rackItem);
                            removeRacks.push(rack);

                            isSingle = isSingle && loc.y != 1;
                            maxX = Math.max(maxX, loc.x);
                        });
                        if (isNewChannel(item.id)) {

                            var rackDepth = 110;
                            if (racks && racks.length > 0) {
                                var rack = racks[0];
                                rackDepth = rack.getHeight();
                            }
                            var aisleDepth = isSingle ? (channelNode.getHeight() - rackDepth) : (channelNode.getHeight() - rackDepth * 2);
                            var side = 'right';
                            channelNode.rackDepth = rackDepth;
                            channelNode.aisleDepth = aisleDepth;
                            channelNode.isSingle = isSingle;
                            channelNode.side = side;
                            channelNode.setClient('isOldChannelType', false);
                            channelNode.setClient('modelParameters', {
                                rackDepth: rackDepth,
                                aisleDepth: channelNode.aisleDepth,
                                isSingle: channelNode.isSingle,
                                side: channelNode.side,
                                width: w,
                                height: h,
                                client: {
                                    isPhysicalPosition: true
                                }
                            });
                            channelNode.racks = rks;
                        } else {
                            channelNode.racks = rks;
                            channelNode.setClient('isOldChannelType', true);
                        }
                    } else {
                        racks.forEach(function (rack) {

                            var loc = getRackLoc(channelNode, rack);
                            var location = {
                                x: loc.x,
                                y: 'floor-top',
                                z: loc.y
                            };
                            var rackItem = {
                                id: rack.getId(),
                                dataTypeId: rack.getClient('id'),
                                location: location,
                                client: {
                                    bid: rack.getClient('bid'),
                                    loc: loc.y + '-' + loc.x,
                                },
                                parentId: channelNodeId,
                                isNew: true,
                                isPhysicalPosition: isPhysicalPosition,
                            }
                            //console.log('rack', rack, rackItem);
                            var rackDataType = it.util.dataTypeMap[rackItem.dataTypeId];
                            var label = it.util.getLabel(rackDataType);
                            channelNode.setClient(rackItem.location.z + '-' + rackItem.location.x, rack.getClient('bid') || label);
                            rackArray.push(rackItem);
                            removeRacks.push(rack);

                            isSingle = isSingle && loc.y != 1;
                            maxX = Math.max(maxX, loc.x);
                        });
                        if (isNewChannel(item.id)) {
                            var size = {
                                width: 60,
                                height: 110
                            };
                            if (racks && racks.length > 0) {
                                var rack = racks[0];
                                size = rack.getSize();
                            }
                            var rackWidth = size.width || 60,
                                rackHeight = 220,
                                rackDepth = size.height || 110,
                                rackNumber = parseInt(isSingle ? maxX : maxX * 2),
                                aisleDepth = isSingle ? (channelNode.getHeight() - rackDepth) : (channelNode.getHeight() - rackDepth * 2),
                                side = 'right';
                            channelNode.rackWidth = rackWidth;
                            channelNode.rackHeight = rackHeight;
                            channelNode.rackDepth = rackDepth;
                            channelNode.rackNumber = rackNumber;
                            channelNode.aisleDepth = aisleDepth;
                            channelNode.isSingle = isSingle;
                            channelNode.side = side;
                            channelNode.setClient('isOldChannelType', false);
                            channelNode.setClient('modelParameters', {
                                rackWidth: channelNode.rackWidth,
                                rackHeight: channelNode.rackHeight,
                                rackDepth: channelNode.rackDepth,
                                rackNumber: channelNode.rackNumber,
                                aisleDepth: channelNode.aisleDepth,
                                isSingle: channelNode.isSingle,
                                side: channelNode.side,
                            });
                        } else {
                            channelNode.setClient('isOldChannelType', true);
                        }
                    }
                }


            }
        })
        removeRacks.forEach(function (rack) {
            sceneEditor.edit2d.box.remove(rack);
        })

        setTimeout(function () {
            sceneEditor.network2d.setPositionMagneticEnabled(true); //去掉吸附
        })
    }

    /**
     * 如果机柜的宽度不一致, 采用物理定位
     * @param racks
     * @returns {boolean}
     */
    var isRackUsePhysicalLocation = function (racks) {
        var width = racks[0].getWidth();
        for (var i = 1; i < racks.length; i++) {
            if (width != racks[i].getWidth()) {
                return true;
            }
        }
        return false;
    }

    /**
     * 根据通道节点和机柜节点,计算除机柜的逻辑位置.
     * @param channelNode
     * @param rackNode
     * @returns {{x: number, y: number}}
     */
    var getRackLoc = function (channelNode, rackNode) {
        //计算新的顶点坐标
        var channelLocation = channelNode.getLocation();
        var channelCenterLocation = channelNode.getCenterLocation();
        var angle = (channelNode.getAngle() + 360) % 180;
        var rad = angle / 180 * Math.PI;
        channelLocation = doodle.utils.rotatePoint(channelLocation, rad, channelCenterLocation);

        var rackCenterLocation = rackNode.getCenterLocation();

        var rackLocationTemp = doodle.utils.rotatePoint(rackCenterLocation, rad, channelCenterLocation);

        var channelSize = channelNode.getSize();
        var rackSize = rackNode.getSize();
        var result = {
            x: 0,
            y: 0,
            cx: rackLocationTemp.x,
            cy: rackLocationTemp.y
        };

        //只能正负90旋转
        var angleTemp = angle % 180;
        var offset = 0.1;
        if (channelNode.isSingle) {
            //如果是单通道,位置使用是1
            result.y = 1;
            //如果是靠近水平方向
            if (angleTemp >= 135 || angleTemp <= 45) {
                var d = rackCenterLocation.x - channelLocation.x;
                var w = rackSize.width * Math.cos(rad);
                result.x = Math.round(d / w + offset);
            } else {
                var d = rackCenterLocation.y - channelLocation.y;
                var w = rackSize.width * Math.sin(rad);
                result.x = Math.round(d / w + offset);
            }
        } else {
            //如果是靠近水平方向
            if (angleTemp >= 135 || angleTemp <= 45) {
                result.y = rackCenterLocation.y > channelCenterLocation.y ? 2 : 1;
                var d = rackCenterLocation.x - channelLocation.x;
                var w = rackSize.width * Math.cos(rad);
                result.x = Math.round(d / w + offset);
            } else {
                result.y = rackCenterLocation.x > channelCenterLocation.x ? 2 : 1;
                var d = rackCenterLocation.y - channelLocation.y;
                var w = rackSize.width * Math.sin(rad);
                result.x = Math.round(d / w + offset);
            }
        }

        return result;
    }


    var isChannel = function (id) {
        if (it.util.dataTypeMap[id] && it.util.dataTypeMap[id].categoryId == it.util.CATEGORY.CHANNEL) {
            return true;
        }
        var category = make.Default.getOtherParameter(id, 'sdkCategory');
        return category == 'channel'
    }

    var isNewChannel = function (id) {
        if (it.util.dataTypeMap[id]) {
            return false;
        }
        var category = make.Default.getOtherParameter(id, 'sdkCategory');
        return category == 'channel'
    }


    var _floorData = null;
    $('#tool').on('click', 'li', function (e) {
        var type = $(this).find("a").attr('data-type');
        if (type == 'downloadDxf') {
            window.open('/resource/dxf/itv.dxf');
        }
        if (type == 'downloadVsdx') {
            window.open('/resource/visio/demo.vsdx');
        }
        if (type == 'downloadVssx') {
            window.open('/resource/visio/' + it.util.i18n("Admin_sceneEditor_Make") + '.vssx');
        } else if (type == 'importDxf') {
            importDxfDialog.show();
        } else if (type == 'importVs') {
            importVsdxDialog.show();
        } else if (type === 'importroom') {

        } else if (type == 'export') {
            exportFun();
        } else if (type == 'save') {
            saveFun();
        } else if (type == 'delete') {
            deleteFun();
        } else if (type == 'import') {
            importDialog.show();
        } else if (type == 'open') {
            e.preventDefault();
            var form = getOpenSceneForm(_floorData, floorItems);
            var modal = util.modal('loadFloor', form, true, true, function () {
                var bv = $(form).data('bootstrapValidator');
                bv.validate();
                if (!bv.isValid()) return;
                // var params = form.serialize();
                var params = util.getFormData(form);
                it.util.adminApi('data', 'get', params,
                    function (data) {
                        if (it.util.showError(data)) {
                            //console.log(data);
                            _floorData = data;
                            openScene(_floorData)
                        }
                    });
            });
        } else if (type == 'exportImage') {
            exportImage();
        }
    });

    $('#clear').click(function () {
        sceneEditor.clear();
        _floorData = null;
    });
    $("#2d").click(function () {
        sceneEditor.show2D();
        sceneEditor.hide3D();
    });
    var layerId;
    $("#3d").click(function () {
        sceneEditor.show3D();
        sceneEditor.hide2D();
    });

    function clearChannelChildren() {
        channelRackMap.channel = [];
        channelRackMap = null;
        channelEditor.network.getElementBox().clear();
    }

    //export json
    var exportFun = function () {
        var json = getData();
        if (!json || json.length == 0) {
            util.showMessage(it.util.i18n("Admin_sceneEditor_No_data"));
            return;
        }
        var text = JSON.stringify(json);
        var content = "<div>" + it.util.i18n("Admin_sceneEditor_Export_data") + ":<br><textarea>" + text + "</textarea></div>";
        // $(content).dialog({
        //     "title": "导出json",
        //     "width": 400,
        //     "height": 500
        // });
        var modal = util.modal(it.util.i18n("Admin_sceneEditor_Export") + 'json', content, true, false, function () {

        });

    };


    function checkData(treeView, treeNode, handle) {
        var data = treeNode.original;
        if (data.type != 'datatype') { //如果data.datatype 说明是类型节点，暂时不处理
            if (handle) {
                var result = handle(data);
                if (!result) {
                    return false;
                }
            }
        }
        if (treeNode.children) {
            for (var i = 0; i < treeNode.children.length; i++) {
                if (!checkData(treeView, treeView.treeView.jstree('get_node', treeNode.children[i]), handle)) {
                    return false;
                }
            }
        }
        return true;
    };

    var getData = function () {
        var data = sceneEditor.getData(true);
        for (var p in channelRackMap) {
            channelRackMap[p].forEach(function (item) {
                //只有新加的才需要保存, 否则不需更新
                if (item.isNew) {
                    var d = toMakeDataAction(item, item.isNew);
                    data.push(d)
                }

            });
        }
        var r = data.filter(function (item) {

            var dt = it.util.dataTypeMap[item.id];
            if (!dt || dt.categoryId == it.util.CATEGORY.ROOM) {
                return true;
            }

            var s1 = item.parentId;
            var s2 = it.util.o2s(item.position || [0, 0, 0]);
            var s3 = it.util.o2s(item.rotation || [0, 0, 0]);
            if (item.client.persistence && s1 == item.client.oldParentId && s2 == item.client.oldPosition && s3 == item.client.oldRotation && !item.client.childChange) {
                return false;
            }
            return true;
        })
        return r;

        //机柜位置或者父亲没有发生变更, 不更新

        ////校验所有的机位,在有机柜的位置摆放机位
        ////找到所有机位,key 是绑定机柜的编号
        //var seatMap = {};
        //data.forEach(function (item) {
        //    if (item.id
        //        && it.util.dataTypeMap[item.id]
        //        && it.util.dataTypeMap[item.id].categoryId == it.util.CATEGORY.SEAT
        //        && item.client
        //        && item.client.bid) {
        //        seatMap[item.client.bid.replace('_seat', '')] = item;
        //    }
        //})
        ////遍历所有机柜
        //var seats = [];
        //data.forEach(function (item) {
        //    if (item.id
        //        && it.util.dataTypeMap[item.id]
        //        && it.util.dataTypeMap[item.id].categoryId == it.util.CATEGORY.RACK
        //        && item.client
        //        && !seatMap[item.client.bid]) {
        //        var seat = make.Default.clone(item);
        //        seat.client = seat.client || {};
        //        seat.client.target = item.client.bid;
        //        seat.id = item.id + '_seat';
        //        seat.objectId = item.objectId + '_seat';
        //        seat.client.bid = item.client.bid + '_seat';
        //        seat.location[1] = 'neg_neg';
        //        seats.push(seat);
        //    }
        //})
        //data = data.concat(seats);
        // return data;
    }

    var saveFun = function () {

        try {

            var data = getData();
            sceneEditor.box.getSelectionModel().clearSelection(); //清空选择,不然在外面粘贴会影响画布
            var saveSceneDialog = window.saveSceneDialog = new SaveSceneDialog(data, _floorData, saveComplete);
            saveSceneDialog.show();
        } catch (e) {
            layer.alert(e, {
                icon: 2
            });
            throw e;
            return;
        }
    }

    var deleteFun = function () {
        var form = getOpenSceneForm(null, floorItems);
        var modal = util.modal('loadFloor-delete', form, true, true, function () {
            var bv = $(form).data('bootstrapValidator');
            bv.validate();
            if (!bv.isValid()) return;
            // var params = form.serialize();
            var params = util.getFormData(form);
            it.util.adminApi('data', 'get', params,
                function (data) {
                    if (it.util.showError(data)) {
                        data = data;
                        layer.confirm(it.util.i18n("Admin_sceneEditor_Confirm_delete_scene") + data.id, {}, function (index) {
                            deleteAction(data, function () {
                                queryFloor(function () {
                                    layer.msg(it.util.i18n("Admin_sceneEditor_Delete_success"));
                                });
                            });
                            layer.close(index);
                        })
                    }
                });

        });
    }

    var deleteAction = function (data, callback) {
        it.util.adminApi('data', 'remove', {
            id: data.id
        }, function () {
            console.log(it.util.i18n("Admin_sceneEditor_Delete") + 'data', data);
            //如果是floor room 删除dataType
            var categoryId = it.util.dataTypeMap[data.dataTypeId].categoryId;
            if (categoryId == it.util.CATEGORY.FLOOR || categoryId == it.util.CATEGORY.ROOM) {
                it.util.adminApi('datatype', 'remove', {
                    id: data.dataTypeId
                }, function () {
                    console.log(it.util.i18n("Admin_sceneEditor_Delete") + 'dataType', data);
                })
            }
            it.util.adminApi('data', 'search', {
                parentId: data.id
            }, function (children) {
                children.forEach(function (child) {
                    deleteAction(child);
                })
                callback && callback();
            })
        })
    }

    var saveComplete = function (floorData) {
        sceneEditor.clear();
        it.util.loadDataTypes(function () {
            queryFloor(function () {
                for (var i = 0; i < floorArray.length; i++) {
                    if (floorData.id == floorArray[i].id) {
                        _floorData = floorArray[i];
                        setTimeout(function () {
                            refreshDataTypes(function () {
                                openScene(_floorData);
                            });
                        }, 500)

                        return;
                    }
                }
            });
        })
    }

    //import json
    var importDialog = doodle.utils.createImportDialog('Import JSON', 'json', function (text) {
        sceneEditor.clear();
        sceneEditor.setData(JSON.parse(text), true);
    });


    var floorItems = [];
    var floorArray = [];
    var queryFloor = function (callback) {
        var floorTypes = [];
        it.util.dataTypeIterator(function (typeId, item) {
            if (item.categoryId == 'floor') {
                floorTypes.push(typeId);
            }
        })
        it.util.adminApi('data', 'search', {
            where: {
                dataTypeId: {
                    $in: floorTypes
                }
            }
        }, function (r) {
            floorArray = r;
            floorItems = floorArray.map(function (item) {
                return {
                    value: item.id,
                    label: item.id + ' ' + (item.description || '')
                };
            })
            callback && callback();
        })
    }

    var openScene = function (floorData) {

        var dataType = it.util.dataTypeMap[floorData.dataTypeId];
        var floorParams = dataType.modelParameters;
        floorParams.sort(function (o1, o2) {
            if (make.Default.getOtherParameter(o1.id, 'sdkCategory') == 'floor') {
                return -1;
            } else {
                return 1;
            }
        });
        var floor = {
            objectId: floorData.id,
            position: [floorData.position.x || 0, 0, floorData.position.z || 0],
            client: {
                bid: floorData.id,
                persistence: true,

            }
        }
        make.Default.copyProperties(floorParams[0], floor);
        var floorArgs = [floor];
        for (var i = 1; i < floorParams.length; i++) {
            floorArgs.push(floorParams[i]);
        }
        sceneEditor.clear();
        sceneEditor.setData(floorArgs, true);

        loadChildren(floorData, function (floorChildren) {
            floorChildren.forEach(function (child) {

                var childCategoryId = it.util.dataTypeMap[child.dataTypeId].categoryId;
                if (childCategoryId == it.util.CATEGORY.ROOM || childCategoryId == it.util.CATEGORY.CHANNEL) {
                    loadChildren(child, function (childChildren) {
                        childChildren.forEach(function (childChild) {

                            var childChildCategoryId = it.util.dataTypeMap[childChild.dataTypeId].categoryId;
                            if (childChildCategoryId == it.util.CATEGORY.CHANNEL) {
                                loadChildren(childChild, function (childChildChildren) {
                                    childChildChildren.forEach(function (childChildChild) {

                                        //var dataTypeId = channelChild.dataTypeId;
                                        //var categoryId = it.util.dataTypeMap[dataTypeId].categoryId;
                                        //if (categoryId == 'rack' || categoryId == 'headerRack') {
                                        //    loadChildren(childChild, function(channelChildren){
                                        //
                                        //    })
                                        //}
                                    });
                                })
                            }
                        });
                    })
                }
            });
        });
    }


    /**
     * 加载孩子
     * @param data
     */
    var loadChildren = function (data, callback) {
        it.util.adminApi('data', 'search', {
            parentId: data.id
        }, function (r) {
            
            loadWaterCable(data);

            //如果父亲是通道,直接绘制到通道里面
            if (it.util.dataTypeMap[data.dataTypeId].categoryId == it.util.CATEGORY.CHANNEL) {

                channelRackMap[data.id] = r; //保存机柜列表
                var node = sceneEditor.findByBID(data.id);
                if (node) {
                    var w2 = node.getWidth() / 2;
                    var h2 = node.getHeight() / 2;
                    if (node.getClient('isPhysicalPosition')) {
                        var rks = r.map(function (item) {
                            var dt = it.util.dataTypeMap[item.dataTypeId];
                            var mp = dt.modelParameters || {};
                            return {
                                x: item.position.x + w2,
                                y: item.position.z + h2,
                                width: mp.width || 60,
                                depth: mp.depth || 110,
                                id: item.id
                            }
                        })
                        node.racks = rks;
                    } else {
                        r.forEach(function (item) {
                            node.setClient(item.location.z + '-' + item.location.x, item.id)
                        })
                    }
                }
            } else {
                var children = toMakeData(data, r);
                sceneEditor.setData(children, true);
                callback && callback(r);
            }
        })
    }

    var loadWaterCable = function (data) {
        //加载水浸线
        it.util.adminApi('water_leak_wire', 'find', { where: { parentId: data.id } }, function (result) {
            var children =toMakeData(data, result);
            sceneEditor.setData(children, true);
        })
    }

    /**
     * 数据转换成make的格式
     * @param dataArray
     * @returns {Array}
     */
    var toMakeData = function (parentData, dataArray) {

        var parentDataTypeId = parentData.dataTypeId;
        var parentDataType = it.util.dataTypeMap[parentDataTypeId];
        var result = [];

        it.util.parseDataPositionAndLocation(parentData);
        parentData.position = parentData.position || {
            x: 0,
            y: 0,
            z: 0
        };
        dataArray.forEach(function (data) {
            var dataTypeId = data.dataTypeId;
            if (make.Default.getCreator(dataTypeId)) {
                data.rotation = data.rotation || {
                    x: 0,
                    y: 0,
                    z: 0
                };
                var position = getMakePosition(data, parentData, parentDataType);
                var m = toMakeDataAction(data);
                m.position = position;
                m.client.oldPosition = it.util.o2s(position);
                result.push(m);
            }
        })
        return result;
    }

    /**
     * 转换成make格式
     * @param data
     * @param isNew
     * @returns {{}}
     */
    var toMakeDataAction = function (data, isNew) {
        var m = {};
        var dataTypeId = data.dataTypeId;
        data.rotation = data.rotation || {
            x: 0,
            y: 0,
            z: 0
        };
        data.client = data.client || {};
        var r = [data.rotation.x, data.rotation.y, data.rotation.z];
        make.Default.copyProperties({
            id: dataTypeId,
            objectId: data.id,
            name: data.id,
            parentId: data.parentId,
            rotation: r,
            client: {
                parentId: data.parentId,
                bid: data.client.bid || (isNew ? '' : data.id),
                persistence: !isNew, //是否已经保存的
                label: it.util.getLabel(it.util.dataTypeMap[dataTypeId]),
                oldParentId: data.parentId,
                oldRotation: it.util.o2s(r),
                data: data.path                                
            },
            data: data.path || []                  //水浸线
        }, m);
        //机房默认不显示编号
        if (it.util.dataTypeMap[dataTypeId].categoryId == it.util.ROOM) {
            m.client.label = '';
        }
        make.Default.copyProperties(data.client, m.client);
        make.Default.copyProperties(data.style, m.style);
        make.Default.copyProperties(it.util.dataTypeMap[dataTypeId].modelParameters, m);
        if (data.position) {
            m.position = [data.position.x, data.position.y, data.position.z];
        }
        if (data.location) {
            m.location = [data.location.x, data.location.y, data.location.z];
        }
        return m;
    }

    var isLogicPosition = function (dataType) {
        var childrenSize = dataType.childrenSize;
        if (childrenSize) {
            return false;
        }
        if (isNaN(parseFloat(childrenSize.x)) && isNaN(parseFloat(childrenSize.y)) && isNaN(parseFloat(childrenSize.z))) {
            return false;
        }
        return true;
    }

    /**
     * 是否是空字符串
     * @param n
     * @returns {boolean}
     */
    var isEmpty = function (n) {
        return n === undefined || n === null || (n + '').trim().length === 0;
    }

    /**
     * 换算成doodle的坐标
     * @param childData
     * @param parentData
     * @param parentDataType
     * @returns {*[]}
     */
    var getMakePosition = function (childData, parentData, parentDataType) {

        it.util.parseDataPositionAndLocation(childData);
        var x, y, z;
        //
        if (parentDataType.childrenSize && parentDataType.childrenSize != '' && parentDataType.childrenSize.x && parentDataType.childrenSize.z) {
            //逻辑坐标
            if (childData.location) {

                //如果父亲是楼层或者是机房,根据bounding计算逻辑坐标
                if (parentDataType.categoryId == it.util.CATEGORY.FLOOR || parentDataType.categoryId == it.util.CATEGORY.ROOM) {
                    if (!isEmpty(childData.location.x) || !isEmpty(childData.location.z)) {
                        //如果是打点的机房,需要计算bounding
                        //首次计算,并且是打点机房.
                        if (!parentDataType.bounding && parentDataType.modelParameters.data) {
                            var childrenSize = parentDataType.childrenSize;
                            childrenSize.x = childrenSize.x || 1;
                            childrenSize.y = childrenSize.y || 1;
                            childrenSize.z = childrenSize.z || 1;
                            var bounding = parentDataType.bounding;
                            if (!bounding) {
                                var bb = make.Default.getPathBoundingBox(parentDataType.modelParameters.data);
                                bb.width = bb.size.x;
                                bb.height = bb.size.y;
                                bounding = parentDataType.bounding = bb;
                                bounding.dx = bounding.width / parseFloat(childrenSize.x);
                                bounding.dz = bounding.height / parseFloat(childrenSize.z);
                            }
                        }
                        var bounding = parentDataType.bounding;
                        if (bounding) {
                            var ox = bounding.min.x;
                            var oz = -bounding.max.y; //TODO 取反
                            if (!isEmpty(childData.location.x)) {
                                x = bounding.dx * childData.location.x;
                            }
                            if (!isEmpty(childData.location.y)) {
                                y = childData.location.y;
                            }
                            if (!isEmpty(childData.location.z)) {
                                z = bounding.dz * childData.location.z;
                            }
                        }
                    }
                } else if (parentDataType.categoryId == it.util.CATEGORY.CHANNEL) {
                    //FIXME 因为通道可能有旋转之类的,很难做到里面机柜位置的计算,暂时不加载通道里面的机柜,只在通道的对应位置上显示机柜编号
                    console.warn(it.util.i18n("Admin_sceneEditor_Load_tip"));
                }
            }
        }

        //物理坐标
        if (childData.position) {

            //物理坐标
            if (isEmpty(x) && !isEmpty(childData.position.x)) {
                x = childData.position.x;
            }
            if (isEmpty(y) && !isEmpty(childData.position.y)) {
                y = childData.position.y;
            }
            if (isEmpty(z) && !isEmpty(childData.position.z)) {
                z = childData.position.z;
            }
        }
        if (isEmpty(x)) {
            x = 0;
            console.warn('error position X:', childData, 'parentData', parentData, 'parentDataType', parentDataType);
        }
        if (isEmpty(y)) {
            y = 0;
            console.warn('error position Y:', childData, 'parentData', parentData, 'parentDataType', parentDataType);
        }
        if (isEmpty(z)) {
            z = 0;
            console.warn('error position Z:', childData, 'parentData', parentData, 'parentDataType', parentDataType);
        }
        if (y == 'neg_neg') {
            y = 'floor-top';
        }

        return [x, y, z];
    }

    var openFilterMenuPanel = function () {
        if (!sceneEditor.visibleData) {
            sceneEditor.visibleData = new twaver.List();
        }

        var types = {};
        var box = sceneEditor.edit2d.network2d.getElementBox();
        box.forEach(function (node) {
            var modelId = make.Default.getId(node);
            var id = doodle.utils.getSceneEditorModel2dId(modelId);
            var name = make.Default.getName(id);
            types[id] = name;

        });

        var props = [];
        for (var id in types) {
            props.push({
                "label": types[id],
                "id": id,
                "type": 'checkbox',

            });
        }

        var form = util.createForm(props, null, null, {
            left: 6,
            right: 3
        });
        $('body').append(form);
        if (props.length == 0) {
            layer.open({
                title: it.util.i18n("Admin_sceneEditor_Asset_Model"),
                content: it.util.i18n("Admin_sceneEditor_No_data"),
                area: ['300px', '500px']
            });
        } else {
            layer.open({
                type: 1,
                title: it.util.i18n("Admin_sceneEditor_Asset_Model"),
                content: form,
                area: ['300px', '500px']
            });
        }

        $.each($("input[type='checkbox']"), function (index, checkbox) {
            if (!sceneEditor.visibleData.contains($(checkbox).attr('id'))) {
                $(checkbox).attr('checked', true);
            }
        });
        $("input[type='checkbox']").change(function (e) {
            var checked = $(this).is(':checked');
            var id = $(this).attr('id');
            if (checked) {
                if (sceneEditor.visibleData.contains(id)) {
                    sceneEditor.visibleData.remove(id);
                }
            } else {
                if (!sceneEditor.visibleData.contains(id)) {
                    sceneEditor.visibleData.add(id);
                }
            }

            sceneEditor.edit2d.network2d.invalidateElementVisibility();
        })

        sceneEditor.edit2d.network2d.setVisibleFunction(function (element) {
            var id = doodle.utils.getSceneEditorModel2dId(element.getClient('id'));
            return !sceneEditor.visibleData.contains(id);

        });
    }

    /**
     * 打开选择场景弹框
     * @param data
     * @param items
     */
    var getOpenSceneForm = function (data, items) {
        data = data || {};
        var props = [];
        //props.push({label:'categoryId', id:'categoryId',type:'select', value: data.categoryId, items:it.util.categorys});
        props.push({
            label: 'id',
            id: 'id',
            options: 'required:true',
            type: 'select',
            value: data.id,
            items: items,
        });
        var form = util.createForm(props);
        form.bootstrapValidator({
            feedbackIcons: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'
            },
            fields: {
                id: {
                    validators: {
                        notEmpty: {
                            message: 'The ID is required'
                        }
                    }
                }
            }
        });
        form.on('success.form.bv', function (e) {
            // 阻止默认事件提交
            e.preventDefault();
        });
        return form;
    };

    
    function genIds(editor, callback) {
        var $form = '<form class="form-horizontal" style="margin-top: 10px;width: 350px;">' +
            '<div class="form-group">' +
            '<label class="col-sm-4 control-label">' + it.util.i18n('Admin_sceneEditor_Type') + '</label>' +
            '<div class="col-sm-8">' +
            '<select class="form-control" id="type">' +
            '<option value="t-l-l">t-l-l</option>' +
            '<option value="t-l-s">t-l-s</option>' +
            '<option value="t-r-l">t-r-l</option>' +
            '<option value="t-r-s">t-r-s</option>' +
            '<option value="b-l-l">b-l-l</option>' +
            '<option value="b-l-s">b-l-s</option>' +
            '<option value="b-r-l">b-r-l</option>' +
            '<option value="b-r-s">b-r-s</option>' +
            '</select>' +
            '</div>' +
            '</div>' +
            '<div class="form-group">' +
            '<label class="col-sm-4 control-label">' + it.util.i18n('Admin_sceneEditor_StartNum') + '</label>' +
            '<div class="col-sm-8">' +
            '<input type="text" class="form-control" id="start">' +
            '</div>' +
            '</div>' +
            '<div class="form-group">' +
            '<label class="col-sm-4 control-label">' + it.util.i18n('Admin_sceneEditor_CoreNumLen') + '</label>' +
            '<div class="col-sm-8">' +
            '<input type="text" class="form-control" id="coreNumLen" value="2">' +
            '</div>' +
            '</div>' +
            '<div class="form-group">' +
            '<label class="col-sm-4 control-label" style="margin-left: -8px;">' + it.util.i18n('Admin_sceneEditor_includeRow') + '</label>' +
            '<div class="col-sm-8">' +
            '<div class="checkbox">' +
            '<label>' +
            '<input type="checkbox" id="includeRow" checked="checked" >' +
            '</label>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="form-group">' +
            '<label class="col-sm-4 control-label">' + it.util.i18n('Admin_sceneEditor_Prefix') + '</label>' +
            '<div class="col-sm-8">' +
            '<input type="text" class="form-control" id="prefix">' +
            '</div>' +
            '</div>' +
            '<div class="form-group">' +
            '<label class="col-sm-4 control-label">' + it.util.i18n('Admin_sceneEditor_Suffix') + '</label>' +
            '<div class="col-sm-8">' +
            '<input type="text" class="form-control" id="suffix">' +
            '</div>' +
            '</div>' +
            '</form>';
        layer.open({
            type: 1,
            title: it.util.i18n('Admin_sceneEditor_GenIds'),
            content: $form,
            area: ['400px'],
            btn: [it.util.i18n('Admin_sceneEditor_CreateNum'), it.util.i18n('Admin_sceneEditor_Quit')],
            yes: function (index, layero) {
                var type = $('#type').val();
                var start = $('#start').val();
                var coreNumLen = $('#coreNumLen').val();
                var includeRow = $('#includeRow').is(':checked');
                var prefix = $('#prefix').val();
                var suffix = $('#suffix').val();
                sceneEditor.genIds.call(editor, {
                    type: type,
                    start: start,
                    includeRow: includeRow,
                    coreNumLen: coreNumLen,
                    prefix: prefix,
                    suffix: suffix,
                });

                callback && callback();
                layer.close(index);
            },
            btn2: function (index, layero) {
                layer.close(index);
            }
        });
    }


    /**
     * 打开编辑通道里面机柜的弹框
     * @param channelNode
     */
    var openChannelEditorDialog = function (channelNode) {

        var nodeSize = channelNode.getSize();
        var zoom = 1;
        var toolbarHeight = 50;
        var editorBoxPadding = 5;
        var boxWidth = 1300;
        var boxHeight = nodeSize.height * zoom + editorBoxPadding * 4 + toolbarHeight;
        var editorBox = channelEditor.networkBox = $('<div class="channelEditor"></div>');
        editorBox.width(boxWidth);
        editorBox.height(boxHeight);


        var toolbar = $('<div class="toolbar"></div>').appendTo(editorBox);
        toolbar.height(toolbarHeight);

        var fillRackButton = $('<div class="btn-group"><button class="btn btn-default dropdown-toggle" ' +
            'data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' + it.util.i18n("Admin_sceneEditor_Fill_rack") + '<span class="caret"></span></button></div>').appendTo(toolbar);
        var fillRackButtonUL = $('<ul class="dropdown-menu"></ul>').appendTo(fillRackButton);
        it.util.dataTypeIterator(function (id, item) {
            if (item.categoryId == it.util.CATEGORY.RACK) {
                fillRackButtonUL.append('<li><a href="#" id="' + id + '">' + it.util.getLabel(item) + '</a></li>')
            }
        })


        var deleteRackButton = $('<input type="button" class="btn btn-default" value="' + it.util.i18n("Admin_sceneEditor_Delete_rack") + '">').appendTo(toolbar);
        var genIdsButton = $('<input type="button" class="btn btn-default" value="生成编号">').appendTo(toolbar);

        var networkBox = $('<div class="networkBox"></div>').appendTo(editorBox);
        networkBox.css('overflow-x', 'auto');
        networkBox.css('margin', '0 auto');
        networkBox.css('top', toolbarHeight + editorBoxPadding + editorBoxPadding + editorBoxPadding);
        networkBox.width(boxWidth - editorBoxPadding * 8);
        networkBox.height(boxHeight - editorBoxPadding * 4 + toolbarHeight - 50);

        if (channelEditor.network) {
            channelEditor.box.clear();
            channelEditor.network.dispose();
        }
        var network = channelEditor.network = new twaver.vector.Network();
        network.setZoom(zoom);
        network.setWheelToZoom(false);

        var box = channelEditor.box = network.getElementBox();
        var sm = channelEditor.sm = box.getSelectionModel();

        sm.setFilterFunction(function (element) {
            if (element.getClient('type') == "channel") {
                return false;
            }
            return true;
        })

        network.isMovable = function () {
            return false;
        };
        network.getLabel = function (data) {
            var label = data.getClient("bid");
            if (!label || label.trim().length == 0) {
                label = data.getClient("label");
            }
            return label;
        }

        var layerBox = box.getLayerBox();
        var channelLayer = new twaver.Layer('channelLayerId');
        var rackLayer = new twaver.Layer('rackLayerId');
        layerBox.add(channelLayer);
        layerBox.add(rackLayer);


        var json = make.Default.toJson(channelNode);
        json.id = doodle.utils.getSceneEditorModel2dId(json.id);
        var node = channelEditor.node = make.Default.load(json);

        //FIX 这里json没有使用新建通道的属性，强制赋值
        node.isSingle = json.isSingle;
        node.side = json.side;
        node.rackNumber = json.rackNumber;
        node.aisleDepth = json.aisleDepth;
        node.rackDepth = json.rackDepth;
        node.rackHeight = json.rackHeight;
        node.rackWidth = json.rackWidth;

        node.setLocation(0, 0);
        node.setLayerId('channelLayerId');
        box.add(node);

        genIdsButton.on('click', function (e) {
            genIds(channelEditor, function () {
                var channelRacks = channelRackMap[channelEditor.node._id];
                for (var r = 0; r < channelRacks.length; r++) {
                    var channelRack = channelRacks[r];
                    channelRack.client.bid = box.getDataById(channelRack.id).getClient('bid');
                }
            });
        })

        var realId = channelNode.getClient('persistence') ? channelNode.getClient('bid') : channelNode.getId();
        var racks = channelRackMap[realId];
        if (!racks) {
            racks = channelRackMap[realId] = [];
        }
        if (racks) {
            racks.forEach(function (item) {
                item.client = item.client || {};
                item.client.loc = item.location.z + '-' + item.location.x;
                var rackNode = loadRackInChannel(box, node, item);
                if (item.location.x % 2) {
                    rackNode.setStyle('label.yoffset', 15)
                } else {
                    rackNode.setStyle('label.yoffset', -15)
                }

            })
        }

        //如果已经保存,显示dataId, 否则显示类型的信息
        var label = '';
        if (!channelNode.getClient('isOldChannelType')) {
            label = it.util.i18n("Admin_sceneEditor_Create_channel") + '-' + (channelNode.isSingle ? 1 : 2) + '-' + channelNode.rackNumber;
        } else {
            var dataType = it.util.dataTypeMap[channelNode.getClient('id')];
            var label = channelNode.getClient('persistence') ? channelNode.getClient('bid') : it.util.getLabel(dataType);
        }

        node.setClient('label', label);

        network.setDragToPan(false);
        networkBox.append(network.getView());

        //点击填充按钮
        fillRackButton.on('click', 'a', function () {

            //弹出猎头柜form
            var rackTypeId = this.id;
            layer.confirm(it.util.i18n("Admin_sceneEditor_include_header_rack_or_not"), function (index) {
                selectHeaderRack(function (headerRackTypeId) {
                    fillRackAction(rackTypeId, headerRackTypeId);
                })
                layer.close(index);
            }, function () {
                fillRackAction(rackTypeId);
            })
        })

        var fillRackAction = function (rackTypeId, headerRackTypeId) {

            var rackDataType = it.util.dataTypeMap[rackTypeId];
            var label = it.util.getLabel(rackDataType);

            var rackNumber = channelNode.rackNumber;
            var isSingle = channelNode.isSingle;
            var side = channelNode.side;
            if (!isSingle) {
                rackNumber = rackNumber / 2;
                for (var z = 1; z <= 2; z++) {
                    for (var x = 1; x <= rackNumber; x++) {
                        var dataTypeId = rackTypeId;
                        if (x == 1 && headerRackTypeId) {
                            dataTypeId = headerRackTypeId;
                        }
                        if (!node.getClient(z + '-' + x)) {
                            //fill rack
                            var item = {
                                id: doodle.id(),
                                dataTypeId: dataTypeId,
                                location: {
                                    x: x,
                                    y: 'floor-top',
                                    z: z
                                },
                                client: {
                                    loc: z + '-' + x,
                                },
                                parentId: realId,
                            }
                            item.isNew = true;
                            loadRackInChannel(box, node, item);
                            racks.push(item);
                            channelNode.setClient(item.client.loc, label);
                        }
                    }
                }
            } else {
                for (var x = 1; x <= rackNumber; x++) {
                    var dataTypeId = rackTypeId;
                    if (x == 1 && headerRackTypeId) {
                        dataTypeId = headerRackTypeId;
                    }
                    if (!node.getClient(1 + '-' + x)) {
                        //fill rack
                        var item = {
                            id: doodle.id(),
                            dataTypeId: dataTypeId,
                            location: {
                                x: x,
                                y: 'floor-top',
                                z: 1
                            },
                            client: {
                                loc: 1 + '-' + x,
                            },
                            parentId: realId,
                        }
                        item.isNew = true;
                        loadRackInChannel(box, node, item);
                        racks.push(item);
                        channelNode.setClient(item.client.loc, label);
                        channelNode.isNew = true;
                    }
                }
            }
            channelNode.setClient('childChange', true);              //用来判断是否添加机柜和删除机柜
            channelRackMap[realId] = racks;
        }

        //点击删除机柜按钮
        deleteRackButton.on('click', function () {
            var list = sm.getSelection().toList();
            layer.confirm((it.util.i18n("Admin_sceneEditor_Confirm_delete_rack") + '?'), function (index) {
                if (list.size() > 0) {
                    var deletes = [];
                    list.forEach(function (item) {
                        if (!item.isNew) {
                            deletes.push({
                                id: item.getId()
                            })
                        }
                    });

                    it.util.adminApi('data', 'batchRemove', deletes, function () {           //此删除直接删除了后台的机柜

                        list.forEach(function (item) {
                            var id = doodle.utils.getSceneEditorModel3dId(item.getClient('id'));
                            var categoryId = it.util.dataTypeMap[id].categoryId;
                            if (categoryId == it.util.CATEGORY.RACK || categoryId == it.util.CATEGORY.HEADER_RACK) {
                                //移除
                                box.remove(item)
                                //清除通道上的标记
                                var loc = item.getClient('loc');
                                node.setClient(loc, '');
                                //
                                channelNode.setClient(loc, '');
                                //从缓存中移除
                                var data = item.getClient('data');
                                var index = racks.indexOf(data);
                                racks.splice(index, 1);
                                //如果是持久化的,须后从后台删除
                            }
                        })
                    }, function (error) {
                        if (error.indexOf('had bean removed') >= 0){
                            var deleteNodes = sm.getSelection().toList();
                            deleteNodes.forEach(function (node) {
                                //移除
                                box.remove(node);
                                //清除通道上的标记
                                var loc = node.getClient('loc');
                                node.setClient(loc, '');
                                //
                                channelEditor.node.setClient(loc, '');
                                channelNode.setClient(loc, '');
                                //从缓存中移除
                                var data = node.getClient('data');
                                var index = racks.indexOf(data);
                                racks.splice(index, 1);
                            })
                        }
                    })

                }
                channelNode.setClient('childChange', false);                    //用来判断是否添加机柜和删除机柜
                layer.close(index);
            })
        })

        //弹出通道编辑器对话框
        var modal = channelEditor.modal = util.modal(it.util.i18n('Admin_sceneEditor_channelEditor'), editorBox, true, true, function () {
            console.log('channelEditor submit ...');
        });

        modal.find('.modal-dialog').width(boxWidth + 5);

        setTimeout(function () {
            var bounds = {
                x: 13,
                y: 5,
                width: nodeSize.width * zoom + 30,
                height: nodeSize.height * zoom + 15
            };
            network.adjustBounds(bounds);
            network.setScrollBarVisible(false);
        }, 1000)
        return modal;
    };

    /**
     * 加载机柜
     * @param box
     * @param node
     * @param item
     * @param isNew
     */
    var loadRackInChannel = function (box, node, item) {
        node.setClient(item.location.z + '-' + item.location.x, item.client.bid || item.id);
        var position = getRackPosition(node, item);
        var m = toMakeDataAction(item, item.isNew);
        m.position = position;
        m.id = doodle.utils.getSceneEditorModel2dId(m.id);
        var rackNode = make.Default.load(m);
        rackNode.setLayerId('rackLayerId');
        box.add(rackNode);
        return rackNode.setClient('data', item);
    }

    /**
     * 计算2D机柜位置
     * @param channelNode
     * @param rackNodeInfo
     * @returns {*[]}
     */
    var getRackPosition = function (channelNode, rackNodeInfo) {

        var location = rackNodeInfo.location;
        var aisleDepth = channelNode.aisleDepth;
        var rackDepth = channelNode.rackDepth;
        var rackWidth = channelNode.rackWidth;
        var isSingle = channelNode.isSingle;
        var side = channelNode.side;
        if (!isSingle) {
            if (location.z == 1) {
                var x = rackWidth * (location.x - 0.5);
                var y = rackDepth / 2;
                return [x, 0, y];
            } else {
                var x = rackWidth * (location.x - 0.5);
                var y = rackDepth / 2 + aisleDepth + rackDepth;
                return [x, 0, y];
            }
        } else if (side == 'right') {
            var x = rackWidth * (location.x - 0.5);
            var y = rackDepth / 2;
            return [x, 0, y];
        } else {
            var x = rackWidth * (location.x - 0.5);
            var y = rackDepth / 2 + aisleDepth;
            return [x, 0, y];
        }
    }

    var selectHeaderRack = function (callback) {

        var props = [];
        var items = [];
        it.util.dataTypeIterator(function (id, item) {
            if (item.categoryId == it.util.CATEGORY.HEADER_RACK) {

                items.push({
                    value: item.id,
                    label: item.id + (item.description ? item.description : ' ' + item.description)
                })
            }
        })
        props.push({
            label: 'id',
            id: 'id',
            options: 'required:true',
            type: 'select',
            items: items
        });
        var form = util.createForm(props);
        it.util.modal(it.util.i18n("Admin_sceneEditor_Select_header_rack"), form, true, true, function () {
            var bv = $(form).data('bootstrapValidator');
            if (bv && !bv.isValid()) {
                return;
            }
            var params = it.util.getFormData(form);
            callback(params.id);
        });

    }
})
var channelEditor = {};