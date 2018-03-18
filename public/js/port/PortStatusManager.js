/**
 * 端口状态管理
 * @param sceneManager
 * @constructor
 */
$PortStatusManager = function (sceneManager) {
	this.sceneManager = sceneManager;
	this.portManager = sceneManager.postManager;
	this.statusMap = {
		0:'green', //通 
		1:'red',   //中断
		2:'orange',  //丢包
	};
    this.statusCubes = {};
    this.ports = [];
};

mono.extend($PortStatusManager, Object, {
    showPortsStatusByParentId: function (parentId) {
        if(!main.RealtimeDynamicEnviroManager.hasRelation(parentId)){
            util.msg2(it.util.i18n('Port_Occupancy_No_Port'));
            return;
        }
        this.clearPortStatusByParentId(parentId);
        // it.ViewTemplateManager.registerViewByCategory('equipment',PortStatusViewTemplate);
    	var parent = this.sceneManager.getNodeByDataOrId(parentId);
    	var ports = this.portManager.getAllPortsByParentId(parentId);
        
        var self = this;
        var statusCubes = [];
    	ports.forEach(function(child){
			var size = child.getBoundingBox().size();
			var cube = new mono.Cube(size.x+0.2, size.y+0.2, size.z+0.2);
			var parentId= child.getClient('parentId');
			var portId = child.getClient('portId');
			var side = child.getClient('side');
			cube.s({
				'm.ambient': 'gray',
				'm.color': 'gray',
				'm.transparent': true,
				'm.opacity': 0.8
			});
            cube.c({
                'parentId': parentId,
                'portId': portId,
                'side': side
            });
			cube.setParent(parent);
			cube.p(child.p());
            statusCubes.push(cube);
			main.sceneManager.network3d.getDataBox().add(cube);
            self.ports.push(cube);
		})
        this.statusCubes[parentId] = statusCubes;
        // main.RealtimeDynamicEnviroManager.monitorAssetData(parentId);
        it.ViewTemplateManager.showView(parentId,'portUsage',function(view){
            view.setNodes(self.ports);
        });
    },
    
    clearPortStatusByParentId: function(parentId){
        // main.RealtimeDynamicEnviroManager.clearMonitorData(parentId);
        it.ViewTemplateManager.hideView(parentId);
        // it.ViewTemplateManager.removeViewByCategory('equipment');
        var statusCubes = this.statusCubes[parentId];
        if(!statusCubes) return;
        for(var i = statusCubes.length-1; i >= 0; i--){
            main.sceneManager.network3d.getDataBox().remove(statusCubes[i]);
        }
        this.statusCubes[parentId] = null;
    },

    clearAllPortsStatus: function(){
        for(var i in this.statusCubes){
            this.clearPortStatusByParentId(i);
        }
    }




});