(function ($) {
    var index = 0;
    $.widget("hud.nav", {
        // default options
        options: {
            items: [
                {
                    id: 'search',//名称，唯一编号
                    name: '搜索',//name 提示信息
                    class: 'icon-all',//样式
                },
                {
                    id: 'dev',//名称，唯一编号
                    name: '设备',//name 提示信息
                    class: 'icon-cart',//样式
                },
                {
                    id: ' env',//名称，唯一编号
                    name: '环境',//name 提示信息
                    class: 'icon-comments',//样式
                    items: [
                        {
                            id: 'temp',//名称，唯一编号
                            name: '温度',//name 提示信息
                            class: 'icon-category',//样式
                        },
                        {
                            id: 'hum',//名称，唯一编号
                            name: '湿度',//name 提示信息
                            class: 'icon-comments',//样式
                        },
                        {
                            id: 'water',//名称，唯一编号
                            name: '漏水',//name 提示信息
                            class: 'icon-augmented-reality-',//样式
                        },
                        {
                            id: 'smoke',//名称，唯一编号
                            name: '烟雾',//name 提示信息
                            class: 'icon-shoucang',//样式
                        }
                    ]
                },
                {
                    id: 'setting',//名称，唯一编号
                    name: '设置',//name 提示信息
                    class: 'icon-email',//样式
                    items: [
                        {
                            id: 'temp',//名称，唯一编号
                            name: '温度',//name 提示信息
                            class: 'icon-category',//样式
                        },
                        {
                            id: 'hum',//名称，唯一编号
                            name: '湿度',//name 提示信息
                            class: 'icon-comments',//样式
                        },
                        {
                            id: 'water',//名称，唯一编号
                            name: '漏水',//name 提示信息
                            class: 'icon-augmented-reality-',//样式
                        },
                        {
                            id: 'smoke',//名称，唯一编号
                            name: '烟雾',//name 提示信息
                            class: 'icon-shoucang',//样式
                        }
                    ]
                },
                {
                    id: 'inspect',//名称，唯一编号
                    name: '巡航',//name 提示信息
                    class: 'icon-jigglypuff',//样式
                }
            ],
            defaultClass: '',//默认样式
            selectedClass: '',//选中样式
            selectedId: '',//id 字段值
            selectedIndex: -1,

            // Callbacks
            click: console.log,
            change: null,
            menuSelected: ''
        },
        itemCacheMap: [],//根据 id 字段缓存对应的 element

        // 根据appId所属场景
        getSceneByAppId: function (appId) {
            var items = this.options.items;
            for (var i = 0; i < items.length; i++) {
                if (items[i]['appId']) {
                    if (items[i]['appId'].toLowerCase() == appId.toLowerCase()) {
                        return items[i]['sceneId'];
                    }
                } else {
                    if (items[i]['items']) {
                        var childItems = items[i]['items'];
                        for (var j = 0; j < childItems.length; j++) {
                            if (childItems[j]['appId']) {
                                if (childItems[j]['appId'].toLowerCase() == appId.toLowerCase()) {
                                    return items[i]['sceneId'];
                                }
                            }
                        }
                    }
                }
            }
            return '';
        },

        //获取当前scene任意的app
        getCurSceneRandomApp: function () {
            var self = this;
            var appMaps = [];
            var resApp;
            var items = this.options.items;
            if (!items) return '';
            for (var i = 0; i < items.length; i++) {
                if (items[i]['appId']) {
                    appMaps.push(items[i]['appId']);
                } else {
                    if (items[i]['items']) {
                        var childItems = items[i]['items'];
                        for (var j = 0; j < childItems.length; j++) {
                            if (childItems[j]['appId']) {
                                appMaps.push(childItems[j]['appId']);
                            }
                        }
                    }
                }
            };
            var ranInd = Math.floor(Math.random() * appMaps.length);
            return appMaps[ranInd];
        },

        //通过appId能返回导航栏的id（包括子菜单情况）
        getLiIdByAppId: function (appId) {
            var self = this;
            if (!appId) return;
            var items = this.options.items;
            if (!items) return '';

            //如果是父菜单的，只取id，如果是子菜单的，去子id和父id
            var cId, pId;
            for (var i = 0; i < items.length; i++) {
                if (items[i]['appId']) {
                    if (items[i]['appId'].toLowerCase() == appId.toLowerCase()) {
                        pId = items[i]['id'];
                        return pId;
                    }
                } else {
                    if (items[i]['items']) {
                        var childItems = items[i]['items'];
                        for (var j = 0; j < childItems.length; j++) {
                            if (childItems[j]['appId']) {
                                if (childItems[j]['appId'].toLowerCase() == appId.toLowerCase()) {
                                    pId = items[i]['id'];
                                    cId = childItems[j]['id'];
                                    return {
                                        pId: pId,
                                        cId: cId
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return '';
        },
        _initNavWidth: function () {
            var w = document.body.clientWidth, nw, gap,
                offset, iconR, arcTop;
            if (w <= 1440) {
                nw = 48;
                gap = 15;
                xOffset = 75;
                yOffset = 70;
                arcTop = 10;
                iconR = 80;
            } else if (w > 1440 && w <= 1919) {
                nw = 58;
                gap = 20;
                xOffset = 94;
                yOffset = 75;
                arcTop = 17;
                iconR = 85;
            } else if (w > 1919) {
                nw = 68;
                gap = 30;
                xOffset = 120;
                yOffset = 90;
                arcTop = 43;
                iconR = 100;
            }
            this._navItemW = nw;
            this._navItemGap = gap;
            this._navItemXOffset = xOffset;
            this._navItemYOffset = yOffset;
            this._navItemIconR = iconR;
            this._arcTop = arcTop;

        },
        _calLeft: function (index) {
            return (index + 0) * this._navItemW - this._navItemGap;
        },
        _create: function () {
            var self = this;
            var el = this.element;
            this._initNavWidth();
            el.addClass("nav");
            this._on(this.element, {
                // 控制一级菜单
                "click .nav-icon": function (e, id) {
                    if (self._isAnimate) return;
                    if (!id) {
                        var li = $(e.currentTarget).closest('li');
                        var id = li.attr('id');
                    } else {
                        var li = $('#' + id);
                    }
                    //如果已经选中，跳过后续动作
                    if (li.hasClass('selected')) {
                        li.removeClass('selected');
                        self.$bar.hide();
                        //如果显示二级菜单了，删除二级菜单，并收回间距
                        if (self.isShowMenu) {
                            var item = self.options.items[li.index()];
                            var items = item.items;
                            for (var i = 0; i < items.length; i++) {
                                var tid = items[i].id;
                                if ($('#' + tid).hasClass('selected')) {
                                    self._trigger("unSelected", e, {
                                        id: tid
                                    })
                                }
                            };
                            self._destroyMenu(item);
                            self._isAnimate = true;
                            li.stop().animate({
                                marginLeft: '0px',
                                marginRight: '0px',
                            }, 200, 'swing', function () {
                                self._isAnimate = false;
                            });
                            var isChild1 = function () {
                                for (var i = 0; i < item.items.length; i++) {
                                    if (item.items[i].id == self.options.selectedSmallId) return true;
                                }
                                return false;
                            }
                            self.$cicleBar.hide();
                            if (isChild1()) {
                                self.options.selectedSmallId = null;
                            }
                            if (self.options.selectedOldId && self.options.selectedSmallId == null) {
                                var indexs;
                                indexs = self.options.selectedOldIndex;
                                self._moveBar(indexs);
                                self.$bar.show();
                                self.options.selectedId = self.options.selectedOldId;
                                self.options.selectedOldId = null;
                                self.options.selectedOldLi.addClass('selected');
                                self.options.selectedOldLi = null;
                                return;
                            }
                        }
                        self.options.selectedId = null;
                        self._trigger("unSelected", e, {
                            id: id
                        })
                        return;
                    }

                    var index = li.index();

                    //切换了一级级菜单
                    if (self.options.selectedId == id) {
                        return;
                    }
                    var oldId = self.options.selectedId;
                    self.options.selectedId = id;
                    li.addClass('selected');

                    //抛出 change 事件
                    self._trigger("change", e, {
                        oldItem: oldId,
                        newItem: id,
                        oldIndex: self.options.selectedIndex,
                        newIndex: index
                    });

                    //判断上次选中的是否存在，如果不存在就是首次点击。
                    if (self.itemCacheMap[oldId]) {

                        var oldLi = self.itemCacheMap[oldId];
                        var oldIndex = oldLi.index();
                        oldLi.removeClass('selected');
                        //如果显示二级菜单了，删除二级菜单，并收回间距
                        if (self.isShowMenu) {
                            self._destroyMenu();
                            // oldLi.stop().animate({
                            //     marginLeft: '0px',
                            //     marginRight: '0px',
                            // }, 200, 'swing');
                            // var elLeft = parseInt(el.css('left'));
                            // el.stop().animate({
                            //     left: elLeft + 68
                            // }, 200, 'swing');
                            oldLi.css({
                                marginLeft: '0px',
                                marginRight: '0px',
                            });
                        }
                        var oldItem = self.options.items[oldIndex];
                        var newItem = self.options.items[index];
                        if ((oldItem && oldItem.items && oldItem.items.length > 0) && (newItem && newItem.items && newItem.items.length > 0) && (self.options.selectedSmallId != null)
                            || !((oldItem && oldItem.items && oldItem && oldItem.items.length > 0) && (newItem && newItem.items && newItem.items.length > 0))) {
                            self.options.selectedOldId = oldId;
                            self.options.selectedOldLi = oldLi;
                            self.options.selectedOldIndex = parseInt(self.options.selectedIndex);
                        }
                    } else {
                        self.options.selectedOldId = null;
                        self.options.selectedOldLi = null;
                        self.options.selectedOldIndex = null;
                    }
                    self._moveBar(index);
                    var item = self.options.items[index];
                    this.$cicleBar.hide();
                    var niw = self._navItemW;
                    if (item && item.items && item.items.length > 0) {
                        self.$bar.hide();
                        self._isAnimate = true;
                        li.stop().animate({
                            marginLeft: niw + 'px',
                            marginRight: niw + 'px'
                        }, 200, 'swing', function () {
                            self._isAnimate = false;
                            var left = self._calLeft(index);
                            self._createMenu(left, item, item.items);
                            var isChild2 = function () {
                                for (var i = 0; i < item.items.length; i++) {
                                    if (item.items[i].id == self.options.selectedSmallId) return true;
                                }
                                return false;
                            }
                            if (self.options.selectedSmallId && isChild2()) {
                                var smallLi = $('#' + self.options.selectedSmallId);
                                self.$menuBox.find('.selected').removeClass('selected');
                                smallLi.addClass('selected');
                                var smallIndex = smallLi.index();
                                if (self.$cicleBar.css('display') != 'block') {
                                    var left = (self.options.selectedIndex + 1.5) * self._navItemW;
                                    self.$cicleBar.css('left', left + 'px');
                                    self.$cicleBar.show();
                                }
                                var angle = smallIndex * self.menuAngle + self.startAngle;
                                self.$cicleBar.arc('option', 'rotate', angle);
                            }
                        })
                    } else {
                        self.$bar.show();
                        if (self.options.selectedSmallId) {
                            self._trigger("unSelected", e, {
                                id: self.options.selectedSmallId
                            })
                            self.options.selectedSmallId = null;
                        }
                    }

                    self._trigger("click", e, {
                        id: id,
                        cancel: item.cancel
                    })
                },
                // 控制二级菜单
                "click .menu-item": function (e, id) {
                    if (!id) {
                        var li = $(e.currentTarget)
                        var id = li.attr('id');
                    } else {
                        var li = $('#' + id);
                    }
                    if (li.hasClass('selected')) {
                        li.removeClass('selected');
                        self.options.selectedSmallId = null;
                        self.$cicleBar.hide();
                        self._trigger("unSelected", e, {
                            id: id
                        })
                        return;
                    }

                    var index = li.index();
                    self.$menuBox.find('.selected').removeClass('selected');
                    li.addClass('selected');
                    if (self.$cicleBar.css('display') != 'block') {
                        var left = (self.options.selectedIndex + 1.5) * self._navItemW;
                        self.$cicleBar.css('left', left + 'px');
                        self.$cicleBar.show();
                    }
                    // var angle = index * self.menuAngle + self.startAngle;
                    var angle = index * self.arcAngle + self.startArcAngle;
                    self.$cicleBar.arc('option', 'rotate', angle);
                    self.options.selectedSmallId = id;
                    self._trigger("click", e, {
                        id: id
                    })
                    self.options.selectedOldId = null;
                    self.options.selectedOldLi = null;
                    self.options.selectedOldIndex = null;
                }
            });
            this._createBar();
            this._createCicleBar();
            this.refresh();
        },
        clear: function () {
            console.log('此方法将被废弃，请使用clearAndIfClose');
            var self = this;
            if (this.options.selectedId) {
                var li = this.itemCacheMap[this.options.selectedId];
                li.removeClass('selected');
                this.$bar.hide();
                //如果显示二级菜单了，删除二级菜单，并收回间距
                if (this.isShowMenu) {
                    this._destroyMenu();
                    this._isAnimate = true;
                    li.stop().animate({
                        marginLeft: '0px',
                        marginRight: '0px',
                    }, 200, 'swing', function () {
                        self._isAnimate = false;
                    });
                    var elLeft = parseInt(this.element.css('left'));
                    this.element.stop().animate({
                        left: elLeft + self._navItemW
                    }, 200, 'swing');
                    this.$cicleBar.hide();
                    //不应该清除状态
                    // if(self.options.selectedSmallId){
                    //     li.children().removeClass('selected');
                    //     self.options.selectedSmallId = null;
                    // }
                }
                this.options.selectedId = null;
            }
        },
        clearAndIfClose: function (close) {
            var self = this;
            if (this.options.selectedId && !this.options.selectedOldId) {
                var li = this.itemCacheMap[this.options.selectedId];
                li.removeClass('selected');
                this.$bar.hide();
                //如果显示二级菜单了，删除二级菜单，并收回间距
                if (this.isShowMenu) {
                    this._destroyMenu();
                    this._isAnimate = true;
                    li.stop().animate({
                        marginLeft: '0px',
                        marginRight: '0px',
                    }, 200, 'swing', function () {
                        self._isAnimate = false;
                    });
                    var elLeft = parseInt(this.element.css('left'));
                    this.element.stop().animate({
                        left: elLeft + self._navItemW
                    }, 200, 'swing');
                    this.$cicleBar.hide();
                    //不应该清除状态
                    if (self.options.selectedSmallId) {
                        li.children().removeClass('selected');
                    }
                }
                if (close) {
                    this.options.selectedSmallId = null;
                    this.options.selectedId = null;
                }
                if (this.options.selectedSmallId) {
                    this.options.selectedId = null;
                }
            } else if (this.options.selectedSmallId && close) {
                this.options.selectedSmallId = null;
            }
        },

        _createBar: function () {
            var self = this;
            var el = this.element;
            var bar = this.$bar = $('<div class="nav-bar"></div>').appendTo(el);
        },
        _createCicleBar: function () {
            var self = this;
            var el = this.element;
            this.$cicleBar = $('<div class="arc"></div>')
                .appendTo(el)
                .arc({ radius: (self._navItemW * 3 + self._navItemGap * 2) / 2 })
                .css('position', 'absolute')
                .css('top', self._arcTop + 'px').hide();
        },
        _createMenu: function (left, parent, menus) {
            this._destroyMenu();
            var self = this;
            self.isShowMenu = true;
            var el = this.element;
            var box = this.$menuBox = $('<div class="menu-box"><div class="outer"></div><div class="inner"></div><ul></ul></div>').appendTo(el);
            box.css('left', left + 'px');
            // box.hide();
            var ul = box.find('ul');
            var count = menus.length;
            var totalAngle = 135, arcTotalAngle = 160;
            var startAngle = this.startAngle = (180 - totalAngle) / 2;
            var start = startAngle / 180 * Math.PI;
            var da = totalAngle / 180 * Math.PI / count, x, y;
            var daa = this.menuAngle = totalAngle / count;
            this.arcAngle = arcTotalAngle / count;
            this.startArcAngle = (180 - arcTotalAngle) / 2;
            this.$cicleBar.arc('option', 'arc', daa);
            var className = count < 5 ? 'menu-item-max' : 'menu-item-min';
            var parentId = parent.id;
            for (var i = 0; i < count; i++) {
                var menu = menus[i];
                menu.id = menu.id || self._getNextId();
                var angle = da * (i + 0.5) + Math.PI + start;
                // console.log(angle / Math.PI * 180);
                var $menu = $('<li class="icon iconfont"></li>').appendTo(ul);
                $menu.addClass(menu.class);
                $menu.addClass('icon-all');
                $menu.addClass('icon-item');
                $menu.addClass('menu-item');
                $menu.addClass(className);
                if (this.options.menuSelected == menu.id) {
                    $menu.addClass('selected');
                }
                $menu.data('parentId', parentId);
                if (menu.appId) {
                    $menu.attr('data-appid', menu.appId);
                }
                menu.title = it.util.i18n("NavBar_" + menu.id);
                $menu.attr('title', menu.label || menu.title || menu.name);
                $menu.attr('id', menu.id);
                var tr = self._navItemIconR;
                var tx = self._navItemXOffset, ty = self._navItemYOffset;
                x = Math.cos(angle) * tr + self._navItemXOffset;
                y = Math.sin(angle) * tr + self._navItemYOffset;
                $menu.css('left', x + 'px');
                $menu.css('top', y + 'px');
            }
            return box;
        },
        _destroyMenu: function (item) {
            var self = this;
            // if (item != 'undefined') {
            //     var items = item.items;
            //     items.forEach(function(li){
            //         if($(li).hasClass('selected')){
            //             var id = $(li).attr('id');
            //             self._trigger("click", e, {
            //                 id: id
            //             })
            //         };
            //     });
            // };          
            this.isShowMenu = false;
            if (this.$menuBox) {
                this.$menuBox.remove();
                delete this.$menuBox;
            }

        },
        _moveBar: function (index) {
            var self = this;
            if (self.options.selectedIndex !== index) {
                self.options.selectedIndex = index;
                var left = index * self._navItemW + 'px';
                this._isAnimate = true;
                this.$bar.stop().animate({
                    left: left,
                }, 200, function () {
                    self._isAnimate = false;
                })
            }
        },
        _setOption: function (key, value) {
            this._super(key, value);
            if (key === "items") {
                this.refresh();
            }
        },

        refresh: function () {
            var self = this;
            self.$bar.hide();
            var el = this.element;
            if (!this.$ul) {
                this.$ul = $('<ul></ul>').appendTo(el);
            }
            var ul = this.$ul;
            ul.empty();
            var options = this.options;
            var items = options.items || [];
            var i = 0;
            items.forEach(function (item) {
                item.id = item.id || self._getNextId();
                var itemEl = self._createItem(item, i);
                itemEl.appendTo(ul);
                i++;
            })
            //默认不选中任何菜单
            // ul.find('li').eq(0).click();
        },
        _createItem: function (item, index) {
            var id = item.id;
            if (this.itemCacheMap[id]) {
                var li = this.itemCacheMap[id];
                if (this.options.selectedId != id) {
                    li.removeClass('selected');
                } else {
                    this._moveBar(index);
                    this.$bar.show();
                    li.addClass('selected');
                    // console.log(index);
                }
                return li;
            }
            var li = $('<li class="nav-item"></li>');
            var el = $('<span></span>').appendTo(li);
            el.addClass(item.class);
            el.addClass('icon iconfont nav-icon');
            if (item.appId) {
                li.attr('data-appid', item.appId);
            }
            li.attr('id', id);
            item.title = it.util.i18n("NavBar_" + id);
            li.attr('title', item.label || item.title || item.name);
            this.itemCacheMap[id] = li;
            return li;
        },
        _getNextId: function () {
            return 'nav-id-' + index++;
        },
        _destroy: function () {
            this._off(this.element, "click");
            this.$cicleBar.arc('destroy');
            this.element.empty()
        },
        clickNavIcon: function (id) {
            $('#' + id).children('span').trigger('click', id);
        },
        clickMenuItem: function (id) {
            $('#' + id).trigger('click', id);
        }
    })
})(jQuery)