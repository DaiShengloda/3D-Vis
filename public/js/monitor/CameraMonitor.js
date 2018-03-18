if(!it.monitor){
    it.monitor = {};
}

var CameraMonitor = function(sceneManager,category){
	Monitor.call(this, sceneManager, category);
};
mono.extend(CameraMonitor,Monitor,{
    showRealTimeDialog: function(data){
        var videoManager = it.VideoManager.getInstance();
        videoManager.show();
        // // videoManager.initCCTV();
        // videoManager.playForCamera(data.getId());

        // var video = document.createElement('video');
        // video.setAttribute('src', './images/test1.mp4');
        // video.setAttribute('controls', 'false');
        // video.setAttribute('autoplay', 'false');
        // video.setAttribute('width', 610);
        // video.setAttribute('height',410);
        // var self = this;
        // video.oncanplay = function() {
        //     main.afterLookAtManager.showDialog(video, title, video.width, video.height);
        // }
    }
});
it.monitor.CameraMonitor=CameraMonitor;
