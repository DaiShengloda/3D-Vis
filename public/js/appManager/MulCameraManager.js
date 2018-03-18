/**
 * 同一分组中不能有同一个camera资产
 *  init事初始化camera_group、group_of_camera的所有资产
 */
var $MulCameraManager = function (sceneManager) {
    this.sceneManager = sceneManager;
    this.dataManager = this.sceneManager.dataManager;
    this.defaultSrc = '../resource/video/test.mp4';
    this._cameraGroupMap = {}; //摄像头分组
    this._groupOfCamera = [];  //分组中摄像头
    this._allCameraMap = {};  //所有category为camera的data
    this._videoSrcMap = {}; //所有camera的url
    this.cameraMap = []; //需要播放的摄像头
    this.loginServer = false;
    //this.getVideoFromServer = dataJson.getVideoFromServer; //是否使用向服务器请求资源
    this.fullScreenInDialog = false; //dialog内全屏
    this.fullScreen = false //屏幕全屏
    this.videoWall = new VideoWall();
    this.init();
};

mono.extend($MulCameraManager, Object, {
    init: function() {
        var callback = this.initView; 
        this.initData(callback);    
    },

    initData: function (callback) {
        var self = this;
        it.util.api('camera_group', 'find', {}, function(data){
            for(var i in data){
                var group = data[i];
                self._cameraGroupMap[group.id] = group;
            };
            it.util.api('group_of_camera', 'find', {}, function(groupOfCamera){
                self._groupOfCamera = groupOfCamera;
                it.util.api('cctv', 'find', {}, function(cctvMap){
                    //self._cameraUrlMap = cctvMap;
                    for(var c in cctvMap){
                        var camera = cctvMap[c],
                            cameraId = camera.id,
                            cameraUrl = camera.url;
                        self._videoSrcMap[cameraId] = camera;
                    };
                    self.getAllCameraMap();
                    callback&&callback.call(self);
                    self.show();
                });
            });
        });        
    },

    getAllCameraMap: function() {
        var dataMap = this.dataManager._dataMap;
        for(var id in dataMap) {
            var data = dataMap[id];
            var categoryId = this.dataManager.getCategoryForData(data).getId();
            if(categoryId == 'camera') {
                this._allCameraMap[id] = data; 
            } 
        };
    },

    initView: function() {
        var self = this;
        var $dialog = this.$dialog = $('<div id="mulCamera-box"></div>').appendTo($('body'));

        var $center = this.$center = $('<div class="center-box"></div>').appendTo($dialog);

        var $leftBox = this.$leftBox = $('<div class="left-box"></div>').appendTo($center);
        var $rightBox = this.$rightBox = $('<div class="right-box"></div>').appendTo($center);

        this.initDialog();
        this.initRightBox();
        this.initLeftBox();
    },

    getnw: function() {
        var w = document.body.clientWidth, nw;
        if (w < 1440) {
            nw = 1070;
        } else if (w >= 1440 && w < 1920) {
            nw = 1070;
        } else if (w >= 1920) {
            nw = 1190;
        }
        return nw;
    },

    initDialog: function() { 
        var self = this;
        var nw = this.getnw();     
        this.$dialog.dialog({ 
            blackStyle: true,
            autoWidth: [1070, 1070, 1190],
            width: nw,
            height: 600,
            title: it.util.i18n("MulCameraManager_Mul_Camera"),
            closeOnEscape: false,
            show: false,
            hide: false,
            autoOpen: false,     
            resizable: false,    
            modal: false,
                  
        });
        this.$dialog.parent().find('.ui-dialog-titlebar-close').on('click', function () {
            // main.panelMgr.instanceMap.NavBarMgr.$box.nav('clickNavIcon', 'security');  
            // self.handlerDialogClose();
        });
        // this.handlerWindowResize();
    },

    initRightBox: function() {
        this.initSearchInput();
        var $tableBox = this.$tableBox= $('<div class="table-box bt-scroll"></div>').appendTo(this.$rightBox);
    },

    initLeftBox: function() {
        var $box = this.$box = $('<div></div>').appendTo(this.$leftBox);
        $box.addClass('parent-player-box');
        var $playerBox = this.$playerBox = $('<div></div>').appendTo(this.$box);
        $playerBox.addClass("player-box");
        var $fullScreenBtn = this.$fullScreenBtn = $('<span class="iconfont icon icon-full-screen- btn-fullScreen"></span>').appendTo(this.$box);
        this.playerBoxFullScreen();
        this.fullscreenChange();
    },

    initSearchInput: function() {
        var self = this;
        var text = '<div>'+
                    '<input class="search-input"/ placeholder="'+it.util.i18n("Insert_group_name")+'">'+
                    '<button class="search">'+it.util.i18n("Search")+'</button>'+
                    '</div>';
        this.$filter = $(text);
        this.$rightBox.append($(text));
        this.$dialog.find('.search').click(function () {
            self.filterData();
        });
    },

    filterData: function() {
        var groupName = this.$dialog.find('.search-input').val();
        var groupData = this.getGroupDataByname(groupName); 
        this.$tableBox.mulCamera('destroy');
        this.refreshTableBox(groupData);
    },

    getGroupDataByname: function(groupName) {
        var groupData = [];
        for(var id in this._cameraGroupMap){
            var group = this._cameraGroupMap[id];
            if((group.name.indexOf(groupName)>-1) || !groupName) {
                var objData = {};
                objData.boxTitle = group.name;
                objData.id = group.id;
                objData.sortNum = group.sortNum;
                objData.defaultGroup = group.defaultGroup;
                objData.rowsValue = this.getRowsValueById(group.id);
                groupData.push(objData);
            }         
        }
        return groupData;
    },

    addData: function() {
        var groupData = this.getGroupDataByname();
        this.refreshTableBox(groupData);
    },

    getRowsValueById: function(groupId) {
        var rowsValue = [];
        for(var i in this._groupOfCamera){
            var data = this._groupOfCamera[i];
            var id = data.groupId;
            if (id == groupId){
                var cameraId = data.cameraId;
                var obj = {};
                obj.value = this._allCameraMap[cameraId].getName() || this._allCameraMap[cameraId].getId();
                var cameraDataType = this.dataManager.getDataTypeForData(this._allCameraMap[cameraId]);
                var modelId = cameraDataType.getModel();
                for(var id in dataJson.cameraIcons){
                    var camera = dataJson.cameraIcons[id];
                    var model = camera.modelId;
                    if (model.indexOf(modelId)>-1){
                        obj.className = camera.className;
                    }
                };
                rowsValue.push(obj);
            }
        }
        return rowsValue;
    },

    //创建rightBox的tableBox -- groupData
    refreshTableBox: function(groupData) {
        if (!groupData.length){
            //layer.msg('');
        }
        var self = this;
        this.$tableBox.mulCamera({
            cameraGroup: groupData,
            showCameras: function(event, data) {
                self.refreshCameraBox(data);
                self.addSelectedToBox(data);
                self.destroyHls();
            }
        });
    },

    addSelectedToBox: function(data) {
        var ele = data.ele;
        ele.siblings().removeClass('selected').addClass('unSelected');
        ele.removeClass('unSelected').addClass('selected');
    },

    refreshCameraBox: function(data) {
        var id = data.id,
            group = this._cameraGroupMap[id],
            defaultGroup = group.defaultGroup,
            sortNum = group.sortNum,
            row = this.row = group.mulCameraRow,
            col = this.col = group.mulCameraCol;
        this.getCameraGroupByGroupId(id,row,col);
    },

    getCameraGroupByGroupId: function(id,row,col) {
        var self = this;
        this.cameraMap =[];
        for(var i in this._groupOfCamera){
            var camera = this._groupOfCamera[i],
                groupId = camera.groupId;
            if(groupId == id){
                self.cameraMap.push(camera.cameraId);
            }
        };
        var parent = this.$playerBox;
        self.createMulCamera(parent, row, col);
        self.getVideoByUrl();
        self.videoHandler();
    },

    //创建leftbox的videoBox -- this.cameraMap
    createMulCamera: function(parent, row, col){
        var self = this;
        var boxWidth = this.playerBoxWidth = parent.width()-1,
            boxHeight = this.playerBoxHeight = parent.height()-1,
            width = this.videoBoxWidth =  (100/col - 1) + '%',
            height = this.videoBoxHeigth = (100/row - 1) + '%',
            firstCol;
        var index = 0;
        parent.empty();
        for(var r=0;r<row;r++){
            for(var c=0;c<col;c++){
                if (!c) {
                    firstCol = true;
                } else {
                    firstCol = false;
                };
                self.createVideoBox(parent,width,height,index,firstCol);
                index++;
            }
        };
    },

    createVideoBox: function(parent,width,height,index,firstCol) {
        var $videoBox = this.$videoBox = $('<div class="videoBox"></div>');
        if (firstCol) {
            $videoBox.addClass('firstCol')
        };
        var videoBox = $videoBox.get(0);
        videoBox.style.width = width;
        videoBox.style.height = height;
        parent.append($videoBox);
        this.createVideo(width, height,videoBox,index);
    },

    videoHandler: function() {
        var self = this;
        this.$playerBox.find('.videoBox').dblclick(function(event){
            var target = event.target; 
            var videoSrc = target.getAttribute('src');
            if (!videoSrc)return;
            self.fullScreenInDialog = self.fullScreenInDialog ? false : true;
            if (self.fullScreenInDialog) {
                var $this = self.fullDiv = $(this);
                self.showFullScreen($this);
                self.hideLoading();
            } else {
                self.hideFullScreen(self.fullDiv);
                self.showLoading();
            };           
            
        });
    },

    showFullScreen: function ($this) {
        var self = this;
        $this.css({
            width: '99%',
            height: '100%',
            position: 'absolute',
            zIndex: '2',
        });    
    },

    hideFullScreen: function($this) {
        var self = this;
        $this.css({
            width: self.videoBoxWidth,
            height: self.videoBoxHeigth,
            position: 'relative',
            zIndex: '1',
        });
    },

    playerBoxFullScreen: function() {
        var self = this;    
        this.$fullScreenBtn.click(function(){
            self.toggleFullscreen();
        });
    },

    isFullScreen : function(){
        return document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen;
    },

    toggleFullscreen : function() {
        // if (this.isFullScreenSupported()) {
            var fullscreen = this.isFullScreen();//document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen;
            if (!fullscreen) {
                var docElm = this.$leftBox.get(0);
                if (docElm.requestFullscreen) {
                    docElm.requestFullscreen();
                } else if (docElm.webkitRequestFullScreen) {
                    docElm.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
                } else if (docElm.mozRequestFullScreen) {
                    docElm.mozRequestFullScreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                }
            }
        // }
    },

    fullscreenChange: function() {
        var self = this;
        document.addEventListener("fullscreenchange", function(e) {
            console.log("fullscreenchange", e);
            self.toggleFullBtnClass();
            self.loadingFullScreenChange();
        });
        document.addEventListener("mozfullscreenchange", function(e) {
            console.log("mozfullscreenchange ", e);
            self.toggleFullBtnClass();
            self.loadingFullScreenChange();
        });
        document.addEventListener("webkitfullscreenchange", function(e) {
            console.log("webkitfullscreenchange", e);
            self.toggleFullBtnClass();
            self.loadingFullScreenChange();
        });
        document.addEventListener("msfullscreenchange", function(e) {
            console.log("msfullscreenchange", e);
            self.toggleFullBtnClass();
            self.loadingFullScreenChange();
        });
    },

    toggleFullBtnClass: function() {
        var fullscreen = this.isFullScreen();
        if (fullscreen){
            this.$fullScreenBtn.removeClass('icon-full-screen-').addClass('icon-full-screen-back');
            this.$leftBox.addClass('fullScreen');
        } else {
            this.$fullScreenBtn.removeClass('icon-full-screen-back').addClass('icon-full-screen-');
            this.$leftBox.removeClass('fullScreen');
        }      
    },

    createVideo: function(width, height,videoBox,index) {
        var self = this;
        if (!this.cameraMap)return;
        var len = this.cameraMap.length;
        if ((index+1) > len)return;

        var cameraId = this.cameraMap[index];
        var player = document.createElement('video');
        player.setAttribute('class', 'video-'+cameraId);
        videoBox.append(player);

        player.setAttribute('autoplay', 'false');
        // player.style.width = width;
        // player.style.height = height;
        player._play = function () {
            player.play();
        }
        player._stop = function () {
            player.pause();
        }
        player._src = function (src) {
            player.setAttribute('src', src);
            self.removeLoading(videoBox);
            self.addVideoMsg(videoBox,cameraId);
        }
        player.loop = true;  
        this.addLoading(videoBox,width, height);
    },

    playVideoForDefSrc: function() {
        var self = this;
        this.$playerBox.find('video').each(function(){
            this._src(self.defaultSrc)
        });
    },

    show: function() {
        if(!this.$dialog)return;
        this.$dialog.dialog('open');
        this.addData(); 
        this.$tableBox.mulCamera('handlerFirstBox');
        this.handlerDialogClose();
    },

    hide: function() {
        if(!this.$dialog)return;
        this.$dialog.dialog('close');
        this.$dialog.find('.search-input').val('');
        this.$tableBox.mulCamera('destroy');
        this.destroyDefaulVideo();
    },

    //请求video的src资源
    getVideoByUrl: function() {
        var self = this;
        var len = this.cameraMap.length;
        this.rtspPlay(len,this.cameraMap); //向视频服务器请求视频 
    },

    rtspPlay: function(len, cameraMap) {
        if (this.loginServer || !pageConfig.needLogin){
            this.getRtsp(len, cameraMap);
        } else {
            this.loginVideoServer(len, cameraMap);
        };
    },

    loginVideoServer: function(len, cameraMap){
        var self = this;
        var login = "http://"+pageConfig.ip+":"+pageConfig.port+"/module/auth/onLogin";
        $.ajax({
            url:login,
            type:"post",
            data:pageConfig.loginData,
            success:function(res){
                if(res.status==1){
                    self.loginServer = true;
                    self.getRtsp(len, cameraMap);
                }
            },
            error: function (error) {
                console.error(it.util.i18n("Not_Login_Server"));
                self.playVideoForDefSrc();
            }
        }); 
    },

    getRtsp: function(len, cameraMap) {
        if(!this.loginServer && pageConfig.needLogin){
            layer.msg(it.util.i18n("Not_Login_Server"));
            return;
        };
        var self = this;
        var ajax = $.ajax;
        if (len<=0)return;
        this.rtspAjax(cameraMap);
    },

    rtspAjax: function(cameraMap){
        var self = this;
        var postUrl = "http://"+pageConfig.ip+":"+pageConfig.port+"/module/live/GetLiveVideoUrlByRTSPUrl";
        if (!cameraMap.length)return;
        cameraMap.forEach(function(cameraId) {
            var camera = self._videoSrcMap[cameraId];
            var video = self.$leftBox.find('.video-'+cameraId).get(0);
            var videoBox = $(video).parent('.videoBox').get(0);
            if (!camera) {
                video._src(self.defaultSrc)
                return;
            }
            var cameraUrl = camera.url;
            if (!cameraUrl){
                video._src(self.defaultSrc)
                return;
            };
            $.ajax({
                data:{
                    rtspUrl:cameraUrl
                },
                url: postUrl,
                type:"post",
                success:function (res) {
                    if(res.status==1){
                        var url = res.result.data.url;
                        self.videoWall.initHls(video,url, function () {
                            // self.$dialog.dialog({
                            //     close: function() {
                            //         self.destroyHls(); 
                            //         self.destroyDefaulVideo();
                            //     }
                            // });
                        });
                        self.removeLoading(videoBox);
                        self.addVideoMsg(videoBox,cameraId);
                        self.videoWall.checkVideoIsNormal();
                    };
                    self.$playerBox.height('100%');
                },
                error: function (error) {
                    //console.error(error);
                    layer.msg(cameraId + it.util.i18n('Url_error'))
                }
            });
        });
    },

    destroyHls: function() {
        this.videoWall.destroyHls();
    }, 

    destroyDefaulVideo: function() {
        this.$playerBox.find('video').each(function(){
            $(this).attr('src','');
        });
    },

    addLoading: function(videoBox,width,height) {
        var $loading = $('<div class="loadEffect">'
                    + '<span></span>'
                    + '<span></span>'
                    + '<span></span>'
                    + '<span></span>'
                    + '<span></span>'
                    + '<span></span>'
                    + '<span></span>'
                    + '<span></span>'
                    + '</div>');
        var width = videoBox.clientWidth;
        var height = videoBox.clientHeight;
        $loading.css({
            marginLeft:(width-100)/2+'px',
            marginTop:(-100-height)/2 +'px',
        });
        $loading.appendTo(videoBox);
    },

    loadingFullScreenChange: function() {
        var videoBox = this.$videoBox.get(0);
        var width = videoBox.clientWidth;
        var height = videoBox.clientHeight;
        this.$playerBox.find('.loadEffect').each(function(){
            $(this).css({
                marginLeft:(width-100)/2+'px',
                marginTop:(-100-height)/2 +'px',
            })
        });
    },

    removeLoading: function(videoBox) {
        var $loading = $(videoBox).find('.loadEffect');
        $loading.remove();
    },

    hideLoading: function() {
        this.$playerBox.find('.loadEffect').each(function(){
            $(this).hide();
        });
    },

    showLoading: function() {
        this.$playerBox.find('.loadEffect').each(function(){
            $(this).show();
        });
    },

    addVideoMsg: function(videoBox,cameraId) {
        var camera = this._allCameraMap[cameraId],
            name = camera.getName(),
            $videoBox = $(videoBox);
        var $id = $('<div class="video-id">'+cameraId+'</div>').appendTo($videoBox);
        var $name = $('<div class="video-name">'+name+'</div>').appendTo($videoBox);
    },

    handlerWindowResize: function()  {
        var self = this;
        window.addEventListener('resize', function() {
            var nw = self.getnw();
            self.$dialog.dialog('option', 'width', nw);
        });
    },

    handlerDialogClose: function() {
        var self = this;
        this.$dialog.dialog({
            close: function() {
                self.destroyHls(); 
                self.destroyDefaulVideo();
                main.panelMgr.instanceMap.NavBarMgr.$box.nav('clickNavIcon', 'security');
            }
        });
    }
});

it.MulCameraManager = $MulCameraManager;