

var $OpenFileBar = function(sceneManager,mainPanel){
	it.ToolBarButton.call(this);
	this.sceneManager = sceneManager;
	// this.pdfManager = new $PDFManager();]
	this.pdfManager = null;
	this.select = $('<select id="open_file_bar_pdf_info" style="position: absolute;width: 200px;left: 30px;" class="input-min contral-width show-tick form-control"></select>');
	this.select.hide();
	this.mainPane = $('<div style="position: relative;float: left;"></div>');
	this.init();
};


mono.extend($OpenFileBar,it.ToolBarButton,{

	init:function(){
		this.inputFile = $('<input id = "openFileBar_inputFile" type = "file" class="hidden">');
		$(document.body).append(this.inputFile);
		var self = this;
        this.pdfManager = new $PDFManager(this.sceneManager);
		this.button.click(function(){
			// if (self.pdfManager.isOpenPdfView) {
			// 	  self.pdfManager.closeViewer();
			// }else{
			//     self.pdfManager.openViewer();
		        // self.inputFile.click();
			// }
			// self.replaceClass();
			self.loadPDFInfoData();
			if (self.pdfManager.isOpenPdfView || self.select.css('display') == 'block') {
				self.pdfManager.closeViewer();
				self.select.hide();
			}else{
				self.select.val('');
				self.select.show();
			}
		});
		// var callback = function(){
			// var option = $('<option value="localFile" class="input-min">选择本机的演示文档</option>');
			// self.select.append(option);
		// }
		// this.loadPDFInfoData(callback);
		this.mainPane.append(this.button);
		this.mainPane.append(this.select);
		this.select.change(function(e){
			console.log('!!!');
			// var url = location.hostname+':'+location.port + '/';//pdfs/
			var url = pageConfig.urlPrex + '/';
			var path = e.target.value;
			if (!path) {
				return;
			}else if (path == 'localFile') {
				self.openViewer();
				// self.inputFile.click();
		        // self.inputFile.trigger('click');
			}else {
				url += path;
				// pdfjsWebLibs.pdfjsWebApp.PDFViewerApplication.open(url);
				self.pdfManager.pdfViewerApplication.open(url);
				self.openViewer();
			}
			self.replaceClass();
		});
		this.select.click(function(e){
			// self.inputFile.click();
		});
	},

	openViewer : function(){
		this.pdfManager.openViewer();
	},

	loadPDFInfoData : function(callback){
		var self = this;
		this.select.empty();
		var option = $('<option value="" class="input-min">'+it.util.i18n("OpenFileBar_Select_file")+'</option>');
		this.select.append(option);
		ServerUtil.api('pdf_info', 'search',{}, function(pdfInfos) {
			if(pdfInfos && pdfInfos.length > 0){
		    	for(var i = 0 ; i < pdfInfos.length ; i++){
		    		var pdfInfo = pdfInfos[i];
					var option = $('<option value="' + pdfInfo.path + '" class="input-min">' + pdfInfo.path + '</option>');
		    		self.select.append(option);
		    	}
		    }
		    callback && callback();
		});
	},

	getButton : function(){
		return this.mainPane;
	},

    /*
	selectFile: function(e) {
		var file = e.fileInput.files[0];
		if (!pdfjsLib.PDFJS.disableCreateObjectURL && typeof URL !== 'undefined' && URL.createObjectURL) {
			PDFViewerApplication.open(URL.createObjectURL(file));
		} else {
			// Read the local file into a Uint8Array.
			var fileReader = new FileReader();
			fileReader.onload = function webViewerChangeFileReaderOnload(evt) {
				var buffer = evt.target.result;
				var uint8Array = new Uint8Array(buffer);
				PDFViewerApplication.open(uint8Array);
			};
			fileReader.readAsArrayBuffer(file);
		}
		PDFViewerApplication.setTitleUsingUrl(file.name);
		// URL does not reflect proper document location - hiding some icons.
		var appConfig = PDFViewerApplication.appConfig;
		appConfig.toolbar.viewBookmark.setAttribute('hidden', 'true');
		appConfig.secondaryToolbar.viewBookmarkButton.setAttribute('hidden', 'true');
		appConfig.toolbar.download.setAttribute('hidden', 'true');
		appConfig.secondaryToolbar.downloadButton.setAttribute('hidden', 'true');
	},
	*/

	replaceClass : function(){
		var classs = 'itv-toolbar-item open-pdf-menu-image';
		if (this.pdfManager && this.pdfManager.isOpenPdfView) {
			classs = 'itv-toolbar-item close-pdf-menu-image';
		}
		$('#open-pdf-menu-image_button_01').attr('class',classs);
	},

	getTooltip : function(){
		return it.util.i18n("OpenFileBar_Open_file");
    },

    getClass : function(){
    	return 'open-pdf-menu-image';
    },

});

it.OpenFileBar = $OpenFileBar;
