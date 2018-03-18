// fa = {};
var $LoadConfig = function (configDialog) {
    $ConfigApp.call(this, configDialog);
    this.defaultValue = {
        'id': 'system',
        'power_load_config': { min: 20, max: 80 },
        'weight_load_config': { min: 20, max: 80 }
    };
};

mono.extend($LoadConfig, Object, {
    initConfigPanel: function () {
        this.config = null;
        this.fieldMap = {
            'power': it.util.i18n("LoadConfig_Electric_load"),
            'weight': it.util.i18n("LoadConfig_weight")
        };
        this.values = [20, 80];
        this.limit = [0, 100];
        this.powerColors = ['#80ff79', '#ffff62', '#ff5452'];
        this.weightColors = ['#70cdff', '#ffff62', '#ff5452'];
        this.setData();
        this.initView();
    },


    initView: function () {
        var self = this;
        var $box = this.$box = $('<div></div>').appendTo(this.configDialog);

        $box.warningRuleConfig({
            limit: self.limit,
            values: self.values,
            fieldMap: self.fieldMap,
            powerColors: self.powerColors,
            weightColors: self.weightColors
        });

        $box.on('click', function (e) {
            if (e.target.className == 'warningRuleConfig_body_btns_cancel') {
                self.cancel();
            } else if (e.target.className == 'warningRuleConfig_body_btns_default') {
                self.default();
            } else if (e.target.className == 'warningRuleConfig_body_btns_confirm') {
                self.confirm();
            }
        });
    },
    hideConfig: function () {
        //
    },
    setData: function () {
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
        });
    },
    reload: function (callback) {
        var self = this;
        it.util.adminApi('config', 'get', { id: 'system' },
            function (r) {
                if (r) {
                    self.config = r;
                    callback && callback();
                } else {
                    callback && callback(it.util.i18n("LoadConfig_setting_not_exist"));
                }
            },
            function () {
                layer.alert(it.util.i18n("utils_Deleted") + ':' + id);
            }
        );

    },
    updateData: function (data) {
        it.util.adminApi('config', 'addOrUpdate', data, function () {});
    },
    clickForConfirm: function () {
        var self = this;
        var model = { id: self.config.id };
        for (name in self.fieldMap) {
            var fieldName = name + '_load_config'
            var values = self.$box.warningRuleConfig('getSliderValue', name);
            model[fieldName] = { min: values[0], max: values[1] }
        }
        var data = model;
        this.updateData(data);
    },
    clickForCancel: function () {
        var self = this;
        if (self.$box.warningRuleConfig('alarmConfigDirty')) {

            var maxZ = 0;
            $('*').each(function () {

                var ele = $(this);
                if (ele.hasClass('datetimepicker')) {
                    return;
                }
                if (ele.hasClass('spinner') ||
                    ele.parent().hasClass('spinner') ||
                    ele.parent().parent().hasClass('spinner')) {
                    return;
                }
                var thisZ = ele.css('zIndex');
                thisZ = (thisZ === 'auto' ? (Number(maxZ) + 1) : thisZ);
                if (thisZ > maxZ) maxZ = thisZ;
            });

            layer.confirm(it.util.i18n("LoadConfig_Cancel_update"), { zIndex: maxZ, skin: 'cancelConfigDialog' }, function (i) {
                layer.close(i);
                self.hideConfig();
            });
            $('.cancelConfigDialog a.layui-layer-close1').addClass('icon iconfont icon-close nav-icon');
        } else {
            self.hideConfig();
        }

    },
    clickForSetDefaultValue: function () {
        this.$box.warningRuleConfig('option', 'config', {
            'power': [20, 80],
            'weight': [20, 80]
        });
        var data = this.defaultValue;;
        this.updateData(data);
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

    getId: function () {
        return 'loadRule';
    },

    isConfirm: function () {
        return true;
    }

});

it.LoadConfig = $LoadConfig;