var HeatMapEditor = {};
var box = null;
HeatMapEditor.findShapeNode = function(node){
    if(!node || !node.getChildren){
        return null;
    }
    var result = null;
    var children = node.getChildren();
    children.forEach(function(child){
        if(child instanceof mono.ShapeNode){
            result = child;
        }
        return false;
    });
    return result;
};
HeatMapEditor.createSaveDialogContent = function() {
};

HeatMapEditor.createHeatMapDialogContent = function(){
    var formClass = 'form-horizontal';
    var form = $('<form class="'+formClass+'"></form>').appendTo($('body'));
    form.css('display','none');
    form.css('padding','20px');
    // var contentDiv = $('<div></div>').appendTo(form);
    var contentDiv = form;
    var label = $('<label>'+it.util.i18n("Admin_HeatMapEditor_floor_ID")+':</label>').appendTo(contentDiv);
    var textParentId = util.createText().appendTo(contentDiv);
    var label = $('<label style = "color:red">'+ it.util.i18n("Admin_HeatMapEditor_ID")+'*:</label>').appendTo(contentDiv);
    var textId = util.createText().appendTo(contentDiv);
    var label = $('<label>'+it.util.i18n("Admin_HeatMapEditor_Width")+':</label>').appendTo(contentDiv);
    var textWidth = util.createText().appendTo(contentDiv);
    var label = $('<label>'+it.util.i18n("Admin_HeatMapEditor_Depth")+':</label>').appendTo(contentDiv);
    var textHeight = util.createText().appendTo(contentDiv);
    var label = $('<label>'+it.util.i18n("Admin_HeatMapEditor_Position")+':</label>').appendTo(contentDiv);
    var textPos = util.createText().appendTo(contentDiv);
    var label = $('<label style = "color:red">'+it.util.i18n("Admin_HeatMapEditor_Name")+':</label>').appendTo(contentDiv);
    var textName = util.createText().appendTo(contentDiv);
    form.textParentId = textParentId;
    form.textId = textId;
    form.textWidth = textWidth;
    form.textHeight = textHeight;
    form.textName = textName;
    form.textPos = textPos;

    form.getData = function(){
        return {
            parentDataId : textParentId.val(),
            id : textId.val(),
            width:textWidth.val(),
            height:textHeight.val(),
            description:textName.val(),
            position:textPos.val()
        };
    };
    return form;
};

HeatMapEditor.createHeatMapCollectorsDialogContent = function(data){
    data = data || {};
    var pos = data.pos = data.pos || {x : 0,y : 0,z : 0}
    var formClass = 'form-horizontal';
    var form = $('<form class="'+formClass+'"></form>').appendTo($('body'));
    form.css('display','none');
    form.css('padding','20px');
    var contentDiv = form;
    var label = $('<label>'+it.util.i18n("Admin_HeatMapEditor_Temperature_field_ID")+':</label>').appendTo(contentDiv);
    var textParentId = util.createText().appendTo(contentDiv);
    var label = $('<label style = "color:red">'+it.util.i18n("Admin_HeatMapEditor_ID")+'*:</label>').appendTo(contentDiv);
    var textId = util.createText().appendTo(contentDiv);
    var label = $('<label>'+it.util.i18n("Admin_HeatMapEditor_Width")+':</label>').appendTo(contentDiv);
    var textWidth = util.createText().appendTo(contentDiv);
    var label = $('<label>'+it.util.i18n("Admin_HeatMapEditor_Depth")+':</label>').appendTo(contentDiv);
    var textDepth = util.createText().appendTo(contentDiv);
    var label = $('<label>'+it.util.i18n("Admin_HeatMapEditor_Position")+':</label>').appendTo(contentDiv);
    var textPos = util.createText().appendTo(contentDiv);
    var label = $('<label>'+it.util.i18n("Admin_HeatMapEditor_Description")+':</label>').appendTo(contentDiv);
    var textDesc = util.createText().appendTo(contentDiv);
    textParentId.val(data.parentId);
    textWidth.val(data.width || 300);
    textDepth.val(data.depth || 100);
    textPos.val('[' + pos.x + ',' + pos.y + ',' + pos.z + ']');
    form.textParentId = textParentId;
    form.textId = textId;
    form.textWidth = textWidth;
    form.textDepth = textDepth;
    form.textDesc = textDesc;
    form.textPos = textPos;
    form.getData = function(){
        return {
            parentId:textParentId.val(),
            id:textId.val(),
            type:"temperature",
            width:textWidth.val(),
            depth:textDepth.val(),
            description:textDesc.val(),
            position : textPos.val(),
        }
    };
    return form;
};

