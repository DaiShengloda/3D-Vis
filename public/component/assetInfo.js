(function ($) {
    $.widget("hud.assetInfo", {
        options: {
            items: [{
                    title: it.util.i18n("AssetInfo_Asset_Info"),
                    type: 'asset',
                    // width: '320px',
                    // height: 'auto'
                },
                {
                    title: it.util.i18n("AssetInfo_Capacity_Analysis"),
                    type: 'capacity',
                    // width: '320px',
                    // height: 'auto'
                },
                {
                    title: it.util.i18n("AssetInfo_Device_Status"),
                    type: 'state',
                    // width: '320px',
                    // height: '150px'
                },
                {
                    title: 'PUE',
                    type: 'pue',
                    // width: '320px',
                    // height: '130',
                }
            ],
            option_asset: [{
                    label: '机房',
                    value: 18
                },
                {
                    label: '空调',
                    value: 56
                },
                {
                    label: '机柜',
                    value: 624
                },
                {
                    label: '电池组',
                    value: 48
                },
                {
                    label: '配电柜',
                    value: 230
                },
                {
                    label: '发电机',
                    value: 2
                },
                {
                    label: 'UPS',
                    value: 120
                }
            ],
            option_capacity: [{
                    label: it.util.i18n("AssetInfo_Power_Distribution"),
                    value: 123.22,
                    total: 2000,
                    unit: '(kw)'
                },
                {
                    label: it.util.i18n("AssetInfo_Refrigeration"),
                    value: 15.77,
                    total: 60,
                    unit: '(kw)'
                },
                {
                    label: it.util.i18n("AssetInfo_Heating"),
                    value: 956,
                    total: 2600,
                    unit: ''
                }
            ],
            option_state: {
                grid: {
                    left: '12%',
                    right: '8%',
                    bottom: '15%',
                    top: '20%',
                },
                legend: {
                    show: true,
                    top: 0,
                    right: 26,
                    itemWidth: 8,
                    itemGap: 18,
                    data: [{
                        name: it.util.i18n("AssetInfo_Normal"),
                        icon: 'rect',
                        textStyle: {
                            color: 'rgba(0,169,0,1)'
                        }
                    }, {
                        name: it.util.i18n("AssetInfo_Abnormal"),
                        icon: 'rect',
                        textStyle: {
                            color: 'rgba(234,0,0,1)'
                        }
                    }]
                },
                xAxis: {
                    show: true,
                    type: 'category',
                    data: ['PDU', 'UPS', '空调', '业务机柜'],
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: "#ccc"
                        }
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        show: true,
                        color: 'rgba(0,0,0,1)',
                    },
                    splitLine: {
                        show: false,
                    }
                },
                yAxis: {
                    show: true,
                    boundaryGap: ['0%', '10%'],
                    splitNumber: 4,
                    axisLine: {
                        show: false,
                        lineStyle: {
                            color: "#ccc"
                        }
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        show: true
                    },
                    splitLine: {
                        show: true,
                        interval: 2,
                        lineStyle: {
                            color: 'rgba(220, 220, 220, .2)',
                            type: 'dashed'
                        }
                    }
                },
                series: [{
                        name: it.util.i18n("AssetInfo_Normal"),
                        type: 'bar',
                        stack: 1,
                        barWidth: '22px',
                        data: [20, 52, 105, 44],
                        itemStyle: {
                            normal: {
                                color: 'rgba(0,169,0,1)',
                            }
                        }
                    },
                    {
                        name: it.util.i18n("AssetInfo_Abnormal"),
                        type: 'bar',
                        stack: 1,
                        barWidth: '22px',
                        data: [0, 0, 70, 14],
                        itemStyle: {
                            normal: {
                                color: 'rgba(234,0,0,1)',
                            }
                        }
                    }
                ]
            },
            option_pue: {
                grid: {
                    left: 0,
                    right: 100,
                    bottom: 100,
                    top: 0
                },
                title: {
                    show: false
                },
                tooltip: {
                    show: false
                },
                series: [{
                    name: 'pue',
                    type: 'gauge',
                    min: 1,
                    max: 3,
                    radius: '120%',
                    splitNumber: 20,
                    startAngle: 180,
                    endAngle: 0,
                    "center": ["50%", "80%"],
                    axisLine: {
                        show: true,
                        lineStyle: {
                            width: 15,
                            shadowBlur: 0,
                            color: [
                                [0.25, 'rgba(0,169,0,1)'],
                                [0.5, 'rgba(246,140,0,1)'],
                                [1, 'rgba(240,0,0,1)']
                            ]
                        }
                    },
                    axisTick: {
                        show: false,
                    },
                    splitLine: {
                        show: false,
                    },
                    axisLabel: {
                        fontFamily: 'Microsoft Yahei',
                        formatter: function (e) {
                            switch (e + "") {
                                case "1":
                                    return e;
                                case "1.5":
                                    return e;
                                case "2":
                                    return e;
                                case '3':
                                    return 3;
                                default:
                                    return '';
                            }
                        },
                        distance: -50,
                        textStyle: {
                            fontSize: 14,
                            color: '#fff'
                        }
                    },
                    pointer: {
                        show: true,
                    },
                    detail: {
                        show: false
                    },
                    data: [{
                        name: "",
                        value: 1.3
                    }]
                }]
            },
            inited: false
        },
        _createItemsBody: function (items) {
            var self = this;
            items.forEach(function (item) {
                var s = '_createItemBody_' + item.type;
                var id = 'assetInfo_item_' + item.type;
                var div = document.getElementById(id);
                self[s](div);
            });
        },
        _createItemBody_asset: function (div) {
            $(div).empty();
            var self = this;
            self.options.option_asset.forEach(function (c) {
                var span = $('<span></span>');
                span.addClass('bt-item');
                var spanLabel = $('<span></span>');
                spanLabel.addClass('bt-label');
                spanLabel.text(c.label + ':');
                var spanValue = $('<span></span>').addClass('bt-value').text(c.value);
                span.append(spanLabel);
                span.append(spanValue);
                $(div).append(span);
            });
        },
        _createItemBody_capacity: function (div) {
            $(div).empty();
            var self = this;
            self.options.option_capacity.forEach(function (option) {
                var cDiv = $('<div></div>');
                $(div).append(cDiv);
                cDiv.addClass('bt-item');
                var label = $('<span></span>')
                    .text(option.label)
                    .addClass('bt-label');
                var progress = $('<span></span>')
                    .addClass('bt-progress');
                $('<span></span>')
                    .css('width', (option.value / option.total * 100) + '%')
                    .addClass('bt-value').appendTo(progress);
                option.unit = option.unit ? option.unit : '';
                var proportion = $('<span></span>')
                    .text(option.value + '/' + option.total + option.unit)
                    .addClass('bt-proportion');
                cDiv.append(label).append(progress).append(proportion);
            })
        },
        _createItemBody_state: function (div) {
            $(div).empty();
            var self = this;
            var myChart = echarts.init(div);
            myChart.setOption(self.options.option_state);
        },
        _createItemBody_pue: function (div) {
            var self = this;
            $(div).empty();
            var myChart = echarts.init(div);
            myChart.setOption(self.options.option_pue);
        },
        _createItem: function (item, noTitle) {
            var div = $('<div></div>');
            div.addClass('assetInfo_item').addClass('clearfix');
            if (!noTitle) {
                var title = this._createItemTitle(item.title);
                div.append(title);
            }
            var body = $('<div></div>');
            var id = 'assetInfo_item_' + item.type;
            body.prop('id', id);
            body.addClass(id);
            // body.css({
            //     'height': item.height
            // })
            div.append(body);
            return div;
        },

        _createItemTitle: function (title) {
            var $title = $('<div></div>');
            $title.addClass('assetInfo_title');
            $title.html('<span>' + title + '</span>');
            return $title;
        },

        _create: function () {
            var self = this;
            var mDiv = $('<div class="assetInfo"></div>').on('selectstart', function (e) {
                if (e.target.className == 'bt-value') {
                    return true
                }
                return false;
            });
            this.element.append(mDiv);
            // 创建title
            var $title = $('<div class="title-box">')
                .appendTo(mDiv);
            $('<span>')
                .appendTo($title)
                .addClass('title')
                .text(this.options.items[0].title);
            var $assetInfoBtBox = $('<div class="assetInfo-bt-box"></div>')
                .appendTo($title);
            $('<span>')
                .appendTo($assetInfoBtBox)
                .addClass('bt-arrow');
            var $content = this._$content = $('<div>')
                .addClass('assetInfo-content')
                .addClass('bt-scroll')
                .appendTo(mDiv);
            // this.refresh();
            $content.hide();
            this._on(this.element, {
                "click .assetInfo .assetInfo-bt-box": function (e) {
                    $(".assetInfo .bt-arrow").toggleClass('bt-arrow-open');
                    this._$content.slideToggle(200);
                    // self.refresh();
                    if (!self.options.inited) {
                        $('.assetInfo_prev').remove();
                        self.refresh();
                        self.options.inited = true;
                    } else {
                        self.refreshEchart();
                    }

                    if ($('.warningInfo .bt-arrow').hasClass('bt-arrow-open')) {
                        $('.warningInfo .bt-arrow').removeClass('bt-arrow-open');
                        $('.warningInfoDetail').slideUp();
                    }
                   
                    setTimeout(function(){
                        var attr1 = $('.assetInfo-content').css('display'),
                            attr2 = $('.warningInfoDetail').css('display'),
                            attr3 = $('#itv-pdf-view').css('display'),
                            width = 0;
                        if (attr1 == 'none' && attr2 !='none' && attr3 !='none') {
                            width = $('.warningInfoDetail').width() + $('#itv-pdf-view').width() || 0;
                        }else if(attr1 == 'none' && attr2 == 'none' && attr3 !='none') {
                            width = $('#itv-pdf-view').width() || 0;
                        }else if(attr1 != 'none' && attr3 !='none'){
                            width = $('.assetInfo-content').width() + $('#itv-pdf-view').width() || 0;
                        }else if(attr1 != 'none' && attr3 == 'none') {
                            width = $('.assetInfo-content').width();
                        }else if(attr1 == 'none' && attr2 == 'none' && attr3 =='none') {
                            width = 0;
                        }
                        $('.floor-box').css({
                            'right': width+10
                        });
                    },300);
                   

                },
            });
        },
        refreshEchart: function () {
            this._createItemBody_state(document.getElementById('assetInfo_item_state'));
            this._createItemBody_pue(document.getElementById('assetInfo_item_pue'));
        },

        _setOption: function (key, value) {
            // state [{label:'PDU', normal:100, abnormal:30},{label:'UPS', normal:12, abnormal:22},{label:'空调', normal:23, abnormal:12},{label:'业务机柜', normal:23, abnormal:12}]
            // pue  1.2
            // opacity [{label: '配电',value: 123.22,total: 2000,unit: '(kw)'},{label: '制冷',value: 15.77,total: 60,unit: '(kw)'},{label: '制热',value: 956,total: 2600,unit: ''}]
            // asset [{},{},{},{},{}]
            var self = this;
            if (key === "state") {
                var xlabel = [],
                    normalValue = [],
                    abnormalValue = [];
                value.forEach(function (c) {
                    xlabel.push(c.label);
                    normalValue.push(c.normal);
                    abnormalValue.push(c.abnormal);
                })
                self.options.option_state.xAxis.data = xlabel;
                self.options.option_state.series[0].data = normalValue;
                self.options.option_state.series[1].data = abnormalValue;
                var div = document.getElementById('assetInfo_item_state');
                if (div) {
                    this._createItemBody_state(div);
                }
            } else if (key === "pue") {
                this.options.option_pue.series[0].data[0].value = value;
                var div = document.getElementById('assetInfo_item_pue');
                if (div) {
                    this._createItemBody_pue(div);
                }
            } else if (key === "capacity") {
                key = 'option_capacity';
                this._super(key, value);
                var div = document.getElementById('assetInfo_item_capacity');
                if (div) {
                    this._createItemBody_capacity(div);
                }
            } else if (key === "asset") {
                key = 'option_asset';
                this._super(key, value);
                var div = document.getElementById('assetInfo_item_asset');
                if (div) {
                    this._createItemBody_asset(div);
                }
            } else {
                this._super(key, value);
            }
        },

        refresh: function () {
            var self = this;
            this.options.items.forEach(function (item, index) {
                var ch = self._createItem(item, index === 0);
                self._$content.append(ch);
            });
            this._createItemsBody(self.options.items);
        },

        _destroy: function () {
            $('.assetInfo').remove();
        },

    })
})(jQuery)