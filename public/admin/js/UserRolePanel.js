// 管理角色权限页面
function UserRolePanel(table, user) {
    this.tableList = table;
    this._user = user;
    this._isUpdated = !!user;
};

mono.extend(UserRolePanel, Object, {
    createTable: function (parent) {
        var self = this;
        var $table = this.$table = $('<table class="table table-striped table-bordered" width="100%" ></table>').appendTo(parent);
        $table.on('click', '.td-checkbox', function () {
            !$(event.target).is(":checkbox") && $(":checkbox", this).trigger("click");
        })

        var table = this._table = $table.DataTable({
            ajax: function (data, callback, settings) {
                var param = {};
                it.util.adminApi('role', 'searchAndCount', param,
                    function (result) {
                        if (result.error) {
                            it.util.msg(result.error);
                            return;
                        }
                        var value = result;
                        //封装返回数据，这里仅演示了修改属性名
                        var returnData = {};
                        returnData.draw = data.draw; //这里直接自行返回了draw计数器,应该由后台返回
                        returnData.recordsTotal = value.count;
                        returnData.recordsFiltered = value.count; //后台不实现过滤功能，每次查询均视作全部结果
                        returnData.data = value.rows;
                        //调用DataTables提供的callback方法，代表数据已封装完成并传回DataTables进行渲染
                        //此时的数据需确保正确无误，异常判断应在执行此回调前自行处理完毕
                        callback(returnData);
                    },
                    function (error) {
                        util.msg(it.util.i18n("Admin_role_Search_fail"));
                    }
                );
            },
            columns: [{
                    className: "td-checkbox",
                    orderable: false,
                    data: null,
                    title: '<input type="checkbox" name="cb-check-all"  id="user-check-all">',
                    render: function (data, type, row, meta) {
                        var input;
                        if (self.ownedRole && self.ownedRole.indexOf(row.id) >= 0) {
                            input = '<input type="checkbox" name ="subBox" value=' + row.id + ' id="cb_' + row.id + '" checked = "checked">'
                        } else {
                            input = '<input type="checkbox" name ="subBox" value=' + row.id + ' id="cb_' + row.id + '">';
                        }
                        return input;
                    }
                },
                { "data": 'id', "title": util.i18n('id') },
                { "data": 'name', "title": util.i18n('name') },
                { "data": 'assetExpr', "title": util.i18n('assetExpr') },
                { "data": 'description', "title": util.i18n('description') }
            ],
            dom: "frti",
            select: 'single',
            // processing: false,
            // scrollX: true,
            scrollY: 500,
            // scrollCollapse: true,
            // fixedColumns: true,
            autoWidth: true,
            serverSide: true,
            searching: true,
            paging: false,
            buttons: []
        });
        setTimeout(function () {
            $('#user-check-all').click(function (e) {
                var checked = e.target.checked;
                $('input[name="subBox"]').each(function (index, ele) {
                    ele.checked = checked;
                });
            });
        }, 0);
        var btnSave = $('<button type="button" class="btn btn-default">' + it.util.i18n('Save') + '</button>')
            .css({
                'float': 'left'
            }).click(function (event) {
                var roles = [];
                $('input[name="subBox"]:checked').each(function (index, ele) {
                    roles.push(ele.value);
                })
                self.saveUserOfRole(roles);
            });
        $('.dataTables_filter', table.table().container())
            .children().first().before(btnSave);

        return $table;
    },
    saveUserOfRole: function (permissions) {
        // 验证角色是否保存
        if (!this._user) {
            it.util.showMessage('saveUserFirst');
            return;
        }
        var self = this,
            userId = this._user.username,
            method = 'batchUpdateRoles',
            params = { userId: userId, roles: permissions }

        it.util.adminApi('userOfRole', method, params, function (result) {
            it.util.msg('savesucceed');
            tabPanel.$panel.bootstrapTab('remove', 'assignRole');
        })


    },
    fetchUserOfRole: function () {
        var self = this,
            user = this._user;
        util.adminApi('userOfRole', 'search', { userId: user.username }, function (owned) {
            if (owned.error) {
                it.util.msg(owned.error);
                return;
            }
            var ownedRole = [];
            $.each(owned, function (index, val) {
                ownedRole.push(val.roleId);
            });
            // self.checkRoleOfAsset(ownedAsset);
            self.ownedRole = ownedRole;
        });
    },
    createPage: function () {
        var self = this;
        // 分配用户关联的角色
        this.fetchUserOfRole();
        var $panel = $('<div></div>');
        this.createTable($panel);
        return $panel;
    }
});