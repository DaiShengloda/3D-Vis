it.AirFlow = function (channelDataId, seqId) {
    this.channelDataId = channelDataId;
    this.seqId = seqId;
    this.channelNode =main.sceneManager.getNodeByDataOrId(channelDataId);
    this.airFlowNode = this.createAirFlowPlane();
    this.currentOffsetY = 1;
    this.key = channelDataId + "@" + seqId;
}

mono.extend(it.AirFlow, Object, {
    createAirFlowPlane: function () {
        var channelNode = this.channelNode;
        var seqId = this.seqId;
        var bb = channelNode.getBoundingBox();
        var width = (bb.max.x - bb.min.x);
        var height = (bb.max.y - bb.min.y);
        var depth = (bb.max.z - bb.min.z);
        var path = new mono.Path();
        path.moveTo(-width / 1.8, 0, 0);
        path.lineTo(width / 1.8, 0, 0);
        var d = seqId == 1 ? depth / 6 : -depth / 6;
        var df = d / 5;
        var path2 = new mono.Path();
        path2.moveTo(0, -height / 2, df);
        path2.lineTo(0, -height / 5, df);
        path2.curveTo(0, 0, 0, 0, 0, d);
        path2.lineTo(0, 0, d * 2);
        path2.curveTo(0, 0, d * 3, 0, height / 2, d * 3.5);
        path2.lineTo(0, height * 0.8, d * 4);

        var curvePlane = new mono.CurvePlane(path, path2);

        curvePlane.s({
			'm.texture.image': './images/arrow.png',
			'm.side': 'both',
			'm.texture.repeat': new mono.Vec2(14, 5),				
			'm.transparent': true,
			'm.gradient': {0: '#84DF29', 0.6: '#DF6029', 1: '#DF2929'},
			'm.gradientType': 2,				
		});
        curvePlane.setParent(channelNode);
        main.sceneManager.network3d.getDataBox().add(curvePlane);

        return curvePlane;
    },

    removeSelf: function () {
        this.airFlowNode.setParent(null);
        main.sceneManager.network3d.getDataBox().remove(this.airFlowNode);
    },

    addToDataBox: function () {
        if (this.airFlowNode.getParent() == null) {
            this.airFlowNode.setParent(this.channelNode);
            main.sceneManager.network3d.getDataBox().add(this.airFlowNode);
        }
    },

    playFlow: function () {
        var offsetY = this.currentOffsetY;
        this.airFlowNode.setStyle('m.texture.offset', new mono.Vec2(0, offsetY));
        this.airFlowNode.setStyle('m.texture.offset', new mono.Vec2(0, offsetY));
        offsetY -= 0.1;
        if (offsetY <= 0) {
            offsetY = 1;
        }
        this.currentOffsetY = offsetY;
    },
});

it.AirFlowManager = function () {
    this.airFlowMap = {};
};
function getChannelDescendants (data,results) {
    var dm = main.sceneManager.dataManager;
    var descendants = results || [];
    if(!data){
        return descendants;
    }
    var children = data.getChildren();
    if(children && children.size() > 0){
        children.forEach(function(child){
            var datatype = dm.getDataTypeForData(child);
            if(datatype && datatype.getModel() && datatype.getModel() === 'twaver.idc.aisle'){
                descendants.push(child);
            }
            getChannelDescendants(child,descendants);
        });
    }
    return descendants;
}
mono.extend(it.AirFlowManager, Object, {
    createAirFlow: function (channelDataId, seqId) {
        var node = main.sceneManager.getNodeByDataOrId(channelDataId);
        if (!node) {
            return;
        }
        var key = channelDataId + "@" + seqId;
        if (this.airFlowMap[key]) {
            this.airFlowMap[key].addToDataBox();
            return;
        }
        var airFlow = new it.AirFlow(channelDataId, seqId);
        this.airFlowMap[key] = airFlow;
    },

    isRoomData : function (data) {
        var sm = main.sceneManager;
        var dm = main.sceneManager.dataManager;
        var dataType = dm.getDataTypeForData(data);
        var parameters = dataType.getModelParameters();
        if(mono.Utils.isArray(parameters)){
            return true;
        }
        return false;
    },

    isShow : function(){
        var sm = main.sceneManager;
        var rootData = sm.getNodeData(sm._currentRootNode);
        var dataId = rootData.getId();
        if(this.isRoomData(rootData)){
            if(rootData._hasAirFlow){
                return true;
            }
        }
        return false;
    },

    clear : function(){
        var self =this;
        var sm = main.sceneManager;
        var dataMap = sm.dataManager.getDataMapByCategory('floor');
        if (!dataMap) {
            return;
        }
        var x;
        for(x in dataMap) {
            var rootData = dataMap[x];
            var dataId = rootData.getId();
            if(self.isRoomData(rootData)){
                if(rootData._hasAirFlow){
                    self.stopAnimation();
                    self.removeAirFlowsForRoom(dataId);
                }
            }
        }
    },

    toggleAirFlowsForCurrentScene: function () {
        var sm = main.sceneManager;
        var rootData = sm.getNodeData(sm._currentRootNode);
        var dataId = rootData.getId();
        if(this.isRoomData(rootData)){
            if(rootData._hasAirFlow){
                this.stopAnimation();
                this.removeAirFlowsForRoom(dataId);
            }else{
                this.addAirFlowsForRoom(dataId);
                this.startAnimation();
                rootData._hasAirFlow = true;
            }
        }
    },

    addAirFlowsForRoom: function (roomId) {
        var dm = main.sceneManager.dataManager;
        var roomData = dm.getDataById(roomId);
        if(roomData){
            var descendants = getChannelDescendants(roomData);
            var length = descendants.length;
            for(var i = 0;i < length;i ++){
                var channelData = descendants[i];
                var seqs = this.getChannelSeqs(channelData);
                for(var j = 0;j < seqs.length;j ++){
                    this.createAirFlow(channelData.getId(), seqs[j]);
                }
            } 
        }

        
    },

    getChannelSeqs : function(channelData){
        var dataType = main.sceneManager.dataManager.getDataTypeForData(channelData);
        var parameters = dataType.getModelParameters();
        if(parameters.isSingle){
            if(parameters.side = "left"){
                return [0]
            }else{
                return [1];
            }
        }
        return [0,1];
    },

    addAirFlows: function () {

    },

    removeAirFlowsForRoom: function (roomDataId) {
        // var am = main.assetManager;
        var sm = main.sceneManager;
        var dm = main.sceneManager.dataManager;
        var roomData = dm.getDataById(roomDataId);
        if(roomData){
            for(var key in this.airFlowMap){
                var airFlow = this.airFlowMap[key];
                this.remove(airFlow);
            }
            delete roomData._hasAirFlow;
        }
    },

    removeAllAirFlows: function () {
        for (var id in this.airFlowMap) {
            this.remove(this.airFlowMap[id]);
        }
    },

    remove: function (airFlow) {
        airFlow.removeSelf();
    },

    playFlow: function () {
        for (var id in this.airFlowMap) {
            var airFlow = this.airFlowMap[id];
            airFlow.playFlow();
        }
    },

    startAnimation: function () {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        var self = this;
        self.timer = setTimeout(function () {
            self.playFlow();
            self.startAnimation();
        }, 25);
    },

    stopAnimation: function () {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    },
});
