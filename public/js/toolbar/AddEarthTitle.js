// 新增的在前端修改标题的功能
// 添加一个备注


var $AddEarthTitle = function (configDialog) {
    $ConfigApp.call(this, configDialog);
};

mono.extend($AddEarthTitle, $ConfigApp, {

    initConfigPanel: function () {
        var box = $('<div class="AddEarthTitleBox" style="margin-top: 15px" id="AddEarthTitleBox"></div>');
        var p1 = $('<h5 style="font-weight: bold;">' + it.util.i18n('earth_setting') + ' : </h5>');
        var p2 = $('<div style="margin-top: 5px;">' + it.util.i18n('modify_earth_title') + '<input style="margin-left:5px; background-color: white; border: 1px solid #DCDCDC" class="AddEarthTitleInput input-min" /></div>');
        box.append(p1);
        box.append(p2);
        var pars = {"where": {"categoryId":"earth"}};
        var self = this;
        it.util.api('datatype','get', pars, function(data) {
            if(data){
                self.oldTitle = data.modelParameters[1].title;
                self.configDialog.append(box);
                $('.AddEarthTitleInput').val(self.oldTitle);
            }
		});
    },

    clickForConfirm: function () {
        var params = {
            options: {},
            value: {}
        };
        params.options.categoryId = 'earth';
        var title = $('.AddEarthTitleInput').val();
        params.value.modelParameters = [{
            id: "twaver.scene.skybox3"
        }, {
            id: 'twaver.scene.earth',
            title: title
        }];
        if (title && title != '') {
            $.post(pageConfig.urlPrex + '/api/datatype/update', params, function (data, textStatus, xhr) { //将数据写入数据库
                if (data.error) {
                    console.log(data.error.message);
                }
                if (main.sceneManager.earthScene) {
                    main.sceneManager.dataManager._dataTypeMap.earth01._modelParameters[1].title = title;  //更新dataManager中的_dataTypeMap   即更新缓存
                    if(main.sceneManager.getCurrentScene()._categoryId == 'earth'){
                        main.sceneManager.network3d.getDataBox().removeByDescendant(main.sceneManager.getNodeByDataOrId('earth01')); //在box中清空之前的地球node
                        main.sceneManager.earthScene.earthObj = null;  //清空地球node之后将标记记为空
                        main.sceneManager.earthScene.refresh();   //重新加载地球
                    }
                }
            });
        }
    },

    show: function () {
        $('#AddEarthTitleBox').show();
    },

    hide: function () {
        $('#AddEarthTitleBox').hide();
    }


});