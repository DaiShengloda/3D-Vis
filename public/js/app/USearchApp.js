

var $USearchApp = function(sceneManager,searchPane){
    $Application.call(this, sceneManager, searchPane);
};

mono.extend($USearchApp, $Application, {

    init: function() {
        this.app = new it.USearchManager(this.sceneManager);
        if (dataJson.usearchSolidCubeForEmptyNode != undefined 
            && dataJson.usearchSolidCubeForEmptyNode != null) {
            this.app.isCreateEmpNode = function(){
                return dataJson.usearchSolidCubeForEmptyNode;
            }
        }
    },

    setData: function(conditions){
		var results = this.app.getResultByConditions(conditions);
        var treeNodes = null;
        if (!results || results.length < 1) {
			this.app.showNoData();
		}else{
            this.appPanel.USearchApp('createSearchResultTitle');
            var height = it.util.calculateHeight("new-apps-box");
            var option = {
                results: results,
                parent: this.appPanel,
                height: height,
                createLabel: this.app.createLabel,
            };
			treeNodes = this.app.orgTreeManager.organizeTree(results);
			this.appPanel.USearchApp('createSearchTree', option);
        }
		this.app.setResult(results,treeNodes);
    },
    
    createLabel: function(treeData) {
        if (!treeData) {
            return orgLabel(treeData);
        }
        var label = treeData.getName();
        if (label) {
            // label += "(" + treeData.getId() + ")";
        } else {
            label = treeData.getId();
        }
        return label;
    },

    isShowSearchInputPanel: function() {
        return true;
    },

    doShow: function() {
        // this.appPanel.USearchApp('doShow');
        // this.appPanel.USearchApp('setHeight');
        this.appPanel = $('<div>').addClass('new-app-panel').appendTo($('.new-apps-box'));
        this.appPanel.USearchApp();
        var self = this;
        this.appPanel.on('click', '.search-it', function(){
            self.appPanel.USearchApp('removeSearchTree');
            var conditions = self.appPanel.USearchApp('getConditions');
            self.app.beforeDoClick();
            self.setData(conditions);
            self.app.sceneManager.viewManager3d.clearVisibleMap();
        })
        this.appPanel.on('click', '.clear-it', function(){
            self.appPanel.USearchApp('refreshAll');
            self.app.clearSearchData();
        })
        // this.app.show();
    },

    doClear: function() {
        this.appPanel.USearchApp('destory');
        this.app.clearSearchData();
    }

});

fa.USearchApp = $USearchApp;


