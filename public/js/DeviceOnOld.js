it.DeviceOn = function (sceneManager) {
    if (!sceneManager) {
        console.log('sceneManager can not be null!');
        return;
    }
    this.sceneManager = sceneManager;
    this.dataManager = this.sceneManager.dataManager;
    // this.orgTreeManager = new it.OrganizeTreeManager(this.sceneManager.dataManager);
    // var orgLabel = this.orgTreeManager.createLabel;

    this.defaultEventHandler = sceneManager.viewManager3d.getDefaultEventHandler();
    // this.deviceFinder = new it.DeviceOnFinder(this.dataManager, this.sceneManager);
    // this.treeView = null;

    // this.appPanel = $('<div>').addClass('app-panel');
    // $('.view-control').append(this.appPanel);
    // this.appPanel.DeviceOnApp();
    // this.appPanel.DeviceOnApp('doHide');
    this.network = this.sceneManager.network3d;
    this.box = this.network.getDataBox();
    this.camera = this.network.getCamera();

    // this.isPreview = false;
    // this.initSearchPane();
    this.appState = false;

    var self = this;
    this.network.getRootView().addEventListener('click', function (e) {
        self.clickGreenPop(e);
    });

    this.network.getRootView().addEventListener('drop', function (e) {
        self.clickGreenPop(e);
    });
    
    this.network.getRootView().addEventListener('dragover', function (e) {
        e.preventDefault();
    });
};

