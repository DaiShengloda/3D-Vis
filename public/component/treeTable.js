(function ($) {
    $.widget('hud.treeTable', {
        options: {
            columnheader: {
                name: '资产编号',
                propertyType: 'client',
                valueType: 'string',
                editable: false,
            },
            tableData: [],
            columnWidth: {
                'tree': 0.25,
                'name': 0.15,
                'all': 0.15,
                'count': 0.15,
                'rest': 0.15,
                'usage': 0.15
            },
            tableWidth: [480,420,420] //tableDom多分辨率width
        },

        _create: function() {
            var self = this;
            var el = this.element;
            this.element.addClass('tree-table');
            this.init();
        },

        init: function() {
            this.box = new twaver.ElementBox();
            this.tree = new twaver.controls.Tree(this.box);
            this.treeTable = new twaver.controls.TreeTable(this.box);
            this.tablePane = new twaver.controls.TablePane(this.treeTable);
            this.sceneManager = main.sceneManager;
            this.dataManager = this.sceneManager.dataManager;
            var mainContent = this.mainContent = this.element.get(0);
            this.initSearchInput();
            var tablePaneView = this.tablePane.getView();
            mainContent.appendChild(tablePaneView);
            this.initTreeTable();
            this.initBox();
            this.initHandlerTreeTable();
            this.initTableStyle();
            this._handlerWindowResize();
        },

        initSearchInput: function() {
            var self = this;
            var text = '<div class="search-box">'+
                        '<input class="search-input"/ placeholder="请输入资产编号">'+
                        '<button class="search">查询</button>'+
                        '</div>';
            this.$filter = $(text);
            this.element.append($(text));
            this.element.find('.search').click(function () {
                self._filterData();
                self.refresh();
            });
        },

        clearSearchInput: function() {
            this.element.find('.search-input').val('');
        },

        clearBox: function() {
            this.box.clear();
        },

        refresh: function() {
            this.treeTable.invalidateModel();
            this.treeTable.invalidateDisplay();
        },

        _filterData: function() {
            var self = this;
            var val = this.element.find('.search-input').val();
            this.clearBox();
            self._trigger('filterData', event, {
                filterVal: val
            });
        },

        initTableStyle: function() {
            this.treeTable.setRowHeight(30);
            this.treeTable.setLineType('solid');

            var tableDom = this.tableDom = this.tablePane.getView();
            // tableDom.style.width = this.options.tableWidth;
            // tableDom.style.height = this.options.tableHeight; 
            $(tableDom).addClass('table-dom');
   
            var tableHeader = this.tableHeader =  this.tablePane.getTableHeader().getView();
            tableHeader.style.backgroundColor = 'rgb(42, 42, 42)';
            // tableHeader.style.width = this.options.tableWidth;
            $(tableHeader).addClass('table-header');
            this.tablePane.getTableHeader().setHeight(30);

            var tableBody = this.tableBody = this.tablePane.getTable().getView();
            tableBody.style.overflow = 'hidden';
            tableBody.style.overflowY = 'scroll';
            tableBody.style.fontSize = '14px';
            // tableBody.style.width = this.options.tableWidth;
            // tableBody.style.height = '270px'; 
            $(tableBody).addClass('bt-scroll table-body');
        },

        initTreeTable: function(){
            var self = this;
            this.treeTable.getTreeColumn().renderHeader = function (div) {
                var span = document.createElement('span');
                span.style.whiteSpace = 'nowrap';
                span.style.verticalAlign = 'middle';
                span.style.padding = '1px 2px 1px 2px';
                span.innerHTML = self.options.columnheader.name;
                span.setAttribute('title', span.innerHTML);
                span.style.font = 'bold 12px Helvetica';
                div.style.textAlign = 'center';
                div.style.border = 'none';
                div.appendChild(span);
                div.className = self.options.columnheader.propertyName;
            };
            this.createColumns();
        },

        createColumns: function() {
            var columns = this.options.columns,
            tColumn;
            this._columnMap = {};
            for(var i in columns) {
                var column = columns[i],
                    name = column.name,
                    propertyName = column.propertyName,
                    propertyType = column.propertyType,
                    valueType = column.valueType,
                    editable = column.editable;
                tColumn = this.createColumn(this.treeTable, name, propertyName, propertyType, valueType, editable);
                this._columnMap[propertyName] = tColumn;
            }
            this.setColumnWidth();
        },

        setColumnWidth: function() {
            var nw = this._getNw();
            if (!nw)return;
            this._setWidth(nw);
        },

        _handlerWindowResize: function() {
            var self = this;
            window.addEventListener('resize', function() {
                self.setColumnWidth();
            });
        },

        _getNw: function() {
            var w = document.body.clientWidth, nw;
            var tableWidth = this.options.tableWidth;
            if (!tableWidth || !tableWidth.length) {
                return null; 
            };
            if (w < 1440) {
                nw = tableWidth[2];
            } else if (w >= 1440 && w < 1920) {
                nw = tableWidth[1];
            } else if (w >= 1920) {
                nw = tableWidth[0];
            }
            return nw;
        },

        _setWidth: function(nw) {
            var columnWidth = this.options.columnWidth;
            for(var i in this._columnMap) {
                var column = this._columnMap[i],
                    per = columnWidth[i],
                    width = parseInt(nw*per);
                column.setWidth(width);
            }
            var treeColumn = this.treeTable.getTreeColumn();
            treeColumn.setWidth(nw*columnWidth['tree']);
        },

        createColumn: function (table, name, propertyName, propertyType, valueType, editable) {
            var column = new twaver.Column(name);
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
                span.innerHTML = column.getName() ? column.getName() : column.getPropertyName();
                span.setAttribute('title', span.innerHTML);
                span.style.font = 'bold 12px Helvetica';
                div.style.textAlign = 'center';
                div.style.border = 'none';
                div.appendChild(span);
                div.className = propertyName;
            };
            table.getColumnBox().add(column);
            return column;
        },

        initBox: function() {
            this._initTableData();
            var tableData = this.options.tableData;
            for(var i in tableData){
                var groupMap = tableData[i];
                var id = groupMap.id;
                this._createGroupMap(id, groupMap, null,null);
            }
        },

        _initTableData: function() {
            var tableData = this.options.tableData;
            this.tableData = {};
            for(var i in tableData){
                var group = tableData[i];
                var groupId = group.id;
                this._addTableData(groupId,group);
            }
        },

        _addTableData: function(groupId,group) {
            var children = group.children;
            if (children) {
                this.tableData[groupId] = group;
            }
            if (!children.length) {
                return;
            } else {
                for (var i in children) {
                    var child = children[i],
                        childId = child.id;
                    this._addTableData(childId,child);
                }
            }
        },

        _filterDataById: function(id) {
            var group = this.tableData[id];
            if (group) {
                return true;
            } else {
                // return true;
                return false;
            }
        },

        _createGroupMap: function(id, groupMap, parent, queryVal) {
            var children = groupMap.children;
            if (!children.length) {
                this._createNodeMap(id, groupMap,parent,queryVal);
                return;
            } else {
                var group = this.box.getDataById(id);
                if(group){
                    this._setGroupClient(id, group);
                } else{
                    group = new twaver.Group(id);
                    this._setGroupClient(id, group);
                    group.setParent(parent);
                    this.box.add(group);
                }

                for(var i in children) {
                    if (i.indexOf(queryVal) == '-1' && queryVal)return;
                    var child = children[i];
                    var childId = child.id;
                    this._createGroupMap(childId, child, group, queryVal);
                }
            }
        },

        _setGroupClient: function(id, group) {

        },

        _createNodeMap: function(id,rackMap,parent,queryVal) {
            var group = this.box.getDataById(id);
            if(group){
                this._setGroupClient(id, group);
            } else{
                var node = new twaver.Node(id);
                this._setNodeClient(id, node);
                node.setParent(parent);
                this.box.add(node);
            }
        },

        _setNodeClient: function(id, node) {

        },

        initHandlerTreeTable: function(){
            this.onCellRendered();
            this.renderData();
            this._renderTree();
            this._addLine();
        },

        onCellRendered: function() {
            this.treeTable.onCellRendered = function(params) {
                var div = params.div;
                var column = params.column;             
                if (column._propertyName == 'usage'){
                    var value = params.value,
                        arr = value.split('_usage_');
                    
                    //bar
                    var $progressbar = $('<div class="self-progressbar"></div>'); 
                    $progressbar.progressbar({
                        value: parseFloat(arr[0]),
                    });
                    $progressbarValue = $progressbar.find( ".ui-progressbar-value" );
                    $progressbarValue.css({
                        'background': arr[1],
                        'border': 'none'
                    });
                    $progressbar.addClass('usage-progressbar');
                    div.appendChild($progressbar[0])

                    //percent
                    var $percent = $(div).find('span');
                    $percent[0].innerHTML = arr[0];
                    $percent.attr('title', arr[0]);
                    $percent.css({
                        position: 'absolute',
                    });
                    $percent.addClass('usage-perNum');             
                };

                if (column._name == 'tree') {
                    div.style.paddingLeft = '10px';
                } else {
                    div.style.textAlign = 'center';
                }
            };
        },

        renderData: function(){
            var self = this;
            this.treeTable.renderData = function (div, data, row, selected) {
                var columns = this._columnBox.getRoots();
                var count = columns.size();
                var sumWidth = 0;
                var hpx = this._rowHeight + 'px';
    
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
    
                // backgroundColor = (row%2 == 0) ? 'rgba(84, 138, 160, 1.0)' : 'rgba(94, 148, 170, 1.0)'
                // style.backgroundColor = ((this.isCheckMode() && this._focusedRow === row) || (!this.isCheckMode() && selected)) ? backgroundColor : '';
                // style.border = ((this.isCheckMode() && this._focusedRow === row) || (!this.isCheckMode() && selected)) ? '1px solid #00f6ff' : '';
                // style.color = ((this.isCheckMode() && this._focusedRow === row) || (!this.isCheckMode() && selected)) ? '#ffffff' : '';
                
                if (row % 2 == 0) {
                    div.style.background = '-webkit-linear-gradient(top, rgba(53, 53, 53, 1.0), rgba(53, 53, 53, 1.0))';
                } else {
                    div.style.background = '-webkit-linear-gradient(top, rgba(48, 48, 48, 1.0), rgba(48, 48, 48, 1.0))';
                };

                var nw = self._getNw();
                self.tableHeader.style.width = nw+'px';
                self.tableBody.style.width = nw+'px';
                self.tableBody.style.height = '270px';
            };
        },

        _renderTree: function() {
            var self = this;
            this.treeTable.setExpandIcon('../images/expandIcon.png');
            this.treeTable.setCollapseIcon('../images/collapseIcon.png');

            this.treeTable._renderTree = function (div, data, row, selected) {
                var level = this._levelMap[data.getId()];
                var toggleImage = this.getToggleImage(data);
                var lineType = this.getLineType();
                var indent = this._indent;
                var span = this.__spanPool.get();
                if (toggleImage) {
                    span.style.width = this._indent * level + 'px';
                } else {
                    span.style.width = this._indent * (level + 1) + 'px';
                }
                span.style.display = 'inline-block';
                span.style.position = 'relative';
                span.style.verticalAlign = 'top';
                span.style.margin = '0px 1px 0px 1px';
                span.style.width = (level+1)*indent + 'px';
                div.appendChild(span);
        
                // draw line
                var currentNode = data;
                var parentNode = currentNode.getParent();
                var levelsUp = 0;
                
                if(lineType === 'dotted' || lineType === 'solid'){
                    if(parentNode == null){
                        var icon = this.getIcon(data);
                        this._addLine(span, data, icon, true);
                    }
                    while(parentNode !== null){
                        var children = parentNode.getChildren();
                        var isLast = currentNode === children.get(children.size() - 1);
                        var icon = this.getIcon(currentNode);
                        currentNode.setClient('isLast',isLast);
                        if(levelsUp == 0){
                            this._addLine(span, data, icon, isLast);
                        }
                        levelsUp++;
                        currentNode = parentNode;
                        parentNode = parentNode.getParent();
                    }
                }
                
                //add expandIcon
                if (toggleImage) {
                    var image = this.__imagePool.get();
                    image.setAttribute('src', _twaver.getImageSrc(toggleImage));
                    image.style.verticalAlign = 'middle';
                    image._expandData = data;
                    image.style.position = 'absolute';
                    image.style.right = '3px';
                    image.style.top = this.getRowHeight()/2 - 6 +'px';
                    span.appendChild(image);
                }
        
                var checkable = this.isCheckable(data);
                var disabled = this.getUncheckableStyle() === 'disabled';
                if (checkable || disabled) {
                    var checkBox = this._addCheckBox(div, data, selected);
                    checkBox.disabled = !checkable;
                }
        
                //add icon
                var dataId = data.getId();
                var iconClass = self._getIconClassById(dataId);
                var $span = $('<span class="icon table-icon"></span>');
                var $i = $('<span class="table-icon-i">'+dataId+'</span>').appendTo($span);
                $i.attr('title', dataId);
                $span.addClass(iconClass);
                div.appendChild($span[0]);
                
                //add label
                var label = this.getLabel(data);
                if (label) {
                    span = this.__textPool.get();
                    span.style.whiteSpace = 'nowrap';
                    span.style.verticalAlign = 'middle';
                    span.style.padding = '1px 2px 1px 2px';
                    _twaver.setText(span, label, this._treeColumn ? this._treeColumn.isInnerText() : this._innerText);
                    if (!this.isCheckMode() && !this._treeColumn) {
                        span._selectData = data;
                        span.style.backgroundColor = selected ? this.getSelectColor(data) : '';
                    } else if (this._focusedRow === row) {
                        span.style.backgroundColor = this.getSelectColor(data);
                    }
                    this.onLabelRendered(span, data, label, row, level, selected);
                    div.appendChild(span);
                };   
            };
        },

        _getIconClassById: function(id) {
            var data = this.dataManager.getDataById(id),
                category = this.dataManager.getCategoryForData(data),
                categoryId = category.getId(),
                iconMap = dataJson.treeIcon;
            var iconClass = iconMap[categoryId];
            if (!iconClass){
                iconClass = 'iconfont icon-t-rack'
            }
            return iconClass;
        },

        _addLine: function() {
            this.treeTable._addLine = function(span, data, icon, isLast){
                var c = this.__linePool.get();
                var imageAsset = _twaver.getImageAsset(icon);
                var self = this;
                var toggleImage = this.getToggleImage(data);
                var level = this._levelMap[data.getId()];
                var indent = this._indent;
                var w,h;
                var iW = indent,iH = indent;
                var xoffset = 0;
                var checkable = this.isCheckable(data);
                var disabled = this.getUncheckableStyle() === 'disabled';
                xoffset = 2;
        
                if(imageAsset){
                    iW = imageAsset.getWidth();
                    iH = imageAsset.getHeight();
                }
        
                if(isLast){
                    w = (level+xoffset-1) * indent + iW;
                    h = this.getRowHeight();
                }else{
                    w = (level+xoffset-1) * indent + iW;
                    h =  this.getRowHeight();
                }
        
                span.style.width = (level+xoffset-1)*indent + 'px';
                span.style.height = h + 'px';
                var lineStyle =  this.getLineType();
                var lineColor = '#595959' || this.getLineColor();
                var lineAlpha = 1.0 || this.getLineAlpha();
                var lineWidth = 1 || this.getLineThickness();
                var lineDash = this.getLineDash();
                var imgSrc = _twaver.getImageSrc(toggleImage);
               
                c.style.verticalAlign = 'top';
                c.style.margin = '0px 0px 0px 0px';
                c.style.zIndex = -1;
                c.setAttribute('width', w);
                c.setAttribute('height', h);
                var g = c.getContext('2d');
                g.lineWidth = lineWidth;
                g.strokeStyle = lineColor;
                g.globalAlpha = lineAlpha;
        
                if(lineStyle === 'dotted'){
                    g.setLineDash(lineDash);
                }
        
                var t = (level+xoffset)*2;
                if(isLast){
                    var currentNode = data;
                    var parent = currentNode.getParent();
                    g.clearRect(0, 0, w, h);
                    var rect = {x:0, y: 0, width: w, height: h};
                    if(parent === null){
                        if(data.getChildrenSize() !== 0){
                            if(this.isExpanded(data)){
                                g.moveTo((level+xoffset+1)*w/t,h/2+iH/2);
                                g.lineTo((level+xoffset+1)*w/t,h);
                                g.stroke();
                            }
                        }
                    }
                    for(var i=level*2 -1;i >= 1;i-=2){
                         if(currentNode.getClient('isLast')){
                            currentNode = parent;
                            parent = currentNode.getParent();
                            if((i+1)/2 != level){
                                continue;
                            }
                        }else{
                            currentNode = parent;
                            parent = currentNode.getParent();
                        }
        
                        if(i == level*2-1){
                            g.moveTo((i+xoffset)*w/t,0); 
                            g.lineTo((i+xoffset)*w/t,h/2); 
                            g.stroke(); 
        
                            g.moveTo((i+xoffset)*w/t,h/2);
                            g.lineTo((i+xoffset+1)*w/t,h/2);
                            g.stroke(); 
                            if(data.getChildrenSize() !== 0){
                                if(this.isExpanded(data)){
                                    g.moveTo((i+xoffset+2)*w/t,h/2+iH/2);
                                    g.lineTo((i+xoffset+2)*w/t,h);
                                    g.stroke();
                                }
                            }
                        }else{
                            g.moveTo((i+xoffset)*w/t,0); 
                            g.lineTo((i+xoffset)*w/t,h); 
                            g.stroke(); 
                        }
                    }
                }else{
                    var currentNode = data;
                    var parent = currentNode.getParent();
                    g.clearRect(0, 0, w, h);
                    var rect = {x:0, y: 0, width: w, height: h};
                    for(var i=level*2 -1;i >= 1;i-=2){
                        if(currentNode.getClient('isLast')){
                            currentNode = parent;
                            parent = currentNode.getParent();
                            if((i+1)/2 != level){
                                continue;
                            }
                        }else{
                            currentNode = parent;
                            parent = currentNode.getParent();
                        }
                        g.moveTo((i+xoffset)*w/t,0); 
                        g.lineTo((i+xoffset)*w/t,h); 
                        g.stroke(); 
                        if(i == level*2-1){
                            g.moveTo((i+xoffset)*w/t,h/2);
                            g.lineTo((i+xoffset+1)*w/t,h/2);
                            g.stroke();
                            if(data.getChildrenSize() !== 0){
                                if(this.isExpanded(data)){
                                    g.moveTo((i+xoffset+2)*w/t,h/2+iH/2);
                                    g.lineTo((i+xoffset+2)*w/t,h);
                                    g.stroke();
                                }
                            }
                        }
                        
                    }
                }
                span.appendChild(c);
                return c;
            };
        },

        _getUsageColor: function(usage) {
            var usageColorMap = this.options.usageColorMap,
                usageColor,usageNum,diff,lastDiff;
            for(var i in usageColorMap){
                usageNum = parseFloat(i);
                if (usage<=usageNum) {
                    diff = usageNum-usage;
                    if (!lastDiff){
                        lastDiff = diff;                   
                    }
                    if (lastDiff && lastDiff>=diff) {
                        usageColor = usageColorMap[i];
                        lastDiff = diff;
                    }
                };
            };
            return usageColor;
        },

        _destroy: function() {
            this.element.empty();
        },

        _setOption: function (key, value) {
            this._super(key, value);
        }
    });

    $.widget("hud.weightTreeTable", $.hud.treeTable, {

        options: {
            columns:[
                {
                    name: '设备名称',  //表格名称
                    propertyName: 'name',  //属性名称
                    propertyType: 'client', //属性类型 accessor\client\style
                    valueType: 'string',  //值类型
                    editable: false,  //是否可编辑
                },
                {
                    name: '总容量(kg)',
                    propertyName: 'all',
                    propertyType: 'client',
                    valueType: 'number',                    
                    editable: false,
                },
                {
                    name: '已使用(kg)',
                    propertyName: 'count',
                    propertyType: 'client',
                    valueType: 'number',                   
                    editable: false,
                },
                {
                    name: '剩余(kg)',
                    propertyName: 'rest',
                    propertyType: 'client',
                    valueType: 'number',                  
                    editable: false,
                },
                {
                    name: '使用率(%)',
                    propertyName: 'usage',
                    propertyType: 'client',
                    valueType: 'string',                    
                    editable: false,
                },
            ],
            usageColorMap: {
                '0.20': '#70cdff',
                '0.74': '#ffff62',
                '1.5': '#ff5452',
            }
        },

        _create: function() {
            this._init();
            return this._super();
        },

        _init: function() {
            this.app = main.weightManager.weightCapacityManager;
        },

        /**
         * 计算机柜使用承重，计算其孩子设备的weight
        */
        _computeCountWeight: function (dataOrId) {
            var dm = this.dataManager;
            var self = this;
            var data = dataOrId;
            if (!data.getId) {
                data = dm.getDataById(dataOrId);
            };

            var dataType = dm.getDataTypeForData(data),
                category = dm.getCategoryForData(data).getId(),
                countWeight = parseInt(data.getWeight()) || parseInt(dataType.getWeight()) || 0;
            if (category != 'equipment') {
                countWeight = 0;
            };

            var parentId = data.getParentId();
            if (!this._filterDataById(parentId)) {
                countWeight = 0;
            };
            var childList = data.getChildren();
            childList.forEach(function(child) {
                countWeight += self._computeCountWeight(child);
            });

            return countWeight;
        },

        /**
         * 计算机柜总承重，拿自己的值
         * @param dataOrId
         * @returns {number}
         */
        _computeAllWeight: function (dataOrId) {
            var dm = this.dataManager;
            var self = this;
            var data = dataOrId;
            if (!data.getId) {
                data = dm.getDataById(dataOrId);
            };
            var id = data.getId();

            var dataType = dm.getDataTypeForData(data),
                category = dm.getCategoryForData(data).getId(),
                totalWeightRating = parseInt(dataType.getWeightRating()) || 0;
            if (category != 'rack') {
                totalWeightRating = 0;
            };
            if (!this._filterDataById(id)) {
                totalWeightRating = 0;
            };
            var childList = data.getChildren();
            childList.forEach(function(child) {
                totalWeightRating += self._computeAllWeight(child);
            });

            return totalWeightRating;
        },

        _setGroupClient: function(id, group) {
            var count = this._computeCountWeight(id),
                all = this._computeAllWeight(id),
                usage = all ? count/all : 0,      
                rest = all - count,
                usageColor = this._getUsageColor(usage);

            group.setClient('name',id);
            group.setClient('all',all);
            group.setClient('count',count);
            group.setClient('rest',rest);
            group.setClient('usage',Math.round(usage*100) + '%' + '_usage_' + usageColor);
        },

        _setNodeClient: function(id, node) {
            var count = this._computeCountWeight(id),
                all = this._computeAllWeight(id),
                usage = all ? count/all : 0,
                rest = all - count,
                usageColor = this._getUsageColor(usage);
            
            node.setClient('name',id);
            node.setClient('all',all);
            node.setClient('count',count);
            node.setClient('rest',rest);
            node.setClient('usage',Math.round(usage*100) + '%' + '_usage_' + usageColor);
        },

        _setOption: function (key, value) {
            this._super(key, value);
        }
    });

    $.widget("hud.powerTreeTable", $.hud.treeTable, {

        options: {
            columns:[
                {
                    name: '设备名称',  //表格名称
                    propertyName: 'name',  //属性名称
                    propertyType: 'client', //属性类型 accessor\client\style
                    valueType: 'string',  //值类型
                    editable: false,  //是否可编辑
                },
                {
                    name: '总容量(kw)',
                    propertyName: 'all',
                    propertyType: 'client',
                    valueType: 'number',                    
                    editable: false,
                },
                {
                    name: '已使用(kw)',
                    propertyName: 'count',
                    propertyType: 'client',
                    valueType: 'number',                   
                    editable: false,
                },
                {
                    name: '剩余(kw)',
                    propertyName: 'rest',
                    propertyType: 'client',
                    valueType: 'number',                    
                    editable: false,
                },
                {
                    name: '使用率(%)',
                    propertyName: 'usage',
                    propertyType: 'client',
                    valueType: 'string',                   
                    editable: false,
                },
            ],
            usageColorMap: {
                '1.0': '#ff5452',
                '0.8': '#ffff62',
                '0.2': '#80ff79'
            }
        },

        _create: function() {
            this._init();
            return this._super();
        },

        _init: function() {
            this.app = main.powerManager.powerCapacityManager;
        },

        /**
         * 计算机柜使用功率--其中设备功率
         */
        _getCountPower: function(dataOrId) {
            var self = this;
            var dm = this.dataManager;
            var data = dataOrId;
            if(!data.getId){
                data = dm.getDataById(dataOrId);
            }

            var datatype = dm.getDataTypeForData(dataOrId),
                countPower = parseInt(data.getPower()) || parseInt(datatype.getPower()) || 0,
                category = dm.getCategoryForData(dataOrId).getId();
            if (category != 'equipment') {  //只计算equipment的power
                countPower = 0;
            };
            var parentId = data.getParentId();
            if (!this._filterDataById(parentId)) {
                countPower = 0;
            };
            var childList = data.getChildren();
            childList.forEach(function(child){
                countPower += self._getCountPower(child);
            });
            return countPower;
        },

        /**
         * 计算机柜额定功率
         */
        _getAllPower: function(dataOrId) {
            var self = this;
            var dm = this.dataManager;
            var data = dataOrId;
            if(!data.getId){
                data = dm.getDataById(dataOrId);
            }
            var datatype = dm.getDataTypeForData(dataOrId),
                powerRating = parseInt(datatype.getPowerRating()) || 0,
                category = dm.getCategoryForData(dataOrId).getId();
            if (!datatype || category != 'rack') {  //只计算rack的powerRating
                powerRating = 0;
            };
            var id = data.getId();
            if (!this._filterDataById(id)) {
                powerRating = 0;
            };
            
            var childList = data.getChildren();
            childList.forEach(function(child) {
                powerRating += self._getAllPower(child);
            });
            return powerRating;;
        },

        _setGroupClient: function(id,group) {
            var count = Math.round(this._getCountPower(id)),
                all = this._getAllPower(id),
                usage = all ? count/all : 0,      
                rest = all - count,
                usageColor = this._getUsageColor(usage);

            group.setClient('name',id);
            group.setClient('all',all);
            group.setClient('count',count);
            group.setClient('rest',rest);
            group.setClient('usage',Math.round(usage*100) + '%' + '_usage_' + usageColor);
        },

        _setNodeClient: function(id, node) {
            var count = Math.round(this._getCountPower(id)),
                all = this._getAllPower(id),
                usage = all ? count/all : 0,      
                rest = all - count,
                usageColor = this._getUsageColor(usage);
            
            node.setClient('name',id);
            node.setClient('all',all);
            node.setClient('count',count);
            node.setClient('rest',rest);
            node.setClient('usage',Math.round(usage*100) + '%' + '_usage_' + usageColor);
        },        
    });

    $.widget("hud.spaceTreeTable", $.hud.treeTable, {

        options: {
            columns:[
                {
                    name: '设备名称',
                    propertyName: 'name',
                    propertyType: 'client',
                    valueType: 'string',  
                    editable: false, 
                },
                {
                    name: '总容量(U)',
                    propertyName: 'all',
                    propertyType: 'client',
                    valueType: 'number',                    
                    editable: false,
                },
                {
                    name: '已使用(U)',
                    propertyName: 'count',
                    propertyType: 'client',
                    valueType: 'number',                  
                    editable: false,
                },
                {
                    name: '剩余(U)',
                    propertyName: 'rest',
                    propertyType: 'client',
                    valueType: 'number',                   
                    editable: false,
                },
                {
                    name: '使用率(%)',
                    propertyName: 'usage',
                    propertyType: 'client',
                    valueType: 'string',                   
                    editable: false,
                },
            ],
            usageColorMap: {
                '1.0': '#fd674f',
                '0.74': '#ffc95a',
                '0.51': '#6fd772',
                '0.28': '#5dbde0'
            }
        },

        _addRackSpace: function(data) {
            var dm = this.dataManager;
            var space = 0;
            var category = dm.getCategoryForData(data),
                categoryId = category.getId();
            if (categoryId == 'rack') {
                space = data.getUserData('dyna_user_data_totalSpace') || 0
            } 
            return space;
        },

        _addRackOccupy: function(data) {
            var dm = this.dataManager;
            var occpy = 0;
            var category = dm.getCategoryForData(data),
                categoryId = category.getId();
            if (categoryId == 'rack') {
                occpy = data.getUserData('dyna_user_data_totalOccupation') || 0
            } 
            return occpy;
        },

        /**
         * 计算机柜总空间
         */
        _computeChildrenTotalSpace: function(dataOrId) {
            var self = this;
            var dm = this.dataManager;           
            var data = dataOrId;
            if (!data.getId) {
                data = dm.getDataById(dataOrId);
            }
            var totalSpace = this._addRackSpace(data);
            var id = data.getId();
            if (!this._filterDataById(id)) {
                totalSpace = 0;
            };

            var childList = data.getChildren();
            childList.forEach(function(child) {
                totalSpace += self._computeChildrenTotalSpace(child);
            }); 
            return totalSpace;
        },

        /**
         * 计算机柜占用空间
        */
        _computeChildrenTotalOccupy: function(dataOrId) {
            var self = this;
            var dm = this.dataManager;           
            var data = dataOrId;
            if (!data.getId) {
                data = dm.getDataById(dataOrId);
            }
            var totalOccupy = this._addRackOccupy(data);
            var id = data.getId();
            if (!this._filterDataById(id)) {
                totalOccupy = 0;
            };

            var childList = data.getChildren();
            childList.forEach(function(child) {
                totalOccupy += self._computeChildrenTotalOccupy(child);
            });
            return totalOccupy;
        },

        _setGroupClient: function(id, group) {
            var count = this._computeChildrenTotalOccupy(id),
                all = this._computeChildrenTotalSpace(id),
                usage = all ? count/all : 0,      
                rest = all - count,
                usageColor = this._getUsageColor(usage);

            group.setClient('name',id);
            group.setClient('all',all);
            group.setClient('count',count);
            group.setClient('rest',rest);
            group.setClient('usage',Math.round(usage*100) + '%' + '_usage_' + usageColor);
        },

        _setNodeClient: function(id, node) {
            var count = this._computeChildrenTotalOccupy(id),
                all = this._computeChildrenTotalSpace(id),
                usage = all ? count/all : 0,      
                rest = all - count,
                usageColor = this._getUsageColor(usage);
            
            node.setClient('name',id);
            node.setClient('all',all);
            node.setClient('count',count);
            node.setClient('rest',rest);
            node.setClient('usage',Math.round(usage*100) + '%' + '_usage_' + usageColor);
        },
    });
})(jQuery);

