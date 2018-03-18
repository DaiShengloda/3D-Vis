var $LoadData = function (sceneManager) {
    this.sceneManager = sceneManager;
    this.dataManager = this.sceneManager.dataManager;
    this.lightManager = this.sceneManager.lightManager;
    this.alarmManager = this.sceneManager.getAlarmManager();
    //    this.callback = callback;
    this.loadFinishedHandel = [];
    this.init();
    this._resCount = 0;
    this._resTotal = dataJson.enablePermission?15:13;
};

mono.extend($LoadData, Object, {

    addFinishedHandel: function (fun, scope) {
        if (fun) {
            this.loadFinishedHandel.push({ fun: fun, scope: scope });
        }
    },

    init: function () {
        // make.Default.path = './modellib/';  //配置模型图片的路径
        if (pageConfig.urlPrex) {
            make.Default.path = pageConfig.url('/modellib/');  //配置模型图片的路径
        }else{
            make.Default.path = './modellib/';  
        }
        // this.loadBeginSource(); // 加载一开始的资源
    },

    doLoad: function (callback) {
        this.callback = callback;
        // this.loadAllData();
        // this.loadRightMenuItem();
        // // 等待所有的查询结束，再加载
        // var self = this;
        // var f = function(){
        //     if(self._resCount === self._resTotal){
        //         var endCallback = function() {
        //             if (self.callback) {
        //                 self.callback();
        //             }
        //             self.doFinsihed();
        //         }
        //         self.preLoadModel(self.sceneTypes, endCallback, self.withDc);
        //     } else {
        //         setTimeout(f,1000);
        //     }
        // }
        // setTimeout(f,500);
        
        
        var self = this;
        var onloadFinish = function() {
            var endCallback = function() {
                if (self.callback) {
                    self.callback();
                }
                self.doFinsihed();
            }
            self.preLoadModel(self.sceneTypes, endCallback, self.withDc);
        }
        this.loadAllDataInOneRequest(onloadFinish);
 
    },

    api: function(module, method, data, success, error){
        var self = this;
        ServerUtil.api(module, method, data, function(result){
            success && success(result);
            self._resCount++;
        }, function(result){
            error && error(result);
            self._resCount++;
        });
    },

   /*
    loadLinks: function(scope, callback) {
        var self = scope || this;    
        self.api('link', 'search', {}, function(links) {
            if (links && links.length) {
                it.util.api('link', 'getAllCustomData', {}, function(customDatas) {
                    var customDataMap = {};
                    if (customDatas && customDatas.length > 0) {
                        customDatas.forEach(function(item) {
                            customDataMap[item.id] = item;
                        })
                    }
                    links.forEach(function(linkData) {
                        var link = new it.Link({
                            id: linkData.id,
                            name: linkData.name,
                            dataTypeId: linkData.dataTypeId,
                            type: linkData.type,
                            fromId: linkData.fromId,
                            toId: linkData.toId,
                            fromSide: linkData.fromSide,
                            toSide: linkData.toSide,
                            fromControls: null,
                            toControls: null,
                            fromPortId: linkData.fromPortId,
                            toPortId: linkData.toPortId,
                            routeType: linkData.routeType,
                            fromIpAddress: linkData.fromIpAddress,
                            toIpAddress: linkData.toIpAddress,
                            _userDataMap: customDataMap[linkData.id]
                        });
                        if (customDataMap[linkData.id]) {
                            var customData = customDataMap[linkData.id];
                            $.extend(link._userDataMap, customData);
                        }
                        self.dataManager.addLink(link);
                    });
                    callback && (callback());
                })
            }
        });
    },

    loadRightMenuItem: function () {
        var that = this, self = this;
        self.api('rightMenuItem', 'search', {}, function (menuItems) {
            that.dataManager.categoryItemMap = {};
            var categoryItemMap = that.dataManager.categoryItemMap;
            var i;
            for (i = 0; i < menuItems.length; i++) {
                var menuItem = menuItems[i];
                if (!categoryItemMap[menuItem.categoryId]) {
                    categoryItemMap[menuItem.categoryId] = [];
                }
                categoryItemMap[menuItem.categoryId].push(menuItem.item);
            }
        });
    },

    */

    /**
     * 加载tadaType上的templatedatas
     */
    loadTemplateDatas: function (templates) {
        var self = this;
        ServerUtil.api('template_data', 'search', {}, function (templateDatas) {
            self.dataManager.addTemplateDataFromJson(templateDatas);
        });
    },

    preLoadModel: function (loadTypes, callback, withDc) {
        if (withDc) {
            var dcTypes = loadTypes;
            var array = [],curr = 0;
            for (var typeId in dcTypes) {
                var dataType = dcTypes[typeId];
                var model = dataType.getModel();
                var simpleModel = dataType.getSimpleModel();
                var cid = dataType.getCategoryId().toLowerCase();
                if (cid == 'datacenter' || cid == 'building') {
                    if (model && make.Default.isAsync(model)) {
                        array.push(model);
                    }
                }

                if (simpleModel && make.Default.isAsync(simpleModel)) {
                    array.push(simpleModel);
                }
            }
            if (array.length === 0) {
                // callback && callback(); // 2017-12-01 没有地球和园区这里也不应该执行，以免下面会重复执行的
            } else {
                curr = 0;
                array.forEach(function (model) {
                    make.Default.load(model, function () {
                        curr++;
                        // if (curr == array.length) {
                        //     callback && callback();
                        // }
                    });
                });
            }

            //预加载每个数据中心地图的图片
            var datas = [];
            if (!dataJson.earthView 
                || !dataJson.earthView.clazz 
                || dataJson.earthView.clazz == 'CustomEarthSceneView'){ //只有默认的地球才要生成这样的图片 add by Kevin 2017-09-08
                 datas = main.sceneManager.dataManager._categoryDatas["dataCenter"]; // 上面的查询太慢了，15k条耗时1分多钟
            }
            var imageCount = 0, imageTotal = 0;
            if (main.sceneManager.dataManager._categoryDatas["earth"]) {
                for (var id in datas) {
                    var data = datas[id];
                    if (!data.getChildren() || data.getChildren().size() < 1) {
                        continue;
                    }
                    var map = document.getElementById('map');
                    if (!map) {
                        map = document.createElement('canvas');
                        map.setAttribute('id', 'map');
                        map.style.zIndex = 10;
                        map.style.position = 'absolute';
                        var left = '0px',
                            top = '0px'; //调用navbar中的函数动态改变
                        map.style.left = left;
                        map.style.top = top;
                        map.style.display = 'none';
                        map.addEventListener('click', function() {
                            map.style.display = 'none';
                        });
                        document.body.appendChild(map);
                        if (id) {
                            var pics = [];
                            for (var i = 0; i <= 12; i++) {
                                pics.push('theme/map/' + id + '/' + i + '.jpg');
                            }
                            map.images = [];
                            map.images.finished = 0;
                            imageTotal += pics.length;
                            for (var i = 0; i < pics.length; i++) {
                                var pic = pics[i];
                                var image = new Image();
                                map.images.push(image);
                                image.onload = function() {
                                    map.images.finished++;
                                    imageCount++;
                                }
                                image.src = pic;
                            }
                        }
                    }
                }
            }
            var f = function(){
                if (curr == array.length 
                    && imageCount === imageTotal) {
                    callback && callback();
                } else {
                    setTimeout(f, 500);
                }
            }
            setTimeout(f, 500);
        } else {
            callback && callback();
        }
    },

    setFlagForGoToId: function(datas) {
        var self = this;
        var sceneTypes = null;
        var withDc = true;
        var goToId = self.getIdFromLocation();
        var alarmdataid = self.getAlarmDataIdFromLocation();
        if (!goToId && alarmdataid) {
            var dataForAlarm = self.dataManager.getDataById(alarmdataid);
            var rootSceneAndData = main.sceneManager.getSceneAndRootByData(dataForAlarm);
            if (rootSceneAndData && rootSceneAndData.rootData) {
                goToId = rootSceneAndData.rootData.getId();
            }
        }
        var goToData = self.dataManager.getDataById(goToId);
        var goToDataCategory = self.dataManager.getCategoryForData(goToData);
        if (goToData) {
            var rootSceneAndData = main.sceneManager.getSceneAndRootByData(goToData);
            if (rootSceneAndData && rootSceneAndData.rootData) {
                sceneTypes = main.sceneManager.getSceneDataTypes(rootSceneAndData.rootData);
            }
        }
        var cId = goToDataCategory && goToDataCategory.getId();
        if (cId && (cId.toLowerCase() == 'earth' || cId.toLowerCase() == 'datacenter')) {
            sceneTypes = self.dataManager._dataTypeMap;
            withDc = true;
        } else if (!self.dataManager._sceneMap["building"] && cId && cId.toLowerCase() == 'building') {
            sceneTypes = self.dataManager._dataTypeMap;
            withDc = true;
        } else if (sceneTypes) {
            withDc = false;
        } else {
            withDc = true;
            sceneTypes = self.dataManager._dataTypeMap;
        }
        self.sceneTypes = sceneTypes;
        self.withDc = withDc;
    },

    setLinks: function(links, customDatas) {
        var self = this;    
        // self.api('link', 'search', {}, function(links) {
            if (links && links.length) {
                // it.util.api('link', 'getAllCustomData', {}, function(customDatas) {
                    var customDataMap = {};
                    if (customDatas && customDatas.length > 0) {
                        customDatas.forEach(function(item) {
                            customDataMap[item.id] = item;
                        })
                    }
                    links.forEach(function(linkData) {
                        var link = new it.Link({
                            id: linkData.id,
                            name: linkData.name,
                            dataTypeId: linkData.dataTypeId,
                            type: linkData.type,
                            fromId: linkData.fromId,
                            toId: linkData.toId,
                            fromSide: linkData.fromSide,
                            toSide: linkData.toSide,
                            fromControls: null,
                            toControls: null,
                            fromPortId: linkData.fromPortId,
                            toPortId: linkData.toPortId,
                            routeType: linkData.routeType,
                            fromIpAddress: linkData.fromIpAddress,
                            toIpAddress: linkData.toIpAddress,
                            _userDataMap: customDataMap[linkData.id]
                        });
                        if (customDataMap[linkData.id]) {
                            var customData = customDataMap[linkData.id];
                            $.extend(link._userDataMap, customData);
                        }
                        self.dataManager.addLink(link);
                    });
                    // callback && (callback());
                // })
            }
        // });
    },

    /**
     * 一个请求中返回所有的数据
     *
     name = 'config';
     name = 'data';
     name = 'category';
     name = 'datatype';
     name = 'scene';
     name = 'data_getAllCustomData';
     name = 'template_data';
     name = 'business_type';
     name = 'light';
     name = 'temperature_field';
     name = 'collector';
     name = 'link';
     name = 'link_getAllCustomData';
     name = 'rightMenuItem';
     name = 'alarm_severity';
     name = 'alarm_type';
     name = 'alarm_status';
     name = 'alarm';
     */
    loadAllDataInOneRequest : function(callback){
        var self = this;
        self.api('data', 'loadAllData', {}, function(result) {
            if (result.error) {
                alertUtil.error(result.error);
                return ;
            }
            if (result.length < 1) {
                return ;
            }
            var results = result[0].datas;
            if (!results) {
                return ;
            }
            // 处理config
            main.systemConfig = results['config'] ? results['config'][0] : {};
            
            //处理类别
            var categorys = results['category'];
            self.dataManager.addCategoryFromJson(categorys);
            categorys.forEach(function(cate) {
                var category = self.dataManager._categoryMap[cate.id];
                if (category) {
                    category.setUserData('searchFilter', cate.searchFilter);
                    category.setUserData('performanceUrl', cate.performanceUrl);
                }
            });

            //初始化cametaSetting
            main.cameraSetting = new CameraSetting();

            //处理datatype
            var dataTypes = results['datatype'];
            dataTypes.forEach(function(datatype) {
                datatype.prefabAble = !datatype.noPrefab;
            });
            self.dataManager.addDataTypeFromJson(dataTypes);
            dataTypes.forEach(function(datatype) {
                var dt = self.dataManager.getDataTypeById(datatype.id);
                if (dt) {
                    dt.setUserData('searchFilter', datatype.searchFilter);
                    dt.setUserData('businessTypeId', datatype.businessTypeId);
                }
            });

            //处理scene
            var scenes = results['scene'];
            self.dataManager.addSceneFromJson(scenes);

            //处理data
            var datas = results['data'];
            self.dataManager.addDataFromJson(datas);
            self.setFlagForGoToId();
            // data的customData
            var dataCustomData = results['data_getAllCustomData'];
            $.each(dataCustomData, function(category, props) {
                $.each(props, function(index, propsObj) {
                    var data = self.dataManager.getDataById(propsObj.id);
                    delete propsObj.createdAt;
                    delete propsObj.updatedAt;
                    if (data) {
                        $.each(propsObj, function(index, val) {
                        // data.setUserData(index, val); //慎用，当val为null时，该index会被删除
                            data._userDataMap[index] = val;
                        });
                    }
                });
            });

            //处理links
            var links = results['link']
            var linkCustomDatas = results['link_getAllCustomData'];
            self.setLinks(links,linkCustomDatas);

            //template_data
            var templateDatas = results['template_data'];
            self.dataManager.addTemplateDataFromJson(templateDatas);

            //business_type 
            var businessTypes = results['business_type'];
            self.dataManager.addBusinessTypeFromJson(businessTypes);
            businessTypes.forEach(function(businessType) {
                var bt = self.dataManager.getBusinessTypeById(businessType.id);
                if (bt) {
                    bt.setUserData('searchFilter', businessType.searchFilter);
                }
            });
            
            //light 
            var lights = results['light'];
            self.lightManager.addLightsFromJson(lights);

            //temperature_field
            var temperatureFields = results['temperature_field'];
            self.dataManager.addTemperatureFieldFromJson(temperatureFields);

            // collectors 
            var collectors = results['collector'];
            self.dataManager.addCollectorFromJson(collectors);
            
            //rightMenuItem
            var menuItems = results['rightMenuItem'];
            self.dataManager.categoryItemMap = {};
            var categoryItemMap = self.dataManager.categoryItemMap;
            var i;
            for (i = 0; i < menuItems.length; i++) {
                var menuItem = menuItems[i];
                if (!categoryItemMap[menuItem.categoryId]) {
                    categoryItemMap[menuItem.categoryId] = [];
                }
                categoryItemMap[menuItem.categoryId].push(menuItem.item);
            }

            //alarm_severity
            var alarmSeverities = results['alarm_severity'];
            it.AlarmSeverity.clear();
            delete it.AlarmSeverity.CRITICAL;
            delete it.AlarmSeverity.MAJOR;
            delete it.AlarmSeverity.MINOR;
            delete it.AlarmSeverity.WARNING;
            delete it.AlarmSeverity.INDETERMINATE;
            delete it.AlarmSeverity.CLEARED;
            self.alarmManager.addAlarmSeverityFromJson(alarmSeverities);

            //alarm_type
            var alarmTypes = results['alarm_type'];
            self.alarmManager.addAlarmTypeFromJson(alarmTypes);

            //alarm_status
            var alarmStatuses = results['alarm_status'];
            self.alarmManager.addAlarmStausFromJson(alarmStatuses);

            //alarm
            var alarms = results['alarm'];
            self.alarmManager.addAlarmFromJson(alarms);

            //验证license
            window.setInterval(function() {
                ServerUtil.api('api', 'le', {}, function(data) {
                    if (data.value) { // 如果有错误(license过期)这个value不为空
                       var filter = new it.VirtualManager(self.sceneManager);
                       filter.addAll();
                       self.sceneManager.viewManager3d.addMaterialFilter(filter);
                       self.sceneManager.network3d.dirtyNetwork();
                       console.log('License ' + it.util.i18n("LoadData_Expired"));
                    }
                });
            }, 2 * 60 * 60 * 1000);

            callback && callback();
        },function(error){

        });

        // 如果需要登录需要获取用户的资产权限，用于过滤资产
        dataJson.enablePermission && self.api('user', 'getUserAsset', {}, function(assets) {
            //设置有权限的Asset
               if(!assets || !assets.length)return;
               var drm = main.drm = new it.DRMManager(main.sceneManager);
                  // drm.initDefaultLevel(0); //0 可见  1 虚化 2 隐藏
                  $.each(assets, function(index, asset) {
                     drm.update(asset.assetId, 0);
                  });
            });
        
         // 如果需要登录需要获取用户的模块权限，用于生成模块
        dataJson.enablePermission && self.api('user', 'getFrontPermission', {}, function(permissions) {
            // todo: 应用权限，生成导航
            //      方案一、缓存权限，在切换场景的时候判断
            //      方案二、根据权限修改navbar中items的值（建议）
            if(!permissions || !permissions.length)return;
            var  menus = permissions.map(function(elem, index) {
                return elem.menuId;
            })
            var filter = function(items){
                return items.filter(function (item) {
                    if(menus.indexOf(item.id)>=0){
                        return true;
                    } else {
                        if(item.items){
                            item.items = filter(item.items);
                        }
                    }
                    return false;
                })
            }
            dataJson.navBars.items = filter(dataJson.navBars.items);
        });
        // 获取事件接口关系，获取后对事件进行监听，监听的handler使用相同的handler
        // handler在ServerUtil.commandHandler
        // 如果通过self.api方法查询数据，记得_resTotal增加1
        ServerUtil.api('event_interface_relation', 'getEvents', {}, function(results){
            results.forEach(function (result) {
                main.eventBus.on(result.event, ServerUtil.commandHandler);
            });
        });

    },

    loadAllData: function() {
        var self = this;
        var l = new Date().getTime();
        self.api('config', 'search', {}, function(data) {
            if (data.error) {
                alertUtil.error(data.error);
            } else {
                main.systemConfig = data[0] || {};
            }
            
            self.api('category', 'search', {}, function(categorys) {
                self.dataManager.addCategoryFromJson(categorys);
                categorys.forEach(function(cate) {
                    var category = self.dataManager._categoryMap[cate.id];
                    if (category) {
                        category.setUserData('searchFilter', cate.searchFilter);
                        category.setUserData('performanceUrl', cate.performanceUrl);
                    }
                });
                main.cameraSetting = new CameraSetting();
                self.api('datatype', 'search', {}, function(dataTypes) {
                    dataTypes.forEach(function(datatype) {
                        datatype.prefabAble = !datatype.noPrefab;
                    });
                    self.dataManager.addDataTypeFromJson(dataTypes);
                    dataTypes.forEach(function(datatype) {
                        var dt = self.dataManager.getDataTypeById(datatype.id);
                        if (dt) {
                            dt.setUserData('searchFilter', datatype.searchFilter);
                            dt.setUserData('businessTypeId', datatype.businessTypeId);
                        }
                    });
                    self.api('scene', 'search', {}, function(scenes) {
                        self.dataManager.addSceneFromJson(scenes);
                        self.api('data', 'search', {
                            dataTypeId: {
                                $ne: null
                            }
                        }, function(datas) {
                            self.dataManager.addDataFromJson(datas);
                            self.setFlagForGoToId();
                            /*
                            var sceneTypes = null;
                            var withDc = true;
                            var goToId = self.getIdFromLocation();
                            var alarmdataid = self.getAlarmDataIdFromLocation();
                            if (!goToId && alarmdataid) {
                                var dataForAlarm = self.dataManager.getDataById(alarmdataid);
                                var rootSceneAndData = main.sceneManager.getSceneAndRootByData(dataForAlarm);
                                if (rootSceneAndData && rootSceneAndData.rootData) {
                                    goToId = rootSceneAndData.rootData.getId();
                                }
                            }
                            var goToData = self.dataManager.getDataById(goToId);
                            var goToDataCategory = self.dataManager.getCategoryForData(goToData);
                            if (goToData) {
                                var rootSceneAndData = main.sceneManager.getSceneAndRootByData(goToData);
                                if (rootSceneAndData && rootSceneAndData.rootData) {
                                    sceneTypes = main.sceneManager.getSceneDataTypes(rootSceneAndData.rootData);
                                }
                            }
                            // if (sceneTypes) {
                            //     withDc = false;
                            // }else{ 
                            //     sceneTypes = self.dataManager._dataTypeMap;
                            // }
                            var cId = goToDataCategory && goToDataCategory.getId();
                            if (cId && (cId.toLowerCase() == 'earth' || cId.toLowerCase() == 'datacenter')) {
                                sceneTypes = self.dataManager._dataTypeMap;
                                withDc = true;
                            } else if (!self.dataManager._sceneMap["building"] && cId && cId.toLowerCase() == 'building') {
                                sceneTypes = self.dataManager._dataTypeMap;
                                withDc = true;
                            } else if (sceneTypes) {
                                withDc = false;
                            } else {
                                withDc = true;
                                sceneTypes = self.dataManager._dataTypeMap;
                            }
                            self.sceneTypes = sceneTypes;
                            self.withDc = withDc;
                            // var endCallback = function() {
                            //     if (self.callback) {
                            //         self.callback();
                            //     }
                            //     self.doFinsihed();
                            // }
                            // self.preLoadModel(sceneTypes, endCallback, withDc);
                            */
                            self.loadLinks(self, function() {});

                            self.api('data', 'getAllCustomData', {}, function(datas) {
                                // self.dataManager.addDataFromJson(datas);
                                $.each(datas, function(category, props) {
                                    $.each(props, function(index, propsObj) {
                                        var data = self.dataManager.getDataById(propsObj.id);
                                        delete propsObj.createdAt;
                                        delete propsObj.updatedAt;
                                        if (data) {
                                            $.each(propsObj, function(index, val) {
                                                // data.setUserData(index, val); //慎用，当val为null时，该index会被删除
                                                data._userDataMap[index] = val;
                                            });
                                        }
                                    });
                                });
                            });
                            // 如果需要登录需要获取用户的资产权限，用于过滤资产
                            dataJson.enablePermission && self.api('user', 'getUserAsset', {}, function(assets) {
                                // todo: 设置有权限的Asset
                                if(!assets || !assets.length)return;
                                var drm = main.drm = new it.DRMManager(main.sceneManager);
                                // drm.initDefaultLevel(0); //0 可见  1 虚化 2 隐藏
                                // drm.initDefaultLevel(1);
                                $.each(assets, function(index, asset) {
                                    drm.update(asset.assetId, 0);
                                });
                            });
                        });
                    });
                    // });
                    //需要等到datatype加载完成后再加载templatedata，不然2d面板端口显示不出来
                    self.api('template_data', 'search', {}, function(templateDatas) {
                        self.dataManager.addTemplateDataFromJson(templateDatas);
                    });
                });
                // });

            });

        });

        self.api('business_type', 'search', {}, function(businessTypes) {
            self.dataManager.addBusinessTypeFromJson(businessTypes);
            businessTypes.forEach(function(businessType) {
                var bt = self.dataManager.getBusinessTypeById(businessType.id);
                if (bt) {
                    bt.setUserData('searchFilter', businessType.searchFilter);
                }
            });
        });



        self.api('light', 'search', {}, function(datas) {
            self.lightManager.addLightsFromJson(datas);
        });

        window.setInterval(function() {
            ServerUtil.api('api', 'le', {}, function(data) {
                if (data.value) { // 如果有错误(license过期)这个value不为空
                    var filter = new it.VirtualManager(self.sceneManager);
                    filter.addAll();
                    self.sceneManager.viewManager3d.addMaterialFilter(filter);
                    self.sceneManager.network3d.dirtyNetwork();
                    console.log('License ' + it.util.i18n("LoadData_Expired"));
                }
            });
        }, 2 * 60 * 60 * 1000);

        self.api('temperature_field', 'search', {}, function(fields) {
            self.dataManager.addTemperatureFieldFromJson(fields);
        });

        self.api('collector', 'search', {}, function(collectors) {
            self.dataManager.addCollectorFromJson(collectors);
        });

        // 如果需要登录需要获取用户的模块权限，用于生成模块
        dataJson.enablePermission && self.api('user', 'getFrontPermission', {}, function(permissions) {
            // todo: 应用权限，生成导航
            //      方案一、缓存权限，在切换场景的时候判断
            //      方案二、根据权限修改navbar中items的值（建议）
            if(!permissions || !permissions.length)return;
            var  menus = permissions.map(function(elem, index) {
                return elem.menuId;
            })
            var filter = function(items){
                return items.filter(function (item) {
                    if(menus.indexOf(item.id)>=0){
                        return true;
                    } else {
                        if(item.items){
                            item.items = filter(item.items);
                        }
                    }
                    return false;
                })
            }
            dataJson.navBars.items = filter(dataJson.navBars.items);
        });

    },

    /**
     * 
     */
    isParentScene: function (rootScene, rootSceneData) {
        if (!rootSceneData) {
            return true;
        }
        var focusNode = main.sceneManager.viewManager3d.getFocusNode();
        var data = main.sceneManager.getNodeData(focusNode);
        // var dataScene = main.sceneManager.getSceneAndRootByData(data);
        var parentData = null;

        if (data instanceof it.Link) {
            if (data.getFromId() && main.sceneManager.isCurrentSceneInstance(data.getFromId())) {
                parentData = main.sceneManager.dataManager.getDataById(data.getFromId());
            } else if (data.getToId()) {
                parentData = main.sceneManager.dataManager.getDataById(data.getToId());
            }
        } else {
            parentData = main.sceneManager.dataManager.getParent(data);
        }
        if (!parentData) {
            return true;
        }
        if (parentData.getId() == rootSceneData.getId()) {
            return true;
        }

        // add 2017-01-05 scene相同rootData不同也应该支持向上跳转
        var parentRootScene = main.sceneManager.getSceneAndRootByData(parentData);
        if (parentRootScene && parentRootScene.scene == rootScene) {
            return true;
        }

        // var parentScene = main.sceneManager.getSceneAndRootByData(parentData);
        // if(!parentScene){
        //     return true;
        // }
        // if (dataScene && parentScene 
        //     &&dataScene.scene.getId() == parentScene.scene.getId()) { //如果一样的话也可
        //     return true;
        // }
        return main.sceneManager.isAncestor(parentData, rootSceneData.getId());
        // return false;
    },

    getIdFromLocation: function () {
        var location = window.location;
        var search = location.search;
        search = search.replace("?", "");
        search = search.replace('alarmdataid', '');//免得与alarmdataid冲突
        var ids = /id=([^&]*)/.exec(search);
        if (ids == null) {
            return;
        }
        id = ids[1];
        return id;
    },

    getAlarmDataIdFromLocation: function () {
        var location = window.location;
        var search = location.search;
        search = search.replace("?", "");
        var ids = /alarmdataid=([^&]*)/.exec(search);
        if (ids == null) {
            return;
        }
        id = ids[1];
        return id;
    },

    getPreLoadStatus: function () {
        var location = window.location;
        var search = location.search;
        search = search.replace("?", "");
        var ids = /preLoad=([^&]*)/.exec(search);
        if (ids == null) {
            return;
        }
        id = ids[1];
        return id;
    },

    _goToSearchId: function () {
        var self = this;
        var id = this.getIdFromLocation();
        var alarmdataid = this.getAlarmDataIdFromLocation();
        if (!id && alarmdataid) {
            var dataForAlarm = main.sceneManager.dataManager.getDataById(alarmdataid);
            var rootSceneAndData = main.sceneManager.getSceneAndRootByData(dataForAlarm);
            if (rootSceneAndData && rootSceneAndData.rootData) {
                id = rootSceneAndData.rootData.getId();
            }
        }
        if (id == null) {
            return;
        }
        id = id.trim();
        var data = main.sceneManager.dataManager.getDataById(id);
        if (!data) {
            return;
        }
        var rootSceneAndData = main.sceneManager.getSceneAndRootByData(data);
        main.sceneManager.dataManager._rootScene = rootSceneAndData.scene;
        var orgHandleDoubleClickBackground = main.sceneManager.viewManager3d.handleDoubleClickBackground;
        main.sceneManager.viewManager3d.handleDoubleClickBackground = function () {
            if (rootSceneAndData
                && !self.isParentScene(rootSceneAndData.scene, rootSceneAndData.rootData)) {
                return;
            } else {
                return orgHandleDoubleClickBackground.call(main.sceneManager.viewManager3d);
            }
        }

        // 通过id的方式，只显示所传id自身的告警
        // main.sceneManager._alarmManager.handleSceneManagerChange = function(e){
        //     return;
        // }
        var amScope = main.sceneManager._alarmManager;

        main.sceneManager.viewManager3d.getDefaultEventHandler().lookAtByData(data, null, false);


        //显示这个data的告警
        var alarmDataId = this.getAlarmDataIdFromLocation();
        var alarmData = main.sceneManager.dataManager.getDataById(alarmDataId);

        // amScope.calculateDataAlarmState(data);

        // setTimeout(function(){
        //     self.showDataAlarm(alarmData);
        // },1000); //需要timeout，不知道告警什么时候查询好，1’也不太合理 


        if (alarmData) {
            main.sceneManager.removeSceneManagerChangeListener(amScope.handleSceneManagerChange, amScope);
            amScope.removeAlarmManagerChangeListener(amScope.handleAlarmManagerChange, amScope);
            amScope.addAlarmManagerChangeListener(function (e) {
                var alarm = e.data;
                if (alarm
                    && alarm.getDataId()
                    // && main.sceneManager.isAncestor(alarm.getDataId(), data.getId())) {
                    && alarm.getDataId() === alarmData.getId()) {
                    amScope.handleAlarmManagerChange(e);
                } else {
                    return;
                }
            }, amScope, true);
            // this.handleSceneManagerChange
            amScope._sceneManager.addSceneManagerChangeListener(function (e) {
                var cNode = e.data;
                var cData = main.sceneManager.getNodeData(cNode);
                // if (cData && main.sceneManager.isAncestor(cData.getId(), data.getId())) {
                if (cData && cData.getId() === alarmData.getId()) {
                    amScope.handleSceneManagerChange(e);
                }
            }, this, true);
        }

    },

    // /**
    //  * 因为传id时，除了id对应的告警显示处理外(孩子也应该显示，否则传播到它上面的告警也显示不出来)，其他的都不显示
    //  * 显示data的告警
    //  */
    // showDataAlarm : function(data,scope){
    //     if (!data) {
    //         return;
    //     }
    //     scope = scope||this;
    //     var children = data.getChildren();
    //     if (children && children.size() > 0) {
    //         children.forEach(function(child){
    //             scope.showDataAlarm(child);
    //         });
    //     }
    //     main.sceneManager._alarmManager.calculateDataAlarmState(data);
    // },

    doFinsihed: function () {
        if (this.loadFinishedHandel && this.loadFinishedHandel.length > 0) {
            for (var i = 0; i < this.loadFinishedHandel.length; i++) {
                var funObj = this.loadFinishedHandel[i];
                if (funObj && funObj.fun) {
                    var scope = funObj.scope;
                    funObj.fun.call(scope);
                }
            }
        }
        this._goToSearchId();
    },

    /**
     * 最先加载的资源
     */
    loadBeginSource: function (callback) {
        // http://localhost:8081/modellib/model/scene/images/glow.png
        make.Default.load({ id: 'twaver.scene.earth' });
        make.Default.load({ id: 'twaver.scene.datacenter' });
        make.Default.load({ id: 'twaver.scene.skybox3' });
        var network = new mono.Network3D();
        network.setBackgroundImage('/modellib/model/scene/images/star_sky.jpg');
        // this.loadImage('/modellib/model/scene/images/star_sky.jpg',callback);
    },

    loadImage: function (url, callback) {
        if (!url) {
            return;
        }
        var image = $('<img></img>');
        image.attr('src', url);
        image.load(function () {
            callback && callback();
            // console.log('finish!!!');
        });
    },


});

$LoadData.loadAllPropConfig = function (callback) {
    ServerUtil.api('popup', 'search', {}, function (popConfigs) {
        if (callback) {
            callback(popConfigs);
        }
    });
};

it.LoadData = $LoadData;