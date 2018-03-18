main = main || {};

main.version = 'v2.5.2';

it.Util.compare = CompareStrings.compare;


main.hideHeader = function () {
    $('.itv-header').css('display', 'none').css('height', '0');
    $('.itv-content').css('top', '0');
};

main.showHeader = function () {
    $('.itv-header').css('display', 'block').css('height', '60');
    $('.itv-content').css('top', '60');
};

var Spinner = function (devId, sceneManager) {
    if (!devId) {
        devId = 'spinner';
    }
    this.spinner = $('#' + devId);
    this.sceneManager = sceneManager;
    this.init()
        // this.spinner.show();
};

function compute() { // 统计top x 顶点数
    var box = main.sceneManager.network3d.getDataBox();
    var maxArray = [];
    var arrayLength = 100;
    for (var i = 0; i < arrayLength; i++) {
        maxArray[i] = -1;
    }
    box.forEach(function (node) {
        if (node.vertices) {
            // max = Math.max(node.vertices.length,max);
            if (node.vertices.length == 138528) {
                console.log(node);
            }
            var len = node.vertices.length;
            for (var i = arrayLength - 1; i >= 0; i--) {
                if (len > maxArray[i]) {
                    for (var k = 0; k < i; k++) {
                        maxArray[k] = maxArray[k + 1];
                    }
                    maxArray[i] = len;
                    break;
                }
            }
        }
    });
    console.log(maxArray);
}

mono.extend(Spinner, Object, {

    init: function () {
        if (dataJson && dataJson.showHeader === false) {
            main.hideHeader();
        } else {
            main.showHeader();
        }
        // if (dataJson.showManuBar === false) {
        //     main.hideNavBar();
        // }
        if (this.sceneManager) {
            var self = this;
            // 加载速度太快了，根本来不及显示就到了另一个场景
            this.sceneManager.beforeLoadSceneFunction = function (scene, sceneRootData) {
                self.spinner.show();
                //进入到园区和地球时，都不需自动计算camera的位置
                if (scene && scene.getCategoryId() == 'dataCenter' || scene.getCategoryId() == 'earth') {
                    // self.sceneManager.resetCameraWhenSceneChange = false; // 还有保存镜头的，所以不能关闭2017-07-11
                    //进入地球时，用离开地球时的位置
                    if (scene.getCategoryId() == 'earth') {
                        var camera = self.sceneManager.network3d.getCamera();
                        var earthCamera = self.sceneManager.network3d.earthCamera;
                        if (earthCamera) {
                            var p = earthCamera.p;
                            var t = earthCamera.t;
                            camera.p(p.x, p.y, p.z);
                            camera.t(t.x, t.y, t.z);
                        }
                    }
                }
            };

            this.sceneManager.afterLoadSceneFunction = function () {
                //        setTimeout(function(){
                self.spinner.hide();
                //        },1000);
            };
        }
    },

    show: function () {
        if (this.spinner && this.spinner.length > 0) {
            this.spinner.show();
        }
    },

    hide: function () {
        if (this.spinner && this.spinner.length > 0) {
            this.spinner.hide();
        }
    }
});

