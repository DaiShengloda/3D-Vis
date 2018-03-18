/**
 * 右下角信息的规则类
 */
var $InfoRule = function(parameters){
	parameters = parameters || {};
	this._id = parameters.id || this.randomId();
    this._customerId = parameters.customerId || ""; //用户扩展
	this._categoryId = parameters.categoryId || "";
	this._dataTypeId = parameters.dataTypeId || "";
    this._sceneId = parameters.sceneId || ""; 
	this._propertiesDesc = parameters.propertiesDesc || "";
	this._extInfo = parameters.extInfo || {};
    // this._withCloseDiv = parameters.withCloseDiv||false;//是否在上面加上一个关闭按钮
};

mono.extend($InfoRule,it.Base,{
    ___accessor:['customerId','categoryId',"dataTypeId","sceneId","propertiesDesc",'extInfo'],
    getId : function(){
    	return this._id;
    },

    randomId : function(){
    	return mono.id("sceneInfoRule");
    },
});

it.InfoRule = $InfoRule;