(function($){
    var tabPre = 'tab_', panelPre = 'panel_';
    var getTabId = function(id){
        return tabPre + id;
    };

    var getPanelId = function(id){
        return panelPre + id;
    };
    var defaults = {
        tabIndex : 0,
        tabItems : {},
    }
    var methods = {
        init:function (options){
            var settings = this.data('bootstrapTab');
            if(settings == undefined) {
                settings = $.extend({}, defaults, options);
            } else {
                settings = $.extend({}, settings, options);
            }
            this.data('bootstrapTab', settings);
            var id = settings.id = settings.id || this.attr('id');
            id = id || '';
            settings.tabId = settings.tablist || getTabId(id);
            settings.PanelId = settings.PanelId || getPanelId(id);
            //创建tab list 
            this.$list = $('<ul>',{
                id : settings.tabId,
                class:'nav nav-tabs',
                role:'tablist',
            }).appendTo(this);
            
            //创建tab content pane
            this.$panel = $('<div>',{
                id : settings.PanelId,
                class:'tab-content'
            }).appendTo(this);

            //点击关闭按钮，删除tab
            var self = this;
            this.on('click', '.close-tab', function () {
                var id = $(this).parent().attr("id-controls");
                methods['_removeById'].call(self,id);
            });
            return this;
        },

        add : function(options){
            var tabId = getTabId(options.id), panelId = getPanelId(options.id), closeable = options.closeable;
            var settings = this.data('bootstrapTab');
            
            settings.tabItems[options.id] = options.id;
            this.find('.active').removeClass('active');
            var a = $('<a>',{
                href: '#'+panelId,
                role:'tab',
                'aria-controls':panelId,
                "data-toggle":'tab'
            }).html(options.text || options.id);
            
            var title = $('<li>',{
                class: 'active',
                role: "presentation",
                id: tabId,
            }).append(a);
            //是否添加删除按钮
            if(closeable){
                var self = this;
                var $i = $('<i class="icon-remove-sign"></i>')
                .appendTo(a)
                .click(function(event) {
                    var next;
                    if(title.hasClass('active')){
                        next = title.prev();
                        if(next.length<=0) next = title.next();
                    }
                    title.remove();
                    content.remove();
                    if(next){
                        // next.addClass('active');
                        next.children('a').first().tab('show');
                    }
                }).mouseover(function(event) {
                    $(this).css('color', 'rgba(0,0,0,0.5)');
                }).mouseout(function(event) {
                    $(this).css('color', 'rgba(85,85,85,1)');
                });
            }
            var content = $('<div>',{
                class:'tab-pane active',
                id : panelId,
                role: "tabpanel"
            });
            this.$list.append(title);
            this.$panel.append(content);
            
            var contentDiv = options.content;
            if(typeof(contentDiv) == 'string'){
                content.html(contentDiv);
            } else if(typeof(contentDiv) == 'function'){
                contentDiv = contentDiv(content);
            } else {
                $(options.content).appendTo(content);
            }
            
            return this;
        },

        remove: function  (id) {
            var tabId = getTabId(id), tab = this.find('li#'+tabId);
            if(tab.length > 0){
                var next;
                if(tab.hasClass('active')){
                    next = tab.prev();
                    if(next.length<=0) next = tab.next();
                }
                var panelId = getPanelId(id), panel = this.find('div#'+panelId);
                tab.remove();
                panel.remove();
                if(next){
                    // next.addClass('active');
                    next.children('a').first().tab('show');
                }
            }
        },   
        show: function(id){
            var panelId = getPanelId(id);
            this.find('a[href="#'+panelId+'"]').tab('show');
        },
        isContained: function(id){
            var tabId = getTabId(id);
            return this.find('li#'+tabId).length > 0;
        },

        _removeById : function  (id) {
            var id2 = '#' + id;
            var list = this.find('li').filter(function(){
               return this.id == id2;
            });
            if(list.length){
              if (this.find("li.active").attr('id') == id2) {
                  var prev = $("#" + id).prev();
                  if(prev.length){
                    prev.addClass('active');
                  }
                  $("#" + id).next().addClass('active');
              }
              this.find('li').filter(function(){
                 return this.id == id2;
              }).remove();
              this.find('div').filter(function(){
                 return this.id == id;
              }).remove();
            }
            return this;
        },

        getSelectIndex : function(){

        },

        val : function(){

        },
    };
    $.fn.bootstrapTab = function() {
        var method = arguments[0];
        if(methods[method]) {
            method = methods[method];
            arguments = Array.prototype.slice.call(arguments, 1);
        } else if( typeof(method) == 'object' || !method ) {
            method = methods.init;
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.bootstrapTab' );
            return this;
        }
        return method.apply(this, arguments);
    };
})(jQuery);

