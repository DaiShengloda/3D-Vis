
var ImportExcel = main.ImportExcel = function (fields) {
    this.fields = fields;

};

mono.extend(ImportExcel, Object, {


    _handleFiles: function (result) {
        var self = this;
        this.parse(result, function(newResult){
            self.handleFiles(newResult)
        });
    },

    handleFiles: function (result) {

    },

    validate: function (sheet, rowIndex, item) {

    },

    parse: function (result, callback) {
        callback && callback(result);
    },

    addExcelFileListener: function (fileElement) {

        var self = this, X = XLSX;
        $(fileElement).on('change', function () {
            self.handleExcel(this.files, fileElement);
        })
    },
    handleExcel: function(files, fileElement){
        var self = this, X = XLSX;
        if (!files || files.length == 0) {
            console.warn('file error, length=0')
            return;
        }
        var f = files[0];
        if (!it.util.isValidateFile(f.name, ['xls', 'xlsx'])) {
            return;
        }
        var reader = new FileReader();
        reader.readAsBinaryString(f);
        reader.onload = function (e) {
            fileElement.src = '';
            var data = e.target.result;
            var wb = X.read(data, {type: 'binary'});
            var result = [];
            for (var i = 0; i < wb.SheetNames.length; i++) {

                var sheetName = wb.SheetNames[i];
                var cvs = X.utils.sheet_to_csv(wb.Sheets[sheetName]);
                var lines = cvs.split("\n");
                var line, i, len = lines.length, fields, row;
                for (i = 1; i < len; i++) {
                    line = lines[i];
                    fields = line.split(",");
                    if (fields[0] && fields[0].trim() !== '') {
                        row = {};
                        self.fields.forEach(function (col, index) {
                            row[col.name] = fields[index];
                        });
                        var error = self.validate(sheetName, i, row);
                        if (error) {
                            $(fileElement).val('')
                            alert(error);
                            return;
                        }
                        result.push(row);
                    }
                }

            }
            $(fileElement).val('');
            if (result.length == 0) {
                return 'no data'
            }
            self._handleFiles(result);
        };
    },
    writerXlsx:function(){
        console.log("join=====");
    }
});