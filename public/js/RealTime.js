it.RealTime = function (sceneManager, application) {
    if(!sceneManager) {
        return;
    }
    this.sceneManager = sceneManager;
    this.dataManager = this.sceneManager.dataManager;
    this.defaultEventHandler = sceneManager.viewManager3d.getDefaultEventHandler();
    this.network = this.sceneManager.network3d;
    this.box3D = this.network.getDataBox(); 
    this.camera = this.network.getCamera();
    this.application = application;
    this.appStates = false;
    this.appInit();
};

mono.extend(it.RealTime, Object, {
    appInit: function() {
     
    },

    appStart: function() {
        this.appStates = true;
    },

    appEnd: function() {
        this.appStates = false;      
    }
})