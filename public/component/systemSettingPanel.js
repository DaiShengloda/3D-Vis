(function($){
    $.widget('hud.systemSettingSection',{
        options: {},
        createSection: function(container,id){
            var sectionDiv = $('<div class="systemSetting_section" id="section_'+id+'"></div>').appendTo(container);
            this.createSectionTitle(sectionDiv,id);
            return sectionDiv;
        },
        createSectionTitle: function(parent,id){
            var titleDiv = $('<div class="systemSetting_sectionTitle"></div>').text(it.util.i18n('SystemSetting_'+id)).appendTo(parent);
        }
    })
    $.widget('hud.rackNumberDisplay', $.hud.systemSettingSection, {
        options: {},
        _create: function(){
            var el = this.element;
            var self = this;
            var container = this.options.container;
            var sectionWrapper = this.createSection(container,'rackNumber');
            this.stickerVals = [];
            this.oldResult = {};
            this.defaultSetting = {
                showType: 'none'
            };
            this.createSectionContent(sectionWrapper);
            //根据上次输入值创建对话框
            var oldSetting;
            if(localStorage.getItem('systemSetting')){
                oldSetting = JSON.parse(localStorage.getItem('systemSetting'))['rackNumberDisplay'];
            }
            if(!oldSetting){
                oldSetting = this.defaultSetting;
            }
            setTimeout(function(){
                self.loadData(oldSetting);
            },50)
        },
        createSectionContent: function(parent){
            var self = this;
            this.isChecked = false;
            // var defaultColor = '#000';
            
            //是否选中
            var isShowDiv = $('<div class="rackNumber_area rackNumber_checkedArea">\
            <span class="rackNumber_label">'+it.util.i18n('RackNumber_isShow')+'：</span>\
            </div>').appendTo(parent);
            var isShowContent = this.isShowContent = $('<span class="rackNumber_checked"><span>').appendTo(isShowDiv);
            
            //选中的类型
            var showTypeSelectVals = ['sticker','billboard'];
            var showTypeDiv = this.showTypeDiv = $('<div class="rackNumber_area rackNumber_selectedArea">\
            <span class="rackNumber_label">'+it.util.i18n('RackNumber_showType')+'：<span>\
            </div>').appendTo(parent).hide();
            var showTypeSelect = this.showTypeSelect = this.createSectionSelect(showTypeDiv,'showType',showTypeSelectVals);
            //贴图样式
            var stickerInputKeys = ['color'];
            var stickerSelectVals = ['horizontal','vertical'];
            this.stickerInputs = {};
            var stickerDiv = this.stickerDiv =  $('<div class="rackNumber_area rackNumber_stickerArea">\
            </div>').appendTo(parent).hide();
            var stickerContent = $('<div class="stickerArea_content"></div>').appendTo(stickerDiv);
            var stickerSelectArea = $('<div class="app-line">\
            <span class="text">'+it.util.i18n("RackNumber_sticker_layout")+'</span>\
            </div>').appendTo(stickerContent);
            var stickerSelect = this.stickerSelect = this.createSectionSelect(stickerSelectArea,'sticker',stickerSelectVals);
            stickerInputKeys.forEach(function(key){
                self.createStickerInput(key).appendTo(stickerContent);
            });
            
            isShowContent.click(function(e){
                self.isChecked = !self.isChecked;
                if(!self.isChecked){
                    $(this).css('background','none');
                    showTypeDiv.hide();
                    stickerDiv.hide();
                }else{
                    $(this).css({
                        'background': 'url(../css/images/checked.jpg) no-repeat',
                        'background-size': 'cover'
                    });
                    showTypeDiv.show();
                    if(showTypeSelect.val() == 'sticker'){
                        stickerDiv.show();
                    }
                }
            });
            showTypeSelect.on('change',function(){
                var selectVal = $(this).val();
                if(selectVal == 'sticker'){
                    stickerDiv.show();
                }else{
                    stickerDiv.hide();
                }
            });
        },
        loadData: function(oldSetting){
            if(oldSetting.showType == 'none'){
                this.isChecked = false;
            }else{
                this.isChecked = true;
                var stickerStyle = oldSetting.stickerStyle;
            }
            if(this.isChecked){
                this.showTypeDiv.show();
                //select2还要触发change事件，否则不会改变显示
                this.showTypeSelect.val(oldSetting.showType).trigger('change');
                this.isShowContent.css({
                    'background': 'url(../css/images/checked.jpg) no-repeat',
                    'background-size': 'cover'
                });
                if(oldSetting.showType == 'sticker'){
                    this.stickerDiv.show();
                    if(stickerStyle){
                        var stickerColor = stickerStyle.color;
                        if(!stickerColor){
                            stickerColor = '#000';
                        }
                        var stickerLayout = stickerStyle.layout;
                        if(!stickerLayout){
                            stickerLayout = 'horizontal';
                        }
                        this.stickerSelect.val(stickerLayout).trigger('change');
                        $('.RackNumber_input_color').val(stickerColor);
                    }
                }else{
                    this.stickerDiv.hide();
                }
            }else{
                this.isShowContent.css('background','none');
                this.showTypeDiv.hide();
                this.stickerDiv.hide();
            }
        },
        clickForConfirm: function(setting){
            if(!setting){
                setting = this.defaultSetting;
            }
            this.loadData(setting);
        },
        clickForReset: function(){
            this.loadData(this.defaultSetting);
        },
        createStickerInput: function(key){
            var wrapper = $('<div class="app-line">\
            <span class="text">'+it.util.i18n("RackNumber_sticker_"+key)+'</span>\
            <input placeholder="" class="input RackNumber_input_'+key+'">\
            </div>').addClass('stickerArea_inputWrapper');
            this.stickerInputs[key] = wrapper.find('input');
            return wrapper;
        },
        createSectionSelect: function(parent,id,vals){
            var self = this;
            var select = $('<select class="rackNumber_selected" style="position: absolute">\
            </select>').addClass('rackNumber_select'+id);
            vals.forEach(function(val){
                var option = $('<option value="'+val+'">'+it.util.i18n('RackNumber_'+val)+'</option>');
                select.append(option);
            });
            select.appendTo(parent);
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
            //使用select2组件
            // var selectId = select.attr('name').replace('select_','');
            var select2_option = {
                templateResult: formatState,
                templateSelection: formatState,
                minimumResultsForSearch: -1,
                dropdownAutoWidth: true,
                dropdownCssClass: 'bigdrop',
                //theme: 'bootstrap',  //主题
            };
            select2_option.width = 200 * nw + 'px';
            select2_option.dropdownParent = parent;
            select.select2(select2_option);
                
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
            return select;
        },
        getStickerVals: function(){
            var self = this;
            var stickerVals = {};
            stickerVals['layout'] = this.stickerSelect.val();
            for(var key in this.stickerInputs){
                stickerVals[key] = this.stickerInputs[key].val();
            }
            return stickerVals;
        },
        isChanged: function(){
            var systemSetting = JSON.parse(localStorage.getItem('systemSetting'));
            var oldResult;
            var newResult = this.getResult();
            if(!systemSetting) return true;
            if(systemSetting && systemSetting['rackNumberDisplay']){
                oldResult = systemSetting['rackNumberDisplay'];
                if(!Object.keys(oldResult).length){//为空代表还未点击
                    return true;
                }
            }
            for(var key in oldResult){
                if(typeof oldResult[key] == 'object'){
                    var innerOldRes = oldResult[key];
                    var innerNewRes = newResult[key];
                    for(var s in innerOldRes){
                        if(innerNewRes[s] != innerOldRes[s]){
                            return true;
                        }
                    }
                }else{
                    if(newResult[key] != oldResult[key]){
                        return true;
                    }
                }
            }
            return false;
        },
        getResult: function(){
            var resVal = {}; //{showType: '',stickerStyle: {}}
            if(this.isChecked){
                resVal['showType'] = this.showTypeSelect.val();
                if(this.showTypeSelect.val() == 'sticker'){
                    var stickerSetting = this.getStickerVals();
                    resVal['stickerStyle'] = stickerSetting;
                }
            }else{
                resVal['showType'] = 'none';
            }
            return resVal;
        }
    })
})(jQuery)