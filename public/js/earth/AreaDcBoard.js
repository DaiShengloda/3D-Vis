var AreaDcBoard = function(dc) {
    // this._canvasSize = {'width': 5120, height: 5120};
    this._realSize = {'width': 2700, height: 3000};
	this.init(dc);
}

mono.extend(AreaDcBoard, Object, {
	init: function(dc){
        var billboard =  new mono.Billboard();
        billboard.setStyle('m.alignment', mono.BillboardAlignment.topRight);
        billboard.setStyle('m.transparent', true);
        this._billboard = billboard;
        var self = this;
        var c = this.getTextCanvas(dc, function(canvas){
            var bigCanvas = self.convertCanvas(canvas);
            // c = bigCanvas;
            // $('body').append(bigCanvas)
            billboard.s({
                'm.texture.image': bigCanvas,
                'm.vertical': false,
                // 'm.texture.offset': new TGL.Vec2(0,0),
                // 'm.texture.repeat': new TGL.Vec2(1,1),
                'm.fixedSize': 500,
            });
            billboard.setScale(self._realSize.width/30, self._realSize.height/30, 1);
        });
        
    },
    convertCanvas: function(c){
        // var cs = this._canvasSize, ow = cs.width, oh = cs.height;
        var ow = c.width, oh = c.height;
        var w = mono.Utils.nextPowerOfTwo(ow);
        var h = mono.Utils.nextPowerOfTwo(oh);

        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.style.width = w;
        canvas.style.height = h;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(c,0,0,ow,oh,0,0,w,h);
        return canvas;
    },
    getTextCanvas: function(dc, callback){
        var w = this._realSize.width, h = this._realSize.height;
        var canvas = document.createElement('canvas');
        // canvas.width = this._canvasSize.width;
        // canvas.height = this._canvasSize.height;
        canvas.width = this._realSize.width;
        canvas.height = this._realSize.height;
        var g = canvas.getContext('2d');


        var cc = '#2ce9ff',bc = '#4bacff';//75,172,255
        // 1.绘制边框，背景
        // 第一层背景
        g.fillStyle = 'rgba(75,172,255,0.1)';
        g.fillRect(0, 0, w, h);
        // 第二层背景
        g.fillStyle = 'rgba(75,172,255,0.2)';
        g.fillRect(60, 60, w-120, h-120);
        // 边框
        g.strokeStyle = '#007C84';
        g.strokeRect(20, 20, w-40, h-40);
        // 边角
        var cw = 120, ch = 20;
        g.fillStyle = '#2ce9ff';
            // 左上角
        g.fillRect(0, 0, cw, ch);
        g.fillRect(0, 0, ch, cw);
            // 左下角
        g.fillRect(0, h-ch, cw, ch);
        g.fillRect(0, h-cw, ch, cw);
            // 右下角
        g.fillRect(w-cw, h-ch, cw, ch);
        g.fillRect(w-ch, h-cw, ch, cw);
            // 右上角
        g.beginPath();
        g.moveTo(w-cw, 0);
        g.lineTo(w, 0);
        g.lineTo(w, cw);
        g.closePath();
        g.fill();
        
        // 2.绘制标题
        g.font = "200px Source Han Sans CN,Microsoft YaHei, Verdana, Helvetica, Arial, 'Open Sans', sans-serif";
        g.fillStyle = '#dcefff';
        g.textBaseline = 'top';
        var txt = dc.getName() || dc.getId();
        g.fillText(txt, 200, 150);
        var titleHeight = g.measureText('M').width;
        
        
        // 4.绘制简介
        if(dc.getDescription()){
            g.font = "140px Source Han Sans CN,Microsoft YaHei, Verdana, Helvetica, Arial, 'Open Sans', sans-serif";
            var str = dc.getDescription();
            
            var lineWidth = 0, lineGap = g.measureText('M').width;
            var canvasWidth = w-360;//计算canvas的宽度
            var initHeight=1650;//绘制字体距离canvas顶部初始的高度
            var lastSubStrIndex= 0; //每次开始截取的字符串的索引
            for(var i=0;i<str.length;i++){ 
                lineWidth+=g.measureText(str[i]).width; 
                if(lineWidth>canvasWidth){  
                    g.fillText(str.substring(lastSubStrIndex,i),150,initHeight);//绘制截取部分
                    initHeight += lineGap*1.5;//20为字体的高度
                    lineWidth=0;
                    lastSubStrIndex=i;
                } 
                if(i==str.length-1){//绘制剩余部分
                    g.fillText(str.substring(lastSubStrIndex,i+1),150,initHeight);
                }
            }
        }

        // 3.绘制图片
        var image = new Image(), self = this;
        // image.width = 180;
        image.onload = function () {
            g.drawImage(image, (self._realSize.width - image.width * 10) / 2, titleHeight+400, image.width * 10, image.height * 10);
            // self._billboard.invalidateTexture();
            callback && callback(canvas);
        }
        image.src = '../images/dc/dc_' + dc.getId() + '.png';
        
        return canvas;
    },
    getNode: function(){
    	return this._billboard;
    },
});
