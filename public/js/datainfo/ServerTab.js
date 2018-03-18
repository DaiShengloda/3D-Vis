var $ServerTab = function (sceneManager) {
    this.sceneManager = sceneManager;
    this.mainPanel = null;
    this.containPanel = null;
    this.ul = null;
    this.tabApps = [];
    this.init();
}

mono.extend($ServerTab, Object, {

    init: function () {
        this.mainPanel = $('<div id="serverTab" class="serverTab" title="' + it.util.i18n("GeneralInfo_Asset_Info") + '" style="min-height:100px;max-heigth:400px;"></div>');
        // this.containPanel = $('<div id="tabs"></div>');
        // this.mainPanel.append(this.containPanel);
        this.ul = $('<ul></ul>');
        // this.containPanel.append(this.ul);
        // $('#container').append(this.mainPanel);
        var self = this;
        this.mainPanel.dialog({
            blackStyle: true,
            resize: false,
            width: "auto",
            height: "auto",
            closeOnEscape: true,
            show: { effect: 'move&scale', origin: ["middle", "center"], start: '#basicInfo' },
            hide: { effect: 'move&scale', origin: ["middle", "center"], start: '#basicInfo' },
            autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
            resizable: false, //设置是否可拉动弹窗的大小，默认为true
            modal: false, //是否有遮罩模型
            appendTo: ".dialog-box",
            position: { my: "left center", at: "left center", of: window }, //初始化的位置
            close: function () {
                for (var i = 0; i < self.tabApps.length; i++) {
                    if (self.tabApps[i].needSave) {
                        self.tabApps[i].isSaveLayer();
                    }
                }
                main.panelMgr.instanceMap.NavBarMgr.appManager.appMaps.ServerTab.clear();//关闭数据监控面板
                main.panelMgr.instanceMap.NavBarMgr.$box.nav('clearAndIfClose', true);//关闭数据监控按钮
                return;

            }
        });

        this.mainPanel.parent().find('.ui-dialog-titlebar-close').on('click', function (e) {
            main.panelMgr.instanceMap.NavBarMgr.$box.nav('clickNavIcon', 'jibenxinxi');
        });
    },

    resetTabsContainPanel: function () {
        this.mainPanel.empty();
        this.ul.empty();
        this.containPanel = $('<div id="tabs"></div>');
        this.mainPanel.append(this.containPanel);
        if (this.ul.children.length > 1) {
            this.containPanel.append(this.ul);
        }
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
        this.containPanel.append(tabContent);
    },

    showServerTab: function (data) {
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
            var categoryId = main.sceneManager.dataManager.getCategoryForData(data).getId();
            if (tabApp.showScene == '' || tabApp.showScene.indexOf(categoryId) > -1) {
                tabApp.isShowFlag = true;
            } else {
                tabApp.isShowFlag = false;
            }
            if (tabApp.isShow(data)) {
                tabApp.setData(data);
                this.appendOneTab(tabApp, index);
            }
        }
        this.doCustomTab(data, index);
        for (var i = 0; i < this.tabApps.length; i++) {
            var tabApp = this.tabApps[i];
            if (tabApp.isShow(data)) {
                tabApp.afterShow();
            }
        };
        this.mainPanel.tabs({
            activate: function (event, ui) {
                for (var i = 0; i < self.tabApps.length; i++) {
                    var tabApp = self.tabApps[i];
                    // var className = tabApp.getContentClass();
                    // if (className && ui.newPanel.hasClass(className)) {
                    if (tabApp.isShow(data)) {
                        self.mainPanel.dialog("option", "width", 'auto');
                        self.mainPanel.dialog("option", "height", 'auto');
                        tabApp.resize();
                    }
                    // };
                }
            }
        });
        setTimeout(function () {
            // $("#tabs").tabs({active: 0});
            self.containPanel.tabs({ active: 0 });
            // self.mainPanel.dialog('open');
        }, 0);
        setTimeout(function () {
            // $("#tabs").tabs({active: 0});
            // self.containPanel.tabs({ active: 0 });
            self.mainPanel.dialog('open');
        }, 100);
    }
});