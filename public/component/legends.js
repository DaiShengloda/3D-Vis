$.widget("hub.baseLegend", {
    options: {
        title: '电力信息统计',
        legend: [{
            color: 'rgb(0, 173, 0)',
            text: '轻负载(<64%)'
        }, {
            color: 'rgb(240, 154, 0)',
            text: '中负载'
        }, {
            color: 'rgb(239, 0, 0)',
            text: '高负载(>=80%)'
        }],
        volume: 1000,
        occupy: 700,
        unit: '',
        state: {
            total: {
                label: it.util.i18n("PowerManager_Total_Capacity"),
                value: '1000.00'
            },
            used: {
                label: it.util.i18n("PowerManager_Used_Capacity"),
                value: '800.00'
            },
            left: {
                label: it.util.i18n("PowerManager_Left_Capacity"),
                value: '200.00'
            },
            percentage: {
                label: it.util.i18n("PowerManager_Usage_Rate"),
                value: '80%'
            }
        },
        details: '',
    },

    _create: function () {
        this.init();
    },
    init: function () {
        var self = this;
        this._handle();
        var $legendBox = self.legendBox = $('<div></div>').addClass('legend-box').appendTo(self.element);
        var dw = $(document).width();
        var sw = $legendBox.width();
        // $legendBox.css('left', (dw - sw) / 2 + 'px');
        if(main.panelMgr.instanceMap.ToolbarMgr.toolbarMap.pdf.pdfManager.isOpenPdfView){
            this.legendBox.css('left', (dw - sw) / 4 + 'px');
            this.legendBox.css('top', '80px');
        }else{
            this.legendBox.css('left', (dw - sw) / 2 + 'px');
            this.legendBox.css('top', '30px');
        }
        $legendBox.draggable({
            handle: '.legend-box-header',
            containment: 'html',
            drag: function (event, ui) {
                event.stopPropagation();
            },
        });
        $('.legend-box').on('mousedown', function (e) {
            e.stopPropagation();
        });
        $legendBox.append(self._createHeader())
            .append(self._createMiddle())
            .append(self._createBottom())
            .append(self._getTreeTable())
            .append(self._createDetailsBtn());
        this._handlerDetailsBtn();
    },

    _createHeader: function () {
        var self = this;
        var header = this.header = $('<div>').addClass('legend-box-header');
        var title = this.title = $('<div>').addClass('legend-box-header-title').text(self.options.title).appendTo(header);
        var circle = $('<div>').addClass('legend-box-header-circle').attr('title', '隐藏').appendTo(header);
        var insideCircle = $('<div>').addClass('legend-box-header-circle-inside').appendTo(circle);
        circle.on('mouseup', function () {
            self.doHidePanel();
        });
        title.on('mouseup', function () {
            self.doShowPanel();
        });
        return header;
    },

    doHidePanel: function () {
        this.legendBox.css('visibility', 'hidden');
        this.title.css('visibility', 'visible');
    },

    doShowPanel: function () {
        this.legendBox.css('visibility', 'visible');
    },

    show: function () {
        // this.doShowPanel();
        var dw = $(document).width();
        var sw = this.legendBox.width();
        if(main.panelMgr.instanceMap.ToolbarMgr.toolbarMap.pdf.pdfManager.isOpenPdfView){
            this.legendBox.css('left', (dw - sw) / 4 + 'px');
            this.legendBox.css('top', '80px');
        }else{
            this.legendBox.css('left', (dw - sw) / 2 + 'px');
            this.legendBox.css('top', '30px');
        }
        $(this.element).show();
    },

    hide: function () {
        $(this.element).hide();
    },

    doHide: function () {
        this.legendBox.css('display', 'none');
    },

    doShow: function () {
        this.legendBox.css('display', 'block');
    },

    _createMiddle: function () {
        var self = this;
        if (this.middle) {
            var $middle = this.middle;
            $middle.empty();
        } else {
            var $middle = this.middle = $('<div>').addClass('legend-box-middle');
        }
        var $div1 = $('<div>').addClass('legend-box-middle-items').appendTo($middle);
        for (var p in self.options.state) {
            var cur = self.options.state[p];
            var item = $('<div>').addClass('legend-box-middle-item').appendTo($div1);
            var item_label = $('<div>').addClass('legend-item-label').appendTo(item).text(cur.label + self.options.unit);
            var item_label = $('<div>').addClass('legend-item-value').appendTo(item).text(cur.value);
        }

        var $div2 = $('<div>').addClass('legend-process-box').appendTo($middle);
        var $process = $('<div>').addClass('legend-process-value').appendTo($div2).css('width', self.options.state.percentage.value);
        return $middle;
    },

    _createBottom: function () {
        var self = this;
        if (this.bottom) {
            var $bottom = this.bottom;
            $bottom.empty();
        } else {
            var $bottom = this.bottom = $('<div>').addClass('legend-box-bottom');
        }
        var label = $('<span>').addClass('legend-box-bottom-label').text(it.util.i18n("PowerManager_Legend")).appendTo($bottom);
        this.options.legend.forEach(function (c) {
            var item = $('<span>').addClass('legend-box-bottom-item').appendTo($bottom);
            var item_icon = $('<span>').addClass('legend-item-icon').appendTo(item).css('background-color', c.color);
            var item_icon2 = $('<span>').addClass('legend-item-icon2').appendTo(item).css('border-left-color', c.color);
            if (c.innerColor) {
                var item_icon3 = $('<span>').addClass('legend-item-icon3').appendTo(item).css('background-color', c.innerColor);
                var item_icon4 = $('<span>').addClass('legend-item-icon4').appendTo(item).css('border-left-color', c.innerColor);
            };        
            var item_text = $('<span>').addClass('legend-item-text').text(c.text).appendTo(item);
        })
        return $bottom;
    },

    _createDetailsBtn: function() {    
        var $detailsBtn = this.detailsBtn = $('<div>').addClass('legend-box-detailsBtn');
        $detailsBtn.hide();
        $detailsBtn.attr('title', it.util.i18n('Admin_dataTable_Expand'));
        return $detailsBtn;
    },

    showDetailsBtn: function() {
        this.detailsBtn.show();
    },

    _handlerDetailsBtn: function() {
        var self = this;
        this.detailsBtn.click(function() {
            self._toggleTreeTable();
            self._trigger('addTableData', event, {
                el: self.treeTable
            })
        });
    },

    _toggleTreeTable: function() {
        this.treeTable.toggle();
        if (this.treeTable.is(':visible')) {
            this.detailsBtn.attr('title', it.util.i18n('Admin_dataTable_Collapse'));
        } else {
            this.detailsBtn.attr('title', it.util.i18n('Admin_dataTable_Expand'));
        }
        var legendBox = this.legendBox.get(0);
        legendBox.className = legendBox.className;
    },

    _getTreeTable: function() {
        var $treeTable = this.treeTable =  $('<div>').addClass('legend-box-table');
        var treeTableName = this.options.treeTableName;
        $treeTable.hide();
        if (treeTableName) {
            $treeTable[treeTableName](); 
        };       
        return $treeTable;
    },

    _handle: function () {
        var volume = this.options.volume,
            occupy = this.options.occupy;
        this.options.state.total.value = volume.toFixed(0);
        this.options.state.used.value = occupy.toFixed(0);
        this.options.state.left.value = (volume - occupy).toFixed(0);
        this.options.state.percentage.value = volume?(occupy * 100 / volume).toFixed(0) + '%':0;
    },

    _refreshHeader: function (value) {
        this.title.text(value);
    },

    refresh: function () {
        this._handle();
        this._refreshHeader(this.options.title);
        this._createMiddle();
        this._createBottom();
    },

    _destroy: function () {
        this.legendBox.remove();
    },

    _setOption: function (key, value) {
        this._super(key, value);
        this.refresh();
    }
})

