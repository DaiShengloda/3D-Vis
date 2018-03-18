var UpdateCutomTablePanel = function(tableName) {
    this.tableName = tableName;
};

mono.extend(UpdateCutomTablePanel, Object, {
    requestTable: function() {
        var data = { where: { tableName: this.tableName } };
        var self = this;
        util.adminApi('custom_table', 'get', data, function(result) {
            self.requestColumns(result);
        });
    },

    createBtnGroup: function() {
        return $('<div class="btn-group" role="group">');
    },

    createButton: function(text, group) {
        var btn = $('<button type="button" class="it_row">' + util.i18n(text) + '</button>').appendTo(this._view);
        if (group) group.append(btn);
        return btn;
    },

    getleftToolBar: function(module) {
        var $btnGroup = this.createBtnGroup().addClass('col-sm-6').css({
            paddingLeft: 0,
        });
        var $btnRemove = this.createButton('remove', $btnGroup).attr('disabled', true);
    },
    newButton: function(text) {
        $btnRemove = $('<button type="button" class="btn btn-default">' + util.i18n(text) + '</button>').appendTo(this._view);;
        return $btnRemove;
    },
    requestColumns: function(result) {
        this.tableModel = result;
        var data = { where: { tableName: this.tableName } };
        var self = this;
        util.adminApi('custom_column', 'find', data, function(result) {
            self.tableModel.columns = result;
            self.createPageCallback();
        });
    },

    createPage: function() {
        this.requestTable();
    },

    createPageCallback: function() {
        var self = this;
        var opt = {
            id: 'updatecustom_table',
            text: util.i18n('update') + ':' + util.i18n('custom_table'),
            closeable: true,
            content: function(parent) {
                var $view = self._view = $('<div></div>').appendTo(parent);

                var tableForm = self._getTableForm();

                var table = self._getCustomTable();
                var fieldForm = self._getFieldForm();

                return $view;
            }
        };

        tabPanel.$panel.bootstrapTab('add', opt);
    },
    _getTableForm: function() {
        var props = [],
            tm = this.tableModel;
        props.push({ label: it.util.i18n("Admin_UpdateCutomTablePanel_Category_ID"), id: 'category', value: tm.category, readonly: true });
        props.push({ label: it.util.i18n("Admin_UpdateCutomTablePanel_Business_name"), id: 'tableName', value: tm.tableName, readonly: true });
        props.push({ label: it.util.i18n("Admin_UpdateCutomTablePanel_Description"), id: 'description', value: tm.description, readonly: true });
        var self = this;
        var form = util.createForm(props, { showSubmit: false, left: 1, right: 3 });
        return $('<div class="it_row"></div>').append(form).appendTo(this._view);
    },
    _getFieldForm: function() {

        var props = [];
        props.push({ label: it.util.i18n("Admin_UpdateCutomTablePanel_Field_name"), id: 'columnName' });
        props.push({ label: it.util.i18n("Admin_UpdateCutomTablePanel_Field_type"), id: 'columnType', type: 'select', items: this._getColTypes() });
        props.push({ label: it.util.i18n("Admin_UpdateCutomTablePanel_Allow_null"), id: 'columnAllowNull', type: 'checkbox', value: 'checked' });
        props.push({ label: it.util.i18n("Admin_UpdateCutomTablePanel_Default"), id: 'columnDefaultValue' });
        props.push({ label: it.util.i18n("Admin_UpdateCutomTablePanel_Unique"), id: 'columnUnique', type: 'checkbox' });
        props.push({ label: it.util.i18n("Admin_UpdateCutomTablePanel_Group_ID"), id: 'columnGroupId' });
        props.push({ label: it.util.i18n("Admin_Display_Name"), id: 'columnDisplayName' });
        var self = this;
        var form = util.createForm(props, true, function(result) {
            result.tableName = self.tableName;
            util.adminApi('custom_column', 'add', result, function(data) {
                //将新增数据更新到table中
                self._dtCustom.row.add(data).draw();
                //清空form
                util.resetForm(form);
                //取消验证状态
                form.data('bootstrapValidator').resetForm();
            });

        }, { left: 1, right: 3 });
        var v = it.validator;
        var opt = {
            columnName: { validators: [v.notEmpty('category')] },
            columnType: { validators: [v.notEmpty('tableName')] },
        };
        util.initValidator(form, opt);
        return $('<div class="it_row"></div>').append(form).appendTo(this._view);
    },
    _getCustomTable: function() {
        var self = this;
        var columnName = null;
        var tableName = null;
        var $remove = self.newButton('remove').attr('disabled', true);
        var $table = $('<table class="table table-striped table-bordered" cellspacing="0" width="100%"></table>');
        var row = $('<div class="it_row"></div>').append($table).appendTo(this._view);
        this._dtCustom = $table.DataTable({
            columns: [
                { data: 'tableName', "title": it.util.i18n("Admin_UpdateCutomTablePanel_Field_table") },
                { data: 'columnName', "title": it.util.i18n("Admin_UpdateCutomTablePanel_Field_n") },
                { data: "columnType", "title": it.util.i18n("Admin_UpdateCutomTablePanel_Field_type") },
                { data: "columnAllowNull", "title": it.util.i18n("Admin_UpdateCutomTablePanel_Allow_null") },
                { data: "columnDefaultValue", "title": it.util.i18n("Admin_UpdateCutomTablePanel_Default") },
                { data: "columnUnique", "title": it.util.i18n("Admin_UpdateCutomTablePanel_Unique") },
                { data: "columnGroupId", "title": it.util.i18n("Admin_UpdateCutomTablePanel_Group_ID") },
                { data: "columnDisplayName", "title": it.util.i18n("Admin_Display_Name") }
            ]
        });
        var backColor = [];
        var index = 0;
        $table.on('click', 'tr', function(e) {

            var $target = $(e.target);
            var parent = $target.parent();
            $table.find("tr").each(function(i) {
                if ($target.parent().text() == $(this).text()) {
                    index = i - 1;
                }
            })

            parent.css({ 'background-color': '#0088cc' });
            backColor.push(parent);
            for (var i = 0 in backColor) {
                if (parent == backColor[i]) {
                    parent.css({ 'background-color': '#0088cc' });
                } else {
                    backColor[i].css({ 'background-color': '#ffffff' });
                }
            }
            tableName = $target.parent().children().eq(0).text();
            columnName = $target.parent().children().eq(1).text();
            $remove.attr('disabled', false);
        });

        $remove.on('click', function(e) {
            var data = {
                tableName: tableName,
                columnName: columnName
            }
            util.confirm(it.util.i18n("Admin_dataTable_Confirm_delete"), function() {
                util.adminApi('custom_column', 'remove', JSON.stringify(data), function(data) {
                    self._dtCustom.row(index).remove().draw();
                    $remove.attr('disabled', true);
                }, function() {
                    alert('remove error!');
                }, 'application/json; charset=UTF-8');
            });
        });
        this._dtCustom.rows.add(this.tableModel.columns).draw();
        return row;
    },
    _createTablePane: function(div) {
        var properties = [];
        properties.push({ type: "label", text: it.util.i18n("Admin_UpdateCutomTablePanel_Category_ID") + ":" });
        properties.push({ type: "text", readonly: true });
        properties.push({ type: "label", text: it.util.i18n("Admin_UpdateCutomTablePanel_Business_name") + ":" });
        properties.push({ type: "text", readonly: true });
        properties.push({ type: "label", text: it.util.i18n("Admin_UpdateCutomTablePanel_Description") + ":" });
        properties.push({ type: "text", id: "description", required: true });
        return this.createTableLayoutFields(properties, div, 2);
    },
    _getColTypes: function() {
        return [
            { label: it.util.i18n("Admin_UpdateCutomTablePanel_Text"), value: "STRING" },
            { label: it.util.i18n("Admin_UpdateCutomTablePanel_Integer"), value: "INTEGER" },
            { label: it.util.i18n("Admin_UpdateCutomTablePanel_Number"), value: "DOUBLE" },
            { label: it.util.i18n("Admin_UpdateCutomTablePanel_Date"), value: "DATEONLY" },
            { label: it.util.i18n("Admin_UpdateCutomTablePanel_Date_time"), value: "DATE" },
            { label: it.util.i18n("Admin_UpdateCutomTablePanel_Boolean"), value: "BOOLEAN" },
        ];
    },

    _getColumnTypes: function() {
        return [
            { text: it.util.i18n("Admin_UpdateCutomTablePanel_Text"), value: "STRING" },
            { text: it.util.i18n("Admin_UpdateCutomTablePanel_Integer"), value: "INTEGER" },
            { text: it.util.i18n("Admin_UpdateCutomTablePanel_Number"), value: "DECIMAL" },
            { text: it.util.i18n("Admin_UpdateCutomTablePanel_Date"), value: "DATEONLY" },
            { text: it.util.i18n("Admin_UpdateCutomTablePanel_Date_time"), value: "DATE" },
            { text: it.util.i18n("Admin_UpdateCutomTablePanel_Boolean"), value: "BOOLEAN" },
        ];
    },

});