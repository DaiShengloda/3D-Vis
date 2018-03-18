/**
 * 告警类型
 * @param parameters
 */

var AlarmStatus = function (parameters) {
    parameters = parameters || {};
    this._status_code = parameters.statusCode || "";
    this._status_name = parameters.statusName || "";
    this._action = parameters.action || "";
    // this._id = parameters.id || "";
    // this._name = parameters.name || "";
    // this._level = parameters.level || it.AlarmSeverity.CLEARED.value;
    // this._alarmSeverity = it.AlarmSeverity._vm[this._level];
    // this._description = parameters.description || '';
};


mono.extend(AlarmStatus, Object, {

    IT_Alarm_Status: true,

    getStatusCode:function(){
        return this._status_code;
    },


    getStatusName: function () {
        return this._status_name;
    },

    getAction: function () {
        return this._action;
    },

    fromJson: function (json) {
        if (typeof json === 'string') {
            json = JSON.parse(json);
        }
        this._status_code = json.status_code;
        this._status_name = json.status_name;
        this._action = json.action;
    }
});