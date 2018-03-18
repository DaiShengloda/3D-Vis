// 全景图上传图片页面
function PanoramicDataPanel(table, role) {
    this.tableList = table;
    this._role = role;
    this._isUpdated = !!role;
	this.callback = null;
};

mono.extend(PanoramicDataPanel, Object, {
	createPage: function(){
		var $panel = $('<div></div>');
		var $btnUpload = $('<div calss="up-load" style="display:inline-block"></div>').appendTo($panel);
		//var $picBox = $('<div id="box" style="width:100px;height:100px;background:gray;"></div>').appendTo($btnUpload);
    	//var $btnPic = this.btnPic = $('<button id="btn">图片</button>').appendTo($btnUpload);
    	var $input = this.input = $('<input multiple="multiple" style="display:;" type="file" accept="image/jpeg,image/png,image/gif"/>').appendTo($btnUpload);
		var $btnSave = this.btnSave = $('<button type="submit" class="col-sm-offset-1 btn btn-default" style="margin-left:0px">'+
        	it.util.i18n('Save')+
        	'</button>').appendTo($panel);
		this.handleBtn();
		return $panel;
	},
	handleBtn: function() {
		var self = this;
		this.btnSave.click(function() {
			self.upload();
		});
	},
	upload: function() {
		var files = this.input[0].files;
		var len = files.length;
		if (!len) {
			layer.open({
				content: it.util.i18n('Select_image')
			});
			return;
		};
		this.uploadRouter(len, files);
	},
	createFormData: function(tem, files) {
		var id = this._role.id;
		var size = 1048576;
		var formData = new FormData();
		var fileobj = files[tem];
		if ((fileobj.type).indexOf("image/") == -1) {
			alert("请上传图片");
			return;
		} else if (fileobj.size > size) {
			alert("上传图片过大");
			return;
		};
		formData.append('upload',fileobj);
		formData.append('id', id);
		formData.append('name', 'img' + new Date().getTime());
		return formData;
	},
	uploadRouter: function(len, files) {
		var self = this;
		var ajax = $.ajax;
		if (len<=0)return;
		(function($){
			var tem = len-1;
			var formData = self.createFormData(tem, files);

			ajax({
				url: '/uploadPanoImage',
				type: 'POST',
				data: formData,
				contentType: false,
				processData: false,
				async:false,
				cache: false,
				success: function (res) {
					if (res.err) {
						console.error(res.err);
					} else if (tem == '0') {
						layer.open({
							content: it.util.i18n('Admin_deviceEditor_Upload_success')
						});
						return;
					}
					len--;
					self.uploadRouter(len, files);
				},
				error: function (err) {
					console.log(err);
				}
			});
		})(jQuery);
		
	},
});