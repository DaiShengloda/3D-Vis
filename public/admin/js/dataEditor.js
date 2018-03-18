(function(){
	$(window).load(function(){

		it.util.setLanguage('zh');
		make.Default.path = './js/modellib/';

		var $dataType = $('#dataTypeId');
		//datatype select
		var _dataType = {};
		it.util.adminApi('datatype','find',null,
		   function(data){
			   if(!data || data.error)return;
			   $.each(data, function(index, val) {
				 $dataType.append($('<option value="'+val.id+'">'+val.id+'</option>'))
				 _dataType[val.id] = val.model;
			});
		   });

		var edit3d = window.edit3d = new mono.edit.Edit3D();
		var $preview = $('#preview'), h = $('#formDiv').height()+'px';
		$preview.css('height', h);
		var $view = $(edit3d.getView());
		$view.css('height', h);
		$preview.append($view);
		
		edit3d.layoutGUI();


		$dataType.change(function(event) {
			var dataType = $dataType.val();
			edit3d.importJsonObject(JSON.stringify({id:_dataType[dataType]}));
		});
		var $dataForm = $('#dataForm');
		$dataForm.bootstrapValidator({
			feedbackIcons: {
		        valid: 'glyphicon glyphicon-ok',
		        invalid: 'glyphicon glyphicon-remove',
		        validating: 'glyphicon glyphicon-refresh'
		    },
		    submitHandler: null,
			fields: {
				id:{
					validators: {
	                    notEmpty: {
	                        message: 'The ID is required'
	                    }
	                }
				},
				dataTypeId: {
					validators: {
	                    notEmpty: {
	                        message: 'The category # is required'
	                    }
	                }
				},
			}
		});
		var updateCache;
		$('#submit').click(function(event) {
			event.preventDefault();
			var bv = $dataForm.data('bootstrapValidator');
			bv.validate();
			if(!bv.isValid())return;
			var params = $dataForm.serialize();
			var method = updateCache?'update':'add';
			var params = util.getFormData($dataForm);
			if('update' == method){
				params = {value:params, options:{id:params.id}}
			}
			it.util.adminApi('data',method,params,
			  function(data){
				  if(it.util.showError(data)){
					bv.resetForm();
					$(':input',$dataForm).not(':button, :submit, :reset, :hidden') 
						.val(null) 
						.removeAttr('checked') 
						.removeAttr('selected');
					edit3d.network3d.getDataBox().clear();
					edit3d.propertySheetPane.hide();
					$('#id').attr('readonly', false);
					updateCache = undefined;
					it.util.showMessage('success');
				}
			  });
		});

		$('#import').click(function(e){
			e.preventDefault();
			var form = it.view.dataType.getLoadForm();
			var modal = util.modal('loadData',form, true, true, function(){
				var bv = $(form).data('bootstrapValidator');
				bv.validate();
				if(!bv.isValid())return;
				var params = form.serialize();
				it.util.adminApi('data','get',params,
				    function(data){
						if(it.util.showError(data)){
						console.log(data);
						var vals = data.value;
						updateCache = vals;
						$('#id').val(vals.id).attr('readonly', 'readonly');
						$('#dataTypeId option[value="'+vals.dataTypeId+'"]').attr('selected', true);;
						$('#description').val(vals.description);
						$('#position').val(vals.position);
						$('#rotation').val(vals.rotation);
						$('#location').val(vals.location);
						$('#parentId').val(vals.parentId);
						edit3d.importJsonObject(JSON.stringify({id:_dataType[vals.dataTypeId]}));
					}
					});
			});
		});

	});
})();