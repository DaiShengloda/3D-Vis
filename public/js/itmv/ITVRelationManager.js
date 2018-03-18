
var $ITVRelationManager = function(itvManager){
	this.itvManager = itvManager;
	this.itvDataManager = this.itvManager.itvDataManager;
	this.sceneManager = this.itvManager.sceneManager;
	this.dataBox = this.sceneManager.network3d.dataBox;
	this._lineMap = {};
	this.linePointMap = {}; //连线上离子的缓存
	this.circleTime = 5000;  //动画在线上的运行时长
	this.nowTime = 0;	//用于计算动画时间间隔
	this.pointPercent = 0;	//粒子在线上允许的百分比位置
	this.verticeCount = 150; //粒子的顶点数
	this.pointLength = 100; //粒子的长度
	this.pointSize = 2;
	this._crossLayerLineMap = {}; // 存储跨layer的line
	this.relationChangeListener = this._relationChangeHadle;
};

mono.extend($ITVRelationManager,Object,{
	
	init : function(){
		this.resetLinkTree();
		this.itvDataManager.addDataManagerChangeListener(this.relationChangeListener,this);
	},

	/**
	 * 从box中清除line
	 */
	clear : function(){
		this.itvDataManager.removeDataManagerChangeListener(this.relationChangeListener,this);
		for(var p in this.linePointMap){
			var smoke = this.linePointMap[p];
			this.dataBox.remove(smoke);
		}
		for(var rId in this._lineMap){
			var line = this._lineMap[rId];
			this.dataBox.remove(line);
		}
		this.pointAnimate = false;
	},

	_relationChangeHadle : function(e){
		if (e && (e.type == 'addRelation' || e.type == 'removeRelation')) {
			this.resetLinkTree();
		}
	},
    
    /**
     * 根据relation和id显示line
     */
	showRelationByDataOrId : function(relationOrId,onlyTheSameLayer){
		if (!relationOrId) {
			return null;
		}
		var relation = relationOrId;
		if (typeof(relationOrId) === 'string') {
			relation = this.itvDataManager._relationMap[relationOrId];
		}
		if (!relation) {
			return null;
		}
		var fromId = relation.getFromId();
		var toId = relation.getToId();
		var fromConfigItemLayers = this.itvDataManager.getConfigItemLayerByConfigItemId(fromId);
		var toConfigItemLayers = this.itvDataManager.getConfigItemLayerByConfigItemId(toId);
		if (!fromConfigItemLayers 
			|| fromConfigItemLayers.length < 1 
			|| !toConfigItemLayers 
			|| toConfigItemLayers.length < 1) {
			return null;
		}
		var fromCil = fromConfigItemLayers[0];
		var toCil = toConfigItemLayers[0];
		if (!fromCil || !toCil) {
			return null;
		}
		var fromLayer = this.itvDataManager._layerMap[fromCil.getLayerId()];
		var toLayer = this.itvDataManager._layerMap[toCil.getLayerId()];
		if (onlyTheSameLayer && fromCil.getLayerId() != toCil.getLayerId()) { // 同一个layer上的配置项
			return ;
		}
		var line = this._lineMap[relation.getId()];
		if (!line) {
			line = this.createLine(relation);
			line.setClient('itv_relation',relation);
			this._lineMap[relation.getId()] = line;
		}
		if (line) {
			var smoke = this.linePointMap[relation.getId()];
			if(!smoke){
				smoke = this.createSmoke(line, '#FFFFFF', 1);
				smoke.setClient('itv_relation',relation);
				this.linePointMap[relation.getId()] = smoke;
				if(!this._crossLayerLineMap[relation.getId()]){
					smoke.setParent(line);
				}
			}
			this.dataBox.add(smoke);
			this.dataBox.add(line);
		}
		this.clearRelationVirtual(relation);
	},

	showAllCrossLayerLine : function(){
		for(var id in this._crossLayerLineMap){
			var line = this._crossLayerLineMap[id];
			this.showRelationByDataOrId(line);
		}
	},

    /**
     * 清除所有跨layer(也就是layer与layer之间)的lines
     */
	clearLinksBetweenDifferentLayer : function(){
		for(var id in this._crossLayerLineMap){
			// var line = this._crossLayerLineMap[id];
			var lineNode = this._lineMap[id];
			this.dataBox.remove(lineNode);
		}
	},

    /**
     *
     * 显示经过该配置项的所有有关联的relation
     * 注意：A-B，B-C，C-D，当点击A、B、C、D的任何一个点显示relation时都会将这三条线都显示出来
     */
	showTotalRelationByConfigItem : function(configItem){
		if (!configItem) {
			return ;
		}
		// this.clearLinksBetweenDifferentLayer(); // 显示时某些link时不去清除其他的link
		var relationUp = this.showLinksByDataId(configItem.getId(),true); //向上的linkss
		var relationDown = this.showLinksByDataId(configItem.getId()); //向下的links
		return (relationUp||[]).concat(relationDown);
	},


    /**
     *  计算lineTree时，是否考虑这两个配置项之间的line
     * 默认的是，只处理不是跨layer的line
     */
	_isAddToTree : function(fromId,toId){
		return !this.itvDataManager.isSameLayer(fromId,toId);
	},

	resetLinkTree: function() {
		var rMap = this.itvDataManager._relationMap;
		this._relConfigItemMap = {};
		this._crossLayerLineMap = {};
		for (var id in rMap) {
			var relation = rMap[id];
			var fId = relation.getFromId();
			var tId = relation.getToId();
			if (!this._isAddToTree(fId,tId)) {
				continue;
			}
			this._crossLayerLineMap[id] = relation;
			if (fId && this._relConfigItemMap[fId]) {
				var objs = this._relConfigItemMap[fId];
				if (!objs.toDatas) {
					objs.toDatas = [relation];
				} else {
					objs.toDatas.push(relation);
				}
			} else {
				this._relConfigItemMap[fId] = {
					toDatas: [relation],
					fromDatas: []
				};
			}
			if (tId && this._relConfigItemMap[tId]) {
				var objs = this._relConfigItemMap[tId];
				if (!objs.toDatas) {
					objs.fromDatas = [relation];
				} else {
					objs.fromDatas.push(relation);
				}
			} else {
				this._relConfigItemMap[tId] = {
					fromDatas: [relation],
					toDatas: []
				};
			}
		}
	},

	clearConfigItemVirtual : function(configItemId){
		this.itvManager._itvHandler.materialFilter.removeConfigItem(configItemId);
	},

	clearRelationVirtual : function(relationOrId){
		if(!relationOrId){
			return ;
		}
		var rId = relationOrId;
		if (relationOrId instanceof it.ITVRelation) {
			rId = relationOrId.getId();
		}
		this.itvManager._itvHandler.materialFilter.removeRelation(rId);
	},

    /**
     *
     * 根据id显示向上/下的整条links
     * @configItemId 配置项的id
     * @isUp 是不是向上，true是向上，否则是向下
     */
	showLinksByDataId: function(configItemId, isUp, scope) {
		scope = scope || this;
		var result = [];
		if (!scope._relConfigItemMap 
			|| !scope._relConfigItemMap[configItemId]) {
			return;
		}
		scope.clearConfigItemVirtual(configItemId);
		var relObj = scope._relConfigItemMap[configItemId];
		if (isUp) {
			if (relObj.fromDatas && relObj.fromDatas.length > 0) {
				for (var i = 0; i < relObj.fromDatas.length; i++) {
					var relation = relObj.fromDatas[i];
					scope.showRelationByDataOrId(relation);
					var fromId = relation.getFromId();
					result.push(fromId);
					result = result.concat(scope.showLinksByDataId(fromId,isUp,scope));
				}
			}
		} else {
			if (relObj.toDatas && relObj.toDatas.length > 0) {
				for (var i = 0; i < relObj.toDatas.length; i++) {
					var relation = relObj.toDatas[i];
					scope.showRelationByDataOrId(relation);
					var toId = relation.getToId();
					result.push(toId);
					result = result.concat(scope.showLinksByDataId(toId,isUp,scope));
				}
			}
		}
		return result;
	},
    
    /**
     *
     * 创建连线
     * @relation 关系
     * @onlyTheSameLayer 是不是只显示同一层的连线，默认是false
     *
     */
	createLine : function(relation){
		if (!relation) {
			return null;
		}
		var self = this;
		var fromId = relation.getFromId();
		var toId = relation.getToId();
		var color = '#00f6ff';
		var relationType = this.itvDataManager._relationTypeMap[relation.getTypeId()];
		if (relationType) {
			var parameters = relationType.getParameters();
			if (parameters && parameters.color) {
				color = parameters.color;
			}
		}
		// 位置不通过node来计算，通过node的话，需要node创建好才行，node有可能是obj模型
		var fromConfigItemLayers = this.itvDataManager.getConfigItemLayerByConfigItemId(fromId);
		var toConfigItemLayers = this.itvDataManager.getConfigItemLayerByConfigItemId(toId);
		if (!fromConfigItemLayers 
			|| fromConfigItemLayers.length < 1 
			|| !toConfigItemLayers 
			|| toConfigItemLayers.length < 1) {
			return null;
		}
		var control = [];
		var fromCil = fromConfigItemLayers[0];
		var toCil = toConfigItemLayers[0];
		if (!fromCil || !toCil) {
			return null;
		}
		var fromItemPos = new mono.Vec3();
		var toItemPos = new mono.Vec3();
		if(fromCil.getPosition()){
			fromItemPos.copy(fromCil.getPosition());
		}
		if(toCil.getPosition()){
			toItemPos.copy(toCil.getPosition());
		}
		// 如果是孩子 位置计算加上孩子的相对位置
		// if(fromCil.getConfigItemId()!=fromId){
		// 	var relPos = this.itvDataManager._configItemMap[fromId].getPosition();
		// 	fromItemPos.x +=relPos.x;
		// 	fromItemPos.y +=relPos.y;
		// 	fromItemPos.z +=relPos.z;
		// }
		// if(toCil.getConfigItemId()!=toId){
		// 	var relPos = this.itvDataManager._configItemMap[toId].getPosition();
		// 	toItemPos.x +=relPos.x;
		// 	toItemPos.y +=relPos.y;
		// 	toItemPos.z +=relPos.z;
		// }
		var fromLayer = this.itvDataManager._layerMap[fromCil.getLayerId()];
		var toLayer = this.itvDataManager._layerMap[toCil.getLayerId()];
		var fromLayerNode = this.itvManager._layerNodeMap[fromCil.getLayerId()];
		if (fromCil.getLayerId() == toCil.getLayerId()) { // 表示的是同一个layer上的配置项
			var lineHeight = parseInt(fromLayer.getHeight()) + 5;
			var fromPosition = new mono.Vec3(fromItemPos.x, lineHeight, fromItemPos.z);
			var toPosition = new mono.Vec3(toItemPos.x, lineHeight, toItemPos.z);
            control = [fromPosition,toPosition];
            var line = this.create3DLine(control, color, 3);
            if (line && fromLayerNode) {
            	// line.setPositionY(lineHeight);
            	line.setPositionY(16);
            	line.setParent(fromLayerNode);
            }
		}else{ // 跨layer
			var fromWorldPos = this.itvManager.getPositionByConfigItem(this.itvDataManager._configItemMap[fromId]);
			var toWorldPos = this.itvManager.getPositionByConfigItem(this.itvDataManager._configItemMap[toId]);
		    var fromPosition = new mono.Vec3(fromItemPos.x, parseInt(fromLayer.getHeight()+fromItemPos.y), fromItemPos.z);
		    var toPosition = new mono.Vec3(toItemPos.x, parseInt(toLayer.getHeight()+toItemPos.y), toItemPos.z);
		    if (fromWorldPos) {
		    	fromPosition = fromPosition.add(fromWorldPos);
		    }
		    if (toWorldPos) {
		    	toPosition = toPosition.add(toWorldPos);
		    }
			// var fromPosition = new mono.Vec3(fromItemPos.x, parseInt(fromLayer.getHeight()+fromItemPos.y), fromItemPos.z);
			// var toPosition = new mono.Vec3(toItemPos.x, parseInt(toLayer.getHeight()+toItemPos.y), toItemPos.z);
			control.push(fromPosition);
			control.push(toPosition);
			// var line = new mono.LineX(control, [color], 3);
			var line = this.create3DLine(control, color, 3,true);
			// line.setStyle('m.dashSize',4);
   //          line.setStyle('m.totalSize',10);
		}

		// if (!this.linePointMap[fromId + '-' + toId]) {
			// this.linePointMap[fromId + '-' + toId] = [];
			// for(var i=0;i<5;i++){
			// 	var point = this.createLinePoint();
			// 	point.setScale(18, 18, 18);
			// 	point.setParent(line);
			// 	if(line.getPointAt){
			// 		var pos = line.getPointAt(0);
			// 		point.setPosition(pos);
			// 	}else if(line.path.getPointAt){
			// 		var pos = line.path.getPointAt(0);
			// 		point.setPositionX(pos.x);
			// 		point.setPositionY(0);
			// 		point.setPositionZ(pos.y*-1);				
			// 	}
			// 	point.line = line;
			// 	point.setClient('itv_point',true);
			// 	this.linePointMap[fromId + '-' + toId].push(point);
			// }

			// this.linePointMap[fromId + '-' + toId] = this.createSmoke(line, 1, '#FFFFFF', 1);
		// }
		return line;
	},

	create3DLine: function(control, color, lineWidth, isDash) {
		if (!control && control.length < 2) {
			return null;
		}
		if (isDash) {
			// var line = new mono.LineX(control, [color], lineWidth || 2);
			// line.setStyle('m.useVertexColor', true);
			// // line.setStyle('m.dashSize', 4);
			// // line.setStyle('m.totalSize', 10);
			// line.setStyle('m.ambient', color);
			// line.setStyle('m.type', 'phong', );
			// return line;
			color = 'rgb(0,255,200)';  //跨楼层线路颜色
			var path = this.getCrossLayerPathByStartPosAndEndPos(control[0],control[control.length-1]);
			var pathNode = new mono.PathNode(path);
			pathNode.setStyle('m.color',color); //00f6ff
			pathNode.setStyle('m.type','phong');
			pathNode.setStyle('m.ambient',color);

			// pathNode.setStyle('m.texture.image','images/link.jpg');
			// pathNode.setStyle('m.texture.repeat',new mono.Vec2(200,1));
			// 'm.type':'phong',
   //                  'm.color':'cyan',
   //                  'm.ambient':'cyan',
			return pathNode;
		} else {
			color=color || '#2ECCFA';
			/*
			var path = new mono.Path();
			// path.moveTo(control[0].x,control[0].z,0);
			// for(var i = 1 ; i < control.length ; i++){
			// 	var c = control[i];
			// 	path.lineTo(c.x,c.z,0);
			// }
			path.moveTo(control[0].x,(-1)*control[0].z,0);
			for(var i = 1 ; i < control.length ; i++){
				var c = control[i];
				path.lineTo(c.x,(-1)*c.z,0);
			}
			path=mono.PathNode.prototype.adjustPath(path, 50);
			*/

			//通过mono.Color对各种形式的颜色进行转换
			var midColor = new mono.Color(color);
			midColor.r *= 0.9;
			midColor.g *= 0.9;
			midColor.b *= 0.9;
			var color2 = '#' + midColor.getHexString();
			
            var path = this.getPathByFromPosAndToPos(control[0],control[control.length-1]);
			var line=new mono.PathCube(path, 3, 1, 10);
			line.s({
				'm.color': color,
				'm.ambient': color,
				'm.type': 'phong',
				'outside.m.type':'basic',
				'outside.m.color':color2,// outsideColor,
                'inside.m.type': 'basic',
				'inside.m.color': color2,//insideColor,

                // 'aside.m.color': asideColor || outsideColor,
                // 'zside.m.color': zsideColor || outsideColor,
                // 'top.m.color': topColor,
                // 'top.m.ambient': topColor,
                // 'bottom.m.color': bottomColor || topColor,
			});
			return line;
		}
	},

    /**
     *
     * 根据开始的位置和结束的位置计算linex上的controls
     * 这个方法用来计算同一层上两个配置项之间的连线
     *
     */
	getControlsByFromPosAndToPos: function(fromPosition, toPosition) {
		if (!fromPosition || !toPosition) {
			return null;
		}
		// 计算直拐点
		/*
		var lineHeight = fromPosition.y;
		var control = [];
		control.push(fromPosition);
		if (fromPosition.x != toPosition.x 
			&& fromPosition.z != toPosition.z) {
			control.push(new mono.Vec3(fromPosition.x + (toPosition.x - fromPosition.x) / 2, lineHeight, fromPosition.z));
			control.push(new mono.Vec3(fromPosition.x + (toPosition.x - fromPosition.x) / 2, lineHeight, toPosition.z));
		}
		control.push(toPosition);
		return control;
		*/
		return [fromPosition, toPosition];
	},

	getPathByFromPosAndToPos: function(fromPosition, toPosition) {
		if (!fromPosition || !toPosition) {
			return null;
		}
		var kneePoint = this.getKneePointByFromPosAndToPos(fromPosition, toPosition);
		var path = new mono.Path();
		path.moveTo(fromPosition.x, (-1) * fromPosition.z, 0);
		if (kneePoint) {
			path.lineTo(kneePoint.x, (-1) * kneePoint.y, 0);
		}
		path.lineTo(toPosition.x, (-1) * toPosition.z, 0);
		path = mono.PathNode.prototype.adjustPath(path, 50);
		return path;
	},

    /**
     * 计算开始节点和结束节点中间的二次贝塞的拐点
     */
	getKneePointByFromPosAndToPos: function(fromPosition,toPosition) {
		var x0 = fromPosition.x, y0 = fromPosition.z, x1 = toPosition.x, y1 = toPosition.z;
		if (Math.abs(x0 - x1) <= 2 || Math.abs(y0 - y1)<=2 )  { // 如果是水平或垂直一个方向时就不用拐点了
			return null;
		}
		
		var rx = x0 + Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0)) / 2;
		var ry = y0 + 0.3 * Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0)) / 2;

		var cosa = (x1 - x0) / Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
		var sina = (y1 - y0) / Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
		var xx, yy;
		xx = (rx - x0) * cosa - (ry - y0) * sina + x0;
		yy = (rx - x0) * sina + (ry - y0) * cosa + y0;
		return {
			x: xx,
			y: yy
		};
	},

    


    /**
     * 计算开始节点和结束节点中间的二次贝塞的拐点——空间(三维)
     */
	get3DKneePointByFromPosAndToPos: function(fromPosition,toPosition) {
		var x0 = fromPosition.x ,y0 = fromPosition.y, z0 = fromPosition.z;
		var x1 = toPosition.x, y1 = toPosition.y,z1 = toPosition.z;
		if (Math.abs(x0 - x1) <= 2 || Math.abs(y0 - y1)<=2 )  { // 如果是水平或垂直一个方向时就不用拐点了
			return null;
		}
		var center = {x:x0 + (x1-x0)/2,y:y0+(y1-y0)/2,z:z0+(z1-z0)/2};

		var n1 = {x:x0,y:y0+(center.y-y0)/2,z:z0};
		var n2 = {x:x1,y:center.y+(y1-center.y)/2,z:z1};
		return [n1,center,n2];
		// var alp = 0.3; //弧度因子
		// var length = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0) + (z1 - z0) * (z1 - z0))/2
		// var rx = x0 + length;
		// var ry = y0 + alp * length;
		// var rz = z0 + length;
		// var cosa = (x1 - x0) / Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
		// var sina = (y1 - y0) / Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
		// var xx, yy;
		// xx = (rx - x0) * cosa - (ry - y0) * sina + x0;
		// yy = (rx - x0) * sina + (ry - y0) * cosa + y0;
		// return {
		// 	x: xx,
		// 	y: yy
		// };
	},

    /**
     * 根据开始节点和结束节点来计算跨楼层连线的路径
     */
	getCrossLayerPathByStartPosAndEndPos : function(startPos,endPos){
		if(!startPos || !endPos){
			return null;
		}
		var path = new mono.Path();
		if(Math.abs(startPos.y - endPos.y) <= 50){ //当两层隔的太近，或(x,z)平面上的距离也很近时就返回直线
			path.moveTo(new mono.Vec3(startPos.x,startPos.y,startPos.z));
			path.lineTo(new mono.Vec3(endPos.x,endPos.y,endPos.z));
			return path;
		}
		var kneePoints = this.get3DKneePointByFromPosAndToPos(startPos,endPos);
		path.moveTo(startPos.x, startPos.y, startPos.z);
		if (kneePoints) {
			for(var i = 0 ; i < kneePoints.length ; i++){
				path.lineTo(kneePoints[i].x, kneePoints[i].y, kneePoints[i].z);
			}
		}
		path.lineTo(endPos.x,endPos.y, endPos.z);
		path = mono.PathNode.prototype.adjustPath(path, 50);
		return path;
	},

    /**
     *
     * 创建配置项到3D的Node的连线
     *
     */
	createLineFromCItemToNode : function(configItemNode,node){
    	if (!configItemNode || !node) {
    		return ;
    	}
    	var color = '#00f6ff';
  //   	var control = [];
		// control.push(configItemNode.getWorldPosition());
		// control.push(node.getWorldPosition());
		// var line = new mono.LineX(control, [color], 2);
		// line.setStyle('m.useVertexColor',true);
		var fromCenter = configItemNode.getWorldPosition();
		var toCenter = node.getWorldPosition();
		var fbb = configItemNode.getBoundingBox()||{min:{y:0},max:{y:0}};
		var nbb = node.getBoundingBox()||{min:{y:0},max:{y:0}};
		var startPos = new mono.Vec3(fromCenter.x,fromCenter.y + fbb.min.y , fromCenter.z);
		var endPos = new mono.Vec3(toCenter.x,toCenter.y + nbb.max.y,toCenter.z);
		var path = this.getCrossLayerPathByStartPosAndEndPos(startPos,endPos);
		var pathNode = new mono.PathNode(path);
			pathNode.setStyle('m.color','#00f6ff');
			pathNode.setStyle('m.type','phong');
			pathNode.setStyle('m.ambient','#00f6ff');
		return pathNode;
	},


	createLinePoint: function () {
		var billboard = new mono.Billboard();
		billboard.s({
			'm.texture.image': '/images/itvPoint.png',
			'm.transparent': true,
			'm.opacity': 1.0,
			'm.depthMask':false
		});
		return billboard;
	},
	startPointAnimate:function(){
		var self = this;
		this.nowTime = Date.now();
		this.pointAnimate = true;
		this.pointPercent = 0;
		requestAnimationFrame(self.linePointAnimate.bind(self));
	},
	linePointAnimate: function () {
		var self = this;
		if (!this.pointAnimate)
			return;
		var self = this;
		var time = Date.now();
		this.pointPercent = (this.pointPercent + (time - this.nowTime) / this.circleTime) % 1;
		this.nowTime = time;
		// for (var p in this.linePointMap) {
			// var points = this.linePointMap[p];
			// points.forEach(function(point,index){
			// 	var line = point.line;
			// 	var per = self.pointPercent+0.01*index;
			// 	per %= 1;
			// 	if(line.getPointAt){
			// 		var newPos = line.getPointAt(per);
			// 		point.setPosition(newPos);
			// 	}else if(line.path.getPointAt){
			// 		var newPos = line.path.getPointAt(per);
			// 		point.setPositionX(newPos.x);
			// 		point.setPositionY(0);
			// 		point.setPositionZ(newPos.y*-1);				
			// 	}
			// 	line.setStyle('m.texture.offset', new mono.Vec2(self.pointPercent, 0));
			// })
		// }
		for (var p in this.linePointMap) {
			var smoke = this.linePointMap[p];
			var line = smoke.line;
			var radio = this.pointLength / line.path.getLength() / this.verticeCount;
			smoke.vertices=[];
			if(line.getPointAt){
				for(var i=this.verticeCount;i>0;i--){
					var curPer = (this.pointPercent + radio * i)%1;
					smoke.vertices.push(line.getPointAt(curPer).clone());
				}
			}else if(line.path.getPointAt){		
				for(var i=this.verticeCount;i>0;i--){
					var curPer = (this.pointPercent + radio * i)%1;
					var curPos = line.path.getPointAt(curPer);
					// var linePos = line.getWorldPosition();
					// if(this.itvManager._itvHandler.currentLayerId){
					// 	var curVec = new mono.Vec3(curPos.x,curPos.y,linePos.z);
					// }else{
						var curVec = new mono.Vec3(curPos.x,0,-curPos.y);
					// }
					smoke.vertices.push(curVec);
				}
			}
			smoke.setUpdateFlags(true);
			main.sceneManager.network3d.dirtyNetwork();
		}
		requestAnimationFrame(self.linePointAnimate.bind(self));
	},


	createSmoke: function(line, color, opacity){
		var hiddenPoint=new mono.Vec3(0,0,0);
		var vertices=[];
		var colors=[];
		var sizes=[];
		var verticesColor=new mono.Color(color);
		for(var i=this.verticeCount;i>0;i--){
			vertices.push(hiddenPoint.clone());
			colors.push(verticesColor);
			sizes.push(i*this.pointSize/50/(this.verticeCount/50));
			// sizes.push(i*size/this.verticeCount*1000);
		}
		var smoke = new mono.Particle(vertices, colors, sizes);
		smoke.line = line;
		line.smoke = smoke;
		smoke.material.sizeAttenuation = true;
		smoke.material.scale = 3000;
		smoke
			.setStyle('m.color', color)
			.setStyle('m.vertexColors', true)
			.setStyle('m.transparent',false)
			.setStyle('m.opacity', opacity)
			// .setStyle('m.texture.image','/images/itvPoint.png')
			.setStyle('m.blendMode', mono.AdditiveBlending);
		smoke.setClient('itv_point',true);
		this.itvManager.dataBox.add(smoke);
		return smoke;
	},


});

it.ITVRelationManager = $ITVRelationManager;