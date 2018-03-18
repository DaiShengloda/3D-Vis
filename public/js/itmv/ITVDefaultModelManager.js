
var $ITVDefaultModelManager = function(){
   
    this.init();	
};

mono.extend($ITVDefaultModelManager,Object,{

	init : function(){
		this.registeLayer();
		this.registeLayerGroup();
		this.registeConfigItem();
	},

    /**
     * 注册一个内置的默认的层模型 
     */
	registeLayer: function() {
		make.Default.register('twaver.itv.default_layer', function(json,callback) {
			var width = json.width || 4000,
				height = json.height || 20,
				depth = json.depth || 2000,
				radius = json.radius || 200,
				color = json.color || '#164478',
				opacity = json.opacity||0.5;

			var centerNode = new mono.Cube({
				width: width,
				height: height,
				depth: depth,
			});
			centerNode.s({
				'm.type': 'phong',
				'm.color': color
			});

			var leftNode = new mono.Cube({
				width: radius,
				height: height,
				depth: depth,
			});
			leftNode.s({
				'm.type': 'phong',
				'm.color': color
			});
			leftNode.p(-width / 2 - radius / 2, 0, 0);


			var rightNode = new mono.Cube({
				width: radius,
				height: height,
				depth: depth,
			});
			rightNode.s({
				'm.type': 'phong',
				'm.color': color
			});
			rightNode.p(width / 2 + radius / 2, 0, 0);


			var topNode = new mono.Cube({
				width: width,
				height: height,
				depth: radius,
			});
			topNode.s({
				'm.type': 'phong',
				'm.color': color
			});
			topNode.p(0, 0, -depth / 2 - radius / 2);


			var bottomNode = new mono.Cube({
				width: width,
				height: height,
				depth: radius,
			});
			bottomNode.s({
				'm.type': 'phong',
				'm.color': color
			});
			bottomNode.p(0, 0, depth / 2 + radius / 2);

			var leftTopCylinder = new mono.Cylinder({
				radiusTop: radius,
				radiusBottom: radius,
				height: height,
				arcLength: Math.PI / 2, //圆柱的圆弧所占长度
				arcStart: Math.PI //圆弧开始的角度
			});

			leftTopCylinder.s({
				'm.type': 'phong',
				'm.color': color
			});
			leftTopCylinder.p(-width / 2, 0, -depth / 2);

			var rightTopCylinder = new mono.Cylinder({
				radiusTop: radius,
				radiusBottom: radius,
				height: height,
				arcLength: Math.PI / 2, //圆柱的圆弧所占长度
				arcStart: Math.PI / 2 //圆弧开始的角度
			});

			rightTopCylinder.s({
				'm.type': 'phong',
				'm.color': color
			});
			rightTopCylinder.p(width / 2, 0, -depth / 2);

			var leftBottomCylinder = new mono.Cylinder({
				radiusTop: radius,
				radiusBottom: radius,
				height: height,
				arcLength: Math.PI / 2, //圆柱的圆弧所占长度
				arcStart: Math.PI * 3 / 2 //圆弧开始的角度
			});

			leftBottomCylinder.s({
				'm.type': 'phong',
				'm.color': color
			});
			leftBottomCylinder.p(-width / 2, 0, depth / 2);

			var rightBottomCylinder = new mono.Cylinder({
				radiusTop: radius,
				radiusBottom: radius,
				height: height,
				arcLength: Math.PI / 2, //圆柱的圆弧所占长度
				arcStart: 0 //圆弧开始的角度
			});

			rightBottomCylinder.s({
				'm.type': 'phong',
				'm.color': color
			});
			rightBottomCylinder.p(width / 2, 0, depth / 2);

			var combo = new mono.ComboNode([centerNode, leftNode, rightNode, topNode, bottomNode, leftTopCylinder, rightTopCylinder, leftBottomCylinder, rightBottomCylinder], ['+'], true);
			combo.width = width;
			combo.height = height;
			combo.depth = depth;
			if (opacity) {
				combo.s({
					'm.transparent': true,
					'm.opacity': 0.5
				});
			}
			callback && callback(combo);
			return combo;
		});
	},

    /**
     * 注册层上的group的模型
     */
	registeLayerGroup : function(){
		make.Default.register('twaver.idc.default.group', function (json,callback) {
		var radius = json.radius||250,
			height = json.height||10,
			color = json.color||'rgb(189,255,255)',
			opacity = json.opacity||1;
		var cylinder1 = new mono.Cylinder({
			radiusTop: radius,
			radiusBottom:radius,
			height: height,
			// depth: depth,
			segmentsR:100
		});
		cylinder1.s({
			'm.type': 'phong',
			'm.color': color,
			'm.ambient': color
		})
		var cylinder2 = new mono.Cylinder({
			radiusTop: radius+20,
			radiusBottom:radius+20,
			height: height,
			depth: depth,
			segmentsR:100
		});
		cylinder2.s({
			'm.type': 'phong',
			'm.color': color,
			'm.ambient': color
		})
		var cylinder3 = new mono.Cylinder({
			radiusTop: radius+20,
			radiusBottom:radius+40,
			height: height,
			depth: depth,
			segmentsR:100
		});
		cylinder3.s({
			'm.type': 'phong',
			'm.color': color,
			'm.ambient': color
		})

		var csg1=new mono.CSG(cylinder1);
		var csg2=new mono.CSG(cylinder2);
		var csg3=new mono.CSG(cylinder3);
		var csg=csg3.substract(csg2).union(csg1).toMesh();
		if (opacity) {
			csg.s({
				'm.transparent': true,
				'm.opacity': opacity 
			});
		}
		callback && callback(csg)
		return csg;
	});
	},

    /**
     * 注册默认的配置项模型
     */
	registeConfigItem : function(){
		make.Default.register('twaver.itv.default_configItem', function (json,callback) {
		var color = json.color;
		var node = new mono.Cube({
			width: json.width || 50,
			height: json.height || 50,
			depth: json.depth || 5
		});
		node.s({
			'm.type': 'phong',
			'm.color': color,
			'm.ambient': color,
			'm.texture.anisotropy': 16,
		});
		if (json.opacity) {
			node.s({
				'm.transparent': true,
				'm.opacity': json.opacity
			});
		}
		callback && callback(node);
		return node;
	});
	},

});

it.ITVDefaultModelManager = $ITVDefaultModelManager;


