var $VirtualDeviceRealtimeInfo = function(sceneManager) {
    $BaseServerTab.call(this, sceneManager);
    this.sceneManager = sceneManager;
    this.generalPanle = $('<div class="vmRealtimeTab bt-scroll"></div>');
    this.columnInfos = null;
    this.init();

};

mono.extend($VirtualDeviceRealtimeInfo, $BaseVirtualDeviceTab, {

    init: function() {
        if (!this.generalPanle || this.generalPanle.length < 1) {
            this.generalPanle = $('<div class="vmRealtimeTab"></div');
        }
    },

    getTitle: function() {
        // return it.util.i18n("GeneralInfo_realtime_info"); //monitor_Synchronize
        return {
            0: it.util.i18n("GeneralInfo_Realtime_Info"),
            1: 'realtime'
        }
    },

    getContentClass: function() {
        return 'realtimeInfo';
    },

    getContentPanel: function() {
        return this.generalPanle;
    },

    setData: function(data) {
     
    }
});

it.VirtualDeviceRealtimeInfo = $VirtualDeviceRealtimeInfo;