// 管理角色权限页面
function RoleAssetPanel(table, role) {
    this.tableList = table;
    this._role = role;
    this._isUpdated = !!role;
};

mono.extend(RoleAssetPanel, Object, {
    createSearchBar: function () {
        var self = this,
            props = [
                { label: 'id', id: 'id', type: 'text' },
                { label: 'name', id: 'name', type: 'text' },
                { label: 'parentId', id: 'parentId', type: 'text' },
                { label: 'description', id: 'description', type: 'text' },
            ];
        var form = util.createForm(props, true, function (result) {
            $.each(result, function (attr, val) {
                if (val.trim().length == 0 || val == 'all') {
                    delete result[attr];
                } else {
                    if (val === 'true') {
                        result[attr] = 1;
                    } else if (val === 'false') {
                        result[attr] = 0;
                    }
                }
            });
            //模糊查询
            var qo = {};
            $.each(result, function (index, val) {
                if (util.is(val, 'String')) {
                    qo[index] = { '$like': '%' + val + '%' };
                } else {
                    qo[index] = val;
                }
            });
            // self.search(table, module.modulePath, result);
            // self._queryOption = qo;
            // //判断datatable的模式：client-side模式还是server-side模式
            // if (self.serverSide) {
            //     //server-side模式
            //     self._table.draw();
            // } else {
            //     //client-side模式
            //     self._table.ajax.reload();
            // }
            self.search(self._table, result);
        }, { inline: true, showColon: false, buttonText: util.i18n('Query') });
        return form;
    },
    search: function (table, params) {
        util.adminApi('data', 'searchAndCount', { where: params }, function (data) {
            if (data.error) {
                it.util.msg(data.error);
                return;
            }
            table.clear();
            table.rows.add(data.rows).draw();
        });
    },
    createTable: function (parent) {
        var self = this;
        var $table = this.$table = $('<table class="table table-striped table-bordered" width="100%" ></table>').appendTo(parent);
        $table.on('click', '.td-checkbox', function () {
            !$(event.target).is(":checkbox") && $(":checkbox", this).trigger("click");
        })

        var table = this._table = $table.DataTable({
            // ajax: function(data, callback, settings) {
            //     var param = {};
            //     if (self.serverSide) {
            //         param.offset = parseInt(data.start);
            //         param.limit = parseInt(data.length);
            //         var orders = data.order;
            //         if (orders.length > 0) {
            //             var order = orders[0];
            //             var col = data.columns[order.column];
            //             if (col.data) {
            //                 param.order = col.data + ' ' + order.dir;
            //             }

            //         }
            //     }
            //     if (self._queryOption) {
            //         param.where = self._queryOption;
            //     }
            //     it.util.adminApi('data','searchAndCount',param,
            //     function(result){
            //         var value = result;
            //             //封装返回数据，这里仅演示了修改属性名
            //             var returnData = {};
            //             returnData.draw = data.draw; //这里直接自行返回了draw计数器,应该由后台返回
            //             returnData.recordsTotal = value.count;
            //             returnData.recordsFiltered = value.count; //后台不实现过滤功能，每次查询均视作全部结果
            //             returnData.data = value.rows;
            //             //调用DataTables提供的callback方法，代表数据已封装完成并传回DataTables进行渲染
            //             //此时的数据需确保正确无误，异常判断应在执行此回调前自行处理完毕
            //             callback(returnData);
            //     },function(error){
            //         util.msg(it.util.i18n("Admin_dataTable_Search_fail"));
            //     }
            //     );
            // },
            columns: [{
                    className: "td-checkbox",
                    orderable: false,
                    data: null,
                    title: '<input type="checkbox" name="cb-check-all"  id="cb-check-all">',
                    render: function (data, type, row, meta) {
                        if (self._ownedAsset && self._ownedAsset.indexOf(row.id) >= 0) {
                            return '<input type="checkbox" name ="subBox" value=' + row.id + ' checked=' + (self._ownedAsset.indexOf(row.id) >= 0) + '>';
                        } else {
                            return '<input type="checkbox" name ="subBox" value=' + row.id + ' >';
                        }

                    }
                },
                { "data": 'id', "title": util.i18n('id') },
                { "data": 'name', "title": util.i18n('name') },
                { "data": 'parentId', "title": util.i18n('parentId') },
                { "data": 'description', "title": util.i18n('description') },
            ],
            dom: "frti",
            select: 'single',
            // processing: false,
            // scrollX: true,
            scrollY: 400,
            // scrollCollapse: true,
            // fixedColumns: true,
            // serverSide: false,
            searching: true,
            paging: false,
            buttons: []
        });
        setTimeout(function () {
            $('#cb-check-all').click(function (e) {
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
                var assets = [];
                $('input[name="subBox"]:checked').each(function (index, ele) {
                    assets.push(ele.value);
                })
                self.saveRoleOfAsset(assets);
            });
        $('.dataTables_filter', table.table().container())
            .children().first().before(btnSave);

        var selector = this.createSelector().css({
            'float': 'left'
        });
        var self = this;

        var selectorChanged;
        $('input', selector).bind('input propertychange', function () {
            if (!self._table.data().length) return;
            if (selectorChanged) {
                clearTimeout(selectorChanged);
            }
            var val = $(this).val()
            selectorChanged = setTimeout(function () {
                self.checkAsset(val);
            }, 500);

        });
        $('.dataTables_filter', table.table().container())
            .children().first().before(selector);


        return $table;
    },
    selectAsset: function (expression) {

    },
    createSelector: function () {
        return $('<label>Select expression:<input type="search" class="form-control input-sm"></label>');
    },
    saveRoleOfAsset: function (assets) {
        // 验证角色是否保存
        if (!this._role) {
            it.util.showMessage('saveRoleFirst');
            return;
        }
        var self = this,
            roleId = this._role.id,
            method = 'batchUpdateAssets',
            params = { roleId: roleId, assets: assets }

        it.util.adminApi('roleOfAsset', method, params, function (result) {
            it.util.msg('savesucceed');
            tabPanel.$panel.bootstrapTab('remove', 'assignAssets');
        })


    },
    checkRoleOfAsset: function (ownedAsset) {

    },
    fetchRoleOfAsset: function () {
        var self = this,
            role = this._role;
        util.adminApi('roleOfAsset', 'search', { roleId: role.id }, function (owned) {
            if (owned.error) {
                it.util.msg(owned.error);
                return;
            }
            var ownedAsset = [];
            $.each(owned, function (index, val) {
                ownedAsset.push(val.assetId);
            });
            // self.checkRoleOfAsset(ownedAsset);
            self._ownedAsset = ownedAsset;
        });
    },
    setRoleAssetCheck: function () {
        this._ownedAsset.forEach(function (id) {
            if ($('#cb_' + id).length > 0) {
                $('#cb_' + id).prop("checked", true);
            }
        })
    },

    createPage: function () {
        // 分配角色有权查看的资产
        this.fetchRoleOfAsset();

        var $panel = $('<div></div>');
        var $searchBar = this.createSearchBar();
        if ($searchBar) {
            $searchBar.prependTo($panel);
        }
        this.createTable($panel);

        return $panel;
    }
});