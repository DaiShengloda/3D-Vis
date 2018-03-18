/**
 * 客户端的告警管理类，注意：3D机房SDK中也有一个it.AlarmManager
 * @constructor
 */
it.AutoPackTable = function (dataBox) {
    it.AutoPackTable.superClass.constructor.call(this, dataBox);
};

twaver.Util.ext('it.AutoPackTable', twaver.controls.Table, {
    _minPackWidth: 100,
    getMinPackWidth: function () {
        return this._minPackWidth;
    },
    setMinPackWidth: function (v) {
        this._minPackWidth = v;
    },
    adjustBounds: function (rect) {
        it.AutoPackTable.superClass.adjustBounds.call(this, rect);
        this.packColumns(rect.width);
    },
    packColumns: function (width) {
        var packCoumns = new twaver.List(),
            packWidth;
        this.getColumnBox().getRoots().forEach(function (column) {
            if (column.getClient('pack')) {
                packCoumns.add(column);
            } else {
                width -= column.getWidth();
            }
        });
        if (packCoumns.size() === 0) {
            return;
        }
        packWidth = width / packCoumns.size();
        if (packWidth < this._minPackWidth) {
            packWidth = this._minPackWidth;
        }
        packCoumns.forEach(function (column) {
            column.setWidth(packWidth);
        });
    }
});

it.AlarmTable = function (alarmManager, sceneManager) {
    this.alarmManager = alarmManager;
    this.sceneManager = sceneManager;
    this.dataManager = this.sceneManager.dataManager;
    this.defaultEventHandler = this.sceneManager.viewManager3d.getDefaultEventHandler()
    this.alarmMainPane = $('<div class="alarm-main-panel it-shadow"></div>');
    this.btnclose = $('<div title="' + it.util.i18n("ClientAlarmManager_Close") + '" class="close"></div>');
    this.btnDetail = $('<a title="' + it.util.i18n("ClientAlarmManager_See_alarm_detail") + '" style="float: right;margin-right: 25px"></a>');
    this.alarmContentPane = $('<div class="alarm-content-panel"></div>'); // scroll-class table中有自带的scroll
    this.box = new twaver.ElementBox();
    this.table = new it.AutoPackTable(this.box); //new twaver.controls.Table(this.box);//将node数据关联到table
    this.tablePane = null;
    this.dataList2D = [];
    this.pageSize = 6;
    this.createTable();
    var self = this;
    if (window.dataJson && dataJson.alarmPaneDraggable) {
        this.alarmMainPane.draggable();
    }
    // this.sceneManager.addSceneChangeListener(function (eve) {
    //     self.refresh();
    // });
    this.sceneManager.cameraManager.addAfterPlayCameraListener(function (eve) {
        self.refresh();
    });
};

