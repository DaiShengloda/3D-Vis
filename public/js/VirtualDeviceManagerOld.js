var VirtualDeviceManager = function () {
	this.virtualDeviceMap = {};
	this.loadData();
	this.dirtyMap = {};
	this.initSocket();
};

mono.extend(VirtualDeviceManager, Object, {
	initSocket: function () { // 考虑数据的增加
		
	},
	loadData: function () {
		var self = this;
		ServerUtil.api('virtual_device', 'search', {}, function (result) {
			result.forEach(function (item) {
				var dataId = item.parentId;
				var virtualDevices = self.virtualDeviceMap[dataId];
				if (virtualDevices == null) {
					virtualDevices = self.virtualDeviceMap[dataId] = [];
				}
				virtualDevices.push(item);
			});
		});
	},

	initListener: function () {
		var self = this;
		main.sceneManager.viewManager3d.addPropertyChangeListener(function (event) {
			if (event.property == "focusNode") {
				var oldNode = event.oldValue;
				self.hideVirtualDeviceNodes(oldNode);
			}
		});
		self._initedListener = true;
	},

	createVirtualDeviceNode: function (item, pbb) {
		var dataTypeId = item.dataTypeId;
		var dataType = main.sceneManager.dataManager.getDataTypeById(dataTypeId);
		var node = this.loadModel(dataType, pbb);
		node.setClient('virtual_device', item);
		return node;
	},

	getDialogPanel: function () {
		if (!this._dialogPanel) {
			this._dialogPanel = $('<div id="virtualDevicePanel" class="" title="虚拟机信息">');
			this._dialogPanel.appendTo($(document.body));
			var dp = this._dialogPanel;
			this._dialogPanel.dialog({
				blackStyle: true,
				resize: false,
				height: 500,
				width: 600,
				closeOnEscape: true,
				show: false,
				hide: false,
				autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
				resizable: false, //设置是否可拉动弹窗的大小，默认为true
				modal: true, //是否有遮罩模型
				buttons: [{
					text: it.util.i18n("VirtualDeviceManager_Close"),
					click: function () {
						dp.dialog('close');
					}
				}]
			});
		}
		return this._dialogPanel;
	},

	showVirtualDeviceInfo: function (deviceNode) {
		var virtualDevice = deviceNode.getClient('virtual_device');
		var panel = this._createVirtualDevicePanel(virtualDevice);
		if (!this._dialogPanel) {
			var dp = this._dialogPanel = $('<div id="virtualDevicePanel" class="" title="虚拟机信息">').append(panel).appendTo($(document.body));
			this._dialogPanel.dialog({
				blackStyle: true,
				resize: false,
				height: 'auto',
				width: 'auto',
				closeOnEscape: false,
				show: false,
				hide: false,
				autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
				resizable: false, //设置是否可拉动弹窗的大小，默认为true
				modal: true, //是否有遮罩模型
				buttons: []
			});
		}
		this._dialogPanel.dialog('open');
	},

	_createVirtualDevicePanel: function (virtualDevice) {
		var self = this;
		if (self.vdInfoMainPane) {
			var vdInfoMainPane = self.vdInfoMainPane;
			self.vdInfoMainPane.empty();
			self.vdInfoMainPane.show();
		} else {
			var vdInfoMainPane = self.vdInfoMainPane = $('<div id ="vdInfoPane" class="vd-info-panel"></div>').css({'min-width':'220px'});
		}
		// var closeDiv = $('<div class="vd-info-title-panel"></div>').appendTo(vdInfoMainPane);
		// var btnclose = $('<div class="close"></div>').appendTo(closeDiv);
		// var titleDiv = $('<span></span>').appendTo(closeDiv);

		// btnclose.click(function (e) {
		// 	self.vdInfoMainPane.hide();
		// });

		var vdInfoPane = $('<div class="vd-info-content-panel scroll-class"></div>').appendTo(vdInfoMainPane);

		this._addItem(it.util.i18n('VirtualDeviceManager_#'), virtualDevice.id, null, null, 'left').appendTo(vdInfoPane);
		this._addItem(it.util.i18n("VirtualDeviceManager_Name"), virtualDevice.name, null, null, 'left').appendTo(vdInfoPane);
		this._addItem('CPU', virtualDevice.cpu, null, null, 'left').appendTo(vdInfoPane);
		this._addItem(it.util.i18n("VirtualDeviceManager_Memory"), virtualDevice.memory, null, null, 'left').appendTo(vdInfoPane);
		this._addItem(it.util.i18n("VirtualDeviceManager_Hard_disk"), virtualDevice.disk, null, null, 'left').appendTo(vdInfoPane);
		this._addItem(it.util.i18n("VirtualDeviceManager_System_disk"), virtualDevice.systemDisk, null, null, 'left').appendTo(vdInfoPane);
		this._addItem(it.util.i18n("VirtualDeviceManager_IP"), virtualDevice.ip, null, null, 'left').appendTo(vdInfoPane);
		this._addItem(it.util.i18n("VirtualDeviceManager_Operating_system"), virtualDevice.os, null, null, 'left').appendTo(vdInfoPane);
		this._addItem(it.util.i18n("VirtualDeviceManager_Bandwidth"), virtualDevice.bandWidth, null, null, 'left').appendTo(vdInfoPane);

		var client = virtualDevice.client;
		if (typeof client == 'string') {
			try {
				client = JSON.parse(client);
			} catch (e) {
				if (client != null && client.trim() != '') {
					this._addItem(it.util.i18n("VirtualDeviceManager_Extend"), client).appendTo(vdInfoPane);
				}
				console.log(e);
			}
		}
		for (var label in client) {
			this._addItem(label, client[label]).appendTo(vdInfoPane);
		}

		return vdInfoMainPane;

		// var rootDiv = $('<div class="panel panel-default"></div>');
		// rootDiv.css("margin", "5px");
		// var title = it.util.i18n("VirtualDeviceManager_Virtual_machine") + '(' + virtualDevice.id + ',' + virtualDevice.name + ')' + it.util.i18n("VirtualDeviceManager_Detail");
		// var titleDiv = $('<div class="panel-heading" style="text-align:center"> <h3 class="panel-title">' + title + '</h3></div>').appendTo(rootDiv);
		// var contentDiv = $('<div class="panel-body"></div>').appendTo(rootDiv).css({ 'border-style': 'none', "paddingTop": "10px" });
		// var container = $('<div class="container-fluid"></div>').appendTo(contentDiv).css('width', '95%');

		// createRow('#', virtualDevice.id);
		// createRow(it.util.i18n("VirtualDeviceManager_Name"), virtualDevice.name);
		// createRow('CPU', virtualDevice.cpu);
		// createRow(it.util.i18n("VirtualDeviceManager_Memory"), virtualDevice.memory);
		// createRow(it.util.i18n("VirtualDeviceManager_Hard_disk"), virtualDevice.disk);
		// createRow(it.util.i18n("VirtualDeviceManager_System_disk"), virtualDevice.systemDisk);
		// createRow(it.util.i18n("VirtualDeviceManager_IP"), virtualDevice.ip);
		// createRow(it.util.i18n("VirtualDeviceManager_Operating_system"), virtualDevice.os);
		// createRow(it.util.i18n("VirtualDeviceManager_Bandwidth"), virtualDevice.bandWidth);

		// var client = virtualDevice.client;
		// if (typeof client == 'string') {
		// 	try {
		// 		client = JSON.parse(client);
		// 	} catch (e) {
		// 		if (client != null && client.trim() != '') {
		// 			createRow(it.util.i18n("VirtualDeviceManager_Extend"), client);
		// 		}
		// 		console.log(e);
		// 	}
		// }
		// for (var label in client) {
		// 	createRow(label, client[label]);
		// }

		// function createRow(label, value) {
		// 	value = value || ' ';
		// 	var row = $('<div class="row"><label class="col-md-3" style = "text-align:right;padding:4px;line-height:30px;">' + label + '</label><label class="col-md-8" style="border: 1px solid #eeeeee;border-radius: 2px;padding:4px 5px;min-height:29px;margin-left:5px;line-height:22px;">' + value + '</label></div>').appendTo(container);
		// 	return row;
		// }

		return rootDiv;
	},

	_addItem: function (key, val, lbId, callback, align) {
		if (!key) return null;
		var row = $('<div class="form-group-no-margin"> </div>'); // not <tr>
		var label_Name = $('<label class="col-sm-5 label-min">' + key + ':</label>');
		row.append(label_Name);
		var valText = val;
		align = align || 'right';
		var label_Value = $('<label ' + (lbId ? 'id = ' + lbId : '') + '  class="col-sm-7 label-value text-align-' + align + '">' + valText + '</label>');
		row.append(label_Value);
		if (callback) {
			row.click(callback);
		}
		return row;
	},

	showVirtualDeviceNodes: function (dataOrId) {
		if (!this._initedListener) {
			this.initListener();
		}
		var dataId = dataOrId;
		if (dataId.getId) {
			dataId = dataId.getId();
		}
		var virtualDevices = this.virtualDeviceMap[dataId]
		if (virtualDevices == null || virtualDevices.length == 0) {
			return;
		}
		var data = main.sceneManager.dataManager.getDataById(dataId);
		var node = main.sceneManager.getNodeByDataOrId(dataId);
		var box = main.sceneManager.network3d.getDataBox();
		var self = this;
		// virtualDevicesBase.setScale
		if (node._virtualDeviceNodes == null) { //初始化
			make.Default.load({ "id": "twaver.scene.virtualdevicebase" }, function (vdb) {
				node._virtualDevicesBoottomNode = vdb;
				node._virtualDevicesBoottomNode.setScale(0.038, 0.038, 0.038);

				var node_bb = node.getBoundingBox();
				var vdb_bb = vdb.getBoundingBox();
				var vdb_py = node_bb.max.y + vdb_bb.max.y * 0.038;
				node._virtualDevicesBoottomNode.setPositionY(vdb_py);

				var nodes = [];
				virtualDevices.forEach(function (item) {
					nodes.push(self.createVirtualDeviceNode(item, vdb_bb));
				});
				node._virtualDeviceNodes = nodes;
				// TODO 计算位置

				var pw = vdb_bb.max.x - vdb_bb.min.x,
					pz = vdb_bb.max.z - vdb_bb.min.z;
				var xOffset = pw * 0.46 / 6,
					zOffset = (pz - pw * 0.54) / 6;
				for (var i = 0; i < node._virtualDeviceNodes.length; i++) {
					if (i > 8) {
						return;
					}
					var deviceNode = node._virtualDeviceNodes[i];
					var bb = deviceNode.getBoundingBox();
					var x = vdb_bb.max.x - bb.max.x - xOffset,
						y = vdb_bb.max.y + bb.max.y,
						z = vdb_bb.max.z - bb.max.z - zOffset;
					deviceNode.p(x, y, z);
					if ((i + 1) % 3 == 0) {
						xOffset = pw * 0.46 / 6;
						zOffset += (pz - pw * 0.54) / 3 + bb.max.z - bb.min.z;
					} else {
						xOffset += pw * 0.46 / 3 + bb.max.x - bb.min.x;
					}
				}

				box.add(node._virtualDevicesBoottomNode);
				node._virtualDevicesBoottomNode.setParent(node);

				node._virtualDeviceNodes.forEach(function (deviceNode) {
					box.addByDescendant(deviceNode);
					deviceNode.setParent(node._virtualDevicesBoottomNode);
				});
				return
			});
		}
		if (node._virtualDeviceNodes) {
			box.add(node._virtualDevicesBoottomNode);
			node._virtualDevicesBoottomNode.setParent(node);

			node._virtualDeviceNodes.forEach(function (deviceNode) {
				box.addByDescendant(deviceNode);
				deviceNode.setParent(node._virtualDevicesBoottomNode);
			});
		}
	},

	hideVirtualDeviceNodes: function (node) {
		var box = main.sceneManager.network3d.getDataBox();
		if (node && node._virtualDeviceNodes) {

			box.remove(node._virtualDevicesBoottomNode);
			node._virtualDevicesBoottomNode.setParent(null);

			node._virtualDeviceNodes.forEach(function (deviceNode) {
				box.removeByDescendant(deviceNode);
				deviceNode.setParent(null);
			});
		}
	},

	loadModel: function (dataType, pbb) {
		var sideLength = (pbb.max.x - pbb.min.x) * 0.18;
		var cubeP = new mono.Cube(sideLength, sideLength, sideLength, 1, 1, 1, 'six-each');
		cubeP.s({
			'm.type': 'phong',
			// 'm.color': '#B3B3B3',
			'm.transparent': true,
			// 'm.opacity': .5,
			// 'm.ambient': '#B3B3B3',
			'm.texture.wrapS': mono.ClampToEdgeWrapping,
			'm.texture.wrapT': mono.ClampToEdgeWrapping,
			'm.texture.image': './images/vd_outline_cube.png'

		});
		var sideLength2 = sideLength * 0.9;
		var cube = new mono.Cube(sideLength2, sideLength2, sideLength2, 1, 1, 1, 'six-each'); // for test
		cube.s({
			'm.type': 'phong',
			'm.transparent': false,
			'm.texture.wrapS': mono.ClampToEdgeWrapping,
			'm.texture.wrapT': mono.ClampToEdgeWrapping,
			'm.texture.image': './images/vd_inline_cube.png'
		});

		cube.setParent(cubeP);
		return cubeP;
		// var model = dataType.getModel(),
		// 	modelParameters = dataType.getModelParameters();
		// var params = JSON.parse(JSON.stringify(modelParameters));
		// return main.sceneManager.loadModel(model,modelParameters);
	},
});

main.virtualDeviceManager = new VirtualDeviceManager();