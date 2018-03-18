function $ToolbarMgr(sceneManager, name, parent) {
    it.BaseMgr.call(this, sceneManager, name, $('body'))
    this.toolbarMap = {};
}
mono.extend($ToolbarMgr, it.BaseMgr, {
    _getConfig: function () {
        var w = document.body.clientWidth,
            r = 70,
            gap = 10;
        if (w <= 1440) {
            r = 50;
            gap = 5;
        } else if (w > 1440 && w <= 1919) {
            r = 50;
            gap = 5;
        } else if (w > 1919) {
            r = 70;
            gap = 10;
        }
        return {
            r: r,
            gap: gap,
        }
    },
    _init: function () {
        var self = this;
        this.$box.css('right', '0px');
        this.$box.css('bottom', '0px');
        this.initToolbar();
        var conf = this._getConfig(),
            br = conf.r,
            gap = conf.gap;
        this.$box.toolbar({
            bgRadius0: br,
            bgRadius1: 2 * br,
            bgRadius2: 3 * br,
            itRadius0: br + gap,
            itRadius1: 2 * br + gap,
            items0: this.items0,
            items1: this.items1,
            click: function (e, data) {
                console.log(data);
                self.clickHandle(e, data);
            }
        });
        this.$box.hide();
        main.rightToolBar = new it.RightToolBar(this.sceneManager);
    },

    initToolbar: function () {

        //第一视角
        var btnFpsModel = this.btnFpsModel = new it.FPSButton('itv-main', this.sceneManager);
        this.register('fps', btnFpsModel);

        //pdf
        this.register('pdf', new it.OpenFileBar(this.sceneManager));

        //保存镜头
        this.register('saveCamera', new it.SaveCameraBar(this.sceneManager));

        this.register('SystemSetting', new it.SystemSetting());

        //全屏
        this.register('fullScreen', new it.FullScreen());

        //恢复初始状态
        this.register('resetCamera', new it.ResetDialog());

        //隐藏全部窗口 hideAll
        //FIXME 等待后续功能
    },

    sceneChangeHandler: function (e) {
        if (e.kind != 'changeScene') return;
        //只有在floor时，让network有单击事件
        if(e.data && (e.data.getId() == 'floor')){
            main.sceneManager.viewManager3d.enableClick = true;
        }else{
            main.sceneManager.viewManager3d.enableClick = false;
        }
        var rootData = e.rootData;
        var oldScene = e.oldData;
        var oldSceneCategoryId;
        if (oldScene) {
            oldSceneCategoryId = oldScene.getCategoryId();
        };
        if (!rootData) return;
        var scene = e.data;
        var sceneCategoryId = scene.getCategoryId();
        if (main.noshow && sceneCategoryId == 'dataCenter') {
            this.hide();
            return;
        }
        if (sceneCategoryId == 'dataCenter' || sceneCategoryId == 'floor') {
            if (oldSceneCategoryId == 'earth') { //单独处理从地球到园区
                //this.hide();
                return;
            }
            this.show();
        } else {
            this.hide();
        }
    },
    afterLookAtHandler: function (node) {
        //这里要注意，切换是，如果隐藏，要立即隐藏，如果是显示则要等到场景切换完毕再显示。
        var scene = main.sceneManager._currentScene;
        if (!scene) {
            return;
        };
        var sceneCategoryId = scene.getCategoryId();

        var data = main.sceneManager.getNodeData(node);
        var dt = main.sceneManager.dataManager.getDataTypeForData(data);
        var categoryId = dt.getCategoryId();
        if (sceneCategoryId == 'dataCenter' || sceneCategoryId == 'floor') {
            // remark 2017-11-16 需要全部打开，否则像pdf演示这种，镜头到了机柜和设备层面时没法关闭了。要控制的话粒度应该更细，让第一人称视角不可点击
            // if (sceneCategoryId == 'floor' && categoryId != 'floor' && categoryId != 'room') {
            //     this.hide();
            // } else {
            //     //this.show();
            // }
        } else {
            this.hide();
        }
    },
    afterLookFinishedAtHandler: function (node) {
        //这里要注意，切换是，如果隐藏，要立即隐藏，如果是显示则要等到场景切换完毕再显示。
        var scene = main.sceneManager._currentScene;
        if (!scene) {
            return;
        }
        var sceneCategoryId = scene.getCategoryId();

        var data = main.sceneManager.getNodeData(node);
        var dt = main.sceneManager.dataManager.getDataTypeForData(data);
        var categoryId = dt.getCategoryId();
        if (sceneCategoryId == 'dataCenter' || sceneCategoryId == 'floor') {
            // remark 2017-11-16 需要全部打开，否则像pdf演示这种，镜头到了机柜和设备层面时没法关闭了。要控制的话粒度应该更细，让第一人称视角不可点击
            this.show();
            // if (sceneCategoryId == 'floor' && categoryId != 'floor' && categoryId != 'room') {
            //     // this.hide();
            // } else {
            //     this.show();
            // }
        } else {
            // this.hide();
        }
    },
    clickHandle(e, data) {
        console.log(e, data);
        var id = data.id;
        if (id == 'hideAll') {
            if (data.selected) {
                $('.view-control').hide();
                $('#hideAll').attr('title', it.util.i18n("ToolbarMgr_Display_All"));
            } else {
                $('.view-control').show();
                $('#hideAll').attr('title', it.util.i18n("ToolbarMgr_Hide_All"));
            }
        }
        if (id == 'pdf') {
            if ($('#pdf').hasClass('selected')) {
                if ($('#pdf_panel').length == 0) {
                    $('<div id="pdf_panel" title="' + it.util.i18n("PDF_Manager_Select_PDF") + '"></div>').appendTo($('body'));
                    $('#pdf_panel').pdfPane({
                        inputPane: $('#pdf_panel'),
                        width: 290,
                        close: function () {
                            $('#pdf_panel').dialog('close');
                        }
                    });
                    $('#pdf_panel').dialog({ //创建dialog弹窗
                        blackStyle: true,
                        width: 'auto',
                        height: 'auto',
                        //title: it.util.i18n("ClientAlarmManager_Alarm_list"),
                        autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
                        show: '', //显示弹窗出现的效果，slide为滑动效果
                        hide: '', //显示窗口消失的效果，explode为爆炸效果
                        resizable: false, //设置是否可拉动弹窗的大小，默认为true
                        //position: [30, 70],
                        modal: false, //是否有遮罩模型
                        // buttons: {  //定义按钮
                        //     '确认': function () {
                        //         $(this).dialog('close');
                        //     }
                        // },
                    });
                    $('#pdf_panel').parent().find('.ui-dialog-titlebar-close').on('click', function (e) {
                        e.preventDefault();
                        main.panelMgr.instanceMap.ToolbarMgr.$box.toolbar('clickToolbarIcon', 'pdf');
                    });
                    $('#pdf_panel').dialog('open');
                } else {
                    $('#pdf_panel').dialog('open');
                }
            } else {
                $('#pdf_panel').dialog('close');
            }
            var dw = $(document).width();
            var sw = $('.legend-box').width();
            if ($('#pdf_panel').attr('isOpenPdfView')) {
                $('#pdf_panel').pdfPane('closeViewer').attr('isOpenPdfView', '');
                main.panelMgr.instanceMap.NavBarMgr.$box.css({
                    'left': '50%',
                  })
                $('.infoPanel').css('right', 0);
                main.panelMgr.instanceMap.ToolbarMgr.$box.css('right', 0);
                $('.animate-controller').css({
                    'margin-left': '48%'
                });
                $('.legend-box').css('left', (dw - sw) / 2 + 'px');
                $('.legend-box').css('top', '30px');

                var attr1 = $('.warningInfoDetail').css('display'),
                    attr2 = $('.assetInfo-content').css('display'),
                    width1 = 0;
                if (attr1 == 'none' && attr2 !='none') {
                    width1 = $('.assetInfo-content').width();
                }else if(attr1 == 'none' && attr2 == 'none') {
                    width1 = 0;
                }else if(attr1 != 'none'){
                    width1 = $('.warningInfoDetail').width();
                }

                $('.floor-box').css({
                    'right': width1+10
                });   
            }else{
                $('.legend-box').css('left', (dw - sw) / 4 + 'px');
                $('.legend-box').css('top', '80px');
            }

        }
        if (!this.toolbarMap[id]) return;
        var toolbar = this.toolbarMap[id];
        if (toolbar.action) {
            toolbar.action();
            return;
        }
        toolbar.button.click();
    },
    register: function (name, tool) {
        this.toolbarMap[name] = tool;
    },
    items0: [{
            id: 'saveCamera', //名称，唯一编号
            name: it.util.i18n("ToolbarMgr_Save_Camera"), //name 提示信息
            class: 'icon-eye-circle', //样式
            stateless: true,
        },
        {
            id: 'SystemSetting',
            name: it.util.i18n("ToolbarMgr_SystemSetting"),
            class: 'icon-set',
            stateless: true,
        },
        {
            id: 'resetCamera', //名称，唯一编号
            name: it.util.i18n("ToolbarMgr_Reset"), //name 提示信息
            class: 'icon-refresh', //样式
            stateless: true,
        }
    ],
    items1: [{
            id: 'fps', //名称，唯一编号
            name: it.util.i18n("ToolbarMgr_First_Perspective"), //name 提示信息
            class: 'icon-eye-rectangle', //样式
        },
        {
            id: 'pdf', //名称，唯一编号
            name: it.util.i18n("ToolbarMgr_PDF"), //name 提示信息
            class: 'icon-file-pdf', //样式
        },
        {
            id: 'fullScreen', //名称，唯一编号
            name: it.util.i18n("ToolbarMgr_Full_Screen"), //name 提示信息
            class: 'icon-full-screen', //样式
        },

        {
            id: 'hideAll', //名称，唯一编号
            name: it.util.i18n("ToolbarMgr_Hide_All"), //name 提示信息
            class: 'icon-eye-slash', //样式
        }
    ],
})
it.ToolbarMgr = $ToolbarMgr;