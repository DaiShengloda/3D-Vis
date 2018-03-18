//存放组件中jstree相关的东西
it.NewDataFinder = function (dataManager) {
    this.dataManager = dataManager;
    this.descentdantMap = {};
    this.ancesstorIdsMap = {};
}

mono.extend(it.NewDataFinder, it.DataFinder, {
    getDatas: function () {
        var allDatas = this.dataManager.getDatas();
        var datas = [];
        allDatas.forEach(function (v) {
            if (main.sceneManager.isCurrentSceneInstance(v)) {
                datas.push(v);
            }
        })
        return datas;
    },
});

it.NewOrganizeTreeManager = function (dataManager, dataType, treeIcons) {
    if (!dataManager) {
        console.log('dataManager can not be null');
    }
    this.dataManager = dataManager;
    this.dataType = dataType;
    this.treeIcons = treeIcons;
}

mono.extend(it.NewOrganizeTreeManager, it.OrganizeTreeManager, {
    createNode: function (data, children) {
        if (data) {
            if (data.getId() == main.sceneManager._currentRootData.getId()) {
                var obj = {
                    id: data.getId(),
                    text: this.createLabel(data)
                };
            } else {
                //            var obj = {id:data.getId(),text:data.getId(),parentId:data.getParentId(),o_data:data};
                var obj = {
                    id: data.getId(),
                    text: this.createLabel(data),
                    parentId: this.getParentIdByData(data)
                };
            }
            if (this.treeIcons) {
                var categoryId = this.dataManager.getCategoryForData(data).getId();
                if (this.treeIcons[categoryId]) {
                    obj.icon = this.treeIcons[categoryId];
                }
            }
            if (children) {
                obj.children = children;
            } else {
                obj.children = [];
            }
            if (this.isOpen(data)) {
                var state = obj.state;
                if (state) {
                    state['opened'] = true;
                } else {
                    obj.state = {
                        "opened": true
                    };
                }
            }
            return obj;
        }
        return null;
    },
    organizeTree: function (datas) {
        if (!datas || datas.length < 1) return null;
        var results = {}; //obj = {id:id,data:data,children:children}
        for (var i = 0; i < datas.length; i++) {
            var data = datas[i];
            if (!data) continue;
            var obj = this.createNode(data);


            results[data.getId()] = obj;
        }
        var treeData = [];
        var treeMap = it.Util.clone(results);
        for (var id in results) {
            //            var obj = results[id];
            var obj = treeMap[id]; // treeMap的范围要打印results,因为其包含了parent，并且treeData中的数据来自treeMap
            this.organizeParent(obj, treeData, treeMap);
        }
        return treeData;
    },
    organizeParent: function (obj, treeData, treeMap) {
        if (!obj) return null;
        var pid = obj.parentId;
        if (!pid) {
            treeData.push(obj);
            return obj;
        }
        var parent = treeMap[pid]; // 看看搜索的结果中是否包含其parent
        if (parent) {
            this.addChild(parent, obj);
        } else {
            var parentData = this.getDataById(pid);
            if (!parentData) {
                treeData.push(obj);
            } else {
                var pObj = this.createNode(parentData, [obj]);
                treeMap[parentData.getId()] = pObj;
                this.organizeParent(pObj, treeData, treeMap);
            }
        }
    },
});


it.SelectDataFinder = function (dataManager) {
    this.dataManager = dataManager;
    this.descentdantMap = {};
    this.ancesstorIdsMap = {};
}

mono.extend(it.SelectDataFinder, it.NewDataFinder, {
    isDataConformConditions: function(data,conditions){
        var conform = false;
        for(var p in conditions){
            if(this.isDataConformCondition(data,conditions[p])){
                conform = true;
                break;
            }
        }
        return conform;
    }
});

it.SelectOrganizeTreeManager = function (dataManager, dataType, treeIcons, selectTreeCategory) {
    if (!dataManager) {
        console.log('dataManager can not be null');
    }
    this.dataManager = dataManager;
    this.dataType = dataType;
    this.treeIcons = treeIcons;
    this.selectTreeCategory = selectTreeCategory;
}
mono.extend(it.SelectOrganizeTreeManager, it.NewOrganizeTreeManager, {
    createNode: function (data, children) {
        if (data) {
            var categoryId = this.dataManager.getCategoryForData(data).getId();
            var obj;
            if (data.getId() == main.sceneManager._currentRootData.getId()) {
                obj = {
                    id: data.getId(),
                    text: this.createLabel(data)
                };
            } else {
                if (this.selectTreeCategory && this.selectTreeCategory.length > 0) {
                    this.selectTreeCategory.forEach(function (val) {
                        if (categoryId == val) {
                            obj = {
                                id: data.getId(),
                                text: this.createLabel(data),
                                parentId: this.getParentIdByData(data)
                            };
                            return;
                        }
                    }, this);
                }
            }
            if (obj) {
                if (this.treeIcons) {
                
                    if (this.treeIcons[categoryId]) {
                        obj.icon = this.treeIcons[categoryId];
                    }
                }
                if (children) {
                    obj.children = children;
                } else {
                    obj.children = [];
                }
                if (this.isOpen(data)) {
                    var state = obj.state;
                    if (state) {
                        state['opened'] = true;
                    } else {
                        obj.state = {
                            "opened": true
                        };
                    }
                }
                return obj;
            } else {
                return null;
            }
        }
        return null;
    }
});