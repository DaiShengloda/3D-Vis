/**
 * 提供方法，可用于管理用户添加的事件
 * 可配合util中的掺元类使用
 */
var dealUserEventHandler = it.dealUserEventHandler = function () {

};

mono.extend(dealUserEventHandler, Object, {

	/* 
	 * 	额外的必须属性（例子）
		userEventHandlerBox: {
			'click': {
				element: element,
				event: 'click',
				funcName: 'handleClick',
			}
		},
		handleClick: function(e){
			console.log('click');
		},
	 */

	addAllUserEventHandler: function () {
		for (var key in this.userEventHandlerBox) {
			this.addOneUserEventHandler(key);
		}
	},

	removeAllUserEventHandler: function () {
		for (var key in this.userEventHandlerBox) {
			this.removeOneUserEventHandler(key);
		}
	},

	addOneUserEventHandler: function (event) {
		this.userEventHandlerBox[event].func = this[this.userEventHandlerBox[event].funcName].bind(this);
		this.userEventHandlerBox[event].element.addEventListener(event, this.userEventHandlerBox[event].func);
	},

	removeOneUserEventHandler: function (event) {
		if (this.userEventHandlerBox[event].func) {
			this.userEventHandlerBox[event].element.removeEventListener(event, this.userEventHandlerBox[event].func);
			this.userEventHandlerBox[event].func = null;
		}
	},

});