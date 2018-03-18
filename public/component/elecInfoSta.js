$.widget("hub.elecInfoSta", {
    options: {
        title: it.util.i18n("PowerManager_Power_statistics"),
        items: [{
            label: it.util.i18n("PowerManager_Floor_power_rating"),
            value: 20000,
            unit: 'kw.h'
        }, {
            label: it.util.i18n("PowerManager_Floor_power_real"),
            value: 222222.03,
            unit: 'kw.h'
        }, {
            label: it.util.i18n("PowerManager_Load_factor"),
            value: 6.65,
        }],
        pue: 1.25,
        pue_levels: [{
            range: [0, 1],
            color: '#80ff79',
        }, {
            range: [1, 1.5],
            color: '#ffff62',
        }, {
            range: [1.5, 3],
            color: '#ff5452',
        }],
        pue_total: 3,
        pie_init: false
    },

    _create: function () {
        var $elecInfoSta = this.elecInfoSta = $('<div></div>').addClass('elecInfoSta').appendTo(this.element);
        $elecInfoSta.append(this._createTitle(this.options));
        this._createBody();
    },
    _createBody: function () {
        var $elecInfoStaBody = this.elecInfoStaBody = $('<div></div>').addClass('elecInfoSta-body').appendTo(this.elecInfoSta);
        var $elecInfoStaBodyText = this.elecInfoStaBodyText = $('<div></div>').addClass('elecInfoSta-body-text').appendTo($elecInfoStaBody);
        this._createText($elecInfoStaBodyText);
        var $elecInfoStaBodyEchart = this.elecInfoStaBodyEchart = $('<div></div>').addClass('elecInfoSta-body-echart').appendTo($elecInfoStaBody);
        this._createPie($elecInfoStaBodyEchart);
    },
    _createText: function (div) {
        div.empty();
        var items = this.options.items;
        items.forEach(function (c) {
            var label = c.label, value = c.value;
            var unit = c.unit ? c.unit : '';
            var item = $('<div></div>').addClass('elecInfoSta-body-text-item');
            var item_label = $('<span><span>').addClass('elecInfoSta-body-text-item-label').text(label + '：').appendTo(item);
            var item_value = $('<span><span>').addClass('elecInfoSta-body-text-item-value').text(value).appendTo(item);
            var item_unit = $('<span><span>').addClass('elecInfoSta-body-text-item-unit').text(unit).appendTo(item);
            div.append(item);
        })
    },
    _createPie: function (div) {
        var self = this;
        if (!this.options.pie_init) {
            var $pie = this.pie = $('<div></div>').addClass('elecInfoSta-body-pie').appendTo(div);
            $pie.echart_pie({
                total: self.options.pue_total,
                levels: self.options.pue_levels
            });
            this.options.pie_init = true;
        }
        this.pie.echart_pie('refresh');
    },

    doHidePanel: function () {
        this.elecInfoSta.css('visibility', 'hidden');
        this.title.css('visibility', 'visible');
    },

    doShowPanel: function () {
        this.elecInfoSta.css('visibility', 'visible');
    },

    _createTitle: function (option) {
        var head = $('<div>').addClass('app-head')
        var title = this.title = $('<span>').addClass('app-title').text(option.title);
        var circle = $('<div>').addClass('app-circle');
        var insideCircle = $('<div>').addClass('app-circle-inside');
        circle.attr('title', '隐藏').append(insideCircle);
        head.append(title);
        head.append(circle);

        var self = this;
        circle.on('mouseup', function () {
            self.doHidePanel();
        });
        title.on('mouseup', function () {
            self.doShowPanel();
        });
        return head;
    },

    refresh: function () {
        this._createText(this.elecInfoStaBodyText);
        this._createPie(this.elecInfoStaBodyEchart)
    },
    _destroy: function () {
        this.elecInfoSta.remove();
    },
    _setOption: function (key, value) {
        this._super(key, value);
        if (key == 'pue') {
            this.pie.echart_pie('option', 'value', value);
        } else if (key == 'pue_levels') {
            this.pie.echart_pie('option', 'levels', value);
        } else {
            this.refresh();
        }
    }
})

