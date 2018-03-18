var $BackgroundColor = function(sceneManager) {
    it.ToolBarButton.call(this);
    this.sceneManager = sceneManager;
    this.mainPane = $('<div style="position: relative;float: left;"></div>');
    this.from = $('<from></from>');
    this.from.hide();
    this.backgroundImage = null;
    this.init();
};

mono.extend($BackgroundColor, it.ToolBarButton, {

    init: function() {
        var self = this;
        var input = this.createFrom();
        this.from.append(input);
        this.mainPane.append(this.from);
        this.mainPane.append(this.button);

        this.button.click(function(e) {
            self.from.toggle('normal');
        });
        this.from.find('input').click(function(e){
            var curScene = self.sceneManager.getCurrentScene().getId();
            var target = e.target;
            var path = target.getAttribute('path'); 
            localStorage[curScene + 'backgroundImage'] = '/images/'+path;
            self.backgroundImage = '/images/'+path;
            it.util.api('scene','get',{id: curScene},function(scene){
                scene.networkParameters.backgroundImage = self.backgroundImage;
                it.util.api('scene','update',scene)
            });          
            main.sceneManager.viewManager3d.setNetworkValue('backgroundImage',pageConfig.url(self.backgroundImage));                                                                                                                                     
        });
        this.sceneManager.addSceneChangeListener(function(e) {
            var curScene = e.data.getId();
            if (localStorage[curScene + 'backgroundImage']){
                self.backgroundImage = localStorage[curScene + 'backgroundImage'];
            } else{
                self.backgroundImage  = main.sceneManager.dataManager._sceneMap[curScene].networkParameters.backgroundImage;
            } 
            if (self.backgroundImage){
                main.sceneManager.viewManager3d.setNetworkValue('backgroundImage',self.backgroundImage);
            } 
        });
        this.from.css({
            'background-color': '#d9d9d9',
            'position': 'absolute',
            'width': '100px',
            'left': '30px',
            'top': '30px',
            'padding-left': '8px',
            'border-radius': '5px',
        });
    },

    getClass: function() {
        return 'background-color-image';
    },

    getTooltip: function() {
        return it.util.i18n('change_background_color');
    },

    getButton: function() {
        return this.mainPane;
    },

    createFrom: function() {
        var input = $('<input type="radio" name="color" value="gray" path="bg_network5.png">'+it.util.i18n('light_grey')+'<br>' +
            '<input type="radio" name="color" value="inkBlue" path="bg_network7.jpg">'+it.util.i18n('ink_blue')+'<br>' +
            '<input type="radio" name="color" value="black" path="bg_network3.png">'+it.util.i18n('classic_black')+'<br>' +
            '<input type="radio" name="color" value="skyBlue" path="bg_network2.jpg">'+it.util.i18n('sky_blue')+'<br>' +
            '<input type="radio" name="color" value="blue" path="bg_network3.jpg">'+it.util.i18n('default_setting')+'<br>'
        );
        return input;
    }

});

it.BackgroundColor = $BackgroundColor;