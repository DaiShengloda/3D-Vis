(function ($) {
    $.widget("hud.warningInfo", {
        // default options
        options: {
            items: [],
            alarmLevels: [{
                    name: '严重警告',
                    level: 'critical',
                    color: "rgba(255, 0, 0, 1)",
                    icon: 'warningInfo_gantanhao',
                    number: 0,
                },
                {
                    name: '重要警告',
                    level: 'major',
                    color: "rgba(250, 140, 0, 1)",
                    icon: 'warningInfo_gantanhao',
                    number: 0,
                },
                {
                    name: '次要警告',
                    level: 'minor',
                    color: "rgba(225, 225, 0, 1)",
                    icon: 'warningInfo_gantanhao',
                    number: 0,
                }
            ],
            mainTitles: [it.util.i18n("InitPropertyDialog_Current_Alarm"), it.util.i18n("InitPropertyDialog_Alarm_statistic")],
            warningClassify: [{
                label: '温度告警',
                type: 'temperature',
                number: 0,
                color: "rgba(0, 115, 170, 1)",
            }, {
                label: '湿度告警',
                type: 'humidity',
                number: 0,
                color: "rgba(0, 158, 236, 1)",
            }, {
                label: '漏水告警',
                type: 'waterLeak',
                number: 0,
                color: "rgba(100, 205, 247, 1)",
            }],
            btns: [{
                    label: '查看历史告警',
                    event: function () {
                        console.log('查看历史告警')
                    }
                },
                {
                    label: '告警负载设置',
                    event: function () {
                        console.log('告警负载设置')
                    }
                }
            ],
            currentBtns: [{
                    label: '查看当前告警',
                    event: function () {
                        console.log('查看当前告警')
                    }
                },
                {
                    label: '告警详细统计',
                    event: function () {
                        console.log('告警详细统计')
                    }
                }
            ],
            inited: false,
            selectedLevel: '',
            isSubed: false
        },
        _create: function () {
            var self = this;
            var mDiv = $('<div></div>').addClass("warningInfo").appendTo(self.element).on('selectstart', function () { return false; });;
            self.refresh();
            self._on(self.element, {
                "click .warningInfo_item": function (e) {
                    if (!self.options.inited) {
                        self.initWarningDetail();
                    }
                    self.options.selectedLevel = $(e.currentTarget).data('level');
                    $('.warningInfoDetail').warningInfoDetail('option', {
                        'selectedLevel': self.options.selectedLevel,
                    });
                    $('.warningInfoDetail').slideDown();
                    $('.warningInfo .bt-arrow').addClass('bt-arrow-open');

                    if ($(".assetInfo .bt-arrow").hasClass('bt-arrow-open')) {
                        $(".assetInfo .bt-arrow").removeClass('bt-arrow-open');
                        $(".assetInfo-content").slideUp();
                    }
                },
                "click .warningInfo-bt-box": function (e) {
                    $('.warningInfoDetail').slideToggle(200);
                    if (!self.options.inited) {
                        self.initWarningDetail();
                    }
                    $('.warningInfo-bt-box .bt-arrow').toggleClass('bt-arrow-open');
                    $('.warningInfoDetail').warningInfoDetail('option', {
                        'selectedLevel': ''
                    });

                    if ($(".assetInfo .bt-arrow").hasClass('bt-arrow-open')) {
                        $(".assetInfo .bt-arrow").removeClass('bt-arrow-open');
                        $(".assetInfo-content").slideUp();
                    }

                    setTimeout(function () {
                        var attr1 = $('.warningInfoDetail').css('display'),
                            attr2 = $('.assetInfo-content').css('display'),
                            attr3 = $('#itv-pdf-view').css('display'),
                            width = 0;
                        if (attr1 == 'none' && attr2 != 'none' && attr3 != 'none') {
                            width = $('.assetInfo-content').width() + $('#itv-pdf-view').width() || 0;
                        } else if (attr1 == 'none' && attr2 == 'none' && attr3 != 'none') {
                            width = $('#itv-pdf-view').width() || 0;
                        } else if (attr1 != 'none' && attr3 != 'none') {
                            width = $('.warningInfoDetail').width() + $('#itv-pdf-view').width() || 0;
                        } else if (attr1 != 'none' && attr3 == 'none') {
                            width = $('.assetInfo-content').width();
                        } else if (attr1 == 'none' && attr2 == 'none' && attr3 == 'none') {
                            width = 0;
                        }

                        $('.floor-box').css({
                            'right': width + 10
                        });
                    }, 300);


                },
            });
        },
        initWarningDetail: function () {
            var self = this;
            var nextDiv = $('<div></div>');
            nextDiv.insertAfter('.warningInfo');
            nextDiv.warningInfoDetail({
                alarmLevels: self.options.alarmLevels,
                mainTitles: self.options.mainTitles,
                warningClassify: self.options.warningClassify
            });
            nextDiv.warningInfoDetail('option', 'items', self.options.items);
            nextDiv.warningInfoDetail('option', 'btns', self.options.btns);
            nextDiv.warningInfoDetail('option', 'currentBtns', self.options.currentBtns);
            self.options.inited = true;
        },
        _createItem: function (alarmLevel) {
            var cls = 'warningInfo_' + alarmLevel.level + '_number';

            var width = this.options.alarmLevels.length;
            if (width == 0) {
                width == 1;
            }
            var $div = $('<div></div>')
                .attr('data-level', alarmLevel.level)
                .addClass('warningInfo_item')
                .css('width', 88 / width + '%');
            $div.html('<i class="' +
                alarmLevel.icon + '" style="background-color:' +
                alarmLevel.color + '">!</i><span class="' + cls + '">' +
                alarmLevel.number + '</span>');
            return $div;
        },

        _setOption: function (key, value) {
            this._super(key, value);
            if (key === "items") {
                this.refresh();
                $('.warningInfoDetail').warningInfoDetail('option', key, value);
            }
            if (key === 'btns') {
                $('.warningInfoDetail').warningInfoDetail('option', key, value);
            }

            if (key == 'currentBtns') {
                $('.warningInfoDetail').warningInfoDetail('option', key, value);
            }
        },

        _hanleItems: function () {
            var self = this;
            var items = this.options.items;
            self.options.alarmLevels.forEach(function (a) {
                a.number = 0;
            })
            items.forEach(function (c) {
                self.options.alarmLevels.forEach(function (a) {
                    if (a.level == c._alarmSeverity.name) {
                        a.number++;
                    }
                })
            });
        },

        refresh: function () {
            var self = this;
            self._hanleItems();
            var el = $('.warningInfo');
            el.empty();
            var alarmLevels = self.options.alarmLevels || [];
            alarmLevels.forEach(function (alarmLevel) {
                el.append(self._createItem(alarmLevel));
            })
            var $btArrowBox = $('<div class="warningInfo-bt-box"></div>').appendTo(el);
            var $iconBox = $('<div class="warningInfo-bt-box"></div>').appendTo(el);
            var icon = $('<span></span>')
                .addClass('bt-arrow')
                .appendTo($iconBox);
            $('.warningInfoDetail').warningInfoDetail('refresh');
        },

        itemChange: function (type, item) {
            var self = this;
            var level = item._alarmSeverity.name;
            var cls = 'warningInfo_' + level + '_number';
            var num = parseInt($('.' + cls).text());
            if (type == 'add') {
                for (var i = 0; i < self.options.items.length; i++) {
                    if (self.options.items[i].id == item._id) {
                        console.log('警告id:' + item.id + '已存在');
                        return;
                    }
                }
                self.options.items.push(item);
                num++;
            } else if (type == 'sub') {
                for (var i = 0; i < self.options.items.length; i++) {
                    if (self.options.items[i]._id == item._id) {
                        self.options.isSubed = true;
                        self.options.items.splice(i, 1);
                        num--;
                    }
                }
                if (!self.options.isSubed) {
                    console.log('找不到该警告id:' + item._id);
                    return;
                }
                self.options.isSubed = false;
            }
            $('.' + cls).text(num);
            $('.warningInfoDetail').warningInfoDetail('itemChange', type, item);

        },

        _destroy: function () {
            $('.warningInfo').remove();
            $('.warningInfoDetail').warningInfoDetail('destroy');
        },
    })
})(jQuery);

