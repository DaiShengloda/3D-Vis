var ImportModels = main.ImportModels = function (data, parent) {
    this._data = data;
    this._parent = parent;
    this._name = this._data.text;
};

mono.extend(ImportModels, Object, {

    init: function () {
        var self = this;
        var panel = this.panel = $('<div class="tab_contentPanel"></div>').appendTo(this._parent);
        var toolbar = this.toolbar = $('<div class="toolbar"></div>').appendTo(panel);
        var fileInput = this.fileInput = $('<label for="import-models-input">' + it.util.i18n("Admin_ImportModels_Select_file") + '</label><input id="import-models-input" type="file" class="file"/>').appendTo(toolbar);
        fileInput.css('display', 'inline');
        var submitBtn = this.submitBtn = $('<button class="submit btn btn-default">' + it.util.i18n("Admin_ImportModels_Save") + '</button>').appendTo(toolbar);
        submitBtn.on('click', function () {
            self.submit();
        })
    },

    validate: function (sheet, rowIndex, item) {

    },

    handleFiles: function (result) {

    },

    submit: function () {
        var self = this;
        var formData = new FormData();
        var fileobj = $('#import-models-input')[0].files[0];
        formData.append('upload', fileobj);
        formData.append('name', '');
        formData.append('id', 'models' + new Date().getTime());
        $.ajax({
            url: pageConfig.url('/importModels'),
            type: 'POST',
            contentType: 'multipart/form-data; charset=UTF-8',
            data: formData,
            contentType: false,
            processData: false,
            success: function (data) {
                if (data.error) {
                    it.util.showMessage(data.error);
                } else {
                    it.util.showMessage(it.util.i18n("Admin_ImportPortPage_Save_success"));
                }
            },
            error: function (err) {
                it.util.showMessage(err);
            }
        });

    },
});
