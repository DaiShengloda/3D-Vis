
var $SaveCameraBar = function (sceneManager) {
	it.ToolBarButton.call(this);
	this.sceneManager = sceneManager;
	if (main.cameraSetting) {
		this.cameraSetting = main.cameraSetting;
	} else {
		this.cameraSetting = main.cameraSetting = new CameraSetting();
	}
	this.init();
};

mono.extend($SaveCameraBar, it.ToolBarButton, {

	init: function () {
		var self = this;
		this.button.click(function () {
			self.action();
		});
	},
	action: function () {
		var self = this;
		var focuseNode = self.sceneManager.viewManager3d.getFocusNode() || self.sceneManager.getCurrentRootNode();
		var focuseData = self.sceneManager.getNodeData(focuseNode) || self.sceneManager._currentRootData;
		var sceneView = self.sceneManager.getCurrentSceneView();
		var camera = self.sceneManager.network3d.getCamera();
		if (sceneView && sceneView.getNetwork3D() != self.sceneManager.network3d) {
			focuseData = self.sceneManager._currentRootData;
			focuseNode = self.sceneManager._focusNode;
			if (sceneView.getCamera()) {
				camera = sceneView.getCamera();
			}
		}
		var category = self.sceneManager.dataManager.getCategoryForData(focuseData);
		if (!category) {
			return;
		}
		var cameraId = category.getId();
		// var cameraId = self.sceneManager._currentScene._id;
		var p = camera.p();
		var t = camera.t();
		var rootNode = focuseNode || self.sceneManager.getCurrentRootNode();
		if (rootNode) {
			var rootNodeCenter = it.Util.getNodeCenterPosition(rootNode);
			t = rootNode.worldToLocal(t);
			p = rootNode.worldToLocal(p);
			// rotation = rootNode.getRotation();
		}
		if (localStorage) {
			var cameraKey = "camera";
			var cameraString = localStorage.getItem(cameraKey);
			var cameraObject;
			if (cameraString && cameraString != "") {
				cameraObject = jsonUtil.string2Object(cameraString);
			} else {
				cameraObject = {};
			}
			cameraObject[cameraId] = {
				position: {
					x: p.x,
					y: p.y,
					z: p.z
				},
				target: {
					x: t.x,
					y: t.y,
					z: t.z
				}
			};
			localStorage.setItem(cameraKey, jsonUtil.object2String(cameraObject));
		}
		var cameraPos = jsonUtil.object2String({
			x: p.x,
			y: p.y,
			z: p.z
		});
		var cameraTar = jsonUtil.object2String({
			x: t.x,
			y: t.y,
			z: t.z
		});
		//如果是floor或room的话除了更新最后一个的相对位置外还保存自己的位置(也是相对)
		self.cameraSetting.saveOrUpdateCamera(cameraId, cameraPos, cameraTar, function () {
			layer.msg(it.util.i18n("CameraSetting_Save_success"));
		});
		if (category.getId() == 'floor' || category.getId() == 'room' || category.getId().toLowerCase() == 'datacenter') {
			self.cameraSetting.saveOrUpdateCamera(focuseData.getId(), cameraPos, cameraTar);
		}
	},

	getClass: function () {
		return "save-viewport-image";
	},

	getTooltip: function () {
		return it.util.i18n("save_camera");
	},


});

it.SaveCameraBar = $SaveCameraBar;
