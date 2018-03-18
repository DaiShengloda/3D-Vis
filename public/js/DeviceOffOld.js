it.DeviceOff = function(sceneManager){
    if(!sceneManager){
        console.log('sceneManager can not be null!');
        return ;
    }
    this.sceneManager = sceneManager;
    this.dataManager = this.sceneManager.dataManager;
    this.orgTreeManager = new it.OrganizeTreeManager(this.sceneManager.dataManager);
    this.defaultEventHandler = sceneManager.viewManager3d.getDefaultEventHandler();
    this.deviceFinder = new it.DeviceOffFinder(this.dataManager,this.sceneManager);
    this.treeView = null;
    // this.inputPane = new it.DeviceOffSearchPanel(this.dataManager);
    this.box3D = this.sceneManager.network3d.getDataBox();   
    this.initSearchPane();
};

mono.extend(it.DeviceOff,Object,{
    
    initSearchPane: function(){
        if(this._initedPanel){
            return;
        }
        this._initedPanel = true;
        var self = this;

        this.appPanel = $('<div>').addClass('app-panel');
        $('.view-control').append(this.appPanel);
        this.appPanel.DeviceOffApp();
        this.appPanel.DeviceOffApp('doHide');

        // this.searPanel = $('<div class="search-main-pane"></div>');
        //下架的信息
        // this.searPanel.append(this.inputPane.getContentPane());
        // var infoPanel = $('<div id="base-search-panel" class="inputPane"></div>').appendTo(this.searPanel).css('height', '60px');
        // var ff = function(parent, id, label, isSelect){
        //     var $row = $('<div class="row"></div>').appendTo(parent);
        //     var $lbcol = $('<div class="without-padding col-md-3"><label for="'+id+'" class="inputpane-label label-min">'+label+'</label></div>').appendTo($row);
        //     var $inputcol = $('<div class="without-padding col-md-9"></div>').appendTo($row);
        //     var $input = $('<input id="'+id+'" class="input-min contral-width">');
        //     if(isSelect){
        //         $input = $('<select id="'+id+'" class="input-min contral-width"></select>');
        //     }
        //     $input.appendTo($inputcol);
        //     return $input;
        // }
        
        var $deviceId = this._$deviceId = $('.device-off-panel input.DeviceOff-Device-Num');
        
        //当选中机柜时，将机柜ID设置给输入框
        var box3d = this.sceneManager.network3d.getDataBox();
        box3d.getSelectionModel().addSelectionChangeListener(function(event){
            var datas = event.datas;
            var node = datas.get(0);
            var nodeData = self.sceneManager.getNodeData(node);
            if(nodeData){
                var category = self.dataManager.getCategoryForDataType(nodeData.getDataTypeId());
                if(category && category.getId() === 'rack'){
                    self._lookat = nodeData.getId()
                } else if(category && category.getId() === 'equipment'){
                    self._$deviceId.val(nodeData.getId());
                } else {
                    self._lookat = undefined;
                }
            } else {
                self._lookat = undefined;
            }
        });

        var $save = $('.device-off-panel .confirm-it'), 
            $clear = $('.device-off-panel .cancer-it'), 
            $preview = $('.device-off-panel .preview-it');
        var validate = function(){
            var data = {};
            var deviceId = $deviceId.val();
            if(!deviceId || deviceId.trim() == ''){
                ServerUtil.msg(it.util.i18n("DeviceOff_Input_device_ID"));
                return;
            }
            // check deviceId 是否存在
            var deviceNode = self.sceneManager.dataManager.getDataById(deviceId);
            if(!deviceNode){
                ServerUtil.msg(it.util.i18n("DeviceOff_Device_not_exist"));
                return;
            }
            return {id:deviceId};
        }
        var clearField = function(){
            // $deviceId.val("");
            $equipment.val('');
        }
        $preview.click(function(event) {
            if(self._previewNode) {
                var node = self._previewNode;
                node.s({
                    'm.ambient': self._oldAmbient || 'white',
                });
                node.setPositionZ(node.getPositionZ());
                self._previewOffsetZ = undefined;
                self._previewNode = undefined;
            }
            var data = validate();
            if(!data)return;
            if(!$preview.hasClass('active'))return;
            self.preview(data);
            $preview.removeClass('active');
            $clear.addClass('active');
            $save.addClass('active');
        });
        $clear.click(function(event) {
            if(!$clear.hasClass('active'))return;
            if(!self._previewNode)return;
            var node = self._previewNode;
            node.s({
                'm.ambient': self._oldAmbient || 'white',
            });
            node.setPositionZ(node.getPositionZ() - self._previewOffsetZ);
            self._previewOffsetZ = undefined;
            self._previewNode = undefined;

            $clear.removeClass('active');
            $save.removeClass('active');
            $preview.addClass('active');
        });
        $save.click(function(event) {
            if(!$save.hasClass('active'))return;
            ServerUtil.confirm(it.util.i18n("DeviceOff_Confirm_device_off"), function(){
                var data = validate();
                if(!data)return;
                self.save(data, clearField);
                $save.removeClass('active');
                $clear.removeClass('active');
                $preview.addClass('active');
            });
        });
        var $deviceType = this._$deviceType = $('.device-off-panel select.DeviceOff-Device-Type'),
            $description = this._$description = $('.device-off-panel input.DeviceOff-Device-Description'),
            $searchRack = this._$searchRack = $('.device-off-panel input.DeviceOff-Device-In-Rack'),
            $equipment = this._$equipment  = $('.device-off-panel input.DeviceOff-Device-Num');

        this.f = function(){
            var params = [self.deviceParam, self.eParam, self.srParam, self.descParam].filter(function(item) {
                return item.value != undefined && item.value != '';
            });
            self.refreshTreeView(self.setData(params));
        }

        this.deviceParam = {key:'dataTypeId',operation:'='};
        //当设备类型发生变化的时候
        $deviceType.on( "selectmenuchange", function(event) {
            var dataType = $deviceType.find('option:selected').val();
            var dt = self.sceneManager.dataManager._dataTypeMap[dataType];
            dt?(self.deviceParam.value = dt.getId()):(delete self.deviceParam.value);
            self.f();
        });
        this.eParam = {key:'id',operation:'like'};
        $equipment.change(function(event) {
            var $equipment = $(this), val = $equipment.val();
            self.eParam.value = val;
            self.f();
        });
        this.srParam = {key:'parentId',operation:'like'};
        $searchRack.change(function(event) {
            var $rack = $(this), val = $rack.val();
            self.srParam.value = val;
            self.f();
        });
        this.descParam = {key:'description',operation:'like'};
        $description.change(function(event) {
            var $desc = $(this), val = $desc.val();
            self.descParam.value = val;
            self.f();
        });
        
       
        
        if(!this.clear){
            this.clear = function(){
                $deviceType.val('');
                $equipment.val('');
                $searchRack.val('');
                $description.val('');
                self.appPanel.find('select').each(function () {
                    $(this).selectmenu("refresh");
                })
            }
        }
        if(!this.reset){
            this.reset = function(data){
                $deviceType.val(data.datatTypeId);
                $equipment.val(data.id);
                $searchRack.val(data.parentId);
                $description.val(data.location);
            }
        }
        

        //符合条件的机柜,默认查询出所有有空间的机柜
        // this.treeView = new it.TreeView(this.searPanel);
        

        // this.treeView.clickNodeFunction = function(treeData){
        //     self.clickTreeNode(treeData);
        // };
        // this.sceneManager.addSceneChangeListener(function(eve){//场景切换
        //     // self.clearSearch();
        // });
        // self.setData([]);

        // 设置当前focus的机柜
        // var node = main.sceneManager.viewManager3d.getFocusNode();
        // var data = main.sceneManager.getNodeData(node);
        // var category = main.sceneManager.dataManager.getCategoryForData(data);
        // var selectedRackId = '';
        // if(category && category.getId().toLowerCase().trim() === 'rack'){
        //     selectedRackId = data.getId();
        // } 
        // $searchRack.val(selectedRackId);

        // this.refreshTreeView(this.setData([]));
    },

    getCurrentRack: function(){

        var node = main.sceneManager.viewManager3d.getFocusNode();
        var data = main.sceneManager.getNodeData(node);
        var category = main.sceneManager.dataManager.getCategoryForData(data);
        var selectedRackId = '';
        if(category && category.getId().toLowerCase().trim() === 'rack'){
            selectedRackId = data.getId();
            this._$searchRack.val(selectedRackId);
        } 
        this._$searchRack.trigger('change');
    },

    createLabel: function(treeData) {
        if (!treeData) {
            return orgLabel(treeData);
        }
        var label = treeData.getName();
        // 暂时不添加额外内容，添加导航条的内容会额外加大树内容的宽度。但是树的宽度不会增加，这样就会让部分内容被挡住
        if (label) {
            // label += "(" + treeData.getId() + ")";
        } else {
            label = treeData.getId();
        }
        return label;
    },

    refreshTreeView: function(results){
        this.removeTreeView();
        this.makeTreeView(results);
    },

    makeTreeView: function(results){
        this.treeView = this.appPanel.DeviceOffApp('createSearchTree', results, this.appPanel, 300, this.createLabel);
        var self = this;
        this.treeView.clickNodeFunction = function(treeData){
            self.clickTreeNode(treeData);
        };
    },

    removeTreeView: function(){
        this.appPanel.DeviceOffApp('removeSearchTree');
    },

    clickTreeNode : function(treeData){
        var id = treeData.id;
        if(!id) return;
        var data = this.sceneManager.dataManager.getDataById(id);
        if(!data || !this.treeView.isClick(data)) return;
        var assetNode = this.sceneManager.dataNodeMap[id];
//        var nodeData = this.sceneManager.getNodeData(assetNode);

        if(!this.sceneManager.isCurrentSceneInstance(data)){ //如果一下子跳到其他的场景的某个非根对象
            var sceneAndRootData = this.sceneManager.getSceneAndRootByData(data);
            if(sceneAndRootData){
                this.sceneManager.gotoScene(sceneAndRootData.scene,sceneAndRootData.rootData);
                //如果是整个楼层的话，就不需这么lookAt了(严格意义上说是Data本身就在场景的root就不需再去设置镜头了)
                if(sceneAndRootData.rootData != data){
                    assetNode = this.sceneManager.dataNodeMap[id];
                    if(!assetNode){
                        this.sceneManager.loadLazyData(data);
                    }
                }else{
                    assetNode = null;
                }
            }
        }
        //注意以下两种情况：
        //1、还没有创建，如lazyable的设备，只有在focus该机柜时，它的孩子设备才会被创建(第一次)并加到box中
        //2、有可能就是存在该场景中，只是不在box中而已，如：lazyable模式下，设备都被移除掉了
        if(!assetNode){
            this.sceneManager.loadLazyData(data);
            assetNode = this.sceneManager.dataNodeMap[id];
        }
        if(!assetNode){
            return;
        }
        var assetData = this.sceneManager.getNodeData(assetNode);
        var category = main.sceneManager.dataManager.getCategoryForData(assetData);
        var categoryId = category?category.getId().toLowerCase().trim():'';
        //如果datatype是rack就lookAt 如果是equipment就是把id设置给input
        if(categoryId === 'rack'){
            var box3d = this.sceneManager.network3d.getDataBox();
            if(!assetNode || !box3d.getDataById(assetNode.getId())){
                this.sceneManager.loadLazyData(data);
                if(!assetNode){
                    assetNode = this.sceneManager.dataNodeMap[data.getId()];
                }
            }
            if(this.defaultEventHandler){
                this.defaultEventHandler.lookAt(assetNode);
            }
        } else if(categoryId === 'equipment'){
            //选中机柜后，把设备ID设置到输入框中
            this._$deviceId.val(assetData.getId());
            // lookAt设备的父亲（机柜）
            // var rackId = assetData.getParentId();
            var rackNode = this.sceneManager.getNodeByDataOrId(assetData.getParentId());
            if(this.defaultEventHandler){
                this.defaultEventHandler.lookAt(rackNode);
            }
        }
        this._assetNode = assetNode;
    },
    preview: function(params){
        this.deviceId = params.id;
        var deviceData  = this.sceneManager.dataManager.getDataById(this.deviceId);
        var parentNode = this.sceneManager.getNodeByDataOrId(deviceData._parentId);
        var self = this;
        var callback = function(){
            var deviceNode = self.sceneManager.getNodeByDataOrId(self.deviceId);
            self._oldAmbient = deviceNode.getStyle('m.ambient');
            deviceNode.s({
                'm.ambient': 'red',
            });
            self.sceneManager.viewManager3d.getDefaultVirtualMaterialFilter().removeByDescendant(deviceNode);
            var bb = deviceNode.getBoundingBoxWithChildren();
            var d = bb.max.z - bb.min.z;
            self._previewOffsetZ = d;
            self._previewNode = deviceNode;
            deviceNode.setPositionZ(deviceNode.getPositionZ()+d);
        }
        this.sceneManager.viewManager3d.defaultEventHandler.lookAt(parentNode, callback)
    },
    save: function(data, callback){
        var self = this;
        //删除设备
        it.util.apiWithPush('remove', data, function(result){
            ServerUtil.msgWithIcon(it.util.i18n("DeviceOff_Suucess_off"), 6);

            var devicedata = main.sceneManager.dataManager.getDataById(data.id);
            main.sceneManager.dataManager.removeData(devicedata);
            // var box3d = self.sceneManager.network3d.getDataBox();
            // box3d.remove(self._previewNode);
            
            main.sceneManager.removeDataNodeByDataOrId(data.id);
            self._previewNode = undefined;
            self.f();
            // self.dataManager.addData(self._previewDevice);
            // var node = self._previewNode;
            // // console.log(self._oldAmbient);
            // node.s({
            //     'm.ambient': self._oldAmbient || 'white',
            // });
            if(callback){
                callback();
            }
            // var bb = node.getBoundingBoxWithChildren();
            // var d = bb.max.z - bb.min.z;
            // var oz = node.getPositionZ();
            // var animate = new twaver.Animate({
            //     from:0,
            //     to:d,
            //     delay:0,
            //     dur:500,
            //     onUpdate:function(value){
            //         node.setPositionZ(oz-value);
            //     }
            // });
            // animate.play();
            // self._previewDevice = undefined;
            // self._previewNode = undefined;
        }, function(error){
            ServerUtil.msgWithIcon(error.message, 5);
        });
        
    },
    setData : function(conditions){
        var results = this.deviceFinder.find(conditions);
        return results;
    },
    // addRoot : function(results){
    //     if(!results || results.length < 1){
    //         return null;
    //     }
    //     var id = this.getCurrentRootId()||"";
    //     var name = this.getCurrentRootId()||"";
    //     var floor = new it.Link({id:id,name:name});
    //     results.push(floor);
    // },
    // getCurrentRootId : function(){
    //     var rootNode = this.sceneManager.getCurrentRootNode();
    //     if(!rootNode) return null;
    //     var rootData = this.sceneManager.getNodeData(rootNode);
    //     if(rootData){
    //         return rootData.getId();
    //     }
    //     return null;
    // },
    // getRootView : function(){
    //     if(this.clear){
    //         this.clear();
    //     }
    //     this.reinit();
    //     return this.searPanel;
    // },
    reinit: function(){
        if(this._lookat){
            var assetNode = this.sceneManager.dataNodeMap[this._lookat];
            if(this.defaultEventHandler){
                this.defaultEventHandler.lookAt(assetNode);
            }
        }
        var $dataType = this._$deviceType;
        var dataType = $dataType.find('option:selected').val();
        if (!dataType) {
            return;
        }
        var dt = this.sceneManager.dataManager._dataTypeMap[dataType];
        if (!dt) {
            return;
        }
        var size = dt.getSize();
        // this._$uid.val(size.getYSize());
        // this._$uid.change();
        if(this.preData){
            this.reset(this.preData);
            this.preData = undefined;
        }
    },
    createDeviceTypeOption : function(){
        var dataTypeDatas = this.dataManager._dataTypes; //不直接用dataTypeMap是因为可能有很多的dataType没有对应的资产
        var options = [{id:'',desc:'All'}];
        if(dataTypeDatas){
            
            for(var typeId in dataTypeDatas){
                var dataType = dataTypeDatas[typeId];
                if(dataType.getCategoryId() !== 'equipment'){
                    continue;
                }
                if(dataType){
                    options.push({id:dataType.getId(), desc:(dataType.getDescription() || dataType.getId())});
                }
            }
            return options;
        }
        return null;
    }
});

it.DeviceOffFinder = function(dataManager,sceneManager){
    it.DeviceOffFinder.superClass.constructor.call(this, dataManager);
    this.sceneManager = sceneManager;
};

mono.extend(it.DeviceOffFinder,it.DataFinder,{
    /**
     * 重写获取数据源的方法
     */
    getDatas : function(){
        var datas = this.dataManager.getDataMapByCategory('equipment');
        var results = [];
        for(var n in datas){
            results.push(datas[n]);
        }
        return results;
    }

});
