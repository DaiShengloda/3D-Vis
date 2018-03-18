var DefinedViewTemplate = function(sceneManager, id){
	this.init();
}

mono.extend(DefinedViewTemplate, Object, {
	/* 此方法必须，返回自定义页面最外层HTML元素
	*	param: 
	* 	return: HTML元素对象
	*/
	getView: function(){
		return this._$rootView;
	},
	/* 此方法必须，更新后端推送的实时数据
	*	param： 正在查看的资产对象变化的属性及值
	*	return： null
	*/
	update: function(data){
		this.setData(data);
	},
	init: function(){
		var $view = this._$rootView = $('<div></div>');
	},
	setData: function(data){
		this._$rootView.empty();
		for(var key in data){
			this._$rootView.append("<div>"+key+": "+data[key]+"</div>");
		}
	},
});


