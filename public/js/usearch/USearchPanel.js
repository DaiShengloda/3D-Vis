
var $USearchPanel = function(){
	it.BasePanel.call(this);
    this.init();
};

mono.extend($USearchPanel,it.BasePanel,{

	 init : function(){
        var sdata = new it.SData('link_key_text',null,null,it.util.i18n("USearchPanel_input_U_count")); //inputIndex,inputType,label,placeholder
        sdata.setKey('sizeU');
        sdata.setStyle('background: url("./css/images/insidesearch.svg") no-repeat scroll right center;background-position-x: 98%;');
        this.addQuick(sdata);
        this.addButtonRow();
    }

});

it.USearchPanel = $USearchPanel;