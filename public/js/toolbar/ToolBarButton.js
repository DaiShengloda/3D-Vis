

var $ToolBarButton = function(){
	this.button = null;
	this.initButton();
};

mono.extend($ToolBarButton,Object,{
	
	initButton : function(){
		this.button = $('<div id="' + this.getToolButtonId() + '" class="itv-toolbar-item ' + this.getClass() + '"></div>');
		if (this.isShowTooltip() && this.getTooltip()){
			this.initTooltip();
		}
	},

	isShowTooltip : function(){
		return true;
	},

	getToolButtonId : function(){
		return this.getClass() + '_button_01';
    },

    getTooltip : function(){

    },

    getDescription : function(){

    },

    getClass : function(){

    },

	initTooltip: function() {
		var offsetY = 0, offsetX = 0;
		var self = this;
		var tooltipDiv = $("<div id='itv-menu-tooltip' class='itv-breadcrumb-tooltip-content it-shadow'>" + this.getTooltip() + "</div>");
		this.button.mouseover(function(e) {
			// var myTitle = e.target.rel;
			var parent = self.button.parent();
			tooltipDiv.text(self.getTooltip());//getTooltip有可能动态改变
			parent.append(tooltipDiv);
			var height = parseInt(tooltipDiv.css('height'));
			var width = parseInt(tooltipDiv.css('width'));
			var clientWidth = document.body.clientWidth;
			// if (height > 30) {
			// 	offsetX = (-1) * parseInt(tooltipDiv.css('width')||0) - e.target.offsetWidth;
			// }
			var aPos = self.getAbsolutePosition(e.target);
			if (aPos.y <= 24) {
				offsetY = 48;
			}
			var parentWidth = parseInt($(parent).css('width'));
			if ((parentWidth - e.target.offsetLeft) < (width+e.target.offsetWidth)) {
				offsetX = (-1) * width - e.target.offsetWidth;
			}
			var offsetTop = e.target.offsetTop - e.target.offsetHeight + offsetY;
			var offsetLeft = e.target.offsetLeft + e.target.offsetWidth + offsetX;
			tooltipDiv.css('top', offsetTop);
			tooltipDiv.css('left', offsetLeft);
		});
		this.button.mouseout(function(e) {
			tooltipDiv.remove();
		});
	},

	getAbsolutePosition : function(target){
		var pos = {x:0,y:0};
         while (target)
         {
            pos.x += target.offsetLeft;
            pos.y += target.offsetTop;
            target = target.offsetParent
         }
         return pos;
	},

    setVisible : function(visible){
    	var display = 'block';
    	if (visible === false) {
    		display = 'none';
		}
    	this.button.css('display',display);
    },

    getButton : function(){
    	return this.button;
    }

});

it.ToolBarButton = $ToolBarButton;
