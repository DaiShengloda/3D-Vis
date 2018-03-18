var NodeEventHandler = function () {
    it.EventHandler.call(this);

    // this.info = info;
    this.serverPanel = new $ServerPanel(main.sceneManager);
    var sm = main.sceneManager;
    this.baseTab = new $GeneralInfo(sm);
    this.panelTab = new it.DevPanelManager(sm);
    this.loadTabPanel = new $LoadTabPanel(sm);
    this.routePanel = new it.RoutePanel(sm);
    this.serverTab = new $ServerTab(sm);
    this.virtualDeviceTab = new $VirtualDeviceTab(sm);
    this.installTabApps();
    this.handleDoubleClickElementFunction = null;
};

mono.extend(NodeEventHandler, it.EventHandler, {

    installTabApps: function () {
        var self = this;
        //this.serverPanel.register(this.baseTab);
        this.serverPanel.register(this.panelTab);
        //this.serverPanel.register(this.loadTabPanel);
        // this.serverPanel.register(this.routePanel);
        this.serverTab.doCustomTab = function (data, lastIndex) {
            var category = this.sceneManager.dataManager.getCategoryForData(data);
            lastIndex = lastIndex || 0;
            lastIndex = lastIndex + 1;
            if (category && category.getUserData('performanceUrl')) {
                var cusSrc = category.getUserData('performanceUrl');
                if (cusSrc && cusSrc instanceof Array) {
                    for (var i = 0; i < cusSrc.length; i++) {
                        var obj = cusSrc[i];
                        if (obj.src) {
                            var tabApp = new $CustomInfo(main.sceneManager);
                            tabApp.setTitle(obj.title);
                            tabApp.setURL(obj.src, data.getId());
                            self.serverTab.appendOneTab(tabApp, (lastIndex + i));
                            tabApp.afterShow();
                        }
                    }
                }
            }
        }
    },

    installCustomTabApps: function () {

    },

    shouldHandleDoubleClickElement: function (element, network, data, clickedObj) {
        // var category = main.sceneManager.dataManager.getCategoryForData(data);
        // if (category && 
        //     (category.getId().indexOf('equipment') >= 0 
        //      || category.getId().indexOf('card') >= 0
        //      || category.getId().toLowerCase() === 'headerrack'
        //      || category.getId().indexOf('camera') >= 0
        //     )) {
        //     return true;
        // }else{
        //     return false;
        // }

        //add by Kevin 虚幻的对象也不可点击，这样处理可能更好，而不是通过设置network的setSelectTransparencyThreshold来处理
        // 其实不仅仅是这个地方，也不仅仅是getDefaultVirtual上的isVirtual,而是view3d上的
        var virtualManager = main.sceneManager.viewManager3d.getDefaultEventHandler().getDefaultVirtual();
        if (virtualManager && virtualManager.isVirtual(data)) {
            return false;
        }
        return true;
    },

    handleDoubleClickElement: function (element, network, data, clickedObj) {
        var category = main.sceneManager.dataManager.getCategoryForData(data);
        if (!category) {
            return;
        }
        var categoryId = category.getId().toLowerCase();
        // if (category.getId().toLowerCase() === 'headerrack') {
        //     //显示列头柜信息
        //     var prPanel = new it.PowerRackPanel();
        //     prPanel.show();
        // } 
        if (categoryId.indexOf('camera') >= 0) {
            this.showVideoDialog('Camera #: C300-493A  |  Status: OK', data);
        } else if (categoryId.indexOf('equipment') >= 0 || categoryId.indexOf('card') >= 0) {
            if (element.getClient('virtual_device')) {
                // 显示虚拟机
                // main.virtualDeviceManager.showVirtualDeviceInfo(element);
            } else {
                // this.info.showInfoDialog(element, network, data, clickedObj);
                // this.serverPanel.showServerPanel(data);
                // if ($('#shebeixinxi').length != 0) {
                //     main.panelMgr.instanceMap.NavBarMgr.$box.nav('clickNavIcon', 'shebeixinxi');
                // } else {
                //     this.serverPanel.showServerPanel(data);
                // }
                var focusNode = main.sceneManager.viewManager3d.getFocusNode(),
                    focusData = main.sceneManager.getNodeData(focusNode),
                    focusCategory = main.sceneManager.dataManager.getCategoryForData(focusData),
                    focusCategoryId = focusCategory.getId().toLowerCase();
                if (focusCategoryId.indexOf('equipment') >= 0) {
                    main.panelMgr.instanceMap.NavBarMgr.$box.nav('clickNavIcon', 'jibenxinxi');
                }
            }
        } else if (categoryId.indexOf('filebox') >= 0 && main.loadFiles) {
            if (!main.fv) {
                main.fv = new FileView();
                main.fv.init()
            }
            //加载文件
            main.loadFiles(data.getId(), function (fs) {
                main.fv.show(fs, data.getId());
            })
        } else {
            // 在整理下发订单的时候，缓存此资产的订单状态，看此资产是否有订单，如果有show, 否则，nothing
            this.showRealTimeDialog(data);
        }
        this.handleDoubleClickElementFunction && this.handleDoubleClickElementFunction(element, network, data, clickedObj);

    },

    showRealTimeDialog: function (data) {
        // var data = main.sceneManager.getNodeData(element);
        if (!data) {
            console.log('data is null');
            return
        }
        var id = data.getId();

        var realtimeUrl = null; //'http://twaver.servasoft.com/';
        if (dataJson.realtimeUrl) {
            realtimeUrl = dataJson.realtimeUrl;
            if (id) {
                realtimeUrl += '?id=' + id;
            }
        }
        if (realtimeUrl && dataJson.layerOpen) {
            dataJson.layerOpen(realtimeUrl);
            return;
        }


        if (!main.monitorManager.checkToShow(id)) return;
        if (!main.RealtimeDynamicEnviroManager.hasRelation(id)) return;

        var realtimeUrl = null; //'http://twaver.servasoft.com/';
        if (dataJson.realtimeUrl) {
            realtimeUrl = dataJson.realtimeUrl;
            if (id) {
                realtimeUrl += '?id=' + id;
            }
        }
        if (realtimeUrl) {
            layer.open({
                type: 2,
                title: '实时数据',
                shadeClose: true,
                shade: false,
                maxmin: true, //开启最大化最小化按钮
                area: ['893px', '600px'],
                content: realtimeUrl
            });
        } else {
            it.ViewTemplateManager.showView(id, function (view) {
                view = view.getView();
                var $content = $('#realTimeContent');
                if (!$content.length) {
                    $content = $('<div id="realTimeContent"></div>');
                    $(document.body).append($content);
                }
                $content.empty();
                $content.append(view);
                layer.open({
                    shade: 0,
                    type: 1,
                    title: '实时数据',
                    shade: false,
                    maxmin: true, //允许全屏最小化
                    skin: 'layui-layer-rim', //加上边框 layui-layer-rim
                    content: $content,
                    success: function (layero, index) {
                        var $layero = $(layero)
                        $layero.css({
                            minWidth: '400px',
                            minHeigth: '200px',
                            left: (parseInt($layero.css('left')) - 200) + 'px',
                            top: (parseInt($layero.css('top')) - 100) + 'px'
                        });
                        // main.RealtimeDynamicEnviroManager.monitorAssetData(id);
                    },
                    end: function () {
                        it.ViewTemplateManager.hideView(data.getId());
                        // main.RealtimeDynamicEnviroManager.clearMonitorData(id);
                    }
                });
            });
        }

    },

    showVideoDialog: function (title, data) {
        // var video = document.createElement('video');
        // video.setAttribute('src', './images/test.mp4');
        // video.setAttribute('controls', 'true');
        // video.setAttribute('autoplay', 'true');
        // video.setAttribute('width', 610);
        // video.setAttribute('height', 610);
        // // var self = this;
        // video.oncanplay = function () {
        //     main.afterLookAtManager.showDialog(video, title, video.width, video.height);
        // }
        if (main.videoManager) {
            main.videoManager.show(data.getId());
        } else {
            var videoManager = it.VideoManager.getInstance();
            setTimeout(function () {
                main.videoManager.show(data.getId());
            }, 1000)
        }


    },
});