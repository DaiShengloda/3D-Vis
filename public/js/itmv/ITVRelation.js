/**
 *  关系
 */
var $ITVRelation = function(parameters) {
    it.Base.call(this);
    parameters = parameters || {};
    if (typeof parameters === 'string') {
        parameters = {
            id: parameters
        };
    }
    this._id = parameters.id;
    this._name = parameters.name;
    this._typeId = parameters.typeId;
    this._fromId = parameters.fromId;
    this._toId = parameters.toId;
    this._calculate = parameters.calculate;
    this._description = parameters.description;
};

mono.extend($ITVRelation, it.Base, {
    ___accessor: ['id', 'name','typeId','fromId','toId','description','calculate'],

    fromJson: function(json) {
        if (typeof json === 'string') {
            json = JSON.parse(json);
        }
        this._id = json.id;
        if (this._id) {
            this._id = this._id.trim();
        }
        this._name = json.name;
        this._typeId = json.typeId;
        if (this._typeId) {
            this._typeId = this._typeId.trim();
        }
        this._fromId = json.fromId;
        this._toId = json.toId;
        this._description = json.description;
        this._calculate = json.calculate;
    }
});

it.ITVRelation = $ITVRelation;