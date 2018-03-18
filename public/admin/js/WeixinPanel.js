var WeixinPanel = function (parent) {
	this._doc = {
		config:{
			title:it.util.i18n("Admin_WeixinPanel_General_info"),
			category:'app_info',
			p:[
				it.util.i18n("Admin_WeixinPanel_Setting_wei_chat")
			],
		},
		add_menu : {
			title:it.util.i18n("Admin_WeixinPanel_Menu"),
			category:'add_menu',
			p:[
				it.util.i18n("Admin_WeixinPanel_Add_wei_chat_menu")
			],
		}
	};
	this.init(parent);
};

mono.extend(WeixinPanel,Object,{
	init : function(parent){
		var self = this;
		var $view = $('<div class="row"></div>').appendTo(parent);
	   this.createDoc($view);
    },

    createDoc: function(parent){
		var doc = this._doc;
		var $content = $('<div class="col-sm-12"></div>').appendTo(parent);
		var $sections = $('<div class="bs-docs-content customRow"></div>').appendTo($content);//data-spy="scroll" data-target="#sectionNav" data-offset="0"
		var self = this;
		$.each(doc, function(index, val) {
			self.createSection(index, val, $sections);
		});
	},

	createSection : function(id,section, parent){
		var $section = $('<div class="bs-docs-section"></div>').appendTo(parent);
		this.createSectionContent(id,section, $section);
	},

	createSectionContent: function(id,section, parent, sub){
		var $section = parent;
		var h = sub?'3':'1';
		var $h1 = $('<h'+h+' id="'+id+'">'+section.title+'</h'+h+'>').appendTo($section);
		if(!sub){
			$h1.addClass('page-header');
		}

		if(section.p){
			$.each(section.p, function(index, val) {
				if(typeof val === 'object'){
					var $ul = $('<ul class="nav"></ul>').appendTo($section);
					$.each(val, function(pindex, pval) {
						 $('<li>'+pval+'</li>').appendTo($ul);
					});
				} else if(typeof val === 'string'){
				 	$('<p>'+val+'</p>').appendTo($section);
				}
			});
		}

		if(section.category){
			// this.createTable(parent, section);
			// if(section.category === 'dataCenter'){
			// 	this.createTable(parent, {category:'building'});
			// }
			if(section.category == 'app_info'){
				var props = [];
				props.push({label: 'APPID', id: 'APPID', value:'wx5b6712b7d69e6dd4'});
			    props.push({label: 'APPSECRET', id: 'APPSECRET', value:'650d6e91c430bc40bb15ee9230e6bfea'});
			    props.push({label: 'TOKEN', id: 'TOKEN', value:'weixin'});
			    props.push({label: it.util.i18n("Admin_WeixinPanel_Get")+'ACCESS_TOKEN', id: 'ACCESS_TOKEN', value:'',readonly:true});
			    var form = util.createForm(props,true,function(){
			    	// console.log(util.getFormData(form));
			    	var data = util.getFormData(form),APPID = data.APPID,APPSECRET = data.APPSECRET;
			    	var url = '/weixin2?url=abc';
			    	$.get(url,function(result){
			    		console.log(result);
			    	});
			    });
			    form.appendTo(parent);
			}else if(section.category == 'add_menu'){
				var props = [];
				var value = '';
				props.push({label: it.util.i18n("Admin_WeixinPanel_Wei_chat_menu"), id: 'menu',type:'textarea'});
			    var form = util.createForm(props,true,function(){
			    	console.log(util.getFormData(form));
			    });
			    form.appendTo(parent);
			}
		}
		
		// var self = this;
		// if(section.sub){
		// 	$.each(section.sub, function(index, val) {
		// 		self.createSectionContent(index, val, $section, true);
		// 	});
		// }
		// if(!section.category && section.link){
		// 	var $link = $('<a href="'+section.link.url+'">'+section.link.text+'</a>').appendTo($section);
		// 	if(section.link.command){
		// 		$link.click(function(event) {
		// 			var arg;
		// 			if(typeof section.link.command === 'object'){
		// 				arg = section.link.command;
		// 			} else {
		// 				arg = {id:section.link.command};
		// 			}
		// 			if(arg.id === 'rackSetting'){
		// 				var floorTable = self._tableCache['floor'];
		// 				arg.param = floorTable.row($('tr.selected',$(floorTable.table().body()))).data();
		// 				if(!arg.param){
		// 					it.util.msg('在楼层列表中先选择楼层');
		// 					return;
		// 				}
		// 			}
		// 			it.tabPanel.show(arg);
					
		// 		});
				
		// 	} 
		// 	if(section.link.url!=='#'){
		// 		$link.attr('target', '_blank');
		// 	}
		// }
	},
});