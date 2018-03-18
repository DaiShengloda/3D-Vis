if(!it.monitor){
	it.monitor = {};
}

var InnerInfoDecorator = function(monitor){
	InfoDecorator.call(this, monitor);
};

mono.extend(InnerInfoDecorator, InfoDecorator,{
	showInfo: function(){
		InnerInfoDecorator.superClass.showInfo.call(this);
		var assets = this.getFilteredAssets();
		var assetIds = assets.map(function(elem, index) {
			return elem.getId();
		});
		var self = this;
		this._markEquipements = [];
		this._animates = [];
		var dm = this.sceneManager.dataManager;
		
		this._listener = function(mainNode, node,oldFocusNode){
			if(self._lastFocusNode && self._lastFocusNode != node){
				self.removeCache();
			}
			if(node.getClient('has_monitor_mark')){
				self.removeCache();
				return;
			}
			if(!node.getClient('monitor_equipment'))return;
			var rackData = self.sceneManager.getNodeData(node);
			var children = rackData.getChildren();

			var box = self.sceneManager.network3d.getDataBox();
			children.forEach(function(asset, index){
				if(!asset || assetIds.indexOf(asset.getId()) < 0)return;
				item = self.sceneManager.getNodeByDataOrId(asset);
				if(item.getClient('has_monitor_mark'))return;
				var dt = self.sceneManager.dataManager.getDataTypeForData(asset);
				var size = dt.getSize();
				self.createInnerMark(box, item, size.ySize || 1);
			});
			self._lastFocusNode = node;
		}
		this.sceneManager.viewManager3d.getDefaultEventHandler().addAfterLookAtListener(this._listener);
	},
	createInnerMark: function(box, item, ySize){
		var b = item.getBoundingBoxWithChildren(), min = b.min, max = b.max;
		var x = max.x - min.x, y = max.y - min.y, z = max.z - min.z;
		var cube = new mono.Cube(x, y, z+2);
		cube.setParent(item);
		cube.s({
			// 'm.type':'phong',
			'm.visible': false,
			'front.m.visible': true,
			'front.m.transparent': true,
			'front.m.texture.image': './images/realtime-mark.png',
			'front.m.repeat': new mono.Vec2(1,ySize),
			'front.m.texture.offset': new mono.Vec2(1,0)
		});
		item.setClient('has_monitor_mark', true);
		cube.setClient('monitor_equipment_mark', true);
		box.add(cube);
		this._markEquipements.push(cube);

		var animate = new mono.Animate({
			from:1,
			to: 0,
			reverse: false,
			dur: 2000,
			repeat: Number.MAX_VALUE,
			onUpdate: function (value) {
        		cube.setStyle('front.m.texture.offset',new mono.Vec2(value,0));
           	}
		}).play();
		this._animates.push(animate);
	},
	getNode: function(asset){
		if(!asset) return;
        var node = this.sceneManager.dataNodeMap[asset.getParentId()];
        if(!node || node.getClient('monitor_equipment')) return;
        node.setClient('monitor_equipment',true);
        return node;
	},
	hideComponentHandler: function(comp){
		this.sceneManager.viewManager3d.getDefaultEventHandler().removeAfterLookAtListener(this._listener);
		this.removeCache();
	},
	removeCache: function(){
		var es = this._markEquipements;
		var box = this.sceneManager.network3d.getDataBox();
		var eq, p;
		for(var i=0; i<es.length;i++){
			eq = es[i];
			p = eq.getParent();
			if(p){
				p.setClient('has_monitor_mark', false);
			}
			eq.setParent(null);
			box.remove(eq);
		}
		var anms = this._animates, anm;
		for(var i=0; i<anms.length;i++){
			anm = anms[i];
			anm.stop();
		}
	},
	getImage: function(){
		return util.images.realtimImageInner;
	},
	cacheCompnent: function(asset, comp){
		this.putComponent(asset.getParentId(), comp);
	},
	hideComponentHandler: function(comp){
		var parent = comp.getParent();
		parent.setClient('monitor_equipment',null);
	}
});
it.IID =it.monitor.InnerInfo =InnerInfoDecorator;