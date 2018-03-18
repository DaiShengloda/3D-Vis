Number.isNaN = Number.isNaN || window.isNaN;
var main = {};
var mainDiv = document.getElementById('main'),params;
onLoad();
function onLoad(){
	make.Default.path = "./modellib/";
    params = app.parseURLParameters();
	initHTML();
	initNetwork();
	initAllCategories();
	initPropertyManager();
	loadFloor(params.id);
};

function initHTML(){
	mainDiv.removeChild(document.getElementById('waiting'));
    var title = document.getElementsByTagName('title');
    title[0].innerHTML = params.description || title[0].innerHTML;
};

function initNetwork(){
	var dataManager = main.dataManager = new it.DataManager();
    var sceneManager =main.sceneManager = new it.SceneManager(dataManager);
    var network = sceneManager.network3d;
    var box = network.getDataBox();
    var h = app.getWindowHeight();
    mainDiv.style.height = h + 'px';
    var style =  window.getComputedStyle(mainDiv);
    mono.Utils.autoAdjustNetworkBounds(network,document.documentElement,'clientWidth', 'clientHeight', 0, 0);
    mainDiv.appendChild(network.getRootView()); 
};

function initAllCategories(){
	app.getAllCategories(function(categories){
		categories.forEach(function(category){
			main.dataManager.addCategory(app.getCategory(category.id,category));
		});
	});
};

function initPropertyManager(){
	var pm = main.pm = new it.PropertyManager(main.sceneManager);
    pm.setPropertyPaneSize(40,40);
    pm.setDefaultRackRule(['rack']);
    pm.setDefaultEquipmentRule(['equipment']); 
    pm.getOffset = function(node){ // 设置property Dialog的位置
        return  {left:1,bottom:1};
    }
};

function loadFloor(floorId){
	var dm = main.dataManager
	    sm = main.sceneManager;
	    areaIds = [];
    app.getData(floorId,function(floor){
    	var dataTypeId = floor.dataTypeId;
    	app.getDataType(dataTypeId,function(floorType){
            console.log(floorType);
            makeSimpleFloor(floorType);
    		dm.addDataTypeFromJson([floorType]);
    		dm.addDataFromJson([floor]);


    		app.getRacks(floorId,function(result){
    			sm.loadScene();
    		    var node = sm.getNodeByDataOrId(floorId);
                node.p(0,0,0);
    		},dm);
    	});
    });
};

function makeSimpleFloor(floorType){
   var params = floorType.modelParameters;
   for(var i = 0;i < params.length;i ++){
     delete params[i].children;
   }
};





 


   
  
   

    
   

    
    

    


   
     // function callback(){
     //    sceneManager.loadScene();
     // };
     
     // app.getEquipmentTypes(function(equipmentTypes){
     //   dataManager.addDataTypeFromJson(equipmentTypes);
     //   app.getRackTypes(function(rackTypes){
     //      dataManager.addDataTypeFromJson(rackTypes);
     //      ServerUtil.api('data','get',{id:id},function(rack){
     //        dataManager.addDataFromJson([rack]);
     //        ServerUtil.api('data','search',{parentId:id},function(equipments){
     //          dataManager.addDataFromJson(equipments);
     //          callback();
     //        });
     //      });
     //   });
     // }); 
     // touch();
     // function touch(){
     //    var viewManager3d = sceneManager.viewManager3d;
     //    var lastTouchTime = null;
     //    network.getRootView().addEventListener('touchstart',function(e) {
     //      if(lastTouchTime == null){
     //         lastTouchTime = new Date().getTime();
     //         return;
     //      }
     //      var diff = new Date().getTime() - lastTouchTime;
     //      if(diff > 500){
     //        lastTouchTime = new Date().getTime();
     //        return;
     //      }else{
     //        lastTouchTime = null;
     //      }
     //      if(event.touches.length > 1){
     //        return;
     //      }
     //      var element = viewManager3d.filterDoubleClickElement(e);
     //      if(element){
     //          viewManager3d.handleDoubleClick(element);
     //           pm.propertyPane.setWidthForPropertyPane('10px');
     //      }else{
     //          var focusNode = viewManager3d.getFocusNode();
     //          viewManager3d.handleDoubleClickBackground();
     //          var data = sceneManager.getNodeData(focusNode);
     //          var category = dataManager.getCategoryForData(data);
     //          if(category && category.getId() === 'rack'){
     //            viewManager3d.setFocusNode(null);
     //            pm.propertyPane.hide
     //          }
     //      }      
     //   });
     // };