function initNetwork() {
    var network3d = main.sceneManager.network3d;
    //    network3d.setClearColor('#000000');
    //    network3d.setClearAlpha(0);
    //    network3d.setBackgroundImage('./images/bg_network.jpg'); // ../images/earth/sky.jpg

    main.sceneManager.viewManager3d.setNetworkValue('clearColor', '#000000');
    main.sceneManager.viewManager3d.setNetworkValue('clearAlpha', 0);
    var backgroundImage = main.backgroundImage || '/images/bg_network3.jpg';
    //var backgroundImage = localStorage.backgroundImage ? localStorage.backgroundImage : './images/bg_network3.jpg';
    main.sceneManager.viewManager3d.setNetworkValue('backgroundImage', pageConfig.url(backgroundImage)); //./images/bg_network.jpg '../images/earth/sky.jpg'
    main.sceneManager.viewManager3d.setNetworkValue('blurScale', null);
    main.sceneManager.viewManager3d.setNetworkValue('blurGlobalAlpha', null);
    main.sceneManager.viewManager3d.setCameraValue('far', 50000);
    if (main.defaultBase64Image) mono.ImageUtils.registerDefaultImage(main.defaultBase64Image);

    //    network3d.setShowFps(true);
    main.sceneManager.doubleClickBackgroundGotoUpLevelScene = true; // 表示是否可以双击背景回到上一级

    var df = main.sceneManager.viewManager3d.getDefaultVirtualMaterialFilter();
    df.virtualFunction = function (data) {
        if (!data) {
            return true;
        }
        var dataType = main.sceneManager.dataManager.getDataTypeForData(data);
        if (dataType && dataType._noVirtualOther) {
            return false;
        }
        if (!dataType || !dataType.getModel()) {
            return true;
        }
        var m = dataType.getModel();
        var fitlerModels = [
            'twaver.idc.door_control', 'twaver.idc.camera', 'twaver.idc.roundCamera',
            'twaver.idc.tv', 'twaver.idc.post', 'twaver.idc.plant'
        ];
        var length = fitlerModels.length;
        for (var i = 0; i < length; i++) {
            if (m.indexOf(fitlerModels[i]) != -1) {
                return false;
            }
        }
        return true;
    }

    network3d.renderSelectFunction = function (element) {
        if (!element) return false;
        if (element instanceof mono.PathLink) {
            return false;
        }
        if (element.getClient('isSelectable')) {
            return true;
        }
        var data = main.sceneManager.getNodeData(element);
        if (data) {
            var category = main.sceneManager.dataManager.getCategoryForData(data);
            if (category && category.getId().toLowerCase().indexOf('rack') >= 0) { //只有
                return true;
            } else if (data.getId().toLowerCase().indexOf('camera') >= 0) {
                return true;
            }
            //            else if(category && category.getId().toLowerCase().indexOf('building')>=0){
            //                return true;
            //            }
        }
        if (element.getClient('type') && element.getClient('type') === "rack_door") { // isRackDoor
            return false;
        }
        return false;
    };
    if (dataJson.resetDataCenter !== false) {
        //园区的节点不需要根据data计算位置，用默认的0，0，0位置，放置到场景中间。data的位置是用来计算地球上数据中心的位置
        var orgComputePosition = main.sceneManager.computePosition;
        main.sceneManager.computePosition = function (data, parentData, node, parentNode) {
            var datatype = main.sceneManager.dataManager.getDataTypeForData(data);
            var modelId = datatype.getModel();
            if (make.Default.getOtherParameter(modelId, 'sdkCategory') != 'park') {
                // main.sceneManager.locationManager.computePosition(data,parentData,node,parentNode);
                orgComputePosition.call(main.sceneManager, data, parentData, node, parentNode);
            }
        }
    }

    mono.Styles.setStyle('select.width', 3);
    mono.Styles.setStyle('select.offset', 2);

};

function initSceneInfo() {
    var sceneInfo = main.sceneInfo = new it.SceneInfoPane({
        sceneManager: main.sceneManager,
        parent3D: $('#itv-main'), // main.sceneManager.network3d.getRootView(),
        parent2D: $('#itv-main'), //main.sceneManager.network2d.getView(),
        searchManager: main.searchManager,
    });
};

function initRightMenu() {
    var rightClickMenu = main.rightClickHandle = new it.RightClickMenu(main.sceneManager);
    rightClickMenu.init();
}

function init2DDailog() {
    var dialog = new it.NetworkDialog();
};

