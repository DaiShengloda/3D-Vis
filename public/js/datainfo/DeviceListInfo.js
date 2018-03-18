var $DeviceListInfo = function (sceneManager) {
    $BaseServerTab.call(this, sceneManager);
    this.sceneManager = sceneManager;
    this.init();
};

mono.extend($DeviceListInfo, $BaseServerTab, {

    showScene: 'rack',

    init: function () {
        if (!this.generalPanle || this.generalPanle.length < 1) {
            this.generalPanle = $('<div class="deviceListInfoTab infoTab scroll-class"></div');
        }
    },

    getTitle: function () {
        return it.util.i18n("GeneralInfo_Device_List_Info"); //monitor_Synchronize
    },

    getContentClass: function () {
        return 'deviceListInfo info';
    },

    getContentPanel: function () {
        return this.generalPanle;
    },

    setData: function (data) {
        this.generalPanle.empty();
        // console.log('setData')
        this.creatList(data);
    },

    creatList: function (data) {
        var categoryId = this.sceneManager.dataManager.getCategoryForData(data).getId();
        if (categoryId == 'rack') {

            var tableColumns = [{
                field: 'id',
                title: it.util.i18n("GeneralInfo_Device_List_Id"),
            }, {
                field: 'model',
                title: it.util.i18n("GeneralInfo_Device_List_Model"),
            }, {
                field: 'position',
                title: it.util.i18n("GeneralInfo_Device_List_Position"),
            }, ]
            var tableData = [];
            for (var i = 0; i < data.rackExtraInfo.devicesInfo.length; i++) {
                var info = data.rackExtraInfo.devicesInfo[i];
                tableData.push({
                    id: info.deviceId,
                    model: info.model,
                    position: info.startU + 'U - ' + info.endU + 'U(' + info.deviceU + 'U)',
                    startU: info.startU,
                })
            }
            tableData.sort(function (a, b) {
                return a.startU - b.startU;
            })
            var table = $('<table>').addClass('DeviceListTable').appendTo(this.generalPanle);
            table.bootstrapTable({
                classes: 'table-no-bordered', //不要边框
                columns: tableColumns,
                data: tableData,
                formatNoMatches: function () {
                    return it.util.i18n("GeneralInfo_Device_List_No_Device");
                },
            })
        } else {
            console.log('当前看的不是机柜，没有设备列表')
        }
    }

});

it.DeviceListInfo = $DeviceListInfo;