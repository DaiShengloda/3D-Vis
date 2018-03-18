
/***
 * 显示/隐藏属性框
 * 1.每到一个新的场景（scene）时，就会重新组织该Filter，该Filter永远是跟着当前场景的数据来的。
 * 2.有懒加载的问题，check明明没让它显示，可是后来加载的都会显示。因此，在这里我们处理不是node，而是data（不管是不是已经创建3D对象，但是data是存在）
 * @type {FilterMenu}
 */

it.FilterMenu = function(parentID,sceneManager){
    it.ToolBarButton.call(this);
    this.parent = $('#' + parentID||'');
    this.sceneManager = sceneManager;
    this.button,this.itemsContent;
    this.isShow = false;
    this.isGroupByCategory = (typeof dataJson.isGroupByCategory != 'undefined')  ? dataJson.isGroupByCategory : true;//表示是否按照category来处理显示/隐藏,这样的话category相同的话就会合并在一起；否则就按照type_id来处理的
    this.categoryGroupMap = {}; //用来存放每个category所对应的asset_type_id,{'rack':['type1','type2']}
    this.lastGroupPane;
    this.createMenuButton();
    this.createContentPanel();
    this.visibleManager = new it.VisibleManager(this.sceneManager);
    this.sceneManager.viewManager3d.addVisibleFilter(this.visibleManager);
    var self = this;
    this.sceneManager.addSceneChangeListener(function(eve){ 
        self.visibleManager.clear(); //当场景发生改变时，需要清空，否则在floor中隐藏的foor，到了building中依然是被隐藏的，以至于没法操作
    });
    this.visibleType = {}; //filter中有些类型去掉了，但是为了保证也能被隐藏/显示，所在这里记录一下，使之跟rootSceneData绑在一起
    this.uncheckedCategoryMap = {
        //'seat':'none',
    }
    this.excludeCategorMap = {
        'seat':true,
    }
};

