var $SmokeApp = function (sceneManager) {
    $Application.call(this, sceneManager);
    this.sceneManager = sceneManager;
    this.dataManager = this.sceneManager.dataManager;
    this.dataBox = this.sceneManager.getDataBox();
    // this.yanganDatas = [];
    this.alarmLevels = {};
    this.yanganNodes = [];
    this.smokeNodes = [];
    this.smokeColor = {
        critical: '#FF0000',
        major: '#FFA000',
        warning: '#00FFFF',
        minor: '#FFFF00',
        indeterminate: '#C800FF'
    };
    this.intervalIds = [];
    var self = this;
    this.sceneManager.cameraManager.addAfterPlayCameraListener(function (scene, rootData, oldScene, oldRootData) {
        self.onSceneChange(scene, rootData, oldScene, oldRootData);
    });
    // this.sceneManager.viewManager3d.addPropertyChangeListener(function (event) {
    //     if (event && event.property == "focusNode") {
    //         var node = event.newValue;
    //         var oldNode = event.oldValue;
    //         self._focusChangeHandle(node, oldNode);
    //     }
    // });
    this.sceneManager.getAlarmManager().addAlarmManagerChangeListener(this.alarmManagerHandler, this);
    this.sceneManager.getAlarmManager().addAlarmPropertyChangeListener(this.alarmManagerHandler, this);
};

mono.extend($SmokeApp, $Application, {

    onSceneChange: function (scene, rootData, oldScene, oldRootData) {
        if (scene && !scene.getId() !== 'floor') {
            this.doClear();
        }
        if (scene && scene.getId() == 'floor' && (!oldRootData || rootData._id != oldRootData._id)){
            this.doClear();
            this.doShow();
        }
    },
    // _focusChangeHandle: function (node, oldNode) {
    //     var data = this.sceneManager.getNodeData(node);
    //     var data1 = this.sceneManager.getNodeData(oldNode);
    // },
    alarmManagerHandler: function () {
        this.doClear();
        this.doShow();
    },
    doShow: function () {
        if (!dataJson.showSmoke) {
            return;
        }
        var self = this;
        // this.sceneManager.viewManager3d.defaultMaterialFilter.addAll();
        this.getYanganNodes(function () {
            if (self.yanganNodes.length < 1) {
                return;
            }
            self.yanganNodes.forEach(function (val) {
                var level = self.alarmLevels[val._clientMap.it_data_id];
                var color = self.smokeColor[level] || '#FAAC58';
                self.addSmoke(val, color);
                var data = self.sceneManager.getNodeData(val);
                // self.sceneManager.viewManager3d.defaultMaterialFilter.remove(data);
            });
    
            self.startSmokeAnimation(self.smokeNodes);
            // self.sceneManager.viewManager3d.defaultEventHandler.lookAtElements(self.smokeNodes);
        });
    },

    doClear: function () {
        if (!dataJson.showSmoke) {
            return;
        }
        if (this.yanganNodes.length < 1) {
            return;
        }
        // this.sceneManager.viewManager3d.defaultMaterialFilter.clearAll();
        this.sceneManager.network3d.dirtyNetwork();
        this.smokeNodes.forEach(function (val) {
            val.setParent(null);
            this.dataBox.remove(val);
        }, this);
        this.intervalIds.forEach(function (val) {
            clearInterval(val);
        });

        this.yanganNodes = [];
        // var rootNode = this.sceneManager._currentRootNode;
        // this.sceneManager.lookAt(rootNode);
    },
    //获取当前场景烟雾告警的烟感
    getYanganNodes: function (callback) {
        this.yanganNodes = [];
        var self = this;
        ServerUtil.api('alarm', 'search', {alarmTypeId: "smoke"}, function (alarms) {
            alarms.forEach(function (val) {
                if (val.alarmTypeId !== 'smoke') return;
                var id = val.dataId;
                if (!id) return;
                var data = self.dataManager.getDataById(id);
                var categoryId = self.dataManager.getCategoryForData(data).getId();
                if (categoryId && categoryId == 'smoke' && self.sceneManager.isCurrentSceneInstance(data)) {
                    self.alarmLevels[id] = val.level;
                    var node = self.sceneManager.getNodeByDataOrId(id);

                    self.yanganNodes.push(node);
                }
            });

            callback && callback();
        });
    },

    //创建烟雾node
    createSmokeNode: function (color) {
        var smoke = new mono.Particle();
        var count = 200;
        for (var j = 0; j < count; j++) {
            smoke.vertices.push(new mono.Vec3());
        }
        smoke.verticesNeedUpdate = true;
        smoke.sortParticles = false;
        smoke.setStyle('m.size', 20);
        smoke.setStyle('m.transparent', true);
        smoke.setStyle('m.opacity', 0.5);
        // var smokeSrc = "data:image/png;base64,";
        smoke.setStyle('m.texture.image', 'data:image/png;base64,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');
        smoke.setStyle('m.color', color);
        smoke.setStyle('m.depthTest', false);
        smoke.setStyle('m.transparent', true);
        smoke.setStyle('m.opacity', 0.1);
        // smoke.setVisible(false);
        return smoke;
    },

    //为烟感添加烟雾
    addSmoke: function (node, color) {
        var smoke = this.createSmokeNode(color);
        this.smokeNodes.push(smoke);
        smoke.setParent(node);
        var bBox = node.getBoundingBox();
        var height = bBox.max.y - bBox.min.y;
        smoke.p(0, height * 3, 0);
        this.dataBox.add(smoke);
    },

    updateSmoke: function (smokeNodes) {
        var network = this.sceneManager.network3d;
        return function () {
            smokeNodes.forEach(function (element) {
                if (element.isVisible()) {
                    var smoke = element;
                    var count = smoke.vertices.length;
                    for (var i = 0; i < count; i++) {
                        var point = smoke.vertices[i];
                        point.y = Math.random() * 200;
                        point.x = Math.random() * point.y / 2 - point.y / 4;
                        point.z = Math.random() * point.y / 2 - point.y / 4;
                    }
                    smoke.verticesNeedUpdate = true;
                    network.dirtyNetwork();
                }
            });
        }
    },
    startSmokeAnimation: function (smokeNodes) {
        intervalId = setInterval(this.updateSmoke(smokeNodes), 200);
        this.intervalIds.push(intervalId);
    },
    // toggleSmokeView: function (smokeNodes) {
    //     smokeNodes.forEach(function (element) {
    //         element.setVisible();
    //     });
    // }
});

it.SmokeApp = $SmokeApp;
// mono.ParticleMaterial.prototype.getUniqueCode = function(){
//     var map;
//     var code = this.color.getUniqueCode();
//     code += (map ? map.getUniqueCode() : '');
//     code += " " + this.size;
//     code += " " + this.fog;
//     code += " " + this.sizeAttenuation;
//     code += " " + this.transparent;
//     code += " " + this.opacity;
//     code += " " + this.depthTest;
//     code += " " + this.alphaTest;
//     return code;
//    };