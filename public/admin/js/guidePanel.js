function GuidePanel(parent){
	// this._parent = parent;
	
	this._doc = {
		'earth':{
			title:it.util.i18n("Admin_guidePanel_Earth"),
			category:'earth',
			p:[
				it.util.i18n("Admin_guidePanel_Earth_p"),
				[it.util.i18n("Admin_guidePanel_Earth_p1"),
				it.util.i18n("Admin_guidePanel_Earth_p2"),
				it.util.i18n("Admin_guidePanel_Earth_p3"),
				it.util.i18n("Admin_guidePanel_Earth_p4")]
			],
			link:{
				text:it.util.i18n("Admin_guidePanel_Setting_earth"),
				url:'#',
				command:'earthSetting'
			},
		},
		'park':{
			title:it.util.i18n("Admin_guidePanel_Park"),
			category:'dataCenter',
			p:[
				[it.util.i18n("Admin_guidePanel_Park_p_1"),
				it.util.i18n("Admin_guidePanel_Park_p_2"),
				it.util.i18n("Admin_guidePanel_Park_p_3")]
			],
			link:{
				text:it.util.i18n("Admin_guidePanel_Setting_park"),
				url:'#',
				command:'parkSetting'
			},
		},
		'building':{
			title:it.util.i18n("Admin_guidePanel_Building"),
			category:'building',
			p:[
				it.util.i18n("Admin_guidePanel_Building_p")
			],
			link:{
				text:it.util.i18n("Admin_guidePanel_Setting_Building"),
				url:'#',
				command:'buildingSetting'
			},
		},
		'floor':{
			title:it.util.i18n("Admin_guidePanel_Floor"),
			category:'floor',
			p:[
				it.util.i18n("Admin_guidePanel_Floor_p_1")+
				it.util.i18n("Admin_guidePanel_Floor_p_2")+
				it.util.i18n("Admin_guidePanel_Floor_p_3"),
				[it.util.i18n("Admin_guidePanel_Floor_p1"),
				it.util.i18n("Admin_guidePanel_Floor_p2"),
				it.util.i18n("Admin_guidePanel_Floor_p3"),
				it.util.i18n("Admin_guidePanel_Floor_p4"),
				it.util.i18n("Admin_guidePanel_Floor_p5"),
				it.util.i18n("Admin_guidePanel_Floor_p6")]
			],
			link:{
				text:it.util.i18n("Admin_guidePanel_Setting_floor"),
				url:'#',
				command:'floorSetting'
			},
		},
		'rack':{
			title:it.util.i18n("Admin_guidePanel_Rack"),
			p:[
				it.util.i18n("Admin_guidePanel_Setting_rack")
			],
			sub:{
				'rackModelEditor':{
					title:it.util.i18n("Admin_guidePanel_Module_edit"),
					p:[
						it.util.i18n("Admin_guidePanel_Module_edit_p_1")+
						it.util.i18n("Admin_guidePanel_Module_edit_p_2")+
						it.util.i18n("Admin_guidePanel_Module_edit_p_3"),
					],
					link:{
						text:it.util.i18n("Admin_guidePanel_Rack_Module_edit"),
						url:'datatype.html'
					},
				},
				'rackSceneEditor':{
					title:it.util.i18n("Admin_guidePanel_Add_in_editor"),
					p:[
						it.util.i18n("Admin_guidePanel_p_1")+
						it.util.i18n("Admin_guidePanel_p_2")+
						it.util.i18n("Admin_guidePanel_p_3")+
						it.util.i18n("Admin_guidePanel_p_4")+
						it.util.i18n("Admin_guidePanel_p_5"),
					],
					link:{
						text:it.util.i18n("Admin_guidePanel_Create_rack_in_editor"),
						url:'#',
						command:'rackSetting'
					},
				},
				'importRack':{
					title:it.util.i18n("Admin_guidePanel_Excel_import"),
					p:[
						it.util.i18n("Admin_guidePanel_Excel_import_p")
					],
					link:{
						text:it.util.i18n("Admin_guidePanel_Create_rack_in_excel"),
						url:'#',
						command:{
							id: "importRack",
							text: it.util.i18n("Admin_guidePanel_Excel_import_rack")
						}
					},
				}
			},
		},
		'device':{
			title:it.util.i18n("Admin_guidePanel_Device"),
			p:[
				it.util.i18n("Admin_guidePanel_Device_p")
			],
			sub:{
				'deviceEditor':{
					title:it.util.i18n("Admin_guidePanel_Model"),
					p:[
						it.util.i18n("Admin_guidePanel_Model_p_1")+
						it.util.i18n("Admin_guidePanel_Model_p_2")+
						it.util.i18n("Admin_guidePanel_Model_p_3")
					],
					link:{
						text:it.util.i18n("Admin_guidePanel_Excel_Device_Edit"),
						url:'datatype.html'
					},
				},
				'importEquipment':{
					title:it.util.i18n("Admin_guidePanel_Excel_import"),
					p:[it.util.i18n("Admin_guidePanel_Excel_import_device_p")],
					link:{
						text:it.util.i18n("Admin_guidePanel_Create_device_in_excel"),
						url:'#',
						command:{
							id: "importEquipment",
							text: it.util.i18n("Admin_guidePanel_Excel_import_device")
						}
					},
				}
			},
		},
		'panel':{
			title:it.util.i18n("Admin_guidePanel_Panel"),
			p:[
				it.util.i18n("Admin_guidePanel_Panel_p"),
				[
					it.util.i18n("Admin_guidePanel_Panel_p1"),
					it.util.i18n("Admin_guidePanel_Panel_p2"),
					it.util.i18n("Admin_guidePanel_Panel_p3"),
					it.util.i18n("Admin_guidePanel_Panel_p4"),
					it.util.i18n("Admin_guidePanel_Panel_p5"),
				]
			],
			link:{
				text:it.util.i18n("Admin_guidePanel_Panel_edit"),
				url:'deviceEditor.html'
			},
		},
		'link':{
			title:it.util.i18n("Admin_guidePanel_Link"),
			p:[
				it.util.i18n("Admin_guidePanel_Link_p")
			],
			sub:{
				'linkManage':{
					title:it.util.i18n("Admin_guidePanel_Link_Manage"),
					p:[it.util.i18n("Admin_guidePanel_Link_list_manage")],
					link:{
						text:it.util.i18n("Admin_guidePanel_Link_list"),
						url:'#',
						command:{
							id: "link",
							modulePath: "link",
							text: it.util.i18n("Admin_guidePanel_Link")
						}
					},
				},
				'importLink':{
					title:it.util.i18n("Admin_guidePanel_Create_link_in_excel"),
					p:[it.util.i18n("Admin_guidePanel_Excel_import_link_p")],
					link:{
						text:it.util.i18n("Admin_guidePanel_Create_link_in_excel"),
						url:'#',
						command:{
							id: "importLink",
							text: it.util.i18n("Admin_guidePanel_Excel_import_link")
						}
					},
				}
			},
		},
		'pems':{
			title:it.util.i18n("Admin_guidePanel_Dynamic_environment"),
			p:[
				[it.util.i18n("Admin_guidePanel_Dynamic_environment_p1"),
				it.util.i18n("Admin_guidePanel_Dynamic_environment_p2"),
				it.util.i18n("Admin_guidePanel_Dynamic_environment_p3")]
			],
			link:{
				text:it.util.i18n("Admin_guidePanel_Setting_Dynamic_environment"),
				url:'#'
			},
		},
	}
	this.init(parent);
}

