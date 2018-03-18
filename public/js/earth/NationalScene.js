
 var NationalScene = function () {
    this.provinceAnimateDataMap = {};
    this._dcIconAnimates = {};
    this._dcImageAnimates = {};
    this.gotoFinish = false;
    this._dcNodeMap = {};
 }

mono.extend(NationalScene, Object, {
    init: function () {
        this.box = new twaver.ElementBox();
        this.network = new twaver.vector.Network(this.box);  
        this.flowLinkManager = new FlowLinkManager(this.network);
    },
    initView: function(parent){
        var obj = {};
        obj[it.util.i18n("AreaScene_Data_Center")] = {
            base: 10,
            items: {
                '2017': 6,
                '2016': 5,
                '2015': 3,
            }
        };
        obj[it.util.i18n("AreaScene_Building")] = {
            base: 50,
            items: {
                '2017': 25,
                '2016': 20,
                '2015': 15,
            }
        };
        obj[it.util.i18n("AreaScene_Rack")] = {     
            base: 200,
            items: {
                '2017': 169,
                '2016': 150,
                '2015': 100,
            }
        };
        this._$leftPanel = $('<div class="left-panel"></div>')
            .appendTo(parent)
            .itvDcTotal({
                data:obj
            }).css('left','-300px');
    },
    helloView: function(){
        this.network.setToolTipEnabled(true);
        var self = this;
        self._$leftPanel.itvDcTotal('reset');
        this._$leftPanel.animate({
            left: '10px', 
        }, 500,  function(){
            self._$leftPanel.itvDcTotal('start');
            setTimeout(function(){
                self.floatDcImages();
                for(var id in self._dcIconAnimates){
                    self._dcIconAnimates[id].play();
                }
            },600);
        });
    },
    byeView: function(callback){
        this.network.setToolTipEnabled(false);
        var self = this;
        this._$leftPanel.animate({
            left: '-300px', 
        }, 500, function(){
            callback && callback();
        });
        
        for(var id in self._dcImageAnimates){
            self._dcImageAnimates[id].stop(false);
        }
        self._dcImageAnimates = {};
        for(var id in self._dcIconAnimates){
            self._dcIconAnimates[id].stop(false);
        }
    },
 	initNetwork: function(parent){
        this.init();
 		parent = parent || document.body;
 		this.parent = parent;
		var box = this.box 
		var dcLayer = this.dcLayer = new twaver.Layer('dc');
        var dcImageLayer = this.dcImageLayer = new twaver.Layer('dcImage');
		var layerBox = box.getLayerBox();
        layerBox.add(dcImageLayer);
        layerBox.add(dcLayer);

        // twaver的tooltip全局设置
        twaver.Defaults.TOOLTIP_PADDING= 0;
        twaver.Defaults.TOOLTIP_BORDER= '';

		var network = this.network;
		// network.setEdgeDetect(true);
		// var map = new Map(network);
        eutils.getMap(network);
            
        //network.getView().style.backgroundImage = 'url(../images/background.jpg)';
        network.getView().style.backgroundImage = 'url(' + pageConfig.url('/images/background.jpg') + ')';
        network.getView().style.backgroundSize = 'cover';
		parent.appendChild(network.getView());
        this.adjustBounds();
		network.isMovable = function(n) {
			return !(n instanceof twaver.ShapeNode) && !n.getClient('dcIcon');
		}
		network.setDragToPan(false);
        network.isSelected = function(){
            return false;
        }
        network.setKeyboardRemoveEnabled(false);
        network.setRectSelectEnabled(false)
        network.setScrollBarVisible(false);   
        network.setWheelToZoom(false);
		network.setZoom(0.33);
		network.getElementBox().addDataPropertyChangeListener(this.handlerChangerListener, this);


        // box.setStyle('background.type', 'image');
        // box.setStyle('background.image','background');
        // box.setStyle('background.image.scope','viewport');
        // box.setStyle('background.image.stretch', 'fill');

 	},

    setData: function(data){
        this.data = data;
    },

    preload: function(parent) {
        // 为了背景能正常显示，否则，背景会随着动画移动
    	if(this._loaded){
    		this.reload();
            // this.adjustBounds();
    		return;
    	}
		this.initNetwork(parent);
        if (!dataJson.hideEarthScene) {
            //默认
		} else {
			this.adjustBounds();
		}      
		this.register();
		// this.loadDataCenter(dcLayer.getId());
		this.entranceAnimat();
    },
    
    register: function(){
    	this.readyImages();
    },

    reload: function(){
  //   	var w = document.documentElement.clientWidth;
		// var h = document.documentElement.clientHeight;
		// this.network.adjustBounds({ x: 0, y: 0, width: w, height: h });
        this.network.setZoom(0.33);
		this.entranceAnimat(true);
    },

    setBounds : function(bounds){
        this.bounds = bounds;
    },
    
    /**
     * 调整bounds
     * 注意，当this.bounds有值(没有初始化过)的话才需要调整
     */
    adjustBounds: function() {
        if (this.bounds) {
            var w = document.documentElement.clientWidth;
            var h = document.documentElement.clientHeight;
            var x = 0, y = 0;
            if (this.bounds.width) {
                w = this.bounds.width;
            }
            if (this.bounds.height) {
                h = this.bounds.height;
            }
            if (this.bounds.x) {
                x = this.bounds.x;
            }
            if (this.bounds.y) {
                y = this.bounds.y;
            }
            // var self = this;
            // setTimeout(function(){
            //     self.network.adjustBounds({ x: x, y: y, width: w, height: h});
            // },100);
            this.network.adjustBounds({ x: x, y: y, width: w, height: h});
            this.network.zoomOverview();
        }
    },
    moveCenter: function(network){
      var network = this.network, newZoom = network.getZoom(), zoom = newZoom;
      var offsetx = network.viewRect.width/2 - network._unionBounds.width/2*newZoom/zoom;
      var offsety = network.viewRect.height/2 - network._unionBounds.height/2*newZoom/zoom;
      network.setViewRect(network._unionBounds.x * newZoom/zoom - offsetx,network._unionBounds.y * newZoom/zoom - offsety,network.viewRect.width,network.viewRect.height);
    },
    calZoom: function() {
        var network = this.network;
        if (network._unionBounds.width <= 0 
            || network._unionBounds.width <= 0) {
              return;
          }
          var zoom = network.getZoom();
          var ub = network._unionBounds;
          var rw = ub.width / zoom;
          var rh = ub.height / zoom;
          var wzoom = network.viewRect.width / rw;
          var hzoom = network.viewRect.height / rh;
          var min = Math.min(wzoom, hzoom);
          
          return min;
    },
    entranceAnimat: function(reload){
    	var self = this;
        // this.network.setDragToPan(true);
        setTimeout(function(){
            self.moveCenter();
            var zoom = self.calZoom();
            new twaver.Animate({
                from: 0.3,
                to: zoom,
                dur: 1000,
                onUpdate: function(value) {
                    self.network.setZoom(value);
                },
                onDone: function(){
                    !reload && self.load();
                    // setTimeout(function(){
                    //     self.network.setDragToPan(false);
                    // },1000);
                    self.helloView();
                    
                }
            }).play();
        },100);
    },
    load: function(){
        this.initView(this.parent);
    	var self = this;
        // this.network.setDragToPan(false);
        this.loadDataCenter(this.dcLayer.getId());
        this.flowLinkManager.addLink(this._dcNodeMap);
        var hasProvince = function(ele,p){
            var pn = ele.getClient(p);
            if(!self.provinceMap[pn] || !self.provinceAnimateDataMap[pn]){
                return false;
            }
            return true;
        }       
    	self.network.addInteractionListener(function(event){
	        if(event.kind == "doubleClickElement"){
                var ele = event.element;
                if(ele instanceof twaver.ShapeNode){
                    if(!hasProvince(ele,'provinceName'))return;
                    self.byeView(function(){
                        self.retireScene(event.element);
                    });
                } else if(ele.getClient('dcImage')){
                    // self.gotoScene && self.gotoScene(ele.getClient('dcId'));
                    var iconNode = self.network.getElementBox().getDataById(ele.getClient('dcIconId'));
                    var dm = main.sceneManager.dataManager;
                    var dt = dm.getDataTypeForData(dm.getDataById(iconNode.getClient('dcId')));
                    if(!dt || !dt.getModel())return;
                    self.byeView(function(){
                        self.gotoAnimate(iconNode);
                    });
                } else if(ele.getClient('dcIcon')){
                    // var eles = self.network.getElementsAt(event.event);
                    // if(eles.size()>1 && (eles.get(1) instanceof twaver.ShapeNode)){
                    //     // self.retireScene(eles.get(1));
                    //     self.byeView(function(){
                    //         self.retireScene(eles.get(1));
                    //     });
                    // }
                    if(!hasProvince(ele,'province'))return;
                    self.byeView(function(){
                        self.retireScene(ele);
                    });
                    // self.gotoScene && self.gotoScene(ele.getClient('dcId'));
                    // self.gotoAnimate(ele);
                }
	        } else if(event.kind == "doubleClickBackground"){
                if (!dataJson.hideEarthScene) {
                    self.byeView(function(){
                        self.previous && self.previous();
                    });
                } else {
                    return;
                }             
	        };
	  	});
        self.network.getView().addEventListener('mousemove',function(e){
            var node = self.network.getElementAt(e);
            if(!node)return;
            if(node.getLayerId() == 'province'){
                self.network.getElementBox().getSelectionModel().setSelection(node);
            }

        });

        self.network.getView().addEventListener('mousedown',function(e){
            var node = self.network.getElementAt(e);
            if(!node)return;
            if(node.getClient('dcImage')){
                // console.log(node.getClient('dcId'));
                var animate = self._dcImageAnimates[node.getClient('dcId')];
                if(animate){
                    animate.stop(false);
                    self._lastDcImage = node;
                }
            } 
            
        });
        self.network.getView().addEventListener('mouseup',function(e){
            // var node = self.network.getElementAt(e);
            // if(!node)return;
            // if(node.getClient('dcImage')){
            //     eutils.float(node, eutils.getFloatPoint(node),self._dcImageAnimates);
            // }
            var node = self._lastDcImage;
            if(node){
                if(node.getClient('dcImage')){
                    node.setClient('originLoc', node.getCenterLocation());
                    eutils.float(node, eutils.getFloatPoint(node),self._dcImageAnimates);
                }
                self._lastDcImage = undefined;
            }
        });
        if(main.config.debug){
            self.network.addInteractionListener(function(event){
                if(event.kind.indexOf('click') >= 0){
                    var e = event.event;
                    console.log(event.kind, ' x: ',e.x, 'y: ', e.y)
                }
            });
        }
        // this.adjustBounds();
        var flowNodes = [];
        this.box.forEach(function(node){
            if(node.getClient('dcImage')){
                flowNodes.push(node);
            }
        });
        this._flowNodes = flowNodes;
        // var self = this;
        // this._dcImageAnimates = {};
        // flowNodes.forEach(function (dc) {
        //     dc.setClient('originLoc', dc.getCenterLocation());
        //     eutils.float(dc, eutils.getFloatPoint(dc),self._dcImageAnimates);
        // });
	  	this._loaded = true;
    },
    floatDcImages: function(){
        var self = this;
        this._flowNodes.forEach(function (dc) {
            var animate = self._dcImageAnimates[dc.getClient('dcId')];
            if(animate){
                animate.play();
            } else {
                dc.setClient('originLoc', dc.getCenterLocation());
                eutils.float(dc, eutils.getFloatPoint(dc),self._dcImageAnimates);
            }
            
        });
    },
    gotoAnimate: function(ele){
        if (this.gotoFinish)return;
        this.gotoFinish = true;
        var self = this, size = ele.getSize(),cl = ele.getCenterLocation(),
            val, dcId = ele.getClient('dcId'),
            dm = main.sceneManager.dataManager;
        var dt = dm.getDataTypeForData(dm.getDataById(dcId));
        if(!dt || !dt.getModel())return;

        var node = new twaver.Node();
        node.setImage('node');
        node.setSize(0, 0);
        node.setCenterLocation(cl.x, cl.y);
        node.setLayerId(this.dcLayer.getId());
        this.box.add(node);

        var animate = new twaver.Animate({
            from: 0,
            to : 1,
            dur: 1000,
            onUpdate: function(value){
                val = value*100;
                node.setSize(size.width * val, size.height * val);
                node.setCenterLocation(cl.x, cl.y);
            },
            onDone : function(){
                self.gotoScene && self.gotoScene(dataJson.gotoID ||dcId);
                // ele.setSize(size.width, size.height);
                // ele.setCenterLocation(cl.x, cl.y);
                self.box.removeById(node.getId());
            }
        });
        animate.play();
    },
    
    retireScene: function(element) {
    	var network = this.network, box = this.box, self = this,
            focusNode = this.lastFocusNode = element,
            center = element.getCenterLocation(), 
            zoom = network.getZoom(), size = network.getViewRect(),
    	    point = {
        		x: center.x * zoom,
        		y: center.y * zoom,
        	};
    	var provinceName = focusNode.getClient('provinceName') || focusNode.getClient('province');
    	// console.log(provinceName);
        if(!this.provinceMap[provinceName])return;
    	var animateData = this.provinceAnimateDataMap[provinceName];

    	if(!animateData){
    	  return;
    	}
        // network.setDragToPan(true);
        network.setViewRect(-size.width/2+point.x,-size.height/2 + point.y,size.width,size.height);
    	var oldZoom = this.lastZoom = network.getZoom();
    	var newZoom = animateData.zoomValue || 6;
    	var animate = new twaver.Animate({
    	    from: 0,
    	    to : 1,
    	    dur:1000,
    	    onUpdate: function(value){
    	        network.setZoom(oldZoom + (newZoom - oldZoom ) * value);
    	        box.forEach(function(node){
    	            if(node == focusNode){
    	              node.setStyle('vector.outline.color', 'rgba(71,174,255,'+ (0.3 + 0.7 * value)+')');
    	            }else{
    	              node.setStyle('vector.outline.color', 'rgba(71,174,255,'+ (0.3 - 0.3 * value)+')');
    	            }
    	        });
    	    },
    	    onDone : function(){
    	        self.next && self.next(provinceName, self.provinceMap[provinceName]);
                // network.zoomOverview();
                // setTimeout(function(){
                //     network.setDragToPan(false);
                // },1000);
    	    }
    	});
    	animate.play();
    },
    back: function(province){
        $(this.parent).show('fast');
    	var network = this.network, box = this.box, self = this,
    		focusNode = this.lastFocusNode, vr, ub;
    	if(network){
    		vr = network.getViewRect();
    		ub = network.getUnionBounds();
    	}
    	if(!this._loaded){
    		this.initNetwork(this.parent);
    		this.load();
    		network = this.network;
    		box = network.getElementBox();
    		vr = network.getViewRect();
    		
            // 当从园区退回时不需要back
            if(!province){
                network.setZoom(1);
                setTimeout(function(){
                    network.zoomOverview(twaver.Defaults.ZOOM_ANIMATE);
                    self.helloView();
                },100);
                return;
            }
    		var animateData = this.provinceAnimateDataMap[province];
    		box.forEach(function(node){
	            if(node.getClient('provinceName') == province){
	            	focusNode = node;
	            }
	        });
	        var loc = eutils.getScreenLoc(network, focusNode);
    		network.setZoom(animateData.zoomValue || 5,loc);
	        box.forEach(function(node){
	            if(node.getClient('provinceName') == province){
	            	node.setStyle('vector.outline.color', 'rgba(71,174,255,1)');
	            }else{
	            	node.setStyle('vector.outline.color', 'rgba(71,174,255,0)');
	            }
	        });
	        // network.moveElementsToCenter();
    	}
    	// ub = this.unionBounds || network.getUnionBounds();
    	// var offsetx = vr.width/2 - ub.width/2;
	    // var offsety = vr.height/2 - ub.height/2;
    	// network.setDragToPan(true);
    	var oldZoom = network.getZoom();
    	var newZoom = this.lastZoom;
        // var vr = network.getViewRect();
        // network.setViewRect(self.bounds.x,self.bounds.y,vr.width,vr.height);
    	var animateZoom = new twaver.Animate({
    	    from: 1,
    	    to : 0,
    	    dur:1000,
    	    onUpdate: function(value){
    	        network.setZoom(newZoom + (oldZoom - newZoom ) * value);
                // network.viewRect.x = self.bounds.x + (network.viewRect.x - self.bounds.x)*value;
                // network.viewRect.y = self.bounds.y + (network.viewRect.y - self.bounds.y)*value;
    	        box.forEach(function(node){
    	            if(node == focusNode){
    	              node.setStyle('vector.outline.color', 'rgba(71,174,255,'+ (0.3 + 0.7 * value)+')');
    	            }else{
    	              node.setStyle('vector.outline.color', 'rgba(71,174,255,'+ (0.3 - 0.3 * value)+')');
    	            }
    	        });
    	        // network.setViewRect(ub.x - offsetx*(1-value),ub.y - offsety*(1-value),vr.width,vr.height);
    	    },
    	    onDone: function(){
    	    	// network.moveElementsToCenter();
    	    	vr = network.getViewRect();
    	  //   	ub = network.getUnionBounds();
    	  //   	var offsetx = vr.width/2 - ub.width/2;
	    		// var offsety = vr.height/2 - ub.height/2;
                // ub = network.getUnionBounds();
                // var offsetx = vr.x + (self.bounds.x - vr.x);
                // var offsety = vr.y + (self.bounds.y - vr.y);
    // 	    	new twaver.Animate({
				//     from: 0,
				//     to : 1,
				//     dur: 500,
				//     onUpdate: function(value){
				//         // network.setViewRect(ub.x - offsetx*value,ub.y - offsety*value,vr.width,vr.height);
    //                     network.setViewRect(vr.x + (self.bounds.x - vr.x)*value,vr.y + (self.bounds.y - vr.y)*value,vr.width,vr.height);
				//     },
    //                 onDone: function(){
    //                     // setTimeout(function(){
    //                         // network.setDragToPan(false);
    //                         setTimeout(function(){
    //                             self.helloView();
    //                         },1000);
    //                     // },100); 
    //                     // network.setViewRect(self.bounds.x,self.bounds.y,vr.width,vr.height); // add by Kevin 2017-09-01
    //                 }
				// }).play();

                setTimeout(function(){
                    network.zoomOverview(twaver.Defaults.ZOOM_ANIMATE);
                    self.helloView();
                },100);
                       
    	    }
    	});
        
        // var animateResetRect = new twaver.Animate({
        //             from: 0,
        //             to : 1,
        //             dur: 1000,
        //             onUpdate: function(value){
        //                 // network.setViewRect(ub.x - offsetx*value,ub.y - offsety*value,vr.width,vr.height);
        //                 network.setViewRect(vr.x + (self.bounds.x - vr.x)*value,vr.y + (self.bounds.y - vr.y)*value,vr.width,vr.height);
        //             },
        //             onDone: function(){
        //                 // setTimeout(function(){
        //                     network.setDragToPan(false);
        //                 // },100); 
        //                 // network.setViewRect(self.bounds.x,self.bounds.y,vr.width,vr.height); // add by Kevin 2017-09-01
        //             }
        // });
        
    	// animate.play();
        // animateZoom.chain(animateResetRect);
        animateZoom.play();


    },

	readyImages: function() {
		// var utils = itv.utils;
		// eutils.registerImage('../images/background.jpg', this.network);
		eutils.registerImage(pageConfig.url('/images/nodebg.png'), this.network);
		eutils.registerImage(pageConfig.url('/images/dc/dc001.png'), this.network);
		eutils.registerImage(pageConfig.url('/images/dc/dc002.png'), this.network);
        eutils.registerImage(pageConfig.url('/images/node.png'), this.network);
        var snSize = 60;
        eutils.registerImage(pageConfig.url('/images/select-node.png'), 'select-node', this.network, false, snSize,snSize);
        twaver.Util.registerImage('plate-node', {
            w: 100,
            h: 100,
            v: [
                {
                    shape: 'draw',
                    angle: 0,
                    draw: function (g, data, view) {
                        var angle = data.getClient('angle') || 0;
                        g.scale(1,0.4);
                        g.rotate(angle);
                        g.drawShape({
                            shape: 'vector',
                            name: 'select-node',
                            w: snSize, h: snSize,
                            x: -snSize/2, y: -snSize/2,
                        });
                        
                    }
                },
                {
                    shape: 'vector',
                    name:'node',
                    w: 55, h: 54,
                    x: -27, y:-50
                }

            ]
        });

		twaver.Util.registerImage('employee', {
           w: 269,
           h: 168,
           cache: false,
           origin: { x: 0, y: 0 },
           v: [{
                  shape: 'image',
                  name: '',
                  x: 0,
                  y: 0,
                  name: 'nodebg'
               },
               {
                  shape: 'image',
                  name: '',
                  x: 10,
                  y: 60,
                  name: function(node){
                    // return 'dc_'+node.getId();
                    return node.getClient('nodeImage');
                  }//'dc001'
               },
               {
                  shape: 'text',
                  text: '<%=getClient("text")%>',
                  font: '18px "Microsoft Yahei"',
                  fill: 'white',
                  x: 90,
                  y: 30,
               }
           ],
        });
        twaver.Util.registerImage('glowCircle', {
            w: 36,
            h: 36,      
            v: [{
                shape: 'circle',
                cx: 0,
                cy: 0,
                r: 20,
                // lineWidth: 2,
                lineColor:'#3E9FEA',
                // alpha:0.8,
                fill: '#3E9FEA',
                gradient: {
                    type: 'radial.center',
                    color: '#042445'
                },
            },{
                shape: 'draw',
                draw: 'scale'
            },{
                shape: 'circle',
                cx:0,
                cy:0,
                r:0,
                lineColor:'#3E9FEA',
                fill:'#3E9FEA',
                // alpha:0.8,
                gradient: {
                    type: 'radial.center',
                    color: '#042445'
                },
                animate: [{
                    attr: 'r',
                    to: 20,
                    dur: 1500,
                    reverse: false,
                    repeat: Number.POSITIVE_INFINITY
                }]      
            }]
        });

        twaver.Util.registerImage('glow_node', {
            w: 40,
            h: 40,
            cache: false,
            v: [
            {
                shape: 'vector',
                name:'glowCircle',
                scale: [2,1],
                w:27,h:27
            },
            {
                shape: 'vector',
                name:'node',
                w: 55, h: 54,
                x: -27, y:-50
            }]
        });
	},

	handlerChangerListener: function(e) {
	 	if (e.property == 'location') {
	     	var node = e.source,
	        	location = e.newValue;
	    	if (node.getImage() && node.getImage() == 'employee')
	        	this.changeLinkOffset(node, location);
	 	}
	},

    changeLinkOffset: function(node, location) {
		var location = location || node.getLocation();
		var link = node.getToLinks().get(0);
		var fromLocation = link.getFromNode().getCenterLocation();
		var size = node.getSize();
		var w = size.width,
			h = size.height;
        if (location.x + w / 2 < fromLocation.x && location.y + h / 2 < fromLocation.y) {
           link.setStyle('link.to.xoffset', w / 2);
           link.setStyle('link.to.yoffset', h / 2);
        } else if (location.x + w / 2 > fromLocation.x && location.y + h / 2 < fromLocation.y) {
           link.setStyle('link.to.xoffset', -w / 2);
           link.setStyle('link.to.yoffset', h / 2);
        } else if (location.x + w / 2 < fromLocation.x && location.y + h / 2 > fromLocation.y) {
           link.setStyle('link.to.xoffset', w / 2);
           link.setStyle('link.to.yoffset', -h / 2);
        } else if (location.x + w / 2 > fromLocation.x && location.y + h / 2 > fromLocation.y) {
           link.setStyle('link.to.xoffset', -w / 2);
           link.setStyle('link.to.yoffset', -h / 2);
        }
    },
    createDataCenter: function(layerId, loc, dc) {
        var node = new twaver.Node();
        // node.setImageUrl('../images/node.png');
        node.setImage('plate-node');
        // node.setSize(40, 45);
        node.setCenterLocation(parseInt(loc.x), parseInt(loc.y));
        node.setLayerId(layerId);
        node.setClient('dcIcon', true);
        node.setClient('dcId', dc.getId());
        if(dc.getExtend()){
            node.setClient('province',dc.getExtend().province);
        }
        var animate = new twaver.Animate({
            from: 0,
            to: 2*Math.PI,
            dur: 2000,
            reverse: false,
            repeat: Number.MAX_VALUE,
            onUpdate: function(v){
                node.setClient('angle',v);
            }
        });
        // animate.play();
        this._dcIconAnimates[dc.getId()] = animate;
        this._dcNodeMap[dc.getId()] = node;
        return node;
    },
    createDataCenterImage: function(layerId, loc, dc, hideImg) {
        if (hideImg) return;
        var id = dc.getId();
        var imgSrc = '';
        var imgName = '';
        //使用时先注册，后使用。
        //分两种情况，如果传入的dc扩展有图片路径，则直接用该路径，如果没有则用默认的图片
        //默认图片分两种情况，有数据用dc002，没数据用dc001
        // eutils.registerImage(pageConfig.url('/images/dc/dc_'+id+'.png'), this.network);
        if(dc._extend){
            if(dc._extend.boardImage){
                imgSrc = dc._extend.boardImage;
            }
        }
        if(imgSrc){
            imgName = eutils.registerImage(pageConfig.url('/images/dc/'+imgSrc), this.network);
        }else{
            //判断dc是否有数据，以下两种情况任意一种满足都可以
            //1、data有children  2、datatype有模型
            var dt,dtId,dtModel,childrenSize;
            dtId = dc._dataTypeId;
            if(!dtId) return;
            dt = main.sceneManager.dataManager.getDataTypeById(dtId);
            if(!dt) return;
            dtModel = dt.getModel();
            childrenSize = dc.getChildren().size();
            if(dtModel || childrenSize){
                imgName = 'dc001';
            }else{
                imgName = 'dc002';
            }
        }
       
        var node2 = new twaver.Node(id);
        node2.setImage('employee');
        node2.setSize(215.2, 134.4);
        node2.setClient('text', dc.getName());
        node2.setCenterLocation(loc.x, loc.y);
        node2.setLayerId(layerId);
        node2.setClient('dcImage', true);
        node2.setClient('nodeImage', imgName);
        node2.setClient('dcId', dc.getId());
        return node2;
    },
    createLink: function(from, to, hideLink) {
        if (hideLink) return;
        var link = new twaver.Link(from, to);
        var w = to.getWidth(),
           h = to.getHeight();
        link.setStyle('arrow.from.at.edge', false);
        // link.setStyle('link.from.xoffset', -2);
        // link.setStyle('link.from.yoffset', 16);
        link.setStyle('arrow.to.at.edge', true);
        link.setStyle('link.width', 1);
        return link;
    },
    loadDataCenter: function(layerId) {
        var dcs = this.data;
        if(!dcs)return;
        var dc, pos, boardPos, ext, pdcs, hideImg;
            provinceMap = this.provinceMap = {};
        for(var i=0;i<dcs.length;i++){
            dc = dcs[i];
            pos = dc.getPosition2d();
            ext = dc.getExtend();
            if(ext){
                boardPos = ext.boardPos?ext.boardPos:{x:0,y:0};
                if(ext.province){
                    pdcs = provinceMap[ext.province] || [];
                    pdcs.push(dc);
                    provinceMap[ext.province] = pdcs
                };
                hideImg = ext.hideImg ? ext.hideImg : false;
            }else{
                boardPos = {x:0,y:0};
            }
            var node = this.createDataCenter(layerId, pos, dc);
            this.scaleNode(node);
            this.box.add(node);
            var nodeImage = this.createDataCenterImage(this.dcImageLayer.getId(), boardPos, dc, hideImg);
            if (nodeImage) {
                nodeImage.setClient('dcIconId', node.getId());
                this.scaleNode(nodeImage);
                this.box.add(nodeImage);
            };         
            var link = this.createLink(node, nodeImage, hideImg);
            if (link) {
                this.scaleNode(link);
                this.box.add(link);
                this.changeLinkOffset(nodeImage);
            };
        }
    },
    scaleNode: function(node) {
        if (!dataJson.mapNodeSize || !dataJson.resourceMap) return;
        var size = dataJson.mapNodeSize;
        if (node instanceof twaver.Node) {
            var width = node.getWidth(),
                height = node.getHeight();
            node.setSize(width * size, height * size);
        } else if (node instanceof twaver.Link) {
            var linkWidth = node.getStyle('link.width');
            node.setStyle('link.width', linkWidth * size);
        };
    },
    dispose: function(delay){
        delay = delay || 100;
        var self = this;
        setTimeout(function(){
            if (!self.network)return;
            self.network.dispose();
            self.gotoFinish = false;
	        self.network = undefined;
	        self.box = undefined;
	        self.dcLayer = undefined;
	        self._loaded = undefined;
	        self.lastFocusNode = undefined;
	        window.onresize = undefined;
	        $(self.parent).hide().empty();
        },delay);
       
    }
 });

NationalScene = NationalScene;