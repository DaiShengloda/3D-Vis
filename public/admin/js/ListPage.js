
var ListPage = main.ListPage = function (module) {
    this._module = module;
    this._id = module.id;
    this._name = module.text;
    $Page.call(this);
};

mono.extend(main.ListPage, main.Page, {
       initSearchBar : function(){
          this.addBorder(this._view);
          var columns = [],module = this._module;
          var id = "searchBar_" + module.id
          var searchBar = this.create("div",id).appendTo(this._view);
          this.addBorder(searchBar);
          var self = this,attribute;
          var fields = {};
          Object.keys(module.attributes).forEach(function (attrName){
               self.createLabel(null,attrName).appendTo(searchBar);
               attribute = module.attributes[attrName];
               if(attribute.type == 'DATE' || attribute.type == 'DATEONLY'){
                   var field = self.create('span').appendTo(searchBar);
                   fields[attrName] = field;
                   field.css("width","60px");
                   field.css("marginLeft","5px");
                   field.from = self.createField(self._getFieldProperty(attribute),field)
                   self.createLabel("","---").appendTo(field);
                   field.to = self.createField(self._getFieldProperty(attribute),field)
               }else{
                  var field = self.createField(self._getFieldProperty(attribute),searchBar);
                  fields[attrName] = field; 
               }
               field.attribute = attribute;
          });
          var searchButton = self.createLinkButton(id,"",'icon-search').appendTo(searchBar);
          searchButton.on('click',function(e){
             search();
          });
          function search(){
               var where = {};
               Object.keys(fields).forEach(function(name){
                   var field = fields[name];
                   if(field.from){
                      var fromDate = field.from.datebox('getValue');
                      var toDate = field.to.datebox('getValue');
                      if(fromDate && toDate){
                          fromDate = moment(fromDate).format('YYYY-MM-DD HH:mm:ss');
                          toDate = moment(toDate).format('YYYY-MM-DD HH:mm:ss');
                          where[name] = {$between:[fromDate,toDate]}
                      }else if(fromDate){
                          fromDate = moment(fromDate).format('YYYY-MM-DD HH:mm:ss');
                          where[name] = {$gte:fromDate}
                      }else if(toDate){
                          toDate = moment(toDate).format('YYYY-MM-DD HH:mm:ss');
                          where[name] = {$lte:toDate}
                      }
                      console.log(moment(fromDate).format('YYYY-MM-DD HH:mm:ss'),toDate);
                   }else{
                      if(fields[name].textbox('getValue')){
                        where[name] = {$like:"%" + fields[name].textbox('getValue') + "%"}
                      }
                   }
                   
               });

               self._dg.datagrid({
                  queryParams:{where:where}
               });
          }
       },

       refresh : function(){
           this._dg.datagrid("reload");
       },

       createList : function(){
            var datagridParent = this.create().appendTo(this._view);
            var columns = [],module = this._module;
            // columns.push({checkbox: true, resizable: true, field: '_____cb'});
            var module = this._module;
            var self = this;
            var dateFormatter = function(value,row,index){
                 if(value && value.replace){
                     return moment(value.replace('Z','').replace('T','')).format('YYYY-MM-DD HH:mm:ss')
                 }
                 return value;
            };
            Object.keys(module.attributes).forEach(function (attrName) {
                var attr = module.attributes[attrName];
                if (attr['hidden'] == true) {
                    return;
                }
                if(attr.type == "DATE" || attr.type == "DATEONLY"){
                   columns.push({field: attrName, title: attrName, width: null, sortable: true, resizable: true,formatter:dateFormatter});  
                }else{
                  columns.push({field: attrName, title: attrName, width: null, sortable: true, resizable: true})
                }
                
            })

            var toolbar = [{
                text:it.util.i18n("Admin_ListPage_Add"),
                iconCls:'icon-add',
                handler:function(){
                   console.log(module);
                   if(module.id === 'custom_table'){
                       var page = new main.AddDataInfoPage();
                       page.createPage();
                   }else{
                      var page = new AddPage(module,self);
                      page.createPage();
                   }
                }
            },'-',{
                text:it.util.i18n("Admin_ListPage_Edit"),
                iconCls:'icon-edit',
                handler : function(){
                   var row = self._dg.datagrid('getSelected');
                   if(row == null){
                     alert(it.util.i18n("Admin_ListPage_Please_Select"));
                     return;
                   }
                   if(module.id === 'custom_table'){
                       var page = new main.UpdateDataInfoPage(row.tableName);
                       page.createPage();
                   }else{
                      var page = new UpdatePage(module,row,self);
                      page.createPage();
                   }
                },
            },'-',{
                text:it.util.i18n("Admin_ListPage_Delete"),
                iconCls:'icon-remove',
                handler:function(){
                    var row = self._dg.datagrid('getSelected');
                    if(row == null){
                     alert(it.util.i18n("Admin_ListPage_Please_Select"));
                     return;
                    }
                   util.adminApi(module.id,"remove",row,function(result){
                        alert(it.util.i18n("Admin_ListPage_Delete_success"));
                        self._dg.datagrid("reload");
                   });
                }
            }];
        // parameters.toolbar = toolbar;
            var parameters = {
                title: module.text,
                columns: [columns],
                toolbar: toolbar,
                pagination: true,
                pageSize: 20,
                autoRowHeight: true,
                loader: function (param, success, error) {
                    param.page = param.page || 1;
                    param.rows = param.rows || 20;
                    param.offset = (param.page - 1) * param.rows;
                    param.limit = param.rows;
                    if (param.order) {
                        param.order = param.sort + ' ' + param.order
                    }
                    if (!param.where) {
                        param.where = {}
                    }
                    // if (options.args) {
                    //     param.where['modulePath'] = options.args.module.modulePath;
                    // }
                    util.adminApi(module.id, 'searchAndCount', param, function (data) {
                        data.total = data.count;
                        success(data)
                    }, error)
                },
                fitColumns: true,
                singleSelect: false,
                rownumbers: true,
                checkOnSelect: true,
                selectOnCheck: true,
                ctrlSelect: true,
                checkbox: true,
                onSelect: function (index, row) {
                    //如果是选中禁止编辑的字段,那么disabled编辑按钮和delete按钮
                    // if (row['fieldEditable'] === false) {
                    //     toolbar.find('a[iconcls="icon-edit"]').hide();
                    //     toolbar.find('a[iconcls="icon-remove"]').hide();
                    // } else {
                    //     toolbar.find('a[iconcls="icon-edit"]').show();
                    //     toolbar.find('a[iconcls="icon-remove"]').show();
                    // }
                }
            };
            this._dg = this.createDataGrid(this._id,parameters,datagridParent);
       },

       createPage : function(){
          this.initSearchBar();
          this.createList();
          return this.createPageTab(this._name);
       },

       _getFieldProperty : function(attribute){
         var property = {};
         property.id = property.name = attribute.field;
         var type = attribute.type;
         if(type == "STRING"){
            property.type = "text";
         }else if(type == "BOOLEAN"){
            property.type = "checkbox";
         }else if(type ==='DATE' || type === 'DATEONLY'){
             property.type = "datebox";
         }else{
            property.type = "text";
         }
         property.width = "100px";
         property.height = "20px";
         property.style = {};
         property.style.marginLeft = "5px";
         property.style.marginRight = "5px";
         return property;
       },
});