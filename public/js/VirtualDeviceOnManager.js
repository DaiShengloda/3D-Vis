var $VirtualDeviceOnManager = function (sceneManager) {
	it.VirtualDeviceManager.call(this,sceneManager);
	this.sceneManager = sceneManager;
	this.dm = this.sceneManager.dataManager;
	this.vm = this.sceneManager.viewManager3d;
	this.defaultEventHandler = this.vm.defaultEventHandler;
	this.network = this.sceneManager.network3d;
	this.box = this.network.dataBox;
	this.columnInfos = null;
	this.appInit();
};

mono.extend($VirtualDeviceOnManager, it.VirtualDeviceManager, {
	appInit: function() {
		var self = this;
		make.Default.load({"id": "twaver.idc.virtualDevice","outsideWidth":10,"insideWidth":9}, function (node) {
			self.v_deviceonPanel = $('#v_deviceonPanel');
			if(!self.v_deviceonPanel.length) {
				self.v_deviceonPanel = $('<div id="v_deviceonPanel" class="new-app-panel"style="min-height:200px;max-height:400px;"></div>');
			}
			self.v_deviceonPanel.dialog({
				appendTo: ".dialog-box",
				dialogClass: 'new-dialog1',
				blackStyle: true,
				resize: false,
				width: 'auto',
				height: 400,
				title: it.util.i18n("VirtualDeviceOn_Vmware_On"),
				closeOnEscape: false,
				show: false,
				hide: false,
				autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
				resizable: false, //设置是否可拉动弹窗的大小，默认为true
				modal: true, //是否有遮罩模型
				position: {
					my: "right top",
					at: "right-300 top+300",
					of: $(document),
				}
			});
			
		})

	},

	setData: function(data) {
		if(!data) return;	
		$('#v_deviceonPanel').off('click', '.buttons .cancel');
		$('#v_deviceonPanel').off('click', '.buttons .confirm');
		this.v_deviceonPanel.empty();	
		var $div = $('<div class="virtualDeviceOn bt-scroll" style="min-height:200px;max-height:300px;"></div>').appendTo(this.v_deviceonPanel);	
		var table = $('<table>').appendTo($div);
				
		var self = this;
		//基本信息
		var baseInfoMap = this.createBaseInfo(data);
		for(var i in baseInfoMap){
			var key = baseInfoMap[i].key;//label
			var data_value = i;//value 的data-value
			var value = baseInfoMap[i].value
			var required = baseInfoMap[i].required
			var row = self.addItem(key,data_value, value,required);
			table.append(row);
		}

		//扩展信息
		var extArr = [];//存放扩展字段
		ServerUtil.api('data', 'findCustomColumnsByCategoryId',  {categoryId: 'virtualDevice'}, function(items) {
			items.forEach(function(val){
				var key = val.column_display_name?val.column_display_name:val.column_name;//label
				var data_value = val.column_name; //label的自定义属性
				extArr.push(data_value);
				var row = self.addItem(key,data_value,'',false);
				table.append(row);
			})	

		})

		this.v_deviceonPanel.dialog('open');

		var buttons = $('<div class="buttons clearfix"></div>');
        var cancelBtn = $('<button class="cancel btn-gray">'+it.util.i18n("VirtualDeviceOn_Cancel")+'</button>');
        var confirmBtn = $('<button class="confirm btn-gray">'+it.util.i18n("VirtualDeviceOn_Confirm")+'</button>');
        buttons.append(cancelBtn);
        buttons.append(confirmBtn);
		this.v_deviceonPanel.append(buttons);
		$('#v_deviceonPanel').on('click', '.buttons .cancel', function(e){
			e.stopPropagation();
			self.cancelOn();
		});
		$('#v_deviceonPanel').on('click', '.buttons .confirm', function(e){
			e.stopPropagation();
			self.confirmOn(extArr);
		});

	},
	createBaseInfo: function(data){
		if(!data) return;
		//基本信息
		var baseInfoMap = {};
		baseInfoMap['_parentId'] = {
			key: it.util.i18n("VirtualDeviceOn_In_Equipment"),
			value: data.getId()
		},
		baseInfoMap['_id'] = {
			key: it.util.i18n("VirtualDeviceOn_Device_Id"),
			value: '',
			required: true
		},
		baseInfoMap['_name'] = {
			key: it.util.i18n("VirtualDeviceOn_Device_Name"),
			value: '',
			required: true
		}
		baseInfoMap['_description'] = {
			key: it.util.i18n("VirtualDeviceOn_Device_Des"),
			value: ''
		}
		return baseInfoMap;
	},

	//key:label的值， data-value:input的自定义属性，value:需要显示的值，isRequired：是否必填
	addItem: function(key, data_value,value,isRequired){
		if(!key) return null;
		var row = $('<tr class="form-group-no-margin app-line"></tr>');
		key = it.util.i18n(key) || key;
		var label_Name = $('<td class="labelName text">'+key+'：</td>');
		row.append(label_Name);
		if(data_value == '_parentId') {
			var label_Value = $('<td class="labelValue" ><input class="text" data-value="' +data_value+ '" value="'+value+'" disabled></td>');
		}else {
			var label_Value = $('<td class="labelValue" ><input class="text" data-value="' +data_value+ '" value="'+value+'"></td>');			
		}	
		row.append(label_Value);
		
		if(isRequired) {
			var required = $('<td class="required">*</td>');
			row.append(required);
		}else {
			var required = $('<td class="required" style="color:transparent">*</td>');
			row.append(required);
		}
		return row;
	},
	cancelOn: function(){
		this.v_deviceonPanel.dialog('close');
	},
	confirmOn: function(extArr){
		var baseInfo = this.getInfo(extArr);
		if(!baseInfo) return;
		var self = this;
		it.util.apiWithPush('add', baseInfo, function () {
			setTimeout(function(){
				self.vmOn = true;
				self.v_deviceonPanel.dialog('close');
				self.createVmNode(baseInfo);
			},100);
			
        }, function(error){
			ServerUtil.msg(error.message);
		});
	},
	getInfo: function(extArr){
		var self = this;
		var extInfo ={};
		var baseInfo = {};
		var baseArr = ['_businessTypeId', '_dataTypeId', '_description', '_extend', '_id', '_ii', '_location', '_name', '_parentId', '_position', '_position2d', '_rotation', '_weight'];
		var $eles = $('#v_deviceonPanel .virtualDeviceOn .labelValue input');
		this.isStop = false;
		$eles.each(function(index, ele){
			var val = $(ele).val();
			var dataVal = $(ele).data('value');
			if(baseArr.indexOf(dataVal)>-1) {
				dataVal = self.deleteCharacter(dataVal);
				baseInfo[dataVal] = val;
				if(dataVal == 'id') {
					if(val == '') {
						ServerUtil.msg(it.util.i18n("VirtualDeviceOn_No_Id_Tip"));
						self.isStop = true;
						return false;
					}else {
						var error = self.validate(val);
						if(error){
							ServerUtil.msg(error);
							self.isStop = true;
							return false;
						}
					}
				}
				else if(dataVal == 'name' && val == '') {
					ServerUtil.msg(it.util.i18n("VirtualDeviceOn_No_Name_Tip"));
					self.isStop = true;
					return false;
				}
			}else if(extArr.indexOf(dataVal)>-1) {
				extInfo[dataVal] = val;
			}
		});
		if(self.isStop) {
			return;
		}
		extInfo['_table'] = 'virtualDevice_custom';
		baseInfo.dataTypeId = 'virtualDevice';
		baseInfo.customField = extInfo;
		return baseInfo;
	},
	createVmNode: function() {
		var self = this;
		this.show(this.vmOn,function(){
			self.vmOn = false;
			setTimeout(function(){
				var s = self.base;
				var length =  self.virtualDevicesData.length;
				var virtualDeviceNode = self.sceneManager.getNodeByDataOrId(self.virtualDevicesData[length-1]),
					virtualDeviceNode_bb = virtualDeviceNode.getBoundingBox(),
					nodeHeight = virtualDeviceNode_bb.max.y - virtualDeviceNode_bb.min.y,
					yPos = virtualDeviceNode.getPositionY(),
					y =  Number(virtualDeviceNode.getClient('vmOnPos')) || nodeHeight;
				var animate = new twaver.Animate({
					from:y-yPos,
					to:0,
					delay:0,
					dur:1500,
					onUpdate:function(value){
						virtualDeviceNode.setPositionY(y - value);
					},
					onDone: function(){
						self.successLayer();
					}
				});
				animate.play();
			}, 100);
		}); 
		
	},

	appStart: function(data) {
		this.setData(data);
	},
	appEnd: function() {
		this.hide();
	},
	show: function (vmOn,callback) {
		var self = this;
		this.currentDeviceNode = this.vm.getFocusNode();
		this.currentDeviceData = this.sceneManager.getNodeData(this.currentDeviceNode);
		this.virtualDevicesData = [];
		this.virtualDevicesData = this.currentDeviceData._childList._as;//数组
		if(this.virtualDevicesData.length == 0){
			return;
		}
		for(var i=0; i<this.virtualDevicesData.length; i++){
			var data = this.virtualDevicesData[i];
			var id = data._id;
			if(!this.sceneManager.dataNodeMap[id] 
				&& this.sceneManager.isCurrentSceneInstance(data)){ //如果是当前场景中的data，并且没有load过，这里就load一下
				this.sceneManager.loadOneData(data,true, function(){
					self.sceneManager.invisibleFilter.setVisible(data, true);
				});
			}
			self.sceneManager.invisibleFilter.setVisible(data, true);
		
		}
		self.showBase(vmOn);
		setTimeout(function(){
			callback&&callback();
		},100);	
	},
	successLayer: function () {
        var self = this;
        var $isSave = $('<div class="isSave"><p>'+it.util.i18n("VirtualDeviceOn_Vmware_On_Success")+'</p></div>');
        var $div = $('<div class="clearfix"></div>');
        var $cancel = $('<button class="btn-gray">'+it.util.i18n("VirtualDeviceOn_NO")+'</button>');
        var $confirm = $('<button  class="btn-gray">'+it.util.i18n("VirtualDeviceOn_Yes")+'</button>');
		$confirm.appendTo($div);
		$cancel.appendTo($div);
        $div.appendTo($isSave);
        $(document.body).append($isSave);

        var index = layer.open({
            type: 1,
            title: '',
            // shade: true,
            shadeClose: false,
            closeBtn: 0,
            content: $isSave
        });

        $confirm.on('click', function () {
			layer.close(index);
			var $eles = $('#v_deviceonPanel .virtualDeviceOn .labelValue input');
		$eles.each(function(index, ele){
			var val = $(ele).val();
			var dataVal = $(ele).data('value');		
			if(dataVal != '_parentId') {
				$(ele).val('');
			}
		
		});
			self.v_deviceonPanel.dialog('open');
        });
        $cancel.on('click', function () {
            layer.close(index);
        });
    },
	deleteCharacter: function (str) {
        var exg = new RegExp(/[A-Za-z]+\d*[A-Za-z]*/g);
        return str.match(exg).toString();
	},
	validate: function(id){
        var allDatas =this.sceneManager.dataManager._datas;
        for(var i=0; i<allDatas.length; i++){
            if(allDatas[i]._id == id){
                return it.util.i18n("VirtualDeviceOn_DeviceId_Exit");
            }
        }
        return false;
    },
});

it.VirtualDeviceOnManager = $VirtualDeviceOnManager;