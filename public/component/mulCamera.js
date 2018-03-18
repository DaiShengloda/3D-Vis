(function ($) {
    $.widget("hud.mulCamera", {
        // default options
        options: {
            cameraGroup: '',
            firstFieldset: false,
        },

        _create: function () {
            var self = this;
            var el = this.element;
            var cameraGroup = this.sortGroup(this.options.cameraGroup);
            this._createBoxs(cameraGroup);
        },

        sortGroup: function(cameraGroup) {
            var newCameraGroup = [];
            if (!cameraGroup.length){
                return newCameraGroup;
            }
            var groupData = {},
                sortNumMap = [];              
            for(var i in cameraGroup){
                var group = cameraGroup[i]; 
                var sortNum = group.sortNum;
                sortNumMap[i] = sortNum;
                groupData[sortNum] = group;
            };
            sortNumMap.sort(function(a,b){return a-b});
            for(var i in sortNumMap){
                var sortNum = sortNumMap[i]; 
                newCameraGroup[i] = groupData[sortNum];
            };     
            return newCameraGroup;       
        },

        _createBoxs: function(cameraGroup) {
            if (!cameraGroup.length)return;
            for(var i in cameraGroup) {
                var group = cameraGroup[i];      
                this._createBox(group);
            };        
        },

        _createBox: function(group) {
            var self = this;
            var boxTitle = group.boxTitle;
            var id = group.id;
            var defaultGroup = group.defaultGroup;
            var mulCameraBox = this.mulCameraBox = $('<fieldset class="mul-camera-box unSelected"></fieldset>').appendTo(this.element);
            if (defaultGroup) {
                this.mulCameraBox.addClass('defaultGroup').siblings().removeClass('defaultGroup');
            };
            if (!this.options.firstFieldset) {
                this.mulCameraBox.addClass('firstFieldset').siblings().removeClass('firstFieldset');
                this.options.firstFieldset = true;
            };
            var title = $('<legend class="mul-camera-title">'+boxTitle+'</legend>').appendTo(this.mulCameraBox);
            var rowsValue = group.rowsValue
            this._createRows(rowsValue);
            mulCameraBox.on('click', function() {
                self._trigger("showCameras", event, {id: id, ele: $(this)});
            })
        },

        _createRows: function(rowsValue) {
            if(!rowsValue.length)return;
            for(var i in rowsValue) {
                var rowValue = rowsValue[i];
                this._createRow(rowValue);
            };
        },

        _createRow: function(rowValue) {
            var mulCamerRow = $('<div class="mul-camera-row"></div>').appendTo(this.mulCameraBox );
            var className = rowValue.className,
                value = rowValue.value;
            var icon = $('<span class="iconfont icon"></span>').appendTo(mulCamerRow);
            icon.addClass(className);
            var span = $('<span>'+value+'</span>').appendTo(mulCamerRow);
        },

        handlerFirstBox: function() {
            this.element.find('.defaultGroup').eq(0).trigger('click');
        },

        _setOption: function (key, value) {
            this._super(key, value);
        },

        console: function() {
            console.log('mulCamera');
        },

        _destroy: function () {
            this.element.empty();
        }

    })
})(jQuery)
