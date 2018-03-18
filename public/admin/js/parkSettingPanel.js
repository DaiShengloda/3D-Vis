function ParkSettingPanel(parent,dataParams){
  //extend_res/obj/dimian/dimian1.obj
  //../modellib/model/scene/images/star_sky.jpg
  this._network = null;
  // this._moveModel = false;
  // this.unsavedModels = {};
  // this.caches = {};
  this.idBuildings = null;
  this.dataParams = dataParams;



  // this.idCount = 0;

  this.init(parent);

}

mono.extend(ParkSettingPanel, Object, {
  init:function(parent){
    
    var self = this;
    var $view = $('<div></div>').appendTo(parent).addClass('earthSetting');
    // $view.css("position","realtive");
    // $view.css("visibility","hidden");
    var $btnPanel = $('<div></div>').appendTo($view).addClass('btnPanel');

    var network = new mono.Network3D();
    var box = network.getDataBox();
    this._network = network;
    
    var interaction=new mono.DefaultInteraction(network);
    interaction.maxDistance=3000;
    interaction.minDistance=600;
    network.setInteractions([new mono.SelectionInteraction(network), interaction]);

    var f = function(label, handle){
      var btn = $('<button type="button" class="btn btn-default">'+label+'</button>').appendTo($btnPanel);
      if(handle){
        btn.click(function(event) {
          handle.call(self, btn);
        });
      }
      return btn;
    }
    // f('设置天空盒', this.settingSkyBox);
    // this.$btnDeleteModel = f('删除模型', this.deleteModel).attr('disabled', 'disabled');
    // // var $btnSaveEarth = this.$btnSaveEarth = f('保存天空盒', this.saveEarth).attr('disabled', 'disabled');
    // var btn4 = f('启用移动模式', function(btn){
    //   self._moveModel = !self._moveModel;
    //   btn.text(self._moveModel?'启用旋转模式':'启用移动模式');
    //   interaction.noRotate = self._moveModel;
    // });
    // btn4.on('mouseenter', function(event) {
    //   layer.tips('移动模式可以鼠标移动模型', btn4, {tips:[2,'#428BCA'],time: 3000});
    // });
    this.$btnSavePark = f(it.util.i18n("Admin_parkSettingPanel_Save_park_scene"), this.savePark).attr('disabled', true);
    this.$btnSaveFloor = f('', this.saveFloor).attr('disabled', true);
    var $btnPanel1 =  $('<span style="display:block;height:22px">'+it.util.i18n("Admin_parkSettingPanel_Save_floor")+'</span>').appendTo(this.$btnSaveFloor);
    $btnPanel1.on('mouseenter', function(event) {
        layer.tips(it.util.i18n("Admin_parkSettingPanel_Setting_floor_tip"), self.$btnSaveFloor, {tips:[2,'#428BCA'],time: 3000});
      });
    // var $selectPanel = $('<div></div>').appendTo($btnPanel);
    // $selectPanel.addClass("col-sm-2");
    // var prop = {params : {valueField:'dataId',url : '/api/data/getAllDataOfOneCategory',data:{category_id:"dataCenter"},filter : function(result){
    //     return result;
    //  }}};
    // var $select = util.createSelect(prop);
    // $select.attr("id","dataCenter");
    // $select.appendTo($selectPanel);
    // 
    var props =[];
    var prop,form;

    // var $labelPanel1 = $('<div style="height:34px;padding-left:2%;padding-top:7px"></div>').appendTo($btnPanel);
    // $labelPanel1.addClass("col-sm-2");
    // var $label1 = $('<label for="scene" >当前数据中心:  <span style="margin-left:15px">'+ this.dataParams.id+'</span></label>').appendTo($labelPanel1);
    
    // var $labelPanel2 = $('<div style="height:34px;padding-left:4%;padding-top:7px"></div>').appendTo($btnPanel);
    // $labelPanel2.addClass("col-sm-1");
    // var $label2 = $('<label for="scene" >场景:</label>').appendTo($labelPanel2);
    var $selectPanel2 = $('<div></div>').appendTo($btnPanel);
    $selectPanel2.addClass("col-sm-7");

    prop={label: it.util.i18n("Admin_parkSettingPanel_Currenr_data_center"), type:"text", id:"dataCenter", value:this.dataParams.id, readonly:true};
    props.push(prop);

    var idScenes = make.Default.getIds(function(params){if(params.sdkCategory == 'park')return true});
    var sceneItems = [];
    var i;
    sceneItems.push({label:"---"+it.util.i18n("Admin_parkSettingPanel_Please_select")+"---",value:"default"});
    for(i=0;i<idScenes.length;i++){
      var item = {};
      item.label= idScenes[i];
      item.value = idScenes[i];
      sceneItems.push(item);
    }


    // var prop2 = {items:sceneItems,label: '场景:', type:"select", params : {filter : function(result){
    //     return result;
    //  }}};
    // var $select2 = util.createSelect(prop2);
    // $select2.attr("id","scene");
    // $select2.change(function(){
    //   self.loadData();
    // });
    // $select2.appendTo($selectPanel2);

    
    prop={items:sceneItems, label: it.util.i18n("Admin_parkSettingPanel_Scene"), type:"select",id:"scene", params : {filter : function(result){
        return result;
     }}};
     props.push(prop);
     // form = util.createForm(props,null,null,{inline:true});
     // form.attr("id","scene");
     // form.appendTo($selectPanel2);

    // var $labelPanel3 = $('<div style="height:34px;padding-left:3%;padding-top:7px"></div>').appendTo($btnPanel);
    // $labelPanel3.addClass("col-sm-1");
    // var $label3 = $('<label for="skybox" >天空盒:</label>').appendTo($labelPanel3);
    // var $selectPanel3 = $('<div></div>').appendTo($btnPanel);
    // $selectPanel3.addClass("col-sm-2");
    var idSkys = make.Default.getIds(function(params){if(params.sdkCategory == 'parkSkybox')return true});
    var skyItems = [];
    var i;
    skyItems.push({label:"---"+it.util.i18n("Admin_parkSettingPanel_Please_select")+"---",value:"default"});
    for(i=0;i<idSkys.length;i++){
      var item = {};
      item.label= idSkys[i];
      item.value = idSkys[i];
      skyItems.push(item);
    }
    // var prop3 = {items:skyItems, label: '天空盒:', type:"select", params : {filter : function(result){
    //     return result;
    //  }}};
    // var $select3 = util.createSelect(prop3);
    // $select3.attr("id","skybox");
    // $select3.change(function(){
    //   self.loadData();
    // });
    // $select3.appendTo($selectPanel3);


    // var props2 = [];
    prop={items:skyItems, label: it.util.i18n("Admin_parkSettingPanel_Sky_box"), type:"select",id:"skybox", params : {filter : function(result){
      return result;
    }}};
    props.push(prop);
    form = util.createForm(props,null,null,{inline:true});
    form.appendTo($selectPanel2);

    Serverutil.adminApi('data','getDatasOfParent',{parentId:this.dataParams.id,categoryId:"building"},function(buildingDatas){
      if(buildingDatas.length !== 0){
        var i;
        for(i=0;i<buildingDatas.length;i++){
          var dataId = buildingDatas[i].dataId;
          Serverutil.adminApi('data','getDatasOfParent',{parentId:dataId,categoryId:"floor"},function(floorDatas){
            if(floorDatas.length !==0){
              $("#scene").attr("readonly","readonly");
              $("#scene").attr("disabled",true);
            }
          });
        }

      }
    });

    $("#scene").change(function(){
      self.loadData();
    });
    $("#skybox").change(function(){
      self.loadData();
    });




    var camera = new mono.PerspectiveCamera(30, 1.5, 100, 10000);
    camera.look(0, 0, 0);
    camera.setPosition(-400, 300, 1400);
    camera.setFov(30);
    network.setCamera(camera);

    self._network.getDataBox().add(new mono.AmbientLight(0xFFFFFF));

    var $networkView = $('<div class="network"></div>').appendTo($view).append(network.getRootView());


    network.adjustBounds($networkView.width() || 1000,800);

    setTimeout(function(){
      self.initSelect();
    },100);

    network.getRootView().addEventListener('dblclick', function(e){
      var firstClickObject = self.findFirstObjectByMouse(network,e);
      if(firstClickObject){
        var element=firstClickObject.element;
        var point=firstClickObject.point;
        var idBuilding = element.getClient("idBuilding")
        if(idBuilding){
          self.settingBuilding(idBuilding);
        }
      }
    }); 

    // network.getRootView().addEventListener('mousedown', function(e){
    //   if(!self._moveModel)return;
    //   self._startMove = true;
    //   var nodes = box.getSelectionModel().getSelection();
    //   if(nodes.size()>0 && nodes.get(0).getClient('isNewModel')){
    //     self._moveNode = nodes.get(0);
        
    //   }
    // });
    // network.getRootView().addEventListener('mouseup', function(e){
    //   self._startMove = false;
    //   self._moveNode = undefined;
    // });
    // network.getRootView().addEventListener('mousemove', function(e){
    //   if(!self._startMove || !self._moveNode)return;
    //   var first = self.findSkyBox(network,e);
    //   if(first){
    //     var earth=first.element;
    //     var point=first.point;
    //     // console.log(point);
    //     var boundingBox = self._moveNode.getBoundingBox();
    //     var yHeight = boundingBox.max.y - boundingBox.min.y;
    //     var y = yHeight/2 +20 ;
    //     self._moveNode.setPosition(point.x, y, point.z);
    //     var modId = self._moveNode.getClient("modId");
    //     self.unsavedModels[modId].position = self._moveNode.getPosition();
    //   }
    // }); 

    // network.getDataBox().getSelectionModel().addSelectionChangeListener(function(){
    //   var nodes = network.getDataBox().getSelectionModel().getSelection();
    //   var i;
    //   for(i=0;i<nodes.size();i++){
    //     if(nodes.get(i).getClient('isNewModel')){
    //       self.$btnDeleteModel.attr('disabled', false);
    //       return;
    //     }
    //   }
    //   self.$btnDeleteModel.attr('disabled', true);
    // });
  

  },

  findSkyBox: function(network, e, order){
    order = order || 1;
    var objects = network.getElementsByMouseEvent(e);
    if (objects.length) {
      for(var i=0;i<objects.length;i++){      
        var first = objects[i];
        var object3d = first.element;
        if(object3d.getClient("id") === "twaver.scene.skybox"){
          return first;
        }
        // if(! (object3d instanceof mono.Billboard)){
            // return first;
        // }
        // if((i+1) === order){
        //  return first;
        // }
        
      }
    }
    return null;
  },

  findFirstObjectByMouse: function(network, e){
    var objects = network.getElementsByMouseEvent(e);
    if (objects.length) {
      // for(var i=0;i<objects.length;i++){     
      //  var first = objects[i];
      //  var object3d = first.element;
      //  if(! (object3d instanceof mono.Billboard)){
      //    return first;
      //  }
      // }
      return objects[0];
    }
    return null;
  },

  initSelect:function(){

    if(this.dataParams.model){
      $("#scene").val(this.dataParams.model);
    }

    if(this.dataParams.model_parameters){
      var model_parameters = JSON.parse(this.dataParams.model_parameters);
      if(model_parameters.skyboxId){
        $("#skybox").val(model_parameters.skyboxId);
      }
    }
    this.loadData();
  },

  loadData:function(){
    var self = this;
    var i,j;

    var $eleScene = $('#scene option:selected');
    var $eleSky = $('#skybox option:selected');
    var scene = $eleScene.val();
    var sky = $eleSky.val();

    self._network.getDataBox().clear();
    if(scene !== "default"){

      self.idBuildings = make.Default.getOtherParameter(scene,'buildings');
      var idBuildings = self.idBuildings;

      var modelId;
      if(sky !== "default"){
        modelId = {id:scene,skyboxId:sky};
      }else{
        modelId = scene;
      }


      make.Default.load(modelId,function(objects){
          for(i=0;i<objects.length;i++){
            self._network.getDataBox().add(objects[i]);
            if(objects[i].getClient("id") !== sky){
              var boundingBox = objects[i].getBoundingBox();
              var yHeight = boundingBox.max.y - boundingBox.min.y;
              var y = yHeight/2+20;
              objects[i].setPositionY(y);
            }
            objects[i].setStyle("m.ambient",0xffffff);
          }
          for(i=0;i<idBuildings.length;i++){
            var idBuilding = idBuildings[i];
            make.Default.load(idBuilding.id,function(oldObjects){
              var objects = [];
              if(oldObjects && typeof oldObjects === "object"){
                if(oldObjects instanceof Array){
                  objects = oldObjects;
                }else{
                  objects.push(oldObjects);
                }
              }
              for(j=0;j<objects.length;j++){
                self._network.getDataBox().add(objects[j]);
                objects[j].setClient("idBuilding",idBuilding);
                if(!idBuilding.position){
                  var boundingBox = objects[j].getBoundingBox();
                  var yHeight = boundingBox.max.y - boundingBox.min.y;
                  var y = yHeight/2;
                  objects[j].setPositionY(y);
                }else{
                  objects[j].setPosition(
                    idBuilding.position[0],
                    idBuilding.position[1],
                    idBuilding.position[2]
                  );
                }
                if(idBuilding.rotation){
                  objects[j].setRotation(
                    idBuilding.rotation[0],
                    idBuilding.rotation[1],
                    idBuilding.rotation[2]
                  );
                }
                objects[j].setStyle("m.ambient",0xffffff);
              }
            });
          }
          
      });
      self.$btnSavePark.attr('disabled',false);
    }else{
      self.$btnSavePark.attr('disabled',true);
    }
    

  },

  //设置地球模型信息
  settingSkyBox: function(){   
    var form = this.getSkyBoxForm(), self = this;

    var modal = util.modal(it.util.i18n("Admin_parkSettingPanel_Setting_sky_box"), form, true, true, function () {
      var params = util.getFormData(form);
      if(!params.skyboxImage){
        return;
      }
      //½«ÉèÖÃ¼ÓÔØµ½3DÄ£ÐÍÉÏ
      var objects = self._network.getDataBox().getDatas()._as;
      $.each(objects, function(index, val) {
        // var cache = self.parkParams[index] || (self.parkParams[index] = {});
        // if(self._sbIds.indexOf(index)>-1){
        if(val.getClient("id") === "twaver.scene.skybox"){
          if(params.skyboxImage){
            val.setStyle('m.texture.image', params.skyboxImage);
            // cache.image = params.skyboxImage;
            self.caches.skyboxImage = params.skyboxImage;
          }
        }
      });
    });
  },

  // getSkyBoxForm: function(){
  //   var props = [], util = it.util, fv = this._formValue || {};
  //     props.push({label: '天空盒贴图', id: 'skyboxImage', value:fv.skyboxImage});
  //     // props.push({label: '太阳贴图', id: 'sunImage', value:fv.sunImage});
  //     // props.push({label: '地球贴图', id: 'earthImage', value:fv.earthImage});
  //     var form = util.createForm(props);
  //     return form;
  // },


  saveFloor:function(){
    var self = this;
    var i,j,k;
    for(i=0;i<self.idBuildings.length;i++){
      var floors = parseInt(self.idBuildings[i].floors);
      var floorHeight = parseInt(self.idBuildings[i].floorHeight);
      var dataId = self.idBuildings[i].dataId;
      var buildingPosition = self.idBuildings[i].position;
      var dataTypeId = dataId + "_def_floor";
      Serverutil.adminApi('datatype','search',{id:dataTypeId},function(data){
        if(data.length===0){
          var types = [];
          var type = {};
          type.id = dataTypeId;
          type.categoryId = "floor";
          type.size = {};
          type.childrenSize = {};
          types.push(type);
          Serverutil.adminApi('datatype','batchAddOrUpdate',types,function(data){
            it.util.msg(it.util.i18n("Admin_parkSettingPanel_Asset_module_save_success"));
          });
        }        
      });
      Serverutil.adminApi('data','getDatasOfParent',{parentId:dataId,categoryId:"floor"},function(data){
        var datas = [];
        var yMax = 0;
        for(k=0;k<data.length;k++){
           var yPosition = parseInt(JSON.parse(data[k].position).y);
           if(yPosition > yMax){
            yMax = yPosition;
           }
        }
        for(j=0;j<floors;j++){
          var floor = {};
          floor.id = "flr" +(new Date()).valueOf() +j;
          floor.description = (j+1+ data.length) + '楼';
          floor.rotation = JSON.stringify({x:"",y:"",z:""});
          floor.location = JSON.stringify({x:"",y:"",z:""});
          floor.position2d = JSON.stringify({x:"",y:"",z:""});

          floor.dataTypeId = dataTypeId;
          floor.parentId = dataId;
          var yFloor;
          if(data.length === 0){
            yFloor = floorHeight*j+yMax;
          }else{
            yFloor = floorHeight*(j+1)+yMax;
          }
          if(!buildingPosition){
            floor.position = JSON.stringify({
                        x:"0",
                        y: yFloor + "",
                        z:"0"
                    });
          }else{
            floor.position = JSON.stringify({
                        x:buildingPosition[0] +"",
                        y:yFloor + "",
                        z:buildingPosition[2] +""
                    });
          }
          datas.push(floor);
        }
        Serverutil.adminApi('data','batchAddOrUpdate',datas,function(successData){
          it.util.msg(it.util.i18n("Admin_parkSettingPanel_Asset_save_success"));
          self.$btnSaveFloor.attr('disabled',true);
        });
      });    
    }
  
  },

  savePark:function(){

    var i,j;
    var idBuildings = this.idBuildings;
    var self = this;
    
    Serverutil.adminApi('data','getDatasOfParent',{parentId:this.dataParams.id,categoryId:"building"},function(data){
      if(data.length !== self.idBuildings.length){

        if(data.length === 0){
          var typeDataMap = {};
          
          var types = [];
          var datas = [];
          for(i=0;i<idBuildings.length;i++){
            var typeId = idBuildings[i].id;
            if(!typeDataMap[typeId]){
              typeDataMap[typeId] = [];
            }
            typeDataMap[typeId].push(idBuildings[i]);
          }

          for(var typeId in typeDataMap){
            var type = {};
            type.id = 'bdtype'+(new Date()).valueOf();
            type.categoryId = "building";
            type.simpleModel = typeId;
            type.description = it.util.i18n("Admin_parkSettingPanel_Building_type");
            types.push(type);
            for(i=0;i<typeDataMap[typeId].length;i++){
              var data = {};
              data.dataTypeId = type.id;
              data.id = "bd"+ (new Date()).valueOf();
              data.parentId = self.dataParams.id;
              var buildingPosition = typeDataMap[typeId][i].position;
              var buildingRotation = typeDataMap[typeId][i].rotation;
              if(!buildingPosition){
                data.position = JSON.stringify({x:"",y:"",z:"0"});
              }else{
                data.position = JSON.stringify({
                              x:buildingPosition[0] +"",
                              y:buildingPosition[1] +"",
                              z:buildingPosition[2] +""
                            });
              }
              if(!buildingRotation){
                data.rotation = JSON.stringify({x:"",y:"",z:""});
              }else{
                data.rotation = JSON.stringify({
                              x:buildingRotation[0] +"",
                              y:buildingRotation[1] +"",
                              z:buildingRotation[2] +""
                            });
              }
              data.description = it.util.i18n("Admin_parkSettingPanel_Building")+i;
              datas.push(data);

              typeDataMap[typeId][i].dataId = data.id;

            }
          }
          Serverutil.adminApi('datatype','batchAddOrUpdate',types,function(data){
            it.util.msg(it.util.i18n("Admin_parkSettingPanel_Asset_module_save_success"));
          });

          Serverutil.adminApi('data','batchAddOrUpdate',datas,function(data){
            it.util.msg(it.util.i18n("Admin_parkSettingPanel_Asset_save_success"));
          });
        }

      }else{
        for(i=0;i<self.idBuildings.length;i++){
          var position = self.idBuildings[i].position;
          if(!position){
            position = ["","","0"];
          }else{
            var position0 = position[0] + "";
            var position1 = position[1] + "";
            var position2 = position[2] + "";
            position =[position0,position1,position2];
          }
          for(j=0;j<data.length;j++){
            var dataPosition = JSON.parse(data[j].position);
            if(dataPosition.x === position[0] && dataPosition.y === position[1] && dataPosition.z === position[2]){
              self.idBuildings[i].dataId = data[j].dataId;
            }
          }
        }
      }
    });


    var $eleScene = $('#scene option:selected');
    var scene = $eleScene.val();
    var $eleSky = $('#skybox option:selected');
    var sky = $eleSky.val();
    var value = {};
    value.model = scene;
    if(sky !== "default"){
      value.modelParameters = JSON.stringify({skyboxId:sky});
    }else{
      value.modelParameters  =  JSON.stringify({});
    }

    var dataTypeFormData = {
        value:value,
        options:{
            id: this.dataParams.dataTypeId,  
        }
    };

    Serverutil.adminApi("datatype","update",dataTypeFormData,function(successData){
      it.util.msg(it.util.i18n("Admin_parkSettingPanel_Park_save_success"));
    });
  

  },

  // deleteModel:function(){
  //   var self = this;
  //   it.util.confirm('确认要删除模型?', function(){
  //     var nodes = self._network.getDataBox().getSelectionModel().getSelection();
  //     var i;
  //     for(i=0;i<nodes.size();i++){
  //       if(nodes.get(i).getClient('isNewModel')){
  //         var node = nodes.get(i);
  //         self._network.getDataBox().removeByDescendant(node);
  //         i--;
  //         var modId = node.getClient("modId");
  //         delete self.unsavedModels[modId];  
  //       }
  //     }
  //     it.util.msg('删除模型成功');
  //   });
    
  // },

  settingBuilding: function(idBuilding){
    var form = this.getBuildingForm(idBuilding), self = this;
    var modal = util.modal(it.util.i18n("Admin_parkSettingPanel_Setting_building_info"), form, true, true, function () {
      var bv = $(form).data('bootstrapValidator');
      bv.validate();
      if (!bv.isValid())return true;

      var params = util.getFormData(form);
      idBuilding.floors = params.floors;
      idBuilding.floorHeight = params.floorHeight;
      self.$btnSaveFloor.attr('disabled',false);
    });
    $('#model', form).parent().parent().css('display', 'none');
  },

  // loadModel: function(params){
  //   var self  =this;
  //   if(!params.simpleModel){
  //     it.util.msg('选择的资产模型没有简单模型');
  //     return;
  //   }
  //   var mp = $.extend({}, params.modelParameters);
  //   // var node ;
  //   make.Default.load(params.simpleModel,function(object){
  //     if(object){
  //       // if(params.simpleModel === params.model){
  //         var node= object;
  //         node.setClient('isNewModel',true);
  //         self.idCount++;
  //         var modId = self.idCount+"";
  //         node.setClient('modId',modId);
  //         node.setStyle("m.ambient",0xffffff);
  //         // node.setClient('newDC', true);
  //         // node.setClient('dcId', params.id);
  //         var pos = params.position;
  //         var boundingBox = node.getBoundingBox();
  //         var yHeight = boundingBox.max.y - boundingBox.min.y;
  //         var y = yHeight/2 +20 ;
  //         node.setPosition(pos.x, y, pos.z);
          
  //         self._network.getDataBox().addByDescendant(node);
  //         params.position = node.getPosition();
  //         self.unsavedModels[modId] = params;
  //       // }
        
  //     }
  //   });
    
  // },
  getBuildingForm: function(idBuilding){ 
    var props = [], util = it.util;
    props.push({label: it.util.i18n("Admin_parkSettingPanel_Floor"), id: 'floors', value:idBuilding.floors});
    props.push({label: it.util.i18n("Admin_parkSettingPanel_Height"), id: 'floorHeight',value:idBuilding.floorHeight||'600'});
    props.push({label: it.util.i18n("Admin_parkSettingPanel_Building_ID"), id: 'buildingId',value:idBuilding.dataId, readonly:true});
    var form = util.createForm(props);
    var opt = {
      floors: {
          trigger: 'blur',
          validators: [this.notEmpty('floors')]
      },
      floorHeight: {
          trigger: 'blur',
          validators: [this.notEmpty('floor height')]
      },
      buildingId: {
          trigger: 'blur',
          validators: [this.notEmpty('buildingId')]
      }
    };
    util.initValidator(form, opt);
    return form
  },

  notEmpty:function(p){
    var result = {};
    result.type = 'notEmpty'
    if(p !== "buildingId"){
      result.message = it.validator.message('The '+p+' is required');
    }else{
      result.message = it.validator.message('Please save the park');
    }
    return result;
    
  },





  
});