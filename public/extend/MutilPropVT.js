if (!it.viewTemplate) {
	it.viewTemplate = {};
}
var MutilPropVT = function (sceneManager, id) {
	this.sceneManager = sceneManager;
	this.setId(id);
	this._color = '#FE642E';
	var width = dataJson.mutliPropBillboard.width || 512,
		height = dataJson.mutliPropBillboard.height || 512;
	this._canvasSize = { 'width': width, 'height': height };
	this._image = new Image();
	var $root = this._$rootDiv = $('<div></div>')
		.css('width', width + 'px');
	// this._$table = $('<table></table>')
	this._$table = $('<div></div>')
		.appendTo($root)
		.css({
			width: width + 'px',
			color: 'white',
			fontSize: '30px',
			backgroundColor: '#FE642E',
			paddingTop: dataJson.mutliPropBillboard.tableCss.paddingTop || '10px',
			paddingBottom: dataJson.mutliPropBillboard.tableCss.paddingBottom || '',
			borderRadius: dataJson.mutliPropBillboard.tableCss.borderRadius || '',
			display: 'block',
			// border: '1px white solid',
		});
	$('<div></div>')
		.appendTo($root)
		.css({
			width: '0px',
			borderWidth: '35px',
			borderColor: '#FE642E transparent transparent transparent',
			borderStyle: 'solid dashed dashed dashed',
			borderBottom: 'none',
			marginLeft: '45%'
		});
}

mono.extend(MutilPropVT, Object, {
	setId: function (id) {
		if (!id) return;
		var node = this.sceneManager.dataNodeMap[id];
		if (!node) return;
		var box = this.sceneManager.network3d.getDataBox();
		if (!box.getDataById(node.getId())) return;
		this._node = node;
	},
	init: function (text) {
		if (!this._node) return;
		var node = this._node;
		// var billboard = this.createTextBillboardForNode(this._node, text, this._color);
		var billboard = new mono.Billboard();
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
			'm.vertical': true,
		});
		billboard.setScale(c.width / 5, c.height / 5, 1);
		// billboard.contentWidth = c.width;
		// billboard.contentHeight = c.height;
		this._canvas = c;

		this._billboard = billboard;
	},
	// 此模板只展示简单的kev-value数据，如果有嵌套对象，忽略
	update: function (data, id) {
		this.updateTable(data, id);
	},
	destory: function () {
		if (!this._billboard) return;
		var box = this.sceneManager.network3d.getDataBox();
		this._billboard.setParent(null);
		box.remove(this._billboard);

	},
	updateTable: function (data, id) {
		if (!data) return;
		delete data['_all'];
		var $table = this._$table;
		$table.empty();
		var i = 0, color, valStr, val, unit, node;
		for (var p in data) {
			if (i++ >= 8) break;
			valStr = data[p];

			if (dataJson.mutliPropBillboard.noSplit && $.inArray(p, dataJson.mutliPropBillboard.noSplit) != -1) {
				val = valStr;
				unit = ''
			} else {
				val = parseFloat(valStr);
				unit = valStr.replace(val, '');			
				if (!(val + '').length) {
					val = unit;
					unit = '';
				}
			}

			$('<div>' +
				'<span>' + it.util.i18n(p) + '</span>' +
				'<span>' + val + '</span>' +
				'<span>' + unit + '</span>' +
				'</div>').appendTo($table);
		}

		$('div > span:nth-child(2)', $table).css({
			fontSize: '40px'
		});
		$('div', $table).css({
			margin: '-10px 0',
			padding: dataJson.mutliPropBillboard.divCss.padding || ''
		});
		$('div > span:nth-child(1)', $table).css({
			display: 'inline-block',
			paddingLeft: '10px',
			width: '150px',
			marginRight: '0px',
			textAlign: 'left'
		});
		$('div > span:nth-child(3)', $table).css({
			paddingRight: '150px',
			float: 'right',
		});


		// 更多箭头
		// $('<tr><td align="right" colspan="2"><div style="width: 0px;border-width: 25px;border-color: black transparent transparent transparent;border-style: solid dashed dashed dashed;border-bottom: none;margin-left: 45%; "></td></tr>').appendTo($table);
		if (!this._billboard) {
			this.init();
		}
		// this.updateImage($table[0]);
		this.updateImage(this._$rootDiv[0]);
	},
	updateImage: function (table) {
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
			g.clearRect(0, 0, canvas.width, canvas.height);
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
		var height = size.height + size.height / 4;
		var radius = 30;
		var arrowWidth = size.width / 4;
		var arrowHeight = size.height / 4;

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
	createCanvas: function () {
		var self = this;
		var c = document.createElement('canvas');
		var canvasSize = this._canvasSize;
		c.width = Math.pow(2, self.checkNum(canvasSize.width));
		c.height = Math.pow(2, self.checkNum(canvasSize.height));// + canvasSize.height/4;//低端箭头
		this.makeHighRes(c);
		return c;
	},
	makeHighRes: function (c) {
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
		if (label.indexOf("\n")) {
			array = label.split("\n");
		} else {
			array = [label]
		}
		array = array.filter(function (item) {
			return item;
		});
		var length = 0;
		for (var i = 0; i < array.length; i++) {
			if (i == 0) {
				length = context.measureText(array[i]).width;
			} else {
				length = Math.max(context.measureText(array[i]).width, length);
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
			height: (height + arrowHeight),
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
			context.fillText(text, (c_width - length) / 2, top + lineHeight * i + (i + 1) * lineGap);
		}
		context.font = "30px sans-serif";
		text = it.util.i18n("KVTextBillboardViewTemplate_Double_click");
		length = context.measureText(text).width;
		context.fillText(text, (c_width - length - 40), top + lineHeight * i + (i + 1) * lineGap - 10);
		return canvas;
	},
	getBillboardContent: function (args) {

		args = it.Util.ext({ width: 256, height: 128, radius: 20, arrowWidth: 50, arrowHeight: 30 }, args);
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
		board.setScale(c.width / 2, c.height / 2, 1);
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
	},
	checkNum: function (num) {
		var index = 0;
		while (num >= 2) {
			index++;
			num = num / 2;
		}
		if (num == 1) {
			return index;
		}
		return ++index;
	}
});
it.viewTemplate.MutilPropVT = MutilPropVT;