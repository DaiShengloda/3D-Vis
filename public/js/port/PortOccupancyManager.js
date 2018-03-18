/**
 * 端口占用状态管理
 * @param sceneManager
 * @constructor
 */
$PortOccupancyManager = function (sceneManager) {
    this.sceneManager = sceneManager;
    this.portManager = sceneManager.postManager;
    this.jRow = false;
    this.isShow = false;
    isEdit = false;
    this.portList = {};
    this.datas = [];
}

mono.extend($PortOccupancyManager, Object, {
    init: function (parentId) {
        this.nodeMap = this.getNodesByParentId(parentId)
        this.getPortOccupancy(parentId);
        this.registerImage();
        var self = this;
        Object.keys(self.nodeMap).forEach(function (key) {
            var node = self.nodeMap[key];
            node.setClient('portOriginalImg', node._imageUrl);
        })
    },

    getSimulatePortData: function () {
        var portStatus = this.simulateData();
        var portStatusObj = {};
        portStatus.forEach(function (status) {
            var id = status['port_id'] + '@' + status['data_id'] + '@' + status['side'] / 1;
            portStatusObj[id] = status['status'];
        })
        return portStatusObj;
    },

    showPortsOccupancy: function (node) {
        var self = this;
        this.closePanel();
        Object.keys(self.nodeMap).forEach(function (key) {
            var node = self.nodeMap[key];
            node.setClient('portOriginalImg', node._imageUrl);
            var status = self.portList[key] || false;
            node.setClient('isOccupancy', status);
            node.setClient("isSelect", false);
            node.setImage('img');
        })
        this.isShow = true;
    },

    hidePortOccupancy: function (node) {
        var self = this;
        this.closePanel();
        Object.keys(self.nodeMap).forEach(function (key) {
            var node = self.nodeMap[key];
            node.setClient("isSelect", false);
            node.setImage({
                w: node._width,
                h: node._height,
                v: [{
                    shape: 'draw',
                    draw: 'drawFunction'
                }]
            })
        })
        this.isShow = false;
    },

    haveAccess: function () {

    },

    selectChangFunction: function (e) {
        var devPanel = main.nodeEventHander.panelTab;
        var selectNode = devPanel.network.getElementAt(e);
        if (!selectNode) return;
        var selectData = selectNode.getClient('it_data');
        var selectCategory = main.sceneManager.dataManager.getCategoryForData(selectData);
        if (selectCategory.getId() === "port") {
            devPanel.portOccupancyManager.editPortOccupancy(selectNode);
            devPanel.portOccupancyManager.initPanel(selectNode);
        }
    },

    editPortMap: {},
    editPortOccupancy: function (node) {
        var id = node.getClient('_template').getId();
        var self = this;
        if (self.editPortMap[id]) {
            delete self.editPortMap[id];
            node.setClient("isSelect", false);
        } else {
            self.editPortMap[id] = node;
            node.setClient("isSelect", true);
        }
    },

    getNodesByParentId: function (parentId) {
        var nodeMap = main.nodeEventHander.panelTab.nodeMap;
        return nodeMap[parentId];
    },

    getPortOccupancy: function (id) {
        var self = this;
        ServerUtil.api('port', 'search', {}, function (data) {
            data.forEach(function (v) {
                var id = v['portNum'] + '@' + v['id'] + '@' + v['side'] / 1;
                self.portList[id] = v['portStatus'];
            })
        })
    },

    setPortOccupancy: function (status) {
        var self = this;
        var data = [];
        var editPortMap = this.editPortMap;
        var map = Object.keys(editPortMap);
        map.forEach(function (k) {
            var idArr = k.split('@');
            var dataObj = {
                id: idArr[1],
                portNum: idArr[0],
                side: !!(idArr[2] / 1),
                portStatus: status
            }
            data.push(dataObj);
            var node = editPortMap[k];
            node.setClient('isOccupancy', status);
            self.portList[k] = status;
            self.editPortOccupancy(node);
        })

        ServerUtil.api('port', 'batchAddOrUpData', data, function (data) {
            console.log(data);
            self.closePanel();
        })
    },

    setPortDefault: function (nodes) {
        var self = this;
        if (self.datas.length === 0) return;
        self.datas.forEach(function (v) {
            var node = self.editPortMap[v];
            delete self.editPortMap[v];
            node.setClient("isSelect", false);
        })
        nodes = [];
    },

    initPanel: function (node) {
        var self = this;
        var option;
        this.datas = [];
        var editPortMap = self.editPortMap;
        //清除原来的面板
        this.closePanel();
        var keyMap = Object.keys(editPortMap);
        var showPanelStyle;
        var firstKey = keyMap[0];
        var firstNode = editPortMap[firstKey];
        if (!firstNode) return;
        //点击第一个端口时显示那个面板
        if (!firstNode.getClient('isOccupancy')) {
            showPanelStyle = 'set';
        } else {
            showPanelStyle = 'cancel';
        }
        //判断端口表中是否含有占用状态不同的端口
        for (var i = 0; i < keyMap.length; i++) {
            var key = keyMap[i];
            var node = editPortMap[key];
            var isOccupancy = node.getClient('isOccupancy');
            if (firstNode.getClient('isOccupancy') !== isOccupancy) {
                showPanelStyle = 'setAndCancel';
                break;
            }
        }
        keyMap.forEach(function (key) {
            self.datas.push(key);
        })
        if (showPanelStyle === 'set') {
            option = {
                title: it.util.i18n("Set_Port_Occupancy"),
                closeFunction: function () {
                    self.closePanel();
                    self.setPortDefault(self.setPortMap)
                },
                confirmFunction: function () {
                    self.setPortOccupancy(true)
                }
            }
        }
        if (showPanelStyle === 'cancel') {
            option = {
                title: it.util.i18n("Abolish_Port_Occupancy"),
                closeFunction: function () {
                    self.closePanel()
                    self.setPortDefault(self.setPortMap)
                },
                confirmFunction: function () {
                    self.setPortOccupancy(false)
                }
            }
        }
        if (showPanelStyle === 'setAndCancel') {
            option = {
                title: it.util.i18n("Set_Port_Occupancy"),
                option: [{
                    class: 'clear-it active',
                    text: it.util.i18n("Abolish_Occupancy"),
                }, {
                    class: 'search-it active',
                    text: it.util.i18n("To_Occupancy"),
                }],
                closeFunction: function () {
                    self.setPortOccupancy(false)
                },
                confirmFunction: function () {
                    self.setPortOccupancy(true)
                }
            }
        }
        option.data = self.datas
        self.registerPanel(option);
    },

    closePanel: function () {
        if (this.panel) {
            this.panel.remove();
            this.panel = null;
        }  
    },

    registerImage: function () {
        twaver.Util.registerDraw('drawFunction', function (g, data, view) {
            var image = data.getClient('portOriginalImg') || data._imageUrl;
            var img = new Image();
            img.src = image;
            g.drawImage(img, -data._width / 2, -data._height / 2, data._width, data._height);
        })
        twaver.Util.registerImage('img', {
            w: function (node) {
                return node._width;
            },
            h: function (node) {
                return node._height;
            },
            clip: true,
            v: function (node) {
                var x = -node._width / 2;
                var y = -node._height / 2;
                var w = node._width;
                var h = node._height;
                var color = node.getClient('isSelect') ? "rgb(0, 255, 255)" : "rgb(0, 155, 232)";
                var bgColor = node.getClient('isSelect') ? "rgba(0, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.7)";
                var lineWidth = 2;
                var arr = [{
                    shape: 'draw',
                    draw: 'drawFunction'
                }, {
                    shape: 'rect',
                    x: x,
                    y: y,
                    w: w,
                    h: h,
                    fill: bgColor,
                    lineWidth: lineWidth,
                    lineColor: color
                }];
                if (node.getClient('isOccupancy')) {
                    for (var i = 0; i * 2 < h; i++) {
                        var fillObj = {
                            shape: 'line',
                            x1: x,
                            y1: y + i * 2,
                            x2: x + 100,
                            y2: y + i * 2,
                            lineWidth: 1,
                            lineColor: color,
                            rotate: "30"
                        }
                        arr.push(fillObj);
                    }
                }
                return arr;
            }
        })
    },

    registerPanel: function (option) {
        this.panel = $('<div class = "new-app-panel"></div>')
        var self = this;
        btn = option.option || [{
            class: 'clear-it active',
            text: it.util.i18n("Port_Occupancy_Cancel"),
        }, {
            class: 'search-it active',
            text: it.util.i18n("Port_Occupancy_Confirm"),
        }];
        this.panel.portOccupancyPanel({
            data: option.data,
            option: btn,
            doConfirmIt: option.confirmFunction,
            doClearIt: option.closeFunction,
        });
        this.panel.dialog({
            appendTo: ".dialog-box",
            dialogClass: 'new-dialog1',
            blackStyle: true,
            width: 'auto',
            height: 'auto',
            title: option.title,
            modal: false, //是否有遮罩模型
            autoOpen: true, //初始化之后，是否立即显示对话框，默认为 true
            show: '', //显示弹窗出现的效果，slide为滑动效果
            hide: '', //显示窗口消失的效果，explode为爆炸效果
            resizable: false, //设置是否可拉动弹窗的大小，默认为true
            position: {
                my: "right center",
                at: "right-100 top+350",
            }
        });
        this.panel.on('dialogclose', function () {
            self.closePanel();
            self.setPortDefault(self.setPortMap)
        });
    },

    simulateData: function () {
        return [{
            data_id: '134_E0085',
            port_id: 1,
            side: 0,
            status: 1
        }, {
            data_id: '134_E0085',
            port_id: 23,
            side: 0,
            status: 1
        }, {
            data_id: '134_E0085',
            port_id: 15,
            side: 0,
            status: 0
        }, {
            data_id: '134_E0085',
            port_id: 34,
            side: 0,
            status: 1
        }, {
            data_id: '134_E0085',
            port_id: 40,
            side: 0,
            status: 1
        }]
    }
})

