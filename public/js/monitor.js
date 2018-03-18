
var $Monitor = function(){
	this.connect();
}

mono.extend($Monitor, Object,{
	connect: function(){
		if(!this._inited){
			this._inited = true;
			this._socket = ServerUtil.createSocket();
		}
	},
	on: function(event, callback){
		this._socket.on(event, callback);
	},
	off: function(event){
		this._socket.off(event);
	},
	onAlarm: function(){
		this.on('alarm', function(data){
			// console.log(data);
			// if($.isArray(data)){
			// 	$.each(data, function(index, val) {
			// 		 //将告警添加到alarmManager中   alarmSeverity
			// 		var alarmSeverity = it.Util.getAlarmSeverityByLevel(val.level);
			// 		var alarm = new it.Alarm(val.alarmId, val.deviceId, alarmSeverity, val.description, val.time);
			// 		main.sceneManager.getAlarmManager().add(alarm);
			// 		//html告警通知
			// 	});
			// }
			
			
		});
	},
	onData: function(){
		this.on('data', function(data){
			//html上架通知
			
			var index = layer.alert(it.util.i18n("monitor_Synchronize"), function(){
				layer.close(index);
				var sceneManager = main.sceneManager, dataManager = sceneManager.dataManager;
				var lookAt = dataManager.getDataById(data.parentId);
				main.sceneManager.viewManager3d.getDefaultEventHandler().lookAtByData(lookAt, function(){
					var device = new it.Data(data);
			        device.setLocation(new it.Location({y:data.location,z:'pos_pos'}));
			        //添加到sceneManager中
			        sceneManager.loadDataModel(device);
			        //设置父子关系
			        sceneManager.setParentRelationShip(device);
			        //转换逻辑位置为物理位置
			        sceneManager.translatePosition(device);
			        //添加到dataManager中
					dataManager.addData(device);

					//给设备加上渲染色，并将位置移动机柜前端
			        var deviceNode = sceneManager.getNodeByDataOrId(data.id);
			        var oldAmbient = deviceNode.getStyle('m.ambient');
			        deviceNode.s({
			            'm.ambient': 'green',
			        });
			        sceneManager.viewManager3d.getDefaultVirtualMaterialFilter().removeByDescendant(deviceNode);
			        var bb = deviceNode.getBoundingBoxWithChildren();
			        var d = bb.max.z - bb.min.z;
			        deviceNode.setPositionZ(deviceNode.getPositionZ()+d);
			        
		            //定义动画，让设备插入机柜，并去除渲染色
		            var bb = deviceNode.getBoundingBoxWithChildren();
		            var d = bb.max.z - bb.min.z;
		            var oz = deviceNode.getPositionZ();
		            var animate = new twaver.Animate({
		                from:0,
		                to:d,
		                delay:100,
		                dur:500,
		                onUpdate:function(value){
		                    deviceNode.setPositionZ(oz-value);
		                },
		                onDone: function(){
		                	deviceNode.s({
				                'm.ambient': oldAmbient,
				            });
		                }
		            });
		            animate.play();
				});
				 
				
			});
		});
	},
	init: function(){

	}
});

it.Monitor = new $Monitor();
