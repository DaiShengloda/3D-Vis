if(!it.viewTemplate){
	it.viewTemplate = {};
}
var KVTextBillboardViewTemplate = function(sceneManager, id){
	this.sceneManager = sceneManager;
	this.setId(id);
	this._color = 'rgba(255,255,255,0.8)';
	this._canvasSize = {width: 512, height: 256};
	this._image = new Image();
	var $root = this._$rootDiv = $('<div style="width:512px"></div>');
	this._$table = $('<table width="512" style="font-size:40px;color:#fff;border-radius: 15px;background-color: #EFF0DC;box-shadow: inset 0 1px 1px rgba(0,0,0,.05);"></table>').appendTo($root);
	$('<div style="width: 0px;border-width: 35px;border-color: #EFF0DC transparent transparent transparent;border-style: solid dashed dashed dashed;border-bottom: none;margin-left: 45%; "></div>').appendTo($root);
}

mono.extend(KVTextBillboardViewTemplate,Object,{
	setId: function(id){
		if(!id) return;
        var node = this.sceneManager.dataNodeMap[id];
        if(!node) return;
        var box = this.sceneManager.network3d.getDataBox();
        if(!box.getDataById(node.getId()))return;

        this._node = node;
	},
	init: function(text){
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

        var c = this.createCanvas();
        billboard.s({
	        'm.texture.image': c,
	        // 'm.transparent': true,
	        // 'm.vertical': false,
	    });
	    billboard.setScale(c.width/2, c.height/2, 1);
	    billboard.contentWidth = c.width;
	    billboard.contentHeight = c.height;
	    this._canvas = c;

        this._billboard = billboard;
	},
	// 此模板只展示简单的kev-value数据，如果有嵌套对象，忽略
	update: function(data){
		// if(!data)return;
		// delete data['_all'];
		// var text = '', i = 0;
		// for(var p in data){
		// 	if(i++>=4)break;
		// 	text += it.util.i18n(p) + ': '+data[p] +'\n';
		// }
		// if(!text)return;
		// if(this._billboard){
		// 	this.updateTextBillboardText(this._billboard, text, this._color);
		// } else {
		// 	this.init(text);
		// }
		this.updateTable(data);
	},
	destory: function(){
		if(!this._billboard)return;
		var box = this.sceneManager.network3d.getDataBox();
		this._billboard.setParent(null);
		box.remove(this._billboard);
		
	},
	updateTable: function(data){
		if(!data)return;
		delete data['_all'];
		var $table = this._$table;
		$table.empty();
		var i = 0;
		for(var p in data){
			if(i++>=4)break;
			$('<tr>'+
				'<td align="right" width="50%">'+it.util.i18n(p)+':</td>'+
				'<td width="50%">'+data[p]+'</td>'+
			'</tr>').appendTo($table);
		}
		// 更多箭头
		// $('<tr><td align="right" colspan="2"><div style="width: 0px;border-width: 25px;border-color: black transparent transparent transparent;border-style: solid dashed dashed dashed;border-bottom: none;margin-left: 45%; "></td></tr>').appendTo($table);
		if(!this._billboard){
			this.init();
		}
		// this.updateImage($table[0]);
		this.updateImage(this._$rootDiv[0]);
	},
	updateImage: function(table){
		var SVG_NS = 'http://www.w3.org/2000/svg';
		// create svg
		var svg = document.createElementNS(SVG_NS, 'svg');
		var canvasSize = this._canvasSize;
		svg.setAttribute('width', canvasSize.width);
		svg.setAttribute('height', canvasSize.height);
		// create foreign
		var foreign = document.createElementNS(SVG_NS, 'foreignObject');
		foreign.setAttribute('width', '100%');
		foreign.setAttribute('height', '100%');
		foreign.appendChild(table.cloneNode(true));
      	svg.appendChild(foreign);
      	var data = (new XMLSerializer()).serializeToString(svg);

      	var img = this._image, self = this;
      	img.onload = function () {
        	// var canvasSize = network.getCanvasSize();
        	var canvas = self._canvas;
        	canvas.height = img.height;
	        var g = canvas.getContext('2d');
	        g.clearRect(0,0, canvas.width, canvas.height);
	        // g.fillStyle = 'red';//self._color;
	        // g.fillRect(0,0, canvas.width, canvas.height);
	        // g.fillRect(x, y, width, height)
	        // self.drawBackground(g);
	        // draw dom
	        g.drawImage(img, 0, 10);
	        // trigger rerender event
	        self._billboard.invalidateTexture();
      	};
      	img.src = "data:image/svg+xml," + encodeURIComponent(data);
	},
	drawBackground: function (context, args) {
		args = args || {};
		var size = this._canvasSize;
	    var width = size.width;
	    var height = size.height + size.height/4;
	    var radius = 30;
	    var arrowWidth = size.width/4;
	    var arrowHeight = size.height/4;

        context.globalAlpha = args.globalAlpha || 0.8;
        context.fillStyle = args.bgColor || '#5B85B5';
        context.save();
        context.beginPath();
        context.moveTo(radius, 0);
	    context.lineTo(width - radius, 0);
        context.arcTo(width, 0, width, radius, radius);
        context.lineTo(width, height - arrowHeight - radius);
        context.arcTo(width, height - arrowHeight, width - radius, height - arrowHeight, radius);
        context.lineTo(width / 2 + arrowWidth / 2, height - arrowHeight);
        context.lineTo(width / 2, height);
        context.lineTo(width / 2 - arrowWidth / 2, height - arrowHeight);
        context.lineTo(radius, height - arrowHeight);
        context.arcTo(0, height - arrowHeight, 0, height - arrowHeight - radius, radius);
        context.lineTo(0, radius);
        context.arcTo(0, 0, radius, 0, radius);
        context.closePath();
        context.fill();
        context.restore();
	},
	createCanvas: function(){
		var c = document.createElement('canvas');
		var canvasSize = this._canvasSize;
		c.width = canvasSize.width;
	    c.height = canvasSize.height;// + canvasSize.height/4;//低端箭头
      	this.makeHighRes(c);
      	return c;
	},
	makeHighRes: function(c) {
		var ctx = c.getContext('2d');
		// finally query the various pixel ratios
		var devicePixelRatio = window.devicePixelRatio || 1;
		var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
			ctx.mozBackingStorePixelRatio ||
			ctx.msBackingStorePixelRatio ||
			ctx.oBackingStorePixelRatio ||
			ctx.backingStorePixelRatio || 1;
		var ratio = devicePixelRatio / backingStoreRatio;
		// upscale canvas if the two ratios don't match
		if (devicePixelRatio !== backingStoreRatio) {
			var oldWidth = c.width;
			var oldHeight = c.height;
			c.width = Math.round(oldWidth * ratio);
			c.height = Math.round(oldHeight * ratio);
			c.style.width = oldWidth + 'px';
			c.style.height = oldHeight + 'px';
			ctx.scale(ratio, ratio);
		}
    },
    updateTextBillboardText: function (billboard, text, bgColor) {
	    text = text || '';
	    var content = this.getTextBillboardContent(text, bgColor);
	    this.updateTextBillboardContent(billboard, content)
	},
	updateTextBillboardContent: function (billboard, content) {
	    billboard.s({
	        'm.texture.image': content
	    });
	    billboard.contentWidth = content.width;
	    billboard.contentHeight = content.height;
	    billboard.setScale(content.width / 2, content.height / 2, 1);
	},
	getTextBillboardContent: function (label, bgcolor, args) {

	    args = args || {};
	    var canvas = document.createElement('canvas');
	     var context = canvas.getContext('2d');
	     // context.font = "120px LEDFont,sans-serif";
	     // context.font = "60px sans-serif";
	     
	     var array = [];
	     if(label.indexOf("\n")){
	         array= label.split("\n");
	     }else{
	         array= [label]
	     }
	     array = array.filter(function(item){
	     	return item;
	     });
	     var length = 0;
	     for(var i = 0;i < array.length;i ++){
	        if(i == 0){
	           length = context.measureText(array[i]).width;
	        }else{
	           length = Math.max(context.measureText(array[i]).width,length);
	        }
	    }

	    var size = mono.Utils.getMaxTextSize(array, context.font);
	    var c_width = 512;//mono.Utils.nextPowerOfTwo(length);
	    var oHeight = size.height;
	    var height = 256;//mono.Utils.nextPowerOfTwo(oHeight);
	    var arrowHeight = height / 4;
	    var arrowWidth = c_width / 4;
	    canvas.height = height + arrowHeight;
	    canvas.width = c_width;
	    var lineHeight = 50;//height / array.length;
	    var oLineHeight = oHeight / array.length;

	    args = it.Util.ext({
	        labelColor: 'black',
	        width: c_width,
	        height: (height+arrowHeight),
	        radius: (c_width / 16),
	        arrowWidth: arrowWidth,
	        arrowHeight: arrowHeight,
	        bgColor: bgcolor,
	        canvas: canvas
	    }, args);
	    // args.height += args.arrowHeight;
	    this.getBillboardContent(args);

	    context.fillStyle = args.labelColor;
	    context.textBaseline = 'middle';
	    // context.font = "120px LEDFont,sans-serif";
	    context.font = "40px sans-serif";
	    var top = 10, lineGap = 15, lineHeight = 40;
	    for (var i = 0; i < array.length; i++) {
	        var text = array[i];
	        length = context.measureText(text).width;
	        // context.fillText(text, (c_width - length) / 2, lineHeight * (i + 1));
	        context.fillText(text, (c_width - length) / 2, top+lineHeight * i+(i + 1)*lineGap);
	    }
	    context.font = "30px sans-serif";
	    text = it.util.i18n("KVTextBillboardViewTemplate_Double_click");
	    length = context.measureText(text).width;
	    context.fillText(text, (c_width - length-40), top+lineHeight * i+(i + 1)*lineGap-10);
	    return canvas;
	},
	getBillboardContent: function (args) {

	    args = it.Util.ext({width: 256, height: 128, radius: 20, arrowWidth: 50, arrowHeight: 30}, args);
	    var width = args.width;
	    var height = args.height;
	    var radius = args.radius;
	    var arrowWidth = args.arrowWidth;
	    var arrowHeight = args.arrowHeight;

	    var canvas = args.canvas;
	    if (!canvas) {
	        canvas = document.createElement('canvas');
	        canvas.width = width;
	        canvas.height = height;
	    }
	    
	    if(!args.isHumOrTemp){
	        var context = canvas.getContext('2d');
	        context.globalAlpha = args.globalAlpha || 0.8;
	        context.fillStyle = args.bgColor || '#5B85B5';
	        context.save();
	        context.beginPath();
	        context.moveTo(radius, 0);
		    context.lineTo(width - radius, 0);
	        context.arcTo(width, 0, width, radius, radius);
	        context.lineTo(width, height - arrowHeight - radius);
	        context.arcTo(width, height - arrowHeight, width - radius, height - arrowHeight, radius);
	        context.lineTo(width / 2 + arrowWidth / 2, height - arrowHeight);
	        context.lineTo(width / 2, height);
	        context.lineTo(width / 2 - arrowWidth / 2, height - arrowHeight);
	        context.lineTo(radius, height - arrowHeight);
	        context.arcTo(0, height - arrowHeight, 0, height - arrowHeight - radius, radius);
	        context.lineTo(0, radius);
	        context.arcTo(0, 0, radius, 0, radius);
	        context.closePath();
	        context.fill();
	        context.restore();
	    }

	    return canvas;
	},
	createTextBillboard: function (text, gbColor) { // 考虑标题header，考虑Chart图表等
	    var c = this.getTextBillboardContent(text, gbColor);
	    var board = new mono.Billboard();
	    board.s({
	        'm.texture.image': c,
	        'm.transparent': true,
	        'm.alignment': mono.BillboardAlignment.bottomCenter,
	        'm.vertical': false,
	    });
	    board.setScale(c.width/2, c.height/2, 1);
	    board.setSelectable(false);
	    board.contentWidth = c.width;
	    board.contentHeight = c.height;
	    board.isTextBillboard = true;
	    return board;
	},
	createTextBillboardForNode: function (node, text, gbColor) {
	    text = text || '';
	    var board = this.createTextBillboard(text, gbColor);
	    var bb = node.getBoundingBox();
	    board.setParent(node);
	    board.p(0, bb.max.y, 0);
	    return board;
	}
});
it.viewTemplate.KVTextBillboardViewTemplate = KVTextBillboardViewTemplate;