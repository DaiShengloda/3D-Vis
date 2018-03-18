function $BreadcrumbMgr(sceneManager, name, parent) {
    it.BaseMgr.call(this, sceneManager, name, parent);
    this.c = ['breadcrumb'];
    if (this.sceneManager) {
        this.defaultEventHandler = this.sceneManager.viewManager3d.getDefaultEventHandler();
    }
    // 表示通过面包屑产生的lookAt动画的状态，true表示在动画中
    this.isLookAtByBreadcrumb = false;
}
mono.extend($BreadcrumbMgr, it.BaseMgr, {

    initView: function () {
        var self = this;
        var $box = this.$box = $('<div></div>').appendTo(this.parent);
        $box.addClass(this.name);
        $box.hide();
    },

    _init: function () {
        var self = this;
        this.$box.css('top', '0px');
        this.$box.css('left', '0px');
        this.$box.breadcrumb({
            items: [],
            toggleOverview: function (e, data) {
                self._expand = data.expand;
                if (data.expand) {
                    self.showOverview();
                } else {
                    self.hideOverview();
                }
            },
            click: function (e, data) {
                self.clickHandler(e, data);
            },
            home: function (e, data) {
                self.clickHandler(e, data);
            },
            ctrlMouseEnter: function (e, ctrl) {
                var content;
                if (ctrl.hasClass('bt-arrow-open')) {
                    content = it.util.i18n("BreadcrumbMgr_Close_Map");
                } else {
                    content = it.util.i18n("BreadcrumbMgr_Open_Map");
                }
                layer.tips(content, ctrl, { tips: [2, '#356f87'], time: 1000 });
            },
            homeMouseEnter: function (e, btn) {
                layer.tips(it.util.i18n("BreadcrumbMgr_Return"), btn, { tips: [2, '#356f87'], time: 1000 });
            },
            getRootDataId: this.getRootDataId(),
        });
        this.sceneChangeHandler();
        // main.sceneManager.network3d.addInteractionListener(function (e) {
        //     console.log(e)
        // })
    },
    isShowOverview: function () {
        return !!this._expand;
    },

    getRootDataId: function () {
        var id = main.loadDataManager.getIdFromLocation();
        if (!id) {
            var scene = main.sceneManager.dataManager.getRootScene();
            var sceneData = scene && scene.__currentRootData;
            id = sceneData && sceneData._id;
        }
        // console.log(id);
        return id;
    },

    clickHandler: function (e, ele) {
        var rootSceneId,
            rootData,
            dm = this.sceneManager.dataManager,
            self = this,
            rootScene = dm.getRootScene();
        if ($(e.currentTarget).hasClass('home-icon')) {
            if (rootScene) {
                var rootCategoryId = rootScene.getCategoryId();
                var dataMap = dm.getDataMapByCategory(rootCategoryId);
                for (var id in dataMap) {
                    rootData = dataMap[id];
                    var bo = this.sceneManager.dwRootScene(rootData, rootCategoryId);
                    if (!bo) continue;
                    rootSceneId = id
                    break;
                }
            }
        };
        var id = rootSceneId || ele.id;
        var data = this.sceneManager.dataManager.getDataById(id);
        var node = this.sceneManager.getNodeByDataOrId(id);
        if (node && this.sceneManager.dataManager.getCategoryForData(data)._id == 'dataCenter' && ele.current == 'current') {
            return;
        }

        //过滤link锁定的情况
        if (!main.sceneManager.doubleClickBackgroundGotoUpLevelScene) {
            return;
        }
        // 过滤掉正在切换场景的情况
        if (!main.sceneManager.viewManager3d.enableDBLClick) {
            return;
        }
        // 通过node判断场景是否已经加载
        if (node || this.sceneManager.dataManager.getCategoryForData(data)._id == 'earth') {
            if (!this.sceneManager.isCurrentSceneInstance(data)) {
                var sceneAndRootData = this.sceneManager.getSceneAndRootByData(data);
                if (this.defaultEventHandler.afterLookAtFunction) {
                    this.defaultEventHandler.afterLookAtFunction(data);
                    if (sceneAndRootData) {
                        this.isLookAtByBreadcrumb = true;
                        this.sceneManager.gotoScene(sceneAndRootData.scene, sceneAndRootData.rootData, function () {
                            if (self.sceneManager.dataManager.getCategoryForData(data)._id == 'dataCenter') {
                                self.defaultEventHandler.lookAtByData(data);
                                //add 20161221，从floor进入building时，不会调用镜头重置，所以这里单独调用一下
                                //add 20171206，从floor进入building时，不一定要看根场景
                                self.sceneManager.cameraManager.finalCameraFunction(sceneAndRootData.scene, data, null, null, function () {
                                    self.isLookAtByBreadcrumb = false;
                                });
                            } else {
                                self.isLookAtByBreadcrumb = false;
                            }
                            self.updateBreadcrumb(data);
                        });
                    }
                }
            } else {
                this.isLookAtByBreadcrumb = true;
                this.defaultEventHandler.lookAtByData(data, function () {
                    self.isLookAtByBreadcrumb = false;
                });
            }
        }
    },
    sceneChangeHandler: function (e) {
        var scene = main.sceneManager.getCurrentScene();
        var oldScene;
        var oldSceneCategoryId;
        if (e) {
            oldScene = e.oldData;
            if (!oldScene) {
                return;
            };
            this.oldScene = oldScene;
            oldSceneCategoryId = oldScene.getCategoryId();
        }
        if (!scene) return;
        if (scene.getCategoryId() == 'earth') {
            this.$box.breadcrumb('whenEarthScene');
            return;
        }
        if (scene.getCategoryId() == 'dataCenter') {
            if (oldSceneCategoryId == 'earth') { //单独处理从地球到园区
                if (main.panelMgr.instanceMap["BreadcrumbMgr"]) {
                    //main.panelMgr.instanceMap["BreadcrumbMgr"].$box.hide();
                    return;
                }
            }
            if (oldSceneCategoryId == 'floor') { //单独处理从楼层到园区
                var node = main.sceneManager.viewManager3d.getFocusNode();
                var data = main.sceneManager.getNodeData(node);
                this.updateBreadcrumb(data);
                return
            }
            var sceneData = this.sceneManager._currentRootData;
            this.updateBreadcrumb(sceneData);
            this.hideOverview();
            this.$box.breadcrumb('whenDataCenterScene');
            return;
        }
        this.$box.breadcrumb('whenFloorScene');
        var data = this.sceneManager._currentRootData;
        this.updateBreadcrumb(data);
    },
    afterLookAtHandler: function (node) {
        var data = this.sceneManager.getNodeData(node);
        this.updateBreadcrumb(data);
    },
    afterLookFinishedAtHandler: function (node) {
        var data = this.sceneManager.getNodeData(node);
        this.updateBreadcrumb(data);
    },
    updateBreadcrumb: function (data) {
        if (!data) {
            return;
        }
        // this.show();
        var items = this.getItems(data);
        items.reverse();
        this.$box.breadcrumb('option', 'items', items);
        // var h = $('.breadcrumb-box').height() + 15;
        // var h = $('.breadcrumb-box').innerHeight();
        // main.panelMgr.invoke('OverviewMgr', 'setLocation', [0, h]);
    },
    _show: function () {
        var node = main.sceneManager.viewManager3d.getFocusNode();
        if (!node) {
            node = main.sceneManager._currentRootNode;
        }
        if (!node) return;
        var data = main.sceneManager.getNodeData(node);
        this.updateBreadcrumb(data);
    },
    doBtnOff: function () {
        this.$box.breadcrumb('doBtnOff');
        this._expand = false;
    },
    getItems: function (data, r) {
        r = r || [];
        r.push({
            id: data.getId(),
            label: data.getName() || data.getId(),
        })
        var parent = this.sceneManager.dataManager.getParent(data);
        var category = this.sceneManager.dataManager.getCategoryForData(data)._id;
        if (parent && category != 'dataCenter') {
            this.getItems(parent, r);
        }
        return r;
    },
    getRootData: function () {
        var roots = this.sceneManager.dataManager.getRoots();
        return { id: roots[0]._id }
    },
    showOverview: function () {
        // var h = $('.breadcrumb-box').height() + 15;
        // var h = $('.breadcrumb-box').innerHeight();
        // main.panelMgr.invoke('OverviewMgr', 'setLocation', [0, h]);
        if (main.panelMgr.instanceMap.OverviewMgr) {
            main.panelMgr.instanceMap.OverviewMgr.show();
        } else {
            console.warn('请加载 : ' + 'OverviewMgr');
            return;
        }

    },
    hideOverview: function () {
        if (main.panelMgr.instanceMap.OverviewMgr) {
            main.panelMgr.instanceMap.OverviewMgr.hide();
        } else {
            console.warn('请加载 : ' + 'OverviewMgr');
            return;
        }
    }
})
it.BreadcrumbMgr = $BreadcrumbMgr;