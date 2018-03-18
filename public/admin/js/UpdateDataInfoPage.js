var UpdateDataInfoPage = main.UpdateDataInfoPage = function(tableName){
    this.tableName = tableName; 
};

mono.extend(UpdateDataInfoPage,main.Page,{

    requestTable : function(){
        var data = {where :{tableName:this.tableName}};
        var self = this;
        util.adminApi('custom_table','get',data,function(result){
            self.requestColumns(result);
        });
    },

    requestColumns : function(result){
        this.tableModel = result;
        var data = {where :{tableName:this.tableName}};
        var self = this;
        util.adminApi('custom_column','find',data,function(result){
             self.tableModel.columns = result;
             self.createPageCallback();
        });
    },
    
    createPage : function(){
      this.requestTable();  
    },

    createPageCallback : function(){
        var tableForm = this._getTableForm();
        var table = this._getCustomTable();
        var fieldForm = this._getFieldForm();
        var $view = this._view = $('<div></div>');

        $view.append(tableForm);
        $view.append(table);
        $view.append(fieldForm);
        return this.createPageTab(it.util.i18n("Admin_UpdateDataInfoPage_Update_business"));
    },
    _getTableForm: function(){
        var props = [], tm = this.tableModel;
        props.push({label:it.util.i18n("Admin_UpdateDataInfoPage_Category_ID"), id:'category',value:tm.category, readonly:true});
        props.push({label:it.util.i18n("Admin_UpdateDataInfoPage_Business_name"), id:'tableName',value:tm.tableName, readonly:true});
        props.push({label:it.util.i18n("Admin_UpdateDataInfoPage_Description"), id:'description',value:tm.description, readonly:true});
        var self = this;
        var form = util.createForm(props,{showSubmit:false,left:1,right:3});
        return $('<div class="it_row"></div>').append(form);
        // return form;
    },
    _getFieldForm: function(){
        var props = [];
        props.push({label:it.util.i18n("Admin_UpdateDataInfoPage_Field_name"), id:'columnName'});
        props.push({label:it.util.i18n("Admin_UpdateDataInfoPage_Field_type"), id:'columnType',type:'select',items:this._getColTypes()});
        props.push({label:it.util.i18n("Admin_UpdateDataInfoPage_Required"), id:'columnAllowNull',type:'checkbox'});
        props.push({label:it.util.i18n("Admin_UpdateDataInfoPage_Default"), id:'columnDefaultValue'});
        props.push({label:it.util.i18n("Admin_UpdateDataInfoPage_Unique"), id:'columnUnique',type:'checkbox'});
        var self = this;
        var form = util.createForm(props,true,function(result){
            console.log(result);
        },{left:1,right:3});
        var v = it.validator;
        var opt = {
            columnName:{validators: [v.notEmpty('category')]},
            columnType:{validators: [v.notEmpty('tableName')]},
        };
        util.initValidator(form, opt);
        // return form;
        return $('<div class="it_row"></div>').append(form);
    },
    _getCustomTable: function(){
        var $table = $('<table class="table table-striped table-bordered" cellspacing="0" width="100%"></table>');
        $table.DataTable({
            dom: "Bfrtip",
            // ajax: {}
            columns: [
                { data: 'columnName',"title": it.util.i18n("Admin_UpdateDataInfoPage_Field_n")},
                { data: "columnType","title": it.util.i18n("Admin_UpdateDataInfoPage_Field_type")},
                { data: "columnAllowNull","title": it.util.i18n("Admin_UpdateDataInfoPage_Required") },
                { data: "columnDefaultValue","title": it.util.i18n("Admin_UpdateDataInfoPage_Default") },
                { data: "columnUnique","title": it.util.i18n("Admin_UpdateDataInfoPage_Unique") }
            ]
        });
        // return $table;
        return $('<div class="it_row"></div>').append($table);
    },

    createPageCallback2 : function(){
        var rootDiv = $("<div></div>");
        rootDiv.css("width","100%");
        var table = $("<table></table>").appendTo(rootDiv);
        table.css("width","100%");
        table.css("border","1px");
        var row = this.createTableRow(table);
        var col1 = $("<td width='100%'></td>").appendTo(row);
        var col2 = $("<td width='0%'></td>").appendTo(row);
        var leftDiv = $("<div></div>").appendTo(col1);
        var rightDiv = $("<div></div>").appendTo(col2);
        this._view = rootDiv;
        
        var div = this.create(); // this.createDivWithFields(this._getDataInfoFields());
        var tableFields = this._createTablePane(div);
        
        tableFields[1].textbox("setValue",this.tableModel.category);
        tableFields[3].textbox("setValue",this.tableModel.tableName);
        tableFields[5].val(this.tableModel.description);

        div.appendTo(leftDiv);
        div.css("margin","2px");
        div.css("marginBottom","5px");
        div.css("padding","3px");
        div.css("border","1px solid gray");

        leftDiv.css("margin","2px");
        leftDiv.css("padding","5px");
        leftDiv.css("border","1px solid gray");
        var self = this;


        

        var table2 = this.create("table").appendTo(leftDiv);
        table2.css("width","100%");
        table2.attr("showGrid",true);
        var row2 = this.createTableRow(table2);

        var col21 = $("<td width='100%'></td>").appendTo(row2);
        var col22 = $("<td width='0%'></td>").appendTo(row2);

        var leftGridDiv = this.create().appendTo(col21).css("margin","2px");

        var rightDiv = this.create().appendTo(col22).css("margin","2px");
        
        var datagrid = this._dg = this.createDataGrid('table-column',this._getDataGridProperties(),leftGridDiv);
        datagrid.datagrid("loadData",{rows:this.tableModel.columns});
        var leftDivGridButtonPane = $("<div></div>").appendTo(leftGridDiv);
        
        
        leftDivGridButtonPane.css("margin","2px");
        leftDivGridButtonPane.css("marginTop","10px");
        leftDivGridButtonPane.css("padding","6px");
        leftDivGridButtonPane.css("border","1px solid gray");

        var fields = this._createRightPane(leftDivGridButtonPane);

        return this.createPageTab(it.util.i18n("Admin_UpdateDataInfoPage_Update_business"));
    },

    _createTablePane : function(div){
        var properties = [];
        properties.push({type:"label",text:it.util.i18n("Admin_UpdateDataInfoPage_Category_ID")+":"});
        properties.push({type:"text",readonly:true});
        properties.push({type:"label",text:it.util.i18n("Admin_UpdateDataInfoPage_Business_name")+":"});
        properties.push({type:"text",readonly:true});
        properties.push({type:"label",text:it.util.i18n("Admin_UpdateDataInfoPage_Description")+":"});
        properties.push({type:"text",id:"description",required:true});
        return this.createTableLayoutFields(properties,div,2);
    },



    _createRightPane : function(rightDiv){
        var properties = [];
    	properties.push({type:"label",id:"1",text:it.util.i18n("Admin_UpdateDataInfoPage_Field_name")+":",required:true});
    	properties.push({type:"text",id:"column-name2"});
    	properties.push({type:"label",id:"1",text:it.util.i18n("Admin_UpdateDataInfoPage_Field_type")+":",required:true});
    	properties.push({type:"column_type_combobox",id:"column-type2",width:"100px",height:"20px"});
    	

    	properties.push({type:"label",text:it.util.i18n("Admin_UpdateDataInfoPage_Required")+":"});
    	properties.push({type:"checkbox",});

    	properties.push({type:"label",text:it.util.i18n("Admin_UpdateDataInfoPage_Default")+":"});
    	properties.push({type:"text",});

    	properties.push({type:"label",text:it.util.i18n("Admin_UpdateDataInfoPage_Unique")+":"});
    	properties.push({type:"checkbox",});

    	properties.push({type:"label",text:""});

    	properties.push({type:"button",id:"",text:it.util.i18n("Admin_UpdateDataInfoPage_Add_field"),iconCls:'icon-save'});
    	var  fields =  this.createTableLayoutFields(properties,rightDiv,2);
        var self = this;
        fields[11].on('click',function(){
           if(!self.tableModel){
               alert(it.util.i18n("Admin_UpdateDataInfoPage_Add_business_object"));
               return;
           }
           var tableName = self.tableModel.tableName; 
           var columnName = fields[1].val();
           var columnType = fields[3].combobox('getValue');
           var columnAllowNull = !fields[5].prop('checked');
           var columnDefaultValue = fields[7].val();
           var columnUnique = !!fields[9].prop('checked');
           
       
            if(!columnName){
           	  alert(it.util.i18n("Admin_UpdateDataInfoPage_Input_field_name"));
           	  return;
            }
            columnDefaultValue = self._getDefaultValue(columnType,columnDefaultValue);
            $.ajax({
	        	  url : pageConfig.urlPrex+'/api/custom_column/add',
	        	  data : {tableName:tableName,columnName:columnName,columnType:columnType,
	        	         columnAllowNull:columnAllowNull,columnDefaultValue:columnDefaultValue,columnUnique:columnUnique},
	        	  success:function(result){
                      if(result.error){
                        alert(result.error);
                        return;
                      }
                      fields[1].val('');
                      fields[3].combobox('setValue',null);

                      self._dg.datagrid("appendRow",result.value);
                      alert(it.util.i18n("Admin_UpdateDataInfoPage_Add_success"));
	        	  },
	        	  error : function(error){
	        	  	 console.log(error);
                     alert(error);
	        	  },
	        });
        });
    	return fields;
    },

    _getDefaultValue : function(columnType,columnDefaultValue){
        if(columnType == "DATE" || columnType == "DATEONLY"){
            if(!columnDefaultValue){
                return null;
            }
            try{
               return Date.parse(columnDefaultValue);
            }catch(e){
               return null;
            }
        }else if(columnType == "INTEGER" || columnType == "DECIMAL"){
            try{
                return parseFloat(columnDefaultValue);
            }catch(e){ 
                return null;
            }
        }
        return columnDefaultValue;
    },

    _createButtonPane : function(leftDivGridButtonPane){
    	var properties = [];
    	properties.push({type:"label",id:"",text:it.util.i18n("Admin_UpdateDataInfoPage_Field_name")+":"});
    	properties.push({type:"text",id:"column-name",required:true});
    	properties.push({type:"label",id:"",text:it.util.i18n("Admin_UpdateDataInfoPage_Field_type")+":"});
    	properties.push({type:"column_type_combobox",required:true,id:"column-type",width:"100px",height:"20px"});
    	properties.push({type:"button",id:"",text:it.util.i18n("Admin_UpdateDataInfoPage_Add_field"),iconCls:'icon-add'});

    	return this.createTableLayoutFields(properties,leftDivGridButtonPane,5);
    },


    createOtherField : function(id,type,property,parent){
         if(type === 'column_type_combobox'){
         	 return this.createColumnTypeCombobox(id,parent);
         }
    },

    createColumnTypeCombobox : function(id,parent){
        var combobox = this.createComboBox(id,{width:"150px",height:"20px"},parent);
        combobox.css("margin","5px");
        combobox.combobox("loadData",this._getColumnTypes());

        return combobox;
    },
    _getColTypes : function(){
        return [
           {label:it.util.i18n("Admin_UpdateDataInfoPage_Text"),value:"STRING"},
           {label:it.util.i18n("Admin_UpdateDataInfoPage_Integer"),value:"INTEGER"},
           {label:it.util.i18n("Admin_UpdateDataInfoPage_Number"),value:"DECIMAL"},
           {label:it.util.i18n("Admin_UpdateDataInfoPage_Date"),value:"DATEONLY"},
           {label:it.util.i18n("Admin_UpdateDataInfoPage_Date_time"),value:"DATE"},
           {label:it.util.i18n("Admin_UpdateDataInfoPage_Boolean"),value:"BOOLEAN"},
        ];
    },

    _getColumnTypes : function(){
    	return [
           {text:it.util.i18n("Admin_UpdateDataInfoPage_Text"),value:"STRING"},
           {text:it.util.i18n("Admin_UpdateDataInfoPage_Integer"),value:"INTEGER"},
           {text:it.util.i18n("Admin_UpdateDataInfoPage_Number"),value:"DECIMAL"},
           {text:it.util.i18n("Admin_UpdateDataInfoPage_Date"),value:"DATEONLY"},
           {text:it.util.i18n("Admin_UpdateDataInfoPage_Date_time"),value:"DATE"},
           {text:it.util.i18n("Admin_UpdateDataInfoPage_Boolean"),value:"BOOLEAN"},
    	];
    },

    _getDataGridProperties : function(){
        var parameters = {};
        parameters.title = it.util.i18n("Admin_UpdateDataInfoPage_Business_field");
        parameters.iconCls = "icon-edit";
        parameters.singleSelect = true;
        var self = this;
        var toolbar = ['-',{
			text:it.util.i18n("Admin_UpdateDataInfoPage_Delete"),
			iconCls:'icon-remove',
			handler:function(){
               var row = self._dg.datagrid('getSelected');
               var index = self._dg.datagrid('getRowIndex',row);
               var url = pageConfig.urlPrex+'/api/custom_column/remove';
               $.ajax({
                  url : url,
                  data :row,
                  success : function(value){
                      if(value.error){
                        alert(value.error);
                        console.log(value.error);
                        return;
                      }
                      if(value.value){
                        self._dg.datagrid('deleteRow',index);
                        alert(it.util.i18n("Admin_UpdateDataInfoPage_Delete_success"));
                      }

                  },
               });
            }
		}];
		parameters.toolbar = toolbar;
        parameters.columns = [[
            {
            	field : "columnName",
            	title : it.util.i18n("Admin_UpdateDataInfoPage_Field_n"),
            	width:150,
            },
            {
            	field:"columnType",
            	title:it.util.i18n("Admin_UpdateDataInfoPage_Field_type"),
            	width:100,
            },
            {
            	field:"columnAllowNull",
            	title:it.util.i18n("Admin_UpdateDataInfoPage_Required"),
            	width:100,
            },
            {
                field:"columnDefaultValue",
                title:it.util.i18n("Admin_UpdateDataInfoPage_Default"),
                width:100,
            },
             {
                field:"columnUnique",
                title:it.util.i18n("Admin_UpdateDataInfoPage_Unique"),
                width:100,
            },
            
        ]];

        return parameters;

    },

    _getDataInfoFields: function(){
    	var fields = {};
    	fields["category"]= {text:it.util.i18n("Admin_UpdateDataInfoPage_Category_ID"),type:"combobox",required:true,options:{
    		valueField:"id",
    		textField:"description",
    		url:pageConfig.urlPrex+"/api/category/search"
    	}};
    	fields["tableName"] = {text: it.util.i18n("Admin_UpdateDataInfoPage_Business_name"), type: "text", required: true};
    	fields["description"] = {text: it.util.i18n("Admin_UpdateDataInfoPage_Description"), type: "textarea", required: true};

    	return fields;
    },

});
