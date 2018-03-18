//Billboard标示管理，应该抽象为基于场景的标示管理，更加通用。

var DCLabelManager = it.DCLabelManager = function (sceneManager) {
	// console.time('全部')
	this.sceneManager = sceneManager || main.sceneManager;
	this.billboardMap = {};
	this.billboardVisibleMap = {};
	this.checkboxMap = {};
	this.dcLabes = main.dcLabes || [];
	this._createBillboards();
	this.hideLabel();
	var self = this;
	this.sceneManager.addSceneChangeListener(function(sceneData){
		self.onSceneChange(sceneData);
	});
	// console.timeEnd('全部')
};

mono.extend(DCLabelManager,Object,{
     toggle : function(){
     	   if(this._visibleFlag){
     	   	this.hideLabel();
     	   }else{
     	   	this.showLabel();
     	   }
     },

	showLabel : function(){
           var self = this;
           this.forEach(function(billboard,text,index){
           	    if(self.billboardVisibleMap[text]){
           	    	  billboard.setVisible(true);
           	    }
           });
           this._visibleFlag = true;
	},

	hideLabel : function(){
           this.forEach(function(billboard){
           		billboard.setVisible(false);
           });
           this._visibleFlag = false;
	},

	forEach : function(func,object,args){
		object = object || this.billboardMap;
		args = args || [];	
		 if(object instanceof mono.Billboard){
		 	var newArgs = args.slice(0);
		 	newArgs.unshift(object);
		 	return func.apply(this,newArgs);
		 }
		 for(var property in object){
		 	var billboard = object[property];
		 	var newArgs = args.slice(0);
		 	newArgs.push(property);
		 	if(billboard){
		 	     this.forEach(func,billboard,newArgs);
		 	}
		}
	},

	addToDataBox : function(){
		var box = this.sceneManager.network3d.getDataBox();
		this.forEach(function(billboard){
			box.add(billboard);
		});
	},

	onSceneChange : function(sceneData){
     		var scene = sceneData.data;
     		var box = this.sceneManager.network3d.getDataBox();
     		// console.log(scene);
     		if(scene.getCategoryId().toLowerCase() == 'datacenter'){
     			this.addToDataBox();
     		}else{
     			this.forEach(function(billboard){
     				box.remove(billboard);
     			});
     		}
	},

	_createBillboard : function(options){
		var text = options.text,position = options.position;
		if(text == null || text == ''){
			return;
		}
		if(position == null){
			position = [0,0,0];
		}
		if(mono.Utils.isArray(position)){
			// console.time('计算')
			var str = this._getBillboardDataToString(text);
			// console.timeEnd('计算')
			var textBillboard = new it._TextBillboardWithArrow();
			var billboard = textBillboard.createTextBillboard(text+ str ,'#46606a', { globalAlpha: 0.9})
			billboard.setPosition(new mono.Vec3(position[0],position[1],position[2]));
			billboard.s({
				'm.fixedSize': 4000,
			})
			var scale = billboard.getScale();
			var oScale = options.scale;
			if(oScale && oScale.length >= 2){
				billboard.setScale(scale.x * oScale[0], scale.y * oScale[1],1);
			}
			billboard.visibleCondition = options.visibleCondition
			return billboard;
		}else{
			var billboards = {};
			for(var index in position){
				var billboard = this._createBillboard({text:text,position:position[index]});
				billboards[index] = billboard;
			}	
			return billboards;
		}
	},

	_getBillboardDataToString: function(buildingName) {
		var theObj = this._getBillboardData(buildingName);
		var str = '';
		theObj.forEach(function(ele){
			if(ele.name&&ele.sum!=0){
				str += '\n '+ ele.name + '：' + ele.sum;
			}
		})
		return str;
	},

	_getBuildingIdByName: function(buildingName){
		var thisBuilding;
		var sceneDatas = this.sceneManager.getSceneDatas();
		for(var scene in sceneDatas){
			if(sceneDatas[scene]._name==buildingName){
				thisBuilding = sceneDatas[scene]._id;
			}
		}
		return thisBuilding;
		
	},

	_getBillboardData: function(buildingName){
		var boxes=['room','rack','equipment','airConditioning','camera',];
		var datamanager = this.sceneManager.dataManager;
		var allCatsMap = this.sceneManager.dataManager._categoryMap;
		var allDataTypeMap = this.sceneManager.dataManager._dataTypeMap;
		var allDatas = this.sceneManager.dataManager._datas;
		var thisBuilding;
		// var sceneDatas = this.sceneManager.getSceneDatas();
		// for(var scene in sceneDatas){
		// 	if(sceneDatas[scene]._name==buildingName){
		// 		thisBuilding = sceneDatas[scene]._id;
		// 	}
		// }
		thisBuilding = this._getBuildingIdByName(buildingName);
		var theCategorys = [];
		var allDataType=[];
		for(var i=0;i<boxes.length;i++){
			allDataType=[]
			theCategorys[i]={};
			theCategorys[i].sum=0;
			for(var cat in allCatsMap){
				if(allCatsMap[cat]._id == boxes[i]){
					theCategorys[i].name = allCatsMap[cat]._description;
					for(var datatype in allDataTypeMap){
						if(allDataTypeMap[datatype]._categoryId == boxes[i]){
							allDataType.push(allDataTypeMap[datatype]._id)
						}
					}
					for(var data in allDatas){
						if((allDataType.indexOf(allDatas[data]._dataTypeId)!=-1)&&this._isAncestor(thisBuilding,allDatas[data]._id)){
							theCategorys[i].sum+=1;
						}
					}
				}
			}
		}
		return theCategorys;
	},

	_isAncestor: function(oldId,youngId){
		var datamanager = this.sceneManager.dataManager;
		var middleId;
		var youngNode = datamanager.getDataById(youngId);
		if(youngNode&&youngNode.getParentId()){
			if(youngNode.getParentId()==oldId)  return true;
			else return this._isAncestor(oldId,youngNode.getParentId())
		} else{
			return false;
		}		
	},

	_createBillboards: function(){
		var self = this;
		this.dcLabes.forEach(function(options){
			var text = options.text;
			var billboard = self._createBillboard(options);
			self.billboardMap[text] = billboard;
			self.billboardVisibleMap[text] = true;
			thisBuildingId = self._getBuildingIdByName(text);
			billboard._clientMap.it_data_id = thisBuildingId;
			billboard._clientMap.it_data = main.sceneManager.dataManager.getDataById(thisBuildingId);
			// console.log(billboard);
		});
	},

	config : function(){
		if(!this._configPage){
			var self = this;
			this._configPage = $('<div class = "filter-menu-item-group"></div>').appendTo($('body'));
			
			// var checkAll = self._createCheckBox({
			// 	text:"所有"
			// }).appendTo(self._configPage);

			this._createCheckAll().appendTo(self._configPage);

			this.dcLabes.forEach(function(options){
				if(options.visibleCondition === 'always'){
					return;
				}
				self._createCheckBox(options).appendTo(self._configPage);
			});
		}
		layer.open({
                shade:0,
                type: 1,
                title: it.util.i18n("DCLabelManager_Park_plan"),
                skin: 'layui-layer-rim', //加上边框
                area: ['auto', 'auto'], //宽高
                offset:['200px','200px'],
                content: this._configPage,
            });
	},

	_createCheckAll : function(){
		var text = it.util.i18n("DCLabelManager_Select_all"),lableId = 'lb_cb' + text,checkId = 'cb_menu_checked' + text;
		var label = $('<label id= '+lableId+' class="checkbox-class itv-checkbox-line"><div class="itv-checker"><span class="checked"><input id='+checkId+' type="checkbox" checked=""></span></div>'+text+'</label>');
		var checkbox = label.find("input[type=checkbox]");
		var self = this;
		checkbox.change(function(event){
			checked = checkbox.prop("checked");
			self._checkLabel(label,checked);
			self._checkAll(checked);
		});
		this._checkAllBox = checkbox;
		checkbox._label = label;
		this._signCheckAll();
		return label;
	},

	_checkLabel : function(label,checked){
		var span = label.find('span');
		if(checked){
			span.removeClass('check').addClass('checked');
		}else{
			span.removeClass('checked').addClass('check');
		}
	},

	_createCheckBox : function(options){
		var text = options.text,lableId = 'lb_cb' + text,checkId = 'cb_menu_checked' + text;
		var label = $('<label id= '+lableId+' class="checkbox-class itv-checkbox-line"><div class="itv-checker"><span class="checked"><input id='+checkId+' type="checkbox" checked=""></span></div>'+text+'</label>');
		var checkbox = label.find("input[type=checkbox]");
		var checked = this.billboardVisibleMap[text];
		checkbox.prop("checked", checked ? true:false);
		this._checkLabel(label,checked);
		var self = this;
		checkbox.change(function(event){
			checked = checkbox.prop("checked");
			self.setLabelVisible(text,checked);
			self._checkLabel(label,checked);
		});
		checkbox._label = label;
		this.checkboxMap[text] = checkbox;
		return label;
	},
      
      _signCheckAll : function(){// 查看是否需要更新checkALL状态
      	var allCheck = true,allNotCheck = true;
      	for(var text in this.billboardVisibleMap){
      		if(this.billboardMap[text].visibleCondition != 'always'){
      			if(this.billboardVisibleMap[text] == true){
      				allNotCheck = false;
      			}else{
      				allCheck = false;
      			}
      		}
      	}
      	if(allCheck){
      		this._checkLabel(this._checkAllBox._label,true);
      		this._checkAllBox.prop('checked',true);
      	}else if(allNotCheck){
      		this._checkAllBox.prop('checked',false);
      		this._checkLabel(this._checkAllBox._label,false);
      	}
      },

      _checkAll : function(checked){
      	for(var text in this.billboardVisibleMap){
      		if(this.billboardMap[text].visibleCondition != 'always'){
      		   	this.setLabelVisible(text,checked);
      		}
      	}
      	for(var text in this.checkboxMap){
      		this.checkboxMap[text].prop('checked',checked);
      		this._checkLabel(this.checkboxMap[text]._label,checked);
      	}
      },

	setLabelVisible : function(text,visible){
     	    this.billboardVisibleMap[text] = visible;
     	    if(this._visibleFlag){
     	    	   var map = this.billboardMap[text];
     	    	   this.forEach(function(billboard){
     	    	  	billboard.setVisible(visible);
     	    	  },map);
     	    }

     	    this._signCheckAll();
     },
});

