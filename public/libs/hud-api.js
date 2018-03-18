/**
 * @function isSimulate 是否启用模拟数据
 * @param  {type} var isSimulate {description}
 * @return {type} {description}
 */
var isSimulate = true;
if (window.main && window.main.sceneManager) {
    isSimulate = false;
}

/**
 * @function simulator 模拟器的常用工具
 * @param  {type} var simulator {description}
 * @return {type} {description}
 */
var simulator = {
    rndInt: function (max, min) {
        max = max || 99;
        min = min || 1;
        return min + Math.round(Math.random() * (max - min));
    }
}

/**
 * @function api 工厂类，生成一个 api 实例
 * @param  {type} opt {description}
 * @return {type} {description}
 */
var api = function (opt) {

    return new API(opt);
}

function API(opt) {
    this.contentType = opt.contentType || 'application/json; charset=utf-8';
    this.url = opt.url;
    this.method = opt.method || 'get';
    this.data = opt.data || {};
    this.interval = opt.interval || 0;
    this.success = opt.success;
    this.error = opt.error || console.error;
    this.simulateData = opt.simulateData || function () {

    }
    this.getData = opt.getData;
}
API.prototype.execute = function () {
    if (isSimulate) {
        return this.simulate();
    }
    if (this.getData) {
        return this.getData(this.data);
    }
    $.ajax({
        contentType: this.contentType,
        method: this.method,
        dataType: "json",
        url: this.url,
        data: this.data,
        success: this.success,
        error: this.error,
    });
}

API.prototype.simulate = function () {
    var self = this;
    setTimeout(function () {
        var data = self.simulateData(simulator);
        self.success && self.success(data);
    })
}

API.prototype.start = function () {

    if (this.interval > 0) {
        var self = this;
        if (this.timerId) {
            return;
        }
        this.timerId = hud.util.setInterval(function () {
            self.execute();
        }, this.interval)
    } else {
        this.execute();
    }
    return this;
}

API.prototype.stop = function () {
    if (this.timerId) {
        hud.util.clearInterval(this.timerId);
        delete this.timerId;
    }
    return this;
}

