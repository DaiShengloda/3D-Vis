var $AssetStatistics = function (configDialog) {
    $ConfigApp.call(this, configDialog);
};

mono.extend($AssetStatistics, $ConfigApp, {

    initConfigPanel: function () {
              
        var self = this;
        this.sectionResults = [];
        this.selectGroup = [];
        this.defaultObj = {};
        this.allFieldsArr = [];
        this.defaultArr = [{columnName: "businessType", columnDisplayName: "业务类型", chartType: "Echart-pie"}];
        this.chartTypeArr = ['Echart-pie','Echart-bar','Twaver-pie'];
        this.selectType = ['StatisticalField','ChartType'];
       
        
        this.box = $('<div class="assetStatisticsBox" style="margin-top: 15px" id="AssetStatistics"></div>');
        //标题
        var p1 = $('<h5 style="font-weight: bold;">' + it.util.i18n('AssetStatistics_config') + ' : </h5>');
        this.configDialog.append(this.box);
        this.box.append(p1);
        //当前区域
        var currentDiv = $('<div class="assetStatistics_current"></div>');
        var currentTitle = $('<span style="margin-left: 15px"><b>'+it.util.i18n('AssetStatistics_currentConfig')+':</b></span>').appendTo(currentDiv);
        this.currentContent = $('<div style="margin-left: 30px"></div>').appendTo(currentDiv);
        this.box.append(currentDiv);
        //可选区域
        var optionalDiv = $('<div class="assetStatistics_optional"></div>');
        var optionalTitle = $('<span style="margin-left: 15px"><b>'+it.util.i18n('AssetStatistics_optionalConfig')+':</b></span>').appendTo(optionalDiv);
        this.optionalContent = $('<div style="margin-left: 30px"></div>').appendTo(optionalDiv);
        this.createSection(this.selectType[1],this.chartTypeArr).css('margin-top','10px').appendTo(this.optionalContent);
        this.getExtendFields();
        this.box.append(optionalDiv);
        
    },
    getExtendFields: function(){
        var self = this;
        var resArr = [];

        self.allFieldsArr.push({
            'columnName': 'businessType',
            'columnDisplayName': it.util.i18n('AssetStatistics_Business_type'),
            'chartType': self.getRandomChartType()
        });
        it.util.adminApi('custom_table','get',{"where":{"category":"equipment"}},
        function(customTableData){
            if(customTableData){
                var tableName = customTableData.tableName;
                it.util.adminApi('custom_column','find',{"where":{"table_name": tableName}},
                function(columnDatas){
                    if(columnDatas){
                        columnDatas.forEach(function(column){
                            var columnDisplayName = column.columnDisplayName ? column.columnDisplayName : column.columnName;
                            self.allFieldsArr.push({
                                'columnName': column.columnName,
                                'columnDisplayName': columnDisplayName,
                                'chartType': self.getRandomChartType()
                            })
                        });
                        self.createRestDom();
                    }
                });
            }else{
                self.createRestDom();
            }
        });
        
    },
    getRandomChartType: function(){
        var arr = this.chartTypeArr;
        var randomNum = Math.floor(Math.random()*arr.length);
        return arr[randomNum];
    },
    createRestDom: function(){
        //初始化加载数据
        //数据来自上一次保存到main.systemConfig的值，如果没有，则使用默认值

        var mainConf = main.systemConfig.asset_statistics_arr;
        if(Object.keys(mainConf).length){
            this.createAssetArea(mainConf,this.currentContent);
        }else{
            this.createAssetArea(this.allFieldsArr,this.currentContent);
        }
        this.createSection(this.selectType[0],this.allFieldsArr).prependTo(this.optionalContent);
        this.createBtn();
    },
    createAssetArea: function(datas,parent){
        var self = this;
        datas.forEach(function(data){
            self.createSelectedAsset(data['columnDisplayName']+'&&'+data['chartType']).appendTo(parent);
            self.sectionResults.push(data);
        });
    },
    createSelectedAsset: function(value){
        var self = this;
        var filterAsset = $('<span style="position:relative;margin:5px;display:inline-block;border:1px solid #ccc;padding:2px;text-align:center;">'+value+'</span>');
        filterAsset.on('click',function(event){
            event.stopPropagation();
             var close=$('<img src=' + pageConfig.url("/css/images/cancel.png") +' style="position:absolute;right:-5px;top:-5px;width:10px;height:10px;"/>')
            filterAsset.append(close);

            close.on('click',function(event){
                var spanVal = filterAsset.text();
                var resName = spanVal.split('&&')[0];
                for(var i=0;i<self.sectionResults.length;i++){
                    var section = self.sectionResults[i];
                    if(section.columnDisplayName == resName){
                        self.sectionResults.splice(i,1);
                        filterAsset.remove();
                        break;
                    }
                }
            });
            $(document).bind("click",function(){
                close.remove();
            })
        })
        return filterAsset;
    },
    createSection: function(sectionName,sectionData){
        var div = $('<div></div>');
        var title = $('<span style="margin-right: 5px">' + it.util.i18n('AssetStatistics_'+sectionName) +':</span>').appendTo(div);
        title.appendTo(div);
        
        var select = $('<select id = "' + sectionName + '" style="margin-top: 5px" select-type='+sectionName+'></select>');
        if(sectionName == 'StatisticalField'){
            sectionData.forEach(function(data){
                var option = $('<option value='+data.columnName+'>' + data.columnDisplayName + '</option>');
                select.append(option);
            });
        }else{
            sectionData.forEach(function(data){
                var option = $('<option value='+data+'>' + data + '</option>');
                select.append(option);
            });
        }
        
        select.appendTo(div);
        this.selectGroup.push(select);
        return div;
    },
    createBtn: function(){
        var self = this;
        var addBtn = $('<input type="button" value='+it.util.i18n('AssetStatistics_add_Config')+' style="margin-top: 10px">').appendTo(this.optionalContent);
        addBtn.on('click',function(event){
            var selectRes = self.getSelectContent();
            //判断当前输入是否重复
            var isRepeat = false;
            for(var i=0;i<self.sectionResults.length;i++){
                var section = self.sectionResults[i];
                if(section.columnName == selectRes[0]){
                    isRepeat = true;
                    break;
                }
            }
            if(!isRepeat){
                var columnDisplayName = self.getDisplayNameFromName(selectRes[0]);
                self.sectionResults.push({
                    'columnName': selectRes[0],
                    'columnDisplayName': columnDisplayName,
                    'chartType': selectRes[1]
                });
                var newSelected = self.createSelectedAsset(columnDisplayName+'&&'+selectRes[1]);
                self.currentContent.append(newSelected);
            }else{
                layer.msg(it.util.i18n('AssetStatistics_StatisticalField_unique'));
            }
        });
    },
    getDisplayNameFromName: function(name){
        var allFields = this.allFieldsArr;
        var displayName = '';
        for(var i=0;i<allFields.length;i++){
            var field = allFields[i];
            if(field['columnName'] == name){
                displayName = field['columnDisplayName'];
                break;
            }
        }
        return displayName ? displayName : name;
    },
    getSelectContent: function(){
        var self = this;
        var res = [];
        this.selectGroup.forEach(function(select){
            res.push($(select).val());
        });       
        return res.reverse();
    },
    clickForConfirm: function() {
        var self = this;
        var objData = {
            value: {
                asset_statistics_arr: jsonUtil.object2String(self.sectionResults),
            },
            options: {
                id: 'system',
            }
        };
        this.updateData(objData);
    },
    clickForSetDefaultValue: function() {
        this.currentContent.empty();
        this.createAssetArea(this.defaultArr,this.currentContent);
        var data = {
            value: {
                asset_statistics_arr: jsonUtil.object2String(this.defaultArr),
            },
            options: {
                id: 'system',
            }
        };
        this.updateData(data);
    },
    updateData: function(data)  {
        it.util.adminApi('config', 'update', data, function(result) {
            if (result.error) {
                console.error(result.error);
            }
        });
    },
    getId: function() {
        return 'assetStatistics';
    },
})