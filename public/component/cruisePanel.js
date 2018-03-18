(function ($) {
    $.widget('hud.cruisePanel', $.hud.listPane, {
        options: {

        },
        _create: function () {
            var self = this;
            var el = this.element;
            el.addClass('clearfix');
            this._createBtnDiv();
            this._createBtn();
            this._createUlBox();
            this.createUl(this.$ulBox, self.options.arr, self.options.width);
            var self = this;
            this._on(this.element, {
                'click #animate_list_btn': function () {
                    self._trigger("showAni", event);
                },
                'click #help_btn': function () {
                    self._trigger("help", event);
                },
            });
        },
        _createBtnDiv: function () {
            var el = this.element;
            this.$btnDiv = $('<div class="clearfix btn-content"></div>').appendTo(el);
        },
        _createBtn: function () {
            this.animateListBtn = $('<button class="animate-list-btn pull-left" id="animate_list_btn"><span class="iconfont icon-list"></span>' + it.util.i18n("CruisePanel_Cruise_List") + '</button>').appendTo(this.$btnDiv);
            this.helpBtn = $('<button class="help-btn pull-right" id="help_btn"><span class="iconfont icon-help-circle"></span>' + it.util.i18n("CruisePanel_Cruise_Help") + '</button>').appendTo(this.$btnDiv);
        },
        _createUlBox: function () {
            var el = this.element;
            this.$ulBox = $('<div class="ul-box"></div>').appendTo(el);
        }
    });




    $.widget('hud.animationDescriptionPanel', {
        options: {

        },
        createP: function (text) {
            var el = this.element;
            $('<p>' + text + '</p>').appendTo(el);
        },
        createH4: function (text) {
            var el = this.element;
            $('<h5>' + text + '</h5>').appendTo(el);
        }
    });



    $.widget('hud.animationListPanel', {
        options: {

        },
        _create: function () {
            this._createNewButton();
            this._createUl();
            this._createLiTitle();
        },
        _createNewButton: function () {
            var el = this.element;
            var self = this;
            this.$newButton = $('<button id="animation_list_new_btn"><span class="iconfont icon-minus-circle"></span>' + it.util.i18n("CruisePanel_New_Animation") + '</button>').appendTo(el);
            this.$newButton.on('click', function () {
                self._trigger("showNewAnimation", event);
            });
        },
        _createUl: function () {
            var el = this.element;
            this.$ulTitle = $('<ul class="animation-list-content"></ul>').appendTo(el);
            this.$ulTitle.css({
                'border-bottom': '0 none'
            });
            this.$ul = $('<ul class="animation-list-content"></ul>').appendTo(el);
        },
        _createLiTitle: function () {
            var self = this;
            this.$liTitle = $('<li class="title">' +
                '<span>' + it.util.i18n("CruisePanel_In_Scene") + '</span>' +
                '<span>' + it.util.i18n("CruisePanel_Animation_Name") + '</span>' +
                '<span>' + it.util.i18n("CruisePanel_Animation_Description") + '</span>' +
                '<span>' + it.util.i18n("CruisePanel_Autoplay") + '</span>' +
                '<span>' + it.util.i18n("CruisePanel_Repeat_Times") + '</span>' +
                '<span>' + it.util.i18n("CruisePanel_Action_Counts") + '</span>' +
                '<span class="last">' + it.util.i18n("CruisePanel_Operation") + '</span>' +
                '</li>').appendTo(self.$ulTitle);
        },
        createLi: function (arr, parentId) {
            var self = this;

            arr.forEach(function (v, i) {
                var $li = $('<li><span>' + (v.parentId || '') + '</span><span>' + v.name + '</span><span>' + (v.description || '') + '</span><span>' + (v.auto) + '</span><span>' + ((v.repeat == 0) ? it.util.i18n("camare_animation_repeat") : (v.repeat)) + '</span><span>' + v.actionCount + '</span><span class="last"></span></li>').appendTo(self.$ul);
                $li.attr('animationId', v.id);
                if (i % 2 == 0) {
                    $li.addClass('even');
                } else {
                    $li.addClass('odd');
                }
                $li.find('.last').addClass('clearfix');
                var $editBtn = self._createButton().appendTo($li.find('.last'));
                $editBtn.text(it.util.i18n("CruisePanel_Edit"));
                $editBtn.addClass('animation-list-edit-btn pull-left');
                $editBtn.on('click', function () {
                    var $this = $(this);
                    self._trigger("editAnimation", event, $this);
                });

                var $deleteBtn = self._createButton().appendTo($li.find('.last'));
                $deleteBtn.text(it.util.i18n("CruisePanel_Delete"));
                $deleteBtn.addClass('animation-list-delete-btn pull-left');
                $deleteBtn.on('click', function () {
                    var $this = $(this);
                    self._trigger("deleteAnimation", event, $this);
                });

                if (v.parentId == parentId) {
                    var $playBtn = self._createButton().appendTo($li.find('.last'));
                    $playBtn.text(it.util.i18n("CruisePanel_Play"));
                    $playBtn.addClass('animation-list-play-btn pull-left');
                    $playBtn.on('click', function () {
                        var $this = $(this);
                        self._trigger("playAnimation", event, $this);
                    });

                }
            });
        },

        removeLis: function () {
            this.$ul.empty();
        },
        _createButton: function () {
            var $btn = $('<button></button>');
            return $btn;
        },
        createPage: function (arr, parentId) {
            if (this.$pageDiv) {
                this.$pageDiv.empty();
            }
            if (arr.length == 0) {
                return;
            }
            var self = this;
            var el = this.element;
            var $pageDiv = this.$pageDiv = $('<div class="pull-right page-box"></div>').appendTo(el);


            this.arr = arr;
            this.arrLength = arr.length;
            this.pageCount = Math.ceil(this.arrLength / 6);
            this.nowPage = 1;
            this.pageArr = self.arr.slice(0, 6);
            this.removeLis();
            this.createLi(self.pageArr, parentId);

            this.$pageP = $('<p class="pull-left page-text chenghui">' +
                it.util.i18n("CruisePanel_In_Total") + self.arrLength +
                it.util.i18n("CruisePanel_Records") + self.nowPage + '/' +
                self.pageCount + it.util.i18n("CruisePanel_Page") +
                '</p>');
            this.$pageP.appendTo($pageDiv);
            var first = $('<span id="animation_list_first_page" class="iconfont icon-angle-left pull-left" title="' + it.util.i18n("CruisePanel_First_Page") + '"></span>').appendTo($pageDiv);
            var previous = $('<span id="animation_list_previous_page" class="iconfont icon-angle-double-left pull-left" title="' + it.util.i18n("CruisePanel_Previous_Page") + '"></span>').appendTo($pageDiv);
            var next = $('<span id="animation_list_next_page" class="iconfont icon-angle-double-right pull-left" title="' + it.util.i18n("CruisePanel_Next_Page") + '"></span>').appendTo($pageDiv);
            var last = $('<span id="animation_list_last_page" class="iconfont icon-angle-right pull-left" title="' + it.util.i18n("CruisePanel_Last_Page") + '"></span>').appendTo($pageDiv);
            first.on('click', function () {
                self.removeLis();
                self.pageArr = self.arr.slice(0, 6);
                self.createLi(self.pageArr, parentId);
                self.nowPage = 1;
            });

            previous.on('click', function () {
                if (self.nowPage == 1) {
                    return;
                }
                self.removeLis();
                self.nowPage--;
                self.pageArr = self.arr.slice((self.nowPage - 1) * 6, (self.nowPage - 1) * 6 + 6);
                self.createLi(self.pageArr, parentId);
            });

            next.on('click', function () {
                if (self.nowPage == self.pageCount) {
                    return;
                }
                self.removeLis();
                self.nowPage++;
                self.pageArr = self.arr.slice((self.nowPage - 1) * 6, (self.nowPage - 1) * 6 + 6);
                self.createLi(self.pageArr, parentId);
            });

            last.on('click', function () {
                if (self.nowPage == self.pageCount) {
                    return;
                }
                self.removeLis();
                self.nowPage = self.pageCount;
                self.pageArr = self.arr.slice((self.pageCount - 1) * 6, (self.pageCount - 1) * 6 + 6);
                self.createLi(self);
            });
        }
    });




    $.widget('hud.newAnimation', {
        option: {

        },
        removeContent: function () {
            this.$newAnimationContent.remove();
        },
        _create: function () {
            var el = this.element;
            this.createAllInput(this.option.inputObj);
            this.createContentBox();
            this.createBtns();
        },
        _createInput: function (text, width) {
            var $inputBox = $('<div class="pull-left new-animation-box"></div>');
            var $p = $('<p>' + text + '</p>').appendTo($inputBox);
            var $input = $('<input type="text"/>').appendTo($inputBox);
            $input.width(width);
            return $inputBox;
        },
        _createAutoPlay: function () {
            var $autoPlay = this.$autoPlay = $('<div class="auto-play-box">' + it.util.i18n("CruisePanel_Autoplay") + '</div>');
            var $checkBoxDiv = this.$checkBoxDiv = $('<div><input type="checkbox"/><ins class="helper"></ins></div>').appendTo($autoPlay);
            $checkBoxDiv.on('click', function () {
                $(this).toggleClass('clicked');
            });
            return $autoPlay;
        },
        _createBtn: function () {
            var $btn = $('<button></button>');
            return $btn;
        },
        createBtns: function () {
            var el = this.element;
            var self = this;
            var $bottomBtnBox = $('<div class="bottom-btn-box"></div>').appendTo(el);
            var $hideBtn = this.$hideBtn = this._createBtn().appendTo($bottomBtnBox);
            $hideBtn.text(it.util.i18n("CruisePanel_Hide"));
            $hideBtn.on('click', function () {
                var $this = $(this);
                $(this).siblings().removeClass('clicked');
                $(this).addClass('clicked');
                self._trigger("hide", event, $this);
            });
            var $saveBtn = this.$saveBtn = this._createBtn().appendTo($bottomBtnBox);
            $saveBtn.text(it.util.i18n("CruisePanel_Save"));
            $saveBtn.on('click', function () {
                var $this = $(this);
                $(this).siblings().removeClass('clicked');
                $(this).addClass('clicked');
                self._trigger("save", event, $this);
            });
            var $cancelBtn = this.$cancelBtn = this._createBtn().appendTo($bottomBtnBox);
            $cancelBtn.text(it.util.i18n("CruisePanel_Cancel"));
            $cancelBtn.on('click', function () {
                var $this = $(this);
                self._trigger("cancel", event, $this);
            });
        },
        createAllInput: function (inputObj) {
            var el = this.element;
            var $allBox = this.$allInputBox = $('<div class="clearfix all-input"></div>').appendTo(el);
            var $name = this._createInput(it.util.i18n("CruisePanel_Animation_Name") + ':', 195).appendTo($allBox);
            $name.children('input').attr('animation', 'name').attr('name', 'name');
            var $description = this._createInput(it.util.i18n("CruisePanel_Animation_Description") + ':', 264).appendTo($allBox);
            $description.children('input').attr('animation', 'description').attr('name', 'description');
            var $repeat = this._createInput(it.util.i18n("CruisePanel_Repeat_Times") + ':', 88).appendTo($allBox);
            $repeat.children('input').attr('animation', 'repeat').attr('name', 'repeat');
            var $parent = this._createInput(it.util.i18n("CruisePanel_In_Scene") + ':', 188).appendTo($allBox);
            $parent.children('input').attr('animation', 'parentId').attr('name', 'parentId');
            var $autoPlay = this._createAutoPlay().appendTo($allBox);
            if (inputObj) {
                $allBox.attr('animationId', inputObj.id);
                $name.children('input').val(inputObj.name);
                $description.children('input').val(inputObj.description);
                $repeat.children('input').val(inputObj.repeat);
                $parent.children('input').val(inputObj.parentId);
                if (inputObj.auto) {
                    $autoPlay.children('div').addClass('clicked');
                }
            }

            var $btnBox = $('<div class="pull-left btn-box"></div>').appendTo($allBox);
            var $addBtn = this.$addBtn = this._createBtn().appendTo($btnBox);
            $addBtn.text(it.util.i18n("CruisePanel_Add"));
            var self = this;
            $addBtn.click(function () {
                $(this).siblings().removeClass('clicked');
                $(this).addClass('clicked');
                self._trigger("add", event)
            });
            var $previewBtn = this.$previewBtn = this._createBtn().appendTo($btnBox);
            $previewBtn.text(it.util.i18n("CruisePanel_Preview"));
            $previewBtn.click(function () {
                $(this).siblings().removeClass('clicked');
                $(this).addClass('clicked');
                self._trigger("preview", event);
            });
        },
        removeAllInput: function () {
            this.$allInputBox.remove();
        },
        createContentBox: function () {
            var el = this.element;
            this.$newAnimationContent = $('<div class="new-animation-content" style="overflow-x:hidden;width:1156px;height:460px;margin-top:15px"></div>').appendTo(el);
            return (this.$newAnimationContent);
        },
        createContent: function (action) {
            action.position.x = parseFloat(action.position.x.toFixed(2));
            action.position.y = parseFloat(action.position.y.toFixed(2));
            action.position.z = parseFloat(action.position.z.toFixed(2));

            action.target.x = parseFloat(action.target.x.toFixed(2));
            action.target.y = parseFloat(action.target.y.toFixed(2));
            action.target.z = parseFloat(action.target.z.toFixed(2));
            // action.waitTime /= 1000;
            // action.playTime /= 1000;
            // action.holdTime /= 1000;
            action.subtitleBottom = parseInt(action.subtitleBottom) || 100;


            var el = this.element;
            var $newAnimationContent = this.$newAnimationContent;
            var $contentBox = this.$contentBox = $('<div class="content-box clearfix"></div>').appendTo($newAnimationContent);
            this.$contentBox.data('fpsMode', action.fpsMode);
            this._createContentInput(it.util.i18n("CruisePanel_Delay_Time"), 88, action.waitTime, 'waitTime').appendTo($contentBox);
            this._createContentInput(it.util.i18n("CruisePanel_Camera_Position"), 488, JSON.stringify(action.position), 'position').appendTo($contentBox);
            var $three = this._createContentInput(it.util.i18n("CruisePanel_Subtitle_Position"), 153, action.subtitleBottom, 'subtitleBottom').appendTo($contentBox);
            $three.addClass('no-margin');
            this._createContentInput(it.util.i18n("CruisePanel_Play_Time"), 88, action.playTime, 'playTime').appendTo($contentBox);
            this._createContentInput(it.util.i18n("CruisePanel_Camera_Target"), 488, JSON.stringify(action.target), 'target').appendTo($contentBox);
            var $six = this._createContentInput(it.util.i18n("CruisePanel_Data_Number"), 153).appendTo($contentBox);
            $six.addClass('no-margin')
            this._createContentInput(it.util.i18n("CruisePanel_Keep_Time"), 88, action.holdTime, 'holdTime').appendTo($contentBox);
            this._createContentInput(it.util.i18n("CruisePanel_Subtitle_Content"), 488, action.subtitle, 'subtitle').appendTo($contentBox);

            var $deleteBtn = this._createBtn().appendTo($contentBox);
            $deleteBtn.addClass('pull-right delete-btn');
            $deleteBtn.text(it.util.i18n("CruisePanel_Delete"));
            $deleteBtn.click(function () {
                var div = $(this).parent();
                layer.confirm(it.util.i18n("CameraAnimateManager_Confirm_delete") + '?',
                    function (c) {
                        layer.close(c);
                        div.remove();
                    },
                    function (c) {
                        layer.close(c);
                    });
            });

            var $closeBtn = this._createBtn().appendTo($contentBox);
            $closeBtn.addClass('iconfont icon-close closeBtn');
            $closeBtn.click(function () {
                var div = $(this).parent();
                div.remove();
            });
        },
        _createContentInput: function (text, width, value, title) {
            if (value == undefined || value == null) {
                value = '';
            }
            var $contentInputBox = $('<div class="pull-left content-input-box">' + text + '</div>');

            var $input = $('<input  title="' + title + '"/>').appendTo($contentInputBox);
            $input.val(value);
            $input.width(width);
            return $contentInputBox;
        },
        addRow: function (action) {
            this.createContent(action);
        },
        getContentData: function () {
            var result = [];
            var boxs = this.element.children('.new-animation-content').children('.content-box');
            var len = boxs.length;
            for (var i = 0; i < len; i++) {
                var box = boxs.eq(i);
                var d = {};
                var inputs = box.find('input');
                for (var j = 0; j < inputs.length; j++) {
                    var title = inputs[j].title;
                    if (title == 'position' || title == 'target') {
                        d[title] = JSON.parse(inputs[j].value);
                    } else if (title == 'holdTime' || title == 'playTime' || title == 'waitTime') {
                        d[title] = parseInt(inputs[j].value);
                    } else {
                        d[title] = inputs[j].value;
                    }
                }
                result.push(d);
            }
            return result;
        },
        getBoxModel: function () {
            var el = this.element;
            var result = {};
            var $allIput = el.children('.all-input');
            result.id = $allIput.attr('animationId');
            $allIput.find('input').each(function (i, v) {
                var $v = $(v);
                if ($v.attr('type') == 'text') {
                    result[$v.attr('animation')] = $v.val();
                }
                if ($v.attr('type') == 'checkbox') {
                    if ($v.parent().hasClass('clicked')) {
                        result.auto = true;
                    } else {
                        result.auto = false;
                    }
                }
            });
            return result;
        },
        isBoxModelExist: function (boxModel) {
            if (!boxModel) {
                return false;
            }
            for (var i in boxModel) {
                if (boxModel[i]) {
                    return true;
                }
            }
            return false;
        },
        hasCDChanged: function (oldCD, newCD) {
            //这里还要对子对象进行递归判断
            for (var i in newCD) {
                if (i == 'undefined') {
                    break;
                }
                if (i == 'holdTime' || i == 'playTime' || i == 'waitTime') {
                    if (newCD[i] != parseInt(oldCD[i])) {
                        return true;
                    }
                } else if (Object.prototype.toString.call(newCD[i]) == '[object Object]') {
                    if (JSON.stringify(newCD[i]) != JSON.stringify(oldCD[i])) {
                        return true;
                    }
                } else {
                    if (newCD[i] != oldCD[i]) {
                        return true;
                    }
                }
            }
            return false;
        },
        hasBMChanged: function (oldBM, newBM) {
            for (var i in newBM) {
                if (newBM[i] != oldBM[i]) {
                    return true;
                }
            }
            return false;
        }
    });
})(jQuery)