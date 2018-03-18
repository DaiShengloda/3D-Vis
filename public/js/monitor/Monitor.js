if(!it.monitor){
    it.monitor = {};
}

/* The Monitor Interface */
var IMonitor = new Interface('IMonitor', 
	[
		'getAssetsByCategory',
		'filterAsset',
		'show',
		'hide',
	]);

var Monitor = function(sceneManager,category, group){
	this.sceneManager = sceneManager;
	this.category = category;
	this.group = group;
	this.DEFAULT_LEVEL = 60;
	// this._level = ['room','floor','channel','rack','equipment','port','PDU','bingchuang','camera','doorControl'];
	if(!categoryLevel){
		this.getCategoryLevel();
	}
};

var categoryLevel;
mono.extend(Monitor,Object,{ // implement Monitor
	//根据category获取当前场景中的资产
	getAssetsByCategory: function(category, data){
		
		if(!category)return; 
		return this.filterAsset(data, category);
		//data为在实时数据面板中搜索到的结果，所以直接将data过滤就可以了，于是将以前根据category获取当前场景中的资产的代码注释  by chenghui  2017/12/21

		// var sm = this.sceneManager;
		// var rootNode = sm.getCurrentRootNode();
        // var defaultHandle = sm.viewManager3d.getDefaultEventHandler();
        // defaultHandle.lookAt(rootNode);
		// // var focusNode = sm.viewManager3d.getFocusNode();
		// var rootData = sm.getNodeData(rootNode);
		// var list = rootData.getChildren();
		// return this.filterAsset(list, category);
	},
	filterAsset: function(list, category, result){
		result = result || [];
		var self = this;
		var dm = this.sceneManager.dataManager;
		var level = categoryLevel?categoryLevel[category]:this.DEFAULT_LEVEL;
		// var level = this._level.indexOf(category)>=0?this._level.indexOf(category):this.DEFAULT_LEVEL;
		var rde = main.RealtimeDynamicEnviroManager;
		list.forEach(function(a){
			var dy = dm.getDataTypeForData(a);
			if(!dy)return;
			if(dy.getCategoryId() == category){
				// 判断资产是否有关联关系，如果没有关联关系，说明不会有实时数据
				if(rde.hasRelation(a.getId())){
					result.push(a);
				}
				// result.push(a);
			} else {
				var tempLevel = categoryLevel?categoryLevel[dy.getCategoryId()]:self.DEFAULT_LEVEL;
				// var tempLevel = self._level.indexOf(dy.getCategoryId());
				if(tempLevel < level){
					self.filterAsset(a.getChildren(), category, result);
				}
			}
		});
		return result;
	},
	show: function(category, data){
		var category = category || this.category;
		var assets = this.getAssetsByCategory(category, data);
		if(!assets || assets.length==0){
			util.msg(it.util.i18n("Monitor_Category_not_exist")+category+it.util.i18n("Monitor_Asset"));
			return false;
		}
		this._assets = assets;
		
		// this._laListener = function(mainNode, node,oldFocusNode){
		// 	var data = self.sceneManager.getNodeData(node);
		// 	var dt = self.sceneManager.dataManager.getDataTypeForData(data);
		// 	if(dt.getCategoryId() !== category)return;
		// 	self.showRealTimeDialog(data);
		// }
		// this.sceneManager.viewManager3d.getDefaultEventHandler().addAfterLookFinishedAtListener(this._laListener);
		
		return true;
	},
	afterLookAt: function(category){
        var self = this;
		this._laListener = function(mainNode, node,oldFocusNode){
			var data = self.sceneManager.getNodeData(node);
			var dt = self.sceneManager.dataManager.getDataTypeForData(data);
			if(dt.getCategoryId() !== category)return;
			self.showRealTimeDialog(data);
		}
		this.sceneManager.viewManager3d.getDefaultEventHandler().addAfterLookAtListener(this._laListener);
    },
	hide: function(){
		this.sceneManager.viewManager3d.getDefaultEventHandler().removeAfterLookAtListener(this._laListener);
	},
	getFilteredAssets: function(){
		return this._assets;
	},
	showRealTimeDialog: function(data){
		// layer.closeAll();
        if (!data) { 
            console.log('data is null');
            return
        }
        var id = data.getId();
        // if(!main.monitorManager.checkToShow(id))return;  //chenghui   2017/12/7
		
        if(!main.RealtimeDynamicEnviroManager.hasRelation(id))return;
        
        var realtimeUrl = null;
        if (dataJson.realtimeUrl) {
            realtimeUrl = dataJson.realtimeUrl;
            if (id) {
                realtimeUrl += '?id=' + id;
            }
        }
        if (realtimeUrl) {
            layer.open({
                type: 2,
                title: it.util.i18n("Monitor_Real_time_data"),
                shadeClose: true,
                shade: false,
                maxmin: true, //开启最大化最小化按钮
                area: ['893px', '600px'],
                content: realtimeUrl
            });
        }else{
        	var self = this;
            it.ViewTemplateManager.showView(id, this.group, function(view) {
                view = view.getView();
                var $content = $('#realTimeContent');
                if (!$content.length) {
                    $content = $('<div id="realTimeContent"></div>');
                    $(document.body).append($content);
                }
                $content.empty();
                $content.append(view);
                layer.open({
                    shade: 0,
                    type: 1,
                    title: it.util.i18n("Monitor_Real_time_data"),
                    shade: false,
                    maxmin: true, //允许全屏最小化
                    skin: 'layui-layer-rim', //加上边框 layui-layer-rim
                    content: $content,
                    success: function(layero, index) {
                        var $layero = $(layero)
                        $layero.css({
                            minWidth: '400px',
                            minHeigth: '200px',
                            left: (parseInt($layero.css('left')) - 200) + 'px',
                            top: (parseInt($layero.css('top')) - 100) + 'px'
                        });
                    },
                    end: function() {
                        it.ViewTemplateManager.hideView(data.getId(), self.group);
                    }
                });
            });
        }
              
    },
    getCategoryLevel: function(){
     	ServerUtil.api('category','find',{},function(result){
			if(!result)return;
			var cache = {};
			result.forEach(function(item){
				cache[item.id] = item.level;
			});
			categoryLevel = cache;
		});
    }
});
it.MM = it.monitor.Monitor=Monitor;

new Monitor().getCategoryLevel();

// it.Monitor = function(sceneManager,category){
// 	debugger;
// 	new Monitor(sceneManager,category);
// };