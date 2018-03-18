fa = {};
var $About = function (sceneManager) {
    this.sceneManager = sceneManager;

};

mono.extend($About, Object, {
    init: function () {
        this.initView();
    },

    initView: function () {
        var self = this;
        this._dialog = $('<div></div>').appendTo($(document.body));
        var ul = this.ul = $('<ul>').appendTo(this._dialog);
        var div1 = this.div1 = $('<div>').appendTo(ul);
        var div2 = this.div2 = $('<div>').appendTo(ul);
        this._dialog.dialog({ //创建dialog弹窗
            blackStyle: true,
            width: '704px',
            height: 'auto',
            title: '关于我们',
            autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
            show: '', //显示弹窗出现的效果，slide为滑动效果
            hide: '', //显示窗口消失的效果，explode为爆炸效果
            resizable: false, //设置是否可拉动弹窗的大小，默认为true
            modal: true,
        });

        $(document).on('keydown', function () {
            var oEvent = window.event;
            if (oEvent.keyCode == 86 && oEvent.shiftKey) {
                self.loadInfo();
            }
        })
    },
    addItems: function (options, box) {

        for (var p in options) {
            var li = $('<li>').appendTo(box);
            var span1 = $('<span>').css({
                'display': 'inline-block',
                'width': '20%',
                'float': 'left'
            }).text(p + ':').appendTo(li);
            var span2 = $('<span>').css({
                'display': 'inline-block',
                'width': '80%',
                'float': 'left'
            }).text(options[p]).appendTo(li);
        }
    },
    loadInfo: function () {
        var self = this;
        this.div1.empty();
        this.div2.empty();

        $.ajax({
            type: "post",
            contentType: 'application/json; charset=UTF-8',
            url: 'api/general/getMacAddr',
            success: function (result) {
                var options = {};
                options['版本号'] = main.version;
                options['机柜总数'] = self.getRackCount();
                options['设备总数'] = self.getEquipmentCount();
                options['硬件地址'] = '';
                if (result.value) {
                    result.value.forEach(function (c, index) {
                        if (index !== 0)
                            options['硬件地址'] += ' / ';
                        options['硬件地址'] += c;
                    })
                }
                self.addItems(options, self.div1);

            },
            error: function () {
                console.error('获取硬件信息失败！');
            },
        })

        $.ajax({
            type: "post",
            contentType: 'application/json; charset=UTF-8',
            url: '/api/general/li',
            success: function (result) {
                var options = {};
                var arrays = result.value.split('\n');
                arrays.forEach(function (c) {
                    var lv = c.split('=');
                    if (lv[0] == 'l') return
                    if (lv[0] == 'type') {
                        lv[0] = '类型';
                        switch (lv[1]) {
                            case '1':
                                lv[1] = '试用版';
                                break;
                            case '2':
                                lv[1] = '开发版';
                                break;
                            case '3':
                                lv[1] = '运行版';
                                break;
                        }
                    }
                    if (lv[0] == 'gis') {
                        lv[0] = '是否支持gis功能';
                        lv[1] = lv[1] != 0 ? '是' : '否';
                    }
                    if (lv[0] == '3d') {
                        lv[0] = '是否支持3d功能';
                        lv[1] = lv[1] != 0 ? '是' : '否';
                    }
                    if (lv[0] == 'start') lv[0] = '开始时间';
                    if (lv[0] == 'end') lv[0] = '到期时间';
                    if (lv[0] == 'note') lv[0] = '说明';
                    if (lv[0] == 'signature') return;
                    options[lv[0]] = lv[1];
                })
                self.addItems(options, self.div2);
            },
            error: function () {
                console.error('获取license信息失败！');
            },
        })

        self._dialog.dialog('open');
        self._dialog.parent().css({
            'top': '150px'
        });
    },

    getRackCount: function () {
        var rackDatas = this.sceneManager.dataManager._categoryDatas['rack'];
        var num = 0;
        for (var id in rackDatas) {
            if (id) {
                num++;
            }
        }
        return num;
    },

    getEquipmentCount: function () {
        var equipmentDatas = this.sceneManager.dataManager._categoryDatas['equipment'];
        var num = 0;
        for (var id in equipmentDatas) {
            if (id) {
                num++;
            }
        }
        return num;
    },

});

it.About = $About;



