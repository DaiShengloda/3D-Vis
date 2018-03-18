Number.isNaN = Number.isNaN || window.isNaN;
var main = {};
var mainDiv = document.getElementById('main'),params;
onLoad();
function onLoad(){
	make.Default.path = "./modellib/";
	initHTML();
	initNetwork();
	initAllCategories();
	initPropertyManager();
	loadFloor('b01');
};

function initHTML(){
	params = app.parseURLParameters();
	mainDiv.removeChild(document.getElementById('waiting'));
    var title = document.getElementsByTagName('title');
    title[0].innerHTML = params.description;
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
    		dm.addDataTypeFromJson([floorType]);
    		dm.addDataFromJson([floor]);


    		app.getRackTypes(floorId,function(result){
    			sm.loadScene();
    		    var node = sm.getNodeByDataOrId(floorId);
    		    sm.viewManager3d.getDefaultEventHandler().lookAt(node);
    		},dm);
    	});
    });
};