(function ($) {
    $.widget("hud.warningInfoDetail", {
        // default options
        options: {
            items: [],
            alarmLevels: [],
            mainTitles: [],
            btns: [],
            currentBtns: [],
            warningTotal: 1,
            warningClassify: [],
            selectedLevel: 'minor',
            oldSelectedLevel: '',
        },
        _create: function () {
            var self = this;
            this.element.addClass("warningInfoDetail").on('selectstart', function () { return false; });
            var i = 1;
            this.options.mainTitles.forEach(function (mainTitle) {
                var $warningInfoDetailItem = $('<div></div>')
                    .addClass('warningInfoDetailItem')
                    .addClass('warningInfoDetailItem_' + (i++))
                    .append('<div class="warningInfoDetailItem_title"><span>' + mainTitle + '</span></div>')
                    .append('<div class="warningInfoDetailItem_content"></div>')
                    .appendTo(self.element);
            });
            this._on(this.element, {
                "click .warningInfoDetailItem_cwt": function (e) {
                    var currentTarget = $(e.currentTarget);
                    var warningInfoDetailItem_cwc = currentTarget.parent().find('.warningInfoDetailItem_cwc');
                    self.options.oldSelectedLevel = self.options.selectedLevel;
                    self.options.selectedLevel = $(warningInfoDetailItem_cwc).data('level');
                    self._selectedLevelChange();
                }
            });
            this.refresh();
        },
        _createCWContent: function (alarmLevels) {
            var self = this;
            var warningInfoDetailItem_1 = $('.warningInfoDetailItem_1');
            var warningInfoDetailItem_content = warningInfoDetailItem_1.find('.warningInfoDetailItem_content');
            warningInfoDetailItem_content.empty();
            alarmLevels.forEach(function (alarmLevel) {
                warningInfoDetailItem_content.append(self._createCWContentItem(alarmLevel));
            });
            var currentWarningBtnDiv = $('<div></div>').addClass('currentWarningBtnDiv').appendTo(warningInfoDetailItem_content);
            self._creataMoreBtns(currentWarningBtnDiv, self.options.currentBtns)
        },
        _createCWContentItem: function (alarmLevel) {
            var $div = $('<div></div>');
            var $warningInfoDetailItem_cwt = $('<div></div>');
            $warningInfoDetailItem_cwt.addClass('warningInfoDetailItem_cwt');
            $div.append($warningInfoDetailItem_cwt);
            $warningInfoDetailItem_cwt.html('<i class="' +
                alarmLevel.icon + '" style="background-color:' +
                alarmLevel.color + '">!</i><span class="number warningInfoDetailItem_cwt_' +
                alarmLevel.level + '">' +
                alarmLevel.number + '</span><span class="text"> (' +
                alarmLevel.name + ')</span>');
            var $warningInfoDetailItem_cwc = $('<div></div>');
            $warningInfoDetailItem_cwc.addClass('warningInfoDetailItem_cwc');
            $warningInfoDetailItem_cwc.attr('data-level', alarmLevel.level);
            $div.append($warningInfoDetailItem_cwc);
            this._createCWContentItemWs($warningInfoDetailItem_cwc);
            return $div;
        },
        //获取该级别所有的告警
        _createCWContentItemWs: function (par) {
            var self = this;
            par.empty();
            var level = $(par).data('level');
            var warnings = [];
            this.options.items.sort(function (a, b) {
                var aDate = new Date(a._dateTime);
                var bDate = new Date(b._dateTime);
                if ((aDate - bDate) < 0) {
                    return 1;
                } else if ((aDate - bDate > 0)) {
                    return -1
                } else {
                    return 0
                }
            });
            this.options.items.forEach(function (item) {
                if (item._alarmSeverity.name == level) {
                    var warning = {};
                    warning.text = item._dataId + "," + item._description + "  " + it.Util.formateDateTime(item._dateTime);
                    warning.id = item._id;
                    warnings.push(warning);
                }
            });
            warnings.forEach(function (warning) {
                var p = $('<p></p>').text(warning.text).attr('title', warning.text).data('id', warning.id).appendTo(par);
            })
        },
        _creataWStaContent: function () {
            var self = this;
            var warningInfoDetailItem_2 = $('.warningInfoDetailItem_2');
            var warningInfoDetailItem_content = warningInfoDetailItem_2.find('.warningInfoDetailItem_content');
            warningInfoDetailItem_content.empty();
            var warningStatistic = $('<div></div>');
            warningStatistic.addClass('warningStatistic');
            var t = $('<p>' + it.util.i18n("InitPropertyDialog_30Days_Alarm") + '</p>');
            var bar = $('<div></div>');
            bar.addClass('bar');
            bar.addClass('clearfix');
            warningStatistic.append(t);
            warningStatistic.append(bar);
            var warningMore = $('<div></div>');
            warningMore.addClass('warningMore');
            warningInfoDetailItem_content.append(warningStatistic);
            warningInfoDetailItem_content.append(warningMore);
            self._createStatisticBar(bar);
            self._creataMoreBtns(warningMore, self.options.btns);
        },
        _createStatisticBar: function (p) {
            var self = this;
            p.empty();
            var warningClassify = this.options.warningClassify;
            var sum = 0;
            warningClassify.forEach(function (item) {
                sum += item['number'];
            });
            self.options.warningTotal = sum;
            if(!sum){
                var divBox = $('<div></div>').addClass('bar_item_box');
                var div = $('<div></div>').appendTo(divBox);
                div.addClass('bar_item');
                divBox.css({'width': '100%'});
                var c = $('<div></div>').appendTo(divBox).addClass('bar_item_label');
                c.html('<p>' + it.util.i18n("No_alarms") + '</p>');
                p.append(divBox);
            }
            warningClassify.forEach(function (w) {
                var per = Math.round((w.number / self.options.warningTotal * 100).toFixed(2));
                //如果告警数量为0 则不生成
                if (w.number == 0) {
                    return
                }
                var divBox = $('<div></div>').addClass('bar_item_box');
                var div = $('<div></div>').appendTo(divBox);
                
                div.addClass('bar_item');
                div.addClass('bar_item_' + w.type);
                divBox.css({
                    'width': (per ? per : 1) + '%'
                });
                div.css({
                    'background-color': w.color,
                })
                var c = $('<div></div>').appendTo(divBox).addClass('bar_item_label');
                c.html('<p>' + per + '%</p><p>' + w.label + '</p>');
                p.append(divBox);
            });
        },

        _creataMoreBtns: function (p, b) {
            p.empty();
            var btns = b;
            btns.forEach(function (c) {
                var span = $('<span></span>').text(c.label).appendTo(p).on('click', c.event);
            })
        },
        _selectedLevelChange: function () {
            var level = this.options.selectedLevel;
            var oldLevel = this.options.oldSelectedLevel;
            $('.warningInfoDetailItem_cwc').css('display', 'none');
            if (level && oldLevel != level) {
                $('.warningInfoDetailItem_cwc[data-level=' + level + ']').css('display', 'block');
            } else {
                this.options.oldSelectedLevel = '';
                this.options.selectedLevel = '';
            }
        },
        _hanleItems: function () {
            var self = this;
            var items = this.options.items;
            // this.options.warningTotal = items.length;
            self.options.alarmLevels.forEach(function (a) {
                    a.number = 0;
                })
                // self.options.warningClassify.forEach(function (a) {
                //     a.number = 0;
                // })
            items.forEach(function (c) {
                self.options.alarmLevels.forEach(function (a) {
                    if (a.level == c._alarmSeverity.name) {
                        a.number++;
                    }
                });
                // self.options.warningClassify.forEach(function (a) {
                //     if (a.type == c.alarmTypeId) {
                //         a.number++;
                //     }
                // })
            });
        },
        _setOption: function (key, value) {
            var self = this;
            this._super(key, value);
            if (key == 'selectedLevel') {
                this._selectedLevelChange();
            }
            if (key == 'items') {
                this.refresh();
            }
            if (key == 'btns') {
                this._creataMoreBtns($('.warningMore'), self.options.btns);
            }
            if (key == 'currentBtns') {
                this._creataMoreBtns($('.currentWarningBtnDiv'), self.options.currentBtns);
            }
        },
        refresh: function () {
            this._hanleItems();
            var alarmLevels = this.options.alarmLevels;
            this._createCWContent(alarmLevels);
            this._selectedLevelChange();
            this._creataWStaContent();
        },
        warningClassifyChange: function (datas) {
            this.options.warningClassify = datas;
            this._createStatisticBar($('.warningStatistic .bar'));
        },
        itemChange: function (type, item) {
            var self = this;
            var level = item._alarmSeverity.name;
            var cls = 'warningInfoDetailItem_cwt_' + level;
            var num = parseInt($('.' + cls).text());
            var cwc = $('.' + cls).parent().next();
            if (type == 'add') {
                num++;
                var p = $('<p></p>').text(item._dataId + ',' + item._description + ' ' + it.Util.formateDateTime(item._dateTime)).data('id', item._id).prependTo(cwc);
                self.options.warningTotal++;
                // self.options.warningClassify.forEach(function (c) {
                //     if (c.type == item.alarmTypeId) {
                //         c.number++;
                //     }
                // })
            } else if (type == 'sub') {
                num--;
                cwc.find('p').each(function (i, p) {
                    if ($(p).data('id') == item._id) {
                        $(p).remove();
                        // self.options.warningClassify.forEach(function (c) {
                        //     if (c.type == item.alarmTypeId) {
                        //         c.number--;
                        //         self.options.warningTotal--;
                        //     }
                        // })
                    }
                });

            }
            $('.' + cls).text(num);
            self._createStatisticBar($('.warningStatistic .bar'));
        },
        _destroy: function () {
            $('.warningInfoDetail').remove();
        },
    })
})(jQuery);