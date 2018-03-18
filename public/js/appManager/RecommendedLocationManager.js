var $RecommendedLocationManager = function (sceneManager, application) {
    it.UPreOccupiedManager.call(this, sceneManager, application);
};

mono.extend($RecommendedLocationManager, it.UPreOccupiedManager, {

    init: function () {
        var self = this;
        this.colorCubes = {};
        this.currentRackId = null;

        this.surfaceColor = '#52b2e8';
        this.lineColor = '#fff';
        this.surfaceOpacity = 0.9;

        this.rootView = this.network.getRootView();
        this.userEventHandlerBox = {
            'dblclick': {
                element: this.rootView,
                event: 'dblclick',
                funcName: 'handleDoubleClick',
            },
        }
        it.util.augment(it.RecommendedLocationManager, it.dealUserEventHandler);
        
    },

    makeDeviceColorCubes: function (data) {
        if (this.currentRackId) {
            this.removeDeviceColorCubes();
        }
        var rackNode = this.sceneManager.getNodeByDataOrId(data);
        var dataType = this.dm.getDataTypeForData(data);
        // console.log('makeDeviceColorCubes', data);
        var emptyList = data.getUserData('UPreOccupied_emptyList');
        var preOccupiedList = data.getUserData('UPreOccupied_preOccupiedList');

        this.currentRackData = data;
        this.currentRackId = data._id;
        this.rackColorCubes.parentNode = rackNode;
        this.rackColorCubes.wrapPop = {};
        this.rackColorCubes.inPop = {};

        var bb = rackNode.getBoundingBox();
        var childSize = dataType._childrenSize,
            ySize = childSize.ySize,
            xPadding = childSize.getXPadding() || [0, 0],
            yPadding = childSize.getYPadding() || [0, 0],
            zPadding = childSize.getZPadding() || [0, 0];
        // 注意这里的ZPadding为两个负值
        var size = {
            width: (rackNode.width || (bb.max.x - bb.min.x)) - (childSize.getXPadding()[0] + childSize.getXPadding()[1]),
            height: (rackNode.height || (bb.max.y - bb.min.y)) - (childSize.getYPadding()[0] + childSize.getYPadding()[1]),
            depth: (rackNode.depth || (bb.max.z - bb.min.z)) + (childSize.getZPadding()[0] + childSize.getZPadding()[1]),
        }

        this.wrapPopCommonParams = {
            width: size.width,
            height: size.height,
            depth: size.depth,
            childSize: childSize,
            bgColor: '#3a647f',
            borderColor: '#0468ae',
            lineColor: '#0084e8',
            textColor: '#fff',
            uOrder: dataType._modelParameters&&dataType._modelParameters.uOrder,
        }

        // 创建单个的pop
        for (var i = 0; i < emptyList.length; i++) {
            var empty = emptyList[i];
            if (empty.total >= this.application.uHeight) {
                var obj = {
                    start: empty.start,
                    end: empty.end - this.application.uHeight + 1,
                    total: empty.end - empty.start - this.application.uHeight + 2,
                }
                this.makeDeviceColorWrapPop(obj);
            }
        }
    },

});

it.RecommendedLocationManager = $RecommendedLocationManager;