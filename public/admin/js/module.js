if (!window.sdk) {
    sdk = {};
}
if (!window.it) {
    it = {};
}
if (!it.cache) {
    it.cache = {};
}
var cache = sdk.cache = it.cache;

if (!it.module) {
    it.module = function (module) {
		
	};
}
var module = sdk.module = it.module;

mono.extend(module, Object, {
	load: function(data){
		var nodesMap = {}, group;
		$.each(data, function(index, val) {
			val.text = util.i18n(val.text);
			if (val.group) {
				group = nodesMap[val.group];
				if (!group) {
					group = {text: util.i18n(val.group), isGroup:true,nodes: []};
				}
				group.nodes.push(val);
				nodesMap[val.group] = group;
			} else{
				nodesMap[val.id] = val;
			}
			
		});
		var guideNode = {
				id: "guide",
				text: it.util.i18n("Admin_module_implement_guide")
			};
		var wenxinNode = {
			id:"weixin",
			text:it.util.i18n("Admin_module_weichat")
		};
		var nodes = [guideNode];
		$.each(nodesMap, function(index, val) {
			nodes.push(val);
		});
		// nodes.push(wenxinNode);
		var $tree = tree.init('.sidebar', {
			data:nodes, 
			levels:1,
			// color: "#428bca",
          	expandIcon: 'glyphicon glyphicon-chevron-right',
          	collapseIcon: 'glyphicon glyphicon-chevron-down',
		});
		var self = this;;
		$tree.on('nodeSelected', function(event, data){
			self.change(data);
		});
		var node = $tree.treeview('search', [guideNode.text]);
		$tree.treeview('clearSearch');
		$tree.treeview('selectNode', [node]);

	},

	doFilter: function(data) {
		var dataModule = data['data'];
		var dataTypeModule = data['datatype'];
		if (SETTING && SETTING.businessTypeWithDataType) {
			dataModule.attributes.businessTypeId.hidden = true;
		} else {
			dataTypeModule.attributes.businessTypeId.hidden = true;
		}
		return data;
	},

	init: function() {
		var self = this;
		util.adminApi('ModuleDefined', 'list', {}, function (data) {
	        it.cache.moduleMap = self.doFilter(data);
	        util.adminApi('Menu', 'list', {}, function (data) {
		        self.load(data);
		    });
	    });
	},
	
	reload: function(){
		var self = this;
		util.adminApi('Menu', 'list', {}, function (data) {
	        self.load(data);
	    })
	},
	change: function(data){
		if(!data.isGroup){
			tabPanel.show(data);
		}
	}
});
