it.ITVPanel = function (parentDiv) {
    this.propertyPane = $("<div class='itv-pane'></div>");

    this.propertyTab = $("<div class='itv-pane-tab'></div>").appendTo(this.propertyPane);
    this.propertyItemsDiv = $("<div class='menu'></div>").appendTo(this.propertyTab);
    this.propertyItemsPane = $("<ul></ul>").appendTo(this.propertyItemsDiv);
    this.propertyTabContent = $('<div class="contentbox scroll-class">').appendTo(this.propertyTab);

    if (!parentDiv) {
        parentDiv = document.body;
    }
    parentDiv.appendChild(this.propertyPane[0]);
    this.closeDiv = $('<div>').prependTo(this.propertyPane);
    this.isvisible;
    this.tab = new it.Tab();
    this.tab.initAll = function () {
        var self = this;
        $('.itv-pane-tab .menu ul li').click(function (event) {
            self._onclick(event);
        });
    };
    this.tab._clearHover = function () {
        var menuItems = $('.itv-pane-tab .menu ul li');
        if (menuItems && menuItems.length > 0) {
            for (var i = 0; i < menuItems.length; i++) {
                var menuItem = menuItems[i];
                if (menuItem && menuItem.className) {
                    menuItem.className = "";
                }
            }
        }
    },
        this.hide();
};
mono.extend(it.ITVPanel, it.PropertyPane, {

    addTab: function (href, title, contentObj, className, visible, isGroup, onclick, node) {
        var tabItem = $('<li ><a href="#' + href + '" rel = "' + title + '" class= ' + className + ' >' + title + '</a></li>');

        if (visible) {
            tabItem.show();
            tabItem.attr('class', 'hover');
        }
        if (onclick) {
            tabItem.click(onclick);
        }

        this.propertyItemsPane.append(tabItem);
        var tabItemContent = $('<div class="tab-pane" id="' + href + '"></div>');
        if (visible) {
            tabItemContent.show();
        }
        tabItemContent.append(this.createTableItemContentByObj(contentObj, isGroup, node));
        this.propertyTabContent.append(tabItemContent);
    },
    _createTitle: function () {
        return;
    },
    showTabByIndex: function (index) {
        var id = 'tab_' + parseInt(index || 0);
        if ($('#' + id)[0]
            && $('#' + id)[0].children
            && $('#' + id)[0].children.length > 0
            && $('[href="#' + id + '"]')
            && $('[href="#' + id + '"]').length > 0
        ) {
            this.tab._clearHover();
            $('[href="#' + id + '"]').parent().attr('class', 'hover');
            $('.contentbox div.tab-pane').hide();
            $('#' + id).show();
        }
    },

});