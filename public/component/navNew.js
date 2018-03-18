(function ($) {
    var index = 0;
    $.widget("hud.navNew", {
        options: {
            items: [{
                    id: 'sousuo',
                    title: '搜索',
                    class: 'icon-search',
                    sceneId: 'dataCenter,floor',
                    appId: 'IT_SEARCH',
                },
                {
                    id: 'tianjiazichan',
                    title: ' 添加资产',
                    class: 'icon-plus-rectangle',
                    sceneId: 'floor',
                    appId: 'ASSETON',
                },
                {
                    id: 'peixian',
                    title: '配线',
                    class: 'icon-link',
                    sceneId: 'floor',
                    appId: 'LINKSEARCH',
                },
                {
                    id: 'huanjing',
                    title: '环境',
                    class: 'icon-envira',
                    sceneId: 'floor',
                    items: [{
                            id: 'wendu',
                            title: '温度云图',
                            class: 'icon-thermometer',
                            appId: 'TEMP',
                        },
                        {
                            id: 'shidu',
                            title: '温/湿度',
                            class: 'icon-humidity',
                            appId: 'TEMPANDHUM',
                        },
                        {
                            id: 'loushuijiance',
                            title: '漏水检测',
                            class: 'icon-water-leak',
                            appId: 'WATERLEAK'
                        },
                        {
                            id: 'fengxian',
                            title: '风向',
                            class: 'icon-air-flow',
                            appId: 'AIRFLOW'
                        },
                        {
                            id: 'fengxian',
                            title: '风向',
                            class: 'icon-air-flow',
                            appId: 'AIRFLOW'
                        },
                        {
                            id: 'yanwu',
                            title: '烟雾',
                            class: 'icon-smoke',
                            appId: 'SMOKE'
                        }
                    ]
                },
                {
                    id: 'rongliang',
                    title: ' 容量',
                    class: 'icon-capacity',
                    sceneId: 'floor',
                    items: [{
                            id: 'gonglvtongji',
                            title: '功率统计',
                            class: 'icon-power',
                            appId: 'POWER'
                        },
                        {
                            id: 'chengzhong',
                            title: '承重',
                            class: 'icon-weight',
                            appId: 'WEIGHT'
                        },
                        // {
                        //     id: 'jiweitongji',
                        //     title: '机位统计',
                        //     class: 'icon-point-cube',
                        //     appId: 'SEAT',
                        //     paramaters: 1,
                        // },
                        {
                            id: 'kongjianliyonglv',
                            title: '空间可用率',
                            class: 'icon-space-cube',
                            appId: 'SPACE_SEARCH',
                        },
                        {
                            id: 'weizhichaxun',
                            title: '位置查询',
                            class: 'icon-point-search',
                            appId: 'U_SEARCH'
                        }
                    ]
                },
                {
                    id: 'xunhang',
                    title: '巡航',
                    class: 'icon-cruise',
                    sceneId: 'dataCenter,floor',
                    appId: 'CAMERA_ANIMATE'
                },
            ],

            width: 600,

            liWidth: 70,
            circleWidth: 200,
            
            animateTime: 200,
        },

        _create: function () {
            this.currentAppId = null;
            this.refresh('floor');

        },

        // 根据传入的sceneId来刷新界面
        refresh: function (sceneId) {
            var self = this;
            var il = this.options.items.length;
            var el = this.element;
            this.empty();
            this.currentAllAppBox = {};
            for (var i = 0; i < il; i++) {
                var itemSceneId = this.options.items[i].sceneId;
                var itemSceneIdArray;
                if (itemSceneId.indexOf(',') > -1) {
                    itemSceneIdArray = itemSceneId.split(',');
                } else {
                    itemSceneIdArray = [itemSceneId];
                }
                if (itemSceneIdArray.indexOf(sceneId) > -1) {
                    var iconOut = $('<span>').addClass('icon-out').attr('app-name', this.options.items[i].id).appendTo(this.element);
                    iconOut.css({
                        'width': this.options.liWidth,
                    })
                    var icon = $('<span>').addClass('iconfont ' + this.options.items[i].class).appendTo(iconOut);
                    if (this.options.items[i].items && this.options.items[i].items.length > 0) {
                        var circleBoxOut = $('<div>').addClass('circleBoxOut ' + this.options.items[i].id).appendTo(this.element);
                        var circleBox = $('<div>').addClass('circleBox').appendTo(circleBoxOut);
                        iconOut.addClass('circle-icon');
                        circleBoxOut.css({
                            'position': 'absolute',
                            'width': this.options.circleWidth,
                            'height': this.options.circleWidth / 2,
                            'top': -1 * this.options.circleWidth / 2,
                            'left': (i + 0.5) * this.options.liWidth - this.options.circleWidth / 2,
                        })
                        circleBox.css({
                            'position': 'absolute',
                            'width': this.options.circleWidth,
                            'height': this.options.circleWidth,
                            'top': 0,
                            'left': 0,
                        })
                        var cl = this.options.items[i].items.length;
                        var cAngle = 180 / cl;
                        for (var j = 0; j < cl; j++) {
                            var circle1 = $('<div>').addClass('circle-1').appendTo(circleBox);
                            var circle2 = $('<div>').addClass('circle-2').appendTo(circle1);
                            var circleIcon = $('<div>').addClass('iconfont ' + this.options.items[i].items[j].class).appendTo(circle2);
                            circle1.css({
                                'transform': 'rotate(' + j * cAngle + 'deg) skew(' + (90 - cAngle + 0) + 'deg)',
                            })
                            circle2.css({
                                'transform': 'skew(' + (cAngle - 90) + 'deg) rotate(' + (cAngle / 2 - 90) + 'deg)',
                            })
                            circleIcon.css({
                                'transform': 'rotate(' + (90 - cAngle / 2 - j * cAngle) + 'deg)',
                            })
                            circle1.attr('app-id', this.options.items[i].items[j].appId);
                            circle1.attr('app-name', this.options.items[i].items[j].id);
                            this.currentAllAppBox[this.options.items[i].items[j].appId] = {
                                id: this.options.items[i].appId,
                                iconView: circle1,
                            };
                        }
                    } else {
                        var appId = this.options.items[i].appId;
                        iconOut.attr('app-id', appId);
                        this.currentAllAppBox[appId] = {
                            id: appId,
                            iconView: iconOut,
                        };
                        if(this.currentAppId == appId){
                            iconOut.addClass('active');
                        }
                    }
                }
            }

            this.isInAnimate = false;

            this._on(this.element, {
                // 控制一级菜单
                "click .icon-out": function (e) {
                    if (self.isInAnimate) {
                        return;
                    }
                    // console.log(e.currentTarget);
                    var iconOut = $(e.currentTarget);

                    if (iconOut.hasClass('active')) {
                        // 点的active的一级icon
                        if (iconOut.hasClass('circle-icon')) {
                            this.closeCircleWithAnimate(iconOut);
                            console.log('关闭二级菜单。如果开启了此菜单里面的app，则同时关闭app');
                            if (this.currentAppId) {
                                if (this.ifHasFatherSonRelationship(iconOut.attr('app-id'), this.currentAppId)) {
                                    this.closeApp();
                                } else {
                                    this.currentAllAppBox[this.currentAppId].iconView.addClass('active');
                                }
                            }
                        } else {
                            console.log('关闭一级图标。同时关闭app');
                            this.currentAppId = null;
                        }
                        iconOut.removeClass('active');
                    } else {
                        // 点的非active的一级icon
                        if (iconOut.siblings().hasClass('circle-icon active')) {
                            this.closeCircleWithoutAnimate(iconOut);
                        } else {
                            iconOut.siblings().removeClass('active');
                        }
                        if (iconOut.hasClass('circle-icon')) {
                            console.log('打开二级菜单');
                            this.openCircleWithAnimate(iconOut);
                        } else {
                            console.log('选中一级图标。同时关闭app');
                            this.closeApp();
                            this.currentAppId = iconOut.attr('app-id');
                        }
                        iconOut.addClass('active');
                    }
                },

                // 控制二级菜单
                "click .circle-1": function (e) {
                    if (self.isInAnimate) {
                        return;
                    }
                    var iconIn = $(e.currentTarget);
                    if (iconIn.hasClass('active')) {
                        console.log('取消选中二级图标。同时关闭app');
                        this.closeApp();
                    } else {
                        console.log('选中二级图标，关闭其余app。同时开启app');
                        this.openApp(iconIn.attr('app-id'));
                    }
                },
            });
        },

        openCircleWithAnimate: function (iconOut) {
            var self = this;
            var el = this.element;
            this.isInAnimate = true;
            el.find('.circleBoxOut.' + iconOut.attr('app-name')).addClass('active').stop().animate({
                'left': '+=' + self.options.liWidth,
            }, self.options.animateTime, 'linear', function () {
                self.isInAnimate = false;
            });
            iconOut.stop().animate({
                'margin-left': self.options.liWidth,
                'margin-right': self.options.liWidth,
            }, self.options.animateTime, 'linear')
            el.stop().animate({
                'left': '-=' + self.options.liWidth,
            }, self.options.animateTime, 'linear');
        },

        closeCircleWithAnimate: function (iconOut) {
            var self = this;
            var el = this.element;
            this.isInAnimate = true;
            el.find('.circleBoxOut.active').removeClass('active').stop().animate({
                'left': '-=' + self.options.liWidth,
            }, self.options.animateTime, 'linear', function () {
                self.isInAnimate = false;
            });
            iconOut.removeClass('active');
            iconOut.stop().animate({
                'margin-left': 0,
                'margin-right': 0,
            }, self.options.animateTime, 'linear');
            el.stop().animate({
                'left': '+=' + self.options.liWidth,
            }, self.options.animateTime, 'linear');
        },

        closeCircleWithoutAnimate: function (iconOut) {
            var self = this;
            var el = this.element;
            var activeCircleBoxOut = el.find('.circleBoxOut.active')
            var circleBoxOutLeft = parseInt(activeCircleBoxOut.css('left'));
            activeCircleBoxOut.css({
                'left': circleBoxOutLeft - self.options.liWidth,
            });
            iconOut.siblings().removeClass('active');
            iconOut.siblings().css({
                'margin-left': 0,
                'margin-right': 0,
            })
            var elLeft = parseInt(el.css('left'));
            el.css({
                'left': elLeft + self.options.liWidth,
            });
        },

        ifHasFatherSonRelationship: function (parentName, childName) {
            // var parentName = parent.attr('app-name');
            // var childName = child.attr('app-name');
            // this.options.items
            for (var i = 0; i < this.options.items.length; i++) {
                var item = this.options.items[i];
                if ((item.appId == parentName) && item.items) {
                    for (var j = 0; j < item.items.length; j++) {
                        var item2 = item.items[j];
                        if (item2.appId == childName) {
                            return true;
                        }
                    }
                    return false;
                }
            }
            return false;
        },

        openApp: function (id) {
            this.closeApp();
            this.currentAppId = id;
            this.currentAllAppBox[this.currentAppId].iconView.addClass('active');
        },

        closeApp: function () {
            if (this.currentAppId) {
                this.currentAllAppBox[this.currentAppId].iconView.removeClass('active');
                this.currentAppId = null;
            }
        },

        empty: function () {
            this.element.empty();
        },

    })
})(jQuery)