function initShadowNode() {
    var sceneManager = main.sceneManager;
    var resetShadow = false;
    var visibleFilter = function (data) {
        if (data.getClient('type') == 'column') return true;
        return sceneManager.viewManager3d.isVirtual(data) &&
            sceneManager.viewManager3d.isVisible(data) && 
            sceneManager.getDataBox()._nodeList.contains(data);
    };
    this.onRenderCallback = function (network) {
        if (resetShadow) {
            resetShadow = false;
            var currentRootNode = sceneManager.getCurrentRootNode();
            if (currentRootNode &&
                currentRootNode.getClient('type') == 'wall' &&
                sceneManager.viewManager3d.isVirtual(currentRootNode) &&
                sceneManager.viewManager3d.isVisible(currentRootNode)) {
                if (currentRootNode.floorNode) { // 如果有，就先去掉
                    currentRootNode.floorNode.setStyle('top.m.lightmap.image', null);
                }
                var floorNode = make.Default.generateShadowNode(currentRootNode, visibleFilter);
                currentRootNode.floorNode = floorNode;
            }
        }
    }

    sceneManager.viewManager3d.addRenderCallback(this);

    sceneManager.addSceneVirtualChangeListener(function (eve) {
        resetShadow = true;
    });
    sceneManager.addSceneVisibleChangeListener(function (eve) {
        resetShadow = true;
    });

    sceneManager.network3d.getDataBox().addDataBoxChangeListener(function (eve) {
        var currentSceneCategory = 'floor';
        if (main.sceneManager.getCurrentScene() &&
            main.sceneManager.getCurrentScene().getCategoryId()) {
            currentSceneCategory = main.sceneManager.getCurrentScene().getCategoryId();
        }
        if ((eve.kind == 'add' || eve.kind == 'remove') &&
            !(eve.data instanceof mono.Billboard) // 告警
            &&
            currentSceneCategory == 'floor') {
            resetShadow = true;
        }
    });

    sceneManager.viewManager3d.addPropertyChangeListener(function (e) {
        if (e.property == "focusNode") {
            var node = e.newValue;
            var oldNode = e.oldValue;
            if (!node || (node && node.getClient('type') != 'wall')) {
                sceneManager.network3d.getDataBox().forEach(function (data) {
                    if (data.floorNode) {
                        data.floorNode.setStyle('top.m.lightmap.image', null);
                    }
                });
            }
            if (oldNode && oldNode.getClient('type') == 'wall') { // 从floor回到其他的场景或聚焦到其他上时，阴影清除
                var descendants = oldNode.getDescendants();
                if (descendants && descendants.length > 0) {
                    for (var i = 0; i < descendants.length; i++) {
                        var data = descendants[i];
                        if (data.getClient('type') && 'floor' == data.getClient('type')) {
                            data.setStyle('m.lightmap.image', null);
                        }
                    }
                }
            }
            var data = main.sceneManager.getNodeData(node);
            // var datatype = main.sceneManager.dataManager.getDataTypeForData(data);
            // var categoryId = datatype.getCategoryId();
            var category = main.sceneManager.dataManager.getCategoryForData(data);
            if (category && (category.getId() != 'rack' && category.getId() != 'equipement')) {
                main.portStatusManager.clearAllPortsStatus();
            }
        }
    });

};

/**
 * 初始化具体的插件
 */
function intallSinglePlugin(plugin, packageName, parameters, callback, error) {
    if (!plugin) {
        return null;
    }
    it.util.loadJs(pageConfig.url('/plugin/' + plugin + '.js'), function () {
        if (packageName) {
            var package = window[packageName];
            if (package && package[plugin]) {
                var o = new package[plugin](parameters);
                callback && callback(o);
                return;
            }
        } else {
            if (window[plugin]) {
                var o = new window[plugin];
                callback && callback(o);
                return;
            }
        }
        error && error();
        console.error('load plugin error, plugin = ' + plugin)
    }, error);
}

/**
 * 初始化导航条，由于导航条上需要用到category和datatype，所以在load完data后再调用它
 * 
 */
function initNavbar() {
    var navBarManager = main.navBarManager = new it.NavBarManager(main.sceneManager);
    navBarManager.adjustBounds();
    var assetPanelMgr = main.assetPanelMgr = new it.AssetPanelMgr(main.sceneManager);
    var warningStatisticsMgr = main.warningStatisticsMgr = new it.WarningStatisticsMgr(main.sceneManager);
    var equipStatisticsMgr = main.equipStatisticsMgr = new it.EquipStatisticsMgr(main.sceneManager);
    var rackClickRotateMgr = main.rackClickRotateMgr = new it.RackClickRotateMgr(main.sceneManager);
    var loadConfig = main.loadConfig = new it.LoadConfig(main.sceneManager);
    var about = main.about = new it.About(main.sceneManager);
};
info = null;

/**
 * 加载最先的资源：地球场景上的几个图片
 */
