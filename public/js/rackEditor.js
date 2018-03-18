make.modelPath = '../theme/models/';
$(function () {

    // 指定make路径
    make.Default.path = '../modellib/'

    // 取得机柜类型
    var modelClass = doodle.Utils.getUrlParam('modelClass');
    var objectId = doodle.Utils.getUrlParam('objectId');
    var rackData = null;
    var rackDataType = null;
    var rackCategory = null;

    it.util.setLanguage('zh');

    // 取得显示编辑器的容器jquery对象
    var parentView = $('.content')

    // 实例化doodle.RackEditor对象,modelClass如果为空,在设备栏会显示所有机柜.
    var rackEditor = window.rackEditor = new doodle.RackEditor(parentView, null, objectId)

    // 隐藏工具栏
    rackEditor.setAccordionVisible(false);
    rackEditor.setPropertySheetVisible(false);

    // 全局视图
    $('#overview').click(function () {
        rackEditor.zoomOverview()
    })

    // import json
    var importDialog = doodle.Utils.createImportDialog('Import JSON', 'json', function (text) {
        var data = JSON.parse(text)
        rackEditor.setData(data)
        setTimeout(function () {
            rackEditor.zoomOverview()
        }, 100)
    })

    $('#import').click(function () {
        importDialog.show()
    })

    // export json
    $('#export').click(function () {
        var text = rackEditor.getData()
        if (!text) {
            alert(it.util.i18n("rackEditor_No_data"))
            return
        }
        text = JSON.stringify(text)
        doodle.Utils.createExportDialog(text)
    })

    $('#view').on('click', 'li', function () {
        var type = $(this).find('a').data('type')
        if (rackEditor.network2d[type]) {
            rackEditor.network2d[type]()
        }
    })

    $('#edit').on('click', 'li', function () {
        var type = $(this).find('a').data('type')
        if (rackEditor[type]) {
            rackEditor[type]()
        }
    })

    $('#rack-size').on('change', function () {
        var size = $(this).val()
        size = parseInt(size)
        if (isNaN(size) || size < 1) {
            $(this).val(1)
            return
        }
        refreshTree()
    })

    $('#rack-id').on('change', function () {
        refreshTree()
    })

    // 提交
    $('.submit').on('click', function () {
        //
        var datas = rackEditor.getData()
        if ((!datas || datas.length == 0) && rackEditor.deviceData && rackEditor.deviceData.length == 0) {
            it.util.showError(it.util.i18n("rackEditor_Input_device"))
            return
        }
        for (var i = 0; i < datas.length; i++) {
            var data = datas[i]
            if (!data.client || !data.client.bid) {
                it.util.showError(it.util.i18n("rackEditor_ID_null").format(data.client.loc))
                return
            }
            //     'column_name': 'a',
            //     'column_primary_key': 0,
            //     'column_type': 'STRING',
            //     'column_allow_null': 1,
            //     'column_default_value': ''
            //yyyy-MM-dd HH:mm:ss
            var client = data.client;
            for (var k = 0; k < rackEditor.columns.length; k++) {

                var c = rackEditor.columns[k];
                var p = c.column_name;
                if (!client[p] && c.column_default_value) {
                    client[p] = c.column_default_value;
                }
                if (!c.column_allow_null && !client[p]) {
                    it.util.showError(it.util.i18n("rackEditor_Prop_null").format({loc: data.client.loc, name: p}))
                    return
                }

                if ((c.column_type || '').toLowerCase() == 'dateonly') {
                    if (!client[p] || client[p].length < 19) {
                        it.util.showError(it.util.i18n("rackEditor_Prop_error").format({loc: data.client.loc, name: p}))
                        return
                    }
                    var ds = client[p];
                    var reg = /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/;
                    var r = ds.match(reg);
                    if (r == null) {
                        it.util.showError(it.util.i18n("rackEditor_Prop_error").format({loc: data.client.loc, name: p}))
                        return
                    }
                }

            }
        }

        var ps = []
        var newIiMap = {}
        for (var i = 0; i < datas.length; i++) {
            var data = datas[i]
            if (data.client.ii === undefined) {
                // 新加
                ps.push(add(data))
            } else {
                if (isChange(rackEditor.deviceDataMap[data.client.ii].client, data.client)) {
                    // 更新
                    ps.push(update(data))
                }
                newIiMap[data.client.ii] = data
            }
        }
        if (rackEditor.deviceData && rackEditor.deviceData.length > 0) {
            rackEditor.deviceData.forEach(function (item) {
                if (!newIiMap[item.client.ii]) {
                    // 删除
                    ps.push(remove(item))
                }
            })
        }

        Promise.all(ps).then(function () {
            if (!rackEditor.rackData) return;
            loadRack(rackEditor.rackData.id)
            var availableSpaceMax = getAvailableSpaceMax(rackEditor.rackData.id)
            it.util.dataMap[rackEditor.rackData.id].availableSpaceMax = availableSpaceMax
            it.util.showMessage(it.util.i18n("rackEditor_Save_success"))
        }, function (e) {
            console.log(e)
            it.util.showError(e)
        })

        function isChange(oldData, newData) {
            var keys1 = Object.keys(oldData);
            var keys2 = Object.keys(newData);
            for (var i in keys1) {
                var key = keys1[i];
                if (newData[key] === undefined) {
                    newData[key] = '';
                }
            }
            for (var i in keys1) {
                var key = keys1[i];
                if (oldData[key] != newData[key]) {
                    return true;
                }
            }
            for (var i in keys2) {
                var key = keys2[i];
                if (oldData[key] != newData[key]) {
                    return true;
                }
            }
            return false
        }

        function toData(data) {
            var param = {
                parentId: rackEditor.rackData.id,
                dataTypeId: data.id,
                id: data.client.bid,
                name: data.client.name,
                description: data.client.description,
                location: {x: 0, y: data.client.loc, z: 'pos_pos'},
                businessTypeId: data.client.businessTypeId,
                weight: data.client.weight,
                customField: {id: data.client.bid}
            }
            rackEditor.columns.forEach(function (column) {
                param.customField[column.column_name] = data.client[column.column_name] || '';
            })
            return param
        }

        function add(data) {
            return new Promise(function (resolve, reject) {
                var param = toData(data);
                param._event = 'dev_on';
                it.util.api('data', 'add', param, function (r) {
                    if (!r || r.length == 0) {
                        it.util.loadDatas()
                        reject(it.util.i18n("rackEditor_Save_fail").format({loc: param.location.y, id: param.id}))
                        return
                    }
                    var dd = r;
                    if (!dd) {
                        it.util.loadDatas()
                        reject(it.util.i18n("rackEditor_ID_exist").format({loc: param.location.y, id: param.id}))
                        return
                    }
                    it.util.dataMap[dd.id] = dd
                    it.util.dataIiMap[dd.ii] = dd
                    it.util.dataArray.push(dd)
                    it.util.customDataMap[dd.id] = dd.customField;
                    it.util.customDataArray.push(dd.customField);
                    resolve()
                }, reject)
            })
        }

        function update(data) {
            return new Promise(function (resolve, reject) {
                var param = toData(data)
                it.util.api('data', 'update', {options: {ii: data.client.ii}, value: param}, function () {
                    var old = it.util.dataIiMap[data.client.ii]
                    old.id = param.id
                    old.name = param.name
                    old.description = param.description
                    old.location.y = param.location.y;
                    old.businessTypeId = param.businessTypeId
                    old.weight = param.weight

                    var customData = it.util.customDataMap[param.id];
                    if (customData) {
                        $.extend(customData, param.customField);
                    } else {
                        it.util.customDataMap[param.id] = param.customField;
                        it.util.customDataArray.push(param.customField);
                    }
                    resolve()
                }, reject)
            })
        }

        function remove(data) {
            return new Promise(function (resolve, reject) {
                var param = toData(data);
                param._event = 'dev_off';
                it.util.api('data', 'remove', param, function () {
                    var dd = it.util.dataMap[param.id]
                    var i = it.util.dataArray.indexOf(dd)
                    it.util.dataArray.splice(i, 1)
                    delete it.util.dataIiMap[dd.ii]
                    delete it.util.dataMap[dd.id]

                    var cd = it.util.customDataMap[dd.id];
                    if (cd) {
                        i = it.util.customDataArray.indexOf(cd);
                        delete it.util.customDataMap[dd.id];
                        it.util.customDataArray.splice(i, 1);
                    }
                    resolve()
                }, reject)
            })
        }
    })

    // 清除
    $('.clear').on('click', function () {
        rackEditor.removeData(rackEditor.getData())
    })

    //启用回退
    rackEditor.setUndoManagerEnabled(true);

    // rackEditor.setAccordionVisible(true)  //显示左侧工具栏
    // rackEditor.setAccordionVisible(false) //隐藏左侧工具栏

    //监听删除动作
    $(rackEditor.network2d.getView()).on('keyup', function (e) {
        // console.log(e, e.keyCode)
        if (e.keyCode == 46) { // delete node
            rackEditor.network2d.getElementBox().removeSelection()
        }
    })

    //缩小选中误差
    rackEditor.network2d.setSelectionTolerance(0.5);

    // $('rack-list').jstree()

    $('#btnClear').on('click', function () {
        var data = rackEditor.box.getSelectionModel().getLastData();
        if (data) {
            return;
        }
    })

    //更新的编辑视图
    rackEditor.box.getSelectionModel().addSelectionChangeListener(function (e) {
        //console.log(e);
        if (e.kind == 'clear') {
            rackEditor.propertyPanel.setData(null);
            $('#businessTypeId').val('').change();
            return;
        }
        if (e.datas && e.datas.size() > 0 && rackEditor.propertyPanel) {
            var data = rackEditor.box.getSelectionModel().getLastData();
            rackEditor.propertyPanel.setData(data);
            $('#businessTypeId').change();
        } else {
            rackEditor.propertyPanel.setData(null);
            $('#businessTypeId').val('').change();
        }
    });

    // (1).属性名称(property)
    // (2).属性的新值(newValue)
    // (3).属性的原值(oldValue)
    // (4).发生变化的对象(source)。
    rackEditor.box.addDataPropertyChangeListener(function (e) {

        var node = e.source
        var name = e.property
        // console.log(e)
        if (name.indexOf('C:') == 0) {
            rackEditor.isChange = true;
        }
        if (name == 'C:bid') {
            // 系统冲突
            if (it.util.dataMap[e.newValue]) {
                var tn = it.util.dataMap[e.newValue]
                // 如果不是相同的data, 说明编号冲突了
                if (node.getClient('ii') !== tn.ii) {
                    it.util.showError(it.util.i18n("rackEditor_System_ID_exist") + e.newValue)
                    setTimeout(function () {
                        node.setClient('bid', e.oldValue || '')
                    }, 10)
                    return
                }
            }
            // 当前冲突
            rackEditor.box.getDatas().forEach(function (item) {
                if (item != node && item.getClient('bid') && node.getClient('bid') == item.getClient('bid')) {
                    it.util.showError(it.util.i18n("rackEditor_With") + item.getClient('loc') + it.util.i18n("rackEditor_Device_ID_exist") + e.newValue)
                    return
                }
            })
        }
    })
    rackEditor.box.addDataBoxChangeListener(function (e) {
        rackEditor.isChange = true
    })

    init(objectId);

    it.util.setLanguage('zh')
})

