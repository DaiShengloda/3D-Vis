/**
 * 承重
 * @param sceneManager
 * @constructor
 */
it.WeightManager = function (sceneManager) {
    this.sceneManager = sceneManager;
    this.dataManager = this.sceneManager.dataManager;
    this.weightCapacityManager = new it.WeightCapacityManager(this.sceneManager);
    this.visibleManager = new it.VisibleManager(sceneManager);
    this.sceneManager.viewManager3d.addVisibleFilter(this.visibleManager);
    this._show = false;
    this.showWeightData = [];
    this.addTableDataFinish = false;
    this.orgTreeManager = new it.NewOrganizeTreeManager(this.sceneManager.dataManager, null, dataJson.treeIcon);
    this.rackDataMap = [];
    this.init();
};

mono.extend(it.WeightManager, Object, {

    init: function () {
        this.weightCapacityManager.getWeightNodeColor = function (percent) {

            return main.loadConfig.getColor('weight', percent);
        }
    },
    resetDiagram: function () {

        var datas = [];
        var loadConfig = main.loadConfig.getValue('weight');
        datas.push({ text: it.util.i18n('WeightManager_Light_load') + '(<' + loadConfig.min + '%)', color: main.loadConfig.weightColors[0] });
        datas.push({ text: it.util.i18n('WeightManager_Medium_load'), color: main.loadConfig.weightColors[1], width: 105 });
        datas.push({ text: it.util.i18n('WeightManager_high_load') + '(>=' + loadConfig.max + '%)', color: main.loadConfig.weightColors[2] });

        var volume = 0, occupy = 0;
        var rootData = main.sceneManager._currentRootData;
        var childrenDatas = main.sceneManager.dataManager.getDescendants(rootData);
        childrenDatas.forEach(function (c) {
            if (main.sceneManager.dataManager.getCategoryForData(c).getId() == 'rack') {
                occupy += main.weightManager.weightCapacityManager.computeChildrenWeight(c);
                volume += main.sceneManager.dataManager.getDataTypeForData(c).getWeightRating();
            }
        });
        this.diagram.weightLegend("option", {
            "legend": datas,
            "title": it.util.i18n('WeightManager_Weight_load_legend'),
            "volume": volume,
            "occupy": occupy
        });
        this.hide();
        this.show();

    },
    isShow: function () {
        return this._show;
    },
    toggleShow: function () {
        if (this.isShow()) {
            this.hide();
        } else {
            this.show();
        }
    },

    show: function () {
        var self = this;

        self.weightCapacityManager.createWeightNode = function (dataOrId) {
            var sm = this.sceneManager, dm = this.dataManager, data = dataOrId,
                box = sm.network3d.getDataBox();
            //如果不在当前场景
            if (!sm.isCurrentSceneInstance(dataOrId)) {
                return;
            }
            if (!data.getId) {
                data = dm.getDataById(dataOrId);
            }
            var node = sm.getNodeByDataOrId(data);
            var cNodes = node.getChildren();
            if (cNodes && cNodes.size()) {
                for (var k = 0; k < cNodes.size(); k++) {
                    var childNode = cNodes.get(k);
                    var childData = this.sceneManager.getNodeData(childNode);
                    if (childData && childData.getParentId() == data.getId()) {
                        childNode.setParent(null);
                        box.removeByDescendant(childNode);
                    }
                }
            }
            var percent = this.computeWeightPercent(data);

            if (percent == null) {
                return;
            }
            data._weightPercent = percent;
            var boundingBox = node.getBoundingBox(),
                size = boundingBox.size(),
                width = size.x, height = size.y, depth = size.z;

            var weightNode = node.getClient('weightNode'), weightNode2;
            percent = percent || 0.01; //如果是0, 就显示很小的一个值

            if (!weightNode) {
                weightNode = new mono.Cube(width, height, depth);
                weightNode2 = new mono.Cube(width, height, depth);

                weightNode2.setParent(weightNode);
                weightNode.s({
                    'm.type': 'phong',
                });
                weightNode2.s({
                    'm.wireframe': true,
                    'm.transparent': true,
                    'm.opacity': 0.1,
                    // 'm.wireframeLinewidth': 1,
                    // 'm.color': 'white',
                });

                weightNode.setClient('child', weightNode2);
            }


            weightNode2 = weightNode.getClient('child');
            var color = this.getWeightNodeColor(percent);
            var radomColor1 = -(Math.random() * 15 + 10);
            var radomColor2 = -(Math.random() * 25 + 20);
            var radomColor3 = -(Math.random() * 35 + 20);
            var color1 = self.shadeColor(color, radomColor1);
            var color2 = self.shadeColor(color, radomColor2);
            var color3 = self.shadeColor(color, radomColor3);
            weightNode.s({
                'top.m.color': color1,
                'bottom.m.color': color1,
                'front.m.color': color2,
                'back.m.color': color2,
                'left.m.color': color3,
                'right.m.color': color3,
                'top.m.ambient': color1,
                'bottom.m.ambient': color1,
                'front.m.ambient': color2,
                'back.m.ambient': color2,
                'left.m.ambient': color3,
                'right.m.ambient': color3,
                'm.specularStrength': 30,
                // 'm.envmap.image':  make.Default.getEnvMap('envmap6')//环境贴图
            });
            // weightNode2.s({
            //     'm.wireframeLinecolor':color
            // });

            weightNode.setParent(node);
            weightNode.setScale(0.95, percent, 1);
            weightNode.setY(height * percent / 2 - height / 2 + 5);

            weightNode2.setScale(0.95, 1 / percent, 1);
            // weightNode2.setY(height / 2 - height * percent / 2);
            weightNode2.setY(height / percent / 2 - height / 2);

            weightNode.setClient('weightChildNode', true);
            node.setClient('weightNode', weightNode);
            weightNode.setClient('it_data', 'weight');
            box.addByDescendant(weightNode);
            // this.makeItDataUnvisible(data);
            main.sceneManager.network3d.dirtyNetwork();
            return weightNode;
        };



        if (self.showWeightData && self.showWeightData.length > 0) {
            this.hide();
        }
        this._show = true;
        self.showWeightData = [];
        this.dataManager.getDatas().forEach(function (data) {
            if (self.isDataShowWeight(data) == 'rack') {
                self.weightCapacityManager.createWeightNode(data);
                self.visibleManager.setVisible(data, false);
                self.showWeightData.push(data);
            } else if (self.isDataShowWeight(data) == 'channel') {
                self.visibleManager.setVisible(data, false);
            }
        });

        if (!this.diagram) {
            var $diagram = this.diagram = $('<div>').appendTo($('.view-control')).hide();
            $diagram.weightLegend();
            var datas = [];
            var loadConfig = main.loadConfig.getValue('weight');
            datas.push({ text: it.util.i18n('WeightManager_Light_load') + '(<' + loadConfig.min + '%)', color: main.loadConfig.weightColors[0] });
            datas.push({ text: it.util.i18n('WeightManager_Medium_load'), color: main.loadConfig.weightColors[1] });
            datas.push({ text: it.util.i18n('WeightManager_high_load') + '(>=' + loadConfig.max + '%)', color: main.loadConfig.weightColors[2] });
            var title = it.util.i18n("WeightManager_Weight_Use_Statics");
            var volume = 0, occupy = 0;
            var rootData = main.sceneManager._currentRootData;
            var childrenDatas = main.sceneManager.dataManager.getDescendants(rootData);
            childrenDatas.forEach(function (c) {
                if (main.sceneManager.dataManager.getCategoryForData(c).getId() == 'rack') {
                    occupy += main.weightManager.weightCapacityManager.computeChildrenWeight(c);
                    volume += main.sceneManager.dataManager.getDataTypeForData(c).getWeightRating();
                }
            });
            $diagram.weightLegend("option", {
                "title": title,
                "legend": datas,
                "volume": volume,
                "occupy": occupy,
                'unit': '(kg)'
            });
        }
        this.diagram.weightLegend('show');
        this.diagram.weightLegend('showDetailsBtn');
        this.diagram.weightLegend({
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
        this.treeTable.weightTreeTable('option', 'tableData', this.tableData);
        this.treeTable.weightTreeTable('initBox');
        this.treeTable.weightTreeTable({
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
        this.treeTable.weightTreeTable('option', 'tableData', this.tableData);
        this.treeTable.weightTreeTable('initBox');
    },
    hide: function () {
        this._show = false;
        var self = this;
        self.visibleManager.clear();
        this.showWeightData.forEach(function (data) {
            self.weightCapacityManager.removeWeightNode(data);
        })
        this.showWeightData = [];
        this.diagram.weightLegend('hide');
        if (this.treeTable) {
            this.treeTable.weightTreeTable('clearSearchInput');
        };     
    },

    isDataShowWeight: function (data) {
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
    },

    shadeColor: function (color, percent) {
        var R = parseInt(color.substring(1, 3), 16);
        var G = parseInt(color.substring(3, 5), 16);
        var B = parseInt(color.substring(5, 7), 16);

        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);

        R = (R < 255) ? R : 255;
        G = (G < 255) ? G : 255;
        B = (B < 255) ? B : 255;

        var RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
        var GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
        var BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

        return "#" + RR + GG + BB;
    }
});