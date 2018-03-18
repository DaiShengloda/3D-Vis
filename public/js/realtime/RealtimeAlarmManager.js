

/**
 * 实时告警的对接管理器
 */

RealtimeAlarmManager = function(sceneManager){
	this.sceneManager = sceneManager;
  var self = this;
  //加个timeout，否则会报alarm id repeat的错，因为一启动这个就可能收到新推送过来的告警，这时还没有查询数据库，随后查数据库时可能也能查出新推告警，新来的告警可能已经入库了
  setTimeout(function(){
     self.init();
  },30*1000); 

};

mono.extend(RealtimeAlarmManager,Object,{

	init : function(){
		var socket = ServerUtil.createSocket();
		var self = this;
		// [{"alarmId":"alarm001","alarmType":"temp","level":"1",
        // "description":"温度过高","date":"Sat Oct 08 2016 15:23:28 GMT+0800 (CST)",
        // "status":"create","property":"property","deviceId":"deviceId"}]
        socket.on('alarm', function(alarms){
            // console.log(JSON.stringify(alarms));
            // alert(alarms.length);
            // 处理告警时间错误的问题，要使用json.date-extensions处理
            alarms = JSON.parse(JSON.stringify(alarms));
            var t = new Date().getTime();
            if(alarms && (alarms instanceof Array)){
                for(var i = 0 ; i < alarms.length ; i++){
                    var alarmObj = alarms[i];
                    if(alarmObj._previousDataValues){
                        alarmObj = alarmObj._previousDataValues;
                    }
                    var id = alarmObj.alarmId||alarmObj.id||alarmObj.realId;
                    // var dataId = alarmObj.deviceId;
                    var dataId = alarmObj.dataId;
                    var alarmSeverity = self.getAlarmSeverity(alarmObj.level);
                    var description = alarmObj.description;
                    var dateTime = alarmObj.dateTime || alarmObj.time;
                    var alarmTypeId = alarmObj.alarmType || alarmObj.alarmTypeId;
                    var status = alarmObj.status;
                    //id, dataId, alarmSeverity, description, dateTime
                    var alarm = new ITAlarm(id,dataId,alarmSeverity,description,dateTime);
                    alarm.alarmTypeId = alarmTypeId;
                    alarm.realId = alarmObj.realId;
                    alarm.devIp = alarmObj.devIp;
                    alarm.client = alarmObj.client;
                    // console.log(alarm.client);

                    var alarmManager = self.sceneManager.getAlarmManager();
                    if (!alarmManager.getAlarm(id)) {
//        main.navBarManager.clientAlarmManager.showAlarmTable(); //如果告警表隐藏了，则要显示
                        var fun = main.beforeAddAlarmFunction;
                        if (fun){
                            fun(alarm,function(){
                                alarmManager.add(alarm);
                            })
                        } else {
                            alarmManager.add(alarm);  
                        }
                       
                    }
                }
            }
            main.assetPanelMgr.showWarningsInfo('floor');
            var alarmManagerNow = self.sceneManager.getAlarmManager();
            var allAlarmListNow = alarmManagerNow.getAlarms()._as;
            var pageSize = main.navBarManager.appManager.clientAlarmManager.alarmTable.pageSize;
            main.navBarManager.appManager.clientAlarmManager.alarmTable.$pageBox.pager('options', {
                totalCount: allAlarmListNow.length,
                currPage: 1,
                pageSize: pageSize
            });
        });

        //删除告警
		socket.on('deleteAlarm', function(alarmId) {
			// console.log('clear alarms!!!');
			if (alarmId) {
				var alarmManager = self.sceneManager.getAlarmManager();
				if (alarmManager.getAlarm(alarmId)) {
                    alarmManager.remove(alarmId);
                    var alarmManagerNow = self.sceneManager.getAlarmManager();
                    var allAlarmListNow = alarmManagerNow.getAlarms()._as;
                    var pageSize = main.navBarManager.appManager.clientAlarmManager.alarmTable.pageSize;
                    main.navBarManager.appManager.clientAlarmManager.alarmTable.$pageBox.pager('options', {
                        totalCount: allAlarmListNow.length,
                        currPage: 1,
                        pageSize: pageSize
                    });
				}
			}
		});

        socket.on('clearAlarm',function(){
                var alarmManager = self.sceneManager.getAlarmManager();
                var alarms = alarmManager.getAlarms();
                alarms.forEach(function(alarm){
                    alarmManager.remove(alarm);
                });
        });
        socket.on('updateAlarm',function(updatedAlarm){
            var alarmManager = self.sceneManager.getAlarmManager();
            var alarm = alarmManager.getAlarm(updatedAlarm.id);
            $.each(updatedAlarm.value, function(prop, val) {
                if(prop === 'client'){
                    // 告警中保存的JSON字符串，应该改为对象
                    alarm.client = val.client;
                    // if(typeof(val) == 'string'){
                    //   val = JSON.parse(val);
                    // }
                    // $.each(val, function(cp, cv) {
                    //    alarm.client[cp] = cv;
                    // });
                } else if (prop == 'dataId') {
                    alarm._dataId = val;
                } else if (prop == 'alarmTypeId') {
                    alarm.setAlarmType(val);
                    alarm.alarmTypeId = val;
                } else if (prop == 'level') {
                    // alarm._alarmSeverity = it.AlarmSeverity.getByName(val) || it.AlarmSeverity.getByValue(val);
                    alarm.setAlarmSeverity(it.AlarmSeverity.getByName(val) || it.AlarmSeverity.getByValue(val));
                } else if (alarm['_' + prop] || alarm['_' + prop] === null) {
                    alarm['_' + prop] = val;
                } else {
                    alarm[prop] = val;
                }
            });
            // 只更新了告警对象，但是告警列表里是twaver Node也需要更新
            main.navBarManager.appManager.clientAlarmManager.updateAlarmHandle(alarm);
        });

        socket.on('refreshAlarm', function(params) {
            var target = params.target, 
                field = params.where.field,
                operation = params.where.operation,
                result = params.where.result;
            var alarmManager = self.sceneManager.getAlarmManager();
            var allAlarmList = alarmManager.getAlarms()._as;
            var time = new Date(result);
            
            if(target == 'alarm_log') {
                main.navBarManager.appManager.clientAlarmManager.alarmLogDialog.queryListDialog(1);
                return;
            }
            //删除alarm
            for(var i=0; i<allAlarmList.length; i++) {
                var time1 =  new Date(allAlarmList[i][field]);
                var symbol = '';
                var isDelete = false;
                if(operation == '>' && time1>time) {
                    isDelete = true;
                }else if(operation == '>=' && time1>=time) {
                    isDelete = true;
                }else if(operation == '<' && time1<time) {
                    isDelete = true;
                }else if(operation == '<=' && time1<=time) {
                    isDelete = true;
                }else if(operation == '=' && time1==time) {
                    isDelete = true;
                }
               
                if(isDelete) {
                    var alarmId = allAlarmList[i]._id;
                    if(alarmManager.getAlarm(alarmId)) {
                        alarmManager.remove(alarmId);
                        var alarmManagerNow = self.sceneManager.getAlarmManager();
                        var allAlarmListNow = alarmManagerNow.getAlarms()._as;
                        var pageSize = main.navBarManager.appManager.clientAlarmManager.alarmTable.pageSize;
                        main.navBarManager.appManager.clientAlarmManager.alarmTable.$pageBox.pager('options', {
                            totalCount: allAlarmListNow.length,
                            currPage: 1,
                            pageSize: pageSize
                        });
                    } 
                }
            }
            //更新告警统计
            main.assetPanelMgr.showWarningsInfo('floor');
           
            // main.navBarManager.appManager.clientAlarmManager.alarmTable.queryCurrentAlarmList(1);
        });
    },

	/**
     * 根据告警的level获取告警级别
     */
    getAlarmSeverity : function(asId){

        return it.AlarmSeverity.getByName(asId) || it.AlarmSeverity.getByValue(asId);
    },
});