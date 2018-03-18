// 只是展示所用，demo效果级别，需要从info中移值过来

var $RoutePanel = function(sceneManager) {
    $BaseServerTab.call(this, sceneManager);
    this.app = {};
    this.data = main.sceneManager.dataManager.getLinks();
    this.mainPane = $('<div style = "height:100%"></div>');
    this.cpuLoadBox = $('<div class="cpuLoadBox loadBox"></div>');
    this.memLoadBox = $('<div class="memLoadBox loadBox"></div>');
    this.panelLoads = $(' <div class="panel loads" style="height:100%"></div>');
    this.panelCup = $('<div class="panel cpus"></div>');
    this.pCupContent = $('<div class="content"></div>');
    this.box = new twaver.ElementBox();
    this.network = new twaver.vector.Network(this.box);
    this.init();
};

mono.extend($RoutePanel, $BaseServerTab, {

    init: function() {
        var panelLoadHeader = $('<div class="header">设备路由信息</div>');
        this.panelLoads.append(panelLoadHeader);
        var plContent = $('<div id="main" style="height:90%;padding:10px;position:relative;" class="content"></div>');
        this.panelLoads.append(plContent);
        this.mainPane.append(this.panelLoads);
    },

    getTitle: function() {
        return "路由信息";
    },

    isShow: function() {
        if ($.isEmptyObject(this.routeData(this.data))) {
            return false;
        } else {
            return true;
        }
    },

    getContentClass: function() {
        return 'routePanel';
    },

    getData: function() {},

    getContentPanel: function() {
        return this.mainPane;
    },

    afterShow: function() {
        this.resize();
    },

    routeData: function(data) {
        var routedata = {};
        var routeObj = {};
        data.forEach(function(v, i) {
            if (!routeObj[v.getFromId()]) {
                routeObj[v.getFromId()] = {};
            }
            if (!routeObj[v.getToId()]) {
                routeObj[v.getToId()] = {};
            }
            if (v.getRouteType() === "路由") {
                routeObj[v.getFromId()]["dataType"] = "";
                routeObj[v.getFromId()]["toIpAddress"] = v.getToIpAddress();
                routeObj[v.getFromId()]["toPortId"] = v.getToPortId();
                routeObj[v.getToId()]["dataType"] = "";
                routeObj[v.getToId()]["toIpAddress"] = v.getToIpAddress();
                routeObj[v.getToId()]["toPortId"] = v.getToPortId();
            } else if (v.getRouteType() === "链路") {
                routeObj[v.getFromId()]["dataType"] = "";
                routeObj[v.getFromId()]["toIpAddress"] = v.getFromIpAddress();
                routeObj[v.getFromId()]["toPortId"] = v.getFromPortId();
                routeObj[v.getToId()]["dataType"] = "";
                routeObj[v.getToId()]["fromIpAddress"] = v.getToIpAddress();
                routeObj[v.getToId()]["fromPortId"] = v.getToPortId();
            }
        })
        var sortArr = [];
        var focusNode = main.sceneManager.viewManager3d.getFocusNode();
        var focusDataId = main.sceneManager.getNodeData(focusNode).getId();
        data.forEach(function(v, i) {
            if (v.getRouteType() === "路由" && v.getFromId() === focusDataId) {
                sortArr.push(v.getFromId());
                return;
            }
            data.forEach(function(k, j) {
                if (k.getFromId() === sortArr[sortArr.length - 1] && k.getRouteType() === "链路") {
                    sortArr.push(k.getToId());
                }
            })
        });

        sortArr.forEach(function(v, i) {
            for (var k in routeObj) {
                if (k === v) {
                    routedata[k] = routeObj[k];
                }
            }
        })
        return routedata;
    },

    registerImage: function() {
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
    },

    createNode: function(data) {
        var self = this;
        var i = 0;
        self.box.clear();
        for (var k in data) {
            var node = new twaver.Node({
                name: k
            });
            node.setImage("route");
            node.setLocation(i * 180 + 1, 224);
            self.box.add(node);
            node.setClient('text', data[k].dataType);
            if (data[k]["fromIpAddress"]) {
                var portA = new twaver.Follower();
                portA.setHost(node);
                portA.setImage("port");
                portA.setLocation(i * 180 - 12, 244);
                portA.setClient("ip", data[k]["fromIpAddress"]);
                portA.setClient("num", data[k]["fromPortId"])
                self.box.add(portA);
            }
            if (data[k]["toIpAddress"]) {
                var portB = new twaver.Follower();
                portB.setHost(node);
                portB.setImage("port");
                portB.setLocation(i * 180 + 100, 244);
                portB.setClient("ip", data[k]["toIpAddress"]);
                portB.setClient("num", data[k]["toPortId"])
                self.box.add(portB);
            }
            i++;
        }
    },

    createLine: function(data) {
        var self = this;
        data.forEach(function(v, i) {
            if (v.getRouteType() === "链路") {
                var from, to;
                self.box.getDatas().forEach(function(k, j) {
                    // if (k.getHost) {
                    //     console.log(k.getHost());
                    // }
                    if (k.getHost && k.getHost()["_name"] === v.getFromId() && k.getClient("ip") === v.getFromIpAddress()) {
                        from = k;
                    }
                    if (k.getHost && k.getHost()["_name"] === v.getToId() && k.getClient("ip") === v.getToIpAddress()) {
                        to = k;
                    }
                })
                if (from && to && from.getHost()._name !== to.getHost()._name) {
                    var link = new twaver.Link(from, to);
                    link.setStyle("link.color", "black");
                    self.box.add(link);
                }
            }
        })
    },

    resize: function() {
        var self = this;

        function initDataBox() {
            var routedata = self.routeData(self.data);
            self.createNode(routedata);
            self.createLine(self.data);
        }

        function initNetwork() {
            var view = self.network.getView();
            $("#main").append(view);
            self.network.adjustBounds({
                x: 30,
                y: 10,
                width: $("#main").width(),
                height: $("#main").height()
            });
            self.network.setEdgeDetect(true);
            self.network.getToolTip = function(element) {
                if (element.getClient("num") && element.getClient("ip")) {
                    return element.getClient("num") + "/" + element.getClient("ip");
                }
            }
        }

        function init2D() {
            initNetwork();
            self.registerImage();
            initDataBox();
        }
        if ($("#main").children().length > 0) {
            $("#main").children().remove();
        }
        init2D();
    },
});
it.RoutePanel = $RoutePanel;