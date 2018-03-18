var $PanelInfo = function (sceneManager) {
    $BaseServerTab.call(this, sceneManager);
    this.sceneManager = sceneManager;
    // this.generalPanle = $('.baseInfoTab');
    this.generalPanle = $('<div class="baseInfoTab infoTab scroll-class"></div>');
    this.columnInfos = null;
    this.needSave = false;
    this.init();

};

mono.extend($PanelInfo, $BaseServerTab, {

    showScene: dataJson.showBaseInfoCategoryId || 'rack, equipment',

    init: function () {
        if (!this.generalPanle || this.generalPanle.length < 1) {
            this.generalPanle = $('<div class="baseInfoTab infoTab"></div');
            // $('#serverPanel').append(this.generalPanle); //如果连这些(serverPanel)都没有，那就没法显示了
        }
    },

    getTitle: function () {
        return it.util.i18n("GeneralInfo_General_info"); //monitor_Synchronize
    },

    getContentClass: function () {
        return 'baseInfo info scroll-class';
    },

    getContentPanel: function () {
        return this.generalPanle;
    },

    setData: function (data) {
        $('#serverTab').off('click', '.baseInfoTab i.icon-edit');
        $('#serverTab').off('click', '.baseInfoTab .buttons .reset');
        $('#serverTab').off('click', '.baseInfoTab .buttons .save');
        this.generalPanle.empty();

        var icon = $('<i class="iconfont icon-edit clearfix"></i>');
        icon.appendTo(this.generalPanle);

        var self = this;
        if (!data) {
            return;
        }
        var category = this.sceneManager.dataManager.getCategoryForData(data);
        var categoryId = category.getId();
        if (!category) {
            return;
        }
        if (!this.columnInfos || !this.columnInfos[categoryId]) {
            ServerUtil.api('data', 'findCustomColumnsByCategoryId', { categoryId: categoryId },
                function (items) {
                    var objs = {};
                    for (var i = 0; i < items.length; i++) {
                        var item = items[i];
                        if (objs[item.column_group_id]) {
                            objs[item.column_group_id].push({
                                displayName: item.column_display_name,
                                columeName: item.column_name
                            });
                        } else {
                            objs[item.column_group_id] = [{
                                displayName: item.column_display_name,
                                columeName: item.column_name
                            }];
                        }
                    }
                    if (!self.columnInfos) {
                        self.columnInfos = {};
                    }
                    self.columnInfos[categoryId] = objs;
                    self.createInfoPane(data, objs);
                });
        } else {
            this.createInfoPane(data, this.columnInfos[category.getId()]);
        }
    },

    createInfoPane: function (data, info) {
        if (!data) {
            return;
        }
        var clientMap = data._userDataMap;
        info = info || {};
        // 、品牌、、、设备型号,IP地址、电源
        var baseInfoDataMap = {};
        var categoryId = this.sceneManager.dataManager.getCategoryForData(data).getId();
        if (categoryId == 'equipment') {
            baseInfoDataMap = this.createEquipmentDataMap(data);
        } else {
            baseInfoDataMap = this.createDataMap(data);
        }

        var extBaseInfo = info[it.util.i18n("DevPanelManager_Panel_info")];
        if (extBaseInfo && extBaseInfo instanceof Array) {
            for (var i = 0; i < extBaseInfo.length; i++) {
                var pro = extBaseInfo[i];
                if (!baseInfoDataMap.hasOwnProperty(pro)) {
                    baseInfoDataMap[pro] = clientMap[pro];
                }
            }
        }

        var groups = {};
        this.extInfoMap = []; //用来放扩展字段
        for (var groupId in info) {
            if (groupId != it.util.i18n("DevPanelManager_Panel_info")) {
                var pros = info[groupId];
                var proAndValues = {};
                for (var i = 0; i < pros.length; i++) {
                    var pro = pros[i];
                    var proValue = clientMap[pro.columeName] || '';
                    var label = pro.displayName ? pro.displayName : pro.columeName;
                    var field = pro.columeName;
                    if (!groupId) {
                        baseInfoDataMap[it.util.i18n(label)] = {
                            key: field,
                            value: proValue
                        };
                        this.extInfoMap.push(field);

                    } else {
                        proAndValues[it.util.i18n(label)] = {
                            key: field,
                            value: proValue,
                            displayName: label
                        };
                    }
                };
                if (!$.isEmptyObject(proAndValues)) {
                    groups[groupId] = proAndValues;
                }
            }
        }

        if (!$.isEmptyObject(baseInfoDataMap)) {
            var baseInfoPane = this.createEmpityPanel('', baseInfoDataMap);
            this.generalPanle.append(baseInfoPane);

        }
        if (!$.isEmptyObject(groups)) {
            for (var groupId in groups) {
                var groupPanel = this.createEmpityPanel(groupId, groups[groupId]);
                this.generalPanle.append(groupPanel);
            }
        }
        var buttons = this.btns = $('<div class="buttons displaynone clearfix"></div>');
        var resetBtn = $('<button class="reset btn-gray">' + it.util.i18n("GeneralInfo_Reset") + '</button>');
        var saveBtn = $('<button class="save btn-gray">' + it.util.i18n("GeneralInfo_Save") + '</button>');
        buttons.append(resetBtn);
        buttons.append(saveBtn);
        this.generalPanle.append(buttons);
        var self = this;
        $('#serverTab').on('click', '.baseInfoTab i.icon-edit', function (e) {
            e.stopPropagation();
            self.btns.removeClass('displaynone');
            // saveBtn.removeClass('displaynone');
            self.editInfo($('.baseInfoTab .panel .panel-content .content-row input'), self.extInfoMap, data);
        });

        $('#serverTab').on('click', '.baseInfoTab .buttons .reset', function (e) {
            e.stopPropagation();
            self.resetInfo($('.baseInfoTab .panel .panel-content .content-row input'), self.extInfoMap, data);
        });

        $('#serverTab').on('click', '.baseInfoTab .buttons .save', function (e) {
            e.stopPropagation();
            self.btns.addClass('displaynone');
            // saveBtn.addClass('displaynone');
            self.saveInfo($('.baseInfoTab .panel .panel-content .content-row input'), self.extInfoMap, data);
        });
    },

    createEquipmentDataMap: function (data) {
        var parentData = this.sceneManager.dataManager.getDataById(data.getParentId()) || {};
        var parentParData = this.sceneManager.dataManager.getDataById(parentData.getParentId()) || {};
        var dataType = this.sceneManager.dataManager.getDataTypeForData(data);
        var businessType = this.sceneManager.dataManager.getBusinessTypeForData(data);
        var baseInfoDataMap = {};
        var u_start = parseInt(data.getLocation() ? data.getLocation().y : 'undefined');
        var u_occupy = dataType.getSize() ? dataType.getSize().ySize : 'undefined';
        var u_end = u_start + u_occupy - 1;

        baseInfoDataMap[it.util.i18n("GeneralInfo_Belongto_Room")] = {
            key: '_parentRoom',
            value: parentParData.getId()
        };
        baseInfoDataMap[it.util.i18n("GeneralInfo_Belongto_Rack")] = {
            key: '_parentId',
            value: parentData.getId()
        };
        // baseInfoDataMap['设备性质'] = '客户设备';
        baseInfoDataMap[it.util.i18n("GeneralInfo_Device_Name")] = {
            key: '_name',
            value: data.getName()
        };
        // baseInfoDataMap['设备类型'] = '服务器设备';
        // baseInfoDataMap['设备子类'] = '机架式服务器';
        // baseInfoDataMap['设备品牌'] = '';
        baseInfoDataMap[it.util.i18n("GeneralInfo_Device_DataType")] = {
            key: '_dataTypeId',
            value: dataType.getId()
        };
        // baseInfoDataMap['CPU型号'] = 'Xeon E7-4809';
        // baseInfoDataMap['CPU颗数'] = '2';
        // baseInfoDataMap['内存容量（GB）'] = '32';
        // baseInfoDataMap['硬盘容量（MB）'] = '1024';
        // baseInfoDataMap['工作电压（V）'] = '90-240';
        // baseInfoDataMap['电源功率（W）'] = '900';
        // baseInfoDataMap['使用状态'] = '现网';
        // baseInfoDataMap['开始使用时间'] = '2017-05-08';
        baseInfoDataMap[it.util.i18n("GeneralInfo_Device_Height")] = {
            key: '_height',
            value: u_occupy
        };
        baseInfoDataMap[it.util.i18n("GeneralInfo_U_Occupy")] = {
            key: '_occupyU',
            value: u_start + '-' + u_end
        };
        // baseInfoDataMap['客户名称'] = '';
        // baseInfoDataMap['客户编码'] = 'Xeon E7-4809';
        // baseInfoDataMap['产品名称'] = '主机托管';
        // baseInfoDataMap['产品实例标识'] = 'ZJTG-000008';

        return baseInfoDataMap;
    },

    createDataMap: function (data) {
        var baseInfoDataMap = {};
        baseInfoDataMap[it.util.i18n("GeneralInfo_Device_Id")] = {
            key: '_id',
            value: data.getId()
        };
        baseInfoDataMap[it.util.i18n("GeneralInfo_Device_Name")] = {
            key: '_name',
            value: data.getName()
        };

        return baseInfoDataMap;
    },

    createEmpityPanel: function (title, dataMap) {
        var ePane = $('<div class="panel"></div>');
        var header = $('<div class="panel-header">' + title + '</div>');
        ePane.append(header);
        var content = this.createContent(dataMap);
        ePane.append(content);
        return ePane;
    },

    createContent: function (dataMap) {
        var content = $('<div class="panel-content clearfix"></div>');
        if (dataMap) {
            for (var label in dataMap) {
                if (dataMap[label].displayName) {
                    this.extInfoMap.push(dataMap[label].key);
                    var row = this.createRow(dataMap[label].displayName, dataMap[label]);
                } else {
                    this.extInfoMap.push(dataMap[label]);
                    var row = this.createRow(label, dataMap[label]);
                }

                row.appendTo(content);
            }
        }
        return content;
    },

    createRow: function (label, value) {
        var row = $('<div class="content-row"></div>');
        $('<span class="left">' + label + '   :</span>').appendTo(row);
        $('<span class="right"><input type="text" data-value="' + value.key + '"value="' + value.value + '" disabled /></span>').appendTo(row);
        return row;
    },

    editInfo: function ($eles, extMap, data) {
        //当点击编辑后，某些项的input 样式展现出来
        var self = this;
        this.needSave = true;
        self.beforeEditValues = {};
        $eles.each(function (index, ele) {
            var dataKey = $(ele).data('value'); //输入框的data-value
            var value = $(ele).val(); //输入框的值
            if (dataKey == '_name' || extMap.indexOf(dataKey) > -1) {
                $(ele).attr('disabled', false);
                $(ele).addClass('editable');
                self.beforeEditValues[dataKey] = value;
            }
        });
        this.currentData = data;
    },

    resetInfo: function ($eles, extMap, data) {
        var self = this;
        $eles.each(function (index, ele) {
            var dataKey = $(ele).data('value'); //输入框的data-value
            var value = $(ele).val(); //输入框的值
            if (dataKey == '_name' || extMap.indexOf(dataKey) > -1) {
                $(ele).val(self.beforeEditValues[dataKey]);
            }
        });
    },

    saveInfo: function ($eles, extMap, data) {
        var self = this;
        var setData = this.getInfo($eles, extMap, data);
        var sdata = {
            value: setData
        };
        if (setData.ii !== undefined) {
			sdata.options = { ii: setData.ii };
		} else {
			sdata.options = { id: setData.id };
		}
        ServerUtil.api('data', 'updateDataWithCustom', sdata, function () {
            self.needSave = false;
            it.util.msg(it.util.i18n("GeneralInfo_Save_Success"));
            //保存成功以后将input 隐藏
            $eles.each(function (index, ele) {
                $(ele).attr('disabled', true);
                $(ele).removeClass('editable');
            })

        });
    },

    getInfo: function ($eles, extMap, data) {
        var self = this;
        var setData = {};
        var setExtData = {};
        var keyArr = ['_businessTypeId', '_dataTypeId', '_description', '_extend', '_id', '_ii', '_location', '_name', '_parentId', '_position', '_position2d', '_rotation', '_weight'];
        var category = main.sceneManager.dataManager.getCategoryForData(data).getId();

        $eles.each(function (index, ele) {
            var val = $(ele).val();
            var dataKey = $(ele).data('value');
            if (keyArr.indexOf(dataKey) > -1) {
                data[dataKey] = val;
            } else if (extMap.indexOf(dataKey) > -1) {
                setExtData[dataKey] = val;
            }
        });
        setExtData.id = data.getId();
        if (category == 'equipment') {
            setExtData['_table'] = 'equipment_custom';
        } else if (category == 'rack') {
            setExtData['_table'] = 'rack_custom';
        }

        Object.keys(data).forEach(function (item, index) {
            var value = item;
            if (keyArr.indexOf(value) > -1) {
                var key = self.deleteCharacter(value);
                setData[key] = data[item];
            }
        });

        setData.customField = setExtData;
        return setData;
    },

    deleteCharacter: function (str) {
        var exg = new RegExp(/[A-Za-z]+\d*[A-Za-z]*/g);
        return str.match(exg).toString();
    },

    isSaveLayer: function () {
        var self = this;
        var $isSave = $('<div class="isSave"><p>' + it.util.i18n("GeneralInfo_Tip") + '</p></div>');
        var $div = $('<div class="clearfix"></div>');
        var $cancel = $('<button class="btn-gray">' + it.util.i18n("GeneralInfo_No") + '</button>');
        var $confirm = $('<button  class="btn-gray">' + it.util.i18n("GeneralInfo_Yes") + '</button>');
        $cancel.appendTo($div);
        $confirm.appendTo($div);
        $div.appendTo($isSave);
        $(document.body).append($isSave);

        var index = layer.open({
            type: 1,
            title: '',
            // shade: true,
            shadeClose: false,
            closeBtn: 0,
            content: $isSave
        });

        $confirm.on('click', function () {

            // var node = main.sceneManager.viewManager3d.getFocusNode();
            var data = self.currentData;
            var eles = $('.baseInfoTab .panel .panel-content .content-row input');
            var setData = self.getInfo(eles, self.extInfoMap, data);
            var sdata = {
                value: setData
            };
            if (setData.ii !== undefined) {
                sdata.options = { ii: setData.ii };
            } else {
                sdata.options = { id: setData.id };
            }
            ServerUtil.api('data', 'updateDataWithCustom', sdata, function () {
                self.needSave = false;
                layer.close(index);
                it.util.msg(it.util.i18n("GeneralInfo_Save_Success"));
            });

        });
        $cancel.on('click', function () {
            self.needSave = false;
            layer.close(index);
        });
    }
});

it.PanelInfo = $PanelInfo;