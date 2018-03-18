var $SpaceAvailabilityManager = function (sceneManager, inputPane, mode) {
    it.BaseSearch.call(this, sceneManager, inputPane);
    this.spaceManager = new it.SpaceManager(this.dataManager, this.sceneManager);
    this.diagramInit = false;
    this.diagram = null;
    this.isVirtualFunction = null;
    this.virtualNode = [];
    this.spaceMap = {};
    this.addTableDataFinish = false;
    this.orgTreeManager = new it.NewOrganizeTreeManager(this.sceneManager.dataManager, null, dataJson.treeIcon);
    this.rackDataMap = [];
    this.mode = mode || 1;
    var self = this;
    this.sceneManager.dataManager.addDataManagerChangeListener(function (event) {
        if (event.data && event.data.getParentId) {
            var parentId = event.data.getParentId();
            if (parentId && self.spaceMap[parentId]) {
                delete self.spaceMap[parentId];
            }
        }
    });
    this.spaceManager.spaceNodeColorFunction = function (percent, data, space) {
        // ratio 表示的是已用的百分比
        // if (space) {
        if (data && data.getUserData('dyna_user_data_empCount')) {
            var occupationCount = parseInt(data.getUserData('dyna_user_data_empCount'));
            var num = self.getUNumber() || 1;
            var total_count = Math.floor(47 / num);
            var unit_count = Math.floor(total_count / 4); //ceil
            if (total_count <= 4) {
                if (occupationCount === total_count) {
                    return '#5DBDE0'; //蓝
                } else if ((total_count - 1) > 0 && occupationCount === (total_count - 1)) {
                    return '#6FD772';
                } else if ((total_count - 2) > 0 && occupationCount === (total_count - 2)) {
                    return '#FFC95A';
                } else {
                    return '#Fd674F';
                }
            } else {
                if (occupationCount <= unit_count) {
                    return '#Fd674F';
                } else if (occupationCount >= (unit_count + 1) && occupationCount <= unit_count * 2) {
                    return '#FFC95A';
                } else if (occupationCount >= (unit_count * 2 + 1) && occupationCount <= unit_count * 3) {
                    return '#6FD772';
                } else if (occupationCount >= (unit_count * 3 + 1) && occupationCount <= total_count) {
                    return '#5DBDE0';
                } else {
                    console.log('can not compute the spaceNodeColorFunction color !');
                }
            }
        }
        // }
        if (!percent) { //空间可视化时，计算内部的颜色时
            return '#5DBDE0'; //'#BEEB9F';
        } else if (percent <= 0.25) {
            return '#5DBDE0'; //'#BEEB9F'; 绿
        } else if (percent <= 0.5) {
            return '#6FD772'; // FFFF99 黄
        } else if (percent <= 0.75) {
            return '#FFC95A'; //'#FFBB11'; 橙
        } else {
            return '#Fd674F'; // FF3357 '#FF6138'; //红色，表示已用的很多
        }
    };

    this.spaceManager.spaceNodeFrameColorFunction = function (percent, data, space) {
        // if (space) {
        if (data && data.getUserData('dyna_user_data_empCount')) {
            var occupationCount = parseInt(data.getUserData('dyna_user_data_empCount'));
            var num = self.getUNumber() || 1;
            var total_count = Math.floor(47 / num);
            var unit_count = Math.floor(total_count / 4); //ceil
            if (total_count <= 4) {
                if (occupationCount === 1) {
                    return '#018ABD';
                } else if (occupationCount === 2) {
                    return '#1A920A';
                } else if (occupationCount === 3) {
                    return '#E68D00';
                } else {
                    return '#CE3118';
                }
            } else {
                if (occupationCount <= unit_count) {
                    return '#CE3118';
                } else if (occupationCount >= (unit_count + 1) && occupationCount <= unit_count * 2) {
                    return '#E68D00';
                } else if (occupationCount >= (unit_count * 2 + 1) && occupationCount <= unit_count * 3) {
                    return '#1A920A';
                } else if (occupationCount >= (unit_count * 3 + 1) && occupationCount <= total_count) {
                    return '#018ABD';
                } else {
                    console.log('can not compute the spaceNodeFrameColorFunction color !');
                }
            }
        }
        // }
        if (!percent) { //空间可视化时，计算内部的颜色时
            return '#018ABD'; //'#BEEB9F';
        } else if (percent <= 0.25) {
            return '#018ABD'; //'#BEEB9F'; 绿
        } else if (percent <= 0.5) {
            return '#1A920A'; // FFFF99 黄
        } else if (percent <= 0.75) {
            return '#E68D00'; //'#FFBB11'; 橙
        } else {
            return '#CE3118'; // FF3357 '#FF6138'; //红色，表示已用的很多
        }
    };

    this.resetTreeLabel();
    //this.virtualAllNodes();

    this.clearAllFunction = function () {
        this.clearSpaceNode();
    }
};

