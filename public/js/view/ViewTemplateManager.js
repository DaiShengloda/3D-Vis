/**
 * 管理资产对象实时数据的展示组件
 * 管理器依据资产类型分别管理展示组件模板，组件中包含对实时数据的消费
 * 当资产对象显示组件时，管理器根据模组件板创建实例
 * 当资产类型没有展示组件模板，使用默认展示组件
 */
var $ViewTemplateManager = function(sceneManager){
	this.sceneManager = sceneManager;
	// this.init();
	this._batchVT = {};
	this._categoryVT = {};
	this._dataTypeVT = {};
	this._views = {};
	this._categoryViews = {};
	this._batchViews = {};
	this.DEFAULT = '__default__';
}

mono.extend($ViewTemplateManager,Object,{
	registerViewByCategory: function(category, group, vt){
		if(it.util.is(group,'Function')){
			vt = group;
			group = this.DEFAULT;
		}
		var catVts = this._categoryVT[category] || (this._categoryVT[category] = {});
		catVts[group] = vt;
	},
	registerViewByDataType: function(dataType, group, vt){
		if(it.util.is(group,'Function')){
			vt = group;
			group = this.DEFAULT;
		}
		var catVts = this._dataTypeVT[dataType] || (_dataTypeVT[dataType] = {});
		catVts[group] = vt;
	},
	// BatchView指的在实时查看的时候，同时显示多个资产的实时数据
	registerBatchViewByCategory: function(category, group, vt){
		if(it.util.is(group,'Function')){
			vt = group;
			group = this.DEFAULT;
		}
		var catVts = this._batchVT[category] || (this._batchVT[category] = {});
		catVts[group] = vt;
	},
	removeBatchViewByCategory: function(category, group){
		if(group){
			this._batchVT[category] && delete this._batchVT[category][group];
		} else {
			delete this._batchVT[category];
		}
	},
	removeViewByCategory: function(category, group){
		if(group){
			this._categoryVT[category] && delete this._categoryVT[category][group];
		} else {
			delete this._categoryVT[category];
		}
	},
	removeViewByDataType: function(dataType, group){
		if(group){
			this._dataTypeVT[dataType] && delete this._dataTypeVT[dataType][group];
		} else {
			delete this._dataTypeVT[dataType];
		}
	},
	getViewTemplate: function(id, group, isBatch){
		var info = this.getInfo(id), vts, vt;
		if(isBatch){
			vts = this._batchVT[info.category];
		} else {
			vts = this._dataTypeVT[info.dataType] || this._categoryVT[info.category];
		}
		vts && (vt = vts[group]);
		
		if(!vt){
			vt = this.getDefaultViewTemplate();
		}
		return vt;
	},
	getInfo: function(id){
		var dm = this.sceneManager.dataManager;
		var dt = dm.getDataTypeForData(dm.getDataById(id));
		if(!dt) return {};
		return {
			dataType: dt.getId(),
			category: dt.getCategoryId()
		}
	},
	getDefaultViewTemplate: function(){
		return DefaultViewTemplate;
	},
	showViews: function(ids, group, cb){
		if(it.util.is(group,'Function')){
			cb = group;
			group = this.DEFAULT;
		}
		group = group || this.DEFAULT;
		if(!ids || !ids.length)return;
		for(var i=0; i<ids.length;i++){
			this.showView(ids[i], group, cb, true, true);		
		}
		// 订阅数据
		main.RealtimeDynamicEnviroManager.monitorAssetData(ids);
	},
	showView: function(id, group, cb, noSubscribe, isBatch, showOneFromList){
		if(this._views[id])return;
		if(it.util.is(group,'Function')){
			isBatch = noSubscribe;
			noSubscribe = cb;
			cb = group;
			group = this.DEFAULT;
		}
		group = group || this.DEFAULT;
		var vt = this.getViewTemplate(id, group, isBatch);
		var view = new vt(this.sceneManager, id);
		this.cacheView(id, isBatch, view);
		if(cb){
			cb(view, id);
		}
		if(showOneFromList){
			this._assetIdFromList = id;
		}
		if(!noSubscribe){
			main.RealtimeDynamicEnviroManager.monitorAssetData(id);
		}
	},
	showCategoryViews: function(categoryId,ids, group, cb, noSubscribe,isBatch) {
		//判断categoryId是否存在
		if(!categoryId || !ids.length)return;
		group = group || this.DEFAULT;
		//实例化ViewAllDataTemplate模板,显示所有数据
		var vt = it.viewTemplate.ViewAllDataTemplate;
		var categoryView = new vt(categoryId, ids);
		this.cacheCategoryView(categoryId, categoryView);
		if(cb) {
			cb(categoryView, categoryId);
		}
		// 订阅数据
		this._batchCategory = categoryId;
		main.RealtimeDynamicEnviroManager.monitorAssetData(ids, categoryId);	
	},
	//由于同一时间只会显示一种实时数据页面，所以不用按group缓存
	cacheView: function(id, isBatch, view){
		var views = this._views;
		if(isBatch)views = this._batchViews;
		views[id] = view;
	},
	cacheCategoryView: function(id, view) {
		var categoryViews = this._categoryViews;
		categoryViews[id] = view;
	},
	fetchView: function(id, isBatch){
		var views = this._views;
		if(isBatch)views = this._batchViews;
		return views[id]
	},
	fetchCategoryView: function(id, isBatch){
		var categoryViews = this._categoryViews;
		if(isBatch)categoryViews = this._batchViews;
		return categoryViews[id];
	},
	getUpdateView: function(id){
		return this._views[id] || this._batchViews[id];
	},
	getCategoryView: function(id){
		return this._categoryViews[id] || this._batchViews[id];
	},
	deleteView: function(id, isBatch){
		isBatch?delete this._batchViews[id]:delete this._views[id];
	},
	deleteCategoryView: function(id){
		delete this._categoryViews[id];
	},
	hideView: function(id, group, cb, noSubscribe, isBatch){
		if(it.util.is(group,'Function')){
			isBatch = noSubscribe;
			noSubscribe = cb;
			cb = group;
			group = this.DEFAULT;
		}
		group = group || this.DEFAULT;
		var view = this.fetchView(id, isBatch);
		if(!view)return;
		if(cb){
			cb(view);
		}
		view.destory && view.destory();
		if(!noSubscribe){
			main.RealtimeDynamicEnviroManager.clearMonitorData();
		}
		// delete this._views[id];
		// delete this._batchViews[id];
		this.deleteView(id, isBatch);
		delete this._assetIdFromList;
	},
	hideViews: function(ids, group, cb){
		if(it.util.is(group,'Function')){
			cb = group;
			group = this.DEFAULT;
		}
		group = group || this.DEFAULT;
		if(!ids || !ids.length)return;
		for(var i=0; i<ids.length;i++){
			this.hideView(ids[i], group, cb, true, true);
		}
		// 订阅数据
		main.RealtimeDynamicEnviroManager.clearMonitorData();
	},
	hideCategoryViews: function(categoryId){
		delete this._batchCategory;
		// 取消订阅
		main.RealtimeDynamicEnviroManager.clearMonitorData();
		this.deleteCategoryView(categoryId);//删除view
	},
	updateView: function(id, data){
		//当batchCategory存在时，批量更新
		if(this._batchCategory && !id){
			// if(this._assetIdFromList){
			// 	var view = this.getUpdateView(this._assetIdFromList);
			// 	if(view) {
			// 		view.update(this._assetIdFromList, data[this._assetIdFromList]);				
			// 	}
			// }
			var view = this.getCategoryView(this._batchCategory);
			view.batchUpdate(this._batchCategory, data);
		} else if(id){
			var view = this.getUpdateView(id);
			if(view) {
				view.update(id, data);				
			}
		}
		
	}
})

