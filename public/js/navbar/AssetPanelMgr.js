// model(function) Application
fa = {};

var $AssetPanelMgr = function (sceneManager) {
    this.itemMap = {};
    this.sceneManager = sceneManager;
    this.initConfig = false;
};

mono.extend($AssetPanelMgr, Object, {

    init: function () {
        var self = this;
        // this.appManager = new fa.AppManager(this.sceneManager);
        this.appManager = main.navBarManager.appManager
        this.sceneManager.addSceneChangeListener(this.sceneChangeHandler, this);
        this.sceneManager.viewManager3d.defaultEventHandler.addAfterLookFinishedAtListener(this.focusChangeListener, this);
        this.sceneManager.getAlarmManager().addAlarmManagerChangeListener(this.alarmManagerHandler, this);
        this.sceneManager.getAlarmManager().addAlarmPropertyChangeListener(this.alarmManagerHandler, this);
        
    },
    getConfig: function (sceneId) {
        var self = this;
        var colors = ["rgba(0, 115, 170, 1)", "rgba(0, 158, 236, 1)", "rgba(100, 205, 247, 1)"],
            i = 0;
        var am = main.sceneManager.getAlarmManager();
        var am_types = am._alarmTypeMap;
        this.warningsParam = this.createWarningsParam();
        this.warningsParam.alarmLevels = [];
        this.warningsParam.warningClassify = [];
        for (var p in am_types) {
            this.warningsParam.warningClassify.push({
                label: am_types[p]._name,
                type: am_types[p]._id,
                number: 0,
                color: colors[i],
            });
            i = colors[++i] ? i : 0;
        }
        //获取30天内的类型报警数
        ServerUtil.api('alarm_log', 'alarmCountGroupByType', { offset: -30 }, function (datas) {
            //把30天报警数传递给接口数据
            var warningClassify = self.warningsParam.warningClassify;
            self.warningsParam.typeAlarm_log = datas;
            datas.forEach(function(item){
                for(var i=0;i<warningClassify.length;i++){
                    if(warningClassify[i]['label'] == item['name']){
                        self.warningsParam.warningClassify[i]['number'] = item['value'];
                    }
                }
            });
        });
        // ServerUtil.api('alarm_severity', 'search', {
        //     where: {},
        //     order: [
        //         ['value', 'asc']
        //     ]
        // }, function (data) {
        //     data.sort(function (a, b) {
        //         return b.value - a.value;
        //     })
        //     data.forEach(function (c) {
        //         if (c.id == 'cleared') return
        //         self.warningsParam.alarmLevels.push({
        //             name: c.displayName,
        //             level: c.id,
        //             color: c.color,
        //             icon: 'warningInfo_gantanhao',
        //             number: 0,
        //         });
        //     })
        //     self.initView();
        //     self.showBySceneId(sceneId);
        // });

        it.AlarmSeverity.severities._as.sort(function (a, b) {
            return b.value - a.value;
        });
        it.AlarmSeverity.severities._as.forEach(function (c) {
            if (c.name == 'cleared') return
            self.warningsParam.alarmLevels.push({
                name: c.displayName,
                level: c.name,
                color: c.color,
                icon: 'warningInfo_gantanhao',
                number: 0,
            });
        });
        self.initView();
        self.showBySceneId(sceneId);
    },
    refresh: function () {
        if ($(".assetInfo .bt-arrow").hasClass('bt-arrow-open')) {
            $(".assetInfo .bt-arrow").removeClass('bt-arrow-open');
            $(".assetInfo-content").hide();
        }
        if ($('.warningInfo .bt-arrow').hasClass('bt-arrow-open')) {
            $('.warningInfo .bt-arrow').removeClass('bt-arrow-open');
            $('.warningInfoDetail').hide();
            var attr = $('#itv-pdf-view').css('display'),
                width = 0;
            if (attr == 'none') {
                width = 0;
            }else {
                width = $('#itv-pdf-view').width() || 0;
            }
            $('.floor-box').css({
                'right': width+10
            });

        }
    },
    sceneChangeHandler: function (e) {
        if (e.kind != 'changeScene') return;
        this.refresh();
        var rootData = e.rootData;
        if (!rootData) return;
        var scene = e.data;
        var sceneId = scene.getId();
        this.sceneId = sceneId;
        var oldScene = e.oldData;
        var oldSceneCategoryId;
        if (oldScene) {
            oldSceneCategoryId = oldScene.getCategoryId();
        };
        var sceneCategoryId = scene.getCategoryId();
        if (!this.initConfig) {
            this.initConfig = true;
        this.getConfig(sceneId);
        } else {
            this.showBySceneId(sceneId, oldSceneCategoryId);
        }
    },
    showBySceneId: function (sceneId, oldSceneCategoryId) {
        var self = this;
        if (!this.$box) {
            setTimeout(function () {
                self.showBySceneId(sceneId, oldSceneCategoryId)
            }, 1000);
            return
        }

        if (sceneId == 'earth') {
            this.$box.hide();
        } else {
            if (oldSceneCategoryId == 'earth') {
                this.$box.hide();
                return;
            }
            //显示面板
            this.$box.show();

            self.showWarningsInfo(sceneId);
            var rootData = main.sceneManager._currentRootNode;
            self.showFocusNodeInfo(rootData);
            // self.showSceneAsset(sceneId);
        }
    },
    showWarningsInfo: function (sceneId) { //警告面板相应数据
        var self = this;
        self.warningsParam.items = [];
        var rootData = main.sceneManager._currentRootData;
        var rootDataId = rootData.getId();
        var alarmManager = main.sceneManager.getAlarmManager();
        var alarms = alarmManager.getAlarms();
        if (alarms) {
            self.warningsParam.items = alarms.toArray();
        }
        //  拿到所有场景data的告警，但拿不到传感器的告警，还需遍历传感器，判断传感器的父亲是否在当前场景，添加传感器告警
        // 不再遍历当前楼层告警
        // var getDescendantsAlarms = function (data) {
        //     var warnings = alarmManager.getAlarmsByDataOrId(data);
        //     if (warnings) {
        //         self.warningsParam.items = self.warningsParam.items.concat(warnings.toArray());
        //     }
        //     if (data.getChildren()) {
        //         data.getChildren().forEach(function (c) {
        //             getDescendantsAlarms(c);
        //         })
        //     }
        // }
        // var collects = main.sceneManager.dataManager._collectors;
        // for (var p in collects) {
        //     var collect = collects[p],
        //         collectParentId = collect.getParentId();
        //     if (main.sceneManager.isAncestor(collectParentId, rootDataId) || collectParentId == rootDataId) {
        //         var collectId = collect.getId(),
        //             collectWarnings = alarmManager.getAlarmsByDataOrId(collectId);
        //         if (collectWarnings) {
        //             self.warningsParam.items = self.warningsParam.items.concat(collectWarnings.toArray());
        //         }
        //     }
        // }
        // getDescendantsAlarms(rootData);
        self.$warningsBox.warningInfo('option', 'items', self.warningsParam.items);
    },
    // showSceneAsset: function (sceneId) {
    //     $('.assetInfo_item_asset .bt-item').css('width', '50%');
    //     $('.assetInfo_item_asset .bt-label').css('width', '50%');
    //     var self = this;
    //     var rootData = main.sceneManager._currentRootData;
    //     //资产信息面板相应数据
    //     var childrenDatas = main.sceneManager.dataManager.getDescendants(rootData);
    //     self.assetInfoParam.asset = [];
    //     // self.assetInfoParam.state = [];
    //     childrenDatas.forEach(function (c) {
    //         var exist = false;
    //         var category = main.sceneManager.dataManager.getCategoryForData(c);

    //         var categoryId = category.getId(),
    //             categoryDes = category.getDescription();
    //         if (categoryDes) {
    //             categoryDes = categoryDes.toUpperCase();
    //         }
    //         self.assetInfoParam.asset.forEach(function (item) {
    //             if (item.label == categoryDes) {
    //                 item.value++;
    //                 exist = true;
    //             }
    //         })
    //         if (!exist && categoryDes && category.getUserData('searchFilter') && self.assetInfoParam.asset.length < 6) {
    //             self.assetInfoParam.asset.push({
    //                 label: categoryDes,
    //                 value: 1
    //             })
    //             // self.assetInfoParam.state.push({
    //             //     label: categoryDes,
    //             //     normal: 0,
    //             //     abnormal: 0
    //             // })
    //         }
    //         // self.assetInfoParam.state.forEach(function (item) {
    //         //     if (item.label == categoryDes) {
    //         //         if (alarmManager.getAlarmsByDataOrId(c)) {
    //         //             item.abnormal++;
    //         //         } else {
    //         //             item.normal++;
    //         //         }
    //         //     }
    //         // })
    //     })
    //     self.$assetInfoBox.assetInfo('option', 'asset', self.assetInfoParam.asset);
    //     // self.$assetInfoBox.assetInfo('option', 'state', self.assetInfoParam.state);
    // },
    getCountData: function (categoryId, rootData) {
        var value = 0;
        var childrenDatas = main.sceneManager.dataManager.getDescendants(rootData);
        childrenDatas.forEach(function (c) {
            var cCategory = main.sceneManager.dataManager.getCategoryForData(c);
            var cId = cCategory.getId();
            if (cId == categoryId) {
                value++;
            }
        })
        return value;
    },
    focusChangeListener: function (mainNode, node) {
        this.showFocusNodeInfo(mainNode || node);
    },
    showFocusNodeInfo: function (dataNode) {
        var self = this;
        if (!dataNode) {
            dataNode = main.sceneManager.viewManager3d.getFocusNode() || this.sceneManager.getCurrentRootNode();
        }
        var data = main.sceneManager.getNodeData(dataNode);
        var category = main.sceneManager.dataManager.getCategoryForData(data).getId();
        self.assetInfoParam.asset = [];
        if (main.proDialog.propertyManager.dataInfoRule[category]) {
            var info = main.proDialog.propertyManager.getGeneralInfo(dataNode);
            for (var l in info.properties) {
                if (info.properties[l].origin == 'count') {
                    var value = self.getCountData(info.properties[l].value, data);
                    info.properties[l].value = value;
                }
                self.assetInfoParam.asset.push({
                    label: l,
                    value: info.properties[l].value
                });

            }
        }
        if (!self.$assetInfoBox || !self.$assetInfoBox.assetInfo) return;
        self.$assetInfoBox.assetInfo('option', 'asset', self.assetInfoParam.asset);
        // if (category == 'floor' || category == 'building' || category == 'dataCenter' || category == 'earth') {
        //     var sceneId = main.sceneManager._currentRootData.getId();
        //     self.showSceneAsset(sceneId);
        //     return;
        // }
        if (category == 'floor' || category == 'building' || category == 'dataCenter' || category == 'earth') {
            $('.assetInfo_item_asset .bt-item').css('width', '50%');
            $('.assetInfo_item_asset .bt-label').css('width', '50%');
        } else {
            $('.assetInfo_item_asset .bt-item').css('width', '100%');
            $('.assetInfo_item_asset .bt-label').css('width', '30%');
        }
    },
    alarmManagerHandler: function (e) {
         //判断改变的报警是否是30天内的，如果是则触发另外的事件
         ServerUtil.api('alarm_log', 'alarmCountGroupByType', { offset: -30 }, function (datas) {
            //和上次30天报警的数据比较
            var warningClassify = self.warningsParam.warningClassify;
            if(warningClassify != datas){
                self.warningsParam.typeAlarm_log = datas;
                datas.forEach(function(item){
                    for(var i=0;i<warningClassify.length;i++){
                        if(warningClassify[i]['label'] == item['name']){
                            self.warningsParam.warningClassify[i]['number'] = item['value'];
                        }
                    }
                });
                //给子组件传递新数据
                $('.warningInfoDetail').warningInfoDetail('warningClassifyChange',self.warningsParam.warningClassify);
            }
        });
        var self = this;
        if (self.sceneId == 'earth') {
            return;
        } else {
            var rootData = main.sceneManager._currentRootData;
            var rootDataId = rootData.getId();
            var alarm = e.data || e.source;
            var dataId = alarm._dataId;
            if (!main.sceneManager.isAncestor(dataId, rootDataId)) {
                var collect = main.sceneManager.dataManager.getCollectorById(dataId);
                if (collect) {
                    var collectParentId = collect.getParentId();
                    if (!main.sceneManager.isAncestor(collectParentId, rootDataId) && collectParentId != rootDataId) {
                        return
                    }
                } else {
                    return;
                }
            }
            if (e.kind == 'remove') {
                self.$warningsBox.warningInfo('itemChange', 'sub', e.data);
            } else if (e.kind == 'add') {
                self.$warningsBox.warningInfo('itemChange', 'add', e.data);
            } else if (e.newValue && e.oldValue) {
                e.source['_' + e.property] = e.oldValue;
                self.$warningsBox.warningInfo('itemChange', 'sub', e.source);
                e.source['_' + e.property] = e.newValue;
                self.$warningsBox.warningInfo('itemChange', 'add', e.source);
            }
           
        }
    },
    initView: function () {
        var self = this;
        var $box = this.$box = $('<div></div>').addClass('infoPanel').appendTo($('.view-control')).hide().css({ 'position': 'absolute', 'top': '0', 'right': '0' });
        var $warningsBox = self.$warningsBox = $('<div></div>').appendTo($box).warningInfo({
            items: self.warningsParam.items,
            btns: self.warningsParam.btns,
            alarmLevels: self.warningsParam.alarmLevels,
            warningClassify: self.warningsParam.warningClassify,
            currentBtns: self.warningsParam.currentBtns,
        });
        if (dataJson.removeWarningsBox) {
            self.$warningsBox.hide();
        }
        var $assetInfoBox = self.$assetInfoBox = $('<div></div>').appendTo($box).assetInfo({});
        self.assetInfoParam = self.createAssetInfoParam();
        $assetInfoBox.assetInfo('option', 'state', self.assetInfoParam.state);
        $assetInfoBox.assetInfo('option', 'pue', self.assetInfoParam.pue);
        $assetInfoBox.assetInfo('option', 'capacity', self.assetInfoParam.capacity);
        $assetInfoBox.assetInfo('option', 'asset', self.assetInfoParam.asset);
        if (dataJson.removeAssetInfoBox) {
            self.$assetInfoBox.hide();
        }
    },
    hide: function () {
        this.$box.hide();
    },
    show: function () {
        this.$box.show();
    },
    createAssetInfoParam: function() {
        var  assetInfoParam = {
            state: [{ label: 'PDU', normal: 200, abnormal: 10 }, { label: 'UPS', normal: 12, abnormal: 22 }, { label: it.util.i18n("AssetInfo_Air_Conditioning"), normal: 23, abnormal: 12 }, { label: it.util.i18n("AssetInfo_Business_Cabinets"), normal: 23, abnormal: 12 }],
            pue: 2,
            capacity: [{ label: it.util.i18n("AssetInfo_Power_Distribution"), value: 1232, total: 2000, unit: '(kw)' }, { label: it.util.i18n("AssetInfo_Refrigeration"), value: 15.77, total: 60, unit: '(kw)' }, { label: it.util.i18n("AssetInfo_Heating"), value: 956, total: 2600, unit: '' }],
            asset: [{ label: it.util.i18n("AssetInfo_Machine_Room"), value: 1 }, { label: it.util.i18n("AssetInfo_Air_Conditioning"), value: 2 }, { label: it.util.i18n("AssetInfo_Rack"), value: 3 }, { label: it.util.i18n("AssetInfo_Battery_Pack"), value: 4 }, { label: it.util.i18n("AssetInfo_PDC"), value: 5 }, { label: it.util.i18n("AssetInfo_Electric_Generator"), value: 2 }, { label: 'UPS', value: 120 }],
    
        };
        return assetInfoParam;
    },
    createWarningsParam: function() {
        var warningsParam = {
            items: [],
            currentBtns: [
                {
                    label: it.util.i18n("ClientAlarmManager_Check_Current_Alarms"),
                    event: function () {
                        main.clientAlarmManager.showAlarmTable();
                    }
                },
            ],
            btns: [
                {
                    label: it.util.i18n("ClientAlarmManager_Check_All_Alarms"),
                    event: function () {
                        main.clientAlarmManager.showAlarmLogDialog();
                    }
                },
                {
                    label:  it.util.i18n("ClientAlarmManager_Alarm_Detailed_Statistics"),
                    event: function () {
                        main.warningStatisticsMgr.show();
                    }
                }
            ],
            alarmLevels: [
                // {
                //     name: '严重警告',
                //     level: 'critical',
                //     color: "rgba(255, 0, 0, 1)",
                //     icon: 'warningInfo_gantanhao',
                //     number: 0,
                // }, {
                //     name: '重要警告',
                //     level: 'major',
                //     color: "rgba(250, 140, 0, 1)",
                //     icon: 'warningInfo_gantanhao',
                //     number: 0,
                // }, {
                //     name: '次要警告',
                //     level: 'minor',
                //     color: "rgba(225, 225, 0, 1)",
                //     icon: 'warningInfo_gantanhao',
                //     number: 0,
                // }, {
                //     name: '提示警告',
                //     level: 'indeterminate',
                //     color: "rgba(0, 226, 0, 1)",
                //     icon: 'warningInfo_gantanhao',
                //     number: 0,
                // }, {
                //     name: '警告告警',
                //     level: 'warning',
                //     color: "blue",
                //     icon: 'warningInfo_gantanhao',
                //     number: 0,
                // }
            ],
            warningClassify: [
                // {
                //     label: '温度告警',
                //     type: 'temperature',
                //     number: 0,
                //     color: "rgba(0, 115, 170, 1)",
                // }, {
                //     label: '湿度告警',
                //     type: 'humidity',
                //     number: 0,
                //     color: "rgba(0, 158, 236, 1)",
                // }, {
                //     label: '漏水告警',
                //     type: 'waterLeak',
                //     number: 0,
                //     color: "rgba(100, 205, 247, 1)",
                // }
            ]
        };

        return warningsParam;
    }

    // assetInfoParam: {
    //     state: [{ label: 'PDU', normal: 200, abnormal: 10 }, { label: 'UPS', normal: 12, abnormal: 22 }, { label: it.util.i18n("conditioning"), normal: 23, abnormal: 12 }, { label: it.util.i18n("AssetInfo_Business_Cabinets"), normal: 23, abnormal: 12 }],
    //     pue: 2,
    //     capacity: [{ label: it.util.i18n("AssetInfo_Power_Distribution"), value: 1232, total: 2000, unit: '(kw)' }, { label: it.util.i18n("AssetInfo_Refrigeration"), value: 15.77, total: 60, unit: '(kw)' }, { label: it.util.i18n("AssetInfo_Heating"), value: 956, total: 2600, unit: '' }],
    //     asset: [{ label: it.util.i18n("AssetInfo_Machine_Room"), value: 1 }, { label: it.util.i18n("conditioning"), value: 2 }, { label: it.util.i18n("AssetInfo_Rack"), value: 3 }, { label: it.util.i18n("AssetInfo_Battery_Pack"), value: 4 }, { label: it.util.i18n("AssetInfo_PDC"), value: 5 }, { label: it.util.i18n("AssetInfo_Electric_Generator"), value: 2 }, { label: 'UPS', value: 120 }],

    // },
    // warningsParam: {
    //     items: [],
    //     currentBtns: [
    //         {
    //             label: it.util.i18n("ClientAlarmManager_Check_Current_Alarms"),
    //             event: function () {
    //                 main.clientAlarmManager.showAlarmTable();
    //             }
    //         },
    //     ],
    //     btns: [
    //         {
    //             label: it.util.i18n("ClientAlarmManager_Check_All_Alarms"),
    //             event: function () {
    //                 main.clientAlarmManager.showAlarmLogDialog();
    //             }
    //         },
    //         {
    //             label:  it.util.i18n("ClientAlarmManager_Alarm_Detailed_Statistics"),
    //             event: function () {
    //                 main.warningStatisticsMgr.show();
    //             }
    //         }
    //     ],
    //     alarmLevels: [
    //         // {
    //         //     name: '严重警告',
    //         //     level: 'critical',
    //         //     color: "rgba(255, 0, 0, 1)",
    //         //     icon: 'warningInfo_gantanhao',
    //         //     number: 0,
    //         // }, {
    //         //     name: '重要警告',
    //         //     level: 'major',
    //         //     color: "rgba(250, 140, 0, 1)",
    //         //     icon: 'warningInfo_gantanhao',
    //         //     number: 0,
    //         // }, {
    //         //     name: '次要警告',
    //         //     level: 'minor',
    //         //     color: "rgba(225, 225, 0, 1)",
    //         //     icon: 'warningInfo_gantanhao',
    //         //     number: 0,
    //         // }, {
    //         //     name: '提示警告',
    //         //     level: 'indeterminate',
    //         //     color: "rgba(0, 226, 0, 1)",
    //         //     icon: 'warningInfo_gantanhao',
    //         //     number: 0,
    //         // }, {
    //         //     name: '警告告警',
    //         //     level: 'warning',
    //         //     color: "blue",
    //         //     icon: 'warningInfo_gantanhao',
    //         //     number: 0,
    //         // }
    //     ],
    //     warningClassify: [
    //         // {
    //         //     label: '温度告警',
    //         //     type: 'temperature',
    //         //     number: 0,
    //         //     color: "rgba(0, 115, 170, 1)",
    //         // }, {
    //         //     label: '湿度告警',
    //         //     type: 'humidity',
    //         //     number: 0,
    //         //     color: "rgba(0, 158, 236, 1)",
    //         // }, {
    //         //     label: '漏水告警',
    //         //     type: 'waterLeak',
    //         //     number: 0,
    //         //     color: "rgba(100, 205, 247, 1)",
    //         // }
    //     ]
    // }
});

it.AssetPanelMgr = $AssetPanelMgr;



