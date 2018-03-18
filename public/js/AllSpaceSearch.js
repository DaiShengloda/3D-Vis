
// 空间、电力、承重整合到一起
AllSpaceSearch = function(sceneManager){
	this.sceneManager = sceneManager;
    this.dm = this.sceneManager.dataManager;
    this.dataBox = this.sceneManager.network3d.getDataBox();
    this.visibleManager = new it.VisibleManager(this.sceneManager);
    this.defaultEventHandle = this.sceneManager.viewManager3d.getDefaultEventHandler();
    this.dataManager = this.sceneManager.dataManager;
    this.spaceManager = new it.SpaceManager(this.dataManager,this.sceneManager);

    this.orgTreeManager = new it.OrganizeTreeManager(this.sceneManager.dataManager);
    this.spaceSearchFinder = new SpaceSearchFinder(this.dataManager,this.sceneManager);
    this.treeView = null;
    this.inputPane = new AllSpaceSearchPanel();
    this.spaceMap = {};
    this.diagram = new it.Diagram();

    this.init();
    this.typeMap = {};
    this.tNodes = {};
    this.pns = {};
    this.sps = {};
    this.ws = {};
};

mono.extend(AllSpaceSearch,Object,{

    init : function(){
       this.sceneManager.viewManager3d.addVisibleFilter(this.visibleManager);
       this.searPanel = $('.search-main-pane');
        var paneIndex = 0;
        if(this.searPanel && this.searPanel.length > 0){
            paneIndex = this.searPanel.length;
        }
        this.searPanel = $('<div id = "search-main-pane_'+paneIndex+'" class="search-main-pane"></div>');
        this.searPanel.append(this.inputPane.getContentPane());
        this.treeView = new it.TreeView(this.searPanel);
        var self = this;
        this.treeView.clickNodeFunction = function(treeData){
            // self.clickTreeNode(treeData);
        };

        this.treeView.mouseoverNodeFunction = function(treeData){
            // self.mouseOverTreeNode(treeData);
        };

        this.inputPane.doClickFunction = function(values){
            self.beforeDoClick();
            self.setData(values);
            var height = self.searPanel.height() - self.inputPane.getContentPane().height();
            self.treeView.setTreeHeight(height);
            // self.show();
        };

        this.inputPane.doClearFunction = function(){

            self.setData();
        };

        // this.orgTreeManager.getParentIdByData = function(data){
        //     if(data && !data.getFromId() && !data.getToId()){
        //         return null;
        //     }else{
        //         return self.getCurrentRootId();
        //     }
        // };

        this.orgTreeManager.createLabel = function(treeData){
           return self.setLabel(treeData);
        };

        this.sceneManager.addSceneChangeListener(function(eve){
            self.clear();
        });
        this.initDiagram();
    },

    initDiagram : function(){
        var datas = [];
        datas.push({value:it.util.i18n("AllSpaceSearch_Space"),color:'#6FD772'});
        datas.push({value:it.util.i18n("AllSpaceSearch_Electricity"),color:'#Fd674F'});
        datas.push({value:it.util.i18n("AllSpaceSearch_Bearing"),color:'#FFC95A'});
        this.diagram.setData(datas,it.util.i18n("AllSpaceSearch_SEB_graph"));
        this.diagram.diagramPane.hide();
    },

    setLabel : function(treeData){
        if(!treeData || !treeData.getId()){
            return null;
        }
        var id = treeData.getId();
        var space = this.spaceMap[id];
        var uNumber = parseInt(this.inputPane.getUNumber())||1;
        if(space && uNumber){
            var count = 0;
            var empList = space.getEmptyList();
            if(empList && empList.length > 0){
                for(var i = 0 ; i < empList.length ; i++){
                    var ep = empList[i];
                    if(ep.total >= uNumber){
                        count += Math.floor(ep.total/uNumber);
                    }
                }
            }
            return id + '('+count+it.util.i18n("AllSpaceSearch_Unit")+ +')';
        }else{
            return id;
        }
    },

    getRootView : function(){
        // return this.inputPane.getContentPane();
        return this.searPanel;
    },

    
   
    setData :function(conditions){
        this.clear();
        if (this.isShow) {
            return ;
        }
        this.isShow = true;
        var sceneNodes = this.initSceneNodes();
        if(!sceneNodes || sceneNodes.length <1){
            return ;
        }
        this.diagram.diagramPane.show();
        var results = this.spaceSearchFinder.find(conditions);
        var treeNodes = null;
        if (!results || results.length < 1) {
            this.treeView.clearTreeData();
        }else{
            // this.addRoot(results);
            if (conditions != undefined) {
                treeNodes = this.orgTreeManager.organizeTree(results);
                this.treeView.setData(treeNodes, false);
            }
            for (var i = 0 ; i < results.length; i++) {
                var data = results[i];
                var category = this.dm.getCategoryForData(data);
                if (!category || category.getId().toLowerCase().indexOf('rack') < 0) {
                    continue;
                }
                this.computeByCylinder(data);
            };
        }
    },

    beforeDoClick : function(){

    },
     
    show: function() {
        // this.clear();
        // var datas = this.sceneManager.getSceneDatas();
        // if (datas) {
        //     for (var id in datas) {
        //         var data = datas[id];
        //         var category = this.dm.getCategoryForData(data);
        //         if (!category || category.getId().toLowerCase().indexOf('rack') < 0) {
        //             continue;
        //         }
        //         this.computeByCylinder(data);
        //     }
        // }
        // this.isShow = true;
    },

    /**
     * 创建几个圆柱体
     */
    computeByCylinder: function(data) {
        var category = this.dm.getCategoryForData(data);
        if (!category || category.getId().toLowerCase().indexOf('rack') < 0) {
            return;
        }
        var dataBox = this.dataBox;
        var node = this.sceneManager.getNodeByDataOrId(data);
        if (node) {
            // this.visibleManager.setVisible(data, false);
            var bbs = node.getBoundingBox().size();
            var radius = bbs.z/2;
            if(bbs.x/2 < radius){
                radius = bbs.x/2;
            }
            var height = bbs.y;
            var insideRadius = radius/2;
            var cylinder = this.typeMap['cylinder'];
            if (!cylinder) {
                cylinder = new mono.Cylinder(insideRadius,insideRadius,height,20,1,false,false,2 * Math.PI,0);
                this.typeMap['cylinder'] = cylinder;
            }
            var parent = cylinder.clonePrefab();
            parent.setStyle('m.transparent',true);
            parent.setStyle('m.opacity',0.8);
            parent.setStyle('m.color','#dddddd');
            parent.setStyle('m.ambient','#dddddd');
            parent.setStyle('m.type','phong');

            parent.setPosition(node.p());
            parent.setY(node.getY()+1);
            parent.setParent(node.getParent());
            // parent.setClient('data_id',data.getId());
            parent.setClient(it.SceneManager.CLIENT_IT_DATA, data);
            parent.setClient(it.SceneManager.CLIENT_IT_DATA_ID, data.getId());
            parent.setClient(it.SceneManager.CLIENT_EXT_VISIBLE,true);
            dataBox.add(parent);
            this.tNodes[data.getId()] = parent;

            var self = this;
            parent.doubliClick = function(element, network, data, clickedObj) {
                self.dblClick(element, network, data, clickedObj);
            }
            
            // var value = 0.81;
            var value = Math.random();
            var sCylinder = this.createFan(data,radius,insideRadius,bbs,0,value,parent);
            // sCylinder.setClient('data_id',data.getId());
            // sCylinder.setClient(it.SceneManager.CLIENT_IT_DATA, data);
            // sCylinder.setClient(it.SceneManager.CLIENT_IT_DATA_ID, data.getId());
            // sCylinder.setClient(it.SceneManager.CLIENT_EXT_VISIBLE,true);
            sCylinder.doubliClick = function(element, network, data, clickedObj) {
                self.dblClick(element, network, data, clickedObj);
            }

            // var value = 0.53;
            var value = Math.random();
            var pCylinder = this.createFan(data,radius,insideRadius,bbs,1,value,parent);
            // pCylinder.setClient('data_id',data.getId());
            // pCylinder.setClient(it.SceneManager.CLIENT_IT_DATA, data);
            // pCylinder.setClient(it.SceneManager.CLIENT_IT_DATA_ID, data.getId());
            // pCylinder.setClient(it.SceneManager.CLIENT_EXT_VISIBLE,true);
            pCylinder.doubliClick = function(element, network, data, clickedObj) {
                self.dblClick(element, network, data, clickedObj);
            }

            // var value = 0.2;
            var value = Math.random();
            var wCylinder = this.createFan(data,radius,insideRadius,bbs,2,value,parent);
            // wCylinder.setClient('data_id',data.getId());
            // wCylinder.setClient(it.SceneManager.CLIENT_IT_DATA, data);
            // wCylinder.setClient(it.SceneManager.CLIENT_IT_DATA_ID, data.getId());
            // wCylinder.setClient(it.SceneManager.CLIENT_EXT_VISIBLE,true);
            wCylinder.doubliClick = function(element, network, data, clickedObj) {
                self.dblClick(element, network, data, clickedObj);
            }
            
        }
    },

    dblClick: function(element, network, data, clickedObj) {
        // var dataId = element.getClient('data_id');
        var dataId = element.getClient(it.SceneManager.CLIENT_IT_DATA_ID);
        var self = this;
        var callback = function() {
            var cylinder = self.tNodes[dataId];
            if (cylinder) {
                var animate = new mono.Animate({
                    from: 0,
                    to: 2 * Math.PI,
                    // delay: 0,
                    dur: 2000,
                    easing: 'easeNone',
                    onUpdate: function(value) {
                        cylinder.setRotationY(value);
                    },
                    onDone : function(){
                        main.proDialog.propertyManager.showTabByIndex(2); //执行完动画后，将属性框翻到统计的那个tab
                    }
                });
                animate.play();
            }
        }
        this.defaultEventHandle.lookAtByData(dataId, callback);
    },

    /**
     * 创建1/3的圆锥
     * type类型，0:空间,1:电力,2:承重
     */
    createFan: function(data,radius,insideRadius,psize, type, detauleValue, parent) {
        var start = parseInt(type) * 2 * Math.PI / 3 +　Math.PI / 3;
        var value = detauleValue ;
        if (type == 0) { //空间，应该是连续的
            value = this.getSpaceRating(data);
        }else if (type == 1) { //电力
            var restPowerRating = parseFloat(data.getUserData('rest_power_rating'));
            var totalPowerRating = parseFloat(data.getUserData('total_power_rating'));
            if(totalPowerRating >0){
                value = restPowerRating/totalPowerRating;
            }
        }else{ //承重
           var restWeightRating = parseFloat(data.getUserData('rest_weight_rating'));
           var totalWeightRating = parseFloat(data.getUserData('total_weight_rating'));
           if(totalWeightRating >0){
              value = restWeightRating/totalWeightRating;
           }
        }
        var height = value * psize.y ;

        var typeC = this.typeMap[type];
        if(!typeC){
            var cOne = new mono.Cylinder(radius,radius,1,20,20,false,false,2*Math.PI/3 - Math.PI/180,start);
            var cTwo = new mono.Cylinder(insideRadius,insideRadius,1,20,20,false,false,2*Math.PI,0);
            typeC = new mono.ComboNode([cOne,cTwo],'-');
            typeC.s({
            // 'm.transparent': true,
            // 'm.opacity':0.9,
            'm.type': 'phong',
            'm.color': this.getColor(value,type),
            'm.ambient': this.getColor(value,type),
            'm.specularStrength': 30,
          });
           typeC.setStyle('top.m.gradientType',5);
           typeC.setStyle('top.m.gradient',{
              0:'#AAAAAA',
              0.5:'#AAAAAA',
              1:this.getColor(value,type),
           });
              this.typeMap[type] = typeC;
        }

       var c1 = typeC.clonePrefab();
       c1.setScaleY(height);
       c1.setY(height/2 - psize.y/2);
       c1.setParent(parent);
       c1.setClient(it.SceneManager.CLIENT_IT_DATA, data);
       c1.setClient(it.SceneManager.CLIENT_IT_DATA_ID, data.getId());
       c1.setClient(it.SceneManager.CLIENT_EXT_VISIBLE,true);
       this.dataBox.add(c1);
       return c1;
    },

    isDealwith : function(dataOrNode){
        if (!dataOrNode) {
            return false;
        }
        var data = null;
        if (dataOrNode instanceof it.Data) {
            data = dataOrNode;
        }else if(dataOrNode instanceof mono.Element){
            data = this.sceneManager.getNodeData(dataOrNode);
        }
        var category = this.sceneManager.dataManager.getCategoryForData(data);
        if (category && category.getId().toLowerCase().indexOf('rack')>=0) {
            return true;
        }
    },

    initSceneNodes : function(){
        var sceneNodes = [];
        var sceneDatas = this.sceneManager.getSceneDatas();
        if(sceneDatas){
            var nodeMaps = this.sceneManager.dataNodeMap;
            for(var id in sceneDatas){
                var node = nodeMaps[id];
                var data = sceneDatas[id];
                if(node && data && this.isDealwith(node)){
                    this.visibleManager.setVisibleByDescendant(data, false);
                    var space = this.spaceManager.computeSpace(data);
                    if (space && (space instanceof it.Space1)) {
                        this.computeSpaceByDataOrNode(node);
                        sceneNodes.push(node);
                    }
                    this.computePowerByDataOrNode(data);
                    this.computeWeightByDataOrNode(data);
                }
            }
        }
        return sceneNodes;
    },

    getSpaceRating : function(data){
        if(!data){
            return 0;
        }
        var space = this.spaceMap[data.getId()];
        var uNumber = parseInt(this.inputPane.getUNumber())||1;
        if(space && uNumber){
            var count = 0;
            var empList = space.getEmptyList();
            var total = space.getTotal();
            if(empList && empList.length > 0){
                for(var i = 0 ; i < empList.length ; i++){
                    var ep = empList[i];
                    if(ep.total >= uNumber){
                        count += Math.floor(ep.total/uNumber);
                    }
                }
            }
            var totalCount = total/uNumber;
            return count/totalCount;
        }
    },

    computeSpaceByDataOrNode: function(dataOrNode) {
        if (!dataOrNode) {
            return;
        }
        var data = null;
        if (dataOrNode instanceof it.Data) {
            data = dataOrNode;
        }else{
            data = this.sceneManager.getNodeData(dataOrNode);
        }
        // if(this.isDealwith(node)){
        if (!data) return;
        var space = this.spaceManager.computeSpace(data);
        if (space && (space instanceof it.Space1)) {
            this.spaceMap[data.getId()] = space;
            var maxEmpSerSpace = 0,
                totalEmpSpace = space.getTotal() - space.getOccupation();
            var empList = space.getEmptyList();
            if (empList && empList.length > 0) {
                for (var i = 0; i < empList.length; i++) {
                    var ep = empList[i];
                    if (ep.total > maxEmpSerSpace) {
                        maxEmpSerSpace = ep.total;
                    }
                }
            }
            data.setUserData('allSpaceSearch_data_maxSerSpace', maxEmpSerSpace);
            data.setUserData('allSpaceSearch_totalEmpSpace', totalEmpSpace);
            // this.virtualNode.push(node);
        }
        // }
    },

    computePowerByDataOrNode : function(dataOrNode){
        var data  = dataOrNode;
        if (dataOrNode instanceof mono.Element) {
            data = this.sceneManager.getNodeData(dataOrNode);
        }
        var dataType = this.dataManager.getDataTypeForData(data);
        var powerRating = parseFloat(dataType.getPowerRating());
        var usedPowerRating = 0;
        var children = data.getChildren();
        if (children && children.size() > 0) {
            for(var i = 0 ; i < children.size() ; i++){
                var child = children.get(i);
                var cType = this.dataManager.getDataTypeForData(child);
                var cPowerRating = parseFloat(cType.getPowerRating()||0);
                usedPowerRating = usedPowerRating + cPowerRating;
            }
        }
        var restPowerRating = parseFloat(powerRating-usedPowerRating);
        if(restPowerRating < 0){
            restPowerRating = 0;
        }
        // var dataNode = this.sceneManager.getNodeByDataOrId(data);
        data.setUserData('rest_power_rating',restPowerRating);
        data.setUserData('total_power_rating',powerRating);
    },

    computeWeightByDataOrNode: function(dataOrNode) {
        var data = dataOrNode;
        if (dataOrNode instanceof mono.Element) {
            data = this.sceneManager.getNodeData(dataOrNode);
        }
        var dataType = this.dataManager.getDataTypeForData(data);
        var weightRating = parseFloat(dataType.getWeightRating()); // 数据库中目前是int,不是太合理
        var usedWeight = 0;
        var children = data.getChildren();
        if (children && children.size() > 0) {
            for(var i = 0 ; i < children.size() ; i++){
                var child = children.get(i);
                usedWeight = usedWeight + parseFloat(child.getWeight()||0);
            }
        }
        var restWeightRating = parseFloat(weightRating-usedWeight);
        if(restWeightRating < 0){
            restWeightRating = 0;
        }
         var dataNode = this.sceneManager.getNodeByDataOrId(data);
        data.setUserData('rest_weight_rating',restWeightRating);
        data.setUserData('total_weight_rating',weightRating);
    },

    getFrameColor : function(value){
        // return 'white';
         if(value > 0.75){
            return '#CE3118';
        }else if(value >= 0.5){
            return '#E68D00';
        }else if (value >= 0.25) {
           return '#1A920A';
        }else{
           return '#018ABD';
        }
     },

     getColor : function(value,type){
         if(type == 1){
            return '#Fd674F';
        }else if(type == 2){
            return '#FFC95A';
        }else if (type == 0) {
           return '#6FD772';
        }else{
            return '#5DBDE0';
        }
     },

     clear : function(){
        delete this.isShow;
        for(var id in this.tNodes){
            var frame = this.tNodes[id];
            frame.setParent(null);
            this.dataBox.removeByDescendant(frame);
            delete this.tNodes[id];

            var pNode = this.pns[id];
            if (pNode) {
                pNode.setParent(null);
                this.dataBox.remove(pNode);
                delete this.pns[id];
            }
            var sNode = this.sps[id];
            if (sNode) {
                sNode.setParent(null);
                this.dataBox.remove(sNode);
                delete this.sps[id];
            }
            var wNode = this.ws[id];
            if (wNode) {
                wNode.setParent(null);
                this.dataBox.remove(wNode);
                delete this.ws[id];
            }
        }
        this.visibleManager.clear();
        this.treeView.clearTreeData();
        this.diagram.diagramPane.hide();
     },
    
});

