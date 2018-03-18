(function () {
    it.util.setLanguage('zh');
    make.Default.path = '../modellib/';

    //缓存category Id
    it.util.adminApi('category','find','',function(data){
        if (!data || data.error)return;
        var categorys = [];
        $.each(data, function (index, val) {
            categorys.push({value: val.id, label: val.id});
        });
        it.util.categorys = categorys;
    });



    refreshDataType();

    //取得显示编辑器的容器jquery对象
    var parentView = $('.main');
    //实例化doodle.ModelEditor对象
    //doodle.ModelEditor.PropertySheetClass = mono.edit.ui.PropertySheetPane;
    var modelEditor = window.modelEditor = new doodle.ModelEditor(parentView);
    $('#update').hide();

    var _dataType;

    modelEditor.onDropHandler = function () {
        _dataType = null;
        $('#update').hide();
        //$('#save').show();
    }

    var f = function (e, method, data) {
        e.preventDefault();
        var dataType = modelEditor.getData();
        if (!dataType) {
            it.util.showMessage('no data');
            return;
        }
        var id = dataType.id;
        var params = dataType;//make.Default.getModelDefaultParameters(dataType.id);
        //delete params.id;
        data = data || {};
        data.id = data.id || params.id;
        data.model = id;
        data.modelParameters = params || {};

        var category = make.Default.getOtherParameter(id, 'category');
        if (category == it.util.i18n("Admin_modelEditor_Rack_model")) {
            var ps = make.Default.getParameters(data.model);
            var yf = make.Default.RACK_OFFSET_Y;
            var xf = make.Default.RACK_OFFSET_X;
            data.childrenSize = {
                "y": ps.childrenSize,
                "yPadding": [yf, yf],
                "zPadding": [-0.5, -0.5],
                "xPadding": [xf, xf]
            }
            data.categoryId = make.Default.getOtherParameter(id, 'sdkCategory') || 'rack';
        } else if (category == it.util.i18n("Admin_modelEditor_Device_model")) {
            var size = make.Default.getOtherParameter(id, 'size');
            data.size = {"y": size}
            data.categoryId = make.Default.getOtherParameter(id, 'sdkCategory') || 'equipment';
        }
        delete data.modelParameters['id'];
        delete data.modelParameters['objectId'];
        var form = it.view.dataType.getAddForm(data, method);
        var modal = util.modal(method + 'DataType', form, true, true, function () {
            var bv = $(form).data('bootstrapValidator');
            bv.validate();
            if (!bv.isValid())return true;
            // var params = form.serialize();
            var params = util.getFormData(form);

            console.log(params);
            if ('update' == method) {
                params = {value: params, options: {id: params.id}}
            }
            it.util.adminApi('datatype',method,JSON.stringify(params),
               function(data){
                   it.util.showError(data);
                    if (data && !data.error) {
                        it.util.showMessage('success');
                    }
                    refreshDataType();
                  },function(error){
                      console.log(arguments);
                      it.util.showMessage(error.responseText);
                  },'application/json; charset=UTF-8'

            );
        });
    }
    $('#save').click(function (e) {
        f(e, 'add');
    });

    $('#update').click(function (e) {
        f(e, 'update', _dataType);
    });

    $('#import').click(function (e) {
        e.preventDefault();
        var form = it.view.dataType.getLoadForm();
        var modal = util.modal('loadDataType', form, true, true, function () {
            var bv = $(form).data('bootstrapValidator');
            bv.validate();
            if (!bv.isValid())return;
            // var params = form.serialize();
            var params = util.getFormData(form);
            it.util.adminApi('datatype','get',params,function(data){
                if (it.util.showError(data)) {
                    console.log(data);
                    _dataType = data;
                    var params = _dataType.modelParameters;
                    params.id = _dataType.model;
                    modelEditor.setData(params);
                    $('#update').show();
                    //$('#save').hide();
                }
                refreshDataType()
            });
        });
    });

})();

function refreshDataType() {

    //缓存dataType Id
    it.util.adminApi('datatype', 'find', {}, function (data) {
        it.util.dataTypes = data.map(function (item) {
            return {value: item.id, label: item.id + (item.description ? (' - ' + item.description) : ''), data: item}
        });
    });
}