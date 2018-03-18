var $ItvToggleBtn = function() {
    // this.itvToggleBtn = $('.itv-sidebar-tool .itv-toggle-btn');
    this.itvToggleBtn = $('.searchContent .ball');
    this.searPanel = $('#itv-search-panel');
    this.init();
    this.doShowFunction = null;
    this.doHideFunction = null;
    this.isShow = false;
}

mono.extend($ItvToggleBtn, Object, {

    init: function() {
        var self = this;
        this.itvToggleBtn.click(function() {
            if (parseInt(self.searPanel.css('left')) > 0) {
                self.hide();
            } else {
                self.show();
            }
        });
    },

    show: function(para) {
        this.searPanel.animate({
            'left': '60px'
        });
        // this.itvToggleBtn.attr('class', 'itv-toggle-btn itv-toggle-btn-left');
        if (this.doShowFunction) {
            this.doShowFunction(para);
        }
        this.isShow = true;
    },

    showLinkSearch: function() {
        this.searPanel.animate({
            // 'left': '60px'
            'left': '60px'
        });
    },

    hide: function(para, withOutAnimate) {
        if (withOutAnimate) {
            // this.searPanel.css('left','-230px');
            this.searPanel.css('left', '-' + this.getSearchPanelWidth() + 'px');
        } else {
            var self = this;
            this.searPanel.animate({
                // 'left': '-230px'
                'left': '-' + self.getSearchPanelWidth() + 'px'
            });
        }
        // this.itvToggleBtn.attr('class','itv-toggle-btn itv-toggle-btn-right'); //没有拽出来的把手 remark 2016-12-13
        if (this.doHideFunction) {
            this.doHideFunction(para);
        }
        this.isShow = false;
    },

    getSearchPanelWidth: function() {
        return parseInt(this.searPanel.css('width')) || 230;
    },

    hideLinkSearch: function() {

    },

});