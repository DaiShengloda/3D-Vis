/**
 * 注册所有的应用
 */


/**
 * 空间-电力-承重统一可视化
 */
var $SpaceEleWeight = function(sceneManager, searchPane) {
    it.Application.call(this, sceneManager, searchPane);
    // this.searchPane = searchPane;
};

mono.extend($SpaceEleWeight, it.Application, {

    init: function() {
        var self = this;
        this.app = new AllSpaceSearch(this.sceneManager);
        // main.allSpaceSearch.beforeDoClick = function(){
        //   self.reset();
        // }
        this.app.beforeDoClick = function() {
            self.beforeDoClick();
        }
    },

    clearItSearch: function() {
        return true;
    },

    isShowSearchInputPanel: function() {
        return true;
    },

    doShow: function() {
        var div = this.app.getRootView();
        this.app.setData();
        this.searchPane.show(div);
        // self.itvToggleBtn.show();
    },

    doClear: function() {
        this.app.clear();
    }

});

it.SpaceEleWeight = $SpaceEleWeight;

/**
 * 设备上架
 */
var $Deviceon = function(sceneManager, searchPane) {
    it.Application.call(this, sceneManager, searchPane);
    // this.searchPane = searchPane;
};

mono.extend($Deviceon, it.Application, {

    init: function() {
        this.app = new it.DeviceOn(this.sceneManager);
        // 第一次点击的时候，才会初始化
        var div = this.app.getRootView();
        this.searchPane.show(div);
        this.app.inputPane.setSelectpick();
        var self = this;
        // 隐藏下面10行，可以解决两个问题：remark 17-9-12
        // （1）资产搜索、资源空间利用率等搜索弹窗遮挡页面顶部的当前聚焦点的导航条（点击设备上架之后就有问题了）
        // （2）点击打开资产搜索或空间搜索，再点击设备上架，设备上架弹窗不会直接弹出，需要再次点击设备上架选项，设备上架弹窗才会弹出。
        // var oldDoHideFunction = main.navBarManager.toggleBtn.doHideFunction;
        // main.navBarManager.toggleBtn.doHideFunction = function(para) {
        //     self.app.$rackPicker.hide();
        //     self.app.$rackPicker.removeClass('on');
        //     self.showing = false;
        //     oldDoHideFunction.call(main.navBarManager.toggleBtn, para);
        // }
        // main.navBarManager.toggleBtn.doShowFunction = function(para) {
        //     self.showing = true;
        // }

    },

    isShowSearchInputPanel: function() {
        return true;
    },

    doShow: function() {
        // self.itvToggleBtn.show();
        // self.reset(true);
        this.app.addListener();
        var div = this.app.getRootView();
        main.navBarManager.showNavBar();
        this.searchPane.show(div);
    },

    doClear: function() {
        // 设备上架的清除doNothing
        this.app.removeListener();
        this.app.hide && this.app.hide();
    }
});

it.Deviceon = $Deviceon;

/**
 * 设备下架
 */
var $Deviceoff = function(sceneManager, searchPane) {
    it.Application.call(this, sceneManager, searchPane);
};

mono.extend($Deviceoff, it.Application, {

    init: function() {
        this.app = new it.DeviceOff(this.sceneManager);
    },

    isShowSearchInputPanel: function() {
        return true;
    },

    doShow: function() {
        // self.itvToggleBtn.show();
        //           self.reset(true);
        var div = this.app.getRootView();
        this.searchPane.show(div);
    },

    doClear: function() {
        // do nothing...
    }

});

it.Deviceoff = $Deviceoff;

/**
 * 增加配线
 */
var $LinkAdd = function(sceneManager, searchPane) {
    it.Application.call(this, sceneManager, searchPane);
};

mono.extend($LinkAdd, it.Application, {

    init: function() {
        this.app = new it.LinkAdd(this.sceneManager);
    },

    isShowSearchInputPanel: function() {
        return true;
    },

    doShow: function() {
        // self.itvToggleBtn.show();
        //           self.reset(true);
        var div = this.app.getRootView();
        this.searchPane.show(div);
    },

    doClear: function() {
        this.app.clearSearch(); //清除配线搜索
    }

});

it.Linkadd = $LinkAdd;

