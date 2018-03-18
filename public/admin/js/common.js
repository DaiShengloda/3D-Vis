/**
 * common.js 只修改原生js功能， 不对外提供任何方法
 * 1. String.format 格式化字符串
 *      "a={a},b={b}".format({a:'aa',b:'bb'}) 输出: 'a=aa,b=bb'
 * 2. String.trim 去掉字符串首尾空格
 *      "  abc  ".trim()  输出: 'abc'
 * 3. Date.format 格式化日期
 *      new Date().format('yyyy-MM-dd HH:mm:ss')  输出:'2015-08-23 12:20:34'
 * 4. 扩展jquery-ui.dialog() 保证dialog始终处在最高层级，但是低于datetimepicker层级
 * 依赖jquery
 */
$(function () {

    String.prototype.format = function (values) {
        values = values || {};
        var patten = this;
        for (var name in values) {
            patten = patten.replace(new RegExp('\\{' + name + '\\}'), values[name]);
        }
        return patten;
    }


    String.prototype.trim = function () {
        return this.replace(/(^\s*)|(\s*$)/g, "");
    }


    Date.prototype.format = function (formatStr) {
        var str = formatStr;
        var Week = [it.util.i18n("Admin_common_Sun"), it.util.i18n("Admin_common_Mon"), it.util.i18n("Admin_common_Tue"), it.util.i18n("Admin_common_Wed"), it.util.i18n("Admin_common_Thu"), it.util.i18n("Admin_common_Fri"), it.util.i18n("Admin_common_Sat")];

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
    }

    /**
     * extend jquery.ui.dialog
     * set dialog property zIndex max in page;
     */
    $.widget("ui.dialog", $.ui.dialog, {
        _create: function () {
            if (this.options.blackStyle) {
                this.options.buttons.splice(0, 0, {}, {});
            }
            return this._super();
        },
        open: function () {
            var $dialog = $(this.element[0]);

            var maxZ = 0;
            $('*').each(function () {

                var ele = $(this);
                if (ele.hasClass('datetimepicker')) {
                    return;
                }
                if (ele.hasClass('spinner')
                    || ele.parent().hasClass('spinner')
                    || ele.parent().parent().hasClass('spinner')) {
                    return;
                }
                var thisZ = ele.css('zIndex');
                thisZ = (thisZ === 'auto' ? (Number(maxZ) + 1) : thisZ);
                if (thisZ > maxZ) maxZ = thisZ;
            });

            $(".ui-widget-overlay").css("zIndex", (maxZ + 1));
            $dialog.parent().css("zIndex", (maxZ + 2));
            if (this.options.blackStyle && !this._customStyleFlag) {
                this._customStyle($dialog.closest('.ui-dialog'));
                this._customStyleFlag = true;
            }
            return this._super();
        },
        close: function () {
            var $dialog = $(this.element[0]);
            var maxZ = 0;
            $('.ui-dialog').each(function () {
                var $dialogTemp = $(this);
                var $dialogTempContent = $dialogTemp.find('.ui-dialog-content')
                var isOpen = $dialogTempContent.dialog('isOpen');
                if (isOpen && $dialogTempContent[0] != $dialog[0]) {
                    var thisZ = $dialogTemp.css('zIndex');
                    thisZ = (thisZ === 'auto' ? (Number(maxZ) + 1) : thisZ);
                    if (thisZ > maxZ) maxZ = thisZ;
                }
            });
            $(".ui-widget-overlay").css("zIndex", (maxZ - 1));
            return this._super();
        },
        destroy: function () {
            var $dialog = $(this.element[0]);
            var maxZ = 0;
            $('.ui-dialog').each(function () {
                var $dialogTemp = $(this);
                var $dialogTempContent = $dialogTemp.find('.ui-dialog-content')
                var isOpen = $dialogTempContent.dialog('isOpen');
                if (isOpen && $dialogTempContent[0] != $dialog[0]) {
                    var thisZ = $dialogTemp.css('zIndex');
                    thisZ = (thisZ === 'auto' ? (Number(maxZ) + 1) : thisZ);
                    if (thisZ > maxZ) maxZ = thisZ;
                }
            });
            $(".ui-widget-overlay").css("zIndex", (maxZ - 1));
            return this._super();
        },
        _customStyle: function (dialog) {
            //var dialog = $(e.target).closest('.ui-dialog');
            dialog.css('color', '#d0d0d0');
            dialog.css('border', '1px solid black');
            dialog.css('border-radius', '3px');
            dialog.css('padding', '0px');
            dialog.css('background-image', '-webkit-linear-gradient(top, rgba(48, 54, 62, 0.8), rgba(12, 13, 15, 0.8))');
            var titleBar = dialog.find('.ui-dialog-titlebar');
            titleBar.css('border-color', 'rgba(48, 54, 62, 0.6)');
            titleBar.css('background', 'rgba(48, 54, 62, 0.6)');
            titleBar.css('border-bottom', '1px solid black;');
            titleBar.css('font-size', '14px');
            titleBar.css('font-weight', '700');
            titleBar.css('padding', '0px 0px 0px 10px');
            dialog.find('.ui-dialog-title').css('color', '#d0d0d0');
            dialog.find('.ui-icon-closethick').css('background', 'url(./css/images/close.png) no-repeat center');
            var buttonPane = dialog.find('.ui-dialog-buttonpane');
            buttonPane.css('background', 'rgba(48, 54, 62, 0.3)');
            buttonPane.css('padding', '0px 0px 0px 0px');
            buttonPane.css('border-width', '0px 0px 0px 0px');
            buttonPane.css('box-shadow', 'inset 0 0px 0 #ffffff');
            var content = dialog.find('.ui-dialog-content');
            content.css('color', '#d0d0d0');
            content.css('font-family', '"Microsoft Yahei", Verdana, Helvetica, Arial, "Open Sans", sans-serif');
            var buttons = dialog.find('.ui-dialog-buttonset button');
            buttons.css('color', '#30363e');
            buttons.css('font-size', '12px');
            buttons.css('text-shadow', '0 0px 0px');
            buttons.css('border-color', 'rgb(255, 171, 0)');
            buttons.css('background-color', 'rgb(255, 171, 0)');
            buttons.css('background-image', '-webkit-linear-gradient(top, #ffab00, #bc7f01)');
            buttons.css('background-position', '0px -32px');
            buttons.each(function () {
                var b = $(this);
                var span = b.find('span');
                var text = span.text();
                if (text == '') {
                    b.hide();
                } else {
                    b.hover(function (e) {
                        b.css('background-position', '0px 5px');
                    }, function (e) {
                        b.css('background-position', '0px -32px');
                    });
                }
            })
        }
    });
});

Function.prototype.scope = function (scope) {

    var fun = this;
    var newFun = function () {
        fun.apply(scope, arguments)
    }
    return newFun;
}