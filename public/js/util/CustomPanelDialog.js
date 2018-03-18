/* 客户自定义的CustomPanelDialog */

var $CustomPanelDialog = function () {

};

mono.extend($CustomPanelDialog, Object, {

	makeDialog: function (params) {
		var dialogStyle = params.dialogStyle||'user-dialog1';
		var url = params.url||'http://doc.servasoft.com/';
		var width = params.width||400;
		var height = params.height||400;
		var maxHeight = params.maxHeight||400;
		var positionMy = params.positionMy||"center center";
		var positionAt = params.positionAt||"center center";
		var positionOf = params.positionOf||"html";
		var modal = params.modal||false;
		var resizable = params.resizable||false;
		
		var dialogTitle;
		if(params.dialogTitle||params.dialogTitle == ''){
			dialogTitle = params.dialogTitle;
		} else{
			dialogTitle = null;
		}

		var userCloseFun = params.userCloseFun;
		if(typeof userCloseFun !== 'function'){
			userCloseFun =  function(){
				// console.log('点击了关闭按钮');
			}
		}

		var parentDiv = $('<div>').appendTo($('.custom-panel-box'));
		if(params.dialogUserClass){
			parentDiv.addClass(params.dialogUserClass);
		}
		var content = $('<iframe>').attr('src', url).attr('width', '100%').attr('height', '100%');
        parentDiv.append(content);
		
        parentDiv.dialog({
            appendTo: ".custom-panel-box",
            dialogClass: dialogStyle,
            blackStyle: true,
            width: width,
            height: height,
            maxHeight: maxHeight,
            title: dialogTitle,
            autoOpen: false, //初始化之后，是否立即显示对话框，默认为true
            show: '', //显示弹窗出现的效果，slide为滑动效果
            hide: '', //显示窗口消失的效果，explode为爆炸效果
            resizable: resizable, //设置是否可拉动弹窗的大小，默认为true
            position: {
                my: positionMy,
				at: positionAt,
				of: positionOf,
            },
            modal: modal, //是否有遮罩模型
		});
		
        parentDiv.dialog('open');
        parentDiv.on('dialogclose', function () {
			userCloseFun()
		});

		return parentDiv;
	},
	
});

it.CustomPanelDialog = new $CustomPanelDialog();