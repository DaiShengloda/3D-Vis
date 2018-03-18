var $USearchManager = function (sceneManager) {
	it.BaseSearch.call(this, sceneManager);
	this.sceneManager = sceneManager;
	this.visibleManager = new it.VisibleManager(this.sceneManager);
	this.dataBox = this.sceneManager.network3d.getDataBox();
	this.init();
	this.rackMaps = {}; //临时存放不同类型的机柜的frame模板，便于创建
	this.devMaps = {}; //临时存放不同类型的设备的color模板，便于同种类型的设备进行复制 
	this.templateEmptyNode = {};
	this.frameRacks = {};//保存创建好的frame机柜
	this.diagram = $('<div>').appendTo($('.view-control')).hide();
	this.diagram.uSearchLegend();
	this.spaceMap = {};
	var self = this;
	this.sceneManager.dataManager.addDataManagerChangeListener(function (event) {
		if (event.data) {
			var parentId = event.data.getParentId();
			if (parentId && self.spaceMap[parentId]) {
				delete self.spaceMap[parentId];
			}
		}
	});
};

mono.extend($USearchManager, it.BaseSearch, {

	init: function () {
		var self = this;
		var isConform = this.dataFinder.isDataConformCondition;
		this.dataFinder.isDataConformCondition = function (data, condition, key) {
			if (data && condition && condition.key === 'sizeU') {
				var dataType = self.sceneManager.dataManager.getDataTypeForData(data);
				if (dataType && dataType._size && dataType._size.ySize == condition.value) {
					return true;
				}
				return false;
			} else {
				return isConform.call(self, data, condition, key);
			}
		};

		//最合理的是，获取当前场景中的所有的设备，并不是所有的设备
		this.dataFinder.getDatas = function () {
			var equipMap = self.sceneManager.dataManager._categoryDatas['equipment'];
			if (!equipMap) {
				return null;
			}
			var results = [];
			for (var id in equipMap) {
				if (main.sceneManager.isCurrentSceneInstance(equipMap[id])) results.push(equipMap[id]);
			}
			return results;
		};

		this.visibleManager.isDealWithFunction = function (data) {
			var category = self.sceneManager.dataManager.getCategoryForData(data);
			if (category && (category.getId().toLowerCase() == 'floor' || category.getId().toLowerCase() == 'room')) {
				return false;
			}
			return true;
		};

		// var orgLabel = this.orgTreeManager.createLabel;
		// this.orgTreeManager.createLabel = function(treeData) {
		//     if (!treeData) {
		//         return orgLabel(treeData);
		//     }
		//     var label = treeData.getName();
		//     if (label) {
		//         label += "(" + treeData.getId() + ")";
		//     } else {
		//         label = treeData.getId();
		//     }
		//     return label;
		// };
	},

	createInputPane: function () {
		return new it.USearchPanel();
	},

	//点击tree上的节点时，去掉默认的移动镜头去看具体机柜或设备的动作
	clickTreeNode: function (treeData) {
		return null;
	},

	setResult: function (result, treeNodes) {
		// this.clearSpaceNode(); // 先清空
		var rootData = this.sceneManager._currentRootData
			|| this.sceneManager.getNodeData(this.sceneManager.getCurrentRootNode());
		this.visibleManager.setVisibleByDescendant(rootData, false, false);
		if (!result) return;
		var nodes = [];
		for (var i = 0; i < result.length; i++) {
			var data = result[i];
			if (data
				&& data.getParentId()
				&& !this.visibleManager.isVisible(null, data.getParentId())
				&& this.sceneManager.isCurrentSceneInstance(data.getParentId())) { //只处理当前场景
				var parent = this.sceneManager.dataManager.getDataById(data.getParentId());
				this.createSpaceNode(data);
				// this.visibleManager.setVisible(parent,true,false); 
			}
			// this.visibleManager.setVisible(data,true,false);

		}
		this.sceneManager.viewManager3d.clearVisibleMap();
		if (result && result.length > 0) {
			this.showSerialDiagram();
		} else { //当没有node的时候就隐藏掉
			this.diagram.uSearchLegend('hide');
		}
	},

	getColorValues: function () {
		var uColors = main.systemConfig.u_color_config;
		if (!uColors || uColors.length < 1) {
			var key = '5U' + it.util.i18n("USearchManager_up");
			return { '1U': '#8A0808', '2U': '#088A08', '3U': '#B18904', '4U': '#6A0888', key: '#088A85' };
		}
		var result = {};
		for (var i = 0; i < uColors.length; i++) {
			var uColor = uColors[i];
			if (uColor) {
				var key = '';
				if (!uColor.fromU && uColor.toU) {
					if (i == 0) {
						key = uColor.toU + 'U' + it.util.i18n("USearchManager_down");
					} else {
						key = uColors[i - 1].toU + 'U-' + uColor.toU + 'U';
					}
				} else if (uColor.fromU && !uColor.toU) {
					if (i < uColors.length - 1) {
						key = uColor.fromU + 'U-' + uColors[i + 1].fromU + 'U';
					} else {
						key = uColor.fromU + 'U' + it.util.i18n("USearchManager_up");
					}
				} else if (!uColor.fromU && !uColor.toU) {
					if (i < uColors.length - 1) {
						key = (i + 1) + 'U-' + (i + 2) + 'U';
					} else {
						key = i + 1 + 'U' + it.util.i18n("USearchManager_up");
					}
				} else {
					key = uColor.fromU + 'U-' + uColor.toU + 'U';
				}
				result[key] = uColor.color;
			}
		}
		return result;
	},

	getColorByUHeight: function (uHeight) {
		if (!uHeight) {
			return null;
		}
		uHeight = parseInt(uHeight);
		if (!uHeight) {
			return null
		}
		var uColors = main.systemConfig.u_color_config;
		var result = null;
		if (uColors && uColors.length > 0) {
			var lastColor = uColors[0].color;
			for (var i = 0; i < uColors.length; i++) {
				var uc = uColors[i];
				if (i != 0) {
					lastColor = uColors[i - 1].color;
				}
				if (!uc) {
					continue;
				}
				if (uc.fromU
					&& uc.toU
					&& parseInt(uc.fromU) <= uHeight
					&& parseInt(uc.toU) >= uHeight) {
					result = uc.color;
					break;
				} else if (uc.fromU
					&& !uc.toU
					&& parseInt(uc.fromU) > uHeight) {
					result = lastColor;
					break;
				} else if (!uc.fromU
					&& uc.toU
					&& parseInt(uc.toU) > uHeight) {
					result = lastColor;
					break;
				}
			}
		}
		if (!result) {
			var colors = ['#8A0808', '#088A08', '#B18904', '#6A0888', '#088A85'];
			result = colors[uHeight - 1 < colors.length ? uHeight - 1 : colors.length - 1];
		}
		return result;
	},

    /**
     * 重写例图的显示内容
     * @param num 表示连续可用的空间，47U
     * 剩余的个数越少，颜色就越接近与红色
     */
	showSerialDiagram: function () {
		var self = this;
		var datas = [];
		// var colors=['#8A0808', '#088A08', '#B18904', '#6A0888','#088A85'];
		// var values = ['1U', '2U', '3U','4U','5U及以上'];
		// for(var i = 0; i < colors.length; i ++){
		// 	var data = {color: colors[i], 
		//            minCount: 1,
		//            maxCount: 2,
		//            value: values[i] };
		//     datas.push(data);
		// }
		var cvMap = this.getColorValues();
		if (cvMap) {
			for (var key in cvMap) {
				var data = {
					color: cvMap[key],
					minCount: 1,
					maxCount: 2,
					value: key,
				}
				datas.push(data);
			}
		}
		var legends = [];
		$.each(datas, function (index, val) {
			legends.push({
				color: val.color,
				text: val.value
			});
		});

		var volume = 0, occupy = 0;
		var rootData = main.sceneManager._currentRootData;
		var childrenDatas = main.sceneManager.dataManager.getDescendants(rootData);
		childrenDatas.forEach(function (c) {
			if (main.sceneManager.dataManager.getCategoryForData(c).getId() == 'rack') {
				var dataId = c.getId();
				if (!self.spaceMap[dataId]) {
					self.spaceMap[dataId] = self.spaceManager.computeSpace(c);
				}
				volume += self.spaceMap[dataId].getTotal() || 0;
				occupy += self.spaceMap[dataId].getOccupation() || 0;
			}
		});

		this.diagram.uSearchLegend('option', {
			'title': it.util.i18n("USearchManager_device_legend"),
			'legend': legends,
			'volume': volume,
			'occupy': occupy,
			'unit': 'U'
		});
		this.diagram.uSearchLegend('show');

	},

	beforeDoClick: function () {
		this.clearColorCube();
		this.sceneManager.viewManager3d.addVisibleFilter(this.visibleManager);
		this.rackMaps = {};
		this.devMaps = {};
		this.frameRacks = {};
	},

	beforHide: function () {
		this.diagram.uSearchLegend('hide');
	},

	/**
	* 点击搜索中的“清除”时，所要处理的就是清除搜索的结果即可，显示所有
   */
	clearSearchData: function () {
		this.visibleManager.clear();
		this.clear();
		this.diagram.uSearchLegend('hide');
	},

	show: function () {
		this.sceneManager.viewManager3d.addVisibleFilter(this.visibleManager);
		this.visibleManager.clear();
	},

	clear: function () {
		this.sceneManager.viewManager3d.removeVisibleFilter(this.visibleManager);
		this.rackMaps = {};
		this.devMaps = {};
		this.clearColorCube();
		this.frameRacks = {};
	},

	clearColorCube: function () {
		for (var id in this.frameRacks) {
			var frameRack = this.frameRacks[id];
			frameRack.setParent(null);
			this.dataBox.removeByDescendant(frameRack);
		}
	},

    /**
     * 显示样式，当返回true时，将连续的空余空间用一个实心的Cube表示，否则则是用一个整体的frame+一个透明的彩色Cube表示
     */
	isCreateEmpNode: function () {
		return true;
	},

    /**
     * 根据设备创建彩色方块，包括机柜
     * 注意：
     *     1、避免机柜重复创建
     *     2、由于查询时必须输入查询的U数，因此所有的设备的彩色方块都是一样的，唯一不同的就是位置(注意，是不是存在长和宽不一样的情况呢?)
     *
     */
	createSpaceNode: function (data) {
		var self = this;
		var sm = this.sceneManager;
		var dm = sm.dataManager;
		// var dataBox = sm.network3d.getDataBox();
		var dataType = dm.getDataTypeForData(data);
		if (!dataType) {
			return null;
		}
		var parentData = dm.getDataById(data.getParentId());
		var parentType = dm.getDataTypeForData(parentData);
		var parentCategory = dm.getCategoryForData(parentData);
		var parentNode = sm.getNodeByDataOrId(parentData);
		if (!parentCategory || parentCategory.getId().toLowerCase() != 'rack') { // 当父亲不为rack的不做处理
			return null;
		}

		var frameRack = this.frameRacks[parentData.getId()];
		if (!frameRack) {
			var fRack = this.rackMaps[parentType.getId()];
			if (!fRack) {
				fRack = this.createSpaceFrame(parentData);
			}
			if (fRack) {
				this.rackMaps[parentType.getId()] = fRack;
				frameRack = fRack.clonePrefab();
			}
		}
		if (!frameRack) {
			return null;
		} else {
			frameRack.setPosition(parentNode.getPosition());
			frameRack.setRotation(parentNode.getRotation());
			frameRack.setPositionY(parentNode.getPositionY());
			frameRack.setParent(parentNode.getParent());
			// frameRack.setClient("modelParent", parentNode);
			frameRack.setClient("frameParentNode", parentNode);
			if (!this.spaceManager) {
				this.spaceManager = new it.SpaceManager(dm, sm);
			}
			if (!this.frameRacks[parentData.getId()] && this.isCreateEmpNode()) {
				var space = this.spaceManager.computeSpace(parentData);
				var emptyArray = space.getEmptyList();
				emptyArray.forEach(function (object) {
					var emptyCube = null;
					var templateCube = self.templateEmptyNode[object.end - object.start + 1];
					if (!templateCube) {
						templateCube = self.createEmptyNode(frameRack, object.start, object.end);
						self.templateEmptyNode[object.end - object.start + 1] = templateCube;
					}
					emptyCube = templateCube.clonePrefab();
					if (emptyCube) {
						emptyCube.setParent(frameRack);
						var datatype = main.sceneManager.dataManager.getDataTypeForData(data);
						var emptyData = new it.Data();
						var newLoc = new it.Location({ x: 0, y: object.start, z: 0 });
						emptyData.setLocation(newLoc);
						emptyData.setDataTypeId(datatype.getId());
						sm.computePosition(emptyData, parentData, emptyCube, frameRack);
						fbb = frameRack.getBoundingBox().size();
						bb = emptyCube.getBoundingBox().size();
						var scaleX = fbb.x / bb.x, scaleZ = fbb.z / bb.z;
						if (scaleX != 1 || scaleZ != 1) {
							emptyCube.setScale(scaleX, 1, scaleZ);
						}
						self.dataBox.addByDescendant(emptyCube);
					}
				});
			}
			if (frameRack) {
				this.frameRacks[parentData.getId()] = frameRack;
				this.dataBox.addByDescendant(frameRack);
			}
		}
		var colorCube = null;
		if (!colorCube) {
			var dataTypeCube = this.devMaps[dataType.getId()];
			if (!dataTypeCube) {
				var dataTypeCube = this.createColorNode(data, frameRack, parentType);
				if (dataTypeCube) {
					this.devMaps[dataType.getId()] = dataTypeCube;
				}
			}
			if (dataTypeCube) {
				colorCube = dataTypeCube.clonePrefab();
			}
		}

		if (colorCube) {
			colorCube.setParent(frameRack);
			sm.computePosition(data, parentData, colorCube, frameRack);
			fbb = frameRack.getBoundingBox().size();
			bb = colorCube.getBoundingBox().size();
			var scaleX = fbb.x / bb.x, scaleZ = fbb.z / bb.z;
			if (scaleX != 1 || scaleZ != 1) {
				colorCube.setScale(scaleX, 1, scaleZ);
			}
			colorCube.setX(0);
			colorCube.setZ(0);
			this.dataBox.addByDescendant(colorCube);
		}
		return frameRack;
	},

	/**
	* 根据剩余空间的开始和结束U位创建空的设备位置对象
	*/
	createEmptyNode: function (parentNode, startU, endU) {
		var size = parentNode.getBoundingBox().size();
		var width = size.x, depth = size.z;
		var height = (endU - startU + 1) * make.Default.UNIT_HEIGHT - 1;
		var cube = new mono.Cube(width, height, depth);
		cube.s({
			'm.type': 'phong',
			'm.specularStrength': 50,
			'm.color': '#efefef',
			'm.ambient': '#efefef',
			'm.texture.image': './images/empty_wrap.jpg'

		});
		cube.setWrapMode('six-each');
		return cube;
	},

    /** 
     * 根据dataType创建可视化的“彩色方块(设备时)”
     * 注意：其长和宽应该根据机柜长和宽来确定的
     */
	//2018-1-15 彩色块不再根据node实际尺寸去创建，通过dateType计算出高度 避免首次点击node未加载得不到设备尺寸的问题
	createColorNode: function (data, frameRack, parentType) {
		var self = this;
		if (!data) {
			return null;
		}
		var sm = this.sceneManager;
		var dm = sm.dataManager;
		// var dataNode = sm.getNodeForDataOrId(data);
		var dataType = dm.getDataTypeForData(data);
		// if (!dataNode) {
		// 	var params = dataType.getModelParameters();
		// 	dataNode = sm.loadModel(dataType.getModel(), params, true, dataType.getId());
		// }
		// if (!dataNode) {
		// sm.loadModel(dataType.getModel(), params, true, dataType.getId(), function (obj) {
		// 	self.createSpaceNode(data);
		// })
		// 	return null;
		// }
		if (!dataType) return null;
		var size = dataType.getSize().ySize;
		// var boundingBox = dataNode.getBoundingBox();
		var parentBoundingBox = frameRack.getBoundingBox();
		// var bSize = boundingBox.size();
		var pSize = parentBoundingBox.size();
		// var width = bSize.x, height = bSize.y, depth = bSize.z;
		if (!pSize) return null;
		// if (pSize) {
		// 	width = pSize.x;
		// 	depth = pSize.z;
		// }
		var width = pSize.x, depth = pSize.z;
		var childrenSize = parentType.getChildrenSize();
		var yPadding = childrenSize.yPadding || [0, 0], ySize = childrenSize.ySize;
		var uHeight = (pSize.y - yPadding[0] - yPadding[1]) / ySize;
		var height = size * uHeight;
		// var colors=['#8A0808', '#088A08', '#B18904', '#6A0888','#088A85'];
		// var uHeight = dataType.getSize().ySize;
		// var color = colors[uHeight-1 < colors.length ? uHeight-1 : colors.length-1];
		var color = this.getColorByUHeight(size);
		var offset = 2;
		var cube = new mono.Cube(width, height - 1, depth);
		cube.setClient('spaceChildrenNode', true);
		cube.setClient(it.SceneManager.CLIENT_EXT_VISIBLE, 'true');
		cube.s({
			'm.color': color,
			'm.transparent': true,
			'm.opacity': 0.6
		});
		cube.setStyle('m.color', color);
		cube.setStyle('m.ambient', color);
		return cube;
	},

    /**
     * 创建“彩色的frame(机柜时)“
     */
	createSpaceFrame: function (data) {
		if (!data) {
			return null;
		}
		var sm = this.sceneManager;
		var dm = sm.dataManager;
		var dataNode = sm.getNodeForDataOrId(data);
		if (!dataNode) {
			return null;
		}
		var boundingBox = dataNode.getBoundingBox();
		var width = boundingBox.max.x - boundingBox.min.x;
		var height = boundingBox.max.y - boundingBox.min.y;
		var depth = boundingBox.max.z - boundingBox.min.z;
		var offset = 2;
		var frameCube = new mono.Cube(width - offset, height, depth);
		frameCube.setClient('spaceNode', true);
		frameCube.setClient(it.SceneManager.CLIENT_EXT_VISIBLE, 'true');
		frameCube.s({
			// 'm.visible':false,
			'm.wireframe': true,
			// 'm.wireframeLinewidth': 2,
			// 'm.wireframeLinecolor': '#f27418',
			'm.transparent': true,
			'm.opacity': 0.5,
		});
		if (!this.isCreateEmpNode()) {
			var cube = new mono.Cube(width - offset, height, depth);
			cube.setClient('spaceNode', true);
			cube.setClient(it.SceneManager.CLIENT_EXT_VISIBLE, 'true'); //由于自己没有dataid，因此为了避免父亲隐藏时也跟着隐藏
			var color = this.getSpaceNodeColor(); //'#5DBDE0';//this.getSpaceNodeColor(); //'#6FD772';
			cube.s({
				// 'm.wireframe': true,
				'm.transparent': true,
				'm.color': color,
				'm.opacity': 0.3,
			});
			cube.setStyle('m.color', color);
			cube.setStyle('m.ambient', color);
			cube.setStyle('m.type', 'phong');
			// cube.setParent(frameCube);
		} else {
			frameCube.setStyle('m.visible', false);
			frameCube.setStyle('m.wireframeLinewidth', 2);
			frameCube.setStyle('m.wireframeLinecolor', '#f27418');
		}
		return frameCube;
	},

	getSpaceNodeColor: function () {
		return '#5DBDE0';//'#FFC95A';// 绿:'#6FD772'; 红:'#Fd674F',蓝:'#5DBDE0',黄:'#FFC95A'
	},

});

it.USearchManager = $USearchManager;
