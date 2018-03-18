(function ($) {
    $.widget("hud.RackSeatOccupy", {
        // default options
        options: {
            title: '机位占用统计',
            all: 200,
            fontSize: "15px ",
            fontRetinaSize: "30px ",
            fontTextFamily: "SimSun, 'Microsoft YaHei', Verdana, Helvetica, Arial, 'Open Sans', sans-serif",
            fontNumFamily: "'Microsoft YaHei', Verdana, Helvetica, Arial, 'Open Sans', sans-serif",
            items:[{
                text: '占用机位数',
                sum: 167,
                color: '#00a0ea',
                direction: 'right',
            }, {
                text: '空余机位数',
                sum: 33,
                color: '#6dd774',
                direction: 'left',
            }],
            width: 600,
            height: 110,
        },

        _create: function () {
            this.element.addClass('RackSeatOccupy');
            this.element.css({
                width: this.options.width,
            })
            this.title = this.createTitle();
            this.canvas = this.createCanvas();
        },

        doShow: function(){
            this.refresh();
            this.element.show();
        },

        doHide: function () {
            this.element.hide();
        },

        refresh: function(){
            $(this.canvas).remove();
            this.canvas = this.createCanvas();
        },

        createTitle: function(){
            var title = $('<div>').addClass('RackSeatOccupy-title').text(this.options.title);
            this.element.append(title);
            return title;
        },

        createCanvas: function(){
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');

            var PIXEL_RATIO = this.getPixelRatio(ctx);
            this.PIXEL_RATIO = PIXEL_RATIO;
            this.baseUnit = 5*PIXEL_RATIO;
            var canvasWidth = this.options.width * PIXEL_RATIO;
            var canvasHeight =  this.options.height * PIXEL_RATIO;
            var contentWidth = 0.9*canvasWidth;
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            canvas.style.width = this.options.width + 'px';
            canvas.style.height = this.options.height + 'px';

            var canvasTitle = this.makeCanvasTitle(contentWidth);
            ctx.drawImage(canvasTitle, 0.05*canvasWidth, 0, canvasTitle.width, canvasTitle.height);
            var canvasContent = this.makeCanvasContent(contentWidth);
            ctx.drawImage(canvasContent, 0.05*canvasWidth, canvasTitle.height, canvasContent.width, canvasContent.height);
            var canvasAxis = this.makeCanvasAxis(canvasWidth);
            ctx.drawImage(canvasAxis, 0, canvasTitle.height + canvasContent.height, canvasAxis.width, canvasAxis.height);
            this.element.append(canvas);
            var self = this;
            this.popBox = 0;
            this.popElement = $('<div>').addClass('RackSeatOccupy-Pop');
            this.popElement.css({
                'position': 'absolute',
            })
            this.popElement.hide();
            this.element.append(this.popElement);
            canvas.addEventListener('mousemove',function(e){
                var mx = e.offsetX;
                var my = e.offsetY;

                var m1xl = 0.05 * self.options.width;
                var m1xr = 0.05 * self.options.width + self.tiXingPosition[0].allWidth / PIXEL_RATIO;
                var m1yl = canvasTitle.height / PIXEL_RATIO + 10;
                var m1yr = canvasTitle.height / PIXEL_RATIO + 10 + self.tiXingPosition[0].allHeight / PIXEL_RATIO;
                var m2xl = 0.05 * self.options.width + self.tiXingPosition[0].allWidth / PIXEL_RATIO;
                var m2xr = 0.05 * self.options.width + self.tiXingPosition[0].allWidth / PIXEL_RATIO + self.tiXingPosition[1].allWidth / PIXEL_RATIO;
                var m2yl = canvasTitle.height / PIXEL_RATIO + 10;
                var m2yr = canvasTitle.height / PIXEL_RATIO + 10 + self.tiXingPosition[1].allHeight / PIXEL_RATIO;

                if(mx>m1xl
                    &&mx<m1xr
                    &&my>m1yl
                    &&my<m1yr){
                        self.makePopBox(mx+0.05*self.options.width, my+30, 1, self.tiXingPosition[0].content)
                    } else if(mx>m2xl
                            &&mx<m2xr
                            &&my>m2yl
                            &&my<m2yr){
                        self.makePopBox(mx+0.05*self.options.width, my+30, 2, self.tiXingPosition[1].content)
                    } else {
                        if(self.popBox == 1||self.popBox == 2){
                            self.removePopBox()
                        }
                    }
            })
            return canvas;
        },

        getPixelRatio: function (ctx) {
            var dpr = window.devicePixelRatio || 1;
            var bsr = ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || 1;
            var bili = dpr/bsr;
            if(bili == 2) this.options.fontSize = this.options.fontRetinaSize;
            return  bili;
        },

        makePopBox: function(mx, my, popBox, content){
            if(this.popBox == 0){
                this.popElement.css({
                    left: mx,
                    top: my,
                })
                this.popElement.text(content).show();
                this.popBox = popBox;
            } else{
                if(this.popBox != popBox){
                    this.popElement.text(content);
                    this.popBox = popBox;
                }
                this.popElement.css({
                    left: mx,
                    top: my,
                })
            }
        },

        removePopBox: function(){
            this.popElement.hide();
            this.popBox = 0;
        },

        makeCanvasTitle: function(w){
            var canvas = document.createElement('canvas');
            canvas.width = w;
            var ctx = canvas.getContext('2d');
            var textHeight = ctx.measureText('M').width;
            canvas.height = Math.max(textHeight, this.baseUnit*4);
            var icons = [];
            var positionRight = 0;
            var padding1 = this.baseUnit;
            var padding2 = this.baseUnit*4;
            for(var i=this.options.items.length-1; i>=0; i--){
                ctx.save();
                var thisIcon = this.makeTiXing({
                    width: this.baseUnit,
                    height: this.baseUnit*2,
                    arrow: this.baseUnit,
                    bg: this.options.items[i].color,
                });
                ctx.fillStyle = '#fff';
                ctx.font = this.options.fontSize + this.options.fontTextFamily;
                ctx.textBaseline = "middle";
                var thisText = this.options.items[i].text;
                var textWidth = ctx.measureText(thisText).width;
                positionRight += textWidth;
                ctx.fillText(thisText, w - positionRight, this.baseUnit*2);
                positionRight += padding1;
                var iconWidth = thisIcon.width;
                positionRight += iconWidth;
                ctx.drawImage(thisIcon, w - positionRight, (this.baseUnit*4 - thisIcon.height)/2);
                positionRight += padding2;
            }
            // ctx.fillStyle = 'rgba(102,204,255,0.2)';
            // ctx.fillRect(0,0,canvas.width,canvas.height)
            ctx.restore();
            return canvas;
        },

        makeCanvasContent: function(w){
            var canvas = document.createElement('canvas');
            canvas.width = w;
            // canvas.height = this.baseUnit*8;
            canvas.height = this.PIXEL_RATIO*40;
            var ctx = canvas.getContext('2d');
            var positionLeft = 0;
            this.tiXingPosition = [];
            for(var i=0; i<this.options.items.length; i++){
                ctx.save();
                var thisArrow = this.baseUnit*4;
                var thisItemWidth = this.options.items[i].sum/this.options.all*w ;
                this.tiXingPosition.push({
                    // direction: this.options.items[i].direction,
                    allWidth: thisItemWidth,
                    allHeight: this.baseUnit*6,
                    content: this.options.items[i].sum,
                })
                var thisItem = this.makeTiXing({
                    direction: this.options.items[i].direction,
                    width: thisItemWidth - thisArrow,
                    height: this.baseUnit*6,
                    arrow: thisArrow,
                    bg: this.options.items[i].color,
                    text: this.options.items[i].sum,
                    textFont: this.options.fontSize + this.options.fontNumFamily,
                });
                if (this.options.items[i].direction == 'left') {
                    positionLeft -= (thisArrow - 5);
                }
                ctx.drawImage(thisItem, positionLeft, this.baseUnit*2);
                positionLeft += thisItemWidth;
                ctx.restore();
            }
            // ctx.fillStyle = 'rgba(102,204,255,0.2)';
            // ctx.fillRect(0,0,canvas.width,canvas.height)
            return canvas;
        },

        makeCanvasAxis: function(w){
            var canvas = document.createElement('canvas');
            canvas.width = w;
            var ctx = canvas.getContext('2d');
            var positionLeft = 0;
            var axisArray = [];
            var paddingSum = 5;
            var padding = 10*parseInt((this.options.all/paddingSum)/10);
            // var padding = Math.ceil(this.options.all/paddingSum);
            for(var i=0; i<paddingSum; i++){
                axisArray.push(padding*i)
            }
            if(this.options.all - axisArray[axisArray.length-1] > 1.5*padding){
                axisArray.push(axisArray[axisArray.length-1] + padding)
            }
            axisArray.push(this.options.all)
            ctx.save();
            ctx.textBaseline = 'top';
            ctx.fillStyle = '#fff';
            ctx.font = this.options.fontSize + this.options.fontNumFamily;
            ctx.beginPath();
            ctx.moveTo(0.05*w, this.baseUnit*4);
            ctx.lineTo(0.95*w, this.baseUnit*4);
            for(var i=0; i<axisArray.length; i++){
                ctx.moveTo(0.05*w + axisArray[i]/this.options.all*0.9*w, this.baseUnit*4);
                ctx.lineTo(0.05*w + axisArray[i]/this.options.all*0.9*w, this.baseUnit*2);
                var theTextWidth = ctx.measureText(axisArray[i]).width;
                var theTextPosition = 0.05*w + axisArray[i]/this.options.all*0.9*w - theTextWidth/2;
                ctx.fillText(axisArray[i] ,theTextPosition , this.baseUnit*5);
            }
            ctx.closePath();
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = '#fff';
            ctx.stroke();
            ctx.restore();
            // ctx.fillStyle = 'rgba(102,204,255,0.2)';
            // ctx.fillRect(0,0,canvas.width,canvas.height)
            return canvas;
        },

        // var canvas1 = makeTiXing({
        //     direction: 'right',
        //     width: 200,
        //     height: 100,
        //     arrow: 50,
        //     bg: '#66ccff',
        //     text: '168',
        //     textFont: '30px Arial',
        // })
        makeTiXing: function (options) {
            var tDirection = options.direction || 'right';
            var tWidth = options.width || 200;
            var tHeight = options.height || 100;
            var tArrow = options.arrow || 50;
            var tBg = options.bg || '#66ccff';
            var tText = options.text;
            var tTextFont = options.textFont;
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            if (tDirection == 'left') {
                canvas.width = tWidth + tArrow * 2;   
            } else {
                canvas.width = tWidth + tArrow;
            }
            canvas.height = tHeight;
            ctx.save();
            ctx.beginPath();
            if (tDirection == 'right') {
                ctx.moveTo(0, 0);
                ctx.lineTo(tWidth, 0);
                ctx.lineTo(tWidth + tArrow, tHeight / 2);
                ctx.lineTo(tWidth, tHeight);
                ctx.lineTo(0, tHeight);
                ctx.lineTo(0, 0);
            } else if (tDirection == 'left') {
                ctx.moveTo(tArrow, tHeight / 2);
                ctx.lineTo(0, 0);
                ctx.lineTo(tWidth + tArrow * 2 - 5, 0);
                ctx.lineTo(tWidth + tArrow * 2 - 5, tHeight);
                ctx.lineTo(0, tHeight);
                ctx.lineTo(tArrow, tHeight / 2);
            }
            ctx.closePath();
            ctx.fillStyle = tBg;
            ctx.fill();
            if (tText) {
                ctx.save();
                ctx.font = tTextFont || '20px  Arial';
                ctx.textBaseline = "middle";
                ctx.fillStyle = '#fff';
                var textPosition = {};
                textPosition.y = tHeight / 2;
                if (tDirection == 'right') {
                    var textSize = ctx.measureText(tText);
                    var textWidth = textSize.width;
                    textPosition.x = tWidth - textWidth;
                } else if (tDirection == 'left') {
                    textPosition.x = tArrow;
                }
                ctx.fillText(tText, textPosition.x, textPosition.y);
                ctx.restore();
            }
            ctx.restore();
            return canvas;
        }
    })
})(jQuery)