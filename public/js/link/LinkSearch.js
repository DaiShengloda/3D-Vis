it.LinkSearch = function(sceneManager) {
    if (!sceneManager) {
        console.log('sceneManager can not be null!');
        return;
    }
    this.sceneManager = sceneManager;
    this.dataManager = this.sceneManager.dataManager;
    this.orgTreeManager = new it.OrganizeTreeManager(this.sceneManager.dataManager);
    this.defaultEventHandler = sceneManager.viewManager3d.getDefaultEventHandler();
    this.linkFinder = new it.LinkFinder(this.dataManager, this.sceneManager);
    this.treeView = null;
    this.inputPane = new it.LinkSearchPanel();
    this.box3D = this.sceneManager.network3d.getDataBox();
    this.initSearchPane();
};

mono.extend(it.LinkSearch, Object, {

    initSearchPane: function() {
        this.searPanel = $('.search-main-pane');
        var paneIndex = 0;
        if (this.searPanel && this.searPanel.length > 0) {
            paneIndex = this.searPanel.length;
        }
        this.searPanel = $('<div id = "search-main-pane_' + paneIndex + '" class="search-main-pane"></div>');
        this.searPanel.append(this.inputPane.getContentPane());
        this.treeView = new it.TreeView(this.searPanel);
        var self = this;
        this.treeView.clickNodeFunction = function(treeData) {
            self.clickTreeNode(treeData);
        };

        this.treeView.mouseoverNodeFunction = function(treeData) {
            self.mouseOverTreeNode(treeData);
        };

        this.inputPane.doClickFunction = function(values) {
            self.beforeDoClick();
            self.setData(values);
            var height = self.searPanel.height() - self.inputPane.getContentPane().height();
            self.treeView.setTreeHeight(height);
        };

        this.inputPane.doClearFunction = function() {
            self.clearSearch();
            var currentRootNode = self.sceneManager.getCurrentRootNode();
            if (currentRootNode) {
                self.defaultEventHandler.lookAt(currentRootNode);
            }
        };

        this.orgTreeManager.getParentIdByData = function(data) {
            if (data && !data.getFromId() && !data.getToId()) {
                return null;
            } else {
                return self.getCurrentRootId();
            }
        };

        this.orgTreeManager.createLabel = function(link) {
            if (!link) return '';
            if (link instanceof it.Link) {
                var text = link.getId() + '';
                if (link.getName()) {
                    text += '(' + link.getName() + ')';
                }
                return text;
            }
            return '';
        };

        // 注销：2017-09-28 应该由NavBarManager来控制
        // this.sceneManager.addSceneChangeListener(function(eve) {
        //     self.clearSearch();
        // });

        /*
         * remove 2017-09-20
        // 当focus 从link移到其他的地方时，特别是from和to不在同一个场景时，应该隐藏掉它
        // 当查看某个node上的所有links时，并且存在多条links，此时显示了多个links，但是focus是某个node，
        //  这种情况下怎么退出，并且点击links的另一端的任一一个node时，该怎么处理？
        this.doFlag = false;
        this.sceneManager.viewManager3d.addPropertyChangeListener(function(event) {
            if (event.property == "focusNode") {
                var oldNode = event.oldValue;
                var node = event.newValue;
                var nodeData = self.sceneManager.getNodeData(node);
                var data = self.sceneManager.getNodeData(oldNode);
                if (data instanceof it.Link) {
                    self.doFlag = true;
                    self.sceneManager.gcsManager.clearLinkById(data, nodeData); //这里面又会触发新的setFocus,有可能死循环
                } else if (!(nodeData instanceof it.Link)) { //由于上面会触发setFocus，并且第二次一定不是link，所有第二次一定会执行下面的，其实没有必要(所以加上了个doFlag)。
                    // 当setFocus的node不是link时，应该清空当前显示的所有的link。
                    // 不仅仅是这样，还要根据接下来要显示的对象，来从box中移除具体的东西，这都是因为link跨楼层的问题，若是不跨楼层，那这里可以忽略
                    if (!self.doFlag) {
                        self.sceneManager.gcsManager.clearLinksByData(data, nodeData);
                    }
                    self.doFlag = false; //下一次就开启
                }
            }
        });
         */

        // this.sceneManager.gcsManager.showBillboard = function(link) {
        //     if (link && link.getName() && link.getName() != '') {
        //         return false;
        //     }
        //     return true;
        // }

        var oldPaintSortFunction = main.sceneManager.network3d.paintSortFunction;

        main.sceneManager.network3d.paintSortFunction = function(a, b) {
            if (a instanceof mono.Link || a instanceof mono.PathLink) {
                return 1;
            }
            if (b instanceof mono.Link || b instanceof mono.PathLink) {
                return -1;
            }
            return oldPaintSortFunction.call(main.sceneManager.network3d, a, b);
        }

    },

    beforeDoClick: function() {

    },

    getRootView: function() {
        return this.searPanel;
    },

    setData: function(conditions) {
        var results = this.linkFinder.find(conditions);
        var treeNodes = null;
        if (!results || results.length < 1) {
            // this.treeView.clearTreeData();
            this.treeView.setData(null);
        } else {
            this.addRoot(results);
            treeNodes = this.orgTreeManager.organizeTree(results);
            this.treeView.setData(treeNodes, false);
        }
        this.setResult(results, treeNodes);
    },

    addRoot: function(results) {
        if (!results || results.length < 1) {
            return null;
        }
        var id = this.getCurrentRootId() || "";
        var name = this.getCurrentRootId() || "";
        var floor = new it.Link({ id: id, name: name });
        results.push(floor);
    },

    getCurrentRootId: function() {
        var rootNode = this.sceneManager.getCurrentRootNode();
        if (!rootNode) return null;
        var rootData = this.sceneManager.getNodeData(rootNode);
        if (rootData) {
            return rootData.getId();
        }
        return null;
    },

    mouseOverTreeNode: function(treeData) {
        if (!treeData) {
            return;
        }
        var id = treeData.id;
        if (id) {
            //            var link = this.sceneManager.dataManager.getLinkById(id);
            //            if (link) {
            ////                this.sceneManager.network3d.getDataBox().getSelectionModel().clearSelection();
            ////                assetNode.setSelected(true);
            //            }
        }
    },
    /*
    * 连线搜索树的点击事件
    * 在点击的时候加载node
    * node的加载是异步的
    * 所以所有依赖node的操作都要放在加载完的callback里
    * node加载完是在loadlazydata的回调里
    */

    clickTreeNode: function(treeData,cb, scope) {
        if (!treeData) {
            return null;
        }
        var self = this;
        var id = treeData.id;
        if (id) {
            var gcsManager = this.sceneManager.gcsManager;
            gcsManager.clearAllLink();
            var link = this.dataManager.getLinkById(id);
            if (!link) return null;
            /*
            var links = this.showLinkByName(link.getName());
            if (links) {
                var nodeMap = [];
                this.sceneManager.viewManager3d.defaultMaterialFilter.addAll();
                for (lId in links) {
                    var item = links[lId];
                    var fN = this.sceneManager.getNodeByDataOrId(item.getFromId());
                    var tN = this.sceneManager.getNodeByDataOrId(item.getToId());
                    if (!nodeMap.includes(fN)){
                        nodeMap.push(fN);
                    }
                    if (!nodeMap.includes(tN)) {
                        tN.setClient('_relLinkId', lId); //将link放到to上，当镜头播放到to上后，会找到这条link然后闪两下
                        nodeMap.push(tN);
                    }
                    this.sceneManager.viewManager3d.defaultMaterialFilter.remove(this.sceneManager.getNodeData(fN));
                    this.sceneManager.viewManager3d.defaultMaterialFilter.remove(this.sceneManager.getNodeData(tN));
                }
                // var linkNode = this.sceneManager.linkMap[id];
                this.defaultEventHandler.lookAtElements(nodeMap);
                // this.defaultEventHandler.lookAt(this.sceneManager.linkMap[lId]);
                this.defaultEventHandler.afterLookAtFunction(this.sceneManager.linkMap[lId]);
                setTimeout(function() {
                    self.playLookAtCamera(nodeMap);
                }, 3000);
            } else {
                */
        var callback = function(scop){
            var fromNode = scop.sceneManager.getNodeByDataOrId(link.getFromId());
            var toNode = scop.sceneManager.getNodeByDataOrId(link.getToId());
            if (!fromNode || !toNode) {
                return null;
            }
            if (scop.box3D.getDataById(fromNode.getId()) && scop.box3D.getDataById(toNode.getId())) {
                var linkNode = scop.sceneManager.linkMap[id];
                scop.defaultEventHandler.lookAt(linkNode);
            }
            gcsManager.lock();
            cb(scope);
        };

        gcsManager.showLinkByLinkId(link, true, true, false , callback, self);

        var compLink = [];
        var fData = this.dataManager.getDataById(link.getFromId());
        compLink.push({
            id: fData.getId(), 
            type: fData.getBusinessTypeId()
        });
        compLink.push({
            lineId: link.getId()
        });
        var tData = this.dataManager.getDataById(link.getToId());
        compLink.push({
            id: tData.getId(),
            type: tData.getBusinessTypeId()
        });
        return compLink;
        }
    },

    /**
     * 根据name显示所有的name一样的Link
     */
   /* //不再有按name分组了 —— 2017-09-20
    showLinkByName: function(name) {
        if (!name) {
            return;
        }
        if (!name.startsWith('mul')) {
            return;
        }
        var links = {};
        for (var id in this.sceneManager.dataManager._linkMap) {
            var link = this.sceneManager.dataManager._linkMap[id];
            if (link && link.getName() == name) {
                links[id] = link;
                this.sceneManager.gcsManager.showLinkByLinkId(id, true, false, true);
            }
        }
        return links;
    },
    */

    clearSearch: function(isClearInput) {
        // this.treeView.clearTreeData(); //2017-10-26 不能这么搞，这样的话添加的之前加的on不会被清除，会导致点击节点时会点击事件会触发多次
        // this.treeView.setData(null);
        this.sceneManager.gcsManager.clearAllLink();
        this.sceneManager.viewManager3d.defaultMaterialFilter.clearAll();
        if(!isClearInput) {
            this.inputPane.clearInput();
        }
        // lookAt调动镜头还是交给上一层来处理吧，这里处理好虚幻就好
        // // 清除后，lookAt也得有所改变，否则旁边的虚化有些不太协调，那就lookAt整个楼层把
        // var currentRootNode = this.sceneManager.getCurrentRootNode();
        // if (currentRootNode) {
        //     this.defaultEventHandler.lookAt(currentRootNode);
        // }
        // this.sceneManager.viewManager3d.defaultMaterialFilter.clearAll();
    },

    playLookAtCamera: function(nodeMap, i) {
        i = i || 0;
        if (nodeMap && nodeMap.length > i) {
            var camera = this.sceneManager.network3d.getCamera();
            var node = nodeMap[i];
            var target = node.getWorldPosition();
            var pos = this.getCameraPosition(node);
            var self = this;
            var callBack = function() {
                setTimeout(function() {
                    var twinkle = function() {
                        if ((i + 1) >= nodeMap.length) {
                            self.defaultEventHandler.lookAtElements(nodeMap); //最后又回到全局
                        } else {
                            self.playLookAtCamera.call(self, nodeMap, ++i);
                        }
                    }
                    var linkId = node.getClient('_relLinkId'); //只有toNode上有次属性
                    if (linkId && self.sceneManager.linkMap[linkId]) {
                        self.lineTwinkleAnimate(self.sceneManager.linkMap[linkId], twinkle);
                    } else {
                        twinkle();
                    }
                }, 1000); //停顿0.5秒
            }
            it.Util.playCameraAnimation(camera, pos, target, 5000, callBack);
        }
    },

    getCameraPosition: function(targetNode) {
        if (!targetNode) {
            return null;
        }
        var target = targetNode.getWorldPosition();
        // var pos = target.clone().add(targetNode.direction(new mono.Vec3(0,1,3)).multiplyScalar(2000));
        var pos = target.clone().add(targetNode.direction(new mono.Vec3(0, 1, 8)).multiplyScalar(500));
        return pos;
    },

    /**
     * 先全局看整个link然后link闪烁
     */
    lineTwinkleAnimate: function(link, callBack) {
        if (!link) {
            return;
        }

        var animate = new mono.Animate({
            from: 0,
            to: 1,
            dur: 500,
            repeat: 2,
            onUpdate: function(value) {
                link.setStyle('m.transparent', true);
                link.setStyle('m.opacity', 0.3 + value * 0.7);
            },
            onStop: function() {
                link.setStyle('m.transparent', false);
                callBack && callBack();
            }
        });
        // animate.play();
        var endCallBack = function() {
            animate.play();
        }
        this.defaultEventHandler.moveCameraForLookAtLink(link, endCallBack, 5000);
    },

    /**
     * 处理3D的对象
     */
    setResult: function() {

    }
});

