(function ($) {
    $.widget("hud.warningRuleConfig", {
        options: {
            fieldMap: {
                'power': '电力负载',
                'weight': '承重负载'
            },
            powerColors: ['#80ff79', '#ffff62', '#ff5452'],
            weightColors: ['#70cdff', '#ffff62', '#ff5452'],
            colors: ['rgb(114, 217, 0)', 'rgb(234, 146, 49)', 'rgb(233, 63, 51)'],
            limit: [0, 100],
            values: [20, 80],
            config: {
                'power': [10, 90],
                'weight': [40, 60]
            },
            oldConfig: {},
        },

        _create: function () {
            var self = this;
            var mDiv = self.warningRuleConfig = $('<div class="warningRuleConfig"></div>').appendTo(self.element).on('selectstart', function () { return false; });
            self.initBody(mDiv);
            self.refresh();
        },

        initBody: function (bodyDiv) {
            var self = this;
            bodyDiv.empty();

            self.initSliderView('power').appendTo(bodyDiv);
            self.initSliderView('weight').appendTo(bodyDiv);

            var btDiv = $('<div></div>').appendTo(bodyDiv).addClass('warningRuleConfig_body_btns').addClass('clearfix');
            var defaultBtn = $('<span>默认值</span>').appendTo(btDiv).addClass('warningRuleConfig_body_btns_default');
            var confirmBtn = $('<span>保存</span>').appendTo(btDiv).addClass('warningRuleConfig_body_btns_confirm');
            var cancaelBtn = $('<span>取消</span>').appendTo(btDiv).addClass('warningRuleConfig_body_btns_cancel');

            bodyDiv.find('.sliderBar').each(function () {
                var slider = $(this);
                var colors = slider.attr('data-colors');
                self.initSliderBar(slider, self.options[colors]);
            })
        },

        initSliderView: function (name) {
            var className = name + '-box';
            var label = this.options.fieldMap[name];
            var s = '' +
                '<div style="margin-left:20px;height:120px;margin-right:25px;" field="' + name + '" class="' + className + '">' +
                '   <div class="title"><span>' + label + '：</span></div>' +
                '   <div class="label">' +
                '   <span>低于</span>' +
                '   <span><input class="lowValue value input-min" style="color:' + this.options[name + 'Colors'][0] +
                '   "></span><span>%时显示<span style="width:12px;margin-left:4px;margin-right:4px;display:inline-block;height:12px;background-color:' + 
                    this.options[name + 'Colors'][0] +
                '   "></span>低于</span><span>' +
                '   <input class="highValue value input-min" style="color:' + this.options[name + 'Colors'][1] + '"></span>' +
                '   <span>%时显示<span style="width:12px;margin-left:4px;margin-right:4px;display:inline-block;height:12px;background-color:' + 
                     this.options[name + 'Colors'][1] +
                '   "></span></span>否则显示<span style="width:12px;margin-left:4px;margin-right:4px;display:inline-block;height:12px;background-color:' + 
                    this.options[name + 'Colors'][2] +
                '   "></span></span></span></div>' +
                '   <div class="sliderBar" data-colors="' + name + 'Colors"></div>' +
                '</div>';
            return $(s);
        },

        initSliderBar: function (slider, colors) {
            var self = this;
            slider.rangeSlider({
                range: true,
                'header.left.color': colors[0],
                'header.center.color': colors[1],
                'header.right.color': colors[2],
                min: self.options.limit[0],
                max: self.options.limit[1],
                margin: 1,
                values: self.options.values,
                slide: function (event, ui) {
                    if (ui.values[0] >= ui.values[1]) {
                        return false;
                    }
                    var box = slider.parent();
                    setValue(box, ui);
                },
                change: function (event, ui) {
                    if (ui.values[0] >= ui.values[1]) {
                        return false;
                    }
                    var box = slider.parent();
                    setValue(box, ui);
                }
            });

            var box = slider.parent();
            var low = box.find('.lowValue');
            var high = box.find('.highValue');
            var values = slider.rangeSlider('values');
            low.val(values[0]);
            high.val(values[1]);
            low.data('value', values[0]);
            high.data('value', values[1]);
            box.find('input').on('change', function () {
                var lowValue = low.val().trim();
                var highValue = high.val().trim();
                if (lowValue == '' || highValue == '' || isNaN(lowValue) || isNaN(highValue)) {
                    low.val(low.data('value'));
                    high.val(high.data('value'));
                    return false;
                }
                lowValue = parseInt(lowValue);
                highValue = parseInt(highValue);
                if (lowValue >= highValue || lowValue < 0 || highValue > 100) {
                    low.val(low.data('value'));
                    high.val(high.data('value'));
                    return false;
                }
                low.data('value', lowValue);
                high.data('value', highValue);
                slider.rangeSlider('values', [lowValue, highValue]);
            });

            function setValue(box, ui) {
                box.find('.lowValue').val(ui.values[0]).data('value', ui.values[0]);
                box.find('.highValue').val(ui.values[1]).data('value', ui.values[1]);
                var word = box.attr('field');
                self.options.config[word] = ui.values;
            }
        },

        getFirstValues: function () {
            for (var i in this.options.config) {
                this.options.oldConfig[i] = this.options.config[i];
            }
        },

        alarmConfigDirty: function () {
            for (var i in this.options.config) {
                for (var j = 0; j < this.options.config[i].length; j++) {
                    if (this.options.config[i][j] != this.options.oldConfig[i][j]) return true;
                }
            }
            return false;
        },

        setSliderValue: function (name, values) {
            var className = name + '-box';
            $("." + className).find('.sliderBar').rangeSlider('values', values);
        },
        getSliderValue: function (name) {
            var className = name + '-box';
            return $("." + className).find('.sliderBar').rangeSlider('values');
        },

        _setOption: function (key, value) {
            var self = this;
            if (this.options.fieldMap[key]) {
                self.setSliderValue(key, value);
                self._super(self.options.config[key], value);
            } else {
                self._super(key, value);
            }
            if (key == 'config') {
                self.refresh();
            }
        },

        refresh: function (callback) {
            var self = this;
            for (var p in self.options.config) {
                self._setOption(p, self.options.config[p]);
            }
        },

        _destroy: function () {
            $('.warningRuleConfig').remove();
        }

    })
})(jQuery)