var getFloorHeight = function (rootNode) {
	var shapeNode = HeatMapEditor.findShapeNode(rootNode) || rootNode;
    var pos = shapeNode.getWorldPosition(),bb = shapeNode.getBoundingBox();
	var y = pos.y + bb.max.y+10;
	return y;
}

var HeatMapEditorMode = function (network,rootNode,collector) {
	//if(network._hasHeatMapEditorMode){// 避免多次调用
	//	return;
	//}

	network.getPointOnPlane = network.getSpacePointOnPlane;
	network._hasHeatMapEditorMode = true;
	var y = getFloorHeight(rootNode);
	var rootView = network.getRootView();
	plane = new mono.math.Plane(new mono.Vec3(0,-1,0),y);
	var firstPoint = null;
	var planeNode = new mono.Plane(1,1);
	 box = network.getDataBox();
     if(collector != null ){
        for(var i in collector){
          box.add(collector[i]);
        }
    }       
    //box.clear();
    box.add(planeNode);
    planeNode.setRotationX(Math.PI/2);
    planeNode.s({
        'm.color':'#90C9D4',
        'm.side':'both',
    });
    var heatMapData = null;
	rootView.addEventListener('dblclick',function (event) {
		network._heatMapEditorModel = !network._heatMapEditorModel;
		var point = network.getPointOnPlane(event,plane);
		if(network._heatMapEditorModel){
			firstPoint = point;
            heatMap2d = null;
            planeNode.s({
                'm.texture.image':null,
            });
		}else{
            var ax = Math.abs(point.x - firstPoint.x),az = Math.abs(point.z - firstPoint.z);
            planeNode.setWidth(ax);
            planeNode.setHeight(az);
            var pos = new mono.Vec3().lerpVectors(firstPoint,point,0.5);
            pos.y = y;
            planeNode.p(pos);
            heatMap2d = new it.HeatMap({
                width:ax,
                height:az,
            });
            var form = HeatMapEditor.createHeatMapDialogContent();
            var rootId = rootNode.getClient('it_data_id');
            form.textParentId.val(rootId);
            form.textWidth.val(ax);
            form.textHeight.val(az);
            form.textPos.val('[' + pos.x + ',' + pos.z + ',' + pos.y + ']');
            var url = 'temperature_field/add';
            layer.open({
                shade:0,
                type: 1,
                title: it.util.i18n("Admin_HeatMapEditor_Save_temperature_field"),
                skin: 'layui-layer-rim', //加上边框
                area: ['500px', '400px'], //宽高
                offset:['200px','400px'],
                content: form,
                btn: [it.util.i18n("Admin_HeatMapEditor_Save"),it.util.i18n("Admin_HeatMapEditor_Cancel")],
                yes: function(index, layero){
                    var data = form.getData();
                    if(data.id == null || data.id.trim() == ''){
                        layer.open({
                            title:it.util.i18n("Admin_HeatMapEditor_Error"),
                            content:it.util.i18n("Admin_HeatMapEditor_Input_ID"),
                        });
                        return false;
                    }
                    heatMapData = data;
                    layer.close(index);
                },
                btn2 : function(index,layero){
                    heatMap2d = null;
                    planeNode.setWidth(0.1);
                    planeNode.setHeight(0.1);
                    planeNode.s({
                       'm.texture.image':null,
                    });
                    layer.close(index);
                }, 
            });
		}
	});
    
    var heatMap2d,collectors = [],collectorUrl = it.util.wrapUrl('/collector/add');
    rootView.addEventListener('click',function(event){
        if(!network._heatMapEditorModel && heatMap2d){
            var filterFunction = function(object3d){
                 return object3d == planeNode;
            }
            var element = network.getFirstElementByMouseEvent(event,false,filterFunction);
            if(!element){
                return;
            }
            if(element.element == planeNode){
                console.log(element.point);
                var pos = rootNode.p();
                var p = element.point;
                var x = p.x - pos.x ,
                    z = p.z - pos.z ;

                var form = HeatMapEditor.createHeatMapCollectorsDialogContent({width:300,depth:100,parentId:heatMapData.id,pos: {x:x,y:0,z:z}});
                layer.open({
                    title:it.util.i18n("Admin_HeatMapEditor_Add_collector"),
                    content:form,
                    skin: 'layui-layer-rim', //加上边框
                    area: ['500px', '400px'], //宽高
                    btn:[it.util.i18n("Admin_HeatMapEditor_Save"),it.util.i18n("Admin_HeatMapEditor_Cancel")],
                    yes : function(index,layero){
                        var data = form.getData();
                        if(data.id == null || data.id.trim() == ''){
                            layer.open({
                                title:"",
                                content:it.util.i18n("Admin_HeatMapEditor_Input_ID"),
                            });
                            return false;
                        }
                        collectors.push(data);
                        heatMap2d.addPointWithArea({
                            w:300,
                            l:100,
                            value:0.5 + Math.random() / 2,
                            x:x,
                            y:z,
                        });
                        var canvas = heatMap2d.getCanvas();
                        planeNode.s({
                            'm.texture.image':canvas,
                        });
                        planeNode.invalidateTexture();

                        var sphere = new mono.Sphere(50);
                        box.add(sphere);
                        sphere.setClient('sensor',true);
                        sphere.setParent(rootNode);
                        sphere.p(p);
                        layer.close(index);
                    },
                    btn2 : function(index,layero){
                        layer.close(index);
                    },
                });
            }
        }
    });

	rootView.addEventListener('mousemove',function (event) {
		if(network._heatMapEditorModel){
			var point = network.getPointOnPlane(event,plane);
			var ax = Math.abs(point.x - firstPoint.x),az = Math.abs(point.z - firstPoint.z);
			planeNode.setWidth(ax);
			planeNode.setHeight(az);
            var pos = new mono.Vec3().lerpVectors(firstPoint,point,0.5);
            pos.y = 50;
            planeNode.p(pos);
		}
	});
   
   return function(){
      return {
        heatMapData:heatMapData,
        collectors:collectors,
      }
   };
};