mono.extend(GuidePanel, Object, {
	init: function(parent){
		var self = this;
		var $view = $('<div class="row"></div>').appendTo(parent);
		this.createDoc($view);
		this.createNav($view);
		anchors.options = {
			// placement: 'left',
			// visible: 'always',
			// icon: '¶'
		};
		anchors.add();
		var $first = $('.page-header', $sections).first();
		var $sections = $('.bs-docs-content', $view);
		var $nav = $('.bs-docs-sidenav', $view);

		//当当前tab显示的时候，刷新下table
		$('a[data-toggle="tab"][aria-controls="panel_guide"]').on('shown.bs.tab', function (e) {
			
			$.each(self._tableCache, function(index, val) {
				 val.draw();
			});
		})

		$sections.scrollspy({ target: '#sectionNav' });
	},
	createDoc: function(parent){
		var doc = this._doc;
		var $content = $('<div class="col-sm-9"></div>').appendTo(parent);
		var $sections = $('<div class="bs-docs-content customRow"></div>').appendTo($content);//data-spy="scroll" data-target="#sectionNav" data-offset="0"
		var self = this;
		$.each(doc, function(index, val) {
			self.createSection(index, val, $sections);
		});
	},
	createSection: function(id,section, parent){
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
		if(section.category){
			this.createTable(parent, section);
			// if(section.category === 'dataCenter'){
			// 	this.createTable(parent, {category:'building'});
			// }
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
		
		var self = this;
		if(section.sub){
			$.each(section.sub, function(index, val) {
				self.createSectionContent(index, val, $section, true);
			});
		}
		if(!section.category && section.link){
			var $link = $('<a href="'+section.link.url+'">'+section.link.text+'</a>').appendTo($section);
			if(section.link.command){
				$link.click(function(event) {
					var arg;
					if(typeof section.link.command === 'object'){
						arg = section.link.command;
					} else {
						arg = {id:section.link.command};
					}
					if(arg.id === 'rackSetting'){
						var floorTable = self._tableCache['floor'];
						arg.param = floorTable.row($('tr.selected',$(floorTable.table().body()))).data();
						if(!arg.param){
							it.util.msg(it.util.i18n("Admin_guidePanel_Select_floor_in_list"));
							return;
						}
					}
					it.tabPanel.show(arg);
					
				});
				
			} 
			if(section.link.url!=='#'){
				$link.attr('target', '_blank');
			}
		}
	},
	_tableCache: {},
	createTable: function(parent, section){
		var category = section.category;
		var $table = $('<table class="table table-striped table-bordered"></table>').appendTo(parent);
		var parentId = undefined;
		var table = $table.DataTable({
	        lengthChange: false,
	        dom: "rt",
	        ajax: function(data, callback, settings){
	        	var param = {};

	        	param.id = category;
	        	if(parentId){
	        		console.log(parentId);
	        		param.parentId = parentId;
	        	}
				
				it.util.adminApi('data','getDataByCategory',param,
				   function(result) {
	                    //异常判断与处理
	                    if (result.error) {
	                        util.msg(it.util.i18n("Admin_guidePanel_Search_fail_error")+result.error);
	                        return;
	                    }
	                    var value = result;
	                    //封装返回数据，这里仅演示了修改属性名
	                    var returnData = {};
	                    returnData.draw = data.draw;//这里直接自行返回了draw计数器,应该由后台返回
	                    returnData.recordsTotal = value.length;
	                    returnData.recordsFiltered = value.length;//后台不实现过滤功能，每次查询均视作全部结果
	                    returnData.data = value;
	                    //调用DataTables提供的callback方法，代表数据已封装完成并传回DataTables进行渲染
	                    //此时的数据需确保正确无误，异常判断应在执行此回调前自行处理完毕
	                    callback(returnData);
	                }
				   );       	
	        },
	    	columns: [
				{"data":"id","title":"#"},
				{"data":"description","title":it.util.i18n("Admin_guidePanel_Description")},
				{"data":"parentId","title":it.util.i18n("Admin_guidePanel_Parent")},
				{"data":"dataTypeId","title":it.util.i18n("Admin_guidePanel_Asset_model")},
				{"data":null, "width": "50px","orderable":false,"className":'operationCol'}
			],
			columnDefs: [
				{
					targets:-1,
					render: function (a, b, c, d) {
						var html = '<a class="settings"></a>';
                        return html;
                    }
				}
			],
	        select: 'single',
	        processing: true,
	        scrollX: false,
	        scrollY: 500,
	        scrollCollapse: true,
	        paging: false,
	        buttons: []
	    });
		
		if(this._parentTable){
			var pTable = this._parentTable, deselectTimeout;
		    pTable.on( 'deselect', function (e, t, type, indexes) {
		    	if ( type === 'row' ) {
		    		parentId = undefined;
		    		// table.clear().draw();
		    		deselectTimeout = setTimeout(function(){
		    			parentId = undefined;
			    		table.ajax.reload().draw();
		    		},200);
		    	}
			} );
			pTable.on( 'select', function (e, t, type, indexes) {
		    	if ( type === 'row' ) {
		    		if(deselectTimeout){
		    			clearTimeout(deselectTimeout);
		    			deselectTimeout = undefined;
		    		}
		    		if(pTable.row(indexes[0]).data()){
		    			parentId = pTable.row(indexes[0]).data().id;
		    			table.ajax.reload().draw();
		    		}
		    	}
			} );
		}
		this._parentTable = table;
		var self = this;
		$('tbody', $table).on('click', 'a', function(event) {
			event.preventDefault();
			var arg = undefined;
			if(typeof section.link.command === 'object'){
				arg = section.link.command;
			} else {
				arg = {id:section.link.command};
			}
			
			arg.param = table.row($(this).parent()).data();
			it.tabPanel.show(arg);
		});
		this._tableCache[category] = table;
		return table;
	},
	createNav: function(parent){
		var doc = this._doc;
		var $nav = $('<div id="sectionNav" class="col-sm-3 bs-docs-sidebar"></div>').appendTo(parent);
		// var $nav = $('<nav id="sectionNav" calss="bs-docs-sidebar"></nav>').appendTo($navDiv);
		var f = function(obj, parent, cName){
			var $ul = $('<ul class="'+cName+'"></ul>').appendTo(parent);
			$.each(obj, function(index, val) {
				var $li = $('<li><a href="#'+index+'">'+val.title+'</a></li>').appendTo($ul);
				if(val.sub){
					f(val.sub, $li, 'nav');
				}
			});
		}
		f(doc, $nav, "nav");//bs-docs-sidebar
		return $nav;
	}
});
