it.PowerManager = function (sceneManager) {
    this.sceneManager = sceneManager;
    this.dataManager = sceneManager.dataManager;
    this.powerCapacityManager = this.pcm = new it.PowerCapacityManager(sceneManager);

    this.visibleManager = new it.VisibleManager(sceneManager);
    this.sceneManager.viewManager3d.addVisibleFilter(this.visibleManager);
    this.showPowerData = [];
    this.pueChart = null;

    this.addTableDataFinish = false;
    this.orgTreeManager = new it.NewOrganizeTreeManager(this.sceneManager.dataManager, null, dataJson.treeIcon);
    this.rackDataMap = [];

    this.powerCapacityManager.getPowerNodeColor = function (percent) {
        return main.loadConfig.getColor('power', percent);
    }

    var tooltipManager = this.tooltipManager = new it.TooltipManager(sceneManager);
    tooltipManager.tooltipContentFunction = function (node) {
        var parent = node.getParent();
        if (node.getClient('powerChildNode') || (parent && parent.getClient('powerChildNode'))) {
            var data = sceneManager.viewManager3d.getDataByNode(node);
            if (!data && parent) {
                data = sceneManager.viewManager3d.getDataByNode(parent);
            }
            var key1 = it.util.i18n("PowerManager_ID");
            var key2 = it.util.i18n("PowerManager_Description");
            var key3 = it.util.i18n("PowerManager_Load_factor");
            var returnResult = {};
            returnResult[key1] = data.getId();
            returnResult[key2] = data.getDescription();
            returnResult[key3] = (node.getScaleY() * 100).toFixed(2) + "%";
            return returnResult;
        }
        return null;
    };

    sceneManager.viewManager3d.addEventHandler(tooltipManager);
    this._show = false;
    this.initContainer = false;
};

