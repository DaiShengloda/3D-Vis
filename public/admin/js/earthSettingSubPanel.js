
function EarthSettingSubPanel(data, mainPanel) {
    this._w = 800;
    this._h = 500;
    this.data = data;
    this.mainPanel = mainPanel;
}
mono.extend(EarthSettingSubPanel,Object,{
    init: function(province, parent) {
        var self = this;
        var box = this.box = new twaver.ElementBox();
        var network = this.network = new twaver.vector.Network(box);
        parent.append(network.getView());
        network.adjustBounds({x: 0,y: 0, width: self._w, height: self._h});
        box.getSelectionModel().setFilterFunction(function(node){
            return node.getClient('isDC');
        });
        network.isMovable = function(node){
            return node.getClient('isDC');
        }

        var cityLayer = new twaver.Layer('city');
        var layerBox = box.getLayerBox();
        layerBox.add(cityLayer);

        var dcLayer = new twaver.Layer('dc');
        layerBox.add(dcLayer);

        var self = this;
        json = self.decode(province);
        self.loadData(json, cityLayer.getId());
        this.initDataCenter(box, dcLayer.getId());
        var f = function(e) {
            if (e.kind === 'validateEnd') {
                network.zoomOverview();
                network.removeViewListener(f, self);
            }
        }
        network.addViewListener(f,this);
        network.getView().addEventListener('dblclick', function(e){
            var node = network.getElementAt(e);
            var point = network.getLogicalPoint2(e);
            if(node.getClient('isDC')){
                var dc = node.getClient('dc');
                self.mainPanel.updateDCHandle(dc.id, dc);
            } else {
                self.mainPanel.addDCHandle(point, function(params, position){
                    self.loadDC(params, position);
                });
            }
        }); 
        box.addDataPropertyChangeListener(function(e){
            if(e.property === "location"){
                var node = e.source;
                if(node && node.getClient('isDC')){
                    var dc = node.getClient('dc');
                    self.mainPanel.setPosition2d(dc.id, e.newValue);
                }
            }
        });

    }, 
    loadDC: function(params, position){
        delete params.position;
        params.position2d = position;
        params.parentId = this.data.id;
        if(!params.simpleModel){
            it.util.msg(it.util.i18n("Admin_earthSettingSubPanel_No_simple_Model"));
            return;
        }
        var node = make.Default.load('twaver.idc.datacenter');
        var name = params.name;
        node.setToolTip(name);
        node.setLocation(position.x, position.y);
        node.setClient('isDC', true);
        node.setClient('dc', params);
        node.setLayerId('dc');
        this.box.add(node);
    },
    getView: function(){
        return this.network.getView();
    }, 
    initDataCenter: function(box, layer){
        var subDCs = this.mainPanel.getChildren(this.data.id);
        $.each(subDCs, function(index, dc) {
            var node = make.Default.load('twaver.idc.datacenter');
            var name = dc.name || dc.decription || dc.id;
            node.setToolTip(name);
            var p = dc.position2d;
            try{
                p = p?JSON.parse(p):{};
                node.setLocation(parseFloat(p.x), parseFloat(p.y));
                node.setClient('isDC', true);
                node.setClient('dc', dc);
                node.setLayerId(layer);
                box.add(node);
            } catch(e){
                conole.log(e);
            }
        });
    },
    loadData: function(json, layer) {
        var self = this;
        json.features.forEach(function(feature) {
            var node = new twaver.ShapeNode(feature.id);
            node.setLayerId(layer);
            node.setToolTip(feature.properties.name);
            self.filterMapNode(node, layer, feature.properties.name);
            var segments = new twaver.List();
            var points = new twaver.List();

            if (feature.geometry.type === 'MultiPolygon') {
                feature.geometry.coordinates.forEach(function(polygon) {
                  polygon.forEach(function(coordinate) {
                    segments.add('moveto');
                    coordinate.forEach(function(point, i) {
                        if (i !== 0) {
                            segments.add('lineto');
                        }
                        points.add(self.convertPoint(point));
                    });
                });
              });
            } else if (feature.geometry.type === 'Polygon') {
                feature.geometry.coordinates.forEach(function(coordinate) {
                    segments.add('moveto');
                    coordinate.forEach(function(point, i) {
                        if (i !== 0) {
                            segments.add('lineto');
                        }
                        points.add(self.convertPoint(point));
                    });
                });
            } else {
                console.log(feature.geometry.type);
            }

            node.setSegments(segments);
            node.setPoints(points);
            self.box.add(node);
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
        // node.setToolTip(feature.properties.name);
    },
    convertPoint: function(point) {
        return {
            x: (point[0] - 117) * 100,
            y: (-point[1] + 31.7) * 100
        };
    },  
    decode: function(json) {
        var self = this;
        if (!json.UTF8Encoding) {
            return json;
        }
        var features = json.features;

        for (var f = 0; f < features.length; f++) {
            var feature = features[f];
            var geometry = feature.geometry;
            var coordinates = geometry.coordinates;
            var encodeOffsets = geometry.encodeOffsets;
            for (var c = 0; c < coordinates.length; c++) {
                var coordinate = coordinates[c];
                if (geometry.type === 'Polygon') {
                    coordinates[c] = self.decodePolygon(coordinate, encodeOffsets[c]);
                } else if (geometry.type === 'MultiPolygon') {
                    for (var c2 = 0; c2 < coordinate.length; c2++) {
                        var polygon = coordinate[c2];
                        coordinate[c2] = self.decodePolygon(polygon, encodeOffsets[c][c2]);
                    }
                }
            }
        }
        // Has been decoded
        json.UTF8Encoding = false;
        return json;
    },  
    decodePolygon: function(coordinate, encodeOffsets) {
        var result = [];
        var prevX = encodeOffsets[0];
        var prevY = encodeOffsets[1];
        for (var i = 0; i < coordinate.length; i += 2) {
            var x = coordinate.charCodeAt(i) - 64;
            var y = coordinate.charCodeAt(i + 1) - 64;
            // ZigZag decoding
            x = (x >> 1) ^ (-(x & 1));
            y = (y >> 1) ^ (-(y & 1));
            // Delta deocding
            x += prevX;
            y += prevY;

            prevX = x;
            prevY = y;
            // Dequantize
            result.push([x / 1024, y / 1024]);
        }
        return result;
    }
});

it.EarthSettingSubPanel = EarthSettingSubPanel;

