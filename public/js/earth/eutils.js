
/*
itv.utils.initFrame = function(title){
  var topPanel = $('<div class="top_line">'+
                      '<div class="line line_left"></div>'+
                      '<div class="line_center line_gb">'+
                          '<span class="line_span">'+title+'</span>'+
                      '</div>'+
                      '<div class="line line_right"></div>'+
                   '</div>');
  var bottomPanel = $('<div class="bottom_line">'+
                          '<div class="line line_left"></div>'+
                          '<div class="line_center">'+
                              '<span class="line_span"> 2007-03-02  <i></i>  12:22:32</span>'+
                          '</div>'+
                          '<div class="line line_right"></div>'+
                      '</div>');

  $('body').append(topPanel);
  $('body').append(bottomPanel);
  var titleWidth = $('.line_center').width();
  var lineWidth = ($('body').width() - titleWidth + 80 )/2;

  $('.line').css("width",lineWidth*2/3+'px');
  $('.line_left').css('left',lineWidth/3+'px');
  $('.line_right').css('right',lineWidth/3+'px');
}
*/

// itv.utils.decodePolygon = function(coordinate, encodeOffsets) {
//   var result = [];
//   var prevX = encodeOffsets[0];
//   var prevY = encodeOffsets[1];

//   for (var i = 0; i < coordinate.length; i += 2) {
//     var x = coordinate.charCodeAt(i) - 64;
//     var y = coordinate.charCodeAt(i + 1) - 64;
//     // ZigZag decoding
//     x = (x >> 1) ^ (-(x & 1));
//     y = (y >> 1) ^ (-(y & 1));
//     // Delta deocding
//     x += prevX;
//     y += prevY;

//     prevX = x;
//     prevY = y;
//     // Dequantize
//     result.push([x / 1024, y / 1024]);
//   }
//   return result;
// }

// itv.utils.decode = function(json) {
//   var self = this;
//   if (!json.UTF8Encoding) {
//     return json;
//   }
//   var features = json.features;

//   for (var f = 0; f < features.length; f++) {
//     var feature = features[f];
//     var geometry = feature.geometry;
//     var coordinates = geometry.coordinates;
//     var encodeOffsets = geometry.encodeOffsets;

//     for (var c = 0; c < coordinates.length; c++) {
//       var coordinate = coordinates[c];

//       if (geometry.type === 'Polygon') {
//         coordinates[c] = itv.utils.decodePolygon(coordinate, encodeOffsets[c]);
//       } else if (geometry.type === 'MultiPolygon') {
//         for (var c2 = 0; c2 < coordinate.length; c2++) {
//           var polygon = coordinate[c2];
//           coordinate[c2] = itv.utils.decodePolygon(polygon, encodeOffsets[c][c2]);
//         }
//       }
//     }
//   }
//   // Has been decoded
//   json.UTF8Encoding = false;
//   return json;
// }

if (!window.eutils) {
    window.eutils = {};
}

eutils.getMap = function(network){
  if(!eutils.map){
    eutils.map = new Map();
  }
  var mapBox = eutils.map.getDataBox();
  var box = network.getElementBox();
  mapBox.forEach(function(node){
    box.add(node);
  });
  
}

eutils.convertPoint = function(point,xzoom,yzoom,xoffset, yoffset) {
  var xzoom= xzoom || 100,
      yzoom = yzoom || 100,
      xoffset = xoffset || 118,
      yoffset = yoffset || 32;
  return {
    x: (point[0] - xoffset) * xzoom,
    y: (-point[1] + yoffset) * yzoom
  };
},

