var $VirtualDeviceRealtimeExtendInfo = function(sceneManager) {
    $BaseServerTab.call(this, sceneManager);
    this.sceneManager = sceneManager;
    this.generalPanle = $('<div class="realtimeExtendTab bt-scroll"></div>');
    this.columnInfos = null;
    this.init();

};

mono.extend($VirtualDeviceRealtimeExtendInfo, $BaseVirtualDeviceTab, {

    init: function() {
        if (!this.generalPanle || this.generalPanle.length < 1) {
            this.generalPanle = $('<div class="realtimeExtendTab"></div');
        }
    },

    getTitle: function() {
        // return it.util.i18n("GeneralInfo_realtimeExtend_info"); //monitor_Synchronize
        return {
            0: it.util.i18n("GeneralInfo_RealtimeExtend_Info"),
            1: 'realtimeExt'
        }
    },

    getContentClass: function() {
        return 'realtimeExtendInfo';
    },

    getContentPanel: function() {
        return this.generalPanle;
    },

    setData: function(data) {
     
    }
});

it.VirtualDeviceRealtimeExtendInfo = $VirtualDeviceRealtimeExtendInfo;