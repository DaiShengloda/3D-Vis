/**
 * 巡检的基础类,负责弹出巡检报告的内容
 * @param sceneManager
 * @constructor
 */
BaseInspectionManager = function (sceneManager) {

    it.InspectionManager.call(this, sceneManager);
    this.alarmManager = sceneManager.getAlarmManager();
};

mono.extend(BaseInspectionManager, it.InspectionManager, {

    /******************************* 巡检报告相关  ***********************************/
    /**
     *
     */
    showReportDialog: function (params) {

        var self = this;
        this.queryInspectionReportParams = params || {};
        this.queryInspectionReportParams.where = this.queryInspectionReportParams.where || {};
        var initSelect = function (select, method, value) {
            it.util.api('inspection_area', method, {}, function (r) {
                r.forEach(function (item) {
                    var label = item.value;
                    var data = self.dataManager.getDataById(item.value);
                    if (data && data.getDescription() && data.getDescription().trim().length > 0) {
                        label = data.getDescription()
                    }
                    $('<option ' + (value == item.value ? 'selected' : '') + ' value="' + item.value + '">' + label + '</option>').appendTo(select);
                })
            })
        }


        var dialog = this.reportDialog = $('<div class="report-dialog"></div>').appendTo($('body'));
        var toolbar = $('<div class="toolbar"></div>').appendTo(dialog);
        //$('<label class="inspectionPathId">巡检路径</label>').appendTo(toolbar);
        //var $inspectionPathId = $('<input name="inspectionPathId"/>').appendTo(toolbar);
        $('<label class="inspectionArea">'+ it.util.i18n("BaseInspectionManager_Inspection_area")+'</label>').appendTo(toolbar);
        var $inspectionArea = $('<select name="inspectionArea"><option value="">'+it.util.i18n("BaseInspectionManager_All")+'</option></select>').appendTo(toolbar);
        initSelect($inspectionArea, 'areaList', this.queryInspectionReportParams.where.inspectionArea);

        $('<label class="dateTime">'+it.util.i18n("BaseInspectionManager_Inspection_date")+'</label>').appendTo(toolbar);
        var $dateTimeMin = this.$dateTimeMin = $('<input name="dateTime" class="dateTimeMin form_datetime"/>').appendTo(toolbar);
        toolbar.append(' -');
        var $dateTimeMax = this.$dateTimeMax = $('<input name="dateTime" class="dateTimeMax form_datetime"/>').appendTo(toolbar);


        //$dateTimeMin.on('click', function () {
        //    laydate(minOpt);
        //    resetBoxSizing($('.laydate_box'));
        //})
        //
        //$dateTimeMax.on('click', function () {
        //    laydate(maxOpt);
        //    resetBoxSizing($('.laydate_box'));
        //})

        $('<label class="workGroup">'+it.util.i18n("BaseInspectionManager_Inspection_group")+'</label>').appendTo(toolbar);
        var $workGroup = $('<select name="workGroup"><option value="">'+it.util.i18n("BaseInspectionManager_All")+'</option></select>').appendTo(toolbar);
        initSelect($workGroup, 'workGroupList');

        $('<label class="workShift">'+it.util.i18n("BaseInspectionManager_Inspection_shift")+'</label>').appendTo(toolbar);
        var $workShift = $('<select name="workShift"><option value="">'+it.util.i18n("BaseInspectionManager_All")+'</option></select>').appendTo(toolbar);
        initSelect($workShift, 'workShiftList');

        $('<label class="status">'+it.util.i18n("BaseInspectionManager_Status")+'</label>').appendTo(toolbar);
        var $status = $('<select name="status"><option value="">'+it.util.i18n("BaseInspectionManager_All")+'</option><option value="true">'+it.util.i18n("BaseInspectionManager_Normal")+'</option><option value="false">'+it.util.i18n("BaseInspectionManager_Abnormal")+'</option></select>').appendTo(toolbar);

        var searchBtn = $('<input class="search" type="button" value="'+it.util.i18n("BaseInspectionManager_Query")+'"/>').appendTo(toolbar);

        searchBtn.on('click', function () {

            self.queryInspectionReportParams.pageIndex = 1;
            self.queryInspectionReportParams.where = {};
            //var id = $inspectionPathId.val();
            //if (!it.util.isEmptyStr(id)) {
            //    self.queryInspectionReportParams.where.inspectionPathId = {'$like': '%' + id + '%'}
            //}else{
            //    delete self.queryInspectionReportParams.where.inspectionPathId
            //}
            var inspectionAreaId = $inspectionArea.val();
            self.queryInspectionReportParams.where.inspectionAreaId = {'$like': '%' + inspectionAreaId + '%'}

            var minDate = $dateTimeMin.val();
            if (!it.util.isEmptyStr(minDate)) {
                self.queryInspectionReportParams.where.startTime = {'$gte': minDate}
            } else {
                delete self.queryInspectionReportParams.where.startTime;
            }
            var maxDate = $dateTimeMax.val();
            if (!it.util.isEmptyStr(maxDate)) {
                if (self.queryInspectionReportParams.where.startTime) {
                    self.queryInspectionReportParams.where.startTime['$lte'] = maxDate
                } else {
                    self.queryInspectionReportParams.where.startTime = {'$lte': maxDate}
                }
            }

            var workGroup = $workGroup.val();
            self.queryInspectionReportParams.where.workGroup = {'$like': '%' + workGroup + '%'}

            var workShift = $workShift.val();
            self.queryInspectionReportParams.where.workShift = {'$like': '%' + workShift + '%'}

            var status = $status.val();
            if (status.length > 0) {
                self.queryInspectionReportParams.where.status = status == 'true';
            } else {
                delete self.queryInspectionReportParams.where.status;
            }

            self.refreshReportDialog(self.queryInspectionReportParams, tbody, pageBox);
        })

        var contentBox = $('<div class="contentBox"></div>').appendTo(dialog);
        var table = $('' +
            '<table>' +
            '   <thead>' +
            '       <tr>' +
                //'           <td class="inspectionPathId">巡检路径</td>' +
            '           <td class="inspectionAreaId">'+it.util.i18n("BaseInspectionManager_Inspection_area")+'</td>' +
            '           <td class="inspectionDate">'+it.util.i18n("BaseInspectionManager_Inspection_date")+'</td>' +
            '           <td class="workGroup">'+it.util.i18n("BaseInspectionManager_Group")+'</td>' +
            '           <td class="workShift">'+it.util.i18n("BaseInspectionManager_Shift")+'</td>' +
            '           <td class="worker">'+it.util.i18n("BaseInspectionManager_Inspection_person")+'</td>' +
            '           <td class="checker">'+it.util.i18n("BaseInspectionManager_Check_person")+'</td>' +
            '           <td class="startTime dateTime">'+it.util.i18n("BaseInspectionManager_Inspection_start_time")+'</td>' +
            '           <td class="endTime dateTime">'+it.util.i18n("BaseInspectionManager_Inspection_end_time")+'</td>' +
            '           <td class="status">'+it.util.i18n("BaseInspectionManager_Status")+'</td>' +
                //'           <td class="remark">巡检备注</td>' +
            '           <td class="operation">'+it.util.i18n("BaseInspectionManager_Operation")+'</td>' +
            '       </tr>' +
            '   </thead>' +
            '</table>').appendTo(contentBox);
        var tbody = $('<tbody></tbody>').appendTo(table);

        var pageContent = $('<div class="pageContent"></div>').appendTo(dialog);

        var pageSizeBox = $('<span class="pageSizeBox"></span>').appendTo(pageContent);
        var pageBox = $('<span class="pageBox"></span>').appendTo(pageContent);

        $('<label>'+it.util.i18n("BaseInspectionManager_Record_in_page")+'</label>').appendTo(pageSizeBox);
        var $pageSizeSelect = $('<select><option selected value="10">10'+it.util.i18n("BaseInspectionManager_Piece")+'</option><option value="20">20'+it.util.i18n("BaseInspectionManager_Piece")+'</option><option value="30">30'+it.util.i18n("BaseInspectionManager_Piece")+'</option></select>').appendTo(pageSizeBox);
        $pageSizeSelect.change(function () {
            var size = parseInt($pageSizeSelect.val());
            self.queryInspectionReportParams.pageSize = size;
            self.refreshReportDialog(self.queryInspectionReportParams, tbody, pageBox);
        })

        this.queryInspectionReportParams.order = [['start_time', 'desc']];

        this.refreshReportDialog(this.queryInspectionReportParams, tbody, pageBox);

        this.showReportDialogIndex = layer.open({
            type: 1,
            title: it.util.i18n("BaseInspectionManager_Inspection_report"),
            skin: 'layui-layer-rim', //加上边框
            area: ['1062px', '610px'],
            //shadeClose: true,
            content: dialog,
            btn: [it.util.i18n("BaseInspectionManager_Close")],
            end: function () {
                self.closeReportDialog();
            }
        });

        //TODO 必须在弹框后才能调用,否则控件不显示.
        $dateTimeMin.datetimepicker({
            language:  'zh-CN',
            format: 'yyyy-mm-dd hh:ii:ss',
            autoclose: true,
            todayBtn: true,
            todayHighlight:true,
            forceParse:true,
            weekStart: 1,
            startView: 2,//月视图,显示天
            minView: 0,
            startDate:'2016-01-01 00:00:00',
            endDate:'2099-12-31 23:59:59',
        }).on('changeDate', function(ev){
            //console.log(ev);
            $dateTimeMax.datetimepicker('setStartDate', ev.date);
        })

        $dateTimeMax.datetimepicker({
            language:  'zh-CN',
            format: 'yyyy-mm-dd hh:ii:ss',
            autoclose: true,
            todayBtn: true,
            todayHighlight:true,
            forceParse:true,
            weekStart: 1,
            startView: 2,//月视图,显示天
            minView: 0,
            startDate:'2016-01-01 00:00:00',
            endDate:'2099-12-31 23:59:59',
        }).on('changeDate', function(ev){
            //console.log(ev);
            $dateTimeMin.datetimepicker('setEndDate', ev.date);
        })

        table.on('click', 'a', function () {
            var a = $(this);
            var tr = a.closest('tr');
            var id = parseInt(tr.attr('id'));
            if (a.hasClass('play')) {

                var inspectionReportId = tr.data('inspectionReportId');
                self.playInspectionReport(inspectionReportId);
                self.closeReportDialog();
            } else {
                self.showReportDataDialog(id);
            }
            self.inspectionArea = tr.find('.inspectionArea').text();
        })
    },
    closeReportDialog: function () {
        layer.close(this.showReportDialogIndex);
        this.$dateTimeMin && this.$dateTimeMin.datetimepicker('remove');
        delete this.$dateTimeMin;
        this.$dateTimeMax && this.$dateTimeMax.datetimepicker('remove');
        delete this.$dateTimeMax;
        this.reportDialog && this.reportDialog.remove();
        delete this.reportDialog;
    },

    /**
     * 刷新巡检报告列表
     * @param params
     * @param tbody
     * @param pageBox
     */
    refreshReportDialog: function (params, tbody, pageBox) {

        var self = this;
        params.pageSize = params.pageSize || 10;
        params.pageIndex = params.pageIndex || 1;
        params.offset = (params.pageIndex - 1) * params.pageSize;
        params.limit = params.pageSize;
        params.order = [['id', 'desc']];
        //this.refreshReportDialogIndex = layer.load(1, {
        //    shade: [0.5, '#fff'] //0.1透明度的白色背景
        //});
        ServerUtil.api('inspection_area', 'searchAndCount', params, function (result) {
            //layer.close(self.refreshReportDialogIndex);
            tbody.empty();
            result.rows.forEach(function (item, index) {

                var tr = $('' +
                    '       <tr>' +
                        //'           <td class="inspectionPathId">巡检路径</td>' +
                    '           <td class="inspectionAreaId">'+it.util.i18n("BaseInspectionManager_Inspection_area")+'</td>' +
                    '           <td class="inspectionDate">'+it.util.i18n("BaseInspectionManager_Inspection_date")+'</td>' +
                    '           <td class="workGroup">'+it.util.i18n("BaseInspectionManager_Group")+'</td>' +
                    '           <td class="workShift">'+it.util.i18n("BaseInspectionManager_Shift")+'</td>' +
                    '           <td class="worker">'+it.util.i18n("BaseInspectionManager_Inspection_person")+'</td>' +
                    '           <td class="checker">'+it.util.i18n("BaseInspectionManager_Check_person")+'</td>' +
                    '           <td class="startTime dateTime">'+it.util.i18n("BaseInspectionManager_Inspection_start_time")+'</td>' +
                    '           <td class="endTime dateTime">'+it.util.i18n("BaseInspectionManager_Inspection_end_time")+'</td>' +
                    '           <td class="status">'+it.util.i18n("BaseInspectionManager_Status")+'</td>' +
                        //'           <td class="remark">巡检备注</td>' +
                    '           <td class="operation"></td>' +
                    '       </tr>' +
                    '').appendTo(tbody);
                var keys = Object.keys(item);
                keys.forEach(function (key, index) {
                    var td = tr.find('.' + key);
                    if (td.length > 0) {
                        if (td.hasClass('status')) {
                            td.html(item.status ? it.util.i18n("BaseInspectionManager_Normal") : it.util.i18n("BaseInspectionManager_Abnormal"));
                            return;
                        }
                        if (td.hasClass('dateTime')) {
                            var s = moment(item[key]).format('YYYY-MM-DD HH:mm:ss');
                            td.html(s);
                        } else if (td.hasClass('inspectionArea')) {
                            var id = item[key];
                            var label = id;
                            var data = self.dataManager.getDataById(id);
                            if (data && data.getDescription().trim().length > 0) {
                                label = data.getDescription()
                            }
                            td.html(label);
                        } else {
                            td.html(item[key]);
                        }
                    }
                })
                if (item.dataCount) {
                    tr.find('.operation').append('<a class="review" href="javascript:void(0)">'+it.util.i18n("BaseInspectionManager_Detail")+'</a>');
                }
                tr.find('.inspectionDate').text(moment(item.startTime).format('YYYY-MM-DD'));
                if (index % 2 == 1) {
                    tr.css('background-color', '#fbfbfb')
                } else {
                    //tr.css('background-color', '#fcfcfc')
                }
                tr.attr('id', item.id);
                tr.data('inspectionReportId', item.inspectionReportId);

                if (self.inspectionPathMap[item.inspectionPathId]) {
                    tr.find('.operation').append('<a class="play" href="javascript:void(0)">'+it.util.i18n("BaseInspectionManager_Play")+'</a>')
                }
            })

            var pages = Math.ceil(result.count / params.pageSize);
            laypage({
                cont: pageBox, //容器。值支持id名、原生dom对象，jquery对象。【如该容器为】：<div id="page1"></div>
                skip: true, //是否开启跳页
                pages: pages, //通过后台拿到的总页数
                curr: params.pageIndex, //当前页
                jump: function (obj, first) { //触发分页后的回调
                    //console.log(obj, first);
                    if (obj.curr != params.pageIndex) {
                        params.pageIndex = obj.curr;
                        self.refreshReportDialog(params, tbody, pageBox);
                    }
                }
            });
        })

    },

    /**
     * 显示巡检对象列表
     * @param inspectionAreaId
     */
    showReportDataDialog: function (inspectionAreaId) {

        var self = this;
        var dialog = this.reportDataDialog = $('<div class="report-data-dialog"></div>').appendTo($('body'));
        var contentBox = $('<div class="contentBox"></div>').appendTo(dialog);
        var table = $('' +
            '<table>' +
            '   <thead>' +
            '       <tr>' +
            '           <td class="target">'+it.util.i18n("BaseInspectionManager_Inspection_target")+'</td>' +
            '           <td class="dateTime">'+it.util.i18n("BaseInspectionManager_Inspection_time")+'</td>' +
            '           <td class="dataTypeId">'+it.util.i18n("BaseInspectionManager_Data_type")+'</td>' +
            '           <td class="categoryId">'+it.util.i18n("BaseInspectionManager_Category")+'</td>' +
            '           <td class="status">'+it.util.i18n("BaseInspectionManager_Status")+'</td>' +
                //'           <td class="content">巡检结果</td>' +
            '           <td class="operation">'+it.util.i18n("BaseInspectionManager_Operation")+'</td>' +
            '       </tr>' +
            '   </thead>' +
            '</table>').appendTo(contentBox);
        var tbody = $('<tbody></tbody>').appendTo(table);

        table.on('click', 'a', function () {
            var a = $(this);
            var tr = a.closest('tr');
            var id = parseInt(tr.attr('id'));
            self.inspectionDate = tr.find('.dateTime').text();
            self.showReportPropertyDialog(id);
        })

        this.showReportDialogDataIndex = layer.open({
            type: 1,
            title: it.util.i18n("BaseInspectionManager_Inspection_target_content")+':' + inspectionAreaId,
            skin: 'layui-layer-rim', //加上边框
            area: ['702px', '500px'],
            shadeClose: true,
            content: dialog,
            btn: [it.util.i18n("BaseInspectionManager_Close")],
            end: function () {
                self.closeReportDataDialog();
            }
        });

        it.util.search('inspection_data', {
            where: {inspectionAreaId: inspectionAreaId},
            order: [['date_time', 'asc']]
        }, function (result) {
            result.forEach(function (item, index) {
                var tr = $('<tr></tr>').appendTo(tbody);
                tr.append('' +
                    '   <td class="target">' + item.target + '</td>' +
                    '   <td class="dateTime">' + moment(item.dateTime).format('YYYY-MM-DD HH:mm:ss') + '</td>' +
                    '   <td class="dataTypeId">' + (item.dataTypeId || '') + '</td>' +
                    '   <td class="categoryId">' + (item.categoryId || '') + '</td>' +
                    '   <td class="status">' + (item.status ? it.util.i18n("BaseInspectionManager_Normal") : it.util.i18n("BaseInspectionManager_Abnormal")) + '</td>' +
                        //'   <td class="content">' + item.content + '</td>' +
                    '   <td class="operation"></td>' +
                    '')
                if (item.propertyCount) {
                    tr.find('.operation').append('<a class="review" href="javascript:void(0)">'+it.util.i18n("BaseInspectionManager_Detail")+'</a>');
                }
                tr.attr('id', item.id);
                if (index % 2 == 1) {
                    tr.css('background-color', '#fbfbfb')
                } else {
                    //tr.css('background-color', '#fcfcfc')
                }
            })
        })
    },
    closeReportDataDialog: function () {
        layer.close(this.showReportDialogDataIndex);
        this.reportDataDialog && this.reportDataDialog.remove();
        delete this.reportDataDialog;
    },

    /**
     * 显示巡检指标列表
     * @param inspectionDataId
     */
    showReportPropertyDialog: function (inspectionDataId) {

        var self = this;
        var dialog = this.reportPropertyDialog = $('<div class="report-property-dialog"></div>').appendTo($('body'));
        var contentBox = $('<div class="contentBox"></div>').appendTo(dialog);
        var titleBox = $('<div></div>').appendTo(contentBox);
        titleBox.append('<label class="label">'+it.util.i18n("BaseInspectionManager_Inspection_location")+': ' + self.inspectionArea + '</label>')
        titleBox.append('<label class="label">'+it.util.i18n("BaseInspectionManager_Inspection_time")+': ' + self.inspectionDate + '</label>')
        var table = $('' +
            '<table>' +
            '   <thead>' +
            '       <tr>' +
            '           <td class="name">'+it.util.i18n("BaseInspectionManager_Inspection_name")+'</td>' +
            '           <td class="value">'+it.util.i18n("BaseInspectionManager_Inspection_value")+'</td>' +
            '           <td class="threshold">'+it.util.i18n("BaseInspectionManager_Inspection_threshold")+'</td>' +
            '       </tr>' +
            '   </thead>' +
            '</table>').appendTo(contentBox);
        var tbody = $('<tbody></tbody>').appendTo(table);

        this.showReportDialogPropertyIndex = layer.open({
            type: 1,
            title: it.util.i18n("BaseInspectionManager_Inspection_content")+':' + inspectionDataId,
            skin: 'layui-layer-rim', //加上边框
            area: ['532px', '400px'],
            shadeClose: true,
            content: dialog,
            btn: [it.util.i18n("BaseInspectionManager_Close")],
            end: function () {
                self.closeReportPropertyDialog();
            }
        });

        it.util.search('inspection_property', {
            where: {inspectionDataId: inspectionDataId},
            order: [['date_time', 'asc']]
        }, function (result) {
            result.forEach(function (item, index) {
                var tr = $('' +
                    '       <tr>' +
                    '           <td class="name">' + item.name + '</td>' +
                    '           <td class="value">' + item.value + '</td>' +
                    '           <td class="threshold">' + item.threshold + '</td>' +
                    '       </tr>' +
                    '').appendTo(tbody);
                if (!item.status) {
                    tr.find('.value').css('color', 'red');
                }
                if (index % 2 == 1) {
                    tr.css('background-color', '#fbfbfb')
                } else {
                    //tr.css('background-color', '#fcfcfc')
                }
            })
        })
    },
    closeReportPropertyDialog: function () {
        layer.close(this.showReportDialogPropertyIndex);
        this.reportPropertyDialog && this.reportPropertyDialog.remove();
        delete this.reportPropertyDialog;
    },
});
