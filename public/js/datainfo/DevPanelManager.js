/**
 * 2D面板的显示
 * @param sceneManagr
 * @constructor
 */

it.DevPanelManager = function (sceneManager) {
    $BaseServerTab.call(this.sceneManager);
    this.sceneManager = sceneManager;
    this.dataManager = this.sceneManager.dataManager;
    this.network = new twaver.vector.Network();
    this.portOccupancyManager = new it.PortOccupancyManager(sceneManager);
    this.dataNode2DMap = {};
    this.container = document.createElement('div');
    this.container.style.position = 'absolute';
    this._visibleFilters = [];
    this._selectableFilters = [];
    this._eventHandlers = [];
    var self = this;
    this.dbClickHandle = function (event) {
        if (event) {
            var element = self.network.getElementAt(event);
            if (element) {
                self.handleDoubleClick({ element: element });
            } else {
                self.handleDoubleClickBackground();
            }
        }
    };
    //无效，需先将view加到document中方可
    this.network.adjustBounds({ x: 0, y: 0, width: 1, height: 1 });
    this.left = 0;
    this.top = 0;
    this.width = document.documentElement.clientWidth;
    this.height = document.documentElement.clientHeight;
    this.box = this.network.getElementBox();
    this.tree = new twaver.controls.Tree(this.box);
    this.table = new twaver.controls.Table(this.box);
    this.tableRule = {}; //table的规则，先注册一个,注册格式为{ID：[{column1},{column2},...]}，id是category或datatype,但是type优先
    this.treeRule = {}; // tree的规则，先注册，格式：{id:{}};
    this.isValidate = false;
    this.$portPanel = null;
    this.$right = null;
    this.intervalArr = [];
    this.nodeMap = {};
    this.init();
};

