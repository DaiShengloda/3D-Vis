/**
 * 机位视图
 * @param sceneManager
 */
var $SeatManager = function (sceneManager) {

    it.VirtualManager.call(this, sceneManager);
    this.viewManager3d = sceneManager.viewManager3d;
    this.dataManager = sceneManager.dataManager;
    this.dataBox = sceneManager.network3d.getDataBox();

    this.tooltipManager = sceneManager.viewManager3d.tooltipManager;


    this._show = false;

    //当前显示的列表
    this.seatNodes = [];
    this.emptySeatNodes = [];

    //所有机柜机位, key 是机柜编号, 临时创建的 node
    this.rackSeatNodeMap = {};


    //虚化程度
    this.opacityValue = 0.08;

    //机位颜色
    this.usedColor = '#00a0ea';

    //空闲机位的颜色
    this.freeColor = '#ccc';

    //机位高度
    this.height = 1;

    //间隔
    this.padding = 3;

    //边框颜色
    this.borderColor = '#02739b';

    this.init();
};

mono.extend($SeatManager, it.VirtualManager, {

    init: function () {
        var self = this;
        var key1 = it.util.i18n("SeatManager_Rack_ID");
        var key2 = it.util.i18n("SeatManager_Rack_Name");
        var param = {};
        param.customerId = 'seat-tooltip';
        param.extInfo = {};
        param.extInfo[key1] = function (node) {
            var data = node.getClient('rackData');
            if (data) {
                return data.getId();
            }
            return '';
        };

        param.extInfo[key2] = function (node) {
            var data = node.getClient('rackData');
            if (data) {
                return data.getName() || data.getDescription() || data.getId();
            }
            return '';
        };

        //tool
        this.tooltipRule = new it.TooltipRule(param);

        //取得 node 分组
        var oldGetCustomerIdByNode = this.tooltipManager.getCustomerIdByNode;
        this.tooltipManager.getCustomerIdByNode = function (node) { //给用户自己扩展
            if (node.getClient('seat')) {
                return "seat-tooltip";
            }
            return oldGetCustomerIdByNode.call(this.tooltipManager, node);
        }

        //取得计算位置的 node
        var oldGetTooltipDivPositionNode = this.tooltipManager.getTooltipDivPositionNode;
        this.tooltipManager.getTooltipDivPositionNode = function (data, node, targetNode) {

            if (targetNode && targetNode.getClient('seat')) {
                return targetNode;
            }
            return oldGetTooltipDivPositionNode.call(this, data, node, targetNode);
        }

        //初始化 option
        this.option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                },
                formatter: function (a) {
                    var t = a[0].value + a[1].value;
                    var p = a[0].value * 1.0 / t * 100;
                    p = p.toFixed(1);
                    var s = '';
                    s += a[0].seriesName + ' : ' + a[0].value + '<br>';
                    s += a[1].seriesName + ' : ' + a[1].value + '<br>';
                    s += it.util.i18n("SeatManager_Utilization_percentage") + ' : ' + p + '%';
                    return s;
                }
            },
            legend: {
                data: [it.util.i18n("SeatManager_Seat_occupy"), it.util.i18n("SeatManager_Seat_left")],
                padding: [25, 10]
            },
            grid: {
                left: '3%',
                right: '3%',
                bottom: '6%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'value'
                }
            ],
            yAxis: [
                {
                    type: 'category',
                    axisTick: { show: false },
                    data: ['']
                }
            ],
            color: [this.usedColor, this.freeColor],
            series: [
                {
                    name: it.util.i18n("SeatManager_Seat_occupy"),
                    type: 'bar',
                    stack: it.util.i18n("SeatManager_Total"),
                    label: {
                        normal: {
                            show: true
                        }
                    },
                    data: [300]
                },
                {
                    name: it.util.i18n("SeatManager_Seat_left"),
                    type: 'bar',
                    stack: it.util.i18n("SeatManager_Total"),
                    label: {
                        normal: {
                            show: true,
                            position: 'inside'
                        }
                    },
                    data: [100]
                }
            ]
        };

        var chartBox = this.chartBox = $('<div class="seat-view-chart-box"></div>').appendTo($('body'));
        var chartContainer = this.chartContainer = $('<div class="seat-view-chart-container"></div>').appendTo(chartBox);
        var chart = this.chart = echarts.init(chartContainer[0]);
        chartBox.hide();
        this.seatPanel = $('<div>').appendTo($('.view-control')).seatLegend();
        this.seatPanel.seatLegend('hide');
    },

    /**
     * 设置图标参数
     * @param usedCount
     * @param freeCount
     */
    setOptionValue: function (usedCount, freeCount) {

        this.option.series[0].data[0] = usedCount;
        this.option.series[1].data[0] = freeCount;
        this.chart.setOption(this.option);
    },

    prepare: function () {
        var self = this;
        var rootNode = this.sceneManager.getCurrentRootNode();
        this.floorData = this.sceneManager.getNodeData(rootNode);
        var children = this.chidren = this.dataManager.getDescendants(this.floorData);

        //找到所有的机柜和机位
        var others = [];
        var seatMap = {};
        var rackMap = {};
        children.forEach(function (item) {
            var dataType = self.dataManager.getDataTypeForData(item);
            var categoryId = dataType.getCategoryId();
            if (categoryId == it.util.CATEGORY.RACK) {
                rackMap[item.getId()] = item;
            } else if (categoryId == it.util.CATEGORY.SEAT) {
                seatMap[item.getId()] = item;
            } else if (self.include(item, dataType, categoryId)) {
                others.push(item);
            }
        })
        //console.log(rackMap, seatMap, others);
        this.others = others;
        this.seatMap = seatMap;
        this.rackMap = rackMap;

    },
    include: function (data, dataType, categoryId) {
        if (categoryId == it.util.CATEGORY.ROOM) {
            return false;
        }
        return true;
    },
    /**
     * 显示机位视图
     * @param type 1-所有 2-占用 3-空余
     */
    show: function (type) {

        var self = this;
        this.type = parseInt(type) || 0;
        this.prepare();

        //
        if (this.seatNodes != []) {
            this.seatNodes.forEach(function (item) {
                item.setParent(null);
                self.dataBox.remove(item);
            })
        }
        this.seatNodes = [];

        //虚化
        this.viewManager3d.addMaterialFilter(this);
        if (this.others) {
            this.others.forEach(function (item) {
                self.add(item);
            });
        }
        for (var id in this.rackMap) {
            var rackData = this.rackMap[id];
            self.add(rackData);
        }
        for (var id in this.seatMap) {
            var seatData = this.seatMap[id];
            self.add(seatData);
        }

        //显示机位
        if (this.type == 1 || this.type == 2) {
            for (var id in this.rackMap) {
                var rackData = this.rackMap[id];

                if (!this.rackSeatNodeMap[id]) {
                    this.rackSeatNodeMap[id] = this.createRackSeatNode(rackData, this.usedColor);
                } else {
                    this.rackSeatNodeMap[id] = this.setRackSeatNodeParent(this.rackSeatNodeMap[id]);
                }
                var seatNode = this.rackSeatNodeMap[id];
                this.seatNodes.push(seatNode);
                this.dataBox.add(seatNode);
            }
        }

        if (this.type == 1 || this.type == 3) {
            this.sceneManager.setInvisibleDataByCategoryId(it.util.CATEGORY.SEAT, true);
        } else {
            this.sceneManager.setInvisibleDataByCategoryId(it.util.CATEGORY.SEAT, false);
        }
        this.sceneManager.viewManager3d.enableMousemove = true;
        this.tooltipManager.addTooltipRule(this.tooltipRule);
        this.setOptionValue(Object.keys(this.rackMap).length, Object.keys(this.seatMap).length)
        // this.chartBox.show();
        var options = {
            title: it.util.i18n("SeatManager_Seat_Occupy_Statistics"),
            volume: Object.keys(this.rackMap).length + Object.keys(this.seatMap).length,
            occupy: Object.keys(this.rackMap).length,
            legend: [{
                color: '#00a0ea',
                text: it.util.i18n("SeatManager_Seat_occupy")
            }, {
                color: '#00a0ea',
                innerColor: '#494949',
                text: it.util.i18n("SeatManager_Seat_left")
            }],
        };
        this.seatPanel.seatLegend('option', {
            'title': options.title,
            'volume': options.volume,
            'occupy': options.occupy,
            'legend': options.legend
        });
        this.seatPanel.seatLegend('show');

        if (this.emptySeatNodes != []) {
            this.emptySeatNodes.forEach(function (item) {
                item.setParent(null);
                self.dataBox.remove(item);
            })
            this.emptySeatNodes = [];
        }
        this.emptySeatNodes = [];
        //设置空余机柜的颜色
        for (var id in this.seatMap) {
            var seatData = this.seatMap[id];
            var emptySeatNode = this.createRackSeatNode(seatData, this.freeColor);
            this.emptySeatNodes.push(emptySeatNode);
            this.dataBox.add(emptySeatNode);
        }
    },
    isShow: function () {

        return this._show;
    },
    hide: function () {

        this.sceneManager.viewManager3d.enableMousemove = false;
        this.tooltipManager.hideToolTipDiv();
        this.tooltipManager.removeTooltipRule(this.tooltipRule);
        this._show = false;
        this.clear();
        this.sceneManager.viewManager3d.removeMaterialFilter(this);
        this.sceneManager.setInvisibleDataByCategoryId(it.util.CATEGORY.SEAT, false);
        this.chartBox.hide();
        this.seatPanel.seatLegend('hide');
        var self = this;
        if (this.seatNodes) {
            this.seatNodes.forEach(function (item) {
                item.setParent(null);
                self.dataBox.remove(item);
            })
            this.seatNodes = [];
        }
        if (this.emptySeatNodes != []) {
            this.emptySeatNodes.forEach(function (item) {
                item.setParent(null);
                self.dataBox.remove(item);
            })
            this.emptySeatNodes = [];
        }

    },
    createRackSeatNode: function (rackData, color) {

        var self = this;
        var rackNode = this.sceneManager.getNodeByDataOrId(rackData);
        var rackPos = rackNode.getPosition();
        var rackRot = rackNode.getRotation();
        var bb = rackNode.getBoundingBox();
        // 机位的高度不够被地板挡住了+10，把机位的大小改小，给相邻机位间加一点距离
        var seatNode;
        if (color == this.usedColor) {
            seatNode = make.Default.load({
                id: 'twaver.idc.seat',
                width: bb.max.x - bb.min.x - this.padding * 2,
                depth: bb.max.z - bb.min.z - this.padding * 2,
                height: this.height + 10,
                color: color,
                client: {
                    seat: true,
                }
            });
            seatNode.s({
                'front.m.color': self.borderColor,
                'back.m.color': self.borderColor,
                'left.m.color': self.borderColor,
                'right.m.color': self.borderColor
            });
        } else if (color == this.freeColor) {
            seatNode = make.Default.load({
                id: 'twaver.idc.seat',
                width: bb.max.x - bb.min.x - this.padding * 2,
                depth: bb.max.z - bb.min.z - this.padding * 2,
                height: this.height + 10,
                color: color,
                client: {
                    seat: true,
                }
            });
            var options = {
                width: bb.max.x - bb.min.x - this.padding * 2,
                height: bb.max.z - bb.min.z - this.padding * 2,
                borderColor: self.usedColor
            };
            var topImage = this.createTopImg(options);
            seatNode.s({
                'top.m.texture.image': topImage,
                'm.transparent': true,
                'top.m.color': 'white',
            });
        };
        seatNode.setClient('rackData', rackData);
        rackPos.y = rackPos.y - (bb.max.y - bb.min.y) / 2;
        seatNode.setParent(rackNode.getParent());
        seatNode.setPosition(rackPos);
        seatNode.setRotation(rackRot);
        seatNode.setClient(it.SceneManager.CLIENT_EXT_VITUAL, true);
        seatNode.s({
            'm.type': 'basic',
        });
        return seatNode;
    },

    setRackSeatNodeParent: function (rackSeatNode) {
        var rackData = rackSeatNode.getClient('rackData');
        var rackNode = this.sceneManager.getNodeByDataOrId(rackData);
        rackSeatNode.setParent(rackNode.getParent());
        return rackSeatNode;
    },

    createTopImg: function (options) {
        var width = options.width,
            height = options.height,
            borderColor = options.borderColor;
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.width = mono.Utils.nextPowerOfTwo(width);
        canvas.height = mono.Utils.nextPowerOfTwo(height);
        
        context.save();
        context.beginPath();
        context.strokeStyle = borderColor;
        context.lineWidth = '8';
        context.strokeRect(0,0,canvas.width,canvas.height);
        context.stroke();
        context.closePath();
        context.restore();
        return canvas;
    },

});

it.SeatManager = $SeatManager;
