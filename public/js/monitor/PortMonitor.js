if(!it.monitor){
    it.monitor = {};
}

var PortMonitor = function(sceneManager,category){
	Monitor.call(this, sceneManager, category);
};

mono.extend(PortMonitor,Monitor,{
    filterAsset: function(list, category, result){
        result = result || [];
        var self = this;
        var dm = this.sceneManager.dataManager;
        var level = this._level.indexOf(category)>=0?this._level.indexOf(category):this.DEFAULT_LEVEL;
        var rde = main.RealtimeDynamicEnviroManager;
        list.forEach(function(a){
            var dy = dm.getDataTypeForData(a);
            if(!dy)return;
            if(dy.getCategoryId() == category){
                // 判断资产是否有关联关系，如果没有关联关系，说明不会有实时数据
                var td = dy._templateDatas;
                if(td && td.length){
                    if(rde.hasRelation(a.getId())){
                     result.push(a);
                    }
                    // result.push(a);
                }
            } else {
                var tempLevel = self._level.indexOf(dy.getCategoryId());
                if(tempLevel < level){
                    self.filterAsset(a.getChildren(), category, result);
                }
            }
        });
        return result;
    },
    show: function(){
        PortMonitor.superClass.show.call(this,'equipment');
    },
});
it.monitor.PortMonitor=PortMonitor;