var tools = {

    //baseUrl: 'http://idc.servasoft.com:9999',
    baseUrl: 'http://127.0.0.1:9999',

    registerPanel: function (nameArg, dataArg) {

        register(nameArg, dataArg);

        function register(name, data) {
            make.Default.register(name, function (json) {

                return data;
            }, {
                icon: 'model/idc/icons/' + name + '.png',
                name: name,
                category: '设备面板',
            })
        }
    },

    registerPanelComp: function (nameArg, dataArg) {

        register(nameArg, dataArg);
        function register(name, data) {
            make.Default.register(name, function (json) {

                json = json || {};
                json.centerLocation = json.centerLocation || {x: 0, y: 0};

                data.forEach(function (d) {
                    d.x += json.centerLocation.x;
                    d.y += json.centerLocation.y;
                    d.objectId = _twaver.id();
                });
                return make.Default.load(data);
            }, {
                icon: 'model/idc/icons/' + name.replace('.panel', '') + '.png',
                name: name.replace('.panel', ''),
                category: '面板部件',
            })
        }
    },

    registerModel: function (categoryArg, nameArg, dataArg, iconArg) {

        register(categoryArg, nameArg, dataArg, iconArg);

        function register(category, name, data, icon) {
            //console.log(category, name, data, icon);
            if (icon) {
                icon = 'model/idc/icons/' + icon + '.png';
            }
            var params = {}
            make.Default.copyProperties(make.Default.getParameters(data.id), params);

            var label = name;
            label = label.replace(doodle.consts.MODEL_SUFFIX_SEPARATOR + doodle.consts.RACK_MODEL_SUFFIX, '');
            label = label.replace(doodle.consts.MODEL_SUFFIX_SEPARATOR + doodle.consts.DEVICE_MODEL_SUFFIX, '');
            label = label.replace(doodle.consts.MODEL_SUFFIX_SEPARATOR + doodle.consts.SCENE_MODEL_SUFFIX, '');
            params.icon = icon || params.icon;
            params.name = label;
            params.category = category;
            make.Default.register(name, function (json) {
                console.log(category, name, data, icon);
                var newData = {};
                newData.objectId = _twaver.id();
                make.Default.copyProperties(data, newData);
                make.Default.copyProperties(json, newData);
                return make.Default.load(newData);
            }, params)
        }
    },

    registerDevicePatten: function (nameArg, dataArg) {

        register(nameArg, dataArg);
        function register(name, data) {

            make.Default.register(name, function (json) {

                return data;
            }, {
                icon: 'model/idc/icons/' + name + '.png',
                name: name,
                category: '设备模板',
            })
        }
    },

    registerRackPatten: function (nameArg, dataArg, parentArg) {

        register(nameArg, dataArg, parentArg);
        function register(name, data, parent) {

            make.Default.register(name, function (json) {

                return {parent: parent, data: data};
            }, {
                icon: 'model/idc/icons/' + name + '.png',
                name: name,
                category: '机柜模板',
            })
        }
    },

    updateOrInsertModel: function (className, name, data, icon, callback) {

        if (arguments.length == 4 && icon instanceof Function) {
            callback = icon;
            icon = null;
        }
        var where = {name: name};
        var update = {data: data, icon: icon}
        proxy.updateOrInsert(where, update, className, callback);
    },


    init: function (callback) {

        var self = this;
        var className = 'Model';
        var where = {}
        proxy.query(where, className, function (array) {
            if (array) {
                for (var i = 0; i < array.length; i++) {
                    var info = array[i];
                    var models = info.models;
                    var category = info.category;
                    if (category == '面板部件') {
                        for (var name in models) {
                            self.registerPanel(name, models[name]);
                        }
                    } else if (category == '设备面板') {
                        make.Default.register(name, function (json) {

                            return make.Default.load(data);
                        }, {
                            name: name,
                            category: '设备面板',
                        })
                    } else {
                        for (var name in models) {
                            self.registerModel(category, name, models[name]);
                        }
                    }

                }
            }
            callback && callback();
        });

    },
    //exportImage: function (name, canvas) {
    //    canvas.toBlob(function (blob) {
    //
    //        name = name + '.png';
    //        var where = {category: '设备'};
    //        var update = {images: {}};
    //        update.images[name] = name;
    //        proxy.updateOrInsert(where, update, 'ImageResourcesForEdit');
    //        saveAs(blob, name);
    //    });
    //    //this.uploadImage({
    //    //    filePath: path,// || './../../doodle/make/model/idc/images/',
    //    //    fileName: name,
    //    //    content: result.content.toDataURL(),
    //    //});
    //},
    uploadImage: function (fileName, folder, content, callback) {

        folder = folder || 'images'
        var filePath = './../doodle/make/model/idc/' + folder + '/';
        var data = {
            fileName: fileName,
            filePath: filePath,
            content: content
        }
        $.ajax({
            //url: 'http://idc.servasoft.com:9999/upload',
            url: tools.baseUrl + '/image/upload',
            contentType: 'application/json',
            method: 'post',
            data: JSON.stringify(data),
            success: function (r) {
                console.log(JSON.stringify(r))
                callback && callback();
            },
            error: function (a, b, c) {
                console.error(a, b, c)
                alert(a.responseText);
            }
        });
    },
}