if(!it.monitor){
    it.monitor = {};
}

var EquipmentMonitor = function(sceneManager,category){
	Monitor.call(this, sceneManager, category);
};

mono.extend(EquipmentMonitor,Monitor,{
	// 获取资产要显示的信息
	getInfo: function(asset){

	},
    getNode: function(asset){
        if(!asset) return;
        var node = this.sceneManager.dataNodeMap[asset.getParentId()];
        if(!node || node.getClient('monitor_equipment')) return;
        node.setClient('monitor_equipment',true);
        return node;
    },
	cacheCompnent: function(asset, comp){
		this.putComponent(asset.getParentId(), comp);
	},
	hideComponentHandler: function(comp){
		var parent = comp.getParent();
		parent.setClient('monitor_equipment',null);
	}
});

it.monitor.EquipmentMonitor = EquipmentMonitor;