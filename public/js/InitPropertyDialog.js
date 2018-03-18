/**
 * 属性框基本信息的配置参数说明（暂时table和统计没有通过后台配置来实现）
 * 后台输入格式：
 * [{"seq":1,"label":"AssetID","pro":"id","origin":"data"},
 *  {"seq":2,"label":"Mfg","pro":"id"},
 *  {"label":"自定义一个常量","pro":"常量ABC","origin":"这里不为data,datatype,client,category时就是常量"},
 *  {"seq":3,"label":"Location","pro":"location"}]
 * seq:暂时用不上，可以不写；
 * label:就是显示的label；
 * pro:这个是属性；
 * origin:表示pro来自于哪里，其值为：data、datatype、category、client或空
 * @param sceneManager
 * @param propertyManager
 * @constructor
 */
var $InitPropertyDialog = function (sceneManager) {
    this.sceneManager = sceneManager;
    if (!sceneManager) {
        console.log('sceneManager can not be null!');
        return;
    }
    this.dataManager = this.sceneManager.dataManager;
    this.propertyManager = new it.PropertyManager(sceneManager, $('#itv-main')[0]);
    this.translateFunction = null; // 属性特别转换扩充
    this.repeatOpen = true;
    this.init();
};

mono.extend($InitPropertyDialog, Object, {

    init: function () {
        this.assetPDFViewManager = new it.AssetPDFViewManager(this.sceneManager);
        var self = this;

        this.propertyManager.isShow = function () {
            if (typeof (dataJson.showPropertyPane) == 'boolean' && !dataJson.showPropertyPane) {
                return false;
            }
            return !(dataJson.showPropertyDialog == false);
        };

        this.propertyManager.getOffset = function (node) {
            var searchPane = $('#itv-search-panel');
            var left = parseInt(searchPane.css('width')) + parseInt(searchPane.css('left'));
            if (left <= 0) {
                var itvNavPanel = $('.itv-nav-content');
                left = parseInt(itvNavPanel.css('width')) + parseInt(itvNavPanel.css('left'));;
            }
            if (left < 0) {
                left = 0;
            } else {
                left += 1;
            }
            return { left: left || 0, bottom: 0 };
        }
        this.propertyManager.getTitleByNode = function (dataOrNode) { // 属性框的title
            var data = null;
            if (dataOrNode instanceof it.Data) {
                data = dataOrNode;
            } else if (self.sceneManager && (dataOrNode instanceof mono.Element)) {
                data = self.sceneManager.getNodeData(dataOrNode);
            }
            if (data) {
                var id = data.getId();
                return it.util.i18n("InitPropertyDialog_Asset_ID") + ':' + id;
            } else {
                return "";
            }
        };

        var callback = function (popConfigs) {
            if (popConfigs && popConfigs.length > 0) {
                var configObj = {};
                for (var i = 0; i < popConfigs.length; i++) {
                    var popConfig = popConfigs[i];
                    self.registerPropertyRuleByConfig(popConfig);
                    configObj[popConfig.id] = popConfig;
                }
            }

            var rackDataInfo = self.propertyManager.dataInfoRule['rack'];
            if (!rackDataInfo) {
                rackDataInfo = [{
                    label: it.util.i18n("InitPropertyDialog_Asset_ID"),
                    property: function (data) {
                        return data.getId();
                    }
                }, {
                    label: it.util.i18n("InitPropertyDialog_Asset_Description"),
                    property: function (data) {
                        return data.getDescription() || data.getName();
                    }
                }];
                self.propertyManager.dataInfoRule['rack'] = rackDataInfo;
            }
            if (dataJson.showRackDoc) {
                rackDataInfo.push({
                    label: it.util.i18n("InitPropertyDialog_RackDocInfo"),
                    property: function (data) {
                        return it.util.i18n("InitPropertyDialog_RackDocInfo_Detail");
                    },
                    // isButton: true,
                    classname: "link-btn",
                    onclick: function (eve, node) {
                        // console.log('11');
                        var nData = main.sceneManager.getNodeData(node);
                        if (nData) {
                            self.assetPDFViewManager.openPdf(nData.getId());
                        }
                    }
                });
            }
            self.registerPreExtendRule(configObj);
            self.registerExtendRule(configObj);
        };
        it.LoadData.loadAllPropConfig(callback);

        this.propertyManager.defaultShowIndexFunction = function (data, node, content) {
            // console.log(data, node, content);
            if (main.navBarManager.appManager.appMaps["SPACE_SEARCH"].isShow()) {
                var contentData = content.items;
                if (contentData && contentData.length >= 4) {
                    return contentData.length - 3;
                }
            }
        };

        this.propertyManager.createDefaultLinkContent = function (linkOrId) {
            return null;
        }


        // link的属性框现在不再在这里显示了，而是移到了专门显示的地方了 2017-09-20
        /*
        var createLinkContent = function(label,value,portNo, node, content) {
            if (!label || !node) {
                return null;
            }
            var dfh = this.sceneManager.viewManager3d.getDefaultEventHandler()
            content = content || {};
            content[it.util.i18n("InitPropertyDialog_Link_device")+label] = {
                value: value || '',
                classname : 'link-btn',
                style:'',
                onclick: function(e) {
                    dfh.moveCameraForLookAtNode(node);
                }
            };
            content[label + it.util.i18n("InitPropertyDialog_Port_ID")]=portNo||'';
            return content;
        };

        this.propertyManager.createDefaultLinkContent = function(linkOrId) {
            // var self = this;
            var dfh = this.sceneManager.viewManager3d.getDefaultEventHandler();
            var link = null;
            if (linkOrId instanceof it.Link) {
                link = linkOrId;
            } else if (linkOrId instanceof mono.Element) {
                link = this.sceneManager.getLinkData(linkOrId);
            } else {
                link = this.dataManager.getLinkById(linkOrId);
            }
            if (!link) {
                return null;
            }
            var fromId = link.getFromId(),
                toId = link.getToId();
            var fromNode = this.sceneManager.getNodeByDataOrId(fromId);
            var toNode = this.sceneManager.getNodeByDataOrId(toId);
            var fromDataType = this.dataManager.getDataTypeForData(fromId);
            var toDataType = this.dataManager.getDataTypeForData(toId);
            var fTypeDesc = fromDataType ? fromDataType.getDescription() : '';
            var tTypeDesc = toDataType ? toDataType.getDescription() : '';
            var content = {};
            var nodeIds = self.getLinksDataByLinkName(link.getName());
            if (nodeIds && nodeIds.length > 2) {
                var alphalMap = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
                for (var i = 0; i < nodeIds.length; i++) {
                    var nId = nodeIds[i].id;
                    var portNo = nodeIds[i].portId;
                    var node = this.sceneManager.getNodeByDataOrId(nId);
                    createLinkContent.call(self,alphalMap[i],nId,portNo,node,content);
                    // content[alphalMap[i]] = {
                    //     value: nId || '',
                    //     onclick: function(e) {
                    //         dfh.moveCameraForLookAtNode(node);
                    //     }
                    // };
                    // content[alphalMap[i] + it.util.i18n("InitPropertyDialog_Port_ID")] = link.getFromPortId();
                }
            } else {
                content[it.util.i18n("InitPropertyDialog_Line_pocket_ID")] = link.getName();
                content[it.util.i18n("InitPropertyDialog_Line_pocket_type")] = link.getType();
                content.A = {
                    value: fromId || '',
                    onclick: function(e) {
                        dfh.moveCameraForLookAtNode(fromNode);
                    }
                };
                content["A" + it.util.i18n("InitPropertyDialog_Port_ID")] = link.getFromPortId();
                content.B = {
                    value: toId || '',
                    onclick: function(e) {
                        dfh.moveCameraForLookAtNode(toNode);
                    }
                };
                content["B" + it.util.i18n("InitPropertyDialog_Port_ID")] = link.getToPortId();
                content[it.util.i18n("InitPropertyDialog_Link_device") + "1"] = {
                    style: 'height:40px',
                    value: it.util.i18n("InitPropertyDialog_Device_ID") + ":" + (fromId || '') + ' ' + it.util.i18n("InitPropertyDialog_Port_ID") + ':' + link.getFromPortId()
                };
                content[it.util.i18n("InitPropertyDialog_Link_device") + "2"] = {
                    style: 'height:40px',
                    value: it.util.i18n("InitPropertyDialog_Device_ID") + ":" + (toId || '') + ' ' + it.util.i18n("InitPropertyDialog_Port_ID") + ':' + link.getToPortId()
                };
            }

            var baseInfo = {
                title: it.util.i18n("InitPropertyDialog_Line_pocket_info"),
                properties: content,
                className: 'it-property-basic',
                onclick: function(e) {}
            };

            var labelInfo = {
                title: it.util.i18n("InitPropertyDialog_Label"),
                properties: null,
                className: 'it-property-equip',
            }
            return [baseInfo, labelInfo];
        };
        */

        this.registerOtherCategoryRuleInfo();
        this.registerRackDevAndStatic();
        this.registerChannelDevAndStatic();

    },

    /**
     * 根据name显示多条链路的情况，这里是获取多条链路的多个节点
     */
    /* //link的属性框现在不再在这里显示了，而是移到了专门显示的地方了 2017-09-20
   getLinksDataByLinkName : function(name){
       if (!name) {
           return null;
       }
       if (!name.startsWith('mul')) {
           return ;
       }
       var nodeIds = []; 
       var tempNodeIds = [];
        for(var id in this.sceneManager.dataManager._linkMap){
           var link = this.sceneManager.dataManager._linkMap[id];
           if (link && link.getName() == name) {
               if (!tempNodeIds.includes(link.getFromId())) {
                   nodeIds.push({id:link.getFromId(),portId:link.getFromPortId()});
                   tempNodeIds.push(link.getFromId());
               }
               if (!tempNodeIds.includes(link.getToId())) {
                   nodeIds.push({id:link.getToId(),portId:link.getToPortId()});
                   tempNodeIds.push(link.getToId());
               }
           }
       }
       return nodeIds;
   },
   */

    getSelfHighestAlarmsByData: function (data) {
        if (!data) {
            return null;
        }
        var alarmManager = this.sceneManager.getAlarmManager();
        var state = data.getAlarmState();
        var alarms = alarmManager.getAlarmsByDataOrId(data);
        var highestAlarmSeverity = state.getSelfHighestAlarmSeverity();
        var highestAlarms = [];
        if (highestAlarmSeverity && alarms && alarms.size() > 0) {
            for (var i = 0; i < alarms.size(); i++) {
                var alarm = alarms.get(i);
                if (it.AlarmSeverity.compare(alarm.getAlarmSeverity(), highestAlarmSeverity) >= 0) {
                    highestAlarms.push(alarm);
                }
            }
        }
        return highestAlarms;
    },

    getGetMethod: function (key) {
        var getMethod = 'get' + key.charAt(0).toUpperCase() + key.slice(1);
        return getMethod;
    },

    /**
     * 根据该对象的属性来获取该对象的该属性所对应的值
     * @param obj
     * @param pro
     * @param data{it.Data,it.DataType或it.Category}
     * @returns {*}
     */
    getValueByPro: function (obj, pro, data) {
        if (this.translateFunction) {
            return this.translateFunction(obj, pro, data);
        }
        if (!obj || !pro) return null;
        var getMethod = this.getGetMethod(pro);
        if (obj instanceof it.Data && pro.toLowerCase() == 'location') {
            var category = this.sceneManager.dataManager.getCategoryForData(data);
            if (category && category.getId().toLowerCase().indexOf('rack') >= 0) {
                var location = obj.getLocation();
                return location.z + it.util.i18n("InitPropertyDialog_Column") + location.x + it.util.i18n("InitPropertyDialog_Num");
            }
        }
        if (obj[getMethod]) {
            return obj[getMethod]();
        } else {
            return obj[pro]
        }
    },

    createColumn: function (col) {
        if (!col) {
            return null;
        }
        var self = this;
        var dm = this.sceneManager.dataManager;
        var column = {
            label: col.label,
            origin: col.origin,
            property: function (data) { //可以是内置函数，参数是data
                var origin = col.origin;
                if (origin && origin.toLowerCase() == 'datatype') {
                    var dataType = dm.getDataTypeForData(data);
                    return self.getValueByPro(dataType, col.pro, dataType);
                } else if (origin && origin.toLowerCase() == 'category') {
                    var category = dm.getCategoryForData(data);
                    return self.getValueByPro(category, col.pro, category);
                } else if (origin && origin.toLowerCase() == 'client') {
                    var userObj = data._userDataMap;
                    return self.getValueByPro(userObj, col.pro, data);
                } else if (origin && origin.toLowerCase() == "data") {
                    return self.getValueByPro(data, col.pro, data);
                } else if (origin && origin.toLowerCase() == "businesstype") {
                    var businessType = dm.getBusinessTypeForData(data);
                    return self.getValueByPro(businessType, col.pro, businessType);
                } else { //这种情况就认为是常量
                    return col.pro;
                }
            },
            isButton: function (data) {
                // if (col.url && col.url.startsWith('http')) {
                //     return true;
                // }
            },
            style: col.style,
            classname: col.classname,
            onclick: function (e, n) {
                //if (col.url && col.url.startsWith('http')) {
                //    var url = col.url;
                //    // if (url.indexOf('?')>0) {
                //    //     url += '&id='+data.getId();
                //    // }else{
                //    //     url += '?id='+data.getId();
                //    // }
                //    window.open(url);
                //}
                if (!col.url) {
                    return;
                }
                var url = col.url || '';
                if (!n) {
                    window.open(url, 'cusTab');
                    return;
                }
                var d = main.sceneManager.getNodeData(n);
                if (!d) {
                    window.open(url, 'cusTab');
                    return;
                }
                url = it.util.format(url, d);
                window.open(url, 'cusTab');
            }
        };
        return column;
    },

    registerPropertyRuleByConfig: function (popConfig) {
        if (!popConfig || !popConfig.id) {
            return;
        }
        var category = popConfig.id;
        var pros = popConfig.props;
        var result = pros;
        if (typeof (pros) == 'string') {
            result = JSON.parse(pros);
        }
        var columns = [];
        var self = this;
        if (result && result instanceof Array) {
            for (var i = 0; i < result.length; i++) {
                var column = self.createColumn(result[i]);
                if (column) {
                    columns.push(column);
                }
            }
        }
        this.propertyManager.dataInfoRule[category] = columns;
    },

    getPropertyManager: function () {
        return this.propertyManager;
    },

    /**
     * 注册属性框中机柜的设备列表的信息和统计信息
     */
    registerRackDevAndStatic: function () {
        var self = this;
        var dm = this.sceneManager.dataManager;
        var devTable = [{
            header: it.util.i18n("InitPropertyDialog_Device_ID"),
            width: '5',
            property: function (childData) {
                return childData.getId();
            }
        },
        {
            header: it.util.i18n("InitPropertyDialog_Model"),
            width: 3,
            property: function (childData) {
                var dataType = dm.getDataTypeForData(childData);
                if (dataType && dataType.getDescription()) {
                    return dataType.getDescription();
                }
                if (dataType && dataType.getModel()) {
                    return dataType.getModel();
                }
            }
        },
        {
            header: it.util.i18n("InitPropertyDialog_Position"),
            width: 4,
            property: function (childData) {
                var location = '';
                var dataType = dm.getDataTypeForData(childData);
                var sizeU = 1;
                if (dataType &&
                    dataType.getSize() &&
                    dataType.getSize().ySize) {
                    sizeU = dataType.getSize().ySize;
                }
                if (childData.getLocation() &&
                    childData.getLocation().y) {
                    location = childData.getLocation().y + 'U-' + (parseInt(childData.getLocation().y) + parseInt(sizeU - 1)) + 'U(' + sizeU + 'U)';
                }
                return location;
            }
        }
        ];
        this.propertyManager.devTableRule['rack'] = devTable;
        var statInfo = {
            value: function (data) {
                var spManager = new it.SpaceManager(self.sceneManager.dataManager, self.sceneManager);
                var spObj = spManager.computeSpace(data);
                var emp_obj = {};
                if (spObj && spObj instanceof it.Space1) {
                    var empty_space_list = []; //['1U-2U(2U)','3U-5U(3U)','10U-12U(2U)'];
                    if (spObj._emptyList && spObj._emptyList.length > 0) {
                        for (var i = 0; i < spObj._emptyList.length; i++) {
                            var empObj = spObj._emptyList[i];
                            empty_space_list.push(empObj.start + 'U-' + empObj.end + 'U(' + empObj.total + 'U)');
                        }
                    }
                    emp_obj[it.util.i18n("InitPropertyDialog_U_used")] = spObj._occupation + 'U';
                    emp_obj[it.util.i18n("InitPropertyDialog_U_left")] = (spObj._total - spObj._occupation) + 'U';
                    emp_obj[it.util.i18n("InitPropertyDialog_Spare_list")] = empty_space_list;

                }

                var dataType = self.sceneManager.dataManager.getDataTypeForData(data);
                var powerRating = parseFloat(dataType.getPowerRating());
                var weightRating = parseFloat(dataType.getWeightRating());
                if (powerRating && weightRating) {
                    var usedPowerRating = 0;
                    var usedWeight = 0;
                    var children = data.getChildren();
                    if (children && children.size() > 0) {
                        for (var i = 0; i < children.size(); i++) {
                            var child = children.get(i);
                            var cType = self.sceneManager.dataManager.getDataTypeForData(child);
                            var cPowerRating = parseFloat(cType.getPowerRating() || 0);
                            usedPowerRating = usedPowerRating + cPowerRating;
                            usedWeight = usedWeight + parseFloat(child.getWeight() || 0);
                        }
                    }
                    var restPowerRating = parseFloat(powerRating - usedPowerRating);
                    if (restPowerRating < 0) {
                        restPowerRating = 0;
                    }
                    var restWeightRating = parseFloat(weightRating - usedWeight);
                    if (restWeightRating < 0) {
                        restWeightRating = 0;
                    }
                    emp_obj[it.util.i18n("InitPropertyDialog_Power_used")] = usedPowerRating + 'W';
                    emp_obj[it.util.i18n("InitPropertyDialog_Power_left")] = restPowerRating + 'W';
                    emp_obj[it.util.i18n("InitPropertyDialog_Weight_used")] = usedWeight + 'KG';
                    emp_obj[it.util.i18n("InitPropertyDialog_Weight_left")] = restWeightRating + 'KG';
                }

                return emp_obj;

            }
        };
        this.propertyManager.statInfoRule['rack'] = statInfo;
    },

    /**
     * 注册通道的设备列表和统计
     */
    registerChannelDevAndStatic: function () {
        var self = this;
        var dm = this.sceneManager.dataManager;
        var spManager = new it.SpaceManager(this.sceneManager.dataManager, this.sceneManager);
        var devTable = [];
        var col1 = {
            header: it.util.i18n("InitPropertyDialog_ID"),
            width: '6',
            property: function (childData) {
                return childData.getId();
            }
        };
        devTable.push(col1);
        var col2 = {
            header: it.util.i18n("InitPropertyDialog_All"),
            width: '2',
            property: function (childData) {
                var spObj = spManager.computeSpace(childData);
                if (spObj && spObj instanceof it.Space1) {
                    return spObj._total + 'U';
                }
                return '0U';
            }
        };
        devTable.push(col2);
        var col3 = {
            header: it.util.i18n("InitPropertyDialog_Used"),
            width: '2',
            property: function (childData) {
                var spObj = spManager.computeSpace(childData);
                if (spObj && spObj instanceof it.Space1) {
                    return spObj._occupation + 'U';
                }
                return '0U';
            }
        };
        devTable.push(col3);
        var col4 = {
            header: it.util.i18n("InitPropertyDialog_UnUsed"),
            width: '2',
            property: function (childData) {
                var spObj = spManager.computeSpace(childData);
                if (spObj && spObj instanceof it.Space1) {
                    return (spObj._total - spObj._occupation) + 'U';
                }
                return '0U';
            }
        };
        devTable.push(col4);
        this.propertyManager.devTableRule['channel'] = devTable;

        //鼠标划过“设备列表”时的动作，这个mouseoverDevFunction是全局的哦
        this.propertyManager.mouseoverDevFunction = function (child) {
            if (child) {
                var childCategory = dm.getCategoryForData(child);
                if (childCategory && childCategory.getId().toLowerCase().indexOf('rack') >= 0) {
                    var childNode = this.sceneManager.getNodeByDataOrId(child);
                    if (childNode) {
                        this.sceneManager.network3d.getDataBox().getSelectionModel().clearSelection();
                        childNode.setSelected(true);
                    }
                }
            }
        }

        var statInfo = {
            value: function (data) {
                if (!data) {
                    return null;
                }
                var children = data.getChildren();
                var totalRack = 0;
                var totalHeaderRack = 0;
                var totalSpace = 0;
                var usedSpace = 0;
                var unUsedSpace = 0;
                var fullRack = 0;
                var channelType = dm.getDataTypeForData(data);
                if (!channelType) return null;
                var childrenSize = channelType.getChildrenSize();
                if (childrenSize) {
                    fullRack = parseInt(childrenSize.zSize) * parseInt(childrenSize.xSize);
                }
                if (children && children.size() > 0) {
                    for (var i = 0; i < children.size(); i++) {
                        var child = children.get(i);
                        if (child) {
                            var category = dm.getCategoryForData(child);
                            if (category && category.getId().toLowerCase() == 'rack') {
                                totalRack++;
                                var childType = dm.getDataTypeForData(child);
                                //                                var childSize = childType.getChildrenSize();
                                //                                if(childSize){
                                //                                    totalSpace = totalSpace + parseInt(childSize.ySize);
                                //                                }
                                var spObj = spManager.computeSpace(child);
                                if (spObj && spObj instanceof it.Space1) {
                                    usedSpace = usedSpace + spObj._occupation;
                                    totalSpace = totalSpace + spObj._total;
                                    var unUsed = spObj._total - spObj._occupation;
                                    if (unUsed > 0) {
                                        unUsedSpace = unUsedSpace + unUsed;
                                    }
                                }
                            } else if (category && category.getId().toLowerCase() == 'headerrack') {
                                totalHeaderRack++;
                            }

                        }
                    }
                }
                var emp_obj = {};
                emp_obj[it.util.i18n("InitPropertyDialog_Rack_Num")] = totalRack + it.util.i18n("InitPropertyDialog_Unit");
                emp_obj[it.util.i18n("InitPropertyDialog_All_space")] = totalSpace + 'U';
                emp_obj[it.util.i18n("InitPropertyDialog_Space_used")] = usedSpace + 'U';
                emp_obj[it.util.i18n("InitPropertyDialog_Space_left")] = unUsedSpace + 'U';
                emp_obj[it.util.i18n("InitPropertyDialog_Header_rack")] = totalHeaderRack + it.util.i18n("InitPropertyDialog_Unit");
                emp_obj[it.util.i18n("InitPropertyDialog_Full_rack")] = fullRack + it.util.i18n("InitPropertyDialog_Unit");
                return emp_obj;
                //                }
            }
        };
        this.propertyManager.statInfoRule['channel'] = statInfo;

    },

    registerOtherCategoryRuleInfo: function () {
        var self = this;
        this.propertyManager.nodeDefaultInfoFunction = function (node) {
            var data = self.sceneManager.getNodeData(node);
            var dataType = self.sceneManager.dataManager.getDataTypeForData(data);
            if (dataType && dataType.getCategoryId()) {
                var dtc = dataType.getCategoryId().toLowerCase();
                if ((dtc.indexOf('datacenter') >= 0 ||
                    dtc.indexOf('building') >= 0 ||
                    dtc.indexOf('earth') >= 0 ||
                    dtc.indexOf('floor') >= 0)
                    && !self.propertyManager.dataInfoRule[dataType.getCategoryId()]) { //不管是啥类型，只要在数据库里配了一定显示
                    return null;
                }
            }
            if (!dataType ||
                !dataType.getCategoryId() ||
                !self.propertyManager.dataInfoRule[dataType.getCategoryId()]) {
                var ass_id = it.util.i18n("InitPropertyDialog_Asset_ID");
                var ass_des = it.util.i18n("InitPropertyDialog_Asset_Description");
                var returnResult = {};
                returnResult[ass_id] = data.getId();
                returnResult[ass_des] = data.getDescription() || data.getName()
                return returnResult;
            }
            return null;
        };
    },

    createAlarmTabByNode: function (node, popConfig) {
        var data = this.sceneManager.getNodeData(node);
        if (!data) {
            return;
        }
        var category = this.sceneManager.dataManager.getCategoryForData(data);
        if (category) {
            var cid = category.getId().toLowerCase();
            if (cid.indexOf('floor') >= 0 ||
                cid.indexOf('earth') >= 0 ||
                cid.indexOf('building') >= 0) {
                return;
            }
        };
        var alarmManager = this.sceneManager.getAlarmManager();
        var alarmState = data.getAlarmState();
        if (!alarmState ||
            alarmState.getAlarmCount() < 1) {
            return;
        }
        var values = {
            // 总告警数:alarmState.getAlarmCount(),
            // 传播告警数:alarmState.getPropagateAlarmCount(),
            // 最高传播告警级别:alarmState.getPropagateHighestAlarmSeverity().name
            // 自身告警数:alarmState.getSelfAlarmCount();
            // 自身最高告警级别:alarmState.getSelfHighestAlarmSeverity()
        };
        if (alarmState.getPropagateAlarmCount() > 0 && alarmState.getSelfAlarmCount() > 0) {
            values[it.util.i18n("InitPropertyDialog_All_alarms")] = alarmState.getAlarmCount();
        }
        if (alarmState.getPropagateAlarmCount() > 0) {
            values[it.util.i18n("InitPropertyDialog_Trans_alarms")] = {
                isTitle: true
            };
            values[it.util.i18n("InitPropertyDialog_Alarms_count")] = alarmState.getPropagateAlarmCount();
            var alarmSeverity = alarmState.getPropagateHighestAlarmSeverity();
            values[it.util.i18n("InitPropertyDialog_Alarm_level")] = alarmSeverity.displayName || alarmSeverity.name;
        }
        if (alarmState.getSelfAlarmCount() > 0) {
            values[it.util.i18n("InitPropertyDialog_Self_alarm")] = {
                isTitle: true
            };
            values[it.util.i18n("InitPropertyDialog_Alarm_count")] = alarmState.getSelfAlarmCount();
            var hAlarms = this.getSelfHighestAlarmsByData(data);
            if (hAlarms && hAlarms.length > 0) {
                var alarm = hAlarms[0];
                var alarmType = alarmManager.getAlarmTypeByAlarm(alarm);
                var alSeverity = alarm._alarmSeverity; //it.AlarmSeverity.getByValue(alarm.getLevel());
                values[it.util.i18n("InitPropertyDialog_Highest_alarm")] = alSeverity ? (alSeverity.displayName || alSeverity.name) : '';
                if (alarmType) {
                    values[it.util.i18n("InitPropertyDialog_Alarm_type")] = alarmType.getName() ? alarmType.getName() : alarmType.getDescription();
                }
                values[it.util.i18n("InitPropertyDialog_Alarm_description")] = alarm.getDescription() || (alarmType ? alarmType.getDescription() : "");
                values[it.util.i18n("InitPropertyDialog_Alarm_time")] = it.Util.formateDateTime(alarm.getDateTime());
                if (!dataJson.alarmPropertyNotShowMore) {
                    values[it.util.i18n("InitPropertyDialog_Detail")] = {
                        value: it.util.i18n("InitPropertyDialog_More"),
                        // data:data,
                        // alarm:alarm,
                        isButton: true,
                        onclick: function (e) {
                            // e.stopPropagation();
                            // main.navBarManager.appManager.clientAlarmManager.alarmTable.showAlarmDetail(alarm,data);
                            main.navBarManager.appManager.showCurrentAlarm();
                            var alarmTable = main.navBarManager.appManager.clientAlarmManager.alarmTable;
                            alarmTable.showTablePane();
                            alarmTable.$filter.find('input').val(data.getId());
                            alarmTable.setVisibleCategory('');
                            setTimeout(function () {
                                main.navBarManager.appManager.showCurrentAlarm();
                            }, 500);
                        }
                    };
                }

                values[it.util.i18n("InitPropertyDialog_History_Alarm")] = {
                    value: it.util.i18n("InitPropertyDialog_Detail"),
                    isButton: true,
                    onclick: function (e) {
                        main.navBarManager.appManager.showHistoryAlarmDialog();
                        // main.navBarManager.appManager.showAlarmLog();
                    }
                };
            }
        }
        return {
            title: it.util.i18n("InitPropertyDialog_Alarm_statistic"),
            properties: values,
            onclick: null,
            className: 'it-property-chart',
        }
    },

    createCusTabByNode: function (node, popConfig) {
        var data = this.sceneManager.getNodeData(node);
        var dataType = this.sceneManager.dataManager.getDataTypeForData(data);
        if (dataType && dataType.getCategoryId()) {
            var dtc = dataType.getCategoryId().toLowerCase();
            if (dtc.indexOf('datacenter') >= 0 || dtc.indexOf('building') >= 0 ||
                dtc.indexOf('earth') >= 0 || dtc.indexOf('floor') >= 0) {
                return null;
            }
        }
        var self = this;
        // var url = 'http://www.baidu.com';
        if (popConfig && popConfig[dataType.getCategoryId()] && popConfig[dataType.getCategoryId()].url) {
            url = popConfig[dataType.getCategoryId()].url;
            return {
                title: it.util.i18n("InitPropertyDialog_Extend"),
                // onclick : function(){
                //     console.log('扩展');
                // },
                properties: {
                    isIframe: true,
                    src: function (node) {
                        // return data.src;
                        var nodeData = self.sceneManager.getNodeData(node);
                        return url + '?id=' + nodeData.getId(); //(nodeData?nodeData.getId():'');
                    }
                    // src:'https://www.baidu.com',
                },
                className: 'it-property-custom'
            };
        }
    },

    registerPreExtendRule: function (popConfig) {
        //扩展的，可以返回一个数组，也可以返回对象，这里是为了将告警的统计加上去，
        //注意：若是不处理node的话，则返回undefined，否则若是有其他的扩展将显示不出来
        var self = this;
        this.propertyManager.getPreExtInfoFunction = function (node) {
            var preExtTabs = [];
            var alarmTabInfo = self.createAlarmTabByNode(node, popConfig);
            if (alarmTabInfo) {
                preExtTabs.push(alarmTabInfo);
            }
            var cusTab = self.createCusTabByNode(node, popConfig);
            if (cusTab) {
                preExtTabs.push(cusTab);
            }
            return preExtTabs;
        }
    },

    registerExtendRule: function (popConfig) {
        this.propertyManager.otherInfoRule['rack'] = //若是返回数组的话，则可以扩展多个
            [{
                title: it.util.i18n("InitPropertyDialog_Device_on"),
                onclick: function () {
                    // $('#deviceon').click();
                    var appManager = main.navBarManager.appManager;
                    var app = appManager.appMaps["DEVON"];
                    if (!app.isInit) {
                        app.setup();
                    }
                    app.doShow();
                    appManager.itvToggleBtn.show();

                },
                className: 'it-property-deviceon'
            },
            {
                title: it.util.i18n("InitPropertyDialog_Device_off"),
                onclick: function () {
                    // $('#deviceon').click();
                    var appManager = main.navBarManager.appManager;
                    var app = appManager.appMaps["DEVOFF"];
                    if (!app.isInit) {
                        app.setup();
                    }
                    app.doShow();
                    appManager.itvToggleBtn.show();

                },
                className: 'it-property-deviceoff'
            },
            // {
            //     title:'时实数据',
            //     onclick:function(e){
            //         var lookAtNode = main.sceneManager.viewManager3d.getFocusNode();
            //         var lookAtData = main.sceneManager.getNodeData(lookAtNode);
            //         main.nodeEventHander.showRealTimeDialog(lookAtData);
            //     },
            //     className:'it-property-realtime'
            // },
            {
                title: it.util.i18n("InitPropertyDialog_link"),
                isShow: function (node) {
                    var data = main.sceneManager.getNodeData(node);
                    if (!data) {
                        return false;
                    }
                    var links = data.getAllLinks();
                    if (!links) {
                        return false;
                    }
                    var toLinks = [];
                    for (var id in links) {
                        var link = links[id];
                        if (link && link.getToId() == data.getId()) {
                            toLinks.push(link);
                        }
                    }
                    if (toLinks.length < 1) {
                        return false;
                    }
                    return true;
                },
                onclick: function (e) {
                    var lookAtNode = main.sceneManager.viewManager3d.getFocusNode();
                    var lookAtData = main.sceneManager.getNodeData(lookAtNode);
                    main.sceneManager.gcsManager.showMulLinkByData(lookAtData, true);
                },
                className: 'it-property-link'
            },
            {
                title: it.util.i18n("InitPropertyDialog_Rotate"),
                onclick: function (e) {
                    var lookAtNode = main.sceneManager.viewManager3d.getFocusNode();
                    main.sceneManager.viewManager3d.defaultEventHandler.rotateElement(lookAtNode);
                },
                className: 'it-property-rotate'
            },
            ];

        this.propertyManager.otherInfoRule['equipment'] = //若是返回数组的话，则可以扩展多个
            [{
                title: it.util.i18n("InitPropertyDialog_Port_status"),
                onclick: function (e) {
                    var lookAtNode = main.sceneManager.viewManager3d.getFocusNode();
                    var data = main.sceneManager.getNodeData(lookAtNode);
                    main.portStatusManager.showPortsStatusByParentId(data.getId());
                },
                className: 'it-property-equip'
            },
            {
                title: it.util.i18n("InitPropertyDialog_Data_control"),
                className: 'it-property-realtime',
                onclick: function (e) {
                    if (self.repeatOpen) {
                        var lookAtNode = main.sceneManager.viewManager3d.getFocusNode();
                        var data = main.sceneManager.getNodeData(lookAtNode);
                        self.showRealTimeDialog(data);
                        $('.it-property-realtime').css('backgroundImage', 'url(././css/images/realtime_hover.jpg)');
                    }
                }
            },
            {
                title: it.util.i18n("InitPropertyDialog_link"),
                isShow: function (node) {
                    var data = main.sceneManager.getNodeData(node);
                    if (!data) {
                        return false;
                    }
                    var links = data.getAllLinks();
                    if (!links) {
                        return false;
                    }
                    var toLinks = [];
                    for (var id in links) {
                        var link = links[id];
                        if (link && link.getToId() == data.getId()) {
                            toLinks.push(link);
                        }
                    }
                    if (toLinks.length < 1) {
                        return false;
                    }
                    return true;
                },
                onclick: function (e) {
                    var lookAtNode = main.sceneManager.viewManager3d.getFocusNode();
                    var lookAtData = main.sceneManager.getNodeData(lookAtNode);
                    main.sceneManager.gcsManager.showMulLinkByData(lookAtData, true);
                },
                className: 'it-property-link'
            },
            {
                title: it.util.i18n("InitPropertyDialog_Rotate"),
                onclick: function (e) {
                    var lookAtNode = main.sceneManager.viewManager3d.getFocusNode();
                    main.sceneManager.viewManager3d.defaultEventHandler.rotateElement(lookAtNode);
                },
                className: 'it-property-rotate'
            },
            ];

        var self = this;
        this.propertyManager.getExtInfoFunction = function (node) {
            var extTabs = [];
            // var cusTab = self.createCusTabByNode(node,popConfig);
            // if (cusTab) {
            //     extTabs.push(cusTab);
            // }
            return extTabs;
        }
    },
    showRealTimeDialog: function (data) {
        var self = this;
        if (!data) {
            console.log('data is null');
            return
        }
        var id = data.getId();
        var realtimeUrl = null;
        if (dataJson.realtimeUrl) {
            realtimeUrl = dataJson.realtimeUrl;
            if (id) {
                realtimeUrl += '?id=' + id;
            }
        }
        if (realtimeUrl && dataJson.layerOpen) {
            dataJson.layerOpen(realtimeUrl);
            return;
        }


        //if (!main.monitorManager.checkToShow(id)) return;
        if (!main.RealtimeDynamicEnviroManager.hasRelation(id)) return;

        var realtimeUrl = null;
        if (dataJson.realtimeUrl) {
            realtimeUrl = dataJson.realtimeUrl;
            if (id) {
                realtimeUrl += '?id=' + id;
            }
        }

        if (realtimeUrl) {
            layer.open({
                type: 2,
                title: it.util.i18n("Monitor_Real_time_data"),
                shadeClose: true,
                shade: false,
                maxmin: true, //开启最大化最小化按钮
                area: ['893px', '600px'],
                content: realtimeUrl
            });
        } else {
            it.ViewTemplateManager.showView(id, function (view) {
                self.repeatOpen = false;
                view = view.getView();
                var $content = $('#realTimeContent');
                if (!$content.length) {
                    $content = $('<div id="realTimeContent"></div>');
                    $(document.body).append($content);
                }
                $content.empty();
                $content.append(view);
                layer.open({
                    shade: 0,
                    type: 1,
                    title: it.util.i18n("Monitor_Real_time_data"),
                    shade: false,
                    maxmin: true, //允许全屏最小化
                    skin: 'layui-layer-rim', //加上边框 layui-layer-rim
                    content: $content,
                    success: function (layero, index) {
                        var $layero = $(layero)
                        $layero.css({
                            minWidth: '400px',
                            minHeigth: '200px',
                            left: (parseInt($layero.css('left')) - 200) + 'px',
                            top: (parseInt($layero.css('top')) - 100) + 'px'
                        });
                    },
                    end: function () {
                        self.repeatOpen = true;
                        it.ViewTemplateManager.hideView(data.getId());
                        $('.it-property-realtime').css('backgroundImage', 'url(././css/images/realtime.jpg)');
                    }
                });
            });
        }

    },
});

it.InitPropertyDialog = $InitPropertyDialog;