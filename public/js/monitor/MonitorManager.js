var MonitorManager = function(sceneManager){
	this.sceneManager = sceneManager;
	this._monitorMap = {};
	this._monitorInstance = {};
	this.DEFAULT = '__default__';
};

mono.extend(MonitorManager,Object,{
	registerMonitor: function(category, group, monitor){
		if(it.util.is(group,'Function')){
			monitor = group;
			group = this.DEFAULT;
		}
		var monitors = this._monitorMap[category] || (this._monitorMap[category] = {});
		monitors[group] = monitor;
	},
	removeMonitor: function(category, group){
		if(group){
			this._monitorMap[category] && delete this._monitorMap[category][group];
		} else {
			delete this._monitorMap[category];
		}
	},
	getDefaultMonitor: function(sceneManager,category, group){
		return new SelectPanelDecorator(new InfoDecorator(new Monitor(sceneManager,category, group)));
	},
	getMonitorClass: function(category, group){
		var monitors = this._monitorMap[category];
		return monitors[group];
	},
	getMonitorInstance: function(category, group){
		var monitorClass = this.getMonitorClass(category, group);
		if(!monitorClass){
			monitorClass = this.getDefaultMonitor;
		}
		var instance = monitorClass.call(this, this.sceneManager, category, group);
		//由于同一时间只会显示一种想看的实时数据，所以不用按group缓存
		this._monitorInstance[category] = instance;
		return instance;
	},
	showMonitor: function(category, data,group){
		if(!category)return;
		//再点击一次相同monitor,清除
		// if(this._lastMonitor === category){
		// 	this.hideMonitor();
		// 	return;
		// }
		group = group || this.DEFAULT;
		//清除上一次其他的monitor
		this.hideMonitor();
		var instance = this._monitorInstance[category];
		if(!instance){
			instance = this.getMonitorInstance(category, group);
		}
		// var shown = instance.show();
		var shown = instance.show(category, data);		
		if(shown){
			this._lastMonitor = category;
			this._realTimeState = true;
		}
	},
	hideMonitor: function(){
		if(!this._lastMonitor)return;
		var instance = this._monitorInstance[this._lastMonitor];
		instance.hide();
		delete this._monitorInstance[this._lastMonitor];
		delete this._lastMonitor;
		delete this._realTimeState;
	},
	checkToShow: function(id, isCategory){
		if(!this._realTimeState)return false;
		if(isCategory){
			return this._lastMonitor === id;
		} else {
			var info = this.getInfo(id);
			return this._lastMonitor === info.category;
		}
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
/**
 * 
 * 
 * @param {any} data - 针对单一资产的情况下下传入一个data就可以了
 * @param {Object} extraParams - 从数据list传来的需要加入这个参数
 * @param {string} extraParams.noSubscribe - 当弹框的开启是通过数据list开启的时候，不要订阅实时数据，关闭弹框的时候也不要取消订阅实时数据
 * @param {function} extraParams.callback - 给定一个回调函数，当点击返回时关闭当前的弹框，同时展示之前的那个数据list
 * @param {Object} extraParams.callbackParams - 写成对象形式的回调函数的参数
 * @returns 
 */
showRealTimeDialog: function(data, extraParams) {
        var self = this;
        if (!data) {
            console.log('data is null');
            return;
		}

		var noSubscribe = extraParams&&extraParams.noSubscribe,
			isNeedShade = extraParams&&extraParams.isNeedShade,
			// selectPaneIndex = extraParams&&extraParams.index,//用于关闭selecepane layer
			showOneFromSelectPane = extraParams&&extraParams.showOneFromSelectPane,  //判断是否是从selectpane界面查看的
			showOneFromList = extraParams&&extraParams.showOneFromList;

		var id = data.getId();
		var category = main.sceneManager.dataManager.getCategoryForData(data).getId();
        var realtimeUrl = null;
        if (dataJson.realtimeUrl) {
            realtimeUrl = dataJson.realtimeUrl;
            if (id) {
                realtimeUrl += '?id=' + id;
            }
        }
        if (realtimeUrl && dataJson.layerOpen) {
            dataJson.layerOpen(realtimeUrl);
            return;
        }
        //if (!main.monitorManager.checkToShow(id)) return;
        if (!main.RealtimeDynamicEnviroManager.hasRelation(id) && category != 'floor') {
			ServerUtil.msg(it.util.i18n("RealTimeData_No_Exist"));	
			return;
		}
        var realtimeUrl = null; 
        if (dataJson.realtimeUrl) {
            realtimeUrl = dataJson.realtimeUrl;
            if (id) {
                realtimeUrl += '?id=' + id;
            }
        }
        if (realtimeUrl) {
            layer.open({
				// skin: 'layer-itv-dialog',
                type: 2,
                title: it.util.i18n("Monitor_Real_time_data"),
                shadeClose: true,
                shade: false,
                maxmin: true, //开启最大化最小化按钮
                area: ['893px', '600px'],
				content: realtimeUrl
            });
        } else {
            // show和hide的noSubscribe控制是否订阅/取消订阅，放在第三/四个参数的位置就好了
            it.ViewTemplateManager.showView(id, undefined, function(view) {
                self.repeatOpen = false;
                view = view.getView();
                var $content = $('#realTimeContent');
                if (!$content.length) {
                    $content = $('<div id="realTimeContent"></div>');
                    $(document.body).append($content);
				}
                $content.empty();
				$content.append(view);
                var layerIndex = layer.open({
					// skin: 'layer-itv-dialog',
					// shade: isNeedShade? 0.3:0,
					shade: false,
                    type: 1,
                    title: it.util.i18n("Monitor_Real_time_data"),
                    // maxmin: true, //允许全屏最小化
                    content: $content,
					btn: showOneFromList? [it.util.i18n("Monitor_Real_time_Return"),]:[],
					btnAlign: 'l',
                    yes: function(index, layero){
                        if(showOneFromList){
                            console.log('返回上级菜单')
							layer.close(index);
						}
                    },
                    success: function(layero, index) {
                        var $layero = $(layero)
                        $layero.css({
                            minWidth: '400px',
                            minHeigth: '200px',
                            left: (parseInt($layero.css('left')) - 100) + 'px',
                            top: (parseInt($layero.css('top')) - 100) + 'px'
                        });
                    },
                    end: function() {
						self.repeatOpen = true;
						//isFromSelectPane存在  说明是用selectpane界面查看，关闭设备layer
						if(showOneFromSelectPane){
							// layer.close(selectPaneIndex);
							layer.close(layerIndex);
							it.ViewTemplateManager.hideView(data.getId(), undefined, undefined, noSubscribe);
							return;
						}
						//noSubscribe=false 订阅，查看单个设备，关闭layer时切换监控按钮的状态
						if(!showOneFromList) {
							main.panelMgr.instanceMap.NavBarMgr.appManager.appMaps.REALTIME.clear();
							main.panelMgr.instanceMap.NavBarMgr.$box.nav('clearAndIfClose', true);//关闭数据监控按钮
						}			
						it.ViewTemplateManager.hideView(data.getId(), undefined, undefined, noSubscribe);
						extraParams&&extraParams.callback&&extraParams.callback(extraParams.callbackParams);
                    }
                });
            }, noSubscribe, false, showOneFromList);
        }
	},
	
	showVirtualRealTime: function(data) {
		var self = this;
        if (!data) {
            console.log('data is null');
            return;
		}
		var id = data.getId();
		it.ViewTemplateManager.showView(id, undefined, function(view){
			view = view.getView();			
			var tableView = view[0];
			var $content = $('#virtualrealTimeContent');
			if(!$content.length) {
				$content = $('<div id="virtualrealTimeContent"></div>');
			}
			$content.empty();
			$content.append(tableView);
			$content.appendTo($('.vmRealtimeTab'));
			//扩展数据
			var extView = view[1];
			var $extContent = $('#virtualrealTimeExtContent');
			if(!$extContent.length) {
				$extContent = $('<div id= "virtualrealTimeExtContent"></div>');
			}
			$extContent.empty();
			$extContent.append(extView);
			$extContent.appendTo($('.realtimeExtendTab'));
		}, false)
	}
});



