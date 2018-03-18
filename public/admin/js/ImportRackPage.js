var ImportRackPage = main.ImportRackPage = function (data, parent) {
    ImportRackPage.superClass.constructor.call(this, [{
        name: 'id',
        text: it.util.i18n("Admin_ImportRackPage_ID")
    }, {
        name: 'dataTypeId',
        text: it.util.i18n("Admin_ImportRackPage_Type")
    }, {
        name: 'channelId',
        text: it.util.i18n("Admin_ImportRackPage_Channel_ID")
    }, {
        name: 'loc',
        text: it.util.i18n("Admin_ImportRackPage_Channel_location")
    }, {
        name: 'roomId',
        text: it.util.i18n("Admin_ImportRackPage_Room_ID")
    }, {
        name: 'x',
        text: it.util.i18n("Admin_ImportRackPage_PositionX")
    }, {
        name: 'y',
        text: it.util.i18n("Admin_ImportRackPage_PositionY")
    }
    ]);
    this._data = data;
    this._parent = parent;
    this._name = this._data.text;
};

mono.extend(ImportRackPage, ImportExcel, {

    init: function () {


        var self = this;
        var panel = this.panel = $('<div class="tab_contentPanel"></div>').appendTo(this._parent);
        var toolbar = this.toolbar = $('<div class="toolbar"></div>').appendTo(panel);
        var downloadBtn = this.downloadBtn = $('<button class="download btn btn-link">'+it.util.i18n("Admin_ImportRackPage_Download_template")+'</button>').appendTo(toolbar);
        downloadBtn.on('click', function () {
            window.open('/resource/excel/'+it.util.i18n("Admin_ImportRackPage_Import_template")+'.xlsx');
        })
        var fileInput = this.fileInput = $('<label for="import-rack-input">'+it.util.i18n("Admin_ImportRackPage_Select_file")+'</label><input id="import-rack-input" type="file" class="file"/>').appendTo(toolbar);
        fileInput.css('display', 'inline');

        var submitBtn = this.submitBtn = $('<button class="submit btn btn-default">'+it.util.i18n("Admin_ImportRackPage_Save")+'</button>').appendTo(toolbar);
        submitBtn.on('click', function () {
            self.submit();
        })
        var content = this.content = $('<div class="content"></div>').appendTo(panel);
        var table = this.table = $('<table class="table table-striped table-bordered"></table>').appendTo(content);
        var columns = this.fields.map(function (item) {
            return {title: item.text, name: item.name, data: item.name, defaultContent: ''};
        });
        columns.splice(0, 0, {title: it.util.i18n("Admin_ImportRackPage_Status"), name: 'status', data: 'status', type: 'string'});
        var dataTable = this.dataTable = this.table.DataTable({
            columns: columns,
            buttons: [],
            paging: false,
            searching: false,
        })

        this.addExcelFileListener(fileInput);
    },

    validate: function (sheet, rowIndex, item) {
        if (item.loc) {
            if (!(/\d{1,2}-\d{1,2}/.test(item.loc))) {
                return it.util.i18n("Admin_ImportRackPage_Position_error").format({
                    sheet: sheet,
                    rowIndex: rowIndex
                })
            }
            var array = item.loc.split('-');
            if (parseInt(array[0]) < 0) {
                return it.util.i18n("Admin_ImportRackPage_Position_n_error").format({
                    sheet: sheet,
                    rowIndex: rowIndex
                })
            }
            if (parseInt(array[1]) < 0) {
                return it.util.i18n("Admin_ImportRackPage_Position_m_error").format({
                    sheet: sheet,
                    rowIndex: rowIndex
                })
            }
            item.loc = parseInt(array[0]) + '-' + parseInt(array[1]);
        } else {
            item.loc = null;
        }
        if (!isNaN(parseInt(item.x))) {
            item.x = parseInt(item.x)
        } else {
            item.x = null;
        }
        if (!isNaN(parseInt(item.y))) {
            item.y = parseInt(item.y)
        } else {
            item.y = null;
        }
    },

    handleFiles: function (result) {
        var self = this;
        it.util.loadDataTypes(function () {
            it.util.loadDataByCategoryId(['rack', 'channel', 'room', 'floor'], function (map, array) {
                result.forEach(function (item) {
                    //TODO 这里以后可以放开,放用户选择是整个覆盖,还是更新原有信息
                    //TODO 处理位置, 可能是逻辑坐标,也可能是物理坐标
                    if (map[item.id]) {
                        var oldData = map[item.id];
                        if (oldData.location) {
                            oldData.location = it.util.s2o(oldData.location);
                        }
                        if (oldData.position) {
                            oldData.position = it.util.s2o(oldData.position);
                        }
                        it.util.parseDataPositionAndLocation(oldData);
                        item.status = it.util.i18n("Admin_ImportRackPage_Update");
                        item.dataTypeId = item.dataTypeId || map[item.id].dataTypeId;
                        //如果没有填写通道编号,机房编号,取数据库的parentId字段值
                        if (!item.channelId && !item.roomId) {
                            var parentId = oldData.parentId;
                            if (map[parentId]) {
                                var parent = map[parentId];
                                var parentType = it.util.dataTypeMap[parent.dataTypeId];
                                if (parentType.categoryId == 'channel') {
                                    item.channelId = parentId;

                                } else {
                                    item.roomId = parentId;
                                }
                            }
                        }
                        //如果存在通道,地址显示成n-m, 否则显示为x,y方式
                        if (item.channelId) {
                            if (!item.loc) {
                                if (oldData.location) {
                                    item.loc = (oldData.location.z || 0) + '-' + (oldData.location.x || 0)
                                }
                            }
                        } else {
                            if (!item.x) {
                                if (oldData.location && oldData.location.x) {
                                    item.x = oldData.location.x;
                                } else if (oldData.position && oldData.position.x) {
                                    item.x = oldData.position.x;
                                }
                            }
                            if (!item.y) {
                                if (oldData.location && oldData.location.z) {
                                    item.y = oldData.location.z;
                                } else if (oldData.position && oldData.position.z) {
                                    item.y = oldData.position.z;
                                }
                            }
                        }
                    } else {
                        item.status = it.util.i18n("Admin_ImportRackPage_Add");
                    }
                })
                self.dataTable.rows.add(result).draw();
            });
        });

    },

    submit: function () {

        var data = this.dataTable.data();
        if (!data || data.length == 0) {
            it.util.showMessage('no data');
            return;
        }
        var result = [];
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            if (item.channelId && item.loc) {
                var array = item.loc.split('-');
                item.location = {x: array[0] || 0, y: 0, z: array[1] || 0}
            } else if (item.roomId) {
                item.position = {x: item.x || 0, y: 'floor-top', z: item.y || 0};
                item.location = {y: 'neg_neg'};
            }
            if (item.channelId && item.channelId.trim().length > 0) {
                item.parentId = item.channelId;
            } else if (item.roomId && item.roomId.trim().length > 0){
                item.parentId = item.roomId;
            }
            result.push(item);
        }
        //console.log(data);
        it.util.adminApi('data', 'batchAddOrUpdate', result, function () {
            it.util.showMessage(it.util.i18n("Admin_ImportRackPage_Save_success"));
        });
    },
});