var UploadPDFPage = function (data, parent) {
    this._data = data;
    this._parent = parent;
    this._name = this._data.text;
    this.fields = [{
        name: 'id',
        text: it.util.i18n("Admin_UploadPDFPage_ID"),
    }, {
        //     name: 'name',
        //     text: '名称'
        // },{
        name: 'path',
        text: it.util.i18n("Admin_UploadPDFPage_File_name")
        // },{
        //     name: 'description',
        //     text: '描述',
    }];
};

mono.extend(UploadPDFPage, Object, {

    init: function () {
        var self = this;
        var panel = this.panel = $('<div class="tab_contentPanel"></div>').appendTo(this._parent);
        var toolbar = this.toolbar = $('<div class="toolbar"></div>').appendTo(panel);

        var fileInput = this.fileInput = $('<label for="import-pdf-input">' + it.util.i18n("Admin_UploadPDFPage_Select_file") + '</label><input id="import-pdf-input" type="file" class="file"/>').appendTo(toolbar);
        fileInput.css('display', 'inline');

        var submitBtn = this.submitBtn = $('<button class="submit btn btn-default">' + it.util.i18n("Admin_UploadPDFPage_Upload") + '</button>').appendTo(toolbar);
        submitBtn.on('click', function () {
            self.submit();
            fileInput.val('');
        });

        var content = this.content = $('<div class="content"></div>').appendTo(panel);
        var addTable = this.table = $('<table class="table table-striped table-bordered"></table>').appendTo(content);
        // var updateTable = this.table = $('<table class="table table-striped table-bordered"></table>').appendTo(content);
        var columns = this.fields.map(function (item) {
            return { title: item.text, name: item.name, data: item.name, type: item.type, defaultContent: '' };
        });
        columns.push({ title: it.util.i18n("Admin_UploadPDFPage_Delete"), name: '', data: 'id', type: 'string' });
        var dataTable = this.dataTable = this.table.DataTable({
            columns: columns,
            select: 'single',
            buttons: [],
            paging: false,
            searching: false,
            columnDefs: [{
                render: function (data, type, row) {
                    return '<div style="color:#656565"><a class="deletePdfInfo" pdfInfoId=' + row.id + ' path="' + row.path + '">' + it.util.i18n("Admin_UploadPDFPage_Delete") + '</a></div>';
                },
                targets: 2
            },
            { "visible": false, "targets": [0] }
            ]
        });
        this.loadData();
    },

    loadData: function (scope) {
        var self = scope || this;
        var callback = function () {
            $('.deletePdfInfo').click(function (e) {
                var infoId = e.target.getAttribute('pdfInfoId');
                var path = e.target.getAttribute('path');
                self.removePDFInfo(infoId, path, self.loadData, self);
            });
        };
        this.dataTable.clear();
        util.adminApi('pdf_info', 'search', {}, function (result) {
            result = result || {};
            self.dataTable.rows.add(result).draw();
            callback && callback();
        });
    },

    submit: function (callback) {
        var size = pageConfig.pdfSizeLimit || 1048576 * 5;
        var fileObj = $('#import-pdf-input')[0].files[0];
        if (!fileObj) {
            // console.log('请选择演示文档！');
            util.showMessage(it.util.i18n("Admin_UploadPDFPage_Select_ppt"));
            return;
        } else if ((fileObj.type).indexOf("pdf") == -1) {
            util.showMessage(it.util.i18n("Admin_UploadPDFPage_Select_pdfType"));
            return;
        } else if (fileObj.size > size) {
            util.showMessage(it.util.i18n("Admin_UploadPDFPage_Select_tooLarge"));
            return;
        } else {
            var form = new FormData();
            form.append('upload', fileObj);
            form.append('name', '');
            form.append('id', 'pdf' + new Date().getTime());
            this.upload(form, this.loadData, this);
        }
    },

    upload: function (formData, callback, scope) {
        var self = this;
        $.ajax({
            url: "/uploadpdf",
            type: "post",
            contentType: 'multipart/form-data; charset=UTF-8', //当上传文档时则要这个type，否则服务器不知道怎样读取
            data: formData,
            processData: false, // 告诉jQuery不要去处理发送的数据
            contentType: false, // 告诉jQuery不要去设置Content-Type请求头，此时header的contentType就会有个：boundary=...
            beforeSend: function () {
                console.log(it.util.i18n("Admin_UploadPDFPage_In_progress"));
            },
            success: function (data) {
                console.log(data);
                if (data.error) {
                    console.log(it.util.i18n("Admin_UploadPDFPage_Upload_fail"));
                } else {
                    console.log(it.util.i18n("Admin_UploadPDFPage_Upload_success"));
                }
                callback && callback.call(scope || self);
            },
            error: function (e) {
                alert(it.util.i18n("Admin_UploadPDFPage_Error"));
            }
        });
    },

    removePDFInfo: function (pdfInfoId, path, callback, scope) {
        var formData = new FormData();
        formData.append('id', pdfInfoId);
        formData.append('path', path);
        var self = this;
        $.ajax({
            url: "/removepdf",
            type: "post",
            contentType: 'multipart/form-data; charset=UTF-8', //当上传文档时则要这个type，否则服务器不知道怎样读取
            data: formData,
            processData: false, // 告诉jQuery不要去处理发送的数据
            contentType: false, // 告诉jQuery不要去设置Content-Type请求头，此时header的contentType就会有个：boundary=...
            beforeSend: function () {
                console.log(it.util.i18n("Admin_UploadPDFPage_In_progress"));
            },
            success: function (data) {
                console.log(data);
                console.log(it.util.i18n("Admin_UploadPDFPage_Upload_success"));
                callback && callback.call(scope || self);
            },
            error: function (e) {
                alert(it.util.i18n("Admin_UploadPDFPage_Error"));
            }
        });
    }
});