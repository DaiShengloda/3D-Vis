if(!it.viewTemplate){
	it.viewTemplate = {};
}
var ViewVirtualDeviceTemplate = function(){
	this._cacheTab = {};
	this._initSelected = false;
	this._columns = [];
	this._rows = [];
	this.init();
	this.__propMap__ = null;
}

mono.extend(ViewVirtualDeviceTemplate,Object,{
	init: function(){
		var $view = this._$view = $('<div><p style="text-align: center;">' +it.util.i18n("DefaultViewTemplate_No_Data")+ '</p></div>');
		var $viewTable = this._$tableView =  $('<table id="virtualDeviceTable"></table>');
		$viewTable.appendTo($view);
		var $extView = this._$extView =  $('<table id="virtualDeviceExtTable"></table>');
	},
	getView: function(){
		return {
			0: this._$view,
			1: this._$extView
		}
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
			return newData;
		}else{
			return data;
		}
	},
	setData: function(originalData){
		this._$view.find('p').empty();
		var data =originalData;
		if(data.extend && data.extend["__group__"] && data.extend["__propMap__"]){
			data = this.regroupData(originalData);
		}
		var general = {}, val;
		for(var key in data){
			val = data[key];
			if(!it.util.is(val, 'Object')){
				general[key] = val;
				delete data[key];
			}
		}
		var extend = data.extend;

		//如果有扩展数据分开进行处理
		if(extend){
			$('.realtimeExt').css("display", "block");
			for(var key in extend){
				val = extend[key];
				if(it.util.is(val, 'Object')){
					data[key] = val;
					delete extend[key];
				}
			}
		}

		delete general['_all'];

		if(Object.keys(general).length>0) {
			this.renderTable(general, $('#virtualDeviceTable'));
		}
		if(data.extend && Object.keys(data.extend).length>0) {		
			this.renderTable(data.extend, $('#virtualDeviceExtTable'));					
		}
	},
	renderTable: function(general, $rootView) {
		var self = this;
		var tableData = $rootView.bootstrapTable('getData');
		var isArray = tableData instanceof Array;
		if(isArray && tableData && tableData.length>0) {
			var dataMap = {};
			$.each(tableData, function(index, item) {
				dataMap[item.key] = index;
			});
			for(key in general) {
				if(dataMap[key+":"]>0) {
					general[key] = {key:key+":",value:general[key]};
					$.extend(tableData[dataMap[key+":"]], general[key]);
				}
			}
			$rootView.bootstrapTable('load',tableData);
		}else {
			$rootView.bootstrapTable({
				columns: [],
				data: [],
				classes: 'table-no-bordered',//不要边框
				cache: false,
			});
			var rows = [];
			var columns = [
				{
					'field': 'key',
					'title': 'key'
				},
				{
					'field': 'value',
					'title': 'value'
				},
			];
		
			for(key in general) {
				if(!general || !Object.keys(general).length)return;
				var row = {};
				row.key = key + ':';
				row.value = general[key];
				rows.push(row);
			}
			$rootView.bootstrapTable('refreshOptions',{
				data: rows,
				columns: columns
			});	

		}
	}
});
it.viewTemplate.ViewVirtualDeviceTemplate = ViewVirtualDeviceTemplate;