mono.extend(it.PowerManager, Object, {
    initMoniterContainer: function () {
        if (this.initContainer) return;
        var mc = this.moniterContainer = $('<div>').appendTo($('.view-control')).hide().addClass('elecPanel');
        mc.elecInfoSta();
        var pue_levels = [{
            range: [0, 1],
            color: main.loadConfig.powerColors[0],
        }, {
            range: [1, 1.5],
            color: main.loadConfig.powerColors[1],
        }, {
            range: [1.5, 3],
            color: main.loadConfig.powerColors[2],
        }];
        mc.elecInfoSta('option', 'pue_levels', pue_levels)
        var $diagram = this.diagram = $('<div>').appendTo($('.view-control')).hide();
        var datas = [];
        var loadConfig = main.loadConfig.getValue('power');
        datas.push({ text: it.util.i18n("PowerManager_Light_load") + '(<' + loadConfig.min + '%)', color: main.loadConfig.powerColors[0] });
        datas.push({ text: it.util.i18n("PowerManager_Medium_load"), color: main.loadConfig.powerColors[1] });
        datas.push({ text: it.util.i18n("PowerManager_high_load") + '(>=' + loadConfig.max + '%)', color: main.loadConfig.powerColors[2] });
        var title = it.util.i18n("PowerManager_Use_power_Statistics");
        $diagram.powerLegend({
            'legend': datas,
            'title': title,
            'unit': '(kw)'
        });
        this.initContainer = true;
    },

    resetDiagram: function () {
        var datas = [];
        var loadConfig = main.loadConfig.getValue('power');
        datas.push({ text: it.util.i18n("PowerManager_Light_load") + '(<' + loadConfig.min + '%)', color: main.loadConfig.powerColors[0] });
        datas.push({ text: it.util.i18n("PowerManager_Medium_load"), color: main.loadConfig.powerColors[1], width: 105 });
        datas.push({ text: it.util.i18n("PowerManager_high_load") + '(>=' + loadConfig.max + '%)', color: main.loadConfig.powerColors[2] });

        this.diagram.powerLegend('option', {
            'legend': datas,
            'title': it.util.i18n("PowerManager_Power_load_legend")
        });

        this.refresh();
    },

    //更新legend组件数据
    setMoniterDatas: function (datas) {
        var key1 = it.util.i18n("PowerManager_Floor_power_rating");
        var key2 = it.util.i18n("PowerManager_Floor_power_real");
        var key3 = it.util.i18n("PowerManager_Load_factor");

        var codeMap = {}, items = [], volume, occupy;
        codeMap[key1] = "FP";
        codeMap[key2] = "RP";
        codeMap[key3] = "LP";
        codeMap["PUE"] = "PUE";
        var cp = this.contentPane;//.empty();
        var i = 0;
        var r = /\d*\.?\d*/;
        for (var p in datas) {
            if (p !== "PUE") {
                var n = r.exec(datas[p]);
                if (n) n = n[0];
                var item = {
                    label: p,
                    value: n,
                    unit: datas[p].replace(n, '')
                }
                items.push(item);
                if (p == key1) {
                    volume = parseFloat(datas[p]);
                } else if (p == key2) {
                    occupy = parseFloat(datas[p]);
                }
            }
            if (p === "PUE" && datas[p] != 0) {
                this.moniterContainer.elecInfoSta('option', 'pue', datas[p]);
            }
        }

        this.moniterContainer.elecInfoSta('option', 'items', items);

        if (!this.diagram) return
        this.diagram.powerLegend('option', {
            'volume': volume,
            'occupy': occupy
        });
    },

    //更新treeTable组件数据
    setTreeTableData: function() {
        if (!this.treeTable) return;
        if (this.treeTable.css("display") == 'none') return;
        this.treeTable.powerTreeTable('option', 'tableData', this.tableData);   
        this.treeTable.powerTreeTable('initBox');   
        this.treeTable.powerTreeTable('refresh');
    },

    //显示panel
    showMoniter: function () {
        var mc = this.moniterContainer;
        mc.css('display', 'block');
    },

    //隐藏panel
    hideMoniter: function () {
        var mc = this.moniterContainer;
        mc.css('display', 'none');
    },

    //显示app
    showPowerCapacity: function () {
        var self = this;
        this.initMoniterContainer();
        this.showPowerNode();
        this.showMoniter();
        this.diagram.powerLegend('show');
        this.diagram.powerLegend('showDetailsBtn');
        this.diagram.powerLegend({
            addTableData: function(event, data) {
                self.addTableData(data);
            }
        });
    },

    addTableData: function(data) {
        var self = this;
        if (this.addTableDataFinish) return;
        this.treeTable = data.el;
        this.queryTableData(null);
        this.treeTable.powerTreeTable('option', 'tableData', this.tableData);
        this.treeTable.powerTreeTable('initBox');
        this.treeTable.powerTreeTable({
            filterData: function(event, data) {
                self.filterData(data);
            } 
        });
        this.addTableDataFinish = true;
    },

    queryTableData: function(val) {
        this.rackDataMap = [];
        var self = this;
        var rootData = main.sceneManager._currentRootData;
        var childrenDatas = main.sceneManager.dataManager.getDescendants(rootData);
        childrenDatas.forEach(function (c) {
            if (main.sceneManager.dataManager.getCategoryForData(c).getId() == 'rack') {
                var rackId = c.getId();
                if (rackId.indexOf(val)>-1 || !val){
                    self.rackDataMap.push(c);
                }           
            }
        });
        this.tableData = this.orgTreeManager.organizeTree(this.rackDataMap);
    },

    filterData: function(data) {
        var self = this;
        var val = data.filterVal;
        this.queryTableData(val);
        this.treeTable.powerTreeTable('option', 'tableData', this.tableData);
        this.treeTable.powerTreeTable('initBox');
    },

    //隐藏app
    hidePowerCapacity: function () {
        this.hidePowerNode();
        this.hideMoniter();
        this.diagram.powerLegend('hide');
    },
    isShow: function () {
        return this._show;
    },
    refresh: function () {
        this.hidePowerCapacity();
        this.showPowerCapacity();
    },

    simulaterPowerData: function() {
        this.hidePowerNode();
        this.showPowerNode();
    },

    hidePowerNode: function() {
        if (!this._show) {
            return;
        }
        this._show = false;
        var self = this;
        self.visibleManager.clear();
        this.showPowerData.forEach(function (data) {
            self.powerCapacityManager.removePowerNode(data);

        });
        this.showPowerData = [];
    },

    showPowerNode: function() {
        if (this._show) {
            return;
        }
        var self = this;
        if (self.showPowerData && self.showPowerData.length > 0) {
            this.hidePowerCapacity();
        }
        this._show = true;
        self.showPowerData = [];
        var rootData = this.sceneManager._currentRootData;
        var childrenDatas = this.dataManager.getDescendants(rootData);
        childrenDatas.forEach(function (data) {
            if (self.isDataShowPower(data) == 'rack') {
                self.powerCapacityManager.createPowerNode(data);
                self.showPowerData.push(data);
            } else if (self.isDataShowPower(data) == 'channel') {
                self.visibleManager.setVisible(data, false);
            }
        });
    },

    _findAllRacks: function (roomData) {
        var id = roomData.getId(), racks = this.racksMap[id], dm = this.dataManager;
        if (racks) {
            return racks;
        }
        racks = this._findDescendant(roomData, function () {
            var dataType = dm.getDataTypeForData(this);
            if (dataType && dataType.getModel().indexOf('.rack') != -1) {
                return true;
            }
            return false;
        });
        this.racksMap[id] = racks;
        return racks;
    },

    _findDescendant: function (root, filterFunction, results) {
        if (!root) {
            return null;
        }
        results = results || [];
        var self = this;
        var childList = root.getChildren();
        childList.forEach(function (child) {
            if (filterFunction.call(child, child)) {
                results.push(child);
            }
        });
        childList.forEach(function (child) {
            self._findDescendant(child, filterFunction, results);
        });
        return results;
    },
    isDataShowPower: function (data) {
        var self = this;
        var dataType = this.dataManager.getDataTypeForData(data);
        if (dataType) {
            if (dataType.getCategoryId() == 'rack') {
                return 'rack';
            } else if (dataType.getCategoryId() == 'channel') {
                return "channel";
            }
        }
        return false;
    }
});

