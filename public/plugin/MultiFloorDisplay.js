
var $MultiFloorDisplay = function () {
    var $box = this.$box = $('<div></div>').on('dblclick', function (e) {
        e.stopPropagation();
    }).appendTo(document.body);
    this.$box.displayFloors();
    this.rewriteDoubleClick();
    this.rewriteIsLoadChild();
};

mono.extend($MultiFloorDisplay, Object, {
    rewriteDoubleClick: function () {
        //这里重写了main.sceneManager.viewManager3d.defaultEventHandler.handleDoubleClickElement方法，
        //如果在navbar里配置了需要展示多楼层且在scene里new MultiFloorDisplay，那么在doubleclick的时候直接将双击building操作拦下执行下列操作
        var oldHandleDoubleClickElement = main.sceneManager.viewManager3d.defaultEventHandler.handleDoubleClickElement;
        main.sceneManager.viewManager3d.defaultEventHandler.handleDoubleClickElement = function (node, network, data, clickedObj) {

            main.sceneManager.adapterManager.deregister(main.sceneManager.adapterManager.buildAndFloorAdaper);

            var dataType = data.getDataTypeId();
            var category = main.sceneManager.dataManager.getCategoryForDataType(dataType);
            var categoryId = category.getId();
            var floors = [];

            if (categoryId.toLowerCase() == 'building') {
                var children = data.getChildren();
                if (!children || children.size() < 1) {
                    return;
                }
                var buildingName = data._name;
                main.plugin.multiFloorDisplay.$box.displayFloors('option', 'building', buildingName);

                if (children && children.size() > 0) {
                    for (var i = 0; i < children.size(); i++) {
                        var child = children.get(i);
                        var childCategory = main.sceneManager.dataManager.getCategoryForData(child);
                        if (childCategory && childCategory.getId() && childCategory.getId().toLowerCase().indexOf('floor') >= 0) {
                            floors.push(child);
                        }
                    }
                    main.plugin.multiFloorDisplay.$box.displayFloors('option', 'floors', floors);
                    main.plugin.multiFloorDisplay.$box.displayFloors('show');
                }
            } else {
                return oldHandleDoubleClickElement.call(main.sceneManager.viewManager3d.defaultEventHandler, node, network, data, clickedObj);
            }
        }
    },
    rewriteIsLoadChild: function () {
        main.sceneManager.isLoadChild = function (data, child, sceneType, level) {
            if (main.sceneManager.dataManager.getCategoryForData(child).getId() == 'floor') {
                return false
            } else {
                return true;
            }
        }
    }
});

it.MultiFloorDisplay = $MultiFloorDisplay;


//这里是

$.widget("hub.displayFloors", {
    options: {
        building: '5号楼',
        floors: ['B1', 'B2',
            '1F', '2F', '3F', '4F',
            '5F', '6F', '7F', '8F',
            '9F', '10F', '11F', '12F',
            '13F', '14F', '15F', '16F',
            '17F', '18F', '19F', '20F']
    },

    _create: function () {
        var $displsyFloors = this.displayFloors = $('<div>').addClass('display-floors').appendTo(this.element).hide();
        var $closeBtn = this.closeBtn = $('<span>').addClass('display-floors-close').appendTo($displsyFloors);
        var $displsyFloorsBox = this.displayFloorsBox = $('<div>').addClass('display-floors-box').appendTo(this.displayFloors);
        this._createFloors();

        $closeBtn.on('click', function () {
            $displsyFloors.hide();
        })
    },

    _createFloors: function () {
        var self = this;
        this.displayFloorsBox.remove();
        var $displsyFloorsBox = this.displayFloorsBox = $('<div>').addClass('display-floors-box').appendTo(this.displayFloors);

        var title = $('<div>').text(this.options.building).addClass('display-floors-box-title').appendTo(this.displayFloorsBox);
        var items = $('<div>').addClass('display-floors-box-items').appendTo(this.displayFloorsBox);
        var arrs = this.options.floors.reverse();
        var newArrs = [], arr = [];
        for (var i = 0; i < arrs.length; i++) {
            if (i % 4 == 0 && arr.length != 0) {
                newArrs.push(arr);
                arr = [];
            }
            arr.push(arrs[i]);
        }
        newArrs.push(arr);
        var finalArr = [];
        newArrs.forEach(function (c) {
            finalArr = finalArr.concat(c.reverse());
        })
        finalArr.forEach(function (c) {
            var floor = $('<span>').text(c._name).addClass('display-floors-box-item').on('click', function (e) {
                e.stopPropagation();
                // $('#spinner').css('display', 'block');
                // main.sceneManager.viewManager3d.defaultEventHandler.lookAtByData(c);
                var s = main.sceneManager.getSceneAndRootByData(c);
                main.sceneManager.gotoScene(s.scene, s.rootData);
                // main.sceneManager.viewManager3d.getDefaultEventHandler().clearCameraInfo();
                // main.navBarManager.appManager.reset(true, true);
                setTimeout(function () {
                    self.displayFloors.hide();
                }, 600);
            }).on('dblclick', function (e) {
                e.stopPropagation();
            }).appendTo(items);
        })
    },
    refresh: function () {
        this._createFloors();
    },
    show: function () {
        this.displayFloors.show();
    },
    _destroy: function () {
        this.displayFloors.remove();
    },
    _setOption: function (key, value) {
        this._super(key, value);
        this.refresh();
    }
})
