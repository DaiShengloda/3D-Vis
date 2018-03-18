var $WaterLeakManager = function () {
    var sm = main.sceneManager;
    var dm = sm.dataManager;
    var box = sm.network3d.getDataBox();
    // 缓存当前场景下所有漏水绳，key:rootDataId, value: 当前场景下的所有漏水绳3D对象
    var waterLeakNodeMap = {};
    // 缓存漏水绳与其3D对象， key: 漏水绳ID, value: 漏水绳3D对象
    var waterLeaksMap = {};
    var hasWaterLeak = false;
    var waterLeakMaterialFilter = new it.MaterialFilter();
    var virtualManager = main.sceneManager.viewManager3d.getDefaultEventHandler().getDefaultVirtual();
    var materialMap = {};
    var init = false;
    
    var waterLeakMap = null;


    function createPipeForOneArea(areaData){
        if(!areaData){
            return null;
        }
        var areaNode =sm.getNodeByDataOrId(areaData);
        if(!areaNode || !areaNode.path){
            return null;
        }
        var category = dm.getCategoryForData(areaData);
        if(!category || (category.getId().indexOf('area') <0 && category.getId().indexOf('room') <0)){
            return null;
        }

        var path = new mono.Path();
        var points = areaNode.path.points; // 由于area中的point的z为0，只有x,y，因此这里需将z=y，然后y=0

        var pathNode = make.Default.load({id:'twaver.idc.watercable', radius:20, data: pathData,color:'orange'});
       
        /*for(var i = 0;i < points.length;i ++){
            point = points[i];
            if(i == 0){
                path.moveTo(point.x,0,-(point.y));
            }else{
                path.lineTo(point.x,0,-(point.y ));
            }
        }
        point = points[0]
        path.lineTo(point.x ,0,-(point.y));

        var path = mono.PathNode.prototype.adjustPath(path,20,2);
        var pathNode = new mono.PathNode({
            path:path,
            radius:20,
        });
        pathNode.s({
            'm.color':'orange',
            'm.texture.image':'./images/pipeline/flow.jpg',
            'm.texture.repeat':new mono.Vec2(200,1),
        });*/
        pathNode.setParent(areaNode);
        var sign = make.Default.load('twaver.idc.water_leaking_sign');
        sign.setParent(pathNode);
        var point = path.getPointAt(0.2);
        sign.setScale(5,3,4)
        point.y -= 32;
        sign.p(point);
        sign.setClient('water_leak',true);
        sign.getChildren().forEach(function (child) {
            child.setClient('water_leak',true);
        });
        pathNode.setY(40);
        pathNode.setClient('water_leak',true);
        return pathNode;
    }

    function createPipeForWaterLeak (waterLeak,parentNode) {
       var pathData = waterLeak.path;
       //先用随机数是否为0来模拟是否漏水，四分之一的概率
       var pathNode;
        if (0) {//parseInt(Math.random() * 4) == 0
            pathNode = make.Default.load({
                id: 'twaver.idc.watercable',
                radius: 6,
                repeat: 100,
                data: pathData,
                color: '#42b9fa'
            });
            var path = pathNode.getPath();
            var sign = make.Default.load('twaver.idc.water_leaking_sign');
            sign.setParent(pathNode);
            var point = path.getPointAt(0.2);
            sign.setScale(1.3, 2.34, 1);
            // point.y -= 32;
            sign.p(point);
            sign.setClient('water_leak', true);
            sign.getChildren().forEach(function(child) {
                child.setClient('water_leak', true);
            });
        } else {
            pathNode = make.Default.load({
                id: 'twaver.idc.watercable',
                radius: 6,
                repeat: 100,
                data: pathData,
                color: '#d9c315'
            });
        }
        pathNode.setParent(parentNode);
        pathNode.p(parentNode.p().negate());
        pathNode.setY(20);
        pathNode.setClient('water_leak',true);
        pathNode.setClient('water_leak_id',waterLeak.id);
        waterLeaksMap[waterLeak.id] = pathNode;
       return pathNode;
    }

    function getPipeFromServer(callback){
        ServerUtil.api('water_leak_wire','find',{},function(result){
            // console.log('water_leak_wire:' + result);
            waterLeakMap = {};
            result.forEach(function(waterLeak){
                var parentId = waterLeak.parentId;
                var array = waterLeakMap[parentId];
                if(!array){
                    array = [];
                    waterLeakMap[parentId] = array;
                }
                array.push(waterLeak);
            });
            if(callback) callback();
            init = true;
        });
    }

	function createPipeForCurrentScene(){
		var node = sm._currentRootNode;
		var rootData = sm.getNodeData(node);
        
        if(isRoomData(rootData)){
            
            var pathNodes = waterLeakNodeMap[rootData.getId()];
            if(pathNodes){
                return pathNodes;
            }
            pathNodes = [];
            var waterLeaks = waterLeakMap ? waterLeakMap[rootData.getId()] : null;
            if(waterLeaks && waterLeaks.length > 0){
                waterLeaks.forEach(function(waterLeak){
                    var pathNode = createPipeForWaterLeak(waterLeak,node);
                    if(pathNode) {
                        pathNodes.push(pathNode);
                    }
                });
            }else{
                var children = rootData.getChildren();
                children.forEach(function(child){
                    var pathNode = createPipeForOneArea(child);
                    if(pathNode) {
                        pathNodes.push(pathNode);
                    }
                });
            }
            waterLeakNodeMap[rootData.getId()] = pathNodes;
            return pathNodes;  
        }
	}
    function createWaterLeakData(){
        var datas = dm.getDatas();
        var ids = [];
        var nodes = createPipeForCurrentScene();
        if(nodes == null || nodes.length < 1){
            return;
        }
        for(var i = 0 ; i < nodes.length ;i++){
            var node = nodes[i];
            node.setPositionZ(0);
            node.setPositionX(0);
            box.addByDescendant(node);
            ids.push(node.getClient('water_leak_id'));
        }
        for(var i in datas){
            var category = dm.getCategoryForData(datas[i]);
            if(category.getId() != 'floor' ){
                virtualManager.add(datas[i]);
            }
        }
        
        //sm.viewManager3d.addMaterialFilter(waterLeakMaterialFilter);
        sm.network3d.dirtyNetwork();
        hasWaterLeak = true;
        main.RealtimeDynamicEnviroManager.monitorWaterLeakWireData(ids);
    }

	function showWaterLeak () {
        if(!init) {
            getPipeFromServer(function(){
                createWaterLeakData();
            });
        }else{
            createWaterLeakData();
        }
	}

	function hideWaterLeak () {
        main.RealtimeDynamicEnviroManager.clearMonitorData();
		for(var id in waterLeakNodeMap){
            var nodes = waterLeakNodeMap[id];
            if(nodes == null || nodes.length < 1){
                continue;
            }
            for(var i = 0 ; i < nodes.length ;i++){
                var node = nodes[i];
                node.setParent(null); //需要先将其parent设置成null，否则下次进来的时候会随这parent(addByDescendant)一起加进来
                box.removeByDescendant(node);
            }
        }
        waterLeakNodeMap = {};
        waterLeaksMap = {};
        //waterLeakMaterialFilter.materialMap = {};
        //sm.viewManager3d.removeMaterialFilter(waterLeakMaterialFilter);
        virtualManager.clear();
        sm.network3d.dirtyNetwork();
        hasWaterLeak = false;
	}

    function toggleWaterLeak () {
        if(hasWaterLeak){
            hideWaterLeak();
        }else{
            showWaterLeak();
        }
    }

    function hasWaterLeaks(){
        return hasWaterLeak;
    }

	function isRoomData (data) {
        var dataId = data.getId();
        var dataType = dm.getDataTypeForData(data);
        var parameters = dataType.getModelParameters();
        if(mono.Utils.isArray(parameters)){
            return true;
        }
        return false;
    }

    function setData(id, data){
        setValue(id, data['waterLeak'])
    }

    function setValue(id,val){
        var pathNode = waterLeaksMap[id];
        if(!pathNode)return;
        val = Number(val);
        if(val > 10){
            var hasSign = false;
            var path = pathNode.getPath();
            var length = path.getLength();
            if(val > length){
                val = length;
            }
            var point = path.getPointAt(val/length);
            pathNode.getChildren().forEach(function(child) {
                if(child.getClient('water_leak')){
                    child.p(point);
                    hasSign = true;
                    return false;
                }
            });
            pathNode.setStyle('m.ambient', "#42b9fa");
            pathNode.setStyle('m.color', "#42b9fa");
            if(hasSign)return;
            var sign = make.Default.load('twaver.idc.water_leaking_sign');
            sign.setParent(pathNode);
            sign.setScale(1.3, 2.34, 1);
            // point.y -= 32; 为什么要减32，减了第一次就看不到了
            sign.p(point);
            sign.setClient('water_leak', true);
            sign.getChildren().forEach(function(child) {
                child.setClient('water_leak', true);
            });
            box.addByDescendant(sign);
        } else {
            pathNode.setStyle('m.ambient', "#d9c315");
            pathNode.setStyle('m.color', "#d9c315");
            pathNode.getChildren().forEach(function(child) {
                if(child.getClient('water_leak')){
                    child.setParent(null);
                    box.removeByDescendant(child);
                }
            });
        }
        
    }

    return {
        showWaterLeak : showWaterLeak,
        hideWaterLeak : hideWaterLeak,
        toggleWaterLeak : toggleWaterLeak,
        hasWaterLeak : hasWaterLeaks,
        waterLeakNodeMap:waterLeakNodeMap,
        setValue : setValue,
        setData : setData,
    };
};

it.WaterLeakManager = $WaterLeakManager;