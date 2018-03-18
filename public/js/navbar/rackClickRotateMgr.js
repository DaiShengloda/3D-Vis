fa = {};
var $RackClickRotateMgr = function(sceneManager){
    this.sceneManager = sceneManager;
}

mono.extend($RackClickRotateMgr, Object, {
    init: function(){
        var $box = $('<div></div>').appendTo($(document.body)),
            self = this;
        this.showing = false;
        $box.css('display','none');
        $box.rackClickRotate({});
        this.$box = $box;
        var clickNode;
        this.sceneManager.network3d.getRootView().addEventListener('mouseup',function(e){
            //鼠标右键事件
            var curScene = self.sceneManager._currentScene;
            if(!curScene) return;
            if(curScene.getId() != 'floor') return;
            if(e.button === 2){
                //filterNode过滤掉了旁边的虚化机柜
                //产生条件：
                //  1：focus的为机柜
                //  2: 鼠标点的设备判断其祖先是否是focus机柜的id或点的是机柜
                var curFocusNode = self.sceneManager.viewManager3d.getFocusNode(),
                    curFocusData = self.sceneManager.getNodeData(curFocusNode),
                    curFocusDataId = curFocusData.getId(),
                    curFocusCateId = self.sceneManager.dataManager.getCategoryForData(curFocusData).getId(),
                    posX = e.pageX,
                    posY = e.pageY,
                    nodeInfo = {},filterNode,filterData;            
                if(self.sceneManager.viewManager3d.filterDoubleClickElement(e)){
                    filterNode = self.sceneManager.viewManager3d.filterDoubleClickElement(e).element;
                    filterData = self.sceneManager.getNodeData(filterNode);
                }else{
                    return;
                }
                //给组件传递node数据     
                if(curFocusCateId == 'rack' || curFocusCateId == 'equipment'){
                    if(self.sceneManager.isAncestor(filterData,curFocusDataId) || (filterData == curFocusData)){
                        clickNode = curFocusNode;
                        nodeInfo.node = curFocusNode;
                        nodeInfo.pos = [posX,posY],
                        nodeInfo.animating = false;
                        //如果只是右键变化位置，则去掉动画效果
                        if($box.css('display') == 'none'){
                            nodeInfo.animating = true;
                        }
                        self.$box.rackClickRotate('option','animating',false);
                        self.$box.rackClickRotate('option','nodeInfo',nodeInfo);
                        self.$box.rackClickRotate('option','scop',self);
                        self.showing = true;
                        
                    }                
                }
            }else{
                if(self.showing && !self.sceneManager.viewManager3d.filterDoubleClickElement(e)){
                    self.hide();
                }
            }
        });
        //监听focusChange事件，如果当前退出当前机柜镜头时旋转面板还在，则清除它
        //并将机柜旋转回位
        this.sceneManager.viewManager3d.addPropertyChangeListener(function(event){
            if(event.property == 'focusNode'){
                var oldNode = event.oldValue;
                if(!oldNode) return;
                var oldData = self.sceneManager.getNodeData(oldNode);
                var oldCateId = self.sceneManager.dataManager.getCategoryForData(oldData).getId();
                if(oldCateId == 'rack' || oldCateId == 'equipment'){
                    if(oldNode && (oldNode == clickNode)){
                        if(self.showing){
                            self.hide();
                        }
                    }
                }           
            }
        })
    },
    show: function(){
        this.showing = true;
    },
    hide: function(){
        this.showing = false;
        this.$box.rackClickRotate('option','close',true);
    },
    destory: function(){

    }
})

it.RackClickRotateMgr = $RackClickRotateMgr;