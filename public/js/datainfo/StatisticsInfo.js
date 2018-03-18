var $StatisticsInfo = function (sceneManager) {
    $BaseServerTab.call(this, sceneManager);
    this.sceneManager = sceneManager;
    this.init();
};

mono.extend($StatisticsInfo, $BaseServerTab, {

    showScene: 'rack',

    init: function () {
        if (!this.generalPanle || this.generalPanle.length < 1) {
            this.generalPanle = $('<div class="statisticsInfoTab infoTab scroll-class"></div');
        }
    },

    getTitle: function () {
        return it.util.i18n("GeneralInfo_Statistics_Info"); //monitor_Synchronize
    },

    getContentClass: function () {
        return 'statisticsInfo info';
    },

    getContentPanel: function () {
        return this.generalPanle;
    },

    setData: function (data) {
        this.generalPanle.empty();
        // console.log('setData')
        this.createInfoData(data);
    },

    createInfoData: function (rackData) {
        if (!rackData) {
            return;
        }
        var dataMap = {};
        var rackDataType = this.sceneManager.dataManager.getDataTypeForData(rackData);
        var categoryId = this.sceneManager.dataManager.getCategoryForData(rackData).getId();
        if (categoryId == 'rack') {
            var devices = rackData._childList._as;
            // var dataType = this.sceneManager.dataManager.getDataTypeForData();
            var allDeviceLength = rackDataType._childrenSize.ySize;
            var deviceDatas = [];
            // 空间统计
            var allU = rackDataType._childrenSize.ySize;
            var countU = 0;
            for (var i = 0; i < rackData.rackExtraInfo.devicesInfo.length; i++) {
                var info = rackData.rackExtraInfo.devicesInfo[i];
                countU += info.deviceU;
                deviceDatas.push({
                    startU: info.startU,
                    endU: info.endU,
                    deviceU: info.deviceU,
                })
            }
            deviceDatas.sort(function (a, b) {
                return a.startU - b.startU;
            })
            var restDatas = [];
            var l = deviceDatas.length;
            if (l == 0) {
                restDatas.push({
                    startU: 1,
                    endU: allDeviceLength,
                    restU: allDeviceLength,
                })
            } else {
                if (deviceDatas[0].startU > 1) {
                    restDatas.push({
                        startU: 1,
                        endU: deviceDatas[0].startU - 1,
                        restU: deviceDatas[0].startU - 1,
                    })
                }
                for (var i = 0; i < l - 1; i++) {
                    var restData = {
                        startU: deviceDatas[i].endU + 1,
                        endU: deviceDatas[i + 1].startU - 1,
                        restU: deviceDatas[i + 1].startU - deviceDatas[i].endU - 1,
                    };
                    if (deviceDatas[i + 1].startU - deviceDatas[i].endU - 1 > 0) {
                        restDatas.push(restData)
                    }
                }
                if (deviceDatas[l - 1].endU < allDeviceLength) {
                    restDatas.push({
                        startU: deviceDatas[l - 1].endU + 1,
                        endU: allDeviceLength,
                        restU: allDeviceLength - deviceDatas[l - 1].endU,
                    })
                }
            }
            var restDetial = [];
            if (restDatas.length == 0) {
                restDetial.push(it.util.i18n('No_Rest'));
            } else {
                for (var i = 0; i < restDatas.length; i++) {
                    var line = restDatas[i].startU + 'U - ' + restDatas[i].endU + 'U(' + restDatas[i].restU + 'U)';
                    restDetial.push(line);
                }
            }
            // 功率承重
            var countPower = rackData.rackExtraInfo.rackInfo.countPower;
            var countWeight = rackData.rackExtraInfo.rackInfo.countWeight;
            var restPower = rackData.rackExtraInfo.rackInfo.restPower;
            var restWeight = rackData.rackExtraInfo.rackInfo.restWeight;
            // 总结
            dataMap[it.util.i18n("InitPropertyDialog_U_used")] = countU + 'U';
            dataMap[it.util.i18n("InitPropertyDialog_U_left")] = (allU - countU) + 'U';
            dataMap[it.util.i18n("InitPropertyDialog_Spare_list")] = restDetial;
            dataMap[it.util.i18n("InitPropertyDialog_Power_used")] = countPower + 'W';
            dataMap[it.util.i18n("InitPropertyDialog_Power_left")] = restPower + 'W';
            dataMap[it.util.i18n("InitPropertyDialog_Weight_used")] = countWeight + 'KG';
            dataMap[it.util.i18n("InitPropertyDialog_Weight_left")] = restWeight + 'KG';
            var empityPanel = this.createEmpityPanel(it.util.i18n("GeneralInfo_Statistics_Space_info"), dataMap);
            empityPanel.appendTo(this.generalPanle);
        } else {
            console.log('当前看的不是机柜，没有统计信息')
        }


    },

    createEmpityPanel: function (title, dataMap) {
        var ePane = $('<div class="panel"></div>');
        // var header = $('<div class="panel-header">' + title + '</div>');
        // ePane.append(header);
        var content = this.createContent(dataMap);
        ePane.append(content);
        return ePane;
    },

    createContent: function (dataMap) {
        var content = $('<div class="panel-content clearfix"></div>');
        if (dataMap) {
            for (var label in dataMap) {
                var row = this.createRow(label, dataMap[label]);
                row.appendTo(content);
            }
        }
        return content;
    },

    createRow: function (label, value) {
        var row = $('<div class="content-row"></div>');
        $('<span class="left">' + label + ' :</span>').appendTo(row);
        if (Object.prototype.toString.call(value) == '[object Array]') {
            // console.log('数组');
            var right = $('<span class="right"></span>').appendTo(row);
            for (var i = 0; i < value.length; i++) {
                $('<span>' + value[i] + '</span>').appendTo(right);
            }
        } else {
            $('<span class="right"><span>' + value + '</span></span>').appendTo(row);
        }
        return row;
    },

});

it.StatisticsInfo = $StatisticsInfo;