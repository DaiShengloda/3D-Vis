/**
 *  层
 */
var $ITVLayer = function(parameters) {
    it.Base.call(this);
    parameters = parameters || {};
    if (typeof parameters === 'string') {
        parameters = {
            id: parameters
        };
    }
    this._id = parameters.id;
    this._name = parameters.name;
    this._model = parameters.model;
    this._modelParameters = parameters.modelParameters;
    this._height = parameters.height;
    this._isVertical = parameters.isVertical;
    this._description = parameters.description;
    this._configItems = new mono.List();
    this._relations = new mono.List();
};

mono.extend($ITVLayer, it.Base, {
    ___accessor: ['id', 'name','model','modelParameters','height', 'isVertical', 'description'],

    addConfigItem: function (configItem) {
        if (configItem && !this._configItems.contains(configItem)) {
            this._configItems.add(configItem);//这个list竟然不去重，
        }
    },

    addConfigItems: function (configItems) {
        if (!configItems || configItems.length < 1) {
            return;
        }
        for (var i = 0; i < configItems.length; i++) {
            var configItem = configItems[i];
            this.addConfigItem(configItem);
        }
    },

    removeConfigItem: function (configItem) {
        this._configItems.remove(configItem);
    },

    getConfigItem: function () {
        return this._configItems;
    },

    addRelation : function(relation){
        if (relation && !this._relations.contains(relation)) {
            this._relations.add(relation);//这个list竟然不去重，
        }
    },

    addRelations : function(relations){
        if (!relations || relations.length < 1) {
            return;
        }
        for (var i = 0; i < relations.length; i++) {
            var relation = relations[i];
            this.addRelation(relation);
        }
    },

    removeRelation : function(relation){
        this._relations.remove(relation);
    },

    getRelations : function(){
        return this._relations;
    },

    fromJson: function(json) {
        if (typeof json === 'string') {
            json = JSON.parse(json);
        }
        this._id = json.id;
        if (this._id) {
            this._id = this._id.trim();
        }
        this._name = json.name;
         this._model = json.model;
        this._modelParameters = json.modelParameters;
        this._height = json.height;
        this._height = json.height;
        this._isVertical = json.isVertical;
        this._description = json.description;
    }
});

it.ITVLayer = $ITVLayer;