/**
 * 扩展原来的slider组建, 分成3个颜色块
 */
$.widget("hud.rangeSlider", $.ui.slider, {
    _create: function () {
        this._super();
        var element = this.element;
        this.centerHeader = element.find('.ui-widget-header');
        this.leftHeader = $('<div class="ui-slider-range ui-widget-header ui-widget-header-left ui-corner-all" style="left: 00%; width: 20%;"></div>')
        this.rightHeader = $('<div class="ui-slider-range ui-widget-header ui-widget-header-right ui-corner-all" style="left: 80%; width: 20%;"></div>')
        element.prepend(this.leftHeader);
        element.append(this.rightHeader);
        this.leftHeader.css('background-color', this.options['header.left.color']);
        this.centerHeader.css('background-color', this.options['header.center.color']);
        this.rightHeader.css('background-color', this.options['header.right.color']);
        var spanTop = $('<span></span>').css({
            'position': 'absolute',
            'width': 0,
            'height': 0,
            'border-top': '12px solid rgb(114, 217, 0)',
            'border-left': '8px solid transparent',
            'border-right': '8px solid transparent',
            'bottom': '100%',
            'left': '-7px'
        });
        var spanBot = $('<span></span>').css({
            'position': 'absolute',
            'width': 0,
            'height': 0,
            'border-bottom': '12px solid rgb(114, 217, 0)',
            'border-left': '8px solid transparent',
            'border-right': '8px solid transparent',
            'top': '100%',
            'left': '-7px'
        });
        var spanTop2 = $('<span></span>').css({
            'position': 'absolute',
            'width': 0,
            'height': 0,
            'border-top': '12px solid rgb(234, 146, 49)',
            'border-left': '8px solid transparent',
            'border-right': '8px solid transparent',
            'bottom': '100%',
            'left': '-7px'
        });
        var spanBot2 = $('<span></span>').css({
            'position': 'absolute',
            'width': 0,
            'height': 0,
            'border-bottom': '12px solid rgb(234, 146, 49)',
            'border-left': '8px solid transparent',
            'border-right': '8px solid transparent',
            'top': '100%',
            'left': '-7px'
        });
        $(this.element).find('.ui-slider-handle:even').append(spanTop).append(spanBot);
        $(this.element).find('.ui-slider-handle:odd').append(spanTop2).append(spanBot2);
        this.customChange = this.options.change;
        this.options.change = this._changeHandler;
        this.customSlide = this.options.slide;
        this.options.slide = this._slideHandler;
    },
    _destroy: function () {
        this._off(this.element, "change.default");
        this.leftHeader.remove();
        this.rightHeader.remove();
        delete this.leftHeader;
        delete this.rightHeader;
    },
    _setOption: function (key, value) {
        if (key === "header.left.color") {
            this.leftHeader.css('background-color', value);
            return;
        }
        if (key === "header.center.color") {
            this.centerHeader.css('background-color', value);
            return;
        }
        if (key === "header.right.color") {
            this.rightHeader.css('background-color', value);
            return;
        }
        if (key === "change") {
            this.customChange = value;
            value = this._changeHandler;
        }
        if (key === "change") {
            this.customSlide = value;
            value = this._slideHandler;
        }
        this._super(key, value);
    },
    _changeHandler: function (event, ui) {
        var scope = $(event.target).rangeSlider('instance');
        with (scope) {
            var vs = ui.values;
            var dis = options.max - options.min;
            var p1 = (vs[0] - options.min) / dis * 100;
            var p2 = (vs[1] - options.min) / dis * 100;

            leftHeader.css('width', p1 + '%');
            centerHeader.css('left', p1 + '%')
            centerHeader.css('width', (p2 - p1) + '%')
            rightHeader.css('left', p2 + '%')
            rightHeader.css('width', (100 - p2) + '%')
        }
        scope.customChange && scope.customChange.call(this, event, ui);
    },
    _slideHandler: function (event, ui) {
        var values1 = ui.values;
        var scope = $(event.target).rangeSlider('instance');
        var dis = 100;
        with (scope) {
            var width = element.width();
            // var centerLeft = parseFloat(centerHeader.css('left'));
            var centerLeft = values1[0] / dis * width;
            // var centerWidth = centerHeader.width();
            var centerWidth = (values1[1] - values1[0]) / dis * width;

            leftHeader.css('width', centerLeft / width * 100 + '%')
            rightHeader.css('left', (centerLeft + centerWidth) / width * 100 + '%')
            rightHeader.css('width', (width - centerLeft - centerWidth) / width * 100 + '%')
        }
        scope.customSlide && scope.customSlide.call(this, event, ui);
    },
});