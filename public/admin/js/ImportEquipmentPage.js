var ImportEquipmentPage = main.ImportEquipmentPage = function (data, parent) {
    ImportEquipmentPage.superClass.constructor.call(this, [{
        name: 'id',
        text: it.util.i18n("Admin_ImportEquipmentPage_ID")
    }, {
        name: 'name',
        text: it.util.i18n("Admin_ImportEquipmentPage_Name")
    }, {
        name: 'dataTypeId',
        text: it.util.i18n("Admin_ImportEquipmentPage_Type")
    }, {
        name: 'parentId',
        text: it.util.i18n("Admin_ImportEquipmentPage_Rack_ID")
    }, {
        name: 'loc',
        text: it.util.i18n("Admin_ImportEquipmentPage_Position"),
        type: 'num'
    }, {
        name: 'description',
        text: it.util.i18n("Admin_ImportEquipmentPage_Description")
    }, {
        name: 'height',
        text: it.util.i18n("Admin_ImportEquipmentPage_Height")
    }
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

mono.extend(ImportEquipmentPage, ImportExcel, {

    init: function () {


        var self = this;
        var panel = this.panel = $('<div class="tab_contentPanel"></div>').appendTo(this._parent);
        var toolbar = this.toolbar = $('<div class="toolbar"></div>').appendTo(panel);
        var downloadBtn = this.downloadBtn = $('<button class="download btn btn-link">'+it.util.i18n("Admin_ImportEquipmentPage_Download_template")+'</button>').appendTo(toolbar);
        downloadBtn.on('click', function () {
            window.open('/resource/excel/'+it.util.i18n("Admin_ImportEquipmentPage_Import_template")+'.xlsx');
        })


        var fileInput = this.fileInput = $('<label for="import-equipment-input">'+it.util.i18n("Admin_ImportEquipmentPage_Select_file")+'</label><input id="import-equipment-input" type="file" class="file"/>').appendTo(toolbar);
        fileInput.css('display', 'inline');

        var submitBtn = this.submitBtn = $('<button class="submit btn btn-default">'+it.util.i18n("Admin_ImportEquipmentPage_Save")+'</button>').appendTo(toolbar);
        submitBtn.on('click', function () {
            self.submit();
        })

        //var modelInput = this.modelInput = $('<input id="model-input" type="checkbox"><label for="model-input">更新</label>').appendTo(toolbar);
        //modelInput.on('change', function () {
        //    if(modelInput.prop('checked')){
        //        modelInput.text('更新');
        //    }else{
        //        modelInput.text('覆盖');
        //    }
        //})
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
        if (!isNaN(parseInt(item.height))) {
            item.height = parseInt(item.height);
        } else {
            item.height = null;
        }
        if (item && item.loc && (item.loc + '').indexOf('-') >= 0) {
            var array = (item.loc + '').split('-');
            item.loc = array[0];
            if (!item.height) {
                item.height = parseInt(array[1]) - parseInt(array[0]) + 1;
            }
        }
        if (item.loc) {
            item.loc = parseInt(item.loc);
            if (isNaN(item.loc)) {
                return it.util.i18n("Admin_ImportEquipmentPage_Integer_limited").format({
                    sheet: sheet,
                    rowIndex: rowIndex,
                    loc: item.loc
                })
            }
            if (item.loc < 0) {
                return it.util.i18n("Admin_ImportEquipmentPage_Positive_limited").format({
                    sheet: sheet,
                    rowIndex: rowIndex,
                    loc: item.loc
                })
            }
        }
    },

    handleFiles: function (result) {
        var self = this;
        this.dataTable.clear().draw();
        it.util.loadDataByCategoryId('equipment', function (map, array) {
            result.forEach(function (item) {

                //TODO 这里以后可以放开,放用户选择是整个覆盖,还是更新原有信息
                if (map[item.id]) {

                    item.status = it.util.i18n("Admin_ImportEquipmentPage_Update");
                    item.dataTypeId = item.dataTypeId || map[item.id].dataTypeId;
                    item.parentId = item.parentId || map[item.id].parentId;
                    if (!item.loc && map[item.id].location) {
                        item.loc = map[item.id].location.y || 0;
                    }
                    item.description = item.description || map[item.id].description;

                } else {
                    item.status = it.util.i18n("Admin_ImportEquipmentPage_Add");
                }
                //如果不存在,使用默认模型
                if(!item.dataTypeId){
                    item.dataTypeId = 'equipment' + item.height;
                }
                item.dataTypeId = item.dataTypeId.replaceAll('  ', ' ');
                item.dataTypeId = item.dataTypeId.replaceAll(' ', '-');
                // item.dataTypeId = item.dataTypeId.toLowerCase();
                // if (it.util.dataTypeMap && !it.util.dataTypeMap[item.dataTypeId]) {
                //     item.dataTypeId = 'equipment' + item.height;
                // }
                if (!it.util.dataTypeMapLowerCase || !it.util.dataTypeMapLowerCase[item.dataTypeId.toLowerCase()]) {
                    item.dataTypeId = 'equipment' + item.height;
                }else{
                     item.dataTypeId = it.util.dataTypeMapLowerCase[item.dataTypeId.toLowerCase()].id;
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
        it.util.adminApi('data', 'batchAddOrUpdate', result, function () {
            it.util.showMessage(it.util.i18n("Admin_ImportEquipmentPage_Save_success"));
        });
    },
});