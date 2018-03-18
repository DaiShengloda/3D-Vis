var ImportExtFieldPage = main.ImportExtFieldPage = function (data, parent) {
    ImportExtFieldPage.superClass.constructor.call(this, null);
    this._data = data;
    this._parent = parent;
    this._name = this._data.text;
    this.fields = [];
    it.util.loadDataTypes();   
};

mono.extend(ImportExtFieldPage, ImportExcel, {

    init: function () {

        var preColumns = this._data.columns;
        var self = this;
        var panel = this.panel = $('<div class="tab_contentPanel"></div>').appendTo(this._parent);
        var toolbar = this.toolbar = $('<div class="toolbar"></div>').appendTo(panel);
        var downloadBtn = this.downloadBtn = $('<button class="download btn btn-link">'+it.util.i18n("Admin_ImportLinkPage_Download_template")+'</button>').appendTo(toolbar);

        var fileInput = this.fileInput = $('<label for="import-link-input">'+it.util.i18n("Admin_ImportExtFieldPage_Select_file")+'</label><input id="import-link-input" type="file" class="file"/>').appendTo(toolbar);
        fileInput.css('display', 'inline');

        var submitBtn = this.submitBtn = $('<button class="submit btn btn-default">'+it.util.i18n("Admin_ImportExtFieldPage_Save")+'</button>').appendTo(toolbar);
        submitBtn.on('click', function () {
            self.submit();
        })

        var content = this.content = $('<div class="content"></div>').appendTo(panel);
        var table = this.table = $('<table class="table table-striped table-bordered"></table>').appendTo(content);
        var columns = [];
        preColumns.forEach(function(column){
            columns.push({title: column.columnName, name: column.columnName, data: column.columnName, defaultContent: ''});
        });
        columns.splice(0, 0, {title: '编号', name: 'id', data: 'id', type: 'string'});
        var dataTable = this.dataTable = this.table.DataTable({
            columns: columns,
            buttons: [],
            paging: false,
            searching: false,
        });

        var header = $('<thead></thead>');
        var tr = $('<tr role = "row"></tr>')
        columns.forEach(function(column){
            var th = $('<th>' + column.title + '</th>');
            tr.append(th);
            self.fields.push({'name': column.name, 'text': column.title});
        });
        header.append(tr);

        downloadBtn.on('click', function (event) {
            //self.writerXlsx();
            var text = self._data.text.replace('导入','')
            var name = '导入模板-' + text;
            //put all export data to values
            var values = [];
            //put one row data to value
            var value = [];
            //get all column name
            var columns = new twaver.List();
            $('th', header).each(function(i, th) {
                value.push($(th).text());
            });
            values.push(value);

            var options = { fileName: name, sheets: {} };
            options.sheets[name] = { data: values };
            util.export2excel(options);
            return false;
        });

        this.addExcelFileListener(fileInput);      
    },

    loadTable: function(category){
        this.category = category;
        this.content.empty();
        var self = this;
        // 通过category拿到列
        util.adminApi('data','getColumnsByCatetory',{'category': category},function(result){
            result = result || {};
            var cols = result.cols;
            if(!cols || !cols.length){
                util.showMessage(category + it.util.i18n("Admin_ImportExtFieldPage_No_extend_table"));
                return;
            }
            self._tableName = result.tableName;
            var fields = [{'name': 'id', 'text': 'id'}];
            $.each(cols, function(index, val) {
                console.log("val"+val);
                fields.push({'name': val, 'text': val});
            });
            self.fields = fields;
            var table = self.table = $('<table class="table table-striped table-bordered"></table>').appendTo(self.content);
            var columns = self.fields.map(function (item) {
                return {title: item.text, name: item.name, data: item.name, type: item.type, defaultContent: ''};
            });
            columns.splice(0, 0, {title: it.util.i18n("Admin_ImportExtFieldPage_Status"), name: 'status', data: 'status', type: 'string'});
            var dataTable = self.dataTable = self.table.DataTable({
                columns: columns,
                buttons: [],
                paging: false,
                searching: false,
            })
        });   
    },

    validate: function (sheet, rowIndex, item) {

        if (!item.id || item.id.trim().length == 0) {
            return it.util.i18n("Admin_ImportExtFieldPage_ID_not_null").format({
                sheet: sheet,
                rowIndex: rowIndex,
            })
        }     
    },

    handleFiles: function (result) {
        var self = this;
        this.dataTable.clear().draw();
        self.dataTable.rows.add(result).draw();
        // it.util.adminApi(this._tableName, 'search', {}, function (links) {
        //     var map = {};
        //     links.forEach(function (item) {
        //         map[item.id] = item;
        //     })
        //     result.forEach(function (item) {

        //         //TODO 这里以后可以放开,放用户选择是整个覆盖,还是更新原有信息
        //         if (map[item.id]) {
        //             item.status = it.util.i18n("Admin_ImportExtFieldPage_Update");
        //             item.dataTypeId = item.dataTypeId || map[item.id].dataTypeId;
        //             item.description = item.description || map[item.id].description;
        //         } else {
        //             item.status = it.util.i18n("Admin_ImportExtFieldPage_Add");
        //         }
                
        //     })
        //     self.dataTable.rows.add(result).draw();
        // });
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
            result.push(item);
        }
        var name = this._data.modelName
        it.util.adminApi(name, 'batchAddOrUpdate', result, function () {
            it.util.showMessage(it.util.i18n("Admin_ImportExtFieldPage_Save_success"));
        });
    },
});