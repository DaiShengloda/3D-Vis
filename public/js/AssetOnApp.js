var $AssetOnApp = function (sceneManager) {
    $Application.call(this, sceneManager);
    // this.searchMainDiv = $('<div id="assetOn"></div>').css('height', '100%');
    this._editMode = false;
    this._result = {};
    this.sceneManager = sceneManager;
    var self = this;
    this.sceneManager.viewManager3d.isHandleDoubleClickable = function (node) {
        if (node && node.getClient('type') == 'parkSkybox') {
            return false;
        } else if (node.getClient('bid') == 'unableDBLClick') {
            if (self._addedAsset) {
                ServerUtil.msg(it.util.i18n("AssetOnApp_Save_first"));
            };
            return false;
        }
        return true;
    };

    this.assetOnCategory = dataJson.assetOnCategory||['rack', 'airCondition', 'headerRack'];
    this.parentDom = $('.dialog-box');

}

mono.extend($AssetOnApp, $Application, {

    getAssetTypeOption: function () {
        var dataTypeDatas = this.sceneManager.dataManager._dataTypes; //不直接用dataTypeMap是因为可能有很多的dataType没有对应的资产
        var options = [{
            value: '',
            content: it.util.i18n("All"),
        }];
        if (dataTypeDatas) {
            for (var typeId in dataTypeDatas) {
                var dataType = dataTypeDatas[typeId],
                    category = dataType.getCategoryId();
                if (this.assetOnCategory.indexOf(category) > -1) {
                    if (dataType) {
                        options.push({
                            value: dataType.getId(),
                            content: dataType.getDescription() || dataType.getId(),
                        });
                    }
                }
            }
            return options;
        }
        return options;
    },

    createAssetInfoPanel: function () {
        this.removeAssetInfoPanel();
        var tempAssetList = [];
        var tempAssetChangeOther = {};
        console.log(this._synAsset);
        for (var i in this._synAsset) {
            tempAssetList.push(this._synAsset[i].id);
            tempAssetChangeOther[i] = [{
                key: 'name',
                value: this._synAsset[i].name,
            }, ]
        }

        this.appPanel = $('<div>').addClass('new-app-panel').appendTo($('.new-apps-box'));
        this.appPanel.AssetOnApp({
            array: [{
                methodName: 'createTitle',
                params: {
                    title: it.util.i18n("AssetOnApp_Add_Asset"),
                }
            }, {
                methodName: 'createTextSelect',
                params: {
                    key: 'datatype',
                    class: 'AssetOn-Type',
                    text: it.util.i18n("AssetOnApp_Type"),
                    options: this.getAssetTypeOption(),
                }
            }, {
                methodName: 'createTextInput',
                params: {
                    key: 'id',
                    class: 'AssetOn-Num',
                    text: it.util.i18n("AssetOnApp_ID"),
                    placeholder: it.util.i18n("AssetOnApp_Input_ID"),
                    autoComplete: {
                        source: tempAssetList,
                        inputChangeOther: tempAssetChangeOther,
                    }
                }
            }, {
                methodName: 'createTextInput',
                params: {
                    key: 'name',
                    class: 'AssetOn-Name',
                    text: it.util.i18n("AssetOnApp_Name"),
                }
            }, {
                methodName: 'createTextInput',
                params: {
                    key: 'parent',
                    class: 'AssetOn-Parent',
                    text: it.util.i18n("AssetOnApp_Parent"),
                    attrs: {
                        'readonly': 'readonly'
                    },
                }
            }, {
                methodName: 'createTextInput',
                params: {
                    key: 'position',
                    class: 'AssetOn-Position',
                    text: it.util.i18n("AssetOnApp_Position"),
                }
            }, {
                methodName: 'createTextInput',
                params: {
                    key: 'location',
                    class: 'AssetOn-Location',
                    text: it.util.i18n("AssetOnApp_Location"),
                }
            }, {
                methodName: 'createTextInput',
                params: {
                    key: 'rotation',
                    class: 'AssetOn-Rotation',
                    text: it.util.i18n("AssetOnApp_Rotation"),
                }
            }, {
                methodName: 'createButtons',
                params: [{
                    class: 'remake-it active',
                    text: it.util.i18n("AssetOnApp_Edit_Mode"),
                }, {
                    class: 'cancer-it',
                    text: it.util.i18n("AssetOnApp_Clear"),
                }, {
                    class: 'confirm-it',
                    text: it.util.i18n("AssetOnApp_Confirm"),
                }]
            }, ],
        })

        var self = this;
        var updateNode = function (prop, val) {
            if (!self._addedAsset) return;
            if (val.indexOf('x') != -1 || val.indexOf('y') != -1 || val.indexOf('z') != -1) {
                if (typeof (val) == 'string') {
                    val = JSON.parse(val)
                };
                if (prop === 'position') {
                    self._addedAsset.setPosition(new mono.Vec3(val.x, val.y, val.z));
                } else if (prop === 'rotation') {
                    self._addedAsset.setRotation(new mono.Vec3(val.x, val.y, val.z));
                }
            }
        }

        var inputBox = this.appPanel.AssetOnApp('getInputBox');
        var selectBox = this.appPanel.AssetOnApp('getSelectBox');

        this.$dataTypeId = selectBox['datatype'];
        this.$deviceId = inputBox['id'];
        this.$deviceName = inputBox['name'];
        this.$parentId = inputBox['parent'];
        this.$position = inputBox['position'];
        this.$location = inputBox['location'];
        this.$rotation = inputBox['rotation'];

        this.paramsBox = [this.$dataTypeId, this.$deviceId, this.$deviceName, this.$parentId, this.$position, this.$location, this.$rotation];
        this.$position.change('position', function () {
            var val = $(this).val();
            updateNode('position', val);
        });
        this.$rotation.change('rotation', function () {
            var val = $(this).val();
            updateNode('rotation', val);
        });
        this.$dataTypeId.on('hidden.bs.select', function () {
            self._result.dataTypeId = $(this).val();
        })

        this.initBtnHandle();
        this.initInputHandle();

        var $deviceId = this.$deviceId;
    },

    removeAssetInfoPanel: function () {
        if (this.appPanel) {
            this.appPanel.AssetOnApp('destory');
            this.appPanel = null;
        }
    },

    getFormValues: function () {
        var results = {};
        results.dataTypeId = this.$dataTypeId.val();
        results.id = this.$deviceId.val();
        results.name = this.$deviceName.val();
        results.parentId = this.$parentId.val();
        results.position = this.$position.val();
        results.location = this.$location.val();
        results.rotation = this.$rotation.val();
        return results;
    },

    clearFormValues: function () {
        $.each(this.paramsBox, function () {
            this.val('');
        })
        this.$dataTypeId.selectpicker("refresh");
    },

    initInputHandle: function () {
        var self = this;
        this.$deviceId.bind('input propertychange', function () {
            var value = $(this).val();
            var data = self.sceneManager.dataManager.getDataById(value);
            if (data) {
                ServerUtil.msg(value + it.util.i18n("AssetOnApp_ID_exist"));
            }
        });
    },

    initBtnHandle: function () {
        var self = this;
        var validate = function () {
            var result = self.getFormValues();
            var assetId = result.id;
            // 是否为需要同步的资产
            var synA = self._synAsset[assetId];
            result.isSyn = !!synA;
            // if(synA && synA.description){
            //     result.description = synA.description;
            // }

            if (!assetId || assetId.trim() == '') {
                ServerUtil.msg(it.util.i18n("AssetOnApp_Input_ID"));
                return;
            }
            // check assetId 是否存在
            var assetNode;
            assetNode = self.sceneManager.getNodeByDataOrId(assetId);
            if (!assetNode) {
                var assetData = self.sceneManager.dataManager.getDataById(assetId);
                if (assetData) {
                    self.sceneManager.loadDataModel(assetData);
                    assetNode = self.sceneManager.getNodeByDataOrId(assetId);
                }
            }
            if (assetNode) {
                if (self._addedAsset) {
                    var tempNode = self._addedAssetParent ? self._addedAssetParent : self._addedAsset;
                    if (tempNode.getId() !== assetNode.getId()) {
                        ServerUtil.msg(it.util.i18n("AssetOnApp_ID_exist"));
                        return;
                    }
                } else {
                    ServerUtil.msg(it.util.i18n("AssetOnApp_ID_exist"));
                    return;
                }
            }
            if (!result.dataTypeId) {
                ServerUtil.msg(it.util.i18n("AssetOnApp_Select_type"));
                return;
            }
            if (!result.name) {
                ServerUtil.msg(it.util.i18n("AssetOnApp_Input_name"));
                return;
            }
            return result;
        }

        var btnPreview = $('.asset-on-panel .remake-it');
        var btnClear = $('.asset-on-panel .cancer-it');
        var btnSave = $('.asset-on-panel .confirm-it');
        this.btnClear = btnClear;
        btnPreview.on('mouseenter', function (event) {
            layer.tips(it.util.i18n("AssetOnApp_Click_to_create_asset"), btnPreview, {
                tips: [3, '#356f87'],
                time: 1000
            });
        });
        btnPreview.click(function (tbn) {
            if (!$(this).hasClass('active')) return;
            if (self.$tempAssetList) {
                self.$tempAssetList.toggleClass('on');
                self.$tempAssetList.hide();
            }
            var result = validate();
            if (!result) return;
            self._result = result;
            self.toggleEditMode();
            btnPreview.removeClass('active');
            btnClear.addClass('active');
            btnSave.addClass('active');
        });
        btnClear.click(function (tbn) {
            if (!$(this).hasClass('active')) return;
            if (self.appPop) {
                self.appPop.remove();
                self.appPop = null;
            }
            self.sceneManager.removeDataNodeByDataOrId(self._result.id);
            self._addedAsset = undefined;
            self.toggleEditMode();
            // btns.changeBtnState();
            btnPreview.addClass('active');
            btnClear.removeClass('active');
            btnSave.removeClass('active');
            // self._fields.clear(['parentId','position','location','rotation']);
            self.$parentId.val('');
            self.$position.val('');
            self.$location.val('');
            self.$rotation.val('');
        });
        btnSave.click(function (tbn) {
            if (!$(this).hasClass('active')) return;
            if (!self.isCreateAsset) {
                ServerUtil.msg('资产未创建');
                return;
            }
            var result = validate();
            if (!result) return;
            self._result = result;
            var callback = function () {
                self.toggleEditMode();
                // btns.changeBtnState();
                btnPreview.addClass('active');
                btnClear.removeClass('active');
                btnSave.removeClass('active');
                // self._fields.clear();
                // self.clearFormValues();
                setTimeout(function () {
                    self.clearFormValues();
                    self._result = {};
                }, 100)
            }
            self.getExtendField(function (fields, table) {
                if (fields && fields.length) {
                    // console.log(fields);
                    function doConfirm() {
                        // console.log(fields);
                        var extendData = self.appPop.AssetOnPop('getAllValue');
                        for (var i = 0; i < fields.length; i++) {
                            if (fields[i].require) {
                                if (extendData[fields[i].id] == '') {
                                    ServerUtil.msg(fields[i].displayName || it.util.i18n(fields[i].id) + '不能为空');
                                    return;
                                }
                            }
                        }
                        extendData.id = self._result.id;
                        extendData['_table'] = table;
                        self._result.customField = extendData;
                        self.save(self._result, callback);
                        if (self.appPop) {
                            self.appPop.remove();
                            self.appPop = null;
                        }
                    }

                    // console.log(fields);
                    var array = [];
                    for (var i = 0; i < fields.length; i++) {
                        array.push({
                            methodName: 'createTextInput',
                            params: {
                                key: fields[i].id,
                                class: 'AssetOn-Pop-' + fields[i].id,
                                text: fields[i].displayName || it.util.i18n(fields[i].id),
                                inputText: self._synAsset[self.$deviceId.val()]?self._synAsset[self.$deviceId.val()].extend[fields[i].id]:'',
                            }
                        })
                    }
                    array.push({
                        methodName: 'createButtons',
                        params: [{
                            class: 'confirm-it active',
                            text: it.util.i18n("AssetOnApp_Confirm"),
                            trigger: 'doConfirm',
                        }, ]
                    })

                    self.appPop = $('<div>').addClass('new-app-panel').appendTo(self.parentDom);
                    self.appPop.AssetOnPop({
                        array: array,
                        doConfirm: doConfirm,
                    });

                    self.appPop.dialog({
                        appendTo: ".dialog-box",
                        dialogClass: 'new-dialog1',
                        blackStyle: true,
                        width: '300px',
                        height: 'auto',
                        maxHeight: 400,
                        title: it.util.i18n("AssetOnApp_More_info"),
                        autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
                        show: '', //显示弹窗出现的效果，slide为滑动效果
                        hide: '', //显示窗口消失的效果，explode为爆炸效果
                        resizable: false, //设置是否可拉动弹窗的大小，默认为true
                        position: {
                            my: "center center",
                            at: "center center",
                        },
                        modal: false, //是否有遮罩模型
                    });
                    self.appPop.dialog('open');
                    self.appPop.on('dialogclose', function () {
                        if (self.appPop) {
                            self.appPop.remove();
                            self.appPop = null;
                        }
                    });
                } else {
                    self.save(self._result, callback);
                }
            });
        });
    },
    save: function (result, callback) {
        var self = this;
        if (result.rotation) {
            if (typeof (result.rotation) == "string") {
                result.rotation = JSON.parse(result.rotation);
            }
            //转换成角度
            result.rotation.x = result.rotation.x * 180 / Math.PI;
            result.rotation.y = result.rotation.y * 180 / Math.PI;
            result.rotation.z = result.rotation.z * 180 / Math.PI;
        } else {
            result.rotation = {
                x: "0",
                y: "0",
                z: "0"
            };
        }
        result.rotation = JSON.stringify(result.rotation);

        // 把假机柜直接移除掉，否则机柜的node上的data不会实时更新 2017.12.28 add by lyz
        this.sceneManager.removeDataNodeByDataOrId(result.id);

        it.util.apiWithPush('add', result, function (result) {
            // 靠推送来添加到data中，不然会重复添加，会出现id重复错误
            self._addedAsset.s({
                'm.ambient': self._oldAmbient || 'white',
            });
            //当推送成功后把假机柜的旋转设为0
            if (self._addedAssetParent) {
                self._addedAsset.setRotation(0, 0, 0);
                self._addedAssetParent = undefined;
            }
            self.setClientBid(self._addedAsset, null);
            self._addedAsset = undefined;
            self._result = undefined;

            if (callback) {
                callback();
            }
            // ServerUtil.msgWithIcon(it.util.i18n("AssetOnApp_Save_success"), 6);
            ServerUtil.msg(it.util.i18n("AssetOnApp_Save_success"));

        }, function (error) {
            ServerUtil.msgWithIcon(error.message || error);
        });
    },
    createAsset: function (parent, parentData, position) {
        var self = this;
        if (this._addedAsset) {
            ServerUtil.msg(it.util.i18n("AssetOnApp_Save_first"));
            return;
        }
        var result = this._result,
            id = result.id;
        var asset = new it.Data({
            id: id,
            dataTypeId: result.dataTypeId,
            parentId: parentData.getId(),
            name: result.name
        });

        // 将父亲和位置同步到输入框中，用于保存
        // var fields = this._fields;
        // fields.set('parentId', parentData.getId());
        // fields.set('position', position);
        // fields.set('location', {y:'neg_neg'});

        this.cliPosition = position;
        asset.setPosition(position);
        asset.setLocation(new it.Location({
            y: 'neg_neg'
        }));


        this.sceneManager.loadDataModel(asset);
        this.sceneManager.setParentRelationShip(asset);
        this.sceneManager.translatePosition(asset);
        var assetNode = this.sceneManager.getNodeByDataOrId(id);
        if (!assetNode) {
            ServerUtil.msg(it.util.i18n("模型资源文件不存在"));
            return;
        }
        this.isCreateAsset = true;

        this.$parentId.val(parentData.getId());
        this.$position.val(JSON.stringify(position));
        this.$location.val(JSON.stringify({
            y: 'neg_neg'
        }));

        assetNode.setRotation(0, 0, 0); // 初始化旋转

        var simpleNode = assetNode.getClient('simpleNode');
        if (simpleNode) {
            this._addedAssetParent = assetNode;
            assetNode = simpleNode;
        }
        this._oldAmbient = assetNode.getStyle('m.ambient');
        assetNode.s({
            'm.ambient': 'green',
        });
        //属性变化后，将值同步到输入框中

        assetNode.addPropertyChangeListener(function (event) {
            self.handlerChangeListene(event);
        });
        this._addedAsset = assetNode;
        this.setClientBid(this._addedAsset, 'unableDBLClick');
    },
    setClientBid: function (node, value) {
        node.setClient('bid', value);
        var children = node.getDescendants();
        if (!children.length) return;
        children.forEach(function (child) {
            child.setClient('bid', value);
        });
    },
    handlerChangeListene: function (event) {
        var newValue = {};
        var property = event.property;
        if (property === 'position') {
            newValue = {
                x: event.newValue.x + this.cliPosition.x,
                y: event.newValue.y + this.cliPosition.y,
                z: event.newValue.z + this.cliPosition.z
            };
            this.$position.val(JSON.stringify(newValue));
            this._result.position = newValue;
        } else if (property === 'rotation') {
            this.$rotation.val(JSON.stringify(event.newValue));
            this._result.rotation = event.newValue;
        };
    },
    toggleEditMode: function () {
        var self = this;
        this._editMode = !this._editMode;
        var network = this.sceneManager.network3d;
        // 切换交互模式，关键在是否有编辑模式
        if (this._oldInteractions) {
            network.setInteractions(this._oldInteractions);
            delete this._oldInteractions;
            if (main.sceneManager.network3d._oldSelectTransparencyThreshold) {
                main.sceneManager.network3d.setSelectTransparencyThreshold(main.sceneManager.network3d._oldSelectTransparencyThreshold);
            }
        } else {
            this._oldInteractions = network.getInteractions();
            network.setInteractions([
                new mono.DefaultInteraction(network),
                new mono.SelectionInteraction(network),
                new mono.EditInteraction(network)
            ]);
            main.sceneManager.network3d._oldSelectTransparencyThreshold = main.sceneManager.network3d._selectTransparencyThreshold
            main.sceneManager.network3d.setSelectTransparencyThreshold(0.01);
        }
        var vm = this.sceneManager.viewManager3d;
        // var deHander = vm.getDefaultEventHandler();
        // 双击区域空白地方的时候，是否移动镜头
        // if(this._oldFollowFun){
        // 	deHander.isFollow = this._oldFollowFun;
        // 	delete this._oldFollowFun;
        // } else {
        // 	this._oldFollowFun = deHander.isFollow;
        // 	deHander.isFollow = function(){return false;}
        // }
        // 添加新的eventHandle，拦截dblClick事件，双击区域空白处时，创建资产
        if (this._eventHandle) {
            vm.removeEventHandler(this._eventHandle);
            delete this._eventHandle;
        } else {
            this._eventHandle = new it.AssetOnEventHandle(this.sceneManager, this);
            vm.addEventHandler(this._eventHandle, 1);
        }
        var network = this.sceneManager.network3d;
        // var ids = ['dataTypeId','id','name'];
        if (this._editMode) {
            // 启用编辑模式时，更改相关设置
            // 相关字段只读
            // this._fields.readonly(ids, true);
            // $.each(this.paramsBox, function(){
            // 	this.attr('readonly', 'readonly');
            // })
            this.$dataTypeId.prop('disabled', false);
            this.$dataTypeId.selectpicker("refresh");
            this.$deviceId.attr('readonly', 'readonly');
            this.$deviceName.attr('readonly', 'readonly');
            this.$location.attr('readonly', 'readonly');
            // 添加编辑过滤方法
            network._oldEditable = network.editable;
            network.editable = function (intersect) {
                var node = intersect.element;
                if (node === self._addedAsset) {
                    return true;
                } else {
                    var nId = node.getClient('it_data_id');
                    var addedId = self._addedAsset ? self._addedAsset.getClient('it_data_id') : '';
                    if (nId && addedId && nId === addedId) {
                        return true;
                    }
                }
                return false;
            }
        } else {
            // 取消编辑模式时，更改相关设置
            // 恢复可写
            // this._fields.readonly(ids);
            // $.each(this.paramsBox, function(){
            // 	this.removeAttr('readonly');
            // })
            // this.$parentId.attr('readonly', 'readonly');
            this.$dataTypeId.prop('disabled', false);
            this.$dataTypeId.selectpicker("refresh");
            this.$deviceId.removeAttr('readonly');
            this.$deviceName.removeAttr('readonly');
            this.$location.removeAttr('readonly');
            // 删除编辑过滤方法
            // network.editableFunction = undefined;
            network.editable = network._oldEditable;
        }

    },

    doShow: function () {
        this.getSynchAssets();
    },
    doClear: function () {
        this.btnClear&&this.btnClear.trigger('click');
        this.isCreateAsset = false;
        if (this.appPop) {
            this.appPop.remove();
            this.appPop = null;
        }
        this._synAsset = {};
        this.removeAssetInfoPanel();
    },
    getExtendField: function (callback) {
        var self = this,
            categoryId = this.sceneManager.dataManager.getDataTypeById(this._result.dataTypeId);
        ServerUtil.api('data', 'findCustomColumnsByCategoryId', {
            'categoryId': categoryId.getCategoryId()
        }, function (data) {
            if (!data || !data.length) {
                if (callback) callback();
                return;
            }
            var fields = [],
                type, colType;
            $.each(data, function (index, val) {
                type = 'text';
                colType = val['column_type'];
                if (colType === 'BOOLEAN') {
                    type = 'checkbox';
                } else if (colType === 'INTEGER' || colType === 'DECIMAL') {
                    type = 'number';
                } else if (colType === 'DATE' || colType === 'DATEONLY') {
                    type = 'date';
                }
                fields.push({
                    id: val['column_name'],
                    type: type,
                    require: val['column_allow_null'],
                    displayName: val['column_display_name']
                });
            });
            var table = data[0]['table_name'];
            if (callback) callback(fields, table);
        });
    },

    getSynchAssets: function () {
        var self = this;
        this._synAsset = {};
        // 获取需要同步的设备
        ServerUtil.api('temp_asset', 'search', {
            isEquipment: false
        }, function (assets) {
            // var ids = [];
            if (assets && assets.length > 0) {
                assets.forEach(function (asset) {
                    self._synAsset[asset.id] = asset;
                });
            }
            self.createAssetInfoPanel();
        });
    }
});
it.AssetOnApp = $AssetOnApp;


it.AssetOnEventHandle = function (sceneManager, app) {
    it.EventHandler.call(this);
    this.sceneManager = sceneManager;
    this.dataManager = this.sceneManager.dataManager;
    this.app = app;
}

mono.extend(it.AssetOnEventHandle, it.EventHandler, {
    shouldHandleDoubleClickElement: function (node, network, data, event) {
        var category = this.dataManager.getCategoryForDataType(data.getDataTypeId());
        if (category && (category.getId() === 'floor' || category.getId() === 'room')) {
            return true;
        }
        return false;
    },
    handleDoubleClickElement: function (node, network, data, event) {
        var p = event.point,
            pp = node.getPosition();
        var pos = {
            x: p.x - pp.x,
            y: pp.y,
            z: p.z - pp.z
        };
        this.app.createAsset(node, data, pos);
    }
});