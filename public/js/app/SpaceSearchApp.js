

var $SpaceSearchApp = function (sceneManager, searchPane) {
  $Application.call(this, sceneManager, searchPane);
  this.visibleManager = new it.VisibleManager(sceneManager);
  this.sceneManager.viewManager3d.addVisibleFilter(this.visibleManager);
  this.dataManager = this.sceneManager.dataManager;
  this.setup();
};

mono.extend($SpaceSearchApp, $Application, {

  // 有可能一开始停留在其LookAt机柜上时，
  beforeInit: function () {
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

  init: function () {
    var self = this;
    this.dm = this.sceneManager.dataManager;
    this.vm = this.sceneManager.viewManager3d;
    this.de = this.vm.defaultEventHandler;
    this.beforeInit();
    var itSpaceSearchPane = this.itSpaceSearchPane = new it.ITSpaceSearchPane(this.sceneManager);
    this.app = new it.SpaceAvailabilityManager(this.sceneManager, itSpaceSearchPane);
    this.app.getUNumber = function () {
      var result;
      result = parseInt(self.appPanel.SpaceSearchApp('getUCount'));
      if (result > 0) {
        return result;
      } else {
        return 1;
      }
    }
    // 设置空间搜索中最大的U数，默认内置的是47
    var dtMaps = this.sceneManager.dataManager._dataTypeMap;
    for (var dtId in dtMaps) {
      var dt = dtMaps[dtId];
      if (dt.getCategoryId() == 'rack'
        && dt.getChildrenSize()) {
        var uSize = parseInt(dt.getChildrenSize().ySize);
        if (uSize > this.app.maxRackUSize) {
          this.app.maxRackUSize = uSize;
        }
      }
    }
    this.app.treeView.isSortById = function () {
      if (dataJson.sortById) {
        return true;
      } else {
        return false;
      }
    }

    // this.appPanel = $('<div>').addClass('new-app-panel').appendTo($('.new-apps-box'));
    // // $('.view-control').append(this.appPanel);
    // this.appPanel.SpaceSearchApp();
    // this.appPanel.SpaceSearchApp('doHide');
    // this.appPanel.on('click', '.search-it', function () {
    //   self.appPanel.SpaceSearchApp('removeSearchTree');
    //   var conditions = self.appPanel.SpaceSearchApp('getConditions');
    //   self.app.beforeDoClick();
    //   self.setData(conditions);
    //   self.app.sceneManager.viewManager3d.clearVisibleMap();
    // })
    // this.appPanel.on('click', '.clear-it', function () {
    //   self.app.clearSearch();
    // })

    this.app.getTreeNodeLabel = function (treeData) {
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

    this.app.filter = function (data) {
      var category = this.sceneManager.dataManager.getCategoryForData(data);
      if (category && category.getId().toLowerCase() == 'rack'
        && this.sceneManager.isCurrentSceneInstance(data)) {
        return true;
      }
      return false;
    };

    this.app.showNoData = function () {
      layer.open({
        content: it.util.i18n("SpaceSearchApp_No_Data"),
      });
    };

    // 在空间可视化时，加上个tooltip
    this.app.setupDoOther = function (sceneManager) {
      sceneManager.viewManager3d.enableMousemove = true;
    };
    this.app.clearDoOther = function (sceneManager) {
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
    param.extInfo[key1] = function (node) {
      var data = self.getDataBySpaceNode(node);
      if (data) {
        return data.getId();
      }
      return '';
    };
    param.extInfo[key2] = function (node) {
      var data = self.getDataBySpaceNode(node);
      if (data) {
        return data.getName() || data.getDescription() || data.getId();
      }
      return '';
    };
    param.extInfo[key3] = function (node, data) {
      var data = self.getDataBySpaceNode(node);
      if (data) {
        return data.getUserData('dyna_user_data_totalSpace');
      }
      return '';
    };
    param.extInfo[key4] = function (node, data) {
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
    this.sceneManager.viewManager3d.tooltipManager.getCustomerIdByNode = function (node) {
      if (node && node.getClient('spaceNode')) {
        return 'spaceTooltip';
      }
      return orgCustomerIdFun.call(tooltipManager, node);
    };

    // this.searchPane.show(this.searchMainDiv);
    this.itSpaceSearchPane.setSelectpick(); //需要加到body上后才能调用，只调一次即可，貌似多次调用也无效

    // this.app.setParent(this.searchMainDiv);
    // if (this.searchPane) {
    //   this.searchPane.add(this.searchMainDiv);
    // }

    // this.app.beforeDoClick = function() {
    //    self.beforeDoClick();
    // };

    this.app.sceneChangeListener = function (eve) {
      if (eve.data && eve.data.getCategoryId() && eve.data.getCategoryId().toLowerCase() == 'floor') {
        //self.app.showSpaceNode();
      }
    };
    this.sceneManager.viewManager3d.defaultEventHandler.addAfterLookFinishedAtListener(this.afterLookFinishedAtHandler, this);
  },

  afterLookFinishedAtHandler: function (node) {
    var data = this.sceneManager.getNodeData(node);
    var dt = this.sceneManager.dataManager.getDataTypeForData(data);
    var categoryId = dt.getCategoryId();
    if (this.appState && this.app && this.app.diagram) {
      if (categoryId == 'rack') {
        this.app.diagram.hide();
      } else {
        this.app.diagram.show();
      }
    }
  },

  getDataBySpaceNode: function (node) {
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

  setData: function (conditions) {
    var self = this;
    var results = this.app.getResultByConditions(conditions);
    var treeNodes = null;
    this.app.setResult(results);
    if (!results || results.length < 1) {
      this.app.showNoData();
    } else {
      this.appPanel.SpaceSearchApp('createSearchResultTitle');
      var height = it.util.calculateHeight("new-apps-box");
      var option = {
        results: results,
        parent: this.appPanel,
        height: height,
        createLabel:  this.app.createLabel,
        clickTreeNode: function(treeData){
            self.clickTreeNodeHandle(treeData);
        }
      };
      this.app.treeView = this.appPanel.SpaceSearchApp('createSearchTree', option);
      // var self = this;
      // this.app.treeView.clickNodeFunction = function (treeData) {
      //   self.app.clickTreeNode(treeData);
      // };
    }
  },

  createLabel: function (treeData) {
    if (!treeData || !treeData.getId()) {
      return null;
    }
    var id = treeData.getId();
    var data = main.sceneManager.dataManager.getDataById(id);//获取data，将计算的结果保存进去，以免其他地方重复计算
    var content = treeData.getName() ? treeData.getName() : treeData.getId();
    var prex = treeData ? content : '';
    if (!prex) {
      prex = id;
    }
    var count = 0;
    if (data) {
      count = parseInt(data.getUserData('dyna_user_data_empCount'));//空余的“uNumber”U的个数
    }
    if (count) {
      prex += '(' + count + '个)';
    }
    return prex;
  },

  isShowSearchInputPanel: function () {
    return true;
  },

  visibleAllData: function() {
    var self = this;
    this.dataManager.getDatas().forEach(function (data) {
        if (self.isDataShowWeight(data) == 'rack') {
            self.visibleManager.setVisible(data, false);
        } else if (self.isDataShowWeight(data) == 'channel') {
            self.visibleManager.setVisible(data, false);
        } else if (self.isDataShowWeight(data) == 'equipment') {
            self.visibleManager.setVisible(data, false);
        }
    });
  },
  clearVisible: function() {
      this.visibleManager.clear();
  },
  isDataShowWeight: function (data) {
      var self = this;
      var dataType = this.dataManager.getDataTypeForData(data);
      if (dataType) {
          if (dataType.getCategoryId() == 'rack') {
              return 'rack';
          } else if (dataType.getCategoryId() == 'channel') {
              return "channel";
          } else if (dataType.getCategoryId() == 'equipment') {
            return "equipment";
        }
      }
      return false;
  },

  doShow: function () {
    var self = this;
    this.appState = true;
    // if (!this.appPanel) {
    //   layer.msg('没有机柜');
    //   return;
    // };
    // this.appPanel.SpaceSearchApp('doShow');
    // this.appPanel.SpaceSearchApp('setHeight');
    this.appPanel = $('<div>').addClass('new-app-panel').appendTo($('.new-apps-box'));
    this.appPanel.SpaceSearchApp();
    this.appPanel.on('click', '.search-it', function () {
      self.appPanel.SpaceSearchApp('removeSearchTree');
      var conditions = self.appPanel.SpaceSearchApp('getConditions');
      self.app.beforeDoClick();
      self.setData(conditions);
      self.app.sceneManager.viewManager3d.clearVisibleMap();
    })
    this.appPanel.on('click', '.clear-it', function () {
      // self.app.clearSearch();
      self.appPanel.SpaceSearchApp('refreshAll');
    })
    this.app.virtualAllNodes();
    this.app.setupInit();
    if (main.filterMenu) {
      main.filterMenu.hideFilterMenu();
    }
    this.showSceneInfo();
    if (!this.app.diagram) {
      layer.msg('没有机柜');
      return;
    };
    this.app.diagram.show();
    this.visibleAllData();
    //this.app.show();
  },

  showSceneInfo: function () {
    var scene = this.sceneManager.getCurrentScene();
    if (!scene || (scene.isShowStaticInfo && scene.isShowStaticInfo())) {
      main.sceneInfo.showRackSpaceDataInfo();
    } else {
      main.sceneInfo.hideRoomInfo();
    }
  },
  doClear: function () {
    this.appState = false;
    if (!this.app) {
      layer.msg('没有机柜');
      return;
    };
    this.sceneManager.viewManager3d.tooltipManager.hideToolTipDiv();
    // this.app.clearAll(); // 切换前，先清除
    this.clearAll(); // 切换前，先清除
    this.app.clearAllVirtual();
    this.app.clearInit();
    // this.appPanel.SpaceSearchApp('hideTreeBox');
    this.appPanel.SpaceSearchApp('destory');
    this.app.beforHide();
    this.clearVisible();
  },

  ifCloseWhenFocusChange: function (node, oldNode) {
    var data = this.sceneManager.getNodeData(node);
    var dt = this.sceneManager.dataManager.getDataTypeForData(data);
    var categoryId = dt.getCategoryId();
    var categoryIds = ['rack', 'channel', 'area', 'room', 'floor'];
    for (var i = 0; i < categoryIds.length; i++) {
      if (categoryId == categoryIds[i]) {
        return false;
      }
    }
    return true;
  },
  //重写gotoDefaultAppWhenSceneChange函数
  gotoDefaultAppWhenSceneChange: function (event) {
   
  },
  clickTreeNodeHandle: function(treeData){
    var dataId = treeData.id;
    var data = this.dm.getDataById(dataId);
    if (data) {
        this.de.lookAtByData(data);
    }
    
  },
  clearAll: function(){
    if(this.app.inputPane.clearInput){
        this.app.inputPane.clearInput();
    }
    // this.removeVirtualManager();
    if(this.app.clearAllFunction){
        this.app.clearAllFunction();
    }else{
        this.app.clearSearchData();
    }
  }
});

fa.SpaceSearchApp = $SpaceSearchApp;