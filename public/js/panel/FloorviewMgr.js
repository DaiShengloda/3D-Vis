function $FloorviewMgr(sceneManager, name, parent) {
    it.BaseMgr.call(this, sceneManager, name, parent);
}

mono.extend($FloorviewMgr, it.BaseMgr, {

    initView: function () {
        var self = this;
        var $box = this.$box = $('.floor-panel-box');
        if(!$box.length) {
            $box = this.$box = $('<div class="floor-panel-box"></div>');
            $box.appendTo(document.body);
        }
        $box.addClass(this.name);
        // $box.hide();
    },

    _init: function () {
        // this.floorDatas = this.getFloorDatas();
        // var node = main.sceneManager.viewManager3d.getFocusNode();
        // if (!node) {
        //     node = main.sceneManager._currentRootNode;
        // }
        // if (!node) return;
        // var firstFloor = this.getCurrentFloor(node);
        // this.$box.floorview({
        //     floorDatas: this.floorDatas,
        //     doChangeFloor: this.doChangeFloor,
        //     click: this.doGotoData,
        //     currentFloor: firstFloor,
        // });
        // this.$box.hide();
    },
    _show: function () {
        // var node = main.sceneManager.viewManager3d.getFocusNode();
        // if (!node) {
        //     node = main.sceneManager._currentRootNode;
        // }
        // if (!node) return;
        // if (!this.getFirstFloor) {
        //     this.getFirstFloor = this.getCurrentFloor(node);
        //     // this.$box.floorview('option', 'currentFloor', this.getFirstFloor);
        // }
        // this.afterLookFinishedAtHandler(node);
    },
    _hide: function () {

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

    getFloorDatas: function () {
        var floors = main.sceneManager.dataManager.getDataMapByCategory('floor');
        var node = main.sceneManager.viewManager3d.getFocusNode();
        if (!node) {
            node = main.sceneManager._currentRootNode;
        }
        if (!node) return;
        var floorsArray = [],floorsArray1 = [];
        for(var i in floors) {
            if(floors[i]._parentId == node._clientMap.it_data._parentId) {
                var index = floors[i].getExtend().index || 0;
                floorsArray1.push({_id:floors[i]._id, index: index});
            }
        }
        floorsArray1 = floorsArray1.sort(function(a,b){
            return a.index-b.index;
        });
        for(var i = 0;i<floorsArray1.length;i++){
            floorsArray.push(floorsArray1[i]._id);
        }
        return floorsArray;
    },
   
    sceneChangeHandler: function (e) {
        if (e.kind != 'changeScene') return;
        var self = this;  
        var rootData = e.rootData;
        if (!rootData) return;
        var scene = e.data || main.sceneManager.getCurrentScene(),
            oldScene = e.oldData,
            sceneCategoryId = scene.getCategoryId(),
            oldSceneCategoryId = '';
        if(oldScene) {
            oldSceneCategoryId = oldScene.getCategoryId();
        }   
        if(sceneCategoryId == 'floor' && (oldSceneCategoryId != 'floor')) {
            this.initView();
            this.floorDatas = this.getFloorDatas();
            var node = main.sceneManager.viewManager3d.getFocusNode();
            if (!node) {
                node = main.sceneManager._currentRootNode;
            }
            if (!node) return;
            var currentFloor = this.getCurrentFloor(node);
            this.$box.floorview({
                floorDatas: this.floorDatas,
                doChangeFloor: this.doChangeFloor,
                click: this.doGotoData,
                currentFloor: currentFloor,
            });
           
        }else if((sceneCategoryId == 'dataCenter'||sceneCategoryId == 'earth') && oldSceneCategoryId == 'floor'){
            this.$box.floorview('destory');
        }
        if(sceneCategoryId == 'floor') {
            this.showFloorOverview(rootData);
        }
       
    },
   
    showFloorOverview: function (floorData, id) {
        this.$box.floorview('option', 'currentScene', 'floor');
        this.$box.floorview('option', 'currentFloor', floorData._id);
        var start = this.$box.floorview('setFloorTipStart',floorData._id);
        this.$box.floorview('createFloorTip', start);
    }
})
it.FloorviewMgr = $FloorviewMgr;