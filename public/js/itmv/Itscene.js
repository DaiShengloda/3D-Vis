var sceneObjects = sceneObjects || {};
var linkFlag = true; //是否开启连线功能

//观澜盘古

var main = main || {};
main.dcCameraPosition = {
    // 'topPosition': 10870,
    // 'position1': [0, 7993, 10069],
    // // 'position2': [-382,178,769]
    // 'position2': [1628.931436256874, 528.4235934167277, 8931.073691595484]
    'topPosition': [0, 2500, 0],
    'position1': [2500, 500, 0],
    'position2': [2757, 55, 1043],
    'yuanquHeight': 300,
};

main.extFunction = function () {
    function sameParentAndRow(fData, data) {
        if (!data || !data.getParent) {
            return
        }
        if (fData.getParentId() == data.getParentId()) {
            var parentDataType = main.sceneManager.dataManager.getDataTypeForData(fData.getParentId());
            if (parentDataType &&
                parentDataType._childrenSize &&
                parentDataType._childrenSize.xSize &&
                fData.getLocation() && fData.getLocation().x) {
                if (data.getLocation() && parseInt(data.getLocation().x) == parseInt(fData.getLocation().x)) {
                    return true;
                }
            } else if (parseInt(fData.getPosition().x) == parseInt(data.getPosition().x)) {
                return true;
            }
        }
        return false;
    }

    main.sceneManager.viewManager3d.isFilterVirtualElement = function () {
        return false;
    }

    var dataManager = main.sceneManager.dataManager;
    main.sceneManager.viewManager3d.defaultMaterialFilter.getOpacityValueFunction = function (data) {
        var focusNode = main.sceneManager.viewManager3d.getFocusNode();
        var fData = main.sceneManager.getNodeData(focusNode);
        if (!fData) {
            return null;
        }
        var parentData = main.sceneManager.dataManager.getDataById(fData.getParentId());
        var fCategory = dataManager.getCategoryForData(fData);
        var category = dataManager.getCategoryForData(data);
        // if (fCategory 
        //     && fCategory.getId().toLowerCase() === 'equipment'
        //     && category 
        //     && (category.getId().toLowerCase() === 'rack' || category.getId().toLowerCase() =='headerrack')
        //     && parentData 
        //     ) {
        //     // return dataJson.opacityValue||0.9;
        //       if(sameParentAndRow(parentData,data)){
        //         return 1;
        //       }
        // }
        if (fCategory &&
            fCategory.getId().toLowerCase() === 'rack'
        ) {
            if (sameParentAndRow(fData, data)) {
                return 1;
            }
        }
        if (category &&
            category.getId() == 'room' &&
            fCategory &&
            main.sceneManager.isAncestor(fData, data.getId()) &&
            fCategory.getId().toLowerCase() === 'rack'
            // && (fCategory.getId().toLowerCase() === 'rack' || fCategory.getId().toLowerCase() === 'equipment')
        ) {
            return 1;
        }
        return 0;
    }

    new it.SaveCameraBar(main.sceneManager); //加载镜头的数据



    make.Default.register('twaver.wh.box', function (json, callback) {
        var width = json.width || 45;
        var height = json.height || 40;
        var depth = json.depth || 37;
        var color = json.color || 'green';
        var box = new mono.Cube(width, height, depth);
        box.s({
            'm.type': 'phong',
            'm.color': color,
            'm.ambient': color,
            'm.transparent': true,
            'm.opacity': 0.0,
            'front.m.visible': false,
            'm.side': mono.DoubleSide,
        });
        if (callback) {
            callback(box);
        }
        return box;
    });



    // for (var i = 0; i < whObjModels.length; i++) {
    //     registerOBjModel(whObjModels[i]);
    // }

    make.Default.register('twaver.wh.disk', function (json, callback) {
        var position = json.position || [0, 0, 0];
        var x = position[0],
            y = position[1],
            z = position[2];
        var width = json.width || 47;
        var height = json.height || 9.5;
        var depth = json.depth || 50;
        var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];
        // var pic = getWrapImagePath(json.image);
        if (json.path) {
            pic = json.path;
        }
        var cube = new mono.Cube(width, height, depth);
        cube.setStyle("m.visible", false);
        var direction = {
            front: {
                w: 47,
                h: 9.5,
                d: 0.5,
                position: [0, 0, 24.5]
            },
            back: {
                w: 45,
                h: 9.5,
                d: 0.5,
                position: [0, 0, -24.5]
            },
            top: {
                w: 45,
                h: 0.5,
                d: 49,
                position: [0, 4.5, 0]
            },
            bottom: {
                w: 45,
                h: 0.5,
                d: 49,
                position: [0, -4.5, 0]
            },
            left: {
                w: 1,
                h: 8.5,
                d: 49,
                position: [-22, 0, 0]
            },
            right: {
                w: 1,
                h: 8.5,
                d: 49,
                position: [22, 0, 0]
            }
        };
        for (var k in direction) {
            var cubeNPosition = direction[k].position;
            var cubeN = new mono.Cube({
                'width': direction[k].w,
                'height': direction[k].h,
                'depth': direction[k].d
            });
            cubeN.setStyle('m.color', '#3a3c40');
            cubeN.setStyle('front.m.color', 'white');
            if (k == "front") {
                cubeN.setStyle('front.m.texture.image', './images/equipment65.png');
                var cubeNode = new mono.Cube(42.6, 8.2, 4);
                cubeNode.setStyle('m.color', '#00131C');
                var newCube = new mono.ComboNode({
                    'combos': [cubeN, cubeNode],
                    'operators': ['-']
                });
                newCube.setPosition(new mono.Vec3(cubeNPosition[0], cubeNPosition[1], cubeNPosition[2]));
                newCube.setParent(cube);
                newCube.setClient('direction', k);
            } else {
                cubeN.setStyle('front.m.color', '#00131C');
                cubeN.setPosition(new mono.Vec3(cubeNPosition[0], cubeNPosition[1], cubeNPosition[2]))
                cubeN.setParent(cube);
                cubeN.setClient('direction', k);
            }
        }
        cube.setPosition(position[0], position[1], position[2]);
        cube.setStyle({
            'select.style': 'outline.glow',
        })
        return cube;
    }, {});


    make.Default.register('twaver.wh.disks', function (json, callback) {
        var position = json.position || [0, 0, 0];
        var x = position[0],
            y = position[1],
            z = position[2];
        var width = json.width || 2.13;
        var height = json.height || 8.2;
        var depth = json.depth || 20;
        var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];
        // var pic = getWrapImagePath(json.image);
        if (json.path) {
            pic = json.path;
        }
        var cube = new mono.Cube(width, height, depth);
        cube.setClient('direction', 'disk')
        cube.s({
            'm.color': "#00131C",
            'front.m.color': "white",
            'front.m.texture.image': "./images/disk.jpg",
            // 'select.style': 'outline.glow',
            // 'm.envmap.image': make.Default.getEnvMap('envmap6')
            // 'm.type': 'phong'
        })
        cube.setClient("notLookAt", true);
        return cube;
    }, {});

    if (!linkFlag) {
        main.sceneManager.viewManager3d.addPropertyChangeListener(function (event) {
            if (event.property == "focusNode") {
                var newData = main.sceneManager.getNodeData(event.newValue);
                var oldData = main.sceneManager.getNodeData(event.oldValue);
                var node, children, startP = {};
                if (newData.getDataTypeId() == "Ibm") {
                    playAnimate(newData, 20)
                }
                if (oldData && oldData.getDataTypeId() == "Ibm") {
                    playAnimate(oldData, -20)
                }
            }
        })
        var network = main.sceneManager.network3d;
        network.getRootView().addEventListener('dblclick', function (e) {
            var element = network.getFirstElementByMouseEvent(e, false);
            if (!element) return;
            node = element.element;
            var data = main.sceneManager.getNodeData(node);
            var category = main.sceneManager.dataManager.getCategoryForData(data);
            var m = main.sceneManager.network3d.dataBox.getSelectionModel();
            m.clearSelection();
            easyDraw.allShapeMap["disk_info"].visible = false;
            easyDraw.allShapeMap["memory-use-rate"].visible = false;
            easyDraw.allShapeMap["cpu"].visible = false;
            if (category && category.getId() === "disk") {
                var data1 = [(Math.random() + 1) * 10000, (Math.random() + 1) * 10000, (Math.random() + 1) * 10000, (Math.random() + 1) * 10000]
                var data2 = [(Math.random() + 1) * 10000, (Math.random() + 1) * 10000, (Math.random() + 1) * 10000, (Math.random() + 1) * 10000]
                node.setStyle('select.style', 'outline.glow');
                node.setStyle('select.color', '#2fa0ff');
                node.setClient('isSelectable', true);
                node.setSelected(true);
                easyDraw.allShapeMap["disk_info"].visible = true;
                easyDraw.allShapeMap["memory-use-rate"].visible = true;
                easyDraw.allShapeMap["cpu"].data.option.series[0].data = data1;
                easyDraw.allShapeMap["cpu"].data.option.series[1].data = data2;
                easyDraw.allShapeMap["cpu"].visible = true;
            }
        })
        easyDraw.allShapeMap["close"].on("click.a", function () {
            easyDraw.allShapeMap["disk_info"].visible = false;
            easyDraw.allShapeMap["memory-use-rate"].visible = false;
            easyDraw.allShapeMap["cpu"].visible = false;
        })
    } else {
        var network = main.sceneManager.network3d;
        var explode = true;
        var oldData = null;
        network.getRootView().addEventListener('dblclick', function (e) {
            var element = network.getFirstElementByMouseEvent(e, false);
            if (JSON.stringify(main.sceneManager.gcsManager.animates) !== "{}") {
                var focusNode = main.sceneManager.viewManager3d.getFocusNode();
                main.sceneManager.viewManager3d.lookAt(focusNode);
            }
            main.sceneManager.gcsManager.clearAllLink();
            main.sceneManager.gcsManager.unlock();
            if (!element) {
                if (!explode && oldData) {
                    playAnimate(oldData, -20);
                    explode = true;
                    oldData = null;
                }
                return
            };
            node = element.element;
            var data = main.sceneManager.getNodeData(node);
            var focusNode = main.sceneManager.viewManager3d.getFocusNode();
            var focusData = main.sceneManager.getNodeData(focusNode);
            var category = main.sceneManager.dataManager.getCategoryForData(data);
            var m = main.sceneManager.network3d.dataBox.getSelectionModel();
            m.clearSelection();
            if (!explode && data && data.getDataTypeId() === "Ibm") return;
            if (!explode && oldData && !(category && category.getId() == "disk")) {
                playAnimate(oldData, -20);
                explode = true;
                oldData = null;
            }
            easyDraw.allShapeMap["disk_info"].visible = false;
            easyDraw.allShapeMap["memory-use-rate"].visible = false;
            easyDraw.allShapeMap["cpu"].visible = false;
            if (category && category.getId() === "disk") {
                var data1 = [(Math.random() + 1) * 10000, (Math.random() + 1) * 10000, (Math.random() + 1) * 10000, (Math.random() + 1) * 10000]
                var data2 = [(Math.random() + 1) * 10000, (Math.random() + 1) * 10000, (Math.random() + 1) * 10000, (Math.random() + 1) * 10000]
                node.setStyle('select.style', 'outline.glow');
                node.setStyle('select.color', '#2fa0ff');
                node.setClient('isSelectable', true);
                node.setSelected(true);
                easyDraw.allShapeMap["disk_info"].visible = true;
                easyDraw.allShapeMap["memory-use-rate"].visible = true;
                easyDraw.allShapeMap["cpu"].data.option.series[0].data = data1;
                easyDraw.allShapeMap["cpu"].data.option.series[1].data = data2;
                easyDraw.allShapeMap["cpu"].visible = true;
            } else if (data && data.getDataTypeId() === "Ibm") {
                if (explode) {
                    playAnimate(data, 20);
                    explode = false;
                    oldData = data;
                }
            } else if (data && data.getDataTypeId() === "rack18" && focusData.getId() == data.getId()) {
                showMulLink(data);
            }
        })
        easyDraw.allShapeMap["close"].on("click.a", function () {
            easyDraw.allShapeMap["disk_info"].visible = false;
            easyDraw.allShapeMap["memory-use-rate"].visible = false;
            easyDraw.allShapeMap["cpu"].visible = false;
        })

        function showMulLink(data) {
            var children = data.getChildren();
            children.forEach(function (v, i) {
                if (v.getDataTypeId() === "Ibm") {
                    var id = v.getId();
                    main.sceneManager.gcsManager.showMulLinkByData(id, true);
                }
            })
        }
    }

    function playAnimate(data, d) {
        var startP = {};
        var node = main.sceneManager.getNodeByDataOrId(data);
        var children = node.getChildren();
        children.forEach(function (v, i) {
            var data = main.sceneManager.getNodeData(v);
            var category = main.sceneManager.dataManager.getCategoryForData(data);
            var position = v.getPosition();
            var id = v.getClient("direction");
            if (id === "disk") {
                startP[data.getId()] = position;
            } else {
                startP[id] = position;
            }
        })
        animate(children, startP, d);
    }

    function animate(children, startP, d) {
        new twaver.Animate({
            from: 0,
            to: 1,
            type: 'number',
            delay: 0,
            dur: 1000,
            easing: 'easeNone',
            onUpdate: function (value) {
                children.forEach(function (v, i) {
                    var data = main.sceneManager.getNodeData(v);
                    var category = main.sceneManager.dataManager.getCategoryForData(data);
                    // if (category.getId() && category.getId() == "diskEquipment") {
                    var position = v.getPosition();
                    var id = v.getClient("direction");
                    switch (id) {
                        case "back":
                            position.z = startP[id].z - value * d;
                            break;
                        case "left":
                            position.x = startP[id].x - value * d;
                            break;
                        case "right":
                            position.x = startP[id].x + value * d;
                            break;
                        case "top":
                            position.y = startP[id].y + value * d;
                            break;
                        case "front":
                            position.z = startP[id].z + value * d;
                            break;
                        case "bottom":
                            position.y = startP[id].y - value * d;
                            break;
                        case "disk":
                            var l = data.getLocation();
                            var parent = main.sceneManager.dataManager.getDataById(data.getParentId());
                            var parentDataType = main.sceneManager.dataManager.getDataTypeById(parent.getDataTypeId());
                            var size = parentDataType.getChildrenSize().xSize / 2 + 1;
                            position.x = startP[data.getId()].x + value * d * (l.x - size) / size;
                            break;
                        default:
                            break;
                    }
                    v.setPosition(position.x, position.y, position.z);
                    // }
                })
            }
        }).play();
    }



    //流程图
    var $WorkflowPanel = function (sceneManager) {
        it.BaseServerTab.call(this,sceneManager);
        var self = this;
        this.workflowPanel = $('<div id="workflowDiv"></div>')
        this.btn1 = $('<button id="topWorkflow2" style="position:absolute;top:100px;left:30px;">业务流程动画</button>').appendTo(self.workflowPanel);
        this.btn2 = $('<button id="middleWorkflow2" style="position:absolute;top:140px;left:30px;">应用逻辑层动画</button>').appendTo(self.workflowPanel);
        this.btn3 = $('<button id="stopWorkflow2" style="position:absolute;top:180px;left:30px;">结束</button>').appendTo(self.workflowPanel);
        this.canvas = $('<canvas id="workflowCanvas"></canvas>').appendTo(self.workflowPanel);
        this.init();
    }

    mono.extend($WorkflowPanel, it.BaseServerTab, {
        init: function () {
            var self = this;
            this.workflowPanel.css({'width': '100%', 'height': '100%'});
            this.btn1.css({
                'z-index': 2000,
                'padding': 0,
                'margin': 0,
                'outline': 0,
                'border': '0 none',
                'color': '#00B4FF',
                'font-size': '10px',
                'width': '83px',
                'height': '27px',
                'background':'url(../theme/model/button_1.png)  no-repeat  center',
                'background-size': 'cover'
            });
            this.btn2.css({
                'z-index': 2000,
                'padding': 0,
                'margin': 0,
                'outline': 0,
                'border': '0 none',
                'color': '#00B4FF',
                'font-size': '10px',
                'width': '100px',
                'height': '27px',
                'background':'url(../theme/model/button_2.png)  no-repeat  center',
                'background-size': 'cover'
            });
            this.btn3.css({
                'z-index': 2000,
                'padding': 0,
                'margin': 0,
                'outline': 0,
                'border': '0 none',
                'color': '#00B4FF',
                'font-size': '10px',
                'width': '62px',
                'height': '27px',
                'background':'url(../theme/model/button_3.png)  no-repeat  center',
                'background-size': 'cover'
            });


            var main = {};
            main.linkAnimateManager = new LinkAnimateManager();
            var map = {};
            var towerMap = [];
            var link;
            var id = this.workflowPanel.children('div').children().prop('id');
            main.box = new mono.DataBox();
            var network = main.network = new mono.Network3D(main.box, null, this.canvas[0]);
            network.setShadowMapEnable(true);
            network.shadowMapType = mono.PCFSoftShadowMap;
            network.setClearColor(0, 0, 0);
            network.setClearAlpha(0);
            network.setBackgroundImage('./images/bg/bg1.jpg');
            network.setInteractions([new mono.DefaultInteraction(network)]);
            var defaultInteraction = main.network.getDefaultInteraction();
            defaultInteraction.maxDistance = 6000;
            defaultInteraction.minDistance = 1000;
            defaultInteraction.zoomSpeed = 1;
            var camera = main.network.getCamera();
            camera.p(1216, 552, 5367);
            camera.lookAt(0, -1000, 0);
            // mono.Utils.autoAdjustNetworkBounds(network, this.workflowPanel[0], 'clientWidth', 'clientHeight');
            main.network.adjustBounds(910, 576);
            make.Default.path = '../modellib/';


            main.utils = {};
            main.utils.createWorkflowBillboard = function (data) {
                var canvas = main.utils.createBillboardImage(data)
                var billboard = new mono.Billboard();
                billboard.s({
                    'm.texture.image': canvas,
                    'm.texture.offset': new mono.Vec2(0, 0.005),
                    'm.texture.anisotropy': 8,
                    'm.alignment': mono.BillboardAlignment.bottomCenter,
                    'm.alphaTest':0.1
                });
                billboard.setScale(canvas.width/5, canvas.height/4.5, 1)
                // billboard.renderDepth = -1000000;
                return billboard;
            }
            main.utils.createBillboardImage = function (data) {
                var text = data.text,
                    bgColor = data.bgColor || '#D3D9A6',
                    fontColor = data.fontColor || 'black';
                //创建贴图
                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');
                context.font = "130px 微软雅黑";
            
                var array = [];
                if (text.indexOf("\n")) {
                    array = text.split("\n");
                } else {
                    array = [text]
                }
                var length = 0;
                for (var i = 0; i < array.length; i++) {
                    if (i == 0) {
                        length = context.measureText(array[i]).width;
                    } else {
                        length = Math.max(context.measureText(array[i]).width, length);
                    }
                }
            
                var size = mono.Utils.getMaxTextSize(array, context.font);
                var width = mono.Utils.nextPowerOfTwo(length);
                var oHeight = size.height;
                var arrowHeight = 40;
                var arrowWidth = 80;
                var height = mono.Utils.nextPowerOfTwo(oHeight + arrowHeight);
            
                canvas.height = height;
                canvas.width = width;
                var lineHeight =(height - arrowHeight - 40) / array.length;
                var oLineHeight = oHeight / array.length;
                var radius = width / 16;
            
                var context = canvas.getContext('2d');
                context.globalAlpha = 0.9;
                context.fillStyle = bgColor;
                context.save();
                context.beginPath();
                context.moveTo(radius + 10, 10);
                context.lineTo(width - radius - 10, 10);
                context.arcTo(width - 10, 10, width - 10, radius + 10, radius);
                context.lineTo(width - 10, height - arrowHeight - radius - 10);
                context.arcTo(width - 10, height - arrowHeight - 10, width - radius -10, height - arrowHeight - 10, radius);
                context.lineTo(width / 2 + arrowWidth / 2 - 10, height - arrowHeight - 10);
                context.lineTo(width / 2 - 10, height - 10);
                context.lineTo(width / 2 - arrowWidth / 2 - 10, height - arrowHeight - 10);
                context.lineTo(radius + 10, height - arrowHeight - 10);
                context.arcTo(10, height - arrowHeight - 10, 10, height - arrowHeight - radius - 10, radius);
                context.lineTo(10, radius + 10);
                context.arcTo(10, 10, radius + 10, 10, radius);
                context.closePath();
                context.fill();
                context.globalAlpha = 1;
                context.lineWidth = 10;
                context.strokeStyle = bgColor;
                context.stroke();
                context.restore();
            
                context.fillStyle = fontColor;
                context.textBaseline = 'middle';
                context.font = "120px 微软雅黑";
                for (var i = 0; i < array.length; i++) {
                    var text = array[i];
                    length = context.measureText(text).width;
                    context.fillText(text, (width - length) / 2, lineHeight * (i + 0.5));
                }
                return canvas;
            }

            function LinkAnimateManager () {
                this.linkMap = {};
            
                this.arr = [];
                this.workflow = [];
                this.workflow;
                var scope = this;
            
                var linkMap = this.linkMap;
                this.animate = new twaver.Animate({
                    from: 1,
                    to: 0,
                    type: 'number',
                    delay: 10,
                    dur: 500,
                    easing: 'easeNone',
                    reverse: false,
                    repeat: Number.MAX_VALUE,
                    onUpdate: function (value) {
                        var offset = new mono.Vec2(value, 0);
                        Object.keys(linkMap).forEach(function (id) {
                            var link = linkMap[id];
                            link.s({
                                'm.texture.offset': offset
                            });
                        });
                    }
                });
            
                var workflowSphere = this.workflowSphere = new mono.Sphere({
                    id: 'topSphere',
                    radius: 20
                });
                workflowSphere.s({
                    'm.type': 'phong',
                    'm.color': 'red'
                }) 
               
                var billboard = new mono.Billboard();
                billboard.setY(workflowSphere.getRadius() + 100);
                var canvasMap = {};
                billboard.setParent(workflowSphere);
                this.playWorkflowAnimate = new twaver.Animate({
                    from: 0,
                    to: 1,
                    type: 'number',
                    delay: 0,
                    dur: 2000 * 5,
                    easing: 'easeNone',
                    reverse: false,
                    repeat: 1,
                    onPlay : function(){
                        main.box.addByDescendant(workflowSphere);
                        var fromNode = scope.workflow[0].getFromNode();
                        var parent = fromNode.getParent().getParent();
                        var camera = main.network.getCamera();
                        if (parent._id == map['group_001']) {
                            camera.p(-1200, 1650, 2059);
                        } else if (parent._id == map['group_006']) {
                            camera.p(-1000, 590, 2338);
                        }
                        var p = fromNode.worldMatrix.getPosition();
                        var offset = p.clone().sub(camera.p());
                        this._cameraOffset = offset;
                        
                    },
                    onUpdate: function (value) {
                        var workflow = scope.workflow;
                        var length = workflow.length;
                        var index = parseInt(value * length);
                        if(value == 1){
                            index = length - 1;
                        }
                        var link = workflow[index];
                        var v = value * length - parseInt(value * length);
                        var id = link.getId();
                        var fromNode = link.getFromNode();
                        var toNode = link.getToNode();
                        var text = fromNode.text + '\n-->\n' + toNode.text;
                        var canvas = canvasMap[id];
                        if(canvas == null){
                            canvas = main.utils.createBillboardImage({
                                text:text,
                                bgColor : "#710AAB",
                                fontColor: 'white'
                            });
                            canvasMap[id] = canvas;
                        }
                        billboard.s({
                            'm.texture.image': canvas,
                            'm.texture.offset': new mono.Vec2(0, 0.005),
                            'm.texture.anisotropy': 8,
                            'm.alignment': mono.BillboardAlignment.bottomCenter
                        });
                        billboard.setScale(canvas.width/2, canvas.height/2, 1)
                        var pos = link.getPointAt(v);
                        workflowSphere.p(pos);
                        var camera = main.network.getCamera();
                        camera.lookAt(pos);
                        camera.p(pos.clone().sub(this._cameraOffset));
                        
            
                    },
                    onDone:function(){
                        main.box.removeByDescendant(workflowSphere);
                        this.workflow = [];
                    }
                });
            };
            
            LinkAnimateManager.prototype.addLink = function (link) {
                this.linkMap[link.getId()] = link;
            };
            
            LinkAnimateManager.prototype.removeLink = function (link) {
                delete this.linkMap[link.getId()];
            };
            
            LinkAnimateManager.prototype.startAnimate = function () {
                this.animate.play();
            }
            
            LinkAnimateManager.prototype.stopAnimate = function () {
                this.animate.stop();
            }
            
            
            
            LinkAnimateManager.prototype.addWorkflowLink = function (link) {
                this.arr.push(link);
            };
            
            LinkAnimateManager.prototype.removeWorkflowLink = function (link) {
                var linkIndex = this.arr.indexOf(link);
                this.arr.splice(linkIndex, 1);
            };
            
            LinkAnimateManager.prototype.startWorkflowAnimate = function (workflowId) {
                this.workflow = this.arr.filter(function(element){
                    return element.workflowId == workflowId;
                })
                // console.log(this.workflow);
                this.playWorkflowAnimate.play();
            }
            
            LinkAnimateManager.prototype.stopWorkflowAnimate = function () {
                this.playWorkflowAnimate.stop();
                main.box.removeByDescendant(this.workflowSphere);
                this.workflow = [];
            }

            main.Link = function (fromNode, toNode, id) {
                if (arguments.length === 1 && arguments[0] instanceof Object && !Array.isArray(arguments[0])) {
                    var o = arguments[0];
                    fromNode = o.fromNode;
                    toNode = o.toNode;
                    this._id = o.id;
                } else {
                    this._id = id;
                }
                TGL.Link.call(this);
                this.setFromNode(fromNode);
                this.setToNode(toNode);
                this._editable = false;
            };
            
            TGL.extend(main.Link, TGL.Link, {
                className: 'main.Link',
                ___accessor: ['linkType', 'extend', 'controls'],
                __SizePropeties: ['fromNode', 'toNode', 'linkType', 'extend', 'controls'],
                setFromNode: function (fromNode) {
                    if (this._fromNode != fromNode) {
                        var oldValue = this._fromNode;
                        this._fromNode = fromNode;
                        this.onPropertyChange();
                        this.firePropertyChange('fromNode', oldValue, fromNode);
                        if (oldValue) {
            
                        }
                        this._fromNode = fromNode;
                        if (oldValue) {
                            oldValue._removeFromLink(this);
                            oldValue.removePropertyChangeListener(this.handleNodePropertyChange);
                        }
                        if (this._fromNode) {
                            this._fromNode._addFromLink(this);
                            this._fromNode.addPropertyChangeListener(this.handleNodePropertyChange, this);
                        }
                    }
                },
            
                getFromNode: function () {
                    return this._fromNode;
                },
            
                setToNode: function (toNode) {
                    if (this._toNode != toNode) {
                        var oldValue = this._toNode;
                        this._toNode = toNode;
                        this.onPropertyChange();
                        this.firePropertyChange('toNode', oldValue, toNode);
                        if (oldValue) {
                            oldValue.removePropertyChangeListener(this.handleNodePropertyChange);
                            oldValue._removeToLink(this);
                        }
                        if (this._toNode) {
                            this._toNode._addToLink(this);
                            this._toNode.addPropertyChangeListener(this.handleNodePropertyChange, this);
                        }
            
                    }
                },
            
                getToNode: function () {
                    return this._toNode;
                },
            
                isLooped: function () {
                    return this._fromNode === this._toNode && this._fromNode != null && this._toNode !=
                        null;
                },
            
                handleNodePropertyChange: function (event) {
                    if (event.property.startsWith('position') || event.property == 'worldMatrix') {
                        var oldValue = this.vertices;
                        this.onPropertyChange();
                        this.firePropertyChange('vertices', oldValue, this.vertices);
                    }
                },
            
                computeNodeData: function () {
                    this.computeData();
                },
            
                updateMatrix: function () {
            
                },
            
                updateWorldMatrix: function () {
            
                },
            
                computeData: function () {
                    if (this._fromNode == null || this._toNode == null) {
                        return;
                    }
                    if (this._extend == null) {
                        this._extend = 0;
                    }
                    var fromPosition = this._fromNode.worldMatrix.getPosition();
                    var toPosition = this._toNode.worldMatrix.getPosition();
            
                    var vertices = [];
                    var fromNode = this._fromNode;
                    var toNode = this._toNode;
                    var fromBB = fromNode.getBoundingBox();
                    var toBB = toNode.getBoundingBox();
                    var fPos = fromNode.localToWorld2(new mono.Vec3(0, 0, 0));
                    var tPos = toNode.localToWorld2(new mono.Vec3(0, 0, 0));
            
                    if (fPos.y + fromBB.min.y > tPos.y + toBB.max.y) {
                        fPos.y += fromBB.min.y;
                        tPos.y += toBB.max.y;
                    } else if (tPos.y + toBB.min.y > fPos.y + fromBB.max.y) {
                        tPos.y += toBB.min.y;
                        fPos.y += fromBB.max.y;
                    };
            
            
                    vertices.push(new mono.Vec3(fPos.x, fPos.y, fPos.z));
            
                    // if (this.getClient('arc') && !bd.isOrgan(toNode) && fromNode === main.map.rootNode) {
                        vertices.push(new mono.Vec3(fPos.x, fPos.y + (tPos.y - fPos.y) * 1 / 2, fPos.z));
                    // }
                    vertices.push(new mono.Vec3(tPos.x, tPos.y, tPos.z));
                    this.vertices = vertices;
                },
            
                onPropertyChange: function () {
                    this.vertices = this.vertices || [];
                    this.computeData();
                    this.computeBoundingBox();
                    this.selectionData = null;
                    this.boundingSphere = null;
                },
            });


            initWorkflowModel();
            createAllNodes();
            createLights();

            function initWorkflowModel() {
                //注册模型
                make.Default.register('twaver.workflow.roundcube', function (json) {
                    var width = json.width,
                        height = json.height,
                        depth = json.depth,
                        radius = json.radius,
                        color = json.color,
                        objectId = json.objectId;
            
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
            
                    var combo = new mono.ComboNode([centerNode, leftNode, rightNode, topNode, bottomNode, leftTopCylinder, rightTopCylinder, leftBottomCylinder, rightBottomCylinder], ['+'], true, objectId);
                    combo.width = width;
                    combo.height = height;
                    combo.depth = depth;
                    return combo;
                });
            
                make.Default.registerObj('twaver.workflow.dingshi', 'dingshi', '../theme/model/dingshi/');
                make.Default.registerObj('twaver.workflow.jiekou', 'jiekou', '../theme/model/jiekou/');
                make.Default.registerObj('twaver.workflow.qidian', 'qidian', '../theme/model/qidian/');
                make.Default.registerObj('twaver.workflow.shenpi', 'shenpi', '../theme/model/shenpi/');
                make.Default.registerObj('twaver.workflow.shuju', 'shuju', '../theme/model/shuju/');
                make.Default.registerObj('twaver.workflow.web', 'web', '../theme/model/web/');
                make.Default.registerObj('twaver.workflow.yinyong', 'yinyong', '../theme/model/yinyong/');
                make.Default.registerObj('twaver.workflow.zhifufuwu', 'zhifufuwu', '../theme/model/zhifufuwu/');
                make.Default.registerObj('twaver.workflow.sev', 'sev', '../theme/model/sev/');
                make.Default.registerObj('twaver.workflow.shili1', 'shili1', '../theme/model/shili1/');
                make.Default.registerObj('twaver.workflow.shili2', 'shili2', '../theme/model/shili2/');
                make.Default.registerObj('twaver.workflow.S1', 'S1', '../theme/model/S1/');
                make.Default.registerObj('twaver.workflow.S2', 'S2', '../theme/model/S2/');
                make.Default.registerObj('twaver.workflow.S3', 'S3', '../theme/model/S3/');
                make.Default.registerObj('twaver.workflow.SN', 'sn', '../theme/model/sn/');
            
            }

            function createLights() {
                var pointLight = new mono.PointLight(0xFFFFFF, 0.5);
                pointLight.setPosition(0, 2000, 0);
                main.box.add(pointLight);
                main.box.add(new mono.AmbientLight(0x666666));
                var directionalLight = new mono.DirectionalLight(0xaaaaaa, 0.5);
                directionalLight.setDirection(new mono.Vec3(1, 1, 1));
                main.box.add(directionalLight);
                directionalLight = new mono.DirectionalLight(0xaaaaaa, 0.5);
                directionalLight.setDirection(new mono.Vec3(-1, 1, 1));
                main.box.add(directionalLight);
            }
            
            function createAllNodes() {
                var len = workflowData.length;
                main._totalDataCount = len;
                main._totalLoadedDataCount = 0;
                for (var i = 0; i < len; i++) {
                    var data = workflowData[i];
                    createElement(data);
                }
            }
            
            function createElement(data) {
                if (data.type == 'workflow_model') {
                    createWorkflowModel(data);
                } else if (data.type == 'workflow_objmodel') {
                    createWorkflowObjModel(data);
                } else if (data.type == 'workflow_group') {
                    createWorkflowGroup(data);
                } else if (data.type == 'workflow_node') {
                    createWorkflowNode(data)
                }
            }
            
            //模型
            function createWorkflowModel(data) {
                var id = data.id,
                    makeId = data.makeId,
                    position = data.position || [0, 0, 0],
                    rotation = data.rotation || [0, 0, 0],
                    width = data.width || 300,
                    height = data.height || 100,
                    depth = data.depth || 50,
                    radius = data.radius,
                    color = data.color,
                    opacity = data.opacity,
                    billboardData = data.billboardData,
                    obj = {},
                    tower = data.tower,
                    control = data.control,
                    shape = data.shape || '';
                if (radius) {
                    obj = {
                        id: makeId,
                        width: width,
                        height: height,
                        depth: depth,
                        radius: radius,
                        color: color
                    }
                } else {
                    obj = {
                        id: makeId
                    }
                }
                var equip = make.Default.load(obj);
                equip.setRotation(rotation[0], rotation[1], rotation[2]);
                equip.setClient('shape', shape);//自定义属性
                if (radius) {
                    equip.setStyle('m.envmap.image', make.Default.getEnvMap('envmap4'))//设置环境贴图
                } else {
                    equip.text = billboardData.text;
                }
            
                if (data.parentId) {
                    var parent = main.box.getDataById(data.parentId);
                    equip.setParent(parent);
                    var bBox = equip.getBoundingBox();
                    var y = -bBox.min.y * 1.5 + parent.height / 2;
                }
                if (y) {
                    position[1] = y;
                }
                if (opacity) {
                    equip.s({
                        'm.transparent': true,
                        'm.opacity': opacity
                    });
                }
                equip.setPosition(position[0], position[1], position[2]);
                map[id] = equip._id;
                equip.height = height;
                if (!radius) {
                    equip.setScale(1.5, 1.5, 1.5);
                }
                main.box.addByDescendant(equip);
            
                if (billboardData) {
                    //公告牌
                    var billboard = main.utils.createWorkflowBillboard(billboardData);
            
                    var billboardScale = data.billboardScale;
                    if (billboardScale) {
                        billboard.setScale(billboardScale[0], billboardScale[1], billboardScale[2]);
                    }
            
                    var billboardPosition = data.billboardPosition || [0, 0, 0];
                    billboard.setParent(equip);
                    var bBox = equip.getBoundingBox();
                    billboardPosition[1] += bBox.max.y;
                    billboard.setPosition(billboardPosition[0], billboardPosition[1], billboardPosition[2]);
                    main.box.add(billboard);
                }
            
                main._totalLoadedDataCount++;
                if (needStartCreateLinks()) {
                    createLinks();
                    createCanvas();
                }
                if (tower) {
                    towerMap.push(equip);
                    equip.setClient('tower', tower);
                }
            
                if (control) {
                    equip.setClient('control', control);
                }
            }
            
            //立方体
            function createWorkflowNode(data) {
                var width = data.width || 200,
                    height = data.height || 100,
                    depth = data.depth || 50,
                    color = data.color || '#57C385',
                    position = data.position || [0, 55, 0],
                    rotation = data.rotation || [0, 0, 0],
                    text = data.name || '请输入文字',
                    id = data.id,
                    textColor = data.textColor || 'black',
                    opacity = data.opacity;
            
                var canvas = mono.Utils.createTextImage2(text, {
                    font: '50px 微软雅黑', // 文本的字体
                    color: textColor, // 文本的颜色
                    background: color, // 文本的背景色
                    powerOfTwo: true, // 如果为true，则会将canvas的宽高自动设置2的幂
                    canvas: null, // 如果不提供，内部回自动生成一个新的canvas,
                    drawFunction: null, // 如果不提供，会用内部规则绘制文本，函数参数为：function(context, width, height)
                    textAlign: 'center', // 文本对其方式，可选值为'left', 'center'和'right'
                    ratio: null // 如果不提供，会用文本的宽度和高度的比例
                });
            
                width = canvas.width;
                var node = new mono.Cube({
                    width: width,
                    height: height,
                    depth: depth,
                    id: id
                });
            
            
                node.s({
                    'm.type': 'phong',
                    'front.m.texture.image': canvas,
                    'm.color': color,
                    'back.m.texture.image': canvas,
                    'm.texture.anisotropy': 16,
                });
                if (opacity < 1) {
                    node.s({
                        'm.transparent': true,
                        'm.opacity': opacity
                    });
                }
                node.setRotation(rotation[0], rotation[1], rotation[2]);
                if (data.parentId) {
                    var parent = main.box.getDataById(map[data.parentId]);
                    node.setParent(parent);
                    var y = height / 2 + parent.height / 2;
                }
                if (y) {
                    position[1] = y;
                }
            
                node.p(position[0], position[1], position[2]);
                node.setStyle('m.normalmap.image', make.Default.getImagePath() + 'metal_normalmap2.jpg')
                main.box.add(node);
                map[id] = id;
                main._totalLoadedDataCount++;
                if (needStartCreateLinks()) {
                    createLinks();
                    createCanvas();
                }
            }
            
            
            
            //obj模型
            function createWorkflowObjModel(data) {
                var id = data.id,
                    parentId = data.parentId,
                    position = data.position || [0, 0, 0],
                    scale = data.scale || [2, 2, 2],
                    modelId = data.modelId,
                    billboardData = data.billboardData,
                    tower = data.tower,
                    shape = data.shape || '';
                make.Default.load(modelId, function (object3d) {
                    main.box.addByDescendant(object3d);
                    if (data.parentId) {
                        var parent = main.box.getDataById(data.parentId);
                        object3d.setParent(parent);
                        var bBox = object3d.getBoundingBox();
                        var y = -bBox.min.y * 2 + parent.height / 2;
                    }
                    if (y) {
                        position[1] = y;
                    }
                   // position[1] +=100;
                    if (scale) {
                        object3d.setScale(scale[0], scale[1], scale[2]);
                    }
                    object3d.p(position[0], position[1], position[2]);
                    object3d.setStyle('m.envmap.image', make.Default.getEnvMap('envmap5'));
                    object3d.setClient('shape', shape);//自定义属性
                    var height = object3d.getBoundingBox().max.y - object3d.getBoundingBox().min.y;
                    object3d.height = height*2;
                    map[id] = object3d._id;
                    if (billboardData) {
                        object3d.setStyle('m.normalmap.image', make.Default.getImagePath() + 'metal_normalmap2.jpg');
                        object3d.text = billboardData.text;
                        //公告牌
                        var billboard = main.utils.createWorkflowBillboard(billboardData);
            
                        var billboardScale = data.billboardScale;
                        if (billboardScale) {
                            billboard.setScale(billboardScale[0], billboardScale[1], billboardScale[2]);
                        }
            
                        var billboardPosition = data.billboardPosition || [0, 0, 0];
                        billboard.setParent(object3d);
                        var bBox = object3d.getBoundingBox();
                        billboardPosition[1] += bBox.max.y;
                        billboard.setPosition(billboardPosition[0], billboardPosition[1], billboardPosition[2]);
                        main.box.add(billboard);
                    }
            
                    main._totalLoadedDataCount++;
                    if (needStartCreateLinks()) {
                        createLinks();
                        createCanvas();
                    }
            
            
                    if (tower) {
                        towerMap.push(object3d);
                        object3d.setClient('tower', tower);
                    }
                });
            }
            
            //层
            function createWorkflowGroup(data) {
                var width = data.width || 1000,
                    height = data.height || 20,
                    depth = data.depth || 500,
                    color = data.color || 'blue',
                    opacity = data.opacity || 0.9,
                    position = data.position || [0, 500, 0],
                    rotation = data.rotation || [0, 0, 0],
                    parentId = data.parentId,
                    id = data.id;
                var node = new mono.Cube({
                    width: width,
                    height: height,
                    depth: depth,
                    id: id
                });
                node.s({
                    'm.type': 'phong',
                    'm.color': color,
                    'm.ambient': color
                });
                if (opacity < 1) {
                    node.s({
                        'm.transparent': true,
                        'm.opacity': opacity
                    });
                }
                if (parentId) {
                    var parent = main.box.getDataById(map[parentId]);
                    node.setParent(parent);
                    var y = height / 2 + parent.height / 2;
                }
                if (y) {
                    position[1] = y;
                }
                node.setPosition(position[0], position[1], position[2]);
                node.setRotation(rotation[0], rotation[1], rotation[2]);
                node.receiveShadow = true;
                main.box.add(node);
                map[id] = id;
            
                main._totalLoadedDataCount++;
                if (needStartCreateLinks()) {
                    createLinks();
                    createCanvas();
                }
            }
            
            
            
            //判断是否可以创建连线
            function needStartCreateLinks() {
                return main._totalDataCount == main._totalLoadedDataCount;
            }
            
            var self = this;
            function createLinks() {
                for (var i = 0; i < linkJson.length; i++) {
                    var linkData = linkJson[i];
                    if (linkData.type == 'workflow_link') {
                        createWorkflowLink(linkData);
                    } else if (linkData.type == 'workflow_verticalLink') {
                        createWorkflowVerticalLink(linkData);
                    }
                }
            
                main.linkAnimateManager.startAnimate();
                self.btn1.click(function () {
                    main.linkAnimateManager.stopWorkflowAnimate();
                    main.linkAnimateManager.startWorkflowAnimate('top');
                });
                self.btn3.click(function () {
                    main.linkAnimateManager.stopWorkflowAnimate();
                });
                self.btn2.click(function () {
                    main.linkAnimateManager.stopWorkflowAnimate();
                    main.linkAnimateManager.startWorkflowAnimate('middle');
                });
            
                towerMap.forEach(function (v) {
                    createTower(v);
                });
            }
            
            //塔
            function createTower(v) {
                var arr = v.getLinks()._as;
                var newArr = arr.filter(function (value) {
                    return value._linkType == 'control' && value._fromNode == v;
                })
                var bottomRadius;
                var length = newArr.length;
                var fromP = v.worldMatrix.getPosition();
                var toP = newArr[0]._toNode.worldMatrix.getPosition();
                if (length == 2) {
                    bottomRadius = 145;
                } else {
                    bottomRadius = 200;
                }
                if (v.getClient('tower') == 'from') {
                    fromP.y -= 510 + v.getBoundingBox().min.y;
                    var height = fromP.y - toP.y - (newArr[0]._toNode.getBoundingBox().max.y - newArr[0]._toNode.getBoundingBox().min.y);
                    fromP.y -= height / 2;
                    var tower = new mono.Cylinder(0, bottomRadius, height, length, 1, false, true);
                } else if (v.getClient('tower') == 'to') {
                    fromP.y += 290 - v.getBoundingBox().min.y;
                    var height = -fromP.y + toP.y - (newArr[0]._toNode.getBoundingBox().max.y - newArr[0]._toNode.getBoundingBox().min.y);
                    fromP.y += height / 2;
                    var tower = new mono.Cylinder(bottomRadius, 0, height, length, 1, true, false);
                }
            
                tower.p(fromP);
                tower.s({
                    'm.type': 'phong',
                    'm.color': '#ffa300',
                    'm.transparent': true,
                    'm.opacity': 0.6
                });
                tower.setRotation(0, Math.PI / length, 0);
                main.box.add(tower);
            
                var node = newArr[0]._toNode;
                var angle = Math.PI / length;
                var parentP = node.getParent().worldMatrix.getPosition();
                var worldP,
                    x,
                    y,
                    z;
                if (v.getClient('tower') == 'from') {
                    worldP = new mono.Vec3(fromP.x - Math.sin(angle) * bottomRadius, fromP.y - height / 2 - node.height / 2, fromP.z + Math.cos(angle) * bottomRadius);
                } else if (v.getClient('tower') == 'to') {
                    worldP = new mono.Vec3(fromP.x - Math.sin(angle) * bottomRadius, fromP.y + height / 2 + node.height / 2, fromP.z + Math.cos(angle) * bottomRadius);
                }
                x = worldP.x - parentP.x;
                z = worldP.z - parentP.z; 
                y = worldP.y - parentP.y;
                node.p(x, y, z);
                var position = node.p();
            
                var axis = new mono.Vec3(0, 1, 0);
                var ang = -Math.PI * 2 / length;
                var center = fromP;
                for (var i = 1; i < newArr.length; i++) {
                    node = newArr[i]._toNode;
                    var pos = worldP.clone();
                    var newPosition = pos.rotateFromAxisAndCenter(axis, ang * i, center);
                    newPosition.x -= parentP.x;
                    newPosition.y -= parentP.y;
                    newPosition.z -= parentP.z;
                    node.p(newPosition);
                }
            }
            
            //连线
            function createWorkflowLink(data) {
                var box = main.box;
                var fromNode = box.getDataById(map[data.fromId]);
                var toNode = box.getDataById(map[data.toId]);
                var radius = data.radius || 3;
                var color = data.color || 'yellow';
                // var fromOffset = data.fromOffset;
                // var toOffset = data.toOffset;
                var endCap = data.endCap;
                var startCap = data.startCap;
                var linkType = data.linkType;
                var flow = data.flow || '';
                var workflowId = data.workflowId || '';
            
                if (fromNode && toNode) {
                    var link = new mono.PathLink(fromNode, toNode, data.id);
                    // var bBox = link.getBoundingBox();
            
                    var plength = link.getPath().getLength();
                    link.setRadius(radius);
                    link.s({
                        'm.type': 'phong',
                        'm.color': color,
                        'm.ambient': color
                    });
                    link.workflowId = workflowId;
                    // if (fromOffset) {
                    //     link.setFromOffset(fromOffset);
                    // }
                    // if (toOffset) {
                    //     link.setToOffset(toOffset);
                    // }
                    if (endCap) {
                        var endCapSize = data.endCapSize || 10;
                        var endCapR = data.endCapR || 2;
                        link.setEndCap(endCap);
                        link.setEndCapSize(endCapSize);
                        link.setEndCapR(endCapR);
                    }
                    if (startCap) {
                        var startCapSize = data.startCapSize || 10;
                        var startCapR = data.startCapR || 2;
                        link.setStartCap(startCap);
                        link.setStartCapSize(startCapSize);
                        link.setStartCapR(startCapR);
                    }
                    if (linkType) {
                        link.setLinkType(linkType);
                    }
                    box.add(link);
                    if (flow) {
                        link.s({
                            'm.texture.image': 'images/flow.jpg',
                            'm.texture.repeat': new mono.Vec2(plength / 60, 1)
                        });
                        main.linkAnimateManager.addLink(link);
                    }
            
                    main.linkAnimateManager.addWorkflowLink(link);
                }
            }
            
            //竖线
            function createWorkflowVerticalLink(data) {
                var box = main.box;
                var id = data.id;
                var fromNode = box.getDataById(map[data.fromId]);
                var toNode = box.getDataById(map[data.toId]);
                var color = data.color || '#ffa300';
                var linkType = data.linkType;
            
                if (fromNode && toNode) {
                    var link = new main.Link(fromNode, toNode, id);
                    link.s({
                        'm.color': color,
                        'm.ambient': color
                    });
                    if (linkType == 'control') {
                        link.setLinkType('control');
                        var worldPosition = fromNode.worldMatrix.getPosition();
                        if (fromNode.getClient('tower') == 'to' || fromNode.getClient('control') == 'bottom') {
                            worldPosition.y += 300;
                        } else { 
                            worldPosition.y -= 500;
                        }
                        link.setControls([worldPosition]);
                    }
            
                    box.add(link);
                }
            }
            
            
            
            function createCanvas() {
                for(var i = 0; i < dataJson.length; i++) {
                    var data = dataJson[i]
                    if(data.type == 'workflow_group') {
                        drawCanvas(data) 
                    }
                }  
            }
            
            function drawCanvas(data) {
                var id = data.id;  
                var model = main.box.getDataById(map[id]);
                var modelChildren = model.getChildren()._as;
                var length = modelChildren.length;
                var bbox = model.getBoundingBox();
                var width = bbox.max.x - bbox.min.x;
                var depth = bbox.max.z - bbox.min.z;
                var offsetX = 2;
            
                var canvas = document.createElement('canvas')
                canvas.width = 512;
                canvas.height = 512;
            
                if(canvas.getContext) {
                    var ctx = canvas.getContext('2d')
            
                    ctx.fillStyle = "white";//画布本身填充的颜色
                    ctx.fillRect(0,0,canvas.width,canvas.height);
            
                    ctx.shadowBlur = 30;
                    ctx.shadowColor="black";
                    ctx.fillStyle = "black";//画布上的物体填充的颜色
                    
                    for(var j = 0; j < length; j++) {
                        var child = modelChildren[j];
                        var childPos = child.p();         
                        var x = childPos.x;
                        var y = childPos.z;
                        x += width/2;//减去画布坐标之后的值
                        y += depth/2;           
            
                       if(child.getClient('shape') == 'sexangle') {
                            var childBBox = child.getBoundingBox();
                            var childHeight = childBBox.max.z - childBBox.min.z;
                            var childWidth = (childBBox.max.x - childBBox.min.x)/2;
                            var x0 = x - childWidth - offsetX;
                            var y0 = y - childHeight;
            
                            var x1 = x + childWidth + offsetX;
                            var y1 = y + childHeight;
            
                            //画布大小与model的大小不一致，坐标需要进行转换
                            x0 = x0 * canvas.width/width;
                            y0 = y0 * canvas.height/depth;
            
                            x1 = x1 * canvas.width/width;
                            y1 = y1 * canvas.height/depth;
            
                            ctx.fillRect(x0, y0, x1-x0, y1 - y0);
            
                       } else if(child.getClient('shape') == 'cube'){
            
                            var childBBox = child.getBoundingBox();
                            var childHeight = (childBBox.max.z - childBBox.min.z);
                            var childWidth = (childBBox.max.x - childBBox.min.x)*2;
                      
                            var x0 = x - childWidth/2 - 2;
                            var y0 = y - childHeight/2 -10;
                      
                            x0 = x0 * canvas.width/width;
                            y0 = y0 * canvas.height/depth;
            
                            ctx.fillRect(x0, y0, childWidth-25, childHeight/2);
            
                       }  else if(child.getClient('shape') == 'cube1'){
                        
                                        var childBBox = child.getBoundingBox();
                                        var childHeight = (childBBox.max.z - childBBox.min.z);
                                        var childWidth = (childBBox.max.x - childBBox.min.x)*2;
                                  
                                        var x0 = x - childWidth/2 + 10;
                                        var y0 = y - childHeight/2 - 10;
                                  
                                        x0 = x0 * canvas.width/width;
                                        y0 = y0 * canvas.height/depth;
                        
                                        ctx.fillRect(x0, y0, childWidth-35, childHeight/2 - 15);
                                   }            
            
                        
                    }
                }    
                model.setStyle('top.m.texture.image', canvas)
            }
        },

    
        getTitle : function(){
            return '流程图';//monitor_Synchronize
        },
    
        getContentClass : function(){
            return '';
        },
    
        getContentPanel : function(){
            return this.workflowPanel;
        },
        
       
    })

    workflowPanel = new $WorkflowPanel(main.sceneManager);
    main.nodeEventHander.serverPanel.register(workflowPanel);

}






