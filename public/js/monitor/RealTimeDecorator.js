if(!it.monitor){
	it.monitor = {};
}

var RealTimeDecorator = function(monitor){
	MonitorDecorator.call(this, monitor);
};

mono.extend(RealTimeDecorator, MonitorDecorator,{
	// 订阅数据并实时显示
	showRealTime: function(){
		var assets = this.getFilteredAssets();
		var asset, ids = [];
		for(var i=0; i<assets.length;i++){
			asset = assets[i];
			ids.push(asset.getId());
		}
		this._ids = ids;
		// 初始化用于显示实时数据的view实例
		it.ViewTemplateManager.showViews(ids, this.group);
	},
	hideRealTime: function(){
		it.ViewTemplateManager.hideViews(this._ids, this.group);
	},
	show: function(categoryId){
		var hasAsset = this.monitor.show(categoryId);
		if(hasAsset){
			this.showRealTime();
			return true;
		}
		return hasAsset;
	},
	hide: function(){
		this.monitor.hide();
		this.hideRealTime();
	}
});
it.monitor.RealTime =RealTimeDecorator;