mono.extend($SpaceAvailabilityManager, it.SpaceSearchManager, {
    beforHide: function () {
        this.diagram.spaceLegend('hide');
        if (this.treeTable) {
            this.treeTable.spaceTreeTable('clearSearchInput');
        };   
    },
    showSpaceNode: function (result) {
        var nodes = this.getSceneNodes();
        if (!result || result.length < 1) {
            result = nodes;
        }
        if (nodes && nodes.length > 0) {
            this.showSerialDiagram(this.getUNumber(), result);
        } else {
            if (!this.diagram) {
                layer.msg(it.util.i18n("SpaceSearchApp_No_Rack"));
                return;
            }
            this.diagram.spaceLegend('hide');
        }
        this.spaceManager.create1DSpaceNodeForNodes(nodes, this.mode);
        this.spaceManager.showSpaceMode();
    },
    showSerialDiagram: function (num, nodes) {
        var self = this;
        var datas = [];
        var serialNumColorMap = {};
        num = parseInt(num);
        if (!num) {
            num = 1;
        }
        this.num = num;
        var total_count = Math.floor(47 / num);
        var unit_count = Math.floor(total_count / 4); //ceil

        var color = this.getCapacityColor(0.1);
        var data = {
            color: color,
            minCount: (unit_count * 3 + 1),
            maxCount: total_count,
            value: (unit_count * 3 + 1) + '-' + total_count
        };
        if (total_count <= 4) {
            data.value = total_count;
            data.minCount = total_count;
            data.maxCount = total_count;
            serialNumColorMap[total_count] = color;
        } else {
            for (var i = (unit_count * 3 + 1); i <= total_count; i++) {
                serialNumColorMap[i] = color;
            }
        }
        datas.push(data);


        color = this.getCapacityColor(0.3);
        data = {
            color: color,
            minCount: (unit_count * 2 + 1),
            maxCount: unit_count * 3,
            value: (unit_count * 2 + 1) + '-' + (unit_count * 3)
        };
        if (total_count > 1 && total_count <= 4) {
            data.value = total_count - 1;
            data.minCount = total_count - 1;
            data.maxCount = total_count - 1;
            serialNumColorMap[total_count - 1] = color;
        } else {
            for (var i = (unit_count * 2 + 1); i <= (unit_count * 3); i++) {
                serialNumColorMap[i] = color;
            }
        }
        if (total_count > 1) {
            datas.push(data);
        }

        color = this.getCapacityColor(0.6);
        data = {
            color: color,
            minCount: (unit_count + 1),
            maxCount: unit_count * 2,
            value: (unit_count + 1) + '-' + (unit_count * 2)
        };
        if (total_count > 2 && total_count <= 4) {
            data.value = total_count - 2;
            data.minCount = total_count - 2;
            data.maxCount = total_count - 2;
            serialNumColorMap[total_count - 2] = color;
        } else {
            for (var i = (unit_count + 1); i <= (unit_count * 2); i++) {
                serialNumColorMap[i] = color;
            }
        }
        if (total_count > 2) {
            datas.push(data);
        }

        color = this.getCapacityColor(0.8);
        data = {
            color: color,
            minCount: 1,
            maxCount: unit_count,
            value: '1-' + unit_count
        };
        if (total_count > 3 && total_count <= 4) {
            data.value = total_count - 3;
            data.minCount = total_count - 3;
            data.maxCount = total_count - 3;
            serialNumColorMap[total_count - 3] = color;
        } else {
            for (var i = 1; i <= unit_count; i++) {
                serialNumColorMap[i] = color;
            }
        }
        if (total_count > 3) {
            datas.push(data);
        }
        var usedP = {};
        var totalMap = {};
        if (nodes && nodes.length > 0) {
            for (var i = 0; i < nodes.length; i++) {
                var data = this.sceneManager.getNodeData(nodes[i]);
                var dColor = serialNumColorMap[data.getUserData('dyna_user_data_empCount')];
                var space = data.getUserData('dyna_user_data_totalSpace');//总空间
                var occupation = data.getUserData('dyna_user_data_totalOccupation');//总的占用空间

                if (dColor) {
                    if (totalMap[dColor]) {
                        totalMap[dColor]++;
                    } else {
                        totalMap[dColor] = 1;
                    }
                    if (usedP[dColor]) {
                        var us = usedP[dColor];
                        var percent = Math.round(occupation / space * 100);
                        if (percent < us.minP) us.minP = percent;
                        if (percent > us.maxP) us.maxP = percent;
                    } else {
                        var percent = Math.round(occupation / space * 100);
                        usedP[dColor] = { 'minP': percent, 'maxP': percent };
                    }
                }
            }
            for (var i = 0; i < datas.length; i++) {
                var itemData = datas[i];
                if (!itemData) {
                    continue;
                }
                if (totalMap[itemData.color]) {
                    var strValue = '';
                    if (itemData.minCount) {
                        strValue = itemData.minCount;
                    }
                    if (itemData.minCount != itemData.maxCount) {
                        strValue += '-' + itemData.maxCount;
                    }
                    strValue += '(' + totalMap[itemData.color] + ')';
                    itemData.value = strValue;
                }

            }
        }
        var legends = [];
        $.each(datas, function (index, val) {
            legends.push({
                color: val.color,
                text: val.value
            })
        });

        if (!this.diagramInit) {
            this.diagram = $('<div>').appendTo($('.view-control')).hide();
            this.diagram.spaceLegend();
            this.diagramInit = true;
        }

        var volume = 0, occupy = 0;
        var rootData = main.sceneManager._currentRootData;
        var childrenDatas = main.sceneManager.dataManager.getDescendants(rootData);
        childrenDatas.forEach(function (c) {
            if (main.sceneManager.dataManager.getCategoryForData(c).getId() == 'rack') {
                volume += c.getUserData('dyna_user_data_totalSpace') || 0;
                occupy += c.getUserData('dyna_user_data_totalOccupation') || 0;
            }
        });
        this.diagram.spaceLegend('show');
        this.diagram.spaceLegend('option', {
            'title': it.util.i18n("SpaceSearchApp_Space_Legend"),
            'legend': legends,
            'volume': volume,
            'occupy': occupy,
            'unit': '(U)'
        });
        this.diagram.spaceLegend('showDetailsBtn');
        this.diagram.spaceLegend({
            addTableData: function(event, data) {
                self.addTableData(data);
            }
        });

        var focusNode = this.sceneManager.viewManager3d._focusNode;
        var focusData = this.sceneManager.getNodeData(focusNode);
        var focusCaterogy = this.sceneManager.dataManager.getCategoryForData(focusData);
        if(focusCaterogy.getId() == 'rack'){
            this.diagram.spaceLegend('hide');
        }
    },
    addTableData: function(data) {
        var self = this;
        if (this.addTableDataFinish) return;
        this.treeTable = data.el;
        this.queryTableData(null);
        this.treeTable.spaceTreeTable('option', 'tableData', this.tableData);
        this.treeTable.spaceTreeTable('initBox');
        this.treeTable.spaceTreeTable({
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
        this.treeTable.spaceTreeTable('option', 'tableData', this.tableData);
        this.treeTable.spaceTreeTable('initBox');
    },
})

it.SpaceAvailabilityManager = $SpaceAvailabilityManager;