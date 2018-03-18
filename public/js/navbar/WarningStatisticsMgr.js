fa = {};
var $WarningStatisticsMgr = function (sceneManager) {
    this.itemMap = {};
    this.sceneManager = sceneManager;
};

mono.extend($WarningStatisticsMgr, Object, {

    init: function () {
        this.initView();
        // this.appManager = new fa.AppManager(this.sceneManager);
        this.appManager = main.navBarManager.appManager
    },

    initView: function () {
        var self = this;
        // var $box = this.$box = $('<div></div>').addClass('infoPanel').appendTo($('.view-control')).css({ 'position': 'absolute', 'top': '50%', 'left': '50%', 'transform': 'translate(-50%,-50%)' });
        this._dialog = $('<div></div>').appendTo($(document.body));
        var $box = this.$box = $('<div></div>').appendTo(this._dialog);
        $box.warningStatistics({});
        this._dialog.dialog({ //创建dialog弹窗
            blackStyle: true,
            width: '796px',
            height: 'auto',
            title: it.util.i18n("ClientAlarmManager_Alarm_statisics"),
            autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
            show: '', //显示弹窗出现的效果，slide为滑动效果
            hide: '', //显示窗口消失的效果，explode为爆炸效果
            resizable: false, //设置是否可拉动弹窗的大小，默认为true
            modal: true,
        });
    },
    hide: function () {
        this._dialog.dialog('close');
    },
    show: function () {
        this.loadChartData();
        this._dialog.dialog('open');
    },
    loadChartData: function () {
        var self = this;
        ServerUtil.api('alarm_log', 'alarmCountGroupByDay', { offset: -30 }, function (data) {
            var date = new Date(),
                newData = [];
            for (var i = 0; i < 30; i++) {
                var name = it.Util.formateDateTime(date).substring(0, 10);
                var value = 0;
                data.forEach(function (d) {
                    if (name == d.name) {
                        value = d.value;
                    }
                })
                newData.unshift({
                    'name': name,
                    'value': value
                });
                date = new Date(date - 24 * 60 * 60 * 1000);
            }
            self.$box.warningStatistics('option', 'number', newData);

        });

        ServerUtil.api('alarm_log', 'alarmCountGroupByType', { offset: -30 }, function (data) {
            self.$box.warningStatistics('option', 'type', data);
        });

        ServerUtil.api('alarm_log', 'alarmCountGroupByLevel', { offset: -30 }, function (data) {
            data.forEach(function (c) {
                c.name = it.AlarmSeverity.getByName(c.name.toLowerCase()).displayName;
            })
            self.$box.warningStatistics('option', 'level', data);
        });
    }
});

it.WarningStatisticsMgr = $WarningStatisticsMgr;