it.PortOccupancyManager = $PortOccupancyManager;

$.widget('hud.portOccupancyPanel', {
    _create: function () {
        var tbody = this.createTableTitle();
        var option = this.options
        this.createTbodyBlock(option, tbody);
        this.createButtonsWithTips(option);
    },

    createTableTitle: function (parent) {
        var div = $('<div class = "portOccupancyPanel scroll-class"></div>');
        var table = $('<table></table>');
        var tbody = $('<tbody></tbody>');
        var thead = $('<thead></thead>')
        var th = $('<tr>' +
            '<td>' + it.util.i18n('Port_Information') + '</td>' +
            '</tr>');
        thead.append(th);
        table.append(thead);
        table.append(tbody);
        div.append(table);
        if (!parent) {
            parent = this.element;
        }
        parent.append(div);
        return tbody;
    },

    createTbodyBlock: function (option, parent) {
        var jRow = true;
        option.data.forEach(function (v) {
            var rowClass = jRow ? 'even' : 'odd';
            jRow = jRow ? false : true;
            var tr = $('<tr></tr>').addClass(rowClass);
            var td = $('<td>').text(v.split('@')[0]).appendTo(tr);
            if (!parent) {
                parent = this.element;
            }
            parent.append(tr);
        })
    },

    createButtonsWithTips: function (options, parent) {
        if (!options) {
            options = {};
        }
        var option = options.option;
        if (!options.tip) {
            options.tip = '<span class="icon-tips icon iconfont"></span>' + it.util.i18n('Port_Optional') + '!';
        }
        var line = $('<div>').addClass('app-btn-line');
        var tip = $('<div>').addClass('app-tip').appendTo(line).html(options.tip);
        var group = $('<div>').addClass('app-btn-group').appendTo(line);
        for (var i = 0; i < option.length; i++) {
            var div = $('<div style = "width:auto">').addClass(option[i].class).text(option[i].text);
            group.append(div);
        }
        if (!parent) {
            parent = this.element;
        }
        parent.append(line);
        var self = this;
        this._on(group, {
            'click .search-it.active': function (e) {
                self._trigger('doConfirmIt', e);
            },
            'click .clear-it.active': function (e) {
                self._trigger('doClearIt', e);
            },
        })
        return group;
    },
})