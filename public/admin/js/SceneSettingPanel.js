function SceneSettingPanel(parent, params) {

    this.parent = parent;

    this.floorData = params;
    this.floorDataType = null;
    this.floorDataModelMap = {};
    this.isShow2D = false;

    this.floorToolMap = {};//新建楼层的工具
    this.sceneToolMap = {};//新建场景的工具

    this.channelRackMap = {};

    this.channelEditor = {};//通道编辑器

    this.init();
}

mono.extend(SceneSettingPanel, Object, {

    init: function () {

        var self = this;


        it.util.loadCategories(function () {
            it.util.loadDataTypes(function () {

                it.util.registerDataType(it.util.dataTypeMap, it.util.categoryMap);
                self.refreshAccordion();
                if (self.floorData && !it.util.isEmptyStr(self.floorData.dataTypeId)) {
                    self.floorDataTypeId = self.floorData.dataTypeId;
                    self.loadFloor();
                } else {
                }
            });
        });

        var $view = this.$view = $('<div class="floorSetting"></div>').appendTo(this.parent);
        var $toolbar = this.$toolbar = $('<div class="toolbar"></div>').appendTo($view);
        var $networkView = this.$networkView = $('<div class="network-view"></div>').appendTo($view);
        //$networkView.width(this.parent.width());
        $networkView.height(650);

        var f = function (label, handle, parent) {
            parent = parent || $toolbar;
            var btn = $('<button type="button" class="btn btn-default">' + label + '</button>').appendTo(parent);
            if (handle) {
                btn.click(function (event) {
                    handle.call(self, btn);
                });
            }
            return btn;
        }

        var ul = function (label, data, handle) {
            var box = $('<span class="dropdown">' +
                '   <button class="btn btn-default dropdown-toggle" ' +
                '       type="button" id="dropdownMenu1" data-toggle="dropdown" ' +
                '       aria-haspopup="true" aria-expanded="true">' + label + '' +
                '      <span class="caret"></span>' +
                '   </button>' +
                '</span>')
            var ul = $(' <ul class="dropdown-menu" aria-labelledby="dropdownMenu1"></ul>').appendTo(box);
            data.forEach(function (item) {
                $('<li><a href="#" data-type="' + item.type + '">' + item.label + '</a></li>').appendTo(ul);
            })
            box.on('click', 'li', function (e) {
                var li = $(this);
                var type = li.find('a').data('type');
                handle.call(self, type, li, e);
            })
            box.appendTo($toolbar);
        }

        f(it.util.i18n("Admin_SceneSettingPanel_Download_DXF"), this.downloadDxf);
        f(it.util.i18n("Admin_SceneSettingPanel_Import_DXF"), this.loadFromDxf);
        f(it.util.i18n("Admin_SceneSettingPanel_Import_JSON"), this.loadFromJson);

        f(it.util.i18n("Admin_SceneSettingPanel_Overview"), this.zoomOverview);

        ul(it.util.i18n("Admin_SceneSettingPanel_Align"), [
                {type: 'up', label: it.util.i18n("Admin_SceneSettingPanel_Up_align")},
                {type: 'down', label: it.util.i18n("Admin_SceneSettingPanel_Down_align")},
                {type: 'left', label: it.util.i18n("Admin_SceneSettingPanel_Left_align")},
                {type: 'right', label: it.util.i18n("Admin_SceneSettingPanel_Right_align")},
                {type: 'center', label: it.util.i18n("Admin_SceneSettingPanel_Horizontal_align")},
                {type: 'middle', label: it.util.i18n("Admin_SceneSettingPanel_Vertical_align")}
            ], function (type) {
                this.sceneEditor.align(type);
            }
        );

        ul(it.util.i18n("Admin_SceneSettingPanel_Layout"), [
            {type: 'hor', label: it.util.i18n("Admin_SceneSettingPanel_Horizontal_distribute")},
            {type: 'ver', label: it.util.i18n("Admin_SceneSettingPanel_Vertical_distribute")},
        ], function (type) {
            var data = sceneEditor.getSelectedData();
            if (data.length < 2) {
                layer.alert(it.util.i18n("Admin_SceneSettingPanel_Select_twice_at_least"))
                return;
            }
            var padding = prompt(it.util.i18n("Admin_SceneSettingPanel_Input_gap"), 5);
            padding = parseFloat(padding) || 5;
            sceneEditor.flow(type, padding);
        });

        ul(it.util.i18n("Admin_SceneSettingPanel_Quick_copy"), [
            {type: 'hor', label: it.util.i18n("Admin_SceneSettingPanel_Horizontal_copy")},
            {type: 'ver', label: it.util.i18n("Admin_SceneSettingPanel_Vertical_copy")},
        ], function (type) {
            var data = sceneEditor.getSelectedData();
            if (data.length != 1) {
                layer.alert(it.util.i18n("Admin_SceneSettingPanel_Select_only_one"))
                return;
            }
            var count = prompt(it.util.i18n("Admin_SceneSettingPanel_Input_copy_times"), 9);
            count = parseFloat(count) || 9;
            sceneEditor.flowAndCopy(type, count);
        });

        var viewGroup = $('<div class="btn-group" role="group" aria-label="'+it.util.i18n("Admin_SceneSettingPanel_View_select")+'" style="margin-left: 10px;"></div>').appendTo($toolbar);
        f('2D', this.show2D, viewGroup);
        f('3D', this.show3D, viewGroup);

        f(it.util.i18n("Admin_SceneSettingPanel_Clear"), this.clear);
        f(it.util.i18n("Admin_SceneSettingPanel_Save_result"), this.save);


        //指定make路径
        make.Default.path = '../modellib/';
        var sceneEditor = this.sceneEditor = new doodle.SceneEditor($networkView);
        sceneEditor.refreshAccordion([]);
        var edit2d = sceneEditor.edit2d;
        var edit3d = sceneEditor.edit3d;
        var jsonBox = sceneEditor.jsonBox;
        sceneEditor.edit2d.network2d.setMinZoom(0.01);
        sceneEditor.setPropertySheetVisible(true); //

        $networkView.on('keydown', function (e) {
            //console.log(e.keyCode);
            if (e.keyCode == 46) {
                if (confirm(it.util.i18n("Admin_SceneSettingPanel_Confirm_delete")+'?')) {
                    var data = sceneEditor.getSelectedData();
                    if (data && data.length > 0) {

                        var delData = [];
                        var delDataType = [];
                        data.forEach(function (item) {
                            if (item.client.persistence) {
                                delData.push({id: item.client.bid});
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
                }
            } else if (e.keyCode == 32) { //空格 旋转
                var node = sceneEditor.box.getSelectionModel().getLastData();
                if (!node) {
                    return;
                }
                var angle = node.getAngle();
                node.setAngle(angle + 90);
            } else if (e.keyCode === 67 && doodle.utils.isCtrlDown(e)) {
                //ctrl+c
                sceneEditor.copySelection();

            } else if (e.keyCode === 86 && doodle.utils.isCtrlDown(e)) {
                //ctrl+v
                sceneEditor.pasteSelection();
            }
        })

        this.show2D();

        this.initEditor();

        it.util.adminApi('tool', 'search', {}, function (result) {
            result.forEach(function (item) {
                item.label = item.description;
                item.icon = make.Default.getIcon(doodle.utils.getSceneEditorModel2dId(item.id));
                if (item.type == 0) {
                    self.floorToolMap[item.id] = item;
                } else {
                    self.sceneToolMap[item.id] = item;
                }
            })
            self.refreshAccordion();
        })
    },

    /**
     * 初始化编辑器
     */
    initEditor: function () {

        var self = this;
        var sceneEditor = this.sceneEditor;

        //复制时,将复制后的对象标记为新建
        sceneEditor.pasteFilter = function (item) {
            item.client.persistence = false;
            item.client.bid = null;
            return item;
        }

        //水平分布时,将复制后的对象标记为新建
        sceneEditor.flowAndCopyFilter = function (item) {
            item.client.persistence = false;
            item.client.bid = null;
            return item;
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

            if (it.util.dataTypeMap && it.util.dataTypeMap[id]) {
                c = it.util.dataTypeMap[id].categoryId;
            }
            if (!label || label.trim().length == 0 || c == it.util.CATEGORY.ROOM) {
                label = data.getClient("label");
            }
            return label;
        }

        /**
         * 默认不能选中楼层
         * @type {*|mono.SelectionModel}
         */
        var sm = sceneEditor.box.getSelectionModel();
        sm.setFilterFunction(function (ele) {
            var id = ele.getClient('id');
            var id3d = doodle.utils.getSceneEditorModel3dId(id);
            var tt = make.Default.getType(id);
            if (tt == 'door' || tt == 'window') {
                return false;
            }
            if (it.util.dataTypeMap[id3d] && it.util.dataTypeMap[id3d].categoryId == 'floor') {
                return false;
            } else if (make.Default.getOtherParameter(id3d, 'sdkCategory') == 'floor') {
                return false;
            } else if (make.Default.getOtherParameter(id3d, 'sdkCategory') == 'floor-child') {
                return false;
            }
            return true;
        });

        /**
         * 禁止移动楼层
         */
        doodle.utils.isMoveModel = function (ele) {

            var id = ele.getClient('id');
            var id3d = doodle.utils.getSceneEditorModel3dId(id);
            var tt = make.Default.getType(id);
            if (tt == 'door' || tt == 'window') {
                return false;
            }
            if (it.util.dataTypeMap[id3d] && it.util.dataTypeMap[id3d].categoryId == 'floor') {
                return false;
            } else if (make.Default.getOtherParameter(id3d, 'sdkCategory') == 'floor') {
                return false;
            } else if (make.Default.getOtherParameter(id3d, 'sdkCategory') == 'floor-child') {
                return false;
            }
            return true;
        }

        /**
         * 双击通道, 弹出编辑通道界面
         * @param element
         * @param box
         */
        sceneEditor.doubleClickHandler2D = function (element, box) {
            if (!element) return;
            if ('rack' == element.getClient('type') && element.getClient('persistence') && doodle.consts.REDIRECT_RACK_EDITOR) {

            } else if ('channel' == element.getClient('type')) {
                //FIXME 进入通道编辑模式
                self.openChannelEditorDialog(element);
            }
        }

        //更新左侧工具栏
        this.refreshAccordion();
    },

    downloadDxf: function () {
        window.open('/resource/dxf/itv.dxf');
    },

    /**
     * 更新工具栏
     */
    refreshAccordion: function () {
        var self = this;
        var hideCategories = ['building', 'card', 'datacenter', 'earth'
            , 'equipment', 'link', 'port', 'floor'];
        var accData = new doodle.AccordionData();
        accData.filterModel = function (m) {

            if (make.Default.getOtherParameter(m, 'categoryId') == 'room') {
                return false;
            }
            var acc = !!make.Default.getOtherParameter(m, 'acc');
            return acc;
        }
        var data = accData.getData();
        var tools = [];
        var keys = Object.keys(this.sceneToolMap);
        keys.forEach(function (key) {
            tools.push(self.sceneToolMap[key])
        })
        data.splice(0, 0, {
            title: it.util.i18n("Admin_SceneSettingPanel_Create"),
            contents: tools,
        })
        this.sceneEditor.refreshAccordion(data);
    },

    /**
     * 显示2D界面
     */
    show2D: function () {
        if (this.isShow2D) {
            return;
        }
        this.isShow2D = true;
        this.sceneEditor.hide3D();
        this.sceneEditor.show2D();
    },

    /**
     * 显示3D界面
     */
    show3D: function () {
        if (!this.isShow2D) {
            return;
        }
        this.isShow2D = false;
        this.sceneEditor.hide2D();
        this.sceneEditor.show3D();
    },

    /**
     * 清除编辑器
     */
    clear: function () {

        var self = this;
        layer.confirm(it.util.i18n("Admin_SceneSettingPanel_Confirm_Clear")+'?', {}, function (index) {

            layer.close(index);
            self.clearContent();
        });
    },

    clearContent: function () {
        this.channelRackMap = {};
        var removeData = [];
        var data = this.sceneEditor.getData();
        for (var i = 0; i < data.length; i++) {
            if (!this.floorDataModelMap[data[i].id]) {
                removeData.push(data[i]);
            }
        }
        this.sceneEditor.removeData(removeData);
    },

    /**
     * 保存标记结果
     */
    save: function () {

        var self = this;
        var sceneEditor = this.sceneEditor;
        sceneEditor.box.getSelectionModel().clearSelection();//清空选择,不然在外面粘贴会影响画布
        var channelRackMap = this.channelRackMap;
        try {
            var data = sceneEditor.getData(true);
            for (var p in channelRackMap) {
                channelRackMap[p].forEach(function (item) {
                    var d = self.toMakeDataAction(item, item.isNew);
                    data.push(d)
                });
            }
            var saveSceneDialog = window.saveSceneDialog = new SaveSceneDialog(data, this.floorData, function () {
                sceneEditor.clear();
                it.util.loadDataTypes(function () {
                    it.util.adminApi('data', 'get', {id: self.floorData.id}, function (r) {
                        if (r) {
                            self.floorData = r;
                            self.openScene(r);
                        } else {
                            layer.alert(it.util.i18n("Admin_SceneSettingPanel_Floor_deleted"))
                        }
                    })
                })
            }, {type: 'scene'});
            saveSceneDialog.show();
        } catch (e) {
            alert(e);
            throw e;
            return;
        }
    },

    /**
     * 加载选中的楼层
     */
    load: function () {


    },

    zoomOverview: function () {
        this.sceneEditor.zoomOverview();
    },

    /**
     * 加载楼层
     */
    loadFloor: function () {
        var self = this;
        self.sceneEditor.clear();
        this.openScene(this.floorData);
    },

    openScene: function (floorData) {

        var self = this;
        var sceneEditor = this.sceneEditor;
        var dataType = this.floorDataType = it.util.dataTypeMap[floorData.dataTypeId];
        if (!dataType) {
            layer.alert(it.util.i18n("Admin_SceneSettingPanel_Edit_floor_style"));
            return;
        }
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
        this.floorDataModelMap = {};
        floorArgs.forEach(function (item) {
            self.floorDataModelMap[item.id] = item;
        })
        sceneEditor.clear();
        sceneEditor.setData(floorArgs, true);
        self.loadChildren(floorData, function (floorChildren) {
            floorChildren.forEach(function (child) {

                var childCategoryId = it.util.dataTypeMap[child.dataTypeId].categoryId;
                if (childCategoryId == it.util.CATEGORY.ROOM || childCategoryId == it.util.CATEGORY.CHANNEL) {
                    self.loadChildren(child, function (childChildren) {
                        childChildren.forEach(function (childChild) {

                            var childChildCategoryId = it.util.dataTypeMap[childChild.dataTypeId].categoryId;
                            if (childChildCategoryId == it.util.CATEGORY.CHANNEL) {
                                self.loadChildren(childChild, function (childChildChildren) {
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
    },


    /**
     * 加载孩子
     * @param data
     */
    loadChildren: function (data, callback) {

        var self = this;
        it.util.adminApi('data', 'search', {parentId: data.id}, function (r) {

            //如果父亲是通道,直接绘制到通道里面
            if (it.util.dataTypeMap[data.dataTypeId].categoryId == it.util.CATEGORY.CHANNEL) {

                self.channelRackMap[data.id] = r; //保存机柜列表
                var node = self.sceneEditor.findByBID(data.id);
                if (node) {
                    r.forEach(function (item) {
                        node.setClient(item.location.z + '-' + item.location.x, item.id)
                    })
                }
            } else {
                var children = self.toMakeData(data, r);
                self.sceneEditor.setData(children, true);
                callback && callback(r);
            }
        })
    },

    /**
     * 数据转换成make的格式
     * @param dataArray
     * @returns {Array}
     */
    toMakeData: function (parentData, dataArray) {

        var self = this;
        var parentDataTypeId = parentData.dataTypeId;
        var parentDataType = it.util.dataTypeMap[parentDataTypeId];
        var result = [];

        it.util.parseDataPositionAndLocation(parentData);
        parentData.position = parentData.position || {x: 0, y: 0, z: 0};
        dataArray.forEach(function (data) {
            var dataTypeId = data.dataTypeId;
            if (make.Default.getCreator(dataTypeId)) {
                data.rotation = data.rotation || {x: 0, y: 0, z: 0};
                var position = self.getMakePosition(data, parentData, parentDataType);
                var m = self.toMakeDataAction(data);
                m.position = position;
                result.push(m);
            }
        })
        return result;
    },

    /**
     * 转换成make格式
     * @param data
     * @param isNew
     * @returns {{}}
     */
    toMakeDataAction: function (data, isNew) {
        var m = {};
        var dataTypeId = data.dataTypeId;
        data.rotation = data.rotation || {x: 0, y: 0, z: 0}
        make.Default.copyProperties({
            id: dataTypeId,
            objectId: data.id,
            name: data.id,
            parentId: data.parentId,
            rotation: [data.rotation.x, data.rotation.y, data.rotation.z],
            client: {
                parentId: data.parentId,
                bid: isNew ? '' : data.id,
                persistence: !isNew, //是否已经保存的
                label: it.util.getLabel(it.util.dataTypeMap[dataTypeId]),

            }
        }, m)
        make.Default.copyProperties(data.client, m.client);
        make.Default.copyProperties(data.style, m.style);
        make.Default.copyProperties(it.util.dataTypeMap[dataTypeId].modelParameters, m);
        make.Default.copyProperties({client: it.util.dataTypeMap[dataTypeId].modelParameters}, m);
        if (data.position) {
            m.position = [data.position.x, data.position.y, data.position.z];
        }
        if (data.location) {
            m.location = [data.location.x, data.location.y, data.location.z];
        }
        return m;
    },

    /**
     * 是否是空字符串
     * @param n
     * @returns {boolean}
     */
    isEmpty: function (n) {
        return n === undefined || n === null || (n + '').trim().length === 0;
    },

    /**
     * 换算成doodle的坐标
     * @param childData
     * @param parentData
     * @param parentDataType
     * @returns {*[]}
     */
    getMakePosition: function (childData, parentData, parentDataType) {

        var self = this;
        it.util.parseDataPositionAndLocation(childData);
        var x, y, z;
        //
        if (parentDataType.childrenSize && parentDataType.childrenSize != '' && parentDataType.childrenSize.x && parentDataType.childrenSize.z) {
            //逻辑坐标
            if (childData.location) {

                //如果父亲是楼层或者是机房,根据bounding计算逻辑坐标
                if (parentDataType.categoryId == it.util.CATEGORY.FLOOR || parentDataType.categoryId == it.util.CATEGORY.ROOM) {
                    if (!self.isEmpty(childData.location.x) || !self.isEmpty(childData.location.z)) {
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
                            if (!self.isEmpty(childData.location.x)) {
                                x = bounding.dx * childData.location.x;
                            }
                            if (!self.isEmpty(childData.location.y)) {
                                y = childData.location.y;
                            }
                            if (!self.isEmpty(childData.location.z)) {
                                z = bounding.dz * childData.location.z;
                            }
                        }
                    }
                } else if (parentDataType.categoryId == it.util.CATEGORY.CHANNEL) {
                    //FIXME 因为通道可能有旋转之类的,很难做到里面机柜位置的计算,暂时不加载通道里面的机柜,只在通道的对应位置上显示机柜编号
                    console.warn(it.util.i18n("Admin_SceneSettingPanel_Load_tip"));
                }
            }
        }

        //物理坐标
        if (childData.position) {

            //物理坐标
            if (self.isEmpty(x) && !self.isEmpty(childData.position.x)) {
                x = childData.position.x;
            }
            if (self.isEmpty(y) && !self.isEmpty(childData.position.y)) {
                y = childData.position.y;
            }
            if (self.isEmpty(z) && !self.isEmpty(childData.position.z)) {
                z = childData.position.z;
            }
        }
        if (self.isEmpty(x)) {
            x = 0;
            console.warn('error position X:', childData, 'parentData', parentData, 'parentDataType', parentDataType);
        }
        if (self.isEmpty(y)) {
            y = 0;
            console.warn('error position Y:', childData, 'parentData', parentData, 'parentDataType', parentDataType);
        }
        if (self.isEmpty(z)) {
            z = 0;
            console.warn('error position Z:', childData, 'parentData', parentData, 'parentDataType', parentDataType);
        }
        if (y == 'neg_neg') {
            y = 'floor-top';
        }

        return [x, y, z];
    },

    /**
     * 从DXF加载
     */
    loadFromDxf: function () {

        var self = this;
        //import dxf
        this.loadFromFile('Import DXF', 'dxf', function (text) {

            self.clearContent();

            self.sceneEditor.loadDxfFile(text, function (jsonArray) {
                var result = [];
                jsonArray.forEach(function (item) {
                    if (!self.floorToolMap[item.id] && (it.util.dataTypeMap[item.id] || self.sceneToolMap[item.id])) {
                        result.push(item);
                    } else {
                        console.warn(it.util.i18n("Admin_SceneSettingPanel_Import_DXF_exception")+':' + item.id)
                    }
                })
                return result;
            });
            //FIXME 计算通道里面的机柜
            //等待画面稳定
            setTimeout(function () {
                self.resetChannelRack();
            }, 550);
        });
    },

    /**
     * 从json加载
     */
    loadFromJson: function () {

        var self = this;
        //import json
        this.loadFromFile('Import JSON', 'json', function (text) {

            self.clearContent();

            var jsonArray = it.util.s2o(text);
            var result = [];
            jsonArray.forEach(function (item) {
                if (!self.floorToolMap[item.id] && (it.util.dataTypeMap[item.id] || self.sceneToolMap[item.id])) {
                    result.push(item);
                } else {
                    console.warn(it.util.i18n("Admin_SceneSettingPanel_Import_JSON_exception")+':' + item.id)
                }
            })
            self.sceneEditor.setData(result);
        });
    },

    /**
     * 从文件上加载
     * @param title
     * @param suffix
     * @param callback
     */
    loadFromFile: function (title, suffix, callback) {

        var self = this;
        var box = $('<div style="padding-left: 20px;padding-top: 10px"></div>').appendTo($('body'));
        $('<span>'+it.util.i18n("Admin_SceneSettingPanel_Select_file")+'</span><br>').appendTo(box);
        var file = $('<input type="file"><br>').appendTo(box);
        var index = layer.open({
            type: 1,
            title: title,
            shadeClose: true,
            content: box,
            end: function () {
                layer.close(index);
                box.remove();
            }
        });
        file.on('change', function () {
            var files = this;
            if (files.files && files.files.length > 0) {
                var file = files.files[0];
                if (file.name.indexOf(".") > 0) {
                    var fi = file.name.split(".");
                    if (fi[1] != suffix) {
                        alert('file format should be ' + suffix);
                        return;
                    }
                    var reader = new FileReader();
                    reader.readAsText(file);
                    reader.onloadend = function () {
                        if (reader.error) {
                            console.error(reader.error);
                        } else {
                            layer.close(index);
                            box.remove();
                            if (callback) {
                                callback(reader.result);
                            }
                        }
                    }
                }
            }
        })
    },

    resetChannelRack: function () {

        var self = this;
        var sceneEditor = this.sceneEditor;
        this.channelRackMap = {};
        var removeRacks = [];
        var list = sceneEditor.getData();
        list.forEach(function (item) {
            if (self.isChannel(item.id)) {

                //如果是通道
                var channelNode = sceneEditor.edit2d.box.getDataById(item.objectId);
                if (!channelNode) {
                    console.error(it.util.i18n("Admin_SceneSettingPanel_Not_find_channel"), item, channelNode);
                    return;
                }
                var channelNodeId = channelNode.getId();
                var rackArray = [];
                self.channelRackMap[channelNodeId] = rackArray; //保存机柜列表
                var isSingle = true;
                var maxX = 1;
                var racks = channelNode.getFollowers();
                if (!racks || racks.size() == 0) {
                    console.error(it.util.i18n("Admin_SceneSettingPanel_Not_exist_racks_in_channel"), item, channelNode, racks);
                    return;
                } else {
                    racks.forEach(function (rack) {

                        var loc = self.getRackLoc(channelNode, rack);
                        var rackItem = {
                            id: doodle.id(),
                            dataTypeId: rack.getClient('id'),
                            location: {x: loc.x, y: 'floor-top', z: loc.y},
                            client: {
                                loc: loc.y + '-' + loc.x,
                            },
                            parentId: channelNodeId,
                            isNew: true,
                        }
                        //console.log('rack', rack, rackItem);
                        var rackDataType = it.util.dataTypeMap[rackItem.dataTypeId];
                        var label = it.util.getLabel(rackDataType);
                        channelNode.setClient(rackItem.location.z + '-' + rackItem.location.x, label);
                        rackArray.push(rackItem);
                        removeRacks.push(rack);

                        isSingle = isSingle && loc.y != 1;
                        maxX = Math.max(maxX, loc.x);
                    });

                }

                if (self.isNewChannel(item.id)) {
                    var size = {width: 60, height: 110};
                    if (racks && racks.size() > 0) {
                        var rack = racks.get(0);
                        size = rack.getSize();
                    }
                    var rackWidth = size.width || 60,
                        rackHeight = 220,
                        rackDepth = size.height || 110,
                        rackNumber = isSingle ? maxX : maxX * 2,
                        aisleDepth = 110,
                        side = 'right';
                    channelNode.rackWidth = rackWidth;
                    channelNode.rackHeight = rackHeight;
                    channelNode.rackDepth = rackDepth;
                    channelNode.rackNumber = rackNumber;
                    channelNode.aisleDepth = aisleDepth;
                    channelNode.isSingle = isSingle;
                    channelNode.side = side;
                    channelNode.setClient('isNewChannelType', true);
                    channelNode.setClient('modelParameters', {
                        rackWidth: channelNode.rackWidth,
                        rackHeight: channelNode.rackHeight,
                        rackDepth: channelNode.rackDepth,
                        rackNumber: channelNode.rackNumber,
                        aisleDepth: channelNode.aisleDepth,
                        isSingle: channelNode.isSingle,
                        side: channelNode.side,
                    });
                }
            }
        })
        removeRacks.forEach(function (rack) {
            sceneEditor.edit2d.box.remove(rack);
        })
    },

    /**
     * 根据通道节点和机柜节点,计算除机柜的逻辑位置.
     * @param channelNode
     * @param rackNode
     * @returns {{x: number, y: number}}
     */
    getRackLoc: function (channelNode, rackNode) {
        //计算新的顶点坐标
        var channelLocation = channelNode.getLocation();
        var channelCenterLocation = channelNode.getCenterLocation();
        var angle = (channelNode.getAngle() + 360) % 180;
        var rad = angle / 180 * Math.PI;
        channelLocation = doodle.utils.rotatePoint(channelLocation, rad, channelCenterLocation);

        var rackCenterLocation = rackNode.getCenterLocation();

        var channelSize = channelNode.getSize();
        var rackSize = rackNode.getSize();
        var result = {x: 0, y: 0};

        //只能正负90旋转
        var angleTemp = angle % 180;
        var offset = 0.1;
        if (channelNode.isSingle) {
            //如果是但通道,位置使用是1
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
    },

    isChannel: function (id) {
        if (it.util.dataTypeMap[id] && it.util.dataTypeMap[id].categoryId == it.util.CATEGORY.CHANNEL) {
            return true;
        }
        var category = make.Default.getOtherParameter(id, 'sdkCategory');
        return category == 'channel'
    },

    isNewChannel: function (id) {
        if (it.util.dataTypeMap[id]) {
            return false;
        }
        var category = make.Default.getOtherParameter(id, 'sdkCategory');
        return category == 'channel'
    },

    /**
     * 打开编辑通道里面机柜的弹框
     * @param channelNode
     */
    openChannelEditorDialog: function (channelNode) {

        var self = this;
        var sceneEditor = this.sceneEditor;
        var channelEditor = this.channelEditor;

        var nodeSize = channelNode.getSize();
        var zoom = 1;
        var toolbarHeight = 35;
        var editorBoxPadding = 5;
        var boxWidth = nodeSize.width * zoom + editorBoxPadding * 8;
        var boxHeight = nodeSize.height * zoom + editorBoxPadding * 4 + toolbarHeight;
        var editorBox = channelEditor.networkBox = $('<div class="channelEditor"></div>');
        editorBox.width(boxWidth);
        editorBox.height(boxHeight);


        var toolbar = $('<div class="toolbar"></div>').appendTo(editorBox);
        toolbar.height(toolbarHeight);

        var fillRackButton = $('<div class="btn-group"><button class="btn btn-default dropdown-toggle" ' +
            'data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+it.util.i18n("Admin_SceneSettingPanel_Fill_rack")+'<span class="caret"></span></button></div>').appendTo(toolbar);
        var fillRackButtonUL = $('<ul class="dropdown-menu"></ul>').appendTo(fillRackButton);
        it.util.dataTypeIterator(function (id, item) {
            if (item.categoryId == it.util.CATEGORY.RACK) {
                fillRackButtonUL.append('<li><a href="#" id="' + id + '">' + it.util.getLabel(item) + '</a></li>')
            }
        })


        var deleteRackButton = $('<input type="button" class="btn btn-default" value="'+it.util.i18n("Admin_SceneSettingPanel_Delete_rack")+'">').appendTo(toolbar);

        var networkBox = $('<div class="networkBox"></div>').appendTo(editorBox);
        networkBox.css('top', toolbarHeight + editorBoxPadding + editorBoxPadding + editorBoxPadding);
        networkBox.width(boxWidth);
        networkBox.height(boxHeight);

        if (channelEditor.network) {
            channelEditor.box.clear();
            channelEditor.network.dispose();
        }
        var network = channelEditor.network = new twaver.vector.Network();
        network.setZoom(zoom);
        network.setWheelToZoom(false);
        var box = channelEditor.box = network.getElementBox();
        var sm = channelEditor.sm = box.getSelectionModel();

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
        node.setLocation(0, 0);
        node.setLayerId('channelLayerId');
        box.add(node);

        var realId = channelNode.getClient('persistence') ? channelNode.getClient('bid') : channelNode.getId();
        var racks = self.channelRackMap[realId];
        if (!racks) {
            racks = self.channelRackMap[realId] = [];
        }
        if (racks) {
            racks.forEach(function (item) {
                item.client = item.client || {};
                item.client.loc = item.location.z + '-' + item.location.x;
                self.loadRackInChannel(box, node, item);
            })
        }

        //如果已经保存,显示dataId, 否则显示类型的信息
        var label = '';
        if (channelNode.getClient('isNewChannelType')) {
            label = it.util.i18n("Admin_SceneSettingPanel_Create_channel")+'-' + (channelNode.isSingle ? 1 : 2) + '-' + channelNode.rackNumber;
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
            if (confirm(it.util.i18n("Admin_SceneSettingPanel_include_header_rack_or_not"))) {
                self.selectHeaderRack(function (headerRackTypeId) {
                    fillRackAction(rackTypeId, headerRackTypeId);
                })
            } else {
                fillRackAction(rackTypeId);
            }
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
                                location: {x: x, y: 'floor-top', z: z},
                                client: {
                                    loc: z + '-' + x,
                                },
                                parentId: realId,
                            }
                            item.isNew = true;
                            self.loadRackInChannel(box, node, item);
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
                            location: {x: x, y: 'floor-top', z: 1},
                            client: {
                                loc: 1 + '-' + x,
                            },
                            parentId: realId,
                        }
                        item.isNew = true;
                        self.loadRackInChannel(box, node, item);
                        racks.push(item);
                        channelNode.setClient(item.client.loc, label);
                    }
                }
            }
            self.channelRackMap[realId] = racks;
        }

        //点击删除机柜按钮
        deleteRackButton.on('click', function () {
            var list = sm.getSelection().toList();
            if (list.size() > 0 && confirm(it.util.i18n("Admin_SceneSettingPanel_Confirm_delete_rack")+'?')) {
                var deletes = [];
                list.forEach(function (item) {
                    if (!item.isNew) {
                        deletes.push({id: item.getId()})
                    }
                });
                it.util.adminApi('data', 'batchRemove', deletes, function () {

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
                })
            }
        })

        //弹出通道编辑器对话框
        var modal = channelEditor.modal = util.modal('channelEditor', editorBox, true, true, function () {
            console.log('channelEditor submit ...');
        });

        modal.find('.modal-dialog').width(boxWidth + 5);

        setTimeout(function () {
            var bounds = {x: 13, y: 5, width: nodeSize.width * zoom + 30, height: nodeSize.height * zoom + 15};
            network.adjustBounds(bounds);
            network.setScrollBarVisible(false)
        }, 1000)
        return modal;
    },

    /**
     * 加载机柜
     * @param box
     * @param node
     * @param item
     * @param isNew
     */
    loadRackInChannel: function (box, node, item) {
        var self = this;
        node.setClient(item.location.z + '-' + item.location.x, item.id);
        var position = self.getRackPosition(node, item);
        var m = self.toMakeDataAction(item, item.isNew);
        m.position = position;
        m.id = doodle.utils.getSceneEditorModel2dId(m.id);
        var rackNode = make.Default.load(m);
        rackNode.setLayerId('rackLayerId');
        box.add(rackNode);
        rackNode.setClient('data', item);
    },

    /**
     * 计算2D机柜位置
     * @param channelNode
     * @param rackNodeInfo
     * @returns {*[]}
     */
    getRackPosition: function (channelNode, rackNodeInfo) {

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
    },

    selectHeaderRack: function (callback) {

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
        it.util.modal(it.util.i18n("Admin_SceneSettingPanel_Select_header_rack"), form, true, true, function () {
            var bv = $(form).data('bootstrapValidator');
            if (bv && !bv.isValid()) {
                return;
            }
            var params = it.util.getFormData(form);
            callback(params.id);
        });

    }
});