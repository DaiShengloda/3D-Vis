
/**
 *  关系类型
 */
var $ITVRelationType = function (parameters) {
	it.Base.call(this);
	parameters = parameters || {};
    if(typeof parameters === 'string'){
       parameters = {id : parameters};
    }
	this._id = parameters.id;
	this._name = parameters.name;
    this._parameters = parameters.parameters;
    this._description = parameters.description;
};

mono.extend($ITVRelationType,it.Base,{
   ___accessor : ["id","name",'description','parameters'],

    fromJson : function(json){
        if(typeof json === 'string'){
            json = JSON.parse(json);
        }
        this._id = json.id;
        if (this._id) {
            this._id = this._id.trim();
        }
        this._name = json.name;
        this._parameters = json.parameters;
        this._description = json.description;
    }
    
});

it.ITVRelationType = $ITVRelationType;