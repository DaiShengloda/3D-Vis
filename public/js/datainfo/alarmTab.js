var $alarmTab = function (sceneManager) {
    $BaseServerTab.call(this, sceneManager);
    this.sceneManager = sceneManager;
    // this.generalPanle = $('.baseInfoTab');
    this.generalPanle = $('<div class="alarmTab infoTab"></div>');
    this.init();
};

mono.extend($alarmTab, $BaseServerTab, {

    init: function () {
        if (!this.generalPanle || this.generalPanle.length < 1) {
            this.generalPanle = $('<div class="alarmTab infoTab"></div');
        }
        if ($('.alarm-detail-panel').length > 0) {
            $('.alarm-detail-panel').parent().remove();
        }
    },

    getTitle: function () {
        return it.util.i18n("ClientAlarmManager_Alarm_info"); //monitor_Synchronize
    },

    getContentClass: function () {
        return 'alarmInfo info ';
    },

    getContentPanel: function () {
        return this.generalPanle;
    },

    setData: function (data) {
        this.generalPanle.empty();
        if (!data) {
            return;
        }

        if (data._alarmState._propagateAlarmCount > 0) {
            var propagateAlarmMap = this.getPropagateAlarmMap(data);
            var propagateAlarmPanel = this.createEmpityPanel(it.util.i18n('ClientAlarmManager_trans_alarms'), propagateAlarmMap);
            this.generalPanle.append(propagateAlarmPanel);
        }
        

        if (data._alarmState._selfAlarmCount > 0) {
            var selfHighestAlarmMap = this.getSelfHighestAlarmMap(data);
            var id = data.getId();
            var buttons = [{
                    label: it.util.i18n('ClientAlarmManager_Current_Alarms'),
                    value: it.util.i18n('ClientAlarmManager_Detail'),
                    clickFuc: function () {
                        main.clientAlarmManager.alarmTable.$filter.find('input').val(id);
                        main.clientAlarmManager.showAlarmTable();
                    }
                },
                {
                    label: it.util.i18n('ClientAlarmManager__All_Alarms'),
                    value: it.util.i18n('ClientAlarmManager_Detail'),
                    clickFuc: function (data) {
                        main.clientAlarmManager.alarmLogDialog.showListDialog();
                        $('#alarmListDialog').find('.searchBox').find('.asset_id').val(id);
                        $('#alarmListDialog').find('.searchButton').trigger('click');
                    }
                }
            ];

            var selfHighestAlarmpanel = this.createEmpityPanel(it.util.i18n('ClientAlarmManager__Self_Alarm'), selfHighestAlarmMap, buttons);
            this.generalPanle.append(selfHighestAlarmpanel);
        }
    },

    //获取传播告警
    getPropagateAlarmMap: function (data) {
        var propagateAlarmMap = {};
        propagateAlarmMap[it.util.i18n('ClientAlarmManager_trans_alarms')] = data._alarmState._propagateAlarmCount;
        propagateAlarmMap[it.util.i18n('ClientAlarmManager_trans_alarm_level')] = data._alarmState._propagateHighestAlarmSeverity.displayName;
        return propagateAlarmMap;
    },

    //自身告警
    getSelfHighestAlarmMap: function (data) {
        var selfHighestAlarmMap = {};
        selfHighestAlarmMap[it.util.i18n('ClientAlarmManager_Alarm_amount')] = data._alarmState._selfAlarmCount;
        var alarms = this.sceneManager._alarmManager.getAlarmsByDataOrId(data.getId())._as;
        var heigestAlarm = alarms[0];
        alarms.forEach(function (val) {
            if (val._alarmSeverity.value > heigestAlarm._alarmSeverity.value) {
                heigestAlarm = val;
            }
        }, this);

        selfHighestAlarmMap[it.util.i18n('ClientAlarmManager_highest_level')] = heigestAlarm._alarmSeverity.displayName;
        selfHighestAlarmMap[it.util.i18n('ClientAlarmManager_Alarm_Type')] = main.sceneManager._alarmManager.getAlarmType(heigestAlarm.alarmTypeId).getName();
        selfHighestAlarmMap[it.util.i18n('ClientAlarmManager_Alarm_Desc')] = heigestAlarm._description;
        selfHighestAlarmMap[it.util.i18n('ClientAlarmManager_Alarm_Time')] = heigestAlarm._dateTime;
        return selfHighestAlarmMap;
    },

    createEmpityPanel: function (title, dataMap, buttons) {
        var ePane = $('<div class="panel"></div>');
        var header = $('<div class="panel-header">' + title + '</div>');
        ePane.append(header);
        var content = this.createContent(dataMap, buttons);
        ePane.append(content);
        return ePane;
    },

    createContent: function (dataMap, buttons) {
        var content = $('<div class="panel-content clearfix"></div>');
        if (dataMap) {
            for (var label in dataMap) {
                var row = this.createRow(label, dataMap[label]);
                row.appendTo(content);
            }
        }

        if (buttons && buttons.length > 0) {
            buttons.forEach(function (val) {
                var buttonRow = this.createButtonRow(val.label, val.value, val.clickFuc);
                buttonRow.appendTo(content);
            }, this);
        }
        return content;
    },

    createRow: function (label, value) {
        var row = $('<div class="content-row"></div>');
        $('<span class="left">' + label + '   :</span>').appendTo(row);
        $('<span class="right"><span>' + value + '</span></span>').appendTo(row);
        return row;
    },

    createButtonRow: function (label, value, clickFuc) {
        var row = $('<div class="content-row"></div>');
        $('<span class="left">' + label + '   :</span>').appendTo(row);
        var right = $('<span class="right"></span>').appendTo(row);
        var btn = $('<button class="bt-btn">' + value + '</button>').appendTo(right);
        btn.on('click', clickFuc);
        return row;
    },

    isShow: function (data) {
        if ((data._alarmState._propagateAlarmCount + data._alarmState._selfAlarmCount) <= 0) {
            this.isShowFlag = false;
        }
        return this.isShowFlag;
    },
});

it.alarmTab = $alarmTab;