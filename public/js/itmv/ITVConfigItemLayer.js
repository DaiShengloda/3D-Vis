/**
 *  层
 */
var $ITVConfigItemLayer = function(parameters) {
    it.Base.call(this);
    parameters = parameters || {};
    if (typeof parameters === 'string') {
        parameters = {
            id: parameters
        };
    }
    // this._ii = parameters.ii;
    this._layerId = parameters.layerId;
    this._configItemId = parameters.configItemId;
    this._position = parameters.position || new mono.Vec3();
    this._description = parameters.description;
};

mono.extend($ITVConfigItemLayer, it.Base, {
    ___accessor: ['layerId', 'configItemId', 'position', 'description'],

    fromJson: function(json) {
        if (typeof json === 'string') {
            json = JSON.parse(json);
        }
        this._layerId = json.layerId;
        this._configItemId = json.configItemId;
        if (this._layerId) {
            this._layerId = this._layerId.trim();
        }
        if (this._configItemId) {
            this._configItemId = this._configItemId.trim();
        }
        if (json.position && (json.position.x !== undefined || json.position.y !== undefined || json.position.z !== undefined)) {
            this._position = new mono.Vec3(json.position.x || 0, json.position.y || 0, json.position.z || 0);
        } else if (mono.Utils.isArray(json.position)) {
            this._position = new mono.Vec3(json.position[0] || 0, json.position[1] || 0, json.position[2] || 0);
        }
        this._description = json.description;
    }
});

it.ITVConfigItemLayer = $ITVConfigItemLayer;