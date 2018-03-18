// 只是展示所用，demo效果级别，需要从info中移值过来

var $RouteTabPanel = function(sceneManager) {
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

mono.extend($RouteTabPanel, $BaseServerTab, {

    init: function() {
        var panelLoadHeader = $('<div class="header">设备路由信息</div>');
        this.panelLoads.append(panelLoadHeader);
        var plContent = $('<div id="main" style="height:130px;padding:10px;position:relative;" class="content"></div>');
        this.panelLoads.append(plContent);
        this.mainPane.append(this.panelLoads);
    },

    getTitle: function() {
        return "路由信息";
    },

    getContentClass: function() {
        return 'routePanel';
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
        var box = new twaver.ElementBox();
        var network = new twaver.vector.Network(box);

        function registerImage() {
            twaver.Util.registerImage('route', {
                w: 100,
                h: 50,
                v: [{
                    shape: 'rect',
                    x: -50,
                    y: -25,
                    w: 100,
                    h: 50,
                    line: {
                        width: 2,
                        color: 'black',
                    },
                }, {
                    shape: 'text',
                    text: '<%= getClient("text") %>',
                    textAlign: 'center',
                    textBaseLine: 'middle'
                }],
            });
            twaver.Util.registerImage('port', {
                w: 12,
                h: 12,
                v: [{
                    shape: 'circle',
                    cx: 0,
                    cy: 0,
                    r: 5,
                    line: {
                        width: 2,
                        color: 'black',
                    }
                }],
            });
        }

        function node() {
            data.forEach(function(v, i) {
                var node = new twaver.Node({
                    name: v.name
                });
                node.setImage("route");
                node.setLocation(i * 180 + 1, 20);
                box.add(node);
                node.setClient('text', v.dataType);
                if (v["portA"]) {
                    var portA = new twaver.Follower("portA" + i);
                    portA.setHost(node);
                    portA.setImage("port");
                    portA.setLocation(i * 180 - 12, 40);
                    portA.setClient("ip", v["portA"]["ip"]);
                    portA.setClient("num", v["portA"]["num"])
                    box.add(portA);
                }
                if (v["portZ"]) {
                    var portB = new twaver.Follower("portZ" + i);
                    portB.setHost(node);
                    portB.setImage("port");
                    portB.setLocation(i * 180 + 100, 40);
                    portB.setClient("ip", v["portZ"]["ip"]);
                    portB.setClient("num", v["portZ"]["num"])
                    box.add(portB);
                }
            });
        }

        function line() {
            data.forEach(function(v, i) {
                var from, to;
                if (v.portZ && v.portZ.link) {
                    box.getDatas().forEach(function(k, j) {
                        if (k.getHost && k.getClient("ip") === v.portZ.ip && /portZ/.test(k.getId())) {
                            from = k;
                        }
                        if (k.getHost && k.getClient("ip") === v.portZ.link && /portA/.test(k.getId())) {
                            to = k;
                        }
                    })
                    if (from && to && from.getId().slice(-1) !== to.getId().slice(-1)) {
                        var link = new twaver.Link(from, to);
                        link.setStyle("link.color", "black");
                        box.add(link);
                    }
                }
            })
        }

        function initDataBox() {
            node();
            line()
        }

        function initNetwork() {
            var view = network.getView();
            $("#main").append(view);
            network.adjustBounds({
                x: 30,
                y: 10,
                width: $("#main").width(),
                height: $("#main").height()
            });
            network.setEdgeDetect(true);
            network.getToolTip = function(element) {
                if (/port/.test(element.getId())) {
                    return element.getClient("num") + "/" + element.getClient("ip");
                }
            }
        }

        function init2D() {
            initNetwork();
            registerImage();
            initDataBox();
        }
        if ($("#main").children().length === 0) {
            init2D();
        }
    },
});
it.RouteTabPanel = $RouteTabPanel;