// var r = {
//     'table_name': 'a',
//     'column_name': 'a',
//     'column_primary_key': 0,
//     'column_type': 'STRING',
//     'column_allow_null': 1,
//     'column_default_value': '',
//     'column_unique': 0,
//     'column_auto_increment': 0,
//     'column_group_id': '',
//     'createdAt': '2017-03-10T08:32:46.000Z',
//     'updatedAt': '2017-03-10T08:32:46.000Z'
// }
/**
 * @function initCustomField 初始化自定义字段
 * @param  {type} callback {description}
 * @return {type} {description}
 */

function initCustomField(callback) {

    it.util.api('data', 'findCustomColumnsByCategoryId', {categoryId: 'equipment'}, function (columns) {

        var box = $('.custom-box');
        var map = {};
        columns.forEach(function (column) {
            var id = column.column_name;
            map[id] = column;
            var label = column.column_name;
            var value = column.column_default_value || '';
            var type = (column.column_type || '').toLowerCase();

            var s = '<div class="row">'
                + '<div class="col-md-4">'
                + '  <label for = "id" class = "inputpane-label label-box label-min" >' + label + '</label>'
                + '</div >'
                + '<div class = "value-box col-md-8" >'
                + '  <input id = "' + id + '" class = "input-min contral-width" name="' + id + '" property-type="client" value-type="' + type + '" value="' + value + '">'
                + '</div >'
                + '</div>';

            $(s).appendTo(box);
        });
        var propBox = $('.prop-box');
        rackEditor.columns = columns;
        rackEditor.columnMap = map;
        rackEditor.propertyPanel = new PropertyPanel(null, propBox[0]);
        callback && callback(columns);
    })
}

