
var Alarm = function (id, dataId, alarmSeverity, description, dateTime,status) {
    Alarm.superClass.constructor.call(this, id, dataId, alarmSeverity, description, dateTime);
    this.realId = null;
    this.remarks = null;
    this.ackNotice = null;
    this.ackTime = null;
    this.alarmTypeId = '';
    this.time = null;
    this.status = status;
};

mono.extend(Alarm, it.Alarm, {

    getLevel: function () {
        return this._alarmServiry?this._alarmServiry.value :null;
    },

    isAcked: function () {
        return !!this.ackTime;
    },

    fromJson: function (json) {
        json = json || "";
        if (typeof json === 'string') {
            json = JSON.parse(json);
        }
        Alarm.superClass.fromJson.call(this, json);
        this._alarmSeverity = it.AlarmSeverity.getByName(json.level) || it.AlarmSeverity.getByValue(json.level);
        this.time = json.time;
        this.alarmTypeId = json.alarmTypeId;
        this.ackTime = json.ackTime;
        this.ackNotice = json.ackNotice;
        this.remarks = json.remarks;
        this.realId = json.realId;
        this.status = json.status;
    }

});

ITAlarm = Alarm;