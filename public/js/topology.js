$(function () {

    initNetwork();
    init();
})

var topology = {};

/**
* @function initNetwork 初始化拓扑图
* @return {type} {description}
*/
function initNetwork() {

    var box = topology.box = new twaver.ElementBox();
    var network = topology.network = new twaver.vector.Network(box);
    var autoLayouter = topology.autoLayouter = new twaver.layout.AutoLayouter(box);
    var $box = $('.topo-box');
    $box.append(network.getView());
    network.adjustBounds({ x: 0, y: 0, width: $box.width(), height: $box.height() });
    $box.on('resize', function () {
        network.adjustBounds({ x: 0, y: 0, width: $box.width(), height: $box.height() });
    })

    $('.auto-layout-select').on('change', function () {
        var type = $(this).val();
        autoLayouter.doLayout(type, function () {
            network.zoomOverview(false);
            localStorage.setItem(topology.id + '_autoLayouter', type);
        });
    })

    // (1).属性名称(property)
    // (2).属性的新值(newValue)
    // (3).属性的原值(oldValue)
    // (4).发生变化的对象(source)。
    box.addDataPropertyChangeListener(function (e) {
        if (!topology.id) return;
        var node = e.source
        var name = e.property
        if (name == 'location') {
            var key = topology.id + '_' + node.getClient('dataId');
            var location = localStorage.setItem(key + '_location', it.util.o2s(e.newValue));
        }
    })

    network.addPropertyChangeListener(function (e) {
        if (!topology.id) return;
        var name = e.property;
        if (name == 'zoom') {
            localStorage.setItem(topology.id + '_zoom', e.newValue);
        } else if (name = 'viewRect') {
            var s = it.util.o2s(e.newValue);
            localStorage.setItem(topology.id + '_viewRect', s);
            console.log(topology.id, s);
        }
    })

    network.getToolTip = function (element) {
        if (!element) return;
        var data = element.getClient('data');
        if (!data) return;
        var s = it.util.i18n("topology_ID")+' : ' + data.id + '<br>'+it.util.i18n("topology_Name")+' : ' + data.name;
        var bt = element.getClient('businessType');
        if (bt) {
            s += '<br>'+it.util.i18n("topology_Type")+' : ' + (bt.name || bt.id);
        }
        return s;
    }

    network.addInteractionListener(function (e) {
        var kind = e.kind;
        if (kind == 'panning') {
            var p = network.getLogicalPoint(e.event);
            var di = topology.network.getInteractions()[0]
            localStorage.setItem(topology.id + '_panPoint', it.util.o2s(di.lastPanPoint));
        } else if (kind == 'doubleClickElement') {
            open("./?id=" + e.element.getClient('dataId'));
        }
    })
}

/**
* @function init 初始化
* @param  {type} callback {description}
* @return {type} {description}
*/
function init(callback) {

    var ps = [
        it.util.loadCategories(),
        it.util.loadDataTypes(),
        it.util.loadDatas(),
        it.util.loadCustomData(null, { category: 'equipment' }),
        it.util.loadBusinessTypes(),
        it.util.loadLinks()
    ];
    Promise.all(ps).then(function () {
        initTree();
    });
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
            'themes': { 'theme': 'default', 'dots': true, 'icons': false }, // "dots": false
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
    var treeNodes = getTreeNode({ id: id, size: size, opened: !!id }); // 如果 id 为空, 关闭最后一级父亲节点
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
    loadTopo(id);
}

/**
* @function findByDescendants 找到所有设备
* @param  {type} parentId {description}
* @param  {type} result   {description}
* @return {type} {description}
*/
function findDeviceByDescendants(parentId, result) {
    result = result || [];
    it.util.dataArray.forEach(function (item) {
        if (item.parentId == parentId) {
            if (isEquipment(item)) {
                result.push(item)
                return;
            }
            findDeviceByDescendants(item.id, result);
        }
    })

    return result;
}

function isEquipment(data) {
    var dt = it.util.dataTypeMap[data.dataTypeId];
    if (!dt) {
        return false;
    }
    var categoryId = dt.categoryId;
    return categoryId == it.util.CATEGORY.EQUIPMENT;
}

