/**
 *
 * 镜头动画的菜单栏实现类
 * @param opts
 *  opts.parentID 界面dom元素的容器
 *  opts.sceneManager  场景管理器
 * @constructor
 */
it.CameraMenu = function (parentID,sceneManager) {
    it.ToolBarButton.call(this);
    this.parent = $('#' + parentID || '');
    this.sceneManager = sceneManager || null;
    this.isShow = false;
    this.init();
};

mono.extend(it.CameraMenu, it.ToolBarButton, {
    init: function () {
        var self = this;
        // this.$toggleBtn = $('<div class="toggle-camera-editor"></div>').appendTo(this.parent);
        // this.$toggleBtn.on('click', function () {
        this.button.on('click', function () {
            self.toggleShow();
        })
        this.createContentPanel();
        this.refreshContentPanel();

        this.sceneChangeListener = function(){
			self.refreshContentPanel();
		}
		this.sceneManager.addSceneChangeListener(this.sceneChangeListener);
    },

    getClass : function(){
      return  'toggle-camera-editor';
    },

    getTooltip : function(){
        return it.util.i18n("CameraMenu_Animation_management");
    },

    createContentPanel: function () {

        var self = this;
        this.contentPanel = $('<div class="camera-content it-shadow"></div>').appendTo(this.parent);
        this.ul = $('<ul></ul>').appendTo(this.contentPanel);
        this.ul.on('click', 'a', function () {
            var a = $(this);
            var id = a.data('id');
            if (id == '_more') {
                main.cameraAnimateManager.showList();
            } else if (id == '_help') {
                self.helpIndex = layer.open({
                    type: 1,
                    id:'camera_menu_help',
                    shadeClose: true,
                    title: it.util.i18n("CameraMenu_Animation_description"),
                    skin: 'layui-layer-rim', //加上边框
                    area: ['750px', '380px'], //宽高
                    content: $('.cameraHelp'),
                    btn: [],
                })
            } else if (id) {
                main.cameraAnimateManager.play(id);
            }
            self.hide();
        })

        $('.cameraHelp .moreInfo').on('click', function(){
            layer.close(self.helpIndex);
            main.cameraAnimateManager.showList();
        })
    },

    /**
     * 刷新面板的内容,目前按照方式2显示
     * 方式1:根据当前的rootData判断,显示当前场景的动画
     * 方式2:显示所有动画,如果不在当前场景中,就加载场景
     */
    refreshContentPanel: function () {
        var self = this;

        var params = {};
        var rootNode = this.sceneManager.getCurrentRootNode();
        var rootData = this.sceneManager.getNodeData(rootNode);
        var parentId = null;
        if (rootData) {
            parentId = rootData.getId();
        }
        params.parentId = parentId;
        it.util.api('camera_animate', 'search', params, function (r) {
            self.ul.empty();
            r.forEach(function (item) {
                self.addItem(item);
            })
            self.addItem({name: it.util.i18n("CameraMenu_More"), id: '_more'});
            self.addItem({name: it.util.i18n("CameraMenu_Help"), id: '_help'});
        })
    },

    /**
     * 添加一项, item为CameraAnimate对象
     * @param item {name, description, parentId}
     */
    addItem: function (item) {
        var li = $('<li></li>').appendTo(this.ul);
        var a = $('<a></a>').appendTo(li);
        a.text(item.name);
        a.appendTo(this.ul);
        if (item.id) {
            a.data('id', item.id);
        }
    },

    /**
     * 显示
     */
    show: function () {
        if (this.isShow) {
            return;
        }
        this.contentPanel.show('normal');
        this.isShow = true;
    },

    /**
     * 隐藏
     */
    hide: function () {
        if (!this.isShow) {
            return;
        }
        this.contentPanel.hide('normal');
        this.isShow = false;
    },

    /**
     * 切换隐藏和显示
     */
    toggleShow: function () {
        if (main.cameraAnimateManager.editModel) {
            main.cameraAnimateManager.show();
            return;
        }
        if (!this.isShow) {
            this.show();
        } else {
            this.hide();
        }
    }
});