//流程图
//数据
var workflowData = [
    //第一层
    {
        id: 'group_001',
        type: 'workflow_model',
        parentId: '',
        makeId: 'twaver.workflow.roundcube',
        width: 4000,
        height: 20,
        depth: 2000,
        radius: 200,
        color: '#164478',
        opacity: '0.5',
        position: [0, 500, 0],
        rotation: ''
    },
    //第一个模块
    {
        id: 'group_002',
        type: 'workflow_group',
        parentId: 'group_001',
        width: 600,
        height: '',
        depth: 1800,
        color: '#005780',
        opacity: 0.8,
        position: [-1380, 0, 0],
        rotation: ''
    },
    //obj模型
    {
        id: 'objModel_001',
        type: 'workflow_objmodel',
        parentId: 'group_002',
        modelId: 'twaver.workflow.qidian',
        position: [0, 0, 600],
        scale: [2, 2, 2],
        billboardData: {
            text: '发起报账申请',
            bgColor: 'yellow',
            fontColor: 'black'
        },
        billboardScale: '',
        billboardPosition: [0, 10, 0],
        shape: 'sexangle'
    },
    {
        id: 'objModel_002',
        type: 'workflow_objmodel',
        parentId: 'group_002',
        modelId: 'twaver.workflow.shenpi',
        position: [0, 0, 0],
        scale: [2, 2, 2],
        billboardData: {
            text: '领导审批',
            bgColor: 'yellow',
            fontColor: 'black'
        },
        billboardScale: '',
        billboardPosition: [0, 10, 0],
        shape: 'sexangle'
    },
    {
        id: 'objModel_003',
        type: 'workflow_objmodel',
        parentId: 'group_002',
        modelId: 'twaver.workflow.shenpi',
        position: [0, 0, -600],
        scale: [2, 2, 2],
        billboardData: {
            text: '会计审核记账',
            bgColor: 'yellow',
            fontColor: 'black'
        },
        billboardScale: '',
        billboardPosition: [0, 10, 0],
        shape: 'sexangle'
    },

    //第二个模块
    {
        id: 'group_003',
        type: 'workflow_group',
        parentId: 'group_001',
        width: 600,
        height: '',
        depth: 600,
        color: '#005780',
        opacity: 0.8,
        position: [-460, 0, -600],
        rotation: ''
    },
    //obj模型
    {
        id: 'objModel_004',
        type: 'workflow_objmodel',
        parentId: 'group_003',
        modelId: 'twaver.workflow.zhifufuwu',
        position: [0, 0, 0],
        scale: [2, 2, 2],
        billboardData: {
            text: '凭证过账服务',
            bgColor: 'yellow',
            fontColor: 'black'
        },
        billboardScale: '',
        billboardPosition: [0, 10, 0],
        shape: 'sexangle'
    },

    //第三个模块
    {
        id: 'group_004',
        type: 'workflow_group',
        parentId: 'group_001',
        width: 600,
        height: '',
        depth: 1800,
        color: '#005780',
        opacity: 0.8,
        position: [460, 0, 0],
        rotation: ''
    },
    //obj模型
    {
        id: 'objModel_005',
        type: 'workflow_objmodel',
        parentId: 'group_004',
        modelId: 'twaver.workflow.zhifufuwu',
        position: [0, 0, -600],
        scale: [2, 2, 2],
        billboardData: {
            text: '产生支付代办',
            bgColor: 'yellow',
            fontColor: 'black'
        },
        billboardScale: '',
        billboardPosition: [0, 10, 0],
        shape: 'sexangle'
    },
    {
        id: 'objModel_006',
        type: 'workflow_objmodel',
        parentId: 'group_004',
        modelId: 'twaver.workflow.shenpi',
        position: [0, 0, 0],
        scale: [2, 2, 2],
        billboardData: {
            text: '领导审批',
            bgColor: 'yellow',
            fontColor: 'black'
        },
        billboardScale: '',
        billboardPosition: [0, 10, 0],
        shape: 'sexangle'
    },
    {
        id: 'objModel_007',
        type: 'workflow_objmodel',
        parentId: 'group_004',
        modelId: 'twaver.workflow.zhifufuwu',
        position: [0, 0, 600],
        scale: [2, 2, 2],
        billboardData: {
            text: '支付服务',
            bgColor: 'yellow',
            fontColor: 'black'
        },
        billboardScale: '',
        billboardPosition: [0, 10, 0],
        shape: 'sexangle'
    },


    //第四个模块
    {
        id: 'group_005',
        type: 'workflow_group',
        parentId: 'group_001',
        width: 600,
        height: '',
        depth: 1800,
        color: '#005780',
        opacity: 0.8,
        position: [1380, 0, 0],
        rotation: ''
    },
    //obj模型

    {
        id: 'objModel_008',
        type: 'workflow_objmodel',
        parentId: 'group_005',
        modelId: 'twaver.workflow.zhifufuwu',
        position: [0, 0, 0],
        scale: [2, 2, 2],
        billboardData: {
            text: '支付服务',
            bgColor: 'yellow',
            fontColor: 'black'
        },
        billboardScale: '',
        billboardPosition: [0, 10, 0],
        shape: 'sexangle'
    },

    //第二层
    {
        id: 'group_006',
        type: 'workflow_model',
        parentId: '',
        makeId: 'twaver.workflow.roundcube',
        width: 4000,
        height: 20,
        depth: 2000,
        radius: 200,
        color: '#164478',
        opacity: '0.5',
        position: [0, -300, 0],
        rotation: '',
        shape: 'sexangle'
    },
    //第一个模块
    {
        id: 'group_007',
        type: 'workflow_group',
        parentId: 'group_006',
        width: 600,
        height: '',
        depth: 1800,
        color: '#005780',
        opacity: 0.8,
        position: [-1380, 0, 0],
        rotation: ''
    },
    //obj模型
    {
        id: 'objModel_009',
        type: 'workflow_objmodel',
        parentId: 'group_007',
        modelId: 'twaver.workflow.web',
        position: [0, 0, 675],
        scale: [2, 2, 2],
        billboardData: {
            text: 'web服务',
            bgColor: 'yellow',
            fontColor: 'black'
        },
        billboardScale: '',
        billboardPosition: [0, 10, 25],
        tower: 'from',
        shape: 'sexangle'
    },
    {
        id: 'objModel_010',
        type: 'workflow_objmodel',
        parentId: 'group_007',
        modelId: 'twaver.workflow.shuju',
        position: [0, 0, 225],
        scale: [2, 2, 2],
        billboardData: {
            text: '财辅数据库服务',
            bgColor: 'yellow',
            fontColor: 'black'
        },
        billboardScale: '',
        billboardPosition: [0, 10, 25],
        shape: 'sexangle',
        tower: 'from'
    },
    {
        id: 'objModel_011',
        type: 'workflow_objmodel',
        parentId: 'group_007',
        modelId: 'twaver.workflow.dingshi',
        position: [0, 0, -225],
        scale: [2, 2, 2],
        billboardData: {
            text: '定时作业服务',
            bgColor: 'yellow',
            fontColor: 'black'
        },
        billboardScale: '',
        billboardPosition: [0, 10, 25],
        tower: 'from',
        shape: 'sexangle'
    },
    {
        id: 'objModel_012',
        type: 'workflow_objmodel',
        parentId: 'group_007',
        modelId: 'twaver.workflow.jiekou',
        position: [0, 0, -675],
        scale: [2, 2, 2],
        billboardData: {
            text: '接口服务',
            bgColor: 'yellow',
            fontColor: 'black'
        },
        billboardScale: '',
        billboardPosition: [0, 10, 25],
        tower: 'from',
        shape: 'sexangle'
    },
    //第二个模块
    {
        id: 'group_008',
        type: 'workflow_group',
        parentId: 'group_006',
        width: 600,
        height: '',
        depth: 1800,
        color: '#005780',
        opacity: 0.8,
        position: [-460, 0, 0],
        rotation: ''
    },
    //obj模型
    {
        id: 'objModel_013',
        type: 'workflow_objmodel',
        parentId: 'group_008',
        modelId: 'twaver.workflow.yinyong',
        position: [0, 0, -675],
        scale: [2, 2, 2],
        billboardData: {
            text: 'ZFR_GLA_SET\n服务',
            bgColor: 'yellow',
            fontColor: 'black'
        },
        billboardScale: '',
        billboardPosition: [0, 10, 0],
        shape: 'sexangle'
    },
    {
        id: 'objModel_014',
        type: 'workflow_objmodel',
        parentId: 'group_008',
        modelId: 'twaver.workflow.shuju',
        position: [0, 0, 0],
        scale: [2, 2, 2],
        billboardData: {
            text: 'SPA数据库',
            bgColor: 'yellow',
            fontColor: 'black'
        },
        billboardScale: '',
        billboardPosition: [0, 10, 0],
        shape: 'sexangle',
        tower: 'from'
    },
    {
        id: 'objModel_015',
        type: 'workflow_objmodel',
        parentId: 'group_008',
        modelId: 'twaver.workflow.yinyong',
        position: [0, 0, 675],
        scale: [2, 2, 2],
        billboardData: {
            text: 'ZFI_PAYMENT_VOU_GET\n服务',
            bgColor: 'yellow',
            fontColor: 'black'
        },
        billboardScale: '',
        billboardPosition: [0, 10, 0],
        shape: 'sexangle'
    },
    //第三个模块
    {
        id: 'group_009',
        type: 'workflow_group',
        parentId: 'group_006',
        width: 600,
        height: '',
        depth: 1800,
        color: '#005780',
        opacity: 0.8,
        position: [460, 0, 0],
        rotation: ''
    },
    //obj模型
    {
        id: 'objModel_016',
        type: 'workflow_objmodel',
        parentId: 'group_009',
        modelId: 'twaver.workflow.jiekou',
        position: [0, 0, 675],
        scale: [2, 2, 2],
        billboardData: {
            text: '接口服务\n(定时作业)',
            bgColor: 'yellow',
            fontColor: 'black'
        },
        billboardScale: '',
        billboardPosition: [0, 10, 0],
        tower: 'from',
        shape: 'sexangle'
    },
    {
        id: 'objModel_017',
        type: 'workflow_objmodel',
        parentId: 'group_009',
        modelId: 'twaver.workflow.shuju',
        position: [0, 0, 0],
        scale: [2, 2, 2],
        billboardData: {
            text: 'SPA数据库',
            bgColor: 'yellow',
            fontColor: 'black'
        },
        billboardScale: '',
        billboardPosition: [0, 10, 0],
        shape: 'sexangle',
        tower: 'from'
    },
    {
        id: 'objModel_018',
        type: 'workflow_objmodel',
        parentId: 'group_009',
        modelId: 'twaver.workflow.web',
        position: [0, 0, -675],
        scale: [2, 2, 2],
        billboardData: {
            text: 'web服务',
            bgColor: 'yellow',
            fontColor: 'black'
        },
        billboardScale: '',
        billboardPosition: [0, 10, 0],
        tower: 'from',
        shape: 'sexangle'
    },
    //第四个模块
    {
        id: 'group_010',
        type: 'workflow_group',
        parentId: 'group_006',
        width: 600,
        height: '',
        depth: 1800,
        color: '#005780',
        opacity: 0.8,
        position: [1380, 0, 0],
        rotation: ''
    },
    //obj模型
    {
        id: 'objModel_019',
        type: 'workflow_objmodel',
        parentId: 'group_010',
        modelId: 'twaver.workflow.zhifufuwu',
        position: [0, 0, 0],
        scale: [2, 2, 2],
        billboardData: {
            text: '支付服务',
            bgColor: 'yellow',
            fontColor: 'black'
        },
        billboardScale: '',
        billboardPosition: [0, 10, 0],
        shape: 'sexangle'
    },
    //第三层
    {
        id: 'group_011',
        type: 'workflow_model',
        parentId: '',
        makeId: 'twaver.workflow.roundcube',
        width: 4000,
        height: 20,
        depth: 2000,
        radius: 200,
        color: '#164478',
        opacity: '0.5',
        position: [0, -1100, 0],
        rotation: ''
    },

    //第一个模块
    {
        id: 'group_012',
        type: 'workflow_group',
        parentId: 'group_011',
        width: 600,
        height: '',
        depth: 1800,
        color: '#005780',
        opacity: 0.8,
        position: [-1380, 0, 0],
        rotation: '',
        shape: 'cube'
    },
    //立方体
    {
        id: 'rquest_001',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.sev',
        parentId: 'group_012',
        position: [-150, 0, 775],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_002',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.sev',
        parentId: 'group_012',
        position: [-150, 0, 575],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_003',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.sev',
        parentId: 'group_012',
        position: [150, 0, 575],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_004',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.sev',
        parentId: 'group_012',
        position: [150, 0, 775],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_005',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.shili1',
        parentId: 'group_012',
        position: [-150, 0, 225],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_006',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.shili2',
        parentId: 'group_012',
        position: [150, 0, 225],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_007',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.sev',
        parentId: 'group_012',
        position: [-150, 0, -125],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_008',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.sev',
        parentId: 'group_012',
        position: [-150, 0, -325],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_009',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.sev',
        parentId: 'group_012',
        position: [150, 0, -325],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_010',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.sev',
        parentId: 'group_012',
        position: [150, 0, -125],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_011',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.sev',
        parentId: 'group_012',
        position: [-150, 0, -575],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_012',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.sev',
        parentId: 'group_012',
        position: [-150, 0, -775],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_013',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.sev',
        parentId: 'group_012',
        position: [150, 0, -775],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_014',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.sev',
        parentId: 'group_012',
        position: [150, 0, -575],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    //第二个模块
    {
        id: 'group_013',
        type: 'workflow_group',
        parentId: 'group_011',
        width: 600,
        height: '',
        depth: 1800,
        color: '#005780',
        opacity: 0.8,
        position: [-460, 0, 0],
        rotation: ''
    },
    //立方体
    {
        id: 'rquest_015',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.shili1',
        parentId: 'group_013',
        position: [-150, 0, 0],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_016',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.shili2',
        parentId: 'group_013',
        position: [150, 0, 0],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    //第三个模块
    {
        id: 'group_014',
        type: 'workflow_group',
        parentId: 'group_011',
        width: 600,
        height: '',
        depth: 1800,
        color: '#005780',
        opacity: 0.8,
        position: [460, 0, 0],
        rotation: ''
    },
    //立方体
    {
        id: 'rquest_017',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.sev',
        parentId: 'group_014',
        position: [-150, 0, 775],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_018',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.sev',
        parentId: 'group_014',
        position: [-150, 0, 575],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_019',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.sev',
        parentId: 'group_014',
        position: [150, 0, 575],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_020',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.sev',
        parentId: 'group_014',
        position: [150, 0, 775],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_021',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.shili1',
        parentId: 'group_014',
        position: [-150, 0, 0],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_022',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.shili2',
        parentId: 'group_014',
        position: [150, 0, 0],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_023',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.sev',
        parentId: 'group_014',
        position: [-150, 0, -575],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_024',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.sev',
        parentId: 'group_014',
        position: [-150, 0, -775],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_025',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.sev',
        parentId: 'group_014',
        position: [150, 0, -775],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_026',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.sev',
        parentId: 'group_014',
        position: [150, 0, -575],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    //第四个模块
    {
        id: 'group_015',
        type: 'workflow_group',
        parentId: 'group_011',
        width: 600,
        height: '',
        depth: 1800,
        color: '#005780',
        opacity: 0.8,
        position: [1380, 0, 0],
        rotation: ''
    },
    //立方体
    {
        id: 'rquest_027',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.sev',
        parentId: 'group_015',
        position: [0, 0, 0],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    //第四层
    {
        id: 'group_016',
        type: 'workflow_model',
        parentId: '',
        makeId: 'twaver.workflow.roundcube',
        width: 4000,
        height: 20,
        depth: 2000,
        radius: 200,
        color: '#164478',
        opacity: '0.5',
        position: [0, -1900, 0],
        rotation: ''
    },
    //第一个模块
    {
        id: 'group_017',
        type: 'workflow_group',
        parentId: 'group_016',
        width: 600,
        height: '',
        depth: 1800,
        color: '#005780',
        opacity: 0.8,
        position: [-1380, 0, 0],
        rotation: ''
    },
    //立方体
    {
        id: 'rquest_028',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.S1',
        parentId: 'group_017',
        position: [-150, 0, 775],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_029',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.S2',
        parentId: 'group_017',
        position: [-150, 0, 575],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_030',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.S3',
        parentId: 'group_017',
        position: [150, 0, 575],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_031',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.SN',
        parentId: 'group_017',
        position: [150, 0, 775],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_032',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.shili1',
        parentId: 'group_017',
        position: [-150, 0, 225],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_033',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.shili2',
        parentId: 'group_017',
        position: [150, 0, 225],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_034',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.S1',
        parentId: 'group_017',
        position: [-150, 0, -125],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_035',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.S2',
        parentId: 'group_017',
        position: [-150, 0, -325],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_036',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.S3',
        parentId: 'group_017',
        position: [150, 0, -325],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_037',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.SN',
        parentId: 'group_017',
        position: [150, 0, -125],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_038',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.S1',
        parentId: 'group_017',
        position: [-150, 0, -575],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_039',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.S2',
        parentId: 'group_017',
        position: [-150, 0, -775],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_040',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.S3',
        parentId: 'group_017',
        position: [150, 0, -775],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_041',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.SN',
        parentId: 'group_017',
        position: [150, 0, -575],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    //第二个模块
    {
        id: 'group_018',
        type: 'workflow_group',
        parentId: 'group_016',
        width: 600,
        height: '',
        depth: 1800,
        color: '#005780',
        opacity: 0.8,
        position: [460, 0, 0],
        rotation: ''
    },
    //立方体
    {
        id: 'rquest_042',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.sev',
        parentId: 'group_018',
        position: [-150, 0, 775],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_043',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.sev',
        parentId: 'group_018',
        position: [-150, 0, 575],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_044',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.sev',
        parentId: 'group_018',
        position: [150, 0, 575],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_045',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.sev',
        parentId: 'group_018',
        position: [150, 0, 775],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_046',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.shili1',
        parentId: 'group_018',
        position: [-150, 0, 0],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_047',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.shili2',
        parentId: 'group_018',
        position: [150, 0, 0],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_048',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.sev',
        parentId: 'group_018',
        position: [-150, 0, -575],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_049',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.sev',
        parentId: 'group_018',
        position: [-150, 0, -775],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_050',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.sev',
        parentId: 'group_018',
        position: [150, 0, -775],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    {
        id: 'rquest_051',
        type: 'workflow_objmodel',
        modelId: 'twaver.workflow.sev',
        parentId: 'group_018',
        position: [150, 0, -575],
        scale: [2, 2, 2],
        shape: 'cube'
    },
    //第五层
    {
        id: 'group_019',
        type: 'workflow_model',
        parentId: '',
        makeId: 'twaver.workflow.roundcube',
        width: 4000,
        height: 20,
        depth: 2000,
        radius: 200,
        color: '#164478',
        opacity: '0.5',
        position: [0, -2700, 0],
        rotation: ''
    },
    //第一个模块
    {
        id: 'group_020',
        type: 'workflow_group',
        parentId: 'group_019',
        width: 600,
        height: '',
        depth: 1800,
        color: '#005780',
        opacity: 0.8,
        position: [-1380, 0, 0],
        rotation: ''
    },
    //模型
    {
        id: 'model_001',
        type: 'workflow_model',
        parentId: 'group_020',
        makeId: 'twaver.idc.simpleRack',
        position: [0, 0, 675],
        rotation: '',
        billboardData: {
            text: '主机',
            bgColor: 'yellow',
            fontColor: 'black'
        },
        billboardScale: '',
        billboardPosition: [0, 10, 25],
        tower: 'to',
        shape: 'cube1'
    },
    {
        id: 'model_002',
        type: 'workflow_model',
        parentId: 'group_020',
        makeId: 'twaver.idc.simpleRack',
        position: [0, 0, 225],
        rotation: '',
        billboardData: {
            text: '主机',
            bgColor: 'yellow',
            fontColor: 'black'
        },
        billboardScale: '',
        billboardPosition: [0, 10, 25],
        control: 'bottom',
        shape: 'cube1',
        tower: 'to'
    },
    {
        id: 'model_003',
        type: 'workflow_model',
        parentId: 'group_020',
        makeId: 'twaver.idc.simpleRack',
        position: [0, 0, -225],
        rotation: '',
        billboardData: {
            text: '主机',
            bgColor: 'yellow',
            fontColor: 'black'
        },
        billboardScale: '',
        billboardPosition: [0, 10, 25],
        tower: 'to',
        shape: 'cube1'
    },
    {
        id: 'model_004',
        type: 'workflow_model',
        parentId: 'group_020',
        makeId: 'twaver.idc.simpleRack',
        position: [0, 0, -675],
        rotation: '',
        billboardData: {
            text: '主机',
            bgColor: 'yellow',
            fontColor: 'black'
        },
        billboardScale: '',
        billboardPosition: [0, 10, 25],
        tower: 'to',
        shape: 'cube1'
    },
    //第二个模块
    {
        id: 'group_021',
        type: 'workflow_group',
        parentId: 'group_019',
        width: 600,
        height: '',
        depth: 1800,
        color: '#005780',
        opacity: 0.8,
        position: [460, 0, 0],
        rotation: ''
    },
    //模型
    {
        id: 'model_005',
        type: 'workflow_model',
        parentId: 'group_021',
        makeId: 'twaver.idc.simpleRack3',
        position: [0, 0, 675],
        rotation: '',
        billboardData: {
            text: '交换机',
            bgColor: 'yellow',
            fontColor: 'black'
        },
        billboardScale: '',
        billboardPosition: [0, 10, 25],
        tower: 'to',
        shape: 'cube1'
    },
    {
        id: 'model_006',
        type: 'workflow_model',
        parentId: 'group_021',
        makeId: 'twaver.idc.simpleRack3',
        position: [0, 0, 0],
        rotation: '',
        billboardData: {
            text: '交换机',
            bgColor: 'yellow',
            fontColor: 'black'
        },
        billboardScale: '',
        billboardPosition: [0, 10, 25],
        control: 'bottom',
        shape: 'cube1',
        tower: 'to'
    },
    {
        id: 'model_007',
        type: 'workflow_model',
        parentId: 'group_021',
        makeId: 'twaver.idc.simpleRack3',
        position: [0, 0, -675],
        rotation: '',
        billboardData: {
            text: '交换机',
            bgColor: 'yellow',
            fontColor: 'black'
        },
        billboardScale: '',
        billboardPosition: [0, 10, 25],
        tower: 'to',
        shape: 'cube1'
    },
    //第三个模块
    {
        id: 'group_022',
        type: 'workflow_group',
        parentId: 'group_019',
        width: 600,
        height: '',
        depth: 1800,
        color: '#005780',
        opacity: 0.8,
        position: [1380, 0, 0],
        rotation: ''
    },
    //模型
    {
        id: 'model_008',
        type: 'workflow_model',
        parentId: 'group_022',
        makeId: 'twaver.idc.simpleRack',
        position: [0, 0, 0],
        rotation: '',
        billboardData: {
            text: '主机',
            bgColor: 'yellow',
            fontColor: 'black'
        },
        billboardScale: '',
        billboardPosition: [0, 10, 25],
        shape: 'cube1'
    },
    //后面一层
    {
        id: 'group_023',
        type: 'workflow_model',
        parentId: '',
        makeId: 'twaver.workflow.roundcube',
        width: 4000,
        height: 20,
        depth: 3200,
        radius: 200,
        color: '#164478',
        opacity: '0.5',
        position: [0, -900, -1200],
        rotation: [Math.PI / 2, 0, 0]
    },
    //立方体
    {
        id: 'rquest_052',
        type: 'workflow_node',
        name: '财辅报账',
        parentId: 'group_023',
        width: '',
        height: '',
        depth: 5,
        color: '#ffa042',
        textColor: '',
        position: [-1380, 0, -1650],
        rotation: [-Math.PI / 2, 0, 0]
    },
    {
        id: 'rquest_053',
        type: 'workflow_node',
        name: 'SPA-FICO',
        parentId: 'group_023',
        width: '',
        height: '',
        depth: 5,
        color: '#ffa042',
        textColor: '',
        position: [-460, 0, -1650],
        rotation: [-Math.PI / 2, 0, 0]
    },
    {
        id: 'rquest_054',
        type: 'workflow_node',
        name: '财辅银企',
        parentId: 'group_023',
        width: '',
        height: '',
        depth: 5,
        color: '#ffa042',
        textColor: '',
        position: [460, 0, -1650],
        rotation: [-Math.PI / 2, 0, 0]
    },
    {
        id: 'rquest_055',
        type: 'workflow_node',
        name: '银行系统',
        parentId: 'group_023',
        width: '',
        height: '',
        depth: 5,
        color: '#ffa042',
        textColor: '',
        position: [1380, 0, -1650],
        rotation: [-Math.PI / 2, 0, 0]
    },
    {
        id: 'rquest_056',
        type: 'workflow_node',
        name: '财辅报账',
        parentId: 'group_023',
        width: '',
        height: '',
        depth: 5,
        color: '#ffa042',
        textColor: '',
        position: [-1380, 0, -850],
        rotation: [-Math.PI / 2, 0, 0]
    },
    {
        id: 'rquest_057',
        type: 'workflow_node',
        name: 'SPA-FICO',
        parentId: 'group_023',
        width: '',
        height: '',
        depth: 5,
        color: '#ffa042',
        textColor: '',
        position: [-460, 0, -850],
        rotation: [-Math.PI / 2, 0, 0]
    },
    {
        id: 'rquest_058',
        type: 'workflow_node',
        name: '财辅银企',
        parentId: 'group_023',
        width: '',
        height: '',
        depth: 5,
        color: '#ffa042',
        textColor: '',
        position: [460, 0, -850],
        rotation: [-Math.PI / 2, 0, 0]
    },
    {
        id: 'rquest_059',
        type: 'workflow_node',
        name: '银行系统',
        parentId: 'group_023',
        width: '',
        height: '',
        depth: 5,
        color: '#ffa042',
        textColor: '',
        position: [1380, 0, -850],
        rotation: [-Math.PI / 2, 0, 0]
    },
    {
        id: 'rquest_060',
        type: 'workflow_node',
        name: '财辅报账',
        parentId: 'group_023',
        width: '',
        height: '',
        depth: 5,
        color: '#ffa042',
        textColor: '',
        position: [-1380, 0, -50],
        rotation: [-Math.PI / 2, 0, 0]
    },
    {
        id: 'rquest_061',
        type: 'workflow_node',
        name: 'SPA-FICO',
        parentId: 'group_023',
        width: '',
        height: '',
        depth: 5,
        color: '#ffa042',
        textColor: '',
        position: [-460, 0, -50],
        rotation: [-Math.PI / 2, 0, 0]
    },
    {
        id: 'rquest_062',
        type: 'workflow_node',
        name: '财辅银企',
        parentId: 'group_023',
        width: '',
        height: '',
        depth: 5,
        color: '#ffa042',
        textColor: '',
        position: [460, 0, -50],
        rotation: [-Math.PI / 2, 0, 0]
    },
    {
        id: 'rquest_063',
        type: 'workflow_node',
        name: '银行系统',
        parentId: 'group_023',
        width: '',
        height: '',
        depth: 5,
        color: '#ffa042',
        textColor: '',
        position: [1380, 0, -50],
        rotation: [-Math.PI / 2, 0, 0]
    },
    {
        id: 'rquest_064',
        type: 'workflow_node',
        name: '财辅报账',
        parentId: 'group_023',
        width: '',
        height: '',
        depth: 5,
        color: '#ffa042',
        textColor: '',
        position: [-1380, 0, 750],
        rotation: [-Math.PI / 2, 0, 0]
    },
    {
        id: 'rquest_065',
        type: 'workflow_node',
        name: 'SPA-FICO',
        parentId: 'group_023',
        width: '',
        height: '',
        depth: 5,
        color: '#ffa042',
        textColor: '',
        position: [-460, 0, 750],
        rotation: [-Math.PI / 2, 0, 0]
    },
    {
        id: 'rquest_066',
        type: 'workflow_node',
        name: '财辅银企',
        parentId: 'group_023',
        width: '',
        height: '',
        depth: 5,
        color: '#ffa042',
        textColor: '',
        position: [460, 0, 750],
        rotation: [-Math.PI / 2, 0, 0]
    },
    {
        id: 'rquest_067',
        type: 'workflow_node',
        name: '银行系统',
        parentId: 'group_023',
        width: '',
        height: '',
        depth: 5,
        color: '#ffa042',
        textColor: '',
        position: [1380, 0, 750],
        rotation: [-Math.PI / 2, 0, 0]
    },
    {
        id: 'rquest_068',
        type: 'workflow_node',
        name: '财辅报账',
        parentId: 'group_023',
        width: '',
        height: '',
        depth: 5,
        color: '#ffa042',
        textColor: '',
        position: [-1380, 0, 1550],
        rotation: [-Math.PI / 2, 0, 0]
    },
    {
        id: 'rquest_069',
        type: 'workflow_node',
        name: 'SPA-FICO',
        parentId: 'group_023',
        width: '',
        height: '',
        depth: 5,
        color: '#ffa042',
        textColor: '',
        position: [-460, 0, 1550],
        rotation: [-Math.PI / 2, 0, 0]
    },
    {
        id: 'rquest_070',
        type: 'workflow_node',
        name: '财辅银企',
        parentId: 'group_023',
        width: '',
        height: '',
        depth: 5,
        color: '#ffa042',
        textColor: '',
        position: [460, 0, 1550],
        rotation: [-Math.PI / 2, 0, 0]
    },
    {
        id: 'rquest_071',
        type: 'workflow_node',
        name: '银行系统',
        parentId: 'group_023',
        width: '',
        height: '',
        depth: 5,
        color: '#ffa042',
        textColor: '',
        position: [1380, 0, 1550],
        rotation: [-Math.PI / 2, 0, 0]
    },
    //左面一层
    {
        id: 'group_024',
        type: 'workflow_model',
        parentId: '',
        makeId: 'twaver.workflow.roundcube',
        width: 2000,
        height: 20,
        depth: 3200,
        radius: 200,
        color: '#164478',
        opacity: '0.5',
        position: [-2300, -900, 0],
        rotation: [Math.PI / 2, 0, -Math.PI / 2]
    },
    //立方体
    {
        id: 'rquest_072',
        type: 'workflow_node',
        name: '业务流程',
        parentId: 'group_024',
        width: '',
        height: '',
        depth: 5,
        color: '#ffa042',
        textColor: '',
        position: [-950, 0, -1650],
        rotation: [-Math.PI / 2, 0, 0]
    },
    {
        id: 'rquest_073',
        type: 'workflow_node',
        name: '应用逻辑层',
        parentId: 'group_024',
        width: '',
        height: '',
        depth: 5,
        color: '#ffa042',
        textColor: '',
        position: [-950, 0, -850],
        rotation: [-Math.PI / 2, 0, 0]
    },
    {
        id: 'rquest_074',
        type: 'workflow_node',
        name: '实例',
        parentId: 'group_024',
        width: '',
        height: '',
        depth: 5,
        color: '#ffa042',
        textColor: '',
        position: [-950, 0, -50],
        rotation: [-Math.PI / 2, 0, 0]
    },
    {
        id: 'rquest_075',
        type: 'workflow_node',
        name: 'OS',
        parentId: 'group_024',
        width: '',
        height: '',
        depth: 5,
        color: '#ffa042',
        textColor: '',
        position: [-950, 0, 750],
        rotation: [-Math.PI / 2, 0, 0]
    },
    {
        id: 'rquest_076',
        type: 'workflow_node',
        name: '基础架构层',
        parentId: 'group_024',
        width: '',
        height: '',
        depth: 5,
        color: '#ffa042',
        textColor: '',
        position: [-950, 0, 1550],
        rotation: [-Math.PI / 2, 0, 0]
    },
];


var linkJson = [
    //连线第一层
    {
        id: 'link_001',
        type: 'workflow_link',
        fromId: 'objModel_001',
        toId: 'objModel_002',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        workflowId: 'top'
    },
    {
        id: 'link_002',
        type: 'workflow_link',
        fromId: 'objModel_002',
        toId: 'objModel_003',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        workflowId: 'top'
    },
    {
        id: 'link_003',
        type: 'workflow_link',
        fromId: 'objModel_003',
        toId: 'objModel_004',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        workflowId: 'top'
    },
    {
        id: 'link_004',
        type: 'workflow_link',
        fromId: 'objModel_004',
        toId: 'objModel_005',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        workflowId: 'top'
    },
    {
        id: 'link_005',
        type: 'workflow_link',
        fromId: 'objModel_005',
        toId: 'objModel_006',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        workflowId: 'top'
    },
    {
        id: 'link_006',
        type: 'workflow_link',
        fromId: 'objModel_006',
        toId: 'objModel_007',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        workflowId: 'top'
    },
    {
        id: 'link_007',
        type: 'workflow_link',
        fromId: 'objModel_007',
        toId: 'objModel_008',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        linkType: 'flex.x',
        workflowId: 'top'
    },
    //连线第二层
    {
        id: 'link_012',
        type: 'workflow_link',
        fromId: 'objModel_009',
        toId: 'objModel_010',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        workflowId: 'middle'
    },
    {
        id: 'link_013',
        type: 'workflow_link',
        fromId: 'objModel_010',
        toId: 'objModel_011',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        workflowId: 'middle'
    },
    {
        id: 'link_014',
        type: 'workflow_link',
        fromId: 'objModel_011',
        toId: 'objModel_012',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        workflowId: 'middle'
    },
    {
        id: 'link_015',
        type: 'workflow_link',
        fromId: 'objModel_012',
        toId: 'objModel_013',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        workflowId: 'middle'
    },
    {
        id: 'link_016',
        type: 'workflow_link',
        fromId: 'objModel_013',
        toId: 'objModel_014',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        workflowId: 'middle'
    },
    {
        id: 'link_017',
        type: 'workflow_link',
        fromId: 'objModel_014',
        toId: 'objModel_015',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        workflowId: 'middle'
    },
    {
        id: 'link_018',
        type: 'workflow_link',
        fromId: 'objModel_015',
        toId: 'objModel_016',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        linkType: 'flex.x',
        workflowId: 'middle'
    },
    {
        id: 'link_019',
        type: 'workflow_link',
        fromId: 'objModel_016',
        toId: 'objModel_017',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        workflowId: 'middle'
    },
    {
        id: 'link_020',
        type: 'workflow_link',
        fromId: 'objModel_017',
        toId: 'objModel_018',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        workflowId: 'middle'
    },
    {
        id: 'link_021',
        type: 'workflow_link',
        fromId: 'objModel_018',
        toId: 'objModel_019',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        linkType: 'flex.x',
        workflowId: 'middle'
    },
    //一层二层中间
    {
        id: 'link_011',
        type: 'workflow_verticalLink',
        fromId: 'objModel_001',
        toId: 'objModel_009',
        color: '',
        linkType: 'control'
    },
    {
        id: 'link_022',
        type: 'workflow_verticalLink',
        fromId: 'objModel_001',
        toId: 'objModel_010',
        color: '',
        linkType: 'control'
    },
    {
        id: 'link_023',
        type: 'workflow_verticalLink',
        fromId: 'objModel_001',
        toId: 'objModel_011',
        color: '',
        linkType: 'control'
    },
    {
        id: 'link_024',
        type: 'workflow_verticalLink',
        fromId: 'objModel_001',
        toId: 'objModel_012',
        color: '',
        linkType: 'control'
    },
    //二层三层中间
    {
        id: 'link_025',
        type: 'workflow_verticalLink',
        fromId: 'objModel_009',
        toId: 'rquest_001',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_026',
        type: 'workflow_verticalLink',
        fromId: 'objModel_009',
        toId: 'rquest_002',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_027',
        type: 'workflow_verticalLink',
        fromId: 'objModel_009',
        toId: 'rquest_003',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_028',
        type: 'workflow_verticalLink',
        fromId: 'objModel_009',
        toId: 'rquest_004',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_029',
        type: 'workflow_verticalLink',
        fromId: 'objModel_010',
        toId: 'rquest_005',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_030',
        type: 'workflow_verticalLink',
        fromId: 'objModel_010',
        toId: 'rquest_006',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_031',
        type: 'workflow_verticalLink',
        fromId: 'objModel_011',
        toId: 'rquest_007',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_032',
        type: 'workflow_verticalLink',
        fromId: 'objModel_011',
        toId: 'rquest_008',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_033',
        type: 'workflow_verticalLink',
        fromId: 'objModel_011',
        toId: 'rquest_009',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_034',
        type: 'workflow_verticalLink',
        fromId: 'objModel_011',
        toId: 'rquest_010',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_035',
        type: 'workflow_verticalLink',
        fromId: 'objModel_012',
        toId: 'rquest_011',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_036',
        type: 'workflow_verticalLink',
        fromId: 'objModel_012',
        toId: 'rquest_012',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_037',
        type: 'workflow_verticalLink',
        fromId: 'objModel_012',
        toId: 'rquest_013',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_038',
        type: 'workflow_verticalLink',
        fromId: 'objModel_012',
        toId: 'rquest_014',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_039',
        type: 'workflow_verticalLink',
        fromId: 'objModel_014',
        toId: 'rquest_015',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_040',
        type: 'workflow_verticalLink',
        fromId: 'objModel_014',
        toId: 'rquest_016',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_041',
        type: 'workflow_verticalLink',
        fromId: 'objModel_016',
        toId: 'rquest_017',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_042',
        type: 'workflow_verticalLink',
        fromId: 'objModel_016',
        toId: 'rquest_018',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_043',
        type: 'workflow_verticalLink',
        fromId: 'objModel_016',
        toId: 'rquest_019',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_044',
        type: 'workflow_verticalLink',
        fromId: 'objModel_016',
        toId: 'rquest_020',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_045',
        type: 'workflow_verticalLink',
        fromId: 'objModel_017',
        toId: 'rquest_021',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_046',
        type: 'workflow_verticalLink',
        fromId: 'objModel_017',
        toId: 'rquest_022',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_047',
        type: 'workflow_verticalLink',
        fromId: 'objModel_018',
        toId: 'rquest_023',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_048',
        type: 'workflow_verticalLink',
        fromId: 'objModel_018',
        toId: 'rquest_024',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_049',
        type: 'workflow_verticalLink',
        fromId: 'objModel_018',
        toId: 'rquest_025',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_050',
        type: 'workflow_verticalLink',
        fromId: 'objModel_018',
        toId: 'rquest_026',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_051',
        type: 'workflow_verticalLink',
        fromId: 'objModel_019',
        toId: 'rquest_027',
        radius: 8,
        color: '',
        endCap: 'arrow'
    },
    //三四层中间
    {
        id: 'link_052',
        type: 'workflow_verticalLink',
        fromId: 'rquest_001',
        toId: 'rquest_028',
        radius: 8,
        color: '',
        endCap: 'arrow'
    },
    {
        id: 'link_053',
        type: 'workflow_verticalLink',
        fromId: 'rquest_002',
        toId: 'rquest_029',
        radius: 8,
        color: '',
        endCap: 'arrow'
    },
    {
        id: 'link_054',
        type: 'workflow_verticalLink',
        fromId: 'rquest_003',
        toId: 'rquest_030',
        radius: 8,
        color: '',
        endCap: 'arrow'
    },
    {
        id: 'link_055',
        type: 'workflow_verticalLink',
        fromId: 'rquest_004',
        toId: 'rquest_031',
        radius: 8,
        color: '',
        endCap: 'arrow'
    },
    {
        id: 'link_056',
        type: 'workflow_verticalLink',
        fromId: 'rquest_005',
        toId: 'rquest_032',
        radius: 8,
        color: '',
        endCap: 'arrow'
    },
    {
        id: 'link_057',
        type: 'workflow_verticalLink',
        fromId: 'rquest_006',
        toId: 'rquest_033',
        radius: 8,
        color: '',
        endCap: 'arrow'
    },
    {
        id: 'link_058',
        type: 'workflow_verticalLink',
        fromId: 'rquest_007',
        toId: 'rquest_034',
        radius: 8,
        color: '',
        endCap: 'arrow'
    },
    {
        id: 'link_059',
        type: 'workflow_verticalLink',
        fromId: 'rquest_008',
        toId: 'rquest_035',
        radius: 8,
        color: '',
        endCap: 'arrow'
    },
    {
        id: 'link_060',
        type: 'workflow_verticalLink',
        fromId: 'rquest_009',
        toId: 'rquest_036',
        radius: 8,
        color: '',
        endCap: 'arrow'
    },
    {
        id: 'link_061',
        type: 'workflow_verticalLink',
        fromId: 'rquest_010',
        toId: 'rquest_037',
        radius: 8,
        color: '',
        endCap: 'arrow'
    },
    {
        id: 'link_062',
        type: 'workflow_verticalLink',
        fromId: 'rquest_011',
        toId: 'rquest_038',
        radius: 8,
        color: '',
        endCap: 'arrow'
    },
    {
        id: 'link_063',
        type: 'workflow_verticalLink',
        fromId: 'rquest_012',
        toId: 'rquest_039',
        radius: 8,
        color: '',
        endCap: 'arrow'
    },
    {
        id: 'link_064',
        type: 'workflow_verticalLink',
        fromId: 'rquest_013',
        toId: 'rquest_040',
        radius: 8,
        color: '',
        endCap: 'arrow'
    },
    {
        id: 'link_065',
        type: 'workflow_verticalLink',
        fromId: 'rquest_014',
        toId: 'rquest_041',
        radius: 8,
        color: '',
        endCap: 'arrow'
    },
    {
        id: 'link_066',
        type: 'workflow_verticalLink',
        fromId: 'rquest_017',
        toId: 'rquest_042',
        radius: 8,
        color: '',
        endCap: 'arrow'
    },
    {
        id: 'link_067',
        type: 'workflow_verticalLink',
        fromId: 'rquest_018',
        toId: 'rquest_043',
        radius: 8,
        color: '',
        endCap: 'arrow'
    },
    {
        id: 'link_068',
        type: 'workflow_verticalLink',
        fromId: 'rquest_019',
        toId: 'rquest_044',
        radius: 8,
        color: '',
        endCap: 'arrow'
    },
    {
        id: 'link_069',
        type: 'workflow_verticalLink',
        fromId: 'rquest_020',
        toId: 'rquest_045',
        radius: 8,
        color: '',
        endCap: 'arrow'
    },
    {
        id: 'link_070',
        type: 'workflow_verticalLink',
        fromId: 'rquest_021',
        toId: 'rquest_046',
        radius: 8,
        color: '',
        endCap: 'arrow'
    },
    {
        id: 'link_071',
        type: 'workflow_verticalLink',
        fromId: 'rquest_022',
        toId: 'rquest_047',
        radius: 8,
        color: '',
        endCap: 'arrow'
    },
    {
        id: 'link_072',
        type: 'workflow_verticalLink',
        fromId: 'rquest_023',
        toId: 'rquest_048',
        radius: 8,
        color: '',
        endCap: 'arrow'
    },
    {
        id: 'link_073',
        type: 'workflow_verticalLink',
        fromId: 'rquest_024',
        toId: 'rquest_049',
        radius: 8,
        color: '',
        endCap: 'arrow'
    },
    {
        id: 'link_074',
        type: 'workflow_verticalLink',
        fromId: 'rquest_025',
        toId: 'rquest_050',
        radius: 8,
        color: '',
        endCap: 'arrow'
    },
    {
        id: 'link_075',
        type: 'workflow_verticalLink',
        fromId: 'rquest_026',
        toId: 'rquest_051',
        radius: 8,
        color: '',
        endCap: 'arrow'
    },
    //四五层中间
    {
        id: 'link_076',
        type: 'workflow_verticalLink',
        fromId: 'model_001',
        toId: 'rquest_028',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_077',
        type: 'workflow_verticalLink',
        fromId: 'model_001',
        toId: 'rquest_029',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_078',
        type: 'workflow_verticalLink',
        fromId: 'model_001',
        toId: 'rquest_030',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_079',
        type: 'workflow_verticalLink',
        fromId: 'model_001',
        toId: 'rquest_031',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_080',
        type: 'workflow_verticalLink',
        fromId: 'model_002',
        toId: 'rquest_032',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_081',
        type: 'workflow_verticalLink',
        fromId: 'model_002',
        toId: 'rquest_033',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_082',
        type: 'workflow_verticalLink',
        fromId: 'model_003',
        toId: 'rquest_034',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_083',
        type: 'workflow_verticalLink',
        fromId: 'model_003',
        toId: 'rquest_035',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_084',
        type: 'workflow_verticalLink',
        fromId: 'model_003',
        toId: 'rquest_036',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_085',
        type: 'workflow_verticalLink',
        fromId: 'model_003',
        toId: 'rquest_037',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_086',
        type: 'workflow_verticalLink',
        fromId: 'model_004',
        toId: 'rquest_038',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_087',
        type: 'workflow_verticalLink',
        fromId: 'model_004',
        toId: 'rquest_039',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_088',
        type: 'workflow_verticalLink',
        fromId: 'model_004',
        toId: 'rquest_040',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_089',
        type: 'workflow_verticalLink',
        fromId: 'model_004',
        toId: 'rquest_041',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_090',
        type: 'workflow_verticalLink',
        fromId: 'model_005',
        toId: 'rquest_042',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_091',
        type: 'workflow_verticalLink',
        fromId: 'model_005',
        toId: 'rquest_043',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_092',
        type: 'workflow_verticalLink',
        fromId: 'model_005',
        toId: 'rquest_044',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_093',
        type: 'workflow_verticalLink',
        fromId: 'model_005',
        toId: 'rquest_045',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_094',
        type: 'workflow_verticalLink',
        fromId: 'model_006',
        toId: 'rquest_046',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_095',
        type: 'workflow_verticalLink',
        fromId: 'model_006',
        toId: 'rquest_047',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_096',
        type: 'workflow_verticalLink',
        fromId: 'model_007',
        toId: 'rquest_048',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_097',
        type: 'workflow_verticalLink',
        fromId: 'model_007',
        toId: 'rquest_049',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_098',
        type: 'workflow_verticalLink',
        fromId: 'model_007',
        toId: 'rquest_050',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_099',
        type: 'workflow_verticalLink',
        fromId: 'model_007',
        toId: 'rquest_051',
        radius: 8,
        color: '',
        endCap: 'arrow',
        linkType: 'control'
    },
    {
        id: 'link_100',
        type: 'workflow_verticalLink',
        fromId: 'rquest_027',
        toId: 'model_008',
        radius: 8,
        color: '',
        endCap: 'arrow'
    },
    //第五层连线
    {
        id: 'link_101',
        type: 'workflow_link',
        fromId: 'model_001',
        toId: 'model_005',
        radius: '',
        color: '#fff800',
        endCap: 'arrow'
    },
    {
        id: 'link_102',
        type: 'workflow_link',
        fromId: 'model_002',
        toId: 'model_006',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        linkType: 'flex.x'
    },
    {
        id: 'link_103',
        type: 'workflow_link',
        fromId: 'model_003',
        toId: 'model_007',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        linkType: 'flex.x'
    },
    {
        id: 'link_104',
        type: 'workflow_link',
        fromId: 'model_004',
        toId: 'model_007',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        linkType: 'flex.x'
    },
    {
        id: 'link_105',
        type: 'workflow_link',
        fromId: 'model_005',
        toId: 'model_008',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        linkType: 'flex.x'
    },
    {
        id: 'link_106',
        type: 'workflow_link',
        fromId: 'model_006',
        toId: 'model_008',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        linkType: 'flex.x'
    },
    {
        id: 'link_107',
        type: 'workflow_link',
        fromId: 'model_007',
        toId: 'model_008',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        linkType: 'flex.x'
    },
    //后面一层连线
    {
        id: 'link_108',
        type: 'workflow_link',
        fromId: 'rquest_052',
        toId: 'rquest_053',
        radius: '',
        color: '#00EC00',
        endCap: 'arrow',
        flow: true
    },
    {
        id: 'link_109',
        type: 'workflow_link',
        fromId: 'rquest_053',
        toId: 'rquest_054',
        radius: '',
        color: '#00EC00',
        endCap: 'arrow',
        flow: true
    },
    {
        id: 'link_110',
        type: 'workflow_link',
        fromId: 'rquest_054',
        toId: 'rquest_055',
        radius: '',
        color: '#00EC00',
        endCap: 'arrow',
        flow: true
    },
    {
        id: 'link_111',
        type: 'workflow_link',
        fromId: 'rquest_056',
        toId: 'rquest_057',
        radius: '',
        color: '#00EC00',
        endCap: 'arrow',
        flow: true
    },
    {
        id: 'link_112',
        type: 'workflow_link',
        fromId: 'rquest_057',
        toId: 'rquest_058',
        radius: '',
        color: '#00EC00',
        endCap: 'arrow',
        flow: true
    },
    {
        id: 'link_113',
        type: 'workflow_link',
        fromId: 'rquest_058',
        toId: 'rquest_059',
        radius: '',
        color: '#00EC00',
        endCap: 'arrow',
        flow: true
    },
    {
        id: 'link_114',
        type: 'workflow_link',
        fromId: 'rquest_060',
        toId: 'rquest_061',
        radius: '',
        color: '#00EC00',
        endCap: 'arrow',
        flow: true
    },
    {
        id: 'link_115',
        type: 'workflow_link',
        fromId: 'rquest_061',
        toId: 'rquest_062',
        radius: '',
        color: '#00EC00',
        endCap: 'arrow',
        flow: true
    },
    {
        id: 'link_116',
        type: 'workflow_link',
        fromId: 'rquest_062',
        toId: 'rquest_063',
        radius: '',
        color: '#00EC00',
        endCap: 'arrow',
        flow: true
    },
    {
        id: 'link_117',
        type: 'workflow_link',
        fromId: 'rquest_064',
        toId: 'rquest_065',
        radius: '',
        color: '#00EC00',
        endCap: 'arrow',
        flow: true
    },
    {
        id: 'link_118',
        type: 'workflow_link',
        fromId: 'rquest_065',
        toId: 'rquest_066',
        radius: '',
        color: '#00EC00',
        endCap: 'arrow',
        flow: true
    },
    {
        id: 'link_119',
        type: 'workflow_link',
        fromId: 'rquest_066',
        toId: 'rquest_067',
        radius: '',
        color: '#00EC00',
        endCap: 'arrow',
        flow: true
    },
    {
        id: 'link_120',
        type: 'workflow_link',
        fromId: 'rquest_068',
        toId: 'rquest_069',
        radius: '',
        color: '#00EC00',
        endCap: 'arrow',
        flow: true
    },
    {
        id: 'link_121',
        type: 'workflow_link',
        fromId: 'rquest_069',
        toId: 'rquest_070',
        radius: '',
        color: '#00EC00',
        endCap: 'arrow',
        flow: true
    },
    {
        id: 'link_122',
        type: 'workflow_link',
        fromId: 'rquest_070',
        toId: 'rquest_071',
        radius: '',
        color: '#00EC00',
        endCap: 'arrow',
        flow: true
    },
    //左面一层连线
    {
        id: 'link_123',
        type: 'workflow_link',
        fromId: 'rquest_072',
        toId: 'rquest_073',
        radius: '',
        color: '#00EC00',
        endCap: 'arrow',
        flow: true
    },
    {
        id: 'link_124',
        type: 'workflow_link',
        fromId: 'rquest_073',
        toId: 'rquest_074',
        radius: '',
        color: '#00EC00',
        endCap: 'arrow',
        flow: true
    },
    {
        id: 'link_125',
        type: 'workflow_link',
        fromId: 'rquest_074',
        toId: 'rquest_075',
        radius: '',
        color: '#00EC00',
        endCap: 'arrow',
        flow: true
    },
    {
        id: 'link_126',
        type: 'workflow_link',
        fromId: 'rquest_075',
        toId: 'rquest_076',
        radius: '',
        color: '#00EC00',
        endCap: 'arrow',
        flow: true
    },
    //第三层连线
    {
        id: 'link_127',
        type: 'workflow_link',
        fromId: 'rquest_003',
        toId: 'rquest_015',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        linkType: 'flex.x'
    },
    {
        id: 'link_128',
        type: 'workflow_link',
        fromId: 'rquest_004',
        toId: 'rquest_015',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        linkType: 'flex.x'
    },
    {
        id: 'link_129',
        type: 'workflow_link',
        fromId: 'rquest_006',
        toId: 'rquest_015',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        linkType: 'flex.x'
    },
    {
        id: 'link_130',
        type: 'workflow_link',
        fromId: 'rquest_009',
        toId: 'rquest_015',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        linkType: 'flex.x'
    },
    {
        id: 'link_131',
        type: 'workflow_link',
        fromId: 'rquest_010',
        toId: 'rquest_015',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        linkType: 'flex.x'
    },
    {
        id: 'link_132',
        type: 'workflow_link',
        fromId: 'rquest_013',
        toId: 'rquest_015',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        linkType: 'flex.x'
    },
    {
        id: 'link_133',
        type: 'workflow_link',
        fromId: 'rquest_014',
        toId: 'rquest_015',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        linkType: 'flex.x'
    },
    {
        id: 'link_134',
        type: 'workflow_link',
        fromId: 'rquest_016',
        toId: 'rquest_017',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        linkType: 'flex.x'
    },
    {
        id: 'link_135',
        type: 'workflow_link',
        fromId: 'rquest_016',
        toId: 'rquest_018',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        linkType: 'flex.x'
    },
    {
        id: 'link_136',
        type: 'workflow_link',
        fromId: 'rquest_016',
        toId: 'rquest_021',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        linkType: 'flex.x'
    },
    {
        id: 'link_137',
        type: 'workflow_link',
        fromId: 'rquest_016',
        toId: 'rquest_023',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        linkType: 'flex.x'
    },
    {
        id: 'link_138',
        type: 'workflow_link',
        fromId: 'rquest_016',
        toId: 'rquest_024',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        linkType: 'flex.x'
    },
    {
        id: 'link_139',
        type: 'workflow_link',
        fromId: 'rquest_019',
        toId: 'rquest_027',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        linkType: 'flex.x'
    },
    {
        id: 'link_140',
        type: 'workflow_link',
        fromId: 'rquest_020',
        toId: 'rquest_027',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        linkType: 'flex.x'
    },
    {
        id: 'link_141',
        type: 'workflow_link',
        fromId: 'rquest_022',
        toId: 'rquest_027',
        radius: '',
        color: '#fff800',
        endCap: 'arrow'
    },
    {
        id: 'link_142',
        type: 'workflow_link',
        fromId: 'rquest_025',
        toId: 'rquest_027',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        linkType: 'flex.x'
    },
    {
        id: 'link_143',
        type: 'workflow_link',
        fromId: 'rquest_026',
        toId: 'rquest_027',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        linkType: 'flex.x'
    },
    //第四层连线
    {
        id: 'link_144',
        type: 'workflow_link',
        fromId: 'rquest_031',
        toId: 'rquest_042',
        radius: '',
        color: '#fff800',
        endCap: 'arrow'
    },
    {
        id: 'link_145',
        type: 'workflow_link',
        fromId: 'rquest_030',
        toId: 'rquest_043',
        radius: '',
        color: '#fff800',
        endCap: 'arrow'
    },
    {
        id: 'link_146',
        type: 'workflow_link',
        fromId: 'rquest_033',
        toId: 'rquest_046',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        linkType: 'flex.x'
    },
    {
        id: 'link_147',
        type: 'workflow_link',
        fromId: 'rquest_036',
        toId: 'rquest_046',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        linkType: 'flex.x'
    },
    {
        id: 'link_148',
        type: 'workflow_link',
        fromId: 'rquest_037',
        toId: 'rquest_046',
        radius: '',
        color: '#fff800',
        endCap: 'arrow',
        linkType: 'flex.x'
    },
    {
        id: 'link_149',
        type: 'workflow_link',
        fromId: 'rquest_041',
        toId: 'rquest_048',
        radius: '',
        color: '#fff800',
        endCap: 'arrow'
    },
    {
        id: 'link_150',
        type: 'workflow_link',
        fromId: 'rquest_040',
        toId: 'rquest_049',
        radius: '',
        color: '#fff800',
        endCap: 'arrow'
    },
];




