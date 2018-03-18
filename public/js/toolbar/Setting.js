/**
 * 系统设置
 */
var $Setting = function(parentId) {
    it.ToolBarButton.call(this);
    this.parent = $('#' + parentId || '');
    this.itemsContent = null;
    this.sysConfigDialog = $('<div id="systemConfigDialog" style = "display: none"></div>');
    this.sysConfigDialogPage1 = $('<div id="sysConfigDialogPage1"></div>');
    this.sysConfigDialogPage2 = $('<div id="sysConfigDialogPage2"></div>');
    this.sysConfigDialog.append(this.sysConfigDialogPage1);
    this.sysConfigDialog.append(this.sysConfigDialogPage2);
    this.configApps = {};
    this.currentErrorMessage = '';
    this.init();
};

mono.extend($Setting, it.ToolBarButton, {

    init: function() {
        this.container = $('#container');
        this.container.append(this.sysConfigDialog);
        this.register(new $GeneralConfigApp(this.sysConfigDialogPage1));
        this.register(new $TemperatureAndHumidityConfigPanel(this.sysConfigDialogPage1));
        this.register(new $UColorSettingPanel(this.sysConfigDialogPage1));
        this.register(new $AddEarthTitle(this.sysConfigDialogPage1));
        this.register(new $AssetManageImg(this.sysConfigDialogPage2));
        this.register(new $AssetFilter(this.sysConfigDialogPage2));
        this.register(new $UnVirtualCategoryForFocus(this.sysConfigDialogPage2));
        var self = this;
        this.button.click(function() {
            self.clickFunction();
        });

        this.initConfigDialog();

        var btnBox=$('<div id="btnBox" style="width:auto;position:absolute;top:-1px;right:1px;margin-right:100%;font-size:16px;text-align:center;background-color:#fff;border-radius:4px;border-right:0px;border:1px solid #ccc;vertical-align:middle;line-height:20px;"></div>'),
            btn1=$('<div style="cursor:pointer;padding-top:5px;padding-bottom:5px;padding-left:5px;padding-right:5px;">'+it.util.i18n("Setting_Basic_Config")+'</div>'),
            btn2=$('<div style="cursor:pointer;border-top:1px solid #ccc;padding-top:5px;padding-bottom:5px;padding-left:5px;padding-right:5px;">'+it.util.i18n("Setting_Asset_Config")+'</div>');
        btnBox.append(btn1);
        btnBox.append(btn2);

        this.sysConfigDialog.parent().prepend(btnBox);
        this.sysConfigDialog.parent().css({
            "overflow-x":"visible",
            "overflow-y":"visible"
        });

        btn1.click(function(){
            $('#sysConfigDialogPage1').show();
            $('#sysConfigDialogPage2').hide();
        });
        btn2.click(function(){
            $('#sysConfigDialogPage2').show();
            $('#sysConfigDialogPage1').hide();
        });
    },

    getClass: function() {
        return 'setting-menu-image';
    },

    getTooltip: function() {
        return it.util.i18n("Setting_System_setting");
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

    /*
	setData : function(){
        var self = this;
		this.cleanAll();
		var showPropertyDialog = localStorage.showPropertyDialog;
		if (showPropertyDialog == null || showPropertyDialog == undefined || showPropertyDialog == 'true') {
			showPropertyDialog = true;
		}
		this.addItemWithCheckbox('showPropertyDialog','显示属性框',showPropertyDialog==true,function(checked){
			localStorage.showPropertyDialog = (checked == true);
            var propertyManager = main.proDialog.propertyManager;
            var focusNode = main.sceneManager.viewManager3d.getFocusNode();
            var data = propertyManager.getContentByNode(focusNode);
            if(data && data.length > 0 && propertyManager.isShow(data)){
                var title = propertyManager.getTitleByNode(focusNode);
                var offset = propertyManager.getOffset(focusNode);
                propertyManager.propertyPane.show({items:data},focusNode,title,offset);
            }else{
                propertyManager.propertyPane.hide();
            }
		});
        this.addItemWithNothing('showTempAndHumidityConfig','设置温/湿度样式',function(){
            self.thConfigDialog.showConfigDialog();
        });
	},
    */

    cleanAll: function() {
        this.lastGroupPane = null;
        this.itemsContent.empty();
    },

    showItems: function() {
        this.itemsContent.show('normal');
    },

    hiddenItems: function() {
        this.itemsContent.hide('normal');
    },

    show: function() {
        this.isShowFlag = true;
        // this.setData();
        // this.showItems();
        this.sysConfigDialog.dialog('open');
        for (var id in this.configApps) {
            var configApp = this.configApps[id];
            if (configApp) {
                configApp.setData();
            }
        }

        $('#sysConfigDialogPage1').show();
        $('#sysConfigDialogPage2').hide();
    },

    hide: function() {
        // this.isShowFlag = false;
        // this.hiddenItems();
    },

    clickFunction: function() {
        // if (this.isShowFlag) {
        // 	this.hide();
        // } else {
        this.show();
        // }
        // this.sysConfigDialog.dialog('open');
        // for(var id in this.configApps){
        //     var configApp = this.configApps[id];
        //     if (configApp) {
        //         configApp.setData();
        //     }
        // }
    },

    initConfigDialog: function() {
        // this.initTemperatureBox();
        // this.initHumidityBox();
        for (var id in this.configApps) {
            var configApp = this.configApps[id];
            if (configApp) {
                configApp.initConfigPanel();
            }
        }
        var self = this;
        // var alarmConfigDialog = $('#alarmConfigDialog');
        this.sysConfigDialog.dialog({ //创建dialog弹窗
            blackStyle: true,
            width: 500,
            minHeight: 300,
            maxHeight:600,
            title: it.util.i18n("Setting_System_setting"),
            closeOnEscape: false,
            autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
            show: '', //显示弹窗出现的效果，slide为滑动效果
            hide: '', //显示窗口消失的效果，explode为爆炸效果
            resizable: false, //设置是否可拉动弹窗的大小，默认为true
            modal: true, //是否有遮罩模型
            open: function(event) {
                var dialogUI = self.sysConfigDialog.closest('.ui-dialog');
                dialogUI.find('.ui-dialog-titlebar-close').hide();
                dialogUI.find('.ui-dialog-buttonpane .ui-button').css('margin', '3px 3px 3px 5px');
                dialogUI.find('.ui-dialog-buttonpane .ui-button').eq(0).css('margin-right', '20px');
            },
            buttons: [{
                    text: it.util.i18n("Setting_System_default"),
                    click: function() {
                        // self.initConfigDialogValue(null);
                        for (var id in self.configApps) {
                            var configApp = self.configApps[id];
                            if (configApp) {
                                configApp.clickForSetDefaultValue();
                            }
                        }
                    }
                },
                {
                    text: it.util.i18n("Setting_Sure"),
                    click: function() {
                        if (!self.isConfirmed()) {
                            // show 
                            layer.open({
                                content: self.currentErrorMessage||"请正确填写数据"
                            });
                            return;
                        }
                        for (var id in self.configApps) {
                            var configApp = self.configApps[id];
                            if (configApp) {
                                configApp.clickForConfirm();
                            }
                        }
                        self.sysConfigDialog.dialog('close');
                    }
                },
                {
                    text: it.util.i18n("Setting_Cancel"),
                    click: function() {
                        if (self.isConfigChanged()) {
                            alertUtil.confirm({
                                message: it.util.i18n("Setting_System_setting_1"),
                                callback: function(b) {
                                    b && self.sysConfigDialog.dialog('close');
                                    self.configApps['AssetManageImg'].clickForCancel();
                                }
                            });
                        } else {
                            self.sysConfigDialog.dialog('close');
                        }

                    }
                }
            ]
        });
    },
});
it.Setting = $Setting;