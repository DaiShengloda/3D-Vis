$.widget("hud.breadcrumb", {
    // default options
    options: {
        items: [
            // {
            //     id: 'dc001',
            //     label: '漕河泾开发区'
            // },
            // {
            //     id: 'dc001',
            //     label: '5号楼'
            // },
            {
                id: 'floor04',
                label: '4楼'
            },
            {
                id: 'r301',
                label: '301房间'
            }
        ],
        getRootDataId: 'earth01',
        toggleOverview: console.log,
        click: console.log,
        home: console.log,
        ctrlMouseEnter: console.log,
        homeMouseEnter: console.log,
    },
    _create: function () {
        var self = this;
        var el = this.element;
        var box = $('<div class="breadcrumb-box"></div>').appendTo(el);
        var leftBox = $('<div class="left-box lay-box"></div>').appendTo(box);
        var middleBox = this.middleBox = $('<div class="middle-box lay-box"></div>').appendTo(box);
        var rightBox = $('<div class="right-box lay-box"></div>').appendTo(box);
        var homeIcon = $('<span class="icon iconfont icon-home home-icon"></span>').appendTo(leftBox);
        this.ul = $('<ul class="item-box clearfix"></ul>').appendTo(middleBox);
        this.btn = $('<span class="bt-arrow"></span>').appendTo(rightBox);
        this.refresh();
        if (this.options.getRootDataId) {
            homeIcon.attr('id', this.options.getRootDataId)
        } else {
            homeIcon.attr('id', 'earth01')
        }
        // this.boxWidth = middleBox.width();
        this.contentPositionX = null;
        this._on(el, {
            'click .right-box': function (e) {
                var ctrl = $(e.currentTarget);
                ctrl.toggleClass('bt-arrow-open');
                self._trigger('toggleOverview', e, { expand: ctrl.hasClass('bt-arrow-open') })
            },
            'mouseenter .right-box': function (e) {
                var ctrl = $(e.currentTarget);
                self._trigger('ctrlMouseEnter', e, ctrl);
            },
            'click .item-btn': function (e) {
                var btn = $(e.currentTarget);
                var id = btn.attr('id');
                var current = btn.parent().attr('current');
                self._trigger('click', e, { id: id, current: current })
            },
            'click .home-icon': function (e) {
                var btn = $(e.currentTarget);
                var id = btn.attr('id');
                self._trigger('home', e, { id: id })
            },
            'mouseenter .home-icon': function (e) {
                var btn = $(e.currentTarget);
                self._trigger('homeMouseEnter', e, btn);
            },
        })

        middleBox.on('mouseleave', function (e) {
            self.ul.stop();
            self.currentState = 'none';
        })

        middleBox.on('mousemove mouseenter', function (e) {
            if (self.contentPositionX == null) {
                self.contentPositionX = middleBox.offset().left;
            }
            var x = e.pageX;
            if ((x > self.contentPositionX + self.boxWidth * 3 / 4) && (self.boxWidth < self.contentWidth)) {
                if (self.currentState != 'left') self._breadcrumbMove('left');
            } else if ((x < self.contentPositionX + self.boxWidth / 4) && (self.boxWidth < self.contentWidth)) {
                if (self.currentState != 'right') self._breadcrumbMove('right');
            } else {
                self.ul.stop();
                self.currentState = 'none';
            }
        })
    },

    _breadcrumbMove: function (direction) {
        var marginLeft = Math.abs(parseInt(this.ul.css('marginLeft')));
        var time;
        if (direction == 'left') {
            time = (Math.abs(this.boxWidth - this.contentWidth) - marginLeft) * 5;
            this.currentState = 'left';
            this.ul.stop().animate({ marginLeft: this.boxWidth - this.contentWidth }, time, function () {
                this.currentState = 'none';
            })
        } else if (direction == 'right') {
            time = marginLeft * 5;
            this.currentState = 'right';
            this.ul.stop().animate({ marginLeft: 0 }, time, function () {
                this.currentState = 'none';
            })
        }
    },

    // 场景变换的时候会调用各个组件的doHide
    doBtnOff: function () {
        this.btn.parent().removeClass('bt-arrow-open');
    },

    whenEarthScene: function () {
        this.doBtnOff();
        this.btn.parent().hide();
        this.element.hide();
    },

    whenDataCenterScene: function () {
        this.btn.parent().hide();
        this.doBtnOff();
        this.element.show();
    },

    whenFloorScene: function () {
        this.element.show();
        this.btn.parent().show();
    },

    _setOption: function (key, value) {
        this._super(key, value);
        if (key === "items") {
            this.refresh();
        }
    },
    refresh: function () {
        this.contentWidth = 0;
        this.currentState = 'none';
        this.boxWidth = this.middleBox.innerWidth();
        var el = this.ul;
        el.empty();
        var title = '';
        var items = this.options.items;
        var self = this;
        items.forEach(function (item, index) {
            var li = $('<li></li>').appendTo(el);
            title += ' /' + item.label;
            var a = $('<a class="item-btn"></a>').text('/ ' + item.label).appendTo(li);
            a.attr('id', item.id);
            if (index == items.length - 1) {
                li.addClass('active')
            }
            self.contentWidth += li.outerWidth() + 1;
        })
        el.attr('title', title);
        var lastChild = el.children('li:last-child');
        lastChild.attr('current', 'current');
        if (this.boxWidth < this.contentWidth) {
            el.css({ 'marginLeft': this.boxWidth - this.contentWidth })
        } else {
            el.css({ 'marginLeft': 0 })
        }
    },

    _destroy: function () {
        this.element.empty();
    }
})