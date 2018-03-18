

it.ITSearchManager = function (sceneManager) {
    this.sceneManager = sceneManager;
	this.virtualManager = new it.VirtualManager(sceneManager);
    this.sceneManager.viewManager3d.addMaterialFilter(this.virtualManager);
    this._assetImage = "data:image/png;base64,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";
    this._assetImage = main.systemConfig.asset_manage_image || this._assetImage;

    //场景切换时清除掉虚化
    this.defaultEventHandler = this.sceneManager.viewManager3d.getDefaultEventHandler();
    this.init();
};

mono.extend(it.ITSearchManager, Object, {
    init: function () {
        var self = this;
        this.sceneManager.addSceneChangeListener(function () {
            self.clearBillboard();
        })
    },

    clearBillboard: function () {
        if (this.sceneManager.dataNodeMap) {
            for (var id in this.sceneManager.dataNodeMap) {
                var node = this.sceneManager.dataNodeMap[id];
                if (node && node.getClient('asset_billboard')) {
                    var billboard = node.getClient('asset_billboard');
                    billboard.setParent(null);
                    this.sceneManager.network3d.getDataBox().remove(billboard);
                }
            }
        }
        this.virtualManager.clearAll();
    },
    showBillboard: function (data) {
        if (!data) return false;
        var assetType = this.sceneManager.dataManager.getCategoryForData(data).getId();
        if (assetType) {
            if (assetType.indexOf('room') >= 0) {
                return false;
            }
            if (assetType.indexOf('floor') >= 0) {
                return false;
            }
        }
        return true;
    },
    addDataBillBoard: function (data) {
        if (!data) return;
        var node = this.sceneManager.dataNodeMap[data.getId()];
        var cateId = this.sceneManager.dataManager.getCategoryForData(data).getId();
        if (!node) return;
        var box = this.sceneManager.network3d.getDataBox();
        if (!box.getDataById(node.getId())) {
            return;
        }
        var billboard = new mono.Billboard();
        //这里设置高度的时候做个判断，如果冒泡的为机柜，则给它设置为其父元素（通道）的高度
        var parentData = this.sceneManager.dataManager.getParent(data);
        billboard.setPosition(0, node.getBoundingBox().max.y + 20, 0);
        if (parentData) {
            var parentCateId = this.sceneManager.dataManager.getCategoryForData(parentData).getId();
            if (parentCateId == 'channel') {
                if (cateId.toLowerCase() == 'rack' || cateId.toLowerCase() == 'headerrack') {
                    var parentNode = this.sceneManager.getNodeByDataOrId(parentData);
                    if (parentNode) {
                        billboard.setPosition(0, parentNode.getBoundingBox().max.y + 20, 0);
                    }
                }
            }
        }
        billboard.setStyle('m.alignment', mono.BillboardAlignment.bottomCenter);
        billboard.setStyle('m.transparent', true);
        //        billboard.setStyle('m.texture.image', TML.Factory3D.getImagePath('asset.png'));
        billboard.setStyle('m.texture.image', this._assetImage);
        billboard.setStyle('m.alignment', mono.BillboardAlignment.bottomCenter);
        // billboard.setStyle('m.vertical', true);
        billboard.setScale(40, 50, 1);
        billboard.setParent(node);
        billboard.setClient('it_data', data);
        box.add(billboard);
        node.setClient('asset_billboard', billboard);
    },
    
});

