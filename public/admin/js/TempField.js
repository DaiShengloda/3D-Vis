var $TempField = function (configDialog) {
    $ConfigApp.call(this, configDialog);
};

mono.extend($TempField, $ConfigApp, {
    initConfigPanel: function(){
        var self = this;
        //配置参数区间
        var minLayer = 1, maxLayer = 5, minSpacing = 30, maxSpacing = 100;
        this.layerRange = [];
        this.spacingRange = [];
        this.rangeArr = [];
        this.defaultConfig = [4,30];

        this.layerRange.push(minLayer,maxLayer);
        this.spacingRange.push(minSpacing,maxSpacing);
        this.rangeArr.push(this.layerRange,this.spacingRange);

        this.lastConfig = [];
        var lastConfigArr = main.systemConfig.temp_field_arr;
        if(lastConfigArr){
            this.lastConfig = lastConfigArr.map(function(config){
                return config.value;
            })
        }
        
        this.box = $('<div class="tempFieldBox" style="margin-top: 10px" id="TempField"></div>');
        //标题
        var p1 = $('<h5 style="font-weight: bold;">' + it.util.i18n('TempField_config') + ' : </h5>');
        this.configDialog.append(this.box);
        this.box.append(p1);
        //内容
        var layerContainer = $('<div><span>'+it.util.i18n('TempField_layerNum')+'：</span></div>').appendTo(this.box);
        var layerInput = $('<input type="number"  field-type="layerNum"/>').addClass('tempField_input').appendTo(layerContainer);
        var layerRangeTip = $('<span>(从 '+this.layerRange[0]+' 至 '+this.layerRange[1]+')</span>').addClass('tempField_tip').appendTo(layerContainer);

        var spacingContainer = $('<div style="margin-top: 5px"><span>'+it.util.i18n('TempField_spacing')+'：</span></div>').appendTo(this.box);
        var spacingInput = $('<input type="number"  step="5" field-type="spacing"/>').addClass('tempField_input').appendTo(spacingContainer);
        var spacingRangeTip = $('<span>(从 '+this.spacingRange[0]+' 至 '+this.spacingRange[1]+')</span>').addClass('tempField_tip').appendTo(spacingContainer);
        $('.tempField_input').css({
            'width': '100px',
            'height': '22px',
            'color': '#ffab00',
            'border-width': '1px',
            'background': '#fff',
            'border': '1px solid #DCDCDC'
        });
        $('.tempField_tip').css({
            'color': '#ffab00',
            'margin-left': '10px'
        })
        $('.tempField_input').each(function(ind,inp){
            if(self.lastConfig && self.lastConfig.length){
                $(inp).val(self.lastConfig[ind]);
            }else{
                $(inp).val(self.defaultConfig[ind]);
            }
        });
    },
    isConfirm: function(){
        //层数 1~5  间距 30~100
        var self = this;
        var inputArr = [].slice.call($('.tempField_input'),0);
        return inputArr.every(function(input,index){
            return self.isNumRight(input.value,self.rangeArr[index]);
        });
    },
    isNumRight: function(num,range){
        num = Number(num);
        if(num && range){
            if(typeof num === 'number' && num%1 === 0){
                if(num < range[0] || (num > range[1])){
                    return false;
                }else{
                    return true;
                }
            }else{
                return false;
            }
        }else{
            return false;
        }
    },
    clickForConfirm: function(){
        var self = this;
        var res = [];
        $('.tempField_input').each(function(ind,inp){
            res.push({
              name: $(inp).attr('field-type'),
              value: $(inp).val()  
            });
        })
        var objData = {
            value: {
                temp_field_arr: jsonUtil.object2String(res),
            },
            options: {
                id: 'system',
            }
        };
        this.updateData(objData);
    },
    clickForSetDefaultValue: function() {
        var self = this;
        var defaultValue = [];
        $('.tempField_input').each(function(ind,inp){
            $(inp).val(self.defaultConfig[ind]);
            defaultValue.push({
                name: $(inp).attr('field-type'),
                value: self.defaultConfig[ind]
            });
        });
        var data = {
            value: {
                temp_field_arr: jsonUtil.object2String(defaultValue),
            },
            options: {
                id: 'system',
            }
        };
        this.updateData(data);
    },
    updateData: function(data){
        it.util.adminApi('config', 'update', data, function(result) {
            if (result.error) {
                console.error(result.error);
            }
        });
    },
    getId: function() {
        return 'TempField';
    },
})
