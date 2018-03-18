var Form = function(properties,parameters){
    var form = this.form = $("<form class='form-horizontal'></form>");
    this.properties = properties;
    this.parameters = parameters || {};
    this.initFields();
};

Form.prototype.initFields = function() {
    var properties = this.properties;
    var fields = this.fields = {};
    var self = this;
    properties.forEach(function(property){
        fields[name] = self.createFieldGroup(property).field;
    });
};

Form.prototype.createFieldGroup = function(property) {
   var labelText = property.label,
       type = property.type,
       name = property.name,
       readonly = property.readonly,
       value = property.value,
       required = property.required;
    var form = this.form;
    var group = $('<div class="form-group form-group-sm"></div>').appendTo(form);
    var label = $('<label class="col-sm-4 control-label" labelFor = "' +name+ '>' + labelText +'<label>').appendTo(group);
    
    // function createInput

    return group;
};

Form.prototype.createField = function(type,parent) {
    var field = null;
    if(type === 'textarea'){
      field = $()
    }else if(type === 'text'){
      field = $('<input class="form-control"></input>').appendTo(parent);
    }else if(type === 'combobox'){

    }

};

Form.prototype.getDatas = function() {
    
};

// function createField(labelText,type,parent,params){
//           var div = $('<div class="form-group form-group-sm"></div>').appendTo(parent);
//           var label = $("<label class='col-sm-4 control-label'>" + labelText + "</label>").appendTo(div);
//           var div2 = $('<div class="col-sm-8"></div>').appendTo(div);
//           var field = null;
//           if(type === 'textarea'){
//              field = $('<textarea class="form-control" rows="3"></textarea>').appendTo(div2);
            

//           } else if(type === 'combobox'){
//              field = $('<select class="form-control"><select>').appendTo(div2);
//              // $('<option>1</option>').appendTo(field);
//              if(params.url && params.valueField){
//                 $.post(params.url,function(data,textStatus,xhr){
//                     if(data.value && data.value.length){
//                         data.value.forEach(function(v){
//                            var val = v[params.valueField];
//                            if(val){
//                               var text = v[params.textField] +"-"+ val;
//                               $('<option value = ' + v[params.valueField]+'>' +text+'</option>').appendTo(field);
//                            }
//                         });
//                     }
//                     if(params.value){
//                         field.val(params.value);
//                     }
//                 });
//              }
//           }else{
//              field = $("<input class='form-control'></input>").appendTo(div2);
//           }
          
//           if(params.readonly){
//             field.attr("readonly",true);
//             field.attr("disabled",true);
//           }
//           if(params.value){
//             field.val(params.value);
//           }
//           return field;
//         };


// var $Form = main.Form = function(properties,parameters) {
// 	var rootView = this._rootView = this.create();
// 	this.createTable().appendTo(rootView);
    
//     this._properties = properties || [];
// 	this._columnCount = parameters.columnCount || 1;
// 	this._dirty = true;
// };

// mono.extend($Form,main.Page,{
//     getRootView : function(){
//        if(this._dirty){
//        	  this.createContent();
//        	  this._dirty = false;
//        }
//        return this._rootView;
//     },

//     getTable : function(){
//     	return this._table;
//     },

//     getColumnCount : function(){
//     	return this._columnCount;
//     },

//     setColunnCount : function(columnCount){
//     	this._columnCount = columnCount;
//     },

//     addProperty : function(property){
//        this._properties.push(property);
//     },

//     createTable : function(){
//     	var table = this._table = $("<table></table>");
//     	table.css("width","100%");
//         table.css("border","1px");
//         return table 
//     },

//     getValue : function(name){
       
//     },

//     getValueMap : function(){

//     },

//     getValues : function(){

//     },

//     createContent : function(){
//        this.table.empty();
//     },
// });