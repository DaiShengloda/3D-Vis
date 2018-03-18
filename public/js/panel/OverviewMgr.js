function $OverviewMgr(sceneManager, name, parent) {
    it.BaseMgr.call(this, sceneManager, name, parent);
}

mono.extend($OverviewMgr, it.BaseMgr, {

    initView: function () {
        var self = this;
        var $box = this.$box = $('<div></div>').appendTo(this.parent);
        $box.addClass(this.name);
        $box.hide();
    },

    _init: function () {
        var w = document.body.clientWidth, nw, nh;
        if (w <= 1440) {
            nw = 200;
            nh = 210;
        } else if (w > 1440 && w <= 1919) {
            nw = 240;
            nh = 240;
        } else if (w > 1919) {
            nw = 300;
            nh = 300;
        }
        this.$box.overview({
            width: nw,
            height: nh,
            // floorDatas: this.floorDatas,
            // doChangeFloor: this.doChangeFloor,
            click: this.doGotoData,
        });
        this.nw = nw;
    },
    _show: function () {
        var node = main.sceneManager.viewManager3d.getFocusNode();
        if (!node) {
            node = main.sceneManager._currentRootNode;
        }
        if (!node) return;
        if (!this.getFirstFloor) {
            this.getFirstFloor = this.getCurrentFloor(node);
            this.$box.overview('option', 'currentFloor', this.getFirstFloor);
        }
        this.afterLookFinishedAtHandler(node);
        this.appPanelShow();
        this.$box.height(this.nw);
    },
    _hide: function () {
        console.log('eee');
        this.appPanelHide();
        this.$box.height(this.nw);
    },

    doGotoData: function (e, params) {
        var data = main.sceneManager.dataManager.getDataById(params.id);
        main.sceneManager.viewManager3d.defaultEventHandler.lookAtByData(data);
    },

    doChangeFloor: function (e, floorId) {
        main.sceneManager.gotoData(floorId)
    },

    getCurrentFloor: function (node) {
        var data = main.sceneManager.getNodeData(node);
        return data._id;
    },

    // getFloorDatas: function () {
    //     var floors = main.sceneManager.dataManager.getDataMapByCategory('floor');
    //     var floorsArray = [],floorsArray1 = [];
    //     for(var i in floors) {
    //         var index = floors[i].getExtend().index || 0;
    //         floorsArray1.push({_id:floors[i]._id, index: index});
    //     }
    //     floorsArray1 = floorsArray1.sort(function(a,b){
    //         return a.index-b.index;
    //     });
    //     for(var i = 0;i<floorsArray1.length;i++){
    //         floorsArray.push(floorsArray1[i]._id);
    //     }

    //     return floorsArray;
    // },
   
    resortFloorsArray: function (a, b) {
        a = a._id.split('floor')[1];
        b = b._id.split('floor')[1];
        return b - a;
    },

    appPanelShow: function () {
        var $searchPanel = $('.new-itv-search-panel');
        var $appPanel = $('.app-panel');
        var body = $('body');
        var breadcrumbBox = $('.breadcrumb-box');
        var canvas = $('.overviewCanvas');
        var $powerPanel = $('.elecPanel');
        $searchPanel.css({ 'top': breadcrumbBox.innerHeight() + canvas.innerHeight() })
        $searchPanel.height($(window).height() - breadcrumbBox.innerHeight() - canvas.innerHeight());
        $appPanel.css({ 'top': breadcrumbBox.innerHeight() + canvas.innerHeight() })
        $appPanel.height($(window).height() - breadcrumbBox.innerHeight() - canvas.innerHeight());
        $powerPanel.css({ 'top': breadcrumbBox.innerHeight() + canvas.innerHeight() })
        $powerPanel.height($(window).height() - breadcrumbBox.innerHeight() - canvas.innerHeight());
    },
    appPanelHide: function () {
        var $searchPanel = $('.new-itv-search-panel');
        var $appPanel = $('.app-panel');
        var $powerPanel = $('.elecPanel');
        var body = $('body');
        var breadcrumbBox = $('.breadcrumb-box');
        $searchPanel.css({ 'top': breadcrumbBox.innerHeight() })
        $searchPanel.height($(window).height() - breadcrumbBox.innerHeight());
        $appPanel.css({ 'top': breadcrumbBox.innerHeight() })
        $appPanel.height($(window).height() - breadcrumbBox.innerHeight());
        $powerPanel.css({ 'top': breadcrumbBox.innerHeight() })
        $powerPanel.height($(window).height() - breadcrumbBox.innerHeight());
    },

    sceneChangeHandler: function (e) {
        if (e.kind != 'changeScene') return;
        var rootData = e.rootData;
        if (!rootData) return;
        var scene = e.data || main.sceneManager.getCurrentScene();
        var sceneCategoryId = scene.getCategoryId();
        if (sceneCategoryId != 'floor') {
            this.$box.hide();
            main.panelMgr.invoke('BreadcrumbMgr', 'doBtnOff');
            return;
        }
        if (main.panelMgr.instanceMap.BreadcrumbMgr && main.panelMgr.instanceMap.BreadcrumbMgr.isShowOverview()) {
            this.show();
        }
        //TODO 先只做一个 floor 场景的
        //外墙，内墙的轮廓
        this.showFloorOverview(rootData);
    },
    afterLookFinishedAtHandler: function (node) {
        var rootData = main.sceneManager._currentRootData;
        var rdt = main.sceneManager.dataManager.getDataTypeForData(rootData);
        if (rdt.getCategoryId() != 'floor') {
            return;
        }
        var rootNode = main.sceneManager.getNodeByDataOrId(rootData);
        var rootPosition = rootNode.getWorldPosition();

        var data = main.sceneManager.getNodeData(node);
        var dt = main.sceneManager.dataManager.getDataTypeForData(data);
        var categoryId = dt.getCategoryId();
        if (categoryId == 'floor') {
            this.showFloorOverview(data);
        } else if (categoryId == 'room') {
            var parent = main.sceneManager.dataManager.getParent(data);
            this.showFloorOverview(parent, data.getId());
        } else if (categoryId == 'rack') {
            //如果机柜的父亲是机房或者是通道（且通道的父亲是机房），那么显示机房的缩略图。
            var parent = main.sceneManager.dataManager.getParent(data);
            var pdt = main.sceneManager.dataManager.getDataTypeForData(parent);
            var cid = pdt.getCategoryId();
            if (cid == 'room') {
                this.showRoomOverview(parent, rootPosition.x, rootPosition.z, data.getId());
            } else if (cid == 'channel') {
                var parent = main.sceneManager.dataManager.getParent(parent);
                var pdt = main.sceneManager.dataManager.getDataTypeForData(parent);
                var cid = pdt.getCategoryId();
                if (cid == 'room') {
                    this.showRoomOverview(parent, rootPosition.x, rootPosition.z, data.getId());
                }
            }
        }
    },
    showFloorOverview: function (floorData, id) {
        var self = this;
        var items = this.getFloorItem(floorData);
        var rootNode = main.sceneManager.getNodeByDataOrId(floorData);
        var rootPosition = rootNode.getWorldPosition();
        var children = main.sceneManager.dataManager.getChildren(floorData);
        if (children && children.length > 0) {
            children.forEach(function (child) {
                var dt = main.sceneManager.dataManager.getDataTypeForData(child);
                var categoryId = dt.getCategoryId();
                if (categoryId == 'room') {
                    items.push(self.getRoomItem(child, true))
                } else if (categoryId == 'rack') {
                    items.push(self.getRackItem(child, rootPosition.x, rootPosition.z));
                }
            })
        }
        this.$box.overview('clear');
        this.$box.overview('option', 'scale', 30);
        this.$box.overview('option', 'currentScene', 'floor');
        this.$box.overview('option', 'currentFloor', floorData._id);
        // this.$box.overview('setCurrentFloor');
        this.$box.overview('option', 'items', items);
        this.$box.overview('option', 'selectedId', id);
        // this.$box.overview('showFloorBox');
        // var start = this.floorPanelBox.floorview('setFloorTipStart',floorData._id);
        // this.floorPanelBox.floorview('createFloorTip', start);
        //虽然显示了缩略图空间，但是某些场景下不需要显示
        if (this._visible) {
            this.$box.show();
        }
    },

    showRoomOverview: function (roomData, x, z, id) {
        var self = this;
        var items = [];
        items.push(self.getRoomItem(roomData, false));
        var racks = self.getRack(roomData);
        racks.forEach(function (data) {
            items.push(self.getRackItem(data, x, z))
        })
        this.$box.overview('clear');
        this.$box.overview('option', 'scale', 10);
        this.$box.overview('option', 'currentScene', 'room');
        this.$box.overview('option', 'items', items);
        this.$box.overview('option', 'selectedId', id);
        // this.$box.overview('hideFloorBox');
        //虽然显示了缩略图空间，但是某些场景下不需要显示
        if (this._visible) {
            this.$box.show();
        }
    },

    isShowOverview: function (data) {
        var dt = main.sceneManager.dataManager.getDataTypeForData(data);
        var categoryId = dt.getCategoryId();
        return categoryId == 'room' || categoryId == 'rack' || categoryId == 'headerRack';
    },

    getFloorItem: function (data) {
        var items = [];
        var dataId = data.getId();
        var dt = main.sceneManager.dataManager.getDataTypeForData(dataId);
        var params = dt.getModelParameters();
        params.forEach(function (param) {
            var id = param.id;
            var type = make.Default.getParameters(id).type;
            if (type == 'wall' || type == 'innerWall') {
                var path = param.data.map(function (p) {
                    return [p[0], p[1]];
                })
                items.push({
                    type: 'path',
                    fill: false,
                    path: path,
                    closed: !!param.closed,
                    selectable: false,
                })
            }
        })
        return items;
    },

    getRoomItem: function (data, selectable) {

        var node = main.sceneManager.getNodeByDataOrId(data);
        if(!node){
            return;
        }
        var pp = data.getPosition();
        var pos = node.getWorldPosition();
        var dt = main.sceneManager.dataManager.getDataTypeForData(data);
        var param = dt.getModelParameters();
        var path = param.data.map(function (p) {
            return [(p[0] + pp.x), (p[1] + pp.z)];
        })
        var i = path.length - 1;
        if (path[0].x == path[i].x && path[0].y == path[i].y) {
            path.splice(i, 1);
        }
        return {
            id: data.getId(),
            type: 'path',
            fill: true,
            path: path,
            closed: true,
            label: this.getLabel(data),
            selectable: selectable,
        };
    },

    getRackItem: function (data, x, z) {
        var node = main.sceneManager.getNodeByDataOrId(data);
        if (!node) {
            return;
        }
        var pos = node.getWorldPosition();
        var b = node.getBoundingBox();
        var r = data.getRotation() || { x: 0, y: 0, z: 0 };
        return {
            id: data.getId(),
            type: 'rect',
            fill: false,
            w: (b.max.x - b.min.x),
            h: (b.max.z - b.min.z),
            x: (pos.x - x),
            y: (pos.z - z),
            angle: r.y,
            label: this.getLabel(data),
            selectable: true
        }
    },

    getLabel: function (data) {
        var label = data.getDescription();
        if (label && label.length > 0) return label;
        label = data.getName();
        if (label && label.length > 0) return label;
        return data.getId();
    },

    getChildren: function (data, cid) {
        var result = [];
        var children = main.sceneManager.dataManager.getChildren(data);
        if (!children && children.length == 0) {
            return result;
        }
        children.forEach(function (child) {
            var category = main.sceneManager.dataManager.getCategoryForData(child);
            var categoryId = category.getId();
            if (categoryId == cid) {
                result.push(child);
            }
        })
        return result;
    },

    getRoom: function (data) {
        return this.getChildren(data, 'room');
    },

    getRack: function (data) {
        var self = this;
        var result = [];
        var racks = self.getChildren(data, 'rack');
        var headerRacks = self.getChildren(data, 'headerRack');
        var airConditionings = self.getChildren(data, 'airConditioning');
        result = result.concat(racks);
        result = result.concat(headerRacks);
        result = result.concat(airConditionings);
        var chs = self.getChildren(data, 'channel');
        chs.forEach(function (ch) {
            result = result.concat(self.getRack(ch))
        })
        return result;
    }
})
it.OverviewMgr = $OverviewMgr;