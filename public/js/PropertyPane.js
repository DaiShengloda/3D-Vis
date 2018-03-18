var $PropertyPane = function ($parent) {
	if($parent == null){
		$parent = $(document.body);
	}
	this.parentId = $parent.attr("id");
	var rootContent = this.rootContent = $('<form class = "form-horizontal" role = "form"></form>').appendTo($parent);
	this.setStatusMap = {}; //notEdit edited
	this.regularKeyMap = {};
};

$PropertyPane.getInstance = function(){
	if($PropertyPane.instance == null){
		$PropertyPane.instance = new $PropertyPane();
	}
	return $PropertyPane.instance;
};

mono.extend($PropertyPane,Object,{
	addKeyValue : function(key,value,callback,wrap){
		var regularKey = key.replace(/\s/g,"-");
		regularKey = regularKey.replace(/%/g,"percent");
		regularKey = regularKey.replace(/\(/g,"lb");
		regularKey = regularKey.replace(/\)/g,"rb");
		regularKey = regularKey.replace(/;/g,"semicolon");
		regularKey = regularKey.replace(/:/g,"colon");
		regularKey = regularKey.replace(/\"/g,"dquotes");
		regularKey = regularKey.replace(/\'/g,"squotes");
		regularKey = regularKey.replace(/\,/g,"comma");
		regularKey = regularKey.replace(/\./g,"point");
		regularKey = regularKey.replace(/\//g,"slash");
		regularKey = regularKey.replace(/\\/g,"backslash");
		this.regularKeyMap[regularKey] = key;
		var valueField = this.rootContent.find("#"+regularKey);
		if(valueField.length>0){

			var oldValue;
			if(this.parentId === "bp_set"){
				oldValue = valueField.val();
			}else{
				oldValue = valueField.text();
			}

			if(oldValue !== value){
				if(this.parentId === "bp_set"){

					if(this.setStatusMap[key] === "notEdit"){
						if(!valueField.is(":focus")){
							valueField.val(value);
						}
					}
				}else{
					valueField.text(value);
				}
			}
		}else{

			var labelText = it.util.i18n(key);
			if(this.parentId === "bp_set" && key === "ID"){
				labelText = it.util.i18n("PropertyPane_Device_position");
			}

			var label = $('<label class="col-sm-5 label-min label-inline-block">'+labelText+' :'+'</label>');//.appendTo(this.rootContent);
			 			
			if(this.parentId === "bp_set"){ //纳源丰设置参数TAB下的属性值可编辑
				valueField = $('<input id="'+ regularKey +'" class="col-sm-7 label-value label-inline-block" value="'+ value +'"/>');
				var self = this;
				valueField.on('focus',function(e){
					var target = $(e.target);
					var prop = self.regularKeyMap[target.attr("id")];
					self.setStatusMap[prop] = "edited";

				});
			}else{
				valueField = $('<label id="'+ regularKey +'" class="col-sm-7 label-value label-inline-block">'+value+'</label>');	
			}
			var row = $('<div class="form-group-no-margin"></div>');
			row.append(label);
			row.append(valueField);
			if(wrap && wrap.length>0) {
				row.appendTo(wrap);
				wrap.appendTo(this.rootContent);
			}else {
				row.appendTo(this.rootContent);
			}
			
		}
	},

	addKeyValues: function(key,value,callback) {
			if(it.util.is(value, 'Object')) {
				var $realtimeArr = $('<div class="realtimeArr"></div>');
				for(var item in value) {
					this.addKeyValue(item,value[item],callback,$realtimeArr);
				}
			}else {
				this.addKeyValue(key,value,callback);
			}
	},

	getRootConent : function(){
		return this.rootContent;
	},

	setData : function(data,callback){
		var valueField = this.rootContent.find("#btnSave");
		for(var key in data){
			if(this.parentId === "bp_switch" || this.parentId === "bp_warm"){
				if(key.indexOf("OnOff") !== -1){
					if(parseFloat(data[key]) !== 0){
						data[key] = it.util.i18n("bp_warm_on");
					}else{
						data[key] = it.util.i18n("bp_warm_off");
					}
				}else{
					if(parseFloat(data[key]) !== 0){
						data[key] = it.util.i18n("bp_warm_alarm");
					}else{
						data[key] = it.util.i18n("bp_warm_normal");
					}
				}
			}else if(this.parentId === "bp_see"){
				if(key === "dev_fan" || key === "dev_Tropical" || key === "dev_Compressor"){
					if(parseFloat(data[key]) !== 0){
						data[key] = it.util.i18n("bp_warm_on");
					}else{
						data[key] = it.util.i18n("bp_warm_off");
					}
				}
			}
			this.addKeyValues(key,data[key],callback);
			
			if(this.parentId === "bp_set"){
				if(valueField.length ===0){
					this.setStatusMap[key] = "notEdit";
				}
			}
		}
		if(this.parentId === "bp_set"){			
			if(valueField.length ===0){
				var row = $('<div class="form-group-no-margin"></div>');
				var button = $('<span id="btnSave" class="base-panel-search-btn" type="submit" title="确认">确认</span>');
				var self = this;
				button.on('click',function(e){
					var param = [];
					for(var prop in self.setStatusMap){
						if(self.setStatusMap[prop] === "edited"){
							var regularKey = prop.replace(/\s/g,"-");
							var propValue = self.rootContent.find("#"+regularKey);
							param.push({
								key: prop,
								value:propValue.val()
							})
							self.setStatusMap[prop] === "notEdit";
						}
					}
					callback && callback(param);
				});

				row.append(button);
				row.appendTo(this.rootContent);
			}
		}
	},
});