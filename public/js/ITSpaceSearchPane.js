
it.ITSpaceSearchPane = function(sceneManager){
    // it.BasePanel.call(this);
    // this.sceneManager = sceneManager;
    // this.dataManager = this.sceneManager.dataManager;
    $ITVSearchBasePanel.call(this,sceneManager);
    this.className = 'ITSpaceSearchPane';
    this.init();
};

mono.extend(it.ITSpaceSearchPane,$ITVSearchBasePanel,{

    getItemFromJson : function(){
        return dataJson.spaceSearchItems;
    },

    initDefaultInputs : function(){
         //位置的计算，得找出所有的dc，building，floor的实例
        sdata = new it.SData('space_txt_location','select',it.util.i18n("ITSpaceSearchPane_Location"));
        sdata.setKey('ancestor');// 比parentId的范围还要大，应该是祖宗ID
        sdata.setIsClient(true);
        var options = this.createAreaOption();
        sdata.setClient('options',options);
        this.addRow(sdata);
    },



    init:function(){
        var sdata = new it.SData('U_ID','input',it.util.i18n("ITSpaceSearchPane_U_count"));
        sdata.setKey('dyna_user_data_maxSerSpace');
        sdata.setIsClient(true);
        sdata.setOperation('>=');
        sdata.setDataType('number');
        this.addRow(sdata);

        if(!this.initInputs()){
            this.initDefaultInputs();
        }

        // //位置的计算，得找出所有的dc，building，floor的实例
        // sdata = new it.SData('space_txt_location','select','位置');
        // sdata.setKey('ancestor');// 比parentId的范围还要大，应该是祖宗ID
        // sdata.setIsClient(true);
        // var options = this.createAreaOption();
        // sdata.setClient('options',options);
        // this.addRow(sdata);

        this.addButtonRow();
    },

    // /***
    //  * 创建特别的样式，类似select下拉框
    //  * @param data
    //  * @returns {*}
    //  */
    // createInput : function(data){
    //     if (data && data.inputType) {
    //         var inputType = data.inputType;
    //         var inputId = data.inputIndex;
    //         if (inputType.toLowerCase().indexOf('select') >= 0) {
    //             var select = $('<select id="' + inputId + '" class="input-min contral-width show-tick form-control"></select>');
    //             var options = data.getClient('options');
    //             if (options && options.length > 0) {
    //                 for (var i = 0; i < options.length; i++) {
    //                     var value = options[i];
    //                     var description = options[i];
    //                     var vd = value.split(':');
    //                     if(vd && vd.length === 2){
    //                         value = vd[0];
    //                         description = vd[1]||value;
    //                     }
    //                     var option = $('<option value="' + value + '" class="input-min">'+description+'</option>');
    //                     select.append(option);
    //                 }
    //             }
    //             this.selectMap[inputId] = select;
    //             return select;
    //         }
    //     }
    //     return this.constructor.superClass.createInput(data);
    // },

    // setSelectpick: function() {
    //     $('#'+ this.className +'_space_txt_location').selectpicker({
    //         liveSearch: true,
    //         maxOptions: 1
    //     });
    // },

    getUNumber : function(){
        return $('#' + this.className + '_U_ID').val();
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