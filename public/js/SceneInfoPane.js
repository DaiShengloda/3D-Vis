
/**
 * 右下角的场景信息
 * 
 * add By Kevin 2017-06-14 做一下相关的改进，使之跟looAt的对象(也是FocusNode对象)相关
 */
it.SceneInfoPane = function (obj) {
    var obj = obj || {};
    var mainDiv = $(obj.parent3D || document.body); //如果是2D的话，应该放到2D的rootView,3D的话则放到3D
    this.parent3D = obj.parent3D;
    this.parent2D = obj.parent2D;
    this.sceneManager = obj.sceneManager;
    // this.searchManager = obj.searchManager;
    this.sceneInfoMainPane = $('<div id ="sceneInfoPane" class="scene-info-panel it-shadow"></div>');
    this.sceneInfoPane = $('<div class="scene-info-content-panel scroll-class"></div>');
    mainDiv.append(this.sceneInfoMainPane);
    this.sceneInfoMainPane.append(this.sceneInfoPane);
    this.totalEquipmentCount = 0;

    //放到右下角的panel，隐藏后，当鼠标移动到这个上面时就显示
    this.sceneInfoContralPane = $('<div id="sceneInfoContralPanel" class="scene-info-contral-panel"></div>');
    mainDiv.append(this.sceneInfoContralPane);
    this._changeByFocus = false; //是不是根据Focus的变化而触发，默认的是由场景的变化而触发的
    this._focuseNodeRuleInfo = []; //信息的规则
    this._clearContent();
    var self = this;
    this.sceneInfoContralPane.mouseover(function (eve) {
        self.showRoomInfo();
    });
    this.init();
};

