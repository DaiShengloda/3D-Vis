var ImportLinkPage = main.ImportLinkPage = function (data, parent) {
    ImportLinkPage.superClass.constructor.call(this, [{
        name: 'id',
        text: it.util.i18n("Admin_ImportLinkPage_ID"),
    }, {
        name: 'name',
        text: it.util.i18n("Admin_ImportLinkPage_Name")
    }, {
        name: 'dataTypeId',
        text: it.util.i18n("Admin_ImportLinkPage_Type")
    }, {
        name: 'fromId',
        text: it.util.i18n("Admin_ImportLinkPage_Device_P1_ID")
    }, {
        name: 'fromPortId',
        text: it.util.i18n("Admin_ImportLinkPage_Port_P1_ID")
    }, {
        name: 'toId',
        text: it.util.i18n("Admin_ImportLinkPage_Device_P2_ID")
    }, {
        name: 'toPortId',
        text: it.util.i18n("Admin_ImportLinkPage_Port_P2_ID")
    }, {
        name: 'description',
        text: it.util.i18n("Admin_ImportLinkPage_Description")
    }
    ]);
    this._data = data;
    this._parent = parent;
    this._name = this._data.text;
    it.util.loadDataTypes();
};

mono.extend(ImportLinkPage, ImportExcel, {

    init: function () {

        var self = this;
        var panel = this.panel = $('<div class="tab_contentPanel"></div>').appendTo(this._parent);
        var toolbar = this.toolbar = $('<div class="toolbar"></div>').appendTo(panel);
        var downloadBtn = this.downloadBtn = $('<button class="download btn btn-link">'+it.util.i18n("Admin_ImportLinkPage_Download_template")+'</button>').appendTo(toolbar);
        downloadBtn.on('click', function () {
            window.open('/resource/excel/'+it.util.i18n("Admin_ImportLinkPage_Import_Template")+'.xlsx');
        })


        var fileInput = this.fileInput = $('<label for="import-link-input">'+it.util.i18n("Admin_ImportLinkPage_Select_file")+'</label><input id="import-link-input" type="file" class="file"/>').appendTo(toolbar);
        fileInput.css('display', 'inline');

        var submitBtn = this.submitBtn = $('<button class="submit btn btn-default">'+it.util.i18n("Admin_ImportLinkPage_Save")+'</button>').appendTo(toolbar);
        submitBtn.on('click', function () {
            self.submit();
        });

        var content = this.content = $('<div class="content"></div>').appendTo(panel);
        var addTable = this.table = $('<table class="table table-striped table-bordered"></table>').appendTo(content);
        var updateTable = this.table = $('<table class="table table-striped table-bordered"></table>').appendTo(content);
        var columns = this.fields.map(function (item) {
            return {title: item.text, name: item.name, data: item.name, type: item.type, defaultContent: ''};
        });
        columns.splice(0, 0, {title: it.util.i18n("Admin_ImportLinkPage_Status"), name: 'status', data: 'status', type: 'string'});
        var dataTable = this.dataTable = this.table.DataTable({
            columns: columns,
            buttons: [],
            paging: false,
            searching: false,
        });
        this.addExcelFileListener(fileInput);
    },

    validate: function (sheet, rowIndex, item) {

        if (!item.id || item.id.trim().length == 0) {
            return it.util.i18n("Admin_ImportLinkPage_ID_not_null").format({
                sheet: sheet,
                rowIndex: rowIndex,
            })
        }
        if (!item.fromId || item.fromId.trim().length == 0) {
            return it.util.i18n("Admin_ImportLinkPage_Device_P1_ID_not_null").format({
                sheet: sheet,
                rowIndex: rowIndex,
            })
        }
        if (!item.toId || item.toId.trim().length == 0) {
            return it.util.i18n("Admin_ImportLinkPage_Device_P2_ID_not_null").format({
                sheet: sheet,
                rowIndex: rowIndex,
            })
        }
    },

    handleFiles: function (result) {
        var self = this;
        this.dataTable.clear().draw();
        it.util.adminApi('link', 'search', {}, function (links) {
            var map = {};
            links.forEach(function (item) {
                map[item.id] = item;
            })
            result.forEach(function (item) {

                //TODO 这里以后可以放开,放用户选择是整个覆盖,还是更新原有信息
                if (map[item.id]) {

                    item.status = it.util.i18n("Admin_ImportLinkPage_Update");
                    item.dataTypeId = item.dataTypeId || map[item.id].dataTypeId;
                    item.description = item.description || map[item.id].description;

                } else {
                    item.status = it.util.i18n("Admin_ImportLinkPage_Add");
                }
                //如果不存在,使用默认模型
                if (!item.dataTypeId) {
                    item.dataTypeId = 'link'
                }
                if (it.util.dataTypeMap && !it.util.dataTypeMap[item.dataTypeId]) {
                    item.dataTypeId = 'link';
                }
                if (!item.fromPortId || item.fromPortId.trim().length == 0) {
                    item.fromPortId = '';
                }
                if (!item.toPortId || item.toPortId.trim().length == 0) {
                    item.toPortId = '';
                }
                if (!item.name || item.name.trim().length == 0) {
                    item.name = "{fromId}[{fromPortId}]-{toId}[{toPortId}]".format(item)
                }
            })
            self.dataTable.rows.add(result).draw();
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
            item.location = {"x": "center", "y": item.loc, "z": "pos_pos"};
            result.push(item);
        }
        //console.log(data);
        it.util.adminApi('link', 'batchAddOrUpdate', result, function () {
            it.util.showMessage(it.util.i18n("Admin_ImportLinkPage_Save_success"));
        });
    },
});