function apiStart(viewContext) {
    //首屏厂站数量
    var stream1_1 = api({
        data: { // 参数
            year: new Date().getFullYear(),
            count: 5,
        },
        getData: function (args) {
            var result = [];
            for (var i = 0; i < args.count; i++) {
                result.push({
                    label: args.year - i,
                    value: 0,
                });
            }
            var dm = main.sceneManager.dataManager;
            var map = dm.getDataMapByCategory('station');
            if (map) {
                Object.keys(map).forEach(function (id) {
                    var data = map[id];
                    var year = new Date(data.getUserData('opera_time')).getFullYear();
                    for (var i = 0; i < result.length; i++) {
                        if (year <= result[i].label) {
                            result[i].value++;
                        } else {
                            return;
                        }
                    }
                });
            }
            result.reverse();
            return result;
        },
        simulateData: function (sim) {
            return [
                { "value": sim.rndInt(80, 10), "label": 2013 }, //80 到 10 之间，默认 99 到 1
                { "value": sim.rndInt(80, 10), "label": 2014 },
                { "value": sim.rndInt(80, 10), "label": 2015 },
                { "value": sim.rndInt(80, 10), "label": 2016 },
                { "value": sim.rndInt(80, 10), "label": 2017 },
            ];
        },
        success: function (data) {
            viewContext.allShapeMap['factory-count-chart'].data.items = data;
        }
    }).start();

    //首屏交易电量
    var stream1_2 = api({
        url: 'http://{serverhost:serverport}/api/ex_area/total_elec',
        data: {
            "from_date": "2013-01-01",
            "to_date": "2017-12-31"
        },
        interval: 0, //2s 更新一次
        simulateData: function (sim) {
            return {
                "error": null,
                "items": [
                    { "year": 2017, "elec": 45453 }, { "year": 2016, "elec": 35253 },
                    { "year": 2015, "elec": 35253 }, { "year": 2014, "elec": 33546 },
                    { "year": 2013, "elec": 34566 }
                ]
            }
        },
        success: function (r) {
            if (r.error) {
                console.error(r.error);
            }
            r.items.reverse();
            var items = new Array(r.items.length);
            r.items.forEach(function (c, i) {
                items[i] = new Object();
                items[i].label = c.year;
                items[i].value = c.elec;
            });
            viewContext.allShapeMap['transaction_elec'].data.items = items;
        }
    }).start();

    //首屏线损率
    var stream1_3 = api({
        url: 'http://{serverhost:serverport}/api/ex_area/total_loss',
        data: {
            "from_date": "2013-01-01",
            "to_date": "2017-12-31"
        },
        interval: 0, //2s 更新一次
        simulateData: function (sim) {
            return {
                "error": null,
                "items": [
                    { "year": 2017, "loss": 0.0032 },
                    { "year": 2016, "loss": 0.0022 },
                    { "year": 2015, "loss": 0.0012 },
                    { "year": 2014, "loss": 0.0014 },
                    { "year": 2013, "loss": 0.0019 }
                ]
            }
        },
        success: function (r) {
            if (r.error) {
                console.error(r.error);
            }
            r.items.reverse();
            var items = new Array(r.items.length);
            r.items.forEach(function (c, i) {
                items[i] = new Object();
                items[i].label = c.year;
                items[i].value = c.loss * 100;
            });
            viewContext.allShapeMap['lossChart'].data.items = items;
        }
    }).start();

    //首屏计量点统计
    var stream1_4 = api({
        data: {},
        getData: function (args) {
            var result = {
                value: 0,
                label: '计量点',
            };
            var dm = main.sceneManager.dataManager;
            var map = dm.getDataMapByCategory('meterPoint');
            if (map) {
                result.value = Object.keys(map).length;
            }
            return result;
        },
        simulateData: function (sim) {
            return {
                value: 1680,
                label: '计量点',
            };
        },
        success: function (r) {
            viewContext.allShapeMap['measurment-point'].data.value = r.value;
            viewContext.allShapeMap['measurment-point'].data.label = r.label;
        }
    }).start();

    //首屏电能表统计
    var stream1_5 = api({
        data: {},
        getData: function (args) {
            var result = {
                value: 0,
                label: '电能表',
            };
            var dm = main.sceneManager.dataManager;
            var map = dm.getDataMapByCategory('electricEnergyMeter');
            if (map) {
                result.value = Object.keys(map).length;
            }
            return result;
        },
        simulateData: function (sim) {
            return {
                value: 2012,
                label: '电能表',
            };
        },
        success: function (r) {
            viewContext.allShapeMap['energy-meter'].data.value = r.value;
            viewContext.allShapeMap['energy-meter'].data.label = r.label;
        }
    }).start();

    //首屏电压互感器统计
    var stream1_6 = api({
        data: {},
        getData: function (args) {
            var result = {
                value: 0,
                label: '电压互感器',
            };
            var dm = main.sceneManager.dataManager;
            var map = dm.getDataMapByCategory('voltageTransformer');
            if (map) {
                result.value = Object.keys(map).length;
            }
            return result;
        },
        simulateData: function (sim) {
            return {
                value: 1550,
                label: '电压互感器',
            };
        },
        success: function (r) {
            viewContext.allShapeMap['voltage-transformer'].data.value = r.value;
            viewContext.allShapeMap['voltage-transformer'].data.label = r.label;
        }
    }).start();

    //首屏电流互感器统计
    var stream1_7 = api({
        data: {},
        getData: function (args) {
            var result = {
                value: 0,
                label: '电流互感器',
            };
            var dm = main.sceneManager.dataManager;
            var map = dm.getDataMapByCategory('currentTransformer');
            if (map) {
                result.value = Object.keys(map).length;
            }
            return result;
        },
        simulateData: function (sim) {
            return {
                value: 380,
                label: '电流互感器',
            };
        },
        success: function (r) {
            viewContext.allShapeMap['current-transformer'].data.value = r.value;
            viewContext.allShapeMap['current-transformer'].data.label = r.label;
        }
    }).start();

    //资产档案,厂站运行年限统计
    var stream2_1 = api({
        data: { // 参数
            year: [15, 13, 10, 8, 5],
            count: 5,
        },
        getData: function (args) {
            var result = [];
            for (var i = 0; i < args.count; i++) {
                result.push({
                    state: args[i],
                    value: 0,
                });
            }
            var dm = main.sceneManager.dataManager;
            var map = dm.getDataMapByCategory('station');
            Object.keys(map).forEach(function (id) {
                var data = map[id];
                var year = new Date(data.getUserData('opera_time')).getFullYear();
                var operaedTime = new Date().getFullYear() - year;
                for (var i = 0; i < result.length; i++) {
                    if (operaedTime == result[i].state) {
                        result[i].value++;
                    }
                }
                // 判断是否为 >15年 , 13-15年 , 10-13年 , 8-10年 , 5-8年
                // var year = new Date(data.getUserData('opera_time')).getTime();
                // var operaedTime = (new Date().getTime() - year) / 1000 / 60 / 60 / 24 / 365;
                // for (var i = 0; i < result.length; i++) {
                //     if (i == 0 && operaedTime >= result[i].state) {
                //         result[i].value++;
                //         return;
                //     } else if (i == result.length && operaedTime < result[i].state) {
                //         result[i].value++;
                //         return;
                //     } else if (i < result[i].state && i > result[i + 1].state) {
                //         result[i + 1].value++;
                //         return;
                //     }
                // }
            });
            return result;
        },
        simulateData: function (sim) {
            return [
                { state: '15', value: sim.rndInt(25) },
                { state: '13', value: sim.rndInt(25) },
                { state: '10', value: sim.rndInt(25) },
                { state: '8', value: sim.rndInt(25) },
                { state: '5', value: sim.rndInt(25) }
            ]
        },
        success: function (r) {
            var xAxis = [], value = [];
            r.forEach(function (c, i) {
                xAxis.push('运行' + c.state + '年');
                value.push(c.value);
            })
            viewContext.allShapeMap['electric-factory-count-chart'].data.option.xAxis.data = xAxis;
            viewContext.allShapeMap['electric-factory-count-chart'].data.option.series[0].data = value;
        }
    }).start();

    //资产档案,电能表数量统计
    var stream2_2 = api({
        data: {},
        getData: function (args) {
            var result = [];
            var dm = main.sceneManager.dataManager;
            var map = dm.getDataMapByCategory('electricEnergyMeter');
            Object.keys(map).forEach(function (id) {
                var data = map[id];
                var manufacturers = data.getUserData('manufacturers');
                var isHave = false;
                for (var i = 0; i < result.length; i++) {
                    if (result[i].brand == manufacturers) {
                        result[i].value++;
                        isHave = true;
                        return;
                    }
                }
                if (!isHave) {
                    result.push({
                        brand: manufacturers,
                        value: 1,
                    });
                }
            });
            return result;
        },
        simulateData: function (sim) {
            return [
                { brand: '威胜集团', value: sim.rndInt(100) },
                { brand: '炬华科技', value: sim.rndInt(100) },
                { brand: '科陆电子', value: sim.rndInt(100) },
                { brand: '华立仪表', value: sim.rndInt(100) },
                { brand: '宁波三星1', value: sim.rndInt(100) }
            ]
        },
        success: function (r) {
            var xAxis = [], value = [];
            r.forEach(function (c, i) {
                xAxis.push(c.brand);
                value.push(c.value);
            })
            viewContext.allShapeMap['chart-echart-electricEnergeMeterStatistics'].data.option.xAxis.data = xAxis;
            viewContext.allShapeMap['chart-echart-electricEnergeMeterStatistics'].data.option.series[0].data = value;
        }
    }).start();

    //资产档案,电压互感器数量统计
    var stream2_3 = api({
        data: {},
        getData: function (args) {
            var result = {
                ratio: [],
                producer: []
            };
            var dm = main.sceneManager.dataManager;
            var map = dm.getDataMapByCategory('voltageTransformer');
            Object.keys(map).forEach(function (id) {
                var data = map[id];
                var manufacturers = data.getUserData('manufacturers');
                var ratio = data.getUserData('ratio');
                var isManufacturersHave = false;
                var isRatioHave = false;
                for (var i = 0; i < result.producer.length; i++) {
                    if (result.producer[i].brand == manufacturers) {
                        result.producer[i].value++;
                        isManufacturersHave = true;
                        return;
                    }
                }
                for (var i = 0; i < result.ratio.length; i++) {
                    if (result.ratio[i].voltage == ratio) {
                        result.ratio[i].value++;
                        isRatioHave = true;
                        return;
                    }
                }
                if (!isManufacturersHave) {
                    result.producer.push({
                        brand: manufacturers,
                        value: 1,
                    });
                }
                if (!isRatioHave) {
                    result.ratio.push({
                        voltage: ratio,
                        value: 1,
                    });
                }
            });
            return result;
        },
        simulateData: function (sim) {
            return {
                ratio: [
                    { voltage: '300kv', value: sim.rndInt(50) }, { voltage: '320kv', value: sim.rndInt(50) },
                    { voltage: '350kv', value: sim.rndInt(50) }, { voltage: '400kv', value: sim.rndInt(50) },
                    { voltage: '450kv', value: sim.rndInt(50) }, { voltage: '500kv', value: sim.rndInt(50) },
                    { voltage: '520kv', value: sim.rndInt(50) }, { voltage: '530kv', value: sim.rndInt(50) },
                    { voltage: '800kv', value: sim.rndInt(50) }, { voltage: '1000kv', value: sim.rndInt(50) }
                ],
                producer: [
                    { brand: '东润电器', value: sim.rndInt(50) }, { brand: '安徽互感器', value: sim.rndInt(50) },
                    { brand: '上海福开电器', value: sim.rndInt(50) }, { brand: '上海巨广电器', value: sim.rndInt(50) },
                    { brand: '江临电器', value: sim.rndInt(50) }, { brand: '东润电器', value: sim.rndInt(50) },
                    { brand: '安徽互感器', value: sim.rndInt(50) }, { brand: '上海福开电器', value: sim.rndInt(50) },
                    { brand: '上海巨广电器', value: sim.rndInt(50) }, { brand: '江临电器', value: sim.rndInt(50) }
                ]
            }
        },
        success: function (r) {
            var ratioLabel = [], ratioValue = [], producerLabel = [], producerValue = [];
            r.ratio.forEach(function (c, i) {
                ratioLabel.push(c.voltage);
                ratioValue.push(c.value);
            })
            r.producer.forEach(function (c, i) {
                producerLabel.push(c.brand);
                producerValue.push(c.value);
            })
            viewContext.allShapeMap['chart-echart-voltageTransformerStatistics-left'].data.option.yAxis.data = ratioLabel;
            viewContext.allShapeMap['chart-echart-voltageTransformerStatistics-left'].data.option.series[0].data = ratioValue;
            viewContext.allShapeMap['chart-echart-voltageTransformerStatistics-right'].data.option.yAxis.data = producerLabel;
            viewContext.allShapeMap['chart-echart-voltageTransformerStatistics-right'].data.option.series[0].data = producerValue;
        }
    }).start();

    //资产档案,电流互感器数量统计
    var stream2_4 = api({
        data: {},
        getData: function (args) {
            var result = {
                ratio: [],
                producer: []
            };
            var dm = main.sceneManager.dataManager;
            var map = dm.getDataMapByCategory('currentTransformer');
            Object.keys(map).forEach(function (id) {
                var data = map[id];
                var manufacturers = data.getUserData('manufacturers');
                var ratio = data.getUserData('ratio');
                var isManufacturersHave = false;
                var isRatioHave = false;
                for (var i = 0; i < result.producer.length; i++) {
                    if (result.producer[i].brand == manufacturers) {
                        result.producer[i].value++;
                        isManufacturersHave = true;
                        return;
                    }
                }
                for (var i = 0; i < result.ratio.length; i++) {
                    if (result.ratio[i].voltage == ratio) {
                        result.ratio[i].value++;
                        isRatioHave = true;
                        return;
                    }
                }
                if (!isManufacturersHave) {
                    result.producer.push({
                        brand: manufacturers,
                        value: 1,
                    });
                }
                if (!isRatioHave) {
                    result.ratio.push({
                        voltage: ratio,
                        value: 1,
                    });
                }
            });
            return result;
        },
        simulateData: function (sim) {
            return {
                ratio: [
                    { voltage: '300kv', value: sim.rndInt(50) }, { voltage: '320kv', value: sim.rndInt(50) },
                    { voltage: '350kv', value: sim.rndInt(50) }, { voltage: '400kv', value: sim.rndInt(50) },
                    { voltage: '450kv', value: sim.rndInt(50) }, { voltage: '500kv', value: sim.rndInt(50) },
                    { voltage: '520kv', value: sim.rndInt(50) }, { voltage: '530kv', value: sim.rndInt(50) },
                    { voltage: '800kv', value: sim.rndInt(50) }, { voltage: '1000kv', value: sim.rndInt(50) }
                ],
                producer: [
                    { brand: '东润电器', value: sim.rndInt(50) }, { brand: '安徽互感器', value: sim.rndInt(50) },
                    { brand: '上海福开电器', value: sim.rndInt(50) }, { brand: '上海巨广电器', value: sim.rndInt(50) },
                    { brand: '江临电器', value: sim.rndInt(50) }, { brand: '东润电器', value: sim.rndInt(50) },
                    { brand: '安徽互感器', value: sim.rndInt(50) }, { brand: '上海福开电器', value: sim.rndInt(50) },
                    { brand: '上海巨广电器', value: sim.rndInt(50) }, { brand: '江临电器', value: sim.rndInt(50) }
                ]
            }
        },
        success: function (r) {
            var ratioLabel = [], ratioValue = [], producerLabel = [], producerValue = [];
            r.ratio.forEach(function (c, i) {
                ratioLabel.push(c.voltage);
                ratioValue.push(c.value);
            })
            r.producer.forEach(function (c, i) {
                producerLabel.push(c.brand);
                producerValue.push(c.value);
            })
            viewContext.allShapeMap['chart-echart-currentTransformerStatistics-left'].data.option.yAxis.data = ratioLabel;
            viewContext.allShapeMap['chart-echart-currentTransformerStatistics-left'].data.option.series[0].data = ratioValue;
            viewContext.allShapeMap['chart-echart-currentTransformerStatistics-right'].data.option.yAxis.data = producerLabel;
            viewContext.allShapeMap['chart-echart-currentTransformerStatistics-right'].data.option.series[0].data = producerValue;
        }
    }).start();

    //周期检验,电能表运行状态分布
    var stream3_1 = api({
        url: 'http://{serverhost:serverport}/api/subs/meter_status_count/[id]',
        data: {},
        interval: 0, //2s 更新一次
        simulateData: function (sim) {
            return {
                "error": null,
                "items": [
                    { "status": "稳定", "count": sim.rndInt(300000, 100000) },
                    { "status": "正常", "count": sim.rndInt(100000, 500000) },
                    { "status": "预警", "count": sim.rndInt(2000, 1000) }
                ]
            }
        },
        success: function (r) {
            if (r.error) {
                console.error(r.error);
            }
            viewContext.allShapeMap['energyMeter_state_distribute'].data.items = r.items;
        }
    }).start();

    //周期检验,电能表误差分布
    var stream3_2 = api({
        url: 'http://{serverhost:serverport}/api/subs/meter_status_count/[id]',
        data: {},
        interval: 0, //2s 更新一次
        simulateData: function (sim) {
            return {
                "error": null,
                "items": [
                    { "error": -0.26, "count": 1 }, { "error": -0.24, "count": 2 }, { "error": -0.22, "count": 2 },
                    { "error": -0.20, "count": 3 }, { "error": -0.18, "count": 4 }, { "error": -0.16, "count": 5 },
                    { "error": -0.14, "count": 5 }, { "error": -0.12, "count": 7 }, { "error": -0.1, "count": 7 },
                    { "error": -0.08, "count": 9 }, { "error": -0.06, "count": 30 }, { "error": -0.04, "count": 50 },
                    { "error": -0.02, "count": 60 }, { "error": 0, "count": 68 }, { "error": 0.02, "count": 58 },
                    { "error": 0.04, "count": 30 }, { "error": 0.06, "count": 20 }, { "error": 0.08, "count": 10 },
                    { "error": 0.1, "count": 7 }, { "error": 0.12, "count": 5 }, { "error": 0.14, "count": 5 },
                    { "error": 0.16, "count": 5 }, { "error": 0.18, "count": 4 }, { "error": 0.20, "count": 3 },
                    { "error": 0.22, "count": 2 }, { "error": 0.24, "count": 2 }, { "error": 0.26, "count": 1 }
                ]
            }
        },
        success: function (r) {
            if (r.error) {
                console.error(r.error);
            }
            var label = [], data = [];
            r.items.forEach(function (c, i) {
                label.push(c.error);
                data.push(c.count);
            })
            viewContext.allShapeMap['chart-echart-errorDistribution_of_electricEnergyMeter'].data.option.xAxis.data = label;
            viewContext.allShapeMap['chart-echart-errorDistribution_of_electricEnergyMeter'].data.option.series[0].data = data;
        }
    }).start();

    //周期检验,当年时钟偏差统计        //缺少相关接口
    var stream3_3 = api({
        url: '',
        data: {},
        interval: 0, //2s 更新一次
        simulateData: function (sim) {
            return {
                "error": null,
                "items": [
                    { "deviation": ">10", "count": sim.rndInt(15) }, { "deviation": "9-10", "count": sim.rndInt(15) },
                    { "deviation": "8-9", "count": sim.rndInt(15) }, { "deviation": "7-8", "count": sim.rndInt(15) },
                    { "deviation": "6-7", "count": sim.rndInt(15) }, { "deviation": "5-6", "count": sim.rndInt(15) },
                    { "deviation": "4-5", "count": sim.rndInt(15) }, { "deviation": "3-4", "count": sim.rndInt(15) },
                    { "deviation": "2-3", "count": sim.rndInt(15) }, { "deviation": "1-2", "count": sim.rndInt(15) },
                    { "deviation": "<1", "count": sim.rndInt(15) }
                ]
            }
        },
        success: function (r) {
            if (r.error) {
                console.error(r.error);
            }
            var label = [], data = [];
            r.items.forEach(function (c, i) {
                label.push(c.deviation);
                data.push(c.count);
            })
            viewContext.allShapeMap['chart-echart-current_year_clock_deviation'].data.option.xAxis.data = label;
            viewContext.allShapeMap['chart-echart-current_year_clock_deviation'].data.option.series[0].data = data;
        }
    }).start();

    //分区线损,跨区厂站共计计量点统计
    var stream4_1 = api({
        data: {},
        getData: function (args) {
            var result = {
                title: '',
                items: [
                    { state: '考核', number: 0 },
                    { state: '结算', number: 0 }
                ],
            };
            for (var i = 0; i < args.count; i++) {
                result.push({
                    label: args.year - i,
                    value: 0,
                });
            }
            var dm = main.sceneManager.dataManager;
            var map = dm.getDataMapByCategory('station');
            var total = 0;
            if (map) {
                Object.keys(map).forEach(function (id) {
                    var data = map[id];
                    var isAreaCross = data.getUserData('area_cross');
                    if (isAreaCross) {
                        var dataChildren = main.sceneManager.dataManager.getChildren(data);
                        dataChildren.forEach(function (c) {
                            if (main.sceneManager.dataManager.getCategoryForData(c) == 'meterPoint') {
                                if (c.getUserData('type') == '结算关口') {
                                    result.items[1].number++;
                                } else {
                                    result.items[0].number++;
                                }
                            }
                        })
                    }
                });
            }
            result.title = '跨区厂站共计计量点' + (result.items[0].number + result.items[1].number) + '个';
            return result;
        },
        simulateData: function (sim) {
            return {
                title: '跨区厂站共计计量点290个',
                items: [
                    { state: '考核', number: 180 },
                    { state: '结算', number: 110 }
                ],
            }
        },
        success: function (r) {
            viewContext.allShapeMap['regional_meter_count'].data.text = r.title;
            viewContext.allShapeMap['point_statistics'].data.items = r.items;
        }
    }).start();

    //分区线损,区域交换电量及线损率
    var stream4_2 = api({
        url: 'http://{serverhost:serverport}/api/ex_area/elec_loss',
        data: {},
        interval: 0,
        simulateData: function (sim) {
            return {
                "error": null,
                "items": [
                    { "ex_area": "西南送华水", "elec": 4502, "loss": 0.0234 },
                    { "ex_area": "西北送华北", "elec": 3456, "loss": 0.0332 },
                    { "ex_area": "西北送华中", "elec": 3356, "loss": 0.0312 },
                    { "ex_area": "西北送华东", "elec": 3245, "loss": 0.0335 },
                    { "ex_area": "西北送西南", "elec": 3567, "loss": 0.0282 },
                    { "ex_area": "东北送华北", "elec": 5423, "loss": 0.0272 },
                    { "ex_area": "华北送华东", "elec": 1341, "loss": 0.0294 },
                    { "ex_area": "华北送华中", "elec": 2314, "loss": 0.0271 },
                    { "ex_area": "华中送华东", "elec": 2441, "loss": 0.0292 },
                    { "ex_area": "华中送西南", "elec": 1453, "loss": 0.0273 }
                ]
            }
        },
        success: function (r) {
            if (r.error) {
                console.error(r.error);
            }
            var ex_area = [], elec = [], loss = [];
            r.items.forEach(function (c, i) {
                ex_area.push(c.ex_area);
                elec.push(c.elec);
                loss.push(c.loss);
            })
            viewContext.allShapeMap['chart-echart-regional_energe_meter_count'].data.option.xAxis[0].data = ex_area;
            viewContext.allShapeMap['chart-echart-regional_energe_meter_count'].data.option.series[0].data = elec;
            viewContext.allShapeMap['chart-echart-regional_energe_meter_count'].data.option.series[1].data = loss;
        }
    }).start();

    //分区线损,区域交换的总体概述
    var stream4_3 = api({
        url: 'http://{serverhost:serverport}/api/ex_area/summary/[subs]',
        data: {},
        interval: 0,
        simulateData: function (sim) {
            return {
                "error": null,
                "summary": "截至2017年4月，跨区输电线路交换电量为324433亿千瓦时，线损电量为4433亿千瓦时，线损率为3.54%"
            }
        },
        success: function (r) {
            if (r.error) {
                console.error(r.error);
            }
            viewContext.allShapeMap['exchange_general1'].data.summary = r.summary;
            viewContext.allShapeMap['exchange_general2'].data.summary = r.summary;
        }
    }).start();

    //分区线损,直调电厂上网电量
    var stream4_4 = api({
        url: 'http://{serverhost:serverport}/api/subs/elec_statistics',
        data: {},
        interval: 0,
        simulateData: function (sim) {
            return {
                "error": null,
                "items": [
                    { "subs": "三峡左岸水电厂", "statistics": { "this_month": 3400, "last_month": 2366, "last_year": 3498 } },
                    { "subs": "三峡右岸水电厂", "statistics": { "this_month": 3200, "last_month": 2345, "last_year": 7543 } },
                    { "subs": "三峡地下水电厂", "statistics": { "this_month": 3500, "last_month": 3464, "last_year": 4356 } },
                    { "subs": "阳城电厂", "statistics": { "this_month": 2357, "last_month": 3257, "last_year": 3234 } },
                    { "subs": "锦界电厂", "statistics": { "this_month": 5432, "last_month": 2345, "last_year": 3456 } }
                ]
            }
        },
        success: function (r) {
            if (r.error) {
                console.error(r.error);
            }
            var legends = [];
            r.items.forEach(function (c) {
                legends.push(c.subs);
            });
            viewContext.allShapeMap['chart-echart-regional_energy_count'].data.option.legend.data = legends;
            for (var i = 0; i < r.items.length; i++) {
                viewContext.allShapeMap['chart-echart-regional_energy_count'].data.option.series[i].data = [r.items[i].statistics.this_month, r.items[i].statistics.last_month, r.items[i].statistics.last_year];
                viewContext.allShapeMap['chart-echart-regional_energy_count'].data.option.series[i].name = r.items[i].subs;
            }
        }
    }).start();

    //分压线损,获取电压等级的线路本月、上月、去年同期电量和线损率
    var stream5_1 = api({
        url: 'http://{serverhost:serverport}/api/volt/link_elec_loss_statistics',
        data: {},
        interval: 0,
        simulateData: function (sim) {
            return {
                "error": null,
                "item": [
                    {
                        "volt": "1000kV", "elec": { "this_month": 1234, "last_month": 3456, "last_year": 1353 },
                        "loss": { "this_month": 0.0234, "last_month": 0.0223, "last_year": 0.0123 }
                    },
                    {
                        "volt": "+_800kV", "elec": { "this_month": 4323, "last_month": 2345, "last_year": 1235 },
                        "loss": { "this_month": 0.0231, "last_month": 0.0123, "last_year": 0.0314 }
                    },
                    {
                        "volt": "+_500kV", "elec": { "this_month": 2345, "last_month": 4213, "last_year": 5423 },
                        "loss": { "this_month": 0.0341, "last_month": 0.0123, "last_year": 0.0231 }
                    }
                ]
            }
        },
        success: function (r) {
            if (r.error) {
                console.error(r.error);
            }
            var label = [], elec_this_month = [], elec_last_month = [],
                elec_last_year = [], loss_this_month = [],
                loss_last_month = [], loss_last_year = [];
            r.item.forEach(function (c) {
                label.push(c.volt);
            });
            viewContext.allShapeMap['time_energy_loss_rate_chart'].data.option.xAxis[0].data = label;
            for (var i = 0; i < r.item.length; i++) {
                elec_this_month.push(r.item[i].elec.this_month);
                elec_last_month.push(r.item[i].elec.last_month);
                elec_last_year.push(r.item[i].elec.last_year);
                loss_this_month.push(r.item[i].loss.this_month);
                loss_last_month.push(r.item[i].loss.last_month);
                loss_last_year.push(r.item[i].loss.last_year);
            }
            viewContext.allShapeMap['time_energy_loss_rate_chart'].data.option.series[0].data = elec_this_month;
            viewContext.allShapeMap['time_energy_loss_rate_chart'].data.option.series[1].data = elec_last_month;
            viewContext.allShapeMap['time_energy_loss_rate_chart'].data.option.series[2].data = elec_last_year;
            viewContext.allShapeMap['time_energy_loss_rate_chart'].data.option.series[3].data = loss_this_month;
            viewContext.allShapeMap['time_energy_loss_rate_chart'].data.option.series[4].data = loss_last_month;
            viewContext.allShapeMap['time_energy_loss_rate_chart'].data.option.series[5].data = loss_last_year;
        }
    }).start();
    
}