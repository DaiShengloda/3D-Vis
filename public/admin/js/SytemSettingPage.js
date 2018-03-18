//后端系统设置界面功能
function SytemSettingPage(data, parent) {
    this._parent = parent;
    this.configApps = {};
    this.currentErrorMessage = '';
};

mono.extend(SytemSettingPage, Object, {

    init: function() {
		this.view = $('<div id="configPage"></div>').appendTo(this._parent);
        this.page1 = this.initPage(this.view,'Setting_Basic_Config','firstPage');
        this.page2 = this.initPage(this.view,'Setting_Asset_Config');
        this.page3 = this.initPage(this.view,'Setting_Load_Config');
        this.page4 = this.initPage(this.view,'Setting_Other_Config');

        this.btnBox = $('<div id="btnBox"></div>').appendTo(this._parent);
        this.defBtn = this.initBtn(this.btnBox,'defaultValue');
        this.subBtn = this.initBtn(this.btnBox,'Setting_Sure');
        //this.calBtn = this.initBtn(this.btnBox,'Setting_Cancel');
        
        this.register(new $GeneralConfigApp(this.page1));
        this.register(new $TemperatureAndHumidityConfigPanel(this.page1));
        this.register(new $UColorSettingPanel(this.page1));
        this.register(new $TempField(this.page1));
        this.register(new $AssetManageImg(this.page2));
        this.register(new $AssetFilter(this.page2));
        this.register(new $UnVirtualCategoryForFocus(this.page2));
        this.register(new $LoadConfig(this.page3));
        this.register(new $BackgroundColor(this.page4));
        this.register(new $AddEarthTitle(this.page4));
        this.register(new $AssetStatistics(this.page4));
        this.loadConfigData();
        this.clickHandler();
    },

    initPage: function(parent,title,className) {
        var page = $('<div class="page"></div>').appendTo(parent);
        page.addClass(className);
        var pageTitle = $('<h1 class="pageTitle">' + it.util.i18n(title) + '</h1>').appendTo(page);
        return page;
    },

    initBtn: function(parent,title) { 
        var btn = $('<button class="btn btn-default sysBtn">' + it.util.i18n(title) + '</button>').appendTo(parent);
        return btn;
    },

    createPage: function() {
        for(var id in this.configApps) {
            var app = this.configApps[id]
            if (app) {
                app.initConfigPanel();
            }
        };
    },

    loadConfigData: function() {
        var self = this;
        var url = pageConfig.urlPrex+"/api/config/find";
        var data = {};
        $.ajax({
            type: "post",
            contentType: 'application/json; charset=UTF-8',
            url: url,
            data: JSON.stringify(data),
            success: function (result) {
                if(result.value){
                    main.systemConfig = result.value[0];
                    self.createPage();
                }
            }
        });
    },

    register: function(configApp) {
        if (configApp) {
            this.configApps[configApp.getId()] = configApp;
        }
    },

    deRegister: function(configApp) {
        if (configApp) {
            delete configApps[configApp.getId()];
        };
    },

    isConfirmed: function() {
        var self = this,
            changed = true;
        Object.keys(this.configApps).forEach(function(key) {
            var app = self.configApps[key];
            if (!app.isConfirm()) {
                changed = false;
                self.currentErrorMessage = app.errorMessage||'';
                return changed;
            }
        });
        return changed;
    },

    isConfigChanged: function() {
        var self = this,
            changed = false;
        Object.keys(this.configApps).forEach(function(key) {
            var app = self.configApps[key];
            if (app.isConfigChanged()) {
                changed = true;
            }
        });
        return changed;
    },

    clickHandler: function() {
        var self = this;
        this.subBtn.click(function() {
            if (!self.isConfirmed()) {
                 // show 
                layer.open({
                    content: self.currentErrorMessage||it.util.i18n('SytemSettingPage_errorMessage_general')
                });
                return;
            }
            for (var id in self.configApps) {
                var configApp = self.configApps[id];
                if (configApp) {
                    configApp.clickForConfirm();
                    if (id == 'TempAndHumConfigApp') {
                        $('#more_config_temp').hide();
                        $('#more_config_hum').hide();
                    }
                }
            };
            layer.open({
                content: it.util.i18n('LoadConfig_Save_success')
            });
        });

        // this.calBtn.click(function() {
        //     if (self.isConfigChanged()) {
        //         alertUtil.confirm({
        //             message: it.util.i18n("Setting_System_setting_1"),
        //             callback: function(b) {
        //                 b && self.sysConfigDialog.dialog('close');
        //                 self.configApps['AssetManageImg'].clickForCancel();
        //             }
        //         });
        //     } else {
        //         //
        //     }
        // });

        this.defBtn.click(function() {
            for (var id in self.configApps) {
                var configApp = self.configApps[id];
                if (configApp) {
                    configApp.clickForSetDefaultValue();
                    if (id == 'TempAndHumConfigApp') {
                        $('#more_config_temp').hide();
                        $('#more_config_hum').hide();
                    }
                }
            };
            layer.open({
                content: it.util.i18n('LoadConfig_Save_success')
            });
        });
    },

});