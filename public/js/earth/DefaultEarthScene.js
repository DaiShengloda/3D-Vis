
/**
 *  默认的内置地球，此地球更其他场景同用一个network
 *
 * 3D的地球，要不对于3D的地球，用一个单独的network来处理,但是box用同一个，这样避免
 * 当和其他的场景切换时，通过不断的改变body的children来处理
 * 这样就好处理多了：比如eart场景跟其他的场景的network的属性很多不一样，light也不一样，这样可以避免不断的设置这些属性
 *
 *
 * 可是很多的操作都是跟scene中的network有关联的，如：lookAt等
 *
 * 显示它时，从dataManager中获取所有的数据中心的data，或者是earth的所有的孩子(不认为是孩子，我们暂时认为earth是个Scene，并不是data的实例)
 *
 * 可是我们中统一的是从scene对应的data开始加载的（rootScene开始时），这样的话还是earth的data的实例
 *
 *
 * @param sceneManager
 * @constructor
 */

it.DefaultEarthScene = function (sceneManager, scene) {

    sceneManager.defaultEarthScene = this;
    this.sceneManager = sceneManager;
    this.dataManager = this.sceneManager.dataManager;
    this.network = this.sceneManager.network3d;
    this.box = this.network.getDataBox();
    this.camera = this.network.getCamera();
    this.animates = [];
    this.defaultInteractions = null;
    this.scene = scene;
    if (!this.scene) {
        throw "scene can not be null '";
    }
    this.earthDataMap = this.dataManager.getDataMapByCategory(this.scene.getCategoryId()); //可是如果有多个earth的Data怎么搞？
    //缓存地球场景相关的所有点灯光
    this.lightMaps = [];
    //缓存地球场景相关的所有交互
    this.interactions = [];
    //数据中心scale的大小
    this.PIN_ICON_WIDTH = 60;
    this.PIN_ICON_HEIGHT = 40;
    this.rootData = null;
    this.dataCenterNodeMap = {};
    this._afterLookAtListener = []; //lookAt到地球上的dc后触发
    this.init();
};

