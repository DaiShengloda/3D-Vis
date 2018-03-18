(function ($) {
    var index = 0;
    $.widget("hud.toolbar", {
        // default options
        options: {
            bgRadius0: 70, //背景内圈半径
            bgRadius1: 140, //背景中圈半径
            bgRadius2: 210, //背景外圈半径
            itRadius0: 80, //按钮内圈半径 中间位置减去字体大小的一半
            itRadius1: 150, //按钮外圈半径 中间位置减去字体大小的一半
            itemMap: {},
            items0: [{
                    id: 'saveCamera', //名称，唯一编号
                    name: it.util.i18n("ToolbarMgr_Save_Camera"), //name 提示信息
                    class: 'icon-eye-circle', //样式
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
            defaultClass: '', //默认样式
            selectedClass: '', //选中样式
            selectedId: '', //id 字段值
            expend: false,
            // Callbacks
            click: console.log,
            change: null,
        },
        itemCacheMap: [], //根据 id 字段缓存对应的 element
        _create: function () {
            var self = this;
            var el = this.element;

            this.box = $('<div class="toolbar-box"></div>').appendTo(el);
            this._createBg();
            this._createCicleBar();
            this.itemBox0 = $('<ul class="item-box item-box0"></div>').appendTo(this.bg1);
            this.itemBox1 = $('<ul class="item-box item-box1"></div>').appendTo(this.bg2);
            this._createItems();

            var r0 = this.options.bgRadius0;
            var off = 15;
            $('.bg1').animate({ 'width': r0, 'height': r0 });
            $('.bg2').animate({ 'width': r0 + off, 'height': r0 + off });
            this.$cicleBar.hide();

            this._on(this.element, {
                "click .toolbar-icon": function (e, id) {
                    if (id) {
                        var li = $('#' + id);
                    } else {
                        var li = $(e.currentTarget).closest('li');
                        var id = li.attr('id');
                    }
                    if(id == 'resetCamera') {
                        $('.floor-box').css({
                            'right': 10
                        });
                    }
                    var item = self.options.itemMap[id];
                    var index = li.index();
                    //如果是有状态的并且已经选中，那么取消选中
                    if (!item.stateless && li.hasClass('selected')) {
                        self.$cicleBar.hide();
                        li.removeClass('selected');
                        self.options.selectedId = "";
                        self._trigger("click", event, {
                            id: id,
                            selected: false,
                        })
                        return;
                    }
                    //如果已经选中，跳过后续动作
                    if (li.hasClass('selected')) {
                        self.$cicleBar.hide();
                        li.removeClass('selected');
                        self.options.selectedId = "";
                        self._trigger("click", event, {
                            id: id,
                            selected: false,
                        })
                        return;
                    }
                    //
                    if (self.options.selectedId == id) {
                        return;
                    }
                    var oldId = self.options.selectedId;

                    li.addClass('selected');

                    //抛出 change 事件
                    self._trigger("change", e, {
                        oldItem: oldId,
                        newItem: id,
                        oldIndex: self.options.selectedIndex,
                        newIndex: index
                    });
                    self.options.selectedId = id;

                    // //判断上次选中的是否存在，如果不存在就是首次点击。
                    // if (self.itemCacheMap[oldId]) {

                    //     var oldLi = self.itemCacheMap[oldId];
                    //     var oldIndex = oldLi.index();
                    //     oldLi.removeClass('selected');
                    // }
                    var angle = li.data('angle');
                    var inner = li.data('inner');
                    var arc = li.data('arc');
                    var radius = li.data('radius');
                    self.$cicleBar.show();
                    self.$cicleBar.arc('option', 'radius', radius);
                    self.$cicleBar.arc('option', 'arc', arc / Math.PI * 180);
                    self.$cicleBar.arc('option', 'rotate', angle / Math.PI * 180);

                    self._trigger("click", event, {
                        id: id,
                        selected: true,
                    })
                    clearTimeout(self.barTimer);

                    if (item.stateless) {
                        self.barTimer = setTimeout(function () {
                            self.$cicleBar.hide();
                            li.removeClass('selected');
                            self.options.selectedId = "";
                        }, 500)
                    }
                },
                "click .bg0": function (e) {
                    if (self.options.expend) {
                        var r0 = self.options.bgRadius0;
                        var off = 15;
                        $('.bg1').animate({ 'width': r0, 'height': r0 });
                        $('.bg2').animate({ 'width': r0 + off, 'height': r0 + off });
                        self.$cicleBar.hide();
                    } else {
                        var r1 = self.options.bgRadius1;
                        var r2 = self.options.bgRadius2;
                        $('.bg1').animate({ 'width': r1, 'height': r1 });
                        $('.bg2').animate({ 'width': r2, 'height': r2 }, function () {
                            if (self.options.selectedId) {
                                self.$cicleBar.show();
                            }
                        });
                        
                    }
                    if($('.bg0').hasClass("middleBgColor") && $('.bg2').hasClass("shadowBgColor")) {//展开，3层
                        $('.bg0').removeClass("middleBgColor");
                        $('.bg2').removeClass("shadowBgColor");
                        $('.bg0').addClass("deepBgColor");
                        $('.bg2').addClass("middleBgColor");
                    }else if($('.bg0').hasClass("deepBgColor") && $('.bg2').hasClass("middleBgColor")) {//收缩，2层
                        $('.bg0').removeClass("deepBgColor");
                        $('.bg2').removeClass("middleBgColor");
                        $('.bg0').addClass("middleBgColor");
                        $('.bg2').addClass("shadowBgColor");
                    }
                    self.options.expend = !self.options.expend;
                }
            });

        },

        _createCicleBar: function () {
            var self = this;
            var el = this.element;
            this.$cicleBar = $('<div class="arc"></div>')
                .appendTo(el)
                .arc({ radius: 136 })
                .css('position', 'absolute')
                .css('right', '0px')
                .css('bottom', '0px')
                .hide();
        },
        _createBg: function (left, parent, menus) {
            var self = this;
            var box = this.box;
            var bg2 = this.bg2 = $('<div class="bg bg2"></div>').appendTo(box);
            var bg1 = this.bg1 = $('<div class="bg bg1"></div>').appendTo(box);
            var bg0 = this.bg0 = $('<div class="bg bg0"></div>').appendTo(box);

            bg0.css('width', this.options.bgRadius0);
            bg0.css('height', this.options.bgRadius0);
            bg1.css('width', this.options.bgRadius1);
            bg1.css('height', this.options.bgRadius1);
            bg2.css('width', this.options.bgRadius2);
            bg2.css('height', this.options.bgRadius2);

            //背景色
            bg0.addClass("middleBgColor");//0.6
            bg1.addClass("middleBgColor");//0.6
            bg2.addClass("shadowBgColor");//0.3

            return box;
        },
        _createItems: function () {
            this.options.itemMap = {};
            this._createBoxItems(this.itemBox0, this.options.items0, this.options.itRadius0+8, this.options.bgRadius1);
            this._createBoxItems(this.itemBox1, this.options.items1, this.options.itRadius1, this.options.bgRadius2);
        },
        _createBoxItems: function (box, items, radius, barRadius) {
            var self = this;
            var da = Math.PI / 2 / (items.length - 0.6);//每一段的宽度，默认0.5
            var arc = Math.PI / 2 / (items.length);
            var angle, x, y;
            items.forEach(function (item, index) {
                self.options.itemMap[item.id] = item;
                angle = (index + 0.1) * da; // 每一段的偏移量，默认0.25
                x = Math.cos(angle) * (radius);
                y = Math.sin(angle) * (radius);
                item.id = item.id || self._getNextId();
                var itemEl = self._createItem(item);
                itemEl.css('right', x);
                itemEl.css('bottom', y);
                itemEl.data('angle', index * (arc));
                itemEl.data('arc', arc);
                itemEl.data('radius', barRadius + 4);
                itemEl.appendTo(box);
            })
        },
        _createItem: function (item) {
            var id = item.id;
            var li = $('<li class="toolbar-item"></li>');
            var el = $('<span></span>').appendTo(li);
            el.addClass(item.class);
            el.addClass('icon iconfont toolbar-icon');
            li.attr('id', id);
            li.attr('title', item.title || item.name);
            this.itemCacheMap[id] = li;
            return li;
        },
        _getNextId: function () {
            return 'nav-id-' + index++;
        },
        _destroy: function () {
            this.$cicleBar.arc('destroy');
            this.element.empty()
        },
        clear: function () {
            var oldId = this.options.selectedId;
            if (!oldId) {
                return;
            }
            //判断上次选中的是否存在，如果不存在就是首次点击。
            if (this.itemCacheMap[oldId]) {

                var oldLi = this.itemCacheMap[oldId];
                oldLi.removeClass('selected');
                this.options.selectedId = null;
            }
        },
        clickToolbarIcon: function (id) {
            $('#' + id).children('span').trigger('click', id);
        },
        removeSelectedId: function (id) {
            if (this.options.selectedId == id) {
                this.options.selectedId = "";
            }
        }
    })
})(jQuery)