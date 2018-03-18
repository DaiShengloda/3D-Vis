var BatchUpdateDataIdPanel = main.BatchUpdateDataIdPanel = function(data, parent){
	BatchUpdateDataIdPanel.superClass.constructor.call(this, [
		{
	        name: 'id',
	        text: it.util.i18n("Admin_batchUpdateDataIdPanel_ID")
	    }, {
	        name: 'newId',
	        text: it.util.i18n("Admin_batchUpdateDataIdPanel_New_ID")
	    }, {
            name: 'name',
            text: it.util.i18n("Admin_batchUpdateDataIdPanel_Name")
        }
    ]);
    this._data = data;
    this._parent = parent;
    this._name = this._data.text;
}

mono.extend(BatchUpdateDataIdPanel, ImportExcel, {
	init: function () {
        var self = this;
        var panel = this.panel = $('<div class="tab_contentPanel"></div>').appendTo(this._parent);
        var toolbar = this.toolbar = $('<div class="toolbar"></div>').appendTo(panel);
        var downloadBtn = this.downloadBtn = $('<button class="download btn btn-link">'+it.util.i18n("Admin_batchUpdateDataIdPanel_Template_download")+'</button>').appendTo(toolbar);
        downloadBtn.on('click', function () {
            window.open('/resource/excel/'+it.util.i18n("Admin_batchUpdateDataIdPanel_Update_ID_asset")+'.xlsx');
        })

        var fileInput = this.fileInput = $('<label for="import-link-input">'+it.util.i18n("Admin_batchUpdateDataIdPanel_File_select")+'</label><input id="import-link-input" type="file" class="file"/>').appendTo(toolbar);
        fileInput.css('display', 'inline');
        $(fileInput).on('change', function () {
        	var eventScope = this;
        	self._checkCache = [];
        	self._changedCache = [];
        	if(!self._assets){
        		it.util.adminApi('data', 'search', {}, function (assets) {
        			var ids = {};
        			$.each(assets, function(index, val){
        				ids[val.id] = val.ii;
        			});
        			self._assets = ids;
        			self.handleExcel(eventScope.files, fileInput);
        		});
        	}
        	
        });

        var submitBtn = this.submitBtn = $('<button class="submit btn btn-default">'+it.util.i18n("Admin_batchUpdateDataIdPanel_Save")+'</button>').appendTo(toolbar);
        submitBtn.on('click', function () {
        	var $btn = $(this);
        	$btn.attr('disabled', 'disabled');
            self.submit($btn);
        })

        var content = this.content = $('<div class="content"></div>').appendTo(panel);
        var addTable = this.table = $('<table class="table table-striped table-bordered"></table>').appendTo(content);
        var updateTable = this.table = $('<table class="table table-striped table-bordered"></table>').appendTo(content);
        var columns = this.fields.map(function (item) {
            return {title: item.text, name: item.name, data: item.name, type: item.type, defaultContent: ''};
        });
        var dataTable = this.dataTable = this.table.DataTable({
            columns: columns,
            buttons: [],
            paging: false,
            searching: false,
        })
        // this.addExcelFileListener(fileInput);
    },

    validate: function (sheet, rowIndex, item) {
    	function f(){
    		if(!this._assets){
	    		setTimeout(f, 100);
	    	}
    	}
    	// f();
        if (!item.id || item.id.trim().length == 0) {
            return ("sheet[{sheet}]"+it.util.i18n("Admin_batchUpdateDataIdPanel_ID_not_null")).format({
                sheet: sheet,
                rowIndex: rowIndex,
            })
        }
        if (!this._assets[item.id]) {
            return ("sheet[{sheet}]"+it.util.i18n("Admin_batchUpdateDataIdPanel_ID_not_exist")).format({
                sheet: sheet,
                rowIndex: rowIndex,
            })
        }
        if (!item.newId || item.newId.trim().length == 0) {
            return ("sheet[{sheet}]"+it.util.i18n("Admin_batchUpdateDataIdPanel_New_ID_not_null")).format({
                sheet: sheet,
                rowIndex: rowIndex,
            })
        }
        var rIndex = this._checkCache.indexOf(item.newId);
        if (rIndex>=0) {
            return ("sheet[{sheet}]"+it.util.i18n("Admin_batchUpdateDataIdPanel_New_ID_repeat")).format({
                sheet: sheet,
                rowIndex: rowIndex,
                rIndex: rIndex+1
            });
        }
        if (this._assets[item.newId] && this._changedCache.indexOf(item.newId) < 0) {
        	return ("sheet[{sheet}]"+it.util.i18n("Admin_batchUpdateDataIdPanel_New_ID_exist")).format({
                sheet: sheet,
                rowIndex: rowIndex
            });
        }
        this._checkCache.push(item.newId);
        this._changedCache.push(item.id);
    },

    handleFiles: function (result) {
        var self = this;
        this.dataTable.clear().draw();
        self.dataTable.rows.add(result).draw();
    },

    submit: function ($btn) {
    	var self = this;
        var data = this.dataTable.data();
        if (!data || data.length == 0) {
            it.util.showMessage('no data');
            return;
        }
        var result = [];
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            item.ii = self._assets[item.id];
            if(item.name && item.name.trim()===''){
                delete item.name;
            }
            result.push(item);
        }
        it.util.adminApi('data', 'batchUpdateDataId', result, function () {
            it.util.showMessage(it.util.i18n("Admin_batchUpdateDataIdPanel_Save_success"));
            self.dataTable.clear().draw();
            $btn.removeAttr('disabled');
        });
    }
});
