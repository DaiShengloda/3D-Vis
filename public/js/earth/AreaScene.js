
var AreaScene = function() {
    this.init();
    this.dcMap = {};
    this._dcImageAnimates = {};
    this._dcAnimates = {};
    this._dcEles = {};
    this._plateAnimates = {};

    var w = document.body.clientWidth, floatLimit;
    if(w<=1440){
        floatLimit = {x: -70.2};
    } else if(w>1440 && w<=1919){
        floatLimit = {x: -70.2};
    } else if(w>1919){
    }
    this._floatLimit = floatLimit;
}

mono.extend(AreaScene, Object, {

    init: function() {
        this.network = new mono.Network3D();
        var network = this.network;
        this.box = this.network.getDataBox();
        this.camera = new mono.PerspectiveCamera(30, 1.5, 10, 20000);
        this.camera.p(0, 693, 1);
        this.camera.lookAt(0, 0, 0);
        this.network.setCamera(this.camera);
        this.network.setClearColor('#000000');
        this.network.setClearAlpha(0);
        this.network.setBackgroundImage(pageConfig.url('/images/bg.jpg'));

        var interaction = this.network.getDefaultInteraction();
        interaction.maxDistance = 700;
        interaction.minDistance = 600;
        interaction.setYLowerLimitAngle(Math.PI/8);
        interaction.setYUpLimitAngle(Math.PI/5);
        interaction.noPan = true;

        this.box.add(new mono.AmbientLight('#F8F8F8'));
        var pointLight = new mono.PointLight(0xFFFFFF, 0.2);
        pointLight.setPosition(5000, 5000, 5000);
        this.box.add(pointLight);

        this.register();

        this.network.isSelectable = function(n) {
            return false;//n.getClient('type') === 'dc';
        }

        var self = this;
        var findFirstObjectByMouse = eutils.findFirstObjectByMouse;
        this.network.getRootView().addEventListener('dblclick', function(e) {
            var billboardCard = findFirstObjectByMouse(self.network, e, function(object3d, point) {
                // console.log(point);
                // if (object3d instanceof mono.Billboard) {
                //     return true;
                // }
                if(object3d.getClient('type')){
                    return true;
                }
            });
            var billboard;
            if (billboardCard) {
                var type = billboardCard.getClient('type');
                if(type != 'dc' && type != 'dcBoard')return;
                if(type==='dcBoard'){
                    billboard = self.network.getDataBox().getDataById(billboardCard.getClient('dcNodeId'));
                } else {
                    billboard = billboardCard;
                    billboardCard = self._dcEles[billboardCard.getClient('dcId')].board;
                }

                self.dcBillboardCard = billboardCard;
                self.dcBillboardCard.setVisible(false);
                self.dcBillboardlink.setVisible(false);

                self.byeView(function(){
                    self.gotoAnimate(billboard);
                });
            } else if(billboardCard === 0){
                self.byeView(function(){
                    self.previous && self.previous(self.province);
                });
            }
        });

        this.network.getRootView().addEventListener('click', function(e) {
            var node = findFirstObjectByMouse(self.network, e, function(object3d, point) {
                if(main.config.debug){
                    console.log(point);
                }
                if (object3d instanceof mono.Billboard) {
                    return true;
                }
            });

            if (node && node.getClient('type') === 'dc') {
                // if(self._dcPanel){
                //     var oldId = self._dcPanel.data('dcId');
                //     var dcId = node.getClient('dcId')
                //     if(oldId == dcId)return;
                // }
                // var pos = node.getPosition();
                // self.seleCube.setVisible(true);
                // self.seleCube.setPosition(new mono.Vec3(pos.x-2.73, pos.y, pos.z));
                // if(!self._seleCubeAnimate){
                //     self._seleCubeAnimate = new twaver.Animate({
                //         play: true,
                //         reverse: false,
                //         repeat: Number.MAX_VALUE,
                //         dur: 2000,
                //         from: 0,
                //         to: 2*Math.PI,
                //         onUpdate: function (v) {
                //             self.seleCube.setRotationY(v);
                //         }
                //     });
                // }
                // self._seleCubeAnimate.play();

                // 先隐藏之前的div信息面板
                // self.hideDcPanel();

                // 显示div信息面板
                // self.showDcPanel(self.parent,node,network);
            } else {
                // self.seleCube.setVisible(false);
                // 隐藏div信息面板
                // self.hideDcPanel();
                // self._seleCubeAnimate && self._seleCubeAnimate.stop();
            }
        });


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
        var $rp = $('<div class="right-panel"></div>').appendTo(parent);
        this.$floor_area = $('<div class="floor-area clearfix statis"></div>')
            .appendTo($rp)
            .itvMark({
                icon: '../images/new-earth/001.png',
                value: '5500',
                unit: '㎡',
                label: it.util.i18n("AreaScene_Floorage"),
            });
        this.$rack_total = $('<div class="rack-total clearfix statis"></div>')
            .appendTo($rp)
            .itvRackTotal({
                left:[
                    {value:'42U',label:it.util.i18n("AreaScene_Standard_Rack"),color:''},
                    {value:'1540',label:it.util.i18n("AreaScene_Total_Rack"),color:''},
                ],
                icon: '../images/new-earth/0021.png',
                right:[
                    {value:['1100', '(60%)'],label:it.util.i18n("AreaScene_Occupied_Rack"),color:''},
                ],
            });
        $('<div class="camera clearfix statis"></div>')
            .appendTo($rp)
            .itvMark({
                icon: '../images/new-earth/003.png',
                value: '7 x 24',
                unit: it.util.i18n("AreaScene_Hours"),
                label: it.util.i18n("AreaScene_Network_Monitoring"),
            });
        $('<div class="dc-th clearfix statis"></div>')
            .appendTo($rp)
            .itvList({
                data: [
                    {value:'22°C ± 2°C', icon:'../images/new-earth/004.png'},
                    {value:'45% - 65%', icon:'../images/new-earth/005.png'},
                    {label:it.util.i18n("AreaScene_Constant_Temperature_Humidity")}
                ]
            });
        $rp.css('right','-300px');
            // .animate({
            //     right: '60px', 
            // }, 1000);
        this._$rightPanel = $rp;
    },
    helloView: function(){
        var w = document.body.clientWidth, rightPanel;
        if (w <= 1919) {
            rightPanel = '10px';
        } else{
            rightPanel = '60px';
        }
        var self = this;
        self._$leftPanel.itvDcTotal('reset');
        this._$leftPanel.animate({
             left: '10px', 
        }, 500, function(){
            // $('.left-panel').itvDcTotal('start')
            self._$leftPanel.itvDcTotal('start');
        });
        this.$floor_area.itvMark('reset');
        this.$rack_total.itvRackTotal('reset');
        this._$rightPanel.animate({
            right: rightPanel, 
        }, 500, function () {
            $('.floor-area').itvMark('start');
            $('.rack-total').itvRackTotal('start');
            setTimeout(function(){
                for(var id in self._plateAnimates){
                    self._plateAnimates[id].play();
                }
                self.floatDcImages();
                for(var p in self._dcAnimates){
                    self._dcAnimates[p].play();
                }
            },800);
        });
    },
    byeView: function(callback){
        var self = this;
        // 停止所有动画
        for(var p in this._dcImageAnimates){
            this._dcImageAnimates[p].stop(false);
        }
        for(var p in this._dcAnimates){
            this._dcAnimates[p].stop(false);
        }
        for(var id in self._plateAnimates){
            self._plateAnimates[id].stop(false);
        }
        var i = 0;
        this._$leftPanel.animate({
            left: '-300px', 
        }, 500,function(){
            i>0?callback():i++;
        });
        this._$rightPanel.animate({
            right: '-300px', 
        }, 500,function(){
            i>0?callback():i++;
        });
    },

	initNetwork: function(province, parent){
		parent = parent || document.body;
		this.province = province;
		this.parent = parent;
        // var network = this.network = new mono.Network3D();
        // var box = network.getDataBox();
        // var camera = new mono.PerspectiveCamera(30, 1.5, 10, 20000);

        // camera.p(0, 693,1);      
        // camera.setPosition(228, 227, 356);
        // camera.lookAt(0, 0, 0);
        // network.setCamera(camera);
        // network.setClearColor('#000000');
        // network.setClearAlpha(0);
        // network.setBackgroundImage('../images/bg.jpg');
        // network.setShowAxis(true);

        // var interaction = network.getDefaultInteraction();
        // interaction.maxDistance = 1000;
        // interaction.minDistance = 500;
        // interaction.setYLowerLimitAngle(Math.PI/6);
        // interaction.setYUpLimitAngle(Math.PI/6);
        // interaction.noPan = true;

        // network.isSelectable = function(n) {
        //     return false;//n.getClient('type') === 'dc';
        // }
        
        parent.appendChild(this.network.getRootView());

        // box.add(new mono.AmbientLight('#F8F8F8'));
        // var pointLight = new mono.PointLight(0xFFFFFF, 0.2);
        // pointLight.setPosition(5000, 5000, 5000);
        // box.add(pointLight);

        // var self = this;
        // var findFirstObjectByMouse = eutils.findFirstObjectByMouse;
        // network.getRootView().addEventListener('dblclick', function(e) {
        //     var billboard = findFirstObjectByMouse(network, e, function(object3d, point) {
        //         console.log(point);
        //         if (object3d instanceof mono.Billboard) {
        //             return true;
        //         }
        //     });
        //     if (billboard) {
        //         self.gotoAnimate(billboard);
        //     } else if(billboard === 0){
        //     	self.previous && self.previous(self.province);
        //     }
        // });
        // network.getRootView().addEventListener('click', function(e) {
        //     var node = findFirstObjectByMouse(network, e, function(object3d, point) {
        //         if(main.config.debug){
        //             console.log(point);
        //         }
        //         if (object3d instanceof mono.Billboard) {
        //             return true;
        //         }
        //     });

        //     if (node && node.getClient('type') === 'dc') {
        //         if(self._dcPanel){
        //             var oldId = self._dcPanel.data('dcId');
        //             var dcId = node.getClient('dcId')
        //             if(oldId == dcId)return;
        //         }
        //         var pos = node.getPosition();
        //         self.seleCube.setVisible(true);
        //         self.seleCube.setPosition(new mono.Vec3(pos.x-2.73, pos.y, pos.z));
        //         if(!self._seleCubeAnimate){
        //             self._seleCubeAnimate = new twaver.Animate({
        //                 play: true,
        //                 reverse: false,
        //                 repeat: Number.MAX_VALUE,
        //                 dur: 2000,
        //                 from: 0,
        //                 to: 2*Math.PI,
        //                 onUpdate: function (v) {
        //                     self.seleCube.setRotationY(v);
        //                 }
        //             });
        //         }
        //         self._seleCubeAnimate.play();

        //         // 先隐藏之前的div信息面板
        //         self.hideDcPanel();

        //         // 显示div信息面板
        //         self.showDcPanel(parent,node,network);
        //     } else {
        //         self.seleCube.setVisible(false);
        //         // 隐藏div信息面板
        //         self.hideDcPanel();
        //         self._seleCubeAnimate && self._seleCubeAnimate.stop();
        //     }
        // });
        
	},

    hideDcPanel: function(){
        this._dcPanel && this._dcPanel.remove();
        this._link && this.network.getDataBox().removeById(this._link.getId());
    },

    showDcPanel: function(parent,node,network){
        var dcId = node.getClient('dcId'), box = network.getDataBox(),
            dc = main.sceneManager.dataManager.getDataById(dcId),
            ls = node.getPosition(),
            le = new mono.Vec3(ls.x-90, ls.y+60, ls.z),
            loc = network.getViewPosition(le),
            locStart = network.getViewPosition(ls);
        // 创建link
        var fromNode = new mono.Sphere(0.1);
        fromNode.setPosition(ls);
        var toNode = new mono.Sphere(0.1);
        toNode.setPosition(le);
        var link = new mono.Link(fromNode, toNode, dcId+'Link');
        link.setLinkType('control');
        link.s({
            'm.color':'#00AFBE'
        });
        link.setControls([new mono.Vec3(ls.x-80, ls.y+60, ls.z)]);
        box.add(fromNode);
        box.add(toNode);
        box.add(link);
        this.dcBillboardlink = link;
        


        //TODO 采用缩放的动画，现在这种固定高度灵活性不够，效果也不太好
        var $panel = $('<div></div>')
            .appendTo(parent)
            .addClass('dc_panel')
            .css({
                top: (loc.y>0?loc.y:100)+'px',
                left: (loc.x-200)+'px',
            });
        $('<h2></h2>').appendTo($panel).html(dc.getName() || dc.getId());
        $('<img></img>').appendTo($panel).attr('src', '../images/dc/dc_'+dc.getId()+'.png');
        if(dc.getDescription()){
            $('<p></p>').appendTo($panel).html(dc.getDescription());
        }
        $panel.data('dcId', dcId);
        this._dcPanel = $panel;

        var camera = network.getCamera();
        camera.addPropertyChangeListener(function (e) {
            if (e.property == 'position') {
                var loc = network.getViewPosition(le)
                $panel.css({
                    top: (loc.y>0?loc.y:100)+'px',
                    left: (loc.x-200)+'px',
                });
            }
        });

        // float animate
        toNode.setClient('originLoc', toNode.getPosition());
        toNode.setClient('dcId', dcId);
        var animate = eutils.float3d(toNode, eutils.get3dFloatPoint(toNode),function(x,y,z){
            var p = new mono.Vec3(x,y,z);
            var loc = network.getViewPosition(p)
            $panel.css({
                top: (loc.y>0?loc.y:100)+'px',
                left: (loc.x-200)+'px',
            });
            toNode.setPosition(p);
            link.setControls([new mono.Vec3(x+10, y, z)]);
        },this._dcImageAnimates);
        
        // 旋转网元
        animate = new twaver.Animate({
            play: true,
            reverse: false,
            repeat: Number.MAX_VALUE,
            dur: 2000,
            from: 2*Math.PI,
            to: 0,
            onUpdate: function (v) {
                node.setRotationY(v);
            }
        });
        animate.play();
        this._dcAnimates[dcId] = animate;
    },

    gotoAnimate: function(ele){
        
        
        var self = this, 
            scale = ele.getScale(),
            val;
        // var animate = new twaver.Animate({
        //     from: 0,
        //     to : 1,
        //     dur: 500,
        //     // reverse: true,
        //     repeat: 1,
        //     easing: 'easeOut',
        //     onUpdate: function(value){
        //         val = value+10;
        //         ele.setScale(scale.x*val, scale.y*val, scale.z);
        //     },
        //     onDone : function(){
        //         self.gotoScene && self.gotoScene(ele.getClient('dcId'));
        //         // ele.setScale(scale.x, scale.y, scale.z);
        //     }
        // });
        // animate.play();
        
        var c = this.network.getCamera(),
            oldTarget = c.getTarget(),
            oldPos = c.getPosition();
        var tp = ele.getWorldPosition();
        var p = new mono.Vec3(tp.x, tp.y + 20, tp.z);
        it.util.playCameraAnimation(c,p,tp ,0,1000,0, function(){
            var animate = new twaver.Animate({
                from: 1,
                to : 50,
                dur: 1000,
                // reverse: true,
                repeat: 1,
                easing: 'easeOut',
                onUpdate: function(value){
                    ele.setScale(value, value, value);
                    // val = value+10;
                    // ele.setScale(scale.x*val, scale.y*val, scale.z*val);
                },
                onDone : function(){
                    // self.gotoScene && self.gotoScene(ele.getClient('dcId'), undefined, function(){
                    //     self.dcBillboard.setVisible(true);
                    // });
                    self.gotoScene && self.gotoScene(ele.getClient('dcId'));
                    ele.setScale(scale.x, scale.y, scale.z);
                    c.setPosition(oldPos);
                    c.lookAt(oldTarget);
                    self.dcBillboardCard.setVisible(true);
                    self.dcBillboardlink.setVisible(true);
                }
            });
            animate.play();
        });
    },

    setData: function(data){
        this.data = data;
    },

    preload: function(province,animateData, parent) {
    	if(this._loaded){
    		this.reload(province,animateData);
            // this.register();
            this.adjustBounds();
    		return;
    	}
        this.initNetwork(province, parent);
        
        // this.register();
        this.load();
        this.entranceAnimat(province,animateData);
        this.adjustBounds();
    },

    register: function(){
    	this.readyModels();
    },

    reload: function(province,animateData){
    	var network = this.network, camera = network.getCamera();
    	mono.Utils.autoAdjustNetworkBounds(network, document.documentElement, 'clientWidth', 'clientHeight');
    	camera.p(315,1413.26,215);
    	this.entranceAnimat(province,animateData,true);
    },

    load: function(){
        this.initView(this.parent);
    	this.loadData();
    	this._loaded = true;
    },

    back: function(){
        $(this.parent).show();
        this.helloView(); //从园区返回的时候，展示左右数字面板
    	if(!this._loaded){
    		$(this.parent).show();
    		this.initNetwork(this.province, this.parent);
    		this.load();
            self.helloView();
    		//todo:初始到离开时的状态
                
    	}
    },

    entranceAnimat: function(province,animateData,reload){
    	var network = this.network;
    	// var animateData = provinceAnimateDataMap[province];
    	if(!animateData){
    	  return;
    	}
        network.dirtyNetwork();
        var self = this;
        if(animateData.cameraPos){
            var p = animateData.cameraPos,t = animateData.cameraTarget;
            var cameraPos = new mono.Vec3(p[0],p[1],p[2]);
            var cameraTarget = t?new mono.Vec3(t[0],t[1],t[2]):new mono.Vec3(-135,0,34);
            it.util.playCameraAnimation(network.getCamera(),cameraPos,cameraTarget ,0,2000,0,function(){
            	// network.getDataBox().forEach(function(node){
             //        if(node.getClient('type') === 'dc'){
             //            // self.showDcPanel(self.parent,node,network);
             //            // self.linkBoard(node);
             //        }
             //    });
                self.helloView();
            });
        }
    },
    linkDivBoard: function(node){
        var dcId = node.getClient('dcId'), box = this.network.getDataBox(),
            dc = main.sceneManager.dataManager.getDataById(dcId),
            ls = node.getPosition(), ext = dc.getExtend();
        if(ext){
            // area board的位置由实施人员配置
            areaBoardPos = ext.areaBoardPos?ext.areaBoardPos:{x:ls.x-90,y:ls.y+60,z:ls.z};
        }
        var le = new mono.Vec3(areaBoardPos.x, areaBoardPos.y, areaBoardPos.z);

        this.showDcPanel(this.parent,node,this.network);
    },
    linkBoard: function(node){
        var dcId = node.getClient('dcId'), box = this.network.getDataBox(),
            dc = main.sceneManager.dataManager.getDataById(dcId),
            ls = node.getPosition(), ext = dc.getExtend();
        if(ext){
            // area board的位置由实施人员配置
            areaBoardPos = ext.areaBoardPos?ext.areaBoardPos:{x:ls.x-90,y:ls.y+60,z:ls.z};
        }
        var le = new mono.Vec3(areaBoardPos.x, areaBoardPos.y, areaBoardPos.z);
        var board = new AreaDcBoard(dc);
        board = board.getNode();
        board.setClient('dcId', dcId);
        board.setClient('type', 'dcBoard');
        board.setClient('dcNodeId', node.getId());
        board.p(le);
        box.add(board);

        // 创建link
        var fromNode = new mono.Sphere(0.1);
        fromNode.setPosition(ls);
        fromNode.setParent(node.getParent());
        var toNode = new mono.Sphere(0.1);
        toNode.setPosition(le);
        var link = new mono.Link(fromNode, toNode, dcId+'Link');
        link.setLinkType('control');
        link.s({
            'm.color':'#2ce9ff'
        });
        link.setControls([new mono.Vec3(areaBoardPos.x+10, areaBoardPos.y, areaBoardPos.z)]);
        box.add(fromNode);
        box.add(toNode);
        box.add(link);
        this.dcBillboardlink = link;

        // float animate
        toNode.setClient('originLoc', toNode.getPosition());
        toNode.setClient('dcId', dcId);

        this._dcEles[dcId] = {
            toNode: toNode,
            board: board,
            link: link
        };
        // var animate = eutils.float3d(toNode, eutils.get3dFloatPoint(toNode),function(x,y,z){
        //     var p = new mono.Vec3(x,y,z);
        //     toNode.setPosition(p);
        //     board.setPosition(p);
        //     link.setControls([new mono.Vec3(x+10, y, z)]);
        // },this._dcImageAnimates);
        // this._dcImageAnimates[dcId] = animate;
        
        // 旋转网元
        // animate = new twaver.Animate({
        //     play: true,
        //     reverse: false,
        //     repeat: Number.MAX_VALUE,
        //     dur: 2000,
        //     from: 2*Math.PI,
        //     to: 0,
        //     onUpdate: function (v) {
        //         node.setRotationY(v);
        //     }
        // });
        // animate.play();
        // this._dcAnimates[dcId] = animate;
    },
    floatDcImages: function(){
        var self = this;
        for(var id in this._dcEles){
            var ele = this._dcEles[id];

            var toNode = ele.toNode, board = ele.board, link = ele.link;
            var animate = self._dcImageAnimates[toNode.getClient('dcId')];
            if(animate){
                animate.play();
            } else {
                var limit = self._floatLimit;
                eutils.float3d(toNode, eutils.get3dFloatPoint(toNode, limit),function(x,y,z){
                    var p = new mono.Vec3(x,y,z);
                    toNode.setPosition(p);
                    board.setPosition(p);
                    link.setControls([new mono.Vec3(x+10, y, z)]);
                },self._dcImageAnimates,limit);
            }
        }
    },
    readyModels: function() {
        var self = this; 
        make.Default.register('twaver.scene.datacenter-icon', function(json, callback) {
            var scaleX = 30,
                scaleY = 35;
            var position = json.position || [0, 0, 0];
            var x = position[0],
                y = position[1],
                z = position[2];
            var pin = new mono.Billboard();
            pin.s({
                'm.texture.image': "../images/node.png",
                'm.alignment': mono.BillboardAlignment.bottomCenter,
                'm.depthTest': false,
            });
            pin.setClient('type', 'datacenter');
            pin.setScale(scaleX, scaleY, 1);
            pin.p(x, y, z);
            return pin;
        });

        make.Default.register('twaver.scene.seleCube', function(json, callback) {
            var position = json.position || [0, 0, 0];
            var x = position[0],
                y = position[1],
                z = position[2];
            var seleCube = new mono.Cube(30, 1, 30);
            seleCube.s({
                'm.visible': false,
                'top.m.visible': true,
                'm.texture.image': '../images/select-node.png',
                // 'm.texture.image': '../images/area_plate.png',
                'm.transparent': true,
            });

            seleCube.p(x, y, z);
            return seleCube;
        });
    },

    loadData: function() {
        var network = this.network,
            box = network.getDataBox(),
            self = this;
        
        var dcs = this.data;
        var afterCreateArea = function() {
            if (dcs) {
                var dcData, dc, ext, pos, plate;
                for (var i = 0; i < dcs.length; i++) {
                    dcData = dcs[i];
                    // pos = dcData.getPosition();
                    ext = dcData.getExtend();
                    if(ext){
                        pos = ext.areaPos ? ext.areaPos : {x:0,y:0,z:0};
                    }
                    dc = self.dcMap[dcData.getId()];
                    if (!dc) {
                        make.Default.load({
                            "id": 'twaver.scene.area_dc',
                            "position": [pos.x, pos.y, pos.z]
                        },function(dc){
                            dc.setClient('type', 'dc');
                            dc.setClient('dcId', dcData.getId());
                            dc.setScale(0.7,1,0.7);
                            dc.setParent(self.area);
                            box.addByDescendant(dc);
                            plate = make.Default.load({
                                "id": 'twaver.scene.seleCube',
                                "position": [pos.x, pos.y, pos.z]
                            });
                            plate.setParent(self.area);
                            var animate = new twaver.Animate({
                                reverse: false,
                                repeat: Number.MAX_VALUE,
                                dur: 2000,
                                from: 2*Math.PI,
                                to: 0,
                                onUpdate: function (v) {
                                    plate.setRotationY(v);
                                }
                            });
                            self._plateAnimates[dcData.getId()] = animate;
                            box.addByDescendant(plate);
                            self.dcMap[dcData.getId()] = dc;

                            // self.linkDivBoard(dc);
                            self.linkBoard(dc);
                            
                        });
                        
                        
                    }
                }
            }
            // if (!self.seleCube) {
            //     var seleCube = self.seleCube = make.Default.load({
            //         "id": 'twaver.scene.seleCube',
            //     });
            //     seleCube.setParent(self.area);
            //     network.getDataBox().addByDescendant(seleCube);
            // }
            // seleCube.setVisible(false);
        }

        if (this.area) {
            box.addByDescendant(this.area);
            afterCreateArea();
        } else {
            var area = this.area = make.Default.load({
                "id": "twaver.scene." + eutils.provinceNameMap[self.province]
            }, function(area) {
                var center = area.getBoundingBox().center();
                area.p(-center.x, -center.y, -center.z)
                box.addByDescendant(area);
                self.area = area;
                afterCreateArea();
            });
        }
        
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
            this.network.adjustBounds(w,h);
        }
    },

    stopAnimates: function(delay){
        delay = delay || 100;
        var self = this;
        // this.box.removeByDescendant(this.area);
        setTimeout(function(){
            if(self._seleCubeAnimate){
                self._seleCubeAnimate.stop();
                // self._seleCubeAnimate = undefined;
            }
            // self.network.dispose();
            // self.network = undefined;
            // self._loaded = undefined;
            // $(self.parent).hide().empty();
        }, delay);
    	
    }
});

AreaScene = AreaScene;