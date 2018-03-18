var ImportPortPage = main.ImportPortPage = function (data, parent) {
    ImportPortPage.superClass.constructor.call(this, [{
        name: 'id',
        text: it.util.i18n("id")
    }, {
        name: 'portNum',
        text: it.util.i18n("portNum")
    }, {
        name: 'side',
        text: it.util.i18n("side")
    }, {
        name: 'portStatus',
        text: it.util.i18n("portStatus")
    },{
        name: 'portId',
        text: it.util.i18n("portId")
    },
    ]);
    this._data = data;
    this._parent = parent;
    this._name = this._data.text;
    it.util.loadDataTypes(function(){
        it.util.dataTypeMapLowerCase = {};
        var map = it.util.dataTypeMap;
       for(var i in map){
            it.util.dataTypeMapLowerCase[i.toLowerCase()] = map[i];
       }
    });
};

mono.extend(ImportPortPage, ImportExcel, {

    init: function () {
        var self = this;
        var panel = this.panel = $('<div class="tab_contentPanel"></div>').appendTo(this._parent);
        var toolbar = this.toolbar = $('<div class="toolbar"></div>').appendTo(panel);
        var downloadBtn = this.downloadBtn = $('<button class="download btn btn-link">'+it.util.i18n("Admin_ImportEquipmentPage_Download_template")+'</button>').appendTo(toolbar);
        downloadBtn.on('click', function () {
            window.open('/resource/excel/'+it.util.i18n("Admin_ImportPortPage_Import_template")+'.xlsx');
        })


        var fileInput = this.fileInput = $('<label for="import-equipment-input">'+it.util.i18n("Admin_ImportPortPage_Select_file")+'</label><input id="import-equipment-input" type="file" class="file"/>').appendTo(toolbar);
        fileInput.css('display', 'inline');

        var submitBtn = this.submitBtn = $('<button class="submit btn btn-default">'+it.util.i18n("Admin_ImportEquipmentPage_Save")+'</button>').appendTo(toolbar);
        submitBtn.on('click', function () {
            self.submit();
        })

        var content = this.content = $('<div class="content"></div>').appendTo(panel);
        var addTable = this.table = $('<table class="table table-striped table-bordered"></table>').appendTo(content);
        var updateTable = this.table = $('<table class="table table-striped table-bordered"></table>').appendTo(content);
        var columns = this.fields.map(function (item) {
            return {title: item.text, name: item.name, data: item.name, type: item.type, defaultContent: ''};
        });
        columns.splice(0, 0, {title: it.util.i18n("Admin_ImportEquipmentPage_Status"), name: 'status', data: 'status', type: 'string'});
        var dataTable = this.dataTable = this.table.DataTable({
            columns: columns,
            buttons: [],
            paging: false,
            searching: false,
        })
        this.addExcelFileListener(fileInput);
    },

    validate: function (sheet, rowIndex, item) {
        if(!item.id || item.id.trim().length == 0) {
            return it.util.i18n("Admin_ImportPortPage_Id_not_null").format({
                sheet: sheet,
                rowIndex: rowIndex,
            });
        }
        if(!item.portNum || item.portNum.trim().length ==0) {
            return it.util.i18n("Admin_ImportPortPage_portNum_not_null").format({
                sheet: sheet,
                rowIndex: rowIndex,
            });
        }

    },

    handleFiles: function (result) {
        var self = this;
        this.dataTable.clear().draw();

        it.util.loadDataByCategoryId('port', function (map, array) {
            result.forEach(function (item) {
                //当设备编号存在且端口编号存在时属于更新
                if(map[item.id] && map[item.id]) {
                    item.status = it.util.i18n("Admin_ImportPortPage_Update");
                }else {
                    item.status = it.util.i18n("Admin_ImportPortPage_Add");
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
            // item.location = {"x": "center", "y": item.loc, "z": "pos_pos"};
            result.push(item);
        }
        it.util.adminApi('port', 'batchAddOrUpdate', result, function () {
            it.util.showMessage(it.util.i18n("Admin_ImportPortPage_Save_success"));
        });
    },
});