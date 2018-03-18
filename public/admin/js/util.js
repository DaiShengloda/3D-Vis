if (!window.sdk) {
    sdk = {};
}
if (!window.it) {
    it = {};
}
if (!it.util) {
    it.util = {};
}

if (window.pageConfig == null) {
    window.pageConfig = {
        urlPrex: '',
    };
}

var util = sdk.util = it.util;
it.util.createSocket = function () {
    var path = pageConfig.socket || '/socket.io';
    var origin = this.origin();
    return io.connect(origin, { path: path });
};
it.util.origin = function () {
    var u = window.location.origin;
    return u;
};

it.util.apiErrorAndExcepHandler = function (type, r, url) {
    var s = r;
    if (r.error) {
        s = r.error;
    }
    if (r.responseText) {
        s = r.responseText;
    }
    if (typeof s == 'object') {
        s = util.o2s(s);
    }
    url = url || '';
    console.error('AJAX错误:', url, r, s);
    s = it.util.i18n(type) + '<br>URL : ' + url + "<br>" + it.util.i18n(s);
    it.util.showMessage(s);
}
it.util.apiErrorHandler = function (r, url) {
    it.util.apiErrorAndExcepHandler('Admin_util_Ajax_error', r, url);
}

it.util.apiExcepHandler = function (r, url) {
    it.util.apiErrorAndExcepHandler('Admin_util_Ajax_exception', r, url);
}

it.util.wrapUrl = function (url) {
    if (url.startsWith('/')) {
        return pageConfig.adminURLPrex + url.substring(1, url.length);
    } else {
        return pageConfig.adminURLPrex + url;
    }
}

it.util.adminApi = function (module, method, data, success, error, contentType) {
    if (module && module == 'data' &&
        (method == 'add' || method == 'update' || method == 'remove')) {
        it.util.apiWithPush(method, data, success, error);
        return;
    }
    var url = it.util.wrapUrl(module.replace('/', '.') + '/' + method);

    //如果是字符串就不需要转化了
    if (!(Object.prototype.toString.call(data) === "[object String]")) {
        data = JSON.stringify(data);
    }

    $.ajax({
        type: "post",
        contentType: 'application/json; charset=UTF-8',
        url: url,
        data: data ? data : '',
        success: function (result) {
            if (result.error) {
                if (error) {
                    error(result.error);
                } else {
                    it.util.apiErrorHandler(result, url);
                }
            } else {
                success && success(result.value);
            }
        },
        error: function (a, b, c) {
            if (error) {
                error(a, b, c);
            } else {
                it.util.apiExcepHandler(a, url);
            }
        },
    })
};


/**
 * add、update、delete资产(data)单独处理。因为需要向前台推送，不仅仅只是项数据库中保存
 *
 */
it.util.apiWithPush = function (method, dataObj, success, error) {
    if (!method || !dataObj) {
        return;
    }
    var url = pageConfig.urlPrex + '/api/data/' + method;
    dataObj = JSON.stringify(dataObj);
    $.ajax({
        url: url,
        type: 'post',
        data: dataObj,
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8',
        headers: { 'x-not-need-token': true },
        success: function (data, textStatus, xhr) {
            if (textStatus && textStatus == 'success') {
                if (data && data.error) {
                    it.util.apiErrorHandler(data, url);
                    return;
                }
                success && success(data.value);
            } else if (error) {
                error(xhr);
            } else {
                console.error(data, textStatus, xhr);
            }
        },
        error: function (a) {
            if (error) {
                error(a);
            } else {
                it.util.apiExcepHandler(a, url);
            }
        }
    });
};

// it.util.apiWithPush = function (method, dataObj, success, error) {
//     if (!method || !dataObj) {
//         return;
//     }
//     var url = pageConfig.urlPrex + '/api/monitor/asset';
//     var type = null;
//     if (method == 'add') {
//         type = 'POST';
//     } else if (method == 'update') {
//         type = 'PUT';
//         //更新时, 原来使用了{options:{}, value:{}} 格式, 实际后台支持自动拆分出 key
//         if (dataObj.value && dataObj.options) {
//             values = dataObj.value;
//             if (dataObj.options) {
//                 $.extend(values, dataObj.options);
//             }
//             dataObj = values;
//         }
//         if (!dataObj.ii && !dataObj.id) {
//             console.error(it.util.i18n("Admin_util_ii_or_id_required"));
//             return;
//         }
//         var dataId = dataObj.ii || dataObj.id;
//         url += '/' + dataId;
//     } else if (method == 'remove') {
//         type = 'DELETE';
//         if (!dataObj.id) {
//             console.error(it.util.i18n("Admin_util_id_required"));
//             return;
//         }
//         var dataId = dataObj.id;
//         url += '/' + dataId;
//     } else {
//         console.error('unsupport method : ', method);
//         return;
//     }
//     dataObj = JSON.stringify(dataObj);
//     $.ajax({
//         url: url,
//         type: type,
//         data: dataObj,
//         dataType: 'json',
//         contentType: 'application/json; charset=UTF-8',
//         headers: { 'x-not-need-token': true },
//         success: function (data, textStatus, xhr) {
//             if (textStatus && textStatus == 'success') {
//                 if (data && data.error) {
//                     it.util.apiErrorHandler(data, url);
//                     return;
//                 }
//                 success && success(data.value);
//             } else if (error) {
//                 error(xhr);
//             } else {
//                 console.error(data, textStatus, xhr);
//             }
//         },
//         error: function (a) {
//             if (error) {
//                 error(a);
//             } else {
//                 it.util.apiExcepHandler(a, url);
//             }
//         }
//     });
// };


