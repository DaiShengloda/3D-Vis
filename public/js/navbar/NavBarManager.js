// model(function) Application
fa = {};

var $NavBarManager = function (sceneManager) {
    this.sceneManager = sceneManager;
    this.toggleBtn = new $ItvToggleBtn();
    this.navBar = $('.itv-navbar-nav') || $('<ul class="itv-navbar-nav"></ul');
    this.itvNavPanel = $('.itv-nav-content');
    this.itvNavContralBar = $('.itv-navbar-nav-contral-border');
    this.btnNav = $('.itv-nav-btn');
    this.itvMain = $('#itv-main');
    this.initProDialog = main.proDialog = new $InitPropertyDialog(main.sceneManager);
    this.breadcrumb = main.breadcrumb = new it.Breadcrumb({ parentDiv: this.itvMain, sceneManager: main.sceneManager });
    // this.appManager = new fa.AppManager(this.sceneManager,this.toggleBtn);
    // this.init(); // 等load完后再init
};

mono.extend($NavBarManager, Object, {

    init: function () {
        var self = this;
        this.appManager = new fa.AppManager(this.sceneManager, this.toggleBtn);
        this.sceneManager.addSceneChangeListener(function () {
            if (dataJson && dataJson.showManuBar !== false) {

                self.loadCustomMenu(function (menu) {
                    dataJson.navBars = dataJson.navBars || [];
                    var navBars = dataJson.navBars.concat(menu);
                    var inspection = navBars.filter(function (item) {
                        return item.id == 'inspection';
                    });
                    if (inspection && inspection.length >= 1) {
                        var subMenu = inspection[0].items;
                        var path = subMenu.filter(function (subItem) {
                            return subItem.id != 'inspection-report';
                        })
                        path.forEach(function (subItem) {
                            var i = subMenu.indexOf(subItem);
                            subMenu.splice(i, 1);
                        })
                        main.inspectionManager.getInspectionMenu(function (pathMenus) {
                            pathMenus.forEach(function (pathMenu) {
                                subMenu.push(pathMenu);
                            })
                            self.initNavBar(navBars);
                        });
                    } else {
                        self.initNavBar(navBars);
                    }

                });
            }
            // self.appManager.reset(true);false,false
            // self.appManager.reset(false,false); //false,false 20161025,
            //场景切换时，应该变，如空间搜索，当切到了园区场景时，就不应该看到空间搜索的玩意儿，但是得做下处理，
            // 如在园区搜索了，进去后搜索的结果不应该消失，但是要注意的是，如果一开始搜索的是it搜索时，那场景切换时就不clear20161103
            // 移到NavBarMgr上
            /*
            var clearItSearch = true;
            if (self.appManager.defaultApp) {
                clearItSearch = !self.appManager.defaultApp.isShow();
            }
            self.appManager.reset(clearItSearch, false);
            self.appManager.defaultApp.showing = true; // reset中无法设置其showing的标准
            self.onresize();
            */
        });
        if (dataJson && dataJson.showManuBar === false) {
            this.itvNavPanel.hide();
            this.itvNavContralBar.hide();
        } else {
            this.itvNavPanel.show();
            this.itvNavContralBar.show();
        }
        if (dataJson.showAlarmTable == true) {
            this.appManager.clientAlarmManager.alarmTable.showTablePane();
            setTimeout(function () {
                self.appManager.showCurrentAlarm();
            }, 2);
        }
        // // 每次playMap时，重新算一下位置，有可能在启动之后改变了(隐藏/显示)header和nav
        // this.sceneManager.afterCreateEarthScene = function (earthScene) {
        //     earthScene.beforePlayMap = function (map, data) {
        //         self.setMapLeftAndTop(map);
        //         // 	self.onresize();
        //     }
        //     // earthScene.afterPlayMap = function(data){
        //     // 		self.onresize();
        //     // }
        // }

        // 每次playMap时，重新算一下位置，有可能在启动之后改变了(隐藏/显示)header和nav
        this.sceneManager.addSceneManagerChangeListener(function (eve) {
            if (eve.kind == 'createDefaultEarthScene'
                && (eve.data instanceof it.DefaultEarthScene)) {
                eve.data.beforePlayMap = function (map, data) {
                    self.setMapLeftAndTop(map);
                    //  self.onresize();
                }
            }
        });

        this.itvNavContralBarOut = true;
        //只有首次进入感应区域, 才显示菜单栏, 菜单栏隐藏后需要离开重新进入
        this.itvNavContralBar.mouseover(function (eve) {
            if (self.itvNavContralBarOut && !this.itvNavPaneShow) {
                if (dataJson && dataJson.showManuBar === false) {
                    self.hideNavBar();
                }else{
                    self.showNavBar();
                }
            }
            self.itvNavContralBarOut = false;

        });
        //鼠标移出, 标记为 true
        this.itvNavContralBar.mouseout(function (eve) {

            if (!self.itvNavPaneShow) {
                self.itvNavContralBarOut = true;
            }
        });
        //鼠标移出, 标记为 true
        this.itvNavPanel.mouseout(function (eve) {

            if (self.itvNavPaneShow) {
                self.itvNavContralBarOut = true;
            }
        });
        //鼠标移出, 标记为 true
        this.itvNavPanel.mouseover(function (eve) {

            if (self.itvNavPaneShow) {
                self.itvNavContralBarOut = false;
            }
        });
        // this.itvNavPanel.mouseout(function(eve){
        // 	self.hideNavBar();
        // });
        this.itvNavPanel.dblclick(function (eve) {
            self.hideNavBar();
            // console.log(eve.type);
            // console.log(eve.button);
        });
        this.addToggleBtnListener();
        this.btnNav.click(function () {
            self.clickBtnNav();
        });

        // 场景变化时，breadcrumb也要跟着变化
        main.sceneManager.addSceneChangeListener(function (eve) {
            self.breadcrumb.setData();
        });

        // main.rightToolBar = new it.RightToolBar(main.sceneManager); // 2018-01-10 Kevin move to
    },

    setMapLeftAndTop: function (map) {
        if (!map) return;
        var top = $('.itv-content').css('top');
        if (!top) {
            top = '60px';
        }
        // var left = $('.itv-main').css('margin-left');
        // if (!left) {
        // 	left = '60px';
        // }
        // map.style.left = left;
        map.style.top = top;
    },

    hideNavBar: function () {
        this.itvNavPaneShow = false;
        this.itvNavPanel.animate({
            'left': '-60px'
        });
        this.toggleBtn.hide({
            doNotAnimateBreadcrumb: true,
            hideNavBar: true
        });
        main.breadcrumb.breadcrumbPane.animate({
            'left': '0px'
        });
    },

    showNavBar: function () {
        if (this.itvNavPaneShow) { // 已经显示了的话
            return;
        }
        this.itvNavPaneShow = true;
        this.itvNavPanel.animate({
            'left': '0px'
        });
        main.breadcrumb.breadcrumbPane.animate({
            'left': '60px'
        });

        if (this.initProDialog.propertyManager) {
            this.initProDialog.propertyManager.propertyPane.propertyPane.animate({
                'left': '60px',
                'bottom': '0px'
            });
        }
    },

    /**
     * 点击后，显示navbar
     */
    clickBtnNav: function () {
        if (this.itvNavPaneShow || this.itvNavPaneShow == true) {
            this.hideNavBar();
        } else {
            this.showNavBar();
        }
    },


    /**
     * 点左侧展开合的按钮
     */
    addToggleBtnListener: function () {
        var self = this;
        //点左侧展开合的按钮
        this.toggleBtn.doShowFunction = function () {
            // var left = parseInt(self.toggleBtn.searPanel.css('left')) + parseInt(self.toggleBtn.searPanel.css('width'));
            // var left = parseInt(self.itvNavPanel.css('left')) + parseInt(self.itvNavPanel.css('width'));
            if (self.initProDialog.propertyManager) {
                self.initProDialog.propertyManager.propertyPane.propertyPane.animate({
                    // 'left': '291px',
                    'left': (self.toggleBtn.getSearchPanelWidth() + 61) + 'px',
                    'bottom': '0px'
                });
            }
            if (main.breadcrumb) {
                main.breadcrumb.breadcrumbPane.animate({
                    // 'left': '290px'
                    'left': (self.toggleBtn.getSearchPanelWidth() + 60) + 'px'
                });
            }
        };

        this.toggleBtn.doHideFunction = function (para) {
            if (self.initProDialog.propertyManager) {
                var left = '60px';
                if (para && para.hideNavBar) {
                    left = '0px';
                }
                self.initProDialog.propertyManager.propertyPane.propertyPane.animate({
                    'left': left,
                    'bottom': '0px'
                });
            }
            if (!para || !para.doNotAnimateBreadcrumb) {
                if (main.breadcrumb) {
                    main.breadcrumb.breadcrumbPane.animate({
                        'left': '60px'
                    });
                }
            }
        };
    },

    /**
     * 设置3D窗口的大小
     * 支持%
     */
    setItvMainSize: function (width, height) {
        // width = parseInt(width);
        // height = parseInt(height);
        if (width) {
            width += '';
            if (width.endsWith('%')) {
                this.itvMain.css('width', width);
            } else if (parseInt(width) > 0) {
                this.itvMain.css('width', parseInt(width) + 'px');
            }
        }
        if (height) {
            height += '';
            if (height.endsWith('%')) {
                this.itvMain.css('height', height);
            } else if (parseInt(height) > 0) {
                this.itvMain.css('height', parseInt(height) + 'px');
            }
        }
        this.onresize();
    },

    /**
     * 手动的触发window的onresize事件，在重新调整adjustbounds时调用
     */
    onresize: function () {
        var e = document.createEvent("Event");
        e.initEvent('resize', true, true);
        window.dispatchEvent(e);
    },

    adjustBounds: function () {
        var self = this;
        var network3d = main.sceneManager.network3d;
        var viewManager2d = main.sceneManager.viewManager2d;
        var fun = function () {
            var height = parseInt(self.itvMain.css('height')),
                width = parseInt(self.itvMain.css('width'));
            if (!height) {
                height = document.documentElement.clientHeight;
                var headerDiv = $('.itv-header');
                var top = 0;
                if (headerDiv && headerDiv.height() > 0) {
                    top = headerDiv.height();
                }
                height = height - top;
            }
            if (!width) {
                width = document.documentElement.clientWidth;
                // var left = parseInt($('.itv-nav-content').css('width'));
                // width = width - left;
            }
            network3d.adjustBounds(width, height);
            viewManager2d.adjustViewBounds(width, height);
            main.sceneManager.adjustCustomSceneViewBounds(width,height);

            //改变搜索面板的高度
            if($('.new-itv-search-panel').css('display') == 'block'){
                main.navBarManager.appManager.appMaps["IT_SEARCH"].appPanel.itSearch('setHeight');
            }else if($('.new-apps-box .new-app-panel').css('display') !='none' && $('.new-apps-box .new-app-panel').css('display') !=undefined){
                var height = it.util.calculateHeight('new-apps-box');
                if(height && height > 15){
                    $('.new-apps-box .new-app-panel #tree-content').height(height-15);
                }
            }

        }
        fun();
        if (window.addEventListener) {
            window.addEventListener('resize', function () {
                fun();
            }, true);
        } else if (window.attachEvent) {
            window.attachEvent('onresize', function () {
                fun();
            });
        } else {
            window.onresize = function () {
                fun();
            };
        }
    },

    // hideSearchPane : function(){
    // 	 $('#itv-search-panel').hide();
    // },

    getItvToggleBtn: function () {
        return this.toggleBtn;
    },

    isCurrentScene: function (sceneId) {
        var currentScene = this.sceneManager.getCurrentScene();
        if (!sceneId || !currentScene) {
            return true;
        }
        var sIds = sceneId.split(',');
        if (sIds && sIds.length > 0) {
            for (var i = 0; i < sIds.length; i++) {
                var sid = sIds[i];
                if (!sid) {
                    continue;
                }
                if (sid.toLowerCase() == 'all') {
                    return true;
                }
                if (sid.toLowerCase() == currentScene.getId().toLowerCase()) {
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * 给div添加click事件。
     * appId优先
     * click可以是function，也可以是string，
     * 如果是function的话，会把该域全进去，所有的应用的方法在this.apps中能找到；
     * 如果是string的话，认为该string是this.apps中的方法
     */
    setClick: function (div, click, appId, paramaters) {
        if (!div || (!click && !appId)) {
            return;
        }
        var scope = this;
        if (appId && this.appManager.isContain(appId)) {
            div.click(function () {
                scope.appManager.doAppById(appId, paramaters);
            });
        } else {
            if (typeof (click) === 'function') {
                div.click(function () {
                    click(scope);
                });
            } else {
                if (this.appManager[click]) {
                    div.click(function () {
                        scope.appManager[click]();
                    });
                }
            }
        }
    },

    initNavBar: function (datas) {
        this.navBar.empty();
        if (!datas || datas.length < 1) {
            return;
        }
        for (var i = 0; i < datas.length; i++) {
            var dropDown = this.createDropdown(datas[i]);
            if (dropDown) {
                this.navBar.append(dropDown);
            }
        }
        return this.navBar;
    },

    /**
     * 创建一个dropDown，就是一个大的功能框
     * {title:'资产',class:'it-all-bg',sceneId:'floor,building||all',id:''
     *  items:[{id:'it-drop-management',name:'资产搜索',class:'mo-management',sceneId:''},
     *         {id:'pace-drop-search',class:'mo-space',name:'空间搜索',sceneId:'floor'},
     *         {id:'deviceoff',class:'mo-management',name:'设备下架',sceneId:'all'}
     *        ]
     * }
     */
    createDropdown: function (obj) {
        if (!obj) {
            return;
        }
        var title = obj.title || '';
        var clazz = obj.class || '';
        var items = obj.items;
        var click = obj.click;
        var appId = obj.appId;
        var paramaters = obj.paramaters;
        var id = obj.id || '';
        var sceneId = obj.sceneId;
        if (!this.isCurrentScene(sceneId)) {
            return;
        }
        var self = this;
        var dropDown = $('<li class="dropdown"></li>');
        var icon = $('<a href="#" class="dropdown-toggle" id = "' + id + '" data-toggle="dropdown" title="' + title + '"><i class="' + clazz + '"></i></a>');
        this.setClick(icon, click, appId, paramaters);
        dropDown.append(icon);
        if (items && items.length > 0) {
            var dropDownMenu = this.createDropdownMenu(items);
            dropDown.append(dropDownMenu);
        }
        return dropDown;
    },

    /**
     * 用于放dropDown里的小的分类
     */
    createDropdownMenu: function (items) {
        if (!items || items.length < 1) {
            return null;
        }
        var menu = $('<ul class="dropdown-menu it-dropdown-menu"></ul>');
        for (var i = 0; i < items.length; i++) {
            var itemDiv = this.createItem(items[i]);
            if (itemDiv) {
                menu.append(itemDiv);
            }
        }
        return menu;
    },

    /**
     * 创建dropDown中的小的item
     * 如：{id:'pace-drop-search',class:'mo-space',name:'空间搜索',sceneId:'floor'}
     */
    createItem: function (item) {
        if (!item) {
            return null;
        }
        var id = item.id || '';
        var clazz = item.class || '';
        var name = item.name || id;
        var sceneId = item.sceneId;
        if (!this.isCurrentScene(sceneId)) {
            return null;
        }
        var click = item.click;
        var appId = item.appId;
        var paramaters = item.paramaters;
        var itemDiv = $('<li><a href="#" id="' + id + '"><i class="' + clazz + '"></i><span>' + name + '</span></a></li>');
        this.setClick(itemDiv, click, appId, paramaters);
        return itemDiv;
    },
    loadCustomMenu: function (callback) {
        var self = this;
        var parentMenu = null;
        it.util.api('custom_menu', 'menus', {}, function (result) {

            // console.log(result);
            var menus = [];
            result.forEach(function (item) {
                if (parentMenu == null || parentMenu.title != item.parentName) {
                    parentMenu = {
                        title: item.parentName,
                        class: 'it-all-open',
                        sceneId: '',
                        items: []
                    }
                    menus.push(parentMenu);
                }
                parentMenu.items.push({
                    id: 'it-all-open-' + item.name,
                    class: 'mo-open',
                    name: item.name,
                    click: function (scope) {
                        var url = item.url;
                        //var data = self.sceneManager.dataManager.getDataById(item.dataId);
                        var node = self.sceneManager.getCurrentRootNode();
                        var data = self.sceneManager.getNodeData(node);
                        url = it.util.format(url, data);
                        open(url);
                    }
                })

            })
            callback && callback(menus);

        })
        //加载菜单

    },

});

it.NavBarManager = $NavBarManager;




