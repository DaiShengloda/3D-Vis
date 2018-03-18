var $GeneralInfo = function (sceneManager) {
    $BaseServerTab.call(this, sceneManager);
    this.sceneManager = sceneManager;
    // this.generalPanle = $('.baseInfoTab');
    this.generalPanle = $('<div class="infoTab"></div>');
    this.columnInfos = null;
    this.init();
};

mono.extend($GeneralInfo, $BaseServerTab, {

    init: function () {
        if (!this.generalPanle || this.generalPanle.length < 1) {
            this.generalPanle = $('<div class="infoTab"></div');
            $('#serverPanel').append(this.generalPanle); //如果连这些(serverPanel)都没有，那就没法显示了
        }
    },

    getTitle: function () {
        return it.util.i18n("GeneralInfo_General_info"); //monitor_Synchronize
    },

    getContentClass: function () {
        return 'info';
    },

    getContentPanel: function () {
        return this.generalPanle;
    },

    setData: function (data) {
        this.generalPanle.empty();
        if (!data) {
            return;
        }
        var category = this.sceneManager.dataManager.getCategoryForData(data);
        if (!category) {
            return;
        }
        if (!this.columnInfos || !this.columnInfos[category.getId()]) {
            var self = this;
            ServerUtil.api('data', 'findCustomColumnsByCategoryId', { categoryId: 'equipment' },
                function (items) {
                    var objs = {};
                    for (var i = 0; i < items.length; i++) {
                        var item = items[i];
                        if (objs[item.column_group_id]) {
                            objs[item.column_group_id].push(item.column_name);
                        } else {
                            objs[item.column_group_id] = [item.column_name];
                        }
                    }
                    if (!self.columnInfos) {
                        self.columnInfos = {};
                    }
                    self.columnInfos[category.getId()] = objs;
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
        var baseInfoDataMap = this.createBaseInfoDataMap(data);
        var extBaseInfo = info[it.util.i18n("DevPanelManager_Panel_info")];
        if (extBaseInfo && extBaseInfo instanceof Array) {
            for (var i = 0; i < extBaseInfo.length; i++) {
                var pro = extBaseInfo[i];
                if (!baseInfoDataMap.hasOwnProperty(pro)) {
                    baseInfoDataMap[pro] = clientMap[pro];
                }
            }
        }
        var baseInfoPane = this.createEmpityPanel(it.util.i18n("DevPanelManager_Panel_info"), baseInfoDataMap);
        this.generalPanle.append(baseInfoPane);
        for (var groupId in info) {
            if (groupId != it.util.i18n("DevPanelManager_Panel_info")) {
                var pros = info[groupId];
                var proAndValues = {};
                for (var i = 0; i < pros.length; i++) {
                    var pro = pros[i];
                    var proValue = clientMap[pro];
                    proAndValues[pro] = proValue;
                };
                var groupPanel = this.createEmpityPanel(groupId, proAndValues);
                this.generalPanle.append(groupPanel);
            }
        }
    },

    createBaseInfoDataMap: function (data) {
        var parentData = this.sceneManager.dataManager.getDataById(data.getParentId()) || {};
        var dataType = this.sceneManager.dataManager.getDataTypeForData(data);
        var businessType = this.sceneManager.dataManager.getBusinessTypeForData(data);
        var key1 = it.util.i18n("GeneralInfo_Device_ID");
        var key2 = it.util.i18n("GeneralInfo_Device_Name");
        var key3 = it.util.i18n("GeneralInfo_Asset_Model");
        var key4 = it.util.i18n("GeneralInfo_Business_type");

        var baseInfoDataMap = {};
        baseInfoDataMap[key1] = data.getId();
        baseInfoDataMap[key2] = data.getName();
        baseInfoDataMap[key3] = dataType.getDescription() || dataType.getId();
        baseInfoDataMap[key4] = businessType ? businessType.getDescription() : '';
        if (dataType.getCategoryId() &&
            dataType.getCategoryId().toLowerCase() === 'equipment') {
            if (parentData) {
                baseInfoDataMap[it.util.i18n("GeneralInfo_Frame")] = parentData.getName() || parentData.getDescription() || data.getParentId();
            } else {
                baseInfoDataMap[it.util.i18n("GeneralInfo_Frame")] = data.getParentId();
            }
            baseInfoDataMap[it.util.i18n("GeneralInfo_U_Start")] = data.getLocation() ? data.getLocation().y : 'undefined';
            baseInfoDataMap[it.util.i18n("GeneralInfo_U_Occupy")] = dataType.getSize() ? dataType.getSize().ySize : 'undefined';
        }
        return baseInfoDataMap;
    },

    createEmpityPanel: function (title, dataMap) {
        var ePane = $('<div class="panel"></div>');
        var header = $('<div class="header">' + title + '</div>');
        ePane.append(header);
        var contentPane = $('<div class="content"></div>');
        ePane.append(contentPane);
        var table = this.createTable(dataMap);
        contentPane.append(table);
        return ePane;
    },

    createTable: function (dataMap) {
        var table = $('<table></table>');
        if (dataMap) {
            var rowData = {};
            var flag = 0;
            for (var label in dataMap) {
                if (flag % 3 === 0) {
                    var row = this.createRow(rowData);
                    table.append(row);
                    rowData = {};
                }
                rowData[label] = dataMap[label];
                flag++;
            }
            var row = this.createRow(rowData);
            table.append(row);
        }
        return table;
    },

    createRow: function (rowData) {
        var row = $('<tr></tr>');
        if (rowData) {
            for (var label in rowData) {
                var col = this.createColumn(label, rowData[label]);
                row.append(col);
            }
        }
        return row;
    },

    createColumn: function (label, value) {
        value = value || '';
        var col = $('<td><label>' + label + ':</label><input value="' + value + '" readonly></td>');
        return col;
    },
});