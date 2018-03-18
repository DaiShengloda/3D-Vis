if(!it.monitor){
	it.monitor = {};
}

var SelectPanelDecorator = function(monitor){
	MonitorDecorator.call(this, monitor);
};

mono.extend(SelectPanelDecorator, MonitorDecorator,{
	// 订阅数据并实时显示
	hideSelectPanel:function(){
		this.isSearchAgain = true;
		if(!this._$root)return;
		layer.closeAll();
		this._$root.remove();
	},
	showSelectPanel: function(){
		var self = this;		
		var assets = this.getFilteredAssets();
		var $root = this._$root = $('<div class="selectPane"></div>');

		// var $filterDiv = $('<div class="it-input-group">'+
		// 	'<span class="it-input-group-addon">'+it.util.i18n('Filter')+'</span>'+
		// 	'<input type="text" class="it-form-control" placeholder="Filter"></div>').appendTo($root);
		var $filterDiv = $('<div class="it-input-group">'+
		'<input type="text" class="it-form-control" placeholder="Filter"></div>').appendTo($root);
		$filterDiv.css({
			'width': '92%'
		});

		var $list = $('<div class="it-list"></div>').appendTo($root);
		$list.addClass('bt-scroll');
		var asset, name;
		for(var i=0; i<assets.length;i++){
			asset = assets[i];
			name = asset.getId() ||  asset.getName();
			$('<a href="#" class="it-list-item" data-id="'+asset.getId()+'">'+name+'</a>').appendTo($list);
		}
		$(document.body).append($root);

		var lastTarget;
		$list.click(function(event) {
			//点击切换元素之前先删除上一个元素的view，并取消其订阅
			if(lastTarget) {
				var lastTargetId = $(lastTarget).data('id');
				$(lastTarget).removeClass('active');
				it.ViewTemplateManager.hideView(lastTargetId, undefined, undefined, false);
			}
			var target = event.target;
			lastTarget = target;
			if(target.tagName != 'A')return;
			var $target = $(target);
			var id = $target.data('id');
			$target.addClass('active');
			lookAt(id);
		});
		var lookAt = function(id){
			main.sceneManager.viewManager3d.getDefaultEventHandler().lookAtByData(id);
			main.sceneManager.viewManager3d.defaultEventHandler.addAfterLookFinishedAtListener(self.afterLookFinishedAtHandler, self);
		}
		
		var w = document.body.clientWidth, nw;
        if (w < 1440) {
            nw = '200px';     
        } else if (w >= 1440 && w < 1920) {
            nw = '240px';
        } else if (w >= 1920) {
            nw = '300px';
		}
		var index = layer.open({
			type: 1,
			shade: false,
			move: '.layui-layer-title', //'.layui-layer-content',
			offset: ['293px', '0px'],
			area: 'auto',
			width: nw,
			resize: false,
			title: it.util.i18n("ViewALLTemplate_View_Data"), 
			content: $root, //捕获的元素，注意：最好该指定的元素要存放在body最外层，否则可能被其它的相对元素所影响
			end: function() {
				//如果是点击selectPane上面的关闭，需要关闭实时数据面板和图标，如果是重新搜索，不需要关闭实时数据面板和图标
				if(self.isSearchAgain) {
					self.isSearchAgain = false;
					return;
				}		
				main.panelMgr.instanceMap.NavBarMgr.appManager.appMaps.REALTIME.clear();//关闭数据监控面板
				main.panelMgr.instanceMap.NavBarMgr.$box.nav('clearAndIfClose', true);//关闭数据监控按钮
				main.monitorManager.hideMonitor();			
			}
		});
		layer.style(index, {
			width: nw,
		  }); 
		$('.selectPane').parent('.layui-layer-content').css({
			'overflow': 'hidden'
		})
  
		
		var filterFun = function(assets, val){
			var asset, name, result = [];
			for(var i=0; i<assets.length;i++){
				asset = assets[i];
				name = asset.getName() || asset.getId();
				if(name.indexOf(val)>=0){
					result.push(asset);
				}
			}
			return result;
		}
		var refreshList = function(assets){
			$list.empty();
			if(!assets || assets.length <= 0){
				layer.alert(it.util.i18n("Id_Not_exist_Scene"));
				return;
			}
			var asset, name;
			for(var i=0; i<assets.length;i++){
				asset = assets[i];
				name = asset.getName() || asset.getId();
				$('<a href="#" class="it-list-item" data-id="'+asset.getId()+'">'+name+'</a>').appendTo($list);
			}
		}

		// 添加过滤事件
		$('input', $filterDiv).change(function(event) {
			var val = $(this).val();
			refreshList(filterFun(assets, val));
		});
	},
	show: function(category, data){
		var hasAsset = this.monitor.show(category, data);
		if(hasAsset){
			this.showSelectPanel();
			return true;
		}
		return hasAsset;
	},
	hide: function(){
		this.monitor.hide();
		this.hideSelectPanel();
	},
	afterLookFinishedAtHandler: function(node) {
		var self = this;
		main.sceneManager.viewManager3d.defaultEventHandler.removeAfterLookAtFinishedListener(self.afterLookFinishedAtHandler);		
		var data = main.sceneManager.getNodeData(node);
		var params = {
			// selectPaneIndex: self._index,
			isNeedShade: false,
			showOneFromSelectPane: true,
			noSubscribe: false,
			callback: function() {
				var currentFloorNode = main.sceneManager.getCurrentRootNode();
				if(currentFloorNode) {
					var currentFloorId = currentFloorNode._clientMap.it_data_id;
				}
				main.sceneManager.viewManager3d.getDefaultEventHandler().lookAtByData(currentFloorId);
			}
		}
		main.monitorManager.showRealTimeDialog(data, params);
	},
});
it.SPD = it.monitor.SelectPanel =SelectPanelDecorator;
