/**
 * 温度云图
 */
var $TempApp = function (sceneManager) {
    $Application.call(this, sceneManager);
    this.temInit = false;
};

mono.extend($TempApp, $Application, {
    create: function () {
       
        var tempMoreConfig = main.systemConfig.temp_more_config;
        if (dataJson.tem_blue || dataJson.tem_green || dataJson.tem_yellow || dataJson.tem_red) {
            var parms = {
                width: dataJson.tem_blue.parms.width,
                height: dataJson.tem_blue.parms.height,
                size: dataJson.tem_blue.parms.size,
                lineWidth: dataJson.tem_blue.parms.lineWidth,
                color: dataJson.tem_blue.parms.color,
                startX: dataJson.tem_blue.parms.startX,
                startY: dataJson.tem_blue.parms.startY,
                withUnit: dataJson.tem_blue.parms.withUnit,
                family: dataJson.tem_blue.parms.fontFamily,
                stroke: dataJson.tem_blue.parms.stroke,
                scaleX: dataJson.tem_blue.parms.scaleX,
                scaleY: dataJson.tem_blue.parms.scaleY,
            };
            if (dataJson.tem_blue) {
                it.Util.registerImg('tem_blue', dataJson.tem_blue.src, parms);
            }
            if (dataJson.tem_green) {
                it.Util.registerImg('tem_green', dataJson.tem_green.src, parms);
            }
            if (dataJson.tem_yellow) {
                it.Util.registerImg('tem_yellow', dataJson.tem_yellow.src, parms);
            }
            if (dataJson.tem_red) {
                it.Util.registerImg('tem_red', dataJson.tem_red.src, parms);
            }
        } else {
            var parms = {
                width: tempMoreConfig.canvasX,
                height: tempMoreConfig.canvasY,
                size: tempMoreConfig.font_size,
                lineWidth: tempMoreConfig.font_linewidth,
                color: tempMoreConfig.font_color,
                startX: tempMoreConfig.startX,
                startY: tempMoreConfig.startY,
                withUnit: tempMoreConfig.writeunit,
                family: tempMoreConfig.font_family,
                stroke: tempMoreConfig.stroke,
                scaleX: tempMoreConfig.billboardX,
                scaleY: tempMoreConfig.billboardY
            };
            it.Util.registerImg('tem_blue', tempMoreConfig.bluesrc, parms);
            it.Util.registerImg('tem_green', tempMoreConfig.greensrc, parms);
            it.Util.registerImg('tem_yellow', tempMoreConfig.yellowsrc, parms);
            it.Util.registerImg('tem_red', tempMoreConfig.redsrc, parms);
        }

        if (main.systemConfig.is_animate_tempfield == 'true') {
            this.app.isAnimate = true;
        } else {
            this.app.isAnimate = false;
        }
    },


    init: function () {
        if (this.temInit) {
            return;
        }
        var self = this;
        this.app = new it.TemperatureFieldManager(this.sceneManager);
        // this.app.showBillboard = function(){
        //     return false;
        // }
        this.app.tempFieldArr = main.systemConfig.temp_field_arr; //温度云图设置

        this.app.bgMap = dataJson.tempBgMap;
        this.app.getToFixed = function () {
            return parseInt(dataJson.temperatureToFixed) || 0;
        }

        if (dataJson.tempHighestValue) {
            this.app.highestValue = dataJson.tempHighestValue;
        }

        // if (dataJson.isAnimateTempField != undefined) { //只是为了不影响其他的原来的逻辑
        //     this.app.isAnimate = !!dataJson.isAnimateTempField;
        // }
        // if (main.systemConfig.is_animate_tempfield == 'true') {
        //     this.app.isAnimate = true;
        // }else{
        //     this.app.isAnimate = false;
        // }

        if (dataJson.tempApp_unVirtualCategorys && dataJson.tempApp_unVirtualCategorys.length > 0) {
            this.app.getNnVirtualCategorys = function () {
                return dataJson.tempApp_unVirtualCategorys;
            }
        }
        var oldShowBillboard = this.app.showBillboard;
        this.app.showBillboard = function (collector) {
            if (main.systemConfig.show_temphum_alarm == 'false') {
                return false;
            } else {
                return oldShowBillboard.call(self.app, collector);
            }
        }
        this.temInit = true;
        this.create();
        // this.app.virtualFilter.opacityValue = 0.50;
        // var self = this;
        // var filterMaterial = this.app.virtualFilter.filterMaterial;
        // this.app.virtualFilter.filterMaterial = function(originalMaterial,filterdMaterial,node){
        //     if (node && node instanceof mono.Plane) {
        //         return filterdMaterial;
        //     }
        //     var data = self.sceneManager.getNodeData(node);
        //     var category = self.sceneManager.dataManager.getCategoryForData(data);
        //     if (category && category.getId().toLowerCase() == 'room') {
        //         return filterdMaterial;
        //     }
        //     return filterMaterial.call(self.app.virtualFilter,originalMaterial,filterdMaterial,node);
        // }
        // this.app.isAnimate = false;
        // this.app._minValue = 5;
        // this.app._maxValue = 30;

    },

    resetCamera: function () {
        return true;
    },

    doShow: function () {
        var self = this;
        var fields = this.app.getCurrentSceneFields(), collectors = [];
        $.each(fields, function (index, val) {
            collectors = collectors.concat(val.getCollectors()._as);
        });
        main.RealtimeDynamicEnviroManager.monitorCollectorData(collectors, true);
        if (main.systemConfig) {
            this.app.bgMap = main.systemConfig.temp_alarm_config;
        }
        // this.create();
        // setTimeout(function () {
            self.app.show();
            self.showTempFieldInstanceCheckBox();
        // }, 100)
    },

    doClear: function () {
        this.app.hide();
        this.clearTempFieldInstanceDiv();
        main.RealtimeDynamicEnviroManager.clearMonitorData(true);
    },

    clearTempFieldInstanceDiv: function () {
        // var div = $('#tempApp_tempInstance_table');
        // if (div) {
        //     div.empty();
        // }
        var rootView = $(this.sceneManager.network3d.getRootView());
        if (!rootView.tempLegend) {
            return;
        }
        rootView.tempLegend('destroy');
    },

    /**
     *
     * 当同一个场景(currentScene)中有多个温度云图实例时，这里将提供一个温度云图的filter来确定哪些显示哪些不显示
     * 
     */
    showTempFieldInstanceCheckBox: function () {
        var tempBoards = this.app.tempBoards;
        var rootView = $(this.sceneManager.network3d.getRootView());
        // var filterDiv = this.createFilterDiv(tempBoards);
        // filterDiv.appendTo(rootView);
        var self = this;
        if (!rootView.tempLegend) {
            return;
        }
        rootView.tempLegend({
            items: Object.keys(tempBoards),
            click: function (e, param) {
                var tempBoard = self.app.tempBoards[param.id];
                tempBoard.setVisible(!!param.show);
            }
        });
    },

    createFilterDiv: function (tempBoards) {
        if (!tempBoards) {
            return null;
        }
        // var div = $('<div class="data-nav"></div>');
        var div = $('#tempApp_tempInstance_table');
        if (!div || div.length < 1) {
            div = $('<table id="tempApp_tempInstance_table" class="tempApp_tempInstance_table"></table>');
        }
        div.empty();
        // var ul = $('<ul class="list-group"></div>');
        // div.append(ul);
        for (var id in tempBoards) {
            var tempBoard = tempBoards[id];
            var item = this.createFilterItem(id);
            div.append(item);
        }
        return div;
    },

    createFilterItem: function (id) {
        var tempBoard = this.app.tempBoards[id];
        var tId = id, self = this;
        var item = HTMLUtil.createCheckBox(id, id, true, function (e) {
            tempBoard.setVisible(!!e);
            self.setTempBillboardVisibleByTempId(tId, !!e);
        });
        var row = $('<tr></tr>');
        row.append(item);
        return row;
    },

    setTempBillboardVisibleByTempId: function (tId, visible) {
        if (!tId) {
            return;
        }
        var tfs = this.sceneManager.dataManager.getTemperatureFields();
        if (!tfs) {
            return;
        }
        var tFeild = tfs[tId];
        if (!tFeild) {
            return;
        }
        var collectors = tFeild.getCollectors();
        if (!collectors || collectors.size() < 1) {
            return;
        }
        for (var i = 0; i < collectors.size(); i++) {
            var collector = collectors.get(i);
            if (collector && this.app.tempBillbords && this.app.tempBillbords[collector.getId()]) {
                this.app.tempBillbords[collector.getId()].setVisible(visible);
            }
        }
    }

});

fa.TempApp = $TempApp;