it.LinkFinder = function(dataManager, sceneManager) {
    it.LinkFinder.superClass.constructor.call(this, dataManager);
    this.sceneManager = sceneManager;
};

mono.extend(it.LinkFinder, it.DataFinder, {

    /**
     * 重写获取数据源的方法
     */
    getDatas: function() {
        //        return this.dataManager.getLinks(); // 返回的应该是跟当前场景有关的所有的link，并不是“所有”
        var allLink = this.dataManager.getLinks();
        if (!allLink || !this.getCurrentRootData()) {
            return allLink;
        }
        var result = [];
        var box3d = this.sceneManager.network3d.getDataBox();
        for (var i = 0; i < allLink.length; i++) {
            var link = allLink[i];
            if (link) {
                // var fromNode = this.sceneManager.getNodeByDataOrId(link.getFromId());
                // if(fromNode && box3d.getDataById(fromNode.getId())){
                //     result.push(link);
                //     continue;
                // }
                if (this.sceneManager.isCurrentSceneInstance(link.getFromId())) {
                    result.push(link);
                    continue;
                }
                // var toNode = this.sceneManager.getNodeByDataOrId(link.getToId());
                // if(toNode && box3d.getDataById(toNode.getId())){
                //     result.push(link);
                //     continue;
                // }
                if (this.sceneManager.isCurrentSceneInstance(link.getToId())) {
                    result.push(link);
                    continue;
                }
            }
        }
        return result;
    },

    getCurrentRootData: function() {
        var rootNode = this.sceneManager.getCurrentRootNode();
        if (!rootNode) return null;
        var rootData = this.sceneManager.getNodeData(rootNode);
        return rootData;
    },

    /**
     * 便于给其他的类型扩展
     * @param id
     * @returns {*}
     */
    getDataById: function(id) {
        return this.dataManager.getLinkById(id);
    },

});


it.LinkSearchPanel = function() {
    it.BasePanel.call(this);
    this.init();
};


mono.extend(it.LinkSearchPanel, it.BasePanel, {

    init: function() {
        var sdata = new it.SData('link_key_text', null, null, it.util.i18n("LinkSearch_Input_ID")); //inputIndex,inputType,label,placeholder
        sdata.setKey('id');
        sdata.setOperation('like');
        sdata.setStyle('background: url("./css/images/insidesearch.svg") no-repeat scroll right center;background-position-x: 98%;');
        this.addQuick(sdata);
        this.addButtonRow();
    }

});