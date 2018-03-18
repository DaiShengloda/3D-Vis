var $BaseServerTab = function (sceneManager) {
    this.sceneManager = sceneManager;
};

mono.extend($BaseServerTab, Object, {

    // getContentHeader :  function(){
    // 	return 'Header';
    // },
    showScene: 'rack, equipment',
    isShowFlag: true,

    getTitle: function () {
        return 'Base Info';
    },

    getContentClass: function () {
        return '';
    },

    isShow: function (data) {
        return this.isShowFlag;
    },

    setData: function (data) {

    },

    getContentPanel: function () {
        return null;
    },

    afterShow: function () {

    },

    resize: function () {

    },

    getValue: function (indicate, callback) {
        var data = {
            // ip: this.app.ip,
            // type: this.app.type,
            // version: this.app.version,
            // community: this.app.community,
            indicate: indicate
        };
        ServerUtil.api('info', 'getValue', data, callback)
    },

});