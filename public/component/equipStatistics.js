(function($){
    $.widget('hud.equipStatistics',{
        options: {
            allEquipments: [],
            statisticsCates: ['brand','businesType'],
            statisticsCharts: ['echart-pie','twaver-pie'],
            statisticsTitles: ['品牌','业务类型'],
            colorList: ['#0076a7', '#5fc4a6', '#e69009', '#50588c', '#a4559f', '#bc4545'],
            echartPie: {
                title: {
                    text: it.util.i18n("EquipStatisticManager_brand"),
                    x: 10,
                    y: 20,
                    textStyle: {
                        color: "rgba(192, 192, 192, 1)",
                        fontSize: 18
                    }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: function(params,index){
                        return params.name+': '+params.value+'('+Math.round(params.percent)+'%)';
                    }
                },
                series: [
                    {   
                        type: 'pie',
                        radius: '46%',
                        center: ['50%', '60%'],
                        data: [
                            {
                                value: 335,
                                name: 'IBM',
                                // itemStyle: {
                                //     normal: {
                                //         color: 'rgba(246, 142, 0, 1)'
                                //     }
                                // }
                            },
                            {
                                value: 310,
                                name: 'Cisco'
                            },
                            {
                                value: 234,
                                name: 'DELL'
                            }
                        ],
                        itemStyle: {
                            emphasis: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            },
            echartBar: {
                title: {
                    text: it.util.i18n("EquipStatisticManager_businessType"),
                    x: 10,
                    y: 20,
                    textStyle: {
                        color: "rgba(192, 192, 192, 1)",
                        fontSize: 18
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    },
                    formatter: function (params) {
                        var tar = params[0];
                        return tar.name + ' : ' + tar.value;
                    }
                },
                grid: {
                    left: '15%',
                    right: '5%',
                    top: '30%',
                    bottom: '20%'
                },
                xAxis: {
                    type: 'category',
                    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: '#353937'
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#807d78'
                        }
                    },
                },
                yAxis: {
                    type: 'value',
                    splitLine: {
                        lineStyle: {
                            color: '#353937'
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#807d78'
                        }
                    },
                },
                series: [{
                    data: [120, 200, 150, 80, 70, 110, 130],
                    type: 'bar',
                    barWidth: '30'
                }]
            },
            twaverPie: {
                title: {
                    name: '使用客户',
                    font: 'bold 18px 微软雅黑,sans-serif',
                    color: 'rgba(192, 192, 192, 1)',
                    location: [50,20]
                },
                pie: {
                    data: [
                        {
                            name:'中国移动',
                            value: 200
                        },
                        {
                            name:'中国电信',
                            value: 100
                        },
                        {
                            name:'华为',
                            value: [
                                {
                                    name: '荣耀',
                                    value: 36
                                },
                                {
                                    name: 'Mate',
                                    value: 56
                                }
                            ]
                        },
                        {
                            name:'中兴',
                            value: 20
                        }, 
                        {
                            name: '其它',
                            value: [
                                {
                                    name: '南方电网',
                                    value: 30
                                },
                                {
                                    name: '福建广电',
                                    value: 40
                                },
                                {
                                    name: '浙江大港',
                                    value: 50
                                }
                            ]
                        }
                    ],
                    spacing: 100,
                    font: '12px "Microsoft Yahei"',
                    color: '#d5d2cd',
                    location: [0,20]
                }
            }
        },

        _create: function(){
            // 给6个颜色，按顺序去取
            // 传入的数据，如果大于6种，则按种类数量取前5种，剩下的取第6种
            var self = this;
            this.searchGroup = {};
            this.currentEquipments = [];
            this.businessTypeMap = main.sceneManager.dataManager._businessTypeMap;
            this.wrap = $('<div class="equipStatistics_wrap"></div>').appendTo(self.element);
            this.containerDiv = $('<div class="equipStatistics_container"></div>').appendTo(this.wrap);
            this.inputFieldData = {};
            this.createBody();
            this.createBtn().appendTo(this.wrap);
        },
        createBody: function(){
            var self = this;
            if(this.options.statisticsCates){
                this.options.statisticsCates.forEach(function(cate,index){
                    var curChart = self.options.statisticsCharts[index];
                    //先创建多个特定div，和传数据时的名称一致
                    var createDiv = self[cate+'CreatedDiv'] = $('<div></div>').addClass('equipStatistics_generalDiv equipStatistics_'+cate+'Div').appendTo(self.containerDiv);
                    //给不同位置div设置定位
                    self.setDivPos(createDiv,index);
                    if(curChart.toLowerCase() != 'twaver-pie'){
                        if(!self[cate+'InitedEchart']){
                            self[cate+'InitedEchart'] = echarts.init(createDiv[0]);
                        }    
                    }                          
                })
            }
        },
        createBtn: function(){
            var self = this;
            var listBtn = $('<span class="equipStatistics_listBtn">'+it.util.i18n('EquipStatisticManager_list')+'</span>');
            listBtn.on('click',function(){
                //只能创建一次twaver，并且时机要在所有dom加载完毕
                if(!self._dialog){
                    self.createListDialog();
                }    
                self.setSelectionCss();
                self.queryListDialog(1);        
                self._dialog.dialog('open');
            });
            return listBtn;
        },

        createListDialog: function(){
            var self = this;
            var allEquipments = this.options.allEquipments;
            this.currentEquipments = allEquipments;
            this._dialog = $('<div id="equipStatisticsListDialog"></div>').appendTo($(document.body));
            var totalCount,pageSize,totalPage,pageBox;  
            pageBox = this.pageBox = $('<div class="pagerBox"></div>');
            this.pageSize = 20;

            this.createSearchBox().appendTo(this._dialog);  
            this.createDialogContent(this._dialog);

            pageBox.appendTo(this._dialog);
            this.pageBox.pager(function(pageIndex){
                self.queryListDialog(pageIndex);
            }); 
            this._dialog.dialog({ //创建dialog弹窗
                blackStyle: true,
                width: 'auto',
                height: 'auto',
                title: it.util.i18n("EquipStatisticManager_list"),
                autoOpen: false, //初始化之后，是否立即显示对话框，默认为 true
                show: '', //显示弹窗出现的效果，slide为滑动效果
                hide: '', //显示窗口消失的效果，explode为爆炸效果
                resizable: false, //设置是否可拉动弹窗的大小，默认为true
                modal: true,
            });

            //导入数据
            // this.queryListDialog(1);
            return this._dialog;
        },
        setSelectionCss: function(){
            var self = this;
            //给s下拉框设置样式
            var w = document.body.clientWidth,
            nw, nh;
            if (w < 1440) {
                // nw = 880 / 1246;
                nw = w / 1246 * 0.8 * 0.75;
            } else if (w >= 1440 && w < 1919) {
                // nw = 880 / 1246;
                nw = w / 1246 * 0.8 * 0.8;
            } else if (w >= 1919) {
                nw = 1;
                //174 200 100 115 110 174 48
            }
            for(var s in this.searchGroup){
                //使用select2组件
                var select = this.searchGroup[s];
                var selectId = select.attr('name').replace('select_','');
                var select2_option = {
                    templateResult: formatState,
                    templateSelection: formatState,
                    minimumResultsForSearch: -1,
                    dropdownAutoWidth: true,
                    dropdownCssClass: 'bigdrop',
                    //theme: 'bootstrap',  //主题
                };
                select2_option.width = 150 * nw + 'px';
                select2_option.dropdownParent = $('#modal_'+selectId);
                select.select2(select2_option);
                
            }
            function formatState(state) {
                var text = state.text;
                if (text.indexOf('123') != '-1') {
                    var strs = text.split('123');
                    var name = strs[0],
                        color = strs[1];
                    var $span = $("<span style = 'width:7px;height:13px;display:inline-block;margin:0px 5px 0px 0px'></span>");
                    $span.css({
                        'background-color': color,
                    });
                } else {
                    var name = text,
                        color = null;
                }
                var $state = $("<span>" + name + "</span>");
                $state.css({
                    'font-size': '14px',
                });
                if ($span !== undefined) {
                    $state.prepend($span);
                }
                return $state;
        
            };
        },
        createSearchBox: function(){
            this.searchBox = $('<div class="searchBox"></div>');
            var serachTable = $('<table></table>').appendTo(this.searchBox);
            this.createSearchInputs().appendTo(serachTable);
            return this.searchBox;
        },
        createSearchInputs: function(){
            var self = this;
            var tr = $('<tr></tr>');
            var fieldData = this.inputFieldData;
            for(var field in fieldData){
                this.createSearchInput(field,fieldData[field]).appendTo(tr);
            }
            this.createSubmitInput().appendTo(tr);
            return tr;
        },
        createSearchInput: function(id,values){
            var name = id;
            var displayName = this.getDisplayNameFromName(name);
            var td = $('<td class="searchItems mytd">\
                    <span class="name">'+displayName+':</span><br>\
                    <span>\
                        <div id="modal_'+id+'" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">\
                            <select class="select_'+id+'" name="select_'+id+'">\
                            </select>\
                        </div>\
                    </span>\
                </td>');

            var select = td.find('select');
            var option = $('<option value=""> - '+it.util.i18n('EquipStatisticManager_all')+' -</option>').appendTo(select);
            values.forEach(function(val){
                var option = $('<option value="'+val+'"> - '+val+' -</option>').appendTo(select);
            });
            if(!this.searchGroup[id]){
                this.searchGroup[id] = select; 
            }
            return td;
        },
        createSubmitInput: function(){
            var self = this;
            var td = $('<td class="searchItems mytd">\
                    <br>\
                    <span class="searchButtonBox fs13">\
                        <button class="searchButton">'+it.util.i18n('EquipStatisticManager_search')+'</button>\
                    </span>\
                </td>');
            td.find('span').on('click',function(){
                self.currentEquipments = self.options.allEquipments;;
                var subValues = {};
                for(var i in self.searchGroup){
                    var sName = self.searchGroup[i].attr('name');
                    var selectName = sName.replace('select_','');
                    subValues[selectName] = self.searchGroup[i].val();
                }
                self.getEquipmentsByConditions(self.currentEquipments,subValues);            
            });
            return td;
        },
        getEquipmentsByConditions: function(datas,conditions){
            //过滤掉不符合条件的 业务类型、扩展
            var self = this;
            var cates = this.options.statisticsCates;
            this.currentEquipments = [];
            datas.forEach(function(data,index){
                var conditionsFlag = [];
                for(var con in conditions){
                    if(!conditions[con]){
                        conditionsFlag.push(1);
                    }else{
                        if(conditions[con] == it.util.i18n('EquipStatisticManager_unnamed')){
                            if(data._userDataMap){
                                if(data._userDataMap[con]){
                                    conditionsFlag.push(0);
                                }else{
                                    conditionsFlag.push(1);
                                }
                            }else{
                                conditionsFlag.push(1);
                            }
                        }else{
                            if(con == 'businessType'){
                                var dataBtName;
                                var businessTypeMap = main.sceneManager.dataManager._businessTypeMap;
                                for(var bt in businessTypeMap){
                                    if(bt == data._businessTypeId){
                                        dataBtName =  businessTypeMap[bt]._name;
                                        break;
                                    }
                                }
                                if(dataBtName == conditions[con]){
                                    conditionsFlag.push(1);
                                }else{
                                    conditionsFlag.push(0);
                                }                       
                            }else{
                                //拓展是否匹配
                                var dataUp = data._userDataMap;
                                var uFlag = false;
                                for(var up in dataUp){
                                    if(dataUp[up] == conditions[con]){
                                        uFlag = true;
                                        break;
                                    }
                                }
                                if(uFlag){
                                    conditionsFlag.push(1);
                                }else{
                                    conditionsFlag.push(0);
                                }
                            } 
                        }
                        
                    }
                }
                if(conditionsFlag && conditionsFlag.length){
                    var conFlag = conditionsFlag.every(function(con){
                        return con == 1;
                    })
                    if(conFlag){
                        self.currentEquipments.push(data);
                    }
                }    
            });
            this.queryListDialog(1);
        },
        createDialogContent: function(dialog){
            var self = this;
            var box = this.contentBox = new twaver.ElementBox(); 
            var network = new twaver.vector.Network(box); 
            var table = new twaver.controls.Table(box);                
            var tablePane = new twaver.controls.TablePane(table); 
            var tableDom = tablePane.getView();
            
             //计算内容高度
            
            this.createColumns(table);
            //改变表内容样式
            var originalRenderCell = table.renderCell;
            table.setRowHeight(30);
            table.renderCell = function (params) {
                originalRenderCell(params);
                var div = params.div;
                var scrollDiv = div.parentNode.parentNode.parentNode.parentNode;
                var scrollParentDiv = div.parentNode.parentNode.parentNode.parentNode.parentNode;
                scrollDiv.style.overflowX = 'hidden';
                scrollDiv.style.width = '100%';
                scrollDiv.className = 'bt-scroll';
                scrollParentDiv.style.overflow = 'hidden';
                params.div.style.textAlign = 'center';
                params.div.style.border = 'none';
                params.div.parentNode.style.width = '99.9999%';
                if (params.rowIndex % 2 == 0) {
                    params.div.parentNode.style.backgroundImage = '-webkit-linear-gradient(top, rgba(58, 58, 58, 0.5), rgba(58, 58, 58, 0.5))';
                } else {
                    params.div.parentNode.style.backgroundImage = '-webkit-linear-gradient(top, rgba(48, 48, 48, 0.5), rgba(48, 48, 48, 0.5))';
                }
                self.pagerContentWidth = table._view.firstChild.firstChild.style.width;
            }

            table.renderData = function (div, data, row, selected) {
                var columns = this._columnBox.getRoots();
                var count = columns.size();
                var sumWidth = 0;
                var hpx = this._rowHeight - this._rowLineWidth + 'px';

                var style;
                for (var i = 0; i < count; i++) {
                    var column = columns.get(i);
                    var width = column.getWidth();
                    if (width < 0) width = 0;
                    var columnLineWidth = Math.min(this._columnLineWidth, width);

                    if (column.isVisible()) {
                        var cell = this._cellPool.get();
                        style = cell.style;
                        style.position = 'absolute';
                        style.whiteSpace = 'nowrap';
                        style.verticalAlign = 'middle';
                        style.textAlign = column.getHorizontalAlign();
                        style.overflow = 'hidden';
                        style.textOverflow = 'ellipsis';
                        style.left = sumWidth + 'px';
                        style.width = width - columnLineWidth + 'px';
                        style.height = hpx;

                        div.appendChild(cell);
                        var params = {
                            data: data,
                            value: this.getValue(data, column),
                            div: cell,
                            view: this,
                            column: column,
                            rowIndex: row,
                            selected: selected,
                        }
                        this.renderCell(params);
                        this.onCellRendered(params);
                        sumWidth += width;
                    }
                }

                style = div.style;
                style.width = sumWidth + 'px';
                style.height = hpx;
                style.border = 'none';

                backgroundColor = (row % 2 == 0) ? 'rgba(84, 138, 160, 1.0)' : 'rgba(94, 148, 170, 1.0)'
                style.backgroundColor = ((this.isCheckMode() && this._focusedRow === row) || (!this.isCheckMode() && selected)) ? backgroundColor : '';
                style.border = ((this.isCheckMode() && this._focusedRow === row) || (!this.isCheckMode() && selected)) ? '1px solid #00f6ff' : '';
                style.color = ((this.isCheckMode() && this._focusedRow === row) || (!this.isCheckMode() && selected)) ? '#ffffff' : '';
            }

            var renderCell = table.renderCell;

            table.renderCell = function (params) {
                setTimeout(function () {
                    renderCell.call(table, params)
                }, 10);
            };
            var tableHeader = tablePane.getTableHeader().getView();
            tablePane.getTableHeader().setHeight(30);
            tableHeader.style.backgroundColor = 'rgba(63, 63, 63, 0)';
            tableHeader.firstChild.style.backgroundColor = '#2a2a2a';
            var tablePaneView = tablePane.getTable().getView();
            tablePaneView.firstChild.firstChild.style.background = 'rgba(48, 48, 48, 1.0)';
            //获取所有列的宽度，使得表格自适应
            var tWidth = table.calculateSumWidth();
            $(tableDom).css({
                'width': tWidth+'px',
                'height': '400px',
                'background': 'rgb(65, 66, 65)'
            }).addClass('EquipStatisticManager_table');
            var tableWidth = $(tableDom).width();
             var tableHeight = $(tableDom).height();
             var tableWrapper = $('<div id="equipListBox"></div>').css({
                 'width': tableWidth,
                 'height': tableHeight
             }).append($(tableDom)).appendTo(dialog);

            
            //不能在这里调用pager，因为组件还没初始化
            return tableWrapper;
        },
        refreshListDialog: function(equipList){
            this.contentBox.clear();
            //['id','name','businessType',dataType','parent','location']
            if (equipList) {
                for (var i = 0; i < equipList.length; i++) {
                    var equip = equipList[i]
                    var node = new twaver.Node();
                    for (var attribute in equip) {
                        if (attribute === "_id") {
                            node.setClient("equipStatistics_id", equip._id);
                        } else if (attribute === "_name") {
                            node.setClient("equipStatistics_name", equip._name);
                        } else if (attribute === "_businessTypeId") {
                            var aName = equip[attribute];
                            node.setClient("equipStatistics_businessType", this.getBusinessNameById(aName));
                        } else if (attribute === "_dataTypeId") {
                            var dataTypeId = equip[attribute];
                            var dataType = main.sceneManager.dataManager.getDataTypeById(dataTypeId);
                            node.setClient("equipStatistics_dataType", dataType._description);
                        } else if (attribute === "_parentId") {
                            var parentId = equip[attribute];
                            var parentData = main.sceneManager.dataManager.getDataById(parentId);
                            var pName = parentData._name ? parentData._name : parentData._id;
                            node.setClient("equipStatistics_parent", pName);
                        } else if(attribute === "_location"){
                            var fLocation,size,tLocation,resU,dt;
                            if(equip[attribute] && equip[attribute].y){
                                fLocation = parseInt(equip[attribute].y);
                            }else{
                                fLocation = 0;
                            }
                            dt = main.sceneManager.dataManager.getDataTypeForData(equip);
                            if(dt._size && dt._size.ySize){
                                size = parseInt(dt._size.ySize);
                            }else{
                                size = 0;
                            } 
                            tLocation = fLocation + size;
                            resU = fLocation+'U-'+tLocation+'U';
                            node.setClient("equipStatistics_location", resU);
                        }else if(attribute === "_userDataMap"){
                            var userMap = equip[attribute];
                            var statisticsCates = this.options.statisticsCates;
                            for(var um in userMap){
                                if(statisticsCates.indexOf(um) != -1){
                                    node.setClient('equipStatistics_'+um,userMap[um]);
                                }
                            }
                        }
                    }
                    this.contentBox.add(node);
                }
            }
            
        },
        queryListDialog: function (pageIndex) {
            //传递数据
            var self = this;
            var allEquipments = this.currentEquipments;
        
            var listDialog = $('#equipStatisticsListDialog');
            if (!pageIndex) {
                pageIndex = listDialog.find('.pagerBox').pager('currPage');
            }
            var pageSize = listDialog.find('.pagerBox').pager('pageSize');
            listDialog.find('.pagerBox').pager('options', {
                totalCount: parseInt(allEquipments.length),
                currPage: pageIndex,
                pageSize: self.pageSize
            });
            
            this.refreshListDialog(allEquipments.slice(20*(pageIndex-1),20*pageIndex));
        },
        createColumns: function(table){
            var self = this;
            var equipInfoIdList = ['id','name','dataType','parent','location'];
            var equipInfoNameList = [];
            this.options.statisticsCates.forEach(function(cate){
                if(cate == 'businessType'){
                    equipInfoIdList.splice(2,0,cate);
                }else{
                    equipInfoIdList.push(cate);
                }
            });
            //扩展的字段不用翻译
            var extCateLen = this.options.statisticsCates.length - 1;
            equipInfoNameList = equipInfoIdList.map(function(id,index,array){
                if(index < (array.length - extCateLen)){
                    return it.util.i18n('EquipStatisticManager_Info_'+id);
                }else{
                    var extName = self.getDisplayNameFromName(id);
                    return extName;
                }
            });

            equipInfoIdList.forEach(function(id,ind){
                self.createColumn(table,equipInfoNameList[ind],'equipStatistics_'+id,'client','string');
            });
        },
        getDisplayNameFromName: function(name){
            var mainConfg = main.systemConfig.asset_statistics_arr;
            var displayName = '';
            for(var i=0;i<mainConfg.length;i++){
                var con = mainConfg[i];
                if(con.columnName == name){                  
                    displayName =  con.columnDisplayName;
                    break;
                }
            }
            if(!displayName){
                return name;
            }else{
                return displayName
            }
        },
        createColumn: function (table, name, propertyName, propertyType, valueType, renderCell, editable) {
            var self = this;
            var w = document.body.clientWidth,
            nw, nh, scrollDivWidth;
            if (w < 1440) {
                nw = 915 / 1240;
                scrollDivWidth = 1000;
            } else if (w >= 1440 && w < 1920) {
                nw = 915 / 1240;
                scrollDivWidth = 1000;
            } else if (w >= 1920) {
                nw = 1;
                scrollDivWidth = 1250;
            }
            nw = w / 1240 * 0.8;
            var column = new twaver.Column(name);
            var pn = propertyName.replace('equipStatistics_','');
            var colWidth = 0;
            switch (pn){
                case 'id':
                    colWidth = 80;
                    break;
                case 'name':
                    colWidth = 130;
                    break;
                case 'businessType':
                    colWidth = 80;
                    break;
                case 'dataType':
                    colWidth = 150;
                    break;
                case 'parent':
                    colWidth = 130;
                    break;
                default:
                    colWidth = 110;
            }
            column.setWidth(colWidth*nw);
            column.setName(name);
            column.setPropertyName(propertyName);
            column.setPropertyType(propertyType);
            if (valueType) column.setValueType(valueType);
            column.setEditable(editable);
            column.renderHeader = function (div) {
                var span = document.createElement('span');
                span.style.whiteSpace = 'nowrap';
                span.style.verticalAlign = 'middle';
                span.style.padding = '1px 2px 1px 2px';
                span.innerHTML = this.getName() ? this.getName() : this.getPropertyName();
                span.setAttribute('title', span.innerHTML);
                span.style.font = 'bold 12px Helvetica';
                div.style.textAlign = 'center';
                div.style.backgroundImage = 'none'
                div.style.border = 'none';
                div.appendChild(span);
            };
            if (renderCell) {
                column.renderCell = renderCell;
            }
            table.getColumnBox().add(column);
            return column;
        },
        setDivPos: function(div,index){
            var left = 0, top = 0;
            switch(index){
                case 0:
                    left = 25;
                    top = 10;
                    break;
                case 1:
                    left = 475;
                    top = 10;
                    break;
                case 2:
                    left = 25;
                    top = 260;
                    break;
                case 3:
                    left = 475;
                    top = 260;
                    break;
                default:
                    break;
            }
            $(div).css({
                'left': left,
                'top': top
            });

        },
        createTwaver: function(div,options){
            if(!div) return;
            if(!options) return;
            var containerWidth,containerHeight,containerTop,containerLeft;
            containerWidth = this.getStyle(div,'width');
            containerHeight = this.getStyle(div,'height');
            containerTop = this.getStyle(div,'top');
            containerLeft = this.getStyle(div,'left');

            var title,datas,pieSpacing,pieFont,pieColor,pieLocation,titleFont,titleColor,titleLocation;
            datas = options.pie.data;
            title = options.title.name;
            pieSpacing = options.pie.spacing;
            pieFont = options.pie.font;
            pieColor = options.pie.color;
            pieLocation = options.pie.location;
            titleFont = options.title.font;
            titleColor = options.title.color;
            titleLocation = options.title.location;

            twaver.Util.registerImage('pie_node', {		
                w: '<%=getClient("level")*'+pieSpacing+'+100%>',
                h: '<%=getClient("level")*'+pieSpacing+'+100%>',
                scale: function(data, view){
                    return { x: data.getClient('scale'), y: data.getClient('scale') };
                },
                lineWidth:2,
                fill: '<%=getClient("color")%>',
                lineColor: '#2f3030',
                lineWidth: '3',
                v: [{
                    shape: 'circle',
                    r:'<%=getWidth()/3%>',
                    startAngle: '<%=getClient("direction")-getClient("range")/2%>',
                    endAngle: '<%=getClient("direction")+getClient("range")/2%>',
                    close: '<%=getClient("level")>0%>',
                },{
                    shape: 'text',
                    text: function(data,view){
                        var words = data.getClient('text');
						if(words.length > 3){
							return words.substring(0,3) + '...';
						}else{
							return words;
						}
                    },
                    textAlign: 'center',
                    textBaseline: 'middle',
                    font: pieFont,
                    fill: pieColor,
                    rotate: function(data, view){
                        if(data.getClient('level')==0) return 0;
                        return data.getClient('direction');
                    },
                    x: function(data, view){
                        var text = data.getClient('text');
                        if(text.length > 3){
                            text = text.substring(0,3) + '...';
                        }
                        var textWidth = _twaver.g.getTextSize('13px "Microsoft Yahei"',text).width*1.5;
                        if(data.getClient('level')==0) return 0;
                        var direction=data.getClient('direction');
                        return (data.getWidth() - 100 + textWidth)/3*Math.cos(Math.PI*direction/180);
                            
                
                    },
                    y: function(data, view){
                        var text = data.getClient('text');
                        if(text.length > 3){
                            text = text.substring(0,3) + '...';
                        }
                        var textWidth = _twaver.g.getTextSize('13px "Microsoft Yahei"',text).width*1.5;
                        if(data.getClient('level')==0) return 0;
                        var direction=data.getClient('direction');
                        return (data.getWidth() - 100 + textWidth)/3*Math.sin(Math.PI*direction/180);
                    },
                    rotateOrigin: function(data, view){
                        var text = data.getClient('text');
                        if(text.length > 3){
                            text = text.substring(0,3) + '...';
                        }
                        var textWidth = _twaver.g.getTextSize('13px "Microsoft Yahei"',text).width*1.5;
                        if(data.getClient('level')==0) return 0;
                        var direction=data.getClient('direction');
                        var x = (data.getWidth() - 100 + textWidth)/3*Math.cos(Math.PI*direction/180);
                        var y = (data.getWidth() - 100 + textWidth)/3*Math.sin(Math.PI*direction/180);
                        return {x: x, y: y};
                    },
                    visible: '<%=getClient("scale")>0%>',
                }],
            });
            var box = new twaver.ElementBox();
            var network = new twaver.vector.Network(box);
            //禁止network拖拽
            network._dragToPan = false;
            //禁止node移动
            network.setMovableFunction(function(node){return false;});
            //禁止选中框
            network.setRectSelectEnabled(false);
            //禁止缩放
            network.setZoom(1);
            //禁止滚动条
            network.setWheelToZoom(false);
            //隐藏滚动条
            network.setScrollBarVisible(false);
            var tooltip = initTooltip();
            $('.equipStatistics_twaverTip').css({
                'position': 'absolute',
                'white-space': 'nowrap',
                'background':'rgba(50, 50, 50, 0.7)',
                'boder-style': 'solid',
                'border-width': '0px',
                'border-radius': '4px',
                'boder-color': 'rgb(51, 51, 51)',
                'color': 'rgb(255,255,255)',
                'font-size': '14px',
                'font-family': 'Microsoft YaHei',
                'line-height': '21px',
                'padding': '5px',
                'color': '#fff',
                'z-index': '9999999999',
                'transition': 'left 0.4s cubic-bezier(0.23, 1, 0.32, 1), top 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
            });
            network.getView().addEventListener('mousemove', function(e) {
                var node = network.getElementAt(e);
                if(node && node.getClient('twaverType') == 'twaver-pie' && node.getClient('level') > 0){
                    var posX = e.clientX ? e.clientX : 0;
                    var posY = e.clientY ? e.clientY : 0;
                    var text = node.getClient('text') || '';
                    var value = node.getClient('textValue') || '';
                    tooltip.innerHTML = text+' : '+value;
                    tooltip.style.left = posX  + 15 + "px";
                    tooltip.style.top = posY  + "px";
                    network.onMouseEnter = function(node, e) {
                        tooltip.style.display = 'block';
                        network.getView().style.cursor = 'pointer';
                    };
                    network.onMouseLeave = function(node, e) {
                        tooltip.style.display = 'none';
                        network.getView().style.cursor = 'default';
                    };
                }			
            });
            init();
            return box;
            function init() {
                div.appendChild(network.getView());	
                var boxLeft,boxTop,boxWidth,boxHeight;
                boxWidth = containerWidth ? Number(containerWidth.replace('px','')) : 500;
                boxHeight = containerHeight ? Number(containerHeight.replace('px','')) : 500;
                network.adjustBounds({x:0,y:0,width:boxWidth,height:boxHeight});
                network.addInteractionListener(function(e) {
                    if(e.kind == "clickElement" && network.isSelected(e.element)) {
                        showPie(e.element);
                    }
                });
        
                box.getLayerBox().add(new twaver.Layer('2'));
                box.getLayerBox().add(new twaver.Layer('1'));
                box.getLayerBox().add(new twaver.Layer('0'));   
                createPieTitle(box);
                createPieChart(box, datas,boxWidth/2+pieLocation[0],boxHeight/2+pieLocation[1]);
            }
            function initTooltip() {
                var div = document.createElement('div');
                div.className = 'equipStatistics_twaverTip';
                document.body.appendChild(div);
                div.style.display = 'none';
                div.style.zIndex = 100;
                return div;
            }
            function createPieTitle(box){
                var node = new twaver.Node();
                node.setSize(0,0);
                node.setName(title);
                box.add(node);
                node.setLocation(titleLocation[0],titleLocation[1]);
                node.s('label.font',titleFont);
                node.s('label.color',titleColor);
            };
            function createPieChart(box, datas , x, y){
                //根据传入的数据绘制饼图		
                var nodes=[];
                var gap=5;
                var outerGap = gap*datas.length;
                var totalValue=0;
                for(var i=0;i<datas.length;i++){
                    if(typeof datas[i].value == 'number'){
                        totalValue += datas[i].value;
                    }
                    if(Array.isArray(datas[i].value)){
                        for(var j=0;j<datas[i].value.length;j++){
                            totalValue += datas[i].value[j].value;
                        }
                    }
                }
        
                var node = createPieNode(x, y, 0, 0, 360, '#386fa1');
                box.add(node);
                nodes.push(node);
                
                var startAngle=0;
                for(var i=0;i<datas.length;i++){
                    var outerAngle, direction;
                    if(typeof datas[i].value == 'number'){
                        outerAngle = datas[i].value/totalValue*(360-outerGap);
                        direction = startAngle + outerAngle/2;
                        var child = createPieNode(x, y, 1, direction, outerAngle, '#10c9a2',datas[i].name,datas[i].value);
                        box.add(child);			
                        nodes.push(child);
                    }
                    if(Array.isArray(datas[i].value)){
                        var subValue = 0,subAngles = [],partAngle;
                        for(var j=0;j<datas[i].value.length;j++){
                            subValue += datas[i].value[j].value;
                        }
                        outerAngle = subValue/totalValue*(360-outerGap);
                        partAngle = outerAngle - gap*2;
                        direction = startAngle + outerAngle/2;
                        var child = createPieNode(x, y, 1, direction, outerAngle, '#10c9a2',datas[i].name,subValue);
                        child.setParent(node);
                        box.add(child);			
                        nodes.push(child);
                        var innerStartAngle = direction;
                        for(var j=0;j<datas[i].value.length;j++){
                            var innerGap = gap*(datas[i].value.length-1);
                            var innerAngle = datas[i].value[j].value/subValue*(partAngle-innerGap);
                            var innerDirection = innerStartAngle - (partAngle - innerAngle)/2;
                            var grandson = createPieNode(x, y, 2, innerDirection, innerAngle, '#fa8903',datas[i].value[j].name,datas[i].value[j].value);	
                            grandson.setParent(child);
                            grandson.setClient('scale', 0);
                            box.add(grandson);
                            nodes.push(grandson);
                            innerStartAngle += innerAngle + gap;
                        }
                    }
                    startAngle += outerAngle + gap;
                }
                
                //remember each other.
                for(var i=0; i<nodes.length;i++){
                    nodes[i].setClient('nodes', nodes);
                }
            }
        
            function createPieNode(x, y, level, direction, range, color, name ,value){
                var node = new twaver.Follower();
                node.setClient('twaverType','twaver-pie');
                node.setClient('selectDisabled','true');
                node.setLocation(x,y);		
                node.setClient('level', level);
                node.setLayerId(level);
                node.setClient('direction', direction);
                node.setClient('range', range);
                node.setImage('pie_node');
                node.setStyle('select.style', 'none');
                node.setClient('color', color);
                node.setClient('scale', 1);
                node.setCenterLocation(x,y); 
                node.setClient('textValue',value);
                // node.setName(name);
                if(level==0){
                    node.setClient('text', title);
                }else{
                    node.setClient('text',name);
                };
                return node;
            }
        
            function showPie(node){
                if(node.getClient('level')!=1){
                    return;
                }		
                var direction=node.getClient('direction');
                direction = direction % 360;
                if(direction==0){
                    return;
                }
                var offset=360 - direction % 360;
                if(offset==0){
                    return;
                }
                if(offset>180){
                    offset=offset-360;
                }
        
                //finish all current on going animations.
                twaver.Util.stopAllAnimates(true);
                
                //reset grandson.
                resetGrandson(node);
        
                var nodes=node.getClient('nodes');
                for(var i=0;i<nodes.length;i++){
                    var thisNode=nodes[i];
                    if(thisNode.getClient('level')>0){	
                        var oldDirection=thisNode.getClient('direction');
                        var newDirection=oldDirection+offset;
        
                        var animateRotate=new twaver.Animate({
                            from: oldDirection,
                            to: newDirection,
                            dur: 500,
                            easing: 'easeBothStrong',
                            onUpdate: function (value) {
                                this.node.setClient('direction', value);
                            }
                        });
                        animateRotate.node=thisNode;
                        
                        if(thisNode==node && thisNode.getClient('level')==1 && thisNode.getChildrenSize()>0){
                            var animateGrow=new twaver.Animate({
                                from: 0.8,
                                to: 1,
                                dur: 1000,
                                easing: 'bounceOut',
                                onUpdate: function (value) {		
                                    node.getChildren().forEach(function(child){
                                        child.setClient('scale', value);
                                    });
                                }
                            });
                            animateRotate.chain(animateGrow);
                        }
                        animateRotate.play();
                    }
                }
            }
        
            function resetGrandson(node){
                node=getRootNode(node);
                box.forEach(function(element){
                    if(element.getClient('level')==2){
                        element.setClient('scale', 0);
                    }
                });
            }
        
            function getRootNode(node){
                var parent=node;
                while(parent.getParent()){
                    parent=parent.getParent();
                }
                return parent;
            }
        
            function makeHighRes(c) {
                var ctx = c.getContext('2d');
                var devicePixelRatio = window.devicePixelRatio || 1;
                var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || 1;
                var ratio = devicePixelRatio / backingStoreRatio;
                if (devicePixelRatio !== backingStoreRatio) {
        
                    var oldWidth = c.width;
                    var oldHeight = c.height;
                    c.width = Math.round(oldWidth * ratio);
                    c.height = Math.round(oldHeight * ratio);
                    c.style.width = oldWidth + 'px';
                    c.style.height = oldHeight + 'px';
                    ctx.scale(ratio, ratio);
                }
            }
        },
        getStyle: function(element,attr){
            if(element.currentStyle){
                return element.currentStyle[attr];
            }else{
                return window.getComputedStyle(element,null)[attr];
            }
        },
        toEChartDatas: function(datas){
            //将数据从大到小分类，并按照颜色数组显示
            var colorLen = this.options.colorList.length;
            var sortDatas =  datas.sort(function(prev,next){
                return next['value'] - prev['value'];
            });
            if(sortDatas.length > colorLen){
                var others = sortDatas.splice(colorLen-1,sortDatas.length-colorLen+1);
                var otherObj = {name: it.util.i18n('EquipStatisticManager_others'),value: 0}
                others.forEach(function(other){
                    otherObj.value += other.value;
                })
                sortDatas.push(otherObj);
            }
            return sortDatas;
        },
        toTwaverDatas: function(datas){
            var sortDatas =  datas.sort(function(prev,next){
                return next['value'] - prev['value'];
            });
            //为了饼图效果，截取前9个数据
            if(sortDatas.length > 9){
                var subDatas = sortDatas.splice(0,9);
                var others = subDatas.splice(6,3);
                var otherObj = {};
                otherObj.name = it.util.i18n('EquipStatisticManager_others');
                otherObj.value = others;
                subDatas.push(otherObj);
                return subDatas;
            }
            return sortDatas;
        },
        setPieOptions: function(datas){
            var self = this;
            this.options.echartPie.series[0].data = [];
            datas.forEach(function (v,index,array) {
                self.options.echartPie.series[0].data.push({
                    value: v.value,
                    name: v.name,
                    itemStyle: {
                        normal: {
                            color: self.options.colorList[index]
                        }
                    }
                });
            });
        },
        setBarOptions: function(datas){
            var self = this;
            this.options.echartBar.xAxis.data = [];
            this.options.echartBar.series[0].data = [];
            datas.forEach(function (v,index,array) {
                //将有空行的字符串换行
                //获取条形图的宽度，根据条目数量来
                var itemLen = array.length;
                var maxWidth = 325;
                var perWidth = (maxWidth/itemLen/2).toFixed(2);
                var spaceName = v.name.replace(/\s+/g,'\n');
                self.options.echartBar.xAxis.data.push(spaceName);
                self.options.echartBar.series[0].barWidth = perWidth;
                self.options.echartBar.series[0].data.push({
                    value: v.value,
                    itemStyle: {
                        normal: {
                            color: self.options.colorList[index]
                        }
                    }
                });
            });
        },
        _setOption: function(key,value){
            var self = this;
            //这里要对value做分类处理
            //用echart的一类、用twaver的一类
            if(key == 'chartParams'){             
                var chartType = value.chartType.toLowerCase();
                var ex = /^echart-(\w+)$/.exec(chartType);
                var theme = value.fieldName;
                var fieldArr = [];
                value.chartDatas.forEach(function(val){
                    fieldArr.push(val.name);
                });
                //给input传数据
                if(!this.inputFieldData[theme]){
                    this.inputFieldData[theme] = fieldArr;
                }
                
                if(ex){   //采用echart绘制
                    var echartDatas = this.toEChartDatas(value.chartDatas); 
                    var echartType = ex[1];
                    var upperEchartType = echartType.substring(0,1).toUpperCase()+echartType.substring(1);
                    var echartTypeStr = 'echart'+upperEchartType;
                    
                    if(echartType == 'pie'){
                        this.setPieOptions(echartDatas);
                    }else{
                        this.setBarOptions(echartDatas);
                    }
                    this.options[echartTypeStr].title.text = this.getDisplayNameFromName(theme);
                    this[theme+'InitedEchart'].setOption(this.options[echartTypeStr]);
                }else{  //采用twaver绘制
                    //动态生成div ==> div定位、宽高 ==> network位置 ==> 图表位置 
                    var twaverDatas = this.toTwaverDatas(value.chartDatas);
                    if(twaverDatas.length){
                        this.options.twaverPie.pie.data = twaverDatas;
                    }
                    this.options.twaverPie.title.name = this.getDisplayNameFromName(theme);;
                    var themeTwaver = theme+'twaver';
                    if(!this[theme+'twaverBox']){
                        this[theme+'twaverBox'] = this.createTwaver(this[theme+'CreatedDiv'][0],this.options.twaverPie);
                    }   
                }
            }
            if(key == 'allDatas'){
                this.options.allEquipments = value;       
            }
        },
        getBusinessNameById: function(id){
            for(var bt in this.businessTypeMap){
                if(bt == id){
                    return this.businessTypeMap[bt]._name;
                }
            }
            
        }
    })
})(jQuery)