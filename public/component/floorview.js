(function ($) {
    $.widget("hud.floorview", {
        options: {
            scale: 30,
            width: 400,
            height: 400,
            selectedId: '',
            items: [ ],
            fillColor: 'rgba(255,255,255, 0.1)',
            selectedColor: 'rgb(0,142,148)',
            click: console.log,
            change: null,
            currentScene: 'floor',
            currentFloor: 'floor01',
            floorDatas: ['floor01','floor02','floor03'],
            doChangeFloor: console.log,
        },

        _create: function () {
            this.floorCounts = dataJson.floorCounts ? dataJson.floorCounts:this.options.floorDatas.length;//显示楼层的个数
            if(this.floorCounts>this.options.floorDatas.length) {
                this.floorCounts = this.options.floorDatas.length;
            }
            var pageStart = this.setFloorTipStart(this.options.currentFloor) || 0;
            this.currentPage = parseInt(pageStart/this.floorCounts);
            this.createFloorBox(pageStart);
        },

        createFloorBox: function (start) {
            var l = this.options.floorDatas.length;
            var $floorBox = this.floorBox = $('<div>').addClass('floor-box');
            this.element.append($floorBox);
            this.$floorBoxUl = $('#floor-box-ul');
            if(!this.$floorBoxUl.length) {
                var $ul = this.$floorBoxUl = $('<ul id="floor-box-ul"></ul>');
                $floorBox.append($ul);
            }
            var self = this;
            if(l>this.floorCounts){
                var $iconTop = $('<i class="iconfont icon-angle-top"></i>'),
                    $iconBottom = $('<i class="iconfont icon-angle-bottom"></i>');
                $floorBox.prepend($iconTop);
                $floorBox.append($iconBottom);
                var page = this.currentPage;
                var pageStart = 0;
                $iconTop.on('click', function(){
                    page++;
                    if(page>parseInt(l/self.floorCounts)) {
                        page = parseInt(l/self.floorCounts);
                    }
                    pageStart = page*self.floorCounts;
                    if(pageStart+self.floorCounts>self.options.floorDatas.length) {
                        pageStart = -self.floorCounts+self.options.floorDatas.length;
                    }
                    self.createFloorTip(pageStart);
                });
                $iconBottom.on('click', function(){
                    page--;
                    if(page<=0) {
                        page = 0;
                    }
                    pageStart = page*self.floorCounts;
                    if(pageStart<=0) {
                        pageStart = 0;
                    }
                    self.createFloorTip(pageStart);
                });
            }
            this.createFloorTip(start);
        },
        createFloorTip: function(start) {
            var self = this;  
            var end = start+this.floorCounts;      
            self.$floorBoxUl.empty();
            for(var i = start; i <end; i++) {
                var data = main.sceneManager.dataManager.getDataById(self.options.floorDatas[i]),
                    text = data._name,
                    desc = data._description,
                    $li = $('<li>').addClass('floor-box-li').attr('data-id', self.options.floorDatas[i]).text(text || desc);
                self.$floorBoxUl.prepend($li);
                if(self.isBasement(data) && (i+1)<end && !self.isBasement(self.options.floorDatas[i+1])) {
                    var div = $('<div></div>');
                    self.$floorBoxUl.prepend(div);
                    div.css({
                        'width': '100%',
                        'height': '6px',
                        'border-top': '1px solid #7b7b7b',
                        'border-bottom': '1px solid #7b7b7b',
                        'margin':'10px 0'
                    })
                }
                if(self.options.floorDatas[i] == self.options.currentFloor){
                    $li.addClass('currentFloor');
                    self.oldFloor = self.options.currentFloor;
                }
                $li.on('click', function(e){
                    var target = e.target;
                    $(target).addClass('currentFloor');
                    if(self.oldFloor) {
                        $("#floor-box-ul li[data-id='" + self.oldFloor + "']").removeClass('currentFloor');
                    }
                    self.options.currentFloor = $(target).data('id');
                    self.oldFloor =  self.options.currentFloor;
                    self._trigger('doChangeFloor', e, self.options.currentFloor)
                })   
            }
        },
        setFloorTipStart: function(currentFloor) {
            this.options.currentFloor = currentFloor;
            var index = this.options.floorDatas.indexOf(currentFloor);
            var pageStart = (parseInt(index/this.floorCounts))*this.floorCounts;
            if(pageStart+this.floorCounts>this.options.floorDatas.length) {
                pageStart = -this.floorCounts+this.options.floorDatas.length;
            }
            return pageStart;
        },
        isBasement: function(dataOrId) {
            if(!dataOrId) {
                return;
            }
            if(typeof dataOrId == 'string') {
                var data =  main.sceneManager.dataManager.getDataById(dataOrId);
            }else {
                var data = dataOrId;
            }
            var text = data._name,
                desc =data._description,
                index = data.getExtend().index || 0,
                exg = /\u8d1f/; //负：\u8d1f
            return (index<0 || data._id.match(exg) || text.match(exg) || desc.match(exg));        
        },
        destory: function() {
            if(this.element) {
                this.element.remove();
                this.element = null;
            }
        }
    })
})(jQuery)