it.Info = function (sceneManager, app) {
    this.sceneManager = sceneManager;
    var self = this;
    var app = this.app = app || {};
    app.type = app.type || 'windows';
    app.ip = app.ip || '192.168.1.168';
    app.version = app.version || '0';
    app.community = app.community || 'public';
    this.generalInfo = new $GeneralInfo(sceneManager);

    this.init();

    this.resetLoadPanel();
    this.refreshLoadPanel();
    this.refreshProcessPanel();
    this.resetStoragePanel();
    this.refreshInterfacesPanel();

    this.devPanelManager = new it.DevPanelManager(this.sceneManager);
    $('.panel2dBox').append($(this.devPanelManager.container));
    this.devPanelManager.container.style.display = 'block';


    //    setInterval(function () {
    //        self.refreshLoadPanel();
    //        self.refreshProcessPanel();
    //        self.refreshStoragePanel();
    //        self.refreshInterfacesPanel();
    //    }, 5000)
}

mono.extend(it.Info, Object, {

    init: function () {

        var self = this;
        var app = this.app;
        this.refreshBaseInfo();
        $('.serverPanel').dialog({
            resize: false,
            height: 700,
            width: 1000,
            closeOnEscape: true,
            show: false,
            hide: false,
            autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
            resizable: false, //设置是否可拉动弹窗的大小，默认为true
            modal: true, //是否有遮罩模型
            buttons: [{
                text: it.util.i18n("Info_Close"),
                click: function () {
                    $('.serverPanel').dialog('close');
                }
            }]
        });

        $("#tabs").tabs({
            activate: function (event, ui) {
                //console.log(event, ui);
                if (ui.newPanel.hasClass('baseInfo')) {

                } else if (ui.newPanel.hasClass('loadPanel')) {
                    app.cpuLoadChart.resize();
                    app.memLoadChart.resize();
                    app.cpuLoadCharts.forEach(function (chart) {
                        chart.resize();
                    })
                } else if (ui.newPanel.hasClass('storagePanel')) {
                    app.storageBarChart.resize();
                    app.storagePieChart.resize();
                } else if (ui.newPanel.hasClass('topologyPanel')) {
                    self.network.adjustBounds({
                        x: 0,
                        y: 0,
                        width: $('#tabs-6 .topo').width(),
                        height: $('#tabs-6 .topo').height()
                    });
                } else if (ui.newPanel.hasClass('panel2DInfo')) {
                    self.devPanelManager.adjustViewBounds($('.panel2dBox').width(), $('.panel2dBox').height(), 0, 0);
                } else if (ui.newPanel.hasClass('alarmPanel')) {
                    self.refreshAlarmPanel();
                }
            }
        });

        $('.updateConnInfoButton').on('click', function () {
            app.type = $('.baseInfo .access .type').val();
            app.ip = $('.baseInfo .access .ip').val();
            app.version = $('.baseInfo .access .version').val();
            app.community = $('.baseInfo .access .community').val();
            self.refreshBaseInfo();
        });

        this.network = new twaver.vector.Network();
        var box = this.box = this.network.getElementBox();
        $('#tabs-6 .topo').append(this.network.getView());
        this.network.adjustBounds({ x: 0, y: 0, width: $('#tabs-6 .topo').width(), height: $('#tabs-6 .topo').height() });
        var node1 = new twaver.Node();
        node1.setName('ESXI-122.23.23.11');
        node1.setLocation(400, 100);
        node1.setImageUrl("./images/element/pcImage.png");
        box.add(node1);


        var node21 = new twaver.Node();
        node21.setName('VM-192.168.1.200');
        node21.setImageUrl("./images/os/centos.png");
        node21.setLocation(100, 200);
        box.add(node21);

        var node22 = new twaver.Node();
        node22.setName('VM-192.168.1.201');
        node22.setImageUrl("./images/os/linux.png");
        node22.setLocation(300, 200);
        box.add(node22);

        var node23 = new twaver.Node();
        node23.setName('VM-192.168.1.202');
        node23.setImageUrl("./images/os/solaris.png");
        node23.setLocation(500, 200);
        box.add(node23);

        var node31 = new twaver.Node();
        node31.setName('Storage-192.168.1.100');
        node31.setLocation(100, 300);
        node31.setImageUrl("./images/link/SOWEB.png");
        box.add(node31);

        var node32 = new twaver.Node();
        node32.setName('Storage-192.168.1.101');
        node32.setLocation(500, 300);
        node32.setImageUrl("./images/link/SOWEB.png");
        box.add(node32);

        var node4 = new twaver.Node();
        node4.setName('Switch-192.168.1.254');
        node4.setImageUrl("./images/link/HAProxy.png")
        node4.setLocation(300, 400);
        box.add(node4);


        box.add(new twaver.Link(node1, node21));
        box.add(new twaver.Link(node1, node22));
        box.add(new twaver.Link(node1, node23));
        box.add(new twaver.Link(node1, node31));
        box.add(new twaver.Link(node1, node32));
        box.add(new twaver.Link(node1, node4));

        box.add(new twaver.Link(node4, node21));
        box.add(new twaver.Link(node4, node22));
        box.add(new twaver.Link(node4, node23));

        box.add(new twaver.Link(node31, node4));
        box.add(new twaver.Link(node32, node4));
    },

    showInfoDialog: function (element, network, data, index) {
        this.data = data;
        this.add2DPanelTab(element, data);
        this.generalInfo.setData(data);
        $('.serverPanel').dialog('open');
        //由于width用的是%,非的展开后才会计算,随意tab的click中得加上判断
        this.devPanelManager.adjustViewBounds($('.panel2dBox').width(), $('.panel2dBox').height(), 0, 0);
        // 这个network是tab6中的
        this.network.adjustBounds({ x: 0, y: 0, width: $('#tabs-6 .topo').width(), height: $('#tabs-6 .topo').height() });

        setTimeout(function () {
            $("#tabs").tabs({ active: index });
        }, 0)
    },

    getValue: function (indicate, callback) {

        var data = {
            ip: this.app.ip,
            type: this.app.type,
            version: this.app.version,
            community: this.app.community,
            indicate: indicate
        };
        ServerUtil.api('info', 'getValue', data, callback)
    },

    refreshBaseInfo: function () {
        this.getValue('baseInfo', function (data) {
            for (var p in data) {
                $('.baseInfo .' + p).val(data[p]);
            }
        });
    },

    resetLoadPanel: function () {
        var app = this.app;
        app.cpuLoadChart = echarts.init($('.cpuLoadBox')[0]);
        app.memLoadChart = echarts.init($('.memLoadBox')[0]);
        app.cpuLoadCharts = [];

        app.cpuLoadOption = {

            tooltip: {
                formatter: "{b} : {c}%"
            },
            series: [{
                title: {
                    offsetCenter: [0, '-30%']
                },
                pointer: {
                    length: '50%',
                    width: 5,
                },
                name: 'CPU',
                type: 'gauge',
                detail: { formatter: '{value}%', offsetCenter: [0, '80%'] },
                data: [{ value: 0, name: 'CPU' }]
            }]
        };
        app.memLoadOption = {
            tooltip: {
                formatter: function (params) {
                    var tip = params.name + ' : ' + params.value.toFixed(2) + '%' +
                        '<br>' + it.util.i18n("Info_All_space") + ' : ' + app.memLoadOption.hrStorageSize.toFixed(2) + 'GB' +
                        '<br>' + it.util.i18n("Info_Used") + ' : ' + app.memLoadOption.hrStorageUsed.toFixed(2) + 'GB' +
                        '<br>' + it.util.i18n("Info_UnUsed") + ' : ' + app.memLoadOption.hrStorageUnused.toFixed(2) + 'GB';
                    return tip;
                }
            },
            series: [{
                title: {
                    offsetCenter: [0, '-30%']
                },
                pointer: {
                    length: '50%',
                    width: 5,
                },
                name: 'MEM',
                type: 'gauge',
                detail: { formatter: '{value}%', offsetCenter: [0, '80%'] },
                data: [{ value: 0, name: 'MEM' }]
            }]
        };
        app.cpusLoadOption = {

            tooltip: {
                formatter: "{c}%"
            },
            series: [{
                splitNumber: 4,
                axisLine: {
                    lineStyle: {
                        width: 5
                    }
                },
                splitLine: {
                    length: 2,
                },
                pointer: {
                    length: '40%',
                    width: 2,
                },
                title: {
                    show: false,
                },
                name: 'CPU',
                type: 'gauge',
                detail: { formatter: '{value}%', offsetCenter: [0, '100%'], textStyle: { fontSize: 15 } },
                data: [{ value: 0 }]
            }]
        };
    },

    refreshLoadPanel: function () {

        //app.cpuLoadChart.showLoading();
        var app = this.app;
        this.getValue('cpu', function (data) {
            app.cpuLoadOption.series[0].data[0].value = data.value.toFixed(2);
            app.cpuLoadChart.setOption(app.cpuLoadOption, true);
            //app.cpuLoadChart.hideLoading();
        });
        //app.memLoadChart.showLoading();
        this.getValue('memInfo', function (data) {
            app.memLoadOption.series[0].data[0].value = data.hrStorageUsedPercent;
            app.memLoadOption.hrStorageSize = data.hrStorageSize;
            app.memLoadOption.hrStorageUsed = data.hrStorageUsed;
            app.memLoadOption.hrStorageUnused = data.hrStorageUnused;
            app.memLoadChart.setOption(app.memLoadOption, true);
            //app.memLoadChart.hideLoading();
        });
        this.getValue('cpus', function (data) {

            app.cpuLoadCharts.forEach(function (chart) {
                chart.dispose();
            });
            app.cpuLoadCharts = [];
            $('.cpusLoadBox').remove();
            data.forEach(function (d) {
                var box = $('<div class="cpusLoadBox"></div>').appendTo('.loadPanel .cpus .content');
                app.cpusLoadOption.series[0].data[0].value = d.value;
                var chart = echarts.init(box[0]);
                chart.setOption($.extend({}, app.cpusLoadOption), true);
                app.cpuLoadCharts.push(chart)
            })
        });

    },

    resetStoragePanel: function () {

        var app = this.app;
        app.storageBarChart = echarts.init($('.storageBarBox')[0]);
        app.storageBarChartOption = {
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
                top: '5%',
                data: [it.util.i18n("Info_Used_space"), it.util.i18n("Info_Available_space")]
            },
            grid: {
                left: '1%',
                right: '1%',
                bottom: '1%',
                containLabel: true
            },
            xAxis: {
                type: 'value'
            },
            yAxis: {
                type: 'category',
                data: ['C' + it.util.i18n("Info_Disk"), 'D' + it.util.i18n("Info_Disk"), 'E' + it.util.i18n("Info_Disk")]
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
                    data: [320, 302, 301],
                    itemStyle: {
                        normal: {
                            color: '#6180a8'
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
                    data: [120, 132, 101],
                    itemStyle: {
                        normal: {
                            color: '#61d0a8'
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
                x: 'center',
                y: '10%',
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
            legend: {
                orient: 'vertical',
                top: '10$',
                left: '10%',
                //                data: ['C盘', 'D盘', 'E盘']
            },
            series: [{
                name: it.util.i18n("Info_Space_distribute"),
                type: 'pie',
                radius: '55%',
                center: ['50%', '60%'],
                //                    data: [
                //                        {value: 335, name: 'C盘'},
                //                        {value: 310, name: 'D盘'},
                //                        {value: 234, name: 'E盘'},
                //                    ],
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

    refreshStoragePanel: function () {

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
            app.storageBarChart.setOption(app.storageBarChartOption, true);

            app.storagePieChart.setOption(app.storagePieChartOption, true);
        });
    },

    refreshProcessPanel: function () {
        var app = this.app;
        this.getValue('process', function (data) {

            $('.processListBox tbody').empty();
            var totalMem = 0,
                totalCpu = 0;
            for (var i in data) {
                data[i].hrSWRunPerfCPU = Math.round(data[i].hrSWRunPerfCPU / 1024 / 1024 / 1024);
                var tr = $(' <tr>' +
                    '    <td class="pid hrSWRunIndex"></td>' +
                    '    <td class="name hrSWRunName">java.exe</td>' +
                    '    <td class="path hrSWRunPath"></td>' +
                    '    <td class="params hrSWRunParameters"></td>' +
                    '    <td class="cpu hrSWRunPerfCPUPercent"></td>' +
                    '    <td class="mem hrSWRunPerfMemPercent"></td>' +
                    '</tr>').appendTo('.processListBox tbody');

                for (var p in data[i]) {
                    if (p == 'hrSWRunPerfMemPercent') {
                        totalMem += data[i][p];
                        data[i][p] = data[i][p].toFixed(2) + '%';
                    } else if (p == 'hrSWRunPerfCPUPercent') {
                        if (data[i]['hrSWRunName'] != 'System Idle Process') {
                            totalCpu += data[i][p];
                        }
                        data[i][p] = data[i][p].toFixed(2) + '%';
                    }
                    tr.find(' .' + p).text(data[i][p]);
                    tr.find(' .' + p).attr('title', data[i][p]);
                }
            }
            //            console.log('totalCpu = ' + totalCpu.toFixed(2) + '   ' + 'totalMem = ' + totalMem.toFixed(2));
        });
    },

    refreshInterfacesPanel: function () {
        var app = this.app;
        this.getValue('interfaces', function (data) {

            $('.interfacesBox tbody').empty();
            for (var i in data) {
                var tr = $(' <tr>' +
                    '    <td class="ifIndex"></td>' +
                    '    <td class="ifDescr"></td>' +
                    '    <td class="ifType"></td>' +
                    '    <td class="ifMtu"></td>' +
                    '    <td class="ifSpeed"></td>' +
                    '    <td class="ifPhysAddress"></td>' +
                    '    <td class="ifStatus"></td>' +
                    '    <td class="ifOctetsSpeed"></td>' +
                    '    <td class="ifSpeedUtilization"></td>' +
                    '    <td class="ifDiscardsRate"></td>' +
                    '    <td class="ifErrorsRate"></td>' +
                    '</tr>').appendTo('.interfacesBox tbody');

                for (var p in data[i]) {
                    if (data[i][p] == undefined || data[i][p] == null) {
                        data[i][p] = '';
                    } else if (p == 'ifSpeedUtilization' || p == 'ifOctetsSpeed' || p == 'ifDiscardsRate' || p == 'ifErrorsRate') {
                        data[i][p] = data[i][p].toFixed(2);
                    }
                    tr.find(' .' + p).text(data[i][p]);
                    tr.find(' .' + p).attr('title', data[i][p]);
                }
            }
        });
    },

    refreshAlarmPanel: function () {
        var tbody = $('.alarmBox tbody');
        tbody.empty();
        if (!this.data) {
            return;
        }
        var self = this;
        it.util.api('alarm', 'search', { dataId: this.data.getId() }, function (alarms) {
            alarms.forEach(function (alarm, i) {
                var tr = $(' <tr>' +
                    '    <td class="dataId"></td>' +
                    '    <td class="name"></td>' +
                    '    <td class="dataTypeId"></td>' +
                    '    <td class="alarmTypeId"></td>' +
                    '    <td class="time"></td>' +
                    '    <td class="status"></td>' +
                    '    <td class="level"></td>' +
                    '    <td class="description"></td>' +
                    '</tr>').appendTo(tbody);
                //alarm.name = self.data.getName();
                alarm.name = self.data.getId();
                alarm.dataTypeId = self.data.getDataTypeId();
                alarm.status = alarm.ackTime ? it.util.i18n("Info_Confirmed") : it.util.i18n("Info_Not_Confirm");
                alarm.level = it.AlarmSeverity.getByValue(alarm.level).name;
                alarm.time = moment(alarm.time).format('YYYY-MM-DD HH:mm:ss');
                for (var p in alarm) {
                    tr.find('.' + p).text(alarm[p]);
                }
                if (i % 2 == 1) {
                    tr.css('background-color', '#bcd')
                }
            })
        })
    },

    add2DPanelTab: function (element, data) {
        this.devPanelManager.loadData(data);
    }

})