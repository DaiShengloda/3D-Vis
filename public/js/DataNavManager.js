/*
 * 管理数据层级关系
 */
var DataNavManager = function (sceneManager) {
	if(sceneManager == null){
		throw 'sceneManager needed';
	}
	this.sceneManager = sceneManager;
    this.dataManager = sceneManager.dataManager;
    this.createView();
    this.sceneManager.addSceneChangeListener(this.onSceneChange,this);
};

mono.extend(DataNavManager,Object,{

    
    /**
     * 获取兄弟节点
     * 需要注意的是，group的dc，这种情况会拿到当前地球小的所有的dc，处理方式：
     *   data找parent，如果parent还是dc的话，再往上找parent。然后遍历该parent的children，以及child的children
     *   
     */    
    getBrotherByData: function(data) {
        var list = new mono.List();
        if (!data) {
            return list;
        }
        var parent = this.dataManager.getParent(data);
        var parentCategory = this.dataManager.getCategoryForData(parent);
        var category = this.dataManager.getCategoryForData(data);
        var children = parent.getChildren();
        if (parentCategory && parentCategory.getId().toLowerCase() == 'datacenter') {
            var gParent = this.dataManager.getParent(parent);
            if (gParent) {
                children = gParent.getChildren();
            }
        }
        if ((parentCategory && parentCategory.getId().toLowerCase() == 'datacenter') 
            || (category && category.getId().toLowerCase() == 'datacenter')) {
            for (var i = 0; i < children.size(); i++) {
                var child = children.get(i);
                if (child && child._extend && child._extend["isGroup"]) {
                    var dChildren = child.getChildren();
                    if (dChildren && dChildren.size() > 0) {
                        for (var j = 0; j < dChildren.size(); j++) {
                            list.add(dChildren.get(j));
                        }
                    }
                } else {
                    list.add(child);
                }
            }
            return list;
        } else {
            return children;
        }
    },
    
    _findSiblings :function(){
    	var sm = this.sceneManager,dm = this.dataManager;
    	var node = sm.getCurrentRootNode();
    	var data = sm.getNodeData(node);
    	var parent = dm.getParent(data);
    	if(!parent){
    		return [];
    	}
    	// var childList = parent.getChildren();
        var childList = this.getBrotherByData(data); // update 2017-07-18 Kevin，便于扩展，children特别，如父子中心的问题
        var children = new mono.List();
        childList.forEach(function(child){
            var type = dm.getDataTypeForData(child);
            if (!type || !type.getModel()) {
                return ;
            }
            if(child.getChildren().size() > 0 || (type && type.getCategoryId() == 'floor')){
                children.add(child);
            }
        });
    	return children;
    },

    createView : function(){
    	var view = this.view = $('<div>',{class:"data-nav"});
    	var network = this.sceneManager.network3d;
    	var rootView = $(network.getRootView());
    	var self = this;
    	view.appendTo(rootView);

    	view.delegate('a','click',function(event){
    		event.preventDefault();
    		event.stopPropagation();
            if (main.navBarManager && main.navBarManager.appManager) { //同级跳转时，需要重置navBar操作后的结果
                // main.navBarManager.appManager.reset(true,false);
                main.navBarManager.appManager.reset(true, false, '', '', event);
            }
            var that = $(this);
            var id = that.attr('dataId');
            self.sceneManager.gotoData(id);
    	});
    },

    show : function(){
    	this.view.css('display','block');
    },

    hide : function(){
    	this.view.css('display','none');
    },

    onSceneChange : function(){
    	var flag = this.createSiblingList();
    	if(flag){
    		this.show();
    	}else{
    		this.hide();
    	}
    },

	createSiblingList : function(){// bootstrap list
		this.view.empty();
		var sm = this.sceneManager,dm = this.dataManager;
		var node = sm.getCurrentRootNode();
		var data = sm.getNodeData(node);
        var datas = this._findSiblings();
        datas = datas._as ? datas : new mono.List(datas);
        if(datas.size() <= 1){
        	return false;
        }
		var ul = $('<ul>',{class:'list-group'}).appendTo(this.view);
        //导航文字没什么意思，去掉
		// $('<li>',{class:"list-group-item disable"}).appendTo(ul).html(" 导   航 ");
		datas.forEachReverse(function(child){
            // var childType = dm.getDataTypeForData(child);
            // if (!childType || !childType.getModel()) {
            //     return ;
            // }
			var clazz = "list-group-item ";
			if(child == data){
				clazz += "disabled";
			}
            var desc = child.getName() || child.getId();
			if(child == data){
				$('<li>',{class:clazz}).appendTo(ul).html(desc);
			}else{
			   $('<li>',{class:clazz}).appendTo(ul).html('<a href = "#" dataId = '+ child.getId()+'>' + desc + "</a>");
			}
		});
		return true;
	},

    showNetwork : function(pos){
        if(this.network2dDiv == null){
            this._createNetwork();
        }
        if(pos && pos.left){
            this.network2dDiv.css('left',pos.left + 'px');
        }
        this.network2dDiv.css('display','block');
    },

    hideNetwork : function(){
        if(this.network2dDiv){
           this.network2dDiv.css('display','none');
        }
    },

    _makeStructure : function(network){// TODO 应该从场景考虑
        var dm = this.dataManager;
        var roots = dm.getRoots();
        if(roots == null || roots.length == 0){
            return null;
        }
        var root = roots[0];
        var box = network.getElementBox();

        function inner (rootData,rootNode){
            var category = dm.getCategoryForData(root);
            if(category.getId() === 'floor'){
                return;
            }
            var node = null;
            if(rootNode){
                node  = rootNode;
            }else{
                node = new twaver.Node(rootData.getId());
                box.add(node);
            }
            
            var childList = rootData.getChildren();
            if(dm.getSceneByCategory(category)){
               childList.forEach(function(child){
                   var node2 = new twaver.Node(child.getId());
                   var link = new twaver.Link(node.getId() + "-" + node2.getId(),node,node2);
                   box.add(node2);
                   box.add(link);

                   child.__rootNode = node2;
               }); 
            }
            childList.forEach(function(child){
                inner(child,child.__rootNode);
            });
        }
        inner(root);
    },

    _createNetwork : function(){
        var network3d = this.sceneManager.network3d;
        var rootDiv = this.network2dDiv = $('<div></div>');
        rootDiv.appendTo($(network3d.getRootView()));
        var network =this.network2d = new twaver.vector.Network();
        var view = $(network.getView());
        view.appendTo(this.network2dDiv);
        network.adjustBounds({x:0,y:0,width:300,height:200});
        rootDiv.css('position','absolute')
               .css('background','#656565')
               .css('z-index','1000')
               .css('width','300px')
               .css('height','200px')
               .css('top','30px')
               .css('left','100px');

        this._makeStructure(network);
    },
});