/**
 * 线路查询
 */
var $LinkSearchApp = function(sceneManager, searchPane) {
    it.Application.call(this, sceneManager, searchPane);
};

mono.extend($LinkSearchApp, it.Application, {

    init: function() {
        this.app = new it.LinkSearch(this.sceneManager);
        var self = this;
        this.app.beforeDoClick = function() {
            self.beforeDoClick();
        };
    },

    isShowSearchInputPanel: function() {
        return true;
    },

    doShow: function() {
        var div = this.app.getRootView();
        // self.reset(true);
        this.searchPane.show(div);
    },

    doClear: function() {
        this.app.clearSearch(); //清除配线搜索
    }

});

it.LinkSearchApp = $LinkSearchApp;

/**
 * 湿度展示
 */
var $HumidityApp = function(sceneManager) {
    it.Application.call(this, sceneManager);
    
};

mono.extend($HumidityApp, it.Application, {
    create:function(){
        var humMoreConfig = main.systemConfig.hum_more_config;
        if (dataJson.hum_blue || dataJson.hum_green || dataJson.hum_yellow || dataJson.hum_red) {
            var parms = {
            width : dataJson.hum_blue.parms.width,
            height : dataJson.hum_blue.parms.height,
            size : dataJson.hum_blue.parms.size,
            lineWidth : dataJson.hum_blue.parms.lineWidth,
            color : dataJson.hum_blue.parms.color,
            startX : dataJson.hum_blue.parms.startX,
            startY : dataJson.hum_blue.parms.startY,
            withUnit : dataJson.hum_blue.parms.withUnit,
            family : dataJson.hum_blue.parms.fontFamily,
            stroke : dataJson.hum_blue.parms.stroke,
            scaleX : dataJson.hum_blue.parms.scaleX,
            scaleY : dataJson.hum_blue.parms.scaleY,
           };
           if (dataJson.hum_blue) {
                it.Util.registerImg('hum_blue', dataJson.hum_blue.src, parms);
           }
           if (dataJson.hum_green) {
                it.Util.registerImg('hum_green', dataJson.hum_green.src, parms);
           }
           if (dataJson.hum_yellow) {
                it.Util.registerImg('hum_yellow', dataJson.hum_yellow.src, parms);
           }
           if (dataJson.hum_red) {
                it.Util.registerImg('hum_red', dataJson.hum_red.src, parms);
           }
        }else {
            var parms = {
            width : humMoreConfig.canvasX,
            height : humMoreConfig.canvasY,
            size : humMoreConfig.font_size,
            lineWidth : humMoreConfig.font_linewidth,
            color : humMoreConfig.font_color,
            startX : humMoreConfig.startX,
            startY : humMoreConfig.startY,
            withUnit : humMoreConfig.writeunit,
            family : humMoreConfig.font_family,
            stroke : humMoreConfig.stroke,
            scaleX : humMoreConfig.billboardX,
            scaleY : humMoreConfig.billboardY
           };
        it.Util.registerImg('hum_blue', humMoreConfig.bluesrc, parms);
        it.Util.registerImg('hum_green', humMoreConfig.greensrc, parms);
        it.Util.registerImg('hum_yellow', humMoreConfig.yellowsrc, parms);
        it.Util.registerImg('hum_red', humMoreConfig.redsrc, parms);
        }
    },

    init: function() {
        this.app = new it.HumidityManager(this.sceneManager);
        this.app.bgMap = dataJson.humBgMap;
        this.app.getToFixed = function() {
                return parseInt(dataJson.humidityToFixed) || 0;
            }
            // this.app._minValue = 10;
            // this.app._maxValue = 50;
    },

    doShow: function() {
        var self = this ;
        main.RealtimeDynamicEnviroManager.monitorCollectorData(this.app.getsCurrentCollector());
        if (main.systemConfig) {
            this.app.bgMap = main.systemConfig.hum_alarm_config;
        }
        this.create();
        // var isShow = this.isShowing();
        // self.reset(true);
        // if(!isShow){

        setTimeout(function(){
            self.app.show();
        }, 100)
        // }
    },

    doClear: function() {
        this.app.hide();
        main.RealtimeDynamicEnviroManager.clearMonitorData(true);
    }

});

