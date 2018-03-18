
/**
 * lookAt到room时，动态的生成了一个room那么大的地板
 *
 * 注意：如果room中存在simpleNode时，就不走这条路计算了
 *
 * 主要思想如下：
 * 1、动态生成的地板当做复杂对象；
 * 2、原来的则当做simpleNode；
 * 3、同时还生成了一个包含complexNode对象和simpleNode的不可见的主对象(mainNode),
 * 4、还需要将原来的对象上的children(这个children是数据层面的)，移到新的mainNode上
 * 5、还需要将fouseNode变成新的mainNode,而不是simpleNode
 *
 * 
 */
var $ComboRoomFloorBeforeLookAtRoom = function(sceneManager){
	this.sceneManager = sceneManager;
	this.dataManager = this.sceneManager.dataManager;
	this.init();
};

mono.extend($ComboRoomFloorBeforeLookAtRoom,Object,{
	

	init : function(){
		var deh = this.sceneManager.viewManager3d.getDefaultEventHandler();
		var beforeLookAtFunction = deh.beforeLookAtFunction;
		var self = this;
		deh.beforeLookAtFunction = function(node,oldFocusNode){
			self._beforeLookAtFloor(node,oldFocusNode,beforeLookAtFunction);
		}
	},

	_beforeLookAtFloor : function(node,oldFocusNode,callback){
		if (!node) {
			return callback && callback(node,oldFocusNode);
		}
		var data = this.sceneManager.getNodeData(node);
		var category = this.dataManager.getCategoryForData(data);
		if (category && category.getId() == 'room') {
			var mainNode = main.sceneManager.getNodeByDataOrId(data);
			if (!mainNode.getClient('simpleNode')) { // 没有简单对象时才生成一个房间
				this.createComplexNode(data,mainNode);
				// return ;
			}
		}
		return callback && callback(node,oldFocusNode);
	},

	getChildren : function(data,node){
		if (!data || !node) {
			return null;
		}
		var result = [];
		var nodeData  = this.sceneManager.getNodeData(node);
		if (data == nodeData) {
			result.push(node);
			var children = node.getChildren();
			for(var i = 0 ; i < children.size() ; i++){
				var child = children.get(i);
				var cResult = this.getChildren(data,child,this);
				if (cResult && cResult.length > 0) {
					for(var j = 0 ; j < cResult.length ; j++){
						result.push(cResult[j]);
					}
				}
			}
		}
		return result;
	},

    /**
      * 获取floor中floor的整个组合体，一开始是离散的不太好计算特定区域内相交的墙
     */
	getComboNodeFloorObj : function(floor){
		if (!floor) {
			return null;
		}
		var data = this.sceneManager.getNodeData(floor);
		var category = this.dataManager.getCategoryForData(data);
		if (category && category.getId() == 'floor') {
			var floorNode = this.sceneManager.getNodeByDataOrId(data);
			var result = this.getChildren(data,floorNode);
			var comboNode = new mono.ComboNode(result,['+']);
			return comboNode;
		}
		return null;
	},

	createComplexNode : function(data,simpleNode){
		var floor = this.getCurrentFloor(data);
		// var wall = this.sceneManager.getMainNode(floor);
		if (!floor || !simpleNode) {
			return ;
		}
		// var comboFloor = this.getComboNodeFloorObj(floor);
		var newFloor = new mono.ComboNode([floor,simpleNode],['^'],true); //1
		// var newFloor = new mono.ComboNode([floor,comboFloor],['^'],true); //1
		if (!newFloor) {
			return ;
		}
		// var size = newFloor.getBoundingBox().size();
		// var tempCube = new mono.Cube(size.x+1000,500,size.z+1000);
		// tempCube.setPosition(simpleNode.getWorldPosition());
		// tempCube.setY(tempCube.getY() + 10);
		// var complexNode = new mono.ComboNode([tempCube,comboFloor],['^']);
		// newFloor.setParent(complexNode);
		// // newFloor.setY(-50);
		// var complexNode = tempCube;

		// complexNode = comboFloor;

		var complexNode = newFloor;
		var mainNode = simpleNode.clonePrefab(false);// 不克隆孩子 // 3
		mainNode.setStyle('m.visible',false); // 3
		mainNode.setClient('simpleNode',simpleNode); // 2
		mainNode.setClient('complexNode',complexNode); //1
		mainNode.setPosition(simpleNode.getPosition());
		mainNode.setParent(simpleNode.getParent());
		this.sceneManager.dataNodeMap[data.getId()] = mainNode;
        this.sceneManager.setParentRelationShip(data);
		simpleNode.setPosition(0,0,0);
		complexNode.setPosition(0,0,0);
		this.sceneManager.viewManager3d._focusNode = mainNode; // 第5步
		// 第4步
		var children = data.getChildren();
		for (var i = 0; i < children.size(); i++) {
			var child = children.get(i);
			var childNode = this.sceneManager.getNodeByDataOrId(child);
			if (childNode) {
				childNode.setParent(mainNode);
			}
		}
		// 以下是做了个真假切换，因为setFouse是在beforeLookAtFunction之前完成的
		complexNode.setParent(mainNode);
		simpleNode.setParent(null);
		this.sceneManager.network3d.dataBox.removeByDescendant(simpleNode);
		this.sceneManager.network3d.dataBox.addByDescendant(mainNode);
	},
    
    /**
     * 获取当前的地板(注意：不是floor，而是shapeNode)
     * 怎么获取呢？找parent(或找parent的上级)
     */
	getCurrentFloor : function(data){
		if (!data) {
			return null;
		}
		var parent = this.dataManager.getDataById(data.getParentId());
		var category = this.dataManager.getCategoryForData(parent);
		if (category && category.getId() == 'floor') {
			var floorNode = this.sceneManager.getNodeByDataOrId(parent.getId());
			var children = floorNode.getChildren();
			for (var i = 0; i < children.size(); i++) {
				var child = children.get(i);
				if (child && child.getClient('type') == 'floor') {
					return child;
				}
			}
			return null;
		}else {
			return this.getCurrentFloor(parent,this);
		}
	},

});

it.ComboRoomFloorBeforeLookAtRoom = $ComboRoomFloorBeforeLookAtRoom;

