var AddPage = function (model,parentPage) {
    $Page.call(this);
    this._model = model;
    this.parentPage = parentPage;
};

mono.extend(AddPage, $Page, {
    createPage : function(){
       var view = this.getView();
       var rootDiv = this.create().appendTo(view);
       this.addBorder(rootDiv);
       var properties = this._getAddProperties();
       var fields = this.createTableLayoutFields(properties,rootDiv,2);
       var button = fields[properties.length - 1];
       var self = this;
       button.on("click",function(event){
         self._addData(fields,properties);
       });

       this._title = it.util.i18n("Admin_AddPage_Add") + this._model.text
       this.createPageTab(this._title);
    },

    _addData : function(fields,properties){
       var data = {},field = null,v,p;
       var chechMsg = "";
       for(var i = 0;i < fields.length - 2; i += 2){
           field = fields[i + 1];
           // v = field.textbox('getValue');
           v = this.getWidgetValue(field);
           p = properties[i + 1];
           data[p.id] = v;
           if(p.required && !v){
             chechMsg = p.name + " " + it.util.i18n("Admin_AddPage_Required");
           }
       }
       if(chechMsg){
          alert(chechMsg);
         return;
       }
       console.log(data);
       var self = this;
       it.util.adminApi(this._model.id,"add",data,function(result){
           console.log(result);
           self.closePageTab(self._title); 

           if(self.parentPage instanceof ListPage){
               self.parentPage.refresh();
           }
       });
    },

    _getAddProperties : function(){
       var properties = [];
       var model = this._model,attribute,self = this;
       Object.keys(model.attributes).forEach(function(attrName){
           attribute = model.attributes[attrName];
           attribute.name = attrName;
           properties.push({type:"label",text:attrName == 'id' ? it.util.i18n("Admin_AddPage_ID") : attrName});
           if(attrName == "id"){
              properties.push({
                type:"combobox",
                url : it.util.wrapUrl("/data/find"),
                valueField:"id",
                textField:"id",
                width:"80%",
                id:attrName
              });
           }else{
              properties.push(self.getFieldProperty(attribute,true,"80%","25px"));
           }
           
       });
       properties.push({type:"label",text:"",});
       properties.push({type:"button",text:it.util.i18n("Admin_AddPage_Add"),iconCls:'icon-add'});
       return properties;
    },
});