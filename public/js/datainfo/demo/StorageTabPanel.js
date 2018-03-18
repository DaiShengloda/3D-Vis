// 只是展示所用，demo效果级别，需要从info中移值过来

var $StorageTabPanel = function (sceneManager) {
    $BaseServerTab.call(this, sceneManager);
    this.app = {};
    this.mainPane = $('<div></div>');
    this.storageBarBox = $('<div class="storageBarBox loadBox">' + it.util.i18n("StorageTab_Title") + '</div>');
    this.storagePieBox = $('<div class="storagePieBox loadBox"></div>');
    this.panelLoads = $(' <div class="panel loads"></div>');
    this.panelCup = $('<div class="panel cpus"></div>');
    this.pCupContent = $('<div class="content"></div>');
    this.init();
};

mono.extend($StorageTabPanel, $BaseServerTab, {
    init: function () {
        // var panelLoadHeader = $('<div class="header">磁盘信息</div>');
        // this.panelLoads.append(panelLoadHeader);
        // var plContent = $('<div class="content"></div>');
        // this.panelLoads.append(plContent);
        // this.mainPane.append(this.panelLoads);
        // this.mainPane.append(this.panelCup);
        // plContent.append(this.storageBarBox);
        // plContent.append(this.storagePieBox);
        // var btnClose = $('<a class="btnClose" style="float:right;padding-right:10px;cursor:pointer;color:#4d4d4d"></a>')
        // var close = $('<span class="icon iconfont icon-close nav-icon" title="Close"></span>');
        // btnClose.append(close);
        // panelLoadHeader.append(btnClose);
    },

    getTitle: function () {
        return it.util.i18n("StorageTab_Title");
    },

    getContentClass: function () {
        return 'storage';
    },

    setData: function (data) {
        // this.resetLoadPanel();
    },

    getContentPanel: function () {
        return this.mainPane;
    },

    afterShow: function () {
        this.resize();
    },

    resize: function () {
        var self = this;
        this.plContent = $('<div class="content" style="width:797px"></div>');
        this.plContent.append(this.storageBarBox);
        this.plContent.append(this.storagePieBox);
        document.body.append(this.plContent.get(0));
        this.resetStoragePanel();
        var app = this.app;
        this.getValue('storage', function (data) {

            var fixedDisk = [];
            var totalSize = 0;
            data.forEach(function (d) {
                if (d.hrStorageTypeDesc.name == 'hrStorageFixedDisk') {
                    fixedDisk.push(d);
                    totalSize += d.hrStorageSize;
                }
            })

            app.storageBarChartOption.yAxis.data = [];
            app.storageBarChartOption.series[0].data = [];
            app.storageBarChartOption.series[1].data = [];

            app.storagePieChartOption.legend.data = [];
            app.storagePieChartOption.series[0].data = [];
            app.storagePieChartOption.totalSize = totalSize;
            fixedDisk.forEach(function (d) {
                    app.storageBarChartOption.yAxis.data.push(d.hrStorageName);
                    app.storageBarChartOption.series[0].data.push(d.hrStorageUsed);
                    app.storageBarChartOption.series[1].data.push(d.hrStorageUnused);

                    app.storagePieChartOption.legend.data.push(d.hrStorageName);
                    app.storagePieChartOption.series[0].data.push({
                        name: d.hrStorageName,
                        value: d.hrStorageSize
                    })
                })
                //app.storageBarChart.setOption(app.storageBarChartOption, true);

            //app.storagePieChart.setOption(app.storagePieChartOption, true);
        });

        this.plContent.dialog({
            blackStyle: true,
            resize: false,
            title: it.util.i18n("StorageTab_Title"),
            height: 450,
            width: 850,
            closeOnEscape: true,
            show: { effect: 'move&scale', origin: ["middle", "center"], start: '#diskInfo' },
            hide: { effect: 'move&scale', origin: ["middle", "center"], start: '#diskInfo' },
            autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
            resizable: false, //设置是否可拉动弹窗的大小，默认为true
            modal: false, //是否有遮罩模型
        });
    },

    resetStoragePanel: function () {
        var app = this.app;
        app.storageBarChart = echarts.init($('.storageBarBox')[0]);
        app.storageBarChartOption = {
            title: {
                text: it.util.i18n("StorageTab_Space_Occupation"),
                left: '3%',
                //top: '10%',
                textStyle: {
                    color: '#d6d6d6',
                    fontSize: 16,
                    fontWeight: 'normal'
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                },
                formatter: function (params, ticket, callback) {
                    var tip = params[0].name +
                        '<br>' + it.util.i18n("Info_Allocate_space") + ' : ' + (params[0].value + params[1].value).toFixed(2) + 'GB' +
                        '<br>' + params[0].seriesName + ' : ' + params[0].value.toFixed(2) + 'GB' +
                        '<br>' + params[1].seriesName + ' : ' + params[1].value.toFixed(2) + 'GB' +
                        '<br>' + it.util.i18n("Info_In_ratio") + ' : ' + (params[0].value / (params[0].value + params[1].value) * 100).toFixed(2) + '%' +
                        ''
                    return tip;
                }
            },
            legend: {
                top: '12%',
                left: '3%',
                data: [
                    { name: it.util.i18n("Info_Used_space"), icon: 'rect' },
                    { name: it.util.i18n("Info_Available_space"), icon: 'rect' }
                ],
                textStyle: {
                    color: '#d6d6d6'
                },
                itemWidth: 16,
                itemHeight: 8,
                itemGap: 20
            },
            grid: {
                top: '30%',
                left: '1%',
                right: '8%',
                bottom: '1%',
                containLabel: true
            },
            xAxis: {
                type: 'value',
                axisLine: {
                    lineStyle: {
                        color: '#636363'
                    },
                },
                name: '(G)',
                nameTextStyle: {
                    color: '#d6d6d6'
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    textStyle: {
                        color: '#d6d6d6'
                    },
                },
                splitLine: {
                    lineStyle: {
                        color: '#454545'
                    }
                }
            },
            yAxis: {
                type: 'category',
                data: ['C', 'D', 'E'],
                axisLine: {
                    lineStyle: {
                        color: '#636363'
                    }
                },
                //name: it.util.i18n("Info_Disk"),
                axisTick: {
                    show: false
                },
                axisLabel: {
                    textStyle: {
                        color: '#d6d6d6'
                    },
                }
            },
            series: [{
                    name: it.util.i18n("Info_Used_space"),
                    type: 'bar',
                    stack: it.util.i18n("Info_Full"),
                    label: {
                        normal: {
                            show: true,
                            position: 'inside',
                            formatter: function (params) {
                                return params.value.toFixed(2) + 'G';
                            }
                        }
                    },
                    data: [62, 172.3, 54.6],
                    itemStyle: {
                        normal: {
                            color: '#496daa'
                        }
                    }
                },
                {
                    name: it.util.i18n("Info_Available_space"),
                    type: 'bar',
                    stack: it.util.i18n("Info_Full"),
                    label: {
                        normal: {
                            show: true,
                            position: 'inside',
                            formatter: function (params) {
                                return params.value.toFixed(2) + 'G';
                            }
                        }
                    },
                    data: [91, 386, 480],
                    itemStyle: {
                        normal: {
                            color: '#00cca7'
                        }
                    }
                },
            ]
        };
        app.storageBarChart.setOption(app.storageBarChartOption, true);

        app.storagePieChart = echarts.init($('.storagePieBox')[0]);
        app.storagePieChartOption = {
            totalSize: 0,
            title: {
                text: it.util.i18n("Info_Space_distribute"),
                //                subtext: '纯属虚构',
                left: '1%',
                //top: '10%',
                textStyle: {
                    color: '#d6d6d6',
                    fontSize: 16,
                    fontWeight: 'normal'
                }
            },
            tooltip: {
                trigger: 'item',
                formatter: function (params) {
                    var tip = params.name +
                        "<br>" + it.util.i18n("Info_Allocate_space") + " : " + params.value.toFixed(2) + "GB" +
                        "<br>" + it.util.i18n("Info_Full_space") + " : " + app.storagePieChartOption.totalSize.toFixed(2) + "GB" +
                        "<br>" + it.util.i18n("Info_Allocate_ratio") + " : " + params.percent + "%" +
                        '';
                    return tip;
                }
            },
            color: ['#f28c00', '#496daa', '#00cca7'],
            legend: {
                //orient: 'vertical',
                top: '12%',
                left: '1%',
                data: [
                    { name: it.util.i18n("StorageTab_C_Disk"), icon: 'rect' },
                    { name: it.util.i18n("StorageTab_D_Disk"), icon: 'rect' },
                    { name: it.util.i18n("StorageTab_E_Disk"), icon: 'rect' }
                ],
                textStyle: {
                    color: '#d6d6d6'
                },
                itemWidth: 16,
                itemHeight: 8,
                itemGap: 20
            },
            series: [{
                name: it.util.i18n("Info_Space_distribute"),
                type: 'pie',
                radius: '55%',
                center: ['50%', '60%'],
                data: [
                    { value: 153, name: it.util.i18n("StorageTab_C_Disk") },
                    { value: 558.3, name: it.util.i18n("StorageTab_D_Disk") },
                    { value: 534.6, name: it.util.i18n("StorageTab_E_Disk") },
                ],
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        }
        app.storagePieChart.setOption(app.storagePieChartOption);
    },

    show: function () {
        this.resize();
        this.plContent.dialog('open');
        this.plContent.dialog({
            close: function (e) {
                // 1、 e:事件对象
                // 2、 ui:封装对象
                // 3、 this:表示对话框元素
                $(this).remove();
            }
        });
        this.plContent.parent().find('.ui-dialog-titlebar-close').on('click', function (e) {
            main.panelMgr.instanceMap.NavBarMgr.$box.nav('clickNavIcon', 'diskInfo');
        });
    },

    hide: function () {
        if (this.plContent && this.plContent.hasClass("ui-dialog-content")) {
            this.plContent.dialog('close');
        }
    }

})
it.StorageTabPanel = $StorageTabPanel;