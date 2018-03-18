
/**
 * 右键菜单
 * @constructor
 */
it.RightClickMenu = function (sceneManager) {
    this.sceneManager = sceneManager;
    if (!sceneManager) {
        console.log('sceneManager is null!');
    }
    this.defaultEventHandler = main.sceneManager.viewManager3d.getDefaultEventHandler();
    this.mainPane = $('<div class="property-menu"></div>');//<div class="property-menu-inner1"></div><div class="property-menu-inner2"></div><div class="property-menu-inner3"></div>
    document.body.appendChild(this.mainPane[0]);
    this.mainPane.hide();
};

mono.extend(it.RightClickMenu, Object, {

    init: function () {
        var self = this;
        window.addEventListener('mouseup', function (e) {
            if (e.target.className == 'it-all-realtime' || (e.target.children[0] && e.target.children[0].className == 'it-all-realtime')) {
                main.navBarManager.appManager.reset(true, true);
            }
            if (e.button == 2) {
                e.preventDefault();
                var firstClickObject = it.Util.findFirstObjectByMouse(self.sceneManager.network3d, e, null);
                if (firstClickObject && firstClickObject.element) {
                    var clickElement = firstClickObject.element;
                    //                    if(clickElement.rackNode){
                    //                        self.show(clickElement.rackNode,e);
                    //                    }else{
                    self.show(clickElement, e);
                    //                    }
                }
            } else {
                self.hide();
            }
        });
        window.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        });
    },

    isOneElementModel: function (element) {
        if (!element) return false;
        if (this.isMainObj(element)) {
            var children = element.getChildren();
            if (!children || children.length < 1) {
                return true;
            }
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (child && !(child instanceof mono.Billboard)) {
                    return false;
                }
            }
            return true;
        }
        return false;
    },

    isMainObj: function (element) {
        var flag = element.getClient('mainVisible');
        if (Utils.isNotNull(flag)) {
            return !flag;
        }
        return false;
    },

    /**
     * 根据按钮的数量来创建按钮，并计算按钮所在的位置
     * @param text
     * @param className
     * @param count 表示总共有几个按钮
     * @param index 表示的是排在第几个
     * @param clickFunction
     */
    createTagBtn: function (item, element) {
        var self = this;
        var button = $('<div class="property-menu-inner"></div>');
        if (item === "rotate") {
            button.css("background-image", "url('./css/images/right_menu_rotate.svg')");
            button.click(function () {
                self.hide();
                var nodeData = main.sceneManager.getNodeData(element);
                var mainNode = main.sceneManager.getNodeByDataOrId(nodeData);
                var callback = function () {
                    self.defaultEventHandler.rotateElement(mainNode);
                };
                self.defaultEventHandler.lookAt(mainNode, callback);
            });
            this.mainPane.append(button);
        } else if (item === "showLink") {
            var showIcon = false;
            var data = main.sceneManager.getNodeData(element);
            if (data) {
                var links = data.getAllLinks();
                var id = data.getId();
                for(var linkId in links) {
                    if (links[linkId].getToId() == id) {
                        showIcon = true;
                    }
                }
            }
            if (showIcon) {
                button.css("background-image", "url('./css/images/right_menu_link.svg')");
                button.click(function () {
                    self.hide();
                    // var callback = function(){
                    // self.sceneManager.gcsManager.showLinksByData(data,true);
                    // }
                    // self.defaultEventHandler.lookAt(element,callback);
                    if (!data) {
                        return
                    };
                    // 如果没有link就直接lookAt即可
                    var hasLinks = false;
                    for (var id in links) {
                        if (id && links[id]) {
                            hasLinks = true;
                        }
                    }
                    if (hasLinks) {
                        self.sceneManager.viewManager3d.setFocusNode(element);
                        self.sceneManager.gcsManager.showMulLinkByData(data, true);
                    } else {
                        self.defaultEventHandler.lookAt(element);
                    }
                });
                this.mainPane.append(button);
            }
        } else if (item === "detail") {
            button.css("background-image", "url('./css/images/right_menu_detail.svg')");
            button.click(function () {
                self.hide();
                var nodeData = main.sceneManager.getNodeData(element);
                main.proDialog.propertyManager.show(nodeData);
            });
            this.mainPane.append(button);
        } else if (item === 'panel') {
            button.css("background-image", "url('./css/images/right_menu_panel.svg')");
            button.click(function () {
                self.hide();
                var nodeData = main.sceneManager.getNodeData(element);
                main.nodeEventHander.serverPanel.showServerPanel(nodeData);
            });
            this.mainPane.append(button);
        } else if (item === 'realtime') {
            button.css("background-image", "url('./css/images/right_menu_panel.svg')");
            button.click(function () {
                self.hide();
                var data = main.sceneManager.getNodeData(element);
                var id = data.getId();

                it.ViewTemplateManager.showView(id, function (view) {
                    var $content = $('#realTimeContent');
                    if (!$content.length) {
                        $content = $('<div id="realTimeContent"></div>');
                        $(document.body).append($content);
                    }
                    $content.empty();
                    $content.append(view);
                    layer.open({
                        shade: 0,
                        type: 1,
                        title: it.util.i18n("RightClickMenu_Realtime_data"),
                        // area: ['600px', '400px'],
                        // resize: true,    
                        shade: false,
                        maxmin: true, //允许全屏最小化
                        skin: 'layui-layer-rim', //加上边框 layui-layer-rim
                        // area: ['300px', '100px'], //宽高
                        content: $content,
                        success: function (layero, index) {
                            var $layero = $(layero)
                            $layero.css({
                                minWidth: '400px',
                                minHeigth: '200px',
                                left: (parseInt($layero.css('left')) - 200) + 'px'
                            });
                            main.RealtimeDynamicEnviroManager.monitorAssetData(id);
                        },
                        end: function () {
                            it.ViewTemplateManager.hideView(data.getId());
                        }
                    });
                });
            });
            this.mainPane.append(button);
        };
    },

    /**
     * 暂时只添加两个按钮，一个是详细，一个是旋转
     *
     */
    addButtons: function (element) {
        if (!element) return;
        var data = this.sceneManager.getNodeData(element);
        if (!data) return;
        var category = this.sceneManager.dataManager.getCategoryForData(data);
        if (!category) return;
        var items = this.sceneManager.dataManager.categoryItemMap[category.getId()];
        if (!items || items.length < 1) {
            return;
        }
        var count = items.length;
        this.mainPane.css('width', 43 * count);
        // var count = 3;
        var i;
        for (i = 0; i < count; i++) {
            var item = items[i];
            this.createTagBtn(item, element);
        }
    },

    hide: function () {
        this.mainPane.hide();
    },

    show: function (element, e) {
        this.mainPane.children('span').remove();
        this.hide();
        if (element instanceof mono.Billboard) {
            return;
        }
        // 应该是将Element的中心点装换成2D的那个点为基准
        var offset_w = parseInt(this.mainPane.css('width'));
        var offset_h = parseInt(this.mainPane.css('height'));
        this.mainPane.css("top", e.y - offset_h / 2);
        this.mainPane.css('left', e.x - offset_w / 2);
        this.mainPane.show();
        var buttons = $('.property-menu-inner');
        buttons.remove();
        this.addButtons(element);
    },



});