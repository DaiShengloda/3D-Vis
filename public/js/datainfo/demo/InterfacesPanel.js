// 只是展示所用，demo效果级别，需要从info中移值过来

var $InterfacesPanel = function(sceneManager) {
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

mono.extend($InterfacesPanel, $BaseServerTab, {

    init: function() {
        var panelLoadHeader = $('<div class="header">端口信息</div>');
        this.panelLoads.append(panelLoadHeader);
        var plContent = $('<div class="content"></div>');
        this.panelLoads.append(plContent);
        var div = $('<div class = "interfacesBox"></div>')
        var table = $('<table></table>');
        var tbody = $('<tbody></tbody>');
        plContent.append(table);
        var thead = $('<thead></thead>')
        var th = $(' <tr>' +
            '    <td class="ifIndex">索引</td>' +
            '    <td class="ifDescr">描述</td>' +
            '    <td class="ifType">类型</td>' +
            '    <td class="ifMtu">MTU</td>' +
            '    <td class="ifSpeed">速率</td>' +
            '    <td class="ifPhysAddress">物理地址</td>' +
            '    <td class="ifStatus">状态</td>' +
            '    <td class="ifOctetsSpeed">字节流速率</td>' +
            '    <td class="ifSpeedUtilization">速度利用率</td>' +
            '    <td class="ifDiscardsRate">丢包率</td>' +
            '    <td class="ifErrorsRate">误差率</td>' +
            '</tr>');
        thead.append(th);
        this.mainPane.append(this.panelLoads);
        this.mainPane.append(this.panelCup);
        table.append(thead);
        table.append(tbody);
        div.append(table);
        plContent.append(div);
    },

    getTitle: function() {
        return "端口信息";
    },

    getContentClass: function() {
        return 'interfacesBox';
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
        this.refreshInterfacesPanel();
    },

    refreshInterfacesPanel: function() {
        var app = this.app;
        this.getValue('interfaces', function(data) {

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
    }

});
it.InterfacesPanel = $InterfacesPanel;