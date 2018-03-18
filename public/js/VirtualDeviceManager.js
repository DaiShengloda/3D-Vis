var $VirtualDeviceManager = function (sceneManager) {
	this.sceneManager = sceneManager;
	this.dm = this.sceneManager.dataManager;
	this.vm = this.sceneManager.viewManager3d;
	this.defaultEventHandler = this.vm.defaultEventHandler;
	this.network = this.sceneManager.network3d;
	this.box = this.network.dataBox;
	this.init();

	this.virtualDevicesData = [];
};

mono.extend($VirtualDeviceManager, Object, {

	showVirtualDeviceInfo: function (data) {
		var self = this;
		if (this._dialogPanel) {
			ServerUtil.msg(it.util.i18n("VirtualDeviceManager_Exsit"));
			return;
		}
		if (!data._userDataMap || $.isEmptyObject(data._userDataMap)) {
			ServerUtil.msg(it.util.i18n("VirtualDeviceManager_No_Info"));
			return;
		}
		main.nodeEventHander.virtualDeviceTab.showVirtualDeviceTab(data);
	},

	_addItem: function (key, val, lbId) {
		if (!key) return null;
		var row = $('<tr class="form-group-no-margin"> </tr>');
		var label_Name = $('<td class=" labelName">' + it.util.i18n(key) + ':</td>');
		row.append(label_Name);
		var valText = val;
		var label_Value = $('<td ' + (lbId ? 'id = ' + lbId : '') + '  class="labelValue ">' + valText + '</td>');
		row.append(label_Value);
		return row;
	},

	init: function () {
		var self = this;
		var old = this.defaultEventHandler.handleDoubleClickElement;
		this.defaultEventHandler.handleDoubleClickElement = function (element, network, data, clickedObj, callback) {
			var flag = false;
			if (data) {
				var category = self.dm.getCategoryForData(data);
				if (category._id == 'virtualDevice') {
					flag = true;
				}
			}
			if (flag) {
				self.showVirtualDeviceInfo(data);
				//双击虚拟机的时候获取实时数据
				main.monitorManager.showVirtualRealTime(data);
			} else {
				old.call(self.defaultEventHandler, element, network, data, clickedObj, callback);
			}
		}
	},

	showBase: function (vmOn) {
		var self = this;
		if (this.base) this.hideBase();
		make.Default.load({ "id": dataJson.virtualDeviceBase }, function (base) {
			self.base = base;
			var baseScale = {
				x: 0.038,
				y: 0.038,
				z: 0.038,
			}
			base.setScale(baseScale.x, baseScale.y, baseScale.z);
			var currentDeviceNode_bb = self.currentDeviceNode.getBoundingBox();
			var base_bb = base.getBoundingBox();
			var basePositionY = currentDeviceNode_bb.max.y + base_bb.max.y * 0.038;
			base.setPositionY(basePositionY);
			base.setParent(self.currentDeviceNode);
			self.box.add(base);
			var base_size = {};
			base_size.x = (base_bb.max.x - base_bb.min.x) * baseScale.x;
			base_size.y = (base_bb.max.y - base_bb.min.y) * baseScale.y;
			base_size.z = (base_bb.max.z - base_bb.min.z) * baseScale.z;
			base_size.yPosition = basePositionY;
			self.makeVirtualDevicePosition(base_size, vmOn);
		});
	},

	hideBase: function () {
		if (this.base) {
			this.base.setParent(null);
			this.box.remove(this.base);
			this.base = null;
		}
	},

	makeVirtualDevicePosition: function (base_size, vmOn) {
		var base = {};
		base.top = base_size.yPosition + base_size.y / 2;
		base.x = base_size.x * 0.8;
		base.z = base_size.z * 0.8;
		var length = this.virtualDevicesData.length;
		var ceng;
		for (var i = 1; i < 10; i++) {
			if (i * i >= length) {
				ceng = i;
				break;
			}
		}
		if (!ceng) {
			console.log('虚拟机个数太多，先不处理');
			return;
		}
		var cube = {};
		cube.x = base.x / ceng;
		cube.z = base.z / ceng;
		for (var i = 0; i < length; i++) {
			var virtualDeviceNode = this.sceneManager.getNodeByDataOrId(this.virtualDevicesData[i]);
			var virtualDevicePosition = {}, l = {};
			var virtualDeviceNode_bb = virtualDeviceNode.getBoundingBox();
			var nodeHeight = virtualDeviceNode_bb.max.y - virtualDeviceNode_bb.min.y;
			// 逻辑坐标
			l.x = ((i + 1) % ceng) ? ((i + 1) % ceng) : ceng;
			l.z = Math.ceil((i + 1) / ceng);
			// 虚拟机缩放比例
			var virtualDeviceScale = {
				x: 1,
				y: 1,
				z: 1,
			}
			if (ceng > 2) {
				virtualDeviceScale = {
					x: 1 - (ceng - 1) / 10,
					y: 1 - (ceng - 1) / 10,
					z: 1 - (ceng - 1) / 10,
				}
			}
			virtualDeviceNode.setScale(virtualDeviceScale.x, virtualDeviceScale.y, virtualDeviceScale.z);
			virtualDevicePosition.x = -base.x / 2 + cube.x * (l.x - 0.5);
			if (vmOn && i == length - 1) {
				virtualDevicePosition.y = base.top + nodeHeight * virtualDeviceScale.y / 2 + nodeHeight;
				virtualDeviceNode.setClient('vmOnPos', base.top + nodeHeight * virtualDeviceScale.y / 2);
			} else {
				virtualDevicePosition.y = base.top + nodeHeight * virtualDeviceScale.y / 2;
			}
			virtualDevicePosition.z = base.z / 2 - cube.z * (l.z - 0.5);
			virtualDeviceNode.setPosition(virtualDevicePosition.x, virtualDevicePosition.y, virtualDevicePosition.z);
		}
	},

	show: function () {
		this.currentDeviceNode = this.vm.getFocusNode();
		this.currentDeviceData = this.sceneManager.getNodeData(this.currentDeviceNode);
		this.virtualDevicesData = [];
		this.virtualDevicesData = this.currentDeviceData._childList._as;//数组
		if (this.virtualDevicesData.length == 0) {
			ServerUtil.msg(it.util.i18n("VirtualDeviceManager_No_Virtual"));
			return;
		}
		for (var i = 0; i < this.virtualDevicesData.length; i++) {
			var data = this.virtualDevicesData[i];
			var id = data._id;
			if (!this.sceneManager.dataNodeMap[id]
				&& this.sceneManager.isCurrentSceneInstance(data)) { //如果是当前场景中的data，并且没有load过，这里就load一下
				this.sceneManager.loadOneData(data, true);//这个里面统一将data的Visible设置成了false
			}
			// 显示当前设备上的所有虚拟机(这个方法好像可以显示)
			this.sceneManager.invisibleFilter.setVisible(data, true)
		}
		this.showBase();
	},

	hide: function () {
		// console.log('app-end')
		// 隐藏所有虚拟机
		this.sceneManager.setInvisibleDataByCategoryId('virtualDevice', false);
		// 隐藏当前设备上的所有虚拟机(这个方法好像不能隐藏)
		// for(var i=0; i<this.virtualDevicesData.length; i++){
		// 	this.sceneManager.invisibleFilter.setVisible(this.virtualDevicesData[i], false)
		// }
		this.virtualDevicesData = [];
		this.hideBase();
		if (this._dialogPanel) {
			this._dialogPanel.remove();
			this._dialogPanel = null;
		}
	},
});

it.VirtualDeviceManager = $VirtualDeviceManager;