var $ITVSearchBasePanel = function(sceneManager) {
    it.BasePanel.call(this);
    this.sceneManager = sceneManager;
    this.dataManager = this.sceneManager.dataManager;
    this.selectMap = {}; // 用于动态保存创建的<select>的id，便于最后统一处理，如：初始化selectPick
    this.className = 'ITVSearchBasePanel';
};

mono.extend($ITVSearchBasePanel, it.BasePanel, {

    setOptions: function(options, datas) {
        if (!options) {
            options = [];
        }
        if (datas) {
            for (var id in datas) {
                var data = datas[id];
                if (dataJson.isShowAll) {
                    if (data) {
                        options.push(data.getId() + ':' + (data.getDescription() || data.getId()));
                    }
                } else {
                    if (data && data.getChildren().size() !== 0) {
                        options.push(data.getId() + ':' + (data.getDescription() || data.getId()));
                    }
                }
            }
        }
        return options;
    },

    createAreaOption: function() {
        var categoryDatas = this.dataManager._categoryDatas;
        var options = [':' + it.util.i18n("ITVSearchBasePanel_All")]; //['all:全部'] ,"all"不能被识别，直接去掉了
        if (categoryDatas) {
            var dcs = categoryDatas['datacenter'];
            this.setOptions(options, dcs);
            var buildings = categoryDatas['building'];
            this.setOptions(options, buildings);
            var floors = categoryDatas['floor'];
            this.setOptions(options, floors);
            var rooms = categoryDatas['room'];
            this.setOptions(options, rooms);
            options.sort(this.sortFunction);
            return options;
        }
        return null;
    },

    sortFunction: function(a, b) {
        if (!a) {
            return -1;
        }
        if (!b) {
            return 1;
        }
        var des1 = '',
            des2 = '';
        var str1 = a.split(':');
        if (str1 && str1.length == 2) {
            des1 = str1[1];
        }
        var str2 = b.split(':');
        if (str2 && str2.length == 2) {
            des2 = str2[1];
        }
        if (des1 == 'all' || des1 == it.util.i18n("ITVSearchBasePanel_All") || des1 == '') {
            return -1;
        } else if (des2 == 'all' || des2 == it.util.i18n("ITVSearchBasePanel_All") || des2 == '') {
            return 1;
        }
        return it.Util.compare(des1, des2);
    },

    refreshDataTypeOption: function(e) {
        var self = this,
            dataTypeMap = this.dataManager._dataTypeMap;
        // var select = self.selectMap['ITSearchPane_txt_type']; //不太准
        var select = self.getDataTypeSelectComponent();
        var btSelect = self.getBusinessTypeSelectComponent();
        if (select == null) {
            return;
        }
        ServerUtil.api('datatype', 'search', {}, function(datatypes) {
            if (datatypes && datatypes.length > 0) {
                datatypes.forEach(function(datatype) {
                    var id = datatype.id;
                    if (dataTypeMap[id]) {
                        dataTypeMap[id].setUserData('searchFilter', datatype.searchFilter);
                        dataTypeMap[id].setUserData('businessTypeId', datatype.businessTypeId);
                    }
                });
            }
            // var options = self.createDataTypeOption();
            var businessTypeId = '';
            if (btSelect) {
                businessTypeId = btSelect.val();
            };
            // var data = select._sdata;
            var options = self.createDataTypeOption(businessTypeId);
            select.empty();
            self.appendSelectOptions(select, options);
            select.selectpicker('refresh');
        });
    },

    getOriginDataTypes: function() {
        // var dataTypeDatas = this.dataManager._dataTypeDatas; //不直接用dataTypeMap是因为可能有很多的dataType没有对应的资产
        return this.dataManager._dataTypeMap;
    },

    /**
     * 创建数据类型和业务类型的options
     * @isCheckEmptyDataType 判断是不是判断为空dataType,像资产上架中就不需要判断，而是将所有的datatype都显示出来
     * 否则的话会查看main.hideEmptyDataType中是不是需要判断
     * main.hideEmptyDataType是内部的函数，统一控制，isCheckEmptyDataType是参数
     */
    createDataTypeOption: function(businessTypeId, isCheckEmptyDataType) {
        var dataTypeDatas = this.dataManager._dataTypeDatas; //不直接用dataTypeMap是因为可能有很多的dataType没有对应的资产
        // var dataTypeMap = this.dataManager._dataTypeMap;
        var dataTypeMap = this.getOriginDataTypes();
        if (dataTypeMap) {
            var options = [':' + it.util.i18n("ITVSearchBasePanel_All")]; //['all:全部'] ,"all"不能被识别，直接去掉了
            for (var typeId in dataTypeMap) {
                var dataType = this.dataManager._dataTypeMap[typeId];
                if (SETTING && SETTING.businessTypeWithDataType && businessTypeId) {
                    if (!dataType.getUserData('businessTypeId') ||
                        dataType.getUserData('businessTypeId') != businessTypeId) {
                        continue;
                    }
                }
                var category = this.dataManager.getCategoryForDataType(dataType);
                if (category) {
                    if (category.getId().toLowerCase() === 'datacenter') {
                        continue;
                    } else if (category.getId().toLowerCase() === 'building') {
                        continue;
                    } else if (category.getId().toLowerCase() === 'floor') {
                        continue;
                    } else if (category.getId().toLowerCase() === 'room') {
                        continue;
                    }
                }
                if (isCheckEmptyDataType == undefined || isCheckEmptyDataType == null) {
                    isCheckEmptyDataType = true;
                }
                if (!!isCheckEmptyDataType && main.hideEmptyDataType && main.hideEmptyDataType()) {
                    if (!dataTypeDatas[typeId] || Object.keys(dataTypeDatas[typeId]).length == 0) {
                        continue;
                    }
                }
                var cSearchFilter = category.getUserData('searchFilter');
                if (dataType) {
                    var dSearchFilter = dataType.getUserData('searchFilter');
                    if (cSearchFilter && dSearchFilter) {
                        options.push(dataType.getId() + ':' + (dataType.getDescription() || dataType.getId()));
                    }
                }
            }
            options.sort(this.sortFunction);
            return options;
        }
        return null;
    },

    createBusinessTypeOption: function(isWithNull) {
        var businessTypes = this.dataManager._businessTypeMap;
        if (businessTypes) {
            var options = [':' + it.util.i18n("ITVSearchBasePanel_All")];
            if (isWithNull) { //有时用这个用于表单中，最终要将其值做为某个属性写到数据库中
                options = [':'];
            }
            for (var typeId in businessTypes) {
                var businessType = this.dataManager._businessTypeMap[typeId];
                if (businessType) {
                    var searchFilter = businessType.getUserData('searchFilter');
                    if (searchFilter) {
                        options.push(businessType.getId() + ':' + (businessType.getName() || businessType.getId()));
                    }
                }
            }
            options.sort(this.sortFunction);
            return options;
        }
        return null;
    },

    createCategoryOption: function(isWithNull) {
        var categories = this.dataManager._categoryMap;
        if (categories) {
            var options = [':' + it.util.i18n("ITVSearchBasePanel_All")];
            if (isWithNull) { //有时用这个用于表单中，最终要将其值做为某个属性写到数据库中
                options = [':'];
            }
            for (var key in categories) {
                var category = categories[key];
                if (category) {
                    var searchFilter = category.getUserData('searchFilter');
                    if (searchFilter) {
                        options.push(category.getId() + ':' + (category.getDescription() || category.getId()));
                    }
                }
            }
            options.sort(this.sortFunction);
            return options;
        }
        return null;
    },

    /**
     * 获取dataType的html
     */
    getDataTypeSelectComponent: function() {
        if (!this.selectMap) {
            return null;
        }
        for (var inputId in this.selectMap) {
            var select = this.selectMap[inputId];
            if (select && select._sdata && select._sdata.getKey() == 'dataTypeId') {
                return select;
            }
        }
        return null;
    },

    /**
     * 获取businessType的html
     */
    getBusinessTypeSelectComponent: function() {
        if (!this.selectMap) {
            return null;
        }
        for (var inputId in this.selectMap) {
            var select = this.selectMap[inputId];
            if (select && select._sdata && select._sdata.getKey() == 'businessTypeId') {
                return select;
            }
        }
        return null;
    },

    /**
     * 根据businessType来联动datatype的下拉框
     * 注意：
     *    1、当开启了dataType和businessType绑定时才有效
     *    2、并且dataType的select的注册id必须是'txt_type'
     *    3、businessType的select的注册id必须是'txt_business_type'
     */
    synDataTypeByBusinessType: function() {
        var self = this;
        var dtSelect = this.getDataTypeSelectComponent();
        var btSelect = this.getBusinessTypeSelectComponent();
        if (!dtSelect || !btSelect) {
            return;
        }
        if (SETTING && SETTING.businessTypeWithDataType) {
            var businessTypeId = btSelect.val();
            var options = self.createDataTypeOption(businessTypeId);
            dtSelect.empty();
            self.appendSelectOptions(dtSelect, options);
            dtSelect.selectpicker('refresh');
        }
        // return ;
    },

    getItemFromJson: function() {
        return null;
    },

    initInputs: function() {
        var hasData = false;
        var datas = this.getItemFromJson();
        if (datas && datas.length > 0) {
            for (var i = 0; i < datas.length; i++) {
                var data = datas[i];
                if (data.colunms && data.colunms.length == 2) {
                    var sdata1 = this.createSDataByObj(data.colunms[0]);
                    if (data.colunms[0].clientData) {
                        for (var cp in data.colunms[0].clientData) {
                            sdata1.setClient(cp, data.colunms[0].clientData[cp]);
                        }
                    }
                    var sdata2 = this.createSDataByObj(data.colunms[1]);
                    if (data.colunms[1].clientData) {
                        for (var cp in data.colunms[1].clientData) {
                            sdata2.setClient(cp, data.colunms[1].clientData[cp]);
                        }
                    }
                    this.addRow(sdata1, sdata2);
                    hasData = true;
                } else {
                    var sdata = this.createSDataByObj(data);
                    if (data.clientData) {
                        for (var cp in data.clientData) {
                            sdata.setClient(cp, data.clientData[cp]);
                        }
                    }
                    if (data.quickSearch) {
                        this.addQuick(sdata);
                    } else {
                        this.addRow(sdata);
                    }
                    hasData = true;
                }
            }
        }
        return hasData;
    },

    appendSelectOptions: function(select, options) {
        if (options && options.length > 0) {
            for (var i = 0; i < options.length; i++) {
                var value = options[i];
                var description = options[i];
                var vd = value.split(':');
                if (vd && vd.length === 2) {
                    value = vd[0];
                    description = vd[1] || value;
                }
                var option = $('<option value="' + value + '" class="input-min">' + description + '</option>');
                select.append(option);
            }
        }
    },

    /***
     * 创建特别的样式，类似select下拉框
     * @param data
     * @returns {*}
     */
    createInput: function(data) {
        var self = this;
        if (data && data.inputType) {
            var inputType = data.inputType;
            var inputId = data.inputIndex;
            if (inputType.toLowerCase().indexOf('select') >= 0) {
                var select = $('<select id="' + inputId + '" class="input-min contral-width show-tick form-control"></select>');
                var options = data.getClient('options');
                this.appendSelectOptions(select, options);
                this.inputMap[inputId] = select;
                this.selectMap[inputId] = select;
                select._sdata = data;
                if (data.getKey() == 'businessTypeId') {
                    select.change(function(e) {
                        self.synDataTypeByBusinessType();
                    })
                }
                return select;
            }
        }
        return this.constructor.superClass.createInput(data);
    },

    setOneSelectpick: function(inputId) {
        var select = this.selectMap[inputId];
        var data = select._sdata;
        var refreshCallback = data ? data.getClient("refreshCallback") : null;
        var scope = this;
        var fun = function() {
            if (refreshCallback) {
                refreshCallback(scope);
            }
        }
        if (select) {
            var $selectPicker = select.selectpicker({
                liveSearch: true,
                maxOptions: 1,
                refreshable: !!refreshCallback,
                refreshCallback: fun,
            });
        };
    },


    /**
     *  初始化selectPick,这个非得添加到body上调用才有效，如果之前掉用过，接下来的调用都无效
     */
    setSelectpick: function() {
        if (this.selectMap) {
            for (var inputId in this.selectMap) {
                this.setOneSelectpick(inputId);
            }
        }
    },

});