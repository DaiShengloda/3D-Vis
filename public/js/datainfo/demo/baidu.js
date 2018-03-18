var $Baidu = function(sceneManager) {
    $BaseServerTab.call(this, sceneManager);
    this.sceneManager = sceneManager;
    // this.generalPanle = $('.baseInfoTab');
    this.generalPanle = $('<div class="baidu"></div>');
    this.columnInfos = null;
    this.init();
};

mono.extend($Baidu, $BaseServerTab, {

    init: function() {
        if (!this.generalPanle || this.generalPanle.length < 1) {
            this.generalPanle = $('<div class="baidu"></div');
        }
        var baiduIframe = $('<iframe width=887 height=471 src=https://www.baidu.com/ frameborder=0></iframe>').appendTo(this.generalPanle);
    },

    getTitle: function() {
        return '百度'; //monitor_Synchronize
    },

    getContentClass: function() {
        return 'baiduPanel';
    },

    getContentPanel: function() {
        return this.generalPanle;
    },
});

it.Baidu = $Baidu;