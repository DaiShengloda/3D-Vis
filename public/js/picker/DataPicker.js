/**
 * 选择一个资产
 * main.dataPicker.setMulti(false).setCallback(function(r){console.log(r)}).setData({id:'floor01'}).show()
 * categoryFilter dataTypeFilter dataFilter 如果存在并且返回true,那么过滤掉改数据,不在界面中显示
 * @param sceneManager
 * @constructor
 */
DataPicker = function (options) {
    options = options || {};

    this.data = options.data; //默认选中的资产ID
    this.callback = options.callback || function (r) {
            console.log(r);
            return true;
        };//提交选择结果时的回调.
    this.isMulti = false; //是否支持多选

    this._categories = [];
    this._categoryMap = {};
    this._dataTypes = [];
    this._dataTypeMap = {};
    this._datas = [];
    this._dataMap = {};
    this.isLoad = false; //是否已经加载数据
    this.treeData = [];
    this.init();

};

mono.extend(DataPicker, Object, {


    /**
     * 初始化
     */
    init: function () {

        this.initView();
        this.initData();
    },

    /**
     * 初始化视图
     */
    initView: function () {

        var self = this;
        var $box = this.$box = $('<div class="data-picker-box"></div>').appendTo($('body'));

        var $treeBox = this.$treeBox = $('<div class="tree-box"></div>').appendTo($box);
        var $dataBox = this.$dataBox = $('<div class="data-box"></div>').appendTo($box);

        var $dataUl = this.$dataUl = $('<ul class="data-ul"></ul>').appendTo($dataBox);

        var treeView = this.treeView = new it.TreeView($treeBox);

        treeView.clickNodeFunction = function (data, node) {
            if (data.type != 'data') {
                return;
            } else {
                treeView.treeView.jstree("toggle_node", node);
            }
            var id = data.id;
            if (!self.isMulti) {
                self.$dataUl.empty();
            }
            if (self.$dataUl.find('.' + id).length == 0) {
                var li = self.createLi(data);
                self.$dataUl.append(li);
            }
        }

        $dataUl.on('click', '.close', function () {
            var li = $(this).closest('li');
            li.remove();
        })
    },

    /**
     * 初始化数据
     */
    initData: function () {


        var self = this;
        it.util.api('category', 'search', {
            attributes: ['id', 'description'],
            where: {}
        }, function (c) {
            self._categories = c;
            c.forEach(function (item) {
                self._categoryMap[item.id] = item;
            })
            it.util.api('datatype', 'search', {
                attributes: ['id', 'description', 'categoryId'],
                where: {}
            }, function (dt) {
                self._dataTypes = dt;
                dt.forEach(function (item) {
                    self._dataTypeMap[item.id] = item;
                })
                it.util.api('data', 'search', {
                    attributes: ['id', 'name', 'description', 'dataTypeId', 'parentId'],
                    where: {}
                }, function (d) {

                    self._datas = [];
                    self._dataMap = {};
                    d.forEach(function (item) {
                        var ddtt = self._dataTypeMap[item.dataTypeId];
                        if (!ddtt) {
                            console.error(it.util.i18n("DataPicker_Model_not_exist")+' : ' + item.dataTypeId, item, self._dataTypeMap);
                            return;
                        }
                        self._dataMap[item.id] = item;
                        self._datas.push(item);
                    })
                    self.isLoad = true;
                    self.treeData = self.getTreeData();
                    self.treeView.setData(self.treeData, false);
                    self.treeView.setTreeHeight(315);
                })
            })
        })

    },

    /**
     * 选中时,创建一个详细对话框
     * @param data
     * @returns {Mixed|jQuery|HTMLElement}
     */
    createLi: function (data) {

        data.id = data.id || '';
        data.name = data.name || '';
        data.parentId = data.parentId || '';
        data.description = data.description || '';
        var s = '' +
            '<li>' +
            '   <div class="item-box">' +
            '   <span class="close"></span>' +
            '   <table>' +
            '       <tr><td class="title">'+it.util.i18n("DataPicker_Asset_ID")+':</td><td class="value id">{id}</td></tr>' +
            '       <tr><td class="title">'+it.util.i18n("DataPicker_Asset_name")+':</td><td class="value name">{name}</td></tr>' +
            '       <tr><td class="title">'+it.util.i18n("DataPicker_Parent_ID")+':</td><td class="value parentId">{parentId}</td></tr>' +
            '       <tr><td class="title">'+it.util.i18n("DataPicker_Asset_description")+':</td><td class="value description">{description}</td></tr>' +
            '   </table>' +
            '   </div>' +
            '</li>'
        s = s.format(data);
        var li = $(s);
        li.addClass(data.id);
        return li;
    },

    /**
     * 返回资源树的数据
     */
    getTreeData: function (callback) {
        var treeData = this._getTreeData(this._datas, null);
        return treeData;
    },
    _isForCategory: function (data, categoryId) {
        var dt = this._dataTypeMap[data.dataTypeId];
        return dt.categoryId == categoryId;
    },
    _isEarth: function (data) {
        return this._isForCategory(data, 'earth');
    },
    _isDataCenter: function (data) {
        return this._isForCategory(data, 'dataCenter');
    },
    _isBuilding: function (data) {
        return this._isForCategory(data, 'building');
    },
    _isFloor: function (data) {
        return this._isForCategory(data, 'floor');
    },
    _isRoom: function (data) {
        return this._isForCategory(data, 'room');
    },
    /**
     * 是否是单例  地球,园区,大楼,楼层,机房几个类型的datatype通常只对应一个实例
     * @param data
     * @returns {*}
     * @private
     */
    _isSingleton: function (data) {
        var r = this._isEarth(data)
            || this._isDataCenter(data)
            || this._isBuilding(data)
            || this._isFloor(data)
            || this._isRoom(data);
        return r;
    },

    /**
     * 组织树结构的数据
     * @param datas
     * @param parentId
     * @returns {Array}
     * @private
     */
    _getTreeData: function (datas, parentId) {

        var result = [];
        var categoryMap = {};
        var dataTypeMap = {};
        parentId = parentId || null;
        var roots = this._getChildren(datas, parentId);
        for (var i = 0; i < roots.length; i++) {
            var data = roots[i];
            data.text = it.util.getLabel(data);
            data.type = 'data';
            if (this._isSingleton(data)) {
                result.push(data);
            } else {
                var dt = this._dataTypeMap[data.dataTypeId];
                var cat = this._categoryMap[dt.categoryId];
                var dtId = parentId + '-dt-' + dt.id;
                var catId = parentId + '-cat-' + cat.id;
                var catNode = null, dtNode = null;
                if (categoryMap[catId]) {
                    catNode = categoryMap[catId];
                } else {
                    catNode = {id: catId, text: it.util.getLabel(cat), children: []};
                    result.push(catNode);
                    categoryMap[catId] = catNode;
                }
                if (dataTypeMap[dtId]) {
                    dtNode = dataTypeMap[dtId];
                } else {
                    dtNode = {id: dtId, text: it.util.getLabel(dt), children: []};
                    catNode.children.push(dtNode);
                    dataTypeMap[dtId] = dtNode;
                }
                dtNode.children = dtNode.children || [];
                dtNode.children.push(data);
            }
            var children = this._getTreeData(datas, data.id);
            if (children.length > 0) {
                data.children = children;
            }
        }
        return result;
    },

    /**
     * 取得指定父亲的的孩子
     * @param datas 所有data
     * @param parentId
     * @returns {Array}
     * @private
     */
    _getChildren: function (datas, parentId) {
        var self = this;
        var result = [];
        datas.forEach(function (data) {
            if (!parentId && !self._dataMap[data.parentId]) {
                result.push(data);
            } else if (parentId && data.parentId == parentId) {
                result.push(data);
            }
        })
        return result;
    },


    /**
     * 显示选择框
     */
    show: function () {

        if (this.visible()) {
            return;
        }
        var self = this;
        this.$dataUl.empty();
        this.index = layer.open({
            type: 1,
            title: it.util.i18n("DataPicker_Select_asset")+' - ' + (this.isMulti ? it.util.i18n("DataPicker_Multi_selection") : it.util.i18n("DataPicker_single_selection")),
            skin: 'layui-layer-rim', //加上边框
            area: ['620px', '470px'],
            shadeClose: true,
            content: this.$box,
            btn: [it.util.i18n("DataPicker_Sure"), it.util.i18n("DataPicker_Close")],
            yes: function () {
                self.submit();
                self.hide();
            },
            end: function () {
                self.hide();
            }
        });
        if (this.isLoad && this.data) {
            if (this.isMulti) {
                this.data.forEach(function (item) {
                    if (self._dataMap[item.id]) {
                        var li = self.createLi(self._dataMap[item.id]);
                        self.$dataUl.append(li);
                    }

                })
            } else {
                if (self._dataMap[this.data.id]) {
                    var li = self.createLi(self._dataMap[this.data.id]);
                    self.$dataUl.append(li);
                }

            }

        }
    },

    /**
     * 隐藏选择框
     */
    hide: function () {

        if (!this.visible()) {
            return;
        }
        layer.close(this.index);
        delete this.index;
    },
    visible: function () {
        return this.index > 0;
    },

    getResult: function () {

        var result = [];
        this.$dataUl.find('li').each(function () {
            var li = $(this);
            var data = {};
            data.id = li.find('.id').text();
            data.name = li.find('.name').text();
            data.parentId = li.find('.parentId').text();
            data.description = li.find('.description').text();
            result.push(data);
        })
        return result;
    },

    /**
     * 提交结果
     */
    submit: function () {

        var result = this.getResult();
        //如果是单选,直接返回结果
        if (!this.isMulti) {
            if (result.length > 0) {
                result = result[0];
            } else {
                result = null;
            }
        }
        return this.callback && this.callback(result);
    },
    /**
     * 设置是否是多选
     * @param multi
     */
    setMulti: function (multi) {

        this.data = null;
        this.isMulti = multi;
        return this;
    },
    /**
     * 设置默认选中元素
     * @param data
     * @returns {DataPicker}
     */
    setData: function (data) {

        if (this.isMulti && !(data instanceof Array)) {
            throw 'data must array'
        }
        if (!this.isMulti && data instanceof Array) {
            throw 'data must object'
        }
        this.data = data;
        return this;
    },
    /**
     * 设置回调函数
     * @param callback
     * @returns {DataPicker}
     */
    setCallback: function (callback) {
        this.callback = callback;
        return this;
    },

    /**
     * 是否隐藏类别
     * @param category
     * @returns {boolean}
     */
    categoryFilter: function (category) {
        if (category.id == 'earth') {
            return true;
        }
        return false;
    },

    /**
     * 是否隐藏类型
     * @param dataType
     * @returns {boolean}
     */
    dataTypeFilter: function (dataType) {
        return false;
    },

    /**
     * 是否隐藏数据
     * @param data
     * @returns {boolean}
     */
    dataFilter: function (data) {
        return false;
    }

});