eutils.generateAreaImage = function(points){
	var rect = make.Utils3D.getRectOfPoints(points);
	var min = rect.min;
	var canvas = document.createElement('canvas');
	var font = font || "bold 80px 微软雅黑,sans-serif";

	var context = canvas.getContext('2d');
	var w = rect.width, h = rect.height;
	var drawRect = { width: w, height: h };
	canvas.width = w, canvas.height = h;

  context.save();
  context.strokeStyle =  '#40A4FB';
  context.lineWidth = 2;
  context.lineJoin="round";

  var gradient = context.createLinearGradient(0, 0 , w, h);
  gradient.addColorStop(0, 'rgba(36,74,121,1)');
    gradient.addColorStop(1, 'rgba(0, 181, 202,1)');
    context.fillStyle = gradient;

  context.shadowColor = '#83c3ff';
    context.shadowBlur = 10;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;

  context.beginPath();
  context.translate(-min.x, -min.y);
  for(var i = 0; i < points.length; i++){
  	var point = points[i];
  	if(i == 0){
  		context.moveTo(point[0], point[1]);
  	}else{
  		context.lineTo(point[0], point[1]);
  	}
  }
  context.closePath();
  context.fill();
  context.stroke();
  context.stroke();
  context.stroke();
  context.stroke();
  
	context.restore();
	canvas.drawRect = drawRect;
	// console.log(window.open(canvas.toDataURL()));

	var newcanvas = document.createElement('canvas');
	var fHeight = mono.Utils.nextPowerOfTwo(h);
    var fWidth = mono.Utils.nextPowerOfTwo(w);
    // newcanvas.rotate = Math.PI/2;
    newcanvas.width = fWidth;
    newcanvas.height = fHeight;
    newcanvas.style.width = fWidth;
    newcanvas.style.height = fHeight;

    var newctx=newcanvas.getContext("2d");
    newctx.clearRect(0, 0, fWidth, fHeight);
    //绘制一个和缩放之后的地板大小的矩形
    newctx.fillStyle = 'white';
    newctx.fillRect(0, 0, fWidth, fHeight);
    newctx.translate(fHeight/2,fWidth/2);//将绘图原点移到画布中点
    newctx.rotate((Math.PI/180)*5);//旋转角度
    newctx.translate(-fHeight/2,-fWidth/2);//将画布原点移动
    newctx.drawImage(canvas,0,0,w,h,0,0,fWidth,fHeight);
    // window.open(newcanvas.toDataURL("image/png"));
    return newcanvas;
    
}

/* 计算两点之间的距离，如果距离小于所给的距离，返回true，否则false*/
eutils.isIngorePoints = function(point, lastPoint, distance){
  var dis = Math.sqrt((point[0] - lastPoint[0])*(point[0] - lastPoint[0]) + (point[1] - lastPoint[1]) * (point[1] - lastPoint[1]));
  return dis < distance;
}

eutils.getImageName = function (url) {
    var index = url.lastIndexOf('/');
    var name = url;
    if (index >= 0) {
        name = url.substring(index + 1);
    }
    index = name.lastIndexOf('.');
    if (index >= 0) {
        name = name.substring(0, index);
    }
    return name;
},

eutils.registerImage = function (url, name, network, svg, w,h) {
  if(!url)return;
  if(arguments[1] && typeof(arguments[1]) === 'string'){
    name = arguments[1];
    network = arguments[2];
    svg = arguments[3]
  } else {
    name = undefined;
    network = arguments[1];
    svg = arguments[2]
  }
  var self = this, name = name || eutils.getImageName(url);
    var image = new Image();
    image.onload = function () {
        twaver.Util.registerImage(name, image, w || image.width, h || image.height, svg === true);
        image.onload = null;
        network && network.invalidateElementUIs();
    };
    image.src = url;
    return name;
}

// this.network.getFirstElementByMouseEvent(event, false,filterFunction);

eutils.findFirstObjectByMouse = function(network, e , filter) {
    var objects = network.getElementsByMouseEvent(e);
    if (objects.length) {
        for (var i = 0; i < objects.length; i++) {
            var first = objects[i];
            var object3d = first.element;
            if (filter(object3d, first.point)) {
                return object3d;
            }
        }
    }
    return 0;
}

