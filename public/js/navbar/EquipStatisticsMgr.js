fa = {};
var $EquipStatisticsMgr = function (sceneManager) {
    this.sceneManager = sceneManager;
};

mono.extend($EquipStatisticsMgr, Object, {
    
    init: function(){
        this.chartParams = {};
        this.chartParams1 = {};
        this.chartParams2 = {};
        this.configField = [];
        this.configChart = [];
        this.configTitle = [];
        this.initConfig();
        this.initView();    
    },

    initView: function(){
        var self = this;
        // var $box = this.$box = $('<div></div>').addClass('infoPanel').appendTo($('.view-control')).css({ 'position': 'absolute', 'top': '50%', 'left': '50%', 'transform': 'translate(-50%,-50%)' });
        this._dialog = $('<div></div>').appendTo($(document.body));
        var $box = this.$box = $('<div></div>').appendTo(this._dialog);
        $box.equipStatistics({
            statisticsCates: this.configField,
            statisticsCharts: this.configChart,
            statisticsTitles: this.configTitle
        });
        this._dialog.dialog({ //创建dialog弹窗
            blackStyle: true,
            width: 'auto',
            height: 'auto',
            title: it.util.i18n("EquipStatisticManager_statisicsChart"),
            autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
            show: '', //显示弹窗出现的效果，slide为滑动效果
            hide: '', //显示窗口消失的效果，explode为爆炸效果
            resizable: false, //设置是否可拉动弹窗的大小，默认为true
            modal: true,
        });
    },

    initConfig: function(){
        var self = this;
        if(main.systemConfig){
            var initialConfig = main.systemConfig.asset_statistics_arr;
            if(!initialConfig) return;
            var len = 4,ind = 0;
            initialConfig.forEach(function(config,index){
                //最多只能画4个
                if(index >= len) return;
                self.configChart.push(config.chartType);
                self.configField.push(config.columnName);
                self.configTitle.push(config.columnDisplayName);
            });
        }
    },

    hide: function () {
        this._dialog.dialog('close');
    },

    show: function () {
        var allDatas = this.getAllData();
        if(allDatas && allDatas.length){
            this.setData(allDatas);
            this.$box.equipStatistics('option','allDatas',allDatas);
            this._dialog.dialog('open');
        }else{
            layer.msg(it.util.i18n('EquipStatisticManager_curScene_equipments_required'));
        } 
    },
    getAllData: function(){
        //获取当前场景的所有设备
        var allDatas = main.sceneManager.dataManager._dataMap;
        var equipDatas = [];
        for(var i in allDatas){
            if(main.sceneManager.isCurrentSceneInstance(allDatas[i])){
                var cateId;
                if(main.sceneManager.dataManager.getCategoryForData(allDatas[i])){
                    cateId = main.sceneManager.dataManager.getCategoryForData(allDatas[i]).getId();
                    if(cateId.toLowerCase() == 'equipment'){
                        equipDatas.push(allDatas[i]);
                    }
                }
            }
        }
        return equipDatas;
    },

    setData: function(datas){
        //给子组件传递数据，数据包括： 所有设备（已经分好类的）、呈现的类型（饼状、条状等）
        //echarts-pie、echarts-bar、twaver-pie..
        var self = this;
        this.configField.forEach(function(field,index){
            var fParams = {};
            fParams.fieldName = field;
            fParams.chartType = self.configChart[index];
            if(field == 'businessType'){
                fParams.chartDatas = self.sortEquipmentsByBusiness(datas);
            }else{//除了业务类型，其它的字段都来自扩展
                fParams.chartDatas = self.sortEquipmentsByExtension(datas,field);
            }           
            self.$box.equipStatistics('option','chartParams',fParams);
        })
    },

    sortEquipmentsByExtension: function(datas,field){
        var resArr = [] ,resObj = {}, others = 0;

        datas.forEach(function(data){
            if(data._userDataMap){
                if(data._userDataMap[field]){
                    var fieldName = data._userDataMap[field];
                    resObj[fieldName] =  resObj[fieldName] ? ++resObj[fieldName] : 1;
                }else{
                    others++;
                }
            }else{
                others++;
            }
        })
        for(var i in resObj){
            resArr.push({
                name: i,
                value: resObj[i]
            })
        }
        if(others){
            resArr.push({
                name: it.util.i18n('EquipStatisticManager_unnamed'),
                value: others
            })
        }
        return resArr;
    },

    sortEquipmentsByBusiness: function(datas){
        var businessTypeMap = main.sceneManager.dataManager._businessTypes;
        var busObj = {},resArr = [] ,resObj = {}, others = 0;
        businessTypeMap.forEach(function(bs){
            busObj[bs._id] = bs._name;
        })
        datas.forEach(function(data){
            if(data._businessTypeId){
                var btId = data._businessTypeId;
                resObj[btId] =  resObj[btId] ? ++resObj[btId] : 1;
            }else{
                others++;
            }
        })
        for(var i in resObj){
            resArr.push({
                name:  busObj[i],
                value: resObj[i]
            })
        }
        if(others){
            resArr.push({
                name: it.util.i18n('EquipStatisticManager_unnamed'),
                value: others
            })
        }
        return resArr;
    }
})

it.EquipStatisticsMgr = $EquipStatisticsMgr;