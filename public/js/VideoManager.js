// http://www.xuebuyuan.com/1208330.html
// http://blog.csdn.net/chinabinlang/article/details/45092297
/**
 * 视频播放插件，支持四种方式
 * 1 video 标签，播放静态资源 mp4 之类的
 * 2 jwplayer 播放 flv f4v 之类
 * 3 vlc 播放 ie 和 firfox 下的 rtsp
 * 4 vxgplayer 播放 chrome 下的 rtsp
 * 先写死配置，后续再自动选择
 * 1.如果 navBar.js 中 dataJson.simulateCamera !== false  使用 video 标签播放视频，模拟视频流，否则执行2，3，4
 * 2.如果 navBar.js 中 dataJson.forceUseJwplayer === true   使用 jwplayer 播放视频，否则执行 3，4
 * 3.如果是 chrome 使用 vxgplayer  播放 rtsp
 * 4.如果是 IE     使用 vlc player 播放 rtsp
 * 公共属性
 *  宽度，高度，播放的 url，类型（对应上面的4种方式）
 * 公共方法
 *  播放
 * @function {VideoManager}
 * @return {type} {description}
 */
it.VideoManager = function () {
    it.EventHandler.call(this);
    this.cameraMap = {};
    this.playerId = '_camera_player_';
    this.playerWidth = '640px';//不要随便改这个尺寸， 这个是 vxgplay 尺寸
    this.playerHeight = '480px';//不要随便改这个尺寸， 这个是 vxgplay 尺寸
    this.src = './resource/video/test.mp4';
    this.loginServer = false;
    this._videoSrcMap = {}; //cctv所有camera的url
    this.videoWall = new VideoWall();
}

it.VideoManager.getInstance = function () {
    if (!main.videoManager) {
        main.videoManager = new it.VideoManager();
        main.videoManager.init();
    }
    return main.videoManager;
};

