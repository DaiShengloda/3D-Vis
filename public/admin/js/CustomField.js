if (!window.it) {
    it = {};
}
if (!it.customField) {
    it.customField = {};
}

var customField = it.customField;
// 这里主要在生成表单字段，table查询字段时使用，常用的字段类型，有程序直接生成，但特殊的字段，需要定制
// 这里就根据模块名+字段名，定制字段的显示样式，赋值方式，取值方式
var propsSetting = {
        props: {
            getField: function(col, parent) {
                var data = [];
                $.each(col.attr.ref, function(index, val) {
                    var m = it.cache.moduleMap[val],
                        item = {};
                    item.id = val;
                    item.text = util.i18n(val);
                    item.children = [];
                    Object.keys(m.attributes).forEach(function(prop) {
                        item.children.push({ id: val + '@' + prop, text: util.i18n(prop) });
                    });
                    data.push(item);
                });
                var opt = { onlyLeafCheck: true, multiple: true, data: data };
                var field = createField('combotree', col.field, false, false, parent, opt);
                // var prop = [lable:]
                // var input = util.createComponent(prop);
                // field.combotree('loadData', data);
                return field;
            },
            setVal: function(field, data) {
                if (data === undefined) return;
                var vals = [];
                $.each(data, function(module, val) {
                    // vals = vals.concat(val); 
                    $.each(val, function(index, prop) {
                        vals.push(module + '@' + prop);
                    });
                });
                setTimeout(function() {
                    field.combotree('setValues', vals);
                }, 300);

            },
            getVal: function(field) {
                var t = field.combotree('tree');
                var result = {};
                var checked = t.tree('getChecked');
                $.each(checked, function(index, val) {
                    // val : module@prop
                    var temp = val.id.split('@');
                    if (temp.length != 2) return;
                    // var parent = t.tree('getParent', val.target)
                    var module = temp[0],
                        prop = temp[1];
                    var cat = result[module] || [];
                    cat.push(prop);
                    result[module] = cat;
                });
                
                return result;
            }
        }
    }
    // customField.tooltip = propsSetting;
    // customField.popup = propsSetting;

var xyzSetting = function() {

}
mono.extend(xyzSetting, Object, {
    getField: function(col, parent) {
        var $div = $('<div class="form-inline form-xyz"></div>').attr({
            'data-type': 'customField',
            'name': col.id,
            'data-module': col.module
        });
        var cig = function(label, parent) {
            var $ig = $('<div class="input-group"></div>').appendTo(parent);
            var $label = $('<span class="input-group-addon">' + label + '</span>').appendTo($ig);
            var $input = $('<input type="text" class="form-control ' + label + '"></div>').appendTo($ig);
            return $input;
        }
        this._$x = cig('x', $div);
        this._$y = cig('y', $div);
        this._$z = cig('z', $div);
        return $div;
    },
    setVal: function(field, data) {
        console.log(data);
        if (data) {
            this._$x.val(data.x);
            this._$y.val(data.y);
            this._$z.val(data.z);
        }
    },
    getVal: function(field) {
        var result = {};
        result.x = this._$x.val();
        result.y = this._$y.val();
        result.z = this._$z.val();
        return result;
    }
});

// customField.datatype = {size: new xyzSetting(), childrenSize:new xyzSetting()};
customField.data = { position: new xyzSetting(), rotation: new xyzSetting(), location: new xyzSetting(), position2d: new xyzSetting() };


if (!it.customPage) {
    it.customPage = {};
}
var customPage = it.customPage;
// 根据Tab ID定制tab页面内容，table相关的页面，有一定规律，由程序生成。其他页面需要特殊定制，这里设置
// customPage['addcustom_table'] = function(){
// 	var props = [];
// 	var params = {valueField: 'id',url: '/api/category/search'}
// 	props.push({label:'分类编号', id:'category',type:'select', params: params});
// 	props.push({label:'业务名称', id:'tableName'});
// 	props.push({label:'描述', id:'description', type: "textarea"});
// 	var self = this;
// 	var form = util.createForm(props, true, function(result){
// 	    $.post('/api/custom_table/add', result, function(data, textStatus, xhr) {
// 	        if (data.error) {
// 	            console.log(data.error);
// 	            util.msg(data.error);
// 	        } else {
// 	            tabPanel.$panel.bootstrapTab('remove', 'addcustom_table');
// 	            var page = new UpdateCutomTablePanel(data.value.tableName);
// 	            page.createPage();
// 	        }
// 	    });
// 	},{left:2,right:8});
// 	var v = it.validator;
// 	var opt = {
// 	    category:{validators: [v.notEmpty('category')]},
// 	    tableName:{validators: [v.notEmpty('tableName')]},
// 	    description:{validators: [v.notEmpty('description')]},
// 	};
// 	util.initValidator(form, opt);
// 	return form;
// }
customPage['updatecustom_table'] = function(row) {
    var page = new UpdateCutomTablePanel(row.tableName);
    return page.createPage();
}
customPage['addwater_leak_wire'] = createWaterLeakWirePage;
customPage['addtemperature_field'] = createHeatMapEditorPage;
customPage['addinspection_path'] = createInspectionPage;
customPage['addasset_doc'] = uploadAssetPDF;
customPage['updateconfig'] = function() {
    var page = new SytemSettingPage();
    return page.createPage();
};

var customPage = it.customPage;