$.widget("hub.echart_pie", {
    options: {
        w: 220,
        h: 220,

        label: {
            text: 'PUE',
            color: 'rgb(255, 255, 255)',
            font: '16px Pirulen'
        },
        number: {
            value: 1.25,
            color: 'rgb(255, 255, 255)',
            font: '26px Pirulen'
        },
        total: 3,
        levels: [{
            range: [0, 1],
            color: '#80ff79',
        }, {
            range: [1, 1.5],
            color: '#ffff62',
        }, {
            range: [1.5, 3],
            color: '#ff5452',
        }],
        r0: 60, //内圈

        r1: 94, //扇形内圈
        r2: 110, //扇形外圈
        bgColor: 'rgba(53,53,53,0.5)',
        bgLineColor: 'rgb(95, 95, 95)'
    },
    _handle: function () {
        if ($(this.element).css('width').toLowerCase().indexOf('px') < 0) return

        if (this.canvas) {
            this.canvas.remove();
        }

        var $canvas = this.canvas = $('<canvas></canvas>').addClass('echart_pie').appendTo(this.element);
        var shape = this.shape = $canvas[0];
        var g = this.g = shape.getContext('2d');

        var devicePixelRatio = window.devicePixelRatio || 1;
        var backingStoreRatio = g.webkitBackingStorePixelRatio ||
            g.mozBackingStorePixelRatio ||
            g.msBackingStorePixelRatio ||
            g.oBackingStorePixelRatio ||
            g.backingStorePixelRatio || 1;
        var ratio = devicePixelRatio / backingStoreRatio;

        var width = parseFloat($(this.element).css('width')) * 0.75;

        this.options.w = width;
        this.options.h = width;
        this.options.r0 = 60 / 220 * width;
        this.options.r1 = 94 / 220 * width;
        this.options.r2 = 110 / 220 * width;
        this.options.unitFont = 12 + 'px 微软雅黑';
        this.options.label.font = 16 + 'px Pirulen';
        this.options.number.font = 26 + 'px Pirulen';


        shape.width = width * ratio;
        shape.height = width * ratio;
        shape.style.width = width + 'px';
        shape.style.height = width + 'px';

        g.setTransform(ratio, 0, 0, ratio, 0, 0);
        this._draw(g, shape);

    },
    _create: function () {
        var self = this;
        this._handle();
        // var $canvas = this.canvas = $('<canvas></canvas>').addClass('echart_pie').appendTo(this.element);
        // var shape = this.shape = $canvas[0];
        // shape.width = this.options.w;
        // shape.height = this.options.h;
        // var g = this.g = shape.getContext('2d');
        // this._draw(g, shape);
    },
    _draw: function (g, shape) {
        var self = this;
        var w = self.options.w;
        var h = self.options.h;

        g.clearRect(0, 0, w, h);

        g.save();
        g.beginPath();
        g.strokeStyle = 'rgb(155, 110, 9)';
        g.fillStyle = 'rgb(155, 110, 9)';
        g.arc(w / 2, h / 2, self.options.r0, 0, Math.PI * 2);
        g.stroke();
        g.fill();
        g.restore();

        g.save();
        g.fillStyle = self.options.label.color;
        g.font = self.options.label.font;
        g.textAlign = 'center';
        g.textBaseline = "bottom";
        g.fillText(self.options.label.text, w / 2, h / 2);
        g.restore;

        g.save();
        g.fillStyle = self.options.number.color;
        g.font = self.options.number.font;
        g.textAlign = 'center';
        g.textBaseline = "top";
        g.fillText(self.options.number.value, w / 2, h / 2);
        g.restore;

        g.save();
        g.beginPath();
        g.strokeStyle = self.options.bgColor;
        g.lineWidth = self.options.r2 - self.options.r1;
        g.arc(w / 2, h / 2, self.options.r2 - g.lineWidth / 2, 0, Math.PI * 2);
        g.stroke();
        g.restore();

        g.save();
        g.beginPath();
        g.strokeStyle = self.options.bgLineColor;
        g.arc(w / 2, h / 2, self.options.r2, 0, Math.PI * 2);
        g.stroke();
        g.restore();

        g.save();
        g.beginPath();
        g.strokeStyle = self.options.bgLineColor;
        g.arc(w / 2, h / 2, self.options.r1, 0, Math.PI * 2);
        g.stroke();
        g.restore();

        var value = self.options.number.value;
        self.rotation = Math.PI / 2;
        self.options.levels.forEach(function (c, index) {
            var range = c.range;
            var color = c.color;
            if (value > range[1]) {
                var angle = (range[1] - range[0]) / self.options.total * Math.PI * 2;
                g.save();
                g.beginPath();
                g.strokeStyle = color;
                g.lineWidth = self.options.r2 - self.options.r1;
                g.arc(w / 2, h / 2, self.options.r2 - g.lineWidth / 2, self.rotation, angle + self.rotation, false);
                self.rotation += angle;
                g.stroke();
                g.restore();
            } else if (value >= range[0] && value <= range[1]) {
                var angle = (value - range[0]) / self.options.total * Math.PI * 2;
                g.save();
                g.beginPath();
                g.strokeStyle = color;
                g.lineWidth = self.options.r2 - self.options.r1;
                g.arc(w / 2, h / 2, self.options.r2 - g.lineWidth / 2, self.rotation, angle + self.rotation, false);
                self.rotation += angle;
                g.stroke();
                g.restore();
            }
        });
    },
    refresh: function () {
        this._handle();
    },
    _destroy: function () {
        this.canvas.remove();
    },
    _setOption: function (key, value) {
        if (key == 'value') {
            this.options.number.value = value;
        } else {
            this._super(key, value);
        }
        this.refresh();
    }
})