mono.extend(it.FilterMenu,it.ToolBarButton,{

    initClickFunction:function(){
        // 将'.itv-checkbox-line'的click换成check的change更加的合理
        $('.itv-checker>span>input[type="checkbox"]').change(function(eve){
            var checkbox = $(eve.currentTarget);
            var iconSpan = checkbox.parent();//$('.checker>span');
            if(checkbox.is(':checked')){
                iconSpan.attr('class','checked');
            }else{
                iconSpan.attr('class','check');
            }
        });
    },

    getClass : function(){
        return 'filter-menu-menu-image';
    },

    getToolButtonId : function(){
        return 'inputDiv';
    },

    getTooltip : function(){
        return it.util.i18n("FilterMenu_Asset_filter");
    },

    changeCheckbox : function(checkboxSelector,checked){
        if(!checkboxSelector){
            return;
        }
        if(checkboxSelector.length > 0){
            checkboxSelector[0].checked = checked;
        }
        var iconSpan = checkboxSelector.parent();//$('.checker>span');
        if(!iconSpan){
            return;
        }
        if(checkboxSelector.is(':checked')){
            iconSpan.attr('class','checked');
        }else{
            iconSpan.attr('class','check');
        }
    },

    loadAllItems: function () {
        this.cleanAllMap();
        var currentTypes = this.sceneManager.getSceneDataTypes();
        if (currentTypes) {
            this.setData(currentTypes);
        }
    },

    showFilterMenu : function(){
        // $('.filter-menu-menu-image').show();
        this.setVisible(true);
    },

    hideFilterMenu : function(){
        // $('.filter-menu-menu-image').hide();
        this.setVisible(false);
        this._setAllTypeVisible(true); //得保持一致
        this.hiddenItems();
    },

    setData: function (assetTypes) {
        this.visibleType = {};
        if (assetTypes) {
            var typesWithOutDup = [];
            if (this.isGroupByCategory) {
                typesWithOutDup = this._excludeDuplicateAssetTypes(assetTypes);
            }else{
                for (var typeId in assetTypes) {
                    var dataType = assetTypes[typeId];
                    typesWithOutDup.push(dataType);
                }
            }
            if (typesWithOutDup && typesWithOutDup.length) {

                var itemType = 'checked_all';
                var index = this._createCheckBoxIdByTag(itemType);
                this.addItem(index, itemType, it.util.i18n("FilterMenu_All_select"), 'checked');

                var hasItem = false;

                for (var i = 0; i < typesWithOutDup.length; i++) {
                    var assetType = typesWithOutDup[i];
                    if (!assetType) continue;
                    if(this.excludeCategorMap && this.excludeCategorMap[assetType.getCategoryId()]){
                        continue;
                    }
                    if (!this.visibleFunction(assetType)) {
                        this.visibleType[assetType.getId()] = assetType;
                        continue;
                    }
                    var itemId = assetType.getId();
                    var itemName = assetType.getDescription()||itemId;
                    if (this.isGroupByCategory) {
                        itemId = assetType.getCategoryId();
                        var category =  this.sceneManager.dataManager.getCategoryForDataType(assetType);
                        if(category){
                            itemName = category.getDescription()||category.getId();
                        }
                    }
                    this.putValueToCategoryGroupMap(assetType.getCategoryId(), itemId);
                    if (itemId) {
                        var id = this._createCheckBoxIdByTag(itemId);
                        var v ='checked';
                        if(this.uncheckedCategoryMap[assetType.getCategoryId()]){
                            v = this.uncheckedCategoryMap[assetType.getCategoryId()];
                        }
                        this.addItem(id, itemId, itemName, v);
                        hasItem = true;
                    }
                }
                if (!hasItem) { // 如果没有item的话，“全选”checkbox也应该去掉
                    this.cleanAllMap();
                }
            }
        }
        this.initClickFunction();
    },

    _excludeDuplicateAssetTypes: function (assetTypes) {
        if (!assetTypes) {
            return null;
        }
        var resultTypes = [];
        for (var typeId in assetTypes) {
            var assetType = assetTypes[typeId];
            var exists = false;
            if (assetType && assetType.getCategoryId()) {
                for (var j = 0; j < resultTypes.length; j++) {
                    if (resultTypes[j].getCategoryId()
                        && resultTypes[j].getCategoryId() == assetType.getCategoryId()) {
                        exists = true;
                    }
                }
            }
            if (!exists) {
                resultTypes.push(assetType);
            }
        }
        return resultTypes;
    },

    putValueToCategoryGroupMap: function (category, itemId) {
        if (!category || !itemId) return;
        if (!this.categoryGroupMap) {
            this.categoryGroupMap = {};
        }
        var values = this.categoryGroupMap[category];
        if (!values) {
            values = [];
            this.categoryGroupMap[category] = values;
        }
        values.push(itemId);
    },

    _createCheckBoxIdByTag: function (tag) {
        if (!tag) {
            return null;
        }
        return 'cb_menu_' + tag;

    },

    cleanAllMap: function () {
        this.categoryGroupMap = {};
        this.lastGroupPane = null;
        this.itemsContent.empty();
    },

    createMenuButton: function () {
        var self = this;
        // this.button = $('<div id ="inputDiv" class="filter-menu-menu-image"></div>');
        // if (this.parent) {
            // this.parent.append(this.button);
        // }
        this.button.click(function () {
            if (this.isShow) {
                this.isShow = false;
                self.hiddenItems();
            } else {
                this.isShow = true;
                self.showItems();
            }
        });
    },

    createContentPanel: function () {
        // this.itemsContent = $('.items-content');
        if (!this.itemsContent || this.itemsContent.length < 1) {
            this.itemsContent = $('<div class="items-content it-shadow"></div>');
        } else {
            this.itemsContent.empty();
        }
        this.parent.append(this.itemsContent);
    },


    getValuesByCategory: function (category) {
        if (!category || !this.categoryGroupMap) {
            return;
        }
        return this.categoryGroupMap[category];
    },

    visibleFunction: function (assetType) {
        return true;
    },

    /**
     *
     * @param id
     * @param type
     * @param name
     * @param defaultValue
     * @param isFloorInstanceof 表示该item是不是floor的实例
     */
    addItem: function (id, type, name, defaultValue) { //, isFloorInstanceof
        var self = this;
        var checked = '';
        if (defaultValue) {
            checked = defaultValue;
        }
        name = name || id;
        var item = $('<label id="lb_' + id + '" class="checkbox-class itv-checkbox-line">' +
            '<div class="itv-checker"><span class="'+checked+'" >' +
            '<input id="' + id + '" type="checkbox" ' + checked + ' ></span>' +
            '</div>'+ name +'</label>');
        var groupPane = this._getItemGroup();// group 用于自动分组，如果item超多时，会往下累加的老长老长的
        if (!groupPane) {
            return;
        }
        groupPane.append(item);

        if (type != 'checked_all') {
            this._setTypeVisible(type, true); //, isFloorInstanceof
        }

        $("#" + id).change(function () {
            var visible = false;
            var dm=self.sceneManager.dataManager;
            var rootData = self.sceneManager.getNodeData(self.sceneManager.getCurrentRootNode());
            var rootType = dm.getDataTypeForData(rootData);
            var rootTypeId=rootType.getId();
            if ($('#' + id)[0].checked) { //表示选中了
                if (self.isGroupByCategory){
                    if ($('#cb_menu_floor').is(":checked") || $('#cb_menu_checked_all').is(":checked")){ 
                        visible = true;
                    }else{
                        visible = false;
                    }
                } else {
                    if ($('#cb_menu_checked_all').is(":checked") || $('#cb_menu_'+rootTypeId).is(":checked")){
                        visible = true;
                    }else{
                        visible = false;
                    }                  
                } 
            } else {
                visible = false;
            }
            if (type === 'checked_all' || type === 'floor' || type === rootTypeId) {
                self._setAllTypeVisible(visible);
                main.sceneManager.viewManager3d.clearVisibleMap();
            } else {
                self._setTypeVisible(type, visible);//, isFloorInstanceof
                main.sceneManager.viewManager3d.clearVisibleMap();
            }
            self.dealInvisibleFilter(type,visible); // 过滤掉的跟着rootData变动
        });
        if(checked !== 'checked'){
            self._setTypeVisible(type, false);
        }
    },

    /**
     * 隐藏/显示某个“类型”(可能是类型实例，也可能是类型的category)的资产
     * @param type
     * @param visible
     * @param isFloorInstanceof 表示的是不是floor实例，用来隐藏/显示整个楼层
     * @private
     */
    _setTypeVisible: function (type, visible) {
        if (!type) return;
        if (this.isGroupByCategory) {
            this.setVisibleByTypeOrCategoryId(type, visible,true);
        } else {
            this.setVisibleByTypeOrCategoryId(type,visible,false);
        }
    },

    dealInvisibleFilter : function(typeIdOrCategoryId,visible){
        if (!this.visibleType || !typeIdOrCategoryId) {
            return;
        }
        var dm = this.sceneManager.dataManager;
        var rootData = this.sceneManager.getNodeData(this.sceneManager.getCurrentRootNode());
        var rootType = dm.getDataTypeForData(rootData);
        var rootCategory = dm.getCategoryForDataType(rootType);
        if (this.isGroupByCategory) {
             if (typeIdOrCategoryId === 'checked_all' || (rootCategory && rootCategory.getId() === typeIdOrCategoryId)) {
                for (var id in this.visibleType) {
                    var vt = this.visibleType[id];
                    var vtc = dm.getCategoryForDataType(vt);
                    if (vtc) {
                        this.setVisibleByTypeOrCategoryId(vtc.getId(),visible,true);
                    }
                }
             }
        }else{
            if(typeIdOrCategoryId === 'checked_all' || (rootType && rootType.getId() === typeIdOrCategoryId)){
                 for (var id in this.visibleType) {
                    this.setVisibleByTypeOrCategoryId(id,visible,false);
                }
            }
        }
    },

    _setAllTypeVisible: function (visible) {
        if (!this.categoryGroupMap)return;
        for (var category in this.categoryGroupMap) {
            if (category
                && this.categoryGroupMap[category]
                && this.categoryGroupMap[category].length > 0) {
                var typeIds = this.categoryGroupMap[category];
                for (var i = 0; i < typeIds.length; i++) {
                    var typeId = typeIds[i];
                    if (!typeId) continue;
                    var id = this._createCheckBoxIdByTag(typeId);
                    if (!id)continue;
                    this.changeCheckbox($('#' + id),visible);
                    this._setTypeVisible(typeId, visible);
                }
            }
        }
    },

    _getItemGroup: function () {
        if (!this.lastGroupPane || this.lastGroupPane.totalItems > 7) {
            this.lastGroupPane = $('<div class="filter-menu-item-group"></div>');
            this.itemsContent.append(this.lastGroupPane);
        }
        if (this.lastGroupPane.totalItems) {
            this.lastGroupPane.totalItems++;
        } else {
            this.lastGroupPane.totalItems = 1;
        }
        return this.lastGroupPane;
    },

    /**
     * 根据typeid或categoryId来批量隐藏/显示；
     * 注意这里不去判断node，因为有可能是lazyload(还没有创建3D对象)
     * @param typeOrCategoryId
     * @param visible
     * @param checkCategory 是否是判断类别
     */
    setVisibleByTypeOrCategoryId: function (typeOrCategoryId, visible,checkCategory) {
        if (!typeOrCategoryId) return;
//        var nodeMap = this.sceneManager.dataNodeMap;
        var currentSceneDatas = this.sceneManager.getSceneDatas();//当前场景的，如果场景切换时，需要注意先后顺序
        for(var dataId in currentSceneDatas){
//            var data = this.sceneManager.dataManager.getDataById(dataId);
            var data = currentSceneDatas[dataId];
            if(!data){
                continue;
            }
            var dataType = this.sceneManager.dataManager.getDataTypeForData(data);
            if(checkCategory){
                if(dataType.getId() && dataType.getCategoryId() === typeOrCategoryId){
                    this.visibleManager.setVisible(data,visible);
                }
            }else{
                if(dataType.getId() && dataType.getId() === typeOrCategoryId){
                    this.visibleManager.setVisible(data,visible);
                }
            }
        }
        this.sceneManager.network3d.dirtyNetwork();
    },

    /**
     * 判断该assetType是否被勾选
     * @param assetType
     * @private
     */
    _isCheckByAssetType: function (assetType) {
        if (!assetType) return true;
        var itemId = assetType.asset_type_id;
        if (this.isGroupByCategory) {
            itemId = assetType.category;
        }
        var index = this._createCheckBoxIdByTag(itemId);
        if ($('#' + index)[0]) {
            return $('#' + index)[0].checked;
        } else {
            return true;
        }
    },

    showItems: function () {
        this.itemsContent.show('normal');
    },

    hiddenItems: function () {
        this.itemsContent.hide('normal');
    },


    visibleCheckerByCategory: function (category, visible) {
        if (!category) {
            return;
        }
        var itemIds = this.getValuesByCategory(category);
        if (itemIds && itemIds.length > 0) {
            for (var j = 0; j < itemIds.length; j++) {
                var id = this._createCheckBoxIdByTag(itemIds[j]);
                if (id) {
                    id = 'lb_' + id;
                    if (visible) {
                        $('#' + id).show();
                    } else {
                        $('#' + id).hide();
                    }
                }
            }
        }
    },

    setCheckedByCategory: function (category, isChecked) {
        if (!category) {
            return;
        }
        var itemIds = this.getValuesByCategory(category);
        if (itemIds && itemIds.length > 0) {
            for (var j = 0; j < itemIds.length; j++) {
                var id = this._createCheckBoxIdByTag(itemIds[j]);
                if (id) {
                    this.changeCheckbox($('#' + id),isChecked);
                }
            }
        }
    },

    setCheckedById: function (itemId, isChecked) {
        if (!itemId) return;
        var id = this._createCheckBoxIdByTag(itemId);
        if (id) {
            this.changeCheckbox($('#' + id),isChecked);
        }
    },

});


