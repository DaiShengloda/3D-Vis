/**
 * @function $BaseMgr 所有 panel 的基类，延迟初始化对象
 * 自身只做定义，不做初始化的动作，初始化交给 PanleMgr 来调用
 * PanelMgr 在加载完成后，会判断是否调用过 init 方法，如果没有调用就调用 init 方法，
 * init 方法里面会调用 _init 方法，子类可以重写该方法，实现自定义初始化逻辑。
 * @param  {type} name         {description}
 * @param  {type} sceneManager {description}
 * @return {type} {description}
 */
function $BaseMgr(sceneManager, name, parent) {

    this.sceneManager = sceneManager;
    this.name = name;
    this.parent = parent;
    this._visible;
    this._inited = false;
}
mono.extend($BaseMgr, Object, {
    initView: function () {
        var self = this;
        // var $middle = $('<div>').appendTo(this.parent);
        var $box = this.$box = $('<div></div>').appendTo(this.parent);
        $box.addClass(this.name);
        $box.css('position', 'absolute');
        $box.hide();
    },
    init: function () {      
        this.initView();
        // this.sceneManager.addSceneChangeListener(this.sceneChangeHandler, this);
        var self = this;
        this.sceneManager.cameraManager.addAfterPlayCameraListener(function(scene, rootData,oldScene,oldRootData){
            self.sceneChangeHandler({ 
                kind:'changeScene',
                data:scene,
                rootData:rootData,
                oldData:oldScene,
                oldRootData:oldRootData});
        }, this);

        var d = this.sceneManager.viewManager3d.defaultEventHandler;
        d.addAfterLookAtListener(this.afterLookAtHandler, this);
        d.addAfterLookFinishedAtListener(this.afterLookFinishedAtHandler, this);
        this._init();
        this._inited = true;
    },
    setLocation: function (x, y) {
        this.$box.css('top', y + 'px');
        this.$box.css('left', x + 'px');
    },
    show: function () {
        if (this._visible) return;
        this._visible = true;
        this.$box.show();
        this._show();
    },
    hide: function () {
        if (!this._inited) return;
        if (this._visible != undefined && !this._visible) return;
        this._visible = false;
        this.$box.hide();
        this._hide();
    },
    isShow: function () {
        return this._visible;
    },

    sceneChangeHandler: function (e) {
        // console.log('sceneChangeHandler', e);
    },
    afterLookAtHandler: function (node) {
        // console.log('afterLookAtHandler', node);
    },
    afterLookFinishedAtHandler: function (node) {
        // console.log('afterLookFinishedAtHandler', node);
    },
    _show: function () {

    },
    _hide: function () {

    },
    _init: function () {

    },
})
it.BaseMgr = $BaseMgr;