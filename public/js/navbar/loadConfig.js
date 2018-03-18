fa = {};
var $LoadConfig = function (sceneManager) {
    this.sceneManager = sceneManager;
};

mono.extend($LoadConfig, Object, {
    init: function () {
        this.config = null;
        this.fieldMap = {
            'power': it.util.i18n("LoadConfig_Electric_load"),
            'weight': it.util.i18n("LoadConfig_weight")
        };
        this.values = [20, 80];
        this.limit = [0, 100];
        this.powerColors = ['#80ff79', '#ffff62', '#ff5452'];
        this.weightColors = ['#70cdff', '#ffff62', '#ff5452'];
        this.reload(); // 可以考虑讲整个类删了 2018-02-24。 不能删，承重等app中用到了，2018-03-06
        this.initView();
    },

    initView: function () {
        var self = this;
        this._dialog = $('<div></div>').appendTo($(document.body));
        var $box = this.$box = $('<div></div>').appendTo(this._dialog);

        $box.warningRuleConfig({
            limit: self.limit,
            values: self.values,
            fieldMap: self.fieldMap,
            powerColors: self.powerColors,
            weightColors: self.weightColors
        });

        this._dialog.dialog({ //创建dialog弹窗
            blackStyle: true,
            width: '704px',
            height: 'auto',
            title: '告警规则设置',
            autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
            show: '', //显示弹窗出现的效果，slide为滑动效果
            hide: '', //显示窗口消失的效果，explode为爆炸效果
            resizable: false, //设置是否可拉动弹窗的大小，默认为true
            modal: true,
        });

        $box.on('click', function (e) {
            if (e.target.className == 'warningRuleConfig_body_btns_cancel') {
                self.cancel();
            } else if (e.target.className == 'warningRuleConfig_body_btns_default') {
                self.default();
            } else if (e.target.className == 'warningRuleConfig_body_btns_confirm') {
                self.confirm();
            }
        })
        // this._dialog.dialog({
        //     beforeClose: function (e, ui) {
        //         // self.cancel();
        //         console.log('别关')
        //         return false;
        //     }
        // });
    },
    hideConfig: function () {
        this._dialog.dialog('close');
    },
    showConfig: function () {
        var self = this;
        this.reload(function (error) {
            if (error) {
                layer.alert(error);
                return;
            }
            var obj = {};
            for (name in self.fieldMap) {
                var fieldName = name + '_load_config';
                var v = self.config[fieldName];
                if (v) {
                    v = [v.min, v.max]
                } else {
                    v = self.values
                }
                obj[name] = v;
            }
            self.$box.warningRuleConfig('option', 'config', obj);
            self.$box.warningRuleConfig('getFirstValues');
            self._dialog.dialog('open');
        });
    },
    reload: function (callback) {
        var self = this;
        it.util.getById('config', 'system', function (r) {
            if (r) {
                self.config = r;
                callback && callback();
            } else {
                callback && callback(it.util.i18n("LoadConfig_setting_not_exist"));
            }

        })
    },
    confirm: function () {
        var self = this;
        var model = { id: self.config.id };
        for (name in self.fieldMap) {
            var fieldName = name + '_load_config'
            var values = self.$box.warningRuleConfig('getSliderValue', name);
            model[fieldName] = { min: values[0], max: values[1] }
        }
        // console.log(model);
        it.util.api('config', 'addOrUpdate', model, function () {
            self.reload(function (err) {
                if (err) {
                    layer.alert(err);
                    return;
                } else {
                    layer.msg(it.util.i18n("LoadConfig_Save_success"))
                    self.hideConfig();
                    if (main.weightManager && main.weightManager.isShow()) {
                        main.weightManager.resetDiagram();
                    }
                    if (main.powerManager && main.powerManager.isShow()) {
                        main.powerManager.resetDiagram();
                    }
                }

            });
        });
    },
    cancel: function () {
        var self = this;
        if (self.$box.warningRuleConfig('alarmConfigDirty')) {

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

            layer.confirm(it.util.i18n("LoadConfig_Cancel_update"), { zIndex: maxZ, skin: 'layer-itv-dialog' }, function (i) {
                layer.close(i);
                self.hideConfig();
            });
        } else {
            self.hideConfig();
        }

    },
    default: function () {
        this.$box.warningRuleConfig('option', 'config', {
            'power': [20, 80],
            'weight': [20, 80]
        });
    },
    getValue: function (name) {
        if (!this.config) {
            console.error(it.util.i18n("LoadConfig_error_and_use_default_setting"), value);
            return { min: 20, max: 80 };
        }
        var fieldName = name + '_load_config';
        var value = this.config[fieldName];
        if (!value) {
            value = { min: 20, max: 80 };
            console.error(it.util.i18n("LoadConfig_Unknown_error") + fieldName + it.util.i18n("LoadConfig_use_default_setting"), value);
        }
        return value;
    },
    getColor: function (name, percent) {
        var loadConfig = this.getValue(name);
        percent *= 100;
        if (name == 'power') {
            if (percent < loadConfig.min) {
                color = this.powerColors[0];
            } else if (percent >= loadConfig.min && percent < loadConfig.max) {
                color = this.powerColors[1];
            } else {
                color = this.powerColors[2];
            }
        } else {
            if (percent < loadConfig.min) {
                color = this.weightColors[0];
            } else if (percent >= loadConfig.min && percent < loadConfig.max) {
                color = this.weightColors[1];
            } else {
                color = this.weightColors[2];
            }
        }
        return color;
    },
});

it.LoadConfig = $LoadConfig;



