

var $SpaceSearchApp = function(sceneManager, searchPane) {
    $Application.call(this, sceneManager, searchPane);
    this.searchMainDiv = $('<div></div>');
};

mono.extend($SpaceSearchApp, $Application, {

  // 有可能一开始停留在其LookAt机柜上时，
  beforeInit : function(){
      var focusNode = this.sceneManager.viewManager3d.getFocusNode();
      var focusData = this.sceneManager.getNodeData(focusNode);
      var category = this.sceneManager.dataManager.getCategoryForData(focusData);
      if (category 
          && category.getId().toLowerCase() === 'rack' 
           // || category.getId().toLowerCase() === 'equipment' //这可以不用
      ) { 
          var parentNode = this.sceneManager.getNodeByDataOrId(focusData.getParentId());
          this.sceneManager.viewManager3d.setFocusNode(parentNode);
      }
  },
  
  init: function() {
    this.beforeInit();
    var itSpaceSearchPane = this.itSpaceSearchPane = new it.ITSpaceSearchPane(this.sceneManager);
    this.app = new it.SpaceSearchManager(this.sceneManager, itSpaceSearchPane);
    this.app.treeView.isSortById = function() {
      if (dataJson.sortById) {
        return true;
      } else {
        return false;
      }
    }
    this.searchMainDiv.append(this.app.searPanel);
    this.app.getTreeNodeLabel = function(treeData) {
      if (!treeData || !treeData.getId()) {
        return null;
      }
      var label = treeData.getName();
      if (!label) {
        label = treeData.getId();
      }
      return label;
    }

    var self = this;

    this.app.filter = function(data) {
        var category = this.sceneManager.dataManager.getCategoryForData(data);
        if (category && category.getId().toLowerCase() == 'rack' 
          && this.sceneManager.isCurrentSceneInstance(data)) {
           return true;
        }
        return false;
    };
    
    this.app.showNoData = function() {
      layer.open({
        content: '无数据',
      });
    };

    // 在空间可视化时，加上个tooltip
    this.app.setupDoOther = function(sceneManager) {
      sceneManager.viewManager3d.enableMousemove = true;
    };
    this.app.clearDoOther = function(sceneManager) {
      sceneManager.viewManager3d.enableMousemove = false;
    };

    var key1 = it.util.i18n("SpaceSearchApp_Rack_ID");
    var key2 = it.util.i18n("SpaceSearchApp_Rack_name");
    var key3 = it.util.i18n("SpaceSearchApp_U_count");
    var key4 = it.util.i18n("SpaceSearchApp_U_left");

    var param = {
      customerId: "spaceTooltip",
      // propertiesDesc : "机柜编号:id@@机柜名称:name",
      extInfo: {}
    };
    param.extInfo[key1]= function(node) {
      var data = self.getDataBySpaceNode(node);
      if (data) {
        return data.getId();
      }
      return '';
    };
    param.extInfo[key2]= function(node) {
      var data = self.getDataBySpaceNode(node);
      if (data) {
        return data.getName() || data.getDescription() || data.getId();
      }
      return '';
    };
    param.extInfo[key3]= function(node, data) {
      var data = self.getDataBySpaceNode(node);
      if (data) {
        return data.getUserData('dyna_user_data_totalSpace');
      }
      return '';
    };
    param.extInfo[key4]= function(node, data) {
      var data = self.getDataBySpaceNode(node);
      if (data) {
        return data.getUserData('dyna_user_data_totalEmpSpace');
      }
      return '';
    };
    var tooltipRule = new it.TooltipRule(param);
    var tooltipManager = this.sceneManager.viewManager3d.tooltipManager;
    tooltipManager.addTooltipRule(tooltipRule);
    var orgCustomerIdFun = tooltipManager.getCustomerIdByNode;
    this.sceneManager.viewManager3d.tooltipManager.getCustomerIdByNode = function(node) {
      if (node && node.getClient('spaceNode')) {
        return 'spaceTooltip';
      }
      return orgCustomerIdFun.call(tooltipManager, node);
    };

    this.searchPane.show(this.searchMainDiv);
    this.itSpaceSearchPane.setSelectpick(); //需要加到body上后才能调用，只调一次即可，貌似多次调用也无效

    // this.app.setParent(this.searchMainDiv);
    // if (this.searchPane) {
    //   this.searchPane.add(this.searchMainDiv);
    // }

    // this.app.beforeDoClick = function() {
    //    self.beforeDoClick();
    // };

  },

  getDataBySpaceNode: function(node) {
    if (!node) {
      return null;
    }
    var orgNode = null;
    if (node.getClient('spaceNode')) {
      if (node.getClient('modelParent')) {
        orgNode = node.getClient('modelParent');
      } else if (node.getParent() && node.getParent().getClient('modelParent')) {
        orgNode = node.getParent().getClient('modelParent');
      }
    }
    if (orgNode) {
      return this.sceneManager.getNodeData(orgNode);
    } else {
      return this.sceneManager.getNodeData(node);
    }
  },

  isShowSearchInputPanel : function(){
      return true;
  },

  doShow: function() {
    // this.searchPane.show(this.app.searPanel);
    this.searchPane.show(this.searchMainDiv);
    this.app.virtualAllNodes();
    this.app.setupInit();
    if(main.filterMenu){
        main.filterMenu.hideFilterMenu();
    }
    this.showSceneInfo();
    // this.app.show();
  },

  showSceneInfo: function() {
    var scene = this.sceneManager.getCurrentScene();
    if (!scene || (scene.isShowStaticInfo && scene.isShowStaticInfo())) {
      main.sceneInfo.showRackSpaceDataInfo();
    } else {
      main.sceneInfo.hideRoomInfo();
    }
  },

  doClear: function() {
    this.app.clearAll(); // 切换前，先清除
    this.app.clearAllVirtual();
    this.app.clearInit();
    // this.app.hide();
    this.app.beforHide();
  }

});

fa.SpaceSearchApp = $SpaceSearchApp;