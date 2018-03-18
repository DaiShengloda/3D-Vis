$(function() {
	make.Default.path = '../modellib/';
	it.util.setLanguage('zh');
	it.tabPanel.init();
	var itModule = new it.module();
	itModule.init();
	

});
var main = window.main = {};