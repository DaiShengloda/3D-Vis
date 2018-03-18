/**
* @function PrivilegeManager 权限相关
* @param  {type} sceneManager {description}
* @return {type} {description}
*/
var PrivilegeManager = function (sceneManager) {
    this.sceneManager = sceneManager;
    this._permissionMap = {};//缓存所有许可的授权
};
mono.extend(PrivilegeManager, Object, {

    init:function(){
        this.load();
    },

    load:function(){
        
    },

    /**
    * @function {isPermit} 判断一个 data 是否有权限
    * @param  {type} dataId {description}
    * @return {type} {description}
    */
    isPermit: function (dataId) {

    },
    

});
