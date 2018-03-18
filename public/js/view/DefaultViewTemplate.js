if(!it.viewTemplate){
	it.viewTemplate = {};
}
var DefaultViewTemplate = function(){
	this._cacheTab = {};
	this._initSelected = false;
	this.init();
	this.__propMap__ = null;
}

mono.extend(DefaultViewTemplate,Object,{
	init: function(){
		var $view = this._$rootView = $('<div ></div>');
		var $tab = this._$tab = $('<ul class="nav nav-tabs" role="tablist" id="myTab"></ul>').appendTo($view);
		var $tabPanel = this._$tabPanel = $('<div class="tab-content"></div>').appendTo($view);
		$('<div>'+it.util.i18n("DefaultViewTemplate_No_Data")+'</div>').appendTo($tabPanel).css({
			textAlign: 'center',
			margin: '20px'
		});
	},
	getView: function(){
		return this._$rootView;
	},
	update: function(id, data){
		this.setData(data);
	},
	regroupData:function(data){
		if(data.extend && data.extend["__group__"] && data.extend["__propMap__"]){
			var newData = {};
			for(var prop in data){
				if(prop !== "extend"){
					newData[prop] = data[prop];
				}
			}
			newData.extend = {};			
			var oldDataGroup = data.extend["__group__"];
			var i;
			for(var tableColumnLabel in oldDataGroup){
				var propertyNames = oldDataGroup[tableColumnLabel];
				newData.extend[tableColumnLabel] = {};
				for(i=0;i<propertyNames.length;i++){
					var propertyName = propertyNames[i];
					newData.extend[tableColumnLabel][propertyName] = data[propertyName];
					delete newData[propertyName];
				}
			}
			delete data.extend["__group__"];
			this.__propMap__ = data.extend["__propMap__"];
			delete data.extend["__propMap__"];
			for(var propInExtend in data.extend){
				newData.extend[propInExtend] = data.extend[propInExtend];
			}

			
			// for(var prop in data){
			// 	if(prop !== "extend"){
			// 		newData[prop] = data[prop];
			// 	}else{
			// 		for(var propInExtend in data.extend){
			// 			newData.extend[propInExtend] = data.extend[propInExtend];
			// 		}
			// 	}
			// }


			// 	else{
			// 		newData.extend = {};
			// 		for(var propInExtend in data.extend){
			// 			newData.extend[propInExtend] = data.extend[propInExtend];
			// 		}
			// 	}

			return newData;
		}else{
			return data;
		}
	},
	setData: function(originalData){
		var data =originalData;
		if(data.extend && data.extend["__group__"] && data.extend["__propMap__"]){
			data = this.regroupData(originalData);
		}
		// this._$tab.empty();
		if(!this._initSelected){
			this._$tabPanel.empty();
		}
		
		var general = {}, val;
		for(var key in data){
			val = data[key];
			if(!it.util.is(val, 'Object') && !it.util.isArray(val)){
				general[key] = val;
				delete data[key];
			}
		}
		var extend = data.extend;

		if(extend){
			for(var key in extend){
				val = extend[key];
				if(it.util.is(val, 'Object')){
					data[key] = val;
					delete extend[key];
				}
			}
		}
		delete general['_all'];
		var cacheTab;
		if(Object.keys(general).length>0){
			var cacheTab = this._cacheTab['General'];
			if(cacheTab){
				this.setPaneData(cacheTab,general);
			} else {
				this.addTab('General',general);
			}
		}
		for(var key in data){
			var dataObj = data[key];
			if(Object.keys(dataObj).length<=0){
				continue;
			}
			var cacheTab = this._cacheTab[key];
			if(cacheTab){
				this.setPaneData(cacheTab,dataObj);
			} else {
				this.addTab(key, dataObj);
			}
		}
		if(!this._initSelected){
			$('#myTab a:first').tab('show');
			this._initSelected = true;
		}
		// $('#myTab a:first').tab('show');
	},
	addTab: function(key, data){
		$('<li role="presentation"><a href="#'+key+'" role="tab" data-toggle="tab">'+it.util.i18n(key)+'</a></li>').appendTo(this._$tab);
		var $pane = $('<div role="tabpanel" class="tab-pane realtimeTab" id="'+key+'"></div>').appendTo(this._$tabPanel);
		var $dataPane = new $PropertyPane($pane);
		this._cacheTab[key] = $dataPane;
		$dataPane.getRootConent().addClass('bt-scroll');		
		$dataPane.getRootConent().css({
			marginTop: '5px',
			maxHeight: '350px',
			overflowY: 'auto'
		});
		this.setPaneData($dataPane,data);
		
	},

	setPaneData:function(pane,data){
		var self = this;
		var callback = function(param){
			// var key = param.key;
			// var value = param.value;
			if(param.length && param.length > 0){
				var ip = self.__propMap__["__ip"];
				var port = self.__propMap__["__port"];
				var url = "http://" + ip + ":" + port + "/tools/GetData.ashx?action=SetParam";
				var i,j;
				var settingArr = [];
				var cabinetArr = [];
				for(i=0;i<param.length;i++){
					var key = param[i].key;
					var value = param[i].value;
					var dotName = self.__propMap__[key];
					var settingStr = dotName + "::" + value;
					var link = dotName.split(".")[0];
					var tableName = dotName.split(".")[1];
					var lastIndex = tableName.lastIndexOf("_");
					var cabinetStr = link + "." +tableName.substring(0,lastIndex);
					settingArr.push(settingStr);
					cabinetArr.push(cabinetStr);
				}
				$.ajax({  
	          type : "post",  
	          async:false,  
	          url : url,  
	          data:{
	            settings: JSON.stringify(settingArr),
	            cabinets: JSON.stringify(cabinetArr) 
	          },
	          success : function(data){  
	          	console.log("~~~~~~~~~")
	          	console.log(data);
	            ServerUtil.msgWithIcon(it.util.i18n("DefaultViewTemplate_Setting_success"), 6);
	          },  
	          error:function(){  
	            ServerUtil.msgWithIcon(it.util.i18n("DefaultViewTemplate_Setting_fail"), 6);
	          }  
	      });
			}
		}
		if(this.__propMap__){
			pane.setData(data,callback);
		}else{
			pane.setData(data);
		}
	}
});
it.viewTemplate.DefaultViewTemplate = DefaultViewTemplate;