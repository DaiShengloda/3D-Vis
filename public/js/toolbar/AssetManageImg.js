var $AssetManageImg = function (configDialog) {
    $ConfigApp.call(this, configDialog);
    this.defaultsrc = pageConfig.url("/images/assetDefaultImage.png");
};

mono.extend($AssetManageImg, $ConfigApp, {
    getId: function () {
        return 'AssetManageImg';
    },

    hide: function () {
        $('#assetManageImg').hide();
    },

    show: function () {
        $('#assetManageImg').show();
    },

    setData: function () {
        this.src = main.systemConfig.asset_manage_image;
        $('#assetImage').attr('src', this.src);

        this.prevSrc = this.src;
    },

    initConfigPanel: function () {
        this.src = main.systemConfig.asset_manage_image;
        var box = $('<div id="assetManageImg"></div>');
        var tit = $('<div><h5 style="font-weight: bold">' + it.util.i18n("AssetManageImg_Config") + ':</h5></div>');
        var input = $('<img id="assetImage" src=' + this.src + ' width=100 height=100/>');
        var choose = $('<button>' + it.util.i18n("AssetManageImg_Picture_Choose") + '</button>');
        var up = $('<input id="upAssetImage" name="upAssetImage" style="display:none;" type="file" accept="image/jpeg,image/png,image/gif"/>');
        box.append(tit);
        box.append(input);
        box.append(choose);
        box.append(up);
        this.configDialog.append(box);

        var self = this;
        choose.click(function () {
            up.click();
        });
        up.change(function (event) {
            self.imgChange();
        });

    },

    imgChange: function () {
        this.upload();
    },

    getFileUrl: function (sourceId) {
        var url;
        if (navigator.userAgent.indexOf("MSIE") >= 1) { // IE
            url = document.getElementById(sourceId).files[0].value;
        } else if (navigator.userAgent.indexOf("Firefox") > 0) { // Firefox
            url = window.URL.createObjectURL(document.getElementById(sourceId).files[0]);
        } else if (navigator.userAgent.indexOf("Chrome") > 0) { // Chrome
            url = window.URL.createObjectURL(document.getElementById(sourceId).files[0]);
        } else {
            url = document.getElementById(sourceId).value;
        }

        return url;
    },

    clickForSetDefaultValue: function () {
        this.src = this.defaultsrc;
        $('#assetImage').attr('src', this.src);
    },

    clickForConfirm: function () {
        var self = this;
        var objData = {
            value: {
                asset_manage_image: self.src
            },
            options: {
                id: 'system'
            }
        };
        ServerUtil.api('config', 'update', objData, function (data) {
            if (data.error) {
                alterUtil.error(data.error);
            } else {
                main.systemConfig.asset_manage_image = self.src;
            }
            main.navBarManager.appManager.defaultApp.app._assetImage = main.systemConfig.asset_manage_image;
        });

    },

    clickForCancel: function () {
        this.src = this.prevSrc;
        $('#assetImage').attr('src', this.src);
    },

    isConfigChanged: function () {
        return this.prevSrc == this.src ? false : true;
    },

    upload: function () {
        var size = pageConfig.imageSizeLimit || 1048576;
        var self = this;
        var formData = new FormData();
        var fileobj = $('#upAssetImage')[0].files[0];
        if ((fileobj.type).indexOf("image/") == -1) {
            alert("请上传图片");
        } else if (fileobj.size > size) {
            alert("上传图片过大");
        } else {
            formData.append('upload', fileobj);
            formData.append('name', '');
            formData.append('id', 'assetImage' + new Date().getTime());
            $.ajax({
                url: pageConfig.url('/uploadAssetImage'),
                type: 'POST',
                contentType: 'multipart/form-data; charset=UTF-8',
                data: formData,
                contentType: false,
                processData: false,
                success: function (data) {
                    if (data.error) {
                        alert(data.error);
                    } else {
                        var path = data.value;
                        self.src = pageConfig.url('/' + path);
                        $('#assetImage').attr('src', self.src);
                    }
                },
                error: function (err) {
                    console.log(err);
                }
            });
        }
    }
});
it.AssetManageImg = $AssetManageImg;

