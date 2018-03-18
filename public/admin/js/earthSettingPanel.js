function EarthSettingPanel(parent){
	this._newDataCache = {};
	this._oldDataCache = {};
	this._earthParams = {};
	this.init(parent);

    this._dcIds = make.Default.getIds(function(params){
    	if(params.sdkCategory === 'datacenter'){
    		return true;
    	}
    });
}

mono.extend(EarthSettingPanel, Object, {
	init: function(parent){
		this.earthScene = new EarthScene();
        // network.setSelectableFunction(function(ele){
        // 	return ele.getClient('isDC');
        // });
        // network.setClearAlpha(true);
        // network.setClearColor('green');
        var $view = $('<div></div>').appendTo(parent).addClass('earthSetting');;
        var $btnPanel = $('<div></div>').appendTo($view).addClass('btnPanel');
		var $networkView = $('<div class="network"></div>').appendTo($view);
		this.parent = $networkView;
        var loadRes = this.earthScene.preload(this.parent[0]);
		this.network = loadRes.network;
		var box = this.network.getDataBox();
		var interaction = this.interaction = loadRes.interaction;
        var self = this;
        var f = function(label, handle){
        	var btn = $('<button type="button" class="btn btn-default">'+label+'</button>').appendTo($btnPanel);
        	if(handle){
        		btn.click(function(event) {
        			handle.call(self, btn);
        		});
        	}
        	return btn;
		}
		// 这两个功能新版本先不做
        // f(it.util.i18n("Admin_earthSettingPanel_Set_earth_and_skybox"), this.settingEarthHandle);
        // var $btnSaveEarth = this.$btnSaveEarth = f(it.util.i18n("Admin_earthSettingPanel_Save_earth_and_skybox"), this.saveEarth).attr('disabled', 'disabled');
        f(it.util.i18n("Admin_earthSettingPanel_Save_data_center"), this.saveDCHandle);
        f(it.util.i18n("Admin_earthSettingPanel_Delete_data_center"), this.deleteDCHandle);
        var btn4 = f(it.util.i18n("Admin_earthSettingPanel_Moving_mode"), function(btn){
        	self._moveModel = !self._moveModel;
        	btn.text(self._moveModel?it.util.i18n("Admin_earthSettingPanel_Rotating_mode"):it.util.i18n("Admin_earthSettingPanel_Moving_mode"));
			interaction.noRotate = self._moveModel;
        });
        btn4.on('mouseenter', function(event) {
        	layer.tips(it.util.i18n("Admin_earthSettingPanel_Moving_tip"), btn4, {tips:[2,'#428BCA'],time: 3000});
        });
        // .on('mouseout', function(event) {
        // 	layer.closeAll('tips');
        // });
        this.loadData();
        var self = this;
        this.network.getRootView().addEventListener('dblclick', function(e){
			var firstClickObject = self.findFirstObjectByMouse(self.network,e);
			if(firstClickObject){
				var element=firstClickObject.element, type = element.getClient('type').toLowerCase();
				if(type === 'earth'){
					var point=firstClickObject.point;
					self.addDCHandle({x:point.x, y:point.y, z:point.z}, self.loadDC);
				} else if(type === 'datacenter'){
					var id = element.getClient('dcId');
					var data = self._newDataCache[id] || self._oldDataCache[id];
					// 现在暂不处理省份的那块
					// var isGroup = data.extend ? JSON.parse(data.extend).isGroup : false;
					self.updateDCHandle(id, data);
				}
			}
		});	
		this.network.getRootView().addEventListener('mousedown', function(e){
			if(!self._moveModel)return;
			self._startMove = true;
			var nodes = box.getSelectionModel().getSelection();
			if(nodes.size()>0 && nodes.get(0).getClient('isDC')){
				self._moveNode = nodes.get(0);
			}
			self.network.getRootView().addEventListener('mousemove', function(e){
				if(!self._startMove || !self._moveNode)return;
				var first = self.findFirstObjectByMouse(self.network,e);
				if(first){
					var earth=first.element;
					if(earth.getClient('type') === 'earth'){
						var point=first.point;
						// console.log(point);
						self._moveNode.setPosition(point.x, point.y, point.z);
						var dataId = self._moveNode.getClient('dcId');
						if(self._oldDataCache[dataId]){
							//修改已有数据的处理方式，在缓存中设置新的position
							var dcData = self._oldDataCache[dataId];
							dcData.newPosition = {x:point.x, y:point.y, z:point.z};
						} else if(self._newDataCache[dataId]){
							var dcData = self._newDataCache[dataId];
							dcData.position = {x:point.x, y:point.y, z:point.z};
						}
						
					}	
				}
			});	
		});
		this.network.getRootView().addEventListener('mouseup', function(e){
			self._startMove = false;
			self._moveNode = undefined;
		});
		var lastDC;
		// this.network.getRootView().addEventListener('mousemove', function(e){
		// 	var first = self.findFirstObjectByMouse(self.network,e);
		// 	if(first){
		// 		var dataCenter=first.element;
		// 		// console.log(dataCenter.getClient('type'));
		// 		if(lastDC && dataCenter !== lastDC && lastDC.getClient('type') === 'datacenter'){
		// 			var showTipFun = lastDC.getClient('showTipFun');
		// 			if(showTipFun){
		// 				clearTimeout(showTipFun);
		// 				lastDC.setClient('showTipFun', undefined);
		// 			}
		// 			if(lastDC.getClient('tooltipShowing')){
		// 				var closeTipTimeout = lastDC.getClient('closeTipTimeout');
		// 				if(closeTipTimeout){
		// 					clearTimeout(closeTipTimeout);
		// 				}
		// 				var closeTipFun = lastDC.getClient('closeTipFun');
		// 				if(closeTipFun){
		// 					closeTipFun();
		// 				}
		// 			}
					
		// 		}
		// 		if(dataCenter === lastDC)return;
		// 		if(dataCenter.getClient('showTipFun') || dataCenter.getClient('tooltipShowing'))return;
				
		// 		if(dataCenter.getClient('type') === 'datacenter'){
		// 			var showTip = function(){
		// 				var dataId = dataCenter.getClient('dcId'), info = {}, dcData;
		// 				if(self._oldDataCache[dataId]){
		// 					dcData = self._oldDataCache[dataId];
		// 				} else if(self._newDataCache[dataId]){
		// 					dcData = self._newDataCache[dataId];
		// 				}
		// 				info.id = dcData.id;
		// 				info.name = dcData.name;
		// 				var panel = util.showInfo(info);
		// 				$view.append(panel);
		// 				var pos = $view.offset();
		// 				panel.css({
		// 					position: 'absolute',
		// 					top: (e.offsetY - pos.top)+'px',
		// 					left: (e.offsetX - pos.left)+'px',
		// 					width: '220px'
		// 				});
		// 				dataCenter.setClient('tooltipShowing', true);
		// 				var closeTipFun = function(){
		// 					panel.remove();
		// 					dataCenter.setClient('tooltipShowing', false);
		// 					dataCenter.setClient('closeTipFun', undefined);
		// 					dataCenter.setClient('closeTipTimeout', undefined);
		// 				};
		// 				var closeTip = setTimeout(closeTipFun, 3000);
		// 				dataCenter.setClient('closeTipFun', closeTipFun);
		// 				dataCenter.setClient('closeTipTimeout', closeTip);
		// 			}
		// 			var showTipTo = setTimeout(function(){
		// 				showTip();
		// 				dataCenter.setClient('showTipFun', undefined);
		// 			}, 1000);
		// 			dataCenter.setClient('showTipFun', showTipTo);
					
		// 		}	
		// 		lastDC = dataCenter;
		// 	}
		// });	
		var os = $view.offset();
		var l = os.left + ($view.width()-200)/2;
		var t = os.top + 300-75;
		layer.confirm(it.util.i18n("Admin_earthSettingPanel_Double_click_to_create_data_center"), {
			btn: [it.util.i18n("Admin_earthSettingPanel_Understand")],
		  	area: ['200px', '150px'],
		  	offset: [t+'px', l+'px']
		});
	},
	findFirstObjectByMouse: function(network, e){
		var self = this;
		var objects = network.getElementsByMouseEvent(e);
		if (objects.length) {
			var firstSphere;
			for(var i=0;i<objects.length;i++){			
				var first = objects[i];
				var object3d = first.element, 
					type = object3d.getClient('type').toLowerCase();

				if(object3d instanceof mono.Billboard){
					if(type === 'datacenter'){
						return first;
					}
				} else if(!firstSphere) {
					if(type === 'earth'){
						firstSphere = first;
					}
				}

			}
			return firstSphere;
		}
		return null;
	},
	loadData: function(){
		var self = this;
		var dcArr = [];
		// 准备数据
		it.util.adminApi('data','getDataByCategory',{id:'dataCenter'},function(datas){
			$.each(datas,function(index,data){
				self._oldDataCache[data.id] = data;
				dcArr.push(data);
			})
			self.earthScene.setData(dcArr);
			self.earthScene.load();
		})
	},
	// saveEarth: function(){
	// 	var params = {options:{}, value:{}}, self = this;
	// 	params.options.categoryId = 'earth';
	// 	var mp = $.extend({}, this._dataType.modelParameters);

	// 	$.each(mp, function(index, val) {
	// 		 $.extend(val, self._earthParams[val.id]);
	// 	});
	// 	params.value.modelParameters = mp;
		
	// 	$.post(pageConfig.urlPrex+'/api/datatype/update', params, function(data, textStatus, xhr) {
	// 		if(!data.error){
	// 			self.$btnSaveEarth.attr('disabled', 'disabled');
	// 			it.util.msg('Save success');
	// 		} else {
	// 			it.util.msg(data.error.message);
	// 		}
			
	// 	});
	// },
	deleteDCHandle: function(){

		var box = this.network.getDataBox();
		var nodes = box.getSelectionModel().getSelection();
		if(nodes.size()<=0){
			it.util.msg(it.util.i18n("Admin_earthSettingPanel_Select_data_center"));
			return;
		}
		var node = nodes.get(0);
		if(!node.getClient('isDC')){
			it.util.msg(it.util.i18n("Admin_earthSettingPanel_Select_data_center"));
			return;
		}
		
		//删除缓存
		var dcId = node.getClient('dcId'), self = this;

		it.util.confirm(it.util.i18n("Admin_earthSettingPanel_Confirm_delete_data_center")+dcId, function(){
			//如果是新加数据
			if(self._newDataCache[dcId]){
				delete self._newDataCache[dcId]
				box.remove(node);
			} else if(self._oldDataCache[dcId]){
				//如果没有孩子，从数据库中删除，否则不能删除
				it.util.adminApi('data','count',{"where": {"parentId":dcId}},function(count){
					if(count>0){
						it.util.msg(it.util.i18n("Admin_earthSettingPanel_Clear_then_delete"));
						return;
					} 
					if(self._oldDataCache[dcId]){
						//从数据库中删除
						it.util.adminApi('data','remove',{"id":dcId},function(data){
							delete self._oldDataCache[dcId]
						});
					} else if(self._newDataCache[dcId]){
						delete self._newDataCache[dcId]
					}
					delete self._oldDataCache[dcId]
					box.remove(node);
				});
			}
		});
	},
	/**
	 * 保存数据中心时，要处理多种情况，1、保存已有data; 2、保存新增的data; 3、保存新增的datatype
	 * 
	 */
	 // 考虑添加isGroup的情况
	saveDCHandle: function(){
		var getExtend = function(val, dest, extend){
			if(!val.extend) return;
			extend = extend || {};
			var ext = JSON.parse(val.extend);
			for(var i in ext){
				if(ext[i]){
					extend[i] = ext[i];
				}
			}
			if(Object.keys(extend).length){
				dest.extend = extend;
			}
		}
		//保存已有data
		var changeData = [];
		$.each(this._oldDataCache, function(index, val) {
			var item;
			if(val.newPosition){
			 	item = {position: val.newPosition};
			}
			if(val.newPosition2d){
			 	item = {position2d: val.newPosition2d};
			}
			if(val.isChange){
				item = item || {name:val.name, description:val.description};
				getExtend(val, item, val.extend);
			}
			item && changeData.push({value: item, options:{id:val.id}});
		});

		var dcs = this._newDataCache, datas = [], dts = [], self = this, existM = {};
		$.each(dcs, function(index, val) {
			var dtId;
			if(!val.isUseDataType && !existM[val.simpleModel]){
				var dt = {};
				//dataType ID 程序生成
				dtId = 'dc'+(new Date()).valueOf();
				dt.id = dtId;
				dt.categoryId = 'dataCenter';
				dt.simpleModel = val.simpleModel;
				existM[val.simpleModel] = dtId;
				dts.push(dt);
			} else if(val.isUseDataType){
				dtId = val.dtRow.id;
			} else if(existM[val.simpleModel]){
				dtId = existM[val.simpleModel];
			}
			var pos = {};
			var pos2d = {};
			var d = {};
			if(val.position){
				for(var i in val.position){
					if(val.position[i]){
						pos[i] = (val.position[i]).toFixed(2);
					}else{
						pos[i] = 0;
					}
				}
			}
			pos2d.x = val.pos2dX ? val.pos2dX : 0;
			pos2d.y = val.pos2dY ? val.pos2dY : 0;
			d.id = val.id;
			d.name = val.name;
			d.description = val.description;
			d.position = pos;
			d.position2d = pos2d;
			d.parentId = val.parentId || 'earth01';
			d.dataTypeId = dtId;
			getExtend(val, d);
			datas.push(d);
		});
		
		
		if(!changeData.length && !datas.length){
			it.util.msg('No Data');
		}
		if(changeData.length){
			//保存成功后,清楚数据
			this.updateDC(changeData, function(){
				$.each(this._oldDataCache, function(index, val) {
					val.position = val.newPosition;
					val.position2d = val.newPosition2d;
					delete val.newPosition;
					delete val.newPosition2d;
				});
			});
		}
		if(datas.length){
			if(dts.length){
				this.saveDCtoDT(dts);
			}
			//保存成功后, 将_newDataCache中的数据放到_oldDataCache中
			this.saveDCtoData(datas, function(){
				$.each(datas, function(index, val) {
					var newData = self._newDataCache[val.id];
					val.simpleModel = newData.simpleModel;
					self._oldDataCache[val.id] = val;
				});
				self._newDataCache = {};
			});
		}
	},
	updateDC: function(params, callback){
		var self = this;
		it.util.adminApi('data','batchUpdate',params,function(data){
			it.util.msg(it.util.i18n("Admin_earthSettingPanel_Asset_save_success"));
			if(callback){
				callback.call(self);
			}
		});
	},
	/**
	 * 数据中心入库
	 */
	saveDCtoData: function(params, callback){
		var self = this;
		it.util.adminApi('data','batchAddOrUpdate',params,function(data){
			it.util.msg(it.util.i18n("Admin_earthSettingPanel_Asset_save_success"));
			if(callback){
				callback.call(self);
			}
		});
	},
	/**
	 * 数据中心模型入库
	 */
	saveDCtoDT: function(params){
		it.util.adminApi('datatype','batchAddOrUpdate',params,function(data){
			it.util.msg(it.util.i18n("Admin_earthSettingPanel_Asset_model_save_success"));
		});
	},
	//设置地球模型信息
	// settingEarthHandle: function(){
	// 	var form = this.getEarthForm(), self = this;

	// 	var modal = util.modal('Save Earth', form, true, true, function () {
	// 		var params = util.getFormData(form);
	// 		if(!params.title 
	// 			&& !params.titleFont 
	// 			&& !params.titleColor 
	// 			&& !params.titleHeight 
	// 			&& !params.skyboxImage 
	// 			&& !params.sunImage 
	// 			&& !params.earthImage){
	// 			return;
	// 		}
	// 		var reloadTitle = false, earthNode;
	// 		$.each(self._nodes, function(index, val) {
	// 			var cache = self._earthParams[index] || (self._earthParams[index] = {});
	// 			//如果是skybox对象
	// 			if(self._sbIds.indexOf(index)>-1){
	// 				if(params.skyboxImage){
	// 					val.setStyle('m.texture.image', params.skyboxImage);
	// 					cache.image = params.skyboxImage;
	// 				}
	// 				if(params.sunImage){
	// 					var sunNode = val.getChildren().get(0);
	// 					sunNode.setStyle('m.texture.image', params.sunImage);
	// 					cache.sunImage = params.sunImage;
	// 				}
	// 			}
	// 			//如果是地球对象
	// 			if(self._eIds.indexOf(index)>-1){
	// 				if(params.earthImage){
	// 					val.setStyle('m.texture.image', params.earthImage);
	// 					cache.image = params.earthImage;
	// 				} 
	// 				if(params.title){
	// 					reloadTitle = true;
	// 					earthNode = val;
	// 					params.title = params.title.replace('\\n','\n');
	// 					cache.title = params.title;
	// 				}
	// 				if(params.titleFont){
	// 					cache.font = params.titleFont;
	// 				}
	// 				if(params.titleColor){
	// 					cache.color = params.titleColor;
	// 				}
	// 				if(params.titleHeight){
	// 					params.titleHeight = parseInt(params.titleHeight);
	// 					cache.titleHeight = params.titleHeight;
	// 				}
	// 			}
				
	// 		});
	// 		if(reloadTitle){
	// 			var children = earthNode.getChildren()._as, earthTitle;
	// 			var n = children.length;
	// 			for (var i = 0; i < n; i++) {
	// 			    var e = children[i];
	// 			    if('earthTitle' === e.getClient('type')){
	// 					earthTitle = e;
	// 					break;
	// 				}
	// 			}
	// 			if(earthTitle){
	// 				self._box.remove(earthTitle);
	// 			}
	// 			var p = {
	// 	            background:false, 
	// 	            color: params.titleColor || 'white',
	// 	            font: params.titleFont || '40px Dialog'
	// 	        }
	// 	        var titleHeight = params.titleHeight || 200;
	// 	        var earthTitle= mono.Utils.createTextBillboard(params.title, p);
	// 			var scale = earthTitle.getScale();
	// 			earthTitle.setScale(scale.x*3, scale.y*3, 1);
	// 			earthTitle.setPositionY(earthNode.getRadius()+200);
	// 			earthTitle.setParent(earthNode);
	// 			earthTitle.setClient('type','earthTitle');
	// 			self._box.add(earthTitle);
	// 		}
			
	// 		//缓存
	// 		self._formValue = params;

	// 		self.$btnSaveEarth.attr('disabled', false);
	// 	});
	// },
	getEarthForm: function(){
		var props = [], util = it.util, fv = this._formValue || {};
		props.push({label: it.util.i18n("Admin_earthSettingPanel_Title"), id: 'title', value:fv.title});
		props.push({label: it.util.i18n("Admin_earthSettingPanel_Title_font"), id: 'titleFont', value:fv.titleFont});
		props.push({label: it.util.i18n("Admin_earthSettingPanel_Title_color"), id: 'titleColor', value:fv.titleColor});
		props.push({label: it.util.i18n("Admin_earthSettingPanel_Title_height"), id: 'titleHeight', value:fv.titleHeight});
	    props.push({label: it.util.i18n("Admin_earthSettingPanel_Skybox_image"), id: 'skyboxImage', value:fv.skyboxImage});
	    props.push({label: it.util.i18n("Admin_earthSettingPanel_Sun_image"), id: 'sunImage', value:fv.sunImage});
	    props.push({label: it.util.i18n("Admin_earthSettingPanel_Earth_image"), id: 'earthImage', value:fv.earthImage});
	    var form = util.createForm(props);
	    return form;
	},
	//新增一个数据中心
	addDCHandle: function(position, callback){
		var form = this.getDCForm(), self = this;
		var modal = util.modal('Data Center', form, true, true, function () {
			var bv = $(form).data('bootstrapValidator');
            bv.validate();
            if (!bv.isValid())return true;

			var params = util.getFormData(form);
			if(!params.dataType && !params.model){
				it.util.msg('dataType or model ');
				return true;
			}
			params.position = position;
			
			if(params.isUseDataType){
				var $ele = $('#dataType', form);
		    	var row = $ele.bootstrapPicker('getRow');
		    	params.dtRow = row;
		    	params.simpleModel = row.simpleModel;
		    	params.modelParameters = row.modelParameters
			} else {
				params.simpleModel = params.model;
			}
			// self.loadDC(params);
			callback.call(self, params, position);
			self._newDataCache[params.id] = params;
		});
		$('#model', form).parent().parent().css('display', 'none');
		$('#subMap', form).parent().parent().css('display', 'none');
	},
	//更新一个数据中心
	updateDCHandle: function(id, vals){
		//vals = this._newDataCache[id] || this._oldDataCache[id], 
		var isNew = this._newDataCache[id];
		// var extend = vals.extend?JSON.parse(vals.extend):undefined;
		// if(extend){
		// 	vals.showTotalInfo = extend.showTotalInfo;
		// }
		var form = this.getDCUpdateForm(vals), self = this;
		var modal = util.modal('Data Center', form, true, true, function () {
			var bv = $(form).data('bootstrapValidator');
            bv.validate();
            if (!bv.isValid())return true;

			var params = util.getFormData(form);
			if(isNew){
				$.extend(vals, params);
				self._newDataCache[vals.id] = vals;
			} else {
				var isChange = false;
				$.each(params, function(index, val) {
					 if(vals[index] !== val){
					 	isChange = true;
					 	return false;
					 }
				});
				if(isChange){
					$.extend(vals, params);
					vals.isChange = isChange;
					self._oldDataCache[vals.id] = vals;
				}
			}
		});
		$('#model', form).parent().parent().css('display', 'none');
	},
	loadDC: function(params){
		if(!params.simpleModel){
			it.util.msg(it.util.i18n("Admin_earthSettingPanel_No_simple_Model"));
			return;
		}
		var pos = params.position;
		// var mp = $.extend({}, params.modelParameters);
		// var node = make.Default.load({id:params.simpleModel, data:mp});
		node = make.Default.load({
			"id": 'twaver.scene.datacenter-new',
			// "position":[431.84, 303.67, -63.25]
			"dcId": params.id,
			"position":[pos.x, pos.y, pos.z]
		});
		if(node){
			node.setPosition(pos.x, pos.y, pos.z);
			this.network.getDataBox().addByDescendant(node);
		}
	},
	getDCUpdateForm: function(vals){
		var props = [], util = it.util,pos2d,pos2dX,pos2dY;
		//传递给数据库以及获取数据库的dc的position2d都为对象
		//在地图上双击创建的dc有x、y两个值pos2dX
		//要在这里做下处理
		vals = vals || {};
		if(vals.position2d){
			if(typeof vals.position2d == 'string'){
				pos2d = JSON.parse(vals.position2d);
			}else{
				pos2d = vals.position2d;
			}
			pos2dX = pos2d.x ? pos2d.x : 0;
			pos2dY = pos2d.y ? pos2d.y : 0;
		}else{
			pos2dX = vals.pos2dX;
			pos2dY = vals.pos2dY;
		}
		if(typeof vals.extend == 'object'){
			vals.extend = JSON.stringify(vals.extend);
		}
		props.push({label: 'id', id: 'id', value: vals.id||'', readonly: true});
		props.push({label: 'name', id: 'name', value: vals.name||''});
		props.push({label: it.util.i18n('position2d')+'(x)', id: 'pos2dX', value: pos2dX||0});
		props.push({label: it.util.i18n('position2d')+'(y)', id: 'pos2dY', value: pos2dY||0});
		props.push({label: 'parentId', id: 'parentId' ,value: vals.parentId|| ''});
		props.push({label: 'description', id: 'description', type:'textarea', value: vals.description||''});
		props.push({label: 'extend', id: 'extend', type:'textarea', value: vals.extend||''});
	    // if(!vals.isGroup){
	    // 	props.push({label: it.util.i18n("Admin_earthSettingPanel_Show_statistics_info"), id: 'showTotalInfo', type:'checkbox', value: vals.showTotalInfo||false});
	    // }
	    var form = util.createForm(props);
	    var opt = {
	    	id: {
                trigger: 'id',
                validators: [it.validator.notEmpty('id')]
            },
            name: {
                trigger: 'blur',
                validators: [it.validator.notEmpty('name')]
            }
        };
        util.initValidator(form, opt);
        return form
	},
	getDCForm: function(vals){
		var showFun = function(form, isGroup){
			$('#subMap', form).parent().parent().css('display', isGroup?'block':'none');
			var show = isGroup?'none':'block';
			$('#showTotalInfo', form).parent().parent().parent().parent().css('display', show);
    		// var $isUseDataType = $('#isUseDataType', form);
    		// $isUseDataType.parent().parent().parent().parent().css('display', show);
    		// var isUseDataType = $isUseDataType.is(':checked');
    		// if(isGroup){
    		// 	$('#dataType', form).parent().parent().css('display', show);
    		// 	$('#model', form).parent().parent().css('display', show);
    		// } else {
    		// 	$('#dataType', form).parent().parent().css('display', isUseDataType?'block':'none');
    		// 	$('#model', form).parent().parent().css('display', isUseDataType?'none':'block');
    		// }
		}
		var props = [], util = it.util;
		vals = vals || {};
		props.push({label: 'id', id: 'id'});
		props.push({label: 'name', id: 'name'});
		props.push({label: it.util.i18n('position2d')+'(x)', id: 'pos2dX'});
		props.push({label: it.util.i18n('position2d')+'(y)', id: 'pos2dY'});
		props.push({label: 'parentId', id: 'parentId'});
		props.push({label: 'description', id: 'description', type:'textarea'});
		props.push({label: 'extend', id: 'extend', type:'textarea'});
	    props.push({label: it.util.i18n("Admin_earthSettingPanel_Data_center_set"), id: 'isGroup', type:'checkbox', value: false, event:'change', handle:function(event, form){
	    	var value = $('#isGroup', form).is(':checked');
	    	showFun(form, value);
	    }});
	    props.push({label: it.util.i18n("Admin_earthSettingPanel_Map"), id: 'subMap', type:'select',items:util.provinces});
	    props.push({label: it.util.i18n("Admin_earthSettingPanel_Show_statistics_info"), id: 'showTotalInfo', type:'checkbox', value: true});
	    props.push({label: it.util.i18n("Admin_earthSettingPanel_from_asset_model"), id: 'isUseDataType', type:'checkbox', value: true, event:'change', handle:function(event, form){
	    	var value = $('#isUseDataType', form).is(':checked');
	    	if(value){
	    		$('#dataType', form).parent().parent().css('display', 'block');
	    		$('#model', form).parent().parent().css('display', 'none');
	    	} else {
	    		$('#dataType', form).parent().parent().css('display', 'none');
	    		$('#model', form).parent().parent().css('display', 'block');
	    	}
	    }});
	    
	    var prop = {label: it.util.i18n("Admin_earthSettingPanel_model"), id: 'dataType',type: 'picker'};
	    prop.params = {
        	title: 'datatype',
            target: 'id',
            url: pageConfig.urlPrex+'/api/datatype/searchAndCount',
            param: {categoryId:'dataCenter'},
            columns: dtSetting.refTable['datatype']
        }
	    props.push(prop);
	    
	    prop = {label: 'TWaver Make', id: 'model', type:'select',value:'model'||''};
	    
	    var data = [];
		$.each(this._dcIds, function(index, val) {
		     data.push({'value':val, 'label': util.i18n(val)});
		});
		prop.items = data;
		props.push(prop);
	    // props.push({label: 'image', id: 'image'});
	    var form = util.createForm(props);
	    var opt = {
	    	id: {
                trigger: 'id',
                validators: [it.validator.notEmpty('id')]
            },
            name: {
                trigger: 'blur',
                validators: [it.validator.notEmpty('name')]
            }
        };
        util.initValidator(form, opt);
        return form
	},

	// 当双击集合对象时，调用此方法，进入2D界面添加子数据中心
	popupSubDCs: function(data){
		var self = this, subMap = data.subMap;
		//subMap来自ext扩展或后台双击时的省份数据
		if(data.extend && JSON.parse(data.extend).subMap){
			subMap = JSON.parse(data.extend).subMap;
		}else{
			subMap = data.subMap;
		}
        if(!subMap || (subMap == 'none')){
			return;
		}
        $.getJSON('/resource/json/'+subMap+'.json', function(json, textStatus) {
        	var $subMap = $('#subMap');
        	if (!$subMap.length) {
        	    $subMap = $('<div id="subMap"></div>').appendTo($('body'));
        	}
        	$subMap.empty();
        	var provinceMap = new EarthSettingSubPanel(data, self);
        	layer.open({
        	    shade: 0,
        	    type: 1,
        	    title: data.name || data.description,
        	    zIndex: 1,
        	    // shade: true,
        	    skin: 'layui-layer-rim',
        	    area: ['812px', '555px'],
        	    // offset: ['100px', '100px'],
        	    content: $subMap,
        	    success: function(layero, index){
        	        provinceMap.init(json, $subMap);
        	    }
        	});
        });
        

        
    },
    getChildren: function(id){
    	var children = [];
    	$.each(this._oldDataCache, function(index, data) {
    		 if(data.parentId === id)children.push(data);
    	});
    	$.each(this._newDataCache, function(index, data) {
    		 if(data.parentId === id)children.push(data);
    	});
    	return children;
    },
    setPosition2d: function(dataId, position){
    	var self = this;
    	if(self._oldDataCache[dataId]){
			//修改已有数据的处理方式，在缓存中设置新的position
			var dcData = self._oldDataCache[dataId];
			dcData.newPosition2d = position;
		} else if(self._newDataCache[dataId]){
			var dcData = self._newDataCache[dataId];
			dcData.positio2d = position;
		}
    }
});