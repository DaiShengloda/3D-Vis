
/**
 * 双击地球上的数据中心时出现子地图的功能
 */

var $DCDoubleClick = function(sceneManager) {
	this.sceneManager = sceneManager;
	this.dataManager = this.sceneManager.dataManager;
	this.init();
};

mono.extend($DCDoubleClick,Object,{

  init: function() {
    var self = this;

    this.sceneManager.addSceneManagerChangeListener(function(eve) {
      if (eve.kind == 'createDefaultEarthScene' 
         && (eve.data instanceof it.DefaultEarthScene || eve.data instanceof it.CustomEarthSceneView)) {
         var earthScene = eve.data;
         var orgDcDoubleClick = earthScene.dcDoubleClick;
         earthScene.dcDoubleClick = function(id, title, callback, e) {
          // 此时data为Data Center, 判断data的所有孩子的分类是否都是Data Center，如果是那么此data为group
          // 应该进入2D场景，显示其孩子的位置
          if (!id) {
            return;
          }
          var data = self.dataManager.getDataById(id);
          if (!data) return;
          title = title || data.getName();
          var children = data.getChildren(),
            len = children.size(),
            isGroup = !!len,
            child;
          for (var i = 0; i < len; i++) {
            child = children.get(i);
            var dataType = self.dataManager.getDataTypeById(child.getDataTypeId());
            if (dataType && dataType.getCategoryId() != 'dataCenter') {
              isGroup = false;
              break;
            }
          }
          if (isGroup) {
            earthScene.beforeDcDoubleClick();
            // 弹出2D场景
            if (!self._subMap) {
              self._subMap = earthScene.earthMap._lastN ? earthScene.earthMap._lastN.getToolTip() : '';
            }
            self.popupSubDCs(earthScene, title, data, callback, e);
          }else{
            orgDcDoubleClick.call(earthScene,id, title, callback, e);
          }
        }
      }
    });
    

  },

	popupSubDCs: function (earthScene,title, data, callback, fco) {
        var self = this;
        if (!this._subMap && fco) {
            if (fco) {
                var ele = fco.element;
                if (!ele || ele && ele.getClient('type') !== 'earth')return;
                var n = earthScene.earthMap.getNode(fco.uv);
                if (n)this._subMap = n.getToolTip();
            }
        }
        if (this._subMap) {
            var subMapId = data._extend['subMap'] || this._subMap;
            if (!it.MapResource[subMapId])return;
            var $subMap = $('#subMap');
            if (!$subMap.length) {
                $subMap = $('<div id="subMap"></div>').appendTo($('body'));
            }
            $subMap.empty();
            var provinceMap = new $ProvinceMap(subMapId, data.getChildren());
            layer.open({
                shade: 0,
                type: 1,
                title: title,
                zIndex: 4,
                shade: true,
                skin: 'layui-layer-rim',
                area: ['812px', '555px'],
                // offset: ['100px', '100px'],
                content: $subMap,
                success: function (layero, index) {
                    provinceMap.init(subMapId, data.getChildren(), $subMap, function (id, title) {
                        layer.closeAll();
                        // 进入园区的3D场景
                        earthScene.network.showingDataCenter = null;
                        // self.clearNetwork();
                        earthScene.showMap(title, id, callback);
                    });
                    self._subMap = '';
                }
            });
        }
    },

});

it.DCDoubleClick = $DCDoubleClick;


function $ProvinceMap(province, data) {
  var dpr = Math.ceil(window.devicePixelRatio || 1);
  this._w = 800;
  this._h = 500;
};

mono.extend($ProvinceMap,it.EarthMap,{

  init: function(province, data, parent, showDC) {
    var self = this;
    var box = this.box = new twaver.ElementBox();
    var network = this.network = new twaver.vector.Network(box);
    // document.body.appendChild(network.getView());
    parent.append(network.getView());
    network.adjustBounds({x: 0,y: 0, width: self._w, height: self._h});
    box.getSelectionModel().setFilterFunction(function(node){
      return node.getClient('isDC');
    });
    network.isMovable = function(){
      return false;
    }
    var cityLayer = new twaver.Layer('city');
    var layerBox = box.getLayerBox();
    layerBox.add(cityLayer);

    var dcLayer = new twaver.Layer('dc');
    layerBox.add(dcLayer);

    var self = this;
    json = self.decode(it.MapResource[province]);
    self.loadData(json, cityLayer.getId());
    this.initDataCenter(box, data, dcLayer.getId());
    var f = function(e) {
      if (e.kind === 'validateEnd') {
        network.zoomOverview();
        network.removeViewListener(f, self);
      }
    }
    network.addViewListener(f,this);
    network.getView().addEventListener('dblclick', function(e){
        e.stopPropagation();
        e.preventDefault();
        var node = network.getElementAt(e);
        var dc = node.getClient('dc');
        console.log(node.getToolTip());
        if(dc && showDC){
          showDC(dc.getId(), dc.getName());
        }
    });
  }, 

  getView: function(){
    return this.network.getView();
  },

  initDataCenter: function(box, list, layer){
    
    list.forEach(function(dc){
      // var node = new twaver.Node(dc.getId());
      var node = make.Default.load('twaver.idc.datacenter');
      var name = dc.getName() || dc.getDecription() || dc.getId();
      node.setToolTip(name);
      // node.setName(name);
      var p = dc.getPosition2d();
      node.setLocation(parseFloat(p.x), parseFloat(p.y));
      node.setClient('isDC', true);
      node.setClient('dc', dc);
      node.setLayerId(layer);
      box.add(node);
    });
  },

  filterMapNode: function(node, layer, name){
    if(name)node.setName(name);
    node.setStyle('vector.fill', true)
      .setStyle('vector.fill.color', '#474753') //474753
      .setStyle('vector.outline.color', 'orange') //9ab0e6
      .setStyle('select.color', '#FFFFFF') //FFFFFF
      .setStyle('vector.outline.width', 1)
      .setStyle('label.position','center')
      .setStyle('label.color', '#FFFFFF');
  }

});

it.ProvinceMap = $ProvinceMap;



