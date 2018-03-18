var makeTool = {};

makeTool.add = function (params, success, error) {
    it.util.api('make', 'add', params, success, error)
}

makeTool.update = function (params, success, error) {
    it.util.api('make', 'update', params, success, error)
}

makeTool.remove = function (params, success, error) {
    it.util.api('make', 'remove', params, success, error)
}

makeTool.list = function (params, success, error) {
    it.util.api('make', 'list', params, success, error)
}

makeTool.reload = function (params, success, error) {
    this.list(params, function (models) {
        models.forEach(function (model) {
            if (model.category == it.util.i18n("makeTool_panel_back")) {
                make.Default.copy(model.id + '.panel', 'twaver.idc.background.panel', {
                    imageUrl: makeTool.getImage(model.category, model.imagePath),
                    width: model.width,
                    height: model.height,
                }, {name: model.name, description: model.name, icon: makeTool.getIcon(model.category, model.iconPath)});
            } else if (model.category == it.util.i18n("makeTool_panel_part")) {
                make.Default.copy(model.id + '.panel', 'twaver.idc.component.panel', {
                    imageUrl: makeTool.getImage(model.category, model.imagePath),
                    width: model.width,
                    height: model.height,
                }, {name: model.name, description: model.name, icon: makeTool.getIcon(model.category, model.iconPath)});
            } else {
                console.error(it.util.i18n("makeTool_position_type"), model);
            }
        })
        success && success();
    }, error)
}

makeTool.getIcon = function (category, icon) {
    return make.Default.path + '/' + icon;
}

makeTool.getImage = function (category, image) {
    return make.Default.path + '/' + image;
}