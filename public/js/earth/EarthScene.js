
var EarthScene = function () {

}

mono.extend(EarthScene, Object, {
    initView: function (parent) {
        var categoryMap = {
            'dataCenter': 0,
            'building': 0,
            'rack': 0
        };
        for (var category in categoryMap) {
            var map = main.sceneManager.dataManager.getDataMapByCategory(category);
            for (var p in map) {
                categoryMap[category]++;
            }
        }
        var obj = {};
        obj[it.util.i18n("AreaScene_Data_Center")] = {
            base: Math.ceil(categoryMap['dataCenter'] * 1.8),
            items: {
                '2018': categoryMap['dataCenter'],
                '2017': Math.ceil(categoryMap['dataCenter'] * 0.5),
                '2016': Math.ceil(categoryMap['dataCenter'] * 0.3),
            }
        };
        obj[it.util.i18n("AreaScene_Building")] = {
            base: Math.ceil(categoryMap['building'] * 1.5),
            items: {
                '2018': categoryMap['building'],
                '2017': Math.ceil(categoryMap['building'] * 0.7),
                '2016': Math.ceil(categoryMap['building'] * 0.45),
            }
        };
        obj[it.util.i18n("AreaScene_Rack")] = {
            base: Math.ceil(categoryMap['rack'] * 1.2),
            items: {
                '2018': categoryMap['rack'],
                '2017': Math.ceil(categoryMap['rack'] * 0.8),
                '2016': Math.ceil(categoryMap['rack'] * 0.6),
            }
        };
        this._$leftPanel = $('<div class="left-panel"></div>')
            .appendTo(parent)
            .itvDcTotal({
                data: obj
            }).css('left', '-300px');
    },
    helloView: function (callback) {
        var self = this;
        setTimeout(function () {
            self._$leftPanel.itvDcTotal('reset');
            self._$leftPanel.animate({
                left: '10px',
            }, 1000, function () {
                y
                self._$leftPanel.itvDcTotal('start');
                setTimeout(function () {
                    callback && callback();
                }, 1000);
            });
        }, 1000);

    },
    byeView: function (callback) {
        // if(!this._$leftPanel.animat){
        //      callback && callback();
        //      return ;
        // }
        this._$leftPanel.animate({
            left: '-300px',
        }, 500, function () {
            callback && callback();
        });
    },
    initNetwork: function (parent) {
        parent = parent || document.body;
        this.parent = parent;
        var network = this.network = new mono.Network3D();
        var box = network.getDataBox();
        var camera = new mono.PerspectiveCamera(30, 1.5, 10, 20000);
        // camera.setPosition(0, 0, 3000);
        camera.setPosition(-919.06, 1750, -2889.44);
        camera.lookAt(56.08, 1.44, -16.80);
        // camera.setPosition(3000, 0, 0);
        network.setCamera(camera);
        network.setClearColor('#000000');
        network.setClearAlpha(0);
        network.setBackgroundImage(pageConfig.url('/images/bg.jpg'));

        // 地球左右拖动回弹 start
        var d = this.sphereInteraction = new it.SphereInteraction(network);

        var interaction = new mono.DefaultInteraction(network);
        interaction.noPan = true;
        network.setInteractions([d]);
        var self = this, per = Math.PI / 180;
        d.setAngleH(per * 200);
        d.setAngleV(per * 30);
        this.xzAngle = d.getAngleH();
        this.yzAngle = d.getAngleV();
        this.xLimitAngle = Math.PI / 30;
        this.yLimitAngle = 0;
        this.xBackAngle = Math.PI / 100;
        this.yBackAngle = 0;

        this.xMaxAngle = this.xzAngle + this.xLimitAngle;
        this.xMinAngle = this.xzAngle - this.xLimitAngle;

        this.yMaxAngle = this.yzAngle + this.yLimitAngle;
        this.yMinAngle = this.yzAngle - this.yLimitAngle;

        d.rotateHSpeedFunction = function (angleH) {
            if (angleH > self.xMaxAngle || angleH < self.xMinAngle) {
                return 0.2;
            }
            return this.rotateSpeed;
        };

        d.rotateVSpeedFunction = function (angleV) {
            if (angleV > self.yMaxAngle || angleV < self.yMinAngle) {
                return 0.2;
            }
            return this.rotateSpeed;
        };

        d.afterHandleMouseUp = function () {
            var t = 500;
            if (this.getAngleH() > self.xMaxAngle) {
                this.setAngleH(self.xMaxAngle - self.xBackAngle, t);
            }
            if (this.getAngleH() < self.xMinAngle) {
                this.setAngleH(self.xMinAngle + self.xBackAngle, t);
            }

            if (this.getAngleV() > self.yMaxAngle) {
                this.setAngleV(self.yMaxAngle - self.yBackAngle, t);
            }
            if (this.getAngleV() < self.yMinAngle) {
                this.setAngleV(self.yMinAngle + self.yBackAngle, t);
            }
        };
        // 地球左右拖动回弹 end
        // 地球左右拖动回弹后动作
        d.rollbackDone = function () {
            if (self._earthFloatAnimate) {
                self._earthFloatAnimate.play();
            }
        }

        // var interaction = network.getDefaultInteraction();
        var interaction = d;
        interaction.maxDistance = 3600;
        interaction.minDistance = 3500;
        interaction.yUpLimitAngle = Math.PI / 6;
        interaction.yLowerLimitAngle = Math.PI / 6;
        interaction.setYLowerLimitAngle(Math.PI / 6);
        interaction.setYUpLimitAngle(Math.PI / 6);
        interaction.noPan = true;

        network.isSelectable = function () {
            return false;
        }

        parent.appendChild(network.getRootView());
        // mono.Utils.autoAdjustNetworkBounds(network, document.documentElement, 'clientWidth', 'clientHeight');

        box.add(new mono.AmbientLight('#F8F8F8'));
        var pointLight = new mono.PointLight(0xFFFFFF, 0.2);
        pointLight.setPosition(5000, 5000, 5000);
        box.add(pointLight);

        var self = this;
        network.getRootView().addEventListener('dblclick', function (e) {
            var findFirstObjectByMouse = eutils.findFirstObjectByMouse;
            var earth2 = findFirstObjectByMouse(network, e, function (object3d) {
                if (object3d.getClient && object3d.getClient('type') == 'earth2') {
                    return true;
                }
            });
            if (!earth2) {
                var efa = self._earthFloatAnimate;
                if (efa) {
                    efa.isPaused() ? efa.play() : efa.pause();
                }
                return;
            };
            var earth = findFirstObjectByMouse(network, e, function (object3d) {
                if (object3d.getClient && object3d.getClient('type') == 'earth')
                    return true;
            });
            var flare = findFirstObjectByMouse(network, e, function (object3d) {
                if (object3d.getClient && object3d.getClient('type') == 'flare')
                    return true;
            });
            self.byeView(function () {
                self.retireScene(earth2, earth, flare);
            });
        });
        var stopFloatAnimate = false, isMoveMouse = false;
        network.getRootView().addEventListener('mousedown', function (e) {
            var findFirstObjectByMouse = eutils.findFirstObjectByMouse;
            var earth2 = findFirstObjectByMouse(network, e, function (object3d) {
                if (object3d.getClient && object3d.getClient('type') == 'earth2') {
                    return true;
                }
            });
            if (earth2) {
                self._earthFloatAnimate ? self._earthFloatAnimate.pause() : '';
                isMoveMouse = false;
                stopFloatAnimate = true;
                return;
            };
        });
        network.getRootView().addEventListener('mousemove', function (e) {
            if (stopFloatAnimate) {
                isMoveMouse = true;
            }
        });
        network.getRootView().addEventListener('mouseup', function (e) {
            if (stopFloatAnimate && !isMoveMouse) {
                self._earthFloatAnimate ? self._earthFloatAnimate.play() : '';
                stopFloatAnimate = false;
            }

        });
        network.getRootView().addEventListener('touchstart', function (e) {
            var findFirstObjectByMouse = eutils.findFirstObjectByMouse;
            var earth2 = findFirstObjectByMouse(network, e, function (object3d) {
                if (object3d.getClient && object3d.getClient('type') == 'earth2') {
                    return true;
                }
            });
            if (earth2) {
                self._earthFloatAnimate ? self._earthFloatAnimate.pause() : '';
                isMoveMouse = false;
                stopFloatAnimate = true;
                return;
            };
        });
        network.getRootView().addEventListener('touchmove', function (e) {
            if (stopFloatAnimate) {
                isMoveMouse = true;
            }
        });
        network.getRootView().addEventListener('touchend', function (e) {
            if (stopFloatAnimate && !isMoveMouse) {
                self._earthFloatAnimate ? self._earthFloatAnimate.play() : '';
                stopFloatAnimate = false;
            }

        });
        if (main.config.debug) {
            network.getRootView().addEventListener('click', function (e) {
                eutils.findFirstObjectByMouse(network, e, function (object3d, point) {
                    if (object3d.getClient && object3d.getClient('type') == 'earth2') {
                        console.log(point);
                    }
                });
            });
        }

    },
    setData: function (data) {
        this.data = data;
    },

    preload: function (parent) {
        if (this._loaded) {
            this.adjustBounds();
            // this.reload();
            return;
        }
        this.initNetwork(parent);
        this.adjustBounds();
        this.register();
        this.loadData();
        // var self = this;
        // setTimeout(function(){
        //     self.loadData();
        // },1000);
    },

    // reload: function(){
    //     // mono.Utils.autoAdjustNetworkBounds(this.network, document.documentElement, 'clientWidth', 'clientHeight');
    // },

    setBounds: function (bounds) {
        this.bounds = bounds;
    },

    /**
     * 调整bounds
     * 注意，当this.bounds有值(没有初始化过)的话才需要调整
     */
    adjustBounds: function () {
        if (this.bounds) {
            var w = document.documentElement.clientWidth;
            var h = document.documentElement.clientHeight;
            var x = 0, y = 0;
            if (this.bounds.width) {
                w = this.bounds.width;
            }
            if (this.bounds.height) {
                h = this.bounds.height;
            }
            if (this.bounds.x) {
                x = this.bounds.x;
            }
            if (this.bounds.y) {
                y = this.bounds.y;
            }
            this.network.adjustBounds(w, h);
        }
    },

    load: function () {
        this.initView(this.parent);
        this.loadDataCenter();
        this._loaded = true;
        var self = this,
            interaction = this.sphereInteraction,
            angleh = interaction.getAngleH(),
            anglev = interaction.getAngleV();
        this._earthFloatAnimate = new twaver.Animate({
            play: true,
            reverse: true,
            repeat: Number.MAX_VALUE,
            dur: 10000,
            from: -Math.PI / 30,
            to: Math.PI / 30,
            easing: 'easeOut',
            onUpdate: function (v) {
                interaction.setAngleH(angleh + v);
                // interaction.setAngleV(anglev+v);
            }
        });
        this.helloView(function () {
            self._earthFloatAnimate.play();
        });

    },

    register: function () {
        this.readyModels();
    },

    retireScene: function (earth2, earth, flare) {
        var self = this, network = this.network, camera = network.getCamera();

        earth.setStyle('m.transparent', true);
        flare.setStyle('m.transparent', true);
        earth2.setStyle('m.opacity', 1);

        this._earthFloatAnimate && this._earthFloatAnimate.stop(false);

        var animation = new twaver.Animate({
            from: 0,
            to: 1,
            dur: 1000,
            easing: 'easeBoth',
            onUpdate: function (value) {
                earth.setStyle('m.opacity', (1 - 0.5 * value));
                // flare.setStyle('m.opacity', (1-value));
                // earth2.setStyle('m.opacity', (1-0.01*value));
            },
        });
        animation.onDone = function () {
            self.next && self.next();
        };
        animation.play();

    },

    back: function () {
        var earth = this.earth;
        if (!this._loaded) {
            this.initNetwork(this.parent);
            // this.register();
            this.loadData();
            this.load();
            this.adjustBounds();
            earth = this.earth;
            earth.setStyle('m.transparent', true);
            earth.setStyle('m.opacity', 1);

        } else {
            earth.setStyle('m.transparent', true);
            earth.setStyle('m.opacity', 1);
            var self = this;
            setTimeout(function () {
                self.helloView(function () {
                    if (self._earthFloatAnimate) {
                        self._earthFloatAnimate.play();
                    }
                });
            }, 1000);
            // this.helloView();
            // if(this._earthFloatAnimate){
            //     this._earthFloatAnimate.play();
            // }
        }

    },

    calCamera: function (camera, pos, target) {
        pos = pos || camera.p();
        target = target || camera.getTarget();
        var angles = mono.Utils.getVectorAngles(camera.getTarget(), camera.p());
        var angles2 = mono.Utils.getVectorAngles(target, pos);
        var dha = angles2[0] - angles[0];
        if (dha > 180) {
            dha = dha - 360;
        } else if (dha < -180) {
            dha = dha + 360;
        }
        var dva = angles2[1] - angles[1];
        if (dva > 180) {
            dva = dva - 360;
        } else if (dva < -180) {
            dva = dva + 360;
        }
        // var t1 = camera.getTarget(),
        //     t2 = target;
        //     d1 = camera.getDistance(), 
        //     d2 = new mono.Vec3().subVectors(pos, target).length();
        return {
            angles: angles,
            dha: dha,
            dva: dva,
            t1: camera.getTarget(),
            t2: target,
            d1: camera.getDistance(),
            d2: new mono.Vec3().subVectors(pos, target).length()
        }

    },

    updateCamera: function (camera, p, value) {
        var angles = p.angles, dha = p.dha, dva = p.dva,
            t1 = p.t1, t2 = p.t2, d1 = p.d1, d2 = p.d2;
        var hAngle = angles[0] + (dha) * value;
        var vAngle = angles[1] + (dva) * value;
        var t = new mono.Vec3().lerpVectors(t1, t2, value);
        var d = d1 + (d2 - d1) * value;
        var newPos = new mono.Vec3();
        newPos.x = t.x + d * Math.sin(hAngle * DEGREES_TO_RADIANS) * Math.cos(vAngle * DEGREES_TO_RADIANS);
        newPos.z = t.z + d * Math.cos(hAngle * DEGREES_TO_RADIANS) * Math.cos(vAngle * DEGREES_TO_RADIANS);
        newPos.y = t.y + d * Math.sin(vAngle * DEGREES_TO_RADIANS);
        camera.lookAt(t);
        camera.p(newPos);
    },

    readyModels: function () {
        make.Default.register('twaver.scene.datacenter-new', function (json, callback) {
            var scaleX = 50, scaleY = 50;
            var position = json.position || [0, 0, 0];
            var x = position[0], y = position[1], z = position[2];
            var pin = new mono.Billboard();
            pin.s({
                'm.texture.image': "./images/dc2.png",
                'm.alignment': mono.BillboardAlignment.bottomCenter,
                'm.depthTest': false,
            });
            pin.setScale(scaleX, scaleY, 1);
            pin.p(x, y, z);
            return pin;
        });
        make.Default.load('twaver.scene.datacenter-new');

        make.Default.register('twaver.scene.earth-new', function (json, callback) {
            var radius = json.radius || 500,
                segmentsW = json.segmentsW || 50,
                segmentsH = json.segmentsH || 50;
            rotation = json.rotation || [0, 0, 0];
            var image = json.image;
            var earth = new mono.Sphere(radius, segmentsW, segmentsH);

            earth.s({
                'm.texture.image': "./images/earth01.jpg",
                'm.type': 'phong',
            });
            earth.setClient('type', 'earth');

            // 地球光晕
            var earthFlare = new mono.Billboard();
            earthFlare.s({
                'm.texture.image': "./images/flare.png",
                'm.transparent': true,
                'm.depthMask': false,
                // 'm.side': "both",
                'm.alignment': mono.BillboardAlignment.center,
                'm.vertical': false,
            });
            earthFlare.setScale(2150, 1209.375, 1);
            earthFlare.setPosition(0, 0, 620);
            // earthFlare.setPosition(0,0,0);
            earthFlare.setClient("type", "flare");
            earthFlare.setParent(earth);

            var earth2 = new mono.Sphere(radius + 50, segmentsW, segmentsH);
            earth2.s({
                'm.texture.image': "./images/earth02.png",
                "m.transparent": true
                // 'm.type': 'phong',
            });
            // earth2.setRotationY(Math.PI/2);
            earth2.setClient('type', 'earth2');
            earth2.setParent(earth);

            return earth;
        });
        make.Default.load('twaver.scene.earth-new');
    },
    loadDataCenter: function () {
        var network = this.network, box = network.getDataBox();
        var dcs = this.data, dc, dcData, ext, pos;
        if (dcs) {
            for (var i = 0; i < dcs.length; i++) {
                dcData = dcs[i];
                ext = dcData.getExtend();
                pos = dcData._position ? dcData._position : { x: 0, y: 0, z: 0 };
                dc = make.Default.load({
                    "id": 'twaver.scene.datacenter-new',
                    // "position":[431.84, 303.67, -63.25]
                    "position": [pos.x, pos.y, pos.z]
                });
                dc.setParent(this.earth);
                box.addByDescendant(dc);
            }
        }
    },
    loadData: function () {
        var network = this.network, camera = network.getCamera(),
            box = network.getDataBox();

        var earth = this.earth = make.Default.load({
            "id": "twaver.scene.earth-new",
            // "image":"./images/earth/world.jpg",
            // "growImage":"./images/earth/glow.png"
        });

        box.addByDescendant(earth);

        var flare, self = this;
        earth.getChildren().forEach(function (child) {
            if (child.getClient("type") == "flare") {
                flare = child;
                self.flare = child;
            }
        });

        camera.addPropertyChangeListener(function (e) {
            if (e.property == 'position' && earth.isVisible()) {
                var pos = e.newValue;
                var p = getHaloPos(pos);
                flare.setPosition(p.x, p.y, p.z);
            }
        });

        function getHaloPos(pos) {
            var len = Math.sqrt(Math.pow(pos.x, 2) + Math.pow(pos.y, 2) + Math.pow(pos.z, 2));
            if (!len) {
                return;
            }
            var k = len / 820;
            var x = pos.x / k;
            var y = pos.y / k;
            var z = pos.z / k;
            return { x: x, y: y, z: z }
        }
        camera.setPosition(-919.06, 1750, -2889.44);
    },

    dispose: function (delay) {
        delay = delay || 100;
        var self = this;
        setTimeout(function () {
            self._earthFloatAnimate.stop();
            self._earthFloatAnimate = undefined;
            self.network.getDataBox().clear();
            self.network.dispose();
            self.network = undefined;
            self._loaded = undefined;
            self.earth = undefined;
            $(self.parent).hide().empty();
        }, delay);

    }

});

EarthScene = EarthScene;

