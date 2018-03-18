
// 只是展示所用，demo效果级别，需要从info中移值过来

var $NewTabPanel = function(sceneManager){
	$BaseServerTab.call(this,sceneManager);
	this.app = {};
	this.mainPane = $('<div></div>');
	this.cpuLoadBox = $('<div class="cpuLoadBox loadBox"></div>');
	this.memLoadBox = $('<div class="memLoadBox loadBox"></div>');

    this.calicheLoadBox = $('<div class="calicheLoadBox loadBox"></div>');
    this.flowLoadBox = $('<div class="flowLoadBox loadBox"><h1>HELLO</h1></div>');

	this.panelLoads = $(' <div class="panel loads"></div>');
	this.panelCup = $('<div class="panel cpus"></div>');
	this.pCupContent =  $('<div class="content"></div>');
	this.init();
};

mono.extend($NewTabPanel,$BaseServerTab,{

	init : function(){
		var panelLoadHeader = $('<div class="header">'+it.util.i18n("DeviceOn_Device")+it.util.i18n("LoadTabPanel_Load_status")+'</div>');
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

        var tr1 = $('<tr></tr>');
        var td3 = $('<td></td>');
		td3.append(this.calicheLoadBox);
		tr1.append(td3);
		var td4 = $('<td></td>');
		td4.append(this.flowLoadBox);
        tr1.append(td4);
        
		table.append(tr);
        table.append(tr1);
		plContent.append(table);

		//var panelCupHeader = $('<div class="header">'+it.util.i18n("LoadTabPanel_One_load_status")+'</div>');
		//this.panelCup.append(panelCupHeader);
        //this.panelCup.append(this.pCupContent);

        this.mainPane.append(this.panelLoads);
        this.mainPane.append(this.panelCup);
	},

	getTitle : function(){
		return it.util.i18n("LoadTabPanel_Load_status");
	},

    getContentClass : function(){
    	return 'loadPanel';
    },

    setData : function(data){
    	// this.resetLoadPanel();
    },

    getContentPanel : function(){
    	return this.mainPane;
    },

    afterShow : function(){
    	this.resize();
    },

    resize : function(){
    	this.resetLoadPanel();
    	//app.cpuLoadChart.showLoading();
        var app = this.app;
        app.calicheLoadOption.series[0].data[0].value = 55.00;
        app.calicheLoadChart.setOption(app.calicheLoadOption, true);
        app.flowLoadOption.series[0].data[0].value = 87.00;
        app.flowLoadChart.setOption(app.flowLoadOption, true);
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
       // this.getValue('cpus', function (data) {

          //  app.cpuLoadCharts.forEach(function (chart) {
          //      chart.dispose();
          //  });
          //  app.cpuLoadCharts = [];
          //  $('.cpusLoadBox').remove();
         //   data.forEach(function (d) {
         //       var box = $('<div class="cpusLoadBox"></div>').appendTo('.loadPanel .cpus .content');
         //       app.cpusLoadOption.series[0].data[0].value = d.value;
        //        var chart = echarts.init(box[0]);
        //        chart.setOption($.extend({}, app.cpusLoadOption), true);
        //        app.cpuLoadCharts.push(chart)
      //      })
       // });
    },

    resetLoadPanel: function () {
        var app = this.app;
        app.cpuLoadChart = echarts.init($('.cpuLoadBox')[0]);
        app.memLoadChart = echarts.init($('.memLoadBox')[0]);
        app.calicheLoadChart = echarts.init($('.calicheLoadBox')[0]);
        app.flowLoadChart = echarts.init($('.flowLoadBox')[0]);
        app.cpuLoadCharts = [];

        app.calicheLoadOption = {
            tooltip: {
                formatter: function () {
                    var tip = "CLC" + ' : ' + "55" + '%' +
                        '<br>' + it.util.i18n("LoadTabPanel_MAX_read")+' : ' + "500" + 'MB' +
                        '<br>' + it.util.i18n("LoadTabPanel_denote")+' : ' + "230" + 'MB' 
                    return tip;
                }
            },
            series: [
                {
                    title: {
                        offsetCenter: [0, '-30%']
                    },
                    pointer: {
                        length: '50%',
                        width: 5,
                    },
                    name: 'CLC',
                    type: 'gauge',
                    detail: {formatter: '55%', offsetCenter: [0, '80%']},
                    data: [{value: 0, name: 'CLC'}]
                }
            ]
        };
        app.flowLoadOption = {
            tooltip: {
                formatter: function () {
                    var tip = "FLOW" + ' : ' + "87" + '%' +
                        '<br>' + it.util.i18n("LoadTabPanel_MAX_flow")+' : ' + "1000" + 'kB/s' +
                        '<br>' + it.util.i18n("LoadTabPanel_denote")+' : ' + "19.8" + 'kB/s' 
                    return tip;
                }
            },
            series: [
                {
                    title: {
                        offsetCenter: [0, '-30%']
                    },
                    pointer: {
                        length: '50%',
                        width: 5,
                    },
                    name: 'FLOW',
                    type: 'gauge',
                    detail: {formatter: '87%', offsetCenter: [0, '80%']},
                    data: [{value: 0, name: 'FLOW'}]
                }
            ]
        };
        app.cpuLoadOption = {

            tooltip: {
                formatter: "{b} : {c}%"
            },
            series: [
                {
                    title: {
                        offsetCenter: [0, '-30%']
                    },
                    pointer: {
                        length: '50%',
                        width: 5,
                    },
                    name: 'CPU',
                    type: 'gauge',
                    detail: {formatter: '{value}%', offsetCenter: [0, '80%']},
                    data: [{value: 0, name: 'CPU'}]
                }
            ]
        };
        app.memLoadOption = {
            tooltip: {
                formatter: function (params) {
                    var tip = params.name + ' : ' + params.value.toFixed(2) + '%' +
                        '<br>' + it.util.i18n("LoadTabPanel_All_space")+' : ' + app.memLoadOption.hrStorageSize.toFixed(2) + 'GB' +
                        '<br>' + it.util.i18n("LoadTabPanel_Used")+' : ' + app.memLoadOption.hrStorageUsed.toFixed(2) + 'GB' +
                        '<br>' + it.util.i18n("LoadTabPanel_Un_used")+' : ' + app.memLoadOption.hrStorageUnused.toFixed(2) + 'GB';
                    return tip;
                }
            },
            series: [
                {
                    title: {
                        offsetCenter: [0, '-30%']
                    },
                    pointer: {
                        length: '50%',
                        width: 5,
                    },
                    name: 'MEM',
                    type: 'gauge',
                    detail: {formatter: '{value}%', offsetCenter: [0, '80%']},
                    data: [{value: 0, name: 'MEM'}]
                }
            ]
        };
        app.cpusLoadOption = {

            tooltip: {
                formatter: "{c}%"
            },
            series: [
                {
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
                    detail: {formatter: '{value}%', offsetCenter: [0, '100%'], textStyle: {fontSize: 15}},
                    data: [{value: 0}]
                }
            ]
        };
    }
});
it.NewTabPanel = $NewTabPanel;