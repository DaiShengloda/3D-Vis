function RoleDataTable() {
    DataTable.apply(this, arguments);
}

mono.extend(RoleDataTable, DataTable, {
    createCustomBtn: function ($btnGroup, table) {
        var self = this;
        var $btnPerm = this._$btnPerm = this.createButton('permission', $btnGroup).attr('disabled', true);;
        var $btnAsset = this._$btnAsset = this.createButton('asset', $btnGroup).attr('disabled', true);;
        this.handleTable(table);

        $btnPerm.click(function (event) {
            var id = 'assignPermissions';
            var row = table.row(self._selectedIndexes).data();
            var page = new RolePermissionPanel(table, row);
            var panel = page.createPage();
            var opt = {
                id: id,
                text: util.i18n('Assign permissions'),
                closeable: true,
                content: panel
            };
            tabPanel.$panel.bootstrapTab('add', opt);
        });
        $btnAsset.click(function (event) {
            var id = 'assignAssets';
            var row = table.row(self._selectedIndexes).data();
            var page = new RoleAssetPanel(table, row);
            var panel = page.createPage();

            var opt = {
                id: id,
                text: util.i18n('Assign assets'),
                closeable: true,
                content: panel
            };
            tabPanel.$panel.bootstrapTab('add', opt);
        });
    },
    handleTable: function (table) {
        var self = this;
        table.on('deselect', function (e, table, type, indexes) {
            if (type === 'row') {
                self._selectedIndexes = undefined;
                self.deselectTableRow();
            }
        });
        table.on('select', function (e, table, type, indexes) {
            if (type === 'row') {
                self._selectedIndexes = indexes;
                self.selectTableRow();
            }
        });
    },
    deselectTableRow: function () {
        this._$btnPerm.attr('disabled', true);
        this._$btnAsset.attr('disabled', true);
    },
    selectTableRow: function () {
        this._$btnPerm.attr('disabled', false);
        this._$btnAsset.attr('disabled', false);
    },
});


//user表添加Role按钮
function UserDataTable() {
    DataTable.apply(this, arguments);
}

mono.extend(UserDataTable, DataTable, {
    createCustomBtn: function ($btnGroup, table) {
        var self = this;
        var $btnRole = this._$btnRole = this.createButton('role', $btnGroup).attr('disabled', true);
        this.handleTable(table);

        $btnRole.click(function (event) {
            var id = 'assignRole';
            var row = table.row(self._selectedIndexes).data();
            var page = new UserRolePanel(table, row);
            var panel = page.createPage();
            var opt = {
                id: id,
                text: util.i18n('Assign roles'),
                closeable: true,
                content: panel
            };
            tabPanel.$panel.bootstrapTab('add', opt);
        });
    },
    handleTable: function (table) {
        var self = this;
        table.on('deselect', function (e, table, type, indexes) {
            if (type === 'row') {
                self._selectedIndexes = undefined;
                self.deselectTableRow();
            }
        });
        table.on('select', function (e, table, type, indexes) {
            if (type === 'row') {
                self._selectedIndexes = indexes;
                self.selectTableRow();
            }
        });
    },
    deselectTableRow: function () {
        this._$btnRole.attr('disabled', true);
    },
    selectTableRow: function () {
        this._$btnRole.attr('disabled', false);
    },
});

function cameraGroupDataTable() {
    DataTable.apply(this, arguments);
}

mono.extend(cameraGroupDataTable, DataTable, {
    createCustomBtn: function ($btnGroup, table) {
        var self = this;
        var $btnAsset = this._$btnAsset = this.createButton(it.util.i18n('select_camera'), $btnGroup).attr('disabled', true);;
        this.handleTable(table);
        $btnAsset.click(function (event) {
            var id = 'assignAssets';
            var row = table.row(self._selectedIndexes).data();
            var page = new CameraGroupAssetPanel(table, row);
            var panel = page.createPage();

            var opt = {
                id: id,
                text: util.i18n('Assign assets'),
                closeable: true,
                content: panel
            };
            tabPanel.$panel.bootstrapTab('add', opt);
        });
    },
    handleTable: function (table) {
        var self = this;
        table.on('deselect', function (e, table, type, indexes) {
            if (type === 'row') {
                self._selectedIndexes = undefined;
                self.deselectTableRow();
            }
        });
        table.on('select', function (e, table, type, indexes) {
            if (type === 'row') {
                self._selectedIndexes = indexes;
                self.selectTableRow();
            }
        });
    },
    deselectTableRow: function () {
        this._$btnAsset.attr('disabled', true);
    },
    selectTableRow: function () {
        this._$btnAsset.attr('disabled', false);
    },
});