// 管理角色权限页面
function RolePermissionPanel(table, role) {
    this.tableList = table;
    this._role = role;
    this._isUpdated = !!role;
};

mono.extend(RolePermissionPanel, Object, {
    createPermissionTree: function (parent, data) {
        var $treePanel = $('<div class="col-md-6"></div>').appendTo(parent);
        var $tree = $('<div id="permissionTree"></div>')
            .appendTo($treePanel);
        var self = this;
        // var $tree = $('#permissionTree');
        var $checkableTree = $tree.treeview({
            data: data,
            showIcon: false,
            showBorder: false,
            showCheckbox: true,
            onNodeChecked: function (event, node) {
                if (node.text === 'checkedAll') {
                    self.checkAllSon($tree, node);
                }
                self.checkAllParent($tree, node);
            },
            onNodeUnchecked: function (event, node) {
                if (node.text === 'checkedAll') {
                    self.uncheckAllSon($tree, node);
                }
                self.uncheckAllParent($tree, node);
            }
        });
        // 创建保存按钮
        var btnSave = $('<button type="submit" class="col-sm-offset-1 btn btn-default">' +
                it.util.i18n('Save') +
                '</button>').appendTo($treePanel)
            .click(function (event) {
                // 获取角色权限
                var checked = $tree.treeview('getChecked', [{ silent: true }]);
                var permissions = [];
                $.each(checked, function (index, val) {
                    if (val.permissionId) {
                        permissions.push(val.permissionId);
                    }
                });
                if (!permissions.length) {
                    it.util.msg('selectPermisssion');
                    return;
                }
                // 保存角色权限
                self.savePermission(permissions);
            });;
        return $tree;
    },
    savePermission: function (permissions) {
        // 验证角色是否保存
        if (!this._role) {
            it.util.showMessage('saveRoleFirst');
            return;
        }
        var self = this;
        var rop = [],
            roleId = this._role.id,
            method = 'batchUpdatePermission',
            params = { roleId: roleId, permissions: permissions };

        it.util.adminApi('roleOfPermission', method, params, function (result) {
            it.util.msg('savesucceed');
            tabPanel.$panel.bootstrapTab('remove', 'assignPermissions');
        })


    },
    //选中全部父节点  
    checkAllParent: function (tree, node) {
        var self = this;
        tree.treeview('checkNode', node.nodeId, { silent: true });
        var parentNode = tree.treeview('getParent', node.nodeId);
        if (!("nodeId" in parentNode)) {
            return;
        } else {
            self.checkAllParent(tree, parentNode);
        }
    },
    //取消全部父节点  
    uncheckAllParent: function (tree, node) {
        var self = this;
        tree.treeview('uncheckNode', node.nodeId, { silent: true });
        var siblings = tree.treeview('getSiblings', node.nodeId);
        var parentNode = tree.treeview('getParent', node.nodeId);
        if (!("nodeId" in parentNode)) {
            return;
        }
        var isAllUnchecked = true; //是否全部没选中  
        for (var i in siblings) {
            if (siblings[i].state.checked) {
                isAllUnchecked = false;
                break;
            }
        }
        if (isAllUnchecked) {
            self.uncheckAllParent(tree, parentNode);
        }

    },
    //级联选中所有子节点  
    checkAllSon: function (tree, node) {
        var self = this;
        tree.treeview('checkNode', node.nodeId, { silent: true });
        if (node.nodes != null && node.nodes.length > 0) {
            for (var i in node.nodes) {
                self.checkAllSon(tree, node.nodes[i]);
            }
        }
    },
    //级联取消所有子节点  
    uncheckAllSon: function (tree, node) {
        var self = this;
        tree.treeview('uncheckNode', node.nodeId, { silent: true });
        if (node.nodes != null && node.nodes.length > 0) {
            for (var i in node.nodes) {
                self.uncheckAllSon(tree, node.nodes[i]);
            }
        }
    },
    formatData: function (result, parent, owned) {
        if (!result || !result.length) {
            return;
        }
        var self = this,
            owned = owned || [];
        // 组织数据格式
        var data = {},
            treeData = [];
        $.each(result, function (index, val) {
            var menu = data[val.menuName] || (data[val.menuName] = {});
            if (val.actionName) {
                actions = menu.actions || (menu.actions = {});
                actions[val.actionName] = val.id
            } else {
                menu.pid = val.id
            }

        });
        $.each(data, function (menu, item) {
            var nodes = [];
            item.actions && $.each(item.actions, function (action, id) {
                nodes.push({
                    text: action,
                    permissionId: id,
                    state: {
                        checked: owned.indexOf(id) >= 0
                    }
                });
            });
            var node = { text: menu };
            if (nodes.length) node.nodes = nodes;
            if (item.pid) {
                node.permissionId = item.pid;
                node.state = { checked: owned.indexOf(item.pid) >= 0 };
            }
            treeData.push(node);
        });

        self.createPermissionTree(parent, [{ text: it.util.i18n('checkedAll'), nodes: treeData }]);
    },
    fetchPermission: function (parent) {
        var self = this,
            role = this._role;
        util.adminApi('permission', 'searchWithName', {}, function (result) {
            if (result.error) {
                it.util.msg(result.error);
                return;
            }
            // 查询当前用户角色包含的权限
            util.adminApi('roleOfPermission', 'search', { roleId: role.id }, function (owned) {
                if (owned.error) {
                    it.util.msg(owned.error);
                    return;
                }
                var ownedPerm = [];
                $.each(owned, function (index, val) {
                    ownedPerm.push(val.permissionId);
                });
                self.formatData(result, parent, ownedPerm);
            });
        })
    },
    createPage: function () {
        var $panel = $('<div></div>');
        // 分配角色拥有的权限
        this.fetchPermission($panel);
        return $panel;
    }
});