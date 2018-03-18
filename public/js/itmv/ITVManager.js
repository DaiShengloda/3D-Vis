/**
 * IT架构可视化
 */
var $ITVManager = function (sceneManager) {
	this.sceneManager = sceneManager;
	this._resTotal = 0;
	this._resCount = 0;
	this.itvDataManager = new it.ITVDataManager();
	this._itvHandler = new it.ITVHandler(this);
	this._layerNodeMap = {};
	this._configItemNodeMap = {};
	this.dataBox = this.sceneManager.network3d.dataBox;
	this.itvDefaultModelManager = new it.ITVDefaultModelManager();
	this.savedCurrentScene = null;
	this.savedCurrentRootData = null;
	this.tempMap = {};
	this.relationManager = new $ITVRelationManager(this);
	this.defaultBillboard = false;
	this.billboardBgInited = false;
	this.billboardMap = {};
	this._managerChangeDispatcher = new mono.EventDispatcher();
	this.alarmManager = new $ITVAlarmManager(this);
	this.autoLayout = new $ITVOutLayouter(this);
	this.canvasConfig = {
		width: 512,
		height: 256,
		fSize: 90,
		fColor: '#ffffff',
		fontFamily: 'Microsoft Yahei',
		src: pageConfig.url('images/itv_bbd.png')
	};
	this.isShowing = false;
	this.loadLayerCount = 0;
}

