(function ($) {
    $.widget("hud.warningStatistics", {
        options: {
            title: it.util.i18n("ClientAlarmManager_Alarm_statisics"),
            warnings_number: {
                tooltip: {
                    show: true,
                    trigger: "item",
                    backgroundColor: "rgba(67, 103, 106, 1)",
                    borderColor: "rgba(90, 185, 160, 1)",
                    borderWidth: 2,
                    formatter: it.util.i18n("ClientAlarmManager_New_alarm_amount")+' <br /> {b} : {c}'
                },
                title: {
                    show: true,
                    text: it.util.i18n("ClientAlarmManager_Alarm_amount_Last_30_day"),
                    textStyle: {
                        color: "rgba(192, 192, 192, 1)",
                        fontSize: 18
                    },
                    top: '20px',
                    left: '35px'
                },
                grid: {
                    top: '75px',
                    left: '35px',
                    right: '22px',
                    bottom: '45px;',
                },
                xAxis: [
                    {
                        show: true,
                        type: 'category',
                        data: ['2017-09-23', '2017-09-24', '2017-09-25', '2017-09-26'],
                        axisLine: {
                            show: true,
                            lineStyle: {
                                color: "rgba(98, 98, 98, 1)",
                            }
                        },
                        axisTick: {
                            show: true,
                            length: 4,
                            lineStyle: {
                                color: "rgba(98, 98, 98, 1)",
                            }
                        },
                        axisLabel: {
                            show: true,
                            interval: 0,
                            margin: 12,
                            formatter: function (params, index) {
                                if (index % 5 !== 0)
                                    return '';
                                if (params) {
                                    return params.substr(5);
                                }
                                return params;
                            },
                            textStyle: {
                                color: "rgba(192, 192, 192, 1)",
                                fontSize: 12,
                            }
                        },
                        splitLine: {
                            show: false,
                        }
                    }
                ],
                yAxis: [
                    {
                        show: true,
                        type: 'value',
                        name: it.util.i18n("ClientAlarmManager_Amount"),
                        nameTextStyle: {
                            color: "rgba(192, 192, 192, 1)",
                            fontSize: 12
                        },
                        nameGap: 5,
                        boundaryGap: ['0%', '20%'],
                        axisLine: {
                            show: true,
                            lineStyle: {
                                color: "rgba(98, 98, 98, 1)",
                            }
                        },
                        axisTick: {
                            show: false,
                        },
                        axisLabel: {
                            show: true,
                            margin: 6,
                            textStyle: {
                                color: "rgba(192, 192, 192, 1)",
                                fontSize: 12,
                            }
                        },
                        splitLine: {
                            show: true,
                            lineStyle: {
                                color: 'rgba(68, 68, 68, 1)'
                            }
                        }
                    }
                ],
                series: [
                    {
                        type: 'line',
                        symbol: 'circle',
                        symbolSize: 6,
                        hoverAnimation: false,
                        data: [6, 2, 5, 7],
                        lineStyle: {
                            normal: {
                                color: "rgba(0, 145, 120, 1)",
                            }
                        },
                        itemStyle: {
                            normal: {
                                borderColor: "rgba(0, 145, 120, 1)",
                                color: 'rgba(50, 50, 50, 1)'
                            },
                            emphasis: {
                                borderColor: "rgba(0, 145, 120, 1)",
                                color: "rgba(0, 145, 120, 1)"
                            }
                        }
                    }
                ]
            },
            warnings_type: {
                title: {
                    text: it.util.i18n("ClientAlarmManager_Alarm_type_distribute_Last_30_day"),
                    x: 40,
                    y: 20,
                    textStyle: {
                        color: "rgba(192, 192, 192, 1)",
                        fontSize: 18
                    }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: function(params,index){
                        return `${params.name}: ${params.value}(${Math.round(params.percent)}%)`;
                    }
                },
                legend: {
                    align: 'auto',
                    itemWidth: 16,
                    itemHeight: 8,
                    itemGap: 22,
                    top: 55,
                    left: 40,
                    textStyle: {
                        fontSize: 14,
                        color: "rgba(192, 192, 192, 1)",
                    },
                    icon: 'rect',
                    data: ['温度告警', '湿度告警', '漏水告警']
                },
                series: [
                    {
                        type: 'pie',
                        radius: '46%',
                        center: ['50%', '60%'],
                        data: [
                            {
                                value: 335,
                                name: '温度告警',
                                // itemStyle: {
                                //     normal: {
                                //         color: 'rgba(246, 142, 0, 1)'
                                //     }
                                // }
                            },
                            {
                                value: 310,
                                name: '湿度告警',
                                // itemStyle: {
                                //     normal: {
                                //         color: 'rgba(72, 108, 170, 1)'
                                //     }
                                // }
                            },
                            {
                                value: 234,
                                name: '漏水告警',
                                // itemStyle: {
                                //     normal: {
                                //         color: 'rgba(0, 204, 169, 1)'
                                //     }
                                // }
                            }
                        ],
                        itemStyle: {
                            emphasis: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            },
            warnings_level: {
                title: {
                    text: it.util.i18n("ClientAlarmManager_Alarm_level_distribute_Last_30_day"),
                    x: 40,
                    y: 20,
                    textStyle: {
                        color: "rgba(192, 192, 192, 1)",
                        fontSize: 18
                    }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: function(params,index){
                        return `${params.name}: ${params.value}(${Math.round(params.percent)}%)`;
                    }
                },
                legend: {
                    align: 'auto',
                    itemWidth: 16,
                    itemHeight: 8,
                    itemGap: 12,
                    top: 55,
                    left: 40,
                    textStyle: {
                        fontSize: 14,
                        color: "rgba(192, 192, 192, 1)",
                    },
                    icon: 'rect',
                    data: ['严重告警', '主要告警', '次要告警', '警告告警', '不确定告警']
                },
                series: [
                    {
                        type: 'pie',
                        radius: '46%',
                        center: ['50%', '60%'],
                        data: [
                            {
                                value: 335,
                                name: '严重告警',
                                // itemStyle: {
                                //     normal: {
                                //         color: 'rgba(171, 0, 0, 1)'
                                //     }
                                // }
                            },
                            {
                                value: 310,
                                name: '主要告警',
                                // itemStyle: {
                                //     normal: {
                                //         color: 'rgba(246, 142, 0, 1)'
                                //     }
                                // }
                            },
                            {
                                value: 234,
                                name: '次要告警',
                                // itemStyle: {
                                //     normal: {
                                //         color: 'rgba(211, 182, 0, 1)'
                                //     }
                                // }
                            },
                            {
                                value: 234,
                                name: '警告告警',
                                // itemStyle: {
                                //     normal: {
                                //         color: 'rgba(72, 108, 170, 1)'
                                //     }
                                // }
                            },
                            {
                                value: 234,
                                name: '不确定告警',
                                // itemStyle: {
                                //     normal: {
                                //         color: 'rgba(0, 204, 169, 1)'
                                //     }
                                // }
                            }
                        ],
                        itemStyle: {
                            emphasis: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            },
        },

        _create: function () {
            var self = this;
            var mDiv = self.warningStatistics = $('<div class="warningStatistics"></div>').appendTo(self.element);
            self._createBody(mDiv);
            self.refresh();
            this._on(this.element, {
                "click .warningStatistics_top_close": function (e) {
                    $(self.element).hide();
                },
            });
        },

        _createBody: function (mDiv) {
            var warningNumberDiv = $('<div></div>').addClass('warningStatistics_body_warningNumber').appendTo(mDiv);
            var warningTypeDiv = $('<div></div>').addClass('warningStatistics_body_warningType').appendTo(mDiv);
            var warningLevelDiv = $('<div></div>').addClass('warningStatistics_body_warningLevel').appendTo(mDiv);
        },

        _warningNumber_echart: function () {
            var self = this;
            if (!self.warningNumberChart) {
                self.warningNumberChart = echarts.init(document.getElementsByClassName('warningStatistics_body_warningNumber')[0]);
            }
            self.warningNumberChart.setOption(self.options.warnings_number);
        },

        _warningType_echart: function () {
            var self = this;
            if (!self.warningTypeChart) {
                self.warningTypeChart = echarts.init(document.getElementsByClassName('warningStatistics_body_warningType')[0]);
            }
            self.warningTypeChart.setOption(self.options.warnings_type);
        },

        _warningLevel_echart: function () {
            var self = this;
            if (!self.warningLevelChart) {
                self.warningLevelChart = echarts.init(document.getElementsByClassName('warningStatistics_body_warningLevel')[0]);
            }
            self.warningLevelChart.setOption(self.options.warnings_level);
        },

        _setOption: function (key, value) {
            var self = this;
            if (key === "number") {
                self.options.warnings_number.xAxis[0].data = [];
                self.options.warnings_number.series[0].data = [];
                value.forEach(function (v) {
                    self.options.warnings_number.xAxis[0].data.push(v.name);
                    self.options.warnings_number.series[0].data.push(v.value);
                });
                self._warningNumber_echart();
            } else if (key === "type") {
                self.options.warnings_type.legend.data = [];
                self.options.warnings_type.series[0].data = [];
                value.forEach(function (v) {
                    self.options.warnings_type.legend.data.push(v.name);
                    self.options.warnings_type.series[0].data.push({
                        value: v.value,
                        name: v.name,
                    });
                });
                self._warningType_echart();
            } else if (key === "level") {
                self.options.warnings_level.legend.data = [];
                self.options.warnings_level.series[0].data = [];
                value.forEach(function (v) {
                    self.options.warnings_level.legend.data.push(v.name);
                    self.options.warnings_level.series[0].data.push({
                        value: v.value,
                        name: v.name,
                    });
                });
                self._warningLevel_echart();
            }
        },

        refresh: function () {
            var self = this;
            self._warningNumber_echart();
            self._warningType_echart();
            self._warningLevel_echart();
        },

        _destroy: function () {
            $('.warningStatistics').remove();
        }

    })
})(jQuery)