mono.extend(it.AlarmTable, Object, {

    createTable: function () {
        var titlePane = $('<div class="it-property-title"></div>'); // it-shadow
        var title = $('<span id = "title">' + it.util.i18n("ClientAlarmManager_Current_Alarmlist") + '</span>');
        titlePane.append(title);
        //titlePane.append(this.btnDetail);                           
        //titlePane.append(this.btnclose);
        this.alarmMainPane.append(titlePane);
        var self = this;
        this.btnclose.click(function () {

            if (main.panelMgr.instanceMap.NavBarMgr.appManager && main.panelMgr.instanceMap.NavBarMgr.appManager.appMaps) {
                var app = main.panelMgr.instanceMap.NavBarMgr.appManager.appMaps["TEMPANDHUM"];
                if (app && app.isInit) {
                    app.clear();
                    if ($('#humidity').hasClass('selected')) {
                        $('#humidity').removeClass('selected');
                    }
                }
            }

            self.alarmMainPane.hide();
            self.$filter.find('input').val(null);
        });
        this.tablePane = new twaver.controls.TablePane(this.table);
        var tableHeader = this.tablePane.getTableHeader().getView();
        tableHeader.style.backgroundColor = '#303030';
        this.tablePane.getTableHeader().setHeight(30);

        var tableDom = this.tablePane.getView();
        tableDom.style.position = 'relative';
        //tableDom.style.top = '30px';
        tableDom.style.marginTop = '10px';
        tableDom.style.width = "100%"; //450
        tableDom.style.height = '210px';
        tableDom.style.background = 'rgb(48, 48, 48)';
        tableDom.style.border = '2px solid #2d2d2d';

        var tableBody = this.tablePane.getTable().getView();
        this.tableDom = tableDom;
        var text = '<div class="input-group">' +
            '<span class="input-group-addon"></span>' +
            '<input type="text" class="form-control" placeholder="' + it.util.i18n("ClientAlarmManager_Input_filter") + '">' +
            '</div>';

        this.$filter = $(text).appendTo(this.alarmContentPane);

        this.$filter.find('input').bind('input propertychange', function () {
            self.queryCurrentAlarmList(1);
            self.table.invalidateModel();
            self.table.invalidateDisplay();
        });
        //this.$filter.css("marginTop", '-10px');
        this.alarmContentPane.append(this.tableDom);
        this.alarmMainPane.append(this.alarmContentPane);
        document.body.appendChild(this.alarmContentPane[0]);
        //document.body.appendChild(this.alarmMainPane[0]); // 得把它加上，加上后才能获取到它的height
        //        this.alarmMainPane[0].style.visibility = "hidden";
        //        document.body.appendChild(tableDom);
        this.createColumns(this.table);
        this.initCellRendered();
        //        this.addDatas();
        this.createStatChartPane();

        this.showLeftArrow = function () {
            // title.addClass('arrow_left');
            // title.removeClass('arrow_right');
            title.addClass('arrowLeft');
            title.removeClass('arrowRight');
        };
        this.hideLeftArrow = function () {
            // title.removeClass('arrow_left');
            // title.addClass('arrow_right');
            title.removeClass('arrowLeft');
            title.addClass('arrowRight');
        };

        //this.showChartPane();
        this.showTablePane();

        titlePane.delegate('.arrowLeft', 'click', function () {
            // self.setVisibleCategory('');
            // self.showChartPane();
        });

        titlePane.delegate('.arrowRight', 'click', function () {
            // tableDom.style.height = '150px';
            // self.setVisibleCategory('');
            // title.html('当前告警列表');
            // self.showTablePane();
        });

        this.table.getDataBox().getSelectionModel().isSelectable = function (data) {
            return false;
        }

        // this._visibleFunction = function (data) {

        //     if (main.isAlarmHideInTable && main.isAlarmHideInTable(data)) {
        //         return false;
        //     }

        //     var alarmType = data.getClient('alarmType');
        //     var show = true;
        //     if (self.category) {
        //         if (alarmType != self.category) {
        //             show = false;
        //         }
        //     }
        //     var filter = self.$filter.find('input').val();

        //     if (filter && filter.trim() != '') {
        //         filter = filter.toLowerCase().trim();
        //         var text = '';
        //         if (dataJson && dataJson.alarmTableColumns && dataJson.alarmTableColumns instanceof Array) {
        //             var columns = dataJson.alarmTableColumns;
        //             for (var i = 0; i < columns.length; i++) {
        //                 var colObj = columns[i];
        //                 var property = colObj.property;
        //                 text += data.getClient(property) + " ";
        //             }
        //         } else {
        //             text += data.getClient('dataId') + " ";
        //             text += data.getClient('alarmType') + " ";
        //             text += data.getClient('alarmTime') + " ";
        //             text += data.getClient('dev_ip') + " ";
        //             text += data.getClient('description') + " ";                    
        //             text += data.getClient('data_type') + " ";
        //             text += data.getClient('data_name') + " ";
        //         };    
        //         text += data.getClient('level') + " ";          
        //         text = text.toLowerCase();
        //         filter = filter.replace(/\s+/g, '.*');
        //         var reg = new RegExp(filter);
        //         if (!text.match(reg)) {
        //             show = false;
        //         }
        //     }
        //     return show;
        // };
        // this.table.setVisibleFunction(this._visibleFunction);

        //当前告警
        var w = document.body.clientWidth,
            nw;
        if (w < 1440) {
            nw = 960;
        } else if (w >= 1440 && w < 1920) {
            nw = 960;
        } else if (w >= 1920) {
            nw = 1110;
        }
        this.alarmContentPane.dialog({
            blackStyle: true,
            width: nw,
            height: 'auto',
            title: it.util.i18n("ClientAlarmManager_Current_Alarmlist"),
            autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
            show: '', //显示弹窗出现的效果，slide为滑动效果
            hide: '', //显示窗口消失的效果，explode为爆炸效果
            resizable: false, //设置是否可拉动弹窗的大小，默认为true
            //position: 'center',
            modal: true, //是否有遮罩模型
        });

        // var dialogTitle = this.alarmContentPane.prev().find('.ui-dialog-title');
        // dialogTitle.html('');
        // dialogTitle.prepend(titlePane);
        this.$pageBox = $('<div class="pagerBox"></div>').appendTo(this.alarmContentPane);
        this.$pageBox.pager(function (pageIndex) {
            self.queryCurrentAlarmList(pageIndex);
        });
    },

    filterData: function (dataList) {
        if ($.isArray(dataList) && dataList.length > 0) {
            var filterList = [];
            dataList.forEach(function (data) {
                if (main.isAlarmHideInTable && main.isAlarmHideInTable(data)) {
                    return false;
                }

                var filter = this.$filter.find('input').val();

                if (filter && filter.trim() != '') {
                    filter = filter.toLowerCase().trim();
                    var text = '';
                    if (dataJson && dataJson.alarmTableColumns && dataJson.alarmTableColumns instanceof Array) {
                        var columns = dataJson.alarmTableColumns;
                        for (var i = 0; i < columns.length; i++) {
                            var colObj = columns[i];
                            var property = colObj.property;
                            text += data.getClient(property) + " ";
                        }
                        text += data.getClient('dataId') + " ";
                    } else {
                        text += data.getClient('dataId') + " ";
                        text += data.getClient('alarmType') + " ";
                        text += data.getClient('alarmTime') + " ";
                        text += data.getClient('dev_ip') + " ";
                        text += data.getClient('description') + " ";
                        text += data.getClient('data_type') + " ";
                        text += data.getClient('data_name') + " ";
                    };
                    text += data.getClient('level') + " ";
                    text = text.toLowerCase();
                    filter = filter.replace(/\s+/g, '.*');
                    var reg = new RegExp(filter);
                    if (reg.test(text)) {
                        filterList.push(data);
                    }
                } else {
                    filterList.push(data);
                }
            }, this);
            return filterList;
        }
    },

    setTitle: function (title) {
        $('span#title').html(title);
    },

    showChartPane: function (animate) {
        var self = this;
        if (animate === undefined) {
            animate = true;
        }
        $('#title').html(it.util.i18n("ClientAlarmManager_Alarm_info_statisics"));
        //this.tableDom.style.visibility = 'hidden';
        this.$filter.css('display', 'none');
        if (animate) {
            $('#alarm_chart_pane').css("width", '0').css('display', '').css('background-color', 'rgb(48, 48, 48)');
            $('#alarm_chart_pane').animate({ width: '100%' }, 'slow', function () {
                // self.tableDom.style.width = '0px';
                // self.tableDom.style.height = '0px';
                self.tableDom.style.display = 'none';
            });
        } else {
            $('#alarm_chart_pane').css("width", '100%').css('display', '');
        }
        this.hideLeftArrow();
    },

    showTablePane: function () {
        //this.tableDom.style.visibility = 'visible';
        // this.tableDom.style.width = '100%';
        // this.tableDom.style.height = '150px';
        this.tableDom.style.display = '';
        this.showLeftArrow();
        this.$filter.css('display', '');
        var dom = $(this.tableDom);
        dom.css('marginLeft', '100%').css('width', 0);
        dom.animate({ marginLeft: 0, width: "100%" }, 'slow', function () {
            $('#alarm_chart_pane').css('display', 'none');
        });
        $('#alarm_chart_pane').animate({ marginRight: "100%", width: 0 }, 'slow');
    },

    initCellRendered: function () {
        var self = this;
        this.table.setRowHeight(30);
        var w = document.body.clientWidth,
            fSize;
        if (w < 1440) {
            fSize = '12px';
        } else if (w >= 1440 && w < 1920) {
            fSize = '12px';
        } else if (w >= 1920) {
            fSize = '14px';
        }
        this.table.onCellRendered = function (params) {
            var div = params.div;
            var scrollDiv = div.parentNode.parentNode.parentNode.parentNode;
            var scrollParentDiv = div.parentNode.parentNode.parentNode.parentNode.parentNode;
            scrollDiv.style.overflowX = 'hidden';
            scrollDiv.style.width = '1100px';
            scrollParentDiv.style.overflow = 'hidden';
            var alarm = params.data;

            var data = null;
            if (alarm.getClient('dataId')) {
                data = self.dataManager.getDataById(alarm.getClient('dataId'));
            }

            var level = alarm.getClient('level');
            var alarmSeverity = it.AlarmSeverity.getByName(level);
            var bgColor = '#FF0000'
            if (alarmSeverity) {
                alarm.setClient('levelName', alarmSeverity.displayName);
                bgColor = alarmSeverity.color
            }

            //div.style.backgroundColor = bgColor;
            div.style.textAlign = 'center';
            div.style.fontFamily = "Tahoma,Helvetica,Arial,\5b8b\4f53,sans-serif";
            div.style.border = 'none';
            params.div.parentNode.style.border = 'none';
            params.div.parentNode.style.width = '99.9999%';
            if (params.rowIndex % 2 == 0) {
                params.div.parentNode.style.backgroundImage = '-webkit-linear-gradient(top, rgba(58, 58, 58, 0.5), rgba(58, 58, 58, 0.5))';
            } else {
                params.div.parentNode.style.backgroundImage = '-webkit-linear-gradient(top, rgba(48, 48, 48, 0.5), rgba(48, 48, 48, 0.5))';
            }

            if (params.column._propertyName === "levelName") {
                var clientMap = params.data.getClientMap();
                var paraData = clientMap.level;
                var arr = paraData.split('...');
                params.div.innerHTML = arr[1];
                var span = document.createElement('span');
                span.style.display = 'inline-block';
                span.style.width = '6px';
                span.style.height = '14px';
                span.style.margin = '0px 5px 0px 0px';
                span.style.verticalAlign = 'middle';
                span.style.background = arr[0];
                params.div.style.textAlign = 'left';
                params.div.style.paddingLeft = '20px';
                params.div.prepend(span);
            } else if (params.column._propertyName === "data_type") {
                params.div.style.textAlign = 'left';
                params.div.style.paddingLeft = '20px';
            }
        };
        //当前
        this.table.renderData = function (div, data, row, selected) {
            var columns = this._columnBox.getRoots();
            var count = columns.size();
            var sumWidth = 0;
            var hpx = this._rowHeight - this._rowLineWidth + 'px';

            var style;
            for (var i = 0; i < count; i++) {
                var column = columns.get(i);
                var width = column.getWidth();
                if (width < 0) width = 0;
                var columnLineWidth = Math.min(this._columnLineWidth, width);

                if (column.isVisible()) {
                    var cell = this._cellPool.get();
                    style = cell.style;
                    style.position = 'absolute';
                    style.whiteSpace = 'nowrap';
                    style.verticalAlign = 'middle';
                    style.textAlign = column.getHorizontalAlign();
                    style.overflow = 'hidden';
                    style.textOverflow = 'ellipsis';
                    style.left = sumWidth + 'px';
                    style.width = width - columnLineWidth + 'px';
                    style.height = hpx;

                    div.appendChild(cell);
                    var params = {
                        data: data,
                        value: this.getValue(data, column),
                        div: cell,
                        view: this,
                        column: column,
                        rowIndex: row,
                        selected: selected,
                    }
                    this.renderCell(params);
                    this.onCellRendered(params);
                    sumWidth += width;
                }
            }

            style = div.style;
            style.width = sumWidth + 'px';
            style.height = hpx;
            style.border = 'none';

            //backgroundColor = (row%2 == 0) ? 'rgba(84, 138, 160, 1.0)' : 'rgba(94, 148, 170, 1.0)'
            //style.backgroundColor = ((this.isCheckMode() && this._focusedRow === row) || (!this.isCheckMode() && selected)) ? backgroundColor : '';
            //style.border = ((this.isCheckMode() && this._focusedRow === row) || (!this.isCheckMode() && selected)) ? '1px solid #00f6ff' : '';
            //style.color = ((this.isCheckMode() && this._focusedRow === row) || (!this.isCheckMode() && selected)) ? '#ffffff' : '';
        }
    },

    clearAllChildren: function (div) {
        if (!div) {
            return;
        }
        var children = div.childNodes;
        if (children && children.length > 0) {
            for (var i = 0; i < children.length; i++) {
                var child = div.childNodes[i];
                div.removeChild(child);
            }
        }
    },

    createColumns: function (table) {
        //        this.createColumn(table, '图例', 'level', 'client', 'color',25);
        // this.createColumn(table, '告警源', 'dataId', 'client', 'string', 100);
        var w = document.body.clientWidth,
            nw, cw = 0,
            cn;
        if (w < 1440) {
            nw = 926 / 1076;
        } else if (w >= 1440 && w < 1920) {
            nw = 926 / 1076;
        } else if (w >= 1920) {
            nw = 1;
        }
        if (dataJson && dataJson.alarmTableColumns && dataJson.alarmTableColumns instanceof Array) {
            var columns = dataJson.alarmTableColumns;
            for (var i = 0; i < columns.length; i++) {
                var colObj = columns[i];
                var width = colObj.width || 75;
                cw += width;
            }
            cn = 895 / cw; //自定义告警面板中列表的表头宽度适应dialog
            for (var i = 0; i < columns.length; i++) {
                var colObj = columns[i];
                // var label = colObj.label;
                var label = it.util.i18n("ClientAlarmManager_"+colObj.property);
                var property = colObj.property;
                var source = colObj.source || 'client';
                var type = colObj.type || "string";
                var width = colObj.width || 75;
                if (label && property) {
                    this.createColumn(table, label, property, source, type, width * cn * nw);
                }
            }
        } else {
            this.createColumn(table, it.util.i18n("ClientAlarmManager_Alarm_IP"), 'dev_ip', 'client', 'string', 95 * nw);
            this.createColumn(table, it.util.i18n("ClientAlarmManager_Alarm_device_alias"), 'data_name', 'client', 'string', 100 * nw);
            this.createColumn(table, it.util.i18n("ClientAlarmManager_Asset_type"), 'data_type', 'client', 'string', 160 * nw);
            this.createColumn(table, it.util.i18n("ClientAlarmManager_Alarm_type"), 'alarmType', 'client', 'string', 80 * nw);
            this.createColumn(table, it.util.i18n("ClientAlarmManager_Alarm_level"), 'levelName', 'client', 'string', 110 * nw);
            this.createColumn(table, it.util.i18n("ClientAlarmManager_Alarm_time"), 'alarmTime', 'client', 'string', 150 * nw);
            this.createColumn(table, it.util.i18n("ClientAlarmManager_Alarm_description"), 'description', 'client', 'string', 200 * nw);
        }
        this.createColumn(table, it.util.i18n("ClientAlarmManager_Alarm_operation"), 'id', 'client', 'string', 180 * nw, renderButtonCell);

        var self = this;

        function renderButtonCell(params) {
            var div = params.div;
            var alarm = params.data;
            var data = null;
            self.clearAllChildren(div);
            renderDetailCell(alarm, data, div);
            renderFindCell(alarm, data, div);
            renderConfirmCell(params, div);
        };

        function renderConfirmCell(params, div) {
            var button = $('<button type="button" class="btn btn-default btn-sm fs10 bt-btn-second"  style="margin-right: 8px">' + it.util.i18n("ClientAlarmManager_Confirm") + '</button>');
            button.appendTo($(div));
            button.mouseup(function () {
                self.createForm(params);
            });
        };

        function renderDetailCell(alarm, data, div) {
            // setTimeout(function(){
            // var div = params.div;
            // var alarm = params.data;
            // var data = null;
            if (alarm.getClient('dataId')) {
                data = self.dataManager.getDataById(alarm.getClient('dataId'));
                if (!data) {
                    data = self.dataManager.getCollectorById(alarm.getClient('dataId'));
                }
            }
            //self.clearAllChildren(div);

            var button = $('<button type="button" class="btn btn-default btn-sm fs10 bt-btn-second" style="margin-right: 8px">' + it.util.i18n("ClientAlarmManager_Detail") + '</button>');
            button.appendTo($(div));
            button.mouseup(function (event) {
                self.showAlarmDetail(alarm, data);
            });
            // },100);
        }

        function renderFindCell(alarm, data, div) {

            // var div = params.div;
            // var alarm = params.data;

            //var data = null;
            if (alarm.getClient('dataId')) {
                data = self.dataManager.getDataById(alarm.getClient('dataId'));
            }
            //self.clearAllChildren(div);

            var button = $('<button type="button" class="btn btn-default btn-sm fs10 bt-btn-second" style="margin-right: 8px">' + it.util.i18n("ClientAlarmManager_Location") + '</button>');
            button.appendTo($(div));
            button.mousedown(function () {
                self.alarmContentPane.dialog('close');
                console.log(it.util.i18n("ClientAlarmManager_console_find_asset"));
                var app = main.panelMgr.instanceMap.NavBarMgr.appManager.appMaps["TEMPANDHUM"];
                if (data) {
                    if (app && app.isInit) {
                        app.clear();
                        if ($('#humidity').hasClass('selected')) {
                            $('#humidity').removeClass('selected');
                        }
                    }
                    main.virtualDeviceAlarm.dwFindCell(data);
                } else {
                    // 如果不存在资产，看是否是传感器
                    var cid = alarm.getClient('dataId');
                    var collector = self.dataManager.getCollectorById(cid);
                    if (collector) {
                        if (!app) return;
                        if (!app.isInit) {
                            app.setup();
                        }
                        app.clear();
                        var parentDataId = collector.getParentId();
                        var parentData = main.sceneManager.dataManager.getDataById(parentDataId);
                        var rootData = main.sceneManager.getSceneAndRootByData(parentData).rootData;
                        self.defaultEventHandler.lookAtByData(rootData, function () {
                            main.panelMgr.instanceMap.NavBarMgr.clickHandler(null,{id:"humidity"});
                            main.panelMgr.instanceMap.NavBarMgr.$box.nav('option', 'menuSelected', 'humidity');
                            var m = app.billboardMap;
                            self.defaultEventHandler.moveCameraForLookAtNode(app.billboardMap[cid], '', { x: 0, y: 300, z: 500 });
                            main.panelMgr.instanceMap.BreadcrumbMgr.sceneChangeHandler();//定位到某一楼后更新breadcrumb
                            main.panelMgr.instanceMap.OverviewMgr.sceneChangeHandler({ 
                                kind:'changeScene',
                                rootData:rootData,
                            });//定位到某一楼后更新楼层显示
                            // app.billboardMap[cid].setVisible(true);
                        });
                        // app.doShow();
                        // var bb = app.billboardMap[cid];
                        // self.defaultEventHandler.lookAt(app.billboardMap[cid]);
                    }
                }

                console.log(alarm);
                if (!data) {
                    return;
                }

            });
            // button.click(function(){
            //   console.log('在3D场景中查找对象，查找后镜头移过去!!!');
            //   if (!data) {
            //       return;
            //   }
            //   self.defaultEventHandler.lookAtByData(data);
            // });
        };
    },

    // 批量告警确认
    makeBatchConfirmation: function (dataId, oldAlarmId) {
        // console.log('新确认告警')
        var self = this;
        var alarmlist = this.sceneManager.getAlarmManager().getAlarmsByDataOrId(dataId)._as;
        var dialog = $('<div>').addClass('makeBatchConfirmation').appendTo($('.dialog-box'));
        var head = $('<div>').addClass('head').appendTo(dialog);
        var text = $('<span>').addClass('text').text(it.util.i18n("ClientAlarmManager_Confirm_content") + ": ").appendTo(head);
        var content = $('<textarea>').addClass('textarea').appendTo(head);
        var table = $('<table>').appendTo(dialog);
        var foot = $('<div>').addClass('foot').appendTo(dialog);
        var tips = $('<span>').addClass('tips').text(it.util.i18n("ClientAlarmManager_Batch_Tip")).appendTo(foot);
        var btn = $('<button>').addClass('save btn btn-gray').text(it.util.i18n("ClientAlarmManager_Confirm")).appendTo(foot);
        var datas = [];
        var data;
        for (var i = 0; i < alarmlist.length; i++) {
            if (alarmlist[i]._dataId == dataId) {
                data = {};
                switch (alarmlist[i].alarmTypeId) {
                    case 'temperature':
                        {
                            data.type = '温度告警'
                            break;
                        }
                    case 'humidity':
                        {
                            data.type = '湿度告警'
                            break;
                        }
                    case 'waterLeak':
                        {
                            data.type = '漏水告警'
                            break;
                        }
                }
                data.num = alarmlist[i]._id;
                if (alarmlist[i].time) {
                    data.time = alarmlist[i].time;
                } else {
                    var y, m, d, h, i, s, date, time;
                    date = alarmlist[i]._dateTime;
                    y = date.getFullYear(),
                        m = date.getMonth() >= 10 ? date.getMonth() : '0' + date.getMonth(),
                        d = date.getDate() >= 10 ? date.getDate() : '0' + date.getDate(),
                        h = date.getHours(),
                        mi = date.getMinutes() >= 10 ? date.getMinutes() : '0' + date.getMinutes(),
                        s = date.getSeconds() >= 10 ? date.getSeconds() : '0' + date.getSeconds(),
                        time = y + '-' + m + '-' + d + ' ' + h + ':' + mi + ':' + s;
                    data.time = time;
                }
                data.msg = alarmlist[i].description || alarmlist[i]._description;
                data.rank = alarmlist[i]._alarmSeverity.name;
                data.detail = '<button class="detail btn btn-gray">' + it.util.i18n("ClientAlarmManager_Detail") + '</button>';
                datas.push(data);
            }
        }
        table.bootstrapTable({
            rowAttributes: function (row, index) {
                return {
                    'dataId': dataId,
                    'alarmId': row.num,
                };
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
            classes: 'table-no-bordered',
            height: 250,
            columns: [{
                field: 'selected',
                checkbox: true,
            }, {
                field: 'type',
                title: it.util.i18n("ClientAlarmManager_Alarm_device_type"),
            }, {
                field: 'num',
                title: it.util.i18n("ClientAlarmManager_Alarm_ID"),
            }, {
                field: 'time',
                title: it.util.i18n("ClientAlarmManager_Alarm_create_time"),
            }, {
                field: 'msg',
                title: it.util.i18n("ClientAlarmManager_Alarm_info"),
            }, {
                field: 'rank',
                title: it.util.i18n("ClientAlarmManager_Level"),
            }, {
                field: 'detail',
                title: it.util.i18n("ClientAlarmManager_Detail"),
            }, ],
            data: datas,
        });
        table.bootstrapTable('checkBy', { field: "num", values: [oldAlarmId] });

        dialog.on('click', '.detail', function () {
            var dataId = $(this).parent().parent().attr('dataId');
            var alarmId = $(this).parent().parent().attr('alarmId');
            var alarm, data;
            data = self.sceneManager.dataManager.getDataById(dataId);
            for (var i = 0; i < alarmlist.length; i++) {
                if (alarmlist[i]._id == alarmId) {
                    alarm = alarmlist[i];
                    break;
                }
            }
            self.showAlarmDetail(alarm, data);
        })

        dialog.on('click', '.save', function () {
            var ackNotice = content.val();
            // console.log(ackNotice)
            if (ackNotice == '') {
                ServerUtil.msg(it.util.i18n("ClientAlarmManager_Input_confirm_content"))
                return;
            }
            var results = table.bootstrapTable('getSelections');
            if (results.length == 0) {
                ServerUtil.msg(it.util.i18n("ClientAlarmManager_Check_One"))
                return;
            }
            for (var i = 0; i < results.length; i++) {
                var data = {
                    id: results[i].num,
                    ackNotice: ackNotice,
                }
                ServerUtil.api('alarm', 'ackAndClearAlarm', data, function (result) {
                    // console.log(result)
                    //更新告警统计
                    main.assetPanelMgr.showWarningsInfo('floor');
                });
            }
            dialog.remove();
        })

        var w = document.body.clientWidth,
            dialogWidth;
        if (w < 1440) {
            dialogWidth = '600px';
        } else if (w >= 1440 && w < 1920) {
            dialogWidth = '700px';
        } else if (w >= 1920) {
            dialogWidth = '800px';
        }

        dialog.dialog({
            appendTo: ".dialog-box",
            blackStyle: true,
            width: dialogWidth,
            height: 'auto',
            title: it.util.i18n("ClientAlarmManager_Alarm_confirm"),
            autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
            show: '', //显示弹窗出现的效果，slide为滑动效果
            hide: '', //显示窗口消失的效果，explode为爆炸效果
            resizable: false, //设置是否可拉动弹窗的大小，默认为true
            //position: [30, 70],
            modal: true, //是否有遮罩模型
        });
        dialog.dialog('open');

    },

    createForm: function (params) {
        // console.log('确认告警!!!');
        var node = params.data;
        var alarmId = node.getClient('id');
        var clientMap = node._clientMap;
        var dataId;
        if (clientMap) {
            dataId = clientMap.dataId;
        }
        //根据同一个设备上是否有多个告警来决定使用哪个面板
        var isBatchConfirmation = 1;
        var num = 0;
        for (var i = 0; i < this.allAlarmList.length; i++) {
            if (this.allAlarmList[i] && this.allAlarmList[i]._dataId == dataId) {
                num++;
                if (num > 1) {
                    isBatchConfirmation = num;
                    break;
                }
            }
        }
        // console.log(isBatchConfirmation);
        if (isBatchConfirmation > 1) {
            this.makeBatchConfirmation(dataId, alarmId);
        } else if (isBatchConfirmation == 1) {
            var form = this._alarmConfimForm;
            if (!form) {
                var props = [
                    { name: "id", label: it.util.i18n("ClientAlarmManager_Alarm_ID") },
                    { name: "description", type: "textarea", label: it.util.i18n("ClientAlarmManager_Alarm_description") },
                    { name: "ackNotice", type: "textarea", label: it.util.i18n("ClientAlarmManager_Confirm_content") },
                ];
                var showSubmit = true;
                var callBack = function () {
                    function callback(result) {
                        form.dialog('close');
                    }
                    ackAndClearAlarm(callback);
                };
                var opt = {
                    buttonText: it.util.i18n("ClientAlarmManager_Confirm"),
                };
                form = util.createForm(props, showSubmit, callBack, opt);
                this._alarmConfimForm = form;
                form.css('padding', '10px');
                form.find("[name=id]").attr('disabled', 'disabled');
                form.find("[name=description]").attr('disabled', 'disabled');
                form.appendTo($(document.body));

                var info = $('<br><div class="alert alert-success" role="alert"></div>');
                var t = "<span style='font-size:18px'><B>" + it.util.i18n("ClientAlarmManager_Description") + "<B></span>:<br><span style='font-size:14px'><B>" + it.util.i18n("ClientAlarmManager_Confirm_and_clear") + "<B></span>: " + it.util.i18n("ClientAlarmManager_Confirm_alarm_and_translate") + ",";
                t += it.util.i18n("ClientAlarmManager_Already_confirm");
                t += "<br><span style='font-size:14px'><B>" + it.util.i18n("ClientAlarmManager_Confirm") + "<B></span>: " + it.util.i18n("ClientAlarmManager_Only_confirm_alarm");
                // info.html(t);
                info.css('color', '#31708f').css('background-color', '#d9edf7').css('border', '1px solid #bce8f1');
                info.css('border-radius', '5px');
                info.css('padding', '5px').css('marginRight', '-5px');
                // form.append(info);
            }
            form.find("[name=id]").val(alarmId);
            form.find("[name=description]").val(node.getClient('description'));
            form.find("[name=ackNotice]").val("");

            function validateData() {
                var ackNotice = form.find("[name=ackNotice]").val();
                if (!ackNotice) {
                    layer.msg(it.util.i18n("ClientAlarmManager_Input_confirm_content"));
                    return false;
                }
                alarmId = form.find("[name=id]").val();
                var data = {
                    id: alarmId,
                    ackNotice: ackNotice,
                }
                return data;
            }

            function ackAlarm(callback) {

            }

            function ackAndClearAlarm(callback) {
                var data = validateData();
                if (!data) {
                    return;
                }

                ServerUtil.api('alarm', 'ackAndClearAlarm', data, function (result) {
                    // var url = ServerUtil.monitorUrl("alarms",data.id);
                    // // 推送消息
                    // $.ajax({
                    //    url: url,
                    //    type: 'DELETE',
                    //    success: function(res) {

                    //    }
                    callback && callback(result)
                        // });                        

                });
            }

            // layer.open({
            //     shade: 0,
            //     type: 1,
            //     title: it.util.i18n("ClientAlarmManager_Alarm_confirm"),
            //     skin: 'layui-layer-rim', //加上边框
            //     area: ['600px', '360px'], //宽高
            //     content: form,
            //     btn: [it.util.i18n("ClientAlarmManager_Confirm")],
            //     yes: function (index, layero) {
            //         function callback(result) {
            //             layer.close(index);
            //         }

            //         ackAndClearAlarm(callback);

            //     },
            //     // btn2:function(index,layero){

            //     // },
            // });

            //告警确认
            var w = document.body.clientWidth,
            nw;
            if (w < 1440) {
                nw = '340px';
            } else {
                nw = '400px';
            }
            form.dialog({
                blackStyle: true,
                width: nw,
                height: 'auto',
                title: it.util.i18n("ClientAlarmManager_Alarm_confirm"),
                autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
                show: '', //显示弹窗出现的效果，slide为滑动效果
                hide: '', //显示窗口消失的效果，explode为爆炸效果
                resizable: false, //设置是否可拉动弹窗的大小，默认为true
                //position: [30, 70],
                modal: true, //是否有遮罩模型
            });
            form.parent().children('.ui-dialog-buttonpane').css('margin', 0);
            form.dialog('open');
        }
    },

    // showAlarmDetail: function (alarm, data) {
    //     var panel = $PropertyPane.getInstance();
    //     var detailData = {};
    //     if (!data) {
    //         detailData[it.util.i18n("ClientAlarmManager_Tip") + ":"] = it.util.i18n("ClientAlarmManager_Asset") + '"' + alarm.getClient('dataId') + '"' + it.util.i18n("ClientAlarmManager_Not_exist");
    //         panel.setData(detailData);
    //         layer.open({
    //             shade: 0,
    //             type: 1,
    //             title: it.util.i18n("ClientAlarmManager_Tip"),
    //             skin: 'layui-layer-rim', //加上边框
    //             area: ['500px', '300px'], //宽高
    //             content: panel.getRootConent(),
    //         });
    //         return;
    //     }
    //     // alarm是twaver的Element,让它兼容一下itv中的Alarm
    //     var id, level, description, alarmTime, alarmTypeName, dataId, devIp;
    //     if (alarm instanceof Alarm) {
    //         // var alarmType = alarm.alarmType || {}; 
    //         var alarmType = main.sceneManager._alarmManager.getAlarmTypeByAlarm(alarm);
    //         id = alarm.getId();
    //         level = alarm.getLevel() || alarmType._level;
    //         description = alarm.getDescription();
    //         alarmTime = alarm.getDateTime();
    //         alarmTypeName = alarmType.getName();
    //         dataId = alarm.getDataId();
    //         devIp = alarm.devIp;
    //         dataType = data._dataTypeId;
    //     } else {
    //         id = alarm.getClient('id');
    //         // level = alarm.getClient('level');
    //         level = alarm.getClient('levelName');
    //         description = alarm.getClient("description");
    //         alarmTypeName = alarm.getClient('alarmType');
    //         alarmTime = alarm.getClient("alarmTime");
    //         // alarmType = alarm.getClient("alarmType");
    //         dataId = alarm.getClient("dataId");
    //         devIp = alarm.getClient("dev_ip");
    //         dataType = alarm.getClient("data_type");
    //     }
    //     detailData[it.util.i18n("ClientAlarmManager_Alarm_ID")] = id;        
    //     detailData[it.util.i18n("ClientAlarmManager_Alarm_IP")] = devIp || '';
    //     detailData[it.util.i18n("ClientAlarmManager_Alarm_device_alias")] = data._description || data._name || ''; //设备描述
    //     detailData[it.util.i18n("ClientAlarmManager_Alarm_device_ID")] = dataId;
    //     detailData[it.util.i18n("ClientAlarmManager_Asset_type")] = dataType
    //     detailData[it.util.i18n("ClientAlarmManager_Alarm_category")] = alarmTypeName;
    //     detailData[it.util.i18n("ClientAlarmManager_Alarm_level")] = this.translateLevel(level);
    //     var extend = alarm.client;
    //     if (extend) {
    //         // detailData[" "]= "---------------扩展字段---------------";
    //         if (typeof (extend) === 'string') {
    //             var key = it.util.i18n("ClientAlarmManager_Extend");
    //             $.extend(detailData, { key: extend });
    //         } else {
    //             $.extend(detailData, extend);
    //         }
    //     }
    //     detailData[it.util.i18n("ClientAlarmManager_Alarm_time")] = alarmTime;
    //     detailData[it.util.i18n("ClientAlarmManager_Alarm_description")] = description;

    //     // if (data.getBusinessTypeId) {
    //     //     var businessType = main.sceneManager.dataManager.getBusinessTypeForData(data);
    //     //     if (businessType) {
    //     //         detailData[it.util.i18n("ClientAlarmManager_Alarm_device_type")] = businessType.getName() || businessType.getDescription();
    //     //     };
    //     // }

    //     panel.setData(detailData);
    //     // layer.open({
    //     //     shade: 0,
    //     //     type: 1,
    //     //     title: it.util.i18n("ClientAlarmManager_Alarm_detail"),
    //     //     skin: 'layui-layer-rim', //加上边框
    //     //     area: ['500px', '300px'], //宽高
    //     //     content: panel.getRootConent(),
    //     // });

    //     //告警详情
    //     panel.getRootConent().dialog({ //创建dialog弹窗
    //         blackStyle: true,
    //         width: '306px',
    //         height: 'auto',
    //         title: it.util.i18n("ClientAlarmManager_Alarm_detail"),
    //         autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
    //         show: '', //显示弹窗出现的效果，slide为滑动效果
    //         hide: '', //显示窗口消失的效果，explode为爆炸效果
    //         resizable: false, //设置是否可拉动弹窗的大小，默认为true
    //         //position: [30, 70],
    //         modal: true, //是否有遮罩模型
    //     });
    //     panel.getRootConent().dialog('open');
    // },
    showAlarmDetail: function (alarm, data) {
        //整理数据
        var detailData = {};
        var id, level, description, alarmTime, alarmTypeName, dataId, devIp;
        if (alarm instanceof Alarm) {
            var alarmType = main.sceneManager._alarmManager.getAlarmTypeByAlarm(alarm);
            id = alarm.getClient('real_id') || alarm.getId();
            level = alarm.getLevel() || alarmType._level;
            description = alarm.getDescription();
            alarmTime = alarm.getDateTime();
            alarmTypeName = alarmType.getName();
            dataId = alarm.getDataId();
            devIp = alarm.devIp;
            dataType = data._dataTypeId;
        } else {
            id = alarm.getClient('real_id') || alarm.getClient('id');
            // level = alarm.getClient('level');
            level = alarm.getClient('levelName');
            description = alarm.getClient("description");
            alarmTypeName = alarm.getClient('alarmType');
            alarmTime = alarm.getClient("alarmTime");
            dataId = alarm.getClient("dataId");
            devIp = alarm.getClient("dev_ip");
            dataType = alarm.getClient("data_type");
        }
        detailData[it.util.i18n("ClientAlarmManager_Alarm_ID")] = id;
        detailData[it.util.i18n("ClientAlarmManager_Alarm_IP")] = devIp || '';
        detailData[it.util.i18n("ClientAlarmManager_Alarm_device_alias")] = data._description || data._name || ''; //设备描述
        detailData[it.util.i18n("ClientAlarmManager_Alarm_device_ID")] = dataId;
        detailData[it.util.i18n("ClientAlarmManager_Asset_type")] = dataType
        detailData[it.util.i18n("ClientAlarmManager_Alarm_category")] = alarmTypeName;
        detailData[it.util.i18n("ClientAlarmManager_Alarm_level")] = this.translateLevel(level);
        var extend = alarm.client;
        if (extend) {
            // detailData[" "]= "---------------扩展字段---------------";
            if (typeof (extend) === 'string') {
                var key = it.util.i18n("ClientAlarmManager_Extend");
                $.extend(detailData, { key: extend });
            } else {
                $.extend(detailData, extend);
            }
        }
        detailData[it.util.i18n("ClientAlarmManager_Alarm_time")] = alarmTime;
        detailData[it.util.i18n("ClientAlarmManager_Alarm_description")] = description;

        //创建表格
        var $alarmDetailDialog = $('.alarmDetailDialog');
        if (!$alarmDetailDialog.length) {
            $alarmDetailDialog = $('<div class="alarmDetailDialog"></div>').appendTo($('.dialog-box'));
        }
        $alarmDetailDialog.empty();
        var $alarmDetailTable = $('<table>').appendTo($alarmDetailDialog);

        $alarmDetailTable.bootstrapTable({
            columns: [],
            data: [],
            classes: 'table-no-bordered', //不要边框
            cache: false,
        });

        var rows = [];
        var columns = [{
                'field': 'alarmKey',
                'title': 'alarmKey'
            },
            {
                'field': 'alarmValue',
                'title': 'alarmValue'
            }
        ];
        for (key in detailData) {
            if (!detailData || !Object.keys(detailData).length) return;
            var row = {};
            row.alarmKey = key + ":";
            row.alarmValue = detailData[key];
            rows.push(row);
        }
        $alarmDetailTable.bootstrapTable('refreshOptions', {
            data: rows,
            columns: columns
        });
        $alarmDetailDialog.dialog({
            appendTo: ".dialog-box",
            blackStyle: true,
            width: '350px',
            height: 'auto',
            title: it.util.i18n("ClientAlarmManager_Alarm_detail"),
            autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
            show: '', //显示弹窗出现的效果，slide为滑动效果
            hide: '', //显示窗口消失的效果，explode为爆炸效果
            resizable: false, //设置是否可拉动弹窗的大小，默认为true
            modal: true, //是否有遮罩模型
            close: function () {
                $('.alarmDetailDialog').remove();
            }
        });
        $alarmDetailDialog.dialog('open');
        $alarmDetailTable.find('thead').css("display", "none");
        $alarmDetailTable.find('tbody td').css({
            "border": "none",
            "padding": "1px 1px",
            "font-size": "13px",
            "font-weight": "700",
            "padding-left": "10px"
        });

    },

    levelNumber: [0, 100, 200, 300, 400, 500],
    levelString: ['cleared', 'indeterminate', 'warning', 'minor', 'major', 'critical'],
    levelCN: [it.util.i18n("ClientAlarmManager_Alarm_clear"), it.util.i18n("ClientAlarmManager_Alarm_indeterminate"), it.util.i18n("ClientAlarmManager_Alarm_warning"), it.util.i18n("ClientAlarmManager_Alarm_minor"), it.util.i18n("ClientAlarmManager_Alarm_major"), it.util.i18n("ClientAlarmManager_Alarm_critical")],
    translateLevel: function (level) {
        if (level === undefined || level === null) return;
        var severity = it.AlarmSeverity.getByName(level);
        if (!severity) {
            return "";
        }
        return severity.displayName;
    },

    createColumn: function (table, name, propetyName, propertyType, valueType, width, renderCell) {
        var column = new twaver.Column(name);
        column.setName(name);
        column.setPropertyName(propetyName);
        column.setPropertyType(propertyType); //accessor,client,Styles
        if (valueType) {
            column.setValueType(valueType);
        }
        if (width) {
            column.setWidth(width);
        } else {
            column.setClient('pack', true);
        }
        var w = document.body.clientWidth,
            fSize;
        if (w < 1440) {
            fSize = '12px';
        } else if (w >= 1440 && w < 1920) {
            fSize = '12px';
        } else if (w >= 1920) {
            fSize = '14px';
        }
        // column.setFontColor(randomColor());
        column.renderHeader = function (div, cloumn) {
            var span = document.createElement('span');
            span.style.whiteSpace = 'nowrap';
            span.style.verticalAlign = 'middle';
            span.style.padding = '1px 2px 1px 2px';
            span.innerHTML = column.getName() ? column.getName() : column.getPropertyName();
            if (span.innerHTML == it.util.i18n("ClientAlarmManager_Legend")) {
                span.innerHTML = '';
            }
            span.setAttribute('title', span.innerHTML);
            //            console.log(span.innerHTML);
            span.style.backgroundColor = 'rgba(0,0,0,0)';
            span.style.font = 'normal 14px Helvetica';
            span.style.fontSize = fSize;
            div.style.textAlign = 'center';
            div.style.border = 'none';
            div.style.color = '#bcbcbc';

            // div.style.backgroundColor = '#f27418'; // 'rgba(255,0,0,1)';
            div.appendChild(span);
        };
        if (renderCell) {
            column.renderCell = renderCell;
        }
        table.getColumnBox().add(column);
        return column;
    },

    setVisibleCategory: function (category) {
        this.category = category;
        var scope = this;
        this.refresh();
    },

    setData: function (datas) {
        if (!datas || datas.length < 1) {
            return;
        }
        if (datas instanceof Array) {
            for (var i = 0; i < datas.length; i++) {
                var alarm = datas[i];
                if (alarm && alarm instanceof it.Alarm) {
                    var node = this.setData2D(alarm);
                    if (node) {
                        this.addData(node);
                    }
                }
            }
        }
    },

    queryCurrentAlarmList: function (pageIndex) {
        this.clearData();
        var self = this;
        if (!pageIndex) {
            pageIndex = this.$pageBox.pager('currPage');
        }
        var pageSize = this.pageSize;
        this.allAlarmList = this.sceneManager.getAlarmManager().getAlarms()._as;
        this.dataList2D = [];
        this.allAlarmList.forEach(function (data) {
            var node = this.setData2D(data);
            if (node) {
                this.dataList2D.push(node);
            }
        }, this);
        var list = this.filterData(this.dataList2D);
        if (!list) return;
        this.$pageBox.pager('options', {
            totalCount: list.length,
            currPage: pageIndex,
            pageSize: pageSize
        });
        alarmlist = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
        alarmlist.forEach(function (alarm) {
            self.addData(alarm);
        })
    },

    setData2D: function (alarm) {
        var self = this;
        if (alarm instanceof it.Alarm) {
            var alarmType = this.alarmManager.getAlarmTypeByAlarm(alarm);
            var alarmStatus = this.alarmManager.getAlarmStatusByAlarm(alarm);
            var alarmStatusName = alarmStatus ? alarmStatus.getStatusName() : '';
            var typeDesc = '';
            if (alarmType) {
                typeDesc = alarmType.getDescription();
            } else {
                typeDesc = alarm.alarmTypeId;
            }
            var alarmTypeName = alarmType ? alarmType.getName() : alarm.alarmTypeId;
            if (!alarmType) {
                // console.log("alarm type " + alarm.alarmTypeId+" does not exitst");
                // return;
            }
            //温湿度采集器没有模型，data表被没有相应数据，这里要考虑到温湿度采集器
            var data = main.sceneManager.dataManager.getDataById(alarm.getDataId());
            var isCollector = main.sceneManager.dataManager.getCollectorById(alarm.getDataId());
            if (!data && !isCollector) {
                return;
            }
            var alarmSeverity = alarm.getAlarmSeverity() || (alarmType ? alarmType.getAlarmSeverity() : { level: 500 });
            var dataType = main.sceneManager.dataManager.getDataTypeForData(data);
            //var level = alarmSeverity ? alarmSeverity.name : "";      
            //var level = alarmSeverity ? {displayName: alarmSeverity.displayName ,color: alarmSeverity.color} : "";
            var level = alarmSeverity ? alarmSeverity.color + '...' + alarmSeverity.displayName : "";
            var levelName = alarmSeverity ? alarmSeverity.name : "";
            var node = new twaver.Node(alarm.getId());

            node.setClient('alarmType', alarmTypeName);
            node.setClient('level', level);
            node.setClient('levelName', levelName);
            node.setClient('description', it.util.i18n(alarm.getDescription() || typeDesc));
            node.setClient('alarmTime', self.formateDateTime(alarm.getDateTime()));
            // node.setClient('alarmTime', alarm.getDateTime());
            node.setClient('ackNotice', alarm.isAcked());
            node.setClient('id', alarm.getId());
            node.setClient('dataId', alarm.getDataId());
            node.setClient('data_type', dataType ? dataType.getDescription() : '');
            node.setClient('data_name', data ? data.getName() || data.getDescription() : '');
            node.setClient('dev_ip', alarm.devIp);
            node.setClient('real_id', alarm.realId);

            var client = alarm.client;
            if (client && typeof client == 'string') {
                try {
                    client = JSON.parse(client);
                } catch (error) {
                    console.error(error);
                    client = {};
                }
            }
            node.client = client;
            for (var key in client) {
                node.setClient(key, client[key]);
            }
            return node;
        }
    },

    addData: function (node) {
        var self = this;
        // if (alarm instanceof it.Alarm) {
        //     var alarmType = this.alarmManager.getAlarmTypeByAlarm(alarm);
        //     var alarmStatus = this.alarmManager.getAlarmStatusByAlarm(alarm);
        //     var alarmStatusName = alarmStatus ? alarmStatus.getStatusName() : '';
        //     var typeDesc = '';
        //     if (alarmType) {
        //         typeDesc = alarmType.getDescription();
        //     } else {
        //         typeDesc = alarm.alarmTypeId;
        //     }
        //     var alarmTypeName = alarmType ? alarmType.getName() : alarm.alarmTypeId;
        //     if (!alarmType) {
        //         // console.log("alarm type " + alarm.alarmTypeId+" does not exitst");
        //         // return;
        //     }
        //     //温湿度采集器没有模型，data表被没有相应数据，这里要考虑到温湿度采集器
        //     var data = main.sceneManager.dataManager.getDataById(alarm.getDataId());
        //     var isCollector = main.sceneManager.dataManager.getCollectorById(alarm.getDataId());
        //     if (!data && !isCollector) {
        //         return;
        //     }
        //     var alarmSeverity = alarm.getAlarmSeverity() || (alarmType ? alarmType.getAlarmSeverity() : { level: 500 });
        //     var dataType = main.sceneManager.dataManager.getDataTypeForData(data);
        //     //var level = alarmSeverity ? alarmSeverity.name : "";      
        //     //var level = alarmSeverity ? {displayName: alarmSeverity.displayName ,color: alarmSeverity.color} : "";
        //     var level = alarmSeverity ? alarmSeverity.color + '...' + alarmSeverity.displayName : "";
        //     var levelName = alarmSeverity ? alarmSeverity.name : "";
        //     var node = new twaver.Node(alarm.getId());

        //     // node.setClient('alarmStatus', alarmStatusName ? alarmStatusName : '');
        //     node.setClient('alarmType', alarmTypeName);
        //     node.setClient('level', level);
        //     node.setClient('levelName', levelName);
        //     node.setClient('description', it.util.i18n(alarm.getDescription() || typeDesc));
        //     node.setClient('alarmTime', it.Util.formateDateTime(alarm.getDateTime()));
        //     node.setClient('ackNotice', alarm.isAcked());
        //     node.setClient('id', alarm.getId());
        //     node.setClient('dataId', alarm.getDataId());
        //     node.setClient('data_type', dataType ? dataType.getDescription() : '');
        //     node.setClient('data_name', data ? data.getName() || data.getDescription() : '');
        //      // node.setClient('data_name', data ? data.getDescription() : '');
        //     node.setClient('dev_ip', alarm.devIp);

        //     var client = alarm.client;
        //     if (client && typeof client == 'string') {
        //         try {
        //             client = JSON.parse(client);
        //         } catch (error) {
        //             console.error(error);
        //             client = {};
        //         }
        //     }
        //     node.client = client;
        //     for (var key in client) {
        //         node.setClient(key, client[key]);
        //     }
        self._tempNodeArray = self._tempNodeArray || [];
        self._tempNodeArray.unshift(node);
        //self.box.add(node);
        if (self._addNodeTimeoutId) {
            clearTimeout(self._addNodeTimeoutId);
        }
        self._addNodeTimeoutId = setTimeout(function () {
            self.box.startBatch(function () {
                console.log(self._tempNodeArray.length);
                var t = new Date().getTime();
                self._tempNodeArray.forEach(function (node) {
                    self.box.add(node, 0);
                });
                console.log("databox end:" + (new Date().getTime() - t) / 1000);
                self._tempNodeArray.length = 0;
            });
            //self.box.endBatch();
        }, 10);
    },

    removeData: function (alarmOrId) {
        if (alarmOrId instanceof it.Alarm) {
            alarmOrId = alarmOrId.getId();
        }
        this.box.removeById(alarmOrId);
    },

    clearData: function () {
        this.box.clear();
    },

    formateDateTime: function (date) {
        if (!date) {
            return "";
        }
        if (date === "0000-00-00 00:00:00") {
            return "";
        }
        if (typeof (date) == 'string') {
            var local = new Date(date);
            var utc = local.getTime() + local.getTimezoneOffset() * 60000;
            // date = new Date(utc);
            var offset = 8;
            var beijing = utc + (3600000 * offset);
            date = new Date(beijing);
        }
        if (date instanceof Date) {
            return it.Util.formatDate(date, 'yyyy-MM-dd hh:mm:ss');
        } else {
            return date;
        }
    },
   
    show: function () {
        this.isShow = true;
        //this.alarmMainPane.show();
        this.tablePane.invalidate();
        this.alarmContentPane.dialog('open');
        this.queryCurrentAlarmList(1);
        this.refresh();
    },
    refresh: function () {
        this.table.invalidateModel();
        this.table.invalidateDisplay();
        this.makeStat();
    },

    hide: function () {
        // if (main.panelMgr.instanceMap.NavBarMgr && main.panelMgr.instanceMap.NavBarMgr.appManager && main.panelMgr.instanceMap.NavBarMgr.appManager.appMaps) {
        //     var app = main.panelMgr.instanceMap.NavBarMgr.appManager.appMaps["TEMPANDHUM"];
        //     if (app && app.isInit) {
        //         app.clear();
        //     }
        // }
        this.isShow = false;
        //this.alarmMainPane.hide();
        this.alarmContentPane.dialog('close');
    },

    getLevelColor: function (level) {
        var alarmSeverity = it.AlarmSeverity.getByName(level);
        if (alarmSeverity) {
            return alarmSeverity.color;
        } else {
            return '#00FF00';
        }
    },

    createStatChartPane: function () { // 定义统计chart图表
        var self = this;
        var chartPane = $('<div id = "alarm_chart_pane"></div>');
        chartPane.css('height', '190px');
        chartPane.css('width', '1054px');
        chartPane.css('background-color', 'rgb(48, 48, 48)')
        this.alarmContentPane.append(chartPane);
        var chart = this.chart = echarts.init(document.getElementById('alarm_chart_pane'));
        var self = this;
        chart.on('click', function (event) {
            //$('#title').html(it.util.i18n("ClientAlarmManager_Alarm_info") + '-' + event.name + "-" + it.util.i18n("ClientAlarmManager_List"));
            self.tableDom.style.height = '150px';
            self.setVisibleCategory(event.name);
            self.showTablePane();
        });
        var chartOptions = this.chartOptions = {
            color: ['#f28c00', '#496daa', '#00cca7'],
            tooltip: {
                show: true,
                trigger: "item",
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                textStyle: {
                    color: '#d6d6d6'
                },
                orient: 'vertical',
                x: 'left',
                data: [it.util.i18n("ClientAlarmManager_Temperature_alarm"), it.util.i18n("ClientAlarmManager_Humidity_alarm"), it.util.i18n("ClientAlarmManager_Leakage_alarm")]
            },
            calculable: true,
            series: [{
                name: it.util.i18n("ClientAlarmManager_Alarm_statisics_show_list"),
                type: 'pie',
                radius: ['40%', '60%'],
                itemStyle: {
                    normal: {
                        label: {
                            show: true,
                            formatter: '{b}-{c}'
                        },
                        labelLine: {
                            show: true
                        }
                    },
                    emphasis: {
                        label: {
                            show: true,
                            position: 'center',
                            textStyle: {
                                fontSize: '20',
                                fontWeight: 'bold',
                                formatter: '{b}-{d}%'
                            }
                        }
                    }
                },
                data: [
                    { value: 10, name: it.util.i18n("ClientAlarmManager_Temperature_alarm") },
                    { value: 10, name: it.util.i18n("ClientAlarmManager_Humidity_alarm") },
                    { value: 10, name: it.util.i18n("ClientAlarmManager_Leakage_alarm") },
                ]
            }],
        };
        // chart.setOption(chartOptions);
        // return;
        var box = this.box,
            legendDatas = [],
            datas = [],
            dataMap = {},
            table = this.table;
        self._makeStatTimeOutId = null;
        box.addDataBoxChangeListener(function (event) {
            if (self._makeStatTimeOutId) {
                clearTimeout(self._makeStatTimeOutId);
            }
            self._makeStatTimeOutId = setTimeout(function () {
                self.makeStat();
            }, 10);
        });

        this.makeStat();

    },
    makeStat: function () {
        var box = this.box,
            legendDatas = [],
            datas = [],
            dataMap = {},
            table = this.table;
        var map = {},
            datas = [],
            legendDatas = [];
        box.forEach(function (data) {
            if (!table.isVisible(data)) {
                return;
            }

            var type = data.getClient('alarmType');
            var counter = map[type];
            if (map[type] == null) {
                counter = map[type] = { name: type, value: 0 };
                legendDatas.push(type);
            }
            counter.value++;
        });
        for (var name in map) {
            datas.push(map[name]);
        }
        this.chartOptions.legend.data = legendDatas;
        this.chartOptions.series[0].data = datas;
        this.chart.setOption(this.chartOptions);
    }
});

it.ClientAlarmManager = function (sceneManager) {
    this.sceneManager = sceneManager;
    this.alarmManager = this.sceneManager.getAlarmManager();
    this.alarmTable = new it.AlarmTable(this.alarmManager, this.sceneManager);
    this.isLoad = false;
    this.alarmTooltip = new $AlarmTooltip(this.sceneManager);
    this.init();
    // this.alarmConfigDialog = new it.AlarmConfigDialog();
    this.alarmLogDialog = new it.AlarmLogDialog(this.alarmManager, this.sceneManager);
    this.alarmChartDialog = new it.AlarmChartDialog();
    this.historyAlarmDialog = new it.HistoryAlarmDialog(this.alarmManager, this.sceneManager);
};

mono.extend(it.ClientAlarmManager, Object, {

    init: function () {

        var self = this;
        if (main.getAlarmRenderType) {
            this.alarmManager.renderType = main.getAlarmRenderType();
        }
        if (main.isForceRenderDataAlarm) {
            this.alarmManager.isForceRenderData = main.isForceRenderDataAlarm;
        }
        if (main.initRenderAlarm) {
            main.initRenderAlarm();
        }

        this.alarmManager.addAlarmManagerChangeListener(this.alarmManagerHandler, this);

        this.hideAlarmTable();

        // self.initAlarmSeverity(function () {
        //     self.initAlarmType(function () {
        //         self.initAlarmStatus(function () {
        //             self.initAlarm();
        //         });
        //     });
        // });

        this.registerTooltip();
    },

    createRowItem: function (data, alarm, location) {
        if (!data || !alarm) {
            return null;
        };
        var alarmType = alarm.alarmType;
        var item = [{
            text: location,
            className: 'tooltip-value tooltip-value-btn',
            style: 'width: 60px;text-align:center;',
            onclick: function (e) {
                var callback = function () {
                    var afterBack = function () {
                        main.panelMgr.instanceMap.NavBarMgr.appManager.clientAlarmManager.alarmTable.showAlarmDetail(alarm, data);
                    }
                    main.sceneManager.viewManager3d.getDefaultEventHandler().lookAtByData(data, afterBack);
                }
                var parentData = main.sceneManager.dataManager.getDataById(data.getParentId());
                if (parentData) {
                    main.sceneManager.viewManager3d.getDefaultEventHandler().lookAtByData(parentData, callback);
                } else {
                    callback();
                }
            }
        }, {
            text: alarmType && alarmType.getName() || ''
        }, {
            text: data.getUserData(it.util.i18n("ClientAlarmManager_Asset_IP")) || ''
        }, {
            text: data.getName() || data.getDescription()
        }];
        return item;
    },

    registerTooltip: function () {
        var self = this;
        var tooltipRule = new it.TooltipRule({
            customerId: "alarmTooltip",
            withCloseDiv: true,
            extInfo: function (node, data) {
                data = data || self.sceneManager.getNodeData(node);
                data = data || node.getClient('_alarmBillboard');
                var alarmState = data.getAlarmState();
                if (alarmState &&
                    alarmState.getAlarmCount() > 0) {
                    if (dataJson.showAlarmTableForAlarmTooltip == true) {
                        var list = [];
                        list.header = [it.util.i18n("ClientAlarmManager_Alarm_position"), it.util.i18n("ClientAlarmManager_Alarm_type"), it.util.i18n("ClientAlarmManager_IP"), it.util.i18n("ClientAlarmManager_Name")];
                        var children = data.getChildren(); // 把有告警的孩子显示即可，并不需要找到真正的告警源，对于机柜，其关注的是设备
                        if (children && children.size() > 0) {
                            for (var i = 0; i < children.size(); i++) {
                                var child = children.get(i);
                                var childAlarmState = child.getAlarmState();
                                if (childAlarmState && childAlarmState.getAlarmCount() > 0) {
                                    var location = '';
                                    var dataType = main.sceneManager.dataManager.getDataTypeForData(child);
                                    var sizeU = 1;
                                    if (dataType && dataType.getSize() && dataType.getSize().ySize) {
                                        sizeU = dataType.getSize().ySize;
                                    }
                                    if (child.getLocation() && child.getLocation().y) {
                                        location = child.getLocation().y + 'U-' + (child.getLocation().y + sizeU) + 'U(' + sizeU + 'U)';
                                    }

                                    var alarmManager = self.sceneManager.getAlarmManager();
                                    var alarms = alarmManager.getAlarmsByDataOrId(child);
                                    if (alarms && alarms.size() > 0) {
                                        for (var j = 0; j < alarms.size(); j++) {
                                            var alarm = alarms.get(j);
                                            var item = self.createRowItem(child, alarm, location);
                                            if (item) {
                                                list.push(item);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        return list;
                    } else {
                        var result = {};
                        result[it.util.i18n("ClientAlarmManager_Asset_ID")] = data.getId();
                        result[it.util.i18n("ClientAlarmManager_All_alarms")] = alarmState.getAlarmCount();
                        if (alarmState.getPropagateAlarmCount() > 0) {
                            result[it.util.i18n("ClientAlarmManager_trans_alarms_Amount")] = alarmState.getPropagateAlarmCount();
                            result[it.util.i18n("ClientAlarmManager_trans_alarm_level")] = alarmState.getPropagateHighestAlarmSeverity().name;
                        }
                        if (alarmState.getSelfAlarmCount() > 0) {
                            result[it.util.i18n("ClientAlarmManager_Alarm_amount")] = alarmState.getSelfAlarmCount();
                            var hAlarms = self.getSelfHighestAlarmsByData(data);
                            if (hAlarms && hAlarms.length > 0) {
                                var alarm = hAlarms[0];
                                var alarmType = self.sceneManager.getAlarmManager().getAlarmTypeByAlarm(alarm);
                                var alSeverity = alarm._alarmSeverity; //it.AlarmSeverity.getByValue(alarm.getLevel());
                                result[it.util.i18n("ClientAlarmManager_highest_level")] = alSeverity ? alSeverity.name : '';
                                result[it.util.i18n("ClientAlarmManager_Alarm_category")] = alarmType ? alarmType.getDescription() : '';
                                result[it.util.i18n("ClientAlarmManager_Alarm_description")] = alarm.getDescription();
                                result[it.util.i18n("ClientAlarmManager_Alarm_time")] = it.Util.formateDateTime(alarm.getDateTime());
                            }
                        }
                        return result;
                    }

                }
            }
        });

        this.alarmTooltip.tooltipManager.addTooltipRule(tooltipRule);
        // var orgCustomerIdFun = this.alarmTooltip.tooltipManager.getCustomerIdByNode;
        this.alarmTooltip.tooltipManager.getCustomerIdByNode = function (node) {
            if (!node) {
                return null;
            }
            var alarmData = node.getClient('_alarmBillboard');
            if (alarmData && alarmData.getAlarmState()) {
                if (alarmData.getAlarmState().getAlarmCount() > 0) {
                    return 'alarmTooltip';
                }
                return null;
            }
            var data = this.sceneManager.getNodeData(node);
            if (!data) {
                return null;
            }
            alarmState = data.getAlarmState();
            if (alarmState &&
                alarmState.getAlarmCount() > 0) {
                return 'alarmTooltip';
            }
        };

        this.alarmTooltip.tooltipManager.generateTooltipPosition = function (node, x, y, z) {
            // main.sceneManager._alarmManager._alarmBillboardMap
            var data = this.sceneManager.getNodeData(node);
            if (data) {
                var alarmBillboard = this.sceneManager.getAlarmManager()._alarmBillboardMap[data.getId()];
                if (!alarmBillboard) {
                    return new mono.Vec3(x, y, z);
                }
                var pos = new mono.Vec3();
                var bwp = alarmBillboard.getWorldPosition();
                pos.setX(bwp.x);
                pos.setZ(bwp.z);
                pos.setY(bwp.y + 20);
                return pos;
            }
            return new mono.Vec3(x, y, z);
        };
        this.sceneManager.viewManager3d.enableClick = true;
    },

    getSelfHighestAlarmsByData: function (data) {
        if (!data) {
            return null;
        }
        var alarmManager = this.sceneManager.getAlarmManager();
        var state = data.getAlarmState();
        var alarms = alarmManager.getAlarmsByDataOrId(data);
        var highestAlarmSeverity = state.getSelfHighestAlarmSeverity();
        var highestAlarms = [];
        if (highestAlarmSeverity && alarms && alarms.size() > 0) {
            for (var i = 0; i < alarms.size(); i++) {
                var alarm = alarms.get(i);
                if (it.AlarmSeverity.compare(alarm.getAlarmSeverity(), highestAlarmSeverity) >= 0) {
                    highestAlarms.push(alarm);
                }
            }
        }
        return highestAlarms;
    },

    /**
     * 加载所有告警级别
     * @param callback
     */
    // initAlarmSeverity: function (callback) {
    //     var self = this;
    //     it.util.api('alarm_severity', 'search', {}, function (alarmSeverities) {
    //         it.AlarmSeverity.clear();
    //         delete it.AlarmSeverity.CRITICAL;
    //         delete it.AlarmSeverity.MAJOR;
    //         delete it.AlarmSeverity.MINOR;
    //         delete it.AlarmSeverity.WARNING;
    //         delete it.AlarmSeverity.INDETERMINATE;
    //         delete it.AlarmSeverity.CLEARED;
    //         self.alarmManager.addAlarmSeverityFromJson(alarmSeverities);
    //         callback && callback();
    //     });
    // },

    // /**
    //  * 加载所有告警类型
    //  * @param callback
    //  */
    // initAlarmType: function (callback) {
    //     var self = this;
    //     it.util.api('alarm_type', 'search', {}, function (alarmTypes) {
    //         self.alarmManager.addAlarmTypeFromJson(alarmTypes);
    //         callback && callback();
    //     });
    // },

    // initAlarmStatus: function (callback) {
    //     var self = this;
    //     it.util.api('alarm_status', 'search', {}, function (alarmStatuses) {
    //         self.alarmManager.addAlarmStausFromJson(alarmStatuses);
    //         callback && callback();
    //     });
    // },

    // /**
    //  * 加载所有告警
    //  * @param callback
    //  */
    // initAlarm: function (callback) {
    //     var self = this;
    //     it.util.api('alarm', 'search', {
    //         where: {},
    //         order: [
    //             ['time', 'desc']
    //         ]
    //     }, function (alarms) {
    //         self.alarmManager.addAlarmFromJson(alarms);
    //         callback && callback();
    //     });
    // },

    alarmManagerHandler: function (event) {
        var kind = event.kind;
        var alarm = event.data;
        if (kind == 'add') {
            this.addAlarmHandler(alarm)
        } else if (kind == 'remove') {
            this.removeAlarmHandler(alarm);
        } else if (kind == 'clear') {
            this.clearAlarmHandler(alarm);
        }
    },

    addAlarmHandler: function (alarm) {
        var node = this.alarmTable.setData2D(alarm);
        if (node) {
            this.alarmTable.addData(node);
        }
    },

    removeAlarmHandler: function (alarm) {
        this.alarmTable.removeData(alarm);
    },

    clearAlarmHandler: function (alarm) {
        this.alarmTable.clearData();
    },

    showAlarmTable: function () {
        this.alarmTable.show();
    },

    hideAlarmTable: function () {
        this.alarmTable.hide();
    },

    updateAlarmHandle: function (alarm) {
        this.alarmLogDialog.queryListDialog(1);
        this.alarmTable.queryCurrentAlarmList(1);
        this.alarmTable.refresh();
    },

    showAlarmLogDialog: function () {
        this.alarmLogDialog.showListDialog();
    },

    // showAlarmConfigDialog: function () {
    //     this.alarmConfigDialog.showConfigDialog();
    // },

    showAlarmChartDialog: function () {
        this.alarmChartDialog.showChartDialog();
    },

    showHistoryAlarmDialog: function () {
        this.historyAlarmDialog.show();
    },

});

it.AlarmChartDialog = function () {

    this.initChartDialog();
};

mono.extend(it.AlarmChartDialog, Object, {
    initChartDialog: function () {

        this.alarmCountGroupByDay = echarts.init(document.getElementById('alarmCountGroupByDayBox'));
        this.alarmCountGroupByType = echarts.init(document.getElementById('alarmCountGroupByTypeBox'));
        this.alarmCountGroupByLevel = echarts.init(document.getElementById('alarmCountGroupByLevelBox'));
        $('#chartBox').dialog({ //创建dialog弹窗
            width: 'auto',
            height: 'auto',
            title: it.util.i18n("ClientAlarmManager_Alarm_statisics"),
            closeOnEscape: false,
            autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
            show: false, //显示弹窗出现的效果，slide为滑动效果
            hide: false, //显示窗口消失的效果，explode为爆炸效果
            resizable: false, //设置是否可拉动弹窗的大小，默认为true
            modal: true //是否有遮罩模型

        });
    },

    showChartDialog: function () {

        this.loadChartData();
        $('#chartBox').dialog('open');
    },

    loadChartData: function () {

        var self = this;
        var alarmCountGroupByDayOption = {
            tooltip: {
                show: true,
                trigger: "item",
            },
            title: {
                text: it.util.i18n("ClientAlarmManager_Alarm_amount_Last_30_day"),
                subtext: '',
                x: 'center',
                y: '10'
            },
            xAxis: [{
                type: 'category',
                data: [],
                axisLabel: {
                    formatter: function (params) {
                        if (params) {
                            return params.substr(5);
                        }
                        return params;

                    }
                }
            }],
            yAxis: [{
                type: 'value',
                name: it.util.i18n("ClientAlarmManager_Amount")
            }],
            series: [{
                "name": it.util.i18n("ClientAlarmManager_New_alarm_amount"),
                "type": "line",
                "data": []
            }]
        };
        var alarmCountGroupByTypeOption = {
            tooltip: {
                trigger: 'item',
                formatter: "{b} : {c}个<br>" + it.util.i18n("ClientAlarmManager_Ratio") + " : {d}%"
            },
            title: {
                text: it.util.i18n("ClientAlarmManager_Alarm_type_distribute_Last_30_day"),
                subtext: '',
                x: 'center',
                y: '10'
            },
            legend: {
                x: 'center',
                y: 'bottom',
                data: []
            },
            series: [{
                "type": "pie",
                "radius": '50%',
                "center": ['50%', '55%'],
                "data": [],
                itemStyle: {
                    normal: {
                        label: {
                            position: 'outer',
                            formatter: '{b}\n{d}%'
                        },
                        labelLine: {
                            show: true
                        }
                    }
                }
            }]
        };
        var alarmCountGroupByLevelOption = {
            tooltip: {
                trigger: 'item',
                formatter: "{b} : {c}个<br>" + it.util.i18n("ClientAlarmManager_Ratio") + " : {d}%"
            },
            title: {
                text: it.util.i18n("ClientAlarmManager_Alarm_level_distribute_Last_30_day"),
                subtext: '',
                x: 'center',
                y: '10'
            },
            legend: {
                x: 'center',
                y: 'bottom',
                data: []
            },
            series: [{
                "type": "pie",
                "radius": '50%',
                "center": ['50%', '55%'],
                "data": [],
                itemStyle: {
                    normal: {
                        label: {
                            position: 'outer',
                            formatter: '{b}\n{d}%'
                        },
                        labelLine: {
                            show: true
                        }
                    }
                }
            }]
        };

        ServerUtil.api('alarm_log', 'alarmCountGroupByDay', { offset: -30 }, function (data) {
            alarmCountGroupByDayOption.xAxis[0].data = [];
            alarmCountGroupByDayOption.series[0].data = [];
            for (var i = 0; i < data.length; i++) {
                alarmCountGroupByDayOption.xAxis[0].data.push(data[i].name);
                alarmCountGroupByDayOption.series[0].data.push(data[i].value);
            }
            self.alarmCountGroupByDay.setOption(alarmCountGroupByDayOption);
        });

        ServerUtil.api('alarm_log', 'alarmCountGroupByType', { offset: -30 }, function (data) {
            alarmCountGroupByTypeOption.series[0].data = [];
            alarmCountGroupByTypeOption.legend.data = [];
            for (var i = 0; i < data.length; i++) {
                alarmCountGroupByTypeOption.legend.data.push(data[i].name);
                alarmCountGroupByTypeOption.series[0].data.push({ name: data[i].name, value: data[i].value });
            }
            self.alarmCountGroupByType.setOption(alarmCountGroupByTypeOption);
        });

        ServerUtil.api('alarm_log', 'alarmCountGroupByLevel', { offset: -30 }, function (data) {
            alarmCountGroupByLevelOption.series[0].data = [];
            alarmCountGroupByLevelOption.legend.data = [];
            for (var i = 0; i < data.length; i++) {
                alarmCountGroupByLevelOption.legend.data.push(it.AlarmSeverity.getByName(data[i].name.toLowerCase()).displayName);
                alarmCountGroupByLevelOption.series[0].data.push({
                    name: it.AlarmSeverity.getByName(data[i].name.toLowerCase()).displayName,
                    value: data[i].value
                });
            }
            self.alarmCountGroupByLevel.setOption(alarmCountGroupByLevelOption);
        });

    }
});

it.AlarmLogDialog = function (alarmManager, sceneManager) {
    this.alarmManager = alarmManager;
    this.sceneManager = sceneManager;

    this.alarmLogBox = new twaver.ElementBox();
    this.initOperationDialog();
    this.initListDialog();
    this.alarmLogTable = null;
    this.pagerContentWidth = null;
    // this.alarmLogTable = new twaver.controls.Table(this.alarmLogBox);

    // var alarmLogTablePaneDOM = new twaver.controls.TablePane(this.alarmLogTable).getView();
    // alarmLogTablePaneDOM.style.width = "100%";
    // alarmLogTablePaneDOM.style.height = "500px";
    // document.getElementById("alarmListBox").appendChild(alarmLogTablePaneDOM);
    // document.getElementById("alarmListBox").style.height = "500px";
};

mono.extend(it.AlarmLogDialog, Object, {
    setBoxModel: function (box, model) {
        model = model || {};
        box.find('input').each(function () {
            var input = $(this);
            var type = input.attr('type');
            if (type == 'checkbox') {
                input.prop('checked', model[input.attr('name')])
            } else {
                input.val(model[input.attr('name')]);
            }
        });
        box.find('select').each(function () {
            var select = $(this);
            select.val(model[select.attr('name')]);
        });
    },

    getBoxModel: function (box, model) {
        model = model || {};
        box.find('input').each(function () {
            var input = $(this);
            var type = input.attr('type');
            if (type == 'checkbox') {
                model[input.attr('name')] = input.prop('checked');
            } else {
                model[input.attr('name')] = input.val();
            }
        });
        box.find('select').each(function () {
            var select = $(this);
            model[select.attr('name')] = select.val();
        });
        return model;
    },

    // it.AlarmLogDialog下面的formateDateTime，这个里面影响了历史告警表格里面的告警时间  remark 17-9-12
    formateDateTime: function (date) {
        if (!date) {
            return "";
        }
        if (date === "0000-00-00 00:00:00") {
            return "";
        }
        if (typeof (date) == 'string') {
            var local = new Date(date);
            var utc = local.getTime() + local.getTimezoneOffset() * 60000;
            // date = new Date(utc);
            // 下面三行是进行时区偏移，北京时间为东8区，则offset为8。若不加的话，则为格林威治时间。但是感觉没有设置时区的必要性，设置时间和获取时间均为当地时间，这个无必要
            var offset = 8;
            var beijing = utc + (3600000 * offset);
            date = new Date(beijing);
        }
        if (date instanceof Date) {
            return it.Util.formatDate(date, 'yyyy-MM-dd hh:mm:ss');
        } else {
            return date;
        }
    },

    createTable: function () {
        this.alarmLogTable = new twaver.controls.Table(this.alarmLogBox);
        var tablePane = new twaver.controls.TablePane(this.alarmLogTable);
        var alarmLogTablePaneDOM = tablePane.getView();
        var w = document.body.clientWidth,
            nw, nh;
        if (w < 1440) {
            nh = 470;
        } else if (w >= 1440 && w < 1920) {
            nh = 470;
        } else if (w >= 1920) {
            nh = 630;
        }
        alarmLogTablePaneDOM.style.width = "100%";
        alarmLogTablePaneDOM.style.height = nh + 'px';
        alarmLogTablePaneDOM.style.overflow = 'hidden';
        document.getElementById("alarmListBox").appendChild(alarmLogTablePaneDOM);
        document.getElementById("alarmListBox").style.height = nh + 2 + 'px';
        // document.getElementById("alarmListBox").style.width = '99.8%';
        document.getElementById("alarmListBox").style.width = '100%';
        document.getElementById("alarmListBox").style.border = '2px solid #2d2d2d';
        document.getElementById("alarmListBox").style.position = 'relative';
        this.createColumns(this.alarmLogTable);

        var tableHeader = tablePane.getTableHeader().getView();
        tablePane.getTableHeader().setHeight(30);
        tableHeader.style.backgroundColor = 'rgba(63, 63, 63, 0)';
        tableHeader.firstChild.style.backgroundColor = 'rgb(48, 48, 48)';
        // tableHeader.firstChild.style.border = '1px solid #595959';
        // tableHeader.firstChild.style.borderBottom = 'none';

        var table = tablePane.getTable().getView();
        // table.firstChild.firstChild.style.border = '1px solid #595959';
        // table.firstChild.firstChild.style.borderTop = 'none';
        table.firstChild.firstChild.style.background = 'rgba(48, 48, 48, 1.0)';
    },

    createColumns: function (table) {
        var self = this;
        var w = document.body.clientWidth,
            nw, nh, scrollDivWidth;
        if (w < 1440) {
            nw = 915 / 1240;
            scrollDivWidth = 1000;
        } else if (w >= 1440 && w < 1920) {
            nw = 915 / 1240;
            scrollDivWidth = 1000;
        } else if (w >= 1920) {
            nw = 1;
            scrollDivWidth = 1250;
        }
        nw = w / 1240 * 0.8;
        this.createColumn(table, it.util.i18n("ClientAlarmManager_Alarm_device_alias"), 'data_name', 'client').setWidth(135 * nw);
        this.createColumn(table, it.util.i18n("ClientAlarmManager_Asset_ID"), 'data_id', 'client').setWidth(120 * nw);
        this.createColumn(table, it.util.i18n("ClientAlarmManager_Asset_type"), 'data_type', 'client').setWidth(160 * nw);
        this.createColumn(table, it.util.i18n("ClientAlarmManager_Alarm_type"), 'alarm_type', 'client').setWidth(130 * nw);
        this.createColumn(table, it.util.i18n("ClientAlarmManager_Alarm_level"), 'level', 'client').setWidth(110 * nw);
        this.createColumn(table, it.util.i18n("ClientAlarmManager_Alarm_status"), 'alarm_status', 'client').setWidth(130 * nw);
        this.createColumn(table, it.util.i18n("ClientAlarmManager_Alarm_time"), 'alarm_time', 'client').setWidth(160 * nw);
        this.createColumn(table, it.util.i18n("ClientAlarmManager_Alarm_description"), 'alarm_description', 'client').setWidth(160 * nw);
        this.createColumn(table, it.util.i18n("ClientAlarmManager_Alarm_operation"), 'operation', 'client', 'string', renderDetailCell).setWidth(105 * nw);

        var self = this;

        function renderDetailCell(alarm, data, div) {
            $(alarm.div).css({
                "display": "flex",
                "display": "-webkit-flex",
                "align-items": "center",
                "justify-content": "center"
            })
            var button = $('<button type="button" class="btn btn-default btn-sm fs10 bt-btn-second" style="margin-right: 8px">' + it.util.i18n("ClientAlarmManager_Detail") + '</button>');
            button.appendTo($(alarm.div));
            button.mouseup(function (event) {
                self.showAlarmDetail(alarm, data);
            });
        }

        var originalRenderCell = table.renderCell;
        table.setRowHeight(30);
        table.renderCell = function (params) {
            originalRenderCell(params);
            var div = params.div;
            var scrollDiv = div.parentNode.parentNode.parentNode.parentNode;
            var scrollParentDiv = div.parentNode.parentNode.parentNode.parentNode.parentNode;
            scrollDiv.style.overflowX = 'hidden';
            scrollDiv.style.width = '100%';
            scrollDiv.className = 'bt-scroll';
            // scrollDiv.style.width = scrollDivWidth + 'px';
            scrollParentDiv.style.overflow = 'hidden';
            params.div.style.textAlign = 'center';
            params.div.style.fontSize = '14px';
            if (params.column._propertyName === "alarm_description") {

                params.div.style.whiteSpace = "normal";
                //params.div.style.lineHeight = "18px";
                params.div.color = "#6B7375";
                params.div.fontFamily = "Tahoma,Helvetica,Arial,\5b8b\4f53,sans-serif";
                if (params.div.children && params.div.children[0]) {
                    params.div.children[0].style.whiteSpace = "normal";
                    //params.div.children[0].style.lineHeight = "18px";
                }
            } else if (params.column._propertyName === "level") {
                params.div.children[0].innerHTML = params.value.displayName;
                params.div.children[0].title = params.value.displayName;
                var span = document.createElement('span');
                span.style.display = 'inline-block';
                span.style.width = '7px';
                span.style.height = '15px';
                span.style.margin = '0px 5px 0px 0px';
                span.style.verticalAlign = 'middle';
                span.style.background = params.value.color;
                params.div.style.textAlign = 'left';
                params.div.style.paddingLeft = '20px';
                params.div.children[0].prepend(span);
            } else if (params.column._propertyName === "data_type") {
                params.div.style.textAlign = 'left';
                params.div.style.paddingLeft = '20px';
            } else if (params.column._propertyName === "data_id") {
                params.div.style.textAlign = 'left';
                params.div.style.paddingLeft = '20px';
            }
            params.div.style.border = 'none';
            //params.div.parentNode.style.border = 'none';
            params.div.parentNode.style.width = '99.9999%';
            if (params.rowIndex % 2 == 0) {
                params.div.parentNode.style.backgroundImage = '-webkit-linear-gradient(top, rgba(58, 58, 58, 0.5), rgba(58, 58, 58, 0.5))';
            } else {
                params.div.parentNode.style.backgroundImage = '-webkit-linear-gradient(top, rgba(48, 48, 48, 0.5), rgba(48, 48, 48, 0.5))';
            }
            self.pagerContentWidth = table._view.firstChild.firstChild.style.width;
            // $('#alarmListDialog').find('.pagerContent').css('width', self.pagerContentWidth);
            $('#alarmListDialog').find('.pagerContent').css('width', '100%');

        }

        table.renderData = function (div, data, row, selected) {
            var columns = this._columnBox.getRoots();
            var count = columns.size();
            var sumWidth = 0;
            var hpx = this._rowHeight - this._rowLineWidth + 'px';

            var style;
            for (var i = 0; i < count; i++) {
                var column = columns.get(i);
                var width = column.getWidth();
                if (width < 0) width = 0;
                var columnLineWidth = Math.min(this._columnLineWidth, width);

                if (column.isVisible()) {
                    var cell = this._cellPool.get();
                    style = cell.style;
                    style.position = 'absolute';
                    style.whiteSpace = 'nowrap';
                    style.verticalAlign = 'middle';
                    style.textAlign = column.getHorizontalAlign();
                    style.overflow = 'hidden';
                    style.textOverflow = 'ellipsis';
                    style.left = sumWidth + 'px';
                    style.width = width - columnLineWidth + 'px';
                    style.height = hpx;

                    // style.borderStyle = 'solid';
                    // style.borderWidth = '0px';
                    // style.borderRightWidth = columnLineWidth + 'px';
                    // style.borderRightColor = this._columnLineColor;

                    // if (i === 0) {
                    //     style.borderLeftWidth = columnLineWidth + 'px';
                    //     style.borderLeftColor = this._columnLineColor;
                    // } else {
                    //     style.borderLeftWidth = '0px';
                    // }

                    div.appendChild(cell);
                    var params = {
                        data: data,
                        value: this.getValue(data, column),
                        div: cell,
                        view: this,
                        column: column,
                        rowIndex: row,
                        selected: selected,
                    }
                    this.renderCell(params);
                    this.onCellRendered(params);
                    sumWidth += width;
                }
            }

            style = div.style;
            style.width = sumWidth + 'px';
            style.height = hpx;
            style.border = 'none';

            backgroundColor = (row % 2 == 0) ? 'rgba(84, 138, 160, 1.0)' : 'rgba(94, 148, 170, 1.0)'
            style.backgroundColor = ((this.isCheckMode() && this._focusedRow === row) || (!this.isCheckMode() && selected)) ? backgroundColor : '';
            style.border = ((this.isCheckMode() && this._focusedRow === row) || (!this.isCheckMode() && selected)) ? '1px solid #00f6ff' : '';
            style.color = ((this.isCheckMode() && this._focusedRow === row) || (!this.isCheckMode() && selected)) ? '#ffffff' : '';
        }

        var renderCell = table.renderCell;

        table.renderCell = function (params) {
            setTimeout(function () {
                renderCell.call(table, params)
            }, 10);
        };

        //this.createColumn(table, '恢复时间', 'alarm_clear_time', 'client').setWidth(120);
        //this.createColumn(table, it.util.i18n("ClientAlarmManager_Confirm_time"), 'alarm_ack_time', 'client').setWidth(160);
        //this.createColumn(table, it.util.i18n("ClientAlarmManager_Confirm_content"), 'alarm_ack_notice', 'client').setWidth(360);
        // var operationColumn = this.createColumn(table, '告警操作', 'alarm_operation', 'client');
        // operationColumn.setWidth(120);
        // operationColumn.renderCell = function (params) {
        //     var id = params.value;
        //     var aTag = document.createElement('input');
        //     aTag.style.marginLeft = "10%";
        //     aTag.setAttribute("id", "ackAlarm");
        //     aTag.setAttribute("class", "boxButton");
        //     aTag.type = "button";
        //     aTag.value = "确认";
        //     var alarmAckTime = params.data.getClient("alarm_ack_time");
        //     if (alarmAckTime !== "") {
        //         aTag.disabled = "disabled";
        //     }

        //     params.div.appendChild(aTag);
        //     var bTag = document.createElement('input');
        //     bTag.style.marginLeft = "10%";
        //     bTag.setAttribute("id", "clearAlarm");
        //     bTag.setAttribute("class", "boxButton");
        //     bTag.type = "button";
        //     bTag.value = "清除";
        //     var alarmClearTime = params.data.getClient("alarm_clear_time");
        //     var alarmTypeId = params.data.getClient("alarm_type_id");
        //     if (alarmClearTime !== "" || alarmClearTime != '' || alarmTypeId == 'dev_add' || alarmTypeId == 'dev_change' || alarmTypeId == 'dev_remove') {
        //         bTag.disabled = "disabled";
        //     }
        //     params.div.appendChild(bTag);

        //     var node_id = params.data.getId();
        //     params.div.setAttribute("id", node_id);

        // }
    },

    createColumn: function (table, name, propertyName, propertyType, valueType, renderCell, editable) {
        var column = new twaver.Column(name);
        column.setName(name);
        column.setPropertyName(propertyName);
        column.setPropertyType(propertyType);
        if (valueType) column.setValueType(valueType);
        column.setEditable(editable);
        column.renderHeader = function (div) {
            var span = document.createElement('span');
            span.style.whiteSpace = 'nowrap';
            span.style.verticalAlign = 'middle';
            span.style.padding = '1px 2px 1px 2px';
            span.innerHTML = this.getName() ? this.getName() : this.getPropertyName();
            span.setAttribute('title', span.innerHTML);
            span.style.font = 'bold 14px Helvetica';
            div.style.textAlign = 'center';
            div.style.backgroundImage = 'none'
            div.style.border = 'none';
            div.appendChild(span);
        };
        if (renderCell) {
            column.renderCell = renderCell;
        }
        table.getColumnBox().add(column);
        return column;
    },

    initListDialog: function () {
        var self = this;
        var alarmListDialog = $('#alarmListDialog');
        //所有告警
        var w = document.body.clientWidth,
            nw, nh;
        if (w < 1440) {
            // nw = 900;
            nw = w * 0.8;
            nh = 640;
        } else if (w >= 1440 && w < 1920) {
            // nw = 990;
            nw = w * 0.8;
            nh = 640;
        } else if (w >= 1920) {
            // nw = 1322;
            nw = w * 0.8;
            nh = 800;
        }
        alarmListDialog.dialog({ //创建dialog弹窗
            blackStyle: true,
            width: nw,
            height: nh,
            title: it.util.i18n("ClientAlarmManager_Check_All_Alarms"),
            autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
            show: '', //显示弹窗出现的效果，slide为滑动效果
            hide: '', //显示窗口消失的效果，explode为爆炸效果
            resizable: false, //设置是否可拉动弹窗的大小，默认为true
            // position: [30, 70],
            modal: true, //是否有遮罩模型
        });

        $(".alarm_time_min").datetimepicker({
            zIndex: Math.pow(2, 25),
            weekStart: 1,
            language: 'zh-CN',
            format: 'yyyy-mm-dd hh:ii:ss',
            autoclose: true,
            todayBtn: true,
            startView: 2,
            minView: 0,
            clearBtn: true,
        }).on('changeDate', function (ev) {
            var val = $(".alarm_time_min").val();
            if (!val) {
                return;
            }
            var timeArr = val.split(':');
            timeArr[2] = '00';
            var newVal = timeArr[0] + ':' + timeArr[1] + ':' + timeArr[2];
            $(".alarm_time_min").val(newVal);
            $(".alarm_time_min").datetimepicker('update');
            $(".alarm_time_max").datetimepicker('setStartDate', newVal);
        });
        this.toggleDatePicker($(".alarm_time_min"));
        var timeMin = this.initPlaceholder() + '00:00:00';
        // $(".alarm_time_min").attr('placeholder', timeMin);
        $(".alarm_time_min").attr('placeholder', 'yyyy-mm-dd hh:mm:ss');

        $(".alarm_time_max").datetimepicker({
            zIndex: Math.pow(2, 25),
            weekStart: 1,
            language: 'zh-CN',
            format: 'yyyy-mm-dd hh:ii:ss',
            autoclose: true,
            todayBtn: true,
            startView: 2,
            minView: 0,
            clearBtn: true,
        }).on('changeDate', function (ev) {
            var val = $(".alarm_time_max").val();
            if (!val) {
                return;
            }
            var timeArr = val.split(':');
            timeArr[2] = '00';
            var newVal = timeArr[0] + ':' + timeArr[1] + ':' + timeArr[2];
            $(".alarm_time_max").val(newVal);
            $(".alarm_time_max").datetimepicker('update');
            $(".alarm_time_min").datetimepicker('setEndDate', $(".alarm_time_max").val());
        });
        this.toggleDatePicker($(".alarm_time_max"));
        var timeMax = this.initPlaceholder() + '23:55:00';
        // $(".alarm_time_max").attr('placeholder', timeMax);
        $(".alarm_time_max").attr('placeholder', 'yyyy-mm-dd hh:mm:ss');

        alarmListDialog.find('.pagerBox').pager(function (pageIndex) {
            self.queryListDialog(pageIndex);
        });
        alarmListDialog.find('.searchButton').on('click', function () {
            self.queryListDialog(1);
        });

        //搜索资产名称
        // ServerUtil.api('data_name', 'search', {}, function (data) {
        //     var select = alarmListDialog.find('.searchBox .asset_name');
        //     for (var i = 0; i < data.length; i++) {
        //         var desc = data[i].description || data[i].id;
        //         select.append('<option value="' + data[i].id + '">' + desc + '</option>');
        //     }
        // });
        // ServerUtil.api('datatype', 'search', {}, function (data) {
        //     var select = alarmListDialog.find('.searchBox .asset_type_id');
        //     for (var i = 0; i < data.length; i++) {
        //         var desc = data[i].description || data[i].id;
        //         select.append('<option value="' + data[i].id + '">' + desc + '</option>');
        //     }
        // });
        var assetTypeIdSelect = alarmListDialog.find('.searchBox .asset_type_id');
        this.sceneManager.dataManager._dataTypes.forEach(function (dataType) {
            var desc = dataType._description || dataType._id;
            assetTypeIdSelect.append('<option value="' + dataType._id + '">' + desc + '</option>');
        });

        // ServerUtil.api('alarm_type', 'search', {}, function (data) {
        //     var select = alarmListDialog.find('.searchBox .alarm_type_id');
        //     for (var i = 0; i < data.length; i++) {
        //         select.append('<option value="' + data[i].id + '">' + data[i].name + '</option>');
        //     }
        // });
        var alarmTypeSelect = alarmListDialog.find('.searchBox .alarm_type_id');
        this.sceneManager._alarmManager._alarmTypeList._as.forEach(function (alarmType) {
            alarmTypeSelect.append('<option value="' + alarmType._id + '">' + alarmType._name + '</option>');
        });

        // ServerUtil.api('alarm_severity', 'search', {
        //     where: {},
        //     order: [
        //         ['value', 'asc']
        //     ]
        // }, function (data) {
        //     var select = alarmListDialog.find('.searchBox .alarm_level');
        //     for (var i = 0; i < data.length; i++) {
        //         //<option value="critical">&nbsp高级</option>
        //         select.append('<option value="' + data[i].id + '">' + data[i].displayName + '123' + data[i].color + '</option>');
        //     }
        // });
        var alarmLevelSelect = alarmListDialog.find('.searchBox .alarm_level');
        it.AlarmSeverity.severities._as.forEach(function (serverity) {
            alarmLevelSelect.append('<option value="' + serverity.name + '">' + serverity.displayName + '123' + serverity.color + '</option>');
        });

        alarmListDialog.on('click', '.boxButton', function () {
            var target = event.target;

            // paramsDom.data("id",params.data.getClient("alarm_id"));
            // paramsDom.data("data_id",params.data.getClient("data_id"));
            // paramsDom.data("alarm_type_id",params.data.getClient("alarm_type_id"));
            // paramsDom.data("node_id",node_id);
            var operation = $(target).attr('id');
            var node_id = $(target).parent().attr('id');
            var node = self.alarmLogBox.getDataById(node_id);
            var alarm_id = node.getClient("alarm_id");
            // var rt_id = $(target).parent().data('rt_id');
            var data_id = node.getClient("data_id");
            var alarm_type_id = node.getClient("alarm_type_id");
            var desc = node.getClient("description");
            // var desc = $(target).parent().parent().parent().find('td').eq(5).text();
            var alarmInfo = {
                operation: operation,
                id: alarm_id,
                description: desc,
                // rt_id: rt_id,
                data_id: data_id,
                alarm_type_id: alarm_type_id
            };
            self.showOperationDialog(alarmInfo);
        });
    },
    // showAlarmDetail: function (alarm, data) {
    //     var panel = $PropertyPane.getInstance();
    //     var detailData = {};
    //     var alarmId, level, description, alarmTime, alarmType, dataId, dataType,deviceName,alarm_ack_time,alarm_ack_notice;
    //     if (alarm instanceof Alarm) {
    //         var alarmType = main.sceneManager._alarmManager.getAlarmTypeByAlarm(alarm);
    //         id = alarm.getId();
    //         level = alarm.getLevel() || alarmType._level;
    //         description = alarm.getDescription();
    //         alarmTime = alarm.getDateTime();
    //         alarmTypeName = alarmType.getName();
    //         dataId = alarm.getDataId();
    //         devIp = alarm.devIp;
    //     } else {
    //         alarmId = alarm.data.getClient('alarm_id');
    //         dataId = alarm.data.getClient("data_id");
    //         alarmType = alarm.data.getClient('alarm_type');
    //         level = alarm.data.getClient('levelKey');
    //         description = alarm.data.getClient("alarm_description");
    //         alarmTime = alarm.data.getClient("alarm_time"); 
    //         alarm_ack_time = alarm.data.getClient("alarm_ack_time");
    //         alarm_ack_notice = alarm.data.getClient("alarm_ack_notice");    
    //         dataType = alarm.data.getClient('data_type'); 
    //         deviceName = alarm.data.getClient('data_name'); 

    //     }
    //     detailData[it.util.i18n("ClientAlarmManager_Alarm_ID")] = alarmId || '';        
    //     detailData[it.util.i18n("ClientAlarmManager_Alarm_device_alias")] = deviceName || ''; 
    //     detailData[it.util.i18n("ClientAlarmManager_Alarm_device_ID")] = dataId || '';
    //     detailData[it.util.i18n("ClientAlarmManager_Asset_type")] = dataType || '';
    //     detailData[it.util.i18n("ClientAlarmManager_Alarm_category")] = alarmType || '';
    //     detailData[it.util.i18n("ClientAlarmManager_Alarm_level")] = this.translateLevel(level) || '';
    //     var extend = alarm.data.client;
    //     if (extend) {
    //         // detailData[" "]= "---------------扩展字段---------------";
    //         if (typeof (extend) === 'string') {
    //             var key = it.util.i18n("ClientAlarmManager_Extend");
    //             $.extend(detailData, { key: extend });
    //         } else {
    //             $.extend(detailData, extend);
    //         }
    //     }
    //     detailData[it.util.i18n("ClientAlarmManager_Alarm_time")] = alarmTime || '';
    //     detailData[it.util.i18n("ClientAlarmManager_Alarm_description")] = description || '';
    //     detailData[it.util.i18n("ClientAlarmManager_Confirm_content")] = alarm_ack_notice || '';
    //     detailData[it.util.i18n("ClientAlarmManager_Confirm_time")] = alarm_ack_time || '';

    //     panel.setData(detailData);
    //     // layer.open({
    //     //     shade: 0,
    //     //     type: 1,
    //     //     title: it.util.i18n("ClientAlarmManager_Alarm_detail"),
    //     //     skin: 'layui-layer-rim', //加上边框
    //     //     area: ['500px', '300px'], //宽高
    //     //     content: panel.getRootConent(),
    //     // });

    //     //告警详情
    //     panel.getRootConent().dialog({ //创建dialog弹窗
    //         blackStyle: true,
    //         width: '306px',
    //         height: 'auto',
    //         title: it.util.i18n("ClientAlarmManager_Alarm_detail"),
    //         autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
    //         show: '', //显示弹窗出现的效果，slide为滑动效果
    //         hide: '', //显示窗口消失的效果，explode为爆炸效果
    //         resizable: false, //设置是否可拉动弹窗的大小，默认为true
    //         //position: [30, 70],
    //         modal: true, //是否有遮罩模型
    //     });
    //     panel.getRootConent().dialog('open');
    // },

    showAlarmDetail: function (alarm, data) {
        var detailData = {};
        var alarmId, level, description, alarmTime, alarmType, dataId, dataType, deviceName, alarm_ack_time, alarm_ack_notice;
        if (alarm instanceof Alarm) {
            var alarmType = main.sceneManager._alarmManager.getAlarmTypeByAlarm(alarm);
            id = alarm.getId();
            level = alarm.getLevel() || alarmType._level;
            description = alarm.getDescription();
            alarmTime = alarm.getDateTime();
            alarmTypeName = alarmType.getName();
            dataId = alarm.getDataId();
            devIp = alarm.devIp;
        } else {
            alarmId = alarm.data.getClient('alarm_id');
            dataId = alarm.data.getClient("data_id");
            alarmType = alarm.data.getClient('alarm_type');
            level = alarm.data.getClient('levelKey');
            description = alarm.data.getClient("alarm_description");
            alarmTime = alarm.data.getClient("alarm_time");
            alarm_ack_time = alarm.data.getClient("alarm_ack_time");
            alarm_ack_notice = alarm.data.getClient("alarm_ack_notice");
            dataType = alarm.data.getClient('data_type');
            deviceName = alarm.data.getClient('data_name');

        }
        detailData[it.util.i18n("ClientAlarmManager_Alarm_ID")] = alarmId || '';
        detailData[it.util.i18n("ClientAlarmManager_Alarm_device_alias")] = deviceName || '';
        detailData[it.util.i18n("ClientAlarmManager_Alarm_device_ID")] = dataId || '';
        detailData[it.util.i18n("ClientAlarmManager_Asset_type")] = dataType || '';
        detailData[it.util.i18n("ClientAlarmManager_Alarm_category")] = alarmType || '';
        detailData[it.util.i18n("ClientAlarmManager_Alarm_level")] = this.translateLevel(level) || '';
        var extend = alarm.data.client;
        if (extend) {
            // detailData[" "]= "---------------扩展字段---------------";
            if (typeof (extend) === 'string') {
                var key = it.util.i18n("ClientAlarmManager_Extend");
                $.extend(detailData, { key: extend });
            } else {
                $.extend(detailData, extend);
            }
        }
        detailData[it.util.i18n("ClientAlarmManager_Alarm_time")] = alarmTime || '';
        detailData[it.util.i18n("ClientAlarmManager_Alarm_description")] = description || '';
        detailData[it.util.i18n("ClientAlarmManager_Confirm_content")] = alarm_ack_notice || '';
        detailData[it.util.i18n("ClientAlarmManager_Confirm_time")] = alarm_ack_time || '';

        //创建表格
        var $alarmDetailDialog = $('.alarmDetailDialog');
        if (!$alarmDetailDialog.length) {
            $alarmDetailDialog = $('<div class="alarmDetailDialog"></div>').appendTo($('.dialog-box'));
        }
        $alarmDetailDialog.empty();
        var $alarmDetailTable = $('<table>').appendTo($alarmDetailDialog);

        $alarmDetailTable.bootstrapTable({
            columns: [],
            data: [],
            classes: 'table-no-bordered', //不要边框
            cache: false,
        });

        var rows = [];
        var columns = [{
                'field': 'alarmKey',
                'title': 'alarmKey'
            },
            {
                'field': 'alarmValue',
                'title': 'alarmValue'
            }
        ];
        for (key in detailData) {
            if (!detailData || !Object.keys(detailData).length) return;
            var row = {};
            row.alarmKey = key + ":";
            row.alarmValue = detailData[key];
            rows.push(row);
        }
        $alarmDetailTable.bootstrapTable('refreshOptions', {
            data: rows,
            columns: columns
        });
        var w = document.body.clientWidth,
            nw;
        if (w < 1440) {
            nw = '290px';
        } else {
            nw = '320px';
        }
        $alarmDetailDialog.dialog({
            appendTo: ".dialog-box",
            blackStyle: true,
            width: nw,
            height: 'auto',
            title: it.util.i18n("ClientAlarmManager_Alarm_detail"),
            autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
            show: '', //显示弹窗出现的效果，slide为滑动效果
            hide: '', //显示窗口消失的效果，explode为爆炸效果
            resizable: false, //设置是否可拉动弹窗的大小，默认为true
            modal: true, //是否有遮罩模型
            close: function () {
                $('.alarmDetailDialog').remove();
            }
        });
        $alarmDetailDialog.dialog('open');
        $alarmDetailTable.find('thead').css("display", "none");
        $alarmDetailTable.find('tbody td').css({
            "border": "none",
            "padding": "1px 1px",
            "font-size": "13px",
            "font-weight": "700",
            "padding-left": "10px"
        });



    },

    translateLevel: function (level) {
        if (level === undefined || level === null) return;
        var severity = it.AlarmSeverity.getByName(level);
        if (!severity) {
            return "";
        }
        return severity.displayName;
    },

    toggleDatePicker: function (picker) {
        var showDateTimePicker,
            firstFocus;
        picker.on('focus', function (event) {
            showDateTimePicker = true;
            firstFocus = true;
        });

        picker.on('blur', function (event) {
            showDateTimePicker = false;
        });

        picker.on('click', function (event) {
            if (firstFocus) {
                firstFocus = false;
                return;
            }
            if (showDateTimePicker) {
                picker.datetimepicker('hide');
            } else {
                picker.datetimepicker('show');
            }
            showDateTimePicker = showDateTimePicker ? false : true;
        });
    },

    initPlaceholder: function () {
        var date = new Date(),
            y = date.getFullYear(),
            m = date.getMonth() >= 10 ? date.getMonth() : '0' + date.getMonth(),
            d = date.getDate() >= 10 ? date.getDate() : '0' + date.getDate(),
            time = y + '-' + m + '-' + d + ' ';
        return time;
    },

    showListDialog: function (options) {

        var self = this;
        options = options || {};
        var alarmListDialog = $('#alarmListDialog');
        this.setBoxModel(alarmListDialog, options);

        alarmListDialog.dialog('open');
        setTimeout(function () {
            self.queryListDialog(1);
        }, 100)
    },

    queryListDialog: function (pageIndex) {

        var self = this;
        var alarmListDialog = $('#alarmListDialog');
        if (!pageIndex) {
            pageIndex = alarmListDialog.find('.pagerBox').pager('currPage');
        }
        var pageSize = alarmListDialog.find('.pagerBox').pager('pageSize');
        var searchBox = alarmListDialog.find('.searchBox');
        var model = this.getBoxModel(searchBox, { pageIndex: pageIndex, pageSize: pageSize });

        ServerUtil.api('alarm_log', 'searchDetailCount', model, function (totalCount) {
            ServerUtil.api('alarm_log', 'searchDetail', model, function (alarms) {
                alarmListDialog.find('.pagerBox').pager('options', {
                    totalCount: totalCount[0].count,
                    currPage: pageIndex
                });
                self.alarmList = alarms;
                if (!self.alarmLogTable) {
                    self.createTable();
                }
                self.refreshListDialog(self.alarmList);
            });
        });

    },

    refreshListDialog: function (alarmList) {

        this.alarmLogBox.clear();
        if (alarmList) {
            for (var i = 0; i < alarmList.length; i++) {
                var alarm = alarmList[i]
                var node = new twaver.Node();

                for (var attribute in alarm) {
                    if (attribute === "alarm_type_id") {
                        node.setClient("alarm_type_id", alarm.alarm_type_id);
                        var alarmType = this.alarmManager._alarmTypeMap[alarm.alarm_type_id];
                        node.setClient("alarm_type", alarmType ? alarmType._name : alarm.alarm_type_id);
                        // node.setClient("alarm_type", this.alarmManager._alarmTypeMap[alarm.alarm_type_id]._name);
                    } else if (attribute === "level") {
                        var level = alarm.level || 'critical';
                        var severity = it.AlarmSeverity.getByName(level);
                        //node.setClient("level", severity ? severity.displayName : "");
                        node.setClient("level", severity ? { displayName: severity.displayName, color: severity.color } : "");
                        node.setClient("levelKey", level);
                    } else if (attribute === "alarm_time") {
                        node.setClient("alarm_time", this.formateDateTime(alarm.alarm_time));
                    } else if (attribute === "alarm_ack_time") {
                        node.setClient("alarm_ack_time", this.formateDateTime(alarm.alarm_ack_time));
                    } else if (attribute === "alarm_clear_time") {
                        node.setClient("alarm_clear_time", this.formateDateTime(alarm.alarm_clear_time));
                    }
                    // else if(attribute === 'status') {
                    //     node.setClient('alarmStatus', alarm.status);
                    // }
                    else if (attribute === 'name') {
                        node.setClient('data_name', alarm.name);
                    } else if (attribute === 'client') {
                        var client = alarm.client;
                        if (client && typeof client == 'string') {
                            try {
                                client = JSON.parse(client);
                            } catch (error) {
                                console.error(error);
                                client = {};
                            }
                        }
                        node.client = client;
                        for (var key in client) {
                            node.setClient(key, client[key]);
                        }
                    } else {
                        node.setClient(attribute, alarm[attribute]);
                    }
                }
                if (alarm.status == 'confirmed') {
                    node.setClient('alarm_status', it.util.i18n("ClientAlarmManager_Have_Confirm"));
                } else {
                    node.setClient('alarm_status', it.util.i18n("ClientAlarmManager_Not_Confirm"));
                }
                // node.setClient('data_type', "机柜");
                this.alarmLogBox.add(node);
            }
        }

        var alarmListDialog = $('#alarmListDialog');

        function move2center() {
            alarmListDialog.parent().position({
                of: $(document),
                my: 'center center',
                at: 'center center',
                collision: 'none none'
            });
        }

        if (alarmListDialog.hasClass('init')) {

            alarmListDialog.removeClass('init');
            setTimeout(function () {
                move2center();
            }, 100);
        }

    },

    initOperationDialog: function () {

        var self = this;
        var alarmOperationDialog = $('#alarmOperationDialog');
        alarmOperationDialog.dialog({ //创建dialog弹窗
            width: '400',
            height: 'auto',
            title: it.util.i18n("ClientAlarmManager_Alarm_confirm"),
            closeOnEscape: false,
            show: false,
            hide: false,
            autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
            resizable: false, //设置是否可拉动弹窗的大小，默认为true
            modal: true, //是否有遮罩模型
            open: function (event) {

            },
            buttons: [ //定义两个button按钮
                {
                    text: it.util.i18n("ClientAlarmManager_Sure"),
                    click: function () {
                        var operation = alarmOperationDialog.find('.operation').val();
                        var alarmId = alarmOperationDialog.find('.alarmId').val();
                        var notice = alarmOperationDialog.find('.notice').val();
                        var alarmRtId = alarmOperationDialog.find('.alarmRtId').val();
                        var target = alarmOperationDialog.find('.target').val();
                        var alarmTypeId = alarmOperationDialog.find('.alarmTypeId').val();
                        // var formData = {
                        //     id: alarmId,
                        //     ack_notice: notice,
                        //     alarm_description: notice,
                        //     target: target,
                        //     rtId: alarmRtId,
                        //     alarmTypeId: alarmTypeId
                        // };
                        var alarmFormData, alarmLogFormData;
                        var formatDate = self.formateDateTime(new Date());
                        if (operation === "ackAlarm") {
                            alarmFormData = {
                                value: {
                                    ackTime: formatDate,
                                    ackNotice: notice
                                },
                                options: {
                                    id: parseInt(alarmId),
                                }
                            };
                            alarmLogFormData = {
                                value: {
                                    alarmAckTime: formatDate,
                                    alarmAckNotice: notice,
                                },
                                options: {
                                    alarm_id: parseInt(alarmId),
                                }
                            };
                            ServerUtil.api('alarm', 'update', alarmFormData, function (data) {
                                ServerUtil.api('alarm_log', 'update', alarmLogFormData, function (data) {
                                    if (data.error) {
                                        alertUtil.error(data.error);
                                    }
                                    alarmOperationDialog.dialog('close');
                                    self.queryListDialog();
                                });
                            });
                        } else if (operation === "clearAlarm") {
                            alarmFormData = {
                                id: parseInt(alarmId)
                            };
                            alarmLogFormData = {
                                value: {
                                    alarmClearTime: formatDate,
                                    alarmDescription: notice,
                                },
                                options: {
                                    alarm_id: parseInt(alarmId),
                                }
                            };
                            ServerUtil.api('alarm', 'remove', alarmFormData, function (data) {
                                ServerUtil.api('alarm_log', 'update', alarmLogFormData, function (data) {
                                    if (data.error) {
                                        alertUtil.error(data.error);
                                    } else {
                                        // main.realTimeManager.app.alarmClear();
                                    }
                                    alarmOperationDialog.dialog('close');
                                    self.queryListDialog();
                                });
                            });
                        }
                    }
                },
                {

                    text: it.util.i18n("ClientAlarmManager_Cancel"),
                    click: function () {
                        alarmOperationDialog.dialog('close');
                    }
                }
            ]
        });
        var dialogUI = alarmOperationDialog.closest('.ui-dialog');
        dialogUI.find('.ui-dialog-titlebar-close').hide();
        dialogUI.find('.ui-dialog-buttonpane .ui-button').css('margin', '3px 3px 3px 5px');
        dialogUI.find('.ui-dialog-buttonpane').css('padding', '3px 10px 3px 3px');
    },

    showOperationDialog: function (alarmInfo) {
        var alarmOperationDialog = $('#alarmOperationDialog');
        alarmOperationDialog.dialog('option', 'title', alarmInfo.operation == 'clearAlarm' ? it.util.i18n("ClientAlarmManager_Alarm_clear") : it.util.i18n("ClientAlarmManager_Alarm_confirm"))
        alarmOperationDialog.find('.alarmId').val(alarmInfo.id);
        // alarmOperationDialog.find('.alarmRtId').val(alarmInfo.rt_id);
        alarmOperationDialog.find('.operation').val(alarmInfo.operation);
        alarmOperationDialog.find('.target').val(alarmInfo.data_id);
        alarmOperationDialog.find('.alarmTypeId').val(alarmInfo.alarm_type_id);
        alarmOperationDialog.find('.desc').text(alarmInfo.description);
        alarmOperationDialog.find('.notice').val("");
        alarmOperationDialog.dialog('open');
    }

});

/*
 it.AlarmConfigDialog = function () {
 this.initConfigDialog();
 };

 mono.extend(it.AlarmConfigDialog, Object, {
 initConfigDialogValue: function (config) {
 var temperatureValues = [config.temp_low, config.temp_high];
 var humidityValues = [config.hum_low, config.hum_high];
 $(".temperatureSlider").slider('values', temperatureValues);
 $(".humiditySlider").slider('values', humidityValues);
 },

 initConfigDialog: function () {
 var self = this;
 var alarmConfigDialog = $('#alarmConfigDialog');
 alarmConfigDialog.dialog({   //创建dialog弹窗
 blackStyle: true,
 width: '500',
 height: 'auto',
 title: '温湿度告警设置',
 closeOnEscape: false,
 autoOpen: false,     //初始化之后，是否立即显示对话框，默认为 true
 show: '',       //显示弹窗出现的效果，slide为滑动效果
 hide: '',     //显示窗口消失的效果，explode为爆炸效果
 resizable: false,    //设置是否可拉动弹窗的大小，默认为true
 modal: true,         //是否有遮罩模型
 open: function (event) {
 var dialogUI = alarmConfigDialog.closest('.ui-dialog');
 dialogUI.find('.ui-dialog-titlebar-close').hide();
 dialogUI.find('.ui-dialog-buttonpane .ui-button').css('margin', '3px 3px 3px 5px');
 dialogUI.find('.ui-dialog-buttonpane .ui-button').eq(0).css('margin-right', '20px');
 },
 buttons: [
 {
 text: "系统默认值",
 click: function () {
 self.initConfigDialogValue({
 id: 'system',
 temp_low: 10,
 temp_high: 30,
 hum_low: 40,
 hum_high: 70
 });
 }
 },
 {
 text: "确定",
 click: function () {
 var temperatureValues = $(".temperatureSlider").slider('values');
 var humidityValues = $(".humiditySlider").slider('values');
 var formData = {
 value:{
 temp_alarm_config: jsonUtil.object2String({
 min: temperatureValues[0],
 max: temperatureValues[1]
 }),
 hum_alarm_config: jsonUtil.object2String({
 min: humidityValues[0],
 max: humidityValues[1]
 })
 },
 options:{
 id: 'system',
 }
 };
 ServerUtil.api('config', 'update', formData, function (data) {
 if (data.error) {
 alertUtil.error(data.error);
 } else {
 alarmConfigDialog.dialog('close');
 // main.realTimeManager.app.alarmConfig();
 }
 });
 }
 },
 {
 text: "取消",
 click: function () {
 if (self.alarmConfigDirty) {
 alertUtil.confirm({
 message: '您已修改界面，取消将导致本次修改无效，继续取消？',
 callback: function (b) {
 b && alarmConfigDialog.dialog('close');
 }
 });
 } else {
 alarmConfigDialog.dialog('close');
 }
 }
 }
 ]
 });
 var slider, box, values, limit = [0, 100];
 slider = $(".temperatureSlider");
 slider.slider({
 range: true,
 min: limit[0],
 max: limit[1],
 margin: 1,
 values: [10, 30],
 slide: function (event, ui) {
 if (ui.values[0] >= ui.values[1]) {
 return false;
 }
 var box = $(".temperatureSlider").parent();
 setValue(box, ui);
 },
 change: function (event, ui) {
 if (ui.values[0] >= ui.values[1]) {
 return false;
 }
 var box = $(".temperatureSlider").parent();
 setValue(box, ui);
 }
 });
 initSlider(slider);
 slider = $(".humiditySlider");
 slider.slider({
 range: true,
 min: limit[0],
 max: limit[1],
 margin: 1,
 values: [40, 70],
 slide: function (event, ui) {
 if (ui.values[0] >= ui.values[1]) {
 return false;
 }
 var box = $(".humiditySlider").parent();
 setValue(box, ui);
 },
 change: function (event, ui) {
 if (ui.values[0] >= ui.values[1]) {
 return false;
 }
 var box = $(".humiditySlider").parent();
 setValue(box, ui);
 }
 });
 initSlider(slider);

 function setValue(box, ui) {
 box.find('.lowValue').val(ui.values[0]).data('value', ui.values[0]);
 box.find('.highValue').val(ui.values[1]).data('value', ui.values[1]);
 self.alarmConfigDirty = true;
 }

 function initSlider(slider) {
 var box = slider.parent();
 var low = box.find('.lowValue');
 var high = box.find('.highValue');
 var values = slider.slider('values');
 low.val(values[0]);
 high.val(values[1]);
 low.data('value', values[0]);
 high.data('value', values[1]);
 box.find('input').on('change', function () {
 var lowValue = low.val().trim();
 var highValue = high.val().trim();
 if (lowValue == '' || highValue == '' || isNaN(lowValue) || isNaN(highValue)) {
 low.val(low.data('value'));
 high.val(high.data('value'));
 return false;
 }
 lowValue = parseInt(lowValue);
 highValue = parseInt(highValue);
 if (lowValue >= highValue || lowValue < 0 || highValue > 100) {
 low.val(low.data('value'));
 high.val(high.data('value'));
 return false;
 }
 low.data('value', lowValue);
 high.data('value', highValue);
 slider.slider('values', [lowValue, highValue]);
 });
 }
 },

 showConfigDialog: function () {
 var alarmConfigDialog = $('#alarmConfigDialog');
 var self = this;
 ServerUtil.api('config', 'search', {}, function (data) {
 if (data.error) {
 alertUtil.error(data.error);
 } else {
 var value = data[0];
 value.hum_alarm_config = value.hum_alarm_config || '{"min":40,"max":70}';
 value.temp_alarm_config = value.temp_alarm_config || '{"min":10,"max":30}';
 var hum = typeof(value.hum_alarm_config) == 'string'?jsonUtil.string2Object(value.hum_alarm_config):value.hum_alarm_config;
 var temp = typeof(value.temp_alarm_config) == 'string'?jsonUtil.string2Object(value.temp_alarm_config):value.temp_alarm_config;
 var config = {
 hum_low: hum.min,
 hum_high: hum.max,
 temp_low: temp.min,
 temp_high: temp.max
 }
 self.initConfigDialogValue(config);
 alarmConfigDialog.dialog('open');
 self.alarmConfigDirty = false;
 }
 });
 }
 });
 */


it.HistoryAlarmDialog = function () {
    this.alarmMainPane = $('<div class="history-alarm-main-panel it-shadow"></div>');
    this.btnclose = $('<div title="' + it.util.i18n("ClientAlarmManager_Close") + '" class="close"></div>');
    this.alarmContentPane = $('<div class="history-alarm-content-panel"></div>');
    this.box = new twaver.ElementBox();
    this.table = new it.AutoPackTable(this.box);
    this.tablePane = null;
    this.createTable();
    var self = this;
    if (window.dataJson && dataJson.alarmPaneDraggable) {
        this.alarmMainPane.draggable();
    }

    this.hide();
};
mono.extend(it.HistoryAlarmDialog, Object, {
    createColumn: function (table, name, propetyName, propertyType, valueType, width, renderCell) {
        var column = new twaver.Column(name);
        column.setName(name);
        column.setPropertyName(propetyName);
        column.setPropertyType(propertyType);
        if (valueType) {
            column.setValueType(valueType);
        }
        if (width) {
            column.setWidth(width);
        } else {
            column.setClient('pack', true);
        }
        column.renderHeader = function (div) {
            var span = document.createElement('span');
            span.style.whiteSpace = 'nowrap';
            span.style.verticalAlign = 'middle';
            span.style.padding = '1px 2px 1px 2px';
            span.innerHTML = column.getName() ? column.getName() : column.getPropertyName();
            if (span.innerHTML == it.util.i18n("ClientAlarmManager_Legend")) {
                span.innerHTML = '';
            }
            span.setAttribute('title', span.innerHTML);
            span.style.font = 'bold 12px Helvetica';
            div.style.textAlign = 'center';
            div.appendChild(span);
        };
        if (renderCell) {
            column.renderCell = renderCell;
        }
        table.getColumnBox().add(column);
        return column;
    },
    createColumns: function (table) {
        if (dataJson && dataJson.alarmTableColumns && dataJson.alarmTableColumns instanceof Array) {
            var columns = dataJson.alarmTableColumns;
            for (var i = 0; i < columns.length; i++) {
                var colObj = columns[i];
                var label = colObj.label;
                var property = colObj.property;
                var source = colObj.source || 'client';
                var type = colObj.type || "string";
                var width = colObj.width || 75;
                if (label && property) {
                    this.createColumn(table, label, property, source, type, width);
                }
            }
        } else {
            this.createColumn(table, it.util.i18n("ClientAlarmManager_Alarm_type"), 'alarmType', 'client', 'string', 75);
            this.createColumn(table, it.util.i18n("ClientAlarmManager_Alarm_IP"), 'dev_ip', 'client', 'string', 75);
            this.createColumn(table, it.util.i18n("ClientAlarmManager_Alarm_status"), 'alarmStatus', 'client', 'string', 75);
            this.createColumn(table, it.util.i18n("ClientAlarmManager_Alarm_create_time"), 'alarmTime', 'client', 'string', 130);
            this.createColumn(table, it.util.i18n("ClientAlarmManager_Alarm_info"), 'description', 'client', 'string', 100);
            this.createColumn(table, it.util.i18n("ClientAlarmManager_Alarm_level"), 'levelName', 'client', 'string', 75);
            this.createColumn(table, it.util.i18n("ClientAlarmManager_Alarm_device_type"), 'data_type', 'client', 'string', 75);
            this.createColumn(table, it.util.i18n("ClientAlarmManager_Alarm_device_name"), 'data_name', 'client', 'string', 75);
        }
        this.createColumn(table, it.util.i18n("ClientAlarmManager_Detail"), 'id', 'client', 'string', 135, renderDetailCell);
        var self = this;

        function renderDetailCell(params) {
            var div = params.div;
            var alarm = params.data;
            var data = null;
            self.clearAllChildren(div);
            var button = $('<button type="button" class="btn btn-default btn-sm fs10">' + it.util.i18n("ClientAlarmManager_Detail") + '</button>');
            button.appendTo($(div));
            button.mousedown(function (event) {
                self.showAlarmDetail(alarm, data);
            });
        }
    },
    clearAllChildren: function (div) {
        if (!div) {
            return;
        }
        var children = div.childNodes;
        if (children && children.length > 0) {
            for (var i = 0; i < children.length; i++) {
                var child = div.childNodes[i];
                div.removeChild(child);
            }
        }
    },
    initCellRendered: function () {
        var self = this;
        this.table.onCellRendered = function (params) {
            var div = params.div;
            var alarm = params.data;

            var data = null;
            if (alarm._clientMap.level) {
                level = alarm._clientMap.level;
            }
            var alarmSeverity = it.AlarmSeverity.getByName(level);
            var bgColor = '#ffffff'
            if (alarmSeverity) {
                alarm.setClient('levelName', alarmSeverity.displayName);
                // bgColor = alarmSeverity.color //历史告警无背景色变换
            }

            div.style.backgroundColor = bgColor;
            div.style.textAlign = 'center';
            div.style.color = "#0C0D0D";
            div.style.fontFamily = "Tahoma,Helvetica,Arial,\5b8b\4f53,sans-serif";
        };
    },
    showAlarmDetail: function (alarm, data) {
        var panel = $PropertyPane.getInstance();
        var detailData = {};
        var alarm = this[alarm];
        var alarmTypeName = main.sceneManager._alarmManager.getAlarmType(alarm.alarm_type_id)._name;
        detailData[it.util.i18n("ClientAlarmManager_Alarm_ID")] = alarm.alarm_id;
        detailData[it.util.i18n("ClientAlarmManager_Alarm_level")] = this.translateLevel(alarm.level);
        detailData[it.util.i18n("ClientAlarmManager_Alarm_description")] = alarm.alarm_description;
        detailData[it.util.i18n("ClientAlarmManager_Alarm_time")] = this.formateDateTime(alarm.alarm_time);
        detailData[it.util.i18n("ClientAlarmManager_Alarm_category")] = alarmTypeName;
        detailData[it.util.i18n("ClientAlarmManager_Alarm_device_ID")] = alarm.data_id;
        detailData[it.util.i18n("ClientAlarmManager_Alarm_device_alias")] = "";
        detailData[it.util.i18n("ClientAlarmManager_Alarm_IP")] = alarm.dev_ip;
        if (alarm.client && typeof alarm.client == 'string') {
            var extend = $.parseJSON(alarm.client);
        }
        if (extend) {
            if (typeof (extend) === 'string') {
                var key = it.util.i18n("ClientAlarmManager_Extend");
                $.extend(detailData, { key: extend });
            } else {
                $.extend(detailData, extend);
            }
        }
        panel.setData(detailData);
        layer.open({
            shade: 0,
            type: 1,
            title: it.util.i18n("ClientAlarmManager_Alarm_detail"),
            skin: 'layui-layer-rim', //加上边框
            area: ['500px', '300px'], //宽高
            content: panel.getRootConent(),
        });
    },
    createTable: function () {
        var titlePane = $('<div class="it-property-title"></div>');
        var title = $('<span id = "title">' + it.util.i18n("ClientAlarmManager_Alarm_info") + '</span>');
        titlePane.append(title);
        titlePane.append(this.btnDetail);
        titlePane.append(this.btnclose);
        this.alarmMainPane.append(titlePane);
        var self = this;
        this.btnclose.click(function () {
            self.alarmMainPane.hide();
            self.$filter.find('input').val(null);
        });

        this.tablePane = new twaver.controls.TablePane(this.table);
        var tableHeader = this.tablePane.getTableHeader().getView();
        tableHeader.style.backgroundColor = 'rgba(255,255,255,0.1)';
        var tableDom = this.tablePane.getView();
        tableDom.style.position = 'absolute';
        tableDom.style.top = '30px';
        tableDom.style.width = "710px"; //450
        tableDom.style.height = "150px";
        this.tableDom = tableDom;
        var text = '<div class="input-group" style="padding-left:10px;">' +
            '<span class="input-group-addon"></span>' +
            '<span >' + it.util.i18n("ClientAlarmManager_AlarmName") + ':</span>' +
            '<input type="text" class="form-control" style="width:150px;display:inline-block;margin-right:20px;" placeholder="' + it.util.i18n("ClientAlarmManager_Input_filter_alarmName") + '">' +
            '<span>' + it.util.i18n("ClientAlarmManager_Alarm_time") + ':</span>' +
            '<input class="w150 date history_alarm_time_min" style="width:150px;" name="history_alarm_time_min" placeholder="yyyy-mm-dd hh:ii:ss" value="">' +
            ' - ' +
            '<input class="w150 date history_alarm_time_max" style="width:150px;" name="history_alarm_time_max" placeholder="yyyy-mm-dd hh:ii:ss" value="">' +
            '<button class="history_alarm_time_button" style="margin-left:10px;">' + it.util.i18n("Search") + '</button>' +
            '</div>';

        this.$filter = $(text).appendTo(this.alarmContentPane);
        for (var i = 0; i < this.$filter.find('input').length; i++) {
            $(this.$filter.find('input')[i]).bind('input propertychange', function () {
                self.table.invalidateModel();
                self.table.invalidateDisplay();
            });
        }

        this.$filter.css("marginTop", '5px');
        this.alarmContentPane.append($(tableDom));
        this.alarmMainPane.append(this.alarmContentPane);
        document.body.appendChild(this.alarmMainPane[0]);
        this.createColumns(this.table);
        this.initCellRendered();
        this.table.getDataBox().getSelectionModel().isSelectable = function (data) {
            return false;
        };

        $(".history_alarm_time_min").datetimepicker({
            zIndex: 9999,
            weekStart: 1,
            language: 'zh-CN',
            format: 'yyyy-mm-dd hh:ii',
            autoclose: true,
            todayBtn: true,
            startView: 2,
            minView: 0
        }).on('changeDate', function (ev) {
            $(".history_alarm_time_max").datetimepicker('setStartDate', $(".history_alarm_time_min").val());
        })
        $(".history_alarm_time_max").datetimepicker({
            zIndex: 9999,
            weekStart: 1,
            language: 'zh-CN',
            format: 'yyyy-mm-dd hh:ii',
            autoclose: true,
            todayBtn: true,
            startView: 2,
            minView: 0
        }).on('changeDate', function (ev) {
            console.log(ev);
            $(".history_alarm_time_min").datetimepicker('setEndDate', $(".history_alarm_time_max").val());
        });
        $(".history_alarm_time_button").click(function () {
            self.queryHistoryAlarmList();
            self.refresh();
        });

        this._visibleFunction = function (data) {
            var alarm = self[data._id];
            var filter = $(self.$filter.find('input')[0]).val().trim();
            var filterMintime = $(self.$filter.find('input')[1]).val();
            var filterMaxtime = $(self.$filter.find('input')[2]).val();
            var alarmTypeName = main.sceneManager._alarmManager.getAlarmType(alarm.alarm_type_id)._name;
            if (filter && (alarmTypeName.indexOf(filter) < 0)) {
                return false;
            }
            if (filterMintime && (alarm.alarm_time.getTime() < Date.parse(filterMintime))) {
                return false;
            }
            if (filterMaxtime && (alarm.alarm_time.getTime() > Date.parse(filterMaxtime))) {
                return false;
            }
            return true;
        };
        this.table.setVisibleFunction(this._visibleFunction);
    },

    queryHistoryAlarmList: function () {
        this.clearData();
        var self = this;
        var dataId = $($(".it-property-title span")[0]).text().split(":")[1];
        ServerUtil.api('alarm_log', 'historyAlarm', { id: dataId }, function (alarms) {
            alarms.forEach(function (c, i) {
                if (!c.alarm_time.getTime) {
                    c.alarm_time = new Date(c.alarm_time);
                }
            })
            self.addData(alarms);
        });
    },

    addData: function (alarms) {
        var self = this;
        var node, alarmType;
        alarms.sort(function (a1, a2) {
            return a2.alarm_time.getTime() - a1.alarm_time.getTime();
        });
        for (var i = 0; i < alarms.length; i++) {
            self[alarms[i].alarm_id] = alarms[i];
            alarmType = main.sceneManager._alarmManager.getAlarmType(alarms[i].alarm_type_id)._name;
            node = new twaver.Node(alarms[i].alarm_id);
            node.setClient('alarmStatus', it.util.i18n("ClientAlarmManager_Have_Confirm"));
            node.setClient('alarmType', alarmType);
            node.setClient('level', alarms[i].level);
            node.setClient('description', alarms[i].description);
            node.setClient('alarmTime', self.formateDateTime(alarms[i].alarm_time));
            node.setClient('ackNotice', self.formateDateTime(alarms[i].alarm_ack_time));
            node.setClient('id', alarms[i].alarm_id);
            node.setClient('dataId', alarms[i].data_id);
            node.setClient('data_type', '');
            node.setClient('data_name', '');
            node.setClient('dev_ip', alarms[i].dev_ip);
            var client = alarms[i].client;
            if (client && typeof client == 'string') {
                try {
                    client = JSON.parse(client);
                } catch (error) {
                    console.error(error);
                    client = {};
                }
            }
            node.client = client;
            for (var key in client) {
                node.setClient(key, client[key]);
            }
            this.box.add(node);
        }
    },

    clearData: function () {
        this.box.clear();
    },

    formateDateTime: function (date) {
        if (!date) {
            return "";
            // }
            // if (typeof (date) == 'string') {
            //     var local = new Date(date);
            //     var utc = local.getTime() + local.getTimezoneOffset() * 60000;
            //     date = new Date(utc);
            // }
            // if (date instanceof Date) {
            //     return it.Util.formatDate(date, 'yyyy-MM-dd hh:mm:ss');
        } else {
            return date;
        }
    },

    show: function () {
        this.isShow = true;
        this.alarmMainPane.show();
        this.queryHistoryAlarmList();
        this.tablePane.invalidate();
        this.refresh();
    },

    refresh: function () {
        this.table.invalidateModel();
        this.table.invalidateDisplay();
    },

    hide: function () {
        this.isShow = false;
        this.alarmMainPane.hide();
    },

    getLevelColor: function (level) {
        var alarmSeverity = it.AlarmSeverity.getByName(level);
        if (alarmSeverity) {
            return alarmSeverity.color;
        } else {
            return '#00FF00';
        }
    },
    translateLevel: function (level) {
        if (level === undefined || level === null) return;
        var severity = it.AlarmSeverity.getByName(level);
        if (!severity) {
            return "";
        }
        return severity.displayName;
    }

});