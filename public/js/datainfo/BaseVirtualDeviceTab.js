var $BaseVirtualDeviceTab = function(sceneManager) {
    this.sceneManager = sceneManager;
};

mono.extend($BaseVirtualDeviceTab, Object, {

   
    showScene: 'rack, equipment, virtualDevice',
    isShowFlag: true,

    getTitle: function() {
        return 'Base Info';
    },

    getContentClass: function() {
        return '';
    },

    isShow: function(data) {
        return this.isShowFlag;
    },

    setData: function(data) {

    },

    getContentPanel: function() {
        return null;
    },

    afterShow: function() {

    },

    resize: function() {

    },

    getValue: function(indicate, callback) {
        var data = {
            indicate: indicate
        };
        ServerUtil.api('info', 'getValue', data, callback)
    },

});