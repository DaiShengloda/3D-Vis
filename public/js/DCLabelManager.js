//Billboard标示管理，应该抽象为基于场景的标示管理，更加通用。

var DCLabelManager = it.DCLabelManager = function (sceneManager) {
	this.sceneManager = sceneManager || main.sceneManager;
	this.billboardMap = {};
	// this.billboardVisibleMap = {};
	this.checkboxMap = {};
	this.dcLabes = main.dcLabes || [];
	this.huanCun = {};
	this.categoryMaps = [];

	this.dataManager = this.sceneManager.dataManager;
	this.box = this.sceneManager.network3d.getDataBox();
	this.allCatsMap = this.sceneManager.dataManager._categoryMap;
	this.allDataTypeMap = this.sceneManager.dataManager._dataTypeMap;
	this.allDatas = this.sceneManager.dataManager._datas;

	this.isInit = false;

	var self = this;
	this.sceneManager.cameraManager.addAfterPlayCameraListener(function (scene, rootData, oldScene, oldRootData) {
		self.onSceneChange(scene, rootData, oldScene, oldRootData);
	});
	this.sceneManager.viewManager3d.addPropertyChangeListener(function (event) {
		self.onFocusChange(event);
	})
};

mono.extend(DCLabelManager, Object, {

	_init: function(){
		// console.time('计算')
		this._makePrepare();
		this._getBillboardData();
		// console.timeEnd('计算')
		// console.time('绘图')
		this._createBillboards();
		// console.timeEnd('绘图')
		this.hideLabel();
	},

	_makePrepare: function () {
		var self = this;
		this.boxes = ['room', 'rack', 'equipment', 'airConditioning', 'camera', ];
		var allCatsMap = this.sceneManager.dataManager._categoryMap;
		this.dcLabes.forEach(function (options) {
			var text = options.text;
			self.huanCun[text] = [];
			for (var i = 0; i < self.boxes.length; i++) {
				self.huanCun[text].push({
					'name': allCatsMap[self.boxes[i]]._description,
					'sum': 0,
					'categoryId': self.boxes[i]
				})
			}
		});
	},

	onSceneChange: function (scene, rootData, oldScene, oldRootData) {
		if (scene && scene.getId() == 'dataCenter') {
			if(!this.isInit){
				this._init();
				this.isInit = true;
			}
			if ((oldScene && oldScene._id != 'floor') || !oldScene) {
				this.showLabel();
			}
		} else if (scene && scene.getId() == 'earth') {
			this.hideLabel();
		}
	},

	onFocusChange: function (event) {
		if (event.property == "focusNode") {
			var oldData = this.sceneManager.getNodeData(event.oldValue);
			if (!oldData) {
				return;
			}
			var oldCategory = this.sceneManager.dataManager.getCategoryForData(oldData);
			var oldCategoryId = oldCategory.getId();
			var scene = this.sceneManager._currentScene;
			if (scene != undefined) {
				var sceneCategoryId = scene.getCategoryId();
			}
			if (oldCategoryId == 'dataCenter' && (sceneCategoryId == 'dataCenter' || sceneCategoryId == 'floor')) {
				this.hideLabel();
			} else if (oldCategoryId == 'building' && sceneCategoryId == 'dataCenter') {
				this.showLabel();
			}
			var newData = this.sceneManager.getNodeData(event.newValue);
			var newCategory = this.sceneManager.dataManager.getCategoryForData(newData);
			var newCategoryId = newCategory.getId();
			if (oldCategoryId == 'floor' && newCategoryId == 'building') {
				main.panelMgr.invoke('BreadcrumbMgr', 'updateBreadcrumb', [newData]);
			}
		}
	},

	_createBillboards: function () {
		var self = this;
		if (this.dcLabes.length < 1) {
			console.log('没有园区面板');
			return;
		}
		this.dcLabes.forEach(function (options) {
			var text = options.text;
			var billboard = self._createBillboard(options);
			self.billboardMap[text] = billboard;
			// self.billboardVisibleMap[text] = true;
			thisBuildingId = self._getBuildingIdByName(text);
			// console.log(thisBuildingId)
			billboard.setClient('it_data_id', thisBuildingId);
			billboard.setClient('it_data', self.dataManager.getDataById(thisBuildingId));
		});
	},

	_createBillboard: function (options) {
		var text = options.text,
			position = options.position;
		if (text == null || text == '') {
			return;
		}
		if (position == null) {
			position = [0, 0, 0];
		}
		if (mono.Utils.isArray(position)) {
			var str = this._getBillboardDataToString(text);
			var text = it.util.i18n("DCLabelManager_"+options.text),
			billboard = it.util.makeTextBillboardWithArrow.createBillboard({
				arrowPosition: 'down',
				text: text + str,
				scale: options.scale,
				globalAlpha: 0.9,
			});
			billboard.setPosition(new mono.Vec3(position[0], position[1], position[2]));
			billboard.s({
				'm.fixedSize': 7000,
			})
			return billboard;
		} 
	},

	_getBillboardDataToString: function (buildingName) {
		var theObj = this.huanCun[buildingName];
		var str = '';
		theObj.forEach(function (ele) {
			if (ele.name && ele.sum != 0) {
				str += '\n ' + ele.name + '：' + ele.sum;
			}
		})
		return str;
	},

	_getBuildingIdByName: function (buildingName) {
		var thisBuilding;
		var allBuildingDatas = this.dataManager.getDataMapByCategory('building');
		for (var key in allBuildingDatas) {
			if (key == buildingName||allBuildingDatas[key]._name == buildingName||allBuildingDatas[key].description == buildingName) {
				thisBuilding = allBuildingDatas[key]._id;
			}
		}
		return thisBuilding;
	},

	_getBillboardData: function () {
		for (var i = 0; i < this.allDatas.length; i++) {
			var thisCatgory = this.sceneManager.dataManager.getCategoryForData(this.allDatas[i]);
			var thisCatgoryId = thisCatgory._id;
			if (this.boxes.indexOf(thisCatgoryId) > -1) {
				var thisBuildingName = this._findDataBuildingName(this.allDatas[i]);
				if (thisBuildingName) {
					var array = this.huanCun[thisBuildingName];
					if (array && array.length > 0) {
						for (var j = 0; j < array.length; j++) {
							if (array[j].categoryId == thisCatgoryId) {
								array[j].sum += 1;
								break;
							}
						}
					}
				} else {
					continue;
				}
			}
		}
	},

	_findDataBuildingName: function (data) {
		var thisCatgory = this.sceneManager.dataManager.getCategoryForData(data);
		if (thisCatgory._id != 'building') {
			var parentId = data._parentId
			var parentData = this.sceneManager.dataManager.getDataById(parentId);
			if (parentId && parentData) {
				return this._findDataBuildingName(parentData);
			} else {
				return false;
			}
		} else {
			return data._id;
		}
	},

	_isAncestor: function (oldId, youngId) {
		var dataManager = this.sceneManager.dataManager;
		var middleId;
		var youngNode = dataManager.getDataById(youngId);
		if (youngNode && youngNode.getParentId()) {
			if (youngNode.getParentId() == oldId) return true;
			else return this._isAncestor(oldId, youngNode.getParentId())
		} else {
			return false;
		}
	},

	showLabel: function () {
		for(var i in this.billboardMap){
			this.box.add(this.billboardMap[i])
		}
	},

	hideLabel: function () {
		for(var i in this.billboardMap){
			this.box.remove(this.billboardMap[i])
		}
	},

	forEach: function (func, object, args) {
		object = object || this.billboardMap;
		args = args || [];
		if (object instanceof mono.Billboard) {
			var newArgs = args.slice(0);
			newArgs.unshift(object);
			return func.apply(this, newArgs);
		}
		for (var property in object) {
			var billboard = object[property];
			var newArgs = args.slice(0);
			newArgs.push(property);
			if (billboard) {
				this.forEach(func, billboard, newArgs);
			}
		}
	},
});