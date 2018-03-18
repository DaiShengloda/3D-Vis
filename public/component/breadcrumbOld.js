$.widget("hud.breadcrumb", {
    // default options
    options: {
        items: [{
                id: 'dc001',
                label: '漕河泾开发区'
            },
            {
                id: 'dc001',
                label: '5号楼'
            },
            {
                id: 'floor04',
                label: '5楼'
            },
            {
                id: 'r301',
                label: '301房间'
            }
        ],
        toggleOverview: console.log,
        click: console.log,
        home: console.log
    },
    _create: function () {
        var self = this;
        var el = this.element;
        var box = $('<div class="breadcrumb-box"></div>').appendTo(el);
        var leftBox = $('<div class="left-box lay-box"></div>').appendTo(box);
        var rightBox = $('<div class="right-box lay-box"></div>').appendTo(box);
        this.homeIcon = $('<span class="icon iconfont icon-home home-icon"></span>').appendTo(leftBox);
        this.ul = $('<ul class="item-box"></ul>').appendTo(leftBox);
        this.btn = $('<span class="ctrl"></span>').appendTo(rightBox);
        this.refresh();

        this._on(el, {
            'click .ctrl': function (e) {
                var ctrl = $(e.currentTarget);
                ctrl.toggleClass('on');
                self._trigger('toggleOverview', e, { expand: ctrl.hasClass('on') })
            },
            'click .item-btn': function (e) {
                var btn = $(e.currentTarget);
                var id = btn.attr('id');
                self._trigger('click', e, { id: id })
            },
            'click .home-icon': function (e) {
                var btn = $(e.currentTarget);
                self._trigger('home', e, {})
            }
        })
    },
    _setOption: function (key, value) {
        this._super(key, value);
        if (key === "items") {
            this.refresh();
        }
    },
    refresh: function () {
        var el = this.ul;
        el.empty();
        var items = this.options.items;
        items.forEach(function (item, index) {
            var li = $('<li></li>').appendTo(el);
            li.attr('title', item.id);
            var a = $('<a class="item-btn"></a>').text('/ ' + item.label).appendTo(li);
            a.attr('id', item.id);
            if (index == items.length - 1) {
                li.addClass('active')
            }
        })
    },
    _destroy: function () {
        this.element.empty();
    }
})