/**
 * @function loadTopo 加载拓扑图
 * @param  {type} id {description}
 * @return {type} {description}
 */
function loadTopo(id) {

    var di = topology.network.getInteractions()[0];
    // if(topology.id){

    //     localStorage.setItem(topology.id +'_zoom', topology.network.getZoom());

    // }
    topology.id = id;
    topology.box.clear();
    var datas = findDeviceByDescendants(id);
    datas.forEach(function (data) {
        var node = toNode(data);
        topology.box.add(node);
    })

    it.util.linkArray.forEach(function (item) {
        var from = topology.box.getDataById(item.fromId);
        if (!from) return;
        var to = topology.box.getDataById(item.toId);
        if (!to) return;
        var link = new twaver.Link(from, to);
        link.setName(item.id);
        initLink(link);
        topology.box.add(link);
    })
    var type = localStorage.getItem(topology.id + '_autoLayouter', type);
    if (!type) {
        $('.auto-layout-select').change();
    } else {
        var zoom = localStorage.getItem(topology.id + '_zoom');
        var viewRect = localStorage.getItem(topology.id + '_viewRect');
        if (zoom) {
            topology.network.setZoom(parseFloat(zoom) || 1);
            
            if (viewRect) {
                viewRect = it.util.s2o(viewRect);
                if (viewRect.x !== undefined && viewRect.y !== undefined && viewRect.width !== undefined && viewRect.height !== undefined) {
                    setTimeout(function () {
                        var old = topology.network.getViewRect();
                        topology.network.setViewRect(viewRect.x, viewRect.y, old.width, old.height);
                    }, 10)

                }
            }
        } else {
            setTimeout(function () {
                topology.network.zoomOverview();
            }, 100)
        }
    }
}

function initLink(link) {
    link.setStyle('link.width', 1);
    link.setStyle('link.color', '#0ACED1');

}

function toNode(data) {
    var dt = it.util.dataTypeMap[data.dataTypeId];
    var bt = it.util.businessTypeMap[data.businessTypeId];
    var node = new twaver.Node(data.id);
    node.setName(it.util.getLabel(data));
    node.setClient('data', data);
    node.setClient('dataId', data.id);
    node.setClient('businessType', bt);
    if (bt && bt.icon) {
        node.setImageUrl('images/topology/' + bt.icon + '.png');
    }

    var key = topology.id + '_' + node.getClient('dataId');
    var location = localStorage.getItem(key + '_location');
    if (location) {
        location = it.util.s2o(location);
    } else {
        location = { x: Math.random() * 1000, y: Math.random() * 1000 };
    }
    node.setSize({ width: 32, height: 32 });
    node.setLocation(location);
    return node;
}



/**
 * 组织成树结构, 显示地球, 园区, 大楼, 楼层, 机房
 * @param {[]} parentNodes 
 */
function getTreeNode() {
    var roots = []

    findChildren();

    function isTreeData(data) {
        var dt = it.util.dataTypeMap[data.dataTypeId];
        if (!dt) {
            return false;
        }
        var categoryId = dt.categoryId;
        return categoryId == it.util.CATEGORY.EARTH
            || categoryId == it.util.CATEGORY.DATA_CENTER
            || categoryId == it.util.CATEGORY.BUILDING
            || categoryId == it.util.CATEGORY.FLOOR
            || categoryId == it.util.CATEGORY.ROOM;
    }

    /**
     * @function findParent 查找父亲节点, 叶子节点的父亲节点不展开
     * @param  {type} node {description}
     * @return {type} {description}
     */
    function findChildren(parentNode) {

        if (parentNode) {
            var datas = it.util.dataArray.filter(function (item) {
                return item.parentId == parentNode.id && isTreeData(item);
            });
            var nodes = datas.map(function (data) {
                var node = toNode(data, true);
                findChildren(node);
                return node;
            })
            parentNode.children = nodes;
        } else {
            var datas = it.util.dataArray.filter(function (item) {
                return !it.util.dataMap[item.parentId] && isTreeData(item);
            });
            datas.forEach(function (data) {
                var node = toNode(data, true);
                roots.push(node);
                findChildren(node);
            })
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
            state: { opened: !!opened },
            text: it.util.getLabel(data)
        }
        return node
    }

    return roots
}
