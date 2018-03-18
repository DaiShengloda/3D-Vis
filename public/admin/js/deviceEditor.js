$(function () {

    //指定make路径
    it.util.setLanguage('zh');
    make.Default.path = '../modellib/';

    //取得显示编辑器的容器jquery对象
    var parentView = $('.main');

    //实例化doodle.DeviceEditor对象
    var deviceEditor = window.deviceEditor = new doodle.DeviceEditor(parentView);
    //设备面板最小吸附单位为0.5
    deviceEditor.network2d.setPositionMagneticX(0.5);
    deviceEditor.network2d.setPositionMagneticY(0.5);
    //导出设备不需要导出objectId
    make.Default.EXPORT_OBJECT_ID = false;
    deviceEditor.onDropHandler = function (e, data, box, network) {
        return
    }

    deviceEditor.adjustBounds({
        top: 0,
        bottom: 0,
    });

    var box = deviceEditor.network2d.getElementBox();
    // box.addDataBoxChangeListener(function(e){
    //     if(e.kind == 'remove'){
    //         console.log('aaa');
    //     }
    // });

    //视图, 负责各种缩放
    $('#view').on('click', 'li', function () {
        var type = $(this).find('a').data('type');
        if (deviceEditor.network2d[type]) {
            deviceEditor.network2d[type]();
        }
    })

    //拖拽模式（默认）／框选模式  true-拖拽模式 false-框选模式
    //开启鼠标编辑（默认）／关闭鼠标编辑 true-开启鼠标编辑 false-关闭鼠标编辑
    $('#mouse').on('click', 'li', function () {

        var type = $(this).find('a').data('type');
        if (type == 'pan') {
            deviceEditor.network2d.setDragToPan(true);
        } else if (type == 'select') {
            deviceEditor.network2d.setDragToPan(false);
        } else if (type == 'editable') {
            deviceEditor.setMouseEditable(true);
        } else if (type == 'normal') {
            deviceEditor.setMouseEditable(false);
        }

    });

    //对齐方式,调用align(type)方法，实现选中元素的对齐。type取值范围:up、down、left、right、center、middle
    $('#alignment').on('click', 'li', function (e) {
        var type = $(this).find('a').data('type');
        deviceEditor.align(type);
    });

    //分布方式,调用flow(type, padding),实现选中元素的均匀分布. type取值范围:hor、ver
    $('#layout').on('click', 'li', function (e) {
        var type = $(this).find('a').data('type');
        var padding = prompt(it.util.i18n("Admin_deviceEditor_Input_gap"), 5);
        padding = parseFloat(padding);
        if (isNaN(padding)) {
            return;
        }
        deviceEditor.flow(type, padding);
    });

    //编辑, 前进, 后退
    $('#edit').on('click', 'li', function () {
        var type = $(this).find('a').data('type');
        if (deviceEditor[type]) {
            deviceEditor[type]();
        }
    })

    $('#tool').on('click', 'li', function () {
        var type = $(this).find('a').data('type');
        if (type == 'load') {
            load();
        } else if (type == 'save') {
            savePanel(_dataType);
        } else if (type == 'exportJson') {
            exportData();
        } else if (type == 'exportImage') {
            exportImage();
        } else if (type == 'upload') {
            uploadOrEditModel();
        } else if (type == 'list') {
            showModelList();
        }
    })


    function createNewPanel(name, callback) {

        var data = deviceEditor.getData();

        //上传icon图片
        var icon = name;
        tools.uploadImage(icon + '.png', 'icons', deviceEditor.getIcon(), function () {

            //如果是有背板,保存为面板图,否则保存为面板部件
            if (deviceEditor.parentNode) {

                tools.updateOrInsertModel(it.util.i18n("Admin_deviceEditor_Device_panel"), name, data, icon, function () {

                    tools.registerPanel(name, data);
                    deviceEditor.refreshAccordion();
                    callback && callback();
                })
            } else {
                name = name + doodle.consts.MODEL_SUFFIX_SEPARATOR + doodle.consts.DEVICE_MODEL_SUFFIX;
                tools.updateOrInsertModel(it.util.i18n("Admin_deviceEditor_Panel_component"), name, data, icon, function () {

                    tools.registerPanelComp(name, data);
                    deviceEditor.refreshAccordion();
                    callback && callback();
                })
            }
        })
    }


    //$('.exportJson').dialog({
    //    "title": "导出json",
    //    "width": 700,
    //    "height": 400,
    //    autoOpen: false,
    //    show: {
    //        effect: "fade",
    //    },
    //    hide: {
    //        effect: "fade",
    //    },
    //    modal: true,
    //    buttons: {
    //        OK: function (e) {
    //
    //            $('.exportJson').dialog('close');
    //            var name = $('.exportJson').find('.name').val();
    //
    //            //保存当前面板
    //            createNewPanel(name);
    //
    //            //判断是否有背板
    //            if (deviceEditor.parentNode) {
    //
    //                //判断是否是标准U设备
    //                var editable = deviceEditor.parentNode.getClient('editable')
    //                if (!editable) {
    //
    //                    //upload iamge
    //                    var imageName = name + '.png';
    //                    tools.uploadImage(imageName, 'images', deviceEditor.getImage());
    //                    var id = deviceEditor.parentNode.getClient('id');
    //                    var id3d = id.replace(doodle.consts.MODEL_SUFFIX_SEPARATOR + doodle.consts.DEVICE_MODEL_SUFFIX, '');
    //
    //                    var icon = name;
    //                    //注册机柜编辑器中的2D模型
    //                    tools.updateOrInsertModel('设备2D', name + doodle.consts.MODEL_SUFFIX_SEPARATOR + doodle.consts.RACK_MODEL_SUFFIX, {
    //                        id: id3d + doodle.consts.MODEL_SUFFIX_SEPARATOR + doodle.consts.RACK_MODEL_SUFFIX,
    //                        image: imageName,
    //                        client: {
    //                            panel: name
    //                        }
    //                    }, icon)
    //
    //                    //注册模型编辑器中的3D模型
    //                    tools.updateOrInsertModel('设备', name, {
    //                        id: id3d,
    //                        image: imageName,
    //                        client: {
    //                            panel: name
    //                        }
    //                    }, icon)
    //                }
    //
    //            }
    //            $('.exportJson').dialog('close');
    //        },
    //        Cancel: function (e) {
    //            $('.exportJson').dialog('close');
    //        }
    //    },
    //});


    $(document).on('keyup', function (e) {
        //console.log(e, e.keyCode);
        if (e.keyCode == 46) {//delete node
            var data = deviceEditor.getSelectedData();
            deviceEditor.removeData(data)
            //直接从network中删除节点，如果没有objectId，上面方式不能删除
            // deviceEditor.network2d.removeSelection();
        }
    });

    /**
     * 监听键盘粘帖复制事件
     */
    $(document).on('keydown', function (e) {
        if (doodle.utils.isCtrlDown(e)) {
            //ctrl+c
            if (e.keyCode === 67) {
                deviceEditor.copySelection();
            }
            //ctrl+v
            if (e.keyCode === 86) {
                deviceEditor.pasteSelection();
            }
        }
    });

    //当前加载的dataType
    var _dataType;
    //当前加载设备的哪个一个面
    var _side;
    //所有设备类型的dataType
    var dataTypeItems = null;
    //所有设备类型的面
    var sides = [0 + '-' + util.i18n('side0'), 1 + '-' + util.i18n('side1')];
    //model到dataType的映射关系
    var model2dataTypeMap = null;
    var categoryItems = [{value: it.util.i18n("Admin_deviceEditor_Panel_back"), label: it.util.i18n("Admin_deviceEditor_Panel_back")}, {value: it.util.i18n("Admin_deviceEditor_Panel_component"), label: it.util.i18n("Admin_deviceEditor_Panel_component")}]

    deviceEditor.onDropHandler = function () {
        if (!_dataType) {
            it.util.showMessage('load dataType first')
            return true;
        }

    }

    var _refreshPanelStatus = false;
    refreshPanel(function () {
        _refreshPanelStatus = true;
    })

    function refreshModel(){
        makeTool.reload({}, function () {
            deviceEditor.refreshAccordion();
        });
    }

    /**
     * 刷新界面
     * @param callback
     */
    function refreshPanel(callback) {

        //查询所有的dataType, 过滤出设备分类的dataType
        //增加所有model和dataType的映射关系,如果导出的数据id已经注册为dataType,那么将实例数据保存到TemplateData中
        dataTypeItems = [];
        model2dataTypeMap = {};
        var categoryIds = ['equipment', 'card'];
        it.util.loadDataTypes(function () {
            it.util.dataTypeArray.forEach(function (d) {
                if (categoryIds.indexOf(d.categoryId) >= 0) {
                    dataTypeItems.push({value: d.id, label: d.id + (d.description ? (' - ' + d.description) : '')});
                }
                if (d.model2d) {
                    model2dataTypeMap[d.model2d] = d;
                    if (make.Default.getOtherParameter(d.model2d, 'bid')) {
                        make.Default.getOtherParameter(d.model2d, 'bid').editable = false;
                    }
                }

            })
            refreshModel();
            callback && callback();
        });
    }

    /******************  工具相关 ************************/

    /**
     * 校验
     * @returns {*}
     */
    function validate() {

        if (!_dataType) {
            return it.util.i18n("Admin_deviceEditor_Not_load_data")
        }
        return "";
    }

    /**
     * 显示选择加载面板图框
     */
    function load() {
        if (!_refreshPanelStatus) {
            it.util.showMessage('loading data');
            return;
        }
        if (!dataTypeItems || dataTypeItems.length == 0) {
            it.util.showMessage('no panel data');
            return;
        }

        var form = getLoadForm();
        it.util.modal('loadPanel', form, true, true, function () {
            var bv = $(form).data('bootstrapValidator');
            if (bv && !bv.isValid()) {
                return;
            }
            var params = it.util.getFormData(form);
            loadPanel(params);
        });
    }

    /**
     * 加载数据
     * @param params
     * @param callback
     */
    function loadPanel(params, callback) {

        deviceEditor.clear();
        var side = parseInt(params.side);
        _side = side;
        delete params.side;
        it.util.adminApi('datatype', 'get', {where: params}, function (dataType) {
            _dataType = dataType;
            var data = _dataType.model2dParameters || [];
            if (side == 1) {
                data = _dataType.model2d2Parameters || [];
            }
            /*if (data.length == 0) {
             data.push({id: doodle.utils.getDeviceEditorModel2dId(_dataType.model)});
             }*/
            it.util.adminApi('template_data', 'find', {where: {parentDataTypeId: dataType.id}}, function (templateData) {

                templateData.forEach(function (d) {
                    if (it.util.dataTypeMap[d.dataTypeId]) {
                        var dt = it.util.dataTypeMap[d.dataTypeId];
                        var dp = dt.model2dParameters || {};
                        dp = $.extend({}, dp);
                        dp.id = dt.model2d;
                        dp.position = d.position;
                        dp.rotation = d.rotation;
                        dp.client = dp.client || {};
                        dp.client.bid = d.id;
                        //FIXME 暂时去掉,数据保存两份,一份在template_data中,一根在modelParameters中
                        if (side == d.side) {
                            data.push(dp);
                        }
                    }
                })
                deviceEditor.setData(data);

                setTimeout(function () {
                    deviceEditor.zoomOverview();
                    callback && callback();
                }, 100);
            })
        })
    }

    /**
     * 显示保存界面
     * @param data
     */
    function savePanel(data) {
        var s = validate();
        if (s) {
            it.util.showMessage(s);
            return;
        }
        var panelData = deviceEditor.getData();
        var image = deviceEditor.getImage();
        var icon = deviceEditor.getIcon();
        var imageName = '', backImageName = '', iconName = '', backIconName;
        if (!panelData || panelData.length == 0) {
            it.util.showMessage('no data');
            return;
        }
        data = data || {};
        data.model2dParameters = panelData;
        data.model2d = 'twaver.idc.panel.loader';
        data.model2d2 = 'twaver.idc.panel.loader';
        data.model2d2Parameters = panelData;
        var form = getSaveForm(data, _side);

        var modal = util.modal(it.util.i18n("Admin_deviceEditor_Save_panel"), form, true, true, function () {
            var bv = $(form).data('bootstrapValidator');
            bv.validate();
            if (!bv.isValid())return true;

            var params = util.getFormData(form);
            var saveModelParameters = (_side == 0) ? JSON.parse(params.model2dParameters) : JSON.parse(params.model2d2Parameters);
            var dataTypeParams = null;
            var templateData = [];
            var parameters = [];
            saveModelParameters.forEach(function (d) {
                if (model2dataTypeMap[d.id]) {
                    var data = it.util.clone(d);
                    data.parentDataTypeId = params.id;
                    data.dataTypeId = model2dataTypeMap[d.id].id;
                    data.groupId = d.client ? d.client.pack : null;
                    data.id = doodle.id();
                    if (data.client && data.client.bid) {
                        data.id = data.client.bid;
                    }
                    data.side = _side;
                    templateData.push(data);
                    //FIXME  暂时加上,数据保存两份,一份在template_data中,一根在modelParameters中
                    // parameters.push(d);
                } else {
                    parameters.push(d);
                }
            })
            imageName = params.id + '_front' + '.jpg';
            iconName = params.id + '_front' + '.png';
            backImageName = params.id + '_back' + '.jpg';
            backIconName = params.id + '_back' + '.png';
            params.modelParameters = data.modelParameters;
            if (_side == 0) {
                params.model2dParameters = parameters;
                params.modelParameters.image = imageName;
            } else if (_side == 1) {
                params.model2d2Parameters = parameters;
                params.modelParameters.backImage = backImageName;
            }

            dataTypeParams = {value: params, options: {id: params.id}};

            templateData = {
                parentDataTypeId: params.id,
                side: _side,
                newData: templateData
            };

            //console.log('dataTypeParams', dataTypeParams);
            //console.log('templateData', templateData);
            //update dataType

            it.util.adminApi('datatype', 'update', dataTypeParams, function () {

                //upload image
                it.util.uploadImage((_side == 0) ? imageName : backImageName, image, function () {

                    //不需要上传icon
                    it.util.uploadImage((_side == 0) ? iconName : backIconName, icon, function () {
                        //update template data
                        it.util.adminApi('template_data', 'setData', templateData, function () {

                            it.util.adminApi('data', 'find', {where: {data_type_id: params.id}}, function (result) {
                                if (result) {
                                    var portDatas = [];
                                    for (var i=0; i < result.length; i++) {
                                        for (var j = 0; j < templateData.newData.length; j++) {
                                            var portData = {
                                                id: result[i].id,
                                                portNum: templateData.newData[j].id,
                                                side: templateData.side
                                            }
                                        }
                                    }  
                                    portDatas.push(portData);
                                    addOrUpdatePort(portDatas);                                
                                }
                            })
                            
                            //refresh dataType
                            refreshPanel(function () {

                                //reload panel
                                loadPanel({id: params.id, side: _side}, function () {
                                    it.util.showMessage('success');
                                })

                            });
                        })
                    }, '/../public/modellib/model/idc/icons/device/');
                });
            })
        });
    }

    function addOrUpdatePort(portDatas) {

        it.util.adminApi('port', 'batchAddOrUpData', portDatas, function (result) {
            console.log(result);
        }, function (error) {
            console.log(error);
            // layer.alert(error, {icon: 2});
        })
    }

    /**
     * 导出数据
     */
    function exportData() {

        var s = validate();
        if (s) {
            it.util.showMessage(s);
            return;
        }
        var data = deviceEditor.getData();
        var form = getExportDataForm(data);
        var modal = util.modal(it.util.i18n("Admin_deviceEditor_Export_data"), form, true, true, function () {
            var params = util.getFormData(form);
            var data = params.data || [];
            var name = params.name || it.util.i18n("Admin_deviceEditor_Panel_image");
            saveAs(new Blob([data], {type: "text/plain"}), name + ".json");
        })
    }


    /**
     * 导出图片
     */
    function exportImage() {

        var s = validate();
        if (s) {
            it.util.showMessage(s);
            return;
        }
        var data = deviceEditor.getBounds();
        var form = getExportImageForm(data);
        var modal = util.modal(it.util.i18n("Admin_deviceEditor_Export_image"), form, true, true, function () {
            var params = util.getFormData(form);
            var scale = parseInt(params.scale || 1) || 1;
            var name = params.name || it.util.i18n("Admin_deviceEditor_Panel_image");
            var data = deviceEditor.toCanvas({scale: scale});
            data.content.toBlob(function (blob) {
                saveAs(blob, name + ".png");
            });
        })
    }

    /**
     * 上传模型
     */
    function uploadOrEditModel(data, callback) {
        data = data || {};
        var isUpdate = !!data.id;
        data.category = data.category || categoryItems[0].value;
        var form = getUploadForm(data);
        var v = it.validator;
        var opt = {};
        opt.id = {
            trigger: 'blur',
            validators: [v.notEmpty('id'), v.callback("id "+it.util.i18n("Admin_deviceEditor_Conflict"), function (value, validator) {
                return !make.Default.getCreator(value);
            })]
        };
        if (!isUpdate) {
            opt.icon = {
                trigger: 'blur',
                validators: [v.notEmpty('icon')]
            };
            opt.image = {
                trigger: 'blur',
                validators: [v.notEmpty('image')]
            };
        }

        util.initValidator(form, opt);

        var title = isUpdate ? it.util.i18n("Admin_deviceEditor_Edit_Model") : it.util.i18n("Admin_deviceEditor_Upload_Model");
        var mess = isUpdate ? it.util.i18n("Admin_deviceEditor_Update_success") : it.util.i18n("Admin_deviceEditor_Upload_success");
        var modal = util.modal(title, form, true, true, function (success, error) {
            var params = util.getFormData(form);

            var icon = $('.icon-pre').attr('src');
            var image = $('.image-pre').attr('src');
            params.iconContent = icon;
            params.imageContent = image;
            //console.log("上传模型", params);

            if (isUpdate) {
                makeTool.update(params, function () {
                    success();
                    callback && callback();
                    refreshModel();
                    it.util.showMessage(mess)
                }, error)
            } else {
                makeTool.add(params, function () {
                    success();
                    callback && callback();
                    refreshModel();
                    it.util.showMessage(mess)
                }, error)
            }


        }, true)
        setTimeout(function () {
            Holder.run();
        }, 1000)
    }

    var modelItems = [];
    var modelMap = {};

    /**
     *
     * @param category
     */
    function showModelList(category) {


        makeTool.list({category: category}, function (data) {

            modelItems = [];
            modelMap = {};
            data.forEach(function (item) {
                modelMap[item.id] = item;
                modelItems.push({value: item.id, label: item.name});
            })
            var form = getListDataForm(data);
            var modal = util.modal(it.util.i18n("Admin_deviceEditor_Model_list"), form, false, false)
            modal.on('click', '.del', function () {

                var id = $(this).data('id');
                layer.confirm(it.util.i18n("Admin_deviceEditor_Confirm_delete_Model")+':' + id, function (index) {
                    layer.close(index);
                    makeTool.remove({id: id}, function () {
                        makeTool.list({category: category}, function (data) {
                            var f = getListDataForm(data);
                            modal.find('.modal-body').empty().append(f);
                            refreshModel();
                        })
                    })
                })

            })
            modal.on('click', '.edit', function () {

                var id = $(this).data('id');
                var data = modelMap[id];
                if (!data) {
                    layer.alert(id + ' '+it.util.i18n("Admin_deviceEditor_Already_Delete"));
                    return;
                }
                uploadOrEditModel(data, function () {
                    makeTool.list({}, function (data) {
                        var f = getListDataForm(data);
                        modal.find('.modal-body').empty().append(f);
                        refreshModel();
                    })
                });
            })
            modal.on('click', '.preview', function () {
                var item = $(this);
                var src = item.data('src');
                var width = item.data('width');
                var height = item.data('height');
                var box = $('<div align="center" class="list-preview-box"></div>');
                //box.css('align', 'center');
                box.height(height + 10);
                var wrap = $('<div  class="list-preview-wrap"></div>').appendTo(box);
                var image = $('<image height="' + height + 'px" width="' + width + 'px" class="list-preview-image"></image>').appendTo(wrap);
                image.attr('src', src);
                var modal = util.modal(it.util.i18n("Admin_deviceEditor_Model_preview"), box, false, false)
                modal.find('.modal-dialog').width(800);
                modal.find('.modal-body').css('overflow', 'auto')
            })
        })
    }

    /******************  视图 ************************/

    var getSaveForm = function (data, side) {
        data = data || {};
        var props = [], util = it.util;
        props.push({
            label: 'id',
            id: 'id',
            options: 'required:true',
            value: data.id,
            readonly: true
        });
        if (side == 0) {
            props.push({
                label: 'model2d',
                id: 'model2d',
                options: 'required:true',
                value: data.model2d,
                readonly: true
            });
            props.push({
                label: 'model2dParameters',
                id: 'model2dParameters',
                type: 'textarea',
                readonly: true,
                value: JSON.stringify(data.model2dParameters)
            });
        } else if (side == 1) {
            props.push({
                label: 'model2d2',
                id: 'model2d2',
                options: 'required:true',
                value: data.model2d2,
                readonly: true
            });
            props.push({
                label: 'model2d2Parameters',
                id: 'model2d2Parameters',
                type: 'textarea',
                readonly: true,
                value: JSON.stringify(data.model2d2Parameters)
            });
        }

        var form = util.createForm(props);
        var opt = {
            id: {
                trigger: 'blur',
                validators: [it.validator.notEmpty('id')]
            }
        };
        util.initValidator(form, opt);
        return form;
    }

    var getLoadForm = function (data) {
        data = data || {};
        var props = [];
        props.push({
            label: 'id',
            id: 'id',
            options: 'required:true',
            type: 'select',
            value: data.id,
            items: dataTypeItems
        });
        props.push({
            label: 'side',
            id: 'side',
            options: 'required:true',
            type: 'select',
            value: data.id,
            items: sides
        });
        var form = util.createForm(props);
        return form;
    }

    var getExportDataForm = function (data) {
        data = data || [];
        var props = [];
        props.push({
            label: it.util.i18n("Admin_deviceEditor_Name"),
            id: 'name',
            options: 'required:true',
            value: _dataType ? _dataType.id : it.util.i18n("Admin_deviceEditor_Panel_image"),
        });
        props.push({
            label: it.util.i18n("Admin_deviceEditor_Data"),
            id: 'data',
            type: 'textarea',
            readonly: true,
            value: JSON.stringify(data)
        });
        var form = util.createForm(props);
        return form;
    }

    var getExportImageForm = function (data) {
        data = data || {};
        var props = [];
        props.push({
            label: it.util.i18n("Admin_deviceEditor_Width"),
            id: 'width',
            options: 'required:true',
            value: data.width,
            type: 'number',
            readonly: true
        });
        props.push({
            label: it.util.i18n("Admin_deviceEditor_Height"),
            id: 'height',
            options: 'required:true',
            value: data.height,
            readonly: true,
            type: 'number'
        });
        props.push({
            label: it.util.i18n("Admin_deviceEditor_Scale"),
            id: 'scale',
            options: 'required:true',
            type: 'number',
            value: 1,
        });
        props.push({
            label: it.util.i18n("Admin_deviceEditor_Name"),
            id: 'name',
            options: 'required:true',
            value: _dataType ? _dataType.id : it.util.i18n("Admin_deviceEditor_Panel_image"),
        });
        var form = util.createForm(props);
        return form;
    }

    var getUploadForm = function (data) {
        data = data || {};
        var isUpdate = !!data.id;
        var props = [];
        props.push({
            label: it.util.i18n("Admin_deviceEditor_ID"),
            id: 'id',
            options: 'required:true',
            value: data.id,
            readonly: isUpdate
        });
        props.push({
            label: it.util.i18n("Admin_deviceEditor_Category"),
            id: 'category',
            options: 'required:true',
            value: data.category,
            type: 'select',
            items: categoryItems,
        });

        props.push({
            label: it.util.i18n("Admin_deviceEditor_Name"),
            id: 'name',
            value: data.name,
            options: 'required:false',
        });
        props.push({
            label: it.util.i18n("Admin_deviceEditor_Width"),
            id: 'width',
            value: data.width,
            options: 'required:true',
            type: 'number'
        });
        props.push({
            label: it.util.i18n("Admin_deviceEditor_Height"),
            id: 'height',
            value: data.height,
            options: 'required:true',
            type: 'number'
        });
        props.push({
            label: it.util.i18n("Admin_deviceEditor_Icon"),
            id: 'icon',
            options: 'required:true',
            type: 'file',
            on: {
                change: function (e) {

                    var error = validateFile(e);
                    if (error) {
                        it.util.showMessage(error);
                        return;
                    }
                    var pre = $('.icon-pre');
                    pre.attr('data-src', "holder.js/200x100?text="+ it.util.i18n("Admin_deviceEditor_Loading")+"...");
                    Holder.run({images: pre[0]})
                    loadImage(e.target, function (r) {

                        pre.attr('src', r);
                        var w = pre.prop('naturalWidth');
                        var h = pre.prop('naturalHeight');
                        $('.icon-size').text(' ' + w + ' x ' + h);
                    })
                }
            }
        });
        props.push({
            label: it.util.i18n("Admin_deviceEditor_Image"),
            id: 'image',
            options: 'required:true',
            type: 'file',
            on: {
                change: function (e) {
                    var error = validateFile(e);
                    if (error) {
                        it.util.showMessage(error);
                        return;
                    }
                    var pre = $('.image-pre');
                    pre.attr('data-src', "holder.js/200x100?text="+it.util.i18n("Admin_deviceEditor_Loading")+"...");

                    loadImage(e.target, function (r, width, height) {

                        pre.attr('src', r);
                        var w = pre.prop('naturalWidth');
                        var h = pre.prop('naturalHeight');
                        $('.image-size').text(' ' + w + ' x ' + h);
                        $('#width').val(w);
                        $('#height').val(h);
                    })
                }
            }
        });

        var form = util.createForm(props);
        var box = $('<div></div>')
        box.append(form);
        var previewBox = $('<div></div>')
        box.append(previewBox);
        box.append('<input type="hidden" class="modelOperation" value="' + !!data.id + '">')

        //holder.js/100%x180
        $('<div class="row preview-image">' +
            '   <div class="col-xs-6 col-md-3 item">' +
            '       <label class="">'+it.util.i18n("Admin_deviceEditor_Icon")+' : </label><label class="icon-size"></label>' +
            '       <a href="#" class="thumbnail">' +
            '           <img class="icon-pre" data-src="holder.js/200x100?text='+it.util.i18n("Admin_deviceEditor_Select_icon_preview")+'" alt="icon">' +
            '       </a>' +
            '   </div>' +
            '   <div class="col-xs-6 col-md-3 item">' +
            '       <span class="">'+ it.util.i18n("Admin_deviceEditor_Image")+' : </span><span class="image-size"></span>' +
            '       <a href="#" class="thumbnail">' +
            '           <img class="image-pre" data-src="holder.js/200x100?text='+it.util.i18n("Admin_deviceEditor_Select_image_preview")+'" alt="image">' +
            '       </a>' +
            '   </div>' +
            '</div>').appendTo(previewBox);
        return box;
    }

    function validateFile(e) {
        var fileInput = e.target;
        var files = fileInput.files;
        if (!files || files.length == 0) {
            return 'empty file';
        }
        var file = files[0];
        if (!isImage(file)) {
            return 'must be image file';
        }
    }

    function loadImage(fileInput, callback) {
        var files = fileInput.files;
        if (!files || files.length == 0) {
            return;
        }
        var file = files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (e) {
            //result.innerHTML = '<img src="'+this.result+'" alt=""/>';
            //img_area.innerHTML = '<div class="sitetip">图片img标签展示：</div><img src="'+this.result+'" alt=""/>';
            callback && callback(e.target.result);
        }
    }

    function isImage(file) {
        var name = file.name;
        var extName = name.substr(name.lastIndexOf('.') + 1);
        return extName == 'png' || extName == 'svg' || extName == 'gif' ||
            extName == 'jpg' || extName == 'jpeg';
    }

    //所有列表, 可以删除
    var getListDataForm = function (data) {
        data = data || [];
        var form = $('<div></div>')
        var table = $('<table class="table table-striped table-bordered table-hover table-condensed"></table>').appendTo(form);
        var thead = $('<thead></thead>').appendTo(table);
        var tbody = $('<tbody></tbody>').appendTo(table);
        var tr = $('' +
            '<tr>' +
            '<td>'+it.util.i18n("Admin_deviceEditor_Category")+'</td>' +
            '<td>'+it.util.i18n("Admin_deviceEditor_ID")+'</td>' +
            '<td>'+it.util.i18n("Admin_deviceEditor_Name")+'</td>' +
                //'<td>宽度</td>' +
                //'<td>高度</td>' +
            '<td>'+it.util.i18n("Admin_deviceEditor_Icon")+'</td>' +
            '<td>'+it.util.i18n("Admin_deviceEditor_Operation")+'</td>' +
            '</td>' +
            '').appendTo(thead);
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            var iconSrc = make.Default.path + item.iconPath;
            var imageSrc = make.Default.path + item.imagePath;
            var tr = $('' +
                '<tr>' +
                '<td>' + item.category + '</td>' +
                '<td>' + item.id + '</td>' +
                '<td>' + item.name + '</td>' +
                    //'<td>' + item.width + '</td>' +
                    //'<td>' + item.height + '</td>' +
                '<td><image class="preview" height="48px" src="' + iconSrc + '" data-src="' + imageSrc + '" data-width="' + item.width + '" data-height="' + item.height + '"></image></td>' +
                '<td>' +
                '   <a class="edit" data-id="' + item.id + '">'+ it.util.i18n("Admin_deviceEditor_Edit")+'</a>' +
                '   <a class="del" data-id="' + item.id + '">'+ it.util.i18n("Admin_deviceEditor_Delete")+'</a>' +
                '</td>' +
                '</td>' +
                '').appendTo(tbody);
            //category id name width height icon image

        }
        return form;
    }
})

