var $PanoramicMakerManager = function (sceneManager) {
    this.sceneManager = sceneManager;

    this.network = this.sceneManager.network3d;
    this.box = this.network.getDataBox();
    this.vm = this.sceneManager.viewManager3d;
    this.dm = this.sceneManager.dataManager;
    this.de = this.vm.defaultEventHandler;
    this.rootView = this.network.getRootView();

    this.panoBox = $('.panoramic-box');
    this.pano = $('#panoramic');

    this.camera = this.network.getCamera();

    this.init();
};

mono.extend($PanoramicMakerManager, Object, {

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
        it.util.augment(it.PanoramicMakerManager, it.dealUserEventHandler);

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
                    // var id = element.getClient('id')
                    // console.log(element);
                    var position = element.getPosition();
                    self.makeAllImage(position);
                }
            }
        }
    },

    makeAllImage: function(position){

        // console.log(position);
        position.y += 300;
        
        this.getImageByDirection({
            position: position,
            direction: 'l',
        })
        this.getImageByDirection({
            position: position,
            direction: 'r',
        })
        this.getImageByDirection({
            position: position,
            direction: 'b',
        })
        this.getImageByDirection({
            position: position,
            direction: 'f',
        })
        this.getImageByDirection({
            position: position,
            direction: 'u',
        })
        this.getImageByDirection({
            position: position,
            direction: 'd',
        })

        this.camera.setAspect(this.cAspect);
        this.camera.setFov(this.cFov);
        this.camera.p(this.cPosition);
        this.camera.lookat(this.cTarget);
    },

    getImageByDirection: function (params) {
        var direction = params.direction;
        var distance = 200;
        // var distance = params.distance||200;

        var size = 2048;
        this.network.adjustBounds(size, size, 0, 0);

        this.camera.setAspect(1);
        this.camera.setFov(90);

        var position = params.position || new mono.Vec3(-1200, 400, -1000);
        this.camera.p(position);
        var target;
        if (direction == 'l') {
            target = new mono.Vec3(position.x, position.y, position.z + distance);
        } else if (direction == 'r') {
            target = new mono.Vec3(position.x, position.y, position.z - distance);
        } else if (direction == 'b') {
            target = new mono.Vec3(position.x + distance, position.y, position.z);
        } else if (direction == 'f') {
            target = new mono.Vec3(position.x - distance, position.y, position.z);
        } else if (direction == 'u') {
            target = new mono.Vec3(position.x, position.y + distance, position.z);
        } else if (direction == 'd') {
            target = new mono.Vec3(position.x, position.y - distance, position.z);
        }
        if (!target) {
            return;
        }

        this.camera.lookat(target);
        var imageData;
        imageData = this.network.toImageData();
        // console.log(imageData);
        this.downloadImage(imageData, direction);

    },

    downloadImage: function (imageData, direction) {
        var image = new Image();
        image.src = imageData;
        image.onload = function () {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var size = 1024;
            canvas.width = size;
            canvas.height = size;
            ctx.drawImage(image, 0, 0, size, size);
            canvas.toBlob(function (blob) {
                var url = URL.createObjectURL(blob);
                var fileName = 'pano_' + direction + '.jpg';
                var anchor = document.createElement('a');
                anchor.href = url;
                anchor.setAttribute("download", fileName);
                anchor.className = "download-js-link";
                anchor.innerHTML = "downloading...";
                anchor.style.display = "none";
                document.body.appendChild(anchor);
                setTimeout(function () {
                    anchor.click();
                    document.body.removeChild(anchor);
                }, 100);
            }, 'image/jpg');
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

        this.cAspect = this.camera.getAspect();
        this.cFov = this.camera.getFov();
        this.cPosition = this.camera.p();
        this.cTarget = this.camera.getTarget();

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

it.PanoramicMakerManager = $PanoramicMakerManager;