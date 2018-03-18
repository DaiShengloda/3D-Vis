var $ShowRackNumber = function (sceneManager) {
    this.sceneManager = sceneManager;
    this.dataManager = this.sceneManager.dataManager;
    this.sceneManager.addSceneChangeListener(this.sceneChangeHandler, this);
    this.rackBillboards = {};
    this.args = {
        font: "60px LEDFont,sans-serif",
        labelColor: "white",
        // bgColor: "green",
        width:128
    };
}

mono.extend($ShowRackNumber, Object, {
    sceneChangeHandler: function (e) {
        if (e.kind != 'changeScene') return;
        var racks = this.dataManager.getDataMapByCategory("rack");
        for (var rackId in racks) {
            if (this.sceneManager.isCurrentSceneInstance(rackId) && !this.rackBillboards[rackId]) {
                this.createTextBillboardById(rackId, this.args);
            }
        }
    },
    createTextBillboardById: function (dataId, args) {
        var node = this.sceneManager.dataNodeMap[dataId];
        var board = this.createTextBillboard(dataId || '', args);
        var bb = node.getBoundingBox();
        board.setParent(node);
        board.p(0, bb.max.y, bb.max.z);
        this.sceneManager.network3d.dataBox.add(board);
        this.rackBillboards[dataId] = board;
    },
    createTextBillboard: function (text, args) {
        var c = this.getTextBillboardContent(text, args);
        var board = new mono.Billboard();
        board.s({
            'm.texture.image': c,
            'm.transparent': true,
            'm.alignment': mono.BillboardAlignment.bottomCenter,
            'm.vertical': false,
            'm.texture.wrapS': mono.ClampToEdgeWrapping,
            'm.texture.wrapT': mono.ClampToEdgeWrapping,
            'm.vertical': true
        });
        board.setScale(c.width / 2, c.height / 2, 1);
        board.setSelectable(false);
        board.contentWidth = c.width;
        board.contentHeight = c.height;
        board.isTextBillboard = true;
        return board;
    },
    getTextBillboardContent: function (label, args) {
        args = args || {};
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        context.font = args.font;
        var array = [];
        if (label.indexOf("\n")) {
            array = label.split("\n");
        } else {
            array = [label]
        }
        var length = 0;
        for (var i = 0; i < array.length; i++) {
            if (i == 0) {
                length = context.measureText(array[i]).width;
            } else {
                length = Math.max(context.measureText(array[i]).width, length);
            }
        }
        var size = mono.Utils.getMaxTextSize(array, context.font);
        var c_width = args.width || mono.Utils.nextPowerOfTwo(length);
        var oHeight = size.height;
        var arrowHeight = oHeight / 4;
        var arrowWidth = oHeight / 2;
        var c_height = mono.Utils.nextPowerOfTwo(oHeight + arrowHeight);
        canvas.height = c_height;
        canvas.width = c_width;
        var lineHeight = c_height / array.length;
        var oLineHeight = oHeight / array.length;
        args = it.Util.ext({
            labelColor: args.labelColor || 'white',
            width: c_width,
            height: c_height,
            radius: (c_height / 8),
            arrowWidth: arrowWidth,
            arrowHeight: arrowHeight,
            bgColor: args.bgColor,
            canvas: canvas
        }, args);
        it.Util.getBillboardContent(args);
        context.fillStyle = args.labelColor;
        context.textBaseline = 'middle';
        context.font = args.font;
        for (var i = 0; i < array.length; i++) {
            var text = array[i];
            length = context.measureText(text).width;
            context.fillText(text, (c_width - length) / 2, lineHeight * (i + 0.5));
        }
        return canvas;

    },
    hideAllBillboards: function () {
        for (var p in this.rackBillboards) {
            var b = this.rackBillboards[p];
            b.setParent(null);
            this.sceneManager.network3d.dataBox.remove(b);
        }
    },
    showAllBillboards: function () {
        for (var p in this.rackBillboards) {
            var node = this.sceneManager.getNodeByDataOrId(p);
            var b = this.rackBillboards[p];
            b.setParent(node);
            this.sceneManager.network3d.dataBox.add(b);
        }
    }
});
it.ShowRackNumber = $ShowRackNumber;