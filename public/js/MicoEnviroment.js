/**
 * 微环境
 * 主要思想：获取当前场景下的所有的机柜，然后将机柜的贴图换掉
 * 疑问：1、该模式下机柜是否可点中，并且机柜的门是否可以打开
 *      2、创建该机柜的温度贴图的数据源来自哪里，也是collector么？
 */
var $MicoEnviroment = function(sceneManager){
    this.sceneManager = sceneManager;
    this.box = this.sceneManager.network3d.getDataBox();
    this.visibleManager = new it.VisibleManager(this.sceneManager);
    this.sceneManager.viewManager3d.addVisibleFilter(this.visibleManager);
    this.fakes = {};
    this.billboards = {};
    this.isShow = false;
    this.canvas =  document.createElement('canvas');
//    this.heatMap = new it.HeatMap2D({width: width,
//        height: height,
//        positionX: 0,
//        positionY: 0});
    this.heatMap = new it.HeatMap({width: 100,
        height: 100,
        positionX: 0,
        positionY: 0});
};

mono.extend($MicoEnviroment,Object,{

    show : function(){
        var datas = this.sceneManager.getSceneDatas();
        var focusNode = this.sceneManager.viewManager3d.getFocusNode();
        var data = this.sceneManager.getNodeData(focusNode);
        // if(datas){
        //     for(var id in datas){
        //         var data = datas[id];
        //         var random = parseInt(Math.random()*10);
        //         if(random%10 === 0){ //随机抽取1/10的显示
        //             this.createImageByData(data);
        //         }
        //     }
        // }
        if(data){
            this.createImageByData(data);
        }
        this.isShow = true;
    },

    clear : function(){
//        this.sceneManager.viewManager3d.removeVisibleFilter(this.visibleManager);
        this.visibleManager.clear();
        for(var id in this.fakes){
            var fake = this.fakes[id];
            if(fake){
                fake.setParent(null);
                this.box.remove(fake);
                delete this.fakes[id];
            }
        }
        for(var id in this.billboards){
            var billboard = this.billboards[id];
            if(billboard){
                this.box.remove(billboard);
                delete this.billboards[id];
            }
        }
        this.isShow = false;
    },

    createImageByData : function(data){
        var category =  this.sceneManager.dataManager.getCategoryForData(data);
        if(!category || category.getId().toLowerCase().indexOf('rack') < 0){
            return;
        }
        var dataNode = this.sceneManager.getNodeByDataOrId(data);
        if(!dataNode){
            return ;
        }

        var collector = this.sceneManager.dataManager._collectors[data.getId()];
        if(!collector){
            collector = new it.Collector(); //随意创建一个，的考虑后台配置和时实对接
            collector.setValue(Math.random());
        }

        var dataType = this.sceneManager.dataManager.getDataTypeForData(data);

        var bb = dataNode.getBoundingBox();
        if(!bb){
            return;
        }
        var width = bb.max.x - bb.min.x;
        var height = bb.max.y - bb.min.y;
        var depth = bb.max.z - bb.min.z;

        this.visibleManager.setVisible(data,false);
        if(this.fakes[data.getId()]){ // 表示已经创建了
            return ;
        }
        var fake = new mono.Cube(width, height, depth);
        dataNode.temperatureFake = fake;
        var sideImage= this.createNodeTemperatureImage(dataNode,fake,collector);
        var simpleNode = this.sceneManager.prefabMap[dataType.getId()+'_simple'];
        if(!simpleNode){
            simpleNode = dataNode;
        }
//        var topImage = make.Default.getModelDefaultParameters('twaver.idc.rack').frameImage.value;
        fake.s({
            'm.texture.image': sideImage,
//            'top.m.texture.image': make.Default.path + '/model/idc/images/'+topImage,
//            'top.m.normalmap.image':demo.getRes('metal_normalmap.jpg'),
//            'top.m.specularmap.image': simpleNode.getStyle('rack_top.png'), //'m.texture.image'
//            'top.m.envmap.image': simpleNode.getStyle('top.m.envmap.image'),
            'top.m.type':'phong',
//            'm.transparent':true,
//            'm.opacity':0.5
        });
        fake.setWrapMode('six-each');
        this.box.add(fake);
        this.fakes[data.getId()] = fake;
        // fake.setPosition(dataNode.getPosition());
        fake.setParent(dataNode);
        //fake.setRotation(dataNode.getRotation());
//        if(collector.getValue() > 0.85){ //如果温度值大于0.6，就创建一个billboard放在上面
            var billboard = it.Util.createSpecailTextBillboard("text");
            var pbb = fake.getBoundingBox();
            var value = collector.getValue()*60;
            var height = 0;
            if(pbb) {
                 height = (pbb.max.y - pbb.min.y) / 2;
                if (height < 10) { //shapeNode(area)的话。太矮了
                    height = 100;
                }
            }
            var bg = null;
            if(collector.getValue() > 0.86){
                bg = '#5B8505';
            }
            
            // 注释于2017-11-18 微环境的billboard的高度计算不需要根据通道来算，老早之前有可能要在显示整个楼层的微环境    
            // var parentID = data.getParentId();
            // var parentCategory = this.sceneManager.dataManager.getCategoryForData(parentID).getId();
            // if(parentCategory == 'channel'){
            //     var parentNode = this.sceneManager.getNodeByDataOrId(parentID);
            //     var parentNodeH = parentNode.getBoundingBox()?parentNode.getBoundingBox().max.y:0;
            //     height = parentNodeH - dataNode.getY() - 35;
            // }
//            billboard.setPositionX(fake.getX());
            billboard.setPositionY(height);
//            billboard.setPositionZ(fake.getZ());
            billboard.setParent(fake);
            var s_x = billboard.getScaleX(),
                s_y = billboard.getScaleY();
            billboard.setScale(s_x / 2, s_y / 2, 1);
            billboard.setStyle('m.texture.image',it.Util.getSpecialTextBillboard(value.toFixed(2),it.util.i18n("MicoEnviroment_temperature")+':','°C',bg));
            this.box.add(billboard);
            this.billboards[data.getId()] = billboard;
//        }

//        this.createNodeTemperatureImage(dataNode,collector);
    },


    initCanvas : function(width,height){
        this.canvas.width = width;
        this.canvas.height = height;
//        var ctx = canvas.getContext('2d');
    },

    createNodeTemperatureImage: function(node, fake,collector){
        if(!node){
            return;
        }
//        var bb = node.getBoundingBox();
//        if(!bb){
//            return ;
//        }
//        var width = 100;//2*(bb.max.z - bb.min.z) + 2*(bb.max.x - bb.min.x);
//        var height = 100;//bb.max.y - bb.min.y;
//        var heatMap = new it.HeatMap({width: width,
//            height: height,
//            positionX: 0,
//            positionY: 0});
        this.heatMap.clear();
            var obj = {
                x: (100*Math.random()-50), // -50,50
                y: (100*Math.random()-50),
                w: 100,
                l: 100,
                value: collector.getValue() || 0,
//            axis:axis //旋转轴
            };
        this.heatMap.addPointWithArea(obj);
//        var canvas = heatMap.heatMapCanvas;
        var canvas = this.heatMap.getCanvas();
//        var img = new Image();
//        var imageUrl = make.Default.getModelDefaultParameters('twaver.idc.rack').frameImage.value;
//        imageUrl = make.Default.path + '/model/idc/images/'+imageUrl;
//        img.src = imageUrl;
//        var ctx = canvas.getContext('2d');
//        img.onload = function(){
////            ctx.fillStyle = "black";
////            ctx.clearRect(0, 0, 2*canvas.width/3, canvas.height/2);
////            ctx.drawImage(img, 0,0,canvas.width/3,canvas.height/2);
////            ctx.drawImage(img,canvas.width/3, 0,canvas.width/3,canvas.height/2);
////            fake.setStyle('m.texture.image',canvas.toDataURL());
//        };
        return canvas.toDataURL();

//        this.initCanvas(width,height);
//        var ctx = this.canvas.getContext('2d');
////        ctx.clearRect(0,0,300,1);
//        //rgba(0, 102, 255, 0.9)', 'cyan', 'lime', 'yellow', 'red'
//        var grd=ctx.createLinearGradient(0,0,width,height);
//        grd.addColorStop(0,"rgba(0, 102, 255, 0.9)");
//        grd.addColorStop(0.25,"cyan");
//        grd.addColorStop(0.5,"lime");
//        grd.addColorStop(0.75,"yellow");
//        grd.addColorStop(1,"red");
//
//        ctx.fillStyle=grd;
//        ctx.fillRect(0,0,width,height);
//
//        return this.canvas.toDataURL();

//        var width=2;
//        var height = bb.max.y - bb.min.y;
//        var step=height/count;
//        var board = new TemperatureBoard(width,height,'v', height/count);
//
//        for(var i=0;i<count;i++){
//            var value=0.3+Math.random()*0.2;
//            if(value<4){
//                value=Math.random()*0.9;
//            }
//            board.addPoint(width/2,step*i,value);
//        };
//
//        return board.getImage();
    },

});

it.MicoEnviroment = $MicoEnviroment;

