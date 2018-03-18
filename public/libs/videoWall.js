;(function(undefined) {
    "use strict"
    var _global;

    //对象合并
    function extend(o,n,override) {
        for(var key in n){
            if(n.hasOwnProperty(key) && (!o.hasOwnProperty(key) || override)){
                o[key]=n[key];
            }
        }
        return o;
    }

    // 构造函数
    function VideoWall(solution, config){
        this._init(solution, config);
    }

    VideoWall.prototype = {
        constructor: this,
        _init: function(solution, config) {
            // 默认参数
            var def = {
                domId:"live_detail",//放置video的div的id
                btn: "<button class='btn onstart video_btn btn-primary' data-toggle='modal' data-target='#cameraModal'>开启</button><button class='btn btn-primary video_btn'>关闭</button>",
                hasBar: true,//是否显示bar
                hlsConfig: {//hls配置
                    autoStartLoad: true,
                    startPosition : -1,
                    capLevelToPlayerSize: false,
                    debug: false,
                    initialLiveManifestSize: 1,
                    maxBufferLength: 30,
                    maxMaxBufferLength: 300,
                    maxBufferSize: 30*1000*1000,
                    maxBufferHole: 0.5,
                    lowBufferWatchdogPeriod: 0.5,
                    highBufferWatchdogPeriod: 3,
                    nudgeOffset: 0.1,
                    nudgeMaxRetry : 3,
                    maxFragLookUpTolerance: 0.2,
                    liveSyncDurationCount: 1,
                    liveDurationInfinity:true,
                    liveMaxLatencyDurationCount: 3,
                    enableWorker: true,
                    enableSoftwareAES: true,
                    manifestLoadingTimeOut: 10000,
                    manifestLoadingMaxRetry: 1,
                    manifestLoadingRetryDelay: 500,
                    manifestLoadingMaxRetryTimeout : 64000,
                    startLevel: undefined,
                    levelLoadingTimeOut: 10000,
                    levelLoadingMaxRetry: 4,
                    levelLoadingRetryDelay: 500,
                    levelLoadingMaxRetryTimeout: 64000,
                    fragLoadingTimeOut: 20000,
                    fragLoadingMaxRetry: 6,
                    fragLoadingRetryDelay: 500,
                    fragLoadingMaxRetryTimeout: 64000,
                    startFragPrefetch: false,
                    appendErrorMaxRetry: 3,
                    enableWebVTT: true,
                    enableCEA708Captions: true,
                    stretchShortVideoTrack: false,
                    forceKeyFrameOnDiscontinuity: true
                }
            };
            var defSolution = {
                size: 1, //默认播放一个视频
                isRegular: true,//是否形状规则的
                layout: {},//当不规则时的布局
                isPolling:false,//是否轮询
                pollingStyle:{},//轮询方式
                videoScale: 16/9,//视频播放比例
                refreshTime: 60*60*1000,//视频刷新时间
                showProgress:true,//是否显示进度条
                removeBufferTime:30*1000,//清除缓存时间
                checkTime:10*60*1000//检查是否有没打开的视频
            };
            this.def = extend(def, config, true); //配置参数
            this.solution = extend(defSolution, solution, true);
            this.hlsMap = [];//存放hls
            this.isRefresh = false;//保证只有一个timer启动
            this.bufferRemove = false;
            this.removeBufferTimer;
            this.reloadTimer;
            this.heartBeatTimer;
            this.heartBeatData = [];//心跳返回
        },

        /*渲染video布局
        * callback 给按钮加事件等等
        * pollingMed 轮询的方式
        * layoutMed 不用默认布局时的布局方式
        * */
        initVideoDom: function(callback, pollingMed, layoutMed){
            var _this = this;
            this.destroyHls();
            var domId = "#" + this.def.domId;
            $(domId).html("");
            if(_this.solution.isRegular){
                var size = _this.solution.size;
                var rowLength = Math.sqrt(size);
                var rowSize = 4;
                if(size == 2){
                    rowSize = 6;
                }else if(rowLength != Math.floor(rowLength)){
                    rowSize = 4;
                }else {
                    var _tempSize = Math.floor(12/rowLength);
                    rowSize = _tempSize<2 ? 2:_tempSize;
                }
                var $html = "";
                for(var i=0,j=size; i<j; i++){
                    $html += "<div class='col-sm-"+rowSize+"' style='padding: 0px;'>" +
                        "         <div class='col-sm-12 video_div' style='padding: 0px;position: relative'>" +
                        "              <video type='application/x-mpegURL' class='video_"+i+"' controls='controls' object-fit='fill' width='100%' height='100%'></video>" +
                        "              <div class='video_bar' style='display: none'>"+_this.def.btn+"</div>" +
                        "         </div>" +
                        "     </div>";
                }
                $(domId).html($html);
                $html=null;
                _this.resizeVideo();
                callback && callback();
                if(_this.solution.isPolling){
                    pollingMed && pollingMed();
                }
            }else{//不规则
                layoutMed && layoutMed();//布局
                callback && callback();
                if(_this.solution.isPolling){
                    pollingMed && pollingMed();
                }
            }
            return this;
        },

        /*设置video比例*/
        resizeVideo: function () {
            var self =this;
            var width = $("video").width();
            var height =width/this.solution.videoScale;
            $("video").each(function () {
                $(this).css("height",height+"px");
                if(!self.solution.showProgress){
                    this.controls=false;
                }
                self.initBar(this);
            });
            return this;
        },

        /*初始化hls并播放视频
        * callback 可以写啥时销毁hls
        * */
        initHls: function (video, src, callback, delayTime) {
            var self = this;
            var hls;
            var isExist = false;
            if(video.className && self.hlsMap[video.className]){
                hls = self.hlsMap[video.className];
                hls.detachMedia();
                hls.destroy();//释放掉旧的hls,避免给hls添加过多监听器
                hls = new Hls(self.def.hlsConfig);
                self.hlsMap[video.className] = hls;
                isExist = true;
            }else{
                hls = new Hls(self.def.hlsConfig);
                self.hlsMap[video.className] = hls;
            }
            self.playVideo(hls, video, src, delayTime);
            callback && callback(self);
            return this;
        },

        /*执行刷新清缓存*/
        checkVideoIsNormal: function (delayTime) {
            this.setVideoReloadAuto().removeBuffer(delayTime);
        },


        playVideo: function (hls, video, src, delayTime) {
            hls.detachMedia();
            hls.attachMedia(video);
            hls.on(Hls.Events.MEDIA_ATTACHED, function () {
                hls.loadSource(src);
                hls.on(Hls.Events.MANIFEST_PARSED, function() {
                    video.play();
                    $(video).unbind("loadedmetadata").bind("loadedmetadata",function () {
                        if(!this.duration){
                            hls.recoverMediaError();
                        }else{
                            if(delayTime){
                                this.currentTime = this.duration - delayTime;
                            }

                        }
                    });
                    $(video).unbind("error").bind("error",function(){
                        if(!this.duration || this.paused){
                            hls.recoverMediaError();
                        }
                    });
                });
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data.fatal) {
                    switch(data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            //fatal network error encountered, try to recover
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            //fatal media error encountered, try to recover
                            hls.recoverMediaError();
                            break;
                        default:
                            hls.destroy();
                            break;
                    }
                }
            });
            return this;
        },

        /*一定时间刷新一次*/
        setVideoReloadAuto:function() {
            var self = this;
            var time = self.solution.refreshTime;
            if(!this.isRefresh){
                self.reloadTimer = setInterval(function () {
                    self.reloadHls();
                },time);
            }
            self.isRefresh = true;
            return this;
        },

        //添加bar
        initBar: function (video) {
            var self =this;
            var video_div = $(video).parent().parent();
            var height = $(video).height();
            $(video_div).css("height",(height)+"px");
            if(self.def.hasBar){
                var bar = $(video).next();
                var button = $(bar).children('button');
                $(bar).css("top",-(height+4)+"px");

                $(video_div).mouseover(function () {
                    $(bar).show();
                });
                $(video_div).mouseout(function () {
                    $(bar).hide();
                });
            }
            return this;
        },


        //清除缓存
        removeBuffer: function (delayTime) {
            var _this = this;
            if(!_this.bufferRemove){
                var removeBufferTime =  _this.solution.removeBufferTime;
                _this.removeBufferTimer = setInterval(function () {
                    $("video").each(function () {
                        var self = this;
                        var hls = _this.hlsMap[self.className];
                        if(hls){
                            hls.currentLevel= -1;//清除缓存
                            if(!self.duration || self.paused){
                                hls.recoverMediaError();
                            }else if(delayTime && (self.duration - self.currentTime)>4){
                                self.currentTime = self.duration - delayTime;//拉进度条
                            }
                        }
                    });
                }, removeBufferTime);
            }
            _this.bufferRemove = true;
            return this;
        },

        /*刷新hls*/
        reloadHls: function () {
            var self =this;
            var hlsMap = self.hlsMap;
            if(hlsMap){
                for(var key in hlsMap){
                    var hls = hlsMap[key];
                    if(hls){
                        hls.recoverMediaError();
                    }
                }
            }
        },

        /*销毁hls*/
        destroyHls: function (videoKey, stopWatchParam) {
            var self = this;
            var hlsMap = self.hlsMap;
            if(videoKey){
                if(hlsMap){
                    var hls = hlsMap[videoKey];
                    if(hls){
                        hls.detachMedia();
                        hls.destroy();
                        delete self.hlsMap[videoKey];
                    }
                }
            }else{
                if(hlsMap){
                    for(var key in hlsMap){
                        var hls = hlsMap[key];
                        if(hls){
                            hls.detachMedia();
                            hls.destroy();
                        }
                    }
                    self.hlsMap = [];
                }
                self.clearTimer(self.removeBufferTimer);
                self.clearTimer(self.reloadTimer);
                self.clearTimer(self.heartBeatTimer);
            }
            //将请求后台减去观看数或者停掉ffmpeg推流
            if(stopWatchParam){
                self.stopWatch(stopWatchParam.url, stopWatchParam.data);
            }
        },

        //清除timer
        clearTimer: function (timer) {
            if(timer){
                clearInterval(timer);
            }
        },

        stopWatch: function (url, data) {
            var self = this;
            if(url){
                $.ajax({
                    data:{
                        data:data || self.heartBeatData
                    },
                    type:"post",
                    url:url,
                    success: function (res) {
                        if(res.status!=1){
                            console.log("stop watch wrong");
                        }else if(res.status == 1){
                            for(var i = 0,j=self.heartBeatData.length;i<j;i++){
                                var item = self.heartBeatData[i];
                                if(item === data){
                                    self.heartBeatData.splice(i,1);
                                }
                            }
                        }
                    },
                    error: function () {
                        console.log("stop watch error");
                    }
                })
            }
        },

        /*开启心跳*/
        startHeartBeat: function (data, url, time) {
            var self =this;
            self.heartBeatData = data;
            if(data && url && time){
                this.heartBeatTimer = setInterval(function () {
                    $.ajax({
                        data:{
                            heartData:self.heartBeatData
                        },
                        url:url,
                        type: "post",
                        success:function (res) {
                            if(res.status != 1){
                                console.log("heartbeat wrong");
                            }
                        },
                        error:function () {
                            console.log("heartbeat error");
                        }
                    })
                }, time);
            }
        }
    };


    // 最后将插件对象暴露给全局对象
    _global = (function(){ return this || (0, eval)('this'); }());
    if (typeof module !== "undefined" && module.exports) {
        module.exports = VideoWall;
    } else if (typeof define === "function" && define.amd) {
        define(function(){return VideoWall;});
    } else {
        !('VideoWall' in _global) && (_global.VideoWall = VideoWall);
    }
}());