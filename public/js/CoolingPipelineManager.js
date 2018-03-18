

it.CoolingPipelineManager = function (sceneManager) {
	this.sceneManager = sceneManager;
	this.dataBox = this.sceneManager.network3d.getDataBox();
	this.pathNodeIns = []; //需要优化，创建过之后，第二次显示的时候不需要重新创建
	this.pathNodeOuts = [];
	this.pipleNodes = [];
	this.animates = [];
	this.inPathNodeMap = {}; //存储小管道的，以便clone 按照旋转角度来存储
	this.outPathNodeMap = {};//存储小管道的，以便clone 按照旋转角度来存储
	this.isShow = false;
	this.billboards = {};
	var self = this;
	this.coolingPipelines = null;
	this.visibleFilter = new it.VisibleManager(this.sceneManager);
	this.visibleFilter.isDealWithFunction = function (data) { //不处理floor和room
		// var category = self.sceneManager.dataManager.getCategoryForData(data);
		// if (category 
		// 	&& (category.getId().toLowerCase() == 'floor' 
		// 		|| category.getId().toLowerCase() == 'room')) {
		// 	return false;
		// }
		return true;
	};
	this.oldHandleDoubleClickElementFunction = this.sceneManager.viewManager3d.defaultEventHandler.handleDoubleClickElement;

	this.isAllInvisibleDataNeedLoad = 0;
	this.isAllInvisibleDataLoaded = 0;
};