/*
var  provinceAnimateDataMap = {},padm = provinceAnimateDataMap;
itv.utils.generateProvinceAnimateDataMap = function(){
      padm["安徽"]  = {
         zoomValue:  6,
         // cameraPos:[228, 227, 356],
         cameraPos:[1000, 750, 686.04],
         cameraTarget:[-135,0,34]
      };
}
*/
eutils.getProvinceAnimateData = function() {
    var provinceAnimateDataMap = {};
    provinceAnimateDataMap["安徽"] = {
        zoomValue: 6,
        // cameraPos:[228, 227, 356],
        cameraPos: [1000, 750, 686.04],
        cameraTarget: [-135, 0, 34]
    };
    provinceAnimateDataMap["四川"] = {
        zoomValue: 6,
        // cameraPos:[228, 227, 356],
        cameraPos: [1000, 750, 686.04],
        cameraTarget: [-135, 0, 34]
    };
    provinceAnimateDataMap["贵州"] = {
        zoomValue: 6,
        // cameraPos:[228, 227, 356],
        cameraPos: [35.47, 316.3, 385.61],
        cameraTarget: [0, 0, 0]
    };
    provinceAnimateDataMap["新疆"] = {
        zoomValue: 6,
        // cameraPos:[228, 227, 356],
        cameraPos: [73.5, 655.46, 799.1],
        cameraTarget: [0, 0, 0]
    };
    return provinceAnimateDataMap;
}

eutils.getScreenLoc = function(network,currentElement){
  var cx = network.getViewRect().x;
  var cy = network.getViewRect().y;
  var cl = currentElement.getCenterLocation();
  var w = currentElement.getWidth();
  var h = currentElement.getHeight();
  var zoom = network.getZoom();
  var left = cl.x * zoom + (-cx);
  var top = cl.y * zoom + (-cy);
  return {x: left, y: top};
}

eutils.provinceNameMap = {
  "贵州": 'guizhou',
  "安徽": "anhui",
  "新疆": "xinjiang"
}

//转换弧度
eutils.rads = function (x) {
  return Math.PI * x / 180;
}

eutils.getFloatPoint = function (dc) { //动画移动的中心点
    var ol = dc.getClient('originLoc');
    var radius = Math.random() * (dataJson.dcFloatRadius || 100);
    var angle = Math.random() * 360;
    var x = Math.cos(eutils.rads(angle)) * radius;
    var y = Math.sin(eutils.rads(angle)) * radius;
    return { x: x + ol.x, y: y + ol.y };
}
eutils.float = function (dc, p, cache) { //创建动画移动 board 
    var self = this, loc = dc.getCenterLocation();
    var cx = p.x - loc.x, cy = p.y - loc.y;
    var tx = loc.x, ty = loc.y;
    var animate = new twaver.Animate({
        play: true, //自动播放
        // reverse: true,
        repeat: 1,
        dur: 4000,
        from: 0,
        to: 1,
        easing: 'easeOut',
        onUpdate: function (v) {
            dc.setCenterLocation(tx + cx * v, ty + cy * v);
        },
        onDone: function () {
            eutils.float(dc, eutils.getFloatPoint(dc), cache);
        }
    });
    cache[dc.getClient('dcId')] = animate;
    animate.play();
    return animate;
}

eutils.get3dFloatPoint = function (dc, limit) { //动画移动的中心点
    var ol = dc.getClient('originLoc');
    var radius = Math.random() * 20;
    var angle = Math.random() * 360;
    var x = Math.cos(eutils.rads(angle)) * radius;
    var y = Math.sin(eutils.rads(angle)) * radius;
    var z = x;
    if(limit && limit.x && Math.abs(x + ol.x)>Math.abs(limit.x)){
      return eutils.get3dFloatPoint(dc, limit);
    }
    return { x: x + ol.x, y: y + ol.y, z: z + ol.z };
}
eutils.float3d = function (dc, p, handler, cache, limit) { //创建动画移动 board 
    if(!handler)return;
    var self = this, loc = dc.getPosition();
    var cx = p.x - loc.x, 
        cy = p.y - loc.y,
        cz = p.z - loc.z,
        tx = loc.x, 
        ty = loc.y,
        tz = loc.z;
    var animate = new twaver.Animate({
        play: true, //自动播放
        // reverse: true,
        repeat: 1,
        dur: 4000,
        from: 0,
        to: 1,
        easing: 'easeOut',
        onUpdate: function (v) {
            // dc.setCenterLocation(tx + cx * v, ty + cy * v);
            handler(tx + cx * v, ty + cy * v, tz + cz * v);
        },
        onDone: function () {
            eutils.float3d(dc, eutils.get3dFloatPoint(dc,limit), handler, cache,limit);
        }
    });
    animate.play();
    cache[dc.getClient('dcId')] = animate;
    return animate;
}


