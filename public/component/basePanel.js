(function ($) {

    $.widget("hub.basePanel", {

        dataManager: main && main.sceneManager && main.sceneManager.dataManager,

        _create: function () {
            this.main = this.element;
        },

        createSearchTree: function (results, inputPane, height, createLabel) {
            var treeHeight;
            var self = this;
            if (height) {
                treeHeight = this.element.height() - this.main.height();
            } else {
                treeHeight = 300;
            }
            var el = this.element;
            var treeNode = $('<div>').addClass('app-tree');
            inputPane.append(treeNode);
            this.treeView = new it.TreeView(treeNode);
            this.orgTreeManager = new it.NewOrganizeTreeManager(this.dataManager, null, dataJson.treeIcon);
            if (createLabel) {
                this.orgTreeManager.createLabel = createLabel;
            }
            var treeNodes = null;
            if (!results || results.length < 1) {
                this.treeView.clearTreeData();
            } else {
                treeNodes = this.orgTreeManager.organizeTree(results);
                this.treeView.setData(treeNodes, false);
            }
            this.treeView.setTreeHeight(treeHeight);
            return this.treeView;
        },

        removeSearchTree: function () {
            this.element.find('.app-tree').remove();
        },

        createTitle: function (option) {
            var head = $('<div>').addClass('app-head')
            var title = this.title = $('<span>').addClass('app-title').text(option.title);
            var circle = $('<div>').addClass('app-circle');
            var insideCircle = $('<div>').addClass('app-circle-inside');
            circle.attr('title', '隐藏').append(insideCircle);
            head.append(title);
            head.append(circle);
            this.main.append(head);
            var self = this;
            circle.on('mouseup', function () {
                self.doHidePanel();
            });
            title.on('mouseup', function () {
                self.doShowPanel();
            });
        },

        _makeDefaultOption: function (option) {
            var defaultOption = {
                placeholder: '',
                text: '',
                inputText: '',
            }
            option = $.extend({}, defaultOption, option);
            return option;
        },

        _createInput: function (option) {

            option = this._makeDefaultOption(option);
            var line = $('<div>').addClass('app-input-line app-line');
            var input = $('<input placeholder="' + option.placeholder + '">').addClass(option.class + ' input');
            line.append(input);
            this.main.append(line)

        },

        _createTextInput: function (option) {

            option = this._makeDefaultOption(option);
            var line = $('<div>').addClass('app-text-input-line app-line');
            var text = $('<span>').text(it.util.i18n(option.text)).addClass(option.class + ' text');
            var input = $('<input placeholder="' + option.placeholder + '">').addClass(option.class + ' input').val(option.inputText);
            if (option.attrs) {
                for (var key in option.attrs) {
                    input.attr(key, option.attrs[key]);
                }
            }
            line.append(text);
            line.append(input);
            this.main.append(line);


        },

        _createTextSelect: function (option, width) {

            option = this._makeDefaultOption(option);
            var line = $('<div>').addClass('app-text-select-line app-line');
            var text = $('<span>').text(option.text).addClass(option.class + ' text');
            var select = $('<select>').addClass(option.class + ' select');
            var theOption;
            for (var i = 0; i < option.options.length; i++) {
                var theOptionMsg = option.options[i].split(':');
                theOption = $('<option>').attr('value', theOptionMsg[0]).text(theOptionMsg[1]);
                select.append(theOption);
            }
            line.append(text);
            line.append(select);
            this.main.append(line);

            var inputWidth;
            if (width) {
                inputWidth = width;
            } else {
                inputWidth = '72%';
            }
            select.selectmenu({
                width: inputWidth,
                appendTo: line,
            });
            select.selectmenu('menuWidget').addClass('app-panel-selectmenu-ul');
            // 注意：select用的是jqui的中的组件selectmenu,宽度的设置在此处控制
            // select变更时触发selectmenuchange事件
            // select.on('selectmenuchange', function(event){
            //     dosomething();
            // });
        },

        _createButtons: function (option) {

            if (!option) {
                option = [{
                    class: 'clear-it active',
                    text: it.util.i18n("BasePanel_Clear")
                },{
                    class: 'search-it active',
                    text: it.util.i18n("BasePanel_Search")
                }, ];
            }
            var group = $('<div>').addClass('app-btn-group');
            var div;
            for (var i = 0; i < option.length; i++) {
                div = $('<div>').addClass(option[i].class).text(option[i].text);
                group.append(div);
            }
            this.main.append(group);

            var self = this;
            group.on('click', '.clear-it', function () {
                self._clear();
            })
            this.searchLine = 0;
            group.on('click', '.search-it', function () {
                if (!self.searchLine) {
                    self.searchLine = self._createAddLine();
                }
            })
        },

        _createAddLine: function () {

            var line = $('<div>').addClass('app-black-line app-line');
            this.main.append(line)

            return line;
        },

        _createText: function (option) {

            var line = $('<div>').addClass('app-text-line app-line').text(option.text);
            this.main.append(line);

        },

        _clear: function () {
            this.element.find('input').each(function () {
                $(this).val('');
            })
            this.element.find('select').each(function () {
                $(this).find('option').first().prop("selected", 'selected');
                $(this).selectmenu("refresh");
            })
            this.removeSearchTree();
            if (this.searchLine) {
                this.searchLine.remove();
                this.searchLine = 0;
            }
        },

        _sortFunction: function (a, b) {
            if (!a) {
                return -1;
            }
            if (!b) {
                return 1;
            }
            var des1 = '',
                des2 = '';
            var str1 = a.split(':');
            if (str1 && str1.length == 2) {
                des1 = str1[1];
            }
            var str2 = b.split(':');
            if (str2 && str2.length == 2) {
                des2 = str2[1];
            }
            if (des1 == 'all' || des1 == it.util.i18n("ITVSearchBasePanel_All") || des1 == '') {
                return -1;
            } else if (des2 == 'all' || des2 == it.util.i18n("ITVSearchBasePanel_All") || des2 == '') {
                return 1;
            }
            return it.Util.compare(des1, des2);
        },

        doHidePanel: function () {
            this.element.css('visibility', 'hidden');
            this.title.css('visibility', 'visible');
        },

        doShowPanel: function () {
            this.element.css('visibility', 'visible');
        },

        doHide: function () {
            this.element.hide();
        },

        doShow: function () {
            this.doShowPanel();
            this.element.show();
        },

    })

    $.widget("hub.appBasePanel", $.hub.basePanel, {

        _create: function () {
            this._beforeInit();
            this._firstInit();
            this.setHeight();
        },

        _beforeInit: function () {
            this.main = $('<div>').addClass('app-main');
            this.element.append(this.main).addClass('app-panel');
        },

        setHeight: function () {
            var breadcrumbBox = $('.breadcrumb-box');
            var canvas = $('.overviewCanvas');
            this.element.css({
                'top': breadcrumbBox.innerHeight(),
                'height': $(window).height() - breadcrumbBox.innerHeight(),
            });
            if ($('.OverviewMgr').css('display') == 'block') {
                this.element.css({
                    'top': breadcrumbBox.innerHeight() + canvas.innerHeight(),
                    'height': $(window).height() - breadcrumbBox.innerHeight() - canvas.innerHeight(),
                })
            }
        },

        reset: function () {
            this._clear();
            this.doHide();
            this.doShowPanel();
        },

    })

    // $.widget("hub.SpaceSearchApp", $.hub.appBasePanel, {
    //     _firstInit: function () {
    //         this.element.addClass('space-search-panel');
    //         this.createTitle({
    //             title: it.util.i18n("SpaceSearchApp_Space_Search"),
    //         });
    //         this._createTextInput({
    //             class: 'SpaceSearchPanel-U-count',
    //             text: it.util.i18n("SpaceSearchApp_U_nums"),
    //         });
    //         this.positionInputSelect = this.createAreaSelect({
    //             class: 'SpaceSearchPanel-space-location',
    //             text: it.util.i18n("SpaceSearchApp_Position"),
    //             selectTreeCategory: ['floor', 'room'],
    //             placeholder: it.util.i18n('All')
    //         });
    //         this._createButtons();
    //     },

    //     _setOptions: function (options, datas) {
    //         if (!options) {
    //             options = [];
    //         }
    //         if (datas) {
    //             for (var id in datas) {
    //                 var data = datas[id];
    //                 if (dataJson.isShowAll) {
    //                     if (data) {
    //                         options.push(data.getId() + ':' + (data.getDescription() || data.getId()));
    //                     }
    //                 } else {
    //                     if (data && data.getChildren().size() !== 0) {
    //                         options.push(data.getId() + ':' + (data.getDescription() || data.getId()));
    //                     }
    //                 }
    //             }
    //         }
    //         return options;
    //     },

    //     _createAreaOption: function () {
    //         var categoryDatas = this.dataManager._categoryDatas;
    //         var options = [':' + it.util.i18n("ITVSearchBasePanel_All")]; //['all:全部'] ,"all"不能被识别，直接去掉了
    //         if (categoryDatas) {
    //             var floors = categoryDatas['floor'];
    //             this._setOptions(options, floors);
    //             var rooms = categoryDatas['room'];
    //             this._setOptions(options, rooms);
    //             options.sort(this._sortFunction);
    //             return options;
    //         }
    //         return null;
    //     },
    //     createAreaSelect: function (option, parent) {
    //         var self = this;
    //         var line = $('<div>').addClass('app-text-input-line app-line');
    //         var text = $('<span>').text(option.text).addClass(option.class + ' text');
    //         var inputDiv = $('<div>').addClass(option.class + ' input');
    //         var input = $('<input placeholder="' + option.placeholder + '">').val(option.inputText).appendTo(inputDiv).css('width','100%');
    //         var selectTreeBox = this.selectTreeBox = $('<div>').addClass('select-tree-box').appendTo(inputDiv);
    //         selectTreeBox.hide();
    //         if (option.attrs) {
    //             for (var key in option.attrs) {
    //                 input.attr(key, option.attrs[key]);
    //             }
    //         }
    //         line.append(text);
    //         line.append(inputDiv);
    //         if (!parent) {
    //             parent = this.main;
    //         }
    //         parent.append(line);
    //         input.on('click', function () {
    //             selectTreeBox.empty();
    //             self.createSelectTree({
    //                 // conditions: conditions,
    //                 parent: selectTreeBox,
    //                 selectTreeCategory: option.selectTreeCategory,
    //             });
    //             selectTreeBox.toggle();
    //         });
    //         return {
    //             input: input,
    //             tree: selectTreeBox,
    //         };
    //     },

    //     createSelectTree: function (option) {
    //         var self = this;
    //         // var conditions = option.conditions;
    //         var parent = option.parent;
    //         var selectTreeCategory = option.selectTreeCategory;
    //         var conditions = [];
    //         for (var i = 0; i < selectTreeCategory.length; i++) {
    //             conditions.push({
    //                 key: 'C:id',
    //                 value: selectTreeCategory[i],
    //                 type: 'string',
    //                 operation: '='
    //             })
    //         }
    //         var selectDataFinder = new it.SelectDataFinder(main.sceneManager.dataManager);
    //         var results = selectDataFinder.find(conditions);
    //         var selectOrgTreeManager = new it.SelectOrganizeTreeManager(main.sceneManager.dataManager, null, dataJson.treeIcon, selectTreeCategory);
    //         this.selectTreeView = new it.TreeView(parent);
    //         var treeNodes = null;
    //         treeNodes = selectOrgTreeManager.organizeTree(results);
    //         this.selectTreeView.setData(treeNodes, false);
    //         this.selectTreeView.clickNodeFunction = function (treeData) {
    //             self.setSelectValue(treeData.id);
    //         };
    //         return treeNodes;
    //     },

    //     hideTreeBox:function(){
    //         this.selectTreeBox.hide()
    //     },
    //     setSelectValue: function (text) {
    //         this.positionInputSelect.tree.toggle();
    //         this.positionInputSelect.input.val(text);
    //     },

    //     getUCount: function () {
    //         return $('input.input.SpaceSearchPanel-U-count').val();
    //     },

    //     getSpaceLocation: function () {
    //         return $('.SpaceSearchPanel-space-location input').val();
    //     },

    //     getConditions: function () {
    //         var conditions = [];
    //         var uCount = this.getUCount();
    //         if (uCount) {
    //             conditions.push({
    //                 key: 'u:dyna_user_data_maxSerSpace',
    //                 value: uCount,
    //                 dataType: 'number',
    //                 operation: '>='
    //             });
    //         }
    //         var spaceLocation = this.getSpaceLocation();
    //         if (spaceLocation == it.util.i18n("All")) spaceLocation = '';
    //         if (spaceLocation) {
    //             conditions.push({
    //                 key: 'u:ancestor',
    //                 value: spaceLocation,
    //                 dataType: 'string',
    //                 operartion: '='
    //             });
    //         }
    //         return conditions;
    //     },
    // })

    // $.widget("hub.USearchApp", $.hub.appBasePanel, {
    //     _firstInit: function () {
    //         this.element.addClass('u-search-panel');
    //         this.createTitle({
    //             title: it.util.i18n("USearchPanel_Location_Search")
    //         });
    //         this._createInput({
    //             class: 'USearchPanel-U-count',
    //             placeholder: it.util.i18n("USearchPanel_input_U_count")
    //         });
    //         this._createButtons();
    //     },

    //     getUCount: function () {
    //         return $('input.input.USearchPanel-U-count').val();
    //     },

    //     getConditions: function () {
    //         var conditions = [];
    //         var uCount = this.getUCount();
    //         if (uCount) {
    //             conditions.push({
    //                 key: 'sizeU',
    //                 value: uCount,
    //                 dataType: 'string',
    //                 operation: '='
    //             });
    //         }
    //         return conditions;
    //     },
    // })

    // $.widget("hub.LinkSearchApp", $.hub.appBasePanel, {
    //     _firstInit: function () {
    //         this.element.addClass('link-search-panel');
    //         this.createTitle({
    //             title: it.util.i18n("LinkSearch_Link_Search")
    //         });
    //         this._createInput({
    //             class: 'LinkSearch-Num',
    //             placeholder: it.util.i18n("LinkSearch_Input_ID")
    //         });
    //         this._createButtons();
    //     },

    //     _getSearchNum: function () {
    //         return $('input.input.LinkSearch-Num').val();
    //     },

    //     getConditions: function () {
    //         var conditions = [];
    //         var searchNum = this._getSearchNum();
    //         if (searchNum) {
    //             conditions.push({
    //                 key: 'id',
    //                 value: searchNum,
    //                 dataType: 'string',
    //                 operation: 'like'
    //             });
    //         }
    //         return conditions;
    //     },
    // });



    // $.widget("hud.itSearch", $.hub.basePanel, {
    $.widget("hud.itSearch", $.hub.appBasePanel, {
        // default options
        options: {
            items: {
                bussinessType: ['机柜', '空调'],
            },
        },

        removeSearchTree: function () {
            this.element.find('.search-tree-box').find('#tree-content').parent().remove();
        },
        _create: function () {

            var self = this;
            var el = this.element;
            this.width = '70%';
            this.main = this.element;
            this.results = null;

            el.getContentPane = function () {
                return self.$searchContent;
            };
            el.addClass('it-search');
            el.attr('isShow', true);

            this.createTitle({
                title: it.util.i18n("ITSearchPane_Search"),
            })
            this._createSearchTitle();
            this._createSearchContent();
            // this._createSearchBtn();
            this._createSearchText();
            this._createSearchBusinessType(self.options.items.bussinessType);
            this._createSearchMoreConditions();
            this._createSearchResult();
            this.setComputContentHeight();
        },
        _createSearchTitle: function () {
            var el = this.element;
            this.$searchTitle = $('<div class="search-title"></div>').appendTo(el);
        },
        _createSearchContent: function () {
            var self = this;
            var el = this.element;
            this.$contentBox = $('<div class="content-box scroll-class"></div>').appendTo(el);
            
            this.$searchContent = $('<div class="searchContent"></div>').appendTo(this.$contentBox);
            // this.$searchContent.height(self.$contentBox.height() - 15);
        },
        setComputContentHeight: function(){
            //获取前面元素的高度之和
            var self,prevArr,sumPrevHeight,i,prevDiv,prevHeight,prevMarTop,prevMarBottom,prevHeights;
            self = this;
            prevArr = this.$contentBox.prevAll();
            sumPrevHeight = 0;
            for(i=0;i<prevArr.length;i++){
                prevDiv = prevArr[i];
                prevHeight = this.getStyle(prevDiv,'height');
                prevMarTop = this.getStyle(prevDiv,'marginTop');
                prevMarBottom = this.getStyle(prevDiv,'marginBottom');  
                prevHeights = Number(prevHeight.replace('px','')) + Number(prevMarTop.replace('px','')) + Number(prevMarBottom.replace('px',''));  
                sumPrevHeight +=  prevHeights;
            }
            this.$contentBox.css('top',sumPrevHeight+'px');
        },
        getStyle: function(dom,attr){
            return window.getComputedStyle ? window.getComputedStyle(dom,null)[attr] : dom.currentStyle[attr];
        },
        // _createSearchBtn: function () {
        //     var self = this;
        //     var $searchTitle = this.$searchTitle;
        //     this.$searchBtnBox = $('<div class="clearfix"></div>').appendTo($searchTitle);
        //     this.$searchBtn = $('<button class="pull-left it-search-btn">搜索</button>').appendTo(self.$searchBtnBox);
        //     this.$closeBtn = $('<span class="pull-right ball iconfont icon-dot-circle" title="关闭"></span>').appendTo(self.$searchBtnBox);
        //     this.$closeBtn.on('click', function () {
        //         self.hideSearchPanel();
        //     });
        //     this.$searchBtn.on('click', function () {
        //        self.showSearchPanel();
        //     });
        // },
        // hideSearchPanel: function () {
        //     this.element.css('visibility', 'hidden');
        //     this.$searchBtn.css('visibility', 'visible');
        // },
        // showSearchPanel: function () {
        //     this.element.css('visibility', 'visible');
        // },



        _createSearchText: function () {
            var self = this;
            var el = this.element;
            var $searchTitle = this.$searchTitle;
            var $searchContent = this.$searchContent;
            this.$searchText = $('<div class="jui-inputPane"></div>').appendTo($searchTitle);
            $('<input type="text" placeholder=" ' + it.util.i18n("ITSearchPane_Input") + ' " class="it-search-text" id="ITSearch_text">').appendTo(self.$searchText);
            this.$searchIcon = $('<span class="iconfont icon-search"></span>').appendTo(self.$searchText);
            this.$searchIcon.on('click', function (e) {
                self.removeSearchTree();
                self.removeNoResult();
                var results = self.getResults();
                if (!results || results.length == 0) {
                    self.createNoResult();
                } else {
                    var treeBox = $('<div style="padding:0 15px;" class="search-tree-box"></div>').appendTo($searchContent);
                    self._trigger("createTree", event, { results: results, treeBox: treeBox, equipmentId: self.getSearchDataType() });
                }
            });
        },

        setSelectValue: function (text) {
            this.$selectTreeBox.toggle();
            this.$selectContent.text(text);
        },
        _createSearchMoreConditions: function () {
            var self = this;
            self.isSearchMoreConditions = false;
            var el = this.element;
            var $searchContent = this.$searchContent;
            this.$searchMoreConditions = $('<div class="it-search-moreConditions"></div>').appendTo($searchContent);
            $('<div class="clearfix search-moreConditions-title"><span class="text pull-left">' + it.util.i18n("ITSearchPane_More_Condition") + '</span><div class="sanjiao-box"><span class="sanjiao pull-left"></span></div></div>').appendTo(this.$searchMoreConditions);
            $('<div class="search-line"></div>').appendTo(this.$searchMoreConditions);

            this.$allInputBox = $('<div style="display:none;"></div>').appendTo(this.$searchMoreConditions);

            $('.it-search .searchContent .it-search-moreConditions .search-moreConditions-title').on('click', function () {
                $(this).children('.sanjiao-box').children('.sanjiao').toggleClass('rotation');
                self.$allInputBox.slideToggle();
            });
            this._createAllInputs();
            // this.createTimeInput().appendTo(self.$allInputBox);
            this.main = this.$searchContent;
            this._createButtons();

            this.group = $('.content-box .searchContent .app-btn-group');
            this.statistDiv = $('<div>').addClass('statistical-it active').text(it.util.i18n('BasePanel_statistics_btn'));
            this.group.prepend(this.statistDiv);
            this.statistDiv.on('click', function (e) {
                main.equipStatisticsMgr.show();
            })

            $('.content-box .searchContent .app-btn-group .search-it').on('click', function (e) {
                e.preventDefault();
                self.removeSearchTree();
                self.removeNoResult();
                var results = self.getResults();
                if (!results || results.length == 0) {
                    self._trigger("clearBillbd");
                    self.createNoResult();
                } else {
                    var treeBox = $('<div style="padding:0 15px;" class="search-tree-box"></div>').appendTo($searchContent);

                    self._trigger("createTree", event, { results: results, treeBox: treeBox, equipmentId: self.getSearchDataType() });
                }
            });
            $('.content-box .searchContent .app-btn-group .clear-it').on('click', function (e) {
                self.removeNoResult();
                $('span.search-location').text(it.util.i18n("ITVSearchBasePanel_All"));
                self._trigger("clearBillbd");
            });
        },
        _createAllInputs: function () {
            var self = this;
            this.main = this.$allInputBox;
            this.createDefaultInput();
            this.createAllCustomInputs('equipment');
        },
        createAreaSelect: function (label, className, width, inputPanel) {
            var self = this;
            if (inputPanel) {
                var $box = inputPanel;
            } else {
                var $box = $('<div class="app-text-select-line app-line"></div>').appendTo(this.$allInputBox);
            }
            var $label = $('<span class="text">' + label + '</span>').appendTo($box);
            var $span = $('<span class="ui-selectmenu-button ui-widget ui-state-default ui-corner-all" style="width:' + width + ';"></span>').appendTo($box);
            $('<span class="ui-icon ui-icon-triangle-1-s"></span>').appendTo($span);
            this.$selectContent = $('<span class="ui-selectmenu-text ' + className + '">' + it.util.i18n("ITVSearchBasePanel_All") + '</span>').appendTo($span);
            this.$selectTreeBox = $('<div class="select-tree-box ui-front" style="width:' + width + ';"></div>').appendTo($box);

            var conditions = [];
            self.options.items.selectTreeCategory.forEach(function (val) {
                conditions.push({
                    key: 'C:id',
                    value: val,
                    type: 'string',
                    operation: '='
                })
            }, this);

            $span.on('click', function () {
                self.$selectTreeBox.empty();
                self._trigger("createSelectTree", event, { conditions: conditions, inputPanel: self.$selectTreeBox })
                self.$selectTreeBox.toggle();
            });
        },

        createModelSelect: function(option){
            option = this._makeDefaultOption(option);
            var width = option.width;
            var parent = option.parent;
            var categoryId = option.categoryId;
            var line = $('<div>').addClass('app-text-select-line app-line');
            var text = $('<span>').text(option.text).addClass(option.class + ' text');
            var select = $('<select>').addClass(option.class + ' select');
            var theOption;
            for (var i = 0; i < option.options.length; i++) {
                var theOptionMsg = option.options[i];
                if(categoryId&&theOptionMsg.categoryId != categoryId&&theOptionMsg.value != ''){
                    continue;
                }
                theOption = $('<option>').attr('value', theOptionMsg.value).text(theOptionMsg.content);
                select.append(theOption);
            }
            line.append(text);
            line.append(select);
            parent.append(line);

            var inputWidth;
            if (width) {
                inputWidth = width;
            } else {
                inputWidth = '72%';
            }
            select.selectmenu({
                width: inputWidth,
                appendTo: line,
            });
            select.selectmenu('menuWidget').addClass('app-panel-selectmenu-ul');
        },

        createDefaultInput: function () {
            this.createAreaSelect(it.util.i18n("ITSearchPane_Position"), 'search-location', '70%');
            // this._createTextSelect({
            //     class: 'search-location',
            //     text: '位置',
            //     options: this._createAreaOption()
            // }, this.width);
            this.modelParentBox = $('<div>').addClass('search-model-select-box');
            this.main.append(this.modelParentBox);
            this.createModelSelect({
                class: 'search-asset-model',
                text: it.util.i18n("ITSearchPane_Asset_Model"),
                options: this.options.items.dataTypeOption,
                parent: this.modelParentBox,
                width: this.width,
                categoryId: 'equipment',
            });
            this._createTextInput({
                class: 'search-parentId',
                text: it.util.i18n("ITSearchPane_Parent")
            });
        },
        createAllCustomInputs: function (text) {

            var self = this;
            this.$customInputBox = $('<div></div>').appendTo(this.$allInputBox);
            this.customInputsData = [];

            var oldMain = this.main;
            this.main = this.$customInputBox;

            if (!text) {
                this._createTextSelect({
                    class: 'search-device-type',
                    text: it.util.i18n("ITSearchPane_Business_type"),
                    options: this.options.items.businessTypeOption
                }, this.width);
                dataJson.itSearchItems.forEach(function (data) {
                    this.customInputsData.push({
                        inputClass: data.inputClass,
                        key: data.key,
                        isClient: true,
                        operation: data.operation
                    })
                    this.createCustomInput(data);
                }, this);
            } else {
                //获取扩展字段
                var categorys = this.options.items.categorys;
                var category;
                categorys.forEach(function (val) {
                    if (val._description == text || val._id == text) {
                        category = val;
                        return;
                    }
                }, this);

                if (category && category._id == "equipment") {
                    this._createTextSelect({
                        class: 'search-device-type',
                        text: it.util.i18n("ITSearchPane_Business_type"),
                        options: this.options.items.businessTypeOption
                    }, this.width);
                }

                dataJson.itSearchItems.forEach(function (val) {
                    if (category._id == val.categoryId) {
                        this.customInputsData.push({
                            inputClass: val.inputClass,
                            key: val.key,
                            isClient: true,
                            operation: val.operation
                        })
                        this.createCustomInput(val);
                    }
                }, this);

                if (this.customInputsData == 0) {
                    ServerUtil.api('custom_table', 'search', {}, function (res) {
                        var tableName;
                        res.forEach(function (val) {
                            if (val.category == category._id) {
                                tableName = val.tableName;
                                return;
                            }
                        });

                        if (tableName) {
                            ServerUtil.api('custom_column', 'search', {
                                tableName: tableName
                            }, function (res) {
                                res.forEach(function (val) {
                                    var label = val.columnDisplayName || val.columnName;
                                    self.createCustomInput({
                                        inputClass: label,
                                        label: it.util.i18n(label)
                                    })

                                    self.customInputsData.push({
                                        inputClass: label,
                                        key: val.columnName,
                                        isClient: true,
                                        operation: 'like'
                                    })
                                });
                            })
                        }
                    });
                }
            }
            this.main = oldMain;
        },
        createCustomInput: function (data) {
            this.main = this.$customInputBox;
            this._createTextInput({
                class: data.inputClass,
                text: data.label
            });
            if (data.dateTime) {
                var input = $('.' + data.inputClass);
                input.datetimepicker({
                    zIndex: 99999,
                    weekStart: 1,
                    language: 'zh-CN',
                    format: 'yyyy-mm-dd',
                    autoclose: true,
                    todayBtn: true,
                    startView: 2,
                    minView: 'month'
                }).on('changeDate', function (ev) {
                    if (data.startDateClass) {
                        input.datetimepicker('setStartDate', $('input.' + data.startDateClass).val());
                    }
                    if (data.endDateClass) {
                        input.datetimepicker('setEndDate', $('input.' + data.endDateClass).val());
                    }
                });
            }
        },
        clearAllCustomInputs: function () {
            this.$customInputBox.remove();
        },
        _createAreaOption: function () {
            var categoryDatas = this.options.items.categoryDatas;
            var options = [':' + it.util.i18n("ITVSearchBasePanel_All")]; //['all:全部'] ,"all"不能被识别，直接去掉了
            if (categoryDatas) {
                var dcs = categoryDatas['datacenter'];
                this._setOptions(options, dcs);
                var buildings = categoryDatas['building'];
                this._setOptions(options, buildings);
                var floors = categoryDatas['floor'];
                this._setOptions(options, floors);
                var rooms = categoryDatas['room'];
                this._setOptions(options, rooms);
                options.sort(this._sortFunction);
                return options;
            }
            return null;
        },
        _setOptions: function (options, datas) {
            if (!options) {
                options = [];
            }
            if (datas) {
                for (var id in datas) {
                    var data = datas[id];
                    if (dataJson.isShowAll) {
                        if (data) {
                            options.push(data.getId() + ':' + (data.getDescription() || data.getId()));
                        }
                    } else {
                        if (data && data.getChildren().size() !== 0) {
                            options.push(data.getId() + ':' + (data.getDescription() || data.getId()));
                        }
                    }
                }
            }
            return options;
        },
        _createSearchResult: function () {
            var self = this;
            var el = this.element;
            var $searchContent = this.$searchContent;
            var $searchResult = this.$searchResult = $('<div class="it-search-result"><div class="clearfix"><span class="pull-left text">' + it.util.i18n("ITSearchPane_Search_Result") + '</span></div><div class="search-line search-line-result"></div></div>').appendTo($searchContent);
        },
        _createSearchBusinessType: function (arr) {
            var self = this;
            var el = this.element;
            var $searchContent = this.$searchContent;
            var content = this.$searchMoreConditionsContent = $('<div class="bussiness-type"></div>').appendTo($searchContent);
            var title = $('<div class="clearfix bussiness-type-title"><span class="pull-left text">' + it.util.i18n("ITSearchPane_Asset_type") + '</span><div class="sanjiao-box"><span class="pull-left sanjiao rotation"></span></div></div><div class="search-line"></div>').appendTo(content);
            var ul = $('<ul class="clearfix"></ul>').appendTo(content);

            $('.it-search .searchContent .bussiness-type .bussiness-type-title').on('click', function () {
                $(this).find('.sanjiao').toggleClass('rotation');
                ul.slideToggle();
            });
            arr.forEach(function (v) {
                var theOption = v.split(':');
                var li = $('<li class="pull-left">' + theOption[1] + '</li>').attr('category', theOption[0]).appendTo(ul);
                if (theOption[0] == 'equipment') {
                    // 如果是设备，则添加统计按钮
                    li.addClass('clicked');

                }
                li.on('click', function () {
                    self.clearAllCustomInputs();
                    self._toggleClicked(this);

                    if ($(this).text() == '设备') {
                        self.statistDiv.css('display', 'flex');
                    } else {
                        self.statistDiv.css('display', 'none');
                    }
                    // console.log('这里触发事件');
                    var categoryId = $(this).attr('category');
                    self.updateModelSelect(categoryId);
                });
            });
        },
        _toggleClicked: function(li) {
            if (!$(li).hasClass('clicked')) {
                $(li).addClass('clicked');
            } else {
                $(li).removeClass('clicked');
            };
            $(li).siblings().removeClass('clicked');
            this.createAllCustomInputs($(li).text());
        },
        updateModelSelect: function(categoryId){
            this.modelParentBox.empty();
            this.createModelSelect({
                class: 'search-asset-model',
                text: it.util.i18n("ITSearchPane_Asset_Model"),
                options: this.options.items.dataTypeOption,
                parent: this.modelParentBox,
                width: this.width,
                categoryId: categoryId,
            });
        },
        _removeSearchTopLine: function () {
            this.$searchTopLine.remove();
        },
        _removeSearchContent: function () {
            this.$searchContent.remove();
        },
        _removeAll: function () {
            this._removeSearchTopLine();
            this._removeSearchContent();
            this._removeSearchTree();
            self.removeNoResult();
        },
        getSearchText: function () {
            return $('#ITSearch_text').val();
        },
        getSearchDataType: function () {
            var category;
            $('.bussiness-type ul li').each(function (i, v) {
                if ($(v).hasClass('clicked')) {
                    category = $(v).attr('category');
                    return;
                }
            });
            return category;
        },
        getSearchLocation: function () {
            return $('span.search-location').text();
        },
        getSearchDeviceType: function () {
            return $('select.search-device-type').val();
        },
        getSearchAssetModel: function () {
            return $('select.search-asset-model').val();
        },
        getSearchParentId: function () {
            return $('input.search-parentId').val();
        },
        // getFrontTime: function () {
        //     return this.$frontTime.val();
        // },
        // getLaterTime: function () {
        //     return this.$laterTime.val();
        // },
        getInputResults: function () {
            var self = this;
            this.customInputsData.forEach(function (data) {
                self.getInputResult(data);
            });
        },
        getInputResult: function (data) {
            var inputValue = $('input.' + data.inputClass).val();
            if (inputValue) {
                var key;
                if (data.isClient) {
                    key = 'U:' + data.key;
                } else {
                    key = data.key;
                }
                var operation = data.operation;
                this.conditions.push({
                    key: key,
                    value: inputValue,
                    type: 'string',
                    operation: operation
                });
            }
        },
        getResults: function () {
            var self = this;
            this.conditions = [];
            var text = this.getSearchText();
            if (text) {
                this.conditions.push({
                    key: 'id,name,dataTypeId',
                    value: text,
                    type: 'string',
                    operation: 'like'
                });
            }
            var category = this.getSearchDataType();
            if (category) {
                this.conditions.push({
                    key: 'C:id',
                    value: category,
                    type: 'string',
                    operation: '='
                });
            }
            var location = this.getSearchLocation();
            if (location && location != '全部' && location != 'All') {
                this.conditions.push({
                    key: 'u:ancestor',
                    value: location,
                    type: 'string',
                    operation: '='
                });
            }
            var assetModel = this.getSearchAssetModel();
            if (assetModel) {
                this.conditions.push({
                    key: 'dataTypeId',
                    value: assetModel,
                    type: 'string',
                    operation: '='
                });
            }
            var parentId = this.getSearchParentId();
            if (parentId) {
                this.conditions.push({
                    key: 'parentId',
                    value: parentId,
                    type: 'string',
                    operation: 'like'
                });
            }

            var deviceType = this.getSearchDeviceType();
            if (deviceType) {
                this.conditions.push({
                    key: 'D:businessTypeId',
                    value: deviceType,
                    type: 'string',
                    operation: '='
                });
            }
            this.getInputResults();

            self._trigger("getResults", event, {
                conditions: self.conditions,
                callback: function (results) {
                    self.results = results;
                }
            });
            return this.results;
            //{key : "id,name", value: "xxx",type : 'string',operation : 'equal'|'like'|'between','descentdantOf'}
        },

        createNoResult: function () {
            var $searchContent = this.$searchContent;
            this.$noResult = $('<div class="no-result">' + it.util.i18n("ITSpaceSearchPane_No_Find") + '</div>').appendTo($searchContent);
        },

        removeNoResult: function () {
            if (this.$noResult) {
                this.$noResult.remove();
            }
        },
    });

    





})(jQuery)