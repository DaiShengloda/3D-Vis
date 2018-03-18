if (!window.it) {
    it = {};
}
if (!it.view) {
    it.view = {};
}
if (!it.view.dataType) {
    it.view.dataType = {};
}
var dataType = it.view.dataType;

dataType.getAddForm = function (data, method) {
    var props = [], util = it.util;
    props.push({label: 'ID', id: 'id', options: 'required:true', value: data.id, readonly: method=='update'});
    props.push({
        label: 'categoryId',
        id: 'categoryId',
        type: 'select',
        value: data.categoryId,
        items: it.util.categorys
    });
    props.push({label: 'description', id: 'description', type: 'textarea', value: data.description});
    props.push({label: 'size', id: 'size', value: JSON.stringify(data.size)});
    props.push({label: 'childrenSize', id: 'childrenSize', value: JSON.stringify(data.childrenSize)});
    props.push({label: 'model', id: 'model', value: data.model, readonly: true});
    props.push({
        label: 'modelParameters',
        id: 'modelParameters',
        type: 'textarea',
        readonly: true,
        value: JSON.stringify(data.modelParameters)
    });
    props.push({label: 'simpleModel', id: 'simpleModel', value: data.simpleModel});
    props.push({
        label: 'simpleModelParameters',
        id: 'simpleModelParameters',
        type: 'textarea',
        value: data.simpleModelParameters
    });
    // props.push({label:'Batchable:', id:'batchable',type:'checkbox', value: data.batchable});
    props.push({label: 'lazyable', id: 'lazyable', type: 'checkbox', value: data.lazyable});
    props.push({
        label: 'stopAlarmPropagationable',
        id: 'stopAlarmPropagationable',
        type: 'checkbox',
        value: data.stopAlarmPropagationable
    });
    props.push({label: 'rotationExpression', id: 'rotation_exp', value: data.rotation_exp});
    var form = util.createForm(props);
    form.bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        submitHandler: null,
        fields: {
            id: {
                validators: {
                    notEmpty: {
                        message: 'The ID is required'
                    }
                }
            },
            categoryId: {
                validators: {
                    notEmpty: {
                        message: 'The category # is required'
                    }
                }
            },
        }
    });
    form.on('success.form.bv', function (e) {
        // 阻止默认事件提交
        e.preventDefault();
    });
    return form;
};

dataType.getLoadForm = function (data) {
    data = data || {};
    var props = [];
    //props.push({label:'categoryId', id:'categoryId',type:'select', value: data.categoryId, items:it.util.categorys});
    props.push({
        label: 'id',
        id: 'id',
        options: 'required:true',
        type: 'select',
        value: data.dataTypeId,
        items: it.util.dataTypes
    });
    var form = util.createForm(props);
    form.bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            id: {
                validators: {
                    notEmpty: {
                        message: 'The ID is required'
                    }
                }
            }
        }
    });
    form.on('success.form.bv', function (e) {
        // 阻止默认事件提交
        e.preventDefault();
    });
    return form;
};

