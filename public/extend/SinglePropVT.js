if(!it.viewTemplate){
	it.viewTemplate = {};
}
var SinglePropVT = function(sceneManager, id){
	this.sceneManager = sceneManager;
	this.setId(id);
	this._color = '#FE642E';
	this._canvasSize = {width: 256, height: 256};
}

mono.extend(SinglePropVT,Object,{
	setId: function(id){
		if(!id) return;
        var node = this.sceneManager.dataNodeMap[id];
        if(!node) return;
        var box = this.sceneManager.network3d.getDataBox();
        if(!box.getDataById(node.getId()))return;
        this._node = node;
	},
	init: function(label,val,unit,opt){
		if(!this._node)return;
		var node = this._node;
        // var billboard = this.createTextBillboardForNode(this._node, text, this._color);
        var billboard =  new mono.Billboard();
        billboard.setPosition(0, node.getBoundingBox().max.y, 0);
        billboard.setStyle('m.alignment', mono.BillboardAlignment.bottomCenter);
        billboard.setStyle('m.transparent', true);
        // billboard.setStyle('m.texture.image', util.images.assetImage);
        billboard.setStyle('m.alignment', mono.BillboardAlignment.bottomCenter);
        // billboard.setScale(40, 50, 1);
        billboard.setParent(node);
        var box = this.sceneManager.network3d.getDataBox();
        box.add(billboard);

        billboard.s({
	        'm.texture.image': this.getTextCanvas(label,val,unit,opt),
	        // 'm.transparent': true,
	        'm.vertical': true,
	    });
	    billboard.setScale(120,60,1);
	    billboard.contentWidth = this._canvasSize.width;
	    billboard.contentHeight = this._canvasSize.height;

        this._billboard = billboard;
	},
	// 此模板只展示简单的kev-value数据，如果有嵌套对象，忽略
	update: function(data, id){
		var self = this;
		var p = Object.keys(data)[0], valStr = data[p], 
			val = parseFloat(valStr), unit = valStr.replace(val,'');
		if(isNaN(val)){
			val = unit;
			unit = '';
		}
		var opt = {};
		if(val==='运行中'){
			opt.bgColor = '#00336';
		} else {
			opt.bgColor = '#FE642E';
		}
		if(!this._billboard){
			this.init(p,val,unit,opt);
		}else {
			this._billboard.s({
		        'm.texture.image': self.getTextCanvas(p,val,unit,opt)
		    });
		}
	},

	destory: function(){
		if(!this._billboard)return;
		var box = this.sceneManager.network3d.getDataBox();
		this._billboard.setParent(null);
		box.remove(this._billboard);
		
	},
	getTextCanvas: function(label, value, unit,opt){
		var width=512, height=256;
		var text=label;
		var canvas = document.createElement('canvas');
		canvas['width']=width;
		canvas['height']=height;
		var context = canvas.getContext('2d');
		context.fillStyle = opt.bgColor || '#FE642E';
		context.fillRect(0, 0, width, height-height/6);

		context.beginPath();
		context.moveTo(width*0.2, 0);
		context.lineTo(width/2, height);
		context.lineTo(width*0.8, 0);
		context.fill();
		
		var color='white';
		context.font = 40+'px "Microsoft Yahei" ';
		context.fillStyle = color;
		context.textAlign = 'left';
		context.textBaseline = 'middle';		
		context.fillText(text, height/10, height/5);

		var color='white';
		text=value;
		context.font = 100+'px "Microsoft Yahei" ';
		context.fillStyle = color;
		context.textAlign = 'left';
		context.textBaseline = 'middle';		
		context.fillText(text, height/10, height/2);
		context.strokeStyle=color;
		context.lineWidth=4;			
		context.strokeText(text, height/10, height/2);

		text=unit;
		context.font = 50+'px "Microsoft Yahei" ';
		context.fillStyle = color;
		context.textAlign = 'right';
		context.textBaseline = 'middle';		
		context.fillText(text, width-height/10, height/2+20);

		return canvas;
	},
});
it.viewTemplate.SinglePropVT = SinglePropVT;