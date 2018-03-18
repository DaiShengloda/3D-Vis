

var $USearchApp = function(sceneManager,searchPane){
    $Application.call(this, sceneManager, searchPane);
    this.searchMainDiv = $('<div></div>');
};

mono.extend($USearchApp, $Application, {

    init: function() {
        this.app = new it.USearchManager(this.sceneManager);
        this.searchMainDiv.append(this.app.searPanel);
        if (dataJson.usearchSolidCubeForEmptyNode != undefined 
            && dataJson.usearchSolidCubeForEmptyNode != null) {
            this.app.isCreateEmpNode = function(){
                return dataJson.usearchSolidCubeForEmptyNode;
            }
        }
    },

    isShowSearchInputPanel: function() {
        return true;
    },

    doShow: function() {
        this.searchPane.show(this.searchMainDiv);
        this.app.show();
    },

    doClear: function() {
        this.app.clearAll(); 
        this.app.clear();
    }

});

fa.USearchApp = $USearchApp;


