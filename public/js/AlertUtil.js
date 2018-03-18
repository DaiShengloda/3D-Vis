if (!window.main) {
    window.main = {};   
}
Date.prototype.format = function (formatStr) {
    var str = formatStr;
    var Week = [it.util.i18n("AlertUtil_Sun"), it.util.i18n("AlertUtil_Mon"), it.util.i18n("AlertUtil_Tue"), it.util.i18n("AlertUtil_Wed"), it.util.i18n("AlertUtil_Thu"), it.util.i18n("AlertUtil_Fri"), it.util.i18n("AlertUtil_Sat")];

    str = str.replace(/yyyy|YYYY/, this.getFullYear());
    str = str.replace(/yy|YY/, (this.getYear() % 100) > 9 ? (this.getYear() % 100).toString() : '0' + (this.getYear() % 100));

    str = str.replace(/MM/, getMonth(this) > 9 ? getMonth(this).toString() : '0' + getMonth(this));
    str = str.replace(/M/g, getMonth(this));

    str = str.replace(/w|W/g, Week[this.getDay()]);

    str = str.replace(/dd|DD/, this.getDate() > 9 ? this.getDate().toString() : '0' + this.getDate());
    str = str.replace(/d|D/g, this.getDate());

    str = str.replace(/hh|HH/, this.getHours() > 9 ? this.getHours().toString() : '0' + this.getHours());
    str = str.replace(/h|H/g, this.getHours());
    str = str.replace(/mm/, this.getMinutes() > 9 ? this.getMinutes().toString() : '0' + this.getMinutes());
    str = str.replace(/m/g, this.getMinutes());

    str = str.replace(/ss|SS/, this.getSeconds() > 9 ? this.getSeconds().toString() : '0' + this.getSeconds());
    str = str.replace(/s|S/g, this.getSeconds());

    function getMonth(d) {
        return d.getMonth() + 1;
    }

    return str;
};
main.alertUtil = {
    _init: function (options, defualt, callback) {
        if (typeof(options ) == 'string') {
            options = {message: options}
        }
        if (callback && typeof(callback ) == 'function') {
            options.callback = callback;
        }
        var oridate = new Date();
        var fordate = oridate.format('yyyy_MM_dd_HH_mm_ss_SSS');
        defualt = $.extend({
            title: it.util.i18n("AlertUtil_Tip"),
            message: '',
            image: pageConfig.url('/css/images/info-orange.png'),
            id: new Date().format('yyyy_MM_dd_HH_mm_ss_SSS') + '_' + Math.round(Math.random() * 999999)
        }, defualt)
        options = $.extend(defualt, options)
        options.messageTitle = options.message;
        //options.message = options.message.substr(0, 20);
        //if (options.messageTitle.length > 20) {
        //    options.message += "..."
        //}
        var content = '' +
            '<div style="display:none;" id="' + options.id + '">' +
            '   <span class="fl">' +
            '       <img src="' + options.image + '" style="width:40px;height:40px">' +
            '   </span>' +
            '   <span class="fr" style="margin-left: 15px;width:350px;max-height:300px" title="' + options.messageTitle + '">' +
            '       ' + options.message + '' +
            '   </span>' +
            '</div>'
        var dialogId = "#" + options.id;
        $(dialogId).remove();
        $(document.body).append(content);
        var dialog = $(dialogId);
        options.dialog = dialog;
        return options;
    },
    _show: function (options, buttons) {
        console.error('alertUtil 已经废弃，改为 layer 相关的方法');
        options.dialog.dialog({   //创建dialog弹窗
            blackStyle:true,
            title: options.title,
            width: 'auto',
            height: 'auto',
            closeOnEscape: false,
            resizable: false,    //设置是否可拉动弹窗的大小，默认为true
            modal: true,         //是否有遮罩模型
            draggable: false,   //是否可以拖拽
            open: function (event) {
                var dialogUI = options.dialog.closest('.ui-dialog')
                dialogUI.find('.ui-dialog-titlebar-close').hide();
                dialogUI.find('.ui-button').css('margin', '3px 3px 3px 5px');
                dialogUI.find('.ui-dialog-buttonpane').css('padding', '3px 10px 3px 3px');
            },
            buttons: buttons,
            close: function () {
                if (options.callback) {
                    options.callback.call(this, false);
                }
                options.dialog.dialog('destroy');
                options.dialog.remove();
            }
        });
    },
    info: function (options) {
        
        options = this._init(arguments[0], {
            title: it.util.i18n("AlertUtil_Tip"),
            image: pageConfig.url('/css/images/info-orange.png')
        }, arguments[1]);
        this._show(options, [           //定义两个button按钮
            {
                text: it.util.i18n("AlertUtil_Sure"),
                click: function () {
                    if (options.callback) {
                        options.callback.call(this, true);
                    }
                    options.dialog.dialog('destroy');
                    options.dialog.remove();
                }
            }
        ]);
    },
    error: function (options) {
        options = this._init(arguments[0], {
            title: it.util.i18n("AlertUtil_Error"),
            image: pageConfig.url('/css/images/error-red.png')
        }, arguments[1]);
        this._show(options, [           //定义两个button按钮
            {
                text: it.util.i18n("AlertUtil_Sure"),
                click: function () {
                    if (options.callback) {
                        options.callback.call(this, true);
                    }
                    options.dialog.dialog('destroy');
                    options.dialog.remove();
                }
            }
        ]);
    },
    confirm: function (options) {
        options = this._init(arguments[0], {
            title: it.util.i18n("AlertUtil_Confirm"),
            image: pageConfig.url('/css/images/question-blue.png')
        }, arguments[1]);
        this._show(options, [           //定义两个button按钮
            {
                text: it.util.i18n("AlertUtil_Confirm"),
                click: function () {
                    if (options.callback) {
                        options.callback.call(this, true);
                    }
                    options.dialog.dialog('destroy');
                    options.dialog.remove();
                }
            }, {
                text: it.util.i18n("AlertUtil_Cancel"),
                click: function () {
                    if (options.callback) {
                        options.callback.call(this, false);
                    }
                    options.dialog.dialog('destroy');
                    options.dialog.remove();
                }
            }
        ]);
    }
}
var alertUtil = main.alertUtil;
