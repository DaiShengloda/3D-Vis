
$.widget("hud.tempFilterPanel", {
    // default options
    options: {
        items: [],
    },
    _create: function () {
        var self = this;
        var el = this.element;
        var $panel = $('<div class="tempFilter"></div>').appendTo(el);
        this.$panel = $panel;
        $.each(this.options.items, function(index, val) {
             self._createItem(val,$panel);
        });
        var lastItem = undefined;
        this._on($panel, {
            'click .tf_item': function (e) {
                e.stopPropagation();
                var $target = $(e.currentTarget);
                $target.children().first().toggleClass('tf_checked');
                self._trigger("click", event, {
                    id: $target.attr('id'),
                    show: $target.children().first().hasClass('tf_checked')
                })
            },
            'mouseover .tf_item': function (e) {
                if(lastItem){
                    lastItem.removeClass('tf_over')
                }
                var $target = $(e.currentTarget);
                $target.addClass('tf_over');
                lastItem = $target;
            },
            'mouseleave .tf_item': function (e) {
                lastItem && lastItem.removeClass('tf_over');
            }
        })
    },
    _createItem: function(id,parent){
        var $item = $('<div>').addClass('tf_item').attr('id',id).appendTo(parent);
        $('<span>').addClass('tf_box tf_checked').appendTo($item);
        $('<span>').text(id).appendTo($item);
    },
    _setOption: function (key, value) {
        this._super(key, value);
        if (key === "items") {
            this.refresh();
        }
    },
    refresh: function () {
        
    },
    _destroy: function () {
        this.$panel.remove();
    }
})