var $AddEarthTitle = function (configDialog) {
    $ConfigApp.call(this, configDialog);
    this.defaultValue = it.util.i18n('EarthScene_Title');
};

mono.extend($AddEarthTitle, $ConfigApp, {

    initConfigPanel: function () {
        this.box = $('<div class="AddEarthTitleBox" style="margin-top: 15px" id="AddEarthTitleBox"></div>');
        var p1 = $('<h5 style="font-weight: bold;">' + it.util.i18n('earth_setting') + ' : </h5>');
        var p2 = $('<div style="margin-top: 5px;">' + it.util.i18n('modify_earth_title') + '<input style="margin-left:5px; background-color: white; border: 1px solid #DCDCDC" class="AddEarthTitleInput input-min" /></div>');
        this.box.append(p1);
        this.box.append(p2);
        this.setData();
    },

    clickForConfirm: function () {
        var earthTitle = $('.AddEarthTitleInput').val();
        this.updateData(earthTitle);
    },

    clickForSetDefaultValue: function() {
        $('.AddEarthTitleInput').val(this.defaultValue);
        this.updateData(this.defaultValue);
    },

    setData: function() {
        var self = this;
        it.util.adminApi('datatype','get', {"where": {"categoryId":"earth"}}, function(data) {
            if(data){
                self.oldTitle = data.modelParameters[1].title;
                self.configDialog.append(self.box);
                $('.AddEarthTitleInput').val(self.oldTitle);
            }
		});
    },

    updateData: function(earthTitle) {
         it.util.adminApi('datatype', 'get', {"where": {"categoryId":"earth"}}, function(result) {
            var modelParameters = result.modelParameters;
            var earthProp = modelParameters[1];
            earthProp.title = earthTitle;
            it.util.adminApi('datatype', 'update', result);
         });
    },

    isConfirm: function() {
        return true;
    },

    getId: function() {
        return 'earthTitle';
    },


});