it.util.logout = function () {
    var url = "/logout";
    $.ajax({
        type: "post",
        contentType: 'application/json; charset=UTF-8',
        url: url,
        success: function (result) {
            if (!result.error) {
                window.location.href = "/login.html";
            }
        },
        error: function (a, b, c) {
            if (error) {
                error(a, b, c);
            } else {
                it.util.apiExcepHandler(a, url);
            }
        },
    })
}

it.util.currentuser = function function_name(success, error) {
    $.ajax({
        type: "post",
        contentType: 'application/json; charset=UTF-8',
        url: '/currentuser',
        data: JSON.stringify(data),
        success: function (result) {
            if (result.error) {
                if (error) {
                    error(result.error);
                } else {
                    console.error(it.util.i18n("Admin_util_Ajax_error") + ':' + url, JSON.stringify(result.error));
                    if ($.messager) {
                        $.messager.alert(it.util.i18n("Admin_util_Ajax_error") + ':' + url, JSON.stringify(result.error));
                    } else {
                        alert(it.util.i18n("Admin_util_Ajax_error") + ':' + url, JSON.stringify(result.error));
                    }

                }
            } else {
                success && success(result.value);
            }
        },
        error: function (a, b, c) {
            if (error) {
                error(a, b, c);
            } else {
                console.error(a.responseText);
                $.messager.alert(it.util.i18n("Admin_util_Ajax_exception") + ':' + url, a.responseText);
            }
        },
    })
}

it.util.getBoxModel = function (box, model) {
    model = model || {};
    box.find('input,textarea').each(function () {
        var input = $(this),
            type = input.attr('type'),
            val;
        var name = input.attr('name');
        if (type == 'checkbox') {
            val = input.is(':checked');
        } else if (type == 'select') {
            val = input.combobox('getValue');
            name = input.attr('comboname');
            //console.log(val);
        } else {
            val = input.val();
        }
        model[name] = val;
    });
    box.find('select').each(function () {
        var select = $(this);
        model[select.attr('name')] = select.val();
    });
    return model;
};
it.util.setBoxModel = function (box, model) {
    model = model || {};
    box.find('input,textarea').each(function () {
        var input = $(this);
        var type = input.attr('type');
        if (type == 'checkbox') {
            input.prop('checked', model[input.attr('name')])
        } else {
            var val = model[input.attr('name')];
            if (val instanceof Object) {
                val = it.util.o2s(val);
            }
            input.val(val);
        }
    });
    box.find('select').each(function () {
        var select = $(this);
        select.val(model[select.attr('name')]);
    });
};

