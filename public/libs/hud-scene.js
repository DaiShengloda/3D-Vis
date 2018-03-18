function hor(type, value) {
    return type + ':' + Math.round(value / 1920 / 2 * 100) + '%'
}
function ver(type, value) {
    return type + ':' + Math.round(value / 1080 / 2 * 100) + '%'
}

var scene = hud.scene = {
    shapes: [],
    sceneMap: {
        index: {
            title: '首页',
            shapes: ['frameData', 'frameTime', 'frame-left-top', 'frame-left-bottom',
                , 'frame-right-top', 'frame-right-bottom', 'frame-bottom-split', 'frame-title', 'navbar-logo'
                , 'navbar', 'big-labels', 'big-legends', 'six-legends'
                , 'factory-count', 'trade-chart', 'line-loss-rate-chart'],
            init: function (viewContext) {

            }
        },
        asset: {
            title: '资产档案',
            shapes: ['frameData', 'frameTime', 'frame-left-top', 'frame-left-bottom'
                , 'frame-right-top', 'frame-right-bottom', 'frame-bottom-split', 'frame-title', 'navbar-logo'
                , 'navbar', 'big-legends', 'six-legends',
                'electric-factory-count', 'electric-energe-meter-count', 'voltage-count-chart', 'current-count-chart'],
            init: function (viewContext) {

            }
        },
        scene: {
            title: '现场检测',
            shapes: ['frameData', 'frameTime', 'frame-left-top', 'frame-left-bottom'
                , 'frame-right-top', 'frame-right-bottom', 'frame-bottom-split', 'frame-title', 'navbar-logo'
                , 'navbar', 'big-legends', 'six-legends',
                'nergyMeter_state_count', 'errorDistribution_of_electricEnergyMeter', 'current_year_clock_deviation'],
            init: function (viewContext) {

            }
        },
        regionLine: {
            title: '分区线损',
            shapes: ['frameData', 'frameTime', 'frame-left-top', 'frame-left-bottom'
                , 'frame-right-top', 'frame-right-bottom', 'frame-bottom-split', 'frame-title', 'navbar-logo'
                , 'navbar', 'big-legends', 'six-legends', 'regional_division',
            ],
            allRegionShapes: ['regional_meter_count', 'regional_energe_meter_count', 'regional_energy_count'],//全国
            regionShapes: ['regional_desc', 'region_line_loss_rate_chart', 'line_loss_rate_chart'],//区域
            init: function (viewContext) {

                var children = viewContext.allShapeMap['regional_division'].children;
                if (children && children.length > 0) {
                    children[children.length - 1].selected = true;
                }
                scene.setVisible(this.regionShapes, false);
                scene.setVisible(this.allRegionShapes, true);
            },
            destroy: function (viewContext) {
                scene.setVisible(this.regionShapes, false);
                scene.setVisible(this.allRegionShapes, false);
            }
        },
        voltageLine: {
            title: '分压线损',
            shapes: ['frameData', 'frameTime', 'frame-left-top', 'frame-left-bottom'
                , 'frame-right-top', 'frame-right-bottom', 'frame-bottom-split', 'frame-title', 'navbar-logo'
                , 'navbar', 'big-legends', 'six-legends',
                'time_energy_loss_rate'],
            init: function (viewContext) {

            }
        },
        region: {//第二屏
            shapes: ['frameData', 'frameTime', 'frame-left-top', 'frame-left-bottom'
                , 'frame-right-top', 'frame-right-bottom', 'frame-bottom-split', 'frame-title', 'navbar-logo'
                , 'navbar', 'big-legends', 'six-legends'],
            init: function (viewContext) {

            }
        },
        staton: {//第三屏
            shapes: ['frameData', 'frameTime', 'frame-left-top', 'frame-left-bottom'
                , 'frame-right-top', 'frame-right-bottom', 'frame-bottom-split', 'frame-title', 'navbar-logo'
                , 'navbar', 'big-legends', 'six-legends'],
            init: function (viewContext) {

            }
        }
    },
    init: function () {

        this.initShapes();
        this.initScene();
        this.setVisible(this.shapes, false);
    },
    setVisible: function (shapes, v) {
        var self = this;
        shapes.forEach(function (s) {
            if (typeof s == 'string') {
                self.viewContext.allShapeMap[s].visible = v;
            } else {
                s.visible = v;
            }
        })
    },
    initShapes: function () {
        var shapes = this.shapes;
        /** 首页 **/
        //外面的边框
        shapes.push({
            x: 0,
            y: 0,
            hor: hor("left", 1050),
            ver: ver("top", 86),
            name: 'frameLine',
            id: 'frame-left-top'
        });
        shapes.push({
            x: 0,
            y: 0,
            hor: hor("right", 1060),
            ver: ver("top", 86),
            rotate: Math.PI,
            name: 'frameLine',
            id: 'frame-right-top'
        });
        shapes.push({
            x: 0,
            y: 0,
            hor: hor("left", 1050),
            ver: ver("bottom", 76),
            name: 'frameLine',
            id: 'frame-left-bottom'
        });
        shapes.push({
            x: 0,
            y: 0,
            rotate: Math.PI,
            hor: hor("right", 1060),
            ver: ver("bottom", 76),
            name: 'frameLine',
            id: 'frame-right-bottom'
        });
        shapes.push({
            x: 0,
            y: 0,
            hor: hor("left", 1918),
            ver: ver("bottom", 76),
            name: 'frameTimeSplitLine',
            id: 'frame-bottom-split'
        });
        shapes.push({
            x: 0,
            y: 0,
            w: 600,
            h: 70,
            cache: true,
            hor: hor("left", 1925),
            ver: ver("top", 86),
            name: 'main-text',
            origin: {
                x: 0.5,
                y: 0.5
            },
            data: {
                textAlign: 'center',
                textBaseline: 'middle',
                size: '60px',
                text: '跨区厂站与线路分析',
                color: 'rgba(0, 177, 255, 1)'
            },
            id: 'frame-title'
        });

        //地下边框上的日期
        shapes.push({
            id: 'frameData',
            hor: hor("left", 1740),
            ver: ver("bottom", 76),
            name: 'frameDate',
            cache: true,
            clip: true,
        });
        //地下边上上的时间
        shapes.push({
            id: 'frameTime',
            hor: hor("left", 2138),
            ver: ver("bottom", 76),
            name: 'frameTime',
            cache: true,
            clip: true,
        });
        //左上角导航按钮
        shapes.push({
            id: 'navbar',
            hor: hor('left', 285),
            ver: ver('top', 253),
            name: "homepage-navbar-title",
        });
        shapes.push({
            id: 'navbar-logo',
            hor: hor('left', 285),
            ver: ver('top', 253),
            name: "image-center",
            data: {
                image: 'logo-12'
            }
        });
        //左侧四个大标签
        shapes.push({
            id: 'big-labels',
            hor: -100,
            ver: ver('top', 560),
            children: this.getIndexBigLabel(),
        });
        //左侧底下很多图例
        shapes.push({
            id: 'big-legends',
            hor: 130,
            ver: 'bottom:670',
            interact: true,
            selectable: true,
            clip: true,
            name: "index-left-bottom-legend-on-off",
            children: [
                {
                    x: 380,
                    y: -42,
                    name: "index-left-bottom-legend-right"
                },
                {
                    id: 'index-left-bottom-legend-item-group',
                    children: this.getIndexLegand()
                }
            ]
        });
        //左侧地下 6个图例
        shapes.push({
            id: 'six-legends',
            name: "index-left-bottom-menu",
            hor: 'left:580',
            ver: ver('bottom', 560),
            scale: 1,
            // interact:true,
            // draggable:true,
        });

        //右上角图表 - 厂站数量
        shapes.push({
            id: 'factory-count',
            hor: "right:260",
            ver: ver("top", 400),
            children: [
                {
                    id: 'factory-count-chart',
                    "name": "index-right-top-legend-circle",
                    // interact: true,
                    // clip: true,
                    data: {
                        items: [
                            { "value": "54", "label": 2013 },
                            { "value": "62", "label": 2014 },
                            { "value": "74", "label": 2015 },
                            { "value": "81", "label": 2016 },
                            { "value": "95", "label": 2017 },
                        ]
                    }
                },
                {
                    name: "index-right-big-label-count",
                    x: -650,
                    y: -300,
                }
            ]

        });

        //右边中间图表 - 交易电量
        shapes.push({
            id: 'trade-chart',
            hor: "right:1000",
            ver: ver("top", 1320),
            children: [
                {
                    name: "lineEchart",
                    cache: true,
                    clip: true,
                    id: 'transaction_elec',
                    data: {
                        items: [{
                            label: 2013,
                            value: 57840
                        }, {
                            label: 2014,
                            value: 59600
                        }, {
                            label: 2015,
                            value: 74820
                        }, {
                            label: 2016,
                            value: 72310
                        }, {
                            label: 2017,
                            value: 77540
                        }],
                    }
                },
                {
                    name: "index-right-big-label-trade",
                    x: -80,
                    y: -580,
                },
                {
                    name: "main-text",
                    x: 350,
                    y: -510,
                    data: {
                        text: '单位 : 亿（kwn）',
                        size: '36px',
                        color: 'rgba(35, 170, 233, 1)'
                    }
                }
            ]
        });
        //右边地下 - 线损率
        shapes.push({
            id: 'line-loss-rate-chart',
            hor: "right:1250",
            ver: "bottom:250",
            children: [
                {
                    id: 'lossChart',
                    name: "lossChart",
                    cache: true,
                    clip: true,
                    // interact: true,
                    // draggable: true,
                    data: {
                        items: [
                            {
                                "label": "2013",
                                "value": 6.92
                            },
                            {
                                "label": "2014",
                                "value": 6.53
                            },
                            {
                                "label": "2015",
                                "value": 4.89
                            },
                            {
                                "label": "2016",
                                "value": 7.02
                            },
                            {
                                "label": "2017",
                                "value": 5.31
                            }
                        ]
                    },

                }, {
                    name: "index-right-big-label-line",
                    x: 145,
                    y: -540,
                    data: {
                        pathName: '2-07',
                        label: '线损率',
                        offsetX: 100
                    }
                }
            ]
        });

        /** 资产档案 **/
        //又上 - 厂站运行年限统计
        shapes.push({
            id: 'electric-factory-count',
            hor: 'right:900',
            ver: ver('top', 150),
            visible: false,
            syncVisible: true,
            children: [{
                hor: 0,
                ver: 0,
                name: 'table_title',
                data: {
                    text: '厂站运行年限统计（单位：座）'
                },
            }, {
                name: 'chart-echart',
                visible: false,
                id: 'electric-factory-count-chart',
                w: 800,
                h: 360,
                x: 20,
                y: 70,
                data: {
                    option: {
                        grid: {
                            top: 15,
                            left: 60,
                            right: 0,
                            bottom: 40
                        },
                        xAxis: {
                            data: ['运行15年', '运行13年', '运行10年', '运行8年', '运行五年'],
                            axisLine: {
                                lineStyle: {
                                    color: 'rgba(1,168,239,1)',
                                    width: 3
                                }
                            },
                            axisTick: {
                                length: 12,
                                lineStyle: {
                                    width: 3
                                }
                            },
                            axisLabel: {
                                margin: 21,
                                textStyle: {
                                    color: 'rgba(1,168,239,1)',
                                    fontSize: 24,
                                    align: 'center',
                                    fontFamily: 'Microsoft Yahei'

                                }
                            },
                            silent: true,

                        },
                        yAxis: {
                            type: 'value',
                            splitNumber: 5,
                            boundaryGap: [0, '60%'],
                            axisLine: {
                                lineStyle: {
                                    color: 'rgba(1,168,239,1)',
                                    width: 3
                                }
                            },
                            axisTick: {
                                length: 12,
                                lineStyle: {
                                    width: 3
                                }
                            },
                            axisLabel: {
                                margin: 55,
                                textStyle: {
                                    color: 'rgba(1,168,239,1)',
                                    fontSize: 18,
                                    align: 'left',
                                    fontFamily: 'Pirulen'
                                }
                            },
                            silent: true,
                            splitLine: {
                                show: true,
                                lineStyle: {
                                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
                                        offset: 0,
                                        color: 'rgba(0, 177, 251, 0.1)'
                                    }, {
                                        offset: 0.5,
                                        color: 'rgba(0, 177, 251, 0.9)'
                                    }, {
                                        offset: 1,
                                        color: 'rgba(0, 177, 251, 0.1)'
                                    }]),
                                    width: 3
                                }
                            }
                        },
                        series: [{
                            name: '电能表数量',
                            type: 'bar',
                            barWidth: 44,
                            data: [19, 9, 29, 15, 5],
                            itemStyle: {
                                normal: {
                                    color: new echarts.graphic.LinearGradient(0, 0, 0.5, 1, [{
                                        offset: 0,
                                        color: 'rgba(0,177,251,1)'
                                    }, {
                                        offset: 1,
                                        color: 'rgba(0,177,251,.3)'
                                    }])
                                }
                            }
                        }],
                        label: {
                            normal: {
                                show: true,
                                position: 'top',
                                textStyle: {
                                    color: 'rgba(255,231,68,0.8)',
                                    fontSize: 26,
                                    fontFamily: 'Pirulen'
                                }
                            },
                            emphasis: {
                                show: true,
                                position: 'top',
                                textStyle: {
                                    color: 'rgba(255,231,68,0.8)',
                                    fontSize: 26,
                                    fontFamily: 'Pirulen'
                                }
                            }
                        }
                    }
                }
            }]
        });
        //右上 - 电能表数量统计
        shapes.push({
            id: 'electric-energe-meter-count',
            hor: 'right:900',
            ver: ver('top', 600),
            visible: false,
            syncVisible: true,
            children: [{
                hor: 0,
                ver: 0,
                name: 'table_title',
                data: {
                    text: '电能表数量统计'
                },
            }, {
                name: 'chart-echart',
                visible: false,
                id: 'chart-echart-electricEnergeMeterStatistics',
                w: 800,
                h: 360,
                x: 20,
                y: 70,
                data: {
                    option: {
                        grid: {
                            top: 15,
                            left: 60,
                            right: 0,
                            bottom: 40
                        },
                        xAxis: {
                            data: ['威胜集团', '炬华科技', '科陆电子', '华立仪表', '宁波三星'],
                            axisLine: {
                                lineStyle: {
                                    color: 'rgba(1,168,239,1)',
                                    width: 3
                                }
                            },
                            axisTick: {
                                length: 12,
                                lineStyle: {
                                    width: 3
                                }
                            },
                            axisLabel: {
                                margin: 21,
                                textStyle: {
                                    color: 'rgba(1,168,239,1)',
                                    fontSize: 24,
                                    align: 'center',
                                    fontFamily: 'Microsoft Yahei'

                                }
                            },
                            silent: true,

                        },
                        yAxis: {
                            type: 'value',
                            splitNumber: 5,
                            boundaryGap: [0, '60%'],
                            axisLine: {
                                lineStyle: {
                                    color: 'rgba(1,168,239,1)',
                                    width: 3
                                }
                            },
                            axisTick: {
                                length: 12,
                                lineStyle: {
                                    width: 3
                                }
                            },
                            axisLabel: {
                                margin: 55,
                                textStyle: {
                                    color: 'rgba(1,168,239,1)',
                                    fontSize: 18,
                                    align: 'left',
                                    fontFamily: 'Pirulen'
                                }
                            },
                            silent: true,
                            splitLine: {
                                show: true,
                                lineStyle: {
                                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
                                        offset: 0,
                                        color: 'rgba(0, 177, 251, 0.1)'
                                    }, {
                                        offset: 0.5,
                                        color: 'rgba(0, 177, 251, 0.9)'
                                    }, {
                                        offset: 1,
                                        color: 'rgba(0, 177, 251, 0.1)'
                                    }]),
                                    width: 3
                                }
                            }
                        },
                        series: [{
                            name: '电能表数量',
                            type: 'bar',
                            barWidth: 44,
                            data: [19, 9, 29, 15, 5],
                            itemStyle: {
                                normal: {
                                    color: new echarts.graphic.LinearGradient(0, 0, 0.5, 1, [{
                                        offset: 0,
                                        color: 'rgba(0,177,251,1)'
                                    }, {
                                        offset: 1,
                                        color: 'rgba(0,177,251,.3)'
                                    }])
                                }
                            }
                        }],
                        label: {
                            normal: {
                                show: true,
                                position: 'top',
                                textStyle: {
                                    color: 'rgba(255,231,68,0.8)',
                                    fontSize: 26,
                                    fontFamily: 'Pirulen'
                                }
                            },
                            emphasis: {
                                show: true,
                                position: 'top',
                                textStyle: {
                                    color: 'rgba(255,231,68,0.8)',
                                    fontSize: 26,
                                    fontFamily: 'Pirulen'
                                }
                            }
                        }
                    }
                }
            }]
        });
        //右中 -电压互感器
        shapes.push({
            id: 'voltage-count-chart',
            hor: 'right:1065',
            ver: ver('top', 1050),
            visible: false,
            syncVisible: true,
            children: [
                {
                    name: 'table_title',
                    data: {
                        text: '电压互感器数量统计'
                    }
                },
                {
                    id: 'chart-echart-voltageTransformerStatistics-left',
                    w: 410,
                    h: 462,
                    hor: 110,
                    ver: 50,
                    name: 'chart-echart',
                    visible: false,
                    data: {
                        option: {
                            title: {
                                text: '按变比数量分布',
                                textStyle: {
                                    color: 'rgba(0,178,255,1)',
                                    fontFamily: 'Microsoft Yahei',
                                    fontSize: 28
                                },
                                right: 50,
                                top: 5
                            },
                            grid: {
                                top: 40,
                                bottom: 50,
                                left: 116,
                                right: 0
                            },
                            xAxis: [{
                                show: true,
                                type: 'value',
                                splitNumber: 5,
                                silent: true,
                                inverse: true,
                                axisLine: {
                                    lineStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    }
                                },
                                axisTick: {
                                    length: 10,
                                    lineStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    }
                                },
                                axisLabel: {
                                    margin: 25,
                                    textStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        fontFamily: 'Pirulen',
                                        fontSize: 18
                                    }
                                },
                                splitLine: {
                                    show: false
                                },
                            }],
                            yAxis: [{
                                position: 'left',
                                data: ['300kv', '320kv', '350kv', '400kv', '450kv', '500kv', '520kv', '530kv', '800kv', '1000kv'],
                                axisLabel: {
                                    margin: 100,
                                    textStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        fontFamily: 'Microsoft Yahei',
                                        align: "left",
                                        fontSize: 24
                                    }
                                },
                                axisLine: {
                                    onZero: false,
                                    lineStyle: {
                                        show: true,
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    }
                                },
                                splitLine: {
                                    show: false
                                },
                                axisTick: {
                                    length: 10,
                                    alignWithLabel: true,
                                    lineStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    }
                                },
                            }],
                            series: [{
                                name: '按变比数量分布',
                                type: 'bar',
                                barWidth: 12,
                                data: [Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50],
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(0, 178, 255， 1)'
                                    },
                                    emphasis: {
                                        color: 'rgba(0, 178, 255， 1)'
                                    }
                                }
                            }]
                        }
                    }
                },
                {
                    id: 'chart-echart-voltageTransformerStatistics-right',
                    hor: 520,
                    ver: 50,
                    w: 496,
                    h: 462,
                    name: 'chart-echart',
                    visible: false,
                    data: {
                        option: {
                            title: {
                                text: '按厂家分布',
                                textStyle: {
                                    color: 'rgba(0,178,255,1)',
                                    fontFamily: 'Microsoft Yahei',
                                    fontSize: 28
                                },
                                left: 50,
                                top: 5
                            },
                            grid: {
                                top: 40,
                                bottom: 50,
                                left: 0,
                                right: 188
                            },
                            xAxis: [{
                                show: true,
                                type: 'value',
                                splitNumber: 5,
                                silent: true,
                                axisLine: {
                                    lineStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    }
                                },
                                axisTick: {
                                    length: 10,
                                    lineStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    }
                                },
                                axisLabel: {
                                    margin: 25,
                                    textStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        fontFamily: 'Pirulen',
                                        fontSize: 18
                                    }
                                },
                                splitLine: {
                                    show: false
                                },
                            }],
                            yAxis: [{
                                position: 'right',
                                data: ['东润电器', '安徽互感器', '上海福开电器', '上海巨广电器', '江临电器',
                                    '东润电器', '安徽互感器', '上海福开电器', '上海巨广电器', '江临电器'],
                                axisLabel: {
                                    margin: 20,
                                    textStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        fontFamily: 'Pirulen',
                                        align: "left",
                                        fontSize: 22
                                    }
                                },
                                axisLine: {
                                    onZero: false,
                                    lineStyle: {
                                        show: true,
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    }
                                },
                                splitLine: {
                                    show: false
                                },
                                axisTick: {
                                    length: 10,
                                    alignWithLabel: true,
                                    lineStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    }
                                },
                            }],
                            series: [{
                                name: '按厂家分布',
                                type: 'bar',
                                barWidth: 12,
                                data: [Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50],
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(0, 210, 210, 1)'
                                    }
                                }
                            }]
                        }
                    }
                },
                {
                    name: 'statistics_of_transformer_line',
                    hor: 520,
                    ver: 100
                }]
        });
        //右下 -电流互感器
        shapes.push({
            id: 'current-count-chart',
            hor: 'right:1065',
            ver: ver('top', 1550),
            visible: false,
            syncVisible: true,
            children: [
                {
                    name: 'table_title',
                    data: {
                        text: '电流互感器数量统计'
                    }
                },
                {
                    id: 'chart-echart-currentTransformerStatistics-left',
                    w: 410,
                    h: 462,
                    hor: 110,
                    ver: 50,
                    name: 'chart-echart',
                    visible: false,
                    data: {
                        option: {
                            title: {
                                text: '按变比数量分布',
                                textStyle: {
                                    color: 'rgba(0,178,255,1)',
                                    fontFamily: 'Microsoft Yahei',
                                    fontSize: 28
                                },
                                right: 50,
                                top: 5
                            },
                            grid: {
                                top: 40,
                                bottom: 50,
                                left: 116,
                                right: 0
                            },
                            xAxis: [{
                                show: true,
                                type: 'value',
                                splitNumber: 5,
                                silent: true,
                                inverse: true,
                                axisLine: {
                                    lineStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    }
                                },
                                axisTick: {
                                    length: 10,
                                    lineStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    }
                                },
                                axisLabel: {
                                    margin: 25,
                                    textStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        fontFamily: 'Pirulen',
                                        fontSize: 18
                                    }
                                },
                                splitLine: {
                                    show: false
                                },
                            }],
                            yAxis: [{
                                position: 'left',
                                data: ['300kv', '320kv', '350kv', '400kv', '450kv', '500kv', '520kv', '530kv', '800kv', '1000kv'],
                                axisLabel: {
                                    margin: 100,
                                    textStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        fontFamily: 'Microsoft Yahei',
                                        align: "left",
                                        fontSize: 24
                                    }
                                },
                                axisLine: {
                                    onZero: false,
                                    lineStyle: {
                                        show: true,
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    }
                                },
                                splitLine: {
                                    show: false
                                },
                                axisTick: {
                                    length: 10,
                                    alignWithLabel: true,
                                    lineStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    }
                                },
                            }],
                            series: [{
                                name: '按变比数量分布',
                                type: 'bar',
                                barWidth: 12,
                                data: [Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50],
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(0, 178, 255， 1)'
                                    },
                                    emphasis: {
                                        color: 'rgba(0, 178, 255， 1)'
                                    }
                                }
                            }]
                        }
                    }
                },
                {
                    id: 'chart-echart-currentTransformerStatistics-right',
                    hor: 520,
                    ver: 50,
                    w: 496,
                    h: 462,
                    name: 'chart-echart',
                    visible: false,
                    data: {
                        option: {
                            title: {
                                text: '按厂家分布',
                                textStyle: {
                                    color: 'rgba(0,178,255,1)',
                                    fontFamily: 'Microsoft Yahei',
                                    fontSize: 28
                                },
                                left: 50,
                                top: 5
                            },
                            grid: {
                                top: 40,
                                bottom: 50,
                                left: 0,
                                right: 188
                            },
                            xAxis: [{
                                show: true,
                                type: 'value',
                                splitNumber: 5,
                                silent: true,
                                axisLine: {
                                    lineStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    }
                                },
                                axisTick: {
                                    length: 10,
                                    lineStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    }
                                },
                                axisLabel: {
                                    margin: 25,
                                    textStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        fontFamily: 'Pirulen',
                                        fontSize: 18
                                    }
                                },
                                splitLine: {
                                    show: false
                                },
                            }],
                            yAxis: [{
                                position: 'right',
                                data: ['东润电器', '安徽互感器', '上海福开电器', '上海巨广电器', '江临电器',
                                    '东润电器', '安徽互感器', '上海福开电器', '上海巨广电器', '江临电器'],
                                axisLabel: {
                                    margin: 20,
                                    textStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        fontFamily: 'Pirulen',
                                        align: "left",
                                        fontSize: 22
                                    }
                                },
                                axisLine: {
                                    onZero: false,
                                    lineStyle: {
                                        show: true,
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    }
                                },
                                splitLine: {
                                    show: false
                                },
                                axisTick: {
                                    length: 10,
                                    alignWithLabel: true,
                                    lineStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    }
                                },
                            }],
                            series: [{
                                name: '按厂家分布',
                                type: 'bar',
                                barWidth: 12,
                                data: [Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50],
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(0, 210, 210, 1)'
                                    }
                                }
                            }]
                        }
                    }
                },
                {
                    name: 'statistics_of_transformer_line',
                    hor: 520,
                    ver: 100
                }]
        });

        //电能表运行状态分布
        shapes.push({
            id: 'nergyMeter_state_count',
            hor: "right:1100",
            ver: ver("top", 150),
            "name": "table_title",
            data: {
                text: '电能表运行状态分布'
            },
            children: [{
                hor: 112,
                ver: 70,
                name: "energyMeter_state",
                id: 'energyMeter_state_distribute',
                data: {
                    items: [{
                        status: '稳定',
                        count: 85
                    },
                    {
                        status: '预警',
                        count: 8
                    }, {
                        status: '正常',
                        count: 65
                    }],
                },
            }]
        })
        //电能表误差分布
        shapes.push({
            id: 'errorDistribution_of_electricEnergyMeter',
            hor: "right:1100",
            ver: ver("top", 740),
            syncVisible: true,
            children: [
                {
                    name: 'table_title',
                    hor: 100,
                    ver: 0,
                    data: {
                        text: '电能表误差分布'
                    }
                }, {
                    hor: 550,
                    ver: 50,
                    name: 'main-text',
                    data: {
                        text: '数量／个',
                        color: 'rgba(0, 178, 255, 1)',
                        size: '24px'
                    }
                }, {
                    hor: 700,
                    ver: 50,
                    name: 'main-text',
                    data: {
                        text: '误差约对值%',
                        color: 'rgba(0, 178, 255, 1)',
                        size: '24px'
                    }
                }, {
                    name: 'chart-echart',
                    id: 'chart-echart-errorDistribution_of_electricEnergyMeter',
                    visible: false,
                    hor: 0,
                    ver: 50,
                    w: 900,
                    h: 560,
                    data: {
                        option: {
                            grid: {
                                bottom: 100
                            },
                            xAxis: {
                                position: 'bottom',
                                data: (function () {
                                    var arr = [];
                                    for (var i = -0.34; i < 0.35; i += 0.04) {
                                        arr.push(i.toFixed(2));
                                    }
                                    return arr;
                                })(),
                                boundaryGap: ['5%', '5%'],
                                minInterval: 0.04,
                                axisLine: {
                                    lineStyle: {
                                        color: 'rgba(0,182,255,1)',
                                        width: 2
                                    }
                                },
                                axisTick: {
                                    length: 12,
                                    lineStyle: {
                                        width: 2
                                    },
                                    // alignWithLabel: true
                                },
                                axisLabel: {
                                    show: true,
                                    interval: 0,
                                    rotate: -45,
                                    margin: 50,
                                    textStyle: {
                                        color: 'rgba(0,182,255,1)',
                                        fontSize: 18,
                                        align: 'center',
                                        fontFamily: 'Pirulen'

                                    }
                                },
                                silent: true,

                            },
                            yAxis: {
                                type: 'value',
                                minInterval: 10,
                                splitNumber: 9,
                                min: 0,
                                axisLine: {
                                    show: false
                                },
                                axisTick: {
                                    show: false
                                },
                                axisLabel: {
                                    margin: 48,
                                    textStyle: {
                                        color: 'rgba(1,168,239,1)',
                                        fontSize: 18,
                                        align: 'left',
                                        fontFamily: 'Pirulen'
                                    }
                                },
                                silent: true,
                                splitLine: {
                                    show: true,
                                    lineStyle: {
                                        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
                                            offset: 0,
                                            color: 'rgba(0, 177, 251, 0.3)'
                                        }, {
                                            offset: 0.5,
                                            color: 'rgba(0, 177, 251, 1)'
                                        }, {
                                            offset: 1,
                                            color: 'rgba(0, 177, 251, 0.3)'
                                        }]),
                                        width: 2
                                    }
                                }
                            },
                            series: [{
                                name: '电能表误差分布',
                                type: 'bar',
                                barWidth: 16,
                                data: [14, 11, 15, 18, 21, 42, 57, 75, 75, 90, 80, 74, 66, 9, 16, 20, 10, 9],
                                itemStyle: {
                                    normal: {
                                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                            offset: 0,
                                            color: 'rgba(0,177,251,.7)'
                                        }, {
                                            offset: 1,
                                            color: 'rgba(0,177,251,.3)'
                                        }])
                                    }
                                }
                            }],
                            label: {
                                normal: {
                                    show: true,
                                    position: 'top',
                                    textStyle: {
                                        color: 'rgba(255,231,68,0.8)',
                                        fontSize: 18,
                                        fontFamily: 'Pirulen'
                                    }
                                },
                                emphasis: {
                                    show: true,
                                    position: 'top',
                                    textStyle: {
                                        color: 'rgba(255,231,68,0.8)',
                                        fontSize: 18,
                                        fontFamily: 'Pirulen'
                                    }
                                }
                            }
                        }
                    }
                }]
        });
        //近一年故障及处理情况  已删除？
        shapes.push({
            id: 'alarm-recent-year',
            hor: "right:1100",
            ver: ver("top", 1500),
            syncVisible: true,
            children: [{
                name: 'table_title',
                hor: 70,
                ver: 0,
                data: {
                    text: '近一年故障及处理情况'
                }
            }, {
                name: 'chart-echart',
                visible: false,
                hor: 0,
                ver: 60,
                w: 900,
                h: 560,
                data: {
                    option: option = {
                        legend: {
                            right: '12%',
                            top: '4%',
                            data: [{
                                name: '2016',
                                icon: 'circle',
                                textStyle: {
                                    color: 'rgba(90, 255, 255, 1)',
                                    fontSize: '16px'
                                }
                            }]
                        },
                        xAxis: {
                            position: 'bottom',
                            data: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月",],
                            boundaryGap: ['5%', '5%'],
                            axisLine: {
                                lineStyle: {
                                    color: 'rgba(0,182,255,1)',
                                    width: 2
                                }
                            },
                            axisTick: {
                                length: 12,
                                lineStyle: {
                                    width: 2
                                },
                                alignWithLabel: true
                            },
                            axisLabel: {
                                show: true,
                                interval: 0,
                                margin: 20,
                                textStyle: {
                                    color: 'rgba(0,182,255,1)',
                                    fontSize: 18,
                                    align: 'center',
                                    fontFamily: 'Pirulen'

                                }
                            },
                            silent: true,

                        },
                        yAxis: {
                            type: 'value',
                            splitNumber: 7,
                            min: 0,
                            boundaryGap: ['5%', '35%'],
                            axisLine: {
                                show: false
                            },
                            axisTick: {
                                show: false
                            },
                            axisLabel: {
                                margin: 48,
                                textStyle: {
                                    color: 'rgba(1,168,239,1)',
                                    fontSize: 18,
                                    align: 'left',
                                    fontFamily: 'Pirulen'
                                }
                            },
                            silent: true,
                            splitLine: {
                                show: true,
                                lineStyle: {
                                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
                                        offset: 0,
                                        color: 'rgba(0, 177, 251, 0.3)'
                                    }, {
                                        offset: 0.5,
                                        color: 'rgba(0, 177, 251, 1)'
                                    }, {
                                        offset: 1,
                                        color: 'rgba(0, 177, 251, 0.3)'
                                    }]),
                                    width: 2
                                }
                            }
                        },
                        series: [{
                            name: '2016',
                            type: 'line',
                            data: [
                                { value: 12, total: 12 },
                                { value: 6, total: 6 },
                                { value: 10, total: 9 },
                                { value: 4, total: 4 },
                                { value: 14, total: 14 },
                                { value: 23, total: 20 },
                                { value: 12, total: 12 },
                                { value: 16, total: 15 },
                                { value: 6, total: 5 },
                                { value: 3, total: 3 },
                                { value: 2, total: 2 },
                                { value: 6, total: 6 }
                            ],
                            label: {
                                normal: {
                                    show: true,
                                    formatter: function (Object) {

                                        return Object.value + '/' + Object.data.total;
                                    },
                                    textStyle: {
                                        color: 'rgba(255,231,68,0.8)',
                                        fontSize: 18,
                                        fontFamily: 'Pirulen'
                                    }
                                }
                            },
                            symbol: 'circle',
                            symbolSize: 8,
                            itemStyle: {
                                normal: {
                                    color: 'rgba(90, 255, 255, 1)',
                                    shadowBlur: 16,
                                    shadowColor: 'rgba(200, 255, 255, 1)'
                                }
                            },
                        }],
                    }
                }
            }]
        })
        //当年时钟偏差统计
        shapes.push({
            id: 'current_year_clock_deviation',
            hor: "right:1020",
            ver: ver("top", 1535),
            syncVisible: true,
            children: [{
                name: 'table_title',
                hor: 40,
                ver: 0,
                data: {
                    text: '当年时钟偏差统计'
                }
            }, {
                hor: 600,
                ver: 50,
                name: 'main-text',
                data: {
                    text: '单位:(分钟)',
                    color: 'rgba(0, 178, 255, 1)',
                    size: '24px'
                }
            }, {
                name: 'chart-echart',
                id: 'chart-echart-current_year_clock_deviation',
                visible: false,
                hor: 0,
                ver: 100,
                w: 880,
                h: 400,
                data: {
                    option: option = {
                        xAxis: {
                            data: ['>10', '9-10', '8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '<1'],
                            axisLine: {
                                lineStyle: {
                                    color: 'rgba(1,168,239,1)',
                                    width: 3
                                }
                            },
                            axisTick: {
                                length: 12,
                                lineStyle: {
                                    width: 3
                                }
                            },
                            axisLabel: {
                                margin: 21,
                                interval: 0,
                                textStyle: {
                                    color: 'rgba(1,168,239,1)',
                                    fontSize: 24,
                                    align: 'center',
                                    fontFamily: 'Pirulen'

                                }
                            },
                            silent: true,

                        },
                        yAxis: {
                            type: 'value',
                            splitNumber: 5,
                            boundaryGap: [0, '60%'],
                            axisLine: {
                                lineStyle: {
                                    color: 'rgba(1,168,239,1)',
                                    width: 3
                                }
                            },
                            axisTick: {
                                length: 12,
                                lineStyle: {
                                    width: 3
                                }
                            },
                            axisLabel: {
                                margin: 35,
                                textStyle: {
                                    color: 'rgba(1,168,239,1)',
                                    fontSize: 18,
                                    align: 'left',
                                    fontFamily: 'Pirulen'
                                }
                            },
                            splitLine: {
                                show: true,
                                lineStyle: {
                                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
                                        offset: 0,
                                        color: 'rgba(0, 177, 251, 0.1)'
                                    }, {
                                        offset: 0.5,
                                        color: 'rgba(0, 177, 251, 0.9)'
                                    }, {
                                        offset: 1,
                                        color: 'rgba(0, 177, 251, 0.1)'
                                    }]),
                                    width: 3
                                }
                            }
                        },
                        series: [{
                            name: '时钟偏差',
                            type: 'bar',
                            barWidth: 26,
                            data: [5, 3, 1, 4, 3, 2, 4, 5, 8, 0, 2],
                            itemStyle: {
                                normal: {
                                    color: new echarts.graphic.LinearGradient(0, 0, 0.5, 1, [{
                                        offset: 0,
                                        color: 'rgba(0,177,251,1)'
                                    }, {
                                        offset: 1,
                                        color: 'rgba(0,177,251,.3)'
                                    }])
                                }
                            },
                            label: {
                                normal: {
                                    show: true,
                                    position: 'top',
                                    formatter: '{c}' + '只',
                                    textStyle: {
                                        color: 'rgba(255,231,68,0.8)',
                                        fontSize: 26,
                                        fontFamily: '微软雅黑'
                                    }
                                }
                            }
                        }]
                    }
                }
            }]
        })
        //分区线损-区域列表
        shapes.push({
            id: 'regional_division',
            hor: "left:105",
            ver: ver("top", 560),
            name: "regional_division",
            data: {
                items: [
                    {
                        region: '东北-华北',
                        itemId: 'dongbei-huabei',
                    },
                    {
                        region: '华北-华中',
                        itemId: 'huabei-huazhong',
                    },
                    {
                        region: '西北-华北',
                        itemId: 'xibei-huabei',
                    },
                    {
                        region: '华中-华东',
                        itemId: 'huazhong-huadong',
                    },
                    {
                        region: '西南-华东',
                        itemId: 'xinan-huadong',
                    },
                    {
                        region: '华中-南网',
                        itemId: 'huazhong-nanwang',
                    },
                    {
                        region: '西北-华中',
                        itemId: 'xibei-huabei',
                    },
                    {
                        region: '西北-西南',
                        itemId: 'xibei-xinan',
                    },
                    {
                        region: '西北-华东',
                        itemId: 'xibei-huadong',
                    },
                    {
                        region: '东北-华北',
                        itemId: 'dongbei-xibei',
                    },
                    {
                        region: '中国区域',
                        itemId: 'all',
                    }]
            },
        })

        //分区线损-全国-跨区厂站共计计量点统计
        shapes.push({
            id: 'regional_meter_count',
            hor: "right:1100",
            ver: ver('top', 200),
            "name": "table_title",
            data: {
                text: '跨区厂站共计计量点259个'
            },
            syncVisible: true,
            children: [{
                hor: 112,
                ver: 70,
                name: "point_statistics",
                id: 'point_statistics',
                data: {
                    items: [
                        {
                            state: '考核',
                            number: 160
                        },
                        {
                            state: '结算',
                            number: 90
                        }
                    ],
                },
            }]
        });
        //分区线损-全国-区域交换电量级线损
        shapes.push({
            id: 'regional_energe_meter_count',
            hor: "right:1100",
            ver: ver('top', 800),
            syncVisible: true,
            children: [
                {
                    name: 'table_title',
                    data: {
                        text: '区域交换电量及线损率'
                    }
                }, {
                    w: 980,
                    h: 400,
                    hor: -40,
                    ver: 90,
                    name: 'chart-echart',
                    id: 'chart-echart-regional_energe_meter_count',
                    visible: false,
                    data: {
                        option: {
                            grid: {
                                left: 60,
                                top: 50,
                                right: 90,
                                bottom: 80,
                            },
                            legend: {
                                data: [{
                                    name: '送端电量',
                                    icon: 'rect'
                                }, {
                                    name: '线损率',
                                }],
                                textStyle: {
                                    fontSize: 18,
                                    color: 'rgba(0, 180, 255, 1)'
                                },
                                orient: 'vertical',
                                top: 78,
                                right: 111,
                                itemGap: 20,
                            },
                            xAxis: [{
                                type: 'category',
                                data: ['西南-华东', '西北-华北', '西北-华中', '东北-华北', '华北-华东', '华中-华东', '西北-华东', '西北-西南', '华中-南网', '华北-华中'],
                                axisLine: {
                                    lineStyle: {
                                        color: 'rgba(0, 182, 255, 1)',
                                        width: 2
                                    }
                                },
                                axisTick: {
                                    length: 11,
                                    lineStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    },
                                    interval: 0
                                },
                                axisLabel: {
                                    show: true,
                                    interval: 0,
                                    margin: 12,
                                    textStyle: {
                                        fontFamily: 'Microsoft Yahei',
                                        fontSize: 18
                                    },
                                    formatter: function (a) {
                                        var arr = a.split('送');
                                        return arr[0] + '\n⇂\n' + arr[1]
                                    }
                                },
                                splitLine: {
                                    show: false
                                }
                            }],
                            yAxis: [{
                                position: 'left',
                                type: 'value',
                                axisLabel: {
                                    show: false
                                },
                                axisLine: {
                                    lineStyle: {
                                        show: true,
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    }
                                },
                                splitLine: {
                                    show: false
                                },
                                axisTick: {
                                    length: 11,
                                    alignWithLabel: true,
                                    lineStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    },
                                },
                                name: '电量(百万kwh)',
                                nameLocation: 'middle',
                                nameTextStyle: {
                                    fontFamily: 'Microsoft Yahei',
                                    fontSize: 18,
                                    color: 'rgba(0,246,248,1)'
                                },
                                nameGap: 22,
                            }, {
                                position: 'right',
                                type: 'value',
                                splitNumber: 3,
                                axisLabel: {
                                    margin: 64,
                                    formatter: function (Object) {
                                        return (Object * 100).toFixed(0) + '%'
                                    },
                                    textStyle: {
                                        color: 'rgba(244, 221, 45, 1)',
                                        fontFamily: 'Pirulen',
                                        align: "right",
                                        fontSize: 20
                                    }
                                },
                                axisLine: {
                                    lineStyle: {
                                        show: true,
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    }
                                },
                                splitLine: {
                                    show: false
                                },
                                axisTick: {
                                    length: 11,
                                    alignWithLabel: true,
                                    lineStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    }
                                }
                            }],
                            series: [{
                                name: '送端电量',
                                type: 'bar',
                                data: [4406, 3714, 2888, 2091, 1376, 1090, 793, 716, 631, 496],
                                barWidth: 30,
                                itemStyle: {
                                    normal: {
                                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                            offset: 0,
                                            color: 'rgba(0,177,251,1)'
                                        }, {
                                            offset: 1,
                                            color: 'rgba(0,177,251,.3)'
                                        }])
                                    }
                                },
                                label: {
                                    normal: {
                                        show: true,
                                        position: 'top',
                                        textStyle: {
                                            color: 'rgba(244, 221, 45, 1)',
                                            fontFamily: 'Pirulen',
                                            fontSize: 14
                                        }
                                    }
                                }
                            }, {
                                name: '线损率',
                                type: 'line',
                                data: [0.04, 0.05, 0.038, 0.028, 0.022, 0.026, 0.035, 0.02, 0.027, 0.025],
                                yAxisIndex: 1,
                                symbol: 'circle',
                                symbolSize: 20,
                                showAllSymbol: true,
                                itemStyle: {
                                    normal: {
                                        color: {
                                            type: 'radial',
                                            x: 0.5,
                                            y: 0.5,
                                            r: 0.5,
                                            colorStops: [{
                                                offset: 0, color: 'rgba(118, 255, 255, 1)'
                                            }, {
                                                offset: 0.2, color: 'rgba(118, 255, 255, 1)'
                                            }, {
                                                offset: 0.25, color: 'rgba(118, 255, 255, 0.6)'
                                            }, {
                                                offset: 0.4, color: 'rgba(118, 255, 255, 0.9)'
                                            }, {
                                                offset: 1, color: 'rgba(118, 255, 255, 0)'
                                            }]
                                        }
                                    }
                                },
                                lineStyle: {
                                    normal: {
                                        color: 'rgba(118, 255, 255, 1)'
                                    }
                                }
                            }]
                        }
                    },
                    children: [{
                        hor: 276,
                        ver: 0,
                        name: 'exchange_general',
                        id: 'exchange_general2',
                        data: {
                            summary: "截至2017年4月，跨区输电线路交换电量为324433亿千瓦时，线损电量为4433亿千瓦时，线损率为3.54%"
                        }
                    }]
                }]
        });
        //分区线损-全国-直调电厂上网电量为22亿千瓦时
        shapes.push({
            id: 'regional_energy_count',
            hor: "right:1100",
            ver: ver('top', 1450),
            syncVisible: true,
            children: [
                {
                    name: 'table_title',
                    data: {
                        text: '直调电厂上网电量(本月 上月 去年同期)'
                    }
                }, {
                    w: 1020,
                    h: 430,
                    hor: -65,
                    ver: 70,
                    name: 'chart-echart',
                    id: 'chart-echart-regional_energy_count',
                    visible: false,
                    data: {
                        option: {
                            grid: {
                                left: 140,
                                top: 130,
                                right: 148,
                                bottom: 45,
                            },
                            legend: {
                                data: ['三峡左岸水电站', '三峡右岸水电站', '三峡地下水电站', '三峡地上水电站', '阳城水电站'],
                                textStyle: {
                                    fontSize: 16,
                                    color: 'rgba(0, 182, 255, 1)'
                                },
                                icon: 'rect',
                                orient: 'vertical',
                                top: 136,
                                right: 0,
                                itemGap: 12,
                            },
                            xAxis: [{
                                type: 'category',
                                data: ['本月', '上月', '去年同期'],
                                axisLine: {
                                    lineStyle: {
                                        color: 'rgba(0, 182, 255, 1)',
                                        width: 3
                                    }
                                },
                                axisTick: {
                                    length: 11,
                                    lineStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        width: 3
                                    }
                                },
                                axisLabel: {
                                    margin: 20,
                                    textStyle: {
                                        color: 'rgba(0,182,255,1)',
                                        fontFamily: 'Microsoft Yahei',
                                        align: "center",
                                        fontSize: 22
                                    }
                                },
                                splitLine: {
                                    show: false
                                }
                            }],
                            yAxis: [{
                                position: 'left',
                                type: 'value',
                                name: '电量(百万kwh)',
                                nameLocation: 'middle',
                                nameTextStyle: {
                                    fontFamily: 'Microsoft Yahei',
                                    fontSize: 18,
                                    color: 'rgba(0,246,248,1)'
                                },
                                nameGap: 122,
                                axisLabel: {
                                    margin: 78,
                                    formatter: '{value}',
                                    textStyle: {
                                        color: 'rgba(0,182,255,1)',
                                        fontFamily: 'Pirulen',
                                        align: "left",
                                        fontSize: 16
                                    }
                                },
                                axisLine: {
                                    lineStyle: {
                                        show: true,
                                        color: 'rgba(0,178,255,1)',
                                        width: 3
                                    }
                                },
                                splitLine: {
                                    show: false
                                },
                                axisTick: {
                                    length: 11,
                                    alignWithLabel: true,
                                    lineStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        width: 3
                                    }
                                }
                            }],
                            series: [{
                                name: '三峡左岸水电站',
                                type: 'bar',
                                data: [1250, 1250, 1250],
                                barWidth: 18,
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(244, 221, 45, 1)'
                                    },
                                    emphasis: {
                                        color: 'rgba(244, 221, 45, 1)'
                                    }
                                }
                            }, {
                                name: '三峡右岸水电站',
                                type: 'bar',
                                data: [2350, 2350, 2350],
                                barWidth: 18,
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(199, 191, 66, 1)'
                                    },
                                    emphasis: {
                                        color: 'rgba(199, 191, 66, 1)'
                                    }
                                }
                            }, {
                                name: '三峡地下水电站',
                                type: 'bar',
                                data: [650, 650, 650],
                                barWidth: 18,
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(0, 255, 255, 1)'
                                    },
                                    emphasis: {
                                        color: 'rgba(0, 255, 255, 1)'
                                    }
                                }
                            }, {
                                name: '三峡地上水电站',
                                type: 'bar',
                                data: [2000, 2000, 2000],
                                barWidth: 18,
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(0, 195, 199, 1)'
                                    },
                                    emphasis: {
                                        color: 'rgba(0, 195, 199, 1)'
                                    }
                                }
                            }, {
                                name: '阳城水电站',
                                type: 'bar',
                                data: [1700, 1700, 1700],
                                barWidth: 18,
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(0, 140, 156, 1)'
                                    },
                                    emphasis: {
                                        color: 'rgba(0, 140, 156, 1)'
                                    }
                                },
                                barGap: '50%'
                            }]
                        }
                    },
                    children: [{
                        hor: 276,
                        ver: 60,
                        name: 'exchange_general',
                        id: 'exchange_general1',
                        data: {
                            summary: "截至2017年4月，跨区输电线路交换电量为324433亿千瓦时，线损电量为4433亿千瓦时，线损率为3.54%"
                        }
                    }]
                }]
        });
        //分区线损-地区-华中送南网的总体概述
        shapes.push({
            id: 'regional_desc',
            hor: "right:1100",
            ver: ver('top', 250),
            children: [
                {
                    name: 'table_title',
                    data: {
                        text: '华中送南网的总体概述'
                    }
                }, {
                    w: 900,
                    h: 450,
                    hor: 210,
                    ver: 130,
                    name: 'general_overview',
                    data: {
                        general: '华中-南旺联络线由高傲的空间啊舒服呢的空间散发科技大厦奶茶店即可撒场面十分， 对萨烦恼就开始打撒独家开发查利库夫啊饥饿疗法可免费看你的风景纳入进口奶粉看吗，东西擦科技促进了农民服务俄方风景，聪明呢，阿森纳地方，阿胶为奶粉看，电饭煲金额可染，啊马丁内斯分，阿尔夫人，吗，啊但是奶粉不违反看法第三，穿比基尼，啊结束的奶粉，'
                    }
                }]
        });
        //分区线损-地区-华中与南网区域交换电量及线损率
        shapes.push({
            id: 'region_line_loss_rate_chart',
            hor: "right:1100",
            ver: ver('top', 900),
            syncVisible: true,
            children: [
                {
                    name: 'table_title',
                    data: {
                        text: '华中与南网区域交换电量及线损率'
                    }
                }, {
                    w: 620,
                    h: 480,
                    hor: 110,
                    ver: 85,
                    name: 'chart-echart',
                    visible: false,
                    data: {
                        option: {
                            grid: {
                                left: 135,
                                top: 92,
                                right: 100,
                                bottom: 26,
                            },
                            legend: {
                                data: [{
                                    name: '本月',
                                    icon: 'rect',
                                    textStyle: {
                                        fontSize: 16,
                                        color: 'rgba(0, 182, 255, 1)'
                                    }
                                }, {
                                    name: '上月',
                                    icon: 'rect',
                                    textStyle: {
                                        fontSize: 16,
                                        color: 'rgba(0, 182, 255, 1)'
                                    }
                                }, {
                                    name: '去年',
                                    icon: 'rect',
                                    textStyle: {
                                        fontSize: 16,
                                        color: 'rgba(0, 182, 255, 1)'
                                    }
                                }],
                                top: 36,
                                left: 150,
                                itemGap: 78,
                            },
                            xAxis: [{
                                type: 'category',
                                data: ['线损数', '线损率'],
                                axisLine: {
                                    lineStyle: {
                                        color: 'rgba(0, 182, 255, 1)',
                                        width: 3
                                    }
                                },
                                axisTick: {
                                    show: false
                                },
                                axisLabel: {
                                    show: false
                                },
                                splitLine: {
                                    show: false
                                },
                                // gridIndex: -1
                            }],
                            yAxis: [{
                                position: 'left',
                                type: 'value',
                                axisLabel: {
                                    margin: 60,
                                    formatter: '{value}',
                                    textStyle: {
                                        color: 'rgba(0,182,255,1)',
                                        fontFamily: 'Pirulen',
                                        align: "left",
                                        fontSize: 16
                                    }
                                },
                                axisLine: {
                                    lineStyle: {
                                        show: true,
                                        color: 'rgba(0,178,255,1)',
                                        width: 3
                                    }
                                },
                                splitLine: {
                                    show: false
                                },
                                axisTick: {
                                    length: 11,
                                    alignWithLabel: true,
                                    lineStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        width: 3
                                    }
                                }
                            }, {
                                position: 'right',
                                type: 'value',
                                axisLabel: {
                                    margin: 60,
                                    formatter: function (Object) {
                                        return Object * 100 + '%';
                                    },
                                    textStyle: {
                                        color: 'rgba(0,182,255,1)',
                                        fontFamily: 'Pirulen',
                                        align: "right",
                                        fontSize: 16
                                    }
                                },
                                axisLine: {
                                    lineStyle: {
                                        show: true,
                                        color: 'rgba(0,178,255,1)',
                                        width: 3
                                    }
                                },
                                splitLine: {
                                    show: false
                                },
                                axisTick: {
                                    length: 11,
                                    alignWithLabel: true,
                                    lineStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        width: 3
                                    }
                                }
                            }],
                            series: [{
                                name: '本月',
                                type: 'bar',
                                data: [220],
                                barWidth: 12,
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(244, 221, 45, 1)'
                                    },
                                    emphasis: {
                                        color: 'rgba(244, 221, 45, 1)'
                                    }
                                }
                            }, {
                                name: '上月',
                                type: 'bar',
                                data: [280],
                                barWidth: 12,
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(0, 255, 255, 1)'
                                    },
                                    emphasis: {
                                        color: 'rgba(0, 255, 255, 1)'
                                    }
                                }
                            }, {
                                name: '去年',
                                type: 'bar',
                                data: [220],
                                barWidth: 12,
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(0, 188, 255, 1)'
                                    },
                                    emphasis: {
                                        color: 'rgba(0, 188, 255, 1)'
                                    }
                                }
                            },
                            {
                                name: '本月',
                                type: 'bar',
                                data: ['', 0.075],
                                yAxisIndex: 1,
                                barWidth: 12,
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(244, 221, 45, 1)'
                                    },
                                    emphasis: {
                                        color: 'rgba(244, 221, 45, 1)'
                                    }
                                }
                            }, {
                                name: '上月',
                                type: 'bar',
                                data: ['', 0.095],
                                yAxisIndex: 1,
                                barWidth: 12,
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(0, 255, 255, 1)'
                                    },
                                    emphasis: {
                                        color: 'rgba(0, 255, 255, 1)'
                                    }
                                }
                            }, {
                                name: '去年',
                                type: 'bar',
                                data: ['', 0.075],
                                yAxisIndex: 1,
                                barWidth: 12,
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(0, 188, 255, 1)'
                                    },
                                    emphasis: {
                                        color: 'rgba(0, 188, 255, 1)'
                                    }
                                },
                                barGap: '50%',
                                barCategoryGap: 0
                            }]
                        }
                    }
                }]
        });
        //分区线损-地区-联络线电量及线损率
        shapes.push({
            id: 'line_loss_rate_chart',
            hor: "right:1100",
            ver: ver('top', 1500),
            syncVisible: true,
            children: [
                {
                    name: 'table_title',
                    data: {
                        text: '联络线电量及线损率'
                    }
                }, {
                    w: 620,
                    h: 480,
                    hor: 110,
                    ver: 85,
                    name: 'chart-echart',
                    visible: false,
                    data: {
                        option: {
                            grid: {
                                left: 135,
                                top: 92,
                                right: 100,
                                bottom: 26,
                            },
                            legend: {
                                data: [{
                                    name: '本月',
                                    icon: 'rect',
                                    textStyle: {
                                        fontSize: 16,
                                        color: 'rgba(0, 182, 255, 1)'
                                    }
                                }, {
                                    name: '上月',
                                    icon: 'rect',
                                    textStyle: {
                                        fontSize: 16,
                                        color: 'rgba(0, 182, 255, 1)'
                                    }
                                }, {
                                    name: '去年',
                                    icon: 'rect',
                                    textStyle: {
                                        fontSize: 16,
                                        color: 'rgba(0, 182, 255, 1)'
                                    }
                                }],
                                top: 36,
                                left: 150,
                                itemGap: 78,
                            },
                            xAxis: [{
                                type: 'category',
                                data: ['线损数', '线损率'],
                                axisLine: {
                                    lineStyle: {
                                        color: 'rgba(0, 182, 255, 1)',
                                        width: 3
                                    }
                                },
                                axisTick: {
                                    show: false
                                },
                                axisLabel: {
                                    show: false
                                },
                                splitLine: {
                                    show: false
                                },
                                // gridIndex: -1
                            }],
                            yAxis: [{
                                position: 'left',
                                type: 'value',
                                axisLabel: {
                                    margin: 60,
                                    formatter: '{value}',
                                    textStyle: {
                                        color: 'rgba(0,182,255,1)',
                                        fontFamily: 'Pirulen',
                                        align: "left",
                                        fontSize: 16
                                    }
                                },
                                axisLine: {
                                    lineStyle: {
                                        show: true,
                                        color: 'rgba(0,178,255,1)',
                                        width: 3
                                    }
                                },
                                splitLine: {
                                    show: false
                                },
                                axisTick: {
                                    length: 11,
                                    alignWithLabel: true,
                                    lineStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        width: 3
                                    }
                                }
                            }, {
                                position: 'right',
                                type: 'value',
                                axisLabel: {
                                    margin: 60,
                                    formatter: function (Object) {
                                        return Object * 100 + '%';
                                    },
                                    textStyle: {
                                        color: 'rgba(0,182,255,1)',
                                        fontFamily: 'Pirulen',
                                        align: "right",
                                        fontSize: 16
                                    }
                                },
                                axisLine: {
                                    lineStyle: {
                                        show: true,
                                        color: 'rgba(0,178,255,1)',
                                        width: 3
                                    }
                                },
                                splitLine: {
                                    show: false
                                },
                                axisTick: {
                                    length: 11,
                                    alignWithLabel: true,
                                    lineStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        width: 3
                                    }
                                }
                            }],
                            series: [{
                                name: '本月',
                                type: 'bar',
                                data: [220],
                                barWidth: 12,
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(244, 221, 45, 1)'
                                    },
                                    emphasis: {
                                        color: 'rgba(244, 221, 45, 1)'
                                    }
                                }
                            }, {
                                name: '上月',
                                type: 'bar',
                                data: [280],
                                barWidth: 12,
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(0, 255, 255, 1)'
                                    },
                                    emphasis: {
                                        color: 'rgba(0, 255, 255, 1)'
                                    }
                                }
                            }, {
                                name: '去年',
                                type: 'bar',
                                data: [220],
                                barWidth: 12,
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(0, 188, 255, 1)'
                                    },
                                    emphasis: {
                                        color: 'rgba(0, 188, 255, 1)'
                                    }
                                }
                            },
                            {
                                name: '本月',
                                type: 'bar',
                                data: ['', 0.075],
                                yAxisIndex: 1,
                                barWidth: 12,
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(244, 221, 45, 1)'
                                    },
                                    emphasis: {
                                        color: 'rgba(244, 221, 45, 1)'
                                    }
                                }
                            }, {
                                name: '上月',
                                type: 'bar',
                                data: ['', 0.095],
                                yAxisIndex: 1,
                                barWidth: 12,
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(0, 255, 255, 1)'
                                    },
                                    emphasis: {
                                        color: 'rgba(0, 255, 255, 1)'
                                    }
                                }
                            }, {
                                name: '去年',
                                type: 'bar',
                                data: ['', 0.075],
                                yAxisIndex: 1,
                                barWidth: 12,
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(0, 188, 255, 1)'
                                    },
                                    emphasis: {
                                        color: 'rgba(0, 188, 255, 1)'
                                    }
                                },
                                barGap: '50%',
                                barCategoryGap: 0
                            }]
                        }
                    }
                }]
        })
        //分压线损-本月，上月、去年期限线路、电量和线损分级显示
        shapes.push({
            id: 'time_energy_loss_rate',
            hor: "right:1100",
            ver: ver('top', 1500),
            syncVisible: true,
            children: [
                {
                    name: 'table_title',
                    data: {
                        text: '本月、上月、去年期间线路,电量和线损率'
                    }
                }, {
                    id: 'time_energy_loss_rate_chart',
                    w: 900,
                    h: 450,
                    hor: -45,
                    ver: 70,
                    name: 'chart-echart',
                    visible: false,
                    data: {
                        option: {
                            grid: {
                                left: 85,
                                top: 100,
                                right: 100,
                                bottom: 50,
                            },
                            legend: {
                                data: ['本月', '上月', '去年'],
                                textStyle: {
                                    fontSize: 14,
                                    color: 'rgba(0, 182, 255, 1)'
                                },
                                icon: 'rect',
                                top: 45,
                                left: 150,
                                itemGap: 70,
                            },
                            xAxis: [{
                                type: 'category',
                                data: ['1000kV', '+_800kV', '+_500kV'],
                                axisLine: {
                                    lineStyle: {
                                        color: 'rgba(0, 182, 255, 1)',
                                        width: 2
                                    }
                                },
                                axisTick: {
                                    length: 11,
                                    lineStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    }
                                },
                                axisLabel: {
                                    show: true,
                                    margin: 20,
                                    textStyle: {
                                        fontFamily: 'Microsoft Yahei',
                                        fontSize: 14
                                    }
                                },
                                splitLine: {
                                    show: false
                                }
                            }],
                            yAxis: [{
                                position: 'left',
                                type: 'value',
                                axisLabel: {
                                    margin: 78,
                                    formatter: '{value}',
                                    textStyle: {
                                        color: 'rgba(0,182,255,1)',
                                        fontFamily: 'Pirulen',
                                        align: "left",
                                        fontSize: 14
                                    }
                                },
                                axisLine: {
                                    lineStyle: {
                                        show: true,
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    }
                                },
                                splitLine: {
                                    show: false
                                },
                                axisTick: {
                                    length: 11,
                                    alignWithLabel: true,
                                    lineStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    }
                                }
                            }, {
                                position: 'right',
                                type: 'value',
                                axisLabel: {
                                    margin: 78,
                                    formatter: function (Object) {
                                        return (Object * 100).toFixed(1) + '%'
                                    },
                                    textStyle: {
                                        color: 'rgba(244, 221, 45, 1)',
                                        fontFamily: 'Pirulen',
                                        align: "right",
                                        fontSize: 14
                                    }
                                },
                                axisLine: {
                                    lineStyle: {
                                        show: true,
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    }
                                },
                                splitLine: {
                                    show: false
                                },
                                axisTick: {
                                    length: 11,
                                    alignWithLabel: true,
                                    lineStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    }
                                }
                            }],
                            series: [{
                                name: '本月',
                                type: 'bar',
                                data: [2500, 2500, 2000],
                                barWidth: 14,
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(244, 221, 45, 1)'
                                    },
                                    emphasis: {
                                        color: 'rgba(244, 221, 45, 1)'
                                    }
                                }
                            }, {
                                name: '上月',
                                type: 'bar',
                                data: [2400, 2800, 2500],
                                barWidth: 14,
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(0, 255, 255, 1)'
                                    },
                                    emphasis: {
                                        color: 'rgba(0, 255, 255, 1)'
                                    }
                                }
                            }, {
                                name: '去年',
                                type: 'bar',
                                data: [2300, 2400, 2340],
                                barWidth: 14,
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(0, 188, 255, 1)'
                                    },
                                    emphasis: {
                                        color: 'rgba(0, 188, 255, 1)'
                                    }
                                }
                            }, {
                                name: '本月',
                                type: 'line',
                                data: [0.0042, 0.0058, 0.0032],
                                yAxisIndex: 1,
                                smooth: true,
                                showSymbol: false,
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(244, 221, 45, 1)'
                                    },
                                    emphasis: {
                                        color: 'rgba(244, 221, 45, 1)'
                                    }
                                }
                            }, {
                                name: '上月',
                                type: 'line',
                                smooth: true,
                                showSymbol: false,
                                data: [0.0032, 0.0042, 0.0056],
                                yAxisIndex: 1,
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(0, 255, 255, 1)'
                                    },
                                    emphasis: {
                                        color: 'rgba(0, 255, 255, 1)'
                                    }
                                }
                            }, {
                                name: '去年',
                                type: 'line',
                                smooth: true,
                                showSymbol: false,
                                data: [0.0038, 0.0042, 0.0032],
                                yAxisIndex: 1,
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(0, 188, 255, 1)'
                                    },
                                    emphasis: {
                                        color: 'rgba(0, 188, 255, 1)'
                                    }
                                }
                            }]
                        }
                    }
                }]
        })
        //厂站基本信息
        shapes.push({
            id: 'station_base_info',
            hor: "left: 1800",
            ver: "top: 250",
            "name": "info",
            data: {
                rows: [
                    { name: "站类型", value: "变电站" },
                    { name: "名称", value: "西南变电站" },
                    { name: "电压等级", value: "750KV" },
                    { name: "运行年限", value: "3年" },
                    { name: "地址", value: "云南XX" },
                    { name: "计量点", value: "45(个)" },
                    { name: "电能表", value: "82(个)" },
                    { name: "互感器", value: "125(个)" }
                ],
                color: "rgba(0, 177, 255, 1)",
                font: "30px 微软雅黑"
            }
        })
        //厂站基本信息的连线
        shapes.push({
            id: 'station_base_info_line',
            "name": "station_base_info_line",
            data: {
                fromId: '',
                toId: '',
                x0: 2188,
                y0: 1300,
                x1: 2116,
                y1: 538,
                fromOffsetX: 0,
                fromOffsetY: 0,
                toOffsetX: 0,
                toOffsetY: 0,
                width: 3,
                type: 'v-h',
                pointOffset: 20,
            }
        })
        //厂站基本信息echart显示
        shapes.push({
            id: 'station_base_info_echart',
            hor: "left:1620",
            ver: "top:380",
            syncVisible: true,
            name: 'info_frame',
            children: [
                {
                    name: 'main-text',
                    id: 'station_base_info_echart_name',
                    x: 20,
                    y: 20,
                    data: {
                        textAlign: 'left',
                        textBaseline: 'top',
                        size: '24px',
                        text: '长治变电站',
                        color: 'rgba(0, 178, 255, 1)'
                    }
                }, {
                    name: 'main-text',
                    x: 230,
                    y: 25,
                    id: 'station_base_info_echart_time',
                    data: {
                        textAlign: 'left',
                        textBaseline: 'top',
                        size: '18px',
                        text: '运行年限：2011～2017',
                        color: 'rgba(0, 178, 255, 1)'
                    }
                }, {
                    w: 430,
                    h: 220,
                    x: 20,
                    y: 65,
                    id: 'station_base_info_echart_table',
                    name: 'chart-echart',
                    visible: false,
                    data: {
                        option: {
                            grid: {
                                left: 45,
                                top: 24,
                                right: 155,
                                bottom: 8,
                            },
                            legend: {
                                data: ['计量点', '电能表', '电压互感器', '电流互感器'],
                                icon: 'rect',
                                textStyle: {
                                    fontSize: 18,
                                    color: 'rgba(0, 180, 255, 1)'
                                },
                                orient: 'vertical',
                                top: 20,
                                right: 18,
                                itemGap: 28,
                            },
                            xAxis: [{
                                type: 'category',
                                data: [''],
                                axisLine: {
                                    lineStyle: {
                                        color: 'rgba(0, 182, 255, 1)',
                                        width: 2
                                    }
                                },
                                axisTick: {
                                    length: 4,
                                    lineStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    },
                                    interval: 0
                                },
                                axisLabel: {
                                    show: false,
                                },
                                splitLine: {
                                    show: false
                                }
                            }],
                            yAxis: [{
                                position: 'left',
                                type: 'value',
                                axisLabel: {
                                    show: true,
                                    margin: 35,
                                    textStyle: {
                                        color: 'rgba(0, 178, 255, 1)',
                                        align: 'left',
                                        fontSize: 10,
                                        fontFamily: 'Pirulen'
                                    }
                                },
                                axisLine: {
                                    lineStyle: {
                                        show: true,
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    }
                                },
                                splitLine: {
                                    show: false
                                },
                                axisTick: {
                                    length: 8,
                                    alignWithLabel: true,
                                    lineStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    },
                                }
                            }],
                            series: [{
                                name: '计量点',
                                type: 'bar',
                                data: [9],
                                barWidth: 15,
                                itemStyle: {
                                    normal: {
                                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                            offset: 0,
                                            color: 'rgba(244, 221, 45, 1)'
                                        }, {
                                            offset: 1,
                                            color: 'rgba(244, 221, 45, .2)'
                                        }])
                                    }
                                },
                                label: {
                                    normal: {
                                        show: true,
                                        position: 'top',
                                        textStyle: {
                                            color: 'rgba(244, 221, 45, 1)',
                                            fontFamily: 'Pirulen',
                                            fontSize: 18
                                        }
                                    }
                                }
                            }, {
                                name: '电能表',
                                type: 'bar',
                                data: [18],
                                barWidth: 15,
                                itemStyle: {
                                    normal: {
                                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                            offset: 0,
                                            color: 'rgba(0, 255, 255, 1)'
                                        }, {
                                            offset: 1,
                                            color: 'rgba(0, 255, 255, .2)'
                                        }])
                                    }
                                },
                                label: {
                                    normal: {
                                        show: true,
                                        position: 'top',
                                        textStyle: {
                                            color: 'rgba(244, 221, 45, 1)',
                                            fontFamily: 'Pirulen',
                                            fontSize: 18
                                        }
                                    }
                                }
                            }, {
                                name: '电压互感器',
                                type: 'bar',
                                data: [27],
                                barWidth: 15,
                                itemStyle: {
                                    normal: {
                                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                            offset: 0,
                                            color: 'rgba(0, 163, 175, 1)'
                                        }, {
                                            offset: 1,
                                            color: 'rgba(0, 163, 175, .2)'
                                        }])
                                    }
                                },
                                label: {
                                    normal: {
                                        show: true,
                                        position: 'top',
                                        textStyle: {
                                            color: 'rgba(244, 221, 45, 1)',
                                            fontFamily: 'Pirulen',
                                            fontSize: 18
                                        }
                                    }
                                }
                            }, {
                                name: '电流互感器',
                                type: 'bar',
                                data: [45],
                                barWidth: 15,
                                itemStyle: {
                                    normal: {
                                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                            offset: 0,
                                            color: 'rgba(0, 178, 255, 1)'
                                        }, {
                                            offset: 1,
                                            color: 'rgba(0, 178, 255, .2)'
                                        }])
                                    }
                                },
                                label: {
                                    normal: {
                                        show: true,
                                        position: 'top',
                                        textStyle: {
                                            color: 'rgba(244, 221, 45, 1)',
                                            fontFamily: 'Pirulen',
                                            fontSize: 18
                                        }
                                    }
                                },
                                barCategoryGap: '100%',
                                barGap: '200%',

                            }]
                        }
                    }
                }]
        })
        //厂站基本信息echart的连线
        shapes.push({
            id: 'station_base_info_echart_line',
            "name": "station_base_info_line",
            data: {
                fromId: '',
                toId: '',
                x0: 2100,
                y0: 960,
                x1: 1860,
                y1: 752,
                x2: 1860,
                y2: 710,
                fromOffsetX: 0,
                fromOffsetY: 0,
                toOffsetX: 0,
                toOffsetY: 0,
                width: 3,
                type: 'straight',
                pointOffset: 20,
                circle: false
            }
        })
        //连线基本信息
        shapes.push({
            id: 'line_base_info',
            hor: hor("left", 1800),
            ver: ver("top", 250),
            name: "lineInfo",
            data: {
                label: "5%",
                level: 2000,
                output: 750
            }
        })
        //连线基本信息的连线
        shapes.push({
            id: 'line_base_info_line',
            "name": "station_base_info_line",
            data: {
                fromId: '',
                toId: '',
                x0: 2188,
                y0: 1300,
                x1: 2116,
                y1: 538,
                fromOffsetX: 0,
                fromOffsetY: 0,
                toOffsetX: 0,
                toOffsetY: 0,
                width: 3,
                type: 'v-h',
                pointOffset: 20,
            }
        })
        //联络线及5年内送端电量统计
        shapes.push({
            id: 'regional_electricity_statistics',
            hor: "left:1620",
            ver: "top:380",
            syncVisible: true,
            name: 'info_frame',
            data: {
                width: 644,
                height: 294
            },
            children: [
                {
                    name: 'main-text',
                    id: 'regional_electricity_statistics_title',
                    x: 32,
                    y: 15,
                    data: {
                        textAlign: 'left',
                        textBaseline: 'top',
                        size: '24px',
                        text: '南方-华中区域联络线及近5年送端电量统计',
                        color: 'rgba(0, 178, 255, 1)'
                    }
                }, {
                    w: 340,
                    h: 230,
                    hor: 30,
                    ver: 55,
                    id: 'regional_electricity_statistics_echart',
                    name: 'chart-echart',
                    visible: false,
                    data: {
                        option: {
                            grid: {
                                left: 60,
                                top: 15,
                                right: 20,
                                bottom: 24,
                            },
                            xAxis: [{
                                type: 'category',
                                data: ['2011', '2012', '2013', '2014', '2015'],
                                axisLine: {
                                    lineStyle: {
                                        color: 'rgba(0, 182, 255, 1)',
                                        width: 2
                                    }
                                },
                                axisTick: {
                                    length: 4,
                                    lineStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    },
                                    interval: 0
                                },
                                axisLabel: {
                                    show: true,
                                    margin: 8,
                                    textStyle: {
                                        color: 'rgba(0, 178, 255, 1)',
                                        align: 'center',
                                        fontSize: 12,
                                        fontFamily: 'Pirulen'
                                    }
                                },
                                splitLine: {
                                    show: false
                                }
                            }],
                            yAxis: [{
                                position: 'left',
                                type: 'value',
                                axisLabel: {
                                    show: true,
                                    margin: 50,
                                    textStyle: {
                                        color: 'rgba(0, 178, 255, 1)',
                                        align: 'left',
                                        fontSize: 12,
                                        fontFamily: 'Pirulen'
                                    }
                                },
                                axisLine: {
                                    lineStyle: {
                                        show: true,
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    }
                                },
                                splitLine: {
                                    show: false
                                },
                                axisTick: {
                                    length: 8,
                                    alignWithLabel: true,
                                    lineStyle: {
                                        color: 'rgba(0,178,255,1)',
                                        width: 2
                                    },
                                }
                            }],
                            series: [{
                                name: '送端电量',
                                type: 'bar',
                                data: [1000, 800, 1250, 2200, 2700],
                                barWidth: 18,
                                itemStyle: {
                                    normal: {
                                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                            offset: 0,
                                            color: 'rgba(0, 178, 255, 1)'
                                        }, {
                                            offset: 1,
                                            color: 'rgba(0, 178, 255, .2)'
                                        }])
                                    }
                                },
                                label: {
                                    normal: {
                                        show: true,
                                        position: 'top',
                                        textStyle: {
                                            color: 'rgba(244, 221, 45, 1)',
                                            fontFamily: 'Pirulen',
                                            fontSize: 14
                                        }
                                    }
                                }
                            }]
                        }
                    }
                }, {
                    x: 400,
                    y: 98,
                    name: 'main-text',
                    data: {
                        textAlign: 'left',
                        textBaseline: 'top',
                        size: '20px',
                        font: "微软雅黑",
                        text: '电压等级: ',
                        color: 'rgba(0, 177, 255, 1)'
                    }
                }, {
                    x: 400,
                    y: 165,
                    name: 'main-text',
                    data: {
                        textAlign: 'left',
                        textBaseline: 'top',
                        size: '20px',
                        font: "微软雅黑",
                        text: '送端电量: ',
                        color: 'rgba(0, 177, 255, 1)'
                    }
                }, {
                    x: 400,
                    y: 232,
                    name: 'main-text',
                    data: {
                        textAlign: 'left',
                        textBaseline: 'top',
                        size: '20px',
                        font: "微软雅黑",
                        text: '线损率：',
                        color: 'rgba(0, 177, 255, 1)'
                    }
                }, {
                    x: 500,
                    y: 98,
                    id: 'regional_electricity_statistics_level',
                    name: 'main-text',
                    data: {
                        textAlign: 'left',
                        textBaseline: 'top',
                        size: '20px',
                        font: "Pirulen",
                        text: '1000kwh',
                        color: 'rgba(244, 221, 45, 1)'
                    }
                }, {
                    x: 500,
                    y: 165,
                    id: 'regional_electricity_statistics_ele',
                    name: 'main-text',
                    data: {
                        textAlign: 'left',
                        textBaseline: 'top',
                        size: '20px',
                        font: "Pirulen",
                        text: '631kwh',
                        color: 'rgba(244, 221, 45, 1)'
                    }
                }, {
                    x: 480,
                    y: 232,
                    id: 'regional_electricity_statistics_loss',
                    name: 'main-text',
                    data: {
                        textAlign: 'left',
                        textBaseline: 'top',
                        size: '20px',
                        font: "Pirulen",
                        text: '3%',
                        color: 'rgba(244, 221, 45, 1)'
                    }
                }]
        })
        //联络线及5年内送端电量统计的连线
        shapes.push({
            id: 'regional_electricity_statistics_line',
            "name": "station_base_info_line",
            data: {
                fromId: '',
                toId: '',
                x0: 2188,
                y0: 1300,
                x1: 2116,
                y1: 538,
                fromOffsetX: 0,
                fromOffsetY: 0,
                toOffsetX: 0,
                toOffsetY: 0,
                width: 3,
                type: 'straight',
                pointOffset: 20,
            }
        })
        //区域内厂站分类
        shapes.push({
            id: 'region_station_partition',
            hor: "left:1620",
            ver: "top:380",
            syncVisible: true,
            name: 'info_frame',
            data: {
                width: 540,
                height: 366
            },
            children: [{
                x: 0,
                y: 0,
                id: 'region_station_partition_echart',
                name: 'region_station_partition_echart',
                data: {
                    items: [{
                        name: '换流站',
                        number: 6
                    }, {
                        name: '厂站',
                        number: 10
                    }, {
                        name: '变电站',
                        number: 4
                    }],
                }
            }]
        })
        //厂站检查信息
        shapes.push({
            name: 'testing-info',
            id: 'station_inspect_info',
            hor: 'left:460',
            ver: 'top:1000',
            data: {
                src: [
                    "./subs/pic/chk1.jpg",
                    "./subs/pic/chk2.jpg"
                ],
                station: '西北风电站',
                rows: [{
                    name: "检测人员",
                    value: "某某"
                }, {
                    name: "设备故障",
                    value: "设备故障设备故障设备故障设备故障设备故障"
                }, {
                    name: "设备故障",
                    value: "设备故障设备故障设备故障设备故障"
                }]
            }
        })
        //厂站检查信息的连线
        shapes.push({
            id: 'station_inspect_info_line',
            "name": "station_base_info_line",
            data: {
                fromId: '',
                toId: '',
                x0: 2188,
                y0: 1300,
                x1: 2116,
                y1: 538,
                fromOffsetX: 0,
                fromOffsetY: 0,
                toOffsetX: 0,
                toOffsetY: 0,
                width: 3,
                type: 'v-h',
                pointOffset: 20,
            }
        })
    },
    //首页左侧4个文字标签
    getIndexBigLabel: function () {
        var r = [];
        var json = [
            {
                id: 'measurment-point',
                value: 1720,
                label: '计量点',
            },
            {
                id: 'energy-meter',

                value: 2048,
                label: '电能表',
            },
            {
                id: 'voltage-transformer',
                value: 1235,
                label: '电压互感器',
            },
            {
                id: 'current-transformer',
                value: 270,
                label: '电流互感器',
            }
        ]
        for (var i = 0; i < json.length; i++) {
            r.push({
                id: json[i].id,
                name: 'index-left-big-label', //,
                x: 0,
                y: 200 * i,
                data: {
                    value: json[i].value,
                    label: json[i].label,
                },
                cache: true,
                clip: true,
            });
        }
        return r;
    },
    /**
    * @function {getLegand} 首页左侧的图例
    * @return {type} {description}
    */
    getIndexLegand: function () {
        //FIXME 记得增加 id 标示，后续跟业务绑定 
        var r = [];
        var json = [
            { "lineColor": "rgba(250, 125, 0, 1)", "text": "交流330KV", "alternatingCurrent": true },
            { "lineColor": "rgba(0, 162, 70, 1)", "text": "直流±500KV", "alternatingCurrent": false },
            { "lineColor": "rgba(255, 0, 0, 1)", "text": "交流500KV", "alternatingCurrent": true },
            { "lineColor": "rgba(255, 235, 95, 1)", "text": "直流±660KV", "alternatingCurrent": false },
            { "lineColor": "rgba(82, 0, 255, 1)", "text": "交流750KV", "alternatingCurrent": true },
            { "lineColor": "rgba(182, 53, 0, 1)", "text": "直流±800KV", "alternatingCurrent": false },
            { "lineColor": "rgba(0, 255, 255, 1)", "text": "交流1000KV", "alternatingCurrent": true }
        ];
        for (var i = 0; i < json.length; i++) {
            var y = 82 + 48 * i;
            r.push({
                id: "index-left-bottom-legend-item" + i,
                name: "index-left-bottom-legend-item",
                x: 0,
                y: y,
                interact: true,
                selectable: true,
                data: {
                    lineColor: json[i].lineColor,
                    text: json[i].text,
                    alternatingCurrent: json[i].alternatingCurrent
                },
                selectedGroup: "index-left-bottom-legend-item",
                clip: true,
            });
        }
        return r;
    },
    initScene: function () {
        for (var id in this.sceneMap) {
            this.sceneMap._id = id;
        }
    },
    initSelectedGroup: function (viewContext) {
        viewContext.selectedGroupMap['index-menu-group'] = { allowForEmpty: false };
        viewContext.selectedGroupMap['index-left-bottom-legend-item'] = { muilti: true, allowForEmpty: false };
    },
    initEvent: function (viewContext) {
        //nav-menu-item
        var self = this;
        this.viewContext = viewContext;
        viewContext.on('m.nav-menu-item.*.selected.menu', function (e) {
            var shape = e.originSource;
            var id = shape.data.itemId;

            if (self.sceneId === id) {
                return;
            }


            if (!self.sceneMap[id]) {
                return;
            }
            self.goto(id);
        })

        viewContext.on('m.big-legends.selected.on-off', function (e) {
            var shape = e.originSource;
            var value = e.newValue;
            var shapes = viewContext.find({ selectedGroup: "index-left-bottom-legend-item" });
            shapes.forEach(function (s) {
                s.selected = value;
            })
        })

        //监听按钮，切换区域还是全国
        viewContext.on('m.regional_division_type.*.selected.c', function (e) {
            var shape = e.originSource;
            var itemId = shape.data.itemId;
            if (e.newValue) {
                if (itemId == 'all') {
                    self.setVisible(self.scene.regionShapes, false);
                    self.setVisible(self.scene.allRegionShapes, true);
                } else {
                    self.setVisible(self.scene.allRegionShapes, false);
                    self.setVisible(self.scene.regionShapes, true);
                }
                console.log(itemId);
            }

        })
    },
    goto: function (id) {

        var self = this;
        var viewContext = this.viewContext;
        var scene = self.sceneMap[id];
        if (!scene) {
            console.error('scene is not exist:' + id);
            return;
        }
        if (scene.title) {
            viewContext.allShapeMap.navbar.data.title = scene.title;
        }
        var shapes = scene.shapes;
        if (self.scene) {
            var oldScene = self.scene;
            var old = oldScene.shapes;
            old = old.filter(function (item) {
                return shapes.indexOf(item) < 0;
            })
            old.forEach(function (item) {
                viewContext.allShapeMap[item].visible = false;
            })
            if (oldScene.destroy) {
                oldScene.destroy(viewContext);
            }
        }
        shapes.forEach(function (item) {
            viewContext.allShapeMap[item].visible = true;
        });
        this.scene = scene;
        if (scene.init) {
            scene.init(viewContext);
        }

    },
    showStationBasicInfo: function (id, p) {
        var viewContext = this.viewContext;
        if (id) {
            var result = [];
            var dm = main.sceneManager.dataManager;
            var data = dm.getDataById(id);
            result.push({
                name: '站类型',
                value: data.getDataTypeId()
            });
            result.push({
                name: '名称',
                value: data.getName()
            });
            result.push({
                name: '电压等级',
                value: data.getUserData('volt')
            });
            result.push({
                name: '运行年限',
                value: Math.floor((new Date().getTime() - new Date(data.getUserData('opera_time')).getTime()) / 1000 / 60 / 60 / 24 / 365)
            });
            result.push({
                name: '地址',
                value: data.getUserData('sub_addr')
            });
            var dataChildren = main.sceneManager.dataManager.getChildren(data);
            var meterPoint = 0, electricEnergyMeter = 0, transformer = 0;
            dataChildren.forEach(function (c) {
                if (main.sceneManager.dataManager.getCategoryForData(c) == 'meterPoint') {
                    meterPoint++;
                } else if (main.sceneManager.dataManager.getCategoryForData(c) == 'electricEnergyMeter') {
                    electricEnergyMeter++;
                } else if (main.sceneManager.dataManager.getCategoryForData(c) == 'currentTransformer') {
                    transformer++;
                } else if (main.sceneManager.dataManager.getCategoryForData(c) == 'voltageTransformer') {
                    transformer++;
                }
            })
            result.push({
                name: '计量点',
                value: meterPoint + '(个)'
            });
            result.push({
                name: '电能表',
                value: electricEnergyMeter + '(个)'
            });
            result.push({
                name: '互感器',
                value: transformer + '(个)'
            });
            viewContext.allShapeMap['station_base_info'].data.rows = r;
        }
        if (p) {
            var x0 = p.x, y0 = p.y;
            var x1, y1, x2;
            if (x0 > 2116) {
                x1 = 2116;
                y1 = 538;
                x2 = 1800;
            } else if (x0 < 1792) {
                x1 = 1792;
                y1 = 538;
                x2 = 1800;
            } else if (x0 >= 1792 && x0 < 1954) {
                x1 = x0 + 60;
                y1 = 538;
                x2 = x1 + 8;
            } else {
                x1 = x0 - 60;
                y1 = 538;
                x2 = x1 - 316;
            }
            viewContext.allShapeMap['station_base_info_line'].data = {
                fromId: '',
                toId: '',
                x0: x0,
                y0: y0,
                x1: x1,
                y1: y1,
                fromOffsetX: 0,
                fromOffsetY: 0,
                toOffsetX: 0,
                toOffsetY: 0,
                color: 'rgba(0, 255, 255, 1)',
                width: 3,
                type: 'v-h',
                pointOffset: 20,
            };
            viewContext.allShapeMap['station_base_info'].hor = "left:" + x2;
        }
        var station_base_info = ['station_base_info', 'station_base_info_line'];
        scene.setVisible(station_base_info, true);
    },
    hideStationBasicInfo: function (id) {
        var station_base_info = ['station_base_info', 'station_base_info_line'];
        scene.setVisible(station_base_info, false);
    },
    showStationBasicInfoEchart: function (id, p) {
        var viewContext = this.viewContext;
        if (id) {
            var dm = main.sceneManager.dataManager;
            var data = dm.getDataById(id);
            var name = data.getName();
            var time = '运行年限：' + new Date(data.getUserData('opera_time')).getFullYear() + '~' + new Date().getFullYear();
            var dataChildren = dm.getChildren(data);
            var meterPoint = 0, electricEnergyMeter = 0, currentTransformer = 0, voltageTransformer = 0;
            dataChildren.forEach(function (c) {
                if (main.sceneManager.dataManager.getCategoryForData(c) == 'meterPoint') {
                    meterPoint++;
                } else if (main.sceneManager.dataManager.getCategoryForData(c) == 'electricEnergyMeter') {
                    electricEnergyMeter++;
                } else if (main.sceneManager.dataManager.getCategoryForData(c) == 'currentTransformer') {
                    currentTransformer++;
                } else if (main.sceneManager.dataManager.getCategoryForData(c) == 'voltageTransformer') {
                    voltageTransformer++;
                }
            })
            viewContext.allShapeMap['station_base_info_echart_name'].data.text = name;
            viewContext.allShapeMap['station_base_info_echart_time'].data.text = time;
            viewContext.allShapeMap['station_base_info_echart_table'].data.option.series[0] = [meterPoint];
            viewContext.allShapeMap['station_base_info_echart_table'].data.option.series[1] = [electricEnergyMeter];
            viewContext.allShapeMap['station_base_info_echart_table'].data.option.series[2] = [voltageTransformer];
            viewContext.allShapeMap['station_base_info_echart_table'].data.option.series[3] = [currentTransformer];
        }
        if (p) {
            if (p) {
                var x = parseInt(viewContext.allShapeMap['station_base_info_echart'].x);
                var y = parseInt(viewContext.allShapeMap['station_base_info_echart'].y);
                var x0 = p.x, y0 = p.y;
                var x1, y1;
                if (x0 < x - 42) {
                    x1 = x - 42;
                    y1 = y + 150;
                    x2 = x;
                    y2 = y + 150;
                } else if (x0 > x + 460 + 42) {
                    x1 = x + 460 + 42;
                    y1 = y + 150;
                    x2 = x + 460;
                    y2 = y + 150;
                } else {
                    x1 = x + 230;
                    y1 = y + 300 + 42;
                    x2 = x + 230;
                    y2 = y + 300;
                }
                viewContext.allShapeMap['station_base_info_echart_line'].data = {
                    fromId: '',
                    toId: '',
                    x0: x0,
                    y0: y0,
                    x1: x1,
                    y1: y1,
                    x2: x2,
                    y2: y2,
                    fromOffsetX: 0,
                    fromOffsetY: 0,
                    toOffsetX: 0,
                    toOffsetY: 0,
                    color: 'rgba(0, 255, 255, 1)',
                    width: 3,
                    type: 'straight',
                    pointOffset: 20,
                    circle: false

                };
            }
        }
        var station_base_info_echart = ['station_base_info_echart', 'station_base_info_echart_line'];
        scene.setVisible(station_base_info_echart, true);
    },
    hideStationBasicInfoEchart: function () {
        var station_base_info_echart = ['station_base_info_echart', 'station_base_info_echart_line'];
        scene.setVisible(station_base_info_echart, false);
    },
    showLineBasicInfo: function (id, p) {
        var viewContext = this.viewContext;
        if (id) {
            lineBaseInfo(id, viewContext);
            var dm = main.sceneManager.dataManager;
            var data = dm.getDataById(id);
            var level = data.getUserData('volt');
            viewContext.allShapeMap['line_base_info'].data.level = level;
        }
        if (p) {
            var x0 = p.x, y0 = p.y;
            var x1, y1, x2, y2, x3, y3;
            x1 = x0 - 120;
            y1 = y0 + 278;
            x2 = x1 - 18;
            y2 = y1;
            x3 = x2 - 275;
            y3 = y2 - 100;
            viewContext.allShapeMap['line_base_info_line'].data = {
                fromId: '',
                toId: '',
                x0: x0,
                y0: y0,
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2,
                fromOffsetX: 0,
                fromOffsetY: 0,
                toOffsetX: 0,
                toOffsetY: 0,
                color: 'rgba(0, 255, 255, 1)',
                width: 3,
                type: 'straight',
                pointOffset: 20,
            };
            viewContext.allShapeMap['line_base_info'].hor = "left:" + x3;
            viewContext.allShapeMap['line_base_info'].ver = "top:" + y3;
        }
        var line_base_info = ['line_base_info', 'line_base_info_line'];
        scene.setVisible(line_base_info, true);
    },
    hideLineBasicInfo: function () {
        var line_base_info = ['line_base_info', 'line_base_info_line'];
        scene.setVisible(line_base_info, false);
    },
    //区域送端电量无相关借口，echart并没有随父亲的位置改变而改变
    showRegionalEleStatistics: function (id, p) {
        var viewContext = this.viewContext;
        if (id) {
            // lineBaseInfo(id, viewContext);
            // var dm = main.sceneManager.dataManager;
            // var data = dm.getDataById(id);
            // var level = data.getUserData('volt');
            // viewContext.allShapeMap['line_base_info'].data.level = level;
        }
        if (p) {
            var x0 = p.x, y0 = p.y;
            var x1, y1, x2, y2, x3, y3;
            x1 = x0 - 140;
            y1 = y0 + 320;
            x2 = x1 - 260;
            y2 = y1;
            x3 = x2 - 650;
            y3 = y2 - 280;
            viewContext.allShapeMap['regional_electricity_statistics_line'].data = {
                fromId: '',
                toId: '',
                x0: x0,
                y0: y0,
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2,
                fromOffsetX: 0,
                fromOffsetY: 0,
                toOffsetX: 0,
                toOffsetY: 0,
                color: 'rgba(0, 255, 255, 1)',
                width: 3,
                type: 'straight',
                pointOffset: 20,
            };
            viewContext.allShapeMap['regional_electricity_statistics'].hor = "left:" + x3;
            viewContext.allShapeMap['regional_electricity_statistics'].ver = "top:" + y3;
        }
        var regional_electricity_statistics = ['regional_electricity_statistics', 'regional_electricity_statistics_line'];
        scene.setVisible(regional_electricity_statistics, true);
    },
    hideRegionalEleStatistics: function () {
        var regional_electricity_statistics = ['regional_electricity_statistics', 'regional_electricity_statistics_line'];
        scene.setVisible(regional_electricity_statistics, false);
    },
    showRegionStationPartition: function (id, p) {
        var viewContext = this.viewContext;
        if (id) {
            var dm = main.sceneManager.dataManager;
            var data = dm.getDataById(id);
            var station = 0, biandian = 0, huanliu = 0;
            dataChildren.forEach(function (c) {
                if (main.sceneManager.dataManager.getCategoryForData(c) == 'station') {
                    station++;
                } else if (main.sceneManager.dataManager.getCategoryForData(c) == 'biandian') {
                    biandian++;
                } else if (main.sceneManager.dataManager.getCategoryForData(c) == 'huanliu') {
                    huanliu++;
                }
            });
            viewContext.allShapeMap['region_station_partition_echart'].data.items = [{
                name: '换流站',
                number: huanliu
            }, {
                name: '厂站',
                number: station
            }, {
                name: '变电站',
                number: biandian
            }];
        }
        if (p) {
            var x0 = p.x, y0 = p.y;
            viewContext.allShapeMap['region_station_partition'].hor = "left:" + (x0 - 248);
            viewContext.allShapeMap['region_station_partition'].ver = "top:" + (y0 - 214);
        }
        var regional_electricity_statistics = ['region_station_partition'];
        scene.setVisible(regional_electricity_statistics, true);
    },
    hideRegionStationPartition: function () {
        var regional_electricity_statistics = ['region_station_partition'];
        scene.setVisible(regional_electricity_statistics, false);
    },
    showStationInspectInfo: function (id, p) {
        var viewContext = this.viewContext;
        if (id) {
            stationInspectImg(id, viewContext);
        }
        if (p) {
            var x0 = p.x, y0 = p.y;
            var x1, y1, x2, y2, x3, y3;
            x1 = x0 - 360;
            y1 = y0;
            x2 = x1 - 148;
            y2 = y1 + 204;
            x3 = x2 - 270;
            y3 = y2 - 50;
            viewContext.allShapeMap['station_inspect_info_line'].data = {
                fromId: '',
                toId: '',
                x0: x0,
                y0: y0,
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2,
                fromOffsetX: 0,
                fromOffsetY: 0,
                toOffsetX: 0,
                toOffsetY: 0,
                color: 'rgba(0, 255, 255, 1)',
                width: 3,
                type: 'straight',
                pointOffset: 20,
            };
            viewContext.allShapeMap['station_inspect_info'].hor = "left:" + x3;
            viewContext.allShapeMap['station_inspect_info'].ver = "top:" + y3;
        }
        var station_inspect_info = ['station_inspect_info', 'station_inspect_info_line'];
        scene.setVisible(station_inspect_info, true);
    },
    hideStationInspectInfo: function () {
        var station_inspect_info = ['station_inspect_info', 'station_inspect_info_line'];
        scene.setVisible(station_inspect_info, false);
    },
}