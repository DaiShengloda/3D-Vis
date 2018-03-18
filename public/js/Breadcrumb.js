
var Breadcrumb = it.Breadcrumb = function(obj){
    if(obj){
        var parentDiv = obj.parentDiv || $('body');
        this.sceneManager = obj.sceneManager || null;
    }else{
        var parentDiv = $('body');
    }
    this.defaultEventHandler = null;
    if(this.sceneManager){
        this.defaultEventHandler = this.sceneManager.viewManager3d.getDefaultEventHandler();
    }
    var bcDiv = this.bcDiv = $('<div class="itv-breadcrumb-menu"></div>');
    this.breadcrumbPane = $('<ol class="itv-breadcrumb it-shadow"> </ol>');
    // parentDiv.append(this.breadcrumbPane);
    bcDiv.append(this.breadcrumbPane);
    parentDiv.append(bcDiv);
    this.dateTimeDiv = $('<div class="breadcrumb_dateTime"></div>');
    bcDiv.append(this.dateTimeDiv);
    this.lookAtElement = null; // 用来保存当前正停留在哪里（相当于“lookAt”在那个对象上）
    this.menuItems = [];
    this.refreshTime();
    // this.navBar = $('<li><a href="#" ><img src = "./css/images/arrow.svg" style="height:10px"></img></a></li>');

    if(dataJson.showBreadcrumb === false){
        bcDiv.hide();
    }else{
        bcDiv.show();
    }
}

