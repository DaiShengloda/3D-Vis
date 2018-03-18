
var app = {};
// 可以考虑用localStorage 缓存。

app.getData = function(id,callback){
	var data = {id:id};
	ServerUtil.api('data','get',data,function(result){
		callback && callback(result)
	});
};
app.getDataType = function(dataTypeId,callback){
	var data = {id:dataTypeId};
	ServerUtil.api('datatype','get',data,function(result){
		callback && callback(result)
	});
};

app.getDataTypesByCategory = function(categoryId,callback){
	var data = {categoryId:categoryId};
	ServerUtil.api('datatype','search',data,function(result){
		callback && callback(result)
	});
};

app.getDataCenterTypes = function (callback) {
    app.getDataTypesByCategory('dataCenter',callback);
};

app.parseURLParameters = function(url){
	var regex = /[?&]([^=#]+)=([^&#]*)/g, 
        params = {},
        match;
    url = url || window.location.href;
	while(match = regex.exec(url)) {
	    params[match[1]] = decodeURIComponent(match[2]);
	}

	return params;
};

app.getDataCenter = function(result,callback){
	var arr = [];
    var data = {dataTypeId:{$in:arr}};
    if(result){
    	result.forEach(function(v){
    		arr.push(v.id);
    	});
    }
   ServerUtil.api('data','search',data,function(result2){
   		callback && callback(result2);
   });
};

app.initDataCenterList = function(){
	app.getDataCenterTypes(function(result){
		app.getDataCenter(result,init);
	});
	function init(result2){
		var ul = $("#list");
		if(result2){
			// 
			result2.forEach(function(v){
				var text = v.description ? v.description : v.id;
				$('<li ><a href="./second.html?id='+v.id+'&description='+v.description+'">'+text+'</a></li>').appendTo(ul);
			});
		}
	}
};
app.getBuildings = function(dataCenterId,callback){
	var data = {parentId:dataCenterId};
	ServerUtil.api('data','search',data,function(result){
		callback && callback(result)
	});
};
app.getFloors = function(result,callback){
	if(result){
		var arr = [];
		var data = {parentId:{$in:arr}};
		result.forEach(function(v){
			arr.push(v.id);
		});
		ServerUtil.api('data','search',data,function(result){
			callback && callback(result)
		});
	}
};

app.initFloorList = function(dataCenterId,description){
	app.getBuildings(dataCenterId,function(result){
		app.getFloors(result,init);
	});

	function init(result2){
		var ul = $("#list");
		ul.empty();
		if(result2){
			result2.forEach(function(v){
				var text = v.description ? v.description : v.id;
				$('<li ><a href="./third.html?id='+v.id+'&description='+v.description+'&dc='+description+'">'+text+'</a></li>').prependTo(ul);
			});
		}else{
			ul.innerHTML = "no data";
		}
	};
};

app.getRackTypes = function(callback){
    app.getDataTypesByCategory('rack',callback);
};

app.getAreaTypes = function(callback){
	app.getDataTypesByCategory('room',callback);
};

app.getAreas = function(floorId,callback,dataManager){
	var arr = [];
	var data = {parentId:floorId,dataTypeId:{$in:arr}};
	app.getAreaTypes(function(areaTypes){
		areaTypes.forEach(function(v){
		  arr.push(v.id);
	    });
	    if(dataManager){
	    	dataManager.addDataTypeFromJson(areaTypes);
	    }
	    ServerUtil.api('data','search',data,function(result){
	      if(dataManager){
	    	dataManager.addDataFromJson(result);
	      }
   	      callback && callback(result)
        });
	});
   

};

app.getChannelTypes = function(callback){
	app.getDataTypesByCategory('channel',callback);
};

app.getChannels = function(floorId,areas,callback,dataManager){
	var arr = [];
	var p = [];
	p.push(floorId);
	areas.forEach(function(a){
		p.push(a.id);
	});
	var data = {parentId:{$in:p},dataTypeId:{$in:arr}};
	app.getChannelTypes(function(channelTypes){
		channelTypes.forEach(function(c){
			arr.push(c.id);
		});
		if(dataManager){
			dataManager.addDataTypeFromJson(channelTypes);
		}
		ServerUtil.api('data','search',data,function(result){
			if(dataManager){
			   dataManager.addDataFromJson(result);
			}
   	        callback && callback(result)
        });
	});
    

};

app.getRacks = function(floorId,callback,dataManager){
	var parentIds = [floorId];

	app.getAreas(floorId,function(areas){
		areas.forEach(function(v){
			parentIds.push(v.id);
		});
		app.getChannels(floorId,areas,function(channels){
			channels.forEach(function(v){
			   parentIds.push(v.id);
		    });
		    app.getRackTypes(function(rackTypes){
		    	var rackTypeIds = [];
		    	var data = {parentId:{$in:parentIds},dataTypeId:{$in:rackTypeIds}};
		    	rackTypes.forEach(function(rack){
		    		rackTypeIds.push(rack.id);
		    	});
		    	if(dataManager){
		    		dataManager.addDataTypeFromJson(rackTypes);
		    	}
		    	ServerUtil.api('data','search',data,function(result){
		    		if(dataManager){
		    			dataManager.addDataFromJson(result);
		    		}
		    		callback && callback(result)
		    	});
		    });
		},dataManager);
	},dataManager);
};

app.initRackList = function (floorId){
   app.getRacks(floorId,function(result){
   		if(result){
   			var ul = $("#list");
   			ul.empty();
   			result.forEach(function(r){
   				 var text = r.description || r.id;
   				 var content = '编号:'+r.id+'<br>描述:'+r.description+'</a>'
   				 $('<li><a href="rack.html?id='+r.id+'&description='+text+'&dataTypeId='+r.dataTypeId+'">'+content+'</a></li>').appendTo(ul);
   			});
   		}
   });
};


app.getEquipmentTypes = function(callback){
	app.getDataTypesByCategory('equipment',callback);
};

app.getCategory = function(categoryId,params){
	params = params || {};
	var category = new it.Category(categoryId);
	category.setDescription(params.description || '');
	category.setStopAlarmPropagationable(params.stopAlarmPropagationable || false);
	return category;
};

app.getWindowHeight = function(){
	if (window.innerWidth)
		winWidth = window.innerWidth;
	else if ((document.body) && (document.body.clientWidth))
		winWidth = document.body.clientWidth;
	// 获取窗口高度
	if (window.innerHeight)
		winHeight = window.innerHeight;
	else if ((document.body) && (document.body.clientHeight))
		winHeight = document.body.clientHeight;
	// 通过深入 Document 内部对 body 进行检测，获取窗口大小
	if (document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth)
	{
		winHeight = document.documentElement.clientHeight;
		winWidth = document.documentElement.clientWidth;
	}

	return winHeight;
};

app.getAllCategories = function(callback){
	ServerUtil.api('category','search',{},function(result){
		callback && callback(result)
	});
};

