// 管理角色权限页面
function CameraGroupAssetPanel(table, group) {
    this.tableList = table;
    this._group = group;
    this._isUpdated = !!group;
};

mono.extend(CameraGroupAssetPanel, Object, {
    createTable: function (parent) {
        var self = this;
        var $table = this.$table = $('<table class="table table-striped table-bordered" width="100%" ></table>').appendTo(parent);
        $table.on('click', '.td-checkbox', function () {
            !$(event.target).is(":checkbox") && $(":checkbox", this).trigger("click");
        })

        var table = this._table = $table.DataTable({
            ajax: function (data, callback, settings) {
                var param = {};
                it.util.adminApi('data', 'searchAndCount', { categoryId: "camera" },
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
                        util.msg(it.util.i18n("Admin_Asset_Search_fail"));
                    }
                );
            },
            columns: [{
                    className: "td-checkbox",
                    orderable: false,
                    data: null,
                    title: '<input type="checkbox" name="cb-check-all"  id="cg-check-all">',
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
            $('#cg-check-all').click(function (e) {
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
                var cameras = [];
                $('input[name="subBox"]:checked').each(function (index, ele) {
                    cameras.push(ele.value);
                })
                self.saveCameraGroupOfAsset(cameras);
            });
        $('.dataTables_filter', table.table().container())
            .children().first().before(btnSave);

        return $table;
    },
    selectAsset: function (expression) {

    },
    createSelector: function () {
        return $('<label>Select expression:<input type="search" class="form-control input-sm"></label>');
    },
    saveCameraGroupOfAsset: function (cameras) {
        // 验证角色是否保存
        if (!this._group) {
            it.util.showMessage('saveGroupFirst');
            return;
        }
        var self = this,
            groupId = this._group.id,
            method = 'batchUpdateCameras',
            params = { groupId: groupId, cameras: cameras }

        it.util.adminApi('group_of_camera', method, params, function (result) {
            it.util.msg('savesucceed');
            tabPanel.$panel.bootstrapTab('remove', 'assignAssets');
        })
    },

    fetchCameraGroupOfAsset: function () {
        var self = this,
            group = this._group;
        util.adminApi('group_of_camera', 'search', { groupId: group.id }, function (owned) {
            if (owned.error) {
                it.util.msg(owned.error);
                return;
            }
            var ownedAsset = [];
            $.each(owned, function (index, val) {
                ownedAsset.push(val.cameraId);
            });
            self._ownedAsset = ownedAsset;
        });
    },

    createPage: function () {
        // 分配角色有权查看的资产
        this.fetchCameraGroupOfAsset();

        var $panel = $('<div></div>');
        this.createTable($panel);

        return $panel;
    }
});