var loadBeginSource = function (callback) {
    // http://localhost:8081/modellib/model/scene/images/glow.png
    var ps = [];
    //预加载地球需要的图片
    ps.push(new Promise(function (resolve, reject) {
        it.util.preLoadImage(pageConfig.url('/modellib/model/scene/images/sun.png'), resolve, reject);
    }));
    ps.push(new Promise(function (resolve, reject) {
        it.util.preLoadImage(pageConfig.url('/modellib/model/scene/images/glow.png'), resolve, reject);
    }));
    ps.push(new Promise(function (resolve, reject) {
        it.util.preLoadImage(pageConfig.url('/images/background.jpg'), resolve, reject);
    }));
    // 根据navbar中的配置，这里动态的装入插件,注意规范，只支持it.XXX,构造函数的参数只传了一个sceneManager
    if (dataJson.plugins && dataJson.plugins instanceof Array && dataJson.plugins.length > 0) {
        dataJson.plugins.forEach(function (plugin) {
            ps.push(new Promise(function (resolve, reject) {
                intallSinglePlugin(plugin, 'it', main.sceneManager, function (obj) {
                    if (obj) {
                        var name = plugin.charAt(0).toLowerCase() + plugin.substr(1);
                        main.plugin = main.plugin || {};
                        main.plugin[name] = obj;
                    }
                    resolve && resolve();
                }, reject)
            }))
        })
    }

    ps.push(new Promise(function (resolve, reject) {
        it.addExtraNecessaryJsFiles(resolve, reject);
    }))

    Promise.all(ps).then(function () {
        if (main.loadBeginSourceHandler) {
            main.loadBeginSourceHandler(callback);
        } else {
            callback && callback();
        }
    })
    make.Default.load({
        id: 'twaver.scene.earth'
    });
    make.Default.load({
        id: 'twaver.scene.datacenter'
    });
    make.Default.load({
        id: 'twaver.scene.skybox3'
    });
    // var network = new mono.Network3D();
    // network.setBackgroundImage(pageConfig.url('/modellib/model/scene/images/star_sky.jpg'));
    // this.loadImage('/modellib/model/scene/images/star_sky.jpg',callback);
};

/**
 * 初始化地球
 * 
 */
var initEarth = function () {
    if (dataJson && dataJson.earthView) {
        var earthViewClazz = dataJson.earthView.clazz;
        var sceneId = dataJson.earthView.sceneId || 'earth';
        var modelParams = dataJson.earthView.modelParams;
        var ces = null;
        if (window[earthViewClazz]) {
            ces = new window[earthViewClazz](sceneId, main.sceneManager, modelParams);
        } else if (window['it'][earthViewClazz]) {
            ces = new window['it'][earthViewClazz](sceneId, main.sceneManager, modelParams);
        }
        if (ces) {
            main.sceneManager.registerCustomSceneView(sceneId, ces);
        }
    }
}

var load = window.load = function () {
    var dataManager = new it.DataManager();
    var sceneManager = main.sceneManager = new it.SceneManager(dataManager);
    if (dataJson && dataJson.isClearCache) {
        sceneManager.isClearCache = true;
    }
    var loadDataManager = main.loadDataManager = new it.LoadData(sceneManager);
    it.util.setLanguage(dataJson.SetLanguage ? dataJson.SetLanguage : 'zh'); //语言配置
    // 创建系统事件总线
    main.eventBus = new EventEmitter();
    loadBeginSource(start);
}

