var WaterLeakEditor = {};
WaterLeakEditor.createSaveDialogContent = function() {
 	var formClass = 'form-horizontal';
	var form = $('<form class="'+formClass+'"></form>').appendTo($('body'));
  form.css('display','none');
	form.css('padding','20px');
 	var contentDiv = $('<div></div>').appendTo(form);
 	var label = $('<label>'+it.util.i18n("Admin_WaterLeakEditor_Building_ID")+':</label>').appendTo(contentDiv);
 	var textParentId = util.createText().appendTo(contentDiv);
 	var label = $('<label>'+it.util.i18n("Admin_WaterLeakEditor_Path")+':</label>').appendTo(contentDiv);
 	var textPath = util.createTextArea().appendTo(contentDiv);
 	var label = $('<label>'+it.util.i18n("Admin_WaterLeakEditor_ID")+':</label>').appendTo(contentDiv);
 	var textWaterLeakWireId = util.createText().appendTo(contentDiv);
 	var label = $('<label>'+it.util.i18n("Admin_WaterLeakEditor_Name")+':</label>').appendTo(contentDiv);
 	var textWaterLeakWireName = util.createText().appendTo(contentDiv);

 	form.textPath = textPath;
 	form.textParentId = textParentId;
 	form.textWaterLeakWireId = textWaterLeakWireId;
 	form.textWaterLeakWireName = textWaterLeakWireName;

 	return form;
}
WaterLeakEditor.getPointsJson = function(points){
   var json = [];
   points.forEach(function(point){
   	 // json += point.x.toFixed(2) + ',' + point.z.toFixed(2);
   	 json.push(parseFloat(point.x.toFixed(2)),parseFloat(point.z.toFixed(2)));
   });
   return json;

};
WaterLeakEditor.findShapeNode = function(node){
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
function createWaterLeakWirePage(){

	 var rootView = $('<div class = "panel panel-default"><div class="panel-heading"></div><div class="panel-body"></div></div>');
	 var rootBody = rootView.find('.panel-body');
	 
	 var dataManager = new it.DataManager();
	 var sceneManager = new it.SceneManager(dataManager);


	 var rootId = null;

  	 var url = pageConfig.urlPrex+"/api/datatype/find";
  	 var data = {};
     var areaTypes = [];
  	 $.ajax({
         type: "post",
         contentType: 'application/json; charset=UTF-8',
         url: url,
         data: JSON.stringify(data),
         success: function (result) {
         	var datatypes = result.value;
        	if(datatypes){
        		datatypes.map(function(datatype){
        			datatype.categoryId = datatype.category = '';
        			if(datatype.model && datatype.model.startsWith('twaver.idc.area')){
        				areaTypes.push(datatype.id);
        			}
        		});
         	  dataManager.addDataTypeFromJson(datatypes);
        	}
         }}
  	 );
     
     var topPanel = rootView.find('.panel-heading');
     
     var prop = {params : {valueField:'id',url : it.util.wrapUrl('data/getFloorData'),filter : function(result){
     		return result;
     }}};
      var label = $('<label>'+it.util.i18n("Admin_WaterLeakEditor_Select_floor")+'</label>').appendTo(topPanel);
     var combobox = util.createSelect(prop);
     combobox.css('display','inline').css('width','150px');
     combobox.on('change',function(){

     });
     combobox.appendTo(topPanel);

     var loadButton = $('<button type="button" class="btn btn-default">'+it.util.i18n("Admin_WaterLeakEditor_Load_floor")+'</button>').appendTo(topPanel);
     var label = $('<label>'+it.util.i18n("Admin_WaterLeakEditor_Edit_tip")+'</label>').appendTo(topPanel);
     label.css('color','red');
     var saveButton = $('<button type="button" class="btn btn-default">'+it.util.i18n("Admin_WaterLeakEditor_Save")+'</button>').appendTo(topPanel);
     saveButton.css('right','20px').css('position','absolute');
     loadButton.click(function(){
        var id = combobox.val();
        rootId = id;
        loadFloor(id);
     });

     var form = WaterLeakEditor.createSaveDialogContent();
     saveButton.click(function(){
     	if(!rootId || !network._points){
        	layer.open({
			  title: it.util.i18n("Admin_WaterLeakEditor_Error"),
			  content: it.util.i18n("Admin_WaterLeakEditor_No_data")
			}); 
     		return;
     	}
 	    form.textParentId.val(rootId);
        form.textPath.val(JSON.stringify(WaterLeakEditor.getPointsJson(network._points)));
     	layer.open({
	        shade:0,
	        type: 1,
	        title: it.util.i18n("Admin_WaterLeakEditor_Save_leakage"),
	        skin: 'layui-layer-rim', //加上边框
	        area: ['500px', '400px'], //宽高
	        offset:['300px','300px'],
	        content: form,
	        btn: [it.util.i18n("Admin_WaterLeakEditor_Save"),it.util.i18n("Admin_WaterLeakEditor_Cancel")],
		    btn1: function(index, layero){
		        var id = form.textWaterLeakWireId.val();
		        var parentId = form.textParentId.val();
		        var path = form.textPath.val();
                var name = form.textWaterLeakWireName.val();
		        var data = {id : id,parentId:parentId,path:path,name:name};
		        if(!id || id.trim() == ''){
		        	layer.open({
					  title: 'error',
					  content: it.util.i18n("Admin_WaterLeakEditor_Input_ID")
					}); 
					return false;
		        }
		        if(!name || name.trim() == ''){
    	        	layer.open({
    				  title: 'error',
    				  content: it.util.i18n("Admin_WaterLeakEditor_Input_name")
    				}); 
    				return false;
		        }
		        util.adminApi('water_leak_wire','add',data,function(){
    	        	layer.open({
    				  title: it.util.i18n("Admin_WaterLeakEditor_Success"),
    				  content: it.util.i18n("Admin_WaterLeakEditor_Add_success")
    				}); 
		        	layer.close(index);
		        });
		     },
		    btn2 : function(index,layero){
		    	layer.close(index)
		    },
        });
     });

     function loadFloor (id) {
     	var url = pageConfig.urlPrex+"/api/data/find";
     	var data = {where : {$or: [{id: id}, {parentId: id}]}};

     	$.ajax({
	        type: "post",
	        contentType: 'application/json; charset=UTF-8',
	        url: url,
	        data: JSON.stringify(data),
	        success: function (result) {
	        	loadFloorData(result.value);
	        }}
     	);
     }
     make.Default.path = '../modellib/'
     function loadFloorData (datas) {
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
     		var url = pageConfig.urlPrex+"/api/data/find";
     	    var data = {where :{parentId:{$in:areaDatas}}};
	     	$.ajax({
		        type: "post",
		        contentType: 'application/json; charset=UTF-8',
		        url: url,
		        data: JSON.stringify(data),
		        success: function (result) {
		        	datas = datas.concat(result.value);
		        	dataManager.fromJson({datas : datas});
     		        sceneManager.loadScene();

     		        var rootNode = sceneManager.getNodeByDataOrId(rootId);
     		        if(rootNode){
                  rootNode._originalPos = rootNode.p();
     		        	rootNode.p(0,0,0)
     		        	var shapeNode = WaterLeakEditor.findShapeNode(rootNode);
     		        	var pos = shapeNode.getWorldPosition(),bb = shapeNode.getBoundingBox();
     		        	var y = pos.y + bb.max.y;
     		        	if(y > 0){
     		        		plane = new mono.math.Plane(new mono.Vec3(0, 1, 0),y);
     		        	}else{
     		        		plane = new mono.math.Plane(new mono.Vec3(0,-1,0),y);
     		        	}
     		        	pathNode.setY(y + 10)
                  loadWaterLeakWire(rootNode);
     		        }
     		        
		        }}
	     	);
     	}else{
     		dataManager.fromJson({datas : datas});
     		sceneManager.loadScene();
        loadWaterLeakWire();
     	}
      
     	
     }

     function loadWaterLeakWire(rootNode){
        var url = pageConfig.urlPrex+"/api/water_leak_wire/find";
        var data = {where :{parentId:rootId}};
        $.ajax({
            type: "post",
            contentType: 'application/json; charset=UTF-8',
            url: url,
            data: JSON.stringify(data),
            success: function (result) {
                if(result.value){
                  result.value.forEach(function(v){
                     if(v.path && v.path.length){
                        var pathNode = make.Default.load({id:'twaver.idc.watercable', radius:20, data: v.path,color:'orange'});
                        pathNode.setY(30);
                        network.getDataBox().add(pathNode);
                        if(rootNode){
                            pathNode.setParent(rootNode);
                            pathNode.p(rootNode._originalPos.negate());
                            pathNode.setY(rootNode.getWorldPosition().y + 30);
                        }
                     }
                  });
                    var camera = new mono.OrthoCamera(3,1,5,10000);
                    sceneManager.network3d.setCamera(camera,true);
                }
            }
          }
        ); 
     };
     // var camera = new TGL.OrthoCamera(null,null,null,30000);
     var network = sceneManager.network3d;
     network.getPointOnPlane = network.getSpacePointOnPlane;
     sceneManager.resetCamera = function(){};
     sceneManager.viewManager3d.removeDefaultEventHandler();
     // network.setCamera(camera);
     var box = network.getDataBox();
     var camera = network.getCamera();
     camera.p(0.,1844,0.1);
     camera.lookAt(0,0,0);
     
     var defaultInteraction = new TGL.DefaultInteraction(network);
     defaultInteraction.noRotate = true;
     defaultInteraction.panSpeed = 5;
     network.setInteractions([defaultInteraction]);
     $(network.getRootView()).appendTo(rootBody);
     

          var plane = new mono.math.Plane(new mono.Vec3(0, 1, 0),5);
          // var plane2 = new mono.math.Plane(new mono.Vec3(0, 1, 0),10);
          
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

          network.getRootView().addEventListener('mousemove',function(event){
          	if(network._editMode && network._points && network._points.length){
                   var point = network.getPointOnPlane(event,plane);
                   var path = new mono.Path();
                   var points = network._points.slice();
                   if(event.shiftKey){
                   	forceHorizontalVertical(point,points[points.length - 1]);
                   }
                   points.push(point);
                   path.fromPoints(points);
                   if(points.length > 3){
                    path = pathNode.adjustPath(path,10,4);
                   }
                    pathNode.setPath(path);
                    pathNode.setStyle('m.texture.repeat',new mono.Vec2(path.getLength()/50,1));
          	}
          });

	network.getRootView().addEventListener('click',function(event){
             if(network._editMode){
             	  var point = network.getPointOnPlane(event,plane);
             	  var originPoint = point.clone();
                if(originPoint.equals(network._lastOriginalPoint)){
                	  return;
                }
                if(!network._path){
                	network._path = new mono.Path();
                }
                if(!network._points){
                    network._points = [];
                }
                var points = network._points;
                if(event.shiftKey){
                   	forceHorizontalVertical(point,points[points.length - 1]);
                }
                points.push(point);
                var path = new mono.Path();
                path.fromPoints(points);
                if(points.length > 3){
                 path = pathNode.adjustPath(path,10,4);
                }
                pathNode.setPath(path);
                pathNode.setStyle('m.texture.repeat',new mono.Vec2(path.getLength()/50,1));
                network._lastOriginalPoint = originPoint;
             	  network._lastPoint = point;
             }
				});

     network.getRootView().addEventListener('dblclick',function(event){
     	  var rootNode = sceneManager.getNodeByDataOrId(rootId);
     	  console.log(rootNode);
     	  pathNode.setY(rootNode.getWorldPosition().y + 3);
	      network._editMode = !network._editMode;
	      // delete network._path;
	      // delete network._points;

	      if(network._editMode){
	        var point = network.getPointOnPlane(event,plane);
	        network._points = [point];
	        network._path = new mono.Path();
	      }else{
	        
	      }
     });

     network.adjustBounds(1000,700);
     rootBody.css('height',700);
     return rootView;
};