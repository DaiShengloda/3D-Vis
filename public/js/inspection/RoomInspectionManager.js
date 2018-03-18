/**
 * 机房巡检,按照轨迹,巡检机房
 * @param sceneManager
 * @constructor
 */
var RoomInspectionManager = function (sceneManager) {

    BaseInspectionManager.call(this, sceneManager);

    this.data = null;
    this.closeDataInspectionAuto = true;
    this.closeDataInspectionTime = 3000;

    this.showReportDialogId = 'inspection-report-btn';
    this.showReportViewId = 'inspection-view-btn';

    this.inspectionPathMap = {};//保存当前楼层所有的巡检路径, key为巡检路径编号
    this.inspectionPointMap = {};//保存当前楼层所有的巡检区域, key为关联区域的编号

    this.inspectionDataArray = []; //保存当前巡检路径,巡检过程中,产生的巡检数据

    this.inspectionDataMap = {}; //如果是播放巡检记录,保存当前巡检记录的巡检数据

    this.isPlayInspectionReport = false;//是否是播放巡检报告

    this.isShowInspectionView = false;// 是否显示巡检视图

    this.spheres = [];//保存当前巡检点的集合

    this.inspectionPositionY = 310;

    this.moveSpeed = 1.5;

    this.isCameraFollow = true;

    this.defaultRoomColor = '#abc';

    this.arrowColor = '#21D19C';

    this.init();
};