mono.extend(it.DeviceOn, Object, {
    appStart: function (datatypeId) {
        if (this.appState) {
            this.appEnd();
        }
        this.popBoxes = [];
        this.currentDatatypeId = datatypeId;
        this.currentDatatype = this.dataManager.getDataTypeById(datatypeId)
        this.currentOccupyU = this.currentDatatype._size.ySize;
        this.currentBusinessTypeId = this.currentDatatype._userDataMap.businessTypeId;
        // console.log(this.currentOccupyU);
        this.appState = true;
        this.rackNode = this.sceneManager.viewManager3d.getFocusNode();
        this.rackData = this.sceneManager.getNodeData(this.rackNode);
        this.rackDataType = this.sceneManager.dataManager.getDataTypeForData(this.rackData);
        this.rackChildrenSize = this.rackDataType._childrenSize.ySize;
        this.popWidth = (this.rackNode.width||(this.rackNode.boundingBox.max.x-this.rackNode.boundingBox.min.x)) - this.rackDataType._childrenSize.xPadding[0] - this.rackDataType._childrenSize.xPadding[1];
        this.popHeight = ((this.rackNode.height||(this.rackNode.boundingBox.max.y-this.rackNode.boundingBox.min.y)) - this.rackDataType._childrenSize.yPadding[0] - this.rackDataType._childrenSize.yPadding[1]) / this.rackChildrenSize;
        this.popDepth = (this.rackNode.depth||(this.rackNode.boundingBox.max.z-this.rackNode.boundingBox.min.z)) + this.rackDataType._childrenSize.zPadding[0] + this.rackDataType._childrenSize.zPadding[1];
        this.makeGreenPops();
    },

    appEnd: function () {
        this.appState = false;
        this.clearGreenPops();
        this.removeOnBtn();
    },

    clickGreenPop: function(e){
        if (this.appState) {
            var first = this.network.getFirstElementByMouseEvent(e);
            if (first) {
                var element = first.element;
                if (element instanceof mono.Plane) {
                    var popColorState = element.getClient('popColorState')
                    var yPosition = element.getClient('yPosition')
                    if (popColorState == 'shallow') {
                        this.clearDeepGreenPops();
                        this.makeDeepGreenPops(yPosition)
                        // console.log(yPosition)
                        return;
                    }
                }
            }
            this.clearDeepGreenPops();
        }
    },

    makeGreenPops: function () {
        // console.log('制作pops')
        for (var i = 0; i < this.rackChildrenSize; i++) {
            this.popBoxes[i] = {
                uOccupyState: 0,
                pop: null,
                isShowPop: 0,
                popState: 0,
                deepPop: null,
                // isShowDeepPop: 0,
                deepPopState: 0,
            };
            // this.popBoxes[i].uOccupyState = 0;
        }
        var deviceDatas = this.rackData._childList._as; //array
        for (var i = 0; i < deviceDatas.length; i++) {
            var startU = deviceDatas[i]._location.y;
            var deviceDatatype = this.sceneManager.dataManager.getDataTypeForData(deviceDatas[i])
            var occupyU = deviceDatatype._size.ySize;
            for (var j = 0; j < occupyU; j++) {
                this.popBoxes[startU - 1 + j].uOccupyState = 1;
            }
        }

        for (var i = 0; i < this.popBoxes.length; i++) {
            if (this.popBoxes[i].uOccupyState == 0) {
                var flag = true;
                for (var j = 0; j < this.currentOccupyU; j++) {
                    if (((i + j) > (this.popBoxes.length - 1)) || this.popBoxes[i + j].uOccupyState == 1) {
                        flag = false;
                        break;
                    }
                }
                if (flag) {
                    this.popBoxes[i].isShowPop = 1;
                } else {
                    this.popBoxes[i].isShowPop = 0;
                }
            } else if (this.popBoxes[i].uOccupyState == 1) {
                this.popBoxes[i].isShowPop = 0;
            }
        }
        // isShowPop-是否要显示浅色pop，popState-浅色pop是否存在
        // shallow deep
        for (var i = 0; i < this.popBoxes.length; i++) {
            if (this.popBoxes[i].isShowPop == 1) {
                this.makeGreenPop('shallow', (i + 1));
                this.popBoxes[i].popState = 1;
            } else {
                this.popBoxes[i].popState = 0;
            }
        }
    },

    makeDeepGreenPops: function (yPosition) {
        this.btnYPosition = yPosition;
        // console.log('添加deepPop')
        for (var i = 0; i < this.currentOccupyU; i++) {
            // if(this.popBoxes[yPosition + i - 1].popState == 1){
            //     this.popBoxes[i].deepPop.setParent(null);
            //     this.box.remove(this.popBoxes[i].deepPop);
            // }
            if (this.popBoxes[yPosition + i - 1].popState == 1) {
                this.clearGreenPop('shallow', yPosition + i);
                this.popBoxes[yPosition + i - 1].popState = 0;
            }
            this.makeGreenPop('deep', (yPosition + i));
            this.popBoxes[yPosition + i - 1].deepPopState = 1;
        }
        this.createOnBtn(yPosition);
    },

    clearDeepGreenPops: function () {
        this.btnYPosition = null;
        // console.log('移除deepPop')
        for (var i = 0; i < this.popBoxes.length; i++) {
            if (this.popBoxes[i].deepPopState == 1) {
                this.popBoxes[i].deepPop.setParent(null);
                this.box.remove(this.popBoxes[i].deepPop);
            }
            if (this.popBoxes[i].popState == 0 && this.popBoxes[i].isShowPop == 1) {
                this.makeGreenPop('shallow', (i + 1));
                this.popBoxes[i].popState = 1;
            }
        }
        this.removeOnBtn();
    },

    makeGreenPop: function (popColorState, yPosition) {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        context.font = "bold 10px 'Source Han Sans CN', 'Microsoft YaHei', Verdana, Helvetica, Arial, 'Open Sans', sans-serif";
        var textWidth = context.measureText(yPosition).width;
        var textHeight = context.measureText('M').width;
        canvas.width = textWidth;
        canvas.height = textHeight;
        context.textBaseline = 'middle';
        context.fillStyle = '#fff';
        context.fillText(yPosition, 0, textHeight / 2);
        var canvas2 = document.createElement('canvas');
        var context2 = canvas2.getContext('2d');
        // canvas2.width = mono.Utils.nextPowerOfTwo(this.popWidth);
        // canvas2.height = mono.Utils.nextPowerOfTwo(this.popHeight);
        canvas2.width = textHeight * 2 * this.popWidth / this.popHeight;
        canvas2.height = textHeight * 2;
        if (popColorState == 'shallow') {
            context2.fillStyle = '#23888F';
            context2.fillRect(0, 0, canvas2.width, canvas2.height);
            context2.strokeStyle = '#4b9497';
            context2.strokeRect(0, 0, canvas2.width, canvas2.height);
        } else if (popColorState == 'deep') {
            context2.fillStyle = '#00d7df';
            context2.fillRect(0, 0, canvas2.width, canvas2.height);
            context2.strokeStyle = '#00f6ff';
            context2.strokeRect(0, 0, canvas2.width, canvas2.height);
        }
        context2.drawImage(canvas, (canvas2.width - canvas.width) / 2, textHeight / 2);

        var greenPop = new mono.Plane(this.popWidth, this.popHeight);
        greenPop.s({
            'm.texture.image': canvas2,
            'm.transparent': true,
            'm.opacity': 0.7,
        })
        greenPop.setParent(this.rackNode);
        greenPop.setPosition(new mono.Vec3(0, this.popHeight * (yPosition - this.rackDataType._childrenSize.ySize / 2 - 0.5), this.popDepth / 2))
        greenPop.setClient('yPosition', yPosition);
        greenPop.setClient('popColorState', popColorState);
        this.box.add(greenPop);
        if (popColorState == 'shallow') {
            this.popBoxes[yPosition - 1].pop = greenPop;
        } else if (popColorState == 'deep') {
            this.popBoxes[yPosition - 1].deepPop = greenPop;
        }
    },

    clearGreenPop: function (popColorState, yPosition) {
        if (popColorState == 'shallow') {
            if (this.popBoxes[yPosition - 1].popState == 1) {
                this.popBoxes[yPosition - 1].pop.setParent(null);
                this.box.remove(this.popBoxes[yPosition - 1].pop);
            }
        } else if (popColorState == 'deep') {
            if (this.popBoxes[yPosition - 1].deepPopState == 1) {
                this.popBoxes[yPosition - 1].deepPop.setParent(null);
                this.box.remove(this.popBoxes[yPosition - 1].deepPop);
            }
        }
    },

    clearGreenPops: function () {
        // console.log('清除pop')
        if(this.popBoxes){
            for (var i = 0; i < this.popBoxes.length; i++) {
                if (this.popBoxes[i].popState == 1) {
                    this.popBoxes[i].pop.setParent(null);
                    this.box.remove(this.popBoxes[i].pop);
                }
                if (this.popBoxes[i].deepPopState == 1) {
                    this.popBoxes[i].deepPop.setParent(null);
                    this.box.remove(this.popBoxes[i].deepPop);
                }
            }
            this.popBoxes = [];
        }
    },

    createOnBtn: function (yPosition) {
        var self = this;
        if (this.btnYPosition) {
            this.removeOnBtn();
        }
        // console.log('createOnBtn');
        this.btnYPosition = yPosition;
        this.onBtn = $('<div>').text('上架').addClass('btn-default').appendTo($('.deviceBtn'));
        this.onBtn.on('click', function () {
            self.makeOnPopPrepare();
            // console.log('上架弹框');
        })
        this.updataOnBtnPosition();
        this.camera.addPropertyChangeListener(this.updataOnBtnPosition, this);
    },

    removeOnBtn: function () {
        // console.log('removeOnBtn');
        if (this.onBtn) {
            this.onBtn.remove();
            this.onBtn = null;
            this.btnYPosition = null;
            this.camera.removePropertyChangeListener(this.updataOnBtnPosition, this);
        }
    },

    updataOnBtnPosition: function () {
        if (this.btnYPosition && this.onBtn) {
            var node = this.popBoxes[this.btnYPosition - 1].deepPop;
            var nodeWidth = node.width;
            var nodeHeight = node.height;
            var nodePosition = node.getPosition();
            var worldPosition = node.worldPosition(new mono.Vec3(nodeWidth * 2 / 3, 0, 0), nodeWidth * 2 / 3);
            var position2d = this.network.getViewPosition(worldPosition);
            this.onBtn.css({
                'left': position2d.x,
                'top': position2d.y - this.onBtn.height() / 2,
            })
        }
    },

    makeOnPopPrepare: function(){
        // 拓展字段表只查询一次，有更新的话需要重新刷新页面才会
        var self = this;
        if(this.extendField){
            this.makeOnPop(this.extendField);
        } else{
            ServerUtil.api('data','findCustomColumnsByCategoryId',{'categoryId': 'equipment'},function(extendField){
                // console.log(extendField);
                self.extendField = extendField;
                self.makeOnPop(extendField);
            });
        }
    },

    makeOnPop: function (extendField) {
        var self = this;
        if (this.btnYPosition) {

            var div = $('<div>').addClass('device-on-layer-box').appendTo($('body'));
            this.div = div;
            var readFormBox = [];
            var getFormBox = [];
            var extendFieldBox = [];
            var readParams = {
                parent: div,
                dataBox: readFormBox,
            }
            var getParams = {
                parent: div,
                dataBox: getFormBox,
            }
            var getExtendParams = {
                parent: div,
                dataBox: extendFieldBox,
            }
            // var occupyU;
            // if(this.currentOccupyU == 1){
            //     occupyU = this.btnYPosition + 'U';
            // } else{
            //     occupyU = this.btnYPosition + '-' + (this.btnYPosition + this.currentOccupyU - 1) + 'U';
            // }
            this.makeOnPopLine(readParams, {
                type: 'textInput',
                readonly: 1,
                readOnlyValue: this.btnYPosition + '-' + (this.btnYPosition + this.currentOccupyU - 1) + 'U',
                text: '所占U位',
                require: false,
                class: 'occupyU',
                id: 'occupyU',
            })

            var idsInput;
            idsInput = this.makeOnPopLine(getParams, {
                type: 'textInput',
                text: '编号',
                require: true,
                class: 'id',
                id: 'id',
            })
            this.idsInput = idsInput;

            this.makeOnPopLine(getParams, {
                type: 'textInput',
                text: '名称',
                require: true,
                class: 'name',
                id: 'name',
            })

            this.makeOnPopLine(getParams, {
                type: 'textInput',
                text: '描述',
                require: false,
                class: 'description',
                id: 'description',
            })

            for(var k=0; k<extendField.length; k++){
                // console.log(extendField[k])
                this.makeOnPopLine(getExtendParams, {
                    type: 'textInput',
                    text: it.util.i18n(extendField[k].column_display_name?extendField[k].column_display_name:extendField[k].column_name),
                    require: false,
                    class: extendField[k].column_name,
                    id: extendField[k].column_name,
                })
            }

            this.readFormBox = readFormBox;
            this.getFormBox = getFormBox;
            this.extendFieldBox = extendFieldBox;

            // 实时数据每个上架弹出框会查询一次，有更新的话需要关闭上架弹出框重新打开才会出现，
            // 记得在关闭pop的时候，将this.expandField置为null
            idsInput.on('focus', function () {
                if(this.expandField){
                    self.makeExtendFieldPop(this.expandField);
                } else{
                    ServerUtil.api('temp_asset', 'search', { isEquipment: true }, function (assets) {
                        // console.log(assets)
                        self.expandField = assets; 
                        self.makeExtendFieldPop(assets);
                        self.updateExtendFieldPop(idsInput.val());
                    });
                }
            })

            idsInput.on('blur', function(){
                setTimeout(function(){
                    // self.removeExtendFieldPop();
                }, 200)
            })

            idsInput.on('input', function(){
                self.updateExtendFieldPop(idsInput.val());
            })

            layer.open({
                type: 1,
                title: '上架',
                closeBtn: 0,
                content: div,
                btn: ['确认', '取消'],
                area: '300px',
                yes: function (index, layero) {
                    var deviceData = {};
                    for (var i = 0; i < self.getFormBox.length; i++) {
                        if (self.getFormBox[i].require && self.getFormBox[i].input.val() == '') {
                            layer.open({
                                content: self.getFormBox[i].name + '不能为空',
                            });
                            return;
                        }
                        deviceData[self.getFormBox[i].id] = self.getFormBox[i].input.val();
                    }

                    deviceData['dataTypeId'] = self.currentDatatypeId;
                    deviceData['parentId'] = self.rackData._id;
                    deviceData['count'] = self.currentOccupyU;
                    deviceData['location'] = {y: self.btnYPosition, z: 'pos_pos'};
                    deviceData['businessTypeId'] = self.currentBusinessTypeId;
                    
                    // console.log(self.extendFieldBox)
                    var extendData = {};
                    for (var i = 0; i < self.extendFieldBox.length; i++) {
                        extendData[self.extendFieldBox[i].id] = self.extendFieldBox[i].input.val();
                    }
                    extendData.id = deviceData.id;
                    // custom_column表table_name字段值
                    extendData['_table'] = 'equipment_custom';
                    deviceData.customField = extendData;
                    // console.log(deviceData);
                    var error = self.validate(deviceData);
                    if(error){
                        layer.open({
                            content: error,
                        });
                        return;
                    }
                    // console.log(self.currentDatatypeId + '进行上架')
                    self.doDeviceOn(deviceData);

                    self.removeOnBtn();
                    layer.closeAll();
                },
                btn2: function (index, layero) {
                    layer.closeAll();
                },
                end: function () {
                    div.remove();
                    self.expandField = null;
                    self.isExtendFieldPop = false;
                },
            })
        }
    },

    makeOnPopLine: function (commomParams, params) {
        var div = $('<div>').addClass('device-on-layer-line').appendTo(commomParams.parent);
        var text, input;
        if (params.type == 'textInput') {
            text = $('<span>').addClass(params.class + ' text').appendTo(div).text(params.text);
            inputDiv = $('<div>').addClass(params.class + ' input-div').appendTo(div);
            input = $('<input>').addClass(params.class + ' input').appendTo(inputDiv);
            if (params.readonly) {
                input.attr('readonly', 'readonly');
                input.val(params.readOnlyValue);
            }
            if(params.require){
                $('<span>').addClass('extraRequire').appendTo(div).text('*');
            }
        }
        commomParams.dataBox.push({
            input: input,
            require: params.require,
            id: params.id,
            name: params.text,
        })
        return input;
    },

    validate: function(deviceData){
        var allDatas = this.dataManager._datas;
        for(var i=0; i<allDatas.length; i++){
            if(allDatas[i]._id == deviceData.id){
                return it.util.i18n("DeviceOn_Device_ID_exist");
            }
        }
        return false;
    },

    doDeviceOn: function(deviceData){
        var self = this;
        if(deviceData){
            it.util.apiWithPush('add', deviceData, function(result) {
                // console.log(result);
                setTimeout(function(){
                    self.appStart(self.currentDatatypeId)
                    var node = self.sceneManager.getNodeByDataOrId(deviceData.id);
                    var size = node.getBoundingBox().size();
                    var position = node.getPosition();
                    var d = size.z;
                    var startZ = position.z + d;
                    var animate = new twaver.Animate({
                        from:0,
                        to:d,
                        delay:0,
                        dur:2000,
                        onUpdate:function(value){
                            node.setPositionZ(startZ - value);
                        },
                        onDone: function(){
                            ServerUtil.msg(it.util.i18n("DeviceOn_Save_success"));
                        }
                    });
                    animate.play();
                }, 200)
            }, function(error) {
                ServerUtil.msg(error.message);
            });
        }
    },

    updateExtendFieldPop:function(key){
        if(this.extendFieldPop){
            var length = this.extendFieldPop.children().length;
            var k=0;
            this.extendFieldPop.children().each(function(){
                var $this = $(this);
                if($this.text().indexOf(key)>-1){
                    $this.show();
                    k++;
                } else{
                    $this.hide();
                }
            })
            if(k==0){
                this.extendFieldPop.addClass('kong');
            } else{
                this.extendFieldPop.removeClass('kong');
            }
        }
    },

    makeExtendFieldPop: function(expandField){
        // console.log(expandField)
        var self = this;
        // var flag = false;
        // this.idsInput.parent().children().each(function(){
        //     if($(this).hasClass('ExtendFieldPop')){
        //         flag = true;
        //         return
        //     }
        // })
        // if(flag){
        //     return;
        // }
        if(this.isExtendFieldPop){
            return;
        }
        if(expandField.length>0){
            this.extendFieldPop = $('<div>').addClass('ExtendFieldPop bt-scroll').appendTo(this.idsInput.parent());
            this.isExtendFieldPop = true;
            for(var i=0; i<expandField.length; i++){
                var ids = expandField[i].name||expandField[i].id;
                var line = $('<div>').addClass('ExtendFieldPop-line ' + ids).text(ids).attr('title', ids).appendTo(this.extendFieldPop);
            }
            this.extendFieldPop.on('click', '.ExtendFieldPop-line', function(){
                var text = $(this).text();
                for(var i=0; i<expandField.length; i++){
                    var ids = expandField[i].name||expandField[i].id;
                    if(ids == text){
                        // console.log(expandField[i]);
                        self.syncExpandField(expandField[i]);
                        break;
                    }
                }
                self.removeExtendFieldPop();
            })
        }
    },

    removeExtendFieldPop: function(){
        if(this.extendFieldPop){
            this.extendFieldPop.remove();
            this.extendFieldPop = null;
            this.isExtendFieldPop = false;
        }
    },

    syncExpandField: function(data){
        for(var i=0; i<this.getFormBox.length; i++){
            var val = data[this.getFormBox[i].id];
            if(val){
                this.getFormBox[i].input.val(val);
            } else{
                this.getFormBox[i].input.val('');
            }
        }
        for(var i=0; i<this.extendFieldBox.length; i++){
            var val = data.extend[this.extendFieldBox[i].id];
            if(val){
                this.extendFieldBox[i].input.val(val);
            } else{
                this.extendFieldBox[i].input.val('');
            }
        }
    },
});