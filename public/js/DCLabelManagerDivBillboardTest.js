//Billboard标示管理，应该抽象为基于场景的标示管理，更加通用。

var DCLabelManager = it.DCLabelManager = function (sceneManager) {
	this.sceneManager = sceneManager || main.sceneManager;
	this.network = this.sceneManager.network3d;
	this.camera = this.network.getCamera();
	this.billboardMap = [];
	this.dcLabes = main.dcLabes || [];
	this.dcLabesCategory = main.dcLabesCategory || ['room', 'rack', 'equipment', 'airConditioning', 'camera', ];
	this._visibleFlag = false;
	this.parent = $('.view-control');
	this.createLabels();
	this.hideLabel();
	var self = this;
	this.sceneManager.addSceneChangeListener(function (sceneData) {
		self.onSceneChange(sceneData);
	});
};

mono.extend(DCLabelManager, Object, {
	toggle: function () {
		if (this._visibleFlag) {
			this.hideLabel();
		} else {
			this.showLabel();
		}
	},

	showLabel: function () {
		for(var i=0; i<this.billboardMap.length; i++){
			this.billboardMap[i].div.show();
		}
		this._visibleFlag = true;
		var self = this;
		this.camera.addPropertyChangeListener(this.updataLabelsPosition, this);
	},

	hideLabel: function () {
		for(var i=0; i<this.billboardMap.length; i++){
			this.billboardMap[i].div.hide();
		}
		this._visibleFlag = false;
		var self = this;
		this.camera.removePropertyChangeListener(this.updataLabelsPosition, this);
	},

	onSceneChange: function (sceneData) {
		var scene = sceneData.data;
		// var self = this;
		// if (scene.getCategoryId().toLowerCase() == 'datacenter') {
		// 	this.camera.addPropertyChangeListener(self.labelListener);
		// } else {
		// 	this.camera.removerPropertyChangeListener(self.labelListener);
		// }
	},

	createLabels: function () {
		for (var i = 0; i < this.dcLabes.length; i++) {
			var options = this.dcLabes[i];
			this.createLabel(options);
		}
	},

	createLabel: function (options) {
		var div = $('<div>').addClass('dcLabel');
		var labelContent = {};
		labelContent.title = options.text;
		labelContent.content = this.getLabelLineData(labelContent.title);
		for (var i = 0; i < labelContent.content.length; i++) {
			if (labelContent.content[i].sum == 0) {
				labelContent.content[i]._visible = false;
			} else if (labelContent.content[i].sum > 0) {
				labelContent.content[i]._visible = true;
			}
		}
		div.LabelBillboard({
			title: labelContent.title,
			content: labelContent.content,
		});
		this.parent.append(div);
		this.billboardMap.push({
			title: labelContent.title,
			content: labelContent.content,
			div: div,
		});
		this.updataLabelsPosition();
	},

	updataLabelsPosition: function () {
		for (var i = 0; i < this.billboardMap.length; i++) {
			var position = this.getTwoPosition(this.billboardMap[i].title);
			var height = this.billboardMap[i].div.children().height();
			var width = this.billboardMap[i].div.children().width();
			this.billboardMap[i].div.css({
				'left': position.x - (width - 20),
				'top': position.y - height,
			})
		}
	},

	getTwoPosition: function (buildingName) {
		var position3d = [];
		for (var i = 0; i < this.dcLabes.length; i++) {
			if (this.dcLabes[i].text == buildingName) {
				position3d = this.dcLabes[i].position;
				break;
			}
		}
		var position2d = this.network.getViewPosition(new mono.Vec3(position3d[0], position3d[1], position3d[2]));
		return position2d;
	},

	// getThreePosition: function (buildingName) {
	// 	// 3d位置直接在scene.js里面写了。。。数据库里面的123号building才有data数据
	// 	var buildingId = this.getBuildingDataByName(buildingName);
	// 	var data = this.sceneManager.dataManager.getDataById(buildingId);
	// 	var position3d = data._position;
	// 	return position3d;
	// },

	getBuildingDataByName: function (buildingName) {
		var buildingId;
		var sceneDatas = this.sceneManager.getSceneDatas();
		for (var scene in sceneDatas) {
			if (sceneDatas[scene]._name == buildingName) {
				buildingId = sceneDatas[scene]._id;
			}
		}
		return buildingId;
	},

	getLabelLineData: function (buildingName) {
		var boxes = this.dcLabesCategory;
		var datamanager = this.sceneManager.dataManager;
		var allCatsMap = this.sceneManager.dataManager._categoryMap;
		var allDataTypeMap = this.sceneManager.dataManager._dataTypeMap;
		var allDatas = this.sceneManager.dataManager._datas;
		var thisBuilding;
		thisBuilding = this.getBuildingDataByName(buildingName);
		var theCategorys = [];
		var allDataType = [];
		for (var i = 0; i < boxes.length; i++) {
			allDataType = [];
			theCategorys[i] = {};
			theCategorys[i].sum = 0;
			for (var cat in allCatsMap) {
				if (allCatsMap[cat]._id == boxes[i]) {
					theCategorys[i].name = allCatsMap[cat]._description;
					for (var datatype in allDataTypeMap) {
						if (allDataTypeMap[datatype]._categoryId == boxes[i]) {
							allDataType.push(allDataTypeMap[datatype]._id)
						}
					}
					for (var data in allDatas) {
						if ((allDataType.indexOf(allDatas[data]._dataTypeId) != -1) && this.isAncestor(thisBuilding, allDatas[data]._id)) {
							theCategorys[i].sum += 1;
						}
					}
				}
			}
		}
		return theCategorys;
	},

	isAncestor: function (oldId, youngId) {
		var datamanager = this.sceneManager.dataManager;
		var middleId;
		var youngNode = datamanager.getDataById(youngId);
		if (youngNode && youngNode.getParentId()) {
			if (youngNode.getParentId() == oldId) return true;
			else return this.isAncestor(oldId, youngNode.getParentId())
		} else {
			return false;
		}
	},

});