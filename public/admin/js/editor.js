(function(){
	$(window).load(function(){

		it.util.setLanguage('zh');
		make.Default.path = '../modellib/';
		var categoryJson =  mono.edit.Utils.loadCategoryJson(function(category){
			if(category == it.util.i18n("Admin_editor_Rack_Model") || category == it.util.i18n("Admin_editor_Equipment_Model") || category == it.util.i18n("Admin_editor_Card_Model")){
				return true;
			}
			return false;
		});

		//缓存category Id
		$.post(pageConfig.urlPrex+'/api/category/find', function(data, textStatus, xhr) {
			if(!data || data.error)return;
			var categorys = [];
			$.each(data.value, function(index, val) {
				 categorys.push({value:val.id,label:val.id});
			});
			it.util.categorys = categorys;
		});
//        mono.edit.preview = false;
		var edit3d = window.edit3d = new mono.edit.Edit3D();
		$('.main').append($(edit3d.getView()));
		edit3d.accordionPane.initView(categoryJson.categories);
		edit3d.layoutGUI();
		var _dataType;
		var f = function(e, method, data){
			e.preventDefault();
			var text = edit3d.getJsonObject();
			if(!text){
				it.util.showMessage('no data');
				return;
			}
		    var dataType = JSON.parse(text);
		    var id = dataType.id;
		    var params = dataType;//make.Default.getModelDefaultParameters(dataType.id);
		    delete params.id;
		    data = data || {};
		    data.model = id;
		    data.modelParameters = params;

		    var form = it.view.dataType.getAddForm(data);
			var modal = util.modal('addDataType',form, true, true, function(){
				var bv = $(form).data('bootstrapValidator');
				bv.validate();
				if(!bv.isValid())return true;
				// var params = form.serialize();
				var params = util.getFormData(form);
				
				console.log(params);
				if('update' == method){
					params = {value:params, options:{id:params.id}}
				}
				$.ajax({
					url: '/api/datatype/'+method,
					type: "post",
					contentType: 'application/json; charset=UTF-8',
					data: JSON.stringify(params),
					success: function(data){
						it.util.showError(data);
						if(data && !data.error){
							it.util.showMessage('success');
						}
					},
					error: function(a) {
						console.log(arguments);
						it.util.showMessage(a.responseText);
					},
				});
			});
		}
		$('#save').click(function(e){
			f(e, 'add');
		});

		$('#update').click(function(e){
			f(e, 'update', _dataType);
		});

		$('#import').click(function(e){
			e.preventDefault();
			var form = it.view.dataType.getLoadForm();
			var modal = util.modal('loadDataType',form, true, true, function(){
				var bv = $(form).data('bootstrapValidator');
				bv.validate();
				if(!bv.isValid())return;
				var params = form.serialize();
				$.post(pageConfig.urlPrex+'/api/datatype/get', params, function(data, textStatus, xhr) {
					if(it.util.showError(data)){
						console.log(data);
						_dataType = data.value;
						edit3d.importJsonObject(JSON.stringify({id:_dataType.model}));
					}
				});
			});
		});

		
	});
})();