SpaceSearchFinder = function(dataManager,sceneManager){
    SpaceSearchFinder.superClass.constructor.call(this, dataManager);
    this.sceneManager = sceneManager;
    this.dataManager = this.sceneManager.dataManager;
};

mono.extend(SpaceSearchFinder,it.DataFinder,{

    /**
     * 重写获取数据源的方法,这里返回所有的机柜即可，若是返回当前场景的机柜就更准确了
     */
    getDatas : function(){ 
//        return this.dataManager.getLinks(); // 返回的应该是跟当前场景有关的所有的link，并不是“所有”
        var racks = this.dataManager.getDataMapByCategory('rack');
        var result = [];
        for(var id in racks){
            var rack = racks[id];
            result.push(rack);
        }
        return result;
        // var allLink = this.dataManager.getLinks();
        // if(!allLink || !this.getCurrentRootData()){
        //     return allLink;
        // }
        // var result = [];
        // var box3d = this.sceneManager.network3d.getDataBox();
        // for(var i = 0 ; i < allLink.length ; i++){
        //     var link = allLink[i];
        //     if(link){
        //         var fromNode = this.sceneManager.getNodeByDataOrId(link.getFromId());
        //         if(fromNode && box3d.getDataById(fromNode.getId())){
        //             result.push(link);
        //             continue;
        //         }
        //         var toNode = this.sceneManager.getNodeByDataOrId(link.getToId());
        //         if(toNode && box3d.getDataById(toNode.getId())){
        //             result.push(link);
        //             continue;
        //         }
        //     }
        // }
        // return result;
    },

    getCurrentRootData : function(){
        var rootNode = this.sceneManager.getCurrentRootNode();
        if(!rootNode) return null;
        var rootData = this.sceneManager.getNodeData(rootNode);
        return rootData;
    },

    /**
     * 便于给其他的类型扩展
     * @param id
     * @returns {*}
     */
    getDataById : function(id){
        return this.dataManager.getLinkById(id);
    },

});