util.createForm = function (props, showSubmit, callback, opt) {
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

    $.each(props, function (index, prop) {
        var row = $('<div class="form-group"></div>');
        if (prop.json) {
            jsonProps.push(prop.name || prop.id);
        }
        if (!prop.label) prop.label = prop.id || prop.name;
        var input = util.createComponent(prop, form);
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
        btn.click(function (event) {
            event.preventDefault();
            event.stopPropagation();
            var bv = $(form).data('bootstrapValidator');
            if (bv) {
                bv.validate();
                if (!bv.isValid()) return;
            }
            var params = util.getFormData(form, jsonProps);
            callback && callback(params);
        });
    }

    return form;
}
util.clearFormData = function (form, data) {
    data = data || {};
    var f = function ($eles) {
        $.each($eles, function (index, ele) {
            var $ele = $(ele),
                name;
            if ($ele.is('option')) {
                var $parent = $ele.parent();
                name = $parent.attr('name') || $parent.attr('id');
            } else {
                name = $ele.attr('name') || $ele.attr('id');
            }
            if (!name) return;

            if ($ele.attr('type') == 'checkbox') {
                $ele.attr("checked", data[name] || "false");
            } else {
                $ele.val(data[name] || '');
            }
        });
    }
    f($('input', form));
    f($('textarea', form));
    f($('select option:selected', form));

}
util.getFormData = function (form, jsonProps) {
    var result = {};
    var f = function ($eles) {
        $.each($eles, function (index, ele) {
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
    $('div[data-type="jsonarea"]', form).each(function (index, el) {
        var $ele = $(el),
            name;
        name = $ele.attr('name') || $ele.attr('id');
        if (!name) return;
        result[name] = el.val();
    });
    $('div[data-type="customField"]', form).each(function (index, el) {
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
    $('div[data-type="picker"]', form).each(function (index, el) {
        var $ele = $(el),
            name;
        name = $ele.attr('name') || $ele.attr('id');
        if (!name) return;
        var val = $ele.bootstrapPicker('getVal');
        result[name] = val;
        console.log(name + " : " + val);
    });
    return result;
}
util.resetForm = function (form, dv) {
    dv = dv || {};
    var f = function ($eles) {
        $.each($eles, function (index, ele) {
            var $ele = $(ele),
                name;
            if ($ele.is('option')) {
                var $parent = $ele.parent();
            } else {
                name = $ele.attr('name') || $ele.attr('id');
            }
            if (!name) return;
            $ele.val(dv[name] || '');
            if ($ele.attr('type') == 'checkbox') {
                $ele.attr("checked", !!dv[name]);
            }
        });
    }
    f($('input', form));
    f($('textarea', form));
    f($('select option:selected', form));
    $('div[data-type="jsonarea"]', form).each(function (index, el) {
        var $ele = $(el),
            name;
        name = $ele.attr('name') || $ele.attr('id');
        if (!name) return;
        $ele.val(dv[name] || '');
    });
    $('div[data-type="customField"]', form).each(function (index, el) {
        var $ele = $(el),
            name;
        name = $ele.attr('name') || $ele.attr('id');
        if (!name) return;
        var val;
        if (el.val) {
            el.val(dv[name]);
        } else {
            var module = $ele.attr('data-module');
            if (module) {
                var cf = customField[module][name];
                cf.setVal(dv[name]);
            }
        }
    });
    $('div[data-type="picker"]', form).each(function (index, el) {
        var $ele = $(el),
            name;
        name = $ele.attr('name') || $ele.attr('id');
        if (!name) return;
        var val = $ele.bootstrapPicker('setVal', dv[name] || '');
    });
}
util.createComponent = function (prop, form) {
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
    } else if (prop.type == 'textarea') {
        input = util.createTextArea();
    } else if (prop.type == 'select') {
        input = util.createSelect(prop);
    } else if (prop.type == 'checkbox') {
        input = util.createCheckbox(prop, form);
    } else if (prop.type == 'email') {
        input = util.createEmail();
    } else if (prop.type == 'password') {
        input = util.createPassword();
    } else if (prop.type == 'number') {
        input = util.createNumber();
    } else if (prop.type == 'jsonarea') {
        input = util.createJsonArea();
    } else if (prop.type == 'picker') {
        input = util.createPicker(prop);
    } else if (prop.type == 'date' || prop.type == 'time') {
        input = util.createDatePicker(prop);
    } else if (prop.type == 'file') { //支持上传图片并预览
        input = util.createFile();
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
    var val = prop.value;
    if (val !== undefined) {
        if (prop.type == 'checkbox') {
            input.attr('checked', prop.value);
        } else {
            // var val = prop.value;
            // if (prop.json && val) { 
            //     val = JSON.stringify(val); //默认值只能给字符串, 否则 sequlize 初始化失败,因为数据库不支持 json
            // }
            input.val(val);
        }
    }
    if (prop.readonly) input.attr('readonly', 'readonly');
    if (prop.disabled) input.attr('disabled', true);
    if (prop.on) {
        for (var n in prop.on) {
            input.on(n, function (e) {
                prop.on[n](e, input);
            });
        }
    }
    return input;
}

util.createEmail = function () {
    return $(' <input type="email" class="form-control" placeholder="Email">')
}

util.createPassword = function () {
    return $('<input type="password" class="form-control" placeholder="Password">')
}
util.createText = function () {
    return $('<input type="text" class="form-control">');
}
util.createNumber = function () {
    return $('<input type="number" class="form-control">');
}
util.createTextArea = function () {
    return $('<textarea class="form-control" rows="3"></textarea>');
}
util.createJsonArea = function () {
        var $div = $('<div class="form-jsonarea" data-type="jsonarea"></div>');
        var options = {
            "mode": "code",
            "modes": [
                "tree",
                "form",
                "code",
                "text",
                "view"
            ],
            "search": false,
            "history": false
        };
        var editor = new JSONEditor($div[0], options);
        $div.val = $div[0].val = function (data) {
            if (arguments.length > 0) {
                try {
                    editor.set(JSON.parse(data));
                } catch (e) {
                    editor.set(data);
                }

            } else {
                return editor.get();
            }
        }
        return $div;
    }
    // util.createSelect = function(items){
    //     var select = $('<select class="form-control"></select>');
    //     if(items && items.length){
    //         $.each(items, function(index, val) {
    //              var opt = $('<option value="'+val.value+'">'+util.i18n(val.label)+'</option>');
    //              select.append(opt);
    //         });
    //     }
    //     return select;
    // }
util.createCheckbox = function (prop, form) {
    var $cb = $('<input type="checkbox" ></input>');
    if (prop.event && prop.handle) {
        $cb.on(prop.event, function (e) {
            (function () {
                prop.handle(e, form);
            })();
        });
    }
    return $cb;
}
util.createPicker = function (prop) {
    var $picker = $('<div class="picker-form-control" data-type="picker"></div>');
    var opt = prop.params || {};
    $picker.bootstrapPicker(opt);
    if (prop.value) {
        $picker.bootstrapPicker('setVal', prop.value);
    }
    return $picker;
};
util.createDatePicker = function (prop) {
    var $picker = $('<input class="input-min contral-width datetime-picker">');
    if (prop.value) {

    }
    $picker.datetimepicker({
        language: 'zh-CN',
        format: prop.type === 'time' ? 'yyyy-mm-dd hh:ii:ss' : 'yyyy-mm-dd',
        autoclose: true,
        todayBtn: true,
        startView: 2,
        minView: 2
    });
    return $picker;
};
util.createSelect = function (prop) {
    var items = prop.items,
        parameters = prop.params;
    var select = $('<select class="form-control"></select>');
    if (items) {
        $.each(items, function (index, val) {
            var value = val.value != undefined ? val.value : index,
                label = val.value != undefined ? val.label : val;
            var opt = $('<option value="' + value + '">' + util.i18n(label) + '</option>');
            select.append(opt);
        });
    }
    if (parameters && parameters.url && parameters.valueField) {
        $.ajax({
            url: parameters.url,
            data: parameters.data || {},
            success: function (result) {
                if (result.value) {
                    var data = result.value;
                    if (parameters.filter) {
                        data = parameters.filter(data);
                    }
                    if (parameters.forSearch) {
                        select.append($('<option value="">' + util.i18n('All') + '</option>'));
                    }
                    if (parameters.valueField instanceof Function) {
                        $.each(data, function (index, val) {
                            var optionData = parameters.valueField(val, index);
                            var opt = $('<option value="' + optionData.value + '">' + optionData.label + '</option>');
                            select.append(opt);
                        });
                    } else {
                        $.each(data, function (index, val) {
                            var opt = $('<option value="' + val[parameters.valueField] + '">' + val[parameters.valueField] + '</option>');
                            var stringVal = JSON.stringify(val);
                            opt.attr("data", stringVal);
                            select.append(opt);
                        });
                    }

                }
                if (prop.value) {
                    select.val(prop.value);
                }
            }
        });
    }
    return select;
}
util.createFile = function () {
    return $('<input type="file" class="form-control">');
}

util.modal = function (title, bodyContent, showFooter, showBtnSure, callback, syn) {
    title = title || 'Modal';
    var modal = $('<div class="modal fade"></div>');
    var dialog = $('<div class="modal-dialog"></div>');
    var content = $('<div class="modal-content"></div>');
    var header = $('<div class="modal-header"></div>');
    var body = $('<div class="modal-body"></div>');


    header.append($('<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>'));
    header.append($('<h4 class="modal-title">' + it.util.i18n(title) + '</h4>'));
    content.append(header);

    bodyContent = bodyContent || $('<p>Nothing</p>');
    body.append(bodyContent);
    var errBox = $('<h4 style="text-align: center;color:red;padding-top: 10px;height: 40px;">' + it.util.i18n("Admin_util_Error_tip") + '</h4>').appendTo(body);
    errBox.text('');
    content.append(body);

    if (showFooter) {
        var footer = $('<div class="modal-footer"></div>');
        footer.append($('<button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>'));
        if (showBtnSure) {
            var sure = $('<button type="button" class="btn btn-primary">OK</button>');
            footer.append(sure);
            sure.click(function (event) {
                var bv = $(bodyContent).data('bootstrapValidator');
                if (bv) {
                    bv.validate();
                    if (!bv.isValid()) {
                        return;
                    }
                }
                if (syn && callback) {
                    var i = layer.load();
                    callback(function (msg) {
                        layer.close(i);
                        modal.modal('hide');
                        if (msg) {
                            it.util.showMessage(msg);
                        }
                    }, function (error) {
                        layer.close(i);
                        errBox.text(error);
                    });
                } else {
                    if (callback) {
                        var open = callback();
                        if (open) {
                            return;
                        }
                        modal.modal('hide');
                    }
                }
            });
        }
        content.append(footer);
    }
    dialog.append(content);
    modal.append(dialog);
    modal.on('hidden.bs.modal', function (e) {
        modal.remove();
    });
    modal.modal({ show: true });
    return modal;
}

util.showError = function (result) {
    if (!result) return true;
    if (result instanceof Object && !result.error) {
        return true;
    }
    var error = result.error || result,
        message = error.message || error;
    var $p = $('<p>' + message + '</p>')
    var modal = util.modal(it.util.i18n('Error'), $p, true);
}
util.showMessage = function (message) {
    if (!message) return;
    var $p = $('<p>' + it.util.i18n(message) + '</p>')
    var modal = util.modal(it.util.i18n('Message'), $p, true);
}
util.msg = function (msg) {
    layer.alert(util.i18n(msg));
}
util.confirm = function (msg, callback, callback2) {
    layer.confirm(util.i18n(msg), {
        title: util.i18n('confirm'),
        btn: [util.i18n('Yes'), util.i18n('No')] //按钮
    }, function (index) {
        if (callback) {
            callback();
        }
        layer.close(index);
    }, function (index) {
        if (callback2) {
            callback2();
        }
        layer.close(index);
    });
}
util.lan = {};
util._currentLan = 'zh';
util.i18n = function (text) {
    return util.lan[text] || text;
}
util.provinces = {
    "none": it.util.i18n("Admin_util_Select_Map"),
    "anhui": it.util.i18n("Admin_util_Anhui"),
    "aomen": it.util.i18n("Admin_util_Aomen"),
    "beijing": it.util.i18n("Admin_util_Beijing"),
    "chongqing": it.util.i18n("Admin_util_Chongqing"),
    "fujian": it.util.i18n("Admin_util_Fujian"),
    "gansu": it.util.i18n("Admin_util_Gansu"),
    "guangdong": it.util.i18n("Admin_util_Guangdong"),
    "guangxi": it.util.i18n("Admin_util_Guangxi"),
    "guizhou": it.util.i18n("Admin_util_Guizhou"),
    "hainan": it.util.i18n("Admin_util_Hainan"),
    "hebei": it.util.i18n("Admin_util_Hebei"),
    "heilongjiang": it.util.i18n("Admin_util_Heilongjiang"),
    "henan": it.util.i18n("Admin_util_Henan"),
    "hubei": it.util.i18n("Admin_util_Hubei"),
    "hunan": it.util.i18n("Admin_util_Hunan"),
    "jiangsu": it.util.i18n("Admin_util_Jiangsu"),
    "jiangxi": it.util.i18n("Admin_util_Jiangxi"),
    "jilin": it.util.i18n("Admin_util_Jilin"),
    "liaoning": it.util.i18n("Admin_util_Liaoning"),
    "neimenggu": it.util.i18n("Admin_util_Neimenggu"),
    "ningxia": it.util.i18n("Admin_util_Ningxia"),
    "qinghai": it.util.i18n("Admin_util_Qinghai"),
    "shandong": it.util.i18n("Admin_util_Shandong"),
    "shanghai": it.util.i18n("Admin_util_Shanghai"),
    "shanxi": it.util.i18n("Admin_util_Shanxi"),
    "shanxi1": it.util.i18n("Admin_util_Shanxxi"),
    "sichuan": it.util.i18n("Admin_util_Sichuan"),
    "tianjin": it.util.i18n("Admin_util_Tianjin"),
    "xianggang": it.util.i18n("Admin_util_Xianggang"),
    "xinjiang": it.util.i18n("Admin_util_Xinjiang"),
    "xizang": it.util.i18n("Admin_util_Xizang"),
    "yunnan": it.util.i18n("Admin_util_Yunnan"),
    "zhejiang": it.util.i18n("Admin_util_ZheJiang")
};
util.loadI18n = function (local, params) {
    $.getJSON(pageConfig.urlPrex + '/admin/i18n/language_' + local + '.json', function (json, textStatus) {
        if (json) {
            util.lan = json;
        }
        if (params) {
            for (var i = 0; i < params.length; i++) {
                util.theIndexLanguage(params[i]);
            }
        }
    }).error(function (data, status, error) {
        console.log('error', data, status, error);
    });
}

util.theIndexLanguage = function (ids) {
    $(function () {
        var str = $(ids).html();
        if (str) {
            str1 = str.split('{{');
            if (str1.length > 1) {
                for (var i = 1; i < str1.length; i++) {
                    str2 = str1[i].split('}}');
                    str2[0] = it.util.i18n(str2[0]);
                    str1[i] = str2.join('');
                }
            }
            str = str1.join('');
            $(ids).html(str);
        }
    })
}

util.setLanguage = function (local) {
    util.loadI18n(local, ['#navpage']);
}
util.isArray = function (o) {
    return util.is(o, 'Array');
}
util.is = function (o, obj) {
    return Object.prototype.toString.call(o) === '[object ' + obj + ']';
}
util.initValidator = function (form, fields) {
    var opt = {
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        submitHandler: null,
    };
    var fieldsOpt = {};
    $.each(Object.keys(fields), function (index, p) {
        var validators = {};
        var field = fields[p];
        $.each(field.validators, function (index, type) {
            if (util.is(type, 'Object')) {
                var t = type.type;
                delete type.type;
                validators[t] = type;
            }
            if (util.is(type, 'String')) {
                var message;
                if (type == 'notEmpty') {
                    message = util.i18n('The ' + p + ' is required');
                } else if (type == 'emailAddress') {
                    message = util.i18n('The ' + p + ' is not a valid email address');
                }
                validators[type] = { message: message };
            }
        });
        field.validators = validators;
        fieldsOpt[p] = field;
    });
    opt.fields = fieldsOpt;
    form.bootstrapValidator(opt);
    form.on('success.form.bv', function (e) {
        // 阻止默认事件提交
        e.preventDefault();
    });
}
util.showInfo = function (info, opt) {
    opt = opt || {};
    var title = opt.title || 'Information';
    var showFooter = opt.showFooter || false;
    var panel = $('<div class="panel panel-info"></div>');
    var header = $('<div class="panel-heading">' + util.i18n(title) + '</div>');
    panel.append(header);
    var body = $('<div class="panel-body"></div>');
    panel.append(body);
    if (opt.showFooter) {
        var $footer = $('<div class="panel-footer"></div>');
        var $close = $('<button type="button" class="btn btn-primary">Close</button>')
        $footer.append($close);
        $footer.css('text-align', 'right');
        $close.click(function (event) {
            panel.remove();
        });
        panel.append($footer);
    }
    var table = $('<table class="table"></table>').appendTo(body);
    table.find('td').css({
        'border-top': '0px solid #ddd',
        'border-bottom': '1px solid #ddd'
    });
    var cline = function (p, l, v, colspan, color) {
        var row;
        if (!colspan) {
            row = $('<tr><td>' + util.i18n(l) + '</td><td>' + v + '</td></tr>');
        } else {
            row = $('<tr></tr>');
            var col = $('<td colspan="2" style="text-align:center"></td>');
            row.append(col);
            var b = $('<b>' + l + '</b>');
            col.append(b);
            if (color) b.css('color', color);
        }
        p.append(row);
    }
    $.each(info, function (index, val) {
        cline(table, index, val);
    });
    return panel;
};

util.createPanel = function (parent, title, cp) {
    var panel = $('<div class="panel panel-info"></div>');
    if (parent) parent.append(panel);
    var head = $('<div class="panel-heading">' + title + '</div>').appendTo(panel);
    var content = $('<div class="panel-body"></div>').appendTo(panel);
    if (cp) {
        content.append(cp);
    }
    return {
        panel: panel,
        setHead: function (title) {
            head.html(util.i18n(title));
        },
        setContent: function (child) {
            content.empty();
            content.append(child);
        },
        getContent: function () {
            return content;
        }
    };
}
util.formJson = function (txt, compress /*是否为压缩模式*/ ) { /* 格式化JSON源码(对象转换为JSON文本) */
    var indentChar = '    ';
    if (/^\s*$/.test(txt)) {
        alert(it.util.i18n("Admin_util_Data_is_null"));
        return;
    }
    try {
        var data = eval('(' + txt + ')');
    } catch (e) {
        alert(it.util.i18n("Admin_util_Data_source_error") + ': ' + e.description, 'err');
        return;
    };
    var draw = [],
        last = false,
        This = this,
        line = compress ? '' : '\n',
        nodeCount = 0,
        maxDepth = 0;

    var notify = function (name, value, isLast, indent /*缩进*/ , formObj) {
        nodeCount++;
        /*节点计数*/
        for (var i = 0, tab = ''; i < indent; i++) tab += indentChar;
        /* 缩进HTML */
        tab = compress ? '' : tab;
        /*压缩模式忽略缩进*/
        maxDepth = ++indent;
        /*缩进递增并记录*/
        if (value && value.constructor == Array) { /*处理数组*/
            draw.push(tab + (formObj ? ('"' + name + '":') : '') + '[' + line);
            /*缩进'[' 然后换行*/
            for (var i = 0; i < value.length; i++)
                notify(i, value[i], i == value.length - 1, indent, false);
            draw.push(tab + ']' + (isLast ? line : (',' + line)));
            /*缩进']'换行,若非尾元素则添加逗号*/
        } else if (value && typeof value == 'object') { /*处理对象*/
            draw.push(tab + (formObj ? ('"' + name + '":') : '') + '{' + line);
            /*缩进'{' 然后换行*/
            var len = 0,
                i = 0;
            for (var key in value) len++;
            for (var key in value) notify(key, value[key], ++i == len, indent, true);
            draw.push(tab + '}' + (isLast ? line : (',' + line)));
            /*缩进'}'换行,若非尾元素则添加逗号*/
        } else {
            if (typeof value == 'string') value = '"' + value + '"';
            draw.push(tab + (formObj ? ('"' + name + '":') : '') + value + (isLast ? '' : ',') + line);
        };
    };
    var isLast = true,
        indent = 0;
    notify('', data, isLast, indent, false);
    return draw.join('');
}
util.loadCategories = function (callback, params) {
    params = params || {};
    util.adminApi('category', 'find', params, function (data) {
        var r1 = {};
        var r2 = [];
        if (data) {
            data.forEach(function (d) {
                r1[d.id] = d;
                r2.push({ value: d.id, label: d.id + ' ' + d.description })
            })
        }
        util.categoryArray = data;
        util.categoryMap = r1;
        util.categoryItems = r2;
        callback && callback();
    })
}

util.loadDataTypes = function (callback, params) {
    params = params || {};
    util.adminApi('datatype', 'find', params, function (data) {
        var r1 = {};
        var r2 = [];
        if (data) {
            data.forEach(function (d) {
                r1[d.id] = d;
                r2.push({ value: d.id, label: d.id + ' ' + d.description })
            })
        }
        util.dataTypeArray = data;
        util.dataTypeMap = r1;
        util.dataTypeItems = r2;
        callback && callback();
    })
}

util.loadDatas = function (callback, params) {
    params = params || {};
    util.adminApi('data', 'find', params, function (data) {
        var r1 = {};
        var r2 = [];
        var r3 = {};
        if (data) {
            data.forEach(function (d) {
                r1[d.id] = d;
                r2.push({ value: d.id, label: d.id + ' ' + d.description })
                r3[d.ii] = d;
            })
        }
        util.dataArray = data;
        util.dataMap = r1;
        util.dataItems = r2;
        util.dataIiMap = r3;
        callback && callback();
    })
}

util.loadDataByCategoryId = function (categoryId, callback) {
    var params = null;
    if (categoryId instanceof Array) {
        params = categoryId.map(function (id) {
            return { id: id }
        });
    } else {
        params = { id: categoryId };
    }
    util.adminApi('data', 'getDataByCategory', params, function (data) {
        console.log("dataCenter: " + data);
        var map = {};
        data = data || [];
        data.forEach(function (d) {
            map[d.id] = d;
        })
        callback && callback(map, data);
    })
}

util.objectIterator = function (object, iterator) {

    var keys = Object.keys(object);
    var keyCount = keys.length;
    for (var i = 0; i < keyCount; i++) {
        if (iterator && (iterator(keys[i], object[keys[i]]) === false)) {
            return;
        }
    }
}

util.categoryIterator = function (iterator) {

    util.objectIterator(it.util.categoryMap, iterator);
}

util.dataTypeIterator = function (iterator) {

    util.objectIterator(it.util.dataTypeMap, iterator);
}

util.dataIterator = function (iterator) {

    util.objectIterator(it.util.dataMap, iterator);
}

util.isEmptyStr = function (str) {
    if (str) {
        str = str.trim(str);
        return str.length == 0
    } else {
        return true;
    }
}

util.getSequence = function (num) { // 获取一个序列号，比如0001
    var array = [0, 0, 0, 0],
        num = num + "";
    return array.slice(0, array.length - num.length).join("") + num;
};


/**
 * 上传图片,起始目录是handle.js文件所在的目录.
 * @param fileName 文件名称
 * @param content 文件内容
 * @param callback 执行玩的回调
 * @param filePath 文件路径,默认保存在public/modellib/model/idc/images/目录
 */
util.uploadImage = function (fileName, content, callback, filePath) {

    filePath = filePath || '/../public/modellib/model/idc/images/device/';
    var data = {
        fileName: fileName,
        filePath: filePath,
        content: content
    }
    $.ajax({
        url: it.util.wrapUrl('upload/deviceImage'),
        contentType: 'application/json',
        method: 'post',
        data: JSON.stringify(data),
        success: function (r) {
            console.log(JSON.stringify(r))
            callback && callback();
        },
        error: function (a, b, c) {
            console.error(a, b, c)
            alert(a.responseText);
        }
    });
};

util.isValidateFile = function (obj, type) {
    var extend = obj.substring(obj.lastIndexOf(".") + 1);
    if (type instanceof Array) {
        var allFail = true;
        for (var i = 0; i < type.length; i++) {
            if ((extend == type[i])) {
                allFail = false;
            }
        }
        if (allFail) {
            alert(it.util.i18n("Admin_util_Upload_suffix") + type + it.util.i18n("Admin_util_File"));
            return false;
        }
    } else if (!(extend == type)) {
        alert(it.util.i18n("Admin_util_Upload_suffix") + type + it.util.i18n("Admin_util_File"));
        return false;
    }
    return true;
};

util.isDebug = function () {
    return true;
}

util.jsonUtil = {
    object2String: function (obj) {
        try {
            var str = JSON.stringify(obj);
            return str;
        } catch (e) {
            if (util.isDebug()) {
                throw e;
            } else {
                console.error(it.util.i18n("Admin_util_Json_encode_error"), obj);
            }
            return obj;
        }
    },
    string2Object: function (str) {
        try {
            var obj = JSON.parse(str);
            return obj;
        } catch (e) {
            if (util.isDebug()) {
                throw e;
            } else {
                console.error(it.util.i18n("Admin_util_String_decode_error"), str);
            }
            return str;
        }
    }
};

util.o2s = function (o) {
    return util.jsonUtil.object2String(o);
}

util.s2o = function (s) {
    return util.jsonUtil.string2Object(s);
}

util.clone = function (o) {
    return util.s2o(util.o2s(o));
}

util.parseDataPositionAndLocation = function (data) {
    if (!data) {
        return;
    }
    var fields = ['position', 'location']
    var names = ['x', 'y', 'z'];
    for (var j = 0; j < fields.length; j++) {
        var field = fields[j];
        if (data[field]) {
            for (var i = 0; i < names.length; i++) {
                var name = names[i];

                if (data[field][name] === null || data[field][name] === undefined) { //如果是空,删除属性
                    delete data[field][name];
                } else if (('' + data[field][name]).trim().length == 0) { //如果是空字符串,删除属性
                    delete data[field][name];
                } else { //如果是数值,parseFloat, 数据库中存有字符串
                    if (!isNaN(parseFloat(data[field][name]))) {
                        data[field][name] = parseFloat(data[field][name])
                    }
                }
            }
            if (Object.keys(data[field]).length == 0) {
                delete data[field];
            }
        }

    }
}

util.registerDataType = function (dataTypeMap, categoryMap) {

    var keys = Object.keys(dataTypeMap);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var item = dataTypeMap[key];

        if (it.util.isEmptyStr(item.model)) {
            continue;
        }
        if (item.model == 'twaver.combo') {
            continue;
        }

        var category = it.util.categoryMap[item.categoryId];
        var oldId2d = doodle.utils.getSceneEditorModel2dId(item.model);
        var oldId3d = doodle.utils.getSceneEditorModel3dId(item.model);
        var newId2d = doodle.utils.getSceneEditorModel2dId(key);
        var newId3d = doodle.utils.getSceneEditorModel3dId(key);
        var categoryLabel = category.description || category.id;
        categoryLabel = categoryLabel.replace('/', '_');
        var icon = make.Default.getIcon(oldId3d) || make.Default.getIcon(oldId2d);

        if (item.model != 'twaver.combo' && !make.Default.getCreator(oldId2d)) {
            //console.warn('unknown id', key, item);
            continue;
        }

        if (item.categoryId == 'floor') {
            //if (item.modelParameters) {
            //    delete item.modelParameters['objectId'];
            //    delete item.modelParameters['position'];
            //}
            //make.Default.copy(newId2d, 'twaver.combo', {data: item.modelParameters}, {
            //    category: categoryLabel,
            //    name: item.description,
            //    icon: icon
            //}, {copyParamCoverage: true});
            //make.Default.copy(newId3d, 'twaver.combo', {data: item.modelParameters}, {
            //    category: categoryLabel
            //}, {copyParamCoverage: true});
            continue;
        }

        //if (item.categoryId == 'room') {
        //    continue;
        //}

        var data = { client: {} };
        var name = item.description;
        if (!name || name.trim().length == 0) {
            name = item.id;
        }
        if (item.modelParameters instanceof Array) {
            delete item.modelParameters[0]['objectId'];
            delete item.modelParameters['position'];
        } else if (item.modelParameters) {
            delete item.modelParameters['objectId'];
            delete item.modelParameters['position'];
        }

        var defualtParams = {
            persistence: {
                value: false,
                type: make.Default.PARAMETER_TYPE_BOOLEAN,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
                hidden: true,
            },
            objectId: {
                hidden: true,
            },
            bid: {
                name: "ID",
                type: make.Default.PARAMETER_TYPE_STRING,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
                editable: false,
            },
            width: {
                name: it.util.i18n("Admin_util_Width"),
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
                editable: false,
            },
            height: {
                name: it.util.i18n("Admin_util_Height"),
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
                editable: false,
            },
            parentId: {
                type: make.Default.PARAMETER_TYPE_STRING,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
                editable: false,
                hidden: true,
            },
        }

        var copyDefaultParamCoverage = false;
        if (item.categoryId == 'channel') {
            copyDefaultParamCoverage = true;
        }

        make.Default.copyProperties(item.modelParameters, data);
        make.Default.copyProperties(item.modelParameters, data.client);
        make.Default.copy(newId2d, oldId2d, data, {
            sdk: true, //标记是3D机房系统中,支持的模型
            acc: true, //标记是3D机房系统中,支持模型的2D的模型
            category: categoryLabel,
            categoryId: item.categoryId,
            name: name,
            icon: icon,
            modelDefaultParameters: defualtParams,
        }, { copyDefaultParamCoverage: copyDefaultParamCoverage });
        make.Default.copy(newId3d, oldId3d, data, {
            sdk: true, //标记是3D机房系统中,支持的模型
            category: categoryLabel,
            modelDefaultParameters: {
                persistence: {
                    value: false,
                    type: make.Default.PARAMETER_TYPE_BOOLEAN,
                    propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
                    hidden: true,
                },
                objectId: {
                    hidden: true,
                },
                bid: {
                    type: make.Default.PARAMETER_TYPE_STRING,
                    propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
                    editable: false,
                },
                width: {
                    type: make.Default.PARAMETER_TYPE_NUMBER,
                    propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
                    editable: false,
                },
                height: {
                    type: make.Default.PARAMETER_TYPE_NUMBER,
                    propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
                    editable: false,
                },
                parentId: {
                    type: make.Default.PARAMETER_TYPE_STRING,
                    propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
                    editable: false,
                    hidden: true,
                },
            }
        }, { copyDefaultParamCoverage: copyDefaultParamCoverage });
    }
}

util.export2excel = function (options) {

    var fileName = options.fileName; //文件名
    var sheets = options.sheets;
    var wb = new Workbook()
    for (var sheetName in sheets) {
        var sheet = sheets[sheetName];
        var data = sheet.data; //数据
        var ws = sheet_from_array_of_arrays(data);

        /* add worksheet to workbook */
        wb.SheetNames.push(sheetName);
        wb.Sheets[sheetName] = ws;
    }
    var wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });

    saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), fileName + ".xlsx");

    function s2ab(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }

    function datenum(v, date1904) {
        if (date1904) v += 1462;
        var epoch = Date.parse(v);
        return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
    }

    function sheet_from_array_of_arrays(data, opts) {
        var ws = {};
        var range = { s: { c: 10000000, r: 10000000 }, e: { c: 0, r: 0 } };
        for (var R = 0; R != data.length; ++R) {
            for (var C = 0; C != data[R].length; ++C) {
                if (range.s.r > R) range.s.r = R;
                if (range.s.c > C) range.s.c = C;
                if (range.e.r < R) range.e.r = R;
                if (range.e.c < C) range.e.c = C;
                var cell = { v: data[R][C] };
                if (cell.v == null) continue;
                var cell_ref = XLSX.utils.encode_cell({ c: C, r: R });

                if (typeof cell.v === 'number') cell.t = 'n';
                else if (typeof cell.v === 'boolean') cell.t = 'b';
                else if (cell.v instanceof Date) {
                    cell.t = 'n';
                    cell.z = XLSX.SSF._table[14];
                    cell.v = datenum(cell.v);
                } else cell.t = 's';

                ws[cell_ref] = cell;
            }
        }
        if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
        return ws;
    }

    function Workbook() {
        if (!(this instanceof Workbook)) return new Workbook();
        this.SheetNames = [];
        this.Sheets = {};
    }
}

/**
 * category 常量
 * @type {{FLOOR: string, ROOM: string, CHANNEL: string}}
 */
util.CATEGORY = {
    EARTH: 'earth',
    DATA_CENTER: 'dataCenter',
    BUILDING: 'building',
    FLOOR: 'floor',
    ROOM: 'room',
    CHANNEL: 'channel',
    RACK: 'rack',
    EQUIPMENT: 'equipment',
    HEADER_RACK: 'headerRack',
    SEAT: 'seat',
}

util.getLabel = function (data) {
    if (data.name && data.name.trim().length > 0) {
        return data.name
    } else if (data.description && data.description.trim().length > 0) {
        return data.description
    } else {
        return data.id;
    }
}


/**
 * 支持三种方式,传入原始值 数组 对象
 * '1{}3'.format(2)
 * 1{0}3'.format([2])
 * 1{0}3{1}'.format(2,4)
 * 1{a}3'.format({a:2})
 * @param value
 * @returns {*}
 */
String.prototype.format = function (value) {
    var patten = this;
    if (arguments.length > 1) {
        var t = [];
        for (var i = 0; i < arguments.length; i++) {
            t.push(arguments[i]);
        }
        value = t;
    }

    if (value) {
        var type = typeof value;
        if (value instanceof Array) {
            value.forEach(function (item, i) {
                if (item instanceof Object) {
                    item = JSON.stringify(item);
                }
                patten = patten.replace('{' + i + '}', item);
            })
        } else if (value instanceof Object) {
            for (var p in value) {
                var item = value[p];
                if (item instanceof Object) {
                    item = JSON.stringify(item);
                }
                patten = patten.replace('{' + p + '}', item);
            }
        } else {
            return patten.replace('{}', value)
        }
    }
    return patten;
}
String.prototype.trim = function () {
    return this.replace(/(^\s*)|(\s*$)/g, "");
}
String.prototype.trimLeft = function () {
    return this.replace(/(^\s*)/g, "");
}
String.prototype.trimRight = function () {
    return this.replace(/(\s*$)/g, "");
}
String.prototype.startsWith = String.prototype.startsWith ||
    function (str) {
        return this.slice(0, str.length) === str;
    };

String.prototype.endsWith = String.prototype.endsWith ||
    function (str) {
        var t = String(str);
        var index = this.lastIndexOf(t);
        return (-1 < index && index) === (this.length - t.length);
    };

it.util.numberScale = function (v, n) {

    if (n === undefined) {
        n = 0;
    }
    var f = parseFloat(v);

    var s = Math.pow(10, n);
    return Math.round(f * s) / (s * 1.0);
}

it.util.getUrlParam = function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(decodeURIComponent(r[2]));
    return null;
}