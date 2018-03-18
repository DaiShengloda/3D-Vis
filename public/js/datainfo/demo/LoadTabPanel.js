// 只是展示所用，demo效果级别，需要从info中移值过来

var $LoadTabPanel = function(sceneManager) {
    $BaseServerTab.call(this, sceneManager);
    this.app = {};
    this.mainPane = $('<div></div>');
    this.cpuLoadBox = $('<div class="cpuLoadBox loadBox"></div>');
    this.memLoadBox = $('<div class="memLoadBox loadBox"></div>');
    this.panelLoads = $(' <div class="panel loads"></div>');
    this.panelCup = $('<div class="panel cpus"></div>');
    this.pCupContent = $('<div class="content"></div>');
    this.init();
};

mono.extend($LoadTabPanel, $BaseServerTab, {

    init: function() {
        var panelLoadHeader = $('<div class="header">CPU / MEM' + it.util.i18n("LoadTabPanel_Load_status") + '</div>');
        this.panelLoads.append(panelLoadHeader);
        var plContent = $('<div class="content"></div>');
        this.panelLoads.append(plContent);
        var table = $('<table></table>');
        var tr = $('<tr></tr>');
        var td1 = $('<td></td>');
        td1.append(this.cpuLoadBox);
        tr.append(td1);
        var td2 = $('<td></td>');
        td2.append(this.memLoadBox);
        tr.append(td2);
        table.append(tr);
        plContent.append(table);

        var panelCupHeader = $('<div class="header">' + it.util.i18n("LoadTabPanel_One_load_status") + '</div>');
        this.panelCup.append(panelCupHeader);
        this.panelCup.append(this.pCupContent);

        this.mainPane.append(this.panelLoads);
        this.mainPane.append(this.panelCup);
    },

    getTitle: function() {
        return it.util.i18n("LoadTabPanel_Load_status");
    },

    getContentClass: function() {
        return 'loadPanel';
    },

    setData: function(data) {
        // this.resetLoadPanel();
    },

    getContentPanel: function() {
        return this.mainPane;
    },

    afterShow: function() {
        this.resize();
    },

    resize: function() {
        this.resetLoadPanel();
        var app = this.app;
        this.getValue('cpu', function(data) {
            app.cpuLoadOption.series[0].data[0].value = data.value.toFixed(2);
            app.cpuLoadChart.setOption(app.cpuLoadOption, true);
        });
        this.getValue('memInfo', function(data) {
            app.memLoadOption.series[0].data[0].value = data.hrStorageUsedPercent;
            app.memLoadOption.hrStorageSize = data.hrStorageSize;
            app.memLoadOption.hrStorageUsed = data.hrStorageUsed;
            app.memLoadOption.hrStorageUnused = data.hrStorageUnused;
            app.memLoadChart.setOption(app.memLoadOption, true);
        });
        this.getValue('cpus', function(data) {

            app.cpuLoadCharts.forEach(function(chart) {
                chart.dispose();
            });
            app.cpuLoadCharts = [];
            $('.cpusLoadBox').remove();
            data.forEach(function(d) {
                var box = $('<div class="cpusLoadBox"></div>').appendTo('.loadPanel .cpus .content');
                app.cpusLoadOption.series[0].data[0].value = d.value;
                var chart = echarts.init(box[0]);
                chart.setOption($.extend({}, app.cpusLoadOption), true);
                app.cpuLoadCharts.push(chart)
            })
        });
    },

    resetLoadPanel: function() {
        var app = this.app;
        app.cpuLoadChart = echarts.init($('.cpuLoadBox')[0]);
        app.memLoadChart = echarts.init($('.memLoadBox')[0]);
        app.cpuLoadCharts = [];

        app.cpuLoadOption = {
            backgroundColor: '#1b1b1b',
    tooltip : {
        formatter: "{c}%"
    },
    toolbox: {
        show : true,
        feature : {
            mark : {show: true},
            //restore : {show: true},
            saveAsImage : {show: true}
        }
    },
    series : [
        {
            name:'CPU',
            type:'gauge',
            min:0,
            max:100,
            splitNumber:10,
            radius: '90%',
            axisLine: {            // 坐标轴线
                lineStyle: {       // 属性lineStyle控制线条样式
                    color: [[0.09, 'lime'],[0.82, '#1e90ff'],[1, '#ff4500']],
                    width: 3,
                    shadowColor : '#fff', //默认透明
                    shadowBlur: 10
                }
            },
            axisLabel: {            // 坐标轴小标记
                textStyle: {       // 属性lineStyle控制线条样式
                    fontWeight: 'bolder',
                    color: '#fff',
                    shadowColor : '#fff', //默认透明
                    shadowBlur: 10
                }
            },
            axisTick: {            // 坐标轴小标记
                length :15,        // 属性length控制线长
                lineStyle: {       // 属性lineStyle控制线条样式
                    color: 'auto',
                    shadowColor : '#fff', //默认透明
                    shadowBlur: 10
                }
            },
            splitLine: {           // 分隔线
                length :25,         // 属性length控制线长
                lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                    width:3,
                    color: '#fff',
                    shadowColor : '#fff', //默认透明
                    shadowBlur: 10
                }
            },
            pointer: {           // 分隔线
                shadowColor : '#fff', //默认透明
                shadowBlur: 5
            },
            title : {
                textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                    fontWeight: 'bolder',
                    fontSize: 20,
                    fontStyle: 'italic',
                    color: '#fff',
                    shadowColor : '#fff', //默认透明
                    shadowBlur: 10
                }
            },
            detail : {
                backgroundColor: 'rgba(30,144,255,0.8)',
                borderWidth: 1,
                borderColor: '#fff',
                shadowColor : '#fff', //默认透明
                shadowBlur: 5,
                offsetCenter: [0, '80%'],       // x, y，单位px
                textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                    fontWeight: 'bolder',
                    color: '#fff'
                }
            },
            data:[{value: 0, name: 'CPU'}]
        }
         ]
        }
        app.memLoadOption = {
            backgroundColor: '#1b1b1b',
            tooltip: {
                formatter: function(params) {
                    var tip = params.name + ' : ' + params.value.toFixed(2) + '%' +
                        '<br>' + it.util.i18n("LoadTabPanel_All_space") + ' : ' + app.memLoadOption.hrStorageSize.toFixed(2) + 'GB' +
                        '<br>' + it.util.i18n("LoadTabPanel_Used") + ' : ' + app.memLoadOption.hrStorageUsed.toFixed(2) + 'GB' +
                        '<br>' + it.util.i18n("LoadTabPanel_Un_used") + ' : ' + app.memLoadOption.hrStorageUnused.toFixed(2) + 'GB';
                    return tip;
                }
            },
            toolbox: {
        show : true,
        feature : {
            mark : {show: true},
            //restore : {show: true},
            saveAsImage : {show: true}
        }
    },
    series : [
        {
            name:'MEM',
            type:'gauge',
            min:0,
            max:100,
            splitNumber:10,
            radius: '90%',
            axisLine: {            // 坐标轴线
                lineStyle: {       // 属性lineStyle控制线条样式
                    color: [[0.09, 'lime'],[0.82, '#1e90ff'],[1, '#ff4500']],
                    width: 3,
                    shadowColor : '#fff', //默认透明
                    shadowBlur: 10
                }
            },
            axisLabel: {            // 坐标轴小标记
                textStyle: {       // 属性lineStyle控制线条样式
                    fontWeight: 'bolder',
                    color: '#fff',
                    shadowColor : '#fff', //默认透明
                    shadowBlur: 10
                }
            },
            axisTick: {            // 坐标轴小标记
                length :15,        // 属性length控制线长
                lineStyle: {       // 属性lineStyle控制线条样式
                    color: 'auto',
                    shadowColor : '#fff', //默认透明
                    shadowBlur: 10
                }
            },
            splitLine: {           // 分隔线
                length :25,         // 属性length控制线长
                lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                    width:3,
                    color: '#fff',
                    shadowColor : '#fff', //默认透明
                    shadowBlur: 10
                }
            },
            pointer: {           // 分隔线
                shadowColor : '#fff', //默认透明
                shadowBlur: 5
            },
            title : {
                textStyle: {       // 其余属性默认使用全局文本样式
                    fontWeight: 'bolder',
                    fontSize: 20,
                    fontStyle: 'italic',
                    color: '#fff',
                    shadowColor : '#fff', //默认透明
                    shadowBlur: 10
                }
            },
            detail : {
                backgroundColor: 'rgba(30,144,255,0.8)',
                borderWidth: 1,
                borderColor: '#fff',
                shadowColor : '#fff', //默认透明
                shadowBlur: 5,
                offsetCenter: [0, '80%'],       // x, y，单位px
                textStyle: {       // 其余属性默认使用全局文本样式
                    fontWeight: 'bolder',
                    color: '#fff'
                }
            },
            data:[{value: 0, name: 'MEM'}]
        }
         ]
        };
        app.cpusLoadOption = {
            backgroundColor: '#1b1b1b',
            tooltip: {
                formatter: "{c}%"
            },
            toolbox: {
        show : true,
        feature : {
            mark : {show: true},
            //restore : {show: true},
            saveAsImage : {show: true}
        }
    },
            series : [
        {
            name:'CPU',
            type:'gauge',
            min:0,
            max:100,
            splitNumber:4,
            radius: '90%',
            axisLine: {            // 坐标轴线
                lineStyle: {       // 属性lineStyle控制线条样式
                    color: [[0.09, 'lime'],[0.82, '#1e90ff'],[1, '#ff4500']],
                    width: 5,
                    shadowColor : '#fff', //默认透明
                    shadowBlur: 10
                }
            },
            axisLabel: {            // 坐标轴小标记
                textStyle: {       // 属性lineStyle控制线条样式
                    fontWeight: 'bolder',
                    color: '#fff',
                    shadowColor : '#fff', //默认透明
                    shadowBlur: 10
                }
            },
            axisTick: {            // 坐标轴小标记
                length :5,        // 属性length控制线长
                lineStyle: {       // 属性lineStyle控制线条样式
                    color: 'auto',
                    shadowColor : '#fff', //默认透明
                    shadowBlur: 10
                }
            },
            splitLine: {           // 分隔线
                length :2,         // 属性length控制线长
                lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                    width:1,
                    color: '#fff',
                    shadowColor : '#fff', //默认透明
                    shadowBlur: 10
                }
            },
            pointer: {           // 分隔线
                length: '40%',
                width: 2,
                shadowColor : '#fff', //默认透明
                shadowBlur: 5
            },
            detail: { formatter: '{value}%', offsetCenter: [0, '70%'], textStyle: { fontSize: 15 } },
            data:[{value: 0, name: 'CPU'}]
        }
         ]
        };
    }

});
it.LoadTabPanel = $LoadTabPanel;