function init(objectId) {
    loadBusinessType();
    // 加载所有的 category
    it.util.loadCategories(function () {
        // 加载所有的 dataType
        it.util.loadDataTypes(function () {
            // 加载所有的 data
            it.util.loadDatas(function () {
                initTree();

                it.util.loadCustomData(function () {

                    initCustomField(function (columns) {

                        // 注册模型
                        registerModel(columns, function () {
                            initCompList(function(){
                                selectTreeNode(objectId);
                            })
                            // loadDevice(function () {
                            //     setTimeout(function () {
                            //         rackEditor.zoomOverview()
                            //     }, 800)
                            // })

                        })
                    });
                }, {category: 'equipment'})
            })
        })
    })
}

function selectTreeNode(objectId) {
    if (!objectId) return;
    loadRack(objectId);
    $('.tree-box').jstree().select_node(objectId);
    var container = $('.tree-container')[0];
    var selectNode = $('.tree-box').jstree().get_node(objectId, true)[0];
    container.scrollTop = selectNode.offsetTop - container.offsetTop - 100;
}

function loadBusinessType(callback) {
    var select = $('#businessTypeSelect');
    var input = $('#businessTypeId');
    select.on('change', function () {
        if (select.val() != input.val()) {
            input.val(select.val());
            input.change();
        }
    })


    input.on('change', function () {
        if (select.val() != input.val()) {
            select.selectpicker('val', input.val());
        }
    })

    $('#businessTypeSelect').val()
    select.selectpicker({
        liveSearch: false,
        maxOptions: 1,
    });
    it.util.api('business_type', 'search', {}, function (r) {
        r.forEach(function (item) {
            $('<option value="' + item.id + '" class="input-min">' + (item.name || item.id) + '</option>').appendTo(select);
        })

        select.selectpicker('refresh')
        callback && callback();
    })

}

