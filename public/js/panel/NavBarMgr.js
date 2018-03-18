var $NavBarMgr = function (sceneManager, name, parent) {
    it.BaseMgr.call(this, sceneManager, name, parent);
    this.appChangeDispatcher = new mono.EventDispatcher();
    this.itemMap = {};
};

mono.extend($NavBarMgr, it.BaseMgr, {

    _init: function () {
        var self = this;
        // this.appManager = new fa.AppManager(this.sceneManager);
        // this.$box.parent().css({
        //     overflow: 'hidden',
        //     position: 'absolute',
        //     width: '100%',
        //     height: '170px',
        //     bottom: 0,
        // });
        this.appManager = main.navBarManager.appManager;
        this.$box.css('left', '40%');
        this.$box.css('bottom', '24px');
        this.$box.nav({
            items: [],
            click: function (e, data) {
                self.clickHandler(e, data, data.cancel);
            },
            unSelected: function (e, data) {
                self.clickHandler(e, data, true);
            },
        });
        this.sceneManager.viewManager3d.addPropertyChangeListener(function (event) {
            if (event && event.property == "focusNode") {
                var node = event.newValue;
                var oldNode = event.oldValue;
                self._focusChangeHandle(node, oldNode);
            }
        });

        this.addAppChangeListener(this.customAppChangeHandler, this);
    },

    doCustomApp: function (app) {
        var self = this;
        self.appChangeDispatcher.fire({
            kind: 'doCustomApp',
            data: app,
            scope: self
        });
    },
    doCustomAppFinished: function (app) {
        var self = this;
        self.appChangeDispatcher.fire({
            kind: 'doCustomAppFinished',
            data: app,
            scope: self
        });
    },
    doCustomAppChangeNavbar: function (app,focus) {
        var self = this;
        self.appChangeDispatcher.fire({
            kind: 'doCustomAppChangeNavbar',
            focus: focus,
            data: app,
            scope: self
        });
    },
    addAppChangeListener: function (listener, scope, ahead) {
        this.appChangeDispatcher.add(listener, scope, ahead);
    },

    removeAppChangeListener: function (listener, scope) {
        this.appChangeDispatcher.remove(listener, scope);
    },

    customAppChangeHandler: function (e) {
        if (e && e.kind == 'doCustomApp') {
            e.scope.$box.hide();
            $('.ToolbarMgr').toggle();
            $('.BreadcrumbMgr').toggle();
            $('.infoPanel').toggle();
            $('.floor-panel-box').toggle();
        } else if (e && e.kind == 'doCustomAppFinished') {
            e.scope.showBySceneId('ITVM');
        } else if(e && e.kind == 'doCustomAppChangeNavbar'){
            e.scope.showBySceneId(e.focus);
        } 
    },

    // 为什么在basemgr里面添加了时间监听，但是这里没有触发
    sceneChangeHandler: function (e) {
        if (e.kind != 'changeScene') return;
        var rootData = e.rootData;
        // var clearItSearch = true;
        // if (this.appManager.defaultApp) {
        //     clearItSearch = !this.appManager.defaultApp.isShow();
        // }
        // this.onresize();
        if (!rootData) return;
        var oldScene = e.oldData;
        var oldSceneCategoryId;
        if (oldScene) {
            oldSceneCategoryId = oldScene.getCategoryId();
        };
        var scene = e.data;
        var sceneId = scene.getId();
        var sceneCategoryId = scene.getCategoryId();

       // if (sceneId == 'earth' || oldSceneCategoryId == 'floor') {
        //     clearItSearch = true;
        // }
        this.appManager.reset({
            isResetCamera: false,
            isDealDefaultApp: true,
        });
        // this.appManager.defaultApp.showing = true; // reset中无法设置其showing的标准

        this.showBySceneId(sceneId, oldSceneCategoryId);
    },

    // 统统都放到focusChangeNode中来处理
    /*
    afterLookAtHandler: function (node) {
        this.$box.hide();
        this.$box.nav('clear');
    },

    afterLookFinishedAtHandler: function (node) {
        var data = main.sceneManager.getNodeData(node);
        var dt = main.sceneManager.dataManager.getDataTypeForData(data);
        var categoryId = dt.getCategoryId();
        //如果 floor 场景聚焦的非 floor 那么隐藏nav
        var cid = main.sceneManager.getCurrentScene().getCategoryId();
        if (categoryId == 'dataCenter' ||categoryId == 'floor' || categoryId == 'rack' || categoryId == 'equipment') {
            if (this.isShow()) {
                this.$box.show();
            }
            this.showBySceneId(categoryId);
        }
    },
    */

    _focusChangeHandle: function (focusNode, oldFocusNode) {
        // oldFocusNode，新增了一个旧的node的参数
        //设备下架中，从一个机柜到另一个机柜的时候，应该关闭app
        var lastAppId = this._lastAppId;
        var isCloseApp = lastAppId &&
            this.appManager.appMaps[lastAppId.appId] &&
            this.appManager.appMaps[lastAppId.appId].ifCloseWhenFocusChange(focusNode, oldFocusNode);
        if (isCloseApp == false) {
            this.$box.nav('clearAndIfClose', false);
        } else { //isCloseApp为true 或者 isCloseApp为undefined
            this.$box.nav('clearAndIfClose', true);
            if (isCloseApp) {
                this.clickHandler(undefined, this._lastAppId, true)
            }
        }
        this.$box.hide();
        var data = this.sceneManager.getNodeData(focusNode);
        var dt = this.sceneManager.dataManager.getDataTypeForData(data);
        var categoryId = dt.getCategoryId();
        //如果 floor 场景聚焦的非 floor 那么隐藏nav
        var cid = this.sceneManager.getCurrentScene().getCategoryId();
        // if (categoryId == 'dataCenter' || categoryId == 'floor' || categoryId == 'rack' || categoryId == 'equipment') {
        //注释原因，因为实时数据图标除了这几个category外，其他category也需要显示   2017/12/14 chenghui
        if (this.isShow()) {
            this.$box.show();
        }
        this.showBySceneId(categoryId);
        // }
        if ($('#pdf_panel').attr('isopenpdfview')) {
            this.$box.css({
                'left': '20%',
                'transform': 'translate(-50%)'
            });
        }
        this.appManager.dealDefaultApp();
    },

    _show: function () {
        var node = main.sceneManager.viewManager3d.getFocusNode();
        if (!node) {
            node = main.sceneManager._currentRootNode;
        }
        if (!node) return;
        var data = main.sceneManager.getNodeData(node);
        var dt = main.sceneManager.dataManager.getDataTypeForData(data);
        var categoryId = dt.getCategoryId();
        if (categoryId == 'dataCenter' || categoryId == 'floor' || categoryId == 'rack' || categoryId == 'equipment') {
            this.showBySceneId(categoryId);
        } else {
            this.$box.hide();
            this.$box.nav('clear');
        }
    },

    showBySceneId: function (sceneId, oldSceneCategoryId) {
        var self = this;

        if (oldSceneCategoryId == 'earth') { //单独处理从地球到园区
            //this.$box.hide();
            return;
        }

        var focusNode = main.sceneManager.viewManager3d.getFocusNode();
        var focusData = main.sceneManager.getNodeData(focusNode);
        var focusCategory = main.sceneManager.dataManager.getCategoryForData(focusData);
        if (oldSceneCategoryId == 'floor' && focusCategory.getId() === "building") {
            // this.$box.hide();
            return;
        }

        if (sceneId == 'earth' || oldSceneCategoryId == 'floor') { //单独处理到地球时的navbar的状态
            this.$box.nav('clearAndIfClose', true);
        }

        if (main.noshow && sceneId == 'dataCenter') {
            this.$box.hide();
            return;
        }

        // //单独处理从园区到地球（杨兴康）
        // if (sceneId == 'earth' && oldSceneCategoryId == 'dataCenter') {
        //     var $selected = self.$box.children('ul').children('.selected');
        //     if ($selected.length > 0) {
        //         var id = $selected.attr('id');
        //         self.$box.nav('clickNavIcon', id);
        //     }
        // }
        var items;
        if (dataJson.navBars.items && dataJson.navBars.items.length) {
            items = dataJson.navBars.items;
        } else {
            items = this.items;
        }
        var results = this.filterItems(items, sceneId);
        this.itemMap = {};
        results.forEach(function (item) {
            self.itemMap[item.id] = item;
            if (item.items) {
                item.items.forEach(function (i) {
                    self.itemMap[i.id] = i;
                })
            }
        })
        this.$box.nav('option', 'items', results);
        // var totalWidth = $('body').width();
        // var width = this.$box.width();
        // var left = (totalWidth - width) / 2;
        // left = Math.max(left, 0);
        // this.$box.css({left: left + 'px', bottom: '0px',})
        var navLeft;
        if(!main.panelMgr.instanceMap.ToolbarMgr){//panelmgr各实例还未完成，此时pdf状态肯定为无
            navLeft = 50;
        }else{
            if (main.panelMgr.instanceMap.ToolbarMgr.toolbarMap.pdf.pdfManager.isOpenPdfView) {
                navLeft = 25;
            } else {
                navLeft = 50;
            }
        }    
        this.$box.css({
            'left': `${navLeft}%`,
            'transform': 'translateX(-50%)'
        })
        this.$box.stop().animate({
            bottom: '24px',
        });
        results.length > 0 && this.$box.show();
    },

    // filterItems: function (items, sceneId) {
    //     var self = this;
    //     var r = items.filter(function (item) {
    //         if (item.sceneId != null && item.sceneId.indexOf(sceneId) < 0) {
    //             return false;
    //         }
    //         return true;
    //     })
    //     r.forEach(function (item) {
    //         if (item.items && item.items.length > 0) {
    //             item.items = self.filterItems(item.items, sceneId);
    //         }
    //     })
    //     return r;
    // },
    filterItems: function (items, sceneId) {
        var self = this;
        return items.filter(function (item) {
            if (item.sceneId != null && item.sceneId.indexOf(sceneId) < 0) {
                return false;
            }
            if (item.items && item.items.length > 0) {
                item.items = self.filterItems(item.items, sceneId);
            }
            return true;
        })
    },

    /**
     * 给div添加click事件。
     * appId优先
     * click可以是function，也可以是string，
     * 如果是function的话，会把该域全进去，所有的应用的方法在this.apps中能找到；
     * 如果是string的话，认为该string是this.apps中的方法
     */
    clickHandler: function (e, data, cancel) {
        var scope = this;
        var id = data.id;
        if (!id) return;
        // 考虑到有些时候要关闭当前按钮没有显示出来的功能，因此把这一块重新写一下
        // 2017.12.14 add by lyz
        if (!this.itemMap[id] && !cancel) return;
        var item = this.itemMap[id];
        var paramaters = (item && item.paramaters) || {};
        var appId = (item && item.appId) || (cancel && this._lastAppId && this._lastAppId.appId) || id;
        var app = this.appManager.appMaps[appId];
        if (this.appManager.isContain(appId)) {
            if (cancel) {
                if (main.plugin.showRackNumber) main.plugin.showRackNumber.showAllBillboards();
                this.appManager.reset({
                    isResetCamera: false,
                    isDealDefaultApp: true,
                });
            } else {
                if (main.plugin.showRackNumber) main.plugin.showRackNumber.hideAllBillboards();
                this.appManager.doAppById(appId, paramaters);
            }
            main.panelMgr.instanceMap.NavBarMgr.$box.nav('option', 'menuSelected', null);
        }
        if (item && item.click) {
            item.click(item);
        }
        if (cancel) {
            this._lastAppId = null;
        } else {
            //当孩纸是选中状态时 点击父亲 不应该改变this._lastAppId --1/26 xu
            if(scope._lastAppId && item.items){
                for(var i=0;i<item.items.length;i++){
                    if(item.items[i].id == scope._lastAppId.id) return;
                }
            }
            this._lastAppId = {
                id: id,
                appId: appId,
            };
        }
    },
    
    items: [{
            id: 'sousuo',
            title: '搜索',
            class: 'icon-search',
            sceneId: 'dataCenter,floor',
            appId: 'IT_SEARCH',
        },
        {
            id: 'tianjiazichan',
            title: ' 添加资产',
            class: 'icon-plus-rectangle',
            sceneId: 'floor',
            appId: 'ASSETON',
        },
        {
            id: 'peixian',
            title: '配线',
            class: 'icon-link',
            sceneId: 'floor',
            appId: 'LINKSEARCH',
        },
        {
            id: 'huanjing',
            title: '环境',
            class: 'icon-envira',
            sceneId: 'floor',
            items: [{
                    id: 'wendu',
                    title: '温度云图',
                    class: 'icon-thermometer',
                    appId: 'TEMP',
                },
                {
                    id: 'shidu',
                    title: '温/湿度',
                    class: 'icon-humidity',
                    appId: 'TEMPANDHUM',
                },
                {
                    id: 'loushuijiance',
                    title: '漏水检测',
                    class: 'icon-water-leak',
                    appId: 'WATERLEAK'
                },
                {
                    id: 'fengxian',
                    title: '风向',
                    class: 'icon-air-flow',
                    appId: 'AIRFLOW'
                }
            ]
        },
        {
            id: 'rongliang',
            title: ' 容量',
            class: 'icon-capacity',
            sceneId: 'floor',
            items: [{
                    id: 'gonglvtongji',
                    title: '功率统计',
                    class: 'icon-power',
                    appId: 'POWER'
                },
                {
                    id: 'chengzhong',
                    title: '承重',
                    class: 'icon-weight',
                    appId: 'WEIGHT'
                },
                {
                    id: 'jiweitongji',
                    title: '机位统计',
                    class: 'icon-point-cube',
                    appId: 'SEAT',
                    paramaters: 1,
                },
                {
                    id: 'kongjianliyonglv',
                    title: '空间可用率',
                    class: 'icon-space-cube',
                    appId: 'SPACE_SEARCH',
                },
                {
                    id: 'weizhichaxun',
                    title: '位置查询',
                    class: 'icon-point-search',
                    appId: 'U_SEARCH'
                }
            ]
        },
        {
            id: 'xunhang',
            title: '巡航',
            class: 'icon-cruise',
            sceneId: 'dataCenter,floor',
            appId: 'CAMERA_ANIMATE'
        },
        {
            id: 'shujujiankong',
            title: '数据监控',
            class: 'icon-monitor',
            sceneId: 'floor',
            appId: 'REALTIME'
        },

        {
            id: 'shangjia',
            title: '上架',
            class: 'icon-server-on',
            sceneId: 'rack',
            appId: 'DEVON',
        },
        {
            id: 'xiajia',
            title: '下架',
            class: 'icon-server-off',
            sceneId: 'floor,rack',
            appId: 'DEVOFF',
        },
        {
            id: 'wendu',
            title: '微环境',
            class: 'icon-thermometer',
            sceneId: 'rack',
            appId: 'MICOENVIR',
        },
        {
            id: 'peixian',
            title: '配线',
            class: 'icon-link',
            sceneId: 'equipment',
            appId: 'EquipmentLink',
        },
        {
            id: 'duankou',
            title: '端口',
            class: 'icon-port',
            sceneId: 'equipment',
            appId: 'port',
        },
        {
            id: 'xunituopu',
            title: '虚拟拓扑',
            class: 'icon-topo',
            sceneId: 'equipment',
        },
        {
            id: 'jinchengliubiao',
            title: '进程列表',
            class: 'icon-jinchengliebiao',
            sceneId: 'equipment',
        },
        {
            id: 'cipanxinxi',
            title: '磁盘信息',
            class: 'icon-server',
            sceneId: 'equipment',
        },
        {
            id: 'shebeixinxi',
            title: '设备信息',
            class: 'icon-server-panel',
            sceneId: 'equipment',
            appId: 'EquipmentDetails'
        },
        {
            id: 'itv-cool-view',
            title: '冷气管道',
            class: 'icon-pipe',
            sceneId: 'floor',
            appId: 'COOLINGPIPE'
        }
    ]
});

it.NavBarMgr = $NavBarMgr;