
var $ITVDataManager = function() {
	this._categoryMap = {};
	this._configItemMap = {};
	this._relationTypeMap = {};
	this._relationMap = {};
	this._layerMap = {};
	this._configItemLayerMap = {};
	this._configItemList = [];
	this._configItemLayers = {}; // 用来保存配置项对应的“配置项-层”的关系，一般而言是一对一，今后可能会存在一个配置项放在多层的关系
	this.dataManagerChangeDispatcher = new mono.EventDispatcher();
};

mono.extend($ITVDataManager, Object, {

    addDataManagerChangeListener : function(listener,scope,ahead){
    	this.dataManagerChangeDispatcher.add(listener,scope,ahead);
    },

    removeDataManagerChangeListener : function(listener,scope){
    	this.dataManagerChangeDispatcher.remove(listener,scope);
    },

	addCategory: function(category) {
		var id = category.getId();
		if (!(category instanceof it.ITVCategory)) {
			throw "Can only add it.ITVCategory";
		}
		if (this._categoryMap[id]) {
			throw "ITVCategory for id '" + id + "' already exists";
		}
		this._categoryMap[id] = category;
		this.dataManagerChangeDispatcher.fire({type:'addCategory',data:category});
	},

	addCategorysFromJson: function(json) {
		var jsonObjects = json;
		if (typeof json === "string") {
			jsonObjects = JSON.parse(json);
		}
		var i = 0,
			len = jsonObjects.length;
		for (; i < len; i++) {
			var jsonObject = jsonObjects[i];
			var category = new it.ITVCategory();
			category.fromJson(jsonObject);
			this.addCategory(category);
		}
	},
    
    /**
     * 添加配置项
     * @isDealParentRelation 是否计算父子关系
     */
	addConfigItem: function(configItem,isDealParentRelation) {
		var id = configItem.getId();
		if (isDealParentRelation == null || isDealParentRelation == undefined) {
			isDealParentRelation = true;
		}
		if (!(configItem instanceof it.ITVConfigItem)) {
			throw "Can only add it.ITVConfigItem";
		}
		if (this._configItemMap[id]) {
			throw "ITVConfigItem for id '" + id + "' already exists";
		}
		this._configItemMap[id] = configItem;
		this._configItemList.push(configItem);
		if (isDealParentRelation) {
			this.setConfigItemParentAndChildren(configItem);
		}
		this.dataManagerChangeDispatcher.fire({type:'addConfigItem',data:configItem});
	},

	addConfigItemsFromJson: function(json) {
		var jsonObjects = json;
		if (typeof json === "string") {
			jsonObjects = JSON.parse(json);
		}
		var i = 0,
			len = jsonObjects.length;
		for (; i < len; i++) {
			var jsonObject = jsonObjects[i];
			var configItem = new it.ITVConfigItem();
			configItem.fromJson(jsonObject);
			this.addConfigItem(configItem,false);
		}
		this.setAllConfigItemParentAndChildren();
	},

	/**
     * 设置配置项的父子关系
     * 注意：第一次加载了很多的数据的时候，这个方法执行了无数次，估计对速度有些影响
     * @param data
     * @returns {null}
     */
    setConfigItemParentAndChildren : function(configItem){
        if(!configItem){
            return null;
        }
        var parentId = configItem.getParentId();
        if(parentId){
           var parentData =  this._configItemMap[parentId];
            if(parentData){
                parentData.addChild(data);
            }
        }
        var children = this.getChildren(configItem);
        configItem.addChildren(children);
    },

    /**
     * 设置所有的配置项的父子关系
     * 对于一下子从后来查询了数千条数据来说，一个一个的setParentAndChildren是比较慢的，再说有很多的重复而无效的搜索和计算
     * 这里只要遍历一次，将其加入到其父亲的孩子中即可，并不需要找其的孩子
     */
    setAllConfigItemParentAndChildren : function(){
        for(var id in this._configItemMap){
            var configItem = this._configItemMap[id];
            if(configItem && configItem.getParentId()){
                var parentConfigItem = this._configItemMap[configItem.getParentId()];
                if(parentConfigItem){
                    parentConfigItem.addChild(configItem);
                }
            }
        }
    },

	addRelationType: function(relationType) {
		var id = relationType.getId();
		if (!(relationType instanceof it.ITVRelationType)) {
			throw "Can only add it.ITVRelationType";
		}
		if (this._relationTypeMap[id]) {
			throw "ITVRelationType for id '" + id + "' already exists";
		}
		this._relationTypeMap[id] = relationType;
		this.dataManagerChangeDispatcher.fire({type:'addRelationType',data:relationType});
	},

	addRelationTypesFromJson: function(json) {
		var jsonObjects = json;
		if (typeof json === "string") {
			jsonObjects = JSON.parse(json);
		}
		var i = 0,
			len = jsonObjects.length;
		for (; i < len; i++) {
			var jsonObject = jsonObjects[i];
			var relationType = new it.ITVRelationType();
			relationType.fromJson(jsonObject);
			this.addRelationType(relationType);
		}
	},

	addRelation: function(relation) {
		var id = relation.getId();
		if (!(relation instanceof it.ITVRelation)) {
			throw "Can only add it.ITVRelation";
		}
		if (this._relationMap[id]) {
			throw "ITVRelation for id '" + id + "' already exists";
		}
		this._relationMap[id] = relation;
		this.dataManagerChangeDispatcher.fire({type:'addRelation',data:relation});
	},

	removeRelation : function(relation){
		var id = relation.getId();
		if (this._relationMap[id]) {
			delete this._relationMap[id];
			this.dataManagerChangeDispatcher.fire({type:'removeRelation',data:relation});
		}
	},

	addRelationsFromJson: function(json) {
		var jsonObjects = json;
		if (typeof json === "string") {
			jsonObjects = JSON.parse(json);
		}
		var i = 0,
			len = jsonObjects.length;
		for (; i < len; i++) {
			var jsonObject = jsonObjects[i];
			var relation = new it.ITVRelation();
			relation.fromJson(jsonObject);
			this.addRelation(relation);
		}
	},

	addLayer: function(layer) {
		var id = layer.getId();
		if (!(layer instanceof it.ITVLayer)) {
			throw "Can only add it.ITVLayer";
		}
		if (this._layerMap[id]) {
			throw "ITVLayer for id '" + id + "' already exists";
		}
		this._layerMap[id] = layer;
		this.dataManagerChangeDispatcher.fire({type:'addLayer',data:layer});
	},

	addLayersFromJson: function(json) {
		var jsonObjects = json;
		if (typeof json === "string") {
			jsonObjects = JSON.parse(json);
		}
		var i = 0,
			len = jsonObjects.length;
		for (; i < len; i++) {
			var jsonObject = jsonObjects[i];
			var layer = new it.ITVLayer();
			layer.fromJson(jsonObject);
			this.addLayer(layer);
		}
	},

    /**
     * 根据层编号获取层
     */
	getLayerById : function(layerId){
		return this._layerMap[layerId];
	},
   
    /**
     *
     * 添加“配置项-层”对象
     *
     */
	addConfigItemLayer: function(cItemlayer) {
		var layerId = cItemlayer._layerId;
		var configItemId = cItemlayer._configItemId;
		var key = layerId + '@' + configItemId;
		if (!(cItemlayer instanceof it.ITVConfigItemLayer)) {
			throw "Can only add it.ITVConfigItemLayer";
		}
		if (this._configItemLayerMap[key]) {
			throw "ITVConfigItemLayer for id '" + key + "' already exists";
		}
		this._configItemLayerMap[key] = cItemlayer;
		var layer = this._layerMap[layerId];
		layer.addConfigItem(cItemlayer);
		var items = this._configItemLayers[configItemId];
		if(items && items instanceof Array){
			items.push(cItemlayer);
		}else{
			items = [cItemlayer];
			this._configItemLayers[configItemId] = items;
		}
		this.dataManagerChangeDispatcher.fire({type:'addConfigItemLayer',data:cItemlayer});
	},

	addConfigItemLayerFromJson: function(json) {
		var jsonObjects = json;
		if (typeof json === "string") {
			jsonObjects = JSON.parse(json);
		}
		var i = 0,
			len = jsonObjects.length;
		for (; i < len; i++) {
			var jsonObject = jsonObjects[i];
			var cItemlayer = new it.ITVConfigItemLayer();
			cItemlayer.fromJson(jsonObject);
			this.addConfigItemLayer(cItemlayer);
		}
	},
    
    /**
     * 根据配置项编号获取配置项所在的layer
     */
	getConfigItemLayerByConfigItemId : function(configItemId,scope){
		if (!configItemId) {
			return null;
		}
		scope = scope || this;
		if (scope._configItemLayers[configItemId]) {
			return scope._configItemLayers[configItemId];
		}
		// 由于cItem的最上面的父亲在layer上，当没有父亲时才会直接隶属于layer
		var configItem = scope._configItemMap[configItemId];
		if (configItem && configItem.getParentId()) {
			return scope.getConfigItemLayerByConfigItemId(configItem.getParentId(),scope);
		}
	},

	isSameLayer : function(fromId,toId){
		var fromConfigItemLayers = this.getConfigItemLayerByConfigItemId(fromId);
		var toConfigItemLayers = this.getConfigItemLayerByConfigItemId(toId);
		if (!fromConfigItemLayers 
			|| fromConfigItemLayers.length < 1 
			|| !toConfigItemLayers 
			|| toConfigItemLayers.length < 1) {
			return false;
		}
		var fromCil = fromConfigItemLayers[0];
		var toCil = toConfigItemLayers[0];
		if (!fromCil || !toCil) {
			return false;
		}
		var fromLayer = this._layerMap[fromCil.getLayerId()];
		var toLayer = this._layerMap[toCil.getLayerId()];
		if (fromCil.getLayerId() == toCil.getLayerId()) { // 表示的是同一个layer上的配置项
			return true;
		}
		return false;
	},

    /**
     * 将relation分到具体的layer上
     * 当relation的fromId和toId都在该layer上时，那将该relation也加到该layer上
     * 执行这个方法前确保layer、ci和relation都已经加载好
     */
	resetRelationForLayer: function() {
		for (var id in this._relationMap) {
			var relation = this._relationMap[id];
			var fromId = relation.getFromId();
			var toId = relation.getToId();
			if (!fromId || !toId || !this._configItemMap[fromId] || !this._configItemMap[toId]) {
				continue;
			}
			this._configItemMap[fromId].addRelation(relation);
			this._configItemMap[toId].addRelation(relation);
			
			var fromConfigItemLayers = this.getConfigItemLayerByConfigItemId(fromId);
			var toConfigItemLayers = this.getConfigItemLayerByConfigItemId(toId);
			if (!fromConfigItemLayers 
				|| fromConfigItemLayers.length < 1 
				|| !toConfigItemLayers 
				|| toConfigItemLayers.length < 1) {
				continue;
			}
			var fromCil = fromConfigItemLayers[0];
			var toCil = toConfigItemLayers[0];
			if (!fromCil || !toCil) {
				continue;
			}
			var fromLayer = this._layerMap[fromCil.getLayerId()];
			var toLayer = this._layerMap[toCil.getLayerId()];
			if (fromCil.getLayerId() == toCil.getLayerId()) { // 表示的是同一个layer上的配置项
				fromLayer.addRelation(relation)
			}
		}
	},

});

it.ITVDataManager = $ITVDataManager;

