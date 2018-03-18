var $VirtualDeviceOffManager = function (sceneManager) {
	it.VirtualDeviceManager.call(this,sceneManager);
	this.sceneManager = sceneManager;
	this.dm = this.sceneManager.dataManager;
	this.vm = this.sceneManager.viewManager3d;
	this.defaultEventHandler = this.vm.defaultEventHandler;
	this.network = this.sceneManager.network3d;
	this.camera = this.network.getCamera();
	this.box = this.network.dataBox;
	this.appStates = false;
	this.addEventState = false;
	this.appInit();
};

mono.extend($VirtualDeviceOffManager, it.VirtualDeviceManager, {
	appInit: function() {

	},
	appStart: function(){
		this.appStates = true;
		this.addClickEvent();
	}, 
	appEnd: function(){
		this.clearVMPop(this.oldVMnode);
		this.removeClickEvent();
		this.hide();
		this.removeOffBtn();
		this.deleteLabel();
        this.appStates = false;
        this.timer = null;
	},
	addClickEvent: function(){
		var self = this;
		if(this.addEventState) return;
		this.oldShouldHandleClickElement = this.defaultEventHandler.shouldHandleClickElement;
		this.defaultEventHandler.shouldHandleClickElement = function(element, network, data, clickedObj){
            if(self.appStates){
                return true;
            }
            return self.oldShouldHandleClickElement.call(self.defaultEventHandler, element, network, data, clickedObj);
        }
		this.oldHandleClickElement = this.defaultEventHandler.handleClickElement;
		this.defaultEventHandler.handleClickElement = function(element,network,data,clickedObj){
			if(self.appStates){
                if(self.sceneManager.dataManager.getCategoryForData(data).getId() == 'virtualDevice'&&self.sceneManager.getNodeData(element)){
					if(self.timer){
                        clearTimeout(self.timer);
                        self.timer = null;
                    } else {
                        self.timer = setTimeout(function () {
                            if(self.appStates){
								self.clearVMPop(self.oldVMnode);
								self.oldVMnode = element;
								self.VMnode = element;
								self.VMdata =  self.sceneManager.getNodeData(element);
								self.createOffBtn();
								self.makeVMPop();
								self.makeLabel();
                            }
                            self.timer = null;
                        }, 100)
                    }
                } else{
					self.removeOffBtn();
					self.deleteLabel();
					self.clearVMPop(self.oldVMnode);
                }
            }else {
				self.oldHandleClickElement.call(self.defaultEventHandler, element, network, data, clickedObj);
			}
		}

		this.oldShouldHandleClickBackground = this.defaultEventHandler.shouldHandleClickBackground;
		this.defaultEventHandler.shouldHandleClickBackground = function (element, network, data, clickedObj) {
			if (self.appStates) {
				return true;
			}
			return self.oldShouldHandleClickElement.call(self.defaultEventHandler, element, network, data, clickedObj);
		}

		this.oldHandleClickBackground = this.defaultEventHandler.handleClickBackground;
		this.defaultEventHandler.handleClickBackground = function (network) {
			if (self.appStates) {
				self.removeOffBtn();
				self.deleteLabel();
				self.clearVMPop(self.oldVMnode);
			}
			self.oldHandleClickBackground.call(self.defaultEventHandler, network);
		}
		this.addEventState = true;
	},
	removeClickEvent: function(){
		if(this.addEventState) {
			this.defaultEventHandler.shouldHandleClickElement = this.oldShouldHandleClickElement;
            this.oldShouldHandleClickElement = null;

            this.defaultEventHandler.handleClickElement = this.oldHandleClickElement;
			this.oldHandleClickElement = null;

			this.defaultEventHandler.shouldHandleClickBackground = this.oldShouldHandleClickBackground;
            this.oldShouldHandleClickBackground = null;

            this.defaultEventHandler.handleClickBackground = this.oldHandleClickBackground;
            this.oldHandleClickBackground = null;
			
			this.addEventState = false;
		}
	},
	createOffBtn: function(){
		var self = this;
		this.offBtn&&this.offBtn.remove();
		this.offBtn = $('<div>').text(it.util.i18n("VirtualDeviceOff_Vmware_Off")).addClass('btn-default').appendTo($('.deviceBtn'));;
		this.offBtn.on('click', function(){
			self.doVMOff();
		});
		this.updateOffBtnPosition();
		this.camera.addPropertyChangeListener(self.updateOffBtnPosition, this);
	},
	removeOffBtn: function(){
		var self = this;
		this.offBtn&&this.offBtn.remove();
		this.offBtn = null;
		this.VMnode = null;
        this.camera.removePropertyChangeListener(self.updateOffBtnPosition, this);
	},
	updateOffBtnPosition: function(){
		if(this.VMnode && this.offBtn){
			var nodeSize = this.VMnode.getBoundingBox().size();
			var nodePosition = this.VMnode.getPosition();
            var worldPosition = this.VMnode.worldPosition(new mono.Vec3(nodeSize.x*3/4, 0, nodeSize.z/2), nodeSize.x*3/4);
            var position2d = this.network.getViewPosition(worldPosition);
            this.offBtn.css({
				'left': position2d.x,
				'top': position2d.y - this.offBtn.height(),
            })
		}
	},
	makeLabel:function(){
		this.deleteLabel();
		var text = this.getVMInfo(this.VMdata);
		this.options = {
			parentNode: this.VMnode,
			arrowPosition: 'down',
			globalAlpha: 0.9,
			text: text,
			scale: [0.08,0.08,1]
		};
		this.currentBillboard = it.util.makeTextBillboardWithArrow.createBillboard(this.options);
		var position = [];
		var size = this.VMnode.getBoundingBox().size();
		position[0] = 0;
		position[1] =  size.y/4*3;
		position[2] = 0;
		this.currentBillboard.setPosition(new mono.Vec3(position[0], position[1], position[2]));
		this.currentBillboard.s({
			'm.fixedSize': 1000,
			'm.alignment': new mono.Vec2(-0.25, 0.5),
		})
		this.box.add(this.currentBillboard);
	},
	deleteLabel: function () {
		if(this.currentBillboard){
			this.currentBillboard.setParent(null);
            this.box.remove(this.currentBillboard);
            this.currentBillboard = false;
		}
	},
	getVMInfo: function(data){
		var details = {};
		var text;
		dataJson.VMbbdInfo.forEach(function(item){
			var field = item.field;
			var label = it.util.i18n("VirtualDeviceOff_"+field);
			if(field=='name') {
				details.name = data._name;
				text = details.name;
			}else if(field=='id') {
				details.id = data._id;
				if(details.id) {
					text += '\n'+label+"： "+details.id;
				}	
			}else {
				//扩展字段
				details[field] = data._userDataMap[field];
				if(details[field]) {
					text += '\n'+label+"： "+ details[field];
				}
			}

		});
		return text;
	},
	doVMOff: function(){
		var self = this;
		var VMnode = this.VMnode;
		if(this.VMnode) {
			this.removeOffBtn();
			this.deleteLabel();
			var	size = VMnode.getBoundingBox().size(),
				position = VMnode.getPosition(),
				startY = position.y;
				d = size.z;	
			var animate = new twaver.Animate({
				from:0,
				to:d,
				delay:0,
				dur:1000,
				onUpdate:function(value){
					VMnode.setPositionY(startY+value);
				},
				onDone: function(){
					var id = self.VMdata._id;
					var params = {id: id};
					//删除虚拟机
					it.util.apiWithPush('remove', params, function(result){
						setTimeout(function(){
							//剩余虚拟机位置重排
							var currentDeviceNode = self.vm.getFocusNode(),
								currentDeviceData = self.sceneManager.getNodeData(currentDeviceNode),
								virtualDevicesData = [],
								length = 0;
							virtualDevicesData = currentDeviceData._childList._as;//数组
							length = virtualDevicesData.length;
							if(!length)  {
								if(self.base) self.hideBase();
								return;
							}
							self.showBase();

						},100);
					})
				}
			});
			animate.play();
		}
	},
	makeVMPop: function(){
		var children = this.VMnode.getDescendants();
		this.VMnode.s({
			'm.type':'phong',
			'm.color': '#00ffff',
			'm.ambient': '#00ffff',
			'm.transparent':true,
			'm.opacity':1,	
			// 'top.m.texture.image':null,
			// 'top.m.texture.image': './images/vd_test.png'	
		})
		children.forEach(function(child){
			child.s({
				'm.type':'phong',                                    
				'm.color': '#04cdce',
				'm.ambient': '#04cdce',
				'm.transparent':false,		
			})
		})		
	},
	clearVMPop: function(node){
		if(node) {
			var children = node.getDescendants();
			node.s({
				'm.color': '#fff',
				'm.ambient': '#fff',
				'm.transparent':true,
			})
			children.forEach(function(child){
				child.s({                                
					'm.color': '#fff',
					'm.ambient': '#fff',	
					'm.transparent':null,	
				})
			})		
		}
	
	}
});

it.VirtualDeviceOffManager = $VirtualDeviceOffManager;