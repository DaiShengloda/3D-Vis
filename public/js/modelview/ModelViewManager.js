function ModelViewManager() {
	
};

mono.extend(ModelViewManager,Object,{
	setModel:function(model){
		this.model = model;
	},
	setView : function(view){
		this.view = view;
	},
	setController:function(controller){
		this.controller = controller;
	},
	//sceneDatas | category = camera;
      //allDatas | category = camera; 
      //serverDatas | category = camera;
      // sceneAlarms allAlarms
});