mono.extend(RoomInspectionManager, BaseInspectionManager, {

    /******************************* 巡检相关  ***********************************/

    /**
     * 初始化
     */
    init: function () {

        var self = this;
        this.menuBox.on('click', 'li', function () {
            var id = $(this).attr('id');
            if (id == 'inspection-view-btn') {
                if (self.isShowInspectionView) {
                    self.resetInspectionView();
                } else {
                    self.stop();
                    self.showInspectionView();
                }
            } else if (id == 'inspection-report-btn') {
                self.showReportDialog();
            } else {
                var inspectionPath = self.inspectionPathMap[id];
                if (self.isShowInspectionView) {
                    self.resetInspectionView();
                }
                self.inspect(inspectionPath, true);
            }
        })

        make.Default.load('twaver.idc.worker', function (host) {
            var updater = function (element) {
                if (element && element.getChildren()) {
                    element.getChildren().forEach(function (child) {
                        child.setStyle('m.normalType', mono.NormalTypeSmooth);
                        updater(child);
                    });
                }
            }
            updater(host);
            host.setScale(3, 3, 3);
            host.setPositionY(5);
            self.setHost(host);
        });
        //var host = new mono.Billboard();
        //host.s({
        //    'm.texture.image': 'images/postPeople.png',
        //    'm.alignment': mono.BillboardAlignment.bottomCenter,
        //    'm.transparent': true,
        //    'm.vertical': false,
        //    'm.color': 'blue',
        //});
        //host.setScale(200, 400, 301);
        //host.setPositionY(this.inspectionPositionY);
        //self.setHost(host);

        this.sceneManager.viewManager3d.addPropertyChangeListener(function (event) {
            // console.log(event);
            if (event.property == "focusNode") {
                self.stop();
            }
        })

        if (!it.util.dataTypeArray || it.util.dataTypeArray.length == 0) {
            it.util.loadDataTypes();
        }
        if (!it.util.categoryArray || it.util.categoryArray.length == 0) {
            it.util.loadCategories();
        }
    },

    /**
     * 刷新巡检按钮
     * @param data
     */
    refreshMenu: function (data) {

        if (!data) {
            return;
        }
        var self = this;
        this.data = data;
        this.inspectionPathMap = {};
        this.inspectionPointMap = {};
        this.menuBox.empty();

        it.util.search('inspection_path', {parentId: data.getId()}, function (inspectionPathArray) {
            inspectionPathArray.forEach(function (inspectionPath) {

                self.inspectionPathMap[inspectionPath.id] = inspectionPath;

                //var menu = $('<li><a href="#"><i class="mo-inspection"></i><span></span></a></li>');
                //menu.attr('id', inspectionPath.id);
                //menu.find('span').text('路径-' + inspectionPath.name);
                //menu.appendTo(self.menuBox);


                it.util.search('inspection_point', {parentId: inspectionPath.id}, function (inspectionPointArray) {
                    inspectionPath.inspectionPoints = inspectionPointArray;
                    inspectionPointArray.forEach(function (inspectionPoint) {
                        if (inspectionPoint.inspectionAreaId) {
                            self.inspectionPointMap[inspectionPoint.inspectionAreaId] = inspectionPoint;
                        }
                    })
                })
            })
        })

        var menu = $('<li><a href="#"><i class="mo-inspection"></i><span></span></a></li>');
        menu.attr('id', this.showReportViewId);
        menu.find('span').text(it.util.i18n("RoomInspectionManager_Inspection_visualization"));
        menu.appendTo(self.menuBox);

        var menu = $('<li><a href="#"><i class="mo-inspection"></i><span></span></a></li>');
        menu.attr('id', this.showReportDialogId);
        menu.find('span').text(it.util.i18n("RoomInspectionManager_Inspection_report"));
        menu.appendTo(self.menuBox);

    },

    /**
     * 显示巡检轨迹
     */
    showInspectionTrail: function () {
        var self = this;
        this.trails = [];
        this.spheres = [];
        var node = this.sceneManager.getNodeData(this.data);
        var keys = Object.keys(this.inspectionPathMap);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var inspectionPath = this.inspectionPathMap[key];
            var path = self.parsePath(inspectionPath.path);
            var trail = self.createTrail(path);
            self.trails.push(trail);
            trail.setParent(node);
            trail.setPositionY(self.inspectionPositionY);
            trail.setClient('inspectionPath', inspectionPath);
            self.box.add(trail);

            this.showInspectionPointNode(inspectionPath);
        }
    },

    /**
     * 隐藏巡检轨迹
     */
    hideInspectionTrail: function () {
        var self = this;
        this.trails.forEach(function (trail) {
            trail.setParent(null);
            self.box.remove(trail);
        })
        this.trails = [];
    },

    showArrow: function () {

        this.arrows = [];
        for (var i = 0; i < 14; i++) {
            var arrow = new mono.Cylinder(5, 35, 150);
            arrow.s({
                'm.color': this.arrowColor,
                'm.ambient': this.arrowColor,
            });
            arrow.setPositionY(this.inspectionPositionY);
            this.arrows.push(arrow);
            this.box.add(arrow);
        }

        this.updateArrow(0, -3170, 1562, -Math.PI / 2, 0, 0);
        this.updateArrow(1, -3170, 200, -Math.PI / 2, 0, 0);
        this.updateArrow(2, -3170, -1800, -Math.PI / 2, 0, 0);

        this.updateArrow(3, 100, -2813, 0, 0, -Math.PI / 2);

        this.updateArrow(4, 3455, 1562, Math.PI / 2, 0, 0);
        this.updateArrow(5, 3455, 200, Math.PI / 2, 0, 0);
        this.updateArrow(6, 3455, -1800, Math.PI / 2, 0, 0);

        this.updateArrow(7, -2418, -70, 0, 0, -Math.PI / 2);
        this.updateArrow(8, -1218, -70, 0, 0, -Math.PI / 2);
        this.updateArrow(9, 800, -70, 0, 0, -Math.PI / 2);
        this.updateArrow(10, 2600, -70, 0, 0, -Math.PI / 2);

        this.updateArrow(11, 2800, 36, 0, 0, Math.PI / 2);
        this.updateArrow(12, 1200, 36, 0, 0, Math.PI / 2);
        this.updateArrow(13, -800, 36, 0, 0, Math.PI / 2);

    },
    hideArrow: function () {
        for (var i = 0; i < this.arrows.length; i++) {
            var arrow = this.arrows[i];
            this.box.remove(arrow);
        }
        this.arrows = [];
    },
    updateArrow: function (i, x, z, rx, ry, rz) {
        var arrow = this.arrows[i];
        arrow.setPositionX(x);
        arrow.setPositionZ(z);
        arrow.setRotation(rx, ry, rz);
    },
    /**
     * 显示巡检视图
     */
    showInspectionView: function () {

        var self = this;

        if (this.isShowInspectionView) {
            return;
        }
        this.isShowInspectionView = true;


        this.showRooms();
        this.showArrow();
        this.showInspectionTrail();

        var rooms = this.rooms;
        rooms.forEach(function (room) {
            self.visibleManager.setVisibleByDescendant(room, false);
            self.visibleManager.setVisible(room, true);
        })

        main.sceneManager.viewManager3d.enableMouseup = true;//开启点击

        //取得最后一次area的巡检状态
        var roomMap = this.roomMap;

        it.util.api('inspection_area', 'lastStatus', {}, function (result) {

            var delay = 100;
            result.forEach(function (item) {
                if (roomMap[item.inspectionAreaId]) {
                    var room = roomMap[item.inspectionAreaId];
                    var color = item.status ? 'green' : 'red';
                    setRoomColor(room, color, delay += 700);
                }
            })
        })

        function setRoomColor(room, color, delay) {

            setTimeout(function () {
                var node = self.sceneManager.getNodeByDataOrId(room);
                node.s({
                    'm.color': color,
                    'm.ambient': color,
                })
            }, delay)
        }
    },

    /**
     * 恢复巡检视图
     */
    resetInspectionView: function () {


        if (!this.isShowInspectionView) {
            return;
        }
        var self = this;
        this.isShowInspectionView = false;
        var rooms = this.rooms;
        //显示所有的机房, 并且隐藏机房内部
        rooms.forEach(function (room) {
            self.visibleManager.setVisibleByDescendant(room, true);
        })
        this.hideRoom();
        this.hideArrow();
        this.hideInspectionTrail();
        this.hideInspectionPoint();

        main.sceneManager.viewManager3d.enableMouseup = false;//关闭点击
    },


    /**
     *  显示巡检点
     * @param inspectionPath
     */
    showInspectionPointNode: function (inspectionPath) {

        var self = this;

        var points = inspectionPath.inspectionPoints;
        points.forEach(function (inspectionPoint) {
            var sphere = new mono.Sphere(30);
            sphere.s({
                'm.color': '#CC589C',
                'm.ambient': '#CC589C',
                'm.type': 'phong'
            })
            sphere.setPosition(inspectionPoint.point.x, self.inspectionPositionY, inspectionPoint.point.z);
            sphere.setClient('sphere', true);
            sphere.setClient('isOld', true);
            sphere.setClient('id', inspectionPoint.id);
            sphere.setClient('name', inspectionPoint.name);
            sphere.setClient('inspectionArea', inspectionPoint.inspectionArea);
            sphere.setClient('inspectionPoint', inspectionPoint);
            self.box.add(sphere);
            self.spheres.push(sphere);
        })

    },
    hideInspectionPoint: function () {

        var self = this;
        var spheres = this.spheres;
        spheres.forEach(function (item) {
            self.box.remove(item);
        })
        this.spheres = [];
    },

    showRooms: function () {
        //找到所有的机房
        var self = this;
        var rooms = this.rooms = [];
        var roomMap = this.roomMap = {};
        var children = this.dataManager.getChildren(this.data);
        if (!children || children.length == 0) {
            console.error(it.util.i18n("RoomInspectionManager_Area_not_exist"))
            return;
        }
        children.forEach(function (item) {
            var dataType = self.dataManager.getDataTypeForData(item);
            if (dataType && dataType.getCategoryId() == 'room') {
                rooms.push(item);
                roomMap[item.getId()] = item;
                if (self.inspectionPointMap[item.getId()]) {
                    self.inspectionPointMap[item.getId()].room = item;
                }

                var node = self.sceneManager.getNodeByDataOrId(item);
                node.s({'m.opacity': 0.3})
                node.setPositionY(self.inspectionPositionY);
            }
        })
    },
    hideRoom: function () {
        var self = this;
        this.rooms.forEach(function (room) {
            var node = self.sceneManager.getNodeByDataOrId(room);
            node.s({'m.opacity': 0.08});
            node.setPositionY(10);
            node.s({
                'm.color': self.defaultRoomColor,
                'm.ambient': self.defaultRoomColor,
            })
        })
    },
    createTrail: function (path) {
        var trail = RoomInspectionManager.superClass.createTrail.call(this, path);
        trail.setPositionY(this.inspectionPositionY);
        return trail;
    },

    isInspect: function (data) {
        var dataType = this.dataManager.getDataTypeForData(data);
        if (!dataType) {
            return false;
        }
        var categoryId = dataType.getCategoryId();
        if (categoryId == 'room') {
            return true;
        }
        return false;
    },
    isHideInInspection: function (data) {
        var dataType = this.dataManager.getDataTypeForData(data);
        if (!dataType) {
            return false;
        }
        var categoryId = dataType.getCategoryId();
        if (categoryId != 'room' && categoryId != 'floor') {
            return true;
        }
        return false;
    },

    /**
     * 渲染所有的巡检对象
     */
    renderInspectData: function () {

        var result = false;
        var self = this;

        var currPoint = null;
        var hostPos = this.host.getPosition();

        //在当前巡检点中,找到是否有已经接近的点
        var spheres = this.spheres;
        for (var i = 0; i < spheres.length; i++) {
            var inspectionPointNode = spheres[i];
            var inspectionPoint = inspectionPointNode.getClient('inspectionPoint');
            var point = inspectionPoint.point;
            var dx = point.x - hostPos.x;
            var dz = point.z - hostPos.z;
            var d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dz, 2));
            if (d < 50) {
                currPoint = inspectionPoint;
                break;
            }
        }

        if (this.lastPoint == currPoint) {
            return;
        }
        this.lastPoint = currPoint;

        if (currPoint) {

            var room = currPoint.room;
            var node = self.sceneManager.getNodeByDataOrId(room);
            if (!node) {
                console.warn('room is not exist:', currPoint);
                return;
            }
            if (this.isPlayInspectionReport && currPoint.inspectionArea) {
                var color = currPoint.inspectionArea ? 'green' : 'red';
                node.s({
                    'm.color': color,
                    'm.ambient': color,
                })
            } else {
                var color = currPoint.status ? 'green' : 'red';
                node.s({
                    'm.color': color,
                    'm.ambient': color,
                    'm.opacity': 0.3,
                })
            }
        }
    },

    /**
     * 巡检结束
     */
    onFinish: function () {

        var self = this;

        this.hideRoom();
        this.hideArrow();
        this.hideInspectionPoint();

        this.host.setParent(null);
        this.box.removeByDescendant(this.host);

        this.endTime = new Date();

        if (!this.isPlayInspectionReport) {
            //this.showSaveReportDialog();
        }

        this.lastPoint = null;
        this.inspectionDataArray = [];
        this.inspectionPath = null;
        this.inspectionDataMap = {};
        delete this.startTime;
        delete this.endTime;
    },

    /**
     * 开始巡检
     * @param inspection
     */
    inspect: function (inspectionPath, isPlayInspectionReport) {

        var self = this;
        if (this.isPlaying() || this.isPause()) {
            layer.confirm(it.util.i18n("RoomInspectionManager_Clear_inspection")+'?', {icon: 3, title: it.util.i18n("RoomInspectionManager_Tip")}, function (index) {
                self.stop();
                layer.close(index);
                setTimeout(function () {
                    self._inspectAction(inspectionPath, isPlayInspectionReport);
                }, 10)
            });
        } else {
            self._inspectAction(inspectionPath, isPlayInspectionReport);
        }
    },

    _inspectAction: function (inspectionPath, isPlayInspectionReport) {
        this.isPlayInspectionReport = isPlayInspectionReport;
        this.inspectionPath = inspectionPath;

        if (!main.sceneManager.viewManager3d.getFocusNode() != this.sceneManager.getCurrentRootNode()) {

            main.sceneManager.viewManager3d.defaultEventHandler.withOutAnimate = true;
            main.sceneManager.viewManager3d.lookAt(this.sceneManager.getCurrentRootNode());
        }
        this.showRooms();
        //显示point
        this.spheres = [];
        this.showInspectionPointNode(inspectionPath);
        this.showArrow();
        this._inspect();
    },

    _inspect: function () {
        this.inspectionDataArray = [];

        var path = this.parsePath(this.inspectionPath.path);
        var node = this.sceneManager.getNodeData(this.data);
        this.host.setParent(node);
        this.box.addByDescendant(this.host);
        this.setPath(path);
        this.startTime = new Date();
        this.play();
    },

    /**
     * 格式化path
     * @param path
     * @returns {Array}
     */
    parsePath: function (path) {

        var result = [];
        for (var i = 0; i < path.length; i += 2) {
            result.push([path[i], path[i + 1]]);
        }
        return result;
    },

    /**
     * 播放巡检报告
     * @param inspectionReportId
     */
    playInspectionReport: function (inspectionReportId, callback) {
        var self = this;
        this.inspectionArea;
        this.stop();
        if (self.isShowInspectionView) {
            self.resetInspectionView();
        }
        it.util.getById('inspection_report', inspectionReportId, function (inspectionReport) {
            var inspectionPath = self.inspectionPathMap[inspectionReport.inspectionPathId]
            if (!inspectionPath) {
                layer.alert(it.util.i18n("RoomInspectionManager_Path_deleted")+':' + inspectionReport.inspectionPathId);
                return;
            }
            it.util.search('inspection_area', {inspectionReportId: inspectionReportId}, function (inspectionAreaArray) {

                inspectionAreaArray.forEach(function (inspectionArea) {
                    var id = inspectionArea.id;
                    if (self.inspectionPointMap[id]) {
                        self.inspectionPointMap[id].inspectionArea = inspectionArea;
                    }
                })
                self.inspect(inspectionPath, true);
            })

        })
    },

    /******************************* 鼠标交互事件相关  ***********************************/

    shouldHandleMouseUpElement: function (element, network, data, clickedObj, event) {

        if (!this.isShowInspectionView) {
            return false;
        }
        if (event._mousemove) {
            return false;
        }
        var roomData = main.sceneManager.getNodeData(element);
        for (var i = 0; i < this.rooms.length; i++) {
            if (this.rooms[i] == roomData)
                return true;
        }
        for (var i = 0; i < this.trails.length; i++) {
            if (this.trails[i] == element)
                return true;
        }
        for (var i = 0; i < this.spheres.length; i++) {
            if (this.spheres[i] == element)
                return true;
        }
        return false;
    },
    handleMouseUpElement: function (element, network, data, clickedObj, event) {

        var roomData = main.sceneManager.getNodeData(element);
        for (var i = 0; i < this.rooms.length; i++) {
            if (this.rooms[i] == roomData) {
                this.showReportDialog({where: {inspectionAreaId: roomData.getId()}});
                return;
            }
        }
        for (var i = 0; i < this.trails.length; i++) {
            if (this.trails[i] == element) {
                var inspectionPath = element.getClient('inspectionPath');
                this.showReportDialog({where: {inspectionPathId: inspectionPath.id}});
                return;
            }
        }
        for (var i = 0; i < this.spheres.length; i++) {
            if (this.spheres[i] == element) {
                var inspectionPoint = element.getClient('inspectionPoint');
                this.showReportDialog({where: {inspectionAreaId: inspectionPoint.inspectionAreaId}});
                return;
            }
        }
    },
});

//var InspectionManager = RoomInspectionManager;