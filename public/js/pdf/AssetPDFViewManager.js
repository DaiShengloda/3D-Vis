
var $AssetPDFViewManager = function(sceneManager){
	this.sceneManager = sceneManager;
	this.init();
};

mono.extend($AssetPDFViewManager,Object,{

	init: function() {
		
		// pdfjsWebLibs.pdfjsWebApp.PDFViewerApplication.configure = function(PDFJS) {
		// 	PDFJS.imageResourcesPath = '../libs/pdf/images/';
		// 	PDFJS.workerSrc = '../libs/pdf/pdf.worker.js';
		// 	PDFJS.cMapUrl = '../libs/pdf/cmaps/';
		// 	PDFJS.cMapPacked = true;
		// };
		this.pdfViewerApplication = new pdfjsWebLibs.pdfjsWebApp.PDFViewerApplication();
		this.pdfViewerApplication.configure = function(PDFJS) {
			PDFJS.imageResourcesPath = pageConfig.url('/libs/pdf/images/');
			PDFJS.workerSrc = pageConfig.url('/libs/pdf/pdf.worker.js');
			PDFJS.cMapUrl = pageConfig.url('/libs/pdf/cmaps/');
			PDFJS.cMapPacked = true;
		};
		var self = this;
		var viewNum =  '';//'rack';
		this._initDialog(viewNum);
		webViewerLoad(this.pdfViewerApplication,viewNum);
		// webViewerLoad(viewNum);
		var btnPreModel = $('#presentationMode');
		$('#toolbarViewerRight').hide(); // 将右侧的工具栏都隐藏掉，留着放中间的button和closeDiv
		$('#toolbarViewerMiddle').css('transform','translateX(-10%)');
		$('#toolbarViewerMiddle').append(btnPreModel);
		var oldBeforeLookAtFun = this.sceneManager.viewManager3d.getDefaultEventHandler().beforeLookAtFunction;
		this.sceneManager.viewManager3d.getDefaultEventHandler().beforeLookAtFunction = function(){
			self.closeDialog();
			oldBeforeLookAtFun && oldBeforeLookAtFun.call(self.sceneManager.viewManager3d.getDefaultEventHandler,node,oldFocusNode);
		}
	},

	_initDialog: function(viewNum) {
		var self = this;
		this.closeDiv = $('<div style="position:absolute;right:5px;top:5px;width:17px;height:17px;z-index:10000;background:url(./css/images/pdf-view-close.png) no-repeat;"></div>');
		var style = "position:absolute;top:2px;right:30px;width:35%;height:99%;background-color: #404040;z-index:10000";
		this.pdfViewePanel = $('<div id="itv-asset-pdf-view" style="' + style + '"></div');
		this.pdfViewePanel.append(this.closeDiv);
		$(document.body).append(this.pdfViewePanel);
		this.pdfViewePanel.hide();
		this.pdfViewer = new $PdfViewer(viewNum,true);
		this.pdfViewePanel.append(this.pdfViewer.getViewer());
		
	},

	openPdf: function(dataId) {
		if (!dataId) {
			return;
		}
		var self = this;
		this.pdfViewePanel.show();
		$(document.body).append(this.pdfViewePanel);
		this.closeDiv.click(function(e){ // close时remove掉了，事件也跟着丢失了，所以每次append时再重加一次
			console.log('close!!!');
			self.closeDialog();
		});
		it.util.api('asset_doc', 'search', {
			id: dataId
		}, function(values) {
			if (values && values.length > 0) {
				var docInfo = values[0];
				var path = docInfo.path;
				// self.openPdf(path);
				path = '/' + path;
				// pdfjsWebLibs.pdfjsWebApp.PDFViewerApplication.open(path);
				self.pdfViewerApplication.open(path);
			}else{ //没有pdf文档的话，就关闭它？
				layer.open({
                  content:it.util.i18n("No_Doc")
                });
				self.closeDialog();
			}
		}, function(err) {
			console.log(err);
		});
	},

	closeDialog : function(){
		if (this.pdfViewePanel) {
			this.pdfViewePanel.remove();
		}
	}

});

it.AssetPDFViewManager = $AssetPDFViewManager;
