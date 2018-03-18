/**
 * Created by macpro2 on 3/11/16.
 */
if (window.pageConfig == null) {
    window.pageConfig = {
        urlPrex: '',
    };
}

ServerUtil = {
    createSocket: function () {
        var path = pageConfig.socket || '/socket.io';
        var origin = this.origin();
        return io.connect(origin, { path: path });
    },

    origin: function () {
        var u = window.location.origin;
        return u;
    },

    url: function () {
        var u = window.location.origin;
        u += pageConfig.urlPrex;
        if (!u.endsWith('/')) {
            u += '/';
        }
        return u;
    },

    monitorUrl: function (module, id) {
        var url = pageConfig.urlPrex + "/api/monitor/" + module + "";
        if (id) {
            url += "/" + id;
        }
        return url;
    },

    api: function (module, method, data, success, error) {

        var url = ServerUtil.url() + 'api/' + module.replace('/', '.') + '/' + method;
        $.ajax({
            type: "post",
            contentType: 'application/json; charset=UTF-8',
            url: url,
            data: JSON.stringify(data),
            success: function (result) {
                if (result.error) {
                    if (error) {
                        error(result.error);
                    } else {
                        console.error(result.error);
                        ServerUtil.alert(result.error);
                    }
                } else {
                    success && success(result.value);
                }
            },
            error: function (a, b, c) {
                if (error) {
                    error(a, b, c);
                } else {
                    console.error(a.responseText);
                    ServerUtil.alert(result.error);
                }
            },
        })
    },
    msg: function (msg) {
        layer.msg(msg);
    },
    msgWithIcon: function (msg, icon) {
        layer.msg(msg);
    },
    // msgWithIcon: function (msg, icon) {
    //     layer.msg(msg, { icon: icon });
    // },
    alert: function (msg) {
        layer.alert(msg);
    },
    confirm: function (msg, callback) {
        //询问框
        // layer.confirm('您是如何看待前端开发？', {
        //   btn: ['重要','奇葩'] //按钮
        // }, function(){

        // }, function(){

        // });
        layer.confirm(msg, function (index) {
            if (callback) {
                callback();
            }
            layer.close(index);
        });
    },
    commandHandler: function(event, params){
        var data = {event: event, params:params};
        ServerUtil.api('command', 'send', data, function(result){
            it.util.msg2('sent successfully');
        }, function(result){
            it.util.msg2('sent failure');
        });
    }
};