/**
 * @function initTree 初始化树
 * @return {type} {description}
 */
function initTree() {
    var treeNodes = getTreeNode()
    var args = {
        'core': {
            'multiple': false,
            'data': treeNodes,
            'themes': {'theme': 'default', 'dots': true, 'icons': false}, // "dots": false
            'dblclick_toggle': false // 禁用tree的双击展开  
        },
        'plugins': ['search']
    }
    $('.tree-box').jstree(args).on('changed.jstree', function (e, data) {
        if (data.selected.length) {
            var asset = data.instance.get_node(data.selected[0])
            if (asset.select_flag) { // 如果是联动选中的标记的话，就直接返回
                delete asset.select_flag
                return
            }
            if (asset.original) {
                treeItemClickHandler(asset.original, e)
            }
        }
    })
}

/**
 * @function refreshTree 查询条件变更时, 更新树
 * @return {type} {description}
 */
function refreshTree() {
    var id = $('#rack-id').val()
    var size = parseInt($('#rack-size').val())
    var treeNodes = getTreeNode({id: id, size: size, opened: !!id}); // 如果 id 为空, 关闭最后一级父亲节点
    $('.tree-box').jstree(true).settings.core.data = treeNodes
    $('.tree-box').jstree().refresh()
}

/**
 * @function treeItemClickHandler 点击树, 弹出框
 * @param  {type} data {description}
 * @param  {type} e    {description}
 * @return {type} {description}
 */