function createHeatMapEditorPage(){
	 var rootView = $('<div class = "panel panel-default"><div class="panel-heading"></div><div class="panel-body"></div></div>');
	 var rootBody = rootView.find('.panel-body');
	 var dataManager = new it.DataManager();
	 var sceneManager = new it.SceneManager(dataManager);
	 var rootId = null;
  	 var data = {};
     var areaTypes = [];
     it.util.adminApi('datatype','find',data,function(result){
         var datatypes = result;
         if(datatypes){
        		datatypes.map(function(datatype){
        			datatype.categoryId = datatype.category = '';
        			if(datatype.model && datatype.model.startsWith('twaver.idc.area')){
        				areaTypes.push(datatype.id);
        			}
        		});
         	  dataManager.addDataTypeFromJson(datatypes);
        	}
       }
  	 );
     var topPanel = rootView.find('.panel-heading');
     
     var prop = {params : {valueField:'id',url : it.util.wrapUrl('data/getFloorData'),filter : function(result){
     		return result;
     }}};
      var label = $('<label>'+it.util.i18n("Admin_HeatMapEditor_Select_floor")+'</label>').appendTo(topPanel);
     var combobox = util.createSelect(prop);
     combobox.css('display','inline').css('width','150px');
     combobox.on('change',function(){

     });
     combobox.appendTo(topPanel);
     var loadButton = $('<button type="button" class="btn btn-default">'+it.util.i18n("Admin_HeatMapEditor_Load_floor")+'</button>').appendTo(topPanel);
     var label = $('<label>'+it.util.i18n("Admin_HeatMapEditor_Add_collector_tip")+'</label>').appendTo(topPanel);
     label.css('color','red');
     var saveButton = $('<button type="button" class="btn btn-default">'+it.util.i18n("Admin_HeatMapEditor_Save")+'</button>').appendTo(topPanel);
     saveButton.css('right','20px').css('position','absolute');
     loadButton.click(function(){
        var id = combobox.val();
        rootId = id;
        loadFloor(id);
     });
     saveButton.click(function(){
        var saveData = getDataFunction();
        if(saveData.heatMapData == null){
            return;
        }
        if(saveData.collectors.length == 0){
            return;
        }
        it.util.adminApi('temperature_field','add',saveData.heatMapData,function(){
            it.util.adminApi('collector','batchAdd',saveData.collectors,function(){
                layer.open({
                            title:it.util.i18n("Admin_HeatMapEditor_Add_success"),
                            content:it.util.i18n("Admin_HeatMapEditor_Add_success"),
                        });
            },null,'application/json; charset=UTF-8'
            );
        },null,'application/json; charset=UTF-8');
       
     });
     make.Default.path = '../modellib/'
     function loadFloor (id) {
         if(box != null){
             box.clear();
         }
     	var url = it.util.wrapUrl("data/find");
     	var data = {where : {$or: [{id: id}, {parentId: id}]}};
         it.util.adminApi('data','find',data,function(data){
            var collArr = [];
            var collector = null;
            for(var j in base64List){
                if(id == base64List[j].parentId){
                var category = base64List[j].category;
                category.forEach(function(val,index){
                    var position = [];
                    var positionArr = category[index].position.substring(1,category[index].position.length-1).split(",");
                    for(var i in positionArr){
                    position.push(parseFloat(positionArr[i]));
                    var collectorJson = {
                      "id":'twaver.cube',
                      "width":100,
                      "height":100,
                      "position":position,
                      'style': {
                      'top.m.texture.image': category[index].base64,
                       }
                     }
                   }
                     collArr.push(collectorJson);
                     collector = make.Default.load(collArr); 
                });
            } 
        }
             loadFloorData(data,collector); 
        },
         null,'application/json; charset=UTF-8');
     }
     var getDataFunction = null;
     function setOrthoCamera(){
            var camera = new mono.OrthoCamera(3,1,5,10000);
            sceneManager.network3d.setCamera(camera,true);
     }

     function loadFloorData (datas,collector) {
     	if(!datas || !datas.length){
     		return;
     	}
     	var areaDatas = [];
     	datas.map(function(data){
     		if(areaTypes.indexOf(data.dataTypeId) != -1){
     			areaDatas.push(data.id);
     		}
     	});
     	if(areaDatas.length){ 
     		var url = it.util.wrapUrl("data/find");
     	    var data = {where :{parentId:{$in:areaDatas}}};
             it.util.adminApi('data','find',data,function(result){
                 datas = datas.concat(result);
		        	dataManager.fromJson({datas : datas});
                    preLoadModel(function(){
                        sceneManager.loadScene();
                        setOrthoCamera();
                        var rootNode = sceneManager.getNodeByDataOrId(rootId);
                        if(rootNode){
                            rootNode._originalPos = rootNode.p();
                            rootNode.p(0,0,0)
                            var shapeNode = HeatMapEditor.findShapeNode(rootNode) || rootNode;
                            var pos = shapeNode.getWorldPosition(),bb = shapeNode.getBoundingBox();
                            var y = pos.y + bb.max.y;
                            if(y > 0){
                                plane = new mono.math.Plane(new mono.Vec3(0, 1, 0),y);
                            }else{
                                plane = new mono.math.Plane(new mono.Vec3(0,-1,0),y);
                            }
                            pathNode.setY(y + 10);
                            getDataFunction = HeatMapEditorMode(network,rootNode,collector);
                        }
                    })

             },null,'application/json; charset=UTF-8');
     	}else{
     		dataManager.fromJson({datas : datas});
                        preLoadModel(function(){
                            sceneManager.loadScene();
                            setOrthoCamera();
                            var rootNode = sceneManager.getNodeByDataOrId(rootId);
                            if(rootNode){
                                rootNode._originalPos = rootNode.p();
                                rootNode.p(0,0,0)
                                var shapeNode = HeatMapEditor.findShapeNode(rootNode) || rootNode;
                                var pos = shapeNode.getWorldPosition(),bb = shapeNode.getBoundingBox();
                                var y = pos.y + bb.max.y;
                                if(y > 0){
                                    plane = new mono.math.Plane(new mono.Vec3(0, 1, 0),y);
                                }else{
                                    plane = new mono.math.Plane(new mono.Vec3(0,-1,0),y);
                                }
                                pathNode.setY(y + 10);
                                getDataFunction = HeatMapEditorMode(network,rootNode,collector);
                            }
                        })
     	}
     }
     var network = sceneManager.network3d;
     sceneManager.resetCamera = function(){};
     sceneManager.viewManager3d.removeDefaultEventHandler();
     var box = network.getDataBox();
     var camera = network.getCamera();
     camera.p(0.,1844,0.1);
     camera.lookAt(0,0,0);
     var defaultInteraction = new TGL.DefaultInteraction(network);
     defaultInteraction.noRotate = true;
     defaultInteraction.panSpeed = 5;
     network.setInteractions([defaultInteraction]);
     $(network.getRootView()).appendTo(rootBody);
     sceneManager.viewManager3d.addMaterialFilter(new HeatMapEditorMaterialFilter(sceneManager));
     var plane = new mono.math.Plane(new mono.Vec3(0, 1, 0),5);
     var pathNode = new mono.PathNode({
      	radius : 10,
      });
      pathNode.setY(30);
      pathNode.s({
      	'm.color':'cyan',
      	'm.texture.image':'../images/pipeline/flow.jpg',
      	'm.texture.repeat':new mono.Vec2(100,1),
      });
      box.add(pathNode);
      function forceHorizontalVertical(point,lastPoint){
      	var offsetX =  Math.abs(point.x - lastPoint.x),offsetZ = Math.abs(point.z - lastPoint.z);

      	if(offsetX > offsetZ){
      		point.z = lastPoint.z;
      	}else {
      		point.x = lastPoint.x;
      	}
      	return point;
      };
     network.adjustBounds(1000,700);
     rootBody.css('height',700);
     return rootView;
};
var  HeatMapEditorMaterialFilter = function(sceneManager){
   this.materialMap = {};
   this.sceneManager = sceneManager;
   //var virtualManager = main.sceneManager.viewManager3d.getDefaultEventHandler().getDefaultVirtual();
}; 
mono.extend(HeatMapEditorMaterialFilter,it.MaterialFilter,{
    filterMaterial : function(originalMaterial,filterdMaterial,node){
        var map = this.materialMap;
        var sm = this.sceneManager;
        var dm = sm.dataManager;
        var data = sm.getNodeData(node);
        if(data){
            var datatype = dm.getDataTypeForData(data);
            if(datatype.getModel().indexOf('.combo') == -1 && datatype.getModel().indexOf('.area') == -1){
                var code = originalMaterial.getUniqueCode();
                var m = map[code];
                if(!m){
                    m = originalMaterial.clone();
                    m.transparent = true;
                    m.opacity = 0.6;
                    map[code] = m;
                }
                return m;
            }
        }
        return originalMaterial;
    },
});

function preLoadModel(callback){
    it.util.adminApi('data','getDataTypeWithData',{}, function(templateDatas){
        if(templateDatas && templateDatas.length > 0){

            var array = [];
            for(var i = 0; i < templateDatas.length; i++){
                var dataType = templateDatas[i];
                var model = dataType.model;
                var simpleModel = dataType.simple_model;
                if(model && make.Default.isAsync(model)){
                    array.push(model);
                }
                if(simpleModel && make.Default.isAsync(simpleModel)){
                    array.push(simpleModel);
                }
            }
            var curr = 0;
            array.forEach(function(model){
                make.Default.load(model, function(){
                    curr++;
                    if(curr == array.length){
                        callback && callback();
                    }
                });
            })
        }else{
            callback && callback();
        }
    });
}