var start = function () {
    var sceneManager = main.sceneManager;
    var dataManager = sceneManager.dataManager;
    var dataBox = main.dataBox = main.sceneManager.network3d.getDataBox();
    main.spinner = new Spinner('spinner', main.sceneManager);
    sceneManager.setDefaultInteractionSpeed(3, 1.5, 3);
    var mainDiv = document.getElementById('itv-main');
    if (!mainDiv) {
        mainDiv = document.body;
    }

    //url判定隐藏窗口
    main.showWindow = function () {
        var location = window.location;
        var search = location.search;
        search = search.replace("?", "");
        var ids = /showWindow=([^&]*)/.exec(search);
        if (ids == null) {
            return;
        }
        var id = ids[1];
        return id;
    }
    var showWindow = main.showWindow();
    if (showWindow && showWindow.startsWith('false')) {
        dataJson.showManuBar = false;
        dataJson.showBreadcrumb = false;
        dataJson.showRightToolBar = false;
        dataJson.showSceneInfoPane = false;
        dataJson.showPropertyPane = false;

    }
    if (main.extBeforeLoadDataFunction) {
        main.extBeforeLoadDataFunction();
    }

    initEarth();
    var id = main.loadDataManager.getIdFromLocation();
    var sceneCategoryId = 'earth';
    if (id) {
        sceneCategoryId = null;
    }
    mainDiv.appendChild(sceneManager.getSceneView(sceneCategoryId));
    // adjustBounds(); // add 2016-12-13 remove to navBarManager
    initNavbar();
    main.panelMgr = new it.PanelMgr(main.sceneManager);
    if (!dataJson.removeOverviewMgr) {
        main.panelMgr.initMehtodMap['OverviewMgr'] = 'hide';
    }
    // var navBarManager = main.navBarManager = new it.NavBarManager(main.sceneManager);
    // var itvToggleBtn = navBarManager.getItvToggleBtn();

    main.portStatusManager = new $PortStatusManager(main.sceneManager);
    main.sceneManager.viewManager3d.addEventHandler(main.inspectionManager);
    main.sceneManager.viewManager3d.addEventHandler(main.portManager);
    main.sceneManager.viewManager3d.enableMousemove = false;
    var getUpLevelDataByData = main.sceneManager.getUpLevelDataByData;
    main.sceneManager.getUpLevelDataByData = function (data) {
        var parentData = main.sceneManager.dataManager.getParent(data);
        if (parentData &&
            parentData._extend &&
            parentData._extend["isGroup"]) {
            return main.sceneManager.dataManager.getParent(parentData);
        }
        return getUpLevelDataByData.call(main.sceneManager, data);
    }
    var oldLastSceneFilter = main.sceneManager.lastSceneFilter;
    main.sceneManager.lastSceneFilter = function (data) {
        if (data && data._extend && data._extend["isGroup"]) {
            return false;
        }
        return oldLastSceneFilter.call(main.sceneManager, data);
    }

    var defHandle = main.sceneManager.viewManager3d.getDefaultEventHandler();
    var oldIsDoLookAt = defHandle.isDoLookAt;
    defHandle.isDoLookAt = function (node) {
        var data = main.sceneManager.getNodeData(node);
        if (data && data._extend && data._extend["isGroup"]) {
            return false;
        }
        return oldIsDoLookAt.call(defHandle, node);
    }

    main.cameraAnimateManager = new CameraAnimateManager(main.sceneManager);

    //2018-01-03 Kevin一开始就初始化，DataPiker中还有查询的操作，可以考虑处理一下：把延后执行，直接从dataManager中获取数据
    // main.dataPicker = new DataPicker().setCallback(function (d) { console.log(d); return true; });

    // main.coolingPipelineManager = new it.CoolingPipelineManager(sceneManager);
    sceneManager.viewManager3d.getDefaultEventHandler().isLookAtFunction = function (node) {
        var data = sceneManager.getNodeData(node);
        if (!data) {
            return false;
        }
        var category = dataManager.getCategoryForData(data);
        if (category &&
            category.getId().toLowerCase().indexOf('building') >= 0 &&
            (!data.getChildren() || data.getChildren().size() < 1)) {
            return false;
        }
        if (category && category.getId().toLowerCase().indexOf('post') >= 0) {
            return false;
        }
        return true;
    }

    // initTooltip(); // 放到具体的app中
    // initBreadcrumb(); //移至navBarManager中
    initNetwork();
    initSceneInfo();
    initRightMenu();
    initShadowNode();
    var afterLookAtManager = main.afterLookAtManager = new it.AfterLookAtManager(main.sceneManager);
    var nameplateManager = main.NameplateManager = new it.NameplateManager(main.sceneManager);
    var virtualDeviceAlarm = main.virtualDeviceAlarm = new it.VirtualDeviceAlarm(main.sceneManager);
    var callback = function () {
        main.clientAlarmManager = new it.ClientAlarmManager(sceneManager);
        main.navBarManager.init();
        main.assetPanelMgr.init();
        main.warningStatisticsMgr.init();
        main.equipStatisticsMgr.init();
        main.rackClickRotateMgr.init();
        main.loadConfig.init();
        main.about.init();
        if (main.extFunction) { //扩展用的，可以针对不同的客户，可放到scene.js中
            main.extFunction();
        }
        var id = main.loadDataManager.getIdFromLocation();
        var data = main.sceneManager.dataManager.getDataById(id);
        if (!data) {
            sceneManager.loadScene();
        }
        main.breadcrumb.setData();

        main.finished = true;
        main.virtualDeviceAlarm.init();

    };
    main.loadDataManager.doLoad(callback);

    main.animateManager = new it.AnimateManager(sceneManager); // 场景动画
    main.dialog = new it.NetworkDialog();
    // var info = main.info = info =  new it.Info(main.sceneManager);
    var nodeEventHander = main.nodeEventHander = new NodeEventHandler();
    main.sceneManager.viewManager3d.addEventHandler(nodeEventHander);
    main.nodeEventHander.serverTab.register(new it.PanelInfo(main.sceneManager)); //基本信息面板
    main.nodeEventHander.serverTab.register(new it.DeviceListInfo(main.sceneManager)); //设备列表面板
    main.nodeEventHander.serverTab.register(new it.StatisticsInfo(main.sceneManager)); //统计信息面板
    main.nodeEventHander.serverTab.register(new it.alarmTab(main.sceneManager)); //告警列表面板
    // main.dataCreater =  new DataCreater(main.sceneManager.dataManager);
    main.nodeEventHander.virtualDeviceTab.register(new it.VirtualDevicePanelInfo(main.sceneManager)); //虚拟机基本信息面板
    main.nodeEventHander.virtualDeviceTab.register(new it.VirtualDeviceRealtimeInfo(main.sceneManager)); //虚拟机实时数据信息面板
    main.nodeEventHander.virtualDeviceTab.register(new it.VirtualDeviceRealtimeExtendInfo(main.sceneManager)); //虚拟机实时数据扩展信息面板


    //监听实时数据
    it.Monitor.onAlarm();
    it.Monitor.onData();
    if (dataJson.showDataNav !== false) {
        main.dataNavManager = new DataNavManager(main.sceneManager);
    }
    main.RealtimeDynamicEnviroManager = new it.RealtimeDynamicEnviroManager(main.sceneManager.dataManager);
    main.RealtimeAlarmManager = new RealtimeAlarmManager(main.sceneManager);
    main.RealtimeDataManager = new RealtimeDataManager(main.sceneManager);
    it.ViewTemplateManager = new $ViewTemplateManager(main.sceneManager);
    it.ViewTemplateManager.registerBatchViewByCategory('airConditioning', KVTextBillboardViewTemplate);
    it.ViewTemplateManager.registerBatchViewByCategory('headerRack', KVTextBillboardViewTemplate);
    it.ViewTemplateManager.registerBatchViewByCategory('rack', KVTextBillboardViewTemplate);
    it.ViewTemplateManager.registerBatchViewByCategory('pdc', KVTextBillboardViewTemplate);

    it.ViewTemplateManager.registerViewByCategory('equipment', 'portUsage', PortStatusViewTemplate);
    it.ViewTemplateManager.registerViewByCategory('widget', DefaultViewTemplate);
    it.ViewTemplateManager.registerViewByCategory('virtualDevice', ViewVirtualDeviceTemplate);

    main.alarmAnimateManager = new AlarmAnimateManager();

    // main.sceneManager.network3d.getDataBox().addDataBoxChangeListener(function(e){
    //     if (e.kind == 'add') {
    //         var node = e.data;
    //         if(node && node._clientMap['it_data_id'] && node._clientMap['it_data_id'] == 'dc_gy'){
    //             console.log('!!!');
    //         }
    //     }  // s
    // });

    main.sceneManager.network3d.getCamera().addPropertyChangeListener(function (e) {
        if (e.property == 'position' || e.property == 'lookAt' || e.property == 'target') {
            // console.log(e.property + ' : ' + e.newValue +'!!!!');
        }
        // if (e.property == 'fov') {
        //    // console.log('!!!');
        // }
        // console.log('root width:' + main.sceneManager.network3d.getRootView().clientWidth);
        // console.log('root height:' + main.sceneManager.network3d.getRootView().clientHeight);
        // console.log('document width:' + document.documentElement.clientWidth);
        // console.log('document height:' + document.documentElement.clientHeight);
        // console.log('itv-main width:' + $('#itv-main').css('width'));
    });

    main.sceneManager.network3d.getEditInteraction = function () {
        if (this._interactions && this._interactions.length > 0) {
            for (var i = 0; i < this._interactions.length; i++) {
                var interaction = this._interactions[i];
                if (interaction instanceof TGL.EditInteraction) {
                    return interaction;
                }
            }
        }
        return null;
    };

    //使之点击对象时，不可选中
    var orgMouseEvent = main.sceneManager.network3d.getElementsByMouseEvent;
    main.sceneManager.network3d.getElementsByMouseEvent = function (event, intersectUnVisible, intersectAlarmBillboard) {
        if (event.type == 'mousedown' && this.getEditInteraction() == null) {
            return [];
        } else {
            return orgMouseEvent.call(main.sceneManager.network3d, event, intersectUnVisible, intersectAlarmBillboard);
        }
    };

    //用于iframe通讯一：接收通过post传过来的消息
    window.addEventListener("message", function (e) {
        if (e.data) {
            eval(e.data);
        }
    }, false);

    //用于iframe通讯：用于监听has的改变
    window.onhashchange = function (e) {
        console.log('hash changed !!!');
        var location = window.location;
        var search = location.hash;
        // search = search.replace("?", "");
        var ids = /#id=([^&]*)/.exec(search);
        if (ids == null) {
            return;
        }
        var id = ids[1];
        var data = main.sceneManager.dataManager.getDataById(id);
        if (data) {
            main.sceneManager.viewManager3d.getDefaultEventHandler().lookAtByData(data);
        }
    }

    // main.sceneManager.network3d.dataBox.addDataBoxChangeListener(function(eve){
    // if (eve.kind == 'add' && eve.data && eve.data instanceof mono.Billboard) {
    // console.log('!!!');
    // }
    // });

    /*
    main.sceneManager.network3d.dataBox.addDataPropertyChangeListener(function(eve){
        if (eve.source 
            && eve.source._clientMap["it_data_id"] 
            && eve.source._clientMap["it_data_id"].indexOf('floorfff') >=0) {
            console.log(eve.newValue);
        }
    });
    */

    // var network3d = main.sceneManager.network3d;
    // network3d.getRootView().addEventListener('dblclick',function(e) {
    //      var element = network3d.getFirstElementByMouseEvent(e);
    //      if(element){
    //         if(!main.postManager){
    //             main.postManager = new it.PostManager(main.sceneManager);
    //         }
    //         main.postManager.showPostDetail(element.element);
    //      }
    // });

    //创建实时监控器管理容器 
    main.monitorManager = new MonitorManager(main.sceneManager);
    main.monitorManager.registerMonitor('rack', function (sceneManager, category) {
        return new AllDataDecorator(new Monitor(this.sceneManager, category));
    });
    main.monitorManager.registerMonitor('headerRack', function (sceneManager, category) {
        return new AllDataDecorator(new Monitor(this.sceneManager, category));
    });
    main.monitorManager.registerMonitor('equipment', function (sceneManager, category) {
        return new SelectPanelDecorator(new Monitor(this.sceneManager, category));
    });
    main.monitorManager.registerMonitor('equipment', 'portUsage', function (sceneManager, category, group) {
        return new AllDataDecorator(new Monitor(this.sceneManager, category, group));
    });
    main.monitorManager.registerMonitor('port', function (sceneManager, category) {
        return new AllDataDecorator(new Monitor(this.sceneManager, category));
    });
    main.monitorManager.registerMonitor('airConditioning', function (sceneManager, category) {
        return new AllDataDecorator(new Monitor(this.sceneManager, category));
    });
    main.monitorManager.registerMonitor('widget', function (sceneManager, category) {
        return new AllDataDecorator(new Monitor(this.sceneManager, category));
    });
    main.monitorManager.registerMonitor('pdc', function (sceneManager, category) {
        return new AllDataDecorator(new Monitor(this.sceneManager, category));
    });
    main.monitorManager.registerMonitor('doorControl', function (sceneManager, category) {
        return new AllDataDecorator(new Monitor(this.sceneManager, category));
    });
    main.monitorManager.registerMonitor('camera', function (sceneManager, category) {
        return new AllDataDecorator(new CameraMonitor(this.sceneManager, category));
    });
    main.monitorManager.registerMonitor('virtualDevice', function (sceneManager, category) {
        return new AllDataDecorator(new Monitor(this.sceneManager, category));
    });


    function initDeviceLabel() {
        main.BillboardManager = {};
        var DeviceLabel = main.BillboardManager.DeviceLabel = new it.DeviceLabel(main.sceneManager);
    };
    initDeviceLabel();


    main.loadDataManager.addFinishedHandel(function () {
        if (!main.dcLabelManager && main.dcLabes) {
            main.dcLabelManager = new it.DCLabelManager();
        }
    })


    layer.config({
        skin: 'newui-layer'
    })


    // main.sceneManager.beforeClearFunction = function() {
    //     var textures = {};
    //     main.sceneManager.network3d.getDataBox().forEach(function(data) {
    //         data.material && data.material.materials && data.material.materials.forEach(function(material) {
    //             material.uniformsList && material.uniformsList.forEach(function(uniform) {
    //                 if (uniform[0].type === 't' && uniform[0].value) {
    //                     var id = uniform[0].value.id;
    //                     delete main.sceneManager.network3d.pm.glTextureMap[id];
    //                     main.sceneManager.network3d.pm.textureUpdateFlags[id] = true;
    //                 } else if (uniform[0].type === 'tv' && uniform[0].value && uniform[0].value.length) {
    //                     console.log(uniform[0].value);
    //                 }
    //             });
    //         });
    //     });
    // }
    // main.earthSceneView = new it.EarthSceneView('earth', main.sceneManager); 


    // 在datamanager加载完成后，对所有的机柜的data加一些数据
    main.loadDataManager.addFinishedHandel(function () {
        var dm = main.sceneManager.dataManager;
        var allRack = dm.getDataMapByCategory('rack');
        if ($.isEmptyObject(allRack)) {
            console.log('没有机柜')
            return;
        }
        for (var i in allRack) {
            it.util.setRackExtraInfo(allRack[i]);
        }
        dm.addDataManagerChangeListener(function (e) {
            if (dm.getCategoryForData(e.data).getId() == 'equipment') {
                var parentRackId = e.data._parentId;
                var parentRackData = dm.getDataById(parentRackId);
                if (e.kind == 'add') {
                    it.util.setRackExtraInfo(parentRackData)
                } else if (e.kind == 'remove') {
                    it.util.setRackExtraInfo(parentRackData)
                }
            }
            if (dm.getCategoryForData(e.data).getId() == 'rack') {
                if (e.kind == 'add') {
                    it.util.setRackExtraInfo(e.data)
                }
            }
        })
    })
};




// 将必须的JQUI组件的导入方式从scene.js移动至main.js中，避免加入某些必须组件后，需要在各个项目中更新scene.js的问题
it.addExtraNecessaryJsFiles = function (resolve, reject) {
    it.util.useCompoment('itvDcTotal', 'itvList', 'itvMark', 'itvRackTotal', 'arc',
        'overview','floorview', 'nav', 'dialog', 'toolbar', 'breadcrumb',
        'pdfPanel', 'warningPanel', 'assetInfo', 'itSearchPanel', 'basePanel',
        'warningStatistics', 'equipStatistics', 'warningRuleConfig', 'cruisePanel', 'systemSettingPanel','link', 'legends',
        'elecInfoSta', 'rackSeatOccupy', 'tempFilterPanel', 'rackClickRotate', 'newAppBasePanel', 'mulCamera', 'treeTable',
        function () {
            resolve && resolve();
        });
}