it.PowerManager.Simulater = {
    simulater: function (powerManager) {
        // if (!main.powerManager) { // 这样耦合度太高，需解藕
        if (!powerManager) {
            return;
        }
        if (this.simulating == false) {
            return;
        }
        var pm = powerManager;
        var pcm = pm.pcm, sm = pm.sceneManager, dm = pm.dataManager,
            node = sm._currentRootNode,
            data = sm.getNodeData(node);

        var totalPower = 0,allPower = 0;
        powerManager.showPowerData.forEach(function (rack) {
            var rackType = dm.getDataTypeForData(rack);
            allPower += rackType.getPowerRating() || 0;
            var equipments = pm._findDescendant(rack, function () {
                // var dataType = dm.getDataTypeForData(this);
                var category = dm.getCategoryForData(this)
                if (category && category.getId().indexOf('equipment') != -1) {
                    return true;
                }
                return false;
            });
            var random = Math.random() * 40;
            equipments.forEach(function (equipment) {
                equipment.setPower(3 + random);
                totalPower += equipment.getPower();
            });
        });
        var pue = Math.random() + 1;
        var key1 = it.util.i18n("PowerManager_Floor_power_rating");
        var key2 = it.util.i18n("PowerManager_Floor_power_real");
        var key3 = it.util.i18n("PowerManager_Load_factor");
        var param = {};
        param[key1] = allPower + 'kw.h';//"400000kw.h";
        param[key2] = totalPower.toFixed(2) + "kw.h";
        param[key3] = (totalPower / 400000).toFixed(2);
        param["PUE"] = pue.toFixed(2);
        if (pm.isShow()) {
            pm.simulaterPowerData();
        } else {
            pm.showPowerCapacity();
        }
        pm.setMoniterDatas(param);
        pm.setTreeTableData();
        var self = this;
        setTimeout(function () {
            self.simulater(powerManager);
        }, 2000);
        // setInterval(function() {
        //     pm.setTreeTableData();
        // },2000);
    },

    refresh: function (pm) {
        this.simulating = true;
        this.simulater(pm);
    },

    stop: function (powerManager) {
        if (!powerManager) {
            return;
        }
        this.simulating = false;
        // var pm = main.powerManager;
        powerManager.hidePowerCapacity();
    },
};
