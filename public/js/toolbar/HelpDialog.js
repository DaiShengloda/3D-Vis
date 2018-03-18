var $HelpDialog = function(sceneManager,mainPanel){
	it.ToolBarButton.call(this);
	this.sceneManager = sceneManager;
	// this.mainPanel = mainPanel||$('#itv-main');
	this.init();
};


mono.extend($HelpDialog,it.ToolBarButton,{

	init:function(){
		// var btn = $('<div class="help-menu-image"></div>');
		// this.mainPanel.append(btn);
		var self = this;
		// btn.click(function(){
		this.button.click(function(){
			self.showDialog();
		});
	},

	getClass : function(){
		return "help-menu-image";
    },

    getTooltip : function(){
        return it.util.i18n("HelpDialog_help");
    },
    
    showDialog : function(){
    	if(!this.dialog){
    		this.dialog = this.createDialog();
    	}
    	this.dialog.show();
    },

    createDialog : function(){
    	var mainDiv = $('<div id="help-dialog-info" class="help-dialog"> </div>');
    	$('body').append(mainDiv);
        var header = $('<div class="help-title-panel"><p>'+it.util.i18n("HelpDialog_operation_tip")+'</p></div>');
        var btnClose = $('<div class="close"></div>');
    	header.append(btnClose);
    	mainDiv.append(header);
    	btnClose.click(function(){
    		mainDiv.hide();
    	});
    	var content = $('<div class="help-content-panel"></div>');
    	var row = this.createRow(2,'./css/images/help/rotate.png',it.util.i18n("HelpDialog_rotate"),null,it.util.i18n("HelpDialog_rotate_description"));
    	content.append(row);
    	row = this.createRow(2,'./css/images/help/translate.png',it.util.i18n("HelpDialog_translate"),null,it.util.i18n("HelpDialog_translate_description"));
    	content.append(row);
    	row = this.createRow(2,'./css/images/help/scale.png',it.util.i18n("HelpDialog_scale"),null,it.util.i18n("HelpDialog_scale_description"));
    	content.append(row);
    	row = this.createRow(2,'./css/images/help/lookat.png',it.util.i18n("HelpDialog_double_click"),null,it.util.i18n("HelpDialog_double_click_description"));
    	content.append(row);
    	mainDiv.append(content);
    	return mainDiv;
    },

    createRow : function(size,imageName1,label1,imageName2,label2){
    	if (!imageName1 && !label1 && !imageName2 && !label2) {
    		return null;
    	}
    	var row = $('<div class="form-group-no-margin"></div>');
    	var classImage = 'col-sm-7',classLabel = 'col-sm-5';
    	if (size == 2) {
    		classImage = 'col-sm-4';
    		classLabel = 'col-sm-2';
        }
    	if (imageName1){
    		var image = $('<div class="' + classImage + '"><img src="'+imageName1+'"></img></div>');//style="width:36px;height:42px;"
    	    row.append(image);
    	    var label = $('<div class="' + classLabel +' help-label-value " style="transform: translate(0, 50%);">'+(label1||'')+'</div>');
    	    row.append(label);
    	}
    	if (imageName2) {
            var image = $('<div class="' + classImage + '"><img src="'+imageName2+'"></img></div>'); //style="width:36px;height:42px;"
    	    row.append(image);
    	    var label = $('<div class="' + classLabel +' help-label-value " style="transform: translate(0, 50%);">'+(label2||'')+'</div>');
    	    row.append(label);
    	}
    	if (!imageName2 && label2) {
    	    var label = $('<div class="col-sm-6 help-label-value "  style="transform: translate(0, 50%);color:rgba(101,101,101,0.5);">'+label2+'</div>');
    	    row.append(label);
    	}
    	return row;
    },

});

it.HelpDialog = $HelpDialog;