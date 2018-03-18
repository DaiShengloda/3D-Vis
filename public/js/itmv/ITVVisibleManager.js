
/**
 * IT架构的不可见管理
 */
var $ITVVisibleManager = function(itvManager){
    it.VisibleFilter.call(this);
    this.itvManager = itvManager;
    this.isDealWithFunction = null;
    this._configItemMap = {};
    this._layerMap = {};
    this._relationMap = {};
};

mono.extend($ITVVisibleManager,it.VisibleFilter,{

    clear: function(){
       this._configItemMap = {};
       this._layerMap = {};
       this._relationMap = {};
        // 需要注意的时，当没有加到viewManager3D中时，怎么clear都不应该fire,这里还需改进!!!
        // this.sceneManager._sceneVisibleChangeDispather.fire({
        //         data:null,
        //         type:'clear'
        // });
    },

    /**
     * 是否需要设置显示/隐藏：
     * @param data
     * @returns {boolean}
     */
    isDealWith : function(data){
        if(this.isDealWithFunction != null){
            return this.isDealWithFunction(data);
        }
        return true;
    },

    // getBId : function(data){
    //     if(!data) {
    //         return null;
    //     }
    //     if (!(data instanceof it.Data)) {
    //          return null;
    //     }
    //     if(!this.isDealWith(data)){
    //         return null;
    //     }
    //     return data.getId();
    // },

    setVisible: function(data, visible) {
        // var id = this.getBId(data);
        // if (id) {
        //     var oldValue = this._vmap[id];
        //     if (visible) {
        //         delete this._vmap[id];
        //     } else {
        //         this._vmap[id] = false;
        //     }
        //     if (oldValue == undefined) { //如果map中没有的话就直接退出
        //         return ;
        //     }
            // if (fireDispather === null || fireDispather === undefined) {
            //     fireDispather = true;
            // }
            // if (fireDispather && (oldValue != visible)) {
            //     this.sceneManager._sceneVisibleChangeDispather.fire({
            //         data: data,
            //         value: visible,
            //     });
            // }
        // }
        if (!data) {
        	return ;
        }
        if (data instanceof it.ITVConfigItem) {
        	if (visible) {
                delete this._configItemMap[data.getId()];
            } else {
                this._configItemMap[data.getId()] = false;
            }
        }else if(data instanceof it.ITVRelation){
        	if (visible) {
                delete this._relationMap[data.getId()];
            } else {
                this._relationMap[data.getId()] = false;
            }
        }else if(data instanceof it.ITVLayer){
        	if (visible) {
                delete this._layerMap[data.getId()];
            } else {
                this._layerMap[data.getId()] = false;
            }
        }
    },

    getDataByNode : function(node){
        if(!node){
            return null;
        }
        return this.sceneManager.getNodeData(node);
    },

    setVisibleByDescendant : function(data,visible,fireDispather){
        if(!data){
            return ;
        }
        if(data instanceof mono.Element){
            data = this.itvManager.getDataByNode(data);
        }
        // if(fireDispather === null || fireDispather === undefined){
        //     fireDispather = true;
        // }
        if(!data || !data.getId()) return;
        this.setVisible(data,visible,false);
        if (!data.getChildren) {
        	return ;
        }
        // var node = this.sceneManager.dataNodeMap[data.getId()];
        // var children = node.getChildren();
        var children = data.getChildren();
        if(children && children.size() > 0){
            for(var i = 0 ; i < children.size(); i++){
                var child = children.get(i);
                // var childData = this.getDataByNode(child);
                // if(childData
                //     && this.getBId(childData) != this.getBId(data)){
                //     this.setVisibleByDescendant(child,visible,false,this);
                // }
                // if(this.getBId(child) != this.getBId(data) 
                //     || (!this.getBId(child) && !this.getBId(data))){ //当两个Bid都为null时也执行，因为filter(过滤在里面处理的)
                    this.setVisibleByDescendant(child,visible,false,this);
                // }
            }
        }
        // if(fireDispather){
        //     this.sceneManager._sceneVisibleChangeDispather.fire({
        //         data: data,
        //         type:'descendtant',
        //         value: visible,
        //     });
        // }
    },

    isVisible: function(node,dataOrId,network){
        var data = this.itvManager.getDataByNode(node);
        // if (node && node.getClient(it.SceneManager.CLIENT_EXT_VISIBLE)) { // 如果是扩展的直接就返回不管了
        //     return true;
        // }
        if (data instanceof it.ITVConfigItem) {
        	if (this._configItemMap[data.getId()] == false) {
        		return false;
        	}
        }else if(data instanceof it.ITVRelation){
        	if(this._relationMap[data.getId()] == false){
        		return false;
        	}
        }else if(data instanceof it.ITVLayer){
        	if (this._layerMap[data.getId()] == false) {
        		return false;
        	}
        }
        return true;
    }

});

it.ITVVisibleManager = $ITVVisibleManager;