$.widget("hub.weightLegend", $.hub.baseLegend, {
    options:{
        treeTableName: 'weightTreeTable'
    }
});

$.widget("hub.powerLegend", $.hub.baseLegend, {
    options:{
        treeTableName: 'powerTreeTable'
    }
});

$.widget("hub.seatLegend", $.hub.baseLegend, {});

$.widget("hub.spaceLegend", $.hub.baseLegend, {
    options:{
        treeTableName: 'spaceTreeTable'
    }
});

$.widget("hub.uSearchLegend", $.hub.baseLegend, {});

$.widget("hub.tempLegend", $.hub.baseLegend, {
    options: {
        title: it.util.i18n("TempApp_Used_Legend"),
        levels: [
            {
                color: 'rgb(0,160,234)',
                label: it.util.i18n("TempApp_Normal_Level")
            },
            {
                color: 'rgb(55,226,112)',
                label: it.util.i18n("TempApp_Normal_Level")
            },
            {
                color: 'rgb(242,144,0)',
                label: it.util.i18n("TempApp_Attention_Level")
            },
            {
                color: 'rgb(231,0,0)',
                label: it.util.i18n("TempApp_Warning_Level")
            }
        ],
        items: ['R301', 'R302', 'R303', 'R304']
    },
    _create: function () {
        var self = this;
        this.init();
        this._on(this.element, {
            'click .temp-legend-bottom-item': function (e) {
                e.stopPropagation();
                var $target = $(e.currentTarget);
                $target.find('.colorCube').toggleClass('colorCube-checked');
                self._trigger("click", event, {
                    id: $target.attr('id'),
                    show: $target.find('.colorCube').hasClass('colorCube-checked')
                });
            }
        })
    },
    _createMiddle: function () {
        var self = this;
        if (this.middle) {
            var $middle = this.middle;
            $middle.empty();
        } else {
            var $middle = this.middle = $('<div>').addClass('temp-legend-middle').appendTo(this.legendBox);
        }

        var box = $('<div>').appendTo($middle).addClass('temp-legend-middle-colorLumps');

        for (var i = 0; i < self.options.levels.length; i++) {
            if (self.options.levels[i + 1]) {
                var startColor = self.options.levels[i].color;
                var endColor = self.options.levels[i + 1].color;
                if (startColor.indexOf('rgb') >= 0) {
                    startColor = self._rgbToHex(startColor);
                }
                if (endColor.indexOf('rgb') >= 0) {
                    endColor = self._rgbToHex(endColor);
                }
                var mw = parseInt(box.css('width'));
                var step = parseInt((mw / 12 - 1) / 3);
                // box.css('width', (step * 3 + 1) * 12 + 'px');
                var colorArray = self._gradient(startColor, endColor, step);
                colorArray.forEach(function (color, index) {
                    var $span = $('<span>').addClass('colorLump').appendTo(box).css('background-color', color);
                    if (index == 0) {
                        $span.addClass('mainColorLump');
                        var label = $('<span>').addClass('levelLabel').text(self.options.levels[i].label).appendTo($span);
                    }
                })
            } else {
                var $span = $('<span>').appendTo(box).addClass('colorLump mainColorLump').css('background-color', self.options.levels[i].color);
                var label = $('<span>').text(self.options.levels[i].label).appendTo($span).addClass('levelLabel');
            }
        }

        return $middle;
    },
    _createBottom: function () {
        var self = this;
        if (this.bottom) {
            var $bottom = this.bottom;
            $bottom.empty();
        } else {
            var $bottom = this.bottom = $('<div>').addClass('temp-legend-bottom').appendTo(this.legendBox);
        }

        self.options.items.forEach(function (c) {
            var $item = $('<div>').attr('id', c).addClass('temp-legend-bottom-item').appendTo($bottom);
            var $item_color = $('<span>').addClass('colorCube colorCube-checked').appendTo($item).text('√');
            var $item_label = $('<span>').text(c).appendTo($item);
        });

        return $bottom;
    },
    _rgbToHex: function (r, g, b) {
        if (g == undefined || b == undefined) {
            var arr = r.match(/[0-9]+/g);
            var r = arr[0],
                g = arr[1],
                b = arr[2];
        }
        var hex = ((r << 16) | (g << 8) | b).toString(16);
        return "#" + new Array(Math.abs(hex.length - 7)).join("0") + hex;
    },
    _hexToRgb: function (hex) {
        var rgb = [];
        for (var i = 1; i < 7; i += 2) {
            rgb.push(parseInt("0x" + hex.slice(i, i + 2)));
        }
        return rgb;
    },
    _gradient: function (startColor, endColor, step) {
        var sColor = this._hexToRgb(startColor),
            eColor = this._hexToRgb(endColor);
        var rStep = (eColor[0] - sColor[0]) / step;
        gStep = (eColor[1] - sColor[1]) / step;
        bStep = (eColor[2] - sColor[2]) / step;

        var gradientColorArr = [];
        for (var i = 0; i < step; i++) {
            gradientColorArr.push(this._rgbToHex(parseInt(rStep * i + sColor[0]), parseInt(gStep * i + sColor[1]), parseInt(bStep * i + sColor[2])));
        }
        return gradientColorArr;
    },
    _handle: function () {

    },
    _setOption: function (key, value) {
        this._super(key, value);
        this.refresh();
    }
});


