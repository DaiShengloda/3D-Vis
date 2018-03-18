/**
 * 属性框
 * @param box
 * @param data
 * @param view
 * @constructor
 */
var PropertyPanel = function (data, view) {
    this._data = data;
    this._view = view;
    this._inputCache = {};
    this._isCommitting = false;
    this._init();
}
//
PropertyPanel.NAME = 'name';
PropertyPanel.PROPERTY_TYPE = 'property-type';
PropertyPanel.VALUE_TYPE = 'value-type';
PropertyPanel.SPLIT = ':'
twaver.Util.ext(PropertyPanel, Object, {

    _init: function () {

        //监听数据变化
        if (this._data) {
            this._data.addPropertyChangeListener(this.dataPropertyChangeHandler, this);
        }
        //监听视图变化
        if (this._view) {
            this._inputCache = this.resetInputCache();
            this.refreshView();
        }
    },
    //取得数值类型
    getValueType: function (input) {
        return input.getAttribute(PropertyPanel.VALUE_TYPE);
    },
    //取得属性类型
    getPropertyType: function (input) {
        return input.getAttribute(PropertyPanel.PROPERTY_TYPE) || 'client';
    },
    //取得属性名称
    getName: function (input) {
        return input.getAttribute(PropertyPanel.NAME);
    },
    //取得key 避免不同类型有同名的属性
    getInputKey: function (input) {
        return this.getName(input) + PropertyPanel.SPLIT + this.getPropertyType(input);
    },
    //查询到所有的input,并监听change事件
    resetInputCache: function () {
        var result = {};
        this.findChildInput(this._view, result);
        return result;
    },
    //查询到所有的input,并监听change事件
    findChildInput: function (parent, result) {
        var self = this;
        if (parent.children && parent.children.length > 0) {
            var len = parent.children.length;
            for (var i = 0; i < len; i++) {
                var child = parent.children[i];
                if (child.tagName == 'INPUT') {
                    var input = child;
                    var key = self.getInputKey(input);
                    result[key] = input;
                    input.onchange = function (e) {
                        self.viewInputChangeHandler(e);
                    }
                } else {
                    self.findChildInput(child, result);
                }
            }
        }
    },
    //取得input
    getInput: function (name, propertyType) {
        var key = name + PropertyPanel.SPLIT + propertyType;
        var input = this._inputCache[key];
        return input;
    },
    //data变化时,更新视图
    dataPropertyChangeHandler: function (e) {

        //console.log(e);
        //if (this._isCommitting) {
        //    this._isCommitting = false;
        //    return;
        //}
        //this._isCommitting = true;
        var property = e.property;
        var node = e.source;
        if (node != this._data) {
            return;
        }
        var value = e.newValue;
        if (property.startsWith('C:')) {
            var index = property.indexOf(':');
            var name = property.substring(index + 1);
            this.setViewValue(name, value, 'client');
        } else if (property.startsWith('S:')) {
            var index = property.indexOf(':');
            var name = property.substring(index + 1)
            this.setViewValue(name, value, 'style');
        } else {
            //TODO 数据发生改变时,自定义修改属性
            if (property == 'location') {
                this.setViewValue('x', value.x, 'accessor');
                this.setViewValue('y', value.y, 'accessor');
            } else {
                this.setViewValue(property, value, 'accessor');
            }
        }
    },
    //视图更新时,更新data属性
    viewInputChangeHandler: function (e) {

        if(!this._data){
            return;
        }
        var input = e.target;
        var name = this.getName(input);
        var propertyType = this.getPropertyType(input);
        var valueType = this.getValueType(input);
        var value = null;
        if (input.type === 'checkbox') {
            value = input.checked;
        } else {
            value = input.value;
        }
        var value = this._parseValue(input.value, this.getValueType(input));
        ////TODO 界面发生改变时,自定义修改属性
        if (name == 'scale') {
            var w = this._data.getWidth();
            var h = this._data.getHeight();
            this._data.setWidth(w * value);
            this._data.setHeight(h * value);
            this.setDataValue('scale', value, propertyType);
        } else {
            this.setDataValue(name, value, propertyType);
        }

    },
    //刷新视图
    refreshView: function () {
        if (!this._view) {
            return;
        }
        for (var key in this._inputCache) {
            var input = this._inputCache[key];
            input.value = '';
            if (this._data) {
                input.disabled = false;
                var name = this.getName(input);
                var propertyType = this.getPropertyType(input);
                var valueType = this.getValueType(input);
                var value = this.getDataValue(name, propertyType);
                value = this._parseValue(value, valueType);
                if (value != undefined)
                    this.setViewValue(name, value, propertyType);
            } else {
                input.disabled = true;
            }

        }
    },
    //取得data中属性值
    getDataValue: function (name, propertyType) {
        if (propertyType === 'accessor' && this._data[_twaver.getter(name)]) {
            return this._data[_twaver.getter(name)]();
        }
        else if (propertyType === 'style' && this._data.setStyle) {
            return this._data.getStyle(name);
        }
        else if (propertyType === 'client' && this._data.setClient) {
            return this._data.getClient(name);
        }
        else if (propertyType === 'field') {
            return this._data[this._propertyName];
        }
    },
    //设置data中属性值
    setDataValue: function (name, value, propertyType) {
        if (propertyType === 'accessor' && this._data[_twaver.setter(name)]) {
            return this._data[_twaver.setter(name)](value);
        }
        else if (propertyType === 'style' && this._data.setStyle) {
            return this._data.setStyle(name, value);
        }
        else if (propertyType === 'client' && this._data.setClient) {
            return this._data.setClient(name, value);
        }
        else if (propertyType === 'field') {
            return this._data[this._propertyName] = value;
        }
    },
    //设置视图中input的值
    setViewValue: function (name, value, propertyType) {
        propertyType = propertyType || 'client';
        var input = this.getInput(name, propertyType);
        if (!input) return;
        value = this._parseValue(value, this.getValueType(input));
        input.value = value;
    },
    //格式化属性值
    _parseValue: function (value, valueType) {
        if (value === null || value === undefined) return;
        if (valueType === 'int') {
            value = parseInt(value);
        } else if (valueType === 'number') {
            value = parseFloat(value);
        }
        return value;
    },
    //设定data
    setData: function (data) {
        this.disposeData();
        this._data = data;
        if (this._data) {
            this._data.addPropertyChangeListener(this.dataPropertyChangeHandler, this);

        }
        this.refreshView();
    },
    //设定view
    setView: function (view) {

        this.disposeView();
        this._view = view;
        if (this._view) {
            this._inputCache = this.resetInputCache();
            this.refreshView();
        }
    },
    //释放资源
    dispose: function () {
        this.disposeData();
        this.disposeView();
    },
    //释放监听data变化
    disposeData: function () {
        if (!this._data) return;
        this._data.removePropertyChangeListener(this.dataPropertyChangeHandler, this);
    },
    //释放监听input的change事件监听
    disposeView: function () {
        if (!this._view) return;
        for (var key in this._inputCache) {
            var input = this._inputCache[key];
            input.onchange = null;
        }
    }
});
