// 只是展示所用，demo效果级别，需要从info中移值过来

var $ProcessTabPanel = function(sceneManager) {
    $BaseServerTab.call(this, sceneManager);
    this.app = {};
    this.mainPane = $('<div></div>');
    this.cpuLoadBox = $('<div class="cpuLoadBox loadBox"></div>');
    this.memLoadBox = $('<div class="memLoadBox loadBox"></div>');
    this.panelLoads = $(' <div class="panel"></div>');
    this.panelCup = $('<div class="panel cpus"></div>');
    this.pCupContent = $('<div class="content"></div>');
    this.init();
};

mono.extend($ProcessTabPanel, $BaseServerTab, {

    init: function() {
        // var panelLoadHeader = $('<div class="header">进程列表</div>');
        // this.panelLoads.append(panelLoadHeader);
        // var plContent = $('<div class="content"></div>');
        // this.panelLoads.append(plContent);
        // var div = $('<div class = "processListBox"></div>')
        // var table = $('<table></table>');
        // var tbody = $('<tbody></tbody>');
        // plContent.append(table);
        // var thead = $('<thead></thead>')
        // var th = $('<tr>' +
        //     '<td class="pid hrSWRunIndex">PID</td>' +
        //     '<td class="name hrSWRunName">名称</td>' +
        //     '<td class="path hrSWRunPath">路径</td>' +
        //     '<td class="params hrSWRunParameters">参数</td>' +
        //     '<td class="cpu hrSWRunPerfCPUPercent">CPU</td>' +
        //     '<td class="mem hrSWRunPerfMemPercent">MEM</td>' +
        //     '</tr>');
        // thead.append(th);
        // this.mainPane.append(this.panelLoads);
        // this.mainPane.append(this.panelCup);
        // table.append(thead);
        // table.append(tbody);
        // div.append(table);
        // plContent.append(div);
    },

    getTitle: function() {
        return it.util.i18n("ProcessTab_Process_List");
    },

    getContentClass: function() {
        return 'process';
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
        this.refreshProcessPanel();
    },

    createTable: function() {
        // var panelLoadHeader = $('<div class="header">进程列表</div>');
        // this.panelLoads.append(panelLoadHeader);
        var plContent = $('<div class="processList"></div>');
        this.plContent = plContent;
        // this.panelLoads.append(plContent);
        var div = $('<div class = "processListBox"></div>')
        var table = $('<table></table>');
        var tbody = $('<tbody></tbody>');
        plContent.append(table);
        var thead = $('<thead></thead>')
        var th = $('<tr>' +
            '<td class="pid hrSWRunIndex">PID</td>' +
            '<td class="name hrSWRunName">'+it.util.i18n("ProcessTab_Name")+'</td>' +
            '<td class="path hrSWRunPath">'+it.util.i18n("ProcessTab_Path")+'</td>' +
            '<td class="params hrSWRunParameters">'+it.util.i18n("ProcessTab_Param")+'</td>' +
            '<td class="cpu hrSWRunPerfCPUPercent">CPU</td>' +
            '<td class="mem hrSWRunPerfMemPercent">MEM</td>' +
            '</tr>');
        thead.append(th);
        // this.mainPane.append(this.panelLoads);
        // this.mainPane.append(this.panelCup);
        table.append(thead);
        table.append(tbody);
        div.append(table);
        plContent.append(div);
    },

    refreshProcessPanel: function() {
        var app = this.app;
        this.createTable();
        this.getValue('process', function(data) {

            $('.processListBox tbody').empty();
            var totalMem = 0,
                totalCpu = 0;
            var jRow = true,
                rowClass;
            for (var i in data) {
                data[i].hrSWRunPerfCPU = Math.round(data[i].hrSWRunPerfCPU / 1024 / 1024 / 1024);
                rowClass = jRow ? 'even' : 'odd';
                jRow = jRow ? false : true;
                var tr = $('<tr>' +
                    '<td class="pid hrSWRunIndex"></td>' +
                    '<td class="name hrSWRunName">java.exe</td>' +
                    '<td class="path hrSWRunPath"></td>' +
                    '<td class="params hrSWRunParameters"></td>' +
                    '<td class="cpu hrSWRunPerfCPUPercent"></td>' +
                    '<td class="mem hrSWRunPerfMemPercent"></td>' +
                    '</tr>').appendTo('.processListBox tbody');
                tr.addClass(rowClass);

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
            //console.log('totalCpu = ' + totalCpu.toFixed(2) + '   ' + 'totalMem = ' + totalMem.toFixed(2));
        });

        this.plContent.dialog({
            blackStyle: true,
            resize: false,
            title: it.util.i18n("ProcessTab_Process_List"),
            height: 620,
            width: 850,
            closeOnEscape: true,
            show: { effect: 'move&scale', origin: ["middle", "center"], start: '#process' },
            hide: { effect: 'move&scale', origin: ["middle", "center"], start: '#process' },
            autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
            resizable: false, //设置是否可拉动弹窗的大小，默认为true
            modal: false, //是否有遮罩模型
        });
    },

    show: function() {
        var self =this;
        this.resize();
        this.plContent.dialog('open');
        this.plContent.dialog({
            close:function(e){
                // 1、 e:事件对象
                // 2、 ui:封装对象
                // 3、 this:表示对话框元素
                $(this).remove();
            }
        });
        
        this.plContent.parent().find('.ui-dialog-titlebar-close').on('click', function (e) {
            main.panelMgr.instanceMap.NavBarMgr.$box.nav('clickNavIcon', 'process');           
        }); 
    },

    hide: function() {
        if (this.plContent && this.plContent.hasClass("ui-dialog-content")) {
            this.plContent.dialog('close');
        }       
    },

});
it.ProcessTabPanel = $ProcessTabPanel;