function treeItemClickHandler(data, e) {
    // console.log(data, e)
    var id = data.id
    if (!it.util.dataMap[id]) {
        return
    }
    var dataType = it.util.dataTypeMap[it.util.dataMap[id].dataTypeId]
    if (!dataType || dataType.categoryId != it.util.CATEGORY.RACK) {
        $('.tree-box').jstree().deselect_node(id)
        if (rackEditor.rackData) {
            $('.tree-box').jstree().select_node(rackEditor.rackData.id)
        }
        return
    }
    if (rackEditor.rackData && rackEditor.rackData.id == id) {
        return
    }
    if (rackEditor.rackData && rackEditor.rackData.id != id && rackEditor.isChange) {
        it.util.confirm(it.util.i18n("rackEditor_Not_save"), function (r) {
            loadRack(id)
        }, function (r) {
            $('.tree-box').jstree().deselect_node(id)
            $('.tree-box').jstree().select_node(rackEditor.rackData.id)
        })
    } else {
        loadRack(id)
    }

    // console.log(rack, equipments)
}

/**
 * @function loadRack 加载机柜
 * @param  {type} id {description}
 * @return {type} {description}
 */
function loadRack(id) {
    var rackData = rackEditor.rackData = it.util.dataMap[id]
    var rackType = it.util.dataTypeMap[rackData.dataTypeId]
    if (!rackType || rackType.categoryId != it.util.CATEGORY.RACK) {
        return
    }
    var equipments = it.util.dataArray.filter(function (item) {
        return item.parentId == id
    })
    rackEditor.loadParent(rackData.dataTypeId)
    rackEditor.parentNode.setName(it.util.getLabel(rackData))
    var deviceData = rackEditor.deviceData = [];
    var deviceDataMap = rackEditor.deviceDataMap = {};
    equipments.forEach(function (item) {
        var json = {
            client: {
                loc: item.location.y,
                name: item.name || '',
                description: item.description || '',
                bid: item.id,
                ii: item.ii,
                businessTypeId: item.businessTypeId || '',
                weight: item.weight || 0
            },
            id: item.dataTypeId
        }
        var custom = it.util.customDataMap[item.id] || {};
        rackEditor.columns.forEach(function (item) {
            var col = rackEditor.columnMap[item.column_name];
            json.client[item.column_name] = custom[item.column_name] || col.column_default_value || '';
            if (json.client[item.column_name] && col.column_type.toLowerCase() == 'dateonly') {
                json.client[item.column_name] = moment(json.client[item.column_name]).format('YYYY-MM-DD HH:mm:ss');
            }
        })
        deviceData.push(json);
        rackEditor.deviceDataMap[item.ii] = json;
    })

    rackEditor.setData(deviceData)
    rackEditor.isChange = false
    setTimeout(function () {
        rackEditor.zoomOverview()
    }, 800)
}

/**
 * @function getAvailableSpaceMax 计算机柜最大空间
 * @return {type} {description}
 */
function getAvailableSpaceMax(id) {
    var rackData = it.util.dataMap[id]
    var rackType = it.util.dataTypeMap[rackData.dataTypeId]
    if (!rackType || rackType.categoryId != it.util.CATEGORY.RACK) {
        return 0
    }
    var equipments = it.util.dataArray.filter(function (item) {
        return item.parentId == id
    })
    var rackSize = rackType.childrenSize.y
    if (equipments.length == 0) {
        return rackSize
    }

    var locMap = {}
    equipments.forEach(function (item) {
        var itemType = it.util.dataTypeMap[item.dataTypeId]
        locMap[item.location.y] = itemType.size.y
    })
    var max = 0
    var curr = 0
    var isEmpty = true
    for (var i = 1; i <= rackSize;
         (i++ , curr++)) {
        if (locMap[i]) {
            // console.log(curr)
            max = Math.max(max, curr)
            curr = -1
            i += locMap[i]
            i--
        }
    }
    max = Math.max(max, curr)
    return max
}