mono.extend(it.DevPanelManager, $BaseServerTab, {

    init: function () {
        this.addTableAndTree();
        this.adjustViewBounds();
        this.network.getView().addEventListener("dblclick", this.dbClickHandle);
        this.container.style.display = 'none'; //为何一开始为none呢？
        var self = this;
        this.network.addViewListener(function (e) {
            if (e.kind === 'validateEnd' && !self.isValidate) {
                self.network.zoomOverview();
                self.isValidate = true;
                // var oldZoom = self.network.getZoom();
                // self.network.setZoom(oldZoom - 0.1);
            }
        });

        //设备面板无面板数据的不能选中
        var network = this.network;
        var selectionModel = network.getSelectionModel();
        selectionModel.isSelectable = function (node) {
            if (node.getParent() == null) {
                return true;
            } else {
                if (node.getClient('_template')) {
                    return true;
                }
            }
            return false;
        }


    },

    getTitle: function () {
        return it.util.i18n("DevPanelManager_Panel_info");
    },

    getContentClass: function () {
        return 'panel panelInfo';
    },

    setData: function (data) {
        this.loadData(data);
    },

    getContentPanel: function () {
        var mainDiv = $('<div></div>');
        var header = $('<div class="header">' + it.util.i18n("DevPanelManager_Panel_info") + '</div>');
        var content = $('<div class="content"></div>');
        var panelBox = $('<div class="panel2dBox"></div>');
        this.content = content;
        //mainDiv.append(header);
        mainDiv.append(content);
        content.append(panelBox);
        panelBox.append($(this.container));
        // <div class="header">面板信息</div>
        //                 <div class="content">
        //                     <div class="panel2dBox">
        //                     </div>
        //                 </div>
        return mainDiv;
    },

    afterShow: function () {
        this.container.style.display = 'block';
        this.adjustViewBounds($('.panel2dBox').width(), $('.panel2dBox').height(), 0, 0);
    },

    resize: function () {
        this.adjustViewBounds($('.panel2dBox').width(), $('.panel2dBox').height(), 0, 0);
    },

    getContainer: function () {
        return this.container;
    },

    /**
     * 2D的network需要先加到body中，然后在adjustBounds，否则无效并且显示不出来
     * 这里既要处理network的bounds，还要处理map的bounds
     * 注意，每次从3D切换回来时都需要重新ajdust一把，并且要使得四个参数中至少有一个参数不一样，如果都一样twaver内部是会直接返回的
     */
    adjustViewBounds: function (width, height, left, top) {
        if (arguments.length < 1) {
            if (!this.flag) {
                this.flag = 1;
            } else {
                this.flag++
            }
            this.width = this.width + Math.pow(-1, parseInt(this.flag));
        } else {
            this.flag = 0;
        }
        this.left = left || this.left;
        this.top = top || this.top;
        this.width = width || this.width;
        this.height = height || this.height;
        this.mainSplit ? this.mainSplit.adjustBounds({ x: this.left, y: this.top, width: this.width, height: this.height }) : '';
        this.network.adjustBounds({ x: this.left, y: this.top, width: this.width, height: this.height });
        //        if(this.isCreateMap && this.map){
        //            this.map.setSize({width:this.width,height:this.height});
        //            this.map.content.style.left = this.left + 'px';
        //            this.map.content.style.top = this.top + 'px';
        //        }

        this.network.zoomOverview(); //居中一下，让其在adjustBound时弄一下
        // var oldZoom = this.network.getZoom();
        // this.network.setZoom(oldZoom - 0.1);

    },

    setPosition: function (node, x, y) {
        if (!node) return;
        node.setLocation(parseInt(x) || 0, parseInt(y) || 0);
    },


    /**
     * 2D的规则和3D的是一样的
     * @param node
     * @returns {*}
     */
    getDataByNode: function (node) {
        if (!node) {
            return null;
        }
        return this.sceneManager.getNodeData(node);
    },

    handleDoubleClick: function (element) {
        var node = element.element;
        var i = 0,
            eventHandler;
        for (; i < this._eventHandlers.length; i++) {
            eventHandler = this._eventHandlers[i];
            var data = this.getDataByNode(node);
            if (eventHandler.shouldHandleDoubleClickElement(node, this.network, data, element)) {
                eventHandler.handleDoubleClickElement(node, this.network, data, element);
                this.focusData = data;
                return;
            }
        }
    },

    handleDoubleClickBackground: function () {
        if (this.focusData && this.focusData.getParentId()) {
            var parentNode = this.sceneManager.dataNodeMap[this.focusData.getParentId()];
            if (parentNode) {
                this.sceneManager.viewManager3d.setFocusNode(parentNode);
            }
        }
        var i = 0,
            eventHandler;
        for (; i < this._eventHandlers.length; i++) {
            eventHandler = this._eventHandlers[i];
            if (eventHandler.shouldHandleDoubleClickBackground(this.network)) {
                eventHandler.handleDoubleClickBackground(this.network);
                return;
            }
        }
    },

    addEventHandler: function (eventHandler, index) {
        if (eventHandler instanceof it.EventHandler) {
            if (index === undefined) {
                return this._eventHandlers.push(eventHandler);
            } else {
                return this._eventHandlers.splice(index, 0, eventHandler);
            }
        }
    },

    removeEventHandler: function (eventHandler) {
        var index = this._eventHandlers.indexOf(eventHandler);
        if (index !== -1) {
            this._eventHandlers.splice(index, 1);
        }
    },

    createColumn: function (table, name, propetyName, propertyType, valueType, width) {
        var column = new twaver.Column(name);
        column.setName(name);
        column.setPropertyName(propetyName);
        column.setPropertyType(propertyType); //accessor,client,Styles
        if (valueType) {
            column.setValueType(valueType);
        }
        if (width) {
            column.setWidth(width);
        } else {
            column.setClient('pack', true);
        }
        column.renderHeader = function (div) {
            var span = document.createElement('span');
            span.style.whiteSpace = 'nowrap';
            span.style.verticalAlign = 'middle';
            span.style.padding = '1px 2px 1px 2px';
            span.innerHTML = column.getName() ? column.getName() : column.getPropertyName();
            span.setAttribute('title', span.innerHTML);
            span.style.font = 'bold 12px Helvetica';
            //            div.style.backgroundColor = '#ffab00';// 'rgba(255,0,0,1)';
            div.style.textAlign = 'center';
            div.style.border = 'none';
            div.appendChild(span);
            var tableHeader = div.parentNode.parentNode;
            tableHeader.style.width = '100%';
        };
        table.getColumnBox().add(column);
        return column;
    },

    addTableAndTree: function () {
        var view = this.network.getView();
        var tablePane = new twaver.controls.TablePane(this.table);
        var tableHeader = tablePane.getTableHeader().getView();
        tablePane.getTableHeader().setHeight(30);
        tableHeader.style.backgroundColor = 'rgb(42, 42, 42)';
        var tableDom = tablePane.getView();
        this.tableDom = tableDom;
        // tableDom.style.position = 'absolute';
        //        tableDom.style.bottom = '30px';
        //        tableDom.style.left = '400px';
        // var w = document.body.clientWidth, nw, nh, tbHeight;
        // if(w<1440){
        //     nw = 215;
        //     nh = 290;
        //     tbHeight = 360;
        // } else if(w>=1440 && w<1920){
        //     nw = 215;
        //     nh = 290;
        //     tbHeight = 360;
        // } else if(w>=1920){
        //     nw = 304;
        //     nh = 390;
        //     tbHeight = 360;
        // }
        // tableDom.style.width = nw + 'px';
        // tableDom.style.height = nh + 'px';
        tableDom.style.border = 'solid 1px #595959';
        // tableHeader.style.width = nw + 'px';
        var tableBody = tablePane.getTable().getView();
        // tableBody.style.height = tbHeight + 'px';
        //        view.appendChild(tableDom);

        this.portDiv = $('<div></div>');
        var portDiv = this.portDiv.get(0);
        this.blankDiv = $('<div></div>').get(0);


        var centerSplit = new twaver.controls.SplitPane(this.blankDiv, this.network, 'horizontal', 0.0);
        centerSplit.setDividerWidth(10);
        centerSplit.setDividerBackground('rgb(48, 48, 48)');

        var treeView = this.tree.getView();
        treeView.style.position = 'absolute';
        treeView.style.top = '30px';
        treeView.style.left = '30px';
        treeView.style.width = "160px";
        treeView.style.height = "250px";
        //        view.appendChild(treeView);

        this.mainSplit = new twaver.controls.SplitPane(this.tree, centerSplit, 'horizontal', 0.0);
        //        this.mainSplit.getView().style.position = 'absolute';
        this.mainSplit.setDividerWidth(0);
        var md = this.mainSplit.getView();
        md.style.position = 'absolute';

        md.style.left = 0 + 'px';
        md.style.top = 0 + 'px';
        md.style.right = 0 + 'px';
        md.style.bottom = 0 + 'px';

        this.container.appendChild(md);
        this.container.appendChild(view);

        this.tree.getToggleImage = function (data) {
            if (data.getChildrenSize() > 0) {
                return this.isExpanded(data) ? '../images/collapse_icon.png' : '../images/expand_icon.png';
            }
            return null;
        };
        this.tree.getIcon = function (data) { return null; };

        this.tree.setSortFunction(function (d1, d2) {
            return parseInt(d1.getToolTip()) - parseInt(d2.getToolTip());
        });
    },

    /**
     * table的样式应该是根据scene来的，不同scene有不同的table
     * @param scene
     */
    initTable: function () {
        var self = this;
        this.table.setEditable(true);
        //        this.table.onCellRendered = function (params) {
        //            if (params.column.getName() === 'Alarm Severity') {
        ////                params.div.style.backgroundColor = params.data.getAlarmSeverity().color;
        //            }
        //        };
        // var w = document.body.clientWidth, nw, nh;
        // if(w<1440){
        //     nw =  215/ 304;
        // } else if(w>=1440 && w<1920){
        //     nw =  215/ 304;
        // } else if(w>=1920){
        //     nw = 1;
        // }
        // var dataType = this.dataManager.getDataTypeForData(data);
        this.createColumn(this.table, '端口信息(' + self.portCount + ')', 'toolTip', 'accessor', 'string', true).setWidth(100);
        // this.createColumn(this.table,'类型', 'toolTip', 'accessor', 'string', true).setWidth(100 * nw);
        // this.createColumn(this.table,'MTU', 'toolTip', 'accessor', 'string', true).setWidth(100 * nw);
        //var column = this.createColumn(this.table, it.util.i18n("DevPanelManager_Port_insert"), 'toId', 'client', 'string', true);
        //column.setWidth(150);
        //        column.setHorizontalAlign('center');
        //        var setValue = column.setValue;
        //        column.setValue = function (data, value, view) {
        //            value = twaver.AlarmSeverity.getByName(value);
        //            setValue.call(column, data, value, view);
        //        };
        //        column.setEnumInfo(twaver.AlarmSeverity.severities.toArray());
        //        this.createColumn(this.table, 'Acked', 'acked', 'accessor', 'boolean', true).setWidth(50);
        //this.createColumn(this.table, it.util.i18n("DevPanelManager_Current_flow"), 'flow', 'client', 'string', true).setWidth(120);
        // var timeColumn = this.createColumn(this.table, it.util.i18n("DevPanelManager_Start_using_date"), 'raisedTime', 'client','Date');
        // timeColumn.setWidth(150);
        // timeColumn.setHorizontalAlign('center');
        // timeColumn.renderCell = function (params) {
        //     var span = document.createElement('span');
        //     span.innerHTML = it.Util.formatDate(params.value, 'yyyy-MM-dd hh:mm:ss');
        //     span.style.whiteSpace = 'nowrap';
        //     params.div.appendChild(span);
        // }
        this.table.setRowHeight(30);
        this.table.renderCell = function (params) {
            var div = params.div;
            var scrollDiv = div.parentNode.parentNode.parentNode.parentNode;
            var scrollParentDiv = div.parentNode.parentNode.parentNode.parentNode.parentNode;
            scrollDiv.style.overflowX = 'hidden';
            scrollDiv.style.width = '120px';
            scrollDiv.style.height = '480px';
            scrollParentDiv.style.overflow = 'hidden';

            div.style.textAlign = 'center';
            div.style.fontFamily = "Tahoma,Helvetica,Arial,\5b8b\4f53,sans-serif";
            div.style.border = 'none';
            params.div.parentNode.style.border = 'none';
            params.div.parentNode.style.width = '99%';
            if (params.rowIndex % 2 == 0) {
                params.div.parentNode.style.backgroundImage = '-webkit-linear-gradient(top, rgba(58, 58, 58, 0.5), rgba(58, 58, 58, 0.5))';
            } else {
                params.div.parentNode.style.backgroundImage = '-webkit-linear-gradient(top, rgba(48, 48, 48, 0.5), rgba(48, 48, 48, 0.5))';
            }

            var span = document.createElement('span');
            span.style.whiteSpace = 'nowrap';
            span.style.verticalAlign = 'middle';
            span.style.padding = '1px 2px 1px 2px';
            span.style.fontWeight = 'normal';
            //span.setAttribute('title', span.innerHTML);
            span.style.font = 'bold 12px Helvetica';
            span.innerHTML = params.value;
            div.append(span);

        };

        this.table.renderData = function (div, data, row, selected) {
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
            style.width = '98px';

            // backgroundColor = (row%2 == 0) ? 'rgba(84, 138, 160, 1.0)' : 'rgba(94, 148, 170, 1.0)'
            // style.backgroundColor = ((this.isCheckMode() && this._focusedRow === row) || (!this.isCheckMode() && selected)) ? backgroundColor : '';
            style.border = ((this.isCheckMode() && this._focusedRow === row) || (!this.isCheckMode() && selected)) ? '1px solid #00f6ff' : '';
            style.backgroundColor = ((this.isCheckMode() && this._focusedRow === row) || (!this.isCheckMode() && selected)) ? 'rgba(0, 246, 255, 0.8)' : '';
            style.color = ((this.isCheckMode() && this._focusedRow === row) || (!this.isCheckMode() && selected)) ? '#ffffff' : '';
            // style.color = ((this.isCheckMode() && this._focusedRow === row) || (!this.isCheckMode() && selected)) ? '#ffffff' : '';
            if ((this.isCheckMode() && this._focusedRow === row) || (!this.isCheckMode() && selected)) {
                if (self.$right) {
                    self.$right.remove();
                }
                if (self.intervalArr && self.intervalArr.length != 0) {
                    self.intervalArr.forEach(function (v) {
                        clearInterval(v);
                    });
                    self.intervalArr = [];
                }
                var equipment = '133_E0330';

                var portData = self.getPortData();
                var upload, download;
                if (portData) {
                    upload = portData.upload || false;
                    download = portData.download || false;
                }
                self._createRightPanel(self.$portPanel, equipment, upload, download);
            }
        }
    },

    /* 用了mainSplit 就不需要单独再刷新了
    refreshTable : function(){
        var view = this.network.getView();
        var tablePane = new twaver.controls.TablePane(this.table);
        var tableHeader = tablePane.getTableHeader().getView();
//        tableHeader.style.backgroundColor = 'rgba(255,255,255,0.1)';
        var tableDom = tablePane.getView();
        tableDom.style.position = 'absolute';
        tableDom.style.bottom = '30px';
        tableDom.style.left = '30px';
        tableDom.style.width = "500px";
        tableDom.style.height = "100px";
        view.appendChild(tableDom);
    },
    */

    showTable: function () {
        this.table.getColumnBox().clear();
        //        if(this.sceneManager._currentScene.getTwod()){
        this.table.getView().style.display = 'block';
        this.table.setVisibleFunction(function (node) {
            if (node.getName()) {
                return false;
            }
            if (!node.getName() && !node.getToolTip()) {
                return false;
            }
            if (node.getClient('group_id')) {
                return false;
            }
            return true;
        });
        this.initTable();
        //            this.refreshTable();
        //        }else{
        //            this.table.getView().style.display = 'none';
        //        }
    },

    showTree: function () {
        //        if(this.sceneManager._currentScene.getTwod()){
        this.tree.getView().style.display = 'block';
        this.tree.setLineType('dotted'); //线条类型 solid
        this.tree.setLineColor('#000000'); //线条颜色 #ffab00
        this.tree.setLineAlpha(1); //线条透明度
        this.tree.setLineThickness(0.5); //线条厚度
        this.tree.setLineDash([1, 1]);
        this.tree.setVisibleFunction(function (node) {
            if (!node.getName() && !node.getToolTip()) {
                return false;
            }
            return true;
        });
        this.tree.getLabel = function (data) {
            return data.getToolTip() || data.getName();
        };
        this.tree.expandAll();
        //            this.initTable(scene);
        //        }else{
        //            this.tree.getView().style.display = 'none';
        //        }
    },

    loadData: function (data, onLoadFinish) {
        if (!data) {
            return;
        }
        this.portCount = 0;
        this.isValidate = false;
        this.box.clear();
        var isTemplate = '';
        this.loadDataModel2D(data, onLoadFinish, isTemplate);
        this.showTree();
        this.showTable();
        this.addPortPanel(data);
    },


    /**
     * 加载2D dataType的templateDatas，如：板卡中的端口,灯泡等对象
     * @param dataType
     * @param parentData
     * @param onLoadFinish
     */
    loadDataTypeTemplateModel2Ds: function (dataType, parentData, parentNode, side, onLoadFinish, isTemplate) {
        var templateDatas = dataType.getTemplateDatas(side);
        if (templateDatas == null || templateDatas.length == 0) {
            return;
        }
        this.portCount = templateDatas.length;
        var self = this;
        var groups = {};
        templateDatas.forEach(function (data) { //可是child有groupID时呢(也就是data的hostId)
            data = self._translateTemplateData(data, parentData);
            var groupId = data.getHostId();
            // var parentNode = parentNode;
            var node = self.loadDataModel2D(data, onLoadFinish, isTemplate);
            node.setMovable(false);
            node.setClient('_template', data);
            node.setStyle('select.color', '#00f6ff');
            if (groupId) {
                self.setTemplatesGroup(node, groupId, parentNode, groups);
            } else {
                if (parentNode) {
                    var parentPos = parentNode.getLocation(),
                        pos = node.getLocation();
                    node.setLocation(pos.x + parentPos.x, pos.y + parentPos.y);
                    node.setHost(parentNode);
                    node.setParent(parentNode);
                }
            }
            node.setName("");
            var tooltip = data.getId();
            var parentId = parentData.getId();
            if (tooltip.length > (parentId.length + 1)) {
                tooltip = tooltip.substring(0, (tooltip.length - parentId.length - 3));
            }
            node.setToolTip(tooltip);
        });
    },

    setTemplatesGroup: function (node, groupId, parentNode, groups) {
        if (!node || !groupId) {
            return null;
        }
        if (!groups) {
            groups = {};
        }
        //并不是每次都要创建，一般第一次创建，后来再进入该面板(同一个面板实例)时就不需要创建了
        var nodeGroup = node.getParent();
        if (nodeGroup &&
            nodeGroup.getClient('group_id') &&
            nodeGroup.getClient('group_id') == groupId) {
            return;
        }
        var group = null;
        if (!groups[groupId]) {
            group = new twaver.Node();
            if (parentNode) {
                var parentData = this.getDataByNode(parentNode);
                group.setParent(parentNode);
                group.setClient('parent_data', parentData);
                group.setName('');
                group.setToolTip(groupId);
                group.setVisible(false);
            }
            group.setClient('group_id', groupId);
            groups[groupId] = group;
            this.box.add(group);
        } else {
            group = groups[groupId];
        }
        node.setHost(parentNode); //但是还是附着在面板上
        node.setParent(group);
    },

    loadDataModel2D: function (data, onLoadFinish, isTemplate) {
        var dm = this.dataManager;
        //获取数据类型
        var dataType = dm.getDataTypeForData(data);
        var id = data.getId();
        //data和node的缓存，key是id，value是node。如果一个data对应一个node可以，如果一个data对应多个node怎么处理
        // var node = this.dataNode2DMap[id];
        var model2d = dataType.getModel2d();
        var parameters = dataType.getModel2dParameters();
        var position = { x: 0, y: -80 }
            //获取背面的模型参数
        var model2d2 = dataType.getModel2d2();
        var parameters2 = dataType.getModel2d2Parameters();
        var position2 = { x: 0, y: 80 };


        // if (isTemplate == 'position') {
        //    //加载正面板,根据data加载node，并加入到box中
        //    if(model2d){
        //         var parentNode = this._loadNodeByData(data, model2d, parameters,it.util.i18n("DevPanelManager_Front_face"),isTemplate ? isTemplate : position);
        //         this.loadDataTypeTemplateModel2Ds(dataType,data,parentNode,false,onLoadFinish,isTemplate);
        //     } 
        // } else if (isTemplate == 'position2') {
        //     //加载背板
        //     if(model2d2 && parameters2)  {
        //         parentNode = this._loadNodeByData(data, model2d2, parameters2,it.util.i18n("DevPanelManager_Back_face"),isTemplate ? isTemplate : position2);
        //         this.loadDataTypeTemplateModel2Ds(dataType,data,parentNode,true,onLoadFinish,isTemplate);
        //     }
        // } else {
        if (model2d) {
            var parentNode = this._loadNodeByData(data, model2d, parameters, it.util.i18n("DevPanelManager_Front_face"), isTemplate ? isTemplate : position);
            this.loadDataTypeTemplateModel2Ds(dataType, data, parentNode, false, onLoadFinish, isTemplate);
        }
        if (model2d2 && parameters2) {
            parentNode = this._loadNodeByData(data, model2d2, parameters2, it.util.i18n("DevPanelManager_Back_face"), isTemplate ? isTemplate : position2);
            this.loadDataTypeTemplateModel2Ds(dataType, data, parentNode, true, onLoadFinish, isTemplate);
        }
        // }
        // if(model2d){
        //     var parentNode = this._loadNodeByData(data, model2d, parameters,it.util.i18n("DevPanelManager_Front_face"),!isTemplate && position);
        //     this.loadDataTypeTemplateModel2Ds(dataType,data,parentNode,false,onLoadFinish);
        // }


        // if(model2d2 && parameters2)  {
        //     parentNode = this._loadNodeByData(data, model2d2, parameters2,it.util.i18n("DevPanelManager_Back_face"),!isTemplate && position2);
        //     this.loadDataTypeTemplateModel2Ds(dataType,data,parentNode,true,onLoadFinish);
        // }

        return parentNode;
    },

    //根据data加载node
    _loadNodeByData: function (data, model2d, parameters, name, position) {
        var box = this.box;
        //根据2d的模型参数，加载2dNode数据
        var node = this.sceneManager.loadModel2D(model2d, parameters, data);
        if (!node || node.length < 1) {
            return null;
        }
        var parentNode = node;
        if (node instanceof Array) {
            parentNode = node[0];
            if (parentNode) {
                parentNode.setMovable(false);
                for (var i = 1; i < node.length; i++) {
                    var child = node[i];
                    if (child) {
                        child.setMovable(false);
                        this.sceneManager.setNodeData(data, child);
                        parentNode.addChild(child);
                        child.setHost(parentNode);
                    }
                }
            }
        }
        if (parentNode) {
            parentNode.setName(data.getName() + name || data.getId());
            this.sceneManager.setNodeData(data, parentNode);
            // this.dataNode2DMap[data.getId()] = parentNode;
            var position2d = data.getPosition2d();
            if (parentNode.getChildren().size() > 0 && position) {
                position2d = position;
            }
            var categoryId = this.sceneManager.dataManager.getCategoryForData(data).getId();
            if (categoryId == 'equipment') {
                if (position.y > 0) {
                    parentNode.setLocation(0, parentNode._height + 20);
                } else {
                    parentNode.setLocation(0, -20 - parentNode._height);
                }
            } else {
                if (position2d) {
                    this.setPosition(parentNode, position2d.x, position2d.y);
                }
            }
            var rotation = data.getRotation(); //template中保存的是角度制
            if (rotation) {
                parentNode.rotation = [rotation.x, rotation.y, rotation.z];
            }
        }
        if (!box.getDataById(node.getId())) { //如果板卡之前创建过，那一下子就会将其孩子加进去，所有接下来重新load child时会有重复的问题
            box.addByDescendant(node);
        }
        if (categoryId == 'port') {
            var pId = data.getParentId();
            if (!this.nodeMap[pId]) {
                this.nodeMap[pId] = {};
            }
            this.nodeMap[pId][data.getId()] = node;
        }
        return parentNode;
    },

    _translateTemplateData: function (data, parentData) {
        var id = data.getId(),
            parentId = parentData.getId(),
            pos = data.getPosition2d() || new mono.Vec2,
            pPos = parentData.getPosition2d() || new mono.Vec2;
        side = data.getUserData('side')
        var dataId = id + "@" + parentId + "@" + side / 1;
        var newData = this.dataManager.getDataById(dataId);
        if (!newData) {
            newData = data.clone(dataId);
            newData.setHostId(data.getHostId());
            //            this.dataManager.addData(newData,false); //不加到datamanager中
            var newPos = newData.getPosition2d() || new mono.Vec2;
            //每次新建时才换算成绝对的位置
            // pPos有可能是{x:"0",y:"0",z:"0"}，所以的转换
            newPos.x = parseInt(pPos.x || 0) + pos.x;
            newPos.y = parseInt(pPos.y || 0) + pos.y;
            newData.setRotation(data.getRotation());
        }
        newData.setParentId(parentId);
        return newData;
    },

    addPortPanel: function (data, onLoadFinish) {
        var self = this;
        var dm = this.dataManager;
        var dataType = dm.getDataTypeForData(data);
        // var title = dataType.getDescription() ? dataType.getDescription() : dataType.getId();
        // self.box.clear();
        // var isTemplate = '';
        // self.loadDataModel2D(data,onLoadFinish,isTemplate);

        // var $panel = $('<div class="portPanel"></div>');     
        // $panel.basePanel();
        // $panel.basePanel('createTitle', { title: title});
        // var tableTitle = $('<div id="togFace" style="margin-bottom:2px;">' + title + '</div>'),
        //     line = $('<span style="margin-left:5px">/</span>'), 
        //     face = $('<span style="margin-left:5px">正面</span>'), 
        //     togBtn = $('<span class="icon iconfont icon-switch-arrow" style="font-size:12px;margin-left:5px;cursor:pointer;"></span>');
        // tableTitle.append(line);
        // tableTitle.append(face);
        // tableTitle.append(togBtn);
        // $panel.append(tableTitle);
        this.$portPanel = $('<div class="portPanel"></div>');
        this.$portPanel.append($(this.tableDom));

        this.portDiv.empty();
        this.portDiv.append(self.$portPanel);
        $('#serverPanel').append(self.$portPanel);
        $('#serverPanel').parent().find('.ui-dialog-titlebar-close').on('click', function (e) {
            if (self.intervalArr && self.intervalArr.length != 0) {
                self.intervalArr.forEach(function (v) {
                    clearInterval(v);
                });
                self.intervalArr = [];
            }
            self.portOccupancyManager.closePanel();
            main.panelMgr.instanceMap.NavBarMgr.appManager.appMaps.EquipmentDetails.clear();
            main.panelMgr.instanceMap.NavBarMgr.$box.nav('clearAndIfClose', true); 
        });
        var id = data.getId();
        this.network.getView().removeEventListener('click', self.portOccupancyManager.selectChangFunction);
        this.portOccupancyManager.isShow = false;
        if (!(self.nodeMap[id] && (Object.keys(self.nodeMap[id]).length !== 0))) return;
        var div = $('<div class="app-btn-group clearfix btn-port" style = "position:absolute;right:20px;bottom:0px;z-index:999"></div>');
        $('#serverPanel').append(div);
        this.portOccupancyManager.init(id);
        var $div = $('<div class="active"><span class="icon-info iconfont" style="margin-right:5px;color:#00f6ff;font-size:20px"></span>' + it.util.i18n("OccupancyStatus") + '</div>');

        $div.appendTo(div);

        $div.on("click", function (e) {

            var id = e.target.getAttribute("id");
            var isShow = self.portOccupancyManager.isShow;
            if (!isShow) {
                self.portOccupancyManager.showPortsOccupancy();
                // var isAccess = self.portOccupancyManager.haveAccess();
                // if (isAccess) {
                util.msg2(it.util.i18n("Port_Occupancy_Select_Port_Edit"));
                self.portOccupancyManager.editPortMap = {};
                self.network.getView().addEventListener('click', self.portOccupancyManager.selectChangFunction);
                // }
            } else {
                self.portOccupancyManager.hidePortOccupancy();
                self.network.getView().removeEventListener('click', self.portOccupancyManager.selectChangFunction);
            }
        })
        // $("#serverPanel").parent().find('.ui-dialog-titlebar-close').on('click', function (e) {
        //     self.portOccupancyManager.closePanel();
        // });

        // var totalBtn = $('<button class="portPanelBtn">显示全部</button>');
        // $panel.append(totalBtn);

        // togBtn.click(function(){
        //     var size = face.text();
        //     self.box.clear();
        //     if (size == '正面') {
        //         var isTemplate = 'position2';
        //         self.loadDataModel2D(data,onLoadFinish,isTemplate);
        //         face.text('背面');
        //     } else if (size == '背面') {
        //         var isTemplate = 'position';
        //         self.loadDataModel2D(data,onLoadFinish,isTemplate);
        //         face.text('正面');
        //     }
        // });

        // totalBtn.click(function(){

        // });

        // var panel = $panel.get(0);
        // var serverPanel = $('#serverPanel').get(0);
        // var apptitle = $('#serverPanel').find('.app-title');
        // var target = $('<span id="moveTitle"></span>');
        // var value = apptitle.text();
        // apptitle.text('');
        // target.text(value);
        // apptitle.append(target);
        // targetDiv = target.get(0);
        // this.drag(panel,serverPanel,targetDiv);

        // var s_t,e_t;
        // targetDiv.addEventListener('mousedown', function(event){
        //     s_t = new Date().getTime();
        // },false);

        // targetDiv.addEventListener('mouseup', function(event){
        //     document.onmousemove = null;
        //     document.onmouseup = null;.
        //     e_t = new Date().getTime();
        //     var h_t = e_t - s_t;
        //     if (h_t > 200) {
        //         event.stopPropagation();
        //     }
        // },false);
    },

    getPortData: function () {
        var portData = {};
        var upload = parseInt(Math.random() * 150) + 'M/S';
        var download = parseInt(Math.random() * 150) + 'M/S';
        portData.upload = upload || '';
        portData.download = download || '';
        return portData;
    },
    _createRightPanel: function (inputPanel, equipment, upload, download) {
        if (!inputPanel || !equipment) {
            return null;
        }
        var self = this;
        this.$right = $('<div class="right clearfix"></div>').appendTo(inputPanel);
        this._createPortText(it.util.i18n("DevPanelManager_Port_insert"), it.util.i18n("DevPanelManager_Equipment") + equipment).appendTo(self.$right);
        this._createPortText(it.util.i18n("DevPanelManager_Start_using_date"), '2017-11-11').appendTo(self.$right);

        if (upload) {
            this._createPortText(it.util.i18n("DevPanelManager_Upstream_Rate"), upload).appendTo(self.$right);
            var $upload = $('<div id="uploadSpeed" style="width:100px;height:45px;"></div>').appendTo(self.$right);
            this._createChart($upload[0]);
        }
        if (download) {
            this._createPortText(it.util.i18n("DevPanelManager_Downstream_Rate"), download).appendTo(self.$right);
            var $download = $('<div id="downloadSpeed" style="width:100px;height:45px;"></div>').appendTo(self.$right);
            this._createChart($download[0]);
        }
    },

    _createPortText: function (text1, text2) {
        if (!text1 || !text2) {
            return null;
        }
        var $div = $('<div class="port-text"></div>');
        $('<p class="top-text">' + text1 + '</span>').appendTo($div);
        $('<p class="bottom-text">' + text2 + '</span>').appendTo($div);
        return $div;
    },

    _createChart: function (inputPanel, data) {
        var chart = echarts.init(inputPanel);
        var self = this;
        var data = [];
        var option = {
            animation: false,
            grid: {
                left: '0%',
                right: '0%',
                top: '0%',
                bottom: '0%',
                containLabel: false,
            },
            xAxis: [{
                type: 'category',
                boundaryGap: false,
                data: (function () {
                    var res = [];
                    var len = 10;
                    while (len--) {
                        res.push(len + 1);
                    }
                    return res;
                })(),
                axisLine: {
                    lineStyle: {
                        color: '#00f6ff',
                        width: 3
                    }
                }
            }],
            yAxis: [{
                type: 'value',
                splitLine: {
                    show: false
                },
                axisLine: {
                    lineStyle: {
                        color: '#00f6ff',
                        width: 3
                    },
                }
            }],
            series: [{
                name: '速率',
                type: 'line',
                symbol: 'none',
                areaStyle: { normal: { color: '#00f6ff' } },
                itemStyle: { normal: { color: '#00f6ff' } },
                data: (function () {
                        var len = 0;
                        while (len < 10) {
                            data.push((Math.random() * 10 + 5).toFixed(1) - 0);
                            len++;
                        }
                        return data;
                    })()
                    // data: data,
            }]
        };

        // 使用刚指定的配置项和数据显示图表。
        chart.setOption(option);
        var id = setInterval(function () {
            data.shift();
            data.push((Math.random() * 10 + 5).toFixed(1) - 0);
            var option = {
                series: [{
                    data: data,
                }]
            }
            chart.setOption(option);
        }, 1000);
        this.intervalArr.push(id);

    }

    // drag: function(oDrag, parentDiv, targetDiv) {
    //     var disX = dixY = 0;
    //     oDrag.onmousedown = function (event){
    //         var target = event.target;
    //         if (target !== targetDiv){
    //             return false;
    //         };
    //         var self =this;
    //         var event = event || window.event;
    //         disX = event.clientX - this.offsetLeft;
    //         disY = event.clientY - this.offsetTop;		

    //         document.onmousemove = function (event){
    //             var event = event || window.event;
    //             var iL = event.clientX - disX;
    //             var iT = event.clientY - disY;
    //             var maxL = parentDiv.clientWidth - oDrag.offsetWidth;
    //             var maxT = parentDiv.clientHeight - oDrag.offsetHeight

    //             iL <= 0 && (iL = 0);
    //             iT <= 0 && (iT = 0);
    //             iL >= maxL && (iL = maxL);
    //             iT >= maxT && (iT = maxT);

    //             self.style.left = iL + "px";
    //             self.style.top = iT + "px";
    //             return false;               
    //         };

    //         document.onmouseup = function (event){
    //             document.onmousemove = null;
    //             document.onmouseup = null;
    //             return false;
    //         };
    //         return false
    //     }
    // },

});