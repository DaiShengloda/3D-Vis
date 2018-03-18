/**
 *
 * @param sceneManager
 * @param searchPane
 */
var $CustomPanelApp = function (sceneManager) {
    $Application.call(this, sceneManager);
};

mono.extend($CustomPanelApp, $Application, {

    init: function () {
        
    },

    doShow: function () {
        this.appPanel = it.CustomPanelDialog.makeDialog(this.appItemObj);
    },
    
    doClear: function () {
        if(this.appPanel){
            this.appPanel.remove();
            this.appPanel = null;
        }
    },

});

it.CustomPanelApp = $CustomPanelApp;


