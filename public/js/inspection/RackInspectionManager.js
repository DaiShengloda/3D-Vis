/**
 * 机柜巡检,按照轨迹巡检机柜
 * @param sceneManager
 * @constructor
 */
RackInspectionManager = function (sceneManager) {

    BaseInspectionManager.call(this, sceneManager);

    this.data = null;
    this.closeDataInspectionAuto = true;
    this.closeDataInspectionTime = 3000;

    this.showReportDialogId = 'inspection-report-btn';

    this.inspectionPathMap = {};//保存当前楼层所有的巡检路径

    this.inspectionDataArray = []; //保存当前巡检路径,巡检过程中,产生的巡检数据

    this.inspectionDataMap = {}; //如果是播放巡检记录,保存当前巡检记录的巡检数据

    this.isPlayInspectionReport = false;//是否是播放巡检报告

    this.init();
};

mono.extend(RackInspectionManager, BaseInspectionManager, {

    /******************************* 巡检相关  ***********************************/

    /**
     * 初始化
     */
    init: function () {
        var self = this;

        make.Default.load('twaver.idc.worker', function (host) {
            var updater = function (element) {
                if (element && element.getChildren()) {
                    element.getChildren().forEach(function (child) {
                        child.setStyle('m.normalType', mono.NormalTypeSmooth);
                        updater(child);
                    });
                }
            }
            updater(host);
            host.setScale(3, 3, 3);
            host.setPositionY(5);
            self.setHost(host);
        });

        this.sceneManager.viewManager3d.addPropertyChangeListener(function (event) {
            // console.log(event);
            if (event.property == "focusNode") {
                self.stop();
            }
        })

        if (!it.util.dataTypeArray || it.util.dataTypeArray.length == 0) {
            it.util.loadDataTypes();
        }

        if (!it.util.categoryArray || it.util.categoryArray.length == 0) {
            it.util.loadCategories();
        }
    },
    // menuClickHandler: function (id) {
    //     self = this;
    //     if (id == self.showReportDialogId) {
    //         console.log('replay initRooms report ...')
    //         self.showReportDialog();
    //     } else {
    //         var inspectionPath = self.inspectionPathMap[id];
    //         self.inspect(inspectionPath);
    //     }
    // },

    /**
    * @function {getInspectionMenu} 取得巡检的轨迹菜单
    * @param  {type} callback {description}
    * @return {type} {description}
    */
    getInspectionMenu: function (callback) {

        var self = this;
        var rootNode = this.sceneManager.getCurrentRootNode();
        var rootData = this.sceneManager.getNodeData(rootNode);
        it.util.search('inspection_path', { parentId: rootData.getId() }, function (inspectionPathArray) {

            var menus = inspectionPathArray.map(function (inspectionPath) {
                self.inspectionPathMap[inspectionPath.id] = inspectionPath;
                return {
                    name: it.util.i18n("RackInspectionManager_Path")+' : ' + inspectionPath.name,
                    class: 'mo-inspection',
                    sceneId: 'floor',
                    items: [],
                    click: function () {
                        self.inspect(inspectionPath);
                    }
                };
            })
            callback && callback(menus);
        })
    },

    /**
     * 刷新巡检按钮
     * @param data
     */
    // refreshMenu: function () {

    //     var data = this.sceneManager.getNodeData(this.sceneManager.getCurrentRootNode());
    //     this.data = null;
    //     var menuBox = $('#inspection-report').closest('ul')
    //     menuBox.empty();
    //     if (!data) {
    //         return;
    //     }
    //     var self = this;
    //     this.data = data;
    //     this.inspectionPathMap = {};


    //     it.util.search('inspection_path', { parentId: data.getId() }, function (inspectionPathArray) {
    //         inspectionPathArray.forEach(function (inspectionPath) {
    //             self.inspectionPathMap[inspectionPath.id] = inspectionPath;

    //             var menu = $('<li><a href="#"><i class="mo-inspection"></i><span></span></a></li>');
    //             menu.attr('id', inspectionPath.id);
    //             menu.find('span').text('路径:' + inspectionPath.name);
    //             menu.appendTo(menuBox);
    //             menu.on('click', function () {
    //                 var id = $(this).attr('id');
    //                 self.menuClickHandler(id);
    //             })
    //         })
    //     })

    //     this.inspetionPathReport = {};
    //     it.util.api('inspection_report', 'lastReportId', {}, function (result) {
    //         result.forEach(function (item) {
    //             self.inspetionPathReport[item.inspectionPathId] = item;
    //         })
    //     })


    //     var menu = $('<li><a href="#"><i class="mo-inspection"></i><span></span></a></li>');
    //     menu.attr('id', this.showReportDialogId);
    //     menu.find('span').text('巡检报告');
    //     menu.appendTo(menuBox);
    //     menu.on('click', function () {
    //         var id = $(this).attr('id');
    //         self.menuClickHandler(id);
    //     })
    // },

    /**
     * 保存巡检报告
     */
    showSaveReportDialog: function () {

        var self = this;
        var report = {
            inspectionPathId: this.inspectionPath.id,
            startTime: this.startTime,
            endTime: this.endTime,
            remark: '',
        }
        //按区域分组
        var inspectionAreaMap = {};
        var inspectionAreaArray = [];
        this.inspectionDataArray.forEach(function (inspectionData) {
            var target = inspectionData.target;
            var data = self.dataManager.getDataById(target);
            var area = self.dataManager.getParent(data);
            var areaId = area.getId();
            if (!inspectionAreaMap[areaId]) {
                var am = {
                    inspectionAreaId: areaId,
                    startTime: inspectionData.dateTime,
                    endTime: inspectionData.dateTime,
                    workGroup: '',
                    workShift: '',
                    worker: '',
                    checker: '',
                    inspectionData: []
                };
                inspectionAreaMap[areaId] = am;
                inspectionAreaArray.push(am)
            }
            var inspectionArea = inspectionAreaMap[areaId];
            //计算出最大时间和最小时间
            if (Date.parse(inspectionArea.startTime) > Date.parse(inspectionData.dateTime)) {
                inspectionArea.startTime = inspectionData.dateTime
            }
            if (Date.parse(inspectionArea.endTime) < Date.parse(inspectionData.dateTime)) {
                inspectionArea.endTime = inspectionData.dateTime
            }
            inspectionArea.inspectionData.push(inspectionData);
        })

        report.inspectionArea = inspectionAreaArray;

        var form = $('<form class="form-horizontal"></form>').appendTo($('body'));
        form.css('display', 'none');
        form.css('padding', '20px');

        var contentDiv = $('<div class="save-inspection-report-box"></div>').appendTo(form);
        var table = $('<table></table>').appendTo(contentDiv);
        $('<tr><td class="name"><label>'+it.util.i18n("RackInspectionManager_Inspection_path")+' :</label></td><td><input disabled class="value" value="' + report.inspectionPathId + '"></td></tr>').appendTo(table);
        $('<tr><td class="name"><label>'+it.util.i18n("RackInspectionManager_Start_time")+' :</label></td><td><input disabled class="value" value="' + moment(report.startTime).format('YYYY-MM-DD HH:mm:ss') + '"></td></tr>').appendTo(table);
        $('<tr><td class="name"><label>'+it.util.i18n("RackInspectionManager_End_time")+' :</label></td><td><input disabled class="value" value="' + moment(report.endTime).format('YYYY-MM-DD HH:mm:ss') + '"></td></tr>').appendTo(table);
        $('<tr><td class="name"><label>'+it.util.i18n("RackInspectionManager_Memo")+' :</label></td><td><textarea class="value remark" ></textarea></td></tr>').appendTo(table);

        var index = layer.open({
            type: 1,
            title: it.util.i18n("RackInspectionManager_Save_report"),
            skin: 'layui-layer-rim', //加上边框
            area: ['300px', '300px'], //宽高
            content: form,
            btn: [it.util.i18n("RackInspectionManager_Save")],
            btn1: function () {
                var remark = form.find('.remark').val();
                report.remark = remark;
                //console.log(data);
                util.api('inspection_report', 'saveReport', report, function (r) {

                    layer.open({
                        title: it.util.i18n("RackInspectionManager_Success"),
                        content: it.util.i18n("RackInspectionManager_Save_Success")
                    });
                    layer.close(index);
                });
            },
        });
    },

    /**
     * 巡检结束
     */
    onFinish: function () {

        var self = this;
        this.host.setParent(null);
        this.box.removeByDescendant(this.host);

        this.endTime = new Date();

        if (!this.isPlayInspectionReport) {
            this.showSaveReportDialog();
        }

        this.inspectionDataArray = [];
        this.inspectionPath = null;
        this.inspectionDataMap = {};
        delete this.inspectionPath;
        delete this.startTime;
        delete this.endTime;
    },

    /**
     * 开始巡检
     * @param inspectionPath
     */
    inspect: function (inspectionPath, isPlayInspectionReport) {

        var self = this;
        if (this.isPlaying() || this.isPause()) {
            layer.alert(it.util.i18n("RackInspectionManager_Inspecting"));
            return;
        }

        this.isPlayInspectionReport = isPlayInspectionReport;
        this.inspectionPath = inspectionPath;
        this._inspect();
    },

    _inspect: function () {
        this.inspectionDataArray = [];
        this.data = this.sceneManager.getNodeData(this.sceneManager.getCurrentRootNode());
        var path = this.parsePath(this.inspectionPath.path);
        var node = this.sceneManager.getNodeByDataOrId(this.data);
        this.host.setParent(node);
        this.box.addByDescendant(this.host);
        this.setPath(path);
        this.startTime = new Date();
        this.play();
    },

    /**
     * 格式化path
     * @param path
     * @returns {Array}
     */
    parsePath: function (path) {

        var result = [];
        for (var i = 0; i < path.length; i += 2) {
            result.push([path[i], path[i + 1]]);
        }
        return result;
    },

    /**
     * 播放巡检报告
     * @param inspectionReportId
     */
    playInspectionReport: function (inspectionReportId, callback) {
        var self = this;
        //取得巡检报告
        it.util.getById('inspection_report', inspectionReportId, function (inspectionReport) {
            var inspectionPath = self.inspectionPathMap[inspectionReport.inspectionPathId]
            if (!inspectionPath) {
                layer.alert(it.util.i18n("RackInspectionManager_Path_Deleted")+':' + inspectionReport.inspectionPathId);
                return;
            }

            //取得所有巡检对象
            self.inspectionDataMap = {};
            it.util.search('inspection_data', { inspectionReportId: inspectionReportId }, function (inspectionDataArray) {

                inspectionDataArray.forEach(function (item) {
                    self.inspectionDataMap[item.target] = item;
                });
                self.inspect(inspectionPath, true);
            })

            //it.util.search('inspection_area', {inspectionReportId: inspectionReportId}, function (inspectionAreaArray) {
            //
            //    inspectionAreaArray.forEach(function(inspectionArea){
            //        var inspectionAreaId = inspectionArea.id;
            //        it.util.search('inspection_data', {inspectionAreaId: inspectionAreaId}, function (inspectionData) {
            //            self.inspectionDataMap = {};
            //            inspectionData.forEach(function (item) {
            //                self.inspectionDataMap[item.target] = item;
            //            })
            //            self.inspect(inspectionPath, true);
            //        });
            //    })
            //
            //})

        })
    },

    /**
     * 渲染巡检数据
     */
    renderInspectData: function () {
        var result = InspectionManager.superClass.renderInspectData.call(this);
        if (!result) {
            return;
        }
        var self = this;

        if (this.isShowDataInspection()) {
            //如果有告警, 暂停巡检, 显示告警信息.
            this.showDataInspection();
            setTimeout(function () {
                self.pause();
            }, 0)
            if (this.closeDataInspectionAuto) {
                self.closeDataInspectionTimer = setTimeout(function () {
                    self.closeDataInspection();
                }, this.closeDataInspectionTime)
            }
        } else {
            var keys = Object.keys(this.currentInspectingDataMap);
            keys.forEach(function (key) {
                var data = self.currentInspectingDataMap[key];
                self.addSafeData(data);
            })
        }
    },

    /**
     * 是否需要弹出巡检信息
     * 默认是按照是否有告警来判断
     * 播放记录是,会按照历史数据类播放
     * @returns {boolean}
     */
    isShowDataInspection: function () {

        var self = this;

        //是否是播放巡检报告
        if (this.isPlayInspectionReport) {
            var keys = Object.keys(this.currentInspectingDataMap);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (self.inspectionDataMap[key] && self.inspectionDataMap[key].status) {
                    return true;
                }
            }
            return false;
        }

        var count = 0;
        var keys = Object.keys(this.currentInspectingDataMap);
        keys.forEach(function (key) {
            var data = self.currentInspectingDataMap[key];
            var alarmState = data.getAlarmState();
            count += alarmState.getAlarmCount();
        })

        return count > 0;
    },

    /**
     * 显示巡检信息
     */
    showDataInspection: function () {

        var self = this;

        var content = '';
        if (this.isPlayInspectionReport) {
            var keys = Object.keys(this.currentInspectingDataMap);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (self.inspectionDataMap[key] && self.inspectionDataMap[key]) {
                    if (content.length > 0) {
                        content += '<br>'
                    }
                    content += self.inspectionDataMap[key].content;
                }
            }
        } else {
            var keys = Object.keys(this.currentInspectingDataMap);
            keys.forEach(function (key) {
                var data = self.currentInspectingDataMap[key];
                var label = data.getId();
                if (data.getDescription() && data.getDescription().trim().length > 0) {
                    label = data.getDescription();
                }
                var alarmState = data.getAlarmState();
                var count = alarmState.getAlarmCount();
                var d = moment().format('YYYY-MM-DD, HH:mm:ss');
                if (count > 0) {
                    var alarmSeverity = alarmState.getHighestAlarmSeverity();
                    var level = self.alarmManager.getAlarmSeverityName(alarmSeverity);
                    var s = it.util.i18n("RackInspectionManager_Alarm_info")+' :  ' + label +
                        '<br>'+it.util.i18n("RackInspectionManager_Alarm_num")+' :  ' + count + '' +
                        '<br>'+it.util.i18n("RackInspectionManager_highest_level")+' :  ' + level;
                    if (content.length > 0) {
                        content += '<br>'
                    }
                    content += s;

                    self.inspectionDataArray.push({
                        dateTime: d,
                        target: data.getId(),
                        dataTypeId: data.getDataTypeId(),
                        categoryId: it.util.dataTypeMap[data.getDataTypeId()] ? it.util.dataTypeMap[data.getDataTypeId()].categoryId : '',
                        type: 'text',
                        content: s,
                        inspectionProperty: [
                            {
                                dateTime: d,
                                name: it.util.i18n("RackInspectionManager_Alarm_num"),
                                value: count,
                                threshold: it.util.i18n("RackInspectionManager_Equal")+'0',
                                status: false
                            },
                            {
                                dateTime: d,
                                name: it.util.i18n("RackInspectionManager_highest_level"),
                                value: level,
                                threshold: 'clear',
                                status: false
                            }
                        ]
                    })
                } else {
                    self.addSafeData(data);
                }
            })
        }
        if (content.length > 0) {
            this.reportLayer = layer.open({
                title: it.util.i18n("RackInspectionManager_Inspection_report"),
                area: ['350px', '200px'],
                shadeClose: true,
                content: content,
                end: function () {
                    self.closeDataInspection();
                }
            });
        }
    },

    addSafeData: function (data) {
        var d = moment().format('YYYY-MM-DD, HH:mm:ss');
        this.inspectionDataArray.push({
            dateTime: d,
            target: data.getId(),
            dataTypeId: data.getDataTypeId(),
            categoryId: it.util.dataTypeMap[data.getDataTypeId()] ? it.util.dataTypeMap[data.getDataTypeId()].categoryId : '',
            type: 'text',
            content: '',
            inspectionProperty: [
                {
                    dateTime: d,
                    name: it.util.i18n("RackInspectionManager_Alarm_num"),
                    value: 0,
                    threshold: it.util.i18n("RackInspectionManager_Equal")+'0',
                    status: true
                }
            ]
        })
    },

    /**
     * 关闭巡检信息
     */
    closeDataInspection: function () {
        var self = this;
        clearTimeout(self.closeDataInspectionTimer);
        delete self.closeDataInspectionTimer;
        layer.close(self.reportLayer);
        self.reportLayer = 0;
        delete self.reportLayer;
        self.resume();
    },
});

var InspectionManager = RackInspectionManager;