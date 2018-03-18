
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
        // var area = this.createRow('hum-config-diglog-01','%');
        
		var dataMap = [{
			id: "showPropertyDialog",
			label: it.util.i18n("GeneralConfigApp_Show_property_sheet"),
			defaultValue: true,
			click: function(checked) {
				// localStorage.showPropertyDialog = (checked == true);
				// var propertyManager = main.proDialog.propertyManager;
				// var focusNode = main.sceneManager.viewManager3d.getFocusNode();
				// var data = propertyManager.getContentByNode(focusNode);
				// if (data && data.length > 0 && propertyManager.isShow(data)) {
				// 	var title = propertyManager.getTitleByNode(focusNode);
				// 	var offset = propertyManager.getOffset(focusNode);
				// 	propertyManager.propertyPane.show({
				// 		items: data
				// 	}, focusNode, title, offset);
				// } else {
				// 	propertyManager.propertyPane.hide();
				// }
			}
		},{
			id:"showAlarmTable",
			label:it.util.i18n("GeneralConfigApp_Default_show_alarm"),
			defaultValue:false,
		},{
			id:"showAlarmTableForAlarmTooltip",
			label:it.util.i18n("GeneralConfigApp_showAlarmTableForAlarmTooltip"),
			defaultValue:false
		},{
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
        // return box;

        if(localStorage.showAlarmTableForAlarmTooltip=='true'){
	  		dataJson.showAlarmTableForAlarmTooltip=true;
	  	}else{
	  		dataJson.showAlarmTableForAlarmTooltip=false;
	  	}
    },

    isConfigChanged: function(){
    	var value1 =  $('#showPropertyDialog').prop('checked'),
	   	  	value2 = $('#showAlarmTable').prop('checked'),
	   	  	value3 = $('#showAlarmTableForAlarmTooltip').prop('checked');
	  	var showAlarmTable = localStorage.showAlarmTable;
		var showPropertyDialog = localStorage.showPropertyDialog;
		var showAlarmTableForAlarmTooltip=localStorage.showAlarmTableForAlarmTooltip;
		if (showPropertyDialog == null || showPropertyDialog == undefined || showPropertyDialog == 'true') {
	 		showPropertyDialog = true;
	  	}else{
	  		showPropertyDialog = false;
	  	}
	  	if (showAlarmTable && showAlarmTable != 'false') {
			showAlarmTable = true;
		}else{
	  		showAlarmTable = false;
	  	}
	  	if (showAlarmTableForAlarmTooltip && showAlarmTableForAlarmTooltip != 'false') {
	  		showAlarmTableForAlarmTooltip=true;
	  	}else{
	  		showAlarmTableForAlarmTooltip=false;
	  	}

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

	  	if(value1 == showPropertyDialog && value2 == showAlarmTable && value3==showAlarmTableForAlarmTooltip){
	  		return false;
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
        // if (main.systemConfig) {
        //     // this.configDialog.dialog('open');
        //     // this.alarmConfigDirty = false;
        //     this.initConfigDialogValue(main.systemConfig.temp_alarm_config,main.systemConfig.hum_alarm_config);
        // }
        // else{
        //     console.log('check loadData!!!');
        //     this.initConfigDialogValue(null);
        // }
        var showPropertyDialog = localStorage.showPropertyDialog;
		if (showPropertyDialog == null || showPropertyDialog == undefined || showPropertyDialog == 'true') {
			showPropertyDialog = true;
		}
		this.changeCheckbox($('#showPropertyDialog'),showPropertyDialog == true);

		var showAlarmTable = localStorage.showAlarmTable;
		if (showAlarmTable && showAlarmTable != 'false') {
			showAlarmTable = true;
		}
		this.changeCheckbox($('#showAlarmTable'),showAlarmTable == true);

		var showAlarmTableForAlarmTooltip = localStorage.showAlarmTableForAlarmTooltip;
		if (showAlarmTableForAlarmTooltip && showAlarmTableForAlarmTooltip != 'false') {
			showAlarmTableForAlarmTooltip = true;
		}
		this.changeCheckbox($('#showAlarmTableForAlarmTooltip'),showAlarmTableForAlarmTooltip==true);

		var showTempHumAlarm=main.systemConfig.show_temphum_alarm.toString();
		if (showTempHumAlarm != 'true') {
			// $('#humidityBox').hide();
			$('#temperatureBox').hide();
		}else{
			// $('#humidityBox').show();
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

    clickForSetDefaultValue : function(){
        this.changeCheckbox($('#showPropertyDialog'),true); // 默认属性框显示
        this.changeCheckbox($('#showAlarmTable'),false); // 默认属性框显示
        this.changeCheckbox($('#showAlarmTableForAlarmTooltip'),false);//默认非表格显示警告信息
        this.changeCheckbox($('#showTempHumAlarm'),true);//默认非表格显示警告信息
        // $('#humidityBox').show();
		$('#temperatureBox').show();

		this.changeCheckbox($('#isAnimateTempField'),false);
		this.changeCheckbox($('#isVirtualOthersWhenLookAt'),true);
    },

	clickForConfirm: function() {
		var self = this;
		var formData = this.getFormData();
		localStorage.showPropertyDialog = (formData.showPropertyDialog == true);
		var propertyManager = main.proDialog.propertyManager;
		var focusNode = main.sceneManager.viewManager3d.getFocusNode();
		var data = propertyManager.getContentByNode(focusNode);
		if (data && data.length > 0 && propertyManager.isShow(data)) {
			var title = propertyManager.getTitleByNode(focusNode);
			var offset = propertyManager.getOffset(focusNode);
			propertyManager.propertyPane.show({
				items: data
			}, focusNode, title, offset);
		} else {
			propertyManager.propertyPane.hide();
		}
		localStorage.showAlarmTable = (formData.showAlarmTable == true);

		localStorage.showAlarmTableForAlarmTooltip=(formData.showAlarmTableForAlarmTooltip==true);



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
    	ServerUtil.api('config','update',objData,function(data){
    		if (data.error) {
    			alterUtil.error(data.error);
    		}else{
    			main.systemConfig.show_temphum_alarm=self.showTempHumAlarm.toString();
    			main.systemConfig.is_animate_tempfield=self.isAnimateTempField.toString();
    			main.systemConfig.is_virtual_others=self.isVirtualOthersWhenLookAt.toString();
    		}
    	});

	},

    clickForCancel : function(){
        // this.initConfigDialogValue(null);
    },

    show:function(){
        $('#generalBox').show();
    },

    hide:function(){
        $('#generalBox').hide();
    }

});