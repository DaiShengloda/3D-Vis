var $PanoramicManager = function (sceneManager) {
    this.sceneManager = sceneManager;

    this.network = this.sceneManager.network3d;
    this.box = this.network.getDataBox();
    this.vm = this.sceneManager.viewManager3d;
    this.dm = this.sceneManager.dataManager;
    this.de = this.vm.defaultEventHandler;
    this.rootView = this.network.getRootView();

    this.panoBox = $('.panoramic-box');
    this.pano = $('#panoramic');
    this.urlToSrc;
    this.waitImageTime = 300;

    this.init();
};

mono.extend($PanoramicManager, Object, {

    init: function () {

        var self = this;

        this.pano.on('dblclick', '#krpanoSWFObject', function () {
            self.panoBox.removeClass('active');
        });

        this.userEventHandlerBox = {
            'dblclick': {
                element: this.rootView,
                event: 'dblclick',
                funcName: 'clickBillboard',
            },
        }
        it.util.augment(it.PanoramicManager, it.dealUserEventHandler);

        this.getPanoPointMsg();
        this.getFolder();
    },

    getFolder: function () {
        var folder = pageConfig.panoFolderName;
        if (folder) {
            if (folder.indexOf('public/') > -1) {
                folder = folder.replace('public/', '');
            }
            folder = pageConfig.url('/' + folder + '/');
        } else {
            folder = pageConfig.url('/theme/panoramic/');
        };
        this.urlToSrc = folder;
    },

    /* 3d区 */
    clickBillboard: function (e) {
        var self = this;
        if (this.appState) {
            var first = this.network.getFirstElementByMouseEvent(e);
            if (first) {
                var element = first.element;
                if (element instanceof mono.Billboard && element.getClient('panos') == 'panos') {
                    var id = element.getClient('id')
                    // console.log(id);
                    if (this.krpano) {
                        this.loadscene(id, true);
                    } else {
                        this.startPanomic(id);
                    }
                    setTimeout(function () {
                        self.panoBox.addClass('active');
                    }, this.waitImageTime)
                }
            }
        }
    },

    makeBillboard: function (params, extraParams) {
        var self = this;
        var board = it.util.makeImageBillboard(this.panoPointImage);

        // 法1：通过fixedSize设置board的大小
        // board.s({
        //     'm.fixedSize': 1000,
        // })
        // 备注：当使用固定大小的billboard时，board的某些部分点不中

        // 法2：通过scale设置board的大小
        // console.log(board.getScale())
        var oldScale = board.getScale();
        board.setScale(oldScale.x * params.scale[0], oldScale.y * params.scale[1], 1)
        // Billboard的基准点应该设置为中心点
        // board的定位点设置的是连线的那个点，然后把它往上移，2/3那个比例，就根据连线点在图片上的比例来决定
        board.setPosition(new mono.Vec3(params.position[0], params.position[1] + oldScale.y * params.scale[1] * 2 / 3, params.position[2]));
        board.setParent(extraParams.parentNode);
        board.s({
            'm.alignment': new mono.Vec2(0, -0.167),
        });
        board.setClient('id', params.id);
        board.setClient('panos', 'panos');
        this.box.add(board);
        var cube = new mono.Cube(1, 1, 1);
        // cube的位置应该设置为billboard的定位点的位置，这样在放大的时候才不会出现问题
        // 因此要更改连线在billboard上的位置的时候，就应该用修改billboard的定位点的方式进行修改
        // cube.s({
        //     'm.color': 'red',
        //     'm.ambient': 'red',
        //     'm.transparent': true,
        //     'm.opacity': 0.6,
        // })
        cube.setParent(extraParams.parentNode);
        cube.setPosition(new mono.Vec3(params.position[0], params.position[1] + oldScale.y * params.scale[1] * 2 / 3, params.position[2]));
        // 连线用的cube不需要加到box
        // this.box.add(cube);
        this.billboardMaps.push({
            id: params.id,
            board: board,
            cube: cube,
            title: params.title,

        })
        if (params.arrows) {
            var from = params.id;
            for (var i = 0; i < params.arrows.length; i++) {
                var to = params.arrows[i].to;
                var flag = true;
                for (var j = 0; j < this.linkMaps.length; j++) {
                    var link = this.linkMaps[j];
                    if ((link.from == from && link.to == to) || (link.from == to && link.to == from)) {
                        flag = false;
                        break;
                    }
                }
                if (flag) {
                    this.linkMaps.push({
                        from: from,
                        to: to,
                    })
                }
            }
        } else {
            // console.log('没有箭头');
        }
    },

    makePrepare: function () {
        var self = this;
        if (this.panoPointImage) {
            this.doItApp();
        } else {
            this.panoPointImage = new Image();
            this.panoPointImage.onload = function () {
                // console.log('图片加载完成')
                self.doItApp();
            }
            this.panoPointImage.src = pageConfig.url('/images/panoramic/panoPointImage.png');
        }
    },

    doItApp: function () {
        // console.log(this);
        var self = this;
        var scene = this.sceneManager.getCurrentScene();
        this.sceneId = scene._id;
        this.rootNode = this.sceneManager.getCurrentRootNode();
        this.rootData = this.rootNode._clientMap.it_data;
        var extraParams = {
            parentNode: this.rootNode,
        }

        // console.log(this.panoPointsMsg);
        if (!this.panoPointsMsg) {
            // console.log('in it');
            this.promise.then(function () {
                self.doItApp();
            });
            return;
        }
        for (var key in this.panoPointsMsg) {
            if (this.rootData._id == this.panoPointsMsg[key].dataId) {
                this.makeBillboard(this.panoPointsMsg[key], extraParams);
            }
        }
        // console.log('linkMaps', this.linkMaps);

        if (this.billboardMaps.length == 0) {
            ServerUtil.msg(it.util.i18n('No_Panorama'));
        } else {
            this.makeLinks();
        }


        this.makeSmallMap();
    },

    makeLinks: function () {
        for (var i = 0; i < this.linkMaps.length; i++) {
            var link = this.linkMaps[i];
            // var nodeFrom = this.billboardMaps
            var fromNode = this.getObjInArrayById(this.billboardMaps, link.from).cube;
            var toNode = this.getObjInArrayById(this.billboardMaps, link.to).cube;
            var linkNode = new mono.Link(fromNode, toNode);
            linkNode.s({
                'm.color': '#00f6ff',
                'm.ambient': '#00f6ff',
            });
            this.box.add(linkNode);
            link.node = linkNode;
        }

    },

    getObjInArrayById: function (array, id) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].id == id) {
                return array[i];
            }
        }
        return false;
    },

    show: function () {
        this.appState = true;
        this.krpano = null;
        this.linkMaps = [];
        this.billboardMaps = [];
        this.makePrepare();
        this.addMyEvent();
        this.jishuqi = 0;

    },

    hide: function () {
        for (var i = 0; i < this.billboardMaps.length; i++) {
            var board = this.billboardMaps[i].board;
            var cube = this.billboardMaps[i].cube;
            board.setParent(null);
            cube.setParent(null);
            this.box.remove(board);
            this.box.remove(cube);
        }
        for (var i = 0; i < this.linkMaps.length; i++) {
            var link = this.linkMaps[i];
            this.box.remove(link.node);
        }
        this.removeMyEvent();
        this.appState = false;
        this.jishuqi = null;
        this.rootNode = null;
        this.rootData = null;
        this.pano.empty();
        this.krpano = null;
        this.linkMaps = [];
        this.billboardMaps = [];
    },

    addMyEvent: function () {
        var self = this;
        if (this.addMyEventState) {
            console.log('已经把事件修改了，不应该再添加一次的');
        } else {
            this.oldDbl = this.de.shouldHandleDoubleClickElement;
            this.de.shouldHandleDoubleClickElement = function (element, network, data, clickedObj) {
                if (self.appState) {
                    return false;
                }
            }
            this.addAllUserEventHandler();
            this.addMyEventState = true;
        }
    },

    removeMyEvent: function () {
        if (this.addMyEventState) {
            this.de.shouldHandleDoubleClickElement = this.oldDbl;
            this.oldDbl = null;
            this.removeAllUserEventHandler();
            this.addMyEventState = false;
        }
    },
    /* 3d区完 */



    /* 全景区 */
    startPanomic: function (id) {
        var self = this;
        embedpano({
            id: "krpanoSWFObject",
            xml: this.urlToSrc + "pano.xml",
            target: "panoramic",
            consolelog: true, // trace krpano messages also to the browser console
            passQueryParameters: true, // pass query parameters of the url to krpano
            onready: function (krpano_interface) {
                self.krpano_onready_callback(krpano_interface, id);
            },
            html5: "auto",
            mobilescale: 1.0,
            // mwheel: false,
        });
    },

    krpano_onready_callback: function (krpano_interface, id) {
        var self = this;
        this.krpano = krpano_interface;
        // setTimeout(function () {
        //     self.loadscene(id);
        // }, 100)
        self.loadscene(id, true);
    },


    loadscene: function (xmlname, isFirst) {
        var self = this;
        if (this.krpano) {
            if (isFirst) {
                this.krpano.call("loadscene(" + xmlname + ");");
                setTimeout(function () {
                    self.firstLookAnimate();
                }, 10)
            } else {
                this.krpano.call("loadscene(" + xmlname + ", null, MERGE, BLEND(0.5));");
            }
            this.smallMap.overview('option', 'selectedId', xmlname)
            this.add_hotspot(xmlname);
        }
    },

    firstLookAnimate: function () {
        // console.log('first');
        var self = this;
        var speed = 90;
        this.krpano.set("view.hlookat", -180);
        this.krpano.set("view.vlookat", 90);
        this.krpano.set("view.fov", 170);
        // console.log(this);
        setTimeout(function () {
            self.krpano.call("lookto(0, 90, 90, linear(" + speed + "), true, true, lookto(0, 0, 90, linear(" + speed + ")))");
        }, this.waitImageTime)
    },

    // 整理视角的一些方法
    // krpano.set("view.hlookat", 90) 水平方向镜头移动，相当于鼠标左右移动
    // krpano.set("view.vlookat", 90) 垂直方向镜头移动，相当于鼠标上下移动
    // krpano.set("view.fov", 90) 视角场，相当于鼠标滚轮转动

    add_hotspot: function (xmlname) {
        var self = this;
        if (this.krpano) {
            var allArrows = this.panoPointsMsg[xmlname].arrows;
            if (allArrows) {
                for (var i = 0; i < allArrows.length; i++) {
                    var arrow = allArrows[i];
                    // hs_name这个名字，重复了会出问题，太长了也会出问题||带小数会出问题
                    // var hs_name = "hs" + i + ((Date.now() + Math.random()) || 0); // 这种写法不对
                    // var hs_name = xmlname + i + parseInt(Date.now()); // create unique/randome name
                    this.jishuqi++;
                    var hs_name = xmlname + i + this.jishuqi; // create unique/randome name
                    // console.log(hs_name);

                    this.krpano.call("addhotspot(" + hs_name + ");");

                    var extraTimeOutParams = {
                        hs_name: hs_name,
                        xmlname: xmlname,
                        arrow: arrow,
                    }

                    // 没有及时添加上去就设置了属性？？
                    setTimeout(function (extraTimeOutParams) {
                        var hs_name = extraTimeOutParams.hs_name;
                        var xmlname = extraTimeOutParams.xmlname;
                        var arrow = extraTimeOutParams.arrow;
                        // console.log(hs_name);
                        self.krpano.set("hotspot[" + hs_name + "].url", self.urlToSrc + "common/arrow.png");
                        // 根据点的坐标之间的夹角来计算箭头的摆放位置
                        var a = [1, 0];
                        var to = arrow.to;
                        var b = [self.panoPointsMsg[to].position[0] - self.panoPointsMsg[xmlname].position[0], self.panoPointsMsg[to].position[2] - self.panoPointsMsg[xmlname].position[2]]
                        var deg = self.getAngle(a, b);
                        // console.log('---');
                        // console.log('from ' + xmlname + ' to ' + to);
                        // console.log('deg', deg);
                        // console.log('---');
                        self.krpano.set("hotspot[" + hs_name + "].ath", deg);
                        self.krpano.set("hotspot[" + hs_name + "].atv", 0);
                        self.krpano.set("hotspot[" + hs_name + "].distorted", true);
                        self.krpano.set("hotspot[" + hs_name + "].onclick", function (hs, target) {
                            self.loadscene(target);
                        }.bind(null, hs_name, arrow.to));

                        self.krpano.set("hotspot[" + hs_name + "].onhover", function (hs) {
                            self.krpano && self.krpano.set("hotspot[" + hs + "].url", self.urlToSrc + "common/arrow_black.png");
                        }.bind(null, hs_name));
                        self.krpano.set("hotspot[" + hs_name + "].onout", function (hs) {
                            self.krpano && self.krpano.set("hotspot[" + hs + "].url", self.urlToSrc + "common/arrow.png");
                        }.bind(null, hs_name, xmlname));

                    }, 100, extraTimeOutParams)

                }
            } else {
                // console.log('没有箭头');
            }
        }
    },

    getAngle: function (a, b) {
        var cross = a[0] * b[1] + a[1] * b[0];
        var dot = a[0] * b[0] + a[1] * b[1];
        var rad, deg;
        if (cross > 0) {
            rad = 0 - Math.atan(cross / dot);
        } else {
            rad = Math.PI - Math.atan(cross / dot);
        }
        deg = rad * 360 / (Math.PI * 2);
        return deg;
    },
    /* 全景区完 */



    /* 小地图区 */
    makeSmallMap: function () {
        var self = this;
        var box = $('.panoramic-map');
        var items = [];

        var w = document.body.clientWidth,
            nw, nh;
        if (w <= 1440) {
            nw = 200;
            nh = 210;
        } else if (w > 1440 && w <= 1919) {
            nw = 240;
            nh = 240;
        } else if (w > 1919) {
            nw = 300;
            nh = 300;
        }

        var nbb = this.rootNode.boundingBox;
        // 如果boundingBox不存在，说明是简单模型，选中他的复杂模型
        if (!nbb) {
            var node = this.rootNode._clientMap.complexNode;
            nbb = node.boundingBox;
        }
        this.rootSize = {
            x: nbb.max.x - nbb.min.x,
            y: nbb.max.x - nbb.min.y,
            z: nbb.max.x - nbb.min.z,
        }
        this.rootWorldPosition = this.rootNode.getWorldPosition();

        if (this.sceneId == 'dataCenter') {
            // 园区的情况下
            items = this.getDataCenterData(items);

        } else if (this.sceneId == 'floor') {
            // 楼层的情况下
            items = this.getFloorData(items);
        }

        items = this.getPanoramicData(items);
        box.overview({
            width: nw,
            height: nh,
            click: function (e, params) {
                // console.log(params);
                self.loadscene(params.id);
            },
            currentScene: 'dataCenter',
        });
        box.overview('option', 'items', items);


        this.smallMap = box;
    },

    getPanoramicData: function (results) {

        for (var i = 0; i < this.billboardMaps.length; i++) {
            var node = this.billboardMaps[i].board;
            var pos = node.getPosition();
            var length = Math.min(this.rootSize.x, this.rootSize.z) / 20;
            // console.log('length', length);
            var result = {
                id: this.billboardMaps[i].id,
                type: 'rect',
                fill: true,
                w: length,
                h: length,
                x: (pos.x - this.rootWorldPosition.x),
                y: (pos.z - this.rootWorldPosition.z),
                angle: 0,
                label: this.billboardMaps[i].title || this.billboardMaps[i].id,
                selectable: true,
                nodeType: 'panoNode',
            }
            results.push(result);
        }

        return results;
    },

    getDataCenterPath: function (data) {
        var node = this.sceneManager.getNodeByDataOrId(data);
        var position = data._position;
        var nbb = node.boundingBox;
        // 如果boundingBox不存在，说明是简单模型，选中他的复杂模型
        if (!nbb) {
            node = node._clientMap.complexNode;
            nbb = node.boundingBox;
        }
        var size = {
            x: nbb.max.x - nbb.min.x,
            y: nbb.max.x - nbb.min.y,
            z: nbb.max.x - nbb.min.z,
        }
        var relativePosition = [
            [size.x / 2, 0, size.z / 2],
            [-size.x / 2, 0, size.z / 2],
            [-size.x / 2, 0, -size.z / 2],
            [size.x / 2, 0, -size.z / 2],
        ];
        var absolutePosition = [];
        var distance = Math.sqrt(size.x * size.x / 4 + size.z * size.z / 4);
        for (var i = 0; i < relativePosition.length; i++) {
            var worldPosition = node.worldPosition(new mono.Vec3(relativePosition[i][0], relativePosition[i][1], relativePosition[i][2]), distance);
            absolutePosition.push([worldPosition.x, worldPosition.z]);
        }
        // console.log('absolutePosition', absolutePosition);
        return absolutePosition;
    },

    getDataCenterData: function (results) {
        // 园区数据
        var dcAbsolutePosition = this.getDataCenterPath(this.rootData);
        results.push({
            type: 'path',
            fill: false,
            path: dcAbsolutePosition,
            closed: true,
            selectable: false,
        })

        // 大楼数据
        var allBuildingDataMap = this.dm.getDataMapByCategory('building');
        for (var key in allBuildingDataMap) {
            if (key.indexOf('building') > -1 && this.sceneManager.isCurrentSceneInstance(key)) {
                var data = allBuildingDataMap[key];
                var node = this.sceneManager.getNodeByDataOrId(data);
                if (!node) {
                    // console.log('node不存在');
                    return;
                }
                var pos = node.getWorldPosition();
                var b = node.getBoundingBox();
                var r = data.getRotation() || {
                    x: 0,
                    y: 0,
                    z: 0
                };

                var result = {
                    id: key,
                    type: 'rect',
                    fill: false,
                    w: (b.max.x - b.min.x),
                    h: (b.max.z - b.min.z),
                    x: (pos.x - this.rootWorldPosition.x),
                    y: (pos.z - this.rootWorldPosition.z),
                    angle: r.y,
                    label: data._name || key,
                    selectable: false,
                    nodeType: 'panoNode',
                }
                results.push(result);
            }
        }
        return results;
    },

    getFloorData: function (results) {
        // 楼层数据
        var data = this.rootData;
        var dataId = data.getId();
        var dt = this.dm.getDataTypeForData(dataId);
        var params = dt.getModelParameters();
        params.forEach(function (param) {
            var id = param.id;
            var type = make.Default.getParameters(id).type;
            if (type == 'wall' || type == 'innerWall') {
                var path = param.data.map(function (p) {
                    return [p[0], p[1]];
                })
                results.push({
                    type: 'path',
                    fill: false,
                    path: path,
                    closed: true,
                    selectable: false,
                })
            }
        })
        return results;
    },
    /* 小地图区完 */

    //获取全景的地点数据
    getPanoPointMsg: function () {
        var self = this;
        this.promise = new Promise(function (resolve, reject) {
            it.util.api('panoramic', 'find', {}, function (result) {
                self.formData(result);
                resolve && resolve();
            }, function (err) {
                console.log(err);
            });
        });
    },

    formData: function (result) {
        var self = this;
        this.panoPointsMsg = {};
        for (var i in result) {
            var data = result[i],
                pano = {};

            pano.id = data.id; //位置点的唯一id，与键名相同
            pano.title = data.name || data.id; //位置点的名称，在全景图界面下，在小地图上显示的内容
            pano.position = []; //该位置点在当前场景下的位置
            pano.position[0] = data.position.x;
            pano.position[1] = data.position.y;
            pano.position[2] = data.position.z;

            pano.scale = []; //位置点的node的大小的调整的参数
            pano.scale[0] = data.scale.x;
            pano.scale[1] = data.scale.y;

            pano.dataId = data.parentId; //位置点所在的根场景的data的id

            var arrowsMap = data.arrows.split('/');
            pano.arrows = []; //位置点之间的相互关系，每一个to表示从该位置点可以进入到对应的那个位置点
            for (var r in arrowsMap) {
                pano.arrows[r] = {};
                pano.arrows[r].to = arrowsMap[r];
            };

            pano.image = data.url; //全景图片

            var id = pano.id
            self.panoPointsMsg[id] = pano;
        };
    },

});

it.PanoramicManager = $PanoramicManager;