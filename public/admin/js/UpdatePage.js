var UpdatePage = function (model,data,parentPage) {
	$Page.call(this);
    this._model = model;
    this._data = data;
    this.parentPage = parentPage;
};
mono.extend(UpdatePage,$Page,{
	requestData: function(){
		var model = this._model;
		var self = this
		util.adminApi(model.id,"get",{where:this._data},function(result){
            self.createPageCallback(result); 
		});
	},
    
    createPageCallback : function(result){
    	console.log(result);
       var view = this.getView();
       var rootDiv = this.create().appendTo(view);
       this.addBorder(rootDiv);
       var properties = this._getUpdateProperties();
       var fields = this.createTableLayoutFields(properties,rootDiv,2);
       var button = fields[properties.length - 1];
       var self = this;
       button.on("click",function(event){
         self._updateData(fields,properties);
       });
       Object.keys(fields.fieldMap).forEach(function(name){
       	  var field = fields.fieldMap[name];
       	  self.setWidgetValue(field,null,result[name]);
       });
       this._title = it.util.i18n("Admin_UpdatePage_Update") + this._model.text
       this.createPageTab(this._title);
    },

    createPage : function(){
        this.requestData();
    },

    _updateData : function(fields,properties){
       var data = {},field = null,v,p;
       var chechMsg = "";
       for(var i = 0;i < fields.length - 2; i += 2){
           field = fields[i + 1];
           // v = field.textbox('getValue');
           v = this.getWidgetValue(field);
           p = properties[i + 1];
           data[p.id] = v;
           if(p.required && !v){
             chechMsg = p.name + " " + it.util.i18n("Admin_UpdatePage_Required");
           }
       }
       if(chechMsg){
          alert(chechMsg);
         return;
       }
       console.log(data);
       var self = this;
        util.adminApi(this._model.id,"update",{value:data,options:this._data},function(result){
         	 self.closePageTab(self._title);
         	 if(self.parentPage instanceof ListPage){
               self.parentPage.refresh();
             }
        });
    },

    _getUpdateProperties : function(){
       var properties = [];
       var model = this._model,attribute,self = this;
       Object.keys(model.attributes).forEach(function(attrName){
           attribute = model.attributes[attrName];
           attribute.name = attrName;
           properties.push({type:"label",text:attrName == 'id' ? it.util.i18n("Admin_UpdatePage_ID") : attrName});
           var property = self.getFieldProperty(attribute,true,"80%","25px");
           property.readonly = attribute.primaryKey;
           if(property.readonly){
           	  property.required = false
           }
           properties.push(property);
           
       });
       properties.push({type:"label",text:"",});
       properties.push({type:"button",text:it.util.i18n("Admin_UpdatePage_Update"),iconCls:'icon-edit'});
       return properties;
    },
});