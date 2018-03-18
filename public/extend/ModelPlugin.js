it.ModelPlugin = function(models){
	if(!models || !models.length)return;
	for(var i = 0; i<models.length; i++){
		var model = models[i];
		model.path = make.modelPath || '';//其他地方要用的话，可能没有定义 dataJson，造成这里报错。
		try{
			if(model.frontData && typeof(model.frontData) === 'string'){
				model.frontData = JSON.parse(model.frontData);
			}
			if(model.backData && typeof(model.backData) === 'string'){
				model.backData = JSON.parse(model.backData);
			}
			if(model.modelType === 'equipmentModel' && model.id.indexOf('twaver.idc.equipment')<0){
				// model.id += '.device';
			}
			make.Default.registerModel(model);
		} catch (e){
			console.log(model);
		}
		
	}
}