AllSpaceSearchPanel = function(){
    it.BasePanel.call(this);
    this.init();
};

mono.extend(AllSpaceSearchPanel,it.BasePanel,{

    init : function(){

        // var sdata = new it.SData('U_ID','input','U数');
        // sdata.setKey('dyna_user_data_maxSerSpace');

        var sdata = new it.SData('allSpaceSearch_data_maxSerSpace','input',it.util.i18n("AllSpaceSearch_Space")); //inputIndex,inputType,label,placeholder
        sdata.setKey('allSpaceSearch_data_maxSerSpace');
        sdata.setIsClient(true);
        sdata.setOperation('>=');
        sdata.setDataType('number');
        // sdata.setStyle('background: url("./css/images/insidesearch.svg") no-repeat scroll right center;background-position-x: 98%;');
        this.addRow(sdata);
        var sdata = new it.SData('power_key_text','input',it.util.i18n("AllSpaceSearch_Electricity")); //inputIndex,inputType,label,placeholder
        sdata.setKey('rest_power_rating');
        sdata.setIsClient(true);
        sdata.setOperation('>=');
        sdata.setDataType('number');
        // sdata.setStyle('background: url("./css/images/insidesearch.svg") no-repeat scroll right center;background-position-x: 98%;');
        this.addRow(sdata);
        var sdata = new it.SData('weight_key_text','input',it.util.i18n("AllSpaceSearch_Bearing")); //inputIndex,inputType,label,placeholder
        sdata.setKey('rest_weight_rating');
        sdata.setIsClient(true);
        sdata.setOperation('>=');
        sdata.setDataType('number');
        // sdata.setStyle('background: url("./css/images/insidesearch.svg") no-repeat scroll right center;background-position-x: 98%;');        
        this.addRow(sdata);
        this.addButtonRow();
    },

    getUNumber : function(){
        return $('#allSpaceSearch_data_maxSerSpace').val();
    }

});

