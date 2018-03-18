
it.PowerRackPanel = function () {
    if(!it.PowerRackPanel.imageInited){
        this._initImage();
    }
    this._initNetwork();
};

it.PowerRackPanel.imageInited = false;

mono.extend(it.PowerRackPanel, Object, {
    _initNetwork: function () {
        var self = this;
        var box = this.box = new twaver.ElementBox();
        var network = this.network = new twaver.vector.Network(box);
        var quickFinder = this.quickFinder = new twaver.QuickFinder(box, 'id');
        network.setDragToPan(false);//禁止拖动
        network.setWheelToZoom(false);//禁止缩放

        //禁止移动
        network.setMovableFunction(function (element) {
            return false;
        });

        //范围内点击都算选中
        network.setTransparentSelectionEnable(true);

        //指定可以选中的节点
        network.getSelectionModel().setFilterFunction(function (node) {            
            return node.getClient('selectable');
        });

        var view = network.getView();
        var contentBox = $('#powerRackInfoBox');
        if(!contentBox.length){
            contentBox = $('<div></div>');
            contentBox.attr('id', 'powerRackInfoBox').appendTo('body');
        }
        contentBox.append(view);
        network.adjustBounds({x: 0, y: 0, width: 750, height: 500});
        //twaver.Styles.setStyle('select.color', '#008e94');

        //标题
        var titleNode = new twaver.Node({name: it.util.i18n("PowerRackPanel_Rack_runtime"), location: {x: 400, y: 10}, width: 0, height: 0});
        titleNode.setStyle('label.font', 'bold 20px LEDFont');//20px "Microsoft Yahei"
        titleNode.setStyle('label.color', '#bcbcbc');
        box.add(titleNode);

        //温度
        var tempNode = new twaver.Node({id: "temp", location: {x: 600, y: 40}});
        tempNode.setImage('temperature');
        
        setInterval(function(){
            var i = parseInt(Math.random()* 30);
            tempNode.setClient('value', i);
        },2000);
        box.add(tempNode);

        initSwitchPanel(180, 'main', it.util.i18n("PowerRackPanel_Main_power"));
        initSwitchPanel(560, 'back', it.util.i18n("PowerRackPanel_Stand_by_power"));

        var infoNode = new twaver.Node({id: 'info', location: {x: 100, y: 400}, width: 200, height: 80});
        infoNode.setImage('infoArea');
        infoNode.setVisible(false);
        box.add(infoNode);

        var timeNode = new twaver.Node({id: "time", location: {x: 410, y: 450}, width: 0, height: 0});
        //timeNode.setName(new Date().format('yyyy-MM-dd HH:mm:ss'));
        timeNode.setStyle('label.font', '22px Calibri');
        timeNode.setStyle('label.color', '#bcbcbc');
        box.add(timeNode);

        var clearNode = new twaver.Node({
            location: {x: 400, y: 415}, width: 80, height: 24, name: it.util.i18n("PowerRackPanel_power_off"), styles: {
                'body.type': 'vector',
                'vector.fill': true,
                'vector.fill.color': '#575757',
                'vector.outline.width': 1,
                //'vector.shape': 'roundrect',
                'label.position': 'center',
                'label.font': 'bold 13px Calibri',
                'label.color': '#ffffff'
            }
        });
        //clearNode.setImage('textNodeImage');
        //clearNode.setClient('name', '清空电能');
        clearNode.setClient('selectable', true);
        clearNode.setClient('clickHandle', function () {
            //FIXME 暂时注释
            //self.clearEnergy();
        });
        box.add(clearNode);

        var setTimeNode = new twaver.Node({
            location: {x: 520, y: 415}, width: 80, height: 24, name: it.util.i18n("PowerRackPanel_Set_time"), styles: {
                'body.type': 'vector',
                'vector.fill': true,
                'vector.fill.color': '#575757',
                'vector.outline.width': 1,
                //'vector.shape': 'roundrect',
                'label.position': 'center',
                'label.font': 'bold 13px Calibri',
                'label.color': '#ffffff'
            }
        });
        //setTimeNode.setImage('textNodeImage');
        //setTimeNode.setClient('name', '设置时间');
        setTimeNode.setClient('selectable', true);
        setTimeNode.setClient('clickHandle', function () {
            //FIXME 暂时注释
            //self.setTime();
        });
        box.add(setTimeNode);

        var configNode = new twaver.Node({
            location: {x: 640, y: 415}, width: 80, height: 24, name: it.util.i18n("PowerRackPanel_Param_setting"), styles: {
                'body.type': 'vector',
                'vector.fill': true,
                'vector.fill.color': '#575757',
                'vector.outline.width': 1,
                //'vector.shape': 'roundrect',
                'label.position': 'center',
                'label.font': 'bold 13px Calibri',
                'label.color': '#ffffff'
            }
        });
        //configNode.setImage('textNodeImage');
        //configNode.setClient('name', '参数设置');
        //configNode.setName('参数设置');
        configNode.setClient('selectable', true);
        configNode.setClient('clickHandle', function () {
            //FIXME 暂时注释
            //self.setConfig();
        });
        box.add(configNode);

        function initSwitchPanel(x, prefix, name) {

            var labelNode11 = new twaver.Node({id: prefix, location: {x: x - 100, y: 65}});
            labelNode11.setImage('powerName');
            labelNode11.setClient('name', name);
            labelNode11.setClient('selected', false);
            labelNode11.setClient('selectedStatus', true);
            labelNode11.setClient('selectable', true);
            labelNode11.setClient('clickHandle', function () {
                if (!self.setTotalInfo) return;
                self.setTotalInfo(prefix);
            });
            box.add(labelNode11);

            var labelNode12 = new twaver.Node({location: {x: x - 130, y: 100}, width: 300, height: 300});
            labelNode12.setImage('powerPanel');
            box.add(labelNode12);

            var aa = ['a', 'b', 'c'];
            for (var i = 0; i < 3; i++) {
                var yy = 107 + i * 100;
                for (var j = 0; j < 8; j++) {
                    var xx = x - 105 - 15 + j * 35;
                    var n = '0' + (j + 1);
                    var phase = aa[i];
                    var id = prefix + aa[i] + n;
                    var switchNode = new twaver.Node({id: id, location: {x: xx, y: yy}});
                    switchNode.setImage('switch');
                    // switchNode.setClient('status', 'off');//'on'
                    // switchNode.setClient('status', 'off');//'on'
                    var tempi = parseInt(Math.random()* 10);
                    switchNode.setClient('status', tempi>=5?'on':'off');//'on'
                    tempi = parseInt(Math.random()* 200);
                    switchNode.setClient('voltage', tempi);
                    tempi = parseInt(Math.random()* 50);
                    switchNode.setClient('ampere', tempi);
                    tempi = parseInt(Math.random()* 50);
                    switchNode.setClient('power', tempi);
                    tempi = parseInt(Math.random()* 50);
                    switchNode.setClient('energy', tempi);
                    tempi = parseInt(Math.random()* 10);
                    switchNode.setClient('load', tempi>=5?it.util.i18n("PowerRackPanel_Unload") : it.util.i18n("PowerRackPanel_load"));
                    switchNode.setClient('alarm', it.util.i18n("PowerRackPanel_Normal"));

                    switchNode.setClient('switch', true);//'on'
                    switchNode.setClient('name', phase.toUpperCase() + n);
                    switchNode.setClient('selected', false);
                    switchNode.setClient('selectedStatus', true);
                    switchNode.setClient('selectable', true);
                    clickHandle(switchNode, prefix, phase, n);
                    box.add(switchNode);
                }
            }

            function clickHandle(switchNode, prefix, phase, n) {
                switchNode.setClient('clickHandle', function () {
                    self.setSubInfo(switchNode, prefix, phase, n);
                });
            }
        }

        var currSelectedNode = null;
        network.addInteractionListener(function (e) {
            var kind = e.kind;
            if (kind == 'liveMoveBetween') {
                console.log(network.getElementAt(e).getLocation());
            } else if (kind == 'clickElement' || kind == 'doubleClickElement') {
                var node = network.getElementAt(e);
                if (node.getClient('selectedStatus')) {
                    if (currSelectedNode && currSelectedNode != node) {
                        currSelectedNode.setClient('selected', false);
                        currSelectedNode = null;
                    }
                    if (node.getClient('selectable')) {

                        if (node.getClient('selected')) {
                            var cb = node.getClient("clickHandle");
                            cb && cb();
                        } else {
                            node.setClient('selected', true);
                            currSelectedNode = node;
                        }
                    }
                } else {
                    if (node.getClient('selectable')) {
                        var cb = node.getClient("clickHandle");
                        cb && cb();
                    }
                }
            }
        });
        network.setKeyboardRemoveEnabled(false);
    },
    _initImage: function () {
        it.PowerRackPanel.imageInited = true;
        twaver.Util.registerImage('temperature', {
            clip: true,
            origin: {x: 0, y: 0},
            w: 150,
            h: 30,
            v: [
                {
                    shape: 'text',
                    text: '<%="'+ it.util.i18n("PowerRackPanel_Temperature")+'：" + (getClient("value")?getClient("value") + " ℃":"")%>',
    //                text:'温度：24℃',
                    font: 'bold 18px LEDFont',
                    textAlign: 'left',
                    textBaseline: 'top',
                    fill: '#bcbcbc'
                }
            ]
        });

        twaver.Util.registerImage('powerName', {
            w: 200,
            h: 30,
            lineWidth: 3,
            lineColor: '<%=getClient("selected")?"#bcbcbc":"#bcbcbc"%>',
            v: [
                {
                    shape: 'rect',
                    rect: [-50, -15, 110, 30],
                    fill: '#bcbcbc',
                    lineWidth: 0,
                    visible: '<%=getClient("selected")%>'
                }
                , {
                    shape: 'circle',
                    cx: -35,
                    cy: 0,
                    r: 10
                }
                , {
                    shape: 'line',
                    p1: {x: -35, y: -14},
                    p2: {x: -35, y: 14}
                }
                , {
                    shape: 'text',
                    text: '#',
                    x: -20,
                    y: 4,
                    font: '14px  LEDFont',
                    fill: '#bcbcbc',

                }
                , {
                    shape: 'circle',
                    cx: 0,
                    cy: 0,
                    r: 10
                }
                , {
                    shape: 'line',
                    p1: {x: 0, y: -14},
                    p2: {x: 0, y: 14}
                }
                , {
                    shape: 'line',
                    p1: {x: 0, y: 14},
                    p2: {x: 0, y: 20}
                }
                , {
                    shape: 'text',
                    text: '#',
                    x: 15,
                    y: 4,
                    fill: '#bcbcbc',
                    font: '14px  LEDFont'
                }
                , {
                    shape: 'circle',
                    cx: 35,
                    cy: 0,
                    r: 10
                }
                , {
                    shape: 'line',
                    p1: {x: 35, y: -14},
                    p2: {x: 35, y: 14}
                }
                , {
                    shape: 'text',
                    text: '#',
                    x: 50,
                    y: 4,
                    fill: '#bcbcbc',
                    font: '14px LEDFont'
                }, {
                    shape: 'text',
                    text: '<%=getClient("name")%>',
                    x: 60,
                    y: 0,
                    textAlign: 'left',
                    font: 'bold 20px LEDFont',
                    fill: '#bcbcbc'
                }
            ]
        });

        twaver.Util.registerImage('powerPanel', {
            origin: {x: 0, y: 0},
            line: {
                width: 2,
                color: '#bcbcbc'
            },
            v: [
                {
                    shape: 'draw',
                    draw: function (g, data, view) {

                        g.beginPath();
                        for (var i = 0; i < 3; i++) {
                            var y = i * 100;
                            g.moveTo(0, y);
                            g.lineTo(300, y);

                            for (var j = 0; j < 8; j++) {
                                var x = 25 + j * 35
                                g.moveTo(x, y);
                                g.lineTo(x, y + 10);
                            }
                        }
                        g.stroke();
                        g.closePath();
                    }
                }
                , {
                    shape: 'line',
                    p1: {x: 1, y: 0},
                    p2: {x: 1, y: 200},
                }
            ],
            draw: function () {

            }
        });

        twaver.Util.registerShape('triangle_b', function (g, shapeData, data, view) {
            var rect = shapeData.rect;
            g.beginPath();
            g.moveTo(rect.x, rect.y);
            g.lineTo(rect.x + rect.w / 2, rect.y + rect.h);
            g.lineTo(rect.x + rect.w, rect.y);
            g.fill();
            g.closePath();
        });

        twaver.Util.registerImage('switch', {
            clip: true,
            origin: {x: 0.5, y: 0},
            w: 30,
            h: 75,
            lineWidth: 2,
            lineColor: '<%=getClient("selected")?"#bcbcbc":"#bcbcbc"%>',
            v: [
                {
                    shape: 'rect',
                    rect: [-12, 0, 24, 57],
                    fill: '#47626b',
                    line: {
                        width: 1,
                        color: '#00f6ff'
                    },
                    visible: '<%=getClient("selected")%>'
                }
                , {
                    shape: 'line',
                    p1: {x: 0, y: 0},
                    p2: {x: 0, y: 10}
                }
                , {
                    shape: 'line',
                    lineWidth: 2,
                    x1: '<%=getClient("status")=="on"?0:12%>',
                    y1: 8,
                    x2: 0,
                    y2: 30,
                }, {
                    shape: 'circle',
                    cx: 0,
                    cy: 35,
                    r: 4
                }
                , {
                    shape: 'line',
                    p1: {x: 0, y: 30},
                    p2: {x: 0, y: 50},
                }
                , {
                    shape: 'triangle_b',
                    rect: {x: -4, y: 50, w: 8, h: 6},
                    lineWidth: 0,
                    fill: '<%=getClient("selected")?"#bcbcbc":"#bcbcbc"%>'
                }
                , {
                    shape: 'text',
                    x: 0,
                    y: 65,
                    text: '<%=getClient("name")%>',
                    font: 'bold 14px Calibri',
                    textAlign: 'center',
                    fill: '#bcbcbc'
                }
            ]
        });

        twaver.Util.registerImage('textNodeImage', {
            origin: {x: 0, y: 0},
            line: {
                width: 2,
                color: '#bcbcbc'
            },
            v: [
                {
                    shape: 'rect',
                    lineWidth: 1,
                    r: 4,
                    rect: [0, 0, 80, 24],
                }
                , {
                    shape: 'text',
                    x: 40,
                    y: 12,
                    text: '<%=getClient("name")%>',
                    font: 'bold 13px Calibri',
                    textAlign: 'center',
                    fill: '#bcbcbc'
                }
            ]
        });

        twaver.Util.registerImage('infoArea', {
            origin: {x: 0, y: 0},
            line: {
                width: 2,
                color: '#bcbcbc'
            },
            v: [
                {
                    shape: 'rect',
                    rect: [0, 0, 200, 80],
                }
                , {
                    shape: 'text',
                    x: 10,
                    y: 15,
                    text: it.util.i18n("PowerRackPanel_Main_power_off"),
                    font: 'bold 18px Calibri',
                    textAlign: 'left',
                    fill: '#FFCCCC'
                }
                , {
                    shape: 'text',
                    x: 150,
                    y: 15,
                    text: '2/2',
                    font: 'bold 18px Calibri',
                    textAlign: 'left',
                    fill: '#FFCCCC'
                }
                , {
                    shape: 'text',
                    x: 10,
                    y: 40,
                    text: '20:00-34:00',
                    font: 'bold 18px Calibri',
                    textAlign: 'left',
                    fill: '#FFCCCC'
                }
                , {
                    shape: 'text',
                    x: 100,
                    y: 65,
                    text: '<%= getClient("hasAlarm")?"'+ it.util.i18n("PowerRackPanel_Not_report")+'":"'+it.util.i18n("PowerRackPanel_Reported") +'"%>',
                    font: 'bold 18px Calibri',
                    textAlign: 'center',
                    fill: '#FFCCCC'
                }
            ]
        });
    },
    show: function (assetId) {
        $('#powerRackInfoBox').dialog({
            blackStyle: true,
            width: 800,
            height: 550,
            title: it.util.i18n("PowerRackPanel_Header_rack_runtime"),
            autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
            show: '', //显示弹窗出现的效果，slide为滑动效果
            hide: '', //显示窗口消失的效果，explode为爆炸效果
            resizable: false, //设置是否可拉动弹窗的大小，默认为true
            //position: 'center',
            modal: true, //是否有遮罩模型
        });
        $('#powerRackInfoBox').dialog('open');
        $('#powerRackInfoBox').dialog({
            close: function (e, ui) {
                // 1、 e:事件对象
                // 2、 ui:封装对象
                // 3、 this:表示对话框元素
                $(this).remove();
            }
        });
    },
    setSubInfo: function (switchNode, type, phase, no) {
        var $subPanel = $('#powerRackInfoSubBox');
        if(!$subPanel.length){
            $subPanel = $('<div></div>').attr('id', 'powerRackInfoSubBox').appendTo('body');
            var $table = $('<table></table>').appendTo($subPanel);

            var f = function(text,val, classN, unit){
                unit = unit || '';
                var $tr = $('<tr></tr>').appendTo($table);
                $tr.append($('<td>'+text+' ：</td>'));
                $tr.append($('<td><span class="'+classN+'">'+val+'</span><span class="unit">'+unit+'</span></td>'));
            }
            f(it.util.i18n("PowerRackPanel_Voltage"),0.00,'voltage','V');
            f(it.util.i18n("PowerRackPanel_Electric_current"),0.00,'ampere','A');
            f(it.util.i18n("PowerRackPanel_Active_power"),0.00,'power','W');
            f(it.util.i18n("PowerRackPanel_Active_quantity"),0.00,'energy','KWH');
            f(it.util.i18n("PowerRackPanel_Circuit_status"),0.00,'status');
            f(it.util.i18n("PowerRackPanel_Load_status"),0.00,'load');
            f(it.util.i18n("PowerRackPanel_Fault_status"),it.util.i18n("PowerRackPanel_Normal"),'alarm');
            
        }
        var title = (type == 'main' ? it.util.i18n("PowerRackPanel_Main_circuit") : it.util.i18n("PowerRackPanel_Stand_by_circuit")) + phase.toUpperCase() + it.util.i18n("PowerRackPanel_Phase_branch") + no

        
        $("#powerRackInfoSubBox .voltage").html(switchNode.getClient('voltage'));
        $("#powerRackInfoSubBox .ampere").html(switchNode.getClient('ampere'));
        $("#powerRackInfoSubBox .power").html(switchNode.getClient('power'));
        $("#powerRackInfoSubBox .energy").html(switchNode.getClient('energy'));
        var status = switchNode.getClient('status')
        $("#powerRackInfoSubBox .status").html('status'=='on'?it.util.i18n("PowerRackPanel_Close"):it.util.i18n("PowerRackPanel_Open"));
        $("#powerRackInfoSubBox .load").html(switchNode.getClient('load'));
        
        $('#powerRackInfoSubBox').dialog({
            blackStyle: true,
            width: 300,
            height: 250,
            title: title,
            autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
            show: '', //显示弹窗出现的效果，slide为滑动效果
            hide: '', //显示窗口消失的效果，explode为爆炸效果
            resizable: false, //设置是否可拉动弹窗的大小，默认为true
            //position: 'center',
            modal: true, //是否有遮罩模型
        });
        $('#powerRackInfoSubBox').dialog('open');
    },

});
