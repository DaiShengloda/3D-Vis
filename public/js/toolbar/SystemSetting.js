var $SystemSetting = function(){
	$ToolBarButton.call(this);
	this.init();
};
mono.extend($SystemSetting,$ToolBarButton,{
	
	init : function(){
		var self = this;
		this.divMaps = [];//注册时的div，目的是获取输入值
		this.appValue = {};//输入值
		this.appMaps = {};//注册的app
		this.create();
		this.button.click(function(){
			self._dialog.dialog('open');
		});
		$('.systemSetting_btn_confirm').on('click',function(){
			//获取所有系统值
			var isChangedArr = [],isChangedFlag = true;
			self.divMaps.forEach(function(div){
				for(var i in div){
					isChangedArr.push(div[i][i]('isChanged'));
				}
			});
			isChangedFlag = isChangedArr.some(function(f){
				return f === true;
			});
			if(isChangedFlag){
				self.divMaps.forEach(function(div){
					for(var i in div){
						self.appValue[i] = div[i][i]('getResult');
					}
				})
				var vals = JSON.stringify(self.appValue);
				localStorage.setItem('systemSetting',vals);
				layer.msg(it.util.i18n('SystemSetting_msg_confirm_and_wait'),{
					time: 300,
					end: function(){
						self.doConfirm();
						self._dialog.dialog('close');
					}
				});
			}else{
				self._dialog.dialog('close');
			}
		});
		$('.systemSetting_btn_reset').on('click',function(){
			self.divMaps.forEach(function(div){
				for(var i in div){
					self.appValue[i] = div[i][i]('clickForReset');
				}
			})
		})
	},
	create: function(){
		this._dialog = this.createBody();
		this._dialog.dialog({ //创建dialog弹窗
			dialogClass: 'new-dialog1',
            blackStyle: true,
            width: 'auto',
            height: 'auto',
            title: it.util.i18n("ToolbarMgr_SystemSetting"),
            autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
            show: '', //显示弹窗出现的效果，slide为滑动效果
            hide: '', //显示窗口消失的效果，explode为爆炸效果
            resizable: false, //设置是否可拉动弹窗的大小，默认为true
            modal: true,
		});
		//超出对话框显示
		this._dialog.css('overflow', 'visible');
		this._dialog.parent().css('overflow', 'visible');
	},
	createBody: function(){
		var containerDiv = $('<div class="systemSetting_container"></div>').css({
			'padding': '20px 20px 10px',
    		'background': 'none',
    		'border': 'none',
    		'margin': '0'
		});
		//机柜编号app
		var rackNumberApp = new it.ShowRackNumber(main.sceneManager);
		this.register('rackNumberDisplay', rackNumberApp);
		var rackNumberDiv = $('<div></div>').rackNumberDisplay({
			container: containerDiv,
			app: rackNumberApp
		});
		this.divMaps.push({'rackNumberDisplay': rackNumberDiv});
		var btnArea = $('<div class="systemSetting_btnArea app-btn-group"></div>').appendTo(containerDiv);
		this.createBtns(btnArea);
		return containerDiv;
	},
	createBtns: function(parent){
		var self = this;
		var btnVals = ['reset','confirm'];
		btnVals.forEach(function(val){
			var btnDom = $('<div></div>').addClass('systemSetting_btn_'+val).text(it.util.i18n('SystemSetting_btn_'+val)).appendTo(parent);
		});
		
	},
	register: function(name,app){
		this.appMaps[name] = app;
	},
	doConfirm: function(){
		var self = this;
		for(var name in this.appMaps){
			if(this.appMaps[name].doConfirm){
				this.appMaps[name].doConfirm();
			}
		}
	}
});
it.SystemSetting = $SystemSetting;

