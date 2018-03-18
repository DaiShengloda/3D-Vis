var $VirtualDeviceTab = function(sceneManager) {
    this.sceneManager = sceneManager;
    this.mainPanel = null;
    this.containPanel = null;
    this.ul = null;
    this.tabApps = [];
    this.init();
}

mono.extend($VirtualDeviceTab, Object, {

    init: function() {
        this.mainPanel = $('<div id="virtualDeviceTab" class="virtualDeviceTab" title="'+it.util.i18n("VirtualDeviceManager_Info")+'" style="min-height:300px;max-heigth:500px;"></div>');
        this.ul = $('<ul></ul>');
        var self = this;
        this.mainPanel.dialog({
            appendTo: ".dialog-box",
            blackStyle: true,
            resize: false,
            height: 'auto',
            width: 'auto',
            closeOnEscape: false,
            show: false,
            hide: false,
            autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
            resizable: false, //设置是否可拉动弹窗的大小，默认为true
            modal: true, //是否有遮罩模型
            buttons: [],
            close: function(event, ui) {
                //当关闭dialog时取消实时数据的订阅，删除view
                var data = self.clickVirtualDevice;
                it.ViewTemplateManager.hideView(data.getId(), undefined, undefined, false);                
            }
        });

    },

    resetTabsContainPanel: function() {
        this.mainPanel.empty();
        this.containPanel = $('<div id="tabs"></div>');
        this.mainPanel.append(this.containPanel);
        this.ul.empty();
        if (this.ul.children.length > 1) {
            this.containPanel.append(this.ul);
        }
    },

    createTabTitle: function(title, index) {   
        var titleName, className;
        title = title || '';
        if(title) {
            titleName = title[0];
            className = title[1]
        }
        if (index == null || index == undefined) {
            index = 0;
        }
        var li = $('<li class=' +className+ '><a href="#tabs-' + index + '">' + titleName + '</a></li>');
        return li;
    },

    createTabContentPanel: function(className, index) {
        className = className || '';
        if (index == null || index == undefined) {
            index = 0;
        }
        var tabContent = $('<div id="tabs-' + index + '" class="' + className + '" style="min-height:200px;"></div>');
        return tabContent;
    },

    clearRegister: function() {
        this.tabApps = [];
    },

    register: function(tabApp) {
        if (!tabApp || !(tabApp instanceof $BaseVirtualDeviceTab)) { //tabApp 一定要继承于BaseServerTab
            return;
        }
        this.tabApps.push(tabApp);
    },

    deRegister: function(tabApp) {
        var index = this.tabApps.indexOf(tabApp);
        if (index !== -1) {
            this.tabApps.splice(index, 1);
        }
    },

    /**
     * 处理自定义，或install完注册的tab后
     * 
     */
    doCustomTab: function(data, lastIndex) {

    },

    /**
     * 根据tabApp创建一个tab，并加到tab的panel中
     */
    appendOneTab: function(tabApp, index) {
        var li = this.createTabTitle(tabApp.getTitle(), index);
        var tabContent = this.createTabContentPanel(tabApp.getContentClass(), index);
        var tabAppContentPanel = tabApp.getContentPanel();
        tabContent.append(tabAppContentPanel);
        this.ul.append(li);
        this.containPanel.append(tabContent);
    },

    showVirtualDeviceTab: function(data) {
        this.clickVirtualDevice = data;
        var self = this;
        this.resetTabsContainPanel();
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
        this.mainPanel.dialog('open');
        for (var i = 0; i < this.tabApps.length; i++) {
            var tabApp = this.tabApps[i];
            if (tabApp.isShow(data)) {
                tabApp.afterShow();
            }
        };
        this.containPanel.tabs({
            activate: function(event, ui) {
                for (var i = 0; i < self.tabApps.length; i++) {
                    var tabApp = self.tabApps[i];
                    var className = tabApp.getContentClass();
                    if (className && ui.newPanel.hasClass(className)) {
                        if (tabApp.isShow(data)) {
                            tabApp.resize();
                        }
                    };
                }
            }
        });
        setTimeout(function() {
            self.containPanel.tabs({ active: 0 });
        }, 0);

    }


});