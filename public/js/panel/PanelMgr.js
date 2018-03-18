/**
 * 创建一个 PanelMgr，管理所有弹出面板的2d 界面，所有界面由 PanelMgr 负责加载和初始化，通过以下两个步骤实现组件的生命周期控制。
 * 1.addClass(name) 方法，传入文件名（里面的对象名跟文件名同名）
 * 2.invoke(name, method, args) 方法，传入组件名和需要执行的方法名，如果组件还没有加载，就加载组件，调用初始化动作，然后执行指定方法
 * show() hide() 方法可以控制显示隐藏所有显示的组件，如果组件自身是隐藏，show 时也不会显示。
 * 场景切换时，显示所有组件。如果 initMehtodMap 中有单独指定初始执行方法，就调用，否则调用组件的 show 方法
 * @function $PanelMgr 所有 panel 的管理类
 * @param  {type} name         {description}
 * @param  {type} sceneManager {description}
 * @return {type} {description}
 */
function $PanelMgr(sceneManager) {

    this.name = name;
    this.sceneManager = sceneManager;
    this.defaultEventHandler = this.sceneManager.viewManager3d.getDefaultEventHandler();
    this._show = false;
    this.panelClasses = [];
    this.instanceMap = {};
    this.init();
    this.initMehtodMap = {};
    this.loadingMap = {};
    this.loadInstanceDispatcher = new mono.EventDispatcher();
}
mono.extend($PanelMgr, Object, {

    init: function () {
        this.sceneManager.addSceneChangeListener(this.sceneChangeHandler, this);
        this.$box = $('.view-control');
        this.$box2 = $('.view-control-left');
        this.addClass('ToolbarMgr', dataJson.removeToolbarMgr);
        this.addClass('BreadcrumbMgr', dataJson.removeBreadcrumbMgr);
        this.addClass('NavBarMgr', dataJson.removeNavBarMgr);
        this.addClass('OverviewMgr', dataJson.removeOverviewMgr);
        this.addClass('FloorviewMgr', dataJson.removeFloorviewMgr);
    },
    addAppChangeListener: function (listener, scope, ahead) {
        this.loadInstanceDispatcher.add(listener, scope, ahead);
    },

    removeAppChangeListener: function (listener, scope) {
        this.loadInstanceDispatcher.remove(listener, scope);
    },
    addClass: function (name, isRemoved) {
        if(isRemoved)return;
        this.panelClasses.push(name);
    },
    invoke: function (name, method, args) {
        args = args || [];
        if (this.instanceMap[name]) {
            this.instanceMap[name][method].apply(this.instanceMap[name], args);
            return;
        }
        if (this.loadingMap[name]) {
            console.warn('正在加载 : ' + name);
            return;
        }
        this.loadingMap[name] = true;
        var self = this;
        it.util.loadJs(pageConfig.url('/js/panel/' + name + '.js'), function () {
            var Cls = it[name];
            if(name == 'BreadcrumbMgr'||name == 'OverviewMgr'){
                var ins = new Cls(self.sceneManager, name, self.$box2);
            } else{
                var ins = new Cls(self.sceneManager, name, self.$box);
            }
            if (ins.c) {
                it.util.useCompoment(ins.c[0], function () {
                    self.instanceMap[name] = ins;
                    self.instanceMap[name].init();
                    self.instanceMap[name][method].apply(self.instanceMap[name], args);
                    delete self.loadingMap[name];
                });
            } else {
                self.instanceMap[name] = ins;
                self.instanceMap[name].init();
                self.instanceMap[name][method].apply(self.instanceMap[name], args);
                delete self.loadingMap[name];
            }
            self.loadInstanceDispatcher.fire({
                kind: name,
                scope: self
            });
        }, console.error);
    },
    show: function () {
        if (!this._inited) {
            this._init();
            this._inited = true;
        }
        if (this._show) return;
        this._show = true;
        this.$box.show();

    },
    hide: function () {
        if (!this._inited) return;
        if (!this._show) return;
        this._show = false;
        this.$box.hide();
    },

    sceneChangeHandler: function (e) {
        if (!e || e.kind != 'changeScene') return;
        var self = this;
        var scene = e.data;
        var oldScene = e.oldData;
        var sceneCategoryId = scene.getCategoryId();
        var oldSceneCategoryId;
        if (oldScene) {
            oldSceneCategoryId = oldScene.getCategoryId();
        }       
        //首次进入园区场景时，显示组件
        if (sceneCategoryId == 'earth') return;
        if(main.noshow && sceneCategoryId == 'dataCenter') {
            // this.hide();
            this.panelClasses.forEach(function (name) {
                self.invoke(name, self.initMehtodMap[name] || 'hide');
            });
            return;
        }
        if (oldSceneCategoryId == 'earth' && sceneCategoryId == 'dataCenter') {
            this.panelClasses.forEach(function (name) {
                self.invoke(name, self.initMehtodMap[name] || 'hide');
            });
            return;
        }
        this.panelClasses.forEach(function (name) {
            self.invoke(name, self.initMehtodMap[name] || 'show');
        });
    },
    showPanels: function(){
        var self = this;
        this.panelClasses.forEach(function (name) {
            self.invoke(name, self.initMehtodMap[name] || 'show');
        });
        main.assetPanelMgr.show();
        main.assetPanelMgr.showWarningsInfo('dataCenter');
    },
    hidePanels: function(){
        var self = this;
        this.panelClasses.forEach(function (name) {
            self.invoke(name, self.initMehtodMap[name] || 'hide');
        });
        main.assetPanelMgr.hide();
        if (main.dcLabelManager) {
            main.dcLabelManager.hideLabel();
        };  
    }
})
it.PanelMgr = $PanelMgr;