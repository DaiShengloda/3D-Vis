if (!window.sdk) {
    sdk = {};
}
if (!window.it) {
    it = {};
}
if (!it.tree) {
    it.tree = {};
}
var tree = sdk.tree = it.tree;

tree.init = function(selector, option){
	return $(selector).treeview(option);
}

