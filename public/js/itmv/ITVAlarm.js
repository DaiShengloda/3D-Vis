
/**
 * 配置项告警，也叫配置项故障
 */
var $ITVAlarm = function(parameters){
	it.Base.call(this);
	parameters = parameters || {};
	this._id = parameters.id || '';
	this._configItemId = parameters.configItemId || null;
	this._description = parameters.description || '';
    this._alarmSeverity = parameters.alarmSeverity || it.AlarmSeverity.CRITICAL;
    this._dateTime = parameters.dateTime||null;
	this._remarks = null;
    this._ackNotice = null;
    this._ackTime = null;
    // this.alarmTypeId = '';
    // this.time = null;
    this._status = status;
};

mono.extend($ITVAlarm, it.Base, {
	___accessor: ["id", "configItemId", 'description','alarmSeverity','dateTime','remarks','ackNotice','ackTime','status'],

	fromJson: function(json) {
		// this._alarmSeverity = it.AlarmSeverity.getByName(json.level);
		json = json || "";
        if (typeof json === 'string') {
            json = JSON.parse(json);
        }
        this._id = json.id;
        this._configItemId = json.configItemId;
        this._description = json.description;
        this._alarmSeverity = it.AlarmSeverity.getByName(json.level) || it.AlarmSeverity.getByValue(json.level);
        // this.time = json.time;
        // this.alarmTypeId = json.alarmTypeId;
        this._ackTime = json.ackTime;
        this._ackNotice = json.ackNotice;
        this._remarks = json.remarks;
        this._dateTime = json.dateTime;
        this._status = json.status;
	},

});

it.ITVAlarm = $ITVAlarm;