mono.extend(it.VideoManager, Object, {

    init: function () {

        jwplayer.key = "EV3MZRl3n+odqbaPzj9D9cTbENLpBnFvXmj3fg==";
        this.initView();
        this.initCameraView();
        this.initPlayerView();
    },
    initView: function () {

        var self = this;
        var $box = this.$box = $('<div class="camera-box"></div>').appendTo($('body'));
        var w = document.body.clientWidth, nw;
        if (w < 1440) {
            nw = 1070;
        } else if (w >= 1440 && w < 1920) {
            nw = 1070;
        } else if (w >= 1920) {
            nw = 1190;
        }
        $box.dialog({   //创建dialog弹窗
            blackStyle: true,
            width: nw,
            height: 600,
            title: '摄像头',
            closeOnEscape: false,
            show: false,
            hide: false,
            autoOpen: false,     //初始化之后，是否立即显示对话框，默认为 true
            resizable: false,    //设置是否可拉动弹窗的大小，默认为true
            modal: true,         //是否有遮罩模型
            // open: function (event) {
            // },
            // close: function () {
            //     self.hide();
            // },
            //buttons: [           //定义两个button按钮
                //{
                //    text: "确定",
                //    click: function () {
                //        self.submit();
                //    }
                //}
            //]
        });
        $box.parent().find('.ui-dialog-titlebar-close').on('click', function () {
            self.closeCamera();
        });

        //
        var $header = this.$header = $('<div class="header-box"></div>').appendTo($box);
        var $center = this.$center = $('<div class="center-box"></div>').appendTo($box);
        var $footer = this.$footer = $('<div class="footer-box"></div>').appendTo($box);

        //
        var $leftBox = this.$leftBox = $('<div class="left-box"></div>').appendTo($center);
        var $rightBox = this.$rightBox = $('<div class="right-box"></div>').appendTo($center);


        var $playerBox = this.$playerBox = $('<div></div>').appendTo($leftBox);
        $playerBox.addClass("player-box");
        $playerBox.attr('id', this.playerId);
        $playerBox.width(parseInt(self.playerWidth));
        $playerBox.width(parseInt(self.playerHeight));
    },
    initPlayerView: function () {
        var self = this;
        var $playerBox = this.$playerBox;
        var cameraType = dataJson.cameraType || 'video';
        if (cameraType == 'video') {
            //使用 video 标签
            $playerBox.css('padding', '10px');
            $playerBox.addClass("video");
            var player = this.player = document.createElement('video');
            $playerBox.append(player);
            // player.setAttribute('src', this.src);
            // video.setAttribute('controls', 'false');
            player.setAttribute('autoplay', 'false');
            player.style.width = this.playerWidth;
            player.style.height = this.playerHeight;
            player._play = function () {
                player.play();
            }
            player._stop = function () {
                player.pause();
            }
            player._src = function (src) {
                player.setAttribute('src', src);
            }
            player.loop = true;
        } else if (cameraType === 'jwplayer') {
            //使用 jwplayer
            $playerBox.css('padding', '10px');
            $playerBox.addClass("jwplayer");
            var player = this.player = jwplayer(this.playerId);

            player._play = function () {
                player.setup({
                    flashplayer: './ext-lib/jwplayer.flash.swf',
                    file: player.file,
                    primary: jwplayer.utils.isChrome() ? "flash" : "html5",
                    autostart: true,
                    repeat: true,
                    width: parseInt(self.playerWidth),
                    height: parseInt(self.playerHeight),
                    dock: false,
                });
                player.play(true);
            }
            player._stop = function () {
                player.play(false);
            }
            player._src = function (src) {
                player.file = src;
            }
        } else if (cameraType === 'image') {
            //使用 img 标签
            $playerBox.css('padding', '10px');
            $playerBox.addClass("img");
            var player = this.player = document.createElement('img');
            $playerBox.append(player);
            // player.setAttribute('src', this.src);
            // video.setAttribute('controls', 'false');
            player.style.width = this.playerWidth;
            player.style.height = this.playerHeight;
            player._play = function () {

            }
            player._stop = function () {

            }
            player._src = function (src) {
                player.setAttribute('src', src);
            }
        } else if (cameraType === 'rtsp') {
            if (this.isIE()) {
                //vlc
                $playerBox.css('padding', '10px');
                $playerBox.addClass("vlc_ie");
                var s = '<object classid="clsid:9BE31822-FDAD-461B-AD51-BE1D1C159921" codebase="http://download.videolan.org/pub/videolan/vlc/last/win32/axvlc.cab" id="vlc" name="vlc" class="vlcPlayer" width="'
                    + this.playerWidth + '" height="'
                    + this.playerHeight + '" events="True">      <param name="src" value="" />      <param name="autoplay" value="false" />     <param name="allowfullscreen" value="true" />      <param name="mute" value="false" />    <param name="volume" value="100" />    <param name="autoloop" value="true" />    <param name="controls" value="true" />    <param name="bgcolor" value="#000000" />    <param name="text" value="empty" /></objetc>'
                $playerBox.append(s);
                var player = this.player = document.getElementById('vlc');
                player._play = function () {
                    player.playlist.play();
                }
                player._stop = function () {
                    player.playlist.stop();
                }
                player._src = function (src) {
                    player.playlist.clear();
                    player.playlist.add(src);
                }
            } else if (this.isFirefox()) {
                //firfox
                $playerBox.css('padding', '10px');
                $playerBox.addClass("vlc_firfox");
                var s = '<embed id="vlc"  type="application/x-google-vlc-plugin" version="VideoLAN.VLCPlugin.2" autoplay="false" loop="no" width="'
                    + this.playerWidth + '" height="'
                    + this.playerHeight + '"  target="" ></embed>  ';
                $playerBox.append(s);
                var player = this.player = document.getElementById('vlc');
                player._play = function () {
                    player.playlist.play();
                }
                player._stop = function () {
                    player.playlist.stop();
                }
                player._src = function (src) {
                    player.playlist.clear();
                    player.playlist.add(src);
                }
            } else {
                //vxgplayer
                // $playerBox.css('padding', '10px');//vxgplay里面有 margin:10px
                $playerBox.addClass("vxgplayer");
                var player = this.player = vxgplayer(this.playerId, {
                    url: '',
                    nmf_path: 'media_player.nmf',
                    nmf_src: './libs/pnacl/Release/media_player.nmf',
                    latency: 5000,
                    aspect_ratio_mode: 1,
                    autohide: 3,
                    controls: true,
                    avsync: true,
                    autoreconnect: 1,
                    auto_reconnect: 1,
                })
                if (player) {
                    player.size(parseInt(self.playerWidth), parseInt(self.playerHeight));
                    player._play = function () {
                        player.play();
                    }
                    player._stop = function () {
                        player.stop();
                    }
                    player._src = function (src) {
                        player.src(src);
                    }
                } else {

                }
            }
        } else {
            console.error('不支持的 camera 类型：cameraType=' + cameraType);
        }
    },
    isIE: function () {
        if (!!window.ActiveXObject || "ActiveXObject" in window)
            return true;
        else
            return false;
    },
    isFirefox: function () {
        return navigator.userAgent.indexOf("Firefox") >= 0;
    },
    initCameraView: function () {

        var self = this;
        var $cameraBox = this.$cameraBox = $('<div class="camera-list-box"></div>').appendTo(this.$rightBox);
        var $table = this.$table = $('<table></table>').appendTo($cameraBox);
        $('<thead>' +
            '<td class="id">编号</td>' +
            '<td class="name">名称</td>' +
            '<td class="operation">操作</td>' +
            '</thead>').appendTo($table);
        var $tbody = this.$tbody = $('<tbody></tbody>').appendTo($table);

        $table.on('click', '.open', function () {
            self.destroyHls();
            if (!self.player) {
                layer.msg('初始化播放器失败');
                return;
            }
            self.player.setAttribute('src','');
            var $opt = $(this);
            var id = $opt.data('id');
            var src = $opt.data('src');

            var callback = function(){
                if (self.cameraId) {
                    // if (self.cameraId === id) {
                    //     //切换
                    //     self.closeCamera();
                    // } else {
                        self.closeCamera();
                        self.openCamera(src, id);
                    //}
                } else {
                    self.openCamera(src, id);
                }
            };

            self.rtspPlay(id,callback);
        });
        $table.on('click', '.on', function () {
            self.destroyHls();
            var $opt = $(this);
            var id = $opt.data('id');
            var src = $opt.data('src');

            var a = self.$tbody.find('a[data-id="' + id + '"]');
            a.addClass('open');
            a.removeClass('on');
            a.text('打开');
            self.player._src('');
        })
    },
    getCameraInfo: function (camera) {
        return {
            id: camera.getId(),
            name: camera.getName() || camera.getId() || '',
            description: camera.getDescription() || '',
            src: (camera.getExtend() ? camera.getExtend().src : '') || '',
        }
    },
    refreshCameraList: function (cameras) {
        var self = this;
        var $tbody = this.$tbody;
        this.$tbody.empty();
        cameras.forEach(function (camera, i) {
            var item = self.getCameraInfo(camera);
            var tr = $('<tr>' +
                '<td class="id">' + item.id + '</td>' +
                '<td class="name">' + item.name + '</td>' +
                '<td class="operation">' +
                '   <a data-id="' + item.id + '" data-src="' + item.src + '" class="opt open">打开</a>' +
                '</td>' +
                '</tr>').appendTo($tbody);
            tr.attr('title', item.src);
            tr.attr('camera', item.id);
            if (i % 2 == 1) {
                tr.addClass('even');
            } else {
                tr.addClass('odd');
            }
        })
    },
    openCamera: function (src, cameraId) {
        if (!this.player) {
            return;
        }
        var self = this;
        src = src || this.src;
        var a = this.$tbody.find('a[data-id="' + cameraId + '"]');
        a.addClass('on');
        a.removeClass('open');
        a.text('关闭');
        this.cameraId = cameraId;
        this.player._stop();
        if (!this.player.getAttribute('src')){
            this.player._src(src);
        };  
        this.player._play();
        //浪潮的使用 chrome 上的 vxg player 播放时，切换摄像头时，ready 方法么有触发，这个需要注意一下。
        if (this.player.ready) {
            this.player.ready(function () {
                if (!self.player.isPlaying || !self.player.isPlaying()){
                    self.player._play();
                }
            })
        } 
        // else {
        //     this.player._play();
        // }
        
        //不知道为什么要延迟一秒再次播放视频，先注释了（杨兴康）
        // setTimeout(function(){
        //     if (!self.player.isPlaying || !self.player.isPlaying()){
        //         self.player._play();
        //     }
        // }, 1000) 
    },

    //请求video的src资源
    rtspPlay: function(cameraId,callback) {
        if (this.loginServer || !pageConfig.needLogin){
            this.getRtsp(cameraId,callback);
        } else {
            this.loginVideoServer(cameraId,callback);
        };
    },

    loginVideoServer: function(cameraId,callback){
        var self = this;
        var login = "http://"+pageConfig.ip+":"+pageConfig.port+"/module/auth/onLogin";
        $.ajax({
            url:login,
            type:"post",
            data:pageConfig.loginData,
            success:function(res){
                if(res.status==1){
                    self.loginServer = true;
                    self.getRtsp(cameraId,callback);
                }
            },
            error: function (error) {
                console.error(it.util.i18n("Not_Login_Server"));
                callback&&callback.call(self);
                return;
            }
        }); 
    },

    rtspAjax: function(cameraUrl,callback) {
        var self = this;
        var url = "http://"+pageConfig.ip+":"+pageConfig.port+"/module/live/GetLiveVideoUrlByRTSPUrl";
        if (!cameraUrl){
            callback&&callback.call(self);
            return;
        };
        $.ajax({
            data:{
                rtspUrl:cameraUrl
            },
            url: url,
            type:"post",
            success:function (res) {
                if(res.status==1){
                    var url = res.result.data.url;
                    // var video = self.$leftBox.find('.video-'+cameraId).get(0);                  
                    self.videoWall.initHls(self.player,url, function () {
                        self.$box.dialog({
                            close: function() {
                                self.destroyHls(); 
                            }
                        });
                        callback&&callback.call(self);
                    });
                };     
            },
            error: function (error) {
                // console.error(error);
                callback&&callback.call(self);
            }
        });
    },

    getRtsp: function(cameraId,callback) {
        if(!this.loginServer && pageConfig.needLogin){
            layer.msg(it.util.i18n("Not_Login_Server"));
            return;
        };
        var self = this;
        var ajax = $.ajax;
        var url = "http://"+pageConfig.ip+":"+pageConfig.port+"/module/live/GetLiveVideoUrlByRTSPUrl";
        (function($){
            var camera = self._videoSrcMap[cameraId];
            if (camera) {
                var cameraUrl = camera.url;
                self.rtspAjax(cameraUrl,callback);
            } else {
                it.util.api('cctv', 'find', {}, function(cctvMap){
                    //self._cameraUrlMap = cctvMap;
                    for(var c in cctvMap){
                        var cam = cctvMap[c],
                            id = cam.id,
                            url = cam.url;
                        self._videoSrcMap[id] = cam;
                    };
                    camera = self._videoSrcMap[cameraId];

                    if (!camera) {
                        callback&&callback.call(self);
                        return;
                    };
                    var cameraUrl = camera.url;
                    self.rtspAjax(cameraUrl,callback);
                });
            }      
		})(jQuery);
    },
    destroyHls: function() {
        this.videoWall.destroyHls();
    }, 
    closeCamera: function () {
        if (!this.cameraId) {
            return;
        }
        var a = this.$tbody.find('a[data-id="' + this.cameraId + '"]');
        a.removeClass('on');
        a.addClass('open');
        a.text('打开');
        delete this.cameraId;
        if (!this.player) {
            return;
        }
        this.player._stop();
    },
    show: function (cameraId) {
        if (!main.sceneManager._currentRootData) {
            layer.msg('等待场景加载完毕。。。');
            return;
        }
        if (this.$box.dialog('isOpen')) {
            return;
        }
        this.$box.dialog('open');

        var self = this;
        if (this.sceneId != main.sceneManager._currentRootData.getId()) {
            this.sceneId = main.sceneManager._currentRootData.getId();
            var ds = main.sceneManager.dataManager.getDescendants(main.sceneManager._currentRootData);
            ds = ds.filter(function (d) {
                var dt = main.sceneManager.dataManager.getDataTypeForData(d);
                return dt.getCategoryId() == 'camera';
            })
            var map = this.cameraMap = {};
            ds.forEach(function (d) {
                map[d.getId()] = d;
            })
            this.refreshCameraList(ds);
        }

        setTimeout(function () {
            //vlc player 第一次显示时，不必须改动一下 dom 位置才会初始化
            var p = self.$box.parent();
            var top = p.offset().top + 2;
            p.css('top', top + 'px')
            self.$tbody.find('a[data-id="' + cameraId + '"]').click();
        }, 500);
    },
    hide: function () {
        if (this.cameraId) {
            this.$tbody.find('a[data-id="' + this.cameraId + '"]').click();
        }
        delete cameraId;
        this.$box.dialog('close');
    }
});

