
/**
 * 加上了isDepthMask
 * 如果同时有多个这样的虚幻管理器，并且对同一个东西都需要进行m.depthMask进行管理，那就不太合适，
 * 会有点混乱，但是会以最后一个为标准
 */
var $ITVVirtualManager = function (sceneManager, itvManager,isMainVir) {
    it.MaterialFilter.call(this);
    this.sceneManager = sceneManager;
    this.itvManager = itvManager;
    this.itvDataManager = this.itvManager.itvDataManager;
    this.opacityValue = 0.26; //0.06;
    this.materialMap = {};
    this._configItemMap = {};
    this._layerMap = {};
    this._relationMap = {};
    this.isMainVir = isMainVir;
    this.depthMaskType = 'm.visible' ;//m.depthMask 当isDepthMask时是这设置隐藏还是depthMask，由于depthMask总是还原不了
};

mono.extend($ITVVirtualManager, it.MaterialFilter, {

    clear: function () {
        this._configItemMap = {};
        this._layerMap = {};
        this._relationMap = {};
    },

    getId: function (dataOrId) {
        if (typeof dataOrId == 'string') return dataOrId;
        else return dataOrId.getId();
    },
    
    /**
     * 
     * @isDepthMask 表示设置虚化时是不是设置node的'm.depthMask'
     */
    addLayer: function (dataOrId,isDepthMask) {
        var id = this.getId(dataOrId);
        var layerNode = this.itvManager._layerNodeMap[id];
        if (layerNode) {
            this._layerMap[id] = true;
            if(isDepthMask){
                layerNode.setStyle(this.depthMaskType,false);
            }
        }
    },

     /**
     * 
     * @isDepthMask 表示设置虚化时是不是设置node的'm.depthMask'
     */
    addConfigItem: function (dataOrId,isDepthMask) {
        var id = this.getId(dataOrId);
        var ciNode = this.itvManager._configItemNodeMap[id];
        if (ciNode) {
            this._configItemMap[id] = true;
            if (isDepthMask) {
               ciNode.setStyle(this.depthMaskType,false);  
            }
        }
    },
    
     /**
     * 
     * @isDepthMask 表示设置虚化时是不是设置node的'm.depthMask'
     */
    addRelation: function (dataOrId,isDepthMask) {
        var id = this.getId(dataOrId);
        var relationNode = this.itvManager.relationManager._lineMap[id];
        if (relationNode) {
            this._relationMap[id] = true;
            if (isDepthMask) {
               relationNode.setStyle(this.depthMaskType,false);  
            }
        }
    },
    
     /**
     * 
     * @isDepthMask 表示设置虚化时是不是设置node的'm.depthMask'
     */
    addAllLayer: function (isDepthMask) {
        for (var layer in this.itvManager.itvDataManager._layerMap) {
            this.addLayer(layer,isDepthMask);
        }
    },
    
    /**
     * 
     * @isDepthMask 表示设置虚化时是不是设置node的'm.depthMask'
     */
    addAllConfigItem: function (isDepthMask) {
        for (var item in this.itvManager.itvDataManager._configItemMap) {
            this.addConfigItem(item,isDepthMask);
        }
    },

     /**
     * 
     * @isDepthMask 表示设置虚化时是不是设置node的'm.depthMask'
     */
    addAllRelation: function (isDepthMask) {
        for (var relation in this.itvManager.itvDataManager._relationMap) {
            this.addRelation(relation,isDepthMask);
        }
    },

    /**
     * 
     * @isDepthMask 表示设置虚化时是不是设置node的'm.depthMask'
     */
    addAll: function (isDepthMask) {
        this.addAllLayer(isDepthMask);
        this.addAllConfigItem(isDepthMask);
        this.addAllRelation(isDepthMask);
    },

    removeLayer: function (dataOrId,isDepthMask) {
        var id = this.getId(dataOrId);
        // if (this._layerMap[id]) {
            delete this._layerMap[id];
        // }
        if (isDepthMask) {
            var layerNode = this.itvManager._layerNodeMap[id];
            if (layerNode) {
                layerNode.setStyle(this.depthMaskType,true);
            }
        }
    },

    removeConfigItem: function (dataOrId,isDepthMask) {
        var id = this.getId(dataOrId);
        delete this._configItemMap[id];
        if (isDepthMask) {
            var ciNode = this.itvManager._configItemNodeMap[id];
            if (ciNode) {
                ciNode.setStyle(this.depthMaskType,true);
            }
        }
    },
    
    /**
     * 移除配置项及其孩子
     */
    removeConfigItemAndChildren: function(configItemOrId,isDepthMask, scope) {
        if (!configItemOrId) {
            return;
        }
        scope = scope || this;
        var configItem = configItemOrId;
        if (typeof(configItemOrId) == 'string') {
            configItem = scope.itvDataManager._configItemMap[configItemOrId];
        }
        scope.removeConfigItem(configItem,isDepthMask);
        var children = configItem.getChildren();
        if (children && children.size() > 0) {
            for (var i = 0; i < children.size(); i++) {
                var child = children.get(i)
                scope.removeConfigItemAndChildren(child,isDepthMask,scope);
            }
        }
    },

    removeRelation: function (dataOrId,isDepthMask) {
        var id = this.getId(dataOrId);
        // if (this._relationMap[id]) {
            delete this._relationMap[id];
        // }
        var relationNode = this.itvManager.relationManager._lineMap[id];
        if (relationNode) {
            relationNode.setStyle(this.depthMaskType,true);
        }
    },

    removeAllLayer: function (isDepthMask) {
        if (isDepthMask) {
            for(var id in this._layerMap){
                this.removeLayer(id,isDepthMask);
            }
        }
        this._layerMap = {};            
    },

    removeAllConfigItem: function (isDepthMask) {
        if (isDepthMask) {
            for(var id in this._configItemMap){
                this.removeConfigItem(id,isDepthMask);
            }
        }
        this._configItemMap = {};
    },

    removeAllRelation: function (isDepthMask) {
        if (isDepthMask) {
            for(var id in this._relationMap){
                this.removeRelation(id,isDepthMask);
            }
        }
        this._relationMap = {};
    },

    removeAll: function (isDepthMask) {
        if (isDepthMask) {
            this.removeAllLayer(isDepthMask);
            this.removeAllConfigItem(isDepthMask);
            this.removeAllRelation(isDepthMask);
        }else{
            this.clear();
        }
    },
     
    /**
     * Kevin 
     * 移除该层和该层上的所有的孩子(包括子孙)
     * 使用场景：只显示某一层，其他的全部虚化
     *
     */
    removeLayerAndChildren : function(layerOrId,isDepthMask){
        if (!layerOrId) {
            return ;
        }
        var layer = layerOrId;
        if (typeof(layerOrId) == 'string') {
            layer = this.itvDataManager._layerMap[layerOrId];
        }
        if (!layer) {
            return ;
        }
        this.removeLayer(layerOrId,isDepthMask);
        var configItem_layers = layer.getConfigItem();
        for(var i = 0 ; i < configItem_layers.size() ; i++){
            var cil = configItem_layers.get(i);
            this.removeConfigItemAndChildren(cil.getConfigItemId(),isDepthMask);
        }
        var relations = layer.getRelations(); // 将该层的关系的虚化也清除掉
        for(var j = 0 ; j < relations.size() ; j++){
            var relation = relations.get(j);
            this.removeRelation(relation,isDepthMask);
        }
    },

    isVirtual : function(node){
        var data = node;
        if(node instanceof mono.Element){
            data = this.itvManager.getDataByNode(node);
        }
        if(data instanceof it.ITVConfigItem) {
           return this._configItemMap[data.getId()]; //没有就不管了
        }else if (data instanceof it.ITVLayer){
            return this._layerMap[data.getId()];
        }else if (data instanceof it.ITVRelation){
            return this._relationMap[data.getId()];
        }else {
            return false;
        }
    },

    setOpacityValue: function (opacityValue) {
        if (typeof opacityValue == 'number') {
            this.opacityValue = opacityValue;
        }
    },
    getOpacityValue: function (data) {
        if (this.getOpacityValueFunction && this.getOpacityValueFunction(data)) {
            return this.getOpacityValueFunction(data);
        }
        return this.opacityValue;
    },
    getIdByNode: function (node) {
        if (!node) {
            return null;
        }
        return (data = node.getClient('itv_data') || node.getClient('itv_relation')) && data.getId();
    },
    filterMaterial: function (originalMaterial, filterdMaterial, node) {
        var materialMap = this.materialMap;
        var material = filterdMaterial ? filterdMaterial : originalMaterial;
        var data = this.getIdByNode(node);
        if (!data
            && (node instanceof mono.Billboard)
            && node.getParent()) {
            data = this.getIdByNode(node.getParent());
        }
        var opacityValue = this.getOpacityValue(data);
        if (opacityValue == 1) {
            return material;
        }
        var id = "";
        var transFlag = false;
        if (data) {
            if (this._relationMap[data] || this._configItemMap[data] || this._layerMap[data]) {
                transFlag = this._relationMap[data] || this._configItemMap[data] || this._layerMap[data];
            }
            if (this.isMainVir && node.getClient('itv_point')) {
                if (transFlag) {
                    node.setVisible(false);
                } else {
                    node.setVisible(true);
                }
                return material;
            } 
            // if (node instanceof mono.Billboard && this.isMainVir && node.getClient('itv_point')) {
            //     if (transFlag) {
            //         node.setVisible(false);
            //     } else {
            //         node.setVisible(true);
            //     }
            //     return material;
            // } 
            // else {
                if (!transFlag) {
                    return material;
                } else {
                    var key = filterdMaterial ? filterdMaterial.getUniqueCode() : originalMaterial.getUniqueCode();
                    if (materialMap[key] == null) {
                        var m = filterdMaterial ? filterdMaterial.clone() : originalMaterial.clone();
                        m.transparent = true;
                        if (m.opacity > opacityValue) {
                            m.opacity = opacityValue;
                        }
                        materialMap[key] = m;
                        return m;
                    } else {
                        return materialMap[key];
                    }
                }
            // }
        } else {
            return material;
        }
    }
});

it.ITVVirtualManager = $ITVVirtualManager;