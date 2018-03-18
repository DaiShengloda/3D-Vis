(function (window, undefined) {

    /**
     *
     * @namespace
     */
    var doodle = {};
    window.doodle = doodle;

    //临时命名空间
    var nsp = {};
    nsp.edit = {};
    nsp.edit.interaction = {};
    nsp.edit.ui = {};
    nsp.edit.data = {};

    doodle._version = '1.5.4';

    /**
     * 取得doodle的版本
     * @returns {string}
     */
    doodle.getVersion = function () {
        return doodle._version;
    }

    doodle._debug = false;

    /**
     *
     * @returns {boolean}
     */
    doodle.isDebug = function () {
        return doodle._debug;
    }

    /**
     * 获取一个可以唯一识别的字符串
     * @param p {String} 前缀
     * @returns {String}
     */
    doodle.id = function (p) {
        if (doodle.isDebug()) {
            return doodle.debugId(p);
        }
        p = p || '';
        return p + _twaver.id();
    }

    /*
     * 默认从这里获取id
     */
    doodle.idIndex = 10000;
    doodle.ID_PREFIX = 'doodle'
    doodle.debugId = function (p) {
        return (p ? p : doodle.ID_PREFIX) + '-' + doodle.idIndex++;
    }

    //doodle.objectWrapper = function(object, fields) {
    //    var result = new doodle.ObjectWrapper(object);
    //    fields.forEach(function(field){
    //        result.__defineGetter__(field, function () {
    //            return result._object[field];
    //        });
    //        result.__defineSetter__(field, function (name) {
    //            this.val = name;
    //        })
    //    });
    //
    //    return result;
    //}
    //
    //var ObjectWrapper = doodle.ObjectWrapper = function(object){
    //    this._object = object;
    //    this.client = {}
    //    this.style = {}
    //}
    //mono.extend(ObjectWrapper, mono.PropertyChangeDispatcher);



    /**
     *
     * @constructor
     */
    var Utils = function () {

    };


    /**
     * check obj is not null
     *
     * if obj not in [undefined,'undefined',null,'null','']  return true
     * @param obj {*}
     * @returns {boolean}
     */
    Utils.prototype.isNotNull = function (obj) {
        return obj !== undefined && obj !== 'undefined' && obj !== null && obj !== 'null' && obj !== '';
    };

    /**
     * load file
     * call onLoad function when loaded file
     * @param url {string}
     * @param onLoad {Function} onLoad(responseText)
     */
    Utils.prototype.loadFile = function (url, onLoad) {
        if (url) {
            var request = new XMLHttpRequest();
            if (onLoad !== undefined) {
                request.addEventListener('load', function (event) {
                    onLoad(event.target.responseText);
                }, false);
            }
            request.open('GET', url, true);
            request.send(null);
        }
    };

    /**
     * is ctrl key down
     * @param evt {MouseEvent}
     * @returns {boolean|*}
     */
    Utils.prototype.isCtrlDown = function (evt) {
        return evt.ctrlKey || evt.metaKey;
    };

    /**
     * is alt key down
     * @param evt {MouseEvent}
     * @returns {boolean}
     */
    Utils.prototype.isAltDown = function (evt) {
        return evt.altKey;
    };

    /**
     * is shift key down
     * @param evt {MouseEvent}
     * @returns {boolean}
     */
    Utils.prototype.isShiftDown = function (evt) {
        return evt.shiftKey;
    };

    /**
     * load scene editor accordion data
     * @returns {object[]}
     */
    Utils.prototype.load2dSceneCategory = function () {
        var accordionData = new doodle.AccordionData();
        accordionData.filterCategory = function (category) {
            if (category == '2d房间模型' ||
                category == '2d机柜模型' ||
                category == '2d环境模型' ||
                category == '2d部件模型' ||
                category == '2d办公模型') {
                return true;
            }
            return false;
        }
        accordionData.sortCategories = function (categories) {

            return categories;
        }

        accordionData.filterModel = function (id) {
            if (id == "twaver.idc.floor.top" ||
                id == "twaver.idc.column.top") {
                return false;
            }
            return true;
        }
        return accordionData.getData();
    };

    /**
     * load rack editor accordion data
     * if you known rack type, editor will show rack model, you count not change other model
     * @param showRack {boolean} true: show all rack model
     * @returns {object[]}
     */
    Utils.prototype.load2dRackCategory = function (showRack) {
        var accordionData = new doodle.AccordionData();
        accordionData.filterCategory = function (category) {
            if (category == '基本模型') {
                return false
            }
            if (category == '') {
                return false;
            }
            if (!showRack && category != '设备2D' && category != '设备模板') {
                return false;
            }
            if (category != '机柜' && category != '设备2D' && category != '设备模板' && category != '机柜模板') {
                return false;
            }

            return true;
        }
        accordionData.filterModel = function (id) {
            if (id.indexOf('.back.') >= 0) {
                return false;
            }
        }
        return accordionData.getData();
    };

    /**
     * load device editor accordion data
     * @returns {object[]}
     */
    Utils.prototype.load2dDeviceCategory = function () {
        var accordionData = new doodle.AccordionData();
        accordionData.filterCategory = function (category) {
            if (category == '基本模型') {
                return false
            }
            if (category == '') {
                return false;
            }
            if (['设备面板', '面板部件', '面板背板', '单板面板'].indexOf(category) < 0) {
                return false;
            }
            return true;
        }
        accordionData.filterModel = function (id) {
            //过滤掉面板部件的空白部件
            if (id == 'twaver.idc.component.panel') {
                return false;
            }
            //过滤掉面板背板的空白背板
            if (id == 'twaver.idc.background.panel') {
                return false;
            }
            return true;
        }
        return accordionData.getData();
    };

    /**
     * load chassis editor accordion data
     * @returns {object[]}
     */
    Utils.prototype.load2dChassisCategory = function () {
        var accordionData = new doodle.AccordionData();
        accordionData.filterCategory = function (category) {
            if (category == '基本模型') {
                return false
            }
            if (category == '') {
                return false;
            }
            if (['设备面板', '单板'].indexOf(category) < 0) {
                return false;
            }
            return true;
        }
        return accordionData.getData();
    };

    /**
     * load circuit editor accordion data
     * @return {object[]}
     */
    Utils.prototype.load2dCircuitCategory = function () {
        var accordionData = new doodle.AccordionData();
        accordionData.filterCategory = function (category) {
            if (category == '基本模型') {
                return false;
            }
            if (category == '') {
                return false;
            }

            if (category == '基本') {
                return true;
            }
            if (['组件',].indexOf(category) < 0) {
                return false;
            }
            return true;
        }
        return accordionData.getData();
    };


    /**
     * load model editor accordion data
     * @returns {object[]}
     */
    Utils.prototype.load3dModelCategory = function () {
        var accordionData = new doodle.AccordionData();
        accordionData.filterCategory = function (category) {
            if (category == "基本模型" || category == "机柜模型" || category == "设备模型" ||
                category == "板卡") {
                return true;
            }
            return false;
        }

        accordionData.filterModel = function (id) {
            if (id == "twaver.combo" || id.indexOf('.top') >= 0) { //组合模型为抽象模型不展示,.top为2d拓扑id也不需要展示
                return false;
            }
            return true;
        }

        return accordionData.getData();

    };

    /**
     * transformAndScaleCanvasContext
     *
     * @param canvas
     * @param force
     * @returns {CanvasRenderingContext2D}
     */
    Utils.prototype.transformAndScaleCanvasContext = function (canvas, force) {
        var context = canvas.getContext("2d");
        if (!force && canvas.isTransfor && canvas.width && canvas.height) return context;

        var devicePixelRatio = window.devicePixelRatio || 1,
            backingStoreRatio = context.webkitBackingStorePixelRatio ||
                context.mozBackingStorePixelRatio ||
                context.msBackingStorePixelRatio ||
                context.oBackingStorePixelRatio ||
                context.backingStorePixelRatio || 1,

            ratio = devicePixelRatio / backingStoreRatio;

        if (devicePixelRatio !== backingStoreRatio) {

            var oldWidth = canvas.offsetWidth;
            var oldHeight = canvas.offsetHeight;

            canvas.width = oldWidth * ratio;
            canvas.height = oldHeight * ratio;

            canvas.style.width = oldWidth + 'px';
            canvas.style.height = oldHeight + 'px';

            // now scale the context to counter
            // the fact that we've manually scaled
            // our canvas element
            context.scale(ratio, ratio);

        }
        if (canvas.width && canvas.height) canvas.isTransfor = true;
        return context;
    };

    /**
     * play move camera animate
     * call onDone function after animate finish
     * @param camera {mono.Camera}
     * @param interaction {mono.BaseInteraction}
     * @param oldPoint {Object(x, y)}
     * @param newPoint {Object(x, y)}
     * @param onDone {Function} onDone()
     */
    Utils.prototype.animateCamera = function (camera, interaction, oldPoint, newPoint, onDone) {
        var offset = camera.getPosition().sub(camera.getTarget());
        var animation = new twaver.Animate({
            from: 0,
            to: 1,
            dur: 500,
            easing: 'easeBoth',
            onUpdate: function (value) {
                var x = oldPoint.x + (newPoint.x - oldPoint.x) * value;
                var y = oldPoint.y + (newPoint.y - oldPoint.y) * value;
                var z = oldPoint.z + (newPoint.z - oldPoint.z) * value;
                var target = new mono.Vec3(x, y, z);
                camera.lookAt(target);
                interaction.target = target;
                var position = new mono.Vec3().addVectors(offset, target);
                camera.setPosition(position);
            },
        });
        animation.onDone = onDone;
        animation.play();
    };

    /**
     * find object3d from mouse event
     * if click background, return null
     * if filter function is undefined, set filter value to doodle.utils.findFirstObjectByMouseFilter
     * @param network {mono.Network}
     * @param mouseEvent {MouseEvent}
     * @param filter {Function} filter(object3d) default value is doodle.utils.findFirstObjectByMouseFilter
     * @returns {mono.Data}
     */
    Utils.prototype.findFirstObjectByMouse = function (network, mouseEvent, filter) {
        if (filter === undefined) {
            filter = this.findFirstObjectByMouseFilter;
        }
        var objects = network.getElementsByMouseEvent(mouseEvent);
        if (objects.length) {
            if (filter) {
                for (var i = 0; i < objects.length; i++) {
                    var first = objects[i];
                    var object3d = first.element;
                    if (filter(object3d)) {
                        return first;
                    }
                }
            } else {
                return objects[0];
            }
        }
        return null;
    };

    /**
     * check object3d selectable from mouse event
     * Billboard could not be selected
     * @param object3d {mono.Data}
     * @returns {boolean}
     */
    Utils.prototype.findFirstObjectByMouseFilter = function (object3d) {
        return !(object3d instanceof mono.Billboard)
    };

    /**
     * get param from window.location
     * eg:/doodle/rackEditor.html?modelClass=twaver.idc.rack42&objectId=C25
     * call function getUrlParam('modelClass') ,return 'twaver.idc.rack42'
     * @param name {string}
     * @returns {string}
     */
    Utils.prototype.getUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(decodeURIComponent(r[2]));
        return null;
    };

    /**
     * get model parameter from make
     * default property type is make.Default.PARAMETER_PROPERTY_TYPE_CLIENT
     * default property category is 'attributes'
     * @param id {string}
     * @returns {twaver.Property[]}
     */
    Utils.prototype.getModelParameter = function (id) {
        return make.Default.getModelDefaultParameters(id);
    };

    /**
     * initialize property sheet
     * @param sheet {twaver.PropertySheet}
     */
    Utils.prototype.initPropertySheet = function (sheet) {

        sheet.setEditable(true);
        var sheetBox = sheet.getPropertyBox();
    };

    /**
     * add properties into property sheet box
     * @param box {twaver.PropertyBox}  property sheet box
     * @param properties {twaver.Property[]} properties
     */
    Utils.prototype.addProperties = function (box, properties) {


        properties.forEach(function (prop) {

            box.add(prop);
        })
    };

    /**
     *  create scene network3d
     * args 中参数说明
     * renderView:
     *     传入将要渲染3d界面的html元素
     *     可以是元素本身,可以是id,也可以是className,
     *     如果不传该参数或如果前面三种方式均找不到html元素,方法内部会创建一个div,添加到body中
     * network
     *     传入mono.Network3D实例,如果不传值,内部会创建一个实例
     * initialized
     *     是否已经初始化network对象
     *     如果是null或undefined,会初始化network里面的相机等参数
     * @param args {Object(renderView,network, initialized)}
     * @returns network: mono.Network3D
     */
    Utils.prototype.createSceneNetwork3D = function (args) {

        var self = this;
        args = args || {};
        var network = args.network || new mono.Network3D();
        var box = network.getDataBox();

        if (!args.initialized) {
            var camera = new mono.PerspectiveCamera(30, 1.5, 50, 20000);
            network.setCamera(camera);
            camera.p(1328.647469988342, 2925.856952899234, 2084.0725294541244);
            camera.look(new mono.Vec3(1356.0876637604608, 255.78986100252212, -567.4369627978233));

            var interaction = network.getDefaultInteraction();
            interaction.yLowerLimitAngle = Math.PI / 180 * 2;
            interaction.yUpLimitAngle = Math.PI / 2;
            interaction.maxDistance = 10000;
            interaction.minDistance = 50;
            interaction.zoomSpeed = 3;
            interaction.panSpeed = 0.2;
            network.setInteractions([interaction]);

            var pointLight = new mono.PointLight(0xFFFFFF, 0.1);
            pointLight.setPosition(8000, 8000, 8000);
            box.add(pointLight);
            box.add(new mono.AmbientLight('white'));
        }

        var rootView = network.getRootView();
        var renderView = null;
        if (args.renderView && typeof args.renderView != 'string') {
            renderView = args.renderView;
        }
        if (!renderView) {
            renderView = document.getElementById(args.renderView)
        }
        if (!renderView) {
            renderView = document.getElementsByClassName(args.renderView)[0];
        }
        if (!renderView) {
            renderView = document.createElement('div')
            renderView.setAttribute('class', 'renderView-scene-3d');
            renderView.style.position = 'absolute';
            renderView.style.width = '100%';
            renderView.style.height = '100%';
            document.body.appendChild(renderView);
        }
        renderView.appendChild(rootView);
        mono.Utils.autoAdjustNetworkBounds(network, renderView, 'clientWidth', 'clientHeight', 0, 0);
        var oldClass = rootView.getAttribute('class');
        if (!oldClass) {
            oldClass = '';
        }
        rootView.setAttribute('class', oldClass + '  network3d-view');
        rootView.addEventListener('dblclick', function (e) {
            self.handleDoubleClick(e, network, args.handleDoubleClick);
        });
        return network;
    };

    /**
     * load scene data
     * if filter return true, do not add into box
     * @param box {mono.DataBox}
     * @param data {Object[]}
     * @param filter {Function} filter(data)
     */
    Utils.prototype.loadSceneData = function (box, data, filter) {
        var self = this;
        make.Default.load(data, function (result) {
            for (var i in result) {
                var data = result[i];
                if (filter && filter(data)) {
                    continue;
                }
                box.addByDescendant(data);
            }
        });
    };

    /**
     * load device data
     * @param box {mono.DataBox} box
     * @param rack {mono.Element} 机柜节点
     * @param data {Object[]} 设备数据
     * @param filter {Function} filter(node) 返回true,过滤当前设备
     */
    Utils.prototype.loadDeviceData = function (box, rack, data, filter) {

        var self = this;
        var parentNode = rack;
        var offsetY = make.Default.RACK_OFFSET_Y;
        var unitHeight = make.Default.getUnitHeight();
        var pbb = parentNode.getBoundingBox();
        var result = make.Default.load(data);
        for (var i in result) {
            var node = result[i];
            if (filter && filter(node)) {
                continue;
            }
            var location = data[i].client.loc;
            var bb = node.getBoundingBox();
            var y = offsetY + (location - 1) * unitHeight - (pbb.max.y - pbb.min.y) / 2 + (bb.max.y - bb.min.y) / 2;
            node.setY(y);
            node.setZ((pbb.max.z - pbb.min.z) / 2 - (bb.max.z - bb.min.z) / 2 + 1);
            node.setParent(parentNode);
            box.addByDescendant(node);
        }
    };

    /**
     * double click in 3d
     * @param e {MouseEvent}
     * @param network {mon.Network}
     * @param handler {Function} handler(element, network, firstClickObject, e);
     */
    Utils.prototype.handleDoubleClick = function (e, network, handler) {
        var camera = network.getCamera();
        var interaction = network.getDefaultInteraction();
        var firstClickObject = this.findFirstObjectByMouse(network, e);
        if (firstClickObject) {
            var element = firstClickObject.element;
            var newTarget = firstClickObject.point;
            var oldTarget = camera.getTarget();
            this.animateCamera(camera, interaction, oldTarget, newTarget, function () {
                if (element.getClient('animation')) {
                    make.Default.playAnimation(element, element.getClient('animation'));
                }
            });
            if (element.getClient('dbl.func')) {
                var func = element.getClient('dbl.func');
                func(element, network, firstClickObject, e);
            } else if (element.getClient('type') == 'rack_door') {
                var func = element.getParent().getClient('dbl.func');
                func && func(element.getParent(), network, firstClickObject, e);
            }
            handler && handler(element, network, firstClickObject, e);
        } else {
            var oldTarget = camera.getTarget();
            var newTarget = new mono.Vec3(0, 0, 0);
            this.animateCamera(camera, interaction, oldTarget, newTarget);
        }
    };

    /**
     *
     * create panel dialog
     * @returns {HTMLDivElement}
     */
    Utils.prototype.createPanelDialog = function () {

        if (window.$ && window.$.ui && window.$.ui.dialog) {

            var content = $("<div class='panel-main'></div>").appendTo(document.body);
            $(content).dialog({
                "title": "设备面板",
                "width": 1000,
                "height": 500,
                modal: true,
                close: function () {
                    content.network.dispose();
                    content.remove();
                }
            });
            return content;
        } else {
            throw 'there is not import jquery and jquery-ui.js'
        }
    };


    /**
     *  create device panel network2d
     * args 中参数说明
     * renderView:
     *     传入将要渲染3d界面的html元素
     *     可以是元素本身,可以是id,也可以是className,
     *     如果不传该参数或如果前面三种方式均找不到html元素,方法内部会创建一个div,添加到body中
     * network
     *     传入twaver.vector.Network实例,如果不传值,内部会创建一个实例
     * @param args {Object(renderView, network)}
     * @returns network {twaver.vector.Network}
     */
    Utils.prototype.createPanelNetwork2D = function (args) {

        args = args || {};

        var network = args.network || new twaver.vector.Network();
        var box = network.getElementBox();
        var view = network.getView();
        network.setMaxZoom(50);
        view.setAttribute('class', 'network-view-device-panel');
        var renderView = null;
        if (args.renderView && typeof args.renderView != 'string') {
            renderView = args.renderView;
        }
        if (!renderView) {
            renderView = document.getElementById(args.renderView)
        }
        if (!renderView) {
            renderView = document.getElementsByClassName(args.renderView)[0];
        }
        if (!renderView) {
            renderView = document.createElement('div')
            renderView.setAttribute('class', 'renderView-panel');
            renderView.style.position = 'absolute';
            renderView.style.width = '100%';
            renderView.style.height = '100%';
            document.body.appendChild(renderView);
        }
        renderView.appendChild(view);
        var w = renderView.clientWidth;
        var h = renderView.clientHeight;
        network.adjustBounds({ x: 0, y: 0, width: w, height: h });
        setTimeout(function () {
            network.zoomOverview();
        }, 500)
        return network;
    };

    /**
     * load panel data
     * @param box {twaver.ElementBox}
     * @param data {Object[]}
     * @param x {number}
     * @param y {number}
     * @param scale {number}
     */
    Utils.prototype.loadPanelData = function (box, data, x, y, scale) {
        scale = scale || 1;
        x = x || 0;
        y = y || 0;
        var node = make.Default.load({
            id: 'twaver.idc.panel.loader',
            data: data,
            scale: scale,
            x: x,
            y: y
        });
        if (node instanceof Array) {
            node.forEach(function (n) {
                box.addByDescendant(n);
            })
        } else {
            box.addByDescendant(node);
        }

    };

    /**
     * 取得场景编辑器器中3d模型id, 传入2d模型id
     * @param id {String}
     * @returns {String}
     */
    Utils.prototype.getSceneEditorModel3dId = function (id) {

        var id3 = id.replace($consts.MODEL_SUFFIX_SEPARATOR + $consts.SCENE_MODEL_SUFFIX, '');
        var id2 = id3 + $consts.MODEL_SUFFIX_SEPARATOR + $consts.SCENE_MODEL_SUFFIX;
        return $consts.sceneEditorModel2dTo3dMapping[id2] || id3;
    };

    /**
     * 取得场景编辑器器中2d模型id, 传入3d模型id
     * @param id {String}
     * @returns {String}
     */
    Utils.prototype.getSceneEditorModel2dId = function (id) {

        var id3 = id.replace($consts.MODEL_SUFFIX_SEPARATOR + $consts.SCENE_MODEL_SUFFIX, '');
        var id2 = id3 + $consts.MODEL_SUFFIX_SEPARATOR + $consts.SCENE_MODEL_SUFFIX;
        return $consts.sceneEditorModel3dTo2dMapping[id3] || id2;
    };

    /**
     * 取得机柜编辑器器中3d模型id, 传入2d模型id
     * @param id {String}
     * @returns {String}
     */
    Utils.prototype.getRackEditorModel3dId = function (id) {

        var id3 = id.replace($consts.MODEL_SUFFIX_SEPARATOR + $consts.RACK_MODEL_SUFFIX, '');
        var id2 = id3 + $consts.MODEL_SUFFIX_SEPARATOR +  $consts.RACK_MODEL_SUFFIX;
        return $consts.rackEditorModel2dTo3dMapping[id2] || id3;
    };

    /**
     * 取得机柜编辑器器中3d模型id, 传入2d模型id,rack为.front，设备为.device.front
     * @param id {String}
     * @returns {String}
     */
    Utils.prototype.getRackEditorModel2dId = function (id, categoryId) {

        var id3 = id.replace($consts.MODEL_SUFFIX_SEPARATOR + $consts.RACK_MODEL_SUFFIX, '');
        var id2 = id3 + $consts.MODEL_SUFFIX_SEPARATOR + (categoryId == 'rack' ? '' : 'device.') + $consts.RACK_MODEL_SUFFIX;
        return $consts.rackEditorModel3dTo2dMapping[id3] || id2;
    };

    /**
     * 取得设备编辑器器中3d模型id, 传入2d模型id
     * @param id {String}
     * @returns {String}
     */
    Utils.prototype.getDeviceEditorModel3dId = function (id) {

        var id3 = id.replace($consts.MODEL_SUFFIX_SEPARATOR + $consts.DEVICE_MODEL_SUFFIX, '');
        var id2 = id3 + $consts.MODEL_SUFFIX_SEPARATOR + $consts.DEVICE_MODEL_SUFFIX;
        return $consts.deviceEditorModel2dTo3dMapping[id2] || id3;
    };


    /**
     * 取得设设备编辑器器中3d模型id, 传入2d模型id
     * @param id {String}
     * @returns {String}
     */
    Utils.prototype.getDeviceEditorModel2dId = function (id) {

        var id3 = id.replace($consts.MODEL_SUFFIX_SEPARATOR + $consts.DEVICE_MODEL_SUFFIX, '');
        var id2 = id3 + $consts.MODEL_SUFFIX_SEPARATOR + $consts.DEVICE_MODEL_SUFFIX;
        return $consts.deviceEditorModel3dTo2dMapping[id3] || id2;
    };

    /**
     * create import dialog
     * @param title {String}
     * @param ext {String} file suffix
     * @param callback {Function} callback(fileContent)
     * @returns {nsp.edit.Dialog}
     */
    Utils.prototype.createImportDialog = function (title, ext, callback, isBuffer) {

        this.fileIndex = this.fileIndex || 1;
        var id = 'files-' + this.fileIndex;
        this.fileIndex++;
        var importDialog = new nsp.edit.Dialog(title, {
            OK: function () {
                var files = $('#' + id)[0];
                if (files.files && files.files.length > 0) {
                    var file = files.files[0];
                    if (file.name.indexOf(".") > 0) {
                        var fi = file.name.split(".");
                        if (fi[1] != ext) {
                            alert('file format should be ' + ext);
                            return;
                        }
                        var reader = new FileReader();
                        if (isBuffer) {
                            reader.readAsArrayBuffer(file);
                        } else {
                            reader.readAsText(file);
                        }
                        reader.onloadend = function () {
                            if (reader.error) {
                                console.log(reader.error);
                            } else {
                                if (callback) {
                                    callback(reader.result);
                                }
                            }
                        }
                    }
                }
                $(this).dialog("close");
            },
            Cancel: function () {
                $(this).dialog("close");
            }
        });
        importDialog.init();
        importDialog.getView().dialog("option", "width", 450);
        importDialog.getView().dialog("option", "height", 180);
        var innerHTML = "" +
            "<div" +
            "   ><label class='field'>File Path:</label>" +
            "   <input id='" + id + "' type='file' class='input' size='20'/>" +
            "</div>";
        importDialog.setData(innerHTML);
        return importDialog;
    };


    /**
     * create export dialog
     * @param text {String} export data string
     */
    Utils.prototype.createExportDialog = function (text) {
        if (text instanceof Object) {
            text = JSON.stringify(text);
        }
        var content = "<div>导出数据：<br><textarea>" + text + "</textarea></div>";
        $(content).dialog({
            "title": "导出json",
            "width": 400,
            "height": 500
        });
    };

    Utils.prototype.createJsonObject = function (jsonBox, jsons, id) {
        if (jsons.length > 0) {
            for (var i = 0; i < jsons.length; i++) {
                var json = jsons[i];
                if (id) json.dataType = id;
                var jsonData = $utils._getJsonData(json);
                jsonBox.add(jsonData);
            }
        }
    };

    Utils.prototype._getJsonData = function (json) {
        var node = new nsp.edit.data.JsonObject();
        var id = json.id;
        var datas = json.data;
        var position = json.position || [0, 0, 0];
        var width = json.width;
        var depth = json.depth;
        if (id) {
            node.id = id;
        }
        if (json.objectId) {
            node.objectId = json.objectId;
        }

        //set Data
        if (datas != null && datas.length > 0) {
            var data = [];
            if (datas[0] instanceof Array) {
                for (var i = 0; i < datas.length; i++) {
                    var data1 = datas[i],
                        length = datas[i].length;
                    if (length == 2) {
                        data.push([data1[0] - position[0], data1[1] - position[2]]);
                    } else if (length == 5) {
                        data.push([data1[0], data1[1] - position[0], data1[2] - position[2], data1[3] - position[0], data1[4] - position[2]]);
                    }
                }
            } else {
                for (var i = 0; i < datas.length; i = i + 2) {
                    data.push([datas[i] - position[0], datas[i + 1] - position[2]]);
                }
            }

            node.setData(data);
        }

        if (json.children) {
            var children = [];
            for (var i = 0; i < json.children.length; i++) {
                var childJson = json.children[i];
                var child = $utils._getJsonData(childJson);
                children.push(child);
            }

            node.setChildren(children);
        }

        if (position) {
            node.setPosition(position);
        }

        if (width) {
            node.setWidth(width);
        }

        if (depth) {
            node.setDepth(depth);
        }

        if (json.rotation) {
            node.setRotation(json.rotation);
        }

        if (json.closed) {
            node.setClosed(json.closed);
        }

        if (json.showFloor) {
            node.setShowFloor(json.showFloor);
        }

        json.client = json.client || {};
        json.client['label'] = make.Default.getName(id);
        if (json.dataType) {
            node.client['dataType'] = json.dataType;
        }
        if (json.client) {
            node.setClient(json.client);
        }

        return node;
    };

    Utils.prototype.isEditModel = function (element) {

        return true;
    };

    Utils.prototype.isMoveModel = function (element) {

        return true;
    };


    Utils.prototype.isChild = function (element) {
        var type = element.getClient('type');
        var types = ['door', 'window'];
        if (type && types.indexOf(type) >= 0) {
            return true;
        }
        return false;
    };


    Utils.prototype.stopPropagation = function (e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
    };

    Utils.prototype.parseDxf = function (text) {

        var importDxf = new nsp.edit.ImportDxf();
        var jsons = importDxf.loadDxf(text);
        return jsons;
    };


    /**
     * object 转成json
     * @param o {Object}
     * @return {string}
     */
    Utils.prototype.o2s = function (o) {
        try {
            return JSON.stringify(o)
        } catch (e) {
            throw e;
        }
    };

    /**
     * json装成object
     * @param s {string}
     * @return {Object}
     */
    Utils.prototype.s2o = function (s) {

        try {
            return JSON.parse(s)
        } catch (e) {
            throw e;
        }
    };

    /**
     * 复制一个对象
     * @param o
     * @returns {Object}
     */
    Utils.prototype.clone = function (o) {
        if (o.clone) {
            return o.clone();
        }
        return $utils.s2o($utils.o2s(o));
    };


    /**
     * 继承
     * @param subClass {Object} child class
     * @param superClass {Object} parent class
     * @param o
     */
    Utils.prototype.ext = function (subClass, superClass, o) {
        var prototype = subClass.prototype;
        twaver.Util.ext(subClass, superClass, o);

        if (prototype && subClass.prototype) {
            for (var p in prototype) {
                subClass.prototype[p] = prototype[p];
            }
        }
    }

    Utils.prototype.addMask = function (maskId) {
        var back;
        var bWidth = parseInt(document.body.scrollWidth);
        var bHeight = parseInt(document.body.scrollHeight);
        //add mask
        back = document.createElement("div");
        if (maskId) {
            back.setAttribute('id', 'mask_' + maskId);
        } else {
            back.setAttribute('id', 'mask');
        }
        back.setAttribute("class", "mask");
        document.body.appendChild(back);
        return back;
    }

    Utils.prototype.setDialogRect = function (dialogID) {
        var mask = document.getElementById('mask');
        if (document.getElementById('mask_' + dialogID)) {
            mask = document.getElementById('mask_' + dialogID);
        }
        if (mask) {
            var windowWidth = mask.offsetWidth;
            var windowHeight = mask.offsetHeight;
            var div = document.getElementById(dialogID);
            var divWidth = div.offsetWidth;
            var divHeight = div.offsetHeight;
            div.style.left = windowWidth / 2 - divWidth / 2 + 'px';
            div.style.top = windowHeight / 2 - divHeight / 2 + 'px';
        }
    }

    /**
     * 从url中取得值
     * @param uri
     * @param val
     * @returns {*}
     *  @example
     *  http://
     */
    Utils.prototype.queryString = function (uri, val) {
        var re = new RegExp("" + val + "=([^&?]*)", "ig");
        return ((uri.match(re)) ? (uri.match(re)[0].substr(val.length + 1)) : null);
    }

    /**
     * 判断pint是否在rect中
     * @param point
     * @param rect
     * @returns {boolean}
     */
    Utils.prototype.isPointInRect = function (point, rect) {
        return (point.x > rect.x && point.x < (rect.x + rect.width)) && (point.y > rect.y && (point.y < (rect.y + rect.height)));
    };

    /**
     * 移动选中的元素
     * @param databox
     * @param type
     * @param xgap
     * @param ygap
     */
    Utils.prototype.moveSelectionElements = function (databox, type, xgap, ygap) {
        var selections = databox.getSelectionModel().getSelection();
        if (selections.size() > 0) {
            var xoffset = 0;
            var yoffset = 0;
            if (type === "left") {
                xoffset = -xgap;
            }
            if (type === "right") {
                xoffset = xgap;
            }
            if (type === "top") {
                yoffset = -ygap;
            }
            if (type === "bottom") {
                yoffset = ygap;
            }
            twaver.Util.moveElements(selections, xoffset, yoffset, false);
        }
    }

    Utils.prototype.isNodeInNode = function (parentNode, childNode) {
        var points = this.getNodePoints(parentNode);
        var point = childNode.getCenterLocation();
        return this.isPointInPolygon(points, point);
    }

    /**
     * 判断一个点是否在一堆点围成的多边形里面里面
     * @param points
     * @param point
     * @returns {boolean}
     */
    Utils.prototype.isPointInPolygon = function (points, point) {
        var i = 0,
            j = 0,
            c = false,
            size = points.length;
        for (i = 0, j = size - 1; i < size; j = i++) {
            var p1 = points[i];
            var p2 = points[j];
            if (((p1.y > point.y) != (p2.y > point.y)) && (point.x < (p2.x - p1.x) * (point.y - p1.y) / (p2.y - p1.y) + p1.x)) {
                c = !c;
            }
        }
        return c;
    }

    /**
     * 绕一个点旋转
     * @param point 将要旋转的点
     * @param angle 旋转的弧度
     * @param centerPoint 绕centerPoint旋转
     * @returns {{x: *, y: *}}
     */
    Utils.prototype.rotatePoint = function (point, angle, centerPoint) {

        var centerPoint = centerPoint || { x: 0, y: 0 };
        var rx0 = centerPoint.x;
        var ry0 = centerPoint.y;
        var x = point.x;
        var y = point.y;
        var a = angle;
        var x0 = (x - rx0) * Math.cos(a) - (y - ry0) * Math.sin(a) + rx0;
        var y0 = (x - rx0) * Math.sin(a) + (y - ry0) * Math.cos(a) + ry0;
        return { x: x0, y: y0 }
    }

    /**
     * 取得节点的边框的坐标点
     * @param node
     * @returns {Array}
     */
    Utils.prototype.getNodePoints = function (node) {
        var self = this;
        if (node instanceof twaver.ShapeNode) {
            return node.getPoints().toArray();
        }
        var center = node.getCenterLocation();
        var angle = node.getAngle() / 180 * Math.PI;
        var loc = node.getLocation();
        var size = node.getSize();
        var points = [
            { x: loc.x, y: loc.y },
            { x: loc.x + size.width, y: loc.y },
            { x: loc.x + size.width, y: loc.y + size.height },
            { x: loc.x, y: loc.y + size.height }
        ];
        var result = points.map(function (p) {
            return self.rotatePoint(p, angle, center)
        });
        return result;
    }

    var timerIdMap = {};
    Utils.prototype.runDelayTask = function (id, delay, task) {
        if (timerIdMap[id]) {
            clearTimeout(timerIdMap[id]);
        }
        timerIdMap[id] = setTimeout(function () {
            timerIdMap[id] = null;
            task && task()
        }, delay);
    }

    Utils.prototype.is = function (o, obj) {
        return Object.prototype.toString.call(o) === '[object ' + obj + ']';
    }

    Utils.prototype.padStart = function (string, length, chars) {
        string = string + '';
        chars = chars || '0';
        var strLength = length ? string.length : 0;
        return (length && strLength < length) ?
            (this.baseRepeat(chars, length - strLength) + string) :
            string;
    }
    Utils.prototype.baseRepeat = function (string, n) {
        var result = '';
        if (!string || n < 1 || n > Number.MAX_SAFE_INTEGER) {
            return result;
        }
        do {
            if (n % 2) {
                result += string;
            }
            n = Math.floor(n / 2);
            if (n) {
                string += string;
            }
        } while (n);

        return result;
    }


    var $utils = new Utils();

    //doodle.Utils 是为了兼容旧版本
    doodle.Utils = doodle.utils = $utils;




    /**
     * 左侧工具栏
     * @constructor
     */
    var AccordionData = function () {

        this._data = [];
        this.init();
    }

    AccordionData.prototype = {
        init: function () {
            this._data = [];

            var self = this;
            //查询所有的类别
            var categoriesTemp = make.Default.getCategories();
            var categories = [];

            //判断是否需要过滤
            categoriesTemp.forEach(function (category) {
                if (self.filterCategory && self.filterCategory(category) === false) {
                    return;
                }
                categories.push(category);
            })

            //排序
            if (this.sortCategories) {
                categories = this.sortCategories(categories);
            }

            categories.forEach(function (category) {

                var models = [];
                var modelMap = make.Default.getCreatorsForCategory(category);
                for (var id in modelMap) {

                    //判断是否需要过滤
                    if (self.filterModel && self.filterModel(id) === false) {
                        continue
                    }
                    var params = make.Default.getParameters(id);
                    var icon = make.Default.getIcon(id);
                    var combo = make.Default.isCombo(id);
                    models.push({
                        id: id,
                        icon: icon,
                        label: params.name,
                        category: category,
                        combo: combo,
                    })
                }

                //排序
                if (self.sortModels) {
                    models = self.sortModels(models);
                }

                if (models && models.length > 0) {
                    self._data.push({
                        title: category,
                        contents: models
                    });
                }

            })
        },

        /**
         * get result data
         * @returns {Object[]}
         */
        getData: function () {
            this.init();
            return this._data;
        },

        /**
         * 按category过滤
         * @param category {String}
         * @returns {boolean}
         */
        filterCategory: function (category) {
            if (category == '基本模型') {
                return false
            }
            if (category == '') {
                return false;
            }
            return true;
        },

        /**
         * category排序
         * @param categories  {String[]}
         * @returns {String[]}
         */
        sortCategories: function (categories) {
            return categories;
        },

        /**
         * 按注册modelId过滤
         * @param modelId {String}
         * @returns {boolean}
         */
        filterModel: function (modelId) {
            return true;
        },

        /**
         * 按注册的modelId排序
         * @param models {String[]}
         * @returns  {String[]}
         */
        sortModels: function (models) {
            return models;
        },


    }

    doodle.AccordionData = AccordionData;

    doodle.utils.ext(AccordionData, Object)
    /**
     * accordion pane
     * 组件栏 - 使用了jquery-ui中的Accordion组件
     * @constructor
     */
    var AccordionPane = function () {

        this.init();
        this._categories = [];
        this._visible = true;
        this._reset = true;
    }
    AccordionPane.prototype = {

        init: function () {
            this.paneBox = $('<div id="accordion-resizer" class="ui-widget-content"></div>');
            this.mainPane = $('<div id="accordion"></div>').appendTo(this.paneBox);
            this.mainPane.accordion({
                heightStyle: "fill",
            });
        },

        /**
         * set categories data
         * @param categories {Object[]}
         * @returns {Object[]}
         */
        setCategories: function (categories) {

            var old = this._categories;
            this._categories = categories;
            this.mainPane.accordion('destroy');
            this.mainPane.empty();
            var self = this;
            if (categories) {
                for (var i = 0; i < categories.length; i++) {
                    var category = categories[i];

                    var categoryTitleDom = $('.' + category.title);
                    if (categoryTitleDom.length == 0) {
                        categoryTitleDom = $('<h3 class="' + category.title + '">' + category.title + '</h3>').appendTo(this.mainPane)
                        $('<ul class="mn-accordion"></ul>').appendTo(this.mainPane);
                    }
                    var categoryContentDom = categoryTitleDom.next('.mn-accordion');
                    category.contents.forEach(function (data) {
                        var icon = data.icon;
                        if (!icon || icon.indexOf('undefined') >= 0) {
                            icon = 'images/cloud-up-icon.png';
                        }
                        var itemDiv = $('<li class="item-li" style="height: 108px;"></li>').appendTo(categoryContentDom);
                        var img = $('<img src=' + icon + ' title=' + (data.description || data.label) + '></img>')
                        var label = $('<div class="item-label" style="word-break: break-all; display: -webkit-box;-webkit-box-orient: vertical;-webkit-line-clamp: 2;overflow: hidden;">' + data.label + '</div>');
                        itemDiv.append(img);
                        itemDiv.append(label);
                        self.setImageDraggable(img[0], data);
                        img[0]._errCount = 0;
                        img.error(function () {
                            this._errCount++;
                            if (this._errCount <= 3) {
                                $(this).attr('src', make.Default.path + "model/idc/icons/ball-red.png");
                            }
                        })
                    });
                }
            }
            this.mainPane.accordion({
                heightStyle: "fill",
                collapsible: true //设置面板可折叠，默认为click事件折叠
            });
            this.mainPane.accordion("refresh");
            this.refresh();
            return old;
        },

        /**
         * get categories data
         * @returns {Object[]}
         */
        getCategories: function () {

            return this._categories;
        },

        /**
         * set accordion visible
         * @param v {boolean}
         */
        setVisible: function (v) {
            if (this._visible != v) {
                this._visible = v;
                if (this._visible) {

                    this.paneBox.show();
                } else {
                    this.paneBox.hide();
                }
            }
        },

        /**
         * get accordion visible
         * @returns {boolean}
         */
        isVisible: function () {
            return this._visible;
        },

        /**
         * refresh accordion widget
         */
        refresh: function () {
            var self = this;
            setTimeout(function () {
                self.mainPane.accordion("refresh");
            }, 100)
        },

        /**
         * accordion widget box
         * @returns {HTMLDIVElement}
         */
        getView: function () {
            return this.paneBox[0];
        },

        /**
         * set image draggable
         * @param image {Image}
         * @param item {Object}
         */
        setImageDraggable: function (image, item) {
            var self = this;
            nsp.edit.DragAndDrop.setDragTarget(image, item, {
                effectAllowed: 'copyMove',

                dragImage: item.dragImage || item.icon,
                ondrag: function (e) {
                    self.ondrag && self.ondrag(e, item);
                    // console.log(item,'>>>>>>');
                },
            });
        },

        /**
         * drag handler
         * @param e {DragEvent}
         * @param item {Object}
         */
        ondrag: function (e, item) {

        },

    }

    doodle.AccordionPane = nsp.edit.AccordionPane = AccordionPane;

    doodle.utils.ext(AccordionPane, Object);
    /**
     * 编辑器常量
     * @type {{}}
     */
    var $consts = {

        /**
         * 模型后缀的分隔符
         */
        MODEL_SUFFIX_SEPARATOR: '.',

        /**
         * 场景编辑器中默认后缀
         */
        SCENE_MODEL_SUFFIX: 'top', //

        /**
         * 机柜编辑器中默认后缀
         */
        RACK_MODEL_SUFFIX: 'front', //

        /**
         * 设备编辑器中默认后缀
         */
        DEVICE_MODEL_SUFFIX: 'panel', //

        /**
         * 场景编辑双击机柜是否跳到机柜编辑器
         */
        REDIRECT_RACK_EDITOR: true, //

        /**
         * 机柜编辑器双击设备,是否跳到设备编辑器
         */
        REDIRECT_DEVICE_EDITOR: true, //

        /**
         * 场景编辑器 3d-2d映射关系
         */
        sceneEditorModel3dTo2dMapping: {},
        /**
         * 场景编辑器 2d-3d映射关系
         */
        sceneEditorModel2dTo3dMapping: {},
        /**
         *
         */
        rackEditorModel3dTo2dMapping: {},

        /**
         * 机柜编辑器 2d-3d映射关系
         */
        rackEditorModel2dTo3dMapping: {},

        /**
         * 设备编辑器 3d-2d映射关系
         */
        deviceEditorModel3dTo2dMapping: {},

        /**
         * 场景编辑器 2d-3d映射关系
         */
        deviceEditorModel2dTo3dMapping: {},

        /**
         * 电路编辑器 3d-2d映射关系
         */
        circuitEditorModel3dTo2dMapping: {},

        /**
         * 电路编辑器 2d-3d映射关系
         */
        circuitEditorModel2dTo3dMapping: {},

        /**
         * 粘帖时,x方向的偏移
         */
        pasteOffsetX: 10,

        /**
         * 粘帖时,y方向的偏移
         */
        pasteOffsetY: 10,

        /**
         * 粘帖时,z方向的偏移
         */
        pasteOffsetZ: 10,
    }

    /**
     * @namespace
     */
    doodle.consts = $consts;
    nsp.edit.Consts = $consts;


    var Dialog = nsp.edit.Dialog = function (title, buttons, params, close) {
        var title = title || 'Dialog';
        this.dialog = $('<div id="export-message" title = "' + title + '"></div>');
        this.content = $('<div class="inner" ></div>');
        this.dialog.append(this.content);
        this.buttons = buttons;
        this.params = params || {};
    }


    Dialog.prototype.setData = function (data) {
        if (typeof (data) === "string") {
            this.content.html(data);
        } else {
            this.content.append(data);
        }

    }

    Dialog.prototype.getView = function () {
        return this.dialog;
    }

    Dialog.prototype.init = function () {
        if (!this.buttons) {
            this.buttons = {
                Ok: function () {
                    $(this).dialog("close");
                },
            }
        }
        this.dialog.dialog({
            height: 300,
            width: 350,
            autoOpen: false,
            show: {
                effect: "fade",
            },
            hide: {
                effect: "fade",
            },
            modal: true,
            buttons: this.buttons,
            close: this.params.close
        });
    }

    Dialog.prototype.show = function () {
        this.dialog.dialog("open");
    }

    Dialog.prototype.hide = function () {
        this.dialog.dialog("close");
    }
    // http://www.runoob.com/html/html5-draganddrop.html 
    // http://www.runoob.com/jsref/event-ondragend.html
    // http://www.zhangxinxu.com/wordpress/2011/02/html5-drag-drop-%E6%8B%96%E6%8B%BD%E4%B8%8E%E6%8B%96%E6%94%BE%E7%AE%80%E4%BB%8B/
    // http://www.w3cmm.com/html/drag.html
    // http://man.ddvip.com/web/dhtml/properties/effectallowed.html
    var DragAndDrop = nsp.edit.DragAndDrop = {};
    DragAndDrop.setDragImage = function (dragImage, event) {
        if (dragImage) {
            var temp = dragImage;
            if (typeof dragImage === 'string') {
                dragImage = document.createElement('img');
                dragImage.setAttribute('src', temp);
            }
            if (event.dataTransfer.setDragImage) {
                event.dataTransfer.setDragImage(dragImage, dragImage.width / 2, dragImage.height / 2);
            }
        }
    };

    DragAndDrop.setDragTarget = function (view, data, params) {
        params = params || {};
        view.setAttribute('dragable', true);
        var dragData = data;
        if (data != null && typeof dragData !== 'string') {
            dragData = JSON.stringify(dragData);
        }
        var dragImage = params.dragImage;
        view.ondragstart = function (event) {
            if (dragData) {
                event.dataTransfer.setData("Text", dragData);
            }
            if (params.effectAllowed) {
                event.dataTransfer.effectAllowed = params.effectAllowed;
            }
            DragAndDrop.setDragImage(dragImage, event);
            params.ondragstart && params.ondragstart(event);
        };
        if (params.ondragend) {
            view.ondragend = params.ondragend;
        }
        if (params.ondrag) {
            view.ondrag = params.ondrag;
        }
    };

    DragAndDrop.allowDrop = function (event) {
        event.preventDefault();
    };

    DragAndDrop.setDropTarget = function (view, params) {
        params = params || {};
        if (params.ondragenter) {
            view.ondragenter = params.ondragenter;
        }
        view.ondragover = function (event) {
            DragAndDrop.allowDrop(event);
            if (params.dropEffect) {
                event.dataTransfer.dropEffect = params.dropEffect;
            }
            var data = event.dataTransfer.getData("Text");
            params.ondragover && params.ondragover(event, data);
        };
        view.ondragleave = params.ondragleave;
        view.ondrop = function (event) {
            event.preventDefault();
            var data = event.dataTransfer.getData("Text");
            params.ondrop && params.ondrop(event, data);
        };
    };

    /**
     * 编辑器基类
     * 构造函数执行完成后,会调用_init()方法
     * @param parentView {HTMLDIVElement} network view box
     * @constructor
     */
    var Editor = function (parentView) {

        var self = this;
        this.parentView = $(parentView);
        this._accordionVisible = true;
        this._propertySheetVisible = true;
        this.accordionPane = null;
        this.ruler = null;
        this.network2d = null;
        this.bidQuickFinder = null;
        this.undoManager = null;

        this.copyFilter = function (item) {
            return item;
        }

        this.pasteFilter = function (item) {
            return item;
        }

        this.flowAndCopyFilter = function (item) {
            return item;
        }


        this.parentView.resize(function () {
            self.parentResizeHandle && self.parentResizeHandle();
        });

        this.contentPane = $('<div class="editor-container"></div>').appendTo(parentView);

        this.propertySheetBox = $('<div class="propertySheetBox right-content"></div>').appendTo(this.contentPane);

        this.accordionPaneBox = $('<div class="accordionPaneBox"></div>').appendTo(this.contentPane);

        this.networkBox = $('<div class="networkBox"></div>').appendTo(this.contentPane);

        this.adjustBounds({
            left: '0px',
            right: '0px',
            top: '0px',
            bottom: '0px'
        });

        this.flowOffsetX = 0;
        this.flowOffsetY = 0;

        this.pasteOffsetDx = $consts.pasteOffsetX;
        this.pasteOffsetDy = $consts.pasteOffsetY;
        this.pasteOffsetDz = $consts.pasteOffsetZ;

        /**
         * 粘帖时,X方向偏移量
         * @type {number}
         */
        this.pasteOffsetX = $consts.pasteOffsetX;

        /**
         * 粘帖时,Y方向偏移量
         * @type {number}
         */
        this.pasteOffsetY = $consts.pasteOffsetY;

        /**
         * 粘帖时,Z方向偏移量
         * @type {number}
         */
        this.pasteOffsetZ = $consts.pasteOffsetZ;

        /**
         * 当前复制的数据
         * @type {Array}
         * @private
         */
        this._copyAnchor = [];

        this._init();
    }
    Editor.prototype = {

        _init: function () {
            this.setPropertySheetVisible(true);
            this.setAccordionVisible(true);
            this.propertySheetBox.hide();
        },

        /**
         * set accordion visible
         * 设置左侧组件栏是否可见
         * @param v {boolean} true show, false hide
         */
        setAccordionVisible: function (v) {

            if (this._accordionVisible != v) {
                this._accordionVisible = v;
                if (v) {
                    this.accordionPaneBox.show()
                    this.networkBox.css('left', 200)
                } else {
                    this.accordionPaneBox.hide();
                    this.networkBox.css('left', 0);
                }
                this.invalidate();
            }
        },

        invalidate: function () {

        },

        /**
         *  添加键盘的上下左右移动事件
         */
        addKeyMoveListener: function (network2d) {
            var box = network2d.getElementBox();
            network2d.getView().addEventListener('keydown', function (e) {
                var myKey = false;
                var xgap = network2d.getPositionMagneticX(),
                    ygap = network2d.getPositionMagneticY();
                if (e.keyCode == 37) { //Left
                    $utils.moveSelectionElements(box, "left", xgap, ygap);
                    myKey = true;
                }
                if (e.keyCode == 38) { //Top
                    $utils.moveSelectionElements(box, "top", xgap, ygap);
                    myKey = true;
                }
                if (e.keyCode == 39) { //Right
                    $utils.moveSelectionElements(box, "right", xgap, ygap);
                    myKey = true;
                }
                if (e.keyCode == 40) { //Bottom
                    $utils.moveSelectionElements(box, "bottom", xgap, ygap);
                    myKey = true;
                }
                if (myKey) {
                    e.preventDefault();
                    e.stopPropagation();
                }

            });
        },

        /**
         * get accordion visible status
         * 返回左侧组件栏的显示状态, true 显示, false 隐藏
         * @returns {boolean}
         */
        isAccordionVisible: function () {
            return this._accordionVisible;
        },

        /**
         * set accordion visible
         * 设置属性栏是否可见
         * @param v {boolean} true show, false hide
         */
        setPropertySheetVisible: function (v) {

            if (this._propertySheetVisible != v) {
                this._propertySheetVisible = v;
                if (v) {
                    this.propertySheetBox.show()
                } else {
                    this.propertySheetBox.hide();
                }
            }
        },
        resetPropertySheetBoxSize: function (sheet) {
            var self = this;
            clearTimeout(this.resetPropertySheetBoxSizeTimer);
            this.resetPropertySheetBoxSizeTimer = setTimeout(function () {
                var height = sheet.getDataDiv().clientHeight;
                self.propertySheetBox.height(height + 1);
                var w = self.propertySheetBox.width();
                var h = self.propertySheetBox.height();
                sheet.adjustBounds({ x: 0, y: 0, width: w, height: h });
            }, 500)
        },

        /**
         * get accordion visible status
         * 返回属性栏的显示状态, true 显示, false 隐藏
         * @returns {boolean}
         */
        isPropertySheetVisible: function () {
            return this._propertySheetVisible;
        },

        /**
         * editor adjustBounds
         * 调整编辑器大小,相对于parentView来定位
         * eg:
         * adjustBounds({left: '0px',right: '0px',top: '48px',bottom: '35px'}
         * adjustBounds({left: '10px'}
         * @param position {Object}
         */
        adjustBounds: function (position) {

            for (var p in position) {
                this.contentPane.css(p, position[p]);
            }
        },

        /**
         * parent view (DIV) resize event handle
         * 编辑器容器resize事件处理
         * dependent libs/jquery.ba-resize.js
         */
        parentResizeHandle: function () {
            this.ruler && this.ruler.invalidate();
            this.accordionPane && this.accordionPane.refresh();
        },

        /**
         * get editor content bounds
         * 返回编辑器内容所在的区域
         * @returns {{x:number, y:number, width:number, height:number}}
         */
        getBounds: function () {
            if (this.parentNode) {
                var location = this.parentNode.getLocation();
                var size = this.parentNode.getSize();
                return {
                    width: size.width,
                    height: size.height,
                    x: location.x,
                    y: location.y
                }
            } else {
                var bound = this.network2d.getUnionBounds();
                var zoom = this.network2d.getZoom();
                bound.x /= zoom;
                bound.y /= zoom;
                bound.width /= zoom;
                bound.height /= zoom;
                return bound;
            }
        },

        /**
         * input new width and height, get min scale of bounds
         * 输入指定的宽度和高度, 在不拉伸network的情况下,返回最小的比率
         * @param width {number}
         * @param height {number}
         * @returns {number}
         */
        getScaleByRegion: function (width, height) {
            var bounds = this.getBounds();
            var wk = width / bounds.width;
            var hk = height / bounds.height;
            var k = Math.min(wk, hk);
            return k;
        },

        /**
         * get new canvas, a copy of network
         * 返回一个新的canvas
         * args: {{x:number|undefined, y:number|undefined, width:number|undefined,height:number|undefined,scale:number|undefined}}
         * result: {{width: number, height: number, content: Canvas}}
         * @param args {Object}
         * @returns {{width: number, height: number, content: Canvas}}
         */
        toCanvas: function (args) {
            var bounds = this.getBounds();
            var scale = args.scale || 1;
            var x = args.x || bounds.x;
            var y = args.y || bounds.y;
            var width = args.width || bounds.width;
            var height = args.height || bounds.height;
            var content = this.network2d.toCanvasByRegion({
                width: width,
                height: height,
                x: x,
                y: y
            }, scale);
            return {
                width: content._viewRect.width,
                height: content._viewRect.height,
                content: content,
            }
        },

        /**
         * get image content from network
         * 将network截图,返回一个大尺寸的图片, 图片的尺寸是2的幂.
         * @param scale {number} default value is 2
         * @returns {string}
         */
        getImage: function (scale) {
            scale = scale || 2;
            var data = this.toCanvas({ scale: scale });
            var canvas = data.content;
            var width = mono.Utils.nextPowerOfTwo(data.width);
            var height = mono.Utils.nextPowerOfTwo(data.height);
            var c = document.createElement('canvas');
            c.width = width;
            c.height = height;
            var g = c.getContext('2d');
            g.clearRect(0, 0, width, height);
            g.drawImage(canvas, 0, 0, width, height);
            return c.toDataURL();
        },

        /**
         * get icon content from network
         * 将network截图,返回一个icon图片
         * @param width {number} default value is 84
         * @param height {number} default value is 84
         * @returns {string}
         */
        getIcon: function (width, height) {
            width = width || 84;
            height = height || 84;
            var k = this.getScaleByRegion(width, height)
            var bounds = this.getBounds();
            bounds.scale = k;
            var canvas = this.toCanvas(bounds).content;
            var w = canvas.width;
            var h = canvas.height;
            var dx = (width - w) / 2;
            var dy = (height - h) / 2;
            var c = document.createElement('canvas');
            c.width = width;
            c.height = height;
            var g = c.getContext('2d');
            g.clearRect(0, 0, width, height);
            g.drawImage(canvas, dx, dy);
            return c.toDataURL();
        },

        /**
         * set show network grid
         * 设置是否显示网格 true 显示, false 隐藏
         * @param v {boolean} display status
         */
        setShowGrid: function (v) {
            this.network2d.setShowGrid(v);
        },

        /**
         * get network grid display status
         * 取得当前网格显示状态
         * @returns {*}
         */
        isShowGrid: function () {
            return this.network2d.isShowGrid();
        },

        /**
         * Set when double - click network to automatically switch to the grid display status
         * 设置双击network时,是否自动切换网格显示状态
         * @param v
         */
        setAutoShowOrHideGrid: function (v) {

            this.network2d.autoShowOrHide = v
        },

        /**
         * Get when double - click network to automatically switch to the grid display status
         * 取得双击network时,是否自动切换网格显示状态
         * @returns {boolean}
         */
        isAutoShowOrHideGrid: function () {
            return this.network2d.autoShowOrHide;
        },

        /**
         * Get the X coordinates of the smallest unit of adsorption
         * 取得x坐标的吸附最小单位
         * @returns {int}
         */
        getPositionMagneticX: function () {
            return this.network2d.getPositionMagneticX();
        },

        /**
         * Set the X coordinates of the smallest unit of adsorption
         * 设置x坐标的吸附最小单位
         * @param magnetic {int}
         * @returns {int} old value
         */
        setPositionMagneticX: function (magnetic) {
            return this.network2d.setPositionMagneticX(magnetic);
        },

        /**
         * Get the Y coordinates of the smallest unit of adsorption
         * 取得y坐标的吸附最小单位
         * @returns {int}
         */
        getPositionMagneticY: function () {
            return this.network2d.getPositionMagneticY();
        },

        /**
         * Set the Y coordinates of the smallest unit of adsorption
         * 设置y坐标的吸附最小单位
         * @param magnetic {int}
         * @returns {int} old value
         */
        setPositionMagneticY: function (magnetic) {
            return this.network2d.setPositionMagneticY(magnetic);
        },

        /**
         * Whether the adsorption function is enabled
         * 取的是否启用吸附功能
         * @returns {boolean}
         */
        isPositionMagneticEnabled: function () {
            return this.network2d.isPositionMagneticEnabled();
        },

        /**
         *
         * Whether to enable adsorption function
         * 是否启用吸附功能
         * 全局功能
         * 如果禁用,全局禁用
         * 如果启用,判断节点是否单独设置有禁用
         * @param enable {boolean}
         * @returns {boolean} old value
         */
        setPositionMagneticEnabled: function (enable) {
            return this.network2d.setPositionMagneticEnabled(enable);
        },

        /**
         * set network grids
         * @param grids {Object[]}
         * @returns {Object[]} old value
         */
        setGrids: function (grids) {
            var old = this.network2d.setGrids(grids);
            this.network2d.repaint();
            return old;
        },

        /**
         * get network grids
         * @returns {Object[]}
         */
        getGrids: function () {
            return this.network2d.getGrids();
        },

        /**
         * 视图总览
         */
        zoomOverview: function () {
            console.warn('this method[{}] is not supported'.format('zoomOverview'))
        },

        /**
         * 取的编辑器结果
         * @returns {Array}
         */
        getData: function () {
            console.warn('this method[{}] is not supported'.format('getData'))
            return [];
        },

        /**
         * 设置编辑数据
         * @param data {Object[]}
         */
        setData: function (data) {
            console.warn('this method[{}] is not supported'.format('setData'))
        },

        /**
         * 去的选中的数据
         * @returns {Array}
         */
        getSelectedData: function () {
            console.warn('this method[{}] is not supported'.format('getSelectedData'))
            return [];
        },

        /**
         * 追加数据
         * @param data{Object}
         */
        appendData: function (data) {
            console.warn('this method[{}] is not supported'.format('appendData'))
        },

        /**
         * 追加数据
         * @param data{Object}
         */
        removeData: function (data) {
            console.warn('this method[{}] is not supported'.format('appendData'))
        },


        /**
         * 清除编辑器数据
         */
        clear: function () {
            console.warn('this method[{}] is not supported'.format('clear'))
            return []
        },

        /**
         * 复制编辑器数据
         * @returns {Array}
         */
        copySelection: function (filter) {
            //console.warn('this method[{}] is not supported'.format('copySelection'))
            filter = filter || this.copyFilter;
            var selectData = this.getSelectedData();
            this._clearPasteOffset();
            if (filter) {
                selectData = filter(selectData);
            }
            this._copyAnchor = selectData;
            return this._copyAnchor;
        },

        /**
         * 粘帖编辑器数据
         * @param offset  {{x,y,z}} 位置的偏移量
         * @param filter
         * @returns  {Array|null}
         */
        pasteSelection: function (offset, filter) {
            //console.warn('this method[{}] is not supported'.format('pasteSelection'))

            filter = filter || this.pasteFilter;
            var self = this;
            if (!this._copyAnchor || this._copyAnchor.length == 0) {
                return null;
            }
            var sm = this.network2d.getSelectionModel();

            offset = offset || this._getPasteOffset();
            var items = [];
            this._copyAnchor.forEach(function (data) {
                var item = $utils.clone(data);
                item.objectId = doodle.id();
                items.push(item);
                //y不用复制
                if (item.position) {
                    var position = item.position;
                    item.position = [position[0] + offset.x, position[1], position[2] + offset.z];
                }
                if (item.location) {
                    var location = item.location;
                    if (location instanceof Array) {
                        item.location = [position[0] + offset.x, position[1] + offset.z];
                    } else {
                        item.location.x += offset.x;
                        item.location.y += offset.z;
                    }
                }
                if (item.x) {
                    item.x += offset.x;
                }
                if (item.y) {
                    item.y += offset.z;
                }
                if (filter) {
                    item = filter(item);
                }
                if (item) {
                    self.appendData(item);
                }
            })
            setTimeout(function () {
                sm.clearSelection();
                items.forEach(function (item) {
                    var node = self.network2d.getElementBox().getDataById(item.objectId);
                    sm.appendSelection(node);
                })

            }, 100)
        },

        /**
         * 均匀复制,只有选中一个元素时才有效果
         * @param type {string}  hor or ver  hor:水平复制, ver:竖直复制
         * @param count {count} 复制的次数
         * @returns {string} 返回null表示成功,否则返回错误信息
         */
        flowAndCopy: function (type, count, filter) {

            filter = filter || this.flowAndCopyFilter;
            var self = this;
            var data = this.getSelectedData(filter);
            if (data.length != 1) {
                return 'you can use this fun only select one data';
            }
            data = data[0];
            var result = [];
            var node = this.network2d.getElementBox().getDataById(data.objectId);
            if (!node.getSize) {
                return 'this fun used node';
            }
            var size = node.getSize();
            size = size || { width: 60, height: 60 }
            var w = size.width + this.flowOffsetX;
            var h = size.height + this.flowOffsetY;
            var xx = w;
            var yy = h;
            for (var i = 0; i < count; i++) {
                var item = $utils.clone(data);
                item.objectId = doodle.id();
                result.push(item);
                if (item.position) {
                    var position = item.position;
                    if (type == 'hor') {
                        position[0] += xx;
                        xx += w;
                    } else {
                        position[2] += yy;
                        yy += h;
                    }
                }
                if (filter) {
                    item = filter(item);
                }
                if (item) {
                    this.appendData(item);
                }
            }

            setTimeout(function () {
                var sm = self.network2d.getSelectionModel();
                result.forEach(function (item) {
                    var node = self.network2d.getElementBox().getDataById(item.objectId);
                    sm.appendSelection(node);
                })
            }, 100)


        },

        /**
         * 取的粘帖的偏移
         * @returns {{x: (number|*), y: (number|*), z: (number|*)}}
         * @private
         */
        _getPasteOffset: function () {

            this.pasteOffsetX += this.pasteOffsetDx;
            this.pasteOffsetY += this.pasteOffsetDy;
            this.pasteOffsetZ += this.pasteOffsetDz;
            return { x: this.pasteOffsetX, y: this.pasteOffsetY, z: this.pasteOffsetZ }
        },

        /**
         * 清除粘帖的偏移
         * @private
         */
        _clearPasteOffset: function () {
            this.pasteOffsetX = 0;
            this.pasteOffsetY = 0;
            this.pasteOffsetZ = 0;
        },
        findByBID: function (bid) {
            if (!this.bidQuickFinder)
                this.bidQuickFinder = new twaver.QuickFinder(this.network2d.getElementBox(), 'bid', 'client');
            return this.bidQuickFinder.findFirst(bid);
        },

        /**
         * 是否启用回退功能
         * @param enable
         */
        setUndoManagerEnabled: function (enable) {
            this.undoManager = this.undoManager || this.network2d.getElementBox().getUndoManager();
            this.undoManager.setEnabled(enable);
        },
        /**
         * 回退
         */
        undo: function () {
            this.undoManager = this.undoManager || this.network2d.getElementBox().getUndoManager();
            this.undoManager.undo();
        },

        /**
         * 前进
         */
        redo: function () {
            this.undoManager = this.undoManager || this.network2d.getElementBox().getUndoManager();
            this.undoManager.redo();
        },

        /**
         * 开始批处理
         */
        startBatch: function () {
            this.undoManager = this.undoManager || this.network2d.getElementBox().getUndoManager();
            this.undoManager.startBatch();
        },

        /**
         * 结束批处理
         */
        endBatch: function () {
            this.undoManager = this.undoManager || this.network2d.getElementBox().getUndoManager();
            this.undoManager.endBatch();
        },

        /**
         * 暂停Undoredo
         *
         */
        setSuspended: function (suspended) {
            this.undoManager = this.undoManager || this.network2d.getElementBox().getUndoManager();
            this.undoManager.setSuspended(suspended);
        }

    }

    doodle.utils.ext(Editor, Object);

    doodle.Editor = Editor;

























    /**
     *
     * @param elementBox
     * @private
     * @constructor
     */
    nsp.edit.GridNetwork = function (elementBox) {

        var self = this;
        elementBox = elementBox || new twaver.ElementBox();
        nsp.edit.GridNetwork.superClass.constructor.call(this, elementBox);
        this._positionMagneticEnabled = true;
        this._positionMagneticX = 10;
        this._positionMagneticY = 10;
        this.grids = [];
        this._showGrid = true;
        this.autoShowOrHide = true;

        this.grid1 = {
            width: 1000,
            height: 1000,
            visible: true,
            visibleFilter: function (zoom) {
                return zoom > 0.05
            },
            shapeColor: '#FF0000',
            shapeSize: 1,
            shape: 'line' //line point
        }

        this.grid2 = {
            width: 100,
            height: 100,
            skipX: [],
            skipY: [],
            visible: true,
            visibleFilter: function (zoom) {
                return zoom > 0.12
            },
            shapeColor: '#FFAA00',
            shapeSize: 1,
            shape: 'line' //line point
        }
        this.grid3 = {
            width: 50,
            height: 50,
            skipX: [100],
            skipY: [100],
            visible: true,
            visibleFilter: function (zoom) {
                return zoom > 1
            },
            shapeColor: '#FFFFAE',
            shapeSize: 1,
            shape: 'line' //line point
        }

        this.grid4 = {
            width: 10,
            height: 10,
            skipX: [100, 50],
            skipY: [100, 50],
            visible: true,
            visibleFilter: function (zoom) {
                return zoom > 2.0
            },
            shapeColor: '#AAFF00',
            shapeSize: 2.5,
            shape: 'point' //line point
        }

        this.initGridNetwork();
    }

    nsp.edit.GridNetwork.prototype = {

        initGridNetwork: function () {

            var self = this;

            this.setKeyboardRemoveEnabled(false);

            this._box.addDataBoxChangeListener(function (e) {
                //console.log(e);
                var kind = e.kind;
                var node = e.data;
                if (kind == 'add') {
                    self.nodePositionMagneticInit(node);
                }
            }, this);
            this.addInteractionListener(function (e) {
                //console.log(e);
                if (e.kind == 'liveMoveStart') { //开始移动

                    var nodes = self._box.getSelectionModel().getSelection();
                    self.beginMove(nodes);

                } else if (e.kind == 'liveMoveEnd') { //结束已动工

                    var nodes = self._box.getSelectionModel().getSelection();
                    self.endMove(nodes);
                } else if (e.kind == 'doubleClickBackground' && self.autoShowOrHide) {
                    self.setShowGrid(!self.isShowGrid());
                }
            }, this);

            this.addPropertyChangeListener(function (e) {
                if (e.property == "zoom") {
                    this.invalidateGrids(this.grids);
                }
            }, this);

            this.grids.push(this.grid1);
            this.grids.push(this.grid2);
            this.grids.push(this.grid3);
            this.grids.push(this.grid4);
            this.invalidateGrids(this.grids);

        },

        beginMove: function (nodes) {
            var self = this;
            if (nodes && nodes.size() > 0) {
                nodes.forEach(function (node) {
                    if (!(node instanceof twaver.Node)) {
                        return;
                    }
                    node.childNodeLiveMove = true;
                    node.childNodeLastPoint = node.getLocation();
                    node.childNodeLastPointOffset = { x: 0, y: 0 };
                })
            }
        },

        endMove: function (nodes) {
            var self = this;
            if (nodes && nodes.size() > 0) {
                nodes.forEach(function (node) {
                    delete node.childNodeLiveMove;
                    delete node.childNodeLastPoint;
                    delete node.childNodeLastPointOffset;
                })
            }
        },

        setGrids: function (grids) {
            this.grids = grids;
            this.invalidateGrids(this.grids);
        },
        getGrids: function () {
            return this.grids;
        },

        resizeCanvas: function (e) {
            this.repaint();
        },

        repaint: function () {
            this.invalidateElementUIs();
        },

        setShowGrid: function (showGrid) {
            this._showGrid = showGrid;
            this.repaint();
        },
        isShowGrid: function () {
            return this._showGrid;
        },

        setAutoShowOrHideGrid: function (autoShowOrHide) {
            this.autoShowOrHide = autoShowOrHide;
        },

        isAutoShowOrHideGrid: function () {
            return this.autoShowOrHide;
        },

        setCursorPosition: function (e) {
            this.cursorPosition = e;
            this.repaint();
        },
        getCursorPosition: function () {
            return this.cursorPosition;
        },

        /**
         * 校验所有的grid
         * 1 根据zoom判断是否显示grid
         * 2 后面的grid显示要跳过已经绘制的轨迹
         * @param grids
         */
        invalidateGrids: function (grids) {

            var zoom = this.getZoom();
            var length = grids.length;
            for (var i = 0; i < length; i++) {
                var grid = grids[i];
                grid.skipX = [];
                grid.skipY = [];
                for (var j = 0; j < i; j++) {
                    grid.skipX.push(grids[j].width)
                    grid.skipY.push(grids[j].height)
                }
                if (grid.visibleFilter) {
                    grid.visible = grid.visibleFilter(zoom);
                }
            }
        },

        /**
         * 判断当前坐标x是否需要跳过
         * @param grid
         * @param x
         * @returns {boolean}
         */
        isSkipX: function (grid, x) {

            for (var i = 0; i < grid.skipX.length; i++) {
                if (x % grid.skipX[i] == 0)
                    return true
            }
            return false;
        },

        /**
         * 绘制表格
         * 根据表格的width和height格式化grid.bound
         * 准备画布
         * x轴方向循环
         * y轴方向循环
         * @param ctx
         * @param grid
         * @param paintActionX x轴方向绘制
         * @param paintActionY y轴方向绘制
         */
        paintGridAction: function (ctx, grid, paintActionX, paintActionY) {

            var width = grid.width,
                height = grid.height,
                x = grid.bound.x,
                y = grid.bound.y,
                w = grid.bound.w,
                h = grid.bound.h,
                g = ctx,
                zoom = this.getZoom();
            var xOffset = x % (width),
                yOffset = y % (height),
                x = x - xOffset - width,
                y = y - yOffset - height,
                w = w + width * 2,
                h = h + height * 2,

                xFrom = x,
                xEnd = x + w,
                yFrom = y,
                yEnd = y + h;

            var rect = {
                xFrom: xFrom,
                xEnd: xEnd,
                yFrom: yFrom,
                yEnd: yEnd,
                width: w,
                height: h
            }
            var lineWidth = grid.shapeSize / zoom;

            g.lineWidth = lineWidth;
            g.strokeStyle = grid.shapeColor;
            //draw even lines
            var offset = lineWidth / 2;
            grid.offset = offset;
            for (var i = xFrom; i < xEnd; i += width) {

                if (!this.isSkipX(grid, i)) {
                    paintActionX.call(this, grid, g, rect, i)
                }
            }

            for (var j = yFrom; j < yEnd; j += height) {
                if (!this.isSkipY(grid, j)) {
                    paintActionY.call(this, grid, g, rect, j)
                }
            }

        },

        /**
         * 判断当前坐标y是否需要跳过
         * @param grid
         * @param y
         * @returns {boolean}
         */
        isSkipY: function (grid, y) {
            for (var i = 0; i < grid.skipY.length; i++) {
                if (y % grid.skipY[i] == 0)
                    return true
            }
            return false;
        },

        /**
         * 绘制point类型表格
         * @param ctx
         * @param grid
         */
        paintPointGrid: function (ctx, grid) {
            this.paintGridAction(ctx, grid, this.paintPointGridX, this.paintPointGridY)
        },

        /**
         * 绘制point类型表格,x方向, i为当前x轴坐标
         * @param grid
         * @param g
         * @param rect 为grid.bound 按照grid的width和height格式化后的值
         * @param i
         */
        paintPointGridX: function (grid, g, rect, i) {

            for (var j = rect.yFrom; j < rect.yEnd; j += grid.height) {
                if (!this.isSkipY(grid, j)) {
                    g.moveTo(i - grid.offset, j);
                    g.lineTo(i + grid.offset, j);
                    g.moveTo(i, j - grid.offset);
                    g.lineTo(i, j + grid.offset);
                }
            }
        },

        /**
         * 绘制point类型表格,y方向, j为当前y轴坐标, point时,不需要绘制
         * @param grid
         * @param g
         * @param rect 为grid.bound 按照grid的width和height格式化后的值
         * @param i
         */
        paintPointGridY: function (grid, g, rect, j) {

            //for (var i = rect.xFrom; i < rect.xEnd; i += grid.width) {
            //    if (!this.isSkipX(grid, i)) {
            //        g.moveTo(i-grid.offst, j - grid.offset);
            //        //TODO draw ball
            //    }
            //}
        },

        /**
         * 绘制line类型表格
         * @param ctx
         * @param grid
         */
        paintLineGrid: function (ctx, grid) {

            this.paintGridAction(ctx, grid, this.paintLineGridX, this.paintLineGridY)
        },

        /**
         * 绘制point类型表格,x方向, i为当前x轴坐标
         * @param grid
         * @param g
         * @param rect 为grid.bound 按照grid的width和height格式化后的值
         * @param i
         */
        paintLineGridX: function (grid, g, rect, i) {
            g.moveTo(i - grid.offset, rect.yFrom);
            g.lineTo(i - grid.offset, rect.yEnd);
        },

        /**
         * 绘制point类型表格,y方向, j为当前y轴坐标,
         * @param grid
         * @param g
         * @param rect 为grid.bound 按照grid的width和height格式化后的值
         * @param i
         */
        paintLineGridY: function (grid, g, rect, j) {
            g.moveTo(rect.xFrom, j - grid.offset);
            g.lineTo(rect.xEnd, j - grid.offset);
        },

        /**
         * 绘制表格
         * 判断是point类型还是line类型
         * @param ctx
         * @param grid
         */
        paintGrid: function (ctx, grid) {

            if (!this._showGrid || !grid.visible) {
                return;
            }
            ctx.beginPath();
            if (grid.shape == 'point') {
                this.paintPointGrid(ctx, grid);
            } else {
                this.paintLineGrid(ctx, grid);
            }
            ctx.stroke();
        },

        /**
         *
         * 绘制所有的表格
         * @param ctx
         * @param dirtyRect
         */
        paintGrids: function (ctx, dirtyRect) {

            var length = this.grids.length;
            if (length > 0) {
                var bound = this.getViewRect();
                var zoom = this.getZoom();

                var x = bound.x / zoom,
                    y = bound.y / zoom,
                    w = bound.width / zoom,
                    h = bound.height / zoom,
                    g = ctx;

                g.save();
                //g.clearRect(x, y, w, h);

                var bound = {
                    x: x,
                    y: y,
                    w: w,
                    h: h
                }

                for (var i = 0; i < length; i++) {
                    var grid = this.grids[i];
                    grid.bound = bound;
                    this.paintGrid(ctx, grid)
                }

                g.restore();
            }

        },
        paintBottom: function (ctx, dirtyRect) {
            this.paintGrids(ctx, dirtyRect);
        },

        /**
         * 取得x坐标的吸附最小单位
         * @returns {number|*}
         */
        getPositionMagneticX: function () {
            return this._positionMagneticX;
        },

        /**
         * 设置x坐标的吸附最小单位
         * @param magnetic
         */
        setPositionMagneticX: function (magnetic) {
            this._positionMagneticX = magnetic;
        },

        /**
         * 取得y坐标的吸附最小单位
         * @returns {number|*}
         */
        getPositionMagneticY: function () {
            return this._positionMagneticY;
        },

        /**
         * 设置x坐标的吸附最小单位
         * @param magnetic
         */
        setPositionMagneticY: function (magnetic) {
            this._positionMagneticY = magnetic;
        },

        /**
         * 是否启用吸附功能
         * 全局功能
         * 如果禁用,全局禁用
         * 如果启用,判断节点是否单独设置有禁用
         * @returns {boolean}
         */
        isPositionMagneticEnabled: function () {
            return !!this._positionMagneticEnabled;
        },

        setPositionMagneticEnabled: function (enable) {
            return this._positionMagneticEnabled = enable;
        },

        /**
         * 取得节点单独设置的x坐标吸附最小单位
         * 如果没有设定,默认取值network上的值
         * @param node
         * @returns {*}
         */
        getNodePositionMagneticX: function (node) {
            if (node) {
                var magnetic = node.getClient('magnetic.x');
                if (magnetic != undefined && magnetic != null) {
                    return magnetic;
                }
            }
            return this.getPositionMagneticX();
        },

        /**
         * 取得节点单独设置的y坐标吸附最小单位
         * 如果没有设定,默认取值network上的值
         * @param node
         * @returns {*}
         */
        getNodePositionMagneticY: function (node) {
            if (node) {
                var magnetic = node.getClient('magnetic.y');
                if (magnetic != undefined && magnetic != null) {
                    return magnetic;
                }
            }
            return this.getPositionMagneticY();
        },

        /**
         * 是否启用吸附功能
         * 如果节点禁用吸附, 禁止吸附
         * 如果节点启用,判断network是否启用
         * @param node
         * @returns {boolean}
         */
        isNodePositionMagneticDisabled: function (node) {
            if (node) {
                var magnetic = node.getClient('magnetic.disabled');
                if (!!magnetic) {
                    return true;
                }
            }
            return !this.isPositionMagneticEnabled();
        },

        /**
         * 设置节点坐标, 会根据吸附参数格式化坐标
         * @param node
         * @param tx
         * @param ty
         */
        setNodePositionMagnetic: function (node, tx, ty) {

            if (!this.isNodePositionMagneticDisabled(node) && !this.isEditingElement(node)) {
                var mx = this.getNodePositionMagneticX(node);
                var my = this.getNodePositionMagneticY(node);
                var tx = Math.round(tx / mx) * mx;
                var ty = Math.round(ty / my) * my;
            }
            node.originalSetLocation(tx, ty);
        },

        /**
         * 初始化节点吸附功能
         * @param node
         */
        nodePositionMagneticInit: function (node) {

            if (!(node instanceof twaver.Node)) {
                //logger.warn('');
                return;
            }
            if (node.originalSetLocation) {
                return;
            }
            var self = this;

            var oldSetLocationFun = node.setLocation;
            node.originalSetLocation = oldSetLocationFun;
            node.setLocation = function (tx, ty) {
                if (arguments.length == 1) {
                    var arg0 = tx;
                    tx = arg0.x;
                    ty = arg0.y;
                }
                self.setNodePositionMagnetic(node, tx, ty);
            }

            var oldTranslate = node.translate;
            node.translate = function (ox, oy) {
                if (node.childNodeLiveMove) {
                    node.childNodeLastPointOffset.x += ox;
                    node.childNodeLastPointOffset.y += oy;
                    var tx = node.childNodeLastPoint.x + node.childNodeLastPointOffset.x;
                    var ty = node.childNodeLastPoint.y + node.childNodeLastPointOffset.y;
                    self.setNodePositionMagnetic(node, tx, ty);
                } else {
                    oldTranslate.call(node, ox, oy);
                }
            }

            var x = node.getX();
            var y = node.getY();
            node.setLocation(x, y);
        }
    }

    doodle.utils.ext(nsp.edit.GridNetwork, twaver.vector.Network)

    nsp.edit.PropertySheetPane = function (box) {
        this.rightContent = $('<div class = "right-content"></div>');
        this.box = box || new twaver.DataBox();
        this.initPropertySheet();
    }

    twaver.Util.ext(nsp.edit.PropertySheetPane, Object, {
        element: null,
        jsonObj: null,
        initPropertySheet: function () {
            this.sheet = new CPropertySheet(this.box);
            this.sheet.setEditable(true);
            this.sheet.setSelectColor('#dadada');
            var sheetView = this.sheet.getView();
            sheetView.style.background = 'white';
            sheetView.style.position = 'absolute';
            sheetView.style.right = 0;
            sheetView.style.top = 0;
            sheetView.style.left = 0;
            sheetView.style.bottom = 0;
            this.rightContent.append($(sheetView));
            var self = this;
            this.params = null;
            var importDialog = new nsp.edit.Dialog("选择图片资源", {
                OK: function (e) {
                    if (self.params) {
                        var view = self.params.view;
                        if (view._isCommitting) {
                            return;
                        }
                        view._isCommitting = true;
                        view.commitEditValue(self.params, $('#image-url')[0]);
                    }
                    importDialog.hide();
                },
                Cancel: function (e) {
                    var view = self.params.view;
                    view._isCanceling = true;
                    view.cancelEditing();
                    importDialog.hide();
                }
            }, {
                    close: function () {
                        var view = self.params.view;
                        view._isCanceling = true;
                        view.cancelEditing();
                        importDialog.hide();
                    }
                });

            $('body').append(importDialog.getView());

            importDialog.init();
            importDialog.getView().dialog("option", "width", 500);
            importDialog.getView().dialog("option", "height", 400);

            var getImagePath = function (image) {
                if (image.indexOf('/') > 0) {
                    return image;
                }
                return make.Default.path + 'model/idc/images/' + image;
            }

            this.sheet.renderEditor = function (params) {
                self.params = params;
                if (params.view._currentEditor) {
                    return params.view._currentEditor;
                }
                if (params.property.getClient('dataType') == 'image') {
                    var dataCategory = params.property.getClient('dataCategory');
                    var dataId = params.property.getClient('dataId');
                    var tempId = new Date().getTime();
                    var innerHTML = "<label>选择图片资源</label><select id='image-url'>";

                    var images = self.getImageResourcesForEdit(dataCategory, dataId, params.property.getPropertyName());
                    if (images && images.length) {

                        images.forEach(function (image) {
                            if (image === params.value) {
                                innerHTML += "<option value=" + image + " selected='selected'> " + image + "</option>"
                            } else {
                                innerHTML += "<option value=" + image + "> " + image + "</option>"
                            }
                        });

                        innerHTML += "</select><br><br><br><image id = 'dialogImage'></image>";
                    } else {
                        return params.view._currentEditor;
                    }

                    importDialog.setData(innerHTML);
                    importDialog.show();
                    $('#dialogImage').attr('src', getImagePath(params.value));
                    $("#image-url").change(function (e) {
                        var src = $("#image-url").val();
                        src = getImagePath(src);
                        $('#dialogImage').attr('src', src);
                    });
                    var editor = {
                        view: $('#image-url')[0],
                        onKeyDown: [{
                            keyCode: 13,
                            handlerEvent: function (e) {
                                var view = params.view;
                                if (view._isCommitting) {
                                    return;
                                }
                                view._isCommitting = true;
                                view.commitEditValue(params, e.target);
                                importDialog.hide();
                            }
                        }, {
                            keyCode: 27,
                            handlerEvent: function (e) {
                                var view = params.view;
                                view._isCanceling = true;
                                view.cancelEditing();
                                importDialog.hide();
                            }
                        }]
                    };
                    return editor;
                }
                return null;
            }
        },

        getImageResourcesForEdit: function (category, id, propertyName) {

            var categoryImages = {
                "设备": ['equipment_front-2U.png', 'server.png', './idc_images/server001.jpg', './idc_images/server002.jpg', './idc_images/server003.jpg', './idc_images/server004.jpg', './idc_images/server005.jpg'],
                "板卡": ['./idc_images/card1.png', 'card2.png', './idc_images/card3.png', './idc_images/card4.png', './idc_images/card5.png'],
                "机柜模型": ['alternator-top.jpg', 'air-condition-side.jpg', 'battery-top.jpg']
            };
            //var className = 'ImageResourcesForEdit';
            //for (var p in categoryImages) {
            //    var where = {category: p};
            //    var result = proxy.queryFirst(where, className);
            //    var update = {images: {}};
            //    for (var i in categoryImages[p]) {
            //        update.images[categoryImages[p][i]] = categoryImages[p][i];
            //    }
            //    proxy.updateOrInsert(where, update, className)
            //}
            //var where = {category: category}
            //var info = proxy.queryFirst(where, className);
            //var result = [];
            //for (var p in info.images) {
            //    result.push(p);
            //}
            return categoryImages[category];
        },

        setElement: function (json) {
            var self = this;
            if (json) {
                this._setValued = false;

                var type = json.id;
                var items = make.Default.getModelDefaultParameterProperties(type);

                var sheetBox = this.sheet.getPropertyBox();
                sheetBox.clear();
                $utils.addProperties(sheetBox, items);

                this.jsonObj = make.Default.getModelDefaultParametersValues(type);
                this._generateNode(json, this.jsonObj);
                this._setValued = true;
            }

            setTimeout(function () {
                var height = self.sheet.getDataDiv().clientHeight;
                self.rightContent.height(height + 1);
                var w = self.rightContent.width();
                var h = self.rightContent.height();
                self.sheet.adjustBounds({ x: 0, y: 0, width: w, height: h });
            }, 500)
        },

        _generateNode: function (json, items) {

            this.box.clear();
            var node = this.node = new twaver.Node({ id: json.objectId });
            node.setClient('id', json.id)
            this.box.add(node);
            make.Default.objectWrapper(node, 'id', function () {
                return this.getClient('id');
            })
            make.Default.objectWrapper(node, 'objectId', function () {
                return this.getId();
            })
            delete items['id'];
            delete items['objectId'];
            for (var p in items) {
                make.Default.objectWrapper(node, p)
                node[p] = json[p] || items[p];
            }
            this.box.getSelectionModel().setSelection(node);
        },

        getData: function () {
            return make.Default.toJson(this.node);
        },

        show: function (id, callback) {
            // if(!this.bindedData){
            //  this.bindData();
            //  this.bindedData = true;
            // }
            var self = this;
            this.rightContent.css({
                'marginRight': 10,
                'width': 220
            });
            self.sheet.invalidate();
            setTimeout(function () {
                var height = self.sheet.getDataDiv().clientHeight;
                self.rightContent.height(height + 1);
                var w = self.rightContent.width();
                var h = self.rightContent.height();
                self.sheet.adjustBounds({ x: 0, y: 0, width: w, height: h });
            }, 500)
            if (callback) callback();

            /*this.rightContent.animate({
             'marginRight': 0,
             'width': 220
             }, 400, function(){
             self.sheet.invalidate();
             if(callback) callback();
             });*/
        },
        hide: function () {
            this.rightContent.css({
                'marginRight': -220,
                'width': 0
            })
            /*this.rightContent.animate({
             'marginRight': -220,
             'width': 0
             });*/
        },
        getView: function () {
            return this.sheet.getView();
        },
    });


    CPropertySheet = function (dataBox) {
        CPropertySheet.superClass.constructor.call(this, dataBox);
    }

    twaver.Util.ext(CPropertySheet, twaver.controls.PropertySheet, {
        updateCurrentRowIndex: function (newIndex) {
            var count = this._rowList.size();
            if (newIndex < 0 || newIndex >= count) {
                newIndex = -1;
            }
            var oldIndex = this._currentRowIndex,
                rowInfo;
            if (newIndex !== oldIndex) {
                // clear select background color
                if (oldIndex >= 0 && oldIndex < count) {
                    rowInfo = this._rowList.get(oldIndex);
                    if (rowInfo.nameRender) {
                        rowInfo.nameRender.style.backgroundColor = '';
                    }
                }
                this._currentRowIndex = newIndex;
            }
            if (newIndex >= 0) {
                rowInfo = this._rowList.get(newIndex);
                if (rowInfo.nameRender) {
                    // update select background color
                    rowInfo.nameRender.style.backgroundColor = this.getSelectColor();
                    // update current editor
                    if (!this._currentEditor) {
                        if (rowInfo.valueRender && rowInfo.valueRender._editInfo) {
                            var editInfo = rowInfo.valueRender._editInfo;
                            var editor = this.renderEditor && this.renderEditor(rowInfo);
                            if (editor) {
                                this._currentEditor = editor.view;
                                if (editInfo.value != null) {
                                    this._currentEditor.value = editInfo.value;
                                }
                            } else if (editInfo.enumInfo) {
                                this._currentEditor = $html.createSelect(editInfo.enumInfo, editInfo.value);
                            } else {
                                this._currentEditor = document.createElement('input');
                                if (editInfo.value != null) {
                                    this._currentEditor.value = editInfo.value;
                                }
                            }
                            var self = this;
                            if (this._currentEditor) {
                                if (editor && editor.onKeyDown) {
                                    var keydownEvents = editor.onKeyDown;
                                    if (keydownEvents && Array.isArray(keydownEvents)) {
                                        self._currentEditor.addEventListener('keydown', function (e) {
                                            for (var k = 0; k < keydownEvents.length; k++) {
                                                if (keydownEvents[k].combKey) {
                                                    var evt = null;
                                                    switch (keydownEvents[k].combKey) {
                                                        case 'ctrlKey':
                                                            evt = e.ctrlKey;
                                                            break;
                                                        case 'shiftKey':
                                                            evt = e.shiftKey;
                                                            break;
                                                        case 'altKey':
                                                            evt = e.altKey;
                                                            break;
                                                    }
                                                    if (e.keyCode === keydownEvents[k].keyCode && evt) {
                                                        keydownEvents[k].handlerEvent && keydownEvents[k].handlerEvent(e);
                                                    }
                                                } else {
                                                    if (e.keyCode === keydownEvents[k].keyCode) {
                                                        keydownEvents[k].handlerEvent && keydownEvents[k].handlerEvent(e);
                                                    }
                                                }
                                            }
                                        });
                                    }
                                } else {
                                    this._currentEditor.addEventListener('keydown', function (e) {
                                        var view = e.target._editInfo.view;
                                        if (e.keyCode === 13 && e.shiftKey) {
                                            return;
                                        } else if (e.keyCode === 13) {
                                            if (view._isCommitting) {
                                                return;
                                            }
                                            view._isCommitting = true;
                                            view.commitEditValue(e.target._editInfo, e.target);
                                        } else if (e.keyCode === 27) {
                                            view._isCanceling = true;
                                            view.cancelEditing();
                                        }
                                    }, false);
                                }
                                this._currentEditor.keepDefault = true;
                                this._currentEditor._rowInfo = rowInfo;
                                this._currentEditor._editInfo = editInfo;
                                if (!this._currentEditor.parentNode) {
                                    var style = this._currentEditor.style;
                                    style.position = 'absolute';
                                    style.margin = '0px';
                                    style.border = '0px';
                                    style.padding = '0px';
                                    style.left = this._indent + this._propertyNameWidth + 'px';
                                    style.top = rowInfo.rowDiv.style.top;
                                    style.width = rowInfo.valueRender.style.width;
                                    style.height = rowInfo.valueRender.style.height;
                                    this._rootDiv.appendChild(this._currentEditor);
                                }
                                twaver.Util.setFocus(this._currentEditor);
                            }
                        }
                    }
                }
            }
        }
    });

    nsp.edit.Ruler = function (component) {
        nsp.edit.Ruler.superClass.constructor.apply(this, arguments);
        this._view = this.createElement('div');
        this._view.style.position = 'absolute';
        this._view.style.left = '0px';
        this._view.style.right = '0px';
        this._view.style.top = '0px';
        this._view.style.bottom = '0px';
        this._topRuler = this.createElement('canvas');
        this._leftRuler = this.createElement('canvas');
        this._initRuler();
        this.setComponent(component);
        this.init();
        this.invalidate();
    }
    twaver.Util.ext(nsp.edit.Ruler, twaver.controls.ViewBase, {
        _defaultGap: 10,
        _rulerWidth: 20,
        _lineColor: '#888',
        _lineIntervalLineColor: '#ccc',
        _mousePoint: null,
        _showGuides: true,
        onPropertyChanged: function (e) {
            this.invalidate();
        },
        init: function () {
            if (this._topRuler.visible) this._view.appendChild(this._topRuler);
            if (this._leftRuler.visible) this._view.appendChild(this._leftRuler);
            if (this.component.getView) {
                this._view.appendChild(this.component.getView());
            } else {
                this._view.appendChild(this.component);
            }
        },
        setComponent: function (component) {
            var oldValue = this.component;
            var self = this;
            this.component = component;
            this.firePropertyChange('component', oldValue, component);

            this.addViewPropertyChangeListener(component, this._handleViewPropertyChange);
            this.component.getView().addEventListener('mousemove', function (e) {
                if (self._showGuides) {
                    var position = self.getAbsPostion(self.component._rootCanvas);
                    self._mousePoint = { x: e.clientX - position.left, y: e.clientY - position.top };
                    self.invalidate();
                }
            });
            $(this._view).resize(function () {
                var w = $(this._view).width();
                var h = $(this._view).height();
                self.component.adjustBounds({ x: 0, y: 0, width: w, height: h });
                self.invalidate();
            });
        },
        getAbsPostion: function (div) {
            var t = 0,
                l = 0;
            while (div = div.offsetParent) {
                t += div.offsetTop;
                l += div.offsetLeft;
            }
            return { left: l, top: t }
        },
        _initRuler: function () {
            this._topRuler.visible = true;
            this._leftRuler.visible = true;
            this._topRuler.style.borderBottom = "1px solid " + this._lineColor;
            this._topRuler.style.borderLeft = "1px solid " + this._lineColor;
            this._leftRuler.style.borderRight = "1px solid " + this._lineColor;
            this._leftRuler.style.borderTop = "1px solid " + this._lineColor;
        },
        _drawRuler: function () {
            var viewRect = this.getComponentViewRect();
            var zoom = this.getComponentZoom();
            this.calculateGap(zoom);
            var gap = this.getGap();
            var x = viewRect.x;
            var y = viewRect.y;
            var w = viewRect.width;
            var h = viewRect.height;

            var xOffset = x % (gap * 5);
            var x = x - xOffset - gap * 5 - 1;
            var offsetX = Math.round((viewRect.x - xOffset - gap * 5) / zoom);
            var startX = x - viewRect.x;
            if (Math.abs(Math.round(x / (gap * 5)) % 2) === 1) {
                startX = startX - gap * 5;
                offsetX = offsetX - this._defaultGap * 5;
            }
            var endX = w + (gap * 10);

            if (viewRect && this._topRuler.visible) {
                var g = $utils.transformAndScaleCanvasContext(this._topRuler);
                this._drawHRuler(g, startX, offsetX, gap, endX, this._rulerWidth);
            }

            //draw vertical ruler
            var yOffset = y % (gap * 5);
            var y = y - yOffset - gap * 5 - 1;
            var offsetY = Math.round((viewRect.y - yOffset - gap * 5) / zoom);
            var startY = y - viewRect.y;
            if (Math.abs(Math.round(y / (gap * 5)) % 2) === 1) {
                startY = startY - gap * 5;
                offsetY = offsetY - this._defaultGap * 5;
            }
            var endY = h + (gap * 10);

            if (viewRect && this._leftRuler.visible) {
                var g = $utils.transformAndScaleCanvasContext(this._leftRuler);
                this._drawVRuler(g, startY, offsetY, gap, endY, this._rulerWidth);
            }
        },
        _drawHRuler: function (g, startX, offsetX, gap, w, h) {

            //draw h ruler border
            g.clearRect(startX, 0, w, h);

            //draw h ruler scale
            g.save();
            g.strokeStyle = this._lineIntervalLineColor;
            g.beginPath();
            g.lineWidth = 1;
            var count = 1;
            var startY = h;
            var endY = h - 6;
            var zoom = this.getComponentZoom();

            for (var i = startX + gap; i < startX + w; i += gap) {
                endY = h - 6;
                if (count % 5 == 0) {
                    endY = h - 10;
                }
                if (count % 10 !== 0) {
                    g.moveTo(i, startY);
                    g.lineTo(i, endY);
                }
                count++;
            }
            g.closePath();
            g.stroke();

            count = 1;
            g.beginPath();
            g.strokeStyle = this._lineColor;
            for (var i = startX + gap; i < startX + w; i += gap) {
                if (count % 10 === 0) {
                    endY = 1;
                    g.moveTo(i, startY);
                    g.lineTo(i, endY);
                }
                count++;
            }
            g.stroke();
            g.restore();

            //draw scale text
            g.save();
            g.textBaseline = "middle",
                g.font = "11px Arial";
            g.fillStyle = this._lineColor;
            for (var k = offsetX, j = startX; j < startX + w; j += gap * 10, k += this._defaultGap * 10) {
                g.fillText(k, j + 5, 8);
            }
            g.restore();

            //draw guides
            if (this._showGuides && this._mousePoint) {
                g.save();
                g.strokeStyle = '#f07819';
                g.lineWidth = 3;
                g.beginPath();
                g.moveTo(this._mousePoint.x, 0);
                g.lineTo(this._mousePoint.x, 20);
                g.stroke();
                g.restore();
            }
        },
        _drawVRuler: function (g, startY, offsetY, gap, h, w) {
            g.clearRect(0, startY, w, h);

            //draw hruler scale
            g.save();
            g.strokeStyle = this._lineIntervalLineColor;
            g.beginPath();
            g.lineWidth = 1;

            var count = 1;
            var startX = w;
            var endX = w - 6;
            var zoom = this.getComponentZoom();
            for (var i = startY + gap; i < startY + h; i += gap) {
                endX = w - 6;
                if (count % 5 == 0) {
                    endX = w - 10;
                }
                if (count % 10 !== 0) {
                    g.moveTo(startX, i);
                    g.lineTo(endX, i);
                }
                count++;
            }
            g.closePath();
            g.stroke();
            g.restore();

            count = 1;
            g.beginPath();
            g.strokeStyle = this._lineColor;
            for (var i = startY + gap; i < startY + h; i += gap) {
                if (count % 10 === 0) {
                    endX = 1;
                    g.moveTo(startX, i);
                    g.lineTo(endX, i);
                }
                count++;
            }
            g.stroke();
            g.restore();

            //draw scale text
            g.save();
            g.textBaseline = "middle",
                g.textAlign = "left";
            g.font = "11px Arial";
            g.fillStyle = this._lineColor;
            for (var k = offsetY, j = startY; j < startY + h; j += gap * 10, k += this._defaultGap * 10) {
                g.save();
                var size = _twaver.g.getTextSize(g.font, k);
                var rect = { x: 2, y: j - 8, width: size.width, height: size.height };
                g.translate(rect.x, rect.y);
                g.rotate(3 * Math.PI / 2);
                g.translate(-(rect.x), -(rect.y));
                g.fillText(k, 0, j - 2);
                g.restore();
            }
            g.restore();

            //draw guides
            if (this._showGuides && this._mousePoint) {
                g.save();
                g.strokeStyle = '#f07819';
                g.lineWidth = 3;
                g.beginPath();
                g.moveTo(0, this._mousePoint.y);
                g.lineTo(20, this._mousePoint.y);
                g.stroke();
                g.restore();
            }
        },
        getComponentZoom: function () {
            return this.component.getZoom() || 1;
        },
        getGap: function () {
            var zoom = this.getComponentZoom();
            return this._defaultGap * zoom;
        },
        calculateGap: function (zoom) {
            if (zoom < 0.17) {
                this._defaultGap = 50;
            } else if (zoom < 0.5) {
                this._defaultGap = 20;
            } else if (zoom < 0.9) {
                this._defaultGap = 10;
            } else if (zoom < 3.2) {
                this._defaultGap = 5;
            } else {

                this._defaultGap = 1;
            }
        },
        setShowGuides: function (showGuides) {
            var oldValue = this._showGuides;
            this._showGuides = showGuides;
            this._drawRuler();
        },
        isShowGuides: function () {
            return this._showGuides;
        },
        setShowRuler: function (showRuler) {
            var oldValue = this._topRuler.visible;
            this._topRuler.visible = showRuler;
            this._leftRuler.visible = showRuler;
            if (showRuler) {
                if (!this.hasChildNode(this._view, this._topRuler)) {
                    this._view.appendChild(this._topRuler);
                }
                if (!this.hasChildNode(this._view, this._leftRuler)) {
                    this._view.appendChild(this._leftRuler);
                }
            } else {
                if (this.hasChildNode(this._view, this._topRuler)) {
                    this._view.removeChild(this._topRuler);
                }
                if (this.hasChildNode(this._view, this._leftRuler)) {
                    this._view.removeChild(this._leftRuler);
                }
            }
            this.firePropertyChange("showRuler", oldValue, showRuler);
        },
        hasChildNode: function (parent, child) {
            var children = parent.childNodes;
            for (var i in children) {
                if (children[i] == child) {
                    return true;
                }
            }
            return false;
        },
        getComponentViewRect: function () {
            return this.component.getViewRect ? this.component.getViewRect() : null;
        },
        addViewPropertyChangeListener: function (view, handler) {
            if (view && view.addPropertyChangeListener) {
                view.addPropertyChangeListener(handler, this);
            }
        },
        _handleViewPropertyChange: function (e) {
            var self = this;
            if (e.property == 'viewRect') {
                this._drawRuler();
            }
        },
        createElement: function (type) {
            return document.createElement(type);
        },
        validateImpl: function () {
            var w = this._view.offsetWidth,
                h = this._view.offsetHeight;
            // console.log(this._view.offsetWidth, this._view.offsetHeight);
            var th = 0,
                lw = 0,
                tx = 0,
                ly = 0,
                cx = 0,
                cy = 0,
                cw = w,
                ch = h;
            if (this._topRuler.visible) {
                th = this._rulerWidth;
                ly = this._rulerWidth;
                cy = this._rulerWidth;
            }
            if (this._leftRuler.visible) {
                lw = this._rulerWidth;
                tx = this._rulerWidth;
                cx = this._rulerWidth;
            }
            cw = w - lw, ch = h - th;

            if (this._topRuler.visible) {
                this._topRuler.width = cw;
                this._topRuler.height = th;
                // console.log(tx, 0, cw, th);
                _twaver.setViewBounds(this._topRuler, { x: tx, y: 0, width: cw, height: th });
                $utils.transformAndScaleCanvasContext(this._topRuler, true);
            }
            if (this._leftRuler.visible) {
                this._leftRuler.width = lw;
                this._leftRuler.height = ch;
                _twaver.setViewBounds(this._leftRuler, { x: 0, y: ly, width: lw, height: ch });
                $utils.transformAndScaleCanvasContext(this._leftRuler, true);
            }
            if (this.component) {
                _twaver.setViewBounds(this.component, { x: cx, y: cy, width: cw, height: ch });
                $utils.transformAndScaleCanvasContext(this.component._rootCanvas, true);
            }
            this._drawRuler();
        },
        getView: function () {
            return this._view;
        },
        left: function (left) {
            this._view.style.left = left + 'px';
            this.invalidate();
        }
    });
    /**
     * 设备面板编辑器
     * @param parentView {HTMLDIVElement} 父容器
     * @constructor
     */
    var ChassisEditor = function (parentView) {

        ChassisEditor.superClass.constructor.call(this, parentView);
        this.currentItem = null;

        this.pasteOffsetDz = 0;

        /**
         * 背板
         * @type {null | twaver.Node}
         */
        this.parentNode = null;

        /**
         * 3d到2d模型转换
         * @type {Object}
         */
        this.model3dTo2dMapping = $consts.deviceEditorModel3dTo2dMapping;

        /**
         * 2d到3d模型转换
         * @type {Object}
         */
        this.model2dTo3dMapping = $consts.deviceEditorModel2dTo3dMapping;

        this.lastSelectedChildNode = null;


        this._editable = false; //
        this.isAddChildNode = false;

        this.PANEL_CATEGORY = '设备面板';

        this.init();
    }

    ChassisEditor.prototype = {
        init: function () {

            var self = this;

            //create left menu
            this.accordionPane = new doodle.AccordionPane();

            //create network2d
            this.network2dView = this._initNetwork2d();

            this.network2d.setMaxZoom(40);

            var sheet = this.sheet = new twaver.controls.PropertySheet(this.box);
            $utils.initPropertySheet(sheet);
            var w = this.propertySheetBox.width();
            var h = this.propertySheetBox.height();
            sheet.adjustBounds({ x: 0, y: 0, width: w, height: h });

            this.propertySheetBox.append(this.sheet.getView());
            this.accordionPaneBox.append(this.accordionPane.getView());
            this.networkBox.append(this.network2dView);

            $(this.network2dView).on('dblclick', function (e) {
                //console.log(e);
                self.network2d.setDefaultInteractions();
            });

            this.refreshAccordion();
        },

        _initNetwork2d: function () {

            var self = this;
            var network2d = this.network2d = new nsp.edit.GridNetwork();
            this.network2d.setPositionMagneticEnabled(false);
            //this.network2d.setDragToPan(false);

            //this.network2d.setInteractions([
            //    new twaver.vector.interaction.DefaultInteraction(network2d),
            //    //new twaver.vector.interaction.EditInteraction(network2d),
            //]);
            var box = this.box;

            var box = this.box = this.network2d.getElementBox();

            var selectionModel = this.selectionModel = this.box.getSelectionModel();
            //selectionModel.setSelectionMode('singleSelection');
            selectionModel.addSelectionChangeListener(function (e) {
                //console.log('kind:' + e.kind + ',datas:' + e.datas.toString());
                var element = selectionModel.getLastData()
                self._resetPropertySheet();
                self.lastSelectedChildNode = null;
                if (element && !self.isHost(element)) {
                    self.lastSelectedChildNode = element;
                }
                if (self.parentNode) {
                    self.setSuspended(true);
                    if (self.network2d.isSelected(self.parentNode)) {
                        self.parentNode.setStyle('whole.alpha', 1);
                    } else if (selectionModel.size() > 0) {
                        self.parentNode.setStyle('whole.alpha', 0.3);
                    } else {
                        self.parentNode.setStyle('whole.alpha', 1);
                    }
                    self.setSuspended(false);
                }
            });
            selectionModel.setFilterFunction(function (element) {
                return self.isEditable(element);
            });
            var layerBox = box.getLayerBox();
            var parentLayer = this.parentLayer = new twaver.Layer('parentLayer');
            var childrenLayer = this.childrenLayer = new twaver.Layer('childrenLayer');
            layerBox.add(parentLayer);
            layerBox.add(childrenLayer);
            layerBox.moveToTop(parentLayer);

            var view = this.network2d.getView();
            DragAndDrop.setDropTarget(view, {
                self: this,
                dropEffect: 'copy',
                ondrop: function (e, data) {

                    data = JSON.parse(data);
                    var id = data.id;

                    //判断是否需要单独处理
                    if (self.onDropHandler && self.onDropHandler(e, data, box, network2d)) {
                        return;
                    }
                    //判断是否是拖拽的面板图,直接打开面板
                    var category = make.Default.getOtherParameter(id, 'category');
                    if (category == self.PANEL_CATEGORY) {
                        self._chassisId = id;
                        self.setData(make.Default.load(id));
                        return;
                    }
                    if (!self.parentNode) {
                        alert('先加载设备面板');
                        return;
                    }
                    var slot;
                    var element = self.network2d.getElementAt(e);
                    if (element && element.getClient('slot')) {
                        slot = element.getClient('bid');
                    }
                    if (!slot) {
                        return;
                    }
                    var node = self.loadCard(id, {
                        client: {
                            loc: slot
                        }
                    });
                    if (node) {
                        self.selectionModel.clearSelection();
                        self.selectionModel.setSelection(node);
                        self._resetPropertySheet();
                    }
                },
                ondragover: function (e) {

                },
                ondragleave: function (e) {

                }
            });

            network2d.addInteractionListener(function (e) {
                if (e.kind === 'doubleClickElement') { }
                if (e.kind === 'liveMoveStart') {
                    self._card = network2d.getSelectionModel().getLastData();
                    self.setSuspended(true);
                    self._card.setStyle('whole.alpha', 0.3);
                }
                if (e.kind === 'liveMoveBetween') { }
                if (e.kind === 'liveMoveEnd') {
                    var slot;
                    var elements = network2d.getElementsAt(e);
                    var slot = null;
                    elements && elements.forEach(function (element) {
                        if (element.getClient('slot') && !element.getClient('follower')) {
                            slot = element;
                        }
                    });
                    self._card.setStyle('whole.alpha', 1);
                    if (slot) {
                        self._card.setLocation(self._card.getHost().getLocation());
                        self.setSuspended(false);
                        self.startBatch();
                        self._card.getHost().setClient('follower', null);
                        self._card.setSize(slot.getSize());
                        self._card.setLocation(slot.getLocation());
                        self._card.setClient('loc', slot.getClient('bid'));
                        slot.setClient('follower', self._card);
                        self._card.setHost(slot);
                        self.endBatch();
                    } else {
                        slot = self._card.getHost();
                        self._card.setLocation(slot.getLocation());
                        self.setSuspended(false);
                    }
                    self._card = null;
                }
            });

            var ruler = this.ruler = new nsp.edit.Ruler(this.network2d);

            ruler.getView().setAttribute('class', 'room-ruler');
            ruler.setShowGuides(false);
            ruler.setShowRuler(true);
            var rulerView = $(ruler.getView());
            return rulerView;
        },

        /**
         * drop handler
         * 如果返回true,终止默认编辑器的后续操作
         * @param e {DropEvent} drop事件
         * @param data {Object} drop的data
         * @param box {twaver.ElementBox} element box
         * @param network {twaver.vector.Network} network
         */
        onDropHandler: function (e, data, box, network) {

        },
        getEditId: function (id) {
            return $utils.getDeviceEditorModel2dId(id);
        },
        isEditable: function (node) {
            return node.getClient('card');
        },
        isHost: function (node) {
            return !!node.getClient('host')
        },
        isResizeable: function (node) {
            return !!node.getClient('resizeable');
        },

        /**
         * load cards
         * @param cards {Object}
         * @returns {Array}
         */
        loadCards: function (cards) {
            var result = [];
            var self = this;
            if (cards instanceof Array) {
                cards.forEach(function (child) {
                    var node = self.loadCard(child.id, child);
                    result.push(node);
                });
            } else {
                var node = self.loadCard(cards.id, cards);
                result.push(node);
            }
            return result;
        },

        /**
         * load child
         * @param modelClass {string} 模型id
         * @param args {Object} 模型参数
         * @returns {twaver.Node}
         */
        loadChild: function (modelClass, args) {
            if (!this.parentNode) {
                console.warn('parentNode is null');
            }
            var self = this;
            modelClass = modelClass.replace('.' + $consts.DEVICE_MODEL_SUFFIX, '');
            args.id = this.getEditId(modelClass);
            args.objectId = doodle.id();
            var data = make.Default.load(args);
            if (data instanceof Array) {
                var nodes = data;
                nodes.forEach(function (node) {
                    node.setLayerId(self.childrenLayer.getId());
                    if (self.parentNode) {
                        node.setHost(self.parentNode);
                    }
                    self.box.add(node);
                })
            } else {
                var node = data;
                node.setLayerId(self.childrenLayer.getId());
                if (self.parentNode) {
                    node.setHost(self.parentNode);
                }
                self.box.add(node);
            }
            return data;
        },

        /**
         * load card
         * @param modelClass {string} 模型id
         * @param args {Object} 模型参数
         * @returns {twaver.Node}
         */
        loadCard: function (modelClass, args) {
            var self = this;
            modelClass = modelClass.replace('.' + $consts.DEVICE_MODEL_SUFFIX, '');
            args.id = this.getEditId(modelClass);
            args.objectId = doodle.id();
            var data = make.Default.load(args);
            data.setLayerId(self.childrenLayer.getId());
            var slot;
            self.box.forEach(function (child) {
                if (child.getClient('slot') && child.getClient('bid') === args.client.loc) {
                    slot = child;
                }
            });
            if (!slot) {
                alert('no slot: ' + args.client.loc);
                return;
            }
            data.setSize(slot.getSize());
            data.setLocation(slot.getLocation());
            self.startBatch();
            self.box.add(data);
            slot.setClient('follower', data);
            data.setHost(slot);
            self.endBatch();
            return data;
        },


        /**
         * 加载背板
         * @param modelClass {String} 背板模型ID
         * @param args {Object} 模版参数
         * @returns {twaver.Node} 返回背板节点
         */
        loadParent: function (modelClass, args) {
            modelClass = modelClass.replace('.' + $consts.DEVICE_MODEL_SUFFIX, '');
            args.id = this.getEditId(modelClass);
            args.objectId = doodle.id();
            var node = make.Default.load(args);
            node.setLayerId(this.parentLayer.getId());
            node.setLocation(0, 0);
            node.setMovable(false);
            this.parentNode = node;
            this.box.add(node);
            return node;
        },

        /**
         * set data
         * the first item is must be parent if jsonArray have parent
         * 如果包含背板,第一个元素必须是背板
         * @param jsonArray {Object[]}
         */
        setData: function (jsonArray) {
            var self = this;
            this.clear();
            this.startBatch();
            for (var i = 0; i < jsonArray.length; i++) {
                var data = jsonArray[i];
                if (i == 0 && make.Default.getOtherParameter(data.id, 'host')) {
                    self.loadParent(data.id, data);
                } else {
                    self.loadChild(data.id, data);
                }
            }
            this.endBatch();
        },
        clear: function () {
            this.box.clear();
            this.network2d.getElementBox().getUndoManager().clear();
        },

        _resetPropertySheet: function () {

            if (!this.isPropertySheetVisible()) {
                return;
            }
            var self = this;
            var propBox = self.sheet.getPropertyBox();
            propBox.clear();
            var selection = this.box.getSelectionModel();
            if (selection.size() != 1) {
                propBox.clear();
                this.propertySheetBox.hide();
            } else {
                this.propertySheetBox.show();
                var node = selection.getLastData();
                $utils.addProperties(propBox, make.Default.getModelDefaultParameterProperties(make.Default.getId(node)));
                self.resetPropertySheetBoxSize(this.sheet);
            }
        },

        /**
         * 视图总览
         */
        zoomOverview: function () {
            this.network2d.zoomOverview();
        },

        /**
         * 切换编辑模式,是否允许鼠标拖拽编辑
         * @param newValue {boolean} true 允许鼠标编辑, false 禁止编辑
         */
        setMouseEditable: function (newValue) {

            var oldValue = this._editable;
            if (oldValue != newValue) {
                this._editable = newValue;
                if (this._editable) {
                    this.network2d.setInteractions([
                        new twaver.vector.interaction.DefaultInteraction(this.network2d),
                        new twaver.vector.interaction.EditInteraction(this.network2d),
                    ]);
                } else {
                    this.network2d.setInteractions([
                        new twaver.vector.interaction.DefaultInteraction(this.network2d),
                    ]);
                }
            }
        },

        /**
         * 切换鼠标拖动拖放,
         * @param status {boolean} true 整个画布拖动 , false 单个元素拖动
         */
        setDragToPan: function (status) {
            this.network2d.setDragToPan(status);
        },

        /**
         * 取得编辑结果
         * @returns {Array}
         */
        getData: function () {
            var result = [];
            var self = this;
            this.box.forEach(function (data) {
                if (data.getClient('card')) {
                    var json = make.Default.toJson(data)
                    result.push(json);
                }
            });
            return result;
        },
        appendData: function (data) {
            this.loadChildren(data);
        },
        removeData: function (data) {
            var self = this;

            if (data instanceof Array) {
                return data.map(function (item) {
                    return self.box.removeById(item.objectId)
                })
            } else {
                return self.box.removeById(data.objectId)
            }
        },
        getSelectedData: function () {

            var self = this;
            var copyNodes = [];
            var nodes = this.selectionModel.getSelection().toList();
            if (nodes && nodes.size() > 0) {

                nodes.forEach(function (node) {
                    if (self.isHost(node)) {
                        return;
                    }
                    var json = make.Default.toJson(node)
                    copyNodes.push(json);
                })
            }
            return copyNodes;
        },
        /**
         * refresh accordion
         * 刷新左侧组件栏, 默认是调用doodle.utils.load2dChassisCategory()的结果
         * @param categories {Object[]} default is the result of calling function doodle.utils.load2dChassisCategory()
         */
        refreshAccordion: function (categories) {
            categories = categories || doodle.utils.load2dChassisCategory();
            this.accordionPane.setCategories(categories);
        }
    }

    doodle.ChassisEditor = ChassisEditor;
    doodle.utils.ext(ChassisEditor, Editor)





















    /**
     * 设备面板编辑器
     * @param parentView {HTMLDIVElement} 父容器
     * @constructor
     */
    var DeviceEditor = function (parentView) {

        DeviceEditor.superClass.constructor.call(this, parentView);
        this.currentItem = null;

        this.pasteOffsetDz = 0;

        /**
         * 背板
         * @type {null | twaver.Node}
         */
        this.parentNode = null;

        /**
         * 3d到2d模型转换
         * @type {Object}
         */
        this.model3dTo2dMapping = $consts.deviceEditorModel3dTo2dMapping;

        /**
         * 2d到3d模型转换
         * @type {Object}
         */
        this.model2dTo3dMapping = $consts.deviceEditorModel2dTo3dMapping;

        this.copyChildNode = null;
        this.lastSelectedChildNode = null;


        this._editable = false; //
        this.isAddChildNode = false;

        /**
         * 快捷复制键,默认c键
         * 选中一个节点,按住c键,会出现选中节点边框,点击可以快捷复制
         * @type {number}
         */
        this.KEY_CODE_COPY_ONE = 81; // Q键
        this.PANEL_CATEGORY = '设备面板';

        this.init();
    }

    DeviceEditor.prototype = {
        init: function () {

            var self = this;

            //create left menu
            this.accordionPane = new doodle.AccordionPane();

            //create network2d
            this.network2dView = this._initNetwork2d();

            this.network2d.setMaxZoom(40);

            var sheet = this.sheet = new twaver.controls.PropertySheet(this.box);
            $utils.initPropertySheet(sheet);
            var w = this.propertySheetBox.width();
            var h = this.propertySheetBox.height();
            sheet.adjustBounds({ x: 0, y: 0, width: w, height: h });

            this.propertySheetBox.append(this.sheet.getView());
            this.accordionPaneBox.append(this.accordionPane.getView());
            this.networkBox.append(this.network2dView);
            this.copyChildNode = this._createCopyChildNode();

            this.addKeyMoveListener(this.network2d);

            $(this.network2dView).on('mousemove', function (e) {
                //console.log(e);
                if (self.copyChildNode) {
                    var endPoint = self.network2d.getLogicalPoint(e);
                    self.copyChildNode.setCenterLocation(endPoint);
                }
            });

            $(document).on('keyup', function (e) {
                //console.log(e, e.keyCode);
                if (e.keyCode == self.KEY_CODE_COPY_ONE && self.box.contains(self.copyChildNode)) { //ctrl key   copy node end
                    self.box.remove(self.copyChildNode)
                }
            });

            $(this.network2dView).on('keydown', function (e) {
                //console.log(e, e.keyCode);
                if (e.keyCode == 32) { //空格 旋转
                    var node = self.box.getSelectionModel().getLastData();
                    if (!node) {
                        return;
                    }
                    var angle = node.getAngle();
                    node.setAngle(angle + 90);
                } else if (e.keyCode == self.KEY_CODE_COPY_ONE && self.lastSelectedChildNode && !self.box.contains(self.copyChildNode)) { //ctrl key  copy node start
                    var size = self.lastSelectedChildNode.getSize();
                    var angle = self.lastSelectedChildNode.getAngle();
                    self.copyChildNode.setSize(size);
                    self.copyChildNode.setAngle(angle);
                    self.copyChildNode.setClient('id', self.lastSelectedChildNode.getClient('id'));
                    self.box.add(self.copyChildNode);
                } else if (e.keyCode == 8) { //delete node
                    e.preventDefault();
                }
            });

            $(this.network2dView).on('dblclick', function (e) {
                //console.log(e);
                self.network2d.setDefaultInteractions();
            });
            $(this.network2dView).on('click', function (e) {
                //console.log(e);
                if (self.box.contains(self.copyChildNode)) { //copy node start
                    var id = self.copyChildNode.getClient('id');
                    var endPoint = self.network2d.getLogicalPoint(e);
                    var size = self.copyChildNode.getSize();
                    var angle = self.copyChildNode.getAngle();
                    var position = [endPoint.x, endPoint.y, 0];
                    position[0] -= size.width / 2
                    position[1] -= size.height / 2;
                    var args = {
                        position: position,
                        rotation: [0, 0, angle],
                        width: size.width,
                        height: size.height,
                    };
                    self.loadChild(id, args);
                    e.preventDefault();
                    return false;
                }
            });

            this.setUndoManagerEnabled(true);

            this.refreshAccordion();
        },

        _initNetwork2d: function () {

            var self = this;
            var network2d = this.network2d = new nsp.edit.GridNetwork();
            //this.network2d.setPositionMagneticEnabled(false);
            this.network2d.setPositionMagneticX(5);
            this.network2d.setPositionMagneticY(5);
            //this.network2d.setDragToPan(false);

            //this.network2d.setInteractions([
            //    new twaver.vector.interaction.DefaultInteraction(network2d),
            //    //new twaver.vector.interaction.EditInteraction(network2d),
            //]);
            this.network2d.setEditableFunction(function (e) {

                //if (!self._editable) {
                //    return false;
                //}
                //var data = self.selectionModel.getSelection();
                //if (data && data.size() > 1) {
                //    return false;
                //}
                return (!self.isHost(e) && self.copyChildNode != e) || self.isResizeable(e);
            })
            var box = this.box;
            this.network2d.getView().addEventListener('keydown', function (e) {
                var myKey = false;
                var xgap = self.network2d.getPositionMagneticX(),
                    ygap = self.network2d.getPositionMagneticY();
                if (e.keyCode == 37) { //Left
                    $utils.moveSelectionElements(box, "left", xgap, ygap);
                    myKey = true;
                }
                if (e.keyCode == 38) { //Top
                    $utils.moveSelectionElements(box, "top", xgap, ygap);
                    myKey = true;
                }
                if (e.keyCode == 39) { //Right
                    $utils.moveSelectionElements(box, "right", xgap, ygap);
                    myKey = true;
                }
                if (e.keyCode == 40) { //Bottom
                    $utils.moveSelectionElements(box, "bottom", xgap, ygap);
                    myKey = true;
                }

                if (myKey) {
                    e.preventDefault();
                    e.stopPropagation();
                }

            });

            var box = this.box = this.network2d.getElementBox();

            var packQuickFinder = this.packQuickFinder = new twaver.QuickFinder(this.box, 'pack', 'client');

            var selectionModel = this.selectionModel = this.box.getSelectionModel();
            //selectionModel.setSelectionMode('singleSelection');
            selectionModel.addSelectionChangeListener(function (e) {
                //console.log('kind:' + e.kind + ',datas:' + e.datas.toString());
                var element = selectionModel.getLastData()
                clearTimeout(self.selectionChangeHandleTimer);
                self.selectionChangeHandleTimer = setTimeout(function () {
                    self._resetPropertySheet();
                    self.lastSelectedChildNode = null;
                    if (element && !self.isHost(element)) {
                        self.lastSelectedChildNode = element;
                    }
                    if (self.parentNode) {
                        if (self.network2d.isSelected(self.parentNode)) {
                            self.parentNode.setStyle('whole.alpha', 1);
                        } else if (selectionModel.size() > 0) {
                            self.parentNode.setStyle('whole.alpha', 0.3);
                        } else {
                            self.parentNode.setStyle('whole.alpha', 1);
                        }
                    }
                }, 100);

                //console.log(e);
                var selection = selectionModel.getSelection();
                if (!selection || selection.size() == 0) {
                    return;
                }
                var pack = element.getClient('pack');
                if (pack) {

                    var list = packQuickFinder.find(pack);

                    if (selection) {
                        for (var i = 0; i < selection.size(); i++) {
                            var item = selection.get(i);
                            if (!list.contains(item)) {
                                selectionModel.removeSelection(item);
                                i--;
                            }
                        }
                    }
                    list.forEach(function (item) {
                        if (!selectionModel.contains(item)) {
                            selectionModel.appendSelection(item);
                        }
                    }, this)
                }
            });
            selectionModel.setFilterFunction(function (element) {

                return self.isEditable(element);
            });
            var layerBox = box.getLayerBox();
            var parentLayer = this.parentLayer = new twaver.Layer('parentLayer');
            var childrenLayer = this.childrenLayer = new twaver.Layer('childrenLayer');
            layerBox.add(parentLayer);
            layerBox.add(childrenLayer);
            layerBox.moveToTop(parentLayer);

            var view = this.network2d.getView();
            DragAndDrop.setDropTarget(view, {
                self: this,
                dropEffect: 'copy',
                ondrop: function (e, data) {

                    data = JSON.parse(data);
                    var id = data.id;
                    self.startBatch();
                    //判断是否需要单独处理
                    if (self.onDropHandler && self.onDropHandler(e, data, box, network2d)) {
                        self.endBatch();
                        return;
                    }
                    //判断是否是拖拽的面板图,直接打开面板
                    var category = make.Default.getOtherParameter(id, 'category');
                    if (category == self.PANEL_CATEGORY || category == '单板面板') {
                        self.setData(make.Default.load(id));
                        self.endBatch();
                        return;
                    }
                    var endPoint = self.network2d.getLogicalPoint(e);
                    var host = make.Default.getOtherParameter(self.getEditId(id), 'host'); // 是否是host节点
                    var args = {
                        position: [endPoint.x, endPoint.y, 0],
                        centerLocation: { x: endPoint.x, y: endPoint.y }
                    };
                    var node = null;
                    if (host) {
                        node = self.loadParent(id, args);
                        setTimeout(function () {
                            self.network2d.zoomOverview();
                        }, 100)
                    } else {
                        node = self.loadChild(id, args);
                    }
                    if (node) {
                        self.selectionModel.clearSelection();
                        self.selectionModel.setSelection(node);
                        self._resetPropertySheet();
                    }
                    self.endBatch();
                },
                ondragover: function (e) {

                },
                ondragleave: function (e) {

                }
            });

            var ruler = this.ruler = new nsp.edit.Ruler(this.network2d);

            ruler.getView().setAttribute('class', 'room-ruler');
            ruler.setShowGuides(false);
            ruler.setShowRuler(true);
            var rulerView = $(ruler.getView());
            return rulerView;
        },

        /**
         * drop handler
         * 如果返回true,终止默认编辑器的后续操作
         * @param e {DropEvent} drop事件
         * @param data {Object} drop的data
         * @param box {twaver.ElementBox} element box
         * @param network {twaver.vector.Network} network
         */
        onDropHandler: function (e, data, box, network) {

        },
        getEditId: function (id) {
            return $utils.getDeviceEditorModel2dId(id);
        },
        isEditable: function (node) {

            if (node.getClient('editable') === true) {
                return true;
            }
            return !this.isHost(node);
        },
        isHost: function (node) {
            return !!node.getClient('host')
        },
        isResizeable: function (node) {
            return !!node.getClient('resizeable');
        },
        _createCopyChildNode: function () {
            var node = new twaver.Node();
            node.setLayerId(this.childrenLayer.getId());
            node.setStyle('body.type', 'vector');
            node.setStyle('vector.shape', 'rectangle');
            node.setStyle('vector.fill', false);
            node.setStyle('vector.outline.width', 2);
            node.setStyle('vector.outline.color', '#a0a819');
            return node;
        },

        /**
         * load children
         * @param children {twaver.Node}
         * @returns {Array}
         */
        loadChildren: function (children) {
            var result = [];
            var self = this;
            var linkArray = []
            if (children instanceof Array) {
                children.forEach(function (child) {
                    if (make.Default.getOtherParameter(child.id, 'link')) {
                        linkArray.push(child);
                    } else {
                        var node = self.loadChild(child.id, child);
                        result.push(node);
                    }

                });
                linkArray.forEach(function (child) {
                    var link = self.loadChild(child.id, child);
                    result.push(link);
                });
            } else {
                var node = self.loadChild(children.id, children);
                result.push(node);
            }
            return result;
        },

        /**
         * load child
         * @param modelClass {string} 模型id
         * @param args {Object} 模型参数
         * @returns {twaver.Node}
         */
        loadChild: function (modelClass, args) {

            if (!this.parentNode) {
                console.warn('parentNode is null');
            }
            if (!modelClass) return;
            var self = this;
            modelClass = modelClass.replace('.' + $consts.DEVICE_MODEL_SUFFIX, '');
            args.id = this.getEditId(modelClass);
            args.objectId = doodle.id();
            var data = make.Default.load(args);
            if (make.Default.getOtherParameter(args.id, 'link')) {
                var link = data;
                link.setFromNode(self.findByBID(args.from));
                link.setToNode(self.findByBID(args.to))
                self.box.add(link);
            } else if (data instanceof Array) {
                var nodes = data;
                nodes.forEach(function (node) {
                    node.setLayerId(self.childrenLayer.getId());
                    if (self.parentNode) {
                        node.setHost(self.parentNode);
                    }
                    self.box.add(node);
                })
            } else {
                var node = data;
                node.setLayerId(self.childrenLayer.getId());
                if (self.parentNode) {
                    node.setHost(self.parentNode);
                }
                self.box.add(node);
            }
            return data;
        },


        /**
         * 加载背板
         * @param modelClass {String} 背板模型ID
         * @param args {Object} 模版参数
         * @returns {twaver.Node} 返回背板节点
         */
        loadParent: function (modelClass, args) {

            modelClass = modelClass.replace('.' + $consts.DEVICE_MODEL_SUFFIX, '');
            args.id = this.getEditId(modelClass);
            args.objectId = doodle.id();
            this.box.clear();
            var node = make.Default.load(args);
            node.setLayerId(this.parentLayer.getId());
            //node.setEditable(false);
            node.setLocation(0, 0);
            node.setMovable(false);
            this.parentNode = node;
            this.startBatch();
            this.box.add(node);
            this.endBatch();
            return node;
        },

        /**
         * set data
         * the first item is must be parent if jsonArray have parent
         * 如果包含背板,第一个元素必须是背板
         * @param jsonArray {Object[]}
         */
        setData: function (jsonArray) {
            var self = this;
            var linkArray = [];
            for (var i = 0; i < jsonArray.length; i++) {
                var data = jsonArray[i];
                if (make.Default.getOtherParameter(data.id, 'link')) {
                    linkArray.push(data);
                } else if (i == 0 && make.Default.getOtherParameter(data.id, 'host')) {
                    self.loadParent(data.id, data);
                } else {
                    self.loadChild(data.id, data);
                }
            }
            linkArray.forEach(function (data) {
                self.loadChild(data.id, data);
            })
        },
        clear: function () {
            this.box.clear();
        },

        _resetPropertySheet: function () {

            if (!this.isPropertySheetVisible()) {
                return;
            }
            var self = this;
            var propBox = self.sheet.getPropertyBox();
            propBox.clear();
            var selection = this.box.getSelectionModel();
            if (selection.size() != 1) {
                propBox.clear();
                this.propertySheetBox.hide();
            } else {
                this.propertySheetBox.show();
                var node = selection.getLastData();
                $utils.addProperties(propBox, make.Default.getModelDefaultParameterProperties(make.Default.getId(node)));
                self.resetPropertySheetBoxSize(this.sheet);
            }
        },


        /**
         * align selected data
         * 对齐选中的元素
         * @param type{string} 枚举[left, right, top, bottom, center, middle]
         */
        align: function (type) {
            var self = this;
            if (!type) {
                return;
            }
            var data = this.selectionModel.getSelection();

            //去除选中的parent
            var list = new twaver.List();
            data.forEach(function (node) {
                if (node && !self.isHost(node)) {
                    list.add(node);
                }
            })
            if (!list || list.size() < 2) {
                return;
            }
            make.Default.align(list, type);
        },

        /**
         * flow selected data
         * 均匀分布选中的元素
         * @param type {string} 枚举[hor, ver]
         * @param padding {number} 间距
         */
        flow: function (type, padding) {
            var self = this;
            if (!type) {
                return;
            }
            var data = this.selectionModel.getSelection();
            //去除选中的parent
            var list = new twaver.List();
            data.forEach(function (node) {
                if (node && !self.isHost(node)) {
                    list.add(node);
                }
            })
            if (!list || list.size() < 2) {
                return;
            }
            make.Default.flow(list, type, padding);
        },

        /**
         * 视图总览
         */
        zoomOverview: function () {
            this.network2d.zoomOverview();
        },

        /**
         * 切换编辑模式,是否允许鼠标拖拽编辑
         * @param newValue {boolean} true 允许鼠标编辑, false 禁止编辑
         */
        setMouseEditable: function (newValue) {

            var oldValue = this._editable;
            if (oldValue != newValue) {
                this._editable = newValue;
                if (this._editable) {
                    this.network2d.setInteractions([
                        new twaver.vector.interaction.DefaultInteraction(this.network2d),
                        new twaver.vector.interaction.EditInteraction(this.network2d),
                    ]);
                } else {
                    this.network2d.setInteractions([
                        new twaver.vector.interaction.DefaultInteraction(this.network2d),
                    ]);
                }
            }
        },

        /**
         * 切换鼠标拖动拖放,
         * @param status {boolean} true 整个画布拖动 , false 单个元素拖动
         */
        setDragToPan: function (status) {
            this.network2d.setDragToPan(status);
        },

        /**
         * 取得编辑结果
         * @param relative {boolean} 是否按相对坐标位置导出, true 以所有元素的最左上角为起点, false 导出绝对坐标
         * @returns {Array}
         */
        getData: function () {

            var result = [];
            var self = this;
            this.box.forEach(function (data) {

                if (data == self.parentNode) {
                    var json = make.Default.toJson(data)
                    result.splice(0, 0, json);
                } else {
                    var json = make.Default.toJson(data)
                    result.push(json);
                }
            });
            return result;
        },
        appendData: function (data) {
            this.loadChildren(data)
        },
        removeData: function (data) {
            var self = this;

            if (data instanceof Array) {
                return data.map(function (item) {
                    return self.box.removeById(item.objectId)
                })
            } else {
                return self.box.removeById(data.objectId)
            }
        },
        getSelectedData: function () {

            var self = this;
            var copyNodes = [];
            var nodes = this.selectionModel.getSelection().toList();
            if (nodes && nodes.size() > 0) {

                nodes.forEach(function (node) {
                    if (self.isHost(node)) {
                        return;
                    }
                    var json = make.Default.toJson(node, function (obj) {
                        obj.objectId = node.getId();
                        return obj;
                    })
                    copyNodes.push(json);
                })
            }
            return copyNodes;
        },
        /**
         * refresh accordion
         * 刷新左侧组件栏, 默认是调用doodle.utils.load2dSceneCategory()的结果
         * @param categories {Object[]} default is the result of calling function doodle.utils.load2dDeviceCategory()
         */
        refreshAccordion: function (categories) {
            categories = categories || doodle.utils.load2dDeviceCategory();
            this.accordionPane.setCategories(categories);
        }
    }

    doodle.DeviceEditor = DeviceEditor;
    doodle.utils.ext(DeviceEditor, Editor)





















    CircuitCreateLinkInteraction = function (network, typeOrLinkFunction) {
        CircuitCreateLinkInteraction.superClass.constructor.call(this, network, typeOrLinkFunction);
    }

    twaver.Util.ext("CircuitCreateLinkInteraction", twaver.vector.interaction.CreateLinkInteraction, {
        paint: function (ctx) {
            ctx.beginPath();
            var rect;
            var r;
            ctx.lineWidth = this.network.getEditLineWidth();
            if (this.currentPoint) {
                this.paintLine(ctx);
            }
            ctx.closePath();
        },
        paintLine: function (ctx) {
            var lineColor = this.network.getEditLineColor();
            var x1 = this.fromNode.hotPoint.x,
                y1 = this.fromNode.hotPoint.y;
            var x2 = this.currentPoint.x,
                y2 = this.currentPoint.y;
            var rect = this.network.getViewRect();
            if (!isFoleLink) {
                ctx.strokeStyle = lineColor;
                ctx.beginPath();
                ctx.moveTo(x1 - rect.x, y1 - rect.y);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            } else {
                ctx.strokeStyle = lineColor;
                ctx.beginPath();
                ctx.moveTo(x1 - rect.x, y1 - rect.y);
                ctx.lineTo(x2, y1 - rect.y);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
        },
        clear: function () {
            this.currentPoint = null;
            this.currentNode = null;
            this.fromNode = null;
            this.toNode = null;
            this.lastNode = null;
        },
        handle_mousedown: function (e) {
            if (!this.network.isValidEvent(e)) {
                return;
            }
            if (this.fromNode) {
                this.toNode = this.currentNode;
                if (this.toNode instanceof twaver.HorizontalLine) {
                    var link = this.createLink();
                    var offset = this.toNode.getClient('IntersectionPointOffset') || 0;
                    link.s('link.to.percent', [offset, 0]);
                    if (link) {
                        this.network.addElementByInteraction(link);
                    }
                    this.lastNode.setClient('IntersectionPoint', null);
                } else if (this.toNode instanceof twaver.VerticalLine) {
                    var link = this.createLink();
                    var offset = this.toNode.getClient('IntersectionPointOffset') || 0;
                    link.s('link.to.percent', [0, offset]);
                    if (link) {
                        this.network.addElementByInteraction(link);
                    }
                    this.lastNode.setClient('IntersectionPoint', null);
                } else if (this.toNode instanceof twaver.Node) {
                    var nodeUI = this.network.getElementUI(this.toNode);
                    if (!nodeUI) return;
                    var hp1 = nodeUI._hotPoint1;
                    var hp2 = nodeUI._hotPoint2;
                    if (!hp1 || !hp2) return;
                    var cp = this.network.getLogicalPoint2(e);
                    if (Math.pow((cp.x - hp1.x), 2) + Math.pow((cp.y - hp1.y), 2) < Math.pow((cp.x - hp2.x), 2) + Math.pow((cp.y - hp2.y), 2)) {
                        this.toNode.hotPoint = hp1;
                    } else {
                        this.toNode.hotPoint = hp2;
                    }
                    var link = this.createLink();
                    if (link) {
                        this.network.addElementByInteraction(link);
                    }
                }
                this.clear();
            } else {
                this.fromNode = this.currentNode;
                this.currentNode = null;
                this.currentPoint = null;
                this.repaint();
                var nodeUI = this.network.getElementUI(this.fromNode);
                if (!nodeUI) return;
                var hp1 = nodeUI._hotPoint1;
                var hp2 = nodeUI._hotPoint2;
                if (!hp1 || !hp2) return;
                var cp = this.network.getLogicalPoint2(e);
                if (Math.pow((cp.x - hp1.x), 2) + Math.pow((cp.y - hp1.y), 2) < Math.pow((cp.x - hp2.x), 2) + Math.pow((cp.y - hp2.y), 2)) {
                    this.fromNode.hotPoint = hp1;
                } else {
                    this.fromNode.hotPoint = hp2;
                }
            }
            if (this.lastNode) {
                var lastNode = this.lastNode;
                lastNode.setClient('drawIntersectionPoint1', false);
                lastNode.setClient('drawIntersectionPoint2', false);
                lastNode.setClient('IntersectionPoint', null);
            }
        },
        handle_mousemove: function (e) {
            var point = this.getMarkerPoint(e);
            if (!point) {
                return;
            }
            if (this.network.isMovingElement() || this.network.isEditingElement()) {
                this.clear();
                return;
            }
            var node = null;
            if (this.fromNode) {
                this.currentNode = this.getToNode(e, this.fromNode);
                this.currentPoint = point;
                this.repaint();
                if (this.currentNode instanceof twaver.HorizontalLine) {
                    var points = this.currentNode.getPoints();
                    if (points.size() !== 2) return;
                    var cp = this.network.getLogicalPoint2(e);
                    var lineLength = this.currentNode.getLineLength();
                    var xOffset = Math.abs(cp.x - points.get(0).x) / lineLength;
                    this.currentNode.setClient('IntersectionPointOffset', xOffset);
                    if (Math.abs(xOffset) > 0 && Math.abs(xOffset) < 1) {
                        xOffset *= lineLength;
                    }
                    var translatePoint = { x: points.get(0).x + xOffset, y: points.get(0).y };
                    this.currentNode.setClient('IntersectionPoint', translatePoint);
                    this.lastNode = this.currentNode;
                    this.currentNode.hotPoint = translatePoint;
                } else if (this.currentNode instanceof twaver.VerticalLine) {
                    var points = this.currentNode.getPoints();
                    if (points.size() !== 2) return;
                    var cp = this.network.getLogicalPoint2(e);
                    var lineLength = this.currentNode.getLineLength();
                    var offset = Math.abs(cp.y - points.get(0).y) / lineLength;
                    this.currentNode.setClient('IntersectionPointOffset', offset);
                    if (Math.abs(offset) > 0 && Math.abs(offset) < 1) {
                        offset *= lineLength;
                    }
                    var translatePoint = { x: points.get(0).x, y: points.get(0).y + offset };
                    this.currentNode.setClient('IntersectionPoint', translatePoint);
                    this.lastNode = this.currentNode;
                    this.currentNode.hotPoint = translatePoint;
                } else if (this.currentNode instanceof twaver.Node) {
                    if (!this.currentNode.getClient('connectable')) return;
                    var nodeUI = this.network.getElementUI(this.currentNode);
                    var hp1 = nodeUI._hotPoint1;
                    var hp2 = nodeUI._hotPoint2;
                    this.lastNode = this.currentNode;
                    if (!hp1 || !hp2) return;
                    var cp = this.network.getLogicalPoint2(e);
                    if (Math.pow((cp.x - hp1.x), 2) + Math.pow((cp.y - hp1.y), 2) < Math.pow((cp.x - hp2.x), 2) + Math.pow((cp.y - hp2.y), 2)) {
                        this.currentNode.setClient('drawIntersectionPoint1', true);
                    } else {
                        this.currentNode.setClient('drawIntersectionPoint2', true);
                    }
                } else {
                    // var line = this.network.getElementAt(e);
                    // if(line instanceof twaver.HorizontalLine){
                    //   var points = line.getPoints();
                    //   if(points.size() !== 2) return;
                    //   console.log(points);
                    // var ui = this.network.getElementUI(link);
                    // var points = ui.getLinkPoints();
                    // var cp = this.network.getLogicalPoint2(e);
                    // if (ui.getLineLength) {
                    //   lineLength = ui.getLineLength();
                    // } else {
                    //   lineLength = link.getLineLength();
                    // }
                    // var xOffset = Math.abs(cp.x - ui.getFromPoint().x)/lineLength;
                    // link.setClient('IntersectionPointOffset',xOffset);
                    // if (Math.abs(xOffset) > 0 && Math.abs(xOffset) < 1) {
                    //   xOffset *= lineLength;
                    // }
                    // var pointInfo = _twaver.math.calculatePointInfoAlongLine(points, true, xOffset, 0);
                    // var translatePoint = pointInfo.point;
                    // link.setClient('IntersectionPoint',translatePoint);
                    // this.lastNode = link;
                    // this.currentNode = link;
                    // }else{
                    //   this.lastNode && this.lastNode.setClient('IntersectionPoint',null);
                    // }
                    if (this.lastNode) {
                        var lastNode = this.lastNode;
                        lastNode.setClient('drawIntersectionPoint1', false);
                        lastNode.setClient('drawIntersectionPoint2', false);
                        lastNode.setClient('IntersectionPoint', null);
                    }
                }
            } else {
                node = this.getFromNode(e);
                if (this.currentNode !== node) {
                    this.currentNode = node;
                    if (node instanceof twaver.Node) {
                        this.lastNode = node;
                        if (!node.getClient('connectable')) return;
                        var nodeUI = this.network.getElementUI(node);
                        var hp1 = nodeUI._hotPoint1;
                        var hp2 = nodeUI._hotPoint2;
                        if (!hp1 || !hp2) return;
                        var cp = this.network.getLogicalPoint2(e);
                        if (Math.pow((cp.x - hp1.x), 2) + Math.pow((cp.y - hp1.y), 2) < Math.pow((cp.x - hp2.x), 2) + Math.pow((cp.y - hp2.y), 2)) {
                            node.setClient('drawIntersectionPoint1', true);
                        } else {
                            node.setClient('drawIntersectionPoint2', true);
                        }
                    } else {
                        if (this.lastNode) {
                            var lastNode = this.lastNode;
                            lastNode.setClient('drawIntersectionPoint1', false);
                            lastNode.setClient('drawIntersectionPoint2', false);
                        }
                    }
                }
            }
        },
        getNode: function (e, fromNode) {
            var node = this.network.getElementAt(e);
            if (node instanceof twaver.Node && this.network.isLinkable(node, fromNode) && this.network.getElementBox().getSelectionModel().isSelectable(node)) {
                return node;
            }
            return null;
        }
    });
    CircuitCreatePolyLineInteraction = function (network, typeOrLinkFunction) {
        CircuitCreatePolyLineInteraction.superClass.constructor.call(this, network, typeOrLinkFunction);
    }

    twaver.Util.ext("CircuitCreatePolyLineInteraction", twaver.vector.interaction.CreateShapeNodeInteraction, {
        handle_mousedown: function (e) {
            if (e.button !== 0) {
                return;
            }
            var point = this.network.getLogicalPoint2(e);
            if (!point) {
                return;
            }
            if (e.detail === 2 || e.timeStamp - this.timeStamp < 300) {
                if (this.points) {
                    var shapeNode = this.shapeNodeFunction(this.points);
                    this.network.addElementByInteraction(shapeNode);
                    this.clear();
                    var self = this;
                    setTimeout(function () {
                        self.network.setEditingElement(false);
                    }, 0);
                }
            } else {
                if (!this.network.isEditingElement()) {
                    this.network.setEditingElement(true);
                }
                if (!this.points) {
                    this.points = new twaver.List();
                }
                if (this.points.size() > 0) {
                    var lastPoint = this.points.get(this.points.size() - 1);
                    if (lastPoint.x === point.x && lastPoint.y === point.y) {
                        return;
                    }
                    if (Math.abs(point.x - lastPoint.x) >= Math.abs(point.y - lastPoint.y)) {
                        point.y = lastPoint.y;
                    } else {
                        point.x = lastPoint.x;
                    }
                }
                this.points.add(point);
            }
            this.timeStamp = e.timeStamp;
            this.repaint();
        },
        handle_mousemove: function (e) {
            if (this.points) {
                this.currentPoint = this.network.getLogicalPoint2(e);
                this.repaint();
            }
        }
    });

    /**
     * 电路面板编辑器
     * @param parentView {HTMLDIVElement} 父容器
     * @constructor
     */
    var CircuitEditor = function (parentView) {
        CircuitEditor.superClass.constructor.call(this, parentView);
        this.currentItem = null;

        /**
         * 背板
         * @type {null | twaver.Node}
         */
        this.parentNode = null;

        /**
         * 3d到2d模型转换
         * @type {Object}
         */
        this.model3dTo2dMapping = $consts.circuitEditorModel3dTo2dMapping;

        /**
         * 2d到3d模型转换
         * @type {Object}
         */
        this.model2dTo3dMapping = $consts.circuitEditorModel2dTo3dMapping;

        this.copyChildNode = null;
        this.lastSelectedChildNode = null;


        this._editable = false; //
        this.isAddChildNode = false;

        /**
         * 快捷复制键,默认c键
         * 选中一个节点,按住c键,会出现选中节点边框,点击可以快捷复制
         * @type {number}
         */
        this.KEY_CODE_COPY_ONE = 0;
        this.PANEL_CATEGORY = '设备面板';

        this.init();
    }

    CircuitEditor.prototype = {
        init: function () {

            var self = this;

            //create left menu
            this.accordionPane = new doodle.AccordionPane();

            //create network2d
            this.network2dView = this._initNetwork2d();

            this.network2d.setMaxZoom(40);

            var sheet = this.sheet = new twaver.controls.PropertySheet(this.box);
            $utils.initPropertySheet(sheet);
            var w = this.propertySheetBox.width();
            var h = this.propertySheetBox.height();
            sheet.adjustBounds({ x: 0, y: 0, width: w, height: h });

            this.propertySheetBox.append(this.sheet.getView());
            this.accordionPaneBox.append(this.accordionPane.getView());
            this.networkBox.append(this.network2dView);
            this.copyChildNode = this._createCopyChildNode();

            $(this.network2dView).on('mousemove', function (e) {
                //console.log(e);
                if (self.copyChildNode) {
                    var endPoint = self.network2d.getLogicalPoint(e);
                    self.copyChildNode.setCenterLocation(endPoint);
                }
            });

            $(document).on('keyup', function (e) {
                //console.log(e, e.keyCode);
                if (e.keyCode == self.KEY_CODE_COPY_ONE && self.box.contains(self.copyChildNode)) { //ctrl key   copy node end
                    self.box.remove(self.copyChildNode)
                }
            });

            $(this.network2dView).on('keydown', function (e) {
                //console.log(e, e.keyCode);
                if (e.keyCode == 32) { //空格 旋转
                    var node = self.box.getSelectionModel().getLastData();
                    if (!node) {
                        return;
                    }
                    var angle = node.getAngle();
                    node.setAngle(angle + 90);
                } else if (e.keyCode == self.KEY_CODE_COPY_ONE && self.lastSelectedChildNode && !self.box.contains(self.copyChildNode)) { //ctrl key  copy node start
                    var size = self.lastSelectedChildNode.getSize();
                    var angle = self.lastSelectedChildNode.getAngle();
                    self.copyChildNode.setSize(size);
                    self.copyChildNode.setAngle(angle);
                    self.copyChildNode.setClient('id', self.lastSelectedChildNode.getClient('id'));
                    self.box.add(self.copyChildNode);
                } else if (e.keyCode == 8) { //delete node
                    e.preventDefault();
                }
            });

            $(this.network2dView).on('dblclick', function (e) {
                //console.log(e);
                self.network2d.setDefaultInteractions();
            });
            $(this.network2dView).on('click', function (e) {
                //console.log(e);
                if (self.box.contains(self.copyChildNode)) { //copy node start
                    var id = self.copyChildNode.getClient('id');
                    var endPoint = self.network2d.getLogicalPoint(e);
                    var size = self.copyChildNode.getSize();
                    var angle = self.copyChildNode.getAngle();
                    var args = {
                        centerLocation: { x: endPoint.x, y: endPoint.y },
                        width: size.width,
                        height: size.height,
                        angle: angle,
                    };
                    self.loadChild(id, args);
                    e.preventDefault();
                    return false;
                }
            });

            this.refreshAccordion();
        },

        _initNetwork2d: function () {

            var self = this;
            var network2d = this.network2d = new nsp.edit.GridNetwork();
            this.network2d.setPositionMagneticX(5);
            this.network2d.setPositionMagneticY(5);
            this.network2d.setWheelToZoom(false);
            this.network2d.setPositionMagneticEnabled(false);
            //this.network2d.setDragToPan(false);

            //this.network2d.setInteractions([
            //    new twaver.vector.interaction.DefaultInteraction(network2d),
            //    //new twaver.vector.interaction.EditInteraction(network2d),
            //]);
            this.network2d.setEditableFunction(function (e) {

                //if (!self._editable) {
                //    return false;
                //}
                //var data = self.selectionModel.getSelection();
                //if (data && data.size() > 1) {
                //    return false;
                //}
                return (!self.isHost(e) && self.copyChildNode != e) || self.isResizeable(e);
            })

            var box = this.box = this.network2d.getElementBox();

            var selectionModel = this.selectionModel = this.box.getSelectionModel()
            //selectionModel.setSelectionMode('singleSelection');
            selectionModel.addSelectionChangeListener(function (e) {
                //console.log('kind:' + e.kind + ',datas:' + e.datas.toString());
                clearTimeout(self.selectionChangeHandleTimer);
                self.selectionChangeHandleTimer = setTimeout(function () {
                    self._resetPropertySheet();
                    self.lastSelectedChildNode = null;
                    var node = selectionModel.getLastData();
                    if (node && !self.isHost(node)) {
                        self.lastSelectedChildNode = node;
                    }
                    if (self.parentNode) {
                        if (self.network2d.isSelected(self.parentNode)) {
                            self.parentNode.setStyle('whole.alpha', 1);
                        } else if (selectionModel.size() > 0) {
                            self.parentNode.setStyle('whole.alpha', 0.3);
                        } else {
                            self.parentNode.setStyle('whole.alpha', 1);
                        }
                    }
                    self.network2d.invalidate();
                }, 100);
            });
            selectionModel.setFilterFunction(function (element) {
                return self.isEditable(element);
            });
            var layerBox = box.getLayerBox();
            var parentLayer = this.parentLayer = new twaver.Layer('parentLayer');
            var childrenLayer = this.childrenLayer = new twaver.Layer('childrenLayer');
            layerBox.add(parentLayer);
            layerBox.add(childrenLayer);
            layerBox.moveToTop(parentLayer);

            var view = this.network2d.getView();
            DragAndDrop.setDropTarget(view, {
                self: this,
                dropEffect: 'copy',
                ondrop: function (e, data) {

                    data = JSON.parse(data);
                    var id = data.id;

                    //判断是否需要单独处理
                    if (self.onDropHandler && self.onDropHandler(e, data, box, network2d)) {
                        return;
                    }
                    //判断是否是拖拽的面板图,直接打开面板
                    var category = make.Default.getOtherParameter(id, 'category');
                    if (category == self.PANEL_CATEGORY) {
                        self.setData(make.Default.load(id));
                        return;
                    }
                    var endPoint = self.network2d.getLogicalPoint(e);
                    var host = make.Default.getOtherParameter(self.getEditId(id), 'host'); // 是否是host节点
                    var args = {
                        centerLocation: { x: endPoint.x, y: endPoint.y },
                    };
                    var node = null;
                    if (host) {
                        node = self.loadParent(id, args);
                        setTimeout(function () {
                            self.network2d.zoomOverview();
                        }, 100)
                    } else {
                        node = self.loadChild(id, args);
                    }
                    if (node) {
                        self.selectionModel.clearSelection();
                        self.selectionModel.setSelection(node);
                        self._resetPropertySheet();
                    }
                },
                ondragover: function (e) {

                },
                ondragleave: function (e) {

                }
            });

            var ruler = this.ruler = new nsp.edit.Ruler(this.network2d);

            ruler.getView().setAttribute('class', 'room-ruler');
            ruler.setShowGuides(false);
            ruler.setShowRuler(true);
            var rulerView = $(ruler.getView());
            return rulerView;
        },

        /**
         * drop handler
         * 如果返回true,终止默认编辑器的后续操作
         * @param e {DropEvent} drop事件
         * @param data {Object} drop的data
         * @param box {twaver.ElementBox} element box
         * @param network {twaver.vector.Network} network
         */
        onDropHandler: function (e, data, box, network) {
            var id = data.id;
            var interaction = make.Default.getOtherParameter(id, 'interaction');
            if (interaction === 'createPolyLink') {
                network.setInteractions([
                    new CircuitCreatePolyLineInteraction(network, function (points) {
                        var node = make.Default.load(id);
                        node.setPoints(points);
                        return node;
                    }),
                    new twaver.vector.interaction.DefaultInteraction(network)
                ]);
            } else if (interaction == 'createLink') {
                isFoleLink = false;
                network.setInteractions([
                    new CircuitCreateLinkInteraction(network, function (fromNode, toNode) {
                        var fcl = fromNode.getCenterLocation();
                        var tcl = toNode.getCenterLocation();
                        var fromPencent, toPencent;
                        var linkType = "arc";

                        if (toNode instanceof twaver.HorizontalLine) {
                            if (fromNode.hotPoint) {
                                if (fromNode.hotPoint.x > fcl.x) {
                                    fromPencent = [1, 0.5];
                                } else if (fromNode.hotPoint.x < fcl.x) {
                                    fromPencent = [0, 0.5];
                                } else {
                                    if (fromNode.hotPoint.y > fcl.y) {
                                        fromPencent = [0.5, 1];
                                        var controlPoint = { x: fromNode.hotPoint.x, y: fromNode.hotPoint.y + 30 };
                                    } else {
                                        fromPencent = [0.5, 0];
                                        var controlPoint = { x: fromNode.hotPoint.x, y: fromNode.hotPoint.y - 30 };
                                    }
                                }
                            } else {
                                fromPencent = [0.5, 0.5];
                            }

                            var link = make.Default.load({
                                id: id,
                                style: {
                                    'link.from.percent': fromPencent,
                                    'link.bundle.enable': false,
                                    'link.type': 'arc',
                                    'link.corner': 'none',
                                },
                                client: {
                                    'link.type': 'HorizontalLine',
                                    'fromControlPoint': controlPoint,
                                }
                            });
                            link.setFromNode(fromNode);
                            link.setToNode(toNode);
                            return link;
                        } else if (toNode instanceof twaver.VerticalLine) {
                            if (fromNode.hotPoint) {
                                if (fromNode.hotPoint.x > fcl.x) {
                                    fromPencent = [1, 0.5];
                                } else if (fromNode.hotPoint.x < fcl.x) {
                                    fromPencent = [0, 0.5];
                                } else {
                                    if (fromNode.hotPoint.y > fcl.y) {
                                        fromPencent = [0.5, 1];
                                    } else {
                                        fromPencent = [0.5, 0];
                                    }
                                }
                            } else {
                                fromPencent = [0.5, 0.5];
                            }

                            var link = make.Default.load({
                                id: id,
                                style: {
                                    'link.from.percent': fromPencent,
                                    'link.bundle.enable': false,
                                    'link.type': 'arc',
                                    'link.corner': 'none',
                                },
                                client: {
                                    'link.type': 'VerticalLine',
                                }
                            });
                            link.setFromNode(fromNode);
                            link.setToNode(toNode);
                            return link;
                        }

                        if (fromNode.hotPoint && toNode.hotPoint) {
                            if (fromNode.hotPoint.x > fcl.x && toNode.hotPoint.x < tcl.x) {
                                linkType = "orthogonal.horizontal"
                            } else if (fromNode.hotPoint.x > fcl.x && toNode.hotPoint.x > tcl.x) {
                                linkType = "extend.right";
                            } else if (fromNode.hotPoint.x > fcl.x) {
                                linkType = "orthogonal.H.V";
                            } else if (fromNode.hotPoint.x < fcl.x && toNode.hotPoint.x < tcl.x) {
                                linkType = "extend.left"
                            } else if (fromNode.hotPoint.x < fcl.x && toNode.hotPoint.x > tcl.x) {
                                linkType = "orthogonal.horizontal";
                            } else if (fromNode.hotPoint.x < fcl.x) {
                                linkType = "orthogonal.H.V";
                            } else if (fromNode.hotPoint.y > fcl.y && toNode.hotPoint.y < tcl.y) {
                                linkType = "orthogonal.vertical";
                            } else if (fromNode.hotPoint.y > fcl.y && toNode.hotPoint.y > tcl.y) {
                                linkType = "extend.bottom";
                            } else if (fromNode.hotPoint.y > fcl.y) {
                                linkType = "orthogonal.V.H";
                            } else if (fromNode.hotPoint.y < fcl.y && toNode.hotPoint.y < tcl.y) {
                                linkType = "extend.top";
                            } else if (fromNode.hotPoint.y < fcl.y && toNode.hotPoint.y > tcl.y) {
                                linkType = "orthogonal.vertical";
                            } else if (fromNode.hotPoint.y < fcl.y) {
                                linkType = "orthogonal.V.H";
                            }
                        } else {
                            return;
                        }
                        var link = make.Default.load({
                            id: id,
                            style: {
                                'link.type': linkType,
                                'link.corner': 'none',
                            }
                        });
                        link.setFromNode(fromNode);
                        link.setToNode(toNode);
                        return link;
                    }),
                    new twaver.vector.interaction.DefaultInteraction(network),
                ]);
                return true;
            }
        },
        getEditId: function (id) {
            return $utils.getDeviceEditorModel2dId(id);
        },
        isEditable: function (node) {

            if (node.getClient('editable') === true) {
                return true;
            }
            return !this.isHost(node);
        },
        isHost: function (node) {
            return !!node.getClient('host')
        },
        isResizeable: function (node) {
            return !!node.getClient('resizeable');
        },
        _createCopyChildNode: function () {
            var node = new twaver.Node();
            node.setLayerId(this.childrenLayer.getId());
            node.setStyle('body.type', 'vector');
            node.setStyle('vector.shape', 'rectangle');
            node.setStyle('vector.fill', false);
            node.setStyle('vector.outline.width', 2);
            node.setStyle('vector.outline.color', '#a0a819');
            return node;
        },

        /**
         * load children
         * @param children {twaver.Node}
         * @returns {Array}
         */
        loadChildren: function (children) {
            var result = [];
            var self = this;
            var linkArray = []
            if (children instanceof Array) {
                children.forEach(function (child) {
                    if (make.Default.getOtherParameter(child.id, 'link')) {
                        linkArray.push(child);
                    } else {
                        var node = self.loadChild(child.id, child);
                        result.push(node);
                    }

                });
                linkArray.forEach(function (child) {
                    var link = self.loadChild(child.id, child);
                    result.push(link);
                });
            } else {
                var node = self.loadChild(children.id, children);
                result.push(node);
            }
            return result;
        },

        /**
         * load child
         * @param modelClass {string} 模型id
         * @param args {Object} 模型参数
         * @returns {twaver.Node}
         */
        loadChild: function (modelClass, args) {

            if (!this.parentNode) {
                console.warn('parentNode is null');
            }
            var self = this;
            modelClass = modelClass.replace('.' + $consts.DEVICE_MODEL_SUFFIX, '');
            args.id = this.getEditId(modelClass);
            args.objectId = doodle.id();
            var data = make.Default.load(args);
            if (make.Default.getOtherParameter(args.id, 'link')) {
                var link = data;
                link.setFromNode(self.findByBID(args.from));
                link.setToNode(self.findByBID(args.to))
                self.box.add(link);
            } else if (data instanceof Array) {
                var nodes = data;
                nodes.forEach(function (node) {
                    node.setLayerId(self.childrenLayer.getId());
                    if (self.parentNode) {
                        node.setHost(self.parentNode);
                    }
                    self.box.add(node);
                })
            } else {
                var node = data;
                node.setLayerId(self.childrenLayer.getId());
                if (self.parentNode) {
                    node.setHost(self.parentNode);
                }
                self.box.add(node);
            }
            return node;
        },


        /**
         * 加载背板
         * @param modelClass {String} 背板模型ID
         * @param args {Object} 模版参数
         * @returns {twaver.Node} 返回背板节点
         */
        loadParent: function (modelClass, args) {

            modelClass = modelClass.replace('.' + $consts.DEVICE_MODEL_SUFFIX, '');
            args.id = this.getEditId(modelClass);
            args.objectId = doodle.id();
            this.box.clear();
            var node = make.Default.load(args);
            node.setLayerId(this.parentLayer.getId());
            //node.setEditable(false);
            this.box.add(node);
            node.setLocation(0, 0);
            node.setMovable(false);
            this.parentNode = node;
            return node;
        },

        /**
         * set data
         * the first item is must be parent if jsonArray have parent
         * 如果包含背板,第一个元素必须是背板
         * @param jsonArray {Object[]}
         */
        setData: function (jsonArray) {
            var self = this;
            var linkArray = [];
            for (var i = 0; i < jsonArray.length; i++) {
                var data = jsonArray[i];
                if (make.Default.getOtherParameter(data.id, 'link')) {
                    linkArray.push(data);
                } else if (i == 0 && make.Default.getOtherParameter(data.id, 'host')) {
                    self.loadParent(data.id, data);
                } else {
                    self.loadChild(data.id, data);
                }
            }
            linkArray.forEach(function (data) {
                self.loadChild(data.id, data);
            })
        },

        _resetPropertySheet: function () {

            if (!this.isPropertySheetVisible()) {
                return;
            }
            var self = this;
            var propBox = self.sheet.getPropertyBox();
            propBox.clear();
            var selection = this.box.getSelectionModel();
            if (selection.size() != 1) {
                propBox.clear();
                this.propertySheetBox.hide();
            } else {
                this.propertySheetBox.show();
                var node = selection.getLastData();

                if (!make.Default.getId(node)) return;

                $utils.addProperties(propBox, make.Default.getModelDefaultParameterProperties(make.Default.getId(node)));
                self.resetPropertySheetBoxSize(this.sheet);
            }
        },


        /**
         * align selected data
         * 对齐选中的元素
         * @param type{string} 枚举[left, right, top, bottom, center, middle]
         */
        align: function (type) {
            var self = this;
            if (!type) {
                return;
            }
            var data = this.selectionModel.getSelection();

            //去除选中的parent
            var list = new twaver.List();
            data.forEach(function (node) {
                if (node && !self.isHost(node)) {
                    list.add(node);
                }
            })
            if (!list || list.size() < 2) {
                return;
            }
            make.Default.align(list, type);
        },

        /**
         * flow selected data
         * 均匀分布选中的元素
         * @param type {string} 枚举[hor, ver]
         * @param padding {number} 间距
         */
        flow: function (type, padding) {
            var self = this;
            if (!type) {
                return;
            }
            var data = this.selectionModel.getSelection();
            //去除选中的parent
            var list = new twaver.List();
            data.forEach(function (node) {
                if (node && !self.isHost(node)) {
                    list.add(node);
                }
            })
            if (!list || list.size() < 2) {
                return;
            }
            make.Default.flow(list, type, padding);
        },

        /**
         * 视图总览
         */
        zoomOverview: function () {
            this.network2d.zoomOverview();
        },

        /**
         * 切换编辑模式,是否允许鼠标拖拽编辑
         * @param newValue {boolean} true 允许鼠标编辑, false 禁止编辑
         */
        setMouseEditable: function (newValue) {

            var oldValue = this._editable;
            if (oldValue != newValue) {
                this._editable = newValue;
                if (this._editable) {
                    this.network2d.setInteractions([
                        new twaver.vector.interaction.DefaultInteraction(this.network2d),
                        new twaver.vector.interaction.EditInteraction(this.network2d),
                    ]);
                } else {
                    this.network2d.setInteractions([
                        new twaver.vector.interaction.DefaultInteraction(this.network2d),
                    ]);
                }
            }
        },

        /**
         * 切换鼠标拖动拖放,
         * @param status {boolean} true 整个画布拖动 , false 单个元素拖动
         */
        setDragToPan: function (status) {
            this.network2d.setDragToPan(status);
        },

        /**
         * 取得编辑结果
         * @param relative {boolean} 是否按相对坐标位置导出, true 以所有元素的最左上角为起点, false 导出绝对坐标
         * @returns {Array}
         */
        getData: function (relative) {

            var result = [];
            var parentObjectId = null;
            if (this.parentNode) {
                parentObjectId = this.parentNode.getId();
            }

            var self = this;
            var x = 0,
                y = 0;
            if (relative) {
                x = 9999999999;
                y = 9999999999;
                this.box.forEach(function (data) {

                    x = Math.min(x, data.getX());
                    y = Math.min(y, data.getY());
                });
            }
            this.box.forEach(function (data) {

                if (data == self.parentNode) {
                    var json = make.Default.toJson(data, function (d) {
                        d.x = d.x || 0;
                        d.y = d.y || 0;
                        d.x -= x;
                        d.y -= y;
                        return d;
                    })
                    result.splice(0, 0, json);
                } else {
                    var json = make.Default.toJson(data, function (d) {
                        //d.id = $utils.getDeviceEditorModel3dId(d.id);
                        d.x -= x;
                        d.y -= y;
                        d.parentObjectId = parentObjectId;
                        return d;
                    })
                    result.push(json);
                }
            });
            return result;
        },
        appendData: function (data) {
            this.loadChildren(data)
        },
        removeData: function (data) {
            var self = this;

            if (data instanceof Array) {
                return data.map(function (item) {
                    return self.box.removeById(item.objectId)
                })
            } else {
                return self.box.removeById(data.objectId)
            }
        },
        getSelectedData: function () {

            var self = this;
            var copyNodes = [];
            var nodes = this.selectionModel.getSelection().toList();
            if (nodes && nodes.size() > 0) {

                nodes.forEach(function (node) {
                    if (self.isHost(node)) {
                        return;
                    }
                    var json = make.Default.toJson(node, function (d) {
                        return d;
                    })
                    copyNodes.push(json);
                })
            }
            return copyNodes;
        },
        /**
         * refresh accordion
         * 刷新左侧组件栏, 默认是调用doodle.utils.load2dSceneCategory()的结果
         * @param categories {Object[]} default is the result of calling function doodle.utils.load2dDeviceCategory()
         */
        refreshAccordion: function (categories) {
            categories = categories || doodle.utils.load2dCircuitCategory();
            this.accordionPane.setCategories(categories);
        },
        pasteSelection: function (offset) {
            //console.warn('this method[{}] is not supported'.format('pasteSelection'))
            var self = this;
            if (!this._copyAnchor || this._copyAnchor.length == 0) {
                return null;
            }
            offset = offset || this._getPasteOffset();
            this._copyAnchor.forEach(function (data) {
                var item = $utils.clone(data);
                item.objectId = doodle.id();
                if (item.position) {
                    var position = item.position;
                    item.position = [position[0] + offset.x, position[1] + offset.y, position[2] + offset.z];
                }
                if (item.location) {
                    var location = item.location;
                    if (location instanceof Array) {
                        item.location = [position[0] + offset.x, position[1] + offset.z];
                    } else {
                        item.location.x += offset.x;
                        item.location.y += offset.z;
                    }
                }
                if (item.x) {
                    item.x += offset.x;
                }
                if (item.y) {
                    item.y += offset.z;
                }
                if (item.points) {
                    item.points._as.forEach(function (p) {
                        p.x += offset.x;
                        p.y += offset.z;
                    });
                }
                self.appendData(item);
            })
        },
    }

    doodle.CircuitEditor = CircuitEditor;
    doodle.utils.ext(CircuitEditor, Editor)





















    /**
     * 3D模型编辑器
     * @param parentView {HTMLDIVElement} 父容器
     * @constructor
     */
    var ModelEditor = function (parentView) {

        ModelEditor.superClass.constructor.call(this, parentView);

        this.jsonObj = null;
        this._modelChangeDispatcher = new mono.EventDispatcher();
        this._modelPropertyChangeDispatcher = new mono.EventDispatcher();

        this._currentModel = null;

        this.refreshAccordion();
    }

    ModelEditor.prototype = {
        _init: function () {
            var self = this;
            this.accordionPane = new doodle.AccordionPane();
            //create property sheet
            this.propertySheetPane = new nsp.edit.PropertySheetPane(this.box);
            //create network3d
            this.network3dView = this._initNetwork3d();
            //create container, add all components into the container

            this.accordionPaneBox.append(this.accordionPane.getView());
            this.propertySheetBox.append(this.propertySheetPane.getView());
            this.networkBox.append(this.network3dView);
            this.addPropertySheetListener();
            this.adjustNetwork3dBoundingBox();
        },
        parentResizeHandle: function () {
            ModelEditor.superClass.parentResizeHandle.call(this);
            this.invalidate();
        },
        addPropertySheetListener: function () {
            var box = this.propertySheetPane.box;
            box.addDataPropertyChangeListener(this._handleSheetPropertyChanged, this);
        },

        /**
         * 取的编辑的结果
         * @private
         * @returns {Object}
         */
        getJsonObject: function () {
            var result = {};
            var jsonObj = this.propertySheetPane.getData();
            return jsonObj;
        },
        setElement: function (data) {
            this.propertySheetPane.setElement(data);

            if (!this.isPropertySheetVisible()) {
                return;
            }
            this.propertySheetBox.show();
            this.resetPropertySheetBoxSize(this.propertySheetPane.sheet);
        },

        /**
         * 导入数据
         * @private
         * @param data {Object}
         */
        importJsonObject: function (data) {

            data.objectId = data.objectId || doodle.id();
            var box = this.network3d.getDataBox();
            box.clear();
            var rack = make.Default.load(data);
            box.addByDescendant(rack);
            this.setElement(data);
        },
        _handleSheetPropertyChanged: function (e) {
            if (!this.propertySheetPane._setValued) {
                return;
            }
            var jsonObj = this.propertySheetPane.getData();
            var rack = make.Default.load(jsonObj);
            this.network3d.getDataBox().clear();
            this.network3d.getDataBox().addByDescendant(rack);
            this._currentModel = rack;
            this.fireModelPropertyChange(rack, e.property, e.oldValue, e.newValue);
        },
        _initNetwork3d: function () {
            var network3d = this.network3d = new mono.Network3D();
            var camera = new mono.PerspectiveCamera(30, 1.5, 50, 5000);
            network3d.setCamera(camera);
            network3d.setClearColor('#000000');
            network3d.setClearAlpha(0);
            network3d.setBackgroundImage('./images/bg_network.jpg')
            // network3d.setShowAxis(true);
            camera.p(107, 156, 609);
            camera.look(new mono.Vec3(0, 0, 0));

            var interaction = network3d.getDefaultInteraction();
            interaction.yLowerLimitAngle = Math.PI / 180 * 2;
            interaction.yUpLimitAngle = Math.PI / 2;
            interaction.maxDistance = 1000;
            interaction.minDistance = 100;
            interaction.zoomSpeed = 3;
            interaction.panSpeed = 0.2;
            network3d.setInteractions([interaction]);

            var box = this.box = network3d.getDataBox();
            var pointLight = new mono.PointLight(0xFFFFFF, 0.1);
            pointLight.setPosition(1000, 1000, 1000);
            box.add(pointLight);

            box.add(new mono.AmbientLight('white'));

            network3d.getRootView().setAttribute('class', 'network3d-view');
            //network3d.getRootView().style.setProperty('left', '202px');
            var self = this;

            network3d.getRootView().addEventListener('dblclick', function (e) {
                self._handleDoubleClick(e, network3d);
            });

            DragAndDrop.setDropTarget(network3d.getRootView(), {
                self: this,
                ondrop: function (e, data) {

                    //判断是否需要单独处理
                    if (self.onDropHandler && self.onDropHandler(e, data, box, network3d)) {
                        return;
                    }
                    box.clear();
                    var json = JSON.parse(data);
                    json.objectId = json.objectId || doodle.id();
                    var rack = make.Default.load(json);
                    box.addByDescendant(rack);
                    // $utils.animateCamera(camera, interaction, oldTarget, newTarget);
                    mono.Utils.playCameraAnimation(camera, new mono.Vec3(107, 156, 609), new mono.Vec3(0, 0, 0), 1000);

                    self.setElement(json);

                    rack.setClient('data', data); // TODO 把相关的参数传递
                    self.fireModelChange(self._currentModel, rack);
                    self._currentModel = rack;

                }
            });
            return network3d.getRootView();
        },

        /**
         * drop handler
         * 如果返回true,终止默认编辑器的后续操作
         * @param e {DropEvent} drop事件
         * @param data {Object} drop的data
         * @param box {twaver.ElementBox} element box
         * @param network {twaver.vector.Network} network
         */
        onDropHandler: function (e, data, box, network) {

        },

        adjustNetwork3dBoundingBox: function () {
            //mono.Utils.autoAdjustNetworkBounds(this.network3d, this.contentPane, 'clientWidth', 'clientHeight', 0, 0);
            //var left = this.isAccordionVisible() ? 200 : 0;
            //this.network3d.adjustBounds(this.contentPane.clientWidth - left, this.contentPane.clientHeight)
            mono.Utils.autoAdjustNetworkBounds(this.network3d, this.networkBox[0], 'clientWidth', 'clientHeight', 0, 0);
        },

        fireModelChange: function (oldModel, newModel) {
            this._modelChangeDispatcher.fire({
                source: this,
                oldValue: oldModel,
                newValue: newModel,
            });
        },

        fireModelPropertyChange: function (source, property, oldValue, newValue) {
            this._modelPropertyChangeDispatcher.fire({
                source: source,
                property: property,
                oldValue: oldValue,
                newValue: newValue,
            });
        },

        addModelChangeListener: function (listener, scope, ahead) {
            this._modelChangeDispatcher.add(listener, scope, ahead);
        },

        removeModelChangeListener: function (listener, scope) {
            this._modelChangeDispatcher.remove(listener, scope);
        },

        addModelPropertyChangeListener: function (listener, scope, ahead) {
            this._modelPropertyChangeDispatcher.add(listener, scope, ahead);
        },

        removeModelPropertyChangeListener: function (listener, scope) {
            this._modelPropertyChangeDispatcher.remove(listener, scope);
        },

        _handleDoubleClick: function (e, network) {
            var self = this;
            var camera = network.getCamera();
            var interaction = network.getDefaultInteraction();
            var firstClickObject = $utils.findFirstObjectByMouse(network, e);
            if (firstClickObject) {
                var element = firstClickObject.element;
                var newTarget = firstClickObject.point;
                var oldTarget = camera.getTarget();
                if (element.getClient('animation')) {
                    make.Default.playAnimation(element, element.getClient('animation'));
                } else {
                    $utils.animateCamera(camera, interaction, oldTarget, newTarget);
                }

            } else {
                var oldTarget = camera.getTarget();
                var newTarget = new mono.Vec3(0, 0, 0);
                $utils.animateCamera(camera, interaction, oldTarget, newTarget);
            }
        },

        /**
         * refresh accordion
         * 刷新左侧组件栏, 默认是调用doodle.utils.load2dSceneCategory()的结果
         * @param categories {Object[]} default is the result of calling function doodle.utils.load3dModelCategory()
         */
        refreshAccordion: function (categories) {
            categories = categories || doodle.utils.load3dModelCategory();
            this.accordionPane.setCategories(categories);
        },

        invalidate: function () {
            this.adjustNetwork3dBoundingBox();
        },

        /**
         * 取得当前的3d对象
         * @returns {null|mono.Data}
         */
        getCurrentModel: function () {
            return this._currentModel;
        },
        getData: function () {
            var data = this.getJsonObject();
            if (!data) {
                return null;
            }
            return data;
        },
        setData: function (data) {
            if (data instanceof Array) {
                this.importJsonObject(data[0])
            } else {
                this.importJsonObject(data);
            }
        },
        getSelectedData: function () {
            throw 'not support this function[{}]'.format('getSelectedData')
        },
        appendData: function () {
            throw 'not support this function[{}]'.format('appendData')
        },
        copySelection: function () {
            throw 'not support this function[{}]'.format('copySelection')
        },
        pasteSelection: function () {
            throw 'not support this function[{}]'.format('pasteSelection')
        }

    }

    doodle.ModelEditor = ModelEditor;
    doodle.utils.ext(ModelEditor, Editor)
    /**
     * 机架编辑器, 目前只支持标准设备(高度是整数U), 2D和3D模型默认的映射关系是".front", 详细见dodle.consts和doodl.utils
     * 有两种方式使用机柜编辑器
     * 1 拖拽机柜,填充里面的设备
     * 2 已经存在机柜, 填充里面的设备
     * @param parentView {HTMLDIVElement} 编辑器父容器
     * @param modelClass {String} 默认的机柜类型
     * @param objectId {String} 默认的机柜实例的ID
     * @constructor
     */
    var RackEditor = function (parentView, modelClass, objectId) {

        RackEditor.superClass.constructor.call(this, parentView);

        /**
         * 默认的机柜类型
         * @type {String}
         */
        this.modelClass = modelClass;

        /**
         * 默认的机柜实例ID
         * @type {String}
         */
        this.objectId = objectId || doodle.id();

        /**
         * 机柜节点
         * @type {twaver.Node}
         */
        this.parentNode = null;
        this.dragNode = null;
        this.currentItem = null;

        /**
         * 3d到2d模型映射
         * @type {Object}
         */
        this.model3dTo2dMapping = $consts.rackEditorModel3dTo2dMapping;

        /**
         * 2d到3d模型的映射
         * @type {Object}
         */
        this.model2dTo3dMapping = $consts.rackEditorModel2dTo3dMapping;

        this.unitHeight = make.Default.getUnitHeight() || 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isSettingLocation = false; //
        this.isAddChildNode = false;
        this.DEVICE_PATTEN = '设备模板';
        this.RACK_PATTEN = '机柜模板';

        /**
         * component bar
         * 左侧组件栏
         * @type {doodle.AccordionPane}
         */
        this.accordionPane = new doodle.AccordionPane();
        this.init();
    }

    RackEditor.prototype = {
        init: function () {

            var self = this;


            this.accordionPane.ondrag = function (e, item) {
                self.onDragHandler(e, item);
            }

            //create network2d
            this.network2dView = this._initNetwork2d();

            this.network2d.setMaxZoom(15);

            var sheet = this.sheet = new twaver.controls.PropertySheet(this.box);
            $utils.initPropertySheet(sheet);
            var w = this.propertySheetBox.width();
            var h = this.propertySheetBox.height();
            sheet.adjustBounds({ x: 0, y: 0, width: w, height: h });
            this.propertySheetBox.append(this.sheet.getView());

            this.accordionPaneBox.append(this.accordionPane.getView());

            this.networkBox.append(this.network2dView);

            $(this.network2dView).on('keydown', function (e) {
                //console.log(e, e.keyCode);
                if (e.keyCode == 8) { //delete node
                    e.preventDefault();
                }
            });

            this.refreshAccordion();
            if (this.modelClass) {
                this.loadParent(this.modelClass);
            }
        },

        _initNetwork2d: function () {

            var self = this;

            /**
             * network2d
             * @type {nsp.edit.GridNetwork}
             */
            var network2d = this.network2d = new nsp.edit.GridNetwork();
            this.network2d.setPositionMagneticEnabled();
            //this.network2d.setDragToPan(false);


            var box = this.box = this.network2d.getElementBox();

            this._setChildPositionMagnetic(box);

            var selectionModel = this.selectionModel = this.box.getSelectionModel()
            selectionModel.setSelectionMode('singleSelection');
            selectionModel.addSelectionChangeListener(function (e) {
                //console.log(e);
                self._resetPropertySheet();
                self.resetNodeName();
            });
            selectionModel.setFilterFunction(function (element) {
                return element != self.parentNode;
            });
            var layerBox = box.getLayerBox();
            var parentLayer = this.parentLayer = new twaver.Layer('parentLayer');
            var childrenLayer = this.childrenLayer = new twaver.Layer('childrenLayer');
            layerBox.add(parentLayer);
            layerBox.add(childrenLayer);
            layerBox.moveToTop(parentLayer);

            var view = this.network2d.getView();
            DragAndDrop.setDropTarget(view, {
                self: this,
                dropEffect: 'copy',
                ondrop: function (e, data) {

                    //判断是否需要单独处理
                    if (self.onDropHandler && self.onDropHandler(e, data, box, network2d)) {
                        return;
                    }
                    data = JSON.parse(data);
                    if (self.isPatten(data.id)) {

                        var category = make.Default.getOtherParameter(data.id, 'category');
                        if (category == self.RACK_PATTEN) {

                            var info = make.Default.load(data.id);
                            self.loadParent(info.parent);
                            self.setData(info.data);
                            setTimeout(function () {
                                self.zoomOverview()
                            }, 100)
                        } else if (self.parentNode) {

                            var info = make.Default.load(data.id);
                            self.setData(info);
                        } else {
                            alert('add rack first')
                        }
                        return;
                    }
                    if (!self.dragNode) {
                        self.loadParent(data.id);
                        setTimeout(function () {
                            self.network2d.zoomOverview();
                        }, 100);
                    } else {

                        box.getSelectionModel().clearSelection();
                        box.getSelectionModel().appendSelection(self.dragNode);
                        self.dragNode.setStyle('whole.alpha', 1);
                        self._resetPropertySheet();
                        self.resetChildNodeLocation(self.dragNode);
                    }
                    if (self.dragNode) {
                        self.dragNode = null;
                        self.currentItem = null;
                    }

                },
                ondragover: function (e) {

                    e.dataTransfer.dropEffect = 'copy';

                    //console.log(self.currentItem);
                    //判断拖拽的是否是子节点
                    if (self.dragNode && !self.isHost(self.dragNode)) {
                        self.propertySheetBox.hide();
                        //判断是否有剩余空间可以放置
                        var size = self.getSize(self.dragNode);
                        if (!self.parentNode || !self._haveSpace(size, self.dragNode)) {
                            e.dataTransfer.dropEffect = 'none';
                            return;
                        }
                        //如果没有添加子节点,那么添加
                        if (!self.dragNode.isAddInBox) {
                            self.dragNode.isAddInBox = true;
                            self.dragNode.setStyle('whole.alpha', 0.7);
                            self._initChildNode(self.dragNode, childrenLayer);
                            box.add(self.dragNode);
                            self.box.getSelectionModel().clearSelection();
                            self.box.getSelectionModel().appendSelection(self.dragNode);
                        }
                        var endPoint = self.network2d.getLogicalPoint(e);
                        var tx = endPoint.x;
                        var ty = endPoint.y;
                        ty -= self.dragNode.getSize().height / 2;
                        endPoint = self.formatLocation(self.dragNode, tx, ty);
                        if (endPoint) {
                            self.dragNode.setLocation(endPoint.x, endPoint.y);
                        } else {
                            self.resetChildNodeLocation(self.dragNode);
                        }
                    }

                },
                ondragleave: function (e) {
                    if (self.dragNode) {
                        if (self.dragNode.isAddInBox) {
                            box.remove(self.dragNode);
                        }
                        self.dragNode = null;
                        self.currentItem = null;
                    }
                }
            });

            var ruler = this.ruler = new nsp.edit.Ruler(this.network2d);

            ruler.getView().setAttribute('class', 'room-ruler');
            ruler.setShowGuides(false);
            ruler.setShowRuler(true);
            var rulerView = $(ruler.getView());
            return rulerView;
        },

        /**
         * drop handler
         * 如果返回true,终止默认编辑器的后续操作
         * @param e {DropEvent} drop事件
         * @param data {Object} drop的data
         * @param box {twaver.ElementBox} element box
         * @param network {twaver.vector.Network} network
         */
        onDropHandler: function (e, data, box, network) {

        },

        onDragHandler: function (e, item) {
            var self = this;
            if (self.isPatten(item.id)) {
                return;
            }
            if (!self.currentItem) {
                var id = self.getEditId(item.id);
                if (make.Default.getOtherParameter(id, 'host')) {
                    return;
                }
                self.currentItem = item;
                self.dragNode = make.Default.load({
                    id: item.id,
                    objectId: doodle.id()
                });
                self.dragNode.setClient('id', item.id);
            }
        },

        isPatten: function (id) {
            var category = make.Default.getOtherParameter(id, 'category');
            return category == this.DEVICE_PATTEN || category == this.RACK_PATTEN;
        },
        getEditId: function (id) {
            return $utils.getRackEditorModel2dId(id);
        },
        isHost: function (node) {
            return !!node.getClient('host')
        },
        getSize: function (node) {
            return node.getClient('size') || 1;
        },

        /**
         * set data
         * 设置机柜原有设备的数据
         * @param children {Object[]}
         */
        setData: function (children) {
            var self = this;
            children.forEach(function (child) {
                self.loadChild(child.id, child);
            });
        },
        /**
         * 取的编辑的结果
         * @returns {Array}
         */
        getData: function () {
            if (!this.parentNode) {
                return [];
            }
            var result = [];
            var parentObjectId = this.parentNode.getId();
            var self = this;
            this.box.forEach(function (data) {

                if (data != self.parentNode) {
                    var json = make.Default.toJson(data, function (d) {
                        d.id = $utils.getRackEditorModel3dId(d.id);
                        d.parentObjectId = parentObjectId;
                        return d;
                    })
                    result.push(json);
                }
            });
            return result;
        },
        appendData: function (data) {
            if (!this.parentNode) {
                throw 'rack is empty';
            }
            this.loadChild(data.id, data)
        },
        removeData: function (data) {
            var self = this;

            if (data instanceof Array) {
                return data.map(function (item) {
                    return self.box.removeById(item.objectId)
                })
            } else {
                return self.box.removeById(data.objectId)
            }
        },

        clear: function () {
            if (this.modelClass) {

                var self = this;
                var children = [];
                this.box.forEach(function (data) {

                    if (data != self.parentNode) {
                        children.push(data);
                    }
                });
                children.forEach(function (data) {
                    self.box.remove(data);
                })
            } else {
                this.box.clear();
            }
        },

        loadChild: function (modelClass, args) {
            args.id = this.getEditId(modelClass);
            var node = make.Default.load(args);
            if (!node) return; //这里会出现unknowid
            this._initChildNode(node, this.childrenLayer);
            this.isAddChildNode = true;
            this.box.add(node);
            this.resetChildNodeLocation(node);
            return node;
        },

        _initChildNode: function (node, layer) {
            var self = this;
            node.setLayerId(layer.getId());
            node.setHost(this.parentNode);
            var oldSetLocationFun = node.setLocation;
            node.originalSetLocation = oldSetLocationFun;
            node.setLocation = function (tx, ty) {
                var endPoint = self.formatLocation(node, tx, ty);
                if (endPoint) {
                    oldSetLocationFun.call(node, endPoint.x, endPoint.y);
                } else {
                    self.resetChildNodeLocation(node);
                }
            }

            var oldTranslate = node.translate;
            node.translate = function (ox, oy) {
                if (self.childNodeLiveMove) {
                    self.childNodeLastPointOffset.x += ox;
                    self.childNodeLastPointOffset.y += oy;
                    var tx = self.childNodeLastPoint.x + self.childNodeLastPointOffset.x;
                    var ty = self.childNodeLastPoint.y + self.childNodeLastPointOffset.y;
                    var endPoint = self.formatLocation(node, tx, ty);
                    if (endPoint) {
                        oldSetLocationFun.call(node, endPoint.x, endPoint.y);
                    } else {
                        self.resetChildNodeLocation(node);
                    }
                } else {
                    oldTranslate.call(node, ox, oy);
                }
            }
            return node;
        },

        /**
         * 加载机柜
         * @param modelClass {String} 机柜模型ID
         * @returns {*}
         */
        loadParent: function (modelClass) {

            var args = {
                id: $utils.getRackEditorModel2dId(modelClass, 'rack'),
                objectId: this.objectId,
            };
            var node = make.Default.load(args);
            if (!node) {
                layer.alert(args.id + it.util.i18n('Admin_rackEditor_NotRegister'), {icon:2});
                return;
            }
            this._initParentNode(node, this.parentLayer);
            this.box.clear();
            this.box.add(node);
            node.setLocation(0, 0);
            this._resetPropertySheet();
            node.setMovable(false);
            this.parentNode = node;
            return node;
        },

        _initParentNode: function (node, layer) {
            //node.setStyle('select.style', null);
            node.setLayerId(layer.getId());
            this.offsetX = node.getClient('offsetX');
            this.offsetY = node.getClient('offsetY');
            this.childrenSize = node.getClient('childrenSize');
        },

        _findChildren: function () {

            return this.box.toDatas(function (node) {
                if (this.parentNode != node) {
                    return node;
                }
            }, this);
        },

        _isEmpty: function (loc, size, selfNode) {
            var list = this._findChildren();
            if (!list || list.size() == 0) {
                return true;
            }
            var childrenSize = this.parentNode.getClient('childrenSize');
            var count = list.size();
            var min = loc;
            var max = loc + size - 1;
            if (max > childrenSize - 1) {
                return false;
            }
            for (var i = 0; i < count; i++) {

                var node = list.get(i);
                if (selfNode == node) {
                    continue
                }
                var nodeSize = node.getClient('size');
                var nodeLoc = parseInt(node.getClient('loc')) - 1;
                var minTmp = nodeLoc;
                var maxTmp = nodeLoc + nodeSize - 1;
                if (!(min > maxTmp || max < minTmp)) {
                    return false;
                }
            }
            return true;
        },

        _haveSpace: function (size, selfNode) {
            var list = this._findChildren();
            if (!list || list.size() == 0) {
                return true;
            }
            var parentSize = this.parentNode.getClient('childrenSize') || 42;
            for (var i = 0; i <= parentSize - size; i++) {
                if (this._isEmpty(i, size, selfNode)) {
                    return true;
                }
            }
            return false;
        },

        _getNextLoc: function (size, selfNode) {
            if (this._haveSpace(size, selfNode)) {
                var childrenSize = this.parentNode.getClient('childrenSize');
                for (var i = 0; i < childrenSize; i++) {
                    if (this._isEmpty(i, size, selfNode)) {
                        return i;
                    }
                }
            }
            throw 'there have not enough space for ' + size + 'U  server'
        },

        _setChildPositionMagnetic: function (box) {

            var self = this;

            box.addDataPropertyChangeListener(function (e) {
                //console.log('DataPropertyChange:');
                //console.log(e);
                var property = e.property;
                var node = e.source;
                if (!node.getClient('host')) {
                    if (property == 'C:loc') {
                        node.eventType = 'loc';
                        self.changeChildNodeHandler(node, e)
                    } else if (property == 'location') {
                        if (self.isSettingLocation) {
                            self.isSettingLocation = false;
                        } else {
                            self.moveChildNodeHandler(node, e);
                        }
                    }
                } else if ($consts.HOST_EDITABLE) { //是否可以编辑父亲节点

                }

            });

            box.addDataBoxChangeListener(function (e) {
                //console.log(e);
                var kind = e.kind;
                var node = e.data;
                if (kind == 'add' && !node.getClient('host')) {
                    self.addChildNodeHandler(node, e);
                }
            });
            this.network2d.addInteractionListener(function (e) {

                //console.log(e);
                var node = self.box.getSelectionModel().getLastData();
                if (node && !node.getClient('host')) {

                    if (e.kind == 'liveMoveStart') { //开始移动
                        self.propertySheetBox.hide();
                        self.childNodeLiveMove = true;
                        self.childNodeLastPoint = node.getLocation();
                        self.childNodeLastPointOffset = { x: 0, y: 0 };
                        node.setStyle('whole.alpha', 0.5);
                    } else if (e.kind == 'liveMoveEnd') { //结束已动工
                        self.moveChildNodeEndHandler(node, e);
                        delete self.childNodeLiveMove;
                        delete self.childNodeLastPoint;
                        delete self.childNodeLastPointOffset;
                        node.setStyle('whole.alpha', 1);
                        self.propertySheetBox.show();
                    }
                }

            });
        },

        _getLoc: function (y, physical) {

            var childrenSize = this.parentNode.getClient('childrenSize');
            var parentLocation = this.parentNode.getLocation();
            var dy = childrenSize * this.unitHeight - (y - parentLocation.y - this.offsetY);
            var loc = Math.round(dy / this.unitHeight);
            if (!physical) {
                loc = Math.max(0, loc);
                loc = Math.min(childrenSize - 1, loc);
            }
            return loc;
        },
        formatLocation: function (node, tx, ty) {

            var parentLocation = this.parentNode.getLocation();
            //限定在父亲节点内
            var childrenSize = this.parentNode.getClient('childrenSize');
            ty = Math.max(parentLocation.y + this.offsetY, ty);
            ty = Math.min(parentLocation.y + this.offsetY + childrenSize * this.unitHeight - node.getSize().height, ty);
            var size = node.getClient('size');
            //取得loc值
            var loc = this._getLoc(ty + node.getSize().height);
            if (!this._isEmpty(loc, size, node)) {
                return null;
            }
            var parentLocation = this.parentNode.getLocation();
            var tx = parentLocation.x + this.offsetX;
            var ty = parentLocation.y + (childrenSize - 1 - loc + 1) * this.unitHeight + this.offsetY - node.getSize().height;
            return { x: tx, y: ty, loc: loc }
        },

        addChildNodeHandler: function (node) {

            if (this.isAddChildNode) {
                this.isAddChildNode = false;
                return;
            }
            var location = node.getLocation();
            var loc = this._getLoc(location.y + node.getSize().height);
            node.setClient('loc', loc - 1);
        },

        resetNodeName: function () {
            var self = this;
            this.box.forEach(function (node) {
                if (self.parentNode != node) {
                    node.setName(null);
                }
            });
            var node = this.selectionModel.getLastData();
            if (node && !this.isHost(node)) {
                node.setStyle('label.position', 'right.right');
                node.setStyle('label.xoffset', 10);
                //node.setStyle('label.font', '12px arial');
                var loc = parseInt(node.getClient('loc'));
                var size = parseInt(node.getClient('size'));
                var name = '' + (loc) + 'U - ' + (loc + size - 1) + 'U';
                node.setName(name);
            }

        },

        /*
         * 修改节点 修改loc
         * 这里目前存在一个不同的实现方式,修改loc时,如果修改失败,
         * 是否应该恢复到上一次的位置上,还是重新再找一个新的位置上
         */
        changeChildNodeHandler: function (node, e) {

            this.resetNodeName(node);
            if (this.eventType == 'moveChildNodeHandler-loc') {
                this.eventType = null;
                return;
            }
            var size = node.getClient('size');
            var loc = parseInt(e.newValue) - 1;
            //恢复上一次位置 or 重新找一个位置摆设
            if (!this._isEmpty(loc, size, node)) {
                loc = this._getNextLoc(size, node);
                node.setClient('loc', loc + 1);
            } else {
                var childrenSize = this.parentNode.getClient('childrenSize');
                var parentLocation = this.parentNode.getLocation();
                var tx = parentLocation.x + this.offsetX;
                var ty = parentLocation.y + (childrenSize - 1 - loc + 1) * this.unitHeight + this.offsetY - node.getSize().height;
                this.setChildNodeLocation(node, tx, ty);
            }
        },

        /*
         * 移动节点
         * 移动过程中只控制x方向坐标,y方向坐标不控制,移动结束时判断
         */
        moveChildNodeHandler: function (node, e) {

            if (this.eventType) {
                this.eventType = null;
                return;
            }
            var self = this;
            var size = node.getClient('size');
            var cy = null;
            if (e) {
                cy = parseFloat(e.newValue.y);
            } else {
                cy = node.getLocation().y;
            }
            var loc = this._getLoc(cy + node.getSize().height);
            //如果拖拽的位置是空,那么保存新的位置,否则回到上一次位置
            //如果将要拖到的下一个位置不为空,那么禁止拖放过去
            if (this._isEmpty(loc, size, node)) {


                var oldLoc = parseInt(node.getClient('loc')) - 1;
                if (oldLoc != loc) {
                    this.eventType = 'moveChildNodeHandler-loc';
                }
                node.setClient('loc', loc + 1);
            }

            //var tx = this.parentNode.getLocation().x + this.offsetX;
            //var ty = cy;
            //setTimeout(function () {
            //    self.setChildNodeLocation(node, tx, ty);
            //}, 0)

            setTimeout(function () {
                self.resetChildNodeLocation(node);
            }, 500)

        },

        moveChildNodeEndHandler: function (node, e) {
            this.resetChildNodeLocation(node);
        },

        setChildNodeLocation: function (node, tx, ty) {

            var childrenSize = this.parentNode.getClient('childrenSize');
            var oldLoc = node.getLocation();
            var parentLocation = this.parentNode.getLocation();
            ty = Math.max(parentLocation.y + this.offsetY, ty);
            ty = Math.min(parentLocation.y + this.offsetY + childrenSize * this.unitHeight - node.getSize().height, ty);
            if (oldLoc.x != tx || oldLoc.y != ty) {
                this.isSettingLocation = true;
                node.setLocation(tx, ty);
            }
        },

        /*
         * 初始化节点位置
         */
        resetChildNodeLocation: function (node) {

            var loc = parseInt(node.getClient('loc')) - 1;
            var childrenSize = this.parentNode.getClient('childrenSize');
            var parentLocation = this.parentNode.getLocation();
            var tx = parentLocation.x + this.offsetX;
            var ty = parentLocation.y + (childrenSize - 1 - loc + 1) * this.unitHeight + this.offsetY - node.getSize().height;
            var oldLoc = node.getLocation();
            if (oldLoc.x != tx || oldLoc.y != ty) {
                this.isSettingLocation = true;
                node.originalSetLocation(tx, ty);
            }
        },

        _resetPropertySheet: function () {

            if (!this.isPropertySheetVisible()) {
                return;
            }
            var self = this;
            var propBox = self.sheet.getPropertyBox();
            propBox.clear();
            var selection = this.box.getSelectionModel();
            if (selection.size() == 0) {
                propBox.clear();
                this.propertySheetBox.hide();
            } else {
                this.propertySheetBox.show();
                var node = selection.getLastData();
                $utils.addProperties(propBox, make.Default.getModelDefaultParameterProperties(make.Default.getId(node)));
                self.resetPropertySheetBoxSize(this.sheet);
            }
        },

        /**
         * 视图总览
         */
        zoomOverview: function () {
            this.network2d.zoomOverview();
        },

        /**
         * refresh accordion
         * 刷新左侧组件栏, 默认是调用doodle.utils.load2dSceneCategory()的结果
         * @param categories {Object[]} default is the result of calling function doodle.utils.load2dRackCategory()
         */
        refreshAccordion: function (categories) {
            categories = categories || doodle.utils.load2dRackCategory(!this.modelClass);
            this.accordionPane.setCategories(categories);
        }
    }

    doodle.RackEditor = RackEditor;
    doodle.utils.ext(RackEditor, Editor)

    var idcLayer = {
        'wall': 100,
        'area': 200,
        'innerWall': 300,
        'wallChild': 400,
        'innerWallChild': 500,
        'channel': 600,
        'rack': 700,
        'default': 800
    }
    nsp.edit.BoxBridge = function (box2d, jsonBox) {
        this.box2d = box2d;
        this.jsonBox = jsonBox;
        this.binded = false;

        /**
         * jsonObject.objectId 只想2D对象
         * @type {{}}
         */
        this.refMap2d = {};

        /**
         * 2d对象的id,指向jsonObject
         * @type {{}}
         */
        this.refMapJson = {};
        this.isAdjusting = false;
    };

    twaver.Util.ext(nsp.edit.BoxBridge, Object, {
        bind: function () {
            if (this.binded) {
                return;
            }

            this.box2d.addDataBoxChangeListener(this._handle2dBoxChange, this);
            this.box2d.addDataPropertyChangeListener(this._handle2dDataChange, this);
            this.jsonBox.addDataBoxChangeListener(this._handleJsonBoxChange, this);

            this.binded = true;
        },

        unbind: function () {
            this.box2d.removeDataBoxChangeListener(this._handle2dBoxChange, this);
            this.box2d.removeDataPropertyChangeListener(this._handle2dDataChange, this);

            this.jsonBox.removeDataBoxChangeListener(this._handleJsonBoxChange, this);
            this.binded = false;
        },

        synchronizeFilter: function (node2d, jsonObject) {
            return true;
        },

        /**
         * 通过2dbox的data 生成jsonObject
         * @param data2d twaver.Node对象
         * @returns {nsp.edit.data.JsonObject}
         * @private
         */
        _getJsonData: function (data2d) {
            var node = new nsp.edit.data.JsonObject({ "objectId": data2d.getId() });
            var radius = data2d.getClient('radius');
            var centerLocation = data2d.getCenterLocation();
            var angle = data2d.getAngle();
            var id = $utils.getSceneEditorModel3dId(data2d.getClient('id'));
            var points = data2d.getPoints && data2d.getPoints();
            var name = data2d.getClient('objName');
            var width = data2d.getClient('wallWidth') || data2d.getWidth();
            var depth = data2d.getHeight();
            var height = data2d.getClient('height');
            var positionY = data2d.getClient('positionY');
            var label = data2d.getClient('label');
            var bid = data2d.getClient('bid');
            var closed = data2d.getClient('closed');
            var showFloor = data2d.getClient('showFloor');
            var wallHeight = data2d.getClient('wallHeight');

            var parentId = null;
            if (data2d.getParent()) {
                parentId = data2d.getParent();
            }
            node.setParentId(parentId);
            var pointsY = data2d.getClient('pointsY');
            var clientMap = {};

            if (radius) {
                node.setRadius(radius);
            }
            if (centerLocation) {
                node.setPosition([centerLocation.x, 0, centerLocation.y]);
            }
            if (angle) {
                node.setRotation([0, angle, 0]);
            }
            if (id) {
                node.id = id;
            }
            if (name) {
                node.setName(name);
            }
            if (width) {
                node.setWidth(width);
            }
            if (depth) {
                node.setDepth(depth);
            }
            if (height) {
                node.setHeight(height);
            }
            if (closed) {
                node.setClosed(true);
            }
            if (showFloor) {
                node.setShowFloor(true);
            }
            if (wallHeight) {
                node.setWallHeight(wallHeight);
            }
            if (positionY) {
                var position = node.getPosition() || [0, 0, 0];
                node.setPosition(position[0], positionY, position[2]);
            }
            if (points != null && points.size() > 0) {
                var data = [];
                for (var i = 0; i < points.size(); i++) {
                    if (pointsY) {
                        data.push([points.get(i).x - centerLocation.x, points[i] || 20, points.get(i).y - centerLocation.y]);
                    } else {
                        data.push([points.get(i).x - centerLocation.x, points.get(i).y - centerLocation.y]);
                    }
                }
                node.setData(data);
            }
            if (label) {
                clientMap['label'] = label;
            }
            if (bid) {
                clientMap['bid'] = bid;
            }
            node.setClient(clientMap);

            return node;
        },

        /**
         * 通过2d data 生成jsonData
         * 2d的box抛出add事件时执行
         * @param data
         * @private
         */
        _addJsonData: function (data) {
            if (this.synchronizeFilter(data, null)) {
                if (this.box2d.contains(data)) {
                    var node = this._getJsonData(data);
                    this.jsonBox.add(node);
                    this.refMapJson[data.getId()] = node;
                }
            }
        },

        //通过2d Data删除jsondata
        _removeJsonData: function (data) {
            if (data != null) {
                this.jsonBox.removeById(data.getId());
                delete this.refMapJson[data.getId()];
            }
            var type = data.getClient('type');
            if (type == 'door' || type == 'window') {
                var objectId = data.getId();
                for (var i in this.refMapJson) {
                    if (this.refMapJson[i]) {
                        var children = this.refMapJson[i].getChildren();
                        if (children && children.length > 0) {
                            for (var j = 0; j < children.length; j++) {
                                if (children[j].getObjectId() == objectId) {
                                    this.refMapJson[i].getChildren().splice(children.indexOf(children[j]), 1);
                                    console.log(this.refMapJson[i]);
                                }
                            }
                        }
                    }
                }
            }

        },

        _handle2dBoxChange: function (e) {
            if (this.isAdjusting) {
                return;
            }
            this.isAdjusting = true;
            var data = e.data;
            var kind = e.kind;
            if (kind == 'add') {
                this._addJsonData(data);
                this.resetParentAndChildren(data);
            } else if (kind == 'remove') {
                this._removeJsonData(data);
            } else if (kind == 'clear') {
                this.jsonBox.clear();
                this.refMapJson = {};
                this.refMap2d = {};
            }
            this.isAdjusting = false;
        },

        /**
         * 2D 对象属性变化
         * FIXME 需要处理好父子关系.
         * @param e
         * @private
         */
        _handle2dDataChange: function (e) {

            var self = this;
            if (this.isAdjusting) {
                return;
            }
            this.isAdjusting = true;
            var data = e.source,
                newValue = e.newValue,
                oldValue = e.oldValue,
                property = e.property;


            if (data.getParent() && (data.getClient('type') == "door" || data.getClient('type') == "window")) {
                var jsonData = this.jsonBox.getDataById(data.getParent().getId());
                var childData;
                jsonData.getChildren().forEach(function (child) {
                    if (child.getObjectId() == data.getId()) {
                        childData = child;
                    }
                });
                if (property.startsWith('C:')) {
                    p = property.substr(property.indexOf(':') + 1);
                    if (p == 'edgeIndex' || p == 'offset') {
                        childData.client = childData.client || {};
                        childData.client[p] = newValue;
                    }
                    if (p == 'length') {
                        childData.setWidth(newValue);
                    }
                    var location = data.getCenterLocation();
                    var positionY = childData.getPosition()[1];
                    childData.setPosition([location.x, positionY, location.y]);
                    var clientMap = childData.getClient() || {};
                    clientMap[p] = newValue;
                    childData.setClient(clientMap);
                }
            }
            var jsonData = this.jsonBox.getDataById(data.getId());
            if (!jsonData) {
                this.isAdjusting = false;
                return;
            }
            if (property == 'points') {
                var points = newValue;
                fixWallDatas(data, points);
            } else if (property == 'location') {
                //FIXME处理好父子关系
                var centerLocation = data.getCenterLocation();
                var size = data.getSize();
                var position = jsonData.getPosition() || [0, 0, 0];
                jsonData.setPosition([centerLocation.x, position[1], centerLocation.y]);
                fixWallDatas(data);
                //TODO 拖动位置时, 只会影响节点的父亲, 不会影响孩子
                self.resetParentAndChildren(data);
            } else if (property == 'angle') {
                jsonData.setRotation([0, -newValue, 0]);
            } else if (property == 'width') {
                jsonData.setWidth(newValue);
                var centerLocation = data.getCenterLocation();
                var position = jsonData.getPosition() || [0, 0, 0];
                jsonData.setPosition([centerLocation.x, position[1], centerLocation.y]);
            } else if (property == 'height') {
                jsonData.setDepth(newValue);
                var centerLocation = data.getCenterLocation();
                var position = jsonData.getPosition() || [0, 0, 0];
                jsonData.setPosition([centerLocation.x, position[1], centerLocation.y]);
            } else if (property.startsWith('C:')) {
                var p = property.substr(property.indexOf(':') + 1);
                if (p == 'radius') {
                    jsonData.setRadius(newValue);
                } else if (p == 'height') {
                    jsonData.setHeight(newValue);
                } else if (p == 'wallHeight') {
                    jsonData.setWallHeight(newValue);
                } else if (p == 'positionY') {
                    var position = jsonData.getPosition() || [0, 0, 0];
                    jsonData.setPosition([position[0], parseInt(newValue), position[2]]);
                } else if (p == 'pointsY') {
                    //pointsY is a map , {0: 23, 1:32}; do not deal with segments
                    var pointsY = newValue;
                    var datas = jsonData.getData();
                    for (var i = 0; i < datas.length; i++) {
                        datas[i][1] = pointsY[i];
                    }
                    jsonData.setData(datas);
                } else if (p == 'parentId') {
                    jsonData.setParentId(newValue);
                }
                var clientMap = jsonData.getClient() || {};
                clientMap[p] = newValue;
                jsonData.setClient(clientMap);
            } else if (property.startsWith('S:')) {
                var p = property.substr(property.indexOf(':') + 1);
                if (p == 'vector.outline.color') {
                    jsonData.setColor(newValue)
                }
                var styleMap = jsonData.getStyle() || {};
                styleMap[p] = newValue;
                jsonData.setStyle(styleMap);
            }
            this.isAdjusting = false;

            /*修复墙移动门窗偏移的问题*/
            function fixWallDatas(data, points) {
                if (!data.getPoints) return;
                var datas = [];
                var points = points || data.getPoints();
                var centerLocation = data.getCenterLocation();
                var pointsY = data.getClient('pointsY');
                var segments = data.getSegments();
                if (segments && segments.size() > 0 && segments.size() > points.size()) return;
                if (segments && segments.size() > 0) {
                    for (var i = 0, j = 0; i < segments.size(); i++ , j++) {
                        var segment = segments.get(i);
                        var point = points.get(j);
                        if (segment == 'moveto' || segment == 'lineto') {
                            if (pointsY) {
                                datas.push([parseInt(point.x - centerLocation.x), pointsY[j], parseInt(point.y - centerLocation.y)]);
                            } else {
                                datas.push([parseInt(point.x - centerLocation.x), parseInt(point.y - centerLocation.y)]);
                            }

                        } else if (segment == 'quadto') {
                            if (pointsY) {
                                var point2 = points.get(++j);
                                var pointY2 = pointsY[j] || 0;
                                datas.push(['c', parseInt(point.x - centerLocation.x), pointsY[j], parseInt(point.y - centerLocation.y), parseInt(point2.x - centerLocation.x), pointY2, parseInt(point2.y - centerLocation.y)]);
                            } else {
                                datas.push(['c', parseInt(point.x - centerLocation.x), parseInt(point.y - centerLocation.y), parseInt(point2.x - centerLocation.x), parseInt(point2.y - centerLocation.y)]);
                            }

                        }
                    }
                } else {
                    for (var i = 0; i < points.size(); i++) {
                        if (pointsY) {
                            datas.push([points.get(i).x - centerLocation.x, pointsY[i], points.get(i).y - centerLocation.y]);
                        } else {
                            datas.push([points.get(i).x - centerLocation.x, points.get(i).y - centerLocation.y]);
                        }

                    }
                }
                jsonData.setData(datas);
            }

        },

        _handleJsonBoxChange: function (e) {
            if (this.isAdjusting) {
                return;
            }
            this.isAdjusting = true;
            var data = e.data;
            var kind = e.kind;
            if (kind == 'add') {
                if (!this.refMapJson[data.getObjectId()]) {
                    this.refMapJson[data.getObjectId()] = data;
                }
                this._add2dData(data);
            } else if (kind == 'remove') {
                this._remove2dData(data);
            } else if (kind == 'clear') {
                this.box2d.clear();
                this.refMapJson = {};
                this.refMap2d = {};
            }
            this.isAdjusting = false;
        },

        _remove2dData: function (data) {
            if (data != null) {
                this.box2d.removeById(data.getObjectId());
                delete this.refMap2d[data.getObjectId()]
            }
        },

        /**
         * 将一个JsonObject对象序列化,并且将3D模型的ID修改成对应的2D的模型ID
         * @param data {JsonObject}
         * @returns {{}}
         * @private
         */
        _replaceMappingId: function (data) {
            var result = {};
            make.Default.copyProperties(data, result);
            this._replaceMappingIdAction(result);
            return result;
        },

        /**
         * 将所有的3D模型的ID修改成对应的2D的模型ID
         * @param json
         * @private
         */
        _replaceMappingIdAction: function (json) {
            var data2dId = $utils.getSceneEditorModel2dId(json.id);
            json.id = data2dId;
            if (json.children) {
                for (var i in json.children) {
                    var child = json.children[i];
                    this._replaceMappingIdAction(child);
                }
            }
        },

        /**
         * 新增一个jsonObject时,同步创建一个2d的node
         * @param data
         * @private
         */
        _add2dData: function (data) {
            var self = this;
            if (this.synchronizeFilter(null, data)) {
                // if (this.jsonBox.contains(data)) {
                if (!this.box2d.getDataById(data.getObjectId())) {
                    var json = this._replaceMappingId(data);
                    //2D 和 3D 的旋转相反
                    if (json.rotation) {
                        json.rotation[1] *= -1;
                    }
                    var node = make.Default.load(json);
                    node.setClient('id', data.id);
                    this.box2d.add(node);
                    if (node.getChildren && node.getChildren().size() > 0) {
                        node.setClient('magnetic.disabled', node.getClient('magnetic.disabled') ? true : false);
                        var children = node.getChildren();
                        var self = this;
                        children.forEach(function (child) {
                            if (!self.box2d.getDataById(child.getId())) {
                                child.setClient('magnetic.disabled', true);
                                self.box2d.add(child);
                            }
                        });
                    }
                    this.refMap2d[data.getObjectId()] = node;
                    self.resetParentAndChildren(node);
                }
                // }
            }
        },

        resetParentAndChildren: function (data) {
            var self = this;
            var id = data.getId();
            var mid = make.Default.getId(data)
            var type = make.Default.getType(mid);
            if (type == 'door' || type == 'window') {
                return;
            }
            $utils.runDelayTask(id, 1, function () {
                self._resetParentAndChildren(data);
            })
        },

        _resetParentAndChildren: function (data) {

            this.resetParent(data);
            this.resetChildren(data);
        },

        resetParent: function (data) {

            var self = this;
            //console.log('resetParent ********************', data)
            //1 找到data的父亲
            if (data.getHost && data.setHost) {
                var parent = this.getParent(data);
                //console.log('parent', parent);
                if (parent) {
                    if (parent != data.getHost()) {
                        //console.log('set parent ');
                        data.setHost(parent);
                        data.setClient('parentId', parent.getId());
                        var jsonObject = this.refMapJson[data.getId()];
                        if (jsonObject) {
                            jsonObject.setParentId(parent.getId())
                        } else {
                            console.warn('2D对象参数与jsonObject不匹配, id2d=' + data.getId(), data, this.refMapJson);
                        }
                    }
                } else {
                    //console.log('clear parent ');
                    //data.setParent(null);
                    data.setHost(null);
                    data.setClient('parentId', null);
                    this.refMapJson[data.getId()].setParentId(null)
                }
            }
        },

        resetChildren: function (data) {

            var self = this;
            //2 找到data的孩子
            var children = this.getChildren(data);
            //console.log('children', children);
            children.forEach(function (child) {
                if (child.getHost && child.setHost) {
                    if (data != child.getHost()) {
                        //console.log('child change parent ', child);
                        child.setHost(data);
                        child.setClient('parentId', data.getId());
                        self.refMapJson[child.getId()].setParentId(data.getId())
                    }
                }
            })
        },


        getParent: function (node) {
            var parent = this._getParent(node);
            if (!parent) {
                //如果不存在父亲节点,并且不是外墙,将外墙设置为父亲节点
            }
            return parent;
        },

        /**
         * 是否是父亲层, 只有楼层, 机房, 通道有孩子
         * @param id
         * @returns {boolean}
         * @private
         */
        _isFatherLayer: function (id) {
            return id == idcLayer.wall || id == idcLayer.area || id == idcLayer.channel;
        },

        _getParent: function (node) {

            var centerLocation = node.getCenterLocation();
            var layerId = node.getLayerId();
            var layerBox = this.box2d.getLayerBox();
            var layerBoxSize = layerBox.size();
            //外墙的孩子(柱子之类)或者内墙的孩子(水浸线)的父亲必须是外墙
            var isWallChild = (layerId == idcLayer.area) ||
                (layerId == idcLayer.innerWall) ||
                (layerId == idcLayer.wallChild) ||
                (layerId == idcLayer.innerWallChild);
            if (isWallChild) {
                for (var j = 0; j < this.box2d.size(); j++) {
                    var data = this.box2d.getDataAt(j);
                    if (data.getLayerId() == idcLayer.wall) {

                        if ($utils.isNodeInNode(data, node)) {
                            return data;
                        }
                    }
                }
            } else {
                for (var i = layerBoxSize - 1; i >= 0; i--) {
                    var layer = layerBox.getDataAt(i);
                    //如果是上层或当前层,跳过
                    if (layer.getId() >= layerId) {
                        continue;
                    }
                    //只有楼层, 机房, 通道有孩子
                    if (!this._isFatherLayer(layer.getId())) {
                        continue
                    }
                    //不能为外墙的孩子(柱子,门窗) 内墙的孩子(门窗) 内墙的孩子
                    if (layer.getId() == idcLayer.wallChild ||
                        layer.getId() == idcLayer.innerWallChild ||
                        layer.getId() == idcLayer.innerWall) {
                        continue;
                    }
                    for (var j = 0; j < this.box2d.size(); j++) {
                        var data = this.box2d.getDataAt(j);
                        if (data.getLayerId() == layer.getId()) {
                            if ($utils.isNodeInNode(data, node)) {
                                return data;
                            }
                        }
                    }
                }
            }
        },

        getChildren: function (node) {
            var layerId = node.getLayerId();
            //只有楼层, 机房, 通道有孩子
            if (!this._isFatherLayer(layerId)) {
                return [];
            }
            var children = this._getChildren(node);
            //children 要过滤掉 父亲不是node的节点
            return children;
        },

        _getChildren: function (node) {

            var result = [];
            var location = node.getLocation();
            var size = node.getSize();
            var rect = {
                x: location.x,
                y: location.y,
                width: size.width,
                height: size.height
            }
            var layerId = node.getLayerId();
            var layerBox = this.box2d.getLayerBox();
            var layerBoxSize = layerBox.size();
            for (var i = 0; i < layerBoxSize; i++) {
                var layer = layerBox.getDataAt(i);
                //如果更底层或当前层,跳过
                if (layer.getId() <= layerId) {
                    continue;
                }
                //外墙的孩子(柱子,门窗) 内墙的孩子(门窗) 内墙的等元素没有孩子
                if (layer.getId() == idcLayer.wallChild ||
                    layer.getId() == idcLayer.innerWallChild ||
                    layer.getId() == idcLayer.innerWall) {
                    continue;
                }
                for (var j = 0; j < this.box2d.size(); j++) {
                    var data = this.box2d.getDataAt(j);
                    var centerLocation = data.getCenterLocation();
                    if (data.getLayerId() == layer.getId()) {

                        //if ($utils.isPointInRect(centerLocation, rect)) {
                        //    var p = this.getParent(data);
                        //    if (p == node) {
                        //        result.push(data);
                        //    }
                        //}
                        if ($utils.isNodeInNode(node, data)) {
                            var p = this.getParent(data);
                            if (p == node) {
                                result.push(data);
                            }
                        }
                    }
                }
            }
            return result;
        }
    });

    nsp.edit.Edit2D = function (jsonBox, editor) {
        this.jsonBox = jsonBox || new nsp.edit.JsonBox();
        this.editor = editor;
        this._init();
        this.loadDataFlag = false;

    }
    nsp.edit.Edit2D.CONTAINER_CLASS = 'edit2d-container';
    twaver.Util.ext(nsp.edit.Edit2D, Object, {
        _init: function () {
            //create left menu
            this.accordionPane = new doodle.AccordionPane();
            var self = this;
            /*this.accordionPane.ondrag = function (e, item) {
             if (!self.currentItem) {
             self.currentItem = item;
             self.dragNode = make.Default.load(item.id);
             self.dragNode.setClient('id', item.id);
             }
             }*/

            this.network2d = new nsp.edit.GridNetwork();
            this.network2d.setMinZoom(0.1);
            this.network2d.setMaxZoom(5);
            this.box = this.network2d.getElementBox();
            //create property sheet
            var sheet = this.sheet = new twaver.controls.PropertySheet(this.box);
            $utils.initPropertySheet(sheet);

            //create network2d
            this.network2dView = this._initNetwork2d();
            // this._initLayers2d();

            this.clientBidQuickFinder = new twaver.QuickFinder(this.box, 'bid', 'client');
            var bridge = new nsp.edit.BoxBridge(this.box, this.jsonBox);
            bridge.bind();
            //register image
            //this._registerImage();
            //this.addPropertySheetListener();
            // this.setDragAndDropImage(this.network2d.getView());


            this.network2d.addInteractionListener(function (e) {
                //console.log(e);
                if (e.kind == 'doubleClickElement') {
                    this.doubleClickRackHandler && this.doubleClickRackHandler(e.element, this.box);
                }
            }, this);

            this.box.getSelectionModel().addSelectionChangeListener(this.handleSelectionChange, this);

            this.editor.propertySheetBox.append(this.sheet.getView());
            this.editor.accordionPaneBox.append(this.accordionPane.getView());
            this.editor.networkBox.append(this.network2dView);
        },

        createNodesByJson: function (jsons) {
            $utils.createJsonObject(this.jsonBox, jsons);
            this.box.getSelectionModel().clearSelection();
        },
        zoomOverview: function () {
            this.network2d.zoomOverview();
        },
        setDragAndDropImage: function (view) {
            var self = this;
            DragAndDrop.setDropTarget(view, {
                dropEffect: 'copyMove',
                ondrop: function (e, data) {
                    // if (self.isHost(self.dragNode)) {
                    //     var endPoint = self.network2d.getLogicalPoint(e);
                    //     var node = self.loadParent('', {location: [endPoint.x, endPoint.y]}, self.dragNode);
                    //     setTimeout(function () {
                    //         self.network2d.zoomOverview();
                    //     }, 10);
                    // } else {

                    //     box.getSelectionModel().clearSelection();
                    //     box.getSelectionModel().appendSelection(self.dragNode);
                    //     self.dragNode.setStyle('whole.alpha', 1);
                    //     self._resetPropertySheet();
                    //     self.resetChildNodeLocation(self.dragNode);
                    // }
                    if (self.dragNode) {
                        self.dragNode = null;
                        self.currentItem = null;
                    }

                },
                ondragover: function (e) {
                    e.preventDefault();
                    // e.dataTransfer.dropEffect = 'move';
                    // DragAndDrop.setDragImage('./images/bbb.png',e);
                    // e.dataTransfer.setDragImage('./images/bbb.png',0.5, 0.5);

                    //console.log(self.currentItem);
                    //判断拖拽的是否是子节点
                    if (self.dragNode) {

                        //判断是否有剩余空间可以放置
                        // var size = self.getSize(self.dragNode);
                        // if (!self.parentNode || !self._haveSpace(size, self.dragNode)) {
                        //     e.dataTransfer.dropEffect = 'none';
                        //     return;
                        // }
                        //如果没有添加子节点,那么添加
                        if (!self.dragNode.isAddInBox) {
                            self.dragNode.isAddInBox = true;
                            self.dragNode.setStyle('whole.alpha', 0.7);
                            self.box.add(self.dragNode);
                        }
                        var endPoint = self.network2d.getLogicalPoint(e);
                        var tx = endPoint.x;
                        var ty = endPoint.y;
                        ty -= self.dragNode.getSize().height / 2;
                        self.dragNode.setLocation(tx, ty);
                        // endPoint = self.formatLocation(self.dragNode, tx, ty);
                        // if (endPoint) {

                        // } else {
                        //     self.resetChildNodeLocation(self.dragNode);
                        // }
                    }

                },
                ondragleave: function (e) {
                    if (self.dragNode) {
                        if (self.dragNode.isAddInBox) {
                            self.box.remove(self.dragNode);
                        }
                        self.dragNode = null;
                        self.currentItem = null;
                    }

                }
            });

        },
        //addPropertySheetListener: function () {
        //    var box = this.sheet.box;
        //    box.addDataPropertyChangeListener(this._handleSheetPropertyChanged, this);
        //},
        //_registerImage: function () {
        //
        //},
        /*_initLayers2d: function () {
         var box2d = this.network2d.getElementBox();
         var layerBox = box2d.getLayerBox();
         var defaultLayers = ["floorLayer"];
         for (var i = 0; i < defaultLayers.length; i++) {
         var layerId = defaultLayers[i];
         if (!layerBox.getDataById(layerId)) {
         var layer = new twaver.Layer(layerId);
         layerBox.add(layer);
         }
         }
         },*/
        _initNetwork2d: function () {
            var listener = new nsp.edit.interaction.RoomListener(this.network2d, this.propertySheetPane, this.jsonBox);
            listener.initRoomSettings();
            var self = this;
            var ruler = this.ruler = new nsp.edit.Ruler(this.network2d);

            ruler.getView().setAttribute('class', 'room-ruler');
            ruler.setShowGuides(false);
            ruler.setShowRuler(true);
            this.network2d.getLabel = function (data) {
                if ($utils.isEditModel(data)) {
                    var bid = data.getClient('bid');
                    if (bid && bid.trim().length > 0) {
                        return bid;
                    }
                    return data.getClient("label");
                }
            }
            return ruler.getView();
        },
        layoutGUI: function () {
            this.ruler.invalidate();
        },

        getJsonBox: function () {
            return this.jsonBox;
        },
        getRegionJson: function (id) {
            var result = null;
            var self = this;
            result = this.jsonBox.toJson(function (d) {
                return self._isRegion(d, id);
            });
            return result;
        },
        _isRegion: function (data, id) {
            var type = data.type;
            if (id && id != data.getId()) {
                return false;
            }
            if (type == 'area-rect' || type == 'area-round' || type == 'area-polygon') {
                return true;
            }
            return false;
        },
        loadData: function () {
            var box = this.network2d.getElementBox();
            if (!this.loadDataFlag) {
                this.loadDataFlag = true;

                nsp.edit.model.model2d.loadData(box, JSON.parse(window.localStorage.getItem('scene')) || []);
                //nsp.edit.model.model2d.loadData(box, JSON.parse(window.localStorage.getItem('region')) || []);
            }
            var regions = [];
            box.forEach(function (data) {
                if (data.getClient('type') == 'area') {
                    regions.push(data);
                }
            });
            regions.forEach(function (region) {
                box.remove(region);
            });
            nsp.edit.model.model2d.loadData(box, JSON.parse(window.localStorage.getItem('region')) || []);
        },
        getObject2dById: function (id) {
            return id ? this.clientBidQuickFinder.findFirst(id) : null;
        },
        //_handleSheetPropertyChanged: function (e) {
        //    if (!this.propertySheetPane._setValued) {
        //        return;
        //    }
        //    this.jsonObj = this.propertySheetPane.jsonObj;
        //    var p = e.property, newValue = e.newValue;
        //    if (p.startsWith('C:')) {
        //        p = p.replace('C:', '');
        //        this.jsonObj[p] = newValue;
        //    }
        //
        //    // var rack = make.Default.load(this.jsonObj);
        //    // this.network3d.getDataBox().clear();
        //    // this.network3d.getDataBox().addByDescendant(rack);
        //    // this._currentModel = rack;
        //    // rack.setClient('data',this.jsonObj);
        //    this.fireModelPropertyChange(rack, p, e.oldValue, e.newValue);
        //},
        doubleClickRackHandler: function (element, box) {

        },
        handleSelectionChange: function () {

            //if(!this.editor.isPropertySheetVisible()){
            //    return;
            //}
            //var data = this.box.getSelectionModel().getLastData();
            //if (data) {
            //    var eleId = $utils.getSceneEditorModel2dId(data.getClient('id'));
            //    var result = this.propertySheetPane.setElementId(data.getClient('modelId') || eleId);
            //    if (result) {
            //        this.editor.propertySheetBox.show();
            //        this.editor.resetPropertySheetBoxSize(this.propertySheetPane.sheet);
            //    } else {
            //        this.editor.propertySheetBox.hide();
            //    }
            //} else {
            //    this.editor.propertySheetBox.hide();
            //}
            if (!this.editor.isPropertySheetVisible()) {
                return;
            }
            var self = this;
            var propBox = self.sheet.getPropertyBox();
            propBox.clear();
            var selection = this.box.getSelectionModel();
            if (selection.size() != 1) {
                propBox.clear();
                this.editor.propertySheetBox.hide();
            } else {
                this.editor.propertySheetBox.show();
                var node = selection.getLastData();
                var id = make.Default.getId(node);
                id = $utils.getSceneEditorModel2dId(id);
                $utils.addProperties(propBox, make.Default.getModelDefaultParameterProperties(id));
                self.editor.resetPropertySheetBoxSize(this.sheet);
            }
        },
    })
    nsp.edit.Edit3D = function (jsonBox, editor) {
        this.jsonBox = jsonBox || new nsp.edit.JsonBox();
        this.editor = editor;
        this._init();
        this.isZoom = false;
        this.afterRefreshNetwork3d = null;

    }
    twaver.Util.ext(nsp.edit.Edit3D, Object, {
        _init: function () {
            //create network3d
            this.network3dView = this._initNetwork3d();
            //create container, add all components into the container

            this.jsonBox.addDataBoxChangeListener(this._handleJsonBoxChange, this);

            this.editor.contentPane3d.append(this.network3dView);
        },
        _initNetwork3d: function () {
            var network3d = this.network3d = new mono.Network3D();
            var camera = new mono.PerspectiveCamera(30, 1.5, 50, 20000);
            network3d.setCamera(camera);
            camera.p(638, 2571, 2763);

            network3d.setClearColor('#000000');
            network3d.setClearAlpha(0);
            network3d.setBackgroundImage('./images/bg_network.jpg')
            // camera.look(new mono.Vec3(922, 0, 385));

            var interaction = network3d.getDefaultInteraction();
            interaction.yLowerLimitAngle = Math.PI / 180 * 2;
            interaction.yUpLimitAngle = Math.PI / 2;
            interaction.maxDistance = 10000;
            interaction.minDistance = 50;
            interaction.zoomSpeed = 3;
            interaction.panSpeed = 0.2;
            network3d.setInteractions([interaction]);
            // network3d.setShowAxis(true);

            var box = this.box = network3d.getDataBox();
            var pointLight = new mono.PointLight(0xFFFFFF, 0.1);
            pointLight.setPosition(8000, 8000, 8000);
            box.add(pointLight);

            box.add(new mono.AmbientLight('white'));

            network3d.getRootView().setAttribute('class', 'network3d-view');
            var self = this;
            var handleDoubleClick = function (e, network) {
                var self = this;
                var camera = network.getCamera();
                var interaction = network.getDefaultInteraction();
                var firstClickObject = $utils.findFirstObjectByMouse(network, e);
                if (firstClickObject) {
                    var element = firstClickObject.element;
                    var newTarget = firstClickObject.point;
                    var oldTarget = camera.getTarget();
                    if (element.getClient('animation')) {

                        //close rack door
                        if (element.getClient('type') == 'rack_door' && element.getClient('animated')) {
                            //move in equipment
                            var equipments = element.getParent().getChildren().toList(function (item) {
                                return element != item && item.getClient('animated');
                            });
                            var size = equipments.size();
                            var currCount = 0;
                            if (size > 0) {
                                equipments.forEach(function (equipment) {
                                    make.Default.playAnimation(equipment, equipment.getClient('animation'), function () {
                                        currCount++;
                                        if (currCount == size) {
                                            make.Default.playAnimation(element, element.getClient('animation'));
                                        }
                                    });
                                })
                            } else {
                                make.Default.playAnimation(element, element.getClient('animation'));
                            }
                        } else {
                            make.Default.playAnimation(element, element.getClient('animation'));
                        }
                    } else {
                        $utils.animateCamera(camera, interaction, oldTarget, newTarget);
                    }
                    if (element.getClient('dbl.func')) {
                        var func = element.getClient('dbl.func');
                        func(element, network, firstClickObject, e);
                    } else if (element.getParent() && element.getParent().getClient('dbl.func')) {
                        var func = element.getParent().getClient('dbl.func');
                        func && func(element.getParent(), network, firstClickObject, e);
                    }
                } else {
                    var oldTarget = camera.getTarget();
                    var newTarget = new mono.Vec3(0, 0, 0);
                    $utils.animateCamera(camera, interaction, oldTarget, newTarget);
                }
            }

            network3d.getRootView().addEventListener('dblclick', function (e) {
                handleDoubleClick(e, network3d);
            });

            return network3d.getRootView();
        },

        refreshNetwork3d: function () {
            var self = this;
            var box = this.network3d.getDataBox();
            box.clear();
            var datas = this.jsonBox.toJson();
            var object3ds = make.Default.load(datas, function (object3ds) {
                if (object3ds && object3ds.length > 0) {
                    for (var i = 0; i < object3ds.length; i++) {
                        var object3d = object3ds[i];
                        box.addByDescendant(object3d);
                        object3d.setClient('dbl.func', function (element, network) {
                            self.doubleClickHandler(element, box);
                        })
                    }
                    //FIXME 目前box.clear()后, object.clonePrefab()的复制对象,添加到box中无法显示,采用新加入一个cube然后在移除的方式规避问题
                    setTimeout(function () {
                        var cube = new mono.Cube(0.1, 0.1, 0.1)
                        box.add(cube);
                        setTimeout(function () {
                            box.remove(cube);
                        }, 500)
                    }, 500)
                    if (self.afterRefreshNetwork3d) self.afterRefreshNetwork3d();
                }
            });
            if (!this.isZoom) {
                this.zoomToOverview();
            }
        },

        findByBID: function (bid) {
            if (!this.bidQuickFinder)
                this.bidQuickFinder = new mono.QuickFinder(this.network3d.getDataBox(), 'bid', 'client');
            return this.bidQuickFinder.findFirst(bid);
        },
        doubleClickHandler: function (element, box) {

        },
        zoomToOverview: function () {
            this.isZoom = true;
            this.network3d.zoomEstimateOverview(45);

            var bb = this.network3d.getNetworkBoundingBox();
            console.log(bb);

            var camera = this.network3d.getCamera();
            var p = camera.p();
            var t = camera.t();
            camera.setPosition(p.x + 2500, p.y + 3500, p.z + 3500);
            setTimeout(function () {
                mono.Utils.playCameraAnimation(camera, new mono.Vec3(p.x + 500, p.y + 500, p.z + 500), t, 500);
            }, 1000);
        },
        getView: function () {
            return this.network3dView;
        },
        getJsonBox: function () {
            return this.jsonBox;
        },
        _handleJsonBoxChange: function (e) {
            kind = e.kind;
            if (kind == 'clear') {
                this.network3d.getDataBox().clear();
            }
        },
    })
    nsp.edit.EditDrop = function () {
        this.dropFunctionMap = {};
        this.registerDropFunction("model", this.onModelDrop);
        this.registerDropFunction("default", this.onDefaultDrop);
    };

    twaver.Util.ext(nsp.edit.EditDrop, Object, {
        registerDropFunction: function (dragType, func) {
            this.dropFunctionMap[dragType] = func;
        },
        onDrop: function (network, dragData) {
            if (typeof dragData === 'string') {
                dragData = JSON.parse(dragData);
            }
            var dragType = dragData.dragType;
            var func = this.dropFunctionMap[dragType];
            if (func) {
                func(network, dragData);
            } else {
                this.onDefaultDrop(network, dragData);
            }
        },

        onModelDrop: function (network, dragData) {
            var model = dragData.model;
            if (model) {
                console.log("load model : " + model);
            }
        },

        onDefaultDrop: function (network, dragData) {
            console.log("onDefaultDrop");
            network.setInteractions([new nsp.edit.interaction.RoomDragInteraction(network)]);
        },
    });

    doodle.ImportDxf = nsp.edit.ImportDxf = function (scale) {
        this.scale = scale || 1;
    }

    twaver.Util.ext(nsp.edit.ImportDxf, Object, {
        loadDxf: function (data, autoCreateId) {
            var self = this;
            if (data instanceof File) {
                if (data.name.match(/\.dxf$/i)) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        self.loadDxf(e.target.result, autoCreateId);
                    };
                    reader.readAsText(data);
                } else {
                    alert('Only dxf file is supported');
                }
            } else {
                return self._loadDxfFile(data, autoCreateId);
            }
        },

        _loadDxfFile: function (data, autoCreateId) {
            var self = this;
            self.data = data;
            var returnDatas = [];
            var parser = self.parser = new dxf.Dxf();
            parser.parse(data);
            var minY = Number.POSITIVE_INFINITY,
                maxY = Number.NEGATIVE_INFINITY,
                minX = Number.POSITIVE_INFINITY,
                maxX = Number.NEGATIVE_INFINITY,
                walls = [];

            function computeMaxMin(entity) {
                var type = make.Default.getType(entity.attrib.layer);
                if (type && (type == 'wall')) {
                    if (entity instanceof dxf.LineData) {
                        minY = entity.y1 < minY ? entity.y1 : minY;
                        minY = entity.y2 < minY ? entity.y2 : minY;
                        maxY = entity.y1 > maxY ? entity.y1 : maxY;
                        maxY = entity.y2 > maxY ? entity.y2 : maxY;
                        minX = entity.x1 < minX ? entity.x1 : minX;
                        minX = entity.x2 < minX ? entity.x2 : minX;
                        maxX = entity.x1 > maxX ? entity.x1 : maxX;
                        maxX = entity.x2 > maxX ? entity.x2 : maxX;
                    } else if (entity instanceof dxf.PolylineData) {
                        entity.points.forEach(function (vertex) {
                            minY = vertex.y < minY ? vertex.y : minY;
                            maxY = vertex.y > maxY ? vertex.y : maxY;
                            minX = vertex.x < minX ? vertex.x : minX;
                            maxX = vertex.x > maxX ? vertex.x : maxX;
                        });
                    } else if (entity instanceof dxf.InsertData) {

                    }
                } else if (entity instanceof dxf.InsertData) { //后续添加
                    if (entity.name === 'road') {
                        var datas = self.getEntitiesFromInsertData(entity);
                        datas.forEach(function (data) {
                            computeMaxMin(data);
                        });
                    }
                }
            };

            parser.sections.entities.forEach(function (entity) {
                computeMaxMin(entity);
            });

            self.minY = minY, self.maxY = maxY, self.minX = minX, self.maxX = maxX;


            //封装json数据,遍历所有的json对象
            var jsons = [];
            //1.wall
            var walls = self.walls = [];
            parser.sections.entities.forEach(function (entity) {
                var layerName = entity.attrib.layer;
                var type = make.Default.getType(layerName);
                if (type == 'wall' || type == 'innerWall') {
                    self.createJsonArray(entity, jsons, layerName);
                }
            });

            //2.door, window
            parser.sections.entities.forEach(function (entity) {
                var layerName = entity.attrib.layer;
                var type = make.Default.getType(layerName);
                if (type == 'door') {
                    self.createBlockJson(entity, layerName, walls, 10);
                } else if (type == 'window') {
                    self.createBlockJson(entity, layerName, walls, 50);
                }
            });

            var texts = [];
            var scale = self.scale;
            //3. text entity instanceof dxf.MTextData
            parser.sections.entities.forEach(function (entity) {
                var layerName = entity.attrib.layer;
                if (entity instanceof dxf.MTextData) {
                    var x = (entity.ipx + entity.width / 2 * Math.cos(entity.angle)) * scale;
                    var y = -(entity.ipy + entity.height / 2 * Math.sin(entity.angle)) * scale;
                    texts.push({
                        id: layerName,
                        point: {
                            x: x,
                            y: y,
                        },
                        text: entity.text,
                        entity: entity,
                    })
                } else if (entity instanceof dxf.TextData) {
                    var x = (entity.ipx) * scale;
                    var y = -(entity.ipy) * scale;
                    texts.push({
                        id: layerName,
                        point: {
                            x: x,
                            y: y,
                        },
                        text: entity.text,
                        entity: entity,
                    })
                }
            });


            //4. other
            parser.sections.entities.forEach(function (entity) {
                var layerName = entity.attrib.layer;
                var type = make.Default.getType(layerName);
                if (type == 'wall' || type == 'innerWall' || type == 'door' || type == 'window') { } else {
                    self.createJsonArray(entity, jsons, layerName, texts);
                }
            });
            //console.log(texts);
            if (autoCreateId && jsons && jsons.length > 0) {
                var typeIdMap = {};
                jsons.forEach(function (item) {
                    if (!item.client || item.client.bid) {
                        var id = item.id;
                        if (!typeIdMap[id]) {
                            typeIdMap[id] = 1;
                        }
                        var oid = id + '_' + typeIdMap[id]++;
                        item.objectId = oid;
                        item.client = item.client || {};
                        item.client.bid = oid;
                    }
                })
            }
            return jsons;
        },

        createBlockJson: function (entity, id, walls, height) {
            var self = this;
            var p1 = this.translatePoint({ x: entity.x1, y: entity.y1 });
            var p2 = this.translatePoint({ x: entity.x2, y: entity.y2 });
            var wall;
            walls.some(function (item) {
                index = self.getPointIndex(item, p1)
                if (index < 0) {
                    index = self.getPointIndex(item, p2);
                }
                if (index >= 0) {
                    wall = item;
                }
                return wall != null;
            });
            if (wall == null || index < 0) {
                return;
            }

            var point = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
            var offset = this.getPointOffset(wall, point, index);
            var rotateY = Math.atan((p1.y - p2.y) / (p1.x - p2.x));
            wall.children = wall.children || [];
            var width = Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
            var wallChild = {
                id: id,
                position: [point.x, height, point.y],
                rotation: [0, rotateY, 0],
                width: width,
                client: { edgeIndex: index, offset: offset },
            };
            wall.children.push(wallChild);
        },

        createJsonArray: function (entity, jsons, id, texts) {

            var self = this;
            var str = entity.attrib.layer.split('#');
            var type = make.Default.getType(id);

            var points = this.getEntityPoints(entity, entity.flags === 1);
            // console.log(points);
            var json = {};
            if (type == 'wall' || type == 'innerWall' || type == 'floor' || type == 'area' || type == 'watercable') {
                json = {
                    id: id,
                    data: points,
                }
                if (type == 'wall') {
                    if (points[0].toString() == points[points.length - 1].toString()) {
                        points = points.slice(0, points.length - 1);
                        json.data = points;
                        json.closed = true;
                        json.showFloor = true;
                    }
                }
                if (type == 'area') {
                    var rect = this.getRectOfPoints(points);
                    if (!rect) {
                        return null;
                    }
                    var text = self.getText(id, rect.points, texts);
                    if (text) {
                        json.objectId = text;
                        json.client = json.client || {};
                        json.client.bid = text;
                    }
                }
            } else {
                var rect = this.getRectOfPoints(points);
                if (!rect) {
                    return null;
                }
                var width = rect.max.x - rect.min.x;
                var depth = rect.max.y - rect.min.y;
                var center = rect.center();
                var angle = 0;
                if (entity instanceof dxf.InsertData) {
                    angle = entity.angle;
                }
                json = {
                    id: id,
                    width: width,
                    depth: depth,
                    rotation: [0, angle, 0],
                    position: [center.x, 'floor-top', center.y],
                };

                var ps = self.rotatePoints(rect.points, angle, center);
                var text = self.getText(id, ps, texts);
                if (text) {
                    json.objectId = text;
                    json.client = json.client || {};
                    json.client.bid = text;
                }
            }
            jsons.push(json);
            if (type == 'wall' || type == 'innerWall') {
                this.walls.push(json);
            }
        },
        rotatePoints: function (points, angle, cp) {

            //x0= (x - rx0)*cos(a) - (y - ry0)*sin(a) + rx0 ;

            //y0= (x - rx0)*sin(a) + (y - ry0)*cos(a) + ry0 ;
            var rx0 = cp.x;
            var ry0 = cp.y;
            var cos = Math.cos(angle / 180 * Math.PI);
            var sin = Math.sin(angle / 180 * Math.PI);
            var ps = [];
            points.forEach(function (p) {
                ps.push({
                    x: (p.x - rx0) * cos - (p.y - ry0) * sin + rx0,
                    y: (p.x - rx0) * sin + (p.y - ry0) * cos + ry0,
                });
            });
            return ps;
        },

        getText: function (id, points, texts) {

            for (var i = 0; i < texts.length; i++) {
                var text = texts[i];
                if (text.id == id) {
                    var p = text.point;
                    if (this.isPointInPolygon(points, p)) {
                        var r = text.text;
                        texts.splice(i, 1);
                        return r;
                    }
                }
            }
        },

        translatePoint: function (point) {
            var self = this;
            // var minX = self.minX,minY = self.minY,maxX = self.maxX,maxY = self.maxY;
            var minX = 0,
                minY = 0,
                maxX = 0,
                maxY = 0;
            var w = maxX - minX;
            var h = maxY - minY;
            var hgap = 0,
                vgap = 0,
                scale = this.scale;
            return { x: (point.x - minX - w / 2) * scale + hgap, y: (-point.y + maxY - h / 2) * scale + vgap };

        },

        getFixedNumber: function (num) {
            return parseFloat(num.toFixed(0));
        },

        getEntitiesPoints: function (entities, offsetX, offsetY) {
            var points = [],
                self = this;
            entities.forEach(function (entity) {
                var pts = self.getEntityPoints(entity, entity.flags === 1, offsetX, offsetY)
                var len = points.length;
                if (len >= 4) {
                    if (points[len - 2] === pts[0] && points[len - 1] === pts[1]) {
                        pts.shift(), pts.shift();
                    }
                }
                points.push.apply(points, pts);
            });

            return points;
        },

        getRectOfPoints: function (points) {
            if (!points || points.length / 2 < 2) {
                return null;
            }
            var minY = Number.POSITIVE_INFINITY,
                maxY = Number.NEGATIVE_INFINITY,
                minX = Number.POSITIVE_INFINITY,
                maxX = Number.NEGATIVE_INFINITY;
            var i = 0,
                len = points.length,
                ps = [];
            var compareMinMax = function (x, y) {
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
                ps.push({ x: x, y: y });
            }
            if (len > 0 && points[i] instanceof Array) {
                for (; i < len; i++) {
                    var point = points[i];
                    if (point.length == 2) {
                        compareMinMax(point[0], point[1]);
                    } else if (point.length == 5 && point[0] == 'c') {
                        // compareMinMax(point[1], point[2]);
                        compareMinMax(point[3], point[4]);
                    }
                }
            } else {
                for (; i < len; i += 2) {
                    compareMinMax(points[i], points[i + 1]);
                }
            }

            return {
                min: {
                    x: minX,
                    y: minY,
                },
                max: {
                    x: maxX,
                    y: maxY
                },
                center: function () {
                    return {
                        x: (this.min.x + this.max.x) / 2,
                        y: (this.min.y + this.max.y) / 2,
                    };
                },
                points: ps
            };
        },

        getBulgeVertex: function (bulge, vertex1, vertex2) {
            var point1 = { x: vertex1.x, y: vertex1.y };
            var point2 = { x: vertex2.x, y: vertex2.y };
            var newVertex = {};
            var result = (point1.x - point2.x) * (point1.y - point2.y) * bulge;
            if (result > 0) {
                newVertex = { x: point2.x, y: point1.y };
            } else if (result < 0) {
                newVertex = { x: point1.x, y: point2.y };
            }
            return newVertex;
        },

        getEntityPoints: function (entity, closed, offsetX, offsetY) {
            offsetX = offsetX || 0, offsetY = offsetY || 0;
            var points = [],
                self = this;
            if (entity instanceof dxf.LineData) {
                var point = self.translatePoint({ x: entity.x1 + offsetX, y: entity.y1 + offsetY });
                points.push(this.getFixedNumber(point.x), this.getFixedNumber(point.y));
                point = self.translatePoint({ x: entity.x2 + offsetX, y: entity.y2 + offsetY });
                points.push(this.getFixedNumber(point.x), this.getFixedNumber(point.y));
            } else if (entity instanceof dxf.PolylineData) {
                for (var i = 0; i < entity.points.length; i++) {
                    var vertex = entity.points[i];
                    var point = self.translatePoint({ x: vertex.x + offsetX, y: vertex.y + offsetY });
                    points.push([self.getFixedNumber(point.x), self.getFixedNumber(point.y)]);
                    if (vertex.bulge && Math.abs(vertex.bulge.toFixed(3)) == 0.414) {
                        closed = false;
                        var vertex2 = entity.points[++i] || entity.points[0];;
                        var bulgeVertex = self.getBulgeVertex(vertex.bulge.toFixed(3), vertex, vertex2);
                        var point2 = self.translatePoint({ x: vertex2.x + offsetX, y: vertex2.y + offsetY });
                        var bulgePoint = self.translatePoint({ x: bulgeVertex.x + offsetX, y: bulgeVertex.y + offsetY });
                        points.push(['c', self.getFixedNumber(bulgePoint.x), self.getFixedNumber(bulgePoint.y), self.getFixedNumber(point2.x), self.getFixedNumber(point2.y)]);
                    }
                }

            } else if (entity instanceof dxf.InsertData) {
                var name = entity.name,
                    block = null;
                var blocks = self.parser.sections.blocks;
                var ipx = entity.ipx + offsetX,
                    ipy = entity.ipy + offsetY;
                block = blocks[name];
                points = self.getEntitiesPoints(block.entities, ipx, ipy)
            }
            if (closed) {
                var len = points.length;
                if (points[len - 2] != points[0] || points[len - 1] != points[1]) {
                    points.push(points[0]);
                }
            }
            return points;
        },

        pointArrayToPointObjects: function (pointArray) {
            var i = 0,
                len = pointArray.length;
            var points = [];
            if (pointArray[0] instanceof Array) {
                for (; i < len; i++) {
                    points.push({
                        x: pointArray[i][0],
                        y: pointArray[i][1],
                    });
                }
            } else {
                for (; i < len; i += 2) {
                    points.push({
                        x: pointArray[i],
                        y: pointArray[i + 1],
                    });
                }
            }

            return points;
        },

        isPointOnLine: function (point, point1, point2, width) {
            if (width < 0) {
                width = 0;
            }
            var distance = this.getDistanceFromPointToLine(point, point1, point2);
            return distance <= width &&
                (point.x >= Math.min(point1.x, point2.x) - width) &&
                (point.x <= Math.max(point1.x, point2.x) + width) &&
                (point.y >= Math.min(point1.y, point2.y) - width) &&
                (point.y <= Math.max(point1.y, point2.y) + width);
        },

        getDistanceFromPointToLine: function (point, point1, point2) {
            if (point1.x === point2.x) {
                return Math.abs(point.x - point1.x);
            }
            var lineK = (point2.y - point1.y) / (point2.x - point1.x);
            var lineC = (point2.x * point1.y - point1.x * point2.y) / (point2.x - point1.x);
            return Math.abs(lineK * point.x - point.y + lineC) / (Math.sqrt(lineK * lineK + 1));
        },

        getPointOffset: function (wallJson, point, index) {
            var pts = wallJson.data;
            var points = this.pointArrayToPointObjects(pts);
            var p1 = points[index],
                p2 = points[index + 1];
            p2 = p2 || points[0];

            var offset = 0;
            if (p1.x != p2.x) {
                offset = (point.x - p1.x) / (p2.x - p1.x);
            } else if (p1.y != p2.y) {
                offset = (point.y - p1.y) / (p2.y - p1.y);
            }

            return offset;
        },

        getPointIndex: function (wallJson, point) {
            var pts = wallJson.data;
            var points = this.pointArrayToPointObjects(pts);

            if (points.length < 2) {
                return -1;
            }
            for (var i = 0; i < points.length; i++) {
                if (_twaver.math.getDistance(point, points[i]) <= 10) {
                    return -1;
                }
            }
            var p1 = points[0],
                p2;
            for (var i = 1; i < points.length; i++) {
                p2 = points[i];
                if (this.isPointOnLine(point, p1, p2, 10)) {
                    return i - 1;
                }
                p1 = p2;
            }
            p1 = points[0];
            if (this.isPointOnLine(point, p1, p2, 10)) {
                return points.length - 1;
            }
            return -1;
        },

        isPointInPolygon: function (points, point) {
            var i = 0,
                j = 0,
                c = false,
                size = points.length;
            for (i = 0, j = size - 1; i < size; j = i++) {
                var p1 = points[i];
                var p2 = points[j];
                if (((p1.y > point.y) != (p2.y > point.y)) && (point.x < (p2.x - p1.x) * (point.y - p1.y) / (p2.y - p1.y) + p1.x)) {
                    c = !c;
                }
            }
            return c;
        },

    });


    var ImportVsdx = function (scale) {
        this.scale = scale || 2.54; // 默认保存单位是英寸, 一英寸等于24.5mm
        this.idMap = {

            "机柜": "twaver.idc.rack42",
            "外墙": "twaver.idc.wall",
            "内墙": "twaver.idc.innerWall2",
            "窗户": "twaver.idc.window",
            "门": "twaver.idc.door",
            "柱子": "twaver.idc.column"
        };
        this.positionYMap = {
            door: 10,
            window: 50,
        }
    }

    twaver.Util.ext(ImportVsdx, Object, {

        loadVsdx: function (data, callback, autoCreateId) {
            var self = this;
            if (data instanceof File) {
                if (data.name.match(/\.Vsdx$/i)) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        self.loadVsdx(e.target.result, autoCreateId);
                    };
                    reader.readAsText(data);
                } else {
                    alert('Only Vsdx file is supported');
                }
            } else {
                return self._loadVsdxFile(data, callback, autoCreateId);
            }
        },

        /**
         * 加载 vsdx 文件内容
         * @param data
         * @param autoCreateId
         * @private
         */
        _loadVsdxFile: function (data, callback, autoCreateId) {
            var self = this;
            JSZip.loadAsync(data).then(function (r) {
                //console.log(r);
                self.parseZip(r, callback);
            });
        },

        /**
         * 解析 zip 文件
         * @param zip
         */
        parseZip: function (zip, callback) {

            var self = this;
            var files = zip.files;
            var masters = 'visio/masters/masters.xml'
            var pagePatten = 'visio/pages/page';
            var pageFilePatten = 'visio/pages/pages.xml';

            var masterFile;
            var pageFiles = [];
            for (var name in files) {
                if (name.indexOf(pagePatten) == 0 && name != pageFilePatten) {
                    var pageFile = files[name];
                    pageFiles.push(pageFile);
                } else if (name == masters) {
                    masterFile = files[name];

                }
            }
            this.parseMaster(masterFile, files, function (masterMap) {
                self.masterMap = masterMap;
                var result = [];
                for (var i = 0; i < pageFiles.length; i++) {
                    var pageFile = pageFiles[i];
                    self.parsePage(pageFile, masterMap, function (json) {
                        result.push(json);
                        if (result.length == pageFiles.length) {
                            callback && callback(result);
                        }
                    });
                }
            });
        },

        parseMaster: function (masterFile, files, callback) {

            var self = this;
            //console.log(pageFile);
            masterFile.async('text').then(function (masterInfoContent) {

                var masterInfoXml = self.parseXml(masterInfoContent);
                var masterMap = {};
                var masters = masterInfoXml.childNodes[0].childNodes;
                var count = 0;
                masters.forEach(function (master, index) {

                    var id = master.getAttribute('ID');
                    var name = master.getAttribute('Name');
                    var prompt = master.getAttribute('Prompt');
                    var modelId = prompt || name;
                    modelId = self.idMap[modelId] || modelId;

                    files['visio/masters/master' + (index + 1) + '.xml'].async('text').then(function (masterContent) {

                        var masterXml = self.parseXml(masterContent);
                        var shape = masterXml.childNodes[0].childNodes[0].childNodes[0];
                        var width = self.findCellAttr(shape, 'Width');
                        var height = self.findCellAttr(shape, 'Height');
                        var scale = 1; //parseFloat(self.findCellAttr(shape, 'PageScale') || '1') * 2.54;
                        if (width && height) {
                            masterMap[id] = {
                                id: modelId,
                                width: self.toFloat(width) * scale,
                                height: self.toFloat(height) * scale,
                            }
                        }
                        count++;
                        if (count == masters.length) {
                            callback && callback(masterMap);
                        }
                    })
                })
            })
        },

        parsePage: function (pageFile, masterMap, callback) {

            var self = this;
            //console.log(pageFile);
            pageFile.async('text').then(function (pageContent) {

                var pageXml = self.parseXml(pageContent);
                var json = self.parsePageXml(pageXml, masterMap);
                callback && callback(json);
            })
        },

        /**
         * 解析所有的 page 文件
         * @param pageFile
         * @returns {*}
         */
        parsePageXml: function (pageXml, masterMap) {

            var self = this;
            //console.log(pageXml);
            //if(!pageXml.childNodes || pageXml.childNodes.length ==0){
            //    return;
            //}

            //FIXME 这里要增加必要的校验
            var shapes = pageXml.childNodes[0].childNodes[0].childNodes;

            //过滤出所有 shape 节点

            //封装json数据,遍历所有的json对象

            var jsons = [];

            //door, window
            var wallChildren = this.createWallChildren(shapes, masterMap);

            var wallPath = this.getPath(shapes, masterMap, 'wall');
            var walls = this.addWallChildren(wallPath, wallChildren, false);
            if (walls.length == 0) {
                throw '没有外墙'
            } else if (walls.length > 1) {
                throw '外墙没有闭合'
            }
            var point = this.centerPoint = this.calcCenter(walls);
            this.moveWallToCenter(walls, point);

            var innerWallPath = this.getPath(shapes, masterMap, 'innerWall');
            var innerWalls = this.addWallChildren(innerWallPath, wallChildren, true);
            this.moveWallToCenter(innerWalls, point);

            //other
            var others = this.createOther(shapes, masterMap, point);
            jsons = jsons.concat(walls);
            jsons = jsons.concat(innerWalls);
            //jsons = jsons.concat(wallChildren);
            jsons = jsons.concat(others);
            return jsons;
        },

        parseXml: function (xml) {
            if (window.DOMParser) {
                var parser = new DOMParser();
                return parser.parseFromString(xml, 'text/xml');
            } else {
                xml = xml.replace(/<!DOCTYPE svg[^>]*>/, '');
                var xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
                xmlDoc.async = 'false';
                xmlDoc.loadXML(xml);
                return xmlDoc;
            }
        },

        /**
         * 计算外墙的中心点
         * @param walls
         * @returns {{x: number, y: number}}
         */
        calcCenter: function (walls) {

            var minX = 99999999,
                minY = 99999999,
                maxX = -99999999,
                maxY = -99999999;
            var len = walls.length;
            for (var i = 0; i < len; i++) {
                var wall = walls[i];
                var data = wall.data;
                for (var j = 0; j < data.length; j++) {
                    minX = Math.min(minX, data[j][0]);
                    minY = Math.min(minY, data[j][1]);
                    maxX = Math.max(maxX, data[j][0]);
                    maxY = Math.max(maxY, data[j][1]);
                }
            }
            //计算出楼层的中心点, 移动到中心点处
            var x = (minX + maxX) / 2;
            var y = (minY + maxY) / 2;
            return {
                x: x,
                y: y,
            }
        },

        /**
         * 将墙和墙的孩子移动到中心点
         * @param walls
         * @param center
         */
        moveWallToCenter: function (walls, center) {
            var len = walls.length;
            for (var i = 0; i < len; i++) {
                var wall = walls[i];

                //move point
                var data = wall.data;
                for (var j = 0; j < data.length; j++) {
                    data[j][0] -= center.x;
                    data[j][1] -= center.y;
                }
                //move children
                if (wall.children) {
                    for (var k = 0; k < wall.children.length; k++) {
                        var p = wall.children[k].position;
                        p[0] -= center.x;
                        p[2] -= center.y;
                    }
                }
            }
        },

        /**
         * 添加墙的孩子
         * @param wallPath
         * @param wallChildren
         * @returns {Array}
         */
        addWallChildren: function (wallPath, wallChildren, isInnerWall) {

            var result = [];
            for (var id in wallPath) {
                var path = wallPath[id];
                for (var i in path) {
                    var json = {
                        id: id,
                        position: [0, 0, 0],
                        children: [],
                    };
                    if (!isInnerWall) {
                        json.closed = true;
                        json.showFloor = true;
                    }
                    result.push(json);
                    var lines = path[i];
                    for (var j = 0; j < lines.length; j++) {
                        var line = lines[j];
                        if (json.data) {
                            json.data.push(line.to);
                        } else {
                            json.data = [line.from, line.to];
                        }

                        var shapeId = line.shapeId;
                        if (wallChildren[shapeId]) {
                            for (var k in wallChildren[shapeId]) {
                                var child = wallChildren[shapeId][k];
                                child.client = child.client || {};
                                child.client.edgeIndex = j;
                                if (line.reverse) {
                                    child.client.offset = 1 - child.client.offset;
                                }
                                child.position[0] = (line.to[0] - line.from[0]) * child.client.offset + line.from[0];
                                child.position[2] = (line.to[1] - line.from[1]) * child.client.offset + line.from[1];
                                json.children.push(child);
                            }
                        }
                    }
                    if (!isInnerWall && json.data && json.data.length > 1) {
                        //如果外墙最后一个点和起始点已经闭合, 去掉最后一个点
                        var p0 = json.data[0];
                        var p1 = json.data[json.data.length - 1];
                        if (p0[0] == p1[0] && p0[1] == p1[1]) {
                            json.data.splice(json.data.length - 1, 1);
                        }
                    }
                }
            }
            return result;
        },

        /**
         * 取得外墙或者内墙, 或者房间的顶点信息
         * @param shapes
         * @param masterMap
         * @param type
         */
        getPath: function (shapes, masterMap, makeType) {

            var self = this;

            var pathLineMap = {};
            var lineMap = {};
            shapes.forEach(function (shape) {

                var master = shape.getAttribute('Master');

                if (!masterMap[master]) {
                    console.error('master not exist, master=', master, '  masterMap=', masterMap, '  shape=', shape);
                    return;
                }
                var id = masterMap[master].id;
                var type = make.Default.getType(id);
                if (type == makeType) {
                    if (!pathLineMap[id]) {
                        pathLineMap[id] = [];
                    }

                    //Y 值需要取反
                    var begX = self.toFloat(self.findCellAttr(shape, 'BeginX'));
                    var begY = self.toFloat(self.findCellAttr(shape, 'BeginY')) * -1;
                    var endX = self.toFloat(self.findCellAttr(shape, 'EndX'));
                    var endY = self.toFloat(self.findCellAttr(shape, 'EndY')) * -1;
                    var width = self.toFloat(self.findCellAttr(shape, 'Width'));
                    var line = {
                        shapeId: shape.getAttribute('ID'),
                        from: [begX, begY],
                        to: [endX, endY],
                        width: width,
                        id: id,
                    };
                    //判断起始端点是否有连接到其他对象上
                    var RX1 = self.findChild(self.findChild(self.findChild(shape, 'Section', 'User'), 'Row', 'RX1'), 'Cell', 'Value');
                    var RY1 = self.findChild(self.findChild(self.findChild(shape, 'Section', 'User'), 'Row', 'RY1'), 'Cell', 'Value');
                    if (RX1 && RY1) {
                        //<Row N='RX1'>
                        //        <Cell N='Value' V='3.858267716535434' U='DL' F='Sheet.310!EndX'/>
                        //</Row>
                        var f = RX1.getAttribute('F').replace('Sheet.', '');
                        var fa = f.split('!');
                        line.fromShape = fa[0];
                        if (fa[1].indexOf('End') >= 0) {
                            line.fromTo = true;
                        } else {
                            line.fromFrom = true;
                        }

                    }
                    //判断结束端点是否有连接到其他对象上
                    var LX2 = self.findChild(self.findChild(self.findChild(shape, 'Section', 'User'), 'Row', 'LX2'), 'Cell', 'Value');
                    var LY2 = self.findChild(self.findChild(self.findChild(shape, 'Section', 'User'), 'Row', 'LY2'), 'Cell', 'Value');
                    if (LX2 && LX2) {
                        //<Row N='LX2'>
                        //        <Cell N='Value' V='7.795275590551183' U='DL' F='Sheet.317!EndX'/>
                        //</Row>
                        var f = LX2.getAttribute('F').replace('Sheet.', '');
                        var fa = f.split('!');
                        line.toShape = fa[0];
                        if (fa[1].indexOf('End') >= 0) {
                            line.toTo = true;
                        } else {
                            line.toFrom = true;
                        }
                    }
                    pathLineMap[id].push(line);
                    lineMap[line.shapeId] = line;

                    shape.dirty = true;
                }
            });

            var pathMap = {};
            //按类型分组, 拼接 line 成一条 path
            for (var id in pathLineMap) {

                var lines = pathLineMap[id];

                var path = [];
                pathMap[id] = path;
                //正向查找所有连接在一起的线路
                while (lines.length > 0) {

                    var pathLine = [];
                    var line0 = lines[0];
                    lines.splice(0, 1);
                    delete lineMap[line0.shapeId];

                    var lineModel = {
                        shapeId: line0.shapeId,
                        from: line0.from,
                        to: line0.to,
                    };
                    pathLine.push(lineModel);

                    if (lines.length > 0 && line0.fromShape && line0.toShape) {

                        //两头连接
                        walk(id, pathLine, lines, lineMap, line0, true);
                        walk(id, pathLine, lines, lineMap, line0, false);
                    } else if (lines.length > 0 && line0.fromShape) {

                        //起始点连接到其他线路
                        walk(id, pathLine, lines, lineMap, line0, false);

                    } else if (lines.length > 0 && line0.toShape) {

                        //结束点连接到其他线路
                        walk(id, pathLine, lines, lineMap, line0, true);
                    }

                    path.push(pathLine);
                }

                function reverseLine(line, isForward) {
                    var ff = line.from;
                    line.from = line.to;
                    line.to = ff;

                    if (!isForward && line.toShape) {

                        line.fromShape = line.toShape;
                        delete line.toShape;
                        line.fromFrom = line.toFrom;
                        line.fromTo = line.toTo;
                        delete line.toFrom;
                        delete line.toTo;
                    } else if (isForward && line.fromShape) {
                        line.toShape = line.fromShape;
                        delete line.fromShape;
                        line.toFrom = line.fromFrom;
                        line.toTo = line.fromTo;
                        delete line.fromFrom;
                        delete line.fromTo;
                    }
                    line.reverse = true;
                }

                /**
                 * 按指定方向, 将独立的 path 按顺序连接起来
                 * @param pathLine 保存轨迹
                 * @param lines 所有线段
                 * @param lineMap 所有线段
                 * @param line 当前线段
                 * @param isForward 正向
                 */
                function walk(id, pathLine, lines, lineMap, line, isForward) {

                    var shapeId = isForward ? line.toShape : line.fromShape;
                    if (!shapeId) {
                        return;
                    }
                    var nextLine = lineMap[shapeId];
                    if (!nextLine) {
                        return;
                    }
                    //连接的不在一个层
                    if (nextLine.id != id) {
                        return;
                    }
                    var index = lines.indexOf(nextLine);
                    lines.splice(index, 1);
                    delete lineMap[shapeId];

                    if ((isForward && line.toTo) || (!isForward && line.fromFrom)) {
                        reverseLine(nextLine, isForward);
                    }
                    var lineModel = {
                        shapeId: nextLine.shapeId,
                        from: nextLine.from,
                        to: nextLine.to,
                        reverse: nextLine.reverse,
                    };
                    if (isForward) {

                        pathLine.push(lineModel);
                    } else {
                        pathLine.splice(0, 0, lineModel);
                    }
                    walk(id, pathLine, lines, lineMap, nextLine, isForward);
                }
            }

            return pathMap;
        },

        /**
         * 创建墙的孩子
         * @param shapes
         * @param masterMap
         * @returns {Array}
         */
        createWallChildren: function (shapes, masterMap) {

            var self = this;
            var wallChildren = {};
            shapes.forEach(function (shape) {

                var master = shape.getAttribute('Master');

                if (!masterMap[master]) {
                    console.error('master not exist, master=', master, '  masterMap=', masterMap, '  shape=', shape);
                    return;
                }
                var id = masterMap[master].id;
                var type = make.Default.getType(id);
                if (type == 'door' || type == 'window') {

                    //<Cell N='Value' V='0' F='Sheet.296!User.RefLn'/>
                    var VisWallRefLn = self.findChild(self.findChild(self.findChild(shape, 'Section', 'User'), 'Row', 'VisWallRefLn'), 'Cell', 'Value');
                    var PreviousWallParam = self.findChild(self.findChild(self.findChild(shape, 'Section', 'User'), 'Row', 'PreviousWallParam'), 'Cell', 'Value');
                    var f = VisWallRefLn.getAttribute('F').replace("Sheet.", "");
                    var fa = f.split('!');
                    var parentId = fa[0];
                    var offset = parseFloat(PreviousWallParam.getAttribute('V'));
                    var positionY = self.positionYMap[type] || 0;
                    var width = self.toFloat(self.findCellAttr(shape, 'Width'));
                    var x = self.toFloat(self.findCellAttr(shape, 'PinX'));
                    var y = self.toFloat(self.findCellAttr(shape, 'PinY')) * -1;
                    //FIXME 需要计算 offset, 否则无法在 doodle 的2D 视图中显示
                    if (!wallChildren[parentId]) {
                        wallChildren[parentId] = [];
                    }
                    wallChildren[parentId].push({
                        id: id,
                        width: width,
                        position: [x, positionY, y],
                        client: {
                            offset: offset
                        }
                    });
                    shape.dirty = true;
                }
            });
            return wallChildren;
        },

        createOther: function (shapes, masterMap, center) {

            var self = this;
            var objects = [];
            shapes.forEach(function (shape) {

                var master = shape.getAttribute('Master');

                if (!masterMap[master]) {
                    console.error('master not exist, master=', master, '  masterMap=', masterMap, '  shape=', shape);
                    return;
                }
                var id = masterMap[master].id;
                var type = make.Default.getType(id);
                if (type == 'wall' || type == 'innerWall' || type == 'door' || type == 'window') {

                    //
                } else {

                    var object = {};
                    object.id = id;
                    var mp = masterMap[master];
                    var positionY = self.positionYMap[type] || 'floor-top';
                    var width = self.toFloat(self.findCellAttr(shape, 'Width')) || mp.width;
                    var height = self.toFloat(self.findCellAttr(shape, 'Height')) || mp.height;
                    var x = self.toFloat(self.findCellAttr(shape, 'PinX'));
                    var y = self.toFloat(self.findCellAttr(shape, 'PinY')) * -1;
                    var angle = self.toFloat(parseFloat(self.findCellAttr(shape, 'Angle') || '0') * 180 / Math.PI, true);
                    //angle *= -1;
                    angle = (angle + 360) % 360;
                    var Text = self.findChildByTag(shape, 'Text');
                    if (Text) {
                        var children = Text.childNodes;
                        for (var i = 0; i < children.length; i++) {
                            if (children[i].nodeType == 3) {
                                var s = children[i].textContent;
                                if (s.indexOf('\n') == s.length - 1) {
                                    s = s.substr(0, s.length - 1);
                                }
                                object.objectId = s;
                                object.client = object.client || {};
                                object.client.bid = s;
                            }
                        }
                    }
                    object.width = width;
                    object.depth = height;
                    object.position = [x - center.x, positionY, y - center.y];
                    object.rotation = [0, angle, 0];
                    objects.push(object);
                }
            });
            return objects;
        },

        /**
         * 找到指定的属性值
         * @param shape
         * @param name
         * @returns {string}
         */
        findCellAttr: function (shape, name) {

            var children = shape.childNodes;
            var length = children.length;
            for (var i = 0; i < length; i++) {
                var child = children[i];
                if (child.tagName == 'Cell' && child.getAttribute('N') == name) {
                    return child.getAttribute('V');
                }
            }
        },

        /**
         * 找到指定类型的孩子
         * @param parent
         * @param tagName
         * @param filter
         * @returns {*}
         */
        findChild: function (parent, tagName, name) {

            if (!parent) {
                return;
            }
            var children = parent.childNodes;
            if (!children) {
                return;
            }
            var length = children.length;
            for (var i = 0; i < length; i++) {
                var child = children[i];
                if (child.tagName == tagName && child.getAttribute('N') == name) {
                    return child;
                }
            }
        },

        /**
         * 找到指定类型的孩子
         * @param parent
         * @param tagName
         * @returns {*}
         */
        findChildByTag: function (parent, tagName) {

            if (!parent) {
                return;
            }
            var children = parent.childNodes;
            if (!children) {
                return;
            }
            var length = children.length;
            for (var i = 0; i < length; i++) {
                var child = children[i];
                if (child.tagName == tagName) {
                    return child;
                }
            }
        },

        toFloat: function (v, isSkip, n) {
            if (n === undefined) {
                n = 0;
            }
            var f = parseFloat(v);
            if (!isSkip) {
                f = f * this.scale;
            }
            var s = Math.pow(10, n);
            return Math.round(f * s) / (s * 1.0);
        }
    })


    nsp.edit.JsonBox = function () {
        this._dataList = new mono.List();
        this._dataMap = {};

        this._dataBoxChangeDispatcher = new TGL.EventDispatcher();
        this._dataPropertyChangeDispatcher = new TGL.EventDispatcher();
    };

    twaver.Util.ext(nsp.edit.JsonBox, Object, {
        add: function (data) {
            if (!data) {
                return;
            }
            if (arguments.length === 1) {
                index = -1;
            }
            var id = data.getObjectId();
            if (this._dataMap.hasOwnProperty(id)) {
                throw "Data with ID '" + id + "' already exists";
            }
            this._dataList.add(data);
            this._dataMap[id] = data;
            this._dataBoxChangeDispatcher.fire({
                kind: 'add',
                data: data,
                source: this
            });
            data.addPropertyChangeListener(this.handleDataPropertyChange, this);
        },

        contains: function (data) {
            if (data) {
                return this._dataMap[data.getObjectId()] === data;
            }
            return false;
        },

        remove: function (data) {
            if (!data) {
                return;
            }
            this._dataList.remove(data);
            var id = data.getObjectId();
            delete this._dataMap[id];

            this._dataBoxChangeDispatcher.fire({
                kind: 'remove',
                data: data,
                source: this
            });
            data.removePropertyChangeListener(this.handleDataPropertyChange, this);
        },

        getDataById: function (id) {
            return this._dataMap[id];
        },

        removeById: function (id) {
            var data = this.getDataById(id);
            this.remove(data);
        },

        getDatas: function () {
            return this._dataList;
        },

        clear: function (l) {
            if (this._dataList.size() > 0) {
                var datas = this._dataList.toList();
                datas.forEach(function (data) {
                    data.removePropertyChangeListener(this.handleDataPropertyChange, this);
                }, this);
                this._dataList.clear();
                this._dataMap = {};
                this._dataBoxChangeDispatcher.fire({
                    kind: 'clear',
                    datas: datas
                });

            }
        },

        toJson: function (filter) {
            var jsonObject = [];
            var datas = this._dataList;
            // return JSON.stringify(array);
            datas.forEach(function (data) {
                var id = data.getId();
                if (id == 'twaver.idc.door' || id == 'twaver.idc.window') {
                    return;
                }

                var dataObject = {};
                data.serializeJson(data, dataObject);
                if (!filter || filter(data)) {
                    jsonObject.push(dataObject);
                }
            });
            return jsonObject;
        },

        fromJson: function (datas) {

            for (var i = 0; i < datas.length; i++) {
                var dataObject = datas[i];
                var data = null;
                if (dataObject.action === "remove") {
                    this.removeById(dataObject.objectId);
                    continue;
                }
                // update old data
                data = this.getDataById(dataObject.objectId);
                // create new data
                if (!data) {
                    //data = TGL.newInstance(type, dataObject.objectId);
                    data = new nsp.edit.data.JsonObject();
                    data.id = dataObject.objectId;
                }
                data.deserializeJson(data, dataObject);
                if (dataObject.children && dataObject.children.length > 0) {
                    var childrenData = [];
                    for (var j = 0; j < dataObject.children.length; j++) {
                        var child = dataObject.children[j];
                        var childData = new nsp.edit.data.JsonObject(child.objectId);
                        childData.id = child.objectId;
                        childData.deserializeJson(childData, child);
                        childrenData.push(childData);
                    }
                    data.setChildren(childrenData);
                }
                try {
                    this.add(data);
                } catch (e) {
                    console.error(e);
                }

            }
        },

        handleDataPropertyChange: function (e) {
            var data = e.source;
            this.onDataPropertyChanged(data, e);
            this._dataPropertyChangeDispatcher.fire(e);
        },

        onDataPropertyChanged: function (data, e) {

        },

        addDataBoxChangeListener: function (listener, scope, ahead) {
            this._dataBoxChangeDispatcher.add(listener, scope, ahead);
        },

        removeDataBoxChangeListener: function (listener, scope) {
            this._dataBoxChangeDispatcher.remove(listener, scope);
        },

        addDataPropertyChangeListener: function (listener, scope, ahead) {
            this._dataPropertyChangeDispatcher.add(listener, scope, ahead);
        },

        removeDataPropertyChangeListener: function (listener, scope) {
            this._dataPropertyChangeDispatcher.remove(listener, scope);
        },
    });

    /**
     * 场景编辑器
     * 3D场景编辑器，在2D视图中编辑， 3D视图中浏览。默认2D和3D中的模型对应关系是，2D的模型的id等于3D模型的ID加上'.top',doodle.utils和doodle.consts中都有介绍。
     * @param parentView {HTMLDIVElement} 编辑器父容器
     * @constructor
     */
    var SceneEditor = function (parentView) {


        SceneEditor.superClass.constructor.call(this, parentView);

        this.pasteOffsetDy = 0;

        this.contentPane3d = $('<div class="edit3d-container"></div>').appendTo(this.parentView);

        /**
         * scene editor data box
         * 场景编辑器的数据容器
         * @type {nsp.edit.JsonBox}
         */
        this.jsonBox = new nsp.edit.JsonBox();

        /**
         * scene editor 2d view
         * 场景编辑器2d视图, 参照twaver 2D相关知识
         * @type {nsp.edit.Edit2D}
         */
        this.edit2d = this.edit2d = new nsp.edit.Edit2D(this.jsonBox, this);

        /**
         * scene editor 3d view
         * 场景编辑器的3d视图，参照twaver 3D相关知识
         * @type {nsp.edit.Edit3D}
         */
        this.edit3d = new nsp.edit.Edit3D(this.jsonBox, this);

        /**
         * 3d mapping to 2d
         * 3d模型映射到2d模型
         * @type {Object}
         */
        this.model3dTo2dMapping = $consts.sceneEditorModel3dTo2dMapping;

        /**
         * 2d mapping to 3d
         * 2d模型映射到3d模型
         * @type {Object}
         */
        this.model2dTo3dMapping = $consts.sceneEditorModel2dTo3dMapping;

        /**
         * component bar
         * 左侧组件栏
         * @type {doodle.AccordionPane}
         */
        this.accordionPane = this.edit2d.accordionPane;
        this.ruler = this.edit2d.ruler;
        this.network2d = this.edit2d.network2d;
        this.box = this.network2d.getElementBox();

        this.fileIndex = 1;

        this.init();
    }

    SceneEditor.prototype = {

        init: function () {

            var self = this;

            this.edit3d.doubleClickHandler = function (element, box) {
                self.doubleClickHandler3D(element, box);
            }
            this.edit2d.doubleClickRackHandler = function (element, box) {
                self.doubleClickHandler2D(element, box);
            }

            this.addKeyMoveListener(this.network2d);

            // this.refreshAccordion();             //这一句不需要调用在实例化的时候调用
            this.adjustNetwork3dBoundingBox();

            this.show2D();
            this.hide3D();
        },

        adjustNetwork3dBoundingBox: function () {
            mono.Utils.autoAdjustNetworkBounds(this.edit3d.network3d, this.contentPane3d[0], 'clientWidth', 'clientHeight', 0, 0);
        },


        /**
         * double click 3d handler
         * 双击3D对象事件处理
         * @param element {mono.Data} 3d 对象
         * @param box {mono.DataBox} 3d 的 DataBox
         */
        doubleClickHandler3D: function (element, box) {

        },

        /**
         * double click 2d handerl
         * 双击2D对象事件处理
         * @param element {twaver.Data} 2d 对象
         * @param box {twaver.ElementBox} 2d 的 ElementBox
         */
        doubleClickHandler2D: function (element, box) {

        },
        isHost: function (node) {
            return node.getClient('type') == 'wall';
        },

        /**
         * load dxf file
         * 加载dxf的文件内容
         * @param text {string} dxf文件内容
         */
        loadDxfFile: function (text, filter, autoCreateId) {
            var edit2d = this.edit2d;
            var importDxf = new nsp.edit.ImportDxf(0.1);

            var jsons = importDxf.loadDxf(text, autoCreateId);
            if (filter) {
                jsons = filter(jsons);
            }
            jsons.sort(function (o1, o2) {
                if (make.Default.getOtherParameter(o1.id, 'sdkCategory') == 'floor') {
                    return -1;
                } else {
                    return 1;
                }
            });
            edit2d.createNodesByJson(jsons);
            setTimeout(function () {
                edit2d.zoomOverview();
            }, 500);
        },

        loadVsdxFile: function (text, filter, autoCreateId) {
            var edit2d = this.edit2d;
            var importVsdx = new ImportVsdx();
            importVsdx.loadVsdx(text, function (result) {
                var jsons = result[0];
                if (filter) {
                    jsons = filter(jsons);
                }
                jsons.sort(function (o1, o2) {
                    if (make.Default.getOtherParameter(o1.id, 'sdkCategory') == 'floor') {
                        return -1;
                    } else {
                        return 1;
                    }
                });
                edit2d.createNodesByJson(jsons);
                setTimeout(function () {
                    edit2d.zoomOverview();
                }, 500);
            });
        },

        parentResizeHandle: function () {
            SceneEditor.superClass.parentResizeHandle.call(this);
            this.adjustNetwork3dBoundingBox();
        },

        /**
         * align selected data
         * 对齐选中的元素
         * @param type{string} 枚举[left, right, top, bottom, center, middle]
         */
        align: function (type) {
            var self = this;
            if (!type) {
                return;
            }
            var data = this.edit2d.box.getSelectionModel().getSelection();

            //去除选中的parent
            var list = new twaver.List();
            data.forEach(function (node) {
                if (node && !self.isHost(node)) {
                    list.add(node);
                }
            })
            if (!list || list.size() < 2) {
                return;
            }
            make.Default.align(list, type);
        },

        /**
         * flow selected data
         * 均匀分布选中的元素
         * @param type {string} 枚举[hor, ver]
         * @param padding {number} 间距
         */
        flow: function (type, padding) {
            var self = this;
            if (!type) {
                return;
            }
            var data = this.edit2d.box.getSelectionModel().getSelection();
            //去除选中的parent
            var list = new twaver.List();
            data.forEach(function (node) {
                if (node && !self.isHost(node)) {
                    list.add(node);
                }
            })
            if (!list || list.size() < 2) {
                return;
            }
            make.Default.flow(list, type, padding);
        },

        /**
         * refresh accordion
         * 刷新左侧组件栏, 默认是调用doodle.utils.load2dSceneCategory()的结果
         * @param categories {Object[]} default is the result of calling function doodle.utils.load2dSceneCategory()
         */
        refreshAccordion: function (categories) {
            categories = categories || doodle.utils.load2dSceneCategory();
            this.edit2d.accordionPane.setCategories(categories);
        },

        /**
         * show 2d view
         * 显示2D视图
         */
        show2D: function () {
            this.contentPane.show();
            this.edit2d.layoutGUI();
        },

        /**
         * hide 2d view
         * 隐藏2d视图
         */
        hide2D: function () {
            this.contentPane.hide();
        },

        /**
         * show 3d view
         * 显示3D视图
         */
        show3D: function () {
            this.contentPane3d.show();
            this.adjustNetwork3dBoundingBox();
            this.edit3d.refreshNetwork3d();
        },

        /**
         * hide 3d view
         * 隐藏 3d 视图
         */
        hide3D: function () {
            this.contentPane3d.hide();
            this.edit3d.box.clear();
        },

        zoomOverview: function () {
            this.edit2d.zoomOverview();
        },

        /**
         * 取得编辑结果
         * @param isRelative 是否以相对位置导出,默认用绝对位置
         * @returns {Array}
         */
        getData: function (isRelative) {

            var self = this;
            var jsonObjects = this.jsonBox.toJson();
            if (isRelative) {
                var result = [];
                jsonObjects.forEach(function (jsonObject) {
                    var item = {};
                    make.Default.copyProperties(jsonObject, item);
                    var parentId = item.parentId;
                    var parent = self.jsonBox.getDataById(parentId);
                    if (parent) {
                        parent.position = parent.position || [0, 0, 0];
                        item.position = item.position || [0, 0, 0];
                        item.position[0] -= parent.position[0];
                        item.position[2] -= parent.position[2];
                    }
                    result.push(item);
                });
                return result;
            } else {
                return jsonObjects;
            }
        },

        /**
         * 设置数据
         * @param jsonObjects
         * @param isRelative 是否以相对位置导入,默认是绝对位置
         */
        setData: function (jsonObjects, isRelative) {

            var self = this;
            var map = {};
            if (isRelative) {
                jsonObjects.forEach(function (item) {
                    if (item.objectId) {
                        map[item.objectId] = item;
                    }
                })
                jsonObjects.forEach(function (item) {
                    var parentId = item.parentId;
                    var parent = map[parentId];
                    if (!parent) {
                        parent = self.jsonBox.getDataById(parentId);
                    }
                    if (parent) {
                        parent.position = parent.position || [0, 0, 0];
                        item.position = item.position || [0, 0, 0];
                        item.position[0] += parseFloat(parent.position[0] ? parent.position[0] : 0);
                        item.position[2] += parseFloat(parent.position[2] ? parent.position[2] : 0);
                    }
                })
            }
            this.jsonBox.fromJson(jsonObjects);

            setTimeout(function () {
                self.zoomOverview();
            }, 100);
        },
        getSelectedData: function () {
            var nodes = this.edit2d.box.getSelectionModel().getSelection();
            if (!nodes || nodes.size() == 0) {
                return [];
            }
            var copyDatas = [];
            for (var i = 0; i < nodes.size(); i++) {
                var node = nodes.get(i);
                var jsonObject = this.jsonBox.getDataById(node.getId());
                if (jsonObject) {
                    copyDatas.push(jsonObject);
                } else {
                    console.warn('jsonObject is null, node.id=' + node.getId());
                }
            }
            return copyDatas;
        },
        getSelectedNode: function () {
            var nodes = this.edit2d.box.getSelectionModel().getSelection();
            if (!nodes || nodes.size() == 0) {
                return [];
            }
            return nodes.toArray();
        },
        appendData: function (data) {
            return this.jsonBox.add(data);
        },
        removeData: function (data) {
            var self = this;
            if (data instanceof Array) {
                return data.map(function (item) {
                    return self.jsonBox.removeById(item.objectId)
                })
            } else {
                return self.jsonBox.removeById(data.objectId)
            }
        },
        removeNode: function (node) {
            var self = this;
            if (node instanceof Array) {
                return node.map(function (item) {
                    return self.box.removeById(item.getId())
                })
            } else {
                return self.box.removeById(node.getId())
            }
        },
        clear: function () {
            this.jsonBox.clear();
        },
        /**
         * 批量生成编号
         * @param  type 表示编号生成的规则,默认值t-l-l，8种取值，分别是
         * t-l-l,t-l-s, t-r-l,t-r-s, b-l-l,b-l-s, b-r-l,b-r-s
         * Abbr, t: top, b: bottom, l: left, r: right, l: 表示一字形, s: 表示S形
         * @param  start 编号的起始值，默认值1
         * @param  toleRance 判断Node是否在同一行的误差范围，默认值15
         * @param  prefix 编号的前缀
         * @param  suffix 编号的后缀
         * @param  coreNumLen 编号数字部分的长度，默认2，例如01，02
         * @param  includeRow 是否包含包含排的编号，默认值true
         * @param  rowPrefix 排编号的后缀
         * @param  rowSuffix 排编号的后缀
         * @param  rowNumLen 排编号数字部分的长度，默认2，例如01，02
         * @param  separator 如果包含排的编号，那么排编号与资产之间的分隔符，默认'-'
         */
        genIds: (function (opt) {
            var autoNums = [];           //缓存所有的编号，用于排除重复的编号

            return function (opt) {
                opt = opt || {};
                type = opt.type || 't-l-l';
                start = opt.start || 1;
                toleRance = opt.toleRance || 15;
                prefix = opt.prefix || '';
                suffix = opt.suffix || '';
                coreNumLen = opt.coreNumLen || 2;
                includeRow = opt.includeRow;
                rowPrefix = opt.rowPrefix || '';
                rowSuffix = opt.rowSuffix || '';
                rowNumLen = opt.rowNumLen || 2;
                separator = opt.separator || '-';

                var list = this.box.getSelectionModel().getSelection();
                if (!list.size()) return 'no selection';

                var types = type.split('-');
                var rows = {},
                    node, pv, keys, type1 = types[0],
                    p = type1 == 't' || type1 == 'b' ? 'y' : 'x';
                for (var i = 0; i < list.size(); i++) {
                    node = list.get(i);
                    pv = Math.round(node.getLocation()[p]);
                    keys = Object.keys(rows);
                    if (!keys.length) {
                        rows[pv] = [node];
                    } else {
                        var cached = false;
                        for (var key in rows) {
                            if (Math.abs(pv - parseInt(key)) <= toleRance) {
                                rows[key].push(node);
                                cached = true;
                                break;
                            }
                        }
                        if (!cached) {
                            rows[pv] = [node];
                        }
                    }
                }
                keys = Object.keys(rows);
                if (type1 == 't' || type1 == 'l') {
                    keys.sort();
                } else if (type1 == 'b' || type1 == 'r') {
                    keys.sort(function (a, b) {
                        return b - a;
                    });
                }
                var type2 = types[1],
                    p = type2 == 't' || type2 == 'b' ? 'y' : 'x';
                if (type2 == 'l' || type2 == 't') {
                    for (var key in rows) {
                        rows[key].sort(function (a, b) {
                            return a.getLocation()[p] - b.getLocation()[p];
                        });
                    }
                } else if (type2 == 'r' || type2 == 'b') {
                    for (var key in rows) {
                        rows(key).sort(function (a, b) {
                            return b.getLocation()[p] - a.getLocation()[p];
                        });
                    }
                }
                var type3 = types[2];
                if (type3 == 's') {
                    for (var i = 0; i < keys.length; i++) {
                        if (i % 2 !== 0) {
                            if (type2 == 'l' || type2 == 't') {
                                rows[keys[i]].sort(function (a, b) {
                                    return b.getLocation()[p] - a.getLocation()[p];
                                });
                            } else if (type2 == 'r' || type2 == 'b') {
                                rows[keys[i]].sort(function (a, b) {
                                    return a.getLocation()[p] - b.getLocation()[p];
                                });
                            }

                        }
                    }
                }
                var rowId = '';

                keys.forEach(function (key, index) {
                    row = rows[key];
                    if (includeRow) {
                        rowId = rowPrefix + $utils.padStart(index + 1, rowNumLen) + rowSuffix;
                    }
                    row.forEach(function (node) {
                        var bidNum = prefix + (includeRow ? rowId + separator : "") + ($utils.padStart(start++, coreNumLen)) + suffix;
                        if (autoNums.indexOf(bidNum) >= 0) {
                            layer.msg(it.util.i18n('Admin_sceneEditor_UniqueNum'), { icon: 2 });
                            return;
                        }
                        node.setClient('bid', bidNum);
                        autoNums.push(bidNum);
                    });
                });
            }

        }())
    }

    doodle.SceneEditor = SceneEditor;

    doodle.utils.ext(SceneEditor, Editor);
    var $JsonObject = nsp.edit.data.JsonObject = function (params) {
        twaver.PropertyChangeDispatcher.call(this);
        params = params || {};
        this.objectId = params.objectId || doodle.id("JsonObject")
        this.name = params.name;
        this.id = params.id;
        this.radius = params.radius;
        this.width = params.width;
        this.height = params.height;
        this.depth = params.depth;
        this.position = params.position;
        this.rotation = params.rotation;
        this.color = params.color;
        this.data = params.data;
        this.client = params.client || {};
        this.style = params.style || {};
        this.children = params.children;
        this.parentId = params.parentId; //节点的父亲节点
    };

    twaver.Util.ext($JsonObject, twaver.PropertyChangeDispatcher, {
        _init: function () {

        },
        _a: function () {

        },
        getObjectId: function () {
            return this.objectId;
        },

        getId: function () {
            return this.id;
        },

        setId: function (id) {
            var oldValue = this.id;
            if (oldValue != id) {
                this.id = id;
                this.firePropertyChange("id", oldValue, id);
            }
        },

        getColor: function () {
            return this.color;
        },

        setColor: function (newValue) {
            var oldValue = this.color;
            if (oldValue != newValue) {
                this.color = newValue;
                this.firePropertyChange("radius", oldValue, newValue);
            }
        },

        getParentId: function () {
            return this.parentId;
        },

        setParentId: function (newValue) {
            var oldValue = this.parentId;
            if (oldValue != newValue) {
                this.parentId = newValue;
                this.firePropertyChange("parentId", oldValue, newValue);
            }
        },

        getWidth: function () {
            return this.width;
        },

        setWidth: function (width) {
            var oldValue = this.width;
            if (oldValue != width) {
                this.width = width;
                this.firePropertyChange("width", oldValue, width);
            }
        },

        getHeight: function () {
            return this.height;
        },

        setHeight: function (height) {
            var oldValue = this.height;
            if (oldValue != height) {
                this.height = height;
                this.firePropertyChange("height", oldValue, height);
            }
        },

        getDepth: function () {
            return this.depth;
        },

        setDepth: function (depth) {
            var oldValue = this.depth;
            if (oldValue != depth) {
                this.depth = depth;
                this.firePropertyChange("depth", oldValue, depth);
            }
        },

        getWallHeight: function () {
            return this.wallHeight;
        },

        setWallHeight: function (wallHeight) {
            var oldValue = this.wallHeight;
            if (oldValue != wallHeight) {
                this.wallHeight = wallHeight;
                this.firePropertyChange("wallHeight", oldValue, wallHeight);
            }
        },

        getName: function () {
            return this.name;
        },

        setName: function (name) {
            var oldValue = this.name;
            if (oldValue != name) {
                this.name = name;
                this.firePropertyChange("name", oldValue, name);
            }
        },

        isClosed: function () {
            return this.closed;
        },

        setClosed: function (closed) {
            var oldValue = this.closed;
            if (oldValue != closed) {
                this.closed = closed;
                this.firePropertyChange("closed", oldValue, closed);
            }
        },

        isShowFloor: function () {
            return this.showFloor;
        },

        setShowFloor: function (showFloor) {
            var oldValue = this.showFloor;
            if (oldValue != showFloor) {
                this.showFloor = showFloor;
                this.firePropertyChange("showFloor", oldValue, showFloor);
            }
        },

        getPosition: function () {
            return this.position;
        },

        setPosition: function (position) {
            var oldValue = this.position;
            if (oldValue != position) {
                this.position = position;
                this.firePropertyChange("position", oldValue, position);
            }
        },

        getRotation: function () {
            return this.rotation;
        },

        setRotation: function (rotation) {
            var oldValue = this.rotation;
            if (oldValue != rotation) {
                this.rotation = rotation;
                this.firePropertyChange("rotation", oldValue, rotation);
            }
        },

        getData: function () {
            return this.data;
        },

        setData: function (data) {
            var oldValue = this.data;
            if (oldValue != data) {
                this.data = data;
                this.firePropertyChange("data", oldValue, data);
            }
        },

        getClient: function () {
            return this.client;
        },

        setClient: function (client) {
            var oldValue = this.client;
            if (oldValue != client) {
                this.client = client;
                this.firePropertyChange("client", oldValue, client);
            }
        },

        getStyle: function () {
            return this.style;
        },

        setStyle: function (style) {
            var oldValue = this.style;
            if (oldValue != style) {
                this.style = style;
                this.firePropertyChange("style", oldValue, style);
            }
        },

        getChildren: function (children) {
            return this.children;
        },

        setChildren: function (children) {
            var oldValue = this.children;
            if (oldValue != children) {
                this.children = children;
                this.firePropertyChange("children", oldValue, children);
            }
        },

        /**
         * 序列化对象
         * @param newInstance
         * @param dataObject
         */
        serializeJson: function (newInstance, dataObject) {
            //序列化通用值
            this._serializeJsonCommon(newInstance, dataObject);

            this._serializeJsonType(dataObject);

            //删除通用的属性
            if (dataObject.client) {
                delete dataObject.client['id'];
                delete dataObject.client['objectId'];
                delete dataObject.client['parentId'];
            }
        },

        _serializeJsonCommon: function (newInstance, dataObject) {
            this.serializePropertyJson("id", newInstance, dataObject);
            this.serializePropertyJson("objectId", newInstance, dataObject);
            this.serializePropertyJson("parentId", newInstance, dataObject);
            this.serializePropertyJson("name", newInstance, dataObject);
            this.serializePropertyJson("width", newInstance, dataObject);
            this.serializePropertyJson("wallHeight", newInstance, dataObject);
            this.serializePropertyJson("height", newInstance, dataObject);
            this.serializePropertyJson("depth", newInstance, dataObject);
            if (newInstance['position'] && newInstance['position'].toString() != "0,0,0") {
                this.serializePropertyJson("position", newInstance, dataObject);
            }
            if (newInstance['rotation'] && newInstance['rotation'] != "0,0,0") {
                this.serializePropertyJson("rotation", newInstance, dataObject);
            }
            this.serializePropertyJson("data", newInstance, dataObject);
            this.serializePropertyJson("radius", newInstance, dataObject);
            this.serializePropertyJson("closed", newInstance, dataObject);
            this.serializePropertyJson("showFloor", newInstance, dataObject);
            this.serializePropertyJson("client", newInstance, dataObject);
            this.serializePropertyJson("style", newInstance, dataObject);
            this.serializePropertyJson("color", newInstance, dataObject);
            this.serializeArray("children", newInstance, dataObject);
        },

        /**
         * 按类型序列化json
         * @param dataObject
         * @private
         */
        _serializeJsonType: function (json) {
            var type = make.Default.getType(json.id);
            if (!serializeMap[type]) {
                return;
            }
            var fieldMap = serializeMap[type];
            var clientFields = fieldMap.client || {};
            var styleFields = fieldMap.style || {};

            var client = json.client || {};
            var style = json.style || {};

            for (var name in clientFields) {

                var fieldName = clientFields[name];
                if (client[name] !== undefined) {
                    json[fieldName] = client[name];
                    delete client[name];
                }
            }

            for (var name in styleFields) {

                var fieldName = styleFields[name];
                if (style[name] !== undefined) {
                    json[fieldName] = style[name];
                    delete style[name];
                }
            }
        },

        serializeArray: function (name, newInstance, dataObject) {
            var children = newInstance[name];
            var childrenDatas = [];
            if (children && children instanceof Array && children.length > 0) {
                for (var i = 0; i < children.length; i++) {
                    var childrenData = {};
                    this.serializeJson(children[i], childrenData);
                    childrenDatas.push(childrenData);
                }
                dataObject[name] = childrenDatas;
            }
        },

        serializePropertyJson: function (property, newInstance, dataObject) {
            if (newInstance[property]) {

                dataObject[property] = $utils.clone(newInstance[property]);
            }
        },

        deserializeJson: function (newInstance, json) {
            this._deserializeJsonType(json);
            for (var name in json) {

                this.deserializePropertyJson(newInstance, json[name], name);
            }

        },

        deserializePropertyJson: function (newInstance, value, property) {
            newInstance[property] = $utils.clone(value);
        },

        /**
         * 按类型反序列化json
         * @param newInstance
         * @param dataObject
         * @private
         */
        _deserializeJsonType: function (json) {
            var type = make.Default.getType(json.id);
            if (!serializeMap[type]) {
                return;
            }
            var fieldMap = serializeMap[type];
            var clientFields = fieldMap.client || {};
            var styleFields = fieldMap.style || {};

            var client = json.client || {};
            var style = json.style || {};

            for (var name in clientFields) {

                var fieldName = clientFields[name];
                if (json[fieldName] !== undefined) {
                    client[name] = json[fieldName];
                    delete json[fieldName];
                }
            }

            for (var name in styleFields) {

                var fieldName = styleFields[name];
                if (json[fieldName] !== undefined) {
                    style[name] = json[fieldName];
                    delete json[fieldName];
                }
            }
            json.client = client;
            json.style = style;
        },

        clone: function () {
            var object3d = new $JsonObject();
            make.Default.copyProperties(this, object3d);
            return object3d;
        }

    });

    /* 定义不同类型的模型需要序列化的特殊属性 */
    var serializeMap = doodle.serializeMap = {
        channel: {
            client: {
                'rackWidth': 'rackWidth',
                'rackDepth': 'rackDepth',
                'rackHeight': 'rackHeight',
                'rackNumber': 'rackNumber',
                'isSingle': 'isSingle',
                'side': 'side',
                'aisleDepth': 'aisleDepth'
            },
            style: {},
            isRemain: false,
        },
        area: {
            client: { 'label': 'label', 'opacity': 'opacity' },
            style: {
                'label.xoffset': 'labelPositionX',
                'label.yoffset': 'labelPositionZ',
                'label.color': 'labelColor',
                'label.font': 'labelFont'
            },
            isRemain: false,
        },
        innerWall: {
            client: {
                insideRepeat: 'insideRepeat',
                outsideRepeat: 'outsideRepeat',
                reverse: 'reverse'                    //墙是否需要反转
            }
        }
    }
    /**
     * @private
     * @param network
     * @param typeOrShapeNodeFunction
     * @constructor
     */
    var MyCreateShapeNodeInteraction = nsp.edit.interaction.MyCreateShapeNodeInteraction = function (network, typeOrShapeNodeFunction) {
        nsp.edit.interaction.MyCreateShapeNodeInteraction.superClass.constructor.call(this, network, typeOrShapeNodeFunction);
    }

    twaver.Util.ext(nsp.edit.interaction.MyCreateShapeNodeInteraction, twaver.vector.interaction.CreateShapeNodeInteraction, {

        handle_mousedown: function (e) {
            if (e.button !== 0) {
                return;
            }
            var point = this.currentPoint || this.network.getLogicalPoint2(e);
            if (!point) {
                return;
            }
            if (e.detail === 2) {
                if (this.points.size() > 2) {
                    var shapeNode = this.shapeNodeFunction(this.points);
                    if (!shapeNode) return;
                    this.network.addElementByInteraction(shapeNode);
                    this.clear();
                    var self = this;
                    setTimeout(function () {
                        self.network.setEditingElement(false);
                    }, 0);
                }
            } else {
                if (!this.network.isEditingElement()) {
                    this.network.setEditingElement(true);
                }
                if (!this.points) {
                    this.points = new twaver.List();
                }
                if (this.points.size() > 0) {
                    var lastPoint = this.points.get(this.points.size() - 1);
                    if (lastPoint.x === point.x && lastPoint.y === point.y) {
                        return;
                    }
                }
                this.points.add(point);
            }
            this.repaint();
        },
        handle_mousemove: function (e) {
            if (this.points) {
                var lastPoint = this.points.get(this.points.size() - 1);
                var currPoint = this.network.getLogicalPoint2(e);
                //如果按住了ctrl键,允许任意打点,否则只能水平或竖直
                if (!_twaver.isCtrlDown(e)) {
                    var dx = currPoint.x - lastPoint.x;
                    var dy = currPoint.y - lastPoint.y;
                    if (Math.abs(dx) >= Math.abs(dy)) {
                        //水平
                        currPoint.y = lastPoint.y;
                    } else {
                        //竖直
                        currPoint.x = lastPoint.x;
                    }
                }
                this.currentPoint = currPoint;
                this.repaint();
            }
        },
    });
    nsp.edit.interaction.RoomDragInteraction = function (network, propertySheetPane, jsonBox) {
        nsp.edit.interaction.RoomDragInteraction.superClass.constructor.call(this, network);
        this.propertySheetPane = propertySheetPane;
        this.jsonBox = jsonBox;
    }


    twaver.Util.ext(nsp.edit.interaction.RoomDragInteraction, twaver.vector.interaction.BaseInteraction, {
        setUp: function () {
            this.addListener('mousedown', 'mousemove', 'mouseup', 'dragover', 'drop', 'dblclick');
        },
        tearDown: function () {
            this.removeListener('mousedown', 'mousemove', 'mouseup', 'dragover', 'drop', 'dblclick');
        },

        handle_dblclick: function (e) {

        },

        //get element by mouse event, set lastElement as WallShapeNode
        handle_dragover: function (e) {
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
            e.dataTransfer.dropEffect = 'copy';

            // var element = this.network.getElementAt(e);
            var MIN_OFFSET = 300;        //门窗在墙附近三百的距离吸附
            var p = this.network.getLogicalPoint(e);
            var elements = this.network.getElementsAtRect({ x: p.x - MIN_OFFSET / 2, y: p.y - MIN_OFFSET / 2, width: MIN_OFFSET, height: MIN_OFFSET }, true);
            var element;
            for (var i = 0; i < elements.size(); i++) {
                if (elements.get(i) instanceof make.Default.WallShapeNode) {
                    element = elements.get(i);
                }
            }
            if (!element) return;
            if (this.network.lastElement && this.network.lastElement !== element) {
                if (this.network.lastElement instanceof make.Default.WallShapeNode) {
                    this.network.lastElement.setClient('focusIndex', -1);
                }
                this.network.lastElement = null;
            }
            //if mouse over a shapenode side, set focus index for shapenode and set lastelement as this shapenode
            if (element instanceof make.Default.WallShapeNode) {
                var point = this.network.getLogicalPoint(e); //getLogicalPosition(e) 2015-01-04
                var index = element.getPointIndex(point, MIN_OFFSET);
                element.setClient('focusIndex', index);
                if (index >= 0) {
                    this.network.lastElement = element;
                }
            } else {
                this.network.lastElement = null;
            }
            return false;
        },

        handle_drop: function (e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
            var text = e.dataTransfer.getData('Text');
            if (!text) {
                return false;
            }
            var obj = JSON.parse(text);
            var id = $utils.getSceneEditorModel3dId(obj.id);
            var id2d = $utils.getSceneEditorModel2dId(id);


            var element = this.network.getElementAt(e);

            if (obj.id) {
                if (obj.combo) {
                    var jsons = make.Default.load(obj.id);
                    $utils.createJsonObject(this.jsonBox, jsons, obj.id);
                } else {

                    var layerId = make.Default.getOtherParameter(id2d, 'layer') || 900;
                    var type = make.Default.getOtherParameter(id2d, 'type');
                    if (type === 'watercable' || type === 'wall' || (type === 'area' && id2d == 'twaver.idc.area.top') || type === 'innerWall' || type === 'floor') {
                        var type = function (points) {
                            var data = [];
                            points.forEach(function (p) {
                                data.push(p.x);
                                data.push(p.y);
                            });
                            var type = make.Default.getType(id);
                            if (type == 'wall' && data.length < 3 * 2) {
                                return null;
                            } else if (type == 'area' && data.length < 3 * 2) {
                                return null;
                            } else if (type == 'innerWall' && data.length < 2 * 2) {
                                return null;
                            }
                            var node = make.Default.load({ id: id2d, data: data });
                            return node;
                        };
                        this.network.setAutoShowOrHideGrid(false);
                        this._createShapeNodeInteractions(type);
                    } else if (type === 'door' || type === 'window') {
                        var p = this.network.getLogicalPoint(e);
                        var MIN_OFFSET = 300;        //门窗在墙附近三百的距离吸附
                        var elements = this.network.getElementsAtRect({ x: p.x - MIN_OFFSET / 2, y: p.y - MIN_OFFSET / 2, width: MIN_OFFSET, height: MIN_OFFSET }, true);
                        for (var i = 0; i < elements.size(); i++) {
                            if (elements.get(i) instanceof make.Default.WallShapeNode) {
                                element = elements.get(i);
                                if (element && (element instanceof make.Default.WallShapeNode)) {
                                    var point = this.network.getLogicalPoint(e); //getLogicalPosition(e) 2015-01-04
                                    element.setClient('focusIndex', -1);
                                    var index = element.getPointIndex(point, MIN_OFFSET);
                                    if (index >= 0) {
                                        var points = element.getPoints(),
                                            from = points.get(index),
                                            to = points.get(index === points.size() - 1 ? 0 : index + 1),
                                            dx = to.x - from.x,
                                            dy = to.y - from.y,
                                            offset = Math.abs(dx) > Math.abs(dy) ? (point.x - from.x) / dx : (point.y - from.y) / dy;

                                        var rotateY = Math.atan((from.y - to.y) / (from.x - to.x));

                                        var newPoint = {};       /*修正门窗吸附后的偏移量*/
                                        if (Math.abs(point.x - from.x) <= MIN_OFFSET / 2) {
                                            newPoint = { x: from.x, y: Math.round(point.y / 10) * 10 };    //10为最小吸附单元，这里后期需要改进因为这里child还不是网元没有设置吸附
                                        }
                                        if (Math.abs(point.y - from.y) <= MIN_OFFSET / 2) {
                                            newPoint = { x: Math.round(point.x / 10) * 10, y: from.y };
                                        }

                                        var wallChild = new nsp.edit.data.JsonObject();
                                        wallChild.id = id;
                                        wallChild.position = [point.x, 0, point.y];
                                        if (make.Default.getOtherParameter(id2d, 'type') === 'window') {
                                            wallChild.position = [newPoint.x, 30, newPoint.y];
                                            wallChild.setWidth(120);
                                        } else if (make.Default.getOtherParameter(id2d, 'type') === 'door') {
                                            wallChild.position = [newPoint.x, 0, newPoint.y];
                                            wallChild.setWidth(205);
                                        }
                                        // wallChild.rotation = [0, -rotateY, 0];
                                        wallChild.client = { edgeIndex: index, offset: offset };
                                        wallChild.client.id = id;

                                        var wall = this.jsonBox.getDataById(element.getId());

                                        this.jsonBox.remove(wall);
                                        if (wall) {
                                            var children = wall.getChildren() || [];
                                            children.push(wallChild);
                                            wall.setChildren(children);
                                        }
                                        this.jsonBox.add(wall);
                                        // wallChild.parentId = wall.getObjectId();
                                        // this.jsonBox.add(wallChild);

                                    }
                                }
                            }
                        }

                    } else {
                        this.network.getSelectionModel().clearSelection();
                        var centerLocation = this.network.getLogicalPoint(e);
                        var position = [centerLocation.x, 'floor-top', centerLocation.y];

                        //FIXME 原来根据模型ID来判断,不合理,改成了如果注册有positionY,就修改模型position
                        var params = make.Default.getModelDefaultParameters($utils.getSceneEditorModel2dId(id));

                        //通道特殊属性
                        if (this.isChannel(id)) {
                            this._getChannelClient(params, obj);
                        }

                        if (params && params['positionY']) {

                            position[1] = params['positionY'].value;
                        }
                        var jsonData = new nsp.edit.data.JsonObject();
                        jsonData.id = id;
                        jsonData.position = position;
                        jsonData.client = obj;
                        jsonData.client.id = jsonData.id;
                        this.jsonBox.add(jsonData);
                        var box2d = this.network.getElementBox();
                        this.network.getSelectionModel().appendSelection(box2d.getDataById(jsonData.getObjectId()));

                    }
                }

            }
            this._setNetworkCreateShapeNodeCursor();
            return false;
        },
        isChannel: function (id) {
            var category = make.Default.getOtherParameter(id, 'sdkCategory');
            return category == 'channel';
        },

        _getChannelClient: function (params, obj) {
            for (var param in params) {
                if (params[param].propertyType == 'Client' || params[param].propertyType == 'field' && params[param].value) {
                    obj[param] = params[param].value;
                }
            }
            return obj;
        },

        _createShapeNodeInteractions: function (type) {
            this.network.setInteractions([
                new MyCreateShapeNodeInteraction(this.network, type),
                new twaver.vector.interaction.DefaultInteraction(this.network)
            ]);
        },

        _setNetworkCreateShapeNodeCursor: function () {
            var self = this;
            this.network.getInteractions().forEach(function (handler) {
                if (handler instanceof twaver.vector.interaction.CreateShapeNodeInteraction) {
                    self.network.getView().style.cursor = 'crosshair';
                }
            });
        },

        handle_mousedown: function (e) {
            // $utils.stopPropagation(e);   
            this.mouseDown = true;
            this.lastLogicalPoint = this.network.getLogicalPoint(e); //getLogicalPosition(e) 2015-01-04
            if (!this.lastLogicalPoint) return;
            //        alert(this.lastLogicalPoint.x + " ; " + this.lastLogicalPoint.y);
            var element = this.network.getElementAt(e);
            if (element && !$utils.isMoveModel(element)) {
                //判断是否是禁止移动的对象
                return;
            }
            if (element instanceof make.Default.WallShapeNode) {
                resize = this.network.getElementUI(element).isPointOnBorderLine(this.lastLogicalPoint);
                if (resize !== null) {
                    this.lastElement = element;
                    this.network.isMovable = function (element) {
                        return false;
                    };
                } else {
                    var index = element.getPointIndex(this.network.getLogicalPoint(e)); ////getLogicalPosition(e) 2015-01-04
                    if (index >= 0) {
                        this.lastIndex = index;
                        this.lastElement = element;
                        this.network.isMovable = function (element) {
                            return false;
                        };
                    }
                }
            }
            if (element instanceof make.Default.Block) {
                this.block = element;
            }
        },

        handle_mousemove: function (e) {
            // $utils.stopPropagation(e);
            // if(lock2d) {
            //   return;
            // }
            var resize;
            this._setNetworkCreateShapeNodeCursor();
            if (this.mouseDown) {
                var point = this.network.getLogicalPoint(e); //getLogicalPosition(e) 2015-01-04
                if (!point) {
                    this.network.getView().scrollTop += 10;
                    this.network.getView().scrollLeft += 10;
                    return;
                }
                if (this.lastElement && !$utils.isMoveModel(this.lastElement)) {
                    //判断是否是禁止移动的对象
                    return;
                }
                if (this.block && !$utils.isMoveModel(this.block)) {
                    //判断是否是禁止移动的对象
                    return;
                }
                offsetX = this.lastLogicalPoint ? point.x - this.lastLogicalPoint.x : 0;
                offsetY = this.lastLogicalPoint ? point.y - this.lastLogicalPoint.y : 0;
                if (this.lastIndex >= 0) {
                    $utils.stopPropagation(e);
                    var points = this.lastElement.getPoints(),
                        from = points.get(this.lastIndex),
                        to = points.get(this.lastIndex === points.size() - 1 ? 0 : this.lastIndex + 1);
                    if (!this.network.enableSingleOrientationMove) {
                        if (!this.mouseMoved && _twaver.isCtrlDown(e)) {
                            this.horizontal = Math.abs(offsetX) >= Math.abs(offsetY);
                            this.vertical = !this.horizontal;
                            this.mouseMoved = true;
                        }
                    } else if (!this.mouseMoved) {
                        this.horizontal = from.x == to.x;
                        this.vertical = !this.horizontal;
                        this.mouseMoved = true;
                    }
                    //                if (!this.mouseMoved && _twaver.isCtrlDown(e)) {
                    //                    this.horizontal = Math.abs(offsetX) >= Math.abs(offsetY);
                    //                    this.vertical = !this.horizontal;
                    //                    this.mouseMoved = true;
                    //                }
                    if (!this.vertical) {
                        from.x += offsetX;
                        to.x += offsetX;
                    }
                    if (!this.horizontal) {
                        from.y += offsetY;
                        to.y += offsetY;
                    }
                    this.lastElement.firePointsChange(null, this.lastElement.getPoints());
                    this.lastLogicalPoint = point;
                }
                if (this.block) {
                    var index = this.block.getClient('edgeIndex'),
                        length = this.block.getClient('length'),
                        offset = this.block.getClient('offset'),
                        points = this.block.getParent().getPoints(),
                        from = points.get(index),
                        to = points.get(index === points.size() - 1 ? 0 : index + 1),
                        dx = to.x - from.x,
                        dy = to.y - from.y,
                        h = Math.abs(dx) > Math.abs(dy),
                        change = h ? offsetX : offsetY,
                        move = change;
                    if (this.block.getClient('focusLeft')) {
                        if (h) {
                            if (dx > 0) {
                                move = -move;
                            }
                        } else {
                            if (dx >= 0 && dy < 0) {
                                change = -change;
                            }
                            if (dx >= 0 && dy > 0) {
                                move = -move;
                            }
                            if (dx < 0 && dy > 0) {
                                change = -change;
                                move = -move;
                            }
                        }
                        this.block.setClient('length', length - change);
                        this.block.setClient('offset', offset - move / Math.abs(h ? dx : dy) / 2);
                    } else if (this.block.getClient('focusRight')) {
                        if (h) {
                            if (dx < 0) {
                                move = -move;
                            }
                        } else {
                            if (dx >= 0 && dy < 0) {
                                change = -change;
                                move = -move;
                            }
                            if (dx < 0 && dy > 0) {
                                change = -change;
                            }
                            if (dx < 0 && dy < 0) {
                                move = -move;
                            }
                        }
                        this.block.setClient('length', length + change);
                        this.block.setClient('offset', offset + move / Math.abs(h ? dx : dy) / 2);
                    } else {
                        var offset = Math.abs(dx) > Math.abs(dy) ? (point.x - this.lastLogicalPoint.x) / dx : (point.y - this.lastLogicalPoint.y) / dy;
                        this.block.setClient('offset', this.block.getClient('offset') + offset);
                    }
                    this.lastLogicalPoint = point;
                }
                if (resize !== null && this.lastElement) {
                    if (resize === 0) {
                        this.lastElement.setLocation(this.lastElement.getX() + offsetX, this.lastElement.getY() + offsetY);
                        this.lastElement.setSize(this.lastElement.getWidth() - offsetX, this.lastElement.getHeight() - offsetY);
                    } else if (resize === 1) {
                        this.lastElement.setLocation(this.lastElement.getX(), this.lastElement.getY() + offsetY);
                        this.lastElement.setSize(this.lastElement.getWidth() + offsetX, this.lastElement.getHeight() - offsetY);
                    } else if (resize === 2) {
                        this.lastElement.setSize(this.lastElement.getWidth() + offsetX, this.lastElement.getHeight() + offsetY);
                    } else if (resize === 3) {
                        this.lastElement.setLocation(this.lastElement.getX() + offsetX, this.lastElement.getY());
                        this.lastElement.setSize(this.lastElement.getWidth() - offsetX, this.lastElement.getHeight() + offsetY);
                    }
                    this.lastLogicalPoint = point;
                }
            } else {
                var element = this.network.getElementAt(e),
                    point = this.network.getLogicalPoint(e); //getLogicalPosition(e) 2015-01-04
                if (element && !$utils.isMoveModel(element)) {
                    //判断是否是禁止移动的对象
                    return;
                }
                if (this.lastElement && this.lastElement !== element) {
                    if (this.lastElement instanceof make.Default.WallShapeNode) {
                        this.lastElement.setClient('focusIndex', -1);
                        this.network.getView().style.cursor = 'default';
                    }
                    if (this.lastElement instanceof make.Default.Block) {
                        this.lastElement.setClient('focus', false);
                        this.lastElement.setClient('focusLeft', false);
                        this.lastElement.setClient('focusRight', false);
                        this.network.getView().style.cursor = 'default';
                    }
                    this.lastElement = null;
                }
                if (element instanceof make.Default.WallShapeNode) {
                    resize = this.network.getElementUI(element).isPointOnBorderLine(point);
                    if (resize !== null) {
                        this.lastElement = element;
                        this.network.getView().style.cursor = 'move';
                    } else {
                        var index = element.getPointIndex(point);
                        element.setClient('focusIndex', index);
                        if (index >= 0) {
                            this.lastElement = element;
                            if (_twaver.isAltDown(e)) {
                                this.network.getView().style.cursor = this.addPointCursor;
                            } else {
                                this.network.getView().style.cursor = 'move';
                            }
                        } else {
                            if (!element.isPointOnPoints(point)) {
                                this.network.getView().style.cursor = 'default';
                            }
                        }
                    }
                } else if (element instanceof make.Default.Block) {
                    element.setClient('focus', true);
                    if (this.network.getSelectionModel().contains(element) && _twaver.math.getDistance(point, element.getClient('leftPoint')) <= 10) {
                        element.setClient('focusLeft', true);
                        element.setClient('focusRight', false);
                        this.network.getView().style.cursor = 'move';
                    } else if (this.network.getSelectionModel().contains(element) && _twaver.math.getDistance(point, element.getClient('rightPoint')) <= 10) {
                        element.setClient('focusLeft', false);
                        element.setClient('focusRight', true);
                        this.network.getView().style.cursor = 'move';
                    } else {
                        element.setClient('focusLeft', false);
                        element.setClient('focusRight', false);
                        this.network.getView().style.cursor = 'default';
                    }
                    this.lastElement = element;
                } else {
                    this.lastElement = null;
                }
            }

        },

        handle_mouseup: function (e) {
            this.mouseDown = false;
            this.mouseMoved = false;
            this.horizontal = false;
            this.vertical = false;
            this.lastIndex = -1;
            this.lastElement = null;
            this.lastLogicalPoint = null;
            this.block = null;
            this.resize = false;
            this.network.getView().style.cursor = 'default';
            delete this.network.isMovable;
        },

        getAllElementsAt: function (point) {
            var rect = {
                x: point.x - 1,
                y: point.y - 1,
                width: 2,
                height: 2
            };
            var elements = this.network.getElementsAtRect(rect, true, null, false);
            return elements;
        },
        findFirstFloorAt: function (point) {
            var elements = this.getAllElementsAt(point);
            if (elements) {
                for (var i = 0; i < elements.size(); i++) {
                    if (elements.get(i) instanceof nsp.edit.data.FloorShapeNode) {
                        return elements.get(i);
                    }
                }
            }
        }

    });
    nsp.edit.interaction.RoomEditInteraction = function (network, lazyMode) {
        nsp.edit.interaction.RoomEditInteraction.superClass.constructor.call(this, network);
    }

    twaver.Util.ext(nsp.edit.interaction.RoomEditInteraction, twaver.vector.interaction.EditInteraction, {
        deletePointCursor: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAACXBIWXMAAAsTAAALEwEAmpwYAAAKTWlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVN3WJP3Fj7f92UPVkLY8LGXbIEAIiOsCMgQWaIQkgBhhBASQMWFiApWFBURnEhVxILVCkidiOKgKLhnQYqIWotVXDjuH9yntX167+3t+9f7vOec5/zOec8PgBESJpHmomoAOVKFPDrYH49PSMTJvYACFUjgBCAQ5svCZwXFAADwA3l4fnSwP/wBr28AAgBw1S4kEsfh/4O6UCZXACCRAOAiEucLAZBSAMguVMgUAMgYALBTs2QKAJQAAGx5fEIiAKoNAOz0ST4FANipk9wXANiiHKkIAI0BAJkoRyQCQLsAYFWBUiwCwMIAoKxAIi4EwK4BgFm2MkcCgL0FAHaOWJAPQGAAgJlCLMwAIDgCAEMeE80DIEwDoDDSv+CpX3CFuEgBAMDLlc2XS9IzFLiV0Bp38vDg4iHiwmyxQmEXKRBmCeQinJebIxNI5wNMzgwAABr50cH+OD+Q5+bk4eZm52zv9MWi/mvwbyI+IfHf/ryMAgQAEE7P79pf5eXWA3DHAbB1v2upWwDaVgBo3/ldM9sJoFoK0Hr5i3k4/EAenqFQyDwdHAoLC+0lYqG9MOOLPv8z4W/gi372/EAe/tt68ABxmkCZrcCjg/1xYW52rlKO58sEQjFu9+cj/seFf/2OKdHiNLFcLBWK8ViJuFAiTcd5uVKRRCHJleIS6X8y8R+W/QmTdw0ArIZPwE62B7XLbMB+7gECiw5Y0nYAQH7zLYwaC5EAEGc0Mnn3AACTv/mPQCsBAM2XpOMAALzoGFyolBdMxggAAESggSqwQQcMwRSswA6cwR28wBcCYQZEQAwkwDwQQgbkgBwKoRiWQRlUwDrYBLWwAxqgEZrhELTBMTgN5+ASXIHrcBcGYBiewhi8hgkEQcgIE2EhOogRYo7YIs4IF5mOBCJhSDSSgKQg6YgUUSLFyHKkAqlCapFdSCPyLXIUOY1cQPqQ28ggMor8irxHMZSBslED1AJ1QLmoHxqKxqBz0XQ0D12AlqJr0Rq0Hj2AtqKn0UvodXQAfYqOY4DRMQ5mjNlhXIyHRWCJWBomxxZj5Vg1Vo81Yx1YN3YVG8CeYe8IJAKLgBPsCF6EEMJsgpCQR1hMWEOoJewjtBK6CFcJg4Qxwicik6hPtCV6EvnEeGI6sZBYRqwm7iEeIZ4lXicOE1+TSCQOyZLkTgohJZAySQtJa0jbSC2kU6Q+0hBpnEwm65Btyd7kCLKArCCXkbeQD5BPkvvJw+S3FDrFiOJMCaIkUqSUEko1ZT/lBKWfMkKZoKpRzame1AiqiDqfWkltoHZQL1OHqRM0dZolzZsWQ8ukLaPV0JppZ2n3aC/pdLoJ3YMeRZfQl9Jr6Afp5+mD9HcMDYYNg8dIYigZaxl7GacYtxkvmUymBdOXmchUMNcyG5lnmA+Yb1VYKvYqfBWRyhKVOpVWlX6V56pUVXNVP9V5qgtUq1UPq15WfaZGVbNQ46kJ1Bar1akdVbupNq7OUndSj1DPUV+jvl/9gvpjDbKGhUaghkijVGO3xhmNIRbGMmXxWELWclYD6yxrmE1iW7L57Ex2Bfsbdi97TFNDc6pmrGaRZp3mcc0BDsax4PA52ZxKziHODc57LQMtPy2x1mqtZq1+rTfaetq+2mLtcu0W7eva73VwnUCdLJ31Om0693UJuja6UbqFutt1z+o+02PreekJ9cr1Dund0Uf1bfSj9Rfq79bv0R83MDQINpAZbDE4Y/DMkGPoa5hpuNHwhOGoEctoupHEaKPRSaMnuCbuh2fjNXgXPmasbxxirDTeZdxrPGFiaTLbpMSkxeS+Kc2Ua5pmutG003TMzMgs3KzYrMnsjjnVnGueYb7ZvNv8jYWlRZzFSos2i8eW2pZ8ywWWTZb3rJhWPlZ5VvVW16xJ1lzrLOtt1ldsUBtXmwybOpvLtqitm63Edptt3xTiFI8p0in1U27aMez87ArsmuwG7Tn2YfYl9m32zx3MHBId1jt0O3xydHXMdmxwvOuk4TTDqcSpw+lXZxtnoXOd8zUXpkuQyxKXdpcXU22niqdun3rLleUa7rrStdP1o5u7m9yt2W3U3cw9xX2r+00umxvJXcM970H08PdY4nHM452nm6fC85DnL152Xlle+70eT7OcJp7WMG3I28Rb4L3Le2A6Pj1l+s7pAz7GPgKfep+Hvqa+It89viN+1n6Zfgf8nvs7+sv9j/i/4XnyFvFOBWABwQHlAb2BGoGzA2sDHwSZBKUHNQWNBbsGLww+FUIMCQ1ZH3KTb8AX8hv5YzPcZyya0RXKCJ0VWhv6MMwmTB7WEY6GzwjfEH5vpvlM6cy2CIjgR2yIuB9pGZkX+X0UKSoyqi7qUbRTdHF09yzWrORZ+2e9jvGPqYy5O9tqtnJ2Z6xqbFJsY+ybuIC4qriBeIf4RfGXEnQTJAntieTE2MQ9ieNzAudsmjOc5JpUlnRjruXcorkX5unOy553PFk1WZB8OIWYEpeyP+WDIEJQLxhP5aduTR0T8oSbhU9FvqKNolGxt7hKPJLmnVaV9jjdO31D+miGT0Z1xjMJT1IreZEZkrkj801WRNberM/ZcdktOZSclJyjUg1plrQr1zC3KLdPZisrkw3keeZtyhuTh8r35CP5c/PbFWyFTNGjtFKuUA4WTC+oK3hbGFt4uEi9SFrUM99m/ur5IwuCFny9kLBQuLCz2Lh4WfHgIr9FuxYji1MXdy4xXVK6ZHhp8NJ9y2jLspb9UOJYUlXyannc8o5Sg9KlpUMrglc0lamUycturvRauWMVYZVkVe9ql9VbVn8qF5VfrHCsqK74sEa45uJXTl/VfPV5bdra3kq3yu3rSOuk626s91m/r0q9akHV0IbwDa0b8Y3lG19tSt50oXpq9Y7NtM3KzQM1YTXtW8y2rNvyoTaj9nqdf13LVv2tq7e+2Sba1r/dd3vzDoMdFTve75TsvLUreFdrvUV99W7S7oLdjxpiG7q/5n7duEd3T8Wej3ulewf2Re/ranRvbNyvv7+yCW1SNo0eSDpw5ZuAb9qb7Zp3tXBaKg7CQeXBJ9+mfHvjUOihzsPcw83fmX+39QjrSHkr0jq/dawto22gPaG97+iMo50dXh1Hvrf/fu8x42N1xzWPV56gnSg98fnkgpPjp2Snnp1OPz3Umdx590z8mWtdUV29Z0PPnj8XdO5Mt1/3yfPe549d8Lxw9CL3Ytslt0utPa49R35w/eFIr1tv62X3y+1XPK509E3rO9Hv03/6asDVc9f41y5dn3m978bsG7duJt0cuCW69fh29u0XdwruTNxdeo94r/y+2v3qB/oP6n+0/rFlwG3g+GDAYM/DWQ/vDgmHnv6U/9OH4dJHzEfVI0YjjY+dHx8bDRq98mTOk+GnsqcTz8p+Vv9563Or59/94vtLz1j82PAL+YvPv655qfNy76uprzrHI8cfvM55PfGm/K3O233vuO+638e9H5ko/ED+UPPR+mPHp9BP9z7nfP78L/eE8/sl0p8zAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAGYSURBVHja1JS/SwJhGMc/r16ieXENRSBJQijo0OIS/gE1BK4tzorQVHNTU3OB2ByNDW21tTidtClY0A+nFvHojsCyt+UNTvMujSL6LHccz/fD8/Lc+4hsNssQa8A6kAPS6lsTqAHnwIW72DRNRqG53hPAFlAqpyw9M9tjKfoKwL2jrTa6odVKyygCVeAQuMMHzSXdKyatQj7uEAnKgaKM0SNj9NhYdPSzdnTn6NpYAHb95AH13ComrcJmwv4kdRMJSjYTNsWkVVCnw0+8BpTycYdxUbUllfUUr5dTlu7X6ajOyylLV0P2FOcysz0mRWVyfuL0x/QnQWXSXw3vxwkAzXtHmzioMk0/ca3RDU0sVpman/i80jLs574YW/rcF1Rahq2uuKf4AqietaNji1VtdXhvuAnGYjGAVr0TngsH5cryzAtTAe9OTx90jq6NY2DfNM3uV+IucFXvhPsntzMrUU2GEDCtSV7eBDdPU1w+Rtg25+16J3ygpL5LSHxnbXqtygGxlPJX/mPtOyEhhPyzjn/1Sv8v8fsAeL2I1faEYBkAAAAASUVORK5CYII'),auto",
        setUp: function () {
            nsp.edit.interaction.RoomEditInteraction.superClass.setUp.apply(this, arguments);
            // this.addListener('keydown','keyup');
            //        this.oldCursor = this.network.getView().style.cursor;
            //        this.network.setHasEditInteraction(true);
        },
        tearDown: function () {
            nsp.edit.interaction.RoomEditInteraction.superClass.setUp.apply(this, arguments);
            // this.removeListener('keydown','keyup');
            //        this.network.getView().style.cursor = this.oldCursor;
            //        this.network.setHasEditInteraction(false);
            //this.clear();
        },
        // handle_keydown: function(e) {
        //     this.currentKeyEvent = e;
        //     this.showSnap = true;
        // },
        // handle_keyup: function(e) {
        //     this.currentKeyEvent = null;
        //     this.showSnap = false;
        // },
        handle_mouseup: function (e) {
            if (this.isStart) {
                var point = _twaver.clone(this._endLogical);
                if (this.resizingRect) {
                    if (this.lazyMode) {
                        if (this.network.isResizeAnimate()) {
                            var self = this;
                            var animate = new twaver.animate.AnimateBounds(this.node, this.resizingRect, function () {
                                self.network.fireInteractionEvent({
                                    kind: 'lazyResizeEnd',
                                    event: e,
                                    element: self.node,
                                    resizeDirection: self.resizeDirection
                                });
                            });
                            twaver.animate.AnimateManager.start(animate);
                        } else {
                            this.node.setLocation(this.resizingRect.x, this.resizingRect.y);
                            this.node.setSize(this.resizingRect.width, this.resizingRect.height);
                            this.network.fireInteractionEvent({
                                kind: 'lazyResizeEnd',
                                event: e,
                                element: this.node,
                                resizeDirection: this.resizeDirection
                            });
                        }
                    } else {
                        this.node.setLocation(this.resizingRect.x, this.resizingRect.y);
                        this.node.setSize(this.resizingRect.width, this.resizingRect.height);
                        this.network.fireInteractionEvent({
                            kind: 'liveResizeEnd',
                            event: e,
                            element: this.node,
                            resizeDirection: this.resizeDirection
                        });
                    }
                } else if (this.shapeNode && this.pointIndex >= 0 && point) {
                    var oldPoint = this.shapeNode.getPoints().get(this.pointIndex);
                    if (this.horizontal) {
                        point.y = oldPoint.y;
                    }
                    if (this.vertical) {
                        point.x = oldPoint.x;
                    }
                    /*if(this.currentKeyEvent && this.currentKeyEvent.keyCode === 83) {
                     var snapGrid = parseInt(localStorage.getItem(SNAPGRID)) || 10;
                     point.x = parseInt(point.x / snapGrid) * snapGrid + ((point.x % snapGrid) < (snapGrid / 2) ? 0 : snapGrid);
                     point.y = parseInt(point.y / snapGrid) * snapGrid + ((point.y % snapGrid) < (snapGrid / 2) ? 0 : snapGrid);
                     }*/
                    this.shapeNode.setPoint(this.pointIndex, point);
                    this.network.fireInteractionEvent({
                        kind: 'liveMovePointEnd',
                        event: e,
                        element: this.shapeNode,
                        pointIndex: this.pointIndex
                    });
                } else if (this.shapeLink && this.pointIndex >= 0 && point) {
                    var oldPoint = this.shapeLink.getPoints().get(this.pointIndex);
                    if (this.horizontal) {
                        point.y = oldPoint.y;
                    }
                    if (this.vertical) {
                        point.x = oldPoint.x;
                    }
                    this.shapeLink.setPoint(this.pointIndex, point);
                    this.network.fireInteractionEvent({
                        kind: 'liveMovePointEnd',
                        event: e,
                        element: this.shapeLink,
                        pointIndex: this.pointIndex
                    });
                } else if (this.linkUI && point) {
                    this.linkUI.setControlPoint(point);
                    this.network.fireInteractionEvent({ kind: 'liveMovePointEnd', event: e, element: this.linkUI._element });
                }
            }
            this._handle_mouseup(e);
            this.clear();
        },
        _isEditingShapeNode: function (point, e) {
            if (this.node instanceof twaver.ShapeNode) {
                this.shapeNode = this.node;
                var points = this.shapeNode.getPoints();
                var editPointSize = this.network.getEditPointSize();
                for (var i = 0, n = points.size(); i < n; i++) {
                    var p = points.get(i);
                    if (this._contains(point, p, editPointSize)) {
                        if (_twaver.isAltDown(e)) {
                            this._setCursor(this.deletePointCursor);
                        } else {
                            this._setCrossCursor();
                        }
                        this.pointIndex = i;
                        return true;
                    }
                }
                if (!this.shapeNode.getPointIndex) {
                    return false;
                }
                if (this.shapeNode.getPointIndex(point) != null && this.shapeNode.getPointIndex(point) >= 0) {
                    return true;
                }
            }
            this.pointIndex = -1;
            return false;
        },
        _resetShapeNodePoints: function (point) {
            //如果按住了ctrl键,允许任意打点,否则只能水平或竖直
            if (this.lastPoint) {
                if (!_twaver.isCtrlDown(event)) {
                    var dx = point.x - this.lastPoint.x;
                    var dy = point.y - this.lastPoint.y;
                    if (Math.abs(dx) >= Math.abs(dy)) {
                        //水平
                        point.y = this.lastPoint.y;
                    } else {
                        //竖直
                        point.x = this.lastPoint.x;
                    }
                }
            } else {
                this.lastPoint = point;
            }
            nsp.edit.interaction.RoomEditInteraction.superClass._resetShapeNodePoints.call(this, point);
        },
        handle_mousemove: function (e) {
            if (!this.network.isValidEvent(e)) {
                return;
            }
            if (this.isStartRotate) {
                if (this.node) {
                    this._handleRotateElement(e, this.node);
                    if (this.network.isShowRotateScale()) {
                        this.repaint();
                    }
                    return;
                }
            }
            if (this.isStart) {
                if (this.shapeNode && this.pointIndex >= 0) {
                    this._handleMovingShapeNodePoint(e);
                    var scalePoint = {};
                    return;
                }
                if (this.shapeLink && this.pointIndex >= 0) {
                    this._handleMovingShapeLinkPoint(e);
                    return;
                }
                if (this.node && this.resizeDirection) {
                    this._handleResizing(e);
                    return;
                }
                if (this.linkUI) {
                    this._handleMovingLinkControlPoint(e);
                    return;
                }
                var point = this.network.getLogicalPoint2(e);
                if (this.node &&
                    (this.node instanceof twaver.ShapeNode) &&
                    this.node.getPointIndex(point) &&
                    this.node.getPointIndex(point) >= 0) {
                    this.network._dragToPan = false;
                    return;
                }
                return;
            }

            this.lastPoint = null;

            var element = this.network.getElementAt(e);
            if (element && !$utils.isMoveModel(element)) {
                //判断是否是禁止移动的对象
                return;
            }

            if (this.network.isSelectingElement() || this.network.isMovingElement() || this.network.getSelectionModel().size() === 0) {
                this.clear();
                return;
            }

            //        var element = this.network.getElementAt(e);
            var elementUI = this.network.getElementUI(element);
            if (!elementUI || !elementUI.getEditAttachment()) {
                this.clear();
                return;
            }

            var point = this.network.getLogicalPoint2(e); //this.network.getLogicalPoint(e);
            if (element instanceof twaver.ShapeNode) {
                point = this.network.getLogicalPoint(e); //getLogicalPosition(e) 2015-01-04
            }
            if (element instanceof twaver.Node) {
                this.node = element;
                if (this.node instanceof make.Default.Block) {
                    this.network._dragToPan = false;
                    //                var logical_point = this.network.getLogicalPoint(e);
                    //                if(this._isResizingNode(logical_point)){
                    //                    this.network.setEditingElement(true);
                    //                }
                    this.isStart = true;
                    //                this.resizeDirection = true;
                    return;
                }
                if (this._isEditingShapeNode(point, e) || this._isResizingNode(point)) {
                    this.network.setEditingElement(true);
                    return;
                }
                if (this._isRotatingElement(point)) {
                    this.network.setRotatingElement(true);
                    this.network.setEditingElement(true)
                    return;
                }
            } else if (element instanceof twaver.ShapeLink) {
                this.shapeLink = element;
                if (this._isEditingShapeLink(point)) {
                    this.network.setEditingElement(true);
                    return;
                }
            } else if (elementUI instanceof twaver.network.LinkUI) {
                if (twaver.Link.isOrthogonalLink(elementUI._element)) {
                    this.linkUI = elementUI;
                    var controlPoint = this.linkUI.getControlPoint();
                    if (controlPoint && this._contains(point, controlPoint)) {
                        this._setCrossCursor();
                        this.network.setEditingElement(true);
                    }
                    return;
                }
            }
            this.clear();

        },
        handle_mousedown: function (e) {
            if (e.button !== 0) {
                return;
            }

            if (_twaver.isAltDown(e) && !this.network.isEditingElement()) {
                var element = this.network.getElementAt(e);
                var point = this.network.getLogicalPoint(e); //getLogicalPosition(e) 2015-01-04
                if (element instanceof twaver.ShapeNode) {
                    var pointIndex = this.getPointIndex(element.getPoints(), point, true);
                    if (pointIndex > 0) {
                        this._handle_mousedown(e);
                        this.pointIndex = pointIndex;
                        this.shapeNode = element;
                        element.addPoint(point, pointIndex);
                        this._setCrossCursor();
                        this.network.setEditingElement(true);
                        this.isStart = true;
                        this.network.fireInteractionEvent({
                            kind: 'addPoint',
                            event: e,
                            element: element,
                            pointIndex: pointIndex
                        });
                        this.network.fireInteractionEvent({
                            kind: 'liveMovePointStart',
                            event: e,
                            element: element,
                            pointIndex: pointIndex
                        });
                    }
                }
                if (element instanceof twaver.ShapeLink) {
                    var points = new twaver.List(element.getPoints());
                    var shapeLinkUI = this.network.getElementUI(element);
                    points.add(shapeLinkUI.getFromPoint(), 0);
                    points.add(shapeLinkUI.getToPoint());
                    var pointIndex = this.getPointIndex(points, point) - 1;
                    if (pointIndex > 0) {
                        this._handle_mousedown(e);
                        this.pointIndex = pointIndex;
                        this.shapeLink = element;
                        element.addPoint(point, pointIndex);
                        this._setCrossCursor();
                        this.network.setEditingElement(true);
                        this.isStart = true;
                        this.network.fireInteractionEvent({
                            kind: 'addPoint',
                            event: e,
                            element: element,
                            pointIndex: pointIndex
                        });
                        this.network.fireInteractionEvent({
                            kind: 'liveMovePointStart',
                            event: e,
                            element: element,
                            pointIndex: pointIndex
                        });
                    }
                }
                return;
            }

            //        var billboard = this.network.getElementAt(e);
            //        if(billboard && (billboard instanceof twaver.Node)
            //            && billboard.getClient('className')
            //            && billboard.getClient('className') == "mono.Billboard"){ // add 2015-01-06
            //            this.network.setRotatePointSize(0);
            //            return;
            //        }

            if (!this.network.isEditingElement() || this.isStart || this.isStartRotate) {
                return;
            }
            if (this.node && this.resizeDirection) {
                this.isStart = true;
                this._handle_mousedown(e);
                this.network.fireInteractionEvent({
                    kind: this.lazyMode ? 'lazyResizeStart' : 'liveResizeStart',
                    event: e,
                    element: this.node,
                    resizeDirection: this.resizeDirection
                });
            } else if (this.shapeNode && this.pointIndex >= 0) {
                var pointsSize = this.shapeNode.getPoints()._as.length;
                var self = this;
                if (_twaver.isAltDown(e)) {
                    if (pointsSize == 2) {
                        layer.confirm('You will delete the entire wall, Sure to Delete', function index() {
                            self.shapeNode.removeAt(0);
                            self.shapeNode.removeAt(1);
                            self.network.fireInteractionEvent({ kind: 'removePoint', event: e, element: self.shapeNode });
                            self.network.invalidateElementUI(self.shapeNode);
                            layer.close(index);
                        })
                    } else {
                        layer.confirm('Sure to Delete', function (index) {
                            if (pointsSize == 3) {
                                self.shapeNode.setClient("closed", false);
                            }
                            self.shapeNode.removeAt(self.pointIndex);
                            self.shapeNode.getSegments().removeAt(self.pointIndex);
                            self.network.fireInteractionEvent({ kind: 'removePoint', event: e, element: self.shapeNode });
                            layer.close(index);
                        });
                    }
                } else {
                    this.isStart = true;
                    this._handle_mousedown(e);
                    this.network.fireInteractionEvent({
                        kind: 'liveMovePointStart',
                        event: e,
                        element: this.shapeNode,
                        pointIndex: this.pointIndex
                    });
                }
            } else if (this.shapeLink && this.pointIndex >= 0) {
                if (_twaver.isAltDown(e)) {
                    this.shapeLink.removeAt(this.pointIndex);
                    this.network.fireInteractionEvent({ kind: 'removePoint', event: e, element: this.shapeLink });
                } else {
                    this.isStart = true;
                    this._handle_mousedown(e);
                    this.network.fireInteractionEvent({
                        kind: 'liveMovePointStart',
                        event: e,
                        element: this.shapeLink,
                        pointIndex: this.pointIndex
                    });
                }
            } else if (this.linkUI) {
                this.isStart = true;
                this._handle_mousedown(e);
                this.network.fireInteractionEvent({ kind: 'liveMovePointStart', event: e, element: this.linkUI._element });
            } else if (this.shapeNode) {
                this.isStart = true;
            } else if (this.node) {
                if (this.node.getClient('className') && this.node.getClient('className') == "mono.Billboard") { // add 2015-01-06
                    //                this.network.setRotatePointSize(0);
                } else {
                    this.isStartRotate = true;
                    this._handle_mousedown(e);
                }
            }
        },

        clear: function () {
            nsp.edit.interaction.RoomEditInteraction.superClass.clear.apply(this, arguments);
            //this.network._dragToPan = true;                 //
            this.network.setRotatePointSize(twaver.Defaults.NETWORK_ROTATE_POINT_SIZE);
        }
    });

    nsp.edit.interaction.RoomListener = function (network, propertySheetPane, jsonBox) {
        nsp.edit.interaction.RoomListener.superClass.constructor.apply(this, arguments);
        this.network = network;
        this.propertySheetPane = propertySheetPane;
        this.jsonBox = jsonBox;
        this.box2d = this.network.getElementBox();

        this.initLayer();

    }
    twaver.Util.ext(nsp.edit.interaction.RoomListener, Object, {
        initLayer: function () {
            var layerBox = this.box2d.getLayerBox();
            for (var i = 100; i <= 900; i += 100) {
                var layer = new twaver.Layer(i);
                layerBox.add(layer);
            }
        },

        initRoomSettings: function () {
            this.network.enableSingleOrientationMove = false;
            this.network.getView().setAttribute('draggable', 'true');
            this.network.setEditPointFillColor('yellow');
            this.network.setEditPointOutlineColor('#333333');
            this.network.setEditPointOutlineWidth(1);
            this.network.setEditPointSize(10);
            this.network.setResizePointSize(0);
            this.network.setToolTipEnabled(false);
            // this.network.setZoomManager(new twaver.vector.LogicalZoomManager(this.network, true));
            //this.network.setMaxZoom(3);
            //this.network.setMinZoom(0.2);
            // this.network.setViewRect(-500, -300);

            this.network.setKeyboardRemoveEnabled(false);
            this.network.setRotatePointFillColor('yellow');

            this.interactions2d = [
                new nsp.edit.interaction.RoomDragInteraction(this.network, this.propertySheetPane, this.jsonBox),
                new nsp.edit.interaction.RoomEditInteraction(this.network),
                new twaver.vector.interaction.DefaultInteraction(this.network)
            ];
            this.network.setInteractions(this.interactions2d);

            this.installNetwork2dFunctions(this.network);
            this.installNetwork2dListeners(this.network);
        },

        installNetwork2dFunctions: function (network) {
            var self = this;
            network.isRotatable = function (element) {
                //门窗,禁止默认的编辑,移动等操作
                if ($utils.isChild(element)) {
                    return false;
                }
                return $utils.isEditModel(element);
            }

            network.isEditable = function () {
                return true
            };

            network.setMovableFunction(function (element) {
                //门窗,禁止默认的编辑,移动等操作
                if ($utils.isChild(element)) {
                    return false;
                }
                return $utils.isMoveModel(element);
            });

            network.setEditableFunction(function (element) {
                //门窗,禁止默认的编辑,移动等操作
                if ($utils.isChild(element)) {
                    return false;
                }
                return $utils.isEditModel(element);
            });
        },

        installNetwork2dListeners: function (network) {
            var self = this;
            //network.getElementBox().getSelectionModel().addSelectionChangeListener(this.handleSelectionChange, this);
            network.getElementBox().addDataBoxChangeListener(this.handleDataBoxChange, this);

            network.addElementByInteraction = function (element) {
                twaver.vector.Network.prototype.addElementByInteraction.call(this, element);
                setTimeout(function () {
                    self.network.setInteractions(self.interactions2d);
                }, 100);
            };

        },

        /**
         * 2D的dataBox change事件
         * 将node挪到制定的层
         * 如果是墙体,overview
         * @param e
         */
        handleDataBoxChange: function (e) {
            var self = this;
            var kind = e.kind,
                data = e.data;
            if (kind === 'add') {
                var id2d = $utils.getSceneEditorModel2dId(data.getClient('id'));
                data.setLayerId(make.Default.getOtherParameter(id2d, 'layer') || 900);
                var type = make.Default.getOtherParameter(id2d, 'type');
                if (type && type.indexOf('wall') >= 0) {
                    //setTimeout(function () {
                    //    self.network.zoomOverview();
                    //}, 100)
                }
            }
        },

    });
})(window);