function getUrlPre() {
    if (window.location.href.indexOf("/3d") > 0) {
        return "/3d";
    }
    return "";
}

function getAdminURLPre() {
    return "/api/admin/";
}

function getSocketPath() {
    var urlPrex = getUrlPre();
    return urlPrex ? (urlPrex + "/socket.io") : "/socket.io"
}

var pageConfig = {
    urlPrex: getUrlPre(),
    adminURLPrex: getUrlPre() + getAdminURLPre(),
    socket: getSocketPath(),
    url: function (uri) {
        return getUrlPre() + uri
    },
    panoFolderName: 'public/theme/panoramic', 
    ip: '127.0.0.1',
    port: '10008',
    loginData: {
        aid:"admin",
        pwd:"123"
    },
    needLogin: false
}

var SETTING = {
    businessTypeWithDataType: true, //启用业务对象联动
}

if(!window.main){
    window.main = {};
}
if(!window.main.config){
    window.main.config = {};
}
window.main.config.debug = false;



