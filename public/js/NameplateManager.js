/**
 * 初始需求，明示focus的机柜和设备的位置信息
 * 铭牌内容 : building-floor-room-rack-equipemnt
 * 为了自定义铭牌的显示格式，可以在navBar.js中配置:
 * separator: 分隔符,默认"-" ,
 * format: 格式,默认b-f-r-rk-e, 每个字母代表一个Category，
 * 还可再字母后面定义显示的内容（描述(d)/名称(n)/ID(i)），默认按照描述/名称/ID的优先级显示
 * 针对设备除d/n/i外，还多一个u,表示显示的U位
 * 针对机柜除d/n/i外，还多一个rc,表示显示的行列
 * 例如b:d-f:n-r:n-rk:d-e:n
 * @constructor
 */
it.NameplateManager = function(sceneManager) {
    this.sceneManager = sceneManager;
    this.network = sceneManager.network3d;

    this._posInfo = {};
    this._cache = true;
    this.init();
}

mono.extend(it.NameplateManager, Object, {
    init: function() {
        var self = this;
        this.sceneManager.addSceneChangeListener(function() {
            self.hideNameplate();
        });
        if (dataJson && dataJson.isShowNameplate) {
            this.getCategoryFormat();
        }
        
    },
    showNameplate: function(node, data, category) {
        // if(category == 'earth' 
        // 	|| category == 'dataCenter' 
        // 	|| category == 'building'
        // 	|| category == 'floor' 
        // 	|| category == 'room')return;
        if (category == 'rack' ||
            category == 'equipment') {
            if (dataJson.isShowNameplate) {
                this._showNameplate(node, data);
            }
        }

    },
    getCategoryFormat: function(){
        if(!dataJson)return;
        var format = 'b-f-r-rk-e:u', separator = '-';
        if(dataJson.nameplate){
            format = dataJson.nameplate.format;
            separator = dataJson.nameplate.separator || '-';
        }
        if(typeof(format) === 'string'){
            var result = this.parseFormat(format);
            this._categoryFormat['rack'] = result;
            this._categoryFormat['equipment'] = result;
        } else if(typeof(format) === 'object'){
            this._categoryFormat['rack'] = this.parseFormat(format.rack);
            this._categoryFormat['equipment'] = this.parseFormat(format.equipment);
            this._cache = false;
        }
        if(typeof(separator) === 'string'){
            this._categorySeparator['rack'] = separator;
            this._categorySeparator['equipment'] = separator;
        } else if(typeof(separator) === 'object'){
            this._categorySeparator['rack'] = separator.rack;
            this._categorySeparator['equipment'] = separator.equipment;
            this._cache = false;
        }
    },

    //当触发lookAt时就隐藏
    hideNameplate: function() {
        if (this.$view) {
            this.$view.fadeOut('fast');
            this.$content.text()
            this._show = false;
            this.sceneManager.viewManager3d.removeRenderCallback(this);
        }
    },
    _showNameplate: function(node, data) {
        this.node = node;
        var self = this;
        var pos = this.getPosition(node);
        var info = this.getNameplateInfo(data);
        if (!this.$view) {
            this.$view = $('<div></div>').attr('align', 'center').addClass('nameplate_layout').appendTo($(this.network.getRootView()));
            this.$content = $('<div></div>').addClass('nameplate truncated').appendTo(this.$view);
            $('<div></div>').addClass('arrow-bottom').appendTo(this.$view);
            this.$content.mouseover(function(event) {
                $(this).removeClass('truncated')
                self.onRenderCallback();
            });
            this.$content.mouseout(function(event) {
                $(this).addClass('truncated');
                self.onRenderCallback();
            });
        }
        setTimeout(function() {
            self.$content.text(info);
            self.refreshPosition(pos);
            self.$view.fadeIn('fast');
            self._show = true;
            self.sceneManager.viewManager3d.addRenderCallback(self);
        }, 200);

    },
    categoryMap: {
        b: 'building',
        f: 'floor',
        r: 'room',
        rk: 'rack',
        e: 'equipment'
    },
    _categoryFormat: {},
    _categorySeparator: {},
    parseFormat: function(format){
        format = format || 'b-f-r-rk-e:u';
        if(format === 'self'){
            this._categoryFormat = format;
            return;
        }
        var result = {}, array = format.split('-'), ele, 
            category, content, last, cat;
        for(var i=0;i<array.length;i++){
            ele = array[i];
            if(ele.indexOf(':')>0){
                var eleArr = ele.split(':');
                category = eleArr[0];
                content = eleArr[1];
            } else {
                category = ele;
            }
            cat = this.categoryMap[category];
            result[cat] = {
                next: last,
                content: content?content:'default'
            };
            last = cat;
        }
        // this._categoryFormat = result;
        return result
    },
    getNameplateInfo: function(data) {
        // 位置信息，一直往上找，直到楼为止
        // if(!this._categoryFormat){
        //     var format = dataJson && dataJson.nameplate?dataJson.nameplate.format:'';
        //     this.parseFormat(format);
        // }
        // if(!this._categorySeparator){
        //     this._categorySeparator = dataJson && dataJson.nameplate?(dataJson.nameplate.separator || '-'):'-';
        // }
        var categoryId = this.getCategoryId(data);
        this._format = this._categoryFormat[categoryId];
        this._separator = this._categorySeparator[categoryId];
        var nameplate = this.assembleInfo(data);
        this._format = undefined;
        this._separator = undefined;
        return nameplate;
        // TODO：delete below line
        // return '数据机房 - 二楼 - 2-1 - rack95 - 8U数据机房 - 二楼 - 2-1 - rack95 - 8U数据机房 - 二楼 - 2-1 - rack95 - 8U';
        
    },
    getCategoryId: function(data){
        return this.sceneManager.dataManager.getDataTypeForData(data).getCategoryId();
    },
    assembleInfo: function(data) {
        var self = this,
            id = data.getId();
        // var itemInfo = self._posInfo[id];
        // if (self._posInfo.hasOwnProperty(id)) return itemInfo;

        // var selfInfo = data.getName() || data.getDescription() || data.getId();
        var categoryId = this.getCategoryId(data),
            loc = data.getLocation(),
            selfInfo;
        //rack 和 equipment的自身描述有不同
        var np = this._format?this._format[categoryId]:undefined;
        if(np){
            selfInfo = data.getName() || data.getDescription() || id;
            switch (np.content)
            {
            case 'd':
                if(data.getDescription()){
                    selfInfo = data.getDescription();
                }
                break;
            case 'n':
                if(data.getName()){
                    selfInfo = data.getName();
                }
                break;
            case 'i':
                selfInfo = id;
                break;
            case 'u':
                if(categoryId === 'equipment' && loc.y && loc.y !== '0'){
                    selfInfo = loc.y + "U";
                }
                break;
            case 'un':
                if(categoryId === 'equipment' && loc.y && loc.y !== '0'){
                    selfInfo = loc.y + "U "+this._separator+" " + selfInfo;
                }
                break;
            case 'rc':
                if (categoryId === 'rack' && loc.x && loc.x !== '0' && loc.z && loc.z !== '0') {
                    selfInfo = loc.z + it.util.i18n("NameplateManager_row") + "，" + loc.x + it.util.i18n("NameplateManager_column");
                }
                break;
            }
        }
        
        if(!np.next){
            return selfInfo;
        }
        if (categoryId === 'building') {
            itemInfo = selfInfo;
        } else {
            // var parentId = data.getParentId();
            var next = self.getNextAssemble(data, np.next);
            if (next) {
                // var parent = self.sceneManager.dataManager.getDataById(parentId);
                var pInfo = self.assembleInfo(next);
                if(pInfo && selfInfo){
                    itemInfo = pInfo + " "+this._separator+" " + selfInfo;
                } else if(pInfo && !selfInfo){
                    itemInfo = pInfo;
                } else if(!pInfo && selfInfo){
                    itemInfo = selfInfo;
                }
            } else {
                itemInfo = selfInfo;
            }
        }
        if(this._cache)self._posInfo[id] = itemInfo;
        // self._posInfo[id] = itemInfo;
        return itemInfo;
    },
    getNextAssemble: function(data,category){
        var parentId = data.getParentId();
        var parent = this.sceneManager.dataManager.getDataById(parentId);
        if(!parent){
            return;
        }
        var catId = this.getCategoryId(parent);
        if(catId === category){
            return parent;
        } else {
            return this.getNextAssemble(parent, category);
        }

    },
    getPosition: function(node) {
        var boundingBox = node.getBoundingBox();
        var position = node.getWorldPosition();
        var x = position.x + boundingBox.center().x,
            y = position.y + boundingBox.max.y,
            z = position.z + boundingBox.center().z;
        return this.network.getViewPosition(new mono.Vec3(x, y, z))
    },
    onRenderCallback: function() {
        if (!this._show) return;
        var pos = this.getPosition(this.node);
        this.refreshPosition(pos);
    },
    refreshPosition: function(pos) {
        var top = pos.y - this.$view.height();
        this.$view.css({
            left: pos.x - this.$view.width() / 2,
            top: top > 25 ? top : 25
        });
    }
});