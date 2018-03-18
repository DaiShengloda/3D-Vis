var SmokeSensorManager = it.SmokeSensorManager = function(){

};

SmokeSensorManager.getInstance = function(){
	if(main.SmokeSensorManager == null){
		main.SmokeSensorManager = new SmokeSensorManager();
	}
	return main.SmokeSensorManager;
}

mono.extend(SmokeSensorManager,Object,{
	showSmokeSensorDialog : function(data){
		// var content = document.createElement('p');
		// content.innerHTML = "<p style = "color:red">烟感浓度:<br>" + (Math.random() * 30).toFixed(2)+"%obs/m</p>";
		// main.afterLookAtManager.showDialog(content,"烟感检测",200,100);

		// layer.open({
	 //            shade: 0,
	 //            type: 1,
	 //            title: '烟感检测',
	 //            skin: 'layui-layer-rim', //加上边框
	 //            area: ['460px', '300px'], //宽高
	 //            offset: ['100px', '100px'],
	 //            content: "<p style = "color:red">烟感浓度:<br>" + (Math.random() * 30).toFixed(2)+"%obs/m</p>"
  //       });
	},
});