//OSG 
mono.extend($ITVManager, Object, {

	loadAllData: function (callback) {
		var self = this;
		this.api('it_config_item_category', 'search', {}, function (categorys) {
			self.itvDataManager.addCategorysFromJson(categorys);
		});
		this.api('it_config_item', 'search', {}, function (configItems) {
			self.itvDataManager.addConfigItemsFromJson(configItems);
		});
		this.api('it_relation_type', 'search', {}, function (relationTypes) {
			self.itvDataManager.addRelationTypesFromJson(relationTypes);
		});
		this.api('it_relation', 'search', {}, function (relations) {
			self.itvDataManager.addRelationsFromJson(relations);
		});
		this.api('it_layer', 'search', {}, function (layers) {
			self.itvDataManager.addLayersFromJson(layers);
			self.api('it_config_item_layer', 'search', {}, function (itemLayers) {
				self.itvDataManager.addConfigItemLayerFromJson(itemLayers);
			});
		});
		this.api('it_alarm', 'search', {}, function (alarms) {
			self.alarmManager.addCIAlarmsFromJson(alarms);
		});

		var image = new Image();
		image.src = this.canvasConfig['src'];
		image.onload = function () {
			self.billboardBgInited = true;
		}
		self.canvasConfig['bgImage'] = image;

		this._resTotal = 7;
		var f = function () {
			if (self._resCount === self._resTotal && self.billboardBgInited === true) {
				callback && callback();
			} else {
				setTimeout(f, 1000);
			}
		}
		setTimeout(f, 500);
	},

	api: function (module, method, data, success, error) {
		var self = this;
		ServerUtil.api(module, method, data, function(result) {
			success && success(result);
			self._resCount++;
		}, function(result) {
			error && error(result);
			self._resCount++;
		});
	},

    /**
     * 切换到默认的视图 
     **/
	switchToViewManager3D: function() {
		if (this.sceneManager.viewManager2d) {
			this.sceneManager.viewManager2d.getContainer().style.display = 'none';
		}
		this.sceneManager.network3d.getRootView().style.display = 'block';
		this.sceneManager.clear();
		this.oldBackgroundImage = main.sceneManager.viewManager3d.networkParameters['backgroundImage'];
		// main.sceneManager.viewManager3d.setNetworkValue('backgroundImage', pageConfig.url("/images/bg_network11.jpg"));
	},

	/**
	 *  显示itv架构
	 */
	showITV: function() { 
		var self = this;
	    if(this.itvDataManager._configItemList 
	   	  && this.itvDataManager._configItemList.length > 0){
	   	  this._showAllITV();
	    }else{
	    	var callback = function(){
	    		self.itvDataManager.resetRelationForLayer();
	    		self._showAllITV();
	    	}
	   	  this.loadAllData(callback);
	    }		
	},

	_showAllITV : function(){
		this.isShowing = true;
		this.savedCurrentScene = this.sceneManager._currentScene;
		this.savedCurrentRootData = this.sceneManager._currentRootData;
		this.sceneManager._currentScene = null;
		this.switchToViewManager3D();
		this._itvHandler.init();
		this.relationManager.init();
		this.sceneManager.viewManager3d.addEventHandler(this._itvHandler, 0);//排到最前面，场景跳转也不用了
		var layerMap = this.itvDataManager._layerMap;
		var configItemLayerMap = this.itvDataManager._configItemLayerMap;
		var self = this;
		var loadLayerIndex = 0;
		for (var layerId in layerMap) {
			var layer = layerMap[layerId];
			if (layer
				&& layer.getConfigItem()
				&& layer.getConfigItem().size() > 0) {
				this.createLayerAndConfigItemsByLayer(layer);
				loadLayerIndex++;
			}
		}
		// for(var relationId in this.itvDataManager._relationMap){
		// 	var relation = this.itvDataManager._relationMap[relationId];
		// 	// var line = this.relationManager.showRelationByDataOrId(relation,true);
		// 	var line = this.relationManager.showRelationByDataOrId(relation);
		// }
		this.relationManager.showAllCrossLayerLine();//显示所有跨layer的关系
		var f = function () {
			if(loadLayerIndex !== self.loadLayerCount){
				setTimeout(f,1000);
				return;
			}
			self.autoLayout.resetCIPositionAndRelation();
			self._itvHandler.resetCamera();
			main.panelMgr.instanceMap.NavBarMgr.doCustomAppFinished('ITVM');
			self.relationManager.startPointAnimate();
		}
		f();
	},

	clear: function (isGoToLastScene) {
		if (!this.isShowing) { //如果没有显示就直接返回，免的app中的调用clear会不断的调用下面的gotoScene
			return ;
		}
		this.isShowing = false;
		this.pointAnimate = false;
		for (var id in this._configItemNodeMap) {
			var itemNode = this._configItemNodeMap[id];
			itemNode.setParent(null);
			this.dataBox.removeByDescendant(itemNode);
		}
		for(var lid in this._layerNodeMap){
			var layerNode = this._layerNodeMap[lid];
			this.dataBox.removeByDescendant(layerNode);
		}
		this._itvHandler.clear();
		this.relationManager.clear();
		this.sceneManager.viewManager3d.removeEventHandler(this._itvHandler);
		if (isGoToLastScene) {
			this.sceneManager.gotoScene(this.savedCurrentScene, this.savedCurrentRootData);
		}
		for (var key in this.tempMap) {
			var obj = this.tempMap[key];
			var node = obj.data;
			for (var pro in obj.properties) {
				if (node[pro]) {
					node[pro](obj.properties[pro]);
				}
			}
		}
		if(this.showAllBillboards){
			this.toggleAllbillboards();
		}
		this.tempMap = {};
		this.loadLayerCount = 0;
		this.autoLayout.clearPanel();
		// main.sceneManager.viewManager3d.setNetworkValue('backgroundImage', this.oldBackgroundImage);
	},

	getConfigItemNodeByDataOrId: function (configItemOrId) {
		if (!configItemOrId) {
			return null;
		}
		var id = configItemOrId;
		if (configItemOrId instanceof it.ITVConfigItem) {
			id = configItemOrId.getId();
		}
		return this._configItemNodeMap[id];
	},

	addManagerChangeListener: function (listener, scope, ahead) {
		this._managerChangeDispatcher.add(listener, scope, ahead);
	},

	removeManagerChangeListener: function (listener, scope) {
		this._managerChangeDispatcher.remove(listener, scope);
	},

	createRelationNodeByLayerId : function(layerOrId){
		if(!layerOrId){
			return ;
		}
		var layer = layerOrId;
		if(typeof(layerOrId) == 'string'){
			layer = this.itvDataManager._layerMap[layerOrId];
		}
		var relations = layer.getRelations();
		for(var i = 0 ; i < relations.size() ; i++){
			var relation = relations.get(i);
			var line = this.relationManager.showRelationByDataOrId(relation);
		}
	},

	createLayerAndConfigItemsByLayer: function (layer) {
		if (!layer) {
			return;
		}
		var self = this;
		this.createLayerNode(layer, function () {
			self.createConfigItemsByLayer(layer);
			self.createRelationNodeByLayerId(layer);
		});
	},

	createConfigItemsByLayer: function (layer) {
		if (!layer || !layer.getConfigItem() || layer.getConfigItem().size() < 1) {
			return null;
		}
		var configItemLayers = layer.getConfigItem();
		for (var k = 0; k < configItemLayers.size(); k++) {
			var configItemLayer = configItemLayers.get(k);
			var configItemId = configItemLayer.getConfigItemId();
			this.createConfigItemNode(configItemId, configItemLayer);
		}
	},

	setNodeData: function (data, node, label, property, root) {
		if (!node || !node || !label || !property) return;
		if (node.getClient(label)) { //表示已经设置过
			return;
		}
		node.setClient('itv_data', data);
		node.setClient(label, data[property]);
		if (!root) {
			root = node;
			node.setClient('modelParent', null);
		} else {
			node.setClient('modelParent', root);
		}
		var self = this;
		if (node.getChildren() && node.getChildren().size() > 0) {// 注意，有可能孩子是其他的类型，所以的注意先后顺序
			node.getChildren().forEach(function (child) {
				self.setNodeData(data, child, label, property, root);
			});
		}
	},

    /**
     * 根据3D的Node获取业务对象
     */
	getDataByNode : function(node){
		if (!node) {
			return null;
		}
		return node.getClient('itv_data');
	},

    /**
     * 给layerNode设置业务信息，并加到dataBox中
     */
	bindLayerNode: function (layerNode, layer) {
		if (!layerNode || !layer) {
			return;
		}
		// 设置位置和业务属性
		layerNode.setPositionY(parseInt(layer.getHeight()));
		layerNode.layerId = parseInt(layer.getHeight()); // 绘制时排序按照这个来
		// layerNode.setClient('itv_layerId',layer.getId());
		this.setNodeData(layer, layerNode, 'itv_layerId', '_id');
		// 加到databox中
		this.dataBox.addByDescendant(layerNode);
		this._layerNodeMap[layer.getId()] = layerNode;
		this.loadLayerCount++;
	},

	/**
	 * 根据layerData创建层
	 */
	createLayerNode: function (layer, callback) {
		if (!layer) {
			return;
		}
		var self = this;
		var model = layer.getModel() || 'twaver.itv.default_layer'; // 没有模型就用默认的
		var modelParameters = layer.getModelParameters();
		var afterLoadNodeCallback = function (node) {
			if (!node) {
				return;
			}
			self.bindLayerNode(node, layer);
			self._managerChangeDispatcher.fire({ //创建好一个CI后派发相关的事件
				kind: 'add',
				type: 'L', // type表示的是添加的类型，“CI”是配置项，“L”是层
				data: node
			});
			callback && callback(node);
		}
		var node = this._layerNodeMap[layer.getId()];
		if (node) {
			afterLoadNodeCallback(node);
		} else {
			this.loadNodeByModel(model, modelParameters, afterLoadNodeCallback);
		}
	},

    /**
     * 绑定配置项Node的业务属性
     * @parent 有可能是configItem，也可能是configItemLayer
     **/
	bindConfigItemNode: function (configItemNode, configItem, parent) {
		if (!configItemNode || !configItem) {
			return;
		}
		this._configItemNodeMap[configItem.getId()] = configItemNode;
		// 给node设置业务属性
		this.setNodeData(configItem, configItemNode, 'itv_configItemId', '_id');
		var parentNode = null;
		if (parent instanceof it.ITVConfigItem) {
			parentNode = this._configItemNodeMap[parent.getId()];
			configItemNode.setPosition(configItem.getPosition().clone());
			configItemNode.setPositionY(configItem.getPosition().y+0.1);
		} else if (parent instanceof it.ITVConfigItemLayer) {
			parentNode = this._layerNodeMap[parent.getLayerId()];
			configItemNode.setPosition(parent.getPosition().clone());
		}
		if (parentNode) {
			//重新计算位置
			if (parentNode.getBoundingBox && configItemNode.getBoundingBox) {
				var lbb = parentNode.getBoundingBox();
				var cbb = configItemNode.getBoundingBox();
				var y = lbb.max['y'] - cbb.min['y'] + configItem.getPosition().y+0.1; //注意：configItem的y是超出地面的高度
				configItemNode.setPositionY(y);
				configItemNode.layerId = parseInt(y+parentNode.getPositionY());
			}
			configItemNode.setParent(parentNode); //父子关系什么时候清除呢?
		}
		// 添加到databox中
		this.dataBox.addByDescendant(configItemNode);
	},

    /**
     * 创建配置项的node
     * @configItemId 配置项编号
     * @parent 可以是configItemLayer，也可以是配置项
     */
	createConfigItemNode: function (configItemId, parent, callback) {
		if (!configItemId) {
			return;
		}
		// var configItem = this.itvDataManager._configItemMap[configItemLayer.getConfigItemId()];
		var configItem = this.itvDataManager._configItemMap[configItemId];
		if (!configItem) {
			return;
		}
		var self = this;
		var model = configItem.getModel() || 'twaver.itv.default_configItem';

		var modelParameters = configItem.getModelParameters();
		var afterLoadNodeModelCallback = function (node) {
			if (!node) {
				return;
			}
			if (self.defaultBillboard) {
				self.showBillboard(node);
			}
			self.bindConfigItemNode(node, configItem, parent);
			self._managerChangeDispatcher.fire({ //创建好一个CI后派发相关的事件
				kind: 'add',
				type: 'CI',
				data: node
			});
			self.loadConfigItmeChildren(configItem);
			callback && callback(node);
		}
		var node = this._configItemNodeMap[configItem.getId()];
		if (node) {
			afterLoadNodeModelCallback(node);
		} else {
			this.loadNodeByModel(model, modelParameters, afterLoadNodeModelCallback);
		}
	},

	loadConfigItmeChildren: function (configItem) {
		if (configItem && configItem.getChildren().size() > 0) {
			var children = configItem.getChildren();
			for (var i = 0; i < children.size(); i++) {
				var child = children.get(i);
				this.createConfigItemNode(child.getId(), configItem);
			}
		}
	},


	loadNodeByModel: function (model, modelParameters, callback) {
		if (!model) {
			return callback && callback(null);
		}
		this.sceneManager.loadModel(model, modelParameters, null, null, function (node) {
			if (node && node instanceof Array) {
				for (var i = 1; i < node.length; i++) {
					console.log('load a lots of model');
					node[i].setParent(node[0]); //让其他的是第一个的孩子
				}
				node = node[0];
			}
			callback && callback(node);
		});
	},

	getPositionByConfigItem: function (configItem, scope) {
		if (!configItem) {
			return null;
		}
		scope = scope || this;
		if (configItem.getParentId()
			|| scope.itvDataManager._configItemMap[configItem.getParentId()]) {
			var position = configItem.getPosition().clone() || new mono.Vec3(0, 0, 0);
			var parentConfigItem = scope.itvDataManager._configItemMap[configItem.getParentId()];
			var pos = scope.getPositionByConfigItem(parentConfigItem);
			if (pos) {
				return position.add(pos);
			}
		}
		return new mono.Vec3(0, 0, 0);
	},

	showLayerBillboard: function (dataOrId) {
		var self = this;
		if(dataOrId instanceof $ITVLayer){
			var data = dataOrId;
		}else if(typeof dataOrId == 'string'){
			var data = this.itvDataManager._layerMap[dataOrId];
		}else{
			return;
		}
		if(!data) return;
		var configItems = data.getConfigItem();
		configItems.forEach(function(configItem){
			var configItemId = configItem.getConfigItemId();
			var configItemData = self.itvDataManager._configItemMap[configItemId];
			self.showBillboard(configItemData);
			var descendant = configItemData.getDescendants();
			descendant.forEach(function(data){
				self.showBillboard(data);
			})
		})
	},
	hideLayerBillboard: function (dataOrId) {
		var self = this;
		if(dataOrId instanceof $ITVLayer){
			var data = dataOrId;
		}else if(typeof dataOrId == 'string'){
			var data = this.itvDataManager._layerMap[dataOrId];
		}else{
			return;
		}
		if(!data) return;
		var configItems = data.getConfigItem();
		configItems.forEach(function(configItem){
			var configItemId = configItem.getConfigItemId();
			var configItemData = self.itvDataManager._configItemMap[configItemId];
			self.hideBillboard(configItemData);
			var descendant = configItemData.getDescendants();
			descendant.forEach(function(data){
				self.hideBillboard(data);
			})
		})
	},
	showBillboard: function (dataOrId) {
		if(dataOrId instanceof $ITVConfigItem){
			var data = dataOrId;
		}else if(typeof dataOrId == 'string'){
			var data = this.itvDataManager._configItemMap[dataOrId];
		}else{
			return;
		}
		if (!data || data.getCategoryId() == 'group') return;
		var id = data.getId();
		var node = this._configItemNodeMap[id];
		if (!this.billboardMap[id]) {
			var name = data.getName();
			var canvas = this.createCanvas(name);
			if (!canvas) {
				return null;
			}
			var billboard = new mono.Billboard();
			var scaleX = canvas.width / 6, scaleY = canvas.height / 6;
			billboard.setScale(scaleX, scaleY, 1);
			billboard.setStyle('m.texture.image', canvas);
			billboard.setStyle("m.transparent", true);
			billboard.setStyle("m.alphaTest", 0.2);
			billboard.invalidateTexture();
			billboard.setParent(node);
			billboard.setPositionY(node.getBoundingBox().size().y / 2 + scaleY / 2 + 20);
			billboard.setClient('itv_data',data);
			this.billboardMap[id] = billboard;
		}
		this.billboardMap[id].setParent(node);
		this.dataBox.add(this.billboardMap[id]);
	},
	hideBillboard: function (dataOrId) {
		if(dataOrId instanceof $ITVConfigItem){
			var data = dataOrId;
		}else if(typeof dataOrId == 'string'){
			var data = this.itvDataManager._configItemMap[dataOrId];
		}else{
			return;
		}
		if (!data || data.getModel() == 'twaver.idc.group') return;
		var id = data.getId();
		if (this.billboardMap[id]) {
			this.billboardMap[id].setParent(null);
			this.dataBox.remove(this.billboardMap[id]);
		}
	},
	createCanvas: function (text) {
		if (!text) return;
		var width = mono.Utils.nextPowerOfTwo(this.canvasConfig.width);
		var height = mono.Utils.nextPowerOfTwo(this.canvasConfig.height);
		var canvas = document.createElement('canvas');
		canvas.height = height;
		canvas.width = width;
		var ctx = canvas.getContext('2d');
		ctx.drawImage(this.canvasConfig['bgImage'], 0, 0, width, height);
		var csize = this.canvasConfig['fSize'] || 18;
		var fontFamily = this.canvasConfig['fontFamily'] || "Microsoft Yahei";
		ctx.font = csize + 'px ' + fontFamily;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = this.canvasConfig['fColor'] || "black";
		while(ctx.measureText(text).width > width*0.9){
			ctx.font = --csize + 'px ' + fontFamily;
		}
		ctx.fillText(text, width / 2, height / 2, width);
		return canvas;
	},
	toggleAllbillboards:function(){
		if(!this.showAllBillboards){
			for(var p in this._configItemNodeMap){
				this.showBillboard(p);
			}
			this.showAllBillboards=true;
		}else{
			for(var p in this._configItemNodeMap){
				this.hideBillboard(p);
			}
			this.showAllBillboards=false;
		}
	},
	getRelDibanPos:function(node){
		var self = this;
		var pos = new mono.Vec3();
		while(self.getDataByNode(node) instanceof $ITVConfigItem){
			var nodePos = node.getPosition();
			pos.x += nodePos.x;
			pos.y += nodePos.y;
			pos.z += nodePos.z;
			node = node.getParent(); 
		}
		return pos;
	}
});

it.ITVManager = $ITVManager;