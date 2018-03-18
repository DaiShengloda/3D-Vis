
/**
 *
 * 配置项告警/故障类
 *
 * 1、配置项没有真假模型，因此不需要向idc中的那样当focuse变化后还要对真假变化做处理
 * 2、也存在告警/故障级别，按最高级别的来渲染
 * 3、这里的告警传播需要注意，应该是通过relation来的，而不是像idc中的父子关系
 * 4、
 *
 */
var $ITVAlarmManager = function(itvManager){
	it.Base.call(this);
	this.itvManager = itvManager;
	this.itvDataManager = this.itvManager.itvDataManager;
    this._alarmList = new mono.List();
    /**
     *
     * @type {{}} 所有告警集合key是告警id, vlaue是告警对象
     * @private
     */
    this._alarmMap = {};

    /**
     *
     * @type {{}} key是data的id, value是集合(mono.List),该data的所有告警
     * @private
     */
    this._configItemAlarms = {};
    
    /**
     * 
     */
    this.renderType = it.AlarmManager.RENDER_TYPE_DEFAULT;
    this.propagateType = 'FROM'; // 告警的传播方向，“TO”表示的是向下传播，'FROM'是向上传播、其他表示的是向上下都传播
    
    /**
     * 告警渲染的 node 列表
     * @type {{}}
     * @private
     */
    this._alarmNodeMap = {};
    /**
     * 需要重新计算告警状态的数据集合
     * @type {Array}
     * @private
     */
    this._dirtyDataAlarmState = [];
    /**
     * 告警增删动作监听
     * @type {mono.EventDispatcher}
     * @private
     */
    this._alarmManagerChangeDispatcher = new mono.EventDispatcher();
    /**
     * 告警更新动作监听
     * @type {mono.EventDispatcher}
     * @private
     */
    this._alarmPropertyChangeDispatcher = new mono.EventDispatcher();

	this.init();
};

