var tabManager = it.tabManager = sdk.tabManager = {

    tabs: null,
    init: function () {
        this.tabs = $("#tab");
        this.tabs.tabs({border: false});
    },
    select: function (which) {
        return this.tabs.tabs('select', which);
    },
    initSearchBar: function (module, searchBar, listTable) {
        var columns = [];
        Object.keys(module.attributes).forEach(function (attrName) {
            var field = module.attributes[attrName];
            if(!field.searchable)return;
            var type = 'text', options;
            if(field.type == 'BOOLEAN'){
                type = 'combobox';
                options = {
                    valueField:'val',
                    textField:'text',
                    data: [{
                        "val": 'all',
                        "text": util.i18n("All"),
                        "selected":true
                    },{
                        "val":true,
                        "text":util.i18n("Yes")
                    },{
                        "val":false,
                        "text":util.i18n("No")
                    }]
                };
            } else if(field.type == 'ENUM'){
                type = 'combobox';
                var vals = field.values;
                var data = [];
                $.each(vals, function(index, val) {
                     data.push({'val':val, 'text': util.i18n(val)});
                });
                options = {valueField:'val', textField:'text', data: data};
            }
            if(field.ref){
                type = 'combobox';
                options = {valueField: 'id', textField: 'text',url:pageConfig.urlPrex+'/api/'+field.ref+'/searchAndCount'};
            }
            if(attrName=='dataTypeId'){
                options.all = true;
            }
            searchBar.append(util.i18n(attrName)+': ');
            var input = createField(type, attrName, false, false, searchBar, options);
            // input.css('width', '80px');
        })
        var $btnSearch = $('<a href="#" class="easyui-linkbutton searchButtom" iconCls="icon-search">'+util.i18n('Search')+'</a>');
        searchBar.append($btnSearch);
        $btnSearch.css('margin-left', '3px');

        $btnSearch.on('click', function () {
            var p = util.getBoxModel(searchBar);
            Object.keys(p).forEach(function (attr) {
                var val = p[attr];
                if (val.trim().length == 0 || val == 'all') {
                    delete p[attr];
                } else {
                    if(val === 'true'){
                        p[attr] = true;
                    } else if(val === 'false'){
                        p[attr] = false;
                    } else {
                        p[attr] = {
                            $like: '%' + p[attr] + '%',
                        }
                    }
                    
                }
            })
            listTable.datagrid({
                queryParams: {
                    where: p
                }
            });
            //listTable.datagrid('reload');
        })
    },
    initToolBar: function (module, toolBar, listTable) {

        var self = this;
        toolBar.on('click', 'a[iconcls="icon-add"]', function () {
            //$.messager.alert('add');
            var title = util.i18n('add')+':' + (module.text || module.moduleName);
            var tab = self.createAddOrUpdateTab2(module, function (data) {
                util.adminApi(module.modulePath, 'add', data, function () {
                    self.tabs.tabs('close', title);
                    listTable.datagrid('reload');
                    if (module.modulePath == 'table/Table' || module.modulePath == 'table/Column') {
                        refreshTree(refreshModuleDefined);
                    }
                })
            });
            self.tabs.tabs("add", {
                title: title,
                content: tab,
                closable: true,

            });
            return tab;
        })
        toolBar.on('click', 'a[iconcls="icon-edit"]', function () {
            //$.messager.alert('add');
            console.log(module);
            var list = listTable.datagrid('getChecked');
            if (list && list.length == 1) {
                var obj = list[0];
                if (obj['fieldEditable'] === false) {
                    $.messager.alert(it.util.i18n("Admin_tabManager_Tip"), it.util.i18n("Admin_tabManager_Forbid_Editing"));
                    return;
                }
                var options = {};
                module.keys.forEach(function (key) {
                    options[key] = obj[key];
                })
                util.adminApi(module.modulePath, 'get', {where: options}, function (data) {
                    var title = util.i18n('update')+':' + (module.text || module.moduleName);
                    var tab = self.createAddOrUpdateTab2(module, function (newData) {

                        options = {};
                        module.keys.forEach(function (key) {
                            options[key] = newData[key];
                            delete newData[key];
                        })

                        util.adminApi(module.modulePath, 'update', {
                            value: newData,
                            options: options
                        }, function () {
                            self.tabs.tabs('close', title);
                            listTable.datagrid('reload');
                            if (module.modulePath == 'table/Table' || module.modulePath == 'table/Column') {
                                refreshTree(refreshModuleDefined);
                            }
                        })
                    }, true, data);
                    self.tabs.tabs("add", {
                        title: title,
                        content: tab,
                        closable: true,

                    });
                })
            } else {
                $.messager.alert(it.util.i18n("Admin_tabManager_Tip"), it.util.i18n("Admin_tabManager_Only_one_selected_update"))
            }
        })
        toolBar.on('click', 'a[iconcls="icon-remove"]', function () {
            //$.messager.alert('add');
            var list = listTable.datagrid('getChecked');
            if (list && list.length == 1) {
                var obj = list[0];
                var o = {};
                module.keys.forEach(function (key) {
                    o[key] = obj[key];
                })
                util.adminApi(module.modulePath, 'remove', o, function () {
                    listTable.datagrid('reload');
                    if (module.modulePath == 'table/Table' || module.modulePath == 'table/Column') {
                        refreshTree(refreshModuleDefined);
                    }
                })
            }else{
                $.messager.alert(it.util.i18n("Admin_tabManager_Tip"), it.util.i18n("Admin_tabManager_Only_one_selected_delete"))
            }
        })
    },
    addListTab: function (options) {

        var title = options.title;
        var module = options.module;
        if (this.isAdd(title)) {
            this.select(title);
            this.refresh(title);
            return;
        }

        var box = $('<div class="' + title + '" />').append();
        var toolbarBox = $('<div class="toolbarBox" />').appendTo(box);
        toolbarBox.append('' +
            '<div class="toolbar" style="padding:2px 5px;">' +
            '	<a href="#" class="easyui-linkbutton" class="add" iconCls="icon-add" plain="true">'+util.i18n('add')+'</a>' +
            '	<a href="#" class="easyui-linkbutton" iconCls="icon-edit" plain="true">'+util.i18n('update')+'</a>' +
            '	<a href="#" class="easyui-linkbutton" iconCls="icon-remove" plain="true">'+util.i18n('delete')+'</a>' +
            '</div>' +
            '<div class="searchBar datagrid-toolbar" style="padding:2px 5px;">  ' +
            '</div>' +
            ''
        )

        var contentBox = $('<div class="contentBox"></div>').appendTo(box);
        var listTable = $('<table class="listTable"></table>').appendTo(contentBox);

        var toolbar = toolbarBox.find('.toolbar');
        var searchBar = toolbarBox.find('.searchBar');
        this.initSearchBar(module, searchBar, listTable);
        this.initToolBar(module, toolbar, listTable);


        var columns = [];
        columns.push({checkbox: true, resizable: true, field: '_____cb'})
        Object.keys(module.attributes).forEach(function (attrName) {
            var attr = module.attributes[attrName];
            if (attr['hidden'] == true) {
                return;
            }
            var col = {field: attrName, title: util.i18n(attrName), width: null, sortable: true, resizable: true};
            if(attr.json){
                col.formatter = function(value,row,index){
                    return JSON.stringify(value);
                }   
            }
            columns.push(col)
        })
        //var url = "./api/" + module.modulePath.replace('/', '.') + "/findAndCountForEasyUI";


        var tab = this.tabs.tabs("add", {
            title: title,
            content: box,
            closable: true,
        });

        listTable.datagrid({
            title: module.moduleName,
            //url: url,
            columns: [columns],
            toolbar: toolbarBox,
            pagination: true,
            pageSize: 20,
            autoRowHeight: true,
            loader: function (param, success, error) {
                param.page = param.page || 1;
                param.rows = param.rows || 20;
                param.offset = (param.page - 1) * param.rows;
                param.limit = param.rows;
                if (param.order) {
                    param.order = param.sort + ' ' + param.order
                }
                if (!param.where) {
                    param.where = {}
                }
                if (options.args) {
                    param.where['modulePath'] = options.args.module.modulePath;
                }
                util.adminApi(module.modulePath, 'searchAndCount', param, function (data) {
                    data.total = data.count;
                    success(data)
                }, error)
            },
            fitColumns: true,
            singleSelect: false,
            rownumbers: true,
            checkOnSelect: true,
            selectOnCheck: true,
            ctrlSelect: true,
            checkbox: true,
            onSelect: function (index, row) {
                //如果是选中禁止编辑的字段,那么disabled编辑按钮和delete按钮
                if (row['fieldEditable'] === false) {
                    toolbar.find('a[iconcls="icon-edit"]').hide();
                    toolbar.find('a[iconcls="icon-remove"]').hide();
                } else {
                    toolbar.find('a[iconcls="icon-edit"]').show();
                    toolbar.find('a[iconcls="icon-remove"]').show();
                }
            }
        });
        return tab;
    },
    refresh: function (title) {
        var tab = this.getTab(title);
        if (tab) {
            tab.find('.listTable').datagrid('reload');
        }
    },
    getTab: function (which) {
        return this.tabs.tabs('getTab', which);
    },
    isAdd: function (title) {
        var tab = this.getTab(title);
        return !!tab;
    },
    createAddOrUpdateTab2: function (module, submit, isUpdate, values) {
        var props = [], noEmps = [];
        Object.keys(module.attributes).forEach(function (name) {
            var v = module.attributes[name], value = values?values[name]:null;
            if(v instanceof Object){
                if(v.editable === false)return;
                if(v.autoIncrement === true)return;
                if((v.allowNull != undefined && v.allowNull != true) || v.primaryKey == true || v.unique == true)noEmps.push(name);
                value = value || v.defaultValue;
            }
            if(customField[module.id] && customField[module.id][name]){
                // props[name] = {text: name, isCustom: true, attr: v, value: value};
                props.push({label:name, id:name, isCustom: true, value: value, module:module.id, attr: v});
                return;
            }
            var prop = {label:name, id:name, value: value, json: v.json};
            if(isUpdate){
                if(module.keys.indexOf(name)>-1)prop.readonly = true;
            }
            var type = 'text';
            if(v.type == 'BOOLEAN'){
                type = 'checkbox';
            } else if(v.type == 'ENUM'){
                type = 'select';
                var data = [];
                $.each(v.values, function(index, val) {
                     data.push({'value':val, 'label': util.i18n(val)});
                });
                prop.items = data;
            }
            if(v.ref){
                type = 'select';
                prop.params = {
                    valueField: 'id',
                    url: pageConfig.urlPrex+'/api/' + v.ref + '/search'
                };
            }
            prop.type = type
            props.push(prop);
        });
        var form = util.createForm(props, true, function(result){
            submit && submit(result);
        },{left:2,right:8});
        if(noEmps.length){
            var opt = {};
            $.each(noEmps, function(index, val) {
                opt[val] = {validators: [it.validator.notEmpty(val)]};
            });
            util.initValidator(form, opt);
        }
        return form;
    },
    createAddOrUpdateTab: function (module, submit, isUpdate, values) {
        var fields = {};
        Object.keys(module.attributes).forEach(function (attrName) {
            var v = module.attributes[attrName];
            if (v instanceof Object && v.editable === false) {
                return;
            }
            var require = false;
            if (v instanceof Object && v.autoIncrement === true) {
                return;
            }
            if (v instanceof Object && ((v.allowNull != undefined && v.allowNull != true) || v.primaryKey == true || v.unique == true)) {
                require = true;
            }
            var value = values?values[attrName]:null;
            if (v instanceof Object) {
                value = value || v.defaultValue;
            }
            if(customField[module.id] && customField[module.id][attrName]){
                fields[attrName] = {text: attrName, isCustom: true, attr: v, value: value};
                return;
            }
            var setting = {
                text: attrName,
                required: require,
                readonly: false,
                value: value,
                json: v.json
            };
            var type = 'text';
            if(v.type == 'BOOLEAN'){
                type = 'checkbox';
            } else if(v.type == 'ENUM'){
                type = 'combobox';
                var vals = v.values;
                var data = [];
                $.each(vals, function(index, val) {
                     data.push({'id':val, 'text': util.i18n(val)});
                });
                setting.options = {valueField:'id', textField:'text', data: data};
            }
            if(v.ref){
                type = 'combobox';
                setting.options = {valueField: 'id', textField: 'text',url:pageConfig.urlPrex+'/api/'+v.ref+'/searchAndCount'};
            }
            if(value && setting.options){
                setting.options.value = value;
            }
            setting.type = type
            fields[attrName] = setting;
        })
        if (isUpdate && module.keys) {
            module.keys.forEach(function (key) {
                fields[key]['readonly'] = true;
            })
        }
        var id = new Date().getTime();
        var form = $("<form method = 'post' id = '" + id + "'></form>");
        var table = $("<table></table>").appendTo(form);
        var map = {};
        for (var p in fields) {
            var v = fields[p];
            var tr = $("<tr></tr>").appendTo(table);
            var td = $("<td></td>").appendTo(tr).css("margin", "5px");
            // td.css("margin", "5px");
            var label = $("<label for = '" + p + "'> " + util.i18n(v.text) + ": </label>").appendTo(td);
            var td = $("<td></td>").appendTo(tr).css("padding", "5px");
            // td.css("padding", "5px");
            var field;
            if(v.isCustom){
                var cf = customField[module.id][p];
                field = cf.getField(v.attr, td);
                cf.setVal(field, v.value);
            } else {
                field = createField(v.type, p, v.required, v.readonly, td, v.options);
                if(v.type == 'checkbox'){
                    field.attr('checked', v.value);
                } else {
                    var val = v.value;
                    if(v.json && val){
                        val = JSON.stringify(val);
                    }
                    if(v.type == 'combobox'){
                        // setTimeout(function(){
                        //     field.combobox('setValue', val);
                        // }, 500);
                        
                    } else {
                        field.val(val);
                    }
                    
                }
            }
            map[p] = field;
        }
        var tr = $("<tr></tr>").appendTo(table);
        var td = $("<td></td>").appendTo(tr);
        var td = $("<td></td>").appendTo(tr);
        var divButton = $("<div></div>").appendTo(td);
        var buttonOK = $('<a href="#" class="easyui-linkbutton" iconCls="icon-save">'+util.i18n('save')+'</a>').appendTo(divButton);

        form.css("padding", "10px");
        divButton.css("padding", "10px").css("float", "right");

        buttonOK.click(function () {
            var valid = $('#' + id + '').form('validate');
            if (!valid) {
                return;
            }
            var data = {};
            for (var p in map) {
                var field = map[p], val;
                if(customField[module.id] && customField[module.id][p]){
                    val = customField[module.id][p].getVal(field);
                } else {
                    var v = fields[p];
                    val = field.val();
                    if(v.json){
                        val = val?JSON.parse(val):val;
                    }
                    if(v.type == 'checkbox'){
                        val = map[p].is(':checked');
                    } else if(v.type == 'combobox'){
                        val = map[p].combobox('getValue');
                    }
                }
                data[p] = val;
            }
            submit && submit(data);
        });
        return form;
    }
}