/**
 * Created by andy on 6/15/16.
 */
if (!window.main) {
    window.main = {};
}
var SaveSceneDialog = main.SaveSceneDialog = function (jsonObjects, floorData, callback, options) {

    this.jsonObjects = jsonObjects;
    this.isNewFloor = !floorData;
    this.floorData = floorData || { id: 'new-floor' };
    this.callback = callback;
    this.options = options || {};
    this.layerMap = {};
    this.channelTypes = {};
    this.newChannelTypes = {};
    this.init();

    var socket = this.socket = it.util.createSocket();
    var self = this;
    socket.on('EDITOR_SAVE_PROGRESS', function (data) { //增加
        // console.log('EDITOR_SAVE_PROGRESS', data);
        $('.modal-title').text(it.util.i18n("Admin_SaveSceneDialog_Save_scene") + ' ' + data + '%');
    });

    
}

mono.extend(SaveSceneDialog, Object, {

    init: function () {

        var self = this;
        this.channelTypes = {};
        this.channelTypeIds = [];              //存放所有的通道id，为了后面生成新的通道的id
        it.util.dataTypeIterator(function (dataTypeId, dataType) {
            if (dataType.categoryId == it.util.CATEGORY.CHANNEL) {
                var item = dataType.modelParameters || {};
                var props = self.getChannelType(item);
                var key = it.util.o2s(props);
                self.channelTypes[key] = dataType;
                self.channelTypeIds.push(dataTypeId);
            }
        })

        //layerMap, validate data
        this.jsonObjects.forEach(function (item) {
            item.id = self.layerMap[item.id] || item.id;
            // if (!it.util.dataTypeMap[item.id]) {
            //     throw it.util.i18n("Admin_SaveSceneDialog_Data_error").format(item.id);
            // }

            if (self.isFloor(item) || self.isFloorChild(item) || self.isRoom(item) || self.isChannel(item) || self.isWaterLeak(item)) {
                if (self.isChannel(item)) {
                    //如果是相似的通道,创建同一个dataType
                    var props = null;
                    //如果是新建通道
                    if (!it.util.dataTypeMap[item.id]) {
                        props = self.getChannelType(item);
                    } else {
                        props = self.getChannelType(item);
                    }
                    var key = it.util.o2s(props);
                    if (self.channelTypes[key]) {
                        item.id = self.channelTypes[key].id;
                    } else {
                        self.newChannelTypes[key] = props;
                        item.id = key;
                    }
                }
            } 
        })
        //console.log(this.jsonObjects);
        this.floor = this.getFloor(this.jsonObjects);
        this.rooms = this.getRooms(this.jsonObjects);
        this.waters = this.getWaterLeak(this.jsonObjects);
        // this.channel = this.getChannel(this.jsonObjects);

    },
    show: function () {

        //将内墙, 墙, floor拆分出去
        var self = this;
        var dataTypes = it.util.dataTypeMap;
        var floorData = this.floorData;
        var bodyContent = $("<div class = 'row it_content save-scene-dialog'></div>");
        var f = function (title) {
            var col = $("<div class = 'col-md-6'></div>").appendTo(bodyContent);
            return it.util.createPanel(col, title);
        }
        var treePanel = f(it.util.i18n("Admin_SaveSceneDialog_Scene_data"));
        var formPanel = f(it.util.i18n("Admin_SaveSceneDialog_Add_system_data"));
        $("<div class = 'lable-progress label'></div>").appendTo(bodyContent);

        var operationDiv = formPanel.getContent();

        var treeData = this.getTreeData();
        var treeView = this.treeView = new it.TreeView(treePanel.getContent());

        treeView.sortFunction = function (o1, o2) {
            var i1 = o1.sortIndex || -1;
            var i2 = o2.sortIndex || -1;
            return i1 - i2;
        }

        this.treeData = treeData;
        treeView.setData(treeData, false);

        treeView.clickNodeFunction = function (data, node) {
            // operationDiv.empty();
            var props = [], exist = it.util.i18n("Admin_SaveSceneDialog_Exist"), v = it.validator;
            if (data.type == 'floor') {

                var head = self.isNewFloor ? it.util.i18n("Admin_SaveSceneDialog_Create_room") : it.util.i18n("Admin_SaveSceneDialog_Update_floor");

                formPanel.setHead(it.util.i18n("Admin_SaveSceneDialog_Save_room"));

                props.push({
                    label: it.util.i18n("Admin_SaveSceneDialog_ID"),
                    id: 'id',
                    value: data.dataId || '',
                    readonly: !self.isNewFloor || self.options.type == 'scene'
                });
                props.push({
                    label: it.util.i18n("Admin_SaveSceneDialog_Description"),
                    id: 'description',
                    value: data.description || '',
                    readonly: self.options.type == 'scene'
                });
                props.push({
                    label: it.util.i18n("Admin_SaveSceneDialog_Position"),
                    id: 'position',
                    value: it.util.o2s(data.position || { x: 0, y: 0, z: 0 }),
                    readonly: self.options.type == 'scene'
                });
                props.push({
                    label: it.util.i18n("Admin_SaveSceneDialog_Building_belong_to"),
                    id: 'parentId',
                    type: 'select',
                    params: { url: it.util.wrapUrl('data/getBuildingData'), valueField: 'id' },
                    readonly: self.options.type == 'scene',
                    disabled: self.options.type == 'scene',
                });
                var floorCategoryDesc = it.util.categoryMap['floor'].description || it.util.i18n("Admin_SaveSceneDialog_Floor");
                var form = util.createForm(props, self.options.type != 'scene', function (result) {
                    self.floorData.id = result.id;
                    data.dataId = result.id;//楼层编号
                    data.description = result.description;//机房描述
                    data.parentId = result.parentId;//所属楼层
                    data.position = it.util.s2o(result.position);
                    var label = data.dataId;
                    if (data.description && data.description.trim().length > 0) {
                        label += ("-" + data.description);
                    }
                    data.text = floorCategoryDesc + '(' + label + ')';
                    node.node.text = treeView.treeView.jstree("set_text", node.node.id, data.text);
                    self._syncChildParent(node, node.node, data.dataId);
                });
                var opt = {};
                //如果是新建楼层,需要校验id是否冲突
                if (self.isNewFloor) {
                    opt.id = {
                        trigger: 'blur',
                        validators: [v.notEmpty('id'), v.remote(exist, it.util.wrapUrl('data/exist'), 'id'), v.remote(exist, it.util.wrapUrl('datatype/exist'), 'id')]
                    };
                }
                util.initValidator(form, opt);
            } else if (data.type == 'roomType' || data.type == 'waterType' || data.type == 'dataType') {
                formPanel.setHead(it.util.i18n("Admin_SaveSceneDialog_Batch_create_info"));
                props.push({ label: it.util.i18n("Admin_SaveSceneDialog_ID_prefix"), id: 'idPrefix', value: data.idPrefix || '' });
                props.push({ label: it.util.i18n("Admin_SaveSceneDialog_Description_prefix"), id: 'descPrefix', value: data.descPrefix || '' });
                if (data.isNewChannelType) {
                    props.push({ label: it.util.i18n("Admin_SaveSceneDialog_Type_ID"), id: 'id', value: data.dataId || '', readonly: false });
                    props.push({ label: it.util.i18n("Admin_SaveSceneDialog_Type_description"), id: 'description', value: data.description || '', readonly: false });
                    props.push({
                        label: it.util.i18n("Admin_SaveSceneDialog_Param"),
                        id: 'modelParameters',
                        value: it.util.o2s(data.modelParameters) || '',
                        readonly: true
                    });
                }
                var form = util.createForm(props, true, function (result) {
                    var idPrefix = result.idPrefix || '';
                    var descPrefix = result.descPrefix || '';
                    var i = 1;
                    if (idPrefix.indexOf('-') >= 0) {
                        var arr = idPrefix.split('-');
                        i = parseInt(arr[1]) || 1;
                        data.idPrefix = idPrefix = arr[0] + '-';
                    }
                    data.idPrefix = idPrefix;
                    data.descPrefix = descPrefix;
                    data.dataId = result.id;
                    data.description = result.description;
                    node.node.children.forEach(function (child) {
                        var childNode = node.instance.get_node(child)
                        var childData = childNode.original;
                        //如果是新记录,自动生成编号和描述
                        if (childData.isNew && !childData.dataId) {
                            childData.dataId = idPrefix + self.getSequence(i);
                            if (data.isNewChannelType) {
                                childData.dataTypeId = data.dataId;
                            }
                            self._syncChildParent(node, childNode, childData.dataId);
                            if (descPrefix) {
                                childData.description = descPrefix + self.getSequence(i);
                                childData.text = childData.dataId + "-" + (childData.description || '');
                            } else {
                                childData.text = childData.dataId;
                            }
                            treeView.treeView.jstree("set_text", childNode.id, childData.text);
                            i++;
                        }
                    });
                });
                var childLen = node.node.children.length;
                var opt = {
                    idPrefix: {
                        trigger: 'blur',
                        validators: [
                            v.notEmpty('idPrefix'),
                            v.callback(exist, function (value, validator) {
                                var s = value + self.getSequence(1), e = value + self.getSequence(childLen);
                                var root = treeView.treeView.jstree('get_node', "root");
                                var checked = self.checkData(treeView, root, function (val) {
                                    if (val.dataId && val.dataId >= s && val.dataId <= e) {
                                        return false;
                                    }
                                    return true;
                                });
                                return checked;
                            }),
                            v.remote(exist, it.util.wrapUrl('/data/exist'), 'id', function (validator) {
                                var idPre = validator.getFieldElements('idPrefix').val();
                                var d = {
                                    where: { id: { $between: [idPre + self.getSequence(1), idPre + self.getSequence(childLen)] } }
                                };
                                return d;
                            })
                        ]
                    }
                };
                //如果是新建楼层,需要校验id是否冲突
                if (data.isNewChannelType) {
                    opt.id = {
                        trigger: 'blur',
                        validators: [v.notEmpty('id'), v.remote(exist, it.util.wrapUrl('data/exist'), 'id'), v.remote(exist, it.util.wrapUrl('datatype/exist'), 'id'), v.notEmpty('dataTypeId')]
                    };
                }
                util.initValidator(form, opt);
            } else {

                var isNew = data.isNew;
                var isNewModel = data.isNewChannelType;
                formPanel.setHead(it.util.i18n("Admin_SaveSceneDialog_Update_info"));
                props.push({ label: it.util.i18n("Admin_SaveSceneDialog_Type") + '#', id: 'dataTypeId', value: data.dataTypeId, readonly: !isNewModel });
                props.push({ label: it.util.i18n("Admin_SaveSceneDialog_ID"), id: 'id', value: data.dataId || '', readonly: !isNew });
                props.push({ label: it.util.i18n("Admin_SaveSceneDialog_Parent"), id: 'parentId', value: data.parentId || '', readonly: true });
                props.push({ label: it.util.i18n("Admin_rackEditor_Description"), id: 'description', value: data.description || '', readonly: false });
                props.push({ label: it.util.i18n("Admin_SaveSceneDialog_Physical_position"), id: 'position', value: it.util.o2s(data.position), readonly: true });
                props.push({ label: it.util.i18n("Admin_SaveSceneDialog_Logical_position"), id: 'location', value: it.util.o2s(data.location), readonly: true });
                props.push({ label: it.util.i18n("Admin_SaveSceneDialog_Rotation"), id: 'rotation', value: it.util.o2s(data.rotation), readonly: true });
                var form = util.createForm(props, true, function (result) {
                    data.dataId = result.id;
                    data.description = result.description;
                    data.text = data.dataId;
                    if (data.description && data.description.trim().length > 0) {
                        data.text += ("-" + data.description);
                    }
                    treeView.treeView.jstree("set_text", node.node.id, data.text);
                    self._syncChildParent(node, node.node, data.dataId);
                });
                var opt = {
                    id: {
                        trigger: 'blur',
                        validators: [v.notEmpty('id'), v.remote(exist, it.util.wrapUrl('/data/exist'), 'id')]
                    }
                };
                //如果是新建通道
                if (isNewModel) {
                    opt.dataTypeId = {
                        trigger: 'blur',
                        validators: [v.notEmpty('dataTypeId'), v.remote(exist, it.util.wrapUrl('/datatype/exist'), 'id')]
                    }
                }
                util.initValidator(form, opt);
            }
            formPanel.setContent(form);
        };
        util.modal(it.util.i18n("Admin_SaveSceneDialog_Save_scene"), bodyContent, true, true, function (sucess, error) {
            return self.submit(function (result) {
                if (result.error) {
                    error(result.error);
                } else {
                    sucess('保存成功');
                    self.socket.close();
                    self.callback && self.callback(self.floorData);
                }
            });
        }, true).find('.modal-body').css({
            paddingTop: '0px',
            paddingBottom: '0px'
        });
    },

    _syncChildParent: function (node, childNode, parentId) {
        //修改孩子的父亲字段
        childNode.children.forEach(function (childChild) {
            var childChildNode = node.instance.get_node(childChild)
            var childChildData = childChildNode.original;
            //如果孩子节点是数据节点,直接修改,如果是类型节点,需要进一步修改孩子的孩子的parent字段
            if (childChildData && (childChildData.type == 'room' || childChildData.type == 'water' || childChildData.type == 'data')) {
                childChildData.parentId = parentId;
            } else if (childChildData && (childChildData.type == 'dataType' || childChildData.type == 'waterType' || childChildData.type == 'roomType')) {
                childChildNode.children.forEach(function (childChildChild) {
                    var childChildChildNode = node.instance.get_node(childChildChild)
                    var childChildChildData = childChildChildNode.original;
                    if (childChildChildData && (childChildChildData.type == 'room' || childChildChildData.type == 'water' || childChildChildData.type == 'data')) {
                        childChildChildData.parentId = parentId;
                    }
                });
            }
        });
    },

    getSequence: function (num) { // 获取一个序列号，比如0001
        num = num + "";
        var array = [0, 0];
        if (num.length > array.length) {
            return num;
        }
        return array.slice(0, array.length - num.length).join("") + num;
    },

    getTreeData: function () {

        var self = this;
        var dataTypes = it.util.dataTypeMap;
        var jsonObjects = this.jsonObjects;
        var floorData = this.floorData;
        var floor = this.floor;
        var rooms = this.rooms;
        var waters = this.waters;
        var channels = this.channel;
        //
        //var channel = this.getChannel(jsonObjects);
        //var rack = this.getRack(jsonObjects);
        //
        //var others = jsonObjects;

        //所有父亲为空的元素,将父亲设置为floor
        for (var i = 0; i < jsonObjects.length; i++) {
            var jsonObject = jsonObjects[i];
            jsonObject.client = jsonObject.client || {};
            jsonObject.parentId = jsonObject.parentId || floorData.id;
            //jsonObject.client.bid = jsonObject.client.bid || jsonObject.objectId;

            //FIXME  parent
            //jsonObject.client = jsonObject.client || {};
            //jsonObject.client.parentId = jsonObject.client.parentId || floorData.id;
        }

        var data = [];
        var floorPosition = {
            x: 0,
            y: 0,
            z: 0
        };
        if (floor[0].position) {
            var p = floor[0].position;
            floorPosition.x = parseFloat(p[0] ? p[0] : 0).toFixed(1);
            floorPosition.y = parseFloat(p[1] ? p[1] : 0).toFixed(1);
            floorPosition.z = parseFloat(p[2] ? p[2] : 0).toFixed(1);
        } else if (floorData.position) {
            position = floorData.position;
            floorPosition.x = position.x;
            floorPosition.y = position.y;
            floorPosition.z = position.z;
        }


        //floor
        var root = {
            id: 'root',
            text: it.util.i18n("Admin_SaveSceneDialog_Floor"),
            type: 'floor',
            isNew: this.isNewFloor,
            children: [],
            dataId: floorData.id,
            description: floorData.description,
            position: { x: 0, y: 0, z: 0 },
            originPosition: floorPosition,
            realId: floor[0].objectId,
            jsonData: floor
        };

        data.push(root);

        //room
        if (rooms.length > 0) {
            var roomType = {
                id: 'roomType',
                text: it.util.i18n("Admin_SaveSceneDialog_Room"),
                type: 'roomType',
                name: 'room',
                children: [],
            }
            root.children.push(roomType);
            for (var i = 0; i < rooms.length; i++) {
                var room = rooms[i];
                room.client = room.client || {};
                var roomData = {
                    dataId: room.client.bid || '',
                    description: room.description || '',
                    dataTypeId: room.id,
                    isNew: !room.client.persistence,
                    type: 'room',
                    parentId: floorData.id,
                    realId: room.client.bid || room.objectId,
                    jsonData: room,
                };
                if (roomData.isNew) {
                    roomData.text = roomData.dataId || ('room' + "-" + i + "!")
                } else {
                    roomData.text = roomData.dataId + ' ' + roomData.description;
                }
                if (room.position) {
                    roomData.position = {
                        x: room.position[0],
                        y: room.position[1],
                        z: room.position[2]
                    };
                }
                this.addTreeDataChild(roomData, jsonObjects);
                roomType.children.push(roomData);
            }
        }

        //add water
        if (waters.length > 0) {
            var waterType = {
                id: 'waterType',
                text: it.util.i18n("Admin_SaveSceneDialog_Leakage_line"),
                type: 'waterType',
                name: 'water',
                children: []
            }
            root.children.push(waterType);
            for (var i = 0; i < waters.length; i++) {
                var water = waters[i];
                water.client = water.client || {};
                var waterData = {
                    dataId: water.client.bid || '',
                    description: water.description || '',
                    dataTypeId: water.id,
                    isNew: !water.client.persistence,
                    name: 'water',
                    type: 'water',
                    parentId: floorData.id,
                    realId: water.client.bid || water.objectId,
                    jsonData: water,
                };
                if (waterData.isNew) {
                    waterData.text = waterData.dataId || ('water' + "-" + i + "!")
                } else {
                    waterData.text = waterData.dataId + ' ' + waterData.name;
                }
                if (water.position) {
                    waterData.position = {
                        x: water.position[0],
                        y: water.position[1],
                        z: water.position[2]
                    };
                }
                this.addTreeDataChild(waterData, jsonObjects);
                waterType.children.push(waterData);
            }
        }


        //添加楼层的孩子, 先添加机房,让机房显示在上面
        this.addTreeDataChild(root, jsonObjects);

        //FIXME sort children;
        this.sortTreeData(root);

        //reset children text;
        return data;
    },

    /**
     * 添加parent节点的孩子节点
     * @param parentData
     * @param jsonObjects
     */
    addTreeDataChild: function (parentData, jsonObjects) {

        var self = this;
        var dataTypes = it.util.dataTypeMap;
        var parentId = parentData.realId;
        if (!parentId || parentId.trim().length == 0) {
            return;
        }
        if (jsonObjects.length == 0) {
            return;
        }
        //找到所有孩子,并且按类型分组
        //新建的机房,所有都是机房的
        var otherObjects = {};
        for (var i = 0; i < jsonObjects.length; i++) {
            var jsonObject = jsonObjects[i];
            var id = jsonObject.id;
            var pid = null;
            //FIXME parent 可能会改变
            //if (jsonObject.client) {
            //    pid = jsonObject.client.parentId
            //}
            pid = jsonObject.parentId;
            var pdata = sceneEditor.jsonBox.getDataById(pid);
            var prealid =  pdata && pdata.client.bid;

            if (parentId == pid || (pdata && parentId == prealid)) {
                otherObjects[id] = otherObjects[id] || [];
                otherObjects[id].push(jsonObject);
                jsonObjects.splice(i, 1);
                i--;
            }
        }

        //其它数据
        var keys = Object.keys(otherObjects);
        if (keys.length > 0) {
            parentData.children = parentData.children || [];
        }
        keys.forEach(function (dataTypeId) {
            var text = '';
            var name = dataTypeId;
            var isNewChannelType = false;
            if (self.newChannelTypes[dataTypeId]) {
                var info = self.newChannelTypes[dataTypeId];
                text = it.util.i18n("Admin_SaveSceneDialog_Create_channel") + '-' + (info.isSingle ? 1 : 2) + '-' + info.rackNumber;
                isNewChannelType = true;
                name = text;
            } else {
                text = dataTypes[dataTypeId].description || '';
                if (text.trim().length == 0) {
                    text = dataTypeId;
                }
            }

            var newChannelId = self.getNewChannelId(self.channelTypeIds);

            var data = {
                text: text,
                type: "dataType",
                name: name,
                children: [],
                isNewChannelType: isNewChannelType,
                dataTypeId: isNewChannelType ? 'channel' + newChannelId  : dataTypeId,
            };
            if (isNewChannelType) {
                data.description = text;
                data.modelParameters = self.newChannelTypes[dataTypeId];
            }
            parentData.children.push(data);
            var i = 1;
            otherObjects[dataTypeId].forEach(function (jsonObject) {
                jsonObject.client = jsonObject.client || {};
                var childData = {
                    type: "data",
                    dataId: jsonObject.client.bid || '',
                    dataTypeId: isNewChannelType ? 'channel' + newChannelId : dataTypeId,
                    isNew: isNewChannelType ? true : !jsonObject.client.persistence,
                    parentId: jsonObject.parentId,
                    realId: jsonObject.client.bid || jsonObject.objectId,
                    children: [],
                    isNewChannelType: isNewChannelType,
                }
                if (childData.isNew) {
                    childData.text = childData.dataId || (text + "-" + self.getSequence(i) + "!")
                } else {
                    childData.text = childData.dataId;
                }
                if (self.isChannel(jsonObject)) {
                    childData['aisleDepth'] = jsonObject.aisleDepth;
                    childData['rackDepth'] = jsonObject.rackDepth;
                    childData['rackHeight'] = jsonObject.rackHeight;
                    childData['rackNumber'] = jsonObject.rackNumber;
                    childData['rackWidth'] = jsonObject.rackWidth;
                    childData['side'] = jsonObject.side || 'right';
                }
                childData.position = { x: 0, y: 0, z: 0 };
                if (jsonObject.position) {
                    childData.position = {
                        x: jsonObject.position[0],
                        y: jsonObject.position[1],
                        z: jsonObject.position[2]
                    };
                }
                childData.location = { x: 0, y: 0, z: 0 };
                if (jsonObject.location) {
                    childData.location = {
                        x: jsonObject.location[0],
                        y: jsonObject.location[1],
                        z: jsonObject.location[2]
                    };
                }
                childData.rotation = { x: 0, y: 0, z: 0 };
                if (jsonObject.rotation) {
                    childData.rotation = {
                        x: jsonObject.rotation[0],
                        y: jsonObject.rotation[1],
                        z: jsonObject.rotation[2]
                    }
                }
                self.addTreeDataChild(childData, jsonObjects);
                data.children.push(childData);
                i++;
            });
        });
    },

    getNewChannelId: function (channelTypeIds) {
        var newChannelId = this.getSequence(channelTypeIds.length);
        if(channelTypeIds.indexOf(newChannelId) >= 0) {
            newChannelId = this.getSequence(channelTypeIds.length + 1);
        }
        channelTypeIds.push(newChannelId);
        return newChannelId;
    },


    /**
     * 排序
     * @param nodeData
     */
    sortTreeData: function (nodeData) {

        var index = 0;
        if (nodeData.children && nodeData.children.length > 0) {
            nodeData.children.sort(function (a, b) {
                if (a.position && b.position) {
                    var dx = a.position.x - b.position.x;
                    var dz = a.position.z - b.position.z;
                    if (dz != 0) {
                        return dz;
                    }
                    return dx;
                }
                return 0;
            });
            for (var i = 0; i < nodeData.children.length; i++) {
                var child = nodeData.children[i];
                if (child.isNew) {
                    if (child.dataId) {
                        child.text = child.dataId;
                    } else {
                        child.text = nodeData.name + "-" + this.getSequence(index++) + "!"
                    }
                }
                child.sortIndex = index;
                this.sortTreeData(child);
            }
        }
    },

    /**
     * 校验数据
     * @param treeView
     * @param treeNode
     * @param handle
     * @returns {boolean}
     */
    checkData: function (treeView, treeNode, handle) {
        var data = treeNode.original;
        if (data) {
            var type = data.type;
            if (type == 'floor' || type == 'room' || type == 'data') { //楼层, 机房, 数据
                if (handle) {
                    var result = handle(data);
                    if (!result) {
                        return false;
                    }
                }
            }
            if (treeNode.children) {
                for (var i = 0; i < treeNode.children.length; i++) {
                    if (!this.checkData(treeView, treeView.treeView.jstree('get_node', treeNode.children[i]), handle)) {
                        return false;
                    }
                }
            }
        }
        return true;
    },

    submit: function (cb) {

        var self = this;
        var callback = function (data) {
            if (!data || !data.error) {
                //释放资源
                self.socket.destroy();
            }
            cb && cb(data);
        }
        var treeView = this.treeView;
        var rootNode = treeView.treeView.jstree('get_node', "root");
        var rootData = rootNode.original;
        if (rootData.dataId == 'new-floor') {
            rootData.dataId = '';
            callback && callback({ error: it.util.i18n("Admin_SaveSceneDialog_Input_floor_ID") });
            return true;
        }
        var idMap = {};
        var checked = this.checkData(treeView, rootNode, function (data) {
            if (data.dataId == null || data.dataId.trim().length == 0) {
                callback && callback({ error: data.text + it.util.i18n("Admin_SaveSceneDialog_ID_is_null") });
                return false;
            }
            if (idMap[data.dataId]) {
                callback && callback({ error: data.text + it.util.i18n("Admin_SaveSceneDialog_ID_is_repeat") + ":" + data.dataId });
                return false;
            } else {
                idMap[data.dataId] = data;
            }
            return true;
        });
        if (!checked) return true;

        var result = this.getSaveData();
        it.util.adminApi('editor', 'saveScene', result, callback, function (error) {
            callback && callback({ error: error.message });
        });
        return false;
    },

    forEachChildren: function (treeView, treeNode, handle) {
        var self = this;
        if (treeNode.children) {
            treeNode.children.forEach(function (child) {
                var childTreeNode = treeView.treeView.jstree('get_node', child);
                handle && handle(treeView, treeNode, childTreeNode);
                self.forEachChildren(treeView, childTreeNode, handle);
            });
        }
    },


    getSaveData: function () {

        var self = this;
        function removeInfo(data) {

            data.forEach(function (d) {
                delete d['objectId'];
                delete d['parentId'];
                if (data.children) {
                    removeInfo(data.children)
                }
            })
        }

        var result = [];
        var treeView = this.treeView;
        var rootNode = treeView.treeView.jstree('get_node', "root");
        var floor = rootNode.original;
        if (floor.originPosition) {

            var dx = floor.position.x - (floor.originPosition.x || 0), dz = floor.position.z - (floor.originPosition.z || 0);
            //移动门窗的相对位置
            if (floor.jsonData) {
                floor.jsonData.forEach(function (data) {
                    if (data.children) {
                        data.children.forEach(function (child) {
                            if (child.position) {
                                child.position[0] += dx;
                                child.position[2] += dz;
                            }
                        })
                    }
                })
            }
        }


        //如果是新建楼层,同步新建一个同名的dataType
        if (this.options.type != 'scene') {
            if (floor.isNew) {
                result.push({
                    id: floor.dataId,
                    name: floor.dataId,
                    description: floor.description,
                    model: 'twaver.combo',
                    modelParameters: floor.jsonData,
                    categoryId: 'floor',
                    isNew: floor.isNew,
                    _type: 'datatype'
                })
                result.push({
                    id: floor.dataId,
                    dataTypeId: floor.dataId,
                    name: floor.dataId,
                    description: floor.description,
                    parentId: floor.parentId,
                    position: floor.position,
                    isNew: floor.isNew,
                })
            } else {
                result.push({
                    options: {
                        id: this.floorData.dataTypeId,
                    },
                    value: {
                        modelParameters: floor.jsonData,
                    },
                    isNew: floor.isNew,
                    _type: 'datatype'
                })
                result.push({
                    options: {
                        id: floor.dataId,
                    },
                    value: {
                        name: floor.name,
                        description: floor.description,
                        parentId: floor.parentId,
                        position: floor.position,
                    },
                    isNew: floor.isNew,
                })
            }
        }
        removeInfo(floor.jsonData);
        delete floor.jsonData[0]['position'];

        var roomType = treeView.treeView.jstree('get_node', "roomType");
        if (roomType && roomType.children) {
            roomType.children.forEach(function (child) {
                var roomNode = treeView.getNodeById(child)
                var roomData = roomNode.original;

                if (roomData.jsonData.label == undefined) {
                    roomData.jsonData.label = roomData.dataId;
                    if (roomData.description && roomData.description.trim().length > 0) {
                        roomData.jsonData.label = roomData.description;
                    }
                }

                //如果是新建机房,同步新建一个同名的dataType
                if (roomData.isNew) {
                    result.push({
                        id: roomData.dataId,
                        name: roomData.dataId,
                        description: roomData.description,
                        model: roomData.jsonData.id,
                        modelParameters: roomData.jsonData,
                        categoryId: 'room',
                        isNew: roomData.isNew,
                        _type: 'datatype'
                    })
                    result.push({
                        id: roomData.dataId,
                        dataTypeId: roomData.dataId,
                        name: roomData.dataId,
                        description: roomData.description,
                        parentId: roomData.parentId,
                        position: roomData.position,
                        isNew: roomData.isNew,
                    })
                } else {
                    result.push({
                        options: {
                            id: roomData.dataTypeId,
                        },
                        value: {
                            modelParameters: roomData.jsonData,
                        },
                        isNew: roomData.isNew,
                        _type: 'datatype'
                    })
                    result.push({
                        options: {
                            id: roomData.dataId,
                        },
                        value: {
                            name: roomData.name,
                            description: roomData.description,
                            parentId: roomData.parentId,
                            position: roomData.position,
                            rotation: roomData.rotation,
                        },
                        isNew: roomData.isNew,
                    })
                }
                delete roomData.jsonData['objectId'];
                delete roomData.jsonData['position'];
                delete roomData.jsonData['parentId'];
            });
        }

        var waterType = treeView.treeView.jstree('get_node', "waterType");
        if (waterType && waterType.children) {
            waterType.children.forEach(function (child) {
                var waterNode = treeView.getNodeById(child)
                var waterData = waterNode.original;

                /*
                 if(!roomData.jsonData.label || roomData.jsonData.label.trim().length==0){
                 roomData.jsonData.label = roomData.dataId;
                 if (roomData.description && roomData.description.trim().length > 0) {
                 roomData.jsonData.label = roomData.description;
                 }
                 }*/

                //设置漏水的type为water_leak_wire
                if (waterData.isNew) {
                    result.push({
                        id: waterData.dataId,
                        dataTypeId: waterData.dataTypeId,
                        name: waterData.dataId,
                        parentId: waterData.parentId,
                        path: waterData.jsonData.data,
                        isNew: waterData.isNew,
                        _type: 'water_leak_wire'
                    })
                } else {
                    result.push({
                        options: {
                            id: waterData.dataId,
                        },
                        value: {
                            name: waterData.name,
                            parentId: waterData.parentId,
                            path: waterData.jsonData.data
                        },
                        isNew: waterData.isNew,
                        _type: 'water_leak_wire'
                    })
                }
                delete waterData.jsonData['objectId'];
                delete waterData.jsonData['position'];
                delete waterData.jsonData['parentId'];
            });


        }
        this.forEachChildren(treeView, rootNode, function (treeView, parentNode, node) {
            var data = node.original;
            if (data.type == 'data') {
                var location = data.location || {};
                if (data.position && data.position.y == 'floor-top') {
                    location.y = 'neg_neg';
                }
                var pData = sceneEditor.jsonBox.getDataById(data.parentId);
                pBid = pData && pData.client.bid || data.parentId;
                if (data.isNew) {
                    result.push({
                        id: data.dataId,
                        dataTypeId: data.dataTypeId,
                        parentId: pBid,
                        position: data.position,
                        rotation: data.rotation,
                        location: location,
                        isNew: data.isNew,
                        name: data.dataId,
                    });
                } else {
                    result.push({
                        options: {
                            id: data.dataId,
                        },
                        value: {
                            name: data.name,
                            description: data.description,
                            parentId: data.parentId,
                            position: data.position,
                            location: location,
                            rotation: data.rotation,
                        },
                        isNew: data.isNew,
                    });
                }
            } else if (data.type == 'dataType' && data.isNewChannelType) {
                var childrenSize = { x: 1, z: 1 };
                var modelParameters = data.modelParameters;
                childrenSize.z = modelParameters.isSingle ? 1 : 2;
                childrenSize.x = modelParameters.isSingle ? modelParameters.rackNumber : modelParameters.rackNumber / 2;
                result.push({
                    id: data.dataTypeId,
                    name: data.dataId,
                    description: data.description,
                    model: 'twaver.idc.aisle',
                    modelParameters: data.modelParameters,
                    simpleModel: 'twaver.idc.simpleAisle',
                    simpleModelParameters: data.modelParameters,
                    categoryId: 'channel',
                    childrenSize: childrenSize,
                    isNew: true,
                    _type: 'datatype'
                })
            }
        });


        //处理父子关系 FIXME 不用处理父子关系
        //var map = {};
        //result.forEach(function (item) {
        //    if (!item._type || item._type == 'data') {
        //        if (item.isNew) {
        //            map[item.id] = item;
        //        } else {
        //            map[item.options.id] = item;
        //        }
        //    }
        //})
        ////
        //result.forEach(function (item) {
        //    if (!item._type || item._type == 'data') {
        //        if (item.isNew) {
        //            if (!item.position) {
        //                return;
        //            }
        //            var id = item.id;
        //            var parentId = item.parentId;
        //            var parent = map[parentId];
        //            if (!parent) {
        //                return;
        //            }
        //            var parentPosition = {x: 0, y: 0, z: 0};
        //            if (parent.isNew && parent.position) {
        //                parentPosition = parent.position;
        //            } else if (!parent.isNew && parent.value && parent.value.position) {
        //                parentPosition = parent.value.position;
        //            }
        //            item.position.x -= parentPosition.x;
        //            item.position.z -= parentPosition.z;
        //        } else {
        //            if (!item.value.position) {
        //                return;
        //            }
        //            var id = item.options.id;
        //            var parentId = item.value.parentId;
        //            var parent = map[parentId];
        //            if (!parent) {
        //                return;
        //            }
        //            var parentPosition = {x: 0, y: 0, z: 0};
        //            if (parent.isNew && parent.position) {
        //                parentPosition = parent.position;
        //            } else if (!parent.isNew && parent.value && parent.value.position) {
        //                parentPosition = parent.value.position;
        //            }
        //            item.value.position.x -= parentPosition.x;
        //            item.value.position.z -= parentPosition.z;
        //        }
        //    }
        //})
        return result;
    },

    getFloor: function (jsonObjects) {


        var floor = [];
        var i = 0;
        //找到floor对象
        for (i = 0; i < jsonObjects.length; i++) {
            var jsonObject = jsonObjects[i];
            if (this.isFloor(jsonObject)) {
                floor.push(jsonObject);
                jsonObjects.splice(i, 1);
                i--;
            }
        }
        if (floor.length == 0) {
            throw 'no floor data'
        }
        if (floor.length > 1) {
            throw 'multi floor data'
        }
        jsonObjects.splice(i, 1);

        //找到floor的孩子, 门,窗户, 内墙,柱子等
        for (i = 0; i < jsonObjects.length; i++) {
            var jsonObject = jsonObjects[i];
            if (this.isFloorChild(jsonObject)) {
                floor.push(jsonObject);
                jsonObjects.splice(i, 1);
                i--;
            }
        }
        return floor;
    },

    getRooms: function (jsonObjects) {


        var rooms = [];
        var i = 0;
        //找到room对象
        for (i = 0; i < jsonObjects.length; i++) {
            var jsonObject = jsonObjects[i];
            if (this.isRoom(jsonObject)) {
                rooms.push(jsonObject);
                jsonObjects.splice(i, 1);
                i--;
            }
        }
        return rooms;
    },

    getWaterLeak: function (jsonObjects) {
        var waters = [];
        var i = 0;
        //找到room对象
        for (i = 0; i < jsonObjects.length; i++) {
            var jsonObject = jsonObjects[i];
            if (this.isWaterLeak(jsonObject)) {
                waters.push(jsonObject);
                jsonObjects.splice(i, 1);
                i--;
            }
        }
        return waters;
    },

    getChannel: function (jsonObjects) {


        var channel = [];
        var i = 0;
        //找到room对象
        for (i = 0; i < jsonObjects.length; i++) {
            var jsonObject = jsonObjects[i];
            if (this.isChannel(jsonObject)) {
                channel.push(jsonObject);
                jsonObjects.splice(i, 1);
                i--;
            }
        }
        return channel;
    },

    getRack: function (jsonObjects) {


        var rack = [];
        var i = 0;
        //找到room对象
        for (i = 0; i < jsonObjects.length; i++) {
            var jsonObject = jsonObjects[i];
            if (this.isRack(jsonObject)) {
                rack.push(jsonObject);
                jsonObjects.splice(i, 1);
                i--;
            }
        }
        return rack;
    },

    isFloor: function (jsonObject) {

        var id = jsonObject.id;
        var category = make.Default.getOtherParameter(id, 'sdkCategory');
        return category == 'floor'
    },

    isFloorChild: function (jsonObject) {

        var id = jsonObject.id;
        var category = make.Default.getOtherParameter(id, 'sdkCategory');
        return category == 'floor-child'
    },

    isWaterLeak: function (jsonObject) {
        var id = jsonObject.id;
        var category = make.Default.getOtherParameter(id, 'sdkCategory');
        return category == 'watercable';
    },

    isRoom: function (jsonObject) {

        var id = jsonObject.id;
        var category = make.Default.getOtherParameter(id, 'sdkCategory');
        return category == 'room'
    },

    isChannel: function (jsonObject) {
        var id = jsonObject.id;
        var category = make.Default.getOtherParameter(id, 'sdkCategory');
        return category == 'channel'
    },

    /**
     * 不区分猎头柜和普通机柜
     * @param jsonObject
     * @returns {boolean}
     */
    isRack: function (jsonObject) {

        var id = jsonObject.id;
        //var category = make.Default.getOtherParameter(id, 'sdkCategory');
        var category = it.util.dataTypeMap[id].categoryId;
        return category == 'rack'
    },

    /**
     * 取得通道类型的信息
     * @param item
     * @returns {{rackWidth: (*|number|rackWidth|{name, value, type, propertyType}), rackDepth: (*|number|rackDepth|{name, value, type, propertyType}), rackNumber: (*|number|rackNumber|{name, value, type, propertyType}), isSingle: boolean, aisleDepth: (*|number|aisleDepth|{name, value, type, propertyType}), side: (*|string)}}
     */
    getChannelType: function (item) {
        item = item || {};
        var obj = make.Default.getModelDefaultParametersValues('twaver.idc.aisle.top');
        var props = {
            rackWidth: item.rackWidth || obj.rackWidth || 60,
            rackHeight: item.rackHeight || obj.rackHeight || 220,
            rackDepth: item.rackDepth || obj.rackDepth || 110,
            rackNumber: item.rackNumber || obj.rackNumber || 30,
            isSingle: !!item.isSingle,
            aisleDepth: item.aisleDepth || obj.aisleDepth || 110,
            side: item.side || 'right',
        };
        return props;
    }
})