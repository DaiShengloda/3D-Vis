if (!it.viewTemplate) {
    it.viewTemplate = {};
}
var ViewAllDataTemplate = function (categoryId, ids) {
    this.categoryId = categoryId;
    this.ids = ids;
    this.init(categoryId);
    this._pageSize = 10;
}

mono.extend(ViewAllDataTemplate, Object, {
    init: function (categoryId) {
        this._realtimeDialog = $('<div class="realtimeDialog"></div>');
        this._columns = [];
        this._rows = [];
        this._totalRows = 0;
        this._number = 1;

        this._realtimeDialog.appendTo(document.body);
        var w = document.body.clientWidth,
            nw, nh;
        if (w < 1440) {
            nw = w * 0.6;
            nh = 610;
        } else if (w >= 1440 && w < 1920) {
            nw = w * 0.6;
            nh = 610;
        } else if (w >= 1920) {
            nw = w * 0.5;
            nh = 620;
        }
        this._realtimeDialog.dialog({
            blackStyle: true,
            width: nw,
            height: nh,
            title: it.util.i18n("ViewALLTemplate_View_Data"),
            autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
            show: '', //显示弹窗出现的效果，slide为滑动效果
            hide: '', //显示窗口消失的效果，explode为爆炸效果
            resizable: false, //设置是否可拉动弹窗的大小，默认为true
            // minimizable: true,
            // resizable: true,
            // position: [30, 70],
            modal: true, //是否有遮罩模型
            close: function (event, ui) {
                self._realtimeDialog.remove(); //关闭的时候将整个dialog从dom树上移除
                it.ViewTemplateManager.hideCategoryViews(categoryId); //取消订阅
                main.monitorManager.hideMonitor();
                self._tableStatus = 'close';
                layer.closeAll();
                // main.panelMgr.instanceMap.NavBarMgr.appManager.appMaps.REALTIME.clear();//关闭数据监控面板
                // main.panelMgr.instanceMap.NavBarMgr.$box.nav('clearAndIfClose', true);//关闭数据监控按钮

            }
        });
        // this._realtimeDialog.draggable();

        var self = this;
        var tableWrap = $('<div class="table-wrap"></div>');
        tableWrap.appendTo(this._realtimeDialog);
        var realTimeDataTable = $('<table id="realTimeDataTable"></table>');
        realTimeDataTable.appendTo(tableWrap);
        this.showDialog();
    },
    getView: function () {
        return this._realtimeDialog;
    },
    batchUpdate: function (id, data) {
        this.renderTable(data);
    },
    showDialog: function () {
        var self = this;
        this._realtimeDialog.dialog('open');
        this._realtimeDialog.css({
            'padding': 0
        });
        $('#realTimeDataTable').bootstrapTable({
            columns: this._columns,
            data: this._rows,
            classes: 'table-no-bordered', //不要边框
            search: true, //启动搜索框
            searchAlign: 'left', //搜索框水平左
            pagination: true,
            pageSize: this._pageSize,
            striped: true,
            uniqueId: 'assetId',
            useCurrentPage: true,
            cache: false,
            rowAttributes: function (row, index) {
                return {
                    'data-id': row.assetId
                }
            },
            rowStyle: function (row, index) {
                if (index % 2 == 0) {
                    return {
                        'css': { 'background': 'rgba(58, 58, 58, 0.5)', 'height': '40px' }
                    }
                } else if (index % 2 == 1) {
                    return {
                        'css': { 'background': 'transparent', 'height': '40px' }
                    }
                }
            },
            formatShowingRows: function (pageFrom, pageTo, totalRows) {
                self._totalRows = totalRows;
                self._totalNumber = Math.ceil(self._totalRows / self._pageSize);
                self.createPageText();
            },
            onPageChange: function (number, size) {
                self._number = number;
                self.createPageText();
            },
            formatSearch: function () {
                return it.util.i18n("ViewALLTemplate_Search")
            },
            formatNoMatches: function () {
                    return it.util.i18n("ViewALLTemplate_Search_No_Result")
                }
                // customSearch: function(text){		
                // 	this.data = this.data.filter(function(row){
                // 		return row.assetId.toString().indexOf(text)>=0 || row.assetName.toString().indexOf(text)>=0 ;
                // 	});
                // }//当注释bootstraptable.js中的点击事件时可以用该方法，如果未注释时，使用该方法会报错
        });

        //创建翻页
        this.createPagerBox();

        //详情按钮的点击事件
        this._realtimeDialog.on('click', '.detail', function (e) {
            e.stopPropagation();
            //点击详情时，取消category的数据订阅
            main.RealtimeDynamicEnviroManager.clearMonitorData(); //取消订阅
            var target = e.target;
            var id = $(target).data('id');
            self.clickDataId = id;
            lookAt(id);
            self.showSimpleTable();
        });

        //在simpletable里面点击
        var lastTarget;
        this._realtimeDialog.on('click', 'tr>td:first-child', function (e) {
            e.stopPropagation();
            $("tr[data-id='" + self.clickDataId + "']").removeClass("active");
            //虽然不用取消订阅，但是需要删除上一个的view
            if (lastTarget) {
                var lastTargetId = $(lastTarget).text();
                self.clickDataId = lastTargetId;
                $("tr[data-id='" + self.clickDataId + "']").removeClass("active");
                it.ViewTemplateManager.hideView(lastTargetId, undefined, undefined, true);
            }
            var target = e.target,
                id = $(target).text();
            lastTarget = target;
            self.clickDataId = id;
            $("tr[data-id='" + self.clickDataId + "']").addClass("active");
            lookAt(id);
        })
        var lookAt = function (id) {
            main.sceneManager.viewManager3d.getDefaultEventHandler().lookAtByData(id);
            main.sceneManager.viewManager3d.defaultEventHandler.addAfterLookFinishedAtListener(self.afterLookFinishedAtHandler, self);
        };
    },

    renderTable: function (data) {
        var self = this;
        var tableData = $('#realTimeDataTable').bootstrapTable('getData');
        // todo
        // 1、获取第一行数据，得到列，设置table的列
        // 2、合并新数据对象到老数据对象中

        if (tableData && tableData.length > 0) {
            var dataMap = {};
            $.each(tableData, function (index, item) {
                dataMap[item.assetId] = index;
            });
            $.each(data, function (id, props) {
                if (!props || !Object.keys(props).length) return;
                if (dataMap[id] >= 0) {
                    $.extend(tableData[dataMap[id]], props);
                } else {
                    tableData.push(self.getRow(id, props));
                }
            });

            $('#realTimeDataTable').bootstrapTable('load', tableData);
        } else {
            var columns = [{
                    'field': 'assetId',
                    'title': it.util.i18n("ViewALLTemplate_Asset_Id")
                },
                {
                    'field': 'assetName',
                    'title': it.util.i18n("ViewALLTemplate_Asset_Name")
                }
            ];
            // 用第一行的数据
            var firstData = data[Object.keys(data)[0]];
            delete firstData['_all'];
            for (key in firstData) {
                if(!it.util.is(firstData[key], 'Object') && !it.util.isArray(firstData[key])) {
                    var column = {
                        'field': key,
                        'title': key
                    }
                    columns.push(column);
                }
               
            }
            columns.push({
                'field': 'detail',
                'title': it.util.i18n("ViewALLTemplate_Detail")
            });
            this._columns = columns;
            var rows = [];
            $.each(data, function (id, props) {
                if (!props || !Object.keys(props).length) return;
                rows.push(self.getRow(id, props));
            });
            $('#realTimeDataTable').bootstrapTable('refreshOptions', {
                data: rows,
                columns: this._columns
            });

        }
        var w = document.body.clientWidth,
            nh;
        if (w < 1440) {
            nh = 442;
        } else if (w >= 1440 && w < 1920) {
            nh = 442;
        } else if (w >= 1920) {
            nh = 442;
        }
        $('#realTimeDataTable').parent('.fixed-table-body').addClass('bt-scroll');
        $('#realTimeDataTable').parent('.fixed-table-body').css('height', nh);
        if (self.clickDataId) {
            $("tr[data-id='" + self.clickDataId + "']").addClass("active");
        }
    },
    getRow: function (id, props) {
        var self = this;
        var d = main.sceneManager.dataManager.getDataById(id),
            name = d.getName() || d.getDescription() || '';
        props.assetId = id;
        props.assetName = name;
        props.detail = '<button class="detail btn-gray" data-id=' + id + '>' + it.util.i18n("ViewALLTemplate_Detail") + '</button>';
        delete props['_all'];
        return props;
    },
    showSimpleTable: function () {
        this._realtimeDialog.addClass('simpleTable');
        this._tableStatus = 'simple';

        var position = this._realtimeDialog.dialog("option", "position");
        var w = document.body.clientWidth,
            dnw, nw, nh;
        if (w < 1440) {
            dnw = 310;
            nw = 210;
            nh = 442;
        } else if (w >= 1440 && w < 1920) {
            dnw = 350;
            nw = 250;
            nh = 442;
        } else if (w >= 1920) {
            dnw = 350;
            nw = 320;
            nh = 442;
        }
        //设置dialog的宽度
        this._realtimeDialog.dialog({
            width: dnw,
        });
        this._realtimeDialog.dialog("option", "position", { my: "left+" + nw + " center", at: "left center", of: window });

        var columns = [{
            'field': 'assetId',
            'title': it.util.i18n("ViewALLTemplate_Asset_Id")
        }];
        $('#realTimeDataTable').bootstrapTable('refreshOptions', {
            columns: columns
        });
        $('#realTimeDataTable').parent('.fixed-table-body').addClass('bt-scroll');
        $('#realTimeDataTable').parent('.fixed-table-body').css('height', nh);

        var self = this;
        setTimeout(function () {
            $("tr[data-id='" + self.clickDataId + "']").addClass("active");
        }, 1000)

    },
    showWholeTable: function () {
        this._realtimeDialog.removeClass('simpleTable');
        if (this.clickDataId) $("tr[data-id='" + self.clickDataId + "']").removeClass("active");
        this._tableStatus = 'whole';
        var w = document.body.clientWidth,
            nw, nh;
        if (w < 1440) {
            nw = w * 0.6;
            nh = 442;
        } else if (w >= 1440 && w < 1920) {
            nw = w * 0.6;
            nh = 442;
        } else if (w >= 1920) {
            nw = w * 0.5;
            nh = 442;
        }
        this._realtimeDialog.dialog({
            width: nw,
        });
        var position = this._realtimeDialog.dialog("option", "position");
        this._realtimeDialog.dialog("option", "position", { my: "center center", at: "center center", of: window });

        $('#realTimeDataTable').bootstrapTable('refreshOptions', {
            columns: this._columns
        });
        $('#realTimeDataTable').parent('.fixed-table-body').addClass('bt-scroll');
        $('#realTimeDataTable').parent('.fixed-table-body').css('height', nh);
    },

    afterLookFinishedAtHandler: function (node) {
        var self = this;
        main.sceneManager.viewManager3d.defaultEventHandler.removeAfterLookAtFinishedListener(self.afterLookFinishedAtHandler);
        var data = main.sceneManager.getNodeData(node);
        var params = {
            isNeedShade: false,
            noSubscribe: false,
            showOneFromList: true,
            callback: function () {
                var currentFloorNode = main.sceneManager.getCurrentRootNode();
                if (currentFloorNode) {
                    var currentFloorId = currentFloorNode._clientMap.it_data_id;
                }
                main.sceneManager.viewManager3d.getDefaultEventHandler().lookAtByData(currentFloorId,function(){
                    if (self._tableStatus == 'close') return;
                    else {
                        //关闭单个设备的实时数据显示面板时，开启category的数据订阅
                        main.RealtimeDynamicEnviroManager.monitorAssetData(self.ids, self.categoryId);
                        self.showWholeTable();
                    }
                });
                
            }
        }
        main.monitorManager.showRealTimeDialog(data, params);
    },
    createPageText: function () {
        if (this.pageText) {
            this.pageText.remove();
        }
        this.pageText = $('<div class="pagerText">' + it.util.i18n("ViewALLTemplate_In_Total") +
            this._totalRows + it.util.i18n("ViewALLTemplate_Records") +
            this._number + '/' +
            this._totalNumber + it.util.i18n("ViewALLTemplate_Page") +
            '</div>');
        this.pageText.prependTo(this._realtimeDialog.find('.pagerBox'));
    },
    createPagerBox: function () {
        var self = this;
        var pagerBox = $('<div class="pagerBox"></div>');
        var pagerRight = '<div class="pagerRight">' +
            '<ul>' +
            '<li class="begin" title="' + it.util.i18n("ViewALLTemplate_First_Page") + '"><i class="icon iconfont icon-angle-left"></i></li>' +
            '<li class="pre" title="' + it.util.i18n("ViewALLTemplate_Previous_Page") + '"><i class="icon iconfont icon-angle-double-left"></i></li>' +
            '<li class="next" title="' + it.util.i18n("ViewALLTemplate_Next_Page") + '"><i class="icon iconfont icon-angle-double-right"></i></li>' +
            '<li class="end" title="' + it.util.i18n("ViewALLTemplate_Last_Page") + '"><i class="icon iconfont icon-angle-right"></i></li>' +
            '</ul></div>';
        pagerBox.appendTo(this._realtimeDialog);
        $(pagerRight).appendTo(pagerBox);

        //点击事件   首页
        this._realtimeDialog.find('.pagerRight .begin').on('click', function () {
            $('#realTimeDataTable').bootstrapTable('selectPage', 1);
        });
        //前一页
        this._realtimeDialog.find('.pagerRight .pre').on('click', function () {
            $('#realTimeDataTable').bootstrapTable('prevPage');
        });
        //后一页
        this._realtimeDialog.find('.pagerRight .next').on('click', function () {
            $('#realTimeDataTable').bootstrapTable('nextPage');
        });
        //末尾
        this._realtimeDialog.find('.pagerRight .end').on('click', function () {
            $('#realTimeDataTable').bootstrapTable('selectPage', self._totalNumber);
        });
    }
});
it.viewTemplate.ViewAllDataTemplate = ViewAllDataTemplate;