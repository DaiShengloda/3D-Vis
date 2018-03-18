/**
 * 数据生成器，由于没有硬件，该类用来生成温度、湿度等数据的
 * @constructor
 */
DataCreater = function (dataManager) {
//    this.tempDatas = [];
    this.dataManager = dataManager;
    this.collectors = [];

//    setInterval(this.createRandomCollectors(),30000);

    var self = this;
    this.randomCollectors = self.getCollectors();
    this.intervalIndex = setInterval(function () {
        // var cm = self.dataManager._collectors;
        // if (self.randomCollectors && self.randomCollectors.length > 0) { //第一次用随机的
        //     for (var i = 0; i < self.randomCollectors.length; i++) {
        //         var obj = self.randomCollectors[i];
        //         if (cm[obj.id] && cm[obj.id].getType() != 'temperature') {
        //             cm[obj.id].setValue(obj.value);
        //         }
        //     }
        //     self.randomCollectors = [];
        // } else { //随后慢慢累加
        //     for (var cId in cm) {
        //         var collector = cm[cId];
        //         if (collector) {
        //             var value = collector.getValue();
        //             if (collector.getType() == 'humidity') {
        //                 value += 10;
        //                 if (value > 70) {
        //                     value = Math.random() * 70;
        //                 }
        //             } else {
        //                 value += 20;
        //                 if (value >= 50) {
        //                     value = Math.random() * 50;
        //                 }
        //             }
        //             value = parseFloat(value);//+ 0.3; //让其慢慢的加上去
        //             collector.setValue(value);
        //         }

        //         var random = parseInt(Math.random() * 100);
        //         if (random < 5) { // 随机产生告警
        //             self.createAlarm(collector);
        //         }

        //     }
        // }
        // self.createPortData();
        // self.createLinkFlowData();
        // self.createRandomAlarms();
        self.createRandomLed();
    }, 2000);

};


