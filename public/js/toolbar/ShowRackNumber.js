var $ShowRackNumber = function (sceneManager) {
    var self = this;
    this.sceneManager = sceneManager;
    this.dataManager = this.sceneManager.dataManager;
    // this.sceneManager.addSceneChangeListener(this.sceneChangeHandler, this);
    this.rackBillboards = {};
    this.rackStickers = {};
    // this.rackCates = {};
    this.oldShowType = '';
    this.canvasDatas = {};
    this.args = {
        font: "16px Microsoft Yahei",
        labelColor: "rgb(188, 188, 188)",
        bgColor: "rgba(77, 107, 118, 0.9)",
        radius: 0,
        border: true,
        width:128,
        borderColor:"#00f6ff",
        borderWidth:1
    };
    this.init();
}

mono.extend($ShowRackNumber, Object, {
    init: function(){
        var self = this;
        var url = '/images/select-node.png';
        // var img = this.img =  new Image();
        // img.src = url; 
        this.sceneManager.cameraManager.addAfterPlayCameraListener(function(scene, rootData,oldScene,oldRootData){
            self.sceneChangeHandler({ 
                kind:'changeScene',
                data:scene,
                rootData:rootData,
                oldData:oldScene,
                oldRootData:oldRootData});
        }, this);
    },
    sceneChangeHandler: function (e) {
        if (e.kind != 'changeScene') return;
        if(e.data.getId() != 'floor') return;
        //传进来的值都是已经发生变化的
        this.showCurrentRackNumber();
    },
    doConfirm: function(){
        var self = this;
        // this.systemSetting = JSON.parse(systemSetting)['rackNumberDisplay'];
        self.showCurrentRackNumber();
    },
    showCurrentRackNumber: function(){
        var systemSetting = localStorage.getItem('systemSetting');
        var rackNumberSetting,showType;
        var defaultSrickerConfig = {
            layout: 'horizontal',
            font: 'bold 200px 微软雅黑,sans-serif',
            color: '#fff'
        };
        if(systemSetting && (systemSetting != "[object Object]")){
            rackNumberSetting = JSON.parse(systemSetting)['rackNumberDisplay'];
            if(!rackNumberSetting) return;
            showType = rackNumberSetting['showType'];
            //贴图配置项
            this.stickerConfig = rackNumberSetting['stickerStyle'];
            if(!this.stickerConfig){
                this.stickerConfig = defaultSrickerConfig;
            }
            var racks = this.dataManager.getDataMapByCategory("rack");
            //绘制当前floor所有贴图
            if(showType == 'sticker'){
                this.createTotalCanvas(racks);
            }
            //不显示时，清空缓存
            //2018-3-7 GPU内存大幅增加问题尚未解决
            if(showType == 'none'){
                this.canvasDatas = {};
                //清除plane缓存
                
                for(var id in this.rackStickers){
                    var s = this.rackStickers[id];
                    var sMaterial = s.material.materials[0];
                    // var texture = sMaterial&&sMaterial.map;
                    var texture = sMaterial&&sMaterial.map;
                    if(sMaterial){
                        mono.MaterialPool.unUseMaterial(sMaterial);
                    }
                    if(texture){
                        mono.TexturePool.unUseTexture(texture);
                    }
                }
            }
            //清除所有存在的其它方式
            if(this.oldShowType && (this.oldShowType != showType)){
                this.clearDisplayByShowType(this.oldShowType);
            }
            this.oldShowType = showType;
            for (var rackId in racks) {
                if (this.sceneManager.isCurrentSceneInstance(rackId) ) {
                    //机柜设置一个属性，关于id的显示方式
                    var rack = racks[rackId];
                    this.showRackNumber(showType,rackId);
                }
            }
            this.oldstickerConfig = this.stickerConfig;
        }
    },
    createTotalCanvas: function(){
        if(!this.sceneManager._currentRootData) return;
        var curFloorId = this.sceneManager._currentRootData.getId();
        if(!this.canvasDatas[curFloorId]){
            this.canvasDatas[curFloorId] = this.createFloorCanvas();
        }else{
            //如果改变了颜色，则重新绘制
            var oldColor = this.oldstickerConfig.color;
            var newColor = this.stickerConfig.color;
            if(oldColor == newColor) return;
            this.canvasDatas[curFloorId] = this.createFloorCanvas();
        }
        //将不同楼层、不同显示方式、不同宽高机柜绘制而成的canvas缓存起来，绘制的时候直接调用
    },
    createFloorCanvas: function(){
        //绘制当前场景的贴图
        var resArr = [];
        var racks = this.dataManager.getDataMapByCategory("rack");
        var rackCates = {};
        //找出不同宽高比的机柜
        for (var rackId in racks) {
            if (this.sceneManager.isCurrentSceneInstance(rackId) ) {
                //当前场景的机柜按照宽高分类
                var rackNode = this.sceneManager.dataNodeMap[rackId];
                if(!rackNode){
                    break;
                }
                var rackWidth = rackNode.width,
                    rackHeight = rackNode.depth;
                var rackSize = [rackWidth,rackHeight];
                if(!Object.keys(rackCates).length){
                    rackCates[rackId] = rackSize;
                }else{
                    var eqFlag = false,eqArr = [];
                    for(var id in rackCates){
                        var cRackSize = rackCates[id];
                        eqFlag = cRackSize.every(function(item,index){
                            return item == rackSize[index];
                        });
                        eqArr.push(eqFlag);
                    }
                    var isEqual = eqArr.every(function(val){
                        return val === false;
                    });
                    if(isEqual){
                        rackCates[rackId] = rackSize;
                    }
                }
            }
        }
        
        return this.createCanvasBySize(rackCates);
    },
    showRackNumber: function(showType,rackId){
        if(showType == 'billboard'){
            var b = this.rackBillboards[rackId];
            if(!b){
                this.createTextBillboardById(rackId, this.args);
            }else{
                if(!b.getClient('isShowing')){
                    this.showBillboardById(rackId);
                }
            }
        }else if(showType == 'sticker'){
            this.createStickerById(rackId);
        }
    },
    isObjEqual: function(oldObj,obj){
        if(oldObj && obj){
            for(var i in oldObj){
                if(oldObj[i] != obj[i]){
                    return false;
                }
            }
            return true;
        }else{
            return false;
        }
    },
    clearDisplayByShowType: function(showType){
        switch (showType){
            case 'billboard':
                this.hideAllBillboards();
                break;
            case 'sticker':
                this.hideAllStickers();
                break;
            default:
                break;
        }
    },
    createCanvasBySize: function(rackCates){
        var resContent = [];
        var racks = this.dataManager.getDataMapByCategory("rack");
        var canConfig = {};
        //创建相同型号机柜的数组
        for (var rackId in racks) {
            if (this.sceneManager.isCurrentSceneInstance(rackId) ) {
                var rackNode = this.sceneManager.dataNodeMap[rackId];
                var rackWidth = rackNode.width,
                    rackHeight = rackNode.depth,
                    rackSize = [rackWidth,rackHeight];
                for(var id in rackCates){
                    var tempCate = rackCates[id];
                    var tempWidth = tempCate[0];
                    var tempHeight = tempCate[1];
                    if(rackWidth == tempWidth && (rackHeight == tempHeight)){
                        if(!canConfig[id]){
                            canConfig[id] = [];
                            canConfig[id].push(rackId);
                        }else{
                            canConfig[id].push(rackId);
                        }
                        break;
                    }
                }
            }
        }
        //水平、垂直分开绘制
        var horiObj = {}, vertObj = {};

        horiObj.layout = 'horizontal';
        horiObj.content = [];
        
        vertObj.layout = 'vertical';
        vertObj.content = [];
        for(var configId in canConfig){
            var configArr = canConfig[configId];
            var configLen = configArr.length;
            var configRack = this.sceneManager.dataNodeMap[configId];
            var configRackWidth = configRack.width,
                configRackHeight = configRack.depth;
            var horiConfig = {}, vertConfig = {};
            //将一维数组转化为二维数组
            var resArr = this.numToArr(configLen);
            var x = resArr[0],ext = 0;
            if(resArr[2] > 0){
                ext = 1;
            }
            y = resArr[1] + ext;
            var twoArr = [];
            for(var a=0;a<y;a++){
                twoArr.push(configArr.slice(a*x,(a+1)*x));
            }
            var maxLen = 0, maxLenId;
            configArr.forEach(function(id){
                var textLen = id.length;
                if(textLen > maxLen){
                    maxLen = textLen;
                    maxLenId = id;
                }
            });
            //传给每个机柜的配置  有width\height\length\canvas
            horiConfig.canvas = this.createAllCanvas(twoArr,configRackHeight,configRackWidth,x,y,maxLenId);
            horiConfig.width = configRackWidth;
            horiConfig.height = configRackHeight;
            horiConfig.x = x;
            horiConfig.y = y;
            horiObj.content.push(horiConfig);
            
            vertConfig.canvas = this.createAllCanvas(twoArr,configRackHeight,configRackWidth,x,y,maxLenId);
            vertConfig.width = configRackWidth;
            vertConfig.height = configRackHeight;
            vertConfig.x = x;
            vertConfig.y = y;
            vertObj.content.push(vertConfig);
        }
        resContent.push(horiObj,vertObj);
        return resContent;
    },
    getCanvasMinPower: function(len,id){
        if(!len) return;
        if(!id) return;
        var power;
        var can = document.createElement('canvas');
        var cxt = can.getContext('2d');
        cxt.font = 'bold 12px "Microsoft Yahei" ';
        var canWidth = cxt.measureText(id).width * len;
        var tempNum = 0;
        while(Math.pow(2,tempNum) < canWidth){
            tempNum++;
        }
        return tempNum;
    },
    createAllCanvas: function(arr,w,h,x,y,maxLenId){
        //所有机柜的最大宽度加起来不超过2的50次幂
        //canvas显示的最大宽度为2的14次幂  即16384
        //这里用二维数组创建大canvas
        //根据最小字体12、最长字体预估一个最小的canvas
        var power = this.getCanvasMinPower(x,maxLenId);

        var canvas =  document.createElement('canvas');
        var canWidth = Math.pow(2,power);
        canvas.width = canWidth;
        var basicWidth = canWidth / x;
        var basicHeight = basicWidth / w * h;
        var canHeight =  mono.Utils.nextPowerOfTwo(basicHeight * y);
        basicHeight = canHeight / y;
        canvas.height = canHeight;
        var cxt = canvas.getContext('2d');
        cxt.font = 'bold 14px "Microsoft Yahei" ';
        cxt.textBaseline = 'middle';
        cxt.textAlign = 'center';
        var textPosX,textPosY;
        for(var i=0;i<y;i++){
            textPosY = (2*i+1)/(y*2)*canHeight;
            for(var j=0;j<x;j++){
                textPosX = (2*j+1)/(x*2)*canWidth;
                var text = arr[i][j];
                if(text){
                    var node = this.sceneManager.dataNodeMap[text];
                    node.setClient('stickerOrderI',i);
                    node.setClient('stickerOrderJ',j);
                    var ex = /(\d+)px/g.exec(cxt.font);
                    var fz = ex[1], newFz;
                    if(fz < 12){
                        newFz = 12;
                    }else{
                        var newWidth = basicWidth / 10 * 17;
                        if(text.length < maxLenId.length){
                            newWidth = basicWidth / 10 * (6+text.length);
                        }
                        newFz = newWidth / text.length;
                    }
                    cxt.font = newFz+'px "Microsoft Yahei"';
                    var textWidth = cxt.measureText(text).width;
                    cxt.fillStyle = this.stickerConfig.color || '#000';
                    cxt.fillText(text,textPosX,textPosY);
                }
            }
        }
        return canvas;
    },
    numToArr: function (num){
        if(isNaN(num)) return;
        var sqrtNum = Math.floor(Math.sqrt(num));
        var divisionNum = Math.floor(num/sqrtNum);
        var remainNum = num%sqrtNum;
        return [sqrtNum,divisionNum,remainNum];
    },
    createStickerById: function(rackId){
        var layout = this.stickerConfig.layout || 'horizontal';
        var node = this.sceneManager.dataNodeMap[rackId];
        if(!node) return;
        var data = this.sceneManager.getNodeData(node);
        if(!data) return;
        //从当前场景中绘制好的canvas截取对应贴图
        var rackWidth = node.width,
            rackHeight = node.depth;
        var stickerOrderI = node.getClient('stickerOrderI');
        var stickerOrderJ = node.getClient('stickerOrderJ');
        if(!this.sceneManager._currentRootData) return;
        var curFloorId = this.sceneManager._currentRootData.getId();
        var curConfigs,curCanvas,curLen;
        this.canvasDatas[curFloorId].forEach(function(canData){
            for(var con in canData){
                if(con == 'layout'){
                    if(canData[con] == layout){
                        curConfigs = canData['content'];
                        curConfigs.forEach(function(config){
                            var conWidth = config.width;
                            var conHeight = config.height;
                            if(conWidth == rackWidth && (conHeight == rackHeight)){
                                curCanvas = config.canvas;
                                curX = config.x;
                                curY = config.y;
                            }
                        });
                    }
                }
            }
        })

        if(curCanvas && curX && curY){
            var bb = node.getBoundingBox();
            var min = bb.min,max = bb.max;
            var bWidth = bb.size().x;
            var bHeight = bb.size().z;

            var labelWidth,labelHeight,labelRotationZ;
            if(layout == 'horizontal'){
                labelWidth = bHeight - 8;
                labelHeight = bWidth - 2;
                labelRotationZ = -Math.PI / 2;
            }else{
                labelWidth = bWidth -2;
                labelHeight = bHeight -8;
                labelRotationZ = 0;
            }
            
            var labelNode = this.rackStickers[rackId];
            if(!labelNode){
                labelNode = new mono.Plane(labelWidth,labelHeight,1,1)
            }else{//如果已经显示且配置值不变，则不重复绘制了
                if(labelNode.getClient('isShowing') && this.isObjEqual(this.oldstickerConfig,this.stickerConfig)){
                    return;
                }
                labelNode.setWidth(labelWidth);
                labelNode.setHeight(labelHeight);
            }
            labelNode.s({
                'm.texture.image': curCanvas,
                'm.texture.anisotropy': 8,
                'm.texture.repeat': new mono.Vec2(1/curX, 1/curY),
                'm.texture.offset': new mono.Vec2(stickerOrderJ/curX, (curY - 1 -stickerOrderI)/curY),
                'm.transparent': true
            });
            labelNode.setRotationX(-Math.PI / 2);
            labelNode.setRotationZ(labelRotationZ);
            labelNode.setSelectable(false);
            labelNode.p((min.x + max.x) / 2, max.y + 2, (min.z + max.z) / 2);
            // labelNode.setParent(node);
            labelNode.setClient(it.SceneManager.CLIENT_IT_DATA,data);
            labelNode.setClient(it.SceneManager.CLIENT_IT_DATA_ID,data.getId());
            labelNode.setClient('isShowing',true);
            if(labelNode.getParent() != node){
                this.sceneManager.network3d.dataBox.add(labelNode);
                labelNode.setParent(node);
            }
            this.rackStickers[rackId] = labelNode;
        }
    },
    hideAllStickers: function(){
        if(!this.rackStickers) return;
        for (var p in this.rackStickers) {
            var s = this.rackStickers[p];
            s.setParent(null);
            s.setClient('isShowing',false);
            this.sceneManager.network3d.dataBox.remove(s);
        }
        this.rackStickers = {};
    },
    createTextBillboardById: function (dataId, args) {
        var node = this.sceneManager.dataNodeMap[dataId];
        var board = this.createTextBillboard(dataId || '', args);
        var bb = node.getBoundingBox();
        board.setParent(node);
        //如果机柜的父亲为通道，则高度要算上通道高度
        var pNode,pData,pCateId,realY,pBb;
        pNode = node.getParent();
        pData = this.sceneManager.getNodeData(pNode);
        pCateId = this.dataManager.getCategoryForData(pData).getId();
        if(pCateId == 'channel'){
            pBb = pNode.getBoundingBox();
            realY = pBb.max.y + board.contentHeight/2;
        }else{
            realY = bb.max.y;
        }
        board.p(0, realY, bb.max.z);
        board.setClient('isShowing',true);
        this.sceneManager.network3d.dataBox.add(board);
        this.rackBillboards[dataId] = board;
    },
    createTextBillboard: function (text, args) {
        var c = this.getTextBillboardContent(text, args);
        var board = new mono.Billboard();
        board.s({
            'm.texture.image': c,
            'm.transparent': true,
            'm.alignment': mono.BillboardAlignment.bottomCenter,
            'm.vertical': false,
            'm.texture.wrapS': mono.ClampToEdgeWrapping,
            'm.texture.wrapT': mono.ClampToEdgeWrapping,
            'm.vertical': true
        });
        board.setScale(c.width / 2, c.height / 2, 1);
        board.setSelectable(false);
        board.contentWidth = c.width;
        board.contentHeight = c.height;
        board.isTextBillboard = true;
        return board;
    },
    getTextBillboardContent: function (label, args) {
        args = args || {};
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        context.font = args.font;
        var array = [];
        if (label.indexOf("\n")) {
            array = label.split("\n");
        } else {
            array = [label]
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
        var c_width = args.width || mono.Utils.nextPowerOfTwo(length);
        var oHeight = size.height;
        var arrowHeight = oHeight / 4;
        var arrowWidth = oHeight / 2;
        var c_height = mono.Utils.nextPowerOfTwo(oHeight + arrowHeight);
        canvas.height = c_height;
        canvas.width = c_width;
        var lineHeight = (c_height-arrowHeight) / array.length;
        var oLineHeight = oHeight / array.length;
        args = it.Util.ext({
            labelColor:'white',
            width: c_width,
            height: c_height,
            radius: (c_height / 8),
            arrowWidth: arrowWidth,
            arrowHeight: arrowHeight,
            canvas: canvas
        }, args);
        it.Util.getBillboardContent(args);
        context.fillStyle = args.labelColor;
        context.textBaseline = 'middle';
        context.font = args.font;
        for (var i = 0; i < array.length; i++) {
            var text = array[i];
            length = context.measureText(text).width;
            context.fillText(text, (c_width - length) / 2, lineHeight * (i + 0.5));
        }
        return canvas;

    },
    hideAllBillboards: function () {
        if(!this.rackBillboards) return;
        for (var p in this.rackBillboards) {
            var b = this.rackBillboards[p];
            b.setParent(null);
            b.setClient('isShowing',true);
            this.sceneManager.network3d.dataBox.remove(b);
        }
    },
    showBillboardById: function(id){
        //如果已经创建则返回
        var node = this.sceneManager.getNodeByDataOrId(id);
        var b = this.rackBillboards[id];
        // if(b && (b.getParent() == node)) return;
        b.setParent(node);
        b.setClient('isShowing',false);
        this.sceneManager.network3d.dataBox.add(b);
    },
    showAllBillboards: function () {
        for (var p in this.rackBillboards) {
            var node = this.sceneManager.getNodeByDataOrId(p);
            var b = this.rackBillboards[p];
            b.setParent(node);
            this.sceneManager.network3d.dataBox.add(b);
        }
    }
});
it.ShowRackNumber = $ShowRackNumber;