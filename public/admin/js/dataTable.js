if (!window.sdk) {
    sdk = {};
}
if (!window.it) {
    it = {};
}
if (!it.DataTable) {
    it.DataTable = function() {
        this.serverSide = true;
    };
}
var DataTable = sdk.DataTable = it.DataTable;
var urls;

mono.extend(DataTable, Object, {
    init: function(options, parent) {
        var $panel = $('<div class="tab_contentPanel"></div>').appendTo(parent);
        var $searchBar = this.createSearchBar(options);
        if ($searchBar) {
            $searchBar.prependTo($panel);
        }
        this.createTable(options, $panel);
        return $panel;
    },
    createSearchBar: function(options) {
        var props = [],
            module = options.module;
        $.each(module.attributes, function(attr, field) {
            if (!field.searchable) return;
            var type = 'text',
                options;
            var prop = { label: util.i18n(attr), id: attr, json: field.json };

            if (field.type == 'BOOLEAN') {
                type = 'select';
                var data = [
                    { 'value': 'all', 'label': util.i18n("All") },
                    { 'value': true, 'label': util.i18n("Yes") },
                    { 'value': false, 'label': util.i18n("No") }
                ];
                prop.items = data;
            } else if (field.type == 'ENUM') {
                type = 'select';
                var data = [];
                $.each(field.values, function(index, val) {
                    if (val instanceof Object) {
                        data.push({ 'value': val.value, 'label': util.i18n(val.label) });
                    } else {
                        data.push({ 'value': val, 'label': util.i18n(val) });
                    }

                });
                prop.items = data;
            }
            if (field.ref) {

                // type = 'select';
                // prop.params = {
                //     valueField: 'id',
                //     url: '/api/' + field.ref + '/search',
                //     forSearch: true
                // };
                //

                if (field.ref === "datatype" || field.ref === "data" || field.ref === "category") {
                    var searchOptions = dtSetting.refTablePicker[field.ref];
                }
                type = 'picker';
                prop.params = {
                    title: field.ref,
                    target: field.refField || 'id',
                    url: it.util.wrapUrl(field.ref + '/searchAndCount'),
                    columns: dtSetting.refTable[field.ref],
                    searchOptions: searchOptions
                };
            }
            prop.type = type
            props.push(prop);
        });
        if (props.length == 0) return;
        var self = this;
        var form = util.createForm(props, true, function(result) {
            $.each(result, function(attr, val) {
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
            $.each(result, function(index, val) {
                if (util.is(val, 'String')) {
                    qo[index] = { '$like': '%' + val + '%' };
                } else {
                    qo[index] = val;
                }
            });
            // self.search(table, module.modulePath, result);
            self._queryOption = qo;
            //判断datatable的模式：client-side模式还是server-side模式
            if (self.serverSide) {
                //server-side模式
                self._table.draw();
            } else {
                //client-side模式
                self._table.ajax.reload();
            }

        }, { inline: true, showColon: false, buttonText: util.i18n('Query') });
        return form;
    },
    search: function(table, mp, params) {
        util.adminApi(mp, 'searchAndCount', { where: params }, function(data) {
            table.clear();
            table.rows.add(data.rows).draw();
        });
    },
    /**
     * 通用复选框,通过数据字典中checkBoxsUi的数组截取URI字段,判断在相应页面添加.
     * 王飞
     */
    getCheckBox: function(show) {
        var checkboxColumn = {
            className: "td-checkbox",
            orderable: false,
            data: null,
            title: '<input type="checkbox" name="cb-check-all"  id="cb-check-all">',
            render: function(data, type, row, meta) {
                return '<input type="checkbox" name ="subBox" value=' + JSON.stringify(row.id) + '>';
            }
        };
        return show ? checkboxColumn : false;
    },

    createTable: function(options, parent) {
        var cols = [],
            module = options.module,
            mps = dtSetting[module.modulePath];
        if (module.element != null) {
            var checkBox = this.getCheckBox(module.element.showCheckBox);
            if (checkBox != false) {
                cols.push(checkBox);

            }
        }
        $.each(module.attributes, function(attr, field) {

            var col = { "data": attr, "title": util.i18n(attr) };
            if (field.hidden) return;

            if (field.type == 'TEXT') {
                col.render = function(data) {
                    if (!data) {
                        return '';
                    }
                    if (field.json) {
                        data = JSON.stringify(data);
                    }
                    if (data.length < 100) {
                        return data;
                    }
                    var b = $('<div class="text-view"></div>')
                    var pvba = $('<span style="display:none" class="all"></span>').appendTo(b);
                    pvba.text(data);
                    var pvb = $('<span class="cut"></span>').appendTo(b);
                    var pv = data.substr(0, 20);
                    pvb.text(pv + ' ... ...');
                    $('<br>').appendTo(b);
                    var s = $('<a class="openBtn">' + it.util.i18n("Admin_dataTable_Expand") + '</a>').appendTo(b);

                    return b.html();
                }
            } else if (field.json) {
                col.render = function(data) {
                    return JSON.stringify(data);
                }
            } else if (field.type == 'DATE') {
                col.render = function(data) {
                    var s = moment(data).format('YYYY-MM-DD HH:mm:ss');
                    return s;
                }
            } else if (field.type == 'ENUM') {
                col.render = function(data) {
                    return util.i18n(data);
                }
            }

            if (mps && mps.cols && mps.cols[attr] && mps.cols[attr].render) {
                col.render = mps.cols[attr].render;
            }
            if (!field.hidden) {

                cols.push(col);
            }

        });
        var self = this;
        var $table = this.$table = $('<table class="table table-striped table-bordered" width="100%" ></table>').appendTo(parent);
        var scrollX = false;
        if (mps) {
            scrollX = mps.scrollX;
        }

        $table.on('click', '.openBtn', function() {
            event.preventDefault()
            event.stopPropagation();
            var btn = $(this);
            btn.toggleClass('on');
            var pvba = btn.parent().find('.all');
            var pvb = btn.parent().find('.cut');
            if (btn.hasClass('on')) {
                btn.text(it.util.i18n("Admin_dataTable_Collapse"));
                pvba.show();
                pvb.hide();
            } else {
                btn.text(it.util.i18n("Admin_dataTable_Expand"));
                pvb.show();
                pvba.hide();
            }
        }).on('click', '.td-checkbox', function() {
            !$(event.target).is(":checkbox") && $(":checkbox", this).trigger("click");
        })

        var table = this._table = $table.DataTable({

            ajax: function(data, callback, settings) {
                var param = {};
                if (self.serverSide) {
                    param.offset = parseInt(data.start);
                    param.limit = parseInt(data.length);
                    var orders = data.order;
                    if (orders.length > 0) {
                        var order = orders[0];
                        var col = data.columns[order.column];
                        if (col.data) {
                            param.order = col.data + ' ' + order.dir;
                        }

                    }
                }
                if (self._queryOption) {
                    param.where = self._queryOption;
                }
                it.util.adminApi(module.modulePath,'searchAndCount',param,
                function(result){
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
                },function(error){
                    util.msg(it.util.i18n("Admin_dataTable_Search_fail"));
                }
                );
            },
            columns: cols,
            // dom: "lrtip",
            select: 'single',
            processing: true,
            scrollX: true,
            scrollY: 500,
            scrollCollapse: true,
            fixedColumns: true,
            serverSide: true,
            // searching: false,
            buttons: []
        });


        var $btnGroup = this.getleftToolBar(module);
        $btnGroup.appendTo($('.col-sm-6:eq(0)', table.table().container()));

        var btnExport2xsl = this.getBtnExport2Xsl(module, table);
        btnExport2xsl.css('margin-right', '10px');
        btnExport2xsl.prependTo($('.dataTables_filter', table.table().container()));
        // $('.dataTables_filter', table.table().container()).find("label").css("display", "none");

        //修改显示条数功能移到左下方
        var $lenFun = $('.col-sm-6:eq(0)', table.table().container()).children(':first-child');
        var $count = $('.col-sm-5:eq(0)', table.table().container()).children(':first-child');

        var $row = $('<div class="row"></div>');
        $row.append($('<div class="col-sm-5"></div>').append($lenFun));
        $row.append($('<div class="col-sm-7"></div>').append($count.css('paddingTop', '4px')));
        $row.appendTo($('.col-sm-5:eq(0)', table.table().container()));

        //加载,数据
        // search(table, module.modulePath, {});

        // Display the buttons
        // new $.fn.dataTable.Buttons( table, [
        //     { extend: "create", editor: editor },
        //     { extend: "edit",   editor: editor },
        //     { extend: "remove", editor: editor }
        // ] );
        //方案1 不显示，修改显示条数功能
        // table.buttons().container()
        //     .appendTo( $('.col-sm-6:eq(0)', table.table().container() ) );

        //方案2 按钮单独一行
        // var $row = $('<div class="row"></div>');
        // $(table.table().container()).prepend($row);
        // table.buttons().container().addClass('col-sm-12').appendTo($row);

        //方案3 修改显示条数功能放到下面


        return $table;
    },
    getBtnExport2Xsl: function(module, table) {

        var mp = module.modulePath
            //add export to excel button
        var $btnExport2xsl = this.createButton('export2xsl');
        $btnExport2xsl.click(function(event) {
            var name = util.i18n(mp);
            //put all export data to values
            var values = [];
            //put one row data to value
            var value = [];
            //get all column name
            var columns = new twaver.List();
            table.columns()[0].forEach(function(i) {
                columns.add(table.column(i).dataSrc());
            });

            //get header name, put them to values
            var header = table.table().header();
            $('th', header).each(function(i, th) {
                value.push($(th).text());
            });
            values.push(value);

            //get all datas, put data to values
            var datas = table.data();
            for (var i = 0; i < datas.length; i++) {
                var data = datas[i];
                value = [];
                for (var j in data) {
                    if (!columns.contains(j)) continue;
                    if (data[j] instanceof Object) {
                        value.push(JSON.stringify(data[j]));
                    } else {
                        value.push(data[j]);
                    }
                }
                values.push(value);
            }

            var options = { fileName: name, sheets: {} };
            options.sheets[name] = { data: values };
            util.export2excel(options);
            return false;
        });
        return $btnExport2xsl;
    },
    createCustomBtn: function(btnGroup,table){},
    deselectTableRow: function(){},
    selectTableRow: function(){},
    getleftToolBar: function(module) {
        var $table = this._$table;
        var $btnGroup = this.createBtnGroup().addClass('col-sm-12').css({
            paddingLeft: 0,
        });
        var $btnAdd = this.createButton('create', $btnGroup);
        var $btnEdit = this.createButton('edit', $btnGroup).attr('disabled', true);
        var $btnRemove = this.createButton('remove', $btnGroup).attr('disabled', true);
        var $btnCopy = this.createButton('copy', $btnGroup).hide();

        if (module.element != null) {
            if (module.element.showCopyBtn)
                $btnCopy = this.createButton('copy', $btnGroup).attr('disabled', true);
        }

        if (module.modulePath == 'operation_log' || module.modulePath == 'event_instance') {
            $btnGroup.hide();
        }

        var table = this._table,
            selectedIndexes, self = this;
        this._selectedIndexes = selectedIndexes;
        this.createCustomBtn($btnGroup, table);
        table.on('deselect', function(e, table, type, indexes) {
            if (type === 'row') {
                $btnEdit.attr('disabled', true);
                $btnRemove.attr('disabled', true);
                $btnCopy.attr('disabled', true);
                selectedIndexes = undefined;
                self.deselectTableRow();
            }
        });
        table.on('select', function(e, table, type, indexes) {
            if (type === 'row') {
                $btnEdit.attr('disabled', false);
                $btnRemove.attr('disabled', false);
                $btnCopy.attr('disabled', false);
                selectedIndexes = indexes;
                self.selectTableRow();
            }
        });


        $('#cb-check-all').click(function(e) {
            // var $target = $(e.target);
            var rootCheck = e.target.checked;
            $('input[name="subBox"]').each(function(index, ele) {
                ele.checked = rootCheck;
            });
            if (rootCheck) {
                $btnRemove.attr('disabled', false);
            } else {
                $btnRemove.attr('disabled', true);
            }


        });
        var updateMenu = function(mp) {
            if (mp == 'custom_table' || mp == 'custom_column') {
                //更新左侧的树
                //it.module.reload();
            }
        }
        var mp = module.modulePath,
            self = this;
        $btnAdd.click(function(event) {
            var id = 'add' + mp;
            var customPage = it.customPage[id],
                panel;
            if (customPage) {
                panel = customPage({id:id,table:table});
            } else {
                panel = self.createAddOrUpdateTab(module, function(data) {

                    util.adminApi(mp, 'add', data, function(dd) {

                        if (dd instanceof Array) {
                            dd = dd[0];
                        }
                        if (dd.ii) {
                            data.ii = dd.ii;
                        }
                        if (dd.id) {
                            data.id = dd.id;
                        }
                        tabPanel.$panel.bootstrapTab('remove', id);
                        table.row.add(data).draw();
                        updateMenu(mp);
                    })
                });
            }

            var opt = {
                id: id,
                text: util.i18n('add') + ':' + util.i18n(mp),
                closeable: true,
                content: panel
            };
            tabPanel.$panel.bootstrapTab('add', opt);
        });
        $btnCopy.click(function(event) {
            var id = 'copy' + mp;
            var row = table.row(selectedIndexes).data();
            if (row) {
                if (row.name != undefined || row.ii != undefined) {
                    // delete row.ii;
                    row.name = '';
                }
                row.description = '';
            }

            var customPage = it.customPage[id],
                panel;
            if (customPage) {
                panel = customPage(row);
                if (!panel) return;
            } else {
                panel = self.createAddOrUpdateTab(module, function(data) {

                    it.util.adminApi(mp, 'add', data, function(dd) {

                        if (dd instanceof Array) {
                            dd = dd[0];
                        }
                        if (dd.ii) {
                            data.ii = dd.ii;
                        }
                        if (dd.id) {
                            data.id = dd.id;
                        }
                        tabPanel.$panel.bootstrapTab('remove', id);
                        table.row.add(data).draw();
                        updateMenu(mp);
                    })
                }, false, row);
            }
            var opt = {
                id: id,
                text: util.i18n('copy') + ':' + util.i18n(mp),
                closeable: true,
                content: panel
            };
            tabPanel.$panel.bootstrapTab('add', opt);
        });
        $btnEdit.click(function(event) {
            var row = table.row(selectedIndexes).data();
            var id = 'update' + mp;
            var customPage = it.customPage[id],
                panel;
            var theOldId;
            if(row&&row.id){
                theOldId = row.id;
            }
            if (customPage) {
                panel = customPage(row, table);
                if (!panel) return;
            } else {
                panel = self.createAddOrUpdateTab(module, function(data) {
                    if (!data) return;
                    var options = {};
                    module.keys.forEach(function(key) {
                        options[key] = data[key] || row[key];
                        // delete data[key];
                    })
                    var theNewId = data.id;
                    it.util.adminApi(mp, 'update', { value: data, options: options }, function() {
                        tabPanel.$panel.bootstrapTab('remove', id);
                        table.row(selectedIndexes).data(data).draw();
                        updateMenu(mp);
                    })
                    if(theOldId&&theNewId&&theOldId!=theNewId){
                        //找到父节点为theOldId的数据，将其父节点编号改为theNewID
                        it.util.adminApi('data','searchAndCount',{ offset:0, where:{parentId:{$like:theOldId}}},function(result){
                            if(result){
                                var values=[];
                                result.rows.forEach(function(element){
                                    element.parentId = theNewId;
                                    values.push(element);
                                })
                                it.util.adminApi('data','batchUpdate',values,function(data){
                                    // console.log(data);
                                })
                            }
                        })
                    }
                }, true, row);
            }
            var opt = {
                id: id,
                text: util.i18n('update') + ':' + util.i18n(mp),
                closeable: true,
                content: panel
            };
            tabPanel.$panel.bootstrapTab('add', opt);
        });
        $btnRemove.click(function(event) {
            var row = table.row(selectedIndexes).data(),
                opt = {};
            var optArr = [];
            var optAll = {};

            $('input[name="subBox"]').each(function(index, ele) {

                if (ele.checked) {
                    optAll = {
                        id: ele.value
                    }
                    optArr.push(optAll);

                }

            })
            module.keys.forEach(function(key) {
                opt[key] = row[key];
            })
            if (opt.ii && !opt.id) {
                opt.id = row.id;
            }
            if (optArr.length > 1) {
                util.confirm(it.util.i18n("Admin_dataTable_Confirm_Alldelete"), function() {
                    for (var i = 0; i < optArr.length; i++) {
                        util.adminApi(mp, 'remove', optArr[i], function() {

                            //同步client-side的数据
                            table.row(selectedIndexes).remove().draw();
                            // 如果删除的是自定义table和列，更新左侧的树
                            updateMenu(mp);

                            //删除后，选中才能操作的按钮不能操作
                            $btnEdit.attr('disabled', true);
                            $btnRemove.attr('disabled', true);
                            $btnCopy.attr('disabled', true);
                            selectedIndexes = undefined;
                        })
                    }

                });
            } else if (row) {
                //弹出确认框
                util.confirm(it.util.i18n("Admin_dataTable_Confirm_delete"), function() {
                    util.adminApi(mp, 'remove', opt, function() {
                        //同步client-side的数据
                        table.row(selectedIndexes).remove().draw();
                        // 如果删除的是自定义table和列，更新左侧的树
                        updateMenu(mp);

                        //删除后，选中才能操作的按钮不能操作
                        $btnEdit.attr('disabled', true);
                        $btnRemove.attr('disabled', true);
                        $btnCopy.attr('disabled', true);
                        selectedIndexes = undefined;
                    })
                });

            } else {
                util.msg('selectaRowAtLeast');
            }
        });

        return $btnGroup;
    },
    createBtnGroup: function() {
        return $('<div class="btn-group" role="group">');
    },
    createButton: function(text, group) {
        var btn = $('<button type="button" class="btn btn-default">' + util.i18n(text) + '</button>');
        if (group) group.append(btn);
        return btn;
    },
    createAddOrUpdateTab: function(module, submit, isUpdate, values) {


        var props = [],
            noEmps = {},
            uniqueMap = {};
        Object.keys(module.attributes).forEach(function(name) {
            var v = module.attributes[name],
                value = values ? values[name] : null;
            if (v instanceof Object) {
                if (v.editable === false) return;

                if (!isUpdate && v.autoIncrement === true) return;
                if (v.type !== 'BOOLEAN' &&
                    (v.allowNull != undefined && v.allowNull != true) ||
                    v.primaryKey == true || v.unique == true) noEmps[name] = { name: name };

                if (v.unique == true) {
                    uniqueMap[name] = { name: name };
                }
                // value = value || v.defaultValue;
                //add By Kevin 2016-12-07这个value很有可能就是false，当然也有可能就是0，甚至有可能就是null(当是人为的设置成null时就一定要用defaultValue么?)
                // if(value === 0 || value){
                if (value != null && value != undefined) {
                    value = value;
                } else {
                    value = v.defaultValue;
                }
            }
            if (customField[module.id] && customField[module.id][name]) {
                props.push({ label: name, id: name, isCustom: true, value: value, module: module.id, attr: v });
                return;
            }
            var prop = { label: name, id: name, value: value, json: v.json };
            if (isUpdate) {

                // if (module.keys.indexOf(name) > -1 && name === 'ii') {
                if (module.keys.indexOf(name) > -1) {
                    prop.readonly = true;
                }

            }
            var type = 'text';
            if (v.type == 'BOOLEAN') {
                type = 'checkbox';
            } else if (v.type == 'ENUM') {
                type = 'select';
                var data = [];
                $.each(v.values, function(index, val) {
                    data.push({ 'value': val, 'label': util.i18n(val) });
                });
                prop.items = data;
            } else if (v.json) { //v.type == 'TEXT' || v.json
                type = 'jsonarea';
            }
            if (v.ref) {
                // type = 'select';
                // prop.params = {
                //     valueField: 'id',
                //     url: '/api/' + v.ref + '/search'
                // };
                
                if (v.ref === "datatype" || v.ref === "data" || v.ref === "category") {
                    var searchOptions = dtSetting.refTablePicker[v.ref];
                }

                type = 'picker';
                prop.params = {
                    title: v.ref,
                    target: v.refField || 'id',
                    url: it.util.wrapUrl(v.ref + '/searchAndCount'),
                    columns: dtSetting.refTable[v.ref],
                    searchOptions: searchOptions,
                };
            }
            // 密码输入框
            if (v.isPwd) {
                type = 'password';
                prop.value = undefined;
            }

            prop.type = type
            props.push(prop);
            if (noEmps[name]) {
                noEmps[name]["type"] = type;
            }
        });
        var form = util.createForm(props, true, function(result) {
            if (result.categoryId === 'rack' && result.childrenSize) {
                if (JSON.stringify(result.childrenSize) === '{}' || JSON.stringify(result.model).length == 2 || JSON.stringify(result.simpleModel) == 2) {
                    alert("机柜模型的孩子尺寸,模型,简单模型是必填项");
                    return;
                }
            } else if (result.categoryId === 'equipment' && result.modelParameters && result.size) {
                if (JSON.stringify(result.modelParameters) === '{}' || JSON.stringify(result.size) === '{}') {
                    alert("设备模型的尺寸,模型参数是必填项");
                    return;
                }
            }
            if (!result) return;
            submit && submit(result);
        }, { left: 2, right: 8 });

        var opt = {};
        $.each(noEmps, function(index, val) {
            if (val.type === 'picker') {
                opt[val.name] = {
                    validators: [it.validator.callback('The ' + val.name + ' is required', function(value, validator) {
                        var v = $('#'+val.name+'[data-type="picker"] input', form).val();
                        return v;
                    })]
                };
            } else {
                opt[val.name] = { trigger: 'blur', validators: [it.validator.notEmpty(val.name)] };
            }
        });
        $.each(uniqueMap, function(index, val) {
            var validators = ((opt[val.name] || (opt[val.name] = {})) && opt[val.name].validators) || (opt[val.name].validators = []);
            var params;
            if (isUpdate) {
                params = {
                    ii: { '$ne': values.ii }
                }
            }
            validators.push(it.validator.remote(it.util.i18n("Admin_dataTable_Exist"),
                it.util.wrapUrl(module.modulePath + '/exist'), val.name, params));
        });
        util.initValidator(form, opt);
        return form;
    }
});
var longStringRender = function(data) {
    if (!data) return data;
    var data = JSON.stringify(data);
    if (data.length > dtSetting.SHOW_LENGHT) {
        var result = data.slice(0, dtSetting.SHOW_LENGHT + 1);
        return result + ' ... ...';
    }
    return data;
}

var dtSetting = {
    SHOW_LENGHT: 20,
    data: { scrollX: true },
    datatype: {
        scrollX: true,
        cols: {
            // "modelParameters": {
            //     render: longStringRender
            // },
            "simpleModelParameters": {
                render: longStringRender
            },
            // "model2dParameters": {
            //     render: longStringRender
            // },
            // "model2d2Parameters": {
            //     render: longStringRender
            // },
            "positionExp": {
                render: longStringRender
            }
        },
    },
    refTable: {
        "data": [
            { "data": "id", "title": "#" },
            { "data": "description", "title": it.util.i18n("Admin_dataTable_Description") },
            { "data": "parentId", "title": it.util.i18n("Admin_dataTable_Parent") },
            { "data": "dataTypeId", "title": it.util.i18n("Admin_dataTable_Asset_Model") }
        ],
        "datatype": [
            { "data": "id", "title": "#" },
            { "data": "categoryId", "title": it.util.i18n("Admin_dataTable_Category") + "#" },
            { "data": "description", "title": it.util.i18n("Admin_dataTable_Description") },
        ],
        "category": [
            { "data": "id", "title": "#" },
            { "data": "description", "title": it.util.i18n("Admin_dataTable_Description") },
        ],
        "dataAndDateType": [
            { "data": "dataId", "title": "#" },
            { "data": "dataTypeId", "title": it.util.i18n("Admin_dataTable_Category") + "#" },
            { "data": "model", "title": it.util.i18n("Admin_dataTable_Model") },
            { "data": "categoryId", "title": it.util.i18n("Admin_dataTable_Preview") },
        ],
        "scene": [
            { "data": "id", 'title': "#" },
            { "data": "categoryId", 'title': it.util.i18n("Admin_dataTable_Category") + "#" },
            { "data": "description", 'title': it.util.i18n("Admin_dataTable_Description") },
        ],
        "business_type": [
            { "data": "id", 'title': "#" },
            { "data": "name", 'title': it.util.i18n("Admin_dataTable_Name") },
            { "data": "description", 'title': it.util.i18n("Admin_dataTable_Description") },
        ],
        "alarm_severity": [
            { "data": "id", 'title': "#" },
            { "data": "displayName", 'title': it.util.i18n("Admin_dataTable_Name") },
        ],
        "custom_menu": [
            { "data": "id", 'title': "#" },
            { "data": "name", 'title': it.util.i18n("Admin_dataTable_Name") },
        ],
        "collector": [
            { "data": "id", 'title': "#" },
            { "data": "description", 'title': it.util.i18n("Admin_dataTable_Description") },
        ],
        "business_object": [
            { "data": "id", 'title': "#" },
            { "data": "type", 'title': it.util.i18n("Admin_dataTable_Name") },
            { "data": "description", 'title': it.util.i18n("Admin_dataTable_Description") },
        ],
        "menu":[
            { "data": "id", 'title': "#" },
            { "data": "name", 'title': it.util.i18n("name") },
            { "data": "description", 'title': it.util.i18n("description") },
        ],
        "action":[
            { "data": "id", 'title': "#" },
            { "data": "name", 'title': it.util.i18n("name") },
            { "data": "description", 'title': it.util.i18n("description") },
        ]
    },
    refTablePicker: {
        "data": [
            { label: "编号", id: "id", json: undefined, type: "text" },
            { label: "描述", id: "description", json: undefined, type: "text" },
            { label: "父对象", id: "parentId", json: undefined, type: "text" },
            { label: "资产模型编号", id: "dataTypeId", json: undefined, type: "text" }
        ],
        "datatype": [
            { label: "编号", id: "id", json: undefined, type: "text" },
            { label: "分类#", id: "categoryId", json: undefined, type: "text" },
            { label: "描述", id: "description", json: undefined, type: "text" }
        ],
        "category": [
            { label: "编号", id: "id", json: undefined, type: "text" },
            { label: "描述", id: "description", json: undefined, type: "text" },
        ],
    }
}