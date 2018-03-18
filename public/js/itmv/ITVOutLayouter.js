
/**
 * 自动布局某个layer上的配置项
 */
var $ITVOutLayouter = function (itvManager) {
	this.itvManager = itvManager;
	this.itvDataManager = this.itvManager.itvDataManager;
	this.box = new twaver.ElementBox();
	this._nodeMap = {};
	this._linkMap = {};
	this.autoLayouter = new twaver.layout.AutoLayouter(this.box);
	this.autoLayoutPanelInit = false;
	this.layoutTypes = ['round', 'symmetry', 'topbottom', 'bottomtop', 'leftright', 'rightleft', 'hierarchic'];
	this.init();
};

mono.extend($ITVOutLayouter, Object, {

	init: function () {
		// this.autoLayouter.setAnimate(false); //自动布局时，不执行twaver内部的动画。如需要动画，在3D中需要重新弄
		// this.autoLayouter.setRepulsion(2);
		if (!this.autoLayoutPanelInit) {
			this.autoLayoutPanelInit = true;
			this.createAutoLayoutPanel();
		}
	},

    /**
     * 根据层ID自动布局该层上的配置项
     * @layerId 层ID
     * @layoutType 布局的类型：['round', 'symmetry', 'topbottom', 'bottomtop', 'leftright', 'rightleft', 'hierarchic']
     */
	doLayout: function (layerId, layoutType, isAnimate) {
		if (layerId) { //如果传了id那就重新创建配置项，不传的话就对上次的layer进行重新布局，有可能在同一个层上进行多次布局这样节省重新创建的时间
			this.clear();
			var layer = this.itvDataManager.getLayerById(layerId);
			if (!layer || !layer.getConfigItem() || layer.getConfigItem().size() < 1) {
				return;
			}
			var configItemLayers = layer.getConfigItem();
			for (var k = 0; k < configItemLayers.size(); k++) {
				var configItemLayer = configItemLayers.get(k);
				var node = this.createNodeByCI(configItemLayer);
				if (node) {
					this.box.add(node);
					this._nodeMap[configItemLayer.getConfigItemId()] = node;
				}
			}
			var relations = layer.getRelations();
			for (var r = 0; r < relations.size(); r++) {
				var relation = relations.get(r);
				if (!relation._calculate) {
					var line = this.itvManager.relationManager._lineMap[relation.getId()];
					if (line) {
						line.setParent(null);
						this.itvManager.dataBox.removeByDescendant(line);
						delete this.itvDataManager._relationMap[relation.getId()];
						delete this.itvManager.relationManager._lineMap[relation.getId()];
					}
					continue;
				};
				var fromNode = this._nodeMap[relation.getFromId()];
				var toNode = this._nodeMap[relation.getToId()];
				var link = this.createLink(fromNode, toNode);
				if (link) {
					this.box.add(link);
					this._linkMap[relation.getId()] = relation;
				};
			}
		}
		var self = this;
		var afterLayoutFunction = function () {
			if (isAnimate) {
				self.doAnimate();
			} else {
				self.resetCIPositionAndRelation();
			}
		};
		this.autoLayouter.doLayout(layoutType, afterLayoutFunction);
	},

	// doLayoutWithout

	clear: function () {
		this.box.clear();
		this._nodeMap = {};
		this._linkMap = {};
		// this.autoLayoutPanel.hide();
	},
	clearPanel: function () {
		this.autoLayoutPanel.hide();
	},
    /**
     * 根据配置项创建twaver.Node
     */
	createNodeByCI: function (configItemLayer) {
		if (!configItemLayer) {
			return null;
		}
		var node = new twaver.Node();
		node.setName(configItemLayer.getConfigItemId());
		return node;
	},

	createLink: function (fromNode, toNode) {
		var link = new twaver.Link(fromNode, toNode);
		return link;
	},

    /**
     * 已动画的形式改变配置项的位置至新的位置
     */
	doAnimate: function () {

	},

    /**
     * 获取布局后所有网元的所在范围
     */
	getBoundingBoxAfterLayout: function () {
		var minX = null, minY = null, maxX = null, maxY = null;
		for (var id in this._nodeMap) {
			var node = this._nodeMap[id];
			var location = node.getLocation();
			if (minX == null || minX > location.x) {
				minX = location.x;
			}
			if (minY == null || minY > location.y) {
				minY = location.y;
			}
			if (maxX == null || maxX < location.x) {
				maxX = location.x;
			}
			if (maxY == null || maxY < location.y) {
				maxY = location.y;
			}
		}
		return { min: { x: minX, y: minY }, max: { x: maxX, y: maxY } };
	},

    /**
     * 直接将配置项的位置设置成新的位置
     */
	resetCIPositionAndRelation: function () {
		var self = this;
		var scaleX = 1,
			scaleY = 1;
		var offset = { x: 500, z: 400 };
		var bb = this.getBoundingBoxAfterLayout();
		if (bb) {
			var layerBB = this.itvManager._layerNodeMap['layer01'].getBoundingBox();
			scaleX = (bb.max.x - bb.min.x) == 0 ? 1 : (layerBB.size().x - offset.x) / (bb.max.x - bb.min.x);
			scaleY = (bb.max.y - bb.min.y) == 0 ? 1 : (layerBB.size().z - offset.z) / (bb.max.y - bb.min.y);
		}
		var updateMap = [];
		for (var id in this._nodeMap) {
			var node = this._nodeMap[id];
			var location2D = node.getLocation();
			var configItemNode3D = this.itvManager._configItemNodeMap[id];
			if (configItemNode3D) {
				var newX = scaleX * (location2D.x - (bb.max.x - bb.min.x) / 2 - bb.min.x);
				var newY = scaleY * (location2D.y - (bb.max.y - bb.min.y) / 2 - bb.min.y);
				configItemNode3D.setPositionX(newX);
				configItemNode3D.setPositionZ(newY);
				var data = {
					'options': {
						'config_item_id': id
					},
					'value': {
						'position': { 'x': newX, 'y': 0, 'z': newY }
					}
				}
				updateMap.push(data);
				this.itvDataManager._configItemLayers[id][0].setPosition(new mono.Vec3(newX, 0, newY));
			}
			// 跟它有关的跨楼层的line的位置的计算
			var pos = configItemNode3D.getWorldPosition();
			var cibb = configItemNode3D.getBoundingBox() || { min: { y: 0 }, max: { y: 0 } };
			var configItem = this.itvManager.itvDataManager._configItemMap[id];
			var configItemArr = [configItem].concat(configItem.getDescendants());
			configItemArr.forEach(function (item, index) {
				var itemId = item.getId();
				var itemPos = item.getPosition();
				var newPos = {
					x: pos.x + itemPos.x,
					y: pos.y + itemPos.y,
					z: pos.z + itemPos.z,
				}
				if (index > 0 && configItemNode3D.getClient('_isExtend')) {
					newPos = pos;
				}
				var itemNode = self.itvManager._configItemNodeMap[itemId];
				var itemNodebb = itemNode.getBoundingBox() || { min: { y: 0 }, max: { y: 0 } };
				var crossLayerLineObj = self.itvManager.relationManager._relConfigItemMap[itemId];
				if (crossLayerLineObj) {
					var fromRels = crossLayerLineObj.fromDatas;
					var toRels = crossLayerLineObj.toDatas;
					if (fromRels && fromRels.length > 0) {
						for (var i = 0; i < fromRels.length; i++) {
							var rRel = fromRels[i];
							var fNode = self.itvManager._configItemNodeMap[rRel.getFromId()];
							if (!fNode) return;
							var lineNode = self.itvManager.relationManager._lineMap[rRel.getId()];
							if (!lineNode) return;
							var fWp = fNode.getWorldPosition();
							var fbb = fNode.getBoundingBox() || { min: { y: 0 }, max: { y: 0 } };
							var startPos = new mono.Vec3(fWp.x, fWp.y < newPos.y ? fWp.y - fbb.max.y : fWp.y + fbb.min.y, fWp.z);
							var endPos = new mono.Vec3(newPos.x, fWp.y < newPos.y ? newPos.y + itemNodebb.min.y : newPos.y - itemNodebb.max.y, newPos.z);
							if (lineNode.setPoints) {
								lineNode.setPoints([startPos, newPos]);
							} else if (lineNode.setPath) {
								var path = self.itvManager.relationManager.getCrossLayerPathByStartPosAndEndPos(startPos, endPos);
								lineNode.setPath(path);
							}
						}
					}
					if (toRels && toRels.length > 0) {
						for (var k = 0; k < toRels.length; k++) {
							var tRel = toRels[k];
							var tNode = self.itvManager._configItemNodeMap[tRel.getToId()];
							if (!tNode) return;
							if (tNode.getParent() && tNode.getParent().getClient('_isExtend')) {
								tNode = tNode.getParent();
							}
							var tWp = tNode.getWorldPosition();
							var tbb = tNode.getBoundingBox() || { min: { y: 0 }, max: { y: 0 } };
							var startPos = new mono.Vec3(newPos.x, tWp.y > newPos.y ? newPos.y + itemNodebb.max.y : newPos.y + itemNodebb.min.y, newPos.z);
							var endPos = new mono.Vec3(tWp.x, tWp.y > newPos.y ? tWp.y + tbb.min.y : tWp.y + tbb.max.y, tWp.z);
							var lineNode = self.itvManager.relationManager._lineMap[tRel.getId()];
							if (lineNode) {
								if (lineNode.setPoints) {
									lineNode.setPoints([newPos, tNode.getWorldPosition()]);
								} else if (lineNode.setPath) {
									var path = self.itvManager.relationManager.getCrossLayerPathByStartPosAndEndPos(startPos, endPos);
									lineNode.setPath(path);
								}
							}
						}
					}
				}
			})
		}
		if (updateMap.length > 0) {
			//暂不存入数据库
			// it.util.api('it_config_item_layer', 'batchUpdate', updateMap, function () {});
		}
		for (var rId in this._linkMap) {
			var relation = this.itvDataManager._relationMap[rId];
			var fromNode = this.itvManager._configItemNodeMap[relation.getFromId()];
			var toNode = this.itvManager._configItemNodeMap[relation.getToId()];
			var lineNode = this.itvManager.relationManager._lineMap[rId];
			if (lineNode instanceof mono.LineX) {
				var points = lineNode.getPoints();
				var y = points[0].y;
				var fPos = new mono.Vec3(fromNode.getWorldPosition().x, y, fromNode.getWorldPosition().z);
				var tPos = new mono.Vec3(toNode.getWorldPosition().x, y, toNode.getWorldPosition().z);
				var control = this.itvManager.relationManager.getControlsByFromPosAndToPos(fPos, tPos);
				lineNode.setPoints(control);
			} else {
				// var path = this.itvManager.relationManager.getPathByFromPosAndToPos(fromNode.getWorldPosition(), toNode.getWorldPosition(),isRotation);
				var path = this.itvManager.relationManager.getPathByFromPosAndToPos(fromNode.getPosition(), toNode.getPosition());// 用相对坐标就可以了，免得旋转有问题
				lineNode.setPath(path);
			}

		}
	},

	createAutoLayoutPanel: function () {
		var self = this;
		var box = this.autoLayoutPanel = $('<div>').appendTo($('.view-control')).addClass('itv_layout_box').hide();
		var header = $('<div>').appendTo(box).addClass('itv_layout_header').text(it.util.i18n("itv_autoLayout"));
		var content = $('<div>').appendTo(box).addClass('itv_layout_content');
		this.layoutTypes.forEach(function (item) {
			var row = $('<div>').appendTo(content).addClass('itv_layout_row');
			var radio_outer = $('<span>').appendTo(row).addClass('itv_layout_radio_outer');
			var radio_inner = $('<span>').appendTo(radio_outer).addClass('itv_layout_radio_inner');
			var txt = $('<span>').appendTo(row).addClass('itv_layout_txt').text(item);
			row.click(function (e) {
				// $(this).siblings().find('.itv_layout_radio_outer').removeClass('active');
				// $(this).find('.itv_layout_radio_outer').toggleClass('active');
				$('.itv_layout_radio_outer').removeClass('active');
				$(this).find('.itv_layout_radio_outer').toggleClass('active');
				var type = $(this).find('.itv_layout_txt').text();
				self.doLayout(self.itvManager._itvHandler.currentLayerId, type);
			})
		})
	},
	toggleAutoLayoutPanel: function () {
		this.autoLayoutPanel.toggle();
	}
});

it.ITVOutLayouter = $ITVOutLayouter;

