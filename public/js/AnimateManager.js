/**
 * 动画管理类，镜头管理也放到这里面
 * @constructor
 */
it.AnimateManager = function(sceneManager) {
    this.sceneManager = sceneManager;
    this.dataManager = this.sceneManager.dataManager;
    this.visibleManager = new it.VisibleManager(this.sceneManager);
    this.defaultVirture = this.sceneManager.viewManager3d.getDefaultVirtualMaterialFilter();
    this.floors = [];
    this.animates = [];
//    this.isAnimate = false;
    //设置一个暂停的标记，因为dc-building的动画是延迟执行的，有可能还没有执行就跳到其他的场景了，此时那些没有执行的动画就不应该执行
    this.stopAnimate = false;
    this.skipAnimate = false;
    this.init();
};

mono.extend(it.AnimateManager, Object, {

    /**
     * 把动画放到SceneChangeListener中，可是调用SceneChange后，还有个_onLoadFinish,这个里面才将位置，镜头等设置好；
     * 而动画的执行很有可能是在_onLoadFinish之后。
     */
    init: function () {
        this.sceneManager.viewManager3d.addVisibleFilter(this.visibleManager);
        var self = this;
        var orgIsNeedSetParent = this.sceneManager.isNeedSetParent;
        this.sceneManager.isNeedSetParent = function (data, node) {
            if (orgIsNeedSetParent && !orgIsNeedSetParent.call(self.sceneManager, data, node)) {
                return false;
            }
            if (data && node) {
                var currentScene = self.sceneManager.getCurrentScene();
                var scId = currentScene ? currentScene.getCategoryId().toLowerCase() : '';
                var category = self.sceneManager.dataManager.getCategoryForData(data);
                if (category && category.getId() == 'floor'
                    && scId.indexOf('datacenter') < 0) {
                    return false;
                }
                if (category && category.getId().toLowerCase()== 'datacenter') {
                    return false;
                }
            }
            return true;
        }
        //位置是在afterSceneChange后才执行的
        // this.sceneManager.addSceneChangeListener(this.sceneChangeHandler, this);
        var cameraManager = this.sceneManager.cameraManager;
        cameraManager.onloadFinishFunction = function(scene, rootData,oldScene,oldRootData,callback){
            // self.sceneManager.network3d.zoomEstimateOverview(60); //  不让镜头乱跳
            callback && callback(); 
            // 不可用下面的方式，否则地球到园区那块会乱
            // var posAndTarget = it.Util.getEstimateOverviewPositionAndTarget(self.sceneManager.network3d,60);
            // if (posAndTarget) {
            //     mono.Utils.playCameraAnimation(self.sceneManager.network3d.getCamera(), posAndTarget.position, posAndTarget.target, 1000, callback);
            // }else{
            //     callback && callback();
            // }
        }

        cameraManager.doAnimateFunction = function(scene, rootData,oldScene,oldRootData,callback,clientMap){
            self.sceneChangeHandler(scene, rootData,oldScene,oldRootData,callback);
        }


        cameraManager.finalCameraFunction = function(scene, rootData, oldScene, oldRootData, callback,clientMap) {
            var cameraId = main.sceneManager._currentScene.getCategoryId();
            var camera = main.sceneManager.getCurrentCamera();
            if (!camera) {
                callback && callback.call(cameraManager,scene, rootData, oldScene, oldRootData,clientMap);
                return ;
            }
            var cameraObj = null;
            var isAbsolutePos = false;
            if (rootData && main.cameraSetting.getCameraByRootId(rootData.getId())) {
                cameraObj = main.cameraSetting.getCameraByRootId(rootData.getId());
                isAbsolutePos = true;
            }
            if (!cameraObj) {
                cameraObj = main.cameraSetting.getCameraByRootId(cameraId);
                isAbsolutePos = false;
            }
            if (cameraObj) {
                var target = new mono.Vec3(cameraObj.target.x, cameraObj.target.y, cameraObj.target.z);
                var position = new mono.Vec3(cameraObj.position.x, cameraObj.position.y, cameraObj.position.z);
                var rootNode = self.sceneManager.getCurrentRootNode();
                if (rootNode) {
                    target = rootNode.localToWorld2(target);
                    position = rootNode.localToWorld2(position);
                }
                var endCallBack = function() {
                    callback && callback.call(cameraManager, scene, rootData, oldScene, oldRootData,clientMap);
                }
                it.Util.playCameraAnimation(camera, position, target, 2000, endCallBack);
            } else {
                //如果没有设置镜头的话，那就用lookAt的位置，为了避免不重复，上面的onloadFinishFunction啥都没有做 --Kevin 2017-09-07
                var rootDataNode = self.sceneManager.getNodeByDataOrId(rootData);
                if (rootDataNode) {
                    self.sceneManager.viewManager3d.defaultEventHandler.moveCameraForLookAtNode(rootDataNode, callback);
                } else {
                    callback && callback.call(cameraManager, scene, rootData, oldScene, oldRootData,clientMap);
                }
            }
        };

        cameraManager.isDoAnimate = function(scene, rootData,oldScene,oldRootData){
            if (scene && oldScene 
                && scene.getCategoryId().toLowerCase() == 'datacenter' 
                && oldScene.getCategoryId().toLowerCase() == 'floor') {
                return false;
            }
            return true;
        };

        cameraManager.isDoFinalCamera = function(scene, rootData,oldScene,oldRootData){
            if (scene && oldScene 
                && scene.getCategoryId().toLowerCase() == 'datacenter' 
                && oldScene.getCategoryId().toLowerCase() == 'floor') {
                return false;
            }
            return true;
        };

        cameraManager.beforeSceneChangeCameraFunction = function(scene, rootData,oldScene,oldRootData,callback,scope){
            if (scene && oldScene
                && scene.getCategoryId().toLowerCase() == 'earth' 
                && oldScene.getCategoryId().toLowerCase() == 'datacenter') {
                    var node = self.sceneManager.getNodeByDataOrId(oldRootData);
                    if (node && node.getClient('complexNode')) {
                        node = node.getClient('complexNode');
                    }
                    if (node == 'unload') {
                        node = self.sceneManager.loadComplexNode(oldRootData);
                    }
                    self.doubleClickPark(node, self.sceneManager.network3d, oldRootData, null, callback,scope);
            }else if (scene && oldScene
                && scene.getCategoryId().toLowerCase() == 'building' 
                && oldScene.getCategoryId().toLowerCase() == 'datacenter') {
                    self.doubleClickBuilding(self.sceneManager.network3d, rootData, oldRootData, callback,scope);
            }else{
                if(callback) {
                   callback.call(scope);
                }
            }
        };

        this.sceneManager.viewManager3d.isHandleDoubleClickable = function(node){
            if (node && node.getClient('type') == 'parkSkybox') {
                return false; 
            }
            return true;
        }

    },

    sceneChangeHandler: function (scene, rootData,oldScene,oldRootData, callback) {
        if (this.skipAnimate) {
            if (callback) {
                callback();
            }
            return;
        }
        var self = this;
        var currentRootNode = self.sceneManager.getCurrentRootNode();
        var data = self.sceneManager.getNodeData(currentRootNode);
        var category = self.dataManager.getCategoryForData(data);
        var oldCategory = self.dataManager.getCategoryForData(oldRootData);
        var camera = self.sceneManager.network3d.getCamera();
        //大楼的动画
        if (category && category.getId().toLowerCase().indexOf('building') >= 0) {
            self.clearDCAnimate();
            if (!self.animateFromDataCenterToBuilding(callback)) {
                self.clearAnimate();
            } else {
                self.stopAnimate = false;
            }
        }
        //从地球进入园区的动画
        else if (category && category.getId().toLowerCase().indexOf('datacenter') >= 0) {
            self.clearAnimate();
            //camera.setFov(70);
            if (!self.sceneManager.sceneChangeWithOutAnimate) {
                self.doDcAnimate(data, oldScene, callback);
            }
            // 以下设置天空盒dblclike的事件不应该放在这里，如果从地球直接进入到机柜，再回退时就无法回退至地球了！！！
            //  因此在上面的sceneChangeListener中也设置了一次 -- 2016-10-26 Kevin
            // 放到sceneChangeListener中也不太合理，因为有callback，因此改进了sdk，统一重写viewManager.isHandleDoubleClickable即可
            //设置园区中天空盒的动画 
            // var node = self.sceneManager.getNodeByDataOrId(data).getClient('complexNode');
            // var children = node ? node.getChildren() : new mono.List();
            // for (var i = 0; i < children.size(); i++) {
            //     var child = children.get(i);
            //     self.setSkyboxClickFunction(child, node, data, callback);
            // }
        // } else {
        //     self.clearDCAnimate();
        }
       else if (category && category.getId().toLowerCase().indexOf('floor') >= 0) {
        self.clearDCAnimate();
        self.clearAnimate();
            var dataNode = self.sceneManager.getNodeByDataOrId(data);
            if (!dataNode && dataNode.orgY) {
                dataNode.setY(dataNode.orgY);
                dataNode.setScale(1, 1, 1);
            }
            if (callback) {
                callback();
            }
        }else  if (callback) {
            callback();
        }
    },

    /**
     * 重写双击建筑时的动作（默认是双击建筑，移动镜头lookAt建筑），这里双击建筑，需要慢慢的隐藏建筑的同时慢慢的显示出楼层,切楼层慢慢的上升;
     *
     * 注意：点击背景时也要做个特别的设置，使得floors隐藏，然后floor和dc对的虚幻去掉
     *
     * @param element
     * @param network
     * @param data
     * @param clickedObj
     */
    doubleBuilding: function (element, network, data, clickedObj) {
        if (!data) {
            return;
        }
        var floorNodes = [];
        var buildingNode = this.sceneManager.getNodeByDataOrId(data);
        if (data.getChildren() && data.getChildren().size() > 0) {
            for (var i = 0; i < data.getChildren().size(); i++) {
                var child = data.getChildren().get(i);
                var category = this.sceneManager.dataManager.getCategoryForData(child);
                if (category && category.getId().toLowerCase() && category.getId().toLowerCase().indexOf('floor') >= 0) {
                    var node = this.sceneManager.getNodeByDataOrId(child);
                    this.visibleManager.setVisible(child, true);
                    floorNodes.push(node);
                }
            }
        }
        var parendId = data.getParentId();
        var dcData = this.sceneManager.dataManager.getDataById(parendId);
        this.defaultVirture.add(data);
        this.defaultVirture.add(dcData);
    },

    getBuilding: function (data) {
        if (!data) {
            return;
        }
        var buildings = {};
        var children = data.getChildren();
        var self = this;
        if (children && children.size() > 0) {
            children.forEach(function (child) {
                if (!(child instanceof it.Data)) {
                    return;
                }
                var category = self.sceneManager.dataManager.getCategoryForData(child);
                if (category && category.getId().toLowerCase() && category.getId().toLowerCase().indexOf('building') >= 0) {
                    buildings[child.getId()] = child;
                }
            });
        }
        return buildings;
    },

    visibleFloor: function (data) {
        if (!data) {
            return;
        }
        var buildings = this.getBuilding(data);
        var self = this;
        for (var bid in buildings) {
            var build = buildings[bid];
            var bchildren = build.getChildren();
            if (bchildren && bchildren.size() > 0) {
                bchildren.forEach(function (child) {
                    var category = self.sceneManager.dataManager.getCategoryForData(child);
                    if (category && category.getId().toLowerCase() && category.getId().toLowerCase().indexOf('floor') >= 0) {
                        self.visibleManager.setVisible(child, false);
                        var node = self.sceneManager.getNodeByDataOrId(child);
                        if (node) {
                            node.setScale(0.1, 0.1, 0.1);
                            node.setY(node.getY() * 0.1);
                        }
                    }
                });
                var buildingNode = self.sceneManager.getNodeByDataOrId(bid);
                buildingNode.doubliClick = function (element, network, data, clickedObj) {
                    self.doubleBuilding(element, network, data, clickedObj);
                }
            }
        }

        var children = data.getChildren();
        if (children && children.size() > 0) {
            children.forEach(function (child) {
                var category = self.sceneManager.dataManager.getCategoryForData(child);
                if (category && category.getId().toLowerCase() && category.getId().toLowerCase().indexOf('floor') >= 0) {
                    this.visibleManager.setVisible(child, false);

                }
            });
        }
    },

    /**
     * 当场景从DC进入到building时，楼层的动画
     * 一开始是合并并缩小的，动画是：先展开——旋转——放大
     * 动画：1.初始状态是几层楼都是叠加的；2.镜头拉远一点；3. 展开
     * 注意：至少要有两层时才执行动画
     */
    animateFromDataCenterToBuilding: function (callback) {
        var currentRootNode = this.sceneManager.getCurrentRootNode();
        var data = this.sceneManager.getNodeData(currentRootNode);
        var self = this;
        if (data && data.getChildren() && data.getChildren().size() > 1) {
            var children = data.getChildren();
            var floors = self.floors = [];
            var minY = null, maxY = null;
            var lowestFloor, highestFloor;
            children.forEach(function (child) {
                var category = self.dataManager.getCategoryForData(child);
                if (category && category.getId().toLowerCase().indexOf('floor') >= 0) {
                    var childNode = self.sceneManager.getNodeByDataOrId(child);
                    if (childNode) {
                        floors.push(childNode);
                        if (!minY || minY > childNode.getPositionY()) {
                            minY = childNode.getPositionY();
                            lowestFloor = childNode;
                        }
                        if (!maxY || maxY < childNode.getPositionY()) {
                            maxY = childNode.getPositionY();
                            highestFloor = childNode;
                        }
                    }
                }
            });
            if (floors.length < 2) {
                return false;
            }
            //设置楼层展开的总高度
            var totalHeight = 1500;
            //设置镜头的最佳位置偏移值
            // var nearPosition = {x:1000, y: -4000, z: -6000};
            // var nearTarget = {x:0, y: 500, z: 0};
            var nearPosition = {x:1000, y: 500, z: 4000};
            var nearTarget = {x:0, y: 500, z: 0};

            //1.初始状态设置所有的floor按照从下到上的顺序一层层叠加在一起，并设置镜头位置
            var lastPositionY = minY;
            for (var i = 0; i < floors.length; i++) {
                var floor = floors[i];
                var data = self.sceneManager.getNodeData(floor);
                self.sceneManager.translatePosition(data);
                // floor.setScale(0.3, 0.7, 0.3); //这样的话，如果自身坐标的中心点不是原点的话，还有问题呢。或者先scale，再overView
                if (!floor.orgY) {
                    floor.orgY = floor.getPositionY();
                }
                floor.setPositionY(lastPositionY);
                if(!floor.newY){
                    floor.newY = floor.getPositionY();
                }
                lastPositionY += floor.getBoundingBoxWithChildren().size().y;
//                floor.setVisible(false); //先隐藏，免得在_onloadFinished中改变了位置和镜头，突然执行这个里面的东西重新设置回有"一闪"的效果
                this.visibleManager.setVisible(data, false);
            }
            var camera = self.sceneManager.network3d.getCamera();
            var defaultEventHandle = self.sceneManager.viewManager3d.getDefaultEventHandler();
            var newPos = defaultEventHandle.getElementPerfectFrontPositionForNodeCenterPosition(lowestFloor);
            var newTarget = it.Util.getNodeCenterPosition(lowestFloor);
            camera.lookAt(new mono.Vec3(newTarget.x+nearTarget.x, newTarget.y + (maxY - minY) / 2+nearTarget.y, newTarget.z+nearTarget.z));
            camera.setPosition(new mono.Vec3(newPos.x+nearPosition.x, newPos.y+nearPosition.y, newPos.z+nearPosition.z));
            
            var farPositionOffset = {x:2000, y: 1000, z: 6000};
            var farTargetOffset = {x:0, y: 0, z: 0};

            floors.forEach(function (floor) {
                var data = self.sceneManager.getNodeData(floor);
                self.visibleManager.setVisible(data, true);
            });
            // 如果几层都不一样大小的话，应该以最大的那个floor的boundingbox来算
            this.playTimeoutId = setTimeout(function () {
                
                var floorGap = totalHeight/(floors.length-1);
                //3.展开多楼层
                var expandAnimate = new twaver.Animate({
                    from: 0,
                    to: 1,
                    delay: 500,
                    dur: 1000,
                    onUpdate: function (value) {
                        for(var k = 0; k<floors.length;k++){
                            var f = floors[k];
                            var location = f.newY -(totalHeight/2)*value + floorGap*k*value;
                            f.setY(location);
                        }
                    },
                    onDone: function(){
                        if(callback) callback();
                    }
                });

                //2.镜头拉远一点
                var oldPos = camera.getPosition();
                var oldTarget = camera.getTarget();
                var cameraAnimate = new twaver.Animate({
                    from: 0,
                    to: 1,
                    delay: 500,
                    dur: 500,
                    onUpdate: function (value) {
                        camera.p(oldPos.x*(1-value)+ (newPos.x+farPositionOffset.x)*value, oldPos.y*(1-value)+(newPos.y+farPositionOffset.y)*value, oldPos.z*(1-value)+(newPos.z+farPositionOffset.z)*value);
                        camera.lookAt(oldTarget.x*(1-value)+ newTarget.x*value, oldTarget.y*(1-value)+ (newTarget.y+ (maxY - minY) / 2)*value, oldTarget.z*(1-value)+newTarget.z*value);
                    }
                }).chain(
                    expandAnimate
                ).play();


                self.animates.push(cameraAnimate);
//                self.animates.push(animateRotate); //不要旋转
                self.animates.push(expandAnimate);

            }, 2); //有个timeout,如果用户点击的够快的话，很有可能跳其他的场景，
            // 才执行该动画(虽然进其他的场景时有stop动画，但是那时动画很有可能还没有执行)
            // 之前是20，跳转的非常快时会有在其他的场景中有动画，调至2mis，比较难，是不是可以去掉呢？
            // 点快了，如在floor界面连续点击background最终动画跑到了dc场景中，去掉此timeout也有问题，都么有就绪
        }
        return true;
    },

    /**
     * 清除动画，并且讲那些没有执行完，那相关的没有完成的参数的设置回去，比如：刚开始的scale得设置回去
     *
     */
    clearAnimate: function () {
//        var self = this;
        this.stopAnimate = true;
        if (this.playTimeoutId) {
            clearTimeout(this.playTimeoutId);
        }
//        var fun = function(){
        this.visibleManager.clear();
        if (this.animates && this.animates.length > 0) {
            for (var i = 0; i < this.animates.length; i++) {
                var animate = this.animates[i];
                if (animate) {
                    animate.stop();
                }
            }
            this.animates = [];
        }
        if (this.floors && this.floors.length > 0) {
            this.floors.forEach(function (floor) {
                floor.setScale(1, 1, 1);
                if (floor.orgY != null && floor.orgY != undefined) {
                    floor.setY(floor.orgY);
                }
            });
        }
//        };
    },

    doDcAnimate: function (data, oldScene, callback) {
        if (!data) {
            return;
        }
        var node = this.sceneManager.getNodeByDataOrId(data);
        if (!node) {
            return;
        }
        var complexNode = node.getClient('complexNode') || node;
        if (complexNode && complexNode == 'unload') {
            complexNode = this.sceneManager.loadComplexNode(data)||node; //这里没有用回调，也就是dc的复杂模型不能是obj
        }
        var oldSceneCategoryId = oldScene && oldScene.getCategoryId ? oldScene.getCategoryId().toLowerCase() : '';

        var dcPosition = main.dcCameraPosition||{};
        var topPos = dcPosition.topPosition || 2000;
        var pos = dcPosition.position1 || [0, 500, 1200];
        var pos2 = dcPosition.position2 || [-400,400,1400];
        var yuanquHeight = dcPosition.yuanquHeight;

        //进入园区后设置园区场景的镜头和地球场景能融合起来
        var camera = this.sceneManager.network3d.getCamera();
        camera.look(0, 0, 0);
        if(topPos instanceof Array){
            camera.setPosition(topPos[0], topPos[1], topPos[2])
            topPos =  topPos[1];
        }else{
            camera.setPosition(0, topPos, 1)
        }

        var self = this;
        //2.移动拉近镜头
        var moveAnimate = new twaver.Animate({
            from: 0,
            to: 1,
            dur: 1000,
            easing: 'easeBoth',
            onUpdate: function (value) {
                camera.p(pos[0] + (pos2[0] - pos[0])*value, pos[1] -(pos[1] - pos2[1])*value, pos[2]+(pos2[2] - pos[2])*value);
            },
            onDone: function () {
                // self.adjustCameraPositionAndTarget(camera, callback);
                if (callback) {
                    callback();
                }
            },
            onStop: function() {
                if (self.currentDCAnimate) {
                    delete self.currentDCAnimate; //需要释放掉，否则一直引用了一堆东西都占着内存，2017-10-12
                }
            }
        });


        if (oldSceneCategoryId && oldSceneCategoryId.indexOf('earth') >= 0) {
            //获取园区双击上地图的cube
            var cube;
            complexNode.getDescendants().forEach(function (child) {
                if (child.getClient('type') == 'mask') {
                    cube = child;
                }
            });
            if(yuanquHeight){
                var minY = -yuanquHeight/2;
                var maxY = yuanquHeight/2;
            }else{
                 var building = this.sceneManager.getNodeByDataOrId(data.getChildren().get(0));
                if (!building) {
                    console.log('does not set building!');
                    return;
                };
                var bb = building.getBoundingBox();
                var minY = (Math.abs(bb.min.y) == Infinity) ? -100 : bb.min.y;
                var maxY = (Math.abs(bb.max.y) == Infinity) ? 100 : bb.max.y;
            }

            if (cube) {
                cube.setStyle('m.visible', true);
                cube.setPositionY(maxY + 100);
                // main.cube = cube;
            }
            // console.log(maxY, cmaxY,'>>>>>>>',minY, cminY);
            //执行动画: 1. 移动镜头的位置并设置cube的positionY值
            var dcAnimate = new twaver.Animate({
                from: 0,
                to: 1,
                dur: 5000,
                easing: 'easeBothStrong',
                onUpdate: function (value) {
                    camera.setPosition(value * pos[0], topPos- (topPos - pos[1]) *value, value * pos[2]);
                    if (cube) cube.setPositionY((maxY + 100) * (1 - value) + minY * value);
                },
                onDone: function () {
                    if (cube) {
                        cube.s({
                            'm.visible': false,
                        });
                    }
                },
            });
            this.currentDCAnimate = dcAnimate;
            dcAnimate.chain(moveAnimate);
            dcAnimate.play();
        } else {
            this.currentDCAnimate = moveAnimate;
            moveAnimate.play();
        }
    },

    clearDCAnimate: function () {
        if (this.currentDCAnimate) {
            this.currentDCAnimate.stop();
            delete this.currentDCAnimate;
        }
    },
    
    /**
     * 从园区回到earth的动画，
     * 是动画完成后再执行场景切换和跳转的方法(gotoScene)
     * 双击园区执行的动画
     * 注意，只有从地球进去园区时才会有map这样的动画，并且点击天空盒才会map回去。有可能3D机房中就没有配置地球
     */
    doubleClickPark: function(element, network, data, clickedObj, callback, scope) {
        var self = this;
        var camera = network.getCamera();
        var position = camera.getPosition().clone();
        var map = document.getElementById('map');
        if (!map) {
            return;
        }
        var images = map.images;
        var width = network.getRootView().clientWidth;
        var height = network.getRootView().clientHeight;
        main.navBarManager.setMapLeftAndTop(map);
        var dcPosition = main.dcCameraPosition;
        var topPos = dcPosition.topPosition || 2000;
        var pos = dcPosition.position1 || [0, 500, 1200];
        var pos2 = dcPosition.position2 || [-400, 400, 1400];
        var yuanquHeight = dcPosition.yuanquHeight || 10;

        if (topPos instanceof Array) {
            topPos = topPos[1];
        }

        var cube;
        if (element) {
            element.getDescendants().forEach(function(child) {
                if (child.getClient('type') == 'mask') {
                    cube = child;
                }
            });
        }

        var minY = -yuanquHeight / 2;
        var maxY = yuanquHeight / 2;

        //2.移动镜头垂直向上并设置cube的positionY值
        var maskAnimate = new twaver.Animate({
            from: 0,
            to: 1,
            dur: 1000,
            onUpdate: function(value) {
                cube && cube.setPositionY(value * maxY + minY * (1 - value));
                camera.setPosition(0, pos[1] + (topPos - pos[1]) * value, pos[2] * (1 - value));
            },
            onDone: function() {
                map.style.display = 'block';
            }
        });

        //3.地图的动画
        var mapAnimate = new twaver.Animate({
            from: images.length,
            to: 0,
            dur: 150 * images.length,
            ease: 'easeOut',
            onUpdate: function(value) {
                var index = Math.floor(value);
                if (index < images.length && index >= 0) {
                    var image = images[index];
                    var ctx = map.getContext('2d');
                    var scale = value - index;
                    var x = -width * scale / 2;
                    var y = -height * scale / 2;
                    var w = width * (1 + scale);
                    var h = height * (1 + scale);
                    if (image && image.width > 0) {
                        ctx.drawImage(image, x, y, w, h);
                    }
                }
            },
            onDone: function() {
                map.style.display = 'none';
                //回到上一层场景        
                if (callback) {
                    callback.call(scope);
                }
            },
            onStop:function(){
                self.currentParkAnimates = []; //运行完了就释放 2017-10-12
            }
        });

        // cameraAnimate.chain(mapAnimate);
        // cameraAnimate.play();
        // cameraAnimate.chain(maskAnimate);
        maskAnimate.chain(mapAnimate);
        // cameraAnimate.play();
        maskAnimate.play();

        this.currentParkAnimates = [];
        // this.currentParkAnimates.push(cameraAnimate);
        this.currentParkAnimates.push(maskAnimate);
        this.currentParkAnimates.push(mapAnimate);

    },


    clearParkAnimate: function () {
        if (this.currentParkAnimates && this.currentParkAnimates.length > 0) {
            for (var i = 0; i < this.currentParkAnimates.length; i++) {
                var animate = this.currentParkAnimates[i];
                if (animate) {
                    animate.stop();
                }
            }
            this.currentParkAnimates = [];
        }
    },

    doubleClickBuilding: function(network, rootData, oldRootData, callback,scope){
        var self = this;
        var rootNode =  self.sceneManager.getNodeByDataOrId(rootData);
        var defaultEventHandle = self.sceneManager.viewManager3d.getDefaultEventHandler();
        var buildingPerfectTarget = main.buildingSetting && main.buildingSetting.perfectTarget;
        var buildingPerfectPos = main.buildingSetting && main.buildingSetting.perfectPosition;
        var newTarget = buildingPerfectTarget || it.Util.getNodeCenterPosition(rootNode);
        var newPos = buildingPerfectPos || defaultEventHandle.getElementPerfectFrontPositionForNodeCenterPosition(rootNode);
        var camera = self.sceneManager.network3d.getCamera();
        it.Util.playCameraAnimation(camera, new mono.Vec3(newPos.x, newPos.y, newPos.z), new mono.Vec3(newTarget.x, newTarget.y, newTarget.z), 1000, callback);
    }


});