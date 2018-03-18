//带箭头的TextBillboard

var _TextBillboardWithArrow = it._TextBillboardWithArrow = function () {
	this.sceneManager = main.sceneManager;
	this.currentBillboard = false;
	this.box = this.sceneManager.network3d.getDataBox();
	this.arrowPosition = 'down';
	this.arrowCut = 3;
	this.billboardScale = [];
	this.repeat = {};
	this.content = {};
};

mono.extend(_TextBillboardWithArrow, Object, {

	createBillboard: function (options) {
		var text = options.text;
		var position = options.position;
		var userScale = options.scale;
		var args;
		if (text == null || text == '') {
			return;
		}
		if (!position) {
			position = [0, 0, 0];
		}
		if (options.arrowPosition) {
			this.arrowPosition = options.arrowPosition;
		}
		args = options.args;
		var billboard = this.createTextBillboard(text, '#46606a', args);
		billboard.setPosition(new mono.Vec3(position[0], position[1], position[2]));
		var oldScale = billboard.getScale();
		if (userScale && userScale.length >= 2) {
			this.billboardScale = [oldScale.x * userScale[0], oldScale.y * userScale[1], 1]
			billboard.setScale(this.billboardScale[0], this.billboardScale[1], this.billboardScale[2]);
		}
		if (options.parentNode) {
			billboard.setParent(options.parentNode)
		}
		this.currentBillboard = billboard;
		return billboard;
	},

	createTextBillboard: function (text, bgColor, args) {
		var c = this.getTextBillboardContent(text, bgColor, args);
		// $('body').empty();
		// $('body').append(c)
		var board = new mono.Billboard();
		board.s({
			'm.texture.image': c,
			'm.transparent': true,
			'm.alignment': mono.BillboardAlignment.bottomCenter,
			'm.vertical': false,
			'm.texture.wrapS': TGL.ClampToEdgeWrapping,
			'm.texture.wrapT': TGL.ClampToEdgeWrapping,
			'm.texture.repeat': new mono.Vec2(this.repeat.width * 1.01, this.repeat.height),
			'm.texture.offset': new mono.Vec2(0, 1 - this.repeat.height * 1.005),
			// 'm.depthMask':false,
		});
		board.setScale(this.content.width / 2, this.content.height / 2, 1);
		board.setSelectable(false);
		board.contentWidth = this.content.width;
		board.contentHeight = this.content.height;
		board.isTextBillboard = true;
		return board;
	},

	getTextBillboardContent: function (label, bgcolor, args, eCanvas, ctx) {
		args = args || {};
		if (!ctx && !eCanvas) {
			var canvas = document.createElement('canvas');
			var context = canvas.getContext('2d');
		} else {
			var context = ctx;
			var canvas = eCanvas;
		}
		
		context.font = "140px 'Source Han Sans CN', 'Microsoft YaHei', Verdana, Helvetica, Arial, 'Open Sans', sans-serif";
		var array = [];
		if (label.indexOf("\n")) {
			array = label.split("\n");
		} else {
			array = [label]
		}
		var txt_width = 0;
		var measure_title_width = 0;
		var measure_line_width = 0;
		var measure_left_line_width = 0;
		var measure_right_line_width = 0;
		var textArrs = [0,];
		var isHasMaoHao;
		isHasMaoHao = array[1]&&array[1].indexOf("：");

		context.save();
		context.font = "bolder 160px 'Source Han Sans CN', 'Microsoft YaHei', Verdana, Helvetica, Arial, 'Open Sans', sans-serif";
		measure_title_width = context.measureText(array[0]).width;
		context.restore();
		
		if(isHasMaoHao){
			for (var i = 1; i < array.length; i++) {
				var textArr = [];
				var theLeft, theRight;
				textArr = array[i].split("：");
				textArrs.push(textArr);
				theLeft = context.measureText(textArr[0] + "：").width;
				measure_left_line_width = Math.max(theLeft, measure_left_line_width);
				theRight = context.measureText(textArr[1]).width;
				measure_right_line_width = Math.max(theRight, measure_right_line_width);
			}
			measure_line_width = measure_left_line_width + measure_right_line_width;
		} else{
			for (var i = 1; i < array.length; i++) {
				measure_line_width = Math.max(context.measureText(array[i]).width, measure_line_width);
			}
		}
		txt_width = Math.max(measure_title_width, measure_line_width);
		var size = mono.Utils.getMaxTextSize(array, context.font);
		var txt_height = size.height;
		var arrowHeight = txt_width / 8;
		var arrowWidth = txt_width / 8;
		var txt_space = 100;
		var lineWidth = 10;
		var lineHeightSpace = 80;
		var content_width;
		var content_height;
		if (this.arrowPosition == 'right') {
			content_width = txt_width + txt_space * 2 + arrowWidth + lineWidth * 2;
			content_height = txt_height + txt_space * 2 + lineWidth * 2 + lineHeightSpace * (array.length - 1);
		} else if (this.arrowPosition == 'down') {
			content_width = txt_width + txt_space * 2 + lineWidth * 2;
			content_height = txt_height + txt_space * 2 + arrowHeight + lineWidth * 2 + lineHeightSpace * (array.length - 1);
		}
		this.content.width = content_width;
		this.content.height = content_height;
		canvas.height = mono.Utils.nextPowerOfTwo(content_height);
		canvas.width = mono.Utils.nextPowerOfTwo(content_width);
		this.repeat.width = this.content.width / canvas.width;
		this.repeat.height = this.content.height / canvas.height;
		var lineHeight = txt_height / array.length;
		var lineHeightSpace;
		args = it.Util.ext({
			labelColor: '#bcbcbc',
			width: content_width,
			height: content_height,
			radius: (content_width / 64),
			arrowWidth: arrowWidth,
			arrowHeight: arrowHeight,
			bgColor: bgcolor,
			canvas: canvas,
			lineWidth: lineWidth
		}, args);
		this.getBillboardContent(args);
		context.fillStyle = args.labelColor;
		context.textBaseline = 'middle';
		context.font = "140px 'Source Han Sans CN', 'Microsoft YaHei', Verdana, Helvetica, Arial, 'Open Sans', sans-serif";

		context.save();
		context.font = "bolder 160px 'Source Han Sans CN', 'Microsoft YaHei', Verdana, Helvetica, Arial, 'Open Sans', sans-serif";
		context.fillStyle = '#fff';
		context.fillText(array[0], lineWidth + txt_space, lineWidth + lineHeight / 2 + txt_space);
		context.restore();

		if (isHasMaoHao) {
			for (var i = 1; i < array.length; i++) {
				var textArr1 = textArrs[i][0];
				var textArr2 = textArrs[i][1];
				context.fillText(textArr1 + "：", lineWidth + txt_space, (lineHeight + lineHeightSpace) * i + lineWidth + lineHeight / 2 + txt_space);
				context.fillText(textArr2, lineWidth + txt_space + measure_left_line_width, (lineHeight + lineHeightSpace) * i + lineWidth + lineHeight / 2 + txt_space);
			}
		} else{
			for (var i = 1; i < array.length; i++) {
				var text = array[i];
				context.fillText(text, lineWidth + txt_space, (lineHeight + lineHeightSpace) * i + lineWidth + lineHeight / 2 + txt_space);
			}
		}
		return canvas;
	},

	getBillboardContent: function (args) {
		console.log('it._TextBillboardWithArrow这个方法已经停止更新了，如果看到提示请更换新的方法。  --2018-1-29  add by lyz');
		args = it.Util.ext({
			width: 256,
			height: 128,
			radius: 20,
			arrowWidth: 30,
			arrowHeight: 30,
		}, args);
		var width = args.width;
		var height = args.height;
		var radius = args.radius;
		var arrowWidth = args.arrowWidth;
		var arrowHeight = args.arrowHeight;
		var lineWidth = args.lineWidth;
		var canvas = args.canvas;
		if (!canvas) {
			canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;
		}
		if (!args.isHumOrTemp) {
			var context = canvas.getContext('2d');
			context.globalAlpha = args.globalAlpha || 0.8;
			context.fillStyle = args.bgColor || '#66ccff';
			context.save();
			context.strokeStyle = '#00f6ff';
			context.lineWidth = lineWidth;
			context.beginPath();
			if (this.arrowPosition == 'right') {
				context.moveTo(radius + lineWidth, lineWidth);
				context.lineTo(width - radius - lineWidth - arrowWidth, lineWidth);
				context.arcTo(width - lineWidth - arrowWidth, lineWidth, width - lineWidth - arrowWidth, radius + lineWidth, radius);

				context.lineTo(width - lineWidth - arrowWidth, height * 3 / 4 - arrowHeight / 2);
				context.lineTo(width - lineWidth, height * 3 / 4);
				context.lineTo(width - lineWidth - arrowWidth, height * 3 / 4 + arrowHeight / 2);

				context.lineTo(width - lineWidth - arrowWidth, height - radius - lineWidth);
				context.arcTo(width - lineWidth - arrowWidth, height - lineWidth, width - radius - lineWidth - arrowWidth, height - lineWidth, radius);
				context.lineTo(radius + lineWidth, height - lineWidth);
				context.arcTo(lineWidth, height - lineWidth, lineWidth, height - radius - lineWidth, radius);
				context.lineTo(lineWidth, radius + lineWidth);
				context.arcTo(lineWidth, lineWidth, radius + lineWidth, lineWidth, radius);
			} else if (this.arrowPosition == 'down') {
				context.moveTo(radius + lineWidth, lineWidth);
				context.lineTo(width - radius - lineWidth, lineWidth);
				context.arcTo(width - lineWidth, lineWidth, width - lineWidth, radius + lineWidth, radius);
				context.lineTo(width - lineWidth, height - radius - lineWidth - arrowHeight);
				context.arcTo(width - lineWidth, height - lineWidth - arrowHeight, width - radius - lineWidth, height - lineWidth - arrowHeight, radius);

				context.lineTo(width * this.arrowCut / 4 + arrowWidth / 2, height - arrowHeight - lineWidth);
				context.lineTo(width * this.arrowCut / 4, height - lineWidth);
				context.lineTo(width * this.arrowCut / 4 - arrowWidth / 2, height - arrowHeight - lineWidth);

				context.lineTo(radius + lineWidth, height - arrowHeight - lineWidth);
				context.arcTo(lineWidth, height - arrowHeight - lineWidth, lineWidth, height - radius - arrowHeight - lineWidth, radius);
				context.lineTo(lineWidth, radius + lineWidth);
				context.arcTo(lineWidth, lineWidth, radius + lineWidth, lineWidth, radius);
			} else {
				console.log(this.arrowPosition);
				console.error('该方向的箭头面板不存在');
			}
			context.closePath();
			context.save();
			context.shadowBlur = 5;
			context.shadowOffsetX = 20;
			context.shadowOffsetY = 20;
			context.shadowColor = "black";
			context.fill();
			context.restore();
			context.stroke();
			context.restore();
		}
	},
});