if(!it.monitor){
	it.monitor = {};
}

var InfoDecorator = function(monitor){
	MonitorDecorator.call(this, monitor);
	this._components = {};
};

mono.extend(InfoDecorator, MonitorDecorator,{
	// 获取资产要显示的信息
	getInfo: function(asset){

	},
	showInfo: function(){
		var assets = this.getFilteredAssets();
		var asset, info;
		for(var i=0; i<assets.length;i++){
			asset = assets[i];
			// info = this.getInfo(asset);
			this.handleComponent(asset);
		}
	},
	hideInfo: function(){
		var comp, box = this.sceneManager.network3d.getDataBox();
		for(var id in this._components){
			comp = this._components[id];
			this.hideComponentHandler(comp);
			comp.setParent(null);
			box.remove(comp);
		}
		this._components = {};
	},
	/**
     * 创建组件，组件用于展示实时数据资产的汇总信息
     * @param asset
     */
	handleComponent: function(asset){
		var comp = this.createComponent(asset);
		if(comp){
			this.cacheCompnent(asset, comp);
		}
	},
	hideComponentHandler: function(comp){

	},
	getNode: function(asset){
		if(!asset) return;
        var node = this.sceneManager.dataNodeMap[asset.getId()];
        return node;
	},
	getImage: function(){
		return util.images.realtimImage;
	},
	createComponent: function(asset){
		var node = this.getNode(asset);
		var box = this.sceneManager.network3d.getDataBox();
		if(!node || !box.getDataById(node.getId()))return;
		
        var billboard = new mono.Billboard();
        billboard.setPosition(0, node.getBoundingBox().max.y, 0);
        billboard.setStyle('m.alignment', mono.BillboardAlignment.bottomCenter);
        billboard.setStyle('m.transparent', true);
//        billboard.setStyle('m.texture.image', TML.Factory3D.getImagePath('asset.png'));
        // billboard.setStyle('m.texture.image', util.images.assetImage);
        billboard.setStyle('m.texture.image', this.getImage());
        billboard.setStyle('m.alignment', mono.BillboardAlignment.bottomCenter);
        // billboard.setStyle('m.vertical', true);
        billboard.setScale(40, 50, 1);
        billboard.setParent(node);
        // billboard.setClient('it_data',asset);
        box.add(billboard);
        return billboard;
	},
	putComponent: function(id, comp){
		this._components[id] = comp;
	},
	cacheCompnent: function(asset, comp){
		this.putComponent(asset.getId(), comp);
	},
	show: function(category, data){
		var hasAsset = this.monitor.show(category, data);
		if(hasAsset){
			this.showInfo();
			return true;
		}
		return hasAsset;
	},
	hide: function(){
		this.monitor.hide();
		this.hideInfo();
	}
});

it.InfoD = it.monitor.InfoDecorator = InfoDecorator;