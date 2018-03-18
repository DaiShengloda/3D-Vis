/* 带箭头的TextBillboard */

var TextBillboardWithArrow = it.TextBillboardWithArrow = function () {

	// 默认的参数们
	this.position = [0, 0, 0];
	this.scale = [1, 1, 1];
	this.text = '测试标题\n测试内容';
	this.ifHasTitle = 'true';
	this.isHasSeparator = 'true';
	this.lineSeparator = '：';
	this.bgColor = '#46606a';
	this.borderColor = '#00f6ff';
	this.contentColor = '#bcbcbc';
	this.globalAlpha = 0.8;
	this.arrowCut = 3;
	this.arrowPosition = 'down';
	this.triangleTipPosition = null;
};

mono.extend(TextBillboardWithArrow, Object, {

	/**
	 * @param {Object} options - 传入的所有参数
	 * @param {array} options.position - billboard的位置，长度为3的数组
	 * @param {array} options.scale - billboard的用户尺寸，长度为2或者3的数组
	 * @param {string} options.parentNode - billboard的父对象，使用node数据
	 * @param {string} options.text - billboard上的文字内容，用\n换行；若有需要分两列的那种，就使用指定分隔符，不可以选用'\n'。默认的分隔符为中文冒号'：'
	 * @param {string} options.isHasSeparator - billboard上的文字是否有分隔符，参数为字符串'true'或'false'
	 * @param {string} options.lineSeparator - billboard上的文字分两列的分隔符。默认值为中文冒号'：'
	 * @param {string} options.ifHasTitle - billboard上的文字内容是否需要标题，参数为字符串'true'或'false'
	 * @param {string} options.bgColor - billboard上的背景的颜色值
	 * @param {string} options.borderColor - billboard上的边框的颜色值
	 * @param {string} options.contentColor - billboard的字体的颜色
	 * @param {string} options.globalAlpha - billboard中的canvas的透明度
	 * @param {number} options.arrowCut - billboard中箭头所处的位置，设置范围为0-4，其中2表示处于正中间
	 * @param {string} options.arrowPosition - billboard的箭头的方向，目前可用'down'和'right'和'noArrow'
	 * @param {string} options.canvas - billboard中的canvas的dom，（若没有则不填）
	 * @param {string} options.ctx - billboard中的canvas的context，（若没有则不填）
	 * @param {string} options.triangleTipPosition - billboard中的颜色角标的位置，目前可用'leftBottom'，即没有角标（若没有则不填）
	 * @returns 
	 */
	createBillboard: function (options) {
		var position = options.position || this.position;
		var scale = options.scale || this.scale;
		var parentNode = options.parentNode;
		var canvas = this.getTextBillboardCanvas(options);
		// console.time('makeBillboardByCanvas')
		var billboard = it.util.makeBillboardByCanvas(canvas);
		// console.timeEnd('makeBillboardByCanvas')

		// position
		billboard.setPosition(new mono.Vec3(position[0], position[1], position[2]));
		// scale
		var oldScale = billboard.getScale();
		if (scale && scale.length >= 2) {
			var billboardScale = [oldScale.x * scale[0], oldScale.y * scale[1], 1]
			billboard.setScale(billboardScale[0], billboardScale[1], billboardScale[2]);
		}
		// parentNode
		if (parentNode) {
			billboard.setParent(parentNode)
		}
		return billboard;
	},

	getTextBillboardCanvas: function (options) {

		// 测试性能用代码
		// var canvas = document.createElement('canvas');
		// var ctx = canvas.getContext('2d');
		// canvas.width = 128;
		// canvas.height = 128;
		// ctx.fillStyle = '#00f6ff';
		// ctx.fillRect(0,0,128,128);
		// return canvas;

		var canvas = options.canvas;
		var context = options.ctx;
		var allText = options.text;
		var bgColor = options.bgColor || this.bgColor;
		var arrowPosition = options.arrowPosition || this.arrowPosition;
		var contentColor = options.contentColor || this.contentColor;
		var ifHasTitle = options.ifHasTitle || this.ifHasTitle;
		var isHasSeparator = options.isHasSeparator || this.isHasSeparator;
		var lineSeparator = options.lineSeparator || this.lineSeparator;

		if (!context || !canvas) {
			canvas = document.createElement('canvas');
			context = canvas.getContext('2d');
		}

		var firstLine;
		if(ifHasTitle == 'true'){
			firstLine = 1;
		} else if(ifHasTitle == 'false'){
			firstLine = 0;
		}

		context.font = "140px 'Source Han Sans CN', 'Microsoft YaHei', Verdana, Helvetica, Arial, 'Open Sans', sans-serif";
		// context.font = "140px";
		var array = [];
		if (allText.indexOf("\n") > -1) {
			array = allText.split("\n");
		} else {
			array = [allText]
		}
		var txt_width = 0;
		var measure_title_width = 0;
		var measure_line_width = 0;
		var measure_left_line_width = 0;
		var measure_right_line_width = 0;
		var textArrs = [];

		if(firstLine){
			textArrs[0] = '标题';
			context.save();
			context.font = "bolder 160px 'Source Han Sans CN', 'Microsoft YaHei', Verdana, Helvetica, Arial, 'Open Sans', sans-serif";
			measure_title_width = context.measureText(array[0]).width;
			context.restore();
		}

		if (isHasSeparator == 'true') {
			for (var i = firstLine; i < array.length; i++) {
				var textArr = [];
				var theLeft, theRight;
				textArr = array[i].split(lineSeparator);
				textArrs.push(textArr);
				theLeft = context.measureText(textArr[0] + lineSeparator).width;
				measure_left_line_width = Math.max(theLeft, measure_left_line_width);
				theRight = context.measureText(textArr[1]).width;
				measure_right_line_width = Math.max(theRight, measure_right_line_width);
			}
			measure_line_width = measure_left_line_width + measure_right_line_width;
		} else if(isHasSeparator == 'false') {
			for (var i = firstLine; i < array.length; i++) {
				measure_line_width = Math.max(context.measureText(array[i]).width, measure_line_width);
				// measure_line_width = 20;
			}
		}
		txt_width = Math.max(measure_title_width, measure_line_width);
		var size = mono.Utils.getMaxTextSize(array, context.font);
		var txt_height = size.height;
		// var txt_height = 20;
		var arrowHeight = txt_width / 8;
		var arrowWidth = txt_width / 8;
		var txt_space = 100;
		var lineWidth = 10;
		var lineHeightSpace = 80;
		var content_width;
		var content_height;
		if (arrowPosition == 'right') {
			content_width = txt_width + txt_space * 2 + arrowWidth + lineWidth * 2;
			content_height = txt_height + txt_space * 2 + lineWidth * 2 + lineHeightSpace * (array.length - 1);
		} else if (arrowPosition == 'down') {
			content_width = txt_width + txt_space * 2 + lineWidth * 2;
			content_height = txt_height + txt_space * 2 + arrowHeight + lineWidth * 2 + lineHeightSpace * (array.length - 1);
		} else if (arrowPosition == 'noArrow') {
			content_width = txt_width + txt_space * 2 + lineWidth * 2;
			content_height = txt_height + txt_space * 2 + lineWidth * 2 + lineHeightSpace * (array.length - 1);
		}
		canvas.height = content_height;
		canvas.width = content_width;
		var lineHeight = txt_height / array.length;
		var lineHeightSpace;

		options = it.Util.ext({
			width: content_width,
			height: content_height,
			radius: (content_width / 64),
			arrowWidth: arrowWidth,
			arrowHeight: arrowHeight,
			bgColor: bgColor,
			canvas: canvas,
			lineWidth: lineWidth,
		}, options);
		// options.width = content_width;
		// options.height = content_height;
		// options.radius = (content_width / 64);
		// options.arrowWidth = arrowWidth;
		// options.arrowHeight = arrowHeight;
		// options.bgColor = bgColor;
		// options.canvas = canvas;
		// options.lineWidth = lineWidth;

		// console.time('getTextBox')
		canvas = this.getTextBox(options);
		// console.timeEnd('getTextBox')

		context.fillStyle = contentColor;
		context.textBaseline = 'middle';
		context.font = "140px 'Source Han Sans CN', 'Microsoft YaHei', Verdana, Helvetica, Arial, 'Open Sans', sans-serif";
		if(firstLine){
			context.save();
			context.font = "bolder 160px 'Source Han Sans CN', 'Microsoft YaHei', Verdana, Helvetica, Arial, 'Open Sans', sans-serif";
			context.fillStyle = '#fff';
			context.fillText(array[0], lineWidth + txt_space, lineWidth + lineHeight / 2 + txt_space);
			context.restore();
		}

		if (isHasSeparator == 'true') {
			for (var i = firstLine; i < array.length; i++) {
				var textArr1 = textArrs[i][0];
				var textArr2 = textArrs[i][1];
				context.fillText(textArr1 + lineSeparator, lineWidth + txt_space, (lineHeight + lineHeightSpace) * i + lineWidth + lineHeight / 2 + txt_space);
				context.fillText(textArr2, lineWidth + txt_space + measure_left_line_width, (lineHeight + lineHeightSpace) * i + lineWidth + lineHeight / 2 + txt_space);
			}
		} else if(isHasSeparator == 'false') {
			for (var i = firstLine; i < array.length; i++) {
				var text = array[i];
				context.fillText(text, lineWidth + txt_space, (lineHeight + lineHeightSpace) * i + lineWidth + lineHeight / 2 + txt_space);
			}
		}
		return canvas;
	},

	getTextBox: function (options) {
		var width = options.width || 256;
		var height = options.height || 128;
		var radius = options.radius || 20;
		var arrowWidth = options.arrowWidth || 30;
		var arrowHeight = options.arrowHeight || 30;
		var lineWidth = options.lineWidth || 10;
		var arrowPosition = options.arrowPosition || this.arrowPosition;
		var triangleTipPosition = options.triangleTipPosition || this.triangleTipPosition;
		var arrowCut = options.arrowCut || this.arrowCut;
		var bgColor = options.bgColor||this.bgColor;
		var globalAlpha = options.globalAlpha||this.globalAlpha;
		var borderColor = options.borderColor||this.borderColor;
		
		var canvas = options.canvas;
		if (!canvas) {
			canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;
		}

		// 测试性能用代码
		// var context = canvas.getContext('2d');
		// context.fillStyle = '#00f6ff';
		// context.fillRect(0,0,128,128);
		// return;

		var context = canvas.getContext('2d');
		context.globalAlpha = globalAlpha;
		context.fillStyle = bgColor;
		context.save();
		context.strokeStyle = borderColor;
		context.lineWidth = lineWidth;
		context.beginPath();
		if (arrowPosition == 'right') {
			context.moveTo(radius + lineWidth, lineWidth);
			context.lineTo(width - radius - lineWidth - arrowWidth, lineWidth);
			context.arcTo(width - lineWidth - arrowWidth, lineWidth, width - lineWidth - arrowWidth, radius + lineWidth, radius);

			context.lineTo(width - lineWidth - arrowWidth, height * arrowCut / 4 - arrowHeight / 2);
			context.lineTo(width - lineWidth, height * arrowCut / 4);
			context.lineTo(width - lineWidth - arrowWidth, height * arrowCut / 4 + arrowHeight / 2);

			context.lineTo(width - lineWidth - arrowWidth, height - radius - lineWidth);
			context.arcTo(width - lineWidth - arrowWidth, height - lineWidth, width - radius - lineWidth - arrowWidth, height - lineWidth, radius);
			context.lineTo(radius + lineWidth, height - lineWidth);
			context.arcTo(lineWidth, height - lineWidth, lineWidth, height - radius - lineWidth, radius);
			context.lineTo(lineWidth, radius + lineWidth);
			context.arcTo(lineWidth, lineWidth, radius + lineWidth, lineWidth, radius);
		} else if (arrowPosition == 'down') {
			context.moveTo(radius + lineWidth, lineWidth);
			context.lineTo(width - radius - lineWidth, lineWidth);
			context.arcTo(width - lineWidth, lineWidth, width - lineWidth, radius + lineWidth, radius);
			context.lineTo(width - lineWidth, height - radius - lineWidth - arrowHeight);
			context.arcTo(width - lineWidth, height - lineWidth - arrowHeight, width - radius - lineWidth, height - lineWidth - arrowHeight, radius);

			context.lineTo(width * arrowCut / 4 + arrowWidth / 2, height - arrowHeight - lineWidth);
			context.lineTo(width * arrowCut / 4, height - lineWidth);
			context.lineTo(width * arrowCut / 4 - arrowWidth / 2, height - arrowHeight - lineWidth);

			context.lineTo(radius + lineWidth, height - arrowHeight - lineWidth);
			context.arcTo(lineWidth, height - arrowHeight - lineWidth, lineWidth, height - radius - arrowHeight - lineWidth, radius);
			context.lineTo(lineWidth, radius + lineWidth);
			context.arcTo(lineWidth, lineWidth, radius + lineWidth, lineWidth, radius);
		} else if (arrowPosition == 'noArrow') {
			context.moveTo(radius + lineWidth, lineWidth);
			context.lineTo(width - radius - lineWidth, lineWidth);
			context.arcTo(width - lineWidth, lineWidth, width - lineWidth, radius + lineWidth, radius);
			context.lineTo(width - lineWidth, height - radius - lineWidth);
			context.arcTo(width - lineWidth, height - lineWidth, width - radius - lineWidth, height - lineWidth, radius);
			context.lineTo(radius + lineWidth, height - lineWidth);
			context.arcTo(lineWidth, height - lineWidth, lineWidth, height - radius - lineWidth, radius);
			context.lineTo(lineWidth, radius + lineWidth);
			context.arcTo(lineWidth, lineWidth, radius + lineWidth, lineWidth, radius);
		} else {
			console.log(arrowPosition);
			console.log('该方向的箭头面板不存在');
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

		context.save();
		context.beginPath();
		if(triangleTipPosition == 'leftBottom'){
			context.moveTo(0, height - radius*5);
			context.lineTo(0, height);
			context.lineTo(radius*5, height);
			context.lineTo(0, height - radius*5);
		}
		context.closePath();
		context.fillStyle = borderColor;
		context.fill();
		context.restore();

		context.restore();
		return canvas;
	},
});

it.util.makeTextBillboardWithArrow = new it.TextBillboardWithArrow()