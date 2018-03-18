/**
 *  配置项
 */
var $ITVConfigItem = function (parameters) {
    it.Base.call(this);
    parameters = parameters || {};
    if (typeof parameters === 'string') {
        parameters = {
            id: parameters
        };
    }
    this._id = parameters.id;
    this._name = parameters.name;
    this._categoryId = parameters.categoryId;
    this._model = parameters.model;
    this._modelParameters = parameters.modelParameters;
    this._description = parameters.description;
    this._parentId = parameters.parentId;
    this._position = parameters.position || new mono.Vec3();
    this._assetId = parameters.assetId;
    this._extend = parameters.extend;
    this._childList = new mono.List();
    this._alarmState = new it.AlarmState(this);
    this._relationList = new mono.List();
};

mono.extend($ITVConfigItem, it.Base, {
    ___accessor: ["id", "name", 'categoryId', 'parentId', 'position', 'model', 'modelParameters', 'description', 'assetId', 'alarmState', 'extend'],

    fromJson: function (json) {
        if (typeof json === 'string') {
            json = JSON.parse(json);
        }
        this._id = json.id;
        if (this._id) {
            this._id = this._id.trim();
        }
        this._name = json.name;
        this._categoryId = json.categoryId;
        if (this._categoryId) {
            this._categoryId = this._categoryId.trim();
        }
        this._model = json.model;
        this._parentId = json.parentId;
        if (json.position && (json.position.x !== undefined || json.position.y !== undefined || json.position.z !== undefined)) {
            this._position = new mono.Vec3(json.position.x || 0, json.position.y || 0, json.position.z || 0);
        } else if (mono.Utils.isArray(json.position)) {
            this._position = new mono.Vec3(json.position[0] || 0, json.position[1] || 0, json.position[2] || 0);
        }
        this._modelParameters = json.modelParameters;
        this._description = json.description;
        this._assetId = json.assetId;
        this._extend = json.extend;
    },

    addChild: function (data) {
        if (data && !this._childList.contains(data)) {
            this._childList.add(data);
        }
    },

    addChildren: function (datas) {
        if (!datas || datas.length < 1) {
            return;
        }
        for (var i = 0; i < datas.length; i++) {
            var data = datas[i];
            this.addChild(data);
        }
    },

    removeChild: function (data) {
        this._childList.remove(data);
    },

    removeChildren: function (datas) {
        if (!datas || datas.length < 1) {
            return;
        }
        for (var i = 0; i < datas.length; i++) {
            var data = datas[i];
            this.removeChild(data);
        }
    },

    getChildren: function () {
        return this._childList;
    },

    getDescendants : function(){
        var descendants = this.getChildren().toArray();
        if(!descendants && descendants.size() ==0) return [];
        return descendants.concat(descendants.reduce(function(input,now,i,des){
            return input.concat(now.getDescendants());
        },[]));
    },

    addRelation:function (relation) {
        if (relation && !this._relationList.contains(relation)) {
            this._relationList.add(relation);
        }
    },

    removeRelation: function (relation) {
        this._relationList.remove(relation);
    },

    getRelations:function(){
        return this._relationList;
    }
});

it.ITVConfigItem = $ITVConfigItem;