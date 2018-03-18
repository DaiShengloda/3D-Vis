

//设备标签，用Billboard展示

var DeviceLabel = it.DeviceLabel = function (sceneManager) {
	this.sceneManager = sceneManager || main.sceneManager;
	this.dataManager = this.sceneManager.dataManager;
	this.billboard =  new it._TextBillboardWithArrow();
	this.defaultEventHandler = sceneManager.viewManager3d.getDefaultEventHandler();
	this.network = this.sceneManager.network3d;
	this.box = this.network.getDataBox();
	this.currentBillboard = false;
	this.currentRack = false;
	this.currentDevice = false;
	this.currentDeviceData = false;
	this.pop = false;
	this.appStates = false;
	this.init();
};

mono.extend(DeviceLabel, Object, {

	init: function () {
		var self = this;
		this.sceneManager.viewManager3d.defaultEventHandler.addAfterLookAtListener(this.afterLookAtHandler, this);
		this.sceneManager.viewManager3d.defaultEventHandler.addAfterLookFinishedAtListener(this.afterLookFinishedAtHandler, this);
		var node, data, categoryId;
		node = this.sceneManager.viewManager3d.getFocusNode();
		data = this.sceneManager.getNodeData(node);
		categoryId = this.sceneManager.dataManager.getCategoryForData(data);
		if(categoryId == 'rack'){
			this.currentRack = node;
			this.appStates = true;
		}

		this.oldShouldHandleClickElement = this.defaultEventHandler.shouldHandleClickElement;
        this.defaultEventHandler.shouldHandleClickElement = function(element, network, data, clickedObj){
			if(self.appStates){
				return true;
			}
			return self.oldShouldHandleClickElement.call(self.defaultEventHandler, element, network, data, clickedObj);
        }
        this.oldHandleClickElement = this.defaultEventHandler.handleClickElement;
        this.defaultEventHandler.handleClickElement = function(element, network, data, clickedObj){
			if(self.appStates){
				if(self.dataManager.getCategoryForData(data).getId() == 'equipment'&&self.sceneManager.getNodeData(element)){
					if(self.timer){
						clearTimeout(self.timer);
						self.timer = null;
					} else{
						self.timer = setTimeout(function(){
							if(self.appStates){
								self.makeLabel(element);
							}
							self.timer = null;
						}, 100);
					}
				} else{
					self.currentDevice = false;
					self.currentDeviceData = false;
					self.deleteLabel();
				}
			}
			self.oldHandleClickElement.call(self.defaultEventHandler, element, network, data, clickedObj);
		}
		this.oldShouldHandleClickBackground = this.defaultEventHandler.shouldHandleClickBackground;
        this.defaultEventHandler.shouldHandleClickBackground = function(element, network, data, clickedObj){
			if(self.appStates){
				return true;
			}
			return self.oldShouldHandleClickElement.call(self.defaultEventHandler, element, network, data, clickedObj);
        }
		this.oldHandleClickBackground = this.defaultEventHandler.handleClickBackground;
        this.defaultEventHandler.handleClickBackground = function(network){
			if(self.appStates){
				self.currentDevice = false;
				self.currentDeviceData = false;
				self.deleteLabel();
			}
			self.oldHandleClickBackground.call(self.defaultEventHandler, network);
		}
	},

	afterLookAtHandler: function (node) {
		var data = this.sceneManager.getNodeData(node);
		var dt = this.sceneManager.dataManager.getDataTypeForData(data);
		var categoryId = dt.getCategoryId();
		if((this.pop||this.currentBillboard)&&this.currentRack!=node){
			this.deleteLabel();
		}
		if(this.currentRack&&categoryId != 'rack'){
			this.currentRack = false;
			this.deleteLabel();
			this.appStates = false;
		}
	},

	afterLookFinishedAtHandler: function(node){
		var data = this.sceneManager.getNodeData(node);
		var dt = this.sceneManager.dataManager.getDataTypeForData(data);
		var categoryId = dt.getCategoryId();
		if(categoryId == 'rack'){
			this.currentRack = node;
			var rackDatatype = this.sceneManager.dataManager.getDataTypeForData(data);
			this.rackChildrenSize = rackDatatype._childrenSize.ySize;
			this.appStates = true;
		}
	},

	getDeviceInFor: function(){
		var details = {};
		var text;
		details.id = this.currentDeviceData._id;
		details.dataType = this.currentDeviceData._dataTypeId;
		details.UCount = main.sceneManager.dataManager.getDataTypeById(details.dataType)._size.ySize;
		details.businessTypeId = this.currentDeviceData._businessTypeId;
		details.name = this.currentDeviceData._name;
		text = details.id +'\n'+it.util.i18n("DeviceLabel_Device_Name")+'：'+ details.name +'\n'+it.util.i18n("DeviceLabel_Device_Model")+'：'+ details.dataType;
		if(details.businessTypeId){
			text += '\n'+it.util.i18n("DeviceLabel_Business_Type")+'：'+ details.businessTypeId;
		}
		text += '\n'+it.util.i18n("DeviceLabel_Occupation_Count")+'：'+ details.UCount +'U';
		return text;
	},

	makeLabel: function (element) {
		this.deleteLabel();
		this.currentDevice = element;
		this.currentDeviceData = this.sceneManager.getNodeData(element);
		var text = this.getDeviceInFor();
		this.options = {
			parentNode: this.currentDevice,
			arrowPosition: 'right',
			globalAlpha: 0.9,
			text: text,
			scale:[0.05,0.05,1],
		};
		// this.currentBillboard = this.billboard.createBillboard(this.options);
		this.currentBillboard = it.util.makeTextBillboardWithArrow.createBillboard(this.options);
		var position = [];
		var deviceSize = this.currentDevice.getBoundingBox().size();
		position[0] = -1 * deviceSize.x/2*1.1;
		position[1] = 0;
		position[2] = deviceSize.z/2*1.1;
		this.currentBillboard.setPosition(new mono.Vec3(position[0], position[1], position[2]));
		this.currentBillboard.s({
			'm.fixedSize': 1000,
			'm.alignment': new mono.Vec2(-0.5, 0.25),
		})
		this.box.add(this.currentBillboard);
		this.makeDevicePop();
	},

	deleteLabel: function () {
		if(this.currentBillboard){
			this.currentBillboard.setParent(null);
            this.box.remove(this.currentBillboard);
            this.currentBillboard = false;
		}
		if(this.pop){
			this.pop.setParent(null);
			this.box.remove(this.pop);
			this.pop = false;
		}
	},

	makeDevicePop: function(){
		var deviceSize = this.currentDevice.getBoundingBox().size();
		var danWeiHeight = this.currentRack.depth/this.rackChildrenSize/2;
		var pop = new mono.Cube(deviceSize.x+danWeiHeight, deviceSize.y+danWeiHeight, deviceSize.z+danWeiHeight);
		pop.setPosition(0, 0, 0);
		pop.s({
			'm.color': '#41c2cf',
			'm.transparent': true,
			'm.opacity': 0.6,
		})
		pop.setParent(this.currentDevice);
		this.box.add(pop);
		this.pop = pop;
	},
});