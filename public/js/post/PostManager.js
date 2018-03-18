
it.PostManager = function (sceneManager) {
    this.sceneManager = sceneManager;
    this.dataManager = this.sceneManager.dataManager;
    this.init();
};

mono.extend(it.PostManager, Object, {
	init: function () {

    },

	showPostList :function(){
		var self = this;
        var rootNode = this.sceneManager.getCurrentRootNode();
        var data = this.sceneManager.getNodeData(rootNode);
        ServerUtil.api('data','getPostsByParentId',{parentId: data.getId()},function(posts){
            var ul = $('<ul class="it-post-list"></ul>').appendTo($('body'));
            var cline = function (p, l, v) {
                var row = $('<li><a id='+v.dataId+' href="#">' + v.dataId +','+ v.description + '</a></li>');
                p.append(row);
            }
            $.each(posts, function (index, val) {
                cline(ul, index, val);
            });
            if(posts.length == 0){
                var row = $('<li>NO Data</li>');
                ul.append(row);
            }
            ul.css({
                'margingLeft': '10px',
            });
            $('.it-post-list>li>a').on('click', function(){
            	layer.close(self._lastIndex);
            	var node = self.sceneManager.getNodeByDataOrId(this.id);
            	self.sceneManager.viewManager3d.getDefaultEventHandler().moveCameraForLookAtNode(node,function(){
            		self.showPostDetail(node);
            	},{x:100,y:200,z:100});
            	
            });
            layer.closeAll();
            layer.open({
                shade: 0,
                type: 1,
                title: it.util.i18n("PostManager_Post_list"),
                skin: 'layui-layer-rim', //加上边框
                area: ['300px', '500px'], //宽高
                offset: ['80px', '57px'], //top, left
                content: ul
            });
        });
    },

    showPostDetail: function(mainNode) {
        if (mainNode == null) {
            return;
        }
        var sm = this.sceneManager;
        var dm = sm.dataManager;
        var data = sm.getNodeData(mainNode);
        var category = sm.dataManager.getCategoryForData(data);
		if (!category) return;
		if (category.getId().toLowerCase().indexOf('post') == -1) {
			return;
		}
        var key1 =it.util.i18n("PostManager_Duty_post_key");
        var key2 =it.util.i18n("PostManager_Duty_person_key");
        var key3 =it.util.i18n("PostManager_Status_key");
        var key4 =it.util.i18n("PostManager_Contact");
        var key5 =it.util.i18n("PostManager_Office_belong_key");
        var key6 =it.util.i18n("PostManager_Company_belong_key");
        var key7 =it.util.i18n("PostManager_Date");
        var key8 =it.util.i18n("PostManager_Start_time");
        var key9 =it.util.i18n("PostManager_End_time");

        var post = {};

        post[key1] = it.util.i18n("PostManager_Duty_post_val");
        post[key2] = it.util.i18n("PostManager_Duty_person_val");
        post[key3] = it.util.i18n("PostManager_Status_key");
        post[key5] = it.util.i18n("PostManager_Office_belong_key");
        post[key6] = it.util.i18n("PostManager_Company_belong_key");
        post[key7] = "2016-07-26";
        post[key8] = "14:53";
        post[key9] = "17:00";

        var table = $('<table class="table"></table>').appendTo($('body'));
        table.find('td').css({
            'border-top': '0px solid #ddd',
            'border-bottom': '1px solid #ddd'
        });
        var cline = function (p, l, v, colspan, color) {
            var row = $('<tr><td>' + l + '</td><td>' + v + '</td></tr>');
            p.append(row);
        }
        $.each(post, function (index, val) {
            cline(table, index, val);
        });
        table.css({
            'margingLeft': '10px',
        });
        $('td',table).css({
            'padding': '10px',
        });
        layer.close(this._lastIndex);
        var index = layer.open({
            shade: 0,
            type: 1,
            title: it.util.i18n("PostManager_Duty_info"),
            skin: 'layui-layer-rim', //加上边框
            area: ['300px', '420px'], //宽高
            // offset: ['100px', '100px'],
            content: table
        });
        this._lastIndex = index;

    }

});