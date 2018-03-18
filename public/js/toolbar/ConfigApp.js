
var $ConfigApp = function(configDialog){
    this.configDialog = configDialog;
};

mono.extend($ConfigApp,Object,{
	
	createCheckBox : function(id,name,checked,changeFun){
        name = name || id;
        var item = $('<label id="lb_' + id + '" class="checkbox-class itv-checkbox-line">' +
            '<div class="itv-checker"><span class="'+(checked==true?'checked':'check')+'" ></span>' +
            '</div>'+ name +'</label>');
        var input = $('<input id="' + id + '" type="checkbox" ' + checked + ' >');
        // item.append(input);
        item.children().children().append(input);
        input.change(function(eve){
            var checkbox = $(eve.currentTarget);
            var iconSpan = checkbox.parent();//$('.checker>span');
            if(checkbox.is(':checked')){
                iconSpan.attr('class','checked');
                if (changeFun) {
                   changeFun(true);
                }
            }else{
                iconSpan.attr('class','check');
                if (changeFun) {
                   changeFun(false);
                }
            }
        });
        return item;
	},

	 addItemWithNothing : function(id,name,onClick){
        var item = $('<label id="lb_' + id + '" class="col-btn" style = "margin-top: 5px;">'+ name +'</label>');
        if (onClick) {
            item.click(onClick);
        }
        // var groupPane = this._getItemGroup();// group 用于自动分组，如果item超多时，会往下累加的老长老长的
        // if (!groupPane) {
        //     return;
        // }
        // groupPane.append(item);
        return item;
    },

    isConfirm : function(){
        return true;
    },

    isConfigChanged: function(){
        return false;
    },

    changeCheckbox : function(checkboxSelector,checked){
        if(!checkboxSelector){
            return;
        }
        if(checkboxSelector.length > 0){
            checkboxSelector[0].checked = checked;
        }
        var iconSpan = checkboxSelector.parent();//$('.checker>span');
        if(!iconSpan){
            return;
        }
        if(checkboxSelector.is(':checked')){
            iconSpan.attr('class','checked');
        }else{
            iconSpan.attr('class','check');
        }
    },

	getId : function(){
		return 'ConfigApp';
	},

	/**
	 * 初始化其自身的Panel
	 */
	initConfigPanel : function(){

	},
    
    setData : function(){

    },

	clickForSetDefaultValue : function(){

	},

	clickForConfirm : function(){

	},

	clickForCancel : function(){

    },

    checkOrder: function(configKind,errorMsg){
        var values = this.map;
        var result = [];
        for(var id in values){
            if(id.indexOf(configKind) != -1 && $.trim(values[id].val()) != ''){
                if(id.indexOf("max") != -1){
                    result.push(parseFloat(values[id].val()));
                } 
            }
        }
        if(result.length>0){
            for(var i=1; i<result.length; i++){
                if(result[i] < result[i-1]){
                    this.errorMessage = it.util.i18n(errorMsg);
                    return false;
                }
            }
        }
        return true;
    },

});