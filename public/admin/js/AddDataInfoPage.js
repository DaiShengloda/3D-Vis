var AddDataInfoPage = main.AddDataInfoPage = function(){
    this._title = it.util.i18n("Admin_AddDataInfoPage_Add_business_table");
};

mono.extend(AddDataInfoPage,main.Page,{
    createPage: function(){
        this._getDataInfoForm();
        return this.createPageTab(this._title);
    },
    getPage: function(){
        return this._getDataInfoForm();
    },
    _getDataInfoForm: function(){
        var props = [];
        var params = {valueField: 'id',url: pageConfig.urlPrex + '/api/category/search'}
        props.push({label:it.util.i18n("Admin_AddDataInfoPage_Category_ID"), id:'category',type:'select', params: params});
        props.push({label:it.util.i18n("Admin_AddDataInfoPage_Business_name"), id:'tableName'});
        props.push({label:it.util.i18n("Admin_AddDataInfoPage_Description"), id:'description', type: "textarea"});
        var self = this;
        var form = util.createForm(props, true, function(result){
            $.post(it.util.wrapUrl('/custom_table/add'), result, function(data, textStatus, xhr) {
                if (data.error) {
                    console.log(data.error);
                    util.msg(data.error);
                } else {
                    tabPanel.$panel.bootstrapTab('remove', 'addcustom_table');
                    var page = new main.UpdateDataInfoPage(data.value.tableName);
                    page.createPage();
                }
            });
        },{left:2,right:8});
        var v = it.validator;
        var opt = {
            category:{validators: [v.notEmpty('category')]},
            tableName:{validators: [v.notEmpty('tableName')]},
            description:{validators: [v.notEmpty('description')]},
        };
        util.initValidator(form, opt);
        this._view = form;
        return form;
    },
    createPage2 : function(){
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
        
        var div = this.createDivWithFields(this._getDataInfoFields());
        div.appendTo(leftDiv);
        div.css("margin","2px");
        div.css("marginBottom","5px");
        div.css("padding","3px");
        div.css("border","1px solid gray");

        leftDiv.css("margin","2px");
        leftDiv.css("padding","5px");
        leftDiv.css("border","1px solid gray");
        var self = this;

        

        var div2 = this.create().appendTo(div);
        var submitButton = this.createLinkButton("add-table",it.util.i18n("Admin_AddDataInfoPage_Save_business_table"),'icon-save').appendTo(div2);
        // submitButton.css("float","right");
        submitButton.css("margin","5px");

        
        submitButton.on('click',function(){
            var fieldMap = div._fieldMap;
            var tableName = fieldMap.tableName.val();
            var category = fieldMap.category.combobox('getValue');
            var description = fieldMap.description.val();

            if(!category){
            	alert(it.util.i18n("Admin_AddDataInfoPage_Input_category"));
            	return;
            }
            if(!tableName){
               alert(it.util.i18n("Admin_AddDataInfoPage_Input_business_name"));
               return;
            }  
            it.util.adminApi('custom.Table','add',data,
                function(result){
                    if(result.error){
                         console.log(result.error);
                         alert(result.error);
                      }else{
                         self.closePageTab(self._title);
                         var page = new main.UpdateDataInfoPage(result.value.tableName);
                         page.createPage();
                      }
                },
                 function(error){
	        	  	 console.log(error);
                     alert(error);
	        	  }
            );        
        });

        

        // var table2 = this.create("table").appendTo(leftDiv);
        // table2.css("width","100%");
        // table2.attr("showGrid",true);
        // var row2 = this.createTableRow(table2);

        // var col21 = $("<td width='50%'></td>").appendTo(row2);
        // var col22 = $("<td width='50%'></td>").appendTo(row2);

        // var leftGridDiv = this.create().appendTo(col21).css("margin","2px");

        // var rightDiv = this.create().appendTo(col22).css("margin","2px");
        
        // var datagrid = this._dg = this.createDataGrid('table-column',this._getDataGridProperties()).appendTo(leftGridDiv);
        
        // var leftDivGridButtonPane = $("<div></div>").appendTo(leftGridDiv);
        
        // // var labelName = this.createLabel("","字段类型:").appendTo(leftDivGridButtonPane);
        // // labelName.css("marginRight","5px");
        // // this.createColumnTypeCombobox("column-type").appendTo(leftDivGridButtonPane);
        // // var addButton = this.createLinkButton("add-column","增加字段",'icon-add').appendTo(leftDivGridButtonPane);
        
        // // addButton.css("marginLeft","5px");
        
        // var fields = this._createButtonPane(leftDivGridButtonPane);
        
        // var button = fields[4];
        // button.on("click",function(event){
        //     var name = fields[1].val();
        //     var type = fields[3].combobox('getValue');
        //     console.log(name,type);
        //     var rightFields = self._createRightPane(rightDiv);
        //     rightFields[1].val(name);
        //     rightFields[3].combobox('setValue',type)
        // });
        return this.createPageTab(this._title);
    },

    _createRightPane : function(rightDiv){
        var properties = [];
    	properties.push({type:"label",id:"1",text:it.util.i18n("Admin_AddDataInfoPage_Field_name")+":"});
    	properties.push({type:"text",id:"column-name2"});
    	properties.push({type:"label",id:"1",text:it.util.i18n("Admin_AddDataInfoPage_Field_type")+":"});
    	properties.push({type:"column_type_combobox",id:"column-type2",width:"100px",height:"20px"});
    	

    	properties.push({type:"label",text:it.util.i18n("Admin_AddDataInfoPage_Required")+":"});
    	properties.push({type:"checkbox",});

    	properties.push({type:"label",text:it.util.i18n("Admin_AddDataInfoPage_Default")+":"});
    	properties.push({type:"text",});

    	properties.push({type:"label",text:it.util.i18n("Admin_AddDataInfoPage_Unique")+":"});
    	properties.push({type:"checkbox",});

    	properties.push({type:"label",text:""});
    	properties.push({type:"button",id:"",text:it.util.i18n("Admin_AddDataInfoPage_Save"),iconCls:'icon-save'});
    	var  fields =  this.createTableLayoutFields(properties,rightDiv,2);
        var self = this;
        fields[11].on('click',function(){
           if(!self['custom.Table']){
               alert(it.util.i18n("Admin_AddDataInfoPage_Add_business_object"));
               return;
           }
           var tableName = self["custom.Table"].tableName; 
           var columnName = fields[1].val();
           var columnType = fields[3].combobox('getValue');
           var columnAllowNull = fields[5].val() != 'on';
           var columnDefaultValue = fields[7].val();
           var columnUnique = fields[9].val() == 'on';
           
            if(!columnName){
           	  alert(it.util.i18n("Admin_AddDataInfoPage_Input_field_name"));
           	  return;
            }
            data = {tableName:tableName,columnName:columnName,columnType:columnType,

	        	         columnAllowNull:columnAllowNull,columnDefaultValue:columnDefaultValue,columnUnique:columnUnique}
            // console.log(columnName,columnType,columnAllowNull,columnDefaultValue,columnUnique);
            it.util.adminApi('custom.Column','add',data,function(result){
                      console.log(result);
                      // self['custom.Table'] = result.value;
                      alert(it.util.i18n("Admin_AddDataInfoPage_Save_Success"));
            },function(error){
                     console.log(error);
                     alert(error);
            }
            );
        });
    	return fields;
    },

    _createButtonPane : function(leftDivGridButtonPane){
    	var properties = [];
    	properties.push({type:"label",id:"",text:it.util.i18n("Admin_AddDataInfoPage_Field_name")+":"});
    	properties.push({type:"text",id:"column-name",required:true});
    	properties.push({type:"label",id:"",text:it.util.i18n("Admin_AddDataInfoPage_Field_type")+":"});
    	properties.push({type:"column_type_combobox",required:true,id:"column-type",width:"100px",height:"20px"});
    	properties.push({type:"button",id:"",text:it.util.i18n("Admin_AddDataInfoPage_Add_field"),iconCls:'icon-add'});

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
    	// this.invokeLater(combobox,combobox.loadData,[
	    //       {text : "文本",value:"STRING"},
	    //       {text : "整数",value:"INT"},
	    // ],10);

 
             combobox.combobox("loadData",this._getColumnTypes());

        return combobox;
    },


    _getColumnTypes : function(){
    	return [
           {text:it.util.i18n("Admin_AddDataInfoPage_Text"),value:"STRING"},
           {text:it.util.i18n("Admin_AddDataInfoPage_Integer"),value:"INTEGER"},
           {text:it.util.i18n("Admin_AddDataInfoPage_Number"),value:"DECIMAL"},
           {text:it.util.i18n("Admin_AddDataInfoPage_Date"),value:"DATEONLY"},
           {text:it.util.i18n("Admin_AddDataInfoPage_Date_time"),value:"DATE"},
           {text:it.util.i18n("Admin_AddDataInfoPage_Boolean"),value:"BOOLEAN"},
    	];
    },


     // $("#" + id).datagrid({
     //        title: '应用系统列表',
     //        url: "./api/data.Data/findAndCountForEasyUI",
     //        columns: [[
     //            {
     //                field: 'id', title: "编号",
     //                // width:100,
     //            },
     //            {
     //                field: 'description', title: "描述", width: 500,
     //            },
     //        ]],
     //        onLoadSuccess: function () {
     //            console.log(arguments);
     //        },
     //        pagination: true,
     //    });

    _getDataGridProperties : function(){
        var parameters = {};
        parameters.title = it.util.i18n("Admin_AddDataInfoPage_Business_table_field");
        parameters.iconCls = "icon-edit";
        var self = this;
        var toolbar = [{
			text:'Add',
			iconCls:'icon-add',
			handler:function(){console.log(self._dg)}
		},'-',{
			text:'Remove',
			iconCls:'icon-remove',
			handler:function(){console.log(arguments)}
		}];
		// parameters.toolbar = toolbar;
        parameters.columns = [[
            {
            	field : "columnName",
            	title : it.util.i18n("Admin_AddDataInfoPage_Field_n"),
            	width:150,
            },
            {
            	field:"columnType",
            	title:it.util.i18n("Admin_AddDataInfoPage_Field_type"),
            	width:100,
            },
            {
            	field:"columnAllowNull",
            	title:it.util.i18n("Admin_AddDataInfoPage_Required"),
            	width:100,
            },
            {
                field:"columnDefaultValue",
                title:it.util.i18n("Admin_AddDataInfoPage_Default"),
                width:100,
            },
             {
                field:"columnUnique",
                title:it.util.i18n("Admin_AddDataInfoPage_Unique"),
                width:100,
            },
            
        ]];

        return parameters;

    },

    _getDataInfoFields: function(){
    	var fields = {};
    	fields["category"]= {text:it.util.i18n("Admin_AddDataInfoPage_Category_ID"),type:"combobox",required:true,options:{
    		valueField:"id",
    		textField:"description",
    		url:pageConfig.urlPrex+"/api/category/search"
    	}};
    	fields["tableName"] = {text: it.util.i18n("Admin_AddDataInfoPage_Business_name"), type: "text", required: true};
    	fields["description"] = {text: it.util.i18n("Admin_AddDataInfoPage_Description"), type: "textarea", required: true};

    	return fields;
    },


});
