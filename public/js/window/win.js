(function (window) {
    if (!it.win) {
        it.win = {};
    }
    var win = it.win;

    /**
     * @function save 保存当前镜头位置
     * @return {void} 
     */
    function save(type) {
        var camera = main.sceneManager.network3d.getCamera();
        var cameraId = main.sceneManager._currentScene._id;
        if (type == 'data') {
            cameraId = main.sceneManager._currentRootData.getId();
        } else if (type == 'dataType') {
            cameraId = main.sceneManager._currentRootData.getDataTypeId();
        } else if (type == 'category') {
            var dt = main.sceneManager.dataManager.getDataTypeForData(main.sceneManager._currentRootData);
            cameraId = dt.getCategoryId();
        }
        var p = camera.p();
        var t = camera.t();
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

        main.cameraSetting.saveOrUpdateCamera(cameraId, cameraPos, cameraTar);
    }

    function getCameraParam(id) {
        var cameraMap = main.cameraSetting.cameras;
        if (cameraMap[id]) return cameraMap[id];
        var dt = main.sceneManager.dataManager.getDataTypeForData(id);
        var dtId = dt.getId();
        if (cameraMap[dtId]) return cameraMap[dtId];
        var cid = dt.getCategoryId();
        if (cameraMap[cid]) return cameraMap[cid];
        return null;
    }
    /**
     * @function reset 恢复默认位置，如果打开了温湿度云图之类的，还需要退出。
     * @return {void} {description}
     */
    function reset(callback) {
        // main.sceneManager.viewManager3d.getDefaultEventHandler().cameraInfoStack = [];// 清空look前的堆栈
        main.navBarManager.appManager.reset(true, true);
        // main.navBarManager.appManager.itvToggleBtn.hide();
        var camera = main.sceneManager.viewManager3d.network.getCamera();
        var params = getCameraParam(main.sceneManager._currentRootData.getId());
        if(!params){
            console.warn('没有找到保存的镜头位置');
        }
        // it.util.playCameraAnimation(camera, pos, target, delay, time, interval, callback) 
        var p = new mono.Vec3(params.position.x, params.position.y, params.position.z);
        var t = new mono.Vec3(params.target.x, params.target.y, params.target.z);
        it.util.playCameraAnimation(camera, p, t, 0, 500, 0, callback)
    }

    win.save = save;
    win.reset = reset;
})(window)