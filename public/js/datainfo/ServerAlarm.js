var $ServerAlarm = function(sceneManager) {
    $BaseServerTab.call(this, sceneManager);
    this.sceneManager = sceneManager;
    this.alarmPanle = $('<div class="panel"></div');
    this.deviceBody = $('<tbody class="deviceBody"></tbody>');
    this.init();
};

mono.extend($ServerAlarm,$BaseServerTab,{

    init: function() {
        var deviceHeader = $('<div class="header">设备告警</div>');
        this.alarmPanle.append(deviceHeader);
        var deviceContent = $('<div class="content"></div>');
        var deviceTable = this.createTable();
        deviceContent.append(deviceTable);
        this.alarmPanle.append(deviceContent);
        deviceTable.append(this.deviceBody);

        // var poleHeader = $('<div class="header">端口告警</div>');
        // this.alarmPanle.append(poleHeader);
        // var poleContent = $('<div class="content"></div>');
        // var poleTable = this.createTable();
        // poleContent.append(poleTable);
        // this.alarmPanle.append(poleContent);
    },

    getTitle: function() {
        return '告警信息';
    },

    getContentClass: function() {
        return 'alarm';
    },

    getContentPanel: function() {
        return this.alarmPanle;
    },

    createTable: function() {
        var table = $('<table style="width:95%"></table>');
        var t_header = $('<thead></thead>');
        var th = $('<tr>' + 
            '<th style="width:14.2%;text-align:left">资产类型</th>' +
            '<th style="width:14.2%;text-align:left">资产编号</th>' + 
            '<th style="width:14.2%;text-align:left">告警类型</th>' + 
            '<th style="width:14.2%;text-align:left">告警级别</th>' + 
            '<th style="width:14.2%;text-align:left">告警值</th>' +                       
            '<th style="width:14.2%;text-align:left">告警时间</th>' + 
            '<th style="width:14.2%;text-align:left">告警描述</th>' + 
            '</tr>'
        );
        t_header.append(th);
        table.append(t_header);       
        return table;
    },

    setData: function(data) {
        this.clearTable();
        var id = data.getId();
        var currentAlarm = this.sceneManager._alarmManager.getAlarmsByDataOrId(id);
        if (currentAlarm != null){
            var tr = $('<tr>' + 
                '<td style="width:14.2%;text-align:left" class="assetType">设备告警</td>' +
                '<td style="width:14.2%;text-align:left" class="assetId"></td>' +
                '<td style="width:14.2%;text-align:left" class="alarmType"></td>' +
                '<td style="width:14.2%;text-align:left" class="alarmLevel"></td>' +
                '<td style="width:14.2%;text-align:left" class="alarmValue"></td>' +                             
                '<td style="width:14.2%;text-align:left" class="alarmTime"></td>' +
                '<td style="width:14.2%;text-align:left" class="alarmDescription"></td>' +
                '</tr>');
            var alarm = currentAlarm._as[0];
            var id = alarm.getDataId();
            var type = this.transfromAlarmType(alarm.alarmTypeId);
            var level = alarm._alarmSeverity.description;
            var dataTime = alarm.getDateTime();
            var month = (dataTime.getMonth()+1)<10 ? '0'+ (dataTime.getMonth()+1) : (dataTime.getMonth()+1);
            var day = (dataTime.getDate()<10) ? '0' + dataTime.getDate() : dataTime.getDate();
            var hour = (dataTime.getHours()<10) ? '0' + dataTime.getHours() : dataTime.getHours();
            var minutes = (dataTime.getMinutes()<10) ? '0' + dataTime.getMinutes() : dataTime.getMinutes();
            var seconds = (dataTime.getSeconds()<10) ? '0' + dataTime.getSeconds() : dataTime.getSeconds();
            var time = dataTime.getFullYear() + '-' + month + '-' + day + ' ' +
                hour + ':' + minutes + ':' + seconds;
            var description = alarm.getDescription();
            var value = alarm.client["告警值"];
            tr.find('.assetId').text(id);
            tr.find('.alarmType').text(type);
            tr.find('.alarmLevel').text(level);
            tr.find('.alarmTime').text(time);
            tr.find('.alarmDescription').text(description);
            tr.find('.alarmValue').text(value);
        }
        this.deviceBody.append(tr);
    },  

    clearTable: function() {
        this.deviceBody.html("");
    },

    transfromAlarmType: function(type) { 
        var zh = ['温度告警','湿度告警','漏水告警'],
            en = ['temperature','humidity','waterLeak'];
        var alarmType;
        en.forEach(function(value,index){
            if (type == value){
                alarmType = zh[index];
            }
        });
        return alarmType;
    }

});

it.ServerAlarm = $ServerAlarm;