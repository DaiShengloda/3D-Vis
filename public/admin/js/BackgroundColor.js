var $BackgroundColor = function(configDialog) {
    $ConfigApp.call(this, configDialog);
    this.bgImgMap = {};
    this.defaultValue = {
        'earth': null,
        'dataCenter': 'images/bg_network5.png',
        'floor': 'images/bg_network5.png'
    };
};

mono.extend($BackgroundColor, Object, {

    initConfigPanel: function() {
        this.bg = this.createSection('bgColor','背景颜色').appendTo(this.configDialog);
        this.setData();
    },

    createSection: function(id,name) {
        var div = $('<div id = "' + id + '"></div>');
        var title = $('<h5 style="font-weight:bold">' + name + '</h5>').appendTo(div);
        this.createRow('earth','地球',div);
        this.createRow('dataCenter','园区',div);
        this.createRow('floor','楼层',div);
        return div;
    },

    createRow: function(id,name,parent) {
        var div = $('<div></div>');
        var title = $('<span>' + name +'</span>').appendTo(div);
        var select = this.createSelect(id).appendTo(div);
        div.appendTo(parent);
    },

    createSelect: function(id) {
        var select = $('<select id = "' + id + '"></select>');
        var option = $('<option value="images/bg_network3.jpg">' + it.util.i18n("dark_blue") + '</option>');
        select.append(option);
        option = $('<option value="images/bg_network5.png">' + it.util.i18n("light_grey") + '</option>');
        select.append(option);
        option = $('<option value="images/bg_network7.jpg">' + it.util.i18n("ink_blue") + '</option>');
        select.append(option);
        option = $('<option value="images/bg_network3.png">' + it.util.i18n("classic_black") + '</option>');
        select.append(option);
        option = $('<option value="images/bg_network2.jpg">' + it.util.i18n("sky_blue") + '</option>');
        select.append(option);
        return select;
    },

    clickForConfirm: function() {
        var self = this;
        var sceneMap = this.bgImgMap 
        for(var scene in sceneMap) {
            sceneMap[scene] = self.bg.find('#' + scene).val();
        };
        this.updateData(sceneMap);                                                                                                                            
    },

    clickForSetDefaultValue: function() {
        var self = this;
        var sceneMap = this.defaultValue
         for(var scene in sceneMap) {
            self.bg.find('#' + scene).val(sceneMap[scene]);
        };
        this.updateData(sceneMap); 
    },

    setData: function() {
        var self = this;
        it.util.adminApi('scene', 'find', {}, function(result){
            result.forEach(function(scene) {
                var backgroundImage = scene.networkParameters.backgroundImage ? scene.networkParameters.backgroundImage : null,
                    category = scene.categoryId;
                self.bg.find('#' + category).val(backgroundImage);
                self.bgImgMap[category] = backgroundImage;
            });
        });
    },

    updateData: function(sceneMap) {
        var self = this;
        for(var scene in sceneMap) (function(curScene){
            it.util.adminApi('scene','get',{id: curScene},function(result){
                result.networkParameters.backgroundImage = sceneMap[curScene];
                it.util.adminApi('scene','update',result)
            }); 
        })(scene);
    },

    isConfirm: function() {
        return true;
    },

    getId: function() {
        return 'backgroundColor';
    },

});

it.BackgroundColor = $BackgroundColor;