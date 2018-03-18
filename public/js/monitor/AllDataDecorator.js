if(!it.monitor){
	it.monitor = {};
}

var AllDataDecorator = function(monitor){
	MonitorDecorator.call(this, monitor);
};

mono.extend(AllDataDecorator, MonitorDecorator,{
	// 订阅数据并实时显示
	showAllData: function(category){
		var assets = this.monitor._assets;
		var asset, ids = [];
		for(var i=0; i<assets.length;i++){
			asset = assets[i];
			ids.push(asset.getId());
		}
		this._ids = ids;
		// 初始化用于显示实时数据的view实例
		it.ViewTemplateManager.showCategoryViews(category,ids);
	},
	hideAllData: function(){
		it.ViewTemplateManager.hideViews(this._ids);
	},
	show: function(category, data){
		var hasAsset = this.monitor.show(category, data);
		if(hasAsset){
			this.showAllData(category);
			return true;
		}
		return hasAsset;
	},
	hide: function(){
		this.monitor.hide();
		this.hideAllData();
	}
});
it.ADD =it.monitor.AllDataDecorator =AllDataDecorator;