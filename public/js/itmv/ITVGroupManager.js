
/**
 * 用于处理group
 * 如：
 *  1、合并/展开
 *  2、隐藏/显示其上面的孩子
 *  3、连到其上的连线的处理(当合并展开时)
 *  4、连接到其孩子上的连线的处理(当合并展开时)
 */
var $ITVGroupManager = function (itvManager) {
	this.itvManager = itvManager;
	this.itvDataManager = this.itvManager.itvDataManager;
	this.visibleFilter = new $ITVVisibleManager(this.itvManager);
	// this.init();
};

mono.extend($ITVGroupManager, Object, {


	init: function () {
		this.itvManager.sceneManager.viewManager3d.addVisibleFilter(this.visibleFilter);
	},

	clear: function () {
		this.itvManager.sceneManager.viewManager3d.removeVisibleFilter(this.visibleFilter);
	},

	/**
	 *
	 * 合并/展开group
	 *  1、将孩子隐藏/显示
	 *  2、将自己变小/还原
	 *  3、将连到自己的连线重新计算
	 *  4、将连到孩子的连线也重新计算，使之连到自己或还原到孩子上
	 */
	doGroup: function (groupNode) {
		if (!groupNode && !this.isGroupNode(groupNode)) {
			return;
		}
		var isExtend = this.isExtend(groupNode);
		this.setGroupSize(groupNode, isExtend);
		this.setChildrenVisible(groupNode, isExtend);
		this.resetRelation(groupNode, isExtend);
		this.resetChildrenRelation(groupNode, isExtend);
		this.itvManager.sceneManager.viewManager3d.visibleMap = {};
	},

    /**
     * 判断是不是group
     */
	isGroupNode: function (groupNode) {
		var data = this.itvManager.getDataByNode(groupNode);
		if (data instanceof it.ITVConfigItem
			&& data.getCategoryId() == 'group') {
			return true;
		}
		return false;
	},

    /**
     * 判断group是不是展开的
     */
	isExtend: function (groupNode) {
		if (groupNode && groupNode.getClient('_isExtend')) {
			return true;
		}
		return false;
	},

    /**
     * 隐藏或显示孩子
     */
	setChildrenVisible: function (groupNode, isExtend) {
		var data = this.itvManager.getDataByNode(groupNode);
		var children = data.getChildren();
		for (var i = 0; i < children.size(); i++) { //最好通过虚幻管理器来处理
			var child = children.get(i);
			// var cNode = this.itvManager._configItemNodeMap[child.getId()];
			// cNode.setStyle('m.visible',!!isExtend);
			this.visibleFilter.setVisible(child, !!isExtend);
		}
	},

    /**
     * 展开/合并Group
     */
	setGroupSize: function (groupNode, isExtend) {
		if (isExtend) {
			groupNode.setScale(1, 1, 1);
			groupNode.setClient('_isExtend', false);
		} else {
			groupNode.setScale(0.25, 1, 0.25);
			groupNode.setClient('_isExtend', true);
		}
	},

    /**
     * 重新设置/还原连到该Group上的relation的走向
     */
	resetRelation: function (groupNode, isExtend) {

	},

    /**
     * 重置/还原连到该Group的孩子的连线的位置
     */
	resetChildrenRelation: function (groupNode, isExtend) {
		var self = this;
		var data = this.itvManager.getDataByNode(groupNode);		
		var children = data.getChildren();
		children.forEach(function (child) {
			var childId = child.getId();
			var relations = child.getRelations();
			relations.forEach(function (relation) {
				var relationId = relation.getId();
				var line = self.itvManager.relationManager._lineMap[relationId];
				var fromId = relation.getFromId(), toId = relation.getToId();
				var fromNode = self.itvManager._configItemNodeMap[fromId],
					toNode = self.itvManager._configItemNodeMap[toId];
				if (self.itvManager.relationManager._crossLayerLineMap[relationId]) {
					var groupPos = groupNode.getWorldPosition();
					if (childId == fromId) {
						var toPos = toNode.getWorldPosition();
						var fromPos = isExtend ? fromNode.getWorldPosition() : groupPos;
						var fromNode = isExtend ? fromNode : groupNode;
					} else {
						var toPos = isExtend ? toNode.getWorldPosition() : groupPos;
						var toNode = isExtend ? toNode : groupNode;
						var fromPos = fromNode.getWorldPosition();
					}
					var frombb = fromNode.getBoundingBox() || { min: { y: 0 }, max: { y: 0 } };
					var tobb = toNode.getBoundingBox() || { min: { y: 0 }, max: { y: 0 } };
					var coefficient = fromPos.y >= toPos.y ? 1 : -1;
					fromPos.y = fromPos.y + coefficient * (frombb.max.y - frombb.min.y) / 2 * -1;
					toPos.y = toPos.y + coefficient * (tobb.max.y - tobb.min.y) / 2;
					var path = self.itvManager.relationManager.getCrossLayerPathByStartPosAndEndPos(fromPos, toPos);
				} else {
					var groupPos = groupNode.getPosition();
					if (childId == fromId) {
						var fromNode = isExtend ? fromNode : groupNode;
					} else {
						var toNode = isExtend ? toNode : groupNode;
					}
					var fromPos = self.itvManager.getRelDibanPos(fromNode);
					var toPos = self.itvManager.getRelDibanPos(toNode);
					var path = self.itvManager.relationManager.getPathByFromPosAndToPos(fromPos, toPos);
				}
				line.setPath(path);
			});
		})
	},
});

it.ITVGroupManager = $ITVGroupManager;