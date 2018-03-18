
if (!it.HTMLUtil) {
    it.HTMLUtil = {};
}

var HTMLUtil = it.HTMLUtil;

HTMLUtil.createCheckBox = function(id,name,checked,changeFun){
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
            // if(checkbox.is(':checked')){
            if (iconSpan.attr('class') == 'check') {
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
	};