mono.extend(it.CoolingPipelineManager, Object, {

	_createPipelines: function (callback) {
		var self = this;
		ServerUtil.api('cooling_pipeline', 'search', {}, function (coolingPipelines) {
			coolingPipelines.forEach(function (coolingPipeline) {
				var result = self._createPipeline(coolingPipeline);
				if (result) {
					self.pipleNodes.push(result);
				}
			});
			if (self.pipleNodes && self.pipleNodes.length == 1) { //只有一组管道时，直接lookAt过去
				self.sceneManager.viewManager3d.getDefaultEventHandler().moveCameraForLookAtNode(self.pipleNodes[0]);
			}
			callback&&callback();
		});

	},

	resetPath: function (path, radius, times) {
		radius = radius || this.radius;
		times = times || 1;
		var newPath = new mono.Path(),
			lastAction, lastArgs, action, args, nextAction, nextArgs, v1, v2, v3, v4 = new mono.Vec3(),
			v5 = new mono.Vec3(),
			angle, v6 = new mono.Vec3(),
			v7 = new mono.Vec3(),
			l;
		var i, length = path.actions.length;
		if (length > 5) {
			for (i = 0; i < 5; i++) {
				action = path.actions[i];
				nextAction = i + 1 === length ? null : path.actions[i + 1];
				args = action.args;
				if (action.action === 'moveTo') {
					newPath.moveTo(args[0], args[1], args[2]);
				} else if (action.action === 'lineTo') {
					if (nextAction && nextAction.action === 'lineTo') {
						lastAction = path.actions[i - 1];
						lastArgs = lastAction.args;
						nextArgs = nextAction.args;
						v1 = new mono.Vec3(lastArgs[0], lastArgs[1], lastArgs[2]);
						v2 = new mono.Vec3(args[0], args[1], args[2]);
						v3 = new mono.Vec3(nextArgs[0], nextArgs[1], nextArgs[2]);
						v4.subVectors(v2, v1);
						v5.subVectors(v2, v3);
						angle = v4.angleTo(v5);
						l = Math.min(v4.length() / 2, v5.length() / 2);
						l = Math.min(radius * times, l);
						v6.addVectors(v2, v4.normalize().multiplyScalar(-l));
						v7.addVectors(v2, v5.normalize().multiplyScalar(-l));
						newPath.lineTo(v6.x, v6.y, v6.z);
						newPath.curveTo(v2.x, v2.y, v2.z, v7.x, v7.y, v7.z);
					} else {
						newPath.lineTo(args[0], args[1], args[2]);
					}
				} else if (action.action === 'quadraticCurveTo') {
					newPath.curveTo(args[0], args[1], args[2], args[3], args[4], args[5]);
				}
			}
		}
		for (i = 5; i < length; i++) {
			action = path.actions[i];
			nextAction = i + 1 === length ? null : path.actions[i + 1];
			args = action.args;
			if (action.action === 'moveTo') {
				newPath.moveTo(args[0], args[1], args[2]);
			} else if (action.action === 'lineTo') {
				newPath.lineTo(args[0], args[1], args[2]);
			} else if (action.action === 'quadraticCurveTo') {
				newPath.curveTo(args[0], args[1], args[2], args[3], args[4], args[5]);
			}
		}
		return newPath;
	},

	/**
	 * 创建两个node之前的控制点
	 */
	generateControls: function (fromNode, toNode, option) {
		if (!fromNode || !toNode) {
			return null;
		}
		var bb1 = fromNode.getBoundingBox(),
			bb2 = toNode.getBoundingBox();
		var maxZ = 20,
			maxY = Math.max(bb1.max.y, bb2.max.y) + 20;
		var pos1 = fromNode.frontWorldPosition(bb1.max.z + maxZ),
			pos2 = toNode.frontWorldPosition(bb2.max.z + maxZ);
		var w_from = fromNode.frontWorldPosition(1);
		var w_to = toNode.frontWorldPosition(1);
		var org_from =fromNode.getWorldPosition();
		var org_to = toNode.getWorldPosition();
		var controls = [];
		if (option.offsetZ) {
			pos1.z += parseInt(option.offsetZ);
		}
		if (option.offsetY) {
			pos1.y += parseInt(option.offsetY);
			w_from.y += parseInt(option.offsetY);
		}
		if (option.offsetX) {
			pos1.x += parseInt(option.offsetX);
		}
		if (option.endOffsetZ) {
			pos2.z += parseInt(option.endOffsetZ);
		}
		if (option.endOffsetY) {
			pos2.y += parseInt(option.endOffsetY);
			w_to.y += parseInt(option.endOffsetY);
		}
		if (option.endOffsetX) {
			pos2.x += parseInt(option.endOffsetX);
		}
		controls.push(new mono.Vec3(org_from.x, org_from.y, org_from.z));
		controls.push(new mono.Vec3(w_from.x, w_from.y, w_from.z));
		controls.push(pos1);
		var w_min_y = Math.min(pos1.y, pos2.y);
		controls.push(new mono.Vec3(pos1.x, w_min_y, pos1.z));
		if (option && option.x) {
			controls.push(new mono.Vec3(pos2.x, w_min_y, pos1.z));
		} else {
			controls.push(new mono.Vec3(pos1.x, w_min_y, pos2.z));
		}
		controls.push(new mono.Vec3(pos2.x, w_min_y, pos2.z));
		controls.push(pos2);
		controls.push(new mono.Vec3(w_to.x, w_to.y, w_to.z));
		controls.push(new mono.Vec3(org_to.x, org_to.y, org_to.z));
		return controls;
	},

    /**
     * 创建两个对象间的连线
     */
	_createSimplePipeline: function (fromId, toId, pipelLine) {
		if (!fromId || !toId) {
			return null;
		}
		pipelLine = pipelLine || {};
		var option = pipelLine.option;
		var fromNode = this.sceneManager.getNodeByDataOrId(fromId);
		var toNode = this.sceneManager.getNodeByDataOrId(toId);
		if (!fromNode || !toNode) {
			return;
		}
		var controls = this.generateControls(fromNode, toNode, option);
		var path = new mono.Path();
		path.moveTo(controls[0].x, controls[0].y, controls[0].z);
		for (var i = 1; i < controls.length; i++) {
			path.lineTo(controls[i].x, controls[i].y, controls[i].z);
		}
		// var pathNode = new mono.PathNode({
		// 		path: path,
		// 		radius: 1,
		//    });
		var pathNode = new mono.PathNode(path, 100, 3, 100, 'plain', 'plain');
		if (option && option.outPiple) {
			pathNode.s({
				'm.type': 'phong',
				'm.ambient': '#Fd674F', //00aaaa
				'm.color': '#Fd674F',
				'm.texture.image': './images/pipeline/flow.jpg',
				'm.texture.repeat': new mono.Vec2(100, 1),
			});
		} else {
			pathNode.s({
				'm.type': 'phong',
				'm.ambient': '#00aaaa',
				'm.texture.image': './images/pipeline/flow.jpg',
				'm.texture.repeat': new mono.Vec2(100, 1),
			});
		}
		if (option.flow) {
			var animate = new mono.Animate({
				from: 0,
				to: 1,
				type: 'number',
				dur: 500,
				repeat: Number.POSITIVE_INFINITY,
				reverse: false,
				onUpdate: function (value) {
					pathNode.s({
						'm.texture.offset': new mono.Vec2(value * (-1), 0)
					});
				}
			});
			this.animates.push(animate);
			animate.play();
		}
		this.dataBox.add(pathNode);
		return pathNode;
	},

	_createInOutPiples: function (equipmentNode, rackNodes, option, isOut) {
		if (!equipmentNode || !rackNodes || rackNodes.length < 1) {
			return null
		}
		var path = new mono.Path();
		var ebb = equipmentNode.getBoundingBox();
		var eqipFrontPos = equipmentNode.frontWorldPosition(30);
		var eWP = equipmentNode.getWorldPosition();
		if (option) {
			if (option.offsetX) {
				eqipFrontPos.x += option.offsetX;
			}
			if (option.offsetY) {
				eqipFrontPos.y += option.offsetY;
			}
			if (option.offsetZ) {
				eqipFrontPos.z += option.offsetZ;
			}
		}
		var mainPathNode = null;
		if (isOut) {
			path.moveTo(eWP.x, eWP.y, eWP.z);
			path.lineTo(eWP.x, eqipFrontPos.y, eWP.z);
			path.lineTo(eWP.x, eqipFrontPos.y, eqipFrontPos.z);
			path.lineTo(eqipFrontPos.x, eqipFrontPos.y, eqipFrontPos.z);

			for (var i = 0; i < rackNodes.length; i++) {
				var rackNode = rackNodes[i];
				var pathNode1 = this._createSubLine(rackNode, true);
				this.dataBox.add(pathNode1);
				this.pathNodeOuts.push(pathNode1);
				if (i === 0) { // 计算设备到“第一个”细管之间的拐点
					var pOut = pathNode1._mainPoint;
					path.lineTo(eqipFrontPos.x, eqipFrontPos.y, pOut.z);
					path.lineTo(eqipFrontPos.x, pOut.y, pOut.z);
					path.lineTo(pOut.x, pOut.y, pOut.z);
				}
				path.lineTo(pathNode1._mainPoint.x, pathNode1._mainPoint.y, pathNode1._mainPoint.z);
			}
			// path = this.resetPath(path, 10, 1); // 计算比较慢，暂时去掉2010-10-27
			var mainPathNode = new mono.PathNode(path, 100, 3, 100, 'plain', 'plain');
			mainPathNode.s({
				'm.type': 'phong',
				'm.ambient': '#Fd674F', //00aaaa
				'm.color': '#Fd674F',
				'm.texture.image': './images/pipeline/flow.jpg',
				'm.texture.repeat': new mono.Vec2(100, 1),
			});
			this.dataBox.add(mainPathNode);
			this.pathNodeOuts.push(mainPathNode);
		} else {
			path.moveTo(eWP.x, eWP.y - 10, eWP.z);
			path.lineTo(eWP.x, eqipFrontPos.y-10, eWP.z);
			path.lineTo(eWP.x, eqipFrontPos.y-10, eqipFrontPos.z);
			path.lineTo(eqipFrontPos.x, eqipFrontPos.y - 10, eqipFrontPos.z);
			for (var i = 0; i < rackNodes.length; i++) {
				var rackNode = rackNodes[i];
				var pathNode2 = this._createSubLine(rackNode, false);
				var pIn = pathNode2._mainPoint;
				this.dataBox.add(pathNode2);
				this.pathNodeIns.push(pathNode2);
				if (i === 0) { // 计算设备到“第一个”细管之间的拐点
					path.lineTo(eqipFrontPos.x, eqipFrontPos.y - 10, pIn.z);
					path.lineTo(eqipFrontPos.x, pIn.y, pIn.z);
					path.lineTo(pIn.x, pIn.y, pIn.z);
				}
				path.lineTo(pathNode2._mainPoint.x, pathNode2._mainPoint.y, pathNode2._mainPoint.z);
			}
			// pathIn = this.resetPath(path, 10, 1); // 计算比较慢，暂时去掉2010-10-27
			var mainPathNode = new mono.PathNode(path, 100, 3, 100, 'plain', 'plain');
			mainPathNode.s({
				'm.type': 'phong',
				'm.ambient': '#00aaaa',
				// 'm.color':'#00aaaa',
				'm.texture.image': './images/pipeline/flow.jpg',
				'm.texture.repeat': new mono.Vec2(100, 1),
			});
			this.dataBox.add(mainPathNode);
			this.pathNodeIns.push(mainPathNode);
		}

		var animate = new mono.Animate({
			from: 0,
			to: 1,
			type: 'number',
			dur: 500,
			repeat: Number.POSITIVE_INFINITY,
			reverse: false,
			onUpdate: function (value) {
				if (isOut) {
					mainPathNode.s({
						'm.texture.offset': new mono.Vec2(value, 0)
					});
				} else {
					mainPathNode.s({
						'm.texture.offset': new mono.Vec2(value * (-1), 0)
					});
				}
			}
		});
		this.animates.push(animate);
		animate.play();
		return mainPathNode;
	},

    /**
     * 创建管道
     * 如果toId有多个的话，就是背板的那种（有进有出的一对线）
     * 如果toId只有一个的话，则只创建一条线
     */
	_createPipeline: function (coolingPipeline) {
		var equipmentId = coolingPipeline.cooling_equipment_id,
			rackIds = coolingPipeline.data_ids;
		var self = this;
		if (!equipmentId || !this.sceneManager.isCurrentSceneInstance(equipmentId)) {
			return;
		}
		var rackNodes = [];
		var equipmentNode = this.sceneManager.getNodeByDataOrId(equipmentId);
		this.visibleFilter.setVisible(this.sceneManager.dataManager.getDataById(equipmentId), true, false);
		rackIds.forEach(function (rackId) {
			rackNodes.push(self.sceneManager.getNodeByDataOrId(rackId));
			self.visibleFilter.setVisible(self.sceneManager.dataManager.getDataById(rackId), true, false);
		});
		var eb = this.billboards[equipmentId]
		if (!eb) {
			eb = this._createBillboard(equipmentId);
			if (eb) {
				this.billboards[equipmentId] = eb;
			}
		}
		if (eb) {
			this.dataBox.add(eb);
		}
		var option = coolingPipeline.option;
		if (rackNodes && rackNodes.length == 1 && rackNodes[0]) {
			var data = this.sceneManager.getNodeData(rackNodes[0]);
			var dataB = this.billboards[data.getId()];
			if (!dataB) {
				dataB = this._createBillboard(data);
				if (dataB) {
					this.billboards[data.getId()] = dataB;
				}
			}
			if (dataB) {
				this.dataBox.add(dataB);
			}
			return this._createSimplePipeline(equipmentId, data.getId(), coolingPipeline);
		}
		if (option && option.inPiple) {
			return this._createInOutPiples(equipmentNode, rackNodes, option, false);
		} else if (option && option.outPiple) {
			return this._createInOutPiples(equipmentNode, rackNodes, option, true);
		}
	},

	getSubLinePoints : function(rackNode,forOut){
		var bb = rackNode.getBoundingBox();
		var y1 = forOut ? (bb.max.y - 20) : (bb.min.y + 20),
			y2 = forOut ? bb.max.y + 40 : bb.min.y + 3;
		var p1 = rackNode.worldPosition(new mono.Vec3(0, y1, bb.min.z));
		var p2 = rackNode.worldPosition(new mono.Vec3(0, y1, bb.min.z - 30));
		var p3 = rackNode.worldPosition(new mono.Vec3(0, y2, bb.min.z - 30));
		return [p1,p2,p3];
	},

	_createSubLine: function (rackNode, forOut) {
		var bb = rackNode.getBoundingBox();
		// var y1 = forOut ? (bb.max.y - 20) : (bb.min.y + 20),
		// 	y2 = forOut ? bb.max.y + 40 : bb.min.y + 3;
		// var p1 = rackNode.worldPosition(new mono.Vec3(0, y1, bb.min.z));
		// var p2 = rackNode.worldPosition(new mono.Vec3(0, y1, bb.min.z - 30));
		// var p3 = rackNode.worldPosition(new mono.Vec3(0, y2, bb.min.z - 30));
		var ponits = this.getSubLinePoints(rackNode,forOut);
		var p1 = ponits[0];
		var p2 = ponits[1];
		var p3 = ponits[2];

		var node = null;
		var rackRot = rackNode.getRotation();
		var rotateKey = 'x:' + rackRot.x + 'y:' + rackRot.y + 'z:' + rackRot.z;
		if (forOut && this.outPathNodeMap[rotateKey]) {
			node = this.outPathNodeMap[rotateKey].clonePrefab();
			var oPosition = this.outPathNodeMap[rotateKey].oPosition;
			var rwp = rackNode.getWorldPosition();
			node.setX(node.getX() + (rwp.x - oPosition.x));
			node.setY(node.getY() + (rwp.y - oPosition.y));
			node.setZ(node.getZ() + (rwp.z - oPosition.z));
		} else if (!forOut && this.inPathNodeMap[rotateKey]) {
			node = this.inPathNodeMap[rotateKey].clonePrefab();
			var oPosition = this.inPathNodeMap[rotateKey].oPosition;
			var rwp = rackNode.getWorldPosition();
			node.setX(node.getX() + (rwp.x - oPosition.x));
			node.setY(node.getY() + (rwp.y - oPosition.y));
			node.setZ(node.getZ() + (rwp.z - oPosition.z));
		} else {
			var path = new mono.Path();
			path.moveTo(p1.x, p1.y, p1.z);
			path.lineTo(p2.x, p2.y, p2.z);
			path.lineTo(p3.x, p3.y, p3.z);
			// path = mono.PathNode.prototype.adjustPath(path, 5, 1); // 计算比较慢，暂时去掉2010-10-27
			node = new mono.PathNode({
				path: path,
				radius: 1,
			});
			if (forOut) {
				node.s({
					'm.type': 'phong',
					'm.ambient': '#Fd674F',
					'm.color': '#Fd674F',
					'm.texture.image': './images/pipeline/flow.jpg',
					'm.texture.repeat': new mono.Vec2(100, 10),
				});
				this.outPathNode = node;
				this.outPathNode.oPosition = rackNode.getWorldPosition();
				this.outPathNode.oRotation = rackNode.getRotation();
			} else {
				node.s({
					'm.type': 'phong',
					'm.ambient': '#00aaaa',
					// 'm.color': '#00aaaa',
					'm.texture.image': './images/pipeline/flow.jpg',
					'm.texture.repeat': new mono.Vec2(100, 10),
				});
				this.inPathNodeMap[rotateKey] = node;
				this.inPathNodeMap[rotateKey].oPosition = rackNode.getWorldPosition();
			}

		}
		node._mainPoint = p3;
		return node;
	},

	_createBillboard: function (dataOrId) {
		if (!dataOrId) {
			return null;
		}
		var data = null;
		if (dataOrId instanceof it.Data) {
			data = dataOrId;
		} else {
			data = this.sceneManager.dataManager.getDataById(dataOrId);
		}
		if (!data) {
			return null;
		}
		var node = this.sceneManager.getNodeByDataOrId(data.getId());
		if (!node) {
			return null;
		}
		var position = node.getWorldPosition();
		var dy = 0;
		var bd = node.getBoundingBox();
		if (bd && bd.max && bd.max.y) {
			dy = bd.max.y;
		}
		var text = data.getName() || data.getDescription() || data.getId();
		var billboard = it.Util.createTextBillboard(text, 'orange');
		billboard.setPosition(new mono.Vec3(position.x, position.y + dy, position.z));
		// var scale = billboard.getScale();
		// var oScale = options.scale;
		// if (oScale && oScale.length >= 2) {
		// 	billboard.setScale(scale.x * oScale[0], scale.y * oScale[1], 1);
		// }
		return billboard;
	},

	loadCurrentInvisibleDatas: function (categoryId, visible, callback, scope) {
		if (!categoryId) {
			return;
		}
		var category = this.dataManager._categoryMap[categoryId];
		if (!category || category.isVisible()) {
			return;
		}
		var datas = this.dataManager.getDataMapByCategory(categoryId);
		if (!datas) {
			return;
		}
		// this.viewManager3d.addVisibleFilter(this.invisibleFilter);
		for (var id in datas) {
			var data = datas[id];
			// this.invisibleFilter.setVisible(data,visible);
			if (!this.dataNodeMap[id]
				&& this.isCurrentSceneInstance(data)) { //如果是当前场景中的data，并且没有load过，这里就load一下
				scope.isAllInvisibleDataNeedLoad++;
				this.loadOneData(data, true, callback);
			}
		}
	},

	loadAllCurrentInvisibleDatas: function (callback) {
		// this.viewManager3d.removeVisibleFilter(this.invisibleFilter); // 有可能还没有加载咧
		var categoryMap = this.sceneManager.dataManager._categoryMap;
		if (!categoryMap) {
			return false;
		}
		for (var id in categoryMap) {
			this.loadCurrentInvisibleDatas.call(this.sceneManager, id, true, callback, this);
		}
		if(this.isAllInvisibleDataLoaded == this.isAllInvisibleDataNeedLoad){
			callback&&callback();
		}
	},

	showCoolingPipeline: function () {
		var self = this;
		var flag = true;

		var callback =  function(){
			// console.log(this);
			if(this.isAllInvisibleDataLoaded != this.isAllInvisibleDataNeedLoad){
				this.isAllInvisibleDataLoaded++;
			}
			if((this.isAllInvisibleDataLoaded == this.isAllInvisibleDataNeedLoad)&&flag){
				// console.log('test');
				flag = false;
				this._createPipelines( function(){
					self.sceneManager.showAllInvisibleData();
				});
				this.sceneManager.viewManager3d.defaultEventHandler.handleDoubleClickElement = function (node, network, data, clickedObj) {
					self.sceneManager.viewManager3d.defaultEventHandler.moveCameraForLookAtNode(node);
				}
				this.isShow = true;
			}
		}

		this.loadAllCurrentInvisibleDatas(callback.bind(this));
		this.visibleFilter.clear();
		this.sceneManager.viewManager3d.addVisibleFilter(this.visibleFilter);
		var rootData = this.sceneManager._currentRootData
			|| this.sceneManager.getNodeData(this.sceneManager.getCurrentRootNode());
		this.visibleFilter.setVisibleByDescendant(rootData, false, false)
	},

	hideCoolingPipeline: function () {
		this.isShow = false;
		this.sceneManager.invisibleAllInvisibleData();
		this.sceneManager.viewManager3d.removeVisibleFilter(this.visibleFilter);
		if (this.animates && this.animates.length > 0) {
			for (var i = 0; i < this.animates.length; i++) {
				var animate = this.animates[i];
				animate.stop();
			}
			this.animates = [];
		}
		if (this.pathNodeIns && this.pathNodeIns.length > 0) {
			for (var i = 0; i < this.pathNodeIns.length; i++) {
				var pathIn = this.pathNodeIns[i];
				this.dataBox.remove(pathIn);
			}
			this.pathNodeIns = [];
		}
		if (this.pathNodeOuts && this.pathNodeOuts.length > 0) {
			for (var i = 0; i < this.pathNodeOuts.length; i++) {
				var pathOut = this.pathNodeOuts[i];
				this.dataBox.remove(pathOut);
			}
			this.pathNodeOuts = [];
		}
		if (this.pipleNodes && this.pipleNodes.length > 0) {
			for (var i = 0; i < this.pipleNodes.length; i++) {
				var piple = this.pipleNodes[i];
				this.dataBox.remove(piple);
			}
			this.pipleNodes = [];
		}
		if (this.billboards) {
			for (var id in this.billboards) {
				var bb = this.billboards[id];
				if (bb) {
					this.dataBox.remove(bb);
				}
			}
		}

		this.sceneManager.viewManager3d.defaultEventHandler.handleDoubleClickElement = this.oldHandleDoubleClickElementFunction;
	},

});

