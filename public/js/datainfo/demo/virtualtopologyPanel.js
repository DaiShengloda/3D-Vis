// 只是展示所用，demo效果级别，需要从info中移值过来

var $VirtualtopologyPanel = function (sceneManager) {
    $BaseServerTab.call(this, sceneManager);
    this.app = {};
    this.mainPane = $('<div></div>');
    this.cpuLoadBox = $('<div class="cpuLoadBox loadBox"></div>');
    this.memLoadBox = $('<div class="memLoadBox loadBox"></div>');
    this.panelLoads = $(' <div class="panel loads"></div>');
    this.panelCup = $('<div class="panel cpus"></div>');
    this.pCupContent = $('<div class="content"></div>');
    //this.init();
};

mono.extend($VirtualtopologyPanel, $BaseServerTab, {

    init: function () {
        // var panelLoadHeader = $('<div class="header">虚拟拓扑</div>');
        // this.panelLoads.append(panelLoadHeader);
        // var plContent = $('<div class="content"></div>');
        // var topo = $('<div style = "position:relative;height:500px" class="topo"></div>');
        // this.panelLoads.append(plContent);
        // this.mainPane.append(this.panelLoads);
        // plContent.append(topo);
        // var btnClose = $('<a class="btnClose" style="float:right;padding-right:10px;cursor:pointer;color:#4d4d4d"></a>')
        // var close = $('<span class="icon iconfont icon-close nav-icon" title="Close"></span>');
        // btnClose.append(close);
        // panelLoadHeader.append(btnClose);
        // //this.resize();
        // this.topo = topo;
        // this.plContent = plContent;

    },

    getTitle: function () {
        return it.util.i18n("VirtualTopology_Title");
    },

    getContentClass: function () {
        return 'topo';
    },

    setData: function (data) {
        // this.virtualtopologyPanel();
    },

    getContentPanel: function () {
        return this.mainPane;
    },

    afterShow: function () {
        this.resize();
    },

    resize: function () {
        this.plContent = $('<div class="content"></div>');
        this.topo = $('<div style = "position:relative;height:500px" class="topo"></div>');
        this.plContent.append(this.topo);
        document.body.append(this.plContent.get(0));
        var self = this;
        var box = new twaver.ElementBox();
        var network = main.cbcnetwork = new twaver.vector.Network(box);

        function initDataBox() {
            var node1 = new twaver.Node();
            node1.setName('ESXI-122.23.23.11');
            node1.setStyle('label.color', '#ffffff');
            node1.setLocation(400, 100);
            node1.setImageUrl("./images/link/tuopu04.svg");
            box.add(node1);


            var node21 = new twaver.Node();
            node21.setName('VM-192.168.1.200');
            node21.setStyle('label.color', '#ffffff');
            node21.setImageUrl("./images/link/tuopu01.svg");
            node21.setLocation(100, 200);
            box.add(node21);

            var node22 = new twaver.Node();
            node22.setName('VM-192.168.1.201');
            node22.setStyle('label.color', '#ffffff');
            node22.setImageUrl("./images/link/tuopu03.svg");
            node22.setLocation(300, 200);
            box.add(node22);

            var node23 = new twaver.Node();
            node23.setName('VM-192.168.1.202');
            node23.setStyle('label.color', '#ffffff');
            node23.setImageUrl("./images/link/tuopu03.svg");
            node23.setLocation(500, 200);
            box.add(node23);

            var node31 = new twaver.Node();
            node31.setName('Storage-192.168.1.100');
            node31.setStyle('label.color', '#ffffff');
            node31.setLocation(100, 300);
            node31.setImageUrl("./images/link/tuopu03.svg");
            box.add(node31);

            var node32 = new twaver.Node();
            node32.setName('Storage-192.168.1.101');
            node32.setStyle('label.color', '#ffffff');
            node32.setLocation(500, 300);
            node32.setImageUrl("./images/link/tuopu02.svg");
            box.add(node32);

            var node4 = new twaver.Node();
            node4.setName('Switch-192.168.1.254');
            node4.setStyle('label.color', '#ffffff');
            node4.setImageUrl("./images/link/tuopu02.svg");
            node4.setLocation(300, 400);
            box.add(node4);

            var childNodes = [node21, node22, node23, node31, node32];
            var parNodes = [node1, node4];
            for (var i = 0; i < parNodes.length; i++) {
                for (var j = 0; j < childNodes.length; j++) {
                    var link = new twaver.Link(parNodes[i], childNodes[j]);
                    link.setStyle('link.width', 1);
                    link.setStyle('link.color', '#7bccff');
                    box.add(link);
                }
            };
            var link1_4 = new twaver.Link(node1, node4);
            link1_4.setStyle('link.width', 1);
            link1_4.setStyle('link.color', '#7bccff');
            box.add(link1_4);
        }

        function initNetwork() {
            // $('#tabs-6 .topo').append(network.getView());
            self.topo.empty();
            self.topo.append(network.getView());
            // network.adjustBounds({ x: 0, y: 0, width: $('#tabs-6 .topo').width(), height: $('#tabs-6 .topo').height() });
            network.adjustBounds({
                x: 30,
                y: 10,
                width: 820,
                height: 545
            });
        }

        function init2D() {
            initNetwork();
            initDataBox();
        }
        //if ($topo.children().length === 0) {
        init2D();
        this.plContent.dialog({
            blackStyle: true,
            resize: false,
            title: it.util.i18n("VirtualTopology_Title"),
            height: 620,
            width: 850,
            closeOnEscape: true,
            show: { effect: 'move&scale', origin: ["middle", "center"], start: '#topo' },
            hide: { effect: 'move&scale', origin: ["middle", "center"], start: '#topo' },
            autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
            resizable: false, //设置是否可拉动弹窗的大小，默认为true
            modal: false, //是否有遮罩模型
        });
        //}
    },

    show: function () {
        var self = this;
        this.resize();
        this.plContent.dialog('open');
        this.plContent.dialog({
            close: function (e) {
                // 1、 e:事件对象
                // 2、 ui:封装对象
                // 3、 this:表示对话框元素
                $(this).remove();
            }
        });
        this.plContent.parent().find('.ui-dialog-titlebar-close').on('click', function (e) {
            main.panelMgr.instanceMap.NavBarMgr.$box.nav('clickNavIcon', 'topo');
        });
    },

    hide: function () {
        if (this.plContent && this.plContent.hasClass("ui-dialog-content")) {
            this.plContent.dialog('close');
        }
    }
});
it.VirtualtopologyPanel = $VirtualtopologyPanel;