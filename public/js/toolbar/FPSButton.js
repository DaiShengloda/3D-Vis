
var $FPSButton = function (parentID, sceneManager) {
    it.ToolBarButton.call(this);
    this.parent = $('#' + parentID || '');
    this.sceneManager = sceneManager;
    this.init();
    this.modeChangeInited = false;
    this.fpsButtonState = false;
    var self = this;
    document.addEventListener('keydown', function(e){
        if(e.keyCode == 27){
            if(self.fpsButtonState){
                self.modeChange.enableSetFPSPosition(false);
                self.removeIconClass();
            }
        }
    });
};

mono.extend($FPSButton, it.ToolBarButton, {

    init: function () {
        var self = this;
        this.button.click(function () {
            self.action();
        });
        this.fullscreenChange();
    },
    action: function () {
        if (!this.modeChangeInited) {
            this.modeChange = new it.ModeChange(this.sceneManager);
            this.modeChangeInited = true;
        }
        if(this.fpsButtonState){
            if(this.modeChange.fpsMode){
                this.modeChange.exitFullScreen();
                this.modeChange.toggleFPSModel();
            }
            this.modeChange.enableSetFPSPosition(false);
            this.fpsButtonState = false;
            $('#fps').attr('title',it.util.i18n('ToolbarMgr_First_Perspective'));
        } else{
            this.modeChange.enableSetFPSPosition(true);
            this.fpsButtonState = true;
            $('#fps').attr('title',it.util.i18n('ToolbarMgr_Third_Perspective'));
        }
    },

    getClass: function () {
        return 'fps-model-menu-image';
    },

    getTooltip: function () {
        return it.util.i18n("FPSButton.FPSModel");
    },

    fullscreenChange: function() {
        var self = this;
        document.addEventListener("fullscreenchange", function(e) {
            // console.log("fullscreenchange", e);
            //如果当前状态还在第一人称视角，则不清除样式
            if(!self.fpsButtonState){
                self.removeIconClass();
            }
        });
        document.addEventListener("mozfullscreenchange", function(e) {
            // console.log("mozfullscreenchange ", e);
            if(!self.fpsButtonState){
                self.removeIconClass();
            }
        });
        document.addEventListener("webkitfullscreenchange", function(e) {
            // console.log("webkitfullscreenchange", e);
            if(!self.fpsButtonState){
                self.removeIconClass();
            }
        });
        document.addEventListener("msfullscreenchange", function(e) {
            // console.log("msfullscreenchange", e);
            if(!self.fpsButtonState){
                self.removeIconClass();
            }
        });
    },
    isFullScreen : function(){
        return document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen;
    },
    removeIconClass: function() {
        var fullscreen = this.isFullScreen();
        if (!fullscreen){
            $('#fps').removeClass('selected');
            $('.ToolbarMgr').find('.arc').hide();
            main.panelMgr.instanceMap.ToolbarMgr.$box.toolbar('removeSelectedId', 'fps');
            this.fpsButtonState = false;
        }
    }
});

it.FPSButton = $FPSButton;