var PortUsageViewTemplate = function(sceneManager, id){
	// this._$rootView = $('<div></div>');
	this.init();
}

mono.extend(PortUsageViewTemplate,Object,{
	init: function(){
		var $view = this._$rootView = $('<div></div>');
		var $progress = $('<div class="progress"></div>').appendTo($view);
		var $progressBar = this._$progressBar = $('<div class="progress-bar progress-bar-success" style="width: 0%"></div>').appendTo($progress);

	},
	getView: function(){
		return this._$rootView;
	},
	update: function(data){
		this._$progressBar.css('width', (data.portUsage/data.portTotal)*100+'%');
		this._$progressBar.text(data.portUsage+"/"+data.portTotal);
	},
	destory: function(){
		this._$rootView.remove();
	}
});
it.viewTemplate.PortUsageViewTemplate = PortUsageViewTemplate;