
var $FullScreen = function(){
	$ToolBarButton.call(this);
	this.init();
};

mono.extend($FullScreen,$ToolBarButton,{
	
	init : function(){
		var self = this;
		this.button.click(function(){
			self.toggleFullscreen();
		});
        this.fullscreenChange();
	}, 

	getClass : function(){
		return 'fullscreem-menu-image';
	},

	getTooltip : function(){
        var fullscreen = this.isFullScreen();
        if (fullscreen) {
            return it.util.i18n("FullScreen_Quit");
        }else{
            return it.util.i18n("FullScreen_Full_Screen");
        }
    },

    isFullScreen : function(){
        return document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen;
    },

	isFullScreenSupported : function() {
        var docElm = document.documentElement;
        return docElm.requestFullscreen || docElm.webkitRequestFullScreen || docElm.mozRequestFullScreen;
    },

    showHeaderAndNav: function(isShow) {
        if (isShow) {
            // 并且显示navbar和header(如果本来是要显示的)
            if (dataJson && !(dataJson.showHeader === false)) {
                $('.itv-header').css('display', 'block').css('height', '60px');
                $('.itv-content').css('top', '60px');
            }
            main.navBarManager.onresize();
        } else {
            // 并且隐藏navbar和header(如果一开始没有隐藏的话)
            if (dataJson && !(dataJson.showHeader === false)) {
                main.hideHeader();
            }
            main.navBarManager.hideNavBar();
            main.navBarManager.onresize();
        }
    },

    toggleFullscreen : function() {
        if (this.isFullScreenSupported()) {
            var fullscreen = this.isFullScreen();//document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen;
            if (!fullscreen) {
                var docElm = document.documentElement;
                if (docElm.requestFullscreen) {
                    docElm.requestFullscreen();
                } else if (docElm.webkitRequestFullScreen) {
                    docElm.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
                } else if (docElm.mozRequestFullScreen) {
                    docElm.mozRequestFullScreen();
                }
                // // 并且隐藏navbar和header(如果一开始没有隐藏的话)
                // if (dataJson && !(dataJson.showHeader===false)) {
                //     main.hideHeader();
                // }
                // main.navBarManager.hideNavBar();
                // main.navBarManager.onresize();
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                }
                // // 并且显示navbar和header(如果本来是要显示的)
                // if (dataJson && !(dataJson.showHeader===false)) {
                //     $('.itv-header').css('display','block').css('height','60px');
                //     $('.itv-content').css('top','60px');
                // }
                //  main.navBarManager.onresize();
            }
        }
    },

    fullscreenChange: function() {
        var self = this;
        document.addEventListener("fullscreenchange", function(e) {
            console.log("fullscreenchange", e);
            self.showHeaderAndNav();
            self.toggleBtnTitle();
        });
        document.addEventListener("mozfullscreenchange", function(e) {
            console.log("mozfullscreenchange ", e);
            self.showHeaderAndNav();
            self.toggleBtnTitle();
        });
        document.addEventListener("webkitfullscreenchange", function(e) {
            console.log("webkitfullscreenchange", e);
            self.showHeaderAndNav();
            self.toggleBtnTitle();
        });
        document.addEventListener("msfullscreenchange", function(e) {
            console.log("msfullscreenchange", e);
            self.showHeaderAndNav();
            self.toggleBtnTitle();
        });
    },

    toggleBtnTitle: function() {
        var fullscreen = this.isFullScreen();
        if (!fullscreen){
            $('#fullScreen').attr('title',it.util.i18n("FullScreen_Full_Screen")).removeClass('selected');
            $('.ToolbarMgr').find('.arc').hide();
            main.panelMgr.instanceMap.ToolbarMgr.$box.toolbar('removeSelectedId', 'fullScreen');
        } else {
            $('#fullScreen').attr('title',it.util.i18n("FullScreen_Quit"));
        }
    }
});

it.FullScreen = $FullScreen;