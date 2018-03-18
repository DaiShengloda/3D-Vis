/**
 * 监听 3D 的场景变化，初始化 2d 视图
 * @param {*} sceneManager 
 */
var $HudScene = function (sceneManager) {
    this.sceneManager = sceneManager;
    this.dataManager = this.sceneManager.dataManager;
    this.autoMoveCameraTarget = false;
    this.box = main.sceneManager.network3d.getDataBox();
};

mono.extend($HudScene, it.EventHandler, {
    load: function (callback) {
        var self = this;
        it.util.loadJs(pageConfig.url('/theme/twaver-hud.js'), function () {
                it.util.loadJs(pageConfig.url('/theme/hud-components.js'), function () {
                    it.util.loadJs(pageConfig.url('/theme/hud-scene.js'), function () {
                        it.util.loadJs(pageConfig.url('/theme/hud-api.js'), function () {
                            main.sceneManager.viewManager3d.addEventHandler(self);
                            self.init2d(callback);
                        })
                    })
                })
            })
            //console.log(' HudScene .... ');
    },

    init2d: function (callback) {
        var self = this;
        // hud.imageUtil.isAutoBorderColor = true;
        // hud.imageUtil.isShowBorder = true;
        // hud.imageUtil.isShowSpaceBounds = true;
        // hud.imageUtil.isAutoSpaceBorderColor = true;
        var network3d = this.sceneManager.network3d;
        setTimeout(function () {
            network3d.setClearColor(0, 0, 0);
            network3d.setClearAlpha(0);
            network3d.setBackgroundImage(pageConfig.url('/theme/bg.png'));
        }, 2000);
        var parent = this.sceneManager.network3d.getRootView();
        var easyDraw = new hud.EasyDraw({
            designWidth: 1920 * 2, //4k 
            designHeight: 1080 * 2,
            width: 100,
            height: 100,
        });
        var rootView = easyDraw.getRootView();
        parent.appendChild(rootView);
        hud.util.autoAdjustBounds(easyDraw, parent, 'clientWidth', 'clientHeight');
        this.easyDraw = this.viewContext = easyDraw;

        var fontHtml = $('<span style="position:absolute;font-family:Pirulen;font-size:10px;margin-left:-500px;">Pirulen font</span>');
        hud.util.loadCss(pageConfig.url('/theme/Pirulen.css'), function () {
            $(document.body).append(fontHtml);
            fontHtml.show();
            setTimeout(function () {
                fontHtml.hide(0);
                self.sceneManager.addSceneChangeListener(self.sceneChangeHandler, self);
                var scene = hud.scene;
                scene.init();
                var shapes = scene.shapes;
                easyDraw.batchAdd(shapes);
                scene.initSelectedGroup(easyDraw);
                scene.initEvent(easyDraw);
                easyDraw.allShapeMap.navbar.children[0].selected = true;
                main.sceneManager.cameraManager.callback = function () {
                    self.sceneChangeFinishHandler();
                }
                callback && callback();
            }, 100)
        })
        main.sceneManager.viewManager3d.network.getRootView().addEventListener('click', function (e) {
            // self.closePop();
            // if (main.sceneManager._currentScene.getCategoryId() != 'map') return;
            var ele = main.sceneManager.viewManager3d.network.getElementsByMouseEvent(e);
            if (!ele || ele.length == 0) return;
            var node = ele[0].element;
            if (node.getClient('_curveLink')) {
                self.closePop();
                var linkId = node.getClient('linkId');
                self.showLineBaseInfoPos = ele[0].point;
                var pos = hud.scene.viewContext.getShapeAxisPos({
                    x: e.clientX,
                    y: e.clientY
                });
                //资产档案和周期检测点击联络线无事件
                if (hud.scene.scene._id == 'index') {
                    //首页点击联络线， 显示联络线基本参数
                    hud.scene.showLineBasicInfo(linkId, pos);
                } else if (hud.scene.scene._id == 'regionLine') {
                    //分区线损点击联络线，显示联络线送端电量信息
                    hud.scene.showRegionalEleStatistics(linkId, pos);
                } else if (hud.scene.scene._id == 'voltageLine') {
                    //分压线损点击联络线，显示联络线送端电量信息
                    hud.scene.showRegionalEleStatistics(linkId, pos);
                } else if (hud.scene.scene._id == 'region') {
                    hud.scene.showLineBasicInfo(linkId, pos);
                }
            } else if (node.getClient('_mapSector')) {
                self.closePop();
                var pos = hud.scene.viewContext.getShapeAxisPos({
                    x: e.clientX,
                    y: e.clientY
                });
                // var pos = main.sceneManager.network3d.getViewPosition(node.getWorldPosition());
                var regionId = node.getClient('regionId');
                hud.scene.showRegionStationPartition(regionId, pos);
            }

        });
        main.sceneManager.viewManager3d.network.getRootView().addEventListener('dblclick', function (e) {
            if (!self.autoMoveCameraTarget) return;
            var ele = main.sceneManager.viewManager3d.network.getElementsByMouseEvent(e);
            if (!ele || ele.length == 0) return;
            var point = ele[0].point;
            var camera = main.sceneManager.viewManager3d.network.getCamera();
            camera.lookAt(point.x, point.y, point.z);
            console.log('移动镜头视角。。。');
        });
        main.sceneManager.viewManager3d.addRenderCallback({
            onRenderCallback: function (a) {
                if (hud.scene.scene._id != 'region') return;
                if (main.plugin.hudScene.viewContext.allShapeMap['station_base_info'].visible) {
                    var node = main.sceneManager.getNodeByDataOrId(hud.scene.showStationBasicInfoId);
                    var pos = main.sceneManager.viewManager3d.network.getViewPosition(node.getWorldPosition());
                    var pos2 = hud.scene.viewContext.getShapeAxisPos(pos);
                    hud.scene.showStationBasicInfo(null, pos2);
                }
                if (main.plugin.hudScene.viewContext.allShapeMap['line_base_info'].visible) {
                    var pos2 = self.showLineBaseInfoPos;
                    var pos3 = main.sceneManager.network3d.getViewPosition(pos2);
                    var pos4 = hud.scene.viewContext.getShapeAxisPos(pos3);
                    hud.scene.showLineBasicInfo(null, pos4);
                }
            }
        });
    },
    saveCamera: function () {
        var node = main.sceneManager._currentRootNode;
        // main.sceneManager._currentRootNode.worldToLocal
        var camera = main.sceneManager.viewManager3d.network.getCamera();
        var p = node.worldToLocal(camera.p());
        var t = node.worldToLocal(camera.t());
        console.log('保存区域的视角：' + main.sceneManager._currentRootData.getId());
        main.cameraSetting.saveOrUpdateCamera(main.sceneManager._currentRootData.getId(), it.util.o2s({
            x: p.x,
            y: p.y,
            z: p.z
        }), it.util.o2s({
            x: t.x,
            y: t.y,
            z: t.z
        }));
    },
    sceneMap: {},
    changeRegion: null,
    sceneChangeHandler: function (e) {
        // console.log(e);
        // throw 'a'
        var self = this;
        var scene = hud.scene;
        self.closeLinkPointAnimate()
        var id = e.data.getId();
        if (hud.scene.isShowRegionSector) {
            hud.scene.hideRegionSector(); //判断是否显示billboard
        }
        if (hud.scene.isShowStationTesting) {
            hud.scene.hideStationTesting();
        }


        hud.scene.recoveryMap();
        if (e.oldData && e.oldData.getId() == 'map') {
            this.lastSceneId = scene.scene._id;
            scene.goto(id);
        } else if (id == 'map') {
            if (this.lastSceneId) {
                scene.goto(this.lastSceneId);
                if (this.lastSceneId == 'asset') {
                    hud.scene.showRegionSector(); //回到1屏判断当前页面，加载billboard
                }
                if (this.lastSceneId == 'scene') {
                    hud.scene.showStationTesting();
                }
                delete this.lastSceneId;
            } else {
                scene.goto('index');
            }
        } else {
            scene.goto(id);
        }

        if (e.oldData && e.oldData.getId() == 'dataCenter') {
            for (var p in self.connLinkMap) {
                main.sceneManager.viewManager3d.network.dataBox.remove(self.connLinkMap[p]);
            }
            for (var p in self.connLinkLabelMap) {
                main.sceneManager.viewManager3d.network.dataBox.remove(self.connLinkLabelMap[p]);
            }
        } else if (e.oldData && e.oldData.getId() == 'region') {
            for (var p in self.regionLinkLabelMap) {
                main.sceneManager.viewManager3d.network.dataBox.remove(self.regionLinkLabelMap[p]);
            }
        }

        if (self.changeRegion) {
            self.changeRegion.getChildren().forEach(function (chNode) {
                if (chNode.getClient('oid') == 'area') {
                    var changeRegionSrc = chNode.getStyle('m.texture.image');
                    var restoreSrc = changeRegionSrc[0].replace('-new', "");
                    chNode.setStyle('m.texture.image', restoreSrc);
                    chNode.setScale(1, 1, 1)
                    chNode.setPositionY(0);
                } else if (chNode.getClient('oid') == 'shadow') {
                    chNode.setPositionY(0);
                }
            })
            self.changeRegion = null;
        }
        if (id == 'region') {
            var data = main.sceneManager._currentRootData;
            var catalog = data.getDataTypeId();
            var image = catalog + '-new.jpg';
            var src = './theme/models/' + catalog + '/' + image;
            var node = main.sceneManager._currentRootNode;
            self.changeRegion = node;
            var chNodes = node.getChildren();
            chNodes.forEach(function (chNode) {
                if (chNode.getClient('oid') == 'area') {
                    chNode.setStyle('m.texture.image', src);
                    chNode.setScale(1, 0.3, 1)
                    chNode.setPositionY(22);
                } else if (chNode.getClient('oid') == 'shadow') {
                    chNode.setPositionY(42);
                }
            })
            var regionId = e.rootData.getId();
            if (regionId == 'buguan' || regionId == 'hainan' || regionId == 'taiwan' || regionId == 'nanfang') {
                var regionChart = ['region_line_statistics', 'station_overhaul_company', 'region_contactLine_statistics',
                    'region_station_number', 'region_small_map'
                ];
                hud.scene.setVisible(regionChart, false)
            } else {
                hud.scene.goToRegionScene(regionId);
            }
        } else if (id == 'dataCenter') {
            var stationId = e.rootData.getId();
            hud.scene.goToStationScene(stationId);
        }
        this.closePop();
        hud.scene.hideRackChildrenInfo();
        if (id == 'map') {
            var dcMap = main.sceneManager.dataManager.getDataMapByCategory('dataCenter');
            if (dcMap) {
                Object.keys(dcMap).forEach(function (key) {
                    if (!main.sceneManager.isCurrentSceneInstance(key)) return;
                    var rotation = self.getStationRotation(key);
                    var node = main.sceneManager.getNodeByDataOrId(key);
                    node.setRotation(rotation[0] / 180 * Math.PI, rotation[1] / 180 * Math.PI, 0);
                })
            }
        }
    },
    sceneChangeFinishHandler: function () {
        var self = this;
        var id = main.sceneManager.getCurrentScene().getId();
        if (hud.scene.isShowStationTestNum) {
            hud.scene.hideStationTestNum();
        } else {
            hud.scene.showStationTestNum();
        }
        if (id == 'map' || id == 'region') {
            if (id == 'map') {
                var dcMap = main.sceneManager.dataManager.getDataMapByCategory('dataCenter');
                if (dcMap) {
                    Object.keys(dcMap).forEach(function (key) {
                        var data = dcMap[key];
                        self.translatePos(data);
                    })
                }
            }
            self.closeLinkPointAnimate();
            self.loadLinks(id);
            self.linkPointAnimate();
            // translatePos()
        } else if (id == 'dataCenter') {
            self.loadConnLinks(id);
        }
        this.closePop();
        var network3d = main.sceneManager.network3d;
        network3d.setClearColor(0, 0, 0);
        network3d.setClearAlpha(0);
        network3d.setBackgroundImage(pageConfig.url('/theme/bg.png'));
    },
    closePop: function () {
        hud.scene.hideStationBasicInfo();
        hud.scene.hideStationBasicInfoEchart();
        hud.scene.hideLineBasicInfo();
        hud.scene.hideRegionalEleStatistics();
        hud.scene.hideWireDiagram();
        // hud.scene.recoveryMap();
        hud.scene.hideStationInspectInfo();
        hud.scene.hideRegionStationPartition();
        hud.scene.hideVTInfo();
        hud.scene.removeRegionSelect();
        hud.scene.cancelClickMeterPoint();
        this.cancel_meterPoint_selected();
        //清除选中状态的node
        var m = main.sceneManager.network3d.dataBox.getSelectionModel();
        m.clearSelection();
        hud.scene.hideWarningDetails();

        hud.scene.defaultVoltLevelLines();
        hud.scene.defaultLevelLineData();
    },
    linkNodeMap: {},
    regionLinkLabelMap: {},
    topLinkNodeMap: {},
    //全国区域和单个区域时，显示线路
    loadLinks: function (categoryId) {
        var self = this;
        var dataMap = null;
        //取得所有的线路（非联络线）
        var links = main.sceneManager.dataManager.getLinks().filter(function (link) {
            var type = link.getUserData('type') + '';
            return type == '1';
        });
        links.forEach(function (link) {
            var id = link.getId();
            var fromId = link.getFromId();
            var toId = link.getToId();

            var b1 = main.sceneManager.isCurrentSceneInstance(fromId);
            var b2 = main.sceneManager.isCurrentSceneInstance(toId);
            if (!b1 && !b2) {
                //两端都不在当前场景中
                return;
            }
            var isTop = (!b1 || !b2);
            var radius = main.sceneManager._currentScene.getId() == 'map' ? 0.3 : 0.3;
            //有一端端点在外的线路，往上弯曲，否则往下弯曲
            if (self.linkNodeMap[id] && !isTop) {
                //已经缓存了 link node
                var linkNode = self.linkNodeMap[id];
                linkNode.setRadius(radius);
                main.sceneManager.viewManager3d.network.dataBox.add(linkNode);
                return;
            }

            dataMap = dataMap || main.sceneManager.dataManager.getDataMapByCategory('dataCenter');
            if (!dataMap[fromId] || !dataMap[toId]) {
                //错误线路，缺失端点
                return;
            }
            var startPoint, endPoint, color = 'green';

            if (isTop) {
                var oldLink = self.linkNodeMap[id];
                startPoint = oldLink.getClient('startPoint');
                endPoint = oldLink.getClient('endPoint');
                color = oldLink.getClient('color');
            } else {
                var fromNode = main.sceneManager.getNodeByDataOrId(fromId);
                fromNode = fromNode._clientMap.simpleNode || fromNode;
                var fromOffset = self.getLinkOffset(fromId);
                var toNode = main.sceneManager.getNodeByDataOrId(toId);
                toNode = toNode._clientMap.simpleNode || toNode;
                var toOffset = self.getLinkOffset(toId);;
                var fromPos = fromNode.getWorldPosition();
                var toPos = toNode.getWorldPosition();
                startPoint = [fromPos.x + fromOffset.x, fromPos.y + fromOffset.y, fromPos.z + fromOffset.z];
                endPoint = [toPos.x + toOffset.x, toPos.y + toOffset.y, toPos.z + toOffset.z];
                color = 'green';
                var volt = link.getUserData('volt');
                if (volt) {
                    volt = volt.toLowerCase();
                    if (!voltMap[volt]) {
                        console.warn('线路的电压等级不存在：' + volt + '  id:' + link.getId(), voltMap, link);
                    } else {
                        color = voltMap[volt]
                    }
                } else {
                    console.warn('线路的电压等级为空');
                }

            }

            var linkNode = make.Default.load({
                id: 'twaver.idc.curveLink',
                startPoint: startPoint,
                endPoint: endPoint,
                color: color,
                radius: radius,
                isTop: isTop,
                offset: 10,
                xOffset: 10,
                // offsetScale: 0.4,
            });
            main.sceneManager.viewManager3d.network.dataBox.add(linkNode);
            if (isTop) {
                self.topLinkNodeMap[id] = linkNode;
            }
            //首次进入，应该都是向下弯曲，避免区域场景中向上弯曲的线路覆盖了向下弯曲的
            if (!isTop || !self.linkNodeMap[id]) {
                linkNode.setClient('startPoint', startPoint);
                linkNode.setClient('endPoint', endPoint);
                linkNode.setClient('color', color);
                linkNode.setClient('_curveLink', true);
                linkNode.setClient('linkId', id);
                self.linkNodeMap[id] = linkNode;
            }

            //一端为外部时增加文字label
            var label = '',
                scale = 0.4,
                labelPos = [];

            if (!b1 && b2) {
                if (self.regionLinkLabelMap[id + fromId]) {
                    var labelNode = self.regionLinkLabelMap[id + fromId];
                    main.sceneManager.viewManager3d.network.dataBox.add(labelNode);
                    return;
                }
                labelPos = startPoint;
                label = '到' + main.sceneManager.dataManager.getDataById(fromId).getUserData('area').substr(0, 2);
                var labelNode = self.createLinkLabel(label, {
                    x: labelPos[0],
                    y: labelPos[1],
                    z: labelPos[2]
                }, scale);
                main.sceneManager.viewManager3d.network.dataBox.add(labelNode);
                self.regionLinkLabelMap[id + fromId] = labelNode;
            } else if (b1 && !b2) {
                if (self.regionLinkLabelMap[id + toId]) {
                    var labelNode = self.regionLinkLabelMap[id + toId];
                    main.sceneManager.viewManager3d.network.dataBox.add(labelNode);
                    return;
                }
                labelPos = endPoint;
                label = '到' + main.sceneManager.dataManager.getDataById(toId).getUserData('area').substr(0, 2);
                var labelNode = self.createLinkLabel(label, {
                    x: labelPos[0],
                    y: labelPos[1],
                    z: labelPos[2]
                }, scale);
                main.sceneManager.viewManager3d.network.dataBox.add(labelNode);
                self.regionLinkLabelMap[id + toId] = labelNode;
            }
        })
    },
    getLinkOffset: function (id) {
        var offset = {
            x: 0,
            y: 0,
            z: 0
        };
        // var data = main.sceneManager.dataManager.getDataById(id);
        var dataType = main.sceneManager.dataManager.getDataTypeForData(id);
        var dataTypeId = dataType.getId();
        if (dataTypeId == 'fengli') {
            offset.z = 10;
        } else if (dataTypeId == 'biandian') {
            offset.x = 5;
            offset.z = 2;
        } else if (dataTypeId == 'shuidian') {
            offset.y = 6;
        } else if (dataTypeId == 'huanliu') {
            offset.y = 0;
            offset.z = 4;
        } else {
            offset.y = 0;
        }
        return offset;
    },
    getStationRotation: function (id) {
        var rotation = [];
        // var data = main.sceneManager.dataManager.getDataById(id);
        var dataType = main.sceneManager.dataManager.getDataTypeForData(id);
        var dataTypeId = dataType.getId();
        if (dataTypeId == 'fengli') {
            rotation = [-60, 90, 0];
        } else if (dataTypeId == 'biandian') {
            rotation = [-40, 40, 0];
        } else if (dataTypeId == 'shuidian') {
            rotation = [-60, 60, 0];
        } else if (dataTypeId == 'huodian') {
            rotation = [-60, 60, 0];
        } else {
            rotation = [-60, 60, 0];
        }
        return rotation;
    },

    linkPointBillboardMap: {},
    linkPointAnimate: function () {
        var self = this;
        var links = [];
        var num = 0;
        var nodeMap = {};
        var currentSceneId = main.sceneManager._currentScene.getId();
        //第一次进入 创建光点

        for (var k in self.linkNodeMap) {
            if (!self.linkPointBillboardMap[k]) {
                var point = self.createBillboard();
                point.setScale(6, 6, 6);
                point.setParent(self.linkNodeMap[k]);
                point.setClient("pointId", k);
                self.linkPointBillboardMap[k] = point;
            }
        }
        //判断是否是首屏页面 如果是这直接难道所有连线 如果不是拿到相应的连线
        if (currentSceneId !== "map") {
            var links = main.sceneManager.dataManager.getLinks().filter(function (link) {
                var type = link.getUserData('type') + '';
                return type == '1';
            });
            links.forEach(function (link) {
                var id = link.getId();
                var fromId = link.getFromId();
                var toId = link.getToId();
                var b1 = main.sceneManager.isCurrentSceneInstance(fromId);
                var b2 = main.sceneManager.isCurrentSceneInstance(toId);
                if (b1 || b2) {
                    if (self.topLinkNodeMap[id]) {
                        nodeMap[id] = self.topLinkNodeMap[id];
                    } else {
                        nodeMap[id] = self.linkNodeMap[id];
                    }
                }
            })
        } else {
            nodeMap = self.linkNodeMap;
        }
        self.animate = setInterval(function () {
            if (num > 1) {
                num = 0;
            }
            for (var k in self.linkPointBillboardMap) {
                var billboardNode = self.linkPointBillboardMap[k]
                var pId = billboardNode.getClient("pointId");
                var node = nodeMap[pId];
                if (!node) {
                    continue;
                }
                //拿到连线上每隔num段的点的坐标
                var position = node.getPointAt(num);
                billboardNode.p(position.x, position.y + 2, position.z);
                self.box.add(billboardNode);
            }
            num += 0.005;
        }, 10)
    },
    createBillboard: function (position) {
        var billboard = new mono.Billboard();
        billboard.s({
            'm.texture.image': '../theme/models/light.png',
            'm.transparent': true,
            'm.opacity': 1.0,
        });
        billboard.setScale(15, 25, 15);
        return billboard;
    },
    closeLinkPointAnimate: function () {
        var self = this;
        clearInterval(self.animate);
        for (var k in self.linkPointBillboardMap) {
            self.box.remove(self.linkPointBillboardMap[k]);
        }
    },
    //进入厂站场景后，显示联络线
    connLinkMap: {},
    connLinkLabelMap: {}, //缓存所有联络线对端的 label
    loadConnLinks: function () {
        var self = this;
        var parentId = main.sceneManager._currentRootData.getId();
        var points = main.sceneManager.dataManager.getChildren(main.sceneManager._currentRootData, 'inputPoint');
        var outPoints = main.sceneManager.dataManager.getChildren(main.sceneManager._currentRootData, 'outputPoint');
        outPoints.forEach(function (v, i) {
            points.push(v);
        })
        if (!points || points.length == 0) return;
        points.forEach(function (point) {
            var id = point.getId();
            var linkId = point.getUserData('link_id');
            if (!linkId) {
                console.warn('计量点没有配置联络线：', point);
                return;
            };
            var link = main.sceneManager.dataManager.getLinkById(linkId);
            if (!link) {
                console.warn('计量点的联络线在线路列表中找不到：', point);
                return;
            }
            if (self.connLinkMap[id]) {
                var linkNode = self.connLinkMap[id];
                main.sceneManager.viewManager3d.network.dataBox.add(linkNode);
                var labelNode = self.connLinkLabelMap[id];
                main.sceneManager.viewManager3d.network.dataBox.add(labelNode);
                return;
            }

            var node = main.sceneManager.getNodeByDataOrId(point);
            var pos = node.getWorldPosition();
            var radius = 2;
            var start = [pos.x, pos.y, pos.z];
            var end = self.linkDirection(main.modelRotation[id], link, parentId, pos)
            var color = link.getFromId() == parentId ? '#00b1ff' : 'rgba(0, 178, 255, 1)';
            var linkNode = make.Default.load({
                id: 'twaver.idc.curveLink',
                startPoint: start,
                endPoint: end,
                color: color,
                radius: radius,
                isTop: true,
                offsetScale: 0.6,
            });
            self.connLinkMap[id] = linkNode;
            main.sceneManager.viewManager3d.network.dataBox.add(linkNode);
            var label = '';
            var targetId = link.getFromId() == parentId ? link.getToId() : link.getFromId();
            var target = main.sceneManager.dataManager.getDataById(targetId);
            label = target.getName() || targetId;
            var labelNode = self.createLinkLabel(label, {
                x: end[0],
                y: end[1] - 40,
                z: end[2] + 10
            });
            self.connLinkLabelMap[id] = labelNode;
            main.sceneManager.viewManager3d.network.dataBox.add(labelNode);

        })

    },

    linkDirection: function (rotation, link, parentId, pos) {
        var end;
        switch (rotation) {
            case 0:
                end = link.getFromId() == parentId ? [pos.x - 200, pos.y, pos.z] : [pos.x - 400, pos.y, pos.z];
                break;
            case -Math.PI:
            case Math.PI:
                end = link.getFromId() == parentId ? [pos.x + 200, pos.y, pos.z] : [pos.x + 400, pos.y, pos.z];
                break;
            case Math.PI / 2:
                end = link.getFromId() == parentId ? [pos.x, pos.y, pos.z + 200] : [pos.x, pos.y, pos.z + 400];
                break;
            case -Math.PI / 2:
                end = link.getFromId() == parentId ? [pos.x, pos.y, pos.z - 200] : [pos.x, pos.y, pos.z - 400];
                break;
        }
        return end;
    },

    createLinkLabel: function (label, pos, scale) {
        var c = this.getLabelContent(label);
        var board = new mono.Billboard();
        board.s({
            'm.texture.image': c,
            'm.transparent': true,
            'm.alignment': mono.BillboardAlignment.bottomCenter,
            'm.vertical': false,
            'm.texture.wrapS': TGL.ClampToEdgeWrapping,
            'm.texture.wrapT': TGL.ClampToEdgeWrapping
        });
        if (scale) {
            board.setScale(c.width * scale, c.height * scale, 1);
        } else {
            board.setScale(c.width, c.height, 1);
        }
        board.setSelectable(false);
        board.setPosition(pos.x, pos.y, pos.z);
        return board;
    },
    getLabelContent: function (label) {
        var size = 26;
        var font = size + 'px "Microsoft YaHei",微软雅黑';
        var canvas = document.createElement('canvas');
        var g = canvas.getContext('2d');
        g.font = font;
        var width = g.measureText(label).width;
        var height = size;
        width = mono.Utils.nextPowerOfTwo(width);
        height = mono.Utils.nextPowerOfTwo(height);
        canvas.width = width;
        canvas.height = height;
        g.font = font;
        g.fillStyle = 'rgba(0, 255, 255, 1)';
        g.textAlign = 'center';
        g.textBaseline = 'top';
        g.fillText(label, width / 2, 0);
        return canvas;
    },
    shouldHandleClickBackground: function (element, network, data, clickedObj) {
        return true;
    },
    handleClickBackground: function (element, network, data, clickedObj) {
        //
        this.closePop();
    },
    shouldHandleClickElement: function (element, network, data, clickedObj) {
        if (!data) return false;
        var getDataTypeId = data.getDataTypeId() ? data.getDataTypeId() : '';
        if (getDataTypeId == "inputPoint" || getDataTypeId == "outputPoint") {
            return true;
        }
        if (/[b|B]illboard/.test(element.getClassName())) {
            return false;
        }
        return !!data;
    },
    handleClickElement: function (element, network, data, clickedObj) {
        var dataType = main.sceneManager.dataManager.getDataTypeForData(data);
        if (!dataType) return;
        var categoryId = dataType.getCategoryId();

        var s = 'action_' + categoryId + '_' + dataType.getId();
        if (this[s]) {
            this.closePop();
            this[s](element, network, data, clickedObj, dataType, categoryId);
            return;
        }
        var s = 'action_' + categoryId;
        if (this[s]) {
            this.closePop();
            this[s](element, network, data, clickedObj, dataType, categoryId);
            return;
        }
        console.log('没有找到：' + s);
        this.closePop();
        //将事件分发到 category 或者 dataType 上
    },
    action_region: function (element, network, data, clickedObj, dataType, categoryId) {
        if (main.sceneManager._currentScene.getId() == 'region') return;
        this.closePop();
        var dataId = data.getId();
        if (dataId == 'buguan' || dataId == 'hainan' || dataId == 'taiwan' || dataId == 'nanfang') {
            return
        }
        var n = main.sceneManager.getNodeByDataOrId(data);
        var ch = n.getChildren();
        ch.forEach(function (c) {
            if (c.getClient('oid') == 'area') {
                c.setStyle('m.opacity', .5);
            }
        })
    },
    action_dataCenter: function (element, network, data, clickedObj, dataType, categoryId) {
        console.log('有人点击了厂站' + data.getId() + '哦');
        //计算3d 坐标在屏幕上的投影
        var pos = network.getViewPosition(element.getWorldPosition());
        //计算屏幕上的投影在2d 中的坐标
        var pos2 = hud.scene.viewContext.getShapeAxisPos(pos);
        if (hud.scene.scene._id == 'asset') {
            //资产档案点击厂站，显示厂站的图表信息
            hud.scene.showStationBasicInfoEchart(data.getId(), pos2);
        } else if (hud.scene.scene._id == 'regionLine') {
            //分区线损点击厂站，显示厂站的文字信息
            hud.scene.showStationBasicInfo(data.getId(), pos2);
        } else if (hud.scene.scene._id == 'index') {
            //首页点击厂站，显示厂站的文字信息
            hud.scene.showStationBasicInfo(data.getId(), pos2);
        } else if (hud.scene.scene._id == 'scene') {
            //现场检测点击厂站，显示厂站检验信息
            hud.scene.showStationInspectInfo(data.getId(), pos2);
        } else if (hud.scene.scene._id == 'voltageLine') {
            //分压线损点击厂站，无显示信息
        } else if (hud.scene.scene._id == 'region') {
            hud.scene.showStationBasicInfo(data.getId(), pos2);
        }
        var currentSceneId = main.sceneManager._currentScene.getId();
        if (currentSceneId == 'map' || currentSceneId == 'region') {
            var node = element;
            node.setStyle('select.style', 'outline.glow');
            node.setStyle('select.color', '#2fa0ff');
            node.setClient('isSelectable', true);
            node.setSelected(true);
        }
    },
    action_pinggui: function (element, network, data, clickedObj, dataType, categoryId) {
        var id = data.getId();
        hud.scene.hideRackChildrenInfo();
        hud.scene.showRackChildrenInfo(id);
    },
    action_electricEnergyMeter: function (element, network, data, clickedObj, dataType, categoryId) {
        var viewContext = hud.scene.viewContext;
        var id = data.getId();
        hud.scene.hideVTInfo();
        hud.scene.showVTInfo(id, viewContext);

        var node = main.sceneManager.getNodeByDataOrId(id);
        node.setStyle('select.style', 'outline.glow');
        node.setStyle('select.color', '#2fa0ff');
        node.setClient('isSelectable', true);
        node.setSelected(true);
        // var m = main.sceneManager.network3d.dataBox.getSelectionModel();
        // m.appendSelection(node);
    },
    action_meterPoint: function (element, network, data, clickedObj, dataType, categoryId) {
        var stationNode = main.sceneManager._currentRootNode;
        var stationData = main.sceneManager._currentRootData;
        var stationId = stationData.getId();

        var box = main.sceneManager.network3d.getDataBox();
        element.setScale(120, 120, 2);
        var pos = element.getPosition();
        var linkId = data.getUserData('link_id');
        var linkData = main.sceneManager.dataManager.getLinkById(linkId);
        var selectedIcon = linkData.getFromId() == stationId ? 'pointSelected_out' : 'pointSelected_in';
        var node = hud.scene.createStationTestIcon(pos, selectedIcon);
        node.setScale(1, 1, 1);
        node.setRotation(Math.PI / 2, 0, 0);
        node.setParent(stationNode);
        box.add(node);

        this.selectedMeterPoint = element;
        this.selectedMeterPointIcon = node;

        var id = data.getId();
        hud.scene.clickMeterPoint();
        hud.scene.getMeterPointInfo(id);
    },
    cancel_meterPoint_selected: function () {
        var box = main.sceneManager.network3d.getDataBox();
        if (this.selectedMeterPoint) {
            this.selectedMeterPoint.setScale(60, 60, 1);
            this.selectedMeterPoint = null;
        }
        if (this.selectedMeterPointIcon) {
            this.selectedMeterPointIcon.setParent(null);
            box.remove(this.selectedMeterPointIcon);
            this.selectedMeterPointIcon = null;
        }
    },
    location: {
        '000013': { //huadong
            longitude: {
                max: 123,
                min: 114.9
            },
            latitude: {
                max: 35.3,
                min: 23.5
            }
        },
        '000012': { //huazhong
            longitude: {
                max: 118.5,
                min: 108.3
            },
            latitude: {
                max: 36.4,
                min: 24.1
            }
        },
        '000011': { //huabei
            longitude: {
                max: 122.7,
                min: 110.2
            },
            latitude: {
                max: 42.6,
                min: 34.4
            }
        },
        '000002': { //nanfang
            longitude: {
                max: 117.3,
                min: 97.5
            },
            latitude: {
                max: 29.6,
                min: 18.2
            }
        },
        '000015': { //xinan
            longitude: {
                max: 108.5,
                min: 78.4
            },
            latitude: {
                max: 36.5,
                min: 26.1
            }
        },
        '000016': { //xibei
            longitude: {
                max: 111.2,
                min: 73.4
            },
            latitude: {
                max: 49.1,
                min: 31.4
            }
        },
        '000014': { //dongbei
            longitude: {
                max: 135.1,
                min: 114.3
            },
            latitude: {
                max: 53.6,
                min: 38.7
            }
        }
    },
    translatePos: function (data) {
        if (data.getExtend() && data.getExtend().calc) {
            //console.log(data.getId() + ' 物理地址已经计算，跳过');
            return;
        }
        var parentData = main.sceneManager.dataManager.getDataById(data.getParentId());
        var parentNode = main.sceneManager.getNodeByDataOrId(parentData);
        // var parentDataTypeId = main.sceneManager.dataManager.getDataTypeForData(parentData).getId();
        // var parentPosition = parentData.getPosition();
        var parentId = parentData.getId();
        var parentSize = it.Util.getBoundingBox(parentNode).size();
        var loc = this.location[parentId];
        if (!loc) {
            console.error('厂站的所在区域不存在：' + parentId);
            return;
        }
        var p = {};
        // var max = parentNode.boundingBox.max;
        // var min = parentNode.boundingBox.min;
        var center = parentNode.boundingBox.center();
        var wrapX = parentSize.x / (loc.longitude.max - loc.longitude.min);
        var wrapZ = parentSize.z / (loc.latitude.max - loc.latitude.min);
        var dLon = data.getUserData('longitude') - loc.longitude.max;
        var dLat = data.getUserData('latitude') - loc.latitude.max;
        p.x = dLon * wrapX + parentSize.x / 2 + center.x;
        p.y = 30;
        p.z = -dLat * wrapZ - parentSize.z / 2 + center.z;
        console.log(data.getId() + ' 物理地址 :' + JSON.stringify(p));
        data.setPosition(p.x, p.y, p.z);
        var ext = data.getExtend() || {};
        ext.calc = true;
        var d = {
            ii: data.getIi(),
            id: data.getId(),
            position: p,
            extend: ext
        }
        var node = main.sceneManager.getNodeByDataOrId(data);
        node.setPosition(p.x, p.y, p.z);
        it.util.api('data', 'update', d, console.log, console.error);
    },
});

it.HudScene = $HudScene;