mono.extend(it.SceneInfoPane, Object, {

    init: function() {
        var self = this;
         // this.sceneManager.addSceneChangeListener(this.sceneChangeListener,this);
         // 2017-11-21 为了使得场景切换时不会卡顿
         this.sceneManager.cameraManager.addAfterPlayCameraListener(this.sceneChangeListener,this);
        if (this._changeByFocus) {
            this.sceneManager.viewManager3d.defaultEventHandler.addAfterLookFinishedAtListener(this.focusChangeListener, this);
        } 
        this.hideRoomInfo();
    },

    setChangeByFocus : function(changeByFocus){
        var self = this;
        if (this._changeByFocus != changeByFocus) {
            this._changeByFocus = changeByFocus;
            if (this._changeByFocus) { //场景切换时，并不会调到alterLookAtListener
                // this.sceneManager.removeSceneChangeListener(this.sceneChangeListener,this);
                this.sceneManager.viewManager3d.defaultEventHandler.addAfterLookFinishedAtListener(this.focusChangeListener, this);
                if (this.sceneManager.earthScene) {
                    this.sceneManager.earthScene.addAfterLookAtListener(this.focusChangeListener, this);
                }else{
                    this.sceneManager.addSceneManagerChangeListener(function(eve){
                        // if (self.sceneManager.earthScene) {
                        //     return ; //已经创建过就直接返回，理论上不可能创建两次
                        // }
                        if (eve.kind == 'createDefaultEarthScene') {
                            var earthScene = eve.data;
                            earthScene.addAfterLookAtListener(self.focusChangeListener, self);
                        }
                    });
                }

            }else{
                // this.sceneManager.addSceneChangeListener(this.sceneChangeListener,this);
                this.sceneManager.viewManager3d.defaultEventHandler.removeAfterLookFinishedAtListener(this.focusChangeListener, this);
                if (this.sceneManager.earthScene) {
                    this.sceneManager.earthScene.removeAfterLookAtListener(this.focusChangeListener, this);
                }
            }
        }
    },
 
    sceneChangeListener: function(eve) {
        if (this._changeByFocus) { // focuseNode模式也要调用sceneChangeListener，因为场景切换并不会调用afterLookAt
            this.showFocusNodeInfo(this.sceneManager.getCurrentRootNode());
        } else {
            var scene = eve.data;
            if (!scene || (scene.isShowStaticInfo && scene.isShowStaticInfo())) {
                this.showSceneStatisInfo();
                this.showRoomInfo();
            } else {
                this.hideRoomInfo();
            }
        }
    },

    focusChangeListener : function(mainNode,node){
        this.showFocusNodeInfo(mainNode||node);
    },

    showFocusNodeInfo : function(dataNode){
        if (!dataNode) {
            dataNode = this.sceneManager.viewManager3d.getFocusNode()||this.sceneManager.getCurrentRootNode();
        }
        var self = this;
        var data = this.sceneManager.getNodeData(dataNode);
        var category = this.sceneManager.dataManager.getCategoryForData(data);
        var currentScene = this.sceneManager.getCurrentScene();
        if (!this._focuseNodeRuleInfo || this._focuseNodeRuleInfo.length < 1) {
            return;
        }
        var dataTypeRule = null,dataCategoryRule = null,sceneRule = null;
        for(var i = 0 ; i < this._focuseNodeRuleInfo.length ; i++){
            var rule = this._focuseNodeRuleInfo[i];
            if (currentScene && rule.getSceneId() && currentScene.getId() != rule.getSceneId()) {
                continue;
            }
            if (rule.getDataTypeId() && !dataTypeRule && data && rule.getDataTypeId() == data.getDataTypeId()) {
                dataTypeRule = rule;
                continue;
            }
            if (rule.getCategoryId() && !dataCategoryRule && category && category.getId() == rule.getCategoryId()) {
                dataCategoryRule = rule;
                continue;
            }
            if (rule.getSceneId() && currentScene && !sceneRule && currentScene.getId() == rule.getSceneId()) {
                sceneRule = rule;
                continue;
            }
        }
        var resultRule = dataTypeRule;
        if (!resultRule && dataCategoryRule) {
            resultRule = dataCategoryRule;
        }else if(!resultRule && sceneRule){
            resultRule = sceneRule;
        }
        //使支持异步回调，可是需要注意过期的情况（如，切到了其他的场景）
        this.lockId = null; // 加上这个为null，是为了避免callback在“this.lockId = data.getId();”之前(同步)调用
        var resultObj = this.getResulByRule(resultRule,dataNode,data,function(callbackObj,orgData){ 
            if (!self.lockId || (orgData && orgData.getId() == self.lockId)) { //用来判断是否过期
                self.showInfoByData(callbackObj);
            }
        });
        this.lockId = data.getId();
        this.showInfoByData(resultObj);
        // if (resultObj) {
        //     this._clearContent(it.util.i18n("SceneInfoPane_Asset_statistics"));
        //     this.setResults(resultObj);
        //     this.showRoomInfo();
        // }
    },

    showInfoByData : function(resultObj){
        if (resultObj) {
            this._clearContent(it.util.i18n("SceneInfoPane_Asset_statistics"));
            this.setResults(resultObj);
            this.showRoomInfo();
        }
    },

    /**
     * 添加规则
     * @rule{it.InfoRule}
     */
    addFocusNodeInfoRule : function(rule){
        if (rule) {
            this._focuseNodeRuleInfo.push(rule);
        }
    },

    _getDataFieldValue: function (node, data, field) {
        if (!data) {
            return "";
        }
        return data.getValue(field);
    },

    getResulByRule : function(rule,node,data,callback){
        if (!rule) {
            callback && callback(null);
            return null;
        }
        var result = {};
        var propertiesDesc = rule.getPropertiesDesc();
        var propertiesDescArray = propertiesDesc.split("@@");
        if (propertiesDescArray.length) {
            for (var i = 0; i < propertiesDescArray.length; i++) {
                var propertyDesc = propertiesDescArray[i];
                var propertyDescArray = propertyDesc.split(":");
                if (propertyDescArray.length === 2) {
                    var label = propertyDescArray[0];
                    var field = propertyDescArray[1];
                    var value = this._getDataFieldValue(node, data, field);
                    result[label] = value || '';
                }
            }
        }
        var extInfo = rule.getExtInfo();
        if (typeof(extInfo) == 'function') {
            extInfo = extInfo(node, data,callback);
        } else {
            extInfo = it.Util.translateJson(extInfo);
        }
        if (extInfo instanceof Array) { //暂时不支持
            // for(var i = 0 ; i < extInfo.length ; i ++){
            //     var item = extInfo[i];
            //     if (item) {

            //     }
            // }
        }else{
            if (extInfo) {
                for (var p in extInfo) {
                    var info = extInfo[p];
                    if (typeof(info) == 'function') {
                        result[p] = info(node, data);
                    } else {
                        result[p] = info;
                    }
                }
                callback && callback(null);
                return result;
            }
        }
        return null; //让其返回空
    },

    _clearContent: function (title) {
        this.sceneInfoMainPane.empty();
        this.sceneInfoPane.empty();

        if (!title) {
            title = it.util.i18n("SceneInfoPane_Room_info");
        }
        var self = this;
        var closeDiv = $('<div class="scene-info-title-panel"></div>');
        var btnclose = $('<div class="close"></div>');
        var titleDiv = $('<span>' + title + '</span>');
        closeDiv.append(titleDiv);
        closeDiv.append(btnclose);
        this.sceneInfoMainPane.append(closeDiv);//this.titlePanel
        this.sceneInfoMainPane.append(this.sceneInfoPane);
        btnclose.click(function (e) {
            self.hideRoomInfo();
        });
    },

    switch: function (to2D) {
        var mainDiv = null;
        if (to2D) {
            mainDiv = $(this.parent2D || document.body);
        } else {
            mainDiv = $(this.parent3D || document.body);
        }
        mainDiv.append(this.sceneInfoMainPane);
        mainDiv.append(this.sceneInfoContralPane);
    },

    showSceneStatisInfo: function (obj) {
        var currentScene = this.sceneManager.getCurrentScene();
        if (currentScene && currentScene.getTwod()) { // 如果是2D的话也有2D的统计，如:2D面板中有端口的统计
            var rootNode = main.sceneManager.getCurrentRootNode();
            this.show2DDataInfo(rootNode);
            this.switch(true);
        } else {
            if (this._changeByFocus) {
                this.showFocusNodeInfo();
            }else{
                this.showITDataInfo(); //空间统计需要单独调用
            }
            this.switch(false);
        }
    },

    /**
     * 房间信息包括：位置、通道个数、机柜个数、总的空间、已用空间、剩余空间，空调个数、
     * 向roomInfo的Dialog中填充Room info
     * 注意：支持传入click事件
     * @param roomInfo
     */
    showRackSpaceDataInfo: function () {
        this._clearContent(it.util.i18n("SceneInfoPane_Space_statistics"));
        var sceneDatas = this.sceneManager.getSceneDatas();
        if (sceneDatas) {
            var totalSpace = 0, totalOccupation = 0, totalEmpSpace = 0;
            for (var id in sceneDatas) {
                var data = sceneDatas[id];
                if (data) {
                    totalSpace += parseInt(data.getUserData('dyna_user_data_totalSpace') || 0);
                    totalOccupation += parseInt(data.getUserData('dyna_user_data_totalOccupation') || 0);
                    totalEmpSpace += parseInt(data.getUserData('dyna_user_data_totalEmpSpace') || 0);
                }
            }
            var itemTotalSpace = this._addItem(it.util.i18n("SceneInfoPane_All_U_count"), totalSpace);
            this.sceneInfoPane.append(itemTotalSpace);
            var itemTotalOccupation = this._addItem(it.util.i18n("SceneInfoPane_Used_U_count"), totalOccupation);
            this.sceneInfoPane.append(itemTotalOccupation);
            var itemEmpSpace = this._addItem(it.util.i18n("SceneInfoPane_Left_U_count"), totalEmpSpace);
            this.sceneInfoPane.append(itemEmpSpace);
            // this.sceneInfoPane.append(itemPane);
        }
        this.showRoomInfo();
    },

    /**
     * 显示2D场景中的场景统计信息
     * @param node2D
     */
    show2DDataInfo: function (node2D) {
        if (!node2D) {
            this.hideRoomInfo();
            return;
        }
        var dm = this.sceneManager.dataManager;
        var data = this.sceneManager.getNodeData(node2D);
        var dataType = dm.getDataTypeForData(data);
        if (!dataType) {
            this.hideRoomInfo();
            return;
        }
        var templateDatas = dataType.getTemplateDatas();
        if (!templateDatas) {
            this.hideRoomInfo();
            return;
        }
        var category = dm.getCategoryForDataType(dataType);
        var count = parseInt(24 - templateDatas.length);
        if (count < 0) {
            count = 0;
        }
        if (category && category.getId().toLowerCase().indexOf('card') >= 0) {
            this._clearContent(it.util.i18n("SceneInfoPane_Device_statistics"));
            var sumInfo = {};
            sumInfo[it.util.i18n("SceneInfoPane_Left_status")] = count + it.util.i18n("SceneInfoPane_Count");
            this.setResults(sumInfo);
            this.showRoomInfo();
        }
    },

    /**
     * 向infoPanel中赋值，这种是"Key-value"的这种格式，比较通用
     */
    setResults: function (obj) {
        if (!obj) {
            return;
        }
        for (var prop in obj) {
            var value = obj[prop];
            var itemPane = this._addItem(prop, value,null,null,'left');
            this.sceneInfoPane.append(itemPane);
        }
    },

    /**
     * 问题：设备的统计，因为设备是延时加载的
     * @param
     */
    showITDataInfo: function () {
        this._clearContent(it.util.i18n("SceneInfoPane_Asset_statistics"));
        var sceneDatas = this.sceneManager.getSceneDatas();
        var currentScene = this.sceneManager.getCurrentScene();
        var currentSceneCategoryId = '';
        if (currentScene) {
            currentSceneCategoryId = currentScene.getCategoryId();
        }
        var categorySum = {};
        //add告警的统计信息，告警的统计放到最上面
        var alarmCount = this.getAlarmCount();
        categorySum[it.util.i18n("SceneInfoPane_Alarm_count")] = { sum: alarmCount, lbId: 'dataInfo_alarmId' };//配置上lbId，当动态改变某这列值时就不需要重新计算所有的
        var box3d = this.sceneManager.network3d.getDataBox();
        for (var dataId in sceneDatas) {
            var dataCategory = this.sceneManager.dataManager.getCategoryForData(dataId);
            if (currentSceneCategoryId
                && dataCategory
                && dataCategory.getId() == currentSceneCategoryId) {
                continue;
            }
            var id = 'other';
            if (dataCategory) {
                id = dataCategory.getId() || 'other';
            }
            var obj = categorySum[id] || { category: dataCategory, sum: 0 };
            if (!categorySum[id]) {
                categorySum[id] = obj;
            }
            categorySum[id].sum = parseInt(categorySum[id].sum) + 1;
        }
        //if(categorySum[it.util.CATEGORY.SEAT] && categorySum[it.util.CATEGORY.RACK]){
        //    categorySum[it.util.CATEGORY.SEAT].sum = categorySum[it.util.CATEGORY.RACK].sum + '/' + categorySum[it.util.CATEGORY.SEAT].sum;
        //}
        this.setItResult(categorySum);
        this.showRoomInfo();
    },

    addAlarmCountChangeListener: function () {
        var am = this.sceneManager.getAlarmManager();
        var self = this;
        this.removeAlarmCountChangeListener();
        if (!this.alarmManagerChangeListener) {
            this.alarmManagerChangeListener = function (eve) {
                clearTimeout(self.alarmCountTimer);
                self.alarmCountTimer = setTimeout(function () {
                    var alarmCount = self.getAlarmCount();
                    //console.log(alarmCount);
                    var alarmDiv = $('#dataInfo_alarmId');
                    alarmDiv.text(alarmCount);
                }, 1000)
            }
        }
        am.addAlarmManagerChangeListener(this.alarmManagerChangeListener);
    },

    removeAlarmCountChangeListener: function () {
        if (this.alarmManagerChangeListener) {
            this.sceneManager.getAlarmManager().removeAlarmManagerChangeListener(this.alarmManagerChangeListener);
        }
    },
    getAlarmCount: function () {
        var rootNode = this.sceneManager.getCurrentRootNode();
        if(!rootNode){
            return 0;
        }
        var alarmCount = this.sceneManager.getNodeData(rootNode).getAlarmState().getAlarmCount();
        return alarmCount;
    },

    /**
     * 向infoPanel中赋值,只是针对像it资产统计的这种，通过type汇总后，再按照category汇总了一把，不通用，只用于it资产统计
     * @param values
     */
    setItResult: function (values) {
        if (!values) return;
        for (var categoryId in values) {
            var category = values[categoryId].category;
            var type_name = '';
            if (category && category.getDescription()) {
                type_name = category.getDescription();
            } else {
                type_name = categoryId;
            }
            // if(!category){
            //     type_name = '其他';
            // }else{
            //     type_name = category.getDescription();
            // }
            var totalCount = values[categoryId].sum;
            var lbId = values[categoryId].lbId;
            var itemPane = this._addItem(type_name, totalCount, lbId);
            this.sceneInfoPane.append(itemPane);
        }
    },

    _createItemPane: function (itObj, category) {
        if (!category) {
            return;
        }
        if (itObj[category]) {
            var type_name = Util.getCategoryNameByCategory(category);
            if (!type_name) {
                type_name = category;
            }
            var totalCount = itObj[category];
            var itemPane = this._addItem(type_name, totalCount);
            this.sceneInfoPane.append(itemPane);
            delete itObj[category]; // 为了排序
        }
        return;
    },

    getEquipmentCount: function () {
        if (this.totalEquipmentCount) {
            return this.totalEquipmentCount;
        } else {
            return 0;
        }
    },

    setTitle: function () {

    },

    formatNumber: function (num, precision, separator) {
        var parts;
        if (!isNaN(parseFloat(num)) && isFinite(num)) {
            num = Number(num);
            num = (typeof precision !== 'undefined' ? num.toFixed(precision) : num).toString();
            parts = num.split('.');
            parts[0] = parts[0].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + (separator || ','));
            return parts.join('.');
        }
        return null;
    },

    _addItem: function (key, val, lbId, callback,align) {
        if (!key) return null;
        var row = $('<div class="form-group-no-margin"> </div>'); // not <tr>
        var label_Name = $('<label class="col-sm-7 label-min">' + key + ':</label>');
        row.append(label_Name);
        var valText = this.formatNumber(val);
        if (!valText) {
            valText = val;
        }
        align = align||'right';
        var label_Value = $('<label ' + (lbId ? 'id = ' + lbId : '') + '  class="col-sm-5 label-value text-align-'+align+'">' + valText + '</label>');
        row.append(label_Value);
        if (callback) {
            row.click(callback);
        }
        return row;
    },

    showRoomInfo: function () {
        var currentScene = this.sceneManager.getCurrentScene();
        if (currentScene && !this._changeByFocus && !currentScene.isShowStaticInfo()) {
            return;
        }
        if (typeof(dataJson.showSceneInfoPane) == 'boolean' && !dataJson.showSceneInfoPane){
            this.sceneInfoMainPane.hide();
            return;
        }
        this.sceneInfoMainPane.show();
        this.addAlarmCountChangeListener();
    },

    hideRoomInfo: function () {
        this.sceneInfoMainPane.hide();
        this.removeAlarmCountChangeListener();
    }

});