/**
 * 组织成树结构, 存在一个问题, 没有机柜的房间也显示出来的.
 * 改成先列出所有的机柜列表, 然后反向查找父亲节点.
 * @param {[]} parentNodes
 */
function getTreeNode(param) {
    var roots = []
    var nodeMap = {}
    param = param || {}
    var rackId = param.id
    var rackSize = param.size
    // 所有的机柜
    var racks = it.util.dataArray.filter(function (item) {
        var dataType = it.util.dataTypeMap[item.dataTypeId]
        if (!dataType) {
            return false
        }
        var categoryId = dataType.categoryId
        var b = dataType && dataType.categoryId == it.util.CATEGORY.RACK
        if (b && rackId && rackId.trim().length > 0) {
            b &= item.id.indexOf(rackId) >= 0
        }
        if (b && rackSize && rackSize > 0) {
            if (item.availableSpaceMax === undefined) {
                item.availableSpaceMax = getAvailableSpaceMax(item.id)
            }
            b &= item.availableSpaceMax >= rackSize
        }
        return b
    })
    racks.forEach(function (item) {
        var node = toNode(item)
        nodeMap[node.id] = node
        findParent(node, 1)
    })
    /**
     * @function findParent 查找父亲节点, 叶子节点的父亲节点不展开
     * @param  {type} node {description}
     * @return {type} {description}
     */
    function findParent(node, level) {
        var parent = it.util.dataMap[node.parentId]
        if (parent) {
            if (!nodeMap[node.parentId]) {
                var parentNode = toNode(parent, level >= 2 || param.opened)
                nodeMap[node.parentId] = parentNode
            }
            if (nodeMap[node.parentId].children.indexOf(node) < 0) {
                nodeMap[node.parentId].children.push(node)
            }
            findParent(nodeMap[node.parentId], level + 1)
        } else if (roots.indexOf(node) < 0) {
            roots.push(node)
        }
    }

    /**
     * @function toNode 将 data 转换成 jstree 的 node 格式
     * @param  {type} data {description}
     * @return {type} {description}
     */
    function toNode(data, opened) {
        var node = {
            children: [],
            id: data.id,
            parentId: data.parentId,
            state: {opened: !!opened},
            text: it.util.getLabel(data)
        }
        return node
    }

    return roots
}

/**
 * @function registerModel 注册设备模型
 * @param  {type} callback {description}
 * @return {type} {description}
 */