mono.extend($ITVAlarmManager,it.Base,{
	
	init : function(){
		this.itvManager.addManagerChangeListener(this._itvManagerChangeHandle,this);
		this.addAlarmManagerChangeListener(this._handleAlarmManagerChange, this, true);
	},

	addAlarmManagerChangeListener: function (listener, scope, ahead) {
        this._alarmManagerChangeDispatcher.add(listener, scope, ahead);
    },

    removeAlarmManagerChangeListener: function (listener, scope) {
        this._alarmManagerChangeDispatcher.remove(listener, scope);
    },

    addAlarmPropertyChangeListener: function (listener, scope, ahead) {
        this._alarmPropertyChangeDispatcher.add(listener, scope, ahead);
    },

    removeAlarmPropertyChangeListener: function (listener, scope) {
        this._alarmPropertyChangeDispatcher.remove(listener, scope);
    },

    /**
     * 告警的属性变化
     * @param e
    */
    handleAlarmDataPropertyChange: function (e) {
        this._alarmPropertyChangeDispatcher.fire(e);
    },

	addCIAlarmsFromJson : function(json){
		var jsonObjects = json;
		if (typeof json === "string") {
			jsonObjects = JSON.parse(json);
		}
		var i = 0,
			len = jsonObjects.length;
		for (; i < len; i++) {
			var jsonObject = jsonObjects[i];
			var alarm = new it.ITVAlarm();
			alarm.fromJson(jsonObject);
			this.add(alarm);
		}
	},

	add : function(alarm){
		if (!alarm) {
			return ;
		}
		var configItemId = alarm.getConfigItemId();
		this._alarmList.add(alarm);
		this._alarmMap[alarm.getId()] = alarm;
		var alarms = this._configItemAlarms[configItemId];
		if (!alarms) {
			alarms = this._configItemAlarms[configItemId] = new mono.List();
		}
		alarms.add(alarm);
		this._alarmManagerChangeDispatcher.fire({
            kind: 'add',
            data: alarm
        });
		alarm.addPropertyChangeListener(this.handleAlarmDataPropertyChange, this);
	},

    remove: function (alarm) {
        this._alarmList.remove(alarm);
        var configItemId = alarm.getConfigItemId();
        delete this._alarmMap[configItemId];
        var alarms = this._configItemAlarms[configItemId];
        if (alarms) {
            alarms.remove(alarm);
        }
        if (alarms && alarms.size() == 0) {
            delete this._configItemAlarms[configItemId];
        }
        this._alarmManagerChangeDispatcher.fire({
            kind: 'remove',
            data: alarm
        });
        alarm.removePropertyChangeListener(this.handleAlarmDataPropertyChange, this);
    },

    clear: function () {
        var list = this._alarmList.toList();
        this._alarmList.clear();
        this._alarmMap = {};
        this._configItemAlarms = {};
        this._dirtyDataAlarmState = [];
        this._alarmManagerChangeDispatcher.fire({
            kind: 'clear',
            datas: list
        });
        return list;
    },

	_itvManagerChangeHandle : function(e){
		if (!e) {
			return ;
		}
		var type = e.type;
		var kind = e.kind;
		var node = e.data;
		if (type && type == 'CI' && kind == 'add') {
			var ci = node.getClient('itv_data');
			this.renderCIAlarm(ci);
		}
	},

	/**
     * 告警的增删，同步data对象上的告警状态
     * @param e
     */
    _handleAlarmManagerChange: function (e) {
        if (e.kind === 'add') {
            var alarm = e.data;
            var ci = this.itvDataManager._configItemMap[alarm.getConfigItemId()];
            if (ci) {
                var self = this;
                clearTimeout(ci._calculateTimerId);
                ci._calculateTimerId = setTimeout(function () {
                  self.calculateDataAlarmState(ci);
                },100);

            }
        } else if (e.kind === 'remove') {
            var alarm = e.data;
            var ci = this.itvDataManager._configItemMap[alarm.getConfigItemId()];
            if (ci) {
                var self = this;
                self.calculateDataAlarmState(ci);
            }
        } else if (e.kind === 'clear') {
            //清除的所有告警
            var alarms = e.datas;
            if (alarms && alarms.size() > 0) {
                //找到所有dataId
                var dataArr = this.itvDataManager._configItemList;
                if (dataArr && dataArr.length > 0) {
                    var len = dataArr.length;
                    //清除告警标记
                    for (var i = 0; i < len; i++) {
                        var data = dataArr[i];
                        var state = data.getAlarmState();
                        if (state.getAlarmCount()) {
                            state.clear();
                        }
                    }
                }
                // for (var id in this._alarmBillboardMap) {
                //     this._sceneManager.removeBillboard(this._alarmBillboardMap[id]);
                // }
                // this._alarmBillboardMap = {};
                for (var id in this._alarmNodeMap) {
                    this._clearNodeAlarmEffect(this._alarmNodeMap[id]);
                }
                this._alarmNodeMap = {};
            }
        }
    },

    _setCIAlarmStateDirty: function (configItem) {
        configItem['_alarmRenderDirty'] = true;
    },

    _clearCIAlarmStateDirty: function (configItem) {
        delete configItem['_alarmRenderDirty'];
    },

    _isCIAlarmStateDirty: function (configItem) {
        return configItem['_alarmRenderDirty'];
    },

	getConfigItemAlarmState : function(configItem){
		var result = {
            highestAlarmSeverity: null,
            alarmCount: 0,
        };
        var alarms = this._configItemAlarms[configItem.getId()];
        if (alarms) {
            result.alarmCount = alarms.size();
            alarms.forEach(function (alarm) {
                if (!result.highestAlarmSeverity) {
                    result.highestAlarmSeverity = alarm.getAlarmSeverity();
                } else {
                    var severity = alarm.getAlarmSeverity();
                    if (it.AlarmSeverity.compare(severity, result.highestAlarmSeverity) > 0) {
                        result.highestAlarmSeverity = severity;
                    }
                }
            })
        }
        return result;
	},

    /**
     *
     * 根据配置项获取其传播的到的对象，这个对象不是parent，有关联(通过relation关联)的对象，且其关联对象可能不止一个
     * 关联有可能是从(from)到它的对象集合，也有可能是从它到(to到)的对象集合
     * this.propagateType 传播类型，有三种from，to和其他，from表示的是往from上传播，to表示的是往to上传播，其他就表示向from和to都传播
     * 
     */
    getPropagateCIByCI : function(configItemOrId){
        if (!this.itvManager.relationManager._relConfigItemMap) {
            this.itvManager.relationManager.resetLinkTree();
        }
        var cId = configItemOrId;
        if (configItemOrId instanceof it.ITVConfigItem) {
            cId = configItemOrId.getId();
        }
        var relObj = this.itvManager.relationManager._relConfigItemMap[cId];
        if (!relObj) {
            return null;
        }
        var result = [];
        if (this.propagateType == 'TO') {
            var toCIs = relObj.toDatas;
            if (toCIs && toCIs.length > 0) {
                for (var i = 0; i < toCIs.length; i++) {
                    var relation = toCIs[i];
                    var toId = relation.getToId();
                    result.push(this.itvManager.itvDataManager._configItemMap[toId]);
                }
            }
        }else if(this.propagateType == 'FROM'){
            var fromCIs = relObj.fromDatas;
            if (fromCIs && fromCIs.length > 0) {
                for (var i = 0; i < fromCIs.length; i++) {
                    var relation = fromCIs[i];
                    var fromId = relation.getFromId();
                    result.push(this.itvManager.itvDataManager._configItemMap[fromId]);
                }
            }
        }else{
            var toCIs = relObj.toDatas;
            var fromCIs = relObj.fromDatas;
            if (toCIs && toCIs.length > 0) {
                for (var i = 0; i < toCIs.length; i++) {
                    var relation = toCIs[i];
                    var toId = relation.getToId();
                    result.push(this.itvManager.itvDataManager._configItemMap[toId]);
                }
            }
            if (fromCIs && fromCIs.length > 0) {
                for (var i = 0; i < fromCIs.length; i++) {
                    var relation = fromCIs[i];
                    var fromId = relation.getFromId();
                    result.push(this.itvManager.itvDataManager._configItemMap[fromId]);
                }
            }
        }
        return result;
    },
    
    /**
     * 根据配置项获取传到它上面的配置项，这个计算方法跟getPropagateCIByCI相反
     */
    getPropagateChildrenByCI : function(configItemOrId){
        var cId = configItemOrId;
        if (configItemOrId instanceof it.ITVConfigItem) {
            cId = configItemOrId.getId();
        }
        var relObj = this.itvManager.relationManager._relConfigItemMap[cId];
        if (!relObj) {
            return null;
        }
        var result = [];
        if (this.propagateType == 'FROM') {
            var toCIs = relObj.toDatas;
            if (toCIs && toCIs.length > 0) {
                for (var i = 0; i < toCIs.length; i++) {
                    var relation = toCIs[i];
                    var toId = relation.getToId();
                    result.push(this.itvManager.itvDataManager._configItemMap[toId]);
                }
            }
        }else if(this.propagateType == 'TO'){
            var fromCIs = relObj.fromDatas;
            if (fromCIs && fromCIs.length > 0) {
                for (var i = 0; i < fromCIs.length; i++) {
                    var relation = fromCIs[i];
                    var fromId = relation.getFromId();
                    result.push(this.itvManager.itvDataManager._configItemMap[fromId]);
                }
            }
        }else{
            var toCIs = relObj.toDatas;
            var fromCIs = relObj.fromDatas;
            if (toCIs && toCIs.length > 0) {
                for (var i = 0; i < toCIs.length; i++) {
                    var relation = toCIs[i];
                    var toId = relation.getToId();
                    result.push(this.itvManager.itvDataManager._configItemMap[toId]);
                }
            }
            if (fromCIs && fromCIs.length > 0) {
                for (var i = 0; i < fromCIs.length; i++) {
                    var relation = fromCIs[i];
                    var fromId = relation.getFromId();
                    result.push(this.itvManager.itvDataManager._configItemMap[fromId]);
                }
            }
        }
        return result;
    },

    _dirtyOneCIsDataAlarmState: function(ci,isSkipRender) {
        if (!ci) {
            return;
        }
        var self = this;
        var alarmState = ci.getAlarmState();
        var alarmCount = alarmState.getSelfAlarmCount();
        if (alarmCount <= 0) {
            ci.isSkipRender = isSkipRender;
        } else {
            ci.isSkipRender = null;
        }
        clearTimeout(ci._dirtyParentTimerId);
        ci._dirtyParentTimerId = setTimeout(function() {
            self._dirtyDataAlarmState.push(ci);
            if (self._dirtyDataAlarmState) {
                self._calculateDataPropagateAlarmState();
            }
        }, 10);
    },

    /**
     * 将ci的父亲加入到dirty列表中,需要重新计算上浮告警
     * @param data
     * @private
     */
    _dirtyParentsDataAlarmState: function (ci, isSkipRender) {
        var parents = this.getPropagateCIByCI(ci);
        if (parents && parents.length > 0) {
            for(var i = 0 ; i < parents.length ; i++){
                this._dirtyOneCIsDataAlarmState(parents[i],isSkipRender);
            }
        } else if (this._dirtyDataAlarmState) {
            this._calculateDataPropagateAlarmState();
        }
    },

    isStopAlarmPropagation : function(configItem){
        return false;
    },

	/**
     * 计算配置项的自身告警/故障的状态,如果状态发生变化,会同步会触发计算parentData的上浮告警状态
     * @param configItem {it.ITVConfigItem} 
     */
    calculateDataAlarmState: function (configItem) {
        var alarmStateValue = this.getConfigItemAlarmState(configItem);//自身告警的数量和最高级别
        var alarmState = configItem.getAlarmState();
        var alarmCount = alarmState.getSelfAlarmCount();
        var highestAlarmSeverity = alarmState.getSelfHighestAlarmSeverity();
        //如果自身告警数量和总的告警数量相等并且最高级别也相等, 说明没有告警变化
        if (alarmCount == alarmStateValue.alarmCount
            && it.AlarmSeverity.compare(alarmStateValue.highestAlarmSeverity, highestAlarmSeverity) == 0) {
            return;
        }
        alarmState.setSelfHighestAlarmSeverity(alarmStateValue.highestAlarmSeverity);
        alarmState.setSelfAlarmCount(alarmStateValue.alarmCount);
        //2017-10-27 可是如果parent自己有告警，parent就不skip了，有可能child的告警先来，parent的告警后来，由于先来时就将skiprender设置成TRUE
        if (alarmStateValue.alarmCount > 0) {
            configItem.isSkipRender = null;
        }
        this._calculateDataAlarmState(configItem);
        
        //自己或者孩子阻止了告警 
        var isSkipRender = this.isStopAlarmPropagation(configItem) || configItem.isSkipRender;
        this._dirtyParentsDataAlarmState(configItem, isSkipRender);

    },

    /**
     * 计算一个配置项告警的上浮告警状态,如果告警状态发生变化, 会同步会触发计算parentData的上浮告警状态
     * 配置项的告警的传播/上浮是通过relation来确定的
     * @param configItem
     */
    calculateDataPropagateAlarmState: function (configItem) {
        // var children = this._dataManager.getChildren(data);
        var children = this.getPropagateChildrenByCI(configItem);
        var result = {
            highestAlarmSeverity: null,
            alarmCount: 0,
        };
        if (children) {
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                var alarmState = child.getAlarmState();
                result.alarmCount += alarmState.getAlarmCount();
                result.highestAlarmSeverity = this._getHighestAlarmSeverity(result.highestAlarmSeverity, alarmState.getHighestAlarmSeverity())
            }
        }
        var alarmState = configItem.getAlarmState();
        var alarmCount = alarmState.getPropagateAlarmCount();
        var highestAlarmSeverity = alarmState.getPropagateHighestAlarmSeverity();
        //if (alarmCount == result.alarmCount
        //    && it.AlarmSeverity.compare(result.highestAlarmSeverity, highestAlarmSeverity) == 0) {
        //    return;
        //}
        alarmState.setPropagateAlarmCount(result.alarmCount);
        alarmState.setPropagateHighestAlarmSeverity(result.highestAlarmSeverity);
        this._calculateDataAlarmState(configItem);
        //自己或者孩子阻止了告警 
        // var isSkipRender = this._dataManager.isStopAlarmPropagation(configItem) || configItem.isSkipRender;
        var isSkipRender = false;
        this._dirtyParentsDataAlarmState(configItem, isSkipRender);
    },

    /**
     * 计算dirty列表中的data的上浮告警
     * @private
     */
    _calculateDataPropagateAlarmState: function () {
        while (this._dirtyDataAlarmState.length > 0) {
            var data = this._dirtyDataAlarmState.pop();
            this.calculateDataPropagateAlarmState(data);
        }
    },

    /**
     * 计算节点上的总的告警
     * 告警数量等于自身告警加上上浮告警
     * 最高告警级别等于自身告警和上浮告警最高级别
     * @param alarmState
     * @private
     */
    _calculateDataAlarmState: function (configItem) {
        var alarmState = configItem.getAlarmState();
        var result = {
            highestAlarmSeverity: null,
            alarmCount: 0,
        };
        result.alarmCount = alarmState.getSelfAlarmCount() + alarmState.getPropagateAlarmCount();
        result.highestAlarmSeverity = this._getHighestAlarmSeverity(result.highestAlarmSeverity, alarmState.getSelfHighestAlarmSeverity())
        result.highestAlarmSeverity = this._getHighestAlarmSeverity(result.highestAlarmSeverity, alarmState.getPropagateHighestAlarmSeverity())
        alarmState.setAlarmCount(result.alarmCount);
        alarmState.setHighestAlarmSeverity(result.highestAlarmSeverity);
        this._setCIAlarmStateDirty(configItem);
        this.renderCIAlarm(configItem);
    },

    /**
     * 取得高级别的告警
     * @param severity1 {it.AlarmSeverity} severity1
     * @param severity2 {it.AlarmSeverity} severity2
     * @returns {it.AlarmSeverity} 返回severity1或者severity2
     * @private
     */
    _getHighestAlarmSeverity: function (severity1, severity2) {
        return it.AlarmSeverity.compare(severity1, severity2) > 0 ? severity1 : severity2;
    },

    isForceRenderConfigItem : function(configItem){
    	return false;
    },

	renderCIAlarm : function(configItem){
		//如果 isSkipRender=true, 并且不再强制渲染列表中, 跳过渲染过程
        if (configItem.isSkipRender && !this.isForceRenderConfigItem(configItem)) {
            return;
        }
        // if (!this._sceneManager.isCurrentSceneInstance(data)) {
        //     this._setDataAlarmStateDirty(data);
        //     return;
        // }
        // var node = this._sceneManager.getNodeByDataOrId(data);
        // if (!node && this._sceneManager.earthScene && this._sceneManager.earthScene.dataCenterNodeMap) {
        //     node = this._sceneManager.earthScene.dataCenterNodeMap[data.getId()]
        // }
        var configItemNode = this.itvManager.getConfigItemNodeByDataOrId(configItem);
        if (configItemNode && this._isCIAlarmStateDirty(configItem)) {
            this._renderCIAlarm(configItem, configItemNode);
        } else if (!configItemNode) {
            this._setCIAlarmStateDirty(configItem);
        }
	},

	_renderCIAlarm : function(ci, ciNode){
		this._clearCIAlarmStateDirty(ci);
		 // if (this.renderType == it.AlarmManager.RENDER_TYPE_PAINT) {
            //找到最高级别告警, 不区分是上浮还是自身
            var alarmState = ci.getAlarmState();
            if (alarmState.getAlarmCount() > 0) {
                var alarmSeverity = alarmState.getHighestAlarmSeverity();
                this.paintCIColor(ci, ciNode, alarmSeverity);
            } else {
                this.clearCIColor(ci, ciNode);
            }
            /*
        } else if (this.renderType == it.AlarmManager.RENDER_TYPE_PAINT_BILLBOARD) {
            //找到最高级别告警, 不区分是上浮还是自身
            var alarmState = ci.getAlarmState();
            if (alarmState.getAlarmCount() > 0) {
                var alarmSeverity = alarmState.getHighestAlarmSeverity();
                this.paintCIColor(ci, ciNode, alarmSeverity);
            } else {
                this.clearCIColor(ci, ciNode);
            }
            //上浮告警状态
            var parentData = this._dataManager.getParent(data);
            //如果parent为空,或者自身阻止了告警传播,并且总的告警数量大于0,那么显示或者更新告警billboard
            if (alarmState.getAlarmCount() > 0 && (!parentData || this._dataManager.isStopAlarmPropagation(data))) {
                this.showDataBillboard(data, node);
            } else if (this._alarmBillboardMap[data.getId()]) {
                this.hideDataBillboard(data, node);
            }
        } else {
            //自身告警状态
            var alarmState = ci.getAlarmState();
            if (alarmState.getSelfAlarmCount() > 0) {
                this.paintCIColor(ci, ciNode);
            } else {
                this.clearCIColor(ci, ciNode);
            }
            //上浮告警状态
            var parentData = this._dataManager.getParent(data);
            //如果parent为空,或者自身阻止了告警传播,并且总的告警数量大于0,那么显示或者更新告警billboard
            if (alarmState.getAlarmCount() > 0 && (!parentData || this._dataManager.isStopAlarmPropagation(data))) {
                this.showDataBillboard(data, node);
            } else if (this._alarmBillboardMap[data.getId()]) {
                this.hideDataBillboard(data, node);
            }
        }*/
	},

	 /**
     * 给配置项的Node染色
     */
    paintCIColor: function (ci, ciNode, alarmSeverity) {
        // if (node.getClient('complexNode')) {
        //     node = node.getClient('complexNode') != 'unload' && node.getClient('complexNode').getParent() ? node.getClient('complexNode') : node.getClient('simpleNode');
        // }
        var alarmState = ci.getAlarmState();
        var alarmSeverity = alarmSeverity || alarmState.getSelfHighestAlarmSeverity();
        this._setNodeAlarmEffect(ciNode, alarmSeverity);
        this._alarmNodeMap[ciNode.getId()] = ciNode;

        //同步到孩子, 例如机柜门
        var children = ciNode.getChildren();
        var length = children.size();
        for (var i = 0; i < length; i++) {
            var childTemp = children.get(i);
            if (!childTemp instanceof mono.Billboard && childTemp.getClient('modelParent')) {
                this._setNodeAlarmEffect(childTemp, alarmSeverity);
                this._alarmNodeMap[childTemp.getId()] = childTemp;
            }
        }
    },

    /**
     * 清除配置项上的染色
     */
    clearCIColor: function (ci, ciNode) {
        // if (node.getClient('complexNode')) {
        //     node = node.getClient('complexNode') != 'unload' && node.getClient('complexNode').getParent() ? node.getClient('complexNode') : node.getClient('simpleNode');
        // }
        //判断是否已经染色, 如果没有染色, 直接跳过
        if (!ciNode.getStyle('alarm.m.ambient')) {
            return;
        }
        this._clearNodeAlarmEffect(ciNode);
        delete this._alarmNodeMap[ciNode.getId()];
        var children = ciNode.getChildren();
        var length = children.size();
        for (var i = 0; i < length; i++) {
            var childTemp = children.get(i);
            if (childTemp.getClient('modelParent')) {
                this._clearNodeAlarmEffect(childTemp);
                delete this._alarmNodeMap[childTemp.getId()];
            }
        }
    },

    _setNodeAlarmEffect: function (node, alarmSeverity) {
        //备份之前的状态
        var oldColor = node.getStyle('alarm.m.ambient') || node.getStyle('m.ambient');
        var color = alarmSeverity ? alarmSeverity.color : oldColor;
        node.setStyle('m.ambient', color);
        node.setStyle('m.color', color);
        node.setStyle('alarm.m.ambient', oldColor);
    },

    _clearNodeAlarmEffect: function (node) {
        var color = node.getStyle('alarm.m.ambient');
        node.setStyle('m.ambient', color);
        node.setStyle('m.color', color);
        node.setStyle('alarm.m.ambient', null);
    },



});

it.ITVAlarmManager = $ITVAlarmManager;
