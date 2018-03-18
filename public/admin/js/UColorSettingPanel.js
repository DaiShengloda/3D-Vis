//控制config中U颜色的类
var $UColorSettingPanel = function(configDialog) {
    $ConfigApp.call(this, configDialog);
    this.defaultValue = [
       {fromU:1,toU:2,color:'#8A0808'},
       {fromU:2,toU:3,color:'#088A08'},
       {fromU:3,toU:4,color:'#B18904'},
       {fromU:4,toU:5,color:'#6A0888'},
       {fromU:5,toU:50,color:'#088A85'}
    ];
    this.errorMessage = '';
    this.map = [];
};

mono.extend($UColorSettingPanel, $ConfigApp, {

    createRow: function(id, prex) {
        var self = $(this);
        var area = $('<div id = "' + id + '" style="margin-bottom:2px"></div>');
        var fromToHtml = '<span>' + it.util.i18n("UColorSettingPanel_from") + '</span>';
        var inputMin = $(' <input id = "' + id + '_min" placeholder="'+it.util.i18n('setting_fill_int')+'" class="lowValue input-min"style="width: 100px;height: 22px;color: #ffab00;border-width: 1px;background: #fff;border: 1px solid #DCDCDC;" value="">');
        inputMin.on("blur", function() {
            self.map[id + "_min"] = $(this);
        });
        fromToHtml += ' <span>U' + it.util.i18n("UColorSettingPanel_to") + ' </span>'
        fromToHtml += ' <span></span>'
        var inputMax = $(' <input id = "' + id + '_max" class="highValue input-min" placeholder="'+it.util.i18n('setting_fill_int')+'" style="width: 100px;height: 22px;color: #ffab00;border-width: 1px;background: #fff;border: 1px solid #DCDCDC;" value="">');
        inputMax.on("blur", function() {
            self.map[id + "_max"] = $(this);
        });
        fromToHtml += ' <span>U：</span>';
        var from_to = $(fromToHtml);
        from_to.eq(0).append(inputMin);
        from_to.eq(2).append(inputMax);
        area.append(from_to);
        // var select = this.createOption(id + '_option',null,prex);
        // var selectSpan = $('<span></span>');
        // selectSpan.append(select);
        var valInput = $('<span><input id = "' + id + '_value"  class="lowValue input-min"style="width: 100px;height: 22px;color: #ffab00;border-width: 1px;background: #fff;border: 1px solid #DCDCDC;" value=""></span>');
        area.append(valInput);
        this.map[id + "_min"] = inputMin;
        this.map[id + "_max"] = inputMax;
        return area;
    },

    initConfigPanel: function() {
        var box = $('<div class="temperatureBox" id="uColorSettingPanel" style="margin-bottom:35px;"><div>');
        var header = $('<div><h5 style="font-weight: bold">U' + it.util.i18n("UColorSettingPanel_Homologous_color") + ':(' + it.util.i18n("UColorSettingPanel_Such_as") + ':' + it.util.i18n("UColorSettingPanel_from") + '1U ' + it.util.i18n("UColorSettingPanel_to") + ' 1U #8A0808)</h5></div>');
        box.append(header);
        var area = this.createRow('uSize-Color-diglog-01', '_uSizeColor1');
        box.append(area);
        area = this.createRow('uSize-Color-diglog-02', '_uSizeColor2');
        box.append(area);
        area = this.createRow('uSize-Color-diglog-03', '_uSizeColor3');
        box.append(area);
        area = this.createRow('uSize-Color-diglog-04', '_uSizeColor4');
        box.append(area);
        area = this.createRow('uSize-Color-diglog-05', '_uSizeColor5');
        box.append(area);
        this.configDialog.append(box);

        var UColor = $("input[id^='uSize-Color-diglog']");
        UColor.change(function(){
            if(this.id.slice(-3)=='max'){
                $('#uSize-Color-diglog-0'+(parseInt(this.id.slice(-5,-4))+1)+'_min').val($(this).val());
            }else{
                $('#uSize-Color-diglog-0'+(parseInt(this.id.slice(-5,-4))-1)+'_max').val($(this).val());
            }       
        });
        this.setData();
    },

    isSame: function(a, b) {
        if (a === b) {
            return true;
        }
        if (a == null && b != null) {
            return false;
        } else if (a != null && b == null) {
            return false;
        }
        if ((typeof a) !== (typeof b)) {
            return false;
        }
        var t = typeof a;
        if (t == 'string' || t == 'number') {
            return a == b;
        }
        for (var p in a) {
            if (!this.isSame(a[p], b[p])) {
                return false;
            }
        }
        for (var p in b) {
            if (!this.isSame(a[p], b[p])) {
                return false;
            }
        }
        return true;
    },

    isConfirm: function() {
        var forData = this.getFormData();
        for( var k in forData){
            var patt1 = new RegExp("^[1-9]*[1-9][0-9]*$");
            if (!(patt1.test(forData[k].fromU)&&patt1.test(forData[k].toU))) {
                this.errorMessage = 'U位请输入整数';
                return false;
            }
            var patt2 = new RegExp("^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$");
            if (!patt2.test(forData[k].color)) {
                this.errorMessage = 'U位颜色值不合法';
                return false;
            }
        }

        if(!this.checkOrder("uSize-Color-diglog",'TemperatureAndHumidityConfigPanel_UColor_has_overlapping')) return false;
        return true;
    },

    //u_color_config
    isConfigChanged: function() {
        var formData = this.getFormData();
        var orgValue = this.u_color_config;
        if (!this.isSame(formData, orgValue)) {
            return true;
        }
        if (formData.length != orgValue.length) {
            return true;
        }
        for (var i = 0; i < formData.length; i++) {
            if (!this.isSame(formData[i], orgValue[i])) {
                return true;
            }
        }
        return false;
        // if(this.isSame(formData,orgValue)){
        //     return false;
        // }
        // return true;
    },

    getFormData: function() {
        var tempColorMap = [];
        var colorRows = $("div[id^='uSize-Color-diglog']");
        if (colorRows && colorRows.length > 0) {
            for (var i = 0; i < colorRows.length; i++) {
                var rowValue = this.getRowValue(colorRows[i]);
                if (rowValue) {
                    tempColorMap.push(rowValue);
                }
            }
        }
        return tempColorMap;
    },

    getId: function() {
        return 'USizeColorConfigApp';
    },

    getRowValue: function(div) {
        if (!div) {
            return null;
        }
        var parentId = $(div).attr('id');
        var children = $(div).children();
        var minValue = children.find('#' + parentId + '_min').val();
        var maxValue = children.find('#' + parentId + '_max').val();
        var color = children.find('#' + parentId + '_value').val();
       
        // var minValue = $(children[0]).children('input').val();
        // var maxValue = $(children[2]).children('input').val();
        // var color = $(children[4]).children('input').val();
        if (!isNaN(minValue) || !isNaN(maxValue)) {
            var obj = { fromU: minValue, toU: maxValue, color: color };
            return obj;
        }
        return null;
    },

    setRowValue: function(div, minValue, maxValue, color) {
        if (!div) {
            return null;
        }
        // var children = $(div).children('span');
        // $(children[0]).children('input').val(minValue);
        // $(children[1]).children('input').val(maxValue);
        // $(children[4]).children('input').val(color);
        var parentId = $(div).attr('id');
        var children = $(div).children();
        children.find('#' + parentId + '_min').val(minValue);
        children.find('#' + parentId + '_max').val(maxValue);
        children.find('#' + parentId + '_value').val(color);
    },

    clearAllValue: function() {
        var colorRows = $("div[id^='uSize-Color-diglog']");
        for (var i = 0; i < colorRows.length; i++) {
            this.setRowValue(colorRows[i], this.defaultValue[i].fromU, this.defaultValue[i].toU, this.defaultValue[i].color);
        }
    },

    setData: function() {
        // this.clearAllValue();
        var i = 0;
        var colorRows = $("div[id^='uSize-Color-diglog']");
        var uColorMaps;
        if (main.systemConfig && main.systemConfig.u_color_config && main.systemConfig.u_color_config.length > 0) {
            this.u_color_config = main.systemConfig.u_color_config;
            uColorMaps = main.systemConfig.u_color_config;
            for (; i < uColorMaps.length; i++) {
                if (colorRows.length < i) {
                    break;
                }
                var rowDiv = colorRows[i];
                var rowValue = uColorMaps[i];
                this.setRowValue(rowDiv, rowValue.fromU, rowValue.toU, rowValue.color);
            }
        } else {
            uColorMaps = this.defaultValue;
            for (; i < uColorMaps.length; i++) {
                if (colorRows.length < i) {
                    break;
                }
                var rowDiv = colorRows[i];
                var rowValue = uColorMaps[i];
                this.setRowValue(rowDiv, rowValue.fromU, rowValue.toU, rowValue.color);
            }
        }
    },

    updateData: function(data)  {
        it.util.adminApi('config', 'update', data, function(result) {
            if (result.error) {
                console.error(result.error);
            }
        });
    },

    clickForSetDefaultValue: function() {
        this.clearAllValue();
        var data = {
            value: {
                u_color_config: jsonUtil.object2String(this.defaultValue),
            },
            options: {
                id: 'system',
            }
        };
        this.updateData(data);
    },

    clickForConfirm: function() {
        var self = this;
        var formData = this.getFormData();
        var objData = {
            value: {
                u_color_config: jsonUtil.object2String(formData),
            },
            options: {
                id: 'system',
            }
        };
        this.updateData(objData);
    },

    clickForCancel: function() {
        this.clearAllValue();
    },

    show:function(){
        $('#uColorSettingPanel').show();
    },

    hide:function(){
        $('#uColorSettingPanel').hide();
    }

});

