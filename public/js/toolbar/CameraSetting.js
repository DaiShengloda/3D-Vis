
CameraSetting = function(callback){
	this.cameras = {};
	this.loadAllCameras(callback);
};

mono.extend(CameraSetting,Object,{

	loadAllCameras: function(callback) {
		var self = this;
		ServerUtil.api('camera', 'search', {}, function(datas) {
			if (datas.length > 0) {
				var focusNode = main.sceneManager.viewManager3d.getFocusNode()||main.sceneManager.getCurrentRootNode();//有可能是地球
				var focusData = main.sceneManager.getNodeData(focusNode)||main.sceneManager._currentRootData;
				var category = main.sceneManager.dataManager.getCategoryForData(focusData);
				var resetCamera = false;
				for (var i = 0; i < datas.length; i++) {
					var data = datas[i];
					if (!data) {
						continue;
					}
					if (category && data.id === category.getId()) {
						resetCamera = true;
					}
					var cameraPosition = jsonUtil.string2Object(datas[i].position);
					var cameraTarget = jsonUtil.string2Object(datas[i].target);
					self.cameras[data.id] = {
						position: cameraPosition,
						target: cameraTarget
					};
				}
				if (resetCamera) {
					main.sceneManager.cameraManager.finalCameraFunction(
						main.sceneManager._currentScene,
						main.sceneManager._currentRootData, null, null, main.sceneManager.cameraManager.callback); //cameraSeting的查询是延迟的，有可能加载好之前已经调了
				}
				// camera.lookAt(new mono.Vec3(cameraTarget.x, cameraTarget.y, cameraTarget.z));
				// camera.setPosition(new mono.Vec3(cameraPosition.x, cameraPosition.y, cameraPosition.z));
			}
			callback && callback();
		});
	},

	getCameraByRootId : function(rootId){
		if(!rootId){
			return null;
		}
		return this.cameras[rootId];
	},

	saveOrUpdateCamera: function(cameraId, position, target, callback) {
		this.cameras[cameraId] = {position:jsonUtil.string2Object(position),target:jsonUtil.string2Object(target)};
		ServerUtil.api('camera', 'search', {
			id: cameraId
		}, function(datas) {
			if (datas.length > 0) {
				var updateCamera = {
					value: {
						position: position,
						target: target,
					},
					options: {
						id: cameraId,
					}
				};
				ServerUtil.api('camera', 'update', updateCamera, callback);
			} else {
				var addCamera = {
					id: cameraId,
					position: position,
					target: target
				};
				ServerUtil.api('camera', 'add', addCamera, callback);
			}
		});
	}

});