mono.extend(DataCreater, Object, {
    createRandomLed: function(){
        var f = function(max,min){
            return (Math.random()*(max-min)+min).toFixed(2);
        }
        var update = function(id, text, color, v){
            var led = main.sceneManager.getNodeByDataOrId(id);
            if(!led)return;
            var updateValue = led.getClient('update');
            updateValue({"text":text, "color":color, "value":v});
        }
        update('led01',"封闭冷通道\n下送风模式", '#ff0000', f(1.4,1.6));
        update('led02',"封闭冷通道\n下送风模式", '#ff0000', f(1.4,1.6));
        update('led03',"水冷前门模式", '#ffa800', f(1.3,1.4));
        update('led04',"热管背板模式", '#24ff00', f(1.1,1.3));
    },

    createCollector: function () {
        var cm = this.dataManager._collectors;
//        if(this.randomCollectors && this.randomCollectors.length > 0){ //第一次用随机的
//            for(var i = 0 ; i <  this.randomCollectors.length ; i++){
//                var obj = this.randomCollectors[i];
//                if(cm[obj.id]){
//                    cm[obj.id].setValue(obj.value);
//                }
//            }
//            this.randomCollectors = [];
//        }else{ //随后慢慢累加
        var isStart = null;
        for (var cId in cm) {
            var collector = cm[cId];
            if (collector) {
                var value = collector.getValue();
                value = parseFloat(value) + 0.3; //让其慢慢的加上去
                if (isStart == null) {// && collector.getParentId() === 't-f3r1'){
                    if (value > 1.2) {
                        isStart = true;
                    } else {
                        isStart = false;
                    }
                }
                if (isStart) {
                    value = value - 1.2;
                }
                collector.setValue(value);
            }
        }
//        }
    },

    createRandomCollectors: function () {
        this.collectors = [];

        // 造湿度数据
        for (var i = 1; i < 20; i++) {
            var id = '' + i;
            if (id.length < 2) {
                id = '0' + id;
            }
            id = 'd' + id;
            var value = parseInt(Math.random() * 80);
            var obj = {id: id, value: value};
            this.collectors.push(obj);
        }

    },

    getCollectors: function () {
        this.createRandomCollectors();
        return this.collectors;
    },

    /**
     * 创建面板中端口的模拟数据
     */
    createPortData: function () {
        if (main && main.sceneManager && main.sceneManager.dataManager._categoryDatas) {
            var datas = main.sceneManager.dataManager._categoryDatas['card'];
            if (datas) {
                var self = this;
                for (var id in datas) {
                    var cardNode = main.sceneManager.dataNode2DMap[id];
                    if (cardNode && cardNode.getChildren() && cardNode.getChildren().size() > 0) {
                        cardNode.getChildren().forEach(function (child) {
                            if (child && child.getClient('group_id')) {
                                var groupChildren = child.getChildren();
                                self.createPortDataByChild(groupChildren, id);
                            } else {
                                self.createPortDataByChild(child, id);
                            }
                        });
                    }
                }
            }
        }
    },

    createPortDataByChild: function (childs, id) {
        if (childs && childs.size && childs.size() > 0) {
            var self = this;
            childs.forEach(function (child) {
                self.createPortDataByNode(child, id);
            });
        } else {
            this.createPortDataByNode(childs, id);
        }

    },

    createPortDataByNode: function (node, id) {
        var childData = main.sceneManager.getNodeData(node);
        if (childData && childData.getId().endsWith('@' + id)) {
            var eId = parseInt(1 + Math.random() * 100);
            if (eId < 10) {
                eId = '00' + eId;
            } else if (eId < 100) {
                eId = '0' + eId;
            }
            var pId = parseInt(1 + Math.random() * 100);
            if (pId < 10) {
                pId = '00' + pId;
            } else if (pId < 100) {
                pId = '0' + pId;
            }
            node.setClient('toId', 'E00' + eId + '-' + 'port' + pId);
            node.setClient('flow', (Math.random() * 20).toFixed(2) + 'M/s');
            node.setClient('raisedTime', new Date());
        }
    },

    createLinkFlowData: function () {
        var links = main.sceneManager.dataManager.getLinkMap();
        for (var id in links) {
            var link = links[id];
            link._userDataMap['flow'] = Math.random() * 100;
        }
    },

    /**
     * 造龙江温/湿度告警数据
     * @param collector
     */
    createAlarm: function (collector) {
        if (collector && collector.getParentId() === 't-f3r1') { // 目前只有显示了温度云图时该value才会增
            var random = parseInt(100 * Math.random());
            if (random % 23 === 0) { // 随机产生告警
                var date = new Date();
                var id = collector.getId() + date.getTime();
                var dataId = collector.getLocation();
                var asId = parseInt(Math.random() * 6);
                var alarmSeverity = it.AlarmSeverity.CRITICAL;
                if (asId == 6) {
                    alarmSeverity = it.AlarmSeverity.CRITICAL;
                } else if (asId == 5) {
                    alarmSeverity = it.AlarmSeverity.MAJOR;
                } else if (asId == 4) {
                    alarmSeverity = it.AlarmSeverity.MINOR;
                } else if (asId == 3) {
                    alarmSeverity = it.AlarmSeverity.WARNING;
                } else if (asId == 2) {
                    alarmSeverity = it.AlarmSeverity.INDETERMINATE;
                } else if (asId == 1) {
                    alarmSeverity = it.AlarmSeverity.CLEARED;
                }
                var desc = '温度告警';
                var alarmTypeId = 'temperature';
                if (collector.getType() == 'humidity') {
                    desc = '湿度告警';
                    alarmTypeId = 'humidity';
                }
                var alarm = new ITAlarm(id, dataId, alarmSeverity, desc, date);
                alarm.alarmTypeId = alarmTypeId;
                main.navBarManager.clientAlarmManager.addAlarm(alarm);
                main.navBarManager.clientAlarmManager.showAlarmTable(); //如果告警表隐藏了，则要显示
            }
        }
    },

    createAlarmByData: function (data, alarmType) {
        if (!data) {
            return;
        }
        var alarmType = ['物理告警', '网络告警', 'temperature', 'humidity'][parseInt(Math.random() * 3)];
        var date = new Date();
        var id = data.getId() + date.getTime();
        var dataId = data.getId();
        var asId = parseInt(Math.random() * 6);
        var alarmSeverity = it.AlarmSeverity.CRITICAL;
        if (asId == 6) {
            alarmSeverity = it.AlarmSeverity.CRITICAL;
        } else if (asId == 5) {
            alarmSeverity = it.AlarmSeverity.MAJOR;
        } else if (asId == 4) {
            alarmSeverity = it.AlarmSeverity.MINOR;
        } else if (asId == 3) {
            alarmSeverity = it.AlarmSeverity.WARNING;
        } else if (asId == 2) {
            alarmSeverity = it.AlarmSeverity.INDETERMINATE;
        } else if (asId == 1) {
            alarmSeverity = it.AlarmSeverity.CLEARED;
        }
        var desc = '温度告警';
        var alarmTypeId = 'temperature';
        if (alarmType == 'humidity') {
            desc = '湿度告警';
            alarmTypeId = 'humidity';
        } else if (alarmType == 'waterLeak') {
            desc = '漏水告警';
            alarmTypeId = 'waterLeak';
        } else if (alarmType != "temperature") {
            desc = alarmType;
            alarmTypeId = alarmType;
        }
        var alarm = new ITAlarm(id, dataId, alarmSeverity, desc, date);
        alarm.alarmTypeId = alarmTypeId;
        //main.navBarManager.clientAlarmManager.addAlarm(alarm);
//        main.navBarManager.clientAlarmManager.showAlarmTable(); //如果告警表隐藏了，则要显示
        main.sceneManager.getAlarmManager().add(alarm);
    },

    createRandomAlarms: function () {
        var alarms = main.sceneManager.getAlarmManager().getAlarms()
        if (alarms && alarms.size() > 50) {
            return;
        }
        var r = parseInt(Math.random() * 10);
        if (r % 5 != 0) { // 使得产生告警的命中率低一点，产生太多了不太好
            return;
        }
        var datas = this.dataManager.getDatas();
        if (datas && datas.length > 0) {
            var index = parseInt(Math.random() * datas.length);
            var data = datas[index];
            var category = this.dataManager.getCategoryForData(data);
            // if(category
            //     && category.getId().toLowerCase().indexOf('datacenter')<0
            //     && category.getId().toLowerCase().indexOf('floor')<0
            //     && category.getId().toLowerCase().indexOf('building')<0
            //     && category.getId().toLowerCase().indexOf('earth')<0
            //     ){
            //     this.createAlarmByData(data);
            // }
            if (category) {
                var id = category.getId();
                if (id == 'rack' || id == 'equipment') {
                    this.createAlarmByData(data);
                }
            }
//            index = parseInt(Math.random()*datas.length);
//            data = datas[index];
//            this.createAlarmByData(data);
        }
    }


});
