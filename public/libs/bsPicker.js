(function($) {
    var util = {};
    util.is = function(o, obj) {
        return Object.prototype.toString.call(o) === '[object ' + obj + ']';
    }
    util.i18n = function(text) {
        return text;
    }
    util.createForm = function(props, showSubmit, callback, opt) {
        if (!props || !props.length) return;
        var showColon;
        if (util.is(showSubmit, 'Object')) {
            opt = showSubmit;
            showSubmit = opt.showSubmit;
            callback = opt.callback;
        }

        opt = opt || {};
        var showColon = opt.showColon != undefined ? opt.showColon : true;
        var formClass = opt.inline ? 'form-inline' : 'form-horizontal';
        var form = $('<form class="' + formClass + '"></form>');
        var left = opt.left || 4;
        var right = opt.right || 12 - left;
        var jsonProps = [];

        $.each(props, function(index, prop) {
            var row = $('<div class="form-group"></div>');
            if (prop.json) {
                jsonProps.push(prop.name || prop.id);
            }
            var input = util.createComponent(prop);
            var label = $('<label for="' + prop.id + '">' + util.i18n(prop.label) + (showColon ? ':' : '') + ' </label>'); //class="col-sm-'+left+'
            if (!opt.inline) {
                label.addClass('col-sm-' + left);
                label.addClass('control-label');
            }
            row.append(label);
            var compDiv = $('<div class="col-sm-' + right + '"></div>')
            if (input) {
                if (prop.type == 'checkbox') {
                    var div2 = $('<div class="checkbox"></div>');
                    var lb = $('<label></label>');
                    div2.append(lb);
                    if (!opt.inline) {
                        compDiv.append(div2);
                    } else {
                        compDiv = div2;
                    }
                    lb.append(input);
                } else {
                    if (!opt.inline) {
                        compDiv.append(input);
                    } else {
                        compDiv = input;
                    }
                }
            }
            row.append(compDiv)
            form.append(row);
        });
        if (showSubmit) {
            var btnText = opt.buttonText != undefined ? opt.buttonText : 'Submit';
            if (!opt.inline) {
                var row = $('<div class="form-group"></div>');
                var div1 = $('<div class="col-sm-offset-' + left + ' col-sm-' + right + '"></div>');
                var btn = $('<button type="submit" class="btn btn-default">' + btnText + '</button>');
                div1.append(btn);
                row.append(div1);
                form.append(row);
            } else {
                var btn = $('<button type="submit" class="btn btn-default">' + btnText + '</button>');
                form.append(btn);
            }
            btn.click(function(event) {
                event.preventDefault();
                var params = util.getFormData(form, jsonProps);
                callback && callback(params);
            });
        }

        return form;
    }
    util.getFormData = function(form, jsonProps) {
        var result = {};
        var f = function($eles) {
            $.each($eles, function(index, ele) {
                var $ele = $(ele),
                    name;
                if ($ele.is('option')) {
                    var $parent = $ele.parent();
                    name = $parent.attr('name') || $parent.attr('id');
                } else {
                    name = $ele.attr('name') || $ele.attr('id');
                }
                if (!name) return;
                var val = $ele.val();
                if ($ele.attr('type') == 'checkbox') {
                    val = $ele.is(':checked');
                }
                if (jsonProps && jsonProps.indexOf(name) > -1) {
                    val = val ? JSON.parse(val) : val;
                }
                result[name] = val;
            });
        }
        f($('input', form));
        f($('textarea', form));
        f($('select option:selected', form));
        $('div[data-type="jsonarea"]', form).each(function(index, el) {
            var $ele = $(el),
                name;
            name = $ele.attr('name') || $ele.attr('id');
            if (!name) return;
            result[name] = el.val();
        });
        $('div[data-type="customField"]', form).each(function(index, el) {
            var $ele = $(el),
                name;
            name = $ele.attr('name') || $ele.attr('id');
            if (!name) return;
            var val;
            if (el.val) {
                val = el.val();
            } else {
                var module = $ele.attr('data-module');
                if (module) {
                    var cf = customField[module][name];
                    val = cf.getVal();
                }
            }
            result[name] = val;
        });
        return result;
    }
    util.createComponent = function(prop) {
        var input;
        if (prop.isCustom) {
            var cf = customField[prop.module][prop.id];
            input = cf.getField(prop);
            cf.setVal(input, prop.value);
            return input;
        }
        prop.type = prop.type || 'text';
        if (prop.type == 'text') {
            input = util.createText();
        } else if (prop.type == 'select') {
            input = util.createSelect(prop);
        } else if (prop.type == 'checkbox') {
            input = util.createCheckbox();
        } else if (prop.type == 'number') {
            input = util.createNumber();
        }
        if (!input) return;
        if (prop.id) {
            input.attr('id', prop.id);
        }
        if (prop.name) {
            input.attr('name', prop.name);
        } else {
            input.attr('name', prop.id);
        }
        if (prop.name) input.attr('name', prop.name);
        if (prop.placeholder) input.attr('placeholder', prop.placeholder);

        if (prop.css) input.css(prop.css);
        if (prop.className) input.addClass(prop.className);
        if (prop.value) {
            if (prop.type == 'checkbox') {
                input.attr('checked', prop.value);
            } else {
                var val = prop.value;
                if (prop.json && val) {
                    val = JSON.stringify(val);
                }
                input.val(val);
            }
        }
        if (prop.readonly) input.attr('readonly', 'readonly');
        return input;
    }
    util.createText = function() {
        return $('<input type="text" class="form-control">');
    }
    util.createNumber = function() {
        return $('<input type="number" class="form-control">');
    }
    util.createCheckbox = function(id, parameters) {
        return $('<input type="checkbox" ></input>');
    }
    util.createPicker = function(prop) {

    };
    util.createSelect = function(prop) {
        var items = prop.items,
            parameters = prop.params;
        var select = $('<select class="form-control"></select>');
        if (items && items.length) {
            $.each(items, function(index, val) {
                var opt = $('<option value="' + val.value + '">' + util.i18n(val.label) + '</option>');
                select.append(opt);
            });
        }
        if (parameters && parameters.url && parameters.valueField) {
            $.ajax({
                url: parameters.url,
                data: parameters.data || {},
                success: function(result) {
                    if (result.value) {
                        var data = result.value;
                        if (parameters.filter) {
                            data = parameters.filter(data);
                        }
                        if (parameters.forSearch) {
                            select.append($('<option value="">' + util.i18n('All') + '</option>'));
                        }
                        $.each(data, function(index, val) {
                            var opt = $('<option value="' + val[parameters.valueField] + '">' + val[parameters.valueField] + '</option>');
                            select.append(opt);
                        });
                    }
                    if (prop.value) {
                        select.val(prop.value);
                    }
                }
            });
        }
        return select;
    }
    util.modal = function(settings, bodyContent, appendedFun, showFooter, showBtnSure, callback) {
        var modal = $('<div class="modal fade"></div>');
        var dialog = $('<div class="modal-dialog"></div>').appendTo(modal);
        var content = $('<div class="modal-content"></div>').appendTo(dialog).css('width', settings.width + 'px');
        var header = $('<div class="modal-header"></div>').appendTo(content);
        var body = $('<div class="modal-body"></div>').appendTo(content);


        header.append($('<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>'));
        header.append($('<h4 class="modal-title">' + util.i18n(settings.title) + '</h4>'));

        bodyContent = bodyContent || $('<p>Nothing</p>');
        body.append(bodyContent);

        if (showFooter) {
            var footer = $('<div class="modal-footer"></div>');
            footer.append($('<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>'));
            if (showBtnSure) {
                var sure = $('<button type="button" class="btn btn-primary">Sure</button>');
                footer.append(sure);
                sure.click(function(event) {
                    if (callback) {
                        var open = callback();
                        if (open) {
                            return;
                        }
                    }
                    modal.modal('hide');
                });
            }
            content.append(footer);
        }

        modal.on('hidden.bs.modal', function(e) {
            //分情况，如果是调用了两个以上的弹出层，则消失的时候给body添加样式
            if($('.modal-backdrop').length > 0){
                $("body").addClass("modal-open");
            }
            modal.remove();
        });
        modal.on('shown.bs.modal', function(e) {
            if (appendedFun) appendedFun(modal);
        })
        modal.modal({ show: true });


        return modal;
    }
    var defaults = {
        searchOptions: [], //{label: 'id',id: 'id',type: ''}
        select: 'single',
        processing: true,
        scrollX: false,
        scrollY: 300,
        scrollCollapse: true,
        serverSide: true,
        searching: true,
        target: 'id',
        title: 'Picker',
        width: 800,
        disabled: false
    }
    var createBtn = function(parent, className) {
        var span = $('<span class="input-group-btn"></span>').appendTo(parent);;
        var btn = $('<button class="btn btn-default" type="button"></button>').appendTo(span);
        $('<span class="' + className + '"></span>').appendTo(btn);;
        return btn;
    }

    function bsPicker() {

    }

    var methods = {
        init: function(options) {
            var settings = this.data('bootstrapPicker');
            if (settings == undefined) {
                settings = $.extend({}, defaults, options);
            } else {
                settings = $.extend({}, settings, options);
            }
            this.data('bootstrapPicker', settings);
            var self = this;
            var $panel = $('<div></div>').appendTo(this);
            //输入框，搜索按钮，情况按钮
            var $top = $('<div></div>').addClass('input-group').appendTo($panel);
            var $input = $('<input type="text" class="form-control">').appendTo($top);
            $input.attr('disabled', settings.disabled);
            var $btnSearch = createBtn($top, 'glyphicon glyphicon-search').click(function(event) {
                var $bottom = $('<div></div>');
                util.modal(settings, $bottom, function(modal) {
                    methods.tablePanel.call(self, $bottom, settings, $input);
                    $('#bsPicker_t tbody').dblclick(function(event) {
                        modal.modal('toggle');
                    });
                });
            });
            var $btnClear = createBtn($top, 'glyphicon glyphicon-refresh').click(function(event) {
                $input.val('');
            });
            return this;
        },
        tablePanel: function($bottom, settings, $input) {
            //搜索面板，搜索条件，table
            // var $bottom = $('<div></div>');//.appendTo($panel).hide();
            var self = this;
            var _queryOption;
            if (settings.searchOptions && settings.searchOptions.length) {
                var $optsForm = util.createForm(settings.searchOptions, true, function(result) {
                    $.each(result, function(attr, val) {
                        if (val.trim().length == 0 || val == 'all') {
                            delete result[attr];
                        } else {
                            if (val === 'true') {
                                result[attr] = true;
                            } else if (val === 'false') {
                                result[attr] = false;
                            }
                        }
                    });
                    var qo = {};
                    $.each(result, function(index, val) {
                        if (util.is(val, 'String')) {
                            qo[index] = { '$like': '%' + val + '%' };
                        } else {
                            qo[index] = val;
                        }
                    });
                    _queryOption = qo;
                    //判断datatable的模式：client-side模式还是server-side模式
                    if (settings.serverSide) {
                        //server-side模式
                        table.draw();
                    } else {
                        //client-side模式
                        // table.ajax.reload();
                    }

                }, { inline: true, showColon: false, buttonText: 'Query' });
                $optsForm.appendTo($bottom).css('marginBottom', '5px');
                $optsForm.find('.form-group input, .form-group select').css({
                    marginLeft: '5px',
                    marginRight: '5px'
                });
            }

            var $table = $('<table id="bsPicker_t" class="table table-striped table-bordered"></table>').appendTo($bottom);
            var table = $table.DataTable({
                // lengthChange: false,
                // dom: 'lrtip',
                ajax: function(data, callback, tOpt) {
                    var param = {};
                    if (settings.serverSide) {
                        param.offset = parseInt(data.start);
                        param.limit = parseInt(data.length);
                        var orders = data.order;
                        if (orders.length > 0) {
                            var order = orders[0];
                            var col = data.columns[order.column];
                            param.order = col.data + ' ' + order.dir;
                        }
                    }
                    if (_queryOption) {
                        param.where = _queryOption;
                    }
                    if (settings.param) {
                        param.where = $.extend({}, param.where || {}, settings.param);
                    }
                    $.ajax({
                        type: "POST",
                        url: settings.url,
                        data: param, //传入已封装的参数
                        dataType: "json",
                        success: function(result) {
                            //异常判断与处理
                            if (result.error) {
                                console.log("查询失败。错误码：" + result.error);
                                return;
                            }
                            var value = result.value;
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
                        error: function(XMLHttpRequest, textStatus, errorThrown) {
                            console.log("查询失败");
                        }
                    });
                },
                columns: settings.columns,
                select: settings.select,
                processing: settings.processing,
                scrollX: settings.scrollX,
                scrollY: settings.scrollY,
                scrollCollapse: settings.scrollCollapse,
                serverSide: settings.serverSide,
                searching: settings.searching
            });
            $('.dataTables_filter', table.table().container()).find("label").css("display", "none");

            table.on('select', function(e, table, type, indexes) {
                if (type === 'row') {
                    var row = table.row(indexes).data();
                    //缓存选中行，某些时候需要一行的数据
                    self.data('_selectRow', row)
                    if (settings.target) {
                        $input.val(row[settings.target]);
                    }
                }
            });

            return $bottom;
        },
        setVal: function(val) {
            $(this).find('input[type="text"]').val(val);
        },
        getVal: function() {
            var value = $(this).find('input[type="text"]').val();
            // console.log(value);
            // console.log($(this).data('_selectRow'));

            return value;
        },
        getRow: function() {
            return $(this).data('_selectRow');
        }

    };
    $.fn.bootstrapPicker = function() {
        var method = arguments[0];
        if (methods[method]) {
            method = methods[method];
            arguments = Array.prototype.slice.call(arguments, 1);
        } else if (typeof(method) == 'object' || !method) {
            method = methods.init;
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.bootstrapPicker');
            return this;
        }
        return method.apply(this, arguments);
    }
})(jQuery);