var $Page = main.Page = function(argument) {
	// 一些常用方法封装在Page里面
  this._view = this.create();
};
Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
mono.extend(main.Page, Object, {


	createField: function(property,parent){
   		var field = null;
   		var id = property.id || new Date().getTime();
	    var type = property.type;
        var style = property.style;
        var readonly = property.readonly;
        if(!readonly || type == 'label' || type == 'button'){
            if(type === 'textarea'){
      				field = this.createTextArea(id,property);
      			}else if(type === 'combobox'){
      				field = this.createComboBox(id,property,parent);
      			}else if(type === 'checkbox'){
      				field = this.createCheckbox(id,property);
      			}else if(type === 'datebox'){
              field = this.createDateBox(id,property,parent);
            }else if(type === 'datetimebox'){
              field = this.createDateBox(id,property,parent);
            }else if(type ==='button'){
      				field = this.createLinkButton(id,property.text,property.iconCls);
      			}else if(type === 'label'){
      				field = this.createLabel(id,property.text);
      			}else if(type === 'text'){
      				field = this.createTextBox(id,property,parent);
      			}else {
      				field = this.createOtherField(id,type,property,parent);
      			}
        }else{
        	field = this.createReadOnlyTextBox(id,property,parent);
        }
        
		if(parent){
			field.appendTo(parent);
		}
    field.type = type;
		if(style){
			for(var s in style){
				field.css(s,style[s]);
			}
		}
		return field;
	},

	createOtherField : function(id,type,property,parent){
       return this.createTextBox(id,property,parent);
	},

	getView: function() {
      return this._view;
	},

	createFields : function(properties,parent){
		var self = this;
		var fields = [];
        for(var p in properties){
        	fields.push(self.createField(properties[p],parent));
        }
        return fields;
	},

	createTableLayoutFields : function(properties,parent,colCount){
		colCount = colCount || 1;
        var table = $("<table width ='100%' border = '0'></table>").appendTo(parent);
        var fields = [],index = 1,row,field;
        fields.fieldMap = {};
        for(var p in properties){
        	if(index === 1){
               row = this.createTableRow(table);
        	}
        	var cell = $("<td></td>").appendTo(row)
        	field = this.createField(properties[p],cell);
        	fields.push(field);
          fields.fieldMap[properties[p].name] = field;
        	index ++;
        	if(index >= colCount){
        		index = 0;
        	}
        }
        return fields;
	},

	createDivWithFields : function(properties,parent){
        parent = parent || $("<div></div>");
        var id = new Date().getTime();
        var form = $("<form method = 'post' id = '" + id + "'></form>");
        var table = $("<table></table>").appendTo(parent);
        var map = {};
        for (var p in properties) {
	        var v = properties[p];
	        var tr = $("<tr></tr>").appendTo(table);
	        var td = $("<td></td>").appendTo(tr);
	        td.css("margin", "5px");
	        var label = $("<label for = '" + p + "'> " + v.text + ": </label>").appendTo(td);
	        var td = $("<td></td>").appendTo(tr);
	        td.css("padding", "5px");
	        var field = createField(v.type, p, v.required, v.readonly, td, v.options);
	        map[p] = field;
	    }
	    parent._fieldMap = map;
	    return parent;
	},

	disable : function(parent){

	},

	createLinkButton : function(id,text,iconCls){
		if(!iconCls){
			iconCls = 'add';
		}
		if(!iconCls.startsWith('icon-')){
			iconCls = 'icon-' + iconCls;
		}
        var button = $('<a>'+text+'</a>');
        this.invokeLater(button,button.linkbutton,{
        	iconCls: iconCls,
        });
        return button;
	},

	createLabel : function(id,text){
		var label = $("<label for = "+id+ ">" + text + "</label>");
		return label;
	},
    /**
     * parameters 支持：prompt，validType,required,width,height...
     * http://www.kuaipao8.com/?p=1290
     */
	createTextBox : function(id,parameters,parent){
		parameters = parameters || {};
		parameters.width = parameters.width || "100%";
		parameters.height = parameters.height || "25px";
		// parameters.required = true;
        var textBox = $("<input class = 'textbox'></input>");

        textBox.attr("id",id);
        if(parent){
        	textBox.appendTo(parent);
        	textBox.textbox(parameters);
          if(parameters.style){
           var style = parameters.style;
           for(var s in style){
            console.log(s);
            textBox.siblings().css(s,style[s]);
           }
        }
        }else{
            this.invokeLater(textBox,textBox.textbox,parameters);    
        }
        return textBox;
	},

	createReadOnlyTextBox : function(id,parameters,parent){
        parameters = parameters || {};
		parameters.width = parameters.width || "100%";
		parameters.height = parameters.height || "25px";
		// parameters.required = true;
        var textBox = $("<input class = 'textbox'></input>");
        textBox.attr("id",id);
        
        textBox.attr("readonly","readonly");
        textBox.css("borderWidth","0px");
        if(parent){
        	textBox.appendTo(parent);
        	textBox.textbox(parameters);
        	textBox.siblings().css("borderWidth","0px").css("borderRadius","0px").css("border-bottom-width","1px");
        }else{
            this.invokeLater(textBox,textBox.textbox,parameters);    
        }
        return textBox;
	},

	createTextArea : function(id,parameters){
        parameters = parameters || {};
        parameters.width = parameters.width || "100%";
        parameters.height = parameters.height || "100px";
        var textarea = $("<textarea class='easyui-validatebox textbox'></textarea>");
        textarea.attr("id",id);
        textarea.css("height",parameters.height);
        this.invokeLater(textarea,textarea.validatebox,parameters);
        return textarea;
	},

	createFileBox : function(id,parameters){
       
	},

	createCheckbox : function(id,parameters){
       var checkbox = $('<input type="checkbox" ></input>');
       if(id){
       	   checkbox.attr("id",id);
       }
       return checkbox;
	},

	getWidgetValue : function(widget,type){
       type = type || widget.type;
       if(type === 'checkbox'){
       	   return widget.val() == 'on';
       }else if(type === 'combobox'){
       	  return widget.combobox('getValue');
       }else if(type === 'datebox' || type === 'datetimebox'){
          var date =  widget.datebox('getValue');
          try{
            return new Date(Date.parse(date)).Format("yyyy-MM-dd");
          }catch(e){
            return null;
          };
       }else  {
       	  // return widget.val();
          return widget.textbox('getValue');
       }
	},

  // http://blog.163.com/luyufen_luise/blog/static/57773925201522441623176/
	setWidgetValue : function(widget,type,value){
        type = type || widget.type;
        if(type === "label" || type === "button"){
           return;
        }
        if(type === 'checkbox'){
           return widget.attr("checked",value);
       }else if(type === 'combobox'){
          return widget.combobox('setValue',value);
       }else if(type === 'datebox' || type === 'datetimebox'){
          // return widget.datebox('setValue',value)
          console.log(value);
          setTimeout(function(){
             // widget.datebox('setValue',"3/12/2016");
             if(value){
               widget.datebox('setValue',moment(value.replace('Z','').replace('T','')).format('MM/DD/YYYY'))
             }
          },2);
          return widget;
       }else {
          return widget.textbox('setValue',value);
       }
	},

	invokeLater : function(scope,func,parameters,timeout){
		var args = [];
		for(var i = 2;i < arguments.length;i ++){
           args.push(arguments[i]);
		}
        setTimeout(function(){
        	func.apply(scope,args);
        },timeout || 1);
	},

	invokeLater2 : function(scope,func,parameters){
        this.invokeLater(this,this.invokeLater,scope,func,parameters)
	},

	createValidateBox : function(id,parameters){
        parameters = parameters || {};
		parameters.width = parameters.width || "100%";
		parameters.height = parameters.height || "20px";
        var validateBox = $("<input class = 'easyui-validatebox textbox'></input>");
        validateBox.attr("id",id);
        validateBox.css("height",parameters.height);
        this.invokeLater(validateBox,validateBox.validatebox,parameters);    
        return validateBox;
	},

	filterParameters : function(parameters){
		parameters = parameters || {};
		parameters.width = parameters.width || "100%";
		parameters.height = parameters.height || "20px";
		return parameters;
	},

	createNumberBox : function(id,parameters){
        parameters = this.filterParameters(parameters);
        var numberbox = $('<input type="text" class="easyui-numberbox" ></input>');
        numberbox.attr("id",id);
        this.invokeLater(numberbox,numberbox.numberbox,parameters);
        return numberbox;
	},

	createDateBox : function(id,parameters,parent){
       parameters = this.filterParameters(parameters);
       var datebox = $('<input type="text" class="easyui-datebox">');
       datebox.attr("id",id);
       datebox.appendTo(parent);
       // datebox.datebox(parameters);
       this.invokeLater(datebox,datebox.datebox,parameters);
       return datebox;
	},

	createComboBox : function(id,parameters,parent){
        parameters = parameters || {};
        parameters.width = parameters.width || "100%";
		parameters.height = parameters.height || "30px";
		// parameters.mode = "remote"; 
        var combobox = $('<input id="'+ id+ '" >')
        if(parent){
        	combobox.appendTo(parent);
        	console.log(parent);
        }
        if(!parameters.loadFilter){
        	parameters.loadFilter = function(value){
                if(value.error){
                	alert(value.error);
                	return [];
                }else {
                	return value.rows || value.value || value;
                }
        	};
        }
        if(!parameters.filter){
        	parameters.filter = function(q,row){ 
               var opts=$(this).combobox("options"); 
               //return row[opts.textField].indexOf(q)==0;// 将从头位置匹配
               return row[opts.textField].indexOf(q)>-1 || row[opts.valueField].indexOf(q)>-1;//将从头位置匹配改为任意匹配 
             }
        }
        if(!parameters.formatter){
        	parameters.formatter = function(row){
        		var opts = $(this).combobox('options');
                return row[opts.valueField] + (row[opts.textField] ? ' - ' + row[opts.textField] : "");
        	};
        }

        // if(!parameters.onChange && !parameters.onHidePanel){
        // 	// http://www.cnblogs.com/azhqiang/p/4432648.html
        // 	var artChanged;
        // 	parameters.onChange =function (newValue, oldValue) {
        //         artChanged = true;//记录是否有改变（当手动输入时发生)
        //     },
        //     parameters.onHidePanel = function () {
        //         var t = $(this).combogrid('getValue');
        //         if (artChanged) {
        //             if (selectRow == null || t != selectRow.id) {//没有选择或者选项不相等时清除内容
        //                 alert('请选择，不要直接输入');
        //                 $(this).combogrid('setValue', '');
        //             } else {
        //             }
        //         }
        //         artChanged = false;
        //         selectRow = null;
        //     },
        // }
        combobox.combobox(parameters);
        // if(parent){
        	
        // }else{
        // 	 this.invokeLater(combobox,combobox.combobox,parameters);
        // }
        return combobox;
	},

	createTitleBorder : function(){
        return this.createFieldSet();
	},

	createFieldSet : function(title){
      var fieldSet = $("<FieldSet></FieldSet>")
	},

	createComboGrid : function(id,parameters){
       parameters = parameters || {};
       parameters.width = parameters.width || "100%";
       parameters.height = parameters.height || "20px";
       var combogrid = $('<input id="'+ id+ '">')
       this.invokeLater(combogrid,combogrid.combogrid,parameters);
       return combogrid;
	},

	createDataGrid : function(id,parameters,parent){
	   parameters = parameters || {};
       var datagrid = $('<table id="'+ id + '"></table>');
       parameters.loadFilter = parameters.loadFilter || function(value){
          if(value.error){
          	 alert(value.error);
          	 return [];
          }
          return value.value || value;
       };
       if(parent){
       	 datagrid.appendTo(parent);
       	 datagrid.datagrid(parameters);
       }else{
       	  this.invokeLater(datagrid,datagrid.datagrid,parameters);
       }
       
       return datagrid;
	},
    
	createAccordion : function(id,panels,parameters){
		panels = panels || [];
		parameters = parameters || {};
        var accordion = $("<div></div>");
        function initAccordion(){
           accordion.accordion(parameters);
           for(var i = 0;i < panels.length;i ++){
           	  accordion.accordion('add',{
           	  	title: panels[i].title,
	            content: panels[i].content,
           	  });
           }
        };
        this.invokeLater(null,initAccordion);
        return accordion;
	},

	createTableRow : function(parent){
       var tr = $("<tr></tr>");
       if(parent){
       	 tr.appendTo(parent);
       }
       return tr;
	},


	createTableCell : function(contentFunction,id,text){
       var func = this[contentFunction];
       var td = $("<td></td>");
       var args = [];
       for(var i = 1;i < arguments.length;i ++){
       	  args.push(arguments[i]);
       }
       var content = func.apply(this,args).appendTo(td);
       td.content = content;
       return td;
	},

  addBorder : function(view){
      view.css("margin","2px");
      view.css("marginBottom","5px");
      view.css("padding","3px");
      view.css("border","1px solid gray");
      return view;
  },

  getFieldProperty : function(attribute,required,width,height){
     var property = {};
     
     property.id = property.name = attribute.name;
     var type = attribute.type;
     if(type == "STRING"){
        property.type = "text";
     }else if(type == "BOOLEAN"){
        property.type = "checkbox";
     }else if(type == "DATEONLY"){
        property.type = "datebox";
     }else if(type == "DATE"){
       property.type = "datetimebox";
     }else{
        property.type = "text";
     }
     if(required){
        property.required = attribute.primaryKey;
     }
     property.width = width || "100px";
     property.height = height || "20px";
     property.style = {};
     property.style.marginLeft = "5px";
     property.style.marginRight = "5px";
     return property;
  },

	createPageTab: function(title, closable) {
		if(closable === undefined){
			closable = true;
		}
		var content = this.getView();
		var options = {
		     title: title,
			 content: content,
			 closable: closable,
		};
		return $("#tab").tabs("add", options)
	},

  closePageTab : function(title){
     $("#tab").tabs("close",title)
  },

  create : function(tag,id){
    	tag = tag || "div";
      var idtext = id ? (" id = '" + id + "' ") : "";
      return $("<" + tag +idtext+ "><" + tag + "/>")
  },

});