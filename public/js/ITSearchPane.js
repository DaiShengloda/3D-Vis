
it.ITSearchPane = function(sceneManager){
    $ITVSearchBasePanel.call(this,sceneManager);
    this.className = 'ITSearchPane';
    this.init();
};

mono.extend(it.ITSearchPane,$ITVSearchBasePanel,{

     getItemFromJson : function(){
        return dataJson.itSearchItems;
     },

    initDefaultInputs : function(){
        var sdata = new it.SData('it_key_text',null,null,it.util.i18n("ITSearchPane_Input_ID")); //inputIndex,inputType,label,placeholder
        sdata.setKey('id,description');
        sdata.setOperation('like');
        sdata.setStyle('background: url("./css/images/insidesearch.svg") no-repeat scroll right center;background-position-x: 98%;');
        this.addQuick(sdata);

        //位置的计算，得找出所有的dc，building，floor的实例
        sdata = new it.SData('txt_location','select',it.util.i18n("ITSearchPane_Position"));
        sdata.setKey('ancestor');// 比parentId的范围还要大，应该是祖宗ID
        sdata.setIsClient(true);
        var options = this.createAreaOption();
        sdata.setClient('options',options);
        this.addRow(sdata);

        sdata = new it.SData('txt_business_type','select',it.util.i18n("ITSearchPane_Business_type"));
        sdata.setKey('businessTypeId');
        sdata.setIsClient(false);
        var options = this.createBusinessTypeOption();
        sdata.setClient('options',options);
        this.addRow(sdata);

        sdata = new it.SData('txt_type','select',it.util.i18n("ITSearchPane_Asset_type"));
        sdata.setKey('dataTypeId');
        sdata.setIsClient(false);
        var options = this.createDataTypeOption();
        sdata.setClient('options',options);
        var that = this;
        sdata.setClient('refreshCallback',function(){
             that.refreshDataTypeOption();
        });
        this.addRow(sdata);
    },

    init:function(){
        if(!this.initInputs()){
            this.initDefaultInputs();
        }
        this.addButtonRow();
    },

    /**
     * 清除这个定制的select
     */
    clearInputByData : function(id,data){
        if (!id) {
            return ;
        }
        var button = $('#'+id).parent().children('button');//.children('span').val('')
        if (button && button.length > 0) {
            var span = button.children('span')[0];
            if (span) {
                var val = '';
                var option = $('#'+id).children('option');
                if (option && option.length > 0) {
                    val = option[0].innerText||'';
                }
                $('#'+id).val(val);
                span.innerText = val;
            }
        }
    }


});