
/**
 * 鼠标移动到告警的Billboard上时，出现显示告警信息的tooltip
 * 备注，其实可以通过itv内部实现的方式来实现，开启enableMousemove,然后注册tooltip的rule
 * 但是这种方式效率不高，判断点击的对象时需要判断databox中的所有的node，而这种情况下只需处理alarm的billboard即可
 */

var $AlarmTooltip = function(sceneManager){
	this.sceneManager = sceneManager;
	this.network3d = this.sceneManager.network3d;
    // this.tooltipMamager = this.sceneManager.viewManager3d.tooltipManager;//这里也可以new一个新的，但是注意注册的路径，以及注册onRenderer
    this.tooltipManager = new it.TooltipManager(this.sceneManager);
	this.init();
};

mono.extend($AlarmTooltip,Object,{
	
	init : function(){
		var self = this;
		this.initTooltipHandle();
		this.sceneManager.viewManager3d.addEventHandler(this.tooltipManager);
		this.sceneManager.viewManager3d.addRenderCallback(this.tooltipManager);//如果不是新new出来的可以不用
		this.sceneManager.network3d.getRootView().addEventListener('mousemove',function(e){
			var element = self.filterMouseMoveElement(e);
			if (element) {
				var node = element.element.getParent();//parent才到了机柜上
				var data = self.sceneManager.getNodeData(node);
				var event = event || window.event;
				self.tooltipManager.handleMouseMoveElement(node,self.network3d,data,element,event);
			}else{
				// self.tooltipManager.handleMouseMoveBackground(self.network3d, event);
			}
		});
		var toolTipDiv = this.tooltipManager.getTooltipDiv();
		if (toolTipDiv) {
			// $(toolTipDiv).mouseleave(function(e){
			// 	 self.tooltipManager.hideToolTipDiv();
   //               self.tooltipManager._lastData = null;
			// });
			$(toolTipDiv).mousemove(function(e){ //不传递了
				// e.preventDefault();
				e.stopPropagation();
			});
			$(toolTipDiv).click(function(e){ //不传递了
				e.stopPropagation();
			});
			$(toolTipDiv).dblclick(function(e){ //不传递了
				e.stopPropagation();
			});
		};

		this.sceneManager.viewManager3d.addPropertyChangeListener(function(event) {
			if (event && event.property == "focusNode") {
				self.tooltipManager.hideToolTipDiv.call(self.tooltipManager);
				self.tooltipManager._lastData = null;
			}
		});

	},

	initTooltipHandle: function() {
		var self = this;
		this.tooltipManager.shouldHandleClickElement = function(element, network, data, clickedObj) {
			return true;
		};
		this.tooltipManager.shouldHandleClickBackground = function(element, network, data, clickedObj) {
			return true;
		};
		this.tooltipManager.handleClickBackground = function(network) {
			self.tooltipManager.hideToolTipDiv.call(self.tooltipManager);
			self.tooltipManager._lastData = null;
		};

		this.tooltipManager.handleMouseMoveElement = function(){
			return;
		};

		this.tooltipManager.handleClickElement = function(node, network, data, clickedObj) {
			if (!node instanceof mono.Billboard 
				|| !node.getClient('_alarmBillboard')) { // 是告警的billboard才显示
				return ;
			}
			var content = self.tooltipManager.getTooltipContent.call(self.tooltipManager, node);
			if (content == null) {
				self.tooltipManager._lastData = null;
				self.tooltipManager.hideToolTipDiv.call(self.tooltipManager);
				return;
			}
			if (self.tooltipManager._lastData == data) {
				return;
			} else {
				// clearTimeout(self.tooltipManager._tooltipTimer);
				// self.tooltipManager._tooltipTimer = setTimeout(function() {
					self.tooltipManager._lastData = data;
					self.tooltipManager.showTooltipDiv.call(self.tooltipManager, content, data);
				// }, 200);
			}
		};
	},

	filterMouseMoveElement: function(event) {
		
		var scene = this.sceneManager.getCurrentScene();
		if(!scene) return;
		var self =this;
		var picking = this.network3d.getPickingByEvent(event);
		var intersects = new mono.List();
		var billboards = this.network3d.dataBox.getBillboards();
		intersects.addAll(billboards);
		
		var currentScene = scene.getId();
		if (currentScene == 'floor'){
			intersects.forEach(function(billboard){
                var alarmBillboard = billboard.getClient('_alarmBillboard');
				if (alarmBillboard){
					var dataTypeId = alarmBillboard._dataTypeId;
                    var category = self.sceneManager.dataManager.getCategoryForDataType(dataTypeId).getId();
					if (category == 'airConditioning'){
						billboard.setScale(30,30,1);
					}
				}
		    })
		}
		var elements = picking.intersectObjects(intersects.toArray(), false, false);
		if (elements && elements.length > 0) { //此处也可以加上filter
			return elements[0];
		}
		return null;
	},


});