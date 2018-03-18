(function ($) {
    $.widget("hud.tree", {
        createSearchTree: function (results, inputPane, height) {
            var self = this;
            var el = this.element;
            this.treeView = new it.TreeView(inputPane);

            this.orgTreeManager = new it.OrganizeTreeManager(main.sceneManager.dataManager);
            var treeNodes = null;
            if (!results || results.length < 1) {
                this.treeView.clearTreeData();
            }else{
                treeNodes = this.orgTreeManager.organizeTree(results);
                this.treeView.setData(treeNodes, false);
            }
            self.treeView.setTreeHeight(height);
        },

        getTreeView: function () {
            return this.treeView;
        },
        removeSearchTree: function () {
            this.element.find('#tree-content').remove();
        },
    });
})(jQuery)