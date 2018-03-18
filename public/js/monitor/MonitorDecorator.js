/* The MonitorDecorator abstract decorator class */

var MonitorDecorator = function(monitor){
	Interface.ensureImplements(monitor, IMonitor);
	this.monitor = monitor;
	this.sceneManager = monitor.sceneManager;
	this.group = monitor.group;
};

mono.extend(MonitorDecorator,Object,{ // implement Monitor
	getAssetsByCategory: function(){
		this.monitor.getAssetsByCategory();
	},
	filterAsset: function(){
		this.monitor.filterAsset();
	},
	show: function(){
		this.monitor.show();
	},
	hide: function(){
		this.monitor.hide();
	},
	getFilteredAssets: function(){
		return this.monitor.getFilteredAssets();
	}
	
});