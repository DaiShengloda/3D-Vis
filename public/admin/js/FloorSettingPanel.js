function FloorSettingPanel(parent, params) {

    this.parent = parent;

    this.floorData = params;
    this.floorDataType = null;
    this.isShow2D = false;

    this.toolMap = {};

    this.init();
}

mono.extend(FloorSettingPanel, Object, {

    init: function () {

        var self = this;


        it.util.loadCategories(function () {
            it.util.loadDataTypes(function () {
                //it.util.registerDataType(it.util.dataTypeMap, it.util.categoryMap);
                if (self.floorData && !it.util.isEmptyStr(self.floorData.dataTypeId)) {
                    self.floorDataTypeId = self.floorData.dataTypeId;
                    self.loadFloor();
                    self.resetFloorSelect(it.util.dataTypeMap[self.floorData.dataTypeId]);
                } else {
                    self.resetFloorSelect();
                }
            });
        });

        var $view = this.$view = $('<div class="floorSetting"></div>').appendTo(this.parent);
        var $toolbar = this.$toolbar = $('<div class="toolbar"></div>').appendTo($view);
        var $networkView = this.$networkView = $('<div class="network-view"></div>').appendTo($view);
        //$networkView.width(this.parent.width());
        $networkView.height(650);


        var label = $('<label>'+it.util.i18n("Admin_FloorSettingPanel_Select_floor")+'</label>').appendTo($toolbar);
        var floorDataTypeSelect = this.floorDataTypeSelect = $('<select class="form-control"></select>'); //<option value="'+val.value+'">'+util.i18n(val.label)+'</option>
        floorDataTypeSelect.css('display', 'inline').css('width', '150px');
        floorDataTypeSelect.appendTo($toolbar);

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

        f(it.util.i18n("Admin_FloorSettingPanel_Load_floor"), this.load);
        f(it.util.i18n("Admin_FloorSettingPanel_Download_DXF"), this.downloadDxf);
        f(it.util.i18n("Admin_FloorSettingPanel_Import_DXF"), this.loadFromDxf);
        f(it.util.i18n("Admin_FloorSettingPanel_Import_JSON"), this.loadFromJson);

        f(it.util.i18n("Admin_FloorSettingPanel_Overview"), this.zoomOverview);

        var viewGroup = $('<div class="btn-group" role="group" aria-label="'+it.util.i18n("Admin_FloorSettingPanel_View_select")+'" style="margin-left: 10px;"></div>').appendTo($toolbar);
        f('2D', this.show2D, viewGroup);
        f('3D', this.show3D, viewGroup);

        f(it.util.i18n("Admin_FloorSettingPanel_Clear"), this.clear);
        f(it.util.i18n("Admin_FloorSettingPanel_Save_result"), this.save);


        //指定make路径
        make.Default.path = '../modellib/';
        var sceneEditor = this.sceneEditor = new doodle.SceneEditor($networkView);
        //sceneEditor.setAccordionVisible(false);
        var edit2d = sceneEditor.edit2d;
        var edit3d = sceneEditor.edit3d;
        var jsonBox = sceneEditor.jsonBox;
        sceneEditor.edit2d.network2d.setMinZoom(0.01);
        sceneEditor.setPropertySheetVisible(false);

        $networkView.on('keydown', function (e) {
            console.log(e.keyCode);
            if (e.keyCode == 46) {
                var node = sceneEditor.getSelectedNode();
                if (node.length && confirm(it.util.i18n("Admin_FloorSettingPanel_Confirm_delete")+'?')) {

                    sceneEditor.removeNode(node);
                }
            }
        })

        this.show2D();

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


        it.util.adminApi('tool', 'search', {type: 0}, function (result) {
            var tools = result;
            tools.forEach(function (item) {

                self.toolMap[item.id] = item;
                item.label = item.description;
                item.icon = make.Default.getIcon(doodle.utils.getSceneEditorModel2dId(item.id));
            })
            var data = {
                title: it.util.i18n("Admin_FloorSettingPanel_Create"),
                contents: tools,
            }
            sceneEditor.refreshAccordion([data]);
        })


    },

    downloadDxf: function () {
        window.open('/resource/dxf/itv.dxf');
    },

    resetFloorSelect: function (data) {
        var self = this;
        this.floorDataTypeSelect.empty();
        it.util.adminApi('datatype', 'search', {categoryId: it.util.CATEGORY.FLOOR}, function (r) {
            r.forEach(function (item) {
                var label = it.util.getLabel(item);
                var selected = '';
                if (data && data.id == item.id) {
                    selected = 'selected'
                }
                $('<option ' + selected + ' value="' + item.id + '">' + label + '</option>').appendTo(self.floorDataTypeSelect);
            })
        })
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
        layer.confirm(it.util.i18n("Admin_FloorSettingPanel_Confirm_clear")+'?', {}, function (index) {

            layer.close(index);
            self.sceneEditor.clear();
        });
    },

    /**
     * 保存标记结果
     */
    save: function () {

        //移除 objectId 和 parentId
        function removeInfo(data) {
            var self = this;
            data.forEach(function (d) {
                delete d['objectId'];
                delete d['parentId'];
                if (data.children) {
                    removeInfo(data.children)
                }
            })
        }

        var self = this;
        this.sceneEditor.box.getSelectionModel().clearSelection();//清空选择,不然在外面粘贴会影响画布
        var modelParameters = this.sceneEditor.getData();
        if (!modelParameters || modelParameters.length == 0) {
            layer.alert(it.util.i18n("Admin_FloorSettingPanel_Add_floor"));
            return;
        }
        var floorCount = 0;
        modelParameters.forEach(function (item) {
            if (make.Default.getOtherParameter(item.id, 'type') == 'wall') {
                floorCount++;
                //去掉外墙的位置信息
                delete item['position']
            }
        })

        if (floorCount > 1) {
            layer.alert(it.util.i18n("Admin_FloorSettingPanel_Remove_floor"));
            return;
        }
        if (floorCount == 0) {
            layer.alert(it.util.i18n("Admin_FloorSettingPanel_Add_floor"));
            return;
        }
        modelParameters.sort(function (o1, o2) {
            if (make.Default.getOtherParameter(o1.id, 'sdkCategory') == 'floor') {
                return -1;
            } else {
                return 1;
            }
        });
        removeInfo(modelParameters);
        var $form = $('<form style="padding-left: 20px;padding-right: 20px;padding-top: 10px"></form>').appendTo($('body'));
        $('<div class="form-group"><label for="id">'+it.util.i18n("Admin_FloorSettingPanel_ID")+'</label><input type="text" class="form-control" name="id" id="id" placeholder="'+it.util.i18n("Admin_FloorSettingPanel_Floor_type_ID")+'"></div>').appendTo($form);
        $('<div class="form-group"><label for="description">'+it.util.i18n("Admin_FloorSettingPanel_Description")+'</label><input type="text" class="form-control" name="description" id="description" placeholder="'+it.util.i18n("Admin_FloorSettingPanel_Floor_description")+'"></div>').appendTo($form);
        $('<div class="form-group"><label for="modelParameters">'+it.util.i18n("Admin_FloorSettingPanel_Param")+'</label><textarea type="text" class="form-control" style="height: 100px;" name="modelParameters" id="modelParameters" placeholder="'+it.util.i18n("Admin_FloorSettingPanel_Floor_param")+'"></textarea></div>').appendTo($form);
        var params = {};
        if (this.floorDataType) {
            params = {id: this.floorDataType.id, description: this.floorDataType.description};
        } else if (this.floorData) {
            params = {id: this.floorData.id, description: this.floorData.description};
        }
        params.modelParameters = modelParameters;
        it.util.setBoxModel($form, params);
        var formIndex = layer.open({
            type: 1,
            title: it.util.i18n("Admin_FloorSettingPanel_Save_inspection_path"),
            skin: 'layui-layer-rim', //加上边框
            area: ['500px', '410px'], //宽高
            content: $form,
            btn: [it.util.i18n("Admin_FloorSettingPanel_Save"), it.util.i18n("Admin_FloorSettingPanel_Cancel"),],
            yes: function (index, layero) {
                var model = it.util.getBoxModel($form);
                var id = model.id;
                if (!id || id.trim() == '') {
                    layer.open({
                        title: 'error',
                        content: it.util.i18n("Admin_FloorSettingPanel_Input_ID")
                    });
                    return false;
                }
                var model = it.util.getBoxModel($form);
                model.modelParameters = it.util.s2o(model.modelParameters);

                model.categoryId = it.util.CATEGORY.FLOOR;
                model.model = 'twaver.combo';
                console.log(model);
                util.adminApi('datatype', 'addOrUpdate', model, function (r) {

                    var dataTypeId = model.id;
                    if (self.floorData) {
                        var data = {
                            options: {
                                id: self.floorData.id,

                            },
                            value: {
                                dataTypeId: dataTypeId
                            }
                        }
                        util.adminApi('data', 'update', data, function (r) {
                            layer.open({
                                title: it.util.i18n("Admin_FloorSettingPanel_Success"),
                                content: it.util.i18n("Admin_FloorSettingPanel_Add_success")
                            });
                            layer.close(index);
                        })
                    } else {

                        layer.open({
                            title: it.util.i18n("Admin_FloorSettingPanel_Success"),
                            content: it.util.i18n("Admin_FloorSettingPanel_Add_success")
                        });
                        layer.close(index);
                    }

                    it.util.loadDataTypes(function () {
                        console.log(it.util.i18n("Admin_FloorSettingPanel_Refresh_list"))
                        self.loadFloor();
                    });
                    self.resetFloorSelect(self.floorDataType);
                });
            },
            cancel: function (index, layero) {
                layer.close(index);
            },
            end: function () {
                $form.remove();
            }
        });

    },

    /**
     * 加载选中的楼层
     */
    load: function () {

        var self = this;
        var floorDataTypeId = this.floorDataTypeSelect.val();
        this.floorDataTypeId = floorDataTypeId;
        this.loadFloor();
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
        it.util.adminApi('datatype', 'get', {id: this.floorDataTypeId}, function (floorDataType) {
            self.floorDataType = floorDataType;
            if (floorDataType) {
                //编辑楼层
                var floorParams = self.floorDataType.modelParameters;
                if (floorParams && floorParams.length > 0) {
                    self.sceneEditor.setData(floorParams);
                    setTimeout(function () {
                        self.sceneEditor.zoomOverview();
                    }, 500)
                }
            } else {
                //新建楼层
            }
        })
    },

    /**
     * 从DXF加载
     */
    loadFromDxf: function () {

        var self = this;
        //import dxf
        this.loadFromFile('Import DXF', 'dxf', function (text) {

            self.sceneEditor.clear();
            self.sceneEditor.loadDxfFile(text, function (jsonArray) {
                var result = [];
                jsonArray.forEach(function (item) {
                    if (self.toolMap[item.id]) {
                        result.push(item);
                    }
                })
                return result;
            });
        });
    },

    /**
     * 从json加载
     */
    loadFromJson: function () {

        var self = this;
        //import json
        this.loadFromFile('Import JSON', 'json', function (text) {
            self.sceneEditor.clear();

            var jsonArray = it.util.s2o(text);
            var result = [];
            jsonArray.forEach(function (item) {
                if (self.toolMap[item.id]) {
                    result.push(item);
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
        $('<span>'+it.util.i18n("Admin_FloorSettingPanel_Select_file")+'</span><br>').appendTo(box);
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
    }
});