/**
 * 告警类型
 * @param parameters
 */

var AlarmType = function (parameters) {
    parameters = parameters || {};
    this._id = parameters.id || "";
    this._name = parameters.name || "";
    this._level = parameters.level;
    this._alarmSeverity = it.AlarmSeverity._vm[this._level];
    this._description = parameters.description || '';
};


mono.extend(AlarmType, Object, {

    IT_Alarm_Type: true,

    getId:function(){
        return this._id;
    },


    getAlarmSeverity: function () {
        return it.AlarmSeverity._vm[this._level];
    },

    getName: function () {
        return this._name;
    },

    getLevel: function () {
        return this._level;
    },


    getDescription: function () {
        return this._description;
    },

    fromJson: function (json) {
        if (typeof json === 'string') {
            json = JSON.parse(json);
        }
        this._id = json.id;
        this._name = json.name;
        this._level = json.level;
        this._alarmSeverity = it.AlarmSeverity._vm[this.level];
        this._description = json.description;
    }
});