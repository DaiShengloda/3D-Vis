
var $ITVHandler = function(itvManager){
	it.EventHandler.call(this);
	this.itvManager = itvManager;
	this.itvDataManager = this.itvManager.itvDataManager;
	this.sceneManager = this.itvManager.sceneManager;
	this.materialFilter = new $ITVVirtualManager(this.sceneManager,this.itvManager,true);
	this.defaultEventHandler = this.sceneManager.viewManager3d.defaultEventHandler;
	this.oldNavBarFocusChangeHandle = main.panelMgr.instanceMap["NavBarMgr"]._focusChangeHandle;
	this.linkAssetLine = {};
	this.itvPanelMgr = new it.ITVPanelMgr(sceneManager,this);
	this.groupManager = new it.ITVGroupManager(this.itvManager);
	// this.setNetwworksort();
	this.assetMap = {};
	this.curConfigItemId;
	this.currentLayerId;
};

mono.extend($ITVHandler,it.EventHandler,{

    init : function(){
    	this.sceneManager.viewManager3d.addMaterialFilter(this.materialFilter);
    	// this.sceneManager.doubleClickBackgroundGotoUpLevelScene = false;
    	main.panelMgr.instanceMap["NavBarMgr"]._focusChangeHandle = function(){
    		// do nothing;
    	}
    	this.groupManager.init();
    },

	clear : function(){
		this.materialFilter.clear();
		this.sceneManager.viewManager3d.removeMaterialFilter(this.materialFilter);
		this.clearLinkAssetLine();
		// this.sceneManager.doubleClickBackgroundGotoUpLevelScene = true;
		main.panelMgr.instanceMap["NavBarMgr"]._focusChangeHandle = this.oldNavBarFocusChangeHandle;
		this.itvPanelMgr.clear();
		this.clearLayerStatus();
		this.groupManager.clear();
	},

	setNetwworksort: function() {
		var oldSortNodesFun = this.sceneManager.network3d.sortNodesFunc;
		var self = this;
		this.sceneManager.network3d.sortNodesFunc = function(glNodeList) {
			// var glNodeList = oldSortNodesFun.call(self.sceneManager.network3d, glNodeList);
			// var sortFun = function(a, b) {
			// 	// if (a.node. && a.node.getClient && a.node.getClient('isCloud')) {
			// 	// 	return -1;
			// 	// }
			// 	// if (b.node && b.node.getClient && b.node.getClient('isCloud')) {
			// 	// 	return 1;
			// 	// }
			// 	// return 0;
			// 	if (a.node && a.node.layerId != null && b.node && b.node.layerId != null) {
			// 		return a.node.layerId - b.node.layerId;
			// 	}else{
			// 		return 0;
			// 	}
			// }
			// glNodeList.sort(sortFun);
			// return glNodeList;
			// if (this.__st == null) {
			var sort = function(a, b) {
					self.sceneManager.network3d.wrapBillboardMaterial(a);
					self.sceneManager.network3d.wrapBillboardMaterial(b);
					var opaque = "opaque";
					if (a.node && a.node.layerId != null && b.node && b.node.layerId != null) {
						// if(b.node.layerId == 507){
						// 	return -1;
						// }
						return b.node.layerId - a.node.layerId;
					}else if (a[opaque] && b[opaque]) {
						return a[opaque].id - b[opaque].id;
					} else if (!a[opaque] && b[opaque]) {
						return -1;
					} else if (a[opaque] && !b[opaque]) {
						return 1;
					} else {
						if( a.transparent && b.transparent) {
							return a.transparent.id - b.transparent.id;
						} else {
							return 0;
						}
					}
				};
			// }
			glNodeList.sort(sort);
			return glNodeList;
		}
	},

	shouldHandleDoubleClickElement: function (element, network, data, clickedObj) {
		// if(element && element.getClient('itv_data')){
		return true;
		// }
		//      return false;
	},

	shouldHandleDoubleClickBackground: function (network, event) {
		// if(element && element.getClient('itv_data')){
		return true;
		// }
		// return false;
	},

	shouldHandleClickElement: function (element, network, data, clickedObj) {
		if (element && element.getClient('itv_data')) {
			return true;
		}
		return false;
	},


	handleDoubleClickBackground: function (network) {
		// this.invisibleLinkAssetLine(true);
		// this.itvManager.relationManager.clearLinksBetweenDifferentLayer();// 两层之间的连线不清除

		if (this.sceneManager.shouldHandleDoubleClickBackground(network)) {
			this.clearIDCNodes();
			if(this.idcShow){
				this.resetCamera();
				this.idcShow = false;
			}
			this.materialFilter.clear();
			if(this.currentLayerId){
				this.showOneLayer(this.currentLayerId);
			}
			main.sceneManager.network3d.dirtyNetwork();
		} else {
			// clear IDC中的对象
			this.defaultEventHandler.handleDoubleClickBackground(network);
			var focusNode = this.sceneManager.viewManager3d.getFocusNode();
			if(focusNode){
				var focusData = this.sceneManager.getNodeData(focusNode);
				var category = this.sceneManager.dataManager.getCategoryForData(focusData);
				if(category.getId() == 'floor'){
					this.invisibleLinkAssetLine(true);
				}
			}
		}
		// main.sceneManager.viewManager3d.defaultMaterialFilter.clear()
		// this.resetCamera();
	},

    /**
     * 双击IT架构上的对象
     */
	handleDoubleClickElement: function (element, network, data, clickedObj, callback) {
		var data = this.sceneManager.getNodeData(element);
		if (data) {
			if(this.curConfigItemId&&this.assetMap[this.curConfigItemId]){
				var assetId = this.assetMap[this.curConfigItemId];
				var data = this.sceneManager.dataManager.getDataById(assetId);
				var oldisCurrentSceneInstance = main.sceneManager.isCurrentSceneInstance;
				main.sceneManager.isCurrentSceneInstance = function(dataOrId,isNearestScene){
					if(dataOrId == data){
						return true;
					} else{
						return oldisCurrentSceneInstance.call(main.sceneManager,dataOrId,isNearestScene);
					}
				}
			}
			this.handleDoubleClickIDCElement(element, network, data, clickedObj, callback);
			if(oldisCurrentSceneInstance){
				main.sceneManager.isCurrentSceneInstance = oldisCurrentSceneInstance;
			}
		} else {
			this.clearIDCNodes();
			this.invisibleLinkAssetLine(false);
			this.handleDoubleClickITVElement(element, network, data, clickedObj, callback);
		}
	},

    /**
     * 双击到的是IT架构中的对象(配置项、层、关系)
     */
	handleDoubleClickITVElement: function (element, network, data, clickedObj, callback) {
		var layerId = element.getClient('itv_layerId');
		var configItemId = element.getClient('itv_configItemId');
		var self = this;
		var defaultHandler = self.sceneManager.viewManager3d.defaultEventHandler;
		if (configItemId) {
			//属性面板暂不显示
			// this.itvPanelMgr.showInfoBydata(configItemId);  
			this.curConfigItemId = configItemId;
			//虚化其它所有configItem
			// 2018-01-22 拉近不虚幻
			// this.materialFilter.addAllConfigItem();
			// this.materialFilter.removeConfigItem(configItemId);
			// this.materialFilter.addAllRelation();

			//测试点击显示机房和机柜，以及机柜中的设备，需要注意的是位置;一直找，找的离它最近的Scene，加到Box中
			var configItem = this.itvDataManager._configItemMap[configItemId];
			var allRelationItem = this.itvManager.relationManager.showTotalRelationByConfigItem(configItem);
			var configItemNode = this.itvManager._configItemNodeMap[configItemId];
			if(this.groupManager.isGroupNode(configItemNode)){
				this.groupManager.doGroup(configItemNode);
			} else if (configItem && configItem.getAssetId() && !this.currentLayerId) {
				if(configItem.getParentId()){
					var parentId = configItem.getParentId();
					var parentItem = this.itvDataManager._configItemMap[parentId];
					while(parentItem.getParentId()){
						parentId = parentItem.getParentId();
						parentItem = this.itvDataManager._configItemMap[parentId];
					}
					var layers = this.itvManager.itvDataManager._configItemLayers[parentId];
				}else{
					var layers = this.itvManager.itvDataManager._configItemLayers[configItemId];
				}
				if (layers && layers.length > 0) {
					layerId = layers[0].getLayerId();
				}
				var assetId = configItem.getAssetId();
				this.assetMap[configItemId] = assetId;
				var afterAddIDCNodesCallback = function(rootNode, node) {
					var layerNode = self.itvManager._layerNodeMap[layerId];
					if (layerNode && rootNode) {
						var positionY = rootNode.getY();
						var oldScale = rootNode.getScale();
						rootNode.setPositionY(layerNode.getY() - 1500);
						var scale = new mono.Vec3(1, 1, 1);
						if (layerNode.getBoundingBox() && rootNode.getBoundingBox()) {
							var lbb = layerNode.getBoundingBox().size();
							var rbb = rootNode.getBoundingBox().size();
							scale.setX(rbb.x / lbb.x / 3);
							scale.setZ(rbb.z / lbb.z / 3);
							// rootNode.setScale(scale); // 注意设置回去？
						}
						var rootNodeData = self.sceneManager.getNodeData(rootNode);
						var obj = {
							data: rootNode,
							properties: {
								setY: positionY,
								setScale: oldScale
							}
						};
						var key = rootNode.getId();
						if (rootNodeData && rootNodeData.getId) {
							key = rootNodeData.getId();
						}
						self.itvManager.tempMap[key] = obj;
					}
					if(self.linkAssetLine[configItemId + assetId]){
						var line = self.linkAssetLine[configItemId + assetId];
					}else{
						var line = self.itvManager.relationManager.createLineFromCItemToNode(element, node);
						self.linkAssetLine[configItemId + assetId] = line;
					}
					if (line) {
						self.itvManager.dataBox.add(line);
					}
					var nodes = [node, element];
					allRelationItem.forEach(function (id) {
						nodes.push(self.itvManager._configItemNodeMap[id]);
					})
					self.lookAtMultilayerNodes(nodes,element);
				}
				this._addIDCNodes(assetId, afterAddIDCNodesCallback);
			} else {
				var nodes = [element];
				allRelationItem.forEach(function (id) {
					if (!id) return;
					nodes.push(self.itvManager._configItemNodeMap[id]);
				})
				var oldGetElementPerfectDistanceOffset = defaultHandler.getElementPerfectDistanceOffset;
				defaultHandler.getElementPerfectDistanceOffset = function(node){
					if(node.getClient('itv_data') instanceof $ITVConfigItem) return 500;
					return oldGetElementPerfectDistanceOffset.call(defaultHandler,node);
				}
				nodes.length == 1 ? self.lookAtSingleNode(clickedObj||nodes[0]) : self.lookAtMultilayerNodes(nodes,element);
			}
		} else if (layerId) { //点击配置项，展示单个配置项，将它垂直起来展示
			this.idcShow = false;
			this.showOneLayer(layerId);
		} else {
			this.handleDoubleClickBackground();
		}
		console.log('double click layerId : ' + layerId + "  configItemId:" + configItemId);
	},

    /**
     * 双击的是3D机房中的资产(it.Data)
     */
	handleDoubleClickIDCElement : function(element, network, data, clickedObj, callback){
		console.log('click idc node！！！');
		// this.itvManager.clear();
		// 点击到3D机房的东西时那就到3D机房中去，退出it架构模式
		// if(this.defaultEventHandler.shouldHandleDoubleClickElement(element,network,data,clickedObj)){
		// 	this.defaultEventHandler.handleDoubleClickElement(element, network, data, clickedObj, callback);
		// 	return ;
		// }

        //直接钻取到3D机房中，清除IT架构
		/* 
		this.itvManager.clear();
		//清除后完全交给3D机房的来处理，不过避免有场景切换动作，执行前将将当前场景和rootData设置一下先(到架构模式时，当前场景变空了)
		var sceneAndRoot = this.sceneManager.getSceneAndRootByData(data);
		this.sceneManager._currentScene = sceneAndRoot.scene;
	    this.sceneManager._currentRootData = sceneAndRoot.rootData;
	    this.sceneManager._currentRootNode = this.sceneManager.getNodeByDataOrId(sceneAndRoot.rootData);
	    this.sceneManager.setAllParentRelationShip(sceneAndRoot.scene,sceneAndRoot.rootData);
		this.sceneManager.viewManager3d.handleDoubleClick(clickedObj); 
		*/

		//清除连到它(钻取)的连线，拉近镜头看该资产信息
		// this.materialFilter.addAllConfigItem(); // 将关系和配置项都隐藏掉
		// this.materialFilter.addAllRelation();
		this.invisibleLinkAssetLine(false);
		this.sceneManager.viewManager3d.defaultEventHandler.lookAt(element);
	},

    /**
     * 显示某个层，其他的慢慢虚化掉
     */
	showOneLayer: function(layerId) {
		this.currentLayerId = layerId;
		if (!layerId) {
			return;
		}
		// if (this.playLayerAnimate) {
		// 	this.playLayerAnimate.stop();
		// }
		if (!this.showLayerVirtualFilter) {
			this.showLayerVirtualFilter = new $ITVVirtualManager(this.sceneManager, this.itvManager);
			this.sceneManager.viewManager3d.addMaterialFilter(this.showLayerVirtualFilter);
		}
		this.showLayerVirtualFilter.materialMap = {};
		this.showLayerVirtualFilter.opacityValue = 0.01;
		this.showLayerVirtualFilter.addAll(true); //true
		this.showLayerVirtualFilter.removeLayerAndChildren(layerId,true); //true
		var layerNode = this.itvManager._layerNodeMap[layerId];
		var rotationX = layerNode.getRotationX();
		var camera = this.sceneManager.network3d.getCamera();
		var target = layerNode.getWorldPosition();
		var position = null;
		var bb = layerNode.getBoundingBox();
		if (bb) {
			var center = bb.center();
			target = new mono.Vec3(target.x + center.x, target.y + center.y, target.z + center.z);
			var maxLen = bb.size().x > bb.size().z ? bb.size().x : bb.size().z;
			position = new mono.Vec3(target.x, target.y, target.z+300 + maxLen);
		}
		var self = this;
		var playLayerAnimate = new mono.Animate({
			from: 0,
			to: 1,
			dur: 1000,
			onUpdate: function(value) {
				if (rotationX) {
					layerNode.setRotationX(rotationX * (1 - value));
					// self.showLayerVirtualFilter.opacityValue = value;
				} else {
					layerNode.setRotationX(Math.PI / 2 * value);
					// self.showLayerVirtualFilter.opacityValue = (1- value+0.1);
				}
			},
			onStop: function() {
				if (rotationX) {
					self.showLayerVirtualFilter.removeAll(true); //true
					self.unlockDefaultInteraction();
					self.defaultEventHandler.moveCameraForLookAtNode(layerNode); //回退时镜头就lookAt到该层
					self.itvManager.autoLayout.resetCIPositionAndRelation(); //有可能自动布局了，这里需要重新计算跨楼层的连线的位置
					self.itvManager.autoLayout.autoLayoutPanel.hide();
					main.panelMgr.instanceMap.NavBarMgr.doCustomAppChangeNavbar('ITVM','ITVM');
				} else {
					self.lockDefaultInteraction();
					main.panelMgr.instanceMap.NavBarMgr.doCustomAppChangeNavbar('ITVM','AutoLayout');
				}
			}
		});
		if (rotationX) {
			// this.defaultEventHandler.moveCameraForLookAtNode(layerNode,function(){
				playLayerAnimate.play();
			// });
		} else {
			it.util.playCameraAnimation(camera, position, target, 0, 1000, 0, function() {
				playLayerAnimate.play();
			});
		}
	},
    
    /**
     * 锁定默认交互
     * 控制：旋转、最近、最远距离
     */
	lockDefaultInteraction : function(){
		var defaultInteraction = this.sceneManager.network3d.getDefaultInteraction();
		defaultInteraction.maxDistance = 2500;
		defaultInteraction.minDistance = 1000;
		defaultInteraction.noRotate = true;
	},
 
    /**
     * 解开交互的锁定
     */
	unlockDefaultInteraction : function(){
		var defaultInteraction = this.sceneManager.network3d.getDefaultInteraction();
		defaultInteraction.maxDistance = 10000;
		defaultInteraction.minDistance = 100;
		defaultInteraction.noRotate = false;
		this.currentLayerId = null;
	},

    /**
     * 清除层的状态
     */
	clearLayerStatus : function(){
		for(var layerId in this.itvManager._layerNodeMap){
			var layerNode = this.itvManager._layerNodeMap[layerId];
			layerNode.setRotationX(0);
		}
		if (this.showLayerVirtualFilter) {
			this.showLayerVirtualFilter.removeAll(true);
			// this.sceneManager.viewManager3d.removeMaterialFilter(this.showLayerVirtualFilter);
		}
		// this.currentLayerId = null;
		this.unlockDefaultInteraction();
		// if(this.currentLayerId){
		// 	var layerNode = this.itvManager._layerNodeMap[layerId];

		// }
	},

	_addIDCNodes : function(dataId,callback){
		if (!dataId) {
			return null;
		}
		var self = this;
		var afterLoadNode = function(node) {
			self.idcShow = true;
			var rootNode = self._addParentNode(dataId);
			if (callback) {
				callback(rootNode, node);
			}
			var sceneAndRoot = self.sceneManager.getSceneAndRootByData(self.sceneManager.getNodeData(rootNode));
			if (sceneAndRoot) {
			    self.sceneManager._currentRootNode = self.sceneManager.getNodeByDataOrId(sceneAndRoot.rootData);
			    self.itvManager.savedCurrentRootData =  sceneAndRoot.rootData;
				self.itvManager.savedCurrentScene = sceneAndRoot.scene;
				self.sceneManager.viewManager3d._focusNode = self.sceneManager._currentRootNode;
			}
			
		}
		var dataNode = this.sceneManager.dataNodeMap[dataId];
		if (!dataNode) {
			this.sceneManager.loadLazyData(dataId,function(node){
				self.sceneManager.setNodeData(self.sceneManager.dataManager.getDataById(dataId),node);
				self.sceneManager.dataNodeMap[dataId] = node;
				setTimeout(function(){
					afterLoadNode(node);
				},1);
			});
		} else {
			this.itvManager.dataBox.add(dataNode);
			afterLoadNode(dataNode);
		}
	},

	_addParentNode : function(dataId,scope){
		if(!dataId){
			return ;
		}
		scope = scope || this;
		var data = scope.sceneManager.dataManager.getDataById(dataId);
		if(!data){
			return ;
		}
		var parentId = data.getParentId();
		var dataCategory = scope.sceneManager.dataManager.getCategoryForData(data);
		// var parentCategory = this.sceneManager.dataManager.getCategoryForData(parentId);
		if (!dataCategory) {
			return ;
		}
		var sceneMap = scope.sceneManager.dataManager._sceneMap;
		if (sceneMap[dataCategory.getId()]) { // 如果data是个scene的话，就加载到这里为止
			return ;
		}
		var node = scope.sceneManager.getNodeByDataOrId(data);
		var parentNode = scope.sceneManager.getNodeByDataOrId(parentId); //如果parentNode还没有加载好咧？
		node.setParent(parentNode);
		scope.itvManager.dataBox.addByDescendant(parentNode);
		var resultNode = arguments.callee(parentId, scope);
		if (resultNode) {
			return resultNode;
		} else {
			return parentNode;
		}
	},

	clearLinkAssetLine: function () {
		for (var p in this.linkAssetLine) {
			this.itvManager.dataBox.remove(this.linkAssetLine[p]);
			delete this.linkAssetLine[p];
		}
	},

    /**
     * 隐藏/显示所有连到资产上的连线
     */
	invisibleLinkAssetLine: function(visible) {
		for (var p in this.linkAssetLine) {
			this.linkAssetLine[p].setVisible(!!visible);
		}
	},
	
	resetCamera: function () {
		var layers = [];
		for (var layerId in this.itvManager._layerNodeMap) {
			layers.push(this.itvManager._layerNodeMap[layerId]);
		}
		this.sceneManager.viewManager3d.defaultEventHandler.lookAtElements(layers);
	},
    /**
     * 清除idc的对象
     */
	clearIDCNodes: function() {
		this.clearLinkAssetLine(); //清除idc的资产时，联到资产上的连线也清除掉
		for (var id in this.sceneManager.dataNodeMap) {
			var node = this.sceneManager.dataNodeMap[id];
			if (node) {
				node.setParent(null);
			}
		}
		for (var id in this.sceneManager.dataNodeMap) {
			var node = this.sceneManager.dataNodeMap[id];
			if (node) {
				this.itvManager.dataBox.removeByDescendant(node);
			}
		}
	},

    /**
     * 单击IT架构上的对象
     */
	handleClickElement: function (element, network, data, clickedObj) {
		var layerId = element.getClient('itv_layerId');
		var configItemId = element.getClient('itv_configItemId');
		console.log('click layerId : ' + layerId + "  configItemId:" + configItemId);
	},

	lookAtMultilayerNodes:function(nodes,element){
		var self = this;
		var defaultHandler = self.sceneManager.viewManager3d.defaultEventHandler;
		this.materialFilter.addAll();
		nodes.forEach(function(node){
			if(!node || !node.getClient('itv_data')) return;
			while(node.getClient('itv_data') instanceof $ITVConfigItem){
				self.materialFilter.removeConfigItem(node.getClient('itv_data'));
				node = node.getParent();
			}
			self.materialFilter.removeLayer(node.getClient('itv_data'));
		});
		var curDataId = element.getClient('itv_data').getId();
		var addVirtualRelation = function(dataId,dir){
			var relDatas = self.itvManager.relationManager._relConfigItemMap[dataId];
			if(relDatas){
				if(dir == 'from'){
					relDatas.fromDatas.forEach(function(relation){
						self.materialFilter.removeRelation(relation);
						addVirtualRelation(relation.getFromId(),dir);
					});
				}
				if(dir == 'to'){
					relDatas.toDatas.forEach(function(relation){
						self.materialFilter.removeRelation(relation);
						addVirtualRelation(relation.getToId(),dir);
					});
				}
			}
		}
		addVirtualRelation(curDataId,'from');
		addVirtualRelation(curDataId,'to');
		defaultHandler.lookAtElements(nodes);
	},
	lookAtSingleNode:function(node){
		this.clearIDCNodes();
		this.invisibleLinkAssetLine(false);
		var defaultHandler = this.sceneManager.viewManager3d.defaultEventHandler;
		defaultHandler.moveToClickPoint(node);
	}

});

it.ITVHandler = $ITVHandler;
