if (!window.it) {
    window.it = {};
}
if (!it.util) {
    it.util = {};
}

var util = it.util;
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
    layer.alert(s);
}
it.util.apiErrorHandler = function (r, url) {
    it.util.apiErrorAndExcepHandler('Admin_util_Ajax_error', r, url);
}

it.util.apiExcepHandler = function (r, url) {
    it.util.apiErrorAndExcepHandler('Admin_util_Ajax_exception', r, url);
}
it.util.api = function (module, method, data, success, error) {

    if (module && module == 'data'
        && (method == 'add' || method == 'update' || method == 'remove')) {
        it.util.apiWithPush(method, data, success, error);
        return;
    }
    var url = pageConfig.urlPrex + '/api/' + module.replace('/', '.') + '/' + method;
    // console.log(url);

    return $.ajax({
        type: "post",
        contentType: 'application/json; charset=UTF-8',
        url: url,
        data: JSON.stringify(data),
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
    var url = pageConfig.urlPrex + '/api/monitor/asset';
    var type = null;
    if (method == 'add') {
        type = 'POST';
    } else if (method == 'update') {
        type = 'PUT';
        //更新时, 原来使用了{options:{}, value:{}} 格式, 实际后台支持自动拆分出 key
        if (dataObj.value && dataObj.options) {
            values = dataObj.value;
            if (dataObj.options) {
                $.extend(values, dataObj.options);
            }
            dataObj = values;
        }
        if (!dataObj.ii && !dataObj.id) {
            console.error(it.util.i18n("utils_Update_need_id"));
            return;
        }
        var dataId = dataObj.ii || dataObj.id;
        url += '/' + dataId;
    } else if (method == 'remove') {
        type = 'DELETE';
        if (!dataObj.id) {
            console.error(it.util.i18n("utils_Delete_need_id"));
            return;
        }
        var dataId = dataObj.id;
        url += '/' + dataId;
    } else {
        console.error('unsupport method : ', method);
        return;
    }
    if (dataObj._event) {
        url += '?_event=' + dataObj._event
    }
    var data = JSON.stringify(dataObj);
    return $.ajax({
        url: url,
        type: type,
        data: data,
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8',
        headers: { 'x-not-need-token': true },
        success: function (data, textStatus, xhr) {
            if (textStatus && textStatus == 'success') {
                if (data && data.error) {
                    if (error) {
                        error(data.error);
                    } else {
                        it.util.apiErrorHandler(data, url);
                    }
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

it.util.getById = function (module, id, callback) {
    it.util.api(module, 'get', { id: id }, callback, function () {
        layer.alert(it.util.i18n("utils_Deleted") + ':' + id);
    })
}

it.util.search = function (module, params, callback) {
    it.util.api(module, 'search', params, callback, function () {
        layer.alert(it.util.i18n("utils_Disconnect"));
    })
}

it.util.format = function (url, d) {

    if (!d) {
        return url;
    }
    var p = /{([\s\S]+?)}/;
    var match = url.match(p), n, v, t;
    while (match) {

        n = match[1];
        v = d.getValue(n);
        if (v) {
            t = typeof v;
            if (t !== 'string') {
                v = util.o2s(v);

            }
            url = url.replace(match[0], v);
        }
        match = url.match(p);
    }
    return url;
}


it.util.getBoxModel = function (box, model) {
    model = model || {};
    box.find('input').each(function () {
        var input = $(this), type = input.attr('type'), val;
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
        if (input.data('type') == 'number') {
            val = parseFloat(val);
        } else if (input.data('type') == 'int') {
            val = parseInt(val);
        } else if (input.data('type') == 'json') {
            val = it.util.s2o(val);
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
    box.find('input').each(function () {
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

util.msg = function (msg) {
    layer.alert(util.i18n(msg),{
        title: util.i18n("AlertUtil_Tip"),
        btn:[util.i18n("AlertUtil_Confirm")]
    });
}
util.alert = function (msg) {
    layer.alert(util.i18n(msg));
}
util.msg2 = function (msg) {
    layer.msg(util.i18n(msg));
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
// util.i18n = function (text) {
//     return util.lan[text] || text;
// }

util.i18n = function (text,params) {
    var textObj = {
        text: text
    }
    var textArr = text.match(/\{\{.*?\}\}/g);
    if (textArr && textArr.length > 0) {
        textObj.text = textObj.text.split(' ').join('');
        var num = 1
        textObj.text = textObj.text.replace(/\{\{(.*?)\}\}/g,function(){
            var str =  "{{"+ num +"}}";
            num++;
            return str;
       });
    }

   textObj.text = util.lan[textObj.text] || textObj.text;
    
   var textArr2 = textObj.text.match(/\{\{(.*?)\}\}/g);
    if (textArr2 && textArr2.length > 0) {
        textArr2.forEach(function (val) {
            var index = val.substr(2, val.length - 4) - 1;
            textObj.text = textObj.text.replace(val, textArr[index].substr(2, textArr[index].length - 4));
        });
    }

    if(params){
        params.forEach(function(val){
            textObj.text = textObj.text.replace('{p}',val);
        });
    }
    return textObj.text;
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
    $.getJSON(pageConfig.urlPrex + '/i18n/language_' + local + '.json', function (json, textStatus) {
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
    util.loadI18n(local, ['#alarmListDialog', '#video_container']);

    if (local == 'zh') {
        if ($.fn.selectpicker) {
            $.fn.selectpicker.defaults = {
                noneSelectedText: '没有选中任何项',
                noneResultsText: '没有找到匹配项',
                countSelectedText: '选中{1}中的{0}项',
                maxOptionsText: ['超出限制 (最多选择{n}项)', '组选择超出限制(最多选择{n}组)'],
                multipleSeparator: ', ',
                selectAllText: '全选',
                deselectAllText: '取消全选'
            };
        }
        $(function () {
            $('.cameraHelp-en').remove();
        })
    }

    else if (local == 'en') {
        if ($.fn.selectpicker) {
            $.fn.selectpicker.defaults = {
                noneSelectedText: 'Nothing selected',
                noneResultsText: 'No results match {0}',
                countSelectedText: function (numSelected, numTotal) {
                    return (numSelected == 1) ? "{0} item selected" : "{0} items selected";
                },
                maxOptionsText: function (numAll, numGroup) {
                    return [
                        (numAll == 1) ? 'Limit reached ({n} item max)' : 'Limit reached ({n} items max)',
                        (numGroup == 1) ? 'Group limit reached ({n} item max)' : 'Group limit reached ({n} items max)'
                    ];
                },
                selectAllText: 'Select All',
                deselectAllText: 'Deselect All',
                multipleSeparator: ', '
            };
        }
        $(function () {
            $('.cameraHelp-zh').remove();
        })

    }
}
// it.util.setLanguage(dataJson.SetLanguage ? dataJson.SetLanguage : 'zh');

it.util.isArray = function (o) {
    return util.is(o, 'Array');
}
it.util.is = function (o, obj) {
    return Object.prototype.toString.call(o) === '[object ' + obj + ']';
}

util.showError = function (result) {
    if (!result) return true;
    if (result instanceof Object && !result.error) {
        return true;
    }
    var error = result.error || result, message = error.message || error;
    layer.alert(util.i18n(error));
}
util.showMessage = function (msg) {
    layer.msg(util.i18n(msg));
}

util.loadCategories = function (callback, params) {
    params = params || {};
    return util.api('category', 'find', params, function (data) {
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

util.setRackExtraInfo = function(rackData){
    var RackExtraInfo = {};
    var devices = rackData._childList._as;
    // 设备的信息
    var devicesInfo = [];
    for(var i=0; i<devices.length; i++){
        var deviceData = devices[i];
        var deviceId = deviceData._id;
        var deviceDataType = main.sceneManager.dataManager.getDataTypeForData(deviceData);
        var startU = parseInt(deviceData._location.y);
        var deviceU = parseInt(deviceDataType._size.ySize);
        var endU = startU + deviceU - 1;
        var power = deviceDataType._powerRating;
        var weight = deviceDataType._weightRating;
        var model = deviceDataType._description||deviceDataType._name||deviceDataType._id;
        devicesInfo.push({
            deviceId: deviceId,
            startU: startU,
            endU: endU,
            deviceU: deviceU,
            power: power,
            weight: weight,
            model: model,
        })
    }
    RackExtraInfo.devicesInfo = devicesInfo;
    // 机柜自身的信息
    var rackInfo = {};
    var rackDataType = main.sceneManager.dataManager.getDataTypeForData(rackData);
    var allPower = rackDataType._powerRating,
        allWeight = rackDataType._weightRating,
        restPower = allPower,
        restWeight = allWeight;
    for (var i = 0; i < devicesInfo.length; i++) {
        var dInfo = devicesInfo[i];
        restPower -= dInfo.power;
        restWeight -= dInfo.weight;
    }
    rackInfo = {
        allPower: allPower,
        allWeight: allWeight,
        countPower: allPower - restPower,
        countWeight: allWeight - restWeight,
        restPower: restPower,
        restWeight: restWeight,
    }
    RackExtraInfo.rackInfo = rackInfo;
    rackData['rackExtraInfo'] = RackExtraInfo;
},

util.loadDataTypes = function (callback, params) {
    params = params || {};
    return util.api('datatype', 'find', params, function (data) {
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

/**
* @function {loadDatas} 加载所有的 data
* @param  {type} callback {description}
* @param  {type} params   {description}
* @return {type} {description}
*/
util.loadDatas = function (callback, params) {
    params = params || {};
    return util.api('data', 'find', params, function (data) {
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

/**
* @function {loadCustomData} 加载扩展字段的数据
* @param  {type} callback {description}
* @param  {type} params   {description}
* @return {type} {description}
*/
util.loadCustomData = function (callback, params) {
    return it.util.api('data', 'getCustomDataByCategory', params, function (customDatas) {
        var r1 = {};
        customDatas = customDatas || [];
        customDatas.forEach(function (customData) {
            var id = customData.id;
            r1[id] = customData;
        })
        util.customDataArray = customDatas;
        util.customDataMap = r1;
        callback && callback();
    })
}

/**
* @function {loadBusinessTypes} 加载业务类型
* @param  {type} callback {description}
* @param  {type} params   {description}
* @return {type} {description}
*/
util.loadBusinessTypes = function (callback, params) {
    params = params || {};
    return it.util.api('business_type', 'search', params, function (types) {
        var r1 = {};
        types.forEach(function (item) {
            var id = item.id;
            r1[id] = item;

        })
        util.businessTypeArray = types;
        util.businessTypeMap = r1;
        callback && callback();
    })
}

/**
* @function {loadLinks} 加载线路
* @param  {type} callback {description}
* @param  {type} params   {description}
* @return {type} {description}
*/
util.loadLinks = function (callback, params) {
    params = params || {};
    return it.util.api('link', 'search', params, function (links) {
        var r1 = {};
        links.forEach(function (item) {
            var id = item.id;
            r1[id] = item;

        })
        util.linkArray = links;
        util.linkMap = r1;
        callback && callback();
    })
}

/**
* @function {function name} 根据 categoryId 查找所有 data
* @param  {type} categoryId {description}
* @param  {type} callback   {description}
* @return {type} {description}
*/
util.loadDataByCategoryId = function (categoryId, callback) {
    var params = null;
    if (categoryId instanceof Array) {
        params = categoryId.map(function (id) {
            return { id: id }
        });
    } else {
        params = { id: categoryId };
    }
    return util.api('data', 'getDataByCategory', params, function (data) {
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
                console.error(it.util.i18n("utils_Stringify_fail"), obj);
            }
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
                console.error(it.util.i18n("utils_Parse_fail"), str);
            }
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
    HEADER_RACK: 'headerRack',
    SEAT: 'seat',
    EQUIPMENT: 'equipment'
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

var RADIANS_TO_DEGREES = 180 / Math.PI;
var DEGREES_TO_RADIANS = Math.PI / 180;
util.playCameraAnimation = function (camera, pos, target, delay, time, interval, callback) {
    pos = pos || camera.p();
    target = target || camera.getTarget();
    time = time || 2000;
    var angles = mono.Utils.getVectorAngles(camera.getTarget(), camera.p());
    var angles2 = mono.Utils.getVectorAngles(target, pos);
    var dha = angles2[0] - angles[0];
    if (dha > 180) {
        dha = dha - 360;
    } else if (dha < -180) {
        dha = dha + 360;
    }
    var dva = angles2[1] - angles[1];
    if (dva > 180) {
        dva = dva - 360;
    } else if (dva < -180) {
        dva = dva + 360;
    }
    var t1 = camera.getTarget();
    var t2 = target;
    var d1 = camera.getDistance(), d2 = new mono.Vec3().subVectors(pos, target).length();
    //console.log('');
    // console.log('');
    return new twaver.Animate({
        from: 0,
        to: 1,
        repeat: 1,
        delay: delay,
        dur: time,
        interval: interval,
        onPlay: function () {
        },
        onUpdate: function (value) {
            var hAngle = angles[0] + (dha) * value;
            var vAngle = angles[1] + (dva) * value;
            //console.log('hAngle=', hAngle, '  vAngle', vAngle);
            var t = new mono.Vec3().lerpVectors(t1, t2, value);
            var d = d1 + (d2 - d1) * value;
            var newPos = new mono.Vec3();
            newPos.x = t.x + d * Math.sin(hAngle * DEGREES_TO_RADIANS) * Math.cos(vAngle * DEGREES_TO_RADIANS);
            newPos.z = t.z + d * Math.cos(hAngle * DEGREES_TO_RADIANS) * Math.cos(vAngle * DEGREES_TO_RADIANS);
            newPos.y = t.y + d * Math.sin(vAngle * DEGREES_TO_RADIANS);
            camera.lookAt(t);
            camera.p(newPos);
            //var t = new mono.Vec3().lerpVectors(t1, t2, value);
            //var p = new mono.Vec3().lerpVectors(p1, p2, value);
            //camera.lookAt(t);
            //camera.p(p);
        },
        onDone: function () {
            if (callback)
                callback();
        }
    }).play();
};

util.playCamera = function (camera, action, callback) {

    var position = null;
    var target = null;
    if (action.p != undefined) {
        position = action.p;
    } else {
        position = camera.p().clone();
    }
    if (action.t != undefined) {
        target = action.t;
    } else {
        target = camera.getTarget().clone();
    }

    if (action.px != undefined) {
        position.setX(action.px);
    }
    if (action.py != undefined) {
        position.setY(action.py);
    }
    if (action.pz != undefined) {
        position.setZ(action.pz);
    }

    if (action.tx != undefined) {
        target.setX(action.tx);
    }
    if (action.ty != undefined) {
        target.setY(action.ty);
    }
    if (action.tz != undefined) {
        target.setZ(action.tz);
    }

    if (action.dpx != undefined) {
        position.setX(position.x + action.dpx);
    }
    if (action.dpy != undefined) {
        position.setY(position.y + action.dpy);
    }
    if (action.dpz != undefined) {
        position.setZ(position.z + action.dpz);
    }

    if (action.dtx != undefined) {
        target.setX(target.x + action.dtx);
    }
    if (action.dty != undefined) {
        target.setY(target.y + action.dty);
    }
    if (action.dtz != undefined) {
        target.setZ(target.z + action.dtz);
    }
    var p = new mono.Vec3(position.x, position.y, position.z);
    var t = new mono.Vec3(target.x, target.y, target.z);
    this.playCameraAnimation(camera, p, t, action.waitTime || 0, action.playTime || 1000, action.holdTime || 500, callback)
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

it.util.images = {
    realtimImage: "data:image/png;base64,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0p8zAABBZmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMwNjcgNzkuMTU3NzQ3LCAyMDE1LzAzLzMwLTIzOjQwOjQyICAgICAgICAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgICAgICAgICAgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iCiAgICAgICAgICAgIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiCiAgICAgICAgICAgIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIgogICAgICAgICAgICB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICAgICAgICAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyI+CiAgICAgICAgIDx4bXA6Q3JlYXRvclRvb2w+QWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCk8L3htcDpDcmVhdG9yVG9vbD4KICAgICAgICAgPHhtcDpDcmVhdGVEYXRlPjIwMTctMDMtMDZUMTU6MzM6NTArMDg6MDA8L3htcDpDcmVhdGVEYXRlPgogICAgICAgICA8eG1wOk1ldGFkYXRhRGF0ZT4yMDE3LTAzLTA4VDEyOjA0OjQ5KzA4OjAwPC94bXA6TWV0YWRhdGFEYXRlPgogICAgICAgICA8eG1wOk1vZGlmeURhdGU+MjAxNy0wMy0wOFQxMjowNDo0OSswODowMDwveG1wOk1vZGlmeURhdGU+CiAgICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2UvcG5nPC9kYzpmb3JtYXQ+CiAgICAgICAgIDx4bXBNTTpJbnN0YW5jZUlEPnhtcC5paWQ6NjM0MjgyNmEtZDRjNy00OTdiLThiM2UtNjI3ZjNlYzliNmQ5PC94bXBNTTpJbnN0YW5jZUlEPgogICAgICAgICA8eG1wTU06RG9jdW1lbnRJRD5hZG9iZTpkb2NpZDpwaG90b3Nob3A6YzYwMDNiZjgtNDQ0Mi0xMTdhLWExYWYtYTRkYzc3OGMxMTNjPC94bXBNTTpEb2N1bWVudElEPgogICAgICAgICA8eG1wTU06T3JpZ2luYWxEb2N1bWVudElEPnhtcC5kaWQ6ZmU2NDBhMTYtZWNjZi00Yzg1LWFjM2YtODc5YzEzZjliNDZjPC94bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ+CiAgICAgICAgIDx4bXBNTTpIaXN0b3J5PgogICAgICAgICAgICA8cmRmOlNlcT4KICAgICAgICAgICAgICAgPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDphY3Rpb24+Y3JlYXRlZDwvc3RFdnQ6YWN0aW9uPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6aW5zdGFuY2VJRD54bXAuaWlkOmZlNjQwYTE2LWVjY2YtNGM4NS1hYzNmLTg3OWMxM2Y5YjQ2Yzwvc3RFdnQ6aW5zdGFuY2VJRD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OndoZW4+MjAxNy0wMy0wNlQxNTozMzo1MCswODowMDwvc3RFdnQ6d2hlbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnNvZnR3YXJlQWdlbnQ+QWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCk8L3N0RXZ0OnNvZnR3YXJlQWdlbnQ+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmFjdGlvbj5zYXZlZDwvc3RFdnQ6YWN0aW9uPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6aW5zdGFuY2VJRD54bXAuaWlkOjk5NjRkMTMxLWU0ZWUtNDAyZC05ZGYzLTc2MDUyZjAxMjYzYTwvc3RFdnQ6aW5zdGFuY2VJRD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OndoZW4+MjAxNy0wMy0wNlQxNTozOToxMSswODowMDwvc3RFdnQ6d2hlbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnNvZnR3YXJlQWdlbnQ+QWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCk8L3N0RXZ0OnNvZnR3YXJlQWdlbnQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpjaGFuZ2VkPi88L3N0RXZ0OmNoYW5nZWQ+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmFjdGlvbj5zYXZlZDwvc3RFdnQ6YWN0aW9uPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6aW5zdGFuY2VJRD54bXAuaWlkOmMxOWQ4YmY3LWM1NzYtNDU1MS05Y2MxLWM0ZTdmNWZjNTlhNDwvc3RFdnQ6aW5zdGFuY2VJRD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OndoZW4+MjAxNy0wMy0wOFQxMjowNDo0OSswODowMDwvc3RFdnQ6d2hlbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnNvZnR3YXJlQWdlbnQ+QWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCk8L3N0RXZ0OnNvZnR3YXJlQWdlbnQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpjaGFuZ2VkPi88L3N0RXZ0OmNoYW5nZWQ+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmFjdGlvbj5jb252ZXJ0ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnBhcmFtZXRlcnM+ZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZzwvc3RFdnQ6cGFyYW1ldGVycz4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6YWN0aW9uPmRlcml2ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnBhcmFtZXRlcnM+Y29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmc8L3N0RXZ0OnBhcmFtZXRlcnM+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmFjdGlvbj5zYXZlZDwvc3RFdnQ6YWN0aW9uPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6aW5zdGFuY2VJRD54bXAuaWlkOjYzNDI4MjZhLWQ0YzctNDk3Yi04YjNlLTYyN2YzZWM5YjZkOTwvc3RFdnQ6aW5zdGFuY2VJRD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OndoZW4+MjAxNy0wMy0wOFQxMjowNDo0OSswODowMDwvc3RFdnQ6d2hlbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnNvZnR3YXJlQWdlbnQ+QWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCk8L3N0RXZ0OnNvZnR3YXJlQWdlbnQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpjaGFuZ2VkPi88L3N0RXZ0OmNoYW5nZWQ+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICA8L3JkZjpTZXE+CiAgICAgICAgIDwveG1wTU06SGlzdG9yeT4KICAgICAgICAgPHhtcE1NOkRlcml2ZWRGcm9tIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgPHN0UmVmOmluc3RhbmNlSUQ+eG1wLmlpZDpjMTlkOGJmNy1jNTc2LTQ1NTEtOWNjMS1jNGU3ZjVmYzU5YTQ8L3N0UmVmOmluc3RhbmNlSUQ+CiAgICAgICAgICAgIDxzdFJlZjpkb2N1bWVudElEPmFkb2JlOmRvY2lkOnBob3Rvc2hvcDpjNGZhZDViNy00MmNkLTExN2EtOTdlOS1kYmQ4MTEwY2I0NmY8L3N0UmVmOmRvY3VtZW50SUQ+CiAgICAgICAgICAgIDxzdFJlZjpvcmlnaW5hbERvY3VtZW50SUQ+eG1wLmRpZDpmZTY0MGExNi1lY2NmLTRjODUtYWMzZi04NzljMTNmOWI0NmM8L3N0UmVmOm9yaWdpbmFsRG9jdW1lbnRJRD4KICAgICAgICAgPC94bXBNTTpEZXJpdmVkRnJvbT4KICAgICAgICAgPHBob3Rvc2hvcDpDb2xvck1vZGU+MzwvcGhvdG9zaG9wOkNvbG9yTW9kZT4KICAgICAgICAgPHBob3Rvc2hvcDpJQ0NQcm9maWxlPnNSR0IgSUVDNjE5NjYtMi4xPC9waG90b3Nob3A6SUNDUHJvZmlsZT4KICAgICAgICAgPHRpZmY6T3JpZW50YXRpb24+MTwvdGlmZjpPcmllbnRhdGlvbj4KICAgICAgICAgPHRpZmY6WFJlc29sdXRpb24+MTUwMDAwMC8xMDAwMDwvdGlmZjpYUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6WVJlc29sdXRpb24+MTUwMDAwMC8xMDAwMDwvdGlmZjpZUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MjwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICAgICAgICAgPGV4aWY6Q29sb3JTcGFjZT4xPC9leGlmOkNvbG9yU3BhY2U+CiAgICAgICAgIDxleGlmOlBpeGVsWERpbWVuc2lvbj44MTwvZXhpZjpQaXhlbFhEaW1lbnNpb24+CiAgICAgICAgIDxleGlmOlBpeGVsWURpbWVuc2lvbj4xMDc8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/PvvyEcAAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAH+FJREFUeNrsnXmcJVWV53/n3hvxtnyZWVkLtVBUlewiCkJTfEBttF3apafHUdBpUQaZwXYEpGFk1FZGHQedQWkUZQQFN1wQGHVUcEEUkMVRQdmK2iiqgKK2XN8WEffec/qPG2+pPWvP0onPJz4vq/K9l+9945x7zj1bkIhg0sdti7EPjyqAhQDmA+gDMJg/RvnvUwDDADYCWA7gaQAe+/N4y2+3+d8GB+YwAE4FcDqMOg1GvRikFgoRBAIwQQiACNC+xkQgAICAiECQDJ6Xw/ESMD8A4B4ADwHgA/Fl9tdRAvB6KPU2ROp1rNSAcODEGUEiDSlpoKQARRAAxAqAQIQA8gABJAKyAmpxTNYdR0YfR0reqggg5o2w7nYwvgfgFwDsnwvEowFc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",
    realtimImageInner: "data:image/png;base64,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0p8zAABBZmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMwNjcgNzkuMTU3NzQ3LCAyMDE1LzAzLzMwLTIzOjQwOjQyICAgICAgICAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgICAgICAgICAgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iCiAgICAgICAgICAgIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiCiAgICAgICAgICAgIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIgogICAgICAgICAgICB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICAgICAgICAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyI+CiAgICAgICAgIDx4bXA6Q3JlYXRvclRvb2w+QWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCk8L3htcDpDcmVhdG9yVG9vbD4KICAgICAgICAgPHhtcDpDcmVhdGVEYXRlPjIwMTctMDMtMDZUMTU6MzM6NTArMDg6MDA8L3htcDpDcmVhdGVEYXRlPgogICAgICAgICA8eG1wOk1ldGFkYXRhRGF0ZT4yMDE3LTAzLTA4VDEyOjEwOjIxKzA4OjAwPC94bXA6TWV0YWRhdGFEYXRlPgogICAgICAgICA8eG1wOk1vZGlmeURhdGU+MjAxNy0wMy0wOFQxMjoxMDoyMSswODowMDwveG1wOk1vZGlmeURhdGU+CiAgICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2UvcG5nPC9kYzpmb3JtYXQ+CiAgICAgICAgIDx4bXBNTTpJbnN0YW5jZUlEPnhtcC5paWQ6YTY0ZjZjNDMtNWE2Mi00NGU5LThlZTQtNmRmMjdiN2JjNmM1PC94bXBNTTpJbnN0YW5jZUlEPgogICAgICAgICA8eG1wTU06RG9jdW1lbnRJRD5hZG9iZTpkb2NpZDpwaG90b3Nob3A6OGNjZGQ1ODMtNDQ0My0xMTdhLWExYWYtYTRkYzc3OGMxMTNjPC94bXBNTTpEb2N1bWVudElEPgogICAgICAgICA8eG1wTU06T3JpZ2luYWxEb2N1bWVudElEPnhtcC5kaWQ6ZmU2NDBhMTYtZWNjZi00Yzg1LWFjM2YtODc5YzEzZjliNDZjPC94bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ+CiAgICAgICAgIDx4bXBNTTpIaXN0b3J5PgogICAgICAgICAgICA8cmRmOlNlcT4KICAgICAgICAgICAgICAgPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDphY3Rpb24+Y3JlYXRlZDwvc3RFdnQ6YWN0aW9uPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6aW5zdGFuY2VJRD54bXAuaWlkOmZlNjQwYTE2LWVjY2YtNGM4NS1hYzNmLTg3OWMxM2Y5YjQ2Yzwvc3RFdnQ6aW5zdGFuY2VJRD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OndoZW4+MjAxNy0wMy0wNlQxNTozMzo1MCswODowMDwvc3RFdnQ6d2hlbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnNvZnR3YXJlQWdlbnQ+QWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCk8L3N0RXZ0OnNvZnR3YXJlQWdlbnQ+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmFjdGlvbj5zYXZlZDwvc3RFdnQ6YWN0aW9uPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6aW5zdGFuY2VJRD54bXAuaWlkOjk5NjRkMTMxLWU0ZWUtNDAyZC05ZGYzLTc2MDUyZjAxMjYzYTwvc3RFdnQ6aW5zdGFuY2VJRD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OndoZW4+MjAxNy0wMy0wNlQxNTozOToxMSswODowMDwvc3RFdnQ6d2hlbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnNvZnR3YXJlQWdlbnQ+QWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCk8L3N0RXZ0OnNvZnR3YXJlQWdlbnQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpjaGFuZ2VkPi88L3N0RXZ0OmNoYW5nZWQ+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmFjdGlvbj5zYXZlZDwvc3RFdnQ6YWN0aW9uPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6aW5zdGFuY2VJRD54bXAuaWlkOjBjMGNhNTg2LWJmNzYtNDExMS1iNjI5LWFiNjNiODlhYzY1Yzwvc3RFdnQ6aW5zdGFuY2VJRD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OndoZW4+MjAxNy0wMy0wOFQxMjoxMDoyMSswODowMDwvc3RFdnQ6d2hlbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnNvZnR3YXJlQWdlbnQ+QWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCk8L3N0RXZ0OnNvZnR3YXJlQWdlbnQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpjaGFuZ2VkPi88L3N0RXZ0OmNoYW5nZWQ+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmFjdGlvbj5jb252ZXJ0ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnBhcmFtZXRlcnM+ZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZzwvc3RFdnQ6cGFyYW1ldGVycz4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6YWN0aW9uPmRlcml2ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnBhcmFtZXRlcnM+Y29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmc8L3N0RXZ0OnBhcmFtZXRlcnM+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmFjdGlvbj5zYXZlZDwvc3RFdnQ6YWN0aW9uPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6aW5zdGFuY2VJRD54bXAuaWlkOmE2NGY2YzQzLTVhNjItNDRlOS04ZWU0LTZkZjI3YjdiYzZjNTwvc3RFdnQ6aW5zdGFuY2VJRD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OndoZW4+MjAxNy0wMy0wOFQxMjoxMDoyMSswODowMDwvc3RFdnQ6d2hlbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnNvZnR3YXJlQWdlbnQ+QWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCk8L3N0RXZ0OnNvZnR3YXJlQWdlbnQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpjaGFuZ2VkPi88L3N0RXZ0OmNoYW5nZWQ+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICA8L3JkZjpTZXE+CiAgICAgICAgIDwveG1wTU06SGlzdG9yeT4KICAgICAgICAgPHhtcE1NOkRlcml2ZWRGcm9tIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgPHN0UmVmOmluc3RhbmNlSUQ+eG1wLmlpZDowYzBjYTU4Ni1iZjc2LTQxMTEtYjYyOS1hYjYzYjg5YWM2NWM8L3N0UmVmOmluc3RhbmNlSUQ+CiAgICAgICAgICAgIDxzdFJlZjpkb2N1bWVudElEPmFkb2JlOmRvY2lkOnBob3Rvc2hvcDpjNGZhZDViNy00MmNkLTExN2EtOTdlOS1kYmQ4MTEwY2I0NmY8L3N0UmVmOmRvY3VtZW50SUQ+CiAgICAgICAgICAgIDxzdFJlZjpvcmlnaW5hbERvY3VtZW50SUQ+eG1wLmRpZDpmZTY0MGExNi1lY2NmLTRjODUtYWMzZi04NzljMTNmOWI0NmM8L3N0UmVmOm9yaWdpbmFsRG9jdW1lbnRJRD4KICAgICAgICAgPC94bXBNTTpEZXJpdmVkRnJvbT4KICAgICAgICAgPHBob3Rvc2hvcDpDb2xvck1vZGU+MzwvcGhvdG9zaG9wOkNvbG9yTW9kZT4KICAgICAgICAgPHBob3Rvc2hvcDpJQ0NQcm9maWxlPnNSR0IgSUVDNjE5NjYtMi4xPC9waG90b3Nob3A6SUNDUHJvZmlsZT4KICAgICAgICAgPHRpZmY6T3JpZW50YXRpb24+MTwvdGlmZjpPcmllbnRhdGlvbj4KICAgICAgICAgPHRpZmY6WFJlc29sdXRpb24+MTUwMDAwMC8xMDAwMDwvdGlmZjpYUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6WVJlc29sdXRpb24+MTUwMDAwMC8xMDAwMDwvdGlmZjpZUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MjwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICAgICAgICAgPGV4aWY6Q29sb3JTcGFjZT4xPC9leGlmOkNvbG9yU3BhY2U+CiAgICAgICAgIDxleGlmOlBpeGVsWERpbWVuc2lvbj44MTwvZXhpZjpQaXhlbFhEaW1lbnNpb24+CiAgICAgICAgIDxleGlmOlBpeGVsWURpbWVuc2lvbj4xMDc8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/Pr0HxLUAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAIs1JREFUeNrsnXmcHFW593/nVFVXr7PPZJYsk30jEDbZ5bIISIQ3iCgKCAouqCyClyt4weuKsmgQogKCyKKvsogiQUCWJELYErbsAbLNJJl9pveqOuc87x/V1V3d05PMJJOEq+/5fOrTSU8vVd96zrOd5zzNiAjDHWfc1om9OGIAWgGMAxAFUJV7NHJ/twD0AOgCsAHAJgAS+3A8cUVD2ed17J+hAzgSwDGc4WgGHMg5WgFAKYBz97F0eM9zDgCwlcIGAtYowjIASwCsAKD2x8XsqxEC8HHO8BkGnAqgEgAod3hwdI25wDSAs8KbhaI8yNwIEDCbAbM1hk/lAHdJwiIAfwLwLADnXwXidADf4AznM3eKwoPHAJg6gyJAEUEpwCGCIhegIkDl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",
}

it.util.loadJs = function (jsUrl, callback, error) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    document.head.appendChild(script);
    script.src = jsUrl;
    script.onload = function () {
        callback && callback();
    }
    script.onerror = error;
}

it.util.preLoadImage = function (url, callback, error) {
    var img = new Image();
    img.onload = function () {
        console.log('loaded ', url);
        callback && callback();
    };
    img.src = url;
    img.onerror = error;
}

it.util.getUrlParam = function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(decodeURIComponent(r[2]));
    return null;
}

it.util.decodePolygon = function (coordinate, encodeOffsets) {
    var result = [];
    var prevX = encodeOffsets[0];
    var prevY = encodeOffsets[1];

    for (var i = 0; i < coordinate.length; i += 2) {
        var x = coordinate.charCodeAt(i) - 64;
        var y = coordinate.charCodeAt(i + 1) - 64;
        // ZigZag decoding
        x = (x >> 1) ^ (-(x & 1));
        y = (y >> 1) ^ (-(y & 1));
        // Delta deocding
        x += prevX;
        y += prevY;

        prevX = x;
        prevY = y;
        // Dequantize
        result.push([x / 1024, y / 1024]);
    }
    return result;
}

it.util.getDecode = function (name, json) {
    if (!it.util[name]) {
        it.util[name] = it.util.decode(json);
    }
    return it.util[name];
}

it.util.decode = function (json) {
    var self = this;
    if (!json.UTF8Encoding) {
        return json;
    }
    var features = json.features;

    for (var f = 0; f < features.length; f++) {
        var feature = features[f];
        var geometry = feature.geometry;
        var coordinates = geometry.coordinates;
        var encodeOffsets = geometry.encodeOffsets;

        for (var c = 0; c < coordinates.length; c++) {
            var coordinate = coordinates[c];

            if (geometry.type === 'Polygon') {
                coordinates[c] = it.util.decodePolygon(coordinate, encodeOffsets[c]);
            } else if (geometry.type === 'MultiPolygon') {
                for (var c2 = 0; c2 < coordinate.length; c2++) {
                    var polygon = coordinate[c2];
                    coordinate[c2] = it.util.decodePolygon(polygon, encodeOffsets[c][c2]);
                }
            }
        }
    }
    // Has been decoded
    json.UTF8Encoding = false;
    return json;
}

it.util.useCompoment = function () {
    if (arguments.length == 0) return;
    var callback = null, items = [];
    if (typeof arguments[arguments.length - 1] == 'function') {
        callback = arguments[arguments.length - 1];
        for (var i = 0; i < arguments.length - 1; i++) {
            if (!arguments[i]) {
                continue
            }
            items.push(arguments[i]);
        }
    } else {
        for (var i = 0; i < arguments.length; i++) {
            if (!arguments[i]) {
                continue
            }
            items.push(arguments[i]);
        }
    }
    var ps = items.map(function (item) {
        return new Promise(function (resolve, reject) {
            it.util.loadJs(pageConfig.url('/component/' + item + '.js'), resolve, reject)
        });
    })
    Promise.all(ps).then(callback).catch(function (e) {
        console.error('加载组件异常:', e);
    })
}

/**
 * 使用掺元类
 * 
 * @param {any} receivingClass - 接收方法的类名
 * @param {any} givingClass - 提供方法的类名
 * 可以使用大于两个的参数，表示只传递指定名称的方法
 */
it.util.augment = function(receivingClass, givingClass){
    if(arguments.length > 2){
        for(var i= 2, len = arguments.length;i<len;i++){
            receivingClass.prototype[arguments[i]] = givingClass.prototype[arguments[i]];
        }
    }else{
        for(var methodName in givingClass.prototype){
            if(!receivingClass.prototype[methodName]){
                receivingClass.prototype[methodName] = givingClass.prototype[methodName];
            }
        }
    }
}

it.util.makeImageBillboard = function (image) {
    var imgWidth = image.width;
    var imgHeight = image.height;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = imgWidth;
    canvas.height = imgHeight;
    ctx.drawImage(image, 0, 0, imgWidth, imgHeight);
    var board = it.util.makeBillboardByCanvas(canvas);
    return board;
}

/**
 * 
 * 
 * @param {Object} params - 需要传入的参数obj
 * @param {string} params.image - 需要传入的背景图片
 * @param {array} params.scale - billboard的用户尺寸，长度为2或者3的数组
 * @param {string} params.number - 需要显示的文字内容
 * @param {string} params.numberColor - 需要传入的数值颜色
 * @param {string} params.canvas - billboard中的canvas的dom（若没有则不填）
 * @returns 
 */
it.util.makeNumberTipBillboard = function (params) {
    var image = params.image;
    var scale = params.scale;
    var number = params.number;
    var numberColor = params.numberColor || '#000';
    var canvas = params.canvas || document.createElement('canvas');

    var imgWidth = image.width;
    var imgHeight = image.height;
    var ctx = canvas.getContext('2d');
    canvas.width = imgWidth;
    canvas.height = imgHeight;
    ctx.drawImage(image, 0, 0, imgWidth, imgHeight);
    var canvasText = document.createElement('canvas');
    var ctxText = canvasText.getContext('2d');
    ctxText.font =
        "bolder 160px 'Source Han Sans CN', 'Microsoft YaHei', Verdana, Helvetica, Arial, 'Open Sans', sans-serif";
    ctxText.fillStyle = numberColor;
    ctxText.textBaseline = 'hanging';
    // getMaxTextSize的第一个参数要是一个数组
    var array = [number];
    var size = mono.Utils.getMaxTextSize(array, ctxText.font);
    var canvasTextWidth = size.width;
    var canvasTextHeight = size.height;
    ctxText.fillText(number, 0, 0);
    // textHeight这个参数决定字在图片中所占的大小
    var textHeight = imgHeight / 3;
    var textWidth = textHeight * canvasTextWidth / canvasTextHeight;
    ctx.drawImage(canvasText, 0, 0, canvasTextWidth, canvasTextHeight, (imgWidth - textWidth) / 2, (imgHeight - textHeight) * 2 / 5, textWidth, textHeight);

    // return canvas;
    var board = it.util.makeBillboardByCanvas(canvas);
    var oldScale = board.getScale();
    if (scale && scale.length >= 2) {
        var billboardScale = [oldScale.x * scale[0], oldScale.y * scale[1], 1]
        board.setScale(billboardScale[0], billboardScale[1], 1);
    }
    return board;
}

it.util.makeBillboardByCanvas = function (canvas) {
    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;
    var bigCanvasWidth = mono.Utils.nextPowerOfTwo(canvasWidth);
    var bigCanvasHeight = mono.Utils.nextPowerOfTwo(canvasHeight);
    var newCanvas = document.createElement('canvas');
    var ctx = newCanvas.getContext('2d');
    newCanvas.width = bigCanvasWidth;
    newCanvas.height = bigCanvasHeight;
    ctx.drawImage(canvas, 0, bigCanvasHeight - canvasHeight, canvasWidth, canvasHeight);
    var board = new mono.Billboard();
    board.s({
        'm.texture.image': newCanvas,
        'm.transparent': true,
        'm.alignment': mono.BillboardAlignment.bottomCenter,
        'm.vertical': false,
        'm.texture.repeat': new mono.Vec2(canvasWidth/bigCanvasWidth, canvasHeight/bigCanvasHeight),
        'm.texture.offset': new mono.Vec2(0, 0),
    });
    board.setScale(canvasWidth, canvasHeight, 1);
    return board;
}


/**
 * 在显示机柜中没被占用的U位时，每个U位绘制一个plane
 * 
 * @param {object} params - 需要传入的参数obj
 * @param {string} params.bgColor - 绘制canvas时背景的颜色
 * @param {string} params.borderColor - 绘制canvas时边框的颜色
 * @param {number} params.popWidth - U位的长高
 * @param {number} params.popHeight - 
 * @param {number} params.yLocation - pop的逻辑坐标
 * @param {number} params.ySize - 机柜dataType 的childrensize.ySize
 * @param {number} params.zPosition - pop的z坐标
 * @param {object} params.customPro - 自定义属性
 * 
 */
it.util.createEmptyNode = function (params, parentNode) {
    var bgColor = params.bgColor,
        borderColor = params.borderColor,
        popWidth = params.popWidth,
        popHeight = params.popHeight,
        yLocation = params.yLocation,
        ySize = params.ySize,
        zPosition = params.zPosition,
        customPro = params.customPro,
        uOrder = params.uOrder;

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = "bold 10px 'Source Han Sans CN', 'Microsoft YaHei', Verdana, Helvetica, Arial, 'Open Sans', sans-serif";
    var textWidth = context.measureText(yLocation).width;
    var textHeight = context.measureText('M').width;
    canvas.width = textWidth;
    canvas.height = textHeight;
    context.textBaseline = 'middle';
    context.fillStyle = '#fff';
    context.fillText(yLocation, 0, textHeight / 2);
    var canvas2 = document.createElement('canvas');
    var context2 = canvas2.getContext('2d');
    canvas2.width = textHeight * 2 * popWidth / popHeight;
    canvas2.height = textHeight * 2;       
    context2.fillStyle = bgColor;
    context2.fillRect(0, 0, canvas2.width, canvas2.height);
    context2.strokeStyle = borderColor;
    context2.lineWidth=2; 
    context2.strokeRect(0, 0, canvas2.width, canvas2.height);
    context2.drawImage(canvas, (canvas2.width - canvas.width) / 2, textHeight / 2);

    var pop = new mono.Plane(popWidth, popHeight);
    pop.s({
        'm.texture.image': canvas2,
        'm.transparent': true,
        'm.opacity': 0.7,
    })
    var yPosition = popHeight * (yLocation - ySize / 2 - 0.5)
    if (uOrder == 'upToDown') {
        yPosition = -1*yPosition;
    }
    pop.setPosition(new mono.Vec3(0, yPosition, zPosition)); 
    var  customPro = params.customPro; 
    if(customPro && !$.isEmptyObject(customPro))  {
        for(key in customPro) {
            pop.setClient(key, customPro[key]);            
        }
    }
    if(parentNode) {
        pop.setParent(parentNode);
    }  
    return pop;
}

 /**
 * 在机柜中显示未占用的情况
 * @param {object} params - 需要传入的参数obj
 * @param {object} params.object - 需要传入的参数
 * @param {number} params.object.total - 总共占用的U位
 * @param {number} params.object.start - 起始U位
 * @param {number} params.object.end - 终止U位
 * @param {number} params.width - 机柜减掉padding后的长宽高
 * @param {number} params.height - 
 * @param {number} params.depth - 
 * @param {object} params.childSize - 机柜dataType 的childrensize
 * @param {string} params.bgColor - canvas背景的颜色，有默认值
 * @param {string} params.borderColor - canvas边框的颜色，有默认值
 * @param {string} params.diagonalColor - 斜线的颜色，有默认值
 * @param {string} params.textColor - 文字的颜色，有默认值
 * @param {string} params.lineColor - 中间分隔的横线的颜色，有默认值
 * @param {string} params.diagonalWidth - 斜线的宽度，有默认值
 * @param {string} params.borderWidth - 边框的宽度，有默认值
 * @param {string} params.lineWidth - 中间分隔的横线的宽度，有默认值
 * @param {string} params.textSize - 文字大小，有默认值
 * @param {string} params.isNeedDiagonal - 是否需要斜线
 * @param {obj} params.customPro - 自定义属性
 * 
 */

it.util.createOccupyPop =  function(params, parentNode,isU) {
    var object = params.object,        
        width = params.width,
        height = params.height,
        depth = params.depth,
        color = params.bgColor,
        childSize = params.childSize,
        customPro = params.customPro,
        uOrder = params.uOrder; 
        
    var total = object.total,start = object.start,end = object.end;
    var ySize = childSize.ySize,
        yPadding =  childSize.getYPadding() || [0,0],
        wrapPopHeight = total * height / ySize,
        popWidth = width,
        popHeight = height/ySize;
         
    var diagonalPop = new mono.Plane(width,wrapPopHeight);
    var x = 0,y = 0,z = 0;
    y = [(start + end)/2 - (ySize+1)/2] * popHeight;
    z = depth/2;
    if (uOrder == 'upToDown') {
        y = -1*y;
    }

    if(parentNode) {
        diagonalPop.setParent(parentNode);
    } 
    // wrapPop.setClient('spaceChildrenNode',true);   //专门用于空间搜索
    if(customPro && !$.isEmptyObject(customPro))  {
        for(key in customPro) {
            diagonalPop.setClient(key, customPro[key]);            
        }
    }
    diagonalPop.p(x,y,z);               
    
    //做贴图
    var params = {
        width:width,
        height:wrapPopHeight,
        lineColor:params.lineColor,
        diagonalColor:params.diagonalColor,
        borderColor:params.borderColor,
        bgColor: params.bgColor,
        textColor: params.textColor,
        diagonalWidth: params.diagonalWidth,
        lineWidth: params.lineWidth,
        borderWidth: params.borderWidth,
        textSize: params.textSize,
        ySize:ySize,
        popWidth:popWidth,
        popHeight:popHeight,
        total:total,
        start:start,
        end:end,
        isNeedDiagonal: params.isNeedDiagonal,
        isU: params.isU,
        uOrder:uOrder
    }
    var canvas = it.util.drawCanvas(params);
    var scales = 20;
    var repeat=  new mono.Vec2(width*scales/canvas.width, wrapPopHeight*scales/canvas.height); 
    diagonalPop.s({ 
        'm.texture.image': canvas,
        'm.transparent': true,
        'm.opacity': 0.7,   
        'm.texture.repeat': repeat,
        'm.texture.offset': new mono.Vec2(0, 0),
    });
    return diagonalPop;
}

it.util.drawCanvas = function(params, parentNode,isU) {
    var width = params.width,
        height = params.height,
        textColor = params.textColor || '#fff',
        lineColor = params.lineColor || '#0372c1',
        diagonalColor = params.diagonalColor || '#0372c1',
        borderColor = params.borderColor || '#0468ae',
        bgColor = params.bgColor || '#3a647f',
        diagonalWidth = params.diagonalWidth || 8,
        lineWidth = params.lineWidth || 2,
        borderWidth = params.borderWidth || 10,
        textSize = params.textSize || '40px',
        ySize = params.ySize,
        popWidth = params.popWidth,
        popHeight = params.popHeight,
        total = params.total,
        start = params.start,
        end = params.end,
        uOrder = params.uOrder; 
     
    var scale = 20;   
    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');

    canvas.width = width * scale;
    canvas.height = height * scale;
    ctx.save();
    var linePadding = canvas.width/30;
    popHeight = popHeight*scale;

    //背景
    ctx.fillStyle = bgColor;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    //画斜线
    if(params.isNeedDiagonal) {
        ctx.lineWidth = 8;
        ctx.strokeStyle = diagonalColor;
        for(var i = 0; i <= canvas.width; i += linePadding) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(0, i);
            ctx.stroke();
            ctx.closePath();
            ctx.restore();
        }
        for(var i = 0; i<= canvas.height; i += linePadding) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(canvas.width, i);
            ctx.lineTo(0, canvas.width + i);
            ctx.stroke();
            ctx.closePath();
            ctx.restore();
        }
     
    }

     if(!isU || total==1) {
        //画底边线
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = lineColor;  
        for(var i=popHeight;i<canvas.height; i+=popHeight) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
            ctx.closePath();
            ctx.restore();
        }
    }
   
    //写字
    ctx.font ="bold "+ textSize+ " 'Source Han Sans CN', 'Microsoft YaHei', Verdana, Helvetica, Arial, 'Open Sans', sans-serif";
    ctx.fillStyle = textColor;
    ctx.textBaseline = 'middle';
    ctx.textAlign="center";
    for(var j = end; j >= start; j--) {
        if(uOrder == 'upToDown') {
            ctx.fillText(j,canvas.width/2 , (j-start+1/2)*popHeight); 
        }else {
            ctx.fillText(j,canvas.width/2 , (end-j+1/2)*popHeight);
        }
    }

    var offset = borderWidth;
    ctx.lineWidth = offset;
    ctx.strokeRect(offset/2, offset/2, canvas.width-offset, canvas.height-offset);
    ctx.restore();

    var canvas2 = document.createElement('canvas'),
    ctx2 = canvas2.getContext('2d');
    canvas2.width = mono.Utils.nextPowerOfTwo(width * scale);
    canvas2.height = mono.Utils.nextPowerOfTwo(height * scale);
    ctx2.fillRect(0, 0, canvas2.width, canvas2.height);
    ctx2.drawImage(canvas, 0, canvas2.height - height * scale);
    return canvas2;
}

/**
 * 根据u位数计算机柜中的相对位置
 * @param {object} params  - 需要传入的参数obj
 * @param {number} params.u  - 起始u位，不可省略！！！
 * @param {number} params.uNum  - 所占u数，不可省略！！！
 * @param {number} params.uOrder  - 机柜中计算u位的顺序 从上至下或者从下至上，不可省略！！！
 * @param {object} params.rackChildrenSize  - 机柜的dataType中_childrenSize，不可省略！！！
 * @param {object} params.rackNode  - 机柜的node，该值 与 下面两个值rackDepth和uHeight 选取一个就可以了
 * @param {object} params.rackDepth  - 机柜内部深度
 * @param {object} params.uHeight  - 机柜内每一u的高度
 * @returns {object} mono.Vec3 直接用来设置坐标
 */
it.util.getRelativePositionByUInRack = function (params) {
    var u = params.u,
        uNum = params.uNum,
        uOrder = params.uOrder || 'downToUp',
        rackChildrenSize = params.rackChildrenSize,

        rackNode = params.rackNode,
        rackDepth = params.rackDepth || ((rackNode.depth || (rackNode.boundingBox.max.z - rackNode.boundingBox.min.z)) + rackChildrenSize.zPadding[0] + rackChildrenSize.zPadding[1]),
        uHeight = params.uHeight || (((rackNode.height || (rackNode.boundingBox.max.y - rackNode.boundingBox.min.y)) - rackChildrenSize.yPadding[0] - rackChildrenSize.yPadding[1]) / rackChildrenSize.ySize);

    var px = 0;
    // var py = uHeight * (u - rackChildrenSize.ySize / 2 - 0.5);
    var py = uHeight * ((2 * u + uNum - 1) / 2 - (rackChildrenSize.ySize + 1) / 2);
    var pz = rackDepth / 2;

    if (uOrder == 'upToDown') {
        py = -1*py;
    }
    return new mono.Vec3(px, py, pz);
},

 /**
 * 创建摄像头视域的comboNode
 * @param {number} fov - 摄像头视角
 * @param {number} width - 最近矩形的宽
 * @param {number} aspect - 最近矩形的高宽比
 * @param {number} length - 摄像头焦距
 * @param {object} cameraPos - 摄像头位置 mono.Vec3的实例
 * @param {number} cameraTarget - 摄像头的target mono.Vec3的实例
 * 
 */
it.util.createCone = function (fov, width, aspect, length, cameraPos, cameraTarget) {
    if (!fov || !width || !aspect || !length) {
        return null;
    }
    var height = width * aspect;
    var dY = Math.sin(fov * Math.PI / 360) * length; //最远的那个面的宽度：dy*2+width
    var dPX = dY / 2; // 每个shapeNode中心点的偏移量

    // 左右面的path
    var path = new mono.Path();
    path.moveTo(-length / 2, -height / 2, 0);
    path.lineTo(-length / 2, height / 2, 0);
    path.lineTo(length / 2, height / 2 + dY, 0);
    path.lineTo(length / 2, -height / 2 - dY, 0);
    // left:
    var l_s = new mono.ShapeNode(path);
    l_s.s({
        'm.type': 'phong',
        'm.color': '#00aaaa',
        'm.ambient': '#00aaaa',
    });
    l_s.setAmount(1);
    l_s.setZ(-dPX - width / 2);
    l_s.setRotationY(fov * Math.PI / 360);
    // right:
    var r_s = new mono.ShapeNode(path);
    r_s.s({
        'm.type': 'phong',
        'm.color': '#00aaaa',
        'm.ambient': '#00aaaa',
    });
    r_s.setAmount(1);
    r_s.setZ(dPX + width / 2);
    r_s.setRotationY(-fov * Math.PI / 360);

    //上下面的path：
    path = new mono.Path();
    path.moveTo(-length / 2, -width / 2, 0);
    path.lineTo(-length / 2, width / 2, 0);
    path.lineTo(length / 2, width / 2 + dY, 0);
    path.lineTo(length / 2, -width / 2 - dY, 0);
    // up:
    var u_s = new mono.ShapeNode(path);
    u_s.s({
        'm.type': 'phong',
        'm.color': '#00ffff',
        'm.ambient': '#00ffff',
        // 'm.wireframe':true,
    });
    u_s.setVertical(true);
    u_s.setAmount(1);
    u_s.setY(dPX + height / 2);
    u_s.setRotationZ(fov * Math.PI / 360);

    // down:
    var d_s = new mono.ShapeNode(path);
    d_s.s({
        'm.type': 'phong',
        'm.color': '#00ffff',
        'm.ambient': '#00ffff',
        // 'm.wireframe':true,
    });
    d_s.setVertical(true);
    d_s.setAmount(1);
    d_s.setY(-dPX - height / 2);
    d_s.setRotationZ(-fov * Math.PI / 360);

    //            return [l_s,r_s,u_s,d_s];

    var combo = new mono.ComboNode([l_s, r_s, u_s, d_s], ['+']);
    combo.s({
        'm.transparent': true,
        'm.opacity': 0.6
    });

    var newPos = new mono.Vec3();
    var angles = it.util.getVectorAngles(cameraPos, cameraTarget);
    // var angles = this._getVectorAngles(cameraTarget,cameraPos);
    var hAngle = angles[0];
    var vAngle = angles[1];

    newPos.x = cameraPos.x + length / 2 * Math.cos(hAngle * mono.Utils.DEGREES_TO_RADIANS); // * Math.cos(vAngle * DEGREES_TO_RADIANS);
    newPos.z = cameraPos.z + length / 2 * Math.sin(hAngle * mono.Utils.DEGREES_TO_RADIANS); // * Math.cos(vAngle * DEGREES_TO_RADIANS);
    newPos.y = cameraPos.y + length * Math.sin(vAngle * mono.Utils.DEGREES_TO_RADIANS);
    combo.setPosition(newPos);
    combo.setRotationY((-1) * hAngle * mono.Utils.DEGREES_TO_RADIANS);
    return combo;
};

it.util.getVectorAngles = function (v1, v2) {
    var diff = v1;
    if (v2) {
        diff = v2.clone().sub(v1);
    }
    diff = diff.normalize();
    var vAngle = Math.asin(diff.y) * mono.Utils.RADIANS_TO_DEGREES;
    var hAngle = Math.atan2(diff.z, diff.x) * mono.Utils.RADIANS_TO_DEGREES;

    return [hAngle, vAngle];
};

 /**
 * 创建摄像头视域的comboNode
 * @param {number} near - 摄像头到视域模型的顶部的距离
 * @param {number} far - 摄像头到视域模型的底部的距离
 * @param {number} fov - 摄像头视角
 * @param {obj} camera - 摄像头的node
 * 
 */
it.util.createCone2 = function (near, far, fov, camera) {

    function getR (height, fov) {
        var w = h = height * Math.tan(fov * Math.PI / 360);
        var num = w * w + h * h;
        var R = Math.sqrt(num);
        var R = parseInt(R);  
        return R
    }
    //顶部半径
    // var smallR = getR(near, fov);
    var smallR = parseInt(Math.tan(fov * Math.PI / 360) * near);
    //底部半径
    // var bigR = getR(far, fov);
    var bigR = parseInt(Math.tan(fov * Math.PI / 360) * far);
    //高
    var height = far - near;

    var cylinder = new mono.Cylinder(smallR, bigR, height, 4, 1, false, true);
    cylinder.s({
        'm.side':'both',
        'm.color': '#00ffff',
        'top.m.color':'#00ffff',
        'bottom.m.color':'#E1FFFF',
        'm.transparent': true,
        'm.opacity': 0.6,
        'side.m.gradientType': TGL.Gradient_Linear_V,
        'side.m.gradient': {1: '#00ffff', 0: '#E1FFFF'},
        
    });

    cylinder.setY(-height/2);
    cylinder = mono.Utils.transformElement(cylinder);

    cylinder.setParent(camera);
    cylinder.setRotationX(-Math.PI/2 + 0.2);
    cylinder.setRotationY(Math.PI/4);
    cylinder.setZ(camera.getBoundingBox().size().z/2 - 5);
    cylinder.setY(cylinder.getY() + 5);
    
    return cylinder;
};

/**
 * 任意情况下，计算面板的高度
 * @param {obj} panelClass - 面板最外层的className
 */
it.util.calculateHeight = function(panelClass){
    var h = $(window).height();

    //breadcrumb的高度
    var BreadcrumbMgr = $('.BreadcrumbMgr');
    var BreadcrumbMgrH = 0;
    if(BreadcrumbMgr.css('display') == 'block') {
        BreadcrumbMgrH = BreadcrumbMgr.height();
    }
  
    //地图的高度 
    var OverviewMgr = $('.OverviewMgr');
    var OverviewMgrH = 0;
    if(OverviewMgr.css('display') == 'block') {
        OverviewMgrH =  OverviewMgr.height();
    }   

    //搜索面板的高度
    var panelH = h - BreadcrumbMgrH - OverviewMgrH;
    var height = 0;//返回的高度
    var searchTreeH = 0;
    //如果是new-itv-search-panel it-search 直接改变整个面板高度就可以了
    if(panelClass == 'new-itv-search-panel'){
        height = panelH;
    }
    //如果是new-apps-box，改变搜索树的高度
    else if(panelClass == 'new-apps-box'){
        var appPanelH = 0, resultTitleH = 0,TreeH = 0;
        if($('.new-apps-box .new-app-panel .big-app-panel').css('display') == 'block') {
            appPanelH = $('.new-apps-box .new-app-panel .big-app-panel').height();
        }
        if($('.new-apps-box .new-app-panel .app-result-title').css('display') =='block'){
            resultTitleH = $('.new-apps-box .new-app-panel .app-result-title').height();
        }
        TreeH = panelH - appPanelH - resultTitleH;
        height = TreeH;
    }
  
    return height;
}

/**
 * 清除引擎中对billboard的缓存
 * @param {object} billboard - 需要清除缓存的billboard
 */
it.util.clearBillboardCache = function (billboard) {
    var billboardMaterial = billboard.material;
    var texture = billboardMaterial&&billboardMaterial.map;
    if(billboardMaterial){
        mono.MaterialPool.unUseMaterial(billboardMaterial);
    }
    if(texture){
        mono.TexturePool.unUseTexture(texture);
    }
};