mono.extend(it.DefaultEarthScene, Object, {

    init: function () {
        this.initNetwork();
        this.initDataBox();
        var self = this;
        if (!this._customImage) {
            //当鼠标移动时，显示划过省或国家的信息
            var $nd = $('<div id="earthTip"></div>').appendTo($(document.body));
            this._earthTipComp = $nd;
            $nd[0].style.cssText = 'position:absolute;display:none;border-style:solid;white-space:nowrap;z-index:9999999;transition:left 0.4s cubic-bezier(0.23, 1, 0.32, 1),top 0.4s cubic-bezier(0.23, 1, 0.32, 1);-webkit-transition:left 0.4s cubic-bezier(0.23, 1, 0.32, 1),top 0.4s cubic-bezier(0.23, 1, 0.32, 1);-moz-transition:left 0.4s cubic-bezier(0.23, 1, 0.32, 1),top 0.4s cubic-bezier(0.23, 1, 0.32, 1);-o-transition:left 0.4s cubic-bezier(0.23, 1, 0.32, 1),top 0.4s cubic-bezier(0.23, 1, 0.32, 1);background-Color:rgba(50,50,50,0.7);border-width:0px;border-color:#333;border-radius:4px;color:#fff;font:normal normal 14px sans-serif;line-height:21px;padding:5px 5px 5px 5px;;left:0px;top:0px;';
            var f = function (e) {
                self.handleMouseMoveTip($nd, e);
            }
            this.sceneManager.addSceneChangeListener(function (e) {
                var scene = e.data;
                if (scene.getId() === 'earth') {
                    self.network.getRootView().addEventListener('mousemove', f);
                    // console.log(self.network.getRootView().getEventListener());
                } else {
                    $nd.css({display: 'none'});
                    self.network.getRootView().removeEventListener('mousemove', f);
                }
            });
        }
        
    },

    /**
     * 初始化network，这里不需要再记录network的原始属性了
     *
     * network的设置都放到了scene中了，当SceneChange时更加Scene中的来设置
     */
    initNetwork: function () {
        this.defaultInteractions = this.network.getInteractions();
        var interaction = new mono.DefaultInteraction(this.network);
        interaction.maxDistance = 3000;
        interaction.minDistance = 600;
        this.interactions.push(interaction);
        this.network.setInteractions(this.interactions);
        this.network.orgIsSelectable = this.network.isSelectable;
        this.filterDoubleClickElement = this.sceneManager.viewManager3d.filterDoubleClickElement;

        //清空box中所有data，包括灯光
        this.box.clear(true);
        this.box.add(new mono.AmbientLight(0xFFFFFF));

        this.resetCamera();
        this.resetNetwork();
    },

    createEarthImage : function(){
        return new $EarthMap();
    },

    //创建地球
    initDataBox: function () {
        if (!this.earthObj) {
            //获取地球数据
            for (var id in this.earthDataMap) {
                var earthData = this.earthDataMap[id];
                if (earthData) {
                    this.rootData = earthData;
                }
            }
            //获取地球的dataType
            var dataType = this.dataManager.getDataTypeForData(this.rootData);
            var model = dataType.getModel();
            var modelParam = dataType.getModelParameters();
            //从make获取到所有category为earth的模型id
            var eIds = make.Default.getIds(function (params) {
                if (params.sdkCategory === 'earth') {
                    return true;
                }
            });
            //判断是否自定义了地球贴图, 放到这里判断是因为modelParam在下面的loadModel后，会增加默认属性，影响判断的准确性
            this._customImage = false;
            for (var i = 0; i < modelParam.length; i++) {
                var mp = modelParam[i];
                if (eIds.indexOf(mp.id) > -1 && mp.image) {
                    this._customImage = true;
                }
            }
            
            //从make中加载地球和天空盒，并设置地球和天空盒的notLookAt属性
            var objects = this.sceneManager.loadModel(model, modelParam);
            var earth;
            if (objects instanceof Array && objects.length > 0) {
                for (var i = 0; i < objects.length; i++) {
                    objects[i].setClient('notLookAt', true);
                    if (objects[i].getClient('type') == 'earth') {
                        earth = objects[i];
                    }
                    this.box.addByDescendant(objects[i]);
                }
            } else {
                earth = objects;
                earth.setClient('notLookAt', true);
                this.box.addByDescendant(objects);
            }
            //设置earth上data和dataId的client属性
            earth.setClient(it.SceneManager.CLIENT_IT_DATA, this.rootData);
            earth.setClient(it.SceneManager.CLIENT_IT_DATA_ID, this.rootData.getId());
            this.sceneManager.dataNodeMap[id] = earth;

            //如果设置地球贴图，用系统默认
            if (!this._customImage) {
                //设置地球的由2dnetwork生产的贴图
                var earthMap = this.earthMap = new $EarthMap();
                earth.s({
                    'm.texture.image': earthMap.getCanvas()
                });
                var f = function () {
                    setTimeout(function () {
                        if (earthMap._loaded) {
                            earth.s({
                                'm.texture.image': earthMap.getCanvas()
                            });
                            earth.invalidateTexture();
                        } else {
                            f();
                        }
                    }, 500);
                }
                f();
                earthMap.network.addViewListener(function (e) {
                    if (earthMap._loaded && e.kind === 'validateEnd') {
                        earth.invalidateTexture();
                    }
                }, this);
            }
            this.earthObj = objects;
        } else {
            if (this.earthObj instanceof Array && this.earthObj.length > 0) {
                for (var i = 0; i < this.earthObj.length; i++) {
                    this.box.addByDescendant(this.earthObj[i]);
                }
            } else {
                this.box.addByDescendant(this.earthObj);
            }
            //2017-10-10 场景切换时内存会释放，dataNodeMap中会清空，因此再次进入地球场景时，需要放到缓存中
            var earthNode = null;
            if (this.earthObj instanceof Array && this.earthObj.length > 0) {
                for (var i = 0; i < this.earthObj.length; i++) {
                    if (this.earthObj[i].getClient('type') == 'earth') {
                        earthNode = this.earthObj[i];
                    }
                }
            } else {
                earthNode = this.earthObj;
            }
            this.sceneManager.dataNodeMap[this.rootData.getId()] = earthNode; 
        }
        //创建数据中心
        this.createDataCenters();
    },

    handleMouseMoveTip: function ($nd, e) {
        if (this._showingInfo)return;
        var self = this, tipGap = 20;
        if (!e.which) {
            var fco = it.Util.findFirstObjectByMouse(self.network, e);
            if (fco) {
                var ele = fco.element;
                if (!ele || ele && ele.getClient('type') !== 'earth')return;
                var tip = self.earthMap.overNode(fco.uv);
                if (tip) {
                    var t = e.clientY + tipGap + 'px', l = e.clientX + tipGap + 'px';
                    if (tip.text) {
                        $nd.css({top: t, left: l, display: 'block'}).text(tip.text);
                    } else if (tip.move) {
                        $nd.css({top: t, left: l})
                    }
                } else {
                    $nd.css({display: 'none'});
                }
            }
        }
    },

    //重置camera的设置
    resetCamera: function () {
        //重置摄像头
        // this.camera.look(0, 0, 0);
        // this.camera.setPosition(300, 700, 2600);
        this.camera.look(26, 39, -26);
        this.camera.setPosition(980, 1182, 2577);
        this.camera.setFov(30);
        var self = this;
        //添加摄像头的监听
        this.camera.addPropertyChangeListener(function (e) {
            if (e.property === 'position') {
                var dist = self.camera.getPosition().length();
                if (dist > 1000) {
                    if (self.network.showingDataCenter) {
                        self.hideInfo();
                        self.network.showingDataCenter.swingAnimate.stop(true);
                        self.network.showingDataCenter = null;
                    }
                }
                self.updateLocations(self.box, self.camera);
            }
        });
    },

    //重置network的设置
    resetNetwork: function () {
        //添加network的鼠标监听
        mono.addEventListener('mousemove', 'handleMouseMove', this.network.getRootView(), this);
        mono.addEventListener('click', 'handleClick', this.network.getRootView(), this);
        mono.addEventListener('mousedown', 'handleMouseDown', this.network.getRootView(), this);
        //设置双击的过滤器
        var self = this;
        this.sceneManager.viewManager3d.filterDoubleClickElement = function (e) {
            return self.getFirstElement(e);
        }
        this.network.isSelectable = function (data) {
            return false
        }
    },

    afterPlayMap: function (data) {

    },

    //第二次加载地球场景
    refresh: function () {
        if (this.interactions) {
            this.network.setInteractions(this.interactions);
        }
        this.resetNetwork();
        this.resetCamera();
        this.initDataBox();
        this.sceneManager.viewManager3d.defaultMaterialFilter.removeByDescendant(this.rootData);
        this.doPlay();
    },

    createDataCenters: function () {
        //获取地球数据下面的孩子数据，并创建
        var dataCenters = this.rootData.getChildren();
        if (dataCenters && dataCenters.size() > 0) {
            var self = this;
            dataCenters.forEach(function (child) {
                self.createDataCenter(child);
            });
        }
    },

    /**
     * 将经纬度转换成(x,y,z)
     * @param longitude 经度、经线
     * @param latitude 纬度
     *
     * 计算方法：先沿着Y轴切开，算出新的“x-z”平面的新半径；
     *
     * 不能先沿着z轴切开?(因为纬度不一定经过圆心，而经度一定会经过圆心的)
     *
     * 纬度：地球的贴图是从纬度-169开始的(即经度-169对应“z-x”平面(0,-r)的位置，即(0,r)对应的是纬度-11的位置)
     * 因此来的纬度都得减上11；减了11后如果小于了-180，那就360去加
     *
     * 新图片，贴图从纬度2开始
     *
     * 经度：当于y垂直时才是0，于Y的正向重合是90，于Y的负方向重合是-90
     * 因此：如果longitude>0时就用90-它；如果longitude<0,那就用-90-它
     *
     * 注意：我们的地球贴图上没有南北极，因此计算经度也得减掉
     */
    transplate: function (longitude, latitude) {
        latitude = parseFloat(latitude) - 32;//11.0;
        if (latitude <= -180) {
            latitude = 360.0 + latitude;
        }
        longitude = parseFloat(longitude);
        if (longitude >= 0) {
            longitude = 90 - longitude;
        }
        if (longitude < 0) {
            longitude = -90 - longitude;
        }
        var y = Math.cos(latitude * Math.PI / 180) * this.radius; //用纬度来算高度，纬度是跟平面的夹角
        var newR = Math.sin(latitude * Math.PI / 180) * this.radius; //用纬度来算新的半径
        var z = Math.cos(longitude * Math.PI / 180) * newR;
        var x = Math.sin(longitude * Math.PI / 180) * newR;//this.radius;
        return {x: x, y: y, z: z};
    },

    //根据data创建3d对象并添加到box中
    createDataCenter: function (data) {
        if (!data) {
            return;
        }
        //获取datacenter的position，地球场景中取到的是position作为数据中心的位置。用这种方式来代替之前的经纬度坐标
        var position = data.getPosition() || {x: 0, y: 0, z: 0};
        var x = position.x;
        var y = position.y;
        var z = position.z;
        var dataType = this.dataManager.getDataTypeForData(data);
        //地球上的数据中心获取的是data简单模型，园区场景中用的是Model
        var model = dataType.getSimpleModel(),
            modelParam = dataType.getSimpleModelParameters();
        //创建datacenter并设置client属性
        var dc = this.sceneManager.loadModel(model, modelParam);
        dc.p(x, y, z);
        dc.setClient('name', data.getDescription());
        dc.setClient(it.SceneManager.CLIENT_IT_DATA, data);
        dc.setClient(it.SceneManager.CLIENT_IT_DATA_ID, data.getId());
        // this.sceneManager.dataNodeMap[data.getId()] = dc;
        this.dataCenterNodeMap[data.getId()] = dc;
        this.box.add(dc);
        this.sceneManager._alarmManager._setDataAlarmStateDirty(data);
        this.sceneManager._alarmManager.renderDataAlarm(data);
        var self = this;
        self.PIN_ICON_WIDTH = dc.getScaleX();
        self.PIN_ICON_HEIGHT = dc.getScaleY();
        //创建好后dc会有一个动画
        var animate = new mono.Animate({
            from: 0,
            to: 1,
            delay: 1000,
            dur: 1500,
            easing: 'elasticOut',
            onUpdate: function (value) {
                var dist = self.camera.getPosition().length();
                var scale = dist / 2000;
                dc.setScale(value * self.PIN_ICON_WIDTH * scale, value * self.PIN_ICON_HEIGHT * scale, 1);
            },
        }).play();
        this.animates.push(animate);

        //选中某个dc之后播放的动画
        dc.swingAnimate = new mono.Animate({
            from: 0.5,
            to: 1,
            dur: 1500,
            interval: 500,
            easing: 'elasticOut',
            repeat: Number.POSITIVE_INFINITY,
            reverse: false,
            onUpdate: function (value) {
                var dist = self.camera.getPosition().length();
                var scale = dist / 2000;
                dc.setScale(value * self.PIN_ICON_WIDTH * scale, value * self.PIN_ICON_HEIGHT * scale, 1);
            },
        });
        this.animates.push(dc.swingAnimate);

        var self = this;
        dc.doubliClick = function (element, network, data, clickedObj) {
            var title = network.lastDataCenter.getClient('name');
            var id = network.lastDataCenter.getClient('it_data_id') ? network.lastDataCenter.getClient('it_data_id') : data.getId();
            self.dcDoubleClick(id, title);
        }
    },

    beforeDcDoubleClick : function(){
        this.stopCurrentAnimates();
        this.hideInfo();
        this.network.getRootView().style.cursor = 'default';
        if (this.network.showingDataCenter && this.network.showingDataCenter.swingAnimate) {
            this.network.showingDataCenter.swingAnimate.stop(true);
        }
    },

    dcDoubleClick: function(id, title, callback, e) {
        if (!id) {
            return;
        }
        var data = this.dataManager.getDataById(id);
        if (!data) return;
        title = title || data.getName();
        this.beforeDcDoubleClick();
        // 进入园区的3D场景
        this.network.showingDataCenter = null;
        this.showMap(title, id, callback);
    },


    /**
     * 停止当前正在执行的动画
     */
    stopCurrentAnimates: function () {
        for (var i = this.animates.length - 1; i >= 0; i--) {
            var animate = this.animates[i];
            if (animate) {
                animate.stop();
            }
        }
    },

    // remark By Kevin,位置可以通过saveCamera来处理
    //加载完地球场景后执行的动画 
    doPlay: function () {
        // var self = this;
        // var animate = make.Default.animateCameraPosition(this.camera, new mono.Vec3(435, 521, 1187), 4000);
        // animate.play();
        // this.animates.push(animate);
    },

    //清空场景中的设置
    clear: function () {
        //清空所有动画，并停止执行
        if (this.animates && this.animates.length > 0) {
            for (var i = 0; i < this.animates.length; i++) {
                var animate = this.animates[i];
                animate.stop();
            }
        }
        this.animates = [];
        //重置network上的交互设置
        if (this.defaultInteractions) {
            this.network.setInteractions(this.defaultInteractions);
        }
        //清空network上的鼠标监听以及过滤器
        this.clearNetwork();
    },

    //清空network上的鼠标监听以及过滤器
    clearNetwork: function () {
        mono.removeEventListener('mousemove', this.network.getRootView(), this);
        mono.removeEventListener('click', this.network.getRootView(), this);
        mono.removeEventListener('mousedown', this.network.getRootView(), this);
        if (this.filterDoubleClickElement) this.sceneManager.viewManager3d.filterDoubleClickElement = this.filterDoubleClickElement;
        if (this.orgIsSelectable) this.network.isSelectable = this.orgIsSelectable;
    },

    //DC随着camera的距离而改变大小
    updateLocations: function (box, camera) {
        var self = this;
        var dist = camera.getPosition().length();
        var scale = dist / 2000;
        box.forEach(function (element) {
            if (element.getClient('type') === 'datacenter') {
                element.setScale(self.PIN_ICON_WIDTH * scale, self.PIN_ICON_HEIGHT * scale, 1);
            }
        });
    },

    //获取鼠标下第一个网元，这里只返回dc元素
    getFirstElement: function (e) {
        var filterFunction = function (ele) {
            if (ele.getClient('type') == 'datacenter') {
                return true;
            }
            return false;
        }
        return this.network.getFirstElementByMouseEvent(e, false, filterFunction);
    },

    //鼠标移动到dc上，设置dc的scale值
    handleMouseMove: function (e) {
        var network = this.network;
        var firstClickObject = this.getFirstElement(e);
        var dist = this.camera.getPosition().length();
        var scale = dist / 2000;
        if (firstClickObject) {
            var element = firstClickObject.element;
            if (element.getClient('type') === 'datacenter') {
                if (network.lastDataCenter === element) {
                    return;
                }
                if (network.lastDataCenter) {
                    network.lastDataCenter.setScale(this.PIN_ICON_WIDTH * scale, this.PIN_ICON_HEIGHT * scale, 1);
                }
                element.setScale((this.PIN_ICON_WIDTH + 5) * scale, (this.PIN_ICON_HEIGHT + 5) * scale, 1);
                network.lastDataCenter = element;
                network.getRootView().style.cursor = 'pointer';
                return;
            }
        }
        if (network.lastDataCenter) {
            network.lastDataCenter.setScale(this.PIN_ICON_WIDTH * scale, this.PIN_ICON_HEIGHT * scale, 1);
        }
        network.lastDataCenter = null;
        network.getRootView().style.cursor = 'default';
    },

    //鼠标点击到dc上，镜头移动过去并显示dc的信息，执行改变scale值的动画
    handleClick: function (e) {
        var self = this;
        var network = this.network;
        var camera = this.camera;
        var firstClickObject = this.getFirstElement(e);
        if (!firstClickObject) return;
        var element = firstClickObject.element;
        network.lastDataCenter = element;
        if (network.lastDataCenter) {
            if (network.lastDataCenter === network.showingDataCenter) {
                return;
            }
            network.getRootView().style.cursor = 'default';
            mono.Utils.stopAllAnimates(true);
            var dataCenter = network.lastDataCenter;
            var name = network.lastDataCenter.getClient('name');
            var target = network.lastDataCenter.getPosition().clone();
            var id = network.lastDataCenter.getClient(it.SceneManager.CLIENT_IT_DATA).getId();
            var distScale = 1.3;
            network.lastSelectData = dataCenter;
            var fco = it.Util.findFirstObjectByMouse(self.network, e);
            var animate = make.Default.animateCameraPosition(camera, new mono.Vec3(target.x * distScale, target.y * distScale, target.z * distScale), 1000, function() {
                self.showInfo(network, name, id, fco);
                network.showingDataCenter = dataCenter;
                network.showingDataCenter.swingAnimate.play();
                for (var i = 0; i < self._afterLookAtListener.length; i++) {
                    var l = self._afterLookAtListener[i];
                    l.call(l.scope || self, network.lastSelectData);
                }
            });
            animate.play();
            this.animates.push(animate);
        }
    },

    //鼠标按下后隐藏dc的info div
    handleMouseDown: function (e) {
        var network = this.network;
        if (network.lastDataCenter === network.showingDataCenter) {
            return;
        }
        if (network.showingDataCenter) {
            this.hideInfo();
            network.showingDataCenter.swingAnimate.stop(true);
            network.showingDataCenter = null;
        }
    },

    getRackCount : function(){
        var rackDatas = this.dataManager._categoryDatas['rack'];
        var num = 0;
        for(var id in rackDatas){
            if (id ) {
                num++;
            }
        }
        return num;
    },

    getEquipmentCount : function(){
        var equipmentDatas = this.dataManager._categoryDatas['equipment'];
        var num = 0;
        for(var id in equipmentDatas){
            if (id ) {
                num++;
            }
        }
        return num;
    },

    getInfoTable: function() {
        var text = document.createElement('div');
        text.setAttribute("align", "right");
        var inner = '<table  style="text-align: right;float: right;">' +
            '<tr><td>机柜总数：</td><td>' + this.getRackCount() + '</td></tr>' +
            '<tr><td>服务器：</td><td>' + this.getEquipmentCount() + '</td></tr>' +
            '<tr><td>PUE：</td><td><b id="pue"></b></td></tr>' +
            '</table>';
        text.innerHTML = inner;
        text.style["margin-top"] = "5px";
        text.style["font-family"] = "Microsoft Yahei";
        text.style["font-size"] = "20px";
        text.style.color = "white";
        return text;
    },

    //显示dc的info div
    showInfo: function (network, title, id, e) {
        this._showingInfo = true;
        this._earthTipComp.css({display: 'none'});
        var data = this.dataManager.getDataById(id);
        if (!document.getElementById('info')) {
            var div = document.createElement('div');
            div.setAttribute("id", "info");
            div.style.position = "absolute";
            div.style.zIndex = "100";
            div.style.left = "900px";
            div.style.top = "250px";
            div.style.width = "350px";
            // div.style.height="250px"; 
            div.style.padding = "10px";
            div.style.background = "rgba(120,120,120,0.8)";//"rgba(164, 121, 239, 0.7)";
            //div.style['box-shadow']='10px 10px 5px rgba(80, 80, 80, 0.5)';
            div.style['border-radius'] = '15px';
            div.style['border'] = '1px';
            div.style['border-style'] = 'solid';
            div.style['border-color'] = 'rgba(200,200,200,0.8)';
            div.style['-webkit-user-select'] = 'none';
            div.style.display = "none";
            document.body.appendChild(div);

            var h1 = document.createElement('h1');
            h1.setAttribute("id", "info_title");
            h1.setAttribute("align", "center");
            h1.style["font-family"] = "Microsoft Yahei";
            h1.style["font-weight"] = "normal";
            h1.style["font-size"] = "36px";
            h1.style.margin = "0px";
            h1.style.color = "white";
            div.appendChild(h1);

            div.appendChild(document.createElement('hr'));

            var link = document.createElement('a');
            link.setAttribute('href', '#');
            div.appendChild(link);

            var img = document.createElement('img');
            img.setAttribute("src", "theme/map/" + id + "/icon.jpg");
            img.setAttribute('id', 'img_city');
            img.onerror = function () {
                this.src = "images/icon.jpg";
            }
            img.style.width = "110px";
            img.style.float = "left";
            img.style.border = "3px solid rgb(220, 221, 219)";
            img.style.marginRight = '10px';
            link.appendChild(img);

            var desc = document.createElement('div');
            desc.setAttribute("id", "info_desc");
            desc.setAttribute("align", "left");
            if (data.getDescription()) {
                desc.innerHTML = data.getDescription();
            }
            desc.style["font-family"] = "Microsoft Yahei";
            desc.style["font-size"] = "16px";
            desc.style.color = "white";
            div.appendChild(desc);

            var extend = data.getExtend();
            if (extend && extend.showTotalInfo) {
                var text = this.getInfoTable();
                div.appendChild(text);
            }
        }

        var info = document.getElementById('info');
        info.style.transform = "scaleY(0)";
        info.style.left = document.body.clientWidth / 2 + 50 + "px";
        info.style.display = "block";
        var infoTitle = document.getElementById('info_title');
        infoTitle.innerHTML = data.getName();
        var infoDesc = document.getElementById('info_desc');
        infoDesc.innerHTML = data.getDescription();

        var pue = document.getElementById('pue');
        if (pue) {
            pue.innerHTML = parseInt(100 + Math.random() * 200) / 100;
        }
        var self = this;
        var img = document.getElementById('img_city');
        img.setAttribute("src", "theme/map/" + id + "/icon.jpg");
        //点击图片的时候，隐藏dc的info div，并显示地图层级
        img.onclick = function () {
            self.dcDoubleClick(id, title, null, e);
        }

        //info div的动画显示
        var animate = new mono.Animate({
            from: 0,
            to: 1,
            dur: 1200,
            easing: 'elasticOut',
            onUpdate: function (value) {
                info.style.transform = "scaleY(" + value + ")";
            },
        });
        animate.play();
        this.animates.push(animate);
    },

    hideInfo: function () {
        this._showingInfo = false;
        var info = document.getElementById('info');
        if (info) {
            //info div的动画隐藏
            var animate = new mono.Animate({
                from: 0,
                to: 1,
                dur: 200,
                easing: 'easeOutStrong',
                onUpdate: function (value) {
                    info.style.transform = "scaleY(" + (1 - value) + ")";
                },
                onDone: function () {
                    info.style.display = "none";
                    info.style.cursor = 'default';
                },
            });
            animate.play();
            this.animates.push(animate);
        }
    },

    showMap: function (title, id, callback) {
        var self = this;
        var map = document.getElementById('map');
        var data = this.dataManager.getDataById(id);
        if (!data) {
            data = this.network.lastSelectData.getClient(it.SceneManager.CLIENT_IT_DATA);
        }
        if (!data || !data.getChildren() || data.getChildren().size() < 1) {
            this.network.lastSelectData = null;
            // this.resetNetwork();
            return;
        }
        this.clearNetwork();
        if (!map) { // 没有加载下来的话，点击就直接进入
            map = document.createElement('canvas');
            map.setAttribute('id', 'map');
            map.style.zIndex = 10;
            map.style.position = 'absolute';
            //地图canvas的left和top不好计算，现在是根据界面的值写死的60，60
            map.style.left = '0px';
            map.style.top = '0px';
            map.images = [];
            map.addEventListener('click', function () {
                map.style.display = 'none';
            });
            document.body.appendChild(map);
            self.playMap(map, data, callback);
        }else {
            self.playMap(map, data, callback);
        }
    },

    playMap: function(map, data, callback) {
        this.hideInfo(); //靠点击经常消不掉，playMap时再隐藏一次
        var self = this;
        var network = this.network;
        var width = network.getRootView().clientWidth;
        var height = network.getRootView().clientHeight;
        map['width'] = width;
        map['height'] = height;
        map.style.display = 'block';

        this.beforePlayMap(map, data);

        var images = map.images;
        var centerx = width / 2;
        var centery = height / 2;

        var endCallback = function() {
            if (callback) {
                callback();
            }
            self.afterPlayMap(data);
        };

        var doneAction = function() {
            //12层地图加载完成后保存当前的镜头位置，并进入下一层场景
            network.earthCamera = {
                p: self.camera.p(),
                t: self.camera.t()
            };
            self.gotoDownScene(data || network.lastSelectData.getClient(it.SceneManager.CLIENT_IT_DATA), endCallback);
            map.style.display = 'none';
            network.lastSelectData = null;
        }

        if (images && images.length > 0) {
            //动画绘制每一层地图
            var animate = new mono.Animate({
                from: 0,
                to: images.length,
                dur: 150 * images.length,
                ease: 'easeNone',
                onUpdate: function(value) {
                    var index = Math.floor(value);
                    if (value < images.length) {
                        var image = images[index];
                        var ctx = map.getContext('2d');
                        var scale = value - index;
                        var x = -width * scale / 2;
                        var y = -height * scale / 2;
                        var w = width * (1 + scale);
                        var h = height * (1 + scale);
                        ctx.drawImage(image, x, y, w, h);
                    }
                },
                onDone: function() {
                    // //12层地图加载完成后保存当前的镜头位置，并进入下一层场景
                    // network.earthCamera = {p: self.camera.p(), t: self.camera.t()};
                    // self.gotoDownScene(data || network.lastSelectData.getClient(it.SceneManager.CLIENT_IT_DATA), endCallback);
                    // map.style.display = 'none';
                    // network.lastSelectData = null;
                    doneAction();
                },
            });
            animate.play();
            this.animates.push(animate);
        } else { // 图片没有加载下来就直接进入
            doneAction();
        }
    },

    //paly Map 之前的一些准备工作，比如需要设置map的css
    beforePlayMap: function (map, data) {

    },

    //进入下一层场景
    gotoDownScene: function (data, callback) {
        this.clear();
        var category = this.dataManager.getCategoryForData(data);
        var scene = this.dataManager.getSceneByCategory(category);
        if (this.sceneManager._currentScene == scene) {
            return;
        }
        this.sceneManager.toScene(scene, data, callback);
        if (data) {
            this.sceneManager.viewManager3d.setFocusNode(this.sceneManager.dataNodeMap[data.getId()]);
        }
    },

    addAfterLookAtListener : function(l,scope){
        if(l){
            l.scope = scope;
            this._afterLookAtListener.push(l);
        }
    },

    removeAfterLookAtListener : function(l){
         var index = this._afterLookAtListener.indexOf(l);
        if(index !== -1){
           this._afterLookAtListener.splice(l,1);
        }
    },

});

