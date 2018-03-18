(function ($) {

    $.widget("hub.newAppBasePanel", {

        options: {

        },

        _create: function () {
            this.beforeCreate();
            this.myCreate();
        },

        beforeCreate: function(){
            this.bigAppPanel = $('<div>').addClass('big-app-panel').appendTo(this.element);
        },

        // 搜索树区
        /**
         * 
         * 创建搜索树
         * @param {object} option - 创建搜索树所需要的参数 
         * @param {string} option.results - 搜索树的内容， dataFinder根据相应conditions找出来的结果 
         * @param {object} option.parent - 搜索树所插入的父对象，jq对象 
         * @param {number} option.height - 搜索树的高度，可省略 
         * @param {function} option.createLabel - 树上每一节的内容的格式，可省略 
         * @param {function} option.clickTreeNode - 点击树上每一节的内容时触发的事件，可省略  
         */
        createSearchTree: function (option) {
            this.removeSearchTree();
            var results = option.results,
                parent = option.parent,
                height = option.height,
                createLabel = option.createLabel,
                clickTreeNode = option.clickTreeNode,
                self = this;
            if (!height) {
                // height = 300;
                height = it.util.calculateHeight('new-apps-box');
            }
            var treeNode = $('<div>').addClass('app-tree');
            parent.append(treeNode);
            this.treeView = new it.TreeView(treeNode);
            this.orgTreeManager = new it.NewOrganizeTreeManager(main.sceneManager.dataManager, null, dataJson.treeIcon);
            if (createLabel) {
                this.orgTreeManager.createLabel = createLabel;
            }
            if (clickTreeNode) {
                this.treeView.clickNodeFunction = clickTreeNode;
            }
            var treeNodes = null;
            if (!results || results.length < 1) {
                this.treeView.clearTreeData();
            } else {
                treeNodes = this.orgTreeManager.organizeTree(results);
                this.treeView.setData(treeNodes, false);
            }
            this.treeView.setTreeHeight(height);
            // return this.treeView;
        },

        removeSearchTree: function () {
            if (this.treeView) {
                this.treeView.mainPane && this.treeView.mainPane.remove();
                this.treeView = null;
            }
        },

        // 取消树上的选中状态
        deselectAllTree: function () {
            if (this.treeView) {
                this.treeView.treeView.jstree(true).deselect_all();
            }
        },

        /**
         * 
         * 创建带手风琴标题的搜索树
         * @param {object} option - 创建搜索树所需要的参数 
         * @param {string} option.title - 搜索树的手风琴标题内容
         * @param {string} option.results - 搜索树的内容， dataFinder根据相应conditions找出来的结果 
         * @param {number} option.height - 搜索树的高度 
         * @param {function} option.createLabel - 树上每一节的内容的格式 
         * @param {function} option.clickTreeNode - 点击树上每一节的内容时触发的事件 
         */
        createBigSearchTree: function (option, parent) {
            this.removeBigSearchTree();
            if (option.title && option.title.trim() != '') {
                var bigTreeView = $('<div>').addClass('big-tree-view');
                var titleBox = $('<div>').addClass('tree-title-box active').appendTo(bigTreeView);
                var title = $('<div>').addClass('tree-title').text(option.title.trim()).appendTo(titleBox);
                // var icon = $('<i class="icon iconfont icon-arrow-down"></i>').appendTo(titleBox);
                var treeView = $('<div>').addClass('tree-view').appendTo(bigTreeView);
                option.parent = treeView;
                this.createSearchTree(option);
                if (!parent) {
                    parent = this.element;
                }
                parent.append(bigTreeView);
                // titleBox.on('click', function () {
                //     $(this).toggleClass('active');
                //     treeView.toggle();
                // })
                this.bigTreeView = bigTreeView;
            } else {
                console.log('no title');
            }
        },

        removeBigSearchTree: function () {
            if (this.bigTreeView) {
                this.bigTreeView.remove();
                this.bigTreeView = null;
            }
        },

        /**
         * 不要直接使用这个方法，使用createAreaSelect方法
        * 创建树形选择框的树
         * @param {object} option - 创建选择树所需要的参数 
         * @param {array} option.input - 选择树所对应的input行对象，jq对象  
         * @param {array} option.parent - 选择树所插入的父对象，jq对象  
         * @param {array} option.selectTreeCategory - 选择树所需选择的资产的分类 
         * @returns 
         */
        createSelectTree: function (option) {
            var self = this;
            // var conditions = option.conditions;
            var input = option.input;
            var parent = option.parent;
            var selectTreeCategory = option.selectTreeCategory;
            var conditions = [];
            for (var i = 0; i < selectTreeCategory.length; i++) {
                conditions.push({
                    key: 'C:id',
                    value: selectTreeCategory[i],
                    type: 'string',
                    operation: '='
                })
            }
            var selectDataFinder = new it.SelectDataFinder(main.sceneManager.dataManager);
            var results = selectDataFinder.find(conditions);
            var selectOrgTreeManager = new it.SelectOrganizeTreeManager(main.sceneManager.dataManager, null, dataJson.treeIcon, selectTreeCategory);
            this.selectTreeView = new it.TreeView(parent);
            var treeNodes = null;
            treeNodes = selectOrgTreeManager.organizeTree(results);
            this.selectTreeView.setData(treeNodes, false);
            this.selectTreeView.clickNodeFunction = function (treeData) {
                parent.hide();
                input.val(treeData.id);
            };
            return treeNodes;
        },
        // 搜索树区完


        // 搜索标题区
        // 创建一个搜索结果的那个标题栏，好像得改改，变成那种可以折起来的那种，参照资产搜索
        createSearchResultTitle: function () {
            if (this.searchResultTitle) {
                return;
            }
            this.searchResultTitle = $('<div>').addClass('app-result-title');
            this.createText({
                text: it.util.i18n("Search_Result"),
            }, this.searchResultTitle);
            this.createAddLine(this.searchResultTitle);
            this.element.append(this.searchResultTitle);
        },

        removeSearchResultTitle: function () {
            if (this.searchResultTitle) {
                this.searchResultTitle.remove();
                this.searchResultTitle = null;
            }
        },
        // 搜索标题区完


        // 创建line区
        /**
         * 
         * 创建标题行，可以点击右侧圆圈隐藏面板，然后点击标题按钮显示面板。
         * @param {object} option - 传入的自身的主要参数
         * @param {string} option.title - 面板标题的内容 
         * @param {object} parent - 所生成的行加入的父对象，若没有则默认为this.bigAppPanel
         * @returns {object} 整行的jq对象
         */
        createTitle: function (option, parent) {
            var head = $('<div>').addClass('app-head')
            var title = $('<span>').addClass('app-title').text(option.title);
            this.title = title;
            var circle = $('<div>').addClass('app-circle');
            var insideCircle = $('<div>').addClass('app-circle-inside');
            circle.attr('title', '隐藏').append(insideCircle);
            head.append(title);
            head.append(circle);
            if (!parent) {
                parent = this.bigAppPanel;
            }
            parent.append(head);
            var self = this;
            circle.on('mouseup', function () {
                self.doHidePanel();
            });
            title.on('mouseup', function () {
                self.doShowPanel();
            });
            return head;
        },

        /**
         * 创建输入框行。
         * @param {object} option - 传入的自身的主要参数
         * @param {string} option.key - 代表本输入框的key，不可省略
         * @param {string} option.placeholder - 输入框的placeholder，可省略
         * @param {string} option.class - 输入框的class，可省略，省略了就没有class
         * @param {object} parent - 所生成的行加入的父对象，若没有则默认为this.bigAppPanel
         * @returns {object} 输入框的jq对象
         */
        createInput: function (option, parent) {
            option = this.makeDefaultOption(option);
            var key = option.key;
            var line = $('<div>').addClass('app-input-line app-line');
            var input = $('<input placeholder="' + option.placeholder + '">').addClass(option.class + ' input');
            line.append(input);
            if (!parent) {
                parent = this.bigAppPanel;
            }
            parent.append(line);
            this.allValueBox[key] = {
                type: 'input',
                ele: line,
            }
            return line;
        },

        /**
         * 
         * 创建 左文字+右输入框行。
         * @param {object} option - 传入的自身的主要参数
         * @param {string} option.key - 代表本输入框的key，不可省略
         * @param {object} option.autoComplete - 代表本输入框是否带有自动完成功能
         * @param {array} option.autoComplete.source - 代表本输入框自动完成功能的每一个选项
         * @param {array} option.autoComplete.inputChangeOther - 代表本输入框自动完成为指定值后对其他行造成的影响
         * @param {string} option.text - 输入框左边的文字内容，可省略，省略后就只剩一个输入框，不建议省略
         * @param {string} option.placeholder - 输入框的placeholder，可省略
         * @param {string} option.class - 输入框的class，可省略，省略了就没有class
         * @param {string} option.inputText - 输入框的默认值，可省略
         * @param {object} option.attrs - 输入框添加一些额外的属性，写成对象的形式，可省略
         * @param {object} parent - 所生成的行加入的父对象，若没有则默认为this.bigAppPanel
         * @returns {object} 右输入框的jq对象
         */
        createTextInput: function (option, parent) {
            var self = this;
            option = this.makeDefaultOption(option);
            var key = option.key;
            var autoComplete = option.autoComplete;
            var line = $('<div>').addClass('app-text-input-line app-line');
            var text = $('<span>').text(option.text).addClass(option.class + ' text');
            var inputDiv = $('<div>').addClass(option.class + ' input');
            var input = $('<input placeholder="' + option.placeholder + '">').val(option.inputText).appendTo(inputDiv);
            if (option.attrs instanceof Object) {
                for (var i in option.attrs) {
                    input.attr(i, option.attrs[i]);
                }
            }
            line.append(text);
            line.append(inputDiv);
            if (autoComplete) {
                input.autocomplete({
                    appendTo: inputDiv,
                    source: autoComplete.source,
                    minLength: 0,
                    select: function(event, ui) {
                        if(autoComplete.inputChangeOther){
                            var keyWord = ui.item.value;
                            if(autoComplete.inputChangeOther[keyWord]){
                                var otherArray = autoComplete.inputChangeOther[keyWord];
                                for (var i = 0; i < otherArray.length; i++) {
                                    self.setValue(otherArray[i].key, otherArray[i].value);
                                }
                            }
                        }
                    },
                });
                input.on('focus', function () {
                    input.autocomplete('search', input.val());
                })
            }
            if (!parent) {
                parent = this.bigAppPanel;
            }
            parent.append(line);
            this.allValueBox[key] = {
                type: 'input',
                ele: input,
            }
            return input;
        },

        /**
         * 
         * 创建 树形选择框的行。 3d机房中选择位置用的。
         * @param {object} option - 传入的自身的主要参数
         * @param {string} option.key - 代表本选择框的key，不可省略
         * @param {string} option.text - 选择框左边的文字内容，可省略，省略后就只剩一个选择框，不建议省略！
         * @param {string} option.placeholder - 选择框的placeholder，可省略
         * @param {string} option.class - 选择框的class，可省略，省略了就没有class
         * @param {string} option.inputText - 选择框的默认值，可省略
         * @param {object} option.attrs - 选择框添加一些额外的属性，写成对象的形式，可省略
         * @param {array} option.selectTreeCategory - 不可省略！！！
         * @param {object} parent - 所生成的行加入的父对象，若没有则默认为this.bigAppPanel
         * @returns {object}  { input: input, tree: selectTreeBox, };
         */
        createAreaSelect: function (option, parent) {
            var self = this;
            var key = option.key;
            var line = $('<div>').addClass('app-text-input-line app-line');
            var text = $('<span>').text(option.text).addClass(option.class + ' text');
            var inputDiv = $('<div>').addClass(option.class + ' input');
            var input = $('<input placeholder="' + option.placeholder + '">').val(option.inputText).appendTo(inputDiv);
            var selectTreeBox = $('<div>').addClass('select-tree-box').appendTo(inputDiv);
            selectTreeBox.hide();
            if (option.attrs) {
                for (var key in option.attrs) {
                    input.attr(key, option.attrs[key]);
                }
            }
            line.append(text);
            line.append(inputDiv);
            if (!parent) {
                parent = this.bigAppPanel;
            }
            parent.append(line);
            input.on('click', function () {
                selectTreeBox.empty();
                self.createSelectTree({
                    // conditions: conditions,
                    input: input,
                    parent: selectTreeBox,
                    selectTreeCategory: option.selectTreeCategory,
                });
                selectTreeBox.toggle();
            });
            var areaSelectObj = {
                input: input,
                tree: selectTreeBox,
            }
            this.allValueBox[key] = {
                type: 'areaSelect',
                ele: input,
                tree: selectTreeBox,
            }
            return areaSelectObj;
        },

        /**
         * 
         * 创建 左文本+右选择框的行。 注意：为了方便调整样式，以及选择器拓展功能，使用了bootstrap-select插件
         * @param {object} option - 传入的自身的主要参数
         * @param {string} option.key - 代表本选择框的key，不可省略
         * @param {string} option.text - 选择框左边的文字内容，可省略，省略后就只剩一个输入框，不建议省略
         * @param {string} option.class - 选择框的class，可省略，省略了就没有class
         * @param {array} option.options - 选择框的内容，不可省略！！！
         * @param {string} option.options[].value - 选择框中每一项的value，不可省略！！！
         * @param {string} option.options[].content - 选择框中每一项的content，不可省略！！！
         * @param {string} option.selectChangeTrigger - 当选择框需要派发出选中事件时，填写此值，格式为字符串，派发出的事件名，参数为(e, 选中的值)
         * @param {string} option.selectParentChangeChildName - 和下一个值配合使用。当选择框改变时需要 更改其他的选择框 的时候，格式为字符串，需要更改的选择框的key
         * @param {string} option.selectParentChangeChildArray - 和上一个值配合使用。需要更改的选择框组成所需的数据源
         * @param {object} parent - 所生成的行加入的父对象，若没有则默认为this.bigAppPanel
         * @returns {object}  select的jq对象
         */
        createTextSelect: function (option, parent) {
            var self = this;
            var key = option.key;
            var selectChangeTrigger = option.selectChangeTrigger;
            var selectParentChangeChildName = option.selectParentChangeChildName;
            var selectParentChangeChildArray = option.selectParentChangeChildArray;

            option = this.makeDefaultOption(option);
            var line = $('<div>').addClass('app-text-select-line app-line');
            var text = $('<span>').text(option.text).addClass(option.class + ' text');
            var selectDiv = $('<div>').addClass(option.class + ' input');
            var select = $('<select>').addClass('selectpicker').attr('data-live-search', "true").appendTo(selectDiv);
            var theOption;
            option.options.sort(this.sortFunction);
            for (var i = 0; i < option.options.length; i++) {
                var theOptionMsg = option.options[i];
                theOption = $('<option>').attr('value', theOptionMsg.value).text(theOptionMsg.content);
                select.append(theOption);
            }
            line.append(text);
            line.append(select);
            if (!parent) {
                parent = this.bigAppPanel;
            }
            parent.append(line);
            select.selectpicker('render');
            if (selectChangeTrigger) {
                select.on('hidden.bs.select', function (e) {
                    var val = select.selectpicker('val');
                    self._trigger(selectChangeTrigger, e, val);
                });
            }
            if (selectParentChangeChildName) {
                select.on('hidden.bs.select', function (e) {
                    var val = select.selectpicker('val');
                    self.selectChange(self.selectBox[selectParentChangeChildName], val, selectParentChangeChildArray);
                });
            }
            this.allValueBox[key] = {
                type: 'select',
                ele: select,
            }
            return select;
        },

        /**
         * 
         * 创建 按钮组。 
         * @param {array} option - 传入按钮组的参数，可省略，有默认值；若要自行设定，则每一项都不能少
         * @param {string} option[].class - 各个按钮的class，设置样式用，不可省略！！！
         * @param {string} option[].text - 各个按钮上的文字，不可省略！！！
         * @param {string} option[].trigger - 各个按钮点击后派发的事件名，写在定义处this.options中，不可省略！！！
         * @param {object} parent - 所生成的行加入的父对象，若没有则默认为this.bigAppPanel
         * @returns {object}  按钮组的jq对象
         */
        createButtons: function (option, parent) {
            if (!option) {
                option = [{
                    class: 'clear-it active',
                    text: it.util.i18n("clear"),
                    trigger: 'doClearIt',
                }, {
                    class: 'search-it active',
                    text: it.util.i18n("Search"),
                    trigger: 'doSearchIt',
                }, ];
            }
            // var group = $('<div>').addClass('app-btn-group clearfix');
            var group = $('<div>').addClass('app-btn-group');
            var divBox = {};
            for (var i = 0; i < option.length; i++) {
                var div = $('<div>').addClass(option[i].class).text(option[i].text);
                divBox[option[i].class] = div;
                group.append(div);
            }
            if (!parent) {
                parent = this.bigAppPanel;
            }
            parent.append(group);
            var self = this;
            for (var i = 0; i < option.length; i++) {
                if (option[i].trigger) {
                    divBox[option[i].class].on('click', {
                        functionName: option[i].trigger
                    }, function (e) {
                        // console.log(e.data);
                        self._trigger(e.data.functionName, e);
                    })
                }
            }
            return group;
        },

        /**
         * 
         * 创建 一条横线。 
         * @param {any} parent - 所生成的行加入的父对象，若没有则默认为this.element
         * @returns 一条横线的jq对象
         */
        createAddLine: function (parent) {
            var line = $('<div>').addClass('app-black-line app-line');
            if (!parent) {
                parent = this.element;
            }
            parent.append(line);
            return line;
        },

        /**
         * 
         * 创建 一排文字。 
         * @param {object} option - 传入一排文字的参数
         * @param {string} option.text - 文字的内容，不可省略！！！
         * @param {object} parent - 所生成的行加入的父对象，若没有则默认为this.element
         * @returns {object}  一排文字的jq对象
         */
        createText: function (option, parent) {
            var line = $('<div>').addClass('app-text-line app-line').text(option.text);
            if (!parent) {
                parent = this.element;
            }
            parent.append(line);
            return line;
        },

        /**
         * 
         * 创建 带起始时间和结束时间的行。 
         * @param {object} option - 传入时间行的参数
         * @param {string} option.text - 时间行上的文字内容，可省略
         * @param {object} parent - 所生成的行加入的父对象，若没有则默认为this.element
         * @returns {object}  时间行的jq对象
         */
        createTimeInput: function (option, parent) {
            var line = $('<div>').addClass('app-time-line app-line');
            var text = $('<span>').text(option.text).addClass('text').appendTo(line);
            var input = $('<div>').addClass('input').appendTo(line)
            var startInput = $('<input>').addClass('app-time-line-start').appendTo(input);
            var endInput = $('<input>').addClass('app-time-line-end').appendTo(input);
            if (!parent) {
                parent = this.element;
            }
            parent.append(line);
            this.makeDateTimePicker(startInput);
            this.makeDateTimePicker(endInput);
            return line;
        },
        // 创建line区完


        // 核心功能区

        // inputBox: {},
        // selectBox: {},
        // areaSelectBox: {},

        allValueBox: {},

        getEle: function(key){
            return this.allValueBox[key].ele;
        },

        getInputBox: function () {
            var obj = {};
            for (var i in this.allValueBox) {
                if(this.allValueBox[i].type == 'input'){
                    obj[i] = this.getEle(i);
                }
            }
            return obj;
        },

        getSelectBox: function () {
            var obj = {};
            for (var i in this.allValueBox) {
                if(this.allValueBox[i].type == 'select'){
                    obj[i] = this.getEle(i);
                }
            }
            return obj;
        },

        getAreaSelectBox: function () {
            var obj = {};
            for (var i in this.allValueBox) {
                if(this.allValueBox[i].type == 'areaSelect'){
                    obj[i] = this.getEle(i);
                }
            }
            return obj;
        },

        setInputValue: function (key, value) {
            this.allValueBox[key].ele.val(value);
        },

        getInputValue: function (key) {
            return this.allValueBox[key].ele.val();
        },

        setSelectValue: function (key, value) {
            this.allValueBox[key].ele.val(value);
            this.allValueBox[key].ele.selectpicker('refresh');
        },

        getSelectValue: function (key) {
            return this.allValueBox[key].ele.selectpicker('val');
        },

        setAreaSelectValue: function (key, value) {
            this.allValueBox[key].ele.val(value);
            this.allValueBox[key].tree.hide();
        },

        getAreaSelectValue: function (key) {
            return this.allValueBox[key].ele.val();
        },

        setValue: function(key, value){
            var obj = this.allValueBox[key];
            if (obj) {
                switch (obj.type) {
                    case 'input':
                        return this.setInputValue(key, value);
                        break;
                    case 'select':
                        return this.setSelectValue(key, value);
                        break;
                    case 'areaSelect':
                        return this.setAreaSelectValue(key, value);
                        break;
                }
            } else {
                console.log('不存在对应的key')
            }
        },

        getValue: function(key){
            var obj = this.allValueBox[key];
            if (obj) {
                switch (obj.type) {
                    case 'input':
                        return this.getInputValue(key);
                        break;
                    case 'select':
                        return this.getSelectValue(key);
                        break;
                    case 'areaSelect':
                        return this.getAreaSelectValue(key);
                        break;
                }
            } else {
                console.log('不存在对应的key')
            }
        },

        getAllValue: function(){
            var valueMap = {};
            for (var i in this.allValueBox) {
                valueMap[i] = this.getValue(i);
            }
            return valueMap;
        },

        refreshAll: function () {
            for (var i in this.allValueBox) {
                this.setValue(i, '');
            }

            this.removeBigSearchTree();
            this.removeSearchTree();
            this.removeSearchResultTitle();
        },

        clear: function () {
            console.error('已经停止维护的方法，请换新方法refreshAll');
            this.element.find('input').each(function () {
                $(this).val('');
            })
            this.element.find('select').each(function () {
                $(this).find('option').first().prop("selected", 'selected');
                $(this).selectpicker('refresh');
            })
            if (this.searchResultTitle) {
                this.removeSearchResultTitle();
            }
            if (this.treeView) {
                this.removeSearchTree();
            }
        },

        doHidePanel: function () {
            this.element.css('visibility', 'hidden');
            this.title.css('visibility', 'visible');
        },

        doShowPanel: function () {
            this.element.css('visibility', 'visible');
        },

        destory: function () {
            this.element && this.element.remove();
        },

        /**
         * 使用一个数组来创建整个面板
         * @param {array} array - 参数为一个数组
         * @param {array} array[].methonName - 需要使用的this上的方法名methonName
         * @param {array} array[].params - 需要该方法所需要的参数，不需要参数则可不写
         */
        createPanelByArray: function (array) {
            for (var i = 0; i < array.length; i++) {
                var line = array[i];
                var methodName = line.methodName;
                var params = line.params;
                this[methodName](params);
            }
        },
        // 核心功能区完


        // 附加功能区
        makeDefaultOption: function (option) {
            var defaultOption = {
                placeholder: '',
                text: '',
                inputText: '',
            }
            option = $.extend({}, defaultOption, option);
            return option;
        },

        /**
         * 数组排序函数
         * @param {any} a 
         * @param {any} b 
         * @returns 
         */
        sortFunction: function (a, b) {
            if (!a) {
                return -1;
            }
            if (!b) {
                return 1;
            }
            var des1 = a.content;
            var des2 = b.content;
            if (des1 == 'all' || des1 == it.util.i18n("ITVSearchBasePanel_All") || des1 == '') {
                return -1;
            } else if (des2 == 'all' || des2 == it.util.i18n("ITVSearchBasePanel_All") || des2 == '') {
                return 1;
            }
            return it.Util.compare(des1, des2);
        },

        /**
         * 
         * 针对有父子关系的select，当父亲值改变时，触发此函数，改变孩子的内容
         * @param {string} child -孩子的jq对象
         * @param {string} val -父亲改变后的值
         * @param {array} array -孩子全部的option的数组，每一项带有属性parent，若没有parent则对任何父亲的值都会展示
         */
        selectChange: function (child, val, array) {
            child.empty();
            var theOption;
            for (var i = 0; i < array.length; i++) {
                if (val == '' || array[i].parent == '' || (array[i].parent && array[i].parent == val)) {
                    theOption = $('<option>').attr('value', array[i].value).text(array[i].content);
                    child.append(theOption);
                }
            }
            child.selectpicker('refresh');
        },

        /**
         * 使用新的array数组，更新select的选项
         * @param {object} select 
         * @param {array} array 
         */
        updateSelectByData: function (select, array) {
            select.empty();
            var theOption;
            for (var i = 0; i < array.length; i++) {
                theOption = $('<option>').attr('value', array[i].value).text(array[i].content);
                select.append(theOption);
            }
            select.selectpicker('refresh');
        },

        makeDateTimePicker: function (input) {
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
                input.datetimepicker('setStartDate', input.val());
                input.datetimepicker('setEndDate', input.val());
            });
        },
        adjustBounds: function(){
            var height = it.util.calculateHeight('new-apps-box');
            this.treeView.setTreeHeight(height);
        }
        // 附加功能区完

    })

    // 设备上架
    $.widget("hub.NewDeviceOnApp", $.hub.newAppBasePanel, {
        options: {
            bussinessSelects: [{
                value: '',
                content: it.util.i18n("All"),
            }, ],
        },

        myCreate: function () {
            // var self = this;
            this.element.addClass('device-on-panel');
            this.createTitle({
                title: it.util.i18n("DeviceOn_Device_On")
            });
            this.bussinessSelect = this.createTextSelect({
                key: 'bussiness',
                class: 'DeviceOn-Device-Bussiness-Type',
                text: it.util.i18n("DeviceOn_Device_type"),
                options: this.options.bussinessSelects,
            });
            this.btns = this.createButtons([{
                class: 'clear-it active',
                text: it.util.i18n("DeviceOn_Clear"),
                trigger: 'doClearIt',
            }, {
                class: 'search-it active',
                text: it.util.i18n("DeviceOn_Filter"),
                trigger: 'doSearchIt',
            }, ]);
        },
    })

    // 设备下架
    $.widget("hub.NewDeviceOffApp", $.hub.newAppBasePanel, {

        options: {
            roomSelects: [{
                value: '',
                content: it.util.i18n("All"),
            }, ],

            rackSelects: [{
                value: '',
                content: it.util.i18n("All"),
                parent: '',
            }, ],

            bussinessSelects: [{
                value: '',
                content: it.util.i18n("All"),
            }, ],

            datatypeSelects: [{
                value: '',
                content: it.util.i18n("All"),
            }, ],
        },
        myCreate: function () {
            // var self = this;
            this.element.addClass('device-off-panel');
            this.createTitle({
                title: it.util.i18n("DeviceOff_Device_Off")
            });
            this.roomSelect = this.createTextSelect({
                key: 'room',
                class: 'DeviceOff-Device-In-Room',
                text: it.util.i18n("DeviceOff_Device_In_Room"),
                options: this.options.roomSelects,
                selectParentChangeChildName: 'rack',
                selectParentChangeChildArray: this.options.rackSelects,
            });
            this.rackSelect = this.createTextSelect({
                key: 'rack',
                class: 'DeviceOff-Device-In-Rack',
                text: it.util.i18n("DeviceOff_Device_In_Rack"),
                options: this.options.rackSelects,
            });
            this.bussinessSelect = this.createTextSelect({
                key: 'bussiness',
                class: 'DeviceOff-Device-Bussiness-Type',
                text: it.util.i18n("DeviceOff_Business_type"),
                options: this.options.bussinessSelects,
            });
            this.datatypeSelect = this.createTextSelect({
                key: 'datatype',
                class: 'DeviceOff-Device-Datatype',
                text: it.util.i18n("DeviceOff_Device_type"),
                options: this.options.datatypeSelects,
            });
            this.idInput = this.createTextInput({
                key: 'id',
                class: 'DeviceOff-Device-Id',
                text: it.util.i18n("DeviceOff_Device_ID"),
                placeholder: it.util.i18n("DeviceOff_Input_device_ID"),
            });
            this.nameInput = this.createTextInput({
                key: 'name',
                class: 'DeviceOff-Device-Name',
                text: it.util.i18n("DeviceOff_Device_Name"),
                placeholder: it.util.i18n("DeviceOff_Input_device_Name"),
            });
            this.btns = this.createButtons();

            // this.roomSelect.on('hidden.bs.select', function (e) {
            //     var val = self.roomSelect.selectpicker('val');
            //     self.selectChange(self.rackSelect, val, self.options.rackSelects);
            // });
        },
    })


    //数据监控
    $.widget("hub.RealTimeApp", $.hub.newAppBasePanel, {

        options: {
            roomSelects: [{
                'value': '',
                content: it.util.i18n("All"),
            }],
            typeSelects: [{
                value: '',
                content: it.util.i18n("All"),
            }]
        },
        myCreate: function () {
            // var self = this;
            this.element.addClass('real-time-panel');
            this.createTitle({
                title: it.util.i18n("Realtime_Data_Monitor")
            });
            this.idInput = this.createTextInput({
                key: 'id',
                class: 'Realtime-Device-Id',
                text: it.util.i18n("Realtime_Device_Id"),
                placeholder: it.util.i18n("Realtime_Input_DeviceId"),
            });
            this.roomSelect = this.createTextSelect({
                key: 'room',
                class: 'Realtime-Device-In-Room',
                text: it.util.i18n("Realtime_Room"),
                options: this.options.roomSelects,
            });
            this.typeSelect = this.createTextSelect({
                key: 'category',
                class: 'Realtime-Device-Type',
                text: it.util.i18n("Realtime_Asset_Type"),
                options: this.options.typeSelects,
            });

            this.createButtons();
        },
    })

    // 机柜预占用
    $.widget("hub.RackPreOccupiedApp", $.hub.newAppBasePanel, {
        options: {
            extendField: {
                customerName: {
                    id: 'customerName',
                    name: '客户名称',
                    arrays: [{
                        value: '',
                        content: '全部',
                    }, ],
                },
                user: {
                    id: 'user',
                    name: '占用人',
                    arrays: [{
                        value: '',
                        content: '全部',
                    }, ],
                }
            },
        },

        myCreate: function () {
            // var self = this;
            this.element.addClass('rack-pre-occupied-panel');
            this.createTitle({
                title: it.util.i18n('Rack_Pre_Occupied'),
            });
            this.positionInputSelect = this.createAreaSelect({
                key: 'position',
                class: 'rack-pre-occupied-position',
                text: it.util.i18n('Rack_Pre_Position'),
                placeholder: it.util.i18n('Rack_Pre_Select_Position'),
                selectTreeCategory: this.options.selectTreeCategory,
            });

            this.extendLine = {};
            for (var key in this.options.extendField) {
                var line = this.createTextSelect({
                    key: this.options.extendField[key].id,
                    class: 'rack-pre-occupied-' + this.options.extendField[key].id,
                    text: this.options.extendField[key].name,
                    options: this.options.extendField[key].arrays,
                })
                this.extendLine[key] = line;
            }

            this.btns = this.createButtons([{
                class: 'clear-it active',
                text: it.util.i18n('Rack_Pre_Reset'),
                trigger: 'doClearIt',
            }, {
                class: 'search-it active',
                text: it.util.i18n('Rack_Pre_Confirm'),
                trigger: 'doSearchIt',
            }, ]);
        },

        updateExtendField: function () {
            for (var key in this.extendLine) {
                this.updateSelectByData(this.extendLine[key], this.options.extendField[key].arrays);
            }
        },

    })

    // U位预占用
    $.widget("hub.UPreOccupiedApp", $.hub.newAppBasePanel, {
        options: {
            extendField: {
                customerName: {
                    id: 'customerName',
                    name: '客户名称',
                    arrays: [{
                        value: '',
                        content: '全部',
                    }, ],
                },
                user: {
                    id: 'user',
                    name: '占用人',
                    arrays: [{
                        value: '',
                        content: '全部',
                    }, ],
                }
            },
        },

        myCreate: function () {
            // var self = this;
            this.element.addClass('u-pre-occupied-panel');
            this.createTitle({
                title: it.util.i18n('U_Pre_Occupied'),
            });
            this.positionAreaSelect = this.createAreaSelect({
                key: 'position',
                class: 'u-pre-occupied-position',
                text: it.util.i18n('Rack_Pre_Position'),
                placeholder: it.util.i18n('Rack_Pre_Select_Position'),
                selectTreeCategory: this.options.selectTreeCategory,
            });
            this.uHeightInput = this.createTextInput({
                key: 'u-height',
                class: 'u-height',
                text: it.util.i18n("U_Pre_Occupied_U_Height"),
            });

            this.extendLine = {};
            for (var key in this.options.extendField) {
                var line = this.createTextSelect({
                    key: this.options.extendField[key].id,
                    class: 'u-pre-occupied-' + this.options.extendField[key].id,
                    text: this.options.extendField[key].name,
                    options: this.options.extendField[key].arrays,
                })
                this.extendLine[key] = line;
            }

            this.btns = this.createButtons([{
                class: 'clear-it active',
                text: it.util.i18n('Setting_Cancel'),
                trigger: 'doClearIt',
            }, {
                class: 'search-it active',
                text: it.util.i18n('Admin_main_Search'),
                trigger: 'doSearchIt',
            }, ]);
        },

        // updateExtendField: function () {
        //     for (var key in this.extendLine) {
        //         this.updateSelectByData(this.extendLine[key], this.options.extendField[key].arrays);
        //     }
        // },

    });

    // 单路摄像头
    $.widget("hub.CameraPanel", $.hub.newAppBasePanel, {
        options: {

        },
        myCreate: function () {
            // var self = this;
            this.element.addClass('camera-panel');
            this.element.css('padding', '0 10px');
            this.createTitle({
                title: it.util.i18n("Camera_Search")
            });
            this.idInput = this.createTextInput({
                key: 'id',
                class: 'Camera-Id',
                text: it.util.i18n("id"),
                placeholder: it.util.i18n("Camera_Input_camera_ID"),
            });
            this.nameInput = this.createTextInput({
                key: 'name',
                class: 'Camera-Name',
                text: it.util.i18n("name"),
                placeholder: it.util.i18n("Camera_Input_camera_Name"),
            });
            this.positionInputSelect = this.createAreaSelect({
                key: 'u:ancestor',
                class: 'camera_area',
                text: it.util.i18n("point"),
                placeholder: it.util.i18n("Rack_Pre_Select_Position"),
                selectTreeCategory: this.options.selectTreeCategory,
            });
            this.btns = this.createButtons([{
                class: 'do-view active',
                text: it.util.i18n("field_of_vision"),
                trigger: 'doView',
            }, {
                class: 'clear-it active',
                text: it.util.i18n("Setting_Cancel"),
                trigger: 'doClearIt',
            }, {
                class: 'search-it active',
                text: it.util.i18n("Search"),
                trigger: 'doSearchIt',
            }, ]);
        },
        // getAllInputValue: function () {
        //     var valueMap = {};
        //     for (var i in this.inputBox) {
        //         valueMap[i] = this.getInputValue(i);
        //     }
        //     for (var i in this.areaSelectBox) {
        //         valueMap[i] = this.getAreaSelectValue(i);
        //     }
        //     return valueMap;
        // }
    });

    // 推荐位置
    $.widget("hub.RecommendedLocationApp", $.hub.newAppBasePanel, {
        options: {
            deviceModelSelects: [{
                value: '',
                content: it.util.i18n("All"),
            }, ],
        },

        myCreate: function () {

            var array = [{
                methodName: 'createTitle',
                params: {
                    title: it.util.i18n('Recommended_Location_Recommended_Location'),
                },
            }, {
                methodName: 'createAreaSelect',
                params: {
                    key: 'position',
                    class: 'Recommended-Location-Position',
                    text: it.util.i18n('Rack_Pre_Position'),
                    placeholder: it.util.i18n('Rack_Pre_Select_Position'),
                    selectTreeCategory: this.options.selectTreeCategory,
                },
            }, {
                methodName: 'createTextSelect',
                params: {
                    key: 'model',
                    class: 'Device-Model',
                    text: it.util.i18n("DeviceLabel_Device_Model"),
                    options: this.options.deviceModelSelects,
                    selectChangeTrigger: 'setOtherInputs',
                },
            }, {
                methodName: 'createTextInput',
                params: {
                    key: 'uHeight',
                    class: 'U-Height',
                    text: it.util.i18n("U_Pre_Occupied_U_Height"),
                },
            }, {
                methodName: 'createTextInput',
                params: {
                    key: 'weightRating',
                    class: 'Weight-Rating',
                    text: it.util.i18n("weightRating"),
                },
            }, {
                methodName: 'createTextInput',
                params: {
                    key: 'powerRating',
                    class: 'Power-Rating',
                    text: it.util.i18n("powerRating"),
                },
            }, {
                methodName: 'createButtons',
                params: [{
                    class: 'clear-it active',
                    text: it.util.i18n('Setting_Cancel'),
                    trigger: 'doClearIt',
                }, {
                    class: 'search-it active',
                    text: it.util.i18n('Admin_main_Search'),
                    trigger: 'doSearchIt',
                }, ],
            }, ]

            // 这个数组还可以放到创建面板的app那里，作为一个参数传进来
            this.createPanelByArray(array);

        },

    });

    // 添加资产
    $.widget("hub.AssetOnApp", $.hub.newAppBasePanel, {
        myCreate: function () {
            this.element.addClass('asset-on-panel');
            this.createPanelByArray(this.options.array);
        },
    })

    // 添加资产弹框
    $.widget("hub.AssetOnPop", $.hub.newAppBasePanel, {
        myCreate: function () {
            this.element.addClass('asset-on-pop');
            this.createPanelByArray(this.options.array);
        },
    })

    //配线搜索
    $.widget("hub.LinkSearchApp", $.hub.newAppBasePanel, {
        myCreate: function(){
            this.element.addClass('link-search-panel');
            this.createTitle({
                title: it.util.i18n("LinkSearch_Link_Search")
            });
            this.createInput({
                class: 'LinkSearch-Num',
                placeholder: it.util.i18n("LinkSearch_Input_ID")
            });
            this.createButtons();
        },
        getSearchNum: function () {
            return $('input.input.LinkSearch-Num').val();
        },
        
        getConditions: function () {
            var conditions = [];
            var searchNum = this.getSearchNum();
            if (searchNum) {
                conditions.push({
                    key: 'id',
                    value: searchNum,
                    dataType: 'string',
                    operation: 'like'
                });
            }
            return conditions;
        },
        removeSearchTree: function () {
            this.element.find('.app-tree').remove();
        },
    });


    $.widget("hub.SpaceSearchApp", $.hub.newAppBasePanel, {
        myCreate: function () {
            this.element.addClass('space-search-panel');
            this.createTitle({
                title: it.util.i18n("SpaceSearchApp_Space_Search"),
            });
            this.createTextInput({
                class: 'SpaceSearchPanel-U-count',
                text: it.util.i18n("SpaceSearchApp_U_nums"),
            });
            this.positionInputSelect = this.createAreaSelect({
                class: 'SpaceSearchPanel-space-location',
                text: it.util.i18n("SpaceSearchApp_Position"),
                selectTreeCategory: ['floor', 'room'],
                placeholder: it.util.i18n('All')
            });
            this.createButtons();
        },

        setOptions: function (options, datas) {
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

        createAreaOption: function () {
            var categoryDatas = this.dataManager._categoryDatas;
            var options = [':' + it.util.i18n("ITVSearchBasePanel_All")]; //['all:全部'] ,"all"不能被识别，直接去掉了
            if (categoryDatas) {
                var floors = categoryDatas['floor'];
                this.setOptions(options, floors);
                var rooms = categoryDatas['room'];
                this.setOptions(options, rooms);
                options.sort(this._sortFunction);
                return options;
            }
            return null;
        },
        createAreaSelect: function (option, parent) {
            var self = this;
            var line = $('<div>').addClass('app-text-input-line app-line');
            var text = $('<span>').text(option.text).addClass(option.class + ' text');
            var inputDiv = $('<div>').addClass(option.class + ' input');
            var input = $('<input placeholder="' + option.placeholder + '">').val(option.inputText).appendTo(inputDiv).css('width','100%');
            var selectTreeBox = this.selectTreeBox = $('<div>').addClass('select-tree-box').appendTo(inputDiv);
            selectTreeBox.hide();
            if (option.attrs) {
                for (var key in option.attrs) {
                    input.attr(key, option.attrs[key]);
                }
            }
            line.append(text);
            line.append(inputDiv);
            if (!parent) {
                parent = this.bigAppPanel;
            }
            parent.append(line);
            input.on('click', function () {
                selectTreeBox.empty();
                self.createSelectTree({
                    // conditions: conditions,
                    parent: selectTreeBox,
                    selectTreeCategory: option.selectTreeCategory,
                });
                selectTreeBox.toggle();
            });
            return {
                input: input,
                tree: selectTreeBox,
            };
        },

        createSelectTree: function (option) {
            var self = this;
            // var conditions = option.conditions;
            var parent = option.parent;
            var selectTreeCategory = option.selectTreeCategory;
            var conditions = [];
            for (var i = 0; i < selectTreeCategory.length; i++) {
                conditions.push({
                    key: 'C:id',
                    value: selectTreeCategory[i],
                    type: 'string',
                    operation: '='
                })
            }
            var selectDataFinder = new it.SelectDataFinder(main.sceneManager.dataManager);
            var results = selectDataFinder.find(conditions);
            var selectOrgTreeManager = new it.SelectOrganizeTreeManager(main.sceneManager.dataManager, null, dataJson.treeIcon, selectTreeCategory);
            this.selectTreeView = new it.TreeView(parent);
            var treeNodes = null;
            treeNodes = selectOrgTreeManager.organizeTree(results);
            this.selectTreeView.setData(treeNodes, false);
            this.selectTreeView.clickNodeFunction = function (treeData) {
                self.setSelectValue(treeData.id);
            };
            return treeNodes;
        },

        hideTreeBox:function(){
            this.selectTreeBox.hide()
        },
        setSelectValue: function (text) {
            this.positionInputSelect.tree.toggle();
            this.positionInputSelect.input.val(text);
        },

        getUCount: function () {
            return $('input.input.SpaceSearchPanel-U-count').val();
        },

        getSpaceLocation: function () {
            return $('.SpaceSearchPanel-space-location input').val();
        },

        getConditions: function () {
            var conditions = [];
            var uCount = this.getUCount();
            if (uCount) {
                conditions.push({
                    key: 'u:dyna_user_data_maxSerSpace',
                    value: uCount,
                    dataType: 'number',
                    operation: '>='
                });
            }
            var spaceLocation = this.getSpaceLocation();
            if (spaceLocation == it.util.i18n("All")) spaceLocation = '';
            if (spaceLocation) {
                conditions.push({
                    key: 'u:ancestor',
                    value: spaceLocation,
                    dataType: 'string',
                    operartion: '='
                });
            }
            return conditions;
        },
        // doHide: function () {
        //     this.element.hide();
        // },
    })

    $.widget("hub.USearchApp", $.hub.newAppBasePanel, {
        myCreate: function () {
            this.element.addClass('u-search-panel');
            this.createTitle({
                title: it.util.i18n("USearchPanel_Location_Search")
            });
            this.createInput({
                class: 'USearchPanel-U-count',
                placeholder: it.util.i18n("USearchPanel_input_U_count")
            });
            this.createButtons();
        },

        getUCount: function () {
            return $('input.input.USearchPanel-U-count').val();
        },

        getConditions: function () {
            var conditions = [];
            var uCount = this.getUCount();
            if (uCount) {
                conditions.push({
                    key: 'sizeU',
                    value: uCount,
                    dataType: 'string',
                    operation: '='
                });
            }
            return conditions;
        },
    })



})(jQuery)