it.HumidityApp = $HumidityApp;

/**
 * 微环境展示
 */
var $MicoEnvirApp = function(sceneManager) {
    it.Application.call(this, sceneManager);
};

mono.extend($MicoEnvirApp, it.Application, {

    init: function() {
        this.app = new it.MicoEnviroment(this.sceneManager);
    },

    doShow: function() {
        // var isShow = this.isShowing();
        // self.reset(true);
        // if(!isShow){
        this.app.show();
        // }
    },

    doClear: function() {
        this.app.clear();
    }

});

it.MicoEnvirApp = $MicoEnvirApp;

/**
 * 风向图展示
 */
var $AirFlowApp = function(sceneManager) {
    it.Application.call(this, sceneManager);
};

mono.extend($AirFlowApp, it.Application, {

    init: function() {
        this.app = new it.AirFlowManager();
    },

    doShow: function() {
        // var isShow = this.isShowing();
        // self.reset(true);
        // if(!isShow){
        this.app.toggleAirFlowsForCurrentScene();
        // }
    },

    doClear: function() {
        this.app.clear();
    }

});

it.AirFlowApp = $AirFlowApp;

/**
 * 漏水检测
 */
var $WaterLeakApp = function(sceneManager) {
    it.Application.call(this, sceneManager);
};

mono.extend($WaterLeakApp, it.Application, {

    init: function() {
        this.app = $WaterLeakManager();
    },

    isShow: function() {
        if (!this.app) { //有可能还没有初始化哦
            return false;
        }
        return this.app.hasWaterLeak(); //如果不用Application内部的判断是否显示的标记，也可以重写该方法
    },

    doShow: function() {
        // var isShow = this.isShowing();
        // self.reset(true);
        // if(!isShow){
        this.app.toggleWaterLeak();
        // }
    },

    doClear: function() {
        this.app.hideWaterLeak();
    }

});

it.WaterLeakApp = $WaterLeakApp;

/**
 * 功率管理
 */
var $PowerApp = function(sceneManager) {
    it.Application.call(this, sceneManager);
};

mono.extend($PowerApp, it.Application, {

    init: function() {
        this.app = main.powerManager = new PowerManager(this.sceneManager);
    },

    isShowSearchInputPanel: function() {
        return false;
    },

    //如果觉得父类中的不准确的话，那不用Application内部的判断是否显示的标记，也可以重写该方法
    isShow: function() {
        return PowerManager.Simulater.simulating;
    },

    doShow: function() {
        PowerManager.Simulater.refresh(this.app);
    },

    doClear: function() {
        PowerManager.Simulater.stop(this.app);
    }

});

it.PowerApp = $PowerApp;

/**
 * 承重管理
 */
var $WeightApp = function(sceneManager) {
    it.Application.call(this, sceneManager);
};

mono.extend($WeightApp, it.Application, {

    init: function() {
        this.app = main.weightManager = new it.WeightManager(this.sceneManager);
    },

    //如果觉得父类中的不准确的话，那不用Application内部的判断是否显示的标记，也可以重写该方法
    isShow: function() {
        if (!this.app) {
            return false;
        }
        return this.app.isShow();
    },

    doShow: function() {
        this.app.toggleShow();
    },

    doClear: function() {
        this.app.hide();
    }

});

it.WeightApp = $WeightApp;

/**
 * 岗位管理
 */
var $PostApp = function(sceneManager) {
    it.Application.call(this, sceneManager);
};

mono.extend($PostApp, it.Application, {

    init: function() {
        this.app = new it.PostManager(this.sceneManager);
    },

    doShow: function() {
        this.app.showPostList();
    },

    doClear: function() {
        this.app.hide();
    }

});

it.PostApp = $PostApp;

/**
 * 岗位管理
 */
var $CameraAnimateApp = function(sceneManager) {
    it.Application.call(this, sceneManager);
};

mono.extend($CameraAnimateApp, it.Application, {

    init: function() {
        this.app = main.cameraAnimateManager
    },

    doShow: function() {
        this.app.show();
    },

    doClear: function() {
        this.app.hide();
    }

});

it.CameraAnimateApp = $CameraAnimateApp;