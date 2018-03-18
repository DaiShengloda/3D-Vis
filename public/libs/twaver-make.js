(function (window, undefined) {

/**
 *
 * make 注册模型的规范
 *  所有实例化对象时,传入的参数,必须在modelDefaultParameters中定义, 显示定义注册模型时,除了必须的模型id以为的所有参数.参数可以指定hidden,editable来达到隐藏或禁止修改.
 *  如果是为了编辑3D的而注册的2D模型, 参数格式必须按照3D的格式来定义
 *  position location rotation 等可以定义为数组
 *  尺寸命名为 width height depth
 *
 *  property
 *  id: 属性名
 *  name: 显示的label, id的别名
 *  value: 默认值
 *  type: string int number color image
 *  propertyType: field  accessor client style
 *  hidden: true(隐藏) false(显示)  默认值是false,显示
 *  editable: true(可以编辑) false(禁止编辑) 默认值是true, 默认可以编辑
 *  exportable: true(导出) false(不导出) 默认值true, 可以导出
 *  index 显示顺序,默认值 100
 */
if (!window.make) {
    var make = window.make = {};
    //default里面提供的模型注册机制，模型描述对象

    //{id, creator} creator is a function or a string
    var _creatorMap = {};
    var _creatorCategoryMap = {};
    var _categories = [];

    // {description:,name : ,modelDefaultParameters:{},type:,category:,icon:,async:,}
    var _parametersMap = {};
    make.Default = {
        path: './',

        resPath: '',

        getImagePath: function (image) {
            return this.path + this.resPath + 'res/images/' + (image || '');
        },

        register: function (id, creator, parameters) {
            parameters = parameters || {};
            parameters.name = parameters.name || id;
            parameters.modelDefaultParameters = parameters.modelDefaultParameters || {};
            parameters.description = parameters.description || parameters.name;
            if (_creatorMap[id]) {
                console.log(id, ' already exist');
            }
            _creatorMap[id] = creator;
            var category = parameters.category || "";
            var map = _creatorCategoryMap[category] || {};
            map[id] = creator;
            _creatorCategoryMap[category] = map;
            _parametersMap[id] = parameters;
            if (_categories.indexOf(category) == -1) {
                _categories.push(category);
            }
            this.checkModelDefaultParameters(parameters.modelDefaultParameters);
        },

        /**
         *
         * default property name is property id
         * default property value type is make.Default.PARAMETER_TYPE_STRING
         * default property type is make.Default.PARAMETER_PROPERTY_TYPE_CLIENT
         * default property category is 'attributes'
         * default property editable is true
         */
        checkModelDefaultParameters: function (modelDefaultParameters) {

            if (!modelDefaultParameters) {
                return;
            }
            for (var p in modelDefaultParameters) {
                var v = modelDefaultParameters[p];
                if (!(v instanceof Object)) {
                    v = { value: v }
                    modelDefaultParameters[p] = v;
                }
                v.propertyName = p;
                v.hidden = !!v.hidden;
                v.propertyType = v.propertyType || make.Default.PARAMETER_PROPERTY_TYPE_FIELD;
                v.type = v.type || make.Default.PARAMETER_TYPE_STRING;
                v.category = v.category || make.Default.PARAMETER_CATEGORY_DETAIL;
                v.editable = v.editable === undefined ? true : !!v.editable;
                v.index = v.index === undefined ? 100 : parseInt(v.index);
            }
        },

        remove: function (id) {
            if (!_creatorMap[id]) {
                console.log(id, ' not exist');
            } else {
                _creatorMap[id] = undefined;
                delete _creatorMap[id];

                var category = make.Default.getCategory(id);
                var map = _creatorCategoryMap[category];
                delete map[id];

                var count = 0;
                for (var i in map) {
                    if (i) {
                        count++;
                    }
                }
                if (count == 0) {
                    for (var i = 0; i < _categories.length; i++) {
                        var index = _categories.indexOf(category);
                        if (index >= 0) {
                            _categories.splice(index, 1);
                        }
                    }
                }

                delete _parametersMap[id];
            }
        },

        getCategories: function () {
            return _categories;
        },

        getCreatorsForCategory: function (category) {
            return _creatorCategoryMap[category];
        },

        getCreator: function (id) {
            // return this._creators[id];
            return _creatorMap[id];
        },

        getIds: function (filterFunction) {
            var ids = [];
            for (var id in _creatorMap) {
                if (!filterFunction || (filterFunction && filterFunction(this.getParameters(id)))) {
                    ids.push(id);
                }
            }
            return ids;
        },

        getModelDefaultParameters: function (id) {
            var params = this.getParameters(id);
            return params.modelDefaultParameters;
        },

        getDescription: function (id) {
            var params = this.getParameters(id);
            return params.description;
        },

        getName: function (id) {
            var params = this.getParameters(id);
            return params.name;
        },

        getIcon: function (id) {
            var params = this.getParameters(id);
            return this.path + params.icon;
        },

        isAsync: function (id) {
            var params = this.getParameters(id);
            return params.async;
        },

        isCombo: function (id) {
            var params = this.getParameters(id);
            return params.combo;
        },

        getCategory: function (id) {
            var params = this.getParameters(id);
            return params.category;
        },

        getOrder: function (id) {
            var params = this.getParameters(id);
            return params.order || 0;
        },

        getType: function (id) {
            var params = this.getParameters(id);
            return params.type;
        },

        getOtherParameter: function (id, key) {
            var params = this.getParameters(id);
            return params[key];
        },

        registerIcon: function (id, icon) {
            var params = this.getParameters(id);
            if (!params) {
                return;
            }
            params.icon = icon;
            return params.icon;
        },

        registerDescription: function (id, description) {
            var params = this.getParameters(id);
            params.description = description;
            return params.description;
        },

        registerName: function (id, name) {
            var params = this.getParameters(id);
            params.name = name;
            return params.name;
        },

        registerOther: function (id, key, value) {

            var result = params[key];
            var params = this.getParameters(id);
            params[key] = value;
            if (key === 'modelDefaultParameters') {
                console.warn("rewrite modelDefaultParameters: id={0}, oldValue={}, newValue={}", id, result, value);
                this.checkModelDefaultParameters(value);
            }
            return result;
        },

        appendModelDefaultParameter: function (id, name, category, propertyType, type, hidden, editable) {
            var p = {
                name: name,
                category: category,
                propertyType: propertyType,

            }
        },

        getParameters: function (id) {
            return _parametersMap[id] || {};
        },

        load: function (object, callback, options) {
            var self = this;
            var options = options || {};
            var isRelation = options.isRelation;
            var jsonObjects;
            if (callback) {
                var cb = callback;
                callback = function (data) {
                    if (isRelation
                        && object instanceof Array
                        && object.length > 1
                        && data instanceof Array
                        && data.length > 1) {
                        this._relation(object, data)
                    }
                    cb(data);
                }
            }
            if (object instanceof Array) {
                var result = {};
                var total = 0;
                if (callback) {
                    var wraperCallback = function (result, data) {
                        var length = object.length;
                        return (function (data) {
                            result.datas = result.datas || [];
                            result.datas.push(data);
                            if (result._total === length) {
                                callback(result.datas);
                            }
                        })(data);
                    };
                    result._total = 0;
                    for (var i = 0; i < object.length; i++) {
                        var child = object[i];
                        this.load(child, function (obj1) {
                            result._total++;
                            wraperCallback(result, obj1);
                        });
                    }
                    return null;
                } else {
                    jsonObjects = [];
                    for (var i = 0; i < object.length; i++) {
                        var child = object[i];
                        var data = this.load(child);
                        if (data) {
                            jsonObjects.push(data);
                        }

                    }
                }
            } else {
                var jsonObj = {};
                if (typeof (object) == 'string') {
                    jsonObj.id = object;
                } else {
                    jsonObj = object;
                }
                jsonObj = this.filterJson(jsonObj);
                if (callback) {
                    this._load(jsonObj, callback);
                } else {
                    jsonObjects = this._load(jsonObj);
                }

            }
            if (isRelation && jsonObjects instanceof Array && jsonObjects.length > 1) {
                this._relation(object, jsonObjects)
            }
            return jsonObjects;
        },

        _relation: function (objects, jsonObjects) {
            var map = {};
            jsonObjects.forEach(function (item) {
                if (item.getId) {
                    map[item.getId()] = item;
                }
            })
            objects.forEach(function (item) {
                if (item.objectId
                    && item.parentId
                    && map[item.objectId]
                    && map[item.parentId]
                    && map[item.objectId].setParent) {
                    map[item.objectId].setParent(map[item.parentId]);
                }
            })
        },

        _load: function (object, callback) {
            var id = object.id;
            var creator = this.getCreator(id);
            if (creator) {
                if (callback) {
                    creator(object, function (data) {
                        make.Default._setObjectClientId(data, id);
                        callback && callback(data);
                    }
                    )
                } else {
                    var createdObject = creator(object);
                    make.Default._setObjectClientId(createdObject, id);
                    return createdObject;
                }
            } else {
                console.log('unknown id: ', id);
                return null;
            }
        },

        _setObjectClientId: function (object, id) {
            if (object && object.setClient) {
                object.setClient('id', id);
            }
        },

        copyArray: function (from, to, ignores) {
            to = [];
            if (from) {
                var item, i = 0,
                    len = from.length;
                for (; i < len; i++) {
                    item = {};
                    this.copyProperties(from[i], item);
                    to.push(item);
                }
            }
            return to;
        },

        copyProperties: function (from, to, ignores) {
            if (from && to) {
                for (var name in from) {
                    if ((ignores && ignores.indexOf(name) >= 0) || name.indexOf('_') == 0) {
                        //ignore.
                    } else {
                        if (to[name] === undefined) {
                            if (from[name] instanceof Array) {
                                to[name] = [];
                            } else if (from[name] instanceof Function) {
                                to[name] = from[name];
                            } else if (from[name] instanceof Object) {
                                to[name] = {};
                            } else {
                                to[name] = from[name];
                            }
                        }
                        //不需要copy对象的function,如果引入ext的包，会导致死循环
                        if (!(from[name] instanceof Function) && from[name] instanceof Object && to[name] instanceof Object) {
                            make.Default.copyProperties(from[name], to[name]);
                        }
                    }
                }
            }
        },

        getModelDefaultParametersValues: function (id, filter) {
            var modelDefaultParameters = this.getModelDefaultParameters(id);
            var paras = {};
            for (var p in modelDefaultParameters) {
                var pi = modelDefaultParameters[p];
                if (filter && filter(pi)) {
                    continue;
                }
                if (pi.propertyType == make.Default.PARAMETER_PROPERTY_TYPE_CLIENT) {
                    paras.client = paras.client || {};
                    paras.client[p] = pi.value;
                } else if (pi.propertyType == make.Default.PARAMETER_PROPERTY_TYPE_STYLE) {
                    paras.style = paras.style || {};
                    paras.style[p] = pi.value;
                } else {
                    paras[p] = pi.value;
                }
            }
            return paras;
        },

        getModelDefaultParameterProperties: function (id, includeBasic) {

            var self = this;
            var result = [];
            var modelDefaultParameters = this.getModelDefaultParameters(id);
            if (!modelDefaultParameters) {
                return result;
            }
            if (includeBasic && !modelDefaultParameters['id']) {
                modelDefaultParameters['id'] = {
                    propertyName: 'id',
                    name: '模型ID',
                    category: make.Default.PARAMETER_CATEGORY_BASIC,
                    editable: false,
                    propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
                    type: make.Default.PARAMETER_TYPE_STRING,
                    exportable: false,
                    index: -2,
                }
            }
            if (includeBasic && !modelDefaultParameters['objectId']) {
                modelDefaultParameters['objectId'] = {
                    propertyName: 'objectId',
                    name: '实例ID',
                    category: make.Default.PARAMETER_CATEGORY_BASIC,
                    editable: false,
                    propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
                    type: make.Default.PARAMETER_TYPE_STRING,
                    exportable: false,
                    index: -1,
                }
            }

            for (var p in modelDefaultParameters) {
                result.push(modelDefaultParameters[p]);
            }

            result.sort(function (o1, o2) {
                return o1.index - o2.index;
            })

            result = result.map(function (item) {
                return self.modelParameterToProperty(item)
            });
            return result;
        },

        _getNameFromPropertyName: function (propertyName) {
            var names = propertyName.split('.');
            var name = '';
            for (var i = 0; i < names.length; i++) {
                if (names[i].length > 0) {
                    name += names[i].substring(0, 1).toUpperCase() + names[i].substring(1, names[i].length);
                }
                if (i < names.length - 1) {
                    name += ' ';
                }
            }
            return name;
        },

        modelParameterToProperty: function (param) {

            var property = new twaver.Property();
            property.setCategoryName(param.category);
            if (!param.name) {
                param.name = this._getNameFromPropertyName(param.propertyName);
            }
            property.setName(param.name);
            property.setEditable(param.editable);
            property.setPropertyType(param.propertyType);
            property.setPropertyName(param.propertyName);
            property.setValueType(param.type);
            property.setEnumInfo(param.enumInfo); //{map:{1:'male', 2:'female'}, values:[1, 2]}  or  ['male', 'female']
            property.isVisible = function () {
                return !param.hidden;
            }
            return property;
        },


        filterJson: function (object) {
            var modelDefaultParameters = this.getModelDefaultParameters(object.id);
            for (var p in modelDefaultParameters) {
                var propertyType = modelDefaultParameters[p].propertyType || 'client';
                var defaultValue = modelDefaultParameters[p].value;
                if (propertyType == make.Default.PARAMETER_PROPERTY_TYPE_STYLE) {
                    if (!object.style || object.style[p] === undefined) {
                        object.style = object.style || {};
                        object.style[p] = defaultValue;
                    }
                } else if (propertyType == make.Default.PARAMETER_PROPERTY_TYPE_CLIENT) {
                    if (!object.client || object.client[p] === undefined) {
                        object.client = object.client || {};
                        object.client[p] = defaultValue;
                    }
                } else if (object[p] === undefined) {
                    object[p] = defaultValue;
                }
            }
            //object.objectId = object.objectId || make.Default.id()
            return object;

        },

        UNIT_HEIGHT: 4.445,
        EQUIPMENT_WIDTH: 45.5,
        RACK_OFFSET_X: 7.25,
        RACK_OFFSET_Y: 6.655,
        RACK_WIDTH: 60,//this.RACK_OFFSET_X + this.EQUIPMENT_WIDTH + this.RACK_OFFSET_X
        getUnitHeight: function () {
            return this.UNIT_HEIGHT;
        },
        getEquipmentWidth: function () {
            return this.EQUIPMENT_WIDTH;
        },
        getEquipmentHeight: function (size) {
            if (!(parseInt(size) > 0)) {
                console.error('method getEquipmentHeight\'s first argument scale value is zero');
            }
            return this.UNIT_HEIGHT * size;
        },
        getRackWidth: function () {
            return this.RACK_WIDTH
        },
        getRackHeight: function (size) {
            if (!(parseInt(size) > 0)) {
                console.error('method getRackHeight\'s first argument scale value is zero');
            }
            return this.RACK_OFFSET_Y + this.UNIT_HEIGHT * parseInt(size) + this.RACK_OFFSET_Y;
        },

    }

    make.Default.toJson = function (object, filter) {
        if (object && object.getClient) {
            var id = object.getClient('id');
            var params = make.Default.getModelDefaultParameters(id);
            var json = {};
            var value = null, defaultValue = null;
            for (var p in params) {
                if (params[p].exportable === false) {
                    continue
                }
                var propertyType = params[p].propertyType;
                var defaultValue = params[p].value;
                if (propertyType == make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR) {
                    value = object[_twaver.getter(p)]()
                    if (!make.Default.equals(value, defaultValue)) {
                        json[p] = value;
                    }
                } else if (propertyType == make.Default.PARAMETER_PROPERTY_TYPE_FIELD) {
                    value = object[p]
                    if (!make.Default.equals(value, defaultValue)) {
                        json[p] = value;
                    }
                } else if (propertyType == make.Default.PARAMETER_PROPERTY_TYPE_STYLE) {
                    value = object.getStyle(p);
                    if (!make.Default.equals(value, defaultValue)) {
                        json.style = json.style || {};
                        json.style[p] = value;
                    }
                } else if (propertyType == make.Default.PARAMETER_PROPERTY_TYPE_CLIENT) {
                    value = object.getClient(p);
                    if (!make.Default.equals(value, defaultValue)) {
                        json.client = json.client || {};
                        json.client[p] = value;
                    }
                }
            }
            json.id = id;
            if (make.Default.EXPORT_OBJECT_ID) {
                json.objectId = object.getId();
            }
            if (filter) {
                json = filter(json);
            }
            return json;
        } else {
            if (filter) {
                object = filter(object);
            }
            return object;
        }
    }

    /**
     * 复制并注册新的模型
     * 如果data是一个function,直接调用,并且将json传入
     * options = {
     *     copyParamCoverage:false  //是否覆盖原来的属性. false 表示更新属性, true 表示覆盖整个 param 对象
     *     copyDefaultParamCoverage:false //是否覆盖原来的属性. false 表示更新, true 表示使用新的对象
     *     defaultValue: null //默认值, modelDefualtParameter 的值
     *
     * }
     * @param newId {string} new model id
     * @param oldId {string} old model id
     * @param data {Object} default data
     * @param params {Object} new params
     * @param options {{copyParamCoverage:false}} options
     */
    make.Default.copy = function (newId, oldId, data, params, options) {

        var f = function (newId, oldId, data, params, options) {

            options = options || {};
            var newParams = {};
            var oldParams = {};
            var op = make.Default.getParameters(oldId);
            op = make.Default.clone(op);//复制属性,否则容易冲突, 同时复制两个模型,但是默认值不同,会造成相互干扰
            make.Default.copyProperties(op, oldParams);
            if (params instanceof Function) {
                newParams = params(oldParams) || {};
            } else {
                make.Default.copyProperties(params, newParams);
            }
            if (options.copyDefaultParamCoverage) {
                delete oldParams.modelDefaultParameters
            }
            if (!options.copyParamCoverage) {
                make.Default.copyProperties(oldParams, newParams);
            }
            if (options.defaultValue && newParams.modelDefaultParameters) {
                for (var p in options.defaultValue) {
                    if (newParams.modelDefaultParameters[p] !== undefined) {
                        if (newParams.modelDefaultParameters[p] instanceof Object) {
                            newParams.modelDefaultParameters[p].value = options.defaultValue[p];
                        } else {
                            newParams.modelDefaultParameters[p] = options.defaultValue[p];
                        }

                    }
                }
            }
            make.Default.register(newId, function (json, callback) {
                var newData = { id: oldId };
                if (data instanceof Function) {
                    data(json);
                } else {
                    make.Default.copyProperties(data, newData);
                }
                make.Default.copyProperties(json, newData);
                var node = make.Default.load(newData, callback);
                return node;
            }, newParams)
        }
        f(newId, oldId, data, params, options);
    }

    /**
     * 默认参数的定义枚举
     */
    make.Default.PARAMETER_CATEGORY_BASIC = 'BASIC';
    make.Default.PARAMETER_CATEGORY_DETAIL = 'Detail';

    make.Default.PARAMETER_TYPE_STRING = 'string';
    make.Default.PARAMETER_TYPE_BOOLEAN = 'boolean';
    make.Default.PARAMETER_TYPE_COLOR = 'color';
    make.Default.PARAMETER_TYPE_INT = 'int';
    make.Default.PARAMETER_TYPE_NUMBER = 'number';
    make.Default.PARAMETER_TYPE_IMAGE = 'image';
    make.Default.PARAMETER_TYPE_ARRAY_STRING = 'array.string';
    make.Default.PARAMETER_TYPE_ARRAY_NUMBER = 'array.number';
    make.Default.PARAMETER_TYPE_ARRAY_INT = 'array.int';

    make.Default.PARAMETER_PROPERTY_TYPE_FIELD = 'field';
    make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR = 'accessor';
    make.Default.PARAMETER_PROPERTY_TYPE_STYLE = 'style';
    make.Default.PARAMETER_PROPERTY_TYPE_CLIENT = 'client';

    String.prototype.replaceAll = function (reallyDo, replaceWith, ignoreCase) {
        if (!RegExp.prototype.isPrototypeOf(reallyDo)) {
            return this.replace(new RegExp(reallyDo, (ignoreCase ? "gi" : "g")), replaceWith);
        } else {
            return this.replace(reallyDo, replaceWith);
        }
    }

    /**
     * 支持三种方式,传入原始值 数组 对象
     * '1{}3'.format(2)
     * 1{0}3'.format([2])
     * 1{0}3{1}'.format(2,4)
     * 1{a}3'.format({a:2})
     * @param value
     * @returns {*}
     */
    String.prototype.format = function (value) {
        var patten = this;
        if (arguments.length > 1) {
            var t = [];
            for (var i = 0; i < arguments.length; i++) {
                t.push(arguments[i]);
            }
            value = t;
        }

        if (value) {
            var type = typeof value;
            if (value instanceof Array) {
                value.forEach(function (item, i) {
                    if (item instanceof Object) {
                        item = JSON.stringify(item);
                    }
                    patten = patten.replaceAll('{' + i + '}', item);
                })
            } else if (value instanceof Object) {
                for (var p in value) {
                    var item = value[p];
                    if (item instanceof Object) {
                        item = JSON.stringify(item);
                    }
                    patten = patten.replaceAll('{' + p + '}', item);
                }
            } else {
                return patten.replaceAll('{}', value)
            }
        }
        return patten;
    }

    make.Default.getId = function (data) {
        return data.getClient('id');
    }

    make.Default.objectWrapper = function (object, field, getterFilter, setterFilter) {

        Object.defineProperty(object, field, {
            get: function () {
                var value = object['___' + field];
                if (getterFilter) {
                    value = getterFilter.call(object, value, object, field);
                }
                return value;
            },
            set: function (newValue) {
                var oldValue = object[field];
                if (setterFilter) {
                    newValue = setterFilter.call(object, newValue, object, field);
                }
                if (oldValue !== newValue) {
                    object['___' + field] = newValue;
                    this.firePropertyChange && this.firePropertyChange(field, oldValue, newValue);
                }
            }
        });
    };

    make.Default.equals = function (o1, o2) {

        if (o1 instanceof Object && o2 instanceof Object) {
            return JSON.stringify(o1) == JSON.stringify(o2);
        } else {
            return o1 == o2;
        }
    };

    make.Default.clone = function (o) {
        try {
            return JSON.parse(JSON.stringify(o));
        } catch (e) {
            console.error(e, o);
            throw e;
        }
    }

    make.Default.EXPORT_OBJECT_ID = true;
} else {
    var make = window.make;
}
/* 
 Utils2D里面内置一些创建2d图元的方法
 */

make.Utils2D = {
    create2dShapeNode: function (json) {
        var position = json.position || [0, 0, 0];
        var nodeData = json.data;
        var image = json.image;
        var objType = json.objType;
        var objectId = json.objectId;
        var closed = json.closed;

        //ImageShapeNode是房间对象
        var object2d = new make.Default.WallShapeNode(objectId);
        if (json.objType == 'innerWall') {
            object2d = new make.Default.InnerWallShapeNode(objectId);
        } else if (json.objType == 'floor') {
            object2d = new make.Default.FloorShapeNode(objectId);
        } else if (json.objType == 'cable') {
            object2d = new make.Default.LineWidthShapeNode(objectId);
        }
        var pathObject = make.Default.create2dShapePath(nodeData, position);
        make.Default.objectWrapper(object2d, 'id', function () {

            return this.getClient('id');
        });

        make.Default.objectWrapper(object2d, 'objectId', function () {

            return this.getId();
        });

        object2d.setSegments(pathObject.segments);
        object2d.setPoints(pathObject.points);
        if (closed) object2d.setClient('closed', true);
        if (image) object2d.setClient('imageSrc', image);

        make.Default.setObject2dCSProps(object2d, json);
        /*if(image){
         object2d.setClient($consts.IMAGE_SRC,$utils.Path+image);
         }*/
        // object2d.setClient('label', (json.label || modelLabelMap[json.name]));
        return object2d;
    },

    create2dShapePath: function (nodeData, position) {
        var segments = new twaver.List();
        var pointsList = new twaver.List();
        if (nodeData.length > 0) {
            segments.add('moveto');
            if (nodeData[0] instanceof Array) {
                pointsList.add({
                    x: parseFloat(nodeData[0][0]) + parseFloat(position[0]),
                    y: parseFloat(nodeData[0][1]) + parseFloat(position[2])
                });
                for (var i = 1; i < nodeData.length; i++) {
                    var point = nodeData[i];
                    if (point[0] == 'c') {
                        segments.add('quadto');
                        pointsList.add({
                            x: parseFloat(point[1]) + parseFloat(position[0]),
                            y: parseFloat(point[2]) + parseFloat(position[2])
                        });
                        pointsList.add({
                            x: parseFloat(point[3]) + parseFloat(position[0]),
                            y: parseFloat(point[4]) + parseFloat(position[2])
                        });
                    } else {
                        segments.add('lineto');
                        pointsList.add({
                            x: parseFloat(point[0]) + parseFloat(position[0]),
                            y: parseFloat(point[1]) + parseFloat(position[2])
                        });
                    }
                }
            } else {
                pointsList.add({
                    x: parseFloat(nodeData[0]) + parseFloat(position[0]),
                    y: parseFloat(nodeData[1]) + parseFloat(position[2])
                });
                for (var i = 2; i < nodeData.length; i = i + 2) {
                    segments.add('lineto');
                    pointsList.add({
                        x: parseFloat(nodeData[i]) + parseFloat(position[0]),
                        y: parseFloat(nodeData[i + 1]) + parseFloat(position[2])
                    });
                }
            }

        }
        return {
            segments: segments,
            points: pointsList,
        }

    },

    setObject2dCSProps: function (node, json) {
        var style = json.style;
        var client = json.client;

        if (style) {
            for (var i in style) {
                node.setStyle(i, style[i]);
            }
        }
        if (client) {
            for (var i in client) {
                node.setClient(i, client[i]);
            }
        }
    },

    createBlockObject: function (json, type) {
        var objectId = json.objectId;
        var object2d = new make.Default.Block(objectId);
        if ('door' == type) {
            object2d = new make.Default.Door(objectId);
        } else if ('window' == type) {
            object2d = new make.Default.Window(objectId);
        }
        if (json.width) {
            object2d.setClient('length', json.width);
        }
        var client = json.client || {};
        object2d.setClient('edgeIndex', client.edgeIndex || 1);
        object2d.setClient('offset', client.offset || 0);
        make.Default.setObject2dCSProps(object2d, json);
        return object2d;
    },

    createNode: function (json) {
        var position = json.position || [0, 0, 0];
        var rotation = json.rotation || [0, 0, 0];
        var width = json.width || 50;
        var depth = json.depth || 50;
        var image = json.image;
        var objectId = json.objectId;
        var object2d = new twaver.Follower(objectId);
        var color = json.color || '#CCCCFF';

        make.Default.objectWrapper(object2d, 'id', function () {

            return this.getClient('id');
        });

        make.Default.objectWrapper(object2d, 'objectId', function () {

            return this.getId();
        });

        object2d.setSize(parseFloat(width), parseFloat(depth));
        object2d.setCenterLocation({x: parseFloat(position[0]), y: parseFloat(position[2])});
        object2d.setAngle(rotation[1]);

        object2d.setClient('positionY', position[1]);

        if (typeof image == 'string') {
            object2d.setImageUrl(image);
        } else if (typeof image == 'object') {
            object2d.setImage(image);
        } else {
            object2d.setStyle('body.type', 'vector');
            object2d.setStyle('vector.shape', 'rectangle');
            object2d.setStyle('vector.fill.color', color);
        }
        object2d.setStyle('select.style', 'border');
        object2d.setStyle('select.color', '#F07819');
        object2d.setStyle('select.width', 0.7);
        object2d.setStyle('vector.outline.width', 1);
        object2d.setStyle('vector.outline.color', '#BEC9BE');
        if(object2d.getWidth() > 20){
            object2d.setStyle('label.maxlength', Math.min(object2d.getWidth(), object2d.getHeight()));
        }

        object2d.setStyle('label.position', 'center');
        make.Default.setObject2dCSProps(object2d, json);
        return object2d;
    },

    createFollower: function (json) {
        var args = json;
        var json = {};
        make.Default.copyProperties(args, json);
        json.id = json.objectId || _twaver.id();

        json.scale = json.scale || 1;
        json.depth = json.depth || 5;
        json.position = json.position || [0, 0, 0];
        json.rotation = json.rotation || [0, 0, 0];
        var node = new twaver.Follower(json);

        make.Default.objectWrapper(node, 'id', function () {

            return node.getClient('id');
        });

        make.Default.objectWrapper(node, 'objectId', function () {

            return node.getId();
        });

        make.Default.objectWrapper(node, 'depth');

        make.Default.objectWrapper(node, 'position', null, function (newValue) {
            this.setLocation({x: newValue[0], y: newValue[1]});
            return newValue;
        });
        make.Default.objectWrapper(node, 'rotation', null, function (newValue) {
            this.setAngle(newValue[2]);
            return newValue;
        });

        make.Default.objectWrapper(node, 'scale', null, function (newValue) {
            var size = this.getSize();
            size.width = size.width * newValue;
            size.height = size.height * newValue;
            this.setSize(size);

            var location = this.getLocation();
            location.x = location.x * newValue;
            location.y = location.y * newValue;
            node.setLocation(location);
            return newValue;
        });

        node.depth = json.depth;

        node.position = json.position;

        node.rotation = json.rotation;

        node.scale = json.scale;

        //必需在赋值后添加监听,否则position还未初始化
        node.addPropertyChangeListener(function (e) {

            var property = e.property;
            var source = e.source;
            if (property == 'location') {
                source.position[0] = e.newValue.x;
                source.position[1] = e.newValue.y;
            } else if (property == 'angle') {
                source.rotation[2] = e.newValue;
            }
        }, node);

        //FIXME 像旧版本兼容
        if (json.x) {
            node.setX(json.x);
        }
        if (json.y) {
            node.setY(json.y);
        }
        node.z = json.z;
        if (json.location) {
            if (json.location instanceof Array) {
                node.setLocation({x: json.location[0], y: json.location[1]});
            } else {
                node.setLocation(json.location);
            }
        }
        if (json.centerLocation) {
            if (json.centerLocation instanceof Array) {
                node.setCenterLocation({x: json.centerLocation[0], y: json.centerLocation[1]});
            } else {
                node.setCenterLocation(json.centerLocation);
            }
        }
        if (json.size) {
            node.setSize(json.size);
        }
        if (json.angle) {
            node.setAngle(json.angle);
        }
        node.setStyle('select.style', 'border');
        node.setStyle('select.color', '#F07819');
        node.setStyle('select.width', 0.7);
        node.setStyle('vector.outline.color', '#BEC9BE');
        make.Default.setObject2dCSProps(node, json);
        return node;
    },

    /**
     * 对齐节点
     * @param data {twaver.List}
     * @param type {string} up down left right center(水平中心对齐) middle(垂直中心对齐)
     */
    align: function (data, type) {
        if (!type) {
            return;
        }
        if (!data || data.size() < 2) {
            return;
        }
        var fun = this['_align_' + type];
        if (!fun) {
            return;
        }
        fun.call(this, data);
    },
    _align_up: function (data) {
        var min = data.get(0).getLocation().y;
        for (var i = 1; i < data.size(); i++) {
            min = Math.min(min, data.get(i).getLocation().y);
        }
        data.forEach(function (node) {
            node.setY(min);
        });
    },
    _align_down: function (data) {
        var max = data.get(0).getLocation().y + data.get(0).getSize().height;
        for (var i = 1; i < data.size(); i++) {
            max = Math.max(max, data.get(i).getLocation().y + data.get(i).getSize().height);
        }
        data.forEach(function (node) {
            node.setY(max - node.getSize().height);
        });
    },
    _align_left: function (data) {
        var min = data.get(0).getLocation().x;
        for (var i = 1; i < data.size(); i++) {
            min = Math.min(min, data.get(i).getLocation().x);
        }
        data.forEach(function (node) {
            node.setX(min);
        });
    },
    _align_right: function (data) {
        var max = data.get(0).getLocation().x + data.get(0).getSize().width;
        for (var i = 1; i < data.size(); i++) {
            max = Math.max(max, data.get(i).getLocation().x + data.get(i).getSize().width);
        }
        data.forEach(function (node) {
            node.setX(max - node.getSize().width);
        });
    },
    _align_center: function (data) {
        var sum = 0;
        for (var i = 0; i < data.size(); i++) {
            sum += data.get(i).getCenterLocation().y;
        }
        var avg = sum / data.size();
        data.forEach(function (node) {
            node.setY(avg - node.getSize().height / 2);
        });
    },
    _align_middle: function (data) {
        var sum = 0;
        for (var i = 0; i < data.size(); i++) {
            sum += data.get(i).getCenterLocation().x;
        }
        var avg = sum / data.size();
        data.forEach(function (node) {
            node.setX(avg - node.getSize().width / 2);
        });
    },

    /**
     * 水平分布
     * @param data {twaver.List}
     * @param type {string} hor,ver
     * @param padding
     */
    flow: function (data, type, padding) {
        if (!type) {
            return;
        }
        if (!data || data.size() < 2) {
            return;
        }
        var fun = this['_flow_' + type];
        if (!fun) {
            return;
        }
        fun.call(this, data, padding);
    },
    _flow_hor: function (data, padding) {
        //排序
        this.sort(data, function (n1, n2) {
            return n1.getLocation().y - n2.getLocation().y;
        });
        this.sort(data, function (n1, n2) {
            return n1.getLocation().x - n2.getLocation().x;
        });
        var last = data.get(0);
        for (var i = 1; i < data.size(); i++) {
            var curr = data.get(i);
            var x = last.getLocation().x;
            //var w = last.getSize().width;
            //curr.setX(x + w + padding);
            curr.setX(x + padding);
            last = curr;
        }
    },
    _flow_ver: function (data, padding) {
        //排序
        this.sort(data, function (n1, n2) {
            return n1.getLocation().x - n2.getLocation().x;
        });
        this.sort(data, function (n1, n2) {
            return n1.getLocation().y - n2.getLocation().y;
        });
        var last = data.get(0);
        for (var i = 1; i < data.size(); i++) {
            var curr = data.get(i);
            var y = last.getLocation().y;
            //var h = last.getSize().height;
            //curr.setY(y + h + padding);
            curr.setY(y + padding);
            last = curr;
        }
    },
    sort: function (data, compare) {
        var size = data.size();
        var a, b, r, t;
        for (var i = 0; i < size; i++) {
            a = data.get(i);
            for (var j = i + 1; j < size; j++) {
                b = data.get(j);
                r = compare ? compare(a, b) : 0;
                if (r > 0) {
                    t = b;
                    b = a;
                    a = t;
                    data.set(i, a);
                    data.set(j, b);
                }
            }
        }
    },

    wrapper: function (object, otherFiled) {

        make.Default.objectWrapper(object, 'id', function () {

            return this.getClient('id');
        });

        make.Default.objectWrapper(object, 'objectId', function () {

            return this.getId();
        });

        //尺寸
        make.Default.objectWrapper(object, 'width');
        make.Default.objectWrapper(object, 'height');
        make.Default.objectWrapper(object, 'depth');

        //位置
        make.Default.objectWrapper(object, 'px');
        make.Default.objectWrapper(object, 'py');
        make.Default.objectWrapper(object, 'pz');

        //旋转
        make.Default.objectWrapper(object, 'rx');
        make.Default.objectWrapper(object, 'ry');
        make.Default.objectWrapper(object, 'rz');

        make.Default.objectWrapper(object, 'position');
        make.Default.objectWrapper(object, 'rotation');

        if (otherFiled) {
            otherFiled.forEach(function (field) {
                make.Default.objectWrapper(object, field);
            })
        }
    },
    //wrapperForTop: function (object, otherFiled) {
    //
    //    this.wrapper(object, otherFiled);
    //    object.addPropertyChangeListener(function (e) {
    //
    //        var property = e.property;
    //        var source = e.source;
    //        //界面拖拽   修改location,angle
    //        //property  修改px, py, pz, rx, ry, rz
    //        if (property == 'location') {
    //            source.px = e.newValue.x;
    //            source.pz = e.newValue.y;
    //        } else if (property == 'angle') {
    //            source.ry = e.newValue;
    //        } else if (property == 'px') {
    //            source.position[0] = e.newValue;
    //        } else if (property == 'py') {
    //            source.position[1] = e.newValue;
    //        } else if (property == 'pz') {
    //            source.position[2] = e.newValue;
    //        } else if (property == 'rx') {
    //            source.rotation[0] = e.newValue;
    //        } else if (property == 'ry') {
    //            source.rotation[1] = e.newValue;
    //        } else if (property == 'rz') {
    //            source.rotation[2] = e.newValue;
    //        }
    //    });
    //},
    //wrapperForFront: function (object, otherFiled) {
    //
    //    this.wrapper(object, otherFiled);
    //    object.addPropertyChangeListener(function (e) {
    //
    //        var property = e.property;
    //        var source = e.source;
    //        //界面拖拽   修改location,angle
    //        //property  修改px, py, pz, rx, ry, rz
    //        if (property == 'location') {
    //            source.px = e.newValue.x;
    //            source.py = e.newValue.y;
    //        } else if (property == 'angle') {
    //            source.rz = e.newValue;
    //        } else if (property == 'px') {
    //            source.position[0] = e.newValue;
    //        } else if (property == 'py') {
    //            source.position[1] = e.newValue;
    //        } else if (property == 'pz') {
    //            source.position[2] = e.newValue;
    //        } else if (property == 'rx') {
    //            source.rotation[0] = e.newValue;
    //        } else if (property == 'ry') {
    //            source.rotation[1] = e.newValue;
    //        } else if (property == 'rz') {
    //            source.rotation[2] = e.newValue;
    //        }
    //    });
    //},
}

make.Default.register('twaver.cube.top', function (json, callback) {
    var node = make.Utils2D.createNode(json);
    if (callback) callback(node);
    return node;
});

for (var p in make.Utils2D) {
    make.Default[p] = make.Utils2D[p];
}
//Utils3D提供了多种创建基本对象的方法：cube，cylinder，path，pathNode，shapeNode，obj，生成文字贴图的方法
//模型中会内置一些动画字符，factory3d中提供了解析动画的方法。

mono.Element.prototype.direction2 = function (v) {
    var n = v.applyMatrix4(new mono.Mat4().extractRotation(this.matrix));
    n.normalize();
    return n;
};
make.Utils3D = {

    positionFloor: 'floor-top',

    _objMap: {},

    _objObject: {},

    _envMaps: {
        'envmap': 'envmap.jpg',
        'envmap1': 'envmap1.jpg',
        'envmap2': 'envmap2.jpg',
        'envmap3': 'envmap3.jpg',
        'envmap4': 'envmap4.jpg',
        'envmap5': 'envmap5.jpg',
        'envmap6': 'envmap6.jpg'
    },

    getEnvMap: function (id) {
        var envmap = make.Default.getImagePath() + make.Default._envMaps[id];
        return [envmap, envmap, envmap, envmap, envmap, envmap];
    },

    getOBjPath: function (path, isAbsPath) {
        if (!path) return this.path + 'obj/';
        if (path.indexOf('http') >= 0 || isAbsPath) {
            return path;
        } else {
            return this.path + path;
        }
    },

    createFloorForWall: function (wall) {
        var floorJson = {
            type: 'twaver.floor',
            data: wall.getClient('data'),
        }
        var creator = this.getCreator(floorJson.type);
        if (creator) {
            var floor = this.loadData(floorJson);
            floor.setParent(wall);
        }
    },

    createCombo: function (parts, id) {
        var children = [];
        var returnObjects = [];
        var ops = [];
        var ids = [];
        if (parts && !(parts instanceof Array)) {
            parts = [parts];
        }
        for (var i = 0; i < parts.length; i++) {
            var object = parts[i];
            var op = object.op || '+';
            var style = object.style;
            var client = object.client;
            var position = object.position || [0, 0, 0];
            var rotation = object.rotation || [0, 0, 0];
            var scale = object.scale || [1, 1, 1];

            var object3d = null;
            if (object.type === 'cube') {
                object3d = this.createCube(object);
            }
            if (object.type === 'cylinder') {
                object3d = this.createCylinder(object);
            }
            if (object.type === 'sphere') {
                object3d = this.createSphere(object);
            }
            if (object.type === 'polygon') {
                object3d = this.createPolygon(object);
            }
            if (object.type === 'torus') {
                object3d = this.createTorus(object);
            }
            if (object.type === 'path') {
                object3d = this.createPathCube(object);
            }
            if (object.type === 'pathNode') {
                object3d = this.createPathNode(object);
            }
            if (object.type === 'shapeNode') {
                object3d = this.createShapeNode(object);
            }
            if (object3d) {
                if (rotation && !object.rotationAnchor) {
                    object3d.setRotation(rotation[0], rotation[1], rotation[2]);
                }
                if (object.rotationAnchor) {
                    var pos = object3d.getPosition();
                    position = [position[0] + pos.x, position[1] + pos.y, position[2] + pos.z];
                }
                object3d.setPosition(position[0], position[1], position[2]);
                object3d.setScale(scale[0], scale[1], scale[2]);
                if (style) {
                    object3d.s(style);
                }
                if (client) {
                    object3d.c(client);
                }
                if (object.op) {
                    if (object3d.getChildren().size() > 0) {
                        children = children.concat(object3d.getChildren().toArray());
                    }
                    children.push(object3d);
                    if (object3d.getChildren().size() > 0) {
                        object3d.getChildren().forEach(function () {
                            ops.push(op);
                        });
                    } else if (children.length > 1) {
                        ops.push(op);
                    }
                    ids.push(object3d.getId());
                } else {
                    returnObjects.push(object3d);
                }
            }
        }

        if (children.length > 0) {
            var combo;
            if (id) {
                combo = new mono.ComboNode(children, ops, false, id);
            } else {
                combo = new mono.ComboNode(children, ops);
            }
            combo.setNames(ids);
            return combo;
        }
        if (returnObjects.length == 1) {
            return returnObjects[0];
        }
        return returnObjects;
    },

    setMainObject: function (object3ds) {
        var mainObject = null;
        if (object3ds instanceof Array) {
            //get main object
            for (var i = 0; i < object3ds.length; i++) {
                var object3d = object3ds[i];
                if (!(object3d instanceof mono.Entity)) continue;
                mainObject = getMaxObject(mainObject, object3d);
            }
            //set mainObject
            for (var i = 0; i < object3ds.length; i++) {
                var object3d = object3ds[i];
                if (!(object3d instanceof mono.Entity)) continue;
                if (mainObject != object3d) {
                    object3ds[i].setParent(mainObject);
                }
            }
        } else {
            mainObject = object3ds;
        }

        function getMaxObject(maxObject, object) {
            if (maxObject) {
                var maxBounding = maxObject.getBoundingBox();
                var bounding = object.getBoundingBox();
                var mainMin = maxBounding.min,
                    mainMax = maxBounding.max,
                    min = bounding.min,
                    max = bounding.max;
                if (mainMax.x - mainMin.x < max.x - min.x || mainMax.z - mainMin.z < max.z - min.z) {
                    maxObject = object;
                }
            } else {
                maxObject = object;
            }
            return maxObject;
        }

        if (mainObject) {
            mainObject.setClient('main', true);
        }
        return mainObject;
    },

    createCube: function (json) {
        var width = json.width;
        var height = json.height;
        var depth = json.depth;
        var color = json.color;
        var position = json.position || [0, 0, 0];
        var rotation = json.rotation || [0, 0, 0];
        var rotationAnchor = json.rotationAnchor;
        var topColor = json.topColor || color;
        var repeatX = json.repeatX || 1;
        var repeatY = json.repeatY || 1;

        var image = json.image;
        var frontImage = json.frontImage;
        var wrapMode = json.wrapMode;

        var object3d;
        if (json.objectId) {
            object3d = new mono.Cube({
                id: json.objectId,
                width: width,
                height: height,
                depth: depth
            });
        } else {
            object3d = new mono.Cube(width, height, depth);
        }

        /*object3d.s({
            'm.color': color,
            'm.ambient': color,
            'left.m.lightmap.image': this.getImagePath('inside_lightmap.jpg'),
            'right.m.lightmap.image': this.getImagePath('outside_lightmap.jpg'),
            'front.m.lightmap.image': this.getImagePath('outside_lightmap.jpg'),
            'back.m.lightmap.image': this.getImagePath('inside_lightmap.jpg'),
            'top.m.color': topColor,
            'top.m.ambient': topColor,
            'bottom.m.color': topColor,
            'bottom.m.ambient': topColor,
        });*/
        if (color) object3d.s({
            'm.color': color,
            'm.ambient': color
        });
        if (topColor) {
            object3d.s({
                'top.m.color': topColor,
                'top.m.ambient': topColor,
                'bottom.m.color': topColor,
                'bottom.m.ambient': topColor
            });
        }
        if (image) object3d.s({
            'm.texture.image': image,
            'm.texture.repeat': new mono.Vec2(repeatX, repeatY),
            'm.texture.anisotropy': 15
        });
        if (frontImage) object3d.setStyle('front.m.texture.image', frontImage);
        if (wrapMode) object3d.setWrapMode(wrapMode);
        if (rotationAnchor) {
            var pos, axis;
            if (rotationAnchor === 'left') {
                pos = new mono.Vec3(width / 2, 0, 0);
                axis = new mono.Vec3(0, 1, 0);
            }
            if (rotationAnchor === 'right') {
                pos = new mono.Vec3(-width / 2, 0, 0);
                axis = new mono.Vec3(0, 1, 0);
            }
            object3d.rotateFromAxis(axis.clone(), pos.clone(), rotation[1]);
        } else {
            object3d.setRotation(rotation[0] / 180 * Math.PI, rotation[1] / 180 * Math.PI, rotation[2] / 180 * Math.PI);
        }
        //需要放在外面设置position
        // object3d.setPosition(position[0], position[1], position[2])
        make.Default.setObject3dCSProps(object3d, json);
        return object3d;
    },

    createCylinder: function (json) {
        var radius = json.radius;
        var topRadius = json.topRadius || radius;
        var bottomRadius = json.bottomRadius || radius;
        var height = json.height;
        var color = json.color;
        var image = json.image;

        var object3d = new mono.Cylinder(topRadius, bottomRadius, height);
        object3d.s({
            'm.normalType': mono.NormalTypeSmooth,
            'm.type': 'phong',
            'm.color': color,
            'm.ambient': color,
            'side.m.lightmap.image': this.getImagePath('inside_lightmap.jpg'),
        });
        if (image) object3d.setStyle('m.texture.image', image);

        return object3d;
    },

    createSphere: function (json) {
        var radius = json.radius;
        var color = json.color || '#F5F5F5';
        var image = json.image;

        var object3d = new mono.Sphere(radius);
        object3d.s({
            'm.normalType': mono.NormalTypeSmooth,
            'm.type': 'phong',
            'm.color': color,
            'm.ambient': color,
            'm.lightmap.image': this.getImagePath('inside_lightmap.jpg'),
        });
        if (image) object3d.setStyle('m.texture.image', image);
        return object3d;
    },

    createPolygon: function (json) {
        var radius = json.radius || 100;
        var topRadius = json.topRadius || radius;
        var bottomRadius = json.bottomRadius || radius;
        var height = json.height || 200;
        var radialSegments = json.radialSegments || 3;
        var sideColor = json.color || '#F5F5F5';
        var topColor = json.topColor || sideColor;
        var smooth = json.smooth || true;
        var image = json.image;
        var object3d = new mono.Cylinder(topRadius, bottomRadius, height, radialSegments, smooth);
        object3d.s({
            'm.normalType': mono.NormalTypeSmooth,
            'm.type': 'phong',
            'm.color': sideColor,
            'm.ambient': sideColor,
            'top.m.color': topColor,
            'top.m.ambient': topColor,
            'bottom.m.color': topColor,
            'bottom.m.ambient': topColor,
            'side.m.lightmap.image': this.getImagePath('inside_lightmap.jpg'),
        });
        if (image) object3d.setStyle('m.texture.image', image);
        return object3d;
    },

    createTorus: function (json) {
        var radius = json.radius || 50;
        var tube = json.tube || 30;
        var tubularSegments = json.tubularSegments || 3;
        var radialSegments = json.radialSegments || 6;
        var color = json.color || '#F5F5F5';
        var image = json.image;

        var object3d = new mono.Torus(radius, tube, tubularSegments, radialSegments);
        object3d.s({
            'm.normalType': mono.NormalTypeSmooth,
            'm.type': 'phong',
            'm.color': color,
            'm.ambient': color,
            'm.lightmap.image': this.getImagePath('outside_lightmap.jpg'),
        });
        if (image) object3d.setStyle('m.texture.image', image);
        return object3d;
    },

    createBillboard: function (json) {
        var position = json.position || [0, 0, 0];
        var scale = json.scale || [1, 1, 1];
        var image = json.image || this.getImagePath('outside_lightmap.jpg');
        var object = new mono.Billboard();
        object.s({
            'm.texture.image': image,
            'm.alignment': mono.BillboardAlignment.bottomCenter,
            'm.depthTest': false,
        });
        object.setScale(scale[0], scale[1], scale[2]);
        object.p(position[0], position[1], position[2]);
        return object;
    },

    //path data like [12,12,23,23] or [[12,12],[23,23]]
    createPathNodePath: function (pathData) {
        var path;
        if (pathData[0] && pathData[0] instanceof Array) {
            for (var j = 0; j < pathData.length; j++) {
                var data = pathData[j];
                if (path) {
                    if (data[0] === 'c') {
                        path.quadraticCurveTo(data[1], data[2], data[3], data[4], data[5], data[6]);
                    } else {
                        // path.lineTo(data[0], data[1], data[2]);
                        path.lineTo(data[0], 0, data[1]);
                    }
                } else {
                    path = new mono.Path();
                    // path.moveTo(data[0], data[1], data[2]);
                    path.moveTo(data[0], 0, data[1]);
                }
            }
        } else {
            for (var j = 0; j < pathData.length; j = j + 2) {
                if (path) {
                    path.lineTo(pathData[j], 0, pathData[j + 1]);
                } else {
                    path = new mono.Path();
                    path.moveTo(pathData[j], 0, pathData[j + 1]);
                }
            }
        }
        return path;
    },

    createPathNode: function (json) {
        var radius = json.radius;
        var pathImage = json.pathImage;
        var repeat = json.repeat || 50;
        var offset = json.offset || new mono.Vec2(0, 0);
        var startCap = json.startCap || 'plain';
        var endCap = json.endCap || 'plain';
        var pathWidth = json.pathWidth;
        var pathHeight = json.pathHeight;

        var pathX = pathWidth / 2,
            pathY = pathHeight / 2;
        var shapeValue = [{ x: pathX, y: -pathY }, { x: pathX, y: pathY },
        { x: -pathX, y: pathY }, { x: -pathX, y: -pathY }
        ];

        var path = this.createPathNodePath(json.data);
        var length = path.getLength();
        var pathNode;
        if (pathWidth && pathHeight) {
            pathNode = new mono.PathNode({
                path: path,
                shape: shapeValue,
                segments: 10,
                segmentsR: 5
            });
        } else {
            path = mono.PathNode.prototype.adjustPath(path, radius, 2);
            pathNode = new mono.PathNode({ path: path, radius: radius });
        }
        pathNode.s({
            'm.texture.image': pathImage,
            'm.texture.repeat': new mono.Vec2(length / repeat, 1),
            'm.texture.offset': offset,
        });
        // if (radius) pathNode.setRadius(radius);
        if (startCap) pathNode.setStartCap(startCap);
        if (endCap) pathNode.setEndCap(endCap);
        make.Default.setObject3dCSProps(pathNode, json);
        return pathNode;
    },

    createShapeNodePath: function (pathData) {
        var path;
        if (pathData[0] && pathData[0] instanceof Array) {
            for (var j = 0; j < pathData.length; j++) {
                var data = pathData[j];
                if (path) {
                    if (data[0] === 'c') {
                        path.quadraticCurveTo(data[1], -data[2], 0, data[3], -data[4], 0);
                    } else {
                        path.lineTo(data[0], -data[1], 0);
                    }
                } else {
                    path = new mono.Path();
                    path.moveTo(data[0], -data[1], 0);
                }

            }
        } else {
            for (var j = 0; j < pathData.length; j = j + 2) {
                if (path) {
                    path.lineTo(pathData[j], -pathData[j + 1], 0);
                } else {
                    path = new mono.Path();
                    path.moveTo(pathData[j], -pathData[j + 1], 0);
                }
            }
        }
        return path;
    },

    createShapeNode: function (json) {
        var repeat = json.repeat || 100;
        var amount = json.amount || 2;
        var vertical = true;
        if (json.vertical !== null || json.vertical != undefined) {
            vertical = json.vertical;
        }
        var path = this.createShapeNodePath(json.data);
        var shapeNode;
        if (json.id) {
            shapeNode = new mono.ShapeNode({
                'id': json.id,
                'path': path
            });
        } else {
            shapeNode = new mono.ShapeNode(path);
        }
        if (json.curveSegments) shapeNode.setCurveSegments(json.curveSegments);
        shapeNode.setAmount(amount);
        shapeNode.setVertical(vertical);
        shapeNode.setRepeat(repeat);
        return shapeNode;
    },

    createPathCube: function (json) {
        var pathWidth = json.width;
        var pathHeight = json.height;
        var pathData = json.data;
        var insideColor = json.insideColor;
        var outsideColor = json.outsideColor;
        var asideColor = json.asideColor;
        var zsideColor = json.zsideColor;
        var topColor = json.topColor;
        var bottomColor = json.bottomColor;
        var insideImage = json.insideImage || json.image;
        var outsideImage = json.outsideImage || json.image;
        var insideMap = json.insideMap;
        var outsideMap = json.outsideMap;
        var repeat = json.repeat || json.height;
        var closed = json.closed;

        var path = this.createShapeNodePath(pathData);
        if (closed) {
            path.closePath();
        }
        var object3d = new mono.PathCube(path, pathWidth, pathHeight);
        object3d.s({
            'outside.m.color': outsideColor,
            'm.type': 'phong',   //测试房间的光照效果，先注释
            'top.m.type': 'basic',   //测试房间的光照效果，先注释
            // 'inside.m.type': 'basic',
            'inside.m.color': insideColor,
            'aside.m.color': asideColor || outsideColor,
            'zside.m.color': zsideColor || outsideColor,
            'top.m.color': topColor,
            'top.m.ambient': topColor,
            'bottom.m.color': bottomColor || topColor,
            'inside.m.lightmap.image': insideMap,
            'outside.m.lightmap.image': outsideMap,
            'aside.m.lightmap.image': outsideMap,
            'zside.m.lightmap.image': outsideMap,
            'inside.m.texture.image': insideImage,
            'outside.m.texture.image': outsideImage,
        });
        object3d.setRepeat(repeat);
        return object3d;
    },

    getPicInfo: function (path, files) {
        var result = {};
        if (typeof (files) == 'string') {
            files = [files];
        }
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var name = file.substring(0, file.indexOf(".")).toLowerCase();
            file = path + file;
            result[name] = file;
        }
        return result;
    },

    getRByD: function (degree) {
        return degree * Math.PI / 180;
    },

    getDByR: function (radian) {
        return radian * 180 / Math.PI
    },

    getRsByDs: function (radians) {
        var result;
        if (radians && radians.length > 0) {
            result = [];
            for (var i = 0; i < radians.length; i++) {
                result.push(make.Default.getRByD(radians[i]));
            }
        }
        return result;
    },

    // setObjectClientPros: function(object, client){
    //     if (client) {
    //         for (var key in client) {
    //             object.setClient(key, client[key]);
    //         }
    //     }
    // },

    setObject3dCSProps: function (object3d, json) {
        if (json.client) {
            object3d.c(json.client);
        }
        if (json.style) {
            object3d.s(json.style);
        }
    },


    setObject3dCommonProps: function (object3d, json) {
        var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];
        var scale = json.scale || [1, 1, 1];
        var position = json.position || [0, 0, 0];
        object3d.setRotation(rotation[0], rotation[1], rotation[2]);
        object3d.setScale(scale[0], scale[1], scale[2]);
        object3d.setPosition(position[0], 0, position[2]);
        make.Default.setPositionY(object3d, position[1]);
        make.Default.setObject3dCSProps(object3d, json);
    },

    cloneObjElement: function (json, callback) {
        var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];
        var scale = json.scale || [1, 1, 1];
        var position = json.position || [0, 0, 0];
        // position[1] = parseFloat(position[1]) || 0;
        var object = this._objObject[json.name];
        var boundingBox = object.getBoundingBox();

        //如果没有合并，父亲就没有boundingBox，make里面计算一下父亲的boundingbox
        if (boundingBox && !boundingBox.size().x) {
            object.boundingBox = object.getBoundingBoxWithChildren();
        }
        var yy = (boundingBox.max.y - boundingBox.min.y) / 2;
        var newObject = json.singleton ? object : object.clonePrefab();
        json._id && (newObject._id = json._id);
        if (json.client) {
            for (var key in json.client) {
                newObject.setClient(key, json.client[key]);
            }
        }
        if (json.style) {
            newObject.s(json.style);
        }
        newObject.setClient('type', json.name);
        //设置obj需要显示阴影，并且设置阴影贴图  
        newObject.setClient('showShadow', json.showShadow);
        if (json.showShadow) {
            //如果设置了阴影的类型，就通过程序生成阴影贴图，0为矩形
            if (json.shadowType != null) {
                newObject.setClient('shadowType', json.shadowType);
                newObject.setClient('shadowWeight', 1);
            } else if (json.showShadowImage) {
                //如果显示阴影图片，则会在obj目录下的阴影贴图
                newObject.setClient('shadowImage', json.shadowImage);
            }
        }
        if (typeof json.interepter == 'function') {
            json.interepter.call(this, newObject);
        }
        newObject.setClient('json', json);
        newObject.setScale(scale[0], scale[1], scale[2]);

        newObject.setPosition(position[0], 0, position[2]);
        newObject.setRotation(rotation[0], rotation[1], rotation[2]);
        //如果设置了位置为floor-top，则obj对象放在地面上
        var positionY = position[1] || 0;

        if (typeof (positionY) == 'number') {
            if (make.Default.objDefaultY == make.Default.positionFloor) {
                newObject.setPositionY(positionY + yy * scale[1]);
            } else {
                newObject.setPositionY(positionY);
            }
        } else if (positionY == make.Default.positionFloor) {
            newObject.setPositionY(yy * scale[1]);
        }

        if (callback) callback(newObject);

        return newObject;
    },

    setDefaultEnvMap: function (newObject) {
        var envmap = this.getEnvMap("envmap5");
        newObject.setStyle('m.envmap.image', envmap);
        var descendants = newObject.getDescendants();
        descendants.forEach(function (descendant) {
            descendant.setStyle('m.envmap.image', envmap);
        });
        return newObject;
    },

    setShadowImage: function (object3d, imageSrc) {
        object3d.setClient('shadowImage', imageSrc);
        twaver.Util.registerImageByUrl(imageSrc, imageSrc);
    },

    createObj: function (json, callback) {
        var self = this;
        if (this._objObject[json.name]) {
            //阴影贴图的名称为obj模型名加上“S”后缀  
            var objPath = this.getOBjPath(json.path, json.isAbsPath);
            var shadowImage = json.shadowImage = objPath + json.name + 'S.png';
            return this.cloneObjElement(json, callback);
        } else {
            if (!this._objMap[json.name] || this._objMap[json.name].length < 1) {
                this._objMap[json.name] = [];
                var objPath = this.getOBjPath(json.path, json.isAbsPath);
                var obj = objPath + json.name + '.obj';
                var mtl = objPath + json.name + '.mtl';
                var scale = json.scale || [1, 1, 1];
                if (json.showShadow) {
                    //阴影贴图的名称为obj模型名加上“S”后缀
                    var shadowImage = json.shadowImage = objPath + json.name + 'S.png';
                    //注册阴影图片文件，用于后面绘制阴影图片
                    if (json.shadowType == null) {
                        twaver.Util.registerImageByUrl(shadowImage, shadowImage);
                    }
                }

                var loader = new mono.OBJMTLLoader();
                loader.load(obj, mtl, null, function (object) {
                    if (json.merged) {
                        object = mono.Utils.mergeElements(object.getDescendants());
                    } else if (json.envImages) {
                        //哪些面需要环境贴图
                        var envmap = make.Default.getEnvMap("envmap5");
                        object.getDescendants().forEach(function (descendant) {
                            var image = descendant.getStyle('m.texture.image');
                            if (image) {
                                var envImages = json.envImages;
                                envImages.forEach(function (envImage) {
                                    if (image.indexOf(envImage) >= 0 || (image instanceof Array && image[0].indexOf(envImage) >= 0)) {
                                        descendant.setStyle('m.envmap.image', envmap);
                                    }
                                });

                            }
                        });
                    }
                    //设置object oid
                    object.getDescendants().forEach(function (descendant) {
                        if (descendant._name) descendant.setClient('oid', descendant._name);
                    });

                    self._objObject[json.name] = object;

                    self._objMap[json.name].forEach(function (j) {
                        return self.cloneObjElement(j.json, j.callback);
                    });
                });
            } else {
                if (json.showShadow) {
                    //阴影贴图的名称为obj模型名加上“S”后缀
                    var objPath = this.getOBjPath(json.path, json.isAbsPath);
                    var shadowImage = json.shadowImage = objPath + json.name + 'S.png';
                    //注册阴影图片文件，用于后面绘制阴影图片
                    if (json.shadowType == null) {
                        twaver.Util.registerImageByUrl(shadowImage, shadowImage);
                    }
                }
            }
            this._objMap[json.name].push({ json: json, callback: callback });
        }
    },

    getTextSize: function (text, font) {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        var values = text.split('\n');
        var maxWidth = 0;
        var resI = 0;
        context.font = font;
        for (var i = 0; i < values.length; i++) {
            var label = values[i];
            var width = context.measureText(label).width;
            if (width > maxWidth) {
                maxWidth = width;
                resI = i;
            }
        }
        var height = context.measureText('e').width * values.length * 2;
        var res = { w: maxWidth, h: height, ind: resI};
        return res;
    },

    generateTextCanvas: function (text, color, font, bgcolor, labelOpacity,img) {
        
        //获取字体大小
        var font = font || "bold 80px 微软雅黑,sans-serif";
        var outerCanvas = document.createElement('canvas');
        outerCanvas.width = 2000;
        outerCanvas.height = 2000;
        var outerWidth = outerCanvas.width;
        var outerHeight = outerCanvas.height;
        var outerCxt = outerCanvas.getContext('2d');

        //绘制背景
        outerCxt.fillStyle = bgcolor;
        outerCxt.globalAlpha = labelOpacity;
        outerCxt.fillRect(0,0,outerWidth,outerHeight);
        
        //字体部分的设计，自适应
        //先后进行两次判断，如果最大行的宽度大于总宽度的4/5，缩小相应字体大小
        //再把列高和1/2图片加文字高度的判断，如果大于则缩小相应字体大小
        outerCxt.globalAlpha = 1;
        var imgWidth = outerWidth/3;
        var imgHeight = outerHeight/3;
        var marginHeight = outerHeight/10;
        var maxWidth = outerWidth*4/5;
        var maxHeight = outerHeight*4/5;
        var values = text.split('\n');
        var res = make.Default.getTextSize(text, font);
        var textWidth = res.w;
        var textHeight = res.h;
        var maxIndex = res.ind;
        var fz = 0;
        if(!img){
            imgWidth = 0;
            imgHeight = 0;
        }
        if(!text){
            textWidth = 0;
            textHeight = 0;
        }
        if(textWidth>maxWidth){
            fz = Math.round(maxWidth/values[maxIndex].length);
            textWidth = maxWidth;
            textHeight = fz*values.length*2;
            font = font.replace(/\d+(px)/,fz+'$1'); 
        }
        
        var sumWidth = textWidth;
        var sumHeight = imgHeight + marginHeight + textHeight;
        if(sumHeight > maxHeight){
            sumHeight = maxHeight;
            textHeight = maxHeight - imgHeight - marginHeight;
            fz = Math.round(textHeight/values.length/2);
            font = font.replace(/\d+(px)/,fz+'$1');
        }
        var rowHeight = textHeight/values.length;
        var imgLeft = (outerWidth - imgWidth)/2;
        var imgTop = (outerHeight - sumHeight)/2;
        var textLeft = (outerWidth - textWidth)/2;
        var textTop = imgTop + imgHeight + marginHeight;

        //绘制图片
        if(img){
            $(img).css({
                'width': imgWidth+'px',
                'height': imgHeight+'px',
                'position': 'relative'
            });
            outerCxt.drawImage(img,imgLeft,imgTop,imgWidth,imgHeight);
        }
        
        //绘制字体
        outerCxt.fillStyle = color || 'white';
        outerCxt.textBaseline = 'middle';
        outerCxt.textAlign = 'center';
        outerCxt.font = font;

        for (var i = 0; i < values.length; i++) {
            var x = textLeft + textWidth/2;
            var y = rowHeight * i + textTop;
            outerCxt.fillText(values[i], x, y);
        }
        //png默认生成图片无背景；jpeg默认生成图片为黑色背景；
        var canUrl = outerCanvas.toDataURL('image/png');
        return canUrl;
    },

    generateShadowNode: function (wall, visibleFilter, shadowParams) {
        var floor = null;
        var descendants = wall.getDescendants();
        if (descendants && descendants.length > 0) {
            for (var i = 0; i < descendants.length; i++) {
                var data = descendants[i];
                if (data instanceof mono.Entity && data.getClient('type') && 'floor' == data.getClient('type')) {
                    floor = data;
                    break;
                }
            }
        }
        if (!floor) {
            return;
        }
        var fbb = floor.getBoundingBox();
        var floorHeight = fbb.max.z - fbb.min.z;
        var floorWidth = fbb.max.x - fbb.min.x;
        var rotate = wall.getRotation();
        wall.setRotation(0, 0, 0);
        var shadowCanvas = make.Default.createShadowImage(wall, floor, visibleFilter, shadowParams);
        //生成的阴影设置为地板的lightmap贴图
        if (floor instanceof mono.ShapeNode) {
            floor.setStyle('top.m.lightmap.image', shadowCanvas);
        } else {
            floor.setStyle('m.lightmap.image', [null, null, shadowCanvas]);
        }
        floor.invalidateTexture();
        make.Default.newcanvas = make.Default.newcanvas || shadowCanvas;
        wall.setRotation(rotate);
        return floor;
    },

    _getWorldRotation: function (n) {
        var mat = new mono.Mat4().extractRotation(n.worldMatrix);
        var rotate = new mono.Vec3();
        rotate.setEulerFromRotationMatrix(mat);
        return rotate;
    },

    createShadowImage: function (wall, floor, visibleFilter, shadowParams) {
        var shadowColor = shadowParams && shadowParams.shadowColor || '#000';
        var shadowWeightAll = shadowParams && shadowParams.shadowWeight || 2;

        var fbb = floor.getBoundingBox();
        var floorHeight = fbb.max.z - fbb.min.z;
        var floorWidth = fbb.max.x - fbb.min.x;

        var maxValue = Math.max(floorWidth, floorHeight);
        var scale = maxValue > 2048 ? Math.ceil(maxValue / 2048) : 1;
        // var scale = 1;
        var canvas = make.Default.canvas || document.createElement('canvas');
        //地板的宽高缩放成2的幂，这样贴图就不会闪
        // var fWidth = mono.Utils.nextPowerOfTwo(floorWidth / scale);
        // var fHeight = mono.Utils.nextPowerOfTwo(floorHeight / scale);
        var fWidth = floorWidth / scale;
        var fHeight = floorHeight / scale;
        //宽高的缩放值
        var scaleW = floorWidth / fWidth,
            scaleH = floorHeight / fHeight;
        // var scaleW = 1, scaleH = 1;
        canvas['width'] = fWidth;
        canvas['height'] = fHeight;
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, fWidth, fHeight);
        //绘制一个和缩放之后的地板大小的矩形
        context.fillStyle = 'white';
        context.fillRect(0, 0, fWidth, fHeight);
        context.beginPath();

        var wallPosition = wall.getPosition();
        var wbb = wall ? wall.getBoundingBox() : null;
        //外墙如果没有在中心点建模，获取到中心点的偏移值
        var offsetX = -(wbb.max.x + wbb.min.x) / 2 - wallPosition.x;
        var offsetZ = -(wbb.max.z + wbb.min.z) / 2 - wallPosition.z;

        //取出所有墙的孩子对象
        var descendants = wall.getDescendants();
        var wallCombo;
        for (var t = 0; t < descendants.length; t++) {
            var child = descendants[t];
            if (child.getClient && child.getClient('id') == 'wallCombos') {
                wallCombo = child;
                break;
            }
        }
        if (wallCombo) {
            var combos = wallCombo.getClient('combos');
            combos.forEach(function (child) {
                if (child.getClient && !child.getClient('resetPos')) {
                    var pos = child.getPosition();
                    child.p(pos.x + parseFloat(wallPosition.x), pos.y + parseFloat(wallPosition.y), pos.z + parseFloat(wallPosition.z));
                    child.setClient('resetPos', true);
                }
                descendants.push(child);
            });
        }
        //获取所有柱子
        var columnCombo;
        for (var t = 0; t < descendants.length; t++) {
            var child = descendants[t];
            if (child.getClient && child.getClient('id') == 'columnCombos') {
                columnCombo = child;
                break;
            }
        }
        if (columnCombo) {
            var combos = columnCombo.getClient('combos');
            combos.forEach(function (child) {
                if (child.getClient && !child.getClient('resetPos')) {
                    var pos = child.getPosition();
                    child.p(pos.x + parseFloat(wallPosition.x), pos.y + parseFloat(wallPosition.y), pos.z + parseFloat(wallPosition.z));
                    child.setClient('resetPos', true);
                }
                descendants.push(child);
            });
        }
        descendants.push(wall);
        for (var k = 0; k < descendants.length; k++) {
            var data = descendants[k];
            var position = data.getWorldPosition();
            //平移到对象的坐标点上

            var translateX = (fWidth / 2) + position.x / scaleW;
            var translateY = (fHeight / 2) + position.z / scaleH;
            //旋转需要取世界坐标系下的旋转
            var rotate = make.Default._getWorldRotation(data);
            var type = data.getClient('type');
            var showShadow = data.getClient('showShadow');
            if (showShadow != false) showShadow = true;

            if (showShadow && (type == 'wall' || type == 'inner_wall' || type == 'glass_wall')) {
                var pathData = data.getClient('data');
                var doorData = data.getClient('doorData');
                var lineWidth = data.getClient('wallDepth') * 0.9;
                context.save();
                context.translate(translateX, translateY);
                context.beginPath();

                if (pathData[0] && pathData[0] instanceof Array) {
                    for (var j = 0; j < pathData.length; j++) {
                        if (j == 0) {
                            context.moveTo(pathData[j][0] / scaleW + offsetX / scaleW, pathData[j][1] / scaleH + offsetZ / scaleH);
                        } else {
                            context.lineTo(pathData[j][0] / scaleW + offsetX / scaleW, pathData[j][1] / scaleH + offsetZ / scaleH);
                        }

                    }
                    if (type == 'wall') {
                        context.lineTo(pathData[0][0] / scaleW + offsetX / scaleW, pathData[0][1] / scaleH + offsetZ / scaleH);
                    }
                } else {
                    for (var j = 0; j < pathData.length; j = j + 2) {
                        if (j == 0) {
                            context.moveTo(pathData[j] / scaleW + offsetX / scaleW, pathData[j + 1] / scaleH + offsetZ / scaleH);
                        } else {
                            context.lineTo(pathData[j] / scaleW + offsetX / scaleW, pathData[j + 1] / scaleH + offsetZ / scaleH);
                        }
                    }
                    if (type == 'wall') {
                        context.lineTo(pathData[0] / scaleW + offsetX / scaleW, pathData[1] / scaleH + offsetZ / scaleH);
                    }
                }

                context.lineWidth = lineWidth / scaleW;
                context.strokeStyle = '#ccc';
                context.shadowColor = shadowColor;
                var shadowBlurWidth = Math.min(parseInt(floorWidth / 15), 300);
                context.shadowBlur = parseInt(shadowBlurWidth / scaleW);

                if (type == 'inner_wall' || type == 'glass_wall') {
                    // context.translate(translateX, translateY);
                    context.lineWidth = lineWidth / scaleW;
                    context.shadowBlur = parseInt(shadowBlurWidth / scaleW);
                }
                context.shadowOffsetX = 0;
                context.shadowOffsetY = 0;
                //地板的最大值超过4000，地板的阴影重一点，否则浅一点
                for (var i = 0; i < 3; i++) {
                    context.shadowBlur = maxValue >= 4000 ? (180 + i * 80) : 100 + i * 50;
                    context.stroke();
                    if (i == 0) {
                        context.shadowColor = '#666';
                        context.shadowBlur = maxValue >= 4000 ? 300 : 200;
                        context.stroke();

                        context.shadowColor = '#000';
                        context.shadowBlur = 10;
                        context.stroke();
                    }
                }

                if (doorData) {
                    context.save();
                    context.shadowBlur = 100;
                    context.shadowColor = '#ffffff';
                    for (var t = 0; t < doorData.length; t = t + 2) {
                        var x1 = (doorData[t][0] + offsetX) / scale, y1 = (doorData[t][1] + offsetZ) / scale,
                            x2 = (doorData[t + 1][0] + offsetX) / scale, y2 = (doorData[t + 1][1] + offsetZ) / scale,
                            xw = 50 / scale, yh = 200 / scale;
                        var gradient = context.createLinearGradient(x1 - xw, y1 - yh, x1 - xw, y1 + yh);
                        if (x1 == x2) {
                            gradient = context.createLinearGradient(x1 - yh, y1 - xw, x1 + yh, y1 - xw);
                        }
                        if (x1 == x2) {
                            y1 += 8 / scale, y2 -= 8 / scale;
                        } else if (y1 == y2) {
                            x1 += 8 / scale, x2 -= 8 / scale;

                        }

                        gradient.addColorStop(0, 'rgba(255,255,255,0)');
                        gradient.addColorStop(0.5, 'rgba(255,255,255,1)');
                        gradient.addColorStop(1, 'rgba(255,255,255,0)');

                        context.fillStyle = gradient;

                        context.beginPath();
                        if (x1 == x2) {
                            context.moveTo(x1 - yh, y1 - xw);
                            context.lineTo(x1, y1);
                            context.lineTo(x1 + yh, y1 - xw);
                            context.lineTo(x1 + yh, y2 + xw);
                            context.lineTo(x2, y2);
                            context.lineTo(x1 - yh, y2 + xw);
                        } else if (y1 == y2) {
                            context.moveTo(x1 - xw, y1 - yh);
                            context.lineTo(x2 + xw, y1 - yh);
                            context.lineTo(x2, y2);
                            context.lineTo(x2 + xw, y2 + yh);
                            context.lineTo(x1 - xw, y2 + yh);
                            context.lineTo(x1, y1);
                        }

                        context.closePath();
                        context.fill();
                    }


                    context.restore();
                }
                context.restore();
            }
            //获取对象是否需要显示阴影属性
            var showShadow = data.getClient('showShadow');
            if (visibleFilter) {
                showShadow = showShadow && visibleFilter(data);
            }
            //获取阴影贴图
            var shadowImage = data.getClient('shadowImage');
            //获取阴影类型,0代表矩形，1是圆形
            var shadowType = data.getClient('shadowType') || 0;
            var shadowRatio = data.getClient('shadowRatio') || 0.99;
            //阴影的轻重，可选值：1:淡的,2:正常的 3，加重
            var shadowWeight = data.getClient('shadowWeight') || 2;
            if (showShadow) {
                var box = data.getBoundingBox();
                var size = box.size();
                var width = size.x / scaleW * shadowRatio;
                var lineWidth = depth = size.z / scaleH * shadowRatio;
                if (rotate.y % (Math.PI / 2) == 0) {
                    width = size.x / scaleH * shadowRatio;
                    lineWidth = depth = size.z / scaleW * shadowRatio;
                }
                if (rotate.y % (Math.PI) == 0) {
                    width = size.x / scaleW * shadowRatio;
                    lineWidth = depth = size.z / scaleH * shadowRatio;
                }

                //如果是圆形，则宽深都一样
                if (shadowType == 1) {
                    var min = Math.min(size.x, size.z);
                    width = min / scaleW * shadowRatio;
                    lineWidth = depth = min / scaleH * shadowRatio;
                    if (rotate.y % (Math.PI / 2) == 0) {
                        width = min / scaleH * shadowRatio;
                        lineWidth = depth = min / scaleW * shadowRatio;
                    }
                    if (rotate.y % (Math.PI) == 0) {
                        width = min / scaleW * shadowRatio;
                        lineWidth = depth = min / scaleH * shadowRatio;
                    }
                }
                //如何设置了阴影贴图，将图片paint到canvas上
                if (shadowImage) {
                    //obj模型世界坐标的旋转不对，直接用模型本身的
                    rotate = data.getRotation();
                    var imageAsset = twaver.Util.getImageAsset(shadowImage);
                    if (!imageAsset) continue;

                    context.save();
                    context.translate(translateX + offsetX / scaleW, translateY + offsetZ / scaleH);
                    context.rotate(-rotate.y);
                    //maxWidth为图片阴影扩散范围
                    var maxWidth = Math.max(width, depth) * 0.3;
                    var drawImageX, drawImageY, drawImageW, drawImageH;
                    //阴影图片有点淡，两层叠加
                    //旋转90度的倍数
                    if (rotate.y % (Math.PI / 2) == 0) {
                        drawImageX = -width / 2 - maxWidth / 2;
                        drawImageY = -depth / 2 - maxWidth / 2;
                        drawImageW = width + maxWidth;
                        drawImageH = depth + maxWidth;

                        // context.drawImage(imageAsset.getImage(), -width / 2 - maxWidth / 2, -depth / 2 - maxWidth / scaleH / 4, width + maxWidth, depth + maxWidth / scaleW);
                        // context.drawImage(imageAsset.getImage(), -width / 2 - maxWidth / 2, -depth / 2 - maxWidth / scaleH / 4, width + maxWidth, depth + maxWidth / scaleW);
                    }
                    //旋转180度倍数
                    if (rotate.y % (Math.PI) == 0) {
                        drawImageX = -width / 2 - maxWidth / 2;
                        drawImageY = -depth / 2 - maxWidth / 2;
                        drawImageW = width + maxWidth;
                        drawImageH = depth + maxWidth;

                        // context.drawImage(imageAsset.getImage(), -width / 2 - maxWidth / 2, -depth / 2 - maxWidth / 2, width + maxWidth, depth + maxWidth);
                        // context.drawImage(imageAsset.getImage(), -width / 2 - maxWidth / 2, -depth / 2 - maxWidth / 2, width + maxWidth, depth + maxWidth);
                    }

                    // context.drawImage(imageAsset.getImage(), drawImageX, drawImageY, drawImageW, drawImageH);
                    // context.drawImage(imageAsset.getImage(), drawImageX, drawImageY, drawImageW, drawImageH);
                    context.drawImage(imageAsset.getImage(), drawImageX, drawImageY, drawImageW, drawImageH);
                    // context.drawImage(imageAsset.getImage(), drawImageX, drawImageY, drawImageW, drawImageH);

                    context.restore();
                } else {
                    if (shadowType == 0) { //矩形
                        //如果没有阴影贴图,绘制阴影的大小为物体的大小
                        context.save();
                        context.translate(translateX + offsetX / scaleW, translateY + offsetZ / scaleH);
                        context.rotate(-rotate.y);

                        context.beginPath();
                        context.moveTo(-width / 2, 0);
                        context.lineTo(width / 2, 0);

                        context.lineWidth = lineWidth;
                        context.strokeStyle = 'gray';
                        context.shadowColor = '#333';
                        var shadowBlur = Math.min(width, depth);
                        context.shadowBlur = shadowBlur * 2;
                        context.shadowOffsetX = 0;
                        context.shadowOffsetY = 0;
                        if (shadowWeight == 1) {
                            context.shadowBlur = shadowBlur * 3;
                            context.stroke();
                        } else if (shadowWeight == 2) {
                            context.stroke();
                            context.stroke();
                        }
                        context.restore();
                    } else if (shadowType == 1) { //圆形
                        //如果没有阴影贴图,绘制阴影的大小为物体的大小
                        var translateX = translateX + offsetX / scaleW;
                        var translateY = translateY + offsetZ / scaleH;
                        var radius = data.getClient('shadowRadius');
                        if (radius) {
                            radius = radius / scaleH;
                        } else {
                            radius = Math.sqrt(width * width + depth * depth) / 2;
                        }
                        context.save();
                        context.beginPath();
                        context.arc(translateX, translateY, radius, 0, 2 * Math.PI, false);
                        context.fillStyle = 'gray';
                        context.shadowColor = shadowColor;
                        context.shadowBlur = radius * 2;
                        context.shadowOffsetX = 0;
                        context.shadowOffsetY = 0;
                        if (shadowWeight == 1) {
                            context.shadowBlur = radius * 3;
                            context.fill();
                        } else if (shadowWeight == 2) {
                            context.fill();
                            context.fill();
                        }
                        context.restore();
                    }

                }
            }
        }
        // window.open(canvas.toDataURL("image/png"));
        // return canvas;
        make.Default.canvas = make.Default.canvas || canvas;

        var newcanvas = make.Default.newcanvas || document.createElement('canvas');

        //地板的宽高缩放成2的幂，这样贴图就不会闪，最大就是2048
        var fWidth = mono.Utils.nextPowerOfTwo(floorWidth / scale);
        var fHeight = mono.Utils.nextPowerOfTwo(floorHeight / scale);

        newcanvas.width = fWidth;
        newcanvas.height = fHeight;
        newcanvas.style.width = fWidth;
        newcanvas.style.height = fHeight;
        var newctx = newcanvas.getContext("2d");
        newctx.clearRect(0, 0, fWidth, fHeight);
        //绘制一个和缩放之后的地板大小的矩形
        newctx.fillStyle = 'white';
        newctx.fillRect(0, 0, fWidth, fHeight);

        newctx.drawImage(canvas, 0, 0, floorWidth / scale, floorHeight / scale, 0, 0, fWidth, fHeight);
        // window.open(newcanvas.toDataURL("image/png"));
        return newcanvas;

    },

    /**
     * b相对于a的位置
     * a是parent或祖宗，b是孩子或子孙
     **/
    getRelativePosition: function (parent, child) {
        var m1, m2;
        m1 = new mono.Mat4().getInverse(parent.worldMatrix.clone());
        m2 = new mono.Mat4().multiplyMatrices(m1, child.worldMatrix.clone());
        var position = main.position = new mono.Vec3().getPositionFromMatrix(m2);
        return position;
    },

    getPathBoundingBox: function (pathData) {
        var boundingBox = {};
        var defaultValue = { centerPoint: { x: 0, y: 0 }, min: { x: 0, y: 0 }, max: { x: 0, y: 0 }, size: { x: 0, y: 0 } };
        if (pathData.length == 0) {
            return defaultValue;
        }
        var minX, maxX, minY, maxY;
        if (pathData[0] instanceof Array) {
            minX = pathData[0][0], maxX = pathData[0][0], minY = -pathData[0][1], maxY = -pathData[0][1];
            for (var j = 1; j < pathData.length; j++) {
                minX = Math.min(minX, pathData[j][0]);
                maxX = Math.max(maxX, pathData[j][0]);
                minY = Math.min(minY, -pathData[j][1]);
                maxY = Math.max(maxY, -pathData[j][1]);
            }
        } else {
            if (pathData.length < 2) {
                return defaultValue;
            } else {
                minX = pathData[0], maxX = pathData[0], minY = -pathData[1], maxY = -pathData[1];
                for (var j = 2; j < pathData.length; j = j + 2) {
                    minX = Math.min(minX, pathData[j]);
                    maxX = Math.max(maxX, pathData[j]);
                    minY = Math.min(minY, -pathData[j + 1]);
                    maxY = Math.max(maxY, -pathData[j + 1]);
                }
            }
        }
        boundingBox.centerPoint = {
            x: (minX + maxX) / 2,
            y: (minY + maxY) / 2
        };
        boundingBox.min = {
            x: minX,
            y: minY
        };
        boundingBox.max = {
            x: maxX,
            y: maxY
        };
        boundingBox.size = {
            x: maxX - minX,
            y: maxY - minY
        };
        return boundingBox;

    },

    setPositionY: function (object3d, y) {
        if (typeof (y) == 'number') {
            object3d.setPositionY(y);
        } else if (y == make.Default.positionFloor) {
            var size = object3d.getBoundingBox().size();
            object3d.setPositionY(size.y / 2);
        }
    },

    //动画的执行
    playAnimation: function (element, animation, done) {
        var params = animation.split(':');
        if (params[0] === 'move') {
            var direction = params[1];
            var movement = params[2];
            var dur = parseInt(params[3]) || 1000;
            var delay = parseInt(params[4] || 0);
            var easing = params[5];
            this.animateMove(element, direction, movement, dur, delay, easing, done);
        }
        if (params[0] === 'rotation') {
            var anchor = params[1];
            var angle = params[2];
            var dur = parseInt(params[3]) || 1000;
            var delay = parseInt(params[4]);
            var easing = params[5];
            this.animateRotate(element, anchor, angle, dur, delay, easing, done);
        }
    },

    animateMove: function (object, direction, movement, dur, delay, easing, done) {
        easing = easing || 'easeInStrong';
        var size = object.getBoundingBox().size().multiply(object.getScale());

        var movement = movement || 0.8;

        var directionVec = new mono.Vec3(0, 0, 1);
        var distance = 0;
        if (direction === 'right') {
            directionVec = new mono.Vec3(1, 0, 0);
            distance = size.x;
        }
        if (direction === 'left') {
            directionVec = new mono.Vec3(-1, 0, 0);
            distance = size.x;
        }
        if (direction === 'top') {
            directionVec = new mono.Vec3(0, 1, 0);
            distance = size.y;
        }
        if (direction === 'bottom') {
            directionVec = new mono.Vec3(0, -1, 0);
            distance = size.y;
        }
        if (direction === 'front') {
            directionVec = new mono.Vec3(0, 0, 1);
            distance = size.z;
        }
        if (direction === 'back') {
            directionVec = new mono.Vec3(0, 0, -1);
            distance = size.z;
        }

        distance = distance * movement;
        if (object.getClient('animated')) {
            directionVec = directionVec.negate();
        }

        directionVec = object.direction2(directionVec);

        var fromPosition = object.getPosition().clone();
        object.setClient('animated', !object.getClient('animated'));

        new twaver.Animate({
            from: 0,
            to: 1,
            dur: dur,
            easing: easing,
            delay: delay,
            onUpdate: function (value) {
                object.setClient('animating', true);
                //don't forget to clone new instance before use them!
                object.setPosition(fromPosition.clone().add(directionVec.clone().multiplyScalar(distance * value)));
            },
            onDone: function () {
                object.setClient('animating', false);
                if (done) {
                    done();
                }
            },
        }).play();
    },

    animateRotate: function (object, anchor, angle, dur, delay, easing, done) {
        //twaver.Util.stopAllAnimates(true);
        easing = easing || 'easeInStrong';

        var size = object.getBoundingBox().size().multiply(object.getScale());

        var from = 0;
        var to = 1;
        if (object.getClient('animated')) {
            to = -1;
        }
        object.setClient('animated', !object.getClient('animated'));

        var position;
        var axis;
        if (anchor === 'left') {
            position = new mono.Vec3(-size.x / 2, 0, 0);
            var axis = new mono.Vec3(0, 1, 0);
        }
        if (anchor === 'right') {
            position = new mono.Vec3(size.x / 2, 0, 0);
            var axis = new mono.Vec3(0, 1, 0);
        }
        if (anchor === 'center-z') {
            position = new mono.Vec3(0, 0, 0);
            var axis = new mono.Vec3(0, 0, 1);
        }

        var animation = new twaver.Animate({
            from: from,
            to: to,
            dur: dur,
            delay: delay,
            easing: easing,
            onUpdate: function (value) {
                if (this.lastValue === undefined) {
                    this.lastValue = 0;
                }
                object.rotateFromAxis(axis.clone(), position.clone(), Math.PI / 180 * -angle * (value - this.lastValue));
                this.lastValue = value;
            },
            onDone: function () {
                delete this.lastValue;
                if (done) {
                    done();
                }
            },
        });
        animation.play();
    },

    animateCameraPosition: function (camera, newPosition, during, onDone) {
        var oldPosition = camera.getPosition();
        var animation = new twaver.Animate({
            from: 0,
            to: 1,
            dur: during,
            easing: 'easeBoth',
            onUpdate: function (value) {
                var x = oldPosition.x + (newPosition.x - oldPosition.x) * value;
                var y = oldPosition.y + (newPosition.y - oldPosition.y) * value;
                var z = oldPosition.z + (newPosition.z - oldPosition.z) * value;
                var position = new mono.Vec3(x, y, z);
                camera.setPosition(position);
            },
        });
        animation.onDone = onDone;
        return animation;
    },

    playCameraAnimation: function (camera, interaction, newPoint, onDone) {
        var oldPoint = camera.getTarget();
        var offset = camera.getPosition().sub(camera.getTarget());
        var animation = new twaver.Animate({
            from: 0,
            to: 1,
            dur: 500,
            easing: 'easeBoth',
            onUpdate: function (value) {
                var x = oldPoint.x + (newPoint.x - oldPoint.x) * value;
                var y = oldPoint.y + (newPoint.y - oldPoint.y) * value;
                var z = oldPoint.z + (newPoint.z - oldPoint.z) * value;
                var target = new mono.Vec3(x, y, z);
                camera.lookAt(target);
                interaction.target = target;
                var position = new mono.Vec3().addVectors(offset, target);
                camera.setPosition(position);
            },
        });
        animation.onDone = onDone;
        animation.play();
    }

}
for (var p in make.Utils3D) {
    make.Default[p] = make.Utils3D[p];
}


make.Default.register('twaver.cube', function (json, callback) {
    if (json.image) {
        if (json.image.indexOf('http') < 0) {
            json.image = make.Default.path + json.image;
        }
    }

    var object = make.Default.createCube(json);
    if (json.visible == false) {
        object.setStyle('m.visible', false);
    }
    make.Default.setObject3dCommonProps(object, json);
    callback && callback(object);
    return object;
}, {
        category: "基本模型",
        type: "mono.Element",
        name: "立方体",
        icon: 'model/idc/icons/cube.png',
        description: "立方体是make里面提供的最基本的模型，可以用这种模型扩展出各种立方体形状的模型，比如箱子，柱子，盒子等。支持更改长，宽，高，贴图等基本参数",
        modelDefaultParameters: {
            'width': {
                name: "宽",
                value: 100,
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            'height': {
                name: "高",
                value: 100,
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            'depth': {
                name: "深",
                value: 100,
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            'color': {
                name: '颜色',
                value: 'white',
                type: make.Default.PARAMETER_TYPE_COLOR,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            'image': {
                name: '贴图',
                value: undefined,
                type: make.Default.PARAMETER_TYPE_IMAGE,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            'position': {
                value: [0, 0, 0],
                name: "位置",
                type: make.Default.PARAMETER_TYPE_ARRAY_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
                editable: false,
            },
            'rotation': {
                value: [0, 0, 0],
                name: "旋转角度",
                type: make.Default.PARAMETER_TYPE_ARRAY_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
                editable: false,
            }
        },
    });

make.Default.register('twaver.cylinder', function (json, callback) {
    var object = make.Default.createCylinder(json);
    var position = json.position || [0, 0, 0];
    object.p(position[0], 0, position[2]);
    make.Default.setPositionY(object, position[1]);
    callback && callback(object);
    return object;
}, {
        category: "基本模型",
        type: "mono.Element",
        name: "圆柱体",
        icon: 'model/idc/icons/cylinder.png',
        description: "圆柱体是make中提供的最基本模型，支持更改半径，高度的参数。可以更改这些参数扩展出各个圆柱体形状的模型，比如圆形柱子，桌子腿，瓶子，圆筒等",
        modelDefaultParameters: {
            topRadius: {
                name: "顶半径",
                value: 60,
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            bottomRadius: {
                name: "底半径",
                value: 60,
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            height: {
                name: "高",
                value: 100,
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            'color': {
                name: '颜色',
                value: 'white',
                type: make.Default.PARAMETER_TYPE_COLOR,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            'image': {
                name: '贴图',
                value: undefined,
                type: make.Default.PARAMETER_TYPE_IMAGE,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            'position': {
                value: [0, 0, 0],
                name: "位置",
                type: make.Default.PARAMETER_TYPE_ARRAY_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
                editable: false,
            },
            'rotation': {
                value: [0, 0, 0],
                name: "旋转角度",
                type: make.Default.PARAMETER_TYPE_ARRAY_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
                editable: false,
            }
        },
    });

make.Default.register('twaver.sphere', function (json, callback) {
    var object = make.Default.createSphere(json);
    var position = json.position || [0, 0, 0];
    object.p(position[0], 0, position[2]);
    object.setClient('showShadow', true);
    object.setClient('shadowType', 1);
    object.setClient('shadowRatio', 0.3);
    make.Default.setPositionY(object, position[1]);
    callback && callback(object);
    return object;
}, {
        category: "基本模型",
        type: "mono.Element",
        name: "球体",
        icon: 'model/idc/icons/sphere.png',
        description: "球体是make中提供的最基本模型，支持更改半径的参数。可以更改这些参数扩展出各个球体形状的模型，比如圆球等",
        modelDefaultParameters: {
            radius: {
                name: "半径",
                value: 80,
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            'color': {
                name: '颜色',
                value: '#F5F5F5',
                type: make.Default.PARAMETER_TYPE_COLOR,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            'image': {
                name: '贴图',
                value: undefined,
                type: make.Default.PARAMETER_TYPE_IMAGE,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            'position': {
                value: [0, 0, 0],
                name: "位置",
                type: make.Default.PARAMETER_TYPE_ARRAY_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
                editable: false,
            },
            'rotation': {
                value: [0, 0, 0],
                name: "旋转角度",
                type: make.Default.PARAMETER_TYPE_ARRAY_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
                editable: false,
            }
        },
    });

make.Default.register('twaver.polygon', function (json, callback) {
    var object = make.Default.createPolygon(json);
    var position = json.position || [0, 0, 0];
    object.p(position[0], 0, position[2]);
    make.Default.setPositionY(object, position[1]);
    callback && callback(object);
    return object;
}, {
        category: "基本模型",
        type: "mono.Element",
        name: "多边形",
        icon: 'model/idc/icons/polygon.png',
        description: "多边形是make中提供的最基本模型，支持更改半径，高度，边数的参数。可以更改这些参数扩展出各个多边形状的模型，比如多边形柱子，多边形箱子，各种支架等",
        modelDefaultParameters: {
            'color': {
                name: '颜色',
                value: 'white',
                type: make.Default.PARAMETER_TYPE_COLOR,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            'image': {
                name: '贴图',
                value: undefined,
                type: make.Default.PARAMETER_TYPE_IMAGE,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            topRadius: {
                name: "顶半径",
                value: 100,
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            bottomRadius: {
                name: "底半径",
                value: 100,
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            height: {
                name: "高",
                value: 200,
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            radialSegments: {
                name: "边数",
                value: 3,
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            'position': {
                value: [0, 0, 0],
                name: "位置",
                type: make.Default.PARAMETER_TYPE_ARRAY_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
                editable: false,
            },
            'rotation': {
                value: [0, 0, 0],
                name: "旋转角度",
                type: make.Default.PARAMETER_TYPE_ARRAY_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
                editable: false,
            }
        },
    });

make.Default.register('twaver.torus', function (json, callback) {
    var object = make.Default.createTorus(json);
    var position = json.position || [0, 0, 0];
    object.p(position[0], 0, position[2]);
    make.Default.setPositionY(object, position[1]);
    callback && callback(object);
    return object;
}, {
        category: "基本模型",
        type: "mono.Element",
        name: "圆环",
        icon: 'model/idc/icons/torus.png',
        description: "圆环体是make中提供的最基本模型，支持更改半径，高度，扁平程度，管半径的参数。可以更改这些参数扩展出各个圆环体形状的模型，比如轮胎等",
        modelDefaultParameters: {
            'color': {
                name: '颜色',
                value: 'white',
                type: make.Default.PARAMETER_TYPE_COLOR,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            'image': {
                name: '贴图',
                value: undefined,
                type: make.Default.PARAMETER_TYPE_IMAGE,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            radius: {
                name: "半径",
                value: 50,
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            tube: {
                name: "内外径差",
                value: 30,
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            tubularSegments: {
                name: "扁平程度",
                value: 3,
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            radialSegments: {
                name: "边数",
                value: 6,
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            'position': {
                value: [0, 0, 0],
                name: "位置",
                type: make.Default.PARAMETER_TYPE_ARRAY_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
                editable: false,
            },
            'rotation': {
                value: [0, 0, 0],
                name: "旋转角度",
                type: make.Default.PARAMETER_TYPE_ARRAY_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
                editable: false,
            }
        },
    });

var packIndex = 0;
make.Default.register('twaver.combo', function (json, callback) {

    var pack = 'pack_' + packIndex++;
    var data = json.data;
    if (data && mono.Utils.isArray(data)) {
        var mainObject = null,
            object = null;

        var combos = [],
            columnCombos = [];
        for (var i = 0; i < data.length; i++) {
            object = make.Default.load(data[i]);
            if (!mainObject) {
                mainObject = object;
            } else {
                var type = object.getClient('type');
                if (type == 'inner_wall' || type == 'glass_wall') {
                    // if (type == 'inner_wall' || type == 'column' || type == 'glass_wall') {

                    combos.push(object);
                    if (object.getChildren().size() > 0) {
                        object.getChildren().forEachReverse(function (child) {
                            child.setParent(mainObject);
                        });
                    }
                } else if (type == 'column') {
                    columnCombos.push(object);
                } else {
                    object.setParent(mainObject);
                }
            }
            if (object.setClient) {
                object.setClient('pack', pack);
            } else {
                object.client = object.client || {};
                object.client.pack = pack;
            }
        }
        //墙combo在一起
        if (combos && combos.length > 0) {
            var combo = new mono.ComboNode(combos);
            combo.setClient('id', 'wallCombos');
            combo.setClient('combos', combo.getCombos());
            combo.setParent(mainObject);
        }
        //柱子combo在一起
        if (columnCombos && columnCombos.length > 0) {
            var combo = new mono.ComboNode(columnCombos);
            combo.setClient('id', 'columnCombos');
            combo.setClient('combos', combo.getCombos());
            combo.setParent(mainObject);
        }

        if (callback) callback(mainObject);
        return mainObject;
    }
}, {
        icon: 'model/idc/icons/combo.png',
        category: "基本模型",
        type: "mono.Element",
        name: "组合模型",
        description: "组合模型，可以把多个不同的模型组合在一块，组成一个新的模型，传如参数是一个数组",
    });

make.Default.registerObj = function (id, name, path, parameters, showShadow, shadowType, merged, showShadowImage, style, envImages, singleton, isAbsPath) {
    parameters = parameters || {};
    parameters.async = true
    var fun = function (json, callback) {
        json.name = name;
        json.path = path;
        json.showShadow = showShadow;
        if (showShadow) json.showShadowImage = true;
        json.shadowType = shadowType;
        json.merged = merged;
        json.envImages = envImages;
        json.singleton = singleton;
        if (style) json.style = style;
        if (json.merged == null) {
            json.merged = true;
        }
        json.isAbsPath = isAbsPath;
        json.interepter = parameters.interepter;
        return make.Default.createObj(json, callback);
    }
    make.Default.register(id, fun, parameters);
}


make.Default.register('twaver.loader', function (json, callback) {
    return make.Default.load(json.data, callback);
});

make.Utils3D.getRectOfPoints = function (points) {
    if (!points || points.length / 2 < 2) {
        return null;
    }
    var minY = Number.POSITIVE_INFINITY,
        maxY = Number.NEGATIVE_INFINITY,
        minX = Number.POSITIVE_INFINITY,
        maxX = Number.NEGATIVE_INFINITY;
    var i = 0,
        len = points.length,
        ps = [];
    var compareMinMax = function (x, y) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        ps.push({ x: x, y: y });
    }
    if (len > 0 && points[i] instanceof Array) {
        for (; i < len; i++) {
            var point = points[i];
            if (point.length == 2) {
                compareMinMax(point[0], point[1]);
            } else if (point.length == 5 && point[0] == 'c') {
                // compareMinMax(point[1], point[2]);
                compareMinMax(point[3], point[4]);
            }
        }
    } else {
        for (; i < len; i += 2) {
            compareMinMax(points[i], points[i + 1]);
        }
    }

    return {
        min: {
            x: minX,
            y: minY,
        },
        max: {
            x: maxX,
            y: maxY
        },
        center: function () {
            return {
                x: (minX + maxX) / 2,
                y: (minY + maxY) / 2,
            };
        },
        width: maxX - minX,
        height: maxY - minY,
        points: ps
    };
}

make.Default.cardPanel_network = {
    "HW_NE40E-X8_card1": { width: 3.8, height: 36, depth: 50, data: [{ "id": "twaver.idc.HW_NE40E-X8_card.panel" }, { "position": [13.600000000000001, 11.4, 0], "id": "twaver.idc.deco_23.panel" }, { "position": [14.5, 340.5, 0], "id": "twaver.idc.deco_23.panel" }] },
    "HW_NE40E-X8_card2": { width: 3.8, height: 36, depth: 50, data: [{ "id": "twaver.idc.HW_NE40E-X8_card.panel" }, { "position": [13.6, 11.1, 0], "id": "twaver.idc.deco_23.panel" }, { "position": [13.5, 340.7, 0], "id": "twaver.idc.deco_23.panel" }, { "position": [12.5, 208.2, 0], "rotation": [0, 0, 90], "id": "twaver.idc.rj4502.panel" }, { "position": [12.5, 265.8, 0], "rotation": [0, 0, 90], "id": "twaver.idc.rj4502.panel" }, { "position": [12.5, 281.4, 0], "rotation": [0, 0, 90], "id": "twaver.idc.rj4502.panel" }, { "position": [12.3, 178, 0], "rotation": [0, 0, 270], "id": "twaver.idc.rj4502.panel" }, { "position": [12.5, 191.3, 0], "rotation": [0, 0, 90], "id": "twaver.idc.rj4502.panel" }] },
    "DTRF": { label: "S1240J_card01", width: 1.8, height: 20},
    "MCUG": { label: "S1240J_card02", width: 18.00, height: 203.56 },
    "A21E1": { label: "SDH1660SM_card01", width: 1.8, height: 27,data:[{"width":18,"height":280,"id":"twaver.idc.A21E1.panel"},{"position":[3,37.5,0],"client":{"decoration":false,"bid":"009269C5612A4E5185F6D073830F2405"},"id":"twaver.idc.port_85.panel"},{"position":[3,223.5,0],"client":{"decoration":false,"bid":"0C69B66DFE4F45788C6067EEC1AB2D7D"},"id":"twaver.idc.port_85.panel"},{"position":[10,8.5,0],"client":{"decoration":false,"bid":"1"},"id":"twaver.idc.port_85.panel"},{"position":[10,61.5,0],"client":{"decoration":false,"bid":"10"},"id":"twaver.idc.port_85.panel"},{"position":[10,67.5,0],"client":{"decoration":false,"bid":"11"},"id":"twaver.idc.port_85.panel"},{"position":[10,73.5,0],"client":{"decoration":false,"bid":"12"},"id":"twaver.idc.port_85.panel"},{"position":[10,79.5,0],"client":{"decoration":false,"bid":"13"},"id":"twaver.idc.port_85.panel"},{"position":[10,85.5,0],"client":{"decoration":false,"bid":"14"},"id":"twaver.idc.port_85.panel"},{"position":[10,91,0],"client":{"decoration":false,"bid":"15"},"id":"twaver.idc.port_85.panel"},{"position":[10,97,0],"client":{"decoration":false,"bid":"16"},"id":"twaver.idc.port_85.panel"},{"position":[3,8.5,0],"client":{"decoration":false,"bid":"16B3A29C9A8A4D5F919AD451EA424D01"},"id":"twaver.idc.port_85.panel"},{"position":[10,103,0],"client":{"decoration":false,"bid":"17"},"id":"twaver.idc.port_85.panel"},{"position":[10,109,0],"client":{"decoration":false,"bid":"18"},"id":"twaver.idc.port_85.panel"},{"position":[10,115.5,0],"client":{"decoration":false,"bid":"19"},"id":"twaver.idc.port_85.panel"},{"position":[3,241.5,0],"client":{"decoration":false,"bid":"193297E10DB24706B365A4463CA7A6B8"},"id":"twaver.idc.port_85.panel"},{"position":[3,193.5,0],"client":{"decoration":false,"bid":"19DBD5AA4E72415090A997A922CAA9ED"},"id":"twaver.idc.port_85.panel"},{"position":[3,199.5,0],"client":{"decoration":false,"bid":"1E5F933B0CA345FE8B796F5CFFEB03A9"},"id":"twaver.idc.port_85.panel"},{"position":[10,13.5,0],"client":{"decoration":false,"bid":"2"},"id":"twaver.idc.port_85.panel"},{"position":[10,121.5,0],"client":{"decoration":false,"bid":"20"},"id":"twaver.idc.port_85.panel"},{"position":[10,127.5,0],"client":{"decoration":false,"bid":"21"},"id":"twaver.idc.port_85.panel"},{"position":[10,133.5,0],"client":{"decoration":false,"bid":"22"},"id":"twaver.idc.port_85.panel"},{"position":[10,139.5,0],"client":{"decoration":false,"bid":"23"},"id":"twaver.idc.port_85.panel"},{"position":[3,145.5,0],"client":{"decoration":false,"bid":"2303C22E9A6C45508DCC753B22312D1C"},"id":"twaver.idc.port_85.panel"},{"position":[10,145.5,0],"client":{"decoration":false,"bid":"24"},"id":"twaver.idc.port_85.panel"},{"position":[10,151.5,0],"client":{"decoration":false,"bid":"25"},"id":"twaver.idc.port_85.panel"},{"position":[10,157.5,0],"client":{"decoration":false,"bid":"26"},"id":"twaver.idc.port_85.panel"},{"position":[10,163.5,0],"client":{"decoration":false,"bid":"27"},"id":"twaver.idc.port_85.panel"},{"position":[10,169.5,0],"client":{"decoration":false,"bid":"28"},"id":"twaver.idc.port_85.panel"},{"position":[10,175.5,0],"client":{"decoration":false,"bid":"29"},"id":"twaver.idc.port_85.panel"},{"position":[3,79.5,0],"client":{"decoration":false,"bid":"2BE95F4FC50044E0962E085188DB4DBD"},"id":"twaver.idc.port_85.panel"},{"position":[10,19.5,0],"client":{"decoration":false,"bid":"3"},"id":"twaver.idc.port_85.panel"},{"position":[10,181.5,0],"client":{"decoration":false,"bid":"30"},"id":"twaver.idc.port_85.panel"},{"position":[10,187.5,0],"client":{"decoration":false,"bid":"31"},"id":"twaver.idc.port_85.panel"},{"position":[10,193.5,0],"client":{"decoration":false,"bid":"32"},"id":"twaver.idc.port_85.panel"},{"position":[10,199.5,0],"client":{"decoration":false,"bid":"33"},"id":"twaver.idc.port_85.panel"},{"position":[10,205.5,0],"client":{"decoration":false,"bid":"34"},"id":"twaver.idc.port_85.panel"},{"position":[3,91.5,0],"client":{"decoration":false,"bid":"34B51297C049450B8A085348164237F6"},"id":"twaver.idc.port_85.panel"},{"position":[10,211.5,0],"client":{"decoration":false,"bid":"35"},"id":"twaver.idc.port_85.panel"},{"position":[10,217.5,0],"client":{"decoration":false,"bid":"36"},"id":"twaver.idc.port_85.panel"},{"position":[10,223.5,0],"client":{"decoration":false,"bid":"37"},"id":"twaver.idc.port_85.panel"},{"position":[10,229.5,0],"client":{"decoration":false,"bid":"38"},"id":"twaver.idc.port_85.panel"},{"position":[10,235.5,0],"client":{"decoration":false,"bid":"39"},"id":"twaver.idc.port_85.panel"},{"position":[3,25.5,0],"client":{"decoration":false,"bid":"3C713412C3444FFF89967250DF90E00B"},"id":"twaver.idc.port_85.panel"},{"position":[3,61.5,0],"client":{"decoration":false,"bid":"3D0D4D42760F46A98695A9F255F5C846"},"id":"twaver.idc.port_85.panel"},{"position":[10,25.5,0],"client":{"decoration":false,"bid":"4"},"id":"twaver.idc.port_85.panel"},{"position":[10,241.5,0],"client":{"decoration":false,"bid":"40"},"id":"twaver.idc.port_85.panel"},{"position":[3,127.5,0],"client":{"decoration":false,"bid":"4AC5344547A14770862E1EDCB6D0F7FD"},"id":"twaver.idc.port_85.panel"},{"position":[10,31.5,0],"client":{"decoration":false,"bid":"5"},"id":"twaver.idc.port_85.panel"},{"position":[3,49.5,0],"client":{"decoration":false,"bid":"5017CC91E6A04F2C92C70EFC85572DE7"},"id":"twaver.idc.port_85.panel"},{"position":[3,139.5,0],"client":{"decoration":false,"bid":"51F0F1CD1E1142FB9B3B8B0C7DDF706E"},"id":"twaver.idc.port_85.panel"},{"position":[3,73.5,0],"client":{"decoration":false,"bid":"58973693AB234818B1D807EEB1C98808"},"id":"twaver.idc.port_85.panel"},{"position":[3,175.5,0],"client":{"decoration":false,"bid":"5FE98261A08E42FAA55920657AAC876B"},"id":"twaver.idc.port_85.panel"},{"position":[10,37.5,0],"client":{"decoration":false,"bid":"6"},"id":"twaver.idc.port_85.panel"},{"position":[3,211.5,0],"client":{"decoration":false,"bid":"68A4D5DB68E347DBA54E7D1710844606"},"id":"twaver.idc.port_85.panel"},{"position":[3,163.5,0],"client":{"decoration":false,"bid":"6BAE43224CEA401F9F9901CBB6184767"},"id":"twaver.idc.port_85.panel"},{"position":[3,151.5,0],"client":{"decoration":false,"bid":"6CEC598CF27D4FE18B370E993D0970A0"},"id":"twaver.idc.port_85.panel"},{"position":[10,43.5,0],"client":{"decoration":false,"bid":"7"},"id":"twaver.idc.port_85.panel"},{"position":[3,31.5,0],"client":{"decoration":false,"bid":"74DB10F9A8D04AF886453B00B0C9A825"},"id":"twaver.idc.port_85.panel"},{"position":[3,157.5,0],"client":{"decoration":false,"bid":"78B109CC231440A493B1D46A1E997AE4"},"id":"twaver.idc.port_85.panel"},{"position":[10,49,0],"client":{"decoration":false,"bid":"8"},"id":"twaver.idc.port_85.panel"},{"position":[3,85.5,0],"client":{"decoration":false,"bid":"84B64DFE8DBB4DFB951B18CA5604F2C9"},"id":"twaver.idc.port_85.panel"},{"position":[3,181.5,0],"client":{"decoration":false,"bid":"8EB2ABCEFB2447D2A95B0DB371160051"},"id":"twaver.idc.port_85.panel"},{"position":[3,133.5,0],"client":{"decoration":false,"bid":"8FA3BC83CF2A4AE09CA4233AF36DDEAD"},"id":"twaver.idc.port_85.panel"},{"position":[10,55,0],"client":{"decoration":false,"bid":"9"},"id":"twaver.idc.port_85.panel"},{"position":[3,97.5,0],"client":{"decoration":false,"bid":"912BC191F64D499CA6E510E9C8E7ED0D"},"id":"twaver.idc.port_85.panel"},{"position":[3,217.5,0],"client":{"decoration":false,"bid":"9448646E142F432F8ED43A185DCBF141"},"id":"twaver.idc.port_85.panel"},{"position":[3,121.5,0],"client":{"decoration":false,"bid":"98F267C1ADDF4B738C15DD957092BDE6"},"id":"twaver.idc.port_85.panel"},{"position":[3,235.5,0],"client":{"decoration":false,"bid":"9A3746FD91A14B2892E55B67CF76BBB6"},"id":"twaver.idc.port_85.panel"},{"position":[3,205.5,0],"client":{"decoration":false,"bid":"9CB393FA2A1542838F6BC228E061CD85"},"id":"twaver.idc.port_85.panel"},{"position":[3,14,0],"client":{"decoration":false,"bid":"A6F3CC85F8AD4391861282756DF8C6F7"},"id":"twaver.idc.port_85.panel"},{"position":[3,115.5,0],"client":{"decoration":false,"bid":"A7ECCF0F134D449181D855762EC1CB34"},"id":"twaver.idc.port_85.panel"},{"position":[3,169.5,0],"client":{"decoration":false,"bid":"B2AB4C39BAB047479F3F30E75BAF0A3A"},"id":"twaver.idc.port_85.panel"},{"position":[3,109.5,0],"client":{"decoration":false,"bid":"BB132B776E934E8DBE4CC00ECF522543"},"id":"twaver.idc.port_85.panel"},{"position":[3,55.5,0],"client":{"decoration":false,"bid":"CAA102F860914F4386559C30D5E40280"},"id":"twaver.idc.port_85.panel"},{"position":[3,187.5,0],"client":{"decoration":false,"bid":"D4964BF7ADFB4911B5EA5A9D3CBD5802"},"id":"twaver.idc.port_85.panel"},{"position":[3,43.5,0],"client":{"decoration":false,"bid":"E0964A829D22448AB6458E4716C5823D"},"id":"twaver.idc.port_85.panel"},{"position":[3,229.5,0],"client":{"decoration":false,"bid":"E425E0CE437341708F5992A7DA660F22"},"id":"twaver.idc.port_85.panel"},{"position":[3,103.5,0],"client":{"decoration":false,"bid":"E98247F5CA2C4D608E8A29DE2081D690"},"id":"twaver.idc.port_85.panel"},{"position":[3,19.5,0],"client":{"decoration":false,"bid":"ECD866C14B4E448298FD51815398AC10"},"id":"twaver.idc.port_85.panel"},{"position":[3,67.5,0],"client":{"decoration":false,"bid":"FE045FD56B964B6C8D6B4C6649179DF4"},"id":"twaver.idc.port_85.panel"}] },
    "P63E1": { label: "SDH1660SM_card02", width: 1.8, height: 27},
    "P4S1N": { label: "SDH1660SM_card03", width: 1.8, height: 27},
    "CONGI": { label: "SDH1660SM_card04", width: 1.8, height: 27 },
    "PQ21EQC": { label: "SDH1660SM_card06", width: 1.8, height: 30 },
    "SERVEICE": { label: "SDH1660SM_card05", width: 1.8, height: 27},
    "S1240J_card03": { label: "S1240J_card03", width: 1.8, height: 20},
    "MATRIXE": { label: "SDH1660SM_card07", width: 3.7, height: 30},
    "P4S1N": { label: "SDH1660SM_card09", width: 1.8, height: 30},
    "o-16se": { label: "SDH1660SM_card10", width: 1.8, height: 30},
    // "SDH1660SM_card08":{label: "SDH1660SM_card08", width: 18.47, height: 303.17},

}

make.Default.Block = function () {
    make.Default.Block.superClass.constructor.apply(this, arguments);
    this.setClient('length', 90);
    this.setClient('edgeIndex', -1);
    this.setClient('offset', 0.5);
    this.setClient('gap', 0);
    this.setClient('angle', 0);
    this.setClient('focus', false);
    this.setStyle('vector.outline.width', 2);
    this.setStyle('vector.outline.color', 'gray');
    this.setStyle('vector.fill.color', 'white');
    this.setSize(0, 0);
    this.setClient('fullWidth', false);
    this.setClient('horizontalFlip', false);
    this.setImage('image_block');

    // default value.
    /*if (this.isDoor()) {
     this.blockPicture = this.blockPicture || Utils.Path + 'door00_3d.png';
     this.blockWidth = this.blockWidth || 80;
     this.blockHeight = this.blockHeight || 200;
     this.blockDepth = this.blockDepth || 10;
     this.positionY = this.positionY || 0;
     this.setClient("depth",this.blockDepth);
     }

     if (this.isWindow()) {
     this.blockPicture = this.blockPicture || Utils.Path + 'window00_3d.png';
     this.blockWidth = this.blockWidth || 100;
     this.blockHeight = this.blockHeight || 120;
     this.blockDepth = this.blockDepth || 10;
     this.positionY = this.positionY || (this.height - this.blockHeight)/2;
     this.setClient("depth",this.blockDepth);
     }*/

    /*var transparent = this.getClient('transparent');
     var opacity = this.getClient('opacity');
     this.setStyle("m.transparent",transparent);
     this.setStyle("m.opacity",opacity);*/

    /*if (this.isCutoff()) {
     this.blockWidth = this.blockWidth || 100;
     this.blockHeight = this.blockHeight || 100;
     this.positionY = this.positionY || (this.height - this.blockHeight)/2;
     if (!this.blockPicture) {
     this.blockPicture = new mono.BasicMaterial({
     color : 'green',
     transparent : true,
     opacity : 0.5,
     });
     }
     }*/
    this.setClient("height", this.blockHeight);
    this.setClient("positionY", this.positionY);

    make.Default.objectWrapper(this, 'id', function () {

        return this.getClient('id');
    });

    make.Default.objectWrapper(this, 'objectId', function () {

        return this.getId();
    });
}

twaver.Util.ext('make.Default.Block', twaver.Node, {
    onPropertyChanged: function (e) {
        make.Default.Block.superClass.onPropertyChanged.call(this, e);
        if (this.getParent() && (e.property === 'C:length'
            || e.property === 'C:edgeIndex'
            || e.property === 'C:offset'
            || e.property === 'C:gap')) {
            this.refresh();
        }
    },
    refresh: function () {
        var parent = this.getParent(),
            edgeIndex = this.getClient('edgeIndex'),
            offset = this.getClient('offset'),
            points = parent.getPoints();
        if (points && edgeIndex >= 0 && edgeIndex < points.size()) {
            var from = points.get(edgeIndex),
                to = points.get(edgeIndex === points.size() - 1 ? 0 : edgeIndex + 1),
                dx = to.x - from.x,
                dy = to.y - from.y,
                point = {x: from.x + dx * offset, y: from.y + dy * offset},
                angle = this.getAngle(dx, dy),
                borderWidth = this.getStyle('vector.outline.width'),
                gap = this.getClient('gap'),
                halfWidth = this.getClient('length') / 2 + borderWidth / 2,
                halfHeight = parent.getStyle('vector.outline.width') / 2 + borderWidth / 2 + gap;
            var rect = twaver.Util.getRect([
                twaver.Util.transformPoint(point, angle, -halfWidth, -halfHeight).point,
                twaver.Util.transformPoint(point, angle, halfWidth, -halfHeight).point,
                twaver.Util.transformPoint(point, angle, halfWidth, halfHeight).point,
                twaver.Util.transformPoint(point, angle, -halfWidth, halfHeight).point
            ]);
            this.setSize(rect.width, rect.height);
            this.setCenterLocation(point);
            this.setClient('angle', angle);
            this.setClient('leftPoint', twaver.Util.transformPoint(point, angle, -halfWidth, 0).point);
            this.setClient('rightPoint', twaver.Util.transformPoint(point, angle, halfWidth, 0).point);
        }
    },
    getAngle: function (dx, dy) {
        if (dx === 0) {
            if (dy === 0) {
                return 0;
            } else if (dy > 0) {
                return Math.PI / 2;
            } else {
                return -Math.PI / 2;
            }
        }
        return Math.atan(dy / dx);
    },

    getEdgeIndex: function () {
        return this.getClient('edgeIndex');
    },

    isDoor: function () {
        return this instanceof make.Default.Door;
    },

    isWindow: function () {
        return this instanceof make.Default.Window;
    },

    isCutoff: function () {
        return this instanceof make.Default.Cutoff;
    },

    getBlockWidth: function () {
        return Math.abs(this.getClient('length'));
    },

    getBlockHeight: function () {
        return Math.abs(this.getClient('height'));
    },

    getBlockDepth: function () {
        return Math.abs(this.getClient('depth'));
    },

    getBlockPicture: function () {
        return this.getClient('picture');
    },

    getBlockPositionY: function () {
        return Math.abs(this.getClient('positionY'));
    }
});

make.Default.Door = function () {
    make.Default.Door.superClass.constructor.apply(this, arguments);
    this.setClient("positionY", 0);
    this.setClient('length', 205);
}

twaver.Util.ext('make.Default.Door', make.Default.Block, {});

make.Default.Window = function () {
    make.Default.Window.superClass.constructor.apply(this, arguments);
    this.setClient("positionY", 100);
    this.setClient('length', 120);
}

twaver.Util.ext('make.Default.Window', make.Default.Block, {});

make.Default.Cutoff = function () {
    make.Default.Cutoff.superClass.constructor.apply(this, arguments);
    this.setClient("positionY", 100);
}

twaver.Util.ext('make.Default.Cutoff', make.Default.Block, {});


twaver.Util.registerImage("image_block",{
    rotate:'<%=getClient("angle")*180/Math.PI%>',
    diameter:function(data, network){
        var d = 10;
        var parent = data.getParent();
        if(parent){
            d = parent.getStyle("vector.outline.width")+data.getClient("gap")*2;
        }
        return d;
    },
    v:[
        {
            shape:"rect",
            rect:function(data, network){
                var length = data.getClient("length");
                if(length){
                    length = Math.abs(length);
                }
                var parent = data.getParent();
                var height = 10;
                if(parent){
                    height = parent.getStyle("vector.outline.width")+data.getClient("gap")*2;
                }
                var d = this.diameter(data, network);
                if(length > d){
                    length = length - d;
                }
                height = height; // add 2015-01-12 by Kevin
                return [-length/2,-height/2,length,height];
            },
            lineWidth:'<%=getStyle("vector.outline.width")%>',
            lineColor:'<%if(getClient("focus")){return "green"}else{return getStyle("vector.outline.color")}%>',
            fill: '<%=getStyle("vector.fill.color")%>'
        },
        {
            shape:'line',
            x1: function(data, network){ // '<%=getClient("length")/(-2)%>',
                if(data instanceof make.Default.Window || data instanceof make.Default.Door){
                    var length = data.getClient("length");
                    if(length){
                        length = Math.abs(length);
                    }
                    var d = this.diameter(data, network);
                    if(length > d){
                        length = length - d;
                    }
                    return -length/2;
                }else{
                    return 0;
                }
            },
            y1: 0,
            x2: function(data, network) { //'<%=getClient("length")/2%>',
                if(data instanceof make.Default.Window || data instanceof make.Default.Door){
                    var length = data.getClient("length");
                    if(length){
                        length = Math.abs(length);
                    }
                    var d = this.diameter(data, network);
                    if(length > d){
                        length = length - d;
                    }
                    return length/2;
                }else{
                    return 0;
                }
            },
            y2: 0,
            lineWidth:'<%=getStyle("vector.outline.width")%>',
            lineColor:'<%if(getClient("focus")){return "green"}else{return getStyle("vector.outline.color")}%>',
            lineDash:function(data){
                if (data instanceof make.Default.Door) {
                    return [10, 2];
                }
            }
        },
        {
            shape:'circle',
            cx: function(data, network) { //'<%=getClient("length")/(-2)%>',
                var length = data.getClient("length");
                if(length){
                    length = Math.abs(length);
                }
                var d = this.diameter(data, network);
                if(length > d){
                    length = length - d;
                }
                return -length/2;
            },
            cy: 0,
            r:function(data, network){
                if(network == null || !network.getSelectionModel().contains(data)) {
                    return 0;
                }
                var parent = data.getParent();
                var height = 10;
                if(parent){
                    height = parent.getStyle("vector.outline.width")+data.getClient("gap")*2;
                }
                height = height;// add 2015-01-12 by Kevin
                return height/2;
            },
            lineWidth:1,
            fill:'yellow',
            stroke:'black'
        },
        {
            shape:'circle',
            cx:function(data, network) { //'<%=getClient("length")/2%>',
                var length = data.getClient("length");
                if(length){
                    length = Math.abs(length);
                }
                var d = this.diameter(data, network);
                if(length > d){
                    length = length - d;
                }
                return length/2;
            },
            cy:0,
            r:function(data, network){
                if(network == null || !network.getSelectionModel().contains(data)) {
                    return 0;
                }
                var parent = data.getParent();
                var height = 10;
                if(parent){
                    height = parent.getStyle("vector.outline.width")+data.getClient("gap")*2;
                }
                height = height;
                return height/2;
            },
            lineWidth:1,
            fill:'yellow',
            stroke:'black'
        }
    ]
});

var getImagePath = function (image) {
    if (!image) return null;
    if (image.indexOf('/') > 0) {
        return image;
    }
    return make.Default.path + 'model/idc/images/' + image;
}

make.Default.ImageShapeNode = function () {
    make.Default.ImageShapeNode.superClass.constructor.apply(this, arguments);

    this.setClient('showFloor', true); //3D 是否显示地板
    this.setClient("closed", true); //2D 和 3D 中默认是否闭合
    this.setClient('focusColor', 'green');
    this.setClient('resizeBorderWidth', 10);
    this.setClient('resizeBorderLength', 18);
    this.setClient('resizeBorderGap', 10);
    this.setClient('resizeBorderColor', 'yellow');
    this.setClient('size', {
        x: 0,
        y: 300,
        z: 10
    });
    this.setClient('fill', true);
    this.setClient('imageSrc', 'floor.png');

    this.setStyle("vector.outline.color", "#333333");
    this.setStyle("vector.outline.width", 10);
    this.setStyle("vector.fill.color", "rgba(184,211,240,0.5)");
    this.setStyle("select.style", 'none');
    this.setClient('repeat', 1000);

    this.setClient('dimLeadLength', 35);
    this.setClient('dimLineOffset', 0.7);
    this.setClient('dimLineWidth', 1);
    this.setClient('dimColor', '#F07819');
    this.setClient('dimTextGap', 5);
    this.setClient('dimTextFont', '12px Arial');
    this.setClient('dimArrowWidth', 8);
    this.setClient('dimArrowHeight', 3);

    this.setClient('coordTextColor', 'white');
    this.setClient('coordTextFont', '12px Arial');
    this.setClient('coordTextOffsetX', 0);
    this.setClient('coordTextOffsetY', 20);
    this.setClient('coordTextAlign', 'center');
    this.setClient('coordTextBaseline', 'middle');
    this.setClient('coordTextBackground', 'rgba(240,120,25,0.7)');

    this.setClient('decimalNumber', 0);
}

twaver.Util.ext('make.Default.ImageShapeNode', twaver.ShapeNode, {
    _offset: 10,           //最小偏移距离，可配置门的吸附距离
    getCanvasUIClass: function () {
        return make.Default.ImageShapeNodeUI;
    },

    getElementUIClass: function () {
        return make.Default.ImageShapeNodeUI;
    },

    getVectorUIClass: function () {
        return make.Default.ImageShapeNodeUI;
    },

    onChildRemoved: function (child, index) {
        this.refreshChilden();
    },

    onChildAdded: function (child, index) {
        this.refreshChilden();
    },

    onPropertyChanged: function (e) {
        make.Default.ImageShapeNode.superClass.onPropertyChanged.call(this, e);
        if (e.property === 'points') {
            this.refreshChilden();
        }
    },
    checkBlockOnEdge: function (index) {
        var result = false;
        this.getChildren().forEach(function (child) {
            if (child.getClient('edgeIndex') === index) {
                result = true;
            }
        });
        return result;
    },
    refreshChilden: function () {
        this.getChildren().forEach(function (child) {
            child.refresh && child.refresh();
        });
    },
    /**
     * [isPointOnPoints 判断点是否在一这个点的集合内]
     * @param  {[type]}  point  [目标点]
     * @param  {[type]}  offset [最小误差，默认为10]
     * @return {Boolean}        [description]
     */
    isPointOnPoints: function (point, offset) {
        var points = this.getPoints();
        offset = offset || this._offset;
        for (var i = 0; i < points.size(); i++) {
            if (_twaver.math.getDistance(point, points.get(i)) <= offset) {
                return true;
            }
        }
        return false;
    },
    /**
     * [getPointIndex 判断点是否在shapeNode的points中]
     * @param  {[type]} point  [description]
     * @param  {[type]} offset [最小误差，默认为10]
     * @return {[type]}        [description]
     */
    getPointIndex: function (point, offset) {
        var points = this.getPoints();
        offset = offset || this._offset;
        if (points.size() < 2) {
            return -1;
        }
        for (var i = 0; i < points.size(); i++) {
            if (_twaver.math.getDistance(point, points.get(i)) <= offset) {
                return -1;
            }
        }
        var p1 = points.get(0),
            p2;
        for (var i = 1; i < points.size(); i++) {
            p2 = points.get(i);
            if (this.isPointOnLine(point, p1, p2, offset)) {
                return i - 1;
            }
            p1 = p2;
        }
        p1 = points.get(0);
        if (this.isPointOnLine(point, p1, p2, offset)) {
            return points.size() - 1;
        }
        return -1;
    },
    isPointOnLine: function (point, point1, point2, width) {
        if (width < 0) {
            width = 0;
        }
        var distance = this.getDistanceFromPointToLine(point, point1, point2);
        return distance <= width && (point.x >= Math.min(point1.x, point2.x) - width) && (point.x <= Math.max(point1.x, point2.x) + width) && (point.y >= Math.min(point1.y, point2.y) - width) && (point.y <= Math.max(point1.y, point2.y) + width);
    },
    getDistanceFromPointToLine: function (point, point1, point2) {
        if (point1.x === point2.x) {
            return Math.abs(point.x - point1.x);
        }
        var lineK = (point2.y - point1.y) / (point2.x - point1.x);
        var lineC = (point2.x * point1.y - point1.x * point2.y) / (point2.x - point1.x);
        return Math.abs(lineK * point.x - point.y + lineC) / (Math.sqrt(lineK * lineK + 1));
    },
    setOffsetYofPoints: function (offset) {
        this.offsetY = offset;
    },
    setOffsetXofPoints: function (offset) {
        this.offsetX = offset;
    },
    getOffsetYofPoints: function () {
        return this.offsetY || 0;
    },
    getOffsetXofPoints: function () {
        return this.offsetX || 0;
    },
    setNegatedYInterval: function (negatedYInterval) {
        this.negatedYInterval = negatedYInterval;
    },
    getNegatedYInterval: function () {
        return this.negatedYInterval;
    }

});

make.Default.ImageShapeNodeUI = function (shapeNode, network) {
    make.Default.ImageShapeNodeUI.superClass.constructor.apply(this, arguments);
}

twaver.Util.ext('make.Default.ImageShapeNodeUI', twaver.vector.ShapeNodeUI, {
    drawDefaultBody: function (ctx) {
        var element = this._element;
        //      points = element._points;
        if (!element._points || element._points.size() < 1) return;
        var points = this._getZoomPoints();
        var segments = element._segments,
            borderWidth = element.getStyle('vector.outline.width'),
            borderPattern = element.getStyle('vector.outline.pattern'),
            lineWidth = element.getStyle('vector.outline.width'),
            strokeStyle = element.getStyle('vector.outline.color'),
            close = element.getClient('closed'),
            rect = twaver.Util.getRect(points),
            g = ctx;
        if (borderWidth > 0) {
            twaver.Util.grow(rect, borderWidth, borderWidth);
        }
        var selected = this._network.isSelected(this._element),
            resizeBorderWidth = this._element.getClient('resizeBorderWidth'),
            resizeBorderLength = this._element.getClient('resizeBorderLength'),
            resizeBorderGap = this._element.getClient('resizeBorderGap'),
            resizeBorderColor = this._element.getClient('resizeBorderColor'),
            pointsRect;


        if (selected) {
            pointsRect = _twaver.clone(rect);
        }
        g = this.setShadow(this, g);

        //draw shape node
        g.beginPath();
        //var image = twaver.Util.getImageAsset(getImagePath(element.getClient('imageSrc')));
        var src = getImagePath(element.getClient('imageSrc'));
        if (src) {
            var image = twaver.Util.getImageAsset(src);
            if (image) {
                g.fillStyle = g.createPattern(image.getImage(), 'repeat');
            } else {
                twaver.Util.registerImageByUrl(src, src, null, function () {
                    element.setClient('imageSrc-trigger', 1)
                });
            }
        }
        g.lineWidth = lineWidth;
        g.strokeStyle = strokeStyle;
        _twaver.g.drawLinePoints(g, points, borderPattern, segments, close);
        if (src) {
            g.fill();
        }
        g.stroke();

        var index = element.getClient('focusIndex');
        if (index >= 0) {
            var from = points.get(index),
                to = points.get(index === points.size() - 1 ? 0 : index + 1);
            g.beginPath();
            g.strokeStyle = element.getClient('focusColor');
            g.moveTo(from.x, from.y);
            g.lineTo(to.x, to.y);
            g.stroke();
        }

        if (selected) {
            g.lineWidth = resizeBorderWidth + 2;
            g.strokeStyle = 'black';
            g.beginPath();
            this._borderLines = [];
            var p1, p2, p3;
            p1 = {
                x: pointsRect.x - resizeBorderGap,
                y: pointsRect.y - resizeBorderGap
            };
            p2 = {
                x: p1.x,
                y: p1.y + resizeBorderLength
            };
            p3 = {
                x: p1.x + resizeBorderLength,
                y: p1.y
            };
            this._addBorderLine(g, p1, p2, p3);

            p1 = {
                x: pointsRect.x + pointsRect.width + resizeBorderGap,
                y: pointsRect.y - resizeBorderGap
            };
            p2 = {
                x: p1.x - resizeBorderLength,
                y: p1.y
            };
            p3 = {
                x: p1.x,
                y: p1.y + resizeBorderLength
            };
            this._addBorderLine(g, p1, p2, p3);

            p1 = {
                x: pointsRect.x + pointsRect.width + resizeBorderGap,
                y: pointsRect.y + pointsRect.height + resizeBorderGap
            };
            p2 = {
                x: p1.x,
                y: p1.y - resizeBorderLength
            };
            p3 = {
                x: p1.x - resizeBorderLength,
                y: p1.y
            };
            this._addBorderLine(g, p1, p2, p3);

            p1 = {
                x: pointsRect.x - resizeBorderGap,
                y: pointsRect.y + pointsRect.height + resizeBorderGap
            };
            p2 = {
                x: p1.x + resizeBorderLength,
                y: p1.y
            };
            p3 = {
                x: p1.x,
                y: p1.y - resizeBorderLength
            };
            this._addBorderLine(g, p1, p2, p3);
            g.stroke();

            g.beginPath();
            g.lineWidth = resizeBorderWidth;
            g.strokeStyle = resizeBorderColor;
            resizeBorderLength -= 1;
            p1 = {
                x: pointsRect.x - resizeBorderGap,
                y: pointsRect.y - resizeBorderGap
            };
            p2 = {
                x: p1.x,
                y: p1.y + resizeBorderLength
            };
            p3 = {
                x: p1.x + resizeBorderLength,
                y: p1.y
            };
            g.moveTo(p2.x, p2.y);
            g.lineTo(p1.x, p1.y);
            g.lineTo(p3.x, p3.y);

            p1 = {
                x: pointsRect.x + pointsRect.width + resizeBorderGap,
                y: pointsRect.y - resizeBorderGap
            };
            p2 = {
                x: p1.x - resizeBorderLength,
                y: p1.y
            };
            p3 = {
                x: p1.x,
                y: p1.y + resizeBorderLength
            };
            g.moveTo(p2.x, p2.y);
            g.lineTo(p1.x, p1.y);
            g.lineTo(p3.x, p3.y);

            p1 = {
                x: pointsRect.x + pointsRect.width + resizeBorderGap,
                y: pointsRect.y + pointsRect.height + resizeBorderGap
            };
            p2 = {
                x: p1.x,
                y: p1.y - resizeBorderLength
            };
            p3 = {
                x: p1.x - resizeBorderLength,
                y: p1.y
            };
            g.moveTo(p2.x, p2.y);
            g.lineTo(p1.x, p1.y);
            g.lineTo(p3.x, p3.y);

            p1 = {
                x: pointsRect.x - resizeBorderGap,
                y: pointsRect.y + pointsRect.height + resizeBorderGap
            };
            p2 = {
                x: p1.x + resizeBorderLength,
                y: p1.y
            };
            p3 = {
                x: p1.x,
                y: p1.y - resizeBorderLength
            };
            g.moveTo(p2.x, p2.y);
            g.lineTo(p1.x, p1.y);
            g.lineTo(p3.x, p3.y);
            g.stroke();
        }

        if (selected) {
            this.drawCoord(g);
            this.drawDim(g);
        }

    },

    validateBodyBounds: function () {
        make.Default.ImageShapeNodeUI.superClass.validateBodyBounds.call(this);

        //calculate body bounds here.
        var element = this._element;
        //      points = element._points,
        if (!element._points || element._points.size() < 1) return;
        var points = this._getZoomPoints();
        if (points.size() < 2) return;
        var borderWidth = element.getStyle('vector.outline.width');
        //      rect = twaver.Util.getRect(points);
        var rect = this.getPathRect('vector', true);

        if (borderWidth > 0) {
            twaver.Util.grow(rect, borderWidth, borderWidth);
        }
        var selected = this._network.isSelected(this._element),
            resizeBorderWidth = this._element.getClient('resizeBorderWidth'),
            resizeBorderGap = this._element.getClient('resizeBorderGap');
        if (selected) {
            twaver.Util.grow(rect, (resizeBorderWidth + resizeBorderGap) / this._network.getZoom() * 2 + 2, (resizeBorderWidth + resizeBorderGap) / this._network.getZoom() * 2 + 2);
        }

        this.addBodyBounds(rect);
    },

    _addBorderLine: function (g, p1, p2, p3) {
        this._borderLines.push({
            point1: p2,
            point2: p1
        });
        this._borderLines.push({
            point1: p1,
            point2: p3
        });
        g.moveTo(p2.x, p2.y);
        g.lineTo(p1.x, p1.y);
        g.lineTo(p3.x, p3.y);
    },

    isPointOnBorderLine: function (point) {
        if (!this._borderLines) {
            return null;
        }
        var resizeBorderWidth = this._element.getClient('resizeBorderWidth');
        for (var i = 0; i < this._borderLines.length; i++) {
            var line = this._borderLines[i];
            if (this._element.isPointOnLine(point, line.point1, line.point2, resizeBorderWidth)) {
                return Math.floor(i / 2);
            }
        }
        return null;
    },

    drawDim: function (ctx) {
        var self = this;
        var g = ctx;
        var element = this._element;
        //        var points = element.getPoints();
        var points = this._getZoomPoints();
        var logical_points = element.getPoints();
        if (!points || points.size() < 2 || !this._network.isSelected(element)) {
            return;
        }

        var rect = this.getBodyRect();
        var dimLeadLength = element.getClient('dimLeadLength'),
            dimLineOffset = element.getClient('dimLineOffset'),
            dimLineWidth = element.getClient('dimLineWidth'),
            dimColor = element.getClient('dimColor'),
            dimTextGap = element.getClient('dimTextGap'),
            dimTextFont = element.getClient('dimTextFont'),
            dimArrowWidth = element.getClient('dimArrowWidth'),
            dimArrowHeight = element.getClient('dimArrowHeight');

        var bounds = {
            x: rect.x - dimLeadLength,
            y: rect.y - dimLeadLength,
            width: rect.width + dimLeadLength * 2,
            height: rect.height + dimLeadLength * 2
        };
        if (this.isClockwise()) {
            dimLeadLength = -dimLeadLength;
        }
        this.addBodyBounds(bounds);
        g = this.setShadow(this, g);

        g.strokeStyle = dimColor;
        g.lineWidth = dimLineWidth;
        g.fillStyle = dimColor;
        g.font = dimTextFont;
        g.textAlign = 'center';
        g.textBaseline = 'middle';

        function drawDimEdge(p1, p2, distance) {
            if (distance == 0) return;
            var center = _twaver.math.getCenterPoint(p1, p2);
            var angle = angle1 = _twaver.math.getAngle(p1, p2);
            if (p2.x < p1.x) {
                angle = Math.PI + angle;
            }

            //            var distance = _twaver.math.getDistance(p1, p2);
            var text = distance.toFixed(2);
            var textWidth = g.measureText(text).width;

            var matrix = _twaver.math.createMatrix(angle, p1.x, p1.y);
            var newp1 = matrix.transform({
                x: p1.x,
                y: p1.y - dimLeadLength
            });
            var newc1 = matrix.transform({
                x: p1.x,
                y: p1.y - dimLeadLength * dimLineOffset
            });
            matrix = _twaver.math.createMatrix(angle, p2.x, p2.y);
            var newp2 = matrix.transform({
                x: p2.x,
                y: p2.y - dimLeadLength
            });
            var newc2 = matrix.transform({
                x: p2.x,
                y: p2.y - dimLeadLength * dimLineOffset
            });
            var newd1 = self.getPointBetween(newc1, newc2, (0.5 - (textWidth / 2 + dimTextGap) / distance));
            var newd2 = self.getPointBetween(newc1, newc2, (0.5 + (textWidth / 2 + dimTextGap) / distance));
            var a1 = self.getPointBetween(newc1, newc2, dimArrowWidth / distance);
            matrix = _twaver.math.createMatrix(angle, a1.x, a1.y);
            var a11 = matrix.transform({
                x: a1.x,
                y: a1.y - dimArrowHeight
            });
            var a12 = matrix.transform({
                x: a1.x,
                y: a1.y + dimArrowHeight
            });
            var a2 = self.getPointBetween(newc1, newc2, 1 - dimArrowWidth / distance);
            matrix = _twaver.math.createMatrix(angle, a2.x, a2.y);
            var a21 = matrix.transform({
                x: a2.x,
                y: a2.y - dimArrowHeight
            });
            var a22 = matrix.transform({
                x: a2.x,
                y: a2.y + dimArrowHeight
            });

            g.beginPath();
            g.moveTo(p1.x, p1.y);
            g.lineTo(newp1.x, newp1.y);
            g.moveTo(p2.x, p2.y);
            g.lineTo(newp2.x, newp2.y);

            g.moveTo(newc1.x, newc1.y);
            g.lineTo(newd1.x, newd1.y);
            g.moveTo(newd2.x, newd2.y);
            g.lineTo(newc2.x, newc2.y);

            g.moveTo(newc1.x, newc1.y);
            g.lineTo(a11.x, a11.y);
            g.moveTo(newc1.x, newc1.y);
            g.lineTo(a12.x, a12.y);
            g.moveTo(newc2.x, newc2.y);
            g.lineTo(a21.x, a21.y);
            g.moveTo(newc2.x, newc2.y);
            g.lineTo(a22.x, a22.y);
            g.stroke();

            g.save();
            center = {
                x: (newc1.x + newc2.x) / 2,
                y: (newc1.y + newc2.y) / 2
            };
            g.translate(center.x, center.y);
            g.rotate(angle1);
            g.translate(-center.x, -center.y);
            g.fillText(text, center.x, center.y);
            g.restore();
        }

        var p1 = points.get(0);
        var logical_p1 = logical_points.get(0);
        for (var i = 1, n = points.size(); i < n; i++) {
            var p2 = points.get(i);
            var logical_p2 = logical_points.get(i);
            var distance = _twaver.math.getDistance(logical_p1, logical_p2);
            logical_p1 = logical_p2;
            drawDimEdge(p1, p2, distance);
            p1 = p2;
        }
        if (n > 2) {
            var distance = _twaver.math.getDistance(logical_p1, logical_points.get(0));
            drawDimEdge(p1, points.get(0), distance);
        }

    },

    getPointBetween: function (p1, p2, ratio) {
        return {
            x: p1.x + (p2.x - p1.x) * ratio,
            y: p1.y + (p2.y - p1.y) * ratio
        };
    },
    // http://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-points-are-in-clockwise-order
    isClockwise: function (points) {
        var element = this._element;
        var points = element.getPoints();
        if (!points || points.size() < 2) {
            return true;
        }
        var sum = 0,
            l = points.size();
        for (var i = 0; i < l; i++) {
            var p1 = points.get(i);
            var p2 = points.get((i + 1 === l ? 0 : (i + 1)));
            sum += (p2.x - p1.x) * (p2.y + p1.y);
        }
        return sum > 0;
    },

    drawCoord: function (ctx) {
        var g = ctx;
        var self = this;
        var element = this._element;
        //        var points = element.getPoints();
        var points = this._getZoomPoints();
        var logicalPoints = element.getPoints();
        if (!points) {
            return;
        }
        if (!logicalPoints) {
            return;
        }
        var rect = this.getBodyRect();

        var coordTextColor = element.getClient('coordTextColor'),
            coordTextFont = element.getClient('coordTextFont'),
            coordTextOffsetX = element.getClient('coordTextOffsetX'),
            coordTextOffsetY = element.getClient('coordTextOffsetY'),
            coordTextAlign = element.getClient('coordTextAlign'),
            coordTextBaseline = element.getClient('coordTextBaseline'),
            coordTextBackground = element.getClient('coordTextBackground'),
            decimalNumber = element.getClient('decimalNumber');

        //expend bounds to enough area to hold all text.
        var bounds = {
            x: rect.x - 100,
            y: rect.y - 50,
            width: rect.width + 200,
            height: rect.height + 100
        };
        this.addBodyBounds(bounds);
        g = this.setShadow(this, g);

        g.save();
        g.font = coordTextFont;
        for (var i = 0, n = points.size(); i < n; i++) {
            var p = points.get(i);
            var logical_p = logicalPoints.get(i);
            var text = '(' + (p.x + element.getOffsetXofPoints()).toFixed(decimalNumber) + ', ' + (p.y * (element.getNegatedYInterval() ? -1 : 1) + element.getOffsetYofPoints()).toFixed(decimalNumber) + ')';
            if (logical_p) {
                text = '(' + (logical_p.x + element.getOffsetXofPoints()).toFixed(decimalNumber) + ', ' + (logical_p.y * (element.getNegatedYInterval() ? -1 : 1) + element.getOffsetYofPoints()).toFixed(decimalNumber) + ')';
            }
            var size = _twaver.g.getTextSize(g.font, text);
            g.fillStyle = coordTextBackground;
            g.fillRect(p.x - size.width / 2 + coordTextOffsetX, p.y - size.height / 2 + coordTextOffsetY, size.width, size.height);
            g.fillStyle = coordTextColor;
            g.textAlign = coordTextAlign;
            g.textBaseline = coordTextBaseline
            g.fillText(text, p.x, p.y + coordTextOffsetY); //p.x + coordTextOffsetX
        }
        g.restore();
    }
});

make.Default.WallShapeNode = function(){
    make.Default.WallShapeNode.superClass.constructor.apply(this, arguments);
}

twaver.Util.ext(make.Default.WallShapeNode, make.Default.ImageShapeNode, {});

make.Default.InnerWallShapeNode = function () {
    make.Default.InnerWallShapeNode.superClass.constructor.apply(this, arguments);
    //设置image为空，解决大套小无法选中问题
    this.setClient('imageSrc', null);
    this.setStyle("vector.outline.color", "#333333");
    this.setStyle("vector.outline.width", 5);
    this.setClient("closed", false);
    this.setClient('showFloor', false);
    this.setClient('focusColor', 'green');
    this.setClient('resizeBorderWidth', 10);
    this.setClient('resizeBorderLength', 25);
    this.setClient('resizeBorderGap', 10);
    this.setClient('resizeBorderColor', 'yellow');
    this.setClient('size', {x: 0, y: 230, z: 4});
    this.setClient('repeat', {row: 1, column: 1});
}

twaver.Util.ext(make.Default.InnerWallShapeNode, make.Default.WallShapeNode, {});

make.Default.FloorShapeNode = function () {
    make.Default.FloorShapeNode.superClass.constructor.apply(this, arguments);

    this.setClient('imageSrc', 'floor.png');
    this.setStyle("vector.outline.color", "#FFFFFF");
    this.setStyle("vector.outline.width", 0);
    this.setClient("closed", true);
    this.setClient('focusColor', 'blue');
    this.setClient('repeat', 100);
    this.setClient('size', {x: 0, y: 0, z: 0.1});
}

twaver.Util.ext('make.Default.FloorShapeNode', make.Default.ImageShapeNode, {});

make.Default.LineWidthShapeNode = function() {
    make.Default.LineWidthShapeNode.superClass.constructor.apply(this, arguments);
    this.setStyle("vector.outline.color", "#B45F04");
    this.setStyle("vector.outline.width", 5);
    this.setStyle("vector.fill.color", "rgba(184,211,240,0)");
    this.setClient("closed", false);
    this.setClient('size',{x:0,y:0,z:0.1});
    this.setClient('transparent',false);
    this.setClient('opacity',1);
    this.setClient('fill',false);
}

twaver.Util.ext(make.Default.LineWidthShapeNode, make.Default.ImageShapeNode, {
    
});
/**
 * modelDefaultParameters 格式说明
 {
    id: {
        name: 'name', //属性名称
        value: 'value', //属性值
        valueType: 'string',//属性值类型  //PROPERTY_VALUE_TYPE: 'string', // 'string', 'boolean', 'color', 'int', 'number'
        propertyType: 'client', //属性类型 //PROPERTY_PROPERTY_TYPE: 'accessor', // 'field', 'accessor', 'style', 'client'
        editable:true, //是否可以编辑
        category:'Detail' //属性类别
    }
}
 */

var getIdcIconPath = function (icon) {
    if (icon.indexOf('/') > 0) {
        return icon;
    }
    return make.Default.path + 'model/idc/icons/' + icon;
}

var getIdcImagePath = function(image) {
    if (image.indexOf('/') >= 0 || image.indexOf('base64') >= 0) {
        return image;
    }
    return make.Default.path + 'model/idc/images/' + image;
}
var getIdcSVGPath = function (image) {
    if (image.indexOf('/') > 0) {
        return image;
    }
    if (image.length > 4 && image.lastIndexOf('.svg') == image.length - 4) {
        return make.Default.path + 'model/idc/svg/' + image;
    } else {
        return make.Default.path + 'model/idc/svg/' + image + '.svg';
    }
}

var idcLayer = {
    'wall': 100,
    'area': 200,
    'innerWall': 300,
    'wallChild': 400,
    'innerWallChild': 500,
    'channel': 600,
    'rack': 700,
    'default': 800
}

var getModelParameters = function (name, description, icon, category, categoryNumber, order, modelParams, type, layer) {
    return {
        name: name || "外墙",
        description: description || "外墙说明",
        icon: getIdcIconPath(icon || 'column.png'),
        category: category || '默认模型',
        categoryNumber: categoryNumber || 10,
        order: order || 10,
        type: type || 'twaver.Node',
        layer: layer || idcLayer.default,
        modelDefaultParameters: modelParams || {},
    }
}

var get2dBasicParameters = function (arg, resizeable) {
    arg = arg || {};
    var result = {
        'bid': {
            name: "业务ID",
            value: undefined,
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT
        },
        width: {
            name: "宽度",
            value: arg.width,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR
        },
        height: {
            name: "厚度",
            value: arg.depth,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
            hidden: false,
        },
        x: {
            name: "X轴位置",
            value: 0,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
            exportable: false,
        },
        y: {
            name: "Z轴位置",
            value: 0,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
            exportable: false,
        },
        angle: {
            name: "Y轴旋转",
            value: 0,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
            exportable: false,
        },
    }
    if (resizeable === false) {
        result.width.editable = false;
        result.height.editable = false;
    }
    return result;
}

var getRegister = function (width, depth, color) {
    return function (json) {
        var modelJson = {
            width: width,
            depth: depth,
            client: {
                type: 'model'
            }
        }
        if (color) modelJson.color = color;
        make.Default.copyProperties(json, modelJson);
        var model = make.Default.createNode(modelJson);
        return model;
    }
}

var get2dRackParameters = function (arg) {
    arg = arg || {};
    return {
        'bid': {
            name: "业务ID",
            value: undefined,
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT
        },
        width: {
            name: "宽度",
            value: arg.width,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR
        },
        height: {
            name: "厚度",
            value: arg.depth,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
            hidden: false,
        },
        x: {
            name: "X轴位置",
            value: 0,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
            exportable: false,
        },
        y: {
            name: "Z轴位置",
            value: 0,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
            exportable: false,
        },
        position: {
            name: "位置",
            value: [0, 0, 0],
            type: make.Default.PARAMETER_TYPE_ARRAY_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
            hidden: true,
        },
        angle: {
            name: "Y轴旋转",
            value: 0,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
            exportable: false,
        },
    }
}

var get2dWaterCableParameters = function (args) {
    args = args || {};
    return {
        'bid': {
            name: "业务ID",
            value: undefined,
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT
        },
        x: {
            name: "X轴位置",
            value: 0,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
            exportable: false,
        },
        y: {
            name: "Z轴位置",
            value: 0,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
            exportable: false,
        },
        position: {
            name: "位置",
            value: [0, 0, 0],
            type: make.Default.PARAMETER_TYPE_ARRAY_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
            hidden: true,
        },
        angle: {
            name: "Y轴旋转",
            value: 0,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
            exportable: false,
        },
        color: {
            name: "颜色",
            value: '#B45F04',
            type: make.Default.PARAMETER_TYPE_COLOR,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
            hidden: true,
        },
        "vector.outline.color": {
            name: "颜色",
            value: '#B45F04',
            type: make.Default.PARAMETER_TYPE_COLOR,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_STYLE,
            exportable: false,
        },
    }
}

var get2dObjParameters = function (arg) {
    arg = arg || {};
    return {
        'bid': {
            name: "业务ID",
            value: undefined,
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT
        },
        x: {
            name: "X轴位置",
            value: 0,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
            exportable: false,
        },
        y: {
            name: "Z轴位置",
            value: 0,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
            exportable: false,
        },
        position: {
            name: "位置",
            value: [0, 200, 0],
            type: make.Default.PARAMETER_TYPE_ARRAY_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
            hidden: true,
        },
        "positionY": {
            name: "离地高度",
            value: 200,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
            exportable: false,
        },
        angle: {
            name: "Y轴旋转",
            value: 0,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
            exportable: false,
        },
    }
}

var get2dWallDefaultParameters = function(){
    return {
        'bid': {
            name: "业务ID",
            value: undefined,
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT
        },
        'wallHeight': {
            name: "墙高",
            value: 260,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT
        }
    }
}

make.Default.register('twaver.idc.wall.top', function (json) {
    var wallJson = {
        objType: 'wall',
        client: {
            'data': json.data,
            'type': 'wall',
        }
    }
    make.Default.copyProperties(json, wallJson);
    var wall = make.Default.create2dShapeNode(wallJson);
    var children = json.children;
    if (children) {
        children.forEach(function (child) {
            var childNode = make.Default.load(child);
            childNode.setParent(wall);
        });
    }
    return wall;
}, getModelParameters("外墙", "外墙说明", 'wall.png', '2d房间模型', 10, 10, get2dWallDefaultParameters(), 'wall', idcLayer.wall));

make.Default.register('twaver.idc.wall1.top', function (json) {
    var wall = {
        id: 'twaver.idc.wall.top',
    }
    var wallData = {
        data: [
            [-2000, -2000],
            [2000, -2000],
            [2000, 2000],
            [-2000, 2000]
        ],
    }
    make.Default.copyProperties(json, wall);
    make.Default.copyProperties(wallData, wall);
    return make.Default.load(wall);
}, getModelParameters("外墙1", "外墙说明", 'wall1.png', '2d房间模型', 10, 20, {
    'bid': {
        name: "业务ID",
        value: undefined,
        type: make.Default.PARAMETER_TYPE_STRING,
        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT
    },
}, 'wall1', idcLayer.wall));

make.Default.register('twaver.idc.wall2.top', function (json) {
    var wall = {
        id: 'twaver.idc.wall.top',
    }
    var wallData = {
        data: [
            [-2500, -2500],
            [0, -2500],
            [0, 0],
            [2500, 0],
            [2500, 2500],
            [-2500, 2500]
        ],
    }
    make.Default.copyProperties(json, wall);
    make.Default.copyProperties(wallData, wall);
    return make.Default.load(wall);
}, getModelParameters("外墙2", "外墙说明", 'wall2.png', '2d房间模型', 10, 20, get2dWallDefaultParameters(), 'wall2', idcLayer.wall));

make.Default.register('twaver.idc.wall3.top', function (json) {
    var wall = {
        id: 'twaver.idc.wall.top',
    }
    var wallData = {
        data: [
            [-2500, -500],
            [-1300, -500],
            [-1300, -2500],
            [1300, -2500],
            [1300, -500],
            [2500, -500],
            [2500, 2500],
            [-2500, 2500]
        ],
    }
    make.Default.copyProperties(json, wall);
    make.Default.copyProperties(wallData, wall);
    return make.Default.load(wall);
}, getModelParameters("外墙3", "外墙说明", 'wall3.png', '2d房间模型', 10, 20, get2dWallDefaultParameters(), 'wall3', idcLayer.wall));

make.Default.register('twaver.idc.wall4.top', function (json) {
    var wall = {
        id: 'twaver.idc.wall.top',
    }
    var wallData = {
        data: [
            [-2500, -500],
            [-1500, -500],
            [-1000, -2500],
            [1000, -2500],
            [1500, -500],
            [2500, -500],
            [2500, 2500],
            [-2500, 2500]
        ],
    }
    make.Default.copyProperties(json, wall);
    make.Default.copyProperties(wallData, wall);
    return make.Default.load(wall);
}, getModelParameters("外墙4", "外墙说明", 'wall4.png', '2d房间模型', 10, 20, get2dWallDefaultParameters(), 'wall4', idcLayer.wall));

make.Default.register('twaver.idc.innerWall.top', function (json) {
    var wallJson = {
        objType: 'innerWall',
        client: {
            'data': json.data,
            'type': 'innerWall',
        },
    };
    make.Default.copyProperties(json, wallJson);
    var innerWall = make.Default.create2dShapeNode(wallJson);
    var children = json.children;
    if (children) {
        children.forEach(function (child) {
            var childNode = make.Default.load(child);
            childNode.setParent(innerWall);
        });
    }
    return innerWall;
}, getModelParameters("内墙", "内墙说明", 'innerWall.png', '2d房间模型', 10, 20, get2dWallDefaultParameters(), 'innerWall', idcLayer.innerWall));


make.Default.register('twaver.idc.floor.top', function (json) {
    var floorJson = {
        objType: 'floor',
        client: {
            'data': json.data,
            'type': 'floor',
        },
    };
    make.Default.copyProperties(json, floorJson);
    var floor = make.Default.create2dShapeNode(floorJson);
    return floor;
}, getModelParameters("楼层", "楼层说明", 'floor.png', '2d房间模型', 10, 20, {}, 'floor', idcLayer.wallChild));

var getArea2DParameters = function () {
    var result = {
        'bid': {
            name: "业务ID",
            value: undefined,
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT
        },
        width: {
            name: "宽度",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
            editable: false,
        },
        height: {
            name: "厚度",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
            editable: false,
        },
        label: {
            name: "标签",
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
        },
        "label.xoffset": {
            name: "标签位置X",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_STYLE,
        },
        "label.yoffset": {
            name: "标签位置Z",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_STYLE,
        },
        "label.color": {
            name: "标签颜色",
            value: 'red',
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_STYLE,
        },
        "label.font": {
            name: "标签字体",
            value: 'bold 36px 微软雅黑,sans-serif',
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_STYLE,
        },
        opacity: {
            name: "透明度",
            value: 0.05,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
        }
    }
    return result;
}
make.Default.register('twaver.idc.area.top', function (json) {
    var areaJson = {
        objType: 'floor',
        client: {
            'data': json.data,
            'type': 'area',
        },
        style: {
            "shapenode.closed": true,
            "vector.outline.color": "#B45F04",
            "vector.outline.width": 4,
            "label.position": 'center',
            "vector.fill.color": '#D2E5FD'
        }
    }
    make.Default.copyProperties(json, areaJson);
    areaJson.data = areaJson.data || [];
    areaJson.position = areaJson.position || [0, 0, 0];
    var area = new twaver.ShapeNode(json.objectId);
    var children = json.children;
    if (children) {
        children.forEach(function (child) {
            var childNode = make.Default.load(child);
            childNode.setParent(area);
        });
    }
    var pathObject = make.Default.create2dShapePath(areaJson.data, areaJson.position);
    area.setSegments(pathObject.segments);
    area.setPoints(pathObject.points);
    make.Default.setObject2dCSProps(area, areaJson);
    return area;
}, getModelParameters("机房", "机房说明", 'area.png', '2d房间模型', 10, 10, getArea2DParameters(), 'area', idcLayer.area));

make.Default.register('twaver.idc.door.top', function (json) {
    var doorJson = {
        client: {
            type: 'door',
            bid: json.bid,
        }
    };
    make.Default.copyProperties(json, doorJson);
    var door = make.Default.createBlockObject(doorJson, 'door');
    return door;
}, getModelParameters("玻璃门", "双开玻璃门", 'door.png', '2d房间模型', 10, 30, {
    'bid': {
        name: "业务ID",
        value: undefined,
        type: make.Default.PARAMETER_TYPE_STRING,
        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT
    },
}, 'door', idcLayer.wallChild));

make.Default.copy('twaver.idc.door1.top', 'twaver.idc.door.top', {}, {
    name: "玻璃门",
    description: "单开玻璃门",
    icon: getIdcIconPath('door1.png')
});
make.Default.copy('twaver.idc.door2.top', 'twaver.idc.door.top', {}, {
    name: "白色门",
    description: "单开白色门",
    icon: getIdcIconPath('door2.png')
});
make.Default.copy('twaver.idc.door3.top', 'twaver.idc.door.top', {}, {
    name: "蓝色门",
    description: "蓝色双开门",
    icon: getIdcIconPath('door3.png')
});
make.Default.copy('twaver.idc.door4.top', 'twaver.idc.door.top', {}, {
    name: "蓝色门",
    description: "蓝色单开门",
    icon: getIdcIconPath('door4.png')
});
make.Default.copy('twaver.idc.door6.top', 'twaver.idc.door.top', {}, {
    name: "红色门",
    description: "红色双开门",
    icon: getIdcIconPath('door6.png')
});
make.Default.copy('twaver.idc.door7.top', 'twaver.idc.door.top', {}, {
    name: "蓝色门",
    description: "蓝色单开门",
    icon: getIdcIconPath('door7.png')
});
make.Default.copy('twaver.idc.door8.top', 'twaver.idc.door.top', {}, {
    name: "蓝色门",
    description: "蓝色双开门",
    icon: getIdcIconPath('door8.png')
});
make.Default.copy('twaver.idc.door9.top', 'twaver.idc.door.top', {}, {
    name: "玻璃门",
    description: "双开玻璃门",
    icon: getIdcIconPath('door9.png')
});
make.Default.copy('twaver.idc.door10.top', 'twaver.idc.door.top', {}, {
    name: "双开门",
    description: "双开门",
    icon: getIdcIconPath('door10.png')
});
make.Default.copy('twaver.idc.door11.top', 'twaver.idc.door.top', {}, {
    name: "双开门",
    description: "双开门",
    icon: getIdcIconPath('door10.png')
});
make.Default.copy('twaver.idc.door12.top', 'twaver.idc.door.top', {}, {
    name: "双开门",
    description: "双开门",
    icon: getIdcIconPath('door10.png')
});
make.Default.copy('twaver.idc.door13.top', 'twaver.idc.door.top', {}, {
    name: "双开门",
    description: "双开门",
    icon: getIdcIconPath('door10.png')
});
make.Default.copy('twaver.idc.door14.top', 'twaver.idc.door.top', {}, {
    name: "双开门",
    description: "双开门",
    icon: getIdcIconPath('door10.png')
});
make.Default.copy('twaver.idc.door15.top', 'twaver.idc.door.top', {}, {
    name: "双开门",
    description: "双开门",
    icon: getIdcIconPath('door10.png')
});
make.Default.copy('twaver.idc.door16.top', 'twaver.idc.door.top', {}, {
    name: "单开门",
    description: "双开门",
    icon: getIdcIconPath('door10.png')
});
make.Default.copy('twaver.idc.door17.top', 'twaver.idc.door.top', {}, {
    name: "单开门",
    description: "双开门",
    icon: getIdcIconPath('door17.png')
});
make.Default.register('twaver.idc.window.top', function (json) {
    var windowJson = {
        client: {
            type: 'window',
            bid: json.bid,
        }
    };
    make.Default.copyProperties(json, windowJson);
    var window = make.Default.createBlockObject(windowJson, 'window');
    return window;
}, getModelParameters("窗户", "窗户说明", 'window.png', '2d房间模型', 10, 40, {
    'bid': {
        name: "业务ID",
        value: undefined,
        type: make.Default.PARAMETER_TYPE_STRING,
        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT
    },
}, 'window', idcLayer.wallChild));

make.Default.copy('twaver.idc.window2.top', 'twaver.idc.window.top', {}, {});
make.Default.copy('twaver.idc.window3.top', 'twaver.idc.window.top', {}, {});



var getColumn2DParameters = function () {
    var result = {
        x: {
            name: "X轴位置",
            value: 0,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
            exportable: false,
        },
        y: {
            name: "Z轴位置",
            value: 0,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
            exportable: false,
        },
        width: {
            name: "宽度",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
            editable: false,
        },
        height: {
            name: "厚度",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
            editable: false,
        },
        angle: {
            name: "Y轴旋转",
            value: 0,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
            exportable: false,
        },
    }
    return result;
}
make.Default.register('twaver.idc.column.top', function (json) {
    var colJson = {
        client: {
            type: 'column',
            bid: json.bid,
        },
        style: {
            'vector.fill.color': '#BDBCBC',
        }
    };
    make.Default.copyProperties(json, colJson);
    var column = make.Default.createNode(colJson);
    return column;
}, getModelParameters("柱子", "柱子说明", 'column.png', '2d房间模型', 10, 40, getColumn2DParameters(), 'column', idcLayer.wallChild));

make.Default.register('twaver.idc.rack.top', function (json) {
    json.client = json.client || {};
    var rackJson = {
        image: json.image || getIdcSVGPath('racktop'),
        width: json.width,
        depth: json.depth,
        client: {
            type: json.client.type || 'rack'
        }
    }
    make.Default.copyProperties(json, rackJson);
    var rack = make.Default.createNode(rackJson);
    return rack;
}, getModelParameters("42U机柜", "机柜说明", 'rack.png', '2d机柜模型', 20, 10 + (47 - 42) * 10, get2dRackParameters({
    width: 60,
    depth: 80,
    height: make.Default.getRackHeight(47)
}), 'rack', idcLayer.rack));

var registerRack2d = function (size) {
    make.Default.register('twaver.idc.rack' + size + '.top', function (json) {
        json.id = 'twaver.idc.rack.top';
        return make.Default.load(json);
    }, getModelParameters(size + "U机柜", "机柜说明", 'rack.png', '2d机柜模型', 20, 10 + (size - 42) * 10, get2dRackParameters({
        width: 60,
        depth: 80,
        height: make.Default.getRackHeight(size)
    }), 'rack', idcLayer.rack));
}

for (var i = 42; i <= 47; i++) {
    registerRack2d(i);
}


make.Default.register('twaver.idc.headerRack.top', function (json) {
    json.id = 'twaver.idc.rack.top';
    json.image = json.image || getIdcSVGPath('headerracktop');
    json.client = json.client || {};
    json.client.type = 'header_rack';
    return make.Default.load(json);
}, getModelParameters("列头柜", "列头柜说明", 'headerRack.png', '2d机柜模型', 20, 30, get2dBasicParameters({
    width: 60,
    depth: 80,
    height: 200
}), 'header_rack', idcLayer.rack));

var getAisle2DParameters = function () {
    return {
        bid: {
            name: "BID",
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT
        },
        'x': {
            name: "X轴位置",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
            exportable: false,
        },
        'y': {
            name: "Z轴位置",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
            exportable: false,
        },
        angle: {
            name: "Y轴旋转",
            value: 0,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
            exportable: false,
        },
        'rackWidth': {
            name: "机柜宽度",
            value: 60,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'rackDepth': {
            name: "机柜深度",
            value: 80,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'rackHeight': {
            name: "机柜高度",
            value: 220,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'rackNumber': {
            name: "机柜数量",
            value: 20,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'aisleDepth': {
            name: "通道深度",
            value: 140,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'isSingle': {
            name: "是否为单通道",
            value: false,
            type: make.Default.PARAMETER_TYPE_BOOLEAN,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'side': {
            name: "单通道类型", //可选值： left 或 right
            value: 'right',
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'showRack': {
            name: "显示机柜", //
            value: true,
            type: make.Default.PARAMETER_TYPE_BOOLEAN,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT
        },
        'isPhysicalPosition': {
            name: "物理坐标", //
            value: false,
            type: make.Default.PARAMETER_TYPE_BOOLEAN,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT
        },
        width: {
            name: "宽度",
            value: null,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR
        },
        height: {
            name: "厚度",
            value: null,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
            hidden: false,
        }
    }
}
var getRackByLoc = function (data, loc) {
    if (data.getClient('showRack')) {
        var id = data.getClient(loc);
        if (id) {
            return id;
        }
    }
    return '';
    //return loc;
}

var getAisleImage = function () {
    var vectorImage = {
        //w:'<%=getWidth()%>',
        //h:'<%=getHeight()%>',
        font: '20px arial',
        origin: { x: 0, y: 0 },
        clip: true,
        //shadow: {blur: 5, color: '#61B6D8'},
        v: [{
            shape: 'draw',
            draw: function (g, data, view) {


                var isSingle = !!data.isSingle;
                var side = data.side || 'right';


                var aisleDepth = data.aisleDepth;

                var racks = data.racks || [];
                var isPhysicalPosition = !!data.getClient('isPhysicalPosition');

                var count = data.rackNumber;
                var rackWidth = data.rackWidth;
                var rackDepth = data.rackDepth;
                //双通道传入的机柜数量是两排的总数
                var oneCount = isSingle ? count : count / 2;
                //总宽度
                var width = rackWidth * oneCount;
                //总高度
                var height = aisleDepth + rackDepth * (isSingle ? 1 : 2);

                var textWidthMax = rackWidth - 4;

                var channelColor = data.getClient('channel.color') || '#61B6ef';

                var labelFont = data.getClient('channel.label.font') || '24px arial';
                var locationFont = data.getClient('channel.location.font') || '20px arial';
                var rackTextFont = data.getClient('channel.rackText.font') || '10px arial';

                var labelColor = data.getClient('channel.label.color') || '#61B6ef';
                var locationColor = data.getClient('channel.location.color') || '#61B6ef';
                var rackTextColor = data.getClient('channel.rackText.color') || '#61B6ef';

                //
                if (isPhysicalPosition) {

                    width = data.getWidth();
                    height = data.getHeight();
                }


                /**
                 * 绘制机柜
                 * @param x
                 * @param y
                 * @param rackWidth
                 * @param rackDepth
                 * @param rackText
                 */
                function drawRack(x, y, rackWidth, rackDepth, rackText) {

                    //机柜边框
                    g.drawShape({
                        shape: 'rect',
                        rect: [x, y, rackWidth, rackDepth],
                        lineWidth: 1,
                    });
                    //机柜编号
                    g.drawShape({
                        shape: 'text',
                        text: rackText,
                        textAlign: 'center',
                        textBaseline: 'center',
                        font: rackTextFont,
                        fill: rackTextColor,
                        w: textWidthMax,
                        x: x + rackWidth / 2,
                        y: y + rackDepth / 2,
                    });
                }

                /**
                 * 绘制位置
                 * @param x
                 * @param y
                 * @param locText
                 */
                function drawLoc(x, y, locText) {
                    g.drawShape({
                        shape: 'text',
                        text: locText,
                        textAlign: 'center',
                        textBaseline: 'center',
                        font: locationFont,
                        fill: locationColor,
                        x: x,
                        y: y,
                    });
                }


                function drawChannel() {

                    //最大的边框
                    g.drawShape({
                        shape: 'rect',
                        rect: [0, 0, width, height],
                        fill: '#f5f5f5',
                        lineWidth: 3,
                        lineColor: channelColor,
                    })

                    if (!isSingle) { //双通道

                        g.drawShape({
                            shape: 'rect',
                            rect: [0, rackDepth, width, aisleDepth],
                            lineWidth: 1
                        });

                    } else { // 单通道
                        if (side == 'right') { //上排摆机柜

                            g.drawShape({
                                shape: 'rect',
                                rect: [0, rackDepth, width, aisleDepth],
                                lineWidth: 1
                            });
                        } else { //下排拍机柜
                            g.drawShape({
                                shape: 'rect',
                                rect: [0, 0, width, aisleDepth],
                                lineWidth: 1
                            });
                        }
                    }
                }

                drawChannel();

                if (isPhysicalPosition) {

                    var len = racks.length;
                    for (var i = 0; i < len; i++) {
                        var rack = racks[i];
                        var rackWidth = null;
                        var rackDepth = null;
                        var rackText = rack.id;
                        var rackAngle = rack.angle || 0;
                        if (rackAngle % 180 === 0) {
                            rackWidth = rack.width;
                            rackDepth = rack.depth;
                        } else {
                            rackWidth = rack.depth;
                            rackDepth = rack.width;
                        }
                        var x = rack.x - rackWidth / 2;
                        var y = rack.y - rackDepth / 2;
                        drawRack(x, y, rackWidth, rackDepth, rackText, rackAngle);
                    }
                } else {


                    if (!isSingle) { //双通道
                        //绘制上排
                        for (var i = 0; i < oneCount; i++) {
                            var x = (i * rackWidth);
                            var y = 0;
                            var locText = '1-' + (i + 1);
                            var rackText = getRackByLoc(data, locText);
                            drawRack(x, y, rackWidth, rackDepth, rackText);
                            drawLoc(x + rackWidth / 2, y + rackDepth + 14, locText);
                        }

                        //下排
                        for (i = 0; i < oneCount; i++) {
                            var x = (i * rackWidth);
                            var y = rackDepth + aisleDepth;
                            var locText = '2-' + (i + 1);
                            var rackText = getRackByLoc(data, locText);
                            drawRack(x, y, rackWidth, rackDepth, rackText);
                            drawLoc(x + rackWidth / 2, y - 14, locText);
                        }
                    } else { // 单通道
                        if (side == 'right') { //上排摆机柜
                            for (var i = 0; i < oneCount; i++) {
                                var x = (i * rackWidth);
                                var y = 0;
                                var locText = '1-' + (i + 1);
                                var rackText = getRackByLoc(data, locText);
                                drawRack(x, y, rackWidth, rackDepth, rackText);
                                drawLoc(x + rackWidth / 2, y + rackDepth + 14, locText);
                            }

                        } else { //下排拍机柜

                            for (i = 0; i < oneCount; i++) {
                                var x = (i * rackWidth);
                                var y = aisleDepth;
                                drawRack(x, y, rackWidth, rackDepth, rackText);
                                drawLoc(x + rackWidth / 2, y - 14, locText);
                            }
                        }
                    }
                }
            },
        }]
    };
    return vectorImage;
};

var getAisleSize = function (args) {
    var w, h;
    //单通道
    if (args.isSingle) {
        w = args.rackWidth * args.rackNumber;
        h = args.aisleDepth + args.rackDepth;
    } else {
        w = args.rackWidth * args.rackNumber / 2;
        h = args.aisleDepth + args.rackDepth * 2;
    }
    return { width: w, height: h };
}

make.Default.register('twaver.idc.aisle.top', function (json) {

    json.client = json.client || {};

    var racks = json.racks; //所有机柜列表
    var isPhysicalPosition = !!racks || json.client.isPhysicalPosition;// 坐标是否物理坐标,针对机柜尺寸不一致的方式

    var size = getAisleSize(json);

    //第一次,如果传入了尺寸,说明是CAD中导入的新建机柜,根据外面的尺寸计算里面的机柜数量
    if (json.width) {
        size.width = json.width;

        // 逻辑坐标才需要计算
        if (!isPhysicalPosition) {
            json.rackNumber = parseInt(json.width / json.rackWidth);
            if (!json.isSingle) {
                json.rackNumber = json.rackNumber * 2;
            }
        }
    }
    if (json.depth) {
        size.height = json.depth;

        // 逻辑坐标才需要计算
        if (!isPhysicalPosition) {
            if (json.isSingle) {
                json.aisleDepth = json.depth - json.rackDepth;
            } else {
                json.aisleDepth = json.depth - json.rackDepth - json.rackDepth;
            }
        }
    }
    var data = {
        width: size.width,
        depth: size.height,
        client: {
            type: json.client.type || 'channel',
            isPhysicalPosition: isPhysicalPosition,
        }
    }
    make.Default.copyProperties(json, data);
    var image = getAisleImage();
    data.image = image;
    var aisle = make.Default.createNode(data);
    aisle.ready = false;
    aisle.setStyle('label.font', '30px arial');
    aisle.setStyle('label.color', '#61B6ef');

    function setterFilter(newValue, scope, field) {

        if (this.ready) {
            //等待值设置完成后,更新尺寸;
            setTimeout(function () {

                // 逻辑定位是, 需要重新计算通道尺寸
                if (!isPhysicalPosition) {
                    var size = getAisleSize(scope);
                    scope.setSize(size);
                }

                scope.setClient(field, newValue);
                if (scope.isSingle) {
                    if (scope.side == 'right') {
                        scope.setStyle('label.yoffset', scope.rackWidth / 2);
                    } else {
                        scope.setStyle('label.yoffset', -scope.rackWidth / 2);
                    }
                } else {
                    scope.setStyle('label.yoffset', 0);
                }
            }, 1)
        }
        return newValue;
    }

    make.Default.objectWrapper(aisle, 'rackWidth', null, setterFilter);
    make.Default.objectWrapper(aisle, 'rackDepth', null, setterFilter);
    make.Default.objectWrapper(aisle, 'rackHeight', null, setterFilter);
    make.Default.objectWrapper(aisle, 'rackNumber', null, setterFilter);
    make.Default.objectWrapper(aisle, 'aisleDepth', null, setterFilter);
    make.Default.objectWrapper(aisle, 'isSingle', null, setterFilter);
    make.Default.objectWrapper(aisle, 'side', null, setterFilter);
    make.Default.objectWrapper(aisle, 'racks', null, setterFilter);
    aisle.rackWidth = json.rackWidth;
    aisle.rackDepth = json.rackDepth;
    aisle.rackHeight = json.rackHeight;
    aisle.rackNumber = json.rackNumber;
    aisle.aisleDepth = json.aisleDepth;
    aisle.isSingle = json.isSingle;
    aisle.side = json.side;
    aisle.racks = json.racks;
    aisle.ready = true;
    if (aisle.isSingle) {
        if (aisle.side == 'right') {
            aisle.setStyle('label.yoffset', aisle.rackWidth / 2);
        } else {
            aisle.setStyle('label.yoffset', -aisle.rackWidth / 2);
        }
    } else {
        aisle.setStyle('label.yoffset', 0);
    }
    return aisle;
}, getModelParameters("通道", "通道说明", 'channel.png', '2d机柜模型', 20, 30, getAisle2DParameters(), 'channel', idcLayer.channel));

make.Default.register('twaver.idc.airCondition.top', function (json) {
    json.id = 'twaver.idc.rack.top';
    json.client = json.client || {};
    json.client.type = 'airCondition';
    return make.Default.load(json);
}, getModelParameters("空调", "空调说明", 'airCondition.png', '2d机柜模型', 20, 30, get2dBasicParameters({
    width: 100,
    depth: 80,
    height: 200
})));

make.Default.copy('twaver.idc.airCondition1.top', 'twaver.idc.airCondition.top', {}, getModelParameters("空调1", "空调说明", 'airCondition1.png', '2d机柜模型', 20, 30, get2dBasicParameters({
    width: 188,
    depth: 75,
    height: 174
})));
make.Default.copy('twaver.idc.airCondition2.top', 'twaver.idc.airCondition.top', {}, getModelParameters("空调2", "空调说明", 'airCondition2.png', '2d机柜模型', 20, 30, get2dBasicParameters({
    width: 188,
    depth: 75,
    height: 174
})));

make.Default.copy('twaver.idc.airCondition4.top', 'twaver.idc.airCondition.top', {}, getModelParameters("空调4", "空调说明", 'airCondition2.png', '2d机柜模型', 20, 30, get2dBasicParameters({
    width: 30,
    depth: 120,
    height: 200
})));

make.Default.register('twaver.idc.model.top', function (json) {
    var modelJson = {
        image: json.image || getIdcSVGPath('upstop'),
        width: json.width || 80,
        depth: json.depth || 60,
        client: {
            type: 'model'
        }
    }
    make.Default.copyProperties(json, modelJson);
    var model = make.Default.createNode(modelJson);
    return model;
});

make.Default.register('twaver.idc.alternator.top', function (json) {
    json.id = 'twaver.idc.model.top';
    json.image = json.image || getIdcIconPath('alternator.png');
    var ups = make.Default.load(json);
    return ups;
}, getModelParameters("发电机", "发电机说明", 'alternator.png', '2d机柜模型', 20, 30, get2dBasicParameters({
    width: 200,
    depth: 85,
    height: 107
})));

make.Default.register('twaver.idc.switchgear.top', function (json) {
    json.id = 'twaver.idc.model.top';
    json.width = json.width || 60;
    json.depth = json.depth || 60;
    var ups = make.Default.load(json);
    return ups;
}, getModelParameters("开关柜", "开关柜说明", 'switchgear.png', '2d机柜模型', 20, 30, get2dBasicParameters({
    width: 60,
    depth: 60,
    height: 180
})));

make.Default.register('twaver.idc.pdc.top', function (json) {
    json.id = 'twaver.idc.model.top';
    json.width = json.width || 60;
    json.depth = json.depth || 60;
    var ups = make.Default.load(json);
    return ups;
}, getModelParameters("配电柜", "配电柜说明", 'pdc.png', '2d机柜模型', 20, 30, get2dBasicParameters({
    width: 60,
    depth: 60,
    height: 180
})));

make.Default.register('twaver.idc.ups.top', function (json) {
    json.id = 'twaver.idc.model.top';
    json.image = json.image || getIdcSVGPath('upstop');
    json.width = json.width || 80;
    json.depth = json.depth || 60;
    var ups = make.Default.load(json);
    return ups;
}, getModelParameters("ups", "UPS说明", 'ups.png', '2d机柜模型', 20, 30, get2dBasicParameters({
    width: 80,
    depth: 60,
    height: 200
})));

make.Default.register('twaver.idc.battery.top', function (json) {
    json.id = 'twaver.idc.model.top';
    json.image = json.image || getIdcSVGPath('batterytop');
    json.width = json.width || 150;
    json.depth = json.depth || 60;
    var battery = make.Default.load(json);
    return battery;
}, getModelParameters("蓄电池", "蓄电池说明", 'battery.png', '2d机柜模型', 20, 30, get2dBasicParameters({
    width: 150,
    depth: 60,
    height: 80
})));

make.Default.register('twaver.idc.yangan.top', function (json) {
    json.id = 'twaver.idc.model.top';
    json.image = json.image || getIdcSVGPath('yangan');
    json.width = 33.51;
    json.depth = 33.51;
    var yangan = make.Default.load(json);
    return yangan;
}, getModelParameters("烟感", "烟感说明", 'yangan.png', '2d环境模型', 20, 30, get2dObjParameters()));

make.Default.register('twaver.idc.chuanganqi.top', function (json) {
    json.id = 'twaver.idc.model.top';
    json.image = json.image || getIdcSVGPath('wendu');
    json.width = json.width || 5.14;
    json.depth = json.depth || 10.52;
    var chuanganqi = make.Default.load(json);
    return chuanganqi;
}, getModelParameters("传感器", "传感器说明", 'wendu.png', '2d环境模型', 20, 30, get2dObjParameters()));

make.Default.register('twaver.idc.shuangjian.top', function (json) {
    json.id = 'twaver.idc.model.top';
    json.image = json.image || getIdcSVGPath('shuangjian');
    json.width = json.width || 9.21;
    json.depth = json.depth || 15.92;
    var shuangjian = make.Default.load(json);
    return shuangjian;
}, getModelParameters("双鉴", "双鉴说明", 'shuangjian.png', '2d环境模型', 20, 30, get2dObjParameters()));

make.Default.register('twaver.idc.shuijin.top', function (json) {
    json.id = 'twaver.idc.model.top';
    json.image = json.image || getIdcSVGPath('shuijin');
    json.width = json.width || 31.98;
    json.depth = json.depth || 31.98;
    var shuijin = make.Default.load(json);
    return shuijin;
}, getModelParameters("水浸", "水浸说明", 'shuijin.png', '2d环境模型', 20, 30, get2dObjParameters()));

make.Default.register('twaver.idc.watercable.top', function (json) {
    var cableJson = {
        objType: 'cable',
        client: {
            'data': json.data,
            'type': 'cable',
        }
    }
    make.Default.copyProperties(json, cableJson);
    var cable = make.Default.create2dShapeNode(cableJson);
    cable.setStyle("vector.outline.color", json.color || '#B45F04');
    return cable;

}, getModelParameters("水浸线", "水浸说明", 'cable.png', '2d环境模型', 20, 30, get2dWaterCableParameters(), 'watercable', idcLayer.innerWallChild));

make.Default.register('twaver.idc.camera.top', function (json) {
    json.id = 'twaver.idc.model.top';
    json.image = json.image || getIdcIconPath('camera.png');
    json.width = 33.51;
    json.depth = 33.51;
    json.style = json.style || { 'label.font': '10px', 'label.position': 'bottom' };
    var node = make.Default.load(json);
    return node;
}, getModelParameters("摄像头", "摄像头说明", 'camera.png', '2d环境模型', 20, 30, get2dObjParameters()));

make.Default.register('twaver.idc.camera1.top', function (json) {
    json.id = 'twaver.idc.model.top';
    json.image = json.image || getIdcIconPath('camera1.png');
    json.width = 33.51;
    json.depth = 33.51;
    json.style = json.style || { 'label.font': '10px', 'label.position': 'bottom' };
    var node = make.Default.load(json);
    return node;
}, getModelParameters("摄像头1", "摄像头说明", 'camera1.png', '2d环境模型', 20, 30, get2dObjParameters()));


/******************   rackEditor begin **************************/
make.Default.register('twaver.idc.rack.front', function (json) {

    var childrenSize = json.client.childrenSize;
    var height = make.Default.getRackHeight(childrenSize);
    make.Default.copyProperties({
        imageUrl: getIdcSVGPath('rack{}U.svg'.format(childrenSize)),
        height: height,
        client: {
            host: true,
        }
    }, json);
    return make.Default.createFollower(json);
}, {

        name: '42U机柜',
        category: '机柜',
        icon: getIdcIconPath('rack42U.png'),
        offsetX: make.Default.RACK_OFFSET_X,
        offsetY: make.Default.RACK_OFFSET_Y,
        host: true,
        modelDefaultParameters: {
            'bid': {
                name: "业务ID",
                value: undefined,
                type: make.Default.PARAMETER_TYPE_STRING,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT
            },

            offsetX: {
                name: "Y轴旋转",
                value: make.Default.RACK_OFFSET_X,
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
            },
            offsetY: {
                name: "Y轴旋转",
                value: make.Default.RACK_OFFSET_Y,
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
            },
            width: {
                name: "宽度",
                value: make.Default.RACK_WIDTH,
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
            },
            childrenSize: {
                name: "容量(U)",
                value: 42,
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
            },
        }
    });



//默认机柜42U
make.Default.copy('twaver.idc.rack2.front', 'twaver.idc.rack.front');

for (var i = 42; i <= 47; i++) {
    make.Default.copy('twaver.idc.rack{}.front'.format(i), 'twaver.idc.rack.front', {}, {
        name: '{}U机柜'.format(i),
        icon: getIdcIconPath('rack{}U.png'.format(i))
    }, {
            defaultValue: { childrenSize: i }
        }
    );
    make.Default.copy('twaver.idc.rack4-{}.front'.format(i), 'twaver.idc.rack.front', {}, {
        name: '{}U机柜'.format(i),
        icon: getIdcIconPath('rack{}U.png'.format(i))
    }, {
            defaultValue: { childrenSize: i }
        });
    make.Default.copy('twaver.idc.rack2-{}.front'.format(i), 'twaver.idc.rack.front', {}, {
        name: '{}U机柜'.format(i),
        icon: getIdcIconPath('rack{}U.png'.format(i))
    }, {
            defaultValue: { childrenSize: i }
        });
}

var getServerParams = function (size) {
    return {
        name: size + 'U设备',
        modelDefaultParameters: {
            bid: {
                name: "BID",
                value: undefined,
                type: make.Default.PARAMETER_TYPE_STRING,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT
            },
            loc: {
                name: "位置",
                value: 0,
                type: make.Default.PARAMETER_TYPE_INT,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT
            },
            panel: {
                name: "面板",
                value: 'twaver.idc.equipment.newPanel',
                type: make.Default.PARAMETER_TYPE_STRING,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT
            },
            size: {
                name: "高度",
                value: 8,
                type: make.Default.PARAMETER_TYPE_INT,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
                hidden: true,
            },
            width: {
                name: "宽度",
                value: make.Default.getEquipmentWidth(),
                type: make.Default.PARAMETER_TYPE_INT,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
                hidden: true,
            },
        },
        description: size + 'U设备',
        category: '设备2D',
        icon: getIdcIconPath('server' + size + '.png'),
    }
}

make.Default.register('twaver.idc.equipment.front', function (json) {

    var size = json.client.size;
    if (json.image) {
        json.imageUrl = getIdcImagePath(json.image);
        delete json.image;
    } else {
        json.imageUrl = getIdcSVGPath('u-0' + size);
    }
    json.height = json.height || make.Default.getEquipmentHeight(size);
    json.client.category = 'server';
    return make.Default.createFollower(json);
}, getServerParams(1));



for (var size = 1; size <= 8; size++) {
    make.Default.copy('twaver.idc.equipment{}.front'.format(size), 'twaver.idc.equipment.front', {},
        {
            name: "{}U设备".format(size),
            icon: getIdcIconPath('server{}.png'.format(size)),
        }, {
            defaultValue: {
                size: size
            }
        });
}

for (var size = 9; size <= 50; size++) {
    make.Default.copy('twaver.idc.equipment{}.front'.format(size), 'twaver.idc.equipment.front',
        function (json) {
            json.image = getIdcSVGPath('u-08.svg');
        }, {
            name: "{}U设备".format(size),
            icon: getIdcIconPath('server8.png'),
        }, {
            defaultValue: {
                size: size
            }
        });
}


make.Default.copy('twaver.idc.equipment8-1.front', 'twaver.idc.equipment.front', {},
    {
        name: "8U设备",
        description: '8U的服务器设备。这是一种挖空的机架',
        icon: getIdcIconPath('server8.png'),
    }, {
        defaultValue: {
            size: 8
        }
    });
/**************   rackEditor end **************************/

/********************3d room models**************************/
make.Default.copy('twaver.idc.wall5.top', 'twaver.idc.wall.top', {}, { icon: getIdcIconPath('wall5.png') });
make.Default.copy('twaver.idc.wall6.top', 'twaver.idc.wall.top', {}, { icon: getIdcIconPath('wall6.png') });
make.Default.copy('twaver.idc.wall7.top', 'twaver.idc.wall1.top', {}, { icon: getIdcIconPath('wall7.png') });
make.Default.copy('twaver.idc.wall8.top', 'twaver.idc.wall2.top', {}, { icon: getIdcIconPath('wall8.png') });
make.Default.copy('twaver.idc.wall9.top', 'twaver.idc.wall3.top', {}, { icon: getIdcIconPath('wall9.png') });
make.Default.copy('twaver.idc.wall10.top', 'twaver.idc.wall4.top', {}, { icon: getIdcIconPath('wall10.png') });
make.Default.copy('twaver.idc.wall11.top', 'twaver.idc.wall.top', {}, { icon: getIdcIconPath('wall11.png') });
make.Default.copy('twaver.idc.wall12.top', 'twaver.idc.wall.top', {}, { icon: getIdcIconPath('wall12.png') });
make.Default.copy('twaver.idc.wall13.top', 'twaver.idc.wall.top', {}, { icon: getIdcIconPath('wall5.png') });
make.Default.copy('twaver.idc.wall14.top', 'twaver.idc.wall.top', {}, { icon: getIdcIconPath('wall14.png') });
make.Default.copy('twaver.idc.innerWall2.top', 'twaver.idc.innerWall.top', {}, { icon: getIdcIconPath('innerWall2.png') });
make.Default.copy('twaver.idc.innerWall3.top', 'twaver.idc.innerWall.top', {}, { icon: getIdcIconPath('innerWall3.png') });
make.Default.copy('twaver.idc.innerWall4.top', 'twaver.idc.innerWall.top', {}, { icon: getIdcIconPath('innerWall4.png') });
make.Default.copy('twaver.idc.innerWall5.top', 'twaver.idc.innerWall.top', {}, { icon: getIdcIconPath('innerWall5.png') });
make.Default.copy('twaver.idc.innerWall6.top', 'twaver.idc.innerWall.top', {}, { icon: getIdcIconPath('innerWall6.png') });
make.Default.copy('twaver.idc.innerWall7.top', 'twaver.idc.innerWall.top', {}, { icon: getIdcIconPath('innerWall7.png') });
make.Default.copy('twaver.idc.innerWall8.top', 'twaver.idc.innerWall.top', {}, { icon: getIdcIconPath('innerWall8.png') });
make.Default.copy('twaver.idc.innerWall9.top', 'twaver.idc.innerWall.top', {}, { icon: getIdcIconPath('innerWall9.png') });
make.Default.copy('twaver.idc.innerWall10.top', 'twaver.idc.innerWall.top', {}, { icon: getIdcIconPath('innerWall10.png') });
make.Default.copy('twaver.idc.innerWall11.top', 'twaver.idc.innerWall.top', {}, { icon: getIdcIconPath('innerWall11.png') });
make.Default.copy('twaver.idc.innerWall12.top', 'twaver.idc.innerWall.top', {}, { icon: getIdcIconPath('innerWall12.png') });
make.Default.copy('twaver.idc.innerWall13.top', 'twaver.idc.innerWall.top', {}, { icon: getIdcIconPath('innerWall13.png') });
make.Default.copy('twaver.idc.innerWall14.top', 'twaver.idc.innerWall.top', {}, { icon: getIdcIconPath('innerWall14.png') });
make.Default.copy('twaver.idc.innerWall15.top', 'twaver.idc.innerWall.top', {}, { icon: getIdcIconPath('innerWall15.png') });

make.Default.copy('twaver.idc.glassWall.top', 'twaver.idc.innerWall.top', {}, {
    name: '玻璃墙',
    description: "玻璃墙",
    icon: getIdcIconPath('glassWall.png')
})
make.Default.copy('twaver.idc.glassWall1.top', 'twaver.idc.glassWall.top', {}, { icon: getIdcIconPath('glassWall1.png') });
make.Default.copy('twaver.idc.glassWall2.top', 'twaver.idc.glassWall.top', {}, { icon: getIdcIconPath('glassWall2.png') })
make.Default.copy('twaver.idc.glassWall3.top', 'twaver.idc.glassWall.top', {}, { icon: getIdcIconPath('glassWall3.png'), });
make.Default.copy('twaver.idc.glassWall4.top', 'twaver.idc.glassWall.top', {}, { icon: getIdcIconPath('glassWall4.png'), });
make.Default.copy('twaver.idc.glassWall5.top', 'twaver.idc.glassWall.top', {}, { icon: getIdcIconPath('glassWall5.png'), });
make.Default.copy('twaver.idc.glassWall6.top', 'twaver.idc.glassWall.top', {}, { icon: getIdcIconPath('glassWall6.png'), });
make.Default.copy('twaver.idc.glassWall7.top', 'twaver.idc.glassWall.top', {}, { icon: getIdcIconPath('glassWall7.png'), });
make.Default.copy('twaver.idc.glassWall8.top', 'twaver.idc.glassWall.top', {}, { icon: getIdcIconPath('glassWall8.png'), });

make.Default.copy('twaver.idc.column1.top', 'twaver.idc.column.top', {}, { icon: getIdcIconPath('column1.png') });
make.Default.copy('twaver.idc.column2.top', 'twaver.idc.column.top', {}, { icon: getIdcIconPath('column2.png') });
make.Default.copy('twaver.idc.column3.top', 'twaver.idc.column.top', {}, { icon: getIdcIconPath('column3.png') });
make.Default.copy('twaver.idc.column4.top', 'twaver.idc.column.top', {}, { icon: getIdcIconPath('column4.png') });
make.Default.copy('twaver.idc.column5.top', 'twaver.idc.column.top', {}, { icon: getIdcIconPath('column5.png') });
make.Default.copy('twaver.idc.column6.top', 'twaver.idc.column.top', {}, { icon: getIdcIconPath('column6.png') });
make.Default.copy('twaver.idc.column7.top', 'twaver.idc.column.top', {}, { icon: getIdcIconPath('column7.png') });
make.Default.copy('twaver.idc.column8.top', 'twaver.idc.column.top', {}, { icon: getIdcIconPath('column8.png') });
make.Default.copy('twaver.idc.column9.top', 'twaver.idc.column.top', {}, { icon: getIdcIconPath('column9.png') });
make.Default.copy('twaver.idc.column10.top', 'twaver.idc.column.top', {}, { icon: getIdcIconPath('column10.png') });
make.Default.copy('twaver.idc.column11.top', 'twaver.idc.column.top', {}, { icon: getIdcIconPath('column11.png') });
make.Default.copy('twaver.idc.column12.top', 'twaver.idc.column.top', {}, { icon: getIdcIconPath('column12.png') });
make.Default.copy('twaver.idc.column13.top', 'twaver.idc.column.top', {}, { icon: getIdcIconPath('column13.png') });


make.Default.copy('twaver.idc.headerRack1.top', 'twaver.idc.headerRack.top', {}, {
    icon: getIdcIconPath('headerRack1.png'),
});

make.Default.copy('twaver.idc.headerRack2.top', 'twaver.idc.headerRack.top', {}, {
    icon: getIdcIconPath('headerRack2.png'),
});

make.Default.copy('twaver.idc.headerRack3.top', 'twaver.idc.headerRack.top', {}, {
    icon: getIdcIconPath('headerRack3.png'),
});

make.Default.copy('twaver.idc.rack2.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack2.png'),
    name: '42U机柜1',
    category: '2d机柜模型',
});

/*make.Default.copy('twaver.idc.IBM.rack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_IBM.png'),
    category: '2d机柜模型',
});

make.Default.copy('twaver.idc.IBM2.rack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_IBM2.png'),
    category: '2d机柜模型',
});

make.Default.copy('twaver.idc.IBM3.rack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_IBM3.png'),
    category: '2d机柜模型',
});

make.Default.copy('twaver.idc.IBM4.rack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_IBM4.png'),
    category: '2d机柜模型',
});

make.Default.copy('twaver.idc.IBM5.rack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_IBM5.png'),
    category: '2d机柜模型',
});

make.Default.copy('twaver.idc.HP.rack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_HP.png'),
    category: '2d机柜模型',
});

make.Default.copy('twaver.idc.JINDI.rack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_JINDI.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.shuangdeng.rack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_shuangdeng.png'),
    category: '2d机柜模型',
})
make.Default.copy('twaver.idc.EMERSON.rack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_EMERSON.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.taiping.rack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_taiping.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.TOTEN.rack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_TOTEN.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.TOTEN2.rack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_TOTEN2.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.ZTE.rack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_ZTE.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.ZTE2.rack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_ZTE2.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.ZTE3.rack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_ZTE3.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.THTF.rack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_THTF.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.rack5.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack5.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.rack6.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_rack6.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.rack8.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_rack8.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.rack7.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_rack7.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.rack9.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_rack9.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.rack10.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_rack10.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.rack11.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_rack11.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.rack12.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_rack12.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.HW.rack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_HW.png'),
    category: '2d机柜模型',
});

make.Default.copy('twaver.idc.rack7.simpleRack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_rack7.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.rack6.simpleRack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_rack6.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.rack5.simpleRack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack5.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.ZTE3.simpleRack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_ZTE3.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.IBM.simpleRack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_IBM.png'),
    category: '2d机柜模型',
});

make.Default.copy('twaver.idc.IBM2.simpleRack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_IBM2.png'),
    category: '2d机柜模型',
});

make.Default.copy('twaver.idc.IBM3.simpleRack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_IBM3.png'),
    category: '2d机柜模型',
});

make.Default.copy('twaver.idc.IBM4.simpleRack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_IBM4.png'),
    category: '2d机柜模型',
});

make.Default.copy('twaver.idc.IBM5.simpleRack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_IBM5.png'),
    category: '2d机柜模型',
});

make.Default.copy('twaver.idc.HP.simpleRack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_HP.png'),
    category: '2d机柜模型',
});

make.Default.copy('twaver.idc.JINDI.simpleRack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_JINDI.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.shuangdeng.simpleRack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_shuangdeng.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.EMERSON.simpleRack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_EMERSON.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.taiping.simpleRack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_taiping.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.TOTEN.simpleRack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_TOTEN.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.TOTEN2.simpleRack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_TOTEN2.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.ZTE.simpleRack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_ZTE.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.ZTE2.simpleRack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_ZTE2.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.HW.simpleRack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_HW.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.HEADSUN.simpleRack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_HEADSUN.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.HEADSUN.rack.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack_HEADSUN.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.simpleRack15.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack15.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.rack15.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack15.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.simpleRack16.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack16.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.rack16.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack16.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.simpleRack17.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack17.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.rack17.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack17.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.simpleRack18.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack18.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.rack18.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack18.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.simpleRack19.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack19.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.rack19.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('rack19.png'),
    category: '2d机柜模型',
});*/
// make.Default.copy('twaver.idc.headerRack5.top', 'twaver.idc.rack.top', {}, {
//     icon: getIdcIconPath('headerRack5.png'),
//     category: '2d机柜模型',
// });
// make.Default.copy('twaver.idc.headerRack6.top', 'twaver.idc.rack.top', {}, {
//     icon: getIdcIconPath('headerRack6.png'),
//     category: '2d机柜模型',
// });
// make.Default.copy('twaver.idc.headerRack7.top', 'twaver.idc.rack.top', {}, {
//     icon: getIdcIconPath('headerRack7.png'),
//     category: '2d机柜模型',
// });
// make.Default.copy('twaver.idc.headerRack8.top', 'twaver.idc.rack.top', {}, {
//     icon: getIdcIconPath('headerRack8.png'),
//     category: '2d机柜模型',
// });
// make.Default.copy('twaver.idc.headerRack9.top', 'twaver.idc.rack.top', {}, {
//     icon: getIdcIconPath('headerRack9.png'),
//     category: '2d机柜模型',
// });
// make.Default.copy('twaver.idc.headerRack10.top', 'twaver.idc.rack.top', {}, {
//     icon: getIdcIconPath('headerRack10.png'),
//     category: '2d机柜模型',
// });
// make.Default.copy('twaver.idc.airConditioning18.top', 'twaver.idc.rack.top', {}, {
//     icon: getIdcIconPath('airConditioning18.png'),
//     category: '2d机柜模型',
// });
make.Default.copy('twaver.idc.kaiguangui.top', 'twaver.idc.rack.top', {}, {
    icon: getIdcIconPath('kaiguangui.png'),
    category: '2d机柜模型',
});
make.Default.copy('twaver.idc.simpleRack2.top', 'twaver.idc.simpleRack.top', {}, {
    name: '42U机柜',
    icon: getIdcIconPath('simpleRack2.png'),
});

make.Default.copy('twaver.idc.simpleRack5.top', 'twaver.idc.simpleRack.top', {}, {
    name: '42U机柜',
    icon: getIdcIconPath('simpleRack5.png'),
});

make.Default.copy('twaver.idc.simpleRack6.top', 'twaver.idc.simpleRack.top', {}, {
    name: '42U机柜',
    icon: getIdcIconPath('simpleRack6.png'),
});

make.Default.copy('twaver.idc.simpleRack7.top', 'twaver.idc.simpleRack.top', {}, {
    name: '42U机柜',
    icon: getIdcIconPath('simpleRack5.png'),
});

make.Default.copy('twaver.idc.simpleRack8.top', 'twaver.idc.simpleRack.top', {}, {
    name: '42U机柜',
    icon: getIdcIconPath('simpleRack8.png'),
});

make.Default.copy('twaver.idc.simpleRack9.top', 'twaver.idc.simpleRack.top', {}, {
    name: '42U机柜',
    icon: getIdcIconPath('simpleRack9.png'),
});

make.Default.copy('twaver.idc.simpleRack10.top', 'twaver.idc.simpleRack.top', {}, {
    name: '42U机柜',
    icon: getIdcIconPath('simpleRack9.png'),
});

make.Default.copy('twaver.idc.simpleRack11.top', 'twaver.idc.simpleRack.top', {}, {
    name: '42U机柜',
    icon: getIdcIconPath('simpleRack9.png'),
});

make.Default.copy('twaver.idc.simpleRack12.top', 'twaver.idc.simpleRack.top', {}, {
    name: '42U机柜',
    icon: getIdcIconPath('simpleRack9.png'),
});


for (var size = 42; size <= 47; size++) {
    make.Default.copy('twaver.idc.rack2-' + size + '.top', 'twaver.idc.rack2' + '.top', {}, {
        icon: getIdcIconPath('simpleRack2.png'),
        name: size + 'U机柜1',
        category: '2d机柜模型',
    });
    // make.Default.copy('twaver.idc.rack2-' + size + '.front', 'twaver.idc.rack2' + '.front');
    make.Default.copy('twaver.idc.simpleRack2-' + size + '.top', 'twaver.idc.simpleRack2', { height: size });
}

make.Default.register('twaver.idc.bigScreen2.top', function (json) {
    var modelJson = {
        width: 290,
        depth: 2058,
        client: {
            type: 'model'
        }
    }
    make.Default.copyProperties(json, modelJson);
    var model = make.Default.createNode(modelJson);
    return model;
}, {
        category: "2d部件模型",
        name: '大屏幕',
        type: "mono.Element",
        icon: getIdcIconPath('bigScreen2.png')
    });
    
//***loda***//
make.Default.register('twaver.idc.bigScreen.top', function (json) {
    var modelJson = {
        width: 290,
        depth: 205,
        client: {
            type: 'model'
        }
    }
    make.Default.copyProperties(json, modelJson);
    var model = make.Default.createNode(modelJson);
    return model;
}, {
        category: "2d部件模型",
        name: '大屏幕',
        type: "mono.Element",
        icon: getIdcIconPath('bigScreen.png')
    });
//***loda***//

make.Default.register('twaver.idc.pdu.top', getRegister(60, 100), {
    name: '油罐',
    description: "接待桌说明",
    icon: getIdcIconPath('pdu.png'),
    category: '2d动环模型',
});


make.Default.register('twaver.idc.ups1.top', getRegister(80, 60), {
    name: 'ups1',
    description: "ups1说明",
    icon: getIdcIconPath('ups1.png'),
    category: '2d动环模型',
});

make.Default.register('twaver.idc.shelf.top', getRegister(60, 120), {
    name: 'stair',
    description: "stair说明",
    icon: getIdcIconPath('shelf.png'),
    category: '2d部件模型',
});

make.Default.register('twaver.idc.stair2.top', getRegister(105, 123), {
    name: 'stair',
    description: "stair说明",
    icon: getIdcIconPath('stair2.png'),
    category: '2d部件模型',
});

make.Default.register('twaver.idc.tvShelf.top', getRegister(106, 25.8), {
    name: 'stair',
    description: "stair说明",
    icon: getIdcIconPath('tvShelf.png'),
    category: '2d部件模型',
});

make.Default.copy('twaver.idc.line.top', 'twaver.idc.innerWall.top', {}, {
    name: '警示线',
    description: "警示线说明",
    icon: getIdcIconPath('line.png'),
    category: '2d部件模型',
});

make.Default.register('twaver.idc.airFloor.top', getRegister(60, 60), {
    name: '通风板',
    description: "通风板说明",
    icon: getIdcIconPath('airFloor.png'),
    category: '2d部件模型',
});

var rectModels = [
    {
        id: 'twaver.idc.ups2.top',
        width: 74.0,
        height: 90.0,
        name: 'UPS',
        icon: "ups2.png",
        description: '用于给单台计算机、计算机网络系统或其它垫子设备如电磁阀、压力变送器等提供稳定、不间断的电力供应，保证机房在突发情况下也能正常运转',
        category: '机柜模型'
    },
    {
        id: 'twaver.idc.ups3.top',
        width: 74.0,
        height: 90.0,
        name: 'UPS',
        icon: "ups3.png",
        description: '用于给单台计算机、计算机网络系统或其它垫子设备如电磁阀、压力变送器等提供稳定、不间断的电力供应，保证机房在突发情况下也能正常运转',
        category: '机柜模型'
    },
    {
        id: 'twaver.idc.ups4.top',
        width: 48.0,
        height: 90.0,
        name: 'UPS',
        icon: "ups4.png",
        description: '用于给单台计算机、计算机网络系统或其它垫子设备如电磁阀、压力变送器等提供稳定、不间断的电力供应，保证机房在突发情况下也能正常运转',
        category: '机柜模型'
    },
    {
        id: 'twaver.idc.ups5.top',
        width: 25.0,
        height: 90.0,
        name: 'UPS',
        icon: "ups5.png",
        description: '用于给单台计算机、计算机网络系统或其它垫子设备如电磁阀、压力变送器等提供稳定、不间断的电力供应，保证机房在突发情况下也能正常运转',
        category: '机柜模型'
    },
    {
        id: 'twaver.idc.ups6.top',
        width: 54.0,
        height: 90.0,
        name: 'UPS',
        icon: "ups6.png",
        description: '用于给单台计算机、计算机网络系统或其它垫子设备如电磁阀、压力变送器等提供稳定、不间断的电力供应，保证机房在突发情况下也能正常运转',
        category: '机柜模型'
    },
    {
        id: 'twaver.idc.plant.top',
        width: 60.0,
        height: 57.1,
        name: '植物',
        icon: "plant.png",
        description: '植物描述',
        category: '动环模型'
    },
    {
        id: 'twaver.idc.plant3.top',
        width: 60.0,
        height: 57.1,
        name: '植物',
        icon: "plant3.png",
        description: '植物描述',
        category: '动环模型'
    },
    {
        id: 'twaver.idc.pdc24.top',
        width: 25,
        height: 50,
        name: '配电箱',
        icon: "pdc23.png",
        description: '配电箱描述',
        category: '动环模型'
    },
    {
        id: 'twaver.idc.pdc25.top',
        width: 25,
        height: 50,
        name: '配电箱',
        icon: "pdc23.png",
        description: '配电箱描述',
        category: '动环模型'
    },
    {
        id: 'twaver.idc.heatExchanger.top',
        width: 36.9,
        height: 49.5,
        name: '换热器架子',
        icon: 'heatExchanger.png',
        description: '换热器描述',
        category: '机柜模型'
    },
    {
        id: 'twaver.idc.airBox.top',
        width: 21.0,
        height: 2.0,
        name: '空气开关盒',
        icon: 'airBox.png',
        description: '空气开关盒',
        category: '其他模型'
    },
    {
        id: 'twaver.idc.rack4-47.top',
        width: 60.0,
        height: 80.0,
        name: '热管背板机柜',
        icon: 'rack.png',
        description: '机房最常见的模型。机柜是由机柜的主体和机柜门组成的，机柜门支持动画打开，关闭。 支持42U-47U高度，默认42U的高度。模型上还支持常见的长，宽，机柜贴图的设置',
        category: '机柜模型'
    },
    {
        id: 'twaver.idc.ups18.top',
        width: 80,
        height: 160,
        name: 'ups',
        icon: 'ups17.png',
        description: 'ups16',
        category: '其他模型'
    },
    {
        id: 'twaver.idc.ups19.top',
        width: 80,
        height: 190,
        name: 'ups',
        icon: 'ups19.png',
        description: 'ups19',
        category: '其他模型'
    },
    {
        id: 'twaver.idc.CASCO2.rack.top',
        width: 60,
        height: 200,
        name: '列头柜',
        icon: 'ASCO2.rack.png',
        description: 'rack',
        category: '机柜模型'
    },
    {
        id: 'twaver.idc.CASCO.headerRack.top',
        width: 60,
        height: 200,
        name: '列头柜',
        icon: 'CASCO.headerRack.png',
        description: 'headerRack',
        category: '列头柜模型'
    },
    {
        id: 'twaver.idc.CASCO.pdc.top',
        width: 80,
        height: 200,
        name: '列头柜',
        icon: 'CASCO.pdc.png',
        description: 'headerRack',
        category: '列头柜模型'
    },
    {
        id: 'twaver.idc.SHIP.rack.top',
        width: 60.0,
        height: 80.0,
        name: 'SHIP机柜',
        icon: 'SHIP.rack.png',
        description: 'SHIP机柜',
        category: '机柜模型'
    },
    {
        id: 'twaver.idc.RITTAL.rack.top',
        width: 60.0,
        height: 80.0,
        name: 'RITTAL机柜',
        icon: 'RITTAL.rack.png',
        description: 'RITTAL机柜',
        category: '机柜模型'
    },
    {
        id: 'twaver.idc.headerRack5.top',
        width: 60.0,
        height: 60.0,
        name: 'RITTAL机柜',
        icon: 'RITTAL.rack.png',
        description: 'RITTAL机柜',
        category: '机柜模型'
    },
    {
        id: 'twaver.idc.headerRack6.top',
        width: 120.0,
        height: 120.0,
        name: 'RITTAL机柜',
        icon: 'RITTAL.rack.png',
        description: 'RITTAL机柜',
        category: '机柜模型'
    },
    {
        id: 'twaver.idc.headerRack7.top',
        width: 60.0,
        height: 60.0,
        name: 'RITTAL机柜',
        icon: 'RITTAL.rack.png',
        description: 'RITTAL机柜',
        category: '机柜模型'
    },
    {
        id: 'twaver.idc.headerRack8.top',
        width: 120.0,
        height: 30.0,
        name: 'RITTAL机柜',
        icon: 'RITTAL.rack.png',
        description: 'RITTAL机柜',
        category: '机柜模型'
    },
    {
        id: 'twaver.idc.headerRack9.top',
        width: 120.0,
        height: 30.0,
        name: 'RITTAL机柜',
        icon: 'RITTAL.rack.png',
        description: 'RITTAL机柜',
        category: '机柜模型'
    },
    {
        id: 'twaver.idc.headerRack10.top',
        width: 60.0,
        height: 57,
        name: 'RITTAL机柜',
        icon: 'RITTAL.rack.png',
        description: 'RITTAL机柜',
        category: '机柜模型'
    },
    {
        id: 'twaver.idc.airConditioning18.top',
        width: 30.0,
        height: 120.0,
        name: 'RITTAL机柜',
        icon: 'RITTAL.rack.png',
        description: 'RITTAL机柜',
        category: '机柜模型'
    },
    {
        id: 'twaver.idc.rack20.top',
        width: 60.0,
        height: 120.0,
        name: 'RITTAL机柜',
        icon: 'RITTAL.rack.png',
        description: 'RITTAL机柜',
        category: '机柜模型'
    },
      {
        id: 'twaver.idc.airCondition17.top',
        width: 60.0,
        height: 120.0,
        name: '列间空调',
        icon: 'airCondition17.png',
        description: '列间空调',
        category: '空调模型'
    },
    {
        id: 'twaver.idc.HP2.rack.top',
        width: 60,
        height: 42,
        name: 'HP2机柜',
        icon: 'HP2.rack.png',
        description: 'HP2机柜',
        category: '机柜模型'
    },
    {
        id: 'twaver.idc.HW3.rack.top',
        width: 60,
        height: 42,
        name: 'HW3.rack',
        icon: 'HW3.rack.png',
        description: 'HW3.rack',
        category: '机柜模型'
    },
    {
        id: 'twaver.idc.rack25.top',
        width: 60,
        height: 42,
        name: 'rack25',
        icon: 'rack25.png',
        description: 'rack25',
        category: '机柜模型'
    },
    {
        id: 'twaver.idc.IBM9.rack.top',
        width: 60,
        height: 42,
        name: 'IBM9.rack',
        icon: 'IBM9.rack.png',
        description: 'IBM9.rack',
        category: '机柜模型'
    },
    {
        id: 'twaver.idc.HW2.rack.top',
        width: 60,
        height: 42,
        name: 'HW2.rack',
        icon: 'HW2.rack.png',
        description: 'HW2.rack',
        category: '机柜模型'
    },
    {
        id: 'twaver.idc.IBM8.rack.top',
        width: 60,
        height: 42,
        name: 'IBM8.rack',
        icon: 'IBM8.rack.png',
        description: 'IBM8.rack',
        category: '机柜模型'
    },
    {
        id: 'twaver.idc.ZTE4.rack.top',
        width: 60,
        height: 42,
        name: 'ZTE4.rack',
        icon: 'ZTE4.rack.png',
        description: 'ZTE4.rack',
        category: '机柜模型'
    },
    {
        id: 'twaver.idc.TOTEN5.rack.top',
        width: 60,
        height: 42,
        name: 'TOTEN5.rack',
        icon: 'TOTEN5.rack.png',
        description: 'TOTEN5.rack',
        category: '机柜模型'
    },
    {
        id: 'twaver.idc.rack24.top',
        width: 60,
        height: 42,
        name: 'rack24',
        icon: 'rack24.png',
        description: 'rack24',
        category: '机柜模型'
    },
    {
        id: 'twaver.idc.rack26.top',
        width: 60,
        height: 42,
        name: 'rack26',
        icon: 'rack26.png',
        description: 'rack26',
        category: '机柜模型'
    },
    {
        id: 'twaver.idc.rack27.top',
        width: 60,
        height: 42,
        name: 'rack27',
        icon: 'rack27.png',
        description: 'rack27',
        category: '机柜模型'
    },
    {
        id: 'twaver.idc.rack28.top',
        width: 60,
        height: 42,
        name: 'rack28',
        icon: 'rack28.png',
        description: 'rack28',
        category: '机柜模型'
    },
    /*{
        id: 'twaver.idc..top',
        width: 60,
        height: 42,
        name: '',
        icon: '.png',
        description: '',
        category: '机柜模型'
    },
    {
        id: 'twaver.idc..top',
        width: 60,
        height: 42,
        name: '',
        icon: '.png',
        description: '',
        category: '机柜模型'
    },*/
]

for (var i = 0; i < rectModels.length; i++) {
    var model = rectModels[i];
    var width = model.width || 50;

    make.Default.register(model.id, getRegister(model.width, model.height, model.color || '#FF9933'), {
        name: model.name,
        description: model.description,
        icon: getIdcIconPath(model.icon),
        category: model.category,
    });
}

var colors = ['#FFCC99', '#CCFF99', '#CCCCFF', '#CCCCFF', '#99CCCC'];
//注册obj的2d模型
/*for (var i = 0; i < idcObjModels.length; i++) {
    var model = idcObjModels[i];
    var color = model.color || colors[Math.round(Math.random() * colors.length - 1)];
    if (model.width && model.height) {
        make.Default.register('twaver.idc.' + model.id + '.top', getRegister(model.width || 50, model.height || 50, color), {
            name: model.name,
            description: model.description,
            icon: getIdcIconPath(model.icon || model.id + '.png'),
            category: model.category,
        });
    }

}*/

//注册六面贴图的2d模型
/*for (var i = 0; i < idcWrapImageModels.length; i++) {
    var model = idcWrapImageModels[i];
    var color = model.color || colors[Math.round(Math.random() * colors.length - 1)];
    if (model.width && model.height) {
        make.Default.register('twaver.idc.' + model.id + '.top', getRegister(model.width || 50, model.depth || 50, color), {
            name: model.name,
            description: model.description,
            icon: getIdcIconPath(model.icon || model.id + '.png'),
            category: model.category,
        });
    }
}
*/

make.Default.copy('twaver.idc.datacenter', 'twaver.idc.rack.top', function (json) {
    json.image = getIdcSVGPath('datacenter');
}, {
        name: '数据中心',
        description: "数据中心",
        icon: getIdcIconPath('airFloor.png'),
        category: '数据中心'
    });



make.Default.copy('twaver.idc.seat.top', 'twaver.idc.airCondition.top', {}, {
    name: '机柜位置',
    description: '',
    icon: getIdcIconPath('simpleRack2.png'),
    type: 'seat',
    modelDefaultParameters: {
        'target': {
            name: "机柜编号",
            value: undefined,
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT
        },
    }
});

/*
 * 内置机房库中包含下列模板
 * 机柜，玻璃机柜，简单机柜，列头柜，设备，地板，柱子，墙，内墙，玻璃墙，窗户，门，区域， 通道，简单通道，
 * 空调，UPS，电池组，电源，摄像头， 圆形摄像头，ACS
 * 另外还包含的obj的模型：发电机
 */

var getIdcImagePath = function (image) {
    if (image.indexOf('/') >= 0 || image.indexOf('base64') >= 0) {
        return image;
    }
    return make.Default.path + 'model/idc/images/' + image;
}

var getIdcDoorImagePath = function (image) {
    if (image.indexOf('/') >= 0 || image.indexOf('base64') >= 0) {
        return image;
    }
    return make.Default.path + 'model/idc/images/door/' + image;
}

var getIdcWallImagePath = function (image) {
    if (image.indexOf('/') >= 0 || image.indexOf('base64') >= 0) {
        return image;
    }
    return make.Default.path + 'model/idc/images/wall/' + image;
}

var getIdcWindowImagePath = function (image) {
    if (image.indexOf('/') >= 0 || image.indexOf('base64') >= 0) {
        return image;
    }
    return make.Default.path + 'model/idc/images/window/' + image;
}

var getIdcIconPath = function (icon) {
    if (icon.indexOf('/') >= 0) {
        return icon;
    }
    return make.Default.path + 'model/idc/icons/' + icon;
}

var getIdcObjPath = function (obj) {

    return make.Default.path + 'model/idc/obj/' + obj;
}

var getPRParameters = function () {
    return {
        'bid': {
            value: '',
            name: "业务ID",
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT
        },
        'position': {
            value: [0, 0, 0],
            name: "位置",
            type: make.Default.PARAMETER_TYPE_ARRAY_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
            editable: false,
        },
        'rotation': {
            value: [0, 0, 0],
            name: "旋转角度",
            type: make.Default.PARAMETER_TYPE_ARRAY_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
            editable: false,
        },

    }
}

var getBasicParameters = function (width, height, depth) {
    var result = {
        'width': {
            value: width,
            name: "宽",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'height': {
            value: height,
            name: "高",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'depth': {
            value: depth,
            name: "深",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        }
    }
    var pr = getPRParameters();
    make.Default.copyProperties(pr, result);
    return result;
}

/**
 * [getRotationYByDatas 根据墙的点计算门窗需要旋转的弧度]
 * @param  {[type]} position  [孩子的位置(门窗等)]
 * @param  {[type]} datas     [墙的点]
 * @param  {[type]} position2 [墙的中心位置坐标]
 * @return {[type]}           [弧度]
 */
var getRotationYByDatas = function (position, datas, position2) {
    var rotationY = 0;
    var point = {
        x: position[0],
        y: position[2]
    };
    var newDatas = [];
    var position2 = position2 || [0, 0, 0];
    if (datas[0] instanceof Array) {
        for (var i = 0; i < datas.length; i++) {
            newDatas.push(datas[i]);
        }
        newDatas.push(datas[0]);
        for (var i = 0; i < newDatas.length - 1; i++) {
            var point1 = {
                x: newDatas[i][0] + position2[0],
                y: newDatas[i][1] + position2[2]
            };
            var point2 = {
                x: newDatas[i + 1][0] + position2[0],
                y: newDatas[i + 1][1] + position2[2]
            };
            if (isPointOnLine(point, point1, point2, 10)) {
                rotationY = Math.atan((point1.y - point2.y) / (point1.x - point2.x));
            }
        }
    } else {
        for (var i = 0; i < datas.length; i++) {
            newDatas.push(datas[i]);
        }
        newDatas.push(datas[0]);
        newDatas.push(datas[1]);
        for (var i = 0; i < newDatas.length - 2; i = i + 2) {
            var point1 = {
                x: newDatas[i] + position2[0],
                y: newDatas[i + 1] + position2[2]
            };
            var point2 = {
                x: newDatas[i + 2] + position2[0],
                y: newDatas[i + 3] + position2[2]
            };
            if (isPointOnLine(point, point1, point2, 10)) {
                rotationY = Math.atan((point1.y - point2.y) / (point1.x - point2.x));
            }
        }

    }

    return -rotationY * 180 / Math.PI;
};

/**
 * [isPointOnLine 目标点是否在连线上]
 * @param  {[type]}  point  [目标点]
 * @param  {[type]}  point1 [连线起始点]
 * @param  {[type]}  point2 [连线终点]
 * @param  {[type]}  width  [最小吸附单位（墙是可以吸附的，但是墙上的门窗是不可吸附的，所以需要一个偏移量）]
 * @return {Boolean}        [description]
 */
var isPointOnLine = function (point, point1, point2, width) {
    if (width < 0) {
        width = 0;
    }
    var distance = getDistanceFromPointToLine(point, point1, point2);
    return distance <= width && (point.x >= Math.min(point1.x, point2.x) - width) && (point.x <= Math.max(point1.x, point2.x) + width) && (point.y >= Math.min(point1.y, point2.y) - width) && (point.y <= Math.max(point1.y, point2.y) + width);
};

/**
 * [getDistanceFromPointToLine 计算点到线的距离]
 * @param  {[type]} point  [目标点]
 * @param  {[type]} point1 [线的起始点]
 * @param  {[type]} point2 [线的终点]
 * @return {[Number]}        [返回目标点到连线的距离]
 */
var getDistanceFromPointToLine = function (point, point1, point2) {
    if (point1.x === point2.x) {
        return Math.abs(point.x - point1.x);
    }
    var lineK = (point2.y - point1.y) / (point2.x - point1.x);
    var lineC = (point2.x * point1.y - point1.x * point2.y) / (point2.x - point1.x);
    return Math.abs(lineK * point.x - point.y + lineC) / (Math.sqrt(lineK * lineK + 1));
};

/***********地板模型***************/
var getFloorParameters = function () {
    return {
        image: {
            name: "贴图",
            value: 'floor.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        color: {
            name: "颜色",
            value: 'white',
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        repeat: {
            name: "重复次数",
            value: 183,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        amount: {
            name: "地板厚度",
            value: 2,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        data: {
            name: "点位置",
            value: '',
            type: make.Default.PARAMETER_TYPE_ARRAY_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'position': {
            value: [0, 0, 0],
            name: "位置",
            type: make.Default.PARAMETER_TYPE_ARRAY_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
            editable: false,
        },
        'rotation': {
            value: [0, 0, 0],
            name: "旋转角度",
            type: make.Default.PARAMETER_TYPE_ARRAY_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
            editable: false,
        },

    }
}

//shapeNode Floor
make.Default.register('twaver.idc.floor', function (json, callback) {
    var data = json.data;
    var image = getIdcImagePath(json.image);
    var repeat = json.repeat;
    var amount = json.amount;
    var position = json.position || [0, 0, 0];
    var color = json.color || 'white';
    var object = {
        type: 'shapeNode',
        data: data,
        vertical: true,
        repeat: repeat,
        amount: amount,
        position: position,
        client: {
            type: 'floor',
        },
        style: {
            'm.type': 'phong',
            'm.color': color,
            'm.ambient': color,
            'm.texture.image': image,
            'm.texture.anisotropy': 8,
        }
    }
    var floor = make.Default.createCombo([object]);
    make.Default.setObject3dCSProps(floor, json);
    if (callback) callback(floor);
    return floor;
}, {
        category: "房间模型",
        type: "floor",
        name: "地板",
        icon: getIdcIconPath('floor.png'),
        description: "地板是和墙，内墙一起使用的。用来创建3d机房的房间轮廓",
        modelDefaultParameters: getFloorParameters(),
    });
/***********地板模型***************/

/*************天花板模型**************/
var getRoofParameters = function () {
    var result = getBasicParameters(60, 261, 60);
    result.image = {
        name: "贴图",
        value: 'floor.jpg',
        type: make.Default.PARAMETER_TYPE_IMAGE,
        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
    }
    delete result.height;

    var pr = getPRParameters();
    make.Default.copyProperties(pr, result);
    return result;
}

make.Default.register('twaver.idc.roof', function (json, callback) {
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var width = json.width;
    var depth = json.depth;
    // var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];
    var pic = getIdcImagePath(json.image);
    var roof = new mono.Plane(width, depth, 1, 1);
    var gap = 400;
    roof.s({
        'm.transparent': false,
        'm.alphaTest': 0.5,
        'm.texture.image': pic,
        'm.texture.anisotropy': 8,
        'm.texture.repeat': new mono.Vec2(width / gap, depth / gap)
    });
    make.Default.setObject3dCommonProps(roof, json);
    roof.setRotationX(Math.PI / 2);
    if (callback) callback(roof);
    return roof;
}, {
        category: "房间模型",
        type: "roof",
        name: "天花板",
        icon: getIdcIconPath('floor.png'),
        description: "天花板是和墙，内墙一起使用的。用来创建3d机房的房间轮廓",
        modelDefaultParameters: getRoofParameters(),
    });
/*************天花板模型**************/

/*************灯模型**************/
var getLampParameters = function () {
    var result = getBasicParameters(80, 261, 80);
    result.image = {
        name: "贴图",
        value: 'lamp.jpg',
        type: make.Default.PARAMETER_TYPE_IMAGE,
        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
    }
    delete result.height;

    var pr = getPRParameters();
    make.Default.copyProperties(pr, result);
    return result;
}
make.Default.register('twaver.idc.lamp', function (json, callback) {
    var width = json.width;
    var depth = json.depth;
    var pic = getIdcImagePath(json.image);
    var lamp = new mono.Plane(width, depth, 1, 1);
    lamp.s({
        'm.transparent': false,
        'm.texture.image': pic,
    });
    make.Default.setObject3dCommonProps(lamp, json);
    //lamp.setRotationX(Math.PI / 2);
    if (callback) callback(lamp);
    return lamp;
}, {
        category: "房间模型",
        type: "lamp",
        name: "灯",
        icon: getIdcIconPath('camera.png'),
        description: "灯模型放在天花板上的",
        modelDefaultParameters: getLampParameters(),
    })
/*************灯模型**************/

/****************外墙模型********************/
/** json data is like
 [-2400, 660, 2400, 660, 2400, -660, -2400, -660, -2400, 660]
 **/
var getWallParameters = function () {
    return {
        data: {
            name: "坐标点",
            value: [],
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        closed: {
            name: "是否合并",
            value: false,
            type: make.Default.PARAMETER_TYPE_BOOLEAN,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        showRoof: {
            name: "是否显示天花板",
            value: true,
            type: make.Default.PARAMETER_TYPE_BOOLEAN,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        showFloor: {
            name: "是否显示地板",
            value: false,
            type: make.Default.PARAMETER_TYPE_BOOLEAN,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        floorId: {
            name: "地板编号",
            value: '',
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        floorImage: {
            name: "地板贴图",
            value: 'floor.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        floorColor: {
            name: "地板颜色",
            value: 'white',
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        roofImage: {
            name: "天花板贴图",
            value: 'floor.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        roofColor: {
            name: "天花板贴图",
            value: 'white',
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        wallDepth: {
            name: "墙厚度",
            value: 30,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        wallHeight: {
            name: "墙高度",
            value: 260,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        insideColor: {
            name: "内侧颜色",
            value: '#EFEFEF',
            type: make.Default.PARAMETER_TYPE_COLOR,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        outsideColor: {
            name: "外侧颜色",
            value: '#DCE8E9',
            type: make.Default.PARAMETER_TYPE_COLOR,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        frameColor: {
            name: "门内侧边框颜色",
            value: '#E0E0E0',
            type: make.Default.PARAMETER_TYPE_COLOR,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        asideColor: {
            name: "起始侧边颜色",
            value: '#E0E0E0',
            type: make.Default.PARAMETER_TYPE_COLOR,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        zsideColor: {
            name: "结束侧边颜色",
            value: '#E0E0E0',
            type: make.Default.PARAMETER_TYPE_COLOR,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        topColor: {
            name: "顶部颜色",
            value: '#F7F7F7',
            type: make.Default.PARAMETER_TYPE_COLOR,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        bottomColor: {
            name: "底部颜色",
            value: '#F7FEFF',
            type: make.Default.PARAMETER_TYPE_COLOR,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        insideImage: {
            name: "内侧贴图",
            value: '',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        outsideImage: {
            name: "外侧贴图",
            value: 'wall.png',
            type: make.Default.PARAMETER_TYPE_COLOR,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        insideMap: {
            name: "内侧Light贴图",
            value: 'inside_lightmap.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        outsideMap: {
            name: "外侧Light贴图",
            value: 'outside_lightmap.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        repeat: {
            name: "重复高度",
            value: 0,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        children: {
            name: "孩子对象",
            value: [],
            hidden: true,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        }
    }
}

make.Default.register('twaver.idc.wall', function (json, callback) {
    var objects = [];
    var client = json.client || {};
    var width = json.wallDepth;
    var position = json.position || [0, 0, 0];
    position[0] = parseFloat(position[0]) || 0;
    position[1] = parseFloat(position[1]) || 0;
    position[2] = parseFloat(position[2]) || 0;
    var insideImage = json.insideImage ? getIdcWallImagePath(json.insideImage) : null;
    var outsideImage = json.outsideImage ? getIdcWallImagePath(json.outsideImage) : null;
    var insideMap = json.insideMap ? make.Default.getImagePath(json.insideMap) : null;
    var outsideMap = json.outsideMap ? make.Default.getImagePath(json.outsideMap) : null;
    var repeat = json.repeat || json.wallHeight;


    var label = json.label;
    var labelPosition = json.labelPosition || [0, 0, 0];
    labelPosition[0] = parseFloat(labelPosition[0]) || 0;
    labelPosition[1] = parseFloat(labelPosition[1]) || 0;
    labelPosition[2] = parseFloat(labelPosition[2]) || 0;
    var labelColor = json.labelColor || 'red';
    var labelFont = json.labelFont;
    var labelOffset = json.labelOffset || 1;

    var wall = {
        type: 'path',
        op: '+',
        width: width,
        height: json.wallHeight,
        insideColor: json.insideColor,
        outsideColor: json.outsideColor,
        asideColor: json.asideColor,
        zsideColor: json.zsideColor,
        topColor: json.topColor,
        bottomColor: json.bottomColor,
        insideImage: insideImage,
        outsideImage: outsideImage,
        insideMap: insideMap,
        outsideMap: outsideMap,
        repeat: repeat,
        //position: position,
        data: json.data,
        closed: json.closed,
    };
    objects.push(wall);
    var doorDatas = [];
    if (json.children) {
        for (var i = 0; i < json.children.length; i++) {
            json.children[i].inbuilt = true;
            json.children[i].depth = width + 6;
            var rotationY = getRotationYByDatas(json.children[i].position, json.data, json.position);
            json.children[i].rotation = [0, rotationY, 0];
            var p = json.children[i].position;
            p[0] = parseFloat(p[0]) || 0;
            p[1] = parseFloat(p[1]) || 0;
            p[2] = parseFloat(p[2]) || 0;
            json.children[i].position = [p[0] - position[0], p[1] - position[1], p[2] - position[2]]
            json.children[i].frameColor = json.frameColor;
            var children = make.Default.load(json.children[i]);
            objects = objects.concat(children);
            var childWidth = json.children[i].width || 205;
            if (json.children[i].id.indexOf('twaver.idc.door') >= 0) {
                var transparent = make.Default.getModelDefaultParameters(json.children[i].id).transparent.value
                if (transparent && rotationY % 180 == 0) {
                    doorDatas.push([p[0] - position[0] - childWidth / 2, p[2] - position[2]]);
                    doorDatas.push([p[0] - position[0] + childWidth / 2, p[2] - position[2]]);
                } else if (transparent && rotationY % 90 == 0) {
                    doorDatas.push([p[0] - position[0], p[2] - position[2] - childWidth / 2]);
                    doorDatas.push([p[0] - position[0], p[2] - position[2] + childWidth / 2]);
                }
            }
        }
    }

    var comboChildren = [];
    var returnObjects = [];
    for (var i = 0; i < objects.length; i++) {
        var child = objects[i];
        if (child.op) {
            comboChildren.push(child);
        } else {
            returnObjects.push(child);
        }
    }

    var combo = make.Default.createCombo(comboChildren);
    if (json.objectId) {
        combo._id = json.objectId;
    }
    combo.setPosition(position[0], position[1], position[2])
    if (json.style) {
        combo.s(json.style);
    }

    // combo.setClient('width', width);
    combo.setClient('data', json.data);
    if (doorDatas && doorDatas.length > 0) {
        combo.setClient('doorData', doorDatas);
    }
    combo.setClient('wallDepth', width);
    combo.setClient('type', 'wall');
    if (returnObjects.length > 0) {
        for (var i = 0; i < returnObjects.length; i++) {
            var returnObject = returnObjects[i];
            var object = make.Default.createCombo(returnObject);
            object.setParent && (object.setParent(combo));
        }
    }
    make.Default.setObject3dCSProps(combo, json);
    if (json.showFloor) {
        var position = json.position || [0, 0, 0];
        var floorImage = json.floorImage || 'floor.jpg';
        var floorColor = json.floorColor;
        var floorStyle = json.floorStyle;
        var floorAmount = json.floorAmount;
        var floorId = json.floorId || 'twaver.idc.floor'
        var floor = make.Default.load({
            id: floorId,
            data: json.data,
            image: floorImage,
            color: floorColor,
            style: floorStyle,
            amount: floorAmount
            //position: [position[0], -1, position[2]],
        });
        floor.setParent(combo);
    }
    if (json.showRoof) {
        var rect = make.Utils3D.getRectOfPoints(json.data);
        var center = rect.center();
        var roofImage = json.roofImage || 'floor.jpg';
        var roofColor = json.roofColor;
        var position = json.position || [0, 0, 0];
        var roof = make.Default.load({
            id: 'twaver.idc.roof',
            width: rect.width,
            image: roofImage,
            color: floorColor,
            depth: rect.height,
            position: [center.x, json.wallHeight, center.y]
        });
        roof.setParent(combo);
    }

    if (label) {


        var canvas = make.Default.generateTextCanvas(label, labelColor, labelFont, false, null, true);
        var drawRect = canvas.drawRect;
        var labelNode = new mono.Plane(drawRect.width, drawRect.height, 1, 1);
        labelNode.s({
            'm.transparent': false,
            'm.alphaTest': 0.5,
            'm.texture.image': canvas,
            'm.texture.anisotropy': 8,
            'm.texture.repeat': new mono.Vec2(drawRect.width / canvas.width, drawRect.height / canvas.height),
            'm.texture.offset': new mono.Vec2(0, 0),
        });
        var rotationY = getRotationYByDatas(labelPosition, json.data, json.position);
        var ry = rotationY / 180 * Math.PI;
        labelNode.setRotationY(ry);
        labelNode.setSelectable(false);
        labelPosition[0] = labelPosition[0] - position[0];
        labelPosition[1] = labelPosition[1] - position[1];
        labelPosition[2] = labelPosition[2] - position[2];
        labelPosition[2] += Math.cos(ry) * (width / 2 + labelOffset);
        labelPosition[0] += Math.sin(ry) * (width / 2 + labelOffset);
        labelNode.p(labelPosition[0], labelPosition[1], labelPosition[2]);
        labelNode.setParent(combo);
    }

    if (callback) callback(combo);
    return combo;
}, {
        category: "房间模型",
        type: "wall",
        name: "外墙",
        icon: getIdcIconPath('wall.png'),
        description: "外墙是和内墙，地板一起使用的。用来创建3d机房的房间轮廓",
        sdkCategory: 'floor',
        modelDefaultParameters: getWallParameters(),
    });

var walls = [{
    id: 'wall1',
    closed: true,
    showFloor: true,
    name: '外墙1',
    description: "固定形状的房间，带地板",
    data: [
        [-2000, -2000],
        [2000, -2000],
        [2000, 2000],
        [-2000, 2000]
    ]
}, {
    id: 'wall2',
    closed: true,
    showFloor: true,
    name: '外墙2',
    description: "固定形状的房间，带地板",
    data: [
        [-2500, -2500],
        [0, -2550],
        [0, 0],
        [2500, 0],
        [2500, 2500],
        [-2500, 2500]
    ]
}, {
    id: 'wall3',
    closed: true,
    showFloor: true,
    name: '外墙3',
    description: "固定形状的房间，带地板",
    data: [
        [-2500, -500],
        [-1300, -500],
        [-1300, -2500],
        [1300, -2500],
        [1300, -500],
        [2500, -500],
        [2500, 2500],
        [-2500, 2500]
    ]
}, {
    id: 'wall4',
    closed: true,
    showFloor: true,
    name: '外墙4',
    description: "固定形状的房间，带地板",
    data: [
        [-2500, -500],
        [-1500, -500],
        [-1000, -2500],
        [1000, -2500],
        [1500, -500],
        [2500, -500],
        [2500, 2500],
        [-2500, 2500]
    ]
},
{
    id: 'wall5',
    wallHeight: 310,
    insideImage: "wall5.jpg",
    outsideImage: "",
    outsideColor: "#c3ccd8",
    insideMap: "inside_lightmap5.jpg",
    outsideMap: "outside_lightmap5.jpg",
}, {
    id: 'wall6',
    wallHeight: 310,
    outsideImage: "",
    outsideColor: "#A5BDDD",
    insideColor: "#B8CAD5",
    topColor: "#D6E4EC",
    floorColor: "#DAF0F5",
    floorImage: 'floor-1.jpg',
}, {
    id: 'wall7',
    closed: true,
    showFloor: true,
    wallHeight: 310,
    outsideImage: "",
    outsideColor: "#A5BDDD",
    insideColor: "#B8CAD5",
    topColor: "#D6E4EC",
    data: [
        [-2000, -2000],
        [2000, -2000],
        [2000, 2000],
        [-2000, 2000]
    ]
}, {
    id: 'wall8',
    closed: true,
    showFloor: true,
    wallHeight: 310,
    outsideImage: "",
    outsideColor: "#A5BDDD",
    insideColor: "#B8CAD5",
    topColor: "#D6E4EC",
    data: [
        [-2500, -2500],
        [0, -2550],
        [0, 0],
        [2500, 0],
        [2500, 2500],
        [-2500, 2500]
    ]
}, {
    id: 'wall9',
    closed: true,
    showFloor: true,
    wallHeight: 310,
    outsideImage: "",
    outsideColor: "#A5BDDD",
    insideColor: "#B8CAD5",
    topColor: "#D6E4EC",
    data: [
        [-2500, -500],
        [-1300, -500],
        [-1300, -2500],
        [1300, -2500],
        [1300, -500],
        [2500, -500],
        [2500, 2500],
        [-2500, 2500]
    ]
}, {
    id: 'wall10',
    closed: true,
    showFloor: true,
    wallHeight: 310,
    outsideImage: "",
    outsideColor: "#A5BDDD",
    insideColor: "#B8CAD5",
    topColor: "#D6E4EC",
    data: [
        [-2500, -500],
        [-1500, -500],
        [-1000, -2500],
        [1000, -2500],
        [1500, -500],
        [2500, -500],
        [2500, 2500],
        [-2500, 2500]
    ]
}, {
    id: 'wall11',
    wallHeight: 310,
    insideImage: "wall5.jpg",
    outsideImage: "",
    insideColor: "#ffffff",
    outsideColor: "#ccd8e1",
    topColor: "#b3b3b3",
    floorImage: 'floor-1.jpg',
    insideMap: 'inside_lightmap-1.jpg',
    outsideMap: ""
}, {
    id: 'wall12',
    wallHeight: 260,
    insideImage: "inner-wall6.jpg",
    outsideImage: "",
    insideColor: "#ffffff",
    outsideColor: "#ccd8e1",
    topColor: "#b3b3b3",
    floorImage: 'floor-1.jpg',
    insideMap: 'inside_lightmap-1.jpg',
    outsideMap: ""
}, {
    id: 'wall13',
    wallHeight: 350,
    insideImage: "wall5.jpg",
    outsideImage: "",
    outsideColor: "#A9B1BB",
    outsideMap: ""
}, {
    id: 'wall14',
    wallHeight: 310,
    outsideColor: "#c3ccd8",
    insideImage: 'inner-wall10.jpg',
    outsideImage: 'wall14.jpg',
    insideMap: "inside_lightmap9.jpg",
    outsideMap: 'outside_lightmap9.jpg',
    floorImage: 'floor5.jpg',
    frameColor: '#2e313a',
    topColor: '#dbdee5'
}, {
    id: 'wall15',
    wallHeight: 310,
    // outsideColor: "#c3ccd8",
    insideImage: 'inner-wall16.jpg',
    outsideImage: 'wall14.jpg',
    insideMap: "inside_lightmap12.jpg",
    outsideMap: 'outside_lightmap9.jpg',
    floorImage: 'floor2.jpg',
    frameColor: '#2e313a',
    topColor: '#6d7080'
}
];

var getCommWallParameters = function (params) {
    var result = getWallParameters();
    if (params.closed != null) result.closed.value = params.closed;
    if (params.showFloor != null) result.showFloor.value = params.showFloor;
    if (params.data) result.data.value = params.data;
    if (params.wallHeight) result.wallHeight.value = params.wallHeight;
    if (params.insideImage != null) result.insideImage.value = params.insideImage;
    if (params.outsideImage != null) result.outsideImage.value = params.outsideImage;
    if (params.outsideColor != null) result.outsideColor.value = params.outsideColor;
    if (params.insideColor != null) result.insideColor.value = params.insideColor;
    if (params.topColor != null) result.topColor.value = params.topColor;
    if (params.insideMap != null) result.insideMap.value = params.insideMap;
    if (params.outsideMap != null) result.outsideMap.value = params.outsideMap;
    if (params.floorImage != null) result.floorImage.value = params.floorImage;
    if (params.frameColor != null) result.frameColor.value = params.frameColor;
    return result;
}

for (var i = 0; i < walls.length; i++) {
    var wall = walls[i];
    make.Default.copy('twaver.idc.' + wall.id, 'twaver.idc.wall', {}, {
        name: wall.name,
        icon: getIdcIconPath(wall.id + '.png'),
        description: wall.description,
        sdkCategory: 'floor',
        modelDefaultParameters: getCommWallParameters(wall)
    });
}
/***************外墙模型**************************/

/**************内墙模型***************************/
var getInnerWallParameters = function () {
    var result = getWallParameters();
    result.wallDepth.value = 20;
    result.frameColor.value = '#E0E0E0';
    result.outsideColor.value = '#EFEFEF';
    result.outsideImage.value = '';
    result.insideRepeat = {
        name: "内墙重复次数",
        value: 1,
        type: make.Default.PARAMETER_TYPE_NUMBER,
        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
    }
    result.outsideRepeat = {
        name: "外墙重复次数",
        value: 1,
        type: make.Default.PARAMETER_TYPE_NUMBER,
        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
    }
    result.reverse = {
        name: "是否反转",
        value: false,
        type: make.Default.PARAMETER_TYPE_NUMBER,
        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
    }
    delete result.showFloor;
    delete result.closed;
    return result;
}

make.Default.register('twaver.idc.innerWall', function (json, callback) {
    var objects = [];
    var client = json.client || {};
    var width = json.wallDepth;
    var height = json.wallHeight;
    var insideMap = json.insideMap ? make.Default.getImagePath(json.insideMap) : null;
    var outsideMap = json.outsideMap ? make.Default.getImagePath(json.outsideMap) : null;
    var insideImage = json.insideImage ? getIdcWallImagePath(json.insideImage) : null;
    var outsideImage = json.outsideImage ? getIdcWallImagePath(json.outsideImage) : null;
    var position = json.position || [0, 0, 0];
    position[0] = parseFloat(position[0]) || 0;
    position[1] = parseFloat(position[1]) || 0;
    position[2] = parseFloat(position[2]) || 0;
    var insideRepeat = json.insideRepeat;
    var outsideRepeat = json.outsideRepeat;
    var style = json.style || {};
    var reverse = json.reverse;
    if (insideRepeat) style['inside.m.texture.repeat'] = new mono.Vec2(insideRepeat, 1)
    if (outsideRepeat) style['outside.m.texture.repeat'] = new mono.Vec2(outsideRepeat, 1)
    if (reverse) {
        insideMap = json.outsideMap ? make.Default.getImagePath(json.outsideMap) : null;
        outsideMap = json.insideMap ? make.Default.getImagePath(json.insideMap) : null;
        insideImage = json.outsideImage ? getIdcWallImagePath(json.outsideImage) : null;
        outsideImage = json.insideImage ? getIdcWallImagePath(json.insideImage) : null;
    }

    var wall = {
        type: 'path',
        op: '+',
        width: width,
        height: height,
        insideColor: json.insideColor,
        outsideColor: json.outsideColor,
        asideColor: json.asideColor,
        zsideColor: json.zsideColor,
        topColor: json.topColor,
        bottomColor: json.bottomColor,
        insideImage: insideImage,
        outsideImage: outsideImage,
        insideMap: insideMap,
        outsideMap: outsideMap,
        repeat: json.repeat,
        // position: json.position,
        data: json.data,
        style: style
        // style: {
        //     'm.polygonOffset': true,
        //     'm.polygonOffsetFactor': 6,
        //     'm.polygonOffsetUnits': 3,
        // },
    };
    objects.push(wall);

    if (json.children) {
        var doorDatas = [];
        for (var i = 0; i < json.children.length; i++) {
            json.children[i].inbuilt = true;
            json.children[i].depth = width + 6;
            var rotationY = getRotationYByDatas(json.children[i].position, json.data, json.position);
            json.children[i].rotation = [0, rotationY, 0];
            var p = json.children[i].position;
            p[0] = parseFloat(p[0]) || 0;
            p[1] = parseFloat(p[1]) || 0;
            p[2] = parseFloat(p[2]) || 0;

            json.children[i].position = [p[0] - position[0], p[1] - position[1], p[2] - position[2]]
            json.children[i].frameColor = json.frameColor;
            var children = make.Default.load(json.children[i]);
            objects = objects.concat(children);
            var childWidth = json.children[i].width || 205;
            if (json.children[i].id.indexOf('twaver.idc.door') >= 0) {
                var transparent = make.Default.getModelDefaultParameters(json.children[i].id).transparent.value
                if (transparent && rotationY % 180 == 0) {
                    doorDatas.push([p[0] - position[0] - childWidth / 2, p[2] - position[2]]);
                    doorDatas.push([p[0] - position[0] + childWidth / 2, p[2] - position[2]]);
                } else if (transparent && rotationY % 90 == 0) {
                    doorDatas.push([p[0] - position[0], p[2] - position[2] - childWidth / 2]);
                    doorDatas.push([p[0] - position[0], p[2] - position[2] + childWidth / 2]);
                }
            }
        }
    }

    var comboChildren = [];
    var returnObjects = [];
    for (var i = 0; i < objects.length; i++) {
        var child = objects[i];
        if (child.op) {
            comboChildren.push(child);
        } else {
            returnObjects.push(child);
        }
    }

    var combo = make.Default.createCombo(comboChildren);
    if (json.style) {
        combo.s(json.style);
    }
    combo.setPosition(position[0], position[1], position[2])
    combo.setClient('data', json.data);
    if (doorDatas && doorDatas.length > 0) {
        combo.setClient('doorData', doorDatas);
    }
    combo.setClient('wallDepth', width);
    combo.setClient('type', 'inner_wall');

    if (returnObjects.length > 0) {
        for (var i = 0; i < returnObjects.length; i++) {
            var returnObject = returnObjects[i];
            var object = make.Default.createCombo(returnObject);
            object.setParent && (object.setParent(combo));
        }
    }
    make.Default.setObject3dCSProps(combo, json);
    if (callback) callback(combo);
    return combo;
}, {
        category: "房间模型",
        type: "innerWall",
        name: "内墙",
        icon: getIdcIconPath('innerWall.png'),
        description: "内墙是和外墙，地板一起使用的。用来创建3d机房的房间轮廓",
        sdkCategory: 'floor-child',
        modelDefaultParameters: getInnerWallParameters(),
    });

var innerWalls = [
    { id: 'innerWall2', wallHeight: 310, description: "同上，高度为310的内墙" },
    { id: 'innerWall3', insideColor: "#abacb0", outsideColor: '#abacb0' },
    { id: 'innerWall4', wallHeight: 310, outsideColor: "#B8CAD5", insideColor: "#B8CAD5", topColor: "#D6E4EC" }, {
        id: 'innerWall5',
        wallHeight: 310,
        outsideColor: "#ffffff",
        insideColor: "#ffffff",
        topColor: "#b3b3b3",
        insideImage: 'inner-wall5.jpg',
        outsideImage: 'inner-wall5.jpg',
        insideMap: 'inside_lightmap-1.jpg',
        outsideMap: 'inside_lightmap-1.jpg',
        floorfloorImageColor: "#DAF0F5",
        floorImage: "wall.png"
    }, {
        id: 'innerWall6',
        wallHeight: 260,
        outsideColor: "#ffffff",
        insideColor: "#ffffff",
        topColor: "#b3b3b3",
        insideImage: 'inner-wall6.jpg',
        outsideImage: 'inner-wall6.jpg',
        insideMap: 'inside_lightmap-1.jpg',
        outsideMap: 'inside_lightmap-1.jpg'
    },
    { id: 'innerWall7', wallHeight: 310, topColor: "#b3b3b3", description: "同上，高度为310的内墙" }, {
        id: 'innerWall8',
        wallHeight: 350,
        frameColor: '#8b8b8b',
        insideColor: "#e1e1e1",
        insideImage: 'wall5.jpg',
        outsideImage: 'wall5.jpg',
        outsideColor: "#e1e1e1",
        description: "同上，高度为310的内墙"
    }, {
        id: 'innerWall9',
        outsideColor: "#B8CAD5",
        insideColor: "#B8CAD5",
        topColor: "#D6E4EC",
    }, {
        id: 'innerWall10',
        wallHeight: 310,
        insideImage: 'inner-wall10.jpg',
        outsideImage: 'inner-wall10.jpg',
        outsideMap: 'inside_lightmap9.jpg',
        insideMap: 'inside_lightmap9.jpg',
        insideColor: "#FFFFFF",
        outsideColor: "#FFFFFF",
        topColor: '#dbdee5',
        frameColor: '#2e313a'
    }, {
        id: 'innerWall11',
        wallHeight: 310,
        insideImage: 'inner-wall11.jpg',
        outsideImage: 'outer-wall11.jpg',
        insideMap: 'inside_lightmap9.jpg',
        outsideMap: 'inside_lightmap10.jpg',
        topColor: '#dbdee5',
        frameColor: '#2e313a',
        insideRepeat: 0.7,
        outsideRepeat: 1.5
    }, {
        id: 'innerWall12',
        wallHeight: 310,
        insideImage: 'inner-wall10.jpg',
        outsideImage: 'outer-wall11.jpg',
        insideMap: 'inside_lightmap9.jpg',
        outsideMap: 'inside_lightmap9.jpg',
        topColor: '#dbdee5',
        frameColor: '#2e313a',
        insideRepeat: 0.7
    }, {
        id: 'innerWall13',
        wallHeight: 310,
        insideImage: 'inner-wall13.jpg',
        outsideImage: 'inner-wall13.jpg',
        insideMap: 'inside_lightmap9.jpg',
        outsideMap: 'inside_lightmap9.jpg',
        topColor: '#dbdee5',
        frameColor: '#2e313a'
    }, {
        id: 'innerWall14',
        wallHeight: 310,
        insideImage: 'inner-wall10.jpg',
        outsideImage: 'inner-wall13.jpg',
        insideMap: 'inside_lightmap9.jpg',
        outsideMap: 'inside_lightmap9.jpg',
        insideColor: "#FFFFFF",
        outsideColor: "#FFFFFF",
        topColor: '#dbdee5',
        frameColor: '#2e313a',
        insideRepeat: 0.7
    }, {
        id: 'innerWall15',
        wallHeight: 310,
        insideImage: 'inner-wall10.jpg',
        outsideImage: 'wall14.jpg',
        insideMap: 'inside_lightmap9.jpg',
        outsideMap: 'inside_lightmap9.jpg',
        insideColor: "#FFFFFF",
        outsideColor: "#FFFFFF",
        topColor: '#dbdee5',
        frameColor: '#2e313a',
        insideRepeat: 0.7
    }, {
        id: 'innerWall16',
        wallHeight: 310,
        insideImage: 'inner-wall16.jpg',
        outsideImage: 'inner-wall16.jpg',
        insideMap: 'inside_lightmap12.jpg',
        outsideMap: 'inside_lightmap12.jpg',
        insideColor: "#FFFFFF",
        outsideColor: "#FFFFFF",
        topColor: '#6d7080',
        frameColor: '#2e313a',
        insideRepeat: 0.7
    }
];

var getCommInnerWallParameters = function (params) {
    var result = getInnerWallParameters();
    if (params.wallHeight) result.wallHeight.value = params.wallHeight;
    if (params.insideImage != null) result.insideImage.value = params.insideImage;
    if (params.outsideImage != null) result.outsideImage.value = params.outsideImage;
    if (params.outsideColor != null) result.outsideColor.value = params.outsideColor;
    if (params.insideColor != null) result.insideColor.value = params.insideColor;
    if (params.topColor != null) result.topColor.value = params.topColor;
    if (params.insideMap != null) result.insideMap.value = params.insideMap;
    if (params.outsideMap != null) result.outsideMap.value = params.outsideMap;
    if (params.insideRepeat != null) result.insideRepeat.value = params.insideRepeat;
    if (params.outsideRepeat != null) result.outsideRepeat.value = params.outsideRepeat;
    if (params.frameColor != null) result.frameColor.value = params.frameColor;
    return result;
}

for (var i = 0; i < innerWalls.length; i++) {
    var innerWall = innerWalls[i];
    make.Default.copy('twaver.idc.' + innerWall.id, 'twaver.idc.innerWall', {}, {
        icon: getIdcIconPath(innerWall.id + '.png'),
        description: innerWall.description,
        modelDefaultParameters: getCommInnerWallParameters(innerWall)
    });
}
/**************内墙模型******************/

/**************玻璃墙模型******************/
var getGlassWallParameters = function () {
    return {
        data: {
            name: "坐标点",
            value: [],
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        wallDepth: {
            name: "墙面厚度",
            value: 20,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        wallHeight: {
            name: "墙高度",
            value: 260,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        insideColor: {
            name: "内墙颜色",
            value: '#62F3FF',
            type: make.Default.PARAMETER_TYPE_COLOR,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        outsideColor: {
            name: "外墙颜色",
            value: '#62F3FF',
            type: make.Default.PARAMETER_TYPE_COLOR,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        frameColor: {
            name: '墙内侧边框颜色',
            value: '#E0E0E0',
            type: make.Default.PARAMETER_TYPE_BOOLEAN,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        asideColor: {
            name: "外墙颜色",
            value: '#000000',
            type: make.Default.PARAMETER_TYPE_COLOR,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        zsideColor: {
            name: "外墙颜色",
            value: '#333333',
            type: make.Default.PARAMETER_TYPE_COLOR,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        topColor: {
            name: "顶部颜色",
            value: '#F7F7F7',
            type: make.Default.PARAMETER_TYPE_COLOR,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        bottomColor: {
            name: "底部颜色",
            value: '#D6E4EC',
            type: make.Default.PARAMETER_TYPE_COLOR,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        insideImage: {
            name: "内墙贴图",
            value: 'glass-wall.png',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        outsideImage: {
            name: "外墙贴图",
            value: 'glass-wall.png',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        repeat: {
            name: "重复高度",
            value: 0,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        children: {
            name: "孩子对象",
            value: '',
            hidden: true,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        showBaseboard: {
            name: "是否显示贴脚线",
            value: false,
            hidden: true,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        }
    }
}

make.Default.register('twaver.idc.glassWall', function (json, callback) {
    var objects = [];
    var client = json.client || {};
    var width = json.wallDepth;
    var insideImage = getIdcWallImagePath(json.insideImage);
    var outsideImage = getIdcWallImagePath(json.outsideImage);
    var repeat = json.repeat || json.wallHeight;
    var position = json.position || [0, 0, 0];
    var showBaseboard = json.showBaseboard;
    var position = json.position || [0, 0, 0];

    var wall = {
        type: 'path',
        op: '+',
        width: width,
        height: showBaseboard ? json.wallHeight - 15 : json.wallHeight,
        floorShadow: true,
        repeat: repeat,
        position: [position[0], showBaseboard ? position[1] + 15 : position[1], position[2]],
        data: json.data,
        insideColor: json.insideColor,
        outsideColor: json.outsideColor,
        asideColor: json.asideColor,
        zsideColor: json.zsideColor,
        topColor: json.topColor,
        bottomColor: json.bottomColor,
        insideImage: insideImage,
        outsideImage: outsideImage,
        style: {
            'inside.m.type': 'phong',
            'outside.m.type': 'phong',
            'inside.m.transparent': true,
            'outside.m.transparent': true,
            'inside.m.envmap.image': make.Default.getEnvMap('envmap2'),
            'outside.m.envmap.image': make.Default.getEnvMap('envmap2'),
        },
    };
    objects.push(wall);
    if (showBaseboard) {
        var baseBoard = {
            type: 'path',
            op: '+',
            width: width + 2,
            height: json.baseBoardHeight || 14,
            repeat: repeat,
            position: json.position,
            data: json.data,
            insideColor: json.baseBoardInsideColor || '#333640',
            outsideColor: json.baseBoardOutsideColor || '#333640',
            // asideColor: json.baseBoardAsideColor || '#535867',
            // zsideColor: json.zsideColor,
            topColor: json.baseBoardTopColor || '#535867',
            bottomColor: json.bottomColor,
            style: {
                'm.type': 'basic'
            }
        }
        objects.push(baseBoard);
    }
    var doorDatas = [];

    if (json.children) {
        for (var i = 0; i < json.children.length; i++) {
            json.children[i].inbuilt = true;
            json.children[i].depth = width + 6;
            var rotationY = getRotationYByDatas(json.children[i].position, json.data, json.position);
            json.children[i].rotation = [0, rotationY, 0];
            json.children[i].frameColor = json.frameColor;
            var children = make.Default.load(json.children[i]);
            var p = json.children[i].position;
            objects = objects.concat(children);
            var childWidth = json.children[i].width || 205;
            if (json.children[i].id.indexOf('twaver.idc.door') >= 0) {
                if (rotationY % 180 == 0) {
                    doorDatas.push([p[0] - position[0] - childWidth / 2, p[2] - position[2]]);
                    doorDatas.push([p[0] - position[0] + childWidth / 2, p[2] - position[2]]);
                } else if (rotationY % 90 == 0) {
                    doorDatas.push([p[0] - position[0], p[2] - position[2] - childWidth / 2]);
                    doorDatas.push([p[0] - position[0], p[2] - position[2] + childWidth / 2]);
                }
            }
        }
    }

    var comboChildren = [];
    var returnObjects = [];
    for (var i = 0; i < objects.length; i++) {
        var child = objects[i];
        if (child.op) {
            comboChildren.push(child);
        } else {
            returnObjects.push(child);
        }
    }

    var combo = make.Default.createCombo(comboChildren);
    if (json.style) {
        combo.s(json.style);
    }
    combo.setClient('data', json.data);
    combo.setClient('wallDepth', width);
    combo.setClient('type', 'glass_wall');
    if (doorDatas && doorDatas.length > 0) {
        combo.setClient('doorData', doorDatas);
    }

    if (returnObjects.length > 0) {
        for (var i = 0; i < returnObjects.length; i++) {
            var returnObject = returnObjects[i];
            var object = make.Default.createCombo(returnObject);
            object.setParent && (object.setParent(combo));
        }
    }
    make.Default.setObject3dCSProps(combo, json);
    if (callback) callback(combo);
    return combo;
}, {
        category: "房间模型",
        type: "innerWall",
        name: "玻璃墙",
        icon: getIdcIconPath('glassWall.png'),
        description: "内墙是和外墙，地板一起使用的。用来创建3d机房的房间轮廓",
        sdkCategory: 'floor-child',
        modelDefaultParameters: getGlassWallParameters(),
    });

var getGlassWall2Parameters = function () {
    var result = getGlassWallParameters();
    var params = {
        glassImage: {
            name: "玻璃贴图",
            value: '',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        glassColor: {
            name: "玻璃颜色",
            value: '#01A9DB',
            type: make.Default.PARAMETER_TYPE_COLOR,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        glassOpacity: {
            name: "玻璃透明度",
            value: '0.5',
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
    };
    make.Default.copyProperties(params, result);
    result.insideColor.value = "#B8CAD5";
    result.outsideColor.value = "#A5BDDD";
    result.asideColor.value = "#D6E4EC";
    result.zsideColor.value = "#D6E4EC";
    result.topColor.value = "#D6E4EC";
    result.bottomColor.value = "#D6E4EC";
    result.insideImage.value = "";
    result.outsideImage.value = "";
    return result;
}

make.Default.register('twaver.idc.glassWall2', function (json, callback) {
    var objects = [];
    var width = json.wallDepth;
    var height = json.wallHeight;
    var glassHeight = height * 0.6;
    var position = json.position || [0, 0, 0];
    position[0] = parseFloat(position[0]) || 0;
    position[1] = parseFloat(position[1]) || 0;
    position[2] = parseFloat(position[2]) || 0;
    var label = json.label;
    var labelPosition = json.labelPosition || [0, 0, 0];
    labelPosition[0] = parseFloat(labelPosition[0]) || 0;
    labelPosition[1] = parseFloat(labelPosition[1]) || 0;
    labelPosition[2] = parseFloat(labelPosition[2]) || 0;
    var labelColor = json.labelColor || 'red';
    var labelFont = json.labelFont;
    var labelOffset = json.labelOffset || 1;
    var wall = {
        type: 'path',
        op: '+',
        width: width,
        height: height,
        insideColor: json.insideColor,
        outsideColor: json.outsideColor,
        asideColor: json.asideColor,
        zsideColor: json.zsideColor,
        topColor: json.topColor,
        bottomColor: json.bottomColor,
        repeat: json.repeat,
        // position: json.position,
        data: json.data,
        closed: json.closed,
    };
    objects.push(wall);
    var cut = {
        type: 'path',
        width: width + 2,
        height: glassHeight,
        op: '-',
        position: [0, (height - glassHeight) / 3 * 2, 0],
        insideColor: json.insideColor,
        outsideColor: json.outsideColor,
        asideColor: json.asideColor,
        zsideColor: json.zsideColor,
        topColor: json.topColor,
        bottomColor: json.bottomColor,
        data: json.data,
        closed: json.closed,
    };
    objects.push(cut);
    var glassWall = {
        type: 'path',
        width: 1,
        height: glassHeight,
        op: '+',
        position: [0, (height - glassHeight) / 3 * 2, 0],
        insideImage: json.glassImage,
        outsideImage: json.glassImage,
        topColor: json.topColor,
        bottomColor: 'json.bottomColor',
        style: {
            'm.type': 'phong',
            'm.transparent': true,
            'm.opacity': json.glassOpacity,
            'm.color': json.glassColor,
            'm.ambient': json.glassColor,
            'm.specularStrength': 100,
            'm.envmap.image': make.Default.getEnvMap('envmap1'),
            'm.specularmap.image': make.Default.getImagePath('metal_normalmap1.jpg'),
            // 'm.texture.repeat': new mono.Vec2(5, 5),
        },
        data: json.data,
        closed: json.closed,
    };
    objects.push(glassWall);

    if (json.children) {
        for (var i = 0; i < json.children.length; i++) {
            json.children[i].inbuilt = true;
            json.children[i].depth = width + 6;
            var rotationY = getRotationYByDatas(json.children[i].position, json.data, json.position);
            json.children[i].rotation = [0, rotationY, 0];
            var p = json.children[i].position;

            p[0] = parseFloat(p[0]) || 0;
            p[1] = parseFloat(p[1]) || 0;
            p[2] = parseFloat(p[2]) || 0;

            json.children[i].position = [p[0] - position[0], p[1] - position[1], p[2] - position[2]]
            var children = make.Default.load(json.children[i]);
            objects = objects.concat(children);
        }
    }

    var comboChildren = [];
    var returnObjects = [];
    for (var i = 0; i < objects.length; i++) {
        var child = objects[i];
        if (child.op) {
            comboChildren.push(child);
        } else {
            returnObjects.push(child);
        }
    }

    var combo = make.Default.createCombo(comboChildren);
    if (json.style) {
        combo.s(json.style);
    }
    combo.setPosition(position[0], position[1], position[2]);
    combo.setClient('data', json.data);
    combo.setClient('type', 'glass_wall');
    if (returnObjects.length > 0) {
        for (var i = 0; i < returnObjects.length; i++) {
            var returnObject = returnObjects[i];
            var object = make.Default.createCombo(returnObject);
            object.setParent && (object.setParent(combo));
        }
    }
    make.Default.setObject3dCSProps(combo, json);

    if (label) {


        var canvas = make.Default.generateTextCanvas(label, labelColor, labelFont, false, null, true);
        var drawRect = canvas.drawRect;
        var labelNode = new mono.Plane(drawRect.width, drawRect.height, 1, 1);
        labelNode.s({
            'm.transparent': false,
            'm.alphaTest': 0.5,
            'm.texture.image': canvas,
            'm.texture.anisotropy': 8,
            'm.texture.repeat': new mono.Vec2(drawRect.width / canvas.width, drawRect.height / canvas.height),
            'm.texture.offset': new mono.Vec2(0, 0),
        });
        var rotationY = getRotationYByDatas(labelPosition, json.data, json.position);
        var ry = rotationY / 180 * Math.PI;
        labelNode.setRotationY(ry);
        labelNode.setSelectable(false);
        labelPosition[0] = labelPosition[0] - position[0];
        labelPosition[1] = labelPosition[1] - position[1];
        labelPosition[2] = labelPosition[2] - position[2];
        labelPosition[2] += Math.cos(ry) * (width / 2 + labelOffset);
        labelPosition[0] += Math.sin(ry) * (width / 2 + labelOffset);
        labelNode.p(labelPosition[0], labelPosition[1], labelPosition[2]);
        labelNode.setParent(combo);
    }
    if (json.showFloor) {
        var position = json.position || [0, 0, 0];
        var floorImage = json.floorImage;
        var floorId = json.floorId || 'twaver.idc.floor'
        var floor = make.Default.load({
            id: floorId,
            data: json.data,
            image: floorImage,
            position: [position[0], -1, position[2]],
        });
        floor.setParent(combo);
    }

    if (callback) callback(combo);
    return combo;
}, {
        category: "房间模型",
        type: "innerWall",
        name: "玻璃墙",
        icon: getIdcIconPath('glassWall2.png'),
        description: "内墙是和外墙，地板一起使用的。用来创建3d机房的房间轮廓",
        sdkCategory: 'floor-child',
        modelDefaultParameters: getGlassWall2Parameters(),
    });

var glassWalls = [{
    id: 'glassWall1',
    wallHeight: 310,
    wallDepth: 15,
    topColor: "#E3E3E3",
    insideImage: "glass-wall1.png",
    outsideImage: "glass-wall1.png"
}, {
    id: 'glassWall3',
    copyId: "glassWall2",
    wallDepth: 15,
    insideColor: "#bababa",
    outsideColor: "#bababa",
    topColor: "#E3E3E3",
    bottomColor: "#8F8F8F",
    glassColor: "#FFF"
}, {
    id: 'glassWall4',
    wallHeight: 310,
    frameColor: "#888888",
    topColor: "#b3b3b3",
    // topColor: '#dbdee5',
    showBaseboard: true,
    insideImage: "glass-wall4.png",
    outsideImage: "glass-wall4.png"
}, {
    id: 'glassWall5',
    wallHeight: 260,
    frameColor: "#888888",
    topColor: "#b3b3b3",
    insideImage: "glass-wall5.png",
    outsideImage: "glass-wall5.png"
}, {
    id: 'glassWall6',
    wallHeight: 260,
    frameColor: "#888888",
    topColor: "#b3b3b3",
    insideImage: "glass-wall6.png",
    outsideImage: "glass-wall6.png"
}, {
    id: 'glassWall7',
    wallHeight: 310,
    frameColor: "#888888",
    topColor: "#b3b3b3",
    insideImage: "glass-wall7.png",
    outsideImage: "glass-wall7.png"
}, {
    id: 'glassWall8',
    wallHeight: 310,
    frameColor: '#2e313a',
    topColor: '#dbdee5',
    showBaseboard: true,
    insideImage: "glass-wall4.png",
    outsideImage: "glass-wall4.png"
}];

var getCommGlassWallParameters = function (params) {
    var result = getGlassWallParameters();
    if (params.copyId == 'glassWall2') {
        result = getGlassWall2Parameters();
    }
    if (params.wallHeight) result.wallHeight.value = params.wallHeight;
    if (params.wallDepth) result.wallDepth.value = params.wallDepth;
    if (params.topColor != null) result.topColor.value = params.topColor;
    if (params.bottomColor != null) result.bottomColor.value = params.bottomColor;
    if (params.glassColor != null) result.glassColor.value = params.glassColor;
    if (params.insideImage != null) result.insideImage.value = params.insideImage;
    if (params.outsideImage != null) result.outsideImage.value = params.outsideImage;
    if (params.outsideColor != null) result.outsideColor.value = params.outsideColor;
    if (params.insideColor != null) result.insideColor.value = params.insideColor;
    if (params.insideMap != null) result.insideMap.value = params.insideMap;
    if (params.outsideMap != null) result.outsideMap.value = params.outsideMap;
    if (params.showBaseboard != null) result.showBaseboard.value = params.showBaseboard;
    if (params.frameColor != null) result.frameColor.value = params.frameColor;
    return result;
}

for (var i = 0; i < glassWalls.length; i++) {
    var glassWall = glassWalls[i];
    var copyId = glassWall.copyId ? 'twaver.idc.' + glassWall.copyId : 'twaver.idc.glassWall';
    make.Default.copy('twaver.idc.' + glassWall.id, copyId, {}, {
        icon: getIdcIconPath(glassWall.id + '.png'),
        modelDefaultParameters: getCommGlassWallParameters(glassWall)
    });
}
/***************玻璃墙模型*******************/

/***************门模型***************/
var getDoor1Parameters = function () {
    var result = getBasicParameters(100, 180, 26);
    var params = {
        'color': {
            name: '颜色',
            value: '#FFFFFF',
            type: make.Default.PARAMETER_TYPE_COLOR,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'image': {
            name: '贴图',
            value: 'door1.png',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'frameColor': {
            name: '墙内侧边框颜色',
            value: '#888888',
            type: make.Default.PARAMETER_TYPE_BOOLEAN,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'doorFrameColor': {
            name: '门框颜色',
            value: '#CDCDCD',
            type: make.Default.PARAMETER_TYPE_BOOLEAN,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        transparent: {
            name: '是否透明',
            value: true,
            type: make.Default.PARAMETER_TYPE_BOOLEAN,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        frame: {
            name: '显示门框',
            value: false,
            type: make.Default.PARAMETER_TYPE_BOOLEAN,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        }
    }
    make.Default.copyProperties(params, result);
    return result;
}

make.Default.register('twaver.idc.door1', function (json) {
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];
    var width = json.width,
        height = json.height,
        depth = json.depth;
    var frameEdge = 10,
        frameBottomEdge = 2;
    var image = getIdcDoorImagePath(json.image);
    var transparent = true;
    var color = json.color;
    var frameColor = json.frameColor;
    var doorFrameColor = json.doorFrameColor;
    var client = json.client || {};
    if (json.transparent != null && json.transparent != undefined) {
        transparent = json.transparent;
    }
    var parts = [];
    if (json.frame) {
        parts.push({
            //door frame.
            type: 'cube',
            width: width,
            height: height,
            depth: depth,
            op: '+',
            position: [x, y + height / 2, z],
            rotation: rotation,
            color: doorFrameColor,
            style: {
                'm.type': 'phong',
                'm.specularStrength': 50,
            }
        });

    }
    if (json.frame || json.inbuilt) {
        parts.push({
            //door cut off.
            type: 'cube',
            width: width - frameEdge,
            height: height - frameEdge / 2 - frameBottomEdge,
            depth: depth + 2,
            op: '-',
            position: [x, y + frameBottomEdge + height / 2, z],
            rotation: rotation,
            color: frameColor,
        });
    }
    parts.push({
        //door.
        type: 'cube',
        width: (width - frameEdge) - 2,
        height: height - frameEdge / 2 - frameBottomEdge - 2,
        depth: 2,
        position: [x, y + frameBottomEdge + 1 + height / 2, z],
        color: color,
        rotation: rotation,
        wrapMode: 'six-each',
        style: {
            'm.type': 'phong',
            'm.transparent': transparent,
            'm.texture.image': image,
            'front.m.texture.flipX': true,
            'm.specularStrength': 100,
            // 'm.envmap.image': transparent ? make.Default.getEnvMap('envmap2') : null,
            'm.specularmap.image': getIdcImagePath('white.png'),
        },
        client: {
            'animation': 'rotation:left:-80:1000:0:bounceOut',
            'type': 'door',
            'bid': client.bid,
        },
    });
    if (json.inbuilt) {
        return parts;
    }
    return make.Default.createCombo(parts);
}, {
        category: "房间模型",
        type: "door",
        name: "单开门",
        icon: getIdcIconPath('door1.png'),
        description: "门一般不单独使用，是加在内墙或外墙模型上，作为这类模型的孩子对象",
        sdkCategory: 'floor-child',
        modelDefaultParameters: getDoor1Parameters(),
    });

var getDoorParameters = function () {
    var result = getBasicParameters(205, 180, 26);
    var params = {
        'color': {
            name: '颜色',
            value: '#9E9E9E',
            type: make.Default.PARAMETER_TYPE_COLOR,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'leftImage': {
            name: '左门贴图',
            value: 'door-l.png',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'rightImage': {
            name: '右门贴图',
            value: 'door-r.png',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        /*'envmap': {
         name: '环境贴图',
         value: make.Default.getEnvMap('envmap2'),
         type: make.Default.PARAMETER_TYPE_IMAGE,
         propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
         },*/
        'frame': {
            name: '显示门框',
            value: true,
            type: make.Default.PARAMETER_TYPE_BOOLEAN,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'frameColor': {
            name: '墙内侧边框颜色',
            value: '#888888',
            type: make.Default.PARAMETER_TYPE_BOOLEAN,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'doorFrameColor': {
            name: '门框颜色',
            value: '#CDCDCD',
            type: make.Default.PARAMETER_TYPE_BOOLEAN,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'acs': {
            name: '显示门禁',
            value: false,
            type: make.Default.PARAMETER_TYPE_BOOLEAN,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'transparent': {
            name: '是否透明',
            value: true,
            type: make.Default.PARAMETER_TYPE_BOOLEAN,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'doorAnimationType': {
            name: "门动画类型", //1 代表旋转门；2是左右平移
            value: 1,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
    }
    make.Default.copyProperties(params, result);
    return result;
}

make.Default.register('twaver.idc.door', function (json) {
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];
    var width = json.width || 205,
        height = json.height || 213,
        depth = json.depth || 26;
    var frameEdge = 10, //门框的厚度
        frameBottomEdge = 5;
    var client = json.client || {};
    var color = json.color;
    var acs = json.acs;
    var frame = json.frame;
    var frameColor = json.frameColor || '#FEFEFE';
    var doorFrameColor = json.doorFrameColor || '#CDCDCD';
    var leftImage = getIdcDoorImagePath(json.leftImage);
    var rightImage = getIdcDoorImagePath(json.rightImage);
    var envmap = json.envmap;
    var transparent = json.transparent;
    var parts = [];
    var doorAnimationType = json.doorAnimationType || 1;
    if (transparent != false) transparent = true;
    if (doorAnimationType == 2) {
        var animateLeft = 'move:front:35:1000:0:bounceOut';
        var animateRight = 'move:back:35:1000:0:bounceOut';
    } else {
        var animateLeft = 'rotation:left:-90:1000:0:bounceOut';
        var animateRight = 'rotation:right:90:1000:0:bounceOut';
    }
    if (frame) {
        parts.push({
            //door cut off.
            type: 'cube',
            width: width + 1,
            height: height + 1,
            depth: depth + 2,
            op: '-',
            position: [x, y + height / 2, z],
            rotation: rotation,
            color: frameColor //门槛的颜色
        });
        parts.push({
            //door frame.
            type: 'cube',
            width: width,
            height: height,
            depth: depth,
            op: '+',
            position: [x, y + height / 2, z],
            rotation: rotation,
            color: doorFrameColor,
            style: {
                'm.type': 'phong',
                'm.specularStrength': 50,
            }
        });
    }
    if (frame || json.inbuilt) {
        parts.push({
            //door cut off.
            type: 'cube',
            width: width - frameEdge,
            height: height - frameEdge,
            depth: depth + 2,
            op: '-',
            position: [x, y + height / 2, z],
            rotation: rotation,
            color: frameColor //门槛的颜色
        });
    }

    parts.push({
        //left door.
        type: 'cube',
        width: (width - frameEdge) / 2,
        height: height - frameEdge,
        depth: 2,
        position: [x - (width - frameEdge) / 4, y + height / 2, z],
        color: color,
        rotation: rotation,
        rotationAnchor: 'left',
        wrapMode: 'six-each',
        style: {
            'm.type': 'phong',
            'm.transparent': transparent,
            'm.texture.image': leftImage,
            'm.specularStrength': 100,
            'm.envmap.image': envmap,
            'm.specularmap.image': getIdcImagePath('white.png'),
        },
        client: {
            'animation': animateLeft,
            'type': 'door',
            'bid': client.bid + '-left',
            'doorId': client.bid,
        },
    });
    parts.push({
        //right door.
        type: 'cube',
        width: (width - frameEdge) / 2,
        height: height - frameEdge,
        depth: 2,
        position: [x + (width - frameEdge) / 4, y + height / 2, z],
        color: color,
        rotation: rotation,
        rotationAnchor: 'right',
        wrapMode: 'six-each',
        style: {
            'm.type': 'phong',
            'm.transparent': transparent,
            'm.texture.image': rightImage,
            'm.specularStrength': 100,
            'm.envmap.image': envmap,
            'm.specularmap.image': getIdcImagePath('white.png'),
        },
        client: {
            'animation': animateRight,
            'type': 'door',
            'bid': client.bid + '-right',
            'doorId': client.bid,
        },
    });
    if (acs) {
        parts.push({
            type: 'cube',
            width: 11.6,
            height: 11.6,
            depth: 2,
            rotation: rotation,
            rotationAnchor: 'left',
            position: [x + width / 2 + 8, (height - frameEdge / 2 - frameBottomEdge - 2) / 2, z + 10],
            style: {
                'm.color': '#ffffff',
                'm.ambient': '#ffffff',
                'm.specular': '#FFFFFF',
                'm.type': 'phong',
                'm.texture.image': getIdcImagePath('rack_inside.png'),
                'front.m.texture.image': getIdcImagePath('acs.jpg'),
            }
        });
    }
    if (json.inbuilt) {
        return parts;
    }
    var door = make.Default.createCombo(parts);
    make.Default.setObject3dCSProps(door, json);
    return door;
}, {
        category: "房间模型",
        type: "door",
        name: "双开门",
        icon: getIdcIconPath('door.png'),
        description: "门一般不单独使用，是加在内墙或外墙模型上，作为这类模型的孩子对象",
        sdkCategory: 'floor-child',
        modelDefaultParameters: getDoorParameters(),
    });

var getDoor5Parameters = function () {
    var result = getBasicParameters(130, 190, 3);
    var params = {
        'color': {
            name: '颜色',
            value: '#9E9E9E',
            type: make.Default.PARAMETER_TYPE_COLOR,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        }
    }
    make.Default.copyProperties(params, result);
    return result;
}

make.Default.register('twaver.idc.door5', function (json, callback) {
    var width = json.width;
    var rotationDirection = json.rotationDirection || 'front';

    var animationLeft = 'rotation:left:-120:1000:0:bounceOut';
    var animationRight = 'rotation:left:120:1000:0:bounceOut';
    if (rotationDirection == 'back') {
        animationLeft = 'rotation:left:120:1000:0:bounceOut';
        animationRight = 'rotation:left:-120:1000:0:bounceOut';

    }

    var leftDoor = make.Default.createCube({
        width: json.width / 2,
        height: json.height,
        depth: json.depth,
        wrapMode: 'six-each',
        style: {
            'm.type': 'phong',
            'm.color': '#999',
            'm.ambient': '#999',
            'm.envmap.image': make.Default.getEnvMap('envmap2'),
            'm.transparent': true,
            'm.texture.image': getIdcDoorImagePath('door5.png'),
            'm.texture.anisotropy': 16,
        },
        client: {
            'animation': animationLeft,
        }
    });
    leftDoor.setPositionX(-width / 4);

    rightDoor = leftDoor.clonePrefab();
    rightDoor.setRotationY(Math.PI);
    rightDoor.setClient('animation', animationRight);
    rightDoor.setPositionX(width / 4);
    var parent = new mono.Cube(1, 1, 1);
    parent.setStyle('m.visible', false);
    leftDoor.setParent(parent);
    rightDoor.setParent(parent);
    make.Default.setObject3dCommonProps(parent, json);
    if (callback) callback(parent);
    return parent;
}, {
        icon: getIdcIconPath("door5.png"),
        modelDefaultParameters: getDoor5Parameters()
    });

var singleDoors = [
    { id: 'twaver.idc.door2', width: 100, color: '#E0E0E0', transparent: false, image: 'door2.jpg', icon: 'door2.png' },
    { id: 'twaver.idc.door4', width: 100, color: '#FFFFFF', transparent: false, image: 'door4.jpg', icon: 'door4.png' }, {
        id: 'twaver.idc.door7',
        width: 100,
        height: 160,
        color: '#FFFFFF',
        transparent: false,
        image: 'door7.jpg',
        icon: 'door7.png'
    },
    { id: 'twaver.idc.door13', width: 100, color: '#FFFFFF', transparent: false, image: 'door13.png', icon: 'door13.png' },
    { id: 'twaver.idc.door16', width: 100, color: '#FFFFFF', transparent: false, image: 'door16.jpg', icon: 'door16.png' },
 { id: 'twaver.idc.door17', width: 100, color: '#FFFFFF', transparent: false, image: 'door17.jpg', icon: 'door16.png' }
];

var getSingleDoorParameters = function (params) {
    var result = getDoor1Parameters();
    if (params.width) result.width.value = params.width;
    if (params.height) result.height.value = params.height;
    if (params.color) result.color.value = params.color;
    if (params.transparent != null) result.transparent.value = params.transparent;
    if (params.image) result.image.value = params.image;
    return result;
}

for (var i = 0; i < singleDoors.length; i++) {
    var singleDoor = singleDoors[i];
    make.Default.copy(singleDoor.id, 'twaver.idc.door1', {}, {
        icon: getIdcIconPath(singleDoor.icon),
        modelDefaultParameters: getSingleDoorParameters(singleDoor)
    });
}

var doubleDoors = [{
    id: 'twaver.idc.door3',
    color: '#FFFFFF',
    transparent: false,
    leftImage: 'door3-l.jpg',
    rightImage: 'door3-r.jpg',
    icon: 'door2.png'
}, {
    id: 'twaver.idc.door6',
    width: 140,
    height: 160,
    color: '#FFFFFF',
    transparent: false,
    leftImage: 'door6-l.jpg',
    rightImage: 'door6-r.jpg',
    icon: 'door6.png'
}, {
    id: 'twaver.idc.door8',
    width: 175,
    transparent: false,
    height: 200,
    color: '#FFFFFF',
    leftImage: 'door8-l.jpg',
    rightImage: 'door8-r.jpg',
    icon: 'door8.png'
}, {
    id: 'twaver.idc.door9',
    width: 175,
    height: 200,
    color: '#FFFFFF',
    leftImage: 'door9-l.png',
    rightImage: 'door9-r.png',
    icon: 'door9.png'
}, {
    id: 'twaver.idc.door10',
    width: 140,
    transparent: false,
    height: 160,
    color: '#FFFFFF',
    leftImage: 'door10-l.jpg',
    rightImage: 'door10-r.jpg',
    icon: 'door10.png'
}, {
    id: 'twaver.idc.door11',
    color: '#FFFFFF',
    leftImage: 'door11-l.png',
    rightImage: 'door11-r.png',
    icon: 'door11.png'
}, {
    id: 'twaver.idc.door12',
    color: '#FFFFFF',
    leftImage: 'door12-l.png',
    rightImage: 'door12-r.png',
    icon: 'door12.png'
}, {
    id: 'twaver.idc.door14',
    color: '#FFFFFF',
    doorFrameColor: "#333640",
    leftImage: 'door14-l.png',
    rightImage: 'door14-r.png',
    icon: 'door14.png'
}, {
    id: 'twaver.idc.door15',
    transparent: false,
    color: '#FFFFFF',
    doorFrameColor: "#333640",
    leftImage: 'door15-l.jpg',
    rightImage: 'door15-r.jpg',
    icon: 'door15.png'
}];


var getDoubleDoorDoorParameters = function (params) {
    var result = getDoorParameters();
    if (params.width) result.width.value = params.width;
    if (params.height) result.height.value = params.height;
    if (params.color) result.color.value = params.color;
    if (params.transparent != null) result.transparent.value = params.transparent;
    if (params.leftImage) result.leftImage.value = params.leftImage;
    if (params.rightImage) result.rightImage.value = params.rightImage;
    if (params.doorFrameColor) result.doorFrameColor.value = params.doorFrameColor;
    return result;
}

for (var i = 0; i < doubleDoors.length; i++) {
    var doubleDoor = doubleDoors[i];
    make.Default.copy(doubleDoor.id, 'twaver.idc.door', {}, {
        icon: getIdcIconPath(doubleDoor.icon),
        modelDefaultParameters: getDoubleDoorDoorParameters(doubleDoor)
    });
}

/***************门模型***************/


/***************窗户模型***************/
var getWindowParameters = function (params) {
    var result = getBasicParameters(params.width || 120, params.height || 150, params.depth || 50);
    var params = {
        image: {
            name: '贴图',
            value: params.image,
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        transparent: {
            name: '是否透明',
            value: params.transparent || true,
            type: make.Default.PARAMETER_TYPE_BOOLEAN,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        glassDepth: {
            name: "玻璃厚度",
            value: params.glassDepth || 4,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        height: {
            name: "墙高度",
            value: params.height || 4,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        frameColor: {
            name: "边框颜色",
            value: params.frameColor || '#E0E0E0',
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        }
    }
    make.Default.copyProperties(params, result);
    return result;
}

make.Default.register('twaver.idc.window', function (json) {
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];
    var width = json.width,
        height = json.height,
        depth = json.depth;
    var client = json.client;
    var glassDepth = json.glassDepth;
    var platformHeight = 5,
        platformDepth = 45,
        platformOffsetZ = 10;
    var image = getIdcWindowImagePath(json.image);
    var transparent = json.transparent;
    var frameColor = json.frameColor;

    var platform = json.platform;

    var cutoff = {
        // window cut off
        type: 'cube',
        width: width,
        height: height,
        depth: depth,
        rotation: rotation,
        position: [x, y + 30 + height / 2, z],
        op: '-',
        color: frameColor
    };

    var glass = {
        //window glass
        type: 'cube',
        width: width - 0.5,
        height: height - 0.5,
        depth: glassDepth,
        rotation: rotation,
        position: [x, y + 30 + height / 2, z],
        op: '+',
        style: {
            'm.color': '#F0F0F0',
            'm.ambient': '#F0F0F0',
            'm.type': 'phong',
            'm.specularStrength': 0.1,
            'm.envmap.image': make.Default.getEnvMap('envmap1'),
            'm.texture.repeat': new mono.Vec2(1, 1),
            'm.texture.image': image,
        },
        client: {
            type: 'window'
        }
    };
    if (json.transparent != false) {
        glass.style['front.m.transparent'] = true;
        glass.style['back.m.transparent'] = true;
    }

    var parts = [cutoff, glass];

    if (platform) {
        parts.push({
            //window bottom platform.
            type: 'cube',
            width: width,
            height: platformHeight,
            depth: platformDepth,
            position: [x, y, z + platformOffsetZ],
            rotation: rotation,
            op: '+',
            sideColor: '#A5BDDD',
            topColor: '#D6E4EC',
        });
    }
    if (json.inbuilt) {
        return parts;
    }
    return make.Default.createCombo(parts);
}, {
        category: "房间模型",
        type: "window",
        name: "窗户",
        icon: getIdcIconPath('window.png'),
        description: "窗户一般不单独使用，是加在内墙或外墙模型上，作为这类模型的孩子对象",
        sdkCategory: 'floor-child',
        modelDefaultParameters: getWindowParameters({ image: 'window.png' }),
    });

var windows = [{
    id: 'twaver.idc.window2',
    frameColor: '#EFEFEF',
    image: 'window2.png',
    icon: 'window2.png'
},
{
    id: 'twaver.idc.window3',
    image: 'window3.png',
    icon: 'window3.png'
}
];

for (var i = 0; i < windows.length; i++) {
    var windowObj = windows[i];
    make.Default.copy(windowObj.id, 'twaver.idc.window', {}, {
        icon: getIdcIconPath(windowObj.icon),
        modelDefaultParameters: getWindowParameters(windowObj)
    });
}

/***************窗户模型***************/

/****************柱子模型******************/
//柱子
var getColumnParameters = function () {
    var result = getBasicParameters(60, 260, 60);
    result.color = {
        value: '#E8E8E8',
        name: "颜色",
        type: make.Default.PARAMETER_TYPE_COLOR,
        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
    }
    result.topColor = {
        value: '#F7F7F7',
        name: "顶部颜色",
        type: make.Default.PARAMETER_TYPE_COLOR,
        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
    }
    result.image = {
        value: '',
        name: "贴图",
        type: make.Default.PARAMETER_TYPE_IMAGE,
        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
    }
    result.column_lightmap1 = {
        value: 'column_lightmap1.jpg',
        name: '柱子前后贴图',
        type: make.Default.PARAMETER_TYPE_IMAGE,
        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
    }
    result.column_lightmap2 = {
        value: 'column_lightmap2.jpg',
        name: '柱子左右贴图',
        type: make.Default.PARAMETER_TYPE_IMAGE,
        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
    }
    return result;
}

make.Default.register('twaver.idc.column', function (json, callback) {
    var width = json.width;
    var height = json.height;
    var depth = json.depth;
    var color = json.color;
    var image = getIdcImagePath(json.image);
    var column_lightmap1 = json.column_lightmap1 ? make.Default.getImagePath(json.column_lightmap1) : null;
    var column_lightmap2 = json.column_lightmap2 ? make.Default.getImagePath(json.column_lightmap2) : null;
    var column;
    column = new mono.Cube(width, height, depth);
    column.s({
        // 'm.type': 'phong',
        'm.type': 'basic',  //不需要光照效果，加上了光照，柱子顶部的颜色和墙体不一样
        'm.color': color,

        'm.lightmap.image': make.Default.getImagePath('inside_lightmap1.png'),
        'top.m.lightmap.image': getIdcImagePath('white.png'),
        'top.m.color': json.topColor,
        'm.texture.anisotropy': 16,
        'front.m.lightmap.image': column_lightmap1,
        'back.m.lightmap.image': column_lightmap1,
        'left.m.lightmap.image': column_lightmap2,
        'right.m.lightmap.image': column_lightmap2,
    });
    column.c({
        'type': 'column'
    });
    if (json.image) {
        column.setStyle('left.m.texture.image', image);
        column.setStyle('right.m.texture.image', image);
        column.setStyle('front.m.texture.image', image);
        column.setStyle('back.m.texture.image', image);
    }
    column.setClient('showShadow', true);
    column.setClient('shadowWeight', 1);
    make.Default.setObject3dCommonProps(column, json);
    if (callback) callback(column);
    return column;
}, {
        category: "房间模型",
        type: "column",
        name: "柱子",
        icon: getIdcIconPath('column.png'),
        sdkCategory: 'floor-child',
        description: "柱子一般是加在房间外墙上，有些机房会在通道内也会有柱子对象",

        modelDefaultParameters: getColumnParameters(),
    });

var getCommColumnParameters = function (params) {
    var result = getColumnParameters();
    if (params.height) result.height.value = params.height;
    if (params.color) result.color.value = params.color;
    if (params.topColor) result.topColor.value = params.topColor;
    if (params.image) result.image.value = params.image;
    if (params.column_lightmap1) result.column_lightmap1.value = params.column_lightmap1;
    if (params.column_lightmap2) result.column_lightmap2.value = params.column_lightmap2;
    return result;
}

var columns = [
    { id: 'column1', height: 310 },
    { id: 'column2', height: 310, color: '#777', topColor: '#aaa' },
    { id: 'column3', height: 310, color: '#ffffff', topColor: '#b3b3b3', image: 'column3.jpg' },
    { id: 'column4', height: 260, color: '#ffffff', topColor: '#b3b3b3', image: 'column4.jpg' },
    { id: 'column5', height: 260, topColor: '#b3b3b3' },
    { id: 'column6', height: 260, color: '#e1e1e1', topColor: '#777777', image: 'column6.jpg' },
    { id: 'column7', height: 350 },
    { id: 'column8', topColor: "#D6E4EC", color: "#B8CAD5" },
    { id: 'column9', height: 310, color: '#c3ccd8' },
    { id: 'column10', height: 310, topColor: "#dbdee5", image: 'column10.jpg', column_lightmap1: 'column_lightmap4.jpg', column_lightmap2: 'column_lightmap3.jpg' },
    { id: 'column11', height: 310, topColor: "#dbdee5", image: 'column11.jpg', column_lightmap1: 'column_lightmap4.jpg', column_lightmap2: 'column_lightmap3.jpg' },
    { id: 'column12', height: 310, topColor: "#dbdee5", image: 'column12.jpg', column_lightmap1: 'column_lightmap4.jpg', column_lightmap2: 'column_lightmap3.jpg' },
    { id: 'column13', height: 310, topColor: "#dbdee5", image: 'column13.jpg', column_lightmap1: 'column_lightmap4.jpg', column_lightmap2: 'column_lightmap3.jpg' },
];

for (var i = 0; i < columns.length; i++) {
    var column = columns[i];
    make.Default.copy('twaver.idc.' + column.id, 'twaver.idc.column', {}, {
        icon: getIdcIconPath(column.id + '.png'),
        modelDefaultParameters: getCommColumnParameters(column)
    });
}
/****************柱子模型******************/

//区域模型
var getAreaParameters = function () {
    return {
        height: {
            name: "高",
            value: 5,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        color: {
            name: '颜色',
            value: '#abc',
            type: make.Default.PARAMETER_TYPE_COLOR,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        label: {
            name: "标签",
            value: '',
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        labelColor: {
            name: "标签颜色",
            value: 'red',
            type: make.Default.PARAMETER_TYPE_COLOR,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        labelFont: {
            name: "标签字体",
            value: 'bold 360px 微软雅黑,sans-serif',
            type: make.Default.PARAMETER_TYPE_COLOR,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        "labelPositionX": {
            name: "标签位置X",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
        },
        "labelPositionZ": {
            name: "标签位置Z",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
        },
        data: {
            name: "坐标点",
            value: [],
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        opacity: {
            name: "透明度",
            value: 0.05,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        }
    }
}

/****************列头柜模型******************/
var getFrontHeaderRackPic = function (height) {
    var frontPic = getIdcImagePath('head_rack.png');
    if (height == 220) {
        frontPic = getIdcImagePath('head_rack1.jpg');
    }
    return frontPic;
}

var getHeaderRackParmeters = function () {
    var result = getBasicParameters(60, 200, 80);
    result.color = {
        name: '颜色',
        value: 'white',
        type: make.Default.PARAMETER_TYPE_COLOR,
        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
    };
    result.frontImage = {
        name: '前贴图',
        value: '',
        type: make.Default.PARAMETER_TYPE_IMAGE,
        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
    };
    result.backImage = {
        name: '后贴图',
        value: 'head_rack_side.png',
        type: make.Default.PARAMETER_TYPE_IMAGE,
        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
    };
    result.topImage = {
        name: '顶图片',
        value: 'head_rack_side.png',
        type: make.Default.PARAMETER_TYPE_IMAGE,
        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
    };
    result.sideImage = {
        name: '边贴图',
        value: 'head_rack_side.png',
        type: make.Default.PARAMETER_TYPE_IMAGE,
        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
    };

    return result;
}
//列头柜
make.Default.register('twaver.idc.headerRack', function (json, callback) {
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var width = json.width;
    var height = json.height;
    var depth = json.depth;
    var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];
    var color = json.color;
    var sideImage = getIdcImagePath(json.sideImage);
    var topImage = getIdcImagePath(json.topImage) || sideImage;
    var backImage = getIdcImagePath(json.backImage) || sideImage;
    var frontImage = json.frontImage;
    if (!frontImage) {
        frontImage = getFrontHeaderRackPic(height);
    }

    var rack;
    if (json.objectId) {
        rack = new mono.Cube({
            'id': json.objectId,
            'width': width,
            'height': height,
            'depth': depth
        });
    } else {
        rack = new mono.Cube(width, height, depth);
    }
    rack.s({
        'm.type': 'phong',
        'm.color': color,
        'm.ambient': color,
        'm.specular': '#FFFFFF',
        'm.specularStrength': 3,
        'm.lightmap.image': make.Default.getImagePath('outside_lightmap.jpg'),
        'm.specularmap.image': make.Default.getImagePath('outside_lightmap.jpg'),
        'm.texture.image': sideImage,
        'top.m.texture.image': topImage,
        'back.m.texture.image': backImage,
        'front.m.texture.image': frontImage,
        'front.m.envmap.image': make.Default.getEnvMap('envmap1'),
        'm.reflectRatio': 0.2,
    });
    rack.p(x, 0, z);
    rack.setRotation(rotation[0], rotation[1], rotation[2]);
    make.Default.setPositionY(rack, y);
    rack.setClient('type', 'header_rack');
    rack.setClient('showShadow', true);
    make.Default.setObject3dCSProps(rack, json);
    if (callback) callback(rack);
    return rack;
}, {
        name: "列头柜",
        description: "机房常见设备之一，列头柜支持修改长，宽，高，颜色参数。",
        icon: getIdcIconPath('headerRack.png'),
        category: '机柜模型',
        type: 'header_rack',
        sdkCategory: 'rack',
        modelDefaultParameters: getHeaderRackParmeters(),
    });

make.Default.copy('twaver.idc.headerRack1', 'twaver.idc.headerRack', function (json) {
    json.sideImage = getIdcImagePath("h1srack.jpg");
    json.topImage = getIdcImagePath("h1track.jpg");
    json.frontImage = getIdcImagePath("h1frack.jpg");
    json.backImage = getIdcImagePath("h1brack.jpg");
}, {
        icon: getIdcIconPath('headerRack1.png')
    });

make.Default.copy('twaver.idc.headerRack2', 'twaver.idc.headerRack', function (json, callback) {
    json.sideImage = getIdcImagePath("h2srack.jpg");
    json.topImage = getIdcImagePath("h2track.jpg");
    json.frontImage = getIdcImagePath("h2frack.jpg");
    json.backImage = getIdcImagePath("h2brack.jpg");
}, {
        icon: getIdcIconPath('headerRack2.png')
    });

make.Default.copy('twaver.idc.headerRack3', 'twaver.idc.headerRack', function (json, callback) {
    json.sideImage = getIdcImagePath("h3srack.jpg");
    json.topImage = getIdcImagePath("h3track.jpg");
    json.frontImage = getIdcImagePath("h3frack.jpg");
    json.backImage = getIdcImagePath("h3brack.jpg");
}, {
        icon: getIdcIconPath('headerRack3.png')
    });
/****************列头柜模型******************/

/****************机柜模型**********************/
var getBasicRackParmeters = function (height) {
    var height = height || '42U';
    return getBasicParameters(60, height, 80);
}
var getBasicGuiParmeters = function (height) {
    var height = height || '200';
    return getBasicParameters(260, height, 80);
}
var getRackParameters = function (height) {
    var properties = getBasicRackParmeters(height);
    var rackPro = {
        'cutWidth': {
            name: "内宽",
            value: 45.5,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'frontImage': {
            name: "正面图片",
            value: '',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'backImage': {
            name: "背面图片",
            value: 'rack_back.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'topImage': {
            name: "顶部图片",
            value: 'rack_top.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },

        'backDoorFrontImage': {
            name: "后面前图片",
            value: '',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'sideImage': {
            name: "侧面图片",
            value: 'rack_side.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'fontDoorImage': {
            name: "门正面图片",
            value: 'rack_door_front.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'backDoorImage': {
            name: "门反面图片",
            value: 'rack_door_back.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'insideTopImage': {
            name: "内部顶贴图",
            value: 'inside_top.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'insideSideImage': {
            name: "内部侧贴图",
            value: 'inside_side.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'insideBackImage': {
            name: "内部后贴图",
            value: 'inside_back.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'doorAngle': {
            name: "机柜开门角度",
            value: -135,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'doorTransparent': {
            name: "机柜是否透明",
            value: false,
            type: make.Default.PARAMETER_TYPE_BOOLEAN,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'evnmap': {
            name: '机柜环境贴图',
            value: 'envmap1',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,

        },
        'rotationFrontDoor': {
            name: '前门开门的方向',
            value: 'right',
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
        },
        'rotationBackDoor': {
            name: '后门开门的方向',
            value: 'right',
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
        },
        'reflectRatio': {
            name: '环境反射率',
            value: 1,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
        },
        'showFrontDoor': {
            name: '是否显示前门',
            value: true,
            type: make.Default.PARAMETER_TYPE_BOOLEAN,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
        },
        'showBackDoor': {
            name: '是否显示后门',
            value: true,
            type: make.Default.PARAMETER_TYPE_BOOLEAN,
        },
        'doubleFrontDoor': {
            name: '前门双开门',
            value: false,
            type: make.Default.PARAMETER_TYPE_BOOLEAN,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
        },
        'doubleBackDoor': {
            name: '后门双开门',
            value: false,
            type: make.Default.PARAMETER_TYPE_BOOLEAN,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
        },
        'frontDoorLeftImage': {
            name: '前门左边贴图',
            value: 'rack_door_front_l.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
        },
        'frontDoorRightImage': {
            name: '前门右边贴图',
            value: 'rack_door_front_r.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
        },
        'frontDoorBackImage': {
            name: '门背面贴图',
            value: 'rack_door_front_b.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
        },
        'backDoorLeftImage': {
            name: '后门左边贴图',
            value: 'rack_door_back_l.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
        },
        'backDoorRightImage': {
            name: '后门左边贴图',
            value: 'rack_door_back_r.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
        },
    }
    make.Default.copyProperties(rackPro, properties);
    return properties;
}


var getFrontPic = function (height, width) {
    var height = parseInt(height);
    //lyz
    var frontPicMap = {
        38: 'rack38u.png',
        40: 'rack40u.png',
        42: 'rack42u.png',
        43: 'rack43u.png',
        44: 'rack44u.png',
        45: 'rack45u.png',
        46: 'rack46u.png',
        47: 'rack47u.png',
        57: 'rack57u.png',
        20: 'rack20u.png',
        0: 'racku.jpg'
    }
    if (width < 100) {
        var frontPic = getIdcImagePath(frontPicMap[height] || frontPicMap[0]);
    } else {
        if (height == 42) {
            frontPic = getIdcImagePath('rack-120.png');
        } else if (height == 47) {
            frontPic = getIdcImagePath('rack47U-120.png');
        }
    }
    return frontPic;
}

/**************机框模型****************/
make.Default.register('twaver.idc.frame', function (json, callback) {
    json = json || {};
    // var position = json.position || [0, 0, 0];
    var position = [0, 0, 0];       //机框的父亲是机柜，不需要定位???
    var x = position[0],
        y = position[1],
        z = position[2];
    var width = json.width;
    var height = json.height;
    var offsetY = json.offsetY;
    var depth = json.depth;
    var frameCutWidth = json.frameCutWidth;
    //var backImage = getIdcImagePath(json.backImage);
    var sideImage = getIdcImagePath(json.sideImage);
    var topImage = getIdcImagePath(json.topImage);
    var backDoorFrontImage = getIdcImagePath(json.backDoorFrontImage || json.backImage);

    var frontPic = json.frontImage || getFrontPic(height, width);

    var frameHeight = make.Default.getRackHeight(height);
    var insideTopImage = getIdcImagePath(json.insideTopImage);
    var insideSideImage = getIdcImagePath(json.insideSideImage);
    var insideBackImage = getIdcImagePath(json.insideBackImage);

    //var doorFrontPic = getIdcImagePath(json.fontDoorImage);
    //var doorBackPic = getIdcImagePath(json.backDoorImage);
    var frontDoorBackImage = getIdcImagePath(json.frontDoorBackImage);

    var frame = new mono.Cube(width, frameHeight, depth - 4);
    frame.s({
        'm.color': '#666666',
        'm.ambient': '#ffffff',
        'm.specular': '#e5e5e5',
        'm.type': 'phong',
        'm.specularStrength': 3,
        'left.m.texture.image': sideImage,
        'right.m.texture.image': sideImage,
        'top.m.texture.image': topImage,
        'bottom.m.texture.image': topImage,
        // 'back.m.texture.image': backImage,
        'back.m.texture.image': frontPic,
        'front.m.texture.image': frontPic,
        'front.m.specularStrength': 2,
    });

    var cut = new mono.Cube(frameCutWidth, frameHeight, depth * 1.2);
    cut.s({
        'm.type': 'basic',
        'm.lightmap.image': make.Default.getImagePath('outside_lightmap.jpg'),
        'back.m.texture.image': insideBackImage,
        'left.m.texture.image': insideSideImage,
        'left.m.texture.flipX': true,
        'right.m.texture.image': insideSideImage,
        'top.m.texture.image': insideTopImage,
        'top.m.texture.flipY': true,
        'bottom.m.texture.image': insideTopImage,
    });
    cut.setPosition(0, 0, frame.getDepth() / 2 - cut.getDepth() / 2);
    var cut2 = new mono.Cube(width, offsetY, depth * 1.2);
    cut2.s({
        'm.type': 'basic',
        'm.lightmap.image': make.Default.getImagePath('outside_lightmap.jpg'),
        'back.m.texture.image': insideBackImage,
        'left.m.texture.image': insideSideImage,
        'left.m.texture.flipX': true,
        'right.m.texture.image': insideSideImage,
        'top.m.texture.image': insideTopImage,
        'top.m.texture.flipY': true,
        'bottom.m.texture.image': insideTopImage,
    });
    cut2.setPosition(0, frameHeight / 2, frame.getDepth() / 2 - cut.getDepth() / 2);
    var cut3 = new mono.Cube(width, offsetY, depth * 1.2);
    cut3.s({
        'm.type': 'basic',
        'm.lightmap.image': make.Default.getImagePath('outside_lightmap.jpg'),
        'back.m.texture.image': insideBackImage,
        'left.m.texture.image': insideSideImage,
        'left.m.texture.flipX': true,
        'right.m.texture.image': insideSideImage,
        'top.m.texture.image': insideTopImage,
        'top.m.texture.flipY': true,
        'bottom.m.texture.image': insideTopImage,
    });
    cut3.setPosition(0, -frameHeight / 2, frame.getDepth() / 2 - cut.getDepth() / 2);
    var newFrame;
    if (json.objectId) {
        newFrame = new mono.ComboNode({
            'id': json.objectId,
            'combos': [frame, cut, cut2, cut3],
            'operators': ['-', '-', '-']
        });
    } else {
        newFrame = new mono.ComboNode([frame, cut, cut2, cut3], ['-', '-', '-']);
    }
    newFrame.setPosition(x, 0, z);
    make.Default.setPositionY(newFrame, y);
    newFrame.setClient('type', 'frame');
    make.Default.setObject3dCSProps(newFrame, json);
    return newFrame;
}, {
        name: "机框",
        category: "机框模型",
        description: "机框是机柜的组成之一。 支持42U-47U高度，默认42U的高度。模型上还支持机框厚度，机框贴图的设置",
        icon: getIdcIconPath('rack.png'),
        type: 'frame',
        sdkCategory: 'frame',
        modelDefaultParameters: getRackParameters('42U'),
    });
/**************机框模型****************/


//一般机柜
make.Default.register('twaver.idc.rack', function (json, callback) {
    json = json || {};
    json.client = json.client || {};
    json.style = json.style || {};
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];
    var width = json.width;
    var height = json.height;
    var depth = json.depth;
    var frameCutWidth = json.frameCutWidth || 45.5; //机框内部宽度
    var offsetX = json.offsetX || 14.5; //机框左右的厚度之和
    var haveFrame = json.haveFrame || false; //是否有机框
    //var backImage = getIdcImagePath(json.backImage);
    var sideImage = getIdcImagePath(json.sideImage);
    var topImage = getIdcImagePath(json.topImage);
    var backDoorFrontImage = getIdcImagePath(json.backDoorFrontImage || json.backImage);

    var frontPic = json.frontImage || getFrontPic(height, width);
    var doorAngle = json.doorAngle;
    var rotationFrontDoor = json.rotationFrontDoor;
    var rotationBackDoor = json.rotationBackDoor;

    var frontAnimationLeft = doorAngle && 'rotation:left:{}:1000:0:bounceOut'.format(-doorAngle || '135');
    var frontAnimationRight = doorAngle && 'rotation:right:{}:1000:0:bounceOut'.format(doorAngle || '-135');

    var BackAnimationLeft = doorAngle && 'rotation:right:{}:1000:0:bounceOut'.format(-doorAngle || '135');
    var BackAnimationRight = doorAngle && 'rotation:left:{}:1000:0:bounceOut'.format(doorAngle || '135');

    var rackHeight = make.Default.getRackHeight(height);
    var evnmap = make.Default.getEnvMap(json.evnmap);
    var reflectRatio = json.reflectRatio;
    var insideTopImage = getIdcImagePath(json.insideTopImage);
    var insideSideImage = getIdcImagePath(json.insideSideImage);
    var insideBackImage = getIdcImagePath(json.insideBackImage);

    //var doorFrontPic = getIdcImagePath(json.fontDoorImage);
    //var doorBackPic = getIdcImagePath(json.backDoorImage);
    var frontDoorBackImage = getIdcImagePath(json.frontDoorBackImage);
    var doorTransparent = json.doorTransparent || false;
    var doorColor = json.doorColor || 'white';
    var doorDepth = 2;
    var offset, cutWidth;
    if (haveFrame) {
        offset = make.Default.RACK_OFFSET_Y;
        cutWidth = frameCutWidth + offsetX + 4;
    } else {
        offset = make.Default.RACK_OFFSET_Y;
        cutWidth = json.cutWidth;
    }

    var rack = new mono.Cube(width, rackHeight, depth - doorDepth * 2);
    rack.s({
        'm.color': '#666666',
        'm.ambient': '#ffffff',
        'm.specular': '#e5e5e5',
        'm.type': 'phong',
        'm.specularStrength': 3,
        'left.m.texture.image': sideImage,
        'right.m.texture.image': sideImage,
        'top.m.texture.image': topImage,
        'bottom.m.texture.image': topImage,
        // 'back.m.texture.image': backImage,
        'back.m.texture.image': frontPic,
        'front.m.texture.image': frontPic,
        'front.m.specularStrength': 2,
    });
    var cut = new mono.Cube(cutWidth, rackHeight - offset * 2 + 1, depth * 1.2);
    cut.s({
        'm.type': 'basic',
        'm.lightmap.image': make.Default.getImagePath('outside_lightmap.jpg'),
        'back.m.texture.image': insideBackImage,
        'left.m.texture.image': insideSideImage,
        'left.m.texture.flipX': true,
        'right.m.texture.image': insideSideImage,
        'top.m.texture.image': insideTopImage,
        'top.m.texture.flipY': true,
        'bottom.m.texture.image': insideTopImage,
    });
    if (haveFrame) {
        rack.s({
            'back.m.texture.image': getIdcImagePath('rackFrame.jpg'),
            'front.m.texture.image': getIdcImagePath('rackFrame.jpg'),
        });
        cut.s({
            'left.m.texture.image': getIdcImagePath('insideBack.jpg'),
            'right.m.texture.image': getIdcImagePath('insideBack.jpg'),
        })
    }
    cut.setPosition(0, 0, rack.getDepth() / 2 - cut.getDepth() / 2);

    var newRack;
    if (json.objectId) {
        newRack = new mono.ComboNode({
            'id': json.objectId,
            'combos': [rack, cut],
            'operators': ['-']
        });
    } else {
        newRack = new mono.ComboNode([rack, cut], ['-']);
    }
    for (var p in json.client) {
        newRack.setClient(p, json.client[p]);
    }


    //判定frontDoor单双开
    if (json.doubleFrontDoor) {
        var frontDoorLeftImage = getIdcImagePath(json.frontDoorLeftImage);
        var frontDoorRightImage = getIdcImagePath(json.frontDoorRightImage);
        var rackLeftDoor = new mono.Cube(width / 2, rackHeight, doorDepth);
        rackLeftDoor.s({
            'm.type': 'phong',
            'm.transparent': doorTransparent,
            'front.m.texture.image': frontDoorLeftImage,
            'back.m.texture.image': frontDoorBackImage,
            'm.envmap.image': evnmap,
            'm.reflectRatio': reflectRatio,
            'm.color': doorColor,
            'm.ambient': doorColor,
            'front.m.color': 'white',
            'back.m.color': 'white',
            'front.m.ambient': 'white',
            'back.m.ambient': 'white',
        });
        rackLeftDoor.setParent(newRack);
        rackLeftDoor.setClient('animation', frontAnimationLeft);
        rackLeftDoor.setClient('type', 'rack_door');
        rackLeftDoor.setClient('inbuilt', true);
        rackLeftDoor.setPosition(-width / 4, 0, depth / 2 - doorDepth / 2);
        newRack.rackLeftDoor = rackLeftDoor;

        var rackRightDoor = new mono.Cube(width / 2, rackHeight, doorDepth);
        rackRightDoor.s({
            'm.type': 'phong',
            'm.transparent': doorTransparent,
            'front.m.texture.image': frontDoorRightImage,
            'back.m.texture.image': frontDoorBackImage,
            'm.envmap.image': evnmap,
            'm.reflectRatio': reflectRatio,
            'm.color': doorColor,
            'm.ambient': doorColor,
            'front.m.color': 'white',
            'back.m.color': 'white',
            'front.m.ambient': 'white',
            'back.m.ambient': 'white',
        });
        rackRightDoor.setParent(newRack);
        rackRightDoor.setClient('animation', frontAnimationRight);
        rackRightDoor.setClient('type', 'rack_door');
        rackRightDoor.setClient('inbuilt', true);
        rackRightDoor.setPosition(-width / 4 + width / 2, 0, depth / 2 - doorDepth / 2);
        newRack.rackRightDoor = rackRightDoor;
    } else {
        var doorFrontPic = getIdcImagePath(json.fontDoorImage);
        var doorBackPic = getIdcImagePath(json.backDoorImage);
        var rackDoor = new mono.Cube(width, rackHeight, doorDepth);
        rackDoor.s({
            'm.type': 'phong',
            'm.transparent': doorTransparent,
            'front.m.texture.image': doorFrontPic,
            'back.m.texture.image': doorBackPic,
            'm.envmap.image': evnmap,
            'm.reflectRatio': reflectRatio,
            'm.color': doorColor,
            'm.ambient': doorColor,
            'front.m.color': 'white',
            'back.m.color': 'white',
            'front.m.ambient': 'white',
            'back.m.ambient': 'white',
        });
        rackDoor.setParent(newRack);
        if (rotationFrontDoor == 'left') {
            rackDoor.setClient('animation', frontAnimationLeft);
        } else {
            rackDoor.setClient('animation', frontAnimationRight);
        }
        rackDoor.setClient('type', 'rack_door');
        rackDoor.setClient('inbuilt', true);
        rackDoor.setPosition(0, 0, depth / 2 - doorDepth / 2);
        newRack.rackDoor = rackDoor;
    };


    //判定backDoor单双开
    if (json.doubleBackDoor) {
        var backDoorLeftImage = getIdcImagePath(json.backDoorLeftImage);
        var backDoorRightImage = getIdcImagePath(json.backDoorRightImage);
        var backLeftDoor = new mono.Cube(width / 2, rackHeight, doorDepth);
        backLeftDoor.s({
            'm.type': 'phong',
            'm.transparent': doorTransparent,
            'front.m.texture.image': frontDoorBackImage,
            'back.m.texture.image': backDoorLeftImage,
            'm.envmap.image': evnmap,
            'm.reflectRatio': reflectRatio,
            'm.color': doorColor,
            'm.ambient': doorColor,
            'front.m.color': 'white',
            'back.m.color': 'white',
            'front.m.ambient': 'white',
            'back.m.ambient': 'white',
        });
        backLeftDoor.setParent(newRack);
        backLeftDoor.setClient('animation', BackAnimationRight);
        backLeftDoor.setClient('type', 'rack_door');
        backLeftDoor.setClient('inbuilt', true);
        backLeftDoor.setPosition(-width / 4, 0, -depth / 2 + doorDepth / 2);
        newRack.backLeftDoor = backLeftDoor;

        var backRightDoor = new mono.Cube(width / 2, rackHeight, doorDepth);
        backRightDoor.s({
            'm.type': 'phong',
            'm.transparent': doorTransparent,
            'front.m.texture.image': frontDoorBackImage,
            'back.m.texture.image': backDoorRightImage,
            'm.envmap.image': evnmap,
            'm.reflectRatio': reflectRatio,
            'm.color': doorColor,
            'm.ambient': doorColor,
            'front.m.color': 'white',
            'back.m.color': 'white',
            'front.m.ambient': 'white',
            'back.m.ambient': 'white',
        });
        backRightDoor.setParent(newRack);
        backRightDoor.setClient('animation', BackAnimationLeft);
        backRightDoor.setClient('type', 'rack_door');
        backRightDoor.setClient('inbuilt', true);
        backRightDoor.setPosition(width / 4, 0, -depth / 2 + doorDepth / 2);
        newRack.backRightDoor = backRightDoor;
    } else {
        var backImage = getIdcImagePath(json.backImage);
        var backDoor = new mono.Cube(width, rackHeight, doorDepth);
        var doorBackPic = getIdcImagePath(json.backDoorImage);
        backDoor.s({
            'm.type': 'phong',
            'm.transparent': doorTransparent,
            'front.m.texture.image': backDoorFrontImage,
            'back.m.texture.image': backImage,
            'm.envmap.image': evnmap,
            'm.reflectRatio': reflectRatio,
            'm.color': doorColor,
            'm.ambient': doorColor,
            'front.m.color': 'white',
            'back.m.color': 'white',
            'front.m.ambient': 'white',
            'back.m.ambient': 'white',
        });

        backDoor.setParent(newRack);
        if (rotationBackDoor == 'left') {
            backDoor.setClient('animation', BackAnimationLeft);
        } else {
            backDoor.setClient('animation', BackAnimationRight);
        }
        backDoor.setClient('type', 'rack_door');
        backDoor.setClient('inbuilt', true);
        backDoor.setPosition(0, 0, -depth / 2 + doorDepth / 2);
        newRack.backDoor = backDoor;
    }

    if (haveFrame) {
        var frameJson = {
            id: 'twaver.idc.frame',
            width: cutWidth - 4,
            depth: depth - doorDepth * 2,
            frameCutWidth: frameCutWidth,
            offsetX: offsetX,
            offsetY: offset //机框上下厚度
        }
        // make.Default.copyProperties(json, frameJson);
        make.Default.copyProperties(json, frameJson, ['objectId']);                   //过滤掉objectId,避免和机框id重复导致3d场景报错      --by  vonnie
        var frame = make.Default.load(frameJson);
        frame.setParent(newRack);
    }

    newRack.setPosition(x, 0, z);
    make.Default.setPositionY(newRack, y);
    newRack.setClient('type', 'rack');
    newRack.setClient('showShadow', true);
    newRack.setRotation(rotation[0], rotation[1], rotation[2]);
    make.Default.setObject3dCSProps(newRack, json);
    if (callback) callback(newRack);
    return newRack;
}, {
        name: "机柜",
        category: "机柜模型",
        description: "机房最常见的模型。机柜是由机柜的主体和机柜门组成的，机柜门支持动画打开，关闭。 支持42U-47U高度，默认42U的高度。模型上还支持常见的长，宽，机柜贴图的设置",
        icon: getIdcIconPath('rack.png'),
        type: 'rack',
        sdkCategory: 'rack',
        modelDefaultParameters: getRackParameters('42U'),
    });

var registerRack3d = function (size) {
    make.Default.register('twaver.idc.rack' + size, function (json, callback) {
        var rack42Json = {
            id: 'twaver.idc.rack',
            height: size + 'U',
        }
        make.Default.copyProperties(json, rack42Json);
        return make.Default.load(rack42Json, callback);
    }, {
            childrenSize: size,
            name: size + "U机柜",
            description: size + "U机柜, 机房最常见的模型。机柜是由机柜的主体和机柜门组成的，机柜门支持动画打开，关闭",
            icon: getIdcIconPath('rack.png'),
            category: '机柜模型',
            type: 'mono.Element',
            sdkCategory: 'rack',
            modelDefaultParameters: getRackParameters(size + 'U'),
        });
}

for (var i = 42; i <= 57; i++) {
    registerRack3d(i);
}

//机柜1，玻璃效果
make.Default.register('twaver.idc.rack1', function (json, callback) {
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var width = json.width;
    var height = json.height;
    var depth = json.depth;
    var rackHeight = make.Default.getRackHeight(height);
    var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];

    var pic = getIdcImagePath('white.png');
    var offset = make.Default.RACK_OFFSET_Y * 2;
    var frontPic = getFrontPic(height, width);

    var rack = new mono.Cube(width, rackHeight, depth);
    rack.s({
        'm.type': 'phong',
        'm.color': '#557E7A',
        'm.ambient': '#557E7A',
        'm.specularStrength': 50,
        'm.lightmap.image': make.Default.getImagePath('outside_lightmap.jpg'),
        'm.normalmap.image': make.Default.getImagePath('metal_normalmap.jpg'),
        'm.specularmap.image': make.Default.getImagePath('outside_lightmap.jpg'),
        'm.envmap.image': make.Default.getEnvMap('envmap1'),
        'front.m.normalmap.image': make.Default.getImagePath('outside_lightmap.jpg'),
        'front.m.texture.image': frontPic,
        'front.m.texture.repeat': new mono.Vec2(1, 1),
        'front.m.specularmap.image': getIdcImagePath('white.png'),
        'front.m.specularStrength': 200,
        'front.m.envmap.image': [pic, pic, pic, pic, pic, pic],
    });
    var cut = new mono.Cube(45.5, rackHeight - offset, depth * 0.7);
    cut.s({
        'm.type': 'basic',
        'm.color': '#888888',
        'm.ambient': '#888888',
        'm.lightmap.image': make.Default.getImagePath('inside_lightmap.jpg'),
        'left.m.texture.image': getIdcImagePath('rack_panel.png'),
        'right.m.texture.image': getIdcImagePath('rack_panel.png'),
        'back.m.texture.image': getIdcImagePath('rack_panel.png'),
    });
    cut.setPosition(0, 0, rack.getDepth() / 2 - cut.getDepth() / 2 + 2);

    var newRack;
    if (json.objectId) {
        newRack = new mono.ComboNode({
            'id': json.objectId,
            'combos': [rack, cut],
            'operators': ['-']
        });
    } else {
        newRack = new mono.ComboNode([rack, cut], ['-']);
    }

    //create rack door
    var rackDoor = new mono.Cube(width, rackHeight, 2);
    rackDoor.s({
        'm.type': 'phong',
        'm.color': '#A5F1B5',
        'm.ambient': '#A4F4EC',
        'front.m.texture.image': getIdcImagePath('rack_front_door.jpg'),
        'back.m.texture.image': getIdcImagePath('rack_door_back.png'),
        'm.envmap.image': make.Default.getEnvMap('envmap1'),
    });
    rackDoor.setParent(newRack);
    rackDoor.setPosition(0, 0, depth / 2 + 1);
    rackDoor.setClient('type', 'rack_door');
    rackDoor.setClient('animation', 'rotation:right:-150:1000:0:bounceOut');
    rackDoor.setClient('inbuilt', true);

    newRack.p(x, 0, z);
    newRack.setRotation(rotation[0], rotation[1], rotation[2]);
    make.Default.setPositionY(newRack, y);
    newRack.setClient('type', 'rack');
    make.Default.setObject3dCSProps(newRack, json);
    if (callback) callback(newRack);
    return newRack;
}, {
        name: "机柜1",
        description: '机房最常见的模型。和"twaver.idc.rack"区别在于这种类型的机柜加了环境贴图，是另外一种风格的机柜样式',
        icon: getIdcIconPath('rack1.png'),
        category: '机柜模型',
        type: 'rack',
        sdkCategory: 'rack',
        modelDefaultParameters: getBasicRackParmeters('47U'),
    });

var getSimpleRackParameters = function () {
    var result = getBasicRackParmeters();
    var rackPro = {
        'image': {
            name: "贴图",
            value: 'rack_wrap.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        }
    }
    make.Default.copyProperties(rackPro, result);
    return result;
}


//简单机柜，用于和真实机柜之间的切换，便于提高性能
make.Default.register('twaver.idc.simpleRack', function (json, callback) {
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var width = json.width;
    var height = json.height;
    var depth = json.depth;
    height = make.Default.getRackHeight(height);
    var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];
    var pic = getIdcImagePath(json.image);

    var rack;
    if (json.objectId) {
        rack = new mono.Cube({
            'id': json.objectId,
            'width': width,
            'height': height,
            'depth': depth
        });
    } else {
        rack = new mono.Cube(width, height, depth);
    }
    rack.s({
        // 'm.type': 'phong',
        // 'm.color': '#666666',
        // 'm.ambient': '#ffffff',
        // 'm.specular': '#e5e5e5',
        // 'm.specularStrength': 2,
        'm.texture.image': pic,
        'm.texture.anisotropy': 16,
    });
    rack.setWrapMode('six-each');
    rack.p(x, 0, z);
    rack.setRotation(rotation[0], rotation[1], rotation[2]);
    make.Default.setPositionY(rack, y);
    rack.setClient('type', 'rack');
    rack.setClient('showShadow', true);
    make.Default.setObject3dCSProps(rack, json);
    if (callback) callback(rack);
    return rack;
}, {
        name: "简单机柜",
        description: "机柜的简单实现，一个cube加一个贴图，外观和twaver.idc.rack一样，但没有门和内部结构，可用于不关注内部细节时显示",
        icon: getIdcIconPath('racks.png'),
        category: '机柜模型',
        type: 'rack',
        sdkCategory: 'rack',
        modelDefaultParameters: getSimpleRackParameters(),
    });

make.Default.copy('twaver.idc.rack2', 'twaver.idc.rack', function (json, callback) {
    var frontPic = {
        42: 'r1frack42.png',
        43: 'r1frack43.png',
        44: 'r1frack44.png',
        45: 'r1frack45.png',
        46: 'r1frack46.png',
        47: 'r1frack47.png',
        57: 'rack57u.png',
        20: '20u.png',
        0: 'r1fracku.jpg',
    }

    //  支持U位从上至下的顺序 2018.2.27 add by lyz 
    var array = json.type&&json.type.split('twaver.idc.rack2-');
    if(array&&array.length == 2){
        if(json.uOrder == "upToDown"){
            frontPic[array[1]] = 'rack' + array[1] + '_u2d.png';
        }
    }

    json.backImage = getIdcImagePath("r1brack.jpg");
    json.sideImage = getIdcImagePath("r1srack.jpg");
    json.topImage = getIdcImagePath("r1track.jpg");
    //根据高度,切换到不同的正面贴图
    var fontImage = frontPic[json.height && parseInt(json.height)] || frontPic[0];
    json.frontImage = getIdcImagePath(fontImage);
    json.fontDoorImage = getIdcImagePath("r1frack.jpg");
    json.backDoorImage = getIdcImagePath("r1brack.jpg");
}, {
        icon: getIdcIconPath('simpleRack2.png'),
    });

make.Default.copy('twaver.idc.simpleRack2', 'twaver.idc.simpleRack', function (json, callback) {
    json.image = getIdcImagePath('srack.jpg');
}, {
        icon: getIdcIconPath('simpleRack2.png'),
    });

for (var size = 42; size <= 57; size++) {
    make.Default.copy('twaver.idc.rack2-' + size, 'twaver.idc.rack2', {
        height: size
    });
    make.Default.copy('twaver.idc.simpleRack2-' + size, 'twaver.idc.simpleRack2', {
        height: size
    });
}

var getRack4Parameters = function (height) {
    var result = getRackParameters();
    result.backImage.value = 'r1brack.jpg';
    result.sideImage.value = 'r1srack.jpg';
    result.topImage.value = 'r1track.jpg';
    result.fontDoorImage.value = 'srack04-door.jpg';
    result.backDoorImage.value = 'r1brack.jpg';
    return result;
}
make.Default.register('twaver.idc.rack4', function (json, callback) {
    json = json || {};
    json.client = json.client || {};
    json.style = json.style || {};
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];
    var width = json.width;
    var height = json.height;
    var depth = json.depth;
    var cutWidth = json.cutWidth;
    var backImage = getIdcImagePath(json.backImage);
    var sideImage = getIdcImagePath(json.sideImage);
    var topImage = getIdcImagePath(json.topImage);
    var rackHeight = make.Default.getRackHeight(height);
    var doorAngle = json.doorAngle;
    var evnmap = make.Default.getEnvMap(json.evnmap);
    var reflectRatio = json.reflectRatio;
    var insideTopImage = getIdcImagePath(json.insideTopImage);
    var insideSideImage = getIdcImagePath(json.insideSideImage);
    var insideBackImage = getIdcImagePath(json.insideBackImage);

    var doorFrontPic = getIdcImagePath(json.fontDoorImage);
    var doorBackPic = getIdcImagePath(json.backDoorImage);
    var doorTransparent = json.doorTransparent || false;

    var offset = make.Default.RACK_OFFSET_Y * 2;

    var frontPic = {
        42: 'r1frack42.png',
        43: 'r1frack43.png',
        44: 'r1frack44.png',
        45: 'r1frack45.png',
        46: 'r1frack46.png',
        47: 'r1frack47.png'
    }
    var frontImage = frontPic[height && parseInt(height)] || frontPic[42];
    var frontPic = json.frontImage || getIdcImagePath(frontImage);

    var rack = new mono.Cube(width, rackHeight, depth);
    rack.s({
        'm.color': '#666666',
        'm.ambient': '#ffffff',
        'm.specular': '#e5e5e5',
        'm.type': 'phong',
        'm.specularStrength': 3,
        'left.m.texture.image': sideImage,
        'right.m.texture.image': sideImage,
        'top.m.texture.image': topImage,
        'bottom.m.texture.image': topImage,
        'back.m.texture.image': backImage,
        'front.m.texture.image': frontPic,
        'front.m.specularStrength': 2,
    });

    var cut = new mono.Cube(cutWidth, rackHeight - offset + 1, depth * 0.7);
    cut.s({
        'm.type': 'basic',
        'm.lightmap.image': make.Default.getImagePath('outside_lightmap.jpg'),
        'back.m.texture.image': insideBackImage,
        'left.m.texture.image': insideSideImage,
        'left.m.texture.flipX': true,
        'right.m.texture.image': insideSideImage,
        'top.m.texture.image': insideTopImage,
        'top.m.texture.flipY': true,
        'bottom.m.texture.image': insideTopImage,
    });
    cut.setPosition(0, 0, rack.getDepth() / 2 - cut.getDepth() / 2 + 2);

    var newRack;
    if (json.objectId) {
        newRack = new mono.ComboNode({
            'id': json.objectId,
            'combos': [rack, cut],
            'operators': ['-']
        });
    } else {
        newRack = new mono.ComboNode([rack, cut], ['-']);
    }
    for (var p in json.client) {
        newRack.setClient(p, json.client[p]);
    }
    var door1 = new mono.Cube(width, rackHeight, 2);
    door1.s({
        'm.color': '#4B545E',
        'm.ambient': '#4B545E',
        'front.m.color': '#57626E',
        'front.m.ambient': '#57626E',
        'back.m.texture.image': doorBackPic,
        // 'm.envmap.image': evnmap,
        // 'm.reflectRatio': reflectRatio,
    });
    var door2 = new mono.Cube(width * 0.8, rackHeight * 0.9, 3);
    door2.s({
        'm.type': 'phong',
        'm.color': '#666666',
        'm.ambient': '#ffffff',
        'm.specular': '#e5e5e5',
        'm.specularStrength': 2,
        'm.texture.image': doorFrontPic,
        // 'm.envmap.image': evnmap,
        // 'm.reflectRatio': reflectRatio,
    });
    door2.p(0, 0, 2.5);
    door2.setWrapMode('six-each');
    var rackDoor = new mono.ComboNode([door1, door2]);
    rackDoor.setParent(newRack);
    rackDoor.setClient('animation', 'rotation:right:{}:1000:0:bounceOut'.format(doorAngle || '-150'));
    rackDoor.setClient('type', 'rack_door');
    rackDoor.setClient('inbuilt', true);
    rackDoor.setPosition(0, 0, depth / 2 + 1);
    newRack.rackDoor = rackDoor;
    newRack.setPosition(x, 0, z);
    make.Default.setPositionY(newRack, y);
    newRack.setClient('type', 'rack');
    newRack.setClient('showShadow', true);
    newRack.setRotation(rotation[0], rotation[1], rotation[2]);
    make.Default.setObject3dCSProps(newRack, json);
    if (callback) callback(newRack);
    return newRack;
}, {
        name: "热管背板机柜",
        category: "机柜模型",
        description: "机房最常见的模型。机柜是由机柜的主体和机柜门组成的，机柜门支持动画打开，关闭。 支持42U-47U高度，默认42U的高度。模型上还支持常见的长，宽，机柜贴图的设置",
        icon: getIdcIconPath('rack.png'),
        type: 'rack',
        sdkCategory: 'rack',
        modelDefaultParameters: getRack4Parameters('42U'),
    });

make.Default.copy('twaver.idc.simpleRack4', 'twaver.idc.simpleRack', function (json, callback) {
    json.image = getIdcImagePath('srack04.jpg');
}, {
        icon: getIdcIconPath('simpleRack4.png'),
    });

for (var size = 42; size <= 47; size++) {
    make.Default.copy('twaver.idc.rack4-' + size, 'twaver.idc.rack4', {
        height: size
    });
    make.Default.copy('twaver.idc.simpleRack4-' + size, 'twaver.idc.simpleRack4', {
        height: size
    }, {
            icon: getIdcIconPath('simpleRack4.png'),
        });
}

make.Default.copy('twaver.idc.rack3', 'twaver.idc.rack', function (json, callback) {
    json.backImage = getIdcImagePath("back.jpg");
    json.sideImage = getIdcImagePath("side.jpg");
    json.topImage = getIdcImagePath("top.jpg");
    json.fontDoorImage = getIdcImagePath("front.jpg");
    json.backDoorImage = getIdcImagePath("dback.jpg");
    json.frontImage = getIdcImagePath("frack.png");
    json.reflectRatio = 0.5;
}, {
        icon: getIdcIconPath('rack3.png')
    });

/*var racks = {
    "IBM": { width: 60, height: 42, depth: 100, doorColor: '#797a7f', description: "" },
    "IBM2": { width: 64, height: 42, depth: 110, cutWidth: 48.5, doorColor: '#797a7f', description: "" },
    "IBM3": { width: 60, height: 34, depth: 100, doorColor: '#797a7f', description: "" },
    "IBM4": { width: 60, height: 42, depth: 80, doorColor: '#91989e', description: "" },
    "JINDI": { width: 60, height: 42, depth: 90, doorColor: '#797a7f', doorTransparent: true },
    "shuangdeng": { width: 60, height: 42, depth: 100, doorColor: '#6c6c6e', description: "双登牌机柜" },
    "EMERSON": { width: 60, height: 42, depth: 100, doorColor: '#6c6c6e', description: "", description: "UPS" },
    "taiping": { width: 60, height: 47, depth: 100, doorColor: '#6c6c6e', description: "太平机柜" },
    "TOTEN": { width: 60, height: 42, depth: 100, doorColor: '#6c6c6e', description: "图腾牌机柜" },
    "TOTEN2": { width: 60, height: 47, depth: 80, doorColor: '#6c6c6e', doorTransparent: true, description: "图腾牌机柜" },
    "TOTEN3": { width: 60, height: 42, depth: 100, doorColor: '#6c6c6e', doorTransparent: true, description: "图腾牌机柜" },
    "ZTE": { width: 60, height: 42, depth: 100, doorColor: '#74747c', description: "中兴牌机柜" },
    "ZTE2": { width: 60, height: 19, depth: 60, doorColor: '#74747c', description: "中兴牌机柜" },
    "ZTE3": { width: 60, height: 42, depth: 100, doorColor: '#74747c', description: "中兴牌机柜" },
    "CASCO": { width: 80, height: 42, depth: 110, doorColor: '#74747c', description: "中兴牌机柜" },
    "RITTAL": { width: 60, height: 42, depth: 110, doorColor: '#6c6d72', description: "RITTAL机柜" },
    "SHIP": { width: 60, height: 42, depth: 110, doorColor: '#6c6d72', description: "SHIP机柜" },
    "THTF": { width: 60, height: 42, depth: 100, doorColor: '#E8E8E8', description: "THTF机柜", rotationBackDoor: 'left', rotationFrontDoor: 'left' },
    "IBM5": { width: 65, height: 42, depth: 105, doorColor: '#6f6f6f', description: "IBM机柜" },
    "HP": { width: 60, height: 42, depth: 90, doorColor: '#6f6f6f', description: "HP机柜" },
    'HW': { width: 60, height: 42, depth: 120, doorColor: '#6f6f6f', description: "HW机柜" },
    'HW2': { width: 60, height: 42, depth: 120, doorColor: '#6f6f6f', description: "HW机柜" },
    'HEADSUN': { width: 60, height: 42, depth: 120, doorColor: '#6f6f6f', description: "海德森机柜" },
    "CASCO2": { width: 60, height: 47, depth: 100, doorColor: '#797a7f' },

    //***loda***/
/*"IBM6": { width: 60, height: 42, depth: 100, doorColor: '#525355', description: "IBM机柜", reflectRatio: 0.1 },
"IBM7": { width: 65, height: 42, depth: 105, doorColor: '#5f5f5f', description: "IBM机柜", reflectRatio: 0.1 },
"inspur": { width: 60, height: 42, depth: 90, doorColor: '#4f4f4f', description: "inspur机柜", reflectRatio: 0.1 },
'lenovo': { width: 60, height: 42, depth: 120, doorColor: '#525355', description: "lenovo机柜", reflectRatio: 0.1 },
'LONGXING': { width: 60, height: 42, depth: 60, doorColor: '#e7e2dc', description: "联通机柜", reflectRatio: 0.1 },
'TOTEN4': { width: 60, height: 42, depth: 120, doorColor: '#656567', description: "图腾机柜", reflectRatio: 0.1 },
'Telecom': { width: 60, height: 42, depth: 35, doorColor: '#4B536A', description: "电信机柜", reflectRatio: 0.1 },
'bingxingji': { width: 73, height: 42, depth: 91, doorColor: '#525253', description: "并行机柜1", reflectRatio: 0.1, cutWidth: 53.4, rotationFrontDoor: 'left',doubleBackDoor:true},
'bingxingji2': { width: 73, height: 42, depth: 100, doorColor: '#505253', description: "并行机柜2", reflectRatio: 0.1, cutWidth: 53.4, },
"SHIP2": { width: 60, height: 25, depth: 60, doorColor: '#6c6d72', description: "SHIP机柜" },
"HP2": { width: 60, height: 42, depth: 120, doorColor: '#6f6f6f', description: "HP2机柜", reflectRatio: 0.8 },
"Piolt": { width: 60, height: 26, depth: 60, doorColor: '#6c6d72', description: "SHIP机柜" },
"HW3": { width: 60, height: 42, depth: 120, doorColor: '#6f6f6f', description: "HW3机柜", reflectRatio: 0.8 },
"IBM9": { width: 60, height: 42, depth: 120, doorColor: '#6c6d72', description: "IBM机柜", reflectRatio: 0.8, rotationFrontDoor: 'left' },
"HW2": { width: 60, height: 42, depth: 120, doorColor: '#6c6d72', description: "HW2机柜", reflectRatio: 0.8 },
"IBM8": { width: 60, height: 42, depth: 120, doorColor: '#6c6d72', description: "IBM8机柜", reflectRatio: 0.8 },
"ZTE4": { width: 60, height: 42, depth: 120, doorColor: '#6c6d72', description: "中兴机柜", reflectRatio: 0.8 },
"TOTEN5": { width: 60, height: 42, depth: 120, doorColor: '#6c6d72', description: "图腾机柜", reflectRatio: 0.8 },
//TOTEN5
"TOTEN7": { width: 60, height: 42, depth: 110, doorColor: '#6f6f6f', description: "图腾机柜", reflectRatio: 0.8 },
"IBM10": { width: 60, height: 42, depth: 110, doorColor: '#6c6d72', description: "图腾机柜", reflectRatio: 0.8 },
"IBM11": { width: 90, height: 42, depth: 110, doorColor: '#6c6d72', description: "图腾机柜", reflectRatio: 0.8 },
"APC": { width: 75, height: 42, depth: 110, doorColor: '#6c6d72', description: "施耐德机柜", reflectRatio: 0.8 },
"S1240J": { width: 104,cutWidth:84.7, height: 47, depth: 45, doorColor: '#6c6d72', description: "施耐德机柜", reflectRatio: 0.1 },

}*/

/*var commRacks = {
    "rack5": { width: 60, height: 32, depth: 100, doorColor: '#6c6c6e', doorTransparent: true },
    "rack6": { width: 60, height: 42, depth: 80, doorColor: '#6c6c6e', doorTransparent: true },
    "rack7": { width: 80, height: 42, depth: 110, doorColor: '#6c6c6e', doorTransparent: true },
    "rack9": { width: 60, height: 42, depth: 100, doorColor: '#6f6f6f', doorTransparent: true },
    "rack10": { width: 60, height: 42, depth: 100, doorColor: '#6f6f6f', doorTransparent: true },
    "rack11": { width: 80, height: 42, depth: 120, doorColor: '#6f6f6f', doorTransparent: true },
    "rack12": { width: 60, height: 42, depth: 60, doorColor: '#6f6f6f', doorTransparent: true },
    "rack15": { width: 60, height: 57, depth: 120, doorColor: '#6f6f6f', doorTransparent: true },
    "rack16": { width: 60, height: 27, depth: 60, doorColor: '#6f6f6f', doorTransparent: true },
    "rack19": { width: 60, height: 57, depth: 120, doorColor: '#6f6f6f', doorTransparent: true },
    "rack17": { width: 110, height: 57, depth: 120, doorColor: '#6f6f6f', doorTransparent: true },
    "rack18": { width: 60, height: 47, depth: 120, doorColor: '#6f6f6f', doorTransparent: true },
    "rack20": { width: 60, height: 47, depth: 120, doorColor: '#c3c1b5', doorTransparent: true },
    "rack21": { width: 60, height: 42, depth: 120, doorColor: '#6f6f6f', doorTransparent: false },
    "rack22": { width: 80, height: 42, depth: 120, doorColor: '#c4c4c4', doorTransparent: false, cutWidth: 60.7, reflectRatio: 0.1 },
    "rack23": { width: 60, height: 42, depth: 120, doorColor: '#bebebe', doorTransparent: false, rotationFrontDoor: 'left', rotationBackDoor: 'left', reflectRatio: 0.1 },

    "rack24": { width: 60, height: 42, depth: 120, doorColor: '#bebebe', doorTransparent: false, reflectRatio: 0.8 },
    "rack25": { width: 60, height: 42, depth: 120, doorColor: '#bebebe', doorTransparent: false, reflectRatio: 0.8, },
    "rack26": { width: 60, height: 42, depth: 120, doorColor: '#bebebe', doorTransparent: false, reflectRatio: 0.8 },
    "rack27": { width: 60, height: 42, depth: 120, doorColor: '#bebebe', doorTransparent: false, reflectRatio: 0.8 },
    "rack28": { width: 60, height: 42, depth: 120, doorColor: '#bebebe', doorTransparent: false, reflectRatio: 0.8 },

}*/
var headerRacks = {
    'headerRack5': { width: 60, height: 42, depth: 120, doorColor: '#6c6c6e' },
    'headerRack6': { width: 120, height: 47, depth: 120, doorColor: '#6c6c6e' },
    'headerRack7': { width: 60, height: 57, depth: 60, doorColor: '#6c6c6e' }, //高250
    'headerRack8': { width: 120, height: 57, depth: 30, doorColor: '#6c6c6e' },
    'headerRack9': { width: 120, height: 57, depth: 30, doorColor: '#6c6c6e' },
    'headerRack10': { width: 60, height: 57, depth: 60, doorColor: '#6c6c6e' },
    "CASCO.headerRack": { width: 60, height: 47, depth: 100, doorColor: '#c3c1b5', doorTransparent: true },
    "CASCO.pdc": { width: 80, height: 47, depth: 100, doorColor: '#c3c1b5', doorTransparent: true },
    "CASCO.headerRack": { width: 60, height: 47, depth: 100, doorColor: '#c3c1b5', doorTransparent: true },
    'headerRack11': { width: 60, height: 42, depth: 90, doorColor: '#6c6c6e' },
    'headerRack15': { width: 60, cutCube: 84.7, height: 47, depth: 40, doorColor: '#6c6c6e' },

}
var airconditions = {
    'airConditioning18': { width: 30, height: 57, depth: 120, doorColor: '#6c6c6e' }, //列间空调
    'airConditioning20': { width: 30, height: 57, depth: 135, doorColor: '#6c6c6e' }, //列间空调
    'airConditioning21': { width: 30, height: 57, depth: 120, doorColor: '#6c6c6e' }, //列间空调

}
var getRackModelParameter = function (params) {
    var result = getRackParameters(params.height);
    if (params.width) result.width.value = params.width;
    if (params.depth) result.depth.value = params.depth;
    if (params.cutWidth) result.cutWidth.value = params.cutWidth;
    if (params.doorTransparent) result.doorTransparent.value = params.doorTransparent;
    if (params.rotationFrontDoor) result.rotationFrontDoor.value = params.rotationFrontDoor;
    if (params.rotationBackDoor) result.rotationBackDoor.value = params.rotationBackDoor;
    if (params.reflectRatio) result.reflectRatio.value = params.reflectRatio;
    if (params.doubleFrontDoor) result.doubleFrontDoor.value = params.doubleFrontDoor;
    if (params.doubleBackDoor) result.doubleBackDoor.value = params.doubleBackDoor;
    if (params.backDoorFrontImage) result.backDoorFrontImage.value = params.backDoorFrontImage;
    return result;
}

var getRackImagePath = function (image) {
    return make.Default.path + 'model/idc/images/rack/' + image;
}

var getHeaderRackImagePath = function (image) {
    return make.Default.path + 'model/idc/images/HeaderRack/' + image;
}
var getAirconditionImagePath = function (image) {
    return make.Default.path + 'model/idc/images/aircondition/' + image;
}
var registerRackModel = function (id, name, params) {
    make.Default.copy(id, 'twaver.idc.rack', function (json, callback) {
        json.backImage = getRackImagePath(name + "/rack_back.jpg");
        json.sideImage = getRackImagePath(name + "/rack_side.jpg");
        json.topImage = getRackImagePath(name + "/rack_top.jpg");
        json.fontDoorImage = getRackImagePath(name + "/rack_door_front.jpg");
        json.backDoorImage = getRackImagePath(name + "/rack_door_back.jpg");
        json.frontDoorLeftImage = getRackImagePath(name + "/rack_door_front_l.jpg");
        json.frontDoorRightImage = getRackImagePath(name + "/rack_door_front_r.jpg");
        json.backDoorLeftImage = getRackImagePath(name + "/rack_door_back_l.jpg");
        json.backDoorRightImage = getRackImagePath(name + "/rack_door_back_r.jpg");
        json.frontDoorBackImage = getRackImagePath(name + "/rack_door_front_b.jpg");
        // json.backDoorFrontImage =getRackImagePath(name + "/backDoor_front.jpg");
        json.backDoorFrontImage = json.backDoorFrontImage && getRackImagePath(name + "/backDoor_front.jpg");
        json.doorColor = params.doorColor;
    }, {
            icon: getIdcIconPath('rack_' + name + '.png'),
            modelDefaultParameters: getRackModelParameter(params)
        });
}

var registerHeaderRackModel = function (id, name, params) {
    make.Default.copy(id, 'twaver.idc.simpleRack', function (json, callback) {
        json.image = getHeaderRackImagePath(name + '/rack_wrap.jpg');
    }, {
            icon: getIdcIconPath(name + '.png'),
            modelDefaultParameters: getBasicParameters(params.width, params.height, params.depth)
        });
}
var registerAirconditionsModel = function (id, name, params) {
    make.Default.copy(id, 'twaver.idc.simpleRack', function (json, callback) {
        json.image = getAirconditionImagePath(name + '/rack_wrap.jpg');
    }, {
            icon: getIdcIconPath(name + '.png'),
            modelDefaultParameters: getBasicParameters(params.width, params.height, params.depth)
        });
}

var registerSimpleRackModel = function (id, name, params) {
    make.Default.copy(id, 'twaver.idc.simpleRack', function (json, callback) {
        json.image = getRackImagePath(name + '/rack_wrap.jpg');
    }, {
            icon: getIdcIconPath('rack_' + name + '.png'),
            modelDefaultParameters: getBasicParameters(params.width, params.height, params.depth)
        });
}
for (var key in headerRacks) {
    registerHeaderRackModel('twaver.idc.' + key, key, headerRacks[key])
}
for (var key in airconditions) {
    registerAirconditionsModel('twaver.idc.' + key, key, airconditions[key])
}
/*for (var key in racks) {
    registerRackModel('twaver.idc.' + key + '.rack', key, racks[key]);
    registerSimpleRackModel('twaver.idc.' + key + '.simpleRack', key, racks[key]);
}*/

//遍历所有无名rack
/*for (var key in commRacks) {
    //注册资产
    registerRackModel('twaver.idc.' + key + '', key, commRacks[key]);
    var firstLetter = key.charAt(0).toUpperCase();
    var simpleId = 'twaver.idc.simple' + firstLetter + key.substring(1, key.length);
    //注册简单资产
    registerSimpleRackModel(simpleId, key, commRacks[key]);
}*/

var getRack8RackImagePath = function (image) {
    return make.Default.path + 'model/idc/images/rack/rack8/' + image;
}
make.Default.copy('twaver.idc.simpleRack8', 'twaver.idc.simpleRack', function (json, callback) {
    json.image = getRack8RackImagePath('rack_wrap.jpg');
}, {
        icon: getIdcIconPath('simpleRack8.png'),
        // modelDefaultParameters: getBasicParameters(params.width, params.height, params.depth)
    });

make.Default.register('twaver.idc.rack8', function (json, callback) {
    json = json || {};
    json.client = json.client || {};
    json.style = json.style || {};
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];
    var width = json.width;
    var height = json.height;
    var depth = json.depth;
    var cutWidth = json.cutWidth;
    var backImage = getRack8RackImagePath(json.backImage);
    var sideImage = getRack8RackImagePath(json.sideImage);
    var topImage = getRack8RackImagePath(json.topImage);
    var frontPic = json.frontImage || getFrontPic(height, width);

    var rackHeight = make.Default.getRackHeight(height);
    var doorAngle = json.doorAngle;
    var evnmap = make.Default.getEnvMap(json.evnmap);
    var reflectRatio = json.reflectRatio;
    var insideTopImage = getIdcImagePath(json.insideTopImage);
    var insideSideImage = getIdcImagePath(json.insideSideImage);
    var insideBackImage = getIdcImagePath(json.insideBackImage);

    var doorFrontPic = getRack8RackImagePath(json.fontDoorImage);
    var doorBackPic = getRack8RackImagePath(json.backDoorImage);
    var doorTransparent = json.doorTransparent || false;
    var doorColor = json.doorColor || 'white';
    var doorDepth = 2;
    var showBackDoor = json.showBackDoor;

    var offset = make.Default.RACK_OFFSET_Y * 2;

    var rack = new mono.Cube(width, rackHeight, depth - doorDepth * 2);
    rack.s({
        'm.color': '#666666',
        'm.ambient': '#ffffff',
        'm.specular': '#e5e5e5',
        'm.type': 'phong',
        'm.specularStrength': 3,
        'left.m.texture.image': sideImage,
        'right.m.texture.image': sideImage,
        'top.m.texture.image': topImage,
        'bottom.m.texture.image': topImage,
        'back.m.texture.image': backImage,
        'back.m.texture.image': frontPic,
        'front.m.texture.image': frontPic,
        'front.m.specularStrength': 2,
    });

    var cut = new mono.Cube(cutWidth, rackHeight - offset + 1, depth * 1.2);
    cut.s({
        'm.type': 'basic',
        'm.lightmap.image': make.Default.getImagePath('outside_lightmap.jpg'),
        'back.m.texture.image': insideBackImage,
        'left.m.texture.image': insideSideImage,
        'left.m.texture.flipX': true,
        'right.m.texture.image': insideSideImage,
        'top.m.texture.image': insideTopImage,
        'top.m.texture.flipY': true,
        'bottom.m.texture.image': insideTopImage,
    });
    cut.setPosition(0, 0, rack.getDepth() / 2 - cut.getDepth() / 2);

    var newRack;
    if (json.objectId) {
        newRack = new mono.ComboNode({
            'id': json.objectId,
            'combos': [rack, cut],
            'operators': ['-']
        });
    } else {
        newRack = new mono.ComboNode([rack, cut], ['-']);
    }
    for (var p in json.client) {
        newRack.setClient(p, json.client[p]);
    }
    var rackDoor = new mono.Cube(width, rackHeight, doorDepth);
    rackDoor.s({
        'm.type': 'phong',
        'm.transparent': doorTransparent,
        'front.m.texture.image': doorFrontPic,
        'back.m.texture.image': doorBackPic,
        'm.envmap.image': evnmap,
        'm.reflectRatio': 1.0,
        'm.color': '#666666',
        'm.ambient': '#4B545E',
        'front.m.color': 'white',
        'back.m.color': 'white',
        'front.m.ambient': 'white',
        'back.m.ambient': 'white',
    });
    rackDoor.setParent(newRack);
    rackDoor.setClient('animation', 'rotation:left:{}:1000:0:bounceOut'.format(-doorAngle || '135'));
    rackDoor.setClient('type', 'rack_door');
    rackDoor.setClient('inbuilt', true);
    rackDoor.setPosition(0, 0, depth / 2 - doorDepth / 2);
    newRack.rackDoor = rackDoor;
    if (showBackDoor) {
        var backDoor1 = new mono.Cube(width, rackHeight, 5);
        backDoor1.s({
            'm.type': 'phong',
            'top.m.texture.image': getRack8RackImagePath('./backDoor_top1.jpg'),
            'bottom.m.texture.image': getRack8RackImagePath('./backDoor_top1.jpg'),
            'left.m.texture.image': getRack8RackImagePath('./backDoor_left1.jpg'),
            'right.m.texture.image': getRack8RackImagePath('./backDoor_left1.jpg'),
            'front.m.texture.image': getRack8RackImagePath('./backDoor_back.jpg'),
            'back.m.texture.image': getRack8RackImagePath('./backDoor1.jpg'),
        });
        backDoor1.p(0, 0, -1.5);
        var backDoor2 = new mono.Cube(width, rackHeight * 0.99, 2);
        backDoor2.s({
            'm.type': 'phong',
            'top.m.texture.image': getRack8RackImagePath('./backDoor_top2.jpg'),
            'bottom.m.texture.image': getRack8RackImagePath('./backDoor_top2.jpg'),
            'left.m.texture.image': getRack8RackImagePath('./backDoor_left2.jpg'),
            'right.m.texture.image': getRack8RackImagePath('./backDoor_left2.jpg'),
            'back.m.texture.image': getRack8RackImagePath('./backDoor2.jpg'),
        });
        backDoor2.p(0, 0, -5);
        var backDoor3 = new mono.Cube(width * 0.95, rackHeight * 0.95, 5);
        backDoor3.s({
            'm.type': 'phong',
            'back.m.texture.image': getRack8RackImagePath('./backDoor3.jpg'),
            'top.m.texture.image': getRack8RackImagePath('./backDoor_top3.jpg'),
            'bottom.m.texture.image': getRack8RackImagePath('./backDoor_top3.jpg'),
            'left.m.texture.image': getRack8RackImagePath('./backDoor_left3.jpg'),
            'right.m.texture.image': getRack8RackImagePath('./backDoor_left3.jpg'),
        });
        backDoor3.p(0, 0, -7.5);
        var backDoor = new mono.ComboNode([backDoor1, backDoor2, backDoor3]);
        backDoor.setParent(newRack);
        backDoor.setClient('animation', 'rotation:left:{}:1000:0:bounceOut'.format(doorAngle || '135'));
        backDoor.setClient('type', 'rack_door');
        backDoor.setClient('inbuilt', true);
        backDoor.setPosition(0, 0, -depth / 2 + doorDepth / 2);
        newRack.backDoor = backDoor;
    }
    newRack.setPosition(x, 0, z);
    make.Default.setPositionY(newRack, y);
    newRack.setClient('type', 'rack');
    newRack.setClient('showShadow', true);
    newRack.setRotation(rotation[0], rotation[1], rotation[2]);
    make.Default.setObject3dCSProps(newRack, json);
    if (callback) callback(newRack);
    return newRack;
}, {
        name: "机柜",
        category: "机柜模型",
        description: "机房最常见的模型。机柜是由机柜的主体和机柜门组成的，机柜门支持动画打开，关闭。 支持42U-47U高度，默认42U的高度。模型上还支持常见的长，宽，机柜贴图的设置",
        icon: getIdcIconPath('rack.png'),
        type: 'rack',
        sdkCategory: 'rack',
        modelDefaultParameters: getRackParameters('42U'),
    });
/****************机柜模型**********************/

/****************通道模型******************/
make.Default.register('twaver.idc.area', function (json, callback) {
    var height = json.height;
    var position = json.position || [0, 0, 0];
    var color = json.color;
    var client = json.client || {};
    var label = json.label || '';
    var scale = json.scale || [1, 1, 1];
    var image = json.image;


    var labelPositionX = json.labelPositionX;
    var labelPositionZ = json.labelPositionZ;
    var labelColor = json.labelColor || 'red';
    var labelFont = json.labelFont;
    var labelBg = json.labelBg || 'white';
    var labelOpacity = json.labelOpacity || 0.05;
    var opacity = json.opacity || 1;
    var hideShadow = json.hideShadow;

    var path = make.Default.createShapeNodePath(json.data);
    var area = new mono.ShapeNode(path);
    area.s({
        'm.type': 'phong',
        'm.side': 'both',
        'm.color': color,
        'm.ambient': color,
    });
    if (opacity != 1) {
        area.s({
            'm.transparent': true,
            'm.opacity': opacity,
        });
    }
    area.setAmount(height);
    area.setVertical(true);
    area.setClient('type', 'area');
    area.renderDepth = -100;
    area.p(position[0], position[1], position[2]);
    area.setScale(scale[0], scale[1], scale[2]);
    //新增贴图效果
    if (label || image) {
        var size = make.Default.getPathBoundingBox(json.data).size;
        var bb = area.getBoundingBox();
        var min = bb.min,
            max = bb.max;
        var bWidth = bb.size().x;
        var bHeight = bb.size().z;
        var canImg = new Image();
        if(image){
            var gImage = new Image();
            //等图片加载完再绘制canvas
            gImage.onload = function(){
                canImg.src = make.Default.generateTextCanvas(label, labelColor, labelFont, labelBg, labelOpacity, gImage);
            }
            gImage.src = pageConfig.url("/images/"+image);
        }else{
            canImg.src = make.Default.generateTextCanvas(label, labelColor, labelFont, labelBg, labelOpacity);
        }
        $(canImg).css({
            'width': bWidth + 'px',
            'height': bHeight + 'px',
            'position': 'relative'
        });
        var labelNode = new mono.Plane(bWidth, bHeight, 1, 1);
        labelNode.s({
            'm.transparent': false,
            'm.alphaTest': 0.5,
            'm.texture.image': canImg,
            'm.texture.anisotropy': 8,
            'm.texture.repeat': new mono.Vec2(1, 1),
            'm.texture.offset': new mono.Vec2(0, 0),
        });
        labelNode.setRotationX(-Math.PI / 2);
        labelNode.setSelectable(false);
        if (labelPositionX === null || labelPositionX === undefined) {
            labelPositionX = (min.x + max.x) / 2;
        }
        if (labelPositionZ === null || labelPositionZ === undefined) {
            labelPositionZ = (min.z + max.z) / 2;
        }
        labelNode.p(labelPositionX, (min.y + max.y) / 2 + height / 2 + 2, labelPositionZ);
        labelNode.setParent(area);
    }
    make.Default.setObject3dCSProps(area, json);
    callback && callback(area);
    return area;
}, {
        category: "房间模型",
        type: "area",
        name: "区域",
        icon: getIdcIconPath('area.png'),
        description: "区域是加在某个房间上的。用来对房间进一步细分。可以指定区域的高度，文字，颜色等属性",
        sdkCategory: 'room',
        modelDefaultParameters: getAreaParameters(),
    });


var getAisleParameters = function () {
    return {
        'rackWidth': {
            name: "机柜宽度",
            value: 60,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'rackHeight': {
            name: "机柜高度",
            value: 200,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'rackDepth': {
            name: "机柜深度",
            value: 80,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'rackNumber': {
            name: "机柜数量",
            value: 20,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        aisleDepth: {
            name: "通道深度",
            value: 140,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'windowAnimationType': {
            name: "天窗类型", //1 表示不能打开天窗，天窗没有动画； 2 表示有动画
            value: 2,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'doorAnimationType': {
            name: "门动画类型", //1 代表旋转门；2是左右平移
            value: 2,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'isSingle': {
            name: "是否为单通道",
            value: false,
            type: make.Default.PARAMETER_TYPE_BOOLEAN,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        side: {
            name: "单通道类型", //可选值： left 或 right
            value: 'left',
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        }
    }
}

/**
 * 定义通道，通道是由天窗，天窗上部和左右钢结构以及通道终端门组成，共6个材质
 * 通道需要传入的参数有摆放的机柜尺寸以及摆放多少机柜
 */
make.Default.register('twaver.idc.aisle', function (json, callback) {
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];
    var axis = json.axis || 'x';
    var client = json.client;
    var rackNumber = parseFloat(json.rackNumber);
    var gap = parseFloat(json.rackWidth);
    var width = parseFloat(json.aisleWidth || 0);
    width = width || rackNumber / 2 * gap;
    var height = parseFloat(json.rackHeight);
    var depth = parseFloat(json.rackDepth);
    var aisleDepth = parseFloat(json.aisleDepth);
    var windowAnimationType = json.windowAnimationType;
    var doorAnimationType = json.doorAnimationType;
    var isSingle = json.isSingle;
    var side = json.side;

    var comboParts = [];
    var winParts = [];
    var parentWidth = depth * 2 + aisleDepth;
    if (isSingle) {
        width = json.aisleWidth ? width : rackNumber * gap;
        parentWidth = depth + aisleDepth - 5;
    }
    if (json.width) {
        width = json.width;
    }
    if (json.height) {
        height = json.height;
    }
    if (json.depth) {
        parentWidth = json.depth;
    }
    var parent = new mono.Cube(width, height, parentWidth);
    parent.s({
        'm.visible': false,
    });

    parent.setPosition(0, height / 2 + 1, 0);

    var real_channel = [];

    var positionZ = 0,
        offsetZ = 0;

    if (isSingle) {
        doorAnimationType = doorAnimationType || 1;
        if (side == 'left') {
            positionZ = aisleDepth / 2 - 2;
            offsetZ = depth / 2;
        } else {
            positionZ = -aisleDepth / 2 + 2;
            offsetZ = -depth / 2;
        }

        //add side door
        comboParts.push({
            type: 'cube',
            width: width + 5,
            height: height,
            depth: 5,
            op: '+',
            position: [0, 0, positionZ + offsetZ],
            style: {
                'm.type': 'phong',
                'm.side': 'both',
                'm.color': '#62F3FF',
                'm.ambient': '#62F3FF',
                'm.envmap.image': make.Default.getEnvMap('envmap2'),
                'm.transparent': true,
                'm.texture.image': getIdcImagePath('skylight01-1.png'),
                'm.polygonOffset': true,
                'm.polygonOffsetFactor': 6,
                'm.polygonOffsetUnits': 3,
            }
        });
    }

    //天窗前后侧边框
    for (var i = -1; i < 2; i = i + 2) {
        comboParts.push({
            type: 'cube',
            width: width + 5,
            height: 12,
            depth: 2,
            op: '+',
            position: [0, height / 2, (aisleDepth - 5) / 2 * i + offsetZ],
            style: {
                'm.type': 'phong',
                'm.color': '#666666',
                'm.ambient': '#0c0c0c',
                'm.specular': '#e5e5e5',
                'm.specularStrength': 3,
            }
        });
    }
    //天窗左右侧边框
    for (var i = -1; i < 2; i = i + 2) {
        comboParts.push({
            type: 'cube',
            width: 10,
            height: 16,
            depth: parentWidth,
            op: '+',
            position: [(width / 2 + 5) * i, height / 2 - 3, 0],
            style: {
                'm.type': 'phong',
                'm.color': '#666666',
                'm.ambient': '#0c0c0c',
                'm.specular': '#e5e5e5',
                'm.specularStrength': 3,
            }
        });
    }

    //门
    for (var i = -1; i < 2; i = i + 2) {
        var animationGroupName = 'door1';
        var animation = 'move:front:0.8:1000:0:bounceOut';
        if (doorAnimationType == 1) {
            // rotation:left:-90:1000:0:Bounce.Out
            animation = 'rotation:front:-120:1000:0:bounceOut';
        }
        if (i == 1) {
            animationGroupName = 'door2';
            if (doorAnimationType == 1) {
                animation = 'rotation:front:120:1000:0:bounceOut';
            }
        }
        winParts.push({
            type: 'cube',
            width: 5,
            height: height - 5,
            depth: aisleDepth / 2,
            position: [width / 2 * i, 0, aisleDepth / 4 + offsetZ],
            style: {
                'm.type': 'phong',
                'm.color': '#62F3FF',
                'm.ambient': '#62F3FF',
                'm.envmap.image': make.Default.getEnvMap('envmap2'),
                'left.m.transparent': true,
                'left.m.texture.image': getIdcImagePath('right-door.png'),
                'right.m.transparent': true,
                'right.m.texture.image': getIdcImagePath('left-door.png'),
            },
            client: {
                'animation': animation,
                'animation-group': animationGroupName,
                'type': 'channel_door',
            }

        });
    }

    //门
    for (var i = -1; i < 2; i = i + 2) {
        var animationGroupName = 'door1';
        var animation = 'move:back:0.8:1000:0:bounceOut';
        if (doorAnimationType == 1) {
            animation = 'rotation:back:120:1000:0:bounceOut';
        }
        if (i == 1) {
            animationGroupName = 'door2';
            if (doorAnimationType == 1) {
                animation = 'rotation:back:-120:1000:0:bounceOut';
            }
        }

        winParts.push({
            type: 'cube',
            width: 5,
            height: height - 5,
            depth: aisleDepth / 2,
            position: [width / 2 * i, 0, -aisleDepth / 4 + offsetZ],
            style: {
                'm.type': 'phong',
                'm.color': '#62F3FF',
                'm.ambient': '#62F3FF',
                'm.envmap.image': make.Default.getEnvMap('envmap2'),
                'left.m.transparent': true,
                'left.m.texture.image': getIdcImagePath('left-door.png'),
                'right.m.transparent': true,
                'right.m.texture.image': getIdcImagePath('right-door.png'),
            },
            client: {
                'animation': animation,
                'animation-group': animationGroupName,
                'type': 'channel_door',
            }
        });
    }

    //天窗
    var client = {};
    if (windowAnimationType == 2) {
        client = {
            'animation': 'rotation:center-z:90:1000:0:bounceOut',
            'animation-group': 'skylight',
            'type': 'channel_door',
        };
    }
    var skyCount = isSingle ? rackNumber : rackNumber / 2;
    if (json.skyCount) {
        skyCount = json.skyCount;
        gap = width / skyCount;
    }
    for (var i = 0; i < skyCount; i++) {
        var skylight = {
            type: 'cube',
            width: gap,
            height: 2,
            depth: aisleDepth,
            position: [-gap * skyCount / 2 + gap / 2 + i * gap, (height / 2 + 6), offsetZ],
            style: {
                'm.type': 'phong',
                'm.color': '#00ECFF',
                'm.ambient': '#00ECFF',
                'm.envmap.image': make.Default.getEnvMap('envmap2'),
                'm.transparent': true,
                'm.texture.image': getIdcImagePath('skylight.png'),
            },
            client: client
        };
        winParts.push(skylight);
    }
    var combos = make.Default.createCombo(comboParts);
    real_channel.push(combos);
    // combos.setParent(parent);

    var objects = make.Default.createCombo(winParts);

    for (var i = 0; i < objects.length; i++) {
        // objects[i].setParent(parent);
        real_channel.push(objects[i]);
    }

    // parent.setClient('simple_channel', simple_channel);
    parent.setClient('real_channel', real_channel);
    for (var i = 0; i < real_channel.length; i++) {
        real_channel[i].setParent(parent);
    }
    parent.p(x, 0, z);
    make.Default.setPositionY(parent, y);
    parent.setDepth(parentWidth);
    parent.setClient('type', 'aisle');
    if (axis === 'z') {
        parent.setRotation(0, Math.PI / 2, 0);
    } else {
        parent.setRotation(rotation[0], rotation[1], rotation[2]);
    }
    parent.getSkyLights = function () {
        return objects;
    };
    make.Default.setObject3dCSProps(parent, json);
    callback && callback(parent);
    return parent;
}, {
        category: "机柜模型",
        type: "channel",
        name: "通道",
        icon: getIdcIconPath('channel.png'),
        description: "通道是机房中用于摆放机柜的节能模块，分为单通道和双通道，由通道门和天窗组成。可以设置通道内摆放的机柜数和通道的高度",
        sdkCategory: 'channel',
        modelDefaultParameters: getAisleParameters(),
    });

make.Default.register('twaver.idc.aisle1', function (json, callback) {
    json.isSingle = true;
    var side = json.side || 'left';
    json.side = side;
    json.id = 'twaver.idc.aisle';
    aisle = make.Default.load(json, callback);
    return aisle;
}, {
        category: "机柜模型",
        type: "channel",
        name: "单通道，由通道门和天窗组成。可以设置通道内摆放的机柜数和通道的高度",
        icon: getIdcIconPath('aisle1.png'),
        description: "",
        sdkCategory: 'channel',
        modelDefaultParameters: getAisleParameters(),
    });

make.Default.register('twaver.idc.simpleAisle', function (json, callback) {
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];
    var axis = json.axis || 'x';
    var rackNumber = parseFloat(json.rackNumber);
    var gap = parseFloat(json.rackWidth) + 1;
    var width = parseFloat(json.aisleWidth || 0);
    width = width || rackNumber / 2 * gap;
    var height = parseFloat(json.rackHeight);
    var depth = parseFloat(json.rackDepth);
    var aisleDepth = parseFloat(json.aisleDepth);
    var windowAnimationType = json.windowAnimationType;
    var doorAnimationType = json.doorAnimationType;
    var isSingle = json.isSingle;
    var side = json.side || 'left';

    //通道的深度是机柜的深度*2+通道门的深度
    var parentWidth = depth * 2 + aisleDepth;
    if (isSingle) {
        width = json.aisleWidth ? width : rackNumber * gap;
        parentWidth = depth + aisleDepth - 5;
    }
    if (json.width) {
        width = json.width;
    }
    if (json.height) {
        height = json.height;
    }
    if (json.depth) {
        parentWidth = json.depth;
    }
    var parent = new mono.Cube(width, height, parentWidth);
    parent.s({
        "m.visible": false
    });

    var parts = [];

    var positionZ = 0,
        offsetZ = 0;
    if (isSingle) {
        doorAnimationType = json.doorAnimationType || 1;
        if (side == 'left') {
            positionZ = aisleDepth / 2;
            offsetZ = depth / 2;
        } else {
            positionZ = -aisleDepth / 2;
            offsetZ = -depth / 2;
        }

        //add simple channel
        var part = new mono.Cube(width + 5, height, 5);
        part.p(0, 0, positionZ + offsetZ);
        part.s({
            'm.type': 'phong',
            'm.side': 'both',
            'm.color': '#62F3FF',
            'm.ambient': '#62F3FF',
            'm.envmap.image': make.Default.getEnvMap('envmap1'),
            'm.transparent': true,
            'm.texture.image': getIdcImagePath('skylight01.png'),
            'm.polygonOffset': true,
            'm.polygonOffsetFactor': 6,
            'm.polygonOffsetUnits': 3,

        });
        parts.push(part);
    }

    var simpleDoor = new mono.Cube(width, height, aisleDepth);
    simpleDoor.p(0, 0, offsetZ);
    simpleDoor.s({
        'm.type': 'phong',
        'm.transparent': true,
        'm.side': 'both',
        'front.m.opacity': 0,
        'back.m.opacity': 0,
        'bottom.m.opacity': 0,
        'left.m.color': '#62F3FF',
        'left.m.ambient': '#62F3FF',
        'left.m.texture.image': getIdcImagePath('door.png'),
        'left.m.envmap.image': make.Default.getEnvMap('envmap1'),
        'right.m.color': '#62F3FF',
        'right.m.ambient': '#62F3FF',
        'right.m.texture.image': getIdcImagePath('door.png'),
        'right.m.envmap.image': make.Default.getEnvMap('envmap1'),
        'top.m.color': '#62F3FF',
        'top.m.ambient': '#62F3FF',
        'top.m.texture.image': getIdcImagePath('skylight01.png'),
        'top.m.envmap.image': make.Default.getEnvMap('envmap1'),
    });
    parts.push(simpleDoor);

    for (var i = 0; i < parts.length; i++) {
        parts[i].setParent(parent);
    }
    parent.p(x, 0, z);
    make.Default.setPositionY(parent, y);
    parent.setDepth(parentWidth);
    parent.setClient('type', 'aisle');
    if (axis === 'z') {
        parent.setRotation(0, Math.PI / 2, 0);
    } else {
        parent.setRotation(rotation[0], rotation[1], rotation[2]);
    }
    callback && callback(parent);
    return parent;
}, {
        category: "机柜模型",
        type: "channel",
        name: "通道",
        icon: getIdcIconPath('simpleAisle.png'),
        description: "同上。区别在于 简单通道只是没有细节，是用几个cube加贴图组成，通道窗户不能打开。主要用于和真实通道之间的切换。",
        sdkCategory: 'channel',
        modelDefaultParameters: getAisleParameters(),
    });

/****************通道模型******************/

/******************设备板卡模型******************/
//设备贴图map 默认贴图名称：equipment_front-1U.png

//设备参数
var getEquipmentProParameters = function (param) {
    var pr = getPRParameters();
    var params = {
        'width': {
            value: param.width || 45,
            name: "宽",
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'height': {
            value: param.height,
            name: '高(U)',
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
            editable: false
        },
        'depth': {
            value: param.depth || 50,
            name: "深",
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'frontImage': {
            value: param.frontImage,
            name: "正面贴图",
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'backImage': {
            value: param.backImage,
            name: "背面贴图",
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'sideImage': {
            value: param.sideImage,
            name: "侧面贴图",
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'path': {
            value: param.path,
            name: "贴图路径",
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        }

    }
    make.Default.copyProperties(pr, params);
    return params;
}

var getEquipmentParameters = function (height, icon) {
    return {
        size: height,
        type: "server",
        category: "设备模型",
        name: height + "U设备",
        icon: getIdcIconPath(icon || 'server1.png'),
        description: height + "U的服务器设备。高度为U数，宽度默认是45cm。支持修改宽度，深度和贴图。",
        modelDefaultParameters: getEquipmentProParameters({ "height": height }),
    }
}

make.Default.register('twaver.idc.equipment', function (json, callback) {
    var position = json.position || [0, 0, 0];
    var x = position[0];
    var y = position[1]
    var z = position[2];
    var width = json.width;
    var heightU = parseInt(json.height || 1);
    var depth = json.depth;
    var height = heightU * 4.445;
    var cut = json.cut;
    var combos = [];
    var operators = [];
    var panelWidth = json.panelWidth || parseFloat(width) + 5;
    var offsetHeight = 0.5;
    var backImage = json.backImage;
    var frontImage = getIdcImagePath(json.frontImage || 'server.png');
    if (!cut) {
        frontImage = getIdcImagePath(json.frontImage || 'equipment_front-' + parseInt(heightU) + 'U.png');
    }

    var serverBody = new mono.Cube(width, height - 1 - offsetHeight, depth);
    serverBody.s({
        'm.color': '#666',
        'm.ambient': '#666',
        'm.type': 'phong',
        'm.side': mono.DoubleSide,
        'm.texture.image': getIdcImagePath('rack_inside.jpg'),
        'm.lightmap.image': make.Default.getImagePath('outside_lightmap.jpg'),
    });
    if (json.sideImage) {
        serverBody.s({
            'm.color': '#fff',
            'm.ambient': '#fff',
            'm.texture.image': json.sideImage,
            'm.lightmap.image': null,
            // 'm.transparent': true,
        });
    }
    if (json.backImage) {
        serverBody.s({
            'back.m.texture.image': backImage,
            'back.m.color': '#fff',
            'back.m.ambient': '#fff',
        });
    }
    combos.push(serverBody);
    if (json.serverPanel) {
        serverBody.s({
            'front.m.texture.image': frontImage,
            'front.m.color': '#fff',
            'front.m.ambient': '#fff',
        });
    }
    if (!json.serverPanel) {
        var serverPanel = new mono.Cube(panelWidth, parseFloat(height) - offsetHeight, 1);
        serverPanel.s({
            'm.type': 'phong',
            'm.color': '#333',
            'm.ambient': '#333',
            'm.texture.image': getIdcImagePath('rack_inside.jpg'),
            'm.side': mono.DoubleSide,
            'front.m.texture.image': frontImage,
            'front.m.texture.repeat': new mono.Vec2(1, 1),
            'front.m.color': '#fff',
            'front.m.ambient': '#fff',
        });

        serverPanel.p(0, 0, serverBody.getDepth() / 2 + serverPanel.getDepth() / 2);
        combos.push(serverPanel);
        operators.push('+');
    }
    if (cut) {
        if (!json.cutCount) {
            var cutPosition = json.cutPosition || [0, 0, 10];
            var cutCube = new mono.Cube(parseFloat(json.cutWidth), parseFloat(json.cutHeight), parseFloat(depth) - 10);
            cutCube.s({
                'm.color': '#666',
                'm.ambient': '#666',
                'm.type': 'phong',
                'm.texture.image': getIdcImagePath('rack_inside.jpg'),
            });
            cutCube.p(cutPosition[0], cutPosition[1], cutPosition[2]);
            combos.push(cutCube);
            operators.push('-');
        } else {
            for (var i = 0; i < json.cutCount; i++) {
                var cutPosition = json.cutPosition[i];
                var cutCube = new mono.Cube(parseFloat(json.cutWidth), parseFloat(json.cutHeight), parseFloat(depth) - 10);
                cutCube.s({
                    'm.color': '#666',
                    'm.ambient': '#666',
                    'm.type': 'phong',
                    'm.texture.image': getIdcImagePath('rack_inside.jpg'),
                });
                cutCube.p(cutPosition[0], cutPosition[1], cutPosition[2]);
                combos.push(cutCube);
                operators.push('-');
            }
        }
    }

    var server;
    if (json.objectId) {
        server = new mono.ComboNode({
            'id': json.objectId,
            'combos': combos,
            'operators': operators
        });
    } else {
        server = new mono.ComboNode(combos, operators);
    }
    if (json.client) {
        for (var p in json.client) {
            server.setClient(p, json.client[p]);
        }
    }
    server.setClient('animation', 'move:front:1:1000:0:bounceOut');
    server.p(x, 0, z);
    make.Default.setPositionY(server, y);
    make.Default.setObject3dCSProps(server, json);
    if (callback) callback(server);
    return server;
}, getEquipmentParameters(2, 'server2.png'));

// var registerEquipment = function(size) {
//     make.Default.register('twaver.idc.equipment{}'.format(size), function(json, callback) {
//         var newData = {
//             id: 'twaver.idc.equipment',
//             height: size
//         }
//         make.Default.copyProperties(json, newData);
//         return make.Default.load(newData, callback);
//     }, getEquipmentParameters(size, 'server{}.png'.format(size)));
// }

// for (var i = 1; i <= 47; i++) {
//     registerEquipment(i);
// }


make.Default.register('twaver.idc.equipment8-1', function (json, callback) {
    json.id = 'twaver.idc.equipment';
    json.height = json.height || 8;
    json.frontImage = getIdcImagePath('server.png');
    json.cut = true;
    json.panelWidth = 50;
    json.width = 46;
    json.cutWidth = 45;
    json.cutHeight = 33;
    return make.Default.load(json, callback);
}, {
        type: "server",
        category: "设备模型",
        name: "8U机框",
        icon: getIdcIconPath('server8-1.png'),
        description: "U的服务器设备。这是一种挖空的机架，支持修改宽度和深度",
        modelDefaultParameters: getEquipmentProParameters({ height: 8 }),
    });

make.Default.register('twaver.idc.HW_NE40E-X8.device', function (json, callback) {
    json.id = 'twaver.idc.equipment';
    json.height = 14;
    json.frontImage = getIdcImagePath('NE40E-X8.png');
    json.cut = true;
    json.width = 45;
    json.panelWidth = 45
    json.cutWidth = 44;
    json.cutHeight = 36;
    json.cutPosition = [0, -2.3, 10];
    return make.Default.load(json, callback);
}, {
        type: "server",
        category: "设备模型",
        name: "14U机框",
        icon: getIdcIconPath('server14-1.png'),
        description: "U的服务器设备。这是一种挖空的机架，支持修改宽度和深度",
        modelDefaultParameters: getEquipmentProParameters({ height: 14 }),
    });

/*******************inbuilt  devicePanel *********************/
var getDeviceIconPath3D = function (icon) {
    return make.Default.path + 'model/idc/icons/device/' + icon + '_front.png';
}

var getDeviceImagePath3D = function (image) {
    if (!image) return;
    return make.Default.path + 'model/idc/images/device/' + image;
}
make.Default.register('twaver.idc.S1240J.device', function (json, callback) {
    json.id = 'twaver.idc.equipment';
    json.height = json.height || 20;
    json.frontImage = getDeviceImagePath3D('DTRF.jpg');
    json.backImage = getDeviceImagePath3D('DTRF_back.jpg');
    json.cut = true;
    json.panelWidth = 80;
    json.width = 80;
    json.serverPanel = true;
    json.cutCount = 3;
    json.cutWidth = 77;
    json.cutHeight = 22;
    json.cutPosition = [
        [0, -5, 10],
        [0, -31, 10],
        [0, 21, 10]
    ];
    return make.Default.load(json, callback);
}, {
        type: "server",
        category: "设备模型",
        name: "20U服务器设备",
        icon: getDeviceImagePath3D('DTRF.png'),
        description: "20U的服务器设备。这是一种挖空的机架",
        modelDefaultParameters: getEquipmentProParameters({ height: 20 }),
    });

make.Default.register('twaver.idc.SDH1660SM.device', function (json, callback) {
    json.id = 'twaver.idc.equipment';
    json.color = '#FFF';
    json.height = json.height || 17;
    json.cut = true;
    json.panelWidth = 50;
    json.width = 50;
    json.cutCount = 2;
    json.cutWidth = 44;
    json.cutHeight = 28;
    json.cutPosition = [
        [0, -16.5, 10],
        [0, 16.5, 10]
    ];
    json.frontImage = getDeviceImagePath3D('SDH1660SM.jpg');;
    json.backImage = getDeviceImagePath3D('SDH1660SM_back.jpg');
    json.serverPanel = true;
    return make.Default.load(json, callback);
}, {
        type: "server",
        category: "设备模型",
        name: "17U服务器设备",
        icon: getDeviceImagePath3D('SDH1660SM.png'),
        description: "U的服务器设备。这是一种挖空的机架",
        modelDefaultParameters: getEquipmentProParameters({ height: 17 }),
    });
/*var registerDevicePanel = function(name, props, subType) {
    var height = props.height;
    make.Default.copy('twaver.idc.' + name + '.device', 'twaver.idc.equipment', function (json) {
        json.frontImage = getDeviceImagePath3D(json.frontImage);
        json.backImage = getDeviceImagePath3D(json.backImage);
    }, getDevicePanelParams(name, props, subType))
}
*/
/*var getDevicePanelParams = function(name, props, subType) {
    var height = props.height;
    if (props.back) {
        var backImage = name + '_back.jpg';
    }
    var result = {
        name: name,
        type: 'device',
        category: '设备模型',
        modelDefaultParameters: getEquipmentProParameters({"height":height, "frontImage":name + '_front.jpg', "backImage":backImage}),
        icon: getDeviceIconPath3D(name),
        description: props.description,
        subType: subType,
    }
    return result;
}*/

/*var subTypes = ['server', 'network'];
for (var i = 0; i < subTypes.length; i++) {
    var subType = subTypes[i];
    var subId = 'devicePanel_' + subType;
    var devicePanel = make.Default[subId];
    for (var name in devicePanel) {
        registerDevicePanel(name, devicePanel[name], subType);
    }
}*/
/*******************inbuilt  devicePanel *********************/

//板卡参数
var getCardParameters = function (w, h, d) {
    var result = getBasicParameters(w, h, d);
    result.color = {
        name: '颜色',
        value: 'white',
        type: make.Default.PARAMETER_TYPE_COLOR,
        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
    };
    result.image = {
        value: 'card2.png',
        name: "贴图",
        type: make.Default.PARAMETER_TYPE_IMAGE,
        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
    };
    return result;
}

//板卡
make.Default.register('twaver.idc.card', function (json, callback) {
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var width = json.width,
        height = json.height,
        depth = json.depth;
    var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];
    var color = json.color || 'white';
    var pic = getIdcImagePath(json.image || 'card2.png');

    var card_body_image;
    if (depth / height > 1.2) {
        card_body_image = getIdcImagePath('card_body2.jpg');
    } else {
        card_body_image = getIdcImagePath('card_body.png');
    }

    var parts = [{
        //card panel
        type: 'cube',
        width: width,
        height: height,
        depth: 1,
        position: [0, 0, 0],
        rotation: rotation,
        op: '+',
        style: {
            'm.color': color,
            'm.ambient': color,
            'm.texture.image': getIdcImagePath('gray.png'),
            'front.m.texture.image': pic,
            'back.m.texture.image': pic,
        }
    }, {
        //card body
        type: 'cube',
        width: 1,
        height: height * 0.95,
        depth: depth,
        position: [0, 0, -depth / 2],
        rotation: rotation,
        op: '+',
        style: {
            'm.color': color,
            'm.ambient': color,
            'm.texture.image': getIdcImagePath('gray.png'),
            'left.m.texture.image': card_body_image,
            'right.m.texture.image': card_body_image,
            'left.m.texture.flipX': true,
            'm.transparent': true,
            'm.lightmap.image': make.Default.getImagePath('outside_lightmap.jpg'),
        }
    }];
    var card = make.Default.createCombo(parts, json.objectId);
    card.p(x, y, z);
    card.setClient('type', 'card');
    card.setClient('animation', 'move:front:1:1000:0:bounceOut');
    make.Default.setObject3dCSProps(card, json);
    callback && callback(card);
    return card;
}, {
        category: "设备模型",
        type: "card",
        name: "板卡",
        icon: getIdcIconPath('card.png'),
        description: "板卡",
        modelDefaultParameters: getCardParameters(5, 50, 50)
    });
/*******************inbuilt  cardPanel *********************/
var getCardIconPath3D = function (icon) {
    return make.Default.path + 'model/idc/icons/' + icon + '_front.png';
}

var getCardImagePath3D = function (image) {
    return make.Default.path + 'model/idc/images/device/' + image;
}

var registerCardPanel = function (name, props) {
    make.Default.copy('twaver.idc.' + name + '.card', 'twaver.idc.card', function (json) {
        json.image = getCardImagePath3D(name + '_front.jpg');
    }, getBoardPanelParams(name, props))
}

var getBoardPanelParams = function (name, props) {
    var height = props.height;
    var width = props.width;
    var depth = props.depth;
    var result = {
        name: name,
        type: 'device',
        category: '板卡模型',
        modelDefaultParameters: getCardParameters(width, height, depth),
        icon: getCardIconPath3D(name),
        description: props.description,
    }
    return result;
}


var cardPanel = make.Default.cardPanel_network;
for (var name in cardPanel) {
    registerCardPanel(name, cardPanel[name]);
}

/*******************inbuilt  cardPanel *********************/

/******************设备板卡模型******************/


var getSkyWindowParameters = function () {
    var result = getBasicParameters(60, 2, 130);
    var params = {
        'image': {
            name: "贴图",
            value: 'skylight.png',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },

    };
    make.Default.copyProperties(params, result);
    return result;
}

make.Default.register('twaver.idc.skyWindow', function (json, callback) {
    var image = getIdcImagePath(json.image);
    var skyWindow = make.Default.createCube({
        width: json.width,
        height: json.height,
        depth: json.depth,
        image: image,
        style: {
            'm.type': 'phong',
            'm.color': '#aaa',
            'm.ambient': '#aaa',
            'm.envmap.image': make.Default.getEnvMap('envmap2'),
            'm.transparent': true,
        },
        client: {
            'animation': 'rotation:center-z:90:1000:0:bounceOut',
        }
    });
    make.Default.setObject3dCommonProps(skyWindow, json);
    if (callback) callback(skyWindow);
    return skyWindow;
}, {
        category: "部件模型",
        type: 'skyWindow',
        name: "天窗",
        icon: getIdcIconPath('skyWindow.png'),
        description: "天窗，可用于通道顶部",
        modelDefaultParameters: getSkyWindowParameters()

    });

make.Default.register('twaver.idc.pedestal', function (json, callback) {
    var image = getIdcImagePath(json.image || 'board.png');
    var repeatW = json.repeatW || 5.5;
    var repeatD = json.repeatD || 2.5;
    var pedestal = make.Default.createCube({
        width: json.width,
        height: json.height,
        depth: json.depth,
        style: {
            'm.type': 'phong',
            'm.color': '#888',
            'm.ambient': '#888',
            'm.envmap.image': make.Default.getEnvMap('envmap2'),
            'm.reflectRatio': 0.2,
            'front.m.texture.image': image,
            'front.m.texture.repeat': new mono.Vec2(repeatW, 1),
            'back.m.texture.image': image,
            'back.m.texture.repeat': new mono.Vec2(repeatW, 1),
            'left.m.texture.image': image,
            'left.m.texture.repeat': new mono.Vec2(repeatD, 1),
            'right.m.texture.image': image,
            'right.m.texture.repeat': new mono.Vec2(repeatD, 1),
            'm.texture.anisotropy': 16,
            'top.m.color': '#4E4E4E',
            'top.m.ambient': '#4E4E4E',
        }
    });
    make.Default.setObject3dCommonProps(pedestal, json);
    if (callback) callback(pedestal);
    return pedestal;
}, {
        category: "部件模型",
        type: 'pedestal',
        name: "底座",
        icon: getIdcIconPath('pedestal.png'),
        description: "底座",
        modelDefaultParameters: getBasicParameters(840, 30, 360)

    });

make.Default.register('twaver.idc.board', function (json, callback) {
    var image = getIdcImagePath(json.image || 'board_wrap.png');
    var color = json.color || '#999';
    var board = make.Default.createCube({
        width: json.width,
        height: json.height,
        depth: json.depth,
        image: image,
        color: color,
        wrapMode: 'six-each',
        style: {
            'm.type': 'phong',
            'm.color': color,
            'm.ambient': color,
            'm.envmap.image': make.Default.getEnvMap('envmap2'),
            'm.reflectRatio': 0.2,
            'm.texture.anisotropy': 16,
        }
    });
    make.Default.setObject3dCommonProps(board, json);
    if (callback) callback(board);
    return board;
}, {
        category: "部件模型",
        type: 'board',
        name: "板子",
        icon: getIdcIconPath('board.png'),
        description: "板子",
        modelDefaultParameters: getBasicParameters(130, 90, 5)

    });

var getAirConditionParameters = function () {
    var result = getBasicParameters(100, 200, 80);
    var params = {
        'sideImage': {
            name: "侧面贴图",
            value: 'air-condition-side.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'frontImage': {
            name: "正面贴图",
            value: 'air-condition-front.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'backImage': {
            name: "正面贴图",
            value: 'air-condition-side.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'topImage': {
            name: "顶部贴图",
            value: 'air-condition-top.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        }
    };
    make.Default.copyProperties(params, result);
    return result;
}

make.Default.register('twaver.idc.airCondition', function (json, callback) {
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var width = json.width;
    var height = json.height;
    var depth = json.depth;
    var sideImage = getIdcImagePath(json.sideImage);
    var topImage = getIdcImagePath(json.topImage);
    var frontImage = getIdcImagePath(json.frontImage);

    var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];

    var source = new mono.Cube(width, height, depth);
    source.s({
        'm.type': 'phong',
        'm.color': '#557E7A',
        'm.specular': '#ffffff',
        'm.specularStrength': 3,
        'm.specularmap.image': make.Default.getImagePath('outside_lightmap.jpg'),
        'm.texture.image': sideImage,
        'front.m.texture.image': frontImage,
        'top.m.texture.image': topImage,
        'front.m.envmap.image': make.Default.getEnvMap('envmap1'),
        'm.reflectRatio': 0.2,
    });
    source.setPosition(x, 0, z);
    source.setRotation(rotation[0], rotation[1], rotation[2]);
    make.Default.setPositionY(source, y);
    make.Default.setObject3dCSProps(source, json);
    source.setClient('type', 'airCondition');
    source.setClient('showShadow', true);
    if (callback) callback(source);
    return source;
}, {
        name: "空调",
        description: "精密空调是机房中用于散热，排风的模块，保证机房的恒温恒湿。支持修改长，宽，高基本参数",
        icon: getIdcIconPath('airCondition.png'),
        category: '机柜模型',
        type: 'airCondition',
        modelDefaultParameters: getAirConditionParameters(),
    });

make.Default.register('twaver.idc.airCondition1', function (json, callback) {
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var width = json.width;
    var height = json.height;
    var depth = json.depth;
    var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];
    var color = json.color || "#FFFFFF";

    var airCondition;
    if (json.objectId) {
        airCondition = new mono.Cube({
            'id': json.objectId,
            'width': width,
            'height': height,
            'depth': depth
        });
    } else {
        airCondition = new mono.Cube(width, height, depth);
    }

    airCondition.s({
        'm.type': 'phong',
        'm.color': color,
        'm.ambient': color,
        'm.texture.image': getIdcImagePath('aircondition1_wrap.jpg'),
        'm.envmap.image': make.Default.getEnvMap('envmap1'),
        'm.reflectRatio': 0.5,
    });
    airCondition.setWrapMode('six-each');
    airCondition.p(x, 0, z);
    airCondition.setRotation(rotation[0], rotation[1], rotation[2]);
    make.Default.setPositionY(airCondition, y);
    airCondition.setClient('type', 'airCondition');
    airCondition.setClient('showShadow', true);
    make.Default.setObject3dCSProps(airCondition, json);
    if (callback) callback(airCondition);
    return airCondition;
}, {
        name: "空调",
        description: "精密空调是机房中用于散热，排风的模块，保证机房的恒温恒湿。支持修改长，宽，高基本参数",
        icon: getIdcIconPath('airCondition1.png'),
        category: '机柜模型',
        type: 'airCondition',
        modelDefaultParameters: getBasicParameters(188, 174, 75),
    });

make.Default.register('twaver.idc.airCondition2', function (json, callback) {
    json.id = 'twaver.idc.airCondition1';
    json.color = "#A4F4EC";
    return make.Default.load(json, callback);
}, {
        name: "空调",
        description: "精密空调是机房中用于散热，排风的模块，保证机房的恒温恒湿。支持修改长，宽，高基本参数",
        icon: getIdcIconPath('airCondition2.png'),
        category: '机柜模型',
        type: 'airCondition',
        modelDefaultParameters: getBasicParameters(188, 174, 75),
    });

make.Default.register('twaver.idc.switchgear', function (json, callback) {
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var width = json.width;
    var height = json.height;
    var depth = json.depth;
    var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];

    var switchgear;
    if (json.objectId) {
        switchgear = new mono.Cube({
            'id': json.objectId,
            'width': width,
            'height': height,
            'depth': depth
        });
    } else {
        switchgear = new mono.Cube(width, height, depth);
    }
    switchgear.s({
        'm.type': 'phong',
        // 'm.color': '#ffffff',
        // 'm.ambient': '#d0d0d0',
        'm.texture.image': getIdcImagePath('switch_wrap.jpg'),
        'm.envmap.image': make.Default.getEnvMap('envmap1'),
        'm.reflectRatio': 0.2,
    });
    switchgear.setWrapMode('six-each');
    switchgear.p(x, 0, z);
    switchgear.setRotation(rotation[0], rotation[1], rotation[2]);
    make.Default.setPositionY(switchgear, y);
    switchgear.setClient('type', 'switchgear');
    switchgear.setClient('showShadow', true);
    make.Default.setObject3dCSProps(switchgear, json);
    if (callback) callback(switchgear);
    return switchgear;
}, {
        name: "开关柜",
        description: "机房常见设备之一，开关柜支持修改长，宽，高等基本参数。",
        icon: getIdcIconPath('switchgear.png'),
        category: '机柜模型',
        type: 'switchgear',
        modelDefaultParameters: getBasicParameters(60, 180, 37),
    });

//Power Distribution Cabinet
make.Default.register('twaver.idc.pdc', function (json, callback) {
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var width = json.width;
    var height = json.height;
    var depth = json.depth;
    var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];

    var pdc;
    if (json.objectId) {
        pdc = new mono.Cube({
            'id': json.objectId,
            'width': width,
            'height': height,
            'depth': depth
        });
    } else {
        pdc = new mono.Cube(width, height, depth);
    }
    pdc.s({
        'm.type': 'phong',
        // 'm.color': '#ffffff',
        // 'm.ambient': '#d0d0d0',
        // 'm.specular': '#e5e5e5',
        // 'm.specularStrength': 2,
        'm.texture.image': getIdcImagePath('pdc_wrap.jpg'),
        'm.envmap.image': make.Default.getEnvMap('envmap1'),
        'm.reflectRatio': 0.2,
    });
    pdc.setWrapMode('six-each');
    pdc.p(x, 0, z);
    pdc.setRotation(rotation[0], rotation[1], rotation[2]);
    make.Default.setPositionY(pdc, y);
    pdc.setClient('type', 'pdc');
    pdc.setClient('showShadow', true);
    make.Default.setObject3dCSProps(pdc, json);
    if (callback) callback(pdc);
    return pdc;
}, {
        name: "配电柜",
        description: "机房常见设备之一，配电柜支持修改长，宽，高等基本参数。",
        icon: getIdcIconPath('pdc.png'),
        category: '机柜模型',
        type: 'pdc',
        modelDefaultParameters: getBasicParameters(80, 180, 37),
    });

var getPduParameters = function () {
    var result = getBasicParameters(60, 220, 100);
    var params = {
        'image': {
            name: "贴图",
            value: 'pdu_wrap.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        }
    };
    make.Default.copyProperties(params, result);
    return result;
}

//Power Distribution Unit
make.Default.register('twaver.idc.pdu', function (json, callback) {
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var width = json.width;
    var height = json.height;
    var depth = json.depth;
    var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];
    var image = getIdcImagePath(json.image);

    var pdu;
    if (json.objectId) {
        pdu = new mono.Cube({
            'id': json.objectId,
            'width': width,
            'height': height,
            'depth': depth
        });
    } else {
        pdu = new mono.Cube(width, height, depth);
    }
    pdu.s({
        'm.type': 'phong',
        'm.specularStrength': 2,
        'm.texture.image': image,
        'm.envmap.image': make.Default.getEnvMap('envmap1'),
        'm.reflectRatio': 0.2,
    });
    pdu.setWrapMode('six-each');
    pdu.p(x, 0, z);
    pdu.setRotation(rotation[0], rotation[1], rotation[2]);
    make.Default.setPositionY(pdu, y);
    pdu.setClient('type', 'pdu');
    pdu.setClient('showShadow', true);
    make.Default.setObject3dCSProps(pdu, json);
    if (callback) callback(pdu);
    return pdu;
}, {
        name: "电源插座",
        description: "PDU（Power Distribution Unit，电源分配单元），也就是我们常说的机柜用电源分配插座，PDU是为机柜式安装的电气设备提供电力分配而设计的产品，拥有不同的功能、安装方式和不同插位组合的多种系列规格，能为不同的电源环境提供适合的机架式电源分配解决方案。PDU的应用，可使机柜中的电源分配更加整齐、可靠、安全、专业和美观，并使得机柜中电源的维护更加便利和可靠",
        icon: getIdcIconPath('pdu.png'),
        category: '机柜模型',
        type: 'pdu',
        modelDefaultParameters: getPduParameters(),
    });

make.Default.register('twaver.idc.ups', function (json, callback) {
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var width = json.width;
    var height = json.height;
    var depth = json.depth;
    var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];

    var source = new mono.Cube(width, height, depth);
    source.s({
        'm.type': 'phong',
        'm.specular': '#ffffff',
        'm.specularStrength': 3,
        'm.specularmap.image': make.Default.getImagePath('outside_lightmap.jpg'),
        'm.texture.image': getIdcImagePath('ups-side.jpg'),
        'top.m.texture.image': getIdcImagePath('ups-top.jpg'),
        'front.m.texture.image': getIdcImagePath('ups-front.jpg'),
        'front.m.envmap.image': make.Default.getEnvMap('envmap1'),
        'm.reflectRatio': 0.2,
    });
    source.setPosition(x, 0, z);
    make.Default.setPositionY(source, y);
    source.setRotation(rotation[0], rotation[1], rotation[2]);
    source.setClient('showShadow', true);
    make.Default.setObject3dCSProps(source, json);
    if (callback) callback(source);
    return source;
}, {
        name: "UPS",
        description: "用于给单台计算机、计算机网络系统或其它垫子设备如电磁阀、压力变送器等提供稳定、不间断的电力供应，保证机房在突发情况下也能正常运转",
        icon: getIdcIconPath('ups.png'),
        category: '机柜模型',
        type: 'ups',
        modelDefaultParameters: getBasicParameters(80, 200, 60),
    });

var getUpsParameters = function (width, height, depth) {
    var result = getBasicParameters(width, height, depth);
    var upsPro = {
        image: {
            name: "贴图",
            value: 'ups_wrap.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        }
    }
    make.Default.copyProperties(upsPro, result);
    return result;
}

make.Default.register('twaver.idc.ups1', function (json, callback) {
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var width = json.width;
    var height = json.height;
    var depth = json.depth;
    var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];

    var ups = new mono.Cube(width, height, depth);
    var image = getIdcImagePath(json.image);
    ups.s({
        'm.type': 'phong',
        'm.texture.image': image,
        'm.envmap.image': make.Default.getEnvMap('envmap1'),
        'm.reflectRatio': 0.2,
        'm.texture.anisotropy': 16,
    });
    ups.setWrapMode('six-each');
    ups.p(x, 0, z);
    ups.setRotation(rotation[0], rotation[1], rotation[2]);
    make.Default.setPositionY(ups, y);
    ups.setClient('type', 'ups');
    ups.setClient('showShadow', true);
    make.Default.setObject3dCSProps(ups, json);
    if (callback) callback(ups);
    return ups;
}, {
        name: "UPS",
        description: "用于给单台计算机、计算机网络系统或其它垫子设备如电磁阀、压力变送器等提供稳定、不间断的电力供应，保证机房在突发情况下也能正常运转",
        icon: getIdcIconPath('ups1.png'),
        category: '机柜模型',
        type: 'ups',
        modelDefaultParameters: getUpsParameters(80, 200, 60),
    });

//74, 200,90
make.Default.copy('twaver.idc.ups2', 'twaver.idc.ups1', function (json, callback) {
    json.image = getIdcImagePath('ups2_wrap.jpg');
}, {
        modelDefaultParameters: getUpsParameters(74, 200, 90),
        icon: getIdcIconPath('ups2.png'),
    });


make.Default.copy('twaver.idc.ups3', 'twaver.idc.ups1', function (json, callback) {
    json.image = getIdcImagePath('ups3_wrap.jpg');
}, {
        modelDefaultParameters: getUpsParameters(74, 200, 90),
        icon: getIdcIconPath('ups3.png'),
    });

make.Default.copy('twaver.idc.ups4', 'twaver.idc.ups1', function (json, callback) {
    json.image = getIdcImagePath('ups4_wrap.jpg');
}, {
        modelDefaultParameters: getUpsParameters(48, 200, 90),
        icon: getIdcIconPath('ups4.png'),
    });

make.Default.copy('twaver.idc.ups5', 'twaver.idc.ups1', function (json, callback) {
    json.image = getIdcImagePath('ups5_wrap.jpg');
}, {
        modelDefaultParameters: getUpsParameters(25, 200, 90),
        icon: getIdcIconPath('ups5.png'),
    });

make.Default.copy('twaver.idc.ups6', 'twaver.idc.ups1', function (json, callback) {
    json.image = getIdcImagePath('ups6_wrap.jpg');
}, {
        modelDefaultParameters: getUpsParameters(54, 200, 90),
        icon: getIdcIconPath('ups6.png'),
    });

make.Default.register('twaver.idc.battery', function (json, callback) {
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var width = json.width;
    var height = json.height;
    var depth = json.depth;
    var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];

    var source = new mono.Cube(width, height, depth);
    source.s({
        'm.type': 'phong',
        'm.specular': '#ffffff',
        'm.specularStrength': 3,
        'm.transparent': true,
        'm.specularmap.image': make.Default.getImagePath('outside_lightmap.jpg'),
        'm.texture.image': getIdcImagePath('battery-side.png'),
        'front.m.texture.image': getIdcImagePath('battery-front.png'),
        'back.m.texture.image': getIdcImagePath('battery-front.png'),
        'top.m.texture.image': getIdcImagePath('battery-top.jpg'),
        'front.m.envmap.image': make.Default.getEnvMap('envmap1'),
        'm.reflectRatio': 0.2,
    });
    source.setRotation(rotation[0], rotation[1], rotation[2]);
    source.setPosition(x, 0, z);
    source.setClient('showShadow', true);
    make.Default.setPositionY(source, y);
    make.Default.setObject3dCSProps(source, json);
    if (callback) callback(source);
    return source;
}, {
        name: "蓄电池",
        description: "机房蓄电池用于给UPS或其他设备不间断供电，保证机房的稳定运行",
        icon: getIdcIconPath('battery.png'),
        category: '机柜模型',
        type: 'battery',
        modelDefaultParameters: getBasicParameters(150, 80, 60),
    });

//发电机
make.Default.register('twaver.idc.alternator', function (json, callback) {
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var width = json.width;
    var height = json.height;
    var depth = json.depth;

    var source = new mono.Cube(width, height, depth);
    source.s({
        'm.type': 'phong',
        'm.specular': '#ffffff',
        'm.specularStrength': 3,
        'm.specularmap.image': make.Default.getImagePath('outside_lightmap.jpg'),
        'm.texture.image': getIdcImagePath('alternator-side.jpg'),
        'front.m.texture.image': getIdcImagePath('alternator-front.jpg'),
        'back.m.texture.image': getIdcImagePath('alternator-front.jpg'),
        'top.m.texture.image': getIdcImagePath('alternator-top.jpg'),
        'bottom.m.texture.image': getIdcImagePath('alternator-top.jpg'),
    });
    source.setPosition(x, 0, z);
    make.Default.setPositionY(source, y);
    source.setClient('showShadow', true);
    make.Default.setObject3dCSProps(source, json);
    if (callback) callback(source);
    return source;
}, {
        name: "发电机",
        description: "发电机也是保证机房正常工作的设备之一，在电停的时候发电机自动启动，电来时候，自动停止工作",
        icon: getIdcIconPath('alternator.png'),
        category: '机柜模型',
        type: 'alternator',
        modelDefaultParameters: getBasicParameters(200, 107, 85),
    });

//摄像头
make.Default.register('twaver.idc.camera', function (json, callback) {
    var position = json.position || [0, 0, 0];
    var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];

    var body = new mono.Cylinder(8, 8, 30);
    body.s({
        'm.type': 'phong',
        'm.texture.image': getIdcImagePath('bbb.png'),
        'top.m.texture.image': getIdcImagePath('camera.png'),
        'bottom.m.texture.image': getIdcImagePath('eee.png'),
    });
    body.setRotationX(Math.PI / 3 * 2);

    var cover1 = new mono.Cylinder(12, 12, 40);
    var cover2 = new mono.Cylinder(10, 10, 40);
    var cover3 = new mono.Cube(20, 40, 20);
    var cover = new mono.ComboNode([cover1, cover3, cover2], ['+', '-']);
    cover.s({
        'm.type': 'phong',
        'm.color': '#333',
        'm.ambient': '#333',
    });
    cover.setRotationX(Math.PI / 3 * 2);

    var path = new mono.Path();
    path.moveTo(0, 0, 0);
    path.lineTo(0, -20, 0);
    path.lineTo(0, -22, -1);
    path.lineTo(0, -24, -24);
    path.lineTo(0, -24, -40);
    var pipe = new mono.PathNode(path, 10, 4, 10, 'round', 'round');
    pipe.s({
        'm.type': 'phong',
        'm.color': '#333',
        'm.ambient': '#333',
    });
    var parent = new mono.ComboNode([body, cover, pipe], ['+', '+']);
    parent.p(x, 0, z);
    make.Default.setPositionY(parent, y);
    parent.setRotation(rotation[0], rotation[1], rotation[2]);
    callback && callback(parent);
    return parent;
}, {
        name: "摄像头",
        description: "机房摄像头，这种类型的摄像头只在某个固定的角度监控视频。支持修改旋转角度",
        icon: getIdcIconPath('camera.png'),
        category: '动环模型',
        type: 'camera',
        modelDefaultParameters: getPRParameters()
    });

make.Default.register('twaver.idc.camera1', function (json, callback) {
    var position = json.position || [0, 0, 0];
    var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];

    var sphere = new mono.Sphere(10);
    sphere.s({
        'm.type': 'phong',
        'm.color': '#ADADAD',
        'm.ambient': '#ADADAD',
        'm.envmap.image': make.Default.getEnvMap('envmap1'),
    });

    var path = new mono.Path();
    path.moveTo(0, 0);
    path.lineTo(0, 8);
    var top1 = new mono.PathNode(path, 20, 3, 20, 'plain', 'round');
    top1.s({
        'm.type': 'phong',
        'm.color': '#DFDAD0',
        'm.ambient': '#DFDAD0',
    });
    top1.setPositionY(12);
    top1.setParent(sphere);

    path = new mono.Path();
    path.moveTo(0, 0);
    path.lineTo(0, 0.5);
    var body = new mono.PathNode(path, 20, 12, 20, 'plain', 'round');
    body.s({
        'm.type': 'phong',
        'm.color': '#DFDAD0',
        'm.ambient': '#DFDAD0',
        'm.specularStrength': 20,
    });
    body.setScaleY(1.7);
    body.setParent(sphere);

    var path = new mono.Path();
    path.moveTo(0, 0, 0);
    path.lineTo(0, 14, 0);
    path.curveTo(0, 15, 0, -1, 15, 0);
    path.lineTo(-10, 15, 0);
    path.curveTo(-12, 15, 0, -15, 13, 0);
    // path.curveTo(-12,15,0,-27,0,0);
    var pipe = new mono.PathNode(path, 10, 2, 10, 'plain', 'plain');
    pipe.s({
        'm.type': 'phong',
        'm.color': '#DFDAD0',
        'm.ambient': '#DFDAD0',
    });
    pipe.setPosition(0, 12, 0);
    pipe.setParent(sphere);
    sphere.setPosition(x, y, z);
    sphere.setRotation(rotation[0], rotation[1], rotation[2]);
    callback && callback(sphere);
    return sphere;
}, {
        name: "摄像头1",
        description: "360度无死角摄像头，这种类型的摄像头监控的范围更广一些",
        icon: getIdcIconPath('camera1.png'),
        category: '动环模型',
        type: 'camera',
        modelDefaultParameters: getPRParameters()
    });

make.Default.register('twaver.idc.ACS', function (json, callback) {
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var width = json.width;
    var height = json.height;
    var depth = json.depth;

    var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];
    var r = make.Default.createCombo({
        type: 'cube',
        width: width,
        height: height,
        depth: depth,
        position: [x, y, z],
        style: {
            'm.color': '#ffffff',
            'm.ambient': '#ffffff',
            'm.specular': '#FFFFFF',
            'm.type': 'phong',
            'm.texture.image': getIdcImagePath('rack_inside.png'),
            'front.m.texture.image': getIdcImagePath('acs.jpg'),
        }
    })
    make.Default.setObject3dCSProps(r, json);
    callback && callback(r);
    return r;
}, {
        name: "门禁",
        description: "门禁一般不单独创建，是和门一起使用的，放在门边上的一种控制系统",
        icon: getIdcIconPath('acs.png'),
        category: '房间模型',
        type: 'acs',
        modelDefaultParameters: getBasicParameters(11.6, 11.6, 2)
    });

make.Default.register('twaver.idc.watercable', function (json, callback) {
    var position = json.position || [0, 0, 0];
    var color = json.color || '#B45F04';
    var cableJson = {
        type: 'pathNode',
        data: json.data,
        radius: json.radius || 5,
        repeat: json.repeat || 25,
        pathImage: getIdcImagePath(json.image),
        style: {
            'm.type': 'phong',
            'm.specularStrength': 50,
            'm.color': color,
            'm.ambient': color,
        },
        client: {
            type: 'cable',
        }
    };

    var cable = make.Default.createCombo(cableJson);
    cable.setPosition(position[0], position[1], position[2]);
    make.Default.setObject3dCommonProps(cable, json);
    if (callback) callback(cable);
    return cable;
}, {
        name: "水浸线",
        description: "水浸线描述",
        icon: getIdcIconPath('cable.png'),
        category: '动环模型',
        type: 'watercable',
        sdkCategory: 'watercable',
        modelDefaultParameters: {
            color: {
                name: '颜色',
                value: 'white',
                type: make.Default.PARAMETER_TYPE_COLOR,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            data: {
                name: '点位置',
                value: '',
                type: make.Default.PARAMETER_TYPE_ARRAY_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            image: {
                name: '贴图',
                value: 'flow.jpg',
                type: make.Default.PARAMETER_TYPE_IMAGE,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
        }
    });

make.Default.register('twaver.idc.plant', function (json, callback) {
    var scale = json.scale || [2, 2, 2];
    var scaleX = scale[0],
        scaleY = scale[1],
        scaleZ = scale[2];
    var pos = json.position || [0, 0, 0];
    var x = pos[0],
        y = pos[1],
        z = pos[2];

    var plant;
    if (!this._plantInstance) {
        var w = json.width,
            h = json.height,
            pic = getIdcImagePath(json.picture);
        var objects = [];

        var cylinderVase = new mono.Cylinder(w * 0.5, w * 0.4, h * 2, 20, 1, false, false);
        cylinderVase.s({
            'm.type': 'phong',
            'm.color': '#ADADAD',
            'm.ambient': '#ADADAD',
            'm.texture.repeat': new mono.Vec2(10, 4),
            'm.specularmap.image': make.Default.getImagePath('metal_normalmap.jpg'),
            'm.normalmap.image': make.Default.getImagePath('metal_normalmap.jpg'),
        });
        var cylinderHollow = cylinderVase.clone();
        cylinderHollow.setScale(0.9, 1, 0.9);
        var cylinderMud = cylinderHollow.clone();
        cylinderMud.setScale(0.9, 0.9, 0.9);
        cylinderMud.s({
            'm.type': 'phong',
            'm.color': '#163511',
            'm.ambient': '#163511',
            'm.texture.repeat': new mono.Vec2(10, 4)
        });
        var vase = new mono.ComboNode([cylinderVase, cylinderHollow, cylinderMud], ['-', '+']);
        objects.push(vase);

        var count = 5;
        for (var i = 0; i < count; i++) {
            var plant = new mono.Cube(w * 2, h + 20, 0.01);

            plant.s({
                'm.transparent': true,
                'front.m.visible': true,
                'front.m.texture.image': pic,
                'back.m.visible': true,
                'back.m.texture.image': pic,
            });
            plant.setSelectable(false);
            plant.setEditable(false);
            plant.setParent(vase);
            plant.setPositionY(cylinderVase.getHeight() / 2 + plant.getHeight() / 2 - 20);
            plant.setRotationY(Math.PI * i / count);
            objects.push(plant);
        }

        this._plantInstance = new mono.ComboNode(objects);
        this._plantInstance.setClient('plant.original.y', cylinderVase.getHeight() / 2 + cylinderVase.getHeight() / 4 * Math.min(scaleX, scaleZ));
        this._plantInstance.setClient('showShadow', true);
        this._plantInstance.setClient('shadowWeight', 1);
        this._plantInstance.setClient('shadowType', 1);
        this._plantInstance.setClient('shadowRadius', w * 0.3);
        plant = this._plantInstance;
    } else {
        plant = this._plantInstance.clone();
    }

    plant.setPosition(x, 0, z);
    make.Default.setPositionY(plant, y);
    plant.setScale(scaleX, scaleY, scaleZ);
    make.Default.setObject3dCSProps(plant, json);
    if (callback) callback(plant);
    return plant;

}, {
        name: "植物",
        description: "植物描述",
        icon: getIdcIconPath('plant.png'),
        category: '动环模型',
        type: 'plant',
        modelDefaultParameters: {
            'width': {
                name: "宽",
                value: 30,
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            'height': {
                name: "高",
                value: 30,
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            'picture': {
                name: "贴图",
                value: 'plant.png',
                type: make.Default.PARAMETER_TYPE_IMAGE,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
        }
    });

make.Default.register('twaver.idc.plant3', function (json, callback) {
    var scale = json.scale || [1, 1, 1];
    var scaleX = scale[0],
        scaleY = scale[1],
        scaleZ = scale[2];
    var shadow = json.shadow;
    var translate = json.translate || [0, 0, 0];
    var x = translate[0],
        y = translate[1],
        z = translate[2];
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var w = 30;
    var h = 120;
    var pic = getIdcImagePath('plant2.png');

    var cylinderVase = new mono.Cylinder(w * 0.6, w * 0.4, h / 5, 20, 1, false, false);
    cylinderVase.s({
        'm.type': 'phong',
        'm.color': '#845527',
        'm.ambient': '#845527',
        'm.texture.repeat': new mono.Vec2(10, 4),
        'm.specularmap.image': getIdcImagePath('metal_normalmap.jpg'),
        'm.normalmap.image': getIdcImagePath('metal_normalmap.jpg'),
    });
    var cylinderHollow = cylinderVase.clone();
    cylinderHollow.setScale(0.9, 1, 0.9);
    var cylinderMud = cylinderHollow.clone();
    cylinderMud.setScale(0.9, 0.7, 0.9);
    cylinderMud.s({
        'm.type': 'phong',
        'm.color': '#163511',
        'm.ambient': '#163511',
        'm.texture.repeat': new mono.Vec2(10, 4),
        'm.specularmap.image': getIdcImagePath('metal_normalmap.jpg'),
        'm.normalmap.image': getIdcImagePath('metal_normalmap.jpg'),
    });
    var vase = new mono.ComboNode([cylinderVase, cylinderHollow, cylinderMud], ['-', '+']);
    var objects = [];
    objects.push(vase);
    var count = 5;
    for (var i = 0; i < count; i++) {
        var plant = new mono.Cube(w * 2, h, 0.01);

        plant.s({
            'm.visible': false,
            'm.alphaTest': 0.5,
            'front.m.visible': true,
            'front.m.texture.image': pic,
            'back.m.visible': true,
            'back.m.texture.image': pic,
        });
        plant.setParent(vase);
        plant.setPositionY(cylinderVase.getHeight() / 2 + plant.getHeight() / 2 - 3);
        plant.setRotationY(Math.PI * i / count);
        objects.push(plant);
    }
    var plants = new mono.ComboNode(objects);
    plants.setPosition(x, y, z);
    plants.setClient('type', 'plant');
    plants.setClient('showShadow', true);
    plants.setClient('shadowType', 1);
    plants.setClient('shadowRadius', w * 0.3);
    if (callback) callback(plants);
    return plants;
}, {
        name: "植物",
        description: "植物描述",
        icon: getIdcIconPath('plant3.png'),
        category: '动环模型',
        type: 'plant',
        modelDefaultParameters: {
            'width': {
                name: "宽",
                value: 30,
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            'height': {
                name: "高",
                value: 30,
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            'picture': {
                name: "贴图",
                value: 'plant.png',
                type: make.Default.PARAMETER_TYPE_IMAGE,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
        }
    });

/********************3d room models**************************/
make.Default.register('twaver.idc.tv', function (json, callback) {
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var edgeX = 4,
        edgeY = 2;
    var picture = getIdcImagePath(json.image);
    var rotate = json.rotate || [0, 0, 0];

    var parts = [{
        //tv body
        type: 'cube',
        width: 150,
        height: 80,
        depth: 5,
        rotate: rotate,
        op: '+',
        style: {
            'm.type': 'phong',
            'm.color': '#2D2F31',
            'm.ambient': '#2D2F31',
            'm.normalmap.image': make.Default.getImagePath('metal_normalmap.jpg'),
            'm.texture.repeat': new mono.Vec2(10, 6),
            'm.specularStrength': 20,
        },
    }, {
        //'tv cut off',
        type: 'cube',
        width: 130,
        height: 75,
        depth: 5,
        position: [0, edgeY, edgeX],
        rotate: rotate,
        op: '-',
        style: {
            'm.type': 'phong',
            'm.color': '#2D2F31',
            'm.ambient': '#2D2F31',
            'm.normalmap.image': make.Default.getImagePath('metal_normalmap.jpg'),
            'm.texture.repeat': new mono.Vec2(10, 6),
            'm.specularStrength': 100,
        },
    }, {
        //'tv screen',
        type: 'cube',
        width: 130,
        height: 75,
        depth: 1,
        position: [0, edgeY, 1.6],
        rotate: rotate,
        op: '+',
        style: {
            'm.type': 'phong',
            'm.specularStrength': 200,
            'front.m.texture.image': picture,
        },
    }];
    var tv = make.Default.createCombo(parts);
    tv.setPosition(x, y, z);
    tv.setClient('type', 'tv');
    return tv;
}, {
        name: "电视",
        description: "电视描述",
        icon: getIdcIconPath('tv.png'),
        category: '动环模型',
        type: 'tv',
        modelDefaultParameters: {
            'width': {
                name: "宽",
                value: 130,
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            'height': {
                name: "高",
                value: 75,
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            'image': {
                name: "贴图",
                value: 'tv.jpg',
                type: make.Default.PARAMETER_TYPE_IMAGE,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
        }
    });

make.Default.register('twaver.idc.post', function (json, callback) {
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var width = json.width,
        height = json.height;
    var pic = getIdcImagePath(json.image);
    var post = new mono.Cube(width, height, 0);
    post.s({
        'm.visible': false,
    });
    post.s({
        'm.texture.image': pic,
        'front.m.visible': true,
    });
    post.setPosition(x, 0, z);
    make.Default.setPositionY(post, y);
    post.setClient('type', 'post');
    make.Default.setObject3dCSProps(post, json);
    return post;
}, {
        name: "刷卡机",
        description: "刷卡机描述",
        icon: getIdcIconPath('post.png'),
        category: '动环模型',
        type: 'post',
        modelDefaultParameters: {
            'width': {
                name: "宽",
                value: 70,
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            'height': {
                name: "高",
                value: 120,
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            'image': {
                name: "贴图",
                value: 'post.jpg',
                type: make.Default.PARAMETER_TYPE_IMAGE,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
        }
    });

make.Default.register('twaver.idc.door_control', function (json) {
    var width = json.width,
        height = json.height,
        depth = json.depth;
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var cube = new mono.Cube(width, height, depth);
    var image = getIdcImagePath(json.image);
    cube.s({
        'left.m.visible': false,
        'right.m.visible': false,
        'top.m.visible': false,
        'bottom.m.visible': false,
        // 'm.transparent': true,
        'm.specularStrength': 50,
        'front.m.texture.image': image,
        'back.m.texture.image': image,
    });
    cube.setClient('type', 'door_control');
    cube.setPosition(x, 0, z);
    make.Default.setPositionY(cube, y);
    return cube;
}, {
        name: "控制门",
        description: "控制门描述",
        icon: getIdcIconPath('door_control.png'),
        category: '动环模型',
        type: 'control',
        modelDefaultParameters: {
            'width': {
                name: "宽",
                value: 10,
                type: "number",
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            'height': {
                name: "高",
                value: 20,
                type: "string",
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            'depth': {
                name: "深",
                value: 1,
                type: "number",
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            'image': {
                name: "贴图",
                value: 'lock.png',
                type: make.Default.PARAMETER_TYPE_IMAGE,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
        }
    });
// make.Default.copy('twaver.idc.ups18', 'twaver.idc.simpleRack', function(json, callback) {
//     json.image = getIdcImagePath('ups18_wrap.jpg');
// }, {
//     icon: getIdcIconPath('ups18.png')
// });
make.Default.register('twaver.idc.pipeline', function (json) {
    var color = json.color,
        radius = json.radius,
        image = getIdcImagePath(json.image);
    var repeat = json.repeat || 100;
    var path = new mono.Path();
    path.moveTo(-100, 0, 0);
    path.lineTo(100, 0, 0);
    var pathNode = new mono.PathNode({
        radius: radius,
        path: path,
    });

    pathNode._autoAdjust = true;

    pathNode.s({
        'm.type': 'phong',
        'm.color': color,
        'm.ambient': color,
    });
    if (image) {
        pathNode.s({
            'm.texture.image': image,
            'm.texture.repeat': new mono.Vec2(repeat, 1),
        });
    }
    return pathNode;
}, {
        category: "动环模型",
        type: "mono.Element",
        icon: getIdcIconPath('pipeline.png'),
        modelDefaultParameters: {
            color: {
                name: "颜色",
                value: "cyan",
                type: make.Default.PARAMETER_TYPE_STRING,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            radius: {
                value: 2,
                name: "半径",
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            'image': {
                name: "贴图",
                value: 'flow.jpg',
                type: make.Default.PARAMETER_TYPE_IMAGE,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
        }
    });

make.Default.register('twaver.idc.water_leaking_sign', function (json) {
    var radius = json.radius;
    image = getIdcImagePath(json.image);
    var sign = new mono.Billboard();
    sign.s({
        'm.texture.image': image,
        'm.vertical': true,
        'm.depthMask': false,
    });
    sign.setScale(100, 200, 1);
    sign.setPosition(0, 93, 0);

    var ball = new mono.Sphere(radius);
    ball.s({
        'm.transparent': true,
        'm.opacity': 0.8,
        'm.type': 'phong',
        'm.color': '#58FAD0',
        'm.ambient': '#81BEF7',
        'm.specularStrength': 50,
        'm.normalmap.image': make.Default.getImagePath('metal_normalmap2.jpg'),
    });
    ball.setScale(2, .2, 2);

    var root = new mono.Cube(0.1, 1, 0.1);
    sign.setParent(root);
    ball.setParent(root);
    make.Default.setObject3dCommonProps(root,json);
    return root;
}, {
        category: "动环模型",
        type: "mono.Element",
        icon: getIdcIconPath('sign.png'),
        modelDefaultParameters: {
            radius: {
                value: 30,
                name: "半径",
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            image: {
                name: "贴图",
                value: 'alert.png',
                type: make.Default.PARAMETER_TYPE_IMAGE,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
        }
    });

make.Default.copy('twaver.idc.ups18', 'twaver.idc.simpleRack', function (json, callback) {
    json.image = getIdcImagePath('ups18_wrap.jpg');
}, {
        icon: getIdcIconPath('ups18.png')
    });
make.Default.copy('twaver.idc.pdc24', 'twaver.idc.simpleRack', function (json, callback) {
    json.image = getIdcImagePath('pdc24_wrap.jpg');
}, {
        icon: getIdcIconPath('pdc24.png')
    });
make.Default.copy('twaver.idc.pdc25', 'twaver.idc.simpleRack', function (json, callback) {
    json.image = getIdcImagePath('pdc25_wrap.jpg');
}, {
        icon: getIdcIconPath('pdc25.png')
    });
make.Default.copy('twaver.idc.simpleRack3', 'twaver.idc.simpleRack', function (json, callback) {
    json.image = getIdcImagePath('srack-2.jpg');
}, {
        icon: getIdcIconPath('rack3.png')
    });

make.Default.copy('twaver.idc.airCondition3', 'twaver.idc.airCondition', function (json, callback) {
    json.sideImage = getIdcImagePath('a1sair.jpg');
    json.frontImage = getIdcImagePath('a1fair.jpg');
    json.backImage = getIdcImagePath('a1bair.jpg');
    json.topImage = getIdcImagePath('a1tair.jpg');
}, {
        icon: getIdcIconPath('airCondition3.png')
    });

var getAirCondition4Parameters = function (width, height, depth, image) {
    var result = getBasicParameters(width, height, depth);
    var params = {
        'image': {
            name: "空调贴图",
            value: image || 'air-condition-wrap.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        }
    };
    make.Default.copyProperties(params, result);
    return result;
}

make.Default.register('twaver.idc.airCondition4', function (json, callback) {
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var width = json.width;
    var height = json.height;
    var depth = json.depth;
    var image = getIdcImagePath(json.image);

    var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];

    var source = new mono.Cube(width, height, depth);
    source.s({
        'm.type': 'phong',
        'm.color': '#557E7A',
        'm.specular': '#ffffff',
        'm.specularStrength': 3,
        'm.specularmap.image': make.Default.getImagePath('outside_lightmap.jpg'),
        'm.texture.image': image,
        'front.m.envmap.image': make.Default.getEnvMap('envmap1'),
        'm.reflectRatio': 0.2,
    });
    source.setWrapMode('six-each');
    source.setPosition(x, 0, z);
    source.setRotation(rotation[0], rotation[1], rotation[2]);
    make.Default.setPositionY(source, y);
    make.Default.setObject3dCSProps(source, json);
    source.setClient('type', 'airCondition');
    source.setClient('showShadow', true);
    if (callback) callback(source);
    return source;
}, {
        name: "行级空调",
        description: "行级精密空调是机房中用于散热，排风的模块，保证机房的恒温恒湿。支持修改长，宽，高基本参数",
        icon: getIdcIconPath('airCondition.png'),
        category: '机柜模型',
        type: 'airCondition',
        modelDefaultParameters: getAirCondition4Parameters(30, 200, 120),
    });

var getAirConditionImagePath = function (image) {
    return make.Default.path + 'model/idc/images/aircondition/' + image;
}

make.Default.copy('twaver.idc.airCondition17', 'twaver.idc.airCondition4', function (json, callback) {
    json.image = getAirConditionImagePath('ac17/air_condition_wrap.jpg');
}, {
        icon: getIdcIconPath('airCondition17.png')
    });

var getAirCondition19Parameters = function (width, height, depth) {
    var result = getBasicParameters(width, height, depth);
    var params = {
        'backImage': {
            name: "背面贴图",
            value: 'ac19/ac_back.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'sideImage': {
            name: "侧面贴图",
            value: 'ac19/ac_side.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'topImage': {
            name: "顶部贴图",
            value: 'ac19/ac_top.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'frontImage': {
            name: "正面贴图",
            value: 'ac19/ac_front.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'frontDoorImage': {
            name: "门正面贴图",
            value: 'ac19/ac_door_front.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'backDoorImage': {
            name: "门背面贴图",
            value: 'ac19/ac_door_back.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'doorAngle': {
            name: "门旋转角度",
            value: -135,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'rotationFrontDoor': {
            name: "门旋转方向",
            value: 'right',
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'doorColor': {
            name: "门边框颜色",
            value: '#6f6f6f',
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        }
    };
    make.Default.copyProperties(params, result);
    return result;
}

make.Default.register('twaver.idc.airCondition19', function (json, callback) {
    json = json || {};
    json.client = json.client || {};
    json.style = json.style || {};
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];
    var width = json.width;
    var height = json.height;
    var depth = json.depth;
    var backImage = getAirConditionImagePath(json.backImage);
    var sideImage = getAirConditionImagePath(json.sideImage);
    var topImage = getAirConditionImagePath(json.topImage);
    var frontPic = getAirConditionImagePath(json.frontImage);
    var doorAngle = json.doorAngle;
    var rotationFrontDoor = json.rotationFrontDoor;

    var frontAnimationLeft = doorAngle && 'rotation:left:{}:1000:0:bounceOut'.format(-doorAngle || '135');
    var frontAnimationRight = doorAngle && 'rotation:right:{}:1000:0:bounceOut'.format(doorAngle || '-135');

    var BackAnimationLeft = doorAngle && 'rotation:right:{}:1000:0:bounceOut'.format(-doorAngle || '135');
    var BackAnimationRight = doorAngle && 'rotation:left:{}:1000:0:bounceOut'.format(doorAngle || '135');

    var evnmap = make.Default.getEnvMap(json.evnmap || 'envmap1');
    var reflectRatio = json.reflectRatio;

    var doorFrontPic = getAirConditionImagePath(json.frontDoorImage);
    var doorBackPic = getAirConditionImagePath(json.backDoorImage);
    var doorTransparent = json.doorTransparent || false;
    var doorColor = json.doorColor || 'white';
    var doorDepth = 2;

    var ac = new mono.Cube(width, height, depth - doorDepth);
    ac.s({
        'm.color': '#666666',
        'm.ambient': '#ffffff',
        'm.specular': '#e5e5e5',
        'm.type': 'phong',
        'm.specularStrength': 3,
        'left.m.texture.image': sideImage,
        'right.m.texture.image': sideImage,
        'top.m.texture.image': topImage,
        'bottom.m.texture.image': topImage,
        'back.m.texture.image': backImage,
        'front.m.texture.image': frontPic,
        'front.m.specularStrength': 2,
    });

    var door = new mono.Cube(width, height, doorDepth);
    door.s({
        'm.type': 'phong',
        'm.transparent': doorTransparent,
        'front.m.texture.image': doorFrontPic,
        'back.m.texture.image': doorBackPic,
        'm.envmap.image': evnmap,
        'm.reflectRatio': 0.5,
        'm.color': doorColor,
        'm.ambient': doorColor,
        'front.m.color': 'white',
        'back.m.color': 'white',
        'front.m.ambient': 'white',
        'back.m.ambient': 'white',
    });
    door.setParent(ac);
    if (rotationFrontDoor == 'left') {
        door.setClient('animation', frontAnimationLeft);
    } else {
        door.setClient('animation', frontAnimationRight);
    }
    door.setClient('type', 'door');
    door.setClient('inbuilt', true);
    door.setPosition(0, 0, depth / 2);
    ac.door = door;

    ac.setPosition(x, 0, z);
    make.Default.setPositionY(ac, y);
    ac.setClient('type', 'airCondition');
    ac.setClient('showShadow', true);
    ac.setRotation(rotation[0], rotation[1], rotation[2]);
    make.Default.setObject3dCSProps(ac, json);
    if (callback) callback(ac);
    return ac;
}, {
        name: "列间空调",
        category: "空调模型",
        description: "列间",
        icon: getIdcIconPath('airCondition19.png'),
        type: 'airCondition',
        modelDefaultParameters: getAirCondition19Parameters(30, 200, 100),
    });

make.Default.copy('twaver.idc.simpleAirCondition19', 'twaver.idc.airCondition4', function (json, callback) {
    json.image = getAirConditionImagePath('ac19/ac_wrap.jpg');
}, {
        icon: getIdcIconPath('airCondition19.png'),
        modelDefaultParameters: getAirCondition4Parameters(30, 200, 100),
    });

var getPdc29Paramenters = function () {
    var result = getAirCondition19Parameters(60, 200, 80);
    result.backImage.value = "../pdc/pdc29/pdc_back.jpg";
    result.sideImage.value = "../pdc/pdc29/pdc_side.jpg";
    result.topImage.value = "../pdc/pdc29/pdc_top.jpg";
    result.frontImage.value = "../pdc/pdc29/pdc_front.jpg";
    result.frontDoorImage.value = "../pdc/pdc29/pdc_door_front.jpg";
    result.backDoorImage.value = "../pdc/pdc29/pdc_door_back.jpg";
    return result;
}

var getPdcImagePath = function (image) {
    return make.Default.path + 'model/idc/images/pdc/' + image;
}

make.Default.copy('twaver.idc.pdc29', 'twaver.idc.airCondition19', function (json, callback) { }, {
    name: "配电柜",
    category: "配电柜模型",
    description: "配电柜模型",
    icon: getIdcIconPath('airCondition19.png'),
    type: 'pdc',
    modelDefaultParameters: getPdc29Paramenters(),
});

make.Default.copy('twaver.idc.simplePdc29', 'twaver.idc.airCondition4', function (json, callback) {
    json.image = getAirConditionImagePath('../pdc/pdc29/pdc_wrap.jpg');
}, {
        icon: getIdcIconPath('pdc29.png'),
        modelDefaultParameters: getPdc29Paramenters()
    });

make.Default.copy('twaver.idc.headerRack4', 'twaver.idc.headerRack', function (json, callback) {
    json.id = 'twaver.idc.headerRack';
    json.sideImage = getIdcImagePath('h1shead.jpg');
    json.frontImage = getIdcImagePath('h1fhead.jpg');
    json.backImage = getIdcImagePath('h1bhead.jpg');
    json.topImage = getIdcImagePath('h1thead.jpg');
}, {
        icon: getIdcIconPath('headerRack4.png')
    });


make.Default.registerObj('twaver.idc.jiankongshi', 'jiankongshi', './model/idc/obj/jiankongshi/', {}, true);

make.Default.register('twaver.idc.bigScreen', function (json, callback) {
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var picture = getIdcImagePath(json.image);
    var rotation = json.rotation || [0, 0, 0];
    var width = json.width,
        height = json.height,
        depth = json.depth;
    var screen = new mono.Cube(width, height, depth);
    screen.s({
        'top.m.color': 'gray',
        'top.m.ambient': 'gray',
        'left.m.color': 'gray',
        'left.m.ambient': 'gray',
        'right.m.color': 'gray',
        'right.m.ambient': 'gray',
        'm.type': 'phong',
        'front.m.texture.image': picture,
    });
    if (callback) callback(screen);
    return screen;
}, {
        category: "动环模型",
        type: "mono.Element",
        icon: getIdcIconPath('bigScreen.png'),
        modelDefaultParameters: {
            width: {
                type: "number",
                value: 700,
                name: "宽"
            },
            height: {
                type: "number",
                value: 200,
                name: "高"
            },
            depth: {
                type: "number",
                value: 10,
                name: "深"
            },
            image: {
                type: "image",
                value: 'screen.jpg',
                name: "image"
            }
        }
    });

make.Default.registerObj('twaver.idc.bigScreen2', 'pingmu', './model/idc/obj/pingmu/', {
    category: "动环模型",
    type: "mono.Element",
    icon: getIdcIconPath('bigScreen2.png'),
});

make.Default.register('twaver.idc.postFlag', function (json) {
    var color = json.color || '#094bc7'; //#e2001f红
    var parts = [{
        //flagstaff.
        type: 'cube',
        width: 5,
        height: 300,
        depth: 5,
        op: '+',
        position: [0, 0, 0],
        style: {
            'm.type': 'phong',
            'm.specularStrength': 50,
            'm.color': color,
            'm.ambient': color
        }
    }, {
        //flag.
        type: 'cube',
        width: 150,
        height: 100,
        depth: 2,
        op: '+',
        position: [75, 100, 0],
        style: {
            'm.type': 'phong',
            'm.specularStrength': 50,
            'm.color': color,
            'm.ambient': color,
            'front.m.texture.image': getIdcImagePath('postPeople.png'),
            'back.m.texture.image': getIdcImagePath('postPeople.png'),
        }
    }];
    return make.Default.createCombo(parts);
}, {
        category: "动环模型",
        type: "post",
        name: "岗位旗",
        icon: getIdcIconPath('postFlag.png'),
        description: "岗位旗",
        sdkCategory: 'post',
    });

make.Default.register('twaver.idc.PUEBoard', function (json) {
    var w = json.width || 110,
        h = json.height || 220,
        d = 2,
        value = json.value || '0.00';
    var cube = new mono.Cube(w, h, d),
        color = json.color || 'green';
    var canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    cube.s({
        'm.visible': false,
        'front.m.visible': true,
        'front.m.texture.image': canvas,
        'm.type': 'basic',
    });
    var p = { text: json.text || '', color: color };
    cube.setClient('update', function (param) {
        createTextImage(param);
        cube.invalidateTexture();
    });
    createTextImage(p)
    cube.invalidateTexture();

    function createTextImage(json) {
        var text = json.text,
            color = json.color;
        //value = json.value;

        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.fillStyle = '#303030';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = color;
        ctx.lineWidth = 10;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        var font = '30px Dialog';
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        var x = canvas.width / 2;
        var lines = text.split('\n'),
            lineCount = lines.length;
        var y = 100;
        for (var i = 0; i < lineCount; i++) {
            var height = mono.Utils.getTextSize(font, lines[i]).height;
            y = y + i * height - 5
            ctx.fillText(lines[i], x, y);
        }
        ctx.strokeStyle = color;
        ctx.font = '66px Dialog';
        ctx.fillText('PUE值', x, y += 70);
        ctx.font = '96px Dialog';
        ctx.fillText(value, x, y += 80);
        // window.open(canvas.toDataURL());
        return canvas;
    }

    return cube;
}, {
        category: "动环模型",
        type: "PUE",
        name: "PUE板",
        icon: getIdcIconPath('PUEBoard.png'),
        description: "PUE板",
        sdkCategory: 'PUE',
    });

var getAirFloorParameters = function () {
    var result = getBasicParameters(60, 2, 60);
    result.image = {
        value: 'airFloor.jpg',
        name: "贴图",
        type: make.Default.PARAMETER_TYPE_IMAGE,
        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
    }
    return result;
}

make.Default.register('twaver.idc.airFloor', function (json, callback) {
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var image = getIdcImagePath(json.image);
    var rotation = json.rotation || [0, 0, 0];
    var width = json.width,
        height = json.height,
        depth = json.depth;
    var floor = new mono.Cube(width, height, depth);
    floor.s({
        'm.color': '#EEE9E0',
        'm.ambient': '#EEE9E0',
        'top.m.texture.image': image,
        'm.texture.anisotropy': 16
    });
    floor.setPosition(x, 0, z);
    floor.setRotation(rotation[0], rotation[1], rotation[2]);
    make.Default.setPositionY(floor, y);
    make.Default.setObject3dCSProps(floor, json);
    floor.setClient('type', 'airFloor');
    if (callback) callback(floor);
    return floor;
}, {
        name: "空气板",
        category: "房间模型",
        description: "空气板描述",
        type: "mono.Element",
        icon: getIdcIconPath('airFloor.png'),
        modelDefaultParameters: getAirFloorParameters()
    });

make.Default.registerObj('twaver.idc.shelf', 'jiaodian2', './model/idc/obj/jiaodian/', {
    name: "机柜架子",
    description: "机柜架子描述",
    icon: getIdcIconPath('shelf.png'),
    category: '机柜模型',
    type: 'shelf',
    modelDefaultParameters: {}
});

make.Default.registerObj('twaver.idc.stair2', 'louti', './model/idc/obj/louti2/', {
    name: "楼梯",
    description: "楼梯描述",
    icon: getIdcIconPath('stair2.png'),
    category: '动环模型',
    type: 'fire',
    modelDefaultParameters: {}
}, true);

make.Default.registerObj('twaver.idc.tvShelf', 'dianshijijiazi', './model/idc/obj/dianshijijiazi/', {
    name: "电视机架子",
    description: "电视机架子描述",
    icon: getIdcIconPath('tvShelf.png'),
    category: '机柜模型',
    type: 'tvShelf',
    modelDefaultParameters: {}
}, true);

make.Default.registerObj('twaver.idc.heatExchanger', 'huanreqi', './model/idc/obj/huanreqi/', {
    name: "换热器架子",
    description: "换热器描述",
    icon: getIdcIconPath('heatExchanger.png'),
    category: '机柜模型',
    type: 'yangan',
    modelDefaultParameters: {}
});

make.Default.register('twaver.idc.line', function (json, callback) {
    var position = json.position || [0, 0, 0];
    var color = json.color || '#B45F04';
    var image = getIdcImagePath(json.image);
    var lineJson = {
        type: 'pathNode',
        data: json.data,
        pathImage: image,
        pathWidth: json.pathWidth || 4,
        pathHeight: json.pathHeight || 2,
        repeat: 15,
        style: {
            'm.type': 'phong',
            'm.side': 'both',
            'm.polygonOffset': true,
            // 'm.polygonOffsetFactor': 16,
            // 'm.polygonOffsetUnits': 3,
        },
        client: {
            type: 'line',
        }
    };

    var line = make.Default.createCombo(lineJson);
    line.setPosition(position[0], position[1], position[2]);
    if (callback) callback(line);
    return line;
}, {
        name: "警示线",
        description: "警示线描述",
        icon: getIdcIconPath('line.png'),
        category: '动环模型',
        sdkCategory: 'floor-child',
        type: 'watercable',
        modelDefaultParameters: {
            color: {
                name: '颜色',
                value: 'white',
                type: make.Default.PARAMETER_TYPE_COLOR,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            image: {
                name: '贴图',
                value: 'line.jpg',
                type: make.Default.PARAMETER_TYPE_IMAGE,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            },
            data: {
                name: '点位置',
                value: '',
                type: make.Default.PARAMETER_TYPE_ARRAY_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
            }
        }
    });

make.Default.register('twaver.idc.stair3', function (json, callback) {
    var level = json.level || 3;
    var levelHeight = json.height || 12;
    var stairWidth = json.stairWidth || 20;
    var stairDepth = json.stairDepth || 80;
    var statirs = [];

    for (var i = 1; i <= level; i++) {
        var cube = new mono.Cube(stairWidth, levelHeight * i, stairDepth);
        cube.s({
            'm.type': 'phong',
            'm.texture.image': getIdcImagePath('stair.jpg'),
        });
        cube.setWrapMode('six-each');
        cube.setPosition(stairWidth * (i - 1), levelHeight * i / 2, 0);
        statirs.push(cube);
        console.log(cube, cube.getWidth(), cube.getHeight(), cube.getDepth());
    }
    var stair = new mono.ComboNode(statirs);
    if (callback) callback(stair);
    return stair;
}, {
        name: "楼梯",
        description: "楼梯描述",
        icon: getIdcIconPath('stair3.png'),
        category: '动环模型',
        type: 'fire',
        modelDefaultParameters: {}
    });

// 虚拟机
make.Default.register('twaver.idc.virtualDevice', function (json, callback) {
    var outsideWidth = json.outsideWidth || 20;
    var insideWidth = json.insideWidth || 18;

    var cubeP = new mono.Cube(outsideWidth, outsideWidth, outsideWidth, 1, 1, 1, 'six-each');
    cubeP.s({
        'm.type': 'phong',
        'm.transparent': true,
        'm.texture.wrapS': mono.ClampToEdgeWrapping,
        'm.texture.wrapT': mono.ClampToEdgeWrapping,
        'm.texture.image': getIdcImagePath('vd_outline_cube.png')
    });
    var cube = new mono.Cube(insideWidth, insideWidth, insideWidth, 1, 1, 1, 'six-each');
    cube.s({
        'm.type': 'phong',
        'm.transparent': false,
        'm.texture.wrapS': mono.ClampToEdgeWrapping,
        'm.texture.wrapT': mono.ClampToEdgeWrapping,
        'm.texture.image': getIdcImagePath('vd_inline_cube.png')
    });
    cube.setParent(cubeP);
    if (callback) {
        callback(cubeP);
    }
    return cubeP;
});

var getAirBoxParameters = function () {
    var result = getBasicParameters(21, 14, 2);
    var params = {
        'image': {
            name: "贴图",
            value: 'airBox.jpg',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        }
    };
    make.Default.copyProperties(params, result);
    return result;
}

//空气开关盒
make.Default.register('twaver.idc.airBox', function (json, callback) {
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var width = json.width;
    var height = json.height;
    var depth = json.depth;
    var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];
    var image = getIdcImagePath(json.image);

    var airBox;
    if (json.objectId) {
        airBox = new mono.Cube({
            'id': json.objectId,
            'width': width,
            'height': height,
            'depth': depth
        });
    } else {
        airBox = new mono.Cube(width, height, depth);
    }
    airBox.s({
        'm.type': 'phong',
        'm.specularStrength': 2,
        'front.m.texture.image': image,
        'm.color': '#e0e0e0',
    });
    airBox.p(x, 0, z);
    airBox.setRotation(rotation[0], rotation[1], rotation[2]);
    make.Default.setPositionY(airBox, y);
    airBox.setClient('type', 'airBox');
    make.Default.setObject3dCSProps(airBox, json);
    if (callback) callback(airBox);
    return airBox;
}, {
        name: "空气开关盒",
        description: "空气开关盒",
        icon: getIdcIconPath('airBox.png'),
        category: '其他模型',
        type: 'airBox',
        modelDefaultParameters: getAirBoxParameters(),
    });

make.Default.copy('twaver.idc.kaiguangui', 'twaver.idc.simpleRack', function (json, callback) {
    json.width = 60;
    json.height = 42;
    json.depth = 40;
    json.doorColor = '#6c6c6e'
    json.image = getIdcImagePath('rack_wrap.jpg');
}, {
        icon: getIdcIconPath('kaiguangui.png'),
    });

make.Default.copy('twaver.idc.rack13', 'twaver.idc.simpleRack', function (json, callback) {
    json.width = 60;
    json.height = 42;
    json.depth = 35;
    json.image = getRackImagePath("/rack13/rack_wrap.jpg");
}, {
        icon: getIdcIconPath('rack13.png'),
    });

make.Default.copy('twaver.idc.rack14', 'twaver.idc.simpleRack', function (json, callback) {
    json.width = 60;
    json.height = 42;
    json.depth = 30;
    json.image = getRackImagePath("/rack13/rack_wrap.jpg");
}, {
        icon: getIdcIconPath('rack13.png'),
    });

make.Default.copy('twaver.idc.seat', 'twaver.cube', {}, {
    name: '机柜位置',
    icon: getIdcIconPath('simpleRack2.png'),
}, {
        defaultValue: {
            width: 60,
            height: 5,
            depth: 60,
            color: '#888888',
        }
    });

var getLinkParameters = function () {
    var basicParams = getPRParameters();
    var result = {
        "startPoint": {
            name: "起始点",
            value: [0, 0, 0],
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        "endPoint": {
            name: "结束点",
            value: [100, 100, 100],
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        "color": {
            name: "颜色",
            value: '#EA7D00',
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        "radius": {
            name: "半径",
            value: 1,
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        }
    };
    make.Default.copyProperties(basicParams, result);
    return result;
}

make.Default.register('twaver.idc.curveLink', function (json, callback) {
    var startPoint = json.startPoint;
    var endPoint = json.endPoint;
    var color = json.color;
    var radius = json.radius;
    var isTop = json.isTop === undefined ? true : json.isTop;
    var offset = json.offset;
    var xOffset = json.xOffset || 0;
    var offsetScale = json.offsetScale || 1;
    var s_x = startPoint[0],
        s_y = startPoint[1],
        s_z = startPoint[2],
        e_x = endPoint[0],
        e_y = endPoint[1],
        e_z = endPoint[2];
    var path = new mono.Path();
    var ax = (s_x + e_x) / 2,
        ay = (s_y + e_y) / 2,
        az = (s_z + e_z) / 2;
    if (!offset) {
        var offset = Math.sqrt((s_x - e_x) * (s_x - e_x) + (s_y - e_y) * (s_y - e_y) + (s_z - e_z) * (s_z - e_z));
        offset = isTop ? offset : -offset;
    }
    offset *= offsetScale;

    path.moveTo(s_x, s_y, s_z);
    path.curveTo(ax + xOffset, ay + offset, az, e_x, e_y, e_z);
    path.lineTo(e_x, e_y, e_z);
    var pathNode = new mono.PathNode({
        path: path,
        radius: radius,
    });
    pathNode.s({
        'm.color': color,
        'm.ambient': color
    });
    make.Default.setObject3dCommonProps(pathNode, json);
    if (callback) callback(pathNode);
    return pathNode;
}, {
        name: "链路",
        description: "链路",
        icon: getIdcIconPath('airBox.png'),
        category: '其他模型',
        type: 'link',
        modelDefaultParameters: getLinkParameters(),
    });

make.Default.register('twaver.idc.curveLink2', function (json, callback) {
    var points = json.points;
    var color = json.color;
    var radius = json.radius;
    var isTop = json.isTop === undefined ? true : json.isTop;
    var offset = json.offset;
    var xOffset = json.xOffset || 0;
    var offsetScale = json.offsetScale || 1;
    var path = new mono.Path();
    for (var i = 0; i < points.length - 1; i++) {
        var s_x = points[i][0],
            s_y = points[i][1],
            s_z = points[i][2],
            e_x = points[i + 1][0],
            e_y = points[i + 1][1],
            e_z = points[i + 1][2];
        var ax = (s_x + e_x) / 2,
            ay = (s_y + e_y) / 2,
            az = (s_z + e_z) / 2;
        if (!offset) {
            var offset = Math.sqrt((s_x - e_x) * (s_x - e_x) + (s_y - e_y) * (s_y - e_y) + (s_z - e_z) * (s_z - e_z));
            offset = isTop ? offset : -offset;
        }
        offset *= offsetScale;
        path.moveTo(s_x, s_y, s_z);
        path.curveTo(ax + xOffset, ay + offset, az, e_x, e_y, e_z);
        path.lineTo(e_x, e_y, e_z);
    }
    var pathNode = new mono.PathNode({
        path: path,
        radius: radius,
    });
    pathNode.s({
        'm.color': color,
        'm.ambient': color
    });
    make.Default.setObject3dCommonProps(pathNode, json);
    if (callback) callback(pathNode);
    return pathNode;
}, {
        name: "链路",
        description: "链路",
        icon: getIdcIconPath('airBox.png'),
        category: '其他模型',
        type: 'link',
        modelDefaultParameters: getLinkParameters(),
    });


var getWrapImagePath = function (image) {
    if (!image) return;
    if (image.indexOf('base64') >= 0) {
        return image;
    }
    return make.Default.path + 'model/idc/images/wrap/' + image;
}

var getWrapModelDefaultParameters = function (model) {
    var result = getBasicParameters(model.width, model.height, model.depth);
    result.image = {
        name: "贴图",
        value: model.image || (model.id + '/wrap.jpg'),
        type: make.Default.PARAMETER_TYPE_IMAGE,
        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
    }
    result.path = {
        name: "图片路径",
        value: model.path,
        type: make.Default.PARAMETER_TYPE_STRING,
        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
    }
    return result;
}

var getWrapModelParameters = function (model) {
    return {
        name: model.name,
        description: model.description,
        icon: getIdcIconPath(model.id + '.png'),
        category: model.category,
        type: model.type,
        modelDefaultParameters: getWrapModelDefaultParameters(model)
    }
}

make.Default.register('twaver.idc.wrapModel', function (json, callback) {
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var width = json.width;
    var height = json.height;
    var depth = json.depth;
    var showShadow = json.showShadow;
    if (showShadow != false) {
        showShadow = true;
    }
    var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];
    var pic = getWrapImagePath(json.image);
    if (json.path) {
        pic = json.path + "/wrap.jpg";
    }

    var cube;
    if (json.objectId) {
        cube = new mono.Cube({
            'id': json.objectId,
            'width': width,
            'height': height,
            'depth': depth
        });
    } else {
        cube = new mono.Cube(width, height, depth);
    }
    cube.s({
        //'m.type': 'phong',
        'm.specularStrength': 2,
        'm.texture.image': pic,
        'm.texture.anisotropy': 16,
    });
    cube.setWrapMode('six-each');
    cube.p(x, 0, z);
    cube.setRotation(rotation[0], rotation[1], rotation[2]);
    make.Default.setPositionY(cube, y);
    cube.setClient('type', json.type);
    cube.setClient('showShadow', showShadow);
    make.Default.setObject3dCSProps(cube, json);
    if (callback) callback(cube);
    return cube;
}, {});


make.Default.register("twaver.idc.device", function (json, callback) {
    var self = make.Default;
    json.name = json.type;
    if (self._objObject[json.name]) {
        return self.cloneObjElement(json, callback);
    } else {
        if (!self._objMap[json.name] || self._objMap[json.name].length < 1) {
            self._objMap[json.name] = [];
            var height = json.height;
            json.uNumber = height + "u";
            var obj = getIdcObjPath(json.uNumber) + "/zhongjian.obj";
            var mtl = getIdcObjPath(json.uNumber) + "/zhongjian.mtl";
            var loader = new mono.OBJMTLLoader();
            loader.load(obj, mtl, null, function (object) {
                object = mono.Utils.mergeElements(object.getDescendants());
                object.getDescendants().forEach(function (descendant) {
                    if (descendant._name) descendant.setClient('oid', descendant._name);
                });
                var bbox = object.getBoundingBox(),
                    size = bbox.size();
                var frontCube = new mono.Cube(50, 4.45 * height, 1),
                    backCube = new mono.Cube(45, 4.45 * height, 0.1);
                frontCube.setParent(object);
                backCube.setParent(object);
                frontCube.setPositionZ(bbox.max.z + 0.5);
                backCube.setPositionZ(bbox.min.z - 0.05);
                //右左上下前后
                frontCube.setStyle('m.color', ['#777975', '#777975', '#b3b5b0', '#b3b5b0', '', '#636462']);
                frontCube.setStyle('front.m.texture.image', json.frontImage);
                backCube.setStyle('m.color', '#636462');
                backCube.setStyle('back.m.texture.image', json.backImage);
                var objs = object.getDescendants();
                objs.push(object);
                object = mono.Utils.mergeElements(objs);
                self._objObject[json.name] = object;
                self._objMap[json.name].forEach(function (j) {
                    return self.cloneObjElement(j.json, j.callback);
                });
            });
        }
        self._objMap[json.name].push({ json: json, callback: callback });
    }
}, { async: true });

/*
var registerWrapModel = function(model) {
    make.Default.copy('twaver.idc.' + model.id, 'twaver.idc.wrapModel', {}, getWrapModelParameters(model));
}

for (var i = 0; i < idcWrapImageModels.length; i++) {
    registerWrapModel(idcWrapImageModels[i]);
}*/
/**
 * 面板的2d 和 3d 模型定义都放在这里
 *
 * modelDefaultParameters 格式说明
 {
    id: {
        name: 'name', //属性名称
        value: 'value', //属性值
        valueType: 'string',//属性值类型  //PROPERTY_VALUE_TYPE: 'string', // 'string', 'boolean', 'color', 'int', 'number'
        propertyType: 'client', //属性类型 //PROPERTY_PROPERTY_TYPE: 'accessor', // 'field', 'accessor', 'style', 'client'
        editable:true, //是否可以编辑
        category:'Detail' //属性类别
    }
}
 */

var getIdcIconPath = function (icon) {
    if (icon.indexOf('/') > 0) {
        return icon;
    }
    return make.Default.path + 'model/idc/icons/dk/' + icon;
}

var getIdcSVGPath = function (image) {
    if (image.indexOf('/') > 0) {
        return image;
    }
    if (image.length > 4 && image.lastIndexOf('.svg') == image.length - 4) {
        return make.Default.path + 'model/idc/svg/' + image;
    } else {
        return make.Default.path + 'model/idc/svg/' + image + '.svg';
    }
}

var idcLayer = {
    'wall': 100,
    'area': 200,
    'innerWall': 300,
    'wallChild': 400,
    'innerWallChild': 500,
    'channel': 600,
    'rack': 700,
    'default': 800
}

/**************   deviceEditor begin ****************/

/**
 * ai默认是72分辨率,1PT = 1/72英寸 = 1/72 * 25.4 mm = 0.3528mm  所以要处以比例系数
 * 10 换算成mm
 * 0.35277778 比例系数
 */

/**
 * 背板参数
 * @param args
 * @returns {{name: *, modelDefaultParameters: {width: {name: string, value: number, type: string, propertyType: string}, height: {name: string, value: number, type: string, propertyType: string}}, category: string, icon, host: boolean}}
 */
var getServerBackPanelParams = function (args) {
    return {
        name: args.label,
        modelDefaultParameters: {
            width: {
                name: "宽度",
                value: args.relWidth || (make.Default.getEquipmentWidth()) * 10, //换算成mm
                type: make.Default.PARAMETER_TYPE_INT,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR
            },
            height: {
                name: "高度",
                value: args.relHeight || (make.Default.getEquipmentHeight(args.size || 1)) * 10, //换算成mm
                type: make.Default.PARAMETER_TYPE_INT,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR
            }
        },
        category: '面板背板',
        icon: getIdcIconPath(args.label + '.png'),
        host: true,
    }
}

var get3dServerBackPanelParams = function (args) {
    var result = {};
    var params = getServerBackPanelParams(args);
    make.Default.copyProperties(params, result);
    result.category = '3d面板背板';
    return result;
}


/**
 * 注册背板模型
 * @param name
 * @param args
 */
var registerServerBackPanel = function (name, args) {

    var id = 'twaver.idc.' + name + '.panel';
    make.Default.register(id, function (json) {

        make.Default.copyProperties({
            imageUrl: getIdcSVGPath(name),
            client: {
                category: 'networkDevice-panel',
                host: true,
                editable: true,
                size: args.size,
            }
        }, json);
        var follower = make.Default.createFollower(json);
        return follower;
    }, getServerBackPanelParams(args));
}

make.Default.PanelBackDepth = 10;
make.Default.PanelCompDepth = 10;

/**
 * 注册3D背板
 * @param name
 * @param args
 */
var registerServerBackPanel3D = function (name, args) {

    var id = 'twaver.idc.' + name + '.panel.3d';
    make.Default.register(id, function (json, callback) {

        make.Default.copyProperties({
            color: 'gray',
            depth: make.Default.PanelBackDepth,
            frontImage: getIdcSVGPath(name),
            style: {
                'front.m.color': 'white',
                'front.m.ambient': 'white'
            }
        }, json);
        make.Default.copyProperties(args, json);
        json.width /= 10, json.height /= 10, json.depth /= 10;
        var cube = make.Default.createCube(json);
        if (json.objectId) {
            cube._id = json.objectId;
        }
        var position = json.position || [0, 0, 0];
        json.position = [position[0] / 10, position[1] / 10, position[2] / 10];
        make.Default.setObject3dCommonProps(cube, json);
        callback && callback(cube);
        return cube;
    }, get3dServerBackPanelParams(args));
}

/**
 * 所有背板列表
 * @type {{hw_s2700: {label: string, height: number}, hw_s3700: {label: string, height: number}, cisco_2950: {label: string, height: number}, cisco_2960: {label: string, height: number}, h3c_s1050t: {label: string, height: number}, h3c_s1224: {label: string, height: number}, hw_rh2288_v3_front: {label: string, height: number}, hw_rh2288_v3_back: {label: string, height: number}, dell_dss2500: {label: string, height: number}, dell_r630: {label: string, height: number}, dell_r730xd: {label: string, height: number}, HW_CE6851-48S6Q-HI: {label: string, height: number}, HW_CE8860-4C-EI: {label: string, height: number}, HW_S5700-52P-LI-AC: {label: string, height: number}, HW_S5720-56C-EI-48S-AC: {label: string, height: number}, HW_NE40E-X8_card: {label: string, relWidth: number, relHeight: number}}}
 */
var panelDef = {

    "hw_s2700": { label: "hw_s2700", width: 442.03, height: 44.00, size: 1 },
    "hw_s3700": { label: "hw_s3700", width: 442.03, height: 44.00, size: 1 },
    "cisco_2950": { label: "cisco_2950", width: 445.03, height: 44.00, size: 1 },
    "cisco_2960": { label: "cisco_2960", width: 445.03, height: 44.00, size: 1 },
    "h3c_s1050t": { label: "h3c_s1050t", width: 440.03, height: 44.00, size: 1 },
    "h3c_s1224": { label: "h3c_s1224", width: 330.02, height: 44.00, size: 1 },
    "hw_rh2288_v3_front": { label: "hw_rh2288_v3_front", width: 450.03, height: 88.94, size: 2 },
    "hw_rh2288_v3_back": { label: "hw_rh2288_v3_back", width: 450.07, height: 88.91, size: 2 },
    "dell_dss2500": { label: "dell_dss2500", width: 450.19, height: 88.91, size: 2 },
    "dell_r630": { label: "dell_r630", width: 450.03, height: 44.50, size: 1 },
    "dell_r730xd": { label: "dell_r730xd", width: 450.03, height: 88.91, size: 2 },
    "HW_CE6851-48S6Q-HI": { label: "HW_CE6851-48S6Q-HI", width: 450.03, height: 44.50, size: 1 },
    "HW_CE8860-4C-EI": { label: "HW_CE8860-4C-EI", width: 450.03, height: 88.91, size: 2 },
    "HW_S5700-52P-LI-AC": { label: "HW_S5700-52P-LI-AC", width: 450.03, height: 44.50, size: 1 },
    "HW_S5720-56C-EI-48S-AC": { label: "HW_S5720-56C-EI-48S-AC", width: 450.03, height: 44.50, size: 1 },
    "HW_NE40E-X8_card": { label: "HW_NE40E-X8_card", width: 37.64, height: 360.28, size: 8 },
    "cisco_3560": { label: "cisco_3560", width: 450.03, height: 44.45, size: 1 },
    "cisco_4948e": { label: "cisco_4948e", width: 450.03, height: 44.45, size: 1 },
    "cisco_weizhixinghao01": { label: "cisco_weizhixinghao01", width: 450.03, height: 44.45, size: 1 },
    "huawei-weizhixinghao01": { label: "huawei-weizhixinghao01", width: 450.03, height: 44.45, size: 1 },
    "cisco_2900": { label: "cisco_2900", width: 450.03, height: 44.45, size: 1 },
    "cisco_3560b": { label: "cisco_3560", width: 450.03, height: 44.45, size: 1 },
    "cisco_3900": { label: "cisco_3900", width: 450.03, height: 133.36, size: 3 },
    "cisco_7200series": { label: "cisco_7200series", width: 450.03, height: 133.36, size: 3 },
    "cisco_asr_1006": { label: "cisco_asr_1006", width: 450.03, height: 266.72, size: 6 },
    "cisco_nexus_7000": { label: "cisco_nexus_7000", width: 450.03, height: 978.95, size: 23 },
    "IMB_X3650_M2": { label: "IMB_X3650_M2", width: 450.03, height: 88.91, size: 2 },
    "qnap_weizhixinghao01": { label: "qnap_weizhixinghao01", width: 450.03, height: 44.45, size: 1 },
    "juniper_ssg520m": { label: "juniper_ssg520m", width: 450.03, height: 88.91, size: 2 },
    "sunsea_f218b_24": { label: "sunsea_f218b_24", width: 450.10, height: 133.41, size: 3 },
    "symmctricom_syncserver_s200": { label: "symmctricom_syncserver_s200", width: 450.03, height: 44.50, size: 1 },
    "TIEDATE_jscb_II": { label: "TIEDATE_jscb_II", width: 450.03, height: 133.51, size: 3 },
    "yanhua_weizhixinghao02": { label: "yanhua_weizhixinghao02", width: 450.63, height: 89.51, size: 2 },
    "yanhua_weizhixinghao01": { label: "yanhua_weizhixinghao01", width: 450.63, height: 89.51, size: 2 },
    "yanhua_01oh": { label: "yanhua_01oh", width: 450.03, height: 177.81, size: 4 },
    "haikangweishi_weizhixinghao01": { label: "haikangweishi_weizhixinghao01", width: 450.03, height: 88.91, size: 2 },
    "huawei_ar3200_series": { label: "huawei_ar3200_series", width: 450.03, height: 133.51, size: 3 },
    "hongtaigaoke_HTECH6000": { label: "hongtaigaoke_HTECH6000", width: 450.03, height: 88.91, size: 2 },
    "IBM_3550_M4": { label: "IBM_3550_M4", width: 450.03, height: 44.59, size: 1 },
    "IBM_3750_M4": { label: "IBM_3750_M4", width: 450.03, height: 88.91, size: 2 },
    "IBM_3650_M4": { label: "IBM_3650_M4", width: 450.03, height: 88.91, size: 2 },
    "IBM_P740": { label: "IBM_P740", width: 450.03, height: 177.81, size: 4 },
    "IBM_3850_X5": { label: "IBM_3850_X5", width: 450.03, height: 177.81, size: 4 },
    "IBM_X3650_M5": { label: "IBM_X3650_M5", width: 450.03, height: 88.91, size: 2 },
    "IMB_2948_B24": { label: "IMB_2948_B24", width: 450.03, height: 44.50, size: 1 },
    "IMB_V3700": { label: "IMB_V3700", width: 450.03, height: 88.91, size: 2 },
    "IBM_X3850_X6": { label: "IBM_X3850_X6", width: 450.03, height: 177.81, size: 4 },
    "IMB_V5000": { label: "IMB_V5000", width: 450.03, height: 88.91, size: 2 },
    "DLINK_DES_1024R": { label: "DLINK_DES_1024R", width: 450.38, height: 44.85, size: 1 },
    "xindahuanyu_weizhixinghao01": { label: "xindahuanyu_weizhixinghao01", width: 450.38, height: 44.85, size: 1 },
    "dell_r730xd_back": { label: "dell_r730xd_back", width: 450.03, height: 88.91, size: 2 },
    "dell_dss2500_back": { label: "dell_dss2500_back", width: 450.03, height: 88.91, size: 2 },
    "dell_r630_back": { label: "dell_r630_back", width: 450.03, height: 44.50, size: 1 },
    "3560_X": { label: "3560_X", width: 450.63, height: 45.10, size: 1 },
    "catalyst_3650_24_4X1G": { label: "catalyst_3650_24_4X1G", width: 450.03, height: 44.50, size: 1 },
    "CISCO_2800": { label: "CISCO_2800", width: 450.63, height: 45.10, size: 1 },
    "ATBB060464": { label: "ATBB060464", width: 450.03, height: 178.16, size: 4 },
    "CISCO_2800_2": { label: "CISCO_2800_2", width: 450.63, height: 45.10, size: 1 },
    "un_equipment1": { label: "un_equipment1", width: 449.82, height: 133.36, size: 3 },
    "un_equipment10": { label: "un_equipment10", width: 450.10, height: 89.88, size: 2 },
    "un_equipment2": { label: "un_equipment2", width: 445.03, height: 44.00, size: 1 },
    "PDH480": { label: "PDH480", width: 450.63, height: 45.10, size: 1 },
    "un_equipment4": { label: "un_equipment4", width: 450.03, height: 44.50, size: 1 },
    "un_equipment3": { label: "un_equipment3", width: 450.03, height: 44.50, size: 1 },
    "un_equipment7": { label: "un_equipment7", width: 450.03, height: 44.50, size: 1 },
    "un_equipment9": { label: "un_equipment9", width: 450.03, height: 88.91, size: 2 },
    "ZWGH75_120": { label: "ZWGH75_120", width: 450.63, height: 45.10, size: 1 },
    "un_equipment8": { label: "un_equipment8", width: 445.03, height: 44.00, size: 1 },
    "un_equipment6": { label: "un_equipment6", width: 450.03, height: 44.50, size: 1 },
    "un_equipment5": { label: "un_equipment5", width: 450.03, height: 44.50, size: 1 },
    "CISCO_AS5300": { label: "CISCO_AS5300", width: 450.03, height: 44.50, size: 1 },
    "CISCO_AS5400": { label: "CISCO_AS5400", width: 450.17, height: 89.88, size: 2 },
    "CISCO_ASR1002": { label: "CISCO_ASR1002", width: 450.03, height: 89.00, size: 2 },
    "CISCO_catalyst_4500+E": { label: "CISCO_catalyst_4500+E", width: 450.17, height: 489.53, size: 11 },
    "CISCO2901": { label: "CISCO2901", width: 450.03, height: 44.50, size: 1 },
    "CiscoASR1001_X_back": { label: "CiscoASR1001_Xvv_back", width: 450.03, height: 44.50, size: 1 },
    "CiscoASR1001_X": { label: "CiscoASR1001_Xvv", width: 450.03, height: 44.50, size: 1 },
    "cisco_catalyst4948E": { label: "cisco_catalyst4948E", width: 450.03, height: 44.50, size: 1 },
    "IBM_DS4300_back": { label: "IBM_DS4300_back", width: 450.03, height: 89.01, size: 2 },
    "GIOBALTIME": { label: "GIOBALTIME", width: 450.03, height: 44.50, size: 1 },
    "EVP_3.2": { label: "EVP_3.2", width: 450.03, height: 44.50, size: 1 },
    "IBM_DS4700": { label: "IBM_DS4700", width: 450.03, height: 89.01, size: 2 },
    "IBM_DS4300": { label: "IBM_DS4300", width: 450.03, height: 89.01, size: 2 },
    "IBM_DS4700_back": { label: "IBM_DS4700_back", width: 450.03, height: 89.01, size: 2 },
    "GUIDway_s5700series": { label: "GUIDway_s5700series", width: 450.03, height: 44.50, size: 1 },
    "HAIDE-server2301": { label: "HAIDE-server2301", width: 450.00, height: 90.00, size: 2 },
    "HAIDE-server2301_back": { label: "HAIDE-server2301_back", width: 450.00, height: 90.00, size: 2 },
    "HW-S5720-36PC-EI-AC": { label: "HW-S5720-36PC-EI-AC", width: 450.00, height: 45.00, size: 1 },
    "HW-S5720-36PC-EI-AC_back": { label: "HW-S5720-36PC-EI-AC_back", width: 450.00, height: 45.00, size: 1 },
    "YS-DC2808-FH": { label: "YS-DC2808-FH", width: 450.00, height: 45.00, size: 1 },
    "YS-DC2808-FH_back": { label: "YS-DC2808-FH_back", width: 450.00, height: 45.00, size: 1 },
    "YS-ISC3616-SC": { label: "YS-ISC3616-SC", width: 450.00, height: 90.00, size: 2 },
    "YS-ISC3616-SC_back": { label: "YS-ISC3616-SC_back", width: 450.00, height: 90.00, size: 2 },
    "YS-VS-MS8500-E-UV": { label: "YS-VS-MS8500-E-UV", width: 450.00, height: 90.00, size: 2 },
    "YS-VS-MS8500-E-UV_back": { label: "YS-VS-MS8500-E-UV_back", width: 450.00, height: 90.00, size: 2 },
    "f5-big-ip3600": { label: "f5-big-ip3600", width: 450.00, height: 45.00, size: 1 },
    "fenguangqi": { label: "fenguangqi", width: 450.00, height: 45.00, size: 1 },
    "fenguangqi_back": { label: "fenguangqi_back", width: 450.00, height: 45.00, size: 1 },
    "hp_3par_7400": { label: "hp_3par_7400", width: 450.00, height: 180, size: 4 },
    "hp_c7000_matrix": { label: "hp_c7000_matrix", width: 450.00, height: 315, size: 7 },
    "hp_c70001": { label: "hp_c70001", width: 450.00, height: 315, size: 7 },
    "hp_dl360_gen8_3par": { label: "hp_dl360_gen8_3par", width: 450.00, height: 45, size: 1 },
    "hp_rx9800": { label: "hp_rx9800", width: 450.00, height: 180, size: 4 },
    "HW_AR2200-S": { label: "HW_AR2200-S", width: 450.00, height: 45, size: 1 },
    "HW_Secoway_USG2000": { label: "HW_Secoway_USG2000", width: 450.00, height: 45, size: 1 },
    "IBM_Storwize_v3500": { label: "IBM_Storwize_v3500", width: 450.00, height: 45, size: 1 },
    "kedong_stone_wall_2000": { label: "kedong_stone_wall_2000", width: 450.00, height: 45, size: 1 },
    "KHSD_server_1": { label: "KHSD_server_1", width: 450.00, height: 45, size: 1 },
    "lenovo_server_1": { label: "lenovo_server_1", width: 450.00, height: 45, size: 1 },
    "MULTIPLATFORM_KVM_SWITCH": { label: "MULTIPLATFORM_KVM_SWITCH", width: 450.00, height: 45, size: 1 },
    "netoptI2200": { label: "netoptI2200", width: 450.00, height: 45, size: 1 },
    "Quidway_S5700": { label: "Quidway_S5700", width: 450.00, height: 45, size: 1 },
    "raritan_kx2-432": { label: "raritan_kx2-432", width: 450.00, height: 45, size: 1 },
    "storageworks": { label: "storageworks", width: 450.00, height: 180, size: 4 },
    "THTF_server_2": { label: "THTF_server_2", width: 450.00, height: 45, size: 1 },
    "THTF_server_4": { label: "THTF_server_4", width: 450.00, height: 90, size: 2 },
    "THTF_server_5": { label: "THTF_server_5", width: 450.00, height: 180, size: 4 },
    "THTF_server_6": { label: "THTF_server_6", width: 450.00, height: 180, size: 4 },
    "zxjmzz": { label: "zxjmzz", width: 450.00, height: 45, size: 1 },
    "3560_X": { label: "3560_X", width: 450.00, height: 90, size: 2 },
    "3560G": { label: "3560G", width: 450.00, height: 45, size: 1 },
    "anzhiyuan_csc100": { label: "anzhiyuan_csc100", width: 450.00, height: 90, size: 2 },
    "anzhiyuan_sps4008": { label: "anzhiyuan_sps4008", width: 450.00, height: 45, size: 1 },
    "ATBB060464": { label: "ATBB060464", width: 450.00, height: 180, size: 4 },
    "cisco_7200series_vxr": { label: "cisco_7200series_vxr", width: 450.00, height: 90, size: 2 },
    "CISCO_AS5300": { label: "CISCO_AS5300", width: 450.00, height: 45, size: 1 },
    "CISCO_AS5400": { label: "CISCO_AS5400", width: 450.00, height: 90, size: 2 },
    "CISCO_catalyst_4500+E": { label: "CISCO_catalyst_4500+E", width: 450.00, height: 495, size: 11 },
    "CISCO_catalyst_4500+E_2": { label: "CISCO_catalyst_4500+E_2", width: 450.00, height: 315, size: 7 },
    "CiscoASR1001_X_back": { label: "CiscoASR1001_X_back", width: 450.00, height: 45, size: 1 },
    "CiscoASR1001_X": { label: "CiscoASR1001_X", width: 450.00, height: 45, size: 1 },
    "DLMU300_1": { label: "DLMU300_1", width: 450.00, height: 45, size: 1 },
    "DLMU600": { label: "DLMU600", width: 450.00, height: 90, size: 2 },
    "DS3500": { label: "DS3500", width: 450.00, height: 90, size: 2 },
    "F5_BIG-IP_4000_SERIES": { label: "F5_BIG-IP_4000_SERIES", width: 450.00, height: 45, size: 1 },
    "H3C_MSR56-60": { label: "H3C_MSR56-60", width: 450.00, height: 180, size: 4 },
    "h3c_s1050t": { label: "h3c_s1050t", width: 450.00, height: 45, size: 1 },
    "H3C_S3100V2": { label: "H3C_S3100V2", width: 450.00, height: 45, size: 1 },
    "H3C_S5048E": { label: "H3C_S5048E", width: 450.00, height: 45, size: 1 },
    "H3C_S5120": { label: "H3C_S5120", width: 450.00, height: 45, size: 1 },
    "h3c_s5120_series": { label: "h3c_s5120_series", width: 450.00, height: 45, size: 1 },
    "qnap_weizhixingghao01": { label: "qnap_weizhixingghao01", width: 450.00, height: 45, size: 1 },
    "IBM_P750": { label: "IBM_P750", width: 450.00, height: 180, size: 4 },
    "te_2960s": { label: "te_2960s", width: 450.00, height: 45, size: 1 },
    "H3C_S5500": { label: "H3C_S5500", width: 450.00, height: 45, size: 1 },
    "H3C_S10508-V": { label: "H3C_S10508-V", width: 450.00, height: 900, size: 20 },
    "IBM_X3650_M4": { label: "IBM_X3650_M4", width: 450.00, height: 90, size: 2 },
    "IBM_X3750_M4": { label: "IBM_X3750_M4", width: 450.00, height: 90, size: 2 },
    "H3C_SR6608": { label: "H3C_SR6608", width: 450.00, height: 315, size: 7 },
    "H3C_SR8808-X": { label: "H3C_SR8808-X", width: 450.00, height: 900, size: 20 },
    "H3C_SR8812_back": { label: "H3C_SR8812_back", width: 450.00, height: 765, size: 17 },
    "H3C_SR8812": { label: "H3C_SR8812", width: 450.00, height: 765, size: 17 },
    "HKWS-1": { label: "HKWS-1", width: 450.00, height: 90, size: 2 },
    "HKWS-2": { label: "HKWS-2", width: 450.00, height: 90, size: 2 },
    "huawei_ar3200_series": { label: "huawei_ar3200_series", width: 450.00, height: 90, size: 2 },
    "huawei_weizhixinghao01": { label: "huawei_weizhixinghao01", width: 450.00, height: 45, size: 1 },
    "HW_5700": { label: "HW_5700", width: 450.00, height: 45, size: 1 },
    "IBM_01": { label: "IBM_01", width: 450.00, height: 90, size: 2 },
    "IBM_2499-816": { label: "IBM_2499-816", width: 450.00, height: 630, size: 14 },
    "IBM_DS4300_back": { label: "IBM_DS4300_back", width: 450.00, height: 90, size: 2 },
    "IBM_DS4700_back": { label: "IBM_DS4700_back", width: 450.00, height: 90, size: 2 },
    "IBM_DS5020": { label: "IBM_DS5020", width: 450.00, height: 135, size: 3 },
    "IBM_FC5887": { label: "IBM_FC5887", width: 450.00, height: 90, size: 2 },
    "IBM": { label: "IBM", width: 450.00, height: 45, size: 1 },
    "IBM_P750": { label: "IBM_P750", width: 500.03, height: 178.01, size: 4 },
    "IBM_P750_back": { label: "IBM_P750_back", width: 450.00, height: 180, size: 4 },
    "IBM_Power570": { label: "IBM_Power570", width: 450.00, height: 180, size: 4 },
    "IBM_Power720": { label: "IBM_Power720", width: 450.00, height: 180, size: 4 },
    "IBM_PS814_back": { label: "IBM_PS814_back", width: 450.00, height: 180, size: 4 },
    "IBM_storwize_v3700": { label: "IBM_storwize_v3700", width: 450.00, height: 90, size: 2 },
    "IBM_TYPE7226": { label: "IBM_TYPE7226", width: 450.00, height: 45, size: 1 },
    "IBM_V3700": { label: "IBM_V3700", width: 450.00, height: 90, size: 2 },
    "IBM_V5000": { label: "IBM_V5000", width: 450.00, height: 90, size: 2 },
    "IBM_X346_back": { label: "IBM_X346_back", width: 450.00, height: 90, size: 2 },
    "IBM_X3550_M3_back": { label: "IBM_X3550_M3_back", width: 450.00, height: 45, size: 1 },
    "IBM_X3550_M3": { label: "IBM_X3550_M3", width: 450.00, height: 45, size: 1 },
    "IBM_X3550_M4": { label: "IBM_X3550_M4", width: 450.00, height: 45, size: 1 },
    "IBM_X3650_M5": { label: "IBM_X3650_M5", width: 450.00, height: 90, size: 2 },
    "Quidway_S5352C-EI": { label: "Quidway_S5352C-EI", width: 450.00, height: 45, size: 1 },
    "Quidway_S5352C-EI_back": { label: "Quidway_S5352C-EI_back", width: 450.00, height: 45, size: 1 },
    "Quidway_S9312": { label: "Quidway_S9312", width: 450.00, height: 630, size: 14 },
    "Quidway_S9312_back": { label: "Quidway_S9312_back", width: 450.00, height: 630, size: 14 },
    "Quidway_NE40E-8": { label: "Quidway_NE40E-8", width: 450.00, height: 945, size: 21 },
    "Quidway_NE40E-8_back": { label: "Quidway_NE40E-8_back", width: 450.00, height: 945, size: 21 },
    "Quidway_S2326TP-EI": { label: "Quidway_S2326TP-EI", width: 450.00, height: 45, size: 1 },
    "Quidway_S2326TP-EI_back": { label: "Quidway_S2326TP-EI_back", width: 450.00, height: 45, size: 1 },
    "Quidway_S5348TP-SI": { label: "Quidway_S5348TP-SI", width: 450.00, height: 45, size: 1 },
    "Quidway_S5328C-EI": { label: "Quidway_S5328C-EI", width: 450.00, height: 45, size: 1 },
    "Quidway_S5328C-EI_back": { label: "Quidway_S5328C-EI_back", width: 450.00, height: 45, size: 1 },
    "Quidway_S9306": { label: "Quidway_S9306", width: 450.00, height: 150, size: 10 },
    "Quidway_S9306_back": { label: "Quidway_S9306_back", width: 450.00, height: 150, size: 10 },
    "H3C_S3600": { label: "H3C_S3600", width: 450.00, height: 45, size: 1 },
    "H3C_S3600_back": { label: "H3C_S3600_back", width: 450.00, height: 45, size: 1 },
    "IBM_X3650M2": { label: "IBM_X3650M2", width: 450.00, height: 90, size: 2 },
    "IPC_810E_back": { label: "IPC_810E_back", width: 450.00, height: 180, size: 4 },
    "IPC_810E": { label: "IPC_810E", width: 450.00, height: 180, size: 4 },
    "kvm01": { label: "kvm01", width: 450.00, height: 45, size: 1 },
    "LC_M4600": { label: "LC_M4600", width: 450.00, height: 405, size: 9 },
    "LC_NF280D": { label: "LC_NF280D", width: 450.00, height: 90, size: 2 },
    //"LC_TS860":{label: "LC_TS860", width: 450.00, height:360,size: 8},
    "LCTS_TS850": { label: "LCTS_TS850", width: 450.00, height: 270, size: 6 },
    //"RUGGEDCOM_RX1000_99":{label: "RUGGEDCOM_RX1000_99", width: 450.00, height:45,size: 1},
    "SGTK_I620r-H": { label: "SGTK_I620r-H", width: 450.00, height: 90, size: 2 },
    "SXF_AC-6080": { label: "SXF_AC-6080", width: 450.00, height: 90, size: 2 },
    "TE_connectivity": { label: "TE_connectivity", width: 450.00, height: 45, size: 1 },
    "TRX_DDOS_TOP_ADS300": { label: "TRX_DDOS_TOP_ADS300", width: 450.00, height: 90, size: 2 },
    "TRX_NGFW4000-UF": { label: "TRX_NGFW4000-UF", width: 450.00, height: 90, size: 2 },
    "TRX_TA-71220": { label: "TRX_TA-71220", width: 450.00, height: 90, size: 2 },
    "TRX_TopFilter_8000": { label: "TRX_TopFilter_8000", width: 450.00, height: 90, size: 2 },
    "TRX_TopIDP_3000": { label: "TRX_TopIDP_3000", width: 450.00, height: 45, size: 1 },
    "TRX_TopRules8000": { label: "TRX_TopRules8000", width: 450.00, height: 45, size: 1 },
    "TRX_TopRules8000-2": { label: "TRX_TopRules8000-2", width: 450.00, height: 90, size: 2 },
    "WS_1800": { label: "WS_1800", width: 450.00, height: 90, size: 2 },
    //"WS_D5000-T002P":{label: "WS_D5000-T002P", width: 450.00, height:45,size: 1},
    "WS_G30-TAX66": { label: "WS_G30-TAX66", width: 450.00, height: 90, size: 2 },
    "WS_G30-TAX66-1": { label: "WS_G30-TAX66-1", width: 450.00, height: 90, size: 2 },
    "WS_G1500-E005P": { label: "WS_G1500-E005P", width: 450.00, height: 45, size: 1 },
    "WS_secfox": { label: "WS_secfox", width: 450.00, height: 90, size: 2 },
    //"WS_SecFox-NBA-G4":{label: "WS_SecFox-NBA-G4", width: 450.00, height:45,size: 1},
    //"WS_SecGate 3600":{label: "WS_SecGate 3600", width: 450.00, height:90,size: 2},
    //"WS_SecGate_G30_3600":{label: "WS_SecGate_G30_3600", width: 450.00, height:90,size: 2},
    //"WS_V5000-U001P":{label: "WS_V5000-U001P", width: 450.00, height:45,size: 1},
    //"WS_V5000U003P":{label: "WS_V5000U003P", width: 450.00, height:45,size: 1},
    //"WS_W1500-U008P":{label: "WS_W1500-U008P", width: 450.00, height:45,size: 1},
    "xindahuanyu_weizhixinghao01": { label: "xindahuanyu_weizhixinghao01", width: 450.00, height: 45, size: 1 },
    "ZXD800": { label: "ZXD800", width: 450.00, height: 90, size: 2 },
    //"ZY_D150w_power_supply":{label: "ZY_D150w_power_supply", width: 450.00, height:45,size: 1},
    //"ZYEQ_MSU120":{label: "ZYEQ_MSU120", width: 450.00, height:45,size: 1},
    "ZYOTS_ELAN800": { label: "ZYOTS_ELAN800", width: 450.00, height: 45, size: 1 },
    "DELL_R730": { label: "DELL_R730", width: 450.03, height: 89.00, size: 2 },
    "S5700_24TP_SI": { label: "S5700_24TP_SI", width: 450.03, height: 44.50, size: 1 },
    "ODF": { label: "ODF", width: 450.03, height: 178.01, size: 4 },
    "ddf2_back": { label: "ddf2_back", relWidth: 405, relHeight: 78.4 },
    "ddf2": { label: "ddf2", relWidth: 450.03, relHeight: 89.00, size: 2 },
    "S1240J_back": { label: "S1240JJ_back", relWidth: 540.05, relHeight: 760.05 },
    "S1240J": { label: "S1240JJ", width: 770.05, height: 740.05, size: 17 },
    "A21E1": { label: "A21E1", relWidth: 18.47, relHeight: 276.71 },
    "DTRF": { label: "DTRF", relWidth: 18.00, relHeight: 203.56 },
    "CONGI": { label: "CONGI", relWidth: 18.47, relHeight: 276.71 },
    "Label": { label: "Label", relWidth: 29.64, relHeight: 29.64 },
    "MCUG": { label: "MCUG", relWidth: 18.00, relHeight: 203.56 },
    "P4S1N": { label: "P4S1N", relWidth: 18.47, relHeight: 303.17 },
    "P63E1": { label: "P63E1", relWidth: 18.47, relHeight: 276.71 },
    "MCUG_back": { label: "MCUG_back", relWidth: 8.58, relHeight: 203.56 },
    "SERVEICE": { label: "SERVEICE", relWidth: 36.65, relHeight: 276.71 },
    "3560G": { label: "3560G", width: 450.03, height: 44.50, size: 1 },
    "casco_stby_u": { label: "casco_stby_u", width: 450.03, height: 89.00, size: 2 },
    "ATBB060464": { label: "ATBB060464", width: 450.03, height: 178.01, size: 4 },
    "DLMU300": { label: "DLM_U300", width: 450.03, height: 133.51, size: 3 },
    "DLMU600_1": { label: "DLMU600_1", width: 450.03, height: 44.50, size: 1 },
    "fanghuoqiang": { label: "fanghuoqiang", width: 450.03, height: 133.51, size: 3 },
    "IBM_1754_HC3": { label: "IBM_1754_HC3", width: 450.03, height: 44.50, size: 1 },
    "DLMU300_back": { label: "DLM_U300_back", width: 450.03, height: 133.51, size: 3 },
    "ITS": { label: "ITS", width: 450.03, height: 44.50, size: 1 },
    "ibm_x3550_m4": { label: "ibm_x3550_m4", width: 450.03, height: 44.50, size: 1 },
    "ipc_820": { label: "ipc820", width: 450.03, height: 178.01, size: 4 },
    "IBM_X3650_M2": { label: "IBM_X3650_M2", width: 450.03, height: 89.00, size: 2 },
    "NETGEAR_JFS516": { label: "NETGEAR_JFS516", width: 450.03, height: 44.50, size: 1 },
    "RUGGEDCOM_RX1000_99": { label: "RUGGEDCOM_RX1000_99", width: 450.03, height: 44.50, size: 1 },
    "sav": { label: "sav", width: 450.03, height: 178.01, size: 4 },
    "sunsea_weizhixinghao01": { label: "sunsea_weizhixinghao01", width: 450.03, height: 89.00, size: 2 },
    "syncServer_S200": { label: "syncServer_S200", width: 450.03, height: 44.50, size: 1 },
    "thinkserver": { label: "thinkserver", width: 450.03, height: 89.00, size: 2 },
    "zhongxing_weizhixinghao01": { label: "zhongxing_weizhixinghao01", width: 450.03, height: 89.00, size: 2 },
    "ZY_D150w_power_supply": { label: "ZY_D150w_power_supply", width: 450.03, height: 44.50, size: 1 },
    "IBM_X3650": { label: "IBM_X3650", width: 450.03, height: 89.00, size: 2 },
    "xseries445": { label: "xseries445", width: 450.03, height: 178.01, size: 4 },
    "kvm": { label: "kvm", width: 450.03, height: 44.50, size: 1 },
    "SAMZHE": { label: "SAMZHE", width: 450.03, height: 89.00, size: 2 },
    "CHINATELECOM_converter_back": { label: "CHINATELECOM_converter_back", width: 450.03, height: 44.49, size: 1 },
    "CVIDEO_I620": { label: "CVIDEO_I620", width: 450.03, height: 44.49, size: 1 },
    "CVIDEO_I620_back": { label: "CVIDEO_I620_back", width: 450.03, height: 44.49, size: 1 },
    "CVIDEO_Supermicro_back": { label: "CVIDEO_Supermicro_back", width: 450.03, height: 44.49, size: 1 },
    "D_Link_storage": { label: "D_Link_storage", width: 450.17, height: 133.71, size: 3 },
    "D_Link_DCP8000_back": { label: "D_Link_DCP8000_back", width: 450.17, height: 88.91, size: 2 },
    "CVIDEO_Supermicro": { label: "CVIDEO_Supermicro", width: 450.03, height: 44.49, size: 1 },
    "D_Link_DCP8000": { label: "D_Link_DCP8000", width: 450.17, height: 88.91, size: 2 },
    "D_Link_storage_back": { label: "D_Link_storage_back", width: 450.17, height: 133.71, size: 3 },
    "EMC_storage": { label: "EMC_storage", width: 450.17, height: 44.50, size: 1 },
    "EMC_storage_back": { label: "EMC_storage_back", width: 450.17, height: 44.50, size: 1 },
    "EMC_RIAD_back": { label: "EMC_RIAD_back", width: 450.17, height: 133.53, size: 3 },
    "EMC_VNX5400": { label: "EMC_VNX5400", width: 450.03, height: 133.53, size: 3 },
    "CHINATELECOM_converter": { label: "CHINATELECOM_converter", width: 450.03, height: 44.49, size: 1 },
    "EMC_VNX5400_back": { label: "EMC_VNX5400_back", width: 450.03, height: 133.53, size: 3 },
    "equipment9_back": { label: "equipment9_back", width: 450.03, height: 44.50, size: 1 },
    "equipment_PDU_DC_back": { label: "equipment_PDU_DC_back", width: 450.03, height: 133.53, size: 3 },
    "equipment_Power_DC": { label: "equipment_Power_DC", width: 450.03, height: 44.50, size: 1 },
    "equipment_PDU_DC": { label: "equipment_PDU_DC", width: 450.03, height: 133.53, size: 3 },
    "equipment_Power_DC_back": { label: "equipment_Power_DC_back", width: 450.03, height: 44.50, size: 1 },
    "HUAWEI_SmartAX_MA5626": { label: "HUAWEI_SmartAX_MA5626", width: 450.03, height: 44.49, size: 1 },
    "HUAWEI_SmartAX_MA5626_back": { label: "HUAWEI_SmartAX_MA5626_back", width: 450.03, height: 44.49, size: 1 },
    "SUGON_DiskArray6310": { label: "SUGON_DiskArray6310", width: 450.03, height: 133.36, size: 3 },
    "SUGON_DAWNING_A620r_G_back": { label: "SUGON_DAWNING_A620r_G_back", width: 450.03, height: 88.91, size: 2 },
    "SUGON_DiskArray6310_back": { label: "SUGON_DiskArray6310_back", width: 450.03, height: 133.36, size: 3 },
    "SUGON_DS600_G20": { label: "SUGON_DS600_G20", width: 450.03, height: 133.50, size: 3 },
    "SUGON_DS600_G20_back": { label: "SUGON_DS600_G20_back", width: 450.03, height: 133.50, size: 3 },
    "SUGON_I620_G20": { label: "SUGON_I620_G20", width: 450.03, height: 89.01, size: 2 },
    "SUGON_I620_G20_back": { label: "SUGON_I620_G20_back", width: 450.03, height: 89.01, size: 2 },
    "TAIPING_ODU": { label: "TAIPING_ODU", width: 450.03, height: 44.49, size: 1 },
    "TAIPING_ODU2": { label: "TAIPING_ODU2", width: 450.03, height: 89.01, size: 2 },
    "SUGON_I840_G20": { label: "SUGON_I840_G20", width: 450.03, height: 177.99, size: 4 },
    "TAIPING_ODU2_back": { label: "TAIPING_ODU2_back", width: 450.03, height: 89.01, size: 2 },
    "TAIPING_ODU_back": { label: "TAIPING_ODU_back", width: 450.03, height: 44.49, size: 1 },
    "TOPSEC_NGFW4000": { label: "TOPSEC_NGFW4000", width: 450.03, height: 89.00, size: 2 },
    "SUGON_I840_G20_back": { label: "SUGON_I840_G20_back", width: 450.03, height: 177.99, size: 4 },
    "TOPSEC_NGFW4000_back": { label: "TOPSEC_NGFW4000_back", width: 450.03, height: 89.00, size: 2 },
    "TOPSEC_TopFilter8000": { label: "TOPSEC_TopFilter8000", width: 450.03, height: 89.00, size: 2 },
    "TOPSEC_TopFilter8000_back": { label: "TOPSEC_TopFilter8000_back", width: 450.03, height: 89.00, size: 2 },
    "equipment9": { label: "equipment9", width: 450.03, height: 44.50, size: 1 },
    "VISEC_ViGap": { label: "VISEC_ViGap", width: 450.03, height: 89.00, size: 2 },
    "VISEC_ViGap_back": { label: "VISEC_ViGap_back", width: 450.03, height: 89.00, size: 2 },
    "Wellav_SMP100_Platform": { label: "Wellav_SMP100_Platform", width: 450.03, height: 44.49, size: 1 },
    "ZHJD_Envivio_G4": { label: "ZHJD_Envivio_G4", width: 450.03, height: 88.91, size: 2 },
    "Wellav_SMP100_Platform_back": { label: "Wellav_SMP100_Platform_back", width: 450.03, height: 44.50, size: 1 },
    "ZHJD_Envivio_G4_back": { label: "ZHJD_Envivio_G4_back", width: 450.03, height: 88.91, size: 2 },
    "ZTE_ZXCTN6150": { label: "ZTE_ZXCTN6150", width: 450.03, height: 88.91, size: 2 },
    "ZTE_ZXCTN6150_back": { label: "ZTE_ZXCTN6150_back", width: 450.03, height: 88.91, size: 2 },
    "UTStarcom_CSP": { label: "UTStarcom_CSP", width: 450.03, height: 534.00, size: 12 },
    "UTStarcom_CSP_back": { label: "UTStarcom_CSP_back", width: 450.03, height: 534.00, size: 12 },
    "EMC_RIAD": { label: "EMC_RIAD", width: 450.03, height: 133.51, size: 3 },
    "SUGON_DAWNING_A620r_G": { label: "SUGON_DAWNING_A620r_G", width: 450.17, height: 88.91, size: 2 },

    "ArcSoft_ArcVideo_Live_back": { label: "ArcSoft_ArcVideo_Live_back", width: 450.03, height: 44.50, size: 1 },
    "ArcSoft_ArcVideo_Live": { label: "ArcSoft_ArcVideo_Live", width: 450.03, height: 44.50, size: 1 },
    "ATEN_ALTUSCN_KH1508i": { label: "ATEN_ALTUSCN_KH1508i", width: 450.03, height: 44.50, size: 1 },
    "ATEN_ALTUSCN_KH1508i_back": { label: "ATEN_ALTUSCN_KH1508i_back", width: 450.03, height: 44.50, size: 1 },
    "ATEN_CL5708": { label: "ATEN_CL5708", width: 450.03, height: 44.50, size: 1 },
    "ATEN_CL5708_back": { label: "ATEN_CL5708_back", width: 450.03, height: 44.50, size: 1 },
    "ATEN_CL8708": { label: "ATEN_CL8708", width: 450.03, height: 44.50, size: 1 },
    "ATEN_CL8708_back": { label: "ATEN_CL8708_back", width: 450.03, height: 44.50, size: 1 },
    "ATEN_CS1308": { label: "ATEN_CS1308", width: 450.03, height: 44.50, size: 1 },
    "BROADV_BHA31_back": { label: "BROADV_BHA31_back", width: 450.03, height: 89.00, size: 2 },
    "ATEN_CS1308_back": { label: "ATEN_CS1308_back", width: 450.03, height: 44.50, size: 1 },
    "BROADV_BHAA48": { label: "BROADV_BHAA48", width: 450.03, height: 44.50, size: 1 },
    "BROADV_BHA31": { label: "BROADV_BHA31", width: 450.03, height: 89.00, size: 2 },
    "BROADV_BHC31616D08": { label: "BROADV_BHC31616D08", width: 450.03, height: 44.50, size: 1 },
    "BROADV_BHC31616D08_back": { label: "BROADV_BHC31616D08_back", width: 450.03, height: 44.50, size: 1 },
    "CircLoop_ASI": { label: "CircLoop_ASI", width: 450.03, height: 44.50, size: 1 },
    "BROADV_DISPLAY_back": { label: "BROADV_DISPLAY_back", width: 450.03, height: 44.50, size: 1 },
    "BROADV_DISPLAY": { label: "BROADV_DISPLAY", width: 450.03, height: 44.50, size: 1 },
    "CircLoop_ASI_back": { label: "CircLoop_ASI_back", width: 450.03, height: 44.50, size: 1 },
    "DELL_PowerEdge_1950_1": { label: "DELL_PowerEdge_1950_1", width: 450.03, height: 44.50, size: 1 },
    "DELL_PowerEdge_2950": { label: "DELL_PowerEdge_2950", width: 450.03, height: 89.00, size: 2 },
    "DELL_PowerEdge_1950_1_back": { label: "DELL_PowerEdge_1950_1_back", width: 450.03, height: 44.50, size: 1 },
    "DELL_OptiPlex7050_back": { label: "DELL_OptiPlex7050_back", width: 380.03, height: 178.01, size: 4 },
    "DELL_PowerEdge_2950_2": { label: "DELL_PowerEdge_2950_2", width: 450.03, height: 89.00, size: 2 },
    "DELL_PowerEdge_R610": { label: "DELL_PowerEdge_R610", width: 450.03, height: 44.50, size: 1 },
    "BROADV_BHAA48_back": { label: "BROADV_BHAA48_back", width: 450.03, height: 44.50, size: 1 },
    "DELL_PowerEdge_2950_2_back": { label: "DELL_PowerEdge_2950_2_back", width: 450.03, height: 89.00, size: 2 },
    "DELL_PowerEdge_R710": { label: "DELL_PowerEdge_R710", width: 450.03, height: 89.00, size: 2 },
    "DELL_PowerEdge_R720": { label: "DELL_PowerEdge_R720", width: 450.03, height: 89.00, size: 2 },
    "DELL_PowerEdge_R720_back": { label: "DELL_PowerEdge_R720_back", width: 450.03, height: 89.00, size: 2 },
    "DELL_PowerEdge_2950_back": { label: "DELL_PowerEdge_2950_back", width: 450.03, height: 89.00, size: 2 },
    "DELL_PowerEdge_R610_back": { label: "DELL_PowerEdge_R610_back", width: 450.03, height: 44.50, size: 1 },
    "DELL_OptiPlex7050": { label: "DELL_OptiPlex7050", width: 380.03, height: 178.01, size: 4 },
    "DELL_PowerVault_MD3200_back": { label: "DELL_PowerVault_MD3200_back", width: 450.03, height: 89.00, size: 2 },
    "DELL_PowerVault_MD3200": { label: "DELL_PowerVault_MD3200", width: 450.03, height: 89.00, size: 2 },
    "DELL_PowerEdge_R710_back": { label: "DELL_PowerEdge_R710_back", width: 450.03, height: 89.00, size: 2 },
    "EMC_VNX5300DPE_back": { label: "EMC_VNX5300DPE_back", width: 450.03, height: 133.51, size: 3 },
    "EMC_VNX5300DPE": { label: "EMC_VNX5300DPE", width: 450.03, height: 133.51, size: 3 },
    "EMC_VNX5600_1_back": { label: "EMC_VNX5600_1_back", width: 450.03, height: 44.50, size: 1 },
    "EMC_VNX5600_2_back": { label: "EMC_VNX5600_2_back", width: 450.03, height: 89.00, size: 2 },
    "EMC_VNX5600_3": { label: "EMC_VNX5600_3", width: 450.03, height: 133.53, size: 3 },
    "EMC_VNX5600_1": { label: "EMC_VNX5600_1", width: 450.03, height: 44.50, size: 1 },
    "EMC_VNX5600_3_back": { label: "EMC_VNX5600_3_back", width: 450.03, height: 133.53, size: 3 },
    "EMC_VNX5600_2": { label: "EMC_VNX5600_2", width: 450.03, height: 89.00, size: 2 },
    "equipment_Rectifier": { label: "equipment_Rectifier", width: 450.03, height: 133.51, size: 3 },
    "EMC_VNX5600_brand_back": { label: "EMC_VNX5600_brand_back", width: 450.03, height: 133.51, size: 3 },
    "FiberHome_Fengine_FR2600_back": { label: "FiberHome_Fengine_FR2600_back", width: 450.03, height: 44.50, size: 1 },
    "FiberHome_Fengine_FR2600": { label: "FiberHome_Fengine_FR2600", width: 450.03, height: 44.50, size: 1 },
    "H3C_CE3000_Series": { label: "H3C_CE3000_Series", width: 450.03, height: 44.50, size: 1 },
    "H3C_S5120_Series": { label: "H3C_S5120_Series", width: 450.03, height: 44.50, size: 1 },
    "H3C_S5120_Series_back": { label: "H3C_S5120_Series_back", width: 450.03, height: 44.50, size: 1 },
    "H3C_S5500D_Series": { label: "H3C_S5500D_Series", width: 450.03, height: 44.50, size: 1 },
    "H3C_S5500D_Series_back": { label: "H3C_S5500D_Series_back", width: 450.03, height: 44.50, size: 1 },
    "H3C_CE3000_Series_back": { label: "H3C_CE3000_Series_back", width: 450.03, height: 44.50, size: 1 },
    "H3C_S5500_Series_back": { label: "H3C_S5500_Series_back", width: 450.03, height: 44.50, size: 1 },
    "H3C_S5500_Series": { label: "H3C_S5500_Series", width: 450.03, height: 44.50, size: 1 },
    "EMC_VNX5600_brand": { label: "EMC_VNX5600_brand", width: 450.03, height: 133.51, size: 3 },
    "H3C_S5560_Series": { label: "H3C_S5560_Series", width: 450.03, height: 44.50, size: 1 },
    "H3C_S5560_Series_back": { label: "H3C_S5560_Series_back", width: 450.03, height: 44.50, size: 1 },
    "H3C_S5800_Series": { label: "H3C_S5800_Series", width: 450.03, height: 89.00, size: 2 },
    "H3C_S5800_Series_back": { label: "H3C_S5800_Series_back", width: 450.03, height: 89.00, size: 2 },
    "equipment_Rectifier_back": { label: "equipment_Rectifier_back", width: 450.03, height: 133.51, size: 3 },
    "H3C_SecPath_F1000_A_EI": { label: "H3C_SecPath_F1000_A_EI", width: 450.03, height: 44.50, size: 1 },
    "H3C_S7506E": { label: "H3C_S7506E", width: 450.03, height: 578.54, size: 12 },
    "H3C_S7506E_back": { label: "H3C_S7506E_back", width: 450.03, height: 578.54, size: 12 },
    "H3C_SecPath_F1000_A_EI_back": { label: "H3C_SecPath_F1000_A_EI_back", width: 450.03, height: 44.50, size: 1 },
    "HD_IPS_G3190E1": { label: "HD_IPS_G3190E1", width: 450.03, height: 89.00, size: 2 },
    "H3C_S7608_X": { label: "H3C_S7608_X", width: 450.03, height: 578.54, size: 12 },
    "HD_IPS_G3190E1_back": { label: "HD_IPS_G3190E1_back", width: 450.03, height: 89.00, size: 2 },
    "HD_WAF_S4619_1": { label: "HD_WAF_S4619_1", width: 450.03, height: 89.00, size: 2 },
    "HD_WAF_S4619_1_back": { label: "HD_WAF_S4619_1_back", width: 450.03, height: 89.00, size: 2 },
    "Hillstone_SG_6000_01": { label: "Hillstone_SG_6000_01", width: 450.03, height: 89.00, size: 2 },
    "Hillstone_SG_6000_01_back": { label: "Hillstone_SG_6000_01_back", width: 450.03, height: 89.00, size: 2 },
    "H3C_S7608_X_back": { label: "H3C_S7608_X_back", width: 450.03, height: 578.54, size: 12 },
    "hp_ProLiant_DL380P_Gen8": { label: "hp_ProLiant_DL380P_Gen8", width: 450.03, height: 89.00, size: 2 },
    "hp_ProLiant_DL380P_Gen8_back": { label: "hp_ProLiant_DL380P_Gen8_back", width: 450.03, height: 89.00, size: 2 },
    "hp_Z230_Workstation_back": { label: "hp_Z230_Workstation_back", width: 380.03, height: 178.01, size: 4 },
    "HUAWEI_OceanStor2600v3": { label: "HUAWEI_OceanStor2600v3", width: 450.03, height: 89.00, size: 2 },
    "HUAWEI_OceanStor2600v3_back": { label: "HUAWEI_OceanStor2600v3_back", width: 450.03, height: 89.00, size: 2 },
    "HUAWEI_OceanStor2600v3_2": { label: "HUAWEI_OceanStor2600v3_2", width: 450.03, height: 178.01, size: 4 },
    "HUAWEI_OceanStor2600v3_2_back": { label: "HUAWEI_OceanStor2600v3_2_back", width: 450.03, height: 178.01, size: 4 },
    "HUAWEI_OptiX_OSN500": { label: "HUAWEI_OptiX_OSN500", width: 450.03, height: 44.50, size: 1 },
    "HUAWEI_OptiX_OSN500_back": { label: "HUAWEI_OptiX_OSN500_back", width: 450.03, height: 44.50, size: 1 },
    "HUAWEI_Quidway_NetEngine_20E8": { label: "HUAWEI_Quidway_NetEngine_20E8", width: 450.03, height: 267.02, size: 6 },
    "HUAWEI_Quidway_NetEngine_20E8_back": { label: "HUAWEI_Quidway_NetEngine_20E8_back", width: 450.03, height: 267.02, size: 6 },
    "hp_Z230_Workstation": { label: "hp_Z230_Workstation", width: 380.03, height: 178.01, size: 4 },
    "HUAWEI_Quidway_S2026": { label: "HUAWEI_Quidway_S2026", width: 450.03, height: 44.50, size: 1 },
    "HUAWEI_Quidway_S2026B": { label: "HUAWEI_Quidway_S2026B", width: 450.03, height: 44.50, size: 1 },
    "HUAWEI_Quidway_S2026B_back": { label: "HUAWEI_Quidway_S2026B_back", width: 450.03, height: 44.50, size: 1 },
    "HUAWEI_Quidway_S2026_back": { label: "HUAWEI_Quidway_S2026_back", width: 450.03, height: 44.50, size: 1 },
    "HUAWEI_Quidway_S3300_back": { label: "HUAWEI_Quidway_S3300_back", width: 450.03, height: 44.50, size: 1 },
    "HUAWEI_Quidway_S3300": { label: "HUAWEI_Quidway_S3300", width: 450.03, height: 44.50, size: 1 },
    "HUAWEI_Quidway_S5328": { label: "HUAWEI_Quidway_S5328", width: 450.03, height: 44.50, size: 1 },
    "HUAWEI_S5700_48TP_SI_AC": { label: "HUAWEI_S5700_48TP_SI_AC", width: 450.03, height: 44.50, size: 1 },
    "HUAWEI_Quidway_S5328_back": { label: "HUAWEI_Quidway_S5328_back", width: 450.03, height: 44.50, size: 1 },
    "IBM_System_X3350_M3": { label: "IBM_System_X3350_M3", width: 450.03, height: 44.50, size: 1 },
    "HUAWEI_S5700_48TP_SI_AC_back": { label: "HUAWEI_S5700_48TP_SI_AC_back", width: 450.03, height: 44.50, size: 1 },
    "IBM_System_X3350_M3_back": { label: "IBM_System_X3350_M3_back", width: 450.03, height: 44.50, size: 1 },
    "IBM_Storwize_V3700_back": { label: "IBM_Storwize_V3700_back", width: 450.03, height: 89.00, size: 2 },
    "IBM_Storwize_V3700": { label: "IBM_Storwize_V3700", width: 450.03, height: 89.00, size: 2 },
    "IBM_System_x3530_M4_back": { label: "IBM_System_x3530_M4_back", width: 450.03, height: 44.50, size: 1 },
    "IBM_System_X3630_M4": { label: "IBM_System_X3630_M4", width: 450.03, height: 89.00, size: 2 },
    "IBM_System_X3630_M4_back": { label: "IBM_System_X3630_M4_back", width: 450.03, height: 89.00, size: 2 },
    "IBM_System_x3650_M4": { label: "IBM_System_x3650_M4", width: 450.03, height: 89.00, size: 2 },
    "IBM_System_x3650_M4_back": { label: "IBM_System_x3650_M4_back", width: 450.03, height: 89.00, size: 2 },
    "IBM_System_x3850_X5": { label: "IBM_System_x3850_X5", width: 450.03, height: 177.81, size: 4 },
    "IBM_System_x3850_X5_back": { label: "IBM_System_x3850_X5_back", width: 450.03, height: 177.81, size: 4 },
    "inspur_blade_back": { label: "inspur_blade_back", width: 450.03, height: 267.02, size: 6 },
    "IBM_System_x3530_M4": { label: "IBM_System_x3530_M4", width: 450.03, height: 44.50, size: 1 },
    "KYSTAR_equipment": { label: "KYSTAR_equipment", width: 450.03, height: 44.50, size: 1 },
    "KYSTAR_equipment2": { label: "KYSTAR_equipment2", width: 450.03, height: 89.00, size: 2 },
    "KYSTAR_equipment2_back": { label: "KYSTAR_equipment2_back", width: 450.03, height: 89.00, size: 2 },
    "KYSTAR_equipment_back": { label: "KYSTAR_equipment_back", width: 450.03, height: 44.50, size: 1 },
    "optix_155_622H": { label: "optix_155_622H", width: 450.03, height: 133.51, size: 3 },
    "Lenovo_System_x3650_M5_back": { label: "Lenovo_System_x3650_M5_back", width: 450.03, height: 89.00, size: 2 },
    "Lenovo_System_x3650_M5": { label: "Lenovo_System_x3650_M5", width: 450.03, height: 89.00, size: 2 },
    "QDGDS_TVZ3100": { label: "QDGDS_TVZ3100", width: 450.03, height: 44.50, size: 1 },
    "optix_155_622H_back": { label: "optix_155_622H_back", width: 450.03, height: 133.51, size: 3 },
    "Radware_LinkProof2008": { label: "Radware_LinkProof2008", width: 450.03, height: 44.50, size: 1 },
    "QDGDS_TVZ3100_back": { label: "QDGDS_TVZ3100_back", width: 450.03, height: 44.50, size: 1 },
    "Raritan_KX2_216": { label: "Raritan_KX2_216", width: 450.03, height: 44.50, size: 1 },
    "Raritan_KX2_216_back": { label: "Raritan_KX2_216_back", width: 450.03, height: 44.50, size: 1 },
    "inspur_blade": { label: "inspur_blade", width: 450.03, height: 267.02, size: 6 },
    "Raritan_KX2_464": { label: "Raritan_KX2_464", width: 450.03, height: 89.00, size: 2 },
    "Raritan_KX2_464_back": { label: "Raritan_KX2_464_back", width: 450.03, height: 89.00, size: 2 },
    "Radware_LinkProof2008_back": { label: "Radware_LinkProof2008_back", width: 450.03, height: 44.50, size: 1 },
    "Raritan_Secure_Gateway_V1": { label: "Raritan_Secure_Gateway_V1", width: 450.03, height: 44.50, size: 1 },
    "Ruijie_RG_ACE3000": { label: "Ruijie_RG_ACE3000", width: 450.03, height: 89.00, size: 2 },
    "Ruijie_RG_ACE3000_back": { label: "Ruijie_RG_ACE3000_back", width: 450.03, height: 89.00, size: 2 },
    "Ruijie_RG_IDS2000S_back": { label: "Ruijie_RG_IDS2000S_back", width: 450.03, height: 89.00, size: 2 },
    "Ruijie_RG_IDS2000S": { label: "Ruijie_RG_IDS2000S", width: 450.03, height: 89.00, size: 2 },
    "Raritan_Secure_Gateway_V1_back": { label: "Raritan_Secure_Gateway_V1_back", width: 450.03, height: 44.50, size: 1 },
    "Ruijie_RG_S2927XG_back": { label: "Ruijie_RG_S2927XG_back", width: 450.03, height: 44.50, size: 1 },
    "Ruijie_RG_NPE60": { label: "Ruijie_RG_NPE60", width: 450.03, height: 89.00, size: 2 },
    "Ruijie_RG_S5750_24GT_12SFP_back": { label: "Ruijie_RG_S5750_24GT_12SFP_back", width: 450.03, height: 44.50, size: 1 },
    "Ruijie_RG_S5750_24GT_12SFP": { label: "Ruijie_RG_S5750_24GT_12SFP", width: 450.03, height: 44.50, size: 1 },
    "Ruijie_RG_S2927XG": { label: "Ruijie_RG_S2927XG", width: 450.03, height: 44.50, size: 1 },
    "Ruijie_RG_S5750_24SFP_12GT": { label: "Ruijie_RG_S5750_24SFP_12GT", width: 450.03, height: 44.50, size: 1 },
    "Ruijie_RG_S5750_28GT_L_back": { label: "Ruijie_RG_S5750_28GT_L_back", width: 450.03, height: 44.50, size: 1 },
    "Ruijie_RG_S5750_48GT_4SFP_back": { label: "Ruijie_RG_S5750_48GT_4SFP_back", width: 450.03, height: 44.50, size: 1 },
    "Ruijie_RG_NPE60_back": { label: "Ruijie_RG_NPE60_back", width: 450.03, height: 89.00, size: 2 },
    "Ruijie_RG_S5750_48GT_4SFP": { label: "Ruijie_RG_S5750_48GT_4SFP", width: 450.03, height: 44.50, size: 1 },
    "Ruijie_RG_S5750_28GT_L": { label: "Ruijie_RG_S5750_28GT_L", width: 450.03, height: 44.50, size: 1 },
    "Ruijie_RG_S5750_24SFP_12GT_back": { label: "Ruijie_RG_S5750_24SFP_12GT_back", width: 450.03, height: 44.50, size: 1 },
    "Ruijie_RG_S8610_back": { label: "Ruijie_RG_S8610_back", width: 450.03, height: 979.06, size: 22 },
    "Ruijie_RG_S8614": { label: "Ruijie_RG_S8614", width: 450.03, height: 979.06, size: 22 },
    "Ruijie_RG_WALL1600T_back": { label: "Ruijie_RG_WALL1600T_back", width: 450.03, height: 89.00, size: 2 },
    "Ruijie_RG_WALL1600T": { label: "Ruijie_RG_WALL1600T", width: 450.03, height: 89.00, size: 2 },
    "Ruijie_RG_S8614_back": { label: "Ruijie_RG_S8614_back", width: 450.03, height: 979.06, size: 22 },
    "Ruijie_RG_WALL_V1600E_back": { label: "Ruijie_RG_WALL_V1600E_back", width: 450.03, height: 89.00, size: 2 },
    "Ruijie_RG_WALL_V1600E": { label: "Ruijie_RG_WALL_V1600E", width: 450.03, height: 89.00, size: 2 },
    "Ruijie_RG_WS5708": { label: "Ruijie_RG_WS5708", width: 450.03, height: 89.00, size: 2 },
    "Ruijie_STAR_RPS_back": { label: "Ruijie_STAR_RPS_back", width: 450.03, height: 44.50, size: 1 },
    "Ruijie_STAR_RPS": { label: "Ruijie_STAR_RPS", width: 450.03, height: 44.50, size: 1 },
    "Ruijie_RG_S8610": { label: "Ruijie_RG_S8610", width: 450.03, height: 979.06, size: 22 },
    "Storbridge_3640": { label: "Storbridge_3640", width: 450.03, height: 133.51, size: 3 },
    "SUNSEA_ODU_back": { label: "SUNSEA_ODU_back", width: 450.03, height: 44.50, size: 1 },
    "SUNSEA_ODU": { label: "SUNSEA_ODU", width: 450.03, height: 44.50, size: 1 },
    "SUNSEA_ODU2_back": { label: "SUNSEA_ODU2_back", width: 450.03, height: 89.00, size: 2 },
    "SUNSEA_ODU2": { label: "SUNSEA_ODU2", width: 450.03, height: 89.00, size: 2 },
    "Supermicro_MIRANDA": { label: "Supermicro_MIRANDA", width: 450.03, height: 44.50, size: 1 },
    "Supermicro_MIRANDA2_back": { label: "Supermicro_MIRANDA2_back", width: 450.03, height: 89.00, size: 2 },
    "TVU_receiver": { label: "TVU_receiver", width: 450.03, height: 44.50, size: 1 },
    "TVU_receiver_back": { label: "TVU_receiver_back", width: 450.03, height: 44.50, size: 1 },
    "UNT_i_MOD_SERIES": { label: "UNT_i_MOD_SERIES", width: 450.03, height: 44.50, size: 1 },
    "UNT_i_MOD_SERIES_back": { label: "UNT_i_MOD_SERIES_back", width: 450.03, height: 44.50, size: 1 },
    "Storbridge_3640_back": { label: "Storbridge_3640_back", width: 450.03, height: 133.51, size: 3 },
    "Venus_equipment": { label: "Venus_equipment", width: 450.03, height: 89.00, size: 2 },
    "video4a_AnyStreaming": { label: "video4a_AnyStreaming", width: 450.03, height: 44.50, size: 1 },
    "Venus_equipment_back": { label: "Venus_equipment_back", width: 450.03, height: 89.00, size: 2 },
    "video4a_AnyStreaming_back": { label: "video4a_AnyStreaming_back", width: 450.03, height: 44.50, size: 1 },
    "Ruijie_RG_WS5708_back": { label: "Ruijie_RG_WS5708_back", width: 450.03, height: 89.00, size: 2 },
    "Supermicro_MIRANDA_back": { label: "Supermicro_MIRANDA_back", width: 450.03, height: 44.50, size: 1 },
    "Supermicro_MIRANDA2": { label: "Supermicro_MIRANDA2", width: 450.03, height: 89.00, size: 2 },
    "H3C_UIS_R390_G2_back": { label: "H3C_UIS_R390_G2_back", width: 450.03, height: 89.00, size: 2 },
    "H3C_UIS_R390_G2": { label: "H3C_UIS_R390_G2", width: 500.03, height: 89.00, size: 2 },
    "H3C_UIS_R690_G2_back": { label: "H3C_UIS_R690_G2_back", width: 450.03, height: 178.01, size: 4 },
    "H3C_UIS_R690_G2": { label: "H3C_UIS_R690_G2", width: 500.03, height: 178.01, size: 4 },
}


/**
 * 注册背板
 */
for (var name in panelDef) {
    registerServerBackPanel(name, panelDef[name]);
    registerServerBackPanel3D(name, panelDef[name]);
}

make.Default.register('twaver.idc.background.panel', function (json) {

    make.Default.copyProperties({
        style: {},
        client: {
            host: true,
            resizeable: true,
            editable: true,
        }
    }, json);
    return make.Default.createFollower(json);
}, {
        name: '设备',
        modelDefaultParameters: {
            width: {
                name: "宽度",
                value: make.Default.getEquipmentWidth() * 10, //换算成mm
                type: make.Default.PARAMETER_TYPE_INT,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR
            },
            height: {
                name: "高度",
                value: make.Default.getEquipmentHeight(1) * 10, //换算成mm
                type: make.Default.PARAMETER_TYPE_INT,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR
            },
            "vector.fill.color": {
                name: "背景色",
                value: '#444444',
                type: make.Default.PARAMETER_TYPE_COLOR,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_STYLE
            }
        },
        category: '面板背板',
        icon: getIdcIconPath('network_panel.png'),
        host: true,
    });

/**
 * 网络设备,纯色背板
 */
make.Default.copy('twaver.idc.network.panel', 'twaver.idc.background.panel', {
    style: {
        'body.type': 'vector',
        'vector.shape': 'rectangle',
        'vector.fill': true,
    }
});


/**
 * 板卡,纯色背板
 */
make.Default.register('twaver.idc.card.panel', function (json) {

    make.Default.copyProperties({
        style: {
            'body.type': 'vector',
            'vector.shape': 'rectangle',
            'vector.fill': true,
        },
        client: {
            category: 'networkDevice-panel',
            host: true,
            resizeable: true,
            editable: true,
        }
    }, json);
    return make.Default.createFollower(json);
}, {
        name: '板卡',
        modelDefaultParameters: {
            width: {
                name: "宽度",
                value: 50,
                type: make.Default.PARAMETER_TYPE_INT,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR
            },
            height: {
                name: "高度",
                value: 500,
                type: make.Default.PARAMETER_TYPE_INT,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR
            },
            "vector.fill.color": {
                name: "背景色",
                value: '#444444',
                type: make.Default.PARAMETER_TYPE_COLOR,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_STYLE
            }
        },
        category: '面板背板',
        icon: getIdcIconPath('card_panel.png'),
        host: true,
    });

/**
 * 面板槽位
 */
make.Default.register('twaver.idc.slot.panel', function (json) {

    make.Default.copyProperties({
        style: {
            'body.type': 'vector',
            'vector.fill.color': 'gray'
        },
        client: {
            host: false,
            resizeable: true,
            editable: true,
            slot: true
        }
    }, json);
    return make.Default.createFollower(json);
}, {
        name: '槽位',
        modelDefaultParameters: {
            position: {
                name: "位置[x,y,z]",
                value: [0, 0, 0],
                type: make.Default.PARAMETER_TYPE_ARRAY_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
                hidden: true,
            },
            x: {
                name: "X轴位置",
                value: 0,
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
                exportable: false,
            },
            y: {
                name: "Y轴位置",
                value: 0,
                type: make.Default.PARAMETER_TYPE_NUMBER,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
                exportable: false,
            },
            width: {
                name: "宽度",
                value: 30,
                type: make.Default.PARAMETER_TYPE_INT,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR
            },
            height: {
                name: "高度",
                value: 100,
                type: make.Default.PARAMETER_TYPE_INT,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR
            },
            bid: {
                name: "业务ID",
                value: undefined,
                type: make.Default.PARAMETER_TYPE_STRING,
                propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
                index: 0
            }
        },
        category: '面板部件',
        icon: getIdcIconPath('card_panel.png'),
        host: false,
    });


/**
 * 服务器面板,1U到8U
 */
var getServerPanelProps = function (size) {
    return {
        imageUrl: getIdcSVGPath(size + 'u'),
        width: make.Default.getEquipmentWidth() * 10,
        height: make.Default.getEquipmentHeight(size) * 10,
        client: {
            size: size,
            category: 'device-panel',
            host: true,
        }
    }
}

/**
 * 服务器背板
 * @param size
 * @returns {{name: string, category: string, icon, host: boolean}}
 */
var getServerPanelParams = function (size) {
    return {
        name: size + 'U设备',
        category: '面板背板',
        icon: getIdcIconPath('' + size + 'u.png'),
        host: true,
    }
}

/**
 * 注册服务器背板
 * @param size
 */
var registerServerPanel = function (size) {
    var id = 'twaver.idc.equipment' + size + '.panel';
    make.Default.register(id, function (json) {
        make.Default.copyProperties(getServerPanelProps(size, json.scale), json);
        json.client.id = id;
        return make.Default.createFollower(json);
    }, getServerPanelParams(size));
}

/**
 * 注册服务器背板
 */
for (var size = 1; size <= 8; size++) {
    registerServerPanel(size);
}

/**
 * 面板部件
 * @param name
 * @param json
 * @returns {{imageUrl, client: {category: string, host: boolean}}}
 */
var getServerPanelCompProps = function (name, json) {
    return {
        imageUrl: getIdcSVGPath(name),
        client: {
            category: 'device-panel-comp',
            host: false,
        }
    }
}


/**
 * 面板部件属性
 * @param args
 * @returns {{name: *, modelDefaultParameters: {width: {name: string, value: *, type: string, propertyType: string}, height: {name: string, value: *, type: string, propertyType: string}, position: {name: string, value: number[], type: string, propertyType: string, hidden: boolean}, x: {name: string, value: number, type: string, propertyType: string, exportable: boolean}, y: {name: string, value: number, type: string, propertyType: string, exportable: boolean}, rotation: {name: string, value: number[], type: string, propertyType: string, hidden: boolean}, angle: {name: string, value: number, type: string, propertyType: string, exportable: boolean}, decoration: {name: string, value: *, type: string, propertyType: string, hidden: boolean}}, category: string, icon}}
 */
var getServerPanelCompParams = function (args) {

    var modelDefaultParameters = {
        width: {
            name: "宽度",
            value: args.width,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR
        },
        height: {
            name: "高度",
            value: args.height,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR
        },
        position: {
            name: "位置[x,y,z]",
            value: [0, 0, 0],
            type: make.Default.PARAMETER_TYPE_ARRAY_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
            hidden: true,
        },
        x: {
            name: "X轴位置",
            value: 0,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
            exportable: false,
        },
        y: {
            name: "Y轴位置",
            value: 0,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
            exportable: false,
        },
        rotation: {
            name: "旋转[x,y,z]",
            value: [0, 0, 0],
            type: make.Default.PARAMETER_TYPE_ARRAY_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
            hidden: true,
        },
        angle: {
            name: "Z轴旋转",
            value: 0,
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_ACCESSOR,
            exportable: false,
        },
        decoration: {
            name: "装饰部件",
            value: args.decoration,
            type: make.Default.PARAMETER_TYPE_BOOLEAN,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
            hidden: true,
        },
    };
    if (!args.decoration) {
        modelDefaultParameters['bid'] = {
            name: "业务ID",
            value: undefined,
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
            index: 0
        }
    }
    var result = {
        name: args.name,
        modelDefaultParameters: modelDefaultParameters,
        category: '面板部件',
        icon: getIdcIconPath(name + '.png'),
    }

    return result;
}

make.Default.register('twaver.idc.component.panel', function (json) {

    make.Default.copyProperties({
        client: {
            category: 'device-panel-comp',
            host: false,
        }
    }, json);
    var follower = make.Default.createFollower(json);
    return follower;
}, getServerPanelCompParams({ width: 0, height: 0, decoration: false, name: 'component' }));

/**
 * 注册背板部件
 * @param name
 * @param args
 */
var registerServerPanelComp = function (name, args) {

    var id = 'twaver.idc.' + name + '.panel';
    make.Default.copy(id, 'twaver.idc.component.panel', function (json) {
        json.imageUrl = getIdcSVGPath(name);
    }, function (params) {
        params.name = args.label;
        params.icon = getIdcIconPath(name + '.png');
        params.modelDefaultParameters.width.value = args.width;
        params.modelDefaultParameters.height.value = args.height;
        params.modelDefaultParameters.decoration.value = args.decoration;
        return params;
    })
}

/**
 * 注册3D背板
 * @param name
 * @param args
 */
//需要在这里设置position
var registerServerPanelComp3D = function (name, args) {

    var id = 'twaver.idc.' + name + '.panel.3d';
    var depth = 1;
    make.Default.register(id, function (json, callback) {

        make.Default.copyProperties({
            color: 'gray',
            depth: make.Default.PanelCompDepth,
            frontImage: getIdcSVGPath(name),
            style: {
                'front.m.color': 'white',
                'front.m.ambient': 'white'
            }
        }, json);
        make.Default.copyProperties(args, json);
        json.width /= 10, json.height /= 10, json.depth /= 10;

        var cube = make.Default.createCube(json);
        cube.setStyle('m.transparent', true);
        if (json.objectId) {
            cube._id = json.objectId;
        }
        var position = json.position || [0, 0, 0];
        json.position = [position[0] / 10, position[1] / 10, position[2] / 10];
        make.Default.setObject3dCommonProps(cube, json);
        cube.setPositionZ(make.Default.PanelBackDepth / 10 / 2);
        callback && callback(cube);
        return cube;
    }, {});
}

var compDef = {
    "AV": { label: "AV", width: 30.04, height: 8.00, decoration: true },
    "AV1": { label: "AV1", width: 8.00, height: 8.00 },
    "AV2": { label: "AV2", width: 8.00, height: 8.00 },
    "AV3": { label: "AV3", width: 8.00, height: 8.00 },
    "AV4": { label: "AV4", width: 8.00, height: 8.00 },
    "AV5": { label: "AV5", width: 8.00, height: 8.00 },
    "AV6": { label: "AV6", width: 8.00, height: 8.00 },
    "ball-black": { label: "ball-black", width: 5.00, height: 5.00 },
    "ball-blue": { label: "ball-blue", width: 3.41, height: 3.41 },
    "ball-gray": { label: "ball-gray", width: 3, height: 3 },
    "ball-gray2": { label: "ball-gray", width: 3.35, height: 2.36 },
    "ball-gray3": { label: "ball-gray3", width: 3.47, height: 3.47 },
    "ball-green": { label: "ball-green", width: 5.00, height: 5.00 },
    "ball-green2": { label: "ball-green2", width: 4.82, height: 4.82 },
    "ball-green3": { label: "ball-green3", width: 3, height: 3 },
    "ball-green4": { label: "ball-green4", width: 14.61, height: 8.50 },
    "ball-green5": { label: "ball-green5", width: 6.13, height: 6.13 },
    "ball-red": { label: "ball-red", width: 5.00, height: 5.00 },
    "ball-yellow": { label: "ball-yellow", width: 5.00, height: 5.00 },
    "ball-yellow1": { label: "ball-yellow1", width: 4.73, height: 4.73 },
    "ball-yellow2": { label: "ball-yellow2", width: 3.35, height: 2.36 },
    "ball-yellow3": { label: "ball-yellow3", width: 3.35, height: 2.36 },
    "ball-yellow4": { label: "ball-yellow4", width: 3.47, height: 3.47 },
    "bt1": { label: "bt1", width: 8.00, height: 8.00 },
    "bt10": { label: "bt10", width: 9.65, height: 21.69 },
    "bt11": { label: "bt11", width: 10.32, height: 10.32 },
    "bt12": { label: "bt12", width: 7.94, height: 7.94 },
    "bt14": { label: "bt14", width: 7.94, height: 7.94 },
    "bt13": { label: "bt13", width: 7.94, height: 7.94 },
    "bt15": { label: "bt15", width: 21.64, height: 11.39 },
    "bt2": { label: "bt2", width: 8.00, height: 8.00 },
    "bt3": { label: "bt3", width: 8.00, height: 8.00 },
    "bt4": { label: "bt4", width: 8.00, height: 8.00 },
    "bt5": { label: "bt5", width: 8.00, height: 8.00 },
    "bt6": { label: "bt6", width: 8.00, height: 8.00 },
    "bt7": { label: "bt7", width: 8.00, height: 8.00 },
    "bt8": { label: "bt8", width: 8.00, height: 8.00 },
    "bt9": { label: "bt9", width: 21.64, height: 11.39 },
    "button_01": { label: "button_01", width: 18.47, height: 4.58 },
    "button_02": { label: "button_02", width: 14.56, height: 14.56 },
    "button-power": { label: "button-power", width: 17.92, height: 17.92 },
    "deco_01": { label: "deco_01", width: 14.73, height: 15.66 },
    "deco_02": { label: "deco_02", width: 17.98, height: 52.17 },
    "deco_03": { label: "deco_03", width: 14.55, height: 177.81 },
    "deco_04": { label: "deco_04", width: 179.63, height: 93.09 },
    "deco_05": { label: "deco_05", width: 3.09, height: 76.12 },
    "deco_06": { label: "deco_06", width: 14.55, height: 10.95 },
    "deco_07": { label: "deco_07", width: 67.41, height: 177.56 },
    "deco_08": { label: "deco_08", width: 191.80, height: 11.44 },
    "deco_09": { label: "deco_09", width: 359.13, height: 61.35 },
    "deco_10": { label: "deco_10", width: 22.15, height: 88.91 },
    "deco_11": { label: "deco_11", width: 52.33, height: 42.96 },
    "deco_12": { label: "deco_12", width: 155.36, height: 48.68 },
    "deco_13": { label: "deco_13", width: 169.03, height: 2.19 },
    "deco_14": { label: "deco_14", width: 64.68, height: 5.51 },
    "deco_15": { label: "deco_15", width: 18.66, height: 19.58 },
    "deco_16": { label: "deco_16", width: 18.66, height: 19.58 },
    "deco_17": { label: "deco_17", width: 27.27, height: 8.34 },
    "deco_18": { label: "deco_18", width: 9.32, height: 4.45 },
    "deco_19": { label: "deco_19", width: 21.42, height: 88.91 },
    "deco_20": { label: "deco_20", width: 20.00, height: 12.00 },
    "deco_21": { label: "deco_21", width: 16.29, height: 16.29 },
    "deco_22": { label: "deco_22", width: 408.23, height: 86.87 },
    "deco_23": { label: "deco_23", width: 9.64, height: 9.64 },
    "deco_24": { label: "deco_24", width: 7.17, height: 3.11 },
    "deco_25": { label: "deco_25", width: 6.80, height: 3.11 },
    "deco_26": { label: "deco_26", width: 4.16, height: 2.89 },
    "deco_27": { label: "deco_27", width: 3.06, height: 3.06 },
    "deco_28": { label: "deco_28", width: 7.50, height: 7.50 },
    "deco_29": { label: "deco_29", width: 90.00, height: 40.55 },
    "deco_30": { label: "deco_30", width: 89.99, height: 40.54 },
    "deco_31": { label: "deco_31", width: 78.35, height: 16.54 },
    "deco_32": { label: "deco_32", width: 89.49, height: 39.51 },
    "deco_33": { label: "deco_33", width: 34.29, height: 33.87 },
    "deco_34": { label: "deco_34", width: 95.81, height: 27.17 },
    "deco_35": { label: "deco_35", width: 81.25, height: 35.92 },
    "deco_36": { label: "deco_36", width: 79.45, height: 40.47 },
    "deco_38": { label: "deco_38", width: 44.10, height: 81.85 },
    "deco_37": { label: "deco_37", width: 68.59, height: 36.21 },
    "deco_39": { label: "deco_39", width: 118.19, height: 41.28 },
    "deco_40": { label: "deco_40", width: 160.52, height: 43.04 },
    "dell": { label: "dell", width: 17.92, height: 17.92 },
    "disk_01": { label: "disk_01", width: 17.92, height: 76.52 },
    "disk_02": { label: "disk_02", width: 126.42, height: 16.45 },
    "disk_03": { label: "disk_03", width: 126.43, height: 16.44 },
    "disk_04": { label: "disk_04", width: 133.71, height: 49.85 },
    "disk_05": { label: "disk_05", width: 14.44, height: 75.49 },
    "disk_06": { label: "disk_06", width: 127.87, height: 11.44 },
    "disk_07": { label: "disk_07", width: 80.34, height: 18.14 },
    "disk_08": { label: "disk_08", width: 98.01, height: 27.65 },
    "disk_09": { label: "disk_09", width: 98.01, height: 27.65 },
    "disk_10": { label: "disk_10", width: 96.46, height: 26.39 },
    "disk_11": { label: "disk_11", width: 72.23, height: 15.24 },
    "disk_12": { label: "disk_12", width: 21.72, height: 1.89 },
    "disk_13": { label: "disk_13", width: 14.14, height: 80.50 },
    "disk_14": { label: "disk_14", width: 175.94, height: 33.66 },
    "disk_15": { label: "disk_15", width: 347.26, height: 29.78 },
    "disk_16": { label: "disk_16", width: 15.29, height: 75.26 },
    "disk_17": { label: "disk_17", width: 15.29, height: 75.26 },
    "disk_18": { label: "disk_18", width: 14.71, height: 84.86 },
    "disk_19": { label: "disk_19", width: 15.29, height: 75.26 },
    "disk_20": { label: "disk_20", width: 75.26, height: 15.29 },
    "disk_21": { label: "disk_21", width: 69.68, height: 15.29 },
    "disk_22": { label: "disk_22", width: 15.29, height: 75.26 },
    "disk_23": { label: "disk_23", width: 15.29, height: 75.26 },
    "disk_24": { label: "disk_24", width: 86.77, height: 14.37 },
    "disk_25": { label: "disk_25", width: 96.93, height: 38.24 },
    "disk_27": { label: "disk_27", width: 79.79, height: 18.54 },
    "disk_26": { label: "disk_26", width: 175.41, height: 39.33 },
    "disk_28": { label: "disk_28", width: 100.20, height: 25.65 },
    "disk_29": { label: "disk_29", width: 100.20, height: 25.66 },
    "disk_30": { label: "disk_30", width: 97.90, height: 26.46 },
    "disk_31": { label: "disk_31", width: 98.71, height: 25.65 },
    "disk_32": { label: "disk_32", width: 80.79, height: 25.68 },
    "disk_33": { label: "disk_33", width: 27.29, height: 115.01 },
    "disk_34": { label: "disk_34", width: 107.96, height: 26.46 },
    "DP": { label: "DP", width: 16.91, height: 6.30, decoration: true },
    "drive": { label: "drive", width: 112, height: 31 },
    "dvd": { label: "dvd", width: 133.53, height: 21.27 },
    "DVD-01": { label: "DVD-01", width: 119.54, height: 13.38 },
    "DVD-02": { label: "DVD-02", width: 201.39, height: 25.65 },
    "DVI-24-1": { label: "DVI-24-1", width: 35.07, height: 7.80, decoration: true },
    "DVI-24-5": { label: "DVI-24-5", width: 35.07, height: 7.80, decoration: true },
    "fan_01": { label: "fan_01", width: 89.49, height: 39.51 },
    "fan_02": { label: "fan_02", width: 63.68, height: 61.03 },
    "fk_01": { label: "fk_01", width: 14.00, height: 11.27 },
    "grid_01": { label: "grid_01", width: 129.55, height: 26.16 },
    "grid_02": { label: "grid_02", width: 212.96, height: 67.61 },
    "ground": { label: "ground", width: 12.00, height: 12.00 },
    "handle": { label: "handle", width: 137.59, height: 9.20 },
    "HDMI": { label: "HDMI", width: 13.91, height: 5.17, decoration: true },
    "hdmi_1": { label: "hdmi_1", width: 5.92, height: 2.90 },
    "hdmi_2": { label: "hdmi_2", width: 2.78, height: 7.18 },
    "hdmi_3": { label: "hdmi_3", width: 2.78, height: 7.18 },
    "hdmi_4": { label: "hdmi_4", width: 5.92, height: 2.90 },
    "hdmi_5": { label: "hdmi_5", width: 27.27, height: 8.23 },
    "hdmi_6": { label: "hdmi_6", width: 33.60, height: 6.95 },
    "idc15": { label: "idc15", width: 39.10, height: 12.55 },
    "idc25": { label: "idc25", width: 52.75, height: 12.20 },
    "idc37": { label: "idc37", width: 69.15, height: 12.20 },
    "idc38": { label: "idc38", width: 35.07, height: 7.45 },
    "idc39": { label: "idc39", width: 35.07, height: 7.45 },
    "idc9": { label: "idc9", width: 30.84, height: 12.55 },
    "jack10": { label: "jack10", width: 24.41, height: 24.98 },
    "jack11": { label: "jack11", width: 29.64, height: 29.64 },
    "jack12": { label: "jack12", width: 10.00, height: 10.00 },
    "jack13": { label: "jack13", width: 10.00, height: 10.00 },
    "jack3": { label: "jack3", width: 25.93, height: 17.93 },
    "jack4": { label: "jack4", width: 17.93, height: 25.81 },
    "jack5": { label: "jack5", width: 17.93, height: 25.81 },
    "jack8": { label: "jack8", width: 17.93, height: 25.81 },
    "jack9": { label: "jack9", width: 17.56, height: 11.78 },
    "JCCA": { label: "JCCA", width: 28.29, height: 13.58 },
    "Label": { label: "Label", width: 29.64, height: 29.64 },
    "led": { label: "led", width: 12.35, height: 3.53 },
    "logo_cisco01": { label: "logo_cisco01", width: 13.00, height: 6.85 },
    "logo_cisco02": { label: "logo_cisco02", width: 21.00, height: 11.85 },
    "logo_cisco03": { label: "logo_cisco03", width: 21.63, height: 11.40 },
    "logo_cisco04": { label: "logo_cisco04", width: 34.36, height: 19.62 },
    "logo_cisco05": { label: "logo_cisco05", width: 57.37, height: 30.23 },
    "logo_cisco06": { label: "logo_cisco06", width: 21.00, height: 11.76 },
    "logo_dell": { label: "logo_dell", width: 17.01, height: 5.85 },
    "logo_dell_02": { label: "logo_dell_02", width: 14.84, height: 5.10 },
    "logo_dell_03": { label: "logo_dell_03", width: 26.58, height: 26.58 },
    "logo_HBC": { label: "logo_HBC", width: 18.00, height: 4.52 },
    "logo_hp": { label: "logo_hp", width: 8.88, height: 5.2 },
    "logo_HUAWEI": { label: "logo_HUAWEI", width: 25.00, height: 5.89 },
    "logo_HUAWEI2": { label: "logo_HUAWEI2", width: 35.76, height: 8.42 },
    "logo_hw": { label: "logo_hw", width: 14.09, height: 13.72 },
    "logo_hw_02": { label: "logo_hw_02", width: 10.66, height: 1.88 },
    "logo_ibm": { label: "logo_ibm", width: 24.83, height: 25.99 },
    "logo_intel": { label: "logo_intel", width: 14.94, height: 21.81 },
    "logo_JUNIPER": { label: "logo_JUNIPER", width: 44.59, height: 11.17 },
    "logo_QNAP": { label: "logo_QNAP", width: 26.68, height: 8.54 },
    "logo_xindahuanyu": { label: "logo_xindahuanyu", width: 59.88, height: 15.08 },
    "MicroHDMI": { label: "MicroHDMI", width: 5.91, height: 2.88, decoration: true },
    "mini_USB": { label: "mini_USB", width: 6.82, height: 3.11 },
    "miniHDMI": { label: "miniHDMI", width: 10.41, height: 2.41 },
    "mirco_usb": { label: "mirco_usb", width: 7.18, height: 1.94 },
    "port_01": { label: "port_01", width: 14.2, height: 9.94 },
    "port_02": { label: "port_02", width: 7.7, height: 6.94 },
    "port_03": { label: "port_03", width: 5.07, height: 3.92 },
    "port_04": { label: "port_04", width: 60.80, height: 11.44 },
    "port_05": { label: "port_05", width: 13.99, height: 6.73 },
    "port_06": { label: "port_06", width: 13.37, height: 6.15 },
    "port_07": { label: "port_07", width: 5.01, height: 13.78 },
    "port_08": { label: "port_08", width: 14.00, height: 11.27 },
    "port_09": { label: "port_09", width: 19.67, height: 9.91 },
    "port_10": { label: "port_10", width: 18.76, height: 8.94 },
    "port_11": { label: "port_11", width: 13.15, height: 9.36 },
    "port_12": { label: "port_12", width: 13.14, height: 8.94 },
    "port_13": { label: "port_13", width: 6.70, height: 14.24 },
    "port_1394_4pin": { label: "port_1394_4pin", width: 6.00, height: 3.78 },
    "port_1394_6pin": { label: "port_1394_6pin", width: 11.22, height: 5.15 },
    "port_13w3": { label: "port_13w3", width: 54.59, height: 15.50 },
    "port_14": { label: "port_14", width: 7.54, height: 3.76 },
    "port_15": { label: "port_15", width: 28.82, height: 11.68 },
    "port_15din": { label: "port_15din", width: 8.96, height: 31.31 },
    "port_16": { label: "port_16", width: 28.82, height: 11.68 },
    "port_17": { label: "port_17", width: 13.60, height: 6.65 },
    "port_19": { label: "port_19", width: 13.05, height: 9.56 },
    "port_20": { label: "port_20", width: 15.06, height: 10.58 },
    "port_21": { label: "port_21", width: 18.24, height: 15.52 },
    "port_22": { label: "port_22", width: 18.24, height: 15.52 },
    "port_23": { label: "port_23", width: 17.99, height: 12.59 },
    "port_24": { label: "port_24", width: 11.82, height: 12.81 },
    "port_25": { label: "port_25", width: 17.99, height: 14.71 },
    "port_26": { label: "port_26", width: 32.99, height: 14.71 },
    "port_27": { label: "port_27", width: 12.00, height: 4.60 },
    "port_28": { label: "port_28", width: 15.88, height: 11.60 },
    "port_29": { label: "port_29", width: 29.29, height: 10.22 },
    "port_30": { label: "port_30", width: 12.44, height: 11.00 },
    "port_31": { label: "port_31", width: 12.44, height: 11.00 },
    "port_32": { label: "port_32", width: 32.20, height: 10.14 },
    "port_33": { label: "port_33", width: 6.82, height: 3.11 },
    "port_34": { label: "port_34", width: 14.22, height: 5.88 },
    "port_35": { label: "port_35", width: 6.38, height: 12.55 },
    "port_36": { label: "port_36", width: 11.72, height: 8.57 },
    "port_37": { label: "port_37", width: 13.64, height: 10.75 },
    "port_38": { label: "port_38", width: 11.76, height: 5.98 },
    "port_39": { label: "port_39", width: 17.72, height: 7.94 },
    "port_40": { label: "port_40", width: 7.67, height: 4.00 },
    "port_41": { label: "port_41", width: 25.28, height: 4.96 },
    "port_42": { label: "port_42", width: 13.29, height: 5.82 },
    "port_43": { label: "port_43", width: 12.70, height: 12.70 },
    "port_44": { label: "port_44", width: 17.99, height: 12.62 },
    "port_45": { label: "port_45", width: 13.61, height: 9.55 },
    "port_46": { label: "port_46", width: 16.14, height: 11.30 },
    "port_47": { label: "port_47", width: 27.92, height: 8.56 },
    "port_48": { label: "port_48", width: 33.60, height: 6.95 },
    "port_49": { label: "port_49", width: 9.31, height: 27.40 },
    "port_4din": { label: "port_4din", width: 15.00, height: 15.00 },
    "port_50": { label: "port_50", width: 13.61, height: 9.55 },
    "port_51": { label: "port_51", width: 6.85, height: 3.12 },
    "port_52": { label: "port_52", width: 35.36, height: 5.20 },
    "port_53": { label: "port_53", width: 29.64, height: 29.64 },
    "port_54": { label: "port_54", width: 6.85, height: 3.12 },
    "port_55": { label: "port_55", width: 13.64, height: 10.76 },
    "port_56": { label: "port_56", width: 15.30, height: 10.94 },
    "port_57": { label: "port_57", width: 29.64, height: 3.29 },
    "port_58": { label: "port_58", width: 16.14, height: 11.30 },
    "port_59": { label: "port_59", width: 13.06, height: 9.55 },
    "port_5din": { label: "port_5din", width: 15.00, height: 15.00 },
    "port_60": { label: "port_60", width: 13.06, height: 9.55 },
    "port_61": { label: "port_61", width: 8.93, height: 10.80 },
    "port_62": { label: "port_62", width: 11.30, height: 16.14 },
    "port_63": { label: "port_63", width: 9.55, height: 13.06 },
    "port_64": { label: "port_64", width: 17.99, height: 12.60 },
    "port_65": { label: "port_65", width: 9.06, height: 10.47 },
    "port_66": { label: "port_66", width: 9.55, height: 13.06 },
    "port_67": { label: "port_67", width: 13.88, height: 15.96 },
    "port_68": { label: "port_68", width: 6.00, height: 2.88 },
    "port_69": { label: "port_69", width: 29.64, height: 29.64 },
    "port_6din": { label: "port_6din", width: 15.00, height: 15.00 },
    "port_70": { label: "port_70", width: 8.11, height: 7.30 },
    "port_71": { label: "port_71", width: 7.30, height: 8.11 },
    "port_72": { label: "port_72", width: 13.71, height: 9.55 },
    "port_73": { label: "port_73", width: 7.30, height: 8.11 },
    "port_74": { label: "port_74", width: 13.06, height: 9.55 },
    "port_75": { label: "port_75", width: 13.64, height: 10.75 },
    "port_76": { label: "port_76", width: 13.64, height: 10.75 },
    "port_77": { label: "port_77", width: 13.64, height: 10.75 },
    "port_78": { label: "port_78", width: 10.75, height: 13.64 },
    "port_79": { label: "port_79", width: 8.93, height: 10.80 },
    "port_80": { label: "port_80", width: 8.93, height: 10.80 },
    "port_81": { label: "port_81", width: 10.80, height: 8.93 },
    "port_82": { label: "port_82", width: 7.12, height: 9.17 },
    "port_83": { label: "port_83", width: 7.12, height: 9.17 },
    "port_84": { label: "port_84", width: 13.72, height: 10.99 },
    "port_85": { label: "port_85", width: 8.00, height: 8.00 },
    "port_86": { label: "port_86", width: 7.08, height: 10.92 },
    "port_87": { label: "port_87", width: 6.95, height: 33.60 },
    "port_88": { label: "port_88", width: 8.00, height: 8.00 },
    "port_89": { label: "port_89", width: 9.06, height: 10.47 },
    "port_8din": { label: "port_8din", width: 15.00, height: 15.00 },
    "port_90": { label: "port_90", width: 16.14, height: 11.30 },
    "port_91": { label: "port_91", width: 35.07, height: 7.45 },
    "port_92": { label: "port_92", width: 6.82, height: 19.69 },
    "port_93": { label: "port_93", width: 17.22, height: 13.67 },
    "port_94": { label: "port_94", width: 10.87, height: 15.52 },
    "port_bnc": { label: "port_bnc", width: 15.59, height: 13.11 },
    "port_bnc3": { label: "port_bnc3", width: 15.59, height: 13.11 },
    "port_card34": { label: "port_card34", width: 35.36, height: 5.20 },
    "port_card54": { label: "port_card54", width: 54.00, height: 5.20 },
    "port_db25": { label: "port_db25", width: 38.00, height: 8.29 },
    "port_db25_2": { label: "port_db25_2", width: 50.27, height: 8.21 },
    "port_db25_3": { label: "port_db25_3", width: 52.75, height: 12.20 },
    "port_db36": { label: "port_db36", width: 38.13, height: 9.93 },
    "port_db9": { label: "port_db9", width: 17.58, height: 8.92 },
    "port_power": { label: "port_power", width: 15.11, height: 21.04 },
    "port38": { label: "port38", width: 33.60, height: 6.95 },
    "power": { label: "power", width: 7.28, height: 7.28 },
    "power_02": { label: "power_02", width: 8.29, height: 8.29 },
    "power_03": { label: "power_03", width: 29.19, height: 25.64 },
    "power_04": { label: "power_04", width: 7.56, height: 8.99 },
    "ps2-keyboard": { label: "ps2-keyboard", width: 10.00, height: 10.00 },
    "ps2-mouse": { label: "ps2-mouse", width: 10.00, height: 10.00 },
    "radiator": { label: "radiator", width: 31.65, height: 31.68 },
    "radiator-2": { label: "radiator-2", width: 78.00, height: 16.33 },
    "rj11": { label: "rj11", width: 9.26, height: 10.90 },
    "rj4501": { label: "rj4501", width: 13.77, height: 9.55 },
    "rj4502": { label: "rj4502", width: 13.06, height: 9.55 },
    "rj4503": { label: "rj4503", width: 13.78, height: 9.55 },
    "rj4504": { label: "rj4504", width: 18.00, height: 12.60 },
    "SCART": { label: "SCART", width: 23.71, height: 8.39 },
    "screw-black": { label: "screw-black", width: 9.00, height: 9.00 },
    "screw-gray": { label: "screw-gray", width: 12.00, height: 12.00 },
    "switch_01": { label: "switch_01", width: 11.39, height: 21.64 },
    "text_01": { label: "text_01", width: 6.90, height: 3.07 },
    "text_02": { label: "text_02", width: 34.65, height: 4.95 },
    "text_03": { label: "text_03", width: 16.56, height: 9.98 },
    "text_04": { label: "text_04", width: 6.42, height: 7.35 },
    "text_05": { label: "text_05", width: 2.60, height: 6.08 },
    "tongfeng": { label: "tongfeng", width: 80.83, height: 44.45 },
    "USB": { label: "USB", width: 12.00, height: 4.60 },
    "usb_01": { label: "usb_01", width: 12.55, height: 6.38 },
    "usb_02": { label: "usb_02", width: 12.50, height: 6.29 },
    "usb_03": { label: "usb_03", width: 13.29, height: 6.70 },
    "USB_05": { label: "USB_05", width: 16.20, height: 10.46 },
    "USB_06": { label: "USB_06", width: 12.55, height: 6.38 },
    "USB_07": { label: "USB_07", width: 32.43, height: 13.14 },
    "USB_08": { label: "USB_08", width: 32.42, height: 13.14 },
    "USB_09": { label: "USB_09", width: 26.10, height: 7.72 },
    "USB_10": { label: "USB_10", width: 17.18, height: 12.19 },
    "USB_11": { label: "USB_11", width: 15.35, height: 6.44 },
    "USB_12": { label: "USB_12", width: 17.18, height: 12.29 },
    "USB_13": { label: "USB_13", width: 10.46, height: 17.18 },
    "USB_14": { label: "USB_14", width: 28.82, height: 11.67 },
    "USB_15": { label: "USB_15", width: 13.60, height: 6.65 },
    "USB_16": { label: "USB_16", width: 18.00, height: 12.26 },
    "USB_17": { label: "USB_17", width: 7.67, height: 4.00 },
    "USB_18": { label: "USB_18", width: 14.46, height: 11.64 },
    "USB_19": { label: "USB_19", width: 14.46, height: 11.64 },
    "USB_20": { label: "USB_20", width: 4.56, height: 11.94 },
    "USB_21": { label: "USB_21", width: 7.50, height: 13.14 },
    "USB_22": { label: "USB_22", width: 13.14, height: 7.50 },
    "USB_23": { label: "USB_23", width: 7.50, height: 13.14 },
    "USB_24": { label: "USB_24", width: 12.02, height: 4.62 },
    "USB_25": { label: "USB_25", width: 13.14, height: 7.50 },
    "USB_26": { label: "USB_26", width: 7.50, height: 13.14 },
    "USB_27": { label: "USB_27", width: 7.50, height: 13.14 },
    "USB_28": { label: "USB_28", width: 25.06, height: 7.94 },
    "USB_29": { label: "USB_29", width: 25.06, height: 7.94 },
    "USB_30": { label: "USB_30", width: 13.14, height: 7.50 },
    "USB_31": { label: "USB_31", width: 29.64, height: 29.64 },
    "usb-printer": { label: "usb-printer", width: 8.12, height: 10.05 },
    "VGA": { label: "VGA", width: 24.62, height: 7.94, decoration: true },
    "VGA_01": { label: "VGA_01", width: 29.27, height: 11.54 },
    "VGA_02": { label: "VGA_02", width: 8.81, height: 18.13 },
    "VGA_03": { label: "VGA_03", width: 8.33, height: 17.38 },
    "VGA_04": { label: "VGA_04", width: 24.62, height: 7.94 },
    "VGA_05": { label: "VGA_05", width: 24.62, height: 7.94 },
    "VGA_06": { label: "VGA_06", width: 24.62, height: 7.94 },
    "VGA_07": { label: "VGA_07", width: 24.62, height: 7.94 },
    "VGA_08": { label: "VGA_08", width: 24.62, height: 7.94 },
    "w01": { label: "w01", width: 189.20, height: 20.83 },
    "w02": { label: "w02", width: 177.26, height: 30.28 },
    "warn": { label: "warn", width: 14.00, height: 14.00 },
    "ypbpr": { label: "ypbpr", width: 28.66, height: 16.96 },

}


for (var name in compDef) {
    registerServerPanelComp(name, compDef[name]);
    registerServerPanelComp3D(name, compDef[name]);
}

/*******************   deviceEditor end *********************/

/*******************inbuilt  devicePanel *********************/

var getDeviceIconPath2D = function (icon) {
    return make.Default.path + 'model/idc/icons/device/' + icon + '_front.png';
}

var getDeviceImagePath2D = function (icon) {
    return make.Default.path + 'model/idc/images/device/' + icon + '_front.jpg';
}

var getBackDeviceIconPath2D = function (icon) {
    return make.Default.path + 'model/idc/icons/device/' + icon + '_back.png';
}

var getBackDeviceImagePath2D = function (icon) {
    return make.Default.path + 'model/idc/images/device/' + icon + '_back.jpg';
}

make.Default.register('twaver.idc.panel.loader', function (json) {

    var data = json.data || [];
    var scale = json.scale || 1;
    var x = json.x || 0;
    var y = json.y || 0;

    if (!data || data.length == 0) {
        return;
    }
    data.forEach(function (d) {
        d.scale = scale;
    });

    var elements = make.Default.load(data);
    if (make.Default.getOtherParameter(data[0].id, 'host')) {

        var nodes = elements;
        var parentNode = nodes[0];
        for (var i = 1; i < nodes.length; i++) {
            nodes[i].setMovable(false);
            nodes[i].setHost(parentNode);
            nodes[i].setParent(parentNode);
            parentNode.addChild(nodes[i]);
        }
        parentNode.setLocation(x, y);
        return parentNode;
    } else {
        var result = [];
        var nodeMap = {},
            nodeArray = [],
            linkArray = [];
        elements.forEach(function (element, index) {
            element.index = index;
            if (make.Default.getOtherParameter(make.Default.getId(element), 'link')) {
                linkArray.push(element);
            } else {
                nodeArray.push(element);
                var bid = element.getClient('bid');
                if (bid && bid.length > 0) {
                    nodeMap[bid] = element;
                }
            }
        })
        nodeArray.forEach(function (n) {
            n.setMovable(false);
            result.push(n);
        })
        linkArray.forEach(function (link) {
            var linkData = data[link.index];
            link.setFromNode(nodeMap[linkData.from]);
            link.setToNode(nodeMap[linkData.to]);
            result.push(link);
        })
        return result;
    }
});

make.Default.register('twaver.idc.panel.loader.3d', function (json) {

    var data = json.data || [];
    var scale = json.scale || 1;
    var position = json.position || [0, 0, 0];

    if (!data || data.length == 0) {
        return;
    }
    var ds = [];
    data.forEach(function (d) {
        var d3 = {};
        make.Default.copyProperties(d, d3);
        d3.id += '.3d';
        ds.push(d3);
    });
    var elements = make.Default.load(ds);
    if (make.Default.getOtherParameter(data[0].id, 'host')) {

        var nodes = elements;
        var parentNode = nodes[0];
        var dx = parentNode.getWidth() / 2;
        var dy = parentNode.getHeight() / 2;
        var pp = parentNode.getDepth() / 10 / 2;
        for (var i = 1; i < nodes.length; i++) {

            // parentNode.addChild(nodes[i]);
            var p = nodes[i].p();
            p.x = p.x - dx + nodes[i].getWidth() / 2;
            p.y = dy - p.y - nodes[i].getHeight() / 2;
            // p.z += pp;
            p.z = pp + 0.2;
            nodes[i].p(p.x, p.y, p.z);
            nodes[i].setParent(parentNode);
        }
        parentNode.p(position[0], position[1], position[2]);
        //parentNode.setScale(0.1, 0.1, 0.1);
        return parentNode;
    }
});

//TODO注册时需要指定设备是服务器还是交换机，目前make center中没有指定,subtype没有值
var registerDeviceFrontPanel = function (name, props, subType) {
    var height = props.height;

    //面板图数据
    make.Default.register('twaver.idc.' + name + '.panel.data', function (json) {

        return props.frontData;
    }, {
            // subType: subType,
            icon: getDeviceIconPath2D(name),
            name: name,
            category: '设备面板',
            height: props.height
        })

    //面板图
    make.Default.copy('twaver.idc.' + name + '.panel.loader', 'twaver.idc.panel.loader', { data: props.frontData }, {
        // subType: subType,
        icon: getDeviceIconPath2D(name),
        height: props.height
    })

    //面板图
    make.Default.copy('twaver.idc.' + name + '.panel.loader.3d', 'twaver.idc.panel.loader.3d', { data: props.frontData }, {
        // subType: subType,
        icon: getDeviceIconPath2D(name),
        height: props.height
    })

}

var registerDeviceBackPanel = function (name, props, subType) {
    var height = props.height;


    //后视图
    // make.Default.copy('twaver.idc.' + name + '.device.back.front', 'twaver.idc.equipment' + height + '.front', function(json) {
    //     json.image = getDeviceImagePath2D(name);
    // }, { icon: getBackDeviceIconPath2D(name), subType: subType, height: props.height, name: name })

    //背面面板图数据
    make.Default.register('twaver.idc.' + name + '.back.panel.data', function (json) {
        return props.backData;
    }, {
            // subType: subType,
            icon: getBackDeviceIconPath2D(name),
            name: name,
            category: '设备面板',
            height: props.height
        })

    //2d背板图模型，加载2d的面板数据，并设置父子关系
    make.Default.copy('twaver.idc.' + name + '.back.panel.loader', 'twaver.idc.panel.loader', { data: props.backData }, {
        // subType: subType,
        icon: getBackDeviceIconPath2D(name),
        height: props.height
    })

    //3d背板图模型，加载3d的面板数据，并且加载3d的端口模型
    make.Default.copy('twaver.idc.' + name + '.back.panel.loader.3d', 'twaver.idc.panel.loader.3d', { data: props.backData }, {
        // subType: subType,
        icon: getBackDeviceIconPath2D(name),
        height: props.height
    })
}

var registerDeivce = function (name, devicePanel, imagePath) {
    var height = devicePanel.height;
    make.Default.copy('twaver.idc.' + name + '.device.front', 'twaver.idc.equipment' + height + '.front', function (json) {
        if (imagePath) {
            json.image = imagePath + name + '_front.jpg'
        } else {
            json.image = getDeviceImagePath2D(name);
        }

    }, {
            icon: getDeviceIconPath2D(name),
            // subType: subType,
            height: height,
            name: name
        })
}

/*var subTypes = ['server', 'network'];
for (var i = 0; i < subTypes.length; i++) {
    var subType = subTypes[i];
    var subId = 'devicePanel_' + subType;
    var devicePanel = make.Default[subId];
    for (var name in devicePanel) {
        if (devicePanel[name].data) {
            registerDeviceFrontPanel(name, devicePanel[name], subType);
        }
        if (devicePanel[name].backData) {
            registerDeviceBackPanel(name, devicePanel[name], subType);
        }
        //前视图
        registerDeivce(name, devicePanel[name]);
    }
}*/

var registerCard = function (name, props) {

    //前视图
    make.Default.register('twaver.idc.' + name + '.panel', function (json) {
        var newData = {
            imageUrl: getDeviceImagePath2D(name),
            width: props.width,
            height: props.height,
            client: {
                card: true,
            }
        };
        make.Default.copyProperties(json, newData);
        return make.Default.createFollower(newData);
    }, {
            name: name,
            modelDefaultParameters: {
                bid: {
                    name: "BID",
                    value: undefined,
                    type: make.Default.PARAMETER_TYPE_STRING,
                    propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT
                },
                loc: {
                    name: "槽位",
                    value: undefined,
                    type: make.Default.PARAMETER_TYPE_STRING,
                    propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
                    editable: false
                }
            },
            description: props.description,
            category: '单板',
            icon: getDeviceIconPath2D(name),
        });

    //面板图数据
    make.Default.register('twaver.idc.' + name + '.panel.data', function (json) {

        return props.data;
    }, {
            icon: getDeviceIconPath2D(name),
            name: name,
            category: '单板面板'
        })

    //面板图
    make.Default.copy('twaver.idc.' + name + '.panel.loader', 'twaver.idc.panel.loader', { data: props.data }, {
        icon: getDeviceIconPath2D(name)
    })

    //面板图
    make.Default.copy('twaver.idc.' + name + '.panel.loader.3d', 'twaver.idc.panel.loader.3d', { data: props.data }, {
        icon: getDeviceIconPath2D(name)
    })

}

var cards = {
    "12路FE电接口板": {
        data: [{ "width": 225, "height": 16, "id": "twaver.idc.card.panel" }, {
            "position": [25, 3, 0],
            "client": { "bid": "n2" },
            "id": "twaver.idc.rj4503.panel"
        }, { "position": [40, 3, 0], "client": { "bid": "n3" }, "id": "twaver.idc.rj4503.panel" }, {
            "position": [55, 3, 0],
            "client": { "bid": "n4" },
            "id": "twaver.idc.rj4503.panel"
        }, { "position": [153, 3, 0], "client": { "bid": "n9" }, "id": "twaver.idc.rj4503.panel" }, {
            "position": [168, 3, 0],
            "client": { "bid": "n10" },
            "id": "twaver.idc.rj4503.panel"
        }, { "position": [183, 3, 0], "client": { "bid": "n11" }, "id": "twaver.idc.rj4503.panel" }, {
            "position": [198, 3, 0],
            "client": { "bid": "n12" },
            "id": "twaver.idc.rj4503.panel"
        }, { "position": [10, 3, 0], "client": { "bid": "n1" }, "id": "twaver.idc.rj4503.panel" }, {
            "position": [81, 3, 0],
            "client": { "bid": "n5" },
            "id": "twaver.idc.rj4503.panel"
        }, { "position": [96, 3, 0], "client": { "bid": "n6" }, "id": "twaver.idc.rj4503.panel" }, {
            "position": [111, 3, 0],
            "client": { "bid": "n7" },
            "id": "twaver.idc.rj4503.panel"
        }, { "position": [126, 3, 0], "client": { "bid": "n8" }, "id": "twaver.idc.rj4503.panel" }],
        "width": 225,
        "height": 16
    },
    //  "CONGI": { label: "CONGI", width: 1.8, height: 27},
    // "DTRF_back": { label: "DTRF_back", width: 8.58, height: 20 },
    // "DTRF": { label: "DTRF", width: 1.8, height: 20 },
    // "SERVEICE": { label: "SERVEICE", width: 3.6, height: 27 },
    // "P63E1": { label: "P63E1", width: 1.8, height: 27 },
    // "P4S1N": { label: "P4S1N", width: 1.8, height: 30 },
    // "MCUG_back": { label: "MCUG_back", width: 8.58, height: 20},
    // "MCUG": { label: "MCUG", width: 1.8, height: 20},
}

for (var name in cards) {
    registerCard(name, cards[name]);
}

/*******************inbuilt  devicePanel *********************/


var getObjModelParameter = function (param) {
    return {};
}

    make.Default.registerModel = function (param) {
        var model2d = ['shuangjian', 'chuanganqi', 'yangan', 'camera2', 'camera3'];    //环境系统的modelParams不一样需要特殊处理,这里最好传入一个category作分类处理不同类别的modelDefaultParameters不同

        var modelTypeMap = {
            'wrapModel': { id: 'twaver.idc.wrapModel', paramFunction: getWrapModelDefaultParameters },
            'rackModel': { id: 'twaver.idc.rack', paramFunction: getRackModelParameter },
            'equipmentModel': { id: 'twaver.idc.device', paramFunction: getEquipmentProParameters },
            'objModel': { paramFunction: (model2d.indexOf(param.fileName) >= 0) ? get2dObjParameters : getObjModelParameter },
        };

        var getModelParameters = function (param) {
            return {
                name: param.name,
                description: param.description,
                icon: param.path + param.modelShortId + '/icon.png',
                category: param.category,
                type: param.type,
                modelDefaultParameters: modelTypeMap[param.modelType].paramFunction(param),
            }
        }
        var id2 = param.id.substring(7, param.id.length);
        var modelShortId = id2.substring(id2.indexOf('.') + 1, id2.length);
        var newPath = param.path + modelShortId + "/";
        param.modelShortId = modelShortId;

        if (param.modelType == 'objModel') {
            var showShadow = true;
            if (param.showShadow == false) {
                showShadow = false;
            }
            var fileName = param.fileName || param.id;
            var shadowType = param.shadowType;
            var merged = param.merged;
            if (merged != false) merged = true;
            make.Default.registerObj(param.id, fileName, newPath, getModelParameters(param), showShadow, shadowType, merged, false, null, null, false, true);
        } else if (param.modelType == 'rackModel') {
            /*注册3d模型*/
            make.Default.copy(param.id, 'twaver.idc.rack', {
                backImage: newPath + "rack_back.jpg",
                sideImage: newPath + "rack_side.jpg",
                topImage: newPath + "rack_top.jpg",
                fontDoorImage: newPath + "rack_door_front.jpg",
                backDoorImage: newPath + "rack_door_back.jpg",
                frontDoorLeftImage: newPath + "rack_door_front_l.jpg",
                frontDoorRightImage: newPath + "rack_door_front_r.jpg",
                backDoorLeftImage: newPath + "rack_door_back_l.jpg",
                backDoorRightImage: newPath + "rack_door_back_r.jpg",
                frontDoorBackImage: newPath + "rack_door_front_b.jpg",
                // json.backDoorFrontImage =getRackImagePath(name + "/backDoor_front.jpg");
                backDoorFrontImage: param.backDoorFrontImage && newPath + "backDoor_front.jpg",
                doorColor: param.doorColor
            }, getModelParameters(param));

            make.Default.copy(param.id.replace('rack', 'simpleRack'), 'twaver.idc.simpleRack', function (json, callback) {
                json.image = newPath + 'rack_wrap.jpg';
            }, {
                    icon: getIdcIconPath(newPath + "icon.png"),
                    modelDefaultParameters: getBasicParameters(param.width, param.height, param.depth)
                });
            /*注册2d模型*/
            make.Default.copy(param.id + '.front', 'twaver.idc.rack.front');

        } else if (param.modelType == 'equipmentModel') {
            // var name = modelShortId.split('.')[0];
            //注册3D模型
            if (param.height > 8) {
                make.Default.copy(param.id, 'twaver.idc.equipment', {
                    frontImage: param.path + '/' + modelShortId + '/' + modelShortId + "_front.jpg",
                    backImage: param.backData && (param.path + '/' + modelShortId + '/' + modelShortId + "_back.jpg")
                }, getModelParameters(param));
            } else {
                param.height = param.height == 0 ? 1 : param.height;
                make.Default.copy(param.id, 'twaver.idc.device', {
                    frontImage: param.path + '/' + modelShortId + '/' + modelShortId + "_front.jpg",
                    backImage: param.backData && (param.path + '/' + modelShortId + '/' + modelShortId + "_back.jpg")
                }, getModelParameters(param));
            }

            //注册2d的前面板
            if (param.frontData) {
                registerDeviceFrontPanel(name, param, param.type);
            }
            //注册2d的后面板
            if (param.backData) {
                registerDeviceBackPanel(name, param, param.type);
            }
            //前视图
            registerDeivce(name, param, param.path + name + "/");

        } else if (param.modelType == 'wrapModel') {
            make.Default.copy(param.id, 'twaver.idc.wrapModel', {
                path: newPath,
                showShadow: param.showShadow
            }, getModelParameters(param));

        }

        var colors = ['#FFCC99', '#CCFF99', '#CCCCFF', '#CCCCFF', '#99CCCC'];
        var color = colors[Math.round(Math.random() * colors.length - 1)];
        // if (param.width && param.depth) {
        make.Default.register(param.id + '.top', getRegister(param.width || 50, param.depth || 50, color), getModelParameters(param));
        // }
    };


/*
 * 内置库房模型库中包含了各种obj模型设备。
 */
var getWarehouseIconPath = function (icon) {
    if (icon.indexOf('/') > 0) {
        return icon;
    }
    return make.Default.path + 'model/warehouse/icons/' + icon;
}
var getWarehouseImagesPath = function (images) {
    if (images.indexOf('/') > 0) {
        return images;
    }
    return make.Default.path + 'model/warehouse/images/' + images;
}

var getPRParameters = function () {
    return {
        'bid': {
            value: '',
            name: "业务ID",
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT
        },
        'position': {
            value: [0, 0, 0],
            name: "位置",
            type: make.Default.PARAMETER_TYPE_ARRAY_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
            editable: false,
        },
        'rotation': {
            value: [0, 0, 0],
            name: "旋转角度",
            type: make.Default.PARAMETER_TYPE_ARRAY_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
            editable: false,
        },

    }
}

var getBasicParameters = function (width, height, depth) {
    var result = {
        'width': {
            value: width,
            name: "宽",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'height': {
            value: height,
            name: "高",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'depth': {
            value: depth,
            name: "深",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        }
    }
    var pr = getPRParameters();
    make.Default.copyProperties(pr, result);
    return result;
}

make.Default.register('twaver.wh.storageRack', function (json) {
    var height = json.height || 200;
    var width = json.width || 150;
    var depth = json.depth || 50;
    var position = json.position || [0, 0, 0];
    var level = json.level || 4;
    var levelGap = json.levelGap || 50;
    var offset = json.offset || 20;

    var parts = [];
    var pos1 = [
        [-width / 2, 0, -depth / 2],
        [-width / 2, 0, depth / 2],
        [width / 2, 0, -depth / 2],
        [width / 2, 0, depth / 2]
    ];
    for (var i = 0; i < pos1.length; i++) {
        parts.push({
            type: 'cube',
            op: '+',
            width: 4,
            depth: 4,
            height: height,
            color: '#243D84',
            position: pos1[i],
        });
    }

    var pos2 = [
        [-width / 2, 0, 0],
        [-width / 2, (height - 40) / 2, 0],
        [-width / 2, -(height - 40) / 2, 0],
        [width / 2, 0, 0],
        [width / 2, (height - 40) / 2, 0],
        [width / 2, -(height - 40) / 2, 0]
    ];
    for (var i = 0; i < pos2.length; i++) {
        parts.push({
            type: 'cube',
            op: '+',
            width: 2,
            depth: depth,
            height: 2,
            color: '#243D84',
            position: pos2[i],
        });
    }

    var pos3 = [
        [width / 2, (height - 40) / 4, 0],
        [width / 2, -(height - 40) / 4, 0],
        [-width / 2, (height - 40) / 4, 0],
        [-width / 2, -(height - 40) / 4, 0]
    ];
    var cdepth = Math.sqrt(depth * depth + (height - 40) / 2 * (height - 40) / 2);
    var rotationX = Math.atan2((height - 40) / 2, depth);
    for (var i = 0; i < pos3.length; i++) {
        parts.push({
            type: 'cube',
            op: '+',
            width: 2,
            depth: cdepth,
            height: 2,
            color: '#243D84',
            rotation: [i % 2 == 0 ? rotationX : -rotationX, 0, 0],
            position: pos3[i],
        });
    }

    for (var i = 0; i < level; i++) {
        parts.push({
            type: 'cube',
            op: '+',
            width: width,
            height: 2,
            depth: 2,
            color: '#D73E27',
            position: [0, offset + levelGap * i - height / 2, depth / 2]
        });
    }
    for (var i = 0; i < level; i++) {
        parts.push({
            type: 'cube',
            op: '+',
            width: width,
            height: 2,
            depth: 2,
            color: '#D73E27',
            position: [0, offset + levelGap * i - height / 2, -depth / 2]
        });
    }
    var combo = make.Default.createCombo(parts);
    combo.p(position[0], 0, position[2]);
    make.Default.setPositionY(combo, position[1]);
    return combo;
}, {
    name: "货架",
    icon: getWarehouseIconPath('storageRack.png'),
    category: '仓库模型',
    type: 'scene',
    sdkCategory: 'warehouse',
});



make.Default.register('twaver.wh.FileRack', function (json) {
    var height = json.height || 232;
    var width = json.width || 231;
    var depth = json.depth || 73;
    var land = json.land || 2.2;
    var position = json.position || [0, 0, 0];
    var level = json.level || 6;
    var row = json.row || 4; //列数
    var levelGap = json.levelGap || 32.7;
    var door = json.door; //是否有门
    var direction = json.direction || false; //门的方向
    var rowGap = (width - 2 * 3 * land - (row - 1) * land) / row;
    var batHeight = level * (land + levelGap) + land;
    var bottomGap = height - batHeight;
    var fbc = json.fbc;
    var lrc = json.lrc;
    var tbc = json.tbc;
    var color = {
        'front.m.color': '#a9a9a9',
        'back.m.color': '#a9a9a9',
        'left.m.color': '#cfd1d0',
        'right.m.color': '#cfd1d0',
        'top.m.color': '#e4e4e4',
        'bottom.m.color': '#e4e4e4'
    }
    var parts = [];
    var cube = new mono.Cube(width, height, depth);
    cube.setStyle("m.visible", false);

    //柜门
    if (door) {
        var x, z, orientation;
        if (direction) {
            x = -1;
            z = depth / 2 - land / 2;
            orientation = "front";
        } else {
            x = 1;
            z = -(depth / 2 - land / 2);
            orientation = "back";
        }
        var cube0 = new mono.Cube(width - 6 * land, land, land);
        cube0.setStyle("m.color", "#d0d2d1");
        cube0.setPosition(new mono.Vec3(0, height / 2 - land / 2, z));
        cube0.setStyle("m.color", "#d0d2d1");
        cube0.setStyle('m.envmap.image', make.Default.getEnvMap('envmap6'));
        var cube1 = new mono.Cube(width - 6 * land, bottomGap + land - 10, land);
        cube1.setStyle("m.color", "#d0d2d1");
        cube1.setPosition(new mono.Vec3(0, -(height / 2 - 5 - land / 2 - bottomGap / 2), z));
        cube1.setParent(cube);
        cube1.setStyle('m.envmap.image', make.Default.getEnvMap('envmap6'));
        for (var i = row - 1; i > 0; i--) {
            var cube6 = new mono.Cube(land, height - 2 * land - bottomGap, land);
            cube6.setStyle("m.color", "#d0d2d1");
            cube6.setStyle('m.envmap.image', make.Default.getEnvMap('envmap6'));
            cube6.setPosition(new mono.Vec3(location(i, true)[0], bottomGap / 2, z));
            cube6.setParent(cube);
        }
        for (var i = row; i > 0; i--) {
            var cube7 = new mono.Cube(rowGap / 2, height - 2 * land - bottomGap, land);
            cube7.setStyle("m.color", "#d0d2d1");
            cube7.setStyle(orientation + '.m.color', 'white');
            cube7.setStyle(orientation + '.m.texture.image', getWarehouseImagesPath('l.jpg'));
            cube7.setStyle('m.envmap.image', make.Default.getEnvMap('envmap6'));
            cube7.setPosition(new mono.Vec3(-x * (width / 2 - 3 / 4 * rowGap - 3 * land - (rowGap + land) * (row - i)), bottomGap / 2, z));
            cube7.setParent(cube);
            var cube8 = new mono.Cube(rowGap / 2, height - 2 * land - bottomGap, land);
            cube8.setStyle("m.color", "#d0d2d1");
            cube8.setStyle(orientation + '.m.color', 'white');
            cube8.setStyle(orientation + '.m.texture.image', getWarehouseImagesPath('r.jpg'));
            cube8.setStyle('m.envmap.image', make.Default.getEnvMap('envmap6'));
            cube8.setPosition(new mono.Vec3(-x * (width / 2 - 1 / 4 * rowGap - 3 * land - (rowGap + land) * (row - i)), bottomGap / 2, z));
            cube8.setParent(cube);
        }
    }

    //左右立柱
    pos1 = [width / 2 - 3 / 2 * land, -width / 2 + 3 / 2 * land];
    for (var i = 0; i < pos1.length; i++) {
        var cube2 = new mono.Cube(depth, height, 3 * land);
        cube2.s(color);
        if (i % 2 == 0) {
            cube2.setStyle('front.m.texture.image', getWarehouseImagesPath('cemian01.jpg'));
            cube2.setStyle('front.m.color', 'white');
            cube2.setRotation(0, Math.PI / 2, 0);
        } else {
            cube2.setStyle('front.m.texture.image', getWarehouseImagesPath('cemian.jpg'));
            cube2.setStyle('front.m.color', 'white');
            cube2.setRotation(0, -Math.PI / 2, 0);
        }

        cube2.setPosition(new mono.Vec3(pos1[i], 0, 0));
        cube2.setParent(cube);
    }

    //背面竖杆
    for (var i = row - 1; i > 0; i--) {
        var cube3 = new mono.Cube(land, height - bottomGap - 2 * land, land);
        cube3.setStyle('m.texture.image', getWarehouseImagesPath('filerack1.jpg'));
        cube3.setWrapMode('six-each');
        var loc = location(i, true);
        if (door && !direction) {
            cube3.setPosition(new mono.Vec3(loc[0], loc[1], -depth / 2 + 3 / 2 * land));
        } else {
            cube3.setPosition(new mono.Vec3(loc[0], loc[1], -depth / 2 + 1 / 2 * land));
        }
        cube3.setParent(cube);
    }

    //横杆
    for (var i = level + 1; i > 0; i--) {
        var cube4;
        var loc = location(i);
        if (door) {
            cube4 = new mono.Cube(width - 6 * land, land, depth - land);
            if (direction) {
                cube4.setPosition(new mono.Vec3(loc[0], loc[1], -land / 2));
            } else {
                cube4.setPosition(new mono.Vec3(loc[0], loc[1], land / 2));
            }
        } else {
            cube4 = new mono.Cube(width - 6 * land, land, depth);
            cube4.setPosition(new mono.Vec3(loc[0], loc[1], 0));
        }
        if (i == level + 1) {
            cube4.s(color);
            cube4.setStyle('top.m.color', 'white');
            cube4.setStyle('front.m.color', "#d0d2d1");
            cube4.setStyle('back.m.color', "#d0d2d1");
            cube4.setStyle('top.m.texture.image', getWarehouseImagesPath('top.jpg'));
        } else {
            cube4.setStyle('m.texture.image', getWarehouseImagesPath('filerack1.jpg'));
            cube4.setWrapMode('six-each');
        }
        cube4.setParent(cube);
    }

    //正面竖杆
    for (var i = row - 1; i > 0; i--) {
        var cube5 = new mono.Cube(land, height - bottomGap - 2 * land, land);
        cube5.setStyle('m.texture.image', getWarehouseImagesPath('filerack1.jpg'));
        cube5.setWrapMode('six-each');
        var loc = location(i, true);
        if (door && direction) {
            cube5.setPosition(new mono.Vec3(loc[0], loc[1], depth / 2 - 3 / 2 * land));
        } else {
            cube5.setPosition(new mono.Vec3(loc[0], loc[1], (depth - land) / 2));
        }
        cube5.setParent(cube);
    }

    function location(i, rowFlag) {
        var halfWidth = width / 2 - 3 * land - rowGap - 1;
        var halfHeight = (height - land) / 2;
        var pos;
        level
        if (rowFlag) {
            pos = [halfWidth - (land + rowGap) * (row - 1 - i), batHeight / 2 + bottomGap - height / 2]
        } else {
            pos = [0, halfHeight - (land + levelGap) * (level + 1 - i)]
        }
        return pos;
    }

    var cube9 = new mono.Cube(width + 40, 5, depth + 40);
    cube9.setStyle('m.texture.image', getWarehouseImagesPath('loutiS.png'));
    cube9.setStyle('m.visible', false);
    cube9.setStyle('top.m.visible', true);
    cube9.setStyle('m.transparent', true);
    cube9.setPositionY(-height / 2)
    cube9.setParent(cube);

    cube.setPosition(position[0], 0, position[2]);
    make.Default.setPositionY(cube, position[1]);
    return cube;
}, {
    name: "档案架",
    icon: getWarehouseIconPath('fileRack.png'),
    category: '仓库模型',
    type: 'scene',
    sdkCategory: 'warehouse',
});

var getFireBoxParameters = function () {
    var result = getBasicParameters(13, 20, 4.8);
    result.image = {
        name: "贴图",
        value: getWarehouseImagesPath('filebox.jpg'),
        type: make.Default.PARAMETER_TYPE_IMAGE,
        propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
    }
    var pr = getPRParameters();
    make.Default.copyProperties(pr, result);
    return result;
}


make.Default.register('twaver.wh.FileBox', function (json, callback) {
    var height = json.height;
    var width = json.width;
    var depth = json.depth;
    var position = json.position || [0, 0, 0];

    var cube = new mono.Cube(width, height, depth);
    if (json.image) cube.setStyle('m.texture.image', json.image);
    cube.setWrapMode('six-each');
    make.Default.setObject3dCommonProps(cube, json);
    if (callback) callback(cube);
    return cube;
}, {
    name: "档案盒",
    icon: getWarehouseIconPath('fileBox.png'),
    category: '仓库模型',
    sdkCategory: 'warehouse',
    modelDefaultParameters: getFireBoxParameters()
});

make.Default.register('twaver.wh.storageRack1', function (json, callback) {
    var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];

    var rotation = make.Default.getRsByDs(json.rotation || [0, Math.PI / 2, 0]);

    var rx = rotation[0],
        ry = rotation[1],
        rz = rotation[2];

    var column = json.column || 3;
    var level = json.level || 4;
    var levelGap = json.levelGap || 100;
    var levelDepth = json.depth || 80;
    var levelWidth = json.width || 200;

    var offset = json.offset || 20;

    var parts = [];

    //正面横杆
    for (var j = 0; j < level; j++) {
        for (var i = 1; i <= column; i++) {
            var zhengLiang1 = new mono.Cube(levelWidth, 8, 5);
            //zhengLiang1.setStyle('m.texture.image', getWarehouseImagesPath('liang.jpg'));
            //zhengLiang1.setWrapMode('six-each');
            zhengLiang1.s({
                'm.color': '#C54C37',
                'm.ambient': '#C54C37',
            });
            zhengLiang1.setPosition(new mono.Vec3(getFrontPositionX(i, j), offset + levelGap * j, levelDepth / 2));
            parts.push(zhengLiang1);

            var zhengLiang2 = new mono.Cube(levelWidth, 8, 5);
            //zhengLiang2.setStyle('m.texture.image', getWarehouseImagesPath('liang.jpg'));
            //zhengLiang2.setWrapMode('six-each');
            zhengLiang2.s({
                'm.color': '#C54C37',
                'm.ambient': '#C54C37',
            });
            zhengLiang2.setPosition(new mono.Vec3(getFrontPositionX(i, j), offset + levelGap * j, 0));
            parts.push(zhengLiang2);

            var zhengLiang3 = new mono.Cube(levelWidth, 8, 5);
            //zhengLiang3.setStyle('m.texture.image', getWarehouseImagesPath('liang.jpg'));
            //zhengLiang3.setWrapMode('six-each');
            zhengLiang3.s({
                'm.color': '#C54C37',
                'm.ambient': '#C54C37',
            });
            zhengLiang3.setPosition(new mono.Vec3(getFrontPositionX(i, j), offset + levelGap * j, -levelDepth / 2));
            parts.push(zhengLiang3);

        }
    }

    function getFrontPositionX(i, j) {
        var Mark = 1;
        if (i % 2 == 0) {
            Mark = -1;
        }
        return (parseInt(i / 2) * levelWidth) * Mark;
    }

    //立柱
    for (var i = 0; i < 2 * (column + 1); i++) {
        var lizhu = new mono.Cube(8, (level - 1) * levelGap + offset * 2, 8);
        lizhu.setStyle('m.texture.image', getWarehouseImagesPath('lizhu.jpg'));
        lizhu.setWrapMode('six-each');
        lizhu.setPosition(getColumnPosition(i));
        parts.push(lizhu);

    }

    function getColumnPosition(i) {
        var widthMark = 1;
        var depthMark = 1;
        if (i % 4 == 0 || i % 4 == 1) {
            widthMark = -1;
        }
        if (i % 4 == 1 || i % 4 == 2) {
            depthMark = -1;
        }

        return (new mono.Vec3(widthMark * ((levelWidth / 2) + parseInt(i / 4) * levelWidth),
            (level - 1) * levelGap * 1 / 2 + offset, depthMark * (levelDepth / 2)));
    }

    //侧边横杆
    for (var j = 0; j < level; j++) {
        for (var i = 0; i <= column; i++) {
            var ceLiang = new mono.Cube(5, 8, levelDepth);
            ceLiang.setStyle('m.texture.image', getWarehouseImagesPath('lizhu.jpg'));
            ceLiang.setWrapMode('six-each');
            ceLiang.setPosition(getHengganPosition(i, j));
            parts.push(ceLiang);

        }
    }

    function getHengganPosition(i, j) {
        var Mark = 1;
        if (i % 2 == 0) {
            Mark = -1;
        }

        return new mono.Vec3((levelWidth / 2 + parseInt(i / 2) * levelWidth) * Mark, offset + levelGap * j, 0);
    }

    //侧边斜杆
    var pos3 = [
        [levelWidth / 2, (levelGap - 40) / 4, 0],
        [levelWidth / 2, -(levelGap - 40) / 4, 0],
        [-levelWidth / 2, (levelGap - 40) / 4, 0],
        [-levelWidth / 2, -(levelGap - 40) / 4, 0]
    ];
    var cdepth = Math.sqrt(levelDepth * levelDepth + (levelGap / 2) * (levelGap / 2));
    var rotationX = Math.atan2((levelGap / 2), levelDepth);
    for (var j = 0; j < 2 * (level - 1); j++) {
        for (var i = 0; i <= column; i++) {
            var ceXie = new mono.Cube(3, 5, cdepth);
            ceXie.setStyle('m.texture.image', getWarehouseImagesPath('lizhu.jpg'));
            ceXie.setWrapMode('six-each');
            ceXie.setRotation(j % 2 == 0 ? rotationX : -rotationX, 0, 0);
            ceXie.setPosition(new mono.Vec3(getXieganPositionX(i, j), offset + levelGap * j / 2 + levelGap / 4, 0));
            parts.push(ceXie);
        }
    }

    function getXieganPositionX(i, j) {
        var Mark = 1;
        if (i % 2 == 0) {
            Mark = -1;
        }
        return (parseInt(i / 2) * levelWidth + levelWidth / 2) * Mark;
    }

    var shelfCombo = new mono.ComboNode(parts);
    shelfCombo.setPosition(x, 0, z);
    make.Default.setPositionY(shelfCombo, y);
    shelfCombo.setRotation(rotation[0], rotation[1], rotation[2]);
    callback && callback(shelfCombo);
    return shelfCombo;
}, {
    name: "货架1",
    icon: getWarehouseIconPath('storageRack1.png'),
    category: '仓库模型',
    type: 'scene',
    sdkCategory: 'warehouse',
});

var getWareParameters = function () {
    var result = {
        'width': {
            value: 40,
            name: "宽",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'height': {
            value: 40,
            name: "高",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'depth': {
            value: 50,
            name: "深",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'color': {
            value: 'orange',
            name: "颜色",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        }
    }
    return result;
}

make.Default.register('twaver.wh.ware', function (json) {
    var width = json.width;
    var depth = json.depth;
    var height = json.height;
    var position = json.position || [0, 0, 0];
    var color = json.color;
    var obj = {
        width: width,
        depth: depth,
        height: height,
        color: color,
        position: position,
        style: {
            'left.m.lightmap.image': make.Default.getImagePath('outside_lightmap.jpg'),
            'right.m.lightmap.image': make.Default.getImagePath('outside_lightmap.jpg'),
            'front.m.lightmap.image': make.Default.getImagePath('outside_lightmap.jpg'),
            'back.m.lightmap.image': make.Default.getImagePath('outside_lightmap.jpg'),
        }
    };
    return make.Default.createCube(obj);
}, {
    name: "货物",
    icon: getWarehouseIconPath('ware.png'),
    category: '仓库模型',
    type: 'scene',
    sdkCategory: 'warehouse',
    modelDefaultParameters: getWareParameters()
});

make.Default.register('twaver.wh.shelf', function (json, callback) {
    var width = json.width || 200;
    var depth = json.depth || 100;
    var height = json.height || 280;
    var bottomHeight = 15;
    var topHeight = json.topHeight > bottomHeight ? json.topHeight : bottomHeight;
    var cutHeight = height - bottomHeight - topHeight;
    var position = json.position || [0, 0, 0];
    var color = json.color;
    var doorAngle = json.doorAngle;
    var showDoor = json.showDoor != undefined ? json.showDoor : true;
    var frontAnimationLeft = 'rotation:left:{}:1000:0:bounceOut'.format(-doorAngle || '135');
    var frontAnimationRight = 'rotation:right:{}:1000:0:bounceOut'.format(doorAngle || '-135');

    var rightImage = getWarehouseImagesPath('shelf_right.jpg');
    var leftImage = getWarehouseImagesPath('shelf_left.jpg');
    var topImage = getWarehouseImagesPath('shelf_top.jpg');
    var bottomImage = getWarehouseImagesPath('shelf_bottom.jpg');
    var backImage = getWarehouseImagesPath('shelf_back.jpg');
    var frontImage = getWarehouseImagesPath('shelf_front.jpg');
    var shelf = new mono.Cube(width, height, depth);
    shelf.s({
        'm.type': 'phong',
        'left.m.texture.image': leftImage,
        'right.m.texture.image': rightImage,
        'back.m.texture.image': backImage,
        'top.m.texture.image': topImage,
        'bottom.m.texture.image': bottomImage,
        'front.m.texture.image': frontImage,
        'm.envmap.image': make.Default.getEnvMap('envmap5'),
    });

    var insideBackImage = getWarehouseImagesPath('inside_back.jpg');
    var insideRightImage = getWarehouseImagesPath('inside_right.jpg');
    var insideLeftImage = getWarehouseImagesPath('inside_left.jpg');
    var insideTopImage = getWarehouseImagesPath('inside_top.jpg');
    var insideBottomImage = getWarehouseImagesPath('inside_bottom.jpg');
    var cut = new mono.Cube(width - 10, cutHeight, depth - 10);
    cut.s({
        'm.type': 'phong',
        'left.m.texture.image': insideLeftImage,
        'right.m.texture.image': insideRightImage,
        'back.m.texture.image': insideBackImage,
        'top.m.texture.image': insideTopImage,
        'bottom.m.texture.image': insideBottomImage,
    });
    cut.setPosition(0, -(height - cutHeight - bottomHeight * 2) / 2, shelf.getDepth() / 2 - cut.getDepth() / 2);
    var newShelf = new mono.ComboNode([shelf, cut], ['-']);

    //隔板
    var plateImage = getWarehouseImagesPath('plateImage.jpg');
    var plate = new mono.Cube(width - 10, 2, depth - 10);
    plate.setWrapMode('six-each');
    plate.s({
        'm.type': 'phong',
        'm.texture.image': plateImage,
    });
    plate1 = plate.clonePrefab();
    plate1.setParent(newShelf);
    plate1.setPositionY(cut.getHeight() / 6);
    plate2 = plate.clonePrefab();
    plate2.setParent(newShelf);
    plate2.setPositionY(-cut.getHeight() / 6);
    plate3 = plate.clonePrefab();
    plate3.setParent(newShelf);
    plate3.setRotationZ(Math.PI / 2);
    plate3.setPositionX(-cut.getWidth() / 6);
    plate4 = plate.clonePrefab();
    plate4.setParent(newShelf);
    plate4.setRotationZ(Math.PI / 2);
    plate4.setPositionX(cut.getWidth() / 6);

    //左边门
    var leftDoorFrontImage = getWarehouseImagesPath('leftDoorFrontImage.jpg');
    var leftDoorImage = getWarehouseImagesPath('leftDoorImage.jpg');
    var shelfLeftDoor = new mono.Cube(width / 2, cutHeight, 2);
    shelfLeftDoor.setWrapMode('six-each');
    shelfLeftDoor.s({
        'm.type': 'phong',
        'm.texture.image': leftDoorImage,
        'm.envmap.image': make.Default.getEnvMap('envmap5'),
    });
    if (showDoor) {
        shelfLeftDoor.setParent(newShelf);
    };
    shelfLeftDoor.p(-width / 4, cut.getPositionY(), depth / 2 + 1);
    shelfLeftDoor.setClient('animation', frontAnimationLeft);
    shelfLeftDoor.setClient('type', 'rack_door');

    //右边们
    var rightDoorFrontImage = getWarehouseImagesPath('rightDoorFrontImage.jpg');
    var rightDoorImage = getWarehouseImagesPath('rightDoorImage.jpg');
    var shelfRightDoor = new mono.Cube(width / 2, cutHeight, 2);
    shelfRightDoor.setWrapMode('six-each');
    shelfRightDoor.s({
        'm.type': 'phong',
        'm.texture.image': rightDoorImage,
        'm.envmap.image': make.Default.getEnvMap('envmap5'),
    });
    if (showDoor) {
        shelfRightDoor.setParent(newShelf);
    };
    shelfRightDoor.p(width / 4, cut.getPositionY(), depth / 2 + 1);
    shelfRightDoor.setClient('animation', frontAnimationRight);
    shelfRightDoor.setClient('type', 'rack_door');


    if (callback) {
        callback(newShelf)
    }
    newShelf.setClient('showShadow', true);
    return newShelf;
});

make.Default.register('twaver.wh.box', function (json, callback) {
    var width = json.width || 45;
    var height = json.height || 40;
    var depth = json.depth || 37;
    var color = json.color || 'green';
    var box = new mono.Cube(width, height, depth);
    box.s({
        'm.type': 'phong',
        'm.color': color,
        'm.ambient': color,
        'm.transparent': true,
        'm.opacity': 0.0,
        //'front.m.visible': false,
        'm.side': mono.DoubleSide,
    });
    if (callback) {
        callback(box);
    }
    return box;
});



// for (var i = 0; i < whObjModels.length; i++) {
//     registerOBjModel(whObjModels[i]);
// }
/**
 * modelDefaultParameters 格式说明
 {
    id: {
        name: 'name', //属性名称
        value: 'value', //属性值
        valueType: 'string',//属性值类型  //PROPERTY_VALUE_TYPE: 'string', // 'string', 'boolean', 'color', 'int', 'number'
        propertyType: 'client', //属性类型 //PROPERTY_PROPERTY_TYPE: 'accessor', // 'field', 'accessor', 'style', 'client'
        editable:true, //是否可以编辑
        category:'Detail' //属性类别
    }
}
 */

var getWarehouseIconPath = function(icon) {
    if (icon.indexOf('/') > 0) {
        return icon;
    }
    return make.Default.path + 'model/warehouse/icons/' + icon;
}

var getRegister = function(width, depth, color) {
    return function(json) {
        var modelJson = {
            width: json.width || width,
            depth: json.depth || depth,
            client: {
                type: 'model'
            }
        }
        if (color || json.color) modelJson.color = json.color || color;
        make.Default.copyProperties(json, modelJson);
        var model = make.Default.createNode(modelJson);
        return model;
    }
}


make.Default.register('twaver.wh.FileRack.top', getRegister(231, 232, "#e6e3df"), {
    name: "档案柜",
    description: "档案柜",
    icon: getWarehouseIconPath("fileRack.png"),
    category: '仓库模型',
});

make.Default.register('twaver.wh.FileBox.top', getRegister(10, 15, "#b99272"), {
    name: "档案盒",
    description: "档案盒",
    icon: getWarehouseIconPath("fileBox.png"),
    category: '仓库模型',
});

var getSceneImagePath = function (image) {
	if (image.indexOf('/') > 0) {
        return image;
    }
    return make.Default.path + 'model/scene/images/' + image;
};

var getSceneIconPath = function (icon) {
    if (icon.indexOf('/') > 0) {
        return icon;
    }
    return make.Default.path + 'model/scene/icons/' + icon;
}

var getPRParameters = function () {
    return {
        'bid': {
            value: '',
            name: "业务ID",
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT
        },
        'position': {
            value: [0, 0, 0],
            name: "位置",
            type: make.Default.PARAMETER_TYPE_ARRAY_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
            editable: false,
        },
        'rotation': {
            value: [0, 0, 0],
            name: "旋转角度",
            type: make.Default.PARAMETER_TYPE_ARRAY_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD,
            editable: false,
        },

    }
}

var getEarthParameters = function () {
    var result = {
        'radius': {
            value: 500,
            name: "半径",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'segmentsW': {
            value: 50,
            name: "横切数",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'segmentsH': {
            value: 50,
            name: "纵切数",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'rotation': {
            value: [0, Math.PI, 0],
            name: "旋转角度",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'image': {
            value: 'world.jpg',
            name: "贴图",
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'glowImage': {
            value: 'glow.png',
            name: "光晕贴图",
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        }
    }
    var pr = getPRParameters();
    make.Default.copyProperties(pr, result);
    return result;
}

make.Default.register('twaver.scene.earth', function (json, callback) {
	var radius = json.radius,
		segmentsW = json.segmentsW,
		segmentsH = json.segmentsH;
		rotation = json.rotation || [0, 0, 0];
    var image = getSceneImagePath(json.image);
	var earth = new mono.Sphere(radius, segmentsW, segmentsH);
	earth.s({
		'm.texture.image': image,
		'm.type': 'phong',
	});
	// 地球光晕
	var earthFlare=new mono.Billboard();
	earthFlare.s({
		'm.texture.image': getSceneImagePath(json.glowImage),
		'm.transparent': true,
	});
	earthFlare.setScale(1300, 1300, 1);
	earthFlare.setParent(earth);
	earth.setRotation(rotation[0],rotation[1],rotation[2]);
    earth.setClient('type','earth');
    // 地球标题
    if(json.title){
        var params = {
            background:json.background || false, 
            color: json.color || 'white',
            font:json.font || '40px "Dialog"'
        }
        var titleHeight = json.titleHeight || 200;
        var earthTitle= mono.Utils.createTextBillboard(json.title, params);
        earthTitle.s({'m.transparent': true});
        var scale = earthTitle.getScale();
        earthTitle.setScale(scale.x*3, scale.y*3, 1);
        earthTitle.setPositionY(radius+titleHeight);
        earthTitle.setParent(earth);
        earthTitle.setClient('type','earthTitle');
    }
    if(callback) callback(earth);
	return earth;
}, {
    name: "地球",
    description: '地球模型，带光润',
    icon: getSceneIconPath('earth.png'),
    category: '场景模型',
    type: 'scene',
    sdkCategory: 'earth',
    modelDefaultParameters: getEarthParameters(),
});

make.Default.copy('twaver.scene.earth1', 'twaver.scene.earth', function(json){
    json.image = getSceneImagePath('map.jpg');
    json.rotation = [0, Math.PI / 180 * 230, 0];
}, {
    name: '地球1',
    icon: getSceneIconPath('earth1.png'),
});

var getSkyBox3Parameters = function(){
	var result = {
        'radius': {
            value: 5000,
            name: "半径",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'image': {
        	value: 'star_sky.jpg',
            name: "贴图",
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'showSun': {
            value: true,
            name: "是否显示太阳光",
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'sunImage': {
            value: 'sun.png',
            name: "贴图",
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        }
    }
    var pr = getPRParameters();
    make.Default.copyProperties(pr, result);
    return result;
}

make.Default.register('twaver.scene.skybox3', function (json, callback) {
	var radius = json.radius,
		image = getSceneImagePath(json.image),
        showSun = json.showSun,
        sunImage = getSceneImagePath(json.sunImage),
	    position = json.position || [0, 0, 0],
        repeatX = json.repeatX || 14,
        repeatY = json.repeatY || 7;
	   
	var skybox=new mono.Sphere(radius);
	skybox.s({
		'm.texture.image': image,
		'm.side': mono.DoubleSide,
		'm.texture.repeat': new mono.Vec2(repeatX, repeatY), 
	});
    if(showSun){
        var sun=new mono.Billboard();
        sun.s({
            'm.texture.image': sunImage,
            'm.transparent': true,
            'm.depthTest': false,
        });
        sun.setScale(3000, 1000,1);
        sun.setPosition(0, 600, -600);
        sun.setParent(skybox);
    }
	
	skybox.p(position[0], position[1], position[2]);
    if(callback) callback(skybox);
	return skybox;
},{
	name: "天空盒",
    description: '星空类的天空盒',
    icon: getSceneIconPath('keybox.png'),
    category: '场景模型',
    type: 'scene',
    icon: getSceneIconPath('skybox3.png'),
    sdkCategory: 'earthSkybox',
    modelDefaultParameters: getSkyBox3Parameters(),
});

var getSkyBoxParameters = function(){
    var result = {
        'radius': {
            value: 3000,
            name: "半径",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'image': {
            value: 'skybox_sixblue.jpg',
            name: "贴图",
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'floorImage':{
            value: '6.png',
            name: "地面贴图",
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        }
    }
    var pr = getPRParameters();
    make.Default.copyProperties(pr, result);
    return result;
}

//园区天空盒
//1. 六面都是天空的天空盒 - sphere + cube
make.Default.register('twaver.scene.skybox', function(json, callback){
    var radius = json.radius;
        image = getSceneImagePath(json.image);
        floorImage = getSceneImagePath(json.floorImage);
        position = json.position || [0, 0, 0];

    var skyball = new mono.Sphere(radius);
    skyball.s({
        'm.texture.image': image,
        'm.side': mono.BackSide,
    });
    skyball.setScaleY(0.8);

    var floor=new mono.Cube(radius*2, 10, radius*2);
    floor.s({
        'm.texture.image': floorImage,
    });
    floor.setPositionY(-radius*2/3);
    floor.setParent(skyball);
    floor.setClient('type','parkSkybox');
    skyball.setClient('type','parkSkybox');
    skyball.setPosition(position[0], position[1], position[2]);

    if(callback) callback(skyball);
    return skyball;
},{
    name: "天空盒",
    description: "圆球形天空盒",
    category: "场景模型",
    type: 'scene',
    icon: getSceneIconPath('skybox.png'),
    sdkCategory: 'parkSkybox',
    modelDefaultParameters: getSkyBoxParameters(),
});

var getTerrainParameters = function(){
    var result = {
        'width': {
            value: 1000,
            name: "宽度",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'depth': {
            value: 1000,
            name: "深度",
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'segmentsW':{
            value: 30,
            name: "横向的切片数量",
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'segmentsD':{
            value: 30,
            name: "纵向的切片数量",
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'heightUnit':{
            value: 1,
            name: "layer1上每个点的高度",
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'heightMap':{
            value: 'terrain_heights-4.jpg',
            name: "高度贴图",
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'baseLayerHeight': {
            value: 60,
            name: "layer0的高度",
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        }
        
    }
    var pr = getPRParameters();
    make.Default.copyProperties(pr, result);
    return result;
}

make.Default.register('twaver.scene.terrain', function (json, callback) {
    var terrain = new mono.Terrain({
        width: json.width,
        depth: json.depth,
        segmentsW: json.segmentsW,
        segmentsD: json.segmentsD,
        heightUnit: json.heightUnit,
        heightMap: getSceneImagePath(json.heightMap),
        baseLayerHeight: json.baseLayerHeight
    });
    terrain.s({
        'm.side': 'both',
        'm.type': 'phong',
        'm.texture.image': [getSceneImagePath('water.jpg'), getSceneImagePath('grass2.jpg')],
        'm.transparent': [false, false],
        'm.opacity': [1, 1],
        'layer0.m.type': 'phong',
        'layer0.m.texturen.image': getSceneImagePath('water_normals-1.jpg'),
        'layer0.m.texture.repeat': new mono.Vec2(5, 5),
        'layer0.m.spucurlar': 'blue',
        'layer0.m.visible': true,
        'layer1.m.type': 'terrain',
        'layer1.m.texture.repeat': new mono.Vec2(5, 5),
        'layer1.m.texture.image': getSceneImagePath('grass2.jpg'),
        'layer1.m.texture1.image': getSceneImagePath('grass2.jpg'),
        'layer1.m.texture2.image': getSceneImagePath('rock.jpg'),
       
        // 'layer1.m.blendRange': new mono.Vec2(0.2, 0.6),
        // 'layer1.m.map2Range': 0.2,
        'layer1.m.textureb.image': getSceneImagePath('terrain_splats.png')
    });
    terrain.setClient('type','terrain');
    make.Default.setObject3dCommonProps(terrain, json);
    if(callback) callback(terrain);
    terrain.setSelectable(false);
    return terrain;
},{
    name: "山峦",
    description: "地形山峦",
    category: "场景模型",
    type: 'scene',
    icon: getSceneIconPath('skybox.png'),
    modelDefaultParameters: getTerrainParameters(),
})

var getSkyBox1Parameters = function(){
    var result = {
        'radius': {
            value: 5000,
            name: "半径",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'image': {
            value: 'skybox.jpg',
            name: "贴图",
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        }
    }
    var pr = getPRParameters();
    make.Default.copyProperties(pr, result);
    return result;
}

//沙漠的天空盒
make.Default.register('twaver.scene.skybox1', function(json, callback){
    var image = getSceneImagePath(json.image);
    var radius = json.radius;
    var skyball=new mono.Sphere(radius, 30, 30);
    skyball.s({
        'm.texture.image': image,
        'm.side': mono.BackSide,
    });
    var cube=new mono.Cube(radius*2, radius*2, radius*2);
    cube.s({
        'm.visible': false,
    });
    cube.setPositionY(-cube.getHeight()/2);
    var comboUp=new mono.ComboNode([skyball, cube],['-']);
    cube.setPositionY(cube.getHeight()/2);
    skyball.setScaleY(0.1);
    var comboDown=new mono.ComboNode([skyball, cube],['-']);
    var skybox=new mono.ComboNode([comboUp, comboDown], ['+']);
    var boundingBox=skybox.getBoundingBox();
    skybox.setClient('type','parkSkybox');
    if(callback) callback(skybox);
    return skybox;
},{
    name: "天空盒",
    description: '天空盒描述',
    category: '场景模型',
    type: 'scene',
    icon: getSceneIconPath('skybox1.png'),
    sdkCategory: 'parkSkybox',
    modelDefaultParameters: getSkyBox1Parameters(),
});


var getDataCenterParameters = function(img){
	var result = {
        'scaleX': {
            value: 60,
            name: "X轴缩放",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'scaleY': {
        	value: 40,
            name: "Y轴缩放",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'image': {
        	value: img || 'pin1.png',
            name: "图片",
            type: make.Default.PARAMETER_TYPE_NUMBER,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        }
    }
    var pr = getPRParameters();
    make.Default.copyProperties(pr, result);
    return result;
}

make.Default.register('twaver.scene.datacenter', function (json, callback) {
	var position = json.position || [0, 0, 0];
    var x = position[0],
        y = position[1],
        z = position[2];
    var image = getSceneImagePath(json.image),
    	scaleX = json.scaleX,
    	scaleY = json.scaleY;
	var pin=new mono.Billboard();
	pin.s({
		'm.texture.image': image,
		'm.alignment': mono.BillboardAlignment.bottomCenter,
		'm.depthTest': false,
	});
	pin.setScale(scaleX, scaleY, 1);
	pin.p(x, y, z);
	pin.setClient('type', 'datacenter');
    if(callback) callback(pin);
	return pin;
},{
	name: "数据中心",
    description: '数据中心描述',
    icon: getSceneIconPath('datacenter.png'),
    category: '场景模型',
    type: 'scene',
    sdkCategory: 'datacenter',
    modelDefaultParameters: getDataCenterParameters(),
});

make.Default.copy('twaver.scene.datacenter2', 'twaver.scene.datacenter',{},
     {
        modelDefaultParameters: getDataCenterParameters('pin2.png'),
        icon: getSceneIconPath('datacenter2.png')}
    );
make.Default.copy('twaver.scene.datacenter3', 'twaver.scene.datacenter',{'image': 'pin3.png'},
     {icon: getSceneIconPath('datacenter3.png')}
    );
make.Default.copy('twaver.scene.datacenterSet', 'twaver.scene.datacenter',{'image': 'pinSet.png'},
     {icon: getSceneIconPath('datacenterSet.png')}
    );

//---------------园区，大楼----------------//


var getSceneParameters = function(){
    var params = getSkyBox1Parameters();
    var result = {
        'skyboxId': {
            value: 'twaver.scene.skybox1',
            name: "天空盒ID",
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'skyboxRadius': params.radius,
        'skyboxPosition':params.position,
        'skyboxRotation':params.rotation,
        'showLogo': {
            value: true,
            name: '是否显示logo',
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'showSkybox': {
            value: 'true',
            name: "是否显示天空盒",
            type: make.Default.PARAMETER_TYPE_STRING,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        },
        'skyboxImage': params.image,
        'floorImage':{
            value: '6.png',
            name: "地面贴图",
            type: make.Default.PARAMETER_TYPE_IMAGE,
            propertyType: make.Default.PARAMETER_PROPERTY_TYPE_FIELD
        }
    }
    var pr = getPRParameters();
    make.Default.copyProperties(pr, result);
    result.skyboxPosition.value = [0, 1200, 0];
    return result;
}

var getBuildingEvnMap = function(newObject){
    var envmap = this.getEnvMap("envmap5");
    console.log("AAAA");
    var descendants = newObject.getDescendants();
    descendants.forEach(function(descendant){
        console.log(descendant.getStyle('m.texture.image'),'texture');
        descendant.setStyle('m.envmap.image',envmap);
    });
    return newObject;
}

var registerSceneModel = function(modelJson){
    var showSkybox = modelJson.showSkybox, 
        skyboxId = modelJson.skyboxId, 
        skyboxRadius = modelJson.skyboxRadius,
        skyboxPositionY = modelJson.skyboxPositionY,
        skyboxImage = modelJson.skyboxImage,
        skyboxFloorImage = modelJson.skyboxFloorImage,
        showTerrain =  modelJson.showTerrain,
        terrainPositionY =  modelJson.terrainPositionY,
        id = modelJson.id,
        groundId = modelJson.groundId,
        size = modelJson.size,
        showLogo = modelJson.showLogo,
        logoId = modelJson.logoId, 
        logoPosition = modelJson.logoPosition,
        treePos = modelJson.treePos,
        buildingPos = modelJson.buildingPos,
        sdkCategory = modelJson.sdkCategory,
        cubeRotation = modelJson.cubeRotation;
    var getCustomSceneParameters = function(){
        var result = getSceneParameters();
        result.showSkybox.value = showSkybox;
        result.skyboxId.value = skyboxId || 'twaver.scene.skybox';
        result.skyboxRadius.value = skyboxRadius;
        result.skyboxImage.value = skyboxImage;
        result.showTerrain =  showTerrain,
        result.terrainPositionY =  terrainPositionY,
        result.floorImage.value = skyboxFloorImage;
        result.skyboxPosition.value = [0, skyboxPositionY, 0];
        result.showLogo.value = showLogo;
        result.logoPosition = {value: logoPosition};
        result.treePos = {value: treePos};
        result.groundId = {value: groundId};
        result.cubeRotation = {value: cubeRotation};

        return result;
    }
    make.Default.register(id,function (json, callback) {
       var position = json.position || [0, 0, 0];
       var x = position[0],
           y = position[1],
           z = position[2];
       var rotation = make.Default.getRsByDs(json.rotation) || [0, 0, 0];
       var scale = json.scale || [1,1,1];
       var objs = [json.groundId];
       var showSkybox = json.showSkybox;
       var showTerrain = json.showTerrain;
       var terrainPositionY = json.terrainPositionY;
       if(showSkybox){
           objs.push({id: json.skyboxId,radius: json.skyboxRadius, image: json.skyboxImage, 
           position: json.skyboxPosition, rotation: json.skyboxRotation,floorImage:json.floorImage});
           if(showTerrain){
               objs.push({id:'twaver.scene.terrain',"width": json.skyboxRadius*2,"depth": json.skyboxRadius*2,heightUnit: Math.ceil(json.skyboxRadius/2000), position:[0,terrainPositionY || -500,0]});
           }
       }
       if(json.showLogo){
            objs.push({id: logoId, position: logoPosition});
        }

       var trees = json.treePos;
       for(var i = 0; i < trees.length; i ++){
            var tree = trees[i];
            var id = tree.id;
            var treeScale = tree.scale || [1,1,1];
            var treeStyle = tree.style;
            var positions = tree.positions; 
            var rotations = tree.rotations;
            for(var j = 0; j < positions.length; j++){
                if(rotations && rotations.length > 0) var rotation1 = rotations[j];
                objs.push({id: id, position: positions[j], scale: treeScale, rotation: rotation1,style: treeStyle});
            }
       }

       var cube;
       if(json.dcId){
            var rot = json.cubeRotation || [0, 0, 0];
            cube=new mono.Cube(size[0], 0, size[1]);
            cube.s({
               'top.m.texture.image': make.Default.path+'../theme/map/'+json.dcId+'/12.jpg',
               // 'top.m.texture.flipX': true,
               // 'top.m.texture.flipY': true,
               'm.visible': false,
            });

            cube.setClient('type','mask');
            cube.setPositionY(350);
            cube.setRotation(rot[0], rot[1], rot[2]);
       }
       var objects =  make.Default.load(objs, callback);
       if(objects && objects.length > 0){
           var first = objects[0],object;
           for(var i = 1;i < objects.length;i++){
               object = objects[i];
               object.setParent(first);
           }
           if(cube) cube.setParent(first);
           first.setPosition(position[0], position[1], position[2]);
           first.setRotation(rotation[0], rotation[1], rotation[2]);
           first.setScale(scale[0], scale[1], scale[2]);
           return first;
       }
       return null;
   },{
       name: "园区",
       description: '园区描述',
       category: '场景模型',
       type: 'scene',
       async: true,
       buildings: buildingPos,
       sdkCategory: sdkCategory,
       modelDefaultParameters: getCustomSceneParameters(),
   }); 
}

//id, name, path, parameters, showShadow, shadowType,merged, showShadowImage,style, envImages, singleton
var sceneObj = window.sceneObjects || {};
for(var i in sceneObj){
    var scene = sceneObj[i];
    var buildings = scene.buildings;
    if(buildings && buildings.length > 0){
        for(var j = 0; j < buildings.length; j++){
            var building = buildings[j];
            if(building.merged == false){
                make.Default.registerObj(building.id, building.name, building.path,{},false,0,false,false,building.style,building.envImages,true); 
            }else{
                make.Default.registerObj(building.id, building.name, building.path, {}, false, 0, true, false, {}, null, true);
            }
        }
    }
    var trees = scene.trees;
    if(trees && trees.length > 0){
        for(var j = 0; j < trees.length; j++){
            var tree = trees[j];
            make.Default.registerObj(tree.id, tree.name, tree.path);
        }
    }
    var logo = scene.logo;
    if(logo){
        make.Default.registerObj(logo.id, logo.name, logo.path, {}, false, 0, false, false, {}, null, true);
        var logoPosition = logo.position;
        var logoId = logo.id;
    }
    var yuanqu = scene.yuanqu;
    var merged = yuanqu.merged;
    if(merged == false){
        make.Default.registerObj(yuanqu.id, yuanqu.name, yuanqu.path,{},false,0,false,false,yuanqu.style, null, true); 
    }else{
        make.Default.registerObj(yuanqu.id, yuanqu.name, yuanqu.path,{},false,0,true,false,yuanqu.style, null, true); 
    }
    var groundId = yuanqu.id;
    var size = yuanqu.size;
    var cubeRotation = yuanqu.cubeRotation;

    var showSkybox = scene.showSkybox;
    var showTerrain = scene.showTerrain;
    var terrainPositionY = scene.terrainPositionY;
    if(!(showSkybox == false)) showSkybox = true;
    var skyboxId = scene.skyboxId;
    var skyboxRadius = scene.skyboxRadius;
    var skyboxPositionY = scene.skyboxPositionY;
    var skyboxImage = scene.skyboxImage;
    var skyboxFloorImage = scene.skyboxFloorImage;
    var treePosition = scene.treePosition || [];
    var treePositionOffset= scene.treePositionOffset || {x:0,y:0,z:0};
    treePosition.forEach(function(item){
        var positions = item.positions || [];
        positions.forEach(function(pos){
            pos[0] += treePositionOffset.x;
            pos[1] += treePositionOffset.y;
            pos[2] += treePositionOffset.z;
        })
    })
    var buildingPosition = scene.buildingPosition;
    
    var sdkCategory = scene.sdkCategory || 'park';
    var showLogo = scene.showLogo;
    if(logo && showLogo != false) showLogo = true;

    registerSceneModel({showSkybox:showSkybox,showTerrain:showTerrain,terrainPositionY:terrainPositionY,skyboxId:skyboxId, skyboxRadius:skyboxRadius,skyboxImage:skyboxImage, skyboxFloorImage:skyboxFloorImage, skyboxPositionY:skyboxPositionY, id:i, 
        groundId:groundId,size:size, showLogo:showLogo, logoId:logoId, logoPosition:logoPosition, treePos:treePosition, buildingPos:buildingPosition,
        sdkCategory:sdkCategory,cubeRotation:cubeRotation});   
}

})
(window);