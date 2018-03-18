var AlarmManager = function(dataManager, sceneManager) {

    it.AlarmManager.call(this, dataManager, sceneManager)
        /**
         *
         * @type {mono.List} 所有告警类型的列表
         * @private
         */
    this._alarmTypeList = new mono.List();

    /**
     *
     * @type {{}} 所有告警的map, key是告警类型id, value是alarmType对象
     * @private
     */
    this._alarmTypeMap = {};

    this._alarmStatusList = new mono.List();
    this._alarmStatusMap = {};

    this.defaultAlarmSeverityId = 'critical';
    this.defaultAlarmSeverity = null;
};

mono.extend(AlarmManager, it.AlarmManager, {

    /**
     * 增加告警类型
     * @param alarmType {it.AlarmType} 告警类型对象
     * @private
     */
    _addAlarmType: function(alarmType) {
        this._alarmTypeList.add(alarmType);
        this._alarmTypeMap[alarmType.getId()] = alarmType;
    },

    /**
     * 删除告警类型
     * @param alarmType {it.AlarmType} 告警类型对象
     @returns {|it.AlarmType} 返回告警类型对象
     * @private
     */
    _removeAlarmType: function(alarmType) {
        var oldAlarmType = this._alarmTypeMap[alarmType.getId()];
        this._alarmTypeList.remove(oldAlarmType);
        delete this._alarmTypeMap[alarmType.getId()];
        return oldAlarmType;
    },

    /**
     * 去的告警类型
     * @param alarmTypeOrId {string|it.AlarmType} 告警类型或类型id
     * @returns {it.AlarmType}
     */
    getAlarmType: function(alarmTypeOrId) {
        if (!alarmTypeOrId) {
            return null;
        }
        var alarmType = null;
        if (alarmTypeOrId.IT_Alarm_Type) {
            alarmType = this._alarmTypeMap[alarmTypeOrId.getId()];
        } else {
            alarmType = this._alarmTypeMap[alarmTypeOrId];
        }
        return alarmType;
    },

    getAlarmStatus: function(alarmStatusOrId) {
        if (!alarmStatusOrId) {
            return null;
        }
        var alarmStatus = null;
        if (alarmStatusOrId.IT_Alarm_Status) {
            alarmStatus = this._alarmStatusMap[alarmStatusOrId.getStatusCode()];
        } else {
            alarmStatus = this._alarmStatusMap[alarmStatusOrId];
        }
        return alarmStatus;
    },

    /**
     * 增加告警类型
     * @param alarmType {it.AlarmType} 告警类型对象
     */
    addAlarmType: function(alarmType) {
        if (!alarmType) {
            throw 'alarmType is null or undefined'
        }
        if (!alarmType.IT_Alarm_Type) {
            throw 'alarmType is not it.AlarmType'
        }
        if (!alarmType.getId()) {
            throw 'alarmType`s id is empty'
        }
        var a = this._alarmTypeMap[alarmType.getId()];
        if (a) {
            throw 'alarmType`s id repeat';
        }
        this._addAlarmType(alarmType);
    },

    addAlarmStatus: function(alarmStatus) {
        this._alarmStatusList.add(alarmStatus);
        this._alarmStatusMap[alarmStatus.getStatusCode()] = alarmStatus;
    },

    /**
     * 删除告警类型
     * @param alarmTypeOrId {string|it.AlarmType} 告警类型对象活着对象的id
     @returns {|it.AlarmType}
     */
    removeAlarmType: function(alarmTypeOrId) {
        if (!alarmTypeOrId) {
            throw 'alarmTypeOrId is null or undefined'
        }
        var alarmType = null;
        if (alarmTypeOrId.IT_Alarm_Type) {
            alarmType = this._alarmTypeMap[alarmTypeOrId.getId()];
        } else {
            alarmType = this._alarmTypeMap[alarmTypeOrId];
        }
        if (!alarmType) {
            console.warn('alarmType is not exist');
            return;
        }
        return this._removeAlarmType(alarmType);
    },

    clearAlarmType: function() {
        var list = this._alarmTypeList.toList();
        this._alarmTypeList.clear();
        this._alarmTypeMap = {};
        return list;
    },
    /**
     * 根据告警(或者告警的id)取得告警的类型
     * @param alarmOrId
     * @returns {it.AlarmType}
     */
    getAlarmTypeByAlarm: function(alarmOrId) {
        if (!alarmOrId) {
            return null;
        }
        var alarm = this.getAlarm(alarmOrId);
        if (alarm) {
            return this.getAlarmType(alarm.alarmTypeId);
        }
        return null;
    },

    getAlarmStatusByAlarm: function(alarmOrId) {
        if (!alarmOrId) {
            return null;
        }
        var alarm = this.getAlarm(alarmOrId);
        if (alarm) {
            return this.getAlarmStatus(alarm.status);
        }
        return null;
    },

    /**
     * 增加告警级别
     * @param json
     */
    addAlarmSeverityFromJson: function(json) {

        var jsonObjects = it.Util.toJsonArray(json);
        //新加系统默认的, 再加自定义的, 可以用用户自定义的级别值覆盖掉默认的
        var i = 0,
            len = jsonObjects.length;
        for (i = 0; i < len; i++) {
            var jsonObject = jsonObjects[i];
            var value = jsonObject.value;
            var name = jsonObject.id;
            var nickName = jsonObject.nickName;
            var color = jsonObject.color;
            var displayName = jsonObject.displayName;
            if (jsonObject.system) {
                var s = it.AlarmSeverity.add(value, name, nickName, color, displayName);
                s.description = jsonObject.description;
            }
        }
        for (i = 0; i < len; i++) {
            var jsonObject = jsonObjects[i];
            var value = jsonObject.value;
            var name = jsonObject.id;
            var nickName = jsonObject.nickName;
            var color = jsonObject.color;
            var displayName = jsonObject.displayName;
            if (!jsonObject.system) {
                var s = it.AlarmSeverity.add(value, name, nickName, color, displayName);
                s.description = jsonObject.description;
            }
        }
        this.defaultAlarmSeverity = it.AlarmSeverity.getByName(this.defaultAlarmSeverityId);
        if (!this.defaultAlarmSeverity) {
            console.error(it.util.i18n("AlarmManager_Default_level_not_exist"));
        }
    },

    /**
     * 增加告警类型
     * @param json
     */
    addAlarmTypeFromJson: function(json) {

        var jsonObjects = it.Util.toJsonArray(json);
        var i = 0,
            len = jsonObjects.length;
        for (; i < len; i++) {
            var jsonObject = jsonObjects[i];
            var alarmType = new AlarmType(jsonObject);
            if (!it.AlarmSeverity.getByName(jsonObject.level)) {
                alarmType._level = this.defaultAlarmSeverityId;
                alarmType._alarmSeverity = this.defaultAlarmSeverity;
            }
            this.addAlarmType(alarmType);
        }
    },

    /**
     * 通过json创建alarms
     * @param json
     */
    addAlarmFromJson: function(json) {
        var result = [];
        var jsonObjects = it.Util.toJsonArray(json);
        var i = 0,
            len = jsonObjects.length;
        for (; i < len; i++) {
            var jsonObject = jsonObjects[i];

            //校验告警类型
            if (!this._alarmTypeMap[jsonObject.alarmTypeId]) {
                console.error(it.util.i18n("AlarmManager_Alarm_type_not_exist") + ':', jsonObject, "  " + it.util.i18n("AlarmManager_All_type") + ":", this._alarmTypeMap);
                continue;
            }

            //如果告警级别不存在, 取告警类型的级别
            //如果是未知级别, 取默认的级别
            if (!jsonObject.level) {
                jsonObject.level = this._alarmTypeMap[jsonObject.alarmTypeId].getLevel();
            } else if (jsonObject.level && !it.AlarmSeverity.getByName(jsonObject.level)) {
                jsonObject.level = this.defaultAlarmSeverityId;
            }
            var alarmSeverity = it.AlarmSeverity.getByName(jsonObject.level);
            var alarm = new Alarm(jsonObject.id, jsonObject.dataId, alarmSeverity, jsonObject.description, jsonObject.time, jsonObject.status);
            alarm.fromJson(jsonObject);
            alarm.client = jsonObject.client;
            alarm.devIp = jsonObject.devIp;
            result.push(alarm);
            this.add(alarm);
        }
        return result;
    },

    addAlarmStausFromJson: function(json) {
        var jsonObjects = it.Util.toJsonArray(json);
        var i = 0,
            len = jsonObjects.length;
        for (; i < len; i++) {
            var jsonObject = jsonObjects[i];
            var alarmStatus = new AlarmStatus(jsonObject);

            this.addAlarmStatus(alarmStatus);
        }
    },
    getAlarmSeverityName: function(alarmSeverity) {
        var name = alarmSeverity.name;
        var displayName = alarmSeverity.displayName;
        return displayName || name;
    }
});
it.SceneManager.prototype.getAlarmManagerClass = function() {
    return AlarmManager;
}