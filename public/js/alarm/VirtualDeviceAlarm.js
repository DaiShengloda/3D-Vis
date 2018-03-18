 var VirtualDeviceAlarm = function(sceneManager) {
    this.sceneManager = sceneManager;
    this.dataManager = this.sceneManager.dataManager;
    this.defaultEventHandler = this.sceneManager.viewManager3d.getDefaultEventHandler();
    this.box = this.sceneManager.getDataBox();
    this.alarmManager = this.sceneManager.getAlarmManager();
    this._alarmBubbleMap = {};
    this._alarmFrameMap = {};
    this.focusEquipmentId;
    this.oneUHeight = 4.5; 
 };

 mono.extend(VirtualDeviceAlarm, Object, {

     init: function() {
        var self = this;
        //单独处理equipment的有上浮告警的renderAlarm
        this.sceneManager.dataManager._categoryMap['equipment'].renderAlarm = function(data, node) {
            self.alarmManager.renderAlarm(data, node); //处理equipmqnt的自身告警
            if (!node) {
                return;
            }
            var alarmState = data.getAlarmState();
            var alarmCount = alarmState.getAlarmCount();
            var selfAlarmCount = alarmState.getSelfAlarmCount();           
            var propagateAlarmCount = alarmState.getPropagateAlarmCount();
            self.propagateAlarmCount = propagateAlarmCount;
            if (propagateAlarmCount > 0) {
                self.showDataAlarm(data, node);
            } else if (self._alarmBubbleMap[data.getId()]){
                self.hideDataAlarm(data, node);
            }
        };

        //处理rack中点击设备告警
        var handleDoubleClickElementFunction = main.nodeEventHander.handleDoubleClickElementFunction;
        main.nodeEventHander.handleDoubleClickElementFunction = function (element, network, data, clickedObj) {
            if (handleDoubleClickElementFunction) {
                handleDoubleClickElementFunction.call(this,element, network, data, clickedObj);
            };      
            var bid = element.getClient('bid');
            if (bid == 'eqAlarm') {
                self.defaultEventHandler.lookAtByData(data);
                return;
            }
        };

        this.sceneManager.viewManager3d.addPropertyChangeListener(function (event) {
            if (event.property == "focusNode") {
                var oldData = self.sceneManager.getNodeData(event.oldValue);
                if (!oldData) {
                    return;
                }
                var oldCategory = self.sceneManager.dataManager.getCategoryForData(oldData);
                var oldCategoryId = oldCategory.getId();

                var newData = self.sceneManager.getNodeData(event.newValue);
                if (!(newData instanceof it.Data)) {
                    return;
                };
                var newCategory = self.sceneManager.dataManager.getCategoryForData(newData);
                var newCategoryId = newCategory.getId();
                 
                if(newCategoryId != oldCategoryId){
                    self.focusEquipmentId = null;
                };
                self.focusChange = true;
            }
        });
     },
     
    showDataAlarm: function(data, node) {
        var alarmState = data.getAlarmState();
        var alarmSeverity = alarmState.getHighestAlarmSeverity();
        var color = null;
        if (alarmSeverity) {
            color = alarmSeverity.color;
        };
        var alarmBubble = null;
        if (this._alarmBubbleMap[data.getId()]) {
            return;
        } else {
            this._alarmBubbleMap[data.getId()] = this.createEmptyBubblePlaneById(data.getId(), color);
            this._alarmFrameMap[data.getId()] = this.createEmptyFramePlaneById(data.getId(), color);
            this.initAlarmData(this._alarmFrameMap[data.getId()], this._alarmBubbleMap[data.getId()], data);
        };
    },

    hideDataAlarm: function (data, node) {
        if (!this._alarmBubbleMap[data.getId()])return;
        this.box.remove(this._alarmBubbleMap[data.getId()]);
        this._alarmBubbleMap[data.getId()].setParent(null);
        delete this._alarmBubbleMap[data.getId()];

        this.box.remove(this._alarmFrameMap[data.getId()]);
        this._alarmFrameMap[data.getId()].setParent(null);
        delete this._alarmFrameMap[data.getId()];
    },

    //node关联data处理虚化
    initAlarmData: function (alarmFrame, alarmBubble, data) {
        this.initAlarmBubble(alarmFrame, data);
        this.initAlarmFrame(alarmBubble, data);
    },

    initAlarmFrame: function (alarmFrame, data) {
        alarmFrame.setClient('it_data', data);
    },

    initAlarmBubble: function (alarmBubble, data) {
        alarmBubble.setClient('it_data', data);
    },

    createEmptyBubblePlaneById: function(dataId, color) {
        var node = this.sceneManager.dataNodeMap[dataId];
            boundingBox = node.getBoundingBox(),
            min = boundingBox.min,
            max = boundingBox.max,
            width = (max.x - min.x) / 10,
            height = (max.y - min.y),       
            text = this.propagateAlarmCount;
        var canvas = this.createBubble(color, text);
        var plane = new mono.Plane(this.canvasWidth, this.canvasHeight);
        plane.s({
            'm.texture.image': canvas,
            'm.transparent': true,
            'm.opacity': 1.0,
        });         
        this.planeWidth = this.oneUHeight;
        this.planeHeight = this.oneUHeight;
        var scale_x = this.planeWidth / this.canvasWidth,
            scale_y = this.planeHeight / this.canvasHeight,
            pos_y = height > this.oneUHeight ? max.y - this.planeHeight / 2 - 1 : max.y - this.planeHeight / 2;
        plane.setScale(scale_x, scale_y, 1);
        plane.setPositionX(max.x - this.planeWidth + 1);
        plane.setPositionY(pos_y);
        plane.setPositionZ(max.z + 0.2);
        plane.setParent(node);
        plane.setClient('bid', 'eqAlarm');
        this.box.add(plane);
        return plane;
    },

    createEmptyFramePlaneById: function(dataId, color) {
        var node = this.sceneManager.dataNodeMap[dataId];
            boundingBox = node.getBoundingBox(),
            min = boundingBox.min,
            max = boundingBox.max,
            width = (max.x - min.x),
            height = (max.y - min.y);
        var canvas = this.createFrame(width,height,color);
        var plane = new mono.Plane(this.frameWidth, this.frameHeight);
        plane.s({
            'm.texture.image': canvas,
            'm.transparent': true,
            'm.opacity': 1.0,
        });
        var scale_x = width / this.frameWidth,
            scale_y = height / this.frameHeight;
        plane.setScale(scale_x, scale_y, 1);
        plane.setPositionZ(max.z + 0.1);
        plane.setParent(node);
        plane.setClient('bid', 'eqAlarm');
        this.box.add(plane);
        return plane
    },

    createBubble: function(color, text) {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        var font = "bolder 16px MicrosoftYaHei,sans-serif";
        canvas.width = 32;
        canvas.height = canvas.width;
        this.canvasWidth = canvas.width;
        this.canvasHeight = canvas.height;

        context.save();
        context.fillStyle = color;
        context.beginPath();
        context.arc(canvas.width/2, canvas.height/2, canvas.height/2, 0, 2*Math.PI);
        context.stroke();
        context.closePath();
        context.fill();
        context.fillStyle = 'black';
        context.textBaseline = "middle";
        context.textAlign = 'center';
        context.font = font;
        context.fillText(text, canvas.width / 2, canvas.height / 2); 
        context.closePath(); 
        context.restore();
        return canvas;
    },

    createFrame: function(width,height,color) {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.width = mono.Utils.nextPowerOfTwo(width) * 8;  //canvas按比例来缩放
        canvas.height = mono.Utils.nextPowerOfTwo(height) * 8;
        this.frameWidth = canvas.width;
        this.frameHeight = canvas.height;
        
        context.save();
        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = '8';
        context.strokeRect(0,0,canvas.width,canvas.height);
        context.stroke();
        context.closePath();
        context.restore();
        return canvas;
    },

    //处理当前告警定位--虚拟机
    dwFindCell: function(data) {
        var category = this.dataManager.getCategoryForData(data);
        this.VirtualDeviceData = data;
        var categoryId = category.getId();
        if (categoryId == 'virtualDevice') {
            var parentId = data.getParentId();      
            parentData = this.dataManager.getDataById(parentId);
            this.focusChange = false;
            this.defaultEventHandler.lookAtByData(parentData);          
            this.showVirtualDevice(parentId);
            this.shineVirtualDevice();
        } else {
            this.defaultEventHandler.lookAtByData(data);
        };
    },

    //显示虚拟机
    showVirtualDevice: function(parentId) {
        if (this.focusEquipmentId == parentId)return;                   
        main.panelMgr.instanceMap.NavBarMgr.$box.nav('clickNavIcon', 'xuniji'); 
        this.focusEquipmentId = parentId;
    },

    shineVirtualDevice: function(callback) {
        var self = this;
        this.ShineFunction = function (){
            var cellNode = self.sceneManager.getNodeByDataOrId(self.VirtualDeviceData);
            if (!cellNode) {
                self.removeAfterLookAtFinishedListener(self.ShineFunction);
                return;
            };
            var children = cellNode.getDescendants();
            var animate = new twaver.Animate({
                from:0,
                to:4,
                delay:0,
                dur:4000,
                onPlay:function(){
                    // if (parentCateory == 'box'){
                    //     parentNode.setStyle('m.opacity','0.6');
                    // }         
                },
                onUpdate:function(value){
                    self.shineNodeAndChildren(cellNode,children,value);
                },
                onDone:function(){
                    self.showNode(cellNode,children);
                    self.removeAfterLookAtFinishedListener(self.ShineFunction);
                }
            });
            animate.play();
        }; 
        this.sceneManager.viewManager3d.defaultEventHandler.addAfterLookFinishedAtListener(this.ShineFunction);    
        callback&&callback.call(this);  
        if (!this.focusChange){
            this.removeAfterLookAtFinishedListener(this.ShineFunction);
        }
    },

    removeAfterLookAtFinishedListener: function(l) {
        this.sceneManager.viewManager3d.defaultEventHandler.removeAfterLookAtFinishedListener(l);   
        this.focusChange = false;
    },

    hideNode: function(node,children) {
        node.setStyle('m.transparent',true);
        node.setStyle('m.opacity',0);
        children.forEach(function(child){
            child.setStyle('m.transparent',true);
            child.setStyle('m.opacity',0);
        });
    },

    showNode: function(node,children) {
        node.setStyle('m.transparent',true);
        node.setStyle('m.opacity',1);
        children.forEach(function(child){
            child.setStyle('m.transparent',false);
            child.setStyle('m.opacity',1);
        });
    },

    shineNodeAndChildren: function(node,children,value) {
        var self = this;
        var pointMap = this.shine(0,4,20);
        var len = pointMap.length;
        pointMap.forEach(function(point,index){
            if ((point -0.01) <=value && value <= (point +0.01)){
                var bool = (index%2==0) ? true : false;
                if (bool) {
                    self.showNode(node,children);
                } else {
                    self.hideNode(node,children);
                }
            };
        });
    },

    //n>0 为格子闪烁次数
    shine: function(s, e, n){
        var pointMap = [];
        var opacity;
        var gap = (e-s)/(n+1);
        for(var i=1;i<n+1;i++){
            pointMap.push(s+i*gap);
        }
        return pointMap; 
    },

 });
 it.VirtualDeviceAlarm = VirtualDeviceAlarm;