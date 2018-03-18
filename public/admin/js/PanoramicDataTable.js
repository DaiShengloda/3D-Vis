function PanoramicDataTable(){
	DataTable.apply(this, arguments);
}

mono.extend(PanoramicDataTable, DataTable, {
	createCustomBtn: function($btnGroup,table){
		var self = this;
		var $btnUpload = this._$btnUpload = this.createButton(it.util.i18n('Admin_UploadPDFPage_Upload'), $btnGroup).attr('disabled', true);;
		this.handleTable(table);

		$btnUpload.click(function(event) {
			var id = 'panoramicUpload';
			var row = table.row(self._selectedIndexes).data();
			var page = new PanoramicDataPanel(table,row);
    		var panel = page.createPage();

			var opt = {
			    id: id,
			    text: it.util.i18n('Panoramic_upload'),
			    closeable: true,
			    content: panel
			};
			tabPanel.$panel.bootstrapTab('add', opt);
		});
	},
	handleTable: function(table) {
		var self = this;
		table.on('deselect', function(e, table, type, indexes) {
			if (type === 'row') {
				self._selectedIndexes = undefined;
				self.deselectTableRow();
			}
		});
		table.on('select', function(e, table, type, indexes) {
			if (type === 'row') {
				self._selectedIndexes = indexes;
				self.selectTableRow();
			}
		});
	},
    deselectTableRow: function(){
        this._$btnUpload.attr('disabled', true);
    },
    selectTableRow: function(){
    	this._$btnUpload.attr('disabled', false);
    },
});