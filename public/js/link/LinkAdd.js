it.LinkAdd = function(sceneManager){
    if (!sceneManager) {
        console.log('sceneManager can not be null!');
        return;
    }
    this.sceneManager = sceneManager;
    this.dataManager = this.sceneManager.dataManager;
    this.orgTreeManager = new it.OrganizeTreeManager(this.sceneManager.dataManager);
    var orgLabel = this.orgTreeManager.createLabel;
    this.orgTreeManager.createLabel = function (treeData) {
        if (!treeData) {
            return orgLabel(treeData);
        }
        var label = treeData.getName();
        if (label) {
            label += "(" + treeData.getId() + ")";
        } else {
            label = treeData.getId();
        }
        return label;
    };
    this.defaultEventHandler = sceneManager.viewManager3d.getDefaultEventHandler();
    this.deviceFinder = new it.LinkAddFinder(this.dataManager, this.sceneManager);
    this.treeView = null;
    this.inputPane = new it.LinkAddSearchPanel(this.sceneManager);
    this.box3D = this.sceneManager.network3d.getDataBox();

    this.initSearchPane();
};

mono.extend(it.LinkAdd,Object,{

    initSearchPane: function () {
        if (this._initedPanel) {
            return;
        }
        this._initedPanel = true;
        var self = this;
        this.searPanel = $('<div class="search-main-pane"></div>');
        //上架的信息
        // this.searPanel.append(this.inputPane.getContentPane());
        var infoPanel = this.infoPanel = this.inputPane.mainPane.appendTo(this.searPanel);
        // var infoPanel = this.infoPanel = $('<div id="base-search-panel" class="inputPane"></div>').appendTo(this.searPanel);//.css('height', '170px');
        var ff = function (parent, id, label, isSelect, readonly) {
            var $row = $('<div class="row"></div>').appendTo(parent);
            var $lbcol = $('<div class="without-padding col-md-4"><label for="' + id + '" class="inputpane-label label-min">' + label + '</label></div>').appendTo($row);
            var $inputcol = $('<div class="without-padding col-md-8"></div>').appendTo($row);
            var $input = $('<input id="' + id + '" class="input-min contral-width">');
            if (isSelect) {
                $input = $('<select id="' + id + '" class="input-min contral-width"></select>');
            }
            if (readonly) {
                $input.attr('readonly', 'readonly');
            }
            $input.appendTo($inputcol);
            return $input;
        }

        var $businessType = this.inputPane.getInputHtmlById('txt_business_type');//$('#DeviceOnSearchPanel_txt_business_type');
        var $deviceType = this._$deviceType = this.inputPane.getInputHtmlById('txt_type');//$('#DeviceOnSearchPanel_txt_type');
        // var $deviceType2 = this._$deviceType2 = this.inputPane.getInputHtmlById('txt_type2');//$('#DeviceOnSearchPanel_txt_type');
        var $deviceId = this.inputPane.getInputHtmlById('deviceID');//$('#DeviceOnSearchPanel_deviceID');
        var $name = this.inputPane.getInputHtmlById('name');//$('#DeviceOnSearchPanel_name');
        var $description = this.inputPane.getInputHtmlById('description');//$('#DeviceOnSearchPanel_description');
        var $rack1 = this._$rack1 = this.inputPane.getInputHtmlById('r_rack1');//$('#DeviceOnSearchPanel_r_rack');
        var $rack2 = this._$rack2 = this.inputPane.getInputHtmlById('r_rack2');//$('#DeviceOnSearchPanel_r_rack');
        var $port1 = this._$port1 = this.inputPane.getInputHtmlById('port1');//$('#DeviceOnSearchPanel_r_rack');
        var $port2 = this._$port2 = this.inputPane.getInputHtmlById('port2');//$('#DeviceOnSearchPanel_r_rack');


        $rack1.attr('placeholder', it.util.i18n("LinkAdd_Click_to_select"))
        $rack1.on('click', function () {
            self.$rackPicker1.toggleClass('on');
            if (self.$rackPicker1.hasClass('on')) {
                self.treeView1.setTreeHeight(200)
                self.$rackPicker1.show();
            } else {
                self.$rackPicker1.hide();
            }
        })

        $rack2.attr('placeholder', it.util.i18n("LinkAdd_Click_to_select"))
        $rack2.on('click', function () {
            self.$rackPicker2.toggleClass('on');
            if (self.$rackPicker2.hasClass('on')) {
                self.treeView2.setTreeHeight(200)
                self.$rackPicker2.show();
            } else {
                self.$rackPicker2.hide();
            }
        })



        //当选中机柜时，将机柜ID设置给输入框
        var box3d = this.sceneManager.network3d.getDataBox();
        box3d.getSelectionModel().addSelectionChangeListener(function (event) {
            var datas = event.datas;
            var node = datas.get(0);
            var nodeData = self.sceneManager.getNodeData(node);
            if (nodeData) {
                var category = self.dataManager.getCategoryForDataType(nodeData.getDataTypeId());
                if (category && category.getId() === 'rack') {
                    self._$rack.val(nodeData.getId());
                    self._lookat = nodeData.getId()
                } else {
                    self._lookat = undefined;
                }
            } else {
                self._lookat = undefined;
            }
        });

        //创建按钮
        var cbf = function (parent, id1, lb1) {
            var $row = $('<div class="row"></div>').appendTo(parent);
            var $col = $('<div class="without-padding col-md-12"></div>').appendTo($row);
            var $btn1 = $('<span id="' + id1 + '" class="base-panel-search-btn" type="submit" title="' + lb1 + '">' + lb1 + '</span>').appendTo($col);

            return [$btn1];
        }
        var btns = cbf(infoPanel, 'btnSave', it.util.i18n("LinkAdd_Confirm"));
        var $save = btns[0];
        var validate = function () {
            var data = {};
            var dataType = $deviceType.find('option:selected').val();
            if (!dataType || dataType.trim() == '') {
                ServerUtil.msg(it.util.i18n("LinkAdd_Select_model"));
                return;
            }

            var deviceId = $deviceId.val();
            if (!deviceId || deviceId.trim() == '') {
                ServerUtil.msg(it.util.i18n("LinkAdd_Input_link_ID"));
                return;
            }

            // check deviceId 是否存在
            var deviceNode = self.sceneManager.getNodeByDataOrId(deviceId);
            if (deviceNode) {
                if (self._previewNode) {
                    if (self._previewNode.getId() !== deviceNode.getId()) {
                        ServerUtil.msg(it.util.i18n("LinkAdd_link_ID_exist"));
                        return;
                    }
                } else {
                    ServerUtil.msg(it.util.i18n("LinkAdd_link_ID_exist"));
                    return;
                }
            }

            var name = $name.val();
            if (!name || name.trim() == '') {
                ServerUtil.msg(it.util.i18n("LinkAdd_Input_name"));
                return;
            }

            var rack1 = $rack1.val();
            if (!rack1) {
                ServerUtil.msg(it.util.i18n("LinkAdd_Select_from_device"));
                return;
            }

            var rack2 = $rack2.val();
            if (!rack2) {
                ServerUtil.msg(it.util.i18n("LinkAdd_Select_to_device"));
                return;
            }

            var port1 = $port1.find('option:selected').val();
            var port2 = $port2.find('option:selected').val();
            // var 
            // if (port1 && port1.trim() !== '') {
            // }
            var description = $description.val();

            return {
                fromId: rack1,
                toId: rack2,
                dataTypeId: dataType,
                id: deviceId,
                description: description,
                name: name,
                fromPortId:port1,
                toPortId:port2
            };
        }
        var clearField = function () {
            $businessType.selectpicker('val', '');//.val('');
            $deviceType.selectpicker('val', '');//.val('');
            $deviceId.val("");
            $description.val("");
            $rack.val('');
            $name.val('');
        }

        $save.click(function (event) {
            var data = validate();
            if (!data)return;

            self.save(data, clearField);


        });
        //机柜搜索条件
        var $rackPicker1 = this.$rackPicker1 = $('<div class="link-add-from-picker"></div>').appendTo(this.searPanel);
        var $header1 = $('<div class="header">'+it.util.i18n("LinkAdd_From_device")+'/div>').appendTo($rackPicker1);
        var $close1 = $('<div class="close"></div>').appendTo($header1);
        $close1.on('click', function () {

            $rackPicker1.hide();
            $rackPicker1.removeClass('on');
        })

        var $rackPicker2 = this.$rackPicker2 = $('<div class="link-add-to-picker"></div>').appendTo(this.searPanel);
        var $header2 = $('<div class="header">'+it.util.i18n("LinkAdd_To_device")+'</div>').appendTo($rackPicker2);
        var $close2 = $('<div class="close"></div>').appendTo($header2);
        $close2.on('click', function () {

            $rackPicker2.hide();
            $rackPicker2.removeClass('on');
        })

        var optPanel1 = this.optPanel1 = $('<div class="inputPane"></div>').appendTo($rackPicker1);//.css('height', '80px');
        // var $deviceType = this._$deviceType = ff(optPanel, 'txt_type', '设备类型',true);
        var $uid1 = this._$uid1 = ff(optPanel1, 'DEV_U_ID1', it.util.i18n("LinkAdd_Device_model"),true);
        $uid1.attr('type', 'select');
        var opts = self.createDeviceTypeOption();
        $.each(opts, function(index, val) {
             var opt = $('<option value='+val.id+'>'+val.desc+'</option>');
             $uid1.append(opt);
        });    
        var $searchRack1 = this._$searchRack1 = ff(optPanel1, 'r_rack1', it.util.i18n("LinkAdd_Rack_ID"));

        var optPanel2 = this.optPanel2 = $('<div class="inputPane"></div>').appendTo($rackPicker2);//.css('height', '80px');
        var $uid2 = this._$uid2 = ff(optPanel2, 'DEV_U_ID2', it.util.i18n("LinkAdd_Device_model"),true);
        $uid2.attr('type', 'select');
        opts = self.createDeviceTypeOption();
        $.each(opts, function(index, val) {
             var opt = $('<option value='+val.id+'>'+val.desc+'</option>');
             $uid2.append(opt);
        });
        var $searchRack2 = this._$searchRack2 = ff(optPanel2, 'r_rack2', it.util.i18n("LinkAdd_Rack_ID"));


        var f = function (treeView,optPanel ,paramArr) {
            // self.setData([uParam,rParam]);

            var height = self.searPanel.height() - 261 - optPanel.height();
            treeView.setTreeHeight(height || 200);
            var params = paramArr.filter(function (item) {
                return item.value != undefined && item.value != '';
            });
            self.setData(params,treeView);
        }
        // 当U数变化的时候，触发机柜查询
        var uParam1 = {key: 'dataTypeId', operation: 'like'};
        var uParam2 = {key: 'dataTypeId', operation: 'like'};
        $uid1.change(function (event) {
            console.log('u change');
            var $u = $(this),
                val = $u.val();
            uParam1.value = val;
            // self.initU();
            f(self.treeView1, self.optPanel1, [uParam1, rParam1]);
        });

        $uid2.change(function(event) {
            console.log('u change');
            var $u = $(this),
                val = $u.val();
            uParam2.value = val;
            // self.initU();
            f(self.treeView2, self.optPanel2,[uParam2 ,rParam2]);
        });

        var rParam1 = { key: 'parentId', operation: 'like' };
        var rParam2 = { key: 'parentId', operation: 'like' };
        $searchRack1.change(function(event) {
            var $rack = $(this),
                val = $rack.val();
            rParam1.value = val;
            f(self.treeView1, self.optPanel1,[uParam1, rParam1]);
        });
        $searchRack2.change(function(event) {
            var $rack = $(this),
                val = $rack.val();
            rParam2.value = val;
            f(self.treeView2, self.optPanel2,[uParam2 ,rParam2]);
        });


        if (!this.clear) {
            this.clear = function () {
                
                $deviceType.selectpicker('val', '');//.val('');
                // $deviceType2.selectpicker('val', '');//.val('');
                $deviceId.val('');
                $rack1.val('');
                $rack2.val('');
                
                $description.val('');
                $name.val('');
                $port1.val('');
                $port2.val('');
               

                $uid1.val('');
                $uid2.val('');
                $searchRack1.val('');
                $searchRack2.val('');
            }
        }
        if (!this.reset) {
            this.reset = function (data) {
                $deviceType.selectpicker('val', data.datatTypeId);//.val(data.datatTypeId);
                // $deviceType2.selectpicker('val', data.datatTypeId);//.val(data.datatTypeId);
                $deviceId.val(data.id);
                $rack1.val(data.parentId);
                $rack2.val(data.parentId);
                
            }
        }


        //符合条件的机柜,默认查询出所有有空间的机柜
        this.treeView1 = new it.TreeView(this.$rackPicker1);
        this.treeView1.setTreeHeight(200);
        this.treeView1.isSortById = function () {
            if (dataJson.sortById) {
                return true;
            } else {
                return false;
            }
        }
        this.treeView1.clickNodeFunction = function (treeData) {
            self.clickTreeNode(treeData, self.treeView1, self._$rack1, self.$rackPicker1);
            var id = treeData.id;
            var data = self.sceneManager.dataManager.getDataById(id);
            var dataTypeId = data.getDataTypeId();
            var dataType = self.sceneManager.dataManager.getDataTypeById(dataTypeId);
            var templateDatas= dataType._templateDatas;
            var i;
            var options= [{id:"",desc:it.util.i18n("LinkAdd_UnSelected")}];
            for(i=0;i<templateDatas.length;i++){
                var templateData = templateDatas[i];
                options.push({id:templateData.getId() , desc:(templateData.getDescription() || templateData.getId())});
            }
            
            self._$port1.empty();
            $.each(options, function(index, val) {
                var opt = $('<option value='+val.id+'>'+val.desc+'</option>');
                self._$port1.append(opt);
            });
        };

        this.treeView2 = new it.TreeView(this.$rackPicker2);
        this.treeView2.setTreeHeight(200);
        this.treeView2.isSortById = function () {
            if (dataJson.sortById) {
                return true;
            } else {
                return false;
            }
        }
        this.treeView2.clickNodeFunction = function (treeData) {
            self.clickTreeNode(treeData, self.treeView2, self._$rack2, self.$rackPicker2);
            var id = treeData.id;
            var data = self.sceneManager.dataManager.getDataById(id);
            var dataTypeId = data.getDataTypeId();
            var dataType = self.sceneManager.dataManager.getDataTypeById(dataTypeId);
            var templateDatas= dataType._templateDatas;
            var i;
            var options= [{id:"",desc:it.util.i18n("LinkAdd_UnSelected")}];
            for(i=0;i<templateDatas.length;i++){
                var templateData = templateDatas[i];
                options.push({id:templateData.getId() , desc:(templateData.getDescription() || templateData.getId())});
            }
            
            self._$port2.empty();
            $.each(options, function(index, val) {
                var opt = $('<option value='+val.id+'>'+val.desc+'</option>');
                self._$port2.append(opt);
            });
        };

        this.sceneManager.addSceneChangeListener(function (eve) {//场景切换
            // self.clearSearch();
        });

        // self.initU();
        self.setData([],this.treeView1);
        self.setData([],this.treeView2);
    },
    // 设置当前focus的机柜
    getFocusRack: function () {
        var self = this;
        var node = self.sceneManager.viewManager3d.getFocusNode();
        var data = self.sceneManager.getNodeData(node);
        var category = self.sceneManager.dataManager.getCategoryForData(data);
        var selectedRackId = '';
        if (category && category.getId().toLowerCase().trim() === 'rack') {
            selectedRackId = data.getId();
        }
        return selectedRackId;
    },
    clickTreeNode: function (treeData, treeView ,$rack, $rackPicker) {
        var id = treeData.id;
        if (!id) return;
        var data = this.sceneManager.dataManager.getDataById(id);
        if (!data || !treeView.isClick(data)) return;
        // var assetNode = this.sceneManager.dataNodeMap[id];
//        var nodeData = this.sceneManager.getNodeData(assetNode);

        var assetNode = this.switchFocus(data);
        this._assetNode = assetNode;
        //选中机柜后，把机柜ID设置到输入框中
        var parentData = this.sceneManager.getNodeData(assetNode);
        $rack.val(parentData.getId());

        $rackPicker.hide();
        $rackPicker.removeClass('on');
    },


    // 切换场景
    switchFocus: function (data) {
        if (!data)return;
        if (typeof data === 'string') {
            data = this.sceneManager.dataManager.getDataById(data);
            if (!data) return;
        }
        var id = data.getId();
        var assetNode = this.sceneManager.dataNodeMap[id];
        if (!this.sceneManager.isCurrentSceneInstance(data)) { //如果一下子跳到其他的场景的某个非根对象
            var sceneAndRootData = this.sceneManager.getSceneAndRootByData(data);
            if (sceneAndRootData) {
                this.sceneManager.gotoScene(sceneAndRootData.scene, sceneAndRootData.rootData);
                //如果是整个楼层的话，就不需这么lookAt了(严格意义上说是Data本身就在场景的root就不需再去设置镜头了)
                if (sceneAndRootData.rootData != data) {
                    assetNode = this.sceneManager.dataNodeMap[id];
                    if (!assetNode) {
                        this.sceneManager.loadLazyData(data);
                    }
                } else {
                    assetNode = null;
                }
            }
        }
        //注意以下两种情况：
        //1、还没有创建，如lazyable的设备，只有在focus该机柜时，它的孩子设备才会被创建(第一次)并加到box中
        //2、有可能就是存在该场景中，只是不在box中而已，如：lazyable模式下，设备都被移除掉了
        var box3d = this.sceneManager.network3d.getDataBox();
        if (!assetNode || !box3d.getDataById(assetNode.getId())) {
            this.sceneManager.loadLazyData(data);
            if (!assetNode) {
                assetNode = this.sceneManager.dataNodeMap[data.getId()];
            }
        }
        if (this.defaultEventHandler) {
            this.defaultEventHandler.lookAt(assetNode);
        }
        return assetNode;
    },

    save: function (deviceData, callback, extendData, table) {



        var self = this;
        var datas=[];
        datas.push(deviceData);

        layer.confirm(it.util.i18n("LinkAdd_Confirm_add_link")+deviceData.id+'?', {
            title: it.util.i18n("LinkAdd_Select"),
            btn: [it.util.i18n("LinkAdd_Sure"), it.util.i18n("LinkAdd_Cancel")] //按钮
        }, function (index) {
            
            ServerUtil.api('link','batchAddOrUpdate',datas,function(result){
                // var dama = self.dataManager.removeData(data,true);
                // self.setData([self.uParam,self.rParam,self.eParam]);
                var link = new it.Link(deviceData);
                self.sceneManager.dataManager.addLink(link);
                if(!link) return null;

                self.sceneManager.gcsManager.showLinkByLinkId(link,true,true);

                var fromNode = self.sceneManager.getNodeByDataOrId(link.getFromId());
                var toNode = self.sceneManager.getNodeByDataOrId(link.getToId());
                if(!fromNode || !toNode){
                    return null;
                }
                if (self.box3D.getDataById(fromNode.getId()) &&
                    self.box3D.getDataById(toNode.getId())) {
                    var linkNode = self.sceneManager.linkMap[deviceData.id];
                    self.defaultEventHandler.lookAt(linkNode);
                }
                ServerUtil.msgWithIcon(it.util.i18n("LinkAdd_Link_Added"), 6);
            }); 
        }, function (index) {
            layer.close(index);
        });

       

    },
    setData: function (conditions,treeView) {
        var results = this.deviceFinder.find(conditions);
        var treeNodes = null;
        if (!results || results.length < 1) {
            treeView.clearTreeData();
        } else {
            this.addRoot(results);
            treeNodes = this.orgTreeManager.organizeTree(results);
            treeView.setData(treeNodes, false);
        }
    },
    clearSearch : function(){
        this.treeView1.clearTreeData();
        this.treeView2.clearTreeData();
        this.sceneManager.gcsManager.clearAllLink();
        // 清除后，lookAt也得有所改变，否则旁边的虚化有些不太协调，那就lookAt整个楼层把
        var currentRootNode = this.sceneManager.getCurrentRootNode();
        if (currentRootNode) {
            this.defaultEventHandler.lookAt(currentRootNode);
        }
    },
    addRoot: function (results) {
        if (!results || results.length < 1) {
            return null;
        }
        var id = "";//this.getCurrentRootId()||"";
        var name = "";//this.getCurrentRootId()||"";
        var rootNode = this.sceneManager.getCurrentRootNode();
        var rootData = this.sceneManager.getNodeData(rootNode);
        if (rootData) {
            id = rootData.getId();
            name = rootData.getName();
        }
        var floor = new it.Link({id: id, name: name});
        results.push(floor);
    },
    getCurrentRootId: function () {
        var rootNode = this.sceneManager.getCurrentRootNode();
        if (!rootNode) return null;
        var rootData = this.sceneManager.getNodeData(rootNode);
        if (rootData) {
            return rootData.getId();
        }
        return null;
    },
    getRootView: function () {
        if (this.clear) {
            this.clear();
        }
        this.reinit();
        return this.searPanel;
    },
    reinit: function () {
        if (this._lookat) {
            var assetNode = this.sceneManager.dataNodeMap[this._lookat];
            if (this.defaultEventHandler) {
                this.defaultEventHandler.lookAt(assetNode);
            }
        }
        // 设置当前focus的机柜，给搜索的搜索框
        var selectedRackId = this.getFocusRack();
        // this._$searchRack.val(selectedRackId);
        this._$rack1.val(selectedRackId);
        this._$rack2.val(selectedRackId);

        var $dataType1 = this._$deviceType;
        // var $dataType2 = this._$deviceType2;
        var dataType1 = $dataType1.find('option:selected').val();
        // var dataType2 = $dataType2.find('option:selected').val();
        if (!dataType1) {
            return;
        }

        var dt1 = this.sceneManager.dataManager._dataTypeMap[dataType1];
        if (!dt1) {
            return;
        }

        var size1 = dt1.getSize();

        if (this.preData) {
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

it.LinkAddFinder = function (dataManager, sceneManager) {
    it.LinkAddFinder.superClass.constructor.call(this, dataManager);
    this.sceneManager = sceneManager;
};

mono.extend(it.LinkAddFinder, it.DataFinder, {
    /**
     * 重写获取数据源的方法
     */
    getDatas: function () {
        var datas = this.dataManager.getDataMapByCategory('equipment');
        var results = [];
        for (var n in datas) {
            results.push(datas[n]);
        }
        return results;
    }

});


it.LinkAddSearchPanel = function (sceneManager) {
    $ITVSearchBasePanel.call(this, sceneManager);
    // this.dataManager = dataManager;
    this.className = 'DeviceOnSearchPanel';
    this.init();
};

mono.extend(it.LinkAddSearchPanel, $ITVSearchBasePanel, {


    init: function () {

        var sdata = new it.SData('txt_type', 'select', it.util.i18n("LinkAdd_Link_model"));
        var options = this.createDeviceTypeOption();
        sdata.setKey('dataTypeId');
        sdata.setIsClient(false);
        sdata.setClient('options', options);
        this.addRow(sdata);


        sdata = new it.SData('deviceID', 'input', it.util.i18n("LinkAdd_Link_ID"));
        this.addRow(sdata);

        sdata = new it.SData('name', 'input', it.util.i18n("LinkAdd_Link_Name"));
        this.addRow(sdata);

        sdata = new it.SData('description', 'input', it.util.i18n("LinkAdd_Link_Description"));
        this.addRow(sdata);

        sdata = new it.SData('r_rack1', 'input', it.util.i18n("LinkAdd_From_device"));
        this.addRow(sdata);

        sdata = new it.SData('r_rack2', 'input', it.util.i18n("LinkAdd_To_device"));
        this.addRow(sdata);

        sdata = new it.SData('port1', 'select', it.util.i18n("LinkAdd_From_port"));
        options = this.createPort1Option();
        sdata.setKey('port1Id');
        sdata.setIsClient(false);
        sdata.setClient('options', options);
        this.addRow(sdata);

        sdata = new it.SData('port2', 'select', it.util.i18n("LinkAdd_To_port"));
        options = this.createPort2Option();
        sdata.setKey('port2Id');
        sdata.setIsClient(false);
        sdata.setClient('options', options);
        this.addRow(sdata);

    },


    createDeviceTypeOption: function () {
        var dataTypeDatas = this.dataManager._dataTypeMap;
        var options = [':'];//[':全部']; //不能叫全部了，这些值最终写到了数据库中
        if (dataTypeDatas) {
            for (var typeId in dataTypeDatas) {
                var dataType = dataTypeDatas[typeId];
                if (dataType.getCategoryId() !== 'link') {
                    continue;
                }
                if (dataType) {
                    // options.push({id:dataType.getId(), desc:(dataType.getDescription() || dataType.getId())});
                    options.push(dataType.getId() + ':' + (dataType.getDescription() || dataType.getId()));
                }
            }
            return options;
        }
        return options;
    },

    createPort1Option:function(){
        var options = [':'];
        return options;
    },

    createPort2Option:function(){
        var options = [':'];
        return options;
    }

});


