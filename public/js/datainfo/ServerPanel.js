var $ServerPanel = function (sceneManager) {
    this.sceneManager = sceneManager;
    this.mainPanel = null;
    this.containPanel = null;
    this.ul = null;
    this.tabApps = [];
    this.init();
}

mono.extend($ServerPanel, Object, {

    init: function () {
        this.mainPanel = $('<div id="serverPanel" class="serverPanel"></div>');
        // this.containPanel = $('<div id="tabs"></div>');
        // this.mainPanel.append(this.containPanel);
        this.ul = $('<ul></ul>');
        // this.containPanel.append(this.ul);
        $('#container').append(this.mainPanel);
        var self = this;
        // var w = document.body.clientWidth, nw, nh;
        // if(w<1440){
        //     nw = 900;
        //     nh = 562;
        // } else if(w>=1440 && w<1920){

        //     nw = 900;
        //     nh = 562;
        // } else if(w>=1920){
        //     nw = 1200;
        //     nh = 750
        // }
        this.mainPanel.dialog({
            blackStyle: true,
            resize: false,
            width: 1040,
            height: 595,
            closeOnEscape: true,
            show: { effect: 'move&scale', origin: ["middle", "center"], start: '#equipmentInfo' },
            hide: { effect: 'move&scale', origin: ["middle", "center"], start: '#equipmentInfo' },
            autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
            resizable: false, //设置是否可拉动弹窗的大小，默认为true
            modal: true, //是否有遮罩模型
            // buttons: [{
            //     text: it.util.i18n("ServerPanel_Close"),
            //     click: function() {
            //         self.mainPanel.dialog('close');
            //     }
            // }]
        });
        this.mainPanel.parent().find('.ui-dialog-titlebar-close').on('click', function (e) {
            if ($('#shebeixinxi').length != 0) {
                main.panelMgr.instanceMap.NavBarMgr.$box.nav('clickNavIcon', 'shebeixinxi');
            }
        });
    },

    resetTabsContainPanel: function () {
        this.mainPanel.empty();
        this.containPanel = $('<div id="tabs"></div>');
        //this.mainPanel.append(this.containPanel);
        this.ul.empty();
        this.containPanel.append(this.ul);
    },

    createTabTitle: function (title, index) {
        title = title || '';
        if (index == null || index == undefined) {
            index = 0;
        }
        var li = $('<li><a href="#tabs-' + index + '">' + title + '</a></li>');
        return li;
    },

    createTabContentPanel: function (className, index) {
        className = className || '';
        if (index == null || index == undefined) {
            index = 0;
        }
        var tabContent = $('<div id="tabs-' + index + '" class="' + className + '"></div>');
        return tabContent;
    },

    clearRegister: function () {
        this.tabApps = [];
    },

    register: function (tabApp) {
        if (!tabApp || !(tabApp instanceof $BaseServerTab)) { //tabApp 一定要继承于BaseServerTab
            return;
        }
        this.tabApps.push(tabApp);
    },

    deRegister: function (tabApp) {
        var index = this.tabApps.indexOf(tabApp);
        if (index !== -1) {
            this.tabApps.splice(index, 1);
        }
    },

    /**
     * 处理自定义，或install完注册的tab后
     * 
     */
    doCustomTab: function (data, lastIndex) {

    },

    /**
     * 根据tabApp创建一个tab，并加到tab的panel中
     */
    appendOneTab: function (tabApp, index) {
        var li = this.createTabTitle(tabApp.getTitle(), index);
        var tabContent = this.createTabContentPanel(tabApp.getContentClass(), index);
        var tabAppContentPanel = tabApp.getContentPanel();
        tabContent.append(tabAppContentPanel);
        this.ul.append(li);
        //this.containPanel.append(tabContent);
        this.mainPanel.append(tabContent);
    },

    showServerPanel: function (data) {
        var dm = this.sceneManager.dataManager;
        //获取数据类型
        var dataType = dm.getDataTypeForData(data);
        var title = dataType.getDescription() ? dataType.getDescription() : dataType.getId();
        var self = this;
        this.resetTabsContainPanel();
        // this.mainPanel.empty();
        // this.containPanel = $('<div id="tabs"></div>'); //重新创建
        // this.mainPanel.append(this.containPanel);
        // this.ul.empty();
        // this.containPanel.append(this.ul);
        if (!this.tabApps || this.tabApps.length < 1) {
            return null;
        }
        var index = 0;
        for (index = 0; index < this.tabApps.length; index++) {
            var tabApp = this.tabApps[index];
            if (tabApp.isShow()) {
                tabApp.setData(data);
                this.appendOneTab(tabApp, index);
            }
            break;
        }
        this.doCustomTab(data, index);
        this.mainPanel.dialog('open');
        var dialogTitle = this.mainPanel.prev().find('.ui-dialog-title');
        dialogTitle.html(title);
        //dialogTitle.prepend(titlePane);
        for (var i = 0; i < this.tabApps.length; i++) {
            var tabApp = this.tabApps[i];
            if (tabApp.isShow()) {
                tabApp.afterShow();
            }
            break;
        };
        this.containPanel.tabs({
            activate: function (event, ui) {
                for (var i = 0; i < self.tabApps.length; i++) {
                    var tabApp = self.tabApps[i];
                    var className = tabApp.getContentClass();
                    if (className && ui.newPanel.hasClass(className)) {
                        if (tabApp.isShow()) {
                            tabApp.resize();
                        }
                    };
                }
            }
        });
        setTimeout(function () {
            // $("#tabs").tabs({active: 0});
            self.containPanel.tabs({ active: 0 });
        }, 0);

    }


});