//
var $GeneralConfigApp = function(configDialog){
	$ConfigApp.call(this,configDialog);
};

mono.extend($GeneralConfigApp,$ConfigApp,{
	
	getId : function(){
        return 'GeneralConfigApp';
    },

    /**
     * 初始化其自身的Panel
     */
    initConfigPanel : function(){
        var box = $('<div class="generalBox" id="generalBox"><div>');
        var header = $('<div><h5 style="font-weight: bold">'+it.util.i18n("GeneralConfigApp_General_setting") +':</h5></div>');
        box.append(header);
        
		var dataMap = [{
			id:"showTempHumAlarm",
			label:it.util.i18n("GeneralConfigApp_showTempAndHumAlarm"),
			defaultValue:false,
			click:function(){
				if ($('#showTempHumAlarm').prop('checked')) {
					// $('#humidityBox').show();
					$('#temperatureBox').show();
				}else{
					// $('#humidityBox').hide();
					$('#temperatureBox').hide();
				}
			}
		},{
			id:"isAnimateTempField",
			label:it.util.i18n("GeneralConfigApp_isAnimateTempField"),
			defaultValue:false
		},{
			id:"isVirtualOthersWhenLookAt",
			label:it.util.i18n("GeneralConfigApp_isVirtualOthersWhenLookAt"),
			defaultValue:false
		}];
        var table = this.createTable(dataMap);
        box.append(table);
        this.configDialog.append(box);
		  
		this.setData();
    },

    isConfigChanged: function(){
	  	var value4= $('#showTempHumAlarm').prop('checked');
	  	if (value4.toString() != main.systemConfig.show_temphum_alarm.toString()) {
	  		return true;
	  	}

	  	var value5=$('#isAnimateTempField').prop('checked');
	  	if(value5.toString() != main.systemConfig.is_animate_tempfield.toString()){
	  		return true;
	  	}

	  	var value6=$('#isVirtualOthersWhenLookAt').prop('checked');
	  	if(value6.toString() != main.systemConfig.is_virtual_others.toString()){
	  		return true;
	  	}
	  	return true;
    },

    createTable : function(dataMaps){
		var table = $('<table></table>');
		if (dataMaps) {
			var rowDatas = [];
			var flag = 0;
			for(var i = 0 ; i < dataMaps.length ; i++){
				if (i > 0 && i%3 === 0) {
					var row = this.createRow(rowDatas);
					table.append(row);
					rowDatas = [];
				}
				rowDatas.push(dataMaps[i]);
			}
            var row = this.createRow(rowDatas);
			table.append(row);
		}
		return table;
	},

	createRow : function(rowDatas){
		var row = $('<tr></tr>');
		if (rowDatas) {
			for(var i = 0 ; i < rowDatas.length ; i++){
				var rowData = rowDatas[i];
				var id = rowData.id;
				var label = rowData.label;
				var defaultValue = rowData.defaultValue;
				var click = rowData.click;
				var col = this.createColumn(id,label,defaultValue,click);
				row.append(col);
			}
		}
		return row;
	},

	createColumn : function(id,label,defaultValue,click){
		defaultValue = defaultValue || '';
		// var col = $('<td><label>'+label+':</label><input value="'+value+'" readonly></td>');
		var col = $('<td></td>');
		var item = this.createCheckBox(id,label,defaultValue,click);
		col.append(item);
		return col;
	},

    setData : function(){
		var showTempHumAlarm=main.systemConfig.show_temphum_alarm.toString();
		if (showTempHumAlarm != 'true') {
			setTimeout(function(){
				$('#temperatureBox').hide();
			},20);	
		}else{
			$('#temperatureBox').show();
		}
		this.changeCheckbox($('#showTempHumAlarm'),showTempHumAlarm=='true');

		var isAnimateTempField=main.systemConfig.is_animate_tempfield.toString();
		this.changeCheckbox($('#isAnimateTempField'),isAnimateTempField=='true');


		var isVirtualOthersWhenLookAt=main.systemConfig.is_virtual_others.toString();
		this.changeCheckbox($('#isVirtualOthersWhenLookAt'),isVirtualOthersWhenLookAt=='true');
    },

    getFormData : function(){
    	var showPropertyDialog = $('#showPropertyDialog')[0].checked;
    	var showAlarmTable = $('#showAlarmTable')[0].checked;
    	var showAlarmTableForAlarmTooltip=$('#showAlarmTableForAlarmTooltip')[0].checked;
    	var formData = {showPropertyDialog:showPropertyDialog,showAlarmTable:showAlarmTable,showAlarmTableForAlarmTooltip:showAlarmTableForAlarmTooltip};
    	return formData;
	},
	
	setDefaultValue: function() {
        this.changeCheckbox($('#showTempHumAlarm'),true);//默认显示温度气泡
		$('#temperatureBox').show();

		this.changeCheckbox($('#isAnimateTempField'),true);//温度场动画变化
		this.changeCheckbox($('#isVirtualOthersWhenLookAt'),false);//聚焦虚化场景
	},

    clickForSetDefaultValue : function(){
		var self = this;
		this.setDefaultValue();	
		self.showTempHumAlarm=$('#showTempHumAlarm').prop('checked');
	  	self.isAnimateTempField=$('#isAnimateTempField').prop('checked');
	  	self.isVirtualOthersWhenLookAt=$('#isVirtualOthersWhenLookAt').prop('checked');

    	var objData={
    		value:{
    			show_temphum_alarm:jsonUtil.object2String(self.showTempHumAlarm.toString()),
    			is_animate_tempfield:jsonUtil.object2String(self.isAnimateTempField.toString()),
    			is_virtual_others:jsonUtil.object2String(self.isVirtualOthersWhenLookAt.toString()),
    		},
    		options:{
    			id:'system'
    		}
    	};
		this.updateData(objData);
    },

	clickForConfirm: function() {
		var self = this;
	  	self.showTempHumAlarm=$('#showTempHumAlarm').prop('checked');
	  	self.isAnimateTempField=$('#isAnimateTempField').prop('checked');
	  	self.isVirtualOthersWhenLookAt=$('#isVirtualOthersWhenLookAt').prop('checked');

    	var objData={
    		value:{
    			show_temphum_alarm:jsonUtil.object2String(self.showTempHumAlarm.toString()),
    			is_animate_tempfield:jsonUtil.object2String(self.isAnimateTempField.toString()),
    			is_virtual_others:jsonUtil.object2String(self.isVirtualOthersWhenLookAt.toString()),
    		},
    		options:{
    			id:'system'
    		}
    	};
		this.updateData(objData);

	},
	
	updateData: function(data) {
		it.util.adminApi('config', 'update', data, function(result) {
            if (result.error) {
                console.error(result.error);
            }
        });
	},

    show:function(){
        $('#generalBox').show();
    },

    hide:function(){
        $('#generalBox').hide();
    }

});