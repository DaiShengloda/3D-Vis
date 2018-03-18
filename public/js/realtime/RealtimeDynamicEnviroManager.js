
/**
 * 温湿度采集
 *
 * 查出所有的业务关系(collector——businessObj)，包装好发送要数据的请求
 *
 *  collector是对应businessObj中的某个属性
 *  一个collector可以对应多个businessObj
 *  一个businessObj的同一个属性可以对应多个collector
 *
 *  应该是collector的某个属性对应businessObj中的某个属性
 *
 * 然后返回了一堆数据(bid:{属性列})，然而我们需要反推找到该bid的每个属性都对应着哪些个collector，随后更新collector中的相关的值
 *
 */

var $RealtimeDynamicEnviroManager = function(dataManager){
    this.dataManager = dataManager;
    this.businessObjs = {};
    this.relations = {};
    this.BPCMap = {}; //businessObj的属性对应的collectors {001$p001:[collector001$value,c002$pro02]}
    this._bidToAssetId = {};
    this._bidToCollectorId = {};
    this._bidToWaterLeakWireId = {};
    // this._idToProp = {};
    this.init();
};


mono.extend($RealtimeDynamicEnviroManager,Object,{
    // 当查看温度的时候订阅温度的数据，取消的时候删除温度的订阅
    // 当查看湿度的时候订阅湿度的数据，取消的时候删除湿度的订阅
    init : function(){
        var self = this;
        var socket = this._socket = ServerUtil.createSocket();

//         socket.on('data', function(data){
//            // console.log('come in data');
//            // console.log(data);
// //            {"001":{"温度":"54.261218348560504","extend":{"temp":"54.261218348560504"}},"t02":{"温度":"54.261218348560504","extend":{"temp":"54.261218348560504"}}}
//             console.log(JSON.stringify(data));
//             if(data){
//                 for(var bid in data){
//                     var bObj = data[bid];
//                     if(bObj){
//                         for(var bop in bObj){
//                             var collectors = self.BPCMap[bid+'$'+bop];
//                             if(collectors && collectors.length > 0){
//                                 for(var i = 0 ; i < collectors.length ; i++){
//                                     var col_p = collectors[i];
//                                     if(col_p){
//                                         var cId = col_p;
//                                         var cPro = "";
//                                         var index = col_p.indexOf('$');
//                                         if(index >0){
//                                             cId = col_p.substring(0,index);
//                                             cPro = col_p.substring(index+1);
//                                         }
//                                         var collector = self.dataManager.getCollectorById(cId);
//                                         if(collector){
//                                             var setMethod = self.getSetMethod(cPro);
//                                             if(bObj[setMethod]){
//                                                 bObj[setMethod](bObj[bop]);
//                                             }else {
//                                                 collector.setValue(parseFloat(bObj[bop]));
//                                             }
//                                         }
//                                     }
//                                 }
//                             }
//                         }
//                     }
//                 }
//             }
//         });


//         var callback = function(relations, relsWithAsset){
//             if(!relations || relations.length < 1){
//                 return;
//             }
//             var data = {};
//             relations.forEach(function(relation){
//                 if(relation){
//                     self.relations[relation.id] = relation;
//                     var bus = relation.relations;
//                     // if(typeof bus =='string'){
//                     //     try{
//                     //          bus = JSON.parse(bus);
//                     //      }catch(error){
//                     //          console.error(error);
//                     //          bus = undefined;
//                     //      }
//                     // }
//                     if(bus && bus.length > 0){
//                         for(var i = 0 ; i < bus.length ; i++){
//                             var obj = bus[i];
//                             if(obj && obj.bid && obj.property){
//                                 if(!data[obj.bid]){
//                                     data[obj.bid] = [obj.property];
//                                 }else if(!data[obj.bid].includes(obj.property)){ //同一个业务，但是是另一个属性
//                                     data[obj.bid].push(obj.property);
//                                 }
//                                 var cs = self.BPCMap[obj.bid+'$'+obj.property];
//                                 var cpro = relation.id;
//                                 if(relation['c_property']){
//                                     cpro += '$' + relation['c_property'];
//                                 }
//                                 if(cs){
//                                     cs.push(cpro);
//                                 }else{
//                                     self.BPCMap[obj.bid+'$'+obj.property] = [cpro];
//                                 }
//                             }
//                         }
//                     }
//                 }
//             });
//             self._thMonitorData = data;
//             // self.handleRelation(relsWithAsset, data);
//             socket.emit('monitorData', {type:'dynamic',data:data});
//         };
//        socket.emit('monitorData', {type:'dynamic',data:{'001':['温度'],'t02':['温度']}});
        this.findAllRelations();

        // 同步关联关系, 但是这里存在一个潜在的bug，推送的数据并没有获取到collector和waterLeakWire的信息，后端应该获取并推送
        
        socket.on('relation', function(param){
            var relation = param.result;
            if(param.method == 'add') {
                // var relations = relation.relations;
                // if(relations && typeof relations =='string'){
                //     try{
                //         relations = JSON.parse(relations);
                //     }catch(error){
                //         console.log(relations);
                //         console.error(error);
                //         relations = undefined;
                //     }
                //     relation.relations = relations;
                // }
                // self._assetRelation[relation.id] = relation;
                self.handleRelationCache(relation);
            } else if(param.method == 'update') {
                // var relations = relation.relations;
                // if(relations && typeof relations =='string'){
                //     try{
                //         relations = JSON.parse(relations);
                //     }catch(error){
                //         console.log(relations);
                //         console.error(error);
                //         relations = undefined;
                //     }
                //     relation.relations = relations;
                // }
                // self._assetRelation[relation.id] = relation;
                self.handleRelationCache(relation);                
            }else if(param.method == 'remove') {
                delete self._assetRelation[relation.id];
            }
            
        });

        // 数据格式：
        // {'bid':{'prop':'value',extend:{扩展对象}}}
        socket.on('data', function(data){
            if(!data || !Object.keys(data).length)return;
            data = self.handleAllRadixPoint(data);
            if(self._byCategory){
                it.ViewTemplateManager.updateView('', data);
                return;
            }
            $.each(data, function(bid, props) {
                if(!props || !Object.keys(props).length)return;
                var Ids;
                // if(Ids = self._bidToAssetId[bid]){
                if(self._monitorAsset){
                    self.handleAssetResult(bid, Ids, props);
                }
                // if(Ids = self._bidToCollectorId[bid]){
                if(self._monitorCollector){
                    self.handleCollectorResult(bid, Ids, props);
                }
                // if(Ids = self._bidToWaterLeakWireId[bid]){
                if(self._monitorWaterLeakWire){
                    self.handleWaterLeakWireResult(bid, Ids, props);
                }
                if(!Ids)return;
            });
            
        });
    },

    

    handleWaterLeakWireResult: function(bid, collectorIds, props){
        var is = it.util.is, self = this,
            // app = main.navBarManager.appManager.appMaps['WATERLEAK'].app;
            app = main.panelMgr.instanceMap["NavBarMgr"].appManager.appMaps["WATERLEAK"].app;

        // app && app.setValue(bid, parseFloat(props[Object.keys(props)[0]]));
        app && app.setData(bid, props);
        
        return;
        $.each(collectorIds, function(index, wlwId) {
            var relations = self._waterLeakWireRelation[wlwId].relations;
            if(relations && is(relations,'Array')){
                // {id: 'waterLeakId', relations:[{bid:'bid', property:'property'}]}
                // 第三种，包含多个bid对象，每个bid对象按照第二种规则匹配，最终更新给ViewTemplate整个集合数据
                $.each(relations, function(index, relation) {
                    if(relation.bid === bid){
                        app && app.setValue(wlwId,parseFloat(props[relation.property]));
                    }
                });
            } else if(relations && is(relations,'Object')){
                // {id: 'waterLeakId', relations:{bid:'bid', property:'property'}}
                if(relations.bid === bid){
                    it.WaterLeakManager.setValue(wlwId,parseFloat(props[relations.property]));
                }
            }
        });
    },

    handleCollectorResult: function(bid, collectorIds, props){
        var collectorData = {}, is = it.util.is, self = this;
        var collector = self.dataManager.getCollectorById(bid);
        if(collector){
            collector.setData(props);
            // if (is(props,'Object') && Object.keys(props).length==1) {
            //     collector.setValue(parseFloat(props[Object.keys(props)[0]]));
            // } else {
            //     collector.setData(props);
            // }
        }
        return;
        
        $.each(collectorIds, function(index, collectorId) {
            // var relations = self.relations[collectorId].relations;
            var collector = self.dataManager.getCollectorById(collectorId);
            if (is(props,'Object')) {
                collector.setData(props);
            }

            var relations = self._collectorRelation[collectorId].relations;
            if(relations && is(relations,'Array')){
                // {id: 'collectorId', relations:[{bid:'bid', property:'property'}]}
                // 第三种，包含多个bid对象，每个bid对象按照第二种规则匹配，最终更新给ViewTemplate整个集合数据
                $.each(relations, function(index, relation) {
                    if(relation.bid === bid){
                        var collector = self.dataManager.getCollectorById(collectorId);
                        if(collector){
                            collector.setValue(parseFloat(props[relation.property]));
                        }
                    }
                });
            } else if(relations && is(relations,'Object')){
                // {id: 'waterLeakId', relations:{bid:'bid', property:'property'}}
                if(relations.bid === bid){
                    var collector = self.dataManager.getCollectorById(collectorId);
                    if(collector){
                        collector.setValue(parseFloat(props[relations.property]));
                    }
                }
            }
        });
    },
    handleAssetResult: function(bid, assetIds, props){
        it.ViewTemplateManager.updateView(bid, props);
        return;
        var assetData = {}, is = it.util.is, self = this;
        $.each(assetIds, function(index, assetId) {
            var aiObj = assetData[assetId] || (assetData[assetId] = {});
            // var relations = self.relations[assetId].relations;
            var relations = self._assetRelation[assetId].relations;
            // 第一种，以relation中的ID作为匹配条件，将此ID下的所有属性，更新给ViewTemplate
            if(!relations 
                || (relations && is(relations,'Object') && Object.keys(relations).length==0)
                || (relations && is(relations,'Array') && relations.length==0)){
                $.extend(aiObj, props);
            } else if(relations && is(relations,'Object')){
                // 第二种，以relations中的bid和property作为匹配条件，如果property有值，将bid对象记录中的property，更新给ViewTemplate
                // 如果没有值，将bid对象所有属性，更新给ViewTemplate
                var bProps = relations.props || relations.property;
                if(bProps != undefined && bProps===''){
                    $.extend(aiObj, props);
                } else {
                    if(is(bProps,'String')){
                        aiObj[bProps] = props[bProps];
                    } else if(is(riProps,'Array')){
                        $.each(bProps, function(bProp, val) {
                            aiObj[bProp] = props[bProp];
                        });
                    }
                }
            } else if(relations && is(relations,'Array')){
                // 第三种，包含多个bid对象，每个bid对象按照第二种规则匹配，最终更新给ViewTemplate整个集合数据
                $.each(relations, function(index, relation) {
                    if(relation.bid === bid){
                        var bObj = aiObj[bid] || (aiObj[bid] = {});
                        var riProps = relation.props || relation.property;
                        if(riProps != undefined && riProps===''){
                            $.extend(bObj, props);
                        } else {
                            if(is(riProps,'String')){
                                bObj[riProps] = props[riProps];
                            } else if(is(riProps,'Array')){
                                $.each(riProps, function(riProp, val) {
                                    bObj[riProp] = props[riProp];
                                });
                            }
                        }
                    }
                });
            }
        });
        $.each(assetData, function(assetId, val) {
            it.ViewTemplateManager.updateView(assetId, val);
        });
    },
    // 传感器订阅数据
    handleCollectorRelation: function(relations, data){
        this._bidToCollectorId = {};
        return this.handleRelation(relations, data, 'collector');
    },
    // 漏水绳订阅数据
    handleWaterLeakWireRelation: function(relations, data){
        this._bidToWaterLeakWireId = {};
        return this.handleRelation(relations, data, 'waterLeakWire');
    },
    // 资产订阅数据
    handleAssetRelation: function(relations, data){
        this._bidToAssetId = {};
        return this.handleRelation(relations, data, 'asset');
    },
    handleRelation:function(relations, data, type,isAsset){
        if(!relations || relations.length < 1){
            return;
        }
        var self = this;
        
        // 所有要订阅的数据
        var subscriberData = $.extend({}, (data || {})), is = it.util.is;
        var bidToCacheId = self._bidToAssetId;
        if(type=='collector'){
            bidToCacheId = self._bidToCollectorId;
        } else if(type=='waterLeakWire'){
            bidToCacheId = self._bidToWaterLeakWireId;
        }
        var cacheBid = function(bid,id){
            var cacheIds = bidToCacheId[bid] || ( bidToCacheId[bid] = []);
            if (!cacheIds.includes(id)) { // add Kevin 2017-09-05,加一个就行了
                 cacheIds.push(id);
            }
        }
        relations.forEach(function(relation){
            if (!relation) { 
                return;
            }
            // relation的格式为：{id:'', relations:{bid:'',props:[]}}
            // id：为资产编号或传感器编号
            // relations：为要订阅的业务对象，属性值（bid:业务对象ID， props:属性数组）
            // 缓存绑定关系
            // self.relations[relation.id] = relation;
            // relation的relations属性有三种格式：
            // 1、null/''/[]/{} 2、{bid:'id',property:[]} 3、[{bid:'id',property:[]},{bid:'id',property:[]}...]
            var relations = relation.relations;
            // if(typeof relations =='string'){
            //     try{
            //          relations = JSON.parse(relations);
            //      }catch(error){
            //          console.error(error);
            //          relations = undefined;
            //      }
            // }
            // 第一种，以relation中的ID作为匹配条件，将此ID下的所有属性，更新给ViewTemplate
            if(!relations 
                || (relations && is(relations,'Object') && Object.keys(relations).length==0)
                || (relations && is(relations,'Array') && relations.length==0)){
                subscriberData[relation.id] = '';
                cacheBid(relation.id,relation.id);
            } else if(relations && is(relations,'Object')){
                // 第二种，以relations中的bid和property作为匹配条件，如果property有值，将bid对象记录中的property，更新给ViewTemplate
                // 如果没有值，将bid对象所有属性，更新给ViewTemplate
                var props = subscriberData[relations.bid];
                cacheBid(relations.bid,relation.id);
                // 如果props===''所有订阅了所有属性
                if(props != undefined && props===''){
                    return;
                } else {
                    var bProps = relations.innerProp || relations.props || relations.property;
                    if(bProps != undefined && bProps===''){
                    // if(!bProps){
                        // subscriberData[relations.bid] = '';
                        subscriberData[relation.id] = '';
                    } else {
                        if(is(bProps,'String')){
                            bProps = [bProps];
                        }
                        if(is(bProps,'Array')){
                            props = props || [];
                            props = props.concat(bProps);
                            // subscriberData[relations.bid] = props;
                            subscriberData[relation.id] = props;
                        }
                    }
                }
            } else if(relations && is(relations,'Array')){
                // 第三种，包含多个bid对象，每个bid对象按照第二种规则匹配，最终更新给ViewTemplate整个集合数据
                $.each(relations, function(index, val) {
                     var props = subscriberData[val.bid];
                     cacheBid(val.bid,relation.id);
                     // 如果props===''所有订阅了所有属性
                     if(props != undefined && props===''){
                         return;
                     } else {
                        var bProps = val.innerProp || val.props || val.property;
                        if(bProps != undefined && bProps===''){
                            // subscriberData[val.bid] = '';
                            subscriberData[relation.id] = '';
                        } else {
                            if(is(bProps,'String')){
                                bProps = [bProps];
                            }
                            if(is(bProps,'Array')){
                                props = props || [];
                                $.each(bProps, function(index, prop) {
                                    // 支持{props: ["a","b"]}格式
                                    if(is(prop,'String')){
                                        props.push(prop);
                                    } else if(is(prop,'Object')){
                                        // 支持{props: [{"prop":'a',"innerProp":""},{"prop":'b',"innerProp":""}]}格式
                                        props.push(prop.innerProp);
                                    }
                                });
                                // props = props.concat(bProps);
                                // subscriberData[val.bid] = props;
                               var oldProps =  subscriberData[relation.id] || (subscriberData[relation.id] = []);
                               oldProps.concat(props);
                            }
                        }
                     }
                });
            }
        });
        return subscriberData;
        // socket.emit('monitorData', {type:'dynamic',data:subscriberData});
    },
    monitorCollectorData: function(collectors, isTemp){
        if (!collectors) {
            return ;
        }
        this._monitorCollector = true;
        var self = this;
        //不应该订阅所有的温湿度数据,应该订阅所在楼层的数据
        var subscriberRelation = [];
        $.each(collectors, function(index, val) {
            if (self._collectorRelation[val.getId()]) {
                subscriberRelation.push(self._collectorRelation[val.getId()]);
            }
        });
        var subscriberData = this.handleCollectorRelation(subscriberRelation);
        this._socket.emit('monitorData', {type:'dynamic',data:subscriberData});
    },
    monitorWaterLeakWireData: function(waterLeaks){
        if (!waterLeaks) {
            return ;
        }
        this._monitorWaterLeakWire = true;
        var self = this;
        var subscriberRelation = [];
        $.each(waterLeaks, function(index, id) {
            if (self._waterLeakWireRelation[id]) {
                subscriberRelation.push(self._waterLeakWireRelation[id]);
            }
        });
        var subscriberData = this.handleWaterLeakWireRelation(subscriberRelation);
        this._socket.emit('monitorData', {type:'dynamic',data:subscriberData});
    },
    monitorAssetData: function(assetId, byCategory){
        if(!assetId)return;
        this._monitorAsset = true;
        this._byCategory = byCategory;
        var relations = [], relation;
        if(it.util.is(assetId,'String')){
            relation = this._assetRelation[assetId];
            relations.push(relation);
        } else if(it.util.isArray(assetId)){
            var ids = assetId;
            for(var i=0; i<ids.length;i++){
                // relation = this._assetRelation[ids[i]];
                relation = this._assetRelation[ids[i]] || this._assetRelation[ids[i]._id];
                if(relation)relations.push(relation);
            }
        }
        if(!relations.length)return;
        var subscriberData = this.handleAssetRelation(relations, this._thMonitorData);
        this._socket.emit('monitorData', {type:'dynamic',data:subscriberData});
    },
    clearMonitorData: function(){
        this._socket.emit('clearMonitor');
    },
    getSetMethod : function(key){
        if(!key || key.length < 1){
            return null;
        }
        var setMethod = 'set' + key.charAt(0).toUpperCase() + key.slice(1);
        return setMethod;
    },

    findAllBusinessObj : function(callback){
        ServerUtil.api('business_object','search',{},function(bos){
            if(bos && bos.length){
                bos.forEach(function(bu){
                    console.log(bu);
                });
            }
        });
    },
    hasRelation : function(assetId){
        return !!this._assetRelation[assetId];
    },
    findAllRelations : function(callback){
        var self = this;
        this._assetRelation = {};
        this._collectorRelation = {};
        this._waterLeakWireRelation = {};
        // ServerUtil.api('relation','search',{},function(relations){
        //     if(callback){
        //         callback(relations);
        //     }
        // });
        ServerUtil.api('relation','searchWithMark',{},function(relations){
            // var relC = [];
            self.handleRelationCache(relations);
            // self._collectorRelationArray = relC;//Object.values(self._collectorRelation);
            // callback && callback();
        });
    },
    handleRelationCache: function(relations){
        var self = this;
        relations && relations.length && relations.forEach(function(relation){
            var relations = relation.relations;
            if(relations && typeof relations =='string'){
                try{
                    relations = JSON.parse(relations);
                }catch(error){
                    console.log(relations);
                    console.error(error);
                    relations = undefined;
                }
                relation.relations = relations;
            }
            var rels = self._assetRelation;
            if(relation.collector){
                rels = self._collectorRelation;
            } else if(relation.waterLeakWire){
                rels = self._waterLeakWireRelation;
            }
            rels[relation.id] = relation;
        });
    },
    handleAllRadixPoint: function(data) {
        var self = this;
        $.each(data, function(id, props) {
            delete props['_all'];
            for(key in props) {
                props[key] = self.handleSingleRadixPoint(props[key], 1);      
            }
        })
        return data;
    },
    handleSingleRadixPoint: function(value, num) {
        var self = this;
        var exg = new RegExp(/^\d*\.\d+/);
        if(typeof value == 'number') {
            value =  value.toFixed(num);
        }else if(typeof value == 'string'){
            var matchValue = value.match(exg);
            if(matchValue) {
                matchValue = matchValue[0];
                matchValue = parseFloat(matchValue).toFixed(num);
                value = value.replace(exg, matchValue);
            }
        }else if(it.util.is(value, 'Object')) {   //某个字段的值是一个对象
            for(key in value) {
                value[key] = self.handleSingleRadixPoint(value[key], 1);
            }
        }

        return value;
    }
});
it.RealtimeDynamicEnviroManager = $RealtimeDynamicEnviroManager;