
var $BaseBar = function(){
	 this.parentPanel = $('#itv-main');
	 this.initBase();
};

mono.extend($BaseBar,Object,{

	initBase : function(){
		var btn = $('<div class="'+ this.getClass() +'"></div>');
		this.parentPanel.append(btn);
		var self = this;
        btn.click(function(){
        	self.clickFunction();
        	self.initClickFunction();
        });
	},

	clickFunction : function(){
		this.show();
	},

	getClass : function(){
		return 'help-menu-image';
	},

	initClickFunction:function(){
        // 将'.itv-checkbox-line'的click换成check的change更加的合理
        // $('.itv-checker>span>input[type="checkbox"]').change(function(eve){
        //     var checkbox = $(eve.currentTarget);
        //     var iconSpan = checkbox.parent();//$('.checker>span');
        //     if(checkbox.is(':checked')){
        //         iconSpan.attr('class','checked');
        //     }else{
        //         iconSpan.attr('class','check');
        //     }
        // });
    },

	createCheckBox : function(id,name,checked,changeFun){
        name = name || id;
        // var item = $('<label id="lb_' + id + '" class="checkbox-class itv-checkbox-line">' +
        //     '<div class="itv-checker"><span class="'+checked+'" >' +
        //     '<input id="' + id + '" type="checkbox" ' + checked + ' ></span>' +
        //     '</div>'+ name +'</label>');
        var item = $('<label id="lb_' + id + '" class="checkbox-class itv-checkbox-line">' +
            '<div class="itv-checker"><span class="'+checked+'" ></span>' +
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

	show : function(){

	},

	hide : function(){

	}

	
});

it.BaseBar = $BaseBar;