mono.extend(Breadcrumb,Object,{

    addMenuItem: function (menuItem) {
        if (menuItem) {
           this.menuPane.append(menuItem);
        }
    },

    setData: function (dataOrNode) {
        this.clear();
        // this.refreshTime();
        if (!dataOrNode) {
            dataOrNode = this.sceneManager.getCurrentRootNode();
            if (!dataOrNode) {
                dataOrNode = this.sceneManager._currentRootData;
            }
        }
        // 如果没有场景，一下加载了所有的data，此时的root就的自己去理了,从box中获取一个data，按照data往上遍历查找
        if(!dataOrNode){
            var nodes = this.sceneManager.dataNodeMap;
            var box = this.sceneManager.network3d.getDataBox();
            var node = null;
            for(var id in nodes){
               node = nodes[id];
               if(box.getDataById(node.getId)){
                   break;
               }
            }
            dataOrNode = node;
        }
        if (!dataOrNode) {
            return;
        }
        this.lookAtElement = dataOrNode;
        this._addNode(dataOrNode);
    },

    /**
     * 判断id1是不是id2的祖先
     * @param id1
     * @param id2
     * @param scope
     * @returns {*}
     */
    checkAncestor : function(id1,id2,scope){
        if(!id1 || !id2){
            return false;
        }
        if(id1 === id2){
            return true;
        }
        var self = scope || this;
        var data2 = self.sceneManager.dataManager.getDataById(id2);
        if(data2){
            return self.checkAncestor(id1,data2.getParentId(),scope);
        }
        return false;
    },

    getAncestor : function(id1,id2,scope){
        if(!id1 || !id2){
            return;
        }
        if(id1 === id2){
            return id1;
        }
        var self = scope || this;
        var data2 = self.sceneManager.dataManager.getDataById(id2);
//        if(data2 && self.getAncestor(id1,data2.getParentId(),self)){
        if(data2 && self.checkAncestor(id1,id2,self)){ // 防止逆序，所以还是得这么判断
            return self.getAncestor(id1,data2.getParentId(),self);
        }
        var data1 = self.sceneManager.dataManager.getDataById(id1);
        if(data1){
            return self.getAncestor(data1.getParentId(),id2,self);
        }
        return null;
    },

    /**
     * 获取id1和id2最近的公共的祖先
     * @param id1
     * @param id2
     */
    getTheSameAncestor : function(id1,id2){
        var dm = this.sceneManager.dataManager;
        if(!id1 && !id2){
            return null;
        }else if(!id1 && id2){
            return dm.getDataById(id2);
        }else if(id1 && !id2){
            return dm.getDataById(id1);
        }else{
            var ancestorId = this.getAncestor(id1,id2);
            if(ancestorId){
                return dm.getDataById(ancestorId);
            }
        }
    },

    _addNode: function (dataOrNode, scope) {
        if (!dataOrNode) {
            return;
        }
        if (!scope) {
            scope = this;
        }
        var data = dataOrNode;
        if (dataOrNode instanceof mono.Element) {
            data = scope.sceneManager.getNodeData(dataOrNode);
        }
        var obj = {};
        var parentData = null;
        // var data = assetNode.getClient(it.SceneManager.CLIENT_IT_DATA);
        if(data instanceof it.Link){
            var fromAndToParentData = this.getTheSameAncestor(data.getFromId(),data.getToId());
            data = fromAndToParentData;
        }
        if (!data || !(data instanceof it.Data)) {
            return;
        }
        var category = scope.sceneManager.dataManager.getCategoryForData(data);
        var text = data.getName&&data.getName()?data.getName():data.getId();
        obj = {text: text,
            description: data.getName?data.getName():'',
            callback: function () {
                if(!scope.sceneManager.viewManager3d.enableDBLClick){ //表示锁定，场景切换的过程中，不可点击再切换 2017-07-10
                 return;
                }
               defaultEventHandler
            }
        };
        // parentAssetNode = scope.sceneManager.getParentNode(data);
        parentData = scope.sceneManager.dataManager.getDataById(data.getParentId());
        if (obj) {
            scope._addItem(obj,parentData);
        }
        var rootScene = main.sceneManager.dataManager.getRootScene();
        if (category && rootScene && category.getId() == rootScene._categoryId) {// 如果已经到了根节点则再也不往上走了
            return;
        }
        if (parentData
            && parentData != data) { // 加了这个,防止死循环
            arguments.callee(parentData, scope);
        }
    },

    /**
     * 显示tooltip
     * @param obj格式如下：
     * {
     * id:选则器的规则，如:'.menu ul li a'、'#maindivId'
     * selector,选择器处理后的item，如$('.menu ul li a')、$('#maindivId')
     * text:,tooltip的text，如果是用id选择器批量处理的话，那得是target上的rel
     * parent:,toolTip所在的panel
     * offsetY:,y方向上的偏移量
     * offsetX:x方向上的偏移量
     * }
     */
    showTooltip: function (obj) {
        if (!obj || !obj.parent) {
            return;
        }
        var offsetY = obj.offsetY ? obj.offsetY : 0, offsetX = obj.offsetX ? obj.offsetX : 0;
        if (obj.id) {
            $(obj.id).mouseover(
                function (e) {
                    var myTitle = e.target.rel;
                    var tooltip = $("<div id='tooltip' class='itv-breadcrumb-tooltip-content it-shadow'>" + myTitle + "</div>");
                    obj.parent.append(tooltip);
                    var offsetTop = e.target.offsetTop - e.target.offsetHeight + offsetY;
                    var offsetLeft = e.target.offsetLeft + e.target.offsetWidth + offsetX;
                    tooltip.css('top', offsetTop);
                    tooltip.css('left', offsetLeft);
                }
            ).mouseout(
                function () {
                    $("#tooltip").remove();
                }
            );
        } else if (obj.selector) {
            if (!obj.text) {
                return;
            }
            obj.selector.mouseover(
                function (e) {
                    var tooltip = $("<div id='tooltip' class='itv-breadcrumb-tooltip-content it-shadow'>" + obj.text + "</div>");
                    obj.parent.append(tooltip);
                    var offsetTop = e.target.offsetTop - e.target.offsetHeight + offsetY;
                    var offsetLeft = e.target.offsetLeft + e.target.offsetWidth + offsetX;
                    tooltip.css('top', offsetTop);
                    tooltip.css('left', offsetLeft);
                }
            ).mouseout(
                function () {
                    $("#tooltip").remove();
                }
            );
        }
    },

    /**
     *
     * @param itemData
     * @param parentData 父data
     * @private
     */
    _addItem: function (itemData,parentData) {
        if (!itemData) {
            return;
        }
        // this.navBar.remove();
        var text = itemData.text;
        var callback = itemData.callback;
        var description = itemData.description;
        var item = null;
        if (this.breadcrumbPane.children().size() < 1) {
            if(parentData){ //当是根节点的话，就用图标
                item = $('<li class="active">' + text + '</li>');
            }else{
                item = $('<li class="active breadcrumb-home-active"></li>');
            }
        }else{
            if(parentData){
                item = $('<li><a href="#">' + text + '</a></li>');
            }else{
                item = $('<li class="breadcrumb-home"><a href="#">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</a></li>');
            }
        }
        if (description) {
            this.showTooltip({
                selector: item,
                text: description,
                parent: this.breadcrumbPane,
                offsetY: 30
            });
        }
        if (callback) {
            item.click(callback);
        }
        this.breadcrumbPane.prepend(item);
    },

    // bindNavBarEvent : function(){
    //     this.navBar.find('a').click(function(){
    //         console.log('Go to nav network');
    //     });
    // },

    refreshTime: function() {
        if (this.refreshTimeInterval) {
            clearInterval(this.refreshTimeInterval);
        }
        this.addTime();
        var self = this;
        this.refreshTimeInterval = setInterval(function() {
            self.addTime();
        }, 60 * 1000);
    },

    addTime: function() {
        this.dateTimeDiv.empty();
        var dataTime = (new Date()).format('hh:mm'); //yyyy-MM-dd hh:mm:ss
        var item = $('<a>' + dataTime + '</a>');
        this.dateTimeDiv.append(item);
    },

    getLookAtElement: function () {
        if (dataOrNode && dataOrNode instanceof it.Data) {
            this.lookAtElement = this.sceneManager.getNodeByDataOrId(dataOrNode);
        };
        return this.lookAtElement;
    },

    clear: function () {
        this.breadcrumbPane.empty();
    },

});