function registerModel(columns, callback) {
    it.util.dataTypeIterator(function (dataTypeId, dataType) {
        var model = dataType.model
        var name = it.util.getLabel(dataType)
        if (dataType.categoryId == 'equipment') {
            if (!make.Default.getCreator(model)) {
                console.warn('dataType {0} info error, there is not creator[{1}] in make'.format(dataTypeId, model), dataType)
                return
            }

            var category = dataType.categoryId
            // console.log('register new model : category={categoryId}, id={id}, data={modelParameters}'.format(dataType))
            var newId2d = doodle.utils.getRackEditorModel2dId(dataTypeId)
            var oldId2d = doodle.utils.getRackEditorModel2dId(dataType.model)
            var icon = make.Default.getIcon(oldId2d) || make.Default.getIcon(newId2d);
            if (!make.Default.getCreator(oldId2d)) {
                console.warn('dataType {0} info error, there is not creator[{1}] in make'.format(dataTypeId, oldId2d), dataType)
                return
            }

            var dp = {
                'bid': {
                    name: it.util.i18n("rackEditor_ID"),
                    type: make.Default.PARAMETER_TYPE_STRING,
                    propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
                    editable: true
                },
                'name': {
                    name: it.util.i18n("rackEditor_Name"),
                    type: make.Default.PARAMETER_TYPE_STRING,
                    propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
                    editable: true
                },
                'description': {
                    name: it.util.i18n("rackEditor_Description"),
                    type: make.Default.PARAMETER_TYPE_STRING,
                    propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
                    editable: true
                },
                'loc': {
                    name: it.util.i18n("rackEditor_Position"),
                    type: make.Default.PARAMETER_TYPE_STRING,
                    propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
                    editable: false
                },
                'ii': {
                    name: 'ii',
                    type: make.Default.PARAMETER_TYPE_INT,
                    propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
                    editable: false,
                    hidden: true
                },
                'businessTypeId': {
                    name: it.util.i18n("rackEditor_Business_type"),
                    type: make.Default.PARAMETER_TYPE_STRING,
                    propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
                },
                'weight': {
                    name: it.util.i18n("rackEditor_Weight"),
                    type: make.Default.PARAMETER_TYPE_NUMBER,
                    propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
                }
            };
            columns.forEach(function (column) {
                dp[column.column_name] = {
                    name: column.column_name,
                    type: make.Default.PARAMETER_TYPE_STRING,
                    propertyType: make.Default.PARAMETER_PROPERTY_TYPE_CLIENT,
                    editable: false,
                    hidden: true,
                    value: column.column_default_value || ''
                }
            })
            make.Default.copy(newId2d, oldId2d, {image: dataType.modelParameters.image}, {
                category: category,
                name: name,
                icon: icon,
                sdk: true,
                modelDefaultParameters: dp

            }, {copyDefaultParamCoverage: true})
            // if (dataType.modelParameters.image) {
            //     make.Default.getParameters(newId2d).icon = 'model/idc/icons/' + dataType.modelParameters.image
            // }
            // 
        } else if (dataType.categoryId == 'rack') {
            if (!make.Default.getCreator(model)) {
                console.warn('dataType {0} info error, there is not create[{1}] in make'.format(dataTypeId, model), dataType)
                return
            }
            var newId2d = doodle.utils.getRackEditorModel2dId(dataTypeId, dataType.categoryId)
            var oldId2d = doodle.utils.getRackEditorModel2dId(dataType.model, dataType.categoryId)
            make.Default.copy(newId2d, oldId2d, {}, {name: name})
        }
    })
    // rackEditor.refreshAccordion()       //refresh里面直接添加到页面去了，这里不需要refresh
    callback && callback()
}

/**
 * @function initCompList 初始化设备列表
 * @return {type} {description}
 */
function initCompList(callback) {
    var ul = $('.comp-ul');


    function append(dataType, newId2d) {
        var li = $('<li class="item-li col-md-6" style="height: 108px;"></li>').appendTo(ul)
        var img = $('<img dragable="true">').appendTo(li)
        var oldId2d = doodle.utils.getSceneEditorModel2dId(dataType.model);
        var oldId3d = doodle.utils.getSceneEditorModel3dId(dataType.model);
        // var icon = make.Default.getIcon(oldId3d) || make.Default.getIcon(oldId2d);
        var icon = make.Default.getParameters(oldId3d).icon || make.Default.getParameters(oldId2d).icon;

        if (icon.indexOf('.device') >= 0) {
            icon = icon.replace('.device', '')
        }

        // if (dataType.modelParameters.image) {
        //     icon = make.Default.path + 'model/idc/icons/' + dataType.modelParameters.image
        // }

        img.attr('src', icon)
        img.attr('title', it.util.getLabel(dataType))
        var label = $('<div class="item-label" style="word-break: break-all"></div>').appendTo(li)
        label.text(dataType.id)

        var item = {id: newId2d}
        var dragData = JSON.stringify(item)
        img[0].ondragstart = function (event) {
            event.dataTransfer.setData('Text', dragData)
        }
        img[0].ondrag = function (e) {
            rackEditor.onDragHandler(e, item)
        }
    }

    it.util.dataTypeIterator(function (dataTypeId, dataType) {
        if (dataType.categoryId == 'equipment') {
            var newId2d = doodle.utils.getRackEditorModel2dId(dataType.model);
            if (!make.Default.getCreator(newId2d)) {
                
                console.error('model front is not exist : ' + dataTypeId, dataType)
                return
            }
            append(dataType, newId2d)
        }
    })

    callback && callback();
}