/**
 *
 * 3D机房向WinForm程序发送点击事件
 * 
 * 提供哪些接口呢？
 * 
 */

// 接口标准
var cefSharpData = {
	dblClickLookAtObj : {  // 双击lookAt的对象
		className:'CefEventObject',        // WinForm中的类的名字
		method:'dblClick', // WinForm中obj的方法
		stopPropagation: false, // 是否阻止默认的实现
	},
	clickElement :{  // 单击某个对象的事件
		className:'CefEventObject',        // WinForm中的类的名字
		method:'clickElement',
		stopPropagation: false, // 是否阻止默认的实现
	},
	dblClickElement :{  // 双击某个对象的事件，这个事件没法让他们阻止事件的传播
		className:'CefEventObject',        // WinForm中的类的名字
		method : 'dblClickElement',
	},
	dblClickBackground : {  // 点击背景的事件，这个事件没法让他们阻止事件的传播
		className:'CefEventObject',        // WinForm中的类的名字
		method : 'dblClickBackground',
	},
	clickBackground : {
		className:'CefEventObject',        // WinForm中的类的名字
		method:'clickBackground'
	}
};


var $WinFormInterface = function(sceneManager){
	this.sceneManager = sceneManager;
	var self = this;
	setTimeout(function(){
		self.init();
	},5000);
}

mono.extend($WinFormInterface,Object,{
	
	init : function(){ 
		this.orgHandleDoubleClickElementFunction = main.nodeEventHander.handleDoubleClickElementFunction;
		var self = this;
		main.nodeEventHander.handleDoubleClickElementFunction = function(element, network, data, clickedObj){
			var dblClickLookAtObj = cefSharpData.dblClickLookAtObj || null;
			if (dblClickLookAtObj 
				&& dblClickLookAtObj.stopPropagation != false) {
				if(window[dblClickLookAtObj.className][dblClickLookAtObj.method]){
					return window[dblClickLookAtObj.className][dblClickLookAtObj.method](data.getId());
				}
			}
			return self.orgHandleDoubleClickElementFunction.call(main.nodeEventHander,element, network, data, clickedObj);
		};

        var orgHandleClick = this.sceneManager.viewManager3d.handleClick;
		this.sceneManager.viewManager3d.handleClick = function(element){
			orgHandleClick.call(self.sceneManager.viewManager3d,element);
			var clickElement = cefSharpData.clickElement;
			if (clickElement 
				&& clickElement.className 
				&& window[clickElement.className]
				&& clickElement.method) {
				var node = element.element;
				var data = self.sceneManager.getNodeData(node);
				window[clickElement.className][clickElement.method](data.getId());
			}
			
		}

        var orgHandleDoubleClick = this.sceneManager.viewManager3d.handleDoubleClick;
		this.sceneManager.viewManager3d.handleDoubleClick = function(element){
			orgHandleDoubleClick.call(self.sceneManager.viewManager3d,element);
			var dblClickElement = cefSharpData.dblClickElement;
			if (dblClickElement 
				&& dblClickElement.className 
				&& window[dblClickElement.className]
				&& dblClickElement.method) {
				var node = element.element;
				var data = self.sceneManager.getNodeData(node);
				window[dblClickElement.className][dblClickElement.method](data.getId()); 
			}
		}
        
        var orgHandleDoubleClickBackground = this.sceneManager.viewManager3d.handleDoubleClickBackground;
		this.sceneManager.viewManager3d.handleDoubleClickBackground = function(){
			orgHandleDoubleClickBackground.call(self.sceneManager.viewManager3d);
			var dblClickBackground = cefSharpData.dblClickBackground;
			if(dblClickBackground 
				&& dblClickBackground.className 
				&& window[dblClickBackground.className]
				&& dblClickBackground.method){
				window[dblClickBackground.className][dblClickBackground.method]();
			}
		}

        var orgHandleClickBackGround = this.sceneManager.viewManager3d.handleClickBackground;
		this.sceneManager.viewManager3d.handleClickBackground = function(){
			orgHandleClickBackGround.call(self.sceneManager.viewManager3d);
			var clickBackground = cefSharpData.clickBackground || null;
			if(clickBackground 
				&& clickBackground.className
				&& window[clickBackground.className] 
				&& clickBackground.method){
			    window[clickBackground.className][clickBackground.method]();	
			}
		